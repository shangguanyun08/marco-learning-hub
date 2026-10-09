const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const c={window:{}};for(const f of ['mixed-data.js','round1-review-data.js'])vm.runInNewContext(read(f),c);
const original=c.window.MARCO_MIXED_VR.questions,review=c.window.MARCO_ROUND1_REVIEW,words=[...original,...review.questions],Core=require('./quiz-core.js'),KEY='marco-zozeck-mixed-360-v1:progress';
const clone=x=>JSON.parse(JSON.stringify(x));
function browser(n=1,progress,cycle=1){const dom=new JSDOM('<main id="app"></main>',{url:'https://example.org/?'+(cycle===1?'review':'review'+cycle)+'='+n,runScripts:'outside-only'}),w=dom.window;w.HTMLElement.prototype.scrollIntoView=()=>{};let options;w.MarcoOnlineSync={create:o=>(options=o,{start:()=>{},push:()=>{},stop:()=>{}})};if(progress)w.localStorage.setItem(KEY,JSON.stringify(progress));for(const f of ['mixed-data.js','round1-review-data.js','quiz-core.js','mixed-app.js'])w.eval(read(f));return {w,d:w.document,state:()=>JSON.parse(w.localStorage.getItem(KEY)),get options(){return options;},close:()=>w.close()};}
function answer(b,q,choice){const card=b.d.getElementById('q-'+q.id);[...card.querySelectorAll('[data-choice]')].find(e=>e.dataset.choice===choice).click();card.querySelector('[data-check]').click();}
test('202 exact unique source misses in 40/40/40/40/42 independent copies',()=>{
 assert.equal(review.questions.length,202);assert.deepEqual(clone(review.metadata.sessions.map(s=>s.questionCount)),[40,40,40,40,42]);assert.equal(new Set(review.questions.map(q=>q.sourceQuestionId)).size,202);assert.equal(new Set(words.map(q=>q.id)).size,562);
 for(let s=1;s<=9;s++)assert.equal(review.questions.filter(q=>q.sourceSession===s).length,review.metadata.sourceMissCounts[s-1]);
 for(const q of review.questions){const source=original.find(x=>x.id===q.sourceQuestionId);assert.ok(source);assert.equal(source.session,q.sourceSession);assert.equal(q.choices.length,4);assert.equal(new Set(q.choices.map(x=>x.toLowerCase())).size,4);assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.ok(q.explanation.length>15);assert.ok(q.trick.length>15);assert.ok(q.session>=101&&q.session<=105);}
});
test('five review buttons follow Session 9; all wait for Start; final review has 42 questions',()=>{
 for(let n=1;n<=5;n++){const b=browser(n);try{assert.deepEqual([...b.d.querySelectorAll('.session-picker [data-session]')].map(e=>+e.dataset.session),[1,2,3,4,5,6,7,8,9,101,102,103,104,105,201,202,203,204,205,301,302,303,304,305,401,402,403,404,405]);assert.equal(b.d.querySelectorAll('.question-item').length,0);assert.deepEqual(b.state().sessions,{});b.d.querySelector('[data-start]').click();assert.equal(b.d.querySelectorAll('.question-item').length,n===5?42:40);assert.equal(b.state().sessions[100+n].rounds[0].timeLimitSeconds,undefined);assert.match(b.d.querySelector('.round-heading').textContent,new RegExp('Review Session '+n));assert.equal(b.w.location.search,'?review='+n);}finally{b.close();}}
});
test('review rounds 1–4 retry only misses, keep original history, and save first score with red/yellow/green feedback',()=>{
 const before=Core.blank(),base=original.filter(q=>q.session===1);Core.start(before,1,base.map(q=>q.id),'2026-10-07T01:00:00Z');for(const q of base)Core.answer(before,1,q.answer,original,'2026-10-07T01:01:00Z',q.id);Core.finishRound(before,1,'2026-10-07T01:02:00Z');const frozen=JSON.stringify(before.sessions[1]);const b=browser(1,before),qs=review.questions.filter(q=>q.session===101);
 try{b.d.querySelector('[data-start]').click();for(const [i,q]of qs.entries())answer(b,q,i<3?q.choices.find(v=>v!==q.answer):q.answer);assert.equal(b.d.querySelectorAll('.number-grid .answered-wrong').length,3);assert.equal(b.d.querySelectorAll('.number-grid .answered-correct').length,37);b.d.querySelector('[data-submit]').click();assert.equal(b.d.querySelectorAll('.question-item').length,3);assert.equal(b.d.querySelectorAll('.question-item .solution').length,0);
 for(let r=2;r<=4;r++){const current=Core.current(b.state().sessions[101]);assert.equal(current.number,r);assert.equal(current.ids.length,5-r);for(const [i,id]of current.ids.entries()){const q=qs.find(q=>q.id===id);answer(b,q,i===0?q.answer:q.choices.find(v=>v!==q.answer));}assert.equal(b.d.querySelectorAll('.number-grid .answered-corrected').length,1);b.d.querySelector('[data-submit]').click();}
 assert.ok(b.d.querySelector('[data-session="101"]').classList.contains('mastered'));assert.match(b.d.querySelector('[data-session="101"]').textContent,/37\/40 correct/);assert.equal(JSON.stringify(b.state().sessions[1]),frozen);assert.equal(b.state().sessions[101].rounds.length,4);
 const remote=clone(b.state());const reloaded=browser(1,remote);try{assert.match(reloaded.d.querySelector('.complete-card').textContent,/Review Session 1 mastered/);assert.equal(JSON.stringify(reloaded.options.merge(remote,before).sessions[101]),JSON.stringify(remote.sessions[101]));assert.equal(JSON.stringify(reloaded.options.merge(remote,before).sessions[1]),frozen);}finally{reloaded.close();}
 }finally{b.close();}
});
test('review progress merges from another device and never mixes source answers or auto-starts other reviews',()=>{
 const a=browser(5),b=browser(5);try{a.d.querySelector('[data-start]').click();const q=review.questions.find(q=>q.session===105);answer(a,q,q.answer);b.options.onRemote(a.state());assert.equal(b.d.querySelectorAll('.question-item').length,42);assert.equal(b.d.querySelector('#q-'+q.id+' [aria-pressed="true"]').dataset.choice,q.answer);assert.equal(Object.keys(b.state().sessions).length,1);b.d.querySelector('[data-session="101"]').click();assert.equal(b.w.location.search,'?review=1');assert.equal(b.d.querySelectorAll('.question-item').length,0);assert.equal(b.state().sessions[101],undefined);assert.equal(b.state().sessions[q.sourceSession],undefined);}finally{a.close();b.close();}
});
test('Review 2 repeats all five complete review groups with fresh untimed attempts',()=>{
 for(let n=1;n<=5;n++){
  const b=browser(n,undefined,2),qs=review.questions.filter(q=>q.session===100+n);
  try{
   assert.match(b.d.querySelector('.test-start h2').textContent,new RegExp('Review 2 · Session '+n));
   assert.deepEqual(b.state().sessions,{});
   b.d.querySelector('[data-start]').click();
   assert.equal(b.d.querySelectorAll('.question-item').length,qs.length);
   const r=b.state().sessions[200+n].rounds[0];
   assert.equal(r.timeLimitSeconds,undefined);assert.equal(r.deadlineAt,undefined);
   assert.deepEqual(r.ids,clone(qs.map(q=>q.id.replace(/^r1-/,'r2-'))));
   for(const q of qs){
    const card=b.d.getElementById('q-'+q.id.replace(/^r1-/,'r2-'));
    assert.equal(card.querySelector('h3').textContent,q.word);
    assert.deepEqual([...card.querySelectorAll('[data-choice]')].map(e=>e.dataset.choice).sort(),[...q.choices].sort());
   }
   assert.equal(b.w.location.search,'?review2='+n);
  }finally{b.close();}
 }
});
test('Review 2 keeps mastered Review 1 intact, corrects only its own misses, and syncs independently',()=>{
 const before=Core.blank(),qs=review.questions.filter(q=>q.session===101);
 Core.start(before,101,qs.map(q=>q.id),'2026-10-08T01:00:00Z');
 for(const q of qs)Core.answer(before,101,q.answer,words,'2026-10-08T01:01:00Z',q.id);
 Core.finishRound(before,101,'2026-10-08T01:02:00Z');
 const frozen=JSON.stringify(before.sessions[101]),b=browser(1,before,2),copies=qs.map(q=>({...q,id:q.id.replace(/^r1-/,'r2-')}));
 try{
  assert.ok(b.d.querySelector('[data-session="101"]').classList.contains('mastered'));
  assert.equal(b.state().sessions[201],undefined);
  b.d.querySelector('[data-start]').click();
  for(const [i,q]of copies.entries())answer(b,q,i===0?q.choices.find(v=>v!==q.answer):q.answer);
  b.d.querySelector('[data-submit]').click();
  assert.equal(b.d.querySelectorAll('.question-item').length,1);
  assert.equal(b.state().sessions[201].rounds[1].ids[0],copies[0].id);
  assert.equal(b.d.querySelectorAll('.solution').length,0);
  answer(b,copies[0],copies[0].answer);
  assert.ok(b.d.getElementById('q-'+copies[0].id).classList.contains('answered-corrected'));
  b.d.querySelector('[data-submit]').click();
  assert.match(b.d.querySelector('[data-session="201"]').textContent,/39\/40 correct/);
  assert.ok(b.d.querySelector('[data-session="201"]').classList.contains('mastered'));
  assert.equal(JSON.stringify(b.state().sessions[101]),frozen);
  const other=browser(1,before,2);
  try{
   other.options.onRemote(b.state());
   assert.match(other.d.querySelector('.complete-card').textContent,/Review 2 · Session 1 mastered/);
   assert.equal(JSON.stringify(other.state().sessions[101]),frozen);
   other.d.querySelector('[data-view="results"]').click();
   assert.equal(other.w.location.search,'?review2=1');assert.equal(other.w.location.hash,'#results');
   other.d.querySelector('[data-session="202"]').click();
   assert.equal(other.w.location.search,'?review2=2');assert.equal(other.state().sessions[202],undefined);
  }finally{other.close();}
  const reload=browser(1,b.state(),2);
  try{assert.match(reload.d.querySelector('.complete-card').textContent,/Review 2 · Session 1 mastered/);}finally{reload.close();}
 }finally{b.close();}
});
test('Reviews 3 and 4 preserve all five groups, shuffle questions and every A–D layout, and keep order on reload',()=>{
 const snapshot=b=>[...b.d.querySelectorAll('.question-item')].map(card=>({id:card.id.replace(/q-r\d+-/,'').replace(/^q-/,''),prompt:card.querySelector('h3').textContent,choices:[...card.querySelectorAll('[data-choice]')].map(e=>e.dataset.choice)}));
 for(let n=1;n<=5;n++){
  const prior=[],qs=review.questions.filter(q=>q.session===100+n);
  for(let cycle=1;cycle<=4;cycle++){
   const b=browser(n,undefined,cycle);
   try{
    assert.deepEqual(b.state().sessions,{});assert.equal(b.d.querySelectorAll('.question-item').length,0);
    b.d.querySelector('[data-start]').click();const cards=snapshot(b);assert.equal(cards.length,n===5?42:40);
    for(const q of qs){const card=cards.find(c=>c.id===q.id.replace(/^r1-/,''));assert(card);assert.equal(card.prompt,q.word);assert.deepEqual([...card.choices].sort(),[...q.choices].sort());}
    if(cycle>=3){
     for(const previous of prior){assert.notDeepEqual(cards.map(c=>c.id),previous.map(c=>c.id));for(const card of cards)assert.notDeepEqual(card.choices,previous.find(c=>c.id===card.id).choices);}
     assert.equal(b.state().sessions[100*cycle+n].rounds[0].timeLimitSeconds,undefined);
     assert.equal(b.w.location.search,`?review${cycle}=${n}`);
     const reloaded=browser(n,b.state(),cycle);try{assert.deepEqual(snapshot(reloaded),cards);}finally{reloaded.close();}
    }
    prior.push(cards);
   }finally{b.close();}
  }
 }
});
test('Reviews 3 and 4 score by answer text after shuffling, sync separately, and preserve earlier history',()=>{
 const seed=browser(1,undefined,2);seed.d.querySelector('[data-start]').click();const source=review.questions.find(q=>q.session===101);answer(seed,{...source,id:source.id.replace(/^r1-/,'r2-')},source.answer);let saved=seed.state();const frozen=JSON.stringify(saved.sessions[201]);seed.close();
 for(const cycle of [3,4]){
  const b=browser(1,saved,cycle),qs=review.questions.filter(q=>q.session===101).map(q=>({...q,id:q.id.replace(/^r1-/,`r${cycle}-`)})),key=cycle*100+1;
  try{
   b.d.querySelector('[data-start]').click();
   for(const [i,q]of qs.entries())answer(b,q,i===0?q.choices.find(c=>c!==q.answer):q.answer);
   b.d.querySelector('[data-submit]').click();assert.equal(b.d.querySelectorAll('.question-item').length,1);
   assert.equal(b.state().sessions[key].rounds[1].ids[0],qs[0].id);answer(b,qs[0],qs[0].answer);b.d.querySelector('[data-submit]').click();
   assert.match(b.d.querySelector(`[data-session="${key}"]`).textContent,/39\/40 correct/);assert(b.d.querySelector(`[data-session="${key}"]`).classList.contains('mastered'));
   saved=b.state();assert.equal(JSON.stringify(saved.sessions[201]),frozen);
   const remote=browser(1,undefined,cycle);try{remote.options.onRemote(saved);assert.match(remote.d.querySelector('.complete-card').textContent,new RegExp(`Review ${cycle} · Session 1 mastered`));assert.equal(JSON.stringify(remote.state()),JSON.stringify(saved));remote.d.querySelector('[data-view="results"]').click();assert.equal(remote.w.location.search,`?review${cycle}=1`);assert.equal(remote.w.location.hash,'#results');remote.d.querySelector(`[data-session="${key+1}"]`).click();assert.equal(remote.w.location.search,`?review${cycle}=2`);assert.equal(remote.state().sessions[key+1],undefined);}finally{remote.close();}
  }finally{b.close();}
 }
 assert(saved.sessions[301].completedAt);assert(saved.sessions[401].completedAt);
});
