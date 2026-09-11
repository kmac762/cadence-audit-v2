import { safeFetch } from './safe-fetch.mjs';

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch { return String(value || ''); }
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function pageLabel(page) {
  return page.pageType || 'page';
}

function dedupePages(pages = []) {
  const map = new Map();
  for (const page of pages) {
    if (!page?.usable) continue;
    const key = normalizeUrl(page.finalUrl || page.requestedUrl);
    if (!map.has(key)) map.set(key, page);
  }
  return [...map.values()];
}

function statusRank(status) {
  return status === 'issue' ? 3 : status === 'review' ? 2 : status === 'good' ? 1 : 0;
}

function check({ id, label, category, items = [], note = '', goodSummary = '', reviewSummary = '', issueSummary = '' }) {
  const issueCount = items.filter((item) => item.level === 'issue').length;
  const reviewCount = items.filter((item) => item.level === 'review').length;
  const status = issueCount ? 'issue' : reviewCount ? 'review' : 'good';
  const summary = status === 'issue'
    ? (issueSummary || `${issueCount} item${issueCount === 1 ? '' : 's'} need attention.`)
    : status === 'review'
      ? (reviewSummary || `${reviewCount} item${reviewCount === 1 ? '' : 's'} worth reviewing.`)
      : (goodSummary || 'No notable issue surfaced in the checked pages.');
  return { id, label, category, status, issueCount, reviewCount, summary, note, items };
}

function targetPageFromFacts(facts) {
  const raw = facts?.contentAnalysis?.html || facts?.raw || {};
  if (!facts?.contentAnalysis?.usable) return null;
  return {
    requestedUrl:facts.requestedUrl,
    finalUrl:facts.finalUrl,
    pageType:facts.pageType || 'other',
    status:facts.responseStatus,
    usable:true,
    title:raw.title,
    titleCount:raw.titleCount,
    titleLength:raw.titleLength,
    metaDescription:raw.metaDescription,
    metaDescriptionCount:raw.metaDescriptionCount,
    metaDescriptionLength:raw.metaDescriptionLength,
    titleMetaSame:raw.titleMetaSame,
    h1Count:raw.h1ElementCount ?? raw.h1s?.length ?? 0,
    h1Text:raw.h1s?.[0] || null,
    emptyH1Count:raw.emptyH1Count || 0,
    emptyHeadingCount:raw.emptyHeadingCount || 0,
    primaryHeadingLevelJumps:raw.primaryHeadingLevelJumps || 0,
    canonical:raw.canonical,
    noindex:Array.isArray(raw.metaRobots) && (raw.metaRobots.includes('noindex') || raw.metaRobots.includes('none')),
    lang:raw.lang,
    viewport:raw.viewport,
    charset:raw.charset,
    openGraph:raw.openGraph,
    twitter:raw.twitter,
    imagesTotal:raw.imagesTotal || 0,
    imagesMissingAlt:raw.imagesMissingAlt || 0,
    imagesEmptyAlt:raw.imagesEmptyAlt || 0,
    imagesGenericAlt:raw.imagesGenericAlt || 0,
    imageAltExamples:raw.imageAltExamples || [],
    hreflangCount:raw.hreflangCount || 0,
    invalidHreflangCount:raw.invalidHreflangCount || 0,
    invalidHreflang:raw.invalidHreflang || [],
    duplicateHreflangValues:raw.duplicateHreflangValues || []
  };
}

function makePages(facts) {
  const target = targetPageFromFacts(facts);
  const sampled = facts?.siteSnapshot?.enabled ? (facts.siteSnapshot.pages || []) : [];
  return dedupePages([target, ...sampled].filter(Boolean));
}

