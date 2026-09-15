import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {RELEASE} from '../shared/release.mjs';

test('rc.14 keeps visible and runtime release labels synchronized', async()=>{
  assert.equal(RELEASE,'2.0.0-rc.14');
  const pkg=JSON.parse(await fs.readFile(new URL('../package.json',import.meta.url),'utf8'));
  assert.equal(pkg.version,RELEASE);
  const html=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/V2 · rc\.14/);
  assert.ok(html.includes(`?v=${RELEASE}`));
});
