function decodeEntities(value) {
  return String(value ?? '')
    .replace(/&#(\d+);/g, (_, n) => (Number(n)<=0x10ffff?String.fromCodePoint(Number(n)):'\uFFFD'))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => (parseInt(n,16)<=0x10ffff?String.fromCodePoint(parseInt(n,16)):'\uFFFD'))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function textOnly(value) {
  return decodeEntities(String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function getAttr(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`\\s${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match ? decodeEntities(match[1] ?? match[2] ?? match[3] ?? '').trim() : null;
}

function stripNonContent(html) {
  return String(html ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|template|svg|canvas)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ');
}

function stripHiddenBlocks(html) {
  return html
    .replace(/<([a-z0-9:-]+)\b[^>]*(?:\shidden(?:\s|=|>)|aria-hidden\s*=\s*["']?true|style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden))[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<([a-z0-9:-]+)\b[^>]*(?:class|id)\s*=\s*["'][^"']*(?:cookie|consent|modal|popup|overlay)[^"']*["'][^>]*>[\s\S]*?<\/\1\s*>/gi, ' ');
}

function stripBoilerplateBlocks(html) {
  return html
    .replace(/<(header|nav|footer|aside|form|dialog)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<([a-z0-9:-]+)\b[^>]*(?:role\s*=\s*["']?(?:navigation|banner|contentinfo|complementary)|(?:class|id)\s*=\s*["'][^"']*(?:site-header|site-footer|main-nav|primary-nav|secondary-nav|mobile-nav|breadcrumbs?|cookie|consent)[^"']*["'])[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ');
}

function countWords(value) {
  const text = textOnly(value);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function inspectStructuredData(value, output) {
  if (Array.isArray(value)) {
    value.forEach((item) => inspectStructuredData(item, output));
    return;
  }
  if (!value || typeof value !== 'object') return;

  const type = value['@type'];
  if (typeof type === 'string') output.types.add(type);
  if (Array.isArray(type)) type.filter((x) => typeof x === 'string').forEach((x) => output.types.add(x));

  if (Object.prototype.hasOwnProperty.call(value, 'author') || Object.prototype.hasOwnProperty.call(value, 'creator')) {
    output.hasAuthorProperty = true;
    const author = value.author ?? value.creator;
    const addName = (candidate) => {
      if (typeof candidate === 'string' && candidate.trim()) output.authorNames.add(candidate.trim());
      if (candidate && typeof candidate === 'object' && typeof candidate.name === 'string' && candidate.name.trim()) output.authorNames.add(candidate.name.trim());
    };
    if (Array.isArray(author)) author.forEach(addName); else addName(author);
  }

  if (Object.prototype.hasOwnProperty.call(value, 'mainEntity') || Object.prototype.hasOwnProperty.call(value, 'mainEntityOfPage')) output.hasMainEntityProperty = true;
  if (Object.prototype.hasOwnProperty.call(value, 'datePublished')) output.hasDatePublished = true;
  if (Object.prototype.hasOwnProperty.call(value, 'dateModified')) output.hasDateModified = true;

  const types = Array.isArray(type) ? type : (typeof type === 'string' ? [type] : []);
  if (types.some((entry) => /^(?:Organization|LocalBusiness|MedicalBusiness|MedicalClinic|Physician)$/i.test(String(entry)))) {
    output.organizationCount += 1;
    if (typeof value.name === 'string' && value.name.trim()) {
      output.organizationHasName = true;
      output.organizationNames.add(value.name.trim());
    }
    if (typeof value.url === 'string' && value.url.trim()) {
      output.organizationHasUrl = true;
      output.organizationUrls.add(value.url.trim());
    }
    if (value.logo) output.organizationHasLogo = true;
    const sameAs = value.sameAs;
    const sameAsValues = typeof sameAs === 'string' ? [sameAs] : (Array.isArray(sameAs) ? sameAs : []);
    for (const item of sameAsValues) if (typeof item === 'string' && item.trim()) output.organizationSameAs.add(item.trim());
    if (output.organizationSameAs.size) output.organizationHasSameAs = true;
  }

  if (types.some((entry) => /^Person$/i.test(String(entry)))) {
    output.personEntityCount += 1;
    if (typeof value.name === 'string' && value.name.trim()) output.personNames.add(value.name.trim());
    if (typeof value.url === 'string' && value.url.trim()) output.personUrls.add(value.url.trim());
  }

  for (const nested of Object.values(value)) inspectStructuredData(nested, output);
}

function innerBody(clean) {
  const bodyMatch = clean.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);
  return bodyMatch ? bodyMatch[1] : clean;
}

function largestRegion(html, tagName) {
  const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}\\s*>`, 'gi');
  let winner = null;
  for (const match of html.matchAll(regex)) {
    const words = countWords(match[1]);
    if (!winner || words > winner.words) winner = { html: match[1], words };
  }
  return winner;
}

function selectPrimaryRegion(clean) {
  const body = innerBody(clean);
  const visible = stripHiddenBlocks(body);
  const main = largestRegion(visible, 'main');
  if (main && main.words >= 25) return { source: 'main', html: stripBoilerplateBlocks(main.html) };
  const article = largestRegion(visible, 'article');
  if (article && article.words >= 25) return { source: 'article', html: stripBoilerplateBlocks(article.html) };
  return { source: 'body-minus-boilerplate', html: stripBoilerplateBlocks(visible) };
}

function collectRegion(html, tagName) {
  const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}\\s*>`, 'gi');
  return [...html.matchAll(regex)].map((m) => m[1]).join(' ');
}

function normalizeHost(hostname) {
  return String(hostname || '').toLowerCase().replace(/^www\./, '');
}

function linkAnchorLabel(tag, innerHtml) {
  const visible = textOnly(innerHtml).slice(0, 180);
  if (visible) return visible;
  const aria = getAttr(tag, 'aria-label');
  if (aria) return aria.slice(0, 180);
  const title = getAttr(tag, 'title');
  if (title) return title.slice(0, 180);
  const imageTag = String(innerHtml || '').match(/<img\b[^>]*>/i)?.[0] || '';
  const alt = imageTag ? getAttr(imageTag, 'alt') : null;
  return alt ? alt.slice(0, 180) : '';
}

function linkPlacementAt(html, index) {
  const before = String(html || '').slice(0, Math.max(0, index)).toLowerCase();
  const inside = (tag) => before.lastIndexOf(`<${tag}`) > before.lastIndexOf(`</${tag}`);
  if (inside('footer')) return 'footer';
  if (inside('nav')) return inside('header') ? 'header-navigation' : 'navigation';
  if (inside('header')) return 'header';
  if (inside('aside')) return 'sidebar';
  if (inside('main') || inside('article')) return 'main-content';
  return 'body';
}

function analyzeLinks(regionHtml, baseUrl) {
  const base = new URL(baseUrl);
  const internal = new Map();
  const external = new Map();
  const internalOccurrences = [];
  let emptyHrefLinks = 0;

  for (const match of regionHtml.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)) {
    const tag = `<a${match[1]}>`;
    const href = getAttr(tag, 'href');
    const anchor = linkAnchorLabel(tag, match[2]);
    if (!href || href === '#' || href.toLowerCase().startsWith('javascript:')) { emptyHrefLinks++; continue; }
    try {
      const linked = new URL(href, base);
      if (!['http:', 'https:'].includes(linked.protocol)) continue;
      linked.hash = '';
      const key = linked.toString();
      if (normalizeHost(linked.hostname) === normalizeHost(base.hostname)) {
        if (!internal.has(key)) internal.set(key, anchor);
        internalOccurrences.push({ href:key, anchor, placement:linkPlacementAt(regionHtml, match.index || 0) });
      } else if (!external.has(key)) external.set(key, anchor);
    } catch {}
  }

  return {
    internalLinks: internal.size,
    externalLinks: external.size,
    emptyHrefLinks,
    internalHrefs: [...internal.keys()],
    externalHrefs: [...external.keys()],
    internalLinkDetails: [...internal.entries()].map(([href, anchor]) => ({ href, anchor })),
    internalLinkOccurrences: internalOccurrences,
    externalLinkDetails: [...external.entries()].map(([href, anchor]) => ({ href, anchor }))
  };
}

function headingsIn(html) {
  const headings = [];
  for (const match of String(html || '').matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi)) {
    const text = textOnly(match[2]);
    if (text) headings.push({ level:Number(match[1]), text });
  }
  return headings;
}

function microdataTypes(html) {
  const output = new Set();
  for (const tag of String(html || '').match(/<[a-z0-9:-]+\b[^>]*itemtype\s*=\s*(?:"[^"]+"|'[^']+'|[^\s>]+)[^>]*>/gi) || []) {
    const raw = getAttr(tag, 'itemtype');
    if (!raw) continue;
    for (const token of raw.split(/\s+/)) {
      const match = token.match(/schema\.org\/([^/#?]+)/i);
      if (match) output.add(match[1]);
    }
  }
  return output;
}

function isQuestionHeading(text) {
  const value = String(text || '').trim();
  return /\?$/.test(value) || /^(?:who|what|when|where|why|how|can|could|do|does|did|is|are|should|will|which)\b/i.test(value);
}

function isGenericAnchor(text) {
  const value = String(text || '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.!?:]+$/g, '');
  if (!value) return true;
  return /^(?:read more|learn more|click here|here|more|details|view more|see more|discover more|find out more|get started|explore|continue reading|continue|visit page|this page|go|link)$/.test(value);
}

function anchorQuality(linkDetails = []) {
  const generic = linkDetails.filter((item) => isGenericAnchor(item.anchor));
  const total = linkDetails.length;
  return {
    total,
    genericCount:generic.length,
    genericRatio:total ? generic.length / total : 0,
    genericExamples:generic.slice(0, 6)
  };
}


const SOURCE_HOST_PATTERNS = [
  /(^|\.)doi\.org$/i,
  /(^|\.)ncbi\.nlm\.nih\.gov$/i,
  /(^|\.)nih\.gov$/i,
  /(^|\.)cdc\.gov$/i,
  /(^|\.)fda\.gov$/i,
  /(^|\.)clinicaltrials\.gov$/i,
  /(^|\.)who\.int$/i,
  /(^|\.)europa\.eu$/i,
  /(^|\.)arxiv\.org$/i,
  /(^|\.)crossref\.org$/i,
  /(^|\.)jamanetwork\.com$/i,
  /(^|\.)nejm\.org$/i,
  /(^|\.)bmj\.com$/i,
  /(^|\.)cochranelibrary\.com$/i,
  /(^|\.)nature\.com$/i,
  /(^|\.)science\.org$/i,
  /(^|\.)sciencedirect\.com$/i,
  /(^|\.)springer\.com$/i,
  /(^|\.)wiley\.com$/i,
  /(^|\.)ieee\.org$/i,
  /(^|\.)acm\.org$/i,
  /(^|\.)nist\.gov$/i,
  /(^|\.)ietf\.org$/i,
  /(^|\.)w3\.org$/i,
  /(^|\.)rfc-editor\.org$/i
];

const NON_CITATION_HOST_PATTERNS = [
  /(^|\.)(?:facebook|instagram|linkedin|tiktok|pinterest|youtube)\.com$/i,
  /(^|\.)youtu\.be$/i,
  /(^|\.)x\.com$/i,
  /(^|\.)twitter\.com$/i,
  /(^|\.)yelp\.com$/i,
  /(^|\.)calendly\.com$/i
];

function sourceLikeExternalLink(detail) {
  let url;
  try { url = new URL(detail?.href); } catch { return null; }
  const host = url.hostname.toLowerCase();
  const anchor = String(detail?.anchor || '').toLowerCase();
  const path = `${url.pathname} ${url.search}`.toLowerCase();
  if (NON_CITATION_HOST_PATTERNS.some((pattern) => pattern.test(host))) return null;
  if (/\.gov$/i.test(host)) return 'government source';
  if (/\.edu$/i.test(host)) return 'academic source';
  if (SOURCE_HOST_PATTERNS.some((pattern) => pattern.test(host))) return 'recognized research/standards source';
  const cue = /\b(?:study|research|report|dataset|data source|source|citation|reference|evidence|guideline|paper|journal|documentation|specification|standard|clinical trial|survey|white ?paper|publication|statistics|methodology)\b/i;
  if (cue.test(anchor)) return 'source-like anchor text';
  if (cue.test(path) && !/\b(?:about|contact|pricing|product|service|shop|book|schedule)\b/i.test(path)) return 'source-like destination path';
  return null;
}

function classifySourceLikeLinks(linkDetails = []) {
  return linkDetails.map((detail) => {
    const reason = sourceLikeExternalLink(detail);
    return reason ? { ...detail, reason } : null;
  }).filter(Boolean);
}

function authorProfileLinks(html, baseUrl) {
  const output = [];
  const seen = new Set();
  for (const match of String(html || '').matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)) {
    const tag = `<a${match[1]}>`;
    const href = getAttr(tag, 'href');
    if (!href) continue;
    const rel = String(getAttr(tag, 'rel') || '').toLowerCase().split(/\s+/);
    let linked;
    try { linked = new URL(href, baseUrl); } catch { continue; }
    if (!['http:','https:'].includes(linked.protocol)) continue;
    const path = linked.pathname.toLowerCase();
    const explicit = rel.includes('author') || /\/(?:author|authors)\//.test(path);
    if (!explicit) continue;
    linked.hash = '';
    const key = linked.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({ href:key, anchor:textOnly(match[2]).slice(0, 160) });
  }
  return output;
}

function headingLevelJumps(headings = []) {
  let jumps = 0;
  for (let i = 1; i < headings.length; i++) {
    if (Number(headings[i].level) - Number(headings[i - 1].level) > 1) jumps++;
  }
  return jumps;
}

function hasVisibleBreadcrumbSignal(html) {
  return /<(?:nav|ol|ul|div)\b[^>]*(?:aria-label\s*=\s*["'][^"']*breadcrumb|(?:class|id)\s*=\s*["'][^"']*breadcrumb)[^>]*>/i.test(String(html || ''));
}

function visibleAuthorSignal(html, metaAuthor) {
  if (metaAuthor) return true;
  if (/<a\b[^>]*\brel\s*=\s*["'][^"']*\bauthor\b[^"']*["'][^>]*>/i.test(html)) return true;
  if (/<[a-z0-9:-]+\b[^>]*\bitemprop\s*=\s*["'][^"']*\bauthor\b[^"']*["'][^>]*>/i.test(html)) return true;
  if (/(?:class|id)\s*=\s*["'][^"']*(?:post-author|article-author|byline|author-name)[^"']*["']/i.test(html)) return true;
  return false;
}


function analyzeImages(html) {
  const images = [];
  let missingAlt = 0;
  let emptyAlt = 0;
  let genericAlt = 0;
  let missingDimensions = 0;
  const genericPattern = /^(?:image|photo|picture|graphic|icon|logo|img(?:age)?[\s_-]*\d*|untitled|placeholder|featured image)$/i;
  for (const tag of String(html || '').match(/<img\b[^>]*>/gi) || []) {
    const src = getAttr(tag, 'src') || getAttr(tag, 'data-src') || '';
    const alt = getAttr(tag, 'alt');
    const width = getAttr(tag, 'width');
    const height = getAttr(tag, 'height');
    const missingAltAttr = alt === null;
    const emptyAltValue = alt !== null && !String(alt).trim();
    const genericAltValue = alt !== null && String(alt).trim() && genericPattern.test(String(alt).trim());
    if (missingAltAttr) missingAlt++;
    if (emptyAltValue) emptyAlt++;
    if (genericAltValue) genericAlt++;
    if (!width || !height) missingDimensions++;
    images.push({ src, alt, missingAlt:missingAltAttr, emptyAlt:emptyAltValue, genericAlt:genericAltValue, hasDimensions:Boolean(width && height) });
  }
  return { total:images.length, missingAlt, emptyAlt, genericAlt, missingDimensions, examples:images.filter((item) => item.missingAlt || item.genericAlt).slice(0,6) };
}

function validHreflangValue(value) {
  const v = String(value || '').trim();
  if (!v) return false;
  if (/^x-default$/i.test(v)) return true;
  return /^[a-z]{2,3}(?:-[A-Za-z]{4})?(?:-(?:[A-Za-z]{2}|[0-9]{3}))?$/i.test(v);
}

function normalizedCompare(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function analyzeHtml(html, baseUrl) {
  const clean = stripNonContent(html);
  const body = innerBody(clean);
  const visibleBody = stripHiddenBlocks(body);
  const titleMatches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)];
  const title = titleMatches.length ? textOnly(titleMatches[0][1]) || null : null;
  const titleCount = titleMatches.length;

  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  let metaDescription = null;
  let metaDescriptionCount = 0;
  let metaAuthor = null;
  let viewport = null;
  let charset = null;
  const openGraph = { title:null, description:null, image:null };
  const twitter = { card:null, title:null, description:null, image:null };
  const metaRobots = [];
  for (const tag of metaTags) {
    const name = (getAttr(tag, 'name') || '').toLowerCase();
    const property = (getAttr(tag, 'property') || '').toLowerCase();
    const content = getAttr(tag, 'content');
    if (name === 'description') { metaDescriptionCount++; if (!metaDescription) metaDescription = content || null; }
    if (name === 'viewport' && !viewport) viewport = content || null;
    if (name === 'twitter:card' && !twitter.card) twitter.card = content || null;
    if (name === 'twitter:title' && !twitter.title) twitter.title = content || null;
    if (name === 'twitter:description' && !twitter.description) twitter.description = content || null;
    if (name === 'twitter:image' && !twitter.image) twitter.image = content || null;
    if (property === 'og:title' && !openGraph.title) openGraph.title = content || null;
    if (property === 'og:description' && !openGraph.description) openGraph.description = content || null;
    if (property === 'og:image' && !openGraph.image) openGraph.image = content || null;
    if (name === 'author' && !metaAuthor) metaAuthor = content || null;
    if ((name === 'robots' || name === 'googlebot') && content) {
      metaRobots.push(...content.toLowerCase().split(/[,;]/).map((x) => x.trim()).filter(Boolean));
    }
    if (property === 'article:author' && !metaAuthor) metaAuthor = content || null;
    const directCharset = getAttr(tag, 'charset');
    if (directCharset && !charset) charset = directCharset;
    if (name === 'charset' && content && !charset) charset = content;
  }

  let canonical = null;
  const hreflang = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = (getAttr(tag, 'rel') || '').toLowerCase().split(/\s+/);
    if (rel.includes('canonical') && !canonical) canonical = getAttr(tag, 'href');
    if (rel.includes('alternate')) {
      const langValue = getAttr(tag, 'hreflang');
      const hrefValue = getAttr(tag, 'href');
      if (langValue) hreflang.push({ hreflang:langValue, href:hrefValue || null, valid:validHreflangValue(langValue) });
    }
  }

  const headings = headingsIn(clean);
  const h1s = headings.filter((h) => h.level === 1).map((h) => h.text);
  const headingElementMatches = [...clean.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi)];
  const h1ElementCount = headingElementMatches.filter((m) => Number(m[1]) === 1).length;
  const emptyHeadingCount = headingElementMatches.filter((m) => !textOnly(m[2])).length;
  const emptyH1Count = headingElementMatches.filter((m) => Number(m[1]) === 1 && !textOnly(m[2])).length;

  const allLinks = analyzeLinks(visibleBody, baseUrl);
  const primary = selectPrimaryRegion(clean);
  const primaryLinks = analyzeLinks(primary.html, baseUrl);
  const primaryHeadings = headingsIn(primary.html);
  const navHtml = `${collectRegion(visibleBody, 'nav')} ${collectRegion(visibleBody, 'header')}`;
  const footerHtml = collectRegion(visibleBody, 'footer');
  const navLinks = analyzeLinks(navHtml, baseUrl);
  const footerLinks = analyzeLinks(footerHtml, baseUrl);

  const structuredSignals = {
    types:new Set(),
    hasAuthorProperty:false,
    authorNames:new Set(),
    hasMainEntityProperty:false,
    hasDatePublished:false,
    hasDateModified:false,
    organizationCount:0,
    organizationHasName:false,
    organizationHasUrl:false,
    organizationHasLogo:false,
    organizationHasSameAs:false,
    organizationNames:new Set(),
    organizationUrls:new Set(),
    organizationSameAs:new Set(),
    personEntityCount:0,
    personNames:new Set(),
    personUrls:new Set()
  };
  let invalidJsonLdBlocks = 0;
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const openTag = `<script${match[1]}>`;
    const type = (getAttr(openTag, 'type') || '').toLowerCase();
    if (type !== 'application/ld+json') continue;
    const raw = match[2].trim();
    if (!raw) continue;
    try { inspectStructuredData(JSON.parse(raw), structuredSignals); }
    catch { invalidJsonLdBlocks++; }
  }

  const structuredDataTypes = new Set([...structuredSignals.types, ...microdataTypes(html)]);
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] || '';
  const imageSignals = analyzeImages(primary.html);
  const invalidHreflang = hreflang.filter((item) => !item.valid);
  const hreflangValues = hreflang.map((item) => String(item.hreflang).toLowerCase());
  const duplicateHreflangValues = [...new Set(hreflangValues.filter((value, index) => hreflangValues.indexOf(value) !== index))];
  const titleMetaSame = Boolean(title && metaDescription && normalizedCompare(title) === normalizedCompare(metaDescription));
  const paragraphs = (primary.html.match(/<p\b[^>]*>[\s\S]*?<\/p\s*>/gi) || [])
    .map((p) => countWords(p))
    .filter((words) => words >= 4);
  const primaryParagraphCount = paragraphs.length;
  const primaryLongestParagraphWords = paragraphs.length ? Math.max(...paragraphs) : 0;
  const primaryAverageParagraphWords = paragraphs.length ? Math.round(paragraphs.reduce((a,b) => a + b, 0) / paragraphs.length) : 0;
  const primaryQuestionHeadingCount = primaryHeadings.filter((h) => h.level >= 2 && isQuestionHeading(h.text)).length;
  const primaryListItemCount = (primary.html.match(/<li\b[^>]*>[\s\S]*?<\/li\s*>/gi) || []).filter((item) => countWords(item) >= 2).length;
  const primaryTableCount = (primary.html.match(/<table\b[^>]*>[\s\S]*?<\/table\s*>/gi) || []).length;
  const visibleAuthor = visibleAuthorSignal(html, metaAuthor);
  const hasAuthorSignal = visibleAuthor || structuredSignals.hasAuthorProperty || [...structuredDataTypes].some((type) => String(type).toLowerCase() === 'person');
  const primaryAnchorQuality = anchorQuality(primaryLinks.internalLinkDetails);
  const primaryHeadingLevelJumps = headingLevelJumps(primaryHeadings);
  const primarySourceLikeExternalLinkDetails = classifySourceLikeLinks(primaryLinks.externalLinkDetails);
  const detectedAuthorProfileLinks = authorProfileLinks(primary.html, baseUrl);

  return {
    title,
    titleCount,
    titleLength:title ? title.length : 0,
    metaDescription,
    metaDescriptionCount,
    metaDescriptionLength:metaDescription ? metaDescription.length : 0,
    titleMetaSame,
    viewport,
    charset,
    openGraph,
    twitter,
    metaAuthor,
    metaRobots,
    canonical,
    h1s,
    h1ElementCount,
    emptyH1Count,
    emptyHeadingCount,
    headings,
    wordCount: countWords(visibleBody),
    primaryWordCount: countWords(primary.html),
    primarySource: primary.source,
    primaryHeadings,
    primarySubheadingCount: primaryHeadings.filter((h) => h.level >= 2).length,
    primaryQuestionHeadingCount,
    primaryParagraphCount,
    primaryAverageParagraphWords,
    primaryLongestParagraphWords,
    primaryListItemCount,
    primaryTableCount,
    totalLinks: allLinks.internalLinks + allLinks.externalLinks + allLinks.emptyHrefLinks,
    internalLinks: allLinks.internalLinks,
    externalLinks: allLinks.externalLinks,
    emptyHrefLinks: allLinks.emptyHrefLinks,
    internalHrefs: allLinks.internalHrefs,
    internalLinkDetails: allLinks.internalLinkDetails,
    internalLinkOccurrences: allLinks.internalLinkOccurrences,
    primaryInternalLinks: primaryLinks.internalLinks,
    primaryExternalLinks: primaryLinks.externalLinks,
    primaryExternalHrefs: primaryLinks.externalHrefs,
    primaryExternalLinkDetails: primaryLinks.externalLinkDetails,
    primarySourceLikeExternalLinks: primarySourceLikeExternalLinkDetails.length,
    primarySourceLikeExternalLinkDetails,
    primaryInternalHrefs: primaryLinks.internalHrefs,
    primaryInternalLinkDetails: primaryLinks.internalLinkDetails,
    primaryInternalGenericAnchorCount: primaryAnchorQuality.genericCount,
    primaryInternalGenericAnchorRatio: primaryAnchorQuality.genericRatio,
    primaryInternalGenericAnchorExamples: primaryAnchorQuality.genericExamples,
    primaryHeadingLevelJumps,
    navigationInternalLinks: navLinks.internalLinks,
    footerInternalLinks: footerLinks.internalLinks,
    jsonLdTypes: [...structuredSignals.types].sort(),
    structuredDataTypes: [...structuredDataTypes].sort(),
    structuredDataHasAuthor: structuredSignals.hasAuthorProperty,
    structuredDataAuthorNames: [...structuredSignals.authorNames].sort(),
    structuredDataHasMainEntity: structuredSignals.hasMainEntityProperty,
    structuredDataHasDatePublished: structuredSignals.hasDatePublished,
    structuredDataHasDateModified: structuredSignals.hasDateModified,
    organizationEntityCount: structuredSignals.organizationCount,
    organizationEntityHasName: structuredSignals.organizationHasName,
    organizationEntityHasUrl: structuredSignals.organizationHasUrl,
    organizationEntityHasLogo: structuredSignals.organizationHasLogo,
    organizationEntityHasSameAs: structuredSignals.organizationHasSameAs,
    organizationEntityNames: [...structuredSignals.organizationNames].sort(),
    organizationEntityUrls: [...structuredSignals.organizationUrls].sort(),
    organizationEntitySameAs: [...structuredSignals.organizationSameAs].sort(),
    personEntityCount: structuredSignals.personEntityCount,
    personEntityNames: [...structuredSignals.personNames].sort(),
    personEntityUrls: [...structuredSignals.personUrls].sort(),
    hasAuthorSignal,
    authorProfileLinks: detectedAuthorProfileLinks,
    hasAuthorProfileLink: detectedAuthorProfileLinks.length > 0,
    hasVisibleBreadcrumbs: hasVisibleBreadcrumbSignal(visibleBody),
    invalidJsonLdBlocks,
    lang: getAttr(htmlTag, 'lang') || null,
    imagesTotal:imageSignals.total,
    imagesMissingAlt:imageSignals.missingAlt,
    imagesEmptyAlt:imageSignals.emptyAlt,
    imagesGenericAlt:imageSignals.genericAlt,
    imagesMissingDimensions:imageSignals.missingDimensions,
    imageAltExamples:imageSignals.examples,
    hreflang,
    hreflangCount:hreflang.length,
    invalidHreflangCount:invalidHreflang.length,
    invalidHreflang,
    duplicateHreflangValues
  };
}
