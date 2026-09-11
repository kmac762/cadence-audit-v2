import { selectDiverseFindings, priorityCandidatePool, themeForFinding } from './priority.mjs';

export { selectDiverseFindings };

// Retained for legacy regression tests only. V2 never calls an AI provider.
const DEFAULT_MODEL = ''; 

function findingKey(finding) {
  return `${finding.scope || 'page'}:${finding.id}`;
}

function typeLabel(finding) {
  return finding.findingType === 'opportunity' ? 'visibility opportunity' : 'technical issue';
}

function pacingFor(count) {
  if (count >= 5) return { target:'4-5 minutes', openingSeconds:25, pointSeconds:42, closingSeconds:25 };
  if (count === 4) return { target:'3.5-4.5 minutes', openingSeconds:25, pointSeconds:48, closingSeconds:25 };
  if (count === 3) return { target:'3-4 minutes', openingSeconds:25, pointSeconds:55, closingSeconds:25 };
  if (count === 2) return { target:'2-3 minutes', openingSeconds:20, pointSeconds:60, closingSeconds:20 };
  if (count === 1) return { target:'1.5-2 minutes', openingSeconds:20, pointSeconds:65, closingSeconds:20 };
  return { target:'Under 90 seconds', openingSeconds:15, pointSeconds:0, closingSeconds:15 };
}

function deterministicPlan(facts, points) {
  const pacing = pacingFor(points.length);
  const hostname = (() => { try { return new URL(facts.finalUrl).hostname.replace(/^www\./,''); } catch { return 'the site'; } })();
  return {
    targetLength:pacing.target,
    opening:`I took a quick look at ${hostname} through both a traditional search and AI visibility lens. Rather than run through a giant checklist, I want to show you the few areas that stood out as most worth investigating.`,
    sections:points.map((point, index) => ({
      findingKey:point.findingKey,
      label:`Point ${index + 1}`,
      estimatedSeconds:pacing.pointSeconds,
      transition:index === 0 ? 'Start with the strongest verified signal.' : 'Then connect this to the next distinct visibility or technical opportunity.'
    })),
    closing:'Those are the areas I would investigate first. None of these automatically means something is broken, but they are the clearest opportunities to validate before deciding what to change.'
  };
}

function pointFromFinding(finding) {
  return {
    findingKey:findingKey(finding),
    headline:finding.title,
    sourceType:typeLabel(finding),
    scope:finding.scope || 'page',
    whyWorthDiscussing:finding.whyItMatters,
    verifyFirst:finding.recommendation || 'Verify the underlying evidence before presenting this finding.',
    videoTalkingPoint:finding.videoTalkingPoint,
    evidence:finding.evidence || [],
    verification:finding.verification || null
  };
}

export function buildDeterministicBrief(facts, findings) {
  const selected = selectDiverseFindings(findings, 5);
  const eligible = priorityCandidatePool(findings);
  const issueCount = eligible.filter((finding) => finding.findingType !== 'opportunity').length;
  const opportunityCount = eligible.filter((finding) => finding.findingType === 'opportunity').length;
  let summary;
  if (!selected.length) summary = 'No defensible high-impact issue or visibility opportunity cleared the current evidence threshold.';
  else if (issueCount && opportunityCount) summary = `${issueCount} technical issue${issueCount === 1 ? '' : 's'} and ${opportunityCount} visibility opportunit${opportunityCount === 1 ? 'y' : 'ies'} cleared the review threshold. The brief below prioritizes the most useful talking points.`;
  else if (issueCount) summary = `${issueCount} technical issue${issueCount === 1 ? '' : 's'} cleared the review threshold. The brief below prioritizes the strongest evidence first.`;
  else summary = `${opportunityCount} visibility opportunit${opportunityCount === 1 ? 'y' : 'ies'} cleared the review threshold. These are not necessarily problems; they are the strongest areas to investigate before recording.`;

  const talkingPoints = selected.map(pointFromFinding);
  return {
    mode:'rule-ranked',
    model:null,
    aiConfigured:Boolean(process.env.OPENAI_API_KEY),
    summary,
    talkingPoints,
    recordingPlan:deterministicPlan(facts, talkingPoints)
  };
}

function responseText(payload) {
  for (const item of payload?.output || []) {
    if (item?.type !== 'message') continue;
    for (const part of item.content || []) {
      if (part?.type === 'output_text' && typeof part.text === 'string') return part.text;
    }
  }
  if (typeof payload?.output_text === 'string') return payload.output_text;
  return null;
}

function briefSchema() {
  return {
    type:'object',
    additionalProperties:false,
    properties:{
      summary:{ type:'string' },
      opening:{ type:'string' },
      closing:{ type:'string' },
      talkingPoints:{
        type:'array',
        minItems:1,
        maxItems:5,
        items:{
          type:'object',
          additionalProperties:false,
          properties:{
            findingKey:{ type:'string' },
            headline:{ type:'string' },
            whyWorthDiscussing:{ type:'string' },
            verifyFirst:{ type:'string' },
            videoTalkingPoint:{ type:'string' },
            transition:{ type:'string' },
            estimatedSeconds:{ type:'integer', minimum:30, maximum:90 }
          },
          required:['findingKey','headline','whyWorthDiscussing','verifyFirst','videoTalkingPoint','transition','estimatedSeconds']
        }
      }
    },
    required:['summary','opening','closing','talkingPoints']
  };
}

