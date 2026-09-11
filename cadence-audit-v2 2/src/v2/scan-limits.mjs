// In-memory fixed windows measured from the first accepted scan, not the top
// of the clock hour. Limits are reservations: rejected jobs release them.
export function scanLimitConfig(env=process.env){
 const value=(name,fallback,max)=>{if(env[name]===undefined||env[name]==='')return fallback;const n=Number(env[name]);if(!Number.isInteger(n)||n<1||n>max)throw new Error(`${name} must be an integer from 1 to ${max}.`);return n;};
 return{perSession:value('SCAN_LIMIT_PER_SESSION',6,100),global:value('SCAN_LIMIT_GLOBAL',12,1000),windowMs:3600000};
}
export function createScanLimits({perSession=6,global=12,windowMs=3600000,now=Date.now}={}){
 const sessions=new Map();let all={count:0,until:0};
 const fresh=()=>{const t=now();if(all.until<=t)all={count:0,until:0};for(const[k,v]of sessions)if(v.until<=t)sessions.delete(k);return t;};
 function inspect(owner){const t=fresh(),s=sessions.get(owner)||{count:0,until:0};return{perSession,global,windowSeconds:Math.ceil(windowMs/1000),sessionRemaining:Math.max(0,perSession-s.count),globalRemaining:Math.max(0,global-all.count),sessionResetAt:s.until?new Date(s.until).toISOString():null,globalResetAt:all.until?new Date(all.until).toISOString():null,windowType:'fixed-from-first-accepted-scan',storage:'in-memory; resets on service restart',_now:t};}
 return{inspect(owner){const{_now,...s}=inspect(owner);return s;},reserve(owner){const v=inspect(owner);let scope=null,until=0;
   const s=sessions.get(owner)||{count:0,until:0};
   if(!v.sessionRemaining){scope='browser session';until=s.until;}
   if(!v.globalRemaining&&all.until>=until){scope='whole app';until=all.until;}
   if(scope)return{ok:false,scope,retryAfterSeconds:Math.max(1,Math.ceil((until-v._now)/1000)),resetAt:new Date(until).toISOString(),limits:{perSession,global}};
   if(sessions.size>=1000&&!sessions.has(owner))return{ok:false,scope:'session capacity',retryAfterSeconds:60,resetAt:null,limits:{perSession,global}};
   if(!s.until)s.until=v._now+windowMs;if(!all.until)all.until=v._now+windowMs;
   s.count++;all.count++;sessions.set(owner,s);const g=all;let released=false;
   return{ok:true,release(){if(released)return;released=true;s.count=Math.max(0,s.count-1);g.count=Math.max(0,g.count-1);}};
 }};
}
