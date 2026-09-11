import test from 'node:test';
import assert from 'node:assert/strict';
import {CRAWLERS} from '../shared/crawlers.mjs';
import {parseRobots, evaluateRobots, policyFromResponse, ROBOTS_MAX_BYTES} from '../src/lib/robots.mjs';
import {buildSearchAccess,evaluateCrawlerPolicy,accessPolicyFindings,accessSampleUrls} from '../src/v2/search-access.mjs';
import {makeReport} from '../src/v2/report.mjs';
import {scanContext} from '../src/v2/context.mjs';
import {runScan} from '../src/v2/pipeline.mjs';
import {fixtureFetch} from './helpers/site.mjs';
import {renderSearchAccess} from '../public/access-view.mjs';
import {recordingBrief} from '../shared/brief.mjs';
const root='https://example.com/';
const bot=id=>CRAWLERS.find(x=>x.id===id);
const policy=(raw,url=root,status=200,headers={'content-type':'text/plain'})=>policyFromResponse(url,{status,body:raw,headers},'2026-09-11T12:00:00Z');
const matrix=raw=>buildSearchAccess({requestedUrl:root,finalUrl:root,robots:policy(raw),responseStatus:200,access:{pageContentUsable:true}});
const state=(a,id)=>a.crawlers.find(x=>x.id===id);

