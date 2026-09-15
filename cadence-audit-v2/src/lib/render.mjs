import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { analyzeHtml } from './analyze-html.mjs';
import { normalizeHttpUrl, resolvePublicHost } from './network-safety.mjs';
import { startEgressProxy } from '../v2/egress.mjs';
import { context } from '../v2/context.mjs';
import {assessHttpAccess} from './access.mjs';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';

function browserCandidates() {
  const home = os.homedir();
  const mac = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    path.join(home, 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
    path.join(home, 'Applications/Chromium.app/Contents/MacOS/Chromium')
  ];

  const linux = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/microsoft-edge',
    '/usr/bin/brave-browser'
  ];

  return [process.env.CHROMIUM_PATH, ...(process.platform === 'darwin' ? mac : linux)].filter(Boolean);
}

function findChromium() {
  return browserCandidates().find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) || null;
}

export function assessRenderQuality(rawAnalysis, renderedAnalysis) {
  const rawWords = rawAnalysis?.wordCount || 0;
  const renderedWords = renderedAnalysis?.wordCount || 0;
  const pageLabel = [renderedAnalysis?.title, ...(renderedAnalysis?.h1s || [])].filter(Boolean).join(' ');

  if (/just a moment|checking your browser|verify you are human|access denied|privacy error|site cannot be reached|page unresponsive/i.test(pageLabel)) {
    return {
      usable: false,
      code: 'challenge-or-error-page',
      reason: 'The headless browser appears to have received a challenge or browser error page instead of the audited page.'
    };
  }

  if (renderedWords < 20) {
    return {
      usable: false,
      code: 'render-too-small',
      reason: `Rendered output is too small to trust (${renderedWords.toLocaleString()} words). The headless browser may have received a challenge, error, or incomplete page.`
    };
  }

  if (rawWords >= 300 && renderedWords < Math.max(20, Math.floor(rawWords * 0.08))) {
    return {
      usable: false,
      code: 'render-collapse',
      reason: `Rendered output is too small to trust compared with the initial HTML (${renderedWords.toLocaleString()} vs ${rawWords.toLocaleString()} words).`
    };
  }

  return { usable: true, code: 'ok', reason: null };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function browserArgs(profileDir, proxyPort) {
  const args = [
    '--headless=new',
    `--proxy-server=http://127.0.0.1:${proxyPort}`,
    '--proxy-bypass-list=<-loopback>',
    '--disable-quic',
    '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
    '--renderer-process-limit=2',
    '--js-flags=--max-old-space-size=256',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-sync',
    '--disable-component-update',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-popup-blocking',
    '--disable-gpu',
    '--window-size=1440,1000',
    `--user-agent=${USER_AGENT}`,
    'about:blank'
  ];

  if (process.platform !== 'darwin') {
    args.unshift('--no-sandbox', '--disable-dev-shm-usage');
  }

  return args;
}

async function waitForDevTools(profileDir, child, timeoutMs = 12000) {
  const file = path.join(profileDir, 'DevToolsActivePort');
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`Chrome exited before its debugging interface became ready (exit ${child.exitCode}).`);
    }

    try {
      const value = await fsp.readFile(file, 'utf8');
      const [portLine, browserPath] = value.trim().split(/\r?\n/);
      const port = Number.parseInt(portLine, 10);
      if (Number.isInteger(port) && port > 0 && browserPath) {
        return { port, browserPath };
      }
    } catch {
      // Chrome creates DevToolsActivePort shortly after startup.
    }

    await sleep(100);
  }

  throw new Error('Chrome started, but its debugging interface did not become ready in time.');
}

async function createPageTarget(port) {
  const endpoint = `http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`;
  const response = await fetch(endpoint, { method: 'PUT' });
  if (!response.ok) throw new Error(`Chrome debugging endpoint returned HTTP ${response.status}.`);
  const target = await response.json();
  if (!target.webSocketDebuggerUrl) throw new Error('Chrome did not provide a page debugging socket.');
  return target;
}

