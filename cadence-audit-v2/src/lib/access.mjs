// A CDN header identifies infrastructure, not a block. Error pages must never
// be interpreted as the real page, even when their HTTP response is 200.
export function assessHttpAccess({status,headers={},body='',rawAnalysis=null}){
 const h=Object.fromEntries(Object.entries(headers).map(([k,v])=>[k.toLowerCase(),String(v)]));
 const code=Number(status),text=String(body||'').slice(0,250000),server=(h.server||'').toLowerCase(),signals=[];
 if(h['cf-ray'])signals.push('Cloudflare CF-Ray header');
 if(h['cf-mitigated'])signals.push('Cloudflare mitigation: '+h['cf-mitigated']);
 if(server.includes('cloudflare'))signals.push('Server identifies as Cloudflare');
 if(h['x-sucuri-id']||h['x-sucuri-cache'])signals.push('Sucuri header');
 if(h['akamai-grn']||h['x-akamai-transformed'])signals.push('Akamai header');
 const title=text.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1]?.replace(/<[^>]*>/g,'').trim()||rawAnalysis?.title||'';
 const challengeTitle=/^(?:just a moment\.?\.?.?|attention required!?\s*(?:\|\s*cloudflare)?|access denied|verify (?:that )?you are human|checking your browser|security verification|pardon our interruption)\s*$/i.test(title);
 const marker=/(?:id=["']challenge-form["']|\/cdn-cgi\/challenge-platform\/|window\._cf_chl_opt\s*=|id=["']px-captcha["'])/i.test(text);
 const challengeBody=/checking your browser|verify you are human|enable javascript and cookies to continue|sorry, you have been blocked|cloudflare ray id/i.test(text);
 const challenge=h['cf-mitigated']==='challenge'||challengeTitle||(marker&&challengeBody);
 const restricted=[401,403,407,429].includes(code);
 const interference=challenge||(restricted&&(signals.length>0||challengeBody||(rawAnalysis?.wordCount??0)<40));
 const kind=code===429?'target-rate-limit':challenge?'challenge':restricted?'access-denied':code>=500?'server-error':code>=400?'http-error':code>=200&&code<300?'page-response':'non-success';
 if(challenge)signals.push('Challenge document detected');
 const usable=code>=200&&code<300&&!challenge;
 const message=challenge?`The scanner received a challenge document (HTTP ${code}), not the requested page. Actual search/AI crawler access was not verified.`:restricted?`The scanner request was refused with HTTP ${code}. The reason requires the site owner's logs; this does not show how Google or AI crawlers are treated.`:!usable?`The scanner received HTTP ${code||'unknown'} rather than a usable successful document response.`:null;
 return{kind,accessRestricted:restricted||challenge,challenge,likelyInterference:interference,pageContentUsable:usable,signals,message};
}
