const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function setup(){const c={};c.globalThis=c;for(const f of ['data.js','engine.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,f),'utf8'),c);return{D:c.HarrySkillData,E:c.HarrySkillEngine};}
const plain=x=>JSON.parse(JSON.stringify(x));
const numeric=s=>Number(String(s).replace(/[$,]/g,'').match(/^\d+(?:\.\d+)?/)?.[0]);
function value(s){const m=String(s).match(/^(?:(\d+) )?(\d+)\/(\d+)$/);return m?Number(m[1]||0)+Number(m[2])/Number(m[3]):numeric(s);}
test('three balanced mixed sessions have unique questions and three questions per skill',()=>{
 const {D}=setup(),all=D.sessions.flatMap(s=>s.questions);assert.equal(all.length,72);assert.equal(new Set(all.map(q=>q.id)).size,72);assert.equal(new Set(all.map(q=>q.prompt+JSON.stringify(q.visual||null))).size,72);
 for(const s of D.sessions){assert.equal(s.questions.length,24);for(const k of D.skills)assert.equal(s.questions.filter(q=>q.skill===k.id).length,3);for(const [i,q]of s.questions.entries()){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(q.explanation.length>35);if(i)assert.notEqual(q.skill,s.questions[i-1].skill);}}
 assert.equal(all.filter(q=>q.visual).length,9);
});
test('all 72 answer keys agree with independent arithmetic and diagram checks',()=>{
 const {D}=setup();for(const q of D.sessions.flatMap(s=>s.questions)){
  const c=q.check,a=c.args||[],answer=q.choices[q.correct];let expected;
  switch(c.kind){
   case'subtractFractions':expected=(a[0]*a[3]-a[2]*a[1])/(a[1]*a[3]);break;
   case'mixedMultiply':expected=(a[0]*a[2]+a[1])*a[3]/a[2];break;
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
 const state=E.empty();for(let i=0;i<3;i++)fill(E,D,state,i,`2026-11-0${i+1}T17:00:00.000Z`);assert.ok(E.valid(state));assert.equal(E.report(state).ready,true);assert.ok(E.report(state).skills.every(s=>s.correct===9));
 const weak=E.empty();for(let i=0;i<3;i++)fill(E,D,weak,i,`2026-11-0${i+1}T17:00:00.000Z`,[D.sessions[i].questions.findIndex(q=>q.skill==='fractions')]);assert.equal(E.report(weak).ready,false);assert.equal(E.report(weak).skills.find(s=>s.id==='fractions').correct,6);
 const lastBelowTarget=E.empty();fill(E,D,lastBelowTarget,0,'2026-11-01T17:00:00.000Z');fill(E,D,lastBelowTarget,1,'2026-11-02T17:00:00.000Z');fill(E,D,lastBelowTarget,2,'2026-11-03T17:00:00.000Z',[0,1,2]);assert.equal(E.report(lastBelowTarget).scores[2].correct,21);assert.equal(E.report(lastBelowTarget).accuracyReady,false);assert.equal(E.report(lastBelowTarget).ready,false);
});
test('parent review never improves a first-try score and partial records cannot claim completion',()=>{
 const {D,E}=setup(),state=E.empty();fill(E,D,state,0,at,[0]);const before=E.stats(state.sessions['mixed-1']).correct,q=D.sessions[0].questions[0];state.sessions['mixed-1'].reviewed[q.id]=at;assert.equal(E.stats(state.sessions['mixed-1']).correct,before);assert.ok(E.valid(state));const tampered=plain(state);delete tampered.sessions['mixed-1'].answers[q.id];assert.equal(E.valid(tampered),false);
});