class CdpConnection {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = [];
    this.listeners = new Map();
  }

  async open(timeoutMs = 8000) {
    await new Promise((resolve, reject) => {
      let settled = false;
      const socket = new WebSocket(this.url);
      this.socket = socket;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        try { socket.close(); } catch {}
        reject(new Error('Timed out connecting to Chrome debugging socket.'));
      }, timeoutMs);

      socket.addEventListener('open', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve();
      }, { once: true });

      socket.addEventListener('error', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(new Error('Could not connect to Chrome debugging socket.'));
      }, { once: true });

      socket.addEventListener('message', (event) => this.#onMessage(event.data));
      socket.addEventListener('close', () => this.#rejectAll(new Error('Chrome debugging socket closed.')));
    });
  }

  #onMessage(data) {
    let message;
    try { message = JSON.parse(String(data)); } catch { return; }

    if (message.id && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message || 'Chrome protocol command failed.'));
      else pending.resolve(message.result || {});
      return;
    }

    if (message.method) {
      const params = message.params || {};
      const listeners = this.listeners.get(message.method) || [];
      for (const listener of listeners) {
        try { Promise.resolve(listener(params)).catch(() => {}); } catch {}
      }
      const matches = this.waiters.filter((waiter) => waiter.method === message.method);
      for (const waiter of matches) {
        clearTimeout(waiter.timer);
        this.waiters = this.waiters.filter((candidate) => candidate !== waiter);
        waiter.resolve(params);
      }
    }
  }

  #rejectAll(error) {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    for (const waiter of this.waiters) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
    this.waiters = [];
  }

  send(method, params = {}, timeoutMs = 10000) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('Chrome debugging socket is not open.'));
    }

    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Chrome protocol command timed out: ${method}`));
      }, timeoutMs);

      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); }
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    const list = this.listeners.get(method) || [];
    list.push(listener);
    this.listeners.set(method, list);
    return () => {
      const current = this.listeners.get(method) || [];
      this.listeners.set(method, current.filter((candidate) => candidate !== listener));
    };
  }

  waitFor(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const waiter = { method, resolve, reject, timer: null };
      waiter.timer = setTimeout(() => {
        this.waiters = this.waiters.filter((candidate) => candidate !== waiter);
        reject(new Error(`Timed out waiting for browser event: ${method}`));
      }, timeoutMs);
      this.waiters.push(waiter);
    });
  }

  close() {
    if (!this.socket) return;
    try { this.socket.close(); } catch {}
    this.socket = null;
    this.listeners.clear();
  }
}

async function stopChrome(child) {
  if (!child || child.exitCode !== null) return;
  try { child.kill('SIGTERM'); } catch {}
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    sleep(1200)
  ]);
  if (child.exitCode === null) {
    try { child.kill('SIGKILL'); } catch {}
  }
}

export async function validateBrowserRequestUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return { allowed:false, reason:'empty-url' };
  if (context().robotsAllowed && /^https?:/i.test(raw) && !context().robotsAllowed(raw)) return {allowed:false,reason:'robots-disallowed'};
  if (/^(about:|data:|blob:)/i.test(raw)) return { allowed:true, reason:'local-browser-resource' };
  if (!/^https?:/i.test(raw)) return { allowed:false, reason:'unsupported-protocol' };
  try {
    const url = normalizeHttpUrl(raw);
    await resolvePublicHost(url);
    return { allowed:true, reason:'public-http' };
  } catch (error) {
    return { allowed:false, reason:error instanceof Error ? error.message : 'blocked-network-target' };
  }
}

function installRequestGuard(cdp) {
  const hostChecks = new Map();
  let blockedCount = 0;
  const validate = async (url) => {
    if(context().robotsAllowed && /^https?:/i.test(String(url||'')) && !context().robotsAllowed(url))return {allowed:false,reason:'robots-disallowed'};
    if (/^(about:|data:|blob:)/i.test(String(url || ''))) return { allowed:true, reason:'local-browser-resource' };
    let parsed;
    try { parsed = new URL(url); } catch { return { allowed:false, reason:'invalid-url' }; }
    if (!['http:','https:'].includes(parsed.protocol)) return { allowed:false, reason:'unsupported-protocol' };
    const cacheKey = `${parsed.protocol}//${parsed.hostname.toLowerCase()}`;
    if (!hostChecks.has(cacheKey)) hostChecks.set(cacheKey, validateBrowserRequestUrl(url));
    return hostChecks.get(cacheKey);
  };

  const off = cdp.on('Fetch.requestPaused', async (params) => {
    const requestId = params?.requestId;
    if (!requestId) return;
    const url = params?.request?.url || '';
    try {
      const result = await validate(url);
      if (!result.allowed) {
        blockedCount += 1;
        await cdp.send('Fetch.failRequest', { requestId, errorReason:'BlockedByClient' }, 5000).catch(() => {});
        return;
      }
      await cdp.send('Fetch.continueRequest', { requestId }, 5000).catch(() => {});
    } catch {
      blockedCount += 1;
      await cdp.send('Fetch.failRequest', { requestId, errorReason:'BlockedByClient' }, 5000).catch(() => {});
    }
  });
  return { off, blockedCount:() => blockedCount };
}

