// Search-first recommendation library; reviewed 2026-09-11. No observations are invented here.
export const PLAYBOOKS={
  "headings": {
    "title": "Strengthen the main search topic on affected pages",
    "theme": "On-page search relevance",
    "why": "Search visibility connection: Google uses prominent page titles and heading elements, including H1s, as inputs when it understands a page and generates the title link shown in search results. If an affected page does not clearly identify its primary service or topic in a main heading, the search opportunity is to make that relevance signal more explicit and consistent. The goal is not to add an H1 for a score; it is to make the page's intended search topic unmistakable.",
    "steps": [
      "Map each affected page to the service, product, location or topic it is intended to rank for. Compare the title tag, visible page title and H1 in both initial and rendered HTML so we know whether the observed gap is real.",
      "Where the main topic is unclear or the template fails to output it as the primary heading, update the copy and/or CMS template so the page has one descriptive, search-relevant main heading aligned with the title tag and body content. Do not keyword-stuff or redesign the page simply to add a tag.",
      "Re-crawl the affected pages and review the title link Google actually shows after recrawling. With client data, compare relevant query impressions, clicks and indexed-page behavior over time; treat those outcomes separately from the technical fix."
    ],
    "success": "The affected pages clearly state the service or topic they are intended to be found for, expose that topic in an appropriate main heading, and provide Google with a stronger, consistent source for page-topic and title-link interpretation. Any visibility change is measured after recrawling rather than assumed.",
    "caveat": "A missing H1 by itself is not a ranking penalty and does not prove lost traffic. Google can use other prominent text and signals. The search case becomes stronger when the page's main topic is also vague, inconsistent, or poorly aligned with the query intent.",
    "userNote": "Secondary benefit: a clear heading structure can also make the page easier to scan and navigate, but that is not the primary reason this recommendation is being surfaced.",
    "effort": "Search-intent/content review plus template QA; confirm after inspecting the CMS implementation.",
    "talk": "Fourteen of the sampled pages did not expose an H1 in the inspected HTML. We would first confirm what each page is supposed to rank for, then make sure that topic is clearly expressed in the page title, main heading and supporting copy. The search goal is stronger topic clarity and a cleaner title-link input for Google, not simply adding a tag to satisfy an audit.",
    "source": "https://developers.google.com/search/docs/appearance/title-link",
    "searchEffect": "Supported: a clearer, more consistent page-topic signal and an additional documented input Google can use when generating title links. Not established: that the missing H1 caused a ranking loss, that adding one will improve rankings, or that it directly changes AI citations."
  },
  "titles": {
    "title": "Make important pages easier to distinguish in search",
    "theme": "On-page",
    "why": "Search connection: query relevance and the clickable title shown in results. Google uses the title element together with other page and link text. Missing or repetitive titles can give Google a less useful source for distinguishing landing pages.",
    "steps": [
      "Map the affected URLs to their actual purpose and intended audience.",
      "Write specific, accurate titles and correct template output that creates missing or multiple title elements. Keep useful brand context without repeating the same generic title everywhere.",
      "Re-crawl the pages and, with client access, monitor the displayed title links and performance in Search Console."
    ],
    "success": "Each intended landing page outputs an appropriate title that distinguishes its content. Search-result changes are monitored rather than assumed.",
    "caveat": "Google may generate a different title link. A scanner cannot establish lost clicks or revenue from title length.",
    "effort": "Copy/template change plus QA; depends on the number of distinct pages.",
    "talk": "We would make each priority page's title describe the service and purpose it should be found for, fix incorrect template output and then review the title Google actually shows. That targets relevance and search-result presentation rather than an arbitrary length rule.",
    "source": "https://developers.google.com/search/docs/appearance/title-link",
    "searchEffect": "Supported: more descriptive and differentiated title-link inputs. Not established: a traffic loss from character count alone, or a guarantee that Google will show the supplied title."
  },
  "metadata": {
    "title": "Give priority pages a clearer search-result message",
    "theme": "On-page",
    "why": "Search connection: the description shown below a result and the reason a qualified searcher might click. Google may use a relevant meta description or select text from the page. Generic or missing descriptions give us an opportunity to improve the suggested snippet, not an indexing repair.",
    "steps": [
      "Review the actual descriptions beside the content and intent of the affected pages.",
      "Write differentiated descriptions for priority landing pages and remove placeholder or duplicate template output where it is inappropriate.",
      "Confirm that one intended description is output per page. Monitor search snippets and click performance where client data is available."
    ],
    "success": "Priority pages have accurate, differentiated snippet suggestions and no accidental duplicate description elements.",
    "caveat": "Descriptions are suggestions, not ranking directives. Search engines may use page content instead; longer copy is not automatically wrong.",
    "effort": "Copy/template change plus QA; confirm page count first.",
    "talk": "We would give these search listings a more relevant description of what each page offers and why it matches the query. Then we would compare the snippets and click performance after recrawling; a new description does not by itself guarantee more clicks.",
    "source": "https://developers.google.com/search/docs/appearance/snippet",
    "searchEffect": "Supported: a more accurate, differentiated snippet suggestion. Not established: higher rankings, higher click-through rate, or that Google will use the supplied description."
  },
  "links": {
    "title": "Strengthen discovery and context for priority search pages",
    "theme": "Architecture",
    "why": "Search connection: URL discovery and relevance context. Google follows crawlable internal links to discover pages, and descriptive anchor text helps it understand destinations. The opportunity is to connect related informational content to priority service pages where the topic genuinely fits.",
    "steps": [
      "Identify priority service, product or location pages and inspect which related articles actually discuss those subjects. Validate the sampled links before assuming a gap exists sitewide.",
      "Map topically relevant source pages to each destination. Add ordinary <a href> links with accurate descriptive anchors where useful context already exists; do not force every article to link to every service.",
      "Verify the links and destination status in a fuller crawl. With client access, assess discovery/indexing and relevant query impressions for the destination pages over time."
    ],
    "success": "The intended pages have confirmed crawlable links from relevant content, using descriptive anchor text. Subsequent indexing and search performance are measured separately.",
    "caveat": "Counts refer only to inspected pages. Low inbound counts in a sample do not prove that a page is orphaned or that conversion performance is poor.",
    "effort": "Content mapping, editorial edits and link QA; scope depends on relevance.",
    "talk": "We would strengthen the links from relevant articles to the service pages you want found in search. That gives Google clear routes to those pages and useful context about their subjects. We would confirm the broader link picture first rather than call pages orphaned from a small sample.",
    "source": "https://developers.google.com/search/docs/crawling-indexing/links-crawlable",
    "searchEffect": "Supported: explicit crawlable routes and contextual anchor text to priority URLs. Not established: sitewide orphaning, lost link equity or ranking loss from this limited sample."
  },
  "broken": {
    "title": "Repair the broken routes identified in the link sample",
    "theme": "Technical",
    "why": "Search connection: crawl paths and access to indexable content. When Google itself encounters persistent error responses it cannot process the intended destination normally. This tool's failed request must first be verified, because our scanner may be blocked while Google is allowed.",
    "steps": [
      "Open each source and destination and repeat the request to rule out a temporary block or outage.",
      "Correct the source link, restore the intended page, or implement a relevant redirect when the old page has genuinely moved.",
      "Recheck the destination and all affected source links; do not redirect unrelated URLs to the homepage."
    ],
    "success": "The reviewed links reach the intended usable page without an unnecessary chain or confirmed error response.",
    "caveat": "An error observed from the audit server is not proof that every visitor or search crawler sees the same response.",
    "effort": "Link/content/server change; depends on why the destination fails.",
    "talk": "We would verify whether the destination is genuinely unavailable, rather than just refusing our scanner. Then we would restore the page or correct the link and recheck the crawl path. Only verified errors should drive a search recommendation.",
    "source": "https://developers.google.com/search/docs/crawling-indexing/http-network-errors",
    "searchEffect": "Supported after verification: removing an error or unnecessary hop from a real internal crawl path. Not established: that Google saw the same error or that this caused a ranking loss."
  },
  "indexing": {
    "title": "Align indexing signals with the pages you want discovered",
    "theme": "Technical",
    "why": "Search connection: crawling, indexing eligibility and which URL is selected. Robots rules control crawling; noindex controls indexing when the crawler can read it; canonical signals suggest a preferred version. Unintended settings can conflict with which public pages the client wants shown in search.",
    "steps": [
      "Confirm with the client which of the affected URLs should be publicly discoverable and which should remain excluded.",
      "Inspect the exact directive and its source in the CMS, server headers, robots policy or template. Correct only unintended conflicts.",
      "Recheck response headers, rendered markup, canonical targets and sitemap entries. Use Search Console URL Inspection where client access is available."
    ],
    "success": "The checked pages send consistent signals that match the agreed indexing intent. Actual indexing is verified separately.",
    "caveat": "Canonical hints can be intentional, and correct technical signals do not guarantee indexing or ranking.",
    "effort": "Configuration/template change and verification; intent must be confirmed.",
    "talk": "Before changing anything, we would confirm which pages you want found. Then we would correct any directives that conflict with that intent and verify both the implementation and, where available, the search-engine inspection result.",
    "source": "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
    "searchEffect": "Supported: correcting a verified directive that conflicts with indexing intent. Not established: that every canonical difference is a defect, or that correcting a directive guarantees indexing or rankings."
  },
  "access": {
    "title": "Verify access before making a visibility diagnosis",
    "theme": "Access",
    "why": "This is an audit-access limitation, not established search harm. A denial received by the hosting server does not tell us whether a verified Google or AI crawler can retrieve the page.",
    "steps": [
      "Repeat the affected request and inspect the site or CDN security log with the owner.",
      "Compare the response for real visitors and verified crawler traffic. Change a security rule only when it is unintentionally blocking the intended audience.",
      "Rerun the affected checks after access is resolved; do not bypass a challenge or disable broad security protection."
    ],
    "success": "The owner can explain the restriction and the relevant checks can be completed, or the report clearly records the remaining gap.",
    "caveat": "This scanner cannot prove Googlebot access by changing its user-agent. Verified bot traffic and owner-controlled logs are needed.",
    "effort": "Owner/CDN investigation first; fix scope is unknown.",
    "talk": "Our audit server could not reliably retrieve these pages. We would check the blocking rule with the site owner before drawing a conclusion about search visibility.",
    "source": "https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot",
    "searchEffect": "No provider-specific visibility impact is established without robots-policy evidence, verified crawler logs or appropriate provider inspection."
  },
  "ai": {
    "title": "Align AI crawler policy with your discovery goals",
    "theme": "AI access",
    "why": "Search retrieval, model training and user-initiated fetching are different uses. The relevant crawler policy should reflect the owner's goals rather than a blanket instruction to allow every AI bot.",
    "steps": [
      "Confirm the client's policy for search discovery, user-requested access and model training separately.",
      "Review the exact robots group and any firewall controls for the affected crawler. Change only restrictions that conflict with the agreed policy.",
      "Recheck the applicable URL rules and, when available, inspect verified bot access in server/CDN logs."
    ],
    "success": "Crawler rules clearly express the intended discovery and training policy, and the relevant access is verified separately.",
    "caveat": "Allowing a crawler does not guarantee inclusion or citations. A training-only restriction is not evidence that AI search visibility is blocked. Mixed-use controls may also affect grounding and need a separate policy decision.",
    "effort": "Policy/configuration review plus access testing.",
    "talk": "We would separate AI search access from model-training access, confirm your policy and adjust only the controls that conflict with it. The goal is intentional access, not opening the site to every bot.",
    "source": "https://developers.openai.com/api/docs/bots",
    "searchEffect": "Supported: the documented search crawler's published policy for the checked paths. Not established: actual provider requests, inclusion, citations or a ranking change. Training preferences are separate."
  },
  "rendering": {
    "title": "Check whether important content depends on browser rendering",
    "theme": "Technical",
    "why": "Search connection: whether the main content and links are available for crawling and indexing. Google can render JavaScript, but failed rendering can leave important content unavailable. Raw-versus-rendered counts are a signal to inspect actual sections, not proof of search loss.",
    "steps": [
      "Compare the actual primary text and links in both versions and identify the specific sections that changed.",
      "Where critical content is genuinely absent initially, review server rendering or pre-rendering with the developer while preserving normal page behavior.",
      "Re-test the initial and rendered output, navigation and relevant search inspection tools after implementation."
    ],
    "success": "Important verified content and crawlable links are available through the intended delivery method, without regressions in page behavior.",
    "caveat": "A word-count gap does not measure the percentage of important content missing. Only the entry page is browser-rendered in this release.",
    "effort": "Developer investigation; implementation effort varies by framework.",
    "talk": "We would identify which important content and links require JavaScript, check what Google can actually see, and reduce unnecessary rendering dependence where it creates a verified gap. We would not rewrite a working site based on word counts alone.",
    "source": "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics",
    "searchEffect": "Supported: observed dependence on rendering for the inspected content. Not established: that Google failed to render it, or that every AI retrieval system behaves the same way."
  },
  "schema": {
    "title": "Make page-specific information clearer in structured data",
    "theme": "Structured data",
    "why": "Search connection: machine-readable context and, for documented supported types, eligibility for richer search appearances. Accurate markup helps Google interpret page information. A missing generic Service type is not proof of lost rich results or AI citations.",
    "steps": [
      "Identify what each example page actually represents and inspect all existing markup, including rendered output.",
      "Where useful, add or correct appropriate page-specific properties and link them consistently to the real organization, author or product. Preserve accurate existing markup.",
      "Validate syntax and meaning; use the relevant rich-result test only for supported search features and confirm that markup matches visible content."
    ],
    "success": "The implemented markup accurately describes the page and its real entities without conflicts, invented facts or unsupported eligibility claims.",
    "caveat": "Generic schema alone is not a defect. Special schema is not required for Google AI features, and markup does not guarantee ranking, citations or rich results.",
    "effort": "Template/data modeling and QA; depends on the existing implementation.",
    "talk": "We would identify which structured data is accurate and useful for these page types, validate it, and check whether any supported search appearance applies. We would not promise rich results or add markup just because the scanner did not find a particular type.",
    "source": "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
    "searchEffect": "Supported: clearer explicit page/entity data; rich-result eligibility only where a supported feature and all requirements apply. Not established: a ranking boost, a rich-result entitlement, or mandatory Service markup."
  },
  "sources": {
    "title": "Review evidence behind search-targeted factual content",
    "theme": "Content trust",
    "why": "Search connection: an indirect content-quality review, not a technical ranking rule. Google's helpful-content guidance asks whether information has clear sourcing and demonstrates expertise. A source-link count cannot determine the accuracy or quality of an article.",
    "steps": [
      "Review the factual or research-heavy example articles and locate claims that actually depend on external evidence.",
      "Check any existing references, then cite the strongest relevant original or authoritative source where it helps the reader. Correct unsupported claims rather than merely adding links.",
      "Review source relevance and accuracy with the responsible subject-matter expert; rerun the check without treating a classifier pass as proof."
    ],
    "success": "Important evidence-dependent claims have relevant, checkable support and the editorial review confirms that the cited material supports the wording.",
    "caveat": "No detected source-like links does not mean no evidence exists. This tool does not assess medical accuracy or prove a ranking impact.",
    "effort": "Editorial and subject-matter review; varies with the claims.",
    "talk": "For factual articles targeting search, we would verify the claims and make their supporting evidence clear where needed. The aim is reliable content, not adding external links as a supposed ranking trick.",
    "source": "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    "searchEffect": "Supported: a lead for reviewing evidence in factual content. Not established: a citation-count ranking factor, that the articles have no references, or that adding outbound links earns AI citations."
  },
  "authors": {
    "title": "Connect expert content to a clear, maintained author identity",
    "theme": "Content trust",
    "why": "Search connection: explicit authorship and entity identification. Google recommends identifying article authors clearly and providing a URL that identifies the author. This helps disambiguate the person behind an article; it is not a shortcut to expertise or rankings.",
    "steps": [
      "Inspect visible bylines, profile links and structured-data author references on the example articles.",
      "Connect real authors or reviewers to useful maintained profiles with accurate roles and experience; do not invent credentials or authors.",
      "Verify that links work and the visible authorship and structured-data identity agree."
    ],
    "success": "Readers can identify the responsible people and access relevant, accurate profile information where appropriate.",
    "caveat": "The classifier can miss valid profile relationships. An author profile is not a guarantee of rankings, trust or AI citations.",
    "effort": "Editorial/profile/template work; depends on existing identities.",
    "talk": "We would connect the credited author to a real maintained profile and appropriate article markup so the identity is explicit. Then we would validate those connections. We would not claim that a profile link alone increases rankings.",
    "source": "https://developers.google.com/search/docs/appearance/structured-data/article",
    "searchEffect": "Supported: clearer Article author identity where the markup and visible credit are accurate. Not established: an author-profile-link ranking requirement or automatic trust from a biography page."
  },
  "images": {
    "title": "Give search engines useful context for meaningful images",
    "theme": "On-page",
    "why": "Search connection: image interpretation and Google Images visibility. Google uses alt text along with page content and other signals to understand images. Missing useful descriptions can leave less textual context for an important product or explanatory image.",
    "steps": [
      "Review the actual images and their purpose in context rather than filling every empty field automatically.",
      "Write concise, useful alternatives for informative or functional images and retain empty alternatives where images are decorative.",
      "Recheck the markup and review important image/link experiences with accessibility in mind."
    ],
    "success": "Meaningful images have appropriate alternatives and decorative images do not add unnecessary reading noise.",
    "caveat": "Missing attributes are observable, but appropriate alternative text requires a human assessment of image purpose. Repeated alt text is not always wrong.",
    "effort": "Content/accessibility review and template QA.",
    "talk": "We would identify the images that carry product or topic information and give them accurate descriptions and surrounding context. Decorative images can remain empty; this is about helping search understand useful images, not filling every field.",
    "source": "https://developers.google.com/search/docs/appearance/google-images",
    "searchEffect": "Supported: more accurate image context and, for linked images, descriptive anchor information. Not established: that every empty alt is wrong or that every image needs keywords."
  },
  "international": {
    "title": "Make language and regional relationships explicit",
    "theme": "On-page",
    "why": "Search connection: selecting the appropriate language or regional version in search. Correct hreflang annotations help Google understand equivalent localized pages. They do not replace translated content, canonical decisions or indexing eligibility.",
    "steps": [
      "Confirm the actual language and regional versions and their preferred URLs.",
      "Correct the flagged local annotations, then inspect reciprocal links, return status and canonical alignment across the full variant set.",
      "Validate the complete set rather than checking one page in isolation."
    ],
    "success": "The intended language/region variants are represented consistently with valid annotations and working reciprocal destinations.",
    "caveat": "This scan checks local syntax and duplicate values only. Missing hreflang is not a problem for a site without relevant variants.",
    "effort": "International mapping and developer QA; scope varies.",
    "talk": "We would confirm the intended language versions, correct the flagged annotations and test the full set of relationships. A syntax fix is only one part of that validation.",
    "source": "https://developers.google.com/search/docs/specialty/international/localized-versions",
    "searchEffect": "Supported after full validation: consistent localized URL relationships. Not established by syntax checks alone: reciprocal validity, actual regional performance or a ranking gain."
  },
  "social": {
    "title": "Make shared-page previews consistent and useful",
    "theme": "On-page",
    "why": "This is primarily a sharing-preview observation, not a primary search-visibility issue. Some properties, such as og:title, can contribute to Google's title-link sources, but missing social tags alone do not establish an indexing or ranking problem.",
    "steps": [
      "Inspect the current title, description and image selected for shared priority pages.",
      "Add or correct appropriate preview metadata where the sharing experience matters.",
      "Test actual previews in the relevant sharing channels after caches refresh."
    ],
    "success": "Shared priority pages present accurate titles, descriptions and images in tested channels.",
    "caveat": "Open Graph completeness is not a direct ranking requirement.",
    "effort": "Template/content update and preview testing.",
    "talk": "We would make sure shared links show the right message and image. This is about a better sharing experience, not an SEO penalty.",
    "source": "https://developers.google.com/search/docs/appearance/title-link",
    "searchEffect": "Keep routine Open Graph observations in QA. Elevate only a separately verified search-title problem."
  },
  "content": {
    "title": "Make useful information easier to find within the page",
    "theme": "Content",
    "why": "Search connection: relevance to the queries the page should answer. Clear, specific textual content gives search systems information to match to those queries. Word count, paragraph length or heading count alone cannot establish relevance or search quality.",
    "steps": [
      "Review the affected pages against their purpose and audience questions.",
      "Organize genuinely different topics into helpful sections and strengthen missing information only where it is needed.",
      "Review the result with a human editor and recheck structure; do not expand content to hit an arbitrary word count."
    ],
    "success": "The page answers its intended questions in a usable structure without padding or forced formatting.",
    "caveat": "The scanner does not measure search intent satisfaction, content accuracy or AI citation readiness.",
    "effort": "Editorial review and content changes; depends on gaps.",
    "talk": "We would compare the page's content with the specific search questions it needs to answer and improve missing or unclear explanations. We would not add words or sections simply to meet a length target.",
    "source": "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    "searchEffect": "Supported: an editorial investigation into topic coverage and relevance. Not established: that short pages cannot rank, that a formatting change guarantees retrieval, or that longer copy improves visibility."
  },
  "template": {
    "title": "Resolve recurring page-output issues at their source",
    "theme": "On-page",
    "why": "Search connection depends on the repeated output problem: titles affect title-link inputs, metadata affects suggested snippets, and indexing directives affect eligibility. A repeated implementation observation is not itself a separate ranking factor.",
    "steps": [
      "Inspect examples of each recurring observation and confirm they are real and relevant to the page.",
      "Trace the output to the appropriate CMS field, shared component or page-level setting and correct the cause.",
      "Recheck every affected page type and verify that the change did not introduce new output problems."
    ],
    "success": "The verified recurring observations are resolved in the intended page output and a follow-up sample confirms consistency.",
    "caveat": "Observation counts are not equivalent to business impact or proven search harm.",
    "effort": "CMS/template investigation first; implementation scope is provisional.",
    "talk": "We would identify the shared source of the repeated issue and fix the specific output that matters for search. Then we would verify the affected pages and assess the relevant search outcome separately.",
    "source": "https://developers.google.com/search/docs/fundamentals/get-started-developers",
    "searchEffect": "First identify the actual affected search mechanism and confirm intent. Repetition makes implementation worth investigating; it does not prove commercial impact."
  }
};
export const AI_RELEVANCE={
  headings:{level:'Supporting',why:'Google says its generative AI search features build on core Search systems and that standard SEO remains relevant. Clear page organization and descriptive headings can make the main topic and supporting sections easier to interpret, but there is no documented H1-specific AI citation factor.',effect:'Supported: stronger topic clarity in content that may be retrieved for AI-assisted search, especially in Google AI experiences that use the Search index. Not established: that adding an H1 earns an AI citation or improves visibility in ChatGPT, Claude or Perplexity.',source:'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide',talk:'For AI-assisted discovery, this supports clearer topic and section interpretation, but we would not sell an H1 by itself as an AI citation tactic.'},
  titles:{level:'Supporting',why:'Google AI features draw from the Search index, so clear page identification and strong title signals remain part of the same foundation. Other AI search systems may also use page titles during retrieval, but provider-specific weighting is not documented.',effect:'Supported: clearer page identity within the same search foundation used by Google generative AI features. Not established: a direct title-to-citation effect in any AI answer engine.',source:'https://developers.google.com/search/docs/appearance/ai-features',talk:'For AI search, this is supporting page-identification context rather than a direct citation lever.'},
  metadata:{level:'Limited',why:'Meta descriptions primarily influence traditional search snippet messaging. Google does not require special descriptions or AI-specific markup for AI Overviews or AI Mode, so this is usually a secondary AI consideration rather than a core AI visibility lever.',effect:'Supported: better conventional search snippet input. Not established: a direct AI retrieval, ranking or citation benefit from adding or rewriting a meta description.',source:'https://developers.google.com/search/docs/appearance/ai-features',talk:'The AI angle here is limited; meta descriptions are mainly about conventional search-result messaging, not an AI visibility lever.'},
  links:{level:'Supporting',why:'Google specifically recommends making important content easy to find through internal links for visibility in AI features as well as Search. Clear crawlable pathways can help discovery of the pages that AI-assisted search may later retrieve.',effect:'Supported: stronger discovery pathways within the site and alignment with Google AI-feature guidance. Not established: that a particular internal link causes an AI citation or that other AI providers use the same internal-link signals.',source:'https://developers.google.com/search/docs/appearance/ai-features',talk:'The AI angle is discoverability: Google specifically recommends internal links as part of the foundation for its AI features, while other providers may use different retrieval systems.'},
  broken:{level:'Direct when verified',why:'AI search systems still need retrievable source pages. If a provider genuinely receives a persistent error for a page, that page cannot be used normally in live retrieval. Our scanner error is not proof that the provider sees the same response.',effect:'Supported after provider-side verification: restoring access to a source page that was genuinely unavailable. Not established from our server response alone: that Google AI, ChatGPT, Claude or Perplexity were blocked.',source:'https://developers.google.com/search/docs/appearance/ai-features',talk:'If an AI search provider genuinely receives the same error, that source may be unavailable for retrieval; we would verify provider access separately before making that claim.'},
  indexing:{level:'Direct for Google AI Search',why:'Google states that a page must be indexed and eligible to appear in Search with a snippet before it can be shown as a supporting link in AI Overviews or AI Mode. This makes unintended indexing exclusions directly relevant to Google AI visibility.',effect:'Supported: correcting an unintended indexing conflict can restore eligibility for Google Search and its generative AI features. Not established: actual inclusion in an AI response, or equivalent behavior across other AI providers.',source:'https://developers.google.com/search/docs/appearance/ai-features',talk:'For Google AI Overviews and AI Mode, index and snippet eligibility are prerequisites, so an unintended indexing block can directly limit eligibility there.'},
  access:{level:'Diagnostic',why:'A denial to the Cadence scanner does not tell us whether an AI search crawler is blocked. AI visibility should only be discussed when the relevant provider policy or verified crawler access is actually known.',effect:'Supported: an audit coverage limitation. Not established: any search or AI visibility loss.',source:'https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot',talk:'We would not make an AI visibility claim from our scanner being blocked; we need the provider policy or verified crawler evidence first.'},
  ai:{level:'Direct policy signal',why:'Search crawlers used by AI products are a direct access layer. A documented robots restriction that applies to the provider search crawler can conflict with a goal of being discoverable in that AI search experience. Training crawlers are separate and should not be treated as search visibility controls.',effect:'Supported: the published crawler policy for the checked paths. Not established: actual crawling, retrieval, inclusion, citations or ranking in an AI response.',source:'https://developers.openai.com/api/docs/bots',talk:'This is one of the more direct AI checks: if the documented AI search crawler is intentionally blocked on pages the prospect wants discovered, we would flag the policy conflict while keeping training controls separate.'},
  rendering:{level:'Supporting',why:'Google generative AI features rely on the same technical foundation as Search, including crawlable and processable page content. JavaScript-dependent content can still be usable, but rendering complexity is worth reviewing when important text or links are absent from initial HTML.',effect:'Supported: a technical dependency that can affect how content is processed. Not established: failure by Google or by other AI search providers unless their actual retrieval is verified.',source:'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide',talk:'AI search systems need usable page content, but rendering behavior differs by provider, so we would verify the actual retrieval path before calling it an AI visibility problem.'},
  schema:{level:'Supporting',why:'Accurate structured data can make explicit page and entity information easier for machines to interpret, but Google explicitly says no special schema is required for its generative AI features. Schema should describe real visible content, not be added as an AI optimization shortcut.',effect:'Supported: clearer machine-readable page and entity context. Not established: a direct AI ranking or citation boost, or any special schema requirement for AI Overviews or AI Mode.',source:'https://developers.google.com/search/docs/appearance/ai-features',talk:'Structured data can make entities and page meaning more explicit, but Google says there is no special AI schema requirement, so this is supporting context rather than an AI shortcut.'},
  sources:{level:'Supporting',why:'AI answers commonly surface supporting links, so factual content benefits from being verifiable and well supported. Google also emphasizes unique, reliable, non-commodity content for generative AI search. That does not create a simple citation-count ranking factor.',effect:'Supported: stronger editorial verifiability and differentiated source quality. Not established: that adding outbound citations earns AI citations or improves ranking in an answer engine.',source:'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide',talk:'The AI relevance is verifiability and differentiated source quality, not adding citations simply to chase an answer-engine citation.'},
  authors:{level:'Supporting',why:'Clear authorship and entity relationships can make expertise and responsibility easier to interpret, which is useful context for trust-sensitive content. No major provider documents an author-profile link as a direct AI citation or ranking requirement.',effect:'Supported: clearer identity and entity context around expert content. Not established: automatic authority, AI citation preference or ranking gain from an author profile alone.',source:'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',talk:'Clear authorship can strengthen identity and expertise context for AI-assisted discovery, but it is not a documented direct citation signal.'},
  images:{level:'Supporting',why:'Google says relevant high-quality images and video can create additional opportunities to appear in generative AI search experiences. Accurate image context therefore has AI-search relevance when the visual content is meaningful to the topic.',effect:'Supported: better image context and alignment with Google generative AI guidance for useful visual content. Not established: that alt text alone causes an image or page to appear in an AI response.',source:'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide',talk:'Google says useful images and video can create additional opportunities in generative AI search, so meaningful visual content has a real AI-discovery angle beyond classic image search.'},
  international:{level:'Supporting',why:'AI-assisted search still needs the right localized page to be discoverable and understandable. Correct language and regional relationships can help Search select the intended version, which can also matter when Google AI features draw from that index.',effect:'Supported after full validation: clearer localized page relationships. Not established: a direct AI visibility gain or equivalent behavior across every AI search provider.',source:'https://developers.google.com/search/docs/appearance/ai-features',talk:'The AI relevance is making sure the correct localized page can enter the Search foundation that Google AI features use; it is not a separate AI ranking tactic.'},
  social:{level:'Limited',why:'Open Graph metadata is mainly a sharing-preview control. It is not a documented requirement for Google generative AI visibility and should not be sold as an AI optimization.',effect:'Supported: better social preview consistency. Not established: AI search visibility or citation impact.',source:'https://developers.google.com/search/docs/appearance/ai-features',talk:'There is very little defensible AI-search angle here; Open Graph is mainly a sharing-preview control.'},
  content:{level:'Strong supporting relevance',why:'Google now explicitly recommends unique, useful, non-commodity content for generative AI search and notes that AI features may use query fan-out to retrieve supporting pages across related subtopics. This makes depth, originality and clear topical coverage relevant to both classic and AI-assisted discovery.',effect:'Supported: alignment with documented Google generative AI guidance around unique, useful content and broader query coverage. Not established: guaranteed inclusion, a specific AI citation, or provider-wide behavior outside Google.',source:'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide',talk:'This has strong AI-search relevance when the content is genuinely unique and useful: Google specifically emphasizes non-commodity content and broader subtopic retrieval in generative AI search.'},
  template:{level:'Depends on the underlying issue',why:'AI relevance follows the actual repeated problem. Indexing and crawler-access issues can be directly important; titles, headings, content and schema are generally supporting signals. A recurring template pattern is not itself an AI ranking factor.',effect:'Supported only after the repeated issue is identified and tied to a documented search or AI mechanism. Not established: AI visibility impact from repetition alone.',source:'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide',talk:'The AI angle depends on the actual repeated issue. Access and indexing can be direct; content, headings and schema are usually supporting context rather than standalone AI ranking factors.'}
};

