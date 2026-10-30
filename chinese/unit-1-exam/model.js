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
  const api={makeItems,merge,status,record};
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.Unit1Model=api;
})(typeof window==='object'?window:null);
