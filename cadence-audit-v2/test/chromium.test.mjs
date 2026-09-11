import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderControlledHtml} from '../src/lib/render.mjs';
import {scanContext} from '../src/v2/context.mjs';
test('Real Chromium executes a controlled hydration fixture and returns usable primary content',{skip:!fs.existsSync(process.env.CHROMIUM_PATH||'/usr/bin/chromium'),timeout:35000},async()=>{
 const html=`<!doctype html><html><head><title>Controlled renderer fixture</title></head><body><main><h1>Server-provided heading</h1><p>${'Initial useful content for a deterministic renderer test. '.repeat(35)}</p><div id="hydrate"></div></main><script>document.getElementById('hydrate').innerHTML='<h2>Rendered supporting section</h2><p>${'A useful section added by JavaScript. '.repeat(30)}</p>';</script></body></html>`;
 const result=await scanContext.run({deadline:Date.now()+33000},()=>renderControlledHtml(html));
 assert.equal(result.succeeded,true,JSON.stringify(result));assert.ok(result.html.primaryWordCount>200);assert.ok(result.html.headings.some(h=>h.text==='Rendered supporting section'));
});
