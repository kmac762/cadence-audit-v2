import {demoReport} from '../../public/demo.mjs';
process.once('message',({input})=>{
 if(input.url.includes('/crash'))return process.exit(42);
 if(input.url.includes('/hang')){process.send({type:'checkpoint',value:{...demoReport,status:'running',complete:false}});setInterval(()=>{},1000);return;}
 process.send({type:'progress',value:{stage:'pages',message:'Inspecting controlled fixture',done:1,total:2}});
 setTimeout(()=>{process.send({type:'done',value:demoReport},()=>process.disconnect());},150);
});
