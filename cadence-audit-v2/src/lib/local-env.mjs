import fs from 'node:fs/promises';
import path from 'node:path';

export async function loadLocalEnv(projectRoot) {
  const filePath = path.join(projectRoot, '.env.local');
  let text;
  try { text = await fs.readFile(filePath, 'utf8'); }
  catch (error) {
    if (error?.code === 'ENOENT') return { loaded:false, filePath };
    throw error;
  }
  const loaded = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1,-1);
    if (process.env[key] === undefined) process.env[key] = value;
    loaded.push(key);
  }
  return { loaded:true, filePath, keys:loaded };
}
