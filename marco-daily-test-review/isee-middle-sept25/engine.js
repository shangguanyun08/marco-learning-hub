(function (root) {
  'use strict';
  const done = (question,entry,run) => !!run?.timedOutAt || (!!entry && (entry.attempts.length >= 2 || entry.attempts.some(a=>a.choice === question.correct)));
  function submit(run,question,choice,at) {
    if(run.timedOutAt || run.completedAt || (run.deadlineAt && Date.parse(at)>Date.parse(run.deadlineAt))) return false;
    if (!Number.isInteger(choice) || choice<0 || choice>=question.choices.length) return false;
    const entry=run.answers[question.source] || {attempts:[]};
    if (done(question,entry) || entry.attempts.some(a=>a.choice===choice)) return false;
    entry.attempts.push({choice,correct:choice===question.correct,at});
    run.answers[question.source]=entry;
    return true;
  }
  function stats(session,run) {
    let first=0,attempted=0,corrected=0,revealed=0,finished=0;
    session.questions.forEach(q=>{
      const e=run.answers[q.source];if(!e?.attempts.length)return;
      attempted++;
      if(e.attempts[0].choice===q.correct)first++;
      else if(e.attempts[1]?.choice===q.correct)corrected++;
      else if(e.attempts.length===2)revealed++;
      if(done(q,e))finished++;
    });
    if(run.timedOutAt)finished=session.questions.length;
    return {first,attempted,corrected,revealed,finished,total:session.questions.length,unanswered:session.questions.length-attempted,timedOut:!!run.timedOutAt,percent:Math.round(first/session.questions.length*100)};
  }
  function expire(run,session,at,pending={}) {
    if(!run.deadlineAt || run.completedAt || Date.parse(at)<Date.parse(run.deadlineAt))return false;
    for(const q of session.questions)if(Number.isInteger(pending[q.source]))submit(run,q,pending[q.source],run.deadlineAt);
    run.timedOutAt=run.deadlineAt;run.completedAt=run.deadlineAt;return true;
  }
  root.MarcoIseeEngine={done,submit,stats,expire};
})(typeof window==='undefined'?globalThis:window);
