import {buildSearchAccess,accessPolicyFindings} from '../src/v2/search-access.mjs';
import {policyFromResponse} from '../src/lib/robots.mjs';
import fs from 'node:fs/promises';
import {PLAYBOOKS} from '../src/v2/playbooks.mjs';
import {RELEASE,API_VERSION} from '../shared/release.mjs';
const make=(key,id,obs,evidence)=>{const p=PLAYBOOKS[key];return{id,playbook:key,title:p.title,theme:p.theme,observation:obs,why:p.why,searchEffect:p.searchEffect,solution:p.steps,success:p.success,verify:p.steps[0],caveat:p.caveat,effort:p.effort,priority:'Planned review',confidence:'Observed in sample output; interpretation needs review',talk:obs+' '+p.talk,source:p.source,evidence,scope:'Inspected sample',originalFinding:{title:'Synthetic '+key+' example',confidence:'manual-review'}};};
const report={schemaVersion:API_VERSION,release:RELEASE,requestedUrl:'https://example.com/',finalUrl:'https://example.com/',scannedAt:'2026-09-11T12:00:00Z',status:'completed',complete:true,pageType:'home',coverage:{sampleUsable:14,sampleAttempted:14,samplePlanned:14,sampleSkipped:0,entryAnalysisSource:'initial-html',relationshipPages:24,relationshipPlanned:24,sitemapUrls:36,renderRequested:true,renderSucceeded:true,renderedPageCount:1},warnings:[],recommendations:[make('headings','sample:h1','The main heading element (H1) was not detected in the inspected HTML for 14 of 14 example pages.',[{label:'Example count',value:'14 / 14 pages - synthetic data',url:null},{label:'Review the page title',value:'H1 not detected in this example fixture',url:'https://example.com/services/'}]),make('links','sample:links','In this synthetic link sample, 3 of 9 articles link to a service or location page.',[{label:'Articles linking to services',value:'3 of 9 - synthetic data',url:'https://example.com/resources/guide/'}]),make('sources','sample:sources','In this synthetic sample, the classifier did not recognize supporting-source links in 5 articles. Unlinked references were not assessed.',[{label:'Source classifier',value:'0 of 5 - synthetic data',url:'https://example.com/resources/research/'}])],qa:{pagesChecked:14,issueObservations:14,reviewObservations:2,checks:[{id:'headings',label:'Heading structure',status:'issue',summary:'14 example H1 observations',note:'Not a ranking penalty. Verify the actual heading structure.',issueCount:14,reviewCount:0,items:[{issue:'Missing H1',level:'issue',value:'No H1 in the inspected example HTML',url:'https://example.com/services/'}]},{id:'titles',label:'Page titles',status:'good',summary:'No flag in this synthetic sample',note:'No assessment of actual rankings.',items:[],issueCount:0,reviewCount:0},{id:'meta',label:'Meta descriptions',status:'review',summary:'2 descriptions to review',note:'Length is a review cue, not an absolute limit.',items:[{issue:'Repeated description',level:'review',value:'Synthetic example of repeated page messaging',url:'https://example.com/services/'}],issueCount:0,reviewCount:2}],pages:[{url:'https://example.com/services/',modules:[{label:'Page title',status:'good'},{label:'Main heading',status:'issue'},{label:'Meta description',status:'review'}]}]},diagnostics:{crawlerPolicy:{Googlebot:true,'OAI-SearchBot':true},findings:[]},limitations:['This entire report is synthetic example data, not a website audit.','Only the entry URL is browser-rendered in real scans.','A limited sample cannot prove sitewide orphaning or lost revenue.']};
const exampleRobots=`User-agent: *
Allow: /

User-agent: OAI-SearchBot
User-agent: Claude-SearchBot
Disallow: /services/
Allow: /services/public-guide/

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: ChatGPT-User
Disallow: /
`;
const policy=policyFromResponse('https://example.com/',{status:200,headers:{'content-type':'text/plain'},body:exampleRobots},'2026-09-11T12:00:00Z');
const samplePaths=Array.from({length:13},(_,i)=>'https://example.com/'+(i<6?'services/':'resources/')+'example-'+(i+1)+'/');
report.searchAccess=buildSearchAccess({requestedUrl:report.requestedUrl,finalUrl:report.finalUrl,scannedAt:report.scannedAt,robots:policy,robotsByOrigin:{'https://example.com':policy},responseStatus:200,access:{pageContentUsable:true},rendered:{succeeded:true},siteSnapshot:{pages:samplePaths.map(url=>({requestedUrl:url,finalUrl:url}))}});
const policyFinding=accessPolicyFindings(report.searchAccess)[0];
report.recommendations.push(make('ai','sample:search-access',policyFinding.observation,policyFinding.evidence));
report.browserAssist={capturedPages:3,pages:[
 {schemaVersion:'cadence-browser-assist-1',capturedAt:report.scannedAt,url:'https://example.com/',page:{title:'Example Home',metaDescription:'Example description',canonical:'https://example.com/',headings:{h1:['Example Home'],h2:[]},structuredDataTypes:['Organization'],images:{total:4,missingAlt:0},links:{internalPrimary:5,externalPrimary:1},authorSignals:[],openGraph:{}}},
 {schemaVersion:'cadence-browser-assist-1',capturedAt:report.scannedAt,url:'https://example.com/services/example-1/',page:{title:'Example Service',metaDescription:'',canonical:'https://example.com/services/example-1/',headings:{h1:[],h2:['What we do']},structuredDataTypes:[],images:{total:2,missingAlt:1},links:{internalPrimary:2,externalPrimary:0},authorSignals:[],openGraph:{}}},
 {schemaVersion:'cadence-browser-assist-1',capturedAt:report.scannedAt,url:'https://example.com/services/example-2/',page:{title:'Another Service',metaDescription:'',canonical:'https://example.com/services/example-2/',headings:{h1:[],h2:['Details']},structuredDataTypes:[],images:{total:3,missingAlt:0},links:{internalPrimary:1,externalPrimary:0},authorSignals:[],openGraph:{}}}
],limitations:['Synthetic Browser Assist example. Rendered-page evidence only.']};
report.coverage.browserAssistPages=3;
report.diagnostics.crawlerPolicy=policy.agents;
await fs.writeFile(new URL('../public/demo.mjs',import.meta.url),'export const demoReport='+JSON.stringify(report,null,2)+';\n');
