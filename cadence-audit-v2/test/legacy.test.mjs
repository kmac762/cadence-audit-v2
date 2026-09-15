import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeHtml } from '../src/lib/analyze-html.mjs';
import { generateFindings } from '../src/lib/rules.mjs';
import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { isBlockedIp, normalizeHttpUrl } from '../src/lib/network-safety.mjs';
import { createPinnedLookup } from '../src/lib/safe-fetch.mjs';
import { assessRenderQuality, validateBrowserRequestUrl } from '../src/lib/render.mjs';
import { assessHttpAccess } from '../src/lib/access.mjs';
import { buildRelationshipGraph, makeRelationshipFindings } from '../src/lib/link-graph.mjs';
import { attachVerification, verificationForFinding } from '../src/lib/verification.mjs';
import { appendReviewDecision, normalizeReviewPayload } from '../src/lib/review-log.mjs';
import { createRateLimiter, createSessionToken, hostAllowed, parseCookies, passwordMatches, verifySessionToken } from '../src/lib/production-security.mjs';

test('HTML analyzer extracts core signals', () => {
  const html = `<!doctype html><html lang="en"><head><title>Demo Page</title><meta name="robots" content="index,follow"><link rel="canonical" href="https://example.com/demo"><script type="application/ld+json">{"@type":"Service"}</script></head><body><h1>Technical Demo</h1><p>${'useful content '.repeat(40)}</p><a href="/about">About</a><a href="https://other.com/">Other</a></body></html>`;
  const result = analyzeHtml(html, 'https://example.com/demo');
  assert.equal(result.title, 'Demo Page');
  assert.equal(result.h1s[0], 'Technical Demo');
  assert.equal(result.internalLinks, 1);
  assert.equal(result.externalLinks, 1);
  assert.deepEqual(result.jsonLdTypes, ['Service']);
});

test('network guard blocks common private ranges', () => {
  assert.equal(isBlockedIp('127.0.0.1'), true);
  assert.equal(isBlockedIp('10.0.0.8'), true);
  assert.equal(isBlockedIp('192.168.1.2'), true);
  assert.equal(isBlockedIp('8.8.8.8'), false);
  assert.equal(normalizeHttpUrl('example.com/path').toString(), 'https://example.com/path');
});

test('rule engine prioritizes noindex and canonical mismatch', () => {
  const facts = {
    requestedUrl:'https://example.com/a', finalUrl:'https://example.com/a', scannedAt:new Date().toISOString(), responseStatus:200,
    responseHeaders:{}, redirectChain:[],
    raw:{ title:'A', metaDescription:null, metaRobots:['noindex'], canonical:'https://example.com/b', h1s:['A'], headings:[], wordCount:200, totalLinks:0, internalLinks:0, externalLinks:0, emptyHrefLinks:0, jsonLdTypes:[], invalidJsonLdBlocks:0, lang:'en' },
    rendered:{ enabled:false, succeeded:false },
    robots:{ exists:true, status:200, url:'https://example.com/robots.txt', sitemaps:[], agents:{Googlebot:true,'OAI-SearchBot':true,GPTBot:true,ClaudeBot:true,PerplexityBot:true}, raw:'' }
  };
  const findings = generateFindings(facts);
  assert.equal(findings[0].id, 'noindex');
  assert.ok(findings.some((x) => x.id === 'canonical-mismatch'));
});


test('Node 22 compatible pinned DNS lookup supports all-address mode', async () => {
  const server = http.createServer((_req, res) => res.end('ok'));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const body = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'audit-test.invalid',
        port: address.port,
        path: '/',
        lookup: createPinnedLookup([{ address: '127.0.0.1', family: 4 }])
      }, (res) => {
        let value = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { value += chunk; });
        res.on('end', () => resolve(value));
      });
      req.on('error', reject);
      req.end();
    });
    assert.equal(body, 'ok');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});


test('render quality rejects an obviously collapsed browser render', () => {
  const raw = { wordCount: 823 };
  const rendered = { wordCount: 2, title: 'Home', h1s: [] };
  const result = assessRenderQuality(raw, rendered);
  assert.equal(result.usable, false);
  assert.equal(result.code, 'render-too-small');
});

test('render quality accepts a plausible rendered page', () => {
  const raw = { wordCount: 823 };
  const rendered = { wordCount: 910, title: 'Home', h1s: ['Modern Search Marketing'] };
  const result = assessRenderQuality(raw, rendered);
  assert.equal(result.usable, true);
});


test('CDN-style 403 is classified as access interference rather than a confirmed broken page', () => {
  const access = assessHttpAccess({
    status:403,
    headers:{ server:'cloudflare', 'cf-ray':'abc123-SJC' },
    body:'<html><title>Just a moment...</title><body>Enable JavaScript and cookies to continue</body></html>',
    rawAnalysis:{ wordCount:9 }
  });
  assert.equal(access.likelyInterference, true);
  assert.equal(access.pageContentUsable, false);

  const facts = {
    requestedUrl:'https://example.com/', finalUrl:'https://example.com/', scannedAt:new Date().toISOString(), responseStatus:403,
    responseHeaders:{ server:'cloudflare', 'cf-ray':'abc123-SJC' }, redirectChain:[], access,
    raw:{ title:'Just a moment...', metaDescription:null, metaRobots:[], canonical:null, h1s:[], headings:[], wordCount:9, totalLinks:0, internalLinks:0, externalLinks:0, emptyHrefLinks:0, jsonLdTypes:[], invalidJsonLdBlocks:0, lang:'en' },
    rendered:{ enabled:true, succeeded:false },
    robots:{ exists:false, status:403, url:'https://example.com/robots.txt', sitemaps:[], agents:{Googlebot:null,'OAI-SearchBot':null,GPTBot:null,ClaudeBot:null,PerplexityBot:null}, raw:null }
  };
  const findings = generateFindings(facts);
  assert.equal(findings[0].id, 'automated-access-block');
  assert.equal(findings[0].confidence, 'manual-review');
  assert.equal(findings.some((x) => x.id === 'http-status'), false);
  assert.equal(findings.some((x) => x.id === 'missing-title'), false);
});

test('render quality rejects tiny output even when raw fetch was also blocked', () => {
  const result = assessRenderQuality(null, { wordCount:2, title:null, h1s:[] });
  assert.equal(result.usable, false);
  assert.equal(result.code, 'render-too-small');
});

test('primary content analysis excludes navigation and footer boilerplate', () => {
  const navLinks = Array.from({length:20}, (_,i) => `<a href="/nav-${i}">Nav ${i}</a>`).join('');
  const footerLinks = Array.from({length:20}, (_,i) => `<a href="/footer-${i}">Footer ${i}</a>`).join('');
  const html = `<!doctype html><html><head><title>Primary Test</title></head><body><header><nav>${navLinks}</nav></header><main><h1>Service</h1><p>${'meaningful service content '.repeat(100)}</p><a href="/contextual-one">One</a><a href="/contextual-two">Two</a></main><footer>${footerLinks}</footer></body></html>`;
  const result = analyzeHtml(html, 'https://example.com/service');
  assert.equal(result.primarySource, 'main');
  assert.equal(result.primaryInternalLinks, 2);
  assert.ok(result.internalLinks >= 40);
  assert.ok(result.primaryWordCount < result.wordCount);
});

