import { safeFetch } from './safe-fetch.mjs';
import { analyzeHtml } from './analyze-html.mjs';
import { analyzeRobots } from './robots.mjs';
import { renderPage } from './render.mjs';
import { generateFindings } from './rules.mjs';
import { assessHttpAccess } from './access.mjs';
import { createSiteSnapshot, disabledSiteSnapshot } from './site-snapshot.mjs';
import { classifyUrlType } from './page-type.mjs';
import { buildAuditBrief } from './ai-brief.mjs';
import { attachVerification } from './verification.mjs';
import { buildOnPageQa, validateInternalLinks } from './on-page-qa.mjs';
import { addPriorityComposites, selectDiverseFindings } from './priority.mjs';

export async function scanUrl(input, options = {}) {
  const includeSiteSnapshot = options.siteSnapshot !== false;
  const page = await safeFetch(input);
  const raw = analyzeHtml(page.body, page.finalUrl);
  const access = assessHttpAccess({ status: page.status, headers: page.headers, body: page.body, rawAnalysis: raw });

  const robotsPromise = analyzeRobots(page.finalUrl);
  const renderPromise = renderPage(page.finalUrl, access.pageContentUsable ? raw : null);
  const robots = await robotsPromise;
  const sitePromise = includeSiteSnapshot
    ? createSiteSnapshot(page.finalUrl, robots, { sampleSize: Number(options.sampleSize) || 12 })
    : Promise.resolve(disabledSiteSnapshot());

  const [rendered, siteSnapshot] = await Promise.all([renderPromise, sitePromise]);
  const scanWarnings = [];

  if (access.likelyInterference) {
    scanWarnings.push({ component: 'HTTP fetch', message: access.message });
  }
  if (rendered.enabled && !rendered.succeeded) {
    scanWarnings.push({ component: 'Rendered page', message: rendered.error || 'Rendered-page analysis did not complete reliably.' });
  }
  if (robots.error) {
    scanWarnings.push({ component: 'robots.txt', message: robots.error });
  }
  if (siteSnapshot.enabled) {
    const failed = siteSnapshot.pages.filter((p) => p && p.status === null).length;
    if (siteSnapshot.pages.length >= 4 && failed >= Math.ceil(siteSnapshot.pages.length / 2)) {
      scanWarnings.push({ component: 'Site snapshot', message: `${failed} of ${siteSnapshot.pages.length} sampled URLs could not be fetched, so sitewide pattern checks are incomplete.` });
    }
  }

  const contentAnalysis = access.pageContentUsable
    ? { usable:true, source:'initial-html', html:raw }
    : (rendered.succeeded && rendered.html
        ? { usable:true, source:'rendered-fallback', html:rendered.html }
        : { usable:false, source:null, html:null });

  const facts = {
    requestedUrl: page.requestedUrl,
    finalUrl: page.finalUrl,
    scannedAt: new Date().toISOString(),
    responseStatus: page.status,
    responseHeaders: page.headers,
    requestProfile: page.requestProfile,
    access,
    redirectChain: page.redirects,
    raw,
    rendered,
    contentAnalysis,
    robots,
    siteSnapshot,
    scanWarnings,
    scanComplete: scanWarnings.length === 0,
    pageType: classifyUrlType(page.finalUrl, '', (contentAnalysis.html?.structuredDataTypes || contentAnalysis.html?.jsonLdTypes || []))
  };

  const linkHealth = await validateInternalLinks(facts, { limit:20 });
  const onPageQa = buildOnPageQa(facts, linkHealth);
  const pageFindings = generateFindings(facts).map((finding) => ({ scope:'page', ...finding }));
  const siteFindings = (siteSnapshot.findings || []).map((finding) => ({ scope:'site', ...finding }));
  const qaFindings = onPageQa.findings || [];
  const findingByKey = new Map();
  for (const finding of [...pageFindings, ...siteFindings, ...qaFindings]) {
    const key = `${finding.scope || 'page'}:${finding.id}`;
    const existing = findingByKey.get(key);
    if (!existing || Number(finding.score || 0) > Number(existing.score || 0)) findingByKey.set(key, finding);
  }
  const prioritizedRaw = addPriorityComposites([...findingByKey.values()]);
  const findings = attachVerification(prioritizedRaw).sort((a,b) => b.score - a.score);
  const topFindings = selectDiverseFindings(findings, 5);
  const topIssues = topFindings.filter((finding) => finding.findingType !== 'opportunity');
  const topOpportunities = topFindings.filter((finding) => finding.findingType === 'opportunity');
  const auditBrief = await buildAuditBrief(facts, findings, { useAi: options.aiBrief !== false });
  return { facts, findings, topFindings, topIssues, topOpportunities, auditBrief, onPageQa };
}
