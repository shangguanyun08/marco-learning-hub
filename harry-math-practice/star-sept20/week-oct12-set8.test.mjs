import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const ID='week-oct12-8',KEY='harry-star-sept20-four-sessions-v1',copy=x=>JSON.parse(JSON.stringify(x));
const read=f=>readFileSync(new URL(f,import.meta.url),'utf8');
const unlock=()=>({version:1,sessions:{'week-oct12-3-5':[{id:'previous-day-3-5',startedAt:'2026-10-24T10:00:00Z',completedAt:'2026-10-24T10:01:00Z',answers:Object.fromEntries([7,11,14,43,12,21].map((n,i)=>[i+1,{attempts:[{choice:String(n),correct:true,at:'2026-10-24T10:01:00Z'}]}]))}]}});
function boot(t,query='?session='+ID,state=unlock(),includeSet8=true){
 const w=new JSDOM(read('./index.html'),{url:'http://localhost/'+query,runScripts:'outside-only'}).window;t.after(()=>w.close());w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.fetch=()=>{throw Error('No test may contact live learner sync');};w.localStorage.setItem(KEY,JSON.stringify(state));
 for(const tag of w.document.querySelectorAll('script[defer][src]')){const src=tag.getAttribute('src').split('?')[0];if(includeSet8||!src.includes('set8.js'))w.eval(read(src));}
 return {w,d:w.document,s:w.HARRY_SEPT_PRACTICE.find(s=>s.id===ID),saved:()=>JSON.parse(w.localStorage.getItem(KEY))};
}
function answer(b,q,value){const form=b.d.querySelector(`form[data-source="${q.source}"]`);if(q.type==='number')form.querySelector('input').value=String(value);else form.querySelector(`input[value="${value}"]`).checked=true;form.dispatchEvent(new b.w.Event('submit',{bubbles:true,cancelable:true}));}
const correct=q=>q.type==='number'?String(q.correct):q.correct;

test('Set 8 retains Set 7 and every earlier question and covers the same skills with independent keys',t=>{
 const before=boot(t,'?group=week-2026-10-12',unlock(),false),b=boot(t),old=b.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='week-oct12-7');
 assert.deepEqual(copy(b.w.HARRY_SEPT_PRACTICE.filter(s=>s.id!==ID)),copy(before.w.HARRY_SEPT_PRACTICE));
 assert.equal(b.s.questions.length,8);assert.deepEqual(Array.from(b.s.questions,q=>q.skill),Array.from(old.questions,q=>q.skill));
 assert.deepEqual(Array.from(b.s.questions,q=>q.correct),[5*4,36/2,0,38*26,24*45/100,(3476+1858)/100,2*(16+7),3]);
 b.s.questions.forEach((q,i)=>assert.notDeepEqual(copy(q),copy(old.questions[i])));
 const svg=b.d.querySelector('#q3 svg'),ticks=Array.from(svg.querySelectorAll('line')).slice(1).map(e=>+e.getAttribute('x1'));
 assert.equal(ticks.length,8);assert.ok(ticks.slice(1).every((x,i)=>Math.abs(x-ticks[i]-480/7)<1e-9));assert.equal(+svg.querySelector('circle').getAttribute('cx'),ticks[4]);
 assert.equal(b.s.questions[2].choices[b.s.questions[2].correct],'3 4/7');
 const sum=b.s.questions[7],value=s=>{const [whole,fraction]=s.split(' '),[n,d]=fraction.split('/').map(Number);return +whole+n/d;};
 sum.choices.forEach((c,i)=>assert.equal(value(c)>=3,i===sum.correct));assert.ok(Math.abs(3/2+3/2+5/3-value(sum.choices[sum.correct]))<1e-12);
 assert.equal(b.d.querySelectorAll('#questions .answer').length,0);assert.equal(b.w.HarryWeekRules.lockReason(b.s,unlock()),'');
 assert.deepEqual(Array.from(b.d.querySelectorAll('#round-navigation a'),a=>a.textContent),['Set 7','Set 8']);
});

test('Set 7 scores stay separate while Set 8 records first misses, unlimited retries, reload and sync',t=>{
 const first=boot(t,'?session=week-oct12-7'),set7=first.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='week-oct12-7');
 answer(first,set7.questions[0],35);for(const q of set7.questions)answer(first,q,correct(q));
 const previous=first.saved(),b=boot(t,'?session='+ID,previous),price=b.s.questions[4];
 assert.equal(b.d.querySelector('#score').textContent,'—');assert.ok(first.d.querySelector('#completion a[href="?session=week-oct12-8"]'));
 answer(b,price,1080);answer(b,price,108);answer(b,price,10.08);answer(b,price,10.80);
 for(const q of b.s.questions.filter(q=>q!==price))answer(b,q,correct(q));
 const saved=b.saved(),run=saved.sessions[ID][0];assert.equal(run.answers[5].attempts.length,4);assert.equal(run.answers[5].attempts[0].choice,'1080');
 assert.equal(b.d.querySelector('#score').textContent,'87.5%');assert.ok(run.completedAt);assert.equal(b.w.HarrySeptSync.valid(saved),true);
 assert.deepEqual(saved.sessions['week-oct12-7'],previous.sessions['week-oct12-7']);
 const merged=b.w.HarrySeptSync.merge(saved,previous);assert.deepEqual(copy(merged),saved);
 const again=boot(t,'?session='+ID,merged);assert.equal(again.d.querySelector('#score').textContent,'87.5%');
 const goBack=boot(t,'?session=week-oct12-7',merged);assert.equal(goBack.d.querySelector('#score').textContent,'87.5%');
 const pending=copy(saved);delete pending.sessions[ID][0].answers[8];assert.equal(b.w.HarrySeptSync.merge(pending,pending).sessions[ID][0].completedAt,null);
 b.w.HARRY_SEPT_PRACTICE=[];assert.ok(b.w.HarrySeptSync.merge(saved,saved).sessions[ID][0].completedAt);
});

test('Eight correct first answers in Set 8 earn their own 100% score',t=>{
 const b=boot(t);for(const q of b.s.questions)answer(b,q,correct(q));
 assert.equal(b.d.querySelector('#score').textContent,'100%');assert.match(b.d.querySelector('#completion').textContent,/Goal reached: 8\/8 \(100%\)/);
 const saved=b.saved();assert.equal(saved.sessions['week-oct12-7'],undefined);assert.equal(b.w.HarrySeptSync.valid(saved),true);
 assert.equal(boot(t,'?session='+ID,saved).d.querySelector('#score').textContent,'100%');
});
