import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const read=f=>readFileSync(new URL(f,import.meta.url),'utf8'),KEY='harry-star-sept20-four-sessions-v1',ID='week-oct12-extra-review',copy=x=>JSON.parse(JSON.stringify(x));
function boot(t,query='?session='+ID,saved,includeExtra=true){
 const w=new JSDOM(read('./index.html'),{url:'http://localhost/'+query,runScripts:'outside-only'}).window;t.after(()=>w.close());w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.fetch=()=>{throw Error('Tests must never contact live learner sync');};
 if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));
 for(const tag of w.document.querySelectorAll('script[defer][src]')){const src=tag.getAttribute('src').split('?')[0];if(includeExtra||!src.includes('extra-review'))w.eval(read(src));}
 return {w,d:w.document,s:w.HARRY_SEPT_PRACTICE.find(s=>s.id===ID),saved:()=>JSON.parse(w.localStorage.getItem(KEY)||'null')};
}
function answer(b,q,choice){const f=b.d.querySelector(`form[data-source="${q.source}"]`);if(choice!==null)f.querySelector(`input[value="${choice}"]`).checked=true;f.dispatchEvent(new b.w.Event('submit',{bubbles:true,cancelable:true}));}
const mixed=s=>{const [whole,fraction]=s.split(' '),[n,d]=fraction.split('/').map(Number);return Number(whole)+n/d;};

test('One unlocked eight-question session follows Day 6; all previous session definitions survive unchanged',t=>{
 const before=boot(t,'?group=week-2026-10-12',null,false),b=boot(t,'?group=week-2026-10-12'),bank=b.w.HARRY_SEPT_PRACTICE;
 assert.deepEqual(copy(bank.filter(s=>s.id!==ID)),copy(before.w.HARRY_SEPT_PRACTICE));
 assert.equal(b.s.questions.length,8);assert.equal(new Set(b.s.questions.map(q=>q.source)).size,8);
 const ids=bank.filter(s=>s.group==='week-2026-10-12').map(s=>s.id);
 assert.deepEqual(Array.from(ids.slice(-2)),['week-oct12-6',ID]);assert.ok(ids.includes('week-oct12-3-2'));assert.ok(ids.includes('week-oct12-3-3'));
 assert.equal(b.d.querySelectorAll('.session-link').length,11);assert.equal(b.d.querySelector('.session-pair:last-child .session-link').getAttribute('href'),'?session='+ID);
 for(const s of bank.filter(s=>s.weekly))assert.equal(b.w.HarryWeekRules.lockReason(s,{version:1,sessions:{}}),'');
 assert.equal(b.d.querySelector(`.round2-link[href="?session=${ID}-round2"]`),null);
});

test('Independent keys, interval geometry, unique choices and constructive possible-sum checks',t=>{
 const b=boot(t),keys=['1 3/4','3 2/3','4 5/6','6 3/5','3 1/2','4 1/4','3 2/5','5 1/6'];
 const positions=[[1,2,4],[3,4,3],[4,5,6],[6,7,5]],numerators=[3,2,5,3];
 b.s.questions.forEach((q,i)=>{assert.equal(q.choices[q.correct],keys[i]);assert.equal(new Set(q.choices.map(mixed)).size,4);assert.ok(q.retryUntilCorrect);});
 b.s.questions.slice(0,4).forEach((q,i)=>{const [left,right,denominator]=positions[i];assert.equal(q.visual.whole,left);assert.equal(q.visual.parts,denominator);assert.equal(q.visual.point,numerators[i]);assert.equal(mixed(keys[i]),left+(right-left)*numerators[i]/denominator);
  const svg=b.d.querySelector(`#q${i+1} svg`),ticks=Array.from(svg.querySelectorAll('line')).slice(1).map(e=>Number(e.getAttribute('x1'))),point=Number(svg.querySelector('circle').getAttribute('cx'));
  assert.equal(ticks.length,denominator+1);assert.ok(ticks.slice(1).every((x,j)=>Math.abs(x-ticks[j]-480/denominator)<1e-9));assert.equal(point,ticks[numerators[i]]);assert.match(svg.getAttribute('aria-label'),new RegExp(`${left} to ${right}`));
 });
 const examples=[[[7,6],[7,6],[7,6]],[[3,2],[3,2],[5,4]],[[17,15],[17,15],[17,15]],[[3,2],[5,3],[2,1]]];
 b.s.questions.slice(4).forEach((q,i)=>{const terms=examples[i];assert.ok(terms.every(([n,d])=>n>=d&&d>0));assert.ok(Math.abs(terms.reduce((n,[a,d])=>n+a/d,0)-mixed(keys[i+4]))<1e-10);q.choices.forEach((c,j)=>assert.equal(mixed(c)>=3,j===q.correct));});
 assert.equal(b.d.querySelectorAll('.answer').length,0);assert.equal(b.d.querySelectorAll('.mixed-numberline').length,4);
 assert.deepEqual(Array.from(b.w.HarryWeekExtraReview.stats(b.s,{answers:{}}),s=>s.total),[4,4]);
});

