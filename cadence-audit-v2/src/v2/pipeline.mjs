import {safeFetch} from '../lib/safe-fetch.mjs';
import {normalizeHttpUrl} from '../lib/network-safety.mjs';
import {analyzeHtml} from '../lib/analyze-html.mjs';
import {analyzeRobots,parseRobots,isAllowed} from '../lib/robots.mjs';
import {renderPage} from '../lib/render.mjs';
import {generateFindings} from '../lib/rules.mjs';
import {assessHttpAccess} from '../lib/access.mjs';
import {createSiteSnapshot,disabledSiteSnapshot} from '../lib/site-snapshot.mjs';
import {classifyUrlType} from '../lib/page-type.mjs';
import {buildOnPageQa} from '../lib/on-page-qa.mjs';
import {context} from './context.mjs';
import {getRequestPolicy} from './request-policy.mjs';
import {makeReport} from './report.mjs';
import {accessSampleUrls} from './search-access.mjs';
import {inspectSiteHealth,siteHealthFindings} from './site-health.mjs';
import {analyzeContentFreshness,contentFreshnessFindings} from './content-freshness.mjs';

export async function runScan(input,options={},hooks={}) {
  const url=normalizeHttpUrl(input).href;
  const progress=p=>hooks.progress?.(p);
  const facts={requestedUrl:url,finalUrl:url,scannedAt:new Date().toISOString(),pageType:classifyUrlType(url),responseStatus:null,responseHeaders:{},redirectChain:[],raw:null,access:{pageContentUsable:false},contentAnalysis:{usable:false,html:null,source:null},rendered:{enabled:options.render!==false,succeeded:false,pending:true},robots:{agents:{},sitemaps:[]},robotsByOrigin:{},siteSnapshot:disabledSiteSnapshot(),scanWarnings:[],scanComplete:false};
  let qa=null;let phase='access';
  facts.siteHealth={enabled:false};
  facts.contentFreshness={enabled:false};
  const loadPolicy=async target=>{
    const origin=new URL(target).origin;
    if(!facts.robotsByOrigin[origin])facts.robotsByOrigin[origin]=await analyzeRobots(target);
    context().robotsAllowed=u=>{const p=facts.robotsByOrigin[new URL(u).origin];return p?.policyState==='parsed'?isAllowed(parseRobots(p.raw),u,'CadenceAuditAssistant'):true;};
    return facts.robotsByOrigin[origin];
  };
  const completePolicies=async()=>{for(const u of accessSampleUrls(facts)){if(Object.keys(facts.robotsByOrigin).length>=4&&!facts.robotsByOrigin[new URL(u).origin])continue;await loadPolicy(u);}};
  const checkpoint=()=>hooks.checkpoint?.(makeReport({facts,onPageQa:qa,findings:[]},false));
  const warning=(component,message)=>facts.scanWarnings.push({component,message});
  try {
    progress({stage:'access',message:'Checking crawler policy and retrieving the entry page'});
    facts.robots=await loadPolicy(url);
    if(facts.robots.error)warning('robots.txt',facts.robots.error);
    if(context().robotsAllowed && !context().robotsAllowed(url)) {warning('Entry page','The site disallows this path for the audit crawler. No page fetch or rendering was attempted.');facts.rendered={enabled:false,succeeded:false};return makeReport({facts,onPageQa:null,findings:[]},true);}
    const page=await safeFetch(url);
    Object.assign(facts,{requestedUrl:page.requestedUrl,finalUrl:page.finalUrl,responseStatus:page.status,responseHeaders:page.headers,redirectChain:page.redirects});
    if(new URL(page.finalUrl).origin!==new URL(url).origin){facts.robots=await loadPolicy(page.finalUrl);if(facts.robots.error)warning('robots.txt',facts.robots.error);}
    facts.raw=analyzeHtml(page.body,page.finalUrl);
    facts.access=assessHttpAccess({status:page.status,headers:page.headers,body:page.body,rawAnalysis:facts.raw});
    if(!/^text\/html|application\/xhtml\+xml/i.test(page.headers['content-type']||'text/html'))facts.access.pageContentUsable=false;
    facts.contentAnalysis={usable:facts.access.pageContentUsable,html:facts.access.pageContentUsable?facts.raw:null,source:facts.access.pageContentUsable?'initial-html':null};
    if(!facts.contentAnalysis.usable)warning('Entry page',facts.access.message||`The scanner received HTTP ${page.status} or a non-HTML document. This is not proof that search crawlers are blocked.`);
    checkpoint();
    if(context().robotsAllowed && !context().robotsAllowed(facts.finalUrl)){warning('Redirect destination','The final origin disallows this path for the audit crawler. Further rendering and sampling were skipped.');facts.rendered={enabled:false,succeeded:false};return makeReport({facts,onPageQa:null,findings:[]},true);}
    if(options.render!==false&&!([401,407,429].includes(facts.responseStatus))){phase='rendering';progress({stage:phase,message:'Comparing entry-page HTML with a controlled browser render'});facts.rendered=await (hooks.render||renderPage)(facts.finalUrl,facts.contentAnalysis.usable?facts.raw:null);if(!facts.rendered.succeeded)warning('Rendering',facts.rendered.error||'Browser rendering did not complete.');}
    else {facts.rendered={enabled:options.render!==false,succeeded:false};if(options.render!==false)warning('Rendering','Browser rendering was skipped after an explicit authentication or rate-limit response from the target.');}
    if(!facts.contentAnalysis.usable && facts.rendered.succeeded)facts.contentAnalysis={usable:true,source:'rendered-fallback',html:facts.rendered.html};
    checkpoint();
    if(options.mode!=='page' && facts.contentAnalysis.usable){
      phase='pages';
      const entryOrigin=new URL(facts.finalUrl).origin;
      facts.robots=await loadPolicy(facts.finalUrl);
      facts.siteSnapshot=await createSiteSnapshot(facts.finalUrl,facts.robots,{sampleSize:options.sampleSize||18,seedUrls:facts.contentAnalysis.html?.internalHrefs||[],onProgress:progress});
      const bad=facts.siteSnapshot.pages.filter(p=>!p.usable);
      if(bad.length)warning('Page sample',`${bad.length} of ${facts.siteSnapshot.pages.length} sampled pages could not be inspected as normal HTML.`);
      const relBad=(facts.siteSnapshot.relationshipPages||[]).filter(p=>!p.usable);
      if(relBad.length)warning('Link-mapping sample',`${relBad.length} of ${facts.siteSnapshot.relationshipPages.length} selected relationship URLs were not usable. They are excluded from link calculations.`);
      if(!facts.siteSnapshot.sitemapFound)warning('Discovery','No usable sitemap was found within the bounded discovery checks. The sample may use only links from the entry page.');
      checkpoint();
    }
    phase='bot-policy';progress({stage:phase,message:'Evaluating search, user-request and training policies across the URL sample'});await completePolicies();
    phase='site-health';progress({stage:phase,message:'Checking a bounded sample of internal destinations for errors and redirects'});
    facts.siteHealth=await inspectSiteHealth(facts,{mode:options.mode,maxTargets:options.mode==='page'?15:32});
    const healthGaps=(facts.siteHealth.results||[]).filter(r=>['unverified','unknown'].includes(r.kind));
    if(healthGaps.length>=Math.max(3,Math.ceil((facts.siteHealth.results||[]).length*.2)))warning('Site health',`${healthGaps.length} internal destination check${healthGaps.length===1?' was':'s were'} blocked, skipped or inconclusive. They are shown as unverified, not broken.`);
    const entryKey=new URL(facts.finalUrl).href.replace(/\/+$/,'');
    const entryResults=(facts.siteHealth.results||[]).filter(r=>(r.sources||[]).some(src=>String(src).replace(/\/+$/,'')===entryKey)).slice(0,20);
    const links={enabled:!!facts.contentAnalysis?.usable,limit:20,sourceUrl:facts.finalUrl,checked:entryResults.length,results:entryResults};
    phase='freshness';progress({stage:phase,message:'Reviewing sampled blog content for freshness and consolidation signals'});
    facts.contentFreshness=analyzeContentFreshness(facts);
    facts.requestPolicy=getRequestPolicy().summary();
    if(facts.requestPolicy.pausedOrigins.length)warning('Scanner access','Further requests were stopped after repeated denials or a target rate limit. Do not infer search-crawler blocking or missing content from uninspected pages.');
    qa=buildOnPageQa(facts,links);
    facts.scanComplete=facts.scanWarnings.length===0;
    progress({stage:'recommendations',message:'Connecting observations to solutions and verification steps'});
    let pageFindings=[];
    try {pageFindings=generateFindings(facts).map(f=>({scope:'page',...f}));}catch(error){warning('Finding rules','Some page-level rules could not be evaluated.');}
    const findings=[...pageFindings,...(facts.siteSnapshot.findings||[]),...(qa.findings||[]),...siteHealthFindings(facts.siteHealth),...contentFreshnessFindings(facts.contentFreshness)];
    const report=makeReport({facts,onPageQa:qa,findings},true);
    hooks.checkpoint?.(report);return report;
  }catch(error){
    warning(phase,error.code==='ENOTFOUND'?'The server could not resolve this website hostname. No conclusions about the website can be drawn.':String(error.message||error).slice(0,220));
    if(facts.rendered.pending)facts.rendered={enabled:options.render!==false,succeeded:false};
    return makeReport({facts,onPageQa:qa,findings:[]},true);
  }
}
