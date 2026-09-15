# Cadence Search Audit Workspace V2

**2.0.0-rc.13 | Separate staging candidate, not a production replacement**

The change is not another visual patch. This package contains one matched server,
scanner adapter, recommendation library, browser interface and release manifest.
It has not been deployed to your Render account and it does not change your live
app, custom domain, repository or DNS.

Open **START-HERE.html** for the browser-only installation steps. Open
**docs/V2-preview.html** for an interactive, offline, synthetic example. The preview
cannot crawl a website; it shows the sales wording and review workflow without a
server or an API key.


## rc.12: established audit-tool UX + visible Content Freshness

- Restores visual parity with the existing Cadence URL Audit Assistant: white masthead, spectrum rule, dark canvas, editorial serif hierarchy, signal/orbit motif, and dark evidence cards.
- Content Freshness is always represented in the report rather than disappearing when zero articles were inspected.
- Site-sample scans reserve a bounded freshness sample of up to eight sitemap-discovered article URLs, reusing pages already fetched wherever possible.
- A zero-article result is explicitly labeled as incomplete coverage, never as proof that the blog is current.


## rc.10: Content Freshness

- Adds bounded blog/article freshness review using age plus additional staleness signals.
- Age alone is never treated as a defect or proof of traffic decay.
- Browser Assist can contribute rendered-page freshness signals when the hosted scanner is blocked.

## rc.9: Broken links and page paths

- Adds a bounded **Broken links & page paths** panel across internal destinations found in the inspected sample.
- Separates confirmed 4xx/5xx errors, redirects/chains, redirect loops, soft-404 review cues, and unverified blocked requests.
- Access-denied responses (401/403/407/429/challenges) are **not** classified as broken.
- Broken paths can become a search-first sales recommendation with a plain-language client explanation.
- Browser Assist now checks up to 12 same-origin internal destinations from each deliberately captured public page using the user's browser. Those checks are clearly labeled browser evidence and do not verify Googlebot or AI-crawler access.
- This remains a bounded prospect audit, not a complete-site broken-link crawler.

## New: Search & AI Access

A dedicated report section evaluates 24 documented or explicitly caveated crawler
and policy tokens across the entry and deep-sampled URL paths. Search, user-requested
retrieval, training, mixed content uses and additional collection are separated.
The quick cards show Google, Bing, ChatGPT, Claude, Perplexity and Mistral search;
expand the section to inspect every entry, matching rule, line number and page path.

This is a published-policy inspection, not a bot-impersonation test. Our HTTP
response is shown separately. Genuine provider access remains **Not verified**.
Training-only restrictions do not become search defects. Unavailable policy files
stay Unknown, and provider documentation gaps are visibly marked. Google-Extended
includes specified grounding uses and is not treated as a training-only control.

Each origin's policy is fetched once and reused for the 24 evaluations. No separate
network request is made using each bot's name. Up to four origins and 120 URL paths
are considered within the existing job budget. Only entry and deep-sample URL paths
are in the matrix; the relationship crawl is not falsely claimed as policy coverage.
See docs/SEARCH-AI-ACCESS.md for the registry, interpretation and limits.

## What changed

Each top recommendation has: what was observed, why it matters, Cadence's proposed
steps, what success looks like, implementation-effort context, a spoken explanation,
limitations, source guidance, evidence and a human review decision. The sample and
confidence remain explicit. There is no claim of lost revenue, a ranking penalty,
or guaranteed AI inclusion from a missing heading or schema type.

The web request no longer waits for a full crawl. It creates a job with HTTP 202.
The browser polls job status; one child worker performs the scan. A failed worker
or timed-out job becomes failed/partial, not a healthy-site assessment. Completed
checkpoints can survive restart when the data directory is on a persistent disk.
Interrupted jobs do not automatically resume; start a new scan to retry.

The release manifest is checked before the server starts. Replacing just a script
or stylesheet from another release fails the check instead of silently mixing
versions. API writes also require the matching release version and a browser token.

## Scope and limitations

- Page mode inspects one entry page. Sample mode inspects up to 12/18/24 HTML pages
  and a larger 24/36/48-page contextual-link sample. These are bounded samples, not
  exhaustive sitewide crawls. Samples overlap; do not add these counts as unique pages.
- Only the entry page is browser-rendered. HTML sample pages are not all deep-rendered.
- Raw HTML parsing, page-type inference, main-content extraction, source-link
  classification and page-specific-schema matching remain heuristics. Verify examples.
