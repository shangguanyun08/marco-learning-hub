(function(root){
  'use strict';
  const done=(q,e,r)=>!!r?.completedAt||!!e&&(e.attempts.length>=2||e.attempts.some(a=>a.choice===q.correct));
  const questions=(s,r)=>{
    const previous=r&&!r.questionVersion?root.MARCO_ISEE_PREVIOUS_PRACTICE?.find(b=>b.id===s.id):null;
    return s.questions.map(q=>previous?.questions.find(p=>p.source===q.source)||q).filter(q=>!r?.questionSources||r.questionSources.includes(q.source));
  };
  function start(s,at=new Date().toISOString()){return {id:root.crypto.randomUUID(),startedAt:at,completedAt:null,answers:{},pending:{},questionSources:s.questions.map(q=>q.source),questionVersion:'original-vr-v1',restart:true,...(s.timeLimitSeconds?{deadlineAt:new Date(Date.parse(at)+s.timeLimitSeconds*1000).toISOString()}: {})};}
  function submit(r,q,choice,at=new Date().toISOString()){
    if(r.completedAt||r.deadlineAt||done(q,r.answers[q.source])||!Number.isInteger(choice)||!q.choices[choice])return false;
    const e=r.answers[q.source]||={attempts:[]};if(e.attempts.some(a=>a.choice===choice))return false;
    e.attempts.push({choice,correct:choice===q.correct,at});if(r.pending)delete r.pending[q.source];return true;
  }
  function select(r,q,choice,at=new Date().toISOString()){
    if(!r.deadlineAt||r.completedAt||Date.parse(at)>=Date.parse(r.deadlineAt)||!Number.isInteger(choice)||!q.choices[choice])return false;
    (r.pending||={})[q.source]={choice,at};return true;
  }
  function finish(r,s,at=new Date().toISOString(),expired=false){
    if(r.completedAt)return false;
    for(const q of questions(s,r)){const choice=r.pending?.[q.source]?.choice??null;r.answers[q.source]={attempts:[{choice,correct:choice===q.correct,at}]};}
    r.completedAt=at;if(expired)r.timedOutAt=at;return true;
  }
  function expire(r,s,at=new Date().toISOString()){return !!s.timeLimitSeconds&&!!r?.deadlineAt&&!r.completedAt&&Date.parse(at)>=Date.parse(r.deadlineAt)&&finish(r,s,r.deadlineAt,true);}
  function stats(s,r){let first=0,attempted=0,finished=0,corrected=0;const qs=questions(s,r);for(const q of qs){const e=r?.answers[q.source];if(e?.attempts[0]?.choice!=null){attempted++;if(e.attempts[0].choice===q.correct)first++;else if(e.attempts[1]?.choice===q.correct)corrected++;}if(done(q,e,r))finished++;}return {first,attempted,finished,corrected,total:qs.length};}
  root.MarcoIseeEngine={done,start,submit,select,finish,expire,stats,questions};
})(typeof window==='undefined'?globalThis:window);