function titleCheck(pages) {
  const items = [];
  const byTitle = new Map();
  for (const page of pages) {
    if (!page.title) items.push({ level:'issue', issue:'Missing title tag', url:page.finalUrl, pageType:pageLabel(page), value:'No <title> detected' });
    else {
      const len = Number(page.titleLength ?? String(page.title).length);
      if ((page.titleCount || 1) > 1) items.push({ level:'issue', issue:'Multiple title tags', url:page.finalUrl, pageType:pageLabel(page), value:`${page.titleCount} title elements` });
      if (len < 20) items.push({ level:'review', issue:'Unusually short title', url:page.finalUrl, pageType:pageLabel(page), value:`${len} characters - ${page.title}` });
      if (len > 70) items.push({ level:'review', issue:'Unusually long title', url:page.finalUrl, pageType:pageLabel(page), value:`${len} characters - ${page.title}` });
      const key = normalizeText(page.title);
      if (!byTitle.has(key)) byTitle.set(key, []);
      byTitle.get(key).push(page);
    }
  }
  for (const group of byTitle.values()) {
    if (group.length < 2) continue;
    group.forEach((page) => items.push({ level:'review', issue:'Duplicate title in sample', url:page.finalUrl, pageType:pageLabel(page), value:`Shared by ${group.length} sampled pages - ${page.title}` }));
  }
  return check({
    id:'titles', label:'Title tags', category:'metadata', items,
    goodSummary:`${pages.length}/${pages.length} checked pages have distinct titles within the current review thresholds.`,
    reviewSummary:`${items.length} title observation${items.length === 1 ? '' : 's'} worth reviewing across ${pages.length} pages.`,
    issueSummary:`${items.filter((item) => item.level === 'issue').length} confirmed title-tag issue${items.filter((item) => item.level === 'issue').length === 1 ? '' : 's'} detected.` ,
    note:'Length flags are review cues, not pixel-accurate snippet limits. Search engines can truncate or rewrite titles.'
  });
}

function metaCheck(pages) {
  const items = [];
  const byDescription = new Map();
  for (const page of pages) {
    const desc = page.metaDescription;
    if (!desc) {
      items.push({ level:'review', issue:'Missing meta description', url:page.finalUrl, pageType:pageLabel(page), value:'No meta description detected' });
      continue;
    }
    const len = Number(page.metaDescriptionLength ?? String(desc).length);
    if ((page.metaDescriptionCount || 1) > 1) items.push({ level:'issue', issue:'Multiple meta descriptions', url:page.finalUrl, pageType:pageLabel(page), value:`${page.metaDescriptionCount} description tags` });
    if (len < 70) items.push({ level:'review', issue:'Unusually short meta description', url:page.finalUrl, pageType:pageLabel(page), value:`${len} characters - ${desc}` });
    if (len > 170) items.push({ level:'review', issue:'Unusually long meta description', url:page.finalUrl, pageType:pageLabel(page), value:`${len} characters - ${desc}` });
    if (page.titleMetaSame) items.push({ level:'review', issue:'Meta description matches title', url:page.finalUrl, pageType:pageLabel(page), value:desc });
    if (/\b(?:lorem ipsum|meta description|description goes here|add description|page description|placeholder)\b/i.test(desc)) {
      items.push({ level:'issue', issue:'Placeholder-like meta description', url:page.finalUrl, pageType:pageLabel(page), value:desc });
    }
    const key = normalizeText(desc);
    if (!byDescription.has(key)) byDescription.set(key, []);
    byDescription.get(key).push(page);
  }
  for (const group of byDescription.values()) {
    if (group.length < 2) continue;
    group.forEach((page) => items.push({ level:'review', issue:'Duplicate meta description in sample', url:page.finalUrl, pageType:pageLabel(page), value:`Shared by ${group.length} sampled pages - ${page.metaDescription}` }));
  }
  return check({
    id:'meta-descriptions', label:'Meta descriptions', category:'metadata', items,
    goodSummary:`All ${pages.length} checked pages expose a reasonably differentiated meta description within the current review thresholds.`,
    note:'Meta descriptions are snippet suggestions, not ranking directives. Missing or long descriptions matter most when the pattern is repeated or the current copy is poor.'
  });
}

