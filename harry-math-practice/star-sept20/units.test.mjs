import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8'),KEY='harry-star-sept20-four-sessions-v1';
function boot(id='oct4-original',saved){
 const html=read('./index.html'),dom=new JSDOM(html,{url:'http://localhost/?session='+id,runScripts:'outside-only'}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));
 let beforeOrder;
 for(const match of html.matchAll(/<script src="([^"]+)" defer>/g)){if(match[1].includes('oct4-order.js'))beforeOrder=JSON.parse(JSON.stringify(w.HARRY_SEPT_PRACTICE));w.eval(read(match[1].split('?')[0]));}
 return {w,d:w.document,beforeOrder,close:()=>w.close(),session:w.HARRY_SEPT_PRACTICE.find(s=>s.id===id)};
}
function submit(t,values){t.d.querySelectorAll('#q2 input[name="unit-answer"]').forEach((el,i)=>el.value=values[i]??'');t.d.querySelector('#q2 form').dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
const answers=[[12,3,36,16,2,4],[24,6,72,32,6,8],[36,12,108,48,10,12],[60,18,144,80,14,20]];
const ids=['oct4-original','oct4-a','oct4-b','oct4-c'];
test('All October 4 unit names are spelled out with correct singular and plural labels',()=>{
 for(const [i,id] of ids.entries()){const t=boot(id),q=t.session.questions[1];
 assert.deepEqual(Array.from(q.blanks,b=>b.unit),['inches','feet','inches','ounces','pints','quarts']);
 assert.equal(q.blanks[0].label,i===0?'1 foot =':`${[1,2,3,5][i]} feet =`);
 assert.equal(q.blanks[3].label,i===0?'1 pound =':`${[1,2,3,5][i]} pounds =`);
 assert(!/\b(?:ft|yd|lb|oz|qt|pt|gal|hr|cm)\b/.test(t.d.querySelector('#questions').textContent));
 assert.match(t.d.querySelector('[data-source="15"] .choice-text').textContent,/hours/);t.close();}
});
test('All four published sessions have one six-blank Q2 and 16 total questions',()=>{
 ids.forEach((id,i)=>{const t=boot(id),q=t.session.questions[1];assert.equal(q.source,7);assert.equal(q.type,'fill-blanks');assert.equal(t.session.questions.length,16);assert.equal(t.d.querySelectorAll('#q2 input').length,6);assert.equal(t.d.querySelectorAll('#q2 .submit').length,1);assert.equal(t.d.querySelectorAll('#q2 .answer').length,0);assert.deepEqual(Array.from(q.blanks,b=>b.answer),answers[i]);assert.equal(t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group!=='2026-10-04').flatMap(s=>s.questions).filter(q=>q.type==='fill-blanks').length,0);submit(t,answers[i]);assert.match(t.d.querySelector('#score').textContent,/1 \/ 16/);assert.match(t.d.querySelector('#q2 .answer').textContent,/in/);t.close();});
});
test('Six blanks require complete input; two attempts retain first score, reveal, reload and sync',()=>{
 const t=boot();submit(t,[12]);assert.match(t.d.querySelector('#q2 .feedback').textContent,/No attempt/);assert.equal(t.d.querySelector('#q2 .answer'),null);
 submit(t,[12,3,36,16,2,5]);assert.match(t.d.querySelector('#q2 .feedback').textContent,/one more/);assert.equal(t.d.querySelector('#q2 .answer'),null);assert.equal(t.d.querySelector('#unit-7-0').value,'12');
 submit(t,[12,3,36,16,2,5]);assert.match(t.d.querySelector('#q2 .feedback').textContent,/No new attempt/);
 submit(t,answers[0]);assert.match(t.d.querySelector('#q2 .feedback').textContent,/second try/);assert.match(t.d.querySelector('#score').textContent,/0 \/ 16/);
 const saved=JSON.parse(t.w.localStorage.getItem(KEY));assert(t.w.HarrySeptSync.valid(saved));assert.deepEqual(JSON.parse(JSON.stringify(t.w.HarrySeptSync.merge(saved,saved))),saved);
 const r=boot('oct4-original',saved);assert.match(r.d.querySelector('#q2 .feedback').textContent,/second try/);assert.equal(r.d.querySelectorAll('#q2 input:disabled').length,6);r.close();t.close();
 const wrong=boot();submit(wrong,[1,1,1,1,1,1]);submit(wrong,[2,2,2,2,2,2]);assert.match(wrong.d.querySelector('#q2 .feedback').textContent,/Two tries/);assert.match(wrong.d.querySelector('#q2 .answer').textContent,/12 inches/);wrong.close();
});
test('Older multiple-choice unit attempts remain intact and can finish their original retry',()=>{
 const at='2026-10-04T18:30:00.000Z',saved={version:1,sessions:{'oct4-original':[{id:'legacy',startedAt:at,completedAt:null,answers:{7:{attempts:[{choice:0,correct:false,at}]}}}]}};
 const t=boot('oct4-original',saved);assert.match(t.d.querySelector('#q2 .prompt').textContent,/pints/);assert.equal(t.d.querySelectorAll('#q2 input[type=radio]').length,4);
 t.d.querySelector('#q2 input[value="1"]').checked=true;t.d.querySelector('#q2 form').dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));assert.match(t.d.querySelector('#q2 .feedback').textContent,/second try/);assert.match(t.d.querySelector('#history').textContent,/A \(4 pints\)/);assert.match(t.d.querySelector('#score').textContent,/0 \/ 16/);t.close();
});
test('Every revised session completes at 16/16 with synchronized multi-blank work',()=>{
 for(const id of ids){const t=boot(id),run={id,startedAt:'2026-10-04T19:00:00.000Z',completedAt:null,answers:{}};
 for(const q of t.session.questions){const value=q.type==='fill-blanks'?q.blanks.map(b=>b.answer):q.type==='split-sum'?[...q.expansion,...q.parts]:q.correct;assert(t.w.HarrySeptEngine.submit(run,q,value,run.startedAt));}
 assert.equal(t.w.HarrySeptEngine.stats(t.session,run).first,16);assert.equal(t.w.HarrySeptEngine.stats(t.session,run).finished,16);const state={version:1,sessions:{[id]:[run]}};assert(t.w.HarrySeptSync.valid(state));assert(t.w.HarrySeptSync.merge(state,state).sessions[id][0].completedAt);t.close();}
});
test('Easy-to-hard order changes presentation only, preserving question content and prior group ordering',()=>{
 const t=boot(),expected=[3002,7,29,17,12,32,31,27,3005,3009,23,15,6,8,34,25];
 for(const session of t.w.HARRY_SEPT_PRACTICE){const before=t.beforeOrder.find(s=>s.id===session.id);
   if(session.group!=='2026-10-04'){assert.deepEqual(JSON.parse(JSON.stringify(session)),before);continue;}
   assert.deepEqual(Array.from(session.questions,q=>q.source),expected);
   for(const q of session.questions)assert.deepEqual(JSON.parse(JSON.stringify(q)),before.questions.find(old=>old.source===q.source));
   assert(!session.description.includes('as Questions 14–16'));
 }
 assert.equal(t.d.querySelector('#q1').dataset.source,'3002');assert.equal(t.d.querySelector('#q16').dataset.source,'25');assert.equal(t.d.querySelector('#jump a:last-child').getAttribute('href'),'#q16');t.close();
});
test('Reordered questions retain saved scores, retry outcomes, timestamps, and completion',()=>{
 const t=boot(),at='2026-10-04T19:00:00.000Z',run={id:'before-order',startedAt:at,completedAt:at,answers:{}};
 for(const q of t.session.questions){const answer=q.type==='fill-blanks'?q.blanks.map(b=>b.answer):q.type==='split-sum'?[...q.expansion,...q.parts]:q.correct;t.w.HarrySeptEngine.submit(run,q,answer,at);}
 run.answers[3002].attempts=[{choice:'8',correct:false,at},{choice:'7',correct:true,at}];
 const state={version:1,sessions:{'oct4-original':[run]}},r=boot('oct4-original',state);
 assert.match(r.d.querySelector('#score').textContent,/15 \/ 16/);assert.match(r.d.querySelector('#q1 .feedback').textContent,/second try/);assert.equal(r.d.querySelector('#completion').hidden,false);
 assert.deepEqual(JSON.parse(r.w.localStorage.getItem(KEY)),JSON.parse(JSON.stringify(state)));assert.match(r.d.querySelector('#history').textContent,/Try 1: 8 · incorrect/);r.close();t.close();
});
