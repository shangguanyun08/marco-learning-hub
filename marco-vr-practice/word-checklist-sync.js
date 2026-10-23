/* Checklist-only sync. Never reads or writes scored practice namespaces. */
(function(root){
 'use strict';
 const APP_ID='marco-vr-word-checklist-v1',ENDPOINT='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress?appId='+APP_ID;
 const kinds=['common','nuance','unfamiliar'];
 function create(options){
  const rows=options.rows,wordIds=new Set(rows.flatMap(r=>[...r.choices.map((_,i)=>r.id+'-'+i),...(r.type==='synonym'?[r.id+'-stem']:[])])),rowIds=new Set(rows.map(r=>r.id));
  const suffix=options.demo?':demo':'',legacyKey=APP_ID+suffix,key='marco-vr-word-checklist-v2'+suffix,deviceKey='marco-vr-word-checklist-device'+suffix;
  const storage=options.storage,now=options.now||Date.now,fetcher=options.fetch||root.fetch?.bind(root),later=options.setTimeout||root.setTimeout.bind(root),cancel=options.clearTimeout||root.clearTimeout.bind(root);
  let timer=null,busy=null,again=false,stopped=false,storageOK=true;
  const empty=()=>({kind:'vr-word-checklist',version:2,words:{},diagnoses:{}}),isObject=x=>x&&typeof x==='object'&&!Array.isArray(x);
  function normalize(x){const result=empty();if(!isObject(x)||x.kind!==result.kind||x.version!==2)return result;for(const [group,ids,valid] of [['words',wordIds,v=>typeof v==='boolean'],['diagnoses',rowIds,v=>v===null||kinds.includes(v)]])if(isObject(x[group]))for(const id of [...ids].sort()){const v=x[group][id];if(isObject(v)&&valid(v.value)&&Number.isSafeInteger(v.at)&&v.at>=0)result[group][id]={value:v.value,at:v.at};}return result;}
  function merge(a,b){const out=empty();for(const group of ['words','diagnoses'])for(const id of [...new Set([...Object.keys(a[group]),...Object.keys(b[group])])].sort()){const x=a[group][id],y=b[group][id];out[group][id]=!x?y:!y?x:x.at>y.at?x:y.at>x.at?y:JSON.stringify(x.value)>JSON.stringify(y.value)?x:y;}return normalize(out);}
  function read(k){try{return JSON.parse(storage?.getItem(k)||'null');}catch{return null;}}
  let state=normalize(read(key));
  // Old untimestamped checks are imported only once, and can never beat a later edit or clear.
  if(!read(key)?.legacyImported){const old=read(legacyKey),migrated=empty();if(isObject(old)){for(const id of wordIds)if(typeof old.words?.[id]==='boolean')migrated.words[id]={value:old.words[id],at:0};for(const id of rowIds)if(kinds.includes(old.diagnoses?.[id]))migrated.diagnoses[id]={value:old.diagnoses[id],at:0};}state=merge(state,migrated);}
  let device=read(deviceKey);if(typeof device!=='string'||!/^[a-zA-Z0-9-]{12,100}$/.test(device))device='audit-'+(root.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+'-'+now().toString(36));
  function view(){const out={words:{},diagnoses:{}};for(const group of ['words','diagnoses'])for(const [id,e] of Object.entries(state[group]))out[group][id]=e.value;return out;}
  function persist(){try{if(!storage)throw Error();storage.setItem(key,JSON.stringify({...state,legacyImported:true}));storage.setItem(legacyKey,JSON.stringify(view()));storage.setItem(deviceKey,JSON.stringify(device));}catch{storageOK=false;}}
  function notify(){persist();options.onState?.(view());}
  function status(kind,text){if(!storageOK)text+=' Browser backup unavailable; keep this page open until saved online.';options.onStatus?.(kind,text);}
  function stamp(){return Math.max(now(),1,...['words','diagnoses'].flatMap(g=>Object.values(state[g]).map(e=>e.at+1)));}
  function queue(){if(options.disabled||stopped)return;if(timer!==null)cancel(timer);timer=later(()=>{timer=null;void flush();},350);}
  function edit(group,id,value){state[group][id]={value,at:stamp()};notify();status(options.disabled?'local':'saving',options.disabled?'Local checklist saved · Online sync is disabled in this preview.':'Saved on this device · Saving online…');queue();}
  function receive(remote){if(remote&&(!isObject(remote.state)||remote.state.kind!=='vr-word-checklist'||remote.state.version!==2))throw Error('Unexpected online checklist format.');state=merge(state,normalize(remote?.state));notify();}
  const fingerprint=s=>JSON.stringify(normalize(s));
  async function json(url,init){const response=await fetcher(url,{cache:'no-store',...init,...(root.AbortSignal?.timeout?{signal:root.AbortSignal.timeout(15000)}:{})});if(!response.ok)throw Error('Online save unavailable.');return response.json();}
  async function flush(){
   if(options.disabled||stopped)return;if(timer!==null){cancel(timer);timer=null;}if(busy){again=true;return busy;}
   busy=(async()=>{status('saving','Checking online checklist…');try{
    let remote=(await json(ENDPOINT)).progress;
    for(let tries=0;tries<5;tries++){
     if(stopped)return;receive(remote);
     if((remote&&fingerprint(state)===fingerprint(remote.state))||(!remote&&!Object.keys(state.words).length&&!Object.keys(state.diagnoses).length)){status('live',remote?'Saved online · Live sync across devices.':'Online sync ready · No selections saved yet.');return;}
     const snapshot=normalize(state),response=await json(ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({appId:APP_ID,deviceId:device,studentName:'Marco',state:snapshot,baseVersion:remote?.version??null,progressScore:Object.keys(snapshot.words).length+Object.keys(snapshot.diagnoses).length,clientUpdatedAt:new Date(now()).toISOString()})});
     if(!response.progress)throw Error('Save was not confirmed.');remote=response.progress;receive(remote);
     if(response.accepted&&fingerprint(state)===fingerprint(remote.state)){status('live','Saved online · Live sync across devices.');return;}
    }
    throw Error('Another device is saving; retry shortly.');
   }catch{status('offline','Not synced yet · Your selections are kept on this device. Use Save online or reconnect.');}
   })();try{await busy;}finally{busy=null;if(again){again=false;queue();}}
  }
  persist();
  return {view,flush,start(){if(options.disabled){status('local','Local checklist · Online sync disabled in preview or offline HTML.');return Promise.resolve();}return flush();},word(id,value){if(wordIds.has(id)&&typeof value==='boolean')edit('words',id,value);},diagnosis(id,value){if(rowIds.has(id)&&(value===null||kinds.includes(value)))edit('diagnoses',id,value);},clear(){const at=stamp();for(const id of wordIds)state.words[id]={value:false,at};for(const id of rowIds)state.diagnoses[id]={value:null,at};notify();status(options.disabled?'local':'saving','Checklist cleared on this device · '+(options.disabled?'Preview only.':'Saving online…'));queue();},stop(){stopped=true;if(timer!==null)cancel(timer);},snapshot:()=>normalize(state)};
 }
 root.MarcoVRChecklistSync={APP_ID,ENDPOINT,create};
})(typeof window==='object'?window:globalThis);
