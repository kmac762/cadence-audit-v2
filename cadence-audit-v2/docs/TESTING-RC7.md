# Validation report - 2.0.0-rc.7

Validated after the direct-header update.

- `npm run build`: passed.
- `npm test`: 145 tests passed, 0 failed.
- `npm run check`: release files match the manifest.
- Added coverage for direct finding-title mapping and for keeping sample-scope/scanner-confidence language out of the visible recommendation-card header.
- Existing Browser Assist, crawler-policy, request-pacing, access-denial, rate-limit, release-integrity, security, worker-isolation, and recommendation guardrail tests remain passing.

This validation does not replace acceptance testing on the Render staging service.
