import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8'),KEY='harry-star-sept20-four-sessions-v1';
function boot(id='sept27-original',saved){
 const dom=new JSDOM(read('./index.html'),{url:'http://localhost/?session='+id,runScripts:'outside-only'}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};if(saved)w.localStorage.setItem(KEY,saved);
 for(const file of ['../../harry-star-math/tests/2026-09-20/data.js','data.js','sept27-data.js','think-sept27-data.js','visuals.js','engine.js','sync.js','app.js'])w.eval(read('./'+file));
 return {w,d:w.document,s:w.HARRY_SEPT_PRACTICE.find(s=>s.id===id),close:()=>w.close()};
}
function answer(t,q,value){const f=t.d.querySelector(`form[data-source="${q.source}"]`);if(q.type==='number')f.querySelector('input').value=value;else f.querySelector(`input[value="${value}"]`).checked=true;f.dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
test('Think Academy adds exactly three items to each September 27 set, without changing STAR identities',()=>{
 const t=boot(),sets=t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-09-27');
 assert.equal(t.d.querySelectorAll('.question').length,13);assert.equal(t.d.querySelectorAll('.answer').length,0);
 for(const s of sets){assert.equal(s.questions.length,13);assert.deepEqual(Array.from(s.questions.slice(10),q=>q.source),[102,104,106]);assert.equal(s.questions[10].type,'number');}
 for(const s of t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-09-20'))assert.equal(s.questions.length,12);
 assert.match(t.d.querySelector('#q11 .source').textContent,/Think Academy Q2/);assert.match(t.d.querySelector('#q12 .source').textContent,/Think Academy Q4/);assert.equal(t.d.querySelectorAll('#q12 tbody tr').length,4);
 assert.equal(t.s.questions[10].correct,2600);assert.deepEqual(Array.from(t.s.questions[11].choices),['a ÷ 5','a × 5','a + 5','a − 16']);assert.deepEqual(Array.from(t.s.questions[12].choices),['20','2','40','200']);t.close();
});
test('All Think Academy keys independently match arithmetic and every table row',()=>{
 const t=boot(),sets=t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-09-27');
 const multiplications=[[25,104],[25,108],[40,103],[50,106]],comparisons=[[8000000,40000],[6000000,30000],[12000000,80000],[15000000,60000]];
 sets.forEach((s,i)=>{const [n,r,c]=s.questions.slice(10);assert.equal(n.correct,multiplications[i][0]*multiplications[i][1]);assert.equal(r.choices[r.correct],'a ÷ '+(5+i));for(const row of r.visual.rows)assert.equal(row[1],row[0]/(5+i));assert.equal(Number(c.choices[c.correct]),comparisons[i][0]/comparisons[i][1]);});t.close();
});
test('Typed answers reject blanks and repeated guesses, accept commas, preserve first miss and reload',()=>{
 let t=boot(),q=t.s.questions[10];for(const invalid of ['',' ','abc','26e2'])answer(t,q,invalid);assert.equal(t.w.localStorage.getItem(KEY),null);
 answer(t,q,'7200');assert.equal(t.d.querySelector('#q11 .answer'),null);answer(t,q,'7,200');let state=JSON.parse(t.w.localStorage.getItem(KEY));assert.equal(state.sessions[t.s.id][0].answers[102].attempts.length,1);
 const saved=t.w.localStorage.getItem(KEY);t.close();t=boot('sept27-original',saved);q=t.s.questions[10];answer(t,q,'2,600');assert.equal(t.d.querySelector('#score').textContent,'0 / 13');assert.match(t.d.querySelector('#q11 .answer').textContent,/2,600/);assert.match(t.d.querySelector('#history').textContent,/Think Academy Q2.*7200.*2600/);state=JSON.parse(t.w.localStorage.getItem(KEY));assert(t.w.HarrySeptSync.valid(state));assert.equal(state.sessions[t.s.id][0].answers[102].attempts[1].choice,'2600');t.close();
});
test('A second typed miss reveals the answer without first-try credit',()=>{
 const t=boot(),q=t.s.questions[10];answer(t,q,'2500');answer(t,q,'100');assert(t.d.querySelector('#q11 .answer'));assert(t.d.querySelector('#q11 input').disabled);assert.equal(t.d.querySelector('#score').textContent,'0 / 13');t.close();
});
test('All four 13-question sessions can complete, sync and retain an earlier run',()=>{
 for(const id of ['sept27-original','sept27-a','sept27-b','sept27-c']){
  const t=boot(id);for(const q of t.s.questions)answer(t,q,q.correct);
  assert.equal(t.d.querySelector('#score').textContent,'13 / 13');assert(!t.d.querySelector('#completion').hidden);assert.match(t.d.querySelector('#completion').textContent,/100%/);
  const saved=JSON.parse(t.w.localStorage.getItem(KEY)),run=saved.sessions[id][0];assert(t.w.HarrySeptSync.valid(saved));const merged=t.w.HarrySeptSync.merge(saved,{version:1,sessions:{}});assert.equal(merged.sessions[id][0].answers[102].attempts[0].choice,String(t.s.questions[10].correct));
  t.d.querySelector('#new-run').click();const state=JSON.parse(t.w.localStorage.getItem(KEY));assert.equal(state.sessions[id].length,2);assert.deepEqual(state.sessions[id][0],run);t.close();
 }
});
test('An existing 10-question run keeps all answers while the three additions start unattempted',()=>{
 let t=boot(),at='2026-09-27T17:00:00.000Z';const old={id:'existing',startedAt:at,completedAt:at,answers:Object.fromEntries(t.s.questions.slice(0,10).map(q=>[q.source,{attempts:[{choice:q.correct,correct:true,at}]}]))};t.close();
 const saved=JSON.stringify({version:1,sessions:{'sept27-original':[old]}});t=boot('sept27-original',saved);assert.equal(t.d.querySelector('#score').textContent,'10 / 13');assert(t.d.querySelector('#completion').hidden);assert.match(t.d.querySelector('#history').textContent,/added questions pending/);assert.equal(t.d.querySelector('#q11 .answer'),null);
 answer(t,t.s.questions[10],2600);const state=JSON.parse(t.w.localStorage.getItem(KEY));for(const [source,entry] of Object.entries(old.answers))assert.deepEqual(state.sessions[t.s.id][0].answers[source],entry);t.close();
});
