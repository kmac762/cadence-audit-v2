# Cadence Search V2 - white logo presentation (2.0.0-rc.3)

## Asset treatment

The exact original transparent PNG supplied by the user is still embedded in
public/brand-logo.svg. The SVG viewBox trims exterior transparent margins only.
No image-generation output, recreation, substitute font or changed geometry is used.

The requested white version is achieved by a CSS brightness(0) invert(1) filter on
.brand-logo. The original alpha channel is preserved. The lockup has no background,
border or shadow, so it sits directly on the navy header. The complete mark, including
the ring, is white. The favicon retains the original multicolor ring.

Source PNG SHA-256 (embedded bytes unchanged):
0bce27f3361ac27ba10ff098e33c06841af0bc99e737873095c2e58c0c564003

## UI palette

Interface colors interpret the supplied AIO artwork; this is not a formal brand
specification. They are centralized in public/brand.css.

| Role | Color |
|---|---|
| Main navy | #040b20 |
| Cards | #0c1730 |
| Raised surfaces | #13223f |
| Main copy | #f5f7ff |
| Supporting copy | #b8c6df |
| Interactive cyan | #15dce8 |
| Purple accent | #7135ff |
| Readable purple text | #b29aff |
| Green accent | #35e878 |
| Pink accent | #ff1459 |

Warnings use amber; unknown/advisory policies remain neutral. Large decorative
rings are not added. System fonts are used without distributing any font files.

The release includes the Search & AI Access feature as well as the logo presentation;
see change-scope.json for the actual code changes. Install as a complete staging
release, never as individual V1 front-end patches.
