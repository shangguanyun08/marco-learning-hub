(function(root){
  'use strict';
  const variants=typeof module!=='undefined'?require('./variants.js'):root.NNATVariants;
  function attempts(q,r){return (r?.answers?.[q.id]||[]).filter(a=>Number.isInteger(a.choice)&&a.choice>=0&&a.choice<5&&Number.isFinite(Date.parse(a.checkedAt)));}
  function resolved(q,r){const aa=attempts(q,r);return aa.some(a=>a.choice===q.answer)||aa.length>=2;}
  function doubleWrong(q,r){const aa=attempts(q,r);return aa.length>=2&&aa.slice(0,2).every(a=>a.choice!==q.answer);}
  function questions(course,r){return (r?.questionIds||[]).map(id=>course.questions.find(q=>q.id===id)||variants.get(course,id)).filter(Boolean);}
  function scores(course,r){const qs=questions(course,r);return {total:qs.length,answered:qs.filter(q=>attempts(q,r).length).length,first:qs.filter(q=>attempts(q,r)[0]?.choice===q.answer).length,resolved:qs.filter(q=>resolved(q,r)).length};}
  function round(r){return r?.round===2||r?.round===3?r.round:1;}
  function firstWrongIds(course,r){return questions(course,r).filter(q=>{const first=attempts(q,r)[0];return first&&first.choice!==q.answer;}).map(q=>q.id);}
  function canAdvance(course,r){const s=scores(course,r);return round(r)<3&&s.total>0&&s.answered===s.total;}
  // First checks identify a parent even if sync renames a conflicting history.
  // Optional same-round retries never change which child round it belongs to.
  function firstPassKey(course,r){return JSON.stringify(questions(course,r).map(q=>{const a=attempts(q,r)[0];return [q.id,a?.choice??null,a?.checkedAt??null];}).sort((a,b)=>a[0].localeCompare(b[0])));}
  function childOf(course,child,parent){return !!parent&&round(child)===round(parent)+1&&child.sourceRoot===(parent.syncRoot||parent.id)&&child.sourceFirstPass===firstPassKey(course,parent);}
  function reviewRun(course,parent,id,at){
    if(!canAdvance(course,parent)||!firstWrongIds(course,parent).length||!id||!Number.isFinite(Date.parse(at)))return null;
    const next=round(parent)+1,missed=new Set(firstWrongIds(course,parent));
    return {id,round:next,questionSet:variants.VERSION,sourceRunId:parent.id,sourceRoot:parent.syncRoot||parent.id,sourceFirstPass:firstPassKey(course,parent),questionIds:questions(course,parent).filter(q=>missed.has(q.id)).map(q=>variants.idFor(q,next)),startedAt:at,position:0,completedAt:null,answers:{},drafts:{}};
  }
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
  const api={attempts,resolved,doubleWrong,questions,scores,check,ids,round,firstWrongIds,canAdvance,firstPassKey,childOf,reviewRun};
  if(typeof module!=='undefined')module.exports=api;else root.NNATCore=api;
})(typeof window==='undefined'?{}:window);
