import { safeFetch } from './safe-fetch.mjs';
import { analyzeHtml } from './analyze-html.mjs';
import { assessHttpAccess } from './access.mjs';
import { classifyUrlType, expectedPageSchema, pathDepth, sampleTypeOrder } from './page-type.mjs';
import { buildRelationshipGraph, makeRelationshipFindings } from './link-graph.mjs';

const MAX_SITEMAPS = 6;
const MAX_URL_POOL = 3000;
const DEFAULT_SAMPLE_SIZE = 12;

function decodeXml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function xmlLocs(xml) {
  return [...String(xml || '').matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi)]
    .map((m) => decodeXml(m[1].trim()))
    .filter(Boolean);
}

function isSitemapIndex(xml) {
  return /<sitemapindex\b/i.test(String(xml || ''));
}

function sameSite(url, origin) {
  try {
    const a = new URL(url);
    const b = new URL(origin);
    return a.hostname.replace(/^www\./, '') === b.hostname.replace(/^www\./, '');
  } catch { return false; }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function evenlySample(values, count) {
  if (values.length <= count) return values;
  const result = [];
  for (let i = 0; i < count; i++) {
    const index = Math.round(i * (values.length - 1) / Math.max(1, count - 1));
    result.push(values[index]);
  }
  return unique(result);
}

function conciseSchemaSummary(types = []) {
  const values = [...new Set((types || []).map((type) => String(type || '').trim()).filter(Boolean))];
  if (!values.length) return 'No structured-data types detected';
  const preferredOrder = ['Service','Product','Article','BlogPosting','MedicalWebPage','FAQPage','BreadcrumbList','WebPage','Organization','WebSite','Person'];
  const preferred = preferredOrder.filter((type) => values.some((value) => value.toLowerCase() === type.toLowerCase()));
  const shown = preferred.slice(0, 4);
  const remaining = Math.max(0, values.length - shown.length);
  return `${shown.join(', ') || values.slice(0, 4).join(', ')}${remaining ? ` + ${remaining} supporting type${remaining === 1 ? '' : 's'}` : ''}`;
}

function normalizeComparableUrl(value, base) {
  try {
    const url = new URL(value, base);
    url.hash = '';
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch { return null; }
}

function uniqueEntries(entries) {
  const seen = new Set();
  const output = [];
  for (const entry of entries) {
    const key = normalizeComparableUrl(entry?.url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(entry);
  }
  return output;
}

async function fetchSitemap(url) {
  try {
    const result = await safeFetch(url, 'application/xml,text/xml,text/plain,*/*;q=0.5', { requestProfile:'sitemap fetch' });
    if (result.status < 200 || result.status >= 300 || assessHttpAccess(result).accessRestricted || !/<(?:urlset|sitemapindex)\b/i.test(result.body)) return { url, ok:false, status:result.status, locs:[], index:false, error:`HTTP ${result.status}` };
    return { url:result.finalUrl, ok:true, status:result.status, locs:xmlLocs(result.body), index:isSitemapIndex(result.body), error:null };
  } catch (error) {
    return { url, ok:false, status:null, locs:[], index:false, error:error instanceof Error ? error.message : 'Fetch failed' };
  }
}

async function discoverSitemapUrls(origin, robotsSitemaps = []) {
  const candidates = unique([
    ...robotsSitemaps,
    new URL('/sitemap.xml', origin).toString(),
    new URL('/sitemap_index.xml', origin).toString()
  ]).slice(0, MAX_SITEMAPS);

  const sitemapReports = [];
  const pageEntries = [];
  const childQueue = [];

  for (const candidate of candidates) {
    const report = await fetchSitemap(candidate);
    sitemapReports.push(report);
    if (!report.ok) continue;
    if (report.index) childQueue.push(...report.locs.slice(0, MAX_SITEMAPS));
    else {
      for (const loc of report.locs) {
        if (sameSite(loc, origin)) pageEntries.push({ url:loc, sourceSitemap:report.url });
        if (pageEntries.length >= MAX_URL_POOL) break;
      }
    }
    if (pageEntries.length >= MAX_URL_POOL) break;
  }

  for (const child of unique(childQueue).filter(u => sameSite(u, origin)).slice(0, Math.max(0, MAX_SITEMAPS-sitemapReports.length))) {
    const report = await fetchSitemap(child);
    sitemapReports.push(report);
    if (report.ok && !report.index) {
      for (const loc of report.locs) {
        if (sameSite(loc, origin)) pageEntries.push({ url:loc, sourceSitemap:report.url });
        if (pageEntries.length >= MAX_URL_POOL) break;
      }
    }
    if (pageEntries.length >= MAX_URL_POOL) break;
  }

  const entries = uniqueEntries(pageEntries).slice(0, MAX_URL_POOL);
  return {
    sitemapReports,
    pageEntries: entries,
    pageUrls: entries.map((entry) => entry.url)
  };
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

export function selectBalancedSample(entries, targetUrl, sampleSize = DEFAULT_SAMPLE_SIZE) {
  const target = new URL(targetUrl);
  const root = new URL('/', target.origin).toString();
  const selected = [];
  const selectedKeys = new Set();

  const add = (entry) => {
    if (!entry || selected.length >= sampleSize) return false;
    const key = normalizeComparableUrl(entry.url);
    if (!key || selectedKeys.has(key)) return false;
    selectedKeys.add(key);
    selected.push(entry);
    return true;
  };

  add({ url:targetUrl, sourceSitemap:null, pageType:classifyUrlType(targetUrl) });
  add({ url:root, sourceSitemap:null, pageType:'home' });

  const remainder = uniqueEntries(entries)
    .filter((entry) => !selectedKeys.has(normalizeComparableUrl(entry.url)))
    .map((entry) => ({ ...entry, pageType:classifyUrlType(entry.url, entry.sourceSitemap) }));

  const groups = new Map();
  for (const type of sampleTypeOrder()) groups.set(type, []);
  for (const entry of remainder) {
    const type = groups.has(entry.pageType) ? entry.pageType : 'other';
    groups.get(type).push(entry);
  }

  const prepared = new Map();
  for (const [type, group] of groups) {
    prepared.set(type, evenlySample(group, Math.min(group.length, sampleSize)));
  }

  const cursors = Object.fromEntries(sampleTypeOrder().map((type) => [type, 0]));
  while (selected.length < sampleSize) {
    let addedThisRound = false;
    for (const type of sampleTypeOrder()) {
      const group = prepared.get(type) || [];
      const index = cursors[type] || 0;
      if (index >= group.length) continue;
      cursors[type] = index + 1;
      if (add(group[index])) addedThisRound = true;
      if (selected.length >= sampleSize) break;
    }
    if (!addedThisRound) break;
  }

  if (selected.length < sampleSize) {
    for (const entry of remainder) {
      add(entry);
      if (selected.length >= sampleSize) break;
    }
  }

  return selected;
}

function hasExpectedSchema(page) {
  const expected = expectedPageSchema(page.pageType);
  if (!expected.length) return true;
  const present = new Set((page.structuredDataTypes || []).map((x) => String(x).toLowerCase()));
  return expected.some((type) => present.has(type.toLowerCase()));
}


function median(values) {
  const nums = values.map(Number).filter(Number.isFinite).sort((a,b) => a-b);
  if (!nums.length) return 0;
  const middle = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[middle] : Math.round((nums[middle - 1] + nums[middle]) / 2);
}

function percentage(count, total) {
  return total ? Math.round(100 * count / total) : 0;
}

export function buildTemplateProfiles(pages = []) {
  const profiles = {};
  for (const type of ['home','service','article','location','product','company','other']) {
    const typed = pages.filter((page) => page?.usable && page.pageType === type);
    if (!typed.length) continue;
    const schemaEligible = typed.filter((page) => expectedPageSchema(page.pageType).length > 0);
    const deep = typed.filter((page) => pathDepth(page.finalUrl || page.requestedUrl) >= 2);
    profiles[type] = {
      count:typed.length,
      medianPrimaryWords:median(typed.map((page) => page.primaryWordCount || 0)),
      medianContextualLinks:median(typed.map((page) => page.primaryInternalLinks || 0)),
      canonicalPct:percentage(typed.filter((page) => Boolean(page.canonical)).length, typed.length),
      pageSpecificSchemaPct:schemaEligible.length ? percentage(schemaEligible.filter(hasExpectedSchema).length, schemaEligible.length) : null,
      breadcrumbPct:deep.length ? percentage(deep.filter((page) => page.hasVisibleBreadcrumbs || (page.structuredDataTypes || []).some((item) => String(item).toLowerCase() === 'breadcrumblist')).length, deep.length) : null,
      authorSignalPct:type === 'article' ? percentage(typed.filter((page) => page.hasAuthorSignal).length, typed.length) : null,
      authorProfilePct:type === 'article' ? percentage(typed.filter((page) => page.hasAuthorProfileLink).length, typed.length) : null,
      sourceLikeCitationPct:type === 'article' ? percentage(typed.filter((page) => (page.primarySourceLikeExternalLinks || 0) > 0).length, typed.length) : null
    };
  }
  return profiles;
}

export function makeSiteFindings(snapshot) {
  const findings = [];
  const issue = (finding) => findings.push({ findingType:'issue', ...finding });
  const opportunity = (finding) => findings.push({ findingType:'opportunity', ...finding });
  const pages = snapshot.pages.filter(Boolean);
  const inSitemap = new Set(snapshot.sitemapPageUrls.map((u) => normalizeComparableUrl(u)).filter(Boolean));
  const targetKey = normalizeComparableUrl(snapshot.targetUrl);
  const otherPages = pages.filter((p) => normalizeComparableUrl(p.requestedUrl) !== targetKey && normalizeComparableUrl(p.finalUrl) !== targetKey);
  const badStatus = otherPages.filter((p) => p.status && !p.accessInterference && !['access-denied','challenge','target-rate-limit'].includes(p.accessState) && ![401,403,407,429].includes(Number(p.status)) && (p.status < 200 || p.status >= 400));
  const sitemapNoindex = otherPages.filter((p) => p.noindex && inSitemap.has(normalizeComparableUrl(p.requestedUrl)));
  const canonicalElsewhere = pages.filter((p) => p.canonical && normalizeComparableUrl(p.canonical, p.finalUrl) !== normalizeComparableUrl(p.finalUrl));
  const missingTitle = pages.filter((p) => p.usable && !p.title);
  const missingH1 = pages.filter((p) => p.usable && p.h1Count === 0);

  const titleMap = new Map();
  for (const p of pages) {
    const key = String(p.title || '').trim().toLowerCase();
    if (!key) continue;
    if (!titleMap.has(key)) titleMap.set(key, []);
    titleMap.get(key).push(p.finalUrl);
  }
  const dupes = [...titleMap.entries()].filter(([, urls]) => urls.length > 1);


  const h1Map = new Map();
  for (const p of pages) {
    const key = String(p.h1Text || '').trim().toLowerCase();
    if (!key || key.length < 4) continue;
    if (!h1Map.has(key)) h1Map.set(key, { display:p.h1Text, urls:[] });
    h1Map.get(key).urls.push(p.finalUrl);
  }
  const duplicateH1s = [...h1Map.values()].filter((entry) => entry.urls.length > 1);

  const samplePageKeys = new Set(pages.map((p) => normalizeComparableUrl(p.finalUrl)).filter(Boolean));
  const contextualIncoming = new Map([...samplePageKeys].map((key) => [key, 0]));
  for (const source of pages) {
    const sourceKey = normalizeComparableUrl(source.finalUrl);
    const linked = new Set((source.primaryInternalHrefs || []).map((href) => normalizeComparableUrl(href, source.finalUrl)).filter(Boolean));
    for (const target of linked) {
      if (target !== sourceKey && contextualIncoming.has(target)) contextualIncoming.set(target, contextualIncoming.get(target) + 1);
    }
  }

  const redirectedSitemapPages = pages.filter((p) => p.sourceSitemap && (p.redirectCount || 0) > 0);
  const canonicalEligible = pages.filter((p) => p.usable && !p.noindex && p.status >= 200 && p.status < 300 && ['service','article','location','product','company'].includes(p.pageType));
  const missingCanonicalPages = canonicalEligible.filter((p) => !p.canonical);
  const genericAnchorPages = pages.filter((p) => p.usable && (p.primaryInternalLinks || 0) >= 2 && (p.primaryInternalGenericAnchorCount || 0) >= 1);
  const genericAnchorCount = genericAnchorPages.reduce((sum, p) => sum + (p.primaryInternalGenericAnchorCount || 0), 0);
  const contextualAnchorCount = pages.reduce((sum, p) => sum + (p.primaryInternalLinks || 0), 0);
  const navigationHeavyPages = pages.filter((p) => p.usable && !['home','company'].includes(p.pageType) && (p.primaryWordCount || 0) >= 350 && (p.navigationInternalLinks || 0) >= 15 && (p.primaryInternalLinks || 0) <= 2);
  const headingJumpPages = pages.filter((p) => p.usable && (p.primaryHeadingLevelJumps || 0) >= 1 && (p.primarySubheadingCount || 0) >= 3);

  if (badStatus.length) issue({
    id:'site-sample-status', scope:'site', title:`${badStatus.length} sampled site URL${badStatus.length === 1 ? '' : 's'} returned a non-success response`, category:'crawlability', severity:'high', confidence:'confirmed', score:91,
    whyItMatters:'A sitewide sample found URLs that are not returning normal crawlable page responses. If these URLs are intended to be live, they can waste internal signals and create poor discovery paths.',
    recommendation:'Review the affected URLs, their internal links, and sitemap inclusion. Fix or intentionally redirect/remove URLs that should no longer resolve.',
    videoTalkingPoint:`In a lightweight site sample, ${badStatus.length} URL${badStatus.length === 1 ? '' : 's'} returned a non-success response. I would inspect whether these are still being linked or submitted in the sitemap.`,
    evidence:badStatus.slice(0,4).map((p, i) => ({label:`Sample ${i + 1}`, value:`${p.status} ${p.finalUrl}`}))
  });

  if (sitemapNoindex.length) issue({
    id:'site-sitemap-noindex', scope:'site', title:`${sitemapNoindex.length} sampled sitemap URL${sitemapNoindex.length === 1 ? ' is' : 's are'} marked noindex`, category:'indexing', severity:'high', confidence:'confirmed', score:90,
    whyItMatters:'A URL listed for discovery in an XML sitemap should generally not simultaneously ask search engines to exclude it from the index.',
    recommendation:'Decide whether each URL should be indexed. Remove noindex from pages meant to rank, or remove intentionally excluded URLs from XML sitemaps.',
    videoTalkingPoint:`The site sample found ${sitemapNoindex.length} sitemap URL${sitemapNoindex.length === 1 ? '' : 's'} carrying a noindex directive, which is a conflicting technical signal worth cleaning up.`,
    evidence:sitemapNoindex.slice(0,4).map((p, i) => ({label:`URL ${i + 1}`, value:p.finalUrl}))
  });

  if (canonicalElsewhere.length >= 2) issue({
    id:'site-canonical-pattern', scope:'site', title:`${canonicalElsewhere.length} sampled URLs canonicalize to a different URL`, category:'indexing', severity:'medium', confidence:'confirmed', score:74,
    whyItMatters:'Multiple sampled URLs declaring a different canonical may be intentional, but a repeated pattern can reveal duplicate templates, parameter variants, or consolidation that deserves review.',
    recommendation:'Review whether the canonical targets are intentional, equivalent, indexable, and consistently linked as the preferred URLs.',
    videoTalkingPoint:`I found a repeated canonicalization pattern in the site sample: ${canonicalElsewhere.length} URLs point their canonical somewhere else. I would verify that this consolidation is intentional.`,
    evidence:canonicalElsewhere.slice(0,4).map((p, i) => ({label:`URL ${i + 1}`, value:`${p.finalUrl} -> ${p.canonical}`}))
  });

  if (dupes.length) {
    const duplicatePages = dupes.reduce((sum, [, urls]) => sum + urls.length, 0);
    issue({
      id:'site-duplicate-titles', scope:'site', title:`Duplicate titles appeared across ${duplicatePages} sampled pages`, category:'content-structure', severity:'medium', confidence:'confirmed', score:67,
      whyItMatters:'Repeated page titles can be a sign that multiple URLs are targeting the same intent or that templates are not giving search systems enough page-level differentiation.',
      recommendation:'Review the affected pages for genuine intent overlap, duplication, or template-level title generation problems.',
      videoTalkingPoint:`The site sample surfaced repeated page titles across ${duplicatePages} URLs. I would check whether those pages are actually distinct or competing with one another.`,
      evidence:dupes.slice(0,3).map(([title, urls]) => ({label:title.slice(0,70), value:urls.slice(0,3).join(' | ')}))
    });
  }

  if (missingTitle.length >= 2) issue({
    id:'site-missing-titles', scope:'site', title:`${missingTitle.length} sampled pages are missing HTML titles`, category:'content-structure', severity:'medium', confidence:'confirmed', score:66,
    whyItMatters:'Multiple missing title elements point to a site/template issue rather than a one-off page mistake.',
    recommendation:'Check the shared template or CMS field mapping and ensure indexable page types output unique titles.',
    videoTalkingPoint:`This looks broader than a single page: ${missingTitle.length} URLs in the sample are missing title elements, so I would inspect the template or CMS setup.`,
    evidence:missingTitle.slice(0,4).map((p, i) => ({label:`URL ${i + 1}`, value:p.finalUrl}))
  });

  if (missingH1.length >= 3) issue({
    id:'site-missing-h1s', scope:'site', title:`${missingH1.length} sampled pages have no H1`, category:'content-structure', severity:'medium', confidence:'confirmed', score:58,
    whyItMatters:'A repeated missing-H1 pattern can make page purpose and semantic hierarchy less clear across a template or content type.',
    recommendation:'Review the affected template and make sure each important page has one clear primary heading.',
    videoTalkingPoint:`I found ${missingH1.length} pages in the site sample without a clear H1, which makes this look like a template-level opportunity rather than a one-page issue.`,
    evidence:missingH1.slice(0,4).map((p, i) => ({label:`URL ${i + 1}`, value:p.finalUrl}))
  });

  if (redirectedSitemapPages.length) issue({
    id:'site-sitemap-redirects', scope:'site', title:`${redirectedSitemapPages.length} sampled sitemap URL${redirectedSitemapPages.length === 1 ? '' : 's'} redirect before reaching the final page`, category:'crawlability', severity:'medium', confidence:'confirmed', score:68,
    whyItMatters:'XML sitemaps are strongest when they list the final canonical URLs directly. Redirecting sitemap entries add unnecessary hops and can reveal stale URL generation or migration cleanup that was never completed.',
    recommendation:'Update sitemap generation so it submits final 200-status canonical URLs rather than redirecting variants. Confirm internal links also favor the final destinations.',
    videoTalkingPoint:`The sitemap sample includes ${redirectedSitemapPages.length} URL${redirectedSitemapPages.length === 1 ? '' : 's'} that redirect before reaching the final page. I would clean that up so discovery signals consistently point at the preferred URLs.`,
    evidence:redirectedSitemapPages.slice(0,4).map((p) => ({label:`${p.redirectCount} redirect${p.redirectCount === 1 ? '' : 's'}`, value:`${p.requestedUrl} -> ${p.finalUrl}`}))
  });

  if (canonicalEligible.length >= 4 && missingCanonicalPages.length >= 2 && missingCanonicalPages.length / canonicalEligible.length >= .4) {
    const ratio = Math.round(100 * missingCanonicalPages.length / canonicalEligible.length);
    opportunity({
      id:'site-canonical-coverage-opportunity', scope:'site', title:'Canonical declarations are inconsistent across sampled indexable templates', category:'indexing', severity:'medium', confidence:'manual-review', score:57,
      whyItMatters:'Self-referencing canonicals are not mandatory on every page, but inconsistent canonical output across important templates can make preferred-URL handling less explicit when duplicate paths, parameters, or migrations exist.',
      recommendation:'Review canonical output by template. Prioritize consistent canonical declarations on indexable pages where alternate URL variants can exist.',
      videoTalkingPoint:`About ${ratio}% of the important indexable pages in this sample do not declare a canonical URL. That is not automatically a problem, but I would review canonical consistency across the templates.`,
      evidence:missingCanonicalPages.slice(0,4).map((p) => ({label:p.pageType, value:p.finalUrl}))
    });
  }

  if (contextualAnchorCount >= 8 && genericAnchorCount >= 3 && genericAnchorCount / contextualAnchorCount >= .2) {
    const ratio = Math.round(100 * genericAnchorCount / contextualAnchorCount);
    opportunity({
      id:'site-generic-anchor-opportunity', scope:'site', title:'Generic contextual anchor text appears repeatedly in the site sample', category:'internal-discovery', severity:'medium', confidence:'likely', score:56,
      whyItMatters:'Repeated anchors such as “read more” or “learn more” give less descriptive context about the destination than natural topic-specific anchor text. This is an internal-link clarity opportunity, not a penalty.',
      recommendation:'Review repeated generic links and make the clickable text more descriptive when that improves usability and accurately describes the destination. Do not force keywords into every anchor.',
      videoTalkingPoint:`Roughly ${ratio}% of the contextual internal links in this sample use generic labels such as “read more” or “learn more.” I would tighten those where a descriptive anchor can better explain the destination.`,
      evidence:genericAnchorPages.slice(0,4).map((p) => ({label:p.pageType, value:`${p.primaryInternalGenericAnchorCount} generic of ${p.primaryInternalLinks} contextual links - ${p.finalUrl}`}))
    });
  }

  if (navigationHeavyPages.length >= 2 && navigationHeavyPages.length / Math.max(1, pages.filter((p) => p.usable && !['home','company'].includes(p.pageType)).length) >= .3) {
    opportunity({
      id:'site-navigation-reliance-opportunity', scope:'site', title:'Several sampled pages rely much more on global navigation than contextual links', category:'internal-discovery', severity:'medium', confidence:'manual-review', score:54,
      whyItMatters:'Global navigation is useful for crawl discovery, but contextual links inside substantive content can express relationships between closely related services, articles, and supporting pages more clearly.',
      recommendation:'Review whether important pages have useful in-content pathways to closely related pages instead of relying almost entirely on menus and footer navigation.',
      videoTalkingPoint:'A few sampled pages have a large global navigation footprint but very few links inside the actual page content. I would review whether related services and resources can be connected more naturally in context.',
      evidence:navigationHeavyPages.slice(0,4).map((p) => ({label:p.pageType, value:`${p.navigationInternalLinks} nav links / ${p.primaryInternalLinks} contextual links - ${p.finalUrl}`}))
    });
  }

  if (headingJumpPages.length >= 3 && headingJumpPages.length / Math.max(1, pages.filter((p) => p.usable).length) >= .3) {
    opportunity({
      id:'site-heading-hierarchy-opportunity', scope:'site', title:'Heading-level jumps recur across several sampled pages', category:'content-structure', severity:'low', confidence:'manual-review', score:46,
      whyItMatters:'Skipping heading levels is not a ranking penalty, but repeated hierarchy jumps can make the semantic structure less predictable for assistive technologies and machine extraction.',
      recommendation:'Review shared templates and content editing patterns for logical heading order. Fix hierarchy where it improves document structure rather than changing headings only for an audit score.',
      videoTalkingPoint:'I am seeing repeated heading-level jumps across multiple templates. That is not a ranking issue by itself, but I would clean up the semantic hierarchy so the page structure is more explicit.',
      evidence:headingJumpPages.slice(0,4).map((p) => ({label:p.pageType, value:`${p.primaryHeadingLevelJumps} jump${p.primaryHeadingLevelJumps === 1 ? '' : 's'} - ${p.finalUrl}`}))
    });
  }

  const contextualEligible = pages.filter((p) => p.usable && !['home','company'].includes(p.pageType) && (p.primaryWordCount || 0) >= 400);
  const sparseContextual = contextualEligible.filter((p) => (p.primaryInternalLinks || 0) <= 1);
  if (contextualEligible.length >= 3 && sparseContextual.length >= 2 && sparseContextual.length / contextualEligible.length >= .4) {
    const ratio = Math.round(100 * sparseContextual.length / contextualEligible.length);
    opportunity({
      id:'site-contextual-linking-opportunity', scope:'site', title:`Contextual internal linking is sparse on ${sparseContextual.length} sampled content pages`, category:'internal-discovery', severity:'medium', confidence:'likely', score:66,
      whyItMatters:'Several substantial pages in the site sample contain very few crawlable internal links inside their primary content. Strong contextual linking can make relationships between services, topics, and supporting resources easier for users and crawlers to follow.',
      recommendation:'Look for natural in-copy links between closely related services, supporting resources, locations, and conversion pages. Prioritize links that genuinely help a visitor continue the journey.',
      videoTalkingPoint:`One broader opportunity I see is contextual internal linking. ${ratio}% of the substantial pages in this sample have one or fewer internal links inside the main content, so I would look for stronger connections between related pages.`,
      evidence:sparseContextual.slice(0,4).map((p) => ({label:p.pageType, value:`${p.primaryInternalLinks || 0} contextual links - ${p.finalUrl}`}))
    });
  }

  const deepPages = pages.filter((p) => p.usable && pathDepth(p.finalUrl) >= 2 && !['home'].includes(p.pageType));
  const withoutBreadcrumbMarkup = deepPages.filter((p) => !(p.structuredDataTypes || []).some((type) => String(type).toLowerCase() === 'breadcrumblist') && !p.hasVisibleBreadcrumbs);
  if (deepPages.length >= 3 && withoutBreadcrumbMarkup.length / deepPages.length >= .6) {
    const ratio = Math.round(100 * withoutBreadcrumbMarkup.length / deepPages.length);
    opportunity({
      id:'site-breadcrumb-structure-opportunity', scope:'site', title:'Breadcrumb signals are limited across deeper sampled pages', category:'structured-data', severity:'medium', confidence:'manual-review', score:56,
      whyItMatters:'The HTML sample does not expose a visible breadcrumb pattern or BreadcrumbList markup on most deeper pages. Breadcrumbs can reinforce hierarchy and make site structure more explicit, although their absence is not a ranking failure and visual breadcrumbs may still exist without recognized structured markup.',
      recommendation:'Review whether important deeper templates use useful visible breadcrumbs and valid BreadcrumbList structured data where appropriate.',
      videoTalkingPoint:`On the deeper pages I sampled, recognized breadcrumb markup was absent on about ${ratio}% of them. That is not a penalty, but it is a site-structure opportunity I would review.`,
      evidence:withoutBreadcrumbMarkup.slice(0,4).map((p) => ({label:p.pageType, value:p.finalUrl}))
    });
  }

  const schemaEligible = pages.filter((p) => p.usable && expectedPageSchema(p.pageType).length > 0);
  const limitedPageSchema = schemaEligible.filter((p) => !hasExpectedSchema(p));
  if (schemaEligible.length >= 3 && limitedPageSchema.length >= 2 && limitedPageSchema.length / schemaEligible.length >= .5) {
    opportunity({
      id:'site-page-schema-opportunity', scope:'site', title:'Page-specific structured data is limited across several sampled templates', category:'structured-data', severity:'medium', confidence:'manual-review', score:55,
      whyItMatters:'Several pages that look like services, articles, or products do not expose a corresponding page-specific schema type in the HTML sample. Structured data is not a direct ranking shortcut, but accurate machine-readable context can make page purpose and entities clearer.',
      recommendation:'Review page templates for accurate, supported structured data that matches what the page actually represents. Do not add schema solely to chase a score.',
      videoTalkingPoint:`A number of the sampled service, article, or product pages only expose generic structured data. I would review whether the templates can describe those page types more explicitly for machines.`,
      evidence:limitedPageSchema.slice(0,4).map((p) => ({ label:p.pageType, value:conciseSchemaSummary(p.structuredDataTypes), url:p.finalUrl }))
    });
  }



  const organizationPages = pages.filter((p) => p.usable && (p.organizationEntityNames || []).length > 0);
  if (organizationPages.length >= 4) {
    const namePages = new Map();
    for (const page of organizationPages) {
      const pageNames = new Set((page.organizationEntityNames || []).map((name) => String(name).replace(/\s+/g, ' ').trim()).filter(Boolean));
      for (const name of pageNames) {
        const key = name.toLowerCase();
        if (!namePages.has(key)) namePages.set(key, { display:name, urls:new Set() });
        namePages.get(key).urls.add(page.finalUrl);
      }
    }
    const repeatedNames = [...namePages.values()].filter((entry) => entry.urls.size >= 2).sort((a,b) => b.urls.size - a.urls.size);
    const dominant = repeatedNames[0]?.urls.size || 0;
    if (repeatedNames.length >= 2 && dominant / organizationPages.length < .8) {
      opportunity({
        id:'site-organization-identity-consistency', scope:'site', title:'Organization identity varies across sampled structured data', category:'entity-clarity', severity:'low', confidence:'manual-review', score:52,
        whyItMatters:'Multiple recurring organization names across templates can be intentional for locations, sub-brands, or legal entities. When they are not intentional, inconsistent machine-readable identity can make it harder to understand which organization a page represents.',
        recommendation:'Review the recurring organization names and confirm that each one maps to a real intended entity. Where one brand/entity should be consistent, standardize the name, URL, logo, and supporting identity fields.',
        videoTalkingPoint:'I am seeing more than one recurring organization identity in the structured-data sample. That may be intentional, but I would verify that the site is consistently describing the right brand or entity on each template.',
        evidence:repeatedNames.slice(0,4).map((entry) => ({ label:entry.display, value:`${entry.urls.size} sampled pages`, url:[...entry.urls][0] }))
      });
    }
  }

  const targetPage = pages.find((p) => normalizeComparableUrl(p.finalUrl) === targetKey || normalizeComparableUrl(p.requestedUrl) === targetKey);
  const targetInSitemap = inSitemap.has(normalizeComparableUrl(targetPage?.finalUrl || snapshot.targetUrl)) || inSitemap.has(targetKey);
  if (snapshot.sitemapFound && targetPage?.usable && targetPage.pageType !== 'home' && !targetPage.noindex && !targetInSitemap) {
    opportunity({
      id:'target-not-in-sitemap-opportunity', scope:'site', title:'The audited URL was not found in the discovered XML sitemap set', category:'discovery', severity:'medium', confidence:'manual-review', score:60,
      whyItMatters:'An indexable page can still be discovered without appearing in an XML sitemap, but omission is worth reviewing when the URL is important enough to receive a dedicated audit. Sitemaps are a useful discovery and canonical-URL signal, especially on larger sites.',
      recommendation:'Confirm whether this URL is intentionally omitted. If it is a canonical, indexable page that matters for search, review sitemap generation and inclusion rules.',
      videoTalkingPoint:'One discovery item I would verify is sitemap inclusion. This audited URL did not appear in the XML sitemap set the scanner discovered, so I would confirm whether that is intentional.',
      evidence:[{label:'Audited URL', value:targetPage.finalUrl},{label:'Sitemap URLs discovered', value:String(snapshot.sitemapPageCount)}]
    });
  }

  if (duplicateH1s.length) {
    const duplicatePages = duplicateH1s.reduce((sum, entry) => sum + entry.urls.length, 0);
    opportunity({
      id:'site-duplicate-h1-opportunity', scope:'site', title:`Repeated primary headings appeared across ${duplicatePages} sampled pages`, category:'content-differentiation', severity:'medium', confidence:'manual-review', score:61,
      whyItMatters:'Identical H1s across different URLs can be perfectly valid in some templates, but repeated primary headings are a useful signal to check whether pages are clearly differentiated by purpose, topic, or location.',
      recommendation:'Review the repeated headings in context. Change them only when the pages serve distinct intents and a more specific heading would better describe each page.',
      videoTalkingPoint:`I found repeated primary headings across ${duplicatePages} sampled URLs. I would use that as a prompt to check whether those pages are differentiated clearly enough rather than treating the repeated H1 itself as a penalty.`,
      evidence:duplicateH1s.slice(0,3).map((entry) => ({label:entry.display.slice(0,70), value:entry.urls.slice(0,3).join(' | ')}))
    });
  }

  const discoverableTargets = pages.filter((p) => p.usable && !['home','company'].includes(p.pageType) && (p.primaryWordCount || 0) >= 250);
  const noSampleIncoming = discoverableTargets.filter((p) => (contextualIncoming.get(normalizeComparableUrl(p.finalUrl)) || 0) === 0);
  if (discoverableTargets.length >= 5 && noSampleIncoming.length >= 3 && noSampleIncoming.length / discoverableTargets.length >= .5) {
    const ratio = Math.round(100 * noSampleIncoming.length / discoverableTargets.length);
    opportunity({
      id:'site-sample-crosslink-opportunity', scope:'site', title:'Several sampled pages receive no contextual links from the rest of the sample', category:'internal-discovery', severity:'medium', confidence:'manual-review', score:63,
      whyItMatters:'This is not proof that the pages are orphaned because the scanner only evaluates a small sample. It does show weak cross-linking within the sampled templates, which is a useful prompt to inspect whether related services, articles, locations, or products meaningfully connect to one another.',
      recommendation:'Check the affected URLs in a full internal-link crawl or CMS view. Look for relevant in-copy links from related pages before calling any page orphaned.',
      videoTalkingPoint:`Within this site sample, about ${ratio}% of the substantial non-home pages receive no contextual links from the other sampled pages. That is not enough to call them orphaned, but it is a good reason to inspect the internal linking network more closely.`,
      evidence:noSampleIncoming.slice(0,4).map((p) => ({label:p.pageType, value:p.finalUrl}))
    });
  }

  const articlePages = pages.filter((p) => p.usable && p.pageType === 'article');
  const articlesWithoutAuthor = articlePages.filter((p) => !p.hasAuthorSignal);
  if (articlePages.length >= 2 && articlesWithoutAuthor.length >= 2 && articlesWithoutAuthor.length / articlePages.length >= .5) {
    const ratio = Math.round(100 * articlesWithoutAuthor.length / articlePages.length);
    opportunity({
      id:'site-article-authorship-opportunity', scope:'site', title:'Authorship signals are limited across sampled article pages', category:'entity-clarity', severity:'medium', confidence:'manual-review', score:58,
      whyItMatters:'Clear authorship can help users and machines connect editorial content to a responsible person or organization. The absence of a detected author signal is not a ranking failure, but it can reveal an opportunity to strengthen editorial identity and entity context.',
      recommendation:'Review article templates for clear visible bylines and accurate author metadata or structured data tied to real author profiles where appropriate.',
      videoTalkingPoint:`In this article sample, I could not detect a strong author signal on about ${ratio}% of the pages. I would review whether the site can make editorial ownership and expertise more explicit.`,
      evidence:articlesWithoutAuthor.slice(0,4).map((p) => ({label:'article', value:p.finalUrl}))
    });
  }

  const articleDateEligible = articlePages.filter((p) => (p.primaryWordCount || 0) >= 400);
  const articlesWithoutStructuredDates = articleDateEligible.filter((p) => !p.structuredDataHasDatePublished && !p.structuredDataHasDateModified);
  if (articleDateEligible.length >= 2 && articlesWithoutStructuredDates.length >= 2 && articlesWithoutStructuredDates.length / articleDateEligible.length >= .5) {
    const ratio = Math.round(100 * articlesWithoutStructuredDates.length / articleDateEligible.length);
    opportunity({
      id:'site-article-date-opportunity', scope:'site', title:'Structured publication/update dates are limited across sampled articles', category:'entity-clarity', severity:'low', confidence:'manual-review', score:48,
      whyItMatters:'Clear publication and modification dates can help readers and machines understand editorial recency. Their absence is not a ranking failure, and visible dates may still exist even when structured dates are absent.',
      recommendation:'Review article templates for accurate visible dates and datePublished/dateModified structured data where those dates are genuinely maintained.',
      videoTalkingPoint:`In this article sample, about ${ratio}% of the pages do not expose structured publication or modification dates. I would review whether editorial recency can be made clearer and kept accurate.`,
      evidence:articlesWithoutStructuredDates.slice(0,4).map((p) => ({label:'article', value:p.finalUrl}))
    });
  }

  const landingPages = pages.filter((p) => p.usable && ['service','location','product'].includes(p.pageType));
  const lowContentLandingPages = landingPages.filter((p) => (p.primaryWordCount || 0) > 0 && (p.primaryWordCount || 0) < 260);
  if (landingPages.length >= 3 && lowContentLandingPages.length >= 2 && lowContentLandingPages.length / landingPages.length >= .4) {
    opportunity({
      id:'site-limited-primary-content-opportunity', scope:'site', title:'Several sampled landing pages expose relatively little primary copy', category:'content-depth', severity:'low', confidence:'manual-review', score:49,
      whyItMatters:'Word count is not a ranking requirement. This pattern is useful only as a prompt to check whether important service, location, or product pages sufficiently explain what they offer, who it is for, key differentiators, and next steps.',
      recommendation:'Review these templates against actual user intent. Expand content only where doing so adds specific, useful information rather than padding pages to a target length.',
      videoTalkingPoint:`Several service, location, or product pages in the sample have a fairly small primary content footprint. I would not call that a thin-content penalty, but I would review whether those pages answer enough of the questions a prospective customer would actually have.`,
      evidence:lowContentLandingPages.slice(0,4).map((p) => ({label:p.pageType, value:`${p.primaryWordCount} words - ${p.finalUrl}`}))
    });
  }

  const longPages = pages.filter((p) => p.usable && (p.primaryWordCount || 0) >= 900 && !['home'].includes(p.pageType));
  const weakSections = longPages.filter((p) => (p.primarySubheadingCount || 0) <= 1 || ((p.primaryLongestParagraphWords || 0) >= 190 && (p.primarySubheadingCount || 0) <= 3));
  if (longPages.length >= 3 && weakSections.length >= 2 && weakSections.length / longPages.length >= .5) {
    opportunity({
      id:'site-section-structure-opportunity', scope:'site', title:'Several long sampled pages have very little subheading structure', category:'content-structure', severity:'medium', confidence:'manual-review', score:51,
      whyItMatters:'Long pages with little semantic sectioning can be harder to scan and can make distinct subtopics or answer passages less explicit. This is a content-structure opportunity, not evidence of a ranking problem.',
      recommendation:'Review whether longer pages can be organized into clearer, genuinely useful sections with descriptive headings that reflect user questions and subtopics.',
      videoTalkingPoint:`Several longer pages in the sample are doing a lot of work with very little heading structure. I would look at whether clearer sections could make the content easier for both users and retrieval systems to interpret.`,
      evidence:weakSections.slice(0,4).map((p) => ({label:p.pageType, value:`${p.primaryWordCount} words / ${p.primarySubheadingCount || 0} subheadings - ${p.finalUrl}`}))
    });
  }

  return findings.sort((a,b) => b.score - a.score);
}

async function scanSnapshotEntry(entry) {
  const url = entry.url;
  try {
    const page = await safeFetch(url);
    const raw = analyzeHtml(page.body, page.finalUrl);
    const access = assessHttpAccess({ status:page.status, headers:page.headers, body:page.body, rawAnalysis:raw });
    const usable = access.pageContentUsable && /^(?:text\/html|application\/xhtml\+xml)/i.test(page.headers['content-type']||'text/html');
    const structuredDataTypes = usable ? (raw.structuredDataTypes || raw.jsonLdTypes || []) : [];
    const pageType = classifyUrlType(page.finalUrl, entry.sourceSitemap, structuredDataTypes);
    return {
      requestedUrl:url,
      finalUrl:page.finalUrl,
      sourceSitemap:entry.sourceSitemap || null,
      pageType,
      status:page.status,
      requestAttempted:true, reusedWithinScan:!!page.reusedWithinScan,
      accessState:access.kind, accessSignals:access.signals, error:usable?null:access.message,
      requestReference:page.headers['cf-ray']||page.headers['x-request-id']||null,
      usable,
      redirectCount:page.redirects.length,
      redirects:page.redirects,
      title:usable ? raw.title : null,
      titleCount:usable ? raw.titleCount : null,
      titleLength:usable ? raw.titleLength : null,
      metaDescription:usable ? raw.metaDescription : null,
      metaDescriptionCount:usable ? raw.metaDescriptionCount : null,
      metaDescriptionLength:usable ? raw.metaDescriptionLength : null,
      titleMetaSame:usable ? raw.titleMetaSame : null,
      viewport:usable ? raw.viewport : null,
      charset:usable ? raw.charset : null,
      openGraph:usable ? raw.openGraph : null,
      twitter:usable ? raw.twitter : null,
      h1Count:usable ? raw.h1ElementCount : null,
      h1Text:usable ? (raw.h1s[0] || null) : null,
      emptyH1Count:usable ? raw.emptyH1Count : null,
      emptyHeadingCount:usable ? raw.emptyHeadingCount : null,
      canonical:usable ? raw.canonical : null,
      noindex:usable ? raw.metaRobots.includes('noindex') || raw.metaRobots.includes('none') : null,
      wordCount:usable ? raw.wordCount : null,
      primaryWordCount:usable ? raw.primaryWordCount : null,
      primaryInternalLinks:usable ? raw.primaryInternalLinks : null,
      primaryInternalHrefs:usable ? raw.primaryInternalHrefs : [],
      primaryInternalLinkDetails:usable ? raw.primaryInternalLinkDetails : [],
      primaryExternalLinks:usable ? raw.primaryExternalLinks : null,
      primaryExternalHrefs:usable ? raw.primaryExternalHrefs : [],
      primaryExternalLinkDetails:usable ? raw.primaryExternalLinkDetails : [],
      primarySourceLikeExternalLinks:usable ? raw.primarySourceLikeExternalLinks : null,
      primarySourceLikeExternalLinkDetails:usable ? raw.primarySourceLikeExternalLinkDetails : [],
      internalHrefs:usable ? raw.internalHrefs : [],
      primaryInternalGenericAnchorCount:usable ? raw.primaryInternalGenericAnchorCount : null,
      primaryInternalGenericAnchorRatio:usable ? raw.primaryInternalGenericAnchorRatio : null,
      primaryInternalGenericAnchorExamples:usable ? raw.primaryInternalGenericAnchorExamples : [],
      navigationInternalLinks:usable ? raw.navigationInternalLinks : null,
      primarySubheadingCount:usable ? raw.primarySubheadingCount : null,
      primaryHeadingLevelJumps:usable ? raw.primaryHeadingLevelJumps : null,
      primaryQuestionHeadingCount:usable ? raw.primaryQuestionHeadingCount : null,
      primaryParagraphCount:usable ? raw.primaryParagraphCount : null,
      primaryLongestParagraphWords:usable ? raw.primaryLongestParagraphWords : null,
      hasAuthorSignal:usable ? raw.hasAuthorSignal : null,
      hasAuthorProfileLink:usable ? raw.hasAuthorProfileLink : null,
      authorProfileLinks:usable ? raw.authorProfileLinks : [],
      structuredDataHasAuthor:usable ? raw.structuredDataHasAuthor : null,
      structuredDataAuthorNames:usable ? raw.structuredDataAuthorNames : [],
      personEntityCount:usable ? raw.personEntityCount : null,
      personEntityNames:usable ? raw.personEntityNames : [],
      personEntityUrls:usable ? raw.personEntityUrls : [],
      hasVisibleBreadcrumbs:usable ? raw.hasVisibleBreadcrumbs : null,
      structuredDataHasDatePublished:usable ? raw.structuredDataHasDatePublished : null,
      structuredDataHasDateModified:usable ? raw.structuredDataHasDateModified : null,
      structuredDataDatePublishedValues:usable ? raw.structuredDataDatePublishedValues : [],
      structuredDataDateModifiedValues:usable ? raw.structuredDataDateModifiedValues : [],
      metaPublishedTime:usable ? raw.metaPublishedTime : null,
      metaModifiedTime:usable ? raw.metaModifiedTime : null,
      visibleDateValues:usable ? raw.visibleDateValues : [],
      titleYearReferences:usable ? raw.titleYearReferences : [],
      metaDescriptionYearReferences:usable ? raw.metaDescriptionYearReferences : [],
      primaryYearReferences:usable ? raw.primaryYearReferences : [],
      primaryYearReferenceCount:usable ? raw.primaryYearReferenceCount : null,
      sourceLinkYearReferences:usable ? raw.sourceLinkYearReferences : [],
      organizationEntityCount:usable ? raw.organizationEntityCount : null,
      organizationEntityHasName:usable ? raw.organizationEntityHasName : null,
      organizationEntityHasUrl:usable ? raw.organizationEntityHasUrl : null,
      organizationEntityHasLogo:usable ? raw.organizationEntityHasLogo : null,
      organizationEntityHasSameAs:usable ? raw.organizationEntityHasSameAs : null,
      organizationEntityNames:usable ? raw.organizationEntityNames : [],
      organizationEntityUrls:usable ? raw.organizationEntityUrls : [],
      organizationEntitySameAs:usable ? raw.organizationEntitySameAs : [],
      lang:usable ? raw.lang : null,
      imagesTotal:usable ? raw.imagesTotal : null,
      imagesMissingAlt:usable ? raw.imagesMissingAlt : null,
      imagesEmptyAlt:usable ? raw.imagesEmptyAlt : null,
      imagesGenericAlt:usable ? raw.imagesGenericAlt : null,
      imagesMissingDimensions:usable ? raw.imagesMissingDimensions : null,
      imageAltExamples:usable ? raw.imageAltExamples : [],
      hreflangCount:usable ? raw.hreflangCount : null,
      invalidHreflangCount:usable ? raw.invalidHreflangCount : null,
      invalidHreflang:usable ? raw.invalidHreflang : [],
      duplicateHreflangValues:usable ? raw.duplicateHreflangValues : [],
      structuredDataTypes,
      accessInterference:access.likelyInterference
    };
  } catch (error) {
    return { requestedUrl:url, finalUrl:url, sourceSitemap:entry.sourceSitemap || null, pageType:entry.pageType || classifyUrlType(url, entry.sourceSitemap), status:null, usable:false, requestAttempted:error.requestAttempted!==false&&!['ROBOTS_DISALLOWED','ACCESS_PAUSED','REQUEST_BUDGET'].includes(error.code), errorCode:error.code||'FETCH_ERROR', accessState:error.code==='ACCESS_PAUSED'?'skipped-after-denials':error.code==='ROBOTS_DISALLOWED'?'robots-disallowed':'fetch-error', error:error instanceof Error ? error.message : 'Scan failed' };
  }
}

export async function createSiteSnapshot(targetUrl, robots, { sampleSize = DEFAULT_SAMPLE_SIZE, seedUrls=[], onProgress=()=>{}, onPage=()=>{} } = {}) {
  const target = new URL(targetUrl);
  const origin = target.origin;
  const discovered = await discoverSitemapUrls(origin, robots?.sitemaps || []);
  if (!discovered.pageEntries.length) {
    discovered.pageEntries = unique(seedUrls).filter(u=>sameSite(u,origin)).slice(0,200).map(url=>({url,sourceSitemap:null}));
    discovered.fromLinks = true;
  }
  onProgress({stage:'pages',message:'Inspecting the selected page sample',done:0,total:sampleSize});
  const sampledEntries = selectBalancedSample(discovered.pageEntries, targetUrl, sampleSize);
  let complete=0;
  const pages = await mapLimit(sampledEntries, 2, async e=>{const p=await scanSnapshotEntry(e);onPage(p);onProgress({stage:'pages',message:'Inspecting the selected page sample',done:++complete,total:sampledEntries.length});return p;});

  // A broader raw-HTML crawl is used only for relationship analysis. It is intentionally
  // larger than the deep template sample but still bounded so prospect audits stay quick.
  const relationshipTarget = Math.min(48, Math.max(24, sampleSize * 2));
  const relationshipEntries = selectBalancedSample(discovered.pageEntries, targetUrl, relationshipTarget);
  const existing = new Map();
  for (const page of pages) {
    const key = normalizeComparableUrl(page?.requestedUrl) || normalizeComparableUrl(page?.finalUrl);
    if (key) existing.set(key, page);
  }
  const extras = relationshipEntries.filter((entry) => !existing.has(normalizeComparableUrl(entry.url)));
  let linked=0;
  const extraPages = await mapLimit(extras, 2, async e=>{const p=await scanSnapshotEntry(e);onProgress({stage:'relationships',message:'Mapping contextual links in the sample',done:++linked,total:extras.length});return p;});
  const extraMap = new Map(extraPages.map((page) => [normalizeComparableUrl(page?.requestedUrl) || normalizeComparableUrl(page?.finalUrl), page]));
  const relationshipPages = relationshipEntries.map((entry) => existing.get(normalizeComparableUrl(entry.url)) || extraMap.get(normalizeComparableUrl(entry.url))).filter(Boolean);
  const relationshipGraph = buildRelationshipGraph(relationshipPages, discovered.pageEntries);

  const sampleComposition = pages.reduce((acc, page) => {
    const type = page?.pageType || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const snapshot = {
    enabled:true,
    targetUrl,
    origin,
    sitemapFound:discovered.sitemapReports.some((r) => r.ok),
    discoverySource:discovered.fromLinks ? 'entry-page-links' : 'sitemaps',
    sitemapReports:discovered.sitemapReports,
    sitemapPageCount:discovered.pageUrls.length,
    sitemapPageUrls:discovered.pageUrls,
    sampleSize:pages.length,
    sampleComposition,
    templateProfiles:buildTemplateProfiles(pages),
    pages,
    relationshipPages,
    relationshipGraph
  };
  snapshot.findings = [...makeSiteFindings(snapshot), ...makeRelationshipFindings(relationshipGraph)].sort((a,b) => b.score - a.score);
  return snapshot;
}

export function disabledSiteSnapshot() {
  return { enabled:false, origin:null, sitemapFound:null, sitemapReports:[], sitemapPageCount:0, sitemapPageUrls:[], sampleSize:0, sampleComposition:{}, templateProfiles:{}, pages:[], relationshipGraph:{ enabled:false, pageCount:0, usablePageCount:0 }, findings:[] };
}
