const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function setup(){const c={};c.globalThis=c;for(const f of ['data.js','engine.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,f),'utf8'),c);return{D:c.HarrySkillData,E:c.HarrySkillEngine};}
const plain=x=>JSON.parse(JSON.stringify(x));
const numeric=s=>Number(String(s).replace(/[$,]/g,'').match(/^\d+(?:\.\d+)?/)?.[0]);
function value(s){const m=String(s).match(/^(?:(\d+) )?(\d+)\/(\d+)$/);return m?Number(m[1]||0)+Number(m[2])/Number(m[3]):numeric(s);}
test('five balanced mixed sessions have the requested 24/24/16/16/16 question counts',()=>{
 const {D}=setup(),all=D.sessions.flatMap(s=>s.questions);assert.equal(D.sessions.length,5);assert.equal(all.length,96);assert.equal(new Set(all.map(q=>q.id)).size,96);assert.equal(new Set(all.map(q=>q.prompt+JSON.stringify(q.visual||null))).size,96);
 for(const s of D.sessions){assert.equal(s.questions.length,s.number<=2?24:16);for(const k of D.skills)assert.equal(s.questions.filter(q=>q.skill===k.id).length,s.number<=2?3:2);for(const [i,q]of s.questions.entries()){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(q.explanation.length>35);if(i)assert.notEqual(q.skill,s.questions[i-1].skill);}}
 assert.equal(all.filter(q=>q.visual).length,12);assert.equal(D.sessions.flatMap(s=>s.retiredQuestions||[]).length,38);
});
test('all active and archived answer keys agree with independent arithmetic and diagram checks',()=>{
 const {D}=setup();for(const q of D.sessions.flatMap(s=>[...s.questions,...(s.retiredQuestions||[])])){
  const c=q.check,a=c.args||[],answer=q.choices[q.correct];let expected;
  switch(c.kind){
   case'subtractFractions':expected=(a[0]*a[3]-a[2]*a[1])/(a[1]*a[3]);break;
   case'mixedMultiply':expected=(a[0]*a[2]+a[1])*a[3]/a[2];break;
   case'fractionMultiply':expected=a[0]*a[2]/a[1];break;
   case'divideFractions':expected=a[0]*a[3]/(a[1]*a[2]);break;
   case'multiply':case'area':expected=a[0]*a[1];break;
   case'subtract':expected=a[0]-a[1];break;
   case'mixedDivide':case'divide':expected=a[0]/a[1];break;
   case'moneyMultiply':expected=a[0]*a[1]/100;break;
   case'multiplyAdd':expected=a[0]*a[1]+a[2];break;
   case'perimeter':expected=2*(a[0]+a[1]);break;
   case'scale':expected=a[0]*a[2]/a[1];break;
   case'mixedEstimate':expected=Math.round(a[0]+a[1]/a[2])-Math.round(a[3]+a[4]/a[5]);break;
   case'mixedSumEstimate':expected=Math.round(a[0]+a[1]/a[2])+Math.round(a[3]+a[4]/a[5]);break;
   case'roundDifference':expected=(Math.floor(a[0]*100/a[2]+.5)-Math.floor(a[1]*100/a[2]+.5))/100;break;
   case'round':expected=Math.floor(a[0]*a[2]/a[1]+.5)/a[2];break;
   case'median':{const ns=[...a].sort((x,y)=>x-y),m=Math.floor(ns.length/2);expected=ns.length%2?ns[m]:(ns[m-1]+ns[m])/2;break;}
   case'coordinate':assert.equal(answer,`(${a[0]}, ${a[1]})`);assert.equal(q.visual.x,a[0]);assert.equal(q.visual.y,a[1]);continue;
   case'areaPerimeter':assert.equal(answer,`Area ${a[0]*a[1]} m²; perimeter ${2*(a[0]+a[1])} m`);continue;
   case'scaledPair':assert.equal(answer,`${a[0]*a[2]} cm by ${a[1]*a[2]} cm`);continue;
   case'expression':assert.equal(answer,c.answer);continue;
   default:throw Error(c.kind);
  }
  assert.ok(Math.abs(value(answer)-expected)<1e-10,`${q.id}: ${answer}, expected ${expected}`);assert.ok(q.choices.filter(x=>Math.abs(value(x)-expected)<1e-10).length===1,`Multiple numeric correct choices ${q.id}`);
 }
});
test('sessions four and five restore mixed fraction multiplication while other multiplication stays simple',()=>{
 const {D}=setup(),p=D.multiplicationPolicy;assert.equal(p.fromSession,4);assert.equal(p.maxWholeFactor,10);
 assert.equal(p.allowMixedFractionMultiplication,true);
 for(const [sessionId,questionId] of [['mixed-4','s4-fractions-2'],['mixed-5','s5-fractions-2']]){
  const session=D.sessions.find(item=>item.id===sessionId);
  assert.equal(session.questions.find(question=>question.id===questionId)?.check.kind,'mixedMultiply');
 }
 const small=n=>Number.isInteger(n)&&n>=1&&n<=p.maxWholeFactor;
 for(const s of D.sessions.filter(s=>s.number>=p.fromSession))for(const q of s.questions){
  if(q.skill==='fractions')continue;
  const {kind,args:a=[]}=q.check,ok=(...ns)=>assert.ok(ns.every(small),`${q.id}: multiplication factors ${ns}`);
  assert.ok(!['mixedMultiply','moneyMultiply'].includes(kind),`${q.id}: complex multiplication`);
  if(['multiply','area','areaPerimeter'].includes(kind))ok(...a);
  if(kind==='multiplyAdd'&&a[0]!==1&&a[1]!==1)ok(a[0],a[1]);
  if(kind==='scaledPair')ok(...a);
  if(kind==='scale'){const f=a[2]/a[1];f>=1?ok(a[0],a[1],f):ok(a[0]/(1/f),a[1]/(1/f),1/f);}
  for(const m of (q.prompt+' '+q.explanation).matchAll(/(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)/g))ok(Number(m[1]),Number(m[2]));
 }
});
const at='2026-10-31T17:00:00.000Z';
function fill(E,D,state,index,date=at,misses=[]){const s=D.sessions[index];assert.equal(E.start(state,s.id,date),true);for(const [i,q]of s.questions.entries())assert.equal(E.submit(state,s.id,q.id,misses.includes(i)?(q.correct+1)%4:q.correct,new Date(Date.parse(date)+i*1000).toISOString(),`${s.id}-event-${i}`),true);}
test('first answers lock, unfinished sessions stay incomplete, and the next session requires completion',()=>{
 const {D,E}=setup(),state=E.empty(),s=D.sessions[0],q=s.questions[0];assert.ok(E.valid(state));assert.equal(E.start(state,'mixed-2',at),false);assert.equal(E.start(state,s.id,at),true);assert.equal(E.submit(state,s.id,q.id,(q.correct+1)%4,at,'event-first'),true);assert.equal(E.submit(state,s.id,q.id,q.correct,at,'event-second'),false);assert.equal(E.complete(state.sessions[s.id]),false);assert.equal(E.start(state,'mixed-2',at),false);assert.equal(E.report(state).completed,0);assert.equal(E.report(state).skills[0].total,0);assert.ok(E.valid(state));
});
test('a stale or offline device merges distinct answers without replacing the first online answer',()=>{
 const {D,E}=setup(),remote=E.empty(),local=E.empty(),s=D.sessions[0],[q1,q2]=s.questions;E.start(remote,s.id,at);E.start(local,s.id,at);E.submit(remote,s.id,q1.id,(q1.correct+1)%4,at,'remote-first');E.submit(local,s.id,q1.id,q1.correct,at,'local-first');E.submit(local,s.id,q2.id,q2.correct,at,'local-second');const merged=E.merge(local,remote);assert.equal(merged.sessions[s.id].answers[q1.id].correct,false);assert.equal(merged.sessions[s.id].answers[q2.id].correct,true);assert.equal(merged.sessions[s.id].conflicts[q1.id][0].id,'local-first');assert.ok(E.valid(merged));assert.deepEqual(plain(E.merge(merged,merged)),plain(merged));
});
test('progress requires fresh coverage, separate days, strong results in every skill, and 22/24 in both final sessions',()=>{
 const {D,E}=setup(),sameDay=E.empty();for(let i=0;i<3;i++)fill(E,D,sameDay,i,at);assert.equal(E.report(sameDay).ready,false);assert.equal(E.report(sameDay).studyDays,1);
 const state=E.empty();for(let i=0;i<3;i++)fill(E,D,state,i,`2026-11-0${i+1}T17:00:00.000Z`);assert.ok(E.valid(state));assert.equal(E.report(state).ready,true);assert.ok(E.report(state).skills.every(s=>s.correct===8));
 const weak=E.empty();for(let i=0;i<3;i++)fill(E,D,weak,i,`2026-11-0${i+1}T17:00:00.000Z`,[D.sessions[i].questions.findIndex(q=>q.skill==='fractions')]);assert.equal(E.report(weak).ready,false);assert.equal(E.report(weak).skills.find(s=>s.id==='fractions').correct,5);
 const lastBelowTarget=E.empty();fill(E,D,lastBelowTarget,0,'2026-11-01T17:00:00.000Z');fill(E,D,lastBelowTarget,1,'2026-11-02T17:00:00.000Z');fill(E,D,lastBelowTarget,2,'2026-11-03T17:00:00.000Z',[0,1,2]);assert.equal(E.report(lastBelowTarget).scores[2].correct,13);assert.equal(E.report(lastBelowTarget).accuracyReady,false);assert.equal(E.report(lastBelowTarget).ready,false);
});
test('parent review never improves a first-try score and partial records cannot claim completion',()=>{
 const {D,E}=setup(),state=E.empty();fill(E,D,state,0,at,[0]);const before=E.stats(state.sessions['mixed-1']).correct,q=D.sessions[0].questions[0];state.sessions['mixed-1'].reviewed[q.id]=at;assert.equal(E.stats(state.sessions['mixed-1']).correct,before);assert.ok(E.valid(state));const tampered=plain(state);delete tampered.sessions['mixed-1'].answers[q.id];assert.equal(E.valid(tampered),false);
});
test('whole-set submission rejects missing or invalid choices without recording any first answers',()=>{
 const {D,E}=setup(),state=E.empty(),s=D.sessions[0],choices=Object.fromEntries(s.questions.map(q=>[q.id,q.correct])),before=plain(state);
 const missing={...choices};delete missing[s.questions[23].id];
 assert.equal(E.submitSet(state,s.id,missing,at,()=> 'set-event-000001'),false);assert.deepEqual(plain(state),before);
 for(const invalid of [-1,4,1.5,'1',null]){assert.equal(E.submitSet(state,s.id,{...choices,[s.questions[0].id]:invalid},at,()=> 'set-event-000001'),false);assert.deepEqual(plain(state),before);}
 assert.equal(E.submitSet(state,'mixed-2',Object.fromEntries(D.sessions[1].questions.map(q=>[q.id,q.correct])),at,()=> 'set-event-000001'),false);assert.deepEqual(plain(state),before);
});
test('each set saves all first answers together, fixes the score, and unlocks the next set',()=>{
 const {D,E}=setup(),state=E.empty();let event=0;
 for(const s of D.sessions){
  const choices=Object.fromEntries(s.questions.map((q,i)=>[q.id,i<2?(q.correct+1)%4:q.correct]));
  assert.equal(E.submitSet(state,s.id,choices,at,()=>`set-event-${++event}`),true);
  assert.equal(E.complete(state.sessions[s.id]),true);assert.equal(E.stats(state.sessions[s.id]).correct,s.questions.length-2);assert.ok(E.valid(state));
  const scored=plain(state.sessions[s.id]);
  assert.equal(E.submitSet(state,s.id,Object.fromEntries(s.questions.map(q=>[q.id,q.correct])),at,()=>`set-event-${++event}`),false);
  assert.deepEqual(plain(state.sessions[s.id]),scored);
 }
 assert.equal(E.report(state).completed,5);
});
test('sessions four and five provide fresh evidence while keeping earlier scores and mistakes',()=>{
 const {D,E}=setup(),state=E.empty();
 for(let i=0;i<3;i++)fill(E,D,state,i,`2026-11-0${i+1}T17:00:00.000Z`,i<2?D.sessions[i].questions.map((_,j)=>j):[]);
 assert.equal(E.report(state).ready,false);const original=plain(state.sessions['mixed-1']);
 fill(E,D,state,3,'2026-11-04T17:00:00.000Z');assert.equal(E.report(state).ready,false);
 fill(E,D,state,4,'2026-11-05T17:00:00.000Z');const r=E.report(state);
 assert.equal(r.completed,5);assert.equal(r.ready,true);assert.deepEqual(plain(r.evidenceSessions),[3,4,5]);assert.ok(r.skills.every(s=>s.correct===6&&s.total===6));
 assert.equal(r.scores[0].correct,0);assert.ok(r.skills.every(s=>s.misses.length===6));assert.deepEqual(plain(state.sessions['mixed-1']),original);assert.ok(E.valid(E.merge(state,E.empty())));
});
test('finishing a legacy partial set preserves earlier submitted first answers and syncs a valid complete record',()=>{
 const {D,E}=setup(),state=E.empty(),s=D.sessions[0],q=s.questions[0];
 E.start(state,s.id,at);E.submit(state,s.id,q.id,(q.correct+1)%4,at,'legacy-first-event');
 const original=plain(state.sessions[s.id].answers[q.id]),remote=plain(state);let event=0;
 assert.equal(E.submitSet(state,s.id,Object.fromEntries(s.questions.map(q=>[q.id,q.correct])),at,()=>`new-set-event-${++event}`),true);
 assert.deepEqual(plain(state.sessions[s.id].answers[q.id]),original);assert.equal(E.stats(state.sessions[s.id]).correct,23);
 const merged=E.merge(state,remote);assert.ok(E.valid(merged));assert.equal(E.complete(merged.sessions[s.id]),true);assert.equal(E.stats(merged.sessions[s.id]).correct,23);
});
test('dashboard percentages use first answers and each session has the right denominator',()=>{
 const {D,E}=setup(),state=E.empty();fill(E,D,state,0,at,Array.from({length:16},(_,i)=>i));fill(E,D,state,1,at,Array.from({length:13},(_,i)=>i));
 assert.equal(E.stats(state.sessions['mixed-1']).percent,33.3);assert.equal(E.stats(state.sessions['mixed-2']).percent,45.8);
 assert.equal(E.stats(undefined,'mixed-3').total,16);
 const s=D.sessions[2],choices=Object.fromEntries(s.questions.map((q,i)=>[q.id,i===0?(q.correct+1)%4:q.correct]));let event=0;
 const incomplete={...choices};delete incomplete[s.questions.at(-1).id];const before=plain(state);
 assert.equal(E.submitSet(state,s.id,incomplete,at,()=>`short-set-event-${++event}`),false);assert.deepEqual(plain(state),before);
 assert.equal(E.submitSet(state,s.id,choices,at,()=>`short-set-event-${++event}`),true);
 assert.equal(E.stats(state.sessions[s.id]).correct,15);assert.equal(E.stats(state.sessions[s.id]).total,16);assert.equal(E.stats(state.sessions[s.id]).percent,93.8);assert.equal(E.start(state,'mixed-4',at),true);
});
test('shortened sessions preserve older answers to retired questions without counting them in the score',()=>{
 const {D,E}=setup(),state=E.empty();fill(E,D,state,0,at);fill(E,D,state,1,at);fill(E,D,state,2,at);
 const s=D.sessions[2],r=state.sessions[s.id];for(const [i,q]of s.retiredQuestions.entries())r.answers[q.id]={id:`retired-first-${i}`,choice:(q.correct+1)%4,correct:false,at:'2026-11-01T17:00:00.000Z'};
 r.completedAt='2026-11-01T17:00:00.000Z';r.notes[s.retiredQuestions[0].id]={text:'Earlier working is retained.',at};assert.ok(E.valid(state));
 const merged=E.merge(state,E.empty());assert.equal(Object.keys(merged.sessions[s.id].answers).length,24);assert.equal(E.stats(merged.sessions[s.id]).correct,16);assert.equal(E.stats(merged.sessions[s.id]).wrong,0);assert.equal(E.stats(merged.sessions[s.id]).percent,100);assert.deepEqual(plain(merged.sessions[s.id].answers),plain(r.answers));assert.ok(E.valid(merged));
 const legacyPartial=plain(state);delete legacyPartial.sessions[s.id].answers[s.retiredQuestions[1].id];legacyPartial.sessions[s.id].completedAt=null;assert.ok(E.valid(legacyPartial));assert.ok(E.merge(legacyPartial,E.empty()).sessions[s.id].completedAt);
});
