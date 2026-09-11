import {CRAWLERS, CRAWLER_REGISTRY_VERSION, CRAWLER_REGISTRY_REVIEWED} from '../../shared/crawlers.mjs';
import {parseRobots, evaluateRobots, hasExplicitGroup} from '../lib/robots.mjs';
const valid = value => {try {const u = new URL(value); if(!['https:','http:'].includes(u.protocol)||u.username||u.password)return null; u.hash='';return u.href;} catch{return null;}};
export function accessSampleUrls(facts) {
  const urls = [facts.finalUrl, facts.requestedUrl];
  for(const p of facts.siteSnapshot?.pages || []) urls.push(p.finalUrl, p.requestedUrl);
  // The relationship sample is separately labeled; include the deep sample only.
  return [...new Set(urls.map(valid).filter(Boolean))].slice(0,120);
}
export function evaluateCrawlerPolicy(crawler, policy, targetUrl) {
  const common={url:targetUrl,robotsUrl:policy?.url || new URL('/robots.txt',targetUrl).href,
    fetchedAt:policy?.fetchedAt || null,policyState:policy?.policyState || 'unknown',
    allowed:null,ruleAllowed:null,matchedRule:null,matchedAgents:[],groupLines:[],
    evaluatedToken:crawler.id,basis:'policy-unavailable'};
  if(!policy || policy.policyState==='unknown')return {...common,reason:policy?.error || 'No robots policy was retrieved for this origin.'};
  if(new URL(policy.url).origin!==new URL(targetUrl).origin)return {...common,reason:'The available robots policy belongs to a different scheme, host or port.'};
  if(policy.policyState==='missing')return {...common,allowed:true,ruleAllowed:true,basis:'no-robots-file',reason:`No robots file at this origin (HTTP ${policy.status}); no robots restriction was observed.`,policyState:'missing'};
  if(policy.policyState!=='parsed' || typeof policy.raw!=='string')return {...common,reason:'Policy content is unavailable.'};
  const parsed=policy._parsed || parseRobots(policy.raw);let token=crawler.id, fallbackNote='';
  if(crawler.fallback==='Googlebot'&&!hasExplicitGroup(parsed,crawler.id)&&hasExplicitGroup(parsed,'Googlebot')){token='Googlebot';fallbackNote='Applebot is not explicitly named; Apple documents a Googlebot fallback.';}
  const match=evaluateRobots(parsed,targetUrl,token,{exact:true});
  if(crawler.fallback==='other-search-unspecified'&&!hasExplicitGroup(parsed,crawler.id)&&CRAWLERS.some(c=>c.role==='search'&&c.id!==crawler.id&&hasExplicitGroup(parsed,c.id))){
    return {...common,ruleAllowed:match.allowed,matchedRule:match.matchedRule,matchedAgents:match.matchedAgents,groupLines:match.groupLines,basis:'provider-fallback-unknown',reason:'Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict.'};
  }
  return {...common,...match,ruleAllowed:match.allowed,fallbackNote,
    reason:match.matchedRule?`${match.matchedRule.type==='allow'?'Allow':'Disallow'} matched at line ${match.matchedRule.line}.`:match.basis==='no-applicable-group'?'No applicable group; no robots restriction detected.':'No disallow rule matched this path in the selected group.'};
}
function aggregate(results){
  const allowed=results.filter(x=>x.allowed===true).length,disallowed=results.filter(x=>x.allowed===false).length,unknown=results.length-allowed-disallowed;
  return {allowed,disallowed,unknown,total:results.length,state:!results.length||unknown===results.length?'unknown':unknown?'partial':disallowed===results.length?'disallowed':disallowed?'mixed':'allowed'};
}
export function buildSearchAccess(facts={}) {
  const urls=accessSampleUrls(facts), policies={...(facts.robotsByOrigin || {})};
  if(facts.robots?.url){try{policies[new URL(facts.robots.url).origin] ||= facts.robots;}catch{}}
  const ready=Object.fromEntries(Object.entries(policies).map(([k,p])=>[k,{...p,_parsed:p.policyState==='parsed'?parseRobots(p.raw||''):null}]));
  const crawlers=CRAWLERS.map(c=>{
    const results=urls.map(u=>evaluateCrawlerPolicy(c,ready[new URL(u).origin],u));
    return {...c,results,summary:aggregate(results),entry:results.find(x=>x.url===valid(facts.finalUrl||facts.requestedUrl)) || null,
      providerAccess:c.kind==='policy'?'not-applicable':'not-verified',
      providerAccessNote:c.kind==='policy'?'This is a content-use token, not a separate network crawler. Provider processing was not verified.':'No authenticated provider requests or server/CDN logs were inspected.'};
  });
  const primary=crawlers.filter(c=>c.role==='search'&&c.policyBehavior==='robots');
  const sourcePolicies=[...new Set(urls.map(u=>new URL(u).origin))].map(origin=>{
    const p=policies[origin];return{origin,url:p?.url || new URL('/robots.txt',origin).href,finalUrl:p?.finalUrl||null,status:p?.status??null,state:p?.policyState||'unknown',fetchedAt:p?.fetchedAt||null,error:p?.error||(!p?'Origin was outside the bounded policy fetch allowance.':null),hash:p?.responseHash||null,bytes:p?.bytes??null,raw:p?.raw??null,redirects:p?.redirects||[],parseWarnings:p?.parseWarnings||[]};
  });
  const rawUsable=!!facts.access?.pageContentUsable;
  const scanner={status:facts.responseStatus??null,url:facts.finalUrl||facts.requestedUrl,identity:'CadenceAuditAssistant/2.0',
    state:facts.responseStatus==null?'not-fetched':rawUsable?'page-received':facts.access?.likelyInterference?'challenge-or-denial':'unusable-response',
    message:facts.responseStatus==null?'The entry page was not fetched; see scan coverage.':rawUsable?'Our HTTP request received usable page content. This does not verify any other crawler.':facts.access?.message||`Our scanner received HTTP ${facts.responseStatus} without usable page content. This is not proof of provider blocking.`,
    renderSucceeded:!!facts.rendered?.succeeded};
  return {registryVersion:CRAWLER_REGISTRY_VERSION,registryReviewedAt:CRAWLER_REGISTRY_REVIEWED,checkedAt:facts.scannedAt||null,
    scope:'Entered/final URL and deep-sampled URL paths; not a whole-site crawl. No provider user agents are impersonated.',
    pageCount:urls.length,urls,crawlers,policies:sourcePolicies,scanner,
    summary:{entries:crawlers.length,searchEntries:primary.length,searchRestricted:primary.filter(c=>c.summary.disallowed>0).length,
      searchClear:primary.filter(c=>c.summary.state==='allowed').length,searchUnknown:primary.filter(c=>c.summary.unknown>0||!c.summary.total).length,
      trainingRestricted:crawlers.filter(c=>c.role==='training'&&c.summary.disallowed>0).length,
      mixedUseRestricted:crawlers.filter(c=>c.role==='mixed'&&c.summary.disallowed>0).length},
    limitations:['Robots permission is not proof of network access, indexing, citation, ranking or inclusion.',
      'User-requested fetchers may not apply robots rules in the same way as automated crawlers. Read each provider note.',
      'Training and mixed-use preferences are policy choices, not automatic search defects.',
      'Meta/X-Robots-Tag, snippet controls, account-level settings and resource access can impose separate restrictions; this matrix evaluates robots.txt only.',
      'Unavailable, oversized, malformed or challenge responses stay unknown. Provider caches and undocumented fallback behavior can differ.',
      'The registry is versioned and manually reviewed, not automatically updated. Documentation gaps are marked per provider.']};
}
export function accessPolicyFindings(access) {
  const restricted=access.crawlers.filter(c=>['search','user'].includes(c.role)&&c.policyBehavior==='robots'&&c.summary.disallowed>0);
  if(!restricted.length)return[];
  const evidence=[];const affected=new Set();
  for(const c of restricted){
    evidence.push({label:c.label,value:`${c.id}: ${c.summary.disallowed} of ${c.summary.total} checked URL paths disallowed by the inspected policy. Actual provider access is not verified.`});
    for(const r of c.results.filter(x=>x.allowed===false).slice(0,2)){
      affected.add(r.url);
      evidence.push({label:`${c.id} / matching rule`,url:r.url,value:`${r.matchedRule?.raw||'Disallow'}; line ${r.matchedRule?.line??'unknown'}; groups: ${r.matchedAgents.join(', ')}. Robots: ${r.robotsUrl}. Retrieved: ${r.fetchedAt||'not recorded'}.${r.fallbackNote?' '+r.fallbackNote:''}`});
    }
  }
  return [{id:'search-access-policy-restrictions',scope:'sample',playbook:'ai',category:'ai-access',findingType:'opportunity',severity:'high',confidence:'confirmed',score:86,
    title:'Check whether search-related robots restrictions match the intended visibility policy',
    observation:`The inspected robots policies disallow at least one checked URL path for ${restricted.length} search or robots-governed retrieval agent${restricted.length===1?'':'s'}: ${restricted.map(x=>x.id).join(', ')}. Intent and actual provider access still need verification.`,
    evidence}];
}
