import { classifyUrlType, expectedPageSchema, pathDepth } from './page-type.mjs';

function normalizeComparableUrl(value, base) {
  try {
    const url = new URL(value, base);
    url.hash = '';
    if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) url.port = '';
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch { return null; }
}

export function generateFindings(facts) {
  const findings = [];
  const push = (f) => findings.push({ findingType:'issue', ...f });
  const opportunity = (f) => findings.push({ findingType:'opportunity', ...f });
  const accessInterference = facts.access?.likelyInterference === true;
  const rawPageUsable = facts.access?.pageContentUsable ?? (facts.responseStatus >= 200 && facts.responseStatus < 400);
  const pageAnalysis = facts.contentAnalysis?.html || (rawPageUsable ? facts.raw : null);
  const pageContentUsable = Boolean(pageAnalysis);
  const analysisSource = facts.contentAnalysis?.source || (rawPageUsable ? 'initial-html' : null);

  if (facts.responseStatus >= 400) {
    if (accessInterference) {
      const signals = facts.access?.signals || [];
      push({
        id:'automated-access-block',
        title:`Automated audit request was blocked (HTTP ${facts.responseStatus})`,
        category:'crawlability',
        severity:'medium',
        confidence:'manual-review',
        score:78,
        whyItMatters:'The CDN, WAF, or bot-protection layer appears to be treating scripted requests differently from normal browser visits. This is not proof that Google or AI crawlers are blocked, but it is worth reviewing because edge security can unintentionally restrict legitimate crawlers.',
        recommendation:'Review CDN/WAF bot controls and crawler allow/block rules. Verify important search and AI crawlers separately before presenting this as an indexing problem.',
        videoTalkingPoint:`The site is blocking this automated audit request with HTTP ${facts.responseStatus}. I would not call that a ranking problem by itself, but I would review the CDN or bot-protection policy to make sure legitimate search and AI crawlers are not getting caught by it.`,
        evidence:[
          {label:'Audit fetch status', value:String(facts.responseStatus)},
          ...signals.slice(0,3).map((value, index) => ({label:`Access signal ${index + 1}`, value}))
        ]
      });
    } else {
      const severity = facts.responseStatus >= 500 ? 'critical' : 'high';
      push({ id:'http-status', title:`Page returns HTTP ${facts.responseStatus}`, category:'crawlability', severity, confidence:'confirmed', score: severity === 'critical' ? 100 : 93,
        whyItMatters:'Search engines and AI retrieval systems cannot reliably use a page that does not return a successful document response.',
        recommendation:'Confirm the intended URL and fix the server, routing, or redirect behavior before evaluating lower-priority page signals.',
        videoTalkingPoint:`The first issue I would address is that this URL is returning HTTP ${facts.responseStatus}, so crawlers are not getting a normal successful page response.`,
        evidence:[{label:'HTTP status', value:String(facts.responseStatus)}] });
    }
  }

  if (pageContentUsable) {
    const xRobots = rawPageUsable ? (facts.responseHeaders['x-robots-tag'] || '').toLowerCase() : '';
    const metaNoindex = pageAnalysis.metaRobots.includes('noindex') || pageAnalysis.metaRobots.includes('none');
    const headerNoindex = /(?:^|[,;\s])noindex(?:$|[,;\s])/i.test(xRobots) || /(?:^|[,;\s])none(?:$|[,;\s])/i.test(xRobots);
    if (metaNoindex || headerNoindex) {
      push({ id:'noindex', title:'Page is explicitly marked noindex', category:'indexing', severity:'critical', confidence:'confirmed', score:100,
        whyItMatters:'A noindex directive asks compliant search engines not to keep this page in their searchable index.',
        recommendation:'Confirm whether exclusion is intentional. If the page should appear in search, remove the noindex directive from both HTML and HTTP headers.',
        videoTalkingPoint:'This page is explicitly telling search engines not to index it, so I would verify that this is intentional before doing anything else.',
        evidence:[{label:'Meta robots', value:pageAnalysis.metaRobots.join(', ') || 'not present'},{label:'X-Robots-Tag', value:xRobots || 'not present'}] });
    }
  }

  if (facts.robots.agents.Googlebot === false) {
    push({ id:'robots-googlebot-block', title:'robots.txt blocks Googlebot from this URL', category:'crawlability', severity:'critical', confidence:'confirmed', score:100,
      whyItMatters:'Googlebot cannot crawl the page when robots.txt disallows the URL, which can prevent Google from seeing current page content and directives.',
      recommendation:'Review the matching robots.txt rule and allow Googlebot if this page is intended to be publicly discoverable.',
      videoTalkingPoint:'Googlebot is being blocked from crawling this URL in robots.txt, which is a major visibility issue if the page is supposed to rank.',
      evidence:[{label:'Googlebot access', value:'Blocked'},{label:'robots.txt', value:facts.robots.url}] });
  }

  if (facts.robots.agents['OAI-SearchBot'] === false) {
    push({ id:'robots-oai-search-block', title:'OAI-SearchBot is blocked from this URL', category:'ai-access', severity:'high', confidence:'confirmed', score:94,
      whyItMatters:"The site is explicitly restricting OpenAI's search crawler from accessing this URL, which can limit direct discovery of the page by that crawler.",
      recommendation:"Confirm the site's AI-search policy. If ChatGPT search discovery is desired, review the matching robots.txt rule.",
      videoTalkingPoint:'One AI visibility item worth reviewing is that OAI-SearchBot is explicitly blocked from this URL in robots.txt.',
      evidence:[{label:'OAI-SearchBot access', value:'Blocked'},{label:'robots.txt', value:facts.robots.url}] });
  }

  const otherBlocked = ['ClaudeBot','PerplexityBot'].filter((a) => facts.robots.agents[a] === false);
  if (otherBlocked.length) {
    opportunity({ id:'robots-ai-crawlers-block', title:`${otherBlocked.join(' and ')} ${otherBlocked.length === 1 ? 'is' : 'are'} blocked`, category:'ai-access', severity:'medium', confidence:'confirmed', score:64,
      whyItMatters:"The site's robots policy restricts one or more AI-oriented crawlers. Whether that is a problem depends on the client's distribution and content-use goals.",
      recommendation:'Review the crawler policy intentionally rather than assuming every AI crawler should be allowed or blocked.',
      videoTalkingPoint:`The robots policy is restricting ${otherBlocked.join(' and ')}, so I would review whether that lines up with the client's AI visibility goals.`,
      evidence:otherBlocked.map((a) => ({label:`${a} access`, value:'Blocked'})) });
  }

  if (pageContentUsable) {
    const finalComparable = normalizeComparableUrl(facts.finalUrl);
    const canonicalComparable = pageAnalysis.canonical ? normalizeComparableUrl(pageAnalysis.canonical, facts.finalUrl) : null;
    if (pageAnalysis.canonical && finalComparable && canonicalComparable && finalComparable !== canonicalComparable) {
      const crossHost = new URL(finalComparable).hostname !== new URL(canonicalComparable).hostname;
      push({ id:'canonical-mismatch', title:crossHost ? 'Canonical points to a different hostname' : 'Canonical points to another URL', category:'indexing', severity:crossHost ? 'critical' : 'high', confidence:'confirmed', score:crossHost ? 98 : 92,
        whyItMatters:'The page is declaring another URL as its preferred canonical version, which can consolidate indexing and ranking signals away from the URL being audited.',
        recommendation:'Confirm the canonical is intentional and that the preferred URL is indexable, equivalent, and the correct destination for consolidation.',
        videoTalkingPoint:'This URL is telling search engines that another page is the preferred version, so I would verify whether that consolidation is intentional.',
        evidence:[{label:'Audited URL', value:facts.finalUrl},{label:'Canonical', value:canonicalComparable}] });
    }

    if (!pageAnalysis.title) {
      push({ id:'missing-title', title:'HTML title is missing', category:'content-structure', severity:'high', confidence:'confirmed', score:88,
        whyItMatters:'The title element is a strong page-level signal and is commonly used when pages are presented in search results and other discovery surfaces.',
        recommendation:'Add a concise, page-specific title that accurately describes the primary topic and intent.',
        videoTalkingPoint:'This page is missing a basic title element, which is one of the clearest page-level search signals to fix.',
        evidence:[{label:'Title', value:'Missing'}] });
    }

    if (pageAnalysis.h1s.length === 0) {
      push({ id:'missing-h1', title:analysisSource === 'rendered-fallback' ? 'No H1 found in the rendered page' : 'No H1 found in the initial HTML', category:'content-structure', severity:'medium', confidence:'confirmed', score:60,
        whyItMatters:"A clear primary heading helps users and machines understand the page's main subject, even though an H1 is not a standalone ranking requirement.",
        recommendation:'Give the page one clear primary heading that describes its main purpose.',
        videoTalkingPoint:analysisSource === 'rendered-fallback' ? 'Even after rendering, the page does not contain a clear H1, so I would tighten the primary semantic heading structure.' : 'The initial HTML does not contain a clear H1, so I would tighten the page\'s primary semantic heading structure.',
        evidence:[{label:'H1 count', value:'0'}] });
    }

    if (pageAnalysis.invalidJsonLdBlocks > 0) {
      push({ id:'invalid-jsonld', title:'One or more JSON-LD blocks cannot be parsed', category:'structured-data', severity:'medium', confidence:'confirmed', score:63,
        whyItMatters:'Malformed JSON-LD can prevent machines from using the structured data contained in that block.',
        recommendation:'Validate the JSON-LD syntax and correct the malformed block before evaluating whether additional schema is useful.',
        videoTalkingPoint:'There is structured data on the page, but at least one JSON-LD block is malformed and may not be usable as intended.',
        evidence:[{label:'Invalid JSON-LD blocks', value:String(pageAnalysis.invalidJsonLdBlocks)}] });
    }
  }

  if (facts.redirectChain.length >= 2) {
    push({ id:'redirect-chain', title:`URL passes through ${facts.redirectChain.length} redirects`, category:'crawlability', severity:facts.redirectChain.length >= 4 ? 'high' : 'medium', confidence:'confirmed', score:facts.redirectChain.length >= 4 ? 80 : 58,
      whyItMatters:'Long redirect chains add latency and unnecessary crawl steps and can make migrations or canonicalization harder to reason about.',
      recommendation:'Where practical, point links and redirects directly to the final canonical destination.',
      videoTalkingPoint:`This URL takes ${facts.redirectChain.length} redirect hops before reaching the final page, which is unnecessary technical friction worth cleaning up.`,
      evidence:facts.redirectChain.map((h,i) => ({label:`Hop ${i+1}`, value:`${h.status} ${h.url}`})) });
  }

  if (rawPageUsable && facts.rendered.succeeded && facts.rendered.html) {
    const rawWords = facts.raw.primaryWordCount;
    const renderedWords = facts.rendered.html.primaryWordCount;
    const rawSource = facts.raw.primarySource;
    const renderedSource = facts.rendered.html.primarySource;
    const regionConfidence = rawSource === 'body-minus-boilerplate' || renderedSource === 'body-minus-boilerplate' ? 'manual-review' : 'likely';

    if (renderedWords >= 250 && renderedWords > rawWords + 150) {
      const share = renderedWords ? rawWords / renderedWords : 1;
      if (share < .7) {
        const missing = Math.round((1-share)*100);
        const severity = share < .35 ? 'high' : 'medium';
        push({ id:'js-content-dependency', title:`${missing}% of primary page copy appears only after rendering`, category:'rendering', severity, confidence:regionConfidence, score:severity === 'high' ? 90 : 68,
          whyItMatters:'The scanner found a large difference inside the page\'s primary content region after JavaScript execution. This is more meaningful than comparing the entire DOM because navigation, footers, cookie layers, and common boilerplate are excluded where possible.',
          recommendation:'Review the affected primary content and confirm that critical headings, service/article copy, and contextual links are present in server-delivered HTML where practical.',
          videoTalkingPoint:`The main content area changes substantially after JavaScript runs. Roughly ${missing}% of the primary page copy appears only after rendering, which I would investigate before assuming every crawler receives the same content.`,
          evidence:[{label:'Initial primary words', value:rawWords.toLocaleString()},{label:'Rendered primary words', value:renderedWords.toLocaleString()},{label:'Initial share', value:`${Math.round(share*100)}%`},{label:'Region detection', value:`${rawSource} -> ${renderedSource}`}] });
      }
    }

    const rawHrefs = new Set(facts.raw.primaryInternalHrefs || []);
    const renderedHrefs = new Set(facts.rendered.html.primaryInternalHrefs || []);
    const addedHrefs = [...renderedHrefs].filter((href) => !rawHrefs.has(href));
    const rawLinks = rawHrefs.size;
    const renderedLinks = renderedHrefs.size;
    if (addedHrefs.length >= 5 && renderedLinks >= Math.max(8, rawLinks * 1.5)) {
      push({ id:'js-link-dependency', title:`${addedHrefs.length} contextual internal links appear only after rendering`, category:'rendering', severity:'medium', confidence:regionConfidence, score:65,
        whyItMatters:'These links were detected inside the primary content region rather than the global navigation or footer, so they are more likely to affect contextual discovery and page relationships.',
        recommendation:'Confirm that important contextual links are real crawlable anchors in server-delivered HTML where practical, especially links to high-value service, category, or supporting pages.',
        videoTalkingPoint:`I would look at contextual discovery here: ${addedHrefs.length} internal links inside the primary content area only appear after JavaScript renders the page.`,
        evidence:[{label:'Initial contextual links', value:String(rawLinks)},{label:'Rendered contextual links', value:String(renderedLinks)},...addedHrefs.slice(0,3).map((href,i)=>({label:`Rendered-only link ${i+1}`,value:href}))] });
    }
  }

  if (pageContentUsable && !pageAnalysis.canonical) {
    opportunity({ id:'missing-canonical', title:'No canonical link element found', category:'indexing', severity:'low', confidence:'confirmed', score:31,
      whyItMatters:'A self-referencing canonical is not mandatory on every page, but explicit canonicalization can make preferred URL signals clearer on sites with multiple URL variants.',
      recommendation:'Review whether the site consistently declares canonical URLs, especially where parameters, alternate paths, or duplicate variants are possible.',
      videoTalkingPoint:'This page does not declare a canonical URL, which is not automatically a problem but is worth reviewing if the site produces duplicate URL variants.',
      evidence:[{label:'Canonical', value:'Not present'}] });
  }


  if (pageContentUsable) {
    const pageType = classifyUrlType(facts.finalUrl, '', pageAnalysis.structuredDataTypes || pageAnalysis.jsonLdTypes || []);
    const structuredTypes = new Set((pageAnalysis.structuredDataTypes || pageAnalysis.jsonLdTypes || []).map((x) => String(x).toLowerCase()));
    const expectedSchema = expectedPageSchema(pageType);

    if (pageType !== 'home' && pageAnalysis.primaryWordCount >= 500 && pageAnalysis.primaryInternalLinks <= 1) {
      opportunity({
        id:'contextual-linking-opportunity', title:'Primary content has very little contextual internal linking', category:'internal-discovery', severity:'medium', confidence:'likely', score:62,
        whyItMatters:'The main content is substantial but contains one or fewer internal links. Natural contextual links can make relationships between services, supporting resources, locations, and next-step pages easier for visitors and crawlers to follow.',
        recommendation:'Review the main copy for genuinely useful places to connect closely related pages. Avoid adding links only to satisfy a count.',
        videoTalkingPoint:`This page has ${pageAnalysis.primaryWordCount.toLocaleString()} words in its main content but only ${pageAnalysis.primaryInternalLinks} contextual internal link${pageAnalysis.primaryInternalLinks === 1 ? '' : 's'}. I would look for a few natural connections to related high-value pages.`,
        evidence:[{label:'Primary words', value:pageAnalysis.primaryWordCount.toLocaleString()},{label:'Contextual internal links', value:String(pageAnalysis.primaryInternalLinks)}]
      });
    }

    if ((pageAnalysis.primaryInternalLinks || 0) >= 4 && (pageAnalysis.primaryInternalGenericAnchorCount || 0) >= 2 && (pageAnalysis.primaryInternalGenericAnchorRatio || 0) >= .25) {
      const ratio = Math.round((pageAnalysis.primaryInternalGenericAnchorRatio || 0) * 100);
      opportunity({
        id:'generic-anchor-opportunity', title:'Several contextual internal links use generic anchor text', category:'internal-discovery', severity:'medium', confidence:'likely', score:56,
        whyItMatters:'Generic anchors such as “read more” or “learn more” communicate less about the destination than descriptive link text. This is a clarity and internal-link context opportunity, not a penalty.',
        recommendation:'Review repeated generic anchors and make the clickable text more descriptive where that helps users understand the destination. Avoid forcing exact-match keywords.',
        videoTalkingPoint:`About ${ratio}% of the contextual internal links on this page use generic labels such as “read more” or “learn more.” I would tighten those where a more descriptive anchor can explain what the linked page is actually about.`,
        evidence:[
          {label:'Contextual internal links', value:String(pageAnalysis.primaryInternalLinks || 0)},
          {label:'Generic anchors', value:String(pageAnalysis.primaryInternalGenericAnchorCount || 0)},
          ...(pageAnalysis.primaryInternalGenericAnchorExamples || []).slice(0,3).map((item, index) => ({label:`Example ${index + 1}`, value:`${item.anchor || '(empty)'} -> ${item.href}`}))
        ]
      });
    }

    if ((pageAnalysis.primaryHeadingLevelJumps || 0) >= 2 && (pageAnalysis.primarySubheadingCount || 0) >= 4) {
      opportunity({
        id:'heading-hierarchy-opportunity', title:'Primary content contains repeated heading-level jumps', category:'content-structure', severity:'low', confidence:'manual-review', score:46,
        whyItMatters:'Skipping heading levels is not a ranking penalty, but repeated hierarchy jumps can make the document outline less predictable for assistive technologies and machine extraction.',
        recommendation:'Review the semantic heading order and use heading levels to reflect actual parent-child sections rather than visual styling alone.',
        videoTalkingPoint:`The page has ${pageAnalysis.primaryHeadingLevelJumps} heading-level jumps in its main content. That is not a ranking problem by itself, but I would clean up the semantic hierarchy so the page structure is easier to interpret.`,
        evidence:[{label:'Heading-level jumps', value:String(pageAnalysis.primaryHeadingLevelJumps)},{label:'Primary subheadings', value:String(pageAnalysis.primarySubheadingCount || 0)}]
      });
    }

    if (pathDepth(facts.finalUrl) >= 2 && !structuredTypes.has('breadcrumblist') && !pageAnalysis.hasVisibleBreadcrumbs) {
      opportunity({
        id:'breadcrumb-structure-opportunity', title:'Breadcrumb signals are limited on this deeper URL', category:'structured-data', severity:'medium', confidence:'manual-review', score:53,
        whyItMatters:'Breadcrumbs can make hierarchy and parent-child relationships more explicit for users and machines. Their absence is not a ranking failure, and a visual breadcrumb may still exist without recognized structured markup.',
        recommendation:'Review whether this page would benefit from useful visible breadcrumbs and valid BreadcrumbList structured data.',
        videoTalkingPoint:'This is a deeper page in the site architecture, but I did not detect a visible breadcrumb pattern or recognized BreadcrumbList markup. That is not a penalty, but it is a useful site-structure opportunity to review.',
        evidence:[{label:'URL depth', value:String(pathDepth(facts.finalUrl))},{label:'Detected structured types', value:(pageAnalysis.structuredDataTypes || pageAnalysis.jsonLdTypes || []).join(', ') || 'None'}]
      });
    }

    if (expectedSchema.length && !expectedSchema.some((type) => structuredTypes.has(type.toLowerCase()))) {
      opportunity({
        id:'page-specific-schema-opportunity', title:`Page-specific ${pageType} structured data was not detected`, category:'structured-data', severity:'medium', confidence:'manual-review', score:55,
        whyItMatters:`This URL appears to be a ${pageType} page, but the HTML does not expose a corresponding page-specific schema type. Structured data is not a direct ranking shortcut, but accurate machine-readable context can help make page purpose and entities more explicit.`,
        recommendation:`Review whether accurate ${expectedSchema.join(' or ')} markup is appropriate for what the page actually represents. Do not add schema solely to chase an audit score.`,
        videoTalkingPoint:`This looks like a ${pageType} page, but I am only seeing ${structuredTypes.size ? 'other/generic' : 'no'} recognized structured data rather than a page-specific ${expectedSchema.join(' or ')} type. I would review whether the template can describe the page more explicitly for machines.`,
        evidence:[{label:'Detected page type', value:pageType},{label:'Expected type', value:expectedSchema.join(' / ')},{label:'Detected structured types', value:[...structuredTypes].join(', ') || 'None'}]
      });
    }

    if (pageType !== 'home' && pageAnalysis.primaryWordCount >= 1000 && (pageAnalysis.primarySubheadingCount || 0) <= 1) {
      opportunity({
        id:'section-structure-opportunity', title:'Long primary content has very little subheading structure', category:'content-structure', severity:'medium', confidence:'manual-review', score:50,
        whyItMatters:'Long pages with little semantic sectioning can be harder to scan and can make distinct subtopics or answer passages less explicit. This is a content-organization opportunity, not evidence of a ranking problem.',
        recommendation:'Review whether the page can be organized into clearer, useful sections with descriptive headings that reflect real subtopics and user questions.',
        videoTalkingPoint:`The main content is about ${pageAnalysis.primaryWordCount.toLocaleString()} words but has only ${pageAnalysis.primarySubheadingCount || 0} subheading${(pageAnalysis.primarySubheadingCount || 0) === 1 ? '' : 's'}. I would look at whether clearer sections could make the page easier to scan and interpret.`,
        evidence:[{label:'Primary words', value:pageAnalysis.primaryWordCount.toLocaleString()},{label:'Primary subheadings', value:String(pageAnalysis.primarySubheadingCount || 0)}]
      });
    }


    if (pageType === 'article' && !pageAnalysis.hasAuthorSignal) {
      opportunity({
        id:'article-authorship-opportunity', title:'Article authorship signals are limited in the HTML', category:'entity-clarity', severity:'medium', confidence:'manual-review', score:57,
        whyItMatters:'Clear authorship can help readers and machines understand who is responsible for editorial content and connect the article to a real person or organization. This is an entity and trust-context opportunity, not a standalone ranking factor.',
        recommendation:'Review whether the article clearly identifies its author in visible content and, where accurate, in structured data or metadata tied to a real author profile.',
        videoTalkingPoint:'I would review the authorship layer on this article. I am not seeing a strong author signal in the HTML, so there may be an opportunity to make who created the content and their relationship to the site more explicit.',
        evidence:[{label:'Detected page type', value:'article'},{label:'Author signal', value:'Not detected'}]
      });
    }

    if (pageType === 'article' && pageAnalysis.primaryWordCount >= 400 && !pageAnalysis.structuredDataHasDatePublished && !pageAnalysis.structuredDataHasDateModified) {
      opportunity({
        id:'article-date-opportunity', title:'Article structured data does not expose publication or update dates', category:'entity-clarity', severity:'low', confidence:'manual-review', score:48,
        whyItMatters:'Accurate publication and modification dates can make editorial recency clearer to users and machines. Their absence is not a ranking failure, and visible dates may still be present elsewhere on the page.',
        recommendation:'Verify whether accurate visible dates exist and whether the article template should expose datePublished/dateModified in structured data.',
        videoTalkingPoint:'I would also review the recency signals on this article. I am not detecting structured publication or modification dates, so there may be an opportunity to make when the content was published or updated more explicit.',
        evidence:[{label:'datePublished', value:'Not detected in structured data'},{label:'dateModified', value:'Not detected in structured data'}]
      });
    }

    if (['service','location','product'].includes(pageType) && pageAnalysis.primaryWordCount > 0 && pageAnalysis.primaryWordCount < 260) {
      opportunity({
        id:'limited-primary-content-opportunity', title:`This ${pageType} page exposes relatively little primary copy`, category:'content-depth', severity:'low', confidence:'manual-review', score:47,
        whyItMatters:'Word count is not a ranking requirement, but a very small amount of substantive page copy can be a useful prompt to verify whether the page clearly answers the core questions, differentiators, entities, and next steps a visitor would expect.',
        recommendation:'Review the page against its actual search intent and user needs. Expand only where additional information would make the page more useful, specific, or easier to understand.',
        videoTalkingPoint:`This ${pageType} page has about ${pageAnalysis.primaryWordCount.toLocaleString()} words in the primary content area. I would not call that thin content by itself, but I would check whether the page fully answers the important questions someone would have before taking the next step.`,
        evidence:[{label:'Primary words', value:pageAnalysis.primaryWordCount.toLocaleString()},{label:'Detected page type', value:pageType}]
      });
    }

    if (pageType !== 'home' && pageAnalysis.primaryWordCount >= 850 && (pageAnalysis.primaryLongestParagraphWords || 0) >= 180 && (pageAnalysis.primarySubheadingCount || 0) <= 3) {
      opportunity({
        id:'dense-passage-structure-opportunity', title:'Some primary content is organized into unusually dense passages', category:'retrieval-clarity', severity:'medium', confidence:'manual-review', score:54,
        whyItMatters:'Dense passages with few sectional cues can be harder for people to scan and can make individual subtopics less explicit for retrieval systems. The issue is organization and clarity, not a required paragraph length.',
        recommendation:'Review the longest sections for natural breakpoints, descriptive headings, lists, or concise answer-first passages. Do not fragment content simply to satisfy the scanner.',
        videoTalkingPoint:`There is a fairly dense content block here, with the longest paragraph around ${pageAnalysis.primaryLongestParagraphWords} words. I would look for places where important answers or subtopics could be made more explicit and easier to retrieve.`,
        evidence:[{label:'Longest primary paragraph', value:`${pageAnalysis.primaryLongestParagraphWords} words`},{label:'Primary subheadings', value:String(pageAnalysis.primarySubheadingCount || 0)},{label:'Primary words', value:pageAnalysis.primaryWordCount.toLocaleString()}]
      });
    }
  }

  return findings.sort((a,b) => b.score - a.score);
}