- The scanner does not access Search Console, ranking history, analytics, logs from
  Google/AI crawlers, paid tools, or conversion data. It cannot prove business loss.
- V2 uses deterministic recommendations, not an AI API. The old AI adapter remains
  solely for legacy regression coverage and is not called by the V2 pipeline.
- The current production HTTP 502 root cause is still unconfirmed. Job isolation
  reduces long-request coupling; it does not prove that the hosted fault is resolved.

## Hosting and storage

One Docker web service hosts both the web process and its child worker. This is
not a distributed queue or a separately hosted Render background worker. Run one
instance only. Chromium still consumes the same container's CPU/memory, so a full
container out-of-memory event can interrupt the service. Resource testing on Render
is required before promotion.

The candidate defaults to one running scan, two queued scans, a 180-second job
limit, 6 scans/hour per browser and 12/hour service-wide. Records are retained for
up to 24 hours (cleanup every minute) and at most 20 records. Storage is atomic JSON
under DATA_DIR with a 6 MB per-record limit. A mounted persistent disk is necessary
for retention across deploys. This is short-term audit work, not permanent client history.

No password has been added. Anyone who knows the address can use it. Signed anonymous
browser cookies separate ownership of scan records, but are not team authentication.
Noindex and robots restrictions do not make the service private. Do not store
sensitive client information in notes. See docs/SECURITY.md.

## Branding

The supplied Cadence Search logo keeps its original embedded pixels and geometry.
rc.12 displays the original dark/multicolor lockup on a white navigation bar, while the
hero and footer use deep navy with restrained purple/cyan/green accents. The working
canvas and report cards are light for easier long-form review. System fonts are used;
no generated replacement wordmark or font file is included.

This is a complete matched release, not a patch. Use this archive instead of the
earlier V2 archive. The folder remains `cadence-audit-v2`; do not upload isolated
files over V1 or replace the current live app. See docs/BRANDING.md.

## Developer commands (not required for Kevin's browser setup)

Requires Node 22.16+ and Chromium for real rendering. No npm packages are required.

    npm run build
    npm test
    npm run check
    npm start

Local address: http://127.0.0.1:4318. Hosted mode uses the provider PORT and 0.0.0.0.
Docker installs Chromium. No APP_PASSWORD or OPENAI_API_KEY is needed.

The Docker build runs the tests and verifies the manifest; it does not regenerate
an invalid manifest to hide an inconsistent upload. Review code changes, rebuild,
test and deploy as one release.

Read docs/TESTING.md for precisely what was and was not tested, and
DEPLOYMENT.md for acceptance checks and the no-production-change boundary.



## rc.6 search-first recommendation language

rc.6 keeps the rc.5 scanner, Browser Assist, Search & AI Access checks, rate limits, 403 handling, and branding unchanged. Recommendation cards now lead with the specific search visibility connection, the Cadence search solution, the supported vs. unproven search effect, and a search-focused success check. General usability/accessibility value is secondary. Saved non-Browser-Assist reports are refreshed with the current reviewed playbook language when opened, without changing their underlying observations or evidence. See `docs/RC6-CHANGES.md`.

## rc.5 update
See docs/RC4-CHANGES.md and UPDATE-RC4.html. Defaults remain six scan starts per browser session and twelve across the app per hour. SCAN_LIMIT_PER_SESSION and SCAN_LIMIT_GLOBAL are optional overrides in rc.4. They are in-memory fixed windows and do not control a target website's firewall. Styles and logo assets are unchanged.


## rc.5 Browser Assist

For prospect sites that block the hosted scanner, rc.5 adds an optional Chrome Browser Assist workflow. Open a public page, click the extension, save the capture, and import it into the matching completed V2 audit. Browser evidence is rendered-page evidence only and does not verify initial HTML, firewall behavior, robots enforcement, or real search/AI crawler access. See `docs/RC5-CHANGES.md` and `browser-assist-extension/README.html`.


## rc.8 plain-language client explanations

rc.8 keeps the rc.7 search + AI relevance model, Browser Assist, crawler-policy checks, 403 handling, rate limits, branding, and scan behavior unchanged. It separates evidence from the client-facing explanation: sample counts and scanner details stay under **What we observed**, while **Simple client explanation** describes the meaning in plain language. Saved recommendations and Browser Assist recommendations refresh to the current explanation when opened. See `docs/RC8-CHANGES.md`.
