import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=f=>readFileSync(new URL(f,import.meta.url),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
const context={window:{}};vm.runInNewContext(read('data.js'),context);const data=plain(context.window.HARRY_MEANING_CHECK);
const rows=section=>data.words.filter(w=>w.section===section);
function harness({saved,fetch,clock=1000,values=new Map()}={}){
 if(saved)values.set(data.appId+(!fetch?':demo':'')+(saved.version===2?':rounds-v2':''),JSON.stringify(saved));const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 const c={};c.globalThis=c;vm.runInNewContext(read('sync.js'),c);
 let status;const s=c.MeaningCheckSync.create({data,storage,disabled:!fetch,fetch,now:()=>clock++,setTimeout:()=>1,clearTimeout(){},onStatus:(kind,text)=>status={kind,text}});
 return {s,values,status:()=>status};
}
function finish(s,section,round,unknown=false){
 assert.equal(s.openRound(section,round).ok,true);
 for(const w of rows(section))s.editRound(section,round,w.id,unknown?'unknown':'meaning',unknown||`own ${section}/${round} ${w.id}`);
 assert.equal(s.submitRound(section,round).ok,true);
}

test('all ten sets support three independent rounds, each repeating every word',()=>{
 const {s}=harness();
 for(const section of data.sections){
  const ids=rows(section.number).map(w=>w.id);
  assert.equal(s.openRound(section.number,2).ok,false);
  for(let round=1;round<=3;round++){
   const before=s.roundView(section.number,round);
   assert.deepEqual([...before.order].sort(),ids.slice().sort());
   if(round>1){assert.notDeepEqual([...before.order],ids);assert.equal(before.recorded,0);assert.equal(before.written,0);}
   finish(s,section.number,round,round===1);
   const after=s.roundView(section.number,round);assert.equal(after.recorded,section.count);assert.equal(after.written,round===1?0:section.count);assert.equal(after.submitted,true);
  }
  for(let round=1;round<=3;round++)for(const w of rows(section.number)){
   const answer=s.roundView(section.number,round).entries[w.id];assert.equal(answer.unknown,round===1);if(round>1)assert.equal(answer.meaning,`own ${section.number}/${round} ${w.id}`);
  }
  assert.equal(new Set([1,2,3].map(round=>s.roundView(section.number,round).order.join(','))).size,3);
 }
 assert.equal(Object.keys(s.snapshot().submissions).length,10);assert.equal(Object.keys(s.snapshot().roundSubmissions).length,20);
 assert.equal(s.openRound(10,4).ok,false);assert.equal(s.submitRound(10,4).ok,false);
 assert.equal(s.roundView(10,3).entries.voluntary.meaning,'own 10/3 voluntary');
});

test('shuffled order and drafts survive reload, revisits, and repeated navigation',()=>{
 const {s}=harness();finish(s,1,1,true);s.openRound(1,2);const order=plain(s.roundView(1,2).order),id=order[0];s.editRound(1,2,id,'meaning','my own explanation');
 for(let i=0;i<5;i++){s.openRound(2,1);s.openRound(1,1);s.openRound(1,2);assert.deepEqual(plain(s.roundView(1,2).order),order);assert.equal(s.roundView(1,2).entries[id].meaning,'my own explanation');}
 const refreshed=harness({saved:s.snapshot()}).s;assert.deepEqual(plain(refreshed.roundView(1,2).order),order);assert.equal(refreshed.roundView(1,2).entries[id].meaning,'my own explanation');assert.equal(refreshed.roundView(1,1).entries[id].unknown,true);
 assert.deepEqual(plain(refreshed.snapshot().rounds['1:2'].order),order);
 const priorVersion=plain(s.snapshot());priorVersion.rounds['1:2'].order.reverse();const reopened=harness({saved:priorVersion}).s;assert.deepEqual(plain(reopened.roundView(1,2).order),priorVersion.rounds['1:2'].order);
});

test('round revisions keep all finished copies and do not claim correctness',()=>{
 const {s}=harness();finish(s,1,1,true);finish(s,1,2);
 const before=plain(s.snapshot()),id=rows(1)[0].id;s.editRound(1,2,id,'meaning','arbitrary text');assert.equal(s.roundView(1,2).submitted,false);assert.equal(s.submitRound(1,2).ok,true);
 assert.equal(s.roundView(1,2).copies.length,2);for(const [key,value]of Object.entries(before.roundSubmissions))assert.deepEqual(plain(s.snapshot().roundSubmissions[key]),value);
 assert.deepEqual(plain(s.snapshot().submissions),before.submissions);assert.equal(s.roundView(1,2).written,10);assert.equal(s.roundView(1,2).correct,undefined);
 s.editRound(1,2,id,'meaning','');assert.equal(s.submitRound(1,2).ok,false);s.editRound(1,2,id,'unknown',true);assert.equal(s.submitRound(1,2).ok,true);
 assert.equal(s.roundView(1,2).written,9);assert.equal(s.roundView(1,3).available,true);
});

test('the additive upgrade preserves every original field, removed word and submitted copy',()=>{
 const responses=data.previousWords.filter(w=>w.section===1).map(w=>({id:w.id,meaning:'old wording',unknown:false,tone:'neutral'}));
 const saved={kind:'word-meaning-check',version:1,entries:{ballet:{meaning:{value:'Dancing ',at:4},unknown:{value:false,at:5},tone:{value:'positive',at:6}},cull:{meaning:{value:'removed but kept',at:7}}},submissions:{'submission-legacy-0001':{section:1,at:'2026-10-31T12:00:00Z',responses}}};
 const {s,values}=harness({saved});assert.equal(values.get(s.legacyKey+':before-rounds'),JSON.stringify(saved));assert.equal(values.get(s.legacyKey),JSON.stringify(saved));assert.deepEqual(plain(s.snapshot().entries),saved.entries);assert.equal(s.roundView(1,1).entries.ballet.meaning,'Dancing ');
 finish(s,1,1,true);finish(s,1,2);assert.equal(s.snapshot().entries.cull.meaning.value,'removed but kept');assert.equal(s.snapshot().entries.ballet.meaning.value,'Dancing ');assert.equal(s.snapshot().entries.ballet.tone.value,'positive');assert.deepEqual(plain(s.snapshot().submissions['submission-legacy-0001'].responses),responses);
});

test('concurrent devices merge different rounds, independent fields, explicit clears and histories',()=>{
 const original=harness().s;finish(original,1,1,true);finish(original,1,2);const saved=original.snapshot(),a=harness({saved,clock:3000}).s,b=harness({saved,clock:4000}).s,id=rows(1)[0].id;
 a.editRound(1,2,id,'meaning','device A');b.editRound(1,2,id,'unknown',true);b.openRound(1,3);b.editRound(1,3,id,'meaning','device B round3');
 const ab=a.merge(a.snapshot(),b.snapshot()),ba=a.merge(b.snapshot(),a.snapshot());assert.deepEqual(plain(ab),plain(ba));
 const c=harness({saved:ab,clock:5000}).s;assert.equal(c.roundView(1,2).entries[id].meaning,'device A');assert.equal(c.roundView(1,2).entries[id].unknown,true);assert.equal(c.roundView(1,3).entries[id].meaning,'device B round3');
 c.editRound(1,3,id,'meaning','');const merged=c.merge(ab,c.snapshot());assert.equal(merged.rounds['1:3'].entries[id].meaning.value,'');assert.equal(Object.keys(merged.roundSubmissions).length,1);assert.equal(Object.keys(merged.submissions).length,1);
});

test('online conflict retries preserve rounds; restore is read-only; blank startup is GET only',async()=>{
 let remote=null,posts=0,conflict;
 const fetch=async(_url,init={})=>{if(init.method==='POST'){posts++;const body=JSON.parse(init.body);if(conflict){remote={version:remote.version+1,state:conflict};conflict=null;return {ok:true,json:async()=>({accepted:false,progress:remote})};}remote={version:(remote?.version||0)+1,state:body.state};return {ok:true,json:async()=>({accepted:true,progress:remote})};}return {ok:true,json:async()=>({progress:remote})};};
 const {s}=harness({fetch});assert.equal(await s.start(),true);assert.equal(posts,0);s.openRound(1,1);assert.equal(await s.flush(),true);assert.equal(posts,0);
 finish(s,1,1,true);finish(s,1,2);assert.equal(await s.flush(),true);
 const other=harness({saved:remote.state,clock:9000}).s;other.openRound(1,3);other.editRound(1,3,rows(1)[1].id,'meaning','other device');conflict=other.snapshot();s.openRound(2,1);s.editRound(2,1,rows(2)[0].id,'meaning','local set2');assert.equal(await s.flush(),true);
 assert.equal(s.roundView(1,3).entries[rows(1)[1].id].meaning,'other device');assert.equal(s.roundView(2,1).entries[rows(2)[0].id].meaning,'local set2');
 const before=posts,fresh=harness({fetch}).s;assert.equal((await fresh.restore()).ok,true);assert.equal(posts,before);assert.deepEqual(plain(fresh.snapshot()),plain(s.snapshot()));
});

test('malformed rounds cannot move words between sets, skip rounds or overwrite round one',()=>{
 const {s}=harness();const state=s.snapshot();state.rounds={'1:1':{section:1,round:1,entries:{ballet:{meaning:{value:'overwrite',at:100}}}},'1:2':{section:1,round:2,order:['hoax'],entries:{hoax:{meaning:{value:'wrong set',at:100}},ballet:{unknown:{value:'yes',at:2}}}},'1:0':{section:1,round:0,entries:{}}};state.roundSubmissions={'round-copy-bad-0001':{section:1,round:2,at:'2026-11-01',responses:[]}};
 const normalized=s.normalize(state);assert.equal(normalized.rounds['1:1'],undefined);assert.deepEqual(plain(normalized.rounds['1:2'].entries),{});assert.equal(normalized.rounds['1:2'].order.length,10);assert.equal(Object.keys(normalized.roundSubmissions).length,0);assert.equal(s.submitRound(1,4).ok,false);
});

test('offline later-round drafts recover on reload and survive a remote legacy-only record',async()=>{
 const seed=harness().s;finish(seed,1,1,true);let connected=false,posts=0;
 let remote={version:10,state:{kind:'word-meaning-check',version:1,entries:seed.snapshot().entries,submissions:seed.snapshot().submissions}};
 const fetch=async(_url,init={})=>{if(!connected)throw Error('offline');if(init.method==='POST'){posts++;remote={version:remote.version+1,state:JSON.parse(init.body).state};return {ok:true,json:async()=>({accepted:true,progress:remote})};}return {ok:true,json:async()=>({progress:remote})};};
 const h=harness({saved:seed.snapshot(),fetch});h.s.openRound(1,2);h.s.editRound(1,2,'ballet','meaning','offline wording');assert.equal(await h.s.flush(),false);assert.equal(h.status().kind,'offline');
 const restarted=harness({saved:h.s.snapshot(),fetch}).s;assert.equal(restarted.roundView(1,2).entries.ballet.meaning,'offline wording');connected=true;assert.equal(await restarted.flush(),true);assert.equal(posts,1);assert.equal(remote.state.rounds['1:2'].entries.ballet.meaning.value,'offline wording');assert.deepEqual(plain(remote.state.submissions),plain(seed.snapshot().submissions));
});

test('v2 uses a separate device key and imports later legacy edits without losing rounds',()=>{
 const legacy={kind:'word-meaning-check',version:1,entries:{ballet:{meaning:{value:'original answer',at:1}}},submissions:{}},h=harness({saved:legacy});finish(h.s,1,1,true);finish(h.s,1,2);
 assert.equal(h.s.snapshot().version,2);assert.notEqual(h.s.key,h.s.legacyKey);assert.equal(h.values.get(h.s.legacyKey),JSON.stringify(legacy));
 const edited=plain(legacy);edited.entries.ballet.meaning={value:'typed in an older tab',at:9999};h.values.set(h.s.legacyKey,JSON.stringify(edited));const reopened=harness({values:h.values}).s;
 assert.equal(reopened.roundView(1,1).entries.ballet.meaning,'typed in an older tab');assert.equal(reopened.roundView(1,2).entries.ballet.meaning,'own 1/2 ballet');assert.equal(reopened.roundView(1,2).copies.length,1);assert.equal(h.values.get(h.s.legacyKey),JSON.stringify(edited));assert.equal(h.values.get(h.s.legacyKey+':before-rounds'),JSON.stringify(legacy));
});
