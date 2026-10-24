const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto'),{JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),copy=x=>JSON.parse(JSON.stringify(x)),ctx={crypto:{randomUUID},AbortController};for(const f of['data.js','engine.js','sync.js'])vm.runInNewContext(read(f),ctx);const D=ctx.MarcoQR4Data,E=ctx.MarcoQR4Engine,S=ctx.MarcoQR4Sync;
const at=n=>new Date(Date.UTC(2026,9,24,4,0,n)).toISOString();
function record(s,id,choice,n=0){E.saveNote(s,id,'A short setup for '+id,at(n));return E.submit(s,id,choice,at(n+1),'event-'+id+'-'+n);}
function fraction(s){const m=s.match(/^(-?\d+(?:\.\d+)?)(?:\/(\d+))?/);assert.ok(m,'numeric choice '+s);return Number(m[1])/(Number(m[2])||1);}
function cmp(a,b){return Math.abs(a-b)<1e-9?2:a>b?0:1;}
function span(cells){return Math.max(Math.max(...cells.map(c=>c[0]))-Math.min(...cells.map(c=>c[0]))+1,Math.max(...cells.map(c=>c[1]))-Math.min(...cells.map(c=>c[1]))+1);}
test('exactly 28 fresh mixed entries, four per skill, all keys independently checked',()=>{
 assert.equal(D.ids.length,28);assert.equal(new Set(D.ids).size,28);assert.equal(Object.keys(D.questions).length,28);
 for(const skill of Object.keys(D.skills))assert.equal(D.ids.filter(id=>D.questions[id].skill===skill).length,4);
 for(let i=1;i<D.ids.length;i++)assert.notEqual(D.questions[D.ids[i]].skill,D.questions[D.ids[i-1]].skill);
 for(const id of D.ids){const q=D.questions[id],a=q.audit;assert.equal(new Set(q.choices).size,4);let actual;
  switch(a.kind){
   case'sameWhole':actual=a.total*(1-a.used.reduce((n,x)=>n+x,0));break;
   case'successive':actual=a.used.reduce((n,x)=>n*(1-x),a.total);break;
   case'reverseRemaining':actual=a.left/(1-a.used.reduce((n,x)=>n+x,0));break;
   case'ticketEquation':case'coinEquation':case'vehicleEquation':{assert.ok(Math.abs(a.prices[0]*a.solution+a.prices[1]*(a.total-a.solution)-a.revenue)<1e-9);const variable=id==='e1'?'a':id==='e2'?'d':'b';for(let i=0;i<4;i++){const expr=q.choices[i].split('=')[0].replaceAll('−','-').replace(new RegExp(variable,'g'),'('+a.solution+')').replace(/(\d)\(/g,'$1*(');const n=vm.runInNewContext(expr);assert.equal(Math.abs(n-a.revenue)<1e-8,i===q.correct,q.id+' equation choice '+i);}continue;}
   case'relationshipEquation':{assert.equal(a.solution+(a.multiple*a.solution+a.extra),a.total);for(let i=0;i<4;i++){const expr=q.choices[i].split('=')[0].replaceAll('−','-').replaceAll('n','('+a.solution+')').replace(/(\d)\(/g,'$1*(');assert.equal(vm.runInNewContext(expr)===a.total,i===q.correct);}continue;}
   case'netSpan':actual=span(a.cells)*a.side;break;
   case'netPerimeter':{const set=new Set(a.cells.map(c=>c.join(',')));let edges=0;for(const[x,y]of a.cells)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(!set.has([x+dx,y+dy].join(',')))edges++;actual=edges*a.side;break;}
   case'netFaceArea':actual=(a.span/span(a.cells))**2;break;
   case'netEdge':actual=(a.top-a.bottom)/span(a.cells);break;
   case'slopeSelect':{const candidates=a.slopes.map((m,i)=>({m,i})).filter(x=>Math.sign(x.m*a.dx)===a.dy).sort((x,y)=>(a.fast?-1:1)*(Math.abs(x.m)-Math.abs(y.m)));assert.equal(q.correct,candidates[0].i);continue;}
   case'graphChange':actual=a.m*(a.end-a.start);assert.equal(actual,8);assert.equal(q.choices[q.correct],'It increases by 8.');continue;
   case'tableChanges':actual=(a.m[0]-a.m[1])*a.dx;assert.equal(q.choices[q.correct],'P decreases '+actual+' units more than Q.');continue;
   case'spinnerCompare':assert.equal(q.correct,cmp(a.left[0]/a.left[1]*a.left[2]/a.left[3],a.right[0]/a.right[1]*a.right[2]/a.right[3]));continue;
   case'diceSums':{const counts=a.sums.map(sum=>{let n=0;for(let x=1;x<=a.sides;x++)for(let y=1;y<=a.sides;y++)n+=x+y===sum;return n;});assert.equal(q.correct,cmp(...counts));continue;}
   case'withoutReplacement':actual=a.red/(a.red+a.blue)*a.blue/(a.red+a.blue-1);break;
   case'notGreen':actual=(a.a[1]-a.a[0])/a.a[1]*a.b[0]/a.b[1];break;
   case'timeCompare':assert.equal(q.correct,cmp(...a.journeys.map(([d,v])=>d/v)));continue;
   case'timeDifference':actual=(a.journeys[0][0]/a.journeys[0][1]-a.journeys[1][0]/a.journeys[1][1])*60;break;
   case'wholeTripSpeed':actual=a.journeys.reduce((n,[d])=>n+d,0)/a.journeys.reduce((n,[d,v])=>n+d/v,0);break;
   case'totalTime':actual=a.journeys.reduce((n,[d,v])=>n+d/v,0)*60;break;
   case'variableSquares':assert.notEqual(cmp((1+a.offset)**2,4),cmp((4+a.offset)**2,64));assert.equal(q.correct,3);continue;
   case'variableCircles':for(const x of[5.01,6,10,100])assert.equal(cmp((x+a.offset)**2,(2*x)**2),1);assert.equal(q.correct,1);continue;
   case'fractionPower':for(const x of[.01,.2,.5,.99])assert.equal(cmp(x,x*x),0);assert.equal(q.correct,0);continue;
   case'segmentUnknown':assert.notEqual(cmp(5,a.total-5),cmp(13,a.total-13));assert.equal(q.correct,3);continue;
   default:throw Error('Unaudited '+id);
  }
  assert.ok(Math.abs(actual-fraction(q.choices[q.correct]))<1e-8,id+' numeric key');
 }
});
test('seven original choices, keys, times and source diagrams match verified extraction',()=>{assert.deepEqual(copy(D.originals.map(q=>[q.number,q.chosen,q.correct,q.seconds])),[[15,0,1,83],[18,1,0,59],[19,0,2,25],[20,2,1,41],[32,2,1,41],[36,1,0,87],[37,1,3,118]]);for(const q of D.originals){if(q.image)assert.ok(fs.existsSync(path.join(__dirname,q.image)));for(const img of q.choiceImages||[])assert.ok(fs.existsSync(path.join(__dirname,img)));}});
test('answers need no setup; immediate second chance never changes first-try scores',()=>{
 const s=E.empty(),id=D.ids[0],q=D.questions[id];
 assert.equal(E.submit(s,id,(q.correct+1)%4,at(1),'first'),true);
 assert.equal(E.note(s,id),'');assert.equal(E.firstPass(s),false);assert.equal(E.reveal(s,id),false);
 assert.equal(E.submit(s,id,(q.correct+1)%4,at(2),'repeat-choice'),false);
 assert.equal(E.submit(s,id,q.correct,at(3),'retry'),true);
 assert.equal(E.reveal(s,id),true);assert.equal(E.firstPass(s),false);
 assert.equal(E.stats(s).first,0);assert.equal(E.stats(s).corrected,1);
 assert.equal(E.submit(s,id,(q.correct+2)%4),false);
 for(const other of D.ids.slice(1))assert.equal(record(s,other,D.questions[other].correct),true);
 assert.equal(E.firstPass(s),true);assert.equal(E.stats(s).first,27);assert.equal(E.stats(s,'fractions').first,3);
 assert.equal(E.valid(s),true);assert.equal(E.saveNote(s,id,'Rewrite'),false);
});
test('a second miss unlocks the solution immediately, with no third try',()=>{
 const s=E.empty(),id='t1',q=D.questions[id];
 assert.equal(E.reveal(s,id),false);
 assert.equal(E.submit(s,id,(q.correct+1)%4,at(1),'miss-1'),true);assert.equal(E.reveal(s,id),false);
 assert.equal(E.submit(s,id,(q.correct+2)%4,at(2),'miss-2'),true);assert.equal(E.reveal(s,id),true);
 assert.equal(E.submit(s,id,q.correct,at(3),'third'),false);assert.equal(E.stats(s).first,0);assert.equal(E.stats(s).corrected,0);
});
test('a first correct answer makes its solution available without waiting for all 28',()=>{
 const s=E.empty();assert.equal(E.submit(s,'t1',D.questions.t1.correct),true);
 assert.equal(E.reveal(s,'t1'),true);assert.equal(E.firstPass(s),false);assert.equal(E.stats(s).first,1);
 assert.equal(E.submit(s,'t1',1),false);
});
test('device merge preserves first answers and setup notes deterministically',()=>{const a=E.empty(),b=E.empty();record(a,'f1',1,1);record(b,'t1',0,2);E.saveNote(a,'g1','Follow x to the left.',at(10));E.saveNote(b,'g1','Follow the right-to-left arrow.',at(11));const m=E.merge(a,b);assert.deepEqual(copy(m),copy(E.merge(b,a)));assert.equal(E.stats(m).answered,2);assert.equal(E.note(m,'g1'),'Follow the right-to-left arrow.');assert.deepEqual(copy(E.merge(m,m)),copy(m));assert.equal(E.valid(m),true);});
function browser(t,query='?demo=1',saved){const html=read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),dom=new JSDOM(html,{url:'http://localhost/2026-10-23/'+query,runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};let calls=0;w.fetch=()=>{calls++;throw Error('Production network forbidden in preview');};if(saved)w.localStorage.setItem(D.appId+':demo',JSON.stringify(saved));for(const f of['data.js','engine.js','sync.js','app.js'])w.eval(read(f));return{w,d:w.document,calls:()=>calls};}
function uiAnswer(p,id,choice){const f=p.d.querySelector(`form[data-question="${id}"]`),input=f.querySelector(`input[value="${choice}"]`);assert.equal(input.disabled,false);input.checked=true;input.dispatchEvent(new p.w.Event('change',{bubbles:true}));f.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}
test('review hides both historical choice and correct-answer method independently',t=>{const p=browser(t);assert.equal(p.d.querySelectorAll('article.question').length,7);assert.equal(p.d.querySelectorAll('.solution').length,0);assert.ok(!p.d.body.textContent.includes('Marco chose'));p.d.querySelector('[data-review="15"][data-kind="his"]').click();assert.ok(p.d.getElementById('his-15').textContent.includes('Marco chose A'));assert.equal(p.d.querySelectorAll('.solution').length,0);p.d.querySelector('[data-review="15"][data-kind="answer"]').click();assert.equal(p.d.querySelectorAll('.solution').length,1);p.d.querySelector('[data-review="15"][data-kind="his"]').click();assert.equal(p.d.getElementById('his-15').hidden,true);assert.equal(p.calls(),0);});
test('mixed page gives instant feedback and retries without notes; seven skill scores follow all 28',t=>{
 const p=browser(t,'?session=1&demo=1');
 assert.equal(p.d.querySelectorAll('article.question').length,28);assert.equal(p.d.querySelectorAll('.question header .source').length,0);
 assert.equal(p.d.querySelectorAll('textarea,.method-box,.solution').length,0);
 uiAnswer(p,'f1',2);
 assert.match(p.d.querySelector('#q-f1 .feedback').textContent,/Incorrect.*Try once more/);
 assert.equal(p.d.querySelectorAll('#q-f1 .choice.wrong').length,1);
 assert.equal(p.d.querySelectorAll('#q-f1 .choice.correct,.solution').length,0);
 assert.equal(p.d.querySelector('#q-f1 .answer-reveal'),null);
 assert.equal(p.d.querySelector('#q-f1 button[type=submit]').textContent,'Check second try');
 assert.equal(p.d.querySelector('#q-f1 input[value="2"]').disabled,true);
 assert.equal(p.d.getElementById('skill-results'),null);
 uiAnswer(p,'f1',1);
 assert.match(p.d.querySelector('#q-f1 .feedback').textContent,/Corrected on second try/);
 assert.ok(p.d.querySelector('#q-f1 .answer-reveal'));assert.equal(p.d.querySelector('#q-f1 .answer-reveal').open,false);
 assert.match(p.d.querySelector('.scorebar').textContent,/0\/1 correct first try/);
 assert.equal(p.d.querySelectorAll('#q-f1 button[type=submit]').length,0);
 for(let i=1;i<D.ids.length;i++){
  const id=D.ids[i];uiAnswer(p,id,D.questions[id].correct);
  assert.match(p.d.querySelector('#q-'+id+' .feedback').textContent,/Correct first try/);
  assert.ok(p.d.querySelector('#q-'+id+' .choice.correct'));
  if(i<27){assert.equal(p.d.getElementById('skill-results'),null);assert.equal(p.d.querySelectorAll('.question header .source').length,0);}
 }
 assert.match(p.d.getElementById('skill-results').textContent,/27\/28/);
 assert.equal(p.d.querySelectorAll('.skill-table tbody tr').length,7);
 assert.equal(p.d.querySelectorAll('.question header .source').length,28);
 assert.ok(p.d.querySelector('.session-card.is-complete'));
 assert.equal(p.calls(),0);
});
test('UI second miss reveals solution control before completion; empty choice uses no attempt',t=>{
 const p=browser(t,'?session=1&demo=1'),f=p.d.querySelector('form[data-question="f1"]');
 f.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));
 assert.match(f.querySelector('.feedback').textContent,/No attempt used/);
 assert.equal(p.w.localStorage.getItem(D.appId+':demo'),null);
 uiAnswer(p,'f1',0);uiAnswer(p,'f1',2);
 assert.match(p.d.querySelector('#q-f1 .feedback').textContent,/Incorrect on second try/);
 assert.ok(p.d.querySelector('#q-f1 .answer-reveal'));assert.equal(p.d.querySelector('#q-f1 .answer-reveal').open,false);
 assert.equal(p.d.querySelectorAll('#q-f1 button[type=submit]').length,0);
 assert.equal(p.d.querySelectorAll('#q-f1 input:not(:disabled)').length,0);
 assert.equal(p.d.getElementById('skill-results'),null);
});
test('previously saved answers and notes survive removal of the setup field and unlock immediate retry',t=>{
 const legacy=E.empty();record(legacy,'f1',3,1);record(legacy,'t1',0,2);record(legacy,'g1',1,3);record(legacy,'e1',2,4);
 assert.equal(E.valid(legacy),true);const original=copy(E.run(legacy)),p=browser(t,'?session=1&demo=1',legacy);
 assert.equal(p.d.querySelectorAll('textarea,.method-box').length,0);
 assert.match(p.d.querySelector('.scorebar').textContent,/4\/28 first answers/);
 assert.equal(p.d.querySelector('#q-f1 button[type=submit]').textContent,'Check second try');
 uiAnswer(p,'f1',1);const saved=JSON.parse(p.w.localStorage.getItem(D.appId+':demo')),r=E.run(saved);
 assert.deepEqual(copy(r.notes),original.notes);
 for(const id of Object.keys(original.answers))assert.deepEqual(copy(r.answers[id].attempts[0]),original.answers[id].attempts[0]);
 assert.equal(E.stats(saved).first,3);assert.equal(E.stats(saved).answered,4);assert.equal(E.stats(saved).corrected,1);
 const reload=browser(t,'?session=1&demo=1',saved);assert.ok(reload.d.querySelector('#q-f1 .answer-reveal'));
 assert.match(reload.d.querySelector('.scorebar').textContent,/3\/4 correct first try/);assert.equal(reload.calls(),0);
});
test('mocked two-device sync persists notes and first-try scores, never calls production',async()=>{let recordOnServer=null,version=0;const calls=[];const fetcher=async(url,options)=>{assert.equal(url,S.API+'?appId='+D.appId);calls.push(options.method);if(options.method==='POST'){const body=JSON.parse(options.body);if(body.baseVersion!==(recordOnServer?version:null))return{ok:true,json:async()=>({accepted:false,progress:recordOnServer})};recordOnServer={state:body.state,version:++version};return{ok:true,json:async()=>({accepted:true,progress:recordOnServer})};}return{ok:true,json:async()=>({progress:recordOnServer})};};ctx.fetch=fetcher;ctx.localStorage={getItem:()=>null,setItem(){}};ctx.setTimeout=setTimeout;ctx.clearTimeout=clearTimeout;let a=E.empty(),b=E.empty();record(a,'f1',1);const one=S.create({getState:()=>a,onRemote:x=>a=x,onStatus(){},fetcher}),two=S.create({getState:()=>b,onRemote:x=>b=x,onStatus(){},fetcher});await one.push();await two.push();assert.equal(E.stats(b).first,1);record(b,'t1',0,5);await two.push();await one.push();assert.equal(E.stats(a).first,2);assert.ok(E.note(a,'t1'));assert.ok(calls.includes('POST'));});
