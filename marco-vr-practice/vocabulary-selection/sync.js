/* Dedicated parent-selection record. No learner answers or course progress are written. */
(function(root){
 'use strict';
 const copy=v=>JSON.parse(JSON.stringify(v));
 const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
 function create(options){
  const data=options.data,ids=new Set(data.words.map(w=>w.id)),storage=options.storage||root.localStorage,now=options.now||Date.now;
  const fetcher=options.fetch||root.fetch?.bind(root),later=options.setTimeout||root.setTimeout.bind(root),cancel=options.clearTimeout||root.clearTimeout.bind(root);
  const key=data.appId+(options.demo?':demo':'')+':selection-v1';
  const endpoint='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress?appId='+encodeURIComponent(data.appId);
  const empty=()=>({kind:'vocabulary-selection',version:1,poolId:data.poolId,choices:{}});
  function normalize(raw){
   if(raw===null||raw===undefined)return empty();
   if(!obj(raw)||raw.kind!=='vocabulary-selection'||raw.version!==1||raw.poolId!==data.poolId||!obj(raw.choices))throw Error('Saved selection has an unexpected format.');
   const out=empty();
   for(const id of Object.keys(raw.choices).sort()){
    const c=raw.choices[id];if(!ids.has(id)||!obj(c)||typeof c.include!=='boolean'||!Number.isSafeInteger(c.at)||c.at<1||typeof c.op!=='string'||!/^[a-zA-Z0-9-]{1,120}$/.test(c.op))throw Error('Saved selection contains an invalid choice.');
    out.choices[id]={include:c.include,at:c.at,op:c.op};
   }
   return out;
  }
  function stable(value){return JSON.stringify(normalize(value));}
  function merge(a,b){a=normalize(a);b=normalize(b);const out=empty();for(const id of [...new Set([...Object.keys(a.choices),...Object.keys(b.choices)])].sort()){
   const x=a.choices[id],y=b.choices[id];out.choices[id]=!x?y:!y?x:x.at!==y.at?(x.at>y.at?x:y):x.op!==y.op?(x.op>y.op?x:y):x.include===y.include?x:(x.include?x:y);
  }return out;}
  let storageOK=true,state=empty(),busy=null,timer=null,again=false,stopped=false;
  try{state=normalize(JSON.parse(storage.getItem(key)||'null'));}catch{storageOK=false;}
  const uuid=()=>root.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+'-'+now().toString(36);
  let device;
  try{device=storage.getItem(key+':device');}catch{storageOK=false;}
  if(typeof device!=='string'||!/^[a-zA-Z0-9-]{12,100}$/.test(device))device='selection-'+uuid();
  function persist(){try{storage.setItem(key,JSON.stringify(state));storage.setItem(key+':device',device);}catch{storageOK=false;}}
  function status(kind,text){options.onStatus?.(kind,text+(storageOK?'':' Browser backup unavailable; download your list before closing.'));}
  function notify(){persist();options.onChange?.(copy(state));}
  function receive(raw){const next=merge(state,raw);if(stable(next)!==stable(state)){state=next;notify();}}
  function queue(){if(options.demo||stopped)return;if(timer!==null)cancel(timer);timer=later(()=>{timer=null;void flush();},450);}
  function setChoice(id,include){
   if(!ids.has(id)||typeof include!=='boolean')return false;
   const stamp=Math.max(1,now(),...Object.values(state.choices).map(v=>v.at+1));
   state.choices[id]={include,at:stamp,op:'choice-'+uuid()};state=normalize(state);notify();
   status(options.demo?'demo':'saving',options.demo?'Preview · Saved on this device only.':'Saved on this device · Saving online…');queue();return true;
  }
  async function request(init={}){const result=await fetcher(endpoint,{cache:'no-store',...init,...(root.AbortSignal?.timeout?{signal:root.AbortSignal.timeout(12000)}:{})});if(!result.ok)throw Error('Online service unavailable.');return result.json();}
  async function flush(){
   if(options.demo){status('demo','Preview · Online saving is disabled.');return true;}
   if(stopped)return false;if(timer!==null){cancel(timer);timer=null;}if(busy){again=true;return busy;}
   busy=(async()=>{
    try{
     let remote=(await request()).progress;
     for(let attempt=0;attempt<5;attempt++){
      if(stopped)return false;receive(remote?.state);
      if(stable(state)===stable(remote?.state)){status('live',remote?'Saved online · Selections are up to date.':'Online saving ready · Choose any word.');return true;}
      const payload={appId:data.appId,studentName:'Marco',deviceId:device,state:copy(state),baseVersion:remote?.version??null,progressScore:Object.keys(state.choices).length,clientUpdatedAt:new Date(now()).toISOString()};
      const result=await request({method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      if(!result.progress)throw Error('Online save was not confirmed.');remote=result.progress;receive(remote.state);
      if(result.accepted&&stable(state)===stable(remote.state)){status('live','Saved online · Selections are up to date.');return true;}
     }
     throw Error('Another device is saving.');
    }catch(error){status('offline',/format|invalid choice/.test(error.message)?'Saved online format could not be read. Your local choices remain available to download.':'Offline · Choices stay on this device. Use Save online to retry.');return false;}
   })();
   try{return await busy;}finally{busy=null;if(again){again=false;queue();}}
  }
  persist();
  return {key,endpoint,snapshot:()=>copy(state),normalize,merge,setChoice,flush,start:flush,
   receiveLocal(text){try{receive(JSON.parse(text));queue();}catch{}},
   stop(){stopped=true;if(timer!==null)cancel(timer);}
  };
 }
 root.VocabularySelectionSync={create};
})(typeof window==='object'?window:globalThis);
