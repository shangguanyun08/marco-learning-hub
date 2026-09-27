const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const Core=require('./quiz-core.js');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'data.js'),'utf8'),ctx);
const words=JSON.parse(JSON.stringify(ctx.window.MARCO_VOCABULARY_WORDS));
const at='2026-09-27T16:00:00Z';
test('all 250 source words appear once in five mixed sessions',()=>{
 assert.equal(words.length,250);assert.equal(new Set(words.map(w=>w.id)).size,250);
 assert.deepEqual(words.map(w=>w.number).sort((a,b)=>a-b),Array.from({length:250},(_,i)=>i+1));
 assert.deepEqual([1,2,3,4,5].map(s=>words.filter(w=>w.session===s).length),[50,50,50,50,50]);
 for(let session=1;session<=5;session++){
  const group=words.filter(w=>w.session===session);
  assert.ok(new Set(group.map(w=>w.word[0])).size>=12);
  assert.notDeepEqual(group.map(w=>w.number),group.map(w=>w.number).sort((a,b)=>a-b));
 }
});
test('question order is shuffled by round and stable across refreshes and devices',()=>{
 const ids=words.slice(0,50).map(w=>w.id);
 const first=Core.questionOrder(ids,1,1),second=Core.questionOrder(ids,1,2);
 assert.deepEqual([...first].sort(),[...ids].sort());
 assert.notDeepEqual(first,[...ids].sort());assert.notDeepEqual(first,second);
 assert.deepEqual(first,Core.questionOrder([...ids].reverse(),1,1));
});
test('old untouched sessions adopt mixed sets and existing first tries follow their word IDs',()=>{
 Core.configureLayout(words);
 const source=words.slice().sort((a,b)=>a.number-b.number);
 const old={version:1,sessions:{1:{rounds:[{number:1,ids:source.slice(0,50).map(w=>w.id),answers:{[source[0].id]:{choice:source[0].id,correct:true,at}},startedAt:at,finishedAt:null,position:0}],completedAt:null}}};
 const migrated=Core.merge(old,null);
 assert.equal(migrated.layoutVersion,2);
 const target=source[0].session;
 assert.equal(migrated.sessions[target].rounds[0].answers[source[0].id].correct,true);
 assert.deepEqual(migrated.sessions[1].rounds[0].ids,words.filter(w=>w.session===1).map(w=>w.id));
 assert.deepEqual(Core.merge(migrated,old),migrated);
});
test('every word in rounds 1–4 has four deterministic distinct choices including its answer',()=>{
 for(const w of words)for(let r=1;r<=4;r++){
  const options=Core.options(w,r,words);assert.equal(options.length,4,w.word);
  assert.equal(new Set(options).size,4);assert.ok(options.includes(w.id));
  assert.deepEqual(options,Core.options(w,r,words));
  for(const id of options.filter(id=>id!==w.id)){
   const other=words.find(w=>w.id===id);
   assert.ok(!w.meaning.toLowerCase().includes(other.word.toLowerCase()),w.word+' / '+other.word);
  }
 }
});
test('all 50 answers are required and immutable; rounds 2, 3 and 4 only repeat misses',()=>{
 const p=Core.blank(),ids=words.slice(0,50).map(w=>w.id);Core.start(p,1,ids,at);
 assert.equal(Core.finishRound(p,1,at),false);
 // Answer backwards to verify that question order is optional.
 for(const id of [...ids].reverse()){
  const w=words.find(w=>w.id===id),choice=ids.indexOf(id)<3?Core.options(w,1,words).find(x=>x!==id):id;
  assert.equal(Core.answer(p,1,choice,words,at,id),true);
  assert.equal(Core.answer(p,1,id,words,at,id),false);
 }
 assert.equal(Core.finishRound(p,1,at),'round');
 for(let r=2;r<=4;r++){
  const active=Core.current(p.sessions[1]);assert.equal(active.number,r);assert.equal(active.ids.length,5-r);
  active.ids.forEach((id,i)=>{
   const w=words.find(w=>w.id===id),choice=i===0?id:Core.options(w,r,words).find(x=>x!==id);
   Core.answer(p,1,choice,words,at,id);
  });
  assert.equal(Core.finishRound(p,1,at),r===4?'complete':'round');
 }
 assert.equal(p.sessions[1].completedAt,at);assert.equal(p.sessions[1].rounds.length,4);
 assert.equal(Object.values(p.sessions[1].rounds[0].answers).filter(a=>a.correct).length,47);
});
test('stale or conflicting device records preserve earliest answers and later rounds',()=>{
 const a=Core.blank();Core.start(a,1,words.slice(0,2).map(w=>w.id),at);
 const b=JSON.parse(JSON.stringify(a));
 Core.answer(a,1,words[0].id,words,at,words[0].id);
 Core.answer(b,1,words[1].id,words,at,words[1].id);
 const merged=Core.merge(a,b);assert.equal(Object.keys(Core.current(merged.sessions[1]).answers).length,2);
 assert.equal(Core.finishRound(merged,1,at),'complete');
 assert.equal(Core.merge(merged,a).sessions[1].completedAt,at);
});
