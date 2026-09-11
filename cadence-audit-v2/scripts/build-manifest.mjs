import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {RELEASE,API_VERSION} from '../shared/release.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),files={};
for(const dir of ['public','shared','src']){const walk=async d=>{for(const name of await fs.readdir(path.join(root,d))){const f=path.join(d,name),stat=await fs.stat(path.join(root,f));if(stat.isDirectory())await walk(f);else files[f.replaceAll('\\','/')]=crypto.createHash('sha256').update(await fs.readFile(path.join(root,f))).digest('hex');}};await walk(dir);}
await fs.writeFile(path.join(root,'release-manifest.json'),JSON.stringify({release:RELEASE,schemaVersion:API_VERSION,files},null,2)+'\n');
