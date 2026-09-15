# rc.9 - Broken links and page paths

This release adds a bounded site-health layer for prospect audits.

## Added
- Checks up to 32 unique internal destinations discovered across the inspected site sample (15 in page-only mode).
- Reuses URLs already fetched during the scan when possible.
- Classifies confirmed 4xx/5xx errors, redirects, redirect chains, redirect loops, soft-404 candidates, and unverified requests.
- Surfaces sampled sitemap URLs that return confirmed errors.
- Adds a dedicated Broken links & page paths panel with evidence.
- Adds search-first recommendations for verified broken paths and redirect hygiene.
- Browser Assist checks up to 12 internal destinations from each captured public page without collecting cookies or form data.

## Guardrails
- 401/403/407/429/challenge responses are unverified, never broken.
- Soft 404s remain manual-review cues.
- Browser Assist link checks do not prove Googlebot or AI-crawler access.
- The check is bounded and does not claim complete-site coverage.
