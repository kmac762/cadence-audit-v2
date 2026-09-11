# Methodology references

The recommendations link to primary guidance. These references support the general
practice, not the claim that a particular website has lost rankings or revenue.
The remedy library lives in src/v2/playbooks.mjs and does not require an AI API.

- Headings: https://www.w3.org/WAI/tutorials/page-structure/headings/
- Title links: https://developers.google.com/search/docs/appearance/title-link
- Snippets and descriptions: https://developers.google.com/search/docs/appearance/snippet
- Crawlable links: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- AI features, including no special schema requirement: https://developers.google.com/search/docs/appearance/ai-features
- Structured data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Article markup: https://developers.google.com/search/docs/appearance/structured-data/article
- OpenAI crawler purposes: https://developers.openai.com/api/docs/bots
- robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Canonicalization: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- JavaScript: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

Provider setup:
- https://render.com/docs/disks
- https://render.com/docs/docker
- https://render.com/docs/blueprint-spec
- https://render.com/docs/deploys

The V2 build was prepared 2026-09-11. Recheck provider setup guidance and pricing
at deployment. A missing H1 is not automatically a penalty; a service-schema gap is
not proof of missing AI citations; no links in a bounded sample do not prove orphaning.

## Crawler registry review (11 September 2026)

See SEARCH-AI-ACCESS.md for per-entry documentation gaps and purposes. Meta and
ByteDance URLs are recorded as unavailable, not claimed as verified documentation.

- https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- https://blogs.bing.com/webmaster/september-2020/Bing-Webmaster-Tools-makes-it-easy-to-edit-and-verify-your-robots-txt
- https://developers.openai.com/api/docs/bots
- https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- https://support.apple.com/en-us/119829
- https://developer.amazon.com/amazonbot
- https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot
- https://docs.mistral.ai/robots
- https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers/
- https://commoncrawl.org/ccbot
- https://zhanzhang.toutiao.com/docs/intro/26899
- https://www.rfc-editor.org/rfc/rfc9309.html
- https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec


## rc.4 verified documentation (2026-09-11)

- https://render.com/docs/outbound-ip-addresses (shared regional ranges; Connect > Outbound; dedicated options).
- https://developers.cloudflare.com/cloudflare-challenges/challenge-types/challenge-pages/detect-response/ (cf-mitigated challenge header).
- https://developers.cloudflare.com/support/troubleshooting/http-status-codes/4xx-client-error/error-403/ (403 has several causes).
- https://developers.google.com/search/docs/appearance/title-link (main visual title and H1 as sources, no guaranteed supplied title).
- https://developers.google.com/search/docs/appearance/snippet (description or page text; no fixed cutoff).
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable (crawlable links and anchor context).
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data (meaning and supported search features).
- https://developers.google.com/search/docs/appearance/google-images (image context and alt text).
- https://developers.google.com/search/docs/appearance/structured-data/article (author identity).
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content (sourcing and quality, not a citation quota).
- https://developers.google.com/search/docs/appearance/ai-features (no special technical requirements beyond Search eligibility).
