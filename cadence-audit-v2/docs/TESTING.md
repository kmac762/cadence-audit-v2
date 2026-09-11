# Test report - 2.0.0-rc.3 (Search & AI Access)

Executed locally on 11 September 2026. This report does not certify a Render
production deployment, a full external website scan, or the cause of the V1 502.

## Automated results

- `npm test`: **113 passed, 0 failed, 0 skipped**.
- Existing 78 tests retained, plus 35 new policy/registry/module-route checks.
- Includes a controlled real Chromium hydration fixture. Other site responses in
  scan tests are deterministic fixtures, not claims about real client websites.
- Existing coverage includes scanner behavior, jobs, queue bounds, crash/timeout
  handling, browser ownership, CSRF/version guards, partial results, review/brief
  behavior, SSRF/egress guards, contrast pairs, static assets and release integrity.
- New checks cover 24 registry entries, purpose distinctions, training-only exclusions,
  user-fetch exceptions, provider documentation gaps, Apple/Amazon fallback behavior,
  per-origin/path policy, missing/unknown/challenged responses, encoding, merging,
  wildcard rules, exact line evidence, safe UI escaping, bounded URL scopes and a
  one-policy-fetch-per-origin integration check.
- `npm run check`: every shipped src/shared/public file matches the manifest.
- Public/shared/server module syntax checks passed.
- Full tests and manifest were repeated from a fresh extraction of the final ZIP.
  See packaged-test-results.txt for that second run.

## Controlled browser interaction checks: 18 passed

The self-contained offline preview was loaded into Chromium with Playwright
set_content. Normal local URL navigation is unavailable under this environment's
browser policy. The Node tests independently exercise real local HTTP/API routes;
we do not claim a full browser-to-live-website scan.

Checks include all 24 policy entries, six quick cards, genuine-access qualifications,
synthetic-data labels, white transparent logo display, purpose and review-only
filters, all 14 example URL paths, exact rule/line/date evidence, user-fetcher caveats,
verification gate, selected solution-led brief and no document overflow at 360,
390 and 768 pixels. No JavaScript exceptions occurred during these interactions.

Desktop header, policy overview, expanded rule evidence and mobile layouts were
visually inspected. Raw results are in ui-test-results.json. All example counts,
URLs, HTTP results and policies are synthetic and visibly labeled.

## Documentation review

Primary provider documentation and RFC 9309 informed the registry/parser. Current
Meta provider content was unavailable and the ByteDance provider page yielded no
readable content. Those entries remain unverified syntax-only checks, visibly marked
and excluded from sales recommendations. See SEARCH-AI-ACCESS.md and SOURCES.md.

## Remaining staging acceptance

- No external prospect website scan or genuine provider crawler request was run here.
- No Docker image build, Render deployment or hosting resource test was run here.
- Check page-only, Quick and Balanced scans on the separate staging service.
- Inspect a known robots disallow and a selective Allow, including a non-root path.
- Confirm an intentional GPTBot/ClaudeBot-only restriction is informational.
- Confirm no available policy yields Unknown, not an actual-access assurance.
- Verify login-free browser ownership, review choices, brief, cancel and restart.
- Inspect server logs/resource metrics if the formerly failing URL fails again.
- Do not move the production domain until these checks pass and users approve.

This is not a security audit or accessibility certification. Selected contrast and
network-boundary checks do not cover every possible state or adversarial site. The
original production HTTP 502 root cause remains unconfirmed.