test('render rule compares primary content rather than whole-page boilerplate', () => {
  const facts = {
    requestedUrl:'https://example.com/', finalUrl:'https://example.com/', responseStatus:200, responseHeaders:{}, redirectChain:[],
    access:{ pageContentUsable:true }, contentAnalysis:{ source:'initial-html', html:null },
    raw:{ title:'Page', metaRobots:[], canonical:'https://example.com/', h1s:['Page'], invalidJsonLdBlocks:0, wordCount:1200, primaryWordCount:900, primarySource:'main', internalLinks:100, primaryInternalLinks:5, primaryInternalHrefs:['https://example.com/a'] },
    rendered:{ succeeded:true, html:{ wordCount:2600, primaryWordCount:980, primarySource:'main', internalLinks:220, primaryInternalLinks:6, primaryInternalHrefs:['https://example.com/a','https://example.com/b'] } },
    robots:{ agents:{Googlebot:true,'OAI-SearchBot':true,ClaudeBot:true,PerplexityBot:true}, url:'https://example.com/robots.txt' }
  };
  facts.contentAnalysis.html = facts.raw;
  const findings = generateFindings(facts);
  assert.equal(findings.some((x) => x.id === 'js-content-dependency'), false);
  assert.equal(findings.some((x) => x.id === 'js-link-dependency'), false);
});

import { classifyUrlType } from '../src/lib/page-type.mjs';
import { selectBalancedSample, buildTemplateProfiles } from '../src/lib/site-snapshot.mjs';

test('URL classifier distinguishes common site templates', () => {
  assert.equal(classifyUrlType('https://example.com/'), 'home');
  assert.equal(classifyUrlType('https://example.com/services/technical-seo/'), 'service');
  assert.equal(classifyUrlType('https://example.com/blog/search-guide/'), 'article');
  assert.equal(classifyUrlType('https://example.com/locations/phoenix/'), 'location');
  assert.equal(classifyUrlType('https://example.com/products/widget/'), 'product');
});

test('balanced site sampler deliberately mixes template types', () => {
  const entries = [
    ...Array.from({length:8}, (_,i) => ({url:`https://example.com/services/service-${i}/`, sourceSitemap:'https://example.com/page-sitemap.xml'})),
    ...Array.from({length:8}, (_,i) => ({url:`https://example.com/blog/post-${i}/`, sourceSitemap:'https://example.com/post-sitemap.xml'})),
    ...Array.from({length:5}, (_,i) => ({url:`https://example.com/locations/city-${i}/`, sourceSitemap:'https://example.com/location-sitemap.xml'})),
    ...Array.from({length:5}, (_,i) => ({url:`https://example.com/products/item-${i}/`, sourceSitemap:'https://example.com/product-sitemap.xml'}))
  ];
  const sample = selectBalancedSample(entries, 'https://example.com/services/focus/', 10);
  const types = new Set(sample.map((x) => x.pageType));
  assert.ok(types.has('home'));
  assert.ok(types.has('service'));
  assert.ok(types.has('article'));
  assert.ok(types.has('location'));
  assert.ok(types.has('product'));
});

test('healthy page can surface a visibility opportunity without inventing a technical issue', () => {
  const facts = {
    requestedUrl:'https://example.com/services/search/', finalUrl:'https://example.com/services/search/', responseStatus:200, responseHeaders:{}, redirectChain:[],
    access:{ pageContentUsable:true },
    raw:{ title:'Search Services', metaDescription:'Demo', metaRobots:[], canonical:'https://example.com/services/search/', h1s:['Search Services'], headings:[{level:1,text:'Search Services'}], wordCount:900, primaryWordCount:800, primarySource:'main', primaryInternalLinks:1, primaryInternalHrefs:['https://example.com/about/'], primarySubheadingCount:3, jsonLdTypes:['Organization'], structuredDataTypes:['Organization'], invalidJsonLdBlocks:0 },
    rendered:{ succeeded:false, enabled:false },
    robots:{ agents:{Googlebot:true,'OAI-SearchBot':true,ClaudeBot:true,PerplexityBot:true}, url:'https://example.com/robots.txt' }
  };
  facts.contentAnalysis = { source:'initial-html', html:facts.raw };
  const findings = generateFindings(facts);
  assert.equal(findings.some((x) => x.findingType === 'issue' && x.score >= 45), false);
  assert.ok(findings.some((x) => x.id === 'contextual-linking-opportunity' && x.findingType === 'opportunity'));
  assert.ok(findings.some((x) => x.id === 'page-specific-schema-opportunity' && x.findingType === 'opportunity'));
});

import { makeSiteFindings } from '../src/lib/site-snapshot.mjs';
import { buildAuditBrief, buildDeterministicBrief, selectDiverseFindings } from '../src/lib/ai-brief.mjs';

test('HTML analyzer detects authorship, breadcrumbs, and dense passage metrics', () => {
  const dense = 'This is a detailed clinical explanation with useful context '.repeat(35);
  const html = `<!doctype html><html><head><title>Guide</title><meta name="author" content="Dr. Example"><script type="application/ld+json">{"@type":"Article","author":{"@type":"Person","name":"Dr. Example"}}</script></head><body><nav aria-label="Breadcrumb"><a href="/">Home</a></nav><main><h1>Guide</h1><h2>What should patients know?</h2><p>${dense}</p></main></body></html>`;
  const result = analyzeHtml(html, 'https://example.com/blog/guide/');
  assert.equal(result.hasAuthorSignal, true);
  assert.equal(result.hasVisibleBreadcrumbs, true);
  assert.equal(result.primaryQuestionHeadingCount, 1);
  assert.ok(result.primaryLongestParagraphWords >= 180);
  assert.ok(result.structuredDataTypes.includes('Person'));
});

test('site snapshot can flag audited URL missing from sitemap without calling it a confirmed issue', () => {
  const snapshot = {
    enabled:true,
    targetUrl:'https://example.com/services/focus/',
    sitemapFound:true,
    sitemapPageCount:4,
    sitemapPageUrls:['https://example.com/','https://example.com/services/a/','https://example.com/services/b/','https://example.com/blog/post/'],
    pages:[
      {requestedUrl:'https://example.com/services/focus/',finalUrl:'https://example.com/services/focus/',pageType:'service',status:200,usable:true,title:'Focus',h1Count:1,h1Text:'Focus',canonical:'https://example.com/services/focus/',noindex:false,primaryWordCount:600,primaryInternalLinks:2,primaryInternalHrefs:[],primarySubheadingCount:3,primaryLongestParagraphWords:70,structuredDataTypes:['Service'],hasAuthorSignal:false,hasVisibleBreadcrumbs:true},
      {requestedUrl:'https://example.com/',finalUrl:'https://example.com/',pageType:'home',status:200,usable:true,title:'Home',h1Count:1,h1Text:'Home',canonical:'https://example.com/',noindex:false,primaryWordCount:500,primaryInternalLinks:5,primaryInternalHrefs:[],primarySubheadingCount:3,structuredDataTypes:['Organization'],hasAuthorSignal:false,hasVisibleBreadcrumbs:false}
    ]
  };
  const findings = makeSiteFindings(snapshot);
  const finding = findings.find((x) => x.id === 'target-not-in-sitemap-opportunity');
  assert.ok(finding);
  assert.equal(finding.findingType, 'opportunity');
  assert.equal(finding.confidence, 'manual-review');
});

