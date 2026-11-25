(function(root){
  'use strict';
  const copy=x=>JSON.parse(JSON.stringify(x));
  function marks(paragraphs,input=[]){
    const out=[];
    for(let p=0;p<paragraphs.length;p++){
      const ranges=input.filter(m=>m.p===p&&Number.isInteger(m.start)&&Number.isInteger(m.end)&&m.start>=0&&m.end>m.start&&m.end<=paragraphs[p].length).sort((a,b)=>a.start-b.start);
      for(const r of ranges){const old=out.at(-1);if(old?.p===p&&r.start<=old.end)old.end=Math.max(old.end,r.end);else out.push({p,start:r.start,end:r.end});}
    }
    return out.map(m=>({...m,quote:paragraphs[m.p].slice(m.start,m.end)})).filter(m=>m.quote.trim());
  }
  const tokens=q=>q.prompt.match(/\S+\s*/g)||[];
  const resolved=list=>!!list?.some(a=>a.answerOK)||list?.length>=2;
  function check(q,paragraphs,run,at){
    const list=run.answers[q.id]||[],d=run.drafts[q.id];
    if(!d||resolved(list)||!Number.isInteger(d.choice)||d.choice<0||d.choice>3||list.some(a=>a.choice===d.choice))return null;
    const evidence=marks(paragraphs,d.marks),keywords=[...new Set(d.keywords||[])].filter(i=>Number.isInteger(i)&&i>=0&&i<tokens(q).length);
    if(!evidence.length||!keywords.length)return null;
    const answer={id:root.crypto?.randomUUID?.()||at,choice:d.choice,answerOK:d.choice===q.answer,checkedAt:at,marks:copy(evidence),keywords,keywordQuotes:keywords.map(i=>tokens(q)[i].trim()),why:String(d.why||'').slice(0,500)};
    (run.answers[q.id]??=[]).push(answer);
    run.drafts[q.id]=copy({...d,choice:null,updatedAt:at});run.updatedAt=at;
    return answer;
  }
  function suggestions(q,paragraphs){return q.evidence.map(quote=>{const p=paragraphs.findIndex(t=>t.includes(quote));return {p,start:paragraphs[p]?.indexOf(quote),end:paragraphs[p]?.indexOf(quote)+quote.length,quote};});}
  const api={copy,marks,tokens,resolved,check,suggestions};
  if(typeof module!=='undefined')module.exports=api;else root.EvidenceCore=api;
})(typeof window==='undefined'?globalThis:window);
