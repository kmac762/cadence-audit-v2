import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {RELEASE,API_VERSION,REVIEW_VALUES} from '../shared/release.mjs';
import {JobManager} from './v2/jobs.mjs';
import {sessionTools,securityHeaders} from './v2/security.mjs';
import {createScanLimits,scanLimitConfig} from './v2/scan-limits.mjs';
import {normalizeHttpUrl} from './lib/network-safety.mjs';
import {presentReport} from './v2/presentation.mjs';
import {checkRelease} from '../scripts/check-release.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
export async function createApp({dataDir=process.env.DATA_DIR||path.join(ROOT,'data'),secure=process.env.NODE_ENV==='production',managerOptions={},verifyAssets=true,limitOptions={}}={}){
 if(verifyAssets)await checkRelease(ROOT);
 await fs.mkdir(dataDir,{recursive:true,mode:0o700});const security=await sessionTools(dataDir,secure);const jobs=new JobManager({dataDir,...managerOptions});await jobs.init();
 const pruneTimer=setInterval(()=>jobs.prune().catch(e=>console.error(JSON.stringify({event:'retention_error',message:e.message}))),60000);pruneTimer.unref();
 const scanLimits=createScanLimits({...scanLimitConfig(),...limitOptions});
 const json=(res,status,value)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));};
 const readJson=async req=>{if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))throw Object.assign(new Error('Send JSON request data.'),{status:415,code:'CONTENT_TYPE'});let size=0;const chunks=[];for await(const b of req){size+=b.length;if(size>131072)throw Object.assign(new Error('Request is too large.'),{status:413});chunks.push(b);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Object.assign(new Error('Request is not valid JSON.'),{status:400,code:'BAD_JSON'});}};
 const server=http.createServer(async(req,res)=>{
  securityHeaders(res,secure);try{
   const pathname=new URL(req.url,'http://local.invalid').pathname;
   if(pathname==='/api/health')return json(res,200,{ok:true,release:RELEASE,schemaVersion:API_VERSION});
   if(pathname.startsWith('/api/')){
    const session=security.session(req,res);
    if(pathname==='/api/v2/bootstrap'&&req.method==='GET')return json(res,200,{release:RELEASE,schemaVersion:API_VERSION,csrf:session.csrf,auth:'anonymous-no-password',storageDirectoryConfigured:!!process.env.DATA_DIR,scanTimeoutSeconds:Math.round(jobs.timeoutMs/1000),retentionHours:24,scanLimits:scanLimits.inspect(session.owner)});
    if(req.method!=='GET'&&req.method!=='HEAD'){
     if(!security.csrfValid(req,session))return json(res,403,{error:{code:'SESSION_CHECK',message:'The browser session could not be verified. Refresh this page and retry; cookies must be enabled.'}});
     if(req.headers['x-app-version']!==RELEASE)return json(res,409,{error:{code:'VERSION_MISMATCH',message:'The app was updated. Refresh to load the matching interface before starting another scan.'}});
    }
    if(pathname==='/api/v2/jobs'&&req.method==='GET')return json(res,200,{jobs:jobs.list(session.owner)});
    if(pathname==='/api/v2/jobs'&&req.method==='POST'){
     const body=await readJson(req);let url;try{url=normalizeHttpUrl(body.url).href;}catch(e){return json(res,400,{error:{code:'INVALID_URL',message:e.message}});}
     if(!['page','snapshot'].includes(body.mode)||![12,18,24].includes(Number(body.sampleSize)))return json(res,400,{error:{code:'INVALID_OPTIONS',message:'Choose a page-only or sampled-site scan and a supported sample size.'}});
     const reservation=scanLimits.reserve(session.owner);
     if(!reservation.ok){res.setHeader('Retry-After',String(reservation.retryAfterSeconds));return json(res,429,{error:{code:'RATE_LIMIT',scope:reservation.scope,retryAfterSeconds:reservation.retryAfterSeconds,resetAt:reservation.resetAt,message:`The ${reservation.scope} scan-start limit was reached (${reservation.limits.perSession} per browser session / ${reservation.limits.global} across the app per hour). Try again in about ${Math.ceil(reservation.retryAfterSeconds/60)} minute(s). This is the audit app limit, not a denial from the scanned website.`}});}
     try{const job=await jobs.create(session.owner,{url,mode:body.mode,sampleSize:Number(body.sampleSize),render:body.render!==false});return json(res,202,{job,scanLimits:scanLimits.inspect(session.owner)});}catch(e){reservation.release();throw e;}
    }
    const m=pathname.match(/^\/api\/v2\/jobs\/([a-f0-9-]{36})(?:\/(result|review|cancel|browser-assist))?$/);
    if(m){const j=jobs.get(session.owner,m[1]);if(!j)return json(res,404,{error:{code:'NOT_FOUND',message:'This scan is not available in this browser session.'}});
     if(!m[2]&&req.method==='GET')return json(res,200,{job:jobs.public(j)});
     if(m[2]==='result'&&req.method==='GET')return json(res,200,{job:jobs.public(j),report:presentReport(j.report),reviews:j.reviews});
     if(m[2]==='cancel'&&req.method==='POST'){await jobs.cancel(session.owner,j.id);return json(res,200,{job:jobs.public(j)});}
     if(m[2]==='review'&&req.method==='POST'){const b=await readJson(req);if(!REVIEW_VALUES.includes(b.decision))return json(res,400,{error:{code:'REVIEW_VALUE',message:'Choose a valid review decision.'}});const reviews=await jobs.review(session.owner,j.id,String(b.findingId||''),b.decision,b.verified===true,b.note);return json(res,200,{reviews});}
     if(m[2]==='browser-assist'&&req.method==='POST'){const b=await readJson(req);if(!Array.isArray(b.captures)||!b.captures.length)return json(res,400,{error:{code:'BROWSER_CAPTURE_EMPTY',message:'Choose at least one Browser Assist capture.'}});if(b.captures.length>10)return json(res,400,{error:{code:'BROWSER_CAPTURE_LIMIT',message:'Import up to 10 Browser Assist captures per audit.'}});const merged=await jobs.addBrowserAssist(session.owner,j.id,b.captures);return json(res,200,{...merged,report:presentReport(merged.report)});}
    }
    return json(res,404,{error:{code:'API_NOT_FOUND',message:'Unknown API endpoint. Refresh to load the matching interface.'}});
   }
   if(req.method!=='GET'&&req.method!=='HEAD'){res.statusCode=405;res.end('Method not allowed.');return;}
   if(pathname==='/robots.txt'){res.setHeader('Content-Type','text/plain');res.end('User-agent: *\nDisallow: /\n');return;}
   const routes={'/':'public/index.html','/index.html':'public/index.html','/assets/access-view.mjs':'public/access-view.mjs','/assets/app.js':'public/app.js','/assets/styles.css':'public/styles.css','/assets/brand.css':'public/brand.css','/assets/release.mjs':'shared/release.mjs','/assets/brief.mjs':'shared/brief.mjs','/assets/demo.mjs':'public/demo.mjs','/assets/favicon.svg':'public/favicon.svg','/assets/brand-logo.svg':'public/brand-logo.svg'};
   const file=routes[pathname];if(!file){res.statusCode=404;res.setHeader('Content-Type','text/plain');res.end('Page not found.');return;}
   const type=file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':file.endsWith('.svg')?'image/svg+xml':'text/javascript';res.setHeader('Content-Type',type+'; charset=utf-8');const body=await fs.readFile(path.join(ROOT,file));res.end(req.method==='HEAD'?undefined:body);
  }catch(e){console.error(JSON.stringify({event:'request_error',message:String(e.message).slice(0,250)}));if(!res.headersSent)json(res,e.status||500,{error:{code:e.code||'SERVER_ERROR',message:e.status?e.message:'The service could not complete this request. The scan is not assumed successful.',jobId:e.jobId}});else res.end();}
 });
 server.headersTimeout=15000;server.requestTimeout=15000;server.keepAliveTimeout=5000;
 return{server,jobs,close:async()=>{clearInterval(pruneTimer);await jobs.close();await new Promise(r=>server.close(r));}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const app=await createApp();const port=Number(process.env.PORT||4318);app.server.listen(port,process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1',()=>console.log(JSON.stringify({event:'started',release:RELEASE,port,mode:'v2-staging',authentication:'no-password',workerConcurrency:1})));
 const stop=async()=>{await app.close();process.exit(0);};process.once('SIGTERM',stop);process.once('SIGINT',stop);
}
