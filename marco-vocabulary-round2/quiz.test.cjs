const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {JSDOM} = require('../harry-math-practice/node_modules/jsdom');
const Core = require('./quiz-core.js');
const ctx = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'data.js'),'utf8'),ctx);
const words = JSON.parse(JSON.stringify(ctx.window.MARCO_VOCABULARY_WORDS));
const at = '2026-09-13T16:00:00.000Z';
const copy = value => JSON.parse(JSON.stringify(value));
function fixture() { const p=Core.blank(); Core.start(p,1,words.slice(0,3).map(w=>w.id),at); return p; }
function respond(p,correct=true) {
  const round=Core.current(p.sessions[1]),id=round.ids[round.position],word=words.find(w=>w.id===id);
  const choice=correct?id:Core.options(word,round.number,words).find(option=>option!==id);
  assert.equal(Core.answer(p,1,choice,words,at),true);
  return choice;
}
test('all original words retain their exact 18-session order',()=>{
  const old={window:{}};
  for(const name of ['data.js','art.js']) vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../marco-vocabulary-round2-archive',name),'utf8'),old);
  const ordered=Array.from(old.window.MARCO_R2_ART.images).sort((a,b)=>a.session-b.session||a.position-b.position);
  assert.equal(words.length,874);
  assert.equal(new Set(words.map(w=>w.id)).size,874);
  assert.deepEqual(words.map(w=>w.id),ordered.map(w=>w.id));
  assert.deepEqual(Array.from({length:18},(_,i)=>words.filter(w=>w.session===i+1).length),[...Array(17).fill(50),24]);
});
test('every question has four stable, unique options and exactly one answer',()=>{
  for(const word of words) for(const round of [1,2,3]) {
    const options=Core.options(word,round,words);
    assert.equal(options.length,4,word.id);
    assert.equal(new Set(options).size,4,word.id);
    assert.equal(options.filter(id=>id===word.id).length,1,word.id);
    assert.deepEqual(options,Core.options(word,round,words));
  }
});
test('answers lock immediately, invalid choices and skipping are rejected',()=>{
  const p=fixture();
  assert.equal(Core.advance(p,1,at),false);
  assert.equal(Core.answer(p,1,'not-a-word',words,at),false);
  respond(p,false);
  assert.equal(Core.answer(p,1,words[0].id,words,at),false);
  assert.equal(Core.advance(p,1,at),'next');
  assert.equal(Core.advance(p,1,at),false);
});
test('rounds 2 and 3 contain only previous misses, then mastery preserves scores',()=>{
  const p=fixture();
  respond(p,false);Core.advance(p,1,at);
  respond(p,true);Core.advance(p,1,at);
  respond(p,false);assert.equal(Core.advance(p,1,at),'round');
  assert.deepEqual(Core.current(p.sessions[1]).ids,[words[0].id,words[2].id]);
  respond(p,true);Core.advance(p,1,at);
  respond(p,false);Core.advance(p,1,at);
  assert.equal(Core.current(p.sessions[1]).number,3);
  assert.deepEqual(Core.current(p.sessions[1]).ids,[words[2].id]);
  respond(p,true);assert.equal(Core.advance(p,1,at),'complete');
  assert.equal(p.sessions[1].completedAt,at);
  assert.equal(p.sessions[1].rounds.length,3);
  assert.equal(p.sessions[1].rounds[0].answers[words[0].id].correct,false);
  assert.equal(Core.answer(p,1,words[2].id,words,at),false);
});
test('continued misses allow another round, matching the reference',()=>{
  const p=Core.blank();Core.start(p,1,[words[0].id],at);
  for(let i=0;i<3;i++){respond(p,false);Core.advance(p,1,at);}
  assert.equal(Core.current(p.sessions[1]).number,4);
});
test('stale saves preserve later answers, completed rounds, and other sessions',()=>{
  const p=fixture(),stale=copy(p);
  respond(p,false);Core.advance(p,1,at);respond(p,true);
  Core.start(stale,2,words.filter(w=>w.session===2).map(w=>w.id),at);
  const merged=Core.merge(p,stale);
  assert.equal(Core.current(merged.sessions[1]).position,1);
  assert.equal(Object.keys(Core.current(merged.sessions[1]).answers).length,2);
  assert.equal(merged.sessions[2].rounds[0].ids.length,50);
});
test('conflicting device answers keep the earliest immutable selection',()=>{
  const p=fixture(),other=copy(p);
  respond(p,false);
  Core.answer(other,1,words[0].id,words,'2026-09-13T16:01:00.000Z');
  assert.equal(Core.merge(p,other).sessions[1].rounds[0].answers[words[0].id].correct,false);
  assert.deepEqual(Core.merge(p,other),Core.merge(other,p));
});
function browser(saved={},url='http://localhost/marco-vocabulary-round2/') {
  const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),{url,runScripts:'outside-only'});
  for(const [key,value] of Object.entries(saved)) dom.window.localStorage.setItem(key,JSON.stringify(value));
  const calls=[];
  dom.window.MarcoOnlineSync={create(options){calls.push(options);return{push:value=>calls.push(copy(value)),start:value=>calls.push(copy(value)),refresh:async()=>{}};}};
  for(const file of ['data.js','quiz-core.js','app.js']) dom.window.eval(fs.readFileSync(path.join(__dirname,file),'utf8'));
  return {dom,w:dom.window,d:dom.window.document,calls};
}
test('local preview never syncs, old records remain intact, and no artwork loads',()=>{
  const legacy={version:1,layoutVersion:3,activeSession:7,sessions:{7:{testedKnown:['test'],round:2}},activity:[{wordId:'test',correct:false}]};
  const b=browser({'marco-round2-vocabulary-660-v1':legacy});
  assert.equal(b.calls.length,0);
  assert.equal(b.d.querySelectorAll('img,svg,image,script[src*="tracker"]').length,0);
  const saved=JSON.parse(b.w.localStorage.getItem('marco-round2-vocabulary-660-v1'));
  assert.deepEqual(saved.sessions,legacy.sessions);assert.deepEqual(saved.activity,legacy.activity);assert.equal(saved.activeSession,7);
  b.dom.window.close();
});
test('all 18 sessions are directly available and all questions and locked answers survive reload',()=>{
  let b=browser();
  assert.equal(b.d.querySelectorAll('.session-picker [data-session]').length,18);
  assert.equal(b.d.querySelectorAll('[data-set],.week-menu,[data-next]').length,0);
  assert.equal(b.d.querySelectorAll('.question-item').length,50);
  assert.equal(b.d.querySelectorAll('[data-answer]').length,200);
  b.d.querySelector('[data-answer="fiscal"]').click();
  assert.equal(b.d.querySelectorAll('[data-answer]:disabled').length,4);
  assert.match(b.d.querySelector('.instant-feedback').textContent,/Correct!/);
  const saved=Object.fromEntries(Object.keys(b.w.localStorage).map(k=>[k,JSON.parse(b.w.localStorage.getItem(k))]));
  b.w.close();b=browser(saved);
  assert.equal(b.d.querySelectorAll('[data-answer]:disabled').length,4);
  assert.equal(b.d.querySelectorAll('.question-item').length,50);
  b.d.querySelector('[data-session="18"]').click();
  assert.equal(b.d.querySelectorAll('.question-item').length,24);
  assert.equal(b.d.querySelectorAll('.number-grid>button').length,24);
  assert.match(b.d.querySelector('.round-heading').textContent,/Words 851–874/);
  b.w.close();
});
test('online remote updates preserve archive records and merge test answers',()=>{
  const b=browser({},'https://example.com/marco-vocabulary-round2/');
  b.d.querySelector('[data-answer="fiscal"]').click();
  const remote={version:1,layoutVersion:3,activeSession:8,sessions:{8:{testedKnown:['abc']}},activity:[{wordId:'abc'}]};
  b.calls[0].onRemote(remote);
  const saved=JSON.parse(b.w.localStorage.getItem('marco-round2-vocabulary-660-v1'));
  assert.equal(saved.sessions[8].testedKnown[0],'abc');
  assert.equal(saved.vocabularyTests.sessions[1].rounds[0].answers.fiscal.correct,true);
  assert.equal(b.d.querySelectorAll('[data-answer]:disabled').length,4);
  assert.equal(b.d.querySelectorAll('script[src*="tracker"]').length,1);
  b.w.close();
});
test('a complete 50-word UI session advances through three rounds and reviews original scores',()=>{
  const b=browser();
  function clickAnswer(correct) {
    const stored=JSON.parse(b.w.localStorage.getItem('marco-vocabulary-tests-v1'));
    const r=Core.current(stored.sessions[1]),id=r.ids.find(id=>!r.answers[id]);
    const button=[...b.d.querySelectorAll(`[data-word-id="${id}"] [data-answer]`)].find(node=>(node.dataset.answer===id)===correct);
    button.click();
  }
  for(let i=0;i<50;i++) clickAnswer(i>=2);
  assert.equal(b.d.querySelectorAll('.question-item').length,50);
  b.d.querySelector('[data-finish-round]').click();
  assert.match(b.d.querySelector('.round-subheading').textContent,/Round 2/);
  assert.equal(b.d.querySelectorAll('.question-item').length,2);
  clickAnswer(true);clickAnswer(false);
  b.d.querySelector('[data-finish-round]').click();
  assert.match(b.d.querySelector('.round-subheading').textContent,/Round 3/);
  assert.equal(b.d.querySelectorAll('.question-item').length,1);
  clickAnswer(true);
  b.d.querySelector('[data-finish-round]').click();
  assert.match(b.d.querySelector('.complete-card').textContent,/mastered/);
  b.d.querySelector('[data-view="results"]').click();
  assert.equal(b.d.querySelectorAll('.round-list details').length,3);
  assert.match(b.d.querySelector('.round-list .score').textContent,/48\/50/);
  assert.equal(b.d.querySelectorAll('[data-result="1-1"] .answer-review>.wrong').length,2);
  b.w.close();
});
test('questions may be answered out of order, with no early round completion or cross-session answers',()=>{
  const p=fixture(), ids=p.sessions[1].rounds[0].ids;
  assert.equal(Core.answer(p,1,words[50].id,words,at,words[50].id),false);
  assert.equal(Core.answer(p,1,ids[2],words,at,ids[2]),true);
  assert.equal(Core.finishRound(p,1,at),false);
  assert.equal(Core.answer(p,1,ids[0],words,at,ids[0]),true);
  assert.equal(Core.finishRound(p,1,at),false);
  assert.equal(Core.answer(p,1,ids[1],words,at,ids[1]),true);
  assert.equal(Core.finishRound(p,1,at),'complete');
  assert.equal(Core.finishRound(p,1,at),false);
  assert.equal(p.sessions[1].rounds.length,1);
});
test('one-page UI saves the last question first and preserves earlier one-question progress',()=>{
  const p=Core.blank(),ids=words.filter(w=>w.session===1).map(w=>w.id);
  Core.start(p,1,ids,at);
  for(let i=0;i<3;i++) {Core.answer(p,1,ids[i],words,at);Core.advance(p,1,at);}
  const b=browser({'marco-vocabulary-tests-v1':p});
  assert.equal(b.d.querySelectorAll('.question-item').length,50);
  assert.equal(b.d.querySelectorAll('[data-answer]:disabled').length,12);
  assert.equal(b.d.querySelector('[data-finish-round]').disabled,true);
  const last=ids.at(-1);
  b.d.querySelector(`[data-word-id="${last}"] [data-answer="${last}"]`).click();
  const saved=JSON.parse(b.w.localStorage.getItem('marco-vocabulary-tests-v1'));
  const round=saved.sessions[1].rounds[0];
  for(const id of ids.slice(0,3)) assert.deepEqual(round.answers[id],p.sessions[1].rounds[0].answers[id]);
  assert.equal(round.answers[last].correct,true);
  assert.equal(Object.keys(round.answers).length,4);
  assert.equal(b.d.querySelector('[data-finish-round]').disabled,true);
  assert.equal(b.d.querySelectorAll('.question-item').length,50);
  b.w.close();
});
test('every session renders its complete word list without paging or filtering',()=>{
  const b=browser();
  for(let session=1;session<=18;session++) {
    b.d.querySelector(`.session-picker [data-session="${session}"]`).click();
    const expected=words.filter(w=>w.session===session).map(w=>w.id);
    assert.deepEqual([...b.d.querySelectorAll('.question-item')].map(node=>node.dataset.wordId),expected);
    assert.equal(b.d.querySelectorAll('.session-picker [data-session]').length,18);
  }
  b.w.close();
});
test('every archived illustration referenced by the original manifest still exists',()=>{
  const old={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../marco-vocabulary-round2-archive/art.js'),'utf8'),old);
  for(const atlas of old.window.MARCO_R2_ART.atlases) assert.ok(fs.existsSync(path.join(__dirname,'../marco-vocabulary-round2-archive/illustrations',atlas.file)),atlas.file);
  const originalHTML=fs.readFileSync(path.join(__dirname,'../marco-vocabulary-round2-archive/index.html'),'utf8');
  assert.match(originalHTML,/\.\/art.js/);
  assert.match(originalHTML,/\.\.\/shared-online-sync.js/);
});
