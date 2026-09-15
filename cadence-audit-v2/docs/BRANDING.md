# Cadence Search V2 branding - rc.11

## Asset treatment

The exact original transparent PNG supplied by the user remains embedded in
`public/brand-logo.svg`. The SVG viewBox trims exterior transparent margins only.
No image-generation output, substitute font, recreated wordmark or changed geometry
is used.

rc.11 removes the prior white inversion treatment in the primary navigation so the
original dark/multicolor Cadence Search lockup sits on a white header, matching the
Cadence website/original audit-tool hierarchy. The favicon retains the multicolor ring.

## UX direction

The interface now uses a mixed light/dark system rather than an all-dark dashboard:

- white navigation and original Cadence Search lockup
- deep-navy hero with restrained orbital/ring detail
- purple/cyan/green brand accents used for hierarchy rather than decoration
- light audit controls and report cards for long-form readability
- a dark Browser Assist panel and dark footer for visual rhythm
- system fonts only; no font files are distributed

## UI palette

Reusable values remain centralized in `public/brand.css`. The main working canvas is
`#f4f5f7`, white cards are `#ffffff`, primary text is `#10182c`, muted text is
`#5a687b`, and the hero is `#07152f`. Purple, cyan, green and pink accents are used
selectively.

This is a visual/UX change only. Scan behavior, deterministic evidence, Browser Assist,
Search & AI Access, Site Health and Content Freshness remain part of the matched release.
