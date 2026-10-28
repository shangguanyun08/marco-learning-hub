const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto'),{JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),copy=x=>JSON.parse(JSON.stringify(x)),MAIN='marco-math-skill-builder-oct12-v1',RKEY=n=>`marco-math-skill-builder-oct12-review${n}-v1`,at='2026-10-22T10:00:00Z';
const scripts=[...read('index.html').matchAll(/<script defer src="([^"?]+)[^"]*"/g)].map(x=>x[1]).filter(f=>!['app.js','sync.js'].includes(f)&&!f.includes('../'));
const ctx={crypto:{randomUUID}};for(const f of scripts)vm.runInNewContext(read(f),ctx);const E=ctx.MarcoSkillEngine,R=ctx.MarcoReview5Engine,D=ctx.MarcoReview5Data;
function review(n=5,mode='correct'){
 const e=ctx[`MarcoReview${n}Engine`],d=ctx[`MarcoReview${n}Data`],s=e.empty();if(mode==='empty')return s;
 for(const id of d.ids)e.submit(s,id,(d.questions[id].correct+(mode==='correct'?0:1))%4,at,randomUUID());
 if(mode==='corrected'||mode==='one-left')for(const id of d.ids.slice(0,mode==='one-left'?-1:undefined))e.submit(s,id,d.questions[id].correct,'2026-10-22T10:05:00Z',randomUUID());return s;
}
function course(through=7,{wrong8=false,partial8=false}={}){
 const s=E.empty();for(let n=1;n<=through;n++){const r=E.start(n,s,at);s.sessions[E.sessionId(n)]=[r];
  for(const id of r.questionIds){E.submit(r,id,(E.resolve(id).correct+(n===8&&wrong8?1:0))%4,at);if(n===8&&partial8)break;}
  if(n===8&&wrong8&&!partial8)for(const id of r.questionIds)E.submit(r,id,E.resolve(id).correct,'2026-10-22T10:05:00Z');
  if(n===8){r.notes[r.questionIds[0]]={text:'Keep my saved method',at};if(partial8)r.pending[r.questionIds[1]]={choice:2,at};}
 }assert.ok(E.valid(s));return s;
}
function browser(t,{state=course(),r5=review(5,'empty'),r3=review(3),r4=review(4),query='?set=8',online=false,remote5,fetch5}={}){
 const html=read('index.html'),dom=new JSDOM(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:(online?'https://example.test/':'http://localhost/')+query,runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 const suffix=query.includes('demo')?':demo':'',calls=[];w.localStorage.setItem(MAIN+suffix,JSON.stringify(state));for(const [n,s]of [[3,r3],[4,r4],[5,r5]])if(s)w.localStorage.setItem(RKEY(n)+suffix,JSON.stringify(s));
 w.fetch=async(url,options)=>{calls.push({url,options});assert.equal(options.method,'GET');assert.equal(options.body,undefined);assert.ok(/[?]appId=marco-math-skill-builder-oct12-review[2345]-v1$/.test(url));const value=url.endsWith('review5-v1')?(fetch5?await fetch5():remote5):url.endsWith('review4-v1')?r4:url.endsWith('review2-v1')?null:r3;return{ok:true,json:async()=>({progress:value?{version:1,state:copy(value)}:null})};};
 for(const f of scripts)w.eval(read(f));w.MarcoSkillSync={APP_ID:MAIN,create:()=>({start:()=>Promise.resolve(),push(){throw Error('Unexpected main progress write');}})};w.eval(read('app.js'));
 return{w,d:w.document,calls,raw:()=>w.localStorage.getItem(MAIN+suffix),update(value){w.localStorage.setItem(RKEY(5)+suffix,JSON.stringify(value));w.dispatchEvent(new w.StorageEvent('storage',{key:RKEY(5)+suffix,newValue:JSON.stringify(value)}));}};
}
const flush=()=>new Promise(resolve=>setTimeout(resolve,25));
test('Sets 8 and 9 require all twenty Review 5 questions corrected, not a perfect first try',t=>{
 for(const n of [8,9])for(const mode of ['empty','wrong','one-left']){
  const state=course(n-1),r5=review(5,mode),p=browser(t,{state,r5,query:'?set='+n}),saved=JSON.stringify(state);
  assert.match(p.d.querySelector('.session-lock').textContent,/Finish Review Session 5/);assert.match(p.d.querySelector('.session-lock').textContent,/perfect first try is not required/);assert.equal(p.d.querySelector('#content form'),null);assert.equal(p.d.querySelector('#content [data-action="start"]'),null);assert.ok(p.d.querySelector(`#sets a[href="?set=${n}"]`).classList.contains('session-locked'));assert.equal(p.raw(),saved);
  if(mode==='one-left'){const id=D.ids.at(-1);R.submit(r5,id,D.questions[id].correct,'2026-10-22T10:06:00Z',randomUUID());assert.equal(R.stats(r5).first,0);p.update(r5);assert.equal(p.d.querySelector('.session-lock'),null);assert.ok(p.d.querySelector('#content [data-action="start"]'));assert.equal(p.raw(),saved);assert.match(p.d.querySelector('.review5-card').textContent,/First try: 0%/);assert.match(p.d.querySelector('.review5-card').textContent,/Done/);}
 }
});
test('Already-completed Set 8 results remain visible while practice and stale actions are blocked',t=>{
 const state=course(8,{wrong8:true}),saved=JSON.stringify(state),r=state.sessions[E.sessionId(8)][0],p=browser(t,{state});assert.equal(E.stats(r).first,0);
 assert.match(p.d.querySelector('.session-lock').textContent,/First try: 0%.*0\/17 correct/);assert.match(p.d.querySelector('.records').textContent,/0\/17 first-attempt points/);assert.match(p.d.querySelector('.records').textContent,/Keep my saved method/);assert.match(p.d.querySelector('.recheck-report')?.textContent||p.d.querySelector('#recheck-report').textContent,/Missed/);
 p.d.querySelector('#content').insertAdjacentHTML('beforeend',`<button data-action="start">Stale start</button><form data-question="${r.questionIds[0]}"><input type="radio" value="2" checked><p class="feedback"></p></form><textarea data-note="${r.questionIds[0]}">Changed</textarea>`);
 const f=p.d.querySelector('#content form'),input=f.querySelector('input'),note=p.d.querySelector('#content textarea');p.d.querySelector('#content button').click();input.dispatchEvent(new p.w.Event('change',{bubbles:true}));note.dispatchEvent(new p.w.Event('input',{bubbles:true}));f.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(p.raw(),saved);
 p.update(review(5,'corrected'));assert.equal(p.d.querySelector('.session-lock'),null);assert.equal(p.d.querySelectorAll('#content .question').length,17);assert.match(p.d.querySelector('.scorebar').textContent,/0\/17/);assert.equal(p.raw(),saved);
 const reload=browser(t,{state:JSON.parse(p.raw()),r5:review(5,'corrected')});assert.equal(reload.d.querySelector('.session-lock'),null);assert.equal(reload.raw(),saved);
});
test('Incomplete saved Set 8 answers, pending choice and notes survive locking without revealing first-pass feedback',t=>{
 const state=course(8,{wrong8:true,partial8:true}),saved=JSON.stringify(state),p=browser(t,{state});assert.match(p.d.querySelector('.session-lock').textContent,/score hidden until all first answers/);assert.equal(p.d.querySelector('#content .records'),null);assert.equal(p.raw(),saved);
 p.update(review(5,'corrected'));assert.equal(p.d.querySelector('.session-lock'),null);assert.match(p.d.querySelector('.scorebar').textContent,/1\/17/);assert.equal(p.d.querySelector('#content .solution'),null);assert.equal(p.raw(),saved);assert.match(p.d.querySelector('#content textarea').value,/Keep my saved method/);
});
test('Review 5 adds no direct Set 10 gate and cannot replace existing preceding-set or Review 3/4 requirements',t=>{
 const ten=browser(t,{state:course(9),query:'?set=10'});assert.equal(ten.d.querySelector('.session-lock'),null);assert.ok(ten.d.querySelector('[data-action="start"]'));
 const waiting=browser(t,{state:course(8),r5:review(5,'corrected'),query:'?set=10'});assert.match(waiting.d.querySelector('.session-lock').textContent,/Finish Set 9/);
 const nine=browser(t,{state:course(7),r5:review(5,'corrected'),query:'?set=9'});assert.match(nine.d.querySelector('.session-lock').textContent,/Finish Set 8/);
 for(const n of [3,4]){const opts={state:course(),r5:review(5,'corrected')};opts['r'+n]=review(n,'empty');const p=browser(t,opts);assert.match(p.d.querySelector('.session-lock').textContent,new RegExp('Finish Review Session '+n));}
});
test('Separate Review 5 online record unlocks across devices without unnecessary writes and caches remote results while preserving main records',async t=>{
 for(const n of [8,9]){let remote=review(5,'one-left');const state=course(n-1),saved=JSON.stringify(state),local=review(5,'empty'),p=browser(t,{state,r5:local,query:'?set='+n,online:true,fetch5:()=>remote});await flush();assert.match(p.d.querySelector('.session-lock').textContent,/Finish Review Session 5/);assert.equal(p.calls.length,4);
  remote=copy(remote);R.submit(remote,D.ids.at(-1),D.questions[D.ids.at(-1)].correct,'2026-10-22T10:06:00Z',randomUUID());p.w.dispatchEvent(new p.w.Event('focus'));await flush();assert.equal(p.d.querySelector('.session-lock'),null);assert.ok(p.d.querySelector('[data-action="start"]'));assert.equal(p.raw(),saved);assert.deepEqual(JSON.parse(p.w.localStorage.getItem(RKEY(5))),copy(ctx.MarcoReview5Engine.merge(remote,local)));for(const c of p.calls){assert.equal(c.options.body,undefined);assert.equal(c.options.method,'GET');}assert.ok(p.calls.some(c=>c.url.endsWith('review5-v1')));
 }
});
test('Missing, malformed, failed and pending online Review 5 reads cannot unlock a set',async t=>{
 const malformed=copy(review(5));malformed.sessions['review5-v1'][0].answers[D.ids[0]].attempts[0].correct=false;
 for(const remote5 of [null,malformed]){const p=browser(t,{online:true,remote5});await flush();assert.match(p.d.querySelector('.session-lock').textContent,/Finish Review Session 5/);}
 const failed=browser(t,{online:true,fetch5(){throw Error('Offline');}});await flush();assert.match(failed.d.querySelector('.session-lock').textContent,/Finish Review Session 5/);
 let release;const pending=new Promise(resolve=>release=resolve),p=browser(t,{online:true,fetch5:()=>pending});await flush();assert.match(p.d.querySelector('.session-lock').textContent,/Finish Review Session 5/);release(review(5,'corrected'));await flush();assert.equal(p.d.querySelector('.session-lock'),null);
});
test('Localhost and public demo mode use separate local Review 5 keys and make no progress requests',t=>{
 for(const online of [false,true]){const query='?set=8&demo=1',p=browser(t,{online,query});p.w.localStorage.setItem(RKEY(5),JSON.stringify(review(5,'corrected')));p.w.dispatchEvent(new p.w.StorageEvent('storage',{key:RKEY(5)}));assert.match(p.d.querySelector('.session-lock').textContent,/Finish Review Session 5/);assert.equal(p.calls.length,0);p.update(review(5,'corrected'));assert.equal(p.d.querySelector('.session-lock'),null);assert.equal(p.calls.length,0);}
 const local=browser(t,{r5:review(5,'corrected')});assert.equal(local.d.querySelector('.session-lock'),null);assert.equal(local.calls.length,0);
});
