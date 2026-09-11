import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {RELEASE} from '../shared/release.mjs';
export async function checkRelease(root){const manifest=JSON.parse(await fs.readFile(path.join(root,'release-manifest.json'),'utf8'));if(manifest.release!==RELEASE)throw new Error('Release manifest/version mismatch. Deploy the whole release together.');for(const[file,digest]of Object.entries(manifest.files)){const data=await fs.readFile(path.join(root,file));if(crypto.createHash('sha256').update(data).digest('hex')!==digest)throw new Error(`Mixed or modified release file: ${file}. Regenerate the manifest and deploy the complete release.`);}return true;}
if(process.argv[1]===fileURLToPath(import.meta.url)){await checkRelease(fileURLToPath(new URL('../',import.meta.url)));console.log('Release files match the manifest.');}
