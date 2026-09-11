function compactEvidence(evidence = [], limit = 6) {
  return evidence
    .slice(0, limit)
    .map((item) => `${item.label}: ${item.value}`)
    .join(' · ');
}

function confidenceDetails(confidence) {
  if (confidence === 'confirmed') {
    return {
      label:'High',
      message:'The scanner observed a direct technical signal. Verify the live page before recording, but the underlying evidence is deterministic.'
    };
  }
  if (confidence === 'likely') {
    return {
      label:'Moderate-high',
      message:'The scanner observed a strong pattern, but interpretation still depends on page intent and implementation context.'
    };
  }
  return {
    label:'Manual review required',
    message:'This is an investigation lead from a sampled or heuristic check, not a proven search problem. Confirm it before using it in a client-facing audit.'
  };
}

function methodFor(finding) {
  const id = finding.id || '';
  const category = finding.category || '';

  if (id === 'relationship-editorial-citations') {
    return {
      lookedFor:'Source-like external links inside primary article content. The classifier uses destination and anchor cues associated with government, academic, research, guideline, standards, study, documentation, and publication sources.',
      limitations:'The scanner can miss unlinked citations, plain-text references, dynamically loaded references, or credible sources whose URL and anchor text do not match the current source classifier.'
    };
  }

  if (id === 'relationship-author-profile-connections') {
    return {
      lookedFor:'Visible article authorship signals plus an explicit link connecting the byline or author area to a maintained author/profile page.',
      limitations:'Unconventional profile URLs, JavaScript-only author links, or author relationships expressed only in metadata can be missed. A byline does not always need a separate profile page.'
    };
  }

  if (category === 'structured-data') {
    return {
      lookedFor:'Machine-readable structured-data types on the audited and sampled pages, with extra attention to whether the markup describes the specific page type rather than only the site or organization.',
      limitations:'Schema presence does not guarantee eligibility, accuracy, or ranking benefit. The scanner checks type-level signals and does not replace validator or manual semantic review.'
    };
  }

  if (category === 'content-pathways' || category === 'internal-discovery') {
    return {
      lookedFor:'Contextual internal links inside primary content, including how sampled articles, services, products, and location pages connect to related pages in the expanded relationship crawl.',
      limitations:'The relationship crawl is deliberately sampled. A page with few sampled inbound links is not necessarily orphaned and may receive links from URLs outside the crawl.'
    };
  }

  if (category === 'rendering') {
    return {
      lookedFor:'Differences between meaningful primary content and contextual links in the initial HTML response versus the browser-rendered DOM after JavaScript execution.',
      limitations:'Dynamic widgets and late-loading interface elements can change rendered counts. Boilerplate is filtered where practical, but raw-versus-rendered differences should still be inspected in context.'
    };
  }

  if (category === 'crawlability') {
    return {
      lookedFor:'HTTP status, redirect behavior, robots.txt directives, response-level access signals, and whether the scanner could retrieve a normal document response.',
      limitations:'CDN, WAF, rate-limit, geolocation, or anti-bot behavior can affect an audit request differently from major search-engine crawlers. Access warnings should be validated independently.'
    };
  }

  if (category === 'indexing') {
    return {
      lookedFor:'Indexing directives and consolidation signals such as meta robots, X-Robots-Tag, canonical targets, redirect destinations, and sitemap/indexability conflicts.',
      limitations:'A technically indexable URL is not guaranteed to be indexed, and canonical tags are signals rather than absolute commands. Check live search-engine behavior when the distinction matters.'
    };
  }

  if (category === 'entity-clarity') {
    return {
      lookedFor:'Explicit machine-readable and visible relationships between the page, organization, authors, people, and other named entities.',
      limitations:'Entity clarity is contextual. The scanner can detect common markup and linking patterns, but it cannot determine whether every entity relationship is editorially useful or correct.'
    };
  }

  if (category === 'source-quality') {
    return {
      lookedFor:'Evidence signals in primary content that make factual claims easier to verify, including links that resemble original, authoritative, research, or standards-based sources.',
      limitations:'A page can be accurate without external citations, and a link can be poor evidence even when it matches the source classifier. Review the actual claims and destinations.'
    };
  }

  if (category === 'on-page') {
    return {
      lookedFor:'Repeated page-level HTML patterns across the sampled URLs, with emphasis on confirmed title, meta-description, and H1 implementation issues plus recurring template-level review cues.',
      limitations:'The site sample is intentionally bounded. A repeated pattern can point to a shared template or CMS behavior, but the affected share should be verified before describing it as sitewide.'
    };
  }

  if (category === 'metadata') {
    return {
      lookedFor:'Title and meta-description presence, duplicates, repeated template copy, multiple tags, and unusually short or long values used as review cues.',
      limitations:'Title and description length are not fixed ranking limits. Search engines can truncate or rewrite snippets, so length flags should be treated as editorial review prompts rather than hard errors.'
    };
  }

  if (category === 'headings') {
    return {
      lookedFor:'H1 presence and count, empty headings, and heading-level jumps in the primary content structure.',
      limitations:'Multiple H1 elements are not automatically an SEO problem. The scanner flags them for semantic review when the document structure may be unclear or template-driven.'
    };
  }

  if (category === 'images') {
    return {
      lookedFor:'Image alt attributes and obviously generic alt text in the checked HTML.',
      limitations:'Empty alt text can be correct for decorative images, so it is not treated as an issue by itself. The scanner cannot infer the intended meaning of every image.'
    };
  }

  if (category === 'international') {
    return {
      lookedFor:'Detected hreflang values, local syntax validity, and duplicate language/region values on the same page.',
      limitations:'This is not a full reciprocal hreflang crawl. Valid syntax does not prove that alternate URLs, canonicals, and return annotations are all correct.'
    };
  }

  if (category === 'links') {
    return {
      lookedFor:'A bounded set of internal link targets from the audited page, checking response status and redirect behavior.',
      limitations:'This is not a full-site broken-link crawl. Only the configured subset of links on the audited URL is validated.'
    };
  }

  return {
    lookedFor:'The deterministic page and site signals associated with this finding, including the evidence listed below.',
    limitations:'Automated checks are directional. Confirm page intent, implementation details, and the live experience before presenting the observation as a client-facing conclusion.'
  };
}

export function verificationForFinding(finding) {
  const method = methodFor(finding);
  const confidence = confidenceDetails(finding.confidence);
  const found = compactEvidence(finding.evidence) || finding.whyItMatters || 'No compact evidence summary is available.';
  return {
    lookedFor:method.lookedFor,
    found,
    confidenceLabel:confidence.label,
    confidenceMessage:confidence.message,
    limitations:method.limitations
  };
}

export function attachVerification(findings = []) {
  return findings.map((finding) => ({
    ...finding,
    verification:verificationForFinding(finding)
  }));
}
