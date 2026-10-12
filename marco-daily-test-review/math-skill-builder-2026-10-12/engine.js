(function(root){
  'use strict';
  const C=root.MarcoSkillCourse,clone=x=>JSON.parse(JSON.stringify(x)),time=x=>typeof x==='string'&&Number.isFinite(Date.parse(x)),object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  const empty=()=>({version:1,sessions:{}}),set=n=>C.sets.find(s=>s.number===n),resolve=id=>{const [kind,s]=String(id).split('@');const q=C.question(kind,Number(s));if(q.id!==id)throw new Error('Invalid question ID');return q;};
  const done=e=>!!e&&(e.attempts[0]?.correct||e.attempts.length===2);
  const firstPass=r=>r.questionIds.every(id=>r.answers[id]?.attempts.length);
  function finished(r){return r.questionIds.every(id=>done(r.answers[id]));}
  function plan(state){
    const gaps={},seen=new Set(),evidence=[];
    for(const s of C.sets){for(const r of state.sessions[s.id]||[])for(const id of r.questionIds)seen.add(id);if(s.number===7)continue;
      const r=state.sessions[s.id]?.[0];if(!r||(s.check&&!firstPass(r)))continue;
      for(const id of r.questionIds){const e=r.answers[id],q=resolve(id);if(e?.attempts.length){evidence.push({q,e});if(!e.attempts[0].correct){const g=gaps[q.concept]||={concept:q.concept,misses:0,from:[]};g.misses++;g.from.push(`Set ${s.number}`);}}}
    }
    const repair={};for(const r of state.sessions['set-7']||[])for(const id of r.questionIds){const e=r.answers[id];if(e?.attempts.length){const k=resolve(id).concept;(repair[k]||=[]).push({id,correct:e.attempts[0].correct,at:e.attempts[0].at});}}
    for(const g of Object.values(gaps)){const last=[...new Map((repair[g.concept]||[]).sort((a,b)=>a.at.localeCompare(b.at)).map(x=>[x.id,x])).values()].slice(-5);g.repairCorrect=last.filter(x=>x.correct).length;g.repairChecked=last.length;g.priority=last.length===5&&last.every(x=>x.correct)?0:g.misses/(1+last.length)+last.filter(x=>!x.correct).length;}
    const selected=Object.values(gaps).filter(g=>g.priority>0).sort((a,b)=>b.priority-a.priority||b.misses-a.misses||a.concept.localeCompare(b.concept)).slice(0,3);
    if(!selected.length)selected.push(...['intercept','relative','base'].map(concept=>({concept,misses:0,from:[]})));
    const ids=[];
    for(const g of selected){let count=0;for(let seed=401;seed<=500&&count<5;seed++){const id=g.concept+'@'+seed;if(!seen.has(id)){ids.push(id);count++;}}}
    // Interleave the three concepts, rather than revealing a five-question pattern.
    const byConcept=selected.map(g=>ids.filter(id=>id.startsWith(g.concept+'@'))),mixed=[];
    for(let i=0;i<5;i++)for(const group of byConcept)if(group[i])mixed.push(group[i]);
    return {questionIds:mixed,reasons:selected.map(g=>({...g,from:[...new Set(g.from)]})),targeted:selected.some(g=>g.misses>0),hasEvidence:evidence.length>0};
  }
  function start(number,state,at=new Date().toISOString(),id=root.crypto.randomUUID()){
    const s=set(number),p=s.adaptive?plan(state):null;if(s.adaptive&&!p.hasEvidence)throw new Error('Answer a core set before using targeted practice.');
    const ids=p?p.questionIds:s.questionIds;if(!ids.length)throw new Error('No unused follow-up questions remain.');
    return {id,setNumber:number,startedAt:at,completedAt:null,questionIds:[...ids],answers:{},pending:{},notes:{},targeted:p?.targeted||false,reasons:p?.reasons||[]};
  }
  function submit(run,id,choice,at=new Date().toISOString()){
    if(run.completedAt||!run.questionIds.includes(id))return false;const q=resolve(id),entry=run.answers[id]||{attempts:[]};
    if(done(entry)||!Number.isInteger(choice)||choice<0||choice>=4||entry.attempts.some(a=>a.choice===choice))return false;
    if(set(run.setNumber).check&&entry.attempts.length&&!firstPass(run))return false;
    entry.attempts.push({choice,correct:choice===q.correct,at});run.answers[id]=entry;delete run.pending[id];if(finished(run))run.completedAt=at;return true;
  }
  function reveal(run,id){const e=run.answers[id];return done(e)&&(!set(run.setNumber).check||firstPass(run));}
  function stats(run){const total=run?.questionIds.length||0;let attempted=0,first=0,corrected=0,closed=0;for(const id of run?.questionIds||[]){const e=run.answers[id];if(e?.attempts.length){attempted++;first+=e.attempts[0].correct?1:0;corrected+=!e.attempts[0].correct&&e.attempts[1]?.correct?1:0;}if(done(e))closed++;}return{total,attempted,first,corrected,closed};}
  function skillStats(state){
    const result=Object.fromEntries(Object.keys(C.skills).map(k=>[k,{attempted:0,first:0,checks:0,checkCorrect:0,checkTimes:[]}]));
    for(const s of C.sets){const r=state.sessions[s.id]?.[0];if(!r||(s.check&&!firstPass(r)))continue;for(const id of r.questionIds){const e=r.answers[id];if(!e?.attempts.length)continue;const x=result[resolve(id).skill];x.attempted++;if(e.attempts[0].correct)x.first++;if(s.check){x.checks++;x.checkTimes.push(e.attempts[0].at);if(e.attempts[0].correct)x.checkCorrect++;}}}
    return result;
  }
  function valid(state){
    try{return object(state)&&state.version===1&&object(state.sessions)&&Object.entries(state.sessions).every(([sid,runs])=>{
      const s=C.sets.find(x=>x.id===sid);if(!s||!Array.isArray(runs))return false;
      return runs.every(r=>object(r)&&typeof r.id==='string'&&r.id.length<200&&r.setNumber===s.number&&time(r.startedAt)&&(r.completedAt===null||time(r.completedAt))&&Array.isArray(r.questionIds)&&r.questionIds.length>0&&r.questionIds.length<=(s.number===8?25:15)&&new Set(r.questionIds).size===r.questionIds.length&&
        (s.adaptive?r.questionIds.every(id=>{const q=resolve(id);return q.seed>=401;}):JSON.stringify(r.questionIds)===JSON.stringify(s.questionIds))&&object(r.answers)&&object(r.pending)&&object(r.notes)&&Array.isArray(r.reasons)&&
        Object.entries(r.answers).every(([id,e])=>r.questionIds.includes(id)&&object(e)&&Array.isArray(e.attempts)&&e.attempts.length>0&&e.attempts.length<=2&&new Set(e.attempts.map(a=>a.choice)).size===e.attempts.length&&(!e.attempts[0].correct||e.attempts.length===1)&&e.attempts.every(a=>object(a)&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<4&&a.correct===(a.choice===resolve(id).correct)&&time(a.at)))&&
        (!r.completedAt||finished(r))&&(!s.check||firstPass(r)||Object.values(r.answers).every(e=>e.attempts.length===1))&&Object.entries(r.pending).every(([id,p])=>r.questionIds.includes(id)&&object(p)&&Number.isInteger(p.choice)&&p.choice>=0&&p.choice<4&&time(p.at))&&
        Object.entries(r.notes).every(([id,n])=>r.questionIds.includes(id)&&object(n)&&typeof n.text==='string'&&n.text.length<=2500&&time(n.at))&&
        r.reasons.every(g=>object(g)&&Object.hasOwn(C.names,g.concept)&&Number.isInteger(g.misses)&&g.misses>=0&&Array.isArray(g.from)&&g.from.every(x=>typeof x==='string'&&x.length<100)));
    });}catch{return false;}
  }
  const signature=r=>JSON.stringify([r.questionIds,Object.keys(r.answers).sort().map(k=>[k,r.answers[k].attempts.map(a=>[a.choice,a.at])])]);
  const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return(h>>>0).toString(16);};
  function compatible(a,b){return JSON.stringify(a.questionIds)===JSON.stringify(b.questionIds)&&Object.keys(a.answers).every(id=>{const x=a.answers[id].attempts,y=b.answers[id]?.attempts||[];return x.slice(0,Math.min(x.length,y.length)).every((t,i)=>t.choice===y[i].choice&&t.at===y[i].at);});}
  function merge(a,b){
    const out=empty();for(const s of C.sets){const groups=new Map();for(const state of [a,b])for(const r of state?.sessions?.[s.id]||[]){const base=r.id.split('~')[0];if(!groups.has(base))groups.set(base,[]);groups.get(base).push(clone(r));}
      const results=[];for(const [base,candidates] of groups){const versions=[];candidates.sort((x,y)=>signature(x).localeCompare(signature(y)));for(const r of candidates){const target=versions.find(v=>compatible(v,r));if(!target){versions.push(r);continue;}
          for(const [id,e]of Object.entries(r.answers))if((target.answers[id]?.attempts.length||0)<e.attempts.length)target.answers[id]=e;
          for(const key of ['pending','notes'])for(const [id,value]of Object.entries(r[key])){const old=target[key][id];if(!old||value.at>old.at||(value.at===old.at&&JSON.stringify(value)>JSON.stringify(old)))target[key][id]=value;}
          target.completedAt=[target.completedAt,r.completedAt].filter(Boolean).sort()[0]||null;
        }
        versions.sort((x,y)=>signature(x).localeCompare(signature(y)));versions.forEach((r,i)=>{r.id=i?base+'~'+hash(signature(r)):base;if(versions.length>1)r.deviceConflict=true;for(const id of r.questionIds){const e=r.answers[id];if(done(e)||r.pending[id]?.at<=e?.attempts.at(-1)?.at)delete r.pending[id];}if(!r.completedAt&&finished(r))r.completedAt=Object.values(r.answers).flatMap(e=>e.attempts.map(a=>a.at)).sort().at(-1);for(const key of ['answers','pending','notes'])r[key]=Object.fromEntries(Object.entries(r[key]).sort(([x],[y])=>x.localeCompare(y)));results.push(r);});
      }
      results.sort((x,y)=>x.startedAt.localeCompare(y.startedAt)||x.id.localeCompare(y.id));if(results.length)out.sessions[s.id]=results;
    }return out;
  }
  root.MarcoSkillEngine={empty,set,resolve,done,firstPass,finished,plan,start,submit,reveal,stats,skillStats,valid,merge};
})(typeof window==='undefined'?globalThis:window);
