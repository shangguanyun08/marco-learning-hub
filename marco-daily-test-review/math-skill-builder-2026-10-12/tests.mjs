import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
const dir=new URL('.',import.meta.url),context={crypto:{randomUUID},setTimeout,clearTimeout,setInterval,clearInterval,AbortController,fetch,addEventListener(){},removeEventListener(){},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}},localStorage:{getItem(){return null;},setItem(){}}};
for(const file of ['data.js','round2.js','checkpoint-data.js','engine.js','sync.js'])vm.runInNewContext(fs.readFileSync(new URL(file,dir),'utf8'),context,{filename:file});
const C=context.MarcoSkillCourse,E=context.MarcoSkillEngine,S=context.MarcoSkillSync,copy=x=>JSON.parse(JSON.stringify(x));
const number=s=>{const text=String(s).replace(/[°%]/g,'');if(text.includes('/')){const [a,b]=text.split('/').map(Number);return a/b;}return Number(text);};
const close=(a,b)=>Math.abs(a-b)<1e-8;
function expected(q){const p=q.audit,v=p.v;
  switch(p.kind){
    case 'speed':return v===0?p.speed*(p.h+2):v===1?p.h+3:p.speed;
    case 'relative':return {comparison:[1,p.a/p.b]};
    case 'remaining':return v===0?p.used*(p.den-p.num)/p.num:v===1?p.used*p.den/p.num:{comparison:[p.used/p.num,p.total-p.used]};
    case 'unitprice':return v===0?'Store A':v===1?(p.pb-p.pa)*(q.seed%7+2):{comparison:[p.pa,p.pa]};
    case 'mixture':return v===0?p.b*p.k:v===1?p.a*p.k:`${p.b}j = ${p.a}w`;
    case 'units':return {comparison:[p.mph,p.fps*3600/5280]};
    case 'slope':return p.rise/p.run;
    case 'intercept':return p.y-p.m*p.x;
    case 'graphvalue':return v===0?p.m*p.x+p.b:v===1?2*p.m:p.m;
    case 'direction':{const best=p.slopes.map((m,i)=>({m,i})).filter(x=>x.m>0).sort((a,b)=>a.m-b.m)[0].i;return {index:p.order.indexOf(best)};}
    case 'count':{let a=0,b=0,d=0;for(const r of p.rows){if(r[1]>r[2])a++;if(r[2]>r[1])b++;if(r[1]!==r[2])d++;}return v===0?b-a:v===1?b/p.rows.length:d;}
    case 'grouping':return {comparison:v===0?[2*Math.abs(-p.a)-2*Math.abs(p.b),2*Math.abs(-p.a-p.b)]:v===1?[Math.abs(-p.a+p.b),Math.abs(-p.a)+Math.abs(p.b)]:[-Math.abs(-p.a)+p.b,Math.abs(-p.a+p.b)]};
    case 'absequation':return v===0?(p.k===0?1:p.k<0?0:2):v===1?(p.c+p.k)+(p.c-p.k):`x is ${p.k} or −${p.k}.`;
    case 'signed':return v===0?-p.a*p.b-(-p.c):v===1?-p.a*p.b+(-p.c):(-p.a)*(-p.b)-p.c;
    case 'part':return v===0?p.amount*p.p/100:v===1?p.portion/p.amount*100:40;
    case 'base':return v===0?(p.newer-p.old)/p.old*100:v===1?(p.newer-p.old)/p.newer*100:{comparison:[(p.newer-p.old)/p.old,(p.newer-p.old)/p.newer]};
    case 'reverse':return p.final/p.factor;
    case 'compound':return p.start*p.a*p.b;
    case 'dimension':return v===1?p.scale**p.power:v===0?(p.scale**p.power-1)*100:(1-p.scale**p.power)*100;
    case 'cases':return v===2?p.a*p.x2+p.c:{comparison:[(p.y1-p.c)/p.a,p.a*p.x2+p.c]};
    case 'system':{const x=(2*p.b-p.a)/3,y=(2*p.a-p.b)/3;return v===0?x-y:v===1?{comparison:[x,y+2]}:x*y;}
    case 'setup':return v===0?`${p.weeks*p.factor}b − ${p.weeks}b = ${p.difference}`:v===1?p.difference/(p.weeks*(p.factor-1)):`${2*(q.seed%5+2)}x + ${q.seed%7+2}`;
    case 'powers':return v===0?{comparison:[.01**p.exp,.1**(2*p.exp)]}:v===1?{comparison:[.1**p.exp,.1**(p.exp+1)]}:.1**p.exp;
    case 'angles':return v===0?p.a:v===1?180-p.a:360-p.a;
    case 'net':return v===2?p.faces+2:`${p.shape[0].toUpperCase()+p.shape.slice(1)} ${v===0?'pyramid':'prism'}`;
    default:throw new Error('Missing independent solution');
  }
}
function checkQuestion(q){assert.equal(q.choices.length,4,q.id);assert.equal(new Set(q.choices).size,4,q.id);assert.ok(q.tip&&q.explanation&&q.prompt,q.id);const x=expected(q);if(x?.comparison){const [a,b]=x.comparison,index=close(a,b)?2:a>b?0:1;assert.equal(q.correct,index,q.id);}else if(x?.index!==undefined)assert.equal(q.correct,x.index,q.id);else if(typeof x==='number'){assert.ok(close(number(q.choices[q.correct]),x),q.id+': '+q.choices[q.correct]+' expected '+x);assert.equal(q.choices.filter(c=>close(number(c),x)).length,1,q.id);}else{assert.equal(q.choices[q.correct],x,q.id);}}
let checked=0;for(const kind of Object.keys(C.group))for(let seed=1;seed<=500;seed++){checkQuestion(C.question(kind,seed));checked++;}
const core=C.sets.slice(0,6).flatMap(s=>s.questionIds);assert.equal(core.length,90);assert.equal(new Set(core).size,90);const allocation={};for(const id of core){const k=E.resolve(id).skill;allocation[k]=(allocation[k]||0)+1;}assert.deepEqual(allocation,{rates:16,graphs:24,absolute:12,percent:20,algebra:8,other:10});
assert.equal(C.sets[7].questionIds.length,20);for(const set of C.sets.filter(s=>s.checkpoint))for(const id of set.questionIds)checkQuestion(E.resolve(id));assert.ok(C.sets[7].questionIds.every(id=>!core.includes(id)));
const at=(day,second=0)=>`2026-10-${String(day).padStart(2,'0')}T18:00:${String(second).padStart(2,'0')}.000Z`;
const state=E.empty(),r=E.start(1,state,at(12),'learning-run');state.sessions['set-1']=[r];const id=r.questionIds[0],q=E.resolve(id),wrong=(q.correct+1)%4;
assert.ok(E.submit(r,id,wrong,at(12,1)));assert.equal(E.reveal(r,id),false);assert.equal(E.submit(r,id,wrong,at(12,2)),false);assert.ok(E.submit(r,id,q.correct,at(12,3)));assert.equal(E.reveal(r,id),true);assert.equal(E.stats(r).first,0);assert.equal(E.stats(r).corrected,1);
assert.equal(E.submit(r,id,q.correct,at(12,4)),false);const frozen=E.plan(state);assert.equal(frozen.questionIds.length,5);assert.equal(frozen.reasons[0].concept,q.concept);const repair={id:'legacy-repair-run',setNumber:7,startedAt:at(13),completedAt:null,questionIds:[...frozen.questionIds],answers:{},pending:{},notes:{},targeted:true,reasons:frozen.reasons};state.sessions['set-7']=[repair];assert.deepEqual(copy(repair.questionIds),copy(frozen.questionIds));for(const rid of repair.questionIds)assert.ok(E.submit(repair,rid,E.resolve(rid).correct,at(13,1)));const next=E.plan(state);assert.ok(next.questionIds.every(x=>!repair.questionIds.includes(x)));assert.equal(next.targeted,false);assert.equal(repair.questionIds.length,5);
const c=E.start(5,state,at(16),'check-run');state.sessions['set-5']=[c];const cq=E.resolve(c.questionIds[0]);assert.ok(E.submit(c,cq.id,(cq.correct+1)%4,at(16,1)));assert.equal(E.submit(c,cq.id,cq.correct,at(16,2)),false);assert.equal(E.reveal(c,cq.id),false);assert.equal(E.skillStats(state).rates.checks,0);
for(const cid of c.questionIds.slice(1))assert.ok(E.submit(c,cid,E.resolve(cid).correct,at(16,3)));assert.ok(E.firstPass(c));assert.equal(E.reveal(c,cq.id),false);assert.ok(E.submit(c,cq.id,cq.correct,at(16,4)));assert.ok(c.completedAt);assert.equal(E.stats(c).first,14);assert.equal(E.reveal(c,cq.id),true);
assert.ok(E.valid(state));const bad=copy(state);bad.sessions['set-1'][0].answers[id].attempts[0].correct=true;assert.equal(E.valid(bad),false);
const left=copy(state),right=copy(state);left.sessions['set-1'][0].notes[id]={text:'speed = distance / time',at:at(12,5)};right.sessions['set-1'][0].pending[r.questionIds[1]]={choice:2,at:at(12,6)};
assert.deepEqual(E.merge(left,right),E.merge(right,left));assert.deepEqual(E.merge(E.merge(left,right),left),E.merge(left,right));assert.ok(E.valid(E.merge(left,right)));
const conflict=copy(left);conflict.sessions['set-1'][0].answers[id].attempts[0]={choice:(q.correct+2)%4,correct:false,at:at(12,1)};const branched=E.merge(left,conflict);assert.equal(branched.sessions['set-1'].length,2);assert.ok(E.valid(branched));assert.deepEqual(E.merge(left,conflict),E.merge(conflict,left));
let remote=null,version=0,posts=0,onlineStatus='';const sync=S.create({getState:()=>state,onRemote:x=>Object.assign(state,x),onStatus:k=>onlineStatus=k,fetcher:async(url,opt)=>{assert.ok(url.includes(S.APP_ID));if(opt.method==='POST'){posts++;const b=JSON.parse(opt.body);assert.equal(b.appId,S.APP_ID);assert.equal(b.baseVersion,remote?.version??null);remote={version:++version,state:b.state};return {ok:true,json:async()=>({accepted:true,progress:remote})};}return{ok:true,json:async()=>({progress:remote})};}});await sync.push();assert.equal(posts,1);assert.equal(onlineStatus,'live');await sync.push();assert.equal(posts,1);sync.stop();
const clean=E.empty();for(const s of C.sets.filter(x=>x.check)){const rr=E.start(s.number,clean,at(s.number===5?16:18),'run-'+s.number);clean.sessions[s.id]=[rr];for(const xid of rr.questionIds)E.submit(rr,xid,E.resolve(xid).correct,at(s.number===5?16:18,1));}
const proof=E.skillStats(clean);for(const k of ['rates','graphs','absolute','percent'])assert.ok(proof[k].checks>=10,k);const before=copy(proof);const repeat=E.start(5,clean,at(19),'repeat-5');clean.sessions['set-5'].push(repeat);for(const xid of repeat.questionIds)E.submit(repeat,xid,E.resolve(xid).correct,at(19,1));assert.deepEqual(copy(E.skillStats(clean)),before);
const dailyBefore=copy(E.dailyScores(clean));const dailyRepeat=E.start(5,clean,at(20),'repeat-day-score');clean.sessions['set-5'].push(dailyRepeat);for(const xid of dailyRepeat.questionIds)E.submit(dailyRepeat,xid,(E.resolve(xid).correct+1)%4,at(20,1));assert.deepEqual(copy(E.dailyScores(clean)),dailyBefore);
const held=E.empty(),heldRun=E.start(6,held,at(17),'held-score');held.sessions['set-6']=[heldRun];E.submit(heldRun,heldRun.questionIds[0],E.resolve(heldRun.questionIds[0]).correct,at(17,1));assert.equal(E.dailyScores(held)[5].correct,null);assert.equal(E.dailyScores(held)[5].percent,null);
assert.equal(E.dailyScores(state)[0].correct,0);assert.equal(E.dailyScores(state)[4].correct,14);assert.equal(E.dailyScores(state)[4].final,true);assert.equal(E.dailyScores(state)[4].percent,93);
console.log(JSON.stringify({checkedQuestions:checked,coreQuestions:90,allocation,newTargetedChecks:'2 × 20; goal 18/20 first try',tests:'math answers, unique options, 2-try gates, delayed feedback, adaptation, fresh IDs, state validation, conflict-safe sync, repeat-proof daily/check scores: PASS'},null,2));

