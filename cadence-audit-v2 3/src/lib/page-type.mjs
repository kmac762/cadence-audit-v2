const TYPE_ORDER = ['service', 'article', 'location', 'product', 'company', 'other'];

function pathSegments(value) {
  try {
    return new URL(value).pathname.toLowerCase().split('/').filter(Boolean);
  } catch {
    return [];
  }
}

function sourceHint(sourceSitemap = '') {
  const value = String(sourceSitemap || '').toLowerCase();
  if (/product|shop|store|catalog|collection/.test(value)) return 'product';
  if (/post|article|blog|news|insight|resource/.test(value)) return 'article';
  if (/location|state|city|service-area/.test(value)) return 'location';
  if (/service|solution|treatment|therapy|procedure/.test(value)) return 'service';
  return null;
}

export function classifyUrlType(value, sourceSitemap = '', structuredTypes = []) {
  let url;
  try { url = new URL(value); }
  catch { return 'other'; }

  const path = url.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (path === '/') return 'home';

  const schema = new Set((structuredTypes || []).map((x) => String(x).toLowerCase()));
  if (schema.has('product')) return 'product';
  if (schema.has('article') || schema.has('blogposting') || schema.has('newsarticle')) return 'article';
  if (schema.has('service')) return 'service';

  const hint = sourceHint(sourceSitemap);
  const segments = pathSegments(value);
  const joined = `/${segments.join('/')}/`;

  if (/\/(?:blog|blogs|article|articles|news|insights?|resources?|guides?|learn|stories|press)\//.test(joined) || /\/20\d{2}\/\d{1,2}\//.test(joined)) return 'article';
  if (/\/(?:product|products|shop|store|collections?|catalog)\//.test(joined)) return 'product';
  if (/\/(?:locations?|state|states|cities|service-area|service-areas|areas-we-serve|find-a-location)\//.test(joined)) return 'location';
  if (/\/(?:services?|solutions?|treatments?|therapies|therapy|procedures?|programs?|specialties|specialty)\//.test(joined)) return 'service';
  if (/\/(?:about|about-us|team|our-team|contact|careers?|leadership|company)\/?$/.test(joined)) return 'company';

  return hint || 'other';
}

export function expectedPageSchema(pageType) {
  if (pageType === 'article') return ['Article', 'BlogPosting', 'NewsArticle'];
  if (pageType === 'product') return ['Product'];
  if (pageType === 'service') return ['Service'];
  return [];
}

export function pathDepth(value) {
  return pathSegments(value).length;
}

export function sampleTypeOrder() {
  return [...TYPE_ORDER];
}
