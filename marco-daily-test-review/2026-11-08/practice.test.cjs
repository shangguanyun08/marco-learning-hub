const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {JSDOM}=require(process.env.MARCO_QA_JSDOM||'jsdom');
const load=file=>fs.readFileSync(path.join(__dirname,file),'utf8');
function page(saved,wrong=false){
 const dom=new JSDOM(load('index.html'),{url:'http://127.0.0.1:8879/marco-daily-test-review/2026-11-08/?session=1'+(wrong?'&wrong=1':''),runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=function(){w.lastScrolledId=this.id;};w.requestAnimationFrame=fn=>{fn();return 1;};Object.defineProperty(w,'crypto',{value:crypto.webcrypto});w.fetch=()=>{throw Error('Preview must not contact live storage');};
 if(saved)w.localStorage.setItem('marco-ma-nov08-test5-v1:preview',saved);
 for(const script of w.document.querySelectorAll('script[src]')){const file=script.getAttribute('src').split('?')[0];if(file.includes('shared-activity-tracker'))continue;w.eval(load(file));}
 return dom;
}
function answer(w,id,choice){const input=w.document.querySelector(`#q-${id} input[value="${choice}"]`);assert.ok(input&&!input.disabled);input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));input.closest('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));}
const context={window:{},crypto:crypto.webcrypto};vm.createContext(context);vm.runInContext(load('practice-data.js'),context);const D=context.window.MarcoMA5Practice;
test('28 unique questions, four per skill, one per seven-question group, balanced keys',()=>{
 assert.equal(new Set(D.ids).size,28);assert.equal(Object.keys(D.skills).length,7);
 for(const skill of Object.keys(D.skills)){const qs=D.ids.map(id=>D.questions[id]).filter(q=>q.skill===skill);assert.equal(qs.length,4);assert.deepEqual(Array.from(qs,q=>q.correct).sort(),[0,1,2,3]);}
 for(let g=0;g<4;g++)assert.equal(new Set(D.ids.slice(g*7,g*7+7).map(id=>D.questions[id].skill)).size,7);
 for(const id of D.ids){const q=D.questions[id];assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(q.tip&&q.explanation&&q.focus);}
});
test('independent arithmetic checks support the authored answer keys',()=>{
 const expected={sd1:'130',sd2:'−14°C',sd3:'−80 m',sd4:'7°C',f1:'2',f2:'18',f3:'F decreases by 3.',f4:'Row D',i1:'42°',i2:'LM and MN',i3:'58°',i4:'40°',t1:'$5.00',t2:'5',t3:'$1.50',t4:'$26',p1:D.questions.p1.choices[2],p2:'2/15',p3:'4/11',p4:D.questions.p4.choices[1],s1:'1',s2:D.questions.s2.choices[3],s3:D.questions.s3.choices[0],s4:D.questions.s4.choices[2],g1:'Graph A',g2:'Function B',g3:'It decreases by 6.',g4:'Graph D'};
 for(const[id,value]of Object.entries(expected))assert.equal(D.questions[id].choices[D.questions[id].correct],value,id);
 assert.equal(85-(-45),130);assert.equal(-8-6,-14);assert.equal(190-270,-80);assert.equal(-5-(-12),7);
 assert.equal(5-2*6+9,2);assert.equal(11-2+9,18);assert.equal(12-20+6,-2);assert.equal((180-64)/2,58);assert.equal(180-2*(180-110),40);
 assert.equal(14.5-4*2-(3-1)*.75,5);assert.equal(19.5-3.5-6*2+1,5);assert.equal((20.5-16)/(4-1),1.5);assert.equal(4+6*3+(4-2)*2,26);assert.ok(Math.abs(4/10*3/9-2/15)<1e-12);assert.equal(-1.5*4,-6);
 for(const[id,dx,dy]of[['g1',-1,1],['g4',-1,-1]]){const qs=D.questions[id].graphs.map((g,i)=>({...g,i})).filter(g=>Math.sign(g.m*dx)===dy).sort((a,b)=>Math.abs(b.m)-Math.abs(a.m));assert.equal(qs[0].i,D.questions[id].correct);}
});
test('shading symmetry is verified by reflection, not the plain outline',()=>{
 const matches=(d,fn)=>{for(let r=0;r<d.rows;r++)for(let c=0;c<d.cols;c++){const [rr,cc]=fn(r,c),shade=(a,b)=>d.shaded.some(p=>p[0]===a&&p[1]===b);if(shade(r,c)!==shade(rr,cc))return false;}return true;};
 const a=D.questions.s1.diagram;assert.ok(matches(a,(r,c)=>[a.rows-1-r,c]));assert.equal(matches(a,(r,c)=>[r,a.cols-1-c]),false);
 const b=D.questions.s2.diagram;assert.ok(matches(b,(r,c)=>[c,r]));assert.ok(matches(b,(r,c)=>[1-c,1-r]));assert.equal(matches(b,(r,c)=>[1-r,c]),false);assert.equal(matches(b,(r,c)=>[r,1-c]),false);
 const c=D.questions.s4.diagram;assert.ok(matches(c,(r,col)=>[r,1-col]));assert.equal(matches(c,(r,col)=>[1-r,col]),false);
 const white=D.questions.s3.diagram.white;assert.equal(Array.from({length:6},(_,axis)=>Array.from({length:6},(_,i)=>white.includes(i)===white.includes((axis-i+6)%6)).every(Boolean)).filter(Boolean).length,1);
});
test('review and practice initialize with hidden answers, four jump groups and no forced writing',()=>{
 assert.equal(new JSDOM(load('index.html')).window.document.querySelectorAll('.date-switch').length,0);
 const dom=page(),d=dom.window.document;try{assert.equal(d.querySelectorAll('#questions .question').length,7);assert.equal(d.querySelectorAll('#questions .solution[hidden]').length,7);assert.equal(d.querySelectorAll('#practice .question').length,28);assert.equal(d.querySelectorAll('.practice-jump .jump-group').length,4);assert.equal(d.querySelectorAll('.jump-divider').length,3);assert.equal(d.querySelectorAll('.question-group-divider').length,3);assert.equal(d.querySelectorAll('#practice .source').length,0);assert.equal(d.querySelectorAll('textarea').length,0);assert.equal(d.querySelector('#practice').hidden,false);assert.equal(d.querySelectorAll('#skill-results').length,0);assert.match(d.querySelector('#save-note').textContent,/Preview only/);}finally{dom.window.close();}
});
test('instant miss, second chance, first-try scoring, seven-skill report, completion and reload',()=>{
 const dom=page(),w=dom.window,d=w.document;try{
  answer(w,'sd1',0);assert.match(d.querySelector('#q-sd1 .feedback').textContent,/Incorrect · Try once more/);assert.equal(d.querySelectorAll('#q-sd1 .answer-reveal').length,0);assert.equal(d.querySelectorAll('#q-sd1 .choice.correct').length,0);assert.ok(d.querySelector('#q-sd1 input[value="0"]').disabled);
  answer(w,'sd1',2);assert.equal(d.querySelectorAll('#q-sd1 .answer-reveal').length,1);assert.match(d.querySelector('#q-sd1 .feedback').textContent,/Corrected on second try/);assert.equal(d.querySelector('.practice-jump a').className,'incorrect');
  for(const id of D.ids.slice(1))answer(w,id,D.questions[id].correct);
  assert.match(d.querySelector('#skill-results h2').textContent,/27\/28/);assert.equal(d.querySelectorAll('#skill-results tbody tr').length,7);assert.match(d.querySelector('#skill-results tbody tr td').textContent,/3\/4/);assert.ok(d.querySelector('#practice-tab').classList.contains('is-complete'));assert.equal(d.querySelectorAll('#practice .source').length,28);
  const saved=w.localStorage.getItem(D.appId+':preview'),next=page(saved);try{assert.match(next.window.document.querySelector('#skill-results h2').textContent,/27\/28/);assert.match(next.window.document.querySelector('.practice-status').textContent,/First pass finished/);}finally{next.window.close();}
 }finally{w.close();}
});
test('engine merges two devices without deleting first answers or counting retries as points',()=>{
 const dom=page(),E=dom.window.MarcoQR4Engine;try{const a=E.empty(),b=E.empty();E.submit(a,'sd1',0,'2026-11-08T21:00:00Z','first-a');E.submit(a,'sd1',2,'2026-11-08T21:01:00Z','retry-a');E.submit(b,'f1',0,'2026-11-08T21:02:00Z','first-b');const out=E.merge(a,b);assert.equal(E.stats(out).answered,2);assert.equal(E.stats(out).first,1);assert.equal(E.stats(out).corrected,1);assert.equal(E.attempts(out,'sd1')[0].choice,0);assert.equal(E.valid(out),true);assert.equal(E.submit(out,'sd1',1),false);}finally{dom.window.close();}
});

test('wrong-only groups first misses by skill, including second-try corrections, without changing records',()=>{
 const dom=page(),w=dom.window,d=w.document;
 try {
  answer(w,'sd1',0);answer(w,'sd1',D.questions.sd1.correct);
  answer(w,'p1',(D.questions.p1.correct+1)%4);
  answer(w,'s1',D.questions.s1.correct);
  const saved=w.localStorage.getItem(D.appId+':preview');
  d.querySelector('[data-practice-filter="wrong"]').click();
  assert.equal(d.querySelector('[data-practice-filter="wrong"]').getAttribute('aria-pressed'),'true');
  assert.deepEqual(Array.from(d.querySelectorAll('#practice .question'),q=>q.id),['q-sd1','q-p1']);
  assert.deepEqual(Array.from(d.querySelectorAll('.wrong-skill-group > h3'),q=>q.textContent.split(' ·')[0]),[D.skills[D.questions.sd1.skill],D.skills[D.questions.p1.skill]]);
  assert.match(d.querySelector('#q-sd1 .feedback').textContent,/Corrected on second try/);
  assert.equal(d.querySelectorAll('#practice .question-group-divider').length,0);
  assert.equal(w.localStorage.getItem(D.appId+':preview'),saved);
  assert.equal(new URL(w.location.href).searchParams.get('wrong'),'1');
  d.querySelector('[data-practice-filter="all"]').click();
  assert.equal(d.querySelectorAll('#practice .question').length,28);
  assert.equal(w.localStorage.getItem(D.appId+':preview'),saved);
  const restored=page(saved,true);
  try{assert.equal(restored.window.document.querySelectorAll('#practice .question').length,2);}finally{restored.window.close();}
 }finally{w.close();}
});

test('wrong-only has a clear empty state and lets the learner return to all questions',()=>{
 const dom=page(undefined,true),d=dom.window.document;
 try{assert.equal(d.querySelectorAll('#practice .question').length,0);assert.match(d.querySelector('.no-wrong-questions').textContent,/No first-try mistakes/);d.querySelector('[data-practice-filter="all"]').click();assert.equal(d.querySelectorAll('#practice .question').length,28);}finally{dom.window.close();}
});

test('the finished-for-now report preserves two unanswered questions and updates when they are answered later',()=>{
 const dom=page(),w=dom.window,d=w.document;
 const unanswered=new Set(['g3','f3']);
 const misses=new Set(['p1','t2','g2','s2','p2','p3','t3','p4','g4']);
 const corrected=new Set(['t2','s2','p3']);
 try{
  for(const id of D.ids.filter(id=>!unanswered.has(id))){
   const correct=D.questions[id].correct;
   answer(w,id,misses.has(id)?(correct+1)%4:correct);
   if(misses.has(id))answer(w,id,corrected.has(id)?correct:(correct+2)%4);
  }
  const E=w.MarcoQR4Engine,state=JSON.parse(w.localStorage.getItem(D.appId+':preview'));
  assert.equal(E.stats(state).answered,26);
  assert.equal(E.stats(state).first,17);
  assert.equal(E.stats(state).corrected,3);
  assert.equal(E.stats(state).complete,false);
  assert.match(d.querySelector('#skill-results h2').textContent,/17\/26/);
  assert.equal(w.lastScrolledId,'skill-results');
  assert.match(d.querySelector('.practice-status').textContent,/Finished for now/);
  assert.match(d.querySelector('#skill-results .unanswered-note').textContent,/Q18/);
  assert.match(d.querySelector('#skill-results .unanswered-note').textContent,/Q19/);
  assert.match(d.querySelector('[data-skill="formula"] td').textContent,/3\/3/);
  assert.match(d.querySelector('[data-skill="direction"] td').textContent,/1\/3/);
  assert.match(d.querySelector('.skill-priorities li strong').textContent,/Replacement/);
  for(const id of unanswered){assert.equal(E.attempts(state,id).length,0);assert.equal(d.querySelector(`#q-${id} input`).disabled,false);}
  const restored=page(JSON.stringify(state));
  try{
   const r=restored.window.document;
   r.querySelector('[data-view="analysis"]').click();
   assert.equal(r.querySelector('#analysis').hidden,false);
   assert.match(r.querySelector('#saved-skill-analysis h2').textContent,/17\/26/);
   for(const id of unanswered)answer(restored.window,id,D.questions[id].correct);
   assert.match(r.querySelector('#skill-results h2').textContent,/19\/28/);
   assert.match(r.querySelector('.practice-status').textContent,/First pass finished/);
   assert.equal(r.querySelector('#skill-results .unanswered-note'),null);
  }finally{restored.window.close();}
 }finally{w.close();}
});
