// All Chromium HTTP(S) sockets use this local proxy. Destinations are resolved,
// checked and pinned at connection time, including CONNECT tunnels (DNS rebinding defense).
import http from 'node:http';
import net from 'node:net';
import {normalizeHttpUrl,resolvePublicHost} from '../lib/network-safety.mjs';
import {createPinnedLookup} from '../lib/safe-fetch.mjs';
export async function startEgressProxy({resolveHost=resolvePublicHost,maxBytes=40*1024*1024,maxRequests=160}={}){
  const sockets=new Set();let bytes=0,requests=0,blocked=0;
  const track=s=>{sockets.add(s);s.on('close',()=>sockets.delete(s));s.on('error',()=>{});s.setTimeout(16000,()=>s.destroy());s.on('data',b=>{bytes+=b.length;if(bytes>maxBytes)for(const a of sockets)a.destroy();});return s;};
  const server=http.createServer(async(req,res)=>{
    try{
      if(++requests>maxRequests||bytes>maxBytes)throw new Error('Rendering network budget reached.');
      const url=normalizeHttpUrl(req.url);if(url.protocol!=='http:')throw new Error('Use CONNECT for TLS.');
      const records=await resolveHost(url);const headers={...req.headers,host:url.host};delete headers['proxy-authorization'];delete headers['proxy-connection'];const upstream=http.request(url,{method:req.method,lookup:createPinnedLookup(records),headers,agent:false},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});
      upstream.on('socket',track);upstream.on('error',()=>{res.writeHead(502);res.end();});req.pipe(upstream);
    }catch{blocked++;res.writeHead(403);res.end('Network target blocked.');}
  });
  server.on('connection',track);
  server.on('connect',async(req,client,head)=>{
    try{
      if(++requests>maxRequests||bytes>maxBytes)throw new Error('Budget');
      const url=normalizeHttpUrl('https://'+req.url),records=await resolveHost(url),record=records[0];
      const upstream=track(net.connect({host:record.address,port:Number(url.port)||443,family:record.family}));
      upstream.once('connect',()=>{client.write('HTTP/1.1 200 Connection Established\r\n\r\n');if(head.length)upstream.write(head);upstream.pipe(client);client.pipe(upstream);});
      upstream.once('error',()=>client.destroy());client.once('close',()=>upstream.destroy());
    }catch{blocked++;client.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return{port:server.address().port,stats:()=>({requests,bytes,blocked}),close:async()=>{for(const s of sockets)s.destroy();await new Promise(resolve=>server.close(resolve));}};
}
