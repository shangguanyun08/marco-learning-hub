(function (root) {
  'use strict';
  const normalize = value => {
    const text=String(value).trim().replace(/[ ,]/g,'');
    return /^\d+$/.test(text)&&Number.isSafeInteger(Number(text))?String(Number(text)):null;
  };
  const isCorrect = (question,choice) => question.type==='number'?normalize(choice)!==null&&Number(normalize(choice))===question.correct:choice===question.correct;
  const done = (question,entry) => !!entry && (entry.attempts.length >= 2 || entry.attempts.some(a=>isCorrect(question,a.choice)));
  function submit(run,question,choice,at) {
    if(question.type==='number'){choice=normalize(choice);if(choice===null)return false;}
    else if (!Number.isInteger(choice) || choice<0 || choice>=question.choices.length) return false;
    const entry=run.answers[question.source] || {attempts:[]};
    if (done(question,entry) || entry.attempts.some(a=>a.choice===choice)) return false;
    entry.attempts.push({choice,correct:isCorrect(question,choice),at});
    run.answers[question.source]=entry;
    return true;
  }
  function stats(session,run) {
    let first=0,attempted=0,corrected=0,revealed=0,finished=0;
    session.questions.forEach(q=>{
      const e=run.answers[q.source];if(!e?.attempts.length)return;
      attempted++;
      if(isCorrect(q,e.attempts[0].choice))first++;
      else if(e.attempts[1]&&isCorrect(q,e.attempts[1].choice))corrected++;
      else if(e.attempts.length===2)revealed++;
      if(done(q,e))finished++;
    });
    return {first,attempted,corrected,revealed,finished,total:session.questions.length,percent:Math.round(first/session.questions.length*100)};
  }
  root.HarrySeptEngine={done,submit,stats,isCorrect,normalize};
})(typeof window==='undefined'?globalThis:window);