function headingCheck(pages) {
  const items = [];
  for (const page of pages) {
    const count = Number(page.h1Count || 0);
    if (count === 0) items.push({ level:'issue', issue:'Missing H1', url:page.finalUrl, pageType:pageLabel(page), value:'0 H1 elements detected' });
    if (count > 1) items.push({ level:'review', issue:'Multiple H1 elements', url:page.finalUrl, pageType:pageLabel(page), value:`${count} H1 elements detected` });
    if ((page.emptyH1Count || 0) > 0) items.push({ level:'review', issue:'Empty H1 element', url:page.finalUrl, pageType:pageLabel(page), value:`${page.emptyH1Count} empty H1 element${page.emptyH1Count === 1 ? '' : 's'}` });
    if ((page.emptyHeadingCount || 0) > 0) items.push({ level:'review', issue:'Empty heading element', url:page.finalUrl, pageType:pageLabel(page), value:`${page.emptyHeadingCount} empty heading element${page.emptyHeadingCount === 1 ? '' : 's'}` });
    if ((page.primaryHeadingLevelJumps || 0) > 0) items.push({ level:'review', issue:'Heading-level jump', url:page.finalUrl, pageType:pageLabel(page), value:`${page.primaryHeadingLevelJumps} hierarchy jump${page.primaryHeadingLevelJumps === 1 ? '' : 's'} in primary content` });
  }
  return check({
    id:'headings', label:'Heading structure', category:'headings', items,
    goodSummary:`No missing, multiple, empty, or skipped heading-structure signals surfaced across ${pages.length} checked pages.`,
    note:'Multiple H1 elements are a semantic review cue, not an automatic SEO error. Context matters.'
  });
}

function imageCheck(pages) {
  const items = [];
  let total = 0;
  let emptyAlt = 0;
  for (const page of pages) {
    total += Number(page.imagesTotal || 0);
    emptyAlt += Number(page.imagesEmptyAlt || 0);
    if ((page.imagesMissingAlt || 0) > 0) items.push({ level:'review', issue:'Images missing alt attributes', url:page.finalUrl, pageType:pageLabel(page), value:`${page.imagesMissingAlt} of ${page.imagesTotal || 0} images lack an alt attribute` });
    if ((page.imagesGenericAlt || 0) > 0) items.push({ level:'review', issue:'Generic alt text', url:page.finalUrl, pageType:pageLabel(page), value:`${page.imagesGenericAlt} image${page.imagesGenericAlt === 1 ? '' : 's'} use generic alt text` });
  }
  return check({
    id:'images', label:'Image alt text', category:'images', items,
    goodSummary:`No missing or obviously generic alt-text pattern surfaced across ${total} image${total === 1 ? '' : 's'} checked.`,
    note:`${emptyAlt} image${emptyAlt === 1 ? '' : 's'} use empty alt text. Empty alt can be correct for decorative images, so it is not flagged by itself.`
  });
}

function documentCheck(pages) {
  const items = [];
  for (const page of pages) {
    if (!page.lang) items.push({ level:'review', issue:'Missing html lang attribute', url:page.finalUrl, pageType:pageLabel(page), value:'No lang attribute detected on <html>' });
    if (!page.viewport) items.push({ level:'review', issue:'Viewport meta not detected', url:page.finalUrl, pageType:pageLabel(page), value:'No viewport meta tag detected' });
  }
  return check({
    id:'document-basics', label:'Document basics', category:'document', items,
    goodSummary:`Language and viewport signals were detected across all ${pages.length} checked pages.`,
    note:'These are HTML quality/accessibility/mobile signals. They are not intended to become video talking points unless the pattern is material.'
  });
}

function socialCheck(pages) {
  const items = [];
  for (const page of pages) {
    const og = page.openGraph || {};
    const missing = [];
    if (!og.title) missing.push('og:title');
    if (!og.description) missing.push('og:description');
    if (!og.image) missing.push('og:image');
    if (missing.length) items.push({ level:'review', issue:'Incomplete Open Graph metadata', url:page.finalUrl, pageType:pageLabel(page), value:`Missing ${missing.join(', ')}` });
  }
  return check({
    id:'social-metadata', label:'Open Graph metadata', category:'social-metadata', items,
    goodSummary:`Core Open Graph title, description, and image fields were detected across all ${pages.length} checked pages.`,
    note:'Open Graph metadata primarily affects sharing and presentation rather than organic ranking.'
  });
}

