import crypto from 'node:crypto';

export function parseCookies(header = '') {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const index = part.indexOf('=');
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) continue;
    try { out[key] = decodeURIComponent(value); }
    catch { out[key] = value; }
  }
  return out;
}

function hmac(secret, value) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

export function passwordMatches(candidate, expected) {
  return safeEqual(candidate, expected);
}

export function createSessionToken(secret, now = Date.now(), ttlMs = 12 * 60 * 60 * 1000) {
  const expires = Math.floor((now + ttlMs) / 1000);
  const payload = String(expires);
  return `${payload}.${hmac(secret, payload)}`;
}

export function verifySessionToken(token, secret, now = Date.now()) {
  const [expiresText, signature, extra] = String(token || '').split('.');
  if (!expiresText || !signature || extra) return false;
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires * 1000 <= now) return false;
  return safeEqual(signature, hmac(secret, expiresText));
}

export function createRateLimiter({ windowMs = 600000, max = 12 } = {}) {
  const buckets = new Map();
  return {
    check(key, now = Date.now()) {
      const id = String(key || 'unknown');
      const cutoff = now - windowMs;
      const recent = (buckets.get(id) || []).filter((timestamp) => timestamp > cutoff);
      if (recent.length >= max) {
        const oldest = recent[0] || now;
        const retryAfterMs = Math.max(1000, windowMs - (now - oldest));
        buckets.set(id, recent);
        return { allowed:false, remaining:0, retryAfterMs };
      }
      recent.push(now);
      buckets.set(id, recent);
      return { allowed:true, remaining:Math.max(0, max - recent.length), retryAfterMs:0 };
    },
    reset(key) { buckets.delete(String(key || 'unknown')); },
    size() { return buckets.size; }
  };
}

export function clientIp(req, trustProxy = false) {
  if (trustProxy) {
    const cf = req.headers['cf-connecting-ip'];
    if (typeof cf === 'string' && cf.trim()) return cf.trim();
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      const values = forwarded.split(',').map((value) => value.trim()).filter(Boolean);
      if (values.length) return values[values.length - 1];
    }
  }
  return req.socket?.remoteAddress || 'unknown';
}

function forwardedHost(req) {
  const value = req.headers['x-forwarded-host'];
  if (typeof value === 'string' && value.trim()) return value.split(',')[0].trim();
  return String(req.headers.host || '').trim();
}

export function isSameOriginRequest(req, trustProxy = false) {
  const origin = req.headers.origin;
  if (!origin) return true;
  let originUrl;
  try { originUrl = new URL(origin); }
  catch { return false; }
  const host = trustProxy ? forwardedHost(req) : String(req.headers.host || '').trim();
  if (!host) return false;
  return originUrl.host.toLowerCase() === host.toLowerCase();
}

export function hostAllowed(req, allowedHosts = []) {
  const configured = (allowedHosts || []).map((value) => String(value).trim().toLowerCase()).filter(Boolean);
  if (!configured.length) return true;
  const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
  const hostname = rawHost.replace(/^\[/, '').replace(/\](:\d+)?$/, '').replace(/:\d+$/, '');
  return configured.includes(hostname);
}
