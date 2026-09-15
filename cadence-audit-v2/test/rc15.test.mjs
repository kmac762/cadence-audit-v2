import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {RELEASE} from '../shared/release.mjs';

test('rc.15 keeps visible and runtime release labels synchronized', async()=>{
  assert.equal(RELEASE,'2.0.0-rc.15');
  const pkg=JSON.parse(await fs.readFile(new URL('../package.json',import.meta.url),'utf8'));
  assert.equal(pkg.version,RELEASE);
  const html=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/V2 · rc\.15/);
  assert.ok(html.includes(`?v=${RELEASE}`));
});

test('browser application includes the API helper required by boot and scan actions', async()=>{
  const app=await fs.readFile(new URL('../public/app.js',import.meta.url),'utf8');
  assert.match(app,/async function api\(path,/);
  assert.match(app,/await api\('\/api\/v2\/bootstrap'\)/);
  assert.match(app,/Open source page/);
  assert.match(app,/Anchor text/);
  assert.match(app,/Found on/);
  assert.match(app,/Found in/);
});
