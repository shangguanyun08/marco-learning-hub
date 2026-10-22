const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto');
const {JSDOM}=require('jsdom');
const read=file=>fs.readFileSync(path.join(__dirname,file),'utf8'),files=['data.js','round2.js','checkpoint-data.js','review-checks-data.js','engine.js','review3-data.js','review3-engine.js','review4-data.js','review4-engine.js','review5-data.js','review5-engine.js'];
const ctx={crypto:{randomUUID}};for(const f of files)vm.runInNewContext(read(f),ctx);
const C=ctx.MarcoSkillCourse,E=ctx.MarcoSkillEngine,copy=x=>JSON.parse(JSON.stringify(x)),at='2026-10-17T18:00:00.000Z',KEY='marco-math-skill-builder-oct12-v1';
function finishCore(){const state=E.empty();for(let n=1;n<=6;n++){const r=E.start(n,state,at);state.sessions[E.sessionId(n)]=[r];for(const id of r.questionIds)E.submit(r,id,E.resolve(id).correct,at);}return state;}
function firstAnswers(state,number,right){const r=E.start(number,state,at);state.sessions[E.sessionId(number)]=[r];for(const [i,id] of r.questionIds.entries())E.submit(r,id,(E.resolve(id).correct+(i<right?0:1))%4,at);return r;}
function corrections(r){for(const id of r.questionIds)if(!E.done(r.answers[id]))E.submit(r,id,E.resolve(id).correct,at);}
function browser(t,state,query,reviewState){const dom=new JSDOM(read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'http://localhost/'+query,runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.MarcoSkillSync={APP_ID:KEY};w.localStorage.setItem(KEY,JSON.stringify(state));for(const f of files)w.eval(read(f));if(reviewState===undefined){reviewState=w.MarcoReview3Engine.empty();for(const id of w.MarcoReview3Data.ids)w.MarcoReview3Engine.submit(reviewState,id,w.MarcoReview3Data.questions[id].correct);}const review4=w.MarcoReview4Engine.empty();for(const id of w.MarcoReview4Data.ids)w.MarcoReview4Engine.submit(review4,id,w.MarcoReview4Data.questions[id].correct);w.localStorage.setItem('marco-math-skill-builder-oct12-review4-v1',JSON.stringify(review4));const review5=w.MarcoReview5Engine.empty();for(const id of w.MarcoReview5Data.ids)w.MarcoReview5Engine.submit(review5,id,w.MarcoReview5Data.questions[id].correct);w.localStorage.setItem('marco-math-skill-builder-oct12-review5-v1',JSON.stringify(review5));w.localStorage.setItem('marco-math-skill-builder-oct12-review3-v1',JSON.stringify(reviewState));w.eval(read('app.js'));return {w,d:w.document,state:()=>JSON.parse(w.localStorage.getItem(KEY))};}
const givens=q=>JSON.stringify([q.prompt,q.columns,q.table,q.graph,q.series,q.choiceGraphs,q.concept==='direction'?q.choices:null]);
test('Set 7 retains its 20-question check; Sets 8–10 cover six targets with two questions each',()=>{
 const seven=E.set(7);assert.equal(seven.questionIds.length,20);assert.equal(seven.targetCorrect,18);
 assert.equal(new Set(seven.questionIds.map(id=>E.resolve(id).concept)).size,13);
 const seen=new Set(seven.questionIds.map(id=>givens(E.resolve(id))));
 for(const number of [8,9,10]){const s=E.set(number),counts={};assert.equal(s.questionIds.length,12);assert.equal(s.targetCorrect,11);assert.ok(s.noRound2);
  for(const id of s.questionIds){const q=E.resolve(id);assert.ok(!seen.has(givens(q)),id);seen.add(givens(q));counts[q.concept]=(counts[q.concept]||0)+1;assert.equal(new Set(q.choices).size,4);}
  assert.deepEqual(counts,Object.fromEntries(Object.keys(counts).map(k=>[k,2])));assert.deepEqual(Object.keys(counts).sort(),['absequation','count','dimension','intercept','proportions','units']);
 }
});
test('Old optional work is preserved and cannot count toward either replacement check',()=>{
 const p=finishCore(),old=C.legacySets.find(s=>s.number===7),id='slope@401',q=E.resolve(id);
 p.sessions[old.id]=[{id:'old-optional',setNumber:7,startedAt:at,completedAt:null,questionIds:[id,'intercept@401'],answers:{[id]:{attempts:[{choice:q.correct,correct:true,at}]}},pending:{},notes:{},targeted:true,reasons:[]}];
 assert.ok(E.valid(p));const merged=E.merge(E.empty(),p);assert.deepEqual(copy(merged.sessions[old.id]),copy(p.sessions[old.id]));assert.equal(merged.sessions[E.sessionId(7)],undefined);
 const r=firstAnswers(merged,7,18);assert.equal(E.stats(r).first,18);assert.ok(E.valid(merged));assert.deepEqual(copy(merged.sessions[old.id]),copy(p.sessions[old.id]));
 const roundtrip=E.merge(p,merged);assert.ok(E.valid(roundtrip));assert.equal(E.stats(roundtrip.sessions[E.sessionId(7)][0]).first,18);
});
test('Set 8 remains locked until Set 7 is finished; retries and repeats cannot raise the first-try score',()=>{
 for(const right of [17,18,20]){const p=finishCore();assert.throws(()=>E.start(8,p,at),/Finish Set 7/);
  const r=firstAnswers(p,7,right);assert.equal(E.stats(r).first,right);
  if(right<20){assert.equal(r.completedAt,null);assert.throws(()=>E.start(8,p,at),/Finish Set 7/);corrections(r);}
  assert.ok(r.completedAt);assert.equal(E.stats(r).first,right);assert.ok(E.valid(p));
  assert.throws(()=>E.start(7,p,at),/saved attempt/);assert.throws(()=>E.startRound2(7,p,at),/no separate Round 2/);assert.throws(()=>E.startRound2(8,p,at),/no separate Round 2/);
  const eight=firstAnswers(p,8,11);corrections(eight);assert.equal(E.stats(eight).first,11);assert.ok(E.valid(p));
 }
});
test('New checks withhold feedback until every first answer and show a fixed 18/20 goal',t=>{
 const p=finishCore(),r=E.start(7,p,at);p.sessions[E.sessionId(7)]=[r];const first=r.questionIds[0],correct=E.resolve(first).correct;
 E.submit(r,first,(correct+1)%4,at);assert.equal(E.submit(r,first,correct,at),false);assert.equal(E.reveal(r,first),false);
 const pending=browser(t,p,'?set=7');assert.match(pending.d.querySelector('.scorebar').textContent,/1\/20/);assert.equal(pending.d.querySelector('.solution'),null);
 for(const [i,id] of r.questionIds.slice(1).entries())E.submit(r,id,(E.resolve(id).correct+(i===0?1:0))%4,at);
 const before=browser(t,p,'?set=7'),blocked=browser(t,p,'?set=8');assert.match(before.d.querySelector('.checkpoint-goal').textContent,/18\/20 = 90%/);assert.match(blocked.d.querySelector('.session-lock').textContent,/Finish Set 7/);
 corrections(r);const ready=browser(t,p,'?set=7&round=2');assert.match(ready.d.querySelector('.checkpoint-goal').textContent,/18\/20 = 90%/);assert.equal(ready.d.querySelector('nav[aria-label="Practice rounds"]'),null);assert.equal(ready.d.querySelector('[data-action="start"]'),null);
 const eight=browser(t,p,'?set=8');assert.ok(eight.d.querySelector('[data-action="start"]'));assert.equal(eight.d.querySelector('nav[aria-label="Practice rounds"]'),null);
 const low=finishCore();const lowRun=firstAnswers(low,7,17);corrections(lowRun);const lowPage=browser(t,low,'?set=7');assert.doesNotMatch(lowPage.d.querySelector('.checkpoint-goal').textContent,/goal reached/);assert.match(lowPage.d.querySelector('.checkpoint-goal').textContent,/17\/20 = 85%/);
});

test('All 36 new answer keys are independently solved and differ from Reviews 2 and 3',()=>{
 const expected={8:['15','28','5a = 8b','2','Column A is greater.','216','x = 7 or x = -3','42','1/125','45','3/8','3n = 5m'],9:['-2','Column B is greater.','-8','25.44%','5p = 7q','38','105.6','2/6','-7','7s = 11r','8/27','x = 7 or x = -12'],10:['3x = 4y','19%','-4','The quantities are equal.','1','32','700%','15','2','4/7','67.5','55']};
 const old={};for(const n of [2,3])vm.runInNewContext(read(`review${n}-data.js`),old);
 const seen=new Set([old.MarcoReview2Data,old.MarcoReview3Data].flatMap(d=>Object.values(d.questions).map(givens)));
 for(const n of [8,9,10]){
  assert.deepEqual(copy(E.set(n).questionIds.map(id=>{const q=E.resolve(id);return q.choices[q.correct];})),expected[n]);
  for(const id of E.set(n).questionIds){const q=E.resolve(id);assert.ok(!seen.has(givens(q)),id);seen.add(givens(q));}
 }
});

test('Sets 8–10 open sequentially, show 12 questions and an 11/12 goal, and keep first scores after retries',t=>{
 const state=finishCore();firstAnswers(state,7,20);
 for(const n of [8,9,10]){
  if(n<10){assert.throws(()=>E.start(n+1,state,at),new RegExp(`Finish Set ${n}`));const locked=browser(t,state,`?set=${n+1}`);assert.match(locked.d.querySelector('.session-lock').textContent,new RegExp(`Finish Set ${n}`));}
  const run=firstAnswers(state,n,11),pending=browser(t,state,`?set=${n}`);
  assert.equal(pending.d.querySelectorAll('#content .question').length,12);
  assert.match(pending.d.querySelector('.checkpoint-goal').textContent,/11\/12 = 92%/);
  assert.match(pending.d.querySelector('.checkpoint-goal').textContent,/goal reached/);
  assert.equal(pending.d.querySelector('nav[aria-label="Practice rounds"]'),null);
  if(n<10)assert.throws(()=>E.start(n+1,state,at),new RegExp(`Finish Set ${n}`));
  corrections(run);assert.equal(E.stats(run).first,11);assert.ok(E.valid(state));
  const reloaded=browser(t,copy(state),`?set=${n}`);
  assert.match(reloaded.d.querySelector('.complete-panel').textContent,/11\/12 correct/);
  if(n<10)assert.match(reloaded.d.querySelector('#content .actions').textContent,new RegExp(`Open Set ${n+1}`));
  else assert.match(reloaded.d.querySelector('#content .actions').textContent,/Back to review library/);
 }
 const low=finishCore();firstAnswers(low,7,20);const run=firstAnswers(low,8,10);corrections(run);
 const page=browser(t,low,'?set=8');assert.match(page.d.querySelector('.checkpoint-goal').textContent,/10\/12 = 83%/);assert.doesNotMatch(page.d.querySelector('.checkpoint-goal').textContent,/goal reached/);
});

test('Earlier 20-question Set 8 answers remain valid and merge intact beside the new 12-question set',()=>{
 const state=finishCore();firstAnswers(state,7,20);
 const old=C.legacySets.find(s=>s.number===8&&s.contentVersion==='targeted-20-v2');assert.ok(old);
 const run={id:'old-eight-record',setNumber:8,contentVersion:old.contentVersion,startedAt:at,completedAt:null,questionIds:[...old.questionIds],answers:{},pending:{},notes:{},targeted:false,reasons:[]};state.sessions[old.id]=[run];
 for(const id of run.questionIds)assert.ok(E.submit(run,id,E.resolve(id).correct,at));
 assert.ok(E.valid(state));const snapshot=copy(state.sessions[old.id]);
 const fresh=firstAnswers(state,8,11);corrections(fresh);const merged=E.merge(state,E.empty());
 assert.ok(E.valid(merged));assert.deepEqual(copy(merged.sessions[old.id]),snapshot);assert.equal(E.stats(merged.sessions[E.sessionId(8)][0]).total,12);assert.equal(E.stats(merged.sessions[old.id][0]).total,20);
});

test('Review 3 is the light next step and locks direct Set 8 access until corrections are finished',t=>{
 const state=finishCore();firstAnswers(state,7,20);const R=ctx.MarcoReview3Engine,D=ctx.MarcoReview3Data,r=R.empty();
 for(const id of D.ids)R.submit(r,id,(D.questions[id].correct+1)%4,at,randomUUID());
 const page=browser(t,state,'?set=8',r);assert.equal(page.d.querySelector('[data-action="start"]'),null);assert.match(page.d.querySelector('#content').textContent,/Finish Review Session 3/);
 const card=page.d.querySelector('.review3-card');assert.ok(!card.classList.contains('review-card'));assert.match(card.textContent,/Next step/);assert.ok(page.d.querySelector('a[href="?set=8"]').classList.contains('session-locked'));
 const before=JSON.stringify(state);for(const id of D.ids)R.submit(r,id,D.questions[id].correct,at,randomUUID());
 page.w.localStorage.setItem('marco-math-skill-builder-oct12-review3-v1',JSON.stringify(r));page.w.dispatchEvent(new page.w.StorageEvent('storage',{key:'marco-math-skill-builder-oct12-review3-v1'}));
 assert.ok(page.d.querySelector('[data-action="start"]'));assert.equal(page.d.querySelector('.next-step'),null);assert.equal(R.stats(r).first,0);assert.equal(JSON.stringify(state),before);
});

test('Finishing the original 24 Review 3 questions leaves the new eight pending before Set 8',t=>{
 const state=finishCore();firstAnswers(state,7,20);const R=ctx.MarcoReview3Engine,D=ctx.MarcoReview3Data,r=R.empty(),saved=copy(state);
 for(const id of D.ids.slice(0,24))R.submit(r,id,D.questions[id].correct,at,randomUUID());
 const before=copy(R.answers(r)),page=browser(t,state,'?set=8',r);
 assert.match(page.d.querySelector('.review3-card').textContent,/8 subtopics · 32 fresh questions/);
 assert.match(page.d.querySelector('.review3-card').textContent,/24\/32 finished/);
 assert.match(page.d.querySelector('.session-lock').textContent,/Answer all 32 questions/);
 assert.equal(page.d.querySelector('[data-action="start"]'),null);
 for(const id of D.ids.slice(24))R.submit(r,id,D.questions[id].correct,at,randomUUID());
 page.w.localStorage.setItem('marco-math-skill-builder-oct12-review3-v1',JSON.stringify(r));page.w.dispatchEvent(new page.w.StorageEvent('storage',{key:'marco-math-skill-builder-oct12-review3-v1'}));
 assert.ok(page.d.querySelector('[data-action="start"]'));
 for(const [id,answer]of Object.entries(before))assert.deepEqual(copy(R.answers(r)[id]),answer);
 assert.deepEqual(page.state(),saved);
});

test('Online Review 3 verification is read-only and unlocks from another device',async t=>{
 const state=finishCore();firstAnswers(state,7,20);const r=ctx.MarcoReview3Engine.empty();for(const id of ctx.MarcoReview3Data.ids)ctx.MarcoReview3Engine.submit(r,id,ctx.MarcoReview3Data.questions[id].correct,at,randomUUID());
 const dom=new JSDOM(read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'https://example.test/?set=8',runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};
 const r4=ctx.MarcoReview4Engine.empty();for(const id of ctx.MarcoReview4Data.ids)ctx.MarcoReview4Engine.submit(r4,id,ctx.MarcoReview4Data.questions[id].correct);
 const r5=ctx.MarcoReview5Engine.empty();for(const id of ctx.MarcoReview5Data.ids)ctx.MarcoReview5Engine.submit(r5,id,ctx.MarcoReview5Data.questions[id].correct);
 const calls=[];w.fetch=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({progress:{state:url.includes('review5-v1')?r5:url.includes('review4-v1')?r4:r,version:1}})};};
 w.MarcoSkillSync={APP_ID:KEY,create:()=>({start:()=>Promise.resolve(),push(){throw Error('No course writes expected');}})};w.localStorage.setItem(KEY,JSON.stringify(state));
 for(const f of [...files,'app.js'])w.eval(read(f));await new Promise(resolve=>setTimeout(resolve,25));
 assert.ok(w.document.querySelector('[data-action="start"]'));assert.equal(calls.length,3);for(const call of calls){assert.equal(call.options.method,undefined);assert.equal(call.options.body,undefined);}assert.ok(calls.some(call=>call.url.endsWith('review3-v1')));assert.ok(calls.some(call=>call.url.endsWith('review4-v1')));assert.equal(w.localStorage.getItem('marco-math-skill-builder-oct12-review3-v1'),null);
});