function hreflangCheck(pages) {
  const implemented = pages.filter((page) => Number(page.hreflangCount || 0) > 0);
  const items = [];
  for (const page of implemented) {
    if ((page.invalidHreflangCount || 0) > 0) items.push({ level:'issue', issue:'Invalid hreflang value', url:page.finalUrl, pageType:pageLabel(page), value:`${page.invalidHreflangCount} invalid hreflang value${page.invalidHreflangCount === 1 ? '' : 's'}` });
    if ((page.duplicateHreflangValues || []).length) items.push({ level:'review', issue:'Duplicate hreflang value', url:page.finalUrl, pageType:pageLabel(page), value:`Repeated: ${page.duplicateHreflangValues.join(', ')}` });
  }
  if (!implemented.length) return { id:'hreflang', label:'Hreflang', category:'international', status:'good', issueCount:0, reviewCount:0, summary:'No hreflang implementation detected. That is normal unless the site targets language or regional variants.', note:'The scanner does not treat missing hreflang as a problem by itself.', items:[] };
  return check({ id:'hreflang', label:'Hreflang', category:'international', items, goodSummary:`Hreflang syntax looked reasonable on ${implemented.length} page${implemented.length === 1 ? '' : 's'} where it was detected.`, note:'This checks local syntax and duplicates only; reciprocal/canonical hreflang validation would require a more exhaustive language-variant crawl.' });
}

function canonicalCheck(pages) {
  const items = [];
  for (const page of pages) {
    if (!page.canonical) items.push({ level:'review', issue:'Canonical not detected', url:page.finalUrl, pageType:pageLabel(page), value:'No canonical link element detected' });
    if (page.noindex) items.push({ level:'issue', issue:'Noindex directive', url:page.finalUrl, pageType:pageLabel(page), value:'Page is marked noindex/none' });
  }
  return check({ id:'canonical-indexing', label:'Canonical & indexability', category:'indexing', items, goodSummary:`Canonical tags and indexability looked consistent across ${pages.length} checked pages.`, note:'Canonical omission can be intentional. Conflicting canonical targets and sitemap/indexability conflicts are handled separately as higher-priority findings.' });
}

function linkHealthCheck(linkHealth) {
  if (!linkHealth?.enabled) return { id:'internal-link-health', label:'Internal link health', category:'links', status:'good', issueCount:0, reviewCount:0, summary:'Internal-link target validation was not run for this scan.', note:'Link validation is limited to a bounded set of links on the audited page.', items:[] };
  const items = [];
  for (const result of linkHealth.results || []) {
    if (result.error) items.push({ level:'review', issue:'Link target could not be validated', url:result.url, sourceUrl:linkHealth.sourceUrl || null, pageType:'linked URL', value:result.error });
    else if (Number(result.status) >= 400) items.push({ level:'issue', issue:'Broken internal link target', url:result.url, sourceUrl:linkHealth.sourceUrl || null, pageType:'linked URL', value:`HTTP ${result.status}` });
    else if ((result.redirectCount || 0) > 0) items.push({ level:'review', issue:'Internal link goes through redirect', url:result.url, sourceUrl:linkHealth.sourceUrl || null, pageType:'linked URL', value:`${result.redirectCount} redirect${result.redirectCount === 1 ? '' : 's'} -> ${result.finalUrl}` });
  }
  return check({ id:'internal-link-health', label:'Internal link targets', category:'links', items, goodSummary:`${linkHealth.checked} internal link target${linkHealth.checked === 1 ? '' : 's'} on the audited page returned without a broken or redirecting target.`, note:`Validation is capped at ${linkHealth.limit} internal URLs from the audited page and is not a full-site broken-link crawl.` });
}


function qaIssueGroups(checks) {
  const groups = new Map();
  const promotedCheckIds = new Set(['titles','meta-descriptions','headings']);
  for (const checkItem of checks || []) {
    if (!promotedCheckIds.has(checkItem.id)) continue;
    for (const item of checkItem.items || []) {
      if (item.level !== 'issue') continue;
      const url = item.sourceUrl || item.url;
      if (!url) continue;
      const key = `${checkItem.id}\u0000${item.issue}`;
      if (!groups.has(key)) groups.set(key, { checkId:checkItem.id, checkLabel:checkItem.label, category:checkItem.category, issue:item.issue, urls:new Set(), examples:[] });
      const group = groups.get(key);
      group.urls.add(normalizedPageKey(url));
      if (group.examples.length < 4) group.examples.push(url);
    }
  }
  return [...groups.values()]
    .map((group) => ({ ...group, affected:group.urls.size }))
    .sort((a,b) => b.affected - a.affected || a.issue.localeCompare(b.issue));
}

