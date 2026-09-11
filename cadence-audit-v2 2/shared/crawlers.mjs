// Curated registry, not an exhaustive inventory. Review provider documentation before
// changing roles. Policy permission is separate from observed network access.
export const CRAWLER_REGISTRY_VERSION = '2026-09-11.1';
export const CRAWLER_REGISTRY_REVIEWED = '2026-09-11';
export const CRAWLER_GROUPS = {
  search: 'Search discovery', user: 'User-requested retrieval',
  training: 'Training controls', mixed: 'Mixed content uses', additional: 'Additional collection'
};
const refs = {
  openai: 'https://developers.openai.com/api/docs/bots',
  claude: 'https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler',
  perplexity: 'https://docs.perplexity.ai/docs/resources/perplexity-crawlers',
  google: 'https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers',
  bing: 'https://blogs.bing.com/webmaster/september-2020/Bing-Webmaster-Tools-makes-it-easy-to-edit-and-verify-your-robots-txt',
  apple: 'https://support.apple.com/en-us/119829',
  amazon: 'https://developer.amazon.com/amazonbot',
  meta: 'https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers/',
  duck: 'https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot',
  mistral: 'https://docs.mistral.ai/robots',
  common: 'https://commoncrawl.org/ccbot',
  byte: 'https://zhanzhang.toutiao.com/docs/intro/26899'
};
const bot = (id, provider, label, role, sourceKey, purpose, extra = {}) => Object.freeze({
  id, provider, label, role, source: refs[sourceKey], purpose,
  kind: 'crawler', policyBehavior: 'robots', docStatus: 'Provider documentation reviewed',
  checkedAt: CRAWLER_REGISTRY_REVIEWED, note: '', ...extra
});
export const CRAWLERS = Object.freeze([
  bot('Googlebot','Google','Google Search','search','google','Crawling for Google Search, including its AI search features.', {note:'Robots permission is not indexing, snippet eligibility or AI appearance. Other page and product controls may apply.'}),
  bot('bingbot','Microsoft','Bing Search','search','bing','Crawling for Bing search indexing.', {note:'Do not infer Copilot inclusion from a robots permission result.'}),
  bot('OAI-SearchBot','OpenAI','ChatGPT Search','search','openai','Search discovery for ChatGPT.', {note:'Independent of GPTBot training preferences.'}),
  bot('Claude-SearchBot','Anthropic','Claude Search','search','claude','Crawling for Claude search results.'),
  bot('PerplexityBot','Perplexity','Perplexity Search','search','perplexity','Search indexing, not foundation-model training.'),
  bot('Applebot','Apple','Apple Search','search','apple','Search discovery in Apple products.', {fallback:'Googlebot', note:'Uses Googlebot rules when Applebot is not named. Training-use choices are separate.'}),
  bot('Amzn-SearchBot','Amazon','Amazon / Alexa Search','search','amazon','Search experiences, not model training.', {fallback:'other-search-unspecified', note:'Without an explicit Amzn-SearchBot group, Amazon may use other search-bot rules. Its fallback precedence is not specified; ambiguous outcomes stay unknown.'}),
  bot('DuckAssistBot','DuckDuckGo','DuckDuckGo AI answers','search','duck','Real-time source retrieval for AI-assisted answers.', {note:'An opt-out concerns AI-assisted answers, not ordinary DuckDuckGo rankings.'}),
  bot('MistralAI-Index','Mistral','Mistral Search','search','mistral','Automated indexing for Mistral search, not training.'),
  bot('ChatGPT-User','OpenAI','ChatGPT user requests','user','openai','Pages fetched on a user request.', {kind:'fetcher', policyBehavior:'advisory', note:'OpenAI says robots.txt rules may not apply. A Disallow is not proof that user-requested retrieval is blocked.'}),
  bot('Claude-User','Anthropic','Claude user requests','user','claude','Pages retrieved at a Claude user\'s request.', {kind:'fetcher'}),
  bot('Perplexity-User','Perplexity','Perplexity user requests','user','perplexity','Pages retrieved at a user\'s request.', {kind:'fetcher', policyBehavior:'advisory', note:'Perplexity says this fetcher generally ignores robots.txt. Shown as a declared rule, not an access verdict.'}),
  bot('Amzn-User','Amazon','Alexa user requests','user','amazon','Live pages fetched for user questions.', {kind:'fetcher', policyBehavior:'advisory', note:'Amazon says user-triggered actions may not follow every robots directive.'}),
  bot('MistralAI-User','Mistral','Mistral user requests','user','mistral','User-requested retrieval, not automated indexing or training.', {kind:'fetcher'}),
  bot('meta-externalfetcher','Meta','Meta user-requested fetching','user','meta','Additional user-requested fetcher token.', {kind:'fetcher', policyBehavior:'unverified', docStatus:'Provider page unavailable during review', note:'Exact named and wildcard rules can be displayed, but current provider behavior could not be reverified. No access or visibility conclusion is inferred.'}),
  bot('GPTBot','OpenAI','OpenAI model training','training','openai','Collection that may be used for model training.'),
  bot('ClaudeBot','Anthropic','Anthropic model training','training','claude','Collection that may contribute to model training.'),
  bot('MistralAI-Training','Mistral','Mistral model training','training','mistral','Training-dataset collection, not search or live retrieval.'),
  bot('Applebot-Extended','Apple','Apple training-use control','training','apple','A use-policy token for Applebot-collected content.', {kind:'policy', exactToken:true, note:'Does not send its own HTTP requests. Disallowing it does not itself remove pages from Apple search.'}),
  bot('Google-Extended','Google','Gemini training and grounding','mixed','google','Controls specified Gemini training and grounding uses.', {kind:'policy', exactToken:true, note:'Not an HTTP crawler. Does not control Google Search inclusion. A restriction also concerns specified grounding uses, so this is not training-only.'}),
  bot('Amazonbot','Amazon','Amazon content collection','mixed','amazon','Collection for Amazon products; may include AI model training.', {note:'Keep separate from Amzn-SearchBot and Amzn-User.'}),
  bot('meta-externalagent','Meta','Meta automated collection','additional','meta','Additional automated collection token.', {policyBehavior:'unverified', docStatus:'Provider page unavailable during review', note:'Policy syntax only. The provider page could not be read during this review; do not infer training or search outcomes.'}),
  bot('CCBot','Common Crawl','Common Crawl collection','additional','common','Collection for the Common Crawl open web archive.', {note:'Not a direct test of visibility in an individual AI answer service.'}),
  bot('Bytespider','ByteDance','Bytespider policy entry','additional','byte','Additional crawler token; purpose not reverified.', {policyBehavior:'unverified', docStatus:'Provider page had no readable content', note:'Only exact-token/wildcard policy syntax is evaluated. Provider-specific behavior, query matching and AI use are not verified.'})
]);
export const CRAWLER_TOKENS = Object.freeze(CRAWLERS.map(x => x.id));
