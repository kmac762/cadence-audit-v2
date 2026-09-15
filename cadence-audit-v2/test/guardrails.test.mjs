import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {startEgressProxy} from '../src/v2/egress.mjs';
import {checkRelease} from '../scripts/check-release.mjs';
import {RELEASE} from '../shared/release.mjs';
function connectRequest(port,target){return new Promise((resolve,reject)=>{const s=net.connect(port,'127.0.0.1',()=>s.write(`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n\r\n`));let result='';s.on('data',b=>result+=b);s.on('end',()=>resolve(result));s.on('error',reject);s.setTimeout(1500,()=>s.destroy(new Error('Timed out')));});}
test('Browser CONNECT proxy rejects local and cloud metadata destinations',async()=>{const proxy=await startEgressProxy();try{for(const host of ['127.0.0.1:443','169.254.169.254:443','[::ffff:127.0.0.1]:443'])assert.match(await connectRequest(proxy.port,host),/^HTTP\/1.1 403/);assert.equal(proxy.stats().blocked,3);}finally{await proxy.close();}});
test('Browser CONNECT proxy fails closed when a public hostname fails destination validation',async()=>{let checked=0;const proxy=await startEgressProxy({resolveHost:async()=>{checked++;throw new Error('Private DNS result');}});try{assert.match(await connectRequest(proxy.port,'example.com:443'),/^HTTP\/1.1 403/);assert.equal(checked,1);}finally{await proxy.close();}});
test('A mismatched frontend file prevents release startup instead of mixing versions',async()=>{const dir=await fs.mkdtemp(path.join(os.tmpdir(),'cadence-manifest-'));try{await fs.mkdir(path.join(dir,'public'));await fs.writeFile(path.join(dir,'public','app.js'),'original');await fs.writeFile(path.join(dir,'package.json'),JSON.stringify({version:RELEASE}));await fs.writeFile(path.join(dir,'public','index.html'),`<link href=\"/assets/app.js?v=${RELEASE}\"><span>V2 · ${RELEASE.replace(/^2\.0\.0-/,'')}</span>`);await fs.writeFile(path.join(dir,'release-manifest.json'),JSON.stringify({release:RELEASE,files:{'public/app.js':crypto.createHash('sha256').update('original').digest('hex')}}));assert.equal(await checkRelease(dir),true);await fs.writeFile(path.join(dir,'public','app.js'),'different release');await assert.rejects(checkRelease(dir),/Mixed or modified release/);}finally{await fs.rm(dir,{recursive:true,force:true});}});
