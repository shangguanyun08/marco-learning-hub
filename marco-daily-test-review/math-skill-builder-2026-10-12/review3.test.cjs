const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto'),{JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),ctx={crypto:{randomUUID}},files=['review3-data.js','review3-engine.js'];
for(const f of files)vm.runInNewContext(read(f),ctx);const D=ctx.MarcoReview3Data,E=ctx.MarcoReview3Engine,copy=x=>JSON.parse(JSON.stringify(x)),KEY='marco-math-skill-builder-oct12-review3-v1';
test('Eight priority skills include the original six Review 2 targets, with four fresh questions each',()=>{
 const scores={intercept:1,slope:4,direction:3,count:1,graphvalue:4,grouping:4,absequation:2,relative:3,proportions:2,mixture:4,remaining:4,units:2,compound:4,dimension:2,net:3,independent:2,transformations:2};
 assert.deepEqual(copy(D.topics.flatMap(t=>t.subtopics.map(s=>s[0]))),Object.keys(scores).filter(c=>scores[c]/4<=.5));
 const expected=['7','-9','34','6','2/6','3','3/8','-3','18','-12','2','x = 4 or x = −7','3a = 7b','2x = 3y','4n = 7m','20','Column B is greater.','Column A is greater.','The quantities are equal.','Column B is greater.','32.25%','125','1/64','72.8%','9/64','1/4','1/12','9/35','Translation 5 units right and 3 units up','Reflection across the y-axis','Rotation 90° counterclockwise about the origin','Dilation with scale factor 2 about the origin'];
 assert.equal(D.ids.length,32);assert.deepEqual(copy(D.ids.map(id=>D.questions[id].choices[D.questions[id].correct])),expected);
 const old={};vm.runInNewContext(read('review2-data.js'),old);
 const givens=q=>JSON.stringify([q.prompt,q.graph,q.table,q.series,q.columns,q.transformation]),seen=new Set(Object.values(old.MarcoReview2Data.questions).map(givens));
 for(const [c,s]of Object.entries(D.source.scores)){assert.equal(s.answered,4);assert.equal(s.first,scores[c]);assert.equal(E.ids(c).length,4);}
 for(const q of Object.values(D.questions)){assert.equal(new Set(q.choices).size,4,q.id);assert.ok(!seen.has(givens(q)),q.id);seen.add(givens(q));if(q.graph)for(const [x,y]of q.graph.points){assert.equal(q.graph.lines[0].m*x+q.graph.lines[0].b,y);assert.ok(x>=q.graph.xmin&&x<=q.graph.xmax&&y>=q.graph.ymin&&y<=q.graph.ymax);}}
});
function browser(t,state){let requests=0;const dom=new JSDOM(read('review3.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'https://example.test/review3.html?demo=1',runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.fetch=()=>{requests++;throw Error('No live test data');};w.localStorage.setItem('marco-math-skill-builder-oct12-v1','original-sentinel');w.localStorage.setItem('marco-math-skill-builder-oct12-review2-v1','review2-sentinel');if(state)w.localStorage.setItem(KEY+':demo',JSON.stringify(state));for(const f of [...files,'review3-sync.js','review3.js'])w.eval(read(f));return {w,d:w.document,state:()=>JSON.parse(w.localStorage.getItem(KEY+':demo')),requests:()=>requests};}
function answer(page,id,choice){const f=page.d.querySelector(`form[data-question="${id}"]`),input=f.querySelector(`input[value="${choice}"]`);assert.equal(input.disabled,false);input.checked=true;input.dispatchEvent(new page.w.Event('change',{bubbles:true}));f.dispatchEvent(new page.w.Event('submit',{bubbles:true,cancelable:true}));}
test('Per-subtopic 3/4 threshold, withheld feedback, retries, reload, and original-course isolation',t=>{
 for(const right of [2,3,4]){
  const p=browser(t),ids=E.ids('intercept');assert.equal(p.d.querySelectorAll('.record').length,8);assert.equal(p.d.querySelectorAll('.attempt').length,32);
  p.d.querySelector('#intercept').open=true;
  for(const [i,id]of ids.entries()){answer(p,id,(D.questions[id].correct+(i<right?0:1))%4);if(i<3){assert.equal(p.d.querySelector('#intercept .answer-reveal'),null);assert.doesNotMatch(p.d.querySelector('#intercept .score').textContent,/75%|50%|100%/);}}
  assert.match(p.d.querySelector('#intercept .score').textContent,new RegExp(`${right}/4 = ${right*25}%`));assert.equal(p.d.querySelector('#intercept').dataset.result,right>=3?'passed':'needs-practice');assert.equal(p.d.querySelector('#intercept').open,true);
  for(const id of ids.slice(right))answer(p,id,D.questions[id].correct);
  assert.equal(E.stats(p.state(),'intercept').first,right);assert.equal(E.stats(p.state(),'intercept').corrected,4-right);
  const reload=browser(t,p.state());assert.match(reload.d.querySelector('#intercept .score').textContent,new RegExp(`${right}/4`));assert.equal(reload.d.querySelector('#count').dataset.result,'pending');assert.equal(p.w.localStorage.getItem('marco-math-skill-builder-oct12-v1'),'original-sentinel');assert.equal(p.w.localStorage.getItem('marco-math-skill-builder-oct12-review2-v1'),'review2-sentinel');assert.equal(p.requests(),0);
 }
});
test('Event merge preserves the first answer, survives reload, and rejects invalid scores',()=>{
 const a=E.empty(),b=E.empty(),ids=E.ids('count'),at='2026-10-17T20:00:00.000Z';
 E.submit(a,ids[0],(D.questions[ids[0]].correct+1)%4,at,'first');assert.equal(E.submit(a,ids[0],D.questions[ids[0]].correct,at,'early-retry'),false);
 for(const id of ids.slice(1))E.submit(b,id,D.questions[id].correct,at,id);
 const merged=E.merge(a,b);assert.ok(E.valid(merged));assert.deepEqual(copy(merged),copy(E.merge(b,a)));assert.equal(E.stats(merged,'count').first,3);
 E.submit(merged,ids[0],D.questions[ids[0]].correct,'2026-10-17T20:01:00.000Z','retry');assert.equal(E.stats(merged,'count').first,3);assert.deepEqual(copy(E.merge(merged,a)),copy(E.merge(E.merge(a,b),merged)));
 const bad=copy(merged);E.answers(bad)[ids[0]].attempts[0].correct=true;assert.equal(E.valid(bad),false);
});
test('New review uses an isolated app ID and sync saves and restores results',async()=>{
 const c={...ctx,AbortController,setTimeout,clearTimeout,setInterval,clearInterval,fetch,addEventListener(){},removeEventListener(){},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}},localStorage:{getItem(){return null},setItem(){}}};vm.runInNewContext(read('review3-sync.js'),c);const S=c.MarcoReview3Sync;assert.equal(S.APP_ID,KEY);
 let state=E.empty(),record=null,posts=0;E.submit(state,D.ids[0],D.questions[D.ids[0]].correct);let status;
 const sync=S.create({getState:()=>state,onRemote:x=>state=x,onStatus:k=>status=k,fetcher:async(url,opt)=>{assert.ok(url.includes(KEY));if(opt.method==='POST'){const body=JSON.parse(opt.body);assert.equal(body.appId,KEY);assert.ok(E.valid(body.state));assert.equal(body.progressScore,1);record={version:++posts,state:body.state};return {ok:true,json:async()=>({accepted:true,progress:record})};}return {ok:true,json:async()=>({progress:record})};}});
 await sync.push();assert.equal(posts,1);assert.equal(status,'live');state=E.empty();await sync.push();assert.equal(E.stats(state).answered,1);assert.equal(posts,1);sync.stop();
});

test('Course cards and Set 7 completion lead to Review 3 before Set 8 while preserving saved scores',t=>{
 const courseFiles=['data.js','round2.js','checkpoint-data.js','review-checks-data.js','engine.js','review3-data.js','review3-engine.js'],c={crypto:{randomUUID}};for(const f of courseFiles)vm.runInNewContext(read(f),c);
 const engine=c.MarcoSkillEngine,state=engine.empty(),at='2026-10-20T03:00:00Z';
 for(let n=1;n<=7;n++){const run=engine.start(n,state,at);state.sessions[engine.sessionId(n)]=[run];for(const id of run.questionIds)engine.submit(run,id,engine.resolve(id).correct,at);}
 const saved=JSON.stringify(state),dom=new JSDOM(read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'http://localhost/?set=7',runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.MarcoSkillSync={APP_ID:'marco-math-skill-builder-oct12-v1'};w.localStorage.setItem(w.MarcoSkillSync.APP_ID,saved);for(const f of [...courseFiles,'app.js'])w.eval(read(f));
 const names=[...w.document.querySelectorAll('#sets .set-card>b')].map(e=>e.textContent);
 assert.deepEqual(names,['Set 1','Set 2','Set 3','Set 4','Set 5','Set 6','Review','Review Session 2','Set 7','Review Session 3','Set 8','Set 9','Set 10']);
 assert.equal(w.document.querySelector('#content .actions a.primary').getAttribute('href'),'review3.html');
 assert.equal(w.localStorage.getItem(w.MarcoSkillSync.APP_ID),saved);
 const review=browser(t),links=[...review.d.querySelectorAll('nav a')].map(a=>a.getAttribute('href'));
 assert.ok(links.some(h=>h.includes('set=7')));assert.ok(links.some(h=>h.includes('set=8')));
 assert.match(review.d.querySelector('.review-next').textContent,/Continue to Set 8/);
 assert.equal(review.d.querySelectorAll('svg.plot').length,8);
});


test('Probability keys match independent outcome counts; transformation maps match all vertices',()=>{
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 for(const id of E.ids('independent')){
  const q=D.questions[id],events=q.audit.events,n=events[0][0]*events[1][0],d=events[0][1]*events[1][1],g=gcd(n,d);
  assert.equal(q.choices[q.correct],`${n/g}/${d/g}`,id);
 }
 const maps=[([x,y])=>[x+5,y+3],([x,y])=>[-x,y],([x,y])=>[-y,x],([x,y])=>[2*x,2*y]];
 E.ids('transformations').forEach((id,i)=>{
  const g=D.questions[id].transformation;
  assert.deepEqual(copy(g.points.map(maps[i])),copy(g.imagePoints),id);
 });
});

test('Both added skills use recent-practice evidence, retain 3/4 after retry, and restore old answers',t=>{
 const legacy=E.empty();
 for(const [i,id]of D.ids.slice(0,24).entries())E.submit(legacy,id,(D.questions[id].correct+(i===0?1:0))%4,'2026-10-19T20:00:00Z',id);
 E.submit(legacy,D.ids[0],D.questions[D.ids[0]].correct,'2026-10-19T20:01:00Z','legacy-retry');
 const before=copy(E.answers(legacy)),p=browser(t,legacy);
 assert.ok(E.valid(legacy));assert.match(p.d.querySelector('#overall').textContent,/24\/32 questions answered/);
 for(const concept of ['independent','transformations']){
  assert.match(p.d.querySelector(`#${concept} .topic small`).textContent,/Latest 4 similar questions: 2\/4 = 50%/);
  assert.equal(p.d.querySelector(`#${concept}`).dataset.result,'pending');
  for(const [i,id]of E.ids(concept).entries()){
   answer(p,id,(D.questions[id].correct+(i===0?1:0))%4);
   if(i<3)assert.equal(p.d.querySelector(`#${concept} .answer-reveal`),null);
  }
  assert.equal(p.d.querySelector(`#${concept}`).dataset.result,'passed');
  const id=E.ids(concept)[0];answer(p,id,D.questions[id].correct);
  assert.match(p.d.querySelector(`#${concept} .score`).textContent,/3\/4 = 75%/);
  assert.equal(E.stats(p.state(),concept).corrected,1);
 }
 const reloaded=browser(t,p.state());
 for(const [id,answer]of Object.entries(before))assert.deepEqual(copy(E.answers(reloaded.state())[id]),answer,id);
 for(const concept of ['independent','transformations'])assert.equal(E.stats(reloaded.state(),concept).first,3);
 assert.equal(p.requests(),0);assert.equal(reloaded.requests(),0);
 const plots=p.d.querySelectorAll('.transformation-plot');assert.equal(plots.length,4);
 for(const plot of plots){assert.equal(plot.querySelectorAll('polygon').length,2);assert.match(plot.getAttribute('aria-label'),/Original triangle: A .*Image triangle: A′/);}
});