test('site sample cross-link check stays framed as manual review', () => {
  const pages = [
    {finalUrl:'https://example.com/',requestedUrl:'https://example.com/',pageType:'home',status:200,usable:true,title:'Home',h1Count:1,h1Text:'Home',noindex:false,primaryWordCount:500,primaryInternalLinks:0,primaryInternalHrefs:[],primarySubheadingCount:2,structuredDataTypes:[]},
    ...Array.from({length:6}, (_,i) => ({finalUrl:`https://example.com/services/s${i}/`,requestedUrl:`https://example.com/services/s${i}/`,pageType:'service',status:200,usable:true,title:`Service ${i}`,h1Count:1,h1Text:`Service ${i}`,noindex:false,primaryWordCount:600,primaryInternalLinks:0,primaryInternalHrefs:[],primarySubheadingCount:3,structuredDataTypes:['Service'],hasVisibleBreadcrumbs:true}))
  ];
  const snapshot = {enabled:true,targetUrl:'https://example.com/',sitemapFound:true,sitemapPageCount:7,sitemapPageUrls:pages.map((p)=>p.finalUrl),pages};
  const findings = makeSiteFindings(snapshot);
  const finding = findings.find((x) => x.id === 'site-sample-crosslink-opportunity');
  assert.ok(finding);
  assert.equal(finding.confidence, 'manual-review');
  assert.match(finding.whyItMatters, /not proof/i);
});

test('deterministic audit brief ranks verified findings without inventing new IDs', () => {
  const facts = { finalUrl:'https://example.com/', pageType:'home', scanWarnings:[] };
  const findings = [
    {id:'a',scope:'page',findingType:'issue',title:'Noindex',category:'indexing',severity:'critical',confidence:'confirmed',score:100,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]},
    {id:'b',scope:'site',findingType:'opportunity',title:'Links',category:'internal-discovery',severity:'medium',confidence:'manual-review',score:63,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]},
    {id:'c',scope:'site',findingType:'opportunity',title:'Schema',category:'structured-data',severity:'medium',confidence:'manual-review',score:55,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]}
  ];
  const brief = buildDeterministicBrief(facts, findings);
  assert.equal(brief.mode, 'rule-ranked');
  assert.equal(brief.talkingPoints[0].findingKey, 'page:a');
  assert.ok(brief.talkingPoints.every((p) => ['page:a','site:b','site:c'].includes(p.findingKey)));
});

test('AI audit brief accepts only supplied finding keys', async () => {
  const facts = { finalUrl:'https://example.com/', pageType:'home', scanWarnings:[] };
  const findings = [
    {id:'schema',scope:'site',findingType:'opportunity',title:'Schema',category:'structured-data',severity:'medium',confidence:'manual-review',score:55,whyItMatters:'Machine context',recommendation:'Review schema',videoTalkingPoint:'Review the schema.',evidence:[{label:'Pages',value:'3'}]},
    {id:'links',scope:'site',findingType:'opportunity',title:'Links',category:'internal-discovery',severity:'medium',confidence:'manual-review',score:63,whyItMatters:'Discovery',recommendation:'Review links',videoTalkingPoint:'Review the links.',evidence:[]}
  ];
  const fakeFetch = async () => ({
    ok:true,
    status:200,
    async json() {
      return { output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({summary:'Prioritized.',talkingPoints:[
        {findingKey:'site:links',headline:'Internal linking first',whyWorthDiscussing:'Useful.',verifyFirst:'Verify links.',videoTalkingPoint:'I would review internal linking.'},
        {findingKey:'site:made-up',headline:'Invented',whyWorthDiscussing:'No',verifyFirst:'No',videoTalkingPoint:'No'}
      ]})}]}] };
    }
  });
  const brief = await buildAuditBrief(facts, findings, {apiKey:'test-key',model:'gpt-test',fetchImpl:fakeFetch});
  assert.equal(brief.mode, 'ai-prioritized');
  assert.equal(brief.talkingPoints.length, 1);
  assert.equal(brief.talkingPoints[0].findingKey, 'site:links');
  assert.deepEqual(brief.talkingPoints[0].evidence, []);
});

test('HTML analyzer measures generic contextual anchor text and heading jumps', () => {
  const html = `<!doctype html><html><head><title>Home</title></head><body><main><h1>Home</h1><h3>Section</h3><h5>Detail</h5><p>Useful copy.</p><a href="/a/">Read More</a><a href="/b/">Learn More</a><a href="/c/">Peptide Therapy</a><a href="/d/">Click Here</a></main></body></html>`;
  const result = analyzeHtml(html, 'https://example.com/');
  assert.equal(result.primaryInternalLinks, 4);
  assert.equal(result.primaryInternalGenericAnchorCount, 3);
  assert.equal(result.primaryHeadingLevelJumps, 2);
  assert.ok(result.primaryInternalGenericAnchorRatio > .7);
});

test('page rules can surface generic anchor text as a visibility opportunity', () => {
  const raw = analyzeHtml(`<!doctype html><html><head><title>Home</title><link rel="canonical" href="https://example.com/"></head><body><main><h1>Home</h1><a href="/a/">Read More</a><a href="/b/">Learn More</a><a href="/c/">Service C</a><a href="/d/">Click Here</a></main></body></html>`, 'https://example.com/');
  const facts = {
    requestedUrl:'https://example.com/', finalUrl:'https://example.com/', responseStatus:200, responseHeaders:{}, redirectChain:[],
    access:{ pageContentUsable:true }, raw, rendered:{ succeeded:false, enabled:false },
    contentAnalysis:{ source:'initial-html', html:raw },
    robots:{ agents:{Googlebot:true,'OAI-SearchBot':true,ClaudeBot:true,PerplexityBot:true}, url:'https://example.com/robots.txt' }
  };
  const findings = generateFindings(facts);
  const finding = findings.find((x) => x.id === 'generic-anchor-opportunity');
  assert.ok(finding);
  assert.equal(finding.findingType, 'opportunity');
  assert.equal(finding.confidence, 'likely');
});

