(function(root){
 'use strict';
 const D=root.HarrySkillData,clone=x=>JSON.parse(JSON.stringify(x)),object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),time=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
 const session=id=>D.sessions.find(s=>s.id===id),allQuestions=s=>[...s.questions,...(s.retiredQuestions||[])],question=id=>D.sessions.flatMap(allQuestions).find(q=>q.id===id),empty=()=>({version:1,courseId:D.courseId,sessions:{}});
 const complete=r=>!!r&&!!session(r.id)&&session(r.id).questions.every(q=>r.answers[q.id]);
 const stamp=r=>Object.values(r.answers).map(a=>a.at).sort().at(-1)||null;
 const answerValid=(a,q)=>object(a)&&typeof a.id==='string'&&a.id.length>5&&a.id.length<120&&time(a.at)&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<q.choices.length&&a.correct===(a.choice===q.correct);
 // Parent correction: discard only the withdrawn answer events; keep new attempts.
 const withdrawn=new Set(["9405c7bd-84e9-4da7-9cf4-8246415e4e74","5d33b7ad-2ff4-4c51-805e-f65c45443107","a4f693ab-f3c1-4e86-aa93-7e143201e8e5","674ff28a-e181-4f9b-9aa7-2afeb335dcc0","4fad5bf1-aa89-4dcb-98ef-eca63ac8eb27","b4b35644-07d6-4105-90a6-8b5c4efce16a","6c100eac-f288-47f8-a97b-7ed32467ee30","91ceed81-1e18-4060-a86b-6d951dc264f9","45493d77-bde7-4465-812b-ce686935c0c4","461b9c28-100a-4dd9-a3f0-dbd33e9ea3e3","44be7364-b0a5-449e-95c2-5117ab4bc780","3e91d932-2940-4ad6-9ee2-d76b5894e87e","ad5697c4-2548-4268-812c-f20ad0c2e18f","3c51be51-4652-4c46-b345-6c45b0c2dddb","334f1fc7-c4c4-4dcb-8e7f-47583620127a","4ed96629-c133-48d4-b718-e2adb8744fbb","80d34be4-5458-4763-950f-f932a42f06bd","7fddd65a-28e2-4c3d-ab9a-ba4e6ba2cc26","e069cb67-b84d-4a90-9720-5f5972b83daa","401d3586-9767-4624-b173-d6d563b2db2c"]);
 function repair(state){const out=clone(state),r=out.sessions['mixed-1'];if(r){for(const [id,a]of Object.entries(r.answers)){if(withdrawn.has(a.id)){delete r.answers[id];delete r.reviewed[id];delete r.conflicts[id];}}}for(const record of Object.values(out.sessions))record.completedAt=complete(record)?stamp(record):null;return out;}
 function valid(state){try{
  return object(state)&&state.version===1&&state.courseId===D.courseId&&object(state.sessions)&&Object.entries(state.sessions).every(([id,r])=>{
   const s=session(id);return s&&object(r)&&r.id===id&&time(r.startedAt)&&object(r.answers)&&object(r.notes)&&object(r.reviewed)&&object(r.conflicts)&&
    Object.entries(r.answers).every(([qid,a])=>allQuestions(s).some(q=>q.id===qid&&answerValid(a,q)))&&
    Object.entries(r.notes).every(([qid,n])=>allQuestions(s).some(q=>q.id===qid)&&object(n)&&typeof n.text==='string'&&n.text.length<=2000&&time(n.at))&&
    Object.entries(r.reviewed).every(([qid,at])=>r.answers[qid]?.correct===false&&time(at))&&
    Object.entries(r.conflicts).every(([qid,list])=>r.answers[qid]&&Array.isArray(list)&&list.length<=20&&list.every(a=>answerValid(a,question(qid))))&&
    (r.completedAt===(complete(r)?stamp(r):null)||r.completedAt===null&&s.retiredQuestions?.length>0&&!allQuestions(s).every(q=>r.answers[q.id]));
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
 function submitSet(state,sid,choices,at=new Date().toISOString(),eventId=()=>root.crypto.randomUUID()){
  const s=session(sid),r=state.sessions[sid];
  if(!s||complete(r)||!object(choices)||!time(at)||Object.keys(choices).some(id=>!s.questions.some(q=>q.id===id)))return false;
  const pending=s.questions.filter(q=>!r?.answers[q.id]);
  if(pending.some(q=>!Number.isInteger(choices[q.id])||choices[q.id]<0||choices[q.id]>=q.choices.length))return false;
  // Stage the whole submission so an incomplete set never records first answers.
  const next=clone(state);if(!start(next,sid,at))return false;
  for(const q of pending)if(!submit(next,sid,q.id,choices[q.id],at,eventId()))return false;
  state.sessions[sid]=next.sessions[sid];return true;
 }
 function merge(local,remote){
  local=repair(local);remote=repair(remote);
  const out=empty();
  for(const s of D.sessions){const a=local.sessions[s.id],b=remote.sessions[s.id];if(!a&&!b)continue;
   const r=clone(b||a);if(a&&b){
    r.startedAt=[a.startedAt,b.startedAt].sort()[0];
    for(const q of allQuestions(s)){const x=a.answers[q.id],y=b.answers[q.id];if(x&&!y)r.answers[q.id]=clone(x);
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
 function stats(r,sid=r?.id){const qs=session(sid)?.questions||D.sessions[0].questions,answers=qs.map(q=>r?.answers[q.id]).filter(Boolean),correct=answers.filter(a=>a.correct).length;return{answered:answers.length,total:qs.length,correct,wrong:answers.length-correct,percent:Math.round(correct/qs.length*1000)/10};}
 const studyDate=at=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
 function report(state){
  const finished=D.sessions.filter(s=>complete(state.sessions[s.id])),evidence=finished.slice(-3),scores=finished.map(s=>({id:s.id,number:s.number,...stats(state.sessions[s.id]),completedAt:state.sessions[s.id].completedAt})),days=[...new Set(scores.map(s=>studyDate(s.completedAt)))];
  const skills=D.skills.map(skill=>{const history=finished.flatMap(s=>s.questions.filter(q=>q.skill===skill.id).map(q=>({q,a:state.sessions[s.id].answers[q.id],session:s.number}))),items=history.filter(x=>evidence.some(s=>s.number===x.session)),facets={};
   for(const {q,a}of items){facets[q.facet]||={correct:0,total:0};facets[q.facet].total++;if(a.correct)facets[q.facet].correct++;}
   const correct=items.filter(x=>x.a.correct).length,total=items.length,required=Math.ceil(total*8/9),enough=evidence.length===3,strong=enough&&correct>=required&&Object.values(facets).every(f=>f.correct>0);
   return{...skill,correct,total,required,percent:total?Math.round(correct/total*100):null,strong,status:!enough?'Evidence building':strong?'Strong first-try evidence':'Needs more practice',facets,misses:history.filter(x=>!x.a.correct).map(({q,a,session})=>({questionId:q.id,session,facet:q.facet,prompt:q.prompt,selected:q.choices[a.choice],answer:q.choices[q.correct],explanation:q.explanation}))};
  });
  const recent=scores.slice(-2),accuracyReady=recent.length===2&&recent.every(s=>s.correct>=Math.ceil(s.total*22/24)),ready=scores.length>=3&&days.length>=2&&skills.every(s=>s.strong)&&accuracyReady;
  return{scores,skills,evidenceSessions:evidence.map(s=>s.number),studyDays:days.length,completed:scores.length,ready,accuracyReady,rule:'Complete at least three fresh sessions across at least two study days. In the most recent three finished sessions, reach each skill target (at least 8/9 accuracy, rounded up to a whole question) with a correct answer in every checked subskill. Reach at least 22/24 or 15/16 in each of the most recent two sessions.'};
 }
 root.HarrySkillEngine={empty,valid,start,submit,submitSet,merge,complete,stats,report,question,session};
})(typeof window==='undefined'?globalThis:window);
