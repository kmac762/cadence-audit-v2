import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {analyzeHtml} from '../src/lib/analyze-html.mjs';
import {recommendationTitle} from '../src/v2/playbooks.mjs';
import {inspectSiteHealth} from '../src/v2/site-health.mjs';

test('training-first finding titles are direct',()=>{
  assert.equal(recommendationTitle({qaIssue:'Missing H1'},'headings'),'Missing Header 1 Tags');
  assert.equal(recommendationTitle({qaIssue:'Multiple H1 elements'},'headings'),'Multiple Header 1 Tags');
  assert.equal(recommendationTitle({},'links'),'Implement Internal Link Strategy');
  assert.equal(recommendationTitle({},'sources'),'Add Supporting Sources and Citations');
});

test('HTML analyzer keeps internal-link anchor text and placement',()=>{
  const html='<!doctype html><html><body><header><nav><a href="/about">About us</a></nav></header><main><a href="/services"><img src="x.jpg" alt="Our services"></a></main><footer><a href="/about">Company</a></footer></body></html>';
  const r=analyzeHtml(html,'https://example.com/');
  const about=r.internalLinkOccurrences.filter(x=>x.href==='https://example.com/about');
  assert.deepEqual(about.map(x=>x.placement),['header-navigation','footer']);
  assert.deepEqual(about.map(x=>x.anchor),['About us','Company']);
  const service=r.internalLinkOccurrences.find(x=>x.href==='https://example.com/services');
  assert.equal(service.anchor,'Our services');
  assert.equal(service.placement,'main-content');
});

test('bounded site health preserves source page, anchor and placement for redirects',async()=>{
  const facts={
    requestedUrl:'https://example.com/source',finalUrl:'https://example.com/source',responseStatus:200,
    access:{kind:'ok',pageContentUsable:true},
    contentAnalysis:{usable:true,html:{internalHrefs:['https://example.com/about'],internalLinkOccurrences:[{href:'https://example.com/about',anchor:'About us',placement:'footer'}]}},
    siteSnapshot:{enabled:true,pages:[
      {requestedUrl:'https://example.com/source',finalUrl:'https://example.com/source',status:200,usable:true,internalHrefs:['https://example.com/about'],internalLinkOccurrences:[{href:'https://example.com/about',anchor:'About us',placement:'footer'}]},
      {requestedUrl:'https://example.com/about',finalUrl:'https://example.com/about/',status:200,usable:true,redirectCount:1,redirects:[{status:301,url:'https://example.com/about'}],internalHrefs:[]}
    ],relationshipPages:[]}
  };
  const h=await inspectSiteHealth(facts,{mode:'snapshot',maxTargets:8});
  const x=h.examples.redirects.find(x=>x.url==='https://example.com/about');
  assert.ok(x);
  assert.equal(x.linkOccurrences[0].sourceUrl,'https://example.com/source');
  assert.equal(x.linkOccurrences[0].anchor,'About us');
  assert.equal(x.linkOccurrences[0].placement,'footer');
});

test('client detail view opens source page and hides verbose recommendation header caveats',async()=>{
  const app=await fs.readFile(new URL('../public/app.js',import.meta.url),'utf8');
  assert.match(app,/Open source page/);
  assert.match(app,/Anchor text/);
  assert.match(app,/Found in/);
  assert.doesNotMatch(app,/\$\{escape\(r\.theme\)\} \/ \$\{escape\(r\.scope\)\}/);
  assert.doesNotMatch(app,/Priority: \$\{escape\(r\.priority\)\}[^\n]{0,120}\$\{escape\(r\.confidence\)\}/);
});