function systemicQaPromotionFindings(pages, checks, templatePatterns) {
  const findings = [];
  if (!pages.length) return findings;

  const issueGroups = qaIssueGroups(checks);
  const totalIssueObservations = issueGroups.reduce((sum, group) => sum + group.affected, 0);
  const affectedPages = new Set(issueGroups.flatMap((group) => [...group.urls]));

  if (totalIssueObservations >= 3 && affectedPages.size >= 2) {
    const top = issueGroups.slice(0, 3);
    const primary = top[0];
    const recurringTemplate = (templatePatterns || []).find((pattern) => pattern.level === 'issue' && ['titles','meta-descriptions','headings'].includes(pattern.checkId));
    const severity = /missing title|multiple title|missing h1/i.test(top.map((group) => group.issue).join(' ')) ? 'high' : 'medium';
    const score = Math.min(82, 66 + Math.min(12, totalIssueObservations));
    const headline = top.length === 1
      ? `${primary.issue} recurs across sampled pages`
      : 'Confirmed on-page issues recur across sampled pages';
    const patternText = top.map((group) => `${group.issue}: ${group.affected} page${group.affected === 1 ? '' : 's'}`).join(' · ');
    findings.push({
      findingType:'issue', scope:'site', id:'onpage-systemic-confirmed-issues', category:'on-page', severity, confidence:'confirmed', score,
      title:headline,
      whyItMatters:`The On-Page QA layer found ${totalIssueObservations} confirmed HTML observation${totalIssueObservations === 1 ? '' : 's'} across ${affectedPages.size} sampled page${affectedPages.size === 1 ? '' : 's'}, led by ${patternText}. Repeated title, description, or H1 implementation problems are more useful to prioritize than isolated housekeeping because they can point to a shared template or CMS pattern.`,
      recommendation:'Inspect the repeated patterns at the template or CMS level first. Confirm the affected URLs, fix the shared implementation where appropriate, and then recheck individual pages instead of treating every observation as a separate task.',
      videoTalkingPoint:`The site does not show a major crawl or indexing block in this pass, but the on-page QA found ${totalIssueObservations} confirmed observations across ${affectedPages.size} sampled pages. The main recurring patterns are ${top.map((group) => `${group.issue.toLowerCase()} on ${group.affected} page${group.affected === 1 ? '' : 's'}`).join(', ')}. I would check whether those are coming from a shared template before spending time on smaller one-off edits.`,
      evidence:[
        ...top.map((group) => ({ label:group.issue, value:`${group.affected} affected page${group.affected === 1 ? '' : 's'}` })),
        ...(recurringTemplate ? [{ label:'Template pattern', value:recurringTemplate.summary }] : []),
        ...top.flatMap((group) => group.examples.slice(0, 1).map((url) => ({ label:`Example - ${group.issue}`, value:url, url }))).slice(0, 3)
      ]
    });
  }

  const reviewCandidates = (templatePatterns || [])
    .filter((pattern) => pattern.level === 'review')
    .filter((pattern) => ['titles','meta-descriptions','headings','images'].includes(pattern.checkId))
    .filter((pattern) => pattern.affected >= 3 && pattern.pct >= 40)
    .map((pattern) => ({
      ...pattern,
      relevanceBoost:['service','location','product'].includes(pattern.pageType) ? 8 : pattern.pageType === 'home' ? 3 : 0
    }))
    .sort((a,b) => (b.relevanceBoost + b.pct + b.affected * 2) - (a.relevanceBoost + a.pct + a.affected * 2));

  const reviewPattern = reviewCandidates[0];
  if (reviewPattern) {
    const score = Math.min(60, 48 + Math.round(reviewPattern.pct / 10) + reviewPattern.relevanceBoost);
    findings.push({
      findingType:'opportunity', scope:'site', id:'onpage-systemic-review-pattern', category:'on-page', severity:'medium', confidence:'manual-review', score,
      title:`${reviewPattern.issue} recurs across sampled ${templateLabel(reviewPattern.pageType, reviewPattern.total)}`,
      whyItMatters:`This review cue appears on ${reviewPattern.summary}. The individual observation is not automatically a ranking problem, but repetition across the same page type makes it more likely to be a template or publishing pattern worth checking.`,
      recommendation:`Review the affected ${templateLabel(reviewPattern.pageType, reviewPattern.total)} together and decide whether the repeated ${reviewPattern.issue.toLowerCase()} pattern is intentional, useful, and appropriate for those pages.`,
      videoTalkingPoint:`One on-page pattern worth checking is ${reviewPattern.issue.toLowerCase()}. It appears on ${reviewPattern.affected} of ${reviewPattern.total} sampled ${templateLabel(reviewPattern.pageType, reviewPattern.total)}, so I would review the shared template before treating these as isolated page edits.`,
      evidence:[
        { label:'Recurring pattern', value:reviewPattern.summary },
        { label:'QA module', value:reviewPattern.checkLabel },
        ...reviewPattern.examples.slice(0, 3).map((url, index) => ({ label:`Example ${index + 1}`, value:url, url }))
      ]
    });
  }

  return findings;
}

