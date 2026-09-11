import { classifyUrlType } from './page-type.mjs';

function normalizeComparableUrl(value, base) {
  try {
    const url = new URL(value, base);
    url.hash = '';
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch { return null; }
}

function pct(numerator, denominator) {
  return denominator ? Math.round(100 * numerator / denominator) : 0;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function median(values) {
  const nums = values.map(Number).filter(Number.isFinite).sort((a,b) => a-b);
  if (!nums.length) return 0;
  const middle = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[middle] : Math.round((nums[middle - 1] + nums[middle]) / 2);
}

function evidenceUrl(label, url, extra = '') {
  return { label, value:extra ? `${extra} - ${url}` : url, url };
}

export function buildRelationshipGraph(pages = [], sitemapEntries = []) {
  const usablePages = pages.filter((page) => page?.usable);
  const sourceMap = new Map();
  const typeMap = new Map();

  for (const entry of sitemapEntries || []) {
    const key = normalizeComparableUrl(entry?.url);
    if (!key) continue;
    sourceMap.set(key, entry?.sourceSitemap || '');
    typeMap.set(key, classifyUrlType(entry.url, entry?.sourceSitemap || ''));
  }
  for (const page of usablePages) {
    const key = normalizeComparableUrl(page.finalUrl || page.requestedUrl);
    if (!key) continue;
    typeMap.set(key, page.pageType || classifyUrlType(page.finalUrl || page.requestedUrl, page.sourceSitemap || ''));
  }

  const incoming = new Map();
  const incomingSources = new Map();
  const edges = [];
  const seenEdges = new Set();
  const sourceMetrics = [];

  for (const page of usablePages) {
    const sourceUrl = normalizeComparableUrl(page.finalUrl || page.requestedUrl);
    if (!sourceUrl) continue;
    const sourceType = page.pageType || typeMap.get(sourceUrl) || 'other';
    const hrefs = unique((page.primaryInternalHrefs || []).map((href) => normalizeComparableUrl(href, sourceUrl)));
    const targets = [];

    for (const targetUrl of hrefs) {
      if (!targetUrl || targetUrl === sourceUrl) continue;
      const targetType = typeMap.get(targetUrl) || classifyUrlType(targetUrl, sourceMap.get(targetUrl) || '');
      const edgeKey = `${sourceUrl}=>${targetUrl}`;
      if (!seenEdges.has(edgeKey)) {
        seenEdges.add(edgeKey);
        edges.push({ sourceUrl, sourceType, targetUrl, targetType });
        incoming.set(targetUrl, (incoming.get(targetUrl) || 0) + 1);
        if (!incomingSources.has(targetUrl)) incomingSources.set(targetUrl, new Set());
        incomingSources.get(targetUrl).add(sourceUrl);
      }
      targets.push({ url:targetUrl, type:targetType });
    }

    sourceMetrics.push({
      url:sourceUrl,
      pageType:sourceType,
      primaryWordCount:Number(page.primaryWordCount || 0),
      primaryInternalLinks:Number(page.primaryInternalLinks || hrefs.length || 0),
      primaryExternalLinks:Number(page.primaryExternalLinks || 0),
      primarySourceLikeExternalLinks:Number(page.primarySourceLikeExternalLinks || 0),
      primarySourceLikeExternalLinkDetails:page.primarySourceLikeExternalLinkDetails || [],
      hasAuthorSignal:Boolean(page.hasAuthorSignal),
      hasAuthorProfileLink:Boolean(page.hasAuthorProfileLink),
      structuredDataHasAuthor:Boolean(page.structuredDataHasAuthor),
      linksToCommercial:targets.filter((target) => ['service','location','product'].includes(target.type)).length,
      linksToArticles:targets.filter((target) => target.type === 'article').length,
      linksToServices:targets.filter((target) => target.type === 'service').length
    });
  }

  for (const page of sourceMetrics) {
    page.contextualInboundCount = incoming.get(page.url) || 0;
    page.contextualInboundSources = [...(incomingSources.get(page.url) || [])];
  }

  const articleSources = sourceMetrics.filter((page) => page.pageType === 'article');
  const serviceSources = sourceMetrics.filter((page) => page.pageType === 'service');
  const commercialSources = sourceMetrics.filter((page) => ['service','location','product'].includes(page.pageType));
  const articlesLinkingCommercial = articleSources.filter((page) => page.linksToCommercial > 0);
  const servicesLinkingArticles = serviceSources.filter((page) => page.linksToArticles > 0);
  const servicesLinkingServices = serviceSources.filter((page) => page.linksToServices > 0);
  const articlesWithExternalReferences = articleSources.filter((page) => page.primaryExternalLinks > 0);
  const articlesWithSourceLikeCitations = articleSources.filter((page) => page.primarySourceLikeExternalLinks > 0);
  const articlesWithAuthorSignals = articleSources.filter((page) => page.hasAuthorSignal);
  const articlesWithAuthorProfiles = articleSources.filter((page) => page.hasAuthorProfileLink);
  const articlesWithStructuredAuthor = articleSources.filter((page) => page.structuredDataHasAuthor);

  const substantialTargets = sourceMetrics.filter((page) => !['home','company'].includes(page.pageType) && page.primaryWordCount >= 250);
  const noContextualInbound = substantialTargets.filter((page) => page.contextualInboundCount === 0);
  const commercialSubstantial = commercialSources.filter((page) => page.primaryWordCount >= 200);
  const lowInboundCommercial = commercialSubstantial.filter((page) => page.contextualInboundCount <= 1);

  const typeCounts = sourceMetrics.reduce((acc, page) => {
    acc[page.pageType] = (acc[page.pageType] || 0) + 1;
    return acc;
  }, {});

  const inboundByType = {};
  for (const type of ['article','service','location','product','company','other']) {
    const typed = sourceMetrics.filter((page) => page.pageType === type);
    if (!typed.length) continue;
    inboundByType[type] = {
      count:typed.length,
      median:median(typed.map((page) => page.contextualInboundCount)),
      average:Number((typed.reduce((sum, page) => sum + page.contextualInboundCount, 0) / typed.length).toFixed(1)),
      zeroCount:typed.filter((page) => page.contextualInboundCount === 0).length,
      lowCount:typed.filter((page) => page.contextualInboundCount <= 1).length
    };
  }

  return {
    enabled:true,
    pageCount:pages.length,
    usablePageCount:usablePages.length,
    typeCounts,
    edges,
    edgeCount:edges.length,
    sourceMetrics,
    inboundByType,
    articleCount:articleSources.length,
    serviceCount:serviceSources.length,
    commercialCount:commercialSubstantial.length,
    articlesLinkingCommercial:articlesLinkingCommercial.length,
    articleCommercialPct:pct(articlesLinkingCommercial.length, articleSources.length),
    articlesWithoutCommercialLinks:articleSources.filter((page) => page.linksToCommercial === 0).map((page) => page.url),
    servicesLinkingArticles:servicesLinkingArticles.length,
    serviceArticlePct:pct(servicesLinkingArticles.length, serviceSources.length),
    servicesWithoutArticleLinks:serviceSources.filter((page) => page.linksToArticles === 0).map((page) => page.url),
    servicesLinkingServices:servicesLinkingServices.length,
    serviceServicePct:pct(servicesLinkingServices.length, serviceSources.length),
    servicesWithoutServiceLinks:serviceSources.filter((page) => page.linksToServices === 0).map((page) => page.url),
    articlesWithExternalReferences:articlesWithExternalReferences.length,
    articleExternalReferencePct:pct(articlesWithExternalReferences.length, articleSources.length),
    articlesWithSourceLikeCitations:articlesWithSourceLikeCitations.length,
    articleSourceLikeCitationPct:pct(articlesWithSourceLikeCitations.length, articleSources.length),
    articlesWithoutSourceLikeCitations:articleSources.filter((page) => page.primarySourceLikeExternalLinks === 0).map((page) => page.url),
    sourceLikeCitationExamples:articlesWithSourceLikeCitations.flatMap((page) => (page.primarySourceLikeExternalLinkDetails || []).map((link) => ({ sourceUrl:page.url, ...link }))).slice(0, 8),
    articlesWithAuthorSignals:articlesWithAuthorSignals.length,
    articleAuthorSignalPct:pct(articlesWithAuthorSignals.length, articleSources.length),
    articlesWithAuthorProfiles:articlesWithAuthorProfiles.length,
    articleAuthorProfilePct:pct(articlesWithAuthorProfiles.length, articleSources.length),
    articlesWithStructuredAuthor:articlesWithStructuredAuthor.length,
    articleStructuredAuthorPct:pct(articlesWithStructuredAuthor.length, articleSources.length),
    substantialTargetCount:substantialTargets.length,
    noContextualInboundCount:noContextualInbound.length,
    noContextualInboundPct:pct(noContextualInbound.length, substantialTargets.length),
    noContextualInboundExamples:noContextualInbound.slice(0, 8).map((page) => ({ url:page.url, pageType:page.pageType, inbound:page.contextualInboundCount })),
    lowInboundCommercialCount:lowInboundCommercial.length,
    lowInboundCommercialPct:pct(lowInboundCommercial.length, commercialSubstantial.length),
    lowInboundCommercialExamples:lowInboundCommercial.slice(0, 8).map((page) => ({ url:page.url, pageType:page.pageType, inbound:page.contextualInboundCount })),
    sitemapContextualTargets:unique(edges.map((edge) => edge.targetUrl).filter((url) => typeMap.has(url))).length
  };
}

export function makeRelationshipFindings(graph) {
  if (!graph?.enabled) return [];
  const findings = [];
  const opportunity = (finding) => findings.push({ findingType:'opportunity', scope:'site', ...finding });

  if (graph.articleCount >= 4 && graph.articleCommercialPct <= 35) {
    opportunity({
      id:'relationship-article-commercial-pathways',
      title:'Sampled articles rarely link contextually to service or conversion pages',
      category:'content-pathways', severity:'medium', confidence:'manual-review', score:64,
      whyItMatters:'Editorial content can help users and crawlers move from informational topics into relevant commercial pages when there is a genuine relationship. A weak article-to-service pathway can leave useful authority and discovery connections underdeveloped, but every article does not need a sales link.',
      recommendation:'Review the sampled articles for natural opportunities to connect readers to relevant services, locations, or product pages. Add links only where they genuinely help someone continue the journey.',
      videoTalkingPoint:`In the expanded link sample, only ${graph.articlesLinkingCommercial} of ${graph.articleCount} articles link contextually to a service, location, or product page. I would review whether the educational content is doing enough to connect people and crawlers to the parts of the site that actually drive the next step.`,
      evidence:[
        { label:'Articles analyzed', value:String(graph.articleCount) },
        { label:'Articles linking to commercial pages', value:`${graph.articlesLinkingCommercial} (${graph.articleCommercialPct}%)` },
        ...graph.articlesWithoutCommercialLinks.slice(0, 3).map((url, index) => evidenceUrl(`Review article ${index + 1}`, url))
      ]
    });
  }

  if (graph.serviceCount >= 4 && graph.serviceArticlePct <= 35) {
    opportunity({
      id:'relationship-service-supporting-content',
      title:'Sampled service pages rarely connect to supporting editorial content',
      category:'content-pathways', severity:'medium', confidence:'manual-review', score:57,
      whyItMatters:'Relevant guides, FAQs, research, and articles can give a service page useful supporting context and create stronger internal pathways between commercial and informational content. This is an architecture opportunity, not a requirement that every service page link to a blog post.',
      recommendation:'Check whether important service pages have genuinely useful supporting resources that answer deeper questions. Where those resources exist, consider contextual links in both directions.',
      videoTalkingPoint:`Only ${graph.servicesLinkingArticles} of ${graph.serviceCount} service pages in the expanded sample link contextually to an article. I would look at whether the service and educational content could support each other more intentionally.`,
      evidence:[
        { label:'Service pages analyzed', value:String(graph.serviceCount) },
        { label:'Services linking to articles', value:`${graph.servicesLinkingArticles} (${graph.serviceArticlePct}%)` },
        ...graph.servicesWithoutArticleLinks.slice(0, 3).map((url, index) => evidenceUrl(`Review service ${index + 1}`, url))
      ]
    });
  }

  if (graph.serviceCount >= 5 && graph.serviceServicePct <= 30) {
    opportunity({
      id:'relationship-service-crosslinks',
      title:'Related-service pathways appear limited in the expanded crawl',
      category:'internal-discovery', severity:'low', confidence:'manual-review', score:50,
      whyItMatters:'Contextual links between genuinely related services can clarify how offerings fit together and create additional crawl paths beyond global navigation. Some services are intentionally standalone, so this should be reviewed for relevance rather than treated as a blanket requirement.',
      recommendation:'Look at the sampled service pages in context and identify whether adjacent, complementary, or prerequisite services deserve natural in-copy links.',
      videoTalkingPoint:`In the expanded crawl, ${graph.servicesLinkingServices} of ${graph.serviceCount} service pages link contextually to another service page. I would review whether there are useful related-service connections that are currently left to the main navigation alone.`,
      evidence:[
        { label:'Service pages analyzed', value:String(graph.serviceCount) },
        { label:'Services linking to another service', value:`${graph.servicesLinkingServices} (${graph.serviceServicePct}%)` },
        ...graph.servicesWithoutServiceLinks.slice(0, 2).map((url, index) => evidenceUrl(`Review service ${index + 1}`, url))
      ]
    });
  }

  if (graph.usablePageCount >= 20 && graph.substantialTargetCount >= 12 && graph.noContextualInboundPct >= 55) {
    opportunity({
      id:'relationship-expanded-inbound-coverage',
      title:'Many deeper pages receive no contextual inbound link from the expanded crawl',
      category:'internal-discovery', severity:'medium', confidence:'manual-review', score:60,
      whyItMatters:'This still is not proof that a page is orphaned because the crawl is intentionally sampled. It is a stronger signal than the small template sample, though, and can reveal sections that rely heavily on navigation, sitemap discovery, or links outside the sampled set.',
      recommendation:'Run a full internal-link crawl or inspect the affected templates before calling any page orphaned. Prioritize important pages that should naturally receive contextual links from related content.',
      videoTalkingPoint:`Across the expanded relationship crawl, about ${graph.noContextualInboundPct}% of the substantial deeper pages received no contextual link from another crawled page. I would not call those orphan pages yet, but it is a strong reason to inspect how those sections are being supported internally.`,
      evidence:[
        { label:'Substantial deeper pages', value:String(graph.substantialTargetCount) },
        { label:'No contextual inbound in crawl', value:`${graph.noContextualInboundCount} (${graph.noContextualInboundPct}%)` },
        ...graph.noContextualInboundExamples.slice(0, 3).map((item, index) => evidenceUrl(`Example ${index + 1}`, item.url, `${item.pageType} · ${item.inbound} inbound`))
      ]
    });
  }

  if (graph.commercialCount >= 5 && graph.lowInboundCommercialPct >= 50) {
    opportunity({
      id:'relationship-commercial-inbound-support',
      title:'Several commercial pages receive little contextual support in the expanded crawl',
      category:'content-pathways', severity:'medium', confidence:'manual-review', score:62,
      whyItMatters:'Commercial pages can be discoverable through navigation and XML sitemaps while still receiving relatively little contextual support from related content. A sampled crawl cannot prove weak authority flow, but it can identify pages worth checking in a full internal-link map.',
      recommendation:'Inspect the listed service, location, or product pages and identify relevant editorial or adjacent commercial pages that should naturally reference them. Verify with a full crawl before describing any page as isolated.',
      videoTalkingPoint:`About ${graph.lowInboundCommercialPct}% of the commercial pages in the expanded sample receive one or fewer contextual inbound links from the other crawled pages. I would use that as a shortlist for where the internal content network may not be supporting important conversion pages as well as it could.`,
      evidence:[
        { label:'Commercial pages analyzed', value:String(graph.commercialCount) },
        { label:'With 0-1 contextual inbound links', value:`${graph.lowInboundCommercialCount} (${graph.lowInboundCommercialPct}%)` },
        ...graph.lowInboundCommercialExamples.slice(0, 3).map((item, index) => evidenceUrl(`Review page ${index + 1}`, item.url, `${item.pageType} · ${item.inbound} inbound`))
      ]
    });
  }

  if (graph.articleCount >= 4 && graph.articleSourceLikeCitationPct <= 25) {
    opportunity({
      id:'relationship-editorial-citations',
      title:'Source-like supporting citations are uncommon across sampled articles',
      category:'source-quality', severity:'low', confidence:'manual-review', score:51,
      whyItMatters:'The scanner now distinguishes likely supporting sources from ordinary external links using destination and anchor cues such as government, academic, research, guideline, standards, and publication links. Not every article needs citations, but factual or research-led content should make important external evidence easy to verify.',
      recommendation:'Review the factual or research-heavy articles in the evidence list. Cite strong original or authoritative sources where a claim actually depends on external evidence; do not add links merely to satisfy the scanner.',
      videoTalkingPoint:graph.articlesWithSourceLikeCitations === 0
        ? `None of the ${graph.articleCount} sampled articles contain what the scanner recognizes as a source-like citation in the primary content. I would review the more factual pieces to see whether important claims are being supported with strong original sources.`
        : `Only ${graph.articlesWithSourceLikeCitations} of ${graph.articleCount} sampled articles contain what the scanner recognizes as a source-like citation in the primary content. I would review the more factual pieces to see whether important claims are being supported with strong original sources.`,
      evidence:[
        { label:'Articles analyzed', value:String(graph.articleCount) },
        { label:'With source-like citations', value:`${graph.articlesWithSourceLikeCitations} (${graph.articleSourceLikeCitationPct}%)` },
        ...graph.sourceLikeCitationExamples.slice(0, 2).map((item, index) => ({ label:`Counted source ${index + 1}`, value:`${item.reason} - ${item.href}`, url:item.href })),
        ...graph.articlesWithoutSourceLikeCitations.slice(0, 3).map((url, index) => evidenceUrl(`Review article ${index + 1}`, url))
      ]
    });
  }

  if (graph.articleCount >= 4 && graph.articleAuthorSignalPct >= 50 && graph.articleAuthorProfilePct <= 30) {
    opportunity({
      id:'relationship-author-profile-connections',
      title:'Article bylines are present, but explicit author-profile connections are limited',
      category:'entity-clarity', severity:'low', confidence:'manual-review', score:49,
      whyItMatters:'A visible byline is useful on its own. Linking that byline to a maintained author profile can make the relationship between content, expertise, and a real person more explicit for readers and machines, especially on expertise-sensitive topics.',
      recommendation:'Review whether article bylines should link to useful author profile pages that describe role, expertise, and related content. Do this only for real maintained author identities.',
      videoTalkingPoint:graph.articlesWithAuthorProfiles === 0
        ? `The sampled articles generally expose an author signal, but none of the ${graph.articleCount} sampled articles have an explicit author-profile link. I would review whether the site can connect editorial content to its authors more clearly.`
        : `The articles generally expose an author signal, but only ${graph.articlesWithAuthorProfiles} of ${graph.articleCount} in the sample have an explicit author-profile link. I would review whether the site can connect editorial content to its authors more clearly.`,
      evidence:[
        { label:'Articles with author signal', value:`${graph.articlesWithAuthorSignals} (${graph.articleAuthorSignalPct}%)` },
        { label:'Articles with author-profile link', value:`${graph.articlesWithAuthorProfiles} (${graph.articleAuthorProfilePct}%)` }
      ]
    });
  }

  return findings.sort((a,b) => b.score - a.score);
}
