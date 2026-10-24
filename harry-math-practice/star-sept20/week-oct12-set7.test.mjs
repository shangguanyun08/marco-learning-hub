import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const ID='week-oct12-7',KEY='harry-star-sept20-four-sessions-v1',copy=x=>JSON.parse(JSON.stringify(x));
const read=f=>readFileSync(new URL(f,import.meta.url),'utf8');
const unlock=()=>({version:1,sessions:{'week-oct12-3-5':[{id:'previous-day-3-5',startedAt:'2026-10-24T10:00:00Z',completedAt:'2026-10-24T10:01:00Z',answers:Object.fromEntries([7,11,14,43,12,21].map((n,i)=>[i+1,{attempts:[{choice:String(n),correct:true,at:'2026-10-24T10:01:00Z'}]}]))}]}});
function boot(t,query='?session='+ID,state=unlock(),includeSet7=true){
 const w=new JSDOM(read('./index.html'),{url:'http://localhost/'+query,runScripts:'outside-only'}).window;
 t.after(()=>w.close());w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.fetch=()=>{throw Error('No test may contact live learner sync');};
 if(state)w.localStorage.setItem(KEY,JSON.stringify(state));
 for(const tag of w.document.querySelectorAll('script[defer][src]')){const src=tag.getAttribute('src').split('?')[0];if(includeSet7||!src.includes('set7.js'))w.eval(read(src));}
 return {w,d:w.document,s:w.HARRY_SEPT_PRACTICE.find(s=>s.id===ID),saved:()=>JSON.parse(w.localStorage.getItem(KEY)||'null')};
}
function answer(b,q,value){
 const form=b.d.querySelector(`form[data-source="${q.source}"]`);
 if(value!==null){if(q.type==='number')form.querySelector('input[name="number-answer"]').value=String(value);else form.querySelector(`input[value="${value}"]`).checked=true;}
 form.dispatchEvent(new b.w.Event('submit',{bubbles:true,cancelable:true}));
}
const correct=q=>q.type==='number'?String(q.correct):q.correct;

test('Set 7 follows Extra review with eight fresh answers; earlier questions and prerequisite stay intact',t=>{
 const before=boot(t,'?group=week-2026-10-12',unlock(),false),b=boot(t,'?group=week-2026-10-12');
 assert.deepEqual(copy(b.w.HARRY_SEPT_PRACTICE.filter(s=>s.id!==ID)),copy(before.w.HARRY_SEPT_PRACTICE));
 const weekly=b.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='week-2026-10-12');
 assert.deepEqual(Array.from(weekly.slice(-2),s=>s.id),['week-oct12-extra-review',ID]);
 assert.equal(b.s.questions.length,8);assert.equal(new Set(b.s.questions.map(q=>q.source)).size,8);
 assert.equal(b.s.questions.filter(q=>q.type==='number').length,6);assert.ok(b.s.questions.every(q=>q.retryUntilCorrect));
 const link=b.d.querySelector(`.session-link[href="?session=${ID}"]`);assert.match(link.textContent,/Set 7/);assert.match(link.textContent,/8\/8 \(100%\) first try/);
 assert.equal(b.d.querySelector(`a[href="?session=${ID}-round2"]`),null);
 assert.match(b.w.HarryWeekRules.lockReason(b.s,{version:1,sessions:{}}),/Day 3.5/);
 assert.equal(b.w.HarryWeekRules.lockReason(b.s,unlock()),'');
 const keys=[9*4,4*16,2,46*23,(28*35)/100,(2648+1775)/100,2*(17+8),1];
 assert.deepEqual(Array.from(b.s.questions,q=>q.correct),keys);
 const numberLine=b.s.questions[2];assert.equal(numberLine.choices[numberLine.correct],'2 5/8');
 const sum=b.s.questions[7],value=s=>{const [whole,fraction]=s.split(' '),[n,d]=fraction.split('/').map(Number);return +whole+n/d;};
 sum.choices.forEach((c,i)=>assert.equal(value(c)>=3,i===sum.correct));assert.equal(5/4+5/4+5/4,value(sum.choices[sum.correct]));
});

