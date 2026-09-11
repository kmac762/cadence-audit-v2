import { safeFetch } from './safe-fetch.mjs';
import { createHash } from 'node:crypto';
import { CRAWLER_TOKENS } from '../../shared/crawlers.mjs';
const AGENTS = ['CadenceAuditAssistant', ...CRAWLER_TOKENS];
export const ROBOTS_MAX_BYTES = 512000;
// Normalize URI octets: decode only unreserved ASCII; preserve reserved encodings.
function octets(text) {
  let out = '';
  for (let i = 0; i < text.length;) {
    if (text[i] === '%' && /^[a-f\d]{2}$/i.test(text.slice(i + 1, i + 3))) {
      const hex = text.slice(i + 1, i + 3).toUpperCase(), chr = String.fromCharCode(parseInt(hex, 16));
      out += /[A-Za-z0-9._~-]/.test(chr) ? chr : '%' + hex; i += 3;
    } else {
      const cp = text.codePointAt(i), chr = String.fromCodePoint(cp);
      out += cp > 127 ? encodeURIComponent(chr) : chr; i += chr.length;
    }
  }
  return out;
}
// Greedy wildcard matching avoids a backtracking regular-expression denial of service.
function matches(pattern, text) {
  let p = 0, t = 0, star = -1, resume = 0;
  while (t < text.length) {
    if (p < pattern.length && pattern[p] === text[t]) { p++; t++; }
    else if (pattern[p] === '*') { star = p++; resume = t; }
    else if (star !== -1) { p = star + 1; t = ++resume; }
    else return false;
  }
  while (pattern[p] === '*') p++;
  return p === pattern.length;
}
export function parseRobots(raw = '') {
  const groups = [], sitemaps = [], warnings = []; let current = null, bodyStarted = false;
  const lines = String(raw).replace(/^\uFEFF/, '').split(/\r\n|\r|\n/);
  let meaningful = 0, recognized = 0;
  lines.forEach((original, index) => {
    const line = original.replace(/#.*$/, '').trim(); if (!line) return;
    meaningful++; const colon = line.indexOf(':');
    if (colon < 0) { warnings.push(`Line ${index + 1}: no directive separator`); return; }
    const key = line.slice(0, colon).trim().toLowerCase(), value = line.slice(colon + 1).trim();
    if (key === 'sitemap') { if (value) sitemaps.push(value); recognized++; return; }
    if (key === 'user-agent') {
      if (!/^(?:\*|[a-z_-]+)$/i.test(value)) { warnings.push(`Line ${index + 1}: unsupported user-agent token`); current = null; bodyStarted = true; return; }
      if (!current || bodyStarted) { current = { agents: [], rules: [], agentLines: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase()); current.agentLines.push(index + 1); bodyStarted = false; recognized++; return;
    }
    if (key === 'allow' || key === 'disallow') {
      bodyStarted = true;
      if (!current) { warnings.push(`Line ${index + 1}: rule without a user-agent group`); return; }
      recognized++;
      if (value && !value.startsWith('/')) { warnings.push(`Line ${index + 1}: rule does not start with /`); return; }
      if (value.length > 4096) { warnings.push(`Line ${index + 1}: rule exceeds review limit`); return; }
      current.rules.push({ type: key, path: value, line: index + 1, raw: line }); return;
    }
    if (['crawl-delay', 'host', 'request-rate', 'content-signal'].includes(key)) { recognized++; if (current) bodyStarted = true; }
    else warnings.push(`Line ${index + 1}: unsupported directive ${key.slice(0,60)}`);
  });
  return { groups, sitemaps: [...new Set(sitemaps)], warnings, meaningful, recognized };
}
export function hasExplicitGroup(parsed, token) {
  return (parsed.groups || []).some(g => g.agents.includes(token.toLowerCase()));
}
export function evaluateRobots(parsed, targetUrl, userAgent, { exact = false } = {}) {
  const ua = userAgent.toLowerCase(); let best = -1, groups = [];
  for (const group of parsed.groups || []) {
    let length = -1;
    for (const token of group.agents) {
      if (token === '*') length = Math.max(length, 0);
      else if (token && (exact ? ua === token : ua.includes(token))) length = Math.max(length, token.length);
    }
    if (length > best) { best = length; groups = length >= 0 ? [group] : []; }
    else if (length === best && length >= 0) groups.push(group);
  }
  const url = new URL(targetUrl), path = octets(url.pathname + url.search); let winner = null;
  if(url.pathname==='/robots.txt')return{allowed:true,matchedRule:null,matchedAgents:[],groupLines:[],basis:'robots-implicitly-allowed',explicit:false,evaluatedToken:userAgent};
  for (const group of groups) for (const rule of group.rules) {
    if (!rule.path) continue; // Empty Allow/Disallow has no path effect.
    const end = rule.path.endsWith('$'), normalized = octets(end ? rule.path.slice(0, -1) : rule.path);
    if (!matches(normalized + (end ? '' : '*'), path)) continue;
    const specificity = normalized.replace(/\*/g, '').replace(/%[A-F\d]{2}/g, 'x').length;
    if (!winner || specificity > winner.specificity || (specificity === winner.specificity && rule.type === 'allow')) {
      winner = { ...rule, specificity, group: group.agents, agentLines: group.agentLines };
    }
  }
  return { allowed: !winner || winner.type === 'allow', matchedRule: winner,
    matchedAgents: [...new Set(groups.flatMap(g => g.agents))],
    groupLines: groups.flatMap(g => g.agentLines || []),
    basis: best < 0 ? 'no-applicable-group' : winner ? 'matched-rule' : 'no-matching-disallow',
    explicit: best > 0, evaluatedToken: userAgent };
}
export function isAllowed(parsed, targetUrl, userAgent) { return evaluateRobots(parsed, targetUrl, userAgent).allowed; }
export function policyFromResponse(targetUrl, result, fetchedAt = new Date().toISOString()) {
  const url = new URL('/robots.txt', targetUrl).href;
  const body = typeof result.body === 'string' ? result.body : '';
  const headers = result.headers || {}, type = (headers['content-type'] || '').toLowerCase();
  const base = { origin: new URL(targetUrl).origin, url, finalUrl: result.finalUrl || url,
    fetchedAt, status: result.status ?? null, contentType: type, exists: false,
    sitemaps: [], raw: null, error: null, policyState: 'unknown',
    responseHash: createHash('sha256').update(body).digest('hex'), bytes: Buffer.byteLength(body),
    redirects: result.redirects || [], agents: Object.fromEntries(AGENTS.map(a => [a, null])) };
  const challenge = !!headers['cf-mitigated'] || /<\s*(?:!doctype\s+html|html|head|body)\b/i.test(body) || type.includes('text/html') || type.includes('application/xhtml');
  // Normal 404/410 HTML error pages still mean no robots file. A challenge does not.
  const hasPolicyLines = /^\s*(?:user-agent|allow|disallow|sitemap)\s*:/mi.test(body);
  const challengeText = !hasPolicyLines && /cf-chl-|verify you are human|checking your browser|captcha|just a moment|access denied|sorry, you have been blocked/i.test(body);
  if ([404, 410].includes(result.status) && !headers['cf-mitigated'] && !challengeText) {
    return { ...base, policyState: 'missing', agents: Object.fromEntries(AGENTS.map(a => [a, true])) };
  }
  if (result.status < 200 || result.status >= 300 || result.status === 206 || !result.status) return { ...base, error: `robots.txt returned HTTP ${result.status ?? 'unknown'}; policy is unknown.` };
  if (challenge || challengeText) return { ...base, error: 'The robots request returned HTML or a challenge, not a usable robots policy.' };
  if (Buffer.byteLength(body) > ROBOTS_MAX_BYTES) return { ...base, error: 'robots.txt exceeded the 512,000-byte policy review limit; no permission was inferred from a truncated file.' };
  const parsed = parseRobots(body);
  if (body.includes('\ufffd') || body.includes('\0') || parsed.warnings.length) return { ...base, raw: body, parseWarnings: parsed.warnings, error: 'robots.txt contained invalid or unsupported syntax. Verify the file manually; this scan does not guess permissions.' };
  if (parsed.meaningful && !parsed.recognized) return { ...base, error: 'The response did not contain recognizable robots policy syntax.' };
  return { ...base, exists: true, policyState: 'parsed', raw: body, sitemaps: parsed.sitemaps,
    agents: Object.fromEntries(AGENTS.map(agent => [agent, evaluateRobots(parsed, targetUrl, agent, {exact:true}).allowed])) };
}
export async function analyzeRobots(targetUrl) {
  const url = new URL('/robots.txt', targetUrl).href;
  try { const result = await safeFetch(url, 'text/plain,*/*;q=0.8', {timeoutMs:6000}); return policyFromResponse(targetUrl, result); }
  catch (error) { return { origin:new URL(targetUrl).origin, url, finalUrl:url, exists:false, status:null,
    fetchedAt:new Date().toISOString(), raw:null, policyState:'unknown', sitemaps:[],
    agents:Object.fromEntries(AGENTS.map(a=>[a,null])), error:`Unable to retrieve robots.txt: ${String(error.message || error).slice(0,180)}` }; }
}
