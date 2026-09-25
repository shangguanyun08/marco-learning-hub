import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
const {JSDOM}=createRequire(import.meta.url)('jsdom');
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const context={window:{}};vm.runInNewContext(read('./data.js'),context);const bank=JSON.parse(JSON.stringify(context.window.MARCO_ISEE_PRACTICE));
vm.runInNewContext(read('./engine.js'),context);const engine=context.window.MarcoIseeEngine;
const key='marco-isee-middle-sept25-v1',at='2026-09-25T15:00:00.000Z';
const run=()=>({id:'test-run',startedAt:at,completedAt:null,answers:{}});
const empty=()=>({version:1,sessions:{}});
function page(id,saved,clock){
  const dom=new JSDOM(read('./index.html'),{url:'http://localhost/?session='+id,runScripts:'outside-only'}),w=dom.window;
  if(clock)w.Date=class extends Date{constructor(...a){super(...(a.length?a:[clock.now]));}static now(){return clock.now;}};
  w.HTMLElement.prototype.scrollIntoView=function(){};
  if(saved)w.localStorage.setItem(key,saved);
  for(const script of ['data.js','engine.js','sync.js','app.js'])w.eval(read(script));
  return {w,dom,doc:w.document,close:()=>w.close()};
}
function submit(p,source,choice){
  const form=p.doc.querySelector(`form[data-source="${source}"]`);
  if(choice!==undefined)form.querySelector(`input[value="${choice}"]`).checked=true;
  form.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));
}
test('exactly seven answered-wrong math sources and eleven verbal sources; no blanks or essay',()=>{
  assert.deepEqual(bank.map(s=>s.questions.length),[7,7,7,7,11,11]);
  assert.deepEqual(bank[0].questions.map(q=>q.source),[43,56,66,69,74,76,143]);
  assert.deepEqual(bank[4].questions.map(q=>q.source),[3,4,9,12,21,23,27,29,31,32,35]);
  for(const s of bank){assert.equal(new Set(s.questions.map(q=>q.source)).size,s.questions.length);for(const q of s.questions){assert.equal(new Set(q.choices).size,q.choices.length);assert.ok(q.correct>=0&&q.correct<q.choices.length);}}
});
test('vocabulary repeat changes only order and maps each answer by text',()=>{
  bank[4].questions.forEach((q,i)=>{
    const r=bank[5].questions[i];assert.equal(q.prompt,r.prompt);assert.equal(q.source,r.source);
    assert.deepEqual([...q.choices].sort(),[...r.choices].sort());assert.notDeepEqual(q.choices,r.choices);
    assert.equal(q.choices[q.correct],r.choices[r.correct]);assert.notEqual(q.correct,r.correct);
  });
});
test('independent calculation verifies all twenty-eight math keys',()=>{
  const mix=[[10,100],[15,135],[24,176],[18,162]];
  const div=[[27874,77],[23528,68],[31752,84],[29484,78]];
  const fractions=[[(3+2/3)/(5/9),(5+3/14)/(3/7)],[(2+1/2)/(5/8),(3+3/4)/(3/4)],[(4+1/2)/(3/4),(2+2/3)/(4/9)],[(5+1/4)/(7/8),(3+1/3)/(2/3)]];
  const arcB=[22,25,24,25],percent=[[68,145,145,68],[36,125,125,36],[42,150,150,40],[72,125,125,72]];
  const equations=[[3,9,21,4],[5,-7,28,8],[4,6,42,8],[7,-11,38,7]],polys=[[-5,6],[-7,12],[1,-20],[-9,20]];
  const cmp=(a,b)=>Math.abs(a-b)<1e-9?2:a>b?0:1;
  for(let i=0;i<4;i++){
    const qs=bank[i].questions;
    let [n,d]=qs[0].choices[qs[0].correct].split('/').map(Number);assert.equal(n/d,mix[i][0]/(mix[i][0]+mix[i][1]));
    assert.equal(+qs[1].choices[qs[1].correct],div[i][0]/div[i][1]);
    assert.equal(qs[2].correct,cmp(...fractions[i]));assert.equal(qs[3].correct,cmp(qs[3].arc.radius*qs[3].arc.angle/360,arcB[i]));
    const [a,b,c,d2]=percent[i];assert.equal(qs[4].correct,cmp(a*b/100,c*d2/100));
    const [co,k,rhs,compare]=equations[i];assert.equal(qs[5].correct,cmp((rhs-k)/co,compare));
    const factors=qs[6].choices.map(choice=>[...choice.matchAll(/([+−])\s*(\d+)/g)].map(m=>(m[1]==='−'?-1:1)*Number(m[2])));
    const matches=factors.flatMap(([p,q],j)=>p+q===polys[i][0]&&p*q===polys[i][1]?[j]:[]);assert.deepEqual(matches,[qs[6].correct]);
  }
});
test('only first submission earns a point; duplicate, invalid and third attempts are rejected',()=>{
  const r=run(),q=bank[0].questions[0];assert.equal(engine.submit(r,q,-1,at),false);
  assert.equal(engine.submit(r,q,0,at),true);assert.equal(engine.submit(r,q,0,at),false);assert.equal(engine.submit(r,q,q.correct,at),true);
  assert.equal(engine.stats(bank[0],r).first,0);assert.equal(engine.stats(bank[0],r).corrected,1);assert.equal(engine.submit(r,q,1,at),false);
});
test('browser flow protects first-try scores, reveals after two misses and restores on reload',()=>{
  const p=page('math-original');try{
    submit(p,43);assert.match(p.doc.querySelector('#feedback-43').textContent,/No attempt/);
    submit(p,43,0);submit(p,43,2);assert.equal(p.doc.querySelector('#score').textContent,'0 / 7');
    submit(p,56,0);submit(p,56,2);assert.match(p.doc.querySelector('[data-source="56"] .answer').textContent,/362/);
    submit(p,143,4);assert.match(p.doc.querySelector('[data-source="143"]').textContent,/E/);
    const saved=p.w.localStorage.getItem(key),reloaded=page('math-original',saved);try{assert.equal(reloaded.doc.querySelector('#score').textContent,'0 / 7');assert.equal(reloaded.doc.querySelectorAll('[data-source="43"] input:disabled').length,4);}finally{reloaded.close();}
    const vocab=page('vocab-original',saved);try{submit(vocab,3,1);assert.equal(vocab.doc.querySelector('#score').textContent,'1 / 11');assert.match(vocab.doc.querySelector('#score-label').textContent,/Vocabulary/);const state=JSON.parse(vocab.w.localStorage.getItem(key));assert.equal(state.sessions['math-original'][0].answers[43].attempts.length,2);}finally{vocab.close();}
  }finally{p.close();}
});
test('complete days stay green and preserve scores when a new run starts',()=>{
  const p=page('math-c');try{
    p.doc.querySelector('#start-timer').click();
    for(const q of bank[3].questions)submit(p,q.source,q.correct);
    assert.equal(p.doc.querySelector('#completion').hidden,false);assert.match(p.doc.querySelector('#completion').textContent,/7\/7/);
    p.doc.querySelector('#new-run').click();assert.equal(p.doc.querySelector('#score').textContent,'0 / 7');
    assert.equal(p.doc.querySelector('a[href="?session=math-c"]').classList.contains('completed'),true);
    assert.match(p.doc.querySelector('a[href="?session=math-c"]').textContent,/7\/7/);
    assert.equal(JSON.parse(p.w.localStorage.getItem(key)).sessions['math-c'].length,2);
  }finally{p.close();}
});

