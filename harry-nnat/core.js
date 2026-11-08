(function(root){
  'use strict';
  function attempts(q,r){return (r?.answers?.[q.id]||[]).filter(a=>Number.isInteger(a.choice)&&a.choice>=0&&a.choice<5&&Number.isFinite(Date.parse(a.checkedAt)));}
  function resolved(q,r){const aa=attempts(q,r);return aa.some(a=>a.choice===q.answer)||aa.length>=2;}
  function questions(course,r){return (r?.questionIds||[]).map(id=>course.questions.find(q=>q.id===id)).filter(Boolean);}
  function scores(course,r){const qs=questions(course,r);return {total:qs.length,answered:qs.filter(q=>attempts(q,r).length).length,first:qs.filter(q=>attempts(q,r)[0]?.choice===q.answer).length,resolved:qs.filter(q=>resolved(q,r)).length};}
  function check(course,r,q,choice,at){
    if(!r.questionIds.includes(q.id)||resolved(q,r)||!Number.isInteger(choice)||choice<0||choice>=5||!Number.isFinite(Date.parse(at)))return null;
    const answer={choice,checkedAt:at,answerOK:choice===q.answer};
    ((r.answers??={})[q.id]??=[]).push(answer);(r.drafts??={})[q.id]={choice,updatedAt:at};r.updatedAt=at;
    if(scores(course,r).resolved===r.questionIds.length)r.completedAt=at;
    return answer;
  }
  function ids(course,mode){
    if(mode==='mixed')return course.questions.filter(q=>q.level==='challenge').map(q=>q.id);
    if(mode==='warmup')return course.questions.filter(q=>q.level!=='challenge').map(q=>q.id);
    return [...(course.groups.find(g=>g.id===mode)?.questionIds||[])];
  }
  const api={attempts,resolved,questions,scores,check,ids};
  if(typeof module!=='undefined')module.exports=api;else root.NNATCore=api;
})(typeof window==='undefined'?{}:window);
