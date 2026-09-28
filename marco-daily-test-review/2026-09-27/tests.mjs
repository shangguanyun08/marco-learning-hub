import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
const {JSDOM}=createRequire(import.meta.url)('jsdom');
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const c={window:{}};vm.runInNewContext(read('data.js'),c);vm.runInNewContext(read('engine.js'),c);
const bank=JSON.parse(JSON.stringify(c.window.MARCO_ISEE_PRACTICE)),E=c.window.MarcoIseeEngine;
const key='marco-isee-middle-sept27-v1',at='2026-09-27T15:00:00.000Z';
const run=()=>({id:'check',startedAt:at,completedAt:null,answers:{}});
function page(id='',saved,clock){const dom=new JSDOM(read('index.html'),{url:'http://localhost/'+(id?'?session='+id:''),runScripts:'outside-only'}),w=dom.window;if(clock)w.Date=class extends Date{constructor(...a){super(...(a.length?a:[clock.now]));}static now(){return clock.now;}};w.HTMLElement.prototype.scrollIntoView=function(){};if(saved)w.localStorage.setItem(key,saved);for(const s of ['data.js','engine.js','sync.js','visuals.js','app.js'])w.eval(read(s));return {w,doc:w.document,close:()=>w.close()};}
function submit(p,q,choice){const form=p.doc.querySelector(`form[data-source="${q.source}"]`);if(choice!==undefined)form.querySelector(`input[value="${choice}"]`).checked=true;form.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}

test('independent calculations verify original and both generated math sets',()=>{
 const compare=(a,b)=>a>b?0:a<b?1:2,avg=a=>a.reduce((x,y)=>x+y,0)/a.length,median=a=>[...a].sort((a,b)=>a-b)[(a.length-1)/2];
 bank.slice(0,3).forEach((s,v)=>{const get=n=>s.questions.find(q=>q.source===n),answer=n=>get(n).choices[get(n).correct];
  assert.equal(get(2014).correct,v?1:3);
  if(v){const d=get(2014).diagram.dims,w=d[1],choices=get(2014).choiceBlocks;assert.deepEqual(choices.flatMap((b,i)=>b[0]+d[0]===w&&b[1]===w&&b[2]===w?[i]:[]),[get(2014).correct]);}
  assert.equal(answer(2017),['5/3 = x/160','7/4 = x/120','5/2 = x/90'][v]);
  const values=v?get(2023).diagram.values:[3,4,2,5,5,9,7];assert.equal(get(2023).correct,compare(avg(values),median(values)));
  if(v===1)assert.equal(get(2029).correct,compare(80*1.25,100*.9));else if(v===2)assert.equal(get(2029).correct,1);else{assert.equal(get(2029).correct,3);assert.notEqual(compare(50*1.2,100*.8),compare(90*1.2,100*.8));}
  const a=[...Array(8)].map((_,i)=>i+1).filter(x=>x%2===0&&[4,8,6][v]%x===0).length;
  const b=[...Array(8)].map((_,i)=>i+1).filter(x=>x%2===1&&(v===2?x<7:6%x===0)).length;assert.equal(get(2033).correct,compare(a,b));
  const prices=[[[1500,6375],[3000,12750]],[[200,900],[500,2000]],[[120,510],[300,1275]]][v];assert.equal(get(2034).correct,compare(prices[0][1]/prices[0][0],prices[1][1]/prices[1][0]));
  assert.equal(get(2037).correct,v===2?compare(Math.sqrt(100-36),7):3);
  const d=v?get(3027).diagram:{top:16,left:10,step:4,bottom:6,lower:14,bar:4};const area=d.step*d.left+d.bottom*(d.lower+d.bar)+(d.top-d.step-d.bottom)*d.bar;assert.equal(parseInt(answer(3027)),area);
  const reps=v?get(3031).diagram.values:[2,4,4,9,10,5,53,1,2];assert.equal(+answer(3031),avg(reps)-median(reps));
  assert.equal(get(3041).correct,[3,0,2][v]);assert.equal(answer(3044),['8a = 9b','5a = 7b','11p = 6q'][v]);
  const rate=[3/4,3/5,5/8][v];assert.ok(Math.abs(+answer(3047)-(1-rate)/rate)<.005);
 });
});

test('12-minute total deadline persists across navigation and reload, expiry captures pending answer and locks blanks',async()=>{
 const clock={now:Date.parse(at)},p=page('session-3',undefined,clock);let saved,deadline;try{assert.equal(p.doc.querySelector('#question-work').hidden,true);p.doc.querySelector('#start-timer').click();saved=p.w.localStorage.getItem(key);deadline=JSON.parse(saved).sessions['math-b'][0].deadlineAt;assert.equal(Date.parse(deadline)-clock.now,720000);p.doc.querySelector('#sessions a').click();assert.equal(p.doc.querySelector('#running-timer').hidden,false);}finally{p.close();}
 clock.now+=60000;const copy=page('session-3',saved,clock);try{assert.match(copy.doc.querySelector('#running-countdown').textContent,/11:00/);const q=bank[2].questions[0];copy.doc.querySelector(`form[data-source="${q.source}"] input[value="${q.correct}"]`).checked=true;clock.now=Date.parse(deadline);await new Promise(r=>setTimeout(r,600));const r=JSON.parse(copy.w.localStorage.getItem(key)).sessions['math-b'][0];assert.equal(r.timedOutAt,deadline);assert.equal(r.answers[q.source].attempts[0].correct,true);assert.equal(copy.doc.querySelectorAll('#questions input:not(:disabled)').length,0);assert.match(copy.doc.querySelector('#completion').textContent,/Math: 1\/12/);assert.match(copy.doc.querySelector('#completion').textContent,/Unanswered: 11/);}finally{copy.close();}
});


