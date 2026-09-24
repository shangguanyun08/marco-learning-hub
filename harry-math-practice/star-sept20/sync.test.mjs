import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const code=readFileSync(new URL('./sync.js',import.meta.url),'utf8');
const json=x=>JSON.parse(JSON.stringify(x));
const empty=()=>({version:1,sessions:{}});
const at='2026-09-23T00:00:00.000Z';
const run=(id,answers={},restart=false)=>({id,startedAt:at,completedAt:null,answers,restart});
const answer=(choice,correct=false,when=at)=>({attempts:[{choice,correct,at:when}]});
function client(initial,fetcher){
 const dom=new JSDOM('',{url:'https://example.com',runScripts:'outside-only'}),w=dom.window;
 w.AbortController=AbortController;w.eval(code);let state=json(initial),status;
 const sync=w.HarrySeptSync.create({getState:()=>state,onRemote:s=>{state=json(s)},onStatus:(kind,message)=>{status={kind,message}},fetcher});
 return {w,sync,get state(){return state},get status(){return status},set state(s){state=json(s)},close(){sync.stop();w.close()}};
}
function server(){let record=null,online=true,conflict=null;
 return {get record(){return json(record)},set online(v){online=v},set conflict(v){conflict=v},async fetch(_url,options){
   if(!online)throw new Error('offline');
   if(options.method==='POST'){
     if(conflict){record={state:conflict,version:(record?.version||0)+1};conflict=null;}
     const body=JSON.parse(options.body),accepted=record?body.baseVersion===record.version:body.baseVersion===null;
     if(accepted)record={state:body.state,version:(record?.version||0)+1};
     return {ok:true,json:async()=>json({accepted,progress:record})};
   }
   return {ok:true,json:async()=>json({progress:record})};
 }};
}
test('existing device history migrates and a fresh device restores scores and retries',async()=>{
 const api=server(),saved={version:1,sessions:{'similar-a':[run('ipad',{4:{attempts:[{choice:0,correct:false,at},{choice:1,correct:true,at:'2026-09-23T00:01:00.000Z'}]}})]}};
 const a=client(saved,api.fetch),b=client(empty(),api.fetch);
 try{await a.sync.start();await b.sync.start();assert.deepEqual(b.state,a.state);assert.equal(b.state.sessions['similar-a'][0].answers[4].attempts[0].correct,false);assert.equal(b.status.kind,'live');}
 finally{a.close();b.close();}
});
test('offline devices merge separate runs and sessions without discarding either history',async()=>{
 const api=server(),a=client({version:1,sessions:{'similar-a':[run('ipad',{4:answer(0)})]}},api.fetch),b=client({version:1,sessions:{'similar-b':[run('phone',{5:answer(1,true)})]}},api.fetch);
 try{api.online=false;await a.sync.start();assert.equal(a.status.kind,'offline');api.online=true;await b.sync.start();await a.sync.refresh();await b.sync.refresh();assert.deepEqual(a.state,b.state);assert.equal(Object.keys(a.state.sessions).length,2);}
 finally{a.close();b.close();}
});
test('a compare-and-swap conflict is merged and retried instead of replacing remote work',async()=>{
 const api=server(),a=client({version:1,sessions:{'similar-a':[run('same',{4:answer(0)})]}},api.fetch);
 try{api.conflict={version:1,sessions:{'similar-a':[run('same',{5:answer(2,true)})]}};await a.sync.start();assert.deepEqual(Object.keys(api.record.state.sessions['similar-a'][0].answers),['4','5']);assert.equal(a.status.kind,'live');}
 finally{a.close();}
});
test('different first tries stay separate and a repeated merge is stable',()=>{
 const api=server(),c=client(empty(),api.fetch),merge=c.w.HarrySeptSync.merge;
 try{const a={version:1,sessions:{original:[run('same',{4:answer(0)})]}},b={version:1,sessions:{original:[run('same',{4:answer(1,true)})]}};
 const merged=json(merge(a,b));assert.equal(merged.sessions.original.length,2);assert.deepEqual(merged.sessions.original.map(r=>r.answers[4].attempts.length),[1,1]);assert.deepEqual(json(merge(b,a)),merged);assert.deepEqual(json(merge(merged,b)),merged);}
 finally{c.close();}
});
test('an untouched page cannot hide synced work; an explicit repeat remains saved',()=>{
 const api=server(),c=client(empty(),api.fetch),merge=c.w.HarrySeptSync.merge;
 try{const saved={version:1,sessions:{original:[run('answered',{4:answer(1,true)})]}};
 const untouched={version:1,sessions:{original:[run('blank')]}};assert.equal(merge(saved,untouched).sessions.original.length,1);
 const repeat={version:1,sessions:{original:[run('repeat',{},true)]}};assert.equal(merge(saved,repeat).sessions.original.length,2);}
 finally{c.close();}
});
test('real page loads sync and uploads a submitted answer without changing scoring',async()=>{
 const dir=new URL('./',import.meta.url),api=server();
 const dom=new JSDOM(readFileSync(new URL('index.html',dir),'utf8'),{url:'https://example.com/?session=similar-a',runScripts:'outside-only'}),w=dom.window;
 w.fetch=api.fetch;w.AbortController=AbortController;w.HTMLElement.prototype.scrollIntoView=function(){};
 for(const p of ['../../harry-star-math/tests/2026-09-20/data.js','./data.js','./engine.js','./sync.js','./app.js'])w.eval(readFileSync(new URL(p,dir),'utf8'));
 try{await new Promise(resolve=>setTimeout(resolve,0));const q=w.HARRY_SEPT_PRACTICE[1].questions[0],form=w.document.querySelector(`form[data-source="${q.source}"]`);form.querySelector(`input[value="${q.correct}"]`).checked=true;form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await new Promise(resolve=>setTimeout(resolve,0));assert.equal(w.document.querySelector('#score').textContent,'1 / 12');assert.equal(w.document.querySelector('#save-note').dataset.syncStatus,'live');assert.equal(api.record.state.sessions['similar-a'][0].answers[q.source].attempts.length,1);}
 finally{w.close();}
});

test('all three added sessions upload and restore alongside existing session history',async()=>{
 const api=server(),sessions={};
 for(const id of ['similar-c','similar-d','similar-e','similar-f'])sessions[id]=[run(id,{4:answer(1,true)})];
 const a=client({version:1,sessions},api.fetch),b=client(empty(),api.fetch);
 try{assert.equal(a.w.HarrySeptSync.valid(a.state),true);await a.sync.start();await b.sync.start();assert.deepEqual(b.state,a.state);assert.deepEqual(Object.keys(b.state.sessions),Object.keys(sessions));assert.equal(b.status.kind,'live');}
 finally{a.close();b.close();}
});
