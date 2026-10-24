const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../harry-math-practice/node_modules/jsdom');
const KEY='harry-reading-readtheory-2026-10-21-v1';
function boot(saved){
  const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),{url:'http://localhost/harry-reading/',runScripts:'outside-only'}),w=dom.window;
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false});
  if(saved)w.localStorage.setItem(KEY,saved);
  for(const f of ['data.js','grade3-practice.js','core.js','app.js'])w.eval(fs.readFileSync(path.join(__dirname,f),'utf8'));
  return {w,d:w.document,close:()=>w.close(),saved:()=>w.localStorage.getItem(KEY)};
}
function choose(t,index){const input=t.d.querySelector(`input[value="${index}"]`);input.click();}
function check(t){t.d.querySelector('#answer-form').dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
function highlight(t){t.d.querySelector('[data-sid="p0s0"]').click();}
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
  assert.match(t.d.querySelector('.stat').textContent,/1\/2/);
  assert.equal(t.d.querySelectorAll('.question-review').length,2);assert.equal(t.d.querySelectorAll('.question-review .evidence-list').length,3);
  for(const panel of t.d.querySelectorAll('.review-details'))assert.equal(panel.hidden,true);
  t.d.querySelector('[data-review]').click();assert.equal(t.d.querySelector('.review-details').hidden,false);
  t.d.querySelector('#all-articles').click();assert.equal(t.d.querySelectorAll('.history-record [data-review]').length,2);
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
