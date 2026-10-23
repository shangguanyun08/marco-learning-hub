import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('word-checklist-sync.js',import.meta.url),'utf8');
const rows=[{id:'t1-q10',type:'synonym',choices:['a','b','c','d']},{id:'t4-q40',type:'sentence completion',choices:['e','f','g','h']}];
function storage(initial={}){const data=new Map(Object.entries(initial));return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};}
function server(){let progress=null;const calls=[];return {calls,get progress(){return structuredClone(progress);},async fetch(url,options={}){assert.match(url,/appId=marco-vr-word-checklist-v1$/);calls.push(options.method||'GET');if(options.method!=='POST')return {ok:true,json:async()=>({progress:structuredClone(progress)})};const p=JSON.parse(options.body),accepted=!progress||p.baseVersion===progress.version;if(accepted)progress={appId:p.appId,state:p.state,version:(progress?.version||0)+1};return {ok:true,json:async()=>({accepted,progress:structuredClone(progress)})};}};}
function client(s,local=storage(),extra={}){const root={setTimeout,clearTimeout},statuses=[];vm.runInNewContext(code,{window:root});let time=1000;const api=root.MarcoVRChecklistSync.create({rows,storage:local,fetch:s.fetch.bind(s),now:()=>time++,setTimeout:()=>1,clearTimeout(){},onStatus:(kind,text)=>statuses.push({kind,text}),...extra});return {api,local,statuses,view:()=>JSON.parse(JSON.stringify(api.view()))};}
test('legacy browser ticks and diagnoses migrate without loss and reload from the server',async()=>{
 const s=server(),local=storage({'marco-vr-word-checklist-v1':JSON.stringify({words:{'t1-q10-stem':true,'t1-q10-0':false},diagnoses:{'t1-q10':'nuance'}})}),a=client(s,local);
 assert.equal(a.view().words['t1-q10-stem'],true);assert.equal(a.view().words['t1-q10-0'],false);await a.api.start();assert.equal(a.statuses.at(-1).kind,'live');assert.equal(s.progress.state.words['t1-q10-stem'].value,true);
 const b=client(s);await b.api.start();assert.deepEqual(b.view(),a.view());assert.equal(s.calls.filter(c=>c==='POST').length,1);
});
test('an empty device never uploads a blank record or overwrites filled observations',async()=>{
 const s=server(),a=client(s);await a.api.start();assert.equal(s.progress,null);assert.deepEqual(s.calls,['GET']);a.api.word('t1-q10-stem',true);await a.api.flush();const before=JSON.stringify(s.progress);const b=client(s);await b.api.start();assert.equal(b.view().words['t1-q10-stem'],true);assert.equal(JSON.stringify(s.progress),before);
});
test('concurrent devices merge independent edits through version-conflict retries',async()=>{
 const s=server(),a=client(s),b=client(s);a.api.word('t1-q10-stem',true);b.api.diagnosis('t4-q40','unfamiliar');await Promise.all([a.api.flush(),b.api.flush()]);await a.api.flush();await b.api.flush();assert.deepEqual(a.view(),b.view());assert.equal(a.view().words['t1-q10-stem'],true);assert.equal(a.view().diagnoses['t4-q40'],'unfamiliar');
});
test('unchecks and explicit clears survive stale or legacy devices',async()=>{
 const s=server(),a=client(s);a.api.word('t1-q10-stem',true);a.api.diagnosis('t1-q10','common');await a.api.flush();const stale=client(s);await stale.api.start();a.api.word('t1-q10-stem',false);a.api.diagnosis('t1-q10','nuance');await a.api.flush();await stale.api.flush();assert.equal(stale.view().words['t1-q10-stem'],false);assert.equal(stale.view().diagnoses['t1-q10'],'nuance');
 a.api.clear();await a.api.flush();await stale.api.flush();assert.ok(Object.values(stale.view().words).every(v=>v===false));assert.ok(Object.values(stale.view().diagnoses).every(v=>v===null));
 const legacy=client(s,storage({'marco-vr-word-checklist-v1':JSON.stringify({words:{'t1-q10-stem':true},diagnoses:{'t1-q10':'common'}})}));await legacy.api.start();assert.equal(legacy.view().words['t1-q10-stem'],false);assert.equal(legacy.view().diagnoses['t1-q10'],null);
});
test('offline changes remain local, recover on reconnect, and ignore unrecognized fields',async()=>{
 const s=server(),local=storage(),a=client(s,local,{fetch:async()=>{throw Error('offline');}});a.api.word('t1-q10-stem',true);a.api.word('not-a-word',true);a.api.diagnosis('t1-q10','invalid');await a.api.flush();assert.equal(a.statuses.at(-1).kind,'offline');assert.equal(a.view().words['not-a-word'],undefined);
 const reconnected=client(s,local);await reconnected.api.start();assert.equal(s.progress.state.words['t1-q10-stem'].value,true);assert.equal(reconnected.statuses.at(-1).kind,'live');
});
test('preview edits never call the online service',async()=>{
 const s=server(),a=client(s,storage(),{disabled:true,demo:true});a.api.word('t1-q10-stem',true);await a.api.start();await a.api.flush();assert.equal(s.calls.length,0);assert.equal(a.statuses.at(-1).kind,'local');
});
