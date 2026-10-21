const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto'),{JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),copy=x=>JSON.parse(JSON.stringify(x)),KEY='marco-math-skill-builder-oct12-v1',RKEY='marco-math-skill-builder-oct12-review3-v1',at='2026-10-20T18:00:00.000Z';
const oldFiles=['data.js','round2.js','checkpoint-data.js','review-checks-data.js'];
function context(files){const c={crypto:{randomUUID}};for(const f of files)vm.runInNewContext(read(f),c,{filename:f});return c;}
const old=context([...oldFiles,'engine.js']),ctx=context([...oldFiles,'recheck-data.js','engine.js','review3-data.js','review3-engine.js']),C=ctx.MarcoSkillCourse,E=ctx.MarcoSkillEngine;
function complete(state,n,engine=E,wrongConcept){const r=engine.start(n,state,at);state.sessions[engine.sessionId(n)]=[r];for(const id of r.questionIds){const q=engine.resolve(id);engine.submit(r,id,(q.correct+(q.concept===wrongConcept?1:0))%4,at);}return r;}
function ready(){const state=E.empty();for(let n=1;n<=7;n++)complete(state,n);return state;}
function corrections(r){for(const id of r.questionIds)if(!E.done(r.answers[id]))E.submit(r,id,E.resolve(id).correct,'2026-10-20T18:10:00.000Z');}
function browser(t,state,query='?set=8',review){const dom=new JSDOM(read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'http://localhost/'+query,runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem(KEY,JSON.stringify(state));
 const scripts=[...read('index.html').matchAll(/<script defer src="([^"?]+)[^"]*"/g)].map(x=>x[1]);
 for(const file of scripts.filter(f=>!['app.js','sync.js'].includes(f)))w.eval(read(file));w.MarcoSkillSync={APP_ID:KEY};
 if(review===undefined){review=w.MarcoReview3Engine.empty();for(const id of w.MarcoReview3Data.ids)w.MarcoReview3Engine.submit(review,id,w.MarcoReview3Data.questions[id].correct);}
 const review4=w.MarcoReview4Engine.empty();for(const id of w.MarcoReview4Data.ids)w.MarcoReview4Engine.submit(review4,id,w.MarcoReview4Data.questions[id].correct);w.localStorage.setItem('marco-math-skill-builder-oct12-review4-v1',JSON.stringify(review4));
 w.localStorage.setItem(RKEY,JSON.stringify(review));w.eval(read('app.js'));
 return{w,d:w.document,state:()=>JSON.parse(w.localStorage.getItem(KEY))};}
