function keyOf(finding) {
  return `${finding?.scope || 'page'}:${finding?.id || ''}`;
}

function evidenceValue(finding, label) {
  return (finding?.evidence || []).find((item) => String(item?.label || '').toLowerCase() === String(label || '').toLowerCase())?.value || '';
}

function compactUrls(finding, pattern, limit = 2) {
  return (finding?.evidence || [])
    .filter((item) => pattern.test(String(item?.label || '')) && item?.url)
    .slice(0, limit)
    .map((item, index) => ({ ...item, label:`Example ${index + 1}` }));
}

export function themeForFinding(finding) {
  const id = String(finding?.id || '');
  const category = String(finding?.category || '');

  if (id.startsWith('onpage-') || ['metadata','headings','images','document','social-metadata','international','links'].includes(category)) return 'on-page';
  if (['crawlability','indexing','rendering','ai-access'].includes(category)) return 'technical';
  if (['content-pathways','internal-discovery','discovery'].includes(category)) return 'architecture';
  if (['structured-data','entity-clarity'].includes(category)) return 'structured-entity';
  if (category === 'source-quality') return 'content-trust';
  if (['content-depth','content-differentiation','content-structure','retrieval-clarity'].includes(category)) {
    if (/title|h1|heading|meta/i.test(id)) return 'on-page';
    return 'content';
  }
  return 'other';
}

export function priorityWeight(finding) {
  const severity = { critical:42, high:30, medium:15, low:4 }[finding?.severity] || 0;
  const confidence = { confirmed:15, likely:9, 'manual-review':2 }[finding?.confidence] || 0;
  const type = finding?.findingType === 'issue' ? 9 : 0;
  const composite = finding?.priorityComposite ? 5 : 0;
  const systemicOnPage = String(finding?.id || '').startsWith('onpage-systemic-') ? 7 : 0;
  return Number(finding?.score || 0) + severity + confidence + type + composite + systemicOnPage;
}

const COMMERCIAL_NETWORK_SOURCE_IDS = new Set([
  'relationship-article-commercial-pathways',
  'relationship-commercial-inbound-support'
]);

const SYSTEMIC_QA_SOURCE_IDS = new Set([
  'site-missing-titles','missing-title','site-duplicate-titles',
  'site-missing-h1s','missing-h1','site-heading-hierarchy-opportunity','heading-hierarchy-opportunity',
  'onpage-site-missing-meta-pattern','onpage-site-duplicate-meta-pattern','onpage-site-multiple-h1-pattern'
]);

function makeCommercialNetworkComposite(findings) {
  const article = (findings || []).find((finding) => finding.id === 'relationship-article-commercial-pathways');
  const inbound = (findings || []).find((finding) => finding.id === 'relationship-commercial-inbound-support');
  if (!article || !inbound) return null;

  const articles = evidenceValue(article, 'Articles analyzed');
  const articlesLinking = evidenceValue(article, 'Articles linking to commercial pages');
  const commercial = evidenceValue(inbound, 'Commercial pages analyzed');
  const lowInbound = evidenceValue(inbound, 'With 0-1 contextual inbound links');
  const examples = [
    ...compactUrls(article, /^Review article/i, 2),
    ...compactUrls(inbound, /^Review page/i, 2)
  ].slice(0, 4);
  const score = Math.min(78, Math.max(Number(article.score || 0), Number(inbound.score || 0)) + 8);

  return {
    findingType:'opportunity',
    scope:'site',
    id:'relationship-commercial-content-network',
    category:'content-pathways',
    severity:'medium',
    confidence:'manual-review',
    score,
    priorityComposite:true,
    sourceFindingKeys:[keyOf(article), keyOf(inbound)],
    title:'Informational content and commercial pages are weakly connected in the sampled crawl',
    whyItMatters:'Two sides of the same internal-link pattern surfaced together: relatively few sampled articles connect readers into commercial content, while many sampled commercial pages receive little contextual support from the rest of the crawl. A sampled crawl cannot prove authority flow or orphaning, but the combined pattern is more useful than treating those observations as separate talking points.',
    recommendation:'Review the internal-link network as one system. Check whether relevant articles naturally point into services, locations, or products and whether important commercial pages receive contextual links from supporting editorial and adjacent commercial content. Confirm the pattern with a fuller crawl before making sitewide claims.',
    videoTalkingPoint:`The internal content network looks like one broader opportunity. ${articlesLinking || 'Relatively few'} of ${articles || 'the sampled'} articles link contextually toward commercial pages, while ${lowInbound || 'many'} of ${commercial || 'the sampled'} commercial pages receive one or fewer contextual inbound links. I would review both sides together rather than treat them as separate issues.`,
    evidence:[
      { label:'Articles -> commercial pages', value:`${articlesLinking || 'Limited'} of ${articles || 'sampled articles'}` },
      { label:'Commercial pages with <=1 contextual inbound', value:`${lowInbound || 'Many'} of ${commercial || 'sampled commercial pages'}` },
      ...examples
    ]
  };
}

