const {test}=require('node:test'),assert=require('node:assert/strict');
const S=require('./sync.js');
const check=(choice=1,time='2026-10-23T10:00:00Z')=>({choice,checkedAt:time,answerOK:choice===1,marks:[{sid:'p0s0',start:0,end:5}]});
const state=(answers={},drafts={})=>({version:1,articles:{carla:[{id:'run-1',startedAt:'2026-10-23T09:00:00Z',position:0,answers,drafts}]}});
test('migration preserves legacy tries, highlights and unrelated articles; blank device never erases work',()=>{
 const original=state({q:[{...check(),evidenceOK:false}]});original.articles.fruits=[{id:'r2',answers:{},drafts:{}}];
 const merged=S.merge({},original);assert.equal(merged.articles.carla[0].answers.q[0].evidenceOK,false);assert.deepEqual(merged.articles.carla[0].answers.q,original.articles.carla[0].answers.q);assert.equal(merged.articles.fruits.length,1);assert.deepEqual(S.merge(merged,original),merged);
});
test('different questions merge and prefix retries retain first-try result',()=>{
 const a=state({q:[check(0)]}),b=state({q:[check(0),check(1,'2026-10-23T10:01:00Z')],q2:[check()]});
 const m=S.merge(a,b);assert.equal(m.articles.carla.length,1);assert.equal(m.articles.carla[0].answers.q.length,2);assert.equal(m.articles.carla[0].answers.q[0].answerOK,false);assert.deepEqual(S.merge(a,b),S.merge(b,a));
});
test('conflicting first checks are retained in separate histories, not fabricated retries',()=>{
 const a=state({q:[check(0)]}),b=state({q:[check(1)]}),m=S.merge(a,b);
 assert.equal(m.articles.carla.length,2);assert.ok(m.articles.carla.every(r=>r.answers.q.length===1));assert.deepEqual(m,S.merge(b,a));assert.deepEqual(S.merge(m,a),m);assert.deepEqual(S.merge(m,m),m);
});
test('newer cleared draft wins over old highlighted draft',()=>{
 const a=state({},{q:{choice:2,marks:[{sid:'p0s0',start:0,end:5}],updatedAt:'2026-10-23T10:00:00Z'}}),b=state({},{q:{choice:0,marks:[],updatedAt:'2026-10-23T11:00:00Z'}});
 assert.deepEqual(S.merge(a,b).articles.carla[0].drafts.q,b.articles.carla[0].drafts.q);
});
test('two devices upload/download, retry version conflict and recover offline without deleting work',async()=>{
 let remote=null,version=0,posts=0,offline=false,conflict=true;
 const fetcher=async(_url,options)=>{
  if(offline)throw Error('offline');
  if(options.method==='POST'){
   posts++;const body=JSON.parse(options.body);assert.equal(body.appId,S.APP_ID);assert.equal(body.studentName,'Harry');
   if(conflict){conflict=false;remote={version:++version,state:state({other:[check()]})};return {ok:true,json:async()=>({accepted:false,progress:remote})};}
   assert.equal(body.baseVersion,remote?.version??null);remote={version:++version,state:body.state};return {ok:true,json:async()=>({accepted:true,progress:remote})};
  }return {ok:true,json:async()=>({progress:remote})};
 };
 let a=state({q:[check(0)]}),b={version:1,articles:{}},status='';
 const deviceA=S.create({getState:()=>a,applyState:x=>a=x,onStatus:x=>status=x,deviceId:'device-a-12345',fetcher});
 await deviceA.sync();assert.equal(status,'Synced online');assert.equal(posts,2);assert.ok(a.articles.carla[0].answers.other);
 const deviceB=S.create({getState:()=>b,applyState:x=>b=x,onStatus:x=>status=x,deviceId:'device-b-12345',fetcher});
 await deviceB.sync();assert.deepEqual(a,b);assert.equal(posts,2);
 offline=true;b.articles.carla[0].answers.new=[check()];await deviceB.sync();assert.match(status,/Not synced/);assert.ok(b.articles.carla[0].answers.new);
 offline=false;await deviceB.sync();await deviceA.sync();assert.ok(a.articles.carla[0].answers.new);assert.equal(a.articles.carla[0].answers.q[0].choice,0);deviceA.stop();deviceB.stop();
});
