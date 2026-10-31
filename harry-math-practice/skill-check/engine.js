(function(root){
 'use strict';
 const D=root.HarrySkillData,clone=x=>JSON.parse(JSON.stringify(x)),object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),time=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
 const session=id=>D.sessions.find(s=>s.id===id),question=id=>D.sessions.flatMap(s=>s.questions).find(q=>q.id===id),empty=()=>({version:1,courseId:D.courseId,sessions:{}});
 const complete=r=>!!r&&session(r.id).questions.every(q=>r.answers[q.id]);
 const stamp=r=>Object.values(r.answers).map(a=>a.at).sort().at(-1)||null;
 const answerValid=(a,q)=>object(a)&&typeof a.id==='string'&&a.id.length>5&&a.id.length<120&&time(a.at)&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<q.choices.length&&a.correct===(a.choice===q.correct);
 function valid(state){try{
  return object(state)&&state.version===1&&state.courseId===D.courseId&&object(state.sessions)&&Object.entries(state.sessions).every(([id,r])=>{
   const s=session(id);return s&&object(r)&&r.id===id&&time(r.startedAt)&&object(r.answers)&&object(r.notes)&&object(r.reviewed)&&object(r.conflicts)&&
    Object.entries(r.answers).every(([qid,a])=>s.questions.some(q=>q.id===qid&&answerValid(a,q)))&&
    Object.entries(r.notes).every(([qid,n])=>s.questions.some(q=>q.id===qid)&&object(n)&&typeof n.text==='string'&&n.text.length<=2000&&time(n.at))&&
    Object.entries(r.reviewed).every(([qid,at])=>r.answers[qid]?.correct===false&&time(at))&&
    Object.entries(r.conflicts).every(([qid,list])=>r.answers[qid]&&Array.isArray(list)&&list.length<=20&&list.every(a=>answerValid(a,question(qid))))&&
    r.completedAt===(complete(r)?stamp(r):null)&&(s.number===1||complete(state.sessions[D.sessions[s.number-2].id]));
  });
 }catch{return false;}}
 function start(state,id,at=new Date().toISOString()){
  const s=session(id);if(!s||s.number>1&&!complete(state.sessions[D.sessions[s.number-2].id]))return false;
  state.sessions[id]||={id,startedAt:at,completedAt:null,answers:{},notes:{},reviewed:{},conflicts:{}};return true;
 }
 function submit(state,sid,qid,choice,at=new Date().toISOString(),eventId=root.crypto.randomUUID()){
  const r=state.sessions[sid],q=session(sid)?.questions.find(q=>q.id===qid);
  if(!r||!q||r.answers[qid]||r.completedAt||!Number.isInteger(choice)||choice<0||choice>=q.choices.length)return false;
  r.answers[qid]={id:eventId,choice,correct:choice===q.correct,at};if(complete(r))r.completedAt=stamp(r);return true;
 }
 function merge(local,remote){
  const out=empty();
  for(const s of D.sessions){const a=local.sessions[s.id],b=remote.sessions[s.id];if(!a&&!b)continue;
   const r=clone(b||a);if(a&&b){
    r.startedAt=[a.startedAt,b.startedAt].sort()[0];
    for(const q of s.questions){const x=a.answers[q.id],y=b.answers[q.id];if(x&&!y)r.answers[q.id]=clone(x);
     const extra=[...(a.conflicts[q.id]||[]),...(b.conflicts[q.id]||[])];if(x&&y&&JSON.stringify(x)!==JSON.stringify(y))extra.push(x);
     const conflicts=[...new Map(extra.filter(e=>e.id!==r.answers[q.id]?.id).map(e=>[e.id,e])).values()].sort((x,y)=>x.at.localeCompare(y.at)||x.id.localeCompare(y.id));if(conflicts.length)r.conflicts[q.id]=clone(conflicts);
     for(const key of ['notes']){const x=a[key][q.id],y=b[key][q.id];if(x&&(!y||x.at>y.at||x.at===y.at&&x.text>y.text))r[key][q.id]=clone(x);}
     if(a.reviewed[q.id]&&r.answers[q.id]?.correct===false)r.reviewed[q.id]=[a.reviewed[q.id],b.reviewed[q.id]].filter(Boolean).sort()[0];
     if(r.answers[q.id]?.correct)delete r.reviewed[q.id];
    }
   }
   r.completedAt=complete(r)?stamp(r):null;for(const key of ['answers','notes','reviewed','conflicts'])r[key]=Object.fromEntries(Object.entries(r[key]).sort(([a],[b])=>a.localeCompare(b)));out.sessions[s.id]=r;
  }return out;
 }
 const stats=r=>({answered:Object.keys(r?.answers||{}).length,total:24,correct:Object.values(r?.answers||{}).filter(a=>a.correct).length,wrong:Object.values(r?.answers||{}).filter(a=>!a.correct).length});
 const studyDate=at=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
 function report(state){
  const finished=D.sessions.filter(s=>complete(state.sessions[s.id])),scores=finished.map(s=>({id:s.id,number:s.number,...stats(state.sessions[s.id]),completedAt:state.sessions[s.id].completedAt})),days=[...new Set(scores.map(s=>studyDate(s.completedAt)))];
  const skills=D.skills.map(skill=>{const items=finished.flatMap(s=>s.questions.filter(q=>q.skill===skill.id).map(q=>({q,a:state.sessions[s.id].answers[q.id],session:s.number}))),facets={};
   for(const {q,a}of items){facets[q.facet]||={correct:0,total:0};facets[q.facet].total++;if(a.correct)facets[q.facet].correct++;}
   const correct=items.filter(x=>x.a.correct).length,total=items.length,strong=total>=9&&correct>=8&&Object.values(facets).every(f=>f.correct>0);
   return{...skill,correct,total,percent:total?Math.round(correct/total*100):null,strong,status:total<9?'Evidence building':strong?'Strong first-try evidence':'Needs more practice',facets,misses:items.filter(x=>!x.a.correct).map(({q,a,session})=>({questionId:q.id,session,facet:q.facet,prompt:q.prompt,selected:q.choices[a.choice],answer:q.choices[q.correct],explanation:q.explanation}))};
  });
  const recent=scores.slice(-2),accuracyReady=recent.length===2&&recent.every(s=>s.correct>=22),ready=scores.length===3&&days.length>=2&&skills.every(s=>s.strong)&&accuracyReady;
  return{scores,skills,studyDays:days.length,completed:scores.length,ready,accuracyReady,rule:'Complete three fresh sessions across at least two study days. Reach at least 8/9 first try in every skill, with a correct answer in every checked subskill, and at least 22/24 in each of the final two sessions.'};
 }
 root.HarrySkillEngine={empty,valid,start,submit,merge,complete,stats,report,question,session};
})(typeof window==='undefined'?globalThis:window);
