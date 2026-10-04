import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import test from 'node:test';
const {JSDOM}=createRequire(import.meta.url)('jsdom');
const read=n=>readFileSync(new URL(n,import.meta.url),'utf8'),KEY='marco-isee-middle-oct04-test2-v1';
const files=['data.js','engine.js','sync.js','visuals.js','app.js'];
function page(n=0,saved,{live=false,fetcher,clock}={}){const dom=new JSDOM(read('index.html'),{url:(live?'https://example.org/':'http://localhost/')+'?session='+n,runScripts:'outside-only'}),w=dom.window;w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};if(clock)w.Date=class extends Date{constructor(...args){super(...(args.length?args:[clock.now]));}static now(){return clock.now;}};if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));w.fetch=fetcher;let client;for(const f of files){w.eval(read(f));if(f==='sync.js'){const create=w.MarcoIseeSync.create;w.MarcoIseeSync.create=o=>(client=create(o));}}return {w,d:w.document,state:()=>JSON.parse(w.localStorage.getItem(KEY)||'{"version":1,"sessions":{}}'),get client(){return client;},close(){client?.stop();w.close();}};}
const bankPage=page(),bank=JSON.parse(JSON.stringify(bankPage.w.MARCO_ISEE_PRACTICE));bankPage.close();
function start(p){p.d.querySelector('[data-action=start]').click();}
function submit(p,q,c){const f=p.d.querySelector(`form[data-source="${q.source}"]`);f.querySelector(`input[value="${c}"]`).checked=true;f.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}
function pick(p,q,c){const input=p.d.querySelector(`form[data-source="${q.source}"] input[value="${c}"]`);input.checked=true;input.dispatchEvent(new p.w.Event('change',{bubbles:true}));}
const clone=x=>JSON.parse(JSON.stringify(x)),delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<200;i++){if(fn())return;await delay(10);}throw Error('Sync timeout');}
test('exact extracted scope, answer keys, and 690-second weighted budget',()=>{
 assert.deepEqual(bank[0].questions.filter(q=>q.section==='VR').map(q=>q.number),[8,9,10,11,12,17,18,31,34]);
 assert.deepEqual(bank[0].questions.filter(q=>q.section==='QR').map(q=>q.number),[16,18,26,29,32,34,37]);
 assert.deepEqual(bank[0].questions.map(q=>q.correct),[2,1,3,3,1,0,1,3,0,3,1,0,2,2,2,2]);
 for(const s of bank){assert.equal(s.questions.length,16);assert.equal(new Set(s.questions.map(q=>q.source)).size,16);for(const q of s.questions){assert.equal(q.choices.length,4);assert.ok(q.choices[q.correct]);assert.ok(q.tip.length>20);assert.ok(q.explanation.length>30);}if(s.number>1)assert.equal(s.timeLimitSeconds,s.questions.reduce((n,q)=>n+(q.section==='VR'?30:60),0));}
 assert.ok(existsSync(new URL('assets/best-fit-original.png',import.meta.url)));
 for(let i=0;i<16;i++)assert.equal(new Set(bank.map(s=>s.questions[i].prompt+JSON.stringify(s.questions[i].columns))).size,3);
});
test('independent QR calculations for originals and fresh variants',()=>{
 const cmp=(a,b)=>a>b?0:a<b?1:2;
 const expected=[[3,1,cmp(70/7*11,63/6*10),cmp(Math.abs(10-100),Math.abs(100-10)),cmp(4,2**2),cmp(24,24),2],[2,3,cmp(54/6*8,60/5*6),cmp(Math.abs(7-25),Math.abs(25-9)),cmp(5,3**2),cmp(20,60-20),cmp(9*4/6,6)],[1,2,cmp(80/8*12,66/6*11),cmp(Math.abs(12-47),Math.abs(47-12)),cmp(7,2**2),cmp(48,48),cmp(10*6/4,14)]];
 bank.forEach((s,i)=>assert.deepEqual(s.questions.filter(q=>q.section==='QR').map(q=>q.correct),expected[i]));
 assert.equal(28*1000-21000,7*1000);assert.equal(15*800-5*800,8000);assert.equal(20*600-9600,4*600);
 assert.equal(30/15,2);assert.equal(50/20,2.5);
});
test('Session 0 is unscored and includes 16 worked questions plus evidence-based plan',()=>{const p=page();try{assert.equal(p.d.querySelectorAll('.session-card').length,4);assert.equal(p.d.querySelectorAll('.question').length,16);assert.equal(p.d.querySelectorAll('.solution .trick').length,16);assert.match(p.d.querySelector('#weakness-analysis').textContent,/13\/20/);assert.match(p.d.body.textContent,/2nd attempt/i);assert.equal(p.d.querySelectorAll('form').length,0);assert.deepEqual(p.state().sessions,{});}finally{p.close();}});
test('original redo hides solutions after first wrong answer, saves retry separately, and reloads',()=>{const p=page(1);let saved;try{start(p);assert.equal(p.d.querySelectorAll('.solution').length,0);const q=bank[0].questions[0];submit(p,q,0);assert.equal(p.d.querySelectorAll('.solution').length,0);assert.match(p.d.querySelector('.feedback').textContent,/Try a different/);submit(p,q,q.correct);assert.equal(p.d.querySelectorAll('.solution').length,1);assert.match(p.d.querySelector('.feedback').textContent,/0 first-try/);saved=p.state();assert.equal(saved.sessions.original[0].answers[q.source].attempts.length,2);}finally{p.close();}const r=page(1,saved);try{assert.equal(r.d.querySelectorAll('.solution').length,1);assert.match(r.d.querySelector('.solution').textContent,/QUICK METHOD/);}finally{r.close();}});
test('both timed sessions start only on click, persist selections and deadlines, and reveal only at finish/expiry',async()=>{
 const clock={now:Date.parse('2026-10-04T19:00:00Z')};let saved;
 const p=page(2,undefined,{clock});try{assert.equal(p.d.querySelectorAll('.question').length,0);start(p);const q=bank[1].questions[0];pick(p,q,0);pick(p,q,q.correct);saved=p.state();assert.equal(Date.parse(saved.sessions['similar-a'][0].deadlineAt)-clock.now,690000);assert.equal(p.d.querySelectorAll('.solution').length,0);assert.equal(p.d.querySelectorAll('form button').length,0);}finally{p.close();}
 clock.now+=30000;const r=page(2,saved,{clock});try{assert.match(r.d.querySelector('#timers').textContent,/11:00/);assert.equal(r.d.querySelector('input:checked').value,String(bank[1].questions[0].correct));r.d.querySelector('[data-action=finish]').click();assert.equal(r.d.querySelector('#finish-dialog').open,true);r.d.querySelector('#confirm-finish').click();assert.equal(r.d.querySelectorAll('.solution').length,16);assert.match(r.d.querySelector('.complete').textContent,/VR: 1\/9 · QR: 0\/7/);saved=r.state();assert.equal(r.w.MarcoIseeSync.valid(saved),true);}finally{r.close();}
 const t=page(3,saved,{clock});try{start(t);pick(t,bank[2].questions[9],bank[2].questions[9].correct);const deadline=t.state().sessions['similar-b'][0].deadlineAt;clock.now=Date.parse(deadline)+1;await delay(600);assert.equal(t.d.querySelectorAll('.solution').length,16);assert.match(t.d.querySelector('.complete').textContent,/Time is up/);assert.equal(t.state().sessions['similar-b'][0].timedOutAt,deadline);assert.equal(t.state().sessions['similar-a'][0].answers[1008].attempts[0].correct,true);}finally{t.close();}
});
test('live two-device sync preserves pending timed answers, retries, deadline, and offline work',async()=>{
 let progress=null,offline=false,posts=0;
 const remote=async(url,opts={})=>{assert.match(url,/appId=marco-isee-middle-oct04-test2-v1$/);if(offline)throw Error('offline');if(opts.method==='POST'){posts++;const body=JSON.parse(opts.body),accepted=body.baseVersion===(progress?.version??null);if(accepted)progress={state:clone(body.state),version:(progress?.version||0)+1};return {ok:true,json:async()=>({accepted,progress:clone(progress)})};}return {ok:true,json:async()=>({progress:clone(progress)})};};
 const a=page(2,undefined,{live:true,fetcher:remote}),b=page(2,undefined,{live:true,fetcher:remote});try{
 await until(()=>a.d.querySelector('#save-note').dataset.kind==='live'&&b.d.querySelector('#save-note').dataset.kind==='live');assert.equal(posts,0);start(a);await until(()=>progress?.state.sessions['similar-a']);await b.client.refresh();
 const q=bank[1].questions[0];pick(a,q,q.correct);await until(()=>progress.state.sessions['similar-a'][0].pending[q.source]);await b.client.refresh();assert.equal(b.d.querySelector('input:checked').value,String(q.correct));assert.equal(b.d.querySelectorAll('.solution').length,0);assert.equal(a.state().sessions['similar-a'][0].deadlineAt,b.state().sessions['similar-a'][0].deadlineAt);
 b.d.querySelector('[data-action=finish]').click();b.d.querySelector('#confirm-finish').click();await until(()=>progress.state.sessions['similar-a'][0].completedAt);await a.client.refresh();assert.equal(a.d.querySelectorAll('.solution').length,16);
 a.d.querySelector('a[href="?session=1"]').click();start(a);await until(()=>progress.state.sessions.original);offline=true;submit(a,bank[0].questions[0],0);await until(()=>a.d.querySelector('#save-note').dataset.kind==='offline');assert.equal(a.state().sessions.original[0].answers[1008].attempts.length,1);offline=false;await a.client.refresh();b.d.querySelector('a[href="?session=1"]').click();await b.client.refresh();assert.equal(b.d.querySelectorAll('.solution').length,0);submit(b,bank[0].questions[0],2);await until(()=>progress.state.sessions.original[0].answers[1008].attempts.length===2);await a.client.refresh();assert.equal(a.d.querySelectorAll('.solution').length,1);assert.equal(a.w.MarcoIseeSync.valid(progress.state),true);
 }finally{a.close();b.close();}
});