test('session 4 has one seven-minute deadline, auto-checks selected answers, and locks blanks at expiry',()=>{
  const clock={now:Date.parse(at)},p=page('math-c',undefined,clock);
  try{
    assert.equal(p.doc.querySelector('#question-work').hidden,true);
    p.doc.querySelector('#start-timer').click();
    const saved=p.w.localStorage.getItem(key),state=JSON.parse(saved),r=state.sessions['math-c'][0];
    assert.equal(Date.parse(r.deadlineAt)-Date.parse(r.startedAt),7*60*1000);
    assert.match(p.doc.querySelector('#countdown').textContent,/7:00/);
    const merged=p.w.MarcoIseeSync.merge(state,empty());assert.equal(merged.sessions['math-c'][0].deadlineAt,r.deadlineAt,'Starting the timer syncs even with no answers');
    const q=bank[3].questions[0];p.doc.querySelector(`form[data-source="${q.source}"] input[value="${q.correct}"]`).checked=true;
    clock.now+=420000;submit(p,56);
    assert.equal(p.doc.querySelector('#score').textContent,'1 / 7');assert.match(p.doc.querySelector('#completion').textContent,/Unanswered when time ended: 6/);
    assert.equal(p.doc.querySelectorAll('#questions input:not(:disabled)').length,0);
    const restored=page('math-c',p.w.localStorage.getItem(key),clock);try{assert.equal(restored.doc.querySelector('#score').textContent,'1 / 7');assert.match(restored.doc.querySelector('#timer-result').textContent,/Time is up/);}finally{restored.close();}
  }finally{p.close();}
});