test('site rules flag redirects in sitemap samples and inconsistent canonical coverage', () => {
  const pages = [
    {requestedUrl:'https://example.com/',finalUrl:'https://example.com/',sourceSitemap:null,pageType:'home',status:200,usable:true,redirectCount:0,title:'Home',h1Count:1,h1Text:'Home',canonical:'https://example.com/',noindex:false,primaryWordCount:500,primaryInternalLinks:4,primaryInternalHrefs:[],structuredDataTypes:['Organization']},
    {requestedUrl:'https://example.com/services/a-old/',finalUrl:'https://example.com/services/a/',sourceSitemap:'https://example.com/sitemap.xml',pageType:'service',status:200,usable:true,redirectCount:1,title:'A',h1Count:1,h1Text:'A',canonical:null,noindex:false,primaryWordCount:600,primaryInternalLinks:3,primaryInternalHrefs:[],structuredDataTypes:['Service']},
    {requestedUrl:'https://example.com/services/b/',finalUrl:'https://example.com/services/b/',sourceSitemap:'https://example.com/sitemap.xml',pageType:'service',status:200,usable:true,redirectCount:0,title:'B',h1Count:1,h1Text:'B',canonical:null,noindex:false,primaryWordCount:600,primaryInternalLinks:3,primaryInternalHrefs:[],structuredDataTypes:['Service']},
    {requestedUrl:'https://example.com/services/c/',finalUrl:'https://example.com/services/c/',sourceSitemap:'https://example.com/sitemap.xml',pageType:'service',status:200,usable:true,redirectCount:0,title:'C',h1Count:1,h1Text:'C',canonical:null,noindex:false,primaryWordCount:600,primaryInternalLinks:3,primaryInternalHrefs:[],structuredDataTypes:['Service']},
    {requestedUrl:'https://example.com/about/',finalUrl:'https://example.com/about/',sourceSitemap:'https://example.com/sitemap.xml',pageType:'company',status:200,usable:true,redirectCount:0,title:'About',h1Count:1,h1Text:'About',canonical:'https://example.com/about/',noindex:false,primaryWordCount:500,primaryInternalLinks:2,primaryInternalHrefs:[],structuredDataTypes:[]}
  ];
  const snapshot = {enabled:true,targetUrl:'https://example.com/',sitemapFound:true,sitemapPageCount:5,sitemapPageUrls:pages.slice(1).map((p)=>p.requestedUrl),pages};
  const findings = makeSiteFindings(snapshot);
  assert.ok(findings.some((x) => x.id === 'site-sitemap-redirects' && x.findingType === 'issue'));
  assert.ok(findings.some((x) => x.id === 'site-canonical-coverage-opportunity' && x.findingType === 'opportunity'));
});


test('relationship graph surfaces weak article-to-commercial pathways without calling them errors', () => {
  const pages = [];
  for (let i = 1; i <= 5; i++) {
    pages.push({
      usable:true, requestedUrl:`https://example.com/blog/post-${i}/`, finalUrl:`https://example.com/blog/post-${i}/`, pageType:'article',
      primaryWordCount:900, primaryInternalLinks:1, primaryExternalLinks:i === 1 ? 1 : 0,
      primaryInternalHrefs:[`https://example.com/blog/post-${(i % 5) + 1}/`]
    });
  }
  for (let i = 1; i <= 5; i++) {
    pages.push({
      usable:true, requestedUrl:`https://example.com/services/service-${i}/`, finalUrl:`https://example.com/services/service-${i}/`, pageType:'service',
      primaryWordCount:600, primaryInternalLinks:1, primaryExternalLinks:0,
      primaryInternalHrefs:[`https://example.com/services/service-${(i % 5) + 1}/`]
    });
  }
  const graph = buildRelationshipGraph(pages, pages.map((p) => ({ url:p.finalUrl, sourceSitemap:'' })));
  const findings = makeRelationshipFindings(graph);
  const articlePath = findings.find((finding) => finding.id === 'relationship-article-commercial-pathways');
  assert.ok(articlePath);
  assert.equal(articlePath.findingType, 'opportunity');
  assert.equal(articlePath.confidence, 'manual-review');
  assert.equal(graph.articleCommercialPct, 0);
});

test('relationship graph does not flag article/service pathways when contextual connections are present', () => {
  const pages = [];
  for (let i = 1; i <= 5; i++) {
    pages.push({
      usable:true, requestedUrl:`https://example.com/blog/post-${i}/`, finalUrl:`https://example.com/blog/post-${i}/`, pageType:'article',
      primaryWordCount:900, primaryInternalLinks:2, primaryExternalLinks:1,
      primaryInternalHrefs:[`https://example.com/services/service-${i}/`, `https://example.com/blog/post-${(i % 5) + 1}/`]
    });
    pages.push({
      usable:true, requestedUrl:`https://example.com/services/service-${i}/`, finalUrl:`https://example.com/services/service-${i}/`, pageType:'service',
      primaryWordCount:600, primaryInternalLinks:2, primaryExternalLinks:0,
      primaryInternalHrefs:[`https://example.com/blog/post-${i}/`, `https://example.com/services/service-${(i % 5) + 1}/`]
    });
  }
  const graph = buildRelationshipGraph(pages, pages.map((p) => ({ url:p.finalUrl, sourceSitemap:'' })));
  const findings = makeRelationshipFindings(graph);
  assert.equal(graph.articleCommercialPct, 100);
  assert.equal(graph.serviceArticlePct, 100);
  assert.equal(findings.some((finding) => finding.id === 'relationship-article-commercial-pathways'), false);
  assert.equal(findings.some((finding) => finding.id === 'relationship-service-supporting-content'), false);
});

test('relationship graph can surface sampled contextual inbound coverage as manual review', () => {
  const pages = [];
  for (let i = 1; i <= 24; i++) {
    const type = i <= 8 ? 'article' : (i <= 16 ? 'service' : 'other');
    pages.push({
      usable:true, requestedUrl:`https://example.com/${type}/${i}/`, finalUrl:`https://example.com/${type}/${i}/`, pageType:type,
      primaryWordCount:500, primaryInternalLinks:0, primaryExternalLinks:0, primaryInternalHrefs:[]
    });
  }
  const graph = buildRelationshipGraph(pages, pages.map((p) => ({ url:p.finalUrl, sourceSitemap:'' })));
  const findings = makeRelationshipFindings(graph);
  const inbound = findings.find((finding) => finding.id === 'relationship-expanded-inbound-coverage');
  assert.ok(inbound);
  assert.equal(inbound.confidence, 'manual-review');
  assert.equal(graph.noContextualInboundPct, 100);
});

test('HTML analyzer distinguishes source-like citations from ordinary external links', () => {
  const html = `<!doctype html><html><head><title>Research Article</title></head><body><main><h1>Research Article</h1>
    <p>${'Evidence-led content '.repeat(40)}</p>
    <a href="https://www.cdc.gov/example">CDC guidance</a>
    <a href="https://pubmed.ncbi.nlm.nih.gov/12345/">Published study</a>
    <a href="https://www.facebook.com/example">Facebook</a>
    <a href="https://vendor.example/pricing">Partner pricing</a>
  </main></body></html>`;
  const result = analyzeHtml(html, 'https://example.com/blog/research/');
  assert.equal(result.primaryExternalLinks, 4);
  assert.equal(result.primarySourceLikeExternalLinks, 2);
  assert.ok(result.primarySourceLikeExternalLinkDetails.some((link) => link.href.includes('cdc.gov')));
  assert.ok(result.primarySourceLikeExternalLinkDetails.some((link) => link.href.includes('pubmed.ncbi.nlm.nih.gov')));
});

