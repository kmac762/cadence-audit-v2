import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/server.mjs';
import { RELEASE } from '../shared/release.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));

test('Branded entry page uses the supplied logo and versioned matched assets', async () => {
  const html = await fs.readFile(path.join(root, 'public/index.html'), 'utf8');
  assert.match(html, /class="brand-logo"/);
  assert.match(html, /alt="Cadence Search"/);
  assert.ok(html.includes('/assets/brand-logo.svg?v=' + RELEASE));
  assert.equal(html.includes('class="brand-mark"'), false);
  for (const asset of ['brand.css', 'styles.css', 'app.js']) {
    assert.ok(html.includes('/assets/' + asset + '?v=' + RELEASE));
  }
});

test('Logo is an embedded image, not external art or executable SVG content', async () => {
  const svg = await fs.readFile(path.join(root, 'public/brand-logo.svg'), 'utf8');
  assert.match(svg, /data:image\/png;base64,/);
  assert.match(svg, /viewBox="174 280 1352 382"/);
  assert.doesNotMatch(svg, /<script|<foreignObject|href="https?:/i);
});

test('Offline preview includes its logo and has no external asset dependency', async () => {
  const preview = await fs.readFile(path.join(root, 'docs/V2-preview.html'), 'utf8');
  assert.match(preview, /src="data:image\/svg\+xml;base64,/);
  assert.doesNotMatch(preview, /(?:src|href)="\/assets\//);
  assert.match(preview, /OFFLINE PREVIEW - all report data is synthetic/);
});

test('rc.12 shell preserves the established audit-tool dark field and white masthead', async () => {
  const html = await fs.readFile(path.join(root, 'public/index.html'), 'utf8');
  const css = await fs.readFile(path.join(root, 'public/styles.css'), 'utf8');
  assert.match(html, /Find the signal\./);
  assert.match(html, /Skip the noise\./);
  assert.match(html, /MODERN SEARCH TOOLKIT/);
  assert.match(html, /NOINDEX · INTERNAL TOOL/);
  assert.match(html, /Content Freshness/);
  assert.match(css, /rc\.12 - visual parity with the established Cadence URL Audit Assistant/);
  assert.match(css, /background:#07110f/);
  assert.match(css, /font-family:Georgia/);
  assert.match(css, /brand-spectrum/);
});

test('Hosted logo route returns SVG under the unchanged asset security policy', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cadence-brand-test-'));
  const app = await createApp({ dataDir: dir, secure: false });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  try {
    const base = 'http://127.0.0.1:' + app.server.address().port;
    const res = await fetch(base + '/assets/brand-logo.svg?v=' + RELEASE);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /image\/svg\+xml/);
    assert.match(res.headers.get('content-security-policy'), /img-src 'self' data:/);
    assert.match(res.headers.get('x-robots-tag'), /noindex/);
    assert.match(await res.text(), /aria-label="Cadence Search"/);
    assert.equal((await (await fetch(base + '/api/health')).json()).release, RELEASE);
  } finally {
    app.server.closeAllConnections();
    await app.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
});


test('Search-access module is served as JavaScript and preserves noindex protection', async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'cadence-access-route-'));
 const app=await createApp({dataDir:dir,secure:false});
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 try {
  const res=await fetch('http://127.0.0.1:'+app.server.address().port+'/assets/access-view.mjs?v='+RELEASE);
  assert.equal(res.status,200);
  assert.match(res.headers.get('content-type'),/javascript/);
  assert.match(res.headers.get('x-robots-tag'),/noindex/);
  assert.match(await res.text(),/export function renderSearchAccess/);
 } finally {app.server.closeAllConnections();await app.close();await fs.rm(dir,{recursive:true,force:true});}
});
