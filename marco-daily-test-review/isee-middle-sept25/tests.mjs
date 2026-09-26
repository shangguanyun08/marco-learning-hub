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
  for(const script of ['data.js','engine.js','sync.js','scratch.js','app.js'])w.eval(read(script));
  return {w,dom,doc:w.document,close:()=>w.close()};
}
function submit(p,source,choice){
  const form=p.doc.querySelector(`form[data-source="${source}"]`);
  if(choice!==undefined)form.querySelector(`input[value="${choice}"]`).checked=true;
  form.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));
}
test('exactly seven answered-wrong math sources and eleven verbal sources; no blanks or essay',()=>{
  assert.deepEqual(bank.map(s=>s.questions.length),[7,7,7,7,11,11,7,7,7,7,7]);
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
test('independent calculation verifies all sixty-three math keys',()=>{
  const mathBank=bank.filter(s=>s.subject==='math');
  const mix=[[10,100],[15,135],[24,176],[18,162],[21,119],[30,210],[36,132],[28,132],[45,180]];
  const div=[[27874,77],[23528,68],[31752,84],[29484,78],[26712,72],[34104,84],[28416,64],[31512,78],[36504,72]];
  const fractions=[[(3+2/3)/(5/9),(5+3/14)/(3/7)],[(2+1/2)/(5/8),(3+3/4)/(3/4)],[(4+1/2)/(3/4),(2+2/3)/(4/9)],[(5+1/4)/(7/8),(3+1/3)/(2/3)],[(3+3/5)/(3/4),(2+2/5)/(2/5)],[(4+2/3)/(7/9),(3+3/4)/(5/8)],[(5+1/4)/(3/4),(2+5/6)/(1/2)],[(4+1/5)/(7/10),(3+1/3)/(5/9)],[(2+4/5)/(7/10),(3+1/2)/(7/12)]];
  const arcB=[22,25,24,25,18,32,30,30,28],percent=[[68,145,145,68],[36,125,125,36],[42,150,150,40],[72,125,125,72],[64,125,125,64],[45,160,160,48],[52,175,175,50],[48,150,150,46],[84,125,125,84]];
  const equations=[[3,9,21,4],[5,-7,28,8],[4,6,42,8],[7,-11,38,7],[6,5,59,8],[8,-13,43,7],[9,16,70,7],[5,-9,36,9],[7,8,50,7]],polys=[[-5,6],[-7,12],[1,-20],[-9,20],[-8,15],[2,-24],[-2,-35],[-3,-28],[3,-40]];
  const cmp=(a,b)=>Math.abs(a-b)<1e-9?2:a>b?0:1;
  for(let i=0;i<mathBank.length;i++){
    const qs=mathBank[i].questions;
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
    const vocab=page('vocab-original',saved);try{submit(vocab,3,1);assert.equal(vocab.doc.querySelector('#vocab-score').textContent,'1 / 11');assert.equal(vocab.doc.querySelector('#score').textContent,'0 / 7');assert.match(vocab.doc.querySelector('#vocab-score-wrap').textContent,/Vocabulary/);const state=JSON.parse(vocab.w.localStorage.getItem(key));assert.equal(state.sessions['math-original'][0].answers[43].attempts.length,2);}finally{vocab.close();}
  }finally{p.close();}
});
test('complete days stay green and preserve scores when a new run starts',()=>{
  const p=page('math-c');try{
    p.doc.querySelector('#start-timer').click();
    for(const q of bank[3].questions)submit(p,q.source,q.correct);
    assert.equal(p.doc.querySelector('#completion').hidden,false);assert.match(p.doc.querySelector('#completion').textContent,/7\/7/);
    p.doc.querySelector('#new-run').click();assert.equal(p.doc.querySelector('#score').textContent,'0 / 7');
    assert.equal(p.doc.querySelector('a[href="?session=session-4"]').classList.contains('completed'),true);
    assert.match(p.doc.querySelector('a[href="?session=session-4"]').textContent,/7\/7/);
    assert.equal(JSON.parse(p.w.localStorage.getItem(key)).sessions['math-c'].length,2);
  }finally{p.close();}
});

for(const timedId of ['math-c','math-f','math-g','math-h'])test(timedId+' has one seven-minute deadline, auto-checks selected answers, and locks blanks at expiry',()=>{
  const clock={now:Date.parse(at)},p=page(timedId,undefined,clock);
  try{
    assert.equal(p.doc.querySelector('#question-work').hidden,true);
    p.doc.querySelector('#start-timer').click();
    const saved=p.w.localStorage.getItem(key),state=JSON.parse(saved),r=state.sessions[timedId][0];
    assert.equal(Date.parse(r.deadlineAt)-Date.parse(r.startedAt),7*60*1000);
    assert.match(p.doc.querySelector('#countdown').textContent,/7:00/);
    const merged=p.w.MarcoIseeSync.merge(state,empty());assert.equal(merged.sessions[timedId][0].deadlineAt,r.deadlineAt,'Starting the timer syncs even with no answers');
    const q=bank.find(s=>s.id===timedId).questions[0];p.doc.querySelector(`form[data-source="${q.source}"] input[value="${q.correct}"]`).checked=true;
    clock.now+=420000;submit(p,56);
    assert.equal(p.doc.querySelector('#score').textContent,'1 / 7');assert.match(p.doc.querySelector('#completion').textContent,/Unanswered when time ended: 6/);
    assert.equal(p.doc.querySelectorAll('#questions input:not(:disabled)').length,0);
    const restored=page(timedId,p.w.localStorage.getItem(key),clock);try{assert.equal(restored.doc.querySelector('#score').textContent,'1 / 7');assert.match(restored.doc.querySelector('#timer-result').textContent,/Time is up/);}finally{restored.close();}
  }finally{p.close();}
});

test('leaving and reloading does not reset a timed session',()=>{
  const clock={now:Date.parse(at)},p=page('math-c',undefined,clock);let saved;
  try{p.doc.querySelector('#start-timer').click();saved=p.w.localStorage.getItem(key);}finally{p.close();}
  clock.now+=120000;const resumed=page('math-c',saved,clock);try{assert.match(resumed.doc.querySelector('#countdown').textContent,/5:00/);}finally{resumed.close();}
  clock.now+=300001;const expired=page('math-c',saved,clock);try{assert.equal(expired.doc.querySelector('#score').textContent,'0 / 7');assert.equal(expired.doc.querySelector('#completion').hidden,false);assert.equal(expired.doc.querySelectorAll('#questions input:not(:disabled)').length,0);}finally{expired.close();}
});
test('nine session pages have math throughout; vocabulary appears only in sessions 1 and 2',()=>{
  for(let i=1;i<=9;i++){const p=page('session-'+i);try{
    assert.equal(p.doc.querySelectorAll('.question').length,i<=2?18:7);
    assert.equal(p.doc.querySelectorAll('.answer').length,0);assert.equal(p.doc.querySelectorAll('.session-link').length,9);
    assert.match(p.doc.querySelector('#sessions-progress').textContent,/of 9 sessions/);
    assert.equal(p.doc.querySelectorAll('#heading-vocab').length,i<=2?1:0);
    assert.equal(p.doc.querySelector('#vocab-score-wrap').hidden,i>2);
    assert.equal(p.doc.querySelector('#session-title').textContent,'Session '+i);
    assert.equal(p.doc.querySelectorAll('.scratch,.scratch-text,.scratch-pad').length,0);
    assert.match(p.doc.querySelector('#save-note').textContent,/Preview/);
  }finally{p.close();}}
});
test('old subject links open the corresponding combined session without losing saved attempts',()=>{
  const state=empty();for(const part of [bank[0],bank[4]]){const r=run();engine.submit(r,part.questions[0],part.questions[0].correct,at);state.sessions[part.id]=[r];}
  for(const alias of ['math-original','vocab-original']){const p=page(alias,JSON.stringify(state));try{
    assert.equal(p.doc.querySelector('#session-title').textContent,'Session 1');
    assert.equal(p.doc.querySelector('#score').textContent,'1 / 7');assert.equal(p.doc.querySelector('#vocab-score').textContent,'1 / 11');
    assert.equal(p.doc.querySelectorAll('.question').length,18);
  }finally{p.close();}}
});
test('combined sessions finish after both subjects; a new run keeps both histories',()=>{
  const p=page('session-1');try{
    for(const q of bank[0].questions)submit(p,q.source,q.correct);
    assert.equal(p.doc.querySelector('#completion').hidden,true);assert.equal(p.doc.querySelector('#new-run').hidden,true);
    assert.equal(p.doc.querySelector('a[href="?session=session-1"]').classList.contains('completed'),false);
    for(const q of bank[4].questions)submit(p,q.source,q.correct);
    assert.equal(p.doc.querySelector('#completion').hidden,false);assert.match(p.doc.querySelector('#completion').textContent,/Math first-try score: 7\/7/);assert.match(p.doc.querySelector('#completion').textContent,/Vocabulary first-try score: 11\/11/);
    p.doc.querySelector('#new-run').click();
    const state=JSON.parse(p.w.localStorage.getItem(key));assert.equal(state.sessions['math-original'].length,2);assert.equal(state.sessions['vocab-original'].length,2);
    assert.equal(p.doc.querySelector('#score').textContent,'0 / 7');assert.equal(p.doc.querySelector('#vocab-score').textContent,'0 / 11');
    assert.equal(p.doc.querySelector('a[href="?session=session-1"]').classList.contains('completed'),true);
  }finally{p.close();}
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
  const state=empty();for(const s of bank){const r=run();engine.submit(r,s.questions[0],s.questions[0].correct,at);state.sessions[s.id]=[r];}
  const notesOnly={...run(),id:'notes-before-answer',startedAt:'2026-09-25T15:03:00.000Z',work:{43:{text:'Find the whole',textAt:at,strokes:[[[10,20],[30,40]]],drawingAt:at}}};
  state.sessions['math-d'].push(notesOnly);
  let restored=empty(),first=state;
  p.w.AbortController=AbortController;
  const a=p.w.MarcoIseeSync.create({getState:()=>first,onRemote:s=>first=s,onStatus(){},fetcher});
  const b=p.w.MarcoIseeSync.create({getState:()=>restored,onRemote:s=>restored=s,onStatus(){},fetcher});
  try{
    await a.start();await b.start();for(const part of bank)assert.equal(engine.stats(part,restored.sessions[part.id][0]).first,1);
    assert.equal(restored.sessions['math-d'][1].work[43].text,'Find the whole');
    assert.equal(restored.sessions['math-d'][1].work[43].strokes.length,1);
    assert.equal(Object.keys(restored.sessions['math-d'][1].answers).length,0);
  }finally{a.stop();b.stop();p.close();}
});

test('new math sessions have distinct questions, save independently, and retain old history',()=>{
  const prompts=bank.filter(s=>s.subject==='math').flatMap(s=>s.questions.map(q=>q.prompt));
  assert.equal(new Set(prompts).size,63);
  const legacy=empty();legacy.sessions['math-original']=[run()];
  engine.submit(legacy.sessions['math-original'][0],bank[0].questions[0],bank[0].questions[0].correct,at);
  let saved=JSON.stringify(legacy);
  for(const [i,id] of ['math-d','math-e','math-f','math-g','math-h'].entries()){
    const p=page('session-'+(i+5),saved),part=bank.find(s=>s.id===id);
    try{
      assert.equal(p.doc.querySelector('#timer-panel').hidden,!part.timeLimitSeconds);
      if(part.timeLimitSeconds)p.doc.querySelector('#start-timer').click();
      assert.equal(p.doc.querySelector('#question-work').hidden,false);
      for(const question of part.questions)submit(p,question.source,question.correct);
      assert.equal(p.doc.querySelector('#score').textContent,'7 / 7');
      assert.equal(p.doc.querySelector('#completion').hidden,false);
      saved=p.w.localStorage.getItem(key);
      assert.deepEqual(JSON.parse(saved).sessions['math-original'],JSON.parse(JSON.stringify(legacy.sessions['math-original'])));
      const restored=page(id,saved);try{assert.equal(restored.doc.querySelector('#score').textContent,'7 / 7');}finally{restored.close();}
    }finally{p.close();}
  }
  for(const id of ['math-d','math-e','math-f','math-g','math-h'])assert.equal(JSON.parse(saved).sessions[id].length,1);
});

test('text and handwriting sync independently; clear stays cleared and invalid drawings are rejected',()=>{
  const p=page('session-5');try{
    const a=empty(),b=empty(),t1='2026-09-25T15:01:00.000Z',t2='2026-09-25T15:02:00.000Z';
    const steps={text:'Find the whole first',textAt:t1,strokes:[],drawingAt:at};
    a.sessions['math-d']=[{...run(),work:{43:steps}}];
    b.sessions['math-d']=[{...run(),work:{43:{text:'',textAt:at,strokes:[[[10,20],[30,40]]],drawingAt:t1}}}];
    const sync=p.w.MarcoIseeSync,merged=JSON.parse(JSON.stringify(sync.merge(a,b)));
    assert.equal(sync.valid(merged),true);
    assert.equal(merged.sessions['math-d'][0].work[43].text,'Find the whole first');
    assert.deepEqual(merged.sessions['math-d'][0].work[43].strokes,[[[10,20],[30,40]]]);
    assert.deepEqual(JSON.parse(JSON.stringify(sync.merge(b,a))),merged);
    const cleared=structuredClone(merged);cleared.sessions['math-d'][0].work[43].strokes=[];cleared.sessions['math-d'][0].work[43].drawingAt=t2;
    assert.equal(sync.merge(merged,cleared).sessions['math-d'][0].work[43].strokes.length,0);
    assert.equal(sync.merge(cleared,merged).sessions['math-d'][0].work[43].strokes.length,0);
    const invalid=structuredClone(merged);invalid.sessions['math-d'][0].work[43].strokes=[[[0,0],[Infinity,900]]];assert.equal(sync.valid(invalid),false);
    const preview=page('session-5',JSON.stringify(merged));try{
      assert.equal(preview.doc.querySelectorAll('.scratch,.scratch-text,.scratch-pad').length,0);
      assert.match(preview.doc.querySelector('#history').textContent,/Find the whole first/);
      assert.equal(JSON.parse(preview.w.localStorage.getItem(key)).sessions['math-d'][0].work[43].strokes.length,1);
    }finally{preview.close();}
  }finally{p.close();}
});
