import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYBOOKS,AI_RELEVANCE} from '../src/v2/playbooks.mjs';
import {makeReport} from '../src/v2/report.mjs';
import {recordingBrief} from '../shared/brief.mjs';
import {browserAssistRecommendations} from '../src/v2/browser-assist.mjs';

test('Every recommendation playbook has explicit AI relevance guidance',()=>{
 for(const key of Object.keys(PLAYBOOKS)){
  const a=AI_RELEVANCE[key];
  assert.ok(a,key+' missing AI relevance');
  assert.ok(a.level.length>2,key+' level');
  assert.ok(a.why.length>60,key+' why');
  assert.ok(a.effect.length>50,key+' effect');
  assert.ok(a.source.startsWith('https://'),key+' source');
 }
});

test('Report recommendations carry separate search and AI relevance fields',()=>{
 const items=Array.from({length:4},(_,i)=>({issue:'Missing H1',url:`https://example.com/p${i}`,level:'issue',value:'No H1 detected'}));
 const r=makeReport({facts:{requestedUrl:'https://example.com',contentAnalysis:{usable:true},scanWarnings:[]},onPageQa:{pagesChecked:4,checks:[{id:'headings',category:'headings',label:'Headings',items,issueCount:4}]},findings:[]});
 const h=r.recommendations.find(x=>x.playbook==='headings');
 assert.ok(h);
 assert.match(h.why,/search/i);
 assert.match(h.aiWhy,/generative AI|AI features/i);
 assert.match(h.aiEffect,/Not established/i);
 assert.equal(h.aiLevel,'Supporting');
});

test('Sales brief discusses AI relevance without promising citations',()=>{
 const p=PLAYBOOKS.headings,a=AI_RELEVANCE.headings;
 const report={finalUrl:'https://example.com',status:'completed',coverage:{},recommendations:[{id:'x',...p,observation:'H1 missing on sampled pages.',solution:p.steps,evidence:[],aiLevel:a.level,aiWhy:a.why,aiEffect:a.effect,aiSource:a.source}]};
 const text=recordingBrief(report);
 assert.match(text,/AI search relevance \(Supporting\)/);
 assert.match(text,/AI effect - supported vs\. unproven/);
 assert.match(text,/not a promise of rankings, AI citations or leads/i);
});

test('Browser Assist recommendations inherit AI relevance without claiming crawler verification',()=>{
 const capture=url=>({schemaVersion:'cadence-browser-assist-1',capturedAt:new Date().toISOString(),url,page:{title:'Service',metaDescription:'',canonical:url,robots:'',language:'en',bodyWordCount:300,headings:{h1:[],h2:['Details'],emptyCount:0},structuredDataTypes:[],images:{total:1,missingAlt:0},links:{internalPrimary:2,externalPrimary:0},authorSignals:[],openGraph:{title:'',description:''}}});
 const r=browserAssistRecommendations([capture('https://example.com/a'),capture('https://example.com/b')]);
 const h=r.find(x=>x.playbook==='headings');
 assert.ok(h?.aiWhy);
 assert.match(h.aiEffect,/Not established/i);
 assert.match(h.confidence,/crawler access are not verified/i);
});