function metaPromotionFindings(pages, checks, linkHealth, templatePatterns = []) {
  const findings = [];
  const opportunity = (finding) => findings.push({ findingType:'opportunity', scope:'site', ...finding });
  const issue = (finding) => findings.push({ findingType:'issue', scope:'page', ...finding });

  const badLinks = (linkHealth?.results || []).filter((item) => !item.error && Number(item.status) >= 400);
  if (badLinks.length) {
    issue({
      id:'onpage-broken-internal-links', category:'internal-discovery', severity:'high', confidence:'confirmed', score:82,
      title:`${badLinks.length} broken internal link target${badLinks.length === 1 ? '' : 's'} found on the audited page`,
      whyItMatters:'Internal links that resolve to error responses interrupt navigation and crawl paths and can send both users and crawlers toward dead ends.',
      recommendation:'Open the affected links, confirm the intended destination, and update or remove the link at its source.',
      videoTalkingPoint:`I found ${badLinks.length} internal link${badLinks.length === 1 ? '' : 's'} on this page leading to an error response. I would clean those up because they create avoidable dead ends for users and crawlers.`,
      evidence:badLinks.slice(0,5).map((item) => ({ label:`HTTP ${item.status}`, value:item.url, url:item.url }))
    });
  }

  if (pages.length >= 6) {
    const missingMeta = pages.filter((page) => !page.metaDescription);
    if (missingMeta.length >= 3 && missingMeta.length / pages.length >= .4) {
      opportunity({
        id:'onpage-site-missing-meta-pattern', category:'metadata', severity:'medium', confidence:'manual-review', score:53,
        title:'Meta descriptions are missing across a meaningful share of sampled pages',
        whyItMatters:'Meta descriptions are not a direct ranking requirement, but repeated omissions can leave search engines with less deliberate snippet copy and can signal a template/content-governance gap.',
        recommendation:'Review whether important page templates should provide concise, differentiated descriptions. Do not write descriptions merely to satisfy a field if Google is likely to generate a better snippet from page content.',
        videoTalkingPoint:`In this sample, ${missingMeta.length} of ${pages.length} pages do not expose a meta description. I would review whether the important templates are giving search engines a useful, intentional snippet option.`,
        evidence:missingMeta.slice(0,5).map((page) => ({ label:pageLabel(page), value:page.finalUrl, url:page.finalUrl }))
      });
    }

    const metaGroups = new Map();
    for (const page of pages) {
      const key = normalizeText(page.metaDescription);
      if (!key) continue;
      if (!metaGroups.has(key)) metaGroups.set(key, []);
      metaGroups.get(key).push(page);
    }
    const dupGroups = [...metaGroups.values()].filter((group) => group.length >= 3);
    if (dupGroups.length) {
      const affected = dupGroups.flat();
      opportunity({
        id:'onpage-site-duplicate-meta-pattern', category:'metadata', severity:'medium', confidence:'manual-review', score:56,
        title:'Repeated meta descriptions appear across several sampled pages',
        whyItMatters:'When distinct pages reuse the same description, the snippet copy does little to distinguish page purpose or value. This is a differentiation opportunity rather than a ranking penalty.',
        recommendation:'Review whether pages with distinct intent deserve distinct description copy. Prioritize templates where the repeated text is clearly generic or mismatched.',
        videoTalkingPoint:`I found the same meta description reused across ${affected.length} sampled pages. I would review whether those pages can be differentiated more clearly in their search-result copy.`,
        evidence:affected.slice(0,5).map((page) => ({ label:pageLabel(page), value:page.finalUrl, url:page.finalUrl }))
      });
    }

    const multipleH1 = pages.filter((page) => Number(page.h1Count || 0) > 1);
    if (multipleH1.length >= 3 && multipleH1.length / pages.length >= .4) {
      opportunity({
        id:'onpage-site-multiple-h1-pattern', category:'headings', severity:'low', confidence:'manual-review', score:46,
        title:'Multiple H1 elements recur across sampled templates',
        whyItMatters:'Multiple H1 elements are not automatically an SEO error, but a repeated template-level pattern is worth checking to make sure the primary page topic and document structure are intentional and clear.',
        recommendation:'Inspect the affected templates and confirm whether each H1 has a meaningful semantic role. Consolidate only where the structure is genuinely confusing or accidental.',
        videoTalkingPoint:`Multiple H1s recur across ${multipleH1.length} pages in this sample. I would not call that a penalty, but I would inspect the template to make sure the primary page topic is being expressed cleanly and intentionally.`,
        evidence:multipleH1.slice(0,5).map((page) => ({ label:`${page.h1Count} H1s`, value:page.finalUrl, url:page.finalUrl }))
      });
    }
  }

  findings.push(...systemicQaPromotionFindings(pages, checks, templatePatterns));

  const invalidHreflangPages = pages.filter((page) => Number(page.invalidHreflangCount || 0) > 0);
  if (invalidHreflangPages.length) {
    findings.push({
      findingType:'issue', scope:invalidHreflangPages.length > 1 ? 'site' : 'page', id:'onpage-invalid-hreflang', category:'international', severity:'medium', confidence:'confirmed', score:64,
      title:'Invalid hreflang values were detected',
      whyItMatters:'Invalid hreflang syntax can prevent search engines from interpreting intended language or regional relationships between alternate pages.',
      recommendation:'Review the affected hreflang values and replace them with valid language/region codes or x-default where appropriate.',
      videoTalkingPoint:'I found hreflang values that do not match valid language or region syntax. If these pages are part of an international setup, I would clean that implementation up before relying on it.',
      evidence:invalidHreflangPages.slice(0,5).map((page) => ({ label:`${page.invalidHreflangCount} invalid`, value:page.finalUrl, url:page.finalUrl }))
    });
  }

  return findings;
}