test('separate three math and two identical verbal sessions',()=>{
 assert.deepEqual(bank.map(s=>s.questions.length),[12,12,12,8,8]);
 assert.ok(bank.slice(0,3).every(s=>s.questions.every(q=>q.subject==='math')));
 assert.deepEqual(bank[3].questions,bank[4].questions);
 assert.deepEqual(bank[3].questions.map(q=>q.number),[10,12,15,17,18,37,38,40]);
 for(const s of bank)for(const q of s.questions){assert.ok(q.choices[q.correct]);for(const name of [q.image,q.solutionImage,...q.choiceVisuals||[]].filter(Boolean))assert.ok(existsSync(new URL('assets/'+name,import.meta.url)));}
 const p=page();try{assert.equal(p.doc.querySelectorAll('#sessions a').length,5);assert.equal(p.doc.querySelectorAll('#questions .question').length,12);assert.equal(p.doc.querySelector('#verbal-score-wrap').hidden,true);}finally{p.close();}
});
test('VR scores are independent of math and the identical second VR session',()=>{
 const p=page('vr-1');try{const q=bank[3].questions[0];assert.equal(p.doc.querySelector('#math-score-wrap').hidden,true);assert.equal(p.doc.querySelectorAll('#questions input').length,32);submit(p,q,q.correct);assert.equal(p.doc.querySelector('#verbal-score').textContent,'1 / 8');
 const saved=p.w.localStorage.getItem(key),again=page('vr-1',saved),second=page('vr-2',saved),math=page('session-1',saved);try{assert.equal(again.doc.querySelector('#verbal-score').textContent,'1 / 8');assert.equal(second.doc.querySelector('#verbal-score').textContent,'0 / 8');assert.equal(math.doc.querySelector('#score').textContent,'0 / 12');assert.equal(second.doc.querySelectorAll('#questions .answer').length,0);}finally{again.close();second.close();math.close();}
 }finally{p.close();}
});
test('legacy mixed attempts migrate without loss, duplicate retries, or scores crossing subjects',()=>{
 const oldRun=run(),vq=bank[3].questions[0],mq=bank[0].questions[0];E.submit(oldRun,vq,0,at);E.submit(oldRun,vq,vq.correct,at);E.submit(oldRun,mq,mq.correct,at);
 const legacy={version:1,sessions:{'math-original':[oldRun]}},p=page('vr-1',JSON.stringify(legacy));try{const S=p.w.MarcoIseeSync;assert.equal(S.valid(legacy),true);const migrated=S.merge(legacy,{version:1,sessions:{}});assert.equal(S.valid(migrated),true);assert.equal(migrated.sessions['vocab-original'][0].answers[vq.source].attempts.length,2);assert.equal(migrated.sessions['math-original'][0].answers[vq.source],undefined);assert.equal(migrated.sessions['math-original'][0].answers[mq.source].attempts.length,1);assert.equal(migrated.sessions['vocab-repeat'],undefined);assert.deepEqual(JSON.parse(JSON.stringify(S.merge(migrated,legacy))),JSON.parse(JSON.stringify(migrated)));assert.equal(p.doc.querySelector('#verbal-score').textContent,'0 / 8');assert.ok(p.doc.querySelector('#q1 .answer'));}finally{p.close();}
});
test('completed legacy mixed run splits into separately completed math and VR history',()=>{
 const r=run();for(const q of [...bank[0].questions,...bank[3].questions])E.submit(r,q,q.correct,at);r.completedAt=at;
 const p=page('vr-1',JSON.stringify({version:1,sessions:{'math-original':[r]}}));try{assert.match(p.doc.querySelector('#completion').textContent,/Verbal: 8\/8/);assert.match(p.doc.querySelector('a[href="?session=session-1"]').textContent,/Math: 12\/12/);p.doc.querySelector('#new-run').click();assert.equal(p.doc.querySelector('#verbal-score').textContent,'0 / 8');const saved=JSON.parse(p.w.localStorage.getItem(key));assert.equal(saved.sessions['vocab-original'].length,2);assert.equal(saved.sessions['math-original'][0].completedAt,at);}finally{p.close();}
});
test('same-session conflicting device first tries remain separate',()=>{const p=page('vr-2');try{const S=p.w.MarcoIseeSync,a={version:1,sessions:{'vocab-repeat':[run()]}},b=structuredClone(a),q=bank[4].questions[0];E.submit(a.sessions['vocab-repeat'][0],q,0,at);E.submit(b.sessions['vocab-repeat'][0],q,1,at);const merged=S.merge(a,b);assert.equal(merged.sessions['vocab-repeat'].length,2);assert.ok(merged.sessions['vocab-repeat'].every(r=>r.answers[q.source].attempts.length===1));}finally{p.close();}});
