function containsAny(value, patterns) {
  const text = String(value || '').toLowerCase();
  return patterns.find((pattern) => text.includes(pattern)) || null;
}

export function assessHttpAccess({ status, headers = {}, body = '', rawAnalysis = null }) {
  const signals = [];
  const server = String(headers.server || '').toLowerCase();
  const bodyText = String(body || '').slice(0, 250000).toLowerCase();
  const wordCount = rawAnalysis?.wordCount ?? 0;

  if (headers['cf-ray']) signals.push('Cloudflare CF-Ray header');
  if (headers['cf-mitigated']) signals.push(`Cloudflare mitigation: ${headers['cf-mitigated']}`);
  if (server.includes('cloudflare')) signals.push('Server identifies as Cloudflare');
  if (headers['x-sucuri-id'] || headers['x-sucuri-cache']) signals.push('Sucuri header');
  if (headers['x-akamai-transformed'] || headers['akamai-grn']) signals.push('Akamai header');

  const challengePhrase = containsAny(bodyText, [
    'just a moment',
    'checking your browser',
    'verify you are human',
    'enable javascript and cookies to continue',
    'sorry, you have been blocked',
    'attention required',
    'access denied',
    'cf-chl-',
    'cloudflare ray id'
  ]);
  if (challengePhrase) signals.push(`Challenge/error text: ${challengePhrase}`);

  const restrictedStatus = [401, 403, 407, 409, 429, 503].includes(Number(status));
  const thinErrorBody = restrictedStatus && wordCount > 0 && wordCount < 120;
  if (thinErrorBody) signals.push(`Very small ${status} response (${wordCount} words)`);

  const likelyInterference = restrictedStatus && (
    Boolean(challengePhrase) ||
    Boolean(headers['cf-ray']) ||
    Boolean(headers['cf-mitigated']) ||
    server.includes('cloudflare') ||
    Boolean(headers['x-sucuri-id']) ||
    Boolean(headers['x-sucuri-cache']) ||
    Boolean(headers['x-akamai-transformed']) ||
    Boolean(headers['akamai-grn']) ||
    wordCount < 40
  );

  return {
    likelyInterference,
    pageContentUsable: Number(status) >= 200 && Number(status) < 400 && !likelyInterference,
    signals,
    message: likelyInterference
      ? `The audit's automated HTTP request received ${status}, but the response looks like CDN/WAF or bot-protection interference rather than reliable evidence that normal visitors or search crawlers receive the same status.`
      : null
  };
}