async function renderViaCdp(executable, profileDir, targetUrl, rawAnalysis, fixtureHtml = null) {
  const proxy = await startEgressProxy();
  const stderrChunks = [];
  let stderrSize = 0;
  const child = spawn(executable, browserArgs(profileDir, proxy.port), {
    stdio: ['ignore', 'ignore', 'pipe'],
    env: { PATH:process.env.PATH, HOME:process.env.HOME, LANG:'C.UTF-8', TMPDIR:process.env.TMPDIR || os.tmpdir() }
  });

  child.stderr.on('data', (chunk) => {
    stderrSize += chunk.length;
    if (stderrSize <= 120000) stderrChunks.push(chunk);
  });

  let cdp = null;
  try {
    const { port } = await waitForDevTools(profileDir, child);
    const target = await createPageTarget(port);
    cdp = new CdpConnection(target.webSocketDebuggerUrl);
    await cdp.open();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');
    let documentResponse=null;
    const mainFrame=(await cdp.send('Page.getFrameTree'))?.frameTree?.frame?.id;
    cdp.on('Network.responseReceived',p=>{if(p.type==='Document'&&p.frameId===mainFrame)documentResponse=p.response;});
    await cdp.send('Network.setUserAgentOverride', { userAgent: USER_AGENT });
    const requestGuard = installRequestGuard(cdp);
    await cdp.send('Fetch.enable', { patterns:[{ urlPattern:'*', requestStage:'Request' }] });

    const loadPromise = cdp.waitFor('Page.loadEventFired', 18000).catch(() => null);
    if (fixtureHtml !== null) {
      const tree = await cdp.send('Page.getFrameTree');
      await cdp.send('Page.setDocumentContent', { frameId:tree.frameTree.frame.id, html:fixtureHtml });
    } else {
      const navigation = await cdp.send('Page.navigate', { url: targetUrl }, 12000);
      if (navigation.errorText) throw new Error(`Chrome navigation failed: ${navigation.errorText}`);
    }

    await loadPromise;
    // Allow hydration/lazy client rendering to settle after the load event.
    await sleep(2500);

    const locationResult = await cdp.send('Runtime.evaluate', {
      expression: 'location.href',
      returnByValue: true
    });
    const actualUrl = fixtureHtml !== null ? 'https://example.com/' : (locationResult?.result?.value || targetUrl);

    const domResult = await cdp.send('Runtime.evaluate', {
      expression: '(() => { const html = document.documentElement?.outerHTML || ""; return {html: html.length <= 4000000 ? html : "", tooLarge: html.length > 4000000}; })()',
      returnByValue: true
    }, 12000);
    const captured = domResult?.result?.value;
    if (captured?.tooLarge) throw new Error('Rendered HTML exceeded the inspection size limit. Rendering checks are incomplete.');
    const html = captured?.html || ''; 
    if (!html) throw new Error('Chrome completed navigation but returned no rendered HTML.');

    const analysis = analyzeHtml(html, actualUrl);
    const access=assessHttpAccess({status:documentResponse?.status??200,headers:documentResponse?.headers||{},body:html,rawAnalysis:analysis});
    const quality = access.pageContentUsable?assessRenderQuality(rawAnalysis, analysis):{usable:false,code:'browser-access-refused',reason:access.message};
    if (!quality.usable) {
      return {
        succeeded: false,
        method: 'chrome-devtools',
        quality,
        observed: analysis,
        error: quality.reason,
        diagnostics: Buffer.concat(stderrChunks).toString('utf8').slice(-2400),
        blockedNetworkRequests: requestGuard.blockedCount() + proxy.stats().blocked
      };
    }

    return {
      succeeded: true,
      method: 'chrome-devtools',
      html: analysis,
      quality,
      actualUrl,
      diagnostics: null,
      blockedNetworkRequests: requestGuard.blockedCount() + proxy.stats().blocked
    };
  } catch (error) {
    return {
      succeeded: false,
      method: 'chrome-devtools',
      error: error.message || 'Chrome rendering failed.',
      diagnostics: Buffer.concat(stderrChunks).toString('utf8').slice(-2400)
    };
  } finally {
    cdp?.close();
    await stopChrome(child);
    await proxy.close();
  }
}

