(function(root){
  'use strict';
  function makeItems(data){
    return data.groups.flatMap(g=>[
      ...g.words.map((text,i)=>({id:g.id+'-w'+(i+1),group:g.id,label:g.label,kind:'words',text,chunks:[]})),
      {id:g.id+'-star',group:g.id,label:g.label,kind:'sentences',text:g.paragraph,chunks:g.chunks}
    ]);
  }
  function merge(a,b){
    const out={version:1,records:{}};
    for(const id of new Set([...Object.keys(a?.records||{}),...Object.keys(b?.records||{})])){
      const attempts=new Map();
      for(const attempt of [...(a?.records?.[id]||[]),...(b?.records?.[id]||[])])attempts.set(attempt.id,attempt);
      out.records[id]=[...attempts.values()].sort((x,y)=>x.at.localeCompare(y.at)||x.id.localeCompare(y.id));
    }
    return out;
  }
  function status(attempts){
    if(!attempts?.length)return 'new';
    const last=attempts[attempts.length-1];
    return last.correct&&!last.hinted?'mastered':last.correct?'hinted':'retry';
  }
  function record(state,id,attempt){return merge(state,{records:{[id]:[attempt]}});}
  function importLegacy(state,legacy,at){
    let next=state,imported=0;
    if(legacy?.version!==1)return {state:next,imported};
    const useful=s=>s&&typeof s==='object'&&(s.correct===true||s.hinted===true||s.wrong===true);
    function add(id,s,extra={}){
      if(next.records?.[id]?.length)return;
      next=record(next,id,{id:'legacy-blue-v1:'+id,at,correct:s.correct===true,hinted:s.hinted===true||s.wrong===true,imported:true,...extra});imported++;
    }
    for(let i=0;i<21;i++){const s=legacy.words?.states?.[i];if(useful(s))add('b8-w'+(i+1),s);}
    const chunks=Array.from({length:5},(_,i)=>legacy.sentences?.states?.[i]);
    if(chunks.some(useful)){
      const snapshot=chunks.map(s=>({correct:s?.correct===true,hinted:s?.hinted===true,wrong:s?.wrong===true}));
      add('b8-star',{correct:chunks.every(s=>s?.correct===true),hinted:chunks.some(s=>s?.hinted===true||s?.wrong===true)},{legacyChunks:snapshot});
    }
    return {state:next,imported};
  }
  const api={makeItems,merge,status,record,importLegacy};
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.Unit1Model=api;
})(typeof window==='object'?window:null);
