# Validation report - 2.0.0-rc.4

Executed in this workspace on 11 September 2026. This is not a certification of
Render behavior or access to any protected customer/prospect website.

- 136 Node automated tests passed, 0 failed, 0 skipped.
- The preceding 113 tests are retained; 23 new tests cover search-specific copy,
  200 challenge documents, non-challenge CDN pages, per-origin sequencing/cache,
  a three-denial stop, target 429 behavior, skipped/usable coverage, partial-sample
  recommendation suppression, 403 link classification, default limits/overrides,
  reservation rollback, 429 API details, and the copied brief.
- Includes a real local Chromium controlled-hydration fixture, not a live-site scan.
- Seven controlled browser checks passed for the offline example: report rendering,
  revised search wording, qualifications, unreviewed/selected brief, verification
  gate, policy-panel presence, and mobile overflow/JavaScript errors.
- Full original-versus-rc.4 byte comparisons confirm unchanged styles.css,
  brand.css, brand-logo.svg, favicon.svg and Dockerfile.
- The finished archive was extracted into a new folder and the full tests and
  release-manifest validation repeated. See packaged-test-results.txt.

## Limits of this validation

The attempted external fetch of https://example.com/ could not complete because
DNS resolution timed out in this environment. All website responses in pipeline
tests were controlled fixtures. Docker is unavailable here; no Render deployment
or genuine customer-site crawl was executed. Controlled tests do not establish
that bot-protection systems will allow the app or resolve the prior V1 502.

## Staging acceptance

Deploy the complete release together into the existing V2 staging repository and
service. Re-run one previously accessible website first, then one previously denied
website. Confirm sample counts, warnings, policy evidence, review decisions and
copied search-focused brief. A denied site remaining denied is expected when its
administrator has not authorized the hosted scanner; it must not generate invented
missing-headings, missing-schema or broken-link claims from that denial.
