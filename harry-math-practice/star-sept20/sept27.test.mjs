import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const KEY='harry-star-sept20-four-sessions-v1';
function boot(query='',saved){
 const dom=new JSDOM(read('./index.html'),{url:'http://localhost/'+query,runScripts:'outside-only'}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 if(saved)w.localStorage.setItem(KEY,saved);
 for(const p of ['../../harry-star-math/tests/2026-09-20/data.js','data.js','sept27-data.js','visuals.js','engine.js','sync.js','app.js'])w.eval(read('./'+p));
 return {w,d:w.document,close:()=>w.close()};
}
function answer(t,q,choice){const f=t.d.querySelector(`form[data-source="${q.source}"]`);f.querySelector(`input[value="${choice}"]`).checked=true;f.dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
const sources=[3,5,9,14,22,25,27,30,33,34];
test('Dated home has two groups; old seven days and new four sessions stay separate',()=>{
 let t=boot();assert.equal(t.d.querySelectorAll('.group-card').length,2);assert(t.d.querySelector('#day-overview').hidden);assert.equal(t.w.localStorage.getItem(KEY),null);t.close();
 for(const [date,count,unit] of [['2026-09-20',7,'Day'],['2026-09-27',4,'Session']]){
  t=boot('?group='+date);assert.equal(t.d.querySelectorAll('.session-link').length,count);assert.match(t.d.querySelector('#sessions b').textContent,new RegExp(unit));assert.equal(t.d.querySelectorAll('.question').length,0);assert(!t.d.querySelector('#day-overview').hidden);t.close();
 }
 t=boot('?session=original');assert.equal(t.d.querySelectorAll('.question').length,12);assert.match(t.d.querySelector('#group-title').textContent,/September 20/);t.close();
});
test('All 40 new items cover the ten reviewed skills with unique valid choices and rebuilt diagrams',()=>{
 const t=boot(),sessions=t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-09-27');assert.equal(sessions.length,4);
 for(const s of sessions){assert.deepEqual(Array.from(s.questions,q=>q.source).sort((a,b)=>a-b),sources);for(const q of s.questions){assert.equal(new Set(q.choices).size,4);assert(q.correct>=0&&q.correct<4);assert(q.explanation.length>15);}}
 const prompts=sessions.slice(1).flatMap(s=>Array.from(s.questions,q=>q.prompt));assert.equal(new Set(prompts).size,30);
 for(const s of sessions){assert.equal(s.questions.find(q=>q.source===5).visual.counts.reduce((a,b)=>a+b),20);for(const source of [3,5,25,27])assert(s.questions.find(q=>q.source===source).visual);}
 t.close();
});
test('Independent answer checks include arithmetic, number-line positions, plot counts and coordinates',()=>{
 const t=boot(),sets=t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-09-27');
 const expected=[
  {target:10+1/6,plot:[4,1],sub:[640178,60598],decimal:75,factors:[5,6,6],yards:4,fraction:[15,4],point:[5,-3],mult:[981,3]},
  {target:3+2/5,plot:[1,3],sub:[520304,40786],decimal:42,factors:[4,5,8],yards:3,fraction:[17,5],point:[-4,2],mult:[742,4]},
  {target:6+3/4,plot:[2,0],sub:[703052,86475],decimal:68,factors:[3,7,6],yards:5,fraction:[23,6],point:[3,-4],mult:[863,5]},
  {target:8+2/3,plot:[4,1],sub:[810206,92758],decimal:37,factors:[6,4,9],yards:6,fraction:[29,8],point:[-2,-5],mult:[596,7]}
 ];
 sets.forEach((s,i)=>{const e=expected[i],find=n=>s.questions.find(q=>q.source===n),key=n=>find(n).choices[find(n).correct];
  let v=find(3).visual;assert(Math.abs(v.start+v.steps[find(3).correct]/v.den-e.target)<1e-10);
  v=find(5).visual;assert.equal(Number(key(5)),v.counts[e.plot[0]]-v.counts[e.plot[1]]);
  const parts=key(9).match(/\d+/g).map(Number);assert.equal(parts[0]+parts[2]+parts[4],e.mult[0]);assert.deepEqual([parts[1],parts[3],parts[5]],[e.mult[1],e.mult[1],e.mult[1]]);
  assert.equal(Number(key(14).replaceAll(',','')),e.sub[0]-e.sub[1]);assert.equal(key(22),e.decimal+'/100');
  v=find(25).visual;assert.equal(parseInt(key(25)),2*(v.width+v.height));
  assert.deepEqual(Array.from(find(27).visual.points[key(27)]),e.point);assert.equal(Number(key(30)),e.yards*3*12);
  assert.equal(Number(key(33)),e.factors.reduce((a,b)=>a*b));const [num,den]=e.fraction;assert.equal(key(34),Math.floor(num/den)+' '+num%den+'/'+den);
 });t.close();
});
test('All four new sessions complete at 10/10; no answers leak before submission',()=>{
 for(const id of ['sept27-original','sept27-a','sept27-b','sept27-c']){
  const t=boot('?session='+id),s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id===id);assert.equal(t.d.querySelectorAll('.question').length,10);assert.equal(t.d.querySelectorAll('.answer,.correct-option').length,0);assert.equal(t.d.querySelectorAll('svg.question-diagram').length,7);
  for(const q of s.questions)answer(t,q,q.correct);
  assert.equal(t.d.querySelector('#score').textContent,'10 / 10');assert(!t.d.querySelector('#completion').hidden);assert.match(t.d.querySelector('#days-progress').textContent,/1 of 4/);
  const saved=JSON.parse(t.w.localStorage.getItem(KEY));assert(saved.sessions[id][0].completedAt);assert(t.w.HarrySeptSync.valid(saved));
  t.d.querySelector('#new-run').click();assert.equal(JSON.parse(t.w.localStorage.getItem(KEY)).sessions[id].length,2);assert.match(t.d.querySelector('.session-link.completed').textContent,/10\/10/);t.close();
 }
});
test('New retry, reveal and reload keep first-try score and old 12-question history unchanged',()=>{
 let t=boot('?session=original'),q=t.w.HARRY_SEPT_PRACTICE[0].questions[0];answer(t,q,q.correct);let saved=t.w.localStorage.getItem(KEY);const old=JSON.parse(saved).sessions.original;t.close();
 t=boot('?session=sept27-original',saved);let s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='sept27-original');q=s.questions[0];answer(t,q,0);assert.equal(t.d.querySelectorAll('#q1 .answer').length,0);saved=t.w.localStorage.getItem(KEY);t.close();
 t=boot('?session=sept27-original',saved);s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='sept27-original');q=s.questions[0];answer(t,q,q.correct);assert.equal(t.d.querySelector('#score').textContent,'0 / 10');assert(t.d.querySelector('#q1 .answer'));
 q=s.questions[1];answer(t,q,0);answer(t,q,2);assert(t.d.querySelector('#q2 .answer'));assert.equal(t.d.querySelector('#score').textContent,'0 / 10');
 const result=JSON.parse(t.w.localStorage.getItem(KEY));assert.deepEqual(result.sessions.original,old);
 const merged=t.w.HarrySeptSync.merge(result,{version:1,sessions:{}});assert.deepEqual(JSON.parse(JSON.stringify(merged.sessions.original)),old);assert.equal(merged.sessions['sept27-original'][0].answers[3].attempts.length,2);t.close();
});
test('Sync computes completion using each group’s question count, preserving both dates',()=>{
 const t=boot(),state={version:1,sessions:{}};
 for(const id of ['original','sept27-original','sept27-a','sept27-b','sept27-c']){
  const s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id===id),at='2026-09-27T19:00:00.000Z';
  state.sessions[id]=[{id,startedAt:at,completedAt:null,answers:Object.fromEntries(s.questions.map(q=>[q.source,{attempts:[{choice:q.correct,correct:true,at}]}]))}];
 }
 assert(t.w.HarrySeptSync.valid(state));const merged=t.w.HarrySeptSync.merge(state,{version:1,sessions:{}});
 assert.equal(Object.keys(merged.sessions).length,5);for(const runs of Object.values(merged.sessions))assert(runs[0].completedAt);assert.equal(Object.keys(merged.sessions.original[0].answers).length,12);t.close();
});
