const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto'),{JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),ctx={crypto:{randomUUID}},files=['review2-data.js','review2-engine.js'];
for(const f of files)vm.runInNewContext(read(f),ctx);const D=ctx.MarcoReview2Data,E=ctx.MarcoReview2Engine,copy=x=>JSON.parse(JSON.stringify(x)),KEY='marco-math-skill-builder-oct12-review2-v1';
const numeric=s=>String(s).replace(/%/g,'').split('/').map(Number).reduce((a,b)=>a/b),compare=(a,b)=>Math.abs(a-b)<1e-8?2:a>b?0:1;
test('52 independently checked answers, exactly 4 fresh questions for each original review subtopic',()=>{
 assert.equal(D.ids.length,52);const concepts=D.topics.flatMap(t=>t.subtopics.map(s=>s[0]));assert.equal(concepts.length,13);
 assert.deepEqual(copy(concepts),[...read('review.html').matchAll(/<details class="record" id="([^"]+)"/g)].map(m=>m[1]));
 const seen=new Set();
 for(const concept of concepts)assert.equal(E.ids(concept).length,4);
 for(const q of Object.values(D.questions)){
  assert.equal(new Set(q.choices).size,4,q.id);const key=JSON.stringify([q.prompt,q.graph,q.table,q.series,q.columns,q.choiceGraphs,q.concept==='direction'?q.choices:null]);assert.ok(!seen.has(key),q.id);seen.add(key);
  const p=q.audit;let answer,index;
  switch(p.kind){
   case 'intercept':answer=p.y-p.m*p.x;break;
   case 'slope':answer=p.rise/p.run;break;
   case 'direction':index=p.slopes.indexOf(Math.min(...p.slopes.filter(x=>x>0)));break;
   case 'count':{const a=p.rows.filter(r=>r[1]>r[2]).length,b=p.rows.filter(r=>r[2]>r[1]).length;answer=p.fraction?b/p.rows.length:b-a;break;}
   case 'graphvalue':answer=p.m*p.x+p.b;break;
   case 'grouping':index=p.v===0?compare(Math.abs(-p.a+p.b),Math.abs(-p.a)+Math.abs(p.b)):p.v===1?compare(-Math.abs(-p.a)+p.b,Math.abs(-p.a+p.b)):compare(2*Math.abs(-p.a)-2*Math.abs(p.b),2*Math.abs(-p.a-p.b));break;
   case 'abs-sum':answer=(p.c+p.k)+(p.c-p.k);break;
   case 'abs-count':answer=p.k<0?0:p.k===0?1:2;break;
   case 'abs-values':assert.equal(q.choices[q.correct],`x is ${p.k} or −${p.k}.`);continue;
   case 'relative':index=compare(1,(p.dn/p.dd)/(p.tn/p.td));break;
   case 'mixture':answer=(p.juice?p.a:p.b)*p.k;break;
   case 'remaining':answer=p.used/p.num*(p.den-p.num);break;
   case 'units':index=compare(p.mph,p.fps/5280*3600);break;
   case 'compound':answer=p.start*p.a*p.b;break;
   case 'dimension':answer=p.percent?(p.scale**p.power-1)*100:p.scale**p.power;break;
   default:throw Error(q.id);
  }
  if(index!==undefined)assert.equal(q.correct,index,q.id);
  else{assert.ok(Math.abs(numeric(q.choices[q.correct])-answer)<1e-7,q.id);assert.equal(q.choices.filter(s=>Math.abs(numeric(s)-answer)<1e-7).length,1,q.id);}
  for(const g of [q.graph,...q.choiceGraphs||[]].filter(Boolean))for(const [x,y]of g.points||[]){assert.ok(x>=g.xmin&&x<=g.xmax&&y>=g.ymin&&y<=g.ymax,q.id);assert.ok(Math.abs(y-g.lines[0].m*x-g.lines[0].b)<1e-7);}
 }
});
function browser(t,state){let requests=0;const dom=new JSDOM(read('review2.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'https://example.test/review2.html?demo=1',runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.fetch=()=>{requests++;throw Error('No live test data');};w.localStorage.setItem('marco-math-skill-builder-oct12-v1','original-sentinel');if(state)w.localStorage.setItem(KEY+':demo',JSON.stringify(state));for(const f of [...files,'review2-sync.js','review2.js'])w.eval(read(f));return {w,d:w.document,state:()=>JSON.parse(w.localStorage.getItem(KEY+':demo')),requests:()=>requests};}
function answer(page,id,choice){const f=page.d.querySelector(`form[data-question="${id}"]`),input=f.querySelector(`input[value="${choice}"]`);assert.equal(input.disabled,false);input.checked=true;input.dispatchEvent(new page.w.Event('change',{bubbles:true}));f.dispatchEvent(new page.w.Event('submit',{bubbles:true,cancelable:true}));}
test('Per-subtopic 3/4 threshold, withheld feedback, retries, reload, and original-course isolation',t=>{
 for(const right of [2,3,4]){
  const p=browser(t),ids=E.ids('intercept');assert.equal(p.d.querySelectorAll('.record').length,13);assert.equal(p.d.querySelectorAll('.attempt').length,52);
  p.d.querySelector('#intercept').open=true;
  for(const [i,id]of ids.entries()){answer(p,id,(D.questions[id].correct+(i<right?0:1))%4);if(i<3){assert.equal(p.d.querySelector('#intercept .answer-reveal'),null);assert.doesNotMatch(p.d.querySelector('#intercept .score').textContent,/75%|50%|100%/);}}
  assert.match(p.d.querySelector('#intercept .score').textContent,new RegExp(`${right}/4 = ${right*25}%`));assert.equal(p.d.querySelector('#intercept').dataset.result,right>=3?'passed':'needs-practice');assert.equal(p.d.querySelector('#intercept').open,true);
  for(const id of ids.slice(right))answer(p,id,D.questions[id].correct);
  assert.equal(E.stats(p.state(),'intercept').first,right);assert.equal(E.stats(p.state(),'intercept').corrected,4-right);
  const reload=browser(t,p.state());assert.match(reload.d.querySelector('#intercept .score').textContent,new RegExp(`${right}/4`));assert.equal(reload.d.querySelector('#slope').dataset.result,'pending');assert.equal(p.w.localStorage.getItem('marco-math-skill-builder-oct12-v1'),'original-sentinel');assert.equal(p.requests(),0);
 }
});
test('Event merge preserves the first answer, survives reload, and rejects invalid scores',()=>{
 const a=E.empty(),b=E.empty(),ids=E.ids('slope'),at='2026-10-17T20:00:00.000Z';
 E.submit(a,ids[0],(D.questions[ids[0]].correct+1)%4,at,'first');assert.equal(E.submit(a,ids[0],D.questions[ids[0]].correct,at,'early-retry'),false);
 for(const id of ids.slice(1))E.submit(b,id,D.questions[id].correct,at,id);
 const merged=E.merge(a,b);assert.ok(E.valid(merged));assert.deepEqual(copy(merged),copy(E.merge(b,a)));assert.equal(E.stats(merged,'slope').first,3);
 E.submit(merged,ids[0],D.questions[ids[0]].correct,'2026-10-17T20:01:00.000Z','retry');assert.equal(E.stats(merged,'slope').first,3);assert.deepEqual(copy(E.merge(merged,a)),copy(E.merge(E.merge(a,b),merged)));
 const bad=copy(merged);E.answers(bad)[ids[0]].attempts[0].correct=true;assert.equal(E.valid(bad),false);
});
test('New review uses an isolated app ID and sync saves and restores results',async()=>{
 const c={...ctx,AbortController,setTimeout,clearTimeout,setInterval,clearInterval,fetch,addEventListener(){},removeEventListener(){},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}},localStorage:{getItem(){return null},setItem(){}}};vm.runInNewContext(read('review2-sync.js'),c);const S=c.MarcoReview2Sync;assert.equal(S.APP_ID,KEY);
 let state=E.empty(),record=null,posts=0;E.submit(state,D.ids[0],D.questions[D.ids[0]].correct);let status;
 const sync=S.create({getState:()=>state,onRemote:x=>state=x,onStatus:k=>status=k,fetcher:async(url,opt)=>{assert.ok(url.includes(KEY));if(opt.method==='POST'){const body=JSON.parse(opt.body);assert.equal(body.appId,KEY);assert.ok(E.valid(body.state));assert.equal(body.progressScore,1);record={version:++posts,state:body.state};return {ok:true,json:async()=>({accepted:true,progress:record})};}return {ok:true,json:async()=>({progress:record})};}});
 await sync.push();assert.equal(posts,1);assert.equal(status,'live');state=E.empty();await sync.push();assert.equal(E.stats(state).answered,1);assert.equal(posts,1);sync.stop();
});