export async function validateInternalLinks(facts, { limit = 20 } = {}) {
  const page = facts?.contentAnalysis?.html || facts?.raw || {};
  if (!facts?.contentAnalysis?.usable) return { enabled:false, limit, sourceUrl:facts?.finalUrl || null, checked:0, results:[] };
  const source = [...(page.primaryInternalHrefs || []), ...(page.internalHrefs || [])];
  const seen = new Set();
  const urls = [];
  for (const value of source) {
    if (urls.length >= limit) break;
    let url;
    try { url = new URL(value, facts.finalUrl); } catch { continue; }
    if (/\.(?:jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|mp3|webm|css|js|xml)(?:$|\?)/i.test(url.pathname)) continue;
    url.hash = '';
    const key = url.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    urls.push(key);
  }
  const results = new Array(urls.length);
  let next = 0;
  const workers = Array.from({ length:Math.min(5, urls.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= urls.length) return;
      const url = urls[index];
      try {
        const response = await safeFetch(url, 'text/html,*/*;q=0.8', { requestProfile:'on-page link QA' });
        results[index] = { url, status:response.status, finalUrl:response.finalUrl, redirectCount:response.redirects?.length || 0 };
      } catch (error) {
        results[index] = { url, status:null, finalUrl:url, redirectCount:0, error:error instanceof Error ? error.message : 'Unable to validate link' };
      }
    }
  });
  await Promise.all(workers);
  return { enabled:true, limit, sourceUrl:facts.finalUrl, checked:results.length, results };
}


function normalizedPageKey(value) {
  return normalizeUrl(value || '');
}

function templateLabel(type, count = 2) {
  const labels = { home:'homepage', service:'service page', article:'article', location:'location page', product:'product page', company:'company page', other:'other page' };
  const base = labels[type] || `${type} page`;
  return count === 1 ? base : (base.endsWith('y') ? `${base.slice(0,-1)}ies` : `${base}s`);
}