export async function renderPage(targetUrl, rawAnalysis = null) {
  if (process.env.ENABLE_RENDERING === '0') {
    return { enabled: false, succeeded: false, error: 'Rendering disabled by configuration.' };
  }

  const executable = findChromium();
  if (!executable) {
    return {
      enabled: true,
      succeeded: false,
      error: 'Chrome/Chromium was not found. On macOS the expected path is /Applications/Google Chrome.app/Contents/MacOS/Google Chrome. You can also set CHROMIUM_PATH.'
    };
  }

  let profileDir = null;
  try {
    profileDir = await fsp.mkdtemp(path.join(process.env.JOB_TMP_DIR || os.tmpdir(), 'cadence-audit-chrome-'));
    const result = await renderViaCdp(executable, profileDir, targetUrl, rawAnalysis);
    if (result.succeeded) {
      return {
        enabled: true,
        succeeded: true,
        executable,
        method: result.method,
        actualUrl: result.actualUrl,
        html: result.html,
        quality: result.quality
      };
    }

    return {
      enabled: true,
      succeeded: false,
      executable,
      method: result.method,
      quality: result.quality,
      observed: result.observed,
      error: 'Browser rendering was unavailable for this scan. The raw HTML and robots checks still completed; rendered-page comparisons were skipped.',
      technicalError: result.error,
      diagnostics: result.diagnostics
    };
  } catch (error) {
    return {
      enabled: true,
      succeeded: false,
      executable,
      error: 'Browser rendering was unavailable for this scan. The raw HTML and robots checks still completed; rendered-page comparisons were skipped.',
      technicalError: error.message || 'Unknown Chrome rendering error.'
    };
  } finally {
    if (profileDir) void fsp.rm(profileDir, { recursive: true, force: true });
  }
}

// Test-only entry point for a controlled HTML document. The HTTP API never accepts HTML.
async function removeDirAfterChrome(dir){
  for(let i=0;i<4;i++){
    try{await fsp.rm(dir,{recursive:true,force:true,maxRetries:2,retryDelay:40});return;}
    catch(error){if(i===3)throw error;await sleep(50*(i+1));}
  }
}

export async function renderControlledHtml(html) {
  const executable=findChromium();
  if(!executable) throw new Error('Chromium is not installed.');
  const profile=await fsp.mkdtemp(path.join(os.tmpdir(),'cadence-render-fixture-'));
  try { return await renderViaCdp(executable,profile,'about:blank',null,html); }
  finally { await removeDirAfterChrome(profile); }
}