test('HTML analyzer captures explicit author profile and entity identity details', () => {
  const html = `<!doctype html><html><head><title>Article</title>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","author":{"@type":"Person","name":"Dr Jane Doe","url":"https://example.com/author/jane-doe/"},"publisher":{"@type":"Organization","name":"Example Health","url":"https://example.com/","sameAs":["https://www.linkedin.com/company/example-health/"]}}</script>
    </head><body><main><h1>Article</h1><p>By <a rel="author" href="/author/jane-doe/">Dr Jane Doe</a></p><p>${'Useful medical copy '.repeat(40)}</p></main></body></html>`;
  const result = analyzeHtml(html, 'https://example.com/blog/article/');
  assert.equal(result.hasAuthorProfileLink, true);
  assert.ok(result.authorProfileLinks[0].href.includes('/author/jane-doe/'));
  assert.ok(result.personEntityNames.includes('Dr Jane Doe'));
  assert.ok(result.organizationEntityNames.includes('Example Health'));
  assert.ok(result.organizationEntitySameAs.some((url) => url.includes('linkedin.com')));
});

test('template profiles compare page-type medians and editorial signals', () => {
  const pages = [
    {usable:true,pageType:'service',finalUrl:'https://example.com/services/a/',primaryWordCount:500,primaryInternalLinks:1,canonical:'https://example.com/services/a/',structuredDataTypes:['Service'],hasVisibleBreadcrumbs:true},
    {usable:true,pageType:'service',finalUrl:'https://example.com/services/b/',primaryWordCount:700,primaryInternalLinks:3,canonical:'https://example.com/services/b/',structuredDataTypes:['Service'],hasVisibleBreadcrumbs:false},
    {usable:true,pageType:'article',finalUrl:'https://example.com/blog/a/',primaryWordCount:900,primaryInternalLinks:5,canonical:'https://example.com/blog/a/',structuredDataTypes:['Article'],hasVisibleBreadcrumbs:true,hasAuthorSignal:true,hasAuthorProfileLink:true,primarySourceLikeExternalLinks:1},
    {usable:true,pageType:'article',finalUrl:'https://example.com/blog/b/',primaryWordCount:1100,primaryInternalLinks:7,canonical:'https://example.com/blog/b/',structuredDataTypes:['Article'],hasVisibleBreadcrumbs:true,hasAuthorSignal:true,hasAuthorProfileLink:false,primarySourceLikeExternalLinks:0}
  ];
  const profiles = buildTemplateProfiles(pages);
  assert.equal(profiles.service.medianPrimaryWords, 600);
  assert.equal(profiles.service.medianContextualLinks, 2);
  assert.equal(profiles.article.authorProfilePct, 50);
  assert.equal(profiles.article.sourceLikeCitationPct, 50);
});

test('relationship citation finding counts source-like citations rather than any external link', () => {
  const pages = [];
  for (let i = 1; i <= 5; i++) {
    pages.push({
      usable:true, requestedUrl:`https://example.com/blog/post-${i}/`, finalUrl:`https://example.com/blog/post-${i}/`, pageType:'article',
      primaryWordCount:900, primaryInternalLinks:1, primaryExternalLinks:1,
      primarySourceLikeExternalLinks:i === 1 ? 1 : 0,
      primarySourceLikeExternalLinkDetails:i === 1 ? [{href:'https://www.nih.gov/study',anchor:'NIH study',reason:'government source'}] : [],
      primaryInternalHrefs:[]
    });
  }
  const graph = buildRelationshipGraph(pages, pages.map((p) => ({ url:p.finalUrl, sourceSitemap:'' })));
  assert.equal(graph.articlesWithExternalReferences, 5);
  assert.equal(graph.articlesWithSourceLikeCitations, 1);
  assert.equal(graph.articleSourceLikeCitationPct, 20);
  const finding = makeRelationshipFindings(graph).find((item) => item.id === 'relationship-editorial-citations');
  assert.ok(finding);
  assert.match(finding.title, /Source-like/);
});

test('relationship graph surfaces low contextual support for sampled commercial pages', () => {
  const pages = [];
  for (let i = 1; i <= 6; i++) {
    pages.push({
      usable:true, requestedUrl:`https://example.com/services/service-${i}/`, finalUrl:`https://example.com/services/service-${i}/`, pageType:'service',
      primaryWordCount:600, primaryInternalLinks:0, primaryExternalLinks:0, primarySourceLikeExternalLinks:0, primaryInternalHrefs:[]
    });
  }
  for (let i = 1; i <= 6; i++) {
    pages.push({
      usable:true, requestedUrl:`https://example.com/blog/post-${i}/`, finalUrl:`https://example.com/blog/post-${i}/`, pageType:'article',
      primaryWordCount:800, primaryInternalLinks:0, primaryExternalLinks:0, primarySourceLikeExternalLinks:0, primaryInternalHrefs:[]
    });
  }
  const graph = buildRelationshipGraph(pages, pages.map((p) => ({ url:p.finalUrl, sourceSitemap:'' })));
  assert.equal(graph.lowInboundCommercialPct, 100);
  const finding = makeRelationshipFindings(graph).find((item) => item.id === 'relationship-commercial-inbound-support');
  assert.ok(finding);
  assert.equal(finding.confidence, 'manual-review');
  assert.ok(finding.evidence.some((item) => item.url?.includes('/services/')));
});


test('verification metadata explains sampled internal-link limitations', () => {
  const finding = {
    id:'relationship-commercial-inbound-support',
    scope:'site',
    findingType:'opportunity',
    category:'content-pathways',
    confidence:'manual-review',
    evidence:[{label:'Commercial pages analyzed',value:'8'},{label:'With 0-1 contextual inbound links',value:'6 (75%)'}]
  };
  const verification = verificationForFinding(finding);
  assert.match(verification.lookedFor, /contextual internal links/i);
  assert.match(verification.limitations, /sampled/i);
  assert.equal(verification.confidenceLabel, 'Manual review required');
  assert.match(verification.found, /Commercial pages analyzed: 8/);
});

test('verification metadata describes the source-like citation classifier conservatively', () => {
  const verification = verificationForFinding({
    id:'relationship-editorial-citations',
    category:'source-quality',
    confidence:'manual-review',
    evidence:[{label:'Articles analyzed',value:'11'},{label:'With source-like citations',value:'0 (0%)'}]
  });
  assert.match(verification.lookedFor, /source-like external links/i);
  assert.match(verification.lookedFor, /government|academic|research/i);
  assert.match(verification.limitations, /unlinked citations/i);
});

test('attachVerification preserves finding fields and adds confidence guidance', () => {
  const [finding] = attachVerification([{
    id:'noindex',
    title:'Page is noindex',
    category:'indexing',
    confidence:'confirmed',
    score:100,
    evidence:[{label:'Meta robots',value:'noindex'}]
  }]);
  assert.equal(finding.id, 'noindex');
  assert.equal(finding.verification.confidenceLabel, 'High');
  assert.match(finding.verification.lookedFor, /indexing directives/i);
});