function buildTemplatePatterns(pages, checks) {
  const totals = new Map();
  for (const page of pages) totals.set(pageLabel(page), (totals.get(pageLabel(page)) || 0) + 1);
  const patterns = [];
  for (const checkItem of checks) {
    const groups = new Map();
    for (const item of checkItem.items || []) {
      const type = item.pageType || 'page';
      if (type === 'linked URL') continue;
      const total = totals.get(type) || 0;
      if (total < 2) continue;
      const key = `${type}\u0000${item.issue}`;
      if (!groups.has(key)) groups.set(key, { type, issue:item.issue, level:item.level, urls:new Set(), examples:[] });
      const group = groups.get(key);
      if (item.level === 'issue') group.level = 'issue';
      const url = item.sourceUrl || item.url;
      if (url) group.urls.add(normalizedPageKey(url));
      if (group.examples.length < 4 && url) group.examples.push(url);
    }
    for (const group of groups.values()) {
      const total = totals.get(group.type) || 0;
      const affected = group.urls.size;
      const pct = total ? Math.round((affected / total) * 100) : 0;
      if (affected < 2 || pct < 30) continue;
      patterns.push({
        checkId:checkItem.id,
        checkLabel:checkItem.label,
        issue:group.issue,
        level:group.level,
        pageType:group.type,
        affected,
        total,
        pct,
        examples:group.examples,
        summary:`${affected} of ${total} sampled ${templateLabel(group.type, total)} (${pct}%)`
      });
    }
  }
  return patterns.sort((a,b) => {
    const level = { issue:2, review:1 };
    return (level[b.level] - level[a.level]) || (b.pct - a.pct) || (b.affected - a.affected);
  });
}

function buildPageSummaries(pages, checks, linkHealth) {
  const modules = checks.filter((item) => item.id !== 'internal-link-health');
  const linkCheck = checks.find((item) => item.id === 'internal-link-health');
  return pages.map((page) => {
    const urlKey = normalizedPageKey(page.finalUrl || page.requestedUrl);
    const moduleStatuses = modules.map((checkItem) => {
      const matching = (checkItem.items || []).filter((item) => normalizedPageKey(item.sourceUrl || item.url) === urlKey);
      const status = matching.some((item) => item.level === 'issue') ? 'issue' : matching.some((item) => item.level === 'review') ? 'review' : 'good';
      return { id:checkItem.id, label:checkItem.label, status, observations:matching.length };
    });
    if (linkCheck && normalizedPageKey(linkHealth?.sourceUrl) === urlKey) {
      const matching = linkCheck.items || [];
      const status = matching.some((item) => item.level === 'issue') ? 'issue' : matching.some((item) => item.level === 'review') ? 'review' : 'good';
      moduleStatuses.push({ id:linkCheck.id, label:linkCheck.label, status, observations:matching.length });
    }
    return {
      url:page.finalUrl || page.requestedUrl,
      pageType:pageLabel(page),
      title:page.title || '',
      modules:moduleStatuses,
      issueModules:moduleStatuses.filter((item) => item.status === 'issue').length,
      reviewModules:moduleStatuses.filter((item) => item.status === 'review').length,
      clearModules:moduleStatuses.filter((item) => item.status === 'good').length
    };
  });
}

export function buildOnPageQa(facts, linkHealth = { enabled:false, results:[] }) {
  const pages = makePages(facts);
  const checks = [
    titleCheck(pages),
    metaCheck(pages),
    headingCheck(pages),
    canonicalCheck(pages),
    imageCheck(pages),
    documentCheck(pages),
    socialCheck(pages),
    hreflangCheck(pages),
    linkHealthCheck(linkHealth)
  ].sort((a,b) => statusRank(b.status) - statusRank(a.status));
  const issueObservations = checks.reduce((sum, item) => sum + Number(item.issueCount || 0), 0);
  const reviewObservations = checks.reduce((sum, item) => sum + Number(item.reviewCount || 0), 0);
  const summary = {
    pagesChecked:pages.length,
    issueChecks:checks.filter((item) => item.status === 'issue').length,
    reviewChecks:checks.filter((item) => item.status === 'review').length,
    goodChecks:checks.filter((item) => item.status === 'good').length,
    totalChecks:checks.length,
    issueObservations,
    reviewObservations,
    totalObservations:issueObservations + reviewObservations
  };
  const templatePatterns = buildTemplatePatterns(pages, checks);
  const pageSummaries = buildPageSummaries(pages, checks, linkHealth);
  return {
    enabled:Boolean(pages.length),
    pagesChecked:pages.length,
    checks,
    summary,
    linkHealth,
    templatePatterns,
    pageSummaries,
    findings:metaPromotionFindings(pages, checks, linkHealth, templatePatterns)
  };
}