test('All eight correct first submissions earn 100%, persist after reload, and leave earlier records unchanged',t=>{
 const earlier=unlock(),b=boot(t),initial=copy(b.saved());
 assert.equal(b.d.querySelectorAll('#questions .question').length,8);assert.equal(b.d.querySelectorAll('#questions .answer').length,0);
 assert.ok(b.d.querySelector('#day-overview').hidden);assert.ok(b.d.querySelector('.hero').hidden);
 const svg=b.d.querySelector('#q3 svg'),ticks=Array.from(svg.querySelectorAll('line')).slice(1).map(e=>+e.getAttribute('x1'));
 assert.equal(ticks.length,9);assert.ok(ticks.slice(1).every((x,i)=>x-ticks[i]===60));assert.equal(+svg.querySelector('circle').getAttribute('cx'),ticks[5]);
 answer(b,b.s.questions[0],null);assert.deepEqual(b.saved(),initial);
 for(const q of b.s.questions)answer(b,q,correct(q));
 const saved=b.saved(),run=saved.sessions[ID][0];
 assert.deepEqual(saved.sessions['week-oct12-3-5'],earlier.sessions['week-oct12-3-5']);assert.ok(run.completedAt);
 assert.equal(b.w.HarrySeptSync.valid(saved),true);assert.equal(b.d.querySelector('#score').textContent,'100%');
 assert.match(b.d.querySelector('#completion').textContent,/Goal reached: 8\/8 \(100%\)/);assert.ok(b.d.querySelector('#new-run').hidden);
 const merged=b.w.HarrySeptSync.merge(saved,{version:1,sessions:{}});assert.deepEqual(copy(merged),saved);
 const reloaded=boot(t,'?session='+ID,merged);assert.equal(reloaded.d.querySelector('#score').textContent,'100%');assert.equal(reloaded.d.querySelectorAll('#questions .answer').length,8);
});

test('Wrong decimal and interval answers keep their first-try misses through hints, retries, sync and reload',t=>{
 const b=boot(t),price=b.s.questions[4],line=b.s.questions[2];
 answer(b,price,980);answer(b,price,98);
 assert.match(b.d.querySelector('#feedback-5').textContent,/cents/);assert.equal(b.d.querySelector('#q5 .answer'),null);
 const two=copy(b.saved());answer(b,price,98);assert.deepEqual(b.saved(),two);
 answer(b,price,9.08);answer(b,price,9.80);answer(b,line,0);answer(b,line,line.correct);
 for(const q of b.s.questions.filter(q=>![3,5].includes(q.source)))answer(b,q,correct(q));
 const saved=b.saved(),run=saved.sessions[ID][0];assert.equal(run.answers[5].attempts.length,4);assert.equal(run.answers[5].attempts[0].choice,'980');
 assert.equal(b.w.HarrySeptEngine.stats(b.s,run).first,6);assert.equal(b.d.querySelector('#score').textContent,'75%');
 assert.doesNotMatch(b.d.querySelector('#completion').textContent,/Goal reached/);assert.match(b.d.querySelector('#completion').textContent,/6\/8/);
 assert.equal(b.w.HarrySeptSync.valid(saved),true);const merged=b.w.HarrySeptSync.merge(saved,saved);assert.deepEqual(copy(merged),saved);
 const partial=copy(saved);delete partial.sessions[ID][0].answers[8];assert.equal(b.w.HarrySeptSync.merge(partial,partial).sessions[ID][0].completedAt,null);
 const pending=copy(saved);pending.sessions[ID][0].completedAt=null;assert.ok(b.w.HarrySeptSync.merge(pending,pending).sessions[ID][0].completedAt);
 const reloaded=boot(t,'?session='+ID,merged);assert.equal(reloaded.d.querySelector('#score').textContent,'75%');assert.deepEqual(reloaded.saved(),saved);
});

test('Conflicting device first answers remain separate and new session data survives bank-independent sync',t=>{
 const b=boot(t);answer(b,b.s.questions[0],35);const local=b.saved(),remote=copy(local);
 remote.sessions[ID][0].answers[1].attempts[0]={choice:'36',correct:true,at:'2026-10-24T12:01:00Z'};
 const merged=b.w.HarrySeptSync.merge(local,remote);assert.equal(merged.sessions[ID].length,2);assert.ok(merged.sessions[ID].every(r=>r.deviceConflict));
 assert.deepEqual(copy(merged.sessions['week-oct12-3-5']),unlock().sessions['week-oct12-3-5']);
 for(const q of b.s.questions.slice(1))answer(b,q,correct(q));answer(b,b.s.questions[0],36);
 const saved=b.saved();b.w.HARRY_SEPT_PRACTICE=[];
 assert.ok(b.w.HarrySeptSync.merge(saved,saved).sessions[ID][0].completedAt);
 const invalid=copy(saved);invalid.sessions[ID][0].answers[1].attempts[0].choice='-1';assert.equal(b.w.HarrySeptSync.valid(invalid),false);
});

test('Completed Day 6 and Extra review both lead to Set 7',t=>{
 const setup=boot(t,'?group=week-2026-10-12'),state=unlock();
 for(const id of ['week-oct12-6','week-oct12-extra-review']){
  const s=setup.w.HARRY_SEPT_PRACTICE.find(s=>s.id===id);
  state.sessions[id]=[{id:'finished-'+id,startedAt:'2026-10-24T11:00:00Z',completedAt:'2026-10-24T11:01:00Z',answers:Object.fromEntries(s.questions.map(q=>[q.source,{attempts:[{choice:setup.w.HarrySeptEngine.typed(q)?String(q.correct):q.correct,correct:true,at:'2026-10-24T11:01:00Z'}]}]))}];
 }
 for(const id of ['week-oct12-6','week-oct12-extra-review']){const b=boot(t,'?session='+id,state);assert.ok(b.d.querySelector(`#completion a[href="?session=${ID}"]`));}
});