export function addPriorityComposites(findings = []) {
  let output = [...findings];
  if (!output.some((finding) => finding.id === 'relationship-commercial-content-network')) {
    const composite = makeCommercialNetworkComposite(output);
    if (composite) {
      const mergedKey = keyOf(composite);
      output = output.map((finding) => COMMERCIAL_NETWORK_SOURCE_IDS.has(finding.id)
        ? { ...finding, prioritySuppressed:true, mergedInto:mergedKey }
        : finding);
      output.push(composite);
    }
  }
  return output;
}

function isEligible(finding) {
  const score = Number(finding?.score || 0);
  if (['critical','high'].includes(finding?.severity) && finding?.findingType === 'issue') return score >= 40;
  return score >= 48;
}

function overlapGroup(finding) {
  const id = String(finding?.id || '');
  if (id === 'relationship-commercial-content-network' || COMMERCIAL_NETWORK_SOURCE_IDS.has(id)) return 'commercial-content-network';
  if (['relationship-expanded-inbound-coverage','site-sample-crosslink-opportunity','site-contextual-linking-opportunity'].includes(id)) return 'general-contextual-inbound';
  if (['site-page-schema-opportunity','page-specific-schema-opportunity'].includes(id)) return 'page-specific-schema';
  if (['relationship-author-profile-connections','site-article-authorship-opportunity','article-authorship-opportunity'].includes(id)) return 'article-authorship';
  if (id.startsWith('onpage-systemic-')) return 'on-page-systemic';
  if (['site-heading-hierarchy-opportunity','heading-hierarchy-opportunity','onpage-site-multiple-h1-pattern'].includes(id)) return `heading-structure:${themeForFinding(finding)}`;
  if (['site-missing-titles','missing-title','onpage-site-duplicate-meta-pattern','onpage-site-missing-meta-pattern'].includes(id)) return `on-page-core:${themeForFinding(finding)}`;
  return keyOf(finding);
}

export function priorityCandidatePool(findings = []) {
  const expanded = addPriorityComposites(findings);
  const hasComposite = expanded.some((finding) => finding.id === 'relationship-commercial-content-network');
  const hasSystemicConfirmedQa = expanded.some((finding) => finding.id === 'onpage-systemic-confirmed-issues');
  const hasSystemicReviewQa = expanded.some((finding) => finding.id === 'onpage-systemic-review-pattern');
  return expanded
    .filter(isEligible)
    .filter((finding) => !(hasComposite && COMMERCIAL_NETWORK_SOURCE_IDS.has(finding.id)))
    .filter((finding) => !((hasSystemicConfirmedQa || hasSystemicReviewQa) && SYSTEMIC_QA_SOURCE_IDS.has(finding.id)))
    .sort((a,b) => priorityWeight(b) - priorityWeight(a));
}

export function selectDiverseFindings(findings = [], limit = 5) {
  const candidates = priorityCandidatePool(findings);
  if (!candidates.length || limit <= 0) return [];

  const selected = [];
  const usedKeys = new Set();
  const usedGroups = new Set();
  const themeCount = new Map();

  const add = (finding, { allowGroupRepeat = false } = {}) => {
    if (!finding || selected.length >= limit) return false;
    const key = keyOf(finding);
    const group = overlapGroup(finding);
    if (usedKeys.has(key) || (!allowGroupRepeat && usedGroups.has(group))) return false;
    usedKeys.add(key);
    usedGroups.add(group);
    selected.push(finding);
    const theme = themeForFinding(finding);
    themeCount.set(theme, (themeCount.get(theme) || 0) + 1);
    return true;
  };

  // 1. Serious direct issues deserve the front of the brief, but near-duplicates still collapse.
  for (const finding of candidates) {
    if (finding.findingType === 'issue' && ['critical','high'].includes(finding.severity)) add(finding);
    if (selected.length >= limit) return selected;
  }

  // 2. Choose the strongest remaining candidate from each distinct audit theme.
  for (const finding of candidates) {
    const theme = themeForFinding(finding);
    if ((themeCount.get(theme) || 0) === 0) add(finding);
    if (selected.length >= limit) return selected;
  }

  // 3. Add genuinely strong second points where they add a distinct concept inside a theme.
  for (const finding of candidates) {
    const theme = themeForFinding(finding);
    if ((themeCount.get(theme) || 0) >= 2) continue;
    if (Number(finding.score || 0) < 49 && finding.findingType !== 'issue') continue;
    add(finding);
    if (selected.length >= limit) return selected;
  }

  // 4. If strong candidates remain, use them; never invent a fifth point to fill space.
  for (const finding of candidates) {
    if (Number(finding.score || 0) < 55 && finding.findingType !== 'issue') continue;
    add(finding);
    if (selected.length >= limit) break;
  }

  return selected;
}