export function playbookKey(f){const s=[f.id,f.category,f.title].join(' ').toLowerCase();
 if(/automated-access|http-status|access-block/.test(s))return 'access';
 if(/ai-access|oai-search|ai-crawler/.test(s))return 'ai';
 if(/broken.*link|link.*broken/.test(s))return 'broken';
 if(/canonical|noindex|robots-google|indexability|sitemap|redirect-chain/.test(s))return 'indexing';
 if(/rendering|js-content|js-link/.test(s))return 'rendering';
 if(/hreflang|international/.test(s))return 'international';
 if(/source-quality|citation|source-like/.test(s))return 'sources';
 if(/author|person|entity-clarity/.test(s))return 'authors';
 if(/heading|missing-h1|h1s|h1-pattern/.test(s))return 'headings';
 if(/meta-description|missing-meta|duplicate-meta/.test(s))return 'metadata';
 if(/social-metadata|open.graph/.test(s))return 'social';
 if(/title/.test(s))return 'titles';
 if(/image|alt.text/.test(s))return 'images';
 if(/schema|jsonld|structured-data|breadcrumb/.test(s))return 'schema';
 if(/link|content-pathways|discovery/.test(s))return 'links';
 if(/onpage-systemic|on-page/.test(s))return 'template';
 return 'content';}
