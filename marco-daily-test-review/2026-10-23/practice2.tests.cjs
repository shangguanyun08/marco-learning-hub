const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto'),{JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
const scripts=['data.js','practice2-data.js','select-practice.js','engine.js','sync.js','app.js'];
const c={crypto:{randomUUID}};vm.createContext(c);for(const f of ['data.js','practice2-data.js'])vm.runInContext(read(f),c);const old=c.MarcoQR4Data,D=c.MarcoQR4Practice2Data;
function numeric(s){const m=String(s).match(/^(-?\d+(?:\.\d+)?)(?:\/(\d+))?/);assert.ok(m);return +m[1]/(+m[2]||1);}
function direction(q,change,letter){assert.match(q.choices[q.correct],new RegExp(`${letter||'It'} ${change<0?'decreases':'increases'} by ${Math.abs(change)}`));}

test('20 fresh questions: four per skill in five skill blocks, balanced keys',()=>{
 assert.equal(D.ids.length,20);assert.equal(Object.keys(D.questions).length,20);assert.equal(new Set(D.ids).size,20);
 assert.deepEqual(Object.keys(D.skills).sort(),['equations','fractions','graphs','probability','time']);assert.deepEqual(plain(D.omittedSkills),['nets','variables']);
 assert.notEqual(D.appId,old.appId);assert.notEqual(D.session,old.session);
 for(const skill of Object.keys(D.skills))assert.equal(D.ids.filter(id=>D.questions[id].skill===skill).length,4);
 for(let i=0;i<20;i+=4)assert.equal(new Set(D.ids.slice(i,i+4).map(id=>D.questions[id].skill)).size,1);
 assert.deepEqual([0,1,2,3].map(k=>D.ids.filter(id=>D.questions[id].correct===k).length),[5,5,5,5]);
 for(const id of D.ids){const q=D.questions[id];assert.equal(q.id,id);assert.ok(!old.ids.includes(id));assert.ok(!Object.values(old.questions).some(x=>x.prompt===q.prompt));assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);for(const k of ['focus','tip','explanation'])assert.ok(q[k].length>20,id+' '+k);}
});