test('review payload validation accepts supported decisions and rejects unsupported ones', () => {
  const good = normalizeReviewPayload({
    url:'https://example.com/',
    findingKey:'site:schema',
    decision:'use',
    title:'Schema opportunity',
    category:'structured-data',
    scope:'site',
    findingType:'opportunity'
  });
  assert.equal(good.decision, 'use');
  assert.equal(good.findingKey, 'site:schema');
  assert.throws(() => normalizeReviewPayload({url:'https://example.com/',findingKey:'site:x',decision:'maybe'}), /Invalid review decision/);
});

test('review decisions append to a local JSONL feedback log', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cadence-review-'));
  try {
    const saved = await appendReviewDecision(root, {
      url:'https://example.com/',
      findingKey:'site:citations',
      decision:'investigate',
      title:'Citation review',
      category:'source-quality',
      scope:'site',
      findingType:'opportunity'
    });
    const contents = await fs.readFile(saved.filePath, 'utf8');
    const line = JSON.parse(contents.trim());
    assert.equal(line.decision, 'investigate');
    assert.equal(line.findingKey, 'site:citations');
  } finally {
    await fs.rm(root, {recursive:true, force:true});
  }
});

import { buildOnPageQa } from '../src/lib/on-page-qa.mjs';

test('HTML analyzer captures on-page QA metadata, multiple H1s, images, and hreflang', () => {
  const html = `<!doctype html><html><head>
    <title>${'Long title '.repeat(8)}</title>
    <meta name="description" content="Short description">
    <meta name="description" content="Second description">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta property="og:title" content="OG title"><meta property="og:image" content="/share.jpg">
    <link rel="alternate" hreflang="en-US" href="https://example.com/en/">
    <link rel="alternate" hreflang="not_valid_code" href="https://example.com/x/">
  </head><body><main><h1>One</h1><h1>Two</h1><h3>Jump</h3><img src="a.jpg"><img src="b.jpg" alt="image"></main></body></html>`;
  const result = analyzeHtml(html, 'https://example.com/');
  assert.equal(result.metaDescriptionCount, 2);
  assert.equal(result.h1ElementCount, 2);
  assert.equal(result.imagesMissingAlt, 1);
  assert.equal(result.imagesGenericAlt, 1);
  assert.equal(result.hreflangCount, 2);
  assert.equal(result.invalidHreflangCount, 1);
  assert.equal(result.openGraph.title, 'OG title');
  assert.ok(result.titleLength > 70);
});

test('On-Page QA separates routine review cues from confirmed issues', () => {
  const html = `<!doctype html><html><head><title>A very short title</title><meta name="description" content="Tiny"><link rel="canonical" href="https://example.com/"></head><body><main><h1>Primary</h1><h1>Secondary</h1><img src="a.jpg"></main></body></html>`;
  const raw = analyzeHtml(html, 'https://example.com/');
  const facts = {
    requestedUrl:'https://example.com/', finalUrl:'https://example.com/', responseStatus:200, pageType:'home',
    contentAnalysis:{ usable:true, html:raw }, raw,
    siteSnapshot:{ enabled:false, pages:[] }
  };
  const qa = buildOnPageQa(facts, { enabled:true, limit:20, checked:1, results:[{ url:'https://example.com/broken', status:404, finalUrl:'https://example.com/broken', redirectCount:0 }] });
  const headings = qa.checks.find((item) => item.id === 'headings');
  const meta = qa.checks.find((item) => item.id === 'meta-descriptions');
  const images = qa.checks.find((item) => item.id === 'images');
  assert.equal(headings.status, 'review');
  assert.equal(meta.status, 'review');
  assert.equal(images.status, 'review');
  assert.ok(qa.findings.some((finding) => finding.id === 'onpage-broken-internal-links' && finding.confidence === 'confirmed'));
});

test('On-Page QA can promote repeated missing meta descriptions without calling them a ranking error', () => {
  const pages = Array.from({ length:6 }, (_, index) => ({
    usable:true, requestedUrl:`https://example.com/service-${index}/`, finalUrl:`https://example.com/service-${index}/`, pageType:'service', status:200,
    title:`Service ${index}`, titleCount:1, titleLength:20, metaDescription:index < 4 ? null : `Useful description ${index} with enough differentiated copy to avoid a missing pattern.`, metaDescriptionCount:index < 4 ? 0 : 1,
    metaDescriptionLength:index < 4 ? 0 : 82, titleMetaSame:false, h1Count:1, h1Text:`Service ${index}`, emptyH1Count:0, emptyHeadingCount:0,
    primaryHeadingLevelJumps:0, canonical:`https://example.com/service-${index}/`, noindex:false, lang:'en', viewport:'width=device-width', openGraph:{title:'x',description:'y',image:'z'},
    imagesTotal:1, imagesMissingAlt:0, imagesEmptyAlt:0, imagesGenericAlt:0, hreflangCount:0, invalidHreflangCount:0, duplicateHreflangValues:[]
  }));
  const raw = analyzeHtml('<html lang="en"><head><title>Home title long enough</title><meta name="description" content="A sufficiently descriptive home page description for the test case."><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://example.com/"></head><body><main><h1>Home</h1></main></body></html>', 'https://example.com/');
  const facts = { requestedUrl:'https://example.com/', finalUrl:'https://example.com/', responseStatus:200, pageType:'home', contentAnalysis:{usable:true,html:raw}, raw, siteSnapshot:{enabled:true,pages} };
  const qa = buildOnPageQa(facts, { enabled:false, results:[] });
  const finding = qa.findings.find((item) => item.id === 'onpage-site-missing-meta-pattern');
  assert.ok(finding);
  assert.equal(finding.findingType, 'opportunity');
  assert.equal(finding.confidence, 'manual-review');
});

test('deterministic audit brief includes a paced recording plan tied to selected findings', () => {
  const facts = { finalUrl:'https://example.com/', pageType:'home', scanWarnings:[] };
  const findings = [
    {id:'a',scope:'page',findingType:'issue',title:'Canonical issue',category:'indexing',severity:'high',confidence:'confirmed',score:90,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]},
    {id:'b',scope:'site',findingType:'opportunity',title:'Schema opportunity',category:'structured-data',severity:'medium',confidence:'manual-review',score:60,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]},
    {id:'c',scope:'site',findingType:'opportunity',title:'Link opportunity',category:'internal-discovery',severity:'medium',confidence:'manual-review',score:58,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]}
  ];
  const brief = buildDeterministicBrief(facts, findings);
  assert.ok(brief.recordingPlan);
  assert.match(brief.recordingPlan.targetLength, /3-4 minutes/);
  assert.equal(brief.recordingPlan.sections.length, brief.talkingPoints.length);
  assert.deepEqual(brief.recordingPlan.sections.map((section) => section.findingKey), brief.talkingPoints.map((point) => point.findingKey));
  assert.match(brief.recordingPlan.opening, /example\.com/i);
});

