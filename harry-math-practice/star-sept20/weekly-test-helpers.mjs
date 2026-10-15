// Content and persistence tests open later days with completed prerequisites.
// Lock tests use explicit states instead of this helper.
export function completedRun(session,first=12,id=session.id){
 const at='2026-10-12T16:00:00.000Z',run={id,startedAt:at,completedAt:at,answers:{}};
 for(const [i,q] of session.questions.entries())run.answers[q.source]={attempts:[{choice:(q.correct+(i<first?0:1))%4,correct:i<first,at},...(i<first?[]:[{choice:q.correct,correct:true,at}])]};
 return run;
}
export function prerequisites(w,query,state){
 const id=new URLSearchParams(query).get('session'),day=Number(id?.match(/^week-oct12-(\d)/)?.[1]);
 if(!day)return state;
 const result=JSON.parse(JSON.stringify(state||{version:1,sessions:{}}));
 for(let n=1;n<day;n++){const s=w.HARRY_SEPT_PRACTICE.find(x=>x.id==='week-oct12-'+n);if(!result.sessions[s.id])result.sessions[s.id]=[completedRun(s)];}
 return result;
}
