# Security boundary and known limitations

This candidate preserves the requested no-password behavior. It is not a private
team application just because it is unlinked or noindexed. Anyone with its address
can obtain their own anonymous browser session and submit public website URLs.

Implemented boundaries:
- Standard HTTP(S) ports only; no URL credentials, local/reserved IPs or metadata endpoints.
- DNS destinations are checked and pinned for fetches; redirects are rechecked.
- Bounded downloads, decompressed response size, per-request timeouts and request budgets.
- Chromium uses a per-scan, validating HTTP/CONNECT proxy plus CDP request guards.
- Fresh browser profile; worker gets no application session secret or provider API keys.
- CSRF token and same-site checks without trusting a rewritten proxy Host header.
- Signed HttpOnly browser cookie binds saved reports and reviews to that browser session.
- API version checks, JSON errors, explicit static-asset allowlist and CSP.
- One active scan, bounded queue, global and browser rate limits; process-group cleanup.
- Noindex headers, escaped report text and safe external links.

Limitations:
- These controls are not a security audit or guarantee of protection from every attack.
- Chromium is launched with the retained container-compatible no-sandbox flags on Linux.
  It runs as a non-root user inside the container, but scans untrusted web code. Network
  filtering and a child process are not a substitute for a fully isolated browser service.
- A child scan worker shares the container's overall memory/CPU. Container OOM may still
  interrupt the web process. Provider resource monitoring and staging tests are required.
- The in-memory queue/rate counters reset after service restart; the stored job records
  are not an automatically resumed or distributed queue. Do not run multiple replicas.
- Browser session isolation is not employee identity, authorization or audit-grade logging.
- Clearing cookies, switching browsers, or changing the signing secret makes that browser's
  prior reports unavailable. Notes are ordinary local data, not encrypted by this app.
- The source-link classifier does not prove whether a claim is supported. Markup absence
  in initial HTML does not prove absence from rendered pages or absence of search eligibility.
- Automated template, heading and schema classifications can be wrong. Verification remains required.

For production-wide team use, a provider-managed access layer is preferable to leaving
an anonymous tool public. This release does not add that layer or change the current
production access setup. No client-confidential content should be entered in staging.
