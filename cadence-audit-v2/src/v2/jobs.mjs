import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fork} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const TERMINAL=new Set(['completed','partial','failed','cancelled','interrupted']);
const normalWorker=fileURLToPath(new URL('./worker.mjs',import.meta.url));
export class JobManager {
 constructor({dataDir,workerPath=normalWorker,timeoutMs=180000,maxQueued=2,retentionMs=86400000,maxRecords=20}={}){
  this.dataDir=dataDir;this.workerPath=workerPath;this.timeoutMs=timeoutMs;this.maxQueued=maxQueued;this.retentionMs=retentionMs;this.maxRecords=maxRecords;this.jobs=new Map();this.queue=[];this.active=null;this.closing=false;this.writes=Promise.resolve();this.creations=Promise.resolve();
 }
 async init(){await fs.mkdir(path.join(this.dataDir,'jobs'),{recursive:true,mode:0o700});
  const names=(await fs.readdir(path.join(this.dataDir,'jobs'))).filter(n=>/^[a-f0-9-]{36}\.json$/.test(n));
  for(const name of names){try{const j=JSON.parse(await fs.readFile(path.join(this.dataDir,'jobs',name),'utf8'));if(Date.now()-Date.parse(j.createdAt)>this.retentionMs){await fs.unlink(path.join(this.dataDir,'jobs',name));continue;}if(!TERMINAL.has(j.state)){j.state='interrupted';j.error={code:'RESTARTED',message:'The service restarted before this scan finished. Completed checkpoints are retained; start a new scan to continue.'};j.finishedAt=new Date().toISOString();await this.save(j);}this.jobs.set(j.id,j);}catch{/* Do not turn an unreadable stored job into a successful scan. */}}
 }
 async save(job){const data=JSON.stringify(job);if(Buffer.byteLength(data)>6*1024*1024)throw new Error('Report exceeded the storage safety limit.');const file=path.join(this.dataDir,'jobs',job.id+'.json');this.writes=this.writes.catch(()=>{}).then(async()=>{const tmp=file+'.tmp';await fs.writeFile(tmp,data,{mode:0o600});await fs.rename(tmp,file);});return this.writes;}
 async prune(){const sorted=[...this.jobs.values()].filter(j=>TERMINAL.has(j.state)).sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt));for(const j of sorted){if(this.jobs.size<this.maxRecords&&Date.now()-Date.parse(j.createdAt)<this.retentionMs)continue;this.jobs.delete(j.id);await fs.rm(path.join(this.dataDir,'jobs',j.id+'.json'),{force:true});}}
 create(owner,input){const task=this.creations.catch(()=>{}).then(()=>this.createInternal(owner,input));this.creations=task;return task;}
 async createInternal(owner,input){if(this.closing)throw Object.assign(new Error('The service is restarting. Please retry shortly.'),{status:503,code:'RESTARTING'});await this.prune();
  const own=[...this.jobs.values()].find(j=>j.owner===owner&&!TERMINAL.has(j.state));if(own)throw Object.assign(new Error('A scan is already running or queued for this browser. Open it or cancel it first.'),{status:409,code:'OWN_SCAN_ACTIVE',jobId:own.id});
  if(this.queue.length>=this.maxQueued || this.jobs.size>=this.maxRecords)throw Object.assign(new Error('The scan queue is full. Please wait for a current scan to finish.'),{status:429,code:'QUEUE_FULL'});
  const j={id:crypto.randomUUID(),owner,input,state:'queued',createdAt:new Date().toISOString(),startedAt:null,finishedAt:null,progress:{stage:'queued',message:'Waiting for the scan worker'},report:null,reviews:{},error:null};await this.save(j);this.jobs.set(j.id,j);this.queue.push(j.id);setImmediate(()=>this.pump());return this.public(j);
 }
 get(owner,id){const j=this.jobs.get(id);return j?.owner===owner?j:null;}
 list(owner){return[...this.jobs.values()].filter(j=>j.owner===owner).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).map(j=>this.public(j));}
 public(j){return{id:j.id,state:j.state,createdAt:j.createdAt,startedAt:j.startedAt,finishedAt:j.finishedAt,url:j.input.url,mode:j.input.mode,progress:j.progress,error:j.error,hasReport:!!j.report,reviewCount:Object.keys(j.reviews).length};}
 async review(owner,id,findingId,decision,verified,note){const j=this.get(owner,id);if(!j)throw Object.assign(new Error('Scan not found in this browser session.'),{status:404});if(!TERMINAL.has(j.state))throw Object.assign(new Error('Wait for the scan to finish before reviewing.'),{status:409});if(!j.report?.recommendations.some(r=>r.id===findingId))throw Object.assign(new Error('Unknown recommendation.'),{status:400});if(decision==='use'&&!verified)throw Object.assign(new Error('Confirm that you reviewed the examples before selecting this for a video.'),{status:400});j.reviews[findingId]={decision,verified:!!verified,note:String(note||'').slice(0,1500),updatedAt:new Date().toISOString()};await this.save(j);return j.reviews;}
 async cancel(owner,id){const j=this.get(owner,id);if(!j)return false;if(TERMINAL.has(j.state))return true;j.state='cancelled';j.finishedAt=new Date().toISOString();j.error={code:'CANCELLED',message:'Scan cancelled. Any completed checkpoint is shown as partial, not a finished audit.'};this.queue=this.queue.filter(q=>q!==id);await this.save(j);if(this.active?.id===id){this.kill(this.active.child);clearTimeout(this.active.timer);}return true;}
 kill(child){if(!child?.pid)return;try{if(process.platform!=='win32')process.kill(-child.pid,'SIGKILL');else child.kill('SIGKILL');}catch{try{child.kill('SIGKILL');}catch{}}}
 async pump(){try{return await this.pumpOnce();}catch(e){const j=this.jobs.get(this.active?.id);if(j){j.state='failed';j.finishedAt=new Date().toISOString();j.error={code:'WORKER_SETUP',message:'The scan worker could not start. Check the service logs; no site-health conclusion was made.'};this.kill(this.active?.child);await this.save(j).catch(()=>{});}this.active=null;console.error(JSON.stringify({event:'worker_setup_error',message:e.message}));if(!this.closing&&this.queue.length)setImmediate(()=>this.pump());}}
 async pumpOnce(){if(this.active||this.closing)return;const id=this.queue.shift(),j=this.jobs.get(id);if(!j)return;if(j.state!=='queued')return this.pump();
  this.active={id,child:null,timer:null};
  j.state='running';j.startedAt=new Date().toISOString();j.progress={stage:'starting',message:'Starting an isolated scan worker'};await this.save(j);
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'cadence-v2-job-'));
  const env={PATH:process.env.PATH,HOME:process.env.HOME,LANG:'C.UTF-8',ENABLE_RENDERING:process.env.ENABLE_RENDERING||'1',CHROMIUM_PATH:process.env.CHROMIUM_PATH||'/usr/bin/chromium',JOB_TMP_DIR:temp};
  const child=fork(this.workerPath,[],{detached:process.platform!=='win32',stdio:['ignore','ignore','pipe','ipc'],execArgv:['--max-old-space-size=384'],env});let stderr='';child.stderr?.on('data',b=>{stderr=(stderr+String(b)).slice(-4000);});
  let finished=false;const finalize=async(code,signal)=>{if(finished)return;finished=true;clearTimeout(this.active?.timer);this.kill(child);
    if(!TERMINAL.has(j.state)){j.state=j.report?'partial':'failed';j.finishedAt=new Date().toISOString();j.error={code:'WORKER_EXIT',message:'The scan worker stopped before completion. The service is still available; completed checkpoints are not a full audit.'};console.error(JSON.stringify({event:'worker_exit',jobId:id,exitCode:code,signal,detail:stderr.slice(-1000)}));}
    try{await this.save(j);}catch(error){console.error(JSON.stringify({event:'storage_error',jobId:id,message:error.message}));}finally{await fs.rm(temp,{recursive:true,force:true}).catch(()=>{});this.active=null;void this.pump();}};
  const timer=setTimeout(()=>{if(!TERMINAL.has(j.state)){j.state=j.report?'partial':'failed';j.finishedAt=new Date().toISOString();j.error={code:'SCAN_TIMEOUT',message:'The scan reached its time limit. Completed checkpoints are available; uncompleted checks are not passes.'};void this.save(j);}this.kill(child);},this.timeoutMs);
  this.active={id,child,timer};
  child.on('message',async m=>{if(TERMINAL.has(j.state))return;try{
    if(m.type==='progress'){j.progress=m.value;await this.save(j);}
    if(m.type==='checkpoint'){j.report=m.value;await this.save(j);}
    if(m.type==='done'){j.report=m.value;j.state=['completed','partial','failed'].includes(m.value?.status)?m.value.status:'partial';j.progress={stage:'finished',message:j.state==='completed'?'Scan complete - recommendations await review':'Scan finished with coverage gaps'};j.finishedAt=new Date().toISOString();await this.save(j);}
    if(m.type==='failure'){j.state=j.report?'partial':'failed';j.error={code:'SCAN_ERROR',message:String(m.message).slice(0,250)};j.finishedAt=new Date().toISOString();await this.save(j);}
  }catch(e){console.error(JSON.stringify({event:'job_update_error',jobId:id,message:e.message}));}});
  child.once('error',()=>void finalize(-1,'spawn-error'));child.once('exit',(c,s)=>void finalize(c,s));child.send({input:j.input,deadline:Date.now()+this.timeoutMs-2500});
 }
 async close(){this.closing=true;for(const j of this.jobs.values())if(!TERMINAL.has(j.state)){j.state='interrupted';j.finishedAt=new Date().toISOString();j.error={code:'RESTARTED',message:'The service stopped before completion. Start a new scan to retry; this is not a completed audit.'};await this.save(j);}if(this.active){clearTimeout(this.active.timer);this.kill(this.active.child);}await this.writes;}
}