const expected={
 mixture:[35,28,40],setup:['n + (3n − 11) = 65','7 + 4k = 55','5p + 6 = 71'],grouping:[3*Math.abs(-8+3)-Math.abs(-4),Math.abs(-14)-Math.abs(5-12),2*Math.abs(-9+4)+Math.abs(-3-2)],
 system:[7,25,34],signed:[-(6**2)+4*-3,(-4)**2-3*-5,-3*(8-(-4))/2],meanmedian:[7.5,16,3],probabilitycount:['2/9','2/3','1/3'],patterns:[45,35,52],
 coefficient:['The cost increases by $6 for each rental hour.','The token balance decreases by 3 for each round.','The volume increases by 9 liters each minute.'],slope:['-3/2','5/2','1/3'],
 areaformula:[12,9,14],squarecircle:['484 − 121π','676 − 169π','900 − 225π'],cubeblocks:['4 × 7 × 7 block','3 × 8 × 8 block','2 × 9 × 9 block'],percentnumber:[84,40,117],unitprice:['Store A',5,12],remaining:[27,40,45],compound:[270,528,331.2]
};
test('Exactly the 17 selected skills, one question per skill per set, 51 independently checked keys',()=>{
 assert.equal(C.recheckSkills.length,17);assert.deepEqual(copy(C.recheckSkills.map(s=>s.sourceTopic)),[1,10,11,12,13,16,17,18,21,22,28,29,31,5,7,8,'compound']);
 const oldReviews=context(['review2-data.js','review3-data.js']),givens=q=>JSON.stringify([q.prompt,q.columns,q.table,q.graph,q.series,q.diagram]);
 const seen=new Set([...Object.values(old.MarcoSkillCourse.checkpointQuestions),...Object.values(oldReviews.MarcoReview2Data.questions),...Object.values(oldReviews.MarcoReview3Data.questions),...old.MarcoSkillCourse.sets.slice(0,6).flatMap(s=>s.questionIds.map(old.MarcoSkillEngine.resolve))].map(givens));
 for(const n of [8,9,10]){const s=E.set(n);assert.equal(s.questionIds.length,17);assert.equal(s.targetCorrect,16);assert.ok(s.noRound2);assert.deepEqual(copy(s.questionIds.map(id=>E.resolve(id).concept).sort()),Object.keys(expected).sort());
  for(const id of s.questionIds){const q=E.resolve(id);assert.equal(q.choices[q.correct],String(expected[q.concept][n-8]),id);assert.equal(new Set(q.choices).size,4,id);assert.ok(!seen.has(givens(q)),id);seen.add(givens(q));assert.ok(q.tip&&q.explanation&&q.audit);assert.ok(Object.hasOwn(C.skills,q.skill));}
 }
 // Content retained for offline and historical records must keep its original key and order.
 for(const [id,q]of Object.entries(old.MarcoSkillCourse.checkpointQuestions))assert.deepEqual(copy(E.resolve(id)),copy(q),id);
 assert.deepEqual(copy(E.set(7)),copy(old.MarcoSkillEngine.set(7)));
});
test('Probability outcomes, formula substitution, growth tables, graph points and geometry agree with keys',()=>{
 const value=s=>s.includes('/')?s.split('/').map(Number).reduce((a,b)=>a/b):Number(s);
 for(const n of [8,9,10])for(const id of E.set(n).questionIds){const q=E.resolve(id),a=q.audit,key=q.choices[q.correct],v=n-8;
  if(q.concept==='probabilitycount'){const p=v===0?Array.from({length:18},(_,i)=>i+1).filter(x=>x%4===0).length/18:v===1?(6+4)/(6+5+4):Array.from({length:24},(_,i)=>i+1).filter(x=>x%4===0||x%6===0).length/24;assert.ok(Math.abs(value(key)-p)<1e-10);}
  if(q.concept==='system'){const x=a.ask==='x'?Number(key):(Number(key)-a.b)/a.a,y=a.a*x+a.b;assert.equal(a.c*x+y,a.total);}
  if(q.concept==='patterns'){const stages=q.diagram.stages;stages.forEach((rows,i)=>{assert.equal(rows.length,i+1);rows.forEach((n,j)=>assert.equal(n,a.firstRow+j));});assert.equal(Number(key),a.figure*(2*a.firstRow+a.figure-1)/2);}
  if(q.concept==='cubeblocks'){const [width,depth,height]=key.match(/\d+/g).map(Number);assert.equal(width+q.diagram.dims[0],a.edge);assert.equal(depth,a.edge);assert.equal(height,a.edge);}
  if(q.concept==='slope'){const pts=q.graph?.points||q.table.rows,m=value(key);for(let i=1;i<pts.length;i++)assert.ok(Math.abs((pts[i][1]-pts[0][1])-m*(pts[i][0]-pts[0][0]))<1e-10);if(q.graph)for(const [x,y]of pts)assert.equal(q.graph.lines[0].m*x+q.graph.lines[0].b,y);}
  if(q.concept==='squarecircle'){assert.equal(a.radius,q.diagram.radius);assert.equal(a.side,q.diagram.side);assert.ok(a.radius*2<=a.side);assert.equal(key,`${a.side*a.side} − ${a.radius*a.radius}π`);}
 }
});
test('Each 17-question set keeps first scores after retries and reloads and opens in sequence',t=>{
 const state=ready();
 for(const n of [8,9,10]){
  const run=complete(state,n,E,'mixture');assert.equal(E.stats(run).first,16);assert.equal(E.stats(run).total,17);assert.equal(run.completedAt,null);
  const page=browser(t,state,`?set=${n}`);assert.equal(page.d.querySelectorAll('#content .question').length,17);assert.match(page.d.querySelector('.stage-head').textContent,/17 QUESTIONS/);assert.match(page.d.querySelector('.checkpoint-goal').textContent,/16\/17 = 94%/);assert.match(page.d.querySelector('.checkpoint-goal').textContent,/goal reached/);assert.equal(page.d.querySelector('nav[aria-label="Practice rounds"]'),null);
  if(n<10){assert.throws(()=>E.start(n+1,state,at),new RegExp(`Finish Set ${n}`));assert.match(browser(t,state,`?set=${n+1}`).d.querySelector('.session-lock').textContent,new RegExp(`Finish Set ${n}`));}
  assert.equal(page.d.querySelector(`#sets a[href="?set=${n}"] .saved-first-score`).textContent,'First try: 94% · 16/17 correct');
  corrections(run);assert.ok(run.completedAt);assert.equal(E.stats(run).first,16);assert.ok(E.valid(state));assert.throws(()=>E.start(n,state,at),/saved attempt/);
  const reloaded=browser(t,copy(state),`?set=${n}`);assert.match(reloaded.d.querySelector('.complete-panel').textContent,/16\/17 correct/);
  assert.equal(reloaded.d.querySelector(`#sets a[href="?set=${n}"] .saved-first-score`).textContent,'First try: 94% · 16/17 correct');
 }
 const low=ready(),r=complete(low,8);const miss=r.questionIds.slice(0,2);for(const id of miss){r.answers[id].attempts[0].choice=(E.resolve(id).correct+1)%4;r.answers[id].attempts[0].correct=false;}r.completedAt=null;corrections(r);
 const page=browser(t,low);assert.match(page.d.querySelector('.checkpoint-goal').textContent,/15\/17 = 88%/);assert.doesNotMatch(page.d.querySelector('.checkpoint-goal').textContent,/goal reached/);
 assert.equal(page.d.querySelector('#sets a[href="?set=8"] .saved-first-score').textContent,'First try: 88% · 15/17 correct');
});
test('Skill table withholds first-pass correctness and tracks original first answers across all three sets',t=>{
 const state=ready(),r=E.start(8,state,at);state.sessions[E.sessionId(8)]=[r];const first=r.questionIds[0];E.submit(r,first,(E.resolve(first).correct+1)%4,at);
 assert.equal(E.submit(r,first,E.resolve(first).correct,at),false);
 const page=browser(t,state);assert.equal(page.d.querySelector('#content .solution'),null);assert.match(page.d.querySelector('#recheck-report').textContent,/Recorded/);assert.doesNotMatch(page.d.querySelector('#recheck-report tbody').textContent,/Missed|Correct/);
 assert.equal(page.d.querySelector('#sets a[href="?set=8"] .saved-first-score').textContent,'First-try score hidden until all first answers are recorded (1/17).');
 assert.equal(page.d.querySelector('#sets a[href="?set=9"] .saved-first-score').textContent,'No first-try score yet.');
 for(const id of r.questionIds.slice(1))E.submit(r,id,E.resolve(id).correct,at);corrections(r);complete(state,9);complete(state,10);
 const finished=browser(t,state,'?set=10'),rows=[...finished.d.querySelectorAll('#recheck-report tbody tr')];assert.equal(rows.length,17);
 const missed=rows.find(row=>row.querySelector('th').textContent==='Parts in a ratio');assert.match(missed.textContent,/Missed.*Correct.*Correct.*2\/3.*Revisit this skill/);
 assert.equal(rows.filter(row=>row.textContent.includes('3/3 first try')).length,16);assert.equal(finished.d.querySelectorAll('#recheck-report tbody td').length,85);
 assert.equal(E.stats(state.sessions[E.sessionId(8)][0]).first,16);
});
test('Original 12-question answers and notes remain valid and visible without filling the new checks',t=>{
 const state=ready();for(const n of [8,9,10]){const r=complete(state,n,old.MarcoSkillEngine);r.notes[r.questionIds[0]]={text:'Keep my original setup',at};}
 assert.ok(E.valid(state));const before=copy(state),merged=E.merge(E.empty(),state);assert.ok(E.valid(merged));assert.deepEqual(copy(merged),before);
 for(const n of [8,9,10]){assert.equal(merged.sessions[E.sessionId(n)],undefined);const page=browser(t,merged,`?set=${n}`);assert.match(page.d.querySelector('.previous-checks').textContent,/12\/12 first-try correct/);assert.match(page.d.querySelector('.previous-checks').textContent,/Keep my original setup/);assert.doesNotMatch(page.d.querySelector('#recheck-report tbody').textContent,/✓ Correct|3\/3 first try/);}
 assert.throws(()=>E.start(9,merged,at),/Finish Set 8/);
 for(const n of [8,9,10])complete(merged,n);const roundtrip=E.merge(before,merged);assert.ok(E.valid(roundtrip));
 for(const n of [8,9,10]){const sid=old.MarcoSkillEngine.sessionId(n);assert.deepEqual(copy(roundtrip.sessions[sid]),before.sessions[sid]);assert.equal(E.stats(roundtrip.sessions[E.sessionId(n)][0]).total,17);}
});
test('Review 3 still gates Set 8, and demo checks never call the production API',t=>{
 const state=ready(),review=ctx.MarcoReview3Engine.empty(),page=browser(t,state,'?set=8',review);assert.match(page.d.querySelector('.session-lock').textContent,/Finish Review Session 3/);assert.equal(page.d.querySelector('[data-action="start"]'),null);
 for(const id of ctx.MarcoReview3Data.ids)ctx.MarcoReview3Engine.submit(review,id,ctx.MarcoReview3Data.questions[id].correct);
 page.w.localStorage.setItem(RKEY,JSON.stringify(review));page.w.dispatchEvent(new page.w.StorageEvent('storage',{key:RKEY}));assert.ok(page.d.querySelector('[data-action="start"]'));assert.deepEqual(page.state(),copy(state));
});
