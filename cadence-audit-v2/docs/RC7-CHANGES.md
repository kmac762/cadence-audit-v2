# V2 rc.7 - Direct training headers

## Goal
Make each recommendation immediately understandable during training and video-audit preparation without weakening the underlying verification safeguards.

## Changed
- Finding titles are short, direct issue/action labels rather than explanatory headlines.
- Heading findings distinguish **Missing Header 1 Tags** from **Multiple Header 1 Tags** when the inspected issue is known.
- Internal-link recommendations use **Implement Internal Link Strategy**.
- Source-quality recommendations use **Add Supporting Sources and Citations**.
- Other recommendation families use similarly direct labels for title tags, meta descriptions, indexing, structured data, image alt text, hreflang, JavaScript rendering, and recurring on-page issues.
- The small category label is simplified to terms such as **On-Page SEO**, **Internal Linking**, **Content Quality**, and **Structured Data**.
- The visible card header now shows only category, finding title, and priority. It no longer appends **Inspected sample** or scanner-confidence language beside the priority.
- Browser Assist recommendations use the same direct naming convention.
- Saved non-Browser-Assist reports are refreshed with the current direct title/category language when reopened, while preserving their observations, evidence, IDs, and review decisions.

## Unchanged guardrails
- Evidence, sample scope, original scanner confidence, caveats, supported-vs-unproven search effects, and human verification controls remain available in the body or technical details.
- The scanner still does not infer ranking loss, traffic loss, revenue loss, or real crawler access from a single observation.
- Search & AI Access, request pacing, Browser Assist boundaries, and scan limits are unchanged.
