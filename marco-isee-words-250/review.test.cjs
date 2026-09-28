const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const Core=require('./quiz-core.js');
const ctx={window:{}};
for(const file of ['data.js','review.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),'utf8'),ctx);
const words=JSON.parse(JSON.stringify(ctx.window.MARCO_VOCABULARY_WORDS));
const review=JSON.parse(JSON.stringify(ctx.window.MARCO_ISEE_REVIEW));
const at='2026-09-28T05:00:00Z';
test('review contains 23 unique first-try misses with the five source-session counts',()=>{
 assert.equal(review.ids.length,23);assert.equal(new Set(review.ids).size,23);
 assert.deepEqual(review.sources.map(s=>s.missed),[9,2,3,4,5]);
 for(const source of review.sources)assert.equal(review.ids.filter(id=>words.find(w=>w.id===id)?.session===source.session).length,source.missed);
});
test('review uses its own choices and wrong answers validate against those choices',()=>{
 const p=Core.blank();Core.start(p,6,review.ids,at);
 let changed=0;
 for(const id of review.ids){
  const word=words.find(w=>w.id===id),choices=Core.options(word,1,words,6);
  assert.equal(new Set(choices).size,4);assert.ok(choices.includes(id));
  if(JSON.stringify(choices)!==JSON.stringify(Core.options(word,1,words,word.session)))changed++;
  assert.equal(Core.answer(p,6,choices.find(x=>x!==id),words,at,id),true);
 }
 assert.ok(changed>20);assert.equal(Core.finishRound(p,6,at),'round');
 assert.deepEqual(Core.current(p.sessions[6]).ids,review.ids);
});
test('review rounds narrow to misses without altering original sessions, including after merging',()=>{
 const p=Core.blank();
 for(let n=1;n<=5;n++){
  Core.start(p,n,words.filter(w=>w.session===n).map(w=>w.id),at);
  for(const id of p.sessions[n].rounds[0].ids)Core.answer(p,n,id,words,at,id);
  Core.finishRound(p,n,at);
 }
 const original=JSON.parse(JSON.stringify(p));
 Core.start(p,6,review.ids,at);
 for(let r=1;r<=3;r++){
  const active=Core.current(p.sessions[6]);
  const misses=r===1?3:r===2?1:0;
  active.ids.forEach((id,i)=>{
   const word=words.find(w=>w.id===id),choice=i<misses?Core.options(word,r,words,6).find(x=>x!==id):id;
   Core.answer(p,6,choice,words,at,id);
  });
  assert.equal(Core.finishRound(p,6,at),misses?'round':'complete');
  if(misses)assert.equal(Core.current(p.sessions[6]).ids.length,misses);
 }
 const merged=Core.merge(original,p);
 for(let n=1;n<=5;n++)assert.deepEqual(merged.sessions[n],original.sessions[n]);
 assert.equal(merged.sessions[6].completedAt,at);
 assert.equal(Object.values(merged.sessions[6].rounds[0].answers).filter(a=>a.correct).length,20);
});