const givens=q=>JSON.stringify([q.prompt,q.table,q.graph,q.series,q.diagram,q.columns,q.choiceGraphs,q.concept==='direction'?q.choices:null]);
for(const kind of Object.keys(C.group))for(let seed=1;seed<=500;seed++){
 const q=C.question(kind,seed),review=C.round2Question(q.id);checkQuestion(review);if(review.choiceGraphs)assert.deepEqual(copy(review.choices),['Graph A','Graph B','Graph C','Graph D']);
 assert.equal(review.concept,q.concept);assert.equal(review.audit.v,q.audit.v);assert.notEqual(givens(review),givens(q),q.id+' needs different numbers');
 assert.deepEqual(review,C.round2Question(q.id));
}
for(let n=1;n<=6;n++){
 const state=E.empty(),first=E.start(1,state,at(12),'setup');state.sessions['set-1']=[first];
 E.submit(first,first.questionIds[0],(E.resolve(first.questionIds[0]).correct+1)%4,at(12,1));
 let source=n===1?first:E.start(n,state,at(12),'source');state.sessions[E.sessionId(n)]=[source];
 assert.throws(()=>E.startRound2(n,state));
 for(const [i,id] of source.questionIds.entries())if(!source.answers[id])E.submit(source,id,(E.resolve(id).correct+(i<2?1:0))%4,at(12,2));
 for(const id of source.questionIds.slice(0,2))E.submit(source,id,E.resolve(id).correct,at(12,3));
 const before=copy(E.dailyScores(state)),evidence=copy(E.skillStats(state)),original=copy(source),r=E.startRound2(n,state,at(13),'round2');state.sessions[E.sessionId(n,2)]=[r];
 assert.equal(r.questionIds.length,2);assert.ok(E.valid(state));
 for(const id of r.questionIds)E.submit(r,id,E.resolve(id).correct,at(13,1));
 assert.equal(E.stats(r).first,2);assert.ok(r.completedAt);assert.ok(E.valid(state));
 const restored=E.merge(E.empty(),copy(state));assert.deepEqual(copy(restored.sessions[E.sessionId(n,2)]),copy([r]));assert.ok(E.valid(restored));
 assert.deepEqual(copy(source),original);assert.deepEqual(copy(E.dailyScores(state)),before);assert.deepEqual(copy(E.skillStats(state)),evidence);
 const bad=copy(state);bad.sessions[E.sessionId(n,2)][0].questionIds.push('r2:'+source.questionIds[2]);assert.equal(E.valid(bad),false);
 const conflict=copy(state),qid=r.questionIds[0];conflict.sessions[E.sessionId(n,2)][0].answers[qid].attempts[0]={choice:(E.resolve(qid).correct+1)%4,correct:false,at:at(13,1)};conflict.sessions[E.sessionId(n,2)][0].completedAt=null;
 const merged=E.merge(state,conflict);assert.equal(merged.sessions[E.sessionId(n,2)].length,2);assert.ok(E.valid(merged));assert.deepEqual(E.merge(state,conflict),E.merge(conflict,state));
}
console.log('PASS: 12,500 fresh-number Round 2 variants; all 6 core sets; first-miss selection, corrected misses, independent scores, reload and conflict-safe sync.');
