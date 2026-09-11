# V2 rc.5 - Browser Assist for prospect audits

Browser Assist is an explicit fallback for prospect sites that deny or challenge the hosted scanner.

- The hosted scan remains the default.
- Browser Assist is not a bot-protection bypass and does not impersonate Google, OpenAI, Anthropic, Perplexity, or other providers.
- A Chrome extension uses temporary `activeTab` access only after the user clicks it.
- It captures public-page rendered metadata, headings, structured-data types, aggregate image/link counts, and visible author signals.
- It does not collect cookies, form values, passwords, local storage, or private browser data.
- Captures are saved locally as JSON and deliberately imported into the matching V2 audit.
- The audit validates that captures belong to the same website origin as the report.
- Browser-collected evidence is clearly labeled and never changes server/crawler access checks to "verified".
- Up to 10 captures may be attached; 3-5 representative pages are recommended for prospect work.
- Browser Assist can generate search-first recommendations from directly observed rendered-page patterns such as missing H1s, missing document titles, and missing meta descriptions.

Install the unpacked extension from `browser-assist-extension/README.html`.
