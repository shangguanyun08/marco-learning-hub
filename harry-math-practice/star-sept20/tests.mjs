import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const KEY='harry-star-sept20-four-sessions-v1';
function boot(saved,session='original'){
 const dom=new JSDOM(read('./index.html'),{url:'https://example.com/harry-math-practice/star-sept20/?session='+session,runScripts:'outside-only'});
 const w=dom.window;w.HTMLElement.prototype.scrollIntoView=function(){};
 if(saved)w.localStorage.setItem(KEY,saved);
 for(const p of ['../../harry-star-math/tests/2026-09-20/data.js','./data.js','./engine.js','./app.js'])w.eval(read(p));
 return {w,d:w.document,close:()=>w.close()};
}
function answer(t,source,choice){const form=t.d.querySelector(`form[data-source="${source}"]`);if(choice!==null)form.querySelector(`input[value="${choice}"]`).checked=true;form.dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
test('Seven sessions contain exactly the 12 target skills; original items preserved',()=>{
 const t=boot(),bank=t.w.HARRY_SEPT_PRACTICE;assert.equal(bank.length,7);
 const expected=[4,5,8,10,11,14,17,23,25,26,31,34];
 for(const s of bank){assert.equal(s.questions.length,12);assert.deepEqual(Array.from(s.questions,q=>q.source).sort((a,b)=>a-b),expected);for(const q of s.questions){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(q.correct>=0&&q.correct<4);assert(q.explanation.length>15);}}
 for(const q of bank[0].questions){const original=t.w.STAR_REVIEW.questions.find(o=>o.number===q.source);assert.equal(q.prompt,original.prompt);assert.equal(q.correct,original.correct);assert.deepEqual(Array.from(q.choices),Array.from(original.choices));}
 const all=bank.slice(1).flatMap(s=>Array.from(s.questions,q=>q.prompt));assert.equal(new Set(all).size,72);t.close();
});
test('Independently calculated similar answer keys match every skill',()=>{
 const t=boot();
 const keys=[{4:'4/10',5:'9',8:'76',10:2,11:String(4316*4).replace(/\B(?=(\d{3})+(?!\d))/g,','),14:String(96/12),17:'1/2 gallon',23:String(37*24),25:'4/9',26:'green triangle',31:String(Math.round(6+3/4)+Math.round(2+1/6)),34:'63 square inches'},
 {4:'12/27',5:'11',8:String(32+7*6),10:1,11:(5278*6).toLocaleString('en-US'),14:String(84/7),17:'2/3 liter',23:(54*32).toLocaleString('en-US'),25:'2/5',26:'yellow star',31:'14',34:'72 square centimeters'},
 {4:'15/24',5:'13',8:String(67+9*4),10:0,11:(3847*7).toLocaleString('en-US'),14:String(132/11),17:'3/5 liter',23:(63*27).toLocaleString('en-US'),25:'1/2',26:'blue circle',31:'11',34:'70 square meters'},
 {4:'9/21',5:String(60/4),8:String(30+8*5),10:1,11:(4627*5).toLocaleString('en-US'),14:String(108/9),17:'1/2 gallon',23:(46*23).toLocaleString('en-US'),25:'7/12',26:'yellow square',31:String(Math.round(9+2/3)+Math.round(4+1/5)),34:(11*8)+' square inches'},
 {4:'21/30',5:String(68/4),8:String(58+7*5),10:2,11:(6318*4).toLocaleString('en-US'),14:String(126/9),17:'2/3 liter',23:(58*34).toLocaleString('en-US'),25:'3/5',26:'yellow star',31:String(Math.round(5+1/8)+Math.round(6+4/5)),34:(13*6)+' square centimeters'},
 {4:'20/24',5:String(76/4),8:String(73+6*8),10:3,11:(7246*3).toLocaleString('en-US'),14:String(156/12),17:'1/2 gallon',23:(67*25).toLocaleString('en-US'),25:'5/8',26:'green triangle',31:String(Math.round(8+2/7)+Math.round(4+5/6)),34:(16*7)+' square meters'}];
 t.w.HARRY_SEPT_PRACTICE.slice(1).forEach((s,i)=>s.questions.forEach(q=>assert.equal(q.source===10?q.correct:q.choices[q.correct],keys[i][q.source],s.id+' source '+q.source)));t.close();
});
test('First-try correct earns one point, reveals answer, and locks question',()=>{const t=boot();assert.equal(t.d.querySelectorAll('.answer').length,0);answer(t,4,1);assert.equal(t.d.querySelector('#score').textContent,'1 / 12');assert(t.d.querySelector('#q1 .answer'));assert(!t.d.querySelector('#q1 .submit'));answer(t,4,2);assert.equal(t.d.querySelector('#score').textContent,'1 / 12');t.close();});
test('Wrong then correct preserves zero first-try points and survives reload',()=>{
 let t=boot();answer(t,4,2);assert.equal(t.d.querySelector('#score').textContent,'0 / 12');assert(!t.d.querySelector('#q1 .answer'));assert.match(t.d.querySelector('#q1 .feedback').textContent,/one more try/);
 const saved=t.w.localStorage.getItem(KEY);t.close();t=boot(saved);assert.equal(t.d.querySelector('#q1 input[value="2"]').disabled,true);answer(t,4,1);assert.equal(t.d.querySelector('#score').textContent,'0 / 12');assert(t.d.querySelector('#q1 .answer'));assert.match(t.d.querySelector('#progress').textContent,/1 corrected on retry/);t.close();
});
test('Second miss reveals answer; blank/repeated submissions do not consume tries',()=>{
 const t=boot();answer(t,4,null);assert.equal(t.w.localStorage.getItem(KEY),null);answer(t,4,2);answer(t,4,null);let saved=JSON.parse(t.w.localStorage.getItem(KEY));assert.equal(saved.sessions.original[0].answers[4].attempts.length,1);
 answer(t,4,0);assert.match(t.d.querySelector('#q1 .answer').textContent,/6/);assert.equal(t.d.querySelectorAll('#q1 input:not(:disabled)').length,0);assert.match(t.d.querySelector('#progress').textContent,/1 answers shown/);t.close();
});
test('Completion, separate scores, history preservation, and session navigation',()=>{
 const t=boot(),session=t.w.HARRY_SEPT_PRACTICE[0];session.questions.forEach(q=>answer(t,q.source,q.correct));assert.equal(t.d.querySelector('#score').textContent,'12 / 12');assert.equal(t.d.querySelector('#completion').hidden,false);
 const completed=JSON.parse(t.w.localStorage.getItem(KEY)).sessions.original[0];assert(completed.completedAt);
 t.d.querySelector('#new-run').click();let state=JSON.parse(t.w.localStorage.getItem(KEY));assert.equal(state.sessions.original.length,2);assert.deepEqual(state.sessions.original[0],completed);assert.equal(t.d.querySelector('#score').textContent,'0 / 12');
 t.d.querySelector('#sessions a[href="?session=similar-a"]').click();assert.match(t.d.querySelector('#session-title').textContent,/Session 2/);const q=t.w.HARRY_SEPT_PRACTICE[1].questions[0];answer(t,q.source,q.correct);state=JSON.parse(t.w.localStorage.getItem(KEY));assert.equal(state.sessions.original.length,2);assert.equal(state.sessions['similar-a'][0].answers[q.source].attempts.length,1);t.close();
});
test('All seven sessions start with no visible correct answer and support 12/12 completion',()=>{for(const id of ['original','similar-a','similar-b','similar-c','similar-d','similar-e','similar-f']){const t=boot(null,id),s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id===id);assert.equal(t.d.querySelectorAll('.question').length,12);assert.equal(t.d.querySelectorAll('.answer,.correct-option,.wrong-option').length,0);for(const q of s.questions)answer(t,q.source,q.correct);assert.equal(t.d.querySelector('#score').textContent,'12 / 12');assert.match(t.d.querySelector('#progress').textContent,/100%/);t.close();}});

test('new session links preserve prior saved answers and use separate records',()=>{
 const t=boot(null,'similar-c'),previous=t.w.HARRY_SEPT_PRACTICE[3],oldQuestion=previous.questions[0];
 answer(t,oldQuestion.source,oldQuestion.correct);
 const old=JSON.parse(t.w.localStorage.getItem(KEY)).sessions['similar-c'];
 for(const [i,id] of ['similar-d','similar-e','similar-f'].entries()){
   t.d.querySelector(`#sessions a[href="?session=${id}"]`).click();
   assert.match(t.d.querySelector('#session-title').textContent,new RegExp('Session '+(i+5)));
   assert.equal(t.d.querySelector('#score').textContent,'0 / 12');
   const q=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id===id).questions[0];answer(t,q.source,q.correct);
 }
 const saved=JSON.parse(t.w.localStorage.getItem(KEY));assert.deepEqual(saved.sessions['similar-c'],old);
 for(const id of ['similar-d','similar-e','similar-f'])assert.equal(Object.keys(saved.sessions[id][0].answers).length,1);
 t.close();
});