function aiInput(facts, candidates) {
  const graph = facts?.siteSnapshot?.relationshipGraph;
  return {
    auditedUrl:facts.finalUrl,
    pageType:facts.pageType,
    scanWarnings:facts.scanWarnings || [],
    siteContext:graph?.enabled ? {
      pagesInRelationshipCrawl:graph.usablePageCount,
      articles:graph.articleCount,
      commercialPages:graph.commercialCount
    } : null,
    candidates:candidates.map((finding) => ({
      findingKey:findingKey(finding),
      findingType:typeLabel(finding),
      scope:finding.scope || 'page',
      title:finding.title,
      category:finding.category,
      priorityTheme:themeForFinding(finding),
      sourceFindingKeys:finding.sourceFindingKeys || [],
      severity:finding.severity,
      confidence:finding.confidence,
      score:finding.score,
      evidence:finding.evidence || [],
      whyItMatters:finding.whyItMatters,
      recommendation:finding.recommendation,
      verification:finding.verification || null,
      existingTalkingPoint:finding.videoTalkingPoint
    }))
  };
}

export async function buildAuditBrief(facts, findings, options = {}) {
  const fallback = buildDeterministicBrief(facts, findings);
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  const model = options.model || process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const fetchImpl = options.fetchImpl || fetch;
  const useAi = options.useAi !== false;
  const candidates = priorityCandidatePool(findings).slice(0, 12);

  if (!useAi || !apiKey || !model || !candidates.length) return fallback;

  const allowed = new Map(candidates.map((finding) => [findingKey(finding), finding]));
  const developer = [
    'You are building a concise 3-to-5 minute internal video-audit plan from deterministic Search + AI visibility scanner findings.',
    'You may ONLY select from the supplied candidate findingKey values. Never create a new technical finding, metric, cause, or factual claim.',
    'Prefer 3 to 5 talking points when that many genuinely useful candidates exist. It is acceptable to return fewer.',
    'Lead with confirmed high-impact technical issues, then prioritize systemic on-page patterns and distinct visibility opportunities. Do not waste time on minor housekeeping if stronger findings exist.',
    'Favor variety across technical, on-page, architecture, structured/entity, content-trust, and content themes. Avoid selecting two candidates that tell the same underlying story.',
    'When a composite finding is supplied, prefer it over its source findings because it intentionally merges overlapping evidence into one recorder-friendly talking point.',
    'Manual-review findings must remain framed as things to investigate, not proven ranking problems.',
    'The opening and closing must be generic framing based only on the supplied scan, not new claims about rankings, traffic, competitors, or business performance.',
    'Transitions should help the recorder move naturally between selected findings without adding facts.',
    'Keep the recorder conversational, concise, practical, and non-alarmist.'
  ].join(' ');

  try {
    const response = await fetchImpl('https://api.openai.com/v1/responses', {
      method:'POST',
      headers:{
        'authorization':`Bearer ${apiKey}`,
        'content-type':'application/json'
      },
      body:JSON.stringify({
        model,
        input:[
          { role:'developer', content:[{ type:'input_text', text:developer }] },
          { role:'user', content:[{ type:'input_text', text:JSON.stringify(aiInput(facts, candidates)) }] }
        ],
        reasoning:{ effort:'low' },
        max_output_tokens:2200,
        text:{
          verbosity:'low',
          format:{ type:'json_schema', name:'cadence_audit_brief', strict:true, schema:briefSchema() }
        }
      }),
      signal:AbortSignal.timeout(25000)
    });

    if (!response.ok) throw new Error(`OpenAI API returned HTTP ${response.status}.`);
    const payload = await response.json();
    const text = responseText(payload);
    if (!text) throw new Error('OpenAI response did not contain output text.');
    const parsed = JSON.parse(text);
    const seen = new Set();
    const validated = [];
    const sections = [];

    for (const point of parsed.talkingPoints || []) {
      const source = allowed.get(point.findingKey);
      if (!source || seen.has(point.findingKey)) continue;
      seen.add(point.findingKey);
      validated.push({
        findingKey:point.findingKey,
        headline:String(point.headline || source.title).trim() || source.title,
        sourceType:typeLabel(source),
        scope:source.scope || 'page',
        whyWorthDiscussing:String(point.whyWorthDiscussing || source.whyItMatters).trim() || source.whyItMatters,
        verifyFirst:String(point.verifyFirst || source.recommendation).trim() || source.recommendation,
        videoTalkingPoint:String(point.videoTalkingPoint || source.videoTalkingPoint).trim() || source.videoTalkingPoint,
        evidence:source.evidence || [],
        verification:source.verification || null
      });
      sections.push({
        findingKey:point.findingKey,
        label:`Point ${sections.length + 1}`,
        estimatedSeconds:Math.max(30, Math.min(90, Number(point.estimatedSeconds) || 50)),
        transition:String(point.transition || '').trim()
      });
      if (validated.length >= 5) break;
    }

    if (!validated.length) throw new Error('AI brief did not select a valid scanner finding.');
    const pacing = pacingFor(validated.length);

    return {
      mode:'ai-prioritized',
      model,
      aiConfigured:true,
      summary:String(parsed.summary || fallback.summary).trim() || fallback.summary,
      talkingPoints:validated,
      recordingPlan:{
        targetLength:pacing.target,
        opening:String(parsed.opening || fallback.recordingPlan.opening).trim() || fallback.recordingPlan.opening,
        sections,
        closing:String(parsed.closing || fallback.recordingPlan.closing).trim() || fallback.recordingPlan.closing
      }
    };
  } catch (error) {
    return {
      ...fallback,
      aiConfigured:true,
      aiError:error instanceof Error ? error.message : 'AI prioritization failed.'
    };
  }
}