test('leaving and reloading does not reset a timed session',()=>{
  const clock={now:Date.parse(at)},p=page('math-c',undefined,clock);let saved;
  try{p.doc.querySelector('#start-timer').click();saved=p.w.localStorage.getItem(key);}finally{p.close();}
  clock.now+=120000;const resumed=page('math-c',saved,clock);try{assert.match(resumed.doc.querySelector('#countdown').textContent,/5:00/);}finally{resumed.close();}
  clock.now+=300001;const expired=page('math-c',saved,clock);try{assert.equal(expired.doc.querySelector('#score').textContent,'0 / 7');assert.equal(expired.doc.querySelector('#completion').hidden,false);assert.equal(expired.doc.querySelectorAll('#questions input:not(:disabled)').length,0);}finally{expired.close();}
});
test('all six session routes render proper counts and hidden answers',()=>{
  for(const s of bank){const p=page(s.id);try{assert.equal(p.doc.querySelectorAll('.question').length,s.questions.length);assert.equal(p.doc.querySelectorAll('.answer').length,0);assert.equal(p.doc.querySelectorAll('.session-link').length,6);assert.match(p.doc.querySelector('#save-note').textContent,/Preview/);}finally{p.close();}}
});
test('sync validates fifth choices and keeps differing first tries as separate histories',()=>{
  const p=page('math-original');try{
    const a=empty(),b=empty();a.sessions['math-original']=[run()];b.sessions['math-original']=[run()];
    engine.submit(a.sessions['math-original'][0],bank[0].questions[6],4,at);engine.submit(b.sessions['math-original'][0],bank[0].questions[6],0,at);
    const sync=p.w.MarcoIseeSync;assert.equal(sync.valid(a),true);assert.equal(sync.valid(b),true);
    const merged=sync.merge(a,b);assert.equal(merged.sessions['math-original'].length,2);
    assert.equal(merged.sessions['math-original'][0].answers[143].attempts.length,1);
    const invalid=structuredClone(a);invalid.sessions['math-original'][0].answers[43]={attempts:[{choice:4,correct:false,at}]};assert.equal(sync.valid(invalid),false);
  }finally{p.close();}
});
test('online sync restores both subjects without mixing session scores',async()=>{
  const p=page('math-original');let record=null;const fetcher=async(_u,opt)=>{
    if(opt.method==='POST'){const body=JSON.parse(opt.body);record={state:body.state,version:(record?.version||0)+1};return{ok:true,json:async()=>({accepted:true,progress:record})};}
    return{ok:true,json:async()=>({progress:record})};
  };
  const state=empty();for(const s of [bank[0],bank[4]]){const r=run();engine.submit(r,s.questions[0],s.questions[0].correct,at);state.sessions[s.id]=[r];}
  let restored=empty(),first=state;
  p.w.AbortController=AbortController;
  const a=p.w.MarcoIseeSync.create({getState:()=>first,onRemote:s=>first=s,onStatus(){},fetcher});
  const b=p.w.MarcoIseeSync.create({getState:()=>restored,onRemote:s=>restored=s,onStatus(){},fetcher});
  try{await a.start();await b.start();assert.equal(engine.stats(bank[0],restored.sessions['math-original'][0]).first,1);assert.equal(engine.stats(bank[4],restored.sessions['vocab-original'][0]).first,1);}finally{a.stop();b.stop();p.close();}
});
