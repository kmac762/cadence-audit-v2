import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import { normalizeHttpUrl, resolvePublicHost } from './network-safety.mjs';
import { context, remainingMs } from '../v2/context.mjs';
const LIMIT=3*1024*1024;
export function createPinnedLookup(records) {
  return (_host,options,callback) => {
    if (!records.length) return callback(new Error('No validated DNS addresses.'));
    if(options && typeof options==='object' && options.all) return callback(null,records);
    const r=records.find(r=>!options?.family||r.family===options.family)||records[0]; callback(null,r.address,r.family);
  };
}
export function requestOnce(url,records,accept,options={}) {
  return new Promise((resolve,reject)=>{
    let timer,finished=false;
    const end=(error,result)=>{if(finished)return;finished=true;clearTimeout(timer);error?reject(error):resolve(result);};
    const req=(url.protocol==='https:'?https:http).request(url,{method:'GET',lookup:createPinnedLookup(records),servername:url.hostname.replace(/^\[|\]$/g,''),headers:{'user-agent':'CadenceAuditAssistant/2.0 (website audit; user initiated)',accept,'accept-encoding':'gzip,deflate,br','accept-language':'en-US,en;q=0.8'},agent:false},res=>{
      let stream=res,encoding=String(res.headers['content-encoding']||'').toLowerCase();
      if(encoding==='gzip')stream=res.pipe(zlib.createGunzip());
      else if(encoding==='br')stream=res.pipe(zlib.createBrotliDecompress());
      else if(encoding==='deflate')stream=res.pipe(zlib.createInflate());
      const chunks=[];let size=0,wire=0;
      res.on('data',b=>{wire+=b.length;if(wire>LIMIT)req.destroy(new Error('Response exceeded the download safety limit.'));});
      res.on('aborted',()=>end(new Error('Connection closed before the response completed.')));
      res.on('error',end);stream.on('error',end);
      stream.on('data',b=>{size+=b.length;if(size>LIMIT){stream.destroy();req.destroy(new Error('Expanded response exceeded the 3 MB safety limit.'));end(new Error('Expanded response exceeded the 3 MB safety limit.'));}else chunks.push(b);});
      stream.on('end',()=>{const headers={};for(const[k,v]of Object.entries(res.headers))if(v!==undefined)headers[k]=Array.isArray(v)?v.join(', '):String(v);end(null,{status:res.statusCode||0,headers,body:Buffer.concat(chunks).toString('utf8')});});
    });
    timer=setTimeout(()=>req.destroy(new Error('Website request timed out.')),Math.min(options.timeoutMs||10000,remainingMs(10000)));
    req.on('error',end);req.end();
  });
}
export async function safeFetch(input,accept='text/html,application/xhtml+xml',options={}) {
  const requested=normalizeHttpUrl(input),ctx=context();let current=requested;const redirects=[];
  for(let hop=0;hop<=5;hop++){
    remainingMs();current=normalizeHttpUrl(current.href);
    if(ctx.robotsAllowed && /^text\/html/.test(accept) && !ctx.robotsAllowed(current.href)) throw Object.assign(new Error('Skipped: robots.txt disallows this path for the audit crawler.'),{code:'ROBOTS_DISALLOWED'});
    ctx.requestCount=(ctx.requestCount||0)+1;
    if(ctx.requestCount>(ctx.maxRequests||150)) throw Object.assign(new Error('The scan request budget has been reached.'),{code:'REQUEST_BUDGET'});
    // Test injection is available to internal callers only; no API parameter enables it.
    const response=ctx.fixtureFetch ? await ctx.fixtureFetch(current,accept,options) : await requestOnce(current,await resolvePublicHost(current),accept,options);
    if([301,302,303,307,308].includes(response.status)&&response.headers.location){
      if(hop===5)throw new Error('Too many redirects.');redirects.push({url:current.href,status:response.status,location:response.headers.location});
      current=normalizeHttpUrl(new URL(response.headers.location,current).href);continue;
    }
    ctx.onRequest?.({url:current.href,status:response.status});
    return{requestedUrl:requested.href,finalUrl:current.href,...response,redirects,requestProfile:'CadenceAuditAssistant/2.0'};
  }
}
