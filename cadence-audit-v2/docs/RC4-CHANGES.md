# V2 rc.4 - Search-focused recommendations and access-aware scanning

This is a complete staging release. It does not update any deployed service by itself.

## Recommendation changes

The default cards and copied brief now explain the search mechanism, the proposed
remedy, how to verify implementation and the difference between a supported effect
and an unproven performance claim. All 17 playbooks have this distinction. The H1
playbook leads with topic clarity and Google's title-link inputs, not accessibility.
Social-preview housekeeping stays in QA rather than occupying a top recommendation.
Headings and indirect trust observations do not outrank direct issues by default.
No search performance data is connected or invented.

## Access changes (not a bot-protection bypass)

- HTML/policy/sitemap/link-target requests are sequential per origin, with at least
  700 ms between a response finishing and the next network request starting.
- Successful identical page requests reuse a bounded, in-memory 6 MB per-scan cache.
  The cache is not shared between jobs, browsers or sites.
- Three consecutive access denials/challenges stop further network requests to that
  origin for the current scan. Queued requests become explicitly skipped records.
- A target HTTP 429 stops further requests immediately. Retry-After is recorded,
  not used to loop until access is obtained. A 503 with Retry-After also pauses.
- A 200 challenge document is not valid page HTML. Detection requires explicit
  challenge evidence; a Cloudflare CF-Ray header alone never blocks normal content.
- A controlled entry-page browser comparison remains available where appropriate;
  authentication/rate-limit responses do not trigger another browser attempt.
  There is no new all-pages browser crawl, CAPTCHA solving or proxy/identity rotation.
- Browser response status and challenge evidence are checked before analysis.
- 401/403/407/429 are not promoted as confirmed broken internal links.
- Coverage distinguishes selected, attempted/reused, skipped and usable page records.
  A rendered entry-page fallback does not increment the raw HTML sample count.
- Relationship totals count usable HTML records, not every selected URL.
- Broad template/link recommendations are suppressed when less than the coverage
  threshold is usable. Observations from actual inspected pages can remain.
- Diagnostic JSON includes response classifications, timestamps and available
  request references, not page content or authentication credentials.

## The actual hourly limits

Default: 6 accepted scan starts per anonymous browser session and 12 across this
single app instance, per one-hour window. One scan runs at a time; the existing
queue and 180-second worker time limit remain. No defaults were increased.

Windows start with the first counted reservation rather than the clock hour.
Counters are in memory and reset on a service restart; they are usage controls,
not persistent quotas or authentication. A scan that starts then fails still counts.
Invalid submissions and rejected job reservations do not consume a new slot.
The browser now receives a scope-specific error, retry seconds and Retry-After.
App RATE_LIMIT (429) is separate from a target site's 403/429 response.

Optional Render environment settings, after this release is deployed:

    SCAN_LIMIT_PER_SESSION=6
    SCAN_LIMIT_GLOBAL=12

Valid ranges are 1-100 and 1-1000 respectively. Do not raise limits before considering
server capacity and the fact that this deployment has no password. Limits cannot
make a third-party firewall accept the scanner. Old rc.3 hardcodes the defaults;
adding these variables to rc.3 will not change them.

## When a site still denies access

Do not claim that Google or AI services are blocked based on our scanner's response.
For a site you own or are authorized to audit, have its administrator match the
recorded timestamps/request IDs against the firewall and origin logs. Correct the
specific rule or make a scoped, temporary allowance for an authorized scanner.
Do not disable the firewall or blanket-allow shared cloud networks or a spoofable
user-agent alone. Render's default outbound ranges are shared. In Render, the
service's Connect > Outbound tab identifies its ranges; dedicated outbound IPs are
an optional paid setup, not a purchase required for this update.
For prospects without administrator cooperation, some pages may require manual
review. This version does not guarantee full coverage on protected websites.

## What has not changed

CSS, brand colors, logo assets, Dockerfile, crawler registry, no-password choice,
SSRF/private-network checks, and worker concurrency. No production DNS/settings
or user repository was modified by preparing this package.
Old saved reports retain their original wording/evidence: run a new scan to use
rc.4 recommendations. Do not present an example-preview report as real results.
