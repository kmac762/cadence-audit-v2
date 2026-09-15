# Testing rc.8

1. Run a scan against a page that contains an internal link which redirects.
2. Open **Technical detail** and expand **Internal link targets**.
3. Confirm the redirect row shows Status, Redirected link, Final destination, Anchor text, Found on, and Found in.
4. Confirm **Open source page** opens the page containing the link, not the final destination.
5. Confirm a footer link is labeled Footer when the source HTML uses a semantic `<footer>` container.
6. Export diagnostic JSON and confirm the link item retains `sourceUrl`, `targetUrl`, `finalUrl`, `anchorTexts`, `placements`, and `linkOccurrences`.
7. Remember the check is bounded; do not describe it as a complete-site redirect audit.
