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
  function highlight(paragraphs,input){
    const ranges=marks(paragraphs,input);
    if(!ranges.length)return null;
    for(let i=1;i<ranges.length;i++){
      const before=ranges[i-1],after=ranges[i];
      if(after.p!==before.p+1||before.end!==paragraphs[before.p].length||after.start!==0)return null;
    }
    return {ranges,quote:ranges.map(m=>m.quote.trim()).join(' ')};
  }
  const resolved=list=>!!list?.length;
  function check(q,paragraphs,run,at){
    const list=run.answers[q.id]||[],d=run.drafts[q.id];
    if(!d||resolved(list)||!Number.isInteger(d.choice)||d.choice<0||d.choice>3||list.some(a=>a.choice===d.choice))return null;
    const selected=highlight(paragraphs,d.marks);
    if(!selected)return null;
    const answer={id:root.crypto?.randomUUID?.()||at,choice:d.choice,answerOK:d.choice===q.answer,checkedAt:at,marks:copy(selected.ranges),highlight:copy(selected)};
    (run.answers[q.id]??=[]).push(answer);
    run.drafts[q.id]=copy({...d,choice:null,updatedAt:at});run.updatedAt=at;
    return answer;
  }
  function suggestions(q,paragraphs){return q.evidence.map(quote=>{const p=paragraphs.findIndex(t=>t.includes(quote));return {p,start:paragraphs[p]?.indexOf(quote),end:paragraphs[p]?.indexOf(quote)+quote.length,quote};});}
  const api={copy,marks,highlight,resolved,check,suggestions};
  if(typeof module!=='undefined')module.exports=api;else root.EvidenceCore=api;
})(typeof window==='undefined'?globalThis:window);
