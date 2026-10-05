import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import test from 'node:test';
const {JSDOM}=createRequire(import.meta.url)('jsdom');
const read=n=>readFileSync(new URL(n,import.meta.url),'utf8'),KEY='marco-isee-middle-oct04-test2-v1';
const files=['data.js','ma-data.js','engine.js','sync.js','visuals.js','app.js'];
function page(n=0,saved,{live=false,fetcher,clock}={}){const dom=new JSDOM(read('index.html'),{url:(live?'https://example.org/':'http://localhost/')+'?session='+n,runScripts:'outside-only'}),w=dom.window;w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};if(clock)w.Date=class extends Date{constructor(...args){super(...(args.length?args:[clock.now]));}static now(){return clock.now;}};if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));w.fetch=fetcher;let client;for(const f of files){w.eval(read(f));if(f==='sync.js'){const create=w.MarcoIseeSync.create;w.MarcoIseeSync.create=o=>(client=create(o));}}return {w,d:w.document,state:()=>JSON.parse(w.localStorage.getItem(KEY)||'{"version":1,"sessions":{}}'),get client(){return client;},close(){client?.stop();w.close();}};}
const initial=page(),bank=JSON.parse(JSON.stringify(initial.w.MARCO_ISEE_PRACTICE)),review=JSON.parse(JSON.stringify(initial.w.MARCO_ISEE_REVIEW)),legacy=JSON.parse(JSON.stringify(initial.w.MARCO_ISEE_LEGACY));initial.close();
function start(p){p.d.querySelector('[data-action=start]').click();}
function submit(p,q,c){const f=p.d.querySelector(`form[data-source="${q.source}"]`);f.querySelector(`input[value="${c}"]`).checked=true;f.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}
function pick(p,q,c){const input=p.d.querySelector(`form[data-source="${q.source}"] input[value="${c}"]`);input.checked=true;input.dispatchEvent(new p.w.Event('change',{bubbles:true}));}
const clone=x=>JSON.parse(JSON.stringify(x)),delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<200;i++){if(fn())return;await delay(10);}throw Error('Sync timeout');}
test('exact 25-miss scope, verified MA source letters/times, three distinct counterparts, only final timer',()=>{
 assert.deepEqual(review.filter(q=>q.section==='VR').map(q=>q.number),[8,9,10,11,12,17,18,31,34]);
 assert.deepEqual(review.filter(q=>q.section==='QR').map(q=>q.number),[16,18,26,29,32,34,37]);
 const ma=review.filter(q=>q.section==='MA');
 assert.deepEqual(ma.map(q=>q.number),[12,25,26,29,37,41,42,44,45]);
 assert.deepEqual(ma.map(q=>'ABCD'[q.chosen]),['C','B','C','D','A','B','B','C','A']);
 assert.deepEqual(ma.map(q=>'ABCD'[q.correct]),['B','A','B','A','B','C','D','A','B']);
 assert.deepEqual(ma.map(q=>q.seconds),[35,46,40,12,36,62,23,42,22]);
 assert.deepEqual(review.slice(0,16).map(q=>q.correct),[2,1,3,3,1,0,1,3,0,3,1,0,2,2,2,2]);
 for(const s of bank){assert.equal(s.questions.length,25);assert.equal(new Set(s.questions.map(q=>q.source)).size,25);for(const q of s.questions){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(q.choices[q.correct]);assert.ok(q.tip.length>20);assert.ok(q.explanation.length>30);}}
 assert.equal(bank[0].timeLimitSeconds,undefined);assert.equal(bank[1].timeLimitSeconds,undefined);
 assert.equal(bank[2].timeLimitSeconds,bank[2].questions.reduce((n,q)=>n+(q.section==='VR'?30:60),0));assert.equal(bank[2].timeLimitSeconds,1230);
 for(let i=0;i<25;i++)assert.equal(new Set(bank.map(s=>s.questions[i].prompt+JSON.stringify(s.questions[i].columns)+JSON.stringify(s.questions[i].imagePoints)+s.questions[i].diagram)).size,3,`Counterparts for ${bank[0].questions[i].section} Q${bank[0].questions[i].number}`);
 assert.ok(existsSync(new URL('assets/best-fit-original.png',import.meta.url)));
});
test('independent QR calculations for all three counterpart sets',()=>{
 const cmp=(a,b)=>a>b?0:a<b?1:2;
 const expected=[[1,1,cmp(72/8*12,88/8*9),cmp(Math.abs(9-31),Math.abs(31-5)),cmp(6,4**2),cmp(27,72-27),cmp(12*6/8,8)],[2,3,cmp(54/6*8,60/5*6),cmp(Math.abs(7-25),Math.abs(25-9)),cmp(5,3**2),cmp(20,60-20),cmp(9*4/6,6)],[1,2,cmp(80/8*12,66/6*11),cmp(Math.abs(12-47),Math.abs(47-12)),cmp(7,2**2),cmp(48,48),cmp(10*6/4,14)]];
 bank.forEach((s,i)=>assert.deepEqual(s.questions.filter(q=>q.section==='QR').map(q=>q.correct),expected[i]));
 assert.equal(24*400-6*400,7200);assert.equal(15*800-5*800,8000);assert.equal(20*600-9600,4*600);
});
test('independent numerical and diagram QA for every MA counterpart (27 questions)',()=>{
 const val=s=>Number(String(s).split(' ')[0]),fraction=s=>{const [a,b=1]=s.split('/').map(Number);return a/b;};
 for(const s of bank)for(const q of s.questions.filter(q=>q.section==='MA')){
   const c=q.check;let matches=[];
   switch(c.type){
     case 'negative':matches=q.choices.map(x=>Function('return '+x.replaceAll('×','*').replaceAll('−','-'))()===-(c.a*c.a+c.b));break;
     case 'prime':{let f=2;while(c.value%f)f++;matches=q.choices.map(x=>val(x)===f);break;}
     case 'pattern':matches=q.choices.map(x=>val(x)===c.stage*(c.stage+1)/2);break;
     case 'rate':matches=q.choices.map(x=>val(x)===c.minutes*60*(c.whole-c.part)/c.part);break;
     case 'kite':matches=q.choices.map(x=>val(x)===2*c.area/c.p);break;
     case 'circle':matches=q.choices.map(x=>{const nums=x.match(/\d+/g).map(Number);return nums[0]===c.side**2&&nums[1]===(c.side/2)**2;});break;
     case 'probability':{const count=([a,b])=>Array.from({length:b-a+1},(_,i)=>a+i).filter(n=>n%2===0).length/(b-a+1);const p=c.ranges.map(count).reduce((a,b)=>a*b);matches=q.choices.map(x=>Math.abs(fraction(x)-p)<1e-10);break;}
     case 'cylinder':matches=q.choices.map(x=>val(x)===c.volume/(c.diameter/2)**2);break;
     case 'transform':{const expected=['translation','reflection','rotation'][c.kind];matches=q.choices.map(x=>x===expected);q.points.forEach(([x,y],i)=>assert.deepEqual(q.imagePoints[i],c.kind===0?[x+3,y+1]:c.kind===1?[-x,y]:[-x,-y]));break;}
   }
   assert.equal(matches.filter(Boolean).length,1,q.prompt);assert.equal(matches[q.correct],true,q.prompt);
 }
 assert.deepEqual(review.find(q=>q.source===3029).choiceShapes[0],[1,2,3,4,5,6]);
});
test('Session 0 includes all 25 original solutions, nine MA traps, and clean original choice diagrams',()=>{const p=page();try{assert.equal(p.d.querySelectorAll('.session-card').length,4);assert.equal(p.d.querySelectorAll('.question').length,25);assert.equal(p.d.querySelectorAll('.solution .trick').length,25);assert.equal(p.d.querySelectorAll('#q3029 .choice-diagram').length,4);assert.match(p.d.querySelector('#weakness-analysis').textContent,/38\/47/);assert.match(p.d.body.textContent,/2nd attempt/i);assert.equal(p.d.querySelectorAll('form').length,0);assert.deepEqual(p.state().sessions,{});}finally{p.close();}});
test('Sessions 1 AND 2 are untimed, hide first wrong, preserve retry and MA answers through reload',()=>{
 for(const n of [1,2]){const p=page(n);let saved;const q=bank[n-1].questions.find(q=>q.section==='MA');try{start(p);assert.equal(p.d.querySelector('#timers').hidden,true);assert.equal(p.state().sessions[bank[n-1].id][0].deadlineAt,undefined);submit(p,q,(q.correct+1)%4);assert.equal(p.d.querySelectorAll('.solution').length,0);submit(p,q,q.correct);assert.equal(p.d.querySelectorAll('.solution').length,1);assert.match(p.d.querySelector('#q'+q.source+' .feedback').textContent,/0 first-try/);saved=p.state();assert.equal(saved.sessions[bank[n-1].id][0].answers[q.source].attempts.length,2);}finally{p.close();}const r=page(n,saved);try{assert.equal(r.d.querySelectorAll('.solution').length,1);assert.equal(r.d.querySelector('#timers').hidden,true);assert.match(r.d.querySelector('.solution').textContent,/QUICK METHOD/);}finally{r.close();}}
});
test('Session 3 starts only on click, persists 1230-second deadline, scores all 25 and expires across reload',async()=>{
 const clock={now:Date.parse('2026-10-04T19:00:00Z')};let saved;
 const p=page(3,undefined,{clock});try{assert.equal(p.d.querySelectorAll('.question').length,0);start(p);const q=bank[2].questions[0];pick(p,q,0);pick(p,q,q.correct);pick(p,bank[2].questions[16],bank[2].questions[16].correct);saved=p.state();assert.equal(Date.parse(saved.sessions['similar-b'][0].deadlineAt)-clock.now,1230000);assert.equal(p.d.querySelectorAll('.solution').length,0);assert.equal(p.d.querySelectorAll('form button').length,0);}finally{p.close();}
 clock.now+=30000;const r=page(3,saved,{clock});try{assert.match(r.d.querySelector('#timers').textContent,/20:00/);assert.equal(r.d.querySelector('input:checked').value,String(bank[2].questions[0].correct));r.d.querySelector('[data-action=finish]').click();assert.equal(r.d.querySelector('#finish-dialog').open,true);r.d.querySelector('#confirm-finish').click();assert.equal(r.d.querySelectorAll('.solution').length,25);assert.match(r.d.querySelector('.complete').textContent,/VR: 1\/9 · QR: 0\/7 · MA: 1\/9/);saved=r.state();assert.equal(r.w.MarcoIseeSync.valid(saved),true);start(r);saved=r.state();}finally{r.close();}
 clock.now=Date.parse(saved.sessions['similar-b'][1].deadlineAt)+1;const t=page(3,saved,{clock});try{assert.equal(t.d.querySelectorAll('.solution').length,25);assert.match(t.d.querySelector('.complete').textContent,/Time is up/);assert.equal(t.state().sessions['similar-b'][1].timedOutAt,saved.sessions['similar-b'][1].deadlineAt);}finally{t.close();}
});
test('legacy migration preserves original answer keys/scores, removes only active Session 2 timer without grading drafts',()=>{
 const at='2026-10-04T19:00:00Z',later='2026-10-04T19:11:30Z',oldSources=review.slice(0,16).map(q=>q.source);
 const oldRun={id:'old-original',startedAt:at,completedAt:later,answers:Object.fromEntries(legacy[0].questions.map(q=>[q.source,{attempts:[{choice:q.correct,correct:true,at}]}])),restart:true};
 const draft={id:'old-similar-a',startedAt:at,completedAt:null,deadlineAt:later,answers:{},pending:{1008:{choice:1,at}},restart:true};
 const state={version:1,sessions:{original:[oldRun],'similar-a':[draft]}};
 const p=page(2,state);try{const S=p.w.MarcoIseeSync;assert.equal(S.valid(state),true);const merged=S.merge(state,{version:1,sessions:{}});assert.equal(S.valid(merged),true);assert.deepEqual(JSON.parse(JSON.stringify(merged.sessions.original[0].questionSources)),oldSources);assert.equal(p.w.MarcoIseeEngine.stats(legacy[0],merged.sessions.original[0]).first,16);assert.equal(merged.sessions['similar-a'][0].deadlineAt,undefined);assert.equal(merged.sessions['similar-a'][0].pending[1008].choice,1);assert.equal(Object.keys(merged.sessions['similar-a'][0].answers).length,0);assert.equal(p.d.querySelectorAll('.question').length,16);assert.equal(p.d.querySelector('input:checked').value,'1');assert.equal(p.d.querySelector('#timers').hidden,true);assert.equal(p.d.querySelectorAll('.solution').length,0);assert.equal(JSON.stringify(S.merge(merged,state)),JSON.stringify(merged));submit(p,bank[1].questions[0],1);assert.equal(p.d.querySelectorAll('.solution').length,1);}finally{p.close();}
});
test('all 25 answers finish untimed set; new runs do not overwrite history',()=>{const p=page(2);try{start(p);for(const q of bank[1].questions)submit(p,q,q.correct);assert.match(p.d.querySelector('.complete').textContent,/VR: 9\/9 · QR: 7\/7 · MA: 9\/9/);assert.equal(p.d.querySelectorAll('.solution').length,25);start(p);assert.equal(p.state().sessions['similar-a'].length,2);assert.equal(p.d.querySelectorAll('.solution').length,0);}finally{p.close();}});
test('live two-device sync preserves MA selections, retries, deadline, and offline work',async()=>{
 let progress=null,offline=false,posts=0;
 const remote=async(url,opts={})=>{assert.match(url,/appId=marco-isee-middle-oct04-test2-v1$/);if(offline)throw Error('offline');if(opts.method==='POST'){posts++;const body=JSON.parse(opts.body),accepted=body.baseVersion===(progress?.version??null);if(accepted)progress={state:clone(body.state),version:(progress?.version||0)+1};return {ok:true,json:async()=>({accepted,progress:clone(progress)})};}return {ok:true,json:async()=>({progress:clone(progress)})};};
 const a=page(3,undefined,{live:true,fetcher:remote}),b=page(3,undefined,{live:true,fetcher:remote});try{
 await until(()=>a.d.querySelector('#save-note').dataset.kind==='live'&&b.d.querySelector('#save-note').dataset.kind==='live');assert.equal(posts,0);start(a);await until(()=>progress?.state.sessions['similar-b']);await b.client.refresh();
 const q=bank[2].questions.find(q=>q.section==='MA');pick(a,q,q.correct);await until(()=>progress.state.sessions['similar-b'][0].pending[q.source]);await b.client.refresh();assert.equal(b.d.querySelector(`#q${q.source} input:checked`).value,String(q.correct));assert.equal(b.d.querySelectorAll('.solution').length,0);assert.equal(a.state().sessions['similar-b'][0].deadlineAt,b.state().sessions['similar-b'][0].deadlineAt);
 b.d.querySelector('[data-action=finish]').click();b.d.querySelector('#confirm-finish').click();await until(()=>progress.state.sessions['similar-b'][0].completedAt);await a.client.refresh();assert.equal(a.d.querySelectorAll('.solution').length,25);
 a.d.querySelector('a[href="?session=2"]').click();start(a);await until(()=>progress.state.sessions['similar-a']);offline=true;const u=bank[1].questions.find(q=>q.section==='MA');submit(a,u,(u.correct+1)%4);await until(()=>a.d.querySelector('#save-note').dataset.kind==='offline');assert.equal(a.state().sessions['similar-a'][0].answers[u.source].attempts.length,1);offline=false;await a.client.refresh();b.d.querySelector('a[href="?session=2"]').click();await b.client.refresh();assert.equal(b.d.querySelectorAll('.solution').length,0);submit(b,u,u.correct);await until(()=>progress.state.sessions['similar-a'][0].answers[u.source].attempts.length===2);await a.client.refresh();assert.equal(a.d.querySelectorAll('.solution').length,1);assert.equal(a.w.MarcoIseeSync.valid(progress.state),true);assert.match(a.d.querySelector('#save-note').textContent,/MA progress/);
 }finally{a.close();b.close();}
});