test('On-Page QA exposes observation totals, recurring template patterns, and per-page module summaries', () => {
  const pages = Array.from({ length:4 }, (_, index) => ({
    usable:true, requestedUrl:`https://example.com/services/s${index}/`, finalUrl:`https://example.com/services/s${index}/`, pageType:'service', status:200,
    title:`Service ${index} - Example`, titleCount:1, titleLength:28,
    metaDescription:`A differentiated description for service ${index} with enough useful detail for this automated test fixture and users.`, metaDescriptionCount:1, metaDescriptionLength:105, titleMetaSame:false,
    h1Count:1, h1Text:`Service ${index}`, emptyH1Count:0, emptyHeadingCount:index < 3 ? 1 : 0, primaryHeadingLevelJumps:index < 3 ? 1 : 0,
    canonical:`https://example.com/services/s${index}/`, noindex:false, lang:'en', viewport:'width=device-width', charset:'utf-8', openGraph:{title:'x',description:'y',image:'z'}, twitter:{},
    imagesTotal:1, imagesMissingAlt:0, imagesEmptyAlt:0, imagesGenericAlt:0, imageAltExamples:[], hreflangCount:0, invalidHreflangCount:0, invalidHreflang:[], duplicateHreflangValues:[]
  }));
  const raw = analyzeHtml('<html lang="en"><head><title>Home page title long enough</title><meta name="description" content="A sufficiently descriptive home page description for this test fixture and its search result snippet."><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://example.com/"></head><body><main><h1>Home</h1></main></body></html>', 'https://example.com/');
  const facts = { requestedUrl:'https://example.com/', finalUrl:'https://example.com/', responseStatus:200, pageType:'home', contentAnalysis:{usable:true,html:raw}, raw, siteSnapshot:{enabled:true,pages} };
  const qa = buildOnPageQa(facts, { enabled:false, results:[] });
  assert.ok(qa.summary.totalObservations >= 6);
  assert.ok(qa.templatePatterns.some((pattern) => pattern.pageType === 'service' && pattern.issue === 'Heading-level jump'));
  assert.ok(qa.pageSummaries.some((page) => page.pageType === 'service' && page.reviewModules > 0));
});

test('AI recording plan validates selected finding keys and keeps generated plan framing separate from evidence', async () => {
  const facts = { finalUrl:'https://example.com/', pageType:'home', scanWarnings:[] };
  const findings = [
    {id:'schema',scope:'site',findingType:'opportunity',title:'Schema',category:'structured-data',severity:'medium',confidence:'manual-review',score:55,whyItMatters:'Machine context',recommendation:'Review schema',videoTalkingPoint:'Review the schema.',evidence:[{label:'Pages',value:'3'}]},
    {id:'links',scope:'site',findingType:'opportunity',title:'Links',category:'internal-discovery',severity:'medium',confidence:'manual-review',score:63,whyItMatters:'Discovery',recommendation:'Review links',videoTalkingPoint:'Review the links.',evidence:[]}
  ];
  const fakeFetch = async () => ({
    ok:true,
    status:200,
    async json() {
      return { output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({
        summary:'Two areas to review.',
        opening:'I found two areas worth checking.',
        closing:'Those are the first areas I would validate.',
        talkingPoints:[
          {findingKey:'site:links',headline:'Internal linking first',whyWorthDiscussing:'Useful.',verifyFirst:'Verify links.',videoTalkingPoint:'I would review internal linking.',transition:'Then move into entity clarity.',estimatedSeconds:55},
          {findingKey:'site:made-up',headline:'Invented',whyWorthDiscussing:'No',verifyFirst:'No',videoTalkingPoint:'No',transition:'No',estimatedSeconds:55}
        ]
      })}]}] };
    }
  });
  const brief = await buildAuditBrief(facts, findings, {apiKey:'test-key',model:'gpt-test',fetchImpl:fakeFetch});
  assert.equal(brief.mode, 'ai-prioritized');
  assert.equal(brief.talkingPoints.length, 1);
  assert.equal(brief.recordingPlan.sections.length, 1);
  assert.equal(brief.recordingPlan.sections[0].findingKey, 'site:links');
  assert.equal(brief.recordingPlan.opening, 'I found two areas worth checking.');
});

import { addPriorityComposites, priorityCandidatePool, themeForFinding } from '../src/lib/priority.mjs';

test('On-Page QA promotes repeated confirmed title/meta/H1 implementation problems into a systemic finding', () => {
  const pages = Array.from({ length:8 }, (_, index) => ({
    usable:true,
    requestedUrl:`https://example.com/services/s${index}/`,
    finalUrl:`https://example.com/services/s${index}/`,
    pageType:'service',
    status:200,
    title:`Service ${index} - Example`,
    titleCount:index < 5 ? 2 : 1,
    titleLength:28,
    metaDescription:`A useful service description ${index} with enough differentiated copy for this fixture and its search snippet presentation.`,
    metaDescriptionCount:index < 4 ? 2 : 1,
    metaDescriptionLength:112,
    titleMetaSame:false,
    h1Count:index < 3 ? 0 : 1,
    h1Text:index < 3 ? null : `Service ${index}`,
    emptyH1Count:0,
    emptyHeadingCount:0,
    primaryHeadingLevelJumps:0,
    canonical:`https://example.com/services/s${index}/`,
    noindex:false,
    lang:'en',
    viewport:'width=device-width',
    charset:'utf-8',
    openGraph:{title:'x',description:'y',image:'z'},
    twitter:{},
    imagesTotal:1,
    imagesMissingAlt:0,
    imagesEmptyAlt:0,
    imagesGenericAlt:0,
    imageAltExamples:[],
    hreflangCount:0,
    invalidHreflangCount:0,
    invalidHreflang:[],
    duplicateHreflangValues:[]
  }));
  const raw = analyzeHtml('<html lang="en"><head><title>Home page title long enough</title><meta name="description" content="A sufficiently descriptive home page description for this automated priority test fixture."><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://example.com/"></head><body><main><h1>Home</h1></main></body></html>', 'https://example.com/');
  const facts = { requestedUrl:'https://example.com/', finalUrl:'https://example.com/', responseStatus:200, pageType:'home', contentAnalysis:{usable:true,html:raw}, raw, siteSnapshot:{enabled:true,pages} };
  const qa = buildOnPageQa(facts, { enabled:false, results:[] });
  const systemic = qa.findings.find((finding) => finding.id === 'onpage-systemic-confirmed-issues');
  assert.ok(systemic);
  assert.equal(systemic.findingType, 'issue');
  assert.equal(systemic.confidence, 'confirmed');
  assert.equal(themeForFinding(systemic), 'on-page');
  assert.match(systemic.videoTalkingPoint, /confirmed observations/i);
});

