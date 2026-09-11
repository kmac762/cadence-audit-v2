import {buildSearchAccess,accessPolicyFindings} from './search-access.mjs';
import {getRequestPolicy} from './request-policy.mjs';
import {RELEASE,API_VERSION} from '../../shared/release.mjs';
import {PLAYBOOKS,AI_RELEVANCE,playbookKey} from './playbooks.mjs';
import {addPriorityComposites,selectDiverseFindings} from '../lib/priority.mjs';
const uniq=a=>[...new Set(a.filter(Boolean))];
function normalEvidence(f){return(f.evidence||[]).slice(0,30).map(e=>({label:String(e.label||'Observation').slice(0,120),value:String(e.value??'').slice(0,1200),url:validUrl(e.url)||validUrl(e.value)}));}
function validUrl(v){try{const u=new URL(v);return['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
function qaCandidates(qa){if(!qa?.checks)return[];const count=qa.pages?.length||qa.pagesChecked||qa.pageCount||0;const out=[];
 for(const m of qa.checks){
   const groups=new Map();for(const item of m.items||[]){const k=item.issue||m.label;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(item);}
   for(const[issue,items]of groups){const urls=uniq(items.map(i=>i.url));const important=/Missing title|Multiple title|Missing H1|Placeholder|broken|Noindex/i.test(issue);const routine=/long|short|level jump|empty heading|generic alt|Open Graph/i.test(issue);const promote=(important && urls.length>0)||(!routine&&urls.length>=3&&urls.length/Math.max(1,count)>=.3);
    if(!promote)continue;
    const key=/H1|heading/.test(issue)?'headings':m.id==='meta-descriptions'?'metadata':m.id==='titles'?'titles':m.id==='images'?'images':m.id==='hreflang'?'international':m.id==='canonical-indexing'?'indexing':m.id==='internal-link-health'?'broken':null;
    if(!key || /access denied|could not be validated|skip/i.test(issue))continue;
    const id='qa2-'+m.id+'-'+issue.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    out.push({id,scope:'sample',findingType:key==='indexing'?'issue':'opportunity',category:key==='headings'?'headings':m.category,confidence:'confirmed',severity:key==='indexing'?'high':'medium',score:important?75:58,playbook:key,observation:issue==='Missing H1'?`The main heading element (H1) was not detected in the inspected HTML for ${urls.length} of ${count} sampled pages.`:`${issue} was recorded on ${urls.length} of ${count} inspected pages.`,evidence:items.slice(0,20).map(i=>({label:issue,value:i.value,url:i.url})),affected:urls.length,denominator:count,qaIssue:issue});
   }
 }
 return out;
}
function observation(f,key){if(f.observation)return f.observation;
 const ev=normalEvidence(f);const metrics=ev.filter(e=>!e.url).slice(0,3).map(e=>`${e.label}: ${e.value}`).join('; ');
 if(key==='rendering')return 'The initial and rendered entry-page extraction differed. '+metrics+'. This needs a comparison of the actual sections, not a percentage claim based on counts.';
 if(key==='schema')return `The sample contains pages where the scanner did not detect a corresponding page-specific structured-data type. ${uniq(ev.map(e=>e.url)).length?uniq(ev.map(e=>e.url)).length+' example URLs are listed below.':''}`;
 if(key==='sources')return `The source-link classifier found limited supporting-source links in the inspected article content. ${metrics}. This does not establish that the articles have no references.`;
 if(key==='authors')return `The authorship checks flagged a relationship or profile signal for review. ${metrics}. Confirm what is visible and what is expressed in markup.`;
 if(key==='access')return `The audit request encountered an access or response problem. ${metrics}. The response seen by normal visitors or verified search bots has not been established.`;
 return [String(f.title||'An observation requires review.').replace(/sitewide/gi,'in the sample'),metrics].filter(Boolean).join('. ');
}
function normalizeQa(qa){if(!qa)return{pagesChecked:0,checks:[],patterns:[],pages:[],issueObservations:0,reviewObservations:0};
 const pages=qa.pageSummaries||qa.pages||[],count=qa.pagesChecked||pages.length||qa.pageCount||0;
 const checks=(qa.checks||[]).map(c=>({...c,status:count?c.status:'not-checked',summary:count?c.summary:'No usable pages were available for this check.'}));
 // A disabled link check must not be advertised as a pass.
 for(const c of checks)if(c.id==='internal-link-health' && /not run/i.test(c.summary))c.status='not-checked';
 return{pagesChecked:count,checks,patterns:qa.templatePatterns||[],pages,issueObservations:checks.reduce((n,c)=>n+(c.issueCount||0),0),reviewObservations:checks.reduce((n,c)=>n+(c.reviewCount||0),0)};
}
export function makeReport(raw,finished=true){
 const f=raw.facts||{},qa=normalizeQa(raw.onPageQa),site=f.siteSnapshot||{},warnings=[...(f.scanWarnings||[])];
 const searchAccess=buildSearchAccess(f);
 const synthesized=qaCandidates({...raw.onPageQa,pagesChecked:qa.pagesChecked});
 const replaced=new Set(synthesized.map(s=>s.playbook));
 // Legacy aggregate QA phrasing is deliberately not used as sales copy.
 let findings=(raw.findings||[]).filter(x=>!/^onpage-systemic/.test(x.id||''));
 // A scanner denial is a coverage warning, not a client search recommendation.
 findings=findings.filter(x=>playbookKey(x)!=='access');
 // Sparse denied samples must not generate missing-schema/link/template patterns.
 const sampledUsable=(site.pages||[]).filter(p=>p.usable).length;
 const sampleAdequate=!site.enabled || sampledUsable>=Math.min((site.pages||[]).length,Math.max(3,Math.ceil((site.pages||[]).length*.6)));
 const rel=site.relationshipGraph||{};
 const relAdequate=!rel.enabled || rel.usablePageCount>=Math.max(3,Math.ceil((rel.pageCount||0)*.6));
 findings=findings.filter(x=>x.scope==='page'||(sampleAdequate&&(!/relationship|expanded|contextual.*inbound|articles.*commercial|content-pathways/i.test([x.id,x.title].join(' '))||relAdequate)));
 if(site.enabled&&!sampleAdequate)warnings.push({component:'Recommendation coverage',message:'Too little of the selected sample was usable for broad template or architecture recommendations. Specific observed page checks may remain.'});
 findings=findings.filter(x=>!(replaced.has(playbookKey(x))&&/title|h1|heading|meta-pattern/i.test(x.id||'')));
 findings=[...findings,...synthesized];
 // Training-bot-only policy is diagnostic context, not a search-visibility recommendation.
 findings=findings.filter(x=>!['robots-ai-crawlers-block','robots-oai-search-block','robots-googlebot-block'].includes(x.id));
 findings.push(...accessPolicyFindings(searchAccess));
 findings=addPriorityComposites(findings);
 const unique=new Map();for(const item of findings){const key=`${item.scope||'page'}:${item.id}`;if(!unique.has(key)||Number(item.score)>Number(unique.get(key).score))unique.set(key,item);}
 const all=[...unique.values()];
 const ranked=all.filter(x=>!['social'].includes(x.playbook||playbookKey(x))).map(x=>{const key=x.playbook||playbookKey(x);return {...x,score:['sources','authors'].includes(key)?Math.min(Number(x.score)||0,48):key==='headings'?Math.min(Number(x.score)||0,64):x.score};});
 let top=selectDiverseFindings(ranked,8);const seen=new Set();top=top.filter(x=>{const k=x.playbook||playbookKey(x);if(seen.has(k))return false;seen.add(k);return true;}).slice(0,5);
 const recommendations=top.map(x=>{const key=x.playbook||playbookKey(x),p=PLAYBOOKS[key],ai=AI_RELEVANCE[key]||{},evidence=normalEvidence(x);const observed=observation(x,key).replace(/\.\./g,'.');return{id:`${x.scope||'page'}:${x.id}`,playbook:key,title:p.title,theme:p.theme,observation:observed,why:p.why,searchEffect:p.searchEffect||p.caveat,aiLevel:ai.level||'',aiWhy:ai.why||'',aiEffect:ai.effect||'',aiSource:ai.source||'',aiTalk:ai.talk||'',solution:p.steps,success:p.success,verify:p.steps[0],caveat:p.caveat,userNote:p.userNote||'',effort:p.effort,priority:['critical','high'].includes(x.severity)&&['indexing','broken'].includes(key)?'Investigate promptly':'Planned review',confidence:x.confidence==='confirmed'?'Observed in inspected output; interpretation needs review':'Heuristic or sample-based; verify examples',talk:`${observed} ${p.talk}`,source:p.source,evidence,review:'unreviewed',scope:x.scope==='page'?'Entry page':'Inspected sample',originalFinding:{id:x.id,title:x.title,category:x.category,confidence:x.confidence}};});
 const usable=site.enabled?(site.pages||[]).filter(p=>p.usable).length:(f.access?.pageContentUsable?1:0);
 const anyUsable=usable>0||!!f.contentAnalysis?.usable;
 const requestPolicy=f.requestPolicy||getRequestPolicy().summary();
 const samplePages=site.enabled?(site.pages||[]):[];
 const relationPages=site.relationshipPages||[];
 const accessAdvice=requestPolicy.deniedResponses?{title:'Scanner access is limited - not a search-crawler finding',message:'The hosting server received denials or challenges. A browser entry-page fallback, when usable, is a separate inspection and does not make the raw-HTML sample complete.',actions:['For a site you own or are authorized to audit, ask the administrator to inspect the denied request times and request IDs in the firewall/server logs.','Use a narrowly scoped, temporary allow rule for the authorized scanner only. Do not disable the site firewall or allow an entire shared hosting network indiscriminately.','For prospect sites without administrator cooperation, verify accessible pages manually. This release does not solve CAPTCHAs, rotate identities or guarantee access.'],actualProviderAccess:'Not verified'}:null;
 return{schemaVersion:API_VERSION,release:RELEASE,requestedUrl:f.requestedUrl,finalUrl:f.finalUrl||f.requestedUrl,scannedAt:f.scannedAt||new Date().toISOString(),complete:finished&&warnings.length===0&&anyUsable,status:!finished?'running':!anyUsable?'failed':warnings.length?'partial':'completed',pageType:f.pageType||'page',coverage:{entryStatus:f.responseStatus??null,entryUsable:!!f.contentAnalysis?.usable,sampleAttempted:site.enabled?samplePages.filter(p=>p.requestAttempted!==false).length:(f.responseStatus?1:0),samplePlanned:site.enabled?samplePages.length:1,sampleUsable:usable,sampleDenied:samplePages.filter(p=>['access-denied','challenge','target-rate-limit'].includes(p.accessState)).length,sampleSkipped:samplePages.filter(p=>p.requestAttempted===false).length,entryAnalysisSource:f.contentAnalysis?.source||null,relationshipPages:site.relationshipGraph?.usablePageCount||0,relationshipPlanned:site.relationshipGraph?.pageCount||0,relationshipAttempted:relationPages.filter(p=>p.requestAttempted!==false).length,sitemapUrls:site.sitemapPageCount||0,discoverySource:site.discoverySource|| (site.enabled?'sitemaps':'page-only'),renderRequested:!!f.rendered?.enabled,renderSucceeded:!!f.rendered?.succeeded,renderedPageCount:f.rendered?.succeeded?1:0,rawPrimaryWords:f.access?.pageContentUsable?f.raw?.primaryWordCount??null:null,renderedPrimaryWords:f.rendered?.succeeded?f.rendered.html?.primaryWordCount??null:null},warnings,accessAdvice,recommendations,qa,searchAccess,diagnostics:{requestPolicy,relationshipPages:relationPages.map(p=>({url:p.finalUrl||p.requestedUrl,status:p.status,usable:!!p.usable,requestAttempted:p.requestAttempted!==false,accessState:p.accessState,errorCode:p.errorCode||null,error:p.error||null})),... {crawlerPolicy:f.robots?.agents||{},robotsUrl:f.robots?.url||null,robotsError:f.robots?.error||null,findings:all.map(x=>({id:x.id,title:x.title,scope:x.scope,category:x.category,confidence:x.confidence,evidence:normalEvidence(x)})),samplePages:(site.pages||[]).map(p=>({url:p.finalUrl||p.requestedUrl,status:p.status,pageType:p.pageType,usable:!!p.usable,requestAttempted:p.requestAttempted!==false,accessState:p.accessState||null,errorCode:p.errorCode||null,requestReference:p.requestReference||null,error:p.error||null})),templateProfiles:site.templateProfiles||{}}},limitations:['This is a bounded sample, not a complete site audit.','Only the entered URL is browser-rendered; other sampled pages are inspected as initial HTML.','Detected markup, links and counts do not establish lost rankings, traffic, leads or revenue.','All recommendations require a human review of intent and examples.']};
}
