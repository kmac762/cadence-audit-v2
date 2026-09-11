import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
const equal=(a,b)=>{const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&crypto.timingSafeEqual(x,y);};
export async function sessionTools(dataDir,secure){
 let secret=process.env.SESSION_SECRET;const file=path.join(dataDir,'session-secret');
 if(!secret){try{secret=await fs.readFile(file,'utf8');}catch{secret=crypto.randomBytes(32).toString('hex');await fs.writeFile(file,secret,{mode:0o600,flag:'wx'});}}
 const mac=x=>crypto.createHmac('sha256',secret).update(x).digest('hex');
 function session(req,res){const cookies=Object.fromEntries(String(req.headers.cookie||'').split(';').map(p=>p.trim().split('=')));const [candidate,sig]=String(cookies.cadence_v2||'').split('.');const id=/^[a-f0-9]{48}$/.test(candidate||'')&&equal(sig,mac('cookie:'+candidate))?candidate:null;
  const token=id||crypto.randomBytes(24).toString('hex');if(!id)res.setHeader('Set-Cookie',`cadence_v2=${token}.${mac('cookie:'+token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secure?'; Secure':''}`);
  return{owner:mac('owner:'+token),csrf:mac('csrf:'+token)};
 }
 return{session,csrfValid:(req,s)=>req.headers['sec-fetch-site']!=='cross-site'&&equal(req.headers['x-csrf-token'],s.csrf)};
}
export function securityHeaders(res,secure){for(const[k,v]of Object.entries({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow, noarchive, nosnippet','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; object-src 'none'",'Permissions-Policy':'camera=(), microphone=(), geolocation=()'}))res.setHeader(k,v);if(secure)res.setHeader('Strict-Transport-Security','max-age=31536000');}
export function createLimiter({limit,windowMs}){const map=new Map();return key=>{const now=Date.now();for(const[k,v]of map)if(v.until<now)map.delete(k);let v=map.get(key);if(!v){if(map.size>1000)return false;v={count:0,until:now+windowMs};map.set(key,v);}return++v.count<=limit;};}
