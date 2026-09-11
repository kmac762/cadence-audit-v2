// Per-scan, per-origin request budget. No identity rotation, challenge solving or
// retrying denied URLs. Already-retrieved successful responses may be reused.
import {context, remainingMs} from './context.mjs';
import {assessHttpAccess} from '../lib/access.mjs';
export const REQUEST_INTERVAL_MS=700;
export const DENIAL_STOP_COUNT=3;
const CACHE_BYTES=6*1024*1024;
export function retryAfterSeconds(value,now=Date.now()){
 const s=String(value??'').trim();if(!s)return null;
 if(/^\d+$/.test(s))return Math.max(1,Number(s));
 const when=Date.parse(s);return Number.isFinite(when)?Math.max(1,Math.ceil((when-now)/1000)):null;
}
export function getRequestPolicy(ctx=context()){
 if(ctx.requestPolicy)return ctx.requestPolicy;
 const origins=new Map(),cache=new Map();let bytes=0;
 const stats={networkRequests:0,cacheHits:0,deniedResponses:0,skippedRequests:0,events:[]};
 const stateFor=url=>{const origin=new URL(url).origin;if(!origins.has(origin))origins.set(origin,{origin,tail:Promise.resolve(),lastFinished:0,consecutiveDenials:0,paused:false,reason:null,retryAfterSeconds:null});return origins.get(origin);};
 const record=(url,res,access)=>{if(stats.events.length<120)stats.events.push({url,status:res.status,classification:access.kind,signals:access.signals,requestId:res.headers?.['cf-ray']||res.headers?.['x-request-id']||null,retryAfterSeconds:retryAfterSeconds(res.headers?.['retry-after']),at:new Date().toISOString()});};
 const policy={stats,
  async run(url,accept,request){
   const state=stateFor(url),kind=/^text\/html/.test(accept)?'html':accept,key=kind+' '+url;
   const operation=state.tail.catch(()=>{}).then(async()=>{
    remainingMs();
    if(cache.has(key)){stats.cacheHits++;return {...cache.get(key),reusedWithinScan:true};}
    if(state.paused){stats.skippedRequests++;throw Object.assign(new Error('Further automated requests to this origin were skipped after access refusals or rate limiting. This is an audit coverage gap, not a search visibility finding.'),{code:'ACCESS_PAUSED',requestAttempted:false,origin:state.origin});}
    const interval=ctx.fixtureFetch?(ctx.fixtureIntervalMs??0):REQUEST_INTERVAL_MS;
    const wait=Math.max(0,state.lastFinished+interval-Date.now());
    if(wait>=remainingMs(20000))throw Object.assign(new Error('Scan time budget reached before the next paced request.'),{code:'SCAN_DEADLINE',requestAttempted:false});
    if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
    stats.networkRequests++;
    let res;try{res=await request();}finally{state.lastFinished=Date.now();}
    const access=assessHttpAccess({status:res.status,headers:res.headers,body:res.body});
    if(access.accessRestricted){stats.deniedResponses++;state.consecutiveDenials++;record(url,res,access);}else state.consecutiveDenials=0;
    const retry=retryAfterSeconds(res.headers?.['retry-after']);
    if(res.status===429 || (res.status===503&&retry) || state.consecutiveDenials>=DENIAL_STOP_COUNT){state.paused=true;state.reason=res.status===429?'Target returned HTTP 429':res.status===503?'Target requested a retry delay':'Repeated access refusals/challenges';state.retryAfterSeconds=retry;}
    if(res.status>=200&&res.status<300&&!access.accessRestricted){const size=Buffer.byteLength(res.body||'');if(size<=CACHE_BYTES){while(bytes+size>CACHE_BYTES&&cache.size){const oldest=cache.keys().next().value;bytes-=Buffer.byteLength(cache.get(oldest).body||'');cache.delete(oldest);}cache.set(key,res);bytes+=size;}}
    return res;
   });state.tail=operation;return operation;
  },
  summary(){return {...stats,minIntervalMs:REQUEST_INTERVAL_MS,denialStopCount:DENIAL_STOP_COUNT,pausedOrigins:[...origins.values()].filter(s=>s.paused).map(({origin,reason,retryAfterSeconds})=>({origin,reason,retryAfterSeconds}))};}
 };ctx.requestPolicy=policy;return policy;
}