test('priority tuning merges overlapping article-to-commercial and commercial-inbound findings', () => {
  const findings = [
    {id:'relationship-article-commercial-pathways',scope:'site',findingType:'opportunity',title:'Articles rarely link commercial',category:'content-pathways',severity:'medium',confidence:'manual-review',score:64,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[{label:'Articles analyzed',value:'9'},{label:'Articles linking to commercial pages',value:'3 (33%)'},{label:'Review article 1',value:'https://example.com/blog/a',url:'https://example.com/blog/a'}]},
    {id:'relationship-commercial-inbound-support',scope:'site',findingType:'opportunity',title:'Commercial pages have low inbound',category:'content-pathways',severity:'medium',confidence:'manual-review',score:62,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[{label:'Commercial pages analyzed',value:'10'},{label:'With 0-1 contextual inbound links',value:'8 (80%)'},{label:'Review page 1',value:'https://example.com/services/a',url:'https://example.com/services/a'}]}
  ];
  const expanded = addPriorityComposites(findings);
  const composite = expanded.find((finding) => finding.id === 'relationship-commercial-content-network');
  assert.ok(composite);
  assert.deepEqual(composite.sourceFindingKeys.sort(), ['site:relationship-article-commercial-pathways','site:relationship-commercial-inbound-support'].sort());
  assert.equal(expanded.filter((finding) => finding.prioritySuppressed).length, 2);
  const pool = priorityCandidatePool(expanded);
  assert.ok(pool.some((finding) => finding.id === 'relationship-commercial-content-network'));
  assert.equal(pool.some((finding) => finding.id === 'relationship-article-commercial-pathways'), false);
  assert.equal(pool.some((finding) => finding.id === 'relationship-commercial-inbound-support'), false);
});

test('priority tuning favors variety and allows systemic on-page problems to outrank softer duplicate architecture points', () => {
  const findings = [
    {id:'onpage-systemic-confirmed-issues',scope:'site',findingType:'issue',title:'Systemic on-page',category:'on-page',severity:'high',confidence:'confirmed',score:76,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]},
    {id:'relationship-article-commercial-pathways',scope:'site',findingType:'opportunity',title:'Articles rarely link commercial',category:'content-pathways',severity:'medium',confidence:'manual-review',score:64,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[{label:'Articles analyzed',value:'9'},{label:'Articles linking to commercial pages',value:'3 (33%)'}]},
    {id:'relationship-commercial-inbound-support',scope:'site',findingType:'opportunity',title:'Commercial pages low inbound',category:'content-pathways',severity:'medium',confidence:'manual-review',score:62,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[{label:'Commercial pages analyzed',value:'10'},{label:'With 0-1 contextual inbound links',value:'8 (80%)'}]},
    {id:'site-page-schema-opportunity',scope:'site',findingType:'opportunity',title:'Schema',category:'structured-data',severity:'medium',confidence:'manual-review',score:55,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]},
    {id:'relationship-editorial-citations',scope:'site',findingType:'opportunity',title:'Citations',category:'source-quality',severity:'low',confidence:'manual-review',score:51,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]}
  ];
  const selected = selectDiverseFindings(findings, 5);
  assert.equal(selected[0].id, 'onpage-systemic-confirmed-issues');
  assert.ok(selected.some((finding) => finding.id === 'relationship-commercial-content-network'));
  assert.ok(selected.some((finding) => finding.id === 'site-page-schema-opportunity'));
  assert.ok(selected.some((finding) => finding.id === 'relationship-editorial-citations'));
  assert.equal(selected.some((finding) => finding.id === 'relationship-article-commercial-pathways'), false);
  assert.equal(selected.some((finding) => finding.id === 'relationship-commercial-inbound-support'), false);
});

test('priority tuning does not pad the brief with weak below-threshold housekeeping', () => {
  const findings = [
    {id:'schema',scope:'site',findingType:'opportunity',title:'Schema',category:'structured-data',severity:'medium',confidence:'manual-review',score:55,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]},
    {id:'author',scope:'site',findingType:'opportunity',title:'Author',category:'entity-clarity',severity:'low',confidence:'manual-review',score:49,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]},
    {id:'tiny-meta',scope:'site',findingType:'opportunity',title:'Tiny housekeeping',category:'metadata',severity:'low',confidence:'manual-review',score:46,whyItMatters:'x',recommendation:'y',videoTalkingPoint:'z',evidence:[]}
  ];
  const selected = selectDiverseFindings(findings, 5);
  assert.equal(selected.length, 2);
  assert.equal(selected.some((finding) => finding.id === 'tiny-meta'), false);
});


test('production session tokens expire and reject tampering', () => {
  const secret = 'test-session-secret';
  const now = 1_700_000_000_000;
  const token = createSessionToken(secret, now, 60_000);
  assert.equal(verifySessionToken(token, secret, now + 30_000), true);
  assert.equal(verifySessionToken(`${token}x`, secret, now + 30_000), false);
  assert.equal(verifySessionToken(token, secret, now + 61_000), false);
  assert.equal(passwordMatches('correct horse', 'correct horse'), true);
  assert.equal(passwordMatches('wrong horse', 'correct horse'), false);
});

test('production cookie parser and host allowlist behave conservatively', () => {
  assert.deepEqual(parseCookies('a=1; cadence_audit_session=abc%2Edef'), { a:'1', cadence_audit_session:'abc.def' });
  const allowedReq = { headers:{ host:'audit.example.com' } };
  const deniedReq = { headers:{ host:'other.example.com' } };
  assert.equal(hostAllowed(allowedReq, ['audit.example.com']), true);
  assert.equal(hostAllowed(deniedReq, ['audit.example.com']), false);
  assert.equal(hostAllowed(deniedReq, []), true);
});

test('scan rate limiter enforces a rolling request cap', () => {
  const limiter = createRateLimiter({ windowMs:1000, max:2 });
  assert.equal(limiter.check('ip', 1000).allowed, true);
  assert.equal(limiter.check('ip', 1100).allowed, true);
  const blocked = limiter.check('ip', 1200);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterMs > 0);
  assert.equal(limiter.check('ip', 2101).allowed, true);
});

test('browser request guard blocks private and unsupported targets', async () => {
  const privateTarget = await validateBrowserRequestUrl('http://127.0.0.1/admin');
  assert.equal(privateTarget.allowed, false);
  const localResource = await validateBrowserRequestUrl('data:text/plain,hello');
  assert.equal(localResource.allowed, true);
  const fileTarget = await validateBrowserRequestUrl('file:///etc/passwd');
  assert.equal(fileTarget.allowed, false);
});

test('hosted review log can write to configured persistent data directory', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cadence-review-data-'));
  const prior = process.env.DATA_DIR;
  process.env.DATA_DIR = dir;
  try {
    const saved = await appendReviewDecision('/tmp/unused-project-root', {
      url:'https://example.com/',
      findingKey:'site:test',
      decision:'use',
      title:'Test'
    });
    assert.equal(saved.filePath, path.join(dir, 'review-decisions.jsonl'));
    const text = await fs.readFile(saved.filePath, 'utf8');
    assert.match(text, /"findingKey":"site:test"/);
  } finally {
    if (prior === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = prior;
    await fs.rm(dir, { recursive:true, force:true });
  }
});
