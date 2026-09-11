import {scanContext} from './context.mjs';
import {runScan} from './pipeline.mjs';
const send=(type,value)=>{if(process.connected)process.send({type,value});};
process.once('message',async({input,deadline})=>{
 try {const report=await scanContext.run({deadline,maxRequests:150},()=>runScan(input.url,input,{progress:v=>send('progress',v),checkpoint:v=>send('checkpoint',v)}));
  if(process.connected)process.send({type:'done',value:report},()=>process.disconnect());
 }catch(e){if(process.connected)process.send({type:'failure',message:String(e.message||e)},()=>process.disconnect());}
});
