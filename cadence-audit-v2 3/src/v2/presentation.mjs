import {PLAYBOOKS} from './playbooks.mjs';

// Refresh recommendation language at presentation time so saved reports from an
// earlier release receive the current reviewed search framing without changing
// their observations, evidence, IDs, scope, or review decisions.
export function presentReport(report){
  if(!report?.recommendations)return report;
  const recommendations=report.recommendations.map(r=>{
    if(String(r.id||'').startsWith('browser:'))return r;
    const p=PLAYBOOKS[r.playbook];
    if(!p)return r;
    const observation=String(r.observation||'').trim();
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
      talk:`${observation}${observation&&!/[.!?]$/.test(observation)?'.':''} ${p.talk}`.trim(),
      source:p.source,
      searchEffect:p.searchEffect||p.caveat
    };
  });
  return {...report,recommendations};
}
