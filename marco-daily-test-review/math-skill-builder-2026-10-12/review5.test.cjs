const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto'),{JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),copy=x=>JSON.parse(JSON.stringify(x)),KEY='marco-math-skill-builder-oct12-review5-v1',MAIN='marco-math-skill-builder-oct12-v1',at='2026-10-22T06:00:00.000Z';
const ctx={crypto:{randomUUID}};for(const f of ['review5-data.js','review5-engine.js'])vm.runInNewContext(read(f),ctx);const D=ctx.MarcoReview5Data,E=ctx.MarcoReview5Engine;
const scripts=html=>[...html.matchAll(/<script defer src="([^"?]+)[^"]*"/g)].map(m=>m[1]);
const sentinels=[MAIN,...[2,3,4].map(n=>`marco-math-skill-builder-oct12-review${n}-v1`)];
function browser(t,{state,query='?demo=1',online=false}={}){
 const html=read('review5.html'),dom=new JSDOM(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:(online?'https://example.test/':'http://localhost/')+'review5.html'+query,runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};
 const calls=[];w.fetch=async(url,opt)=>{calls.push({url,opt});assert.equal(opt.method,'GET');return{ok:true,json:async()=>({progress:null})};};
 for(const key of sentinels)w.localStorage.setItem(key,'preserve-'+key);
 if(state)w.localStorage.setItem(KEY+(query.includes('demo')?':demo':''),JSON.stringify(state));
 for(const f of scripts(html))w.eval(read(f));
 return{w,d:w.document,calls,state:()=>JSON.parse(w.localStorage.getItem(KEY+(query.includes('demo')?':demo':'')))};
}
function answer(p,id,choice){const f=p.d.querySelector(`form[data-question="${id}"]`),input=f.querySelector(`input[value="${choice}"]`);assert.equal(input.disabled,false);input.checked=true;input.dispatchEvent(new p.w.Event('change',{bubbles:true}));f.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}
function preserved(p){for(const key of sentinels)assert.equal(p.w.localStorage.getItem(key),'preserve-'+key);}
test('Review 5 has four fresh questions for each completed Review 4 skill below 100%',()=>{
 assert.deepEqual(copy(D.topics.flatMap(t=>t.subtopics.map(s=>s[0]))),['intercept','absequation','proportions','units','independent']);assert.equal(D.ids.length,20);assert.equal(D.source.recordVersion,39);assert.equal(D.source.appId,'marco-math-skill-builder-oct12-review4-v1');
 assert.deepEqual(copy(D.source.scores),{intercept:{first:3,answered:4},absequation:{first:3,answered:4},proportions:{first:3,answered:4},units:{first:2,answered:4},independent:{first:3,answered:4}});
 assert.deepEqual(copy(D.source.excluded),{dimension:{first:4,answered:4},transformations:{first:4,answered:4}});
 const old={};for(const f of ['data.js','round2.js','checkpoint-data.js','review-checks-data.js','recheck-data.js','review2-data.js','review3-data.js','review4-data.js','engine.js'])vm.runInNewContext(read(f),old);
 const signature=q=>JSON.stringify([q.prompt,q.table,q.graph,q.series,q.transformation,q.columns]);
 const prior=[2,3,4].flatMap(n=>Object.values(old[`MarcoReview${n}Data`].questions));
 const course=old.MarcoSkillCourse,CE=old.MarcoSkillEngine,core=course.sets.slice(0,6).flatMap(s=>s.questionIds.map(CE.resolve));prior.push(...core,...core.map(q=>CE.resolve('r2:'+q.id)),...Object.values(course.checkpointQuestions));
 const seen=new Set(prior.map(signature)),ids=new Set(prior.map(q=>q.id));
 for(const concept of Object.keys(D.source.scores))assert.equal(E.ids(concept).length,4);
 for(const q of Object.values(D.questions)){assert.equal(new Set(q.choices).size,4,q.id);assert.ok(q.explanation&&q.audit);assert.ok(!ids.has(q.id),q.id);assert.ok(!seen.has(signature(q)),q.id);seen.add(signature(q));}
 assert.deepEqual(copy(D.ids.map(id=>{const q=D.questions[id];return q.choices[q.correct];})),['-8','9','-7','20','-12','18','x = 4 or x = -10','x = 13 or x = -3','5a = 13b','7n = 11m','5q = 8p','16','Column A is greater.','The quantities are equal.','Column B is greater.','Column A is greater.','9/100','5/32','5/56','25/126']);
});
test('Independent calculations check every answer and reject all distractors',()=>{
 const fraction=s=>s.includes('/')?s.split('/').map(Number).reduce((a,b)=>a/b):Number(s);
 const equation=(s,vars)=>{const expr=x=>x.replace(/(\d)([a-z])/g,'$1*$2').replace(/[a-z]/g,c=>vars[c]);const [a,b]=s.split(' = ').map(expr);return vm.runInNewContext(a)===vm.runInNewContext(b);};
 for(const q of Object.values(D.questions)){const a=q.audit;let truth;
  if(a.kind==='intercept'){
   const rows=q.table?.rows||q.graph.points,[[x1,y1],[x2,y2]]=rows,slope=(y2-y1)/(x2-x1),b=y1-slope*x1;truth=q.choices.map(c=>Number(c)===b);
   for(const [x,y]of rows)assert.equal(slope*x+b,y);
   if(q.graph){assert.equal(q.graph.lines[0].m,slope);assert.equal(q.graph.lines[0].b,b);for(const [x,y]of rows)assert.ok(x>=q.graph.xmin&&x<=q.graph.xmax&&y>=q.graph.ymin&&y<=q.graph.ymax);}
  }
  if(a.kind==='abs-sum'){const roots=[a.c+a.k,a.c-a.k];truth=q.choices.map(c=>Number(c)===roots[0]+roots[1]);for(const r of roots)assert.equal(Math.abs(r-a.c),a.k);}
  if(a.kind==='abs-pair')truth=q.choices.map(c=>{const roots=c.match(/-?\d+/g).map(Number);return new Set(roots).size===2&&roots.every(r=>Math.abs(a.coefficient*r+a.offset)===a.k);});
  if(a.kind==='proportion-equation')truth=q.choices.map(c=>[1,2,3].every(k=>equation(c,{a:a.leftDen*k,b:a.rightDen*k})));
  if(a.kind==='proportion-denominators')truth=q.choices.map(c=>[1,2,3].every(k=>equation(c,q.prompt.includes('14/m')?{m:a.leftNum*k,n:a.rightNum*k}:{p:a.leftNum*k,q:a.rightNum*k})));
  if(a.kind==='proportion-denominator-value')truth=q.choices.map(c=>a.leftNum/a.leftDen===a.rightNum/Number(c));
  if(a.kind==='units'){const diff=a.mph*22-a.fps*15;truth=q.choices.map((_,i)=>i===(diff===0?2:diff>0?0:1));}
  if(a.kind==='independent'){const [one,two]=a.events;let favorable=0,total=0;for(let x=1;x<=one[1];x++)for(let y=1;y<=two[1];y++){total++;if(x<=one[0]&&y<=two[0])favorable++;}truth=q.choices.map(c=>fraction(c)===favorable/total);}
  assert.ok(truth,q.id);assert.equal(truth.filter(Boolean).length,1,q.id);assert.equal(truth[q.correct],true,q.id);
 }
 // The stated number ranges contain exactly these counts of multiples of 3.
 const multiples=(n,d)=>Array.from({length:n},(_,i)=>i+1).filter(x=>x%d===0).length;assert.equal(multiples(14,3),4);assert.equal(multiples(16,3),5);
});
test('Feedback waits for four first answers; corrections, reloads and storage merges preserve scores',t=>{
 for(const right of [3,4]){const p=browser(t),ids=E.ids('intercept');assert.equal(p.d.querySelectorAll('.record').length,5);assert.equal(p.d.querySelectorAll('.attempt').length,20);p.d.querySelector('#intercept').open=true;
  for(const [i,id]of ids.entries()){answer(p,id,(D.questions[id].correct+(i<right?0:1))%4);if(i<3){assert.equal(p.d.querySelector('#intercept .answer-reveal'),null);assert.equal(p.d.querySelectorAll('#intercept .option.correct,#intercept .option.wrong').length,0);assert.equal(E.submit(p.state(),id,0),false);}}
  assert.equal(p.d.querySelector('#intercept').dataset.result,right===4?'passed':'needs-practice');assert.match(p.d.querySelector('#intercept .score').textContent,new RegExp(`${right}/4 = ${right*25}%`));
  assert.equal(p.d.querySelectorAll('#intercept .answer-reveal').length,4);assert.equal(p.d.querySelectorAll('#intercept .answer-reveal[open]').length,0);
  for(const id of ids.slice(right))answer(p,id,D.questions[id].correct);
  const saved=p.state();assert.equal(E.stats(saved,'intercept').first,right);assert.equal(E.stats(saved,'intercept').passed,right===4);
  const reload=browser(t,{state:saved});assert.equal(E.stats(reload.state(),'intercept').first,right);preserved(p);preserved(reload);assert.equal(p.calls.length,0);
  const remote=E.empty(),id=E.ids('units')[0];E.submit(remote,id,D.questions[id].correct,at,'remote');p.w.dispatchEvent(new p.w.StorageEvent('storage',{key:KEY+':demo',newValue:JSON.stringify(remote)}));assert.equal(E.stats(p.state()).answered,5);assert.equal(E.stats(p.state(),'intercept').first,right);preserved(p);
 }
});
test('Blank submissions use no attempt and all twenty completed answers restore in their own session',t=>{
 const p=browser(t,{query:''}),f=p.d.querySelector('.question-form');f.dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));assert.match(f.querySelector('.feedback').textContent,/No attempt used/);assert.equal(p.state(),null);
 for(const id of D.ids)answer(p,id,D.questions[id].correct);const saved=p.state();assert.equal(E.stats(saved).first,20);assert.deepEqual(Object.keys(saved.sessions),['review5-v1']);assert.equal(p.d.querySelector('#overall strong').textContent,'5/5');const reload=browser(t,{state:saved,query:''});assert.equal(E.stats(reload.state()).first,20);assert.equal(reload.d.querySelectorAll('.question-form button').length,0);preserved(p);assert.equal(p.calls.length,0);
});
test('Sync has a new app identity and merges corrections without replacing original first answers',async()=>{
 const c={...ctx,AbortController,setTimeout,clearTimeout,setInterval,clearInterval,fetch,addEventListener(){},removeEventListener(){},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}},localStorage:{getItem(){return null},setItem(){}}};vm.runInNewContext(read('review5-sync.js'),c);const S=c.MarcoReview5Sync;assert.equal(S.APP_ID,KEY);
 let state=E.empty(),record=null,posts=0,status;const id=D.ids[0];E.submit(state,id,(D.questions[id].correct+1)%4,at,'original');
 const sync=S.create({getState:()=>state,onRemote:x=>state=x,onStatus:k=>status=k,fetcher:async(url,opt)=>{assert.ok(url.endsWith(KEY));if(opt.method==='POST'){const body=JSON.parse(opt.body);assert.equal(body.appId,KEY);assert.ok(E.valid(body.state));record={version:++posts,state:body.state};return{ok:true,json:async()=>({accepted:true,progress:record})};}return{ok:true,json:async()=>({progress:record})};}});
 await sync.push();assert.equal(posts,1);assert.equal(status,'live');state=E.empty();await sync.push();assert.equal(E.stats(state).answered,1);assert.equal(E.stats(state).first,0);assert.equal(posts,1);
 for(const qid of E.ids('intercept').slice(1))E.submit(state,qid,D.questions[qid].correct,at,randomUUID());E.submit(state,id,D.questions[id].correct,'2026-10-22T06:05:00Z','correction');await sync.push();assert.equal(posts,2);assert.equal(E.stats(state,'intercept').first,3);assert.equal(E.attempts(state,id)[0].id,'original');sync.stop();
});
test('Demo on a public origin never calls progress service; empty online review performs only its own GET',async t=>{
 const demo=browser(t,{online:true});assert.equal(demo.calls.length,0);for(const a of demo.d.querySelectorAll('nav a'))assert.ok(new URL(a.href).searchParams.has('demo'));
 const online=browser(t,{online:true,query:''});await new Promise(resolve=>setTimeout(resolve,10));assert.equal(online.calls.length,1);assert.ok(online.calls[0].url.endsWith(KEY));preserved(online);
});
test('Review 5 navigation is discoverable and its separate gate dependencies do not write old progress',t=>{
 const html=read('index.html'),dom=new JSDOM(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'http://localhost/',runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};
 const oldKeys=sentinels.map(key=>[key,w.localStorage.getItem(key)]);for(const f of scripts(html))w.eval(read(f));
 const labels=[...w.document.querySelectorAll('#sets .set-card>b')].map(e=>e.textContent);assert.ok(labels.indexOf('Review Session 4')<labels.indexOf('Review Session 5'));assert.ok(labels.indexOf('Review Session 5')<labels.indexOf('Set 8'));assert.equal(w.document.querySelector('.review5-card').getAttribute('href'),'review5.html');
 assert.ok(scripts(html).includes('review5-data.js'));assert.ok(scripts(html).includes('review5-engine.js'));
 assert.ok(scripts(html).includes('review5-sync.js'));assert.match(read('review4.html'),/href="review5.html"/);for(const [key,value]of oldKeys)assert.equal(w.localStorage.getItem(key),value);
});
