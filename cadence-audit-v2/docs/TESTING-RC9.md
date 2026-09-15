# rc.9 validation

- 159/159 automated tests passed after the final release build.
- New coverage includes confirmed broken internal targets, redirects, access-denied destinations kept unverified, soft-404 review cues, site-health promotion into recommendations, and Browser Assist link-health counts.
- Chromium hydration test passed after making temporary profile cleanup tolerant of delayed file release.
- Release manifest integrity check passes.

These tests use controlled fixtures. Real prospect sites can still deny Render or browser requests; denied responses remain unverified rather than broken.
