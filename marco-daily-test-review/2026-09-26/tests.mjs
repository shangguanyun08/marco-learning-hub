import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
const {JSDOM}=createRequire(import.meta.url)('jsdom');
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const c={window:{}};vm.runInNewContext(read('data.js'),c);vm.runInNewContext(read('engine.js'),c);
const bank=JSON.parse(JSON.stringify(c.window.MARCO_ISEE_PRACTICE)),E=c.window.MarcoIseeEngine;
const key='marco-isee-middle-sept26-v1',at='2026-09-27T05:00:00.000Z';
const run=()=>({id:'check',startedAt:at,completedAt:null,answers:{}});
function calc(s){const code=s.replace(/(\d+)\/(\d+)/g,'($1/$2)').replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/');assert.match(code,/^[\d\s()+*/.\-]+$/);return Function('return ('+code+')')();}
function page(id='review',saved,clock){const dom=new JSDOM(read('index.html'),{url:'http://localhost/?session='+id,runScripts:'outside-only'}),w=dom.window;if(clock)w.Date=class extends Date{constructor(...a){super(...(a.length?a:[clock.now]));}static now(){return clock.now;}};w.HTMLElement.prototype.scrollIntoView=function(){};if(saved)w.localStorage.setItem(key,saved);for(const s of ['data.js','engine.js','sync.js','visuals.js','app.js'])w.eval(read(s));return {w,doc:w.document,close:()=>w.close()};}
function submit(p,q,choice){const form=p.doc.querySelector(`form[data-source="${q.source}"]`);if(choice!==undefined)form.querySelector(`input[value="${choice}"]`).checked=true;form.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}
test('exact extraction scope; separate test IDs; 24 questions per session',()=>{
 assert.deepEqual(bank.map(s=>s.questions.length),[24,24,24]);
 assert.deepEqual(bank[0].questions.filter(q=>q.test===1).map(q=>q.number),[41,42,44,45,46,49,51,52,54,56,57,59,60]);
 assert.deepEqual(bank[0].questions.filter(q=>q.test===2).map(q=>q.number),[41,42,43,44,48,49,51,52,54,55,61]);
 for(const s of bank){assert.equal(new Set(s.questions.map(q=>q.source)).size,24);for(const q of s.questions){assert.equal(new Set(q.choices).size,q.choices.length);assert.ok(q.choices[q.correct]);assert.ok(q.tip&&q.explanation);for(const name of q.choiceVisuals||[])assert.ok(existsSync(new URL('assets/'+name,import.meta.url)));}}
 for(const s of bank.slice(1))s.questions.forEach((q,i)=>{const old=bank[0].questions[i];assert.equal(q.source,old.source);assert.notDeepEqual([q.prompt,q.choices,q.visual],[old.prompt,old.choices,old.visual]);});
});
test('independent arithmetic, geometry, tables, chart and pattern answer checks',()=>{
 const close=(a,b)=>Math.abs(a-b)<1e-9;
 bank.forEach((s,v)=>{
  const qs=s.questions,answer=i=>qs[i].choices[qs[i].correct];
  const target=v?1/2:2/3;assert.deepEqual(qs[0].choices.flatMap((x,i)=>!close(calc(x),target)?[i]:[]),[qs[0].correct]);
  const bounds=[[1/5,7/10],[1/4,3/4],[2/5,4/5]][v];assert.deepEqual(qs[1].choices.flatMap((x,i)=>calc(x)>bounds[0]&&calc(x)<bounds[1]?[i]:[]),[qs[1].correct]);
  const n=Number(answer(2).replace('−','-')),offset=[1,2,3][v],excluded=[2,-3,4][v];assert.equal(Math.abs(n)-offset,1);assert.notEqual(n,excluded);
  assert.equal(answer(3),['x − 6 = 8','x + 5 = 12','5t − 7 = 18'][v]);
  const [xpart,co,rhs]=[[-2,5,3],[2,4,14],[8,3,14]][v];assert.equal(calc(answer(4)),(rhs-xpart)/co);
  assert.equal(parseInt(answer(5)),90-qs[5].visual.angle/2);
  const toys=qs[6].visual,needed=toys.values[toys.labels.indexOf('Teddy')]+(v?30:20);assert.equal(toys.values[toys.labels.indexOf(answer(6))],needed);
  const bars=qs[7].visual,mx=Math.max(...bars.values),mn=Math.min(...bars.values),maxYears=bars.labels.filter((x,i)=>bars.values[i]===mx),minYear=bars.labels[bars.values.indexOf(mn)];const expected=v?`Maximum: ${maxYears.join(' and ')}; minimum: ${minYear}`:`(i) ${maxYears.join(' and ')}; (ii) ${minYear}`;assert.equal(answer(7),expected);
  const sides=qs[8].visual.sides,next=sides[2]+sides[2]-sides[1],names={6:'Hexagon',8:'Octagon',10:'Decagon'};assert.equal(answer(8),names[next]);
  for(const i of [9,10])assert.equal(calc(answer(i)),calc(qs[i].prompt.replace(/\s*=\s*\?$/,'')));
  assert.equal(answer(11),['|a| = a, when a > 0','|t| = −t, when t < 0','−z'][v]);
  const {a,b}=qs[12].visual;const truths=qs[12].choices.map(s=>{const exp=s.replaceAll('|a|','Math.abs(a)').replaceAll('|b|','Math.abs(b)').replace(/\bab\b/g,'a*b').replace(' = ',' === ');return Function('a','b','return '+exp)(a,b);});assert.deepEqual(truths.flatMap((x,i)=>x?[i]:[]),[qs[12].correct]);
  const last=[...qs[13].prompt.matchAll(/\((\d+) × (\d+)\)/g)].at(-1),end=Number(last[2]);let sum=0;for(let k=1;k<end;k+=2)sum+=1/(k*(k+2));assert.ok(close(calc(answer(13)),sum));
  assert.ok(close(calc(answer(14)),[630,200,168][v]));
  assert.equal(answer(15),['1.79 − 2.3','1.68 − 3.2','2.57 − 1.4'][v]);
  const [x,y,cx,cy,eqrhs]=[[-1,2,3,2,1],[-2,3,2,1,5],[-3,2,1,4,4]][v],m=cx*x+cy*y,nn=(eqrhs+y)/x;assert.equal(+answer(16),m-nn);
  assert.equal(parseInt(answer(17)),2*qs[17].visual.db-qs[17].visual.cb);
  assert.equal(parseInt(answer(18)),qs[18].visual.angle);
  const t=qs[19].visual,ordered=t.headers.slice(1).flatMap((height,i)=>Array(t.rows[0][i+1]).fill(Number(height))).sort((a,b)=>a-b);assert.equal(+answer(19),ordered[(ordered.length-1)/2]);
  const rows=qs[20].visual.rows,total=(ids,col)=>ids.reduce((n,i)=>n+rows[i][col],0),checks=[[0,1,2,3],[2,3],[0,3],[0,1]].map((ids,i)=>i===2?total(ids,1)<total(ids,2):total(ids,1)>total(ids,2));const labels=['Over all four days, A made more than B.','Over the last two days, A made more than B.','On the first and last days together, A made fewer than B.','Over the first two days, A made more than B.'];assert.equal(answer(20),labels[checks.indexOf(true)]);assert.equal(checks.filter(Boolean).length,1);
  if(v)assert.equal(answer(21),qs[21].visual.heights.join(', '));else assert.equal(qs[21].correct,0);
  assert.equal(+answer(22),2*[4,5,6][v]);
  assert.equal(answer(23),['abc can be positive or negative','ac > 0','ac < 0'][v]);
 });
});
test('source flaws are explained and original scored keys are corrected',()=>{assert.equal(bank[0].questions[5].choices[bank[0].questions[5].correct],'55°');assert.match(bank[0].questions[5].note,/Source error/);assert.match(bank[0].questions[23].note,/not a clear mathematical mistake/);assert.match(bank[0].questions[3].prompt,/ONE variable/);});
test('review has answers and no scored inputs; exactly four navigation cards',()=>{const p=page();try{assert.equal(p.doc.querySelectorAll('#sessions a').length,4);assert.equal(p.doc.querySelectorAll('.review-card').length,24);assert.equal(p.doc.querySelectorAll('#questions .answer').length,24);assert.equal(p.doc.querySelectorAll('#questions input').length,0);assert.equal(p.doc.querySelector('#scorebar').hidden,true);assert.equal(p.w.localStorage.getItem(key),null);}finally{p.close();}});
test('first-try score, retry, two misses, separate question identities and reload',()=>{const p=page('session-1');try{const a=bank[0].questions[0],b=bank[0].questions[13];submit(p,a);assert.match(p.doc.querySelector('#feedback-'+a.source).textContent,/No attempt/);submit(p,a,1);submit(p,a,a.correct);assert.equal(p.doc.querySelector('#score').textContent,'0 / 24');submit(p,b,b.correct);assert.equal(p.doc.querySelector('#score').textContent,'1 / 24');const bad=bank[0].questions[1];submit(p,bad,0);submit(p,bad,1);assert.equal(p.doc.querySelector('#q2 .answer')!==null,true);const saved=p.w.localStorage.getItem(key),copy=page('session-1',saved);try{assert.equal(copy.doc.querySelector('#score').textContent,'1 / 24');assert.equal(copy.doc.querySelectorAll('#q1 input:disabled').length,4);}finally{copy.close();}const other=page('session-2',saved);try{assert.equal(other.doc.querySelector('#score').textContent,'0 / 24');}finally{other.close();}}finally{p.close();}});
test('completed result survives a fresh run',()=>{const p=page('session-2');try{for(const q of bank[1].questions)submit(p,q,q.correct);assert.match(p.doc.querySelector('#completion').textContent,/24\/24/);p.doc.querySelector('#new-run').click();assert.equal(p.doc.querySelector('#score').textContent,'0 / 24');assert.match(p.doc.querySelector('a[href="?session=session-2"]').textContent,/24\/24/);assert.equal(JSON.parse(p.w.localStorage.getItem(key)).sessions['math-a'].length,2);}finally{p.close();}});
test('one 24-minute deadline; pinned timer across navigation; reload keeps deadline; expiry locks blanks',async()=>{
 const clock={now:Date.parse(at)},p=page('session-3',undefined,clock);let saved,deadline;try{assert.equal(p.doc.querySelector('#question-work').hidden,true);p.doc.querySelector('#start-timer').click();saved=p.w.localStorage.getItem(key);deadline=JSON.parse(saved).sessions['math-b'][0].deadlineAt;assert.equal(Date.parse(deadline)-clock.now,1440000);assert.equal(p.doc.querySelector('#running-timer').hidden,false);p.doc.querySelector('a[href="?session=review"]').click();assert.equal(p.doc.querySelector('#running-timer').hidden,false);}finally{p.close();}
 clock.now+=60*1000;const copy=page('session-3',saved,clock);try{assert.match(copy.doc.querySelector('#running-countdown').textContent,/23:00/);const q=bank[2].questions[0];copy.doc.querySelector(`form[data-source="${q.source}"] input[value="${q.correct}"]`).checked=true;clock.now=Date.parse(deadline);await new Promise(r=>setTimeout(r,600));const r=JSON.parse(copy.w.localStorage.getItem(key)).sessions['math-b'][0];assert.equal(r.timedOutAt,deadline);assert.equal(r.answers[q.source].attempts[0].correct,true);assert.equal(copy.doc.querySelectorAll('#questions input:not(:disabled)').length,0);assert.match(copy.doc.querySelector('#completion').textContent,/1\/24/);assert.match(copy.doc.querySelector('#completion').textContent,/Unanswered: 23/);}finally{copy.close();}
});
test('new sync namespace keeps valid attempts and conflicting devices separate',()=>{const p=page();try{const S=p.w.MarcoIseeSync,a={version:1,sessions:{'math-original':[run()]}},b=structuredClone(a);E.submit(a.sessions['math-original'][0],bank[0].questions[0],0,at);E.submit(b.sessions['math-original'][0],bank[0].questions[0],1,at);assert.equal(S.valid(a),true);const merged=S.merge(a,b);assert.equal(merged.sessions['math-original'].length,2);assert.ok(merged.sessions['math-original'].every(r=>r.answers[1041].attempts.length===1));assert.match(read('sync.js'),/marco-isee-middle-sept26-v1/);assert.doesNotMatch(read('sync.js'),/marco-isee-middle-sept25-v1/);}finally{p.close();}});
test('dated library keeps old URL and its progress namespace; hub routes through dates',()=>{assert.match(read('../index.html'),/September 24, 2026/);assert.match(read('../index.html'),/September 26, 2026/);assert.match(read('../index.html'),/href="\.\/isee-middle-sept25\/"/);assert.match(read('../isee-middle-sept25/app.js'),/marco-isee-middle-sept25-v1/);assert.match(read('../../index.html'),/href="\.\/marco-daily-test-review\/"/);});
