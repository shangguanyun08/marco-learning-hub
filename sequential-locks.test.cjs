const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto');
const {JSDOM}=require('jsdom');
const Core=require('./marco-zozeck-hard-2026/quiz-core.js'),F=require('./marco-zozeck-hard-2026/test-session-fixtures.cjs');
const VR='marco-zozeck-hard-2026',MATH='marco-daily-test-review/math-skill-builder-2026-10-12',VRKEY='marco-zozeck-mixed-360-v1:progress',MATHKEY='marco-math-skill-builder-oct12-v1';
const read=(dir,file)=>fs.readFileSync(path.join(__dirname,dir,file),'utf8'),clone=x=>JSON.parse(JSON.stringify(x));
const engineContext={crypto:{randomUUID}};for(const file of ['data.js','round2.js','engine.js'])vm.runInNewContext(read(MATH,file),engineContext);
const E=engineContext.MarcoSkillEngine;
const same=(a,b)=>assert.deepEqual(clone(a),clone(b));
const at='2026-10-13T02:00:00.000Z';
function completeMath(state,n,round=1,allCorrect=false){const r=round===2?E.startRound2(n,state,at):E.start(n,state,at);(state.sessions[E.sessionId(n,round)]||=[]).push(r);for(const id of r.questionIds){const q=E.resolve(id);E.submit(r,id,allCorrect?q.correct:(q.correct+1)%4,at);}for(const id of r.questionIds)if(!E.done(r.answers[id]))E.submit(r,id,(E.resolve(id).correct+2)%4,at);assert.ok(r.completedAt);assert.ok(E.valid(state));return r;}
function browser(t,course,query,state,{online=false,delayed=false}={}){
  const dir=course==='vr'?VR:MATH,key=course==='vr'?VRKEY:MATHKEY;
  const html=course==='vr'?'<main id="app"></main>':read(MATH,'index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  const dom=new JSDOM(html,{url:(online?'https://test.invalid/':'http://localhost/')+query,runScripts:'outside-only'}),w=dom.window,d=w.document;
  t.after(()=>w.close());w.HTMLElement.prototype.scrollIntoView=()=>{};w.scrollTo=()=>{};
  w.fetch=()=>{throw Error('Tests must never contact a live API');};
  if(state)w.localStorage.setItem(key,JSON.stringify(state));
  let options,resolve,reject,pushes=0;
  const start=()=>delayed?new Promise((a,b)=>{resolve=a;reject=b;}):undefined;
  const adapter={create:o=>(options=o,{start,push:()=>{pushes++;},stop:()=>{}})};
  if(course==='vr')w.MarcoOnlineSync=adapter;else w.MarcoSkillSync={APP_ID:MATHKEY,...adapter};
  for(const file of course==='vr'?['mixed-data.js','round1-review-data.js','quiz-core.js','mixed-app.js']:['data.js','round2.js','engine.js','app.js'])w.eval(read(dir,file));
  return {w,d,state:()=>JSON.parse(w.localStorage.getItem(key)||'null'),get options(){return options;},get pushes(){return pushes;},ready:async()=>{resolve?.();await Promise.resolve();},fail:async()=>{reject?.(Error('Offline fixture'));await Promise.resolve();},remote:value=>options.onRemote(value)};
}
test('VR: partial prerequisite and partial future session remain locked; direct links preserve every answer',t=>{
  const p=Core.blank();Core.start(p,1,F.words.filter(q=>q.session===1).map(q=>q.id),at);Core.start(p,3,F.words.filter(q=>q.session===3).map(q=>q.id),at);
  const q=F.words.find(q=>q.session===3);Core.answer(p,3,q.answer,F.words,at,q.id);
  const b=browser(t,'vr','?session=3',p);assert.equal(b.d.querySelector('[data-start]'),null);assert.equal(b.d.querySelector('.question-item'),null);assert.match(b.d.querySelector('.session-lock').textContent,/Finish Session 1/);same(b.state(),p);
  b.d.querySelector('[data-session="2"]').click();assert.match(b.d.querySelector('.session-lock').textContent,/Finish Session 1/);assert.equal(b.d.querySelector('[data-start]'),null);
});
test('VR: completion unlocks the next session, and a later completion cannot bridge an earlier gap',t=>{
  const p=F.complete(Core.blank(),1),b=browser(t,'vr','?session=2',p);assert.ok(b.d.querySelector('[data-start]'));b.d.querySelector('[data-start]').click();assert.equal(b.d.querySelectorAll('.question-item').length,40);
  const gap=F.complete(Core.blank(),2),c=browser(t,'vr','?session=3',gap);assert.match(c.d.querySelector('.session-lock').textContent,/Finish Session 1/);
});
test('VR: completed out-of-order sessions remain results-only with immutable first scores',t=>{
  const p=F.complete(Core.blank(),4),b=browser(t,'vr','?session=4',p);assert.equal(b.d.querySelectorAll('.result-question').length,40);assert.equal(b.d.querySelector('[data-start]'),null);same(b.state(),p);b.d.querySelector('[data-view="practice"]').click();assert.equal(b.d.querySelector('.question-item'),null);same(b.state(),p);
});
test('VR: displayed base/review order, every review boundary and all 29 sessions have acyclic prerequisites',t=>{
  for(const n of [101,105,201,301,401,405]){const p=F.earlier(Core.blank(),n),b=browser(t,'vr',`?review${Math.floor(n/100)===1?'':Math.floor(n/100)}=${n%100}`,p);assert.ok(b.d.querySelector('[data-start]'),String(n));assert.equal(b.state().sessions[n],undefined);}
  const p=F.earlier(Core.blank(),201);delete p.sessions[105];const b=browser(t,'vr','?review2=1',p);assert.match(b.d.querySelector('.session-lock').textContent,/Finish Review Session 5/);assert.equal(b.d.querySelector('[data-start]'),null);
});
test('VR: initial sync loading, same-page remote unlock, reload and storage updates guard deep links',async t=>{
  const b=browser(t,'vr','?session=2',undefined,{online:true,delayed:true});assert.match(b.d.querySelector('.session-lock').textContent,/Checking saved progress/);assert.equal(b.d.querySelector('[data-start]'),null);
  const p=F.complete(Core.blank(),1);b.remote(p);assert.equal(b.d.querySelector('[data-start]'),null);await b.ready();assert.ok(b.d.querySelector('[data-start]'));assert.equal(b.state().sessions[2],undefined);
  const reload=browser(t,'vr','?session=2',b.state());assert.ok(reload.d.querySelector('[data-start]'));
  const c=browser(t,'vr','?session=3');c.w.localStorage.setItem(VRKEY,JSON.stringify(F.complete(p,2)));c.w.dispatchEvent(new c.w.StorageEvent('storage',{key:VRKEY}));assert.ok(c.d.querySelector('[data-start]'));
});
test('VR: stale start/answer/check/finish controls cannot mutate a locked session',t=>{
  const b=browser(t,'vr','?review4=5'),before=b.state();for(const attrs of ['data-start','data-id="r4-review-001" data-choice="x"','data-check="r4-review-001"','data-submit']){b.d.getElementById('workspace').insertAdjacentHTML('beforeend',`<button ${attrs}>stale</button>`);b.d.getElementById('workspace').lastChild.click();}same(b.state(),before);assert.equal(b.pushes,0);
});
test('Math: correct or two-attempt closure unlocks in order without a perfect-score requirement',t=>{
  const p=E.empty(),r=completeMath(p,1);assert.equal(E.stats(r).first,0);assert.equal(E.stats(r).corrected,0);const b=browser(t,'math','?set=2',p);assert.ok(b.d.querySelector('[data-action="start"]'));b.d.querySelector('[data-action="start"]').click();assert.equal(b.d.querySelectorAll('.question').length,15);
  const repeat=E.start(1,p,at);p.sessions['set-1'].push(repeat);const c=browser(t,'math','?set=2',p);assert.ok(c.d.querySelector('[data-action="start"]'),'an unfinished repeat does not undo an earlier completion');
});
test('Math: first-pass scores alone do not unlock; partial future answers and notes stay saved',t=>{
  const p=E.empty(),r=E.start(1,p,at);p.sessions['set-1']=[r];for(const id of r.questionIds)E.submit(r,id,(E.resolve(id).correct+1)%4,at);assert.ok(E.firstPass(r));assert.equal(r.completedAt,null);
  const future=E.start(3,p,at);p.sessions['set-3']=[future];const id=future.questionIds[0];E.submit(future,id,(E.resolve(id).correct+1)%4,at);future.notes[id]={text:'Keep my method',at};
  const b=browser(t,'math','?set=3',p);assert.match(b.d.querySelector('.session-lock').textContent,/Finish Set 1, Round 1/);assert.equal(b.d.querySelector('form[data-question]'),null);assert.equal(b.d.querySelector('[data-action="start"]'),null);same(b.state()||p,p);
});
test('Math: core Round 2 waits for own completed Round 1 and earlier Round 2, with no-miss skip',t=>{
  const p=E.empty(),r=E.start(1,p,at);p.sessions['set-1']=[r];for(const id of r.questionIds)E.submit(r,id,(E.resolve(id).correct+1)%4,at);
  const a=browser(t,'math','?set=1&round=2',p);assert.match(a.d.querySelector('.session-lock').textContent,/Finish Set 1, Round 1/);
  for(const id of r.questionIds)E.submit(r,id,(E.resolve(id).correct+2)%4,at);completeMath(p,2);
  const b=browser(t,'math','?set=2&round=2',p);assert.match(b.d.querySelector('.session-lock').textContent,/Finish Set 1, Round 2/);
  completeMath(p,1,2);const c=browser(t,'math','?set=2&round=2',p);assert.ok(c.d.querySelector('[data-action="start"]'));c.d.querySelector('[data-action="start"]').click();assert.equal(c.d.querySelectorAll('.question').length,15);same(c.state().sessions['set-2'][0],p.sessions['set-2'][0]);
  const noMiss=E.empty();completeMath(noMiss,1,1,true);completeMath(noMiss,2);const d=browser(t,'math','?set=2&round=2',noMiss);assert.ok(d.d.querySelector('[data-action="start"]'));
  const none=browser(t,'math','?set=1&round=2',noMiss);assert.match(none.d.getElementById('content').textContent,/No Round 2 needed/);assert.equal(none.d.querySelector('[data-action="start"]'),null);
});
test('Math: optional sets open independently after six core sets; Round 2 creates no circular dependency',t=>{
  const p=E.empty();for(let n=1;n<=6;n++)completeMath(p,n);
  for(const n of [7,8]){const b=browser(t,'math',`?set=${n}`,p);assert.ok(b.d.querySelector('[data-action="start"]'),String(n));}
  const waiting=browser(t,'math','?set=8&round=2',p);assert.match(waiting.d.querySelector('.session-lock').textContent,/Finish Set 8, Round 1/);
  const gap=clone(p);delete gap.sessions['set-2'];const c=browser(t,'math','?set=8',gap);assert.match(c.d.querySelector('.session-lock').textContent,/Finish Set 2, Round 1/);
});
test('Math: out-of-order completed work stays read-only, downloadable and preserves notes and scores',t=>{
  const p=E.empty(),r=completeMath(p,4);r.notes[r.questionIds[0]]={text:'Saved setup',at};const b=browser(t,'math','?set=4',p);assert.match(b.d.querySelector('.records').textContent,/Saved setup/);assert.equal(b.d.querySelector('form[data-question]'),null);assert.equal(b.d.querySelector('[data-action="start"]'),null);assert.ok(b.d.getElementById('download'));same(b.state()||p,p);
});
test('Math: initial sync loading, same-page remote unlock, back/forward deep links and offline fallback',async t=>{
  const b=browser(t,'math','?set=2&round=2',undefined,{online:true,delayed:true});assert.match(b.d.querySelector('.session-lock').textContent,/Checking saved progress/);
  const p=E.empty();completeMath(p,1,1,true);completeMath(p,2);b.remote(p);assert.equal(b.d.querySelector('[data-action="start"]'),null);await b.ready();assert.ok(b.d.querySelector('[data-action="start"]'));
  b.w.history.pushState(null,'','?set=3');b.w.dispatchEvent(new b.w.PopStateEvent('popstate'));assert.ok(b.d.querySelector('[data-action="start"]'));
  b.w.history.pushState(null,'','?set=5');b.w.dispatchEvent(new b.w.PopStateEvent('popstate'));assert.match(b.d.querySelector('.session-lock').textContent,/Finish Set 3, Round 1/);
  const offline=browser(t,'math','?set=2',p,{online:true,delayed:true});await offline.fail();assert.ok(offline.d.querySelector('[data-action="start"]'));
});
test('Math: stale controls and storage sync cannot bypass a locked future set',t=>{
  const p=E.empty(),r=E.start(3,p,at);p.sessions['set-3']=[r];const id=r.questionIds[0],b=browser(t,'math','?set=3',p),content=b.d.getElementById('content');
  content.insertAdjacentHTML('beforeend',`<button data-action="start">stale</button><form data-question="${id}"><input type="radio" value="0" checked><p class="feedback"></p></form><textarea data-note="${id}">erase</textarea>`);
  content.querySelector('button').click();content.querySelector('input').dispatchEvent(new b.w.Event('change',{bubbles:true}));content.querySelector('textarea').dispatchEvent(new b.w.Event('input',{bubbles:true}));content.querySelector('form').dispatchEvent(new b.w.Event('submit',{bubbles:true,cancelable:true}));same(b.state()||p,p);assert.equal(b.pushes,0);
  completeMath(p,1);b.w.localStorage.setItem(MATHKEY,JSON.stringify(p));b.w.dispatchEvent(new b.w.StorageEvent('storage',{key:MATHKEY,newValue:JSON.stringify(p)}));assert.match(b.d.querySelector('.session-lock').textContent,/Finish Set 2, Round 1/);same(b.state().sessions['set-3'],p.sessions['set-3']);
});
test('Both pages show the exact rule and specific prerequisite guidance',t=>{
  for(const course of ['vr','math']){const b=browser(t,course,course==='vr'?'?session=2':'?set=2');assert.ok(b.d.querySelector('.session-rule').textContent.includes('Finish your earlier sessions to unlock the next one.'));assert.ok(b.d.querySelector('.session-lock'));}
});
