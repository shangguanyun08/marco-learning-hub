import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8'),KEY='harry-star-sept20-four-sessions-v1';
function boot(id='oct4-original',saved){
 const html=read('./index.html'),dom=new JSDOM(html,{url:'http://localhost/?session='+id,runScripts:'outside-only'}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));
 let beforeOrder;
 for(const match of html.matchAll(/<script src="([^"]+)" defer>/g)){if(match[1].includes('oct4-order.js'))beforeOrder=JSON.parse(JSON.stringify(w.HARRY_SEPT_PRACTICE));w.eval(read(match[1].split('?')[0]));}
 return {w,d:w.document,beforeOrder,close:()=>w.close(),session:w.HARRY_SEPT_PRACTICE.find(s=>s.id===id)};
}
function submit(t,values){t.d.querySelectorAll('#q2 input[name="unit-answer"]').forEach((el,i)=>el.value=values[i]??'');t.d.querySelector('#q2 form').dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
const answers=[[12,3,36,16,2,4],[24,6,72,32,6,8],[36,12,108,48,10,12],[60,18,144,80,14,20]];
const ids=['oct4-original','oct4-a','oct4-b','oct4-c'];
test('Sessions 5 and 6 have 15 fresh skill-matched questions and independently checked answer keys',()=>{
 const rational=s=>{const m=s.match(/^(?:(\d+) )?(\d+)\/(\d+)/);return m?Number(m[1]||0)+Number(m[2])/Number(m[3]):parseFloat(s);};
 const configs=[
  {id:'oct4-d',zero:12,units:[48,21,180,64,12,16],decimal:64.715,ratio:[24,40],mixed:[4,5,6],sum:[7,9,40],scale:12,remainder:[785,60],product:3100,division:[4.68,.6],earn:[282,12],equation:'g = 5r − 6',rule:[3,-2],scores:[34,20,44,28,40,24,36]},
  {id:'oct4-e',zero:16,units:[72,24,216,96,16,24],decimal:91.638,ratio:[45,60],mixed:[7,4,5],sum:[5,7,28],scale:11,remainder:[926,80],product:4640,division:[5.76,.8],earn:[294,12],equation:'s = 7g − 4',rule:[5,1],scores:[64,54,72,48,68,52,60]}
 ];
 for(const c of configs){const t=boot(c.id),s=t.session,q=n=>s.questions.find(q=>q.source===n),key=n=>q(n).choices[q(n).correct];
  assert.equal(t.d.querySelectorAll('.session-link').length,6);assert.equal(t.d.querySelectorAll('.question').length,15);
  assert.match(t.d.querySelector('#group-description').textContent,/6 sessions of 15/);
  assert.deepEqual(Array.from(s.questions,q=>q.source),[3002,7,17,12,32,31,27,3005,3009,23,15,6,8,34,25]);
  assert.equal(t.d.querySelectorAll('#q2 input').length,6);assert.equal(t.d.querySelectorAll('#q9 input').length,7);
  assert.equal(t.d.querySelectorAll('.oct4-choice-table').length,4);assert.equal(t.d.querySelectorAll('.oct4-diagram').length,5);
  assert.equal(t.d.querySelectorAll('.answer,.correct-option,.wrong-option').length,0);
  for(const item of s.questions){assert(item.explanation.length>20);if(item.choices){assert.equal(new Set(item.choices).size,4);assert(item.correct>=0&&item.correct<4);}if(![7,3009].includes(item.source))assert(!t.w.HARRY_SEPT_PRACTICE.filter(other=>other.id!==c.id).some(other=>other.questions.some(old=>old.prompt===item.prompt)));}
  assert.equal(q(3002).correct,c.zero);assert.deepEqual(Array.from(q(7).blanks,b=>b.answer),c.units);
  assert.equal(Number(key(17)),c.decimal);
  q(12).choices.forEach((choice,i)=>{const [a,b]=choice.split(':').map(Number);assert.equal(a*c.ratio[1]===b*c.ratio[0],i===q(12).correct);});
  assert.equal(key(32),(c.mixed[0]*c.mixed[2]+c.mixed[1])+'/'+c.mixed[2]);
  q(31).choices.forEach((choice,i)=>assert.equal(Math.abs(rational(choice)-(c.sum[0]+c.sum[1])/c.sum[2])<1e-10,i===q(31).correct));
  assert.equal(key(27),'y = '+c.scale+'n');
  q(3005).choices.forEach((choice,i)=>{const [quot,rem]=choice.split(' R ').map(Number);assert.equal(quot*c.remainder[1]+rem===c.remainder[0]&&rem<c.remainder[1],i===q(3005).correct);});
  assert.equal(q(3009).correct,c.product);assert.equal(q(3009).parts[0]+q(3009).parts[1],c.product);
  assert(Math.abs(Number(key(23))-c.division[0]/c.division[1])<1e-10);assert.equal(parseFloat(key(15)),c.earn[0]/c.earn[1]);assert.equal(key(6),c.equation);
  const table=q(8).visual;table.ys.forEach((ys,i)=>assert.equal(ys.every((y,j)=>y===c.rule[0]*table.xs[j]+c.rule[1]),i===q(8).correct));
  const plot=q(34).visual,all=plot.labels.flatMap((label,i)=>Array(plot.counts[i]).fill(rational(label))).sort((a,b)=>b-a);
  q(34).choices.forEach((choice,i)=>assert.equal(rational(choice)===all[0]+all[1],i===q(34).correct));
  const sorted=c.scores.toSorted((a,b)=>a-b),five=[sorted[0],sorted[1],sorted[3],sorted[5],sorted[6]];
  q(25).visual.sets.forEach((set,i)=>assert.equal(JSON.stringify(set)===JSON.stringify(five),i===q(25).correct));t.close();
 }
});
test('New sessions complete, retain retries on reload, and merge without changing earlier records',()=>{
 const at='2026-10-09T04:00:00.000Z',old={version:1,sessions:{'oct4-c':[{id:'existing',startedAt:at,completedAt:null,answers:{3002:{attempts:[{choice:'18',correct:true,at}]}}}]}};
 const submitQuestion=(t,q,value)=>{const form=t.d.querySelector(`form[data-source="${q.source}"]`);if(q.type==='fill-blanks'||q.type==='split-sum')form.querySelectorAll('input').forEach((el,i)=>el.value=value[i]);else if(q.type==='number')form.querySelector('input').value=value;else form.querySelector(`input[value="${value}"]`).checked=true;form.dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));};
 let saved=old;
 for(const id of ['oct4-d','oct4-e']){const t=boot(id,saved);
  for(const q of t.session.questions){const value=q.type==='fill-blanks'?q.blanks.map(b=>b.answer):q.type==='split-sum'?[...q.expansion,...q.parts]:q.correct;
   if(id==='oct4-e'&&q.source===3002)submitQuestion(t,q,'15');
   submitQuestion(t,q,value);
  }
  const score=id==='oct4-d'?15:14;assert.equal(t.d.querySelector('#score').textContent,score+' / 15');assert.equal(t.d.querySelector('#completion').hidden,false);
  assert(t.d.querySelector(`a[href="?session=${id}"]`).classList.contains('completed'));
  saved=JSON.parse(t.w.localStorage.getItem(KEY));assert(t.w.HarrySeptSync.valid(saved));
  const merged=JSON.parse(JSON.stringify(t.w.HarrySeptSync.merge(saved,old)));assert.deepEqual(merged.sessions['oct4-c'],old.sessions['oct4-c']);assert(merged.sessions[id][0].completedAt);
  const reloaded=boot(id,merged);assert.equal(reloaded.d.querySelector('#score').textContent,score+' / 15');if(id==='oct4-e'){assert.match(reloaded.d.querySelector('#q1 .feedback').textContent,/second try/);assert.equal(merged.sessions[id][0].answers[3002].attempts[0].choice,'15');}reloaded.close();t.close();
 }
 assert.equal(saved.sessions['oct4-d'][0].answers[3002].attempts[0].choice,'12');assert.equal(saved.sessions['oct4-e'][0].answers[3002].attempts[1].choice,'16');
});
test('All October 4 unit names are spelled out with correct singular and plural labels',()=>{
 for(const [i,id] of ids.entries()){const t=boot(id),q=t.session.questions[1];
 assert.deepEqual(Array.from(q.blanks,b=>b.unit),['inches','feet','inches','ounces','pints','quarts']);
 assert.equal(q.blanks[0].label,i===0?'1 foot =':`${[1,2,3,5][i]} feet =`);
 assert.equal(q.blanks[3].label,i===0?'1 pound =':`${[1,2,3,5][i]} pounds =`);
 assert(!/\b(?:ft|yd|lb|oz|qt|pt|gal|hr|cm)\b/.test(t.d.querySelector('#questions').textContent));
 assert.match(t.d.querySelector('[data-source="15"] .choice-text').textContent,/hours/);t.close();}
});
test('All four published sessions have one six-blank Q2 and 15 total questions',()=>{
 ids.forEach((id,i)=>{const t=boot(id),q=t.session.questions[1];assert.equal(q.source,7);assert.equal(q.type,'fill-blanks');assert.equal(t.session.questions.length,15);assert.equal(t.d.querySelectorAll('#q2 input').length,6);assert.equal(t.d.querySelectorAll('#q2 .submit').length,1);assert.equal(t.d.querySelectorAll('#q2 .answer').length,0);assert.deepEqual(Array.from(q.blanks,b=>b.answer),answers[i]);assert.equal(t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group!=='2026-10-04').flatMap(s=>s.questions).filter(q=>q.type==='fill-blanks').length,0);submit(t,answers[i]);assert.match(t.d.querySelector('#score').textContent,/1 \/ 15/);assert.match(t.d.querySelector('#q2 .answer').textContent,/in/);t.close();});
});
test('Six blanks require complete input; two attempts retain first score, reveal, reload and sync',()=>{
 const t=boot();submit(t,[12]);assert.match(t.d.querySelector('#q2 .feedback').textContent,/No attempt/);assert.equal(t.d.querySelector('#q2 .answer'),null);
 submit(t,[12,3,36,16,2,5]);assert.match(t.d.querySelector('#q2 .feedback').textContent,/one more/);assert.equal(t.d.querySelector('#q2 .answer'),null);assert.equal(t.d.querySelector('#unit-7-0').value,'12');
 submit(t,[12,3,36,16,2,5]);assert.match(t.d.querySelector('#q2 .feedback').textContent,/No new attempt/);
 submit(t,answers[0]);assert.match(t.d.querySelector('#q2 .feedback').textContent,/second try/);assert.match(t.d.querySelector('#score').textContent,/0 \/ 15/);
 const saved=JSON.parse(t.w.localStorage.getItem(KEY));assert(t.w.HarrySeptSync.valid(saved));assert.deepEqual(JSON.parse(JSON.stringify(t.w.HarrySeptSync.merge(saved,saved))),saved);
 const r=boot('oct4-original',saved);assert.match(r.d.querySelector('#q2 .feedback').textContent,/second try/);assert.equal(r.d.querySelectorAll('#q2 input:disabled').length,6);r.close();t.close();
 const wrong=boot();submit(wrong,[1,1,1,1,1,1]);submit(wrong,[2,2,2,2,2,2]);assert.match(wrong.d.querySelector('#q2 .feedback').textContent,/Two tries/);assert.match(wrong.d.querySelector('#q2 .answer').textContent,/12 inches/);wrong.close();
});
test('Older multiple-choice unit attempts remain intact and can finish their original retry',()=>{
 const at='2026-10-04T18:30:00.000Z',saved={version:1,sessions:{'oct4-original':[{id:'legacy',startedAt:at,completedAt:null,answers:{7:{attempts:[{choice:0,correct:false,at}]}}}]}};
 const t=boot('oct4-original',saved);assert.match(t.d.querySelector('#q2 .prompt').textContent,/pints/);assert.equal(t.d.querySelectorAll('#q2 input[type=radio]').length,4);
 t.d.querySelector('#q2 input[value="1"]').checked=true;t.d.querySelector('#q2 form').dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));assert.match(t.d.querySelector('#q2 .feedback').textContent,/second try/);assert.match(t.d.querySelector('#history').textContent,/A \(4 pints\)/);assert.match(t.d.querySelector('#score').textContent,/0 \/ 15/);t.close();
});
test('Every revised session completes at 15/15 with synchronized multi-blank work',()=>{
 for(const id of ids){const t=boot(id),run={id,startedAt:'2026-10-04T19:00:00.000Z',completedAt:null,answers:{}};
 for(const q of t.session.questions){const value=q.type==='fill-blanks'?q.blanks.map(b=>b.answer):q.type==='split-sum'?[...q.expansion,...q.parts]:q.correct;assert(t.w.HarrySeptEngine.submit(run,q,value,run.startedAt));}
 assert.equal(t.w.HarrySeptEngine.stats(t.session,run).first,15);assert.equal(t.w.HarrySeptEngine.stats(t.session,run).finished,15);const state={version:1,sessions:{[id]:[run]}};assert(t.w.HarrySeptSync.valid(state));assert(t.w.HarrySeptSync.merge(state,state).sessions[id][0].completedAt);t.close();}
});
test('Remaining questions keep easy-to-hard order and unchanged content; prior groups are untouched',()=>{
 const t=boot(),expected=[3002,7,17,12,32,31,27,3005,3009,23,15,6,8,34,25];
 for(const session of t.w.HARRY_SEPT_PRACTICE){const before=t.beforeOrder.find(s=>s.id===session.id);
   if(session.group!=='2026-10-04'){assert.deepEqual(JSON.parse(JSON.stringify(session)),before);continue;}
   assert.deepEqual(Array.from(session.questions,q=>q.source),expected);
   for(const q of session.questions)assert.deepEqual(JSON.parse(JSON.stringify(q)),before.questions.find(old=>old.source===q.source));
   assert(!session.description.includes('as Questions 14–16'));
 }
 assert.equal(t.d.querySelector('#q1').dataset.source,'3002');assert.equal(t.d.querySelector('#q15').dataset.source,'25');assert.equal(t.d.querySelector('#jump a:last-child').getAttribute('href'),'#q15');t.close();
});
test('Removed perpendicular-line questions and saved attempts do not count toward active scores or completion',()=>{
 for(const id of ids){const t=boot(id),at='2026-10-04T20:00:00.000Z',run={id:'retired-source',startedAt:at,completedAt:null,answers:{29:{attempts:[{choice:0,correct:false,at}]}}};
 assert(!t.session.questions.some(q=>q.source===29));assert.equal(t.session.retiredQuestions[0].source,29);assert.equal(t.d.querySelectorAll('.question').length,15);assert.equal(t.d.querySelector('#q3').dataset.source,'17');
 for(const q of t.session.questions){const value=q.type==='fill-blanks'?q.blanks.map(b=>b.answer):q.type==='split-sum'?[...q.expansion,...q.parts]:q.correct;t.w.HarrySeptEngine.submit(run,q,value,at);}
 const state={version:1,sessions:{[id]:[run]}},merged=t.w.HarrySeptSync.merge(state,state);assert.equal(t.w.HarrySeptEngine.stats(t.session,run).total,15);assert.equal(t.w.HarrySeptEngine.stats(t.session,run).first,15);assert(merged.sessions[id][0].completedAt);assert.deepEqual(JSON.parse(JSON.stringify(merged.sessions[id][0].answers[29])),run.answers[29]);t.close();}
});
test('Reordered questions retain saved scores, retry outcomes, timestamps, and completion',()=>{
 const t=boot(),at='2026-10-04T19:00:00.000Z',run={id:'before-order',startedAt:at,completedAt:at,answers:{}};
 for(const q of t.session.questions){const answer=q.type==='fill-blanks'?q.blanks.map(b=>b.answer):q.type==='split-sum'?[...q.expansion,...q.parts]:q.correct;t.w.HarrySeptEngine.submit(run,q,answer,at);}
 run.answers[3002].attempts=[{choice:'8',correct:false,at},{choice:'7',correct:true,at}];
 const state={version:1,sessions:{'oct4-original':[run]}},r=boot('oct4-original',state);
 assert.match(r.d.querySelector('#score').textContent,/14 \/ 15/);assert.match(r.d.querySelector('#q1 .feedback').textContent,/second try/);assert.equal(r.d.querySelector('#completion').hidden,false);
 assert.deepEqual(JSON.parse(r.w.localStorage.getItem(KEY)),JSON.parse(JSON.stringify(state)));assert.match(r.d.querySelector('#history').textContent,/Try 1: 8 · incorrect/);r.close();t.close();
});
