export const demoReport={
  "schemaVersion": 2,
  "release": "2.0.0-rc.6",
  "requestedUrl": "https://example.com/",
  "finalUrl": "https://example.com/",
  "scannedAt": "2026-09-11T12:00:00Z",
  "status": "completed",
  "complete": true,
  "pageType": "home",
  "coverage": {
    "sampleUsable": 14,
    "sampleAttempted": 14,
    "samplePlanned": 14,
    "sampleSkipped": 0,
    "entryAnalysisSource": "initial-html",
    "relationshipPages": 24,
    "relationshipPlanned": 24,
    "sitemapUrls": 36,
    "renderRequested": true,
    "renderSucceeded": true,
    "renderedPageCount": 1,
    "browserAssistPages": 3
  },
  "warnings": [],
  "recommendations": [
    {
      "id": "sample:h1",
      "playbook": "headings",
      "title": "Strengthen the main search topic on affected pages",
      "theme": "On-page search relevance",
      "observation": "The main heading element (H1) was not detected in the inspected HTML for 14 of 14 example pages.",
      "why": "Search visibility connection: Google uses prominent page titles and heading elements, including H1s, as inputs when it understands a page and generates the title link shown in search results. If an affected page does not clearly identify its primary service or topic in a main heading, the search opportunity is to make that relevance signal more explicit and consistent. The goal is not to add an H1 for a score; it is to make the page's intended search topic unmistakable.",
      "searchEffect": "Supported: a clearer, more consistent page-topic signal and an additional documented input Google can use when generating title links. Not established: that the missing H1 caused a ranking loss, that adding one will improve rankings, or that it directly changes AI citations.",
      "solution": [
        "Map each affected page to the service, product, location or topic it is intended to rank for. Compare the title tag, visible page title and H1 in both initial and rendered HTML so we know whether the observed gap is real.",
        "Where the main topic is unclear or the template fails to output it as the primary heading, update the copy and/or CMS template so the page has one descriptive, search-relevant main heading aligned with the title tag and body content. Do not keyword-stuff or redesign the page simply to add a tag.",
        "Re-crawl the affected pages and review the title link Google actually shows after recrawling. With client data, compare relevant query impressions, clicks and indexed-page behavior over time; treat those outcomes separately from the technical fix."
      ],
      "success": "The affected pages clearly state the service or topic they are intended to be found for, expose that topic in an appropriate main heading, and provide Google with a stronger, consistent source for page-topic and title-link interpretation. Any visibility change is measured after recrawling rather than assumed.",
      "verify": "Map each affected page to the service, product, location or topic it is intended to rank for. Compare the title tag, visible page title and H1 in both initial and rendered HTML so we know whether the observed gap is real.",
      "caveat": "A missing H1 by itself is not a ranking penalty and does not prove lost traffic. Google can use other prominent text and signals. The search case becomes stronger when the page's main topic is also vague, inconsistent, or poorly aligned with the query intent.",
      "effort": "Search-intent/content review plus template QA; confirm after inspecting the CMS implementation.",
      "priority": "Planned review",
      "confidence": "Observed in sample output; interpretation needs review",
      "talk": "The main heading element (H1) was not detected in the inspected HTML for 14 of 14 example pages. Fourteen of the sampled pages did not expose an H1 in the inspected HTML. We would first confirm what each page is supposed to rank for, then make sure that topic is clearly expressed in the page title, main heading and supporting copy. The search goal is stronger topic clarity and a cleaner title-link input for Google, not simply adding a tag to satisfy an audit.",
      "source": "https://developers.google.com/search/docs/appearance/title-link",
      "evidence": [
        {
          "label": "Example count",
          "value": "14 / 14 pages - synthetic data",
          "url": null
        },
        {
          "label": "Review the page title",
          "value": "H1 not detected in this example fixture",
          "url": "https://example.com/services/"
        }
      ],
      "scope": "Inspected sample",
      "originalFinding": {
        "title": "Synthetic headings example",
        "confidence": "manual-review"
      }
    },
    {
      "id": "sample:links",
      "playbook": "links",
      "title": "Strengthen discovery and context for priority search pages",
      "theme": "Architecture",
      "observation": "In this synthetic link sample, 3 of 9 articles link to a service or location page.",
      "why": "Search connection: URL discovery and relevance context. Google follows crawlable internal links to discover pages, and descriptive anchor text helps it understand destinations. The opportunity is to connect related informational content to priority service pages where the topic genuinely fits.",
      "searchEffect": "Supported: explicit crawlable routes and contextual anchor text to priority URLs. Not established: sitewide orphaning, lost link equity or ranking loss from this limited sample.",
      "solution": [
        "Identify priority service, product or location pages and inspect which related articles actually discuss those subjects. Validate the sampled links before assuming a gap exists sitewide.",
        "Map topically relevant source pages to each destination. Add ordinary <a href> links with accurate descriptive anchors where useful context already exists; do not force every article to link to every service.",
        "Verify the links and destination status in a fuller crawl. With client access, assess discovery/indexing and relevant query impressions for the destination pages over time."
      ],
      "success": "The intended pages have confirmed crawlable links from relevant content, using descriptive anchor text. Subsequent indexing and search performance are measured separately.",
      "verify": "Identify priority service, product or location pages and inspect which related articles actually discuss those subjects. Validate the sampled links before assuming a gap exists sitewide.",
      "caveat": "Counts refer only to inspected pages. Low inbound counts in a sample do not prove that a page is orphaned or that conversion performance is poor.",
      "effort": "Content mapping, editorial edits and link QA; scope depends on relevance.",
      "priority": "Planned review",
      "confidence": "Observed in sample output; interpretation needs review",
      "talk": "In this synthetic link sample, 3 of 9 articles link to a service or location page. We would strengthen the links from relevant articles to the service pages you want found in search. That gives Google clear routes to those pages and useful context about their subjects. We would confirm the broader link picture first rather than call pages orphaned from a small sample.",
      "source": "https://developers.google.com/search/docs/crawling-indexing/links-crawlable",
      "evidence": [
        {
          "label": "Articles linking to services",
          "value": "3 of 9 - synthetic data",
          "url": "https://example.com/resources/guide/"
        }
      ],
      "scope": "Inspected sample",
      "originalFinding": {
        "title": "Synthetic links example",
        "confidence": "manual-review"
      }
    },
    {
      "id": "sample:sources",
      "playbook": "sources",
      "title": "Review evidence behind search-targeted factual content",
      "theme": "Content trust",
      "observation": "In this synthetic sample, the classifier did not recognize supporting-source links in 5 articles. Unlinked references were not assessed.",
      "why": "Search connection: an indirect content-quality review, not a technical ranking rule. Google's helpful-content guidance asks whether information has clear sourcing and demonstrates expertise. A source-link count cannot determine the accuracy or quality of an article.",
      "searchEffect": "Supported: a lead for reviewing evidence in factual content. Not established: a citation-count ranking factor, that the articles have no references, or that adding outbound links earns AI citations.",
      "solution": [
        "Review the factual or research-heavy example articles and locate claims that actually depend on external evidence.",
        "Check any existing references, then cite the strongest relevant original or authoritative source where it helps the reader. Correct unsupported claims rather than merely adding links.",
        "Review source relevance and accuracy with the responsible subject-matter expert; rerun the check without treating a classifier pass as proof."
      ],
      "success": "Important evidence-dependent claims have relevant, checkable support and the editorial review confirms that the cited material supports the wording.",
      "verify": "Review the factual or research-heavy example articles and locate claims that actually depend on external evidence.",
      "caveat": "No detected source-like links does not mean no evidence exists. This tool does not assess medical accuracy or prove a ranking impact.",
      "effort": "Editorial and subject-matter review; varies with the claims.",
      "priority": "Planned review",
      "confidence": "Observed in sample output; interpretation needs review",
      "talk": "In this synthetic sample, the classifier did not recognize supporting-source links in 5 articles. Unlinked references were not assessed. For factual articles targeting search, we would verify the claims and make their supporting evidence clear where needed. The aim is reliable content, not adding external links as a supposed ranking trick.",
      "source": "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
      "evidence": [
        {
          "label": "Source classifier",
          "value": "0 of 5 - synthetic data",
          "url": "https://example.com/resources/research/"
        }
      ],
      "scope": "Inspected sample",
      "originalFinding": {
        "title": "Synthetic sources example",
        "confidence": "manual-review"
      }
    },
    {
      "id": "sample:search-access",
      "playbook": "ai",
      "title": "Align AI crawler policy with your discovery goals",
      "theme": "AI access",
      "observation": "The inspected robots policies disallow at least one checked URL path for 2 search or robots-governed retrieval agents: OAI-SearchBot, Claude-SearchBot. Intent and actual provider access still need verification.",
      "why": "Search retrieval, model training and user-initiated fetching are different uses. The relevant crawler policy should reflect the owner's goals rather than a blanket instruction to allow every AI bot.",
      "searchEffect": "Supported: the documented search crawler's published policy for the checked paths. Not established: actual provider requests, inclusion, citations or a ranking change. Training preferences are separate.",
      "solution": [
        "Confirm the client's policy for search discovery, user-requested access and model training separately.",
        "Review the exact robots group and any firewall controls for the affected crawler. Change only restrictions that conflict with the agreed policy.",
        "Recheck the applicable URL rules and, when available, inspect verified bot access in server/CDN logs."
      ],
      "success": "Crawler rules clearly express the intended discovery and training policy, and the relevant access is verified separately.",
      "verify": "Confirm the client's policy for search discovery, user-requested access and model training separately.",
      "caveat": "Allowing a crawler does not guarantee inclusion or citations. A training-only restriction is not evidence that AI search visibility is blocked. Mixed-use controls may also affect grounding and need a separate policy decision.",
      "effort": "Policy/configuration review plus access testing.",
      "priority": "Planned review",
      "confidence": "Observed in sample output; interpretation needs review",
      "talk": "The inspected robots policies disallow at least one checked URL path for 2 search or robots-governed retrieval agents: OAI-SearchBot, Claude-SearchBot. Intent and actual provider access still need verification. We would separate AI search access from model-training access, confirm your policy and adjust only the controls that conflict with it. The goal is intentional access, not opening the site to every bot.",
      "source": "https://developers.openai.com/api/docs/bots",
      "evidence": [
        {
          "label": "ChatGPT Search",
          "value": "OAI-SearchBot: 6 of 14 checked URL paths disallowed by the inspected policy. Actual provider access is not verified."
        },
        {
          "label": "OAI-SearchBot / matching rule",
          "url": "https://example.com/services/example-1/",
          "value": "Disallow: /services/; line 6; groups: oai-searchbot, claude-searchbot. Robots: https://example.com/robots.txt. Retrieved: 2026-09-11T12:00:00Z."
        },
        {
          "label": "OAI-SearchBot / matching rule",
          "url": "https://example.com/services/example-2/",
          "value": "Disallow: /services/; line 6; groups: oai-searchbot, claude-searchbot. Robots: https://example.com/robots.txt. Retrieved: 2026-09-11T12:00:00Z."
        },
        {
          "label": "Claude Search",
          "value": "Claude-SearchBot: 6 of 14 checked URL paths disallowed by the inspected policy. Actual provider access is not verified."
        },
        {
          "label": "Claude-SearchBot / matching rule",
          "url": "https://example.com/services/example-1/",
          "value": "Disallow: /services/; line 6; groups: oai-searchbot, claude-searchbot. Robots: https://example.com/robots.txt. Retrieved: 2026-09-11T12:00:00Z."
        },
        {
          "label": "Claude-SearchBot / matching rule",
          "url": "https://example.com/services/example-2/",
          "value": "Disallow: /services/; line 6; groups: oai-searchbot, claude-searchbot. Robots: https://example.com/robots.txt. Retrieved: 2026-09-11T12:00:00Z."
        }
      ],
      "scope": "Inspected sample",
      "originalFinding": {
        "title": "Synthetic ai example",
        "confidence": "manual-review"
      }
    }
  ],
  "qa": {
    "pagesChecked": 14,
    "issueObservations": 14,
    "reviewObservations": 2,
    "checks": [
      {
        "id": "headings",
        "label": "Heading structure",
        "status": "issue",
        "summary": "14 example H1 observations",
        "note": "Not a ranking penalty. Verify the actual heading structure.",
        "issueCount": 14,
        "reviewCount": 0,
        "items": [
          {
            "issue": "Missing H1",
            "level": "issue",
            "value": "No H1 in the inspected example HTML",
            "url": "https://example.com/services/"
          }
        ]
      },
      {
        "id": "titles",
        "label": "Page titles",
        "status": "good",
        "summary": "No flag in this synthetic sample",
        "note": "No assessment of actual rankings.",
        "items": [],
        "issueCount": 0,
        "reviewCount": 0
      },
      {
        "id": "meta",
        "label": "Meta descriptions",
        "status": "review",
        "summary": "2 descriptions to review",
        "note": "Length is a review cue, not an absolute limit.",
        "items": [
          {
            "issue": "Repeated description",
            "level": "review",
            "value": "Synthetic example of repeated page messaging",
            "url": "https://example.com/services/"
          }
        ],
        "issueCount": 0,
        "reviewCount": 2
      }
    ],
    "pages": [
      {
        "url": "https://example.com/services/",
        "modules": [
          {
            "label": "Page title",
            "status": "good"
          },
          {
            "label": "Main heading",
            "status": "issue"
          },
          {
            "label": "Meta description",
            "status": "review"
          }
        ]
      }
    ]
  },
  "diagnostics": {
    "crawlerPolicy": {
      "CadenceAuditAssistant": true,
      "Googlebot": true,
      "bingbot": true,
      "OAI-SearchBot": true,
      "Claude-SearchBot": true,
      "PerplexityBot": true,
      "Applebot": true,
      "Amzn-SearchBot": true,
      "DuckAssistBot": true,
      "MistralAI-Index": true,
      "ChatGPT-User": false,
      "Claude-User": true,
      "Perplexity-User": true,
      "Amzn-User": true,
      "MistralAI-User": true,
      "meta-externalfetcher": true,
      "GPTBot": false,
      "ClaudeBot": false,
      "MistralAI-Training": true,
      "Applebot-Extended": false,
      "Google-Extended": false,
      "Amazonbot": true,
      "meta-externalagent": true,
      "CCBot": true,
      "Bytespider": true
    },
    "findings": []
  },
  "limitations": [
    "This entire report is synthetic example data, not a website audit.",
    "Only the entry URL is browser-rendered in real scans.",
    "A limited sample cannot prove sitewide orphaning or lost revenue."
  ],
  "searchAccess": {
    "registryVersion": "2026-09-11.1",
    "registryReviewedAt": "2026-09-11",
    "checkedAt": "2026-09-11T12:00:00Z",
    "scope": "Entered/final URL and deep-sampled URL paths; not a whole-site crawl. No provider user agents are impersonated.",
    "pageCount": 14,
    "urls": [
      "https://example.com/",
      "https://example.com/services/example-1/",
      "https://example.com/services/example-2/",
      "https://example.com/services/example-3/",
      "https://example.com/services/example-4/",
      "https://example.com/services/example-5/",
      "https://example.com/services/example-6/",
      "https://example.com/resources/example-7/",
      "https://example.com/resources/example-8/",
      "https://example.com/resources/example-9/",
      "https://example.com/resources/example-10/",
      "https://example.com/resources/example-11/",
      "https://example.com/resources/example-12/",
      "https://example.com/resources/example-13/"
    ],
    "crawlers": [
      {
        "id": "Googlebot",
        "provider": "Google",
        "label": "Google Search",
        "role": "search",
        "source": "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers",
        "purpose": "Crawling for Google Search, including its AI search features.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Robots permission is not indexing, snippet eligibility or AI appearance. Other page and product controls may apply.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Googlebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "Googlebot",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "bingbot",
        "provider": "Microsoft",
        "label": "Bing Search",
        "role": "search",
        "source": "https://blogs.bing.com/webmaster/september-2020/Bing-Webmaster-Tools-makes-it-easy-to-edit-and-verify-your-robots-txt",
        "purpose": "Crawling for Bing search indexing.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Do not infer Copilot inclusion from a robots permission result.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "bingbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "bingbot",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "OAI-SearchBot",
        "provider": "OpenAI",
        "label": "ChatGPT Search",
        "role": "search",
        "source": "https://developers.openai.com/api/docs/bots",
        "purpose": "Search discovery for ChatGPT.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Independent of GPTBot training preferences.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "OAI-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          }
        ],
        "summary": {
          "allowed": 8,
          "disallowed": 6,
          "unknown": 0,
          "total": 14,
          "state": "mixed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": null,
          "matchedAgents": [
            "oai-searchbot",
            "claude-searchbot"
          ],
          "groupLines": [
            4,
            5
          ],
          "evaluatedToken": "OAI-SearchBot",
          "basis": "no-matching-disallow",
          "explicit": true,
          "fallbackNote": "",
          "reason": "No disallow rule matched this path in the selected group."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "Claude-SearchBot",
        "provider": "Anthropic",
        "label": "Claude Search",
        "role": "search",
        "source": "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
        "purpose": "Crawling for Claude search results.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/services/",
              "line": 6,
              "raw": "Disallow: /services/",
              "specificity": 10,
              "group": [
                "oai-searchbot",
                "claude-searchbot"
              ],
              "agentLines": [
                4,
                5
              ]
            },
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 6."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": null,
            "matchedAgents": [
              "oai-searchbot",
              "claude-searchbot"
            ],
            "groupLines": [
              4,
              5
            ],
            "evaluatedToken": "Claude-SearchBot",
            "basis": "no-matching-disallow",
            "explicit": true,
            "fallbackNote": "",
            "reason": "No disallow rule matched this path in the selected group."
          }
        ],
        "summary": {
          "allowed": 8,
          "disallowed": 6,
          "unknown": 0,
          "total": 14,
          "state": "mixed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": null,
          "matchedAgents": [
            "oai-searchbot",
            "claude-searchbot"
          ],
          "groupLines": [
            4,
            5
          ],
          "evaluatedToken": "Claude-SearchBot",
          "basis": "no-matching-disallow",
          "explicit": true,
          "fallbackNote": "",
          "reason": "No disallow rule matched this path in the selected group."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "PerplexityBot",
        "provider": "Perplexity",
        "label": "Perplexity Search",
        "role": "search",
        "source": "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
        "purpose": "Search indexing, not foundation-model training.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "PerplexityBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "PerplexityBot",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "Applebot",
        "provider": "Apple",
        "label": "Apple Search",
        "role": "search",
        "source": "https://support.apple.com/en-us/119829",
        "purpose": "Search discovery in Apple products.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Uses Googlebot rules when Applebot is not named. Training-use choices are separate.",
        "fallback": "Googlebot",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Applebot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "Applebot",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "Amzn-SearchBot",
        "provider": "Amazon",
        "label": "Amazon / Alexa Search",
        "role": "search",
        "source": "https://developer.amazon.com/amazonbot",
        "purpose": "Search experiences, not model training.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Without an explicit Amzn-SearchBot group, Amazon may use other search-bot rules. Its fallback precedence is not specified; ambiguous outcomes stay unknown.",
        "fallback": "other-search-unspecified",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": null,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-SearchBot",
            "basis": "provider-fallback-unknown",
            "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
          }
        ],
        "summary": {
          "allowed": 0,
          "disallowed": 0,
          "unknown": 14,
          "total": 14,
          "state": "unknown"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": null,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "Amzn-SearchBot",
          "basis": "provider-fallback-unknown",
          "reason": "Amazon documents use of other search-bot rules when Amzn-SearchBot is absent, without a precise precedence. The generic result is not treated as a provider verdict."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "DuckAssistBot",
        "provider": "DuckDuckGo",
        "label": "DuckDuckGo AI answers",
        "role": "search",
        "source": "https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot",
        "purpose": "Real-time source retrieval for AI-assisted answers.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "An opt-out concerns AI-assisted answers, not ordinary DuckDuckGo rankings.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "DuckAssistBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "DuckAssistBot",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "MistralAI-Index",
        "provider": "Mistral",
        "label": "Mistral Search",
        "role": "search",
        "source": "https://docs.mistral.ai/robots",
        "purpose": "Automated indexing for Mistral search, not training.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Index",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "MistralAI-Index",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "ChatGPT-User",
        "provider": "OpenAI",
        "label": "ChatGPT user requests",
        "role": "user",
        "source": "https://developers.openai.com/api/docs/bots",
        "purpose": "Pages fetched on a user request.",
        "kind": "fetcher",
        "policyBehavior": "advisory",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "OpenAI says robots.txt rules may not apply. A Disallow is not proof that user-requested retrieval is blocked.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 22,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "chatgpt-user"
              ],
              "agentLines": [
                21
              ]
            },
            "matchedAgents": [
              "chatgpt-user"
            ],
            "groupLines": [
              21
            ],
            "evaluatedToken": "ChatGPT-User",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 22."
          }
        ],
        "summary": {
          "allowed": 0,
          "disallowed": 14,
          "unknown": 0,
          "total": 14,
          "state": "disallowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": false,
          "ruleAllowed": false,
          "matchedRule": {
            "type": "disallow",
            "path": "/",
            "line": 22,
            "raw": "Disallow: /",
            "specificity": 1,
            "group": [
              "chatgpt-user"
            ],
            "agentLines": [
              21
            ]
          },
          "matchedAgents": [
            "chatgpt-user"
          ],
          "groupLines": [
            21
          ],
          "evaluatedToken": "ChatGPT-User",
          "basis": "matched-rule",
          "explicit": true,
          "fallbackNote": "",
          "reason": "Disallow matched at line 22."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "Claude-User",
        "provider": "Anthropic",
        "label": "Claude user requests",
        "role": "user",
        "source": "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
        "purpose": "Pages retrieved at a Claude user's request.",
        "kind": "fetcher",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Claude-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "Claude-User",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "Perplexity-User",
        "provider": "Perplexity",
        "label": "Perplexity user requests",
        "role": "user",
        "source": "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
        "purpose": "Pages retrieved at a user's request.",
        "kind": "fetcher",
        "policyBehavior": "advisory",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Perplexity says this fetcher generally ignores robots.txt. Shown as a declared rule, not an access verdict.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Perplexity-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "Perplexity-User",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "Amzn-User",
        "provider": "Amazon",
        "label": "Alexa user requests",
        "role": "user",
        "source": "https://developer.amazon.com/amazonbot",
        "purpose": "Live pages fetched for user questions.",
        "kind": "fetcher",
        "policyBehavior": "advisory",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Amazon says user-triggered actions may not follow every robots directive.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amzn-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "Amzn-User",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "MistralAI-User",
        "provider": "Mistral",
        "label": "Mistral user requests",
        "role": "user",
        "source": "https://docs.mistral.ai/robots",
        "purpose": "User-requested retrieval, not automated indexing or training.",
        "kind": "fetcher",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-User",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "MistralAI-User",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "meta-externalfetcher",
        "provider": "Meta",
        "label": "Meta user-requested fetching",
        "role": "user",
        "source": "https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers/",
        "purpose": "Additional user-requested fetcher token.",
        "kind": "fetcher",
        "policyBehavior": "unverified",
        "docStatus": "Provider page unavailable during review",
        "checkedAt": "2026-09-11",
        "note": "Exact named and wildcard rules can be displayed, but current provider behavior could not be reverified. No access or visibility conclusion is inferred.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalfetcher",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "meta-externalfetcher",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "GPTBot",
        "provider": "OpenAI",
        "label": "OpenAI model training",
        "role": "training",
        "source": "https://developers.openai.com/api/docs/bots",
        "purpose": "Collection that may be used for model training.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 10,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "gptbot"
              ],
              "agentLines": [
                9
              ]
            },
            "matchedAgents": [
              "gptbot"
            ],
            "groupLines": [
              9
            ],
            "evaluatedToken": "GPTBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 10."
          }
        ],
        "summary": {
          "allowed": 0,
          "disallowed": 14,
          "unknown": 0,
          "total": 14,
          "state": "disallowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": false,
          "ruleAllowed": false,
          "matchedRule": {
            "type": "disallow",
            "path": "/",
            "line": 10,
            "raw": "Disallow: /",
            "specificity": 1,
            "group": [
              "gptbot"
            ],
            "agentLines": [
              9
            ]
          },
          "matchedAgents": [
            "gptbot"
          ],
          "groupLines": [
            9
          ],
          "evaluatedToken": "GPTBot",
          "basis": "matched-rule",
          "explicit": true,
          "fallbackNote": "",
          "reason": "Disallow matched at line 10."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "ClaudeBot",
        "provider": "Anthropic",
        "label": "Anthropic model training",
        "role": "training",
        "source": "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
        "purpose": "Collection that may contribute to model training.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 13,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "claudebot"
              ],
              "agentLines": [
                12
              ]
            },
            "matchedAgents": [
              "claudebot"
            ],
            "groupLines": [
              12
            ],
            "evaluatedToken": "ClaudeBot",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 13."
          }
        ],
        "summary": {
          "allowed": 0,
          "disallowed": 14,
          "unknown": 0,
          "total": 14,
          "state": "disallowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": false,
          "ruleAllowed": false,
          "matchedRule": {
            "type": "disallow",
            "path": "/",
            "line": 13,
            "raw": "Disallow: /",
            "specificity": 1,
            "group": [
              "claudebot"
            ],
            "agentLines": [
              12
            ]
          },
          "matchedAgents": [
            "claudebot"
          ],
          "groupLines": [
            12
          ],
          "evaluatedToken": "ClaudeBot",
          "basis": "matched-rule",
          "explicit": true,
          "fallbackNote": "",
          "reason": "Disallow matched at line 13."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "MistralAI-Training",
        "provider": "Mistral",
        "label": "Mistral model training",
        "role": "training",
        "source": "https://docs.mistral.ai/robots",
        "purpose": "Training-dataset collection, not search or live retrieval.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "MistralAI-Training",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "MistralAI-Training",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "Applebot-Extended",
        "provider": "Apple",
        "label": "Apple training-use control",
        "role": "training",
        "source": "https://support.apple.com/en-us/119829",
        "purpose": "A use-policy token for Applebot-collected content.",
        "kind": "policy",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Does not send its own HTTP requests. Disallowing it does not itself remove pages from Apple search.",
        "exactToken": true,
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 16,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "applebot-extended"
              ],
              "agentLines": [
                15
              ]
            },
            "matchedAgents": [
              "applebot-extended"
            ],
            "groupLines": [
              15
            ],
            "evaluatedToken": "Applebot-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 16."
          }
        ],
        "summary": {
          "allowed": 0,
          "disallowed": 14,
          "unknown": 0,
          "total": 14,
          "state": "disallowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": false,
          "ruleAllowed": false,
          "matchedRule": {
            "type": "disallow",
            "path": "/",
            "line": 16,
            "raw": "Disallow: /",
            "specificity": 1,
            "group": [
              "applebot-extended"
            ],
            "agentLines": [
              15
            ]
          },
          "matchedAgents": [
            "applebot-extended"
          ],
          "groupLines": [
            15
          ],
          "evaluatedToken": "Applebot-Extended",
          "basis": "matched-rule",
          "explicit": true,
          "fallbackNote": "",
          "reason": "Disallow matched at line 16."
        },
        "providerAccess": "not-applicable",
        "providerAccessNote": "This is a content-use token, not a separate network crawler. Provider processing was not verified."
      },
      {
        "id": "Google-Extended",
        "provider": "Google",
        "label": "Gemini training and grounding",
        "role": "mixed",
        "source": "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers",
        "purpose": "Controls specified Gemini training and grounding uses.",
        "kind": "policy",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Not an HTTP crawler. Does not control Google Search inclusion. A restriction also concerns specified grounding uses, so this is not training-only.",
        "exactToken": true,
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": false,
            "ruleAllowed": false,
            "matchedRule": {
              "type": "disallow",
              "path": "/",
              "line": 19,
              "raw": "Disallow: /",
              "specificity": 1,
              "group": [
                "google-extended"
              ],
              "agentLines": [
                18
              ]
            },
            "matchedAgents": [
              "google-extended"
            ],
            "groupLines": [
              18
            ],
            "evaluatedToken": "Google-Extended",
            "basis": "matched-rule",
            "explicit": true,
            "fallbackNote": "",
            "reason": "Disallow matched at line 19."
          }
        ],
        "summary": {
          "allowed": 0,
          "disallowed": 14,
          "unknown": 0,
          "total": 14,
          "state": "disallowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": false,
          "ruleAllowed": false,
          "matchedRule": {
            "type": "disallow",
            "path": "/",
            "line": 19,
            "raw": "Disallow: /",
            "specificity": 1,
            "group": [
              "google-extended"
            ],
            "agentLines": [
              18
            ]
          },
          "matchedAgents": [
            "google-extended"
          ],
          "groupLines": [
            18
          ],
          "evaluatedToken": "Google-Extended",
          "basis": "matched-rule",
          "explicit": true,
          "fallbackNote": "",
          "reason": "Disallow matched at line 19."
        },
        "providerAccess": "not-applicable",
        "providerAccessNote": "This is a content-use token, not a separate network crawler. Provider processing was not verified."
      },
      {
        "id": "Amazonbot",
        "provider": "Amazon",
        "label": "Amazon content collection",
        "role": "mixed",
        "source": "https://developer.amazon.com/amazonbot",
        "purpose": "Collection for Amazon products; may include AI model training.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Keep separate from Amzn-SearchBot and Amzn-User.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Amazonbot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "Amazonbot",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "meta-externalagent",
        "provider": "Meta",
        "label": "Meta automated collection",
        "role": "additional",
        "source": "https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers/",
        "purpose": "Additional automated collection token.",
        "kind": "crawler",
        "policyBehavior": "unverified",
        "docStatus": "Provider page unavailable during review",
        "checkedAt": "2026-09-11",
        "note": "Policy syntax only. The provider page could not be read during this review; do not infer training or search outcomes.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "meta-externalagent",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "meta-externalagent",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "CCBot",
        "provider": "Common Crawl",
        "label": "Common Crawl collection",
        "role": "additional",
        "source": "https://commoncrawl.org/ccbot",
        "purpose": "Collection for the Common Crawl open web archive.",
        "kind": "crawler",
        "policyBehavior": "robots",
        "docStatus": "Provider documentation reviewed",
        "checkedAt": "2026-09-11",
        "note": "Not a direct test of visibility in an individual AI answer service.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "CCBot",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "CCBot",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      },
      {
        "id": "Bytespider",
        "provider": "ByteDance",
        "label": "Bytespider policy entry",
        "role": "additional",
        "source": "https://zhanzhang.toutiao.com/docs/intro/26899",
        "purpose": "Additional crawler token; purpose not reverified.",
        "kind": "crawler",
        "policyBehavior": "unverified",
        "docStatus": "Provider page had no readable content",
        "checkedAt": "2026-09-11",
        "note": "Only exact-token/wildcard policy syntax is evaluated. Provider-specific behavior, query matching and AI use are not verified.",
        "results": [
          {
            "url": "https://example.com/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-1/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-2/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-3/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-4/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-5/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/services/example-6/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-7/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-8/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-9/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-10/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-11/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-12/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          },
          {
            "url": "https://example.com/resources/example-13/",
            "robotsUrl": "https://example.com/robots.txt",
            "fetchedAt": "2026-09-11T12:00:00Z",
            "policyState": "parsed",
            "allowed": true,
            "ruleAllowed": true,
            "matchedRule": {
              "type": "allow",
              "path": "/",
              "line": 2,
              "raw": "Allow: /",
              "specificity": 1,
              "group": [
                "*"
              ],
              "agentLines": [
                1
              ]
            },
            "matchedAgents": [
              "*"
            ],
            "groupLines": [
              1
            ],
            "evaluatedToken": "Bytespider",
            "basis": "matched-rule",
            "explicit": false,
            "fallbackNote": "",
            "reason": "Allow matched at line 2."
          }
        ],
        "summary": {
          "allowed": 14,
          "disallowed": 0,
          "unknown": 0,
          "total": 14,
          "state": "allowed"
        },
        "entry": {
          "url": "https://example.com/",
          "robotsUrl": "https://example.com/robots.txt",
          "fetchedAt": "2026-09-11T12:00:00Z",
          "policyState": "parsed",
          "allowed": true,
          "ruleAllowed": true,
          "matchedRule": {
            "type": "allow",
            "path": "/",
            "line": 2,
            "raw": "Allow: /",
            "specificity": 1,
            "group": [
              "*"
            ],
            "agentLines": [
              1
            ]
          },
          "matchedAgents": [
            "*"
          ],
          "groupLines": [
            1
          ],
          "evaluatedToken": "Bytespider",
          "basis": "matched-rule",
          "explicit": false,
          "fallbackNote": "",
          "reason": "Allow matched at line 2."
        },
        "providerAccess": "not-verified",
        "providerAccessNote": "No authenticated provider requests or server/CDN logs were inspected."
      }
    ],
    "policies": [
      {
        "origin": "https://example.com",
        "url": "https://example.com/robots.txt",
        "finalUrl": "https://example.com/robots.txt",
        "status": 200,
        "state": "parsed",
        "fetchedAt": "2026-09-11T12:00:00Z",
        "error": null,
        "hash": "f9c516c1690344dd0b9fdb5aa5a5143092407bc5cfad222d8b4c0dccdced58fa",
        "bytes": 320,
        "raw": "User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nUser-agent: Claude-SearchBot\nDisallow: /services/\nAllow: /services/public-guide/\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: ClaudeBot\nDisallow: /\n\nUser-agent: Applebot-Extended\nDisallow: /\n\nUser-agent: Google-Extended\nDisallow: /\n\nUser-agent: ChatGPT-User\nDisallow: /\n",
        "redirects": [],
        "parseWarnings": []
      }
    ],
    "scanner": {
      "status": 200,
      "url": "https://example.com/",
      "identity": "CadenceAuditAssistant/2.0",
      "state": "page-received",
      "message": "Our HTTP request received usable page content. This does not verify any other crawler.",
      "renderSucceeded": true
    },
    "summary": {
      "entries": 24,
      "searchEntries": 9,
      "searchRestricted": 2,
      "searchClear": 6,
      "searchUnknown": 1,
      "trainingRestricted": 3,
      "mixedUseRestricted": 1
    },
    "limitations": [
      "Robots permission is not proof of network access, indexing, citation, ranking or inclusion.",
      "User-requested fetchers may not apply robots rules in the same way as automated crawlers. Read each provider note.",
      "Training and mixed-use preferences are policy choices, not automatic search defects.",
      "Meta/X-Robots-Tag, snippet controls, account-level settings and resource access can impose separate restrictions; this matrix evaluates robots.txt only.",
      "Unavailable, oversized, malformed or challenge responses stay unknown. Provider caches and undocumented fallback behavior can differ.",
      "The registry is versioned and manually reviewed, not automatically updated. Documentation gaps are marked per provider."
    ]
  },
  "browserAssist": {
    "capturedPages": 3,
    "pages": [
      {
        "schemaVersion": "cadence-browser-assist-1",
        "capturedAt": "2026-09-11T12:00:00Z",
        "url": "https://example.com/",
        "page": {
          "title": "Example Home",
          "metaDescription": "Example description",
          "canonical": "https://example.com/",
          "headings": {
            "h1": [
              "Example Home"
            ],
            "h2": []
          },
          "structuredDataTypes": [
            "Organization"
          ],
          "images": {
            "total": 4,
            "missingAlt": 0
          },
          "links": {
            "internalPrimary": 5,
            "externalPrimary": 1
          },
          "authorSignals": [],
          "openGraph": {}
        }
      },
      {
        "schemaVersion": "cadence-browser-assist-1",
        "capturedAt": "2026-09-11T12:00:00Z",
        "url": "https://example.com/services/example-1/",
        "page": {
          "title": "Example Service",
          "metaDescription": "",
          "canonical": "https://example.com/services/example-1/",
          "headings": {
            "h1": [],
            "h2": [
              "What we do"
            ]
          },
          "structuredDataTypes": [],
          "images": {
            "total": 2,
            "missingAlt": 1
          },
          "links": {
            "internalPrimary": 2,
            "externalPrimary": 0
          },
          "authorSignals": [],
          "openGraph": {}
        }
      },
      {
        "schemaVersion": "cadence-browser-assist-1",
        "capturedAt": "2026-09-11T12:00:00Z",
        "url": "https://example.com/services/example-2/",
        "page": {
          "title": "Another Service",
          "metaDescription": "",
          "canonical": "https://example.com/services/example-2/",
          "headings": {
            "h1": [],
            "h2": [
              "Details"
            ]
          },
          "structuredDataTypes": [],
          "images": {
            "total": 3,
            "missingAlt": 0
          },
          "links": {
            "internalPrimary": 1,
            "externalPrimary": 0
          },
          "authorSignals": [],
          "openGraph": {}
        }
      }
    ],
    "limitations": [
      "Synthetic Browser Assist example. Rendered-page evidence only."
    ]
  }
};
