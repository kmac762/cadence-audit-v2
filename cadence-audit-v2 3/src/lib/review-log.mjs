import fs from 'node:fs/promises';
import path from 'node:path';

const DECISIONS = new Set(['use', 'investigate', 'ignore', 'clear']);

function cleanText(value, max = 500) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, max);
}

export function normalizeReviewPayload(body = {}) {
  const decision = cleanText(body.decision, 20).toLowerCase();
  if (!DECISIONS.has(decision)) throw new Error('Invalid review decision.');

  const url = cleanText(body.url, 2048);
  const findingKey = cleanText(body.findingKey, 240);
  if (!url || !findingKey) throw new Error('Review decision is missing its URL or finding key.');
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
  } catch {
    throw new Error('Review decision contains an invalid URL.');
  }

  return {
    recordedAt:new Date().toISOString(),
    url,
    findingKey,
    decision,
    title:cleanText(body.title, 300),
    category:cleanText(body.category, 100),
    scope:cleanText(body.scope, 40),
    findingType:cleanText(body.findingType, 60),
    scannedAt:cleanText(body.scannedAt, 80)
  };
}

export async function appendReviewDecision(projectRoot, body = {}) {
  const record = normalizeReviewPayload(body);
  const configuredDir = String(process.env.DATA_DIR || '').trim();
  const dataDir = configuredDir ? path.resolve(configuredDir) : path.join(projectRoot, 'data');
  await fs.mkdir(dataDir, { recursive:true });
  const filePath = path.join(dataDir, 'review-decisions.jsonl');
  await fs.appendFile(filePath, `${JSON.stringify(record)}\n`, 'utf8');
  return { record, filePath };
}
