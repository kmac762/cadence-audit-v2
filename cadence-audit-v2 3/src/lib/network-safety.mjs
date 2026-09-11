import dns from 'node:dns/promises';
import net from 'node:net';
import { remainingMs } from '../v2/context.mjs';

function ipv4Number(ip) { return ip.split('.').reduce((n,p) => (n << 8) | Number(p), 0) >>> 0; }
const blockedV4 = [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.88.99.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4]];
function v4In(ip,base,prefix) { const mask=(0xffffffff << (32-prefix)) >>> 0; return (ipv4Number(ip)&mask)===(ipv4Number(base)&mask); }
function ipv6Number(ip) {
  let value=ip.toLowerCase();
  if (value.includes('.')) { const i=value.lastIndexOf(':'); const n=ipv4Number(value.slice(i+1)); value=value.slice(0,i+1)+(n>>>16).toString(16)+':'+(n&65535).toString(16); }
  const halves=value.split('::'), left=halves[0] ? halves[0].split(':') : [], right=halves[1] ? halves[1].split(':') : [];
  const parts=halves.length===2 ? [...left,...Array(8-left.length-right.length).fill('0'),...right] : left;
  return parts.reduce((n,p) => (n<<16n)+BigInt('0x'+(p||'0')),0n);
}
function v6In(n,base,prefix) { const bits=BigInt(128-prefix); return (n>>bits)===(ipv6Number(base)>>bits); }
export function isBlockedIp(address) {
  const family=net.isIP(address); if (!family) return true;
  if (family===4) return blockedV4.some(([base,prefix])=>v4In(address,base,prefix));
  const n=ipv6Number(address);
  // Allow only globally routed unicast. Reject mapped, translated, tunnel, local and documentation ranges.
  return !v6In(n,'2000::',3) || [['2001::',23],['2001:db8::',32],['2002::',16],['3fff::',20]].some(([b,p])=>v6In(n,b,p));
}
export function normalizeHttpUrl(input) {
  const candidate=String(input||'').trim();
  if (!candidate || candidate.length>2048) throw new Error('Enter a public website URL under 2,048 characters.');
  if (/^(?:file|data|javascript|ftp|ws|wss|blob):/i.test(candidate) || (candidate.includes('://') && !/^https?:\/\//i.test(candidate))) throw new Error('Only HTTP and HTTPS URLs are supported.');
  let url; try { url=new URL(/^https?:\/\//i.test(candidate)?candidate:'https://'+candidate); } catch { throw new Error('Enter a valid website URL.'); }
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password) throw new Error('Use an HTTP(S) URL without a username or password.');
  if (url.port && !['80','443'].includes(url.port)) throw new Error('Only standard website ports 80 and 443 are allowed.');
  const h=url.hostname.replace(/^\[|\]$/g,'').toLowerCase().replace(/\.$/,'');
  if (!h || h==='localhost' || /(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(h) || (net.isIP(h) && isBlockedIp(h))) throw new Error('Local, private or reserved network addresses are not allowed.');
  url.hash=''; return url;
}
export async function resolvePublicHost(input) {
  const url=normalizeHttpUrl(input instanceof URL ? input.href : input);
  const host=url.hostname.replace(/^\[|\]$/g,'').replace(/\.$/,'');
  if (net.isIP(host)) { if (isBlockedIp(host)) throw new Error('Private or reserved IP address.'); return [{address:host,family:net.isIP(host)}]; }
  let timer;
  try {
    const records=await Promise.race([dns.lookup(host,{all:true,verbatim:true}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('DNS lookup timed out.')),remainingMs(5000));})]);
    if (!records.length || records.some(r=>isBlockedIp(r.address))) throw new Error('Hostname resolves to a private, reserved or unavailable network address.');
    return records;
  } finally {clearTimeout(timer);}
}