test('24 unique registry tokens include the new Mistral split and two policy-only controls',()=>{
 assert.equal(CRAWLERS.length,24);assert.equal(new Set(CRAWLERS.map(c=>c.id)).size,24);
 assert.equal(bot('MistralAI-Index').role,'search');assert.equal(bot('MistralAI-Training').role,'training');
 assert.equal(CRAWLERS.filter(c=>c.kind==='policy').length,2);
 for(const c of CRAWLERS){assert.ok(c.source.startsWith('https://'));assert.equal(c.checkedAt,'2026-09-11');}
});
test('OpenAI search and training policies remain independent and training is not promoted',()=>{
 const a=matrix('User-agent: *\nAllow: /\nUser-agent: GPTBot\nDisallow: /');
 assert.equal(state(a,'OAI-SearchBot').summary.state,'allowed');assert.equal(state(a,'GPTBot').summary.state,'disallowed');assert.equal(accessPolicyFindings(a).length,0);
});
test('Google-Extended is mixed-use context, not an AI Overviews block or a network crawler',()=>{
 const a=matrix('User-agent: *\nAllow: /\nUser-agent: Google-Extended\nDisallow: /');
 assert.equal(state(a,'Googlebot').summary.state,'allowed');assert.equal(state(a,'Google-Extended').role,'mixed');assert.equal(state(a,'Google-Extended').providerAccess,'not-applicable');assert.equal(accessPolicyFindings(a).length,0);
});
test('Anthropic user-requested agent is robots-governed and can create a policy review',()=>{
 const a=matrix('User-agent: Claude-User\nDisallow: /');assert.match(accessPolicyFindings(a)[0].observation,/Claude-User/);
});
test('Advisory user fetcher rules never become proof of provider blocking',()=>{
 for(const id of ['ChatGPT-User','Perplexity-User','Amzn-User']){const a=matrix(`User-agent: ${id}\nDisallow: /`);assert.equal(state(a,id).summary.disallowed,1);assert.equal(state(a,id).policyBehavior,'advisory');assert.equal(accessPolicyFindings(a).length,0);}
});
test('Documentation gaps remain labeled, do not create search recommendations',()=>{
 for(const id of ['Bytespider','meta-externalagent','meta-externalfetcher']){const a=matrix(`User-agent: ${id}\nDisallow: /`);assert.equal(state(a,id).policyBehavior,'unverified');assert.equal(accessPolicyFindings(a).length,0);}
});
test('Explicit missing robots file is distinct from an allow rule',()=>{
 for(const status of [404,410]){const p=policy('<html>Not found</html>',root,status,{'content-type':'text/html'});const r=evaluateCrawlerPolicy(bot('OAI-SearchBot'),p,root);assert.equal(p.policyState,'missing');assert.equal(r.allowed,true);assert.equal(r.basis,'no-robots-file');assert.equal(r.matchedRule,null);}
});
test('401 403 429 and 5xx responses are unknown rather than assumed provider block or allow',()=>{
 for(const status of [401,403,429,500,502,503]){const p=policy('Denied',root,status);const a=buildSearchAccess({requestedUrl:root,robots:p});assert.equal(state(a,'Googlebot').summary.state,'unknown');assert.equal(accessPolicyFindings(a).length,0);}
});
test('A 200 HTML challenge is never parsed as an allow-all policy',()=>{
 const p=policy('<!DOCTYPE html><title>Just a moment</title>',root,200,{'content-type':'text/html'});assert.equal(p.policyState,'unknown');assert.equal(p.agents.Googlebot,null);
});
test('A challenge-marked 404 is unknown rather than no-file',()=>{
 assert.equal(policy('Checking your browser',root,404,{'cf-mitigated':'challenge'}).policyState,'unknown');
});
test('A legitimate Disallow captcha path is not mistaken for a security challenge',()=>{
 assert.equal(policy('User-agent: *\nDisallow: /captcha/').policyState,'parsed');
});
test('Oversized policy is not silently truncated to an allow',()=>{
 const p=policy('#'.repeat(ROBOTS_MAX_BYTES+1));assert.equal(p.policyState,'unknown');assert.equal(p.raw,null);
});
test('Malformed and unsupported policy syntax stays unknown with review context',()=>{
 for(const raw of ['<!DOCTYPE html>','Access denied','User-agent: *\nDisallow: private','User-agent: *\nDisallow: /\nThis is not a robots directive']){assert.equal(policy(raw).policyState,'unknown',raw);}
});
test('Empty and comments-only successful policies are permitted with no invented allow rule',()=>{
 for(const text of ['','# deliberately no crawl directives']){const p=policy(text),r=evaluateCrawlerPolicy(bot('Googlebot'),p,root);assert.equal(r.allowed,true);assert.equal(r.matchedRule,null);}
});
test('BOM, CR line endings, same-token groups and allow on equal specificity work with evidence lines',()=>{
 const p=parseRobots('\ufeffUser-agent: OAI-SearchBot\rDisallow: /service\rUser-agent: OAI-SearchBot\rAllow: /service');const r=evaluateRobots(p,root+'service','OAI-SearchBot',{exact:true});assert.equal(r.allowed,true);assert.equal(r.matchedRule.line,4);assert.deepEqual(r.groupLines,[1,3]);
});
test('Named empty Disallow does not merge with the next bot group or wildcard restrictions',()=>{
 const p=parseRobots('User-agent: *\nDisallow: /\nUser-agent: Googlebot\nDisallow:\nUser-agent: GPTBot\nDisallow: /');assert.equal(evaluateRobots(p,root,'Googlebot',{exact:true}).allowed,true);assert.equal(evaluateRobots(p,root,'GPTBot',{exact:true}).allowed,false);
});
test('Rules match case-sensitive paths and support terminal anchors and query strings',()=>{
 const p=parseRobots('User-agent: *\nDisallow: /Private/\nDisallow: /*?secret=*$\nDisallow: /exact$');
 assert.equal(evaluateRobots(p,root+'private/page','Googlebot').allowed,true);
 assert.equal(evaluateRobots(p,root+'Private/page','Googlebot').allowed,false);
 assert.equal(evaluateRobots(p,root+'page?secret=yes','Googlebot').allowed,false);
 assert.equal(evaluateRobots(p,root+'exact/more','Googlebot').allowed,true);
});
test('URL encoding normalization covers unreserved ASCII and UTF-8 without decoding reserved slashes',()=>{
 const p=parseRobots('User-agent: *\nDisallow: /caf\u00e9\nDisallow: /~path\nDisallow: /a%2Fb');
 for(const path of ['caf%C3%A9','%7Epath','a%2fb'])assert.equal(evaluateRobots(p,root+path,'Googlebot').allowed,false,path);
 assert.equal(evaluateRobots(p,root+'a/b','Googlebot').allowed,true);
});
test('The robots file itself is implicitly allowed',()=>{
 const r=evaluateRobots(parseRobots('User-agent: *\nDisallow: /'),root+'robots.txt','Googlebot');assert.equal(r.allowed,true);
});
test('Applebot documented Googlebot fallback is shown, without affecting Extended control',()=>{
 const p=policy('User-agent: *\nAllow: /\nUser-agent: Googlebot\nDisallow: /');
 const r=evaluateCrawlerPolicy(bot('Applebot'),p,root);assert.equal(r.allowed,false);assert.equal(r.evaluatedToken,'Googlebot');assert.match(r.fallbackNote,/fallback/);
 assert.equal(evaluateCrawlerPolicy(bot('Applebot-Extended'),p,root).allowed,true);
});
test('Explicit Applebot group overrides the Googlebot fallback',()=>{
 const p=policy('User-agent: Googlebot\nDisallow: /\nUser-agent: Applebot\nAllow: /');assert.equal(evaluateCrawlerPolicy(bot('Applebot'),p,root).allowed,true);
});
test('Amazon unspecified fallback remains unknown instead of inventing a precedence',()=>{
 const p=policy('User-agent: *\nDisallow: /\nUser-agent: Googlebot\nAllow: /');const r=evaluateCrawlerPolicy(bot('Amzn-SearchBot'),p,root);assert.equal(r.allowed,null);assert.equal(r.ruleAllowed,false);assert.equal(r.basis,'provider-fallback-unknown');
});
test('Explicit Amazon search group produces a direct policy result',()=>{
 const p=policy('User-agent: Googlebot\nDisallow: /\nUser-agent: Amzn-SearchBot\nAllow: /');assert.equal(evaluateCrawlerPolicy(bot('Amzn-SearchBot'),p,root).allowed,true);
});
test('A robots policy is never borrowed by an uninspected subdomain or HTTP origin',()=>{
 const a=buildSearchAccess({requestedUrl:root,robots:policy('User-agent: *\nAllow: /'),siteSnapshot:{pages:[{finalUrl:'https://docs.example.com/p'},{finalUrl:'http://example.com/p'}]}});
 assert.equal(state(a,'Googlebot').summary.unknown,2);assert.equal(state(a,'Googlebot').summary.state,'partial');
});
test('Homepage permission and a specific service-path disallow are not collapsed into one status',()=>{
 const a=buildSearchAccess({requestedUrl:root,finalUrl:root,robots:policy('User-agent: OAI-SearchBot\nDisallow: /services/\nAllow: /services/open/'),siteSnapshot:{pages:[{finalUrl:root+'services/a/'},{finalUrl:root+'services/open/'}]}});
 const c=state(a,'OAI-SearchBot');assert.equal(c.entry.allowed,true);assert.equal(c.summary.state,'mixed');assert.equal(c.summary.disallowed,1);assert.equal(c.results[1].matchedRule.line,2);assert.equal(accessPolicyFindings(a).length,1);
});
test('URL samples preserve origins, remove fragments, and stay bounded',()=>{
 assert.equal(accessSampleUrls({requestedUrl:root,finalUrl:root+'#fragment'}).length,1);
 const a=accessSampleUrls({requestedUrl:root,siteSnapshot:{pages:Array.from({length:150},(_,i)=>({finalUrl:root+i}))}});assert.equal(a.length,120);
});
test('Expanded coverage adds no per-bot page requests: one robots fetch per origin',async()=>{
 let robots=0;const r=await scanContext.run({fixtureFetch:async u=>{if(u.pathname==='/robots.txt')robots++;return fixtureFetch(u);},deadline:Date.now()+15000},()=>runScan(root,{mode:'snapshot',sampleSize:12,render:false}));assert.equal(robots,1);assert.equal(r.searchAccess.crawlers.length,24);assert.ok(r.searchAccess.pageCount>=12);assert.equal(r.searchAccess.scanner.identity,'CadenceAuditAssistant/2.0');
});
test('Page-only mode evaluates the requested and redirected origin independently',async()=>{
 const fake=async u=>u.pathname==='/robots.txt'?{status:200,headers:{'content-type':'text/plain'},body:`User-agent: OAI-SearchBot\n${u.hostname==='www.example.com'?'Disallow':'Allow'}: /`}:u.hostname==='example.com'?{status:301,headers:{location:'https://www.example.com/'},body:''}:fixtureFetch(u);
 const r=await scanContext.run({fixtureFetch:fake},()=>runScan(root,{mode:'page',render:false}));assert.equal(r.searchAccess.policies.length,2);assert.equal(state(r.searchAccess,'OAI-SearchBot').entry.allowed,false);
});
test('Scanner 403 and robots permission are independent evidence',()=>{
 const a=buildSearchAccess({requestedUrl:root,robots:policy('User-agent: *\nAllow: /'),responseStatus:403,access:{pageContentUsable:false,likelyInterference:true}});
 assert.equal(state(a,'OAI-SearchBot').summary.state,'allowed');assert.equal(a.scanner.state,'challenge-or-denial');assert.equal(state(a,'OAI-SearchBot').providerAccess,'not-verified');
});
test('Policy recommendation uses specific evidence and a solution, never promotes only GPTBot',()=>{
 const r=makeReport({facts:{requestedUrl:root,robots:policy('User-agent: OAI-SearchBot\nDisallow: /'),contentAnalysis:{usable:true}},findings:[]});assert.equal(r.recommendations[0].playbook,'ai');assert.match(r.recommendations[0].observation,/OAI-SearchBot/);assert.ok(r.recommendations[0].solution.length);assert.match(r.recommendations[0].evidence[1].value,/line 2/);
 const t=makeReport({facts:{requestedUrl:root,robots:policy('User-agent: GPTBot\nDisallow: /'),contentAnalysis:{usable:true}},findings:[]});assert.equal(t.recommendations.length,0);
});
test('Brief retains policy versus actual-access qualification',()=>{
 const r=makeReport({facts:{requestedUrl:root,robots:policy('User-agent: OAI-SearchBot\nDisallow: /'),contentAnalysis:{usable:true}},findings:[]});const text=recordingBrief(r);assert.match(text,/Actual provider access is not verified/);assert.match(text,/Training-only restrictions are policy choices/);
});
test('Policy UI escapes untrusted rule text and never creates executable links',()=>{
 const a=matrix('User-agent: OAI-SearchBot\nDisallow: /');a.crawlers[0].results[0].matchedRule={raw:'<script>alert(1)</script>',line:2};a.crawlers[0].results[0].robotsUrl='javascript:alert(1)';
 const html=renderSearchAccess(a);assert.doesNotMatch(html,/<script>/);assert.doesNotMatch(html,/href="javascript:/);assert.match(html,/&lt;script&gt;/);assert.match(html,/Actual provider access/);
});
test('Repeated-star path does not rely on exponential regex backtracking',{timeout:1000},()=>{
 const p=parseRobots('User-agent: *\nDisallow: /'+('*a'.repeat(300))+'b');assert.equal(evaluateRobots(p,root+'a'.repeat(1000)+'c','Googlebot').allowed,true);
});


test('Missing robots files are distinguished from inspected Allow rules in the UI',()=>{
 const a=buildSearchAccess({requestedUrl:root,robots:policy('',root,404)});
 const html=renderSearchAccess(a);
 assert.match(html,/No robots file; no restriction observed/);
 assert.doesNotMatch(html,/>Allowed by inspected rules</);
});
