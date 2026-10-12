(function(root){
  'use strict';
  const bank=root.MARCO_ISEE_PRACTICE;
  const done=(q,entry)=>!!entry&&(entry.attempts.length===2||entry.attempts.some(a=>a.choice===q.correct));
  const start=(session,at=new Date().toISOString())=>({id:root.crypto.randomUUID(),startedAt:at,completedAt:null,questionSources:session.questions.map(q=>q.source),answers:{},pending:{}});
  function submit(run,q,choice,at=new Date().toISOString()){
    if(run.completedAt||done(q,run.answers[q.source])||!Number.isInteger(choice)||choice<0||choice>=q.choices.length)return false;
    const entry=run.answers[q.source]||={attempts:[]};
    if(entry.attempts.some(a=>a.choice===choice))return false;
    entry.attempts.push({choice,correct:choice===q.correct,at});delete run.pending[q.source];return true;
  }
  function stats(session,run){
    let first=0,attempted=0,finished=0,corrected=0;
    for(const q of session.questions){const entry=run?.answers[q.source];if(entry?.attempts.length){attempted++;if(entry.attempts[0].choice===q.correct)first++;else if(entry.attempts[1]?.choice===q.correct)corrected++;}if(done(q,entry))finished++;}
    return {first,attempted,finished,corrected,total:session.questions.length};
  }
  root.MarcoTest3Engine={bank,done,start,submit,stats};
})(typeof window==='undefined'?globalThis:window);
