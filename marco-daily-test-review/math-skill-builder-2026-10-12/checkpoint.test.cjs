const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto');
const {JSDOM}=require('jsdom');
const read=file=>fs.readFileSync(path.join(__dirname,file),'utf8'),files=['data.js','round2.js','checkpoint-data.js','engine.js'];
const ctx={crypto:{randomUUID}};for(const f of files)vm.runInNewContext(read(f),ctx);
const C=ctx.MarcoSkillCourse,E=ctx.MarcoSkillEngine,copy=x=>JSON.parse(JSON.stringify(x)),at='2026-10-17T18:00:00.000Z',KEY='marco-math-skill-builder-oct12-v1';
function finishCore(){const state=E.empty();for(let n=1;n<=6;n++){const r=E.start(n,state,at);state.sessions[E.sessionId(n)]=[r];for(const id of r.questionIds)E.submit(r,id,E.resolve(id).correct,at);}return state;}
function firstAnswers(state,number,right){const r=E.start(number,state,at);state.sessions[E.sessionId(number)]=[r];for(const [i,id] of r.questionIds.entries())E.submit(r,id,(E.resolve(id).correct+(i<right?0:1))%4,at);return r;}
function corrections(r){for(const id of r.questionIds)if(!E.done(r.answers[id]))E.submit(r,id,E.resolve(id).correct,at);}
function browser(t,state,query){const dom=new JSDOM(read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'http://localhost/'+query,runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.MarcoSkillSync={APP_ID:KEY};w.localStorage.setItem(KEY,JSON.stringify(state));for(const f of [...files,'app.js'])w.eval(read(f));return {w,d:w.document,state:()=>JSON.parse(w.localStorage.getItem(KEY))};}
const givens=q=>JSON.stringify([q.prompt,q.columns,q.table,q.graph,q.series,q.choiceGraphs,q.concept==='direction'?q.choices:null]);
test('Two new 20-question checks cover all 13 weak concepts, with different mathematical givens',()=>{
 const seen=new Set(),concepts=new Set();
 for(const n of [7,8]){const s=E.set(n),counts={};assert.equal(s.questionIds.length,20);assert.equal(s.targetCorrect,18);assert.ok(s.noRound2);assert.equal(s.adaptive,undefined);
  for(const id of s.questionIds){const q=E.resolve(id),key=givens(q);assert.ok(!seen.has(key),id);seen.add(key);concepts.add(q.concept);counts[q.skill]=(counts[q.skill]||0)+1;assert.equal(new Set(q.choices).size,4);}
  assert.deepEqual(counts,{graphs:8,rates:4,percent:4,absolute:4});
 }
 assert.equal(seen.size,40);assert.equal(concepts.size,13);
 for(let i=0;i<20;i++)assert.notEqual(givens(E.resolve(E.set(7).questionIds[i])),givens(E.resolve(E.set(8).questionIds[i])));
});
test('Old optional work is preserved and cannot count toward either replacement check',()=>{
 const p=finishCore(),old=C.legacySets.find(s=>s.number===7),id='slope@401',q=E.resolve(id);
 p.sessions[old.id]=[{id:'old-optional',setNumber:7,startedAt:at,completedAt:null,questionIds:[id,'intercept@401'],answers:{[id]:{attempts:[{choice:q.correct,correct:true,at}]}},pending:{},notes:{},targeted:true,reasons:[]}];
 assert.ok(E.valid(p));const merged=E.merge(E.empty(),p);assert.deepEqual(copy(merged.sessions[old.id]),copy(p.sessions[old.id]));assert.equal(merged.sessions[E.sessionId(7)],undefined);
 const r=firstAnswers(merged,7,18);assert.equal(E.stats(r).first,18);assert.ok(E.valid(merged));assert.deepEqual(copy(merged.sessions[old.id]),copy(p.sessions[old.id]));
 const roundtrip=E.merge(p,merged);assert.ok(E.valid(roundtrip));assert.equal(E.stats(roundtrip.sessions[E.sessionId(7)][0]).first,18);
});
test('Set 8 remains locked until Set 7 is finished; retries and repeats cannot raise the first-try score',()=>{
 for(const right of [17,18,20]){const p=finishCore();assert.throws(()=>E.start(8,p,at),/Finish the new Set 7/);
  const r=firstAnswers(p,7,right);assert.equal(E.stats(r).first,right);
  if(right<20){assert.equal(r.completedAt,null);assert.throws(()=>E.start(8,p,at),/Finish the new Set 7/);corrections(r);}
  assert.ok(r.completedAt);assert.equal(E.stats(r).first,right);assert.ok(E.valid(p));
  assert.throws(()=>E.start(7,p,at),/saved attempt/);assert.throws(()=>E.startRound2(7,p,at),/no separate Round 2/);assert.throws(()=>E.startRound2(8,p,at),/no separate Round 2/);
  const eight=firstAnswers(p,8,18);corrections(eight);assert.equal(E.stats(eight).first,18);assert.ok(E.valid(p));
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