test('Per-skill first tries stay 3/4 across unlimited distinct retries, reload, sync and history',t=>{
 const b=boot(t),first=b.s.questions[0];answer(b,first,null);assert.equal(b.saved(),null);
 const wrong=[0,2,3];wrong.forEach(choice=>answer(b,first,choice));let saved=b.saved(),run=saved.sessions[ID][0];assert.equal(run.answers[1].attempts.length,3);assert.equal(b.w.HarrySeptSync.valid(saved),true);assert.equal(run.completedAt,null);assert.equal(b.d.querySelector('#q1 .answer'),null);
 answer(b,first,first.correct);for(const q of b.s.questions.slice(1,4))answer(b,q,q.correct);
 const fifth=b.s.questions[4];answer(b,fifth,0);answer(b,fifth,fifth.correct);for(const q of b.s.questions.slice(5))answer(b,q,q.correct);
 saved=b.saved();run=saved.sessions[ID][0];const firstAttempt=copy(run.answers[1].attempts[0]);assert.equal(run.answers[1].attempts.length,4);assert.ok(run.completedAt);
 assert.deepEqual(Array.from(b.w.HarryWeekExtraReview.stats(b.s,run),s=>[s.first,s.total,s.attempted,s.finished]),[[3,4,4,4],[3,4,4,4]]);
 assert.match(b.d.querySelector('#skill-scores').textContent,/3\/4/);assert.equal(b.d.querySelectorAll('.skill-score strong').length,2);assert.ok(Array.from(b.d.querySelectorAll('.skill-score strong')).every(e=>e.textContent.startsWith('3/4')));
 assert.match(b.d.querySelector('#completion').textContent,/Mixed numbers on number lines: 3\/4/);assert.match(b.d.querySelector('#completion').textContent,/Possible sums of improper fractions: 3\/4/);assert.match(b.d.querySelector('#history').textContent,/Try 4/);assert.ok(b.d.querySelector('#new-run').hidden);
 b.d.querySelector('#new-run').click();assert.deepEqual(b.saved(),saved);
 const merged=b.w.HarrySeptSync.merge(saved,{version:1,sessions:{}});assert.deepEqual(copy(merged),saved);assert.deepEqual(copy(merged.sessions[ID][0].answers[1].attempts[0]),firstAttempt);
 const reload=boot(t,'?session='+ID,merged);assert.equal(reload.d.querySelector('#score').textContent,'75%');assert.equal(reload.d.querySelectorAll('.answer').length,8);assert.ok(Array.from(reload.d.querySelectorAll('.skill-score strong')).every(e=>e.textContent.startsWith('3/4')));
 assert.match(reload.d.querySelector(`.session-link[href="?session=${ID}"]`).textContent,/3\/4 first try/);assert.match(reload.d.querySelector('.week-score-table tbody tr:last-child').textContent,/3\/4 first try/);
 const unfinished=copy(saved);delete unfinished.sessions[ID][0].answers[8];assert.equal(b.w.HarrySeptSync.merge(unfinished,{version:1,sessions:{}}).sessions[ID][0].completedAt,null);
 const pending=copy(saved);pending.sessions[ID][0].completedAt=null;assert.ok(b.w.HarrySeptSync.merge(pending,pending).sessions[ID][0].completedAt);
});

test('New attempts leave restored retests and existing post-reset progress intact; cross-device first tries stay separate',t=>{
 const setup=boot(t),state={version:1,sessions:{}};
 for(const id of ['week-oct12-3-2','week-oct12-3-3','week-oct12-4','week-oct12-5','week-oct12-6']){
  const s=setup.w.HARRY_SEPT_PRACTICE.find(s=>s.id===id),q=s.questions[0];state.sessions[id]=[{id:'existing-'+id,startedAt:'2026-10-18T15:00:00Z',completedAt:null,answers:{[q.source]:{attempts:[{choice:q.correct,correct:true,at:'2026-10-18T15:01:00Z'}]}}}];
 }
 const b=boot(t,'?session='+ID,state);answer(b,b.s.questions[0],0);for(const [id,runs] of Object.entries(state.sessions))assert.deepEqual(b.saved().sessions[id],runs);
 const local=b.saved(),remote=copy(local);remote.sessions[ID][0].answers[1].attempts[0]={choice:1,correct:true,at:'2026-10-18T16:00:00Z'};
 const merged=b.w.HarrySeptSync.merge(local,remote);assert.equal(merged.sessions[ID].length,2);assert.ok(merged.sessions[ID].every(r=>r.deviceConflict));assert.deepEqual(Array.from(merged.sessions[ID],r=>r.answers[1].attempts.length),[1,1]);
 const invalid=copy(local);invalid.sessions[ID][0].answers[1].attempts[0].choice='1';assert.equal(b.w.HarrySeptSync.valid(invalid),false);
});
