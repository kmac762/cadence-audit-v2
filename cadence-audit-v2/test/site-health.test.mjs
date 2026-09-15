import test from 'node:test';
import assert from 'node:assert/strict';
import {scanContext} from '../src/v2/context.mjs';
import {inspectSiteHealth,siteHealthFindings} from '../src/v2/site-health.mjs';
import {analyzeHtml} from '../src/lib/analyze-html.mjs';
import {runScan} from '../src/v2/pipeline.mjs';

const html=(links='',title='Healthy page')=>`<!doctype html><html><head><title>${title}</title><meta name="description" content="Useful description for this page"><link rel="canonical" href="https://example.com/"></head><body><main><h1>${title}</h1><p>${'Useful content '.repeat(40)}</p>${links}</main></body></html>`;
const robots={status:200,headers:{'content-type':'text/plain'},body:'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n'};

test('site health confirms real errors and redirects but keeps 403 unverified',async()=>{
 const entry=analyzeHtml(html('<a href="/gone">Gone</a><a href="/moved">Moved</a><a href="/blocked">Blocked</a>'),'https://example.com/');
 const fetcher=async u=>{
  if(u.pathname==='/gone')return{status:404,headers:{'content-type':'text/html'},body:html('', 'Not found')};
  if(u.pathname==='/moved')return{status:301,headers:{location:'/live','content-type':'text/html'},body:''};
  if(u.pathname==='/live')return{status:200,headers:{'content-type':'text/html'},body:html('', 'Live')};
  if(u.pathname==='/blocked')return{status:403,headers:{'content-type':'text/html'},body:'Access denied'};
  return{status:200,headers:{'content-type':'text/html'},body:html()};
 };
 const facts={requestedUrl:'https://example.com/',finalUrl:'https://example.com/',responseStatus:200,raw:entry,contentAnalysis:{usable:true,html:entry},access:{pageContentUsable:true},siteSnapshot:{enabled:false,pages:[],relationshipPages:[]}};
 const h=await scanContext.run({fixtureFetch:fetcher,fixtureIntervalMs:0,maxRequests:50,deadline:Date.now()+5000},()=>inspectSiteHealth(facts,{mode:'page',maxTargets:10}));
 assert.equal(h.counts.broken,1);assert.equal(h.counts.redirects,1);assert.equal(h.counts.unverified,1);
 assert.equal(h.examples.broken[0].url,'https://example.com/gone');
 assert.equal(h.examples.redirects[0].finalUrl,'https://example.com/live');
 assert.equal(h.examples.unverified[0].status,403);
});

test('soft 404s are review cues, not confirmed broken errors',async()=>{
 const entry=analyzeHtml(html('<a href="/ghost">Ghost</a>'),'https://example.com/');
 const facts={requestedUrl:'https://example.com/',finalUrl:'https://example.com/',responseStatus:200,raw:entry,contentAnalysis:{usable:true,html:entry},access:{pageContentUsable:true},siteSnapshot:{enabled:false,pages:[],relationshipPages:[]}};
 const h=await scanContext.run({fixtureFetch:async()=>({status:200,headers:{'content-type':'text/html'},body:'<!doctype html><title>Page not found</title><main><h1>Page not found</h1><p>Sorry.</p></main>'}),fixtureIntervalMs:0,maxRequests:20,deadline:Date.now()+3000},()=>inspectSiteHealth(facts,{mode:'page'}));
 assert.equal(h.counts.soft404,1);assert.equal(h.counts.broken,0);
 assert.equal(siteHealthFindings(h).some(f=>f.id==='site-health-soft-404-review'),false,'one soft 404 stays in site-health detail instead of becoming a sales recommendation');
});

test('pipeline exposes bounded site health and can promote confirmed broken paths',async()=>{
 const fetcher=async u=>{
  if(u.pathname==='/robots.txt')return robots;
  if(u.pathname==='/sitemap.xml')return{status:200,headers:{'content-type':'application/xml'},body:'<urlset><url><loc>https://example.com/service/</loc></url><url><loc>https://example.com/gone</loc></url></urlset>'};
  if(u.pathname==='/sitemap_index.xml')return{status:404,headers:{'content-type':'text/plain'},body:'Not found'};
  if(u.pathname==='/gone')return{status:404,headers:{'content-type':'text/html'},body:'<title>Not found</title><h1>Not found</h1>'};
  return{status:200,headers:{'content-type':'text/html'},body:html('<a href="/gone">Old service</a><a href="/service/">Service</a>', 'Example service')};
 };
 const r=await scanContext.run({fixtureFetch:fetcher,fixtureIntervalMs:0,maxRequests:100,deadline:Date.now()+8000},()=>runScan('https://example.com/',{mode:'snapshot',sampleSize:2,render:false}));
 assert.equal(r.siteHealth.enabled,true);assert.ok(r.siteHealth.counts.broken>=1||r.siteHealth.counts.sampledBrokenPages>=1);
 assert.ok(r.recommendations.some(x=>x.playbook==='broken'));
 assert.match(r.recommendations.find(x=>x.playbook==='broken').talk,/dead ends|no longer work/i);
});
