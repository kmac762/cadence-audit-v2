const button=document.getElementById('capture'),status=document.getElementById('status');
async function capturePage(){
 const text=(el)=>el?.textContent?.replace(/\s+/g,' ').trim()||'';
 const abs=(v)=>{try{return new URL(v,location.href).href}catch{return null}};
 const meta=(name)=>document.querySelector(`meta[name="${name}"]`)?.content?.trim()||'';
 const prop=(name)=>document.querySelector(`meta[property="${name}"]`)?.content?.trim()||'';
 const primary=document.querySelector('main,article,[role="main"]')||document.body;
 const anchorEls=[...primary.querySelectorAll('a[href]')];
 const internalAnchors=anchorEls.filter(a=>{try{const u=new URL(a.href);return /^https?:$/.test(u.protocol)&&u.origin===location.origin&&!/\.(?:jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|mp3|webm|css|js|xml)(?:$|\?)/i.test(u.pathname)}catch{return false}});
 const internal=internalAnchors.length;
 const external=anchorEls.filter(a=>{try{return /^https?:/.test(new URL(a.href).protocol)&&new URL(a.href).origin!==location.origin}catch{return false}}).length;
 const unique=[];const seen=new Set();for(const a of internalAnchors){const u=abs(a.href);if(!u)continue;const x=new URL(u);x.hash='';const key=x.href;if(seen.has(key))continue;seen.add(key);unique.push(key);if(unique.length>=12)break;}
 const checked=[];
 for(const url of unique){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4500);
  try{
   let response=await fetch(url,{method:'HEAD',credentials:'omit',redirect:'follow',cache:'no-store',signal:controller.signal});
   if([405,501].includes(response.status))response=await fetch(url,{method:'GET',credentials:'omit',redirect:'follow',cache:'no-store',signal:controller.signal});
   checked.push({url,status:response.status,finalUrl:response.url||url,redirected:!!response.redirected,accessRestricted:[401,403,407,429].includes(response.status)});
  }catch(e){checked.push({url,status:null,finalUrl:url,redirected:false,accessRestricted:false,error:e?.name==='AbortError'?'Timed out':'Could not verify'});}
  finally{clearTimeout(timer);}
 }
 const types=[];for(const s of document.querySelectorAll('script[type="application/ld+json"]')){try{const root=JSON.parse(s.textContent);const walk=o=>{if(!o||typeof o!=='object')return;if(Array.isArray(o)){o.forEach(walk);return;}if(o['@type']){(Array.isArray(o['@type'])?o['@type']:[o['@type']]).forEach(t=>types.push(String(t)));}Object.values(o).forEach(walk);};walk(root);}catch{}}
 const datePublished=[],dateModified=[];const pushDate=(target,v)=>{if(Array.isArray(v)){v.forEach(x=>pushDate(target,x));return;}if(v&&typeof v==='object'){if(v['@value'])pushDate(target,v['@value']);return;}if(v!=null){const t=String(v).trim();if(t&&!target.includes(t))target.push(t.slice(0,120));}};
 for(const script of document.querySelectorAll('script[type="application/ld+json"]')){try{const root=JSON.parse(script.textContent);const walk=o=>{if(!o||typeof o!=='object')return;if(Array.isArray(o)){o.forEach(walk);return;}if(o.datePublished)pushDate(datePublished,o.datePublished);if(o.dateModified)pushDate(dateModified,o.dateModified);Object.values(o).forEach(walk);};walk(root);}catch{}}
 const pubMeta=prop('article:published_time')||meta('datePublished');if(pubMeta)pushDate(datePublished,pubMeta);const modMeta=prop('article:modified_time')||meta('dateModified');if(modMeta)pushDate(dateModified,modMeta);
 const years=v=>[...new Set((String(v||'').match(/\b20\d{2}\b/g)||[]).map(Number))].filter(y=>y>=2000&&y<=new Date().getFullYear()+1).sort((a,b)=>a-b);
 const bodyText=text(primary);const titleYears=years(document.title),metaYears=years(meta('description')),bodyYears=years(bodyText);const sourceYears=years(anchorEls.filter(a=>{try{return new URL(a.href).origin!==location.origin}catch{return false}}).map(a=>`${a.href} ${text(a)}`).join(' '));
 const imgs=[...document.images];
 const author=[...document.querySelectorAll('[rel="author"],.author,.byline,[class*="author" i]')].map(text).filter(Boolean).slice(0,10);
 return{schemaVersion:'cadence-browser-assist-1',capturedAt:new Date().toISOString(),url:location.href,page:{title:document.title||'',metaDescription:meta('description'),canonical:abs(document.querySelector('link[rel="canonical"]')?.href||''),robots:meta('robots'),language:document.documentElement.lang||'',bodyWordCount:(text(primary).match(/\b[\p{L}\p{N}][\p{L}\p{N}'’-]*\b/gu)||[]).length,headings:{h1:[...primary.querySelectorAll('h1')].map(text).filter(Boolean),h2:[...primary.querySelectorAll('h2')].map(text).filter(Boolean),emptyCount:[...primary.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h=>!text(h)).length},structuredDataTypes:[...new Set(types)],images:{total:imgs.length,missingAlt:imgs.filter(i=>!i.hasAttribute('alt')).length},links:{internalPrimary:internal,externalPrimary:external,checked},freshness:{datePublished:datePublished.slice(0,6),dateModified:dateModified.slice(0,6),titleYears,metaDescriptionYears:metaYears,bodyYears,sourceLinkYears:sourceYears},authorSignals:author,openGraph:{title:prop('og:title'),description:prop('og:description')}}};
}
button.addEventListener('click',async()=>{button.disabled=true;status.textContent='Capturing page and checking a small set of internal links…';try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab?.id||!/^https?:/.test(tab.url||''))throw new Error('Open a public http(s) page first.');const [{result}]=await chrome.scripting.executeScript({target:{tabId:tab.id},func:capturePage});const name=`cadence-browser-assist-${new URL(result.url).hostname}-${Date.now()}.json`;const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);await chrome.downloads.download({url,filename:name,saveAs:false});setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Capture saved. Import it into V2; link checks are browser evidence, not verified crawler access.';}catch(e){status.textContent=e.message||'Capture failed.';}finally{button.disabled=false;}});
