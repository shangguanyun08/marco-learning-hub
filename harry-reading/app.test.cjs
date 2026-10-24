const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
let JSDOM;try{({JSDOM}=require('jsdom'));}catch{({JSDOM}=require('../harry-math-practice/node_modules/jsdom'));}
const KEY='harry-reading-readtheory-2026-10-21-v1';
function boot(saved,fetcher){
  const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),{url:fetcher?'https://shangguanyun08.github.io/marco-learning-hub/harry-reading/':'http://localhost/harry-reading/',runScripts:'outside-only'}),w=dom.window;
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false});
  if(saved)w.localStorage.setItem(KEY,saved);
  if(fetcher){w.fetch=fetcher;w.AbortSignal=AbortSignal;}
  for(const f of ['data.js','grade3-practice.js','core.js','sync.js','app.js'])w.eval(fs.readFileSync(path.join(__dirname,f),'utf8'));
  return {w,d:w.document,close:()=>w.close(),saved:()=>w.localStorage.getItem(KEY)};
}
function choose(t,index){const input=t.d.querySelector(`input[value="${index}"]`);input.click();}
function check(t){t.d.querySelector('#answer-form').dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
function highlight(t){t.d.querySelector('[data-sid="p0s0"]').click();}
test('All articles is in the top bar and preserves an unfinished answer and highlight',()=>{
  const t=boot();assert.equal(t.d.querySelectorAll('#back-home').length,1);assert.ok(t.d.querySelector('.topbar #back-home'));
  assert.doesNotMatch(t.d.querySelector('.topbar').textContent,/HARRY’S READING/);
  t.d.querySelector('[data-open="carla"]').click();choose(t,2);highlight(t);const saved=t.saved();
  assert.equal(t.d.querySelector('.workspace-head #back-home'),null);t.d.querySelector('#back-home').click();
  assert.ok(t.d.querySelector('[data-open="carla"]'));assert.equal(t.saved(),saved);
  t.d.querySelector('[data-open="carla"]').click();assert.ok(t.d.querySelector('input[value="2"]').checked);assert.ok(t.d.querySelector('#passage mark'));t.close();
});

test('existing browser work uploads automatically and appears in a second browser with original scores and highlights',async()=>{
  const old={choice:2,checkedAt:'2026-10-22T10:00:00Z',answerOK:true,marks:[{sid:'p0s0',start:0,end:15}]};
  const saved=JSON.stringify({version:1,articles:{carla:[{id:'old',startedAt:'2026-10-22T10:00:00Z',position:0,answers:{'carla-4':[old]}}]}});
  let remote=null,uploads=0;
  const fetcher=async(_url,options)=>{if(options.method==='POST'){const p=JSON.parse(options.body);remote={state:p.state,version:(remote?.version||0)+1};uploads++;return {ok:true,json:async()=>({accepted:true,progress:remote})};}return {ok:true,json:async()=>({progress:remote})};};
  const settle=async t=>{for(let i=0;i<100&&t.d.querySelector('#save-status').textContent!=='Synced online';i++)await new Promise(r=>setTimeout(r,5));assert.equal(t.d.querySelector('#save-status').textContent,'Synced online');};
  const a=boot(saved,fetcher);await settle(a);assert.ok(uploads);assert.equal(a.w.localStorage.getItem(KEY+':before-cloud-sync'),saved);
  const b=boot(null,fetcher);await settle(b);b.d.querySelector('[data-open="carla"]').click();
  assert.equal(b.d.querySelector('input:checked').value,'2');assert.ok(b.d.querySelector('#passage mark'));assert.match(b.d.querySelector('.feedback').textContent,/correct/);
  assert.deepEqual(JSON.parse(b.saved()).articles.carla[0].answers['carla-4'][0],old);a.close();b.close();
});
test('correct answer plus unrelated highlight resolves; review is manual and does not alter records',()=>{
  const t=boot();t.d.querySelector('[data-open="carla"]').click();
  choose(t,2);assert.equal(t.d.querySelector('#check').disabled,true);
  highlight(t);assert.equal(t.d.querySelector('#check').disabled,false);check(t);
  assert.match(t.d.querySelector('.feedback').textContent,/Answer: correct/);
  assert.equal(t.d.querySelector('#answer-form'),null);
  assert.match(t.d.querySelector('.evidence-list').textContent,/Carla is a cat/);
  const panel=t.d.querySelector('.review-details'),button=t.d.querySelector('[data-review]');
  assert.equal(panel.hidden,true);assert.match(button.textContent,/Show answer and explanation/);
  const saved=t.saved();button.click();assert.equal(panel.hidden,false);assert.match(panel.textContent,/Squirrels run down the driveway/);assert.equal(t.saved(),saved);
  button.click();assert.equal(panel.hidden,true);
  assert.doesNotMatch(t.d.querySelector('.feedback').textContent,/Evidence:|not enough|found the proof/);
  const reload=boot(saved);reload.d.querySelector('[data-open="carla"]').click();assert.match(reload.d.querySelector('.feedback').textContent,/Answer: correct/);assert.equal(reload.d.querySelector('.review-details').hidden,true);
  reload.close();t.close();
});
test('wrong choices get exactly two checks; explanation stays hidden until clicked; summary/history keep both highlights',()=>{
  const t=boot();t.d.querySelector('[data-open="carla"]').click();choose(t,0);highlight(t);check(t);
  assert.match(t.d.querySelector('.feedback').textContent,/Answer: incorrect/);assert.equal(t.d.querySelector('[data-review]'),null);
  choose(t,1);check(t);assert.equal(t.d.querySelector('#answer-form'),null);assert.equal(t.d.querySelector('.review-details').hidden,true);
  assert.match(t.d.querySelector('.feedback').textContent,/Answer: incorrect/);
  t.d.querySelector('#next').click();choose(t,1);highlight(t);check(t);t.d.querySelector('#next').click();
  assert.match(t.d.querySelector('.workspace-head').textContent,/First answers: 1\/2/);
  assert.equal(t.d.querySelectorAll('.answer-choices .choice').length,4);assert.equal(t.d.querySelectorAll('[data-attempt]').length,2);
  for(const panel of t.d.querySelectorAll('.review-details'))assert.equal(panel.hidden,true);
  t.d.querySelector('[data-review]').click();assert.equal(t.d.querySelector('.review-details').hidden,false);
  t.d.querySelector('#back-home').click();assert.equal(t.d.querySelectorAll('.history-record [data-review]').length,2);
  assert.doesNotMatch(t.d.querySelector('.history').textContent,/Evidence right|Evidence supported|Evidence needs/);
  const r=JSON.parse(t.saved()).articles.carla[0];assert.equal(r.answers['carla-4'].length,2);assert.equal(r.answers['carla-4'][0].choice,0);assert.equal(r.answers['carla-4'][0].marks[0].quote,'Carla is a cat. ');
  t.close();
});
test('legacy rejected highlight cannot force a retry and old attempt objects are preserved',()=>{
  const old={choice:2,checkedAt:'2026-10-22T10:00:00Z',answerOK:true,evidenceOK:false,focused:false,supported:[false],marks:[{sid:'p0s0',start:0,end:15}]};
  const saved=JSON.stringify({version:1,articles:{carla:[{id:'old',startedAt:'2026-10-22T10:00:00Z',position:0,answers:{'carla-4':[old]}}]}});
  const t=boot(saved);t.d.querySelector('[data-open="carla"]').click();assert.match(t.d.querySelector('.feedback').textContent,/Answer: correct/);assert.ok(t.d.querySelector('#next'));
  assert.deepEqual(JSON.parse(t.saved()).articles.carla[0].answers['carla-4'][0],old);t.close();
});
test('reopened completed results show the full article and per-attempt highlights without changing records',()=>{
  const t=boot();t.d.querySelector('[data-open="carla"]').click();choose(t,0);highlight(t);check(t);
  t.d.querySelector('[data-sid="p0s1"]').click();choose(t,2);check(t);t.d.querySelector('#next').click();choose(t,1);highlight(t);check(t);
  const saved=t.saved();t.close();
  const reopened=boot(saved);reopened.d.querySelector('[data-open="carla"]').click();
  assert.ok(reopened.d.querySelector('.practice-layout .passage-panel'));
  assert.match(reopened.d.querySelector('#passage').textContent,/And for Carla, it's good to love your job/);
  assert.equal(reopened.d.querySelectorAll('#passage mark').length,1);
  assert.equal(reopened.d.querySelectorAll('.answer-choices .choice').length,4);
  assert.equal(reopened.d.querySelector('input:checked').value,'0');
  const before=reopened.saved();reopened.d.querySelector('[data-attempt="1"]').click();
  assert.equal(reopened.d.querySelectorAll('#passage mark').length,2);
  assert.equal(reopened.d.querySelector('input:checked').value,'2');
  assert.equal(reopened.d.querySelectorAll('#passage [role=button]').length,0);
  reopened.d.querySelector('#review-next').click();assert.equal(reopened.d.querySelector('input:checked').value,'1');
  reopened.d.querySelector('#review-prev').click();assert.equal(reopened.d.querySelector('input:checked').value,'0');
  reopened.d.querySelector('[data-review]').click();assert.equal(reopened.d.querySelector('.review-details').hidden,false);
  assert.equal(reopened.saved(),before);reopened.close();
});
test('history review opens the selected old run, not the latest, and never reveals unchecked answers',()=>{
  const checked={choice:2,checkedAt:'old',answerOK:true,marks:[{sid:'p0s0',start:0,end:15}]};
  const old={id:'old',startedAt:'2026-10-22T10:00:00Z',answers:{'carla-4':[checked]}},fresh={id:'new',startedAt:'2026-10-23T10:00:00Z',answers:{}};
  const t=boot(JSON.stringify({version:1,articles:{carla:[old,fresh]}})),before=t.saved();
  t.d.querySelector('[data-history-review="carla"][data-run="0"]').click();
  assert.match(t.d.querySelector('.workspace-head').textContent,/Practice 1/);assert.match(t.d.querySelector('.workspace-head').textContent,/In progress/);
  assert.equal(t.d.querySelectorAll('.question-panel [data-review]').length,1);
  assert.equal(t.d.querySelector('#passage mark').textContent,'Carla is a cat.');
  t.d.querySelector('#review-next').click();assert.match(t.d.querySelector('.question-panel').textContent,/Not checked yet/);assert.equal(t.d.querySelector('[data-review]'),null);
  assert.equal(t.saved(),before);t.close();
});

test('all first answers turn a card Finished even with wrong answers and no second tries',()=>{
  const at='2026-10-24T10:00:00Z',answers={'carla-4':[{choice:0,checkedAt:at,answerOK:false,marks:[]}],'carla-5':[{choice:0,checkedAt:at,answerOK:false,marks:[]}]};
  const saved=JSON.stringify({version:1,articles:{carla:[{id:'first-pass',startedAt:at,position:1,completedAt:null,answers,drafts:{}}]}}),t=boot(saved),card=t.d.querySelector('[data-open="carla"]').closest('.card');
  assert.ok(card.classList.contains('done'));assert.equal(card.querySelector('.completion-badge').textContent,'✓ Finished');assert.match(card.textContent,/2 of 2 questions answered · 0 answers correct/);assert.match(card.querySelector('button').textContent,/Review practice/);assert.equal(t.saved(),saved);
  // Opening this finished first pass still offers the optional retry, without inventing one.
  card.querySelector('button').click();assert.match(t.d.querySelector('#check').textContent,/second/);const r=JSON.parse(t.saved()).articles.carla[0];assert.equal(r.answers['carla-4'].length,1);assert.equal(r.answers['carla-5'].length,1);t.close();
});

test('partial, unchecked, or a new unfinished run does not get the Finished color',()=>{
  const at='2026-10-24T10:00:00Z',checked={choice:2,checkedAt:at,answerOK:true,marks:[]};
  for(const runs of [
    [{id:'partial',startedAt:at,answers:{'carla-4':[checked]}}],
    [{id:'unchecked',startedAt:at,answers:{'carla-4':[checked],'carla-5':[{choice:1,checkedAt:null,marks:[]}]}}],
    [{id:'old',startedAt:at,answers:{'carla-4':[checked],'carla-5':[{...checked,choice:1}]}},{id:'fresh',startedAt:'2026-10-24T11:00:00Z',answers:{}}]
  ]){const t=boot(JSON.stringify({version:1,articles:{carla:runs}})),card=t.d.querySelector('[data-open="carla"]').closest('.card');assert.equal(card.classList.contains('done'),false);assert.equal(card.querySelector('.completion-badge'),null);t.close();}
});

test('cloud-loaded first-pass completion shows Finished without uploading fabricated retries',async()=>{
  const at='2026-10-24T10:00:00Z',state={version:1,articles:{carla:[{id:'cloud-first',startedAt:at,completedAt:null,position:1,answers:{'carla-4':[{choice:0,checkedAt:at,answerOK:false,marks:[]}],'carla-5':[{choice:0,checkedAt:at,answerOK:false,marks:[]}]}}]}};
  let remote={version:1,state};const fetcher=async(_url,options)=>{if(options.method==='POST')remote={version:remote.version+1,state:JSON.parse(options.body).state};return {ok:true,json:async()=>({progress:remote,accepted:true})};};
  const t=boot(null,fetcher);try{
    for(let i=0;i<100&&t.d.querySelector('#save-status').textContent!=='Synced online';i++)await new Promise(r=>setTimeout(r,5));
    assert.equal(t.d.querySelector('#save-status').textContent,'Synced online');assert.ok(t.d.querySelector('[data-open="carla"]').closest('.card').classList.contains('done'));assert.equal(JSON.parse(t.saved()).articles.carla[0].answers['carla-4'].length,1);assert.equal(remote.state.articles.carla[0].answers['carla-5'].length,1);
  }finally{t.close();}
});

test('unchecked selection stays neutral; wrong first check is red without revealing a green correct choice',()=>{
  const t=boot();try{
    t.d.querySelector('[data-open="carla"]').click();choose(t,0);
    assert.equal(t.d.querySelector('.answer-correct,.answer-incorrect'),null);highlight(t);check(t);
    assert.ok(t.d.querySelector('input[value="0"]').closest('.choice').classList.contains('answer-incorrect'));
    assert.equal(t.d.querySelector('.answer-correct'),null);assert.equal(t.d.querySelector('.review-details'),null);
    choose(t,2);assert.equal(t.d.querySelector('input[value="2"]').closest('.choice').hasAttribute('data-answer-status'),false);
    assert.ok(t.d.querySelector('input[value="0"]').closest('.choice').classList.contains('answer-incorrect'));check(t);
    assert.ok(t.d.querySelector('input[value="2"]').closest('.choice').classList.contains('answer-correct'));
    assert.equal(t.d.querySelector('.answer-incorrect'),null);
  }finally{t.close();}
});

test('two wrong tries stay red, and saved review attempts have their own correct/incorrect colors',()=>{
  const t=boot();try{
    t.d.querySelector('[data-open="carla"]').click();choose(t,0);highlight(t);check(t);choose(t,1);check(t);
    assert.ok(t.d.querySelector('input:checked').closest('.choice').classList.contains('answer-incorrect'));assert.equal(t.d.querySelector('.answer-correct'),null);
    t.d.querySelector('#next').click();choose(t,1);highlight(t);check(t);t.d.querySelector('#next').click();
    assert.ok(t.d.querySelector('[data-attempt="0"]').classList.contains('is-incorrect'));
    assert.ok(t.d.querySelector('[data-attempt="1"]').classList.contains('is-incorrect'));
    t.d.querySelector('[data-attempt="1"]').click();assert.ok(t.d.querySelector('input:checked').closest('.choice').classList.contains('answer-incorrect'));
    t.d.querySelector('#review-next').click();assert.ok(t.d.querySelector('input:checked').closest('.choice').classList.contains('answer-correct'));
    assert.ok(t.d.querySelector('[data-attempt="0"]').classList.contains('is-correct'));
  }finally{t.close();}
});
