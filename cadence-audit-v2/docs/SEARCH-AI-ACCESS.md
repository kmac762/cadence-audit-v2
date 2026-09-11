# Search & AI Access - 2.0.0-rc.3

Registry 2026-09-11.1. Manually reviewed 2026-09-11.
Not exhaustive; there is no automatic registry update or guarantee all bots are listed.

## Coverage

| Token | Provider | Group | Policy behavior | Documentation |
|---|---|---|---|---|
| Googlebot | Google | Search discovery | robots | [Provider documentation reviewed](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers) |
| bingbot | Microsoft | Search discovery | robots | [Provider documentation reviewed](https://blogs.bing.com/webmaster/september-2020/Bing-Webmaster-Tools-makes-it-easy-to-edit-and-verify-your-robots-txt) |
| OAI-SearchBot | OpenAI | Search discovery | robots | [Provider documentation reviewed](https://developers.openai.com/api/docs/bots) |
| Claude-SearchBot | Anthropic | Search discovery | robots | [Provider documentation reviewed](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| PerplexityBot | Perplexity | Search discovery | robots | [Provider documentation reviewed](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) |
| Applebot | Apple | Search discovery | robots | [Provider documentation reviewed](https://support.apple.com/en-us/119829) |
| Amzn-SearchBot | Amazon | Search discovery | robots | [Provider documentation reviewed](https://developer.amazon.com/amazonbot) |
| DuckAssistBot | DuckDuckGo | Search discovery | robots | [Provider documentation reviewed](https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot) |
| MistralAI-Index | Mistral | Search discovery | robots | [Provider documentation reviewed](https://docs.mistral.ai/robots) |
| ChatGPT-User | OpenAI | User-requested retrieval | advisory | [Provider documentation reviewed](https://developers.openai.com/api/docs/bots) |
| Claude-User | Anthropic | User-requested retrieval | robots | [Provider documentation reviewed](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| Perplexity-User | Perplexity | User-requested retrieval | advisory | [Provider documentation reviewed](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) |
| Amzn-User | Amazon | User-requested retrieval | advisory | [Provider documentation reviewed](https://developer.amazon.com/amazonbot) |
| MistralAI-User | Mistral | User-requested retrieval | robots | [Provider documentation reviewed](https://docs.mistral.ai/robots) |
| meta-externalfetcher | Meta | User-requested retrieval | unverified | [Provider page unavailable during review](https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers/) |
| GPTBot | OpenAI | Training controls | robots | [Provider documentation reviewed](https://developers.openai.com/api/docs/bots) |
| ClaudeBot | Anthropic | Training controls | robots | [Provider documentation reviewed](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| MistralAI-Training | Mistral | Training controls | robots | [Provider documentation reviewed](https://docs.mistral.ai/robots) |
| Applebot-Extended | Apple | Training controls | robots | [Provider documentation reviewed](https://support.apple.com/en-us/119829) |
| Google-Extended | Google | Mixed content uses | robots | [Provider documentation reviewed](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers) |
| Amazonbot | Amazon | Mixed content uses | robots | [Provider documentation reviewed](https://developer.amazon.com/amazonbot) |
| meta-externalagent | Meta | Additional collection | unverified | [Provider page unavailable during review](https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers/) |
| CCBot | Common Crawl | Additional collection | robots | [Provider documentation reviewed](https://commoncrawl.org/ccbot) |
| Bytespider | ByteDance | Additional collection | unverified | [Provider page had no readable content](https://zhanzhang.toutiao.com/docs/intro/26899) |

## What is and is not established

1. **Published policy:** rule matching on the retrieved robots.txt for each checked
   page's scheme/host/port. This is not proof of a visit or of provider enforcement.
2. **Our request:** the actual HTTP response received by CadenceAuditAssistant/2.0.
   A denial of our scanner does not prove a genuine provider is denied.
3. **Actual provider access:** not verified. We do not inspect authenticated provider
   traffic, server/CDN logs, Search Console, crawler IPs, or provider caches.

Search, user-triggered retrieval, training and mixed-use controls are not interchangeable.
Google-Extended includes specified Gemini training and grounding uses but does not
control Google Search inclusion. Applebot-Extended is a content-use token, not a
separate HTTP crawler. Training-only restrictions are informational, not promoted
as search defects. Missing restrictions do not prove training actually occurs.

The default cards cover six frequently relevant search agents. All 24 entries,
including Apple, Amazon, DuckDuckGo and the additional collection group, are in the
expandable matrix. Filters select purpose and restricted/unknown declared policies.

## Provider-specific limitations

- ChatGPT-User, Perplexity-User and Amzn-User have provider-documented user-requested
  exceptions. Their robots entries are shown as declared policy only, not blocking.
- Anthropic's Claude-User and MistralAI-User are evaluated under their documented
  robots behavior. A disallow can prompt a policy review, not a claim of lost traffic.
- Applebot inherits an explicit Googlebot group if Applebot is not explicitly named,
  as Apple documents. This does not change Applebot-Extended handling.
- Amazon documents fallback to other search-bot rules when Amzn-SearchBot is absent
  but does not specify an exact ordering. If another named search group is present,
  the result is Unknown rather than inventing a precedence. An explicit Amzn-SearchBot
  group can be evaluated normally.
- The Meta provider page could not be retrieved and ByteDance's provider page had no
  readable content during review. Their named tokens remain visible as unverified
  declared syntax only. Purpose/enforcement claims are not inferred and their
  restrictions are not promoted into the sales brief.

## Sampling, limits and network behavior

The matrix evaluates entered/final URL and requested/final URLs from the HTML
inspection sample, deduplicated without URL fragments (maximum 120). It does not
include all relationship-crawl URLs or claim whole-site coverage. Different schemes,
hosts and ports have separate policies. Up to four origins' policies are retrieved
within the existing job budget, once per origin. Unretrieved origins are Unknown.
There are no 24-per-page network probes or forged provider user-agent requests.

The policy-fetch timeout is six seconds. The parser accepts at most 512,000 bytes;
oversized content is Unknown rather than a silently truncated allow. Matching supports
case-insensitive agent groups, explicit/wildcard groups, merging repeated groups,
longest octet match, Allow on an equal-length tie, wildcards, terminal dollar anchors,
case-sensitive paths and normalized percent encodings. robots.txt itself is implicitly
permitted. Empty Disallow is not interpreted as block-all. Provider-specific differences
beyond the documented exceptions may remain; inspect original rules when in doubt.

200 text policies, including empty files, can be evaluated. Normal 404/410 means
no robots file and no robots restriction observed, not verified network access.
401/403/429/5xx, HTML/challenge responses, truncated/oversized files, invalid encoding,
and unsupported/malformed syntax remain Unknown. This deliberately does not try to
reproduce every provider's cache/retry behavior. Some providers may recover valid
rules from syntax this conservative implementation marks Unknown.

crawl-delay, request-rate, host and content-signal are recognized as extensions,
but their values are not enforced/interpreted by this access matrix. Meta robots,
X-Robots-Tag, snippets, authentication and account-level settings are separate checks.

## Evidence and recommendations

Each entry lists inspected paths, matched agent groups, winning Allow/Disallow rule,
line number, policy URL and retrieval time. Retrieved policy files retain a bounded
raw text, SHA-256 and response metadata so an auditor can verify the measurement.

A directly observed restriction affecting a search or robots-governed retrieval
agent can generate a single consolidated policy-review recommendation. The remedy
is to confirm desired visibility, inspect exact rules, change only unintended
restrictions, preserve private/training choices, review the firewall separately,
and recheck the affected URLs. No automatic robots edits or allow-all recipe is made.

The finding's confidence concerns the observed syntax. Client intent and actual
provider reach remain unverified. The sales brief includes that distinction. Review
controls continue to require a human verification confirmation before selection.

## Maintaining the registry

Edit shared/crawlers.mjs only after reviewing provider documentation. Update the
registry version/date, role, exception notes and tests together. Rebuild the complete
manifest and preview with npm run build, run tests, and deploy the matched package.
Use an explicit documentation-gap state when a provider source cannot be checked.
