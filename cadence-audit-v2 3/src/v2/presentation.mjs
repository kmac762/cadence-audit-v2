import {PLAYBOOKS,AI_RELEVANCE} from './playbooks.mjs';

// Refresh recommendation language at presentation time so saved reports from an
// earlier release receive the current reviewed search framing without changing
// their observations, evidence, IDs, scope, or review decisions.
export function presentReport(report){
  if(!report?.recommendations)return report;
  const recommendations=report.recommendations.map(r=>{
    const p=PLAYBOOKS[r.playbook];
    if(!p)return r;
    const ai=AI_RELEVANCE[r.playbook]||{};
    const observation=String(r.observation||'').trim();
    if(String(r.id||'').startsWith('browser:'))return {...r,talk:p.talk,aiTalk:ai.talk||r.aiTalk||'',aiLevel:ai.level||r.aiLevel||'',aiWhy:ai.why||r.aiWhy||'',aiEffect:ai.effect||r.aiEffect||'',aiSource:ai.source||r.aiSource||''};
    return {...r,
      title:p.title,
      theme:p.theme,
      why:p.why,
      solution:[...p.steps],
      success:p.success,
      verify:p.steps[0],
      caveat:p.caveat,
      userNote:p.userNote||'',
      effort:p.effort,
      talk:p.talk,
      source:p.source,
      searchEffect:p.searchEffect||p.caveat,
      aiLevel:ai.level||'',
      aiWhy:ai.why||'',
      aiEffect:ai.effect||'',
      aiSource:ai.source||'',
      aiTalk:ai.talk||''
    };
  });
  return {...report,recommendations};
}
