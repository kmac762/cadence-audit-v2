import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYBOOKS,AI_RELEVANCE} from '../src/v2/playbooks.mjs';
import {presentReport} from '../src/v2/presentation.mjs';
import {makeReport} from '../src/v2/report.mjs';
import {browserAssistRecommendations} from '../src/v2/browser-assist.mjs';
import {recordingBrief} from '../shared/brief.mjs';

const scannerTerms=/sampled|inspected HTML|\b\d+\s*(?:of|\/)\s*\d+|scanner found|we opened/i;

test('client explanations describe meaning instead of repeating scanner evidence',()=>{
 for(const [key,p] of Object.entries(PLAYBOOKS)){
  assert.ok(p.talk.length>55,key+' talk too short');
  assert.doesNotMatch(p.talk,scannerTerms,key+' repeats scanner evidence');
 }
});

test('AI plain-English explanations avoid sample language',()=>{
 for(const [key,a] of Object.entries(AI_RELEVANCE)){
  assert.ok(a.talk.length>35,key+' AI talk too short');
  assert.doesNotMatch(a.talk,scannerTerms,key+' AI talk repeats scanner evidence');
 }
});

test('new recommendations keep observation and client explanation separate',()=>{
 const items=Array.from({length:4},(_,i)=>({issue:'Missing H1',url:`https://example.com/p${i}`,level:'issue',value:'No H1 detected'}));
 const r=makeReport({facts:{requestedUrl:'https://example.com',contentAnalysis:{usable:true},scanWarnings:[]},onPageQa:{pagesChecked:4,checks:[{id:'headings',category:'headings',label:'Headings',items,issueCount:4}]},findings:[]});
 const h=r.recommendations.find(x=>x.playbook==='headings');
 assert.match(h.observation,/4 of 4 sampled pages/i);
 assert.equal(h.talk,PLAYBOOKS.headings.talk);
 assert.doesNotMatch(h.talk,/4 of 4|sampled/i);
});

test('saved reports refresh the simple explanation without changing observation',()=>{
 const old={recommendations:[{id:'site:old',playbook:'headings',observation:'H1 missing on 14 pages.',talk:'H1 missing on 14 pages. Old explanation.',evidence:[]}]};
 const out=presentReport(old).recommendations[0];
 assert.equal(out.observation,'H1 missing on 14 pages.');
 assert.equal(out.talk,PLAYBOOKS.headings.talk);
 assert.doesNotMatch(out.talk,/14 pages/i);
});

test('saved Browser Assist recommendations also receive current plain-language explanation',()=>{
 const old={recommendations:[{id:'browser:missing-h1',playbook:'headings',observation:'Browser Assist did not detect an H1 on 2 of 3 pages.',talk:'We opened 3 pages.',evidence:[]}]};
 const out=presentReport(old).recommendations[0];
 assert.equal(out.observation,'Browser Assist did not detect an H1 on 2 of 3 pages.');
 assert.equal(out.talk,PLAYBOOKS.headings.talk);
});

test('Browser Assist talk is meaning-first rather than capture-count-first',()=>{
 const capture=url=>({schemaVersion:'cadence-browser-assist-1',capturedAt:new Date().toISOString(),url,page:{title:'Service',metaDescription:'',canonical:url,robots:'',language:'en',bodyWordCount:300,headings:{h1:[],h2:['Details'],emptyCount:0},structuredDataTypes:[],images:{total:1,missingAlt:0},links:{internalPrimary:2,externalPrimary:0},authorSignals:[],openGraph:{title:'',description:''}}});
 const h=browserAssistRecommendations([capture('https://example.com/a'),capture('https://example.com/b')]).find(x=>x.playbook==='headings');
 assert.ok(h);
 assert.doesNotMatch(h.talk,/2 of 2|captured|opened/i);
 assert.match(h.talk,/main topic obvious/i);
});

test('sales brief labels the plain explanation separately from observation',()=>{
 const p=PLAYBOOKS.headings,a=AI_RELEVANCE.headings;
 const report={finalUrl:'https://example.com',status:'completed',coverage:{},recommendations:[{id:'x',...p,observation:'H1 missing on 4 of 4 sampled pages.',solution:p.steps,evidence:[],aiLevel:a.level,aiWhy:a.why,aiEffect:a.effect,aiTalk:a.talk}]};
 const brief=recordingBrief(report);
 assert.match(brief,/What we observed: H1 missing on 4 of 4 sampled pages/i);
 assert.match(brief,/Simple client explanation:/);
 assert.match(brief,/AI relevance in plain English:/);
 assert.doesNotMatch(brief,/Simple client explanation:.*4 of 4/i);
});
