/* Independent adaptive recall. Version 3 makes older page versions fail closed. */
(function(root){
 'use strict';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const stable=x=>JSON.stringify(x,(_k,v)=>object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
 const hash=text=>{let n=2166136261;for(const ch of text)n=Math.imul(n^ch.charCodeAt(0),16777619);return n>>>0;};
 function create(options){
  const {data}=options,storage=options.storage||root.localStorage,now=options.now||Date.now,fetcher=options.fetch||root.fetch?.bind(root),later=options.setTimeout||root.setTimeout.bind(root),cancel=options.clearTimeout||root.clearTimeout.bind(root);
  const prefix=data.appId+(options.disabled?':demo':''),key=prefix+':adaptive-v3',legacyKey=prefix+':rounds-v2',endpoint='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress?appId='+data.appId;
  const groups=new Map(data.sections.map(s=>[s.number,data.words.filter(w=>w.section===s.number).map(w=>w.id)]));
  const empty=()=>({kind:'word-meaning-check',version:3,reviewed:{},attempts:{},completed:{},legacyVersions:{}});
  const roundOK=n=>Number.isSafeInteger(n)&&n>0,stampOK=n=>Number.isSafeInteger(n)&&n>=0,idOK=id=>typeof id==='string'&&/^[a-zA-Z0-9-]{1,160}$/.test(id);
  const aid=(section,round,parent)=>`s${section}-r${round}${parent?'-'+parent:''}`;
  const sameSet=(a,b)=>Array.isArray(a)&&a.length===b.length&&new Set(a).size===b.length&&a.every(id=>b.includes(id));
  function shuffled(ids,seedText){const order=ids.slice();let seed=hash(data.appId+':'+seedText);for(let i=order.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}if(order.length>1&&order.every((id,i)=>id===ids[i]))order.push(order.shift());return order;}
  function cleanEntries(raw,allowed){const out={};for(const id of [...allowed].sort()){const row=raw?.[id];if(!object(row))continue;const clean={};for(const field of ['meaning','unknown']){const v=row[field];if(!object(v)||!stampOK(v.at))continue;if(field==='meaning'&&typeof v.value==='string'&&v.value.length<=240||field==='unknown'&&typeof v.value==='boolean')clean[field]={value:v.value,at:v.at};}if(Object.keys(clean).length)out[id]=clean;}return out;}
  function mergeEntries(a={},b={}){const out={};for(const id of [...new Set([...Object.keys(a),...Object.keys(b)])].sort()){out[id]={};for(const field of ['meaning','unknown']){const x=a[id]?.[field],y=b[id]?.[field];if(x||y)out[id][field]=!x?y:!y?x:x.at!==y.at?(x.at>y.at?x:y):(stable(x)>stable(y)?x:y);}}return out;}
  function validResponses(raw,order){return Array.isArray(raw)&&sameSet(raw.map(r=>r?.id),order)&&raw.every(r=>object(r)&&typeof r.meaning==='string'&&r.meaning.length<=240&&typeof r.unknown==='boolean'&&(r.unknown||r.meaning.trim()));}
  const responses=rows=>rows.map(r=>({id:r.id,meaning:r.meaning,unknown:r.unknown}));
  function migrate(raw){
   const out=empty();out.legacyVersions['v2-'+hash(stable(raw))]=clone(raw);
   for(const [section,ids]of groups){const old=raw.rounds?.[section+':1'],entries=mergeEntries(cleanEntries(raw.entries,ids),cleanEntries(old?.entries,ids)),order=sameSet(old?.order,ids)?old.order.slice():shuffled(ids,section+':1'),id=aid(section,1,null);
    if(Object.keys(entries).length)out.attempts[id]={section,round:1,parent:null,order,entries};
    for(const [copyId,c]of Object.entries(raw.roundSubmissions||{})){if(c?.section!==section||c.round!==1||!idOK(copyId))continue;const mapped=new Map((c.responses||[]).map(r=>[r.id,r])),rs=order.map(id=>mapped.get(id));if(validResponses(rs,order)&&Number.isFinite(Date.parse(c.at))){out.attempts[id]||={section,round:1,parent:null,order,entries};out.completed[copyId]={attemptId:id,at:c.at,responses:responses(rs)};}}
   }
   return out;
  }
  function normalize(raw){
   if(!object(raw)||raw.kind!=='word-meaning-check')return empty();
   if([1,2].includes(raw.version))return normalize(migrate(raw));
   const out=empty();if(raw.version!==3)return out;
   for(const section of groups.keys()){const r=raw.reviewed?.[section];if(object(r)&&stampOK(r.at))out.reviewed[section]={at:r.at};}
   for(const [id,r]of Object.entries(raw.legacyVersions||{}).sort()){if(idOK(id)&&object(r)&&r.kind==='word-meaning-check'&&[1,2].includes(r.version))out.legacyVersions[id]=clone(r);}
   const candidates=Object.entries(raw.attempts||{}).filter(([id,r])=>idOK(id)&&object(r)&&groups.has(r.section)&&roundOK(r.round)&&id===aid(r.section,r.round,r.parent)&&((r.round===1&&r.parent===null)||(r.round>1&&idOK(r.parent)))).sort((a,b)=>a[1].round-b[1].round||a[0].localeCompare(b[0]));
   for(const [id,r]of candidates){let allowed=groups.get(r.section);if(r.round>1){const p=out.completed[r.parent],a=p&&out.attempts[p.attemptId];if(!a||a.section!==r.section||a.round!==r.round-1)continue;allowed=p.responses.filter(x=>x.unknown).map(x=>x.id);if(!allowed.length)continue;}if(!sameSet(r.order,allowed))continue;
    out.attempts[id]={section:r.section,round:r.round,parent:r.parent,order:r.order.slice(),entries:cleanEntries(r.entries,allowed)};
    for(const [copyId,c]of Object.entries(raw.completed||{}).sort()){if(!idOK(copyId)||!object(c)||c.attemptId!==id||!Number.isFinite(Date.parse(c.at))||!validResponses(c.responses,r.order))continue;const mapped=new Map(c.responses.map(v=>[v.id,v]));out.completed[copyId]={attemptId:id,at:new Date(c.at).toISOString(),responses:responses(r.order.map(word=>mapped.get(word)))};}
   }
   return out;
  }
  function merge(a,b){a=normalize(a);b=normalize(b);const out=empty();for(const section of groups.keys()){const x=a.reviewed[section],y=b.reviewed[section];if(x||y)out.reviewed[section]=!x?y:!y?x:x.at>y.at?x:y;}
   for(const name of ['completed','legacyVersions'])for(const id of [...new Set([...Object.keys(a[name]),...Object.keys(b[name])])].sort()){const x=a[name][id],y=b[name][id];out[name][id]=!x?y:!y?x:stable(x)<stable(y)?x:y;}
   for(const id of [...new Set([...Object.keys(a.attempts),...Object.keys(b.attempts)])].sort()){const x=a.attempts[id],y=b.attempts[id],base=!x?y:!y?x:stable(x.order)<stable(y.order)?x:y;out.attempts[id]={...base,entries:mergeEntries(x?.entries,y?.entries)};}
   return normalize(out);
  }
  const read=k=>{try{return JSON.parse(storage.getItem(k)||'null');}catch{return null;}};
  try{const old=storage.getItem(legacyKey);if(old&&!storage.getItem(prefix+':before-adaptive'))storage.setItem(prefix+':before-adaptive',old);}catch{}
  let state=merge(read(key),read(legacyKey)),timer=null,busy=null,again=false,stopped=false,storageOK=true,ready=Boolean(options.disabled);
  let device=read(key+':device');if(typeof device!=='string'||!/^[a-zA-Z0-9-]{12,100}$/.test(device))device='adaptive-'+(root.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+'-'+now().toString(36));
  const snap=()=>clone(state);
  function persist(){try{storage.setItem(key,JSON.stringify(state));storage.setItem(key+':device',JSON.stringify(device));}catch{storageOK=false;}}
  function notify(){persist();options.onState?.(snap());}
  function status(kind,text){options.onStatus?.(kind,text+(storageOK?'':' Browser backup unavailable; keep this page open until saved online.'));}
  function stamp(){let value=Math.max(now(),1);for(const r of Object.values(state.reviewed))value=Math.max(value,r.at+1);for(const a of Object.values(state.attempts))for(const e of Object.values(a.entries))for(const f of Object.values(e))value=Math.max(value,f.at+1);return value;}
  function completion(id){return Object.entries(state.completed).filter(([,c])=>c.attemptId===id).sort((a,b)=>a[1].at.localeCompare(b[1].at)||a[0].localeCompare(b[0]))[0];}
  function chain(section){const all=groups.get(section);if(!all)return null;const rounds=[];let ids=all,parent=null,round=1;while(ids.length){const id=aid(section,round,parent),draft=state.attempts[id],order=draft?.order||shuffled(ids,section+':'+round+':'+(parent||'')),saved=completion(id),values=saved?saved[1].responses:order.map(id=>({id,meaning:draft?.entries[id]?.meaning?.value||'',unknown:draft?.entries[id]?.unknown?.value||false})),entries=Object.fromEntries(values.map(r=>[r.id,{meaning:r.meaning,unknown:r.unknown}])),unknown=values.filter(r=>r.unknown).length,written=values.filter(r=>!r.unknown&&r.meaning.trim()).length;
    rounds.push({id,section,round,parent,order:order.slice(),entries,recorded:written+unknown,written,unknown,total:order.length,completed:Boolean(saved),completionId:saved?.[0]||null,available:Boolean(state.reviewed[section]),copies:Object.entries(state.completed).filter(([,c])=>c.attemptId===id).map(([id,c])=>({id,...clone(c)}))});
    if(!saved)break;ids=saved[1].responses.filter(r=>r.unknown).map(r=>r.id);if(!ids.length)break;parent=saved[0];round++;
   }
   const last=rounds.at(-1),mastered=last.completed&&last.unknown===0;return {section,reviewed:Boolean(state.reviewed[section]),rounds,activeRound:last.round,mastered,remaining:mastered?0:last.total-last.written,known:all.length-last.total+last.written,total:all.length};
  }
  function roundView(section,round){return chain(section)?.rounds.find(r=>r.round===round)||null;}
  function queue(){if(options.disabled||stopped)return;if(timer!==null)cancel(timer);timer=later(()=>{timer=null;void flush();},550);}
  function changed(){notify();status(options.disabled?'local':'saving',options.disabled?'Preview only · Saved on this device.':'Saved on this device · Saving online…');queue();}
  function markReviewed(section){if(!groups.has(section))return {ok:false};if(!state.reviewed[section]){state.reviewed[section]={at:stamp()};changed();}return {ok:true};}
  function editRound(section,round,id,field,value){const v=roundView(section,round);if(!v?.available||v.completed||!v.order.includes(id)||!['meaning','unknown'].includes(field))return {ok:false};if(field==='meaning'){if(typeof value!=='string')return {ok:false};value=value.slice(0,240);}else if(typeof value!=='boolean')return {ok:false};const a=state.attempts[v.id]||={section,round,parent:v.parent,order:v.order.slice(),entries:{}};(a.entries[id]||={})[field]={value,at:stamp()};changed();return {ok:true};}
  function submitRound(section,round){const v=roundView(section,round);if(!v?.available||v.recorded!==v.total)return {ok:false,reason:'Write a meaning or choose “I don’t know” for every word in this round.'};if(v.completed)return {ok:true,unchanged:true};state.attempts[v.id]||={section,round,parent:v.parent,order:v.order.slice(),entries:{}};const id='done-'+(root.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+'-'+stamp().toString(36));state.completed[id]={attemptId:v.id,at:new Date(now()).toISOString(),responses:v.order.map(id=>({id,...v.entries[id]}))};changed();return {ok:true,id,remaining:v.unknown};}
  function receive(raw){if(raw&&(raw.kind!=='word-meaning-check'||![1,2,3].includes(raw.version)))throw Error('Unexpected saved format');state=merge(state,raw);notify();}
  async function request(init={}){const r=await fetcher(endpoint,{cache:'no-store',...init,...(root.AbortSignal?.timeout?{signal:root.AbortSignal.timeout(15000)}:{})});if(!r.ok)throw Error('Online save unavailable');return r.json();}
  const hasData=()=>Object.values(state).some(v=>object(v)&&Object.keys(v).length);
  async function flush(){if(options.disabled){ready=true;status('local','Preview only · Online sync is disabled.');return false;}if(stopped)return false;if(timer!==null){cancel(timer);timer=null;}if(busy){again=true;return busy;}
   busy=(async()=>{try{let remote=(await request()).progress;for(let tries=0;tries<5;tries++){if(stopped)return false;receive(remote?.state);ready=true;options.onState?.(snap());if(remote?.state.version===3&&stable(state)===stable(normalize(remote.state))||!remote&&!hasData()){status('live',remote?'Live online sync · Progress saved online.':'Live online sync ready · Start with Round 0.');return true;}const result=await request({method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({appId:data.appId,deviceId:device,studentName:'Marco',state:snap(),baseVersion:remote?.version??null,progressScore:data.sections.reduce((n,s)=>n+chain(s.number).known,0),clientUpdatedAt:new Date(now()).toISOString()})});if(!result.progress)throw Error('Save not confirmed');remote=result.progress;receive(remote.state);if(result.accepted&&stable(state)===stable(normalize(remote.state))){status('live','Live online sync · Progress saved online.');return true;}}throw Error('Another device is saving');}catch{ready=true;status('offline','Offline · Progress is saved on this device. Reconnect to save online.');options.onState?.(snap());return false;}})();try{return await busy;}finally{busy=null;if(again){again=false;queue();}}
  }
  async function restore(){const ok=await flush();return {ok:options.disabled||ok};}
  function receiveLocal(text){try{receive(JSON.parse(text));}catch{}}
  persist();return {key,legacyKey,endpoint,chain,roundView,markReviewed,editRound,submitRound,normalize,merge,snapshot:snap,start:flush,flush,restore,receiveLocal,isReady:()=>ready,stop(){stopped=true;if(timer!==null)cancel(timer);}};
 }
 root.AdaptiveMeaningSync={create};
})(typeof window==='object'?window:globalThis);
