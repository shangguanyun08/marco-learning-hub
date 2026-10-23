const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto'),{JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),copy=x=>JSON.parse(JSON.stringify(x)),KEY='marco-math-skill-builder-oct12-review4-v1',MAIN='marco-math-skill-builder-oct12-v1',R3KEY='marco-math-skill-builder-oct12-review3-v1',at='2026-10-22T03:00:00.000Z';
const files=['review4-data.js','review4-engine.js'],ctx={crypto:{randomUUID}};for(const f of files)vm.runInNewContext(read(f),ctx);const D=ctx.MarcoReview4Data,E=ctx.MarcoReview4Engine;
const scripts=html=>[...html.matchAll(/<script defer src="([^"?]+)[^"]*"/g)].map(m=>m[1]);
const courseFiles=scripts(read('index.html')).filter(f=>!['app.js','sync.js'].includes(f)),course={crypto:{randomUUID}};for(const f of courseFiles)vm.runInNewContext(read(f),course);const CE=course.MarcoSkillEngine;
function filled(engine,data,wrong=false){const s=engine.empty();for(const id of data.ids)engine.submit(s,id,(data.questions[id].correct+(wrong?1:0))%4,at,randomUUID());return s;}
function ready(){const s=CE.empty();for(let n=1;n<=7;n++){const r=CE.start(n,s,at);s.sessions[CE.sessionId(n)]=[r];for(const id of r.questionIds)CE.submit(r,id,CE.resolve(id).correct,at);}return s;}
function browser(t,{main=false,state,query='',online=false,remoteReview}={}){
 const html=read(main?'index.html':'review4.html'),dom=new JSDOM(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:(online?'https://example.test/':'http://localhost/')+(main?'':'review4.html')+query,runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 const calls=[];w.fetch=async(url,opt)=>{calls.push({url,opt});assert.equal(opt.method,'GET');assert.equal(opt.body,undefined);return{ok:true,json:async()=>({progress:{state:url.includes('review5-v1')?JSON.parse(w.localStorage.getItem('marco-math-skill-builder-oct12-review5-v1')):url.includes('review4-v1')?remoteReview:JSON.parse(w.localStorage.getItem(R3KEY)),version:1}})};};
 w.localStorage.setItem(MAIN,main?JSON.stringify(state):'course-sentinel');w.localStorage.setItem(R3KEY,main?JSON.stringify(filled(course.MarcoReview3Engine,course.MarcoReview3Data)):'review3-sentinel');
 if(!main&&state)w.localStorage.setItem(KEY+(query.includes('demo')?':demo':''),JSON.stringify(state));
 for(const f of scripts(html).filter(f=>!['app.js','sync.js','review4.js'].includes(f)))w.eval(read(f));
 if(main){w.localStorage.setItem('marco-math-skill-builder-oct12-review5-v1',JSON.stringify(filled(course.MarcoReview5Engine,course.MarcoReview5Data)));w.MarcoSkillSync={APP_ID:MAIN,create:()=>({start:()=>Promise.resolve(),push(){throw Error('Unexpected course write');}})};if(remoteReview&&!online)w.localStorage.setItem(KEY,JSON.stringify(remoteReview));}
 w.eval(read(main?'app.js':'review4.js'));
 return{w,d:w.document,calls,state:()=>JSON.parse(w.localStorage.getItem(main?MAIN:KEY+(query.includes('demo')?':demo':'')))};
}
function answer(p,id,choice){const f=p.d.querySelector(`form[data-question="${id}"]`),input=f.querySelector(`input[value="${choice}"]`);assert.equal(input.disabled,false);input.checked=true;input.dispatchEvent(new p.w.Event('change',{bubbles:true}));f.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}
test('Review 4 selects exactly the seven imperfect Review 3 skills and has 28 fresh questions',()=>{
 assert.deepEqual(copy(D.topics.flatMap(t=>t.subtopics.map(s=>s[0]))),['intercept','absequation','proportions','units','dimension','independent','transformations']);
 assert.deepEqual(copy(Object.fromEntries(Object.entries(D.source.scores).map(([id,s])=>[id,s.first]))),{intercept:2,absequation:3,proportions:3,units:1,dimension:3,independent:3,transformations:2});
 assert.equal(D.ids.length,28);assert.equal(D.source.excluded.count.first,4);for(const id of Object.keys(D.source.scores))assert.equal(E.ids(id).length,4);
 const old={};for(const f of ['review2-data.js','review3-data.js'])vm.runInNewContext(read(f),old);
 const signature=q=>JSON.stringify([q.prompt,q.table,q.graph,q.series,q.transformation,q.columns]);
 const seen=new Set([...Object.values(old.MarcoReview2Data.questions),...Object.values(old.MarcoReview3Data.questions),...Object.values(course.MarcoSkillCourse.checkpointQuestions),...course.MarcoSkillCourse.sets.slice(0,6).flatMap(s=>s.questionIds.map(CE.resolve))].map(signature));
 for(const q of Object.values(D.questions)){assert.equal(new Set(q.choices).size,4,q.id);assert.ok(q.explanation&&q.audit);assert.ok(!seen.has(signature(q)),q.id);seen.add(signature(q));}
 assert.deepEqual(copy(D.ids.map(id=>{const q=D.questions[id];return q.choices[q.correct];})),['-11','-2','17','5','-8','14','x = 5 or x = −9','x = 11 or x = −3','4a = 11b','5n = 8m','4q = 7p','18','Column A is greater.','The quantities are equal.','Column B is greater.','Column A is greater.','1/216','27/64','44%','237.5%','16/81','1/6','1/20','3/14','Reflection across the y-axis','Reflection across the x-axis','Rotation 90° counterclockwise about the origin','Rotation 180° about the origin']);
});
test('Independent calculations verify numeric keys, absolute roots, proportions, and every plotted vertex',()=>{
 const val=x=>x.includes('/')?x.split('/').map(Number).reduce((a,b)=>a/b):parseFloat(x),maps={'reflect-y':([x,y])=>[-x,y],'reflect-x':([x,y])=>[x,-y],'rotate-90-ccw':([x,y])=>[-y,x],'rotate-180':([x,y])=>[-x,-y]};
 for(const q of Object.values(D.questions)){const a=q.audit,key=q.choices[q.correct];
  if(a.kind==='intercept'){const rows=q.table?.rows||q.graph.points;for(const [x,y]of rows)assert.equal(a.m*x+Number(key),y);if(q.graph)for(const [x,y]of rows)assert.ok(x>=q.graph.xmin&&x<=q.graph.xmax&&y>=q.graph.ymin&&y<=q.graph.ymax);}
  if(a.kind==='abs-sum'){const roots=[a.c+a.k,a.c-a.k];assert.equal(roots.reduce((x,y)=>x+y),Number(key));for(const root of roots)assert.equal(Math.abs(root-a.c),a.k);}
  if(a.kind==='abs-pair'){const roots=key.match(/[−-]?\d+/g).map(x=>Number(x.replace('−','-')));assert.equal(new Set(roots).size,2);for(const root of roots)assert.equal(Math.abs(a.coefficient*root+a.offset),a.k);}
  if(a.kind==='proportion-equation')assert.equal(a.rightDen/a.leftDen,a.leftCoefficient/a.rightCoefficient);
  if(a.kind==='proportion-denominators')assert.equal(a.leftNum/a.rightNum,a.leftCoefficient/a.rightCoefficient);
  if(a.kind==='proportion-denominator-value')assert.equal(a.leftNum/a.leftDen,a.rightNum/Number(key));
  if(a.kind==='units'){const feet=a.mph/3600*5280;assert.equal(q.correct,Math.abs(feet-a.fps)<1e-8?2:feet>a.fps?0:1);}
  if(a.kind==='dimension')assert.ok(Math.abs(val(key)-(a.percent?(a.scale**a.power-1)*100:a.scale**a.power))<1e-8,q.id);
  if(a.kind==='independent'){const [one,two]=a.events;let favorable=0;for(let x=1;x<=one[1];x++)for(let y=1;y<=two[1];y++)if(x<=one[0]&&y<=two[0])favorable++;assert.equal(val(key),favorable/(one[1]*two[1]));}
  if(a.kind==='transformation'){assert.deepEqual(copy(q.transformation.points.map(maps[a.rule])),copy(q.transformation.imagePoints));for(const p of [...q.transformation.points,...q.transformation.imagePoints])for(const v of p)assert.ok(v>=-5&&v<=7);}
 }
});
test('Review 4 requires 4/4 first try, hides methods until four answers, keeps scores after correction and reload',t=>{
 for(const right of [3,4]){const p=browser(t,{query:'?demo=1'}),ids=E.ids('intercept');assert.equal(p.d.querySelectorAll('.record').length,7);assert.equal(p.d.querySelectorAll('.attempt').length,28);p.d.querySelector('#intercept').open=true;
  for(const [i,id]of ids.entries()){answer(p,id,(D.questions[id].correct+(i<right?0:1))%4);if(i<3){assert.equal(p.d.querySelector('#intercept .answer-reveal'),null);assert.equal(E.submit(p.state(),id,0),false);}}
  assert.equal(p.d.querySelector('#intercept').dataset.result,right===4?'passed':'needs-practice');assert.match(p.d.querySelector('#intercept .score').textContent,new RegExp(`${right}/4 = ${right*25}%`));
  for(const id of ids.slice(right))answer(p,id,D.questions[id].correct);assert.equal(E.stats(p.state(),'intercept').first,right);assert.equal(E.stats(p.state(),'intercept').passed,right===4);
  const reload=browser(t,{state:p.state(),query:'?demo=1'});assert.equal(E.stats(reload.state(),'intercept').first,right);assert.equal(p.w.localStorage.getItem(MAIN),'course-sentinel');assert.equal(p.w.localStorage.getItem(R3KEY),'review3-sentinel');assert.equal(p.calls.length,0);assert.equal(p.d.querySelectorAll('.transformation-plot polygon').length,8);
 }
});
test('Review 4 sync saves to its own app ID and restores original first answers',async()=>{
 const c={...ctx,AbortController,setTimeout,clearTimeout,setInterval,clearInterval,fetch,addEventListener(){},removeEventListener(){},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}},localStorage:{getItem(){return null},setItem(){}}};vm.runInNewContext(read('review4-sync.js'),c);const S=c.MarcoReview4Sync;assert.equal(S.APP_ID,KEY);
 let state=E.empty(),record=null,posts=0,status;E.submit(state,D.ids[0],(D.questions[D.ids[0]].correct+1)%4,at,'original');
 const sync=S.create({getState:()=>state,onRemote:x=>state=x,onStatus:k=>status=k,fetcher:async(url,opt)=>{assert.ok(url.endsWith(KEY));if(opt.method==='POST'){const body=JSON.parse(opt.body);assert.equal(body.appId,KEY);assert.ok(E.valid(body.state));record={version:++posts,state:body.state};return{ok:true,json:async()=>({accepted:true,progress:record})};}return{ok:true,json:async()=>({progress:record})};}});
 await sync.push();assert.equal(posts,1);assert.equal(status,'live');state=E.empty();await sync.push();assert.equal(E.stats(state).answered,1);assert.equal(E.stats(state).first,0);assert.equal(posts,1);sync.stop();
});
test('Set 8 stays locked with old answers intact until every Review 4 miss is corrected, then resumes',t=>{
 const state=ready(),run=CE.start(8,state,at);state.sessions[CE.sessionId(8)]=[run];const first=run.questionIds[0];CE.submit(run,first,CE.resolve(first).correct,at);run.notes[first]={text:'Preserve this setup',at};const before=copy(state),r=filled(E,D,true),p=browser(t,{main:true,state,query:'?set=8',remoteReview:r});
 assert.match(p.d.querySelector('.session-lock').textContent,/Finish Review Session 4/);assert.equal(p.d.querySelector('#content form'),null);assert.match(p.d.querySelector('.review4-card').textContent,/Next step/);assert.match(p.d.querySelector('.review4-card').textContent,/First try: 0% · 0\/28 correct/);assert.ok(p.d.querySelector('#sets a[href="?set=8"]').classList.contains('session-locked'));
 const labels=[...p.d.querySelectorAll('#sets .set-card>b')].map(e=>e.textContent);assert.ok(labels.indexOf('Review Session 3')<labels.indexOf('Review Session 4'));assert.ok(labels.indexOf('Review Session 4')<labels.indexOf('Set 8'));
 p.d.querySelector('#content').insertAdjacentHTML('beforeend',`<button data-action="start">Stale start</button><form data-question="${run.questionIds[1]}"><input type="radio" value="0" checked><p class="feedback"></p></form>`);p.d.querySelector('#content button').click();p.d.querySelector('#content form').dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));assert.deepEqual(p.state(),before);
 const refresh=()=>{p.w.localStorage.setItem(KEY,JSON.stringify(r));p.w.dispatchEvent(new p.w.StorageEvent('storage',{key:KEY}));};
 for(const id of D.ids.slice(0,-1))E.submit(r,id,D.questions[id].correct,'2026-10-22T03:05:00.000Z',randomUUID());refresh();assert.match(p.d.querySelector('.session-lock').textContent,/Finish Review Session 4/);
 E.submit(r,D.ids.at(-1),D.questions[D.ids.at(-1)].correct,'2026-10-22T03:05:00.000Z',randomUUID());refresh();assert.equal(p.d.querySelector('.session-lock'),null);assert.equal(p.d.querySelectorAll('#content .question').length,17);assert.equal(E.stats(r).first,0);assert.deepEqual(p.state(),before);assert.equal(p.d.querySelector('.review4-card .next-step'),null);
});
test('A completed Review 4 unlocks Set 8 across devices through read-only progress checks',async t=>{
 const state=ready(),r=filled(E,D),p=browser(t,{main:true,state,query:'?set=8',online:true,remoteReview:r});await new Promise(resolve=>setTimeout(resolve,25));assert.equal(p.d.querySelector('.session-lock'),null);assert.ok(p.d.querySelector('[data-action="start"]'));assert.equal(p.calls.length,3);assert.ok(p.calls.some(x=>x.url.endsWith('review4-v1')));assert.deepEqual(p.state(),copy(state));
});