test('independently recompute all 20 keys, including graph direction, ordered events, and arrival times',()=>{
 for(const id of D.ids){const q=D.questions[id],a=q.audit;let answer;
  switch(a.kind){
   case'remainingDifference':answer=a.total*(1-a.used[0]-a.used[1])-a.total*a.used[1];break;
   case'reverseSuccessiveRefill':answer=(a.final-a.added)/a.used.reduce((v,f)=>v*(1-f),1);break;
   case'successiveFraction':answer=a.used.reduce((v,f)=>v*(1-f),1);break;
   case'combinedWhole':answer=a.remaining.reduce((n,v)=>n+v,0)/a.originalContainers;break;
   case'equationCheck':for(let i=0;i<4;i++){const expr=q.choices[i].split('=')[0].replaceAll('−','-').replace(new RegExp(a.variable,'g'),'('+a.solution+')').replace(/(\d)\(/g,'$1*(');assert.equal(Math.abs(vm.runInNewContext(expr)-a.rhs)<1e-8,i===q.correct,id+' option '+i);}continue;
   case'revenueRelationship':answer=(a.revenue-a.prices[1]*a.extra)/(a.prices[0]+a.prices[1]);assert.equal(answer,11);break;
   case'slopeSelect':{assert.deepEqual(plain(q.choiceGraphs.map(g=>g.m)),plain(a.slopes));const eligible=a.slopes.map((m,i)=>({change:m*a.dx,i})).filter(x=>Math.sign(x.change)===a.dy);eligible.sort((x,y)=>Math.abs(y.change)-Math.abs(x.change));assert.equal(q.correct,eligible[0].i);continue;}
   case'tableEndpointChange':{const start=q.table.rows.find(row=>row[0]===a.start[0])[1],end=q.table.rows.find(row=>row[0]===a.end[0])[1];direction(q,end-start);continue;}
   case'combinedChanges':{const before=q.table.rows[0].slice(1).reduce((s,v)=>s+v,0),after=q.table.rows[1].slice(1).reduce((s,v)=>s+v,0);direction(q,after-before);continue;}
   case'inverseGraphChange':assert.equal(q.graph.m,a.m);direction(q,a.dy/q.graph.m,'x');continue;
   case'twoSameWithoutReplacement':answer=a.blue/a.total*(a.blue-1)/(a.total-1);break;
   case'exactlyOne':{let count=0,total=0;for(const x of q.spinners[0])for(const y of q.spinners[1]){total++;if((x==='★')!==(y==='★'))count++;}answer=count/total;break;}
   case'independentComplement':answer=a.favorableA/a.totalA*(a.totalB-a.excludedB)/a.totalB;break;
   case'sameDifferentReplacement':{const colors=[...Array(a.red).fill('r'),...Array(a.blue).fill('b')];let same=0,different=0;for(const x of colors)for(const y of colors){if(x===y)same++;else different++;}assert.equal(same,13);assert.equal(different,12);assert.equal(q.correct,different>same?0:same>different?1:2);continue;}
   case'stagesWithStop':answer=a.journeys.reduce((s,[d,v])=>s+d/v*60,0)+a.stop;break;
   case'averageIncludingStop':answer=a.journeys.reduce((s,[d])=>s+d,0)/(a.journeys.reduce((s,[d,v])=>s+d/v,0)+a.stop/60);break;
   case'arrivalTimes':{const arrivals=a.journeys.map(([d,v],i)=>a.departures[i]+d/v*60);assert.equal(arrivals[0],660);assert.equal(arrivals[1],660);assert.equal(q.choices[q.correct],'They arrive at the same time.');continue;}
   case'requiredRemainingSpeed':answer=(a.totalDistance-a.first[0])/(a.totalHours-a.first[0]/a.first[1]);break;
   default:throw Error('Missing independent audit '+id);
  }
  assert.ok(Math.abs(numeric(q.choices[q.correct])-answer)<1e-8,id+' key');
 }
});

function browser(t,saved,oldSaved='original practice sentinel'){
 const dom=new JSDOM(read('index.html'),{url:'http://localhost/2026-10-23/?session=2&demo=1',runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};let calls=0;w.fetch=()=>{calls++;throw Error('No production requests in demo');};
 w.localStorage.setItem(old.appId+':demo',oldSaved);if(saved)w.localStorage.setItem(D.appId+':demo',JSON.stringify(saved));for(const f of scripts)w.eval(read(f));
 return{w,doc:w.document,E:w.MarcoQR4Engine,S:w.MarcoQR4Sync,state:()=>JSON.parse(w.localStorage.getItem(D.appId+':demo')||'null'),calls:()=>calls};
}
function answer(p,id,choice){const form=p.doc.querySelector(`form[data-question="${id}"]`),input=form.querySelector(`[value="${choice}"]`);assert.ok(!input.disabled);input.checked=true;input.dispatchEvent(new p.w.Event('change',{bubbles:true}));form.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}

test('Unfinished Practice 2 keeps labels hidden, five blocks of four, and its own tracker/namespace',t=>{
 const p=browser(t);assert.equal(p.S.APP_ID,D.appId);assert.equal(p.doc.querySelectorAll('article.question').length,20);assert.equal(p.doc.querySelectorAll('.jump-group').length,5);assert.equal(p.doc.querySelectorAll('.jump-divider').length,4);
 [...p.doc.querySelectorAll('.jump-group')].forEach((group,i)=>{assert.equal(group.getAttribute('aria-label'),`Questions ${i*4+1}–${i*4+4}`);assert.deepEqual([...group.querySelectorAll('a')].map(a=>+a.textContent),Array.from({length:4},(_,j)=>i*4+j+1));});
 [...p.doc.querySelectorAll('.question-group-divider')].forEach((hr,i)=>{assert.equal(hr.previousElementSibling.id,'q-'+D.ids[i*4+3]);assert.equal(hr.nextElementSibling.id,'q-'+D.ids[i*4+4]);});
 assert.equal(p.doc.querySelectorAll('.question-group-divider').length,4);assert.equal(p.doc.querySelectorAll('.question header .source,textarea,.method-box,.solution').length,0);assert.match(p.doc.querySelector('.stage-head').textContent,/20 questions grouped.*5-skill report.*20 first answers/s);
 assert.equal(p.doc.querySelector('script[data-subject="math"]').dataset.appId,D.appId);assert.equal(p.w.localStorage.getItem(old.appId+':demo'),'original practice sentinel');assert.equal(p.state(),null);assert.equal(p.calls(),0);
});

test('Practice 2 instant feedback, distinct second try, five-skill report, reload, and Practice 1 isolation',t=>{
 const p=browser(t),id=D.ids[0],q=D.questions[id];answer(p,id,(q.correct+1)%4);assert.match(p.doc.querySelector('#q-'+id+' .feedback').textContent,/Incorrect.*Try once more/);assert.equal(p.doc.querySelector('#q-'+id+' .answer-reveal'),null);assert.equal(p.doc.querySelectorAll('#q-'+id+' .choice.correct').length,0);answer(p,id,q.correct);assert.ok(p.doc.querySelector('#q-'+id+' .answer-reveal'));assert.equal(p.E.stats(p.state()).first,0);
 for(const next of D.ids.slice(1))answer(p,next,D.questions[next].correct);
 assert.match(p.doc.querySelector('#skill-results').textContent,/19\/20/);assert.equal(p.doc.querySelectorAll('.skill-table tbody tr').length,5);assert.equal(p.doc.querySelectorAll('.question header .source').length,20);assert.equal(p.doc.querySelector('a[href="?session=2&demo=1"]').classList.contains('is-complete'),true);
 assert.equal(p.E.stats(p.state(),'fractions').first,3);assert.equal(p.E.stats(p.state()).corrected,1);assert.equal(p.w.localStorage.getItem(old.appId+':demo'),'original practice sentinel');assert.ok(p.E.valid(p.state()));
 const reloaded=browser(t,p.state());assert.equal(reloaded.E.stats(reloaded.state()).first,19);assert.match(reloaded.doc.querySelector('#skill-results').textContent,/19\/20/);assert.equal(reloaded.calls(),0);
});

test('cross-practice navigation is not intercepted by the wrong engine',t=>{
 const p=browser(t);let preventedByApp=null;p.w.addEventListener('click',e=>{preventedByApp=e.defaultPrevented;e.preventDefault();},{once:true});p.doc.querySelector('a[href="?session=1&demo=1"]').click();assert.equal(preventedByApp,false);assert.equal(p.w.MarcoQR4Data.appId,D.appId);assert.equal(p.doc.querySelectorAll('article.question').length,20);assert.equal(p.state(),null);
});

test('mocked two-device cloud merge saves Practice 2 separately and keeps first answers',async t=>{
 const p=browser(t);let stored=null,version=0;const fetcher=async(url,options)=>{assert.equal(url,p.S.API+'?appId='+D.appId);if(options.method==='POST'){const body=JSON.parse(options.body);assert.equal(body.appId,D.appId);if(body.baseVersion!==(stored?version:null))return{ok:true,json:async()=>({accepted:false,progress:stored})};stored={state:body.state,version:++version};return{ok:true,json:async()=>({accepted:true,progress:stored})};}return{ok:true,json:async()=>({progress:stored})};};
 let a=p.E.empty(),b=p.E.empty();p.E.submit(a,'f21',0,'2026-10-26T17:00:00Z','one');const one=p.S.create({getState:()=>a,onRemote:s=>a=s,onStatus(){},fetcher}),two=p.S.create({getState:()=>b,onRemote:s=>b=s,onStatus(){},fetcher});await one.push();await two.push();p.E.submit(b,'f21',D.questions.f21.correct,'2026-10-26T17:00:10Z','two');await two.push();await one.push();assert.equal(p.E.stats(a).first,0);assert.equal(p.E.stats(a).corrected,1);assert.equal(p.E.attempts(a,'f21').length,2);assert.equal(p.w.localStorage.getItem(old.appId+':demo'),'original practice sentinel');
});


test('completed work renders five real skill sections without changing history, export, or first scores',t=>{
 const probe=browser(t),saved=probe.E.empty();
 for(const [i,id] of D.ids.entries()){
  const q=D.questions[id],missed=['f22','e21','t22'].includes(id);
  probe.E.submit(saved,id,missed?(q.correct+1)%4:q.correct,`2026-10-27T17:00:${String(i).padStart(2,'0')}Z`,'saved-'+id);
 }
 probe.E.submit(saved,'e21',D.questions.e21.correct,'2026-10-27T17:01:00Z','saved-retry');
 probe.E.run(saved).notes.f22={text:'Keep the original whole.',at:'2026-10-27T16:59:00Z'};
 const before=plain(saved),p=browser(t,saved),sections=[...p.doc.querySelectorAll('.skill-review-group')];
 assert.equal(sections.length,5);
 assert.equal(p.doc.querySelectorAll('.skill-jump').length,5);
 assert.deepEqual(plain(p.state()),before);
 for(const [i,skill] of Object.keys(D.skills).entries()){
  const section=sections[i],ids=D.ids.filter(id=>D.questions[id].skill===skill);
  assert.equal(section.id,'skill-'+skill);
  assert.equal(section.querySelector('h2').textContent,D.skills[skill]);
  assert.deepEqual([...section.querySelectorAll('article.question')].map(q=>q.id),plain(ids.map(id=>'q-'+id)));
  assert.match(section.querySelector('.skill-group-score').textContent,new RegExp((['graphs','probability'].includes(skill)?'4':'3')+'/4'));
  const nav=p.doc.querySelector(`.skill-jump-title[href="#skill-${skill}"]`);assert.ok(nav);
 }
 assert.deepEqual([...p.doc.querySelectorAll('.skill-group-summary a')].map(a=>a.hash),['#q-f22','#q-e21','#q-t22']);
 assert.equal(p.doc.querySelectorAll('#q-f22 .answer-reveal').length,0);
 assert.equal(p.doc.querySelectorAll('#q-e21 .answer-reveal').length,1);
 assert.equal(p.doc.querySelector('.skill-jump a[href="#q-e21"]').classList.contains('missed'),true);
 for(const link of p.doc.querySelectorAll('.skill-jump-grid a,.skill-group-summary a'))assert.ok(p.doc.querySelector(link.hash));
 let exported;p.w.Blob=class{constructor(parts){exported=JSON.parse(parts[0]);}};p.w.URL.createObjectURL=()=> 'blob:preview';p.w.URL.revokeObjectURL=()=>{};p.w.HTMLAnchorElement.prototype.click=()=>{};
 p.doc.querySelector('#download').click();assert.deepEqual(plain(exported.sessions),before.sessions);assert.equal(exported.results.fractions.first,3);
 answer(p,'t22',D.questions.t22.correct);
 assert.equal(p.E.stats(p.state()).first,17);assert.equal(p.E.stats(p.state()).corrected,2);
 assert.match(p.doc.querySelector('#skill-time .skill-group-summary').textContent,/1 corrected on retry/);
 for(const id of D.ids.filter(id=>id!=='t22'))assert.deepEqual(plain(p.E.attempts(p.state(),id)),before.sessions[D.session][0].answers[id].attempts);
 const reloaded=browser(t,p.state());assert.equal(reloaded.doc.querySelectorAll('.skill-review-group').length,5);assert.equal(reloaded.E.stats(reloaded.state()).first,17);assert.equal(reloaded.calls(),0);
});
