# V2 staging deployment - browser-only

## Leave the working environment alone

Do not overwrite cadence-audit-assistant-v1.1.0. Do not change its Render Root Directory.
Do not move the existing audit subdomain. This is a NEW test service with its own
Render-provided address. The existing production 502 still needs its service logs
and resource metrics inspected; this release does not diagnose that incident.

This is release **2.0.0-rc.12**, the established-tool visual parity + content freshness coverage candidate. Use this
archive instead of an earlier V2 archive. The folder remains cadence-audit-v2.
An existing V2 staging repository can receive the complete updated folder in one
commit; check that the new files are present. Do not mix individual V1 hotfixes into V2.

## 1. Preview first

Download and unzip the V2 package. Double-click docs/V2-preview.html. Select
Explore an example report, open the evidence, check the verification box, choose
Use in video, and build the brief. All data in this preview is synthetic; real
scanning is intentionally disabled. The palette is in public/brand.css.

## 2. New GitHub repository

Create a NEW private repository called cadence-audit-v2. Initialize a README so
Add file is available. Choose Add file > Upload files. Drag the complete unzipped
cadence-audit-v2 folder (not the ZIP) into the upload area, and commit together.

The resulting repository should show:

    README.md                       (GitHub's optional initial README)
    cadence-audit-v2/
      Dockerfile
      package.json
      release-manifest.json
      public/
      shared/
      src/
      scripts/
      test/
      ...

There are fewer than 100 files. Check that all subfolders and release-manifest.json
are present. Do not upload existing data folders, passwords, API keys, or old hotfixes.

## 3. New Render Web Service

Create a NEW Web Service from the new private GitHub repository. Use these settings:

| Setting | Value |
| --- | --- |
| Name | cadence-audit-v2-staging |
| Branch | main |
| Root Directory | cadence-audit-v2 |
| Language/runtime | Docker |
| Dockerfile path | Dockerfile |
| Docker build context | . |
| Region | Your preferred region, for example Oregon |
| Compute | Start testing at 1 CPU / 2 GB RAM; confirm the displayed price |
| Health check path | /api/health |
| Instances | 1 |
| Automatic deploys | Off during acceptance testing |

If you upload the folder CONTENTS directly to repository root instead, leave Root
Directory blank. Do not mix the two layouts. The included optional render.yaml
assumes the whole-folder layout above. Manual Web Service setup is the recommended
path here; you do not need to use a Blueprint.

The staging service and disk incur additional hosting charges. Confirm the current
Render estimate before creating them. No infrastructure has been provisioned for you.

## 4. Environment and disk

Set:

    NODE_ENV=production
    DATA_DIR=/var/data
    CHROMIUM_PATH=/usr/bin/chromium
    ENABLE_RENDERING=1

These defaults are also in the Dockerfile. Do not add APP_PASSWORD, AUTH_REQUIRED,
or an AI API key. PORT is supplied by Render. SESSION_SECRET is optional: the app
creates a random signing secret on the disk if one is not provided. It is not a login
password. Never commit it or send it in chat.

Add a 1 GB persistent disk at /var/data. Use the service's Advanced/Disks settings.
Confirm the disk is mounted before relying on saved jobs. DATA_DIR alone does not
create a disk. The Docker entrypoint prepares the mount then starts Node as a
non-root user. The package does not contain a prebuilt Docker image.

A disk is available to a single instance. Redeploying a disk-backed service involves
a brief interruption; in-flight scans will be marked interrupted after restart.

## 5. Initial checks on the NEW Render address

Wait for Live. Open /api/health and confirm release 2.0.0-rc.12 and schemaVersion 2.
Open the base address. It should show V2 and no password login. Confirm the Cadence-style interface: white navigation with the original logo, a dark
navy hero, light audit/report workspace, and that the example report works.

Do not assign the production custom domain yet.

## 6. Acceptance tests before promotion

1. Run a Page-only scan of a public website you are authorized to review. Verify
   entry HTML, browser-render status, sample limits and evidence.
2. Run Quick, then Balanced, on Regen Infusions and Insero Advisors. Compare the
   recommendations and evidence with manual inspection; don't assume old results
   remain current.
3. Test the previously failing Dear Markus URL. Save the scan ID and inspect Render
   logs and memory metrics if it fails. A saved partial result is not a full pass.
4. Test a JavaScript-heavy page and a page that denies automated access. Denial should
   become an explicit coverage gap, not missing-title/H1 findings about an error page.
5. Refresh during a scan. Verify polling reconnects to the same job in the same browser.
6. Cancel a scan, then run another. Verify the worker and browser are cleaned up.
7. Verify Use in video, Ignore, Needs investigation, notes, and the copied brief.
8. Restart the STAGING service with an active scan. With the disk attached, the record
   should return as interrupted, not silently completed. Start a new scan to retry.
9. Review at least one ecommerce/SaaS or different-template site. A healthy sample may
   produce fewer than five opportunities. Confirm no forced ranking/traffic claims.

10. In Search & AI Access, inspect both permitted and disallowed page paths, the
    matched line/group, and the policy URL/date. Check the purpose filter and the
    unknown state. Confirm intentional training restrictions do not become search
    findings. Meta/Bytespider entries must retain their documentation-gap label.
11. Test a redirect to a different origin. The matrix must use separate policy files,
    not borrow the entry hostname's rules. Actual provider access must remain unverified.

Only promote after both a salesperson and a technical reviewer approve the results.
Keep a record of the last confirmed working production deployment for rollback.

## If a check fails

Stop changing frontend files. Capture the V2 job ID, error code, release, input URL,
Render log lines and memory/CPU metrics for that time. Do not include secrets. A
health endpoint returning 200 only confirms the web process is responsive; it does
not validate Chromium or the entire scan.

See docs/TESTING.md for local validation and its environment limitations.

## Primary provider references (checked 2026-09-11)

- https://render.com/docs/disks
- https://render.com/docs/docker
- https://render.com/docs/blueprint-spec
- https://render.com/docs/deploys
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
