const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const Core=require('./quiz-core.js');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'mixed-data.js'),'utf8'),context);
const {questions:words,metadata}=context.window.MARCO_MIXED_VR;
const time='2026-10-05T22:00:00.000Z';
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
test('360 unique questions, nine balanced 40-item sessions, valid answers and explanations',()=>{
  assert.equal(words.length,360);
  assert.equal(new Set(words.map(q=>q.id)).size,360);
  assert.equal(new Set(words.map(q=>q.quizType+':'+norm(q.word))).size,360);
  assert.equal(words.filter(q=>q.quizType==='synonym').length,300);
  assert.equal(words.filter(q=>q.quizType==='completion').length,58);
  assert.equal(words.filter(q=>q.quizType==='definition').length,2);
  for(let s=1;s<=9;s++){
    const qs=words.filter(q=>q.session===s);assert.equal(qs.length,40);
    assert.ok(qs.some(q=>q.quizType==='completion'));
    for(const d of ['medium','medium-hard','hard'])assert.ok(qs.some(q=>q.difficulty===d));
  }
  for(const q of words){assert.equal(q.choices.length,4);assert.ok(q.choices.includes(q.answer));assert.ok(q.trick?.length>15);assert.ok(q.explanation?.length>15);assert.ok(q.sourceLabel);}
  for(const word of ['assault','obscure','disclose','orator','paltry','conviction','embolden','diligent','envisage','assurance'])assert.ok(!words.some(q=>norm(q.word)===word));
  assert.equal(words.filter(q=>q.sourceGroup==='review-124').length,121);
  assert.equal(words.filter(q=>q.sourceGroup==='curated-227').length,227);
  assert.equal(words.filter(q=>q.sourceGroup==='historical-top-up').length,12);
  assert.equal(metadata.editorialRepairs.length,9);
});
test('timed Round 1 is frozen; only misses return, untimed, until mastered',()=>{
  const p=Core.blank(),qs=words.filter(q=>q.session===1),ids=qs.map(q=>q.id);
  Core.startTimed(p,1,ids,time,1200);
  qs.forEach((q,i)=>Core.answer(p,1,i<3?q.choices.find(c=>c!==q.answer):q.answer,words,'2026-10-05T22:01:00.000Z',q.id));
  Core.finishTimed(p,1,'2026-10-05T22:10:00.000Z');
  const frozen=JSON.stringify(p.sessions[1].rounds[0]);
  assert.equal(Core.current(p.sessions[1]).ids.length,3);
  assert.ok(!Core.current(p.sessions[1]).timeLimitSeconds);
  for(const id of Core.current(p.sessions[1]).ids){const q=words.find(q=>q.id===id);Core.answer(p,1,q.choices.find(c=>c!==q.answer),words,'2026-10-05T22:11:00.000Z',id);}
  Core.finishRound(p,1,'2026-10-05T22:12:00.000Z');
  assert.equal(Core.current(p.sessions[1]).number,3);
  assert.equal(Core.current(p.sessions[1]).ids.length,3);
  for(const id of Core.current(p.sessions[1]).ids){const q=words.find(q=>q.id===id);Core.answer(p,1,q.answer,words,'2026-10-05T22:13:00.000Z',id);}
  Core.finishRound(p,1,'2026-10-05T22:14:00.000Z');
  assert.ok(p.sessions[1].completedAt);
  assert.equal(JSON.stringify(p.sessions[1].rounds[0]),frozen);
  assert.deepEqual(Core.merge(p,Core.blank()).sessions[1],p.sessions[1]);
});
test('refresh and stale-device merge preserve deadline and submitted snapshot',()=>{
  const p=Core.blank(),ids=words.filter(q=>q.session===2).map(q=>q.id);
  Core.startTimed(p,2,ids,time,1200);
  const stale=JSON.parse(JSON.stringify(p));
  Core.finishTimed(p,2,'2026-10-05T22:25:00.000Z');
  const merged=Core.merge(stale,p),r=merged.sessions[2].rounds[0];
  assert.equal(r.deadlineAt,'2026-10-05T22:20:00.000Z');
  assert.equal(r.finishedAt,r.deadlineAt);
  assert.equal(Object.keys(r.answers).length,40);
  assert.equal(Core.current(merged.sessions[2]).ids.length,40);
});
function browser(progress,url='https://shangguanyun08.github.io/marco-learning-hub/marco-zozeck-hard-2026/?session=1'){
  const {JSDOM}=require('C:/Users/A/Documents/Marco ISEE all tests/tmp/daily-sync-qa/node_modules/jsdom');
  const dom=new JSDOM('<main id="app"></main>',{url,runScripts:'outside-only'}),w=dom.window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.confirm=()=>true;
  let options;
  w.MarcoOnlineSync={create:o=>(options=o,{start:()=>{},push:()=>{},stop:()=>{}})};
  if(progress)w.localStorage.setItem('marco-zozeck-mixed-360-v1:progress',JSON.stringify(progress));
  for(const file of ['mixed-data.js','quiz-core.js','mixed-app.js'])w.eval(fs.readFileSync(path.join(__dirname,file),'utf8'));
  return {dom,w,get options(){return options;}};
}
test('UI: first miss has no solution in practice or results; second try reveals trick',()=>{
  const q=words.find(q=>q.session===1),p=Core.blank();
  Core.startTimed(p,1,words.filter(q=>q.session===1).map(q=>q.id),time);
  for(const item of words.filter(q=>q.session===1))Core.answer(p,1,item.id===q.id?item.choices.find(c=>c!==item.answer):item.answer,words,'2026-10-05T22:01:00.000Z',item.id);
  Core.finishTimed(p,1,'2026-10-05T22:02:00.000Z');
  const b=browser(p),d=b.w.document;
  assert.equal(d.querySelectorAll('.question-item').length,1);
  assert.equal(d.querySelectorAll('.question-item .solution').length,0);
  d.querySelector('[data-view="results"]').click();
  const result=d.querySelector('.result-question.wrong');
  assert.ok(result.querySelector('.answer-locked'));
  assert.ok(!result.querySelector('.solution'));
  d.querySelector('[data-view="practice"]').click();
  const wrong=[...d.querySelectorAll('[data-choice]')].find(e=>e.dataset.choice!==q.answer);
  wrong.click();d.querySelector('[data-check]').click();
  assert.equal(d.querySelectorAll('.question-item .solution').length,1);
  assert.match(d.querySelector('.solution').textContent,/Trick:/);
  d.querySelector('[data-submit]').click();
  assert.match(d.querySelector('.session-summary h2').textContent,/Round 3/);
  assert.equal(d.querySelectorAll('.question-item').length,1);
  assert.equal(d.querySelectorAll('.timer-bar').length,0);
  const right=[...d.querySelectorAll('[data-choice]')].find(e=>e.dataset.choice===q.answer);
  right.click();d.querySelector('[data-check]').click();d.querySelector('[data-submit]').click();
  assert.match(d.querySelector('.complete-card h2').textContent,/mastered/);
  assert.ok(d.querySelector('[data-session="1"]').classList.contains('mastered'));
  b.w.close();
});
test('UI: no timer before explicit start; all 40 choices available; new sync namespace; remote progress appears',()=>{
  const b=browser(),d=b.w.document;
  assert.equal(d.querySelectorAll('[data-session]').length,9);
  assert.equal(d.querySelectorAll('[data-clock]').length,0);
  assert.equal(b.options.appId,'marco-zozeck-mixed-360-v1');
  d.querySelector('[data-start]').click();
  assert.equal(d.querySelectorAll('.question-item').length,40);
  assert.equal(d.querySelectorAll('[data-clock]').length,1);
  assert.equal(d.querySelectorAll('.solution').length,0);
  assert.equal(b.w.localStorage.getItem('marco-zozeck-hard-2026-v1'),null);
  const p=JSON.parse(b.w.localStorage.getItem('marco-zozeck-mixed-360-v1:progress'));
  const q=words.find(q=>q.session===1);
  Core.answer(p,1,q.answer,words,new Date().toISOString(),q.id);
  b.options.onRemote(p);
  const chosen=d.querySelector('#q-'+q.id+' [aria-pressed="true"]');
  assert.equal(chosen.dataset.choice,q.answer);
  b.w.close();
});
test('archive retains old app, old data, base-relative scripts and old storage namespace',()=>{
  const html=fs.readFileSync(path.join(__dirname,'archive/index.html'),'utf8');
  assert.match(html,/<base href="\.\.\/">/);
  for(const file of ['zozeck-hard-data.js','redo-data.js','extension-data.js','review-data.js','quiz-core.js','app.js'])assert.ok(html.includes(file));
  const old=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
  assert.ok(old.includes("const APP_ID = 'marco-zozeck-hard-2026'"));
  assert.ok(old.includes('parentCompletions = {14:'));
});
