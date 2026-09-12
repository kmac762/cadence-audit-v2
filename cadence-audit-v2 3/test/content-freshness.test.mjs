import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeHtml} from '../src/lib/analyze-html.mjs';
import {analyzeContentFreshness,contentFreshnessFindings} from '../src/v2/content-freshness.mjs';

test('HTML analyzer extracts editorial dates and year references',()=>{
 const html=`<html><head><title>Best Guide for 2022</title><meta name="description" content="Updated tactics for 2022"><meta property="article:published_time" content="2022-05-01T00:00:00Z"><script type="application/ld+json">{"@type":"Article","datePublished":"2022-05-01","dateModified":"2023-02-10"}</script></head><body><main><article><h1>Best Guide</h1><p>Our 2022 study was updated in 2023 and compared with 2021 data.</p><a href="https://example.org/research/2021/report">2021 research report</a></article></main></body></html>`;
 const a=analyzeHtml(html,'https://example.com/blog/guide');
 assert.equal(a.metaPublishedTime,'2022-05-01T00:00:00Z');
 assert.deepEqual(a.titleYearReferences,[2022]);
 assert.ok(a.primaryYearReferences.includes(2021));
 assert.ok(a.structuredDataDateModifiedValues.includes('2023-02-10'));
});

test('Content freshness never flags age alone',()=>{
 const facts={siteSnapshot:{enabled:true,pages:[{usable:true,pageType:'article',requestedUrl:'https://example.com/blog/old',finalUrl:'https://example.com/blog/old',title:'Evergreen topic',structuredDataDatePublishedValues:['2020-01-01'],structuredDataDateModifiedValues:[],titleYearReferences:[],metaDescriptionYearReferences:[],primaryYearReferences:[],sourceLinkYearReferences:[]}],relationshipPages:[],relationshipGraph:{sourceMetrics:[]}}};
 const f=analyzeContentFreshness(facts,{now:new Date('2026-09-12T00:00:00Z')});
 assert.equal(f.counts.refreshCandidates,0);
 assert.equal(contentFreshnessFindings(f).length,0);
});

test('Multiple stale signals create a refresh candidate',()=>{
 const page={usable:true,pageType:'article',requestedUrl:'https://example.com/blog/guide-2022',finalUrl:'https://example.com/blog/guide-2022',title:'Best Search Guide 2022',structuredDataDatePublishedValues:['2022-02-01'],structuredDataDateModifiedValues:[],titleYearReferences:[2022],metaDescriptionYearReferences:[2022],primaryYearReferences:[2020,2021,2022],sourceLinkYearReferences:[2020]};
 const facts={siteSnapshot:{enabled:true,pages:[page],relationshipPages:[],relationshipGraph:{sourceMetrics:[{url:page.finalUrl,contextualInboundCount:0}]}}};
 const f=analyzeContentFreshness(facts,{now:new Date('2026-09-12T00:00:00Z')});
 assert.equal(f.counts.strongRefreshCandidates,1);
 assert.equal(contentFreshnessFindings(f)[0].playbook,'freshness');
});

test('Similar article titles surface consolidation review cue',()=>{
 const make=(url,title)=>({usable:true,pageType:'article',requestedUrl:url,finalUrl:url,title,structuredDataDatePublishedValues:[],structuredDataDateModifiedValues:[],titleYearReferences:[],metaDescriptionYearReferences:[],primaryYearReferences:[],sourceLinkYearReferences:[]});
 const facts={siteSnapshot:{enabled:true,pages:[make('https://example.com/a','Technical Search Audit Guide'),make('https://example.com/b','Technical Search Audit Guide Checklist')],relationshipPages:[],relationshipGraph:{sourceMetrics:[]}}};
 const f=analyzeContentFreshness(facts,{now:new Date('2026-09-12T00:00:00Z')});
 assert.equal(f.counts.consolidationCandidates,1);
});


test('Dedicated freshness pages are included even when the balanced sample has no article',()=>{
 const article={usable:true,pageType:'article',requestedUrl:'https://example.com/post',finalUrl:'https://example.com/post',title:'Search Guide 2022',structuredDataDatePublishedValues:['2022-01-01'],structuredDataDateModifiedValues:[],titleYearReferences:[2022],metaDescriptionYearReferences:[],primaryYearReferences:[2021,2022,2023],sourceLinkYearReferences:[]};
 const facts={siteSnapshot:{enabled:true,pages:[{usable:true,pageType:'home',finalUrl:'https://example.com/'}],relationshipPages:[],freshnessPages:[article],freshnessCoverage:{candidatesDiscovered:12,selected:8,attempted:8,usable:1},relationshipGraph:{sourceMetrics:[]}}};
 const f=analyzeContentFreshness(facts,{now:new Date('2026-09-12T00:00:00Z')});
 assert.equal(f.articlesReviewed,1);
 assert.equal(f.coverage.candidatesDiscovered,12);
 assert.equal(f.coverage.usable,1);
});


test('Client UI does not hide the Content Freshness module when an older saved report lacks freshness data', async()=>{
 const source=await (await import('node:fs/promises')).readFile(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(source,/This saved or partial scan does not contain content-freshness data/);
 assert.doesNotMatch(source,/if\(!f\)return''/);
});
