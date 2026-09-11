import {safeFetch} from '../lib/safe-fetch.mjs';
import {analyzeHtml} from '../lib/analyze-html.mjs';
import {assessHttpAccess} from '../lib/access.mjs';

const ASSET_RE=/\.(?:jpg|jpeg|png|gif|webp|svg|ico|pdf|zip|mp4|mp3|webm|css|js|xml|woff2?|ttf|eot)(?:$|\?)/i;
const BLOCK_STATUSES=new Set([401,403,407,429]);
const normalize=(value,base)=>{try{const u=new URL(value,base);if(!['http:','https:'].includes(u.protocol))return null;u.hash='';if(u.pathname!=='/')u.pathname=u.pathname.replace(/\/+$/,'');return u.href;}catch{return null;}};
const siteHost=value=>{try{return new URL(value).hostname.replace(/^www\./,'').toLowerCase();}catch{return'';}};
const sameSite=(a,b)=>siteHost(a)===siteHost(b);
function looksSoft404(body,raw){
 const title=String(raw?.title||'').toLowerCase(),h1=String(raw?.h1s?.[0]||'').toLowerCase();
 const first=String(body||'').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,1800).toLowerCase();
 const phrase=/\b(?:404|page not found|not found|page does not exist|page doesn['’]?t exist|we can['’]?t find|cannot be found|couldn['’]?t find)\b/;
 return phrase.test(title)||phrase.test(h1)||(phrase.test(first)&&Number(raw?.primaryWordCount||raw?.wordCount||0)<180);
}
function resultFromKnown(page){
 const status=Number(page?.status)||null;
 return{url:normalize(page?.requestedUrl||page?.finalUrl),finalUrl:normalize(page?.finalUrl||page?.requestedUrl),status,redirectCount:Number(page?.redirectCount||page?.redirects?.length||0),redirects:page?.redirects||[],accessState:page?.accessState||null,accessRestricted:!!page?.accessInterference||BLOCK_STATUSES.has(status)||['access-denied','challenge','target-rate-limit','skipped-after-denials'].includes(page?.accessState),requestAttempted:page?.requestAttempted!==false,soft404:false,error:page?.error||null,reusedWithinScan:true,sourceSitemap:page?.sourceSitemap||null};
}
function classify(r){
 if(!r)return'unknown';
 if(r.accessRestricted||BLOCK_STATUSES.has(Number(r.status))||!r.requestAttempted)return'unverified';
 const s=Number(r.status)||0;
 if(s===404||s===410)return'broken';
 if(s>=500)return'server-error';
 if(s>=400)return'broken';
 if(r.error){if(/too many redirects|redirect loop/i.test(r.error))return'loop';return'unverified';}
 if(r.soft404)return'soft-404';
 if((r.redirectCount||0)>=2)return'redirect-chain';
 if((r.redirectCount||0)===1)return'redirect';
 if(s>=200&&s<400)return'ok';
 return'unknown';
}
function examples(records,kind,max=8){return records.filter(r=>r.kind===kind).slice(0,max).map(r=>({url:r.url,finalUrl:r.finalUrl,status:r.status,redirectCount:r.redirectCount||0,sources:r.sources||[],sourceSitemap:r.sourceSitemap||null,error:r.error||null}));}
export async function inspectSiteHealth(facts,{mode='snapshot',maxTargets}={}){
 const entry=facts?.finalUrl||facts?.requestedUrl;if(!entry)return{enabled:false};
 const site=facts.siteSnapshot||{};
 const pages=[...(site.pages||[]),...(site.relationshipPages||[])];
 const known=new Map();
 const remember=p=>{const key=normalize(p?.requestedUrl||p?.finalUrl,entry);if(key&&!known.has(key))known.set(key,resultFromKnown(p));};
 for(const p of pages)remember(p);
 remember({requestedUrl:facts.requestedUrl,finalUrl:facts.finalUrl,status:facts.responseStatus,redirects:facts.redirectChain,redirectCount:facts.redirectChain?.length||0,accessState:facts.access?.kind,accessInterference:facts.access?.accessRestricted,requestAttempted:true});

 const sourcePages=[];
 const addSource=(url,hrefs)=>{const source=normalize(url,entry);if(!source)return;const list=[...new Set((hrefs||[]).map(h=>normalize(h,source)).filter(h=>h&&sameSite(h,entry)&&!ASSET_RE.test(new URL(h).pathname)))];if(list.length)sourcePages.push({source,hrefs:list});};
 const entryHtml=facts?.contentAnalysis?.html||facts?.raw;
 if(facts?.contentAnalysis?.usable)addSource(entry,entryHtml?.internalHrefs||[]);
 const seenSources=new Set([normalize(entry,entry)]);
 for(const p of pages){if(!p?.usable)continue;const source=normalize(p.finalUrl||p.requestedUrl,entry);if(!source||seenSources.has(source))continue;seenSources.add(source);addSource(source,p.internalHrefs||p.primaryInternalHrefs||[]);}

 const targetMap=new Map();
 for(const s of sourcePages)for(const href of s.hrefs){if(!targetMap.has(href))targetMap.set(href,{url:href,sources:[]});const t=targetMap.get(href);if(t.sources.length<4&&!t.sources.includes(s.source))t.sources.push(s.source);}
 const ranked=[...targetMap.values()].sort((a,b)=>b.sources.length-a.sources.length||a.url.localeCompare(b.url));
 const cap=Math.max(1,Math.min(Number(maxTargets)|| (mode==='page'?15:32),60));
 const selected=ranked.slice(0,cap);
 const results=[];
 for(const target of selected){
   let r=known.get(target.url);
   if(!r){
    try{
      const response=await safeFetch(target.url,'text/html,*/*;q=0.8',{requestProfile:'bounded site health'});
      const access=assessHttpAccess(response);let raw=null,soft404=false;
      if(response.status>=200&&response.status<300&&!access.accessRestricted&&/^(?:text\/html|application\/xhtml\+xml)/i.test(response.headers['content-type']||'text/html')){raw=analyzeHtml(response.body,response.finalUrl);soft404=looksSoft404(response.body,raw);}
      r={url:target.url,finalUrl:response.finalUrl,status:response.status,redirectCount:response.redirects?.length||0,redirects:response.redirects||[],accessState:access.kind,accessRestricted:access.accessRestricted,requestAttempted:true,soft404,error:null,reusedWithinScan:!!response.reusedWithinScan};
    }catch(error){r={url:target.url,finalUrl:target.url,status:null,redirectCount:0,accessState:null,accessRestricted:false,requestAttempted:error.requestAttempted!==false,error:error instanceof Error?error.message:'Unable to validate destination',errorCode:error.code||'FETCH_ERROR',soft404:false};}
   }
   results.push({...r,url:target.url,sources:target.sources,kind:classify(r)});
 }

 const sampledKnown=[...known.values()].filter(Boolean).map(r=>({...r,kind:classify(r)}));
 const sampledProblems=sampledKnown.filter(r=>['broken','server-error','loop','soft-404'].includes(r.kind));
 const sitemapProblems=sampledProblems.filter(r=>r.sourceSitemap);
 const problemUrls=new Set([...results.filter(r=>['broken','server-error','loop'].includes(r.kind)),...sampledProblems.filter(r=>['broken','server-error','loop'].includes(r.kind))].map(r=>normalize(r.url||r.finalUrl,entry)).filter(Boolean));
 const counts={checked:results.length,discovered:ranked.length,sourcePages:sourcePages.length,broken:results.filter(r=>r.kind==='broken').length,serverErrors:results.filter(r=>r.kind==='server-error').length,redirects:results.filter(r=>r.kind==='redirect').length,redirectChains:results.filter(r=>r.kind==='redirect-chain').length,loops:results.filter(r=>r.kind==='loop').length,soft404:results.filter(r=>r.kind==='soft-404').length,unverified:results.filter(r=>r.kind==='unverified'||r.kind==='unknown').length,sitemapProblems:sitemapProblems.length,sampledBrokenPages:sampledProblems.filter(r=>['broken','server-error','loop'].includes(r.kind)).length,confirmedProblems:problemUrls.size};
 return{enabled:true,bounded:true,maxTargets:cap,counts,results,examples:{broken:examples(results,'broken'),serverErrors:examples(results,'server-error'),redirects:[...examples(results,'redirect'),...examples(results,'redirect-chain')].slice(0,8),loops:examples(results,'loop'),soft404:examples(results,'soft-404'),unverified:[...examples(results,'unverified'),...examples(results,'unknown')].slice(0,8),sitemapProblems:sitemapProblems.slice(0,8).map(r=>({url:r.url,finalUrl:r.finalUrl,status:r.status,kind:r.kind,sourceSitemap:r.sourceSitemap,error:r.error||null}))},limitations:['This is a bounded sample of internal destinations, not a complete-site crawler.','HTTP 401, 403, 407, 429, challenge responses and skipped requests are unverified, not broken.','Soft-404 detection is a review cue based on page content and requires human confirmation.','Redirects are maintenance opportunities; a working redirect is not a broken page.']};
}
export function siteHealthFindings(health){
 if(!health?.enabled)return[];const f=[];const c=health.counts||{};
 const confirmed=c.confirmedProblems??((c.broken||0)+(c.serverErrors||0)+(c.loops||0)+(c.sampledBrokenPages||0));
 if(confirmed){
  const evidence=[...(health.examples.broken||[]),...(health.examples.serverErrors||[]),...(health.examples.loops||[]),...(health.examples.sitemapProblems||[])].slice(0,6).map(x=>({label:x.kind==='server-error'?'Server error':x.kind==='loop'?'Redirect loop':x.sourceSitemap?'Problem page from sitemap sample':'Broken internal destination',value:`${x.status?`HTTP ${x.status} - `:''}${x.url}`,url:x.url}));
  f.push({findingType:'issue',scope:'sample',playbook:'broken',id:'site-health-broken-paths',category:'internal-discovery',severity:'high',confidence:'confirmed',score:88,title:'Broken internal paths were found in the inspected site sample',whyItMatters:'Search engines use internal links and sitemaps to discover and revisit pages. Confirmed error destinations can waste crawl paths and prevent the intended page from being reached through that route.',recommendation:'Verify each affected source and destination, then restore the intended page, update the source link, or use a relevant redirect where the content genuinely moved.',videoTalkingPoint:'Some internal paths lead to pages that do not resolve normally. We would clean those up so search engines and AI retrieval systems can move through the site without hitting avoidable dead ends.',evidence});
 }
 const redirectCount=(c.redirects||0)+(c.redirectChains||0);
 if(!confirmed&&redirectCount>=3){const evidence=(health.examples.redirects||[]).slice(0,6).map(x=>({label:x.redirectCount>=2?'Redirect chain':'Redirected internal link',value:`${x.redirectCount} hop${x.redirectCount===1?'':'s'} - ${x.url}`,url:x.url}));f.push({findingType:'opportunity',scope:'sample',playbook:'links',id:'site-health-redirect-hygiene',category:'internal-discovery',severity:'medium',confidence:'confirmed',score:57,title:'Several internal links take an unnecessary redirect path',whyItMatters:'Working redirects are not broken, but linking directly to the final destination keeps internal crawl paths cleaner and avoids unnecessary hops.',recommendation:'Update recurring internal links to point directly to their final live destination and keep redirects for old external or historical URLs where they are still needed.',videoTalkingPoint:'Several internal links take an extra hop before reaching the live page. We would update those links to point directly to the final destination and keep the site’s crawl paths cleaner.',evidence});}
 if(!confirmed&&(c.soft404||0)>=2){const evidence=(health.examples.soft404||[]).slice(0,5).map(x=>({label:'Soft-404 candidate',value:x.url,url:x.url}));f.push({findingType:'opportunity',scope:'sample',playbook:'indexing',id:'site-health-soft-404-review',category:'indexability',severity:'medium',confidence:'manual-review',score:53,title:'Some successful URLs look like missing-page responses',whyItMatters:'A page can return HTTP 200 while its content says the page is missing. Search engines may treat that as a soft 404, so the response and page purpose should be reviewed.',recommendation:'Open the candidates manually, confirm whether real content exists, and return an appropriate error or redirect when the requested page is genuinely gone.',videoTalkingPoint:'A few URLs technically load but look like missing pages. We would verify those and make sure genuinely removed content returns the right response instead of sending mixed signals.',evidence});}
 return f;
}
