(function(root){
  'use strict';
  const D=root.MarcoReview2Data,SESSION='review2-v1',object=x=>x&&typeof x==='object'&&!Array.isArray(x);
  const empty=()=>({version:1,sessions:{[SESSION]:[{id:SESSION,answers:{}}]}});
  const answers=s=>s.sessions[SESSION][0].answers,ids=concept=>D.ids.filter(id=>D.questions[id].concept===concept);
  const attempts=(s,id)=>answers(s)[id]?.attempts||[],firstPass=(s,concept)=>ids(concept).every(id=>attempts(s,id).length);
  function stats(s,concept){const list=concept?ids(concept):D.ids,recorded=list.filter(id=>attempts(s,id).length),first=recorded.filter(id=>attempts(s,id)[0].correct).length;return {total:list.length,answered:recorded.length,first,complete:recorded.length===list.length,passed:recorded.length===list.length&&first>=3,corrected:recorded.filter(id=>!attempts(s,id)[0].correct&&attempts(s,id).some(a=>a.correct)).length};}
  function valid(s){
    if(!object(s)||s.version!==1||!object(s.sessions)||Object.keys(s.sessions).length!==1)return false;
    const runs=s.sessions[SESSION];if(!Array.isArray(runs)||runs.length!==1||runs[0].id!==SESSION||!object(runs[0].answers))return false;
    return Object.entries(runs[0].answers).every(([id,e])=>D.questions[id]&&object(e)&&Array.isArray(e.attempts)&&e.attempts.length>0&&e.attempts.every(a=>object(a)&&typeof a.id==='string'&&typeof a.at==='string'&&Number.isFinite(Date.parse(a.at))&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<4&&a.correct===(a.choice===D.questions[id].correct)));
  }
  function merge(a,b){
    const out=empty();
    for(const state of [a,b])if(valid(state))for(const [id,e]of Object.entries(answers(state))){
      const combined=[...attempts(out,id),...e.attempts],unique=new Map();
      for(const event of combined){const old=unique.get(event.id);if(!old||JSON.stringify(event)<JSON.stringify(old))unique.set(event.id,event);}
      answers(out)[id]={attempts:[...unique.values()].map(x=>({...x})).sort((x,y)=>x.at.localeCompare(y.at)||x.id.localeCompare(y.id))};
    }
    out.sessions[SESSION][0].answers=Object.fromEntries(Object.entries(answers(out)).sort(([a],[b])=>a.localeCompare(b)));return out;
  }
  function submit(s,id,choice,at=new Date().toISOString(),eventId=root.crypto.randomUUID()){
    const q=D.questions[id],previous=attempts(s,id);
    if(!q||!Number.isInteger(choice)||choice<0||choice>3||previous.some(a=>a.correct||a.choice===choice)||(previous.length&&!firstPass(s,q.concept)))return false;
    (answers(s)[id]||={attempts:[]}).attempts.push({id:eventId,choice,correct:choice===q.correct,at});return true;
  }
  root.MarcoReview2Engine={empty,valid,merge,answers,ids,attempts,firstPass,stats,submit};
})(typeof window==='undefined'?globalThis:window);
