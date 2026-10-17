const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto');
const {JSDOM}=require('jsdom');
const read=file=>fs.readFileSync(path.join(__dirname,file),'utf8');
const ctx={crypto:{randomUUID}};for(const file of ['data.js','round2.js','engine.js'])vm.runInNewContext(read(file),ctx);
const E=ctx.MarcoSkillEngine,KEY='marco-math-skill-builder-oct12-v1';
function course(t,query='',state){
 const dom=new JSDOM(read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'http://localhost/'+query,runScripts:'outside-only'}),w=dom.window;
 t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.MarcoSkillSync={APP_ID:KEY};if(state)w.localStorage.setItem(KEY,JSON.stringify(state));
 for(const file of ['data.js','round2.js','engine.js','app.js'])w.eval(read(file));
 return {w,d:w.document};
}
test('Review is placed between Set 6 and Set 7, including direct set pages',t=>{
 for(const query of ['', '?set=6','?set=7']){
  const {d}=course(t,query),cards=[...d.querySelectorAll('#sets .set-card')],index=cards.findIndex(a=>a.getAttribute('href')==='review.html');
  assert.equal(cards[index-1].getAttribute('href'),'?set=6');assert.equal(cards[index+1].getAttribute('href'),'?set=7');
 }
});
test('Completing core practice leads to review without changing saved answers',t=>{
 const state=E.empty(),at='2026-10-16T18:00:00.000Z';
 for(let n=1;n<=6;n++){const r=E.start(n,state,at);state.sessions['set-'+n]=[r];for(const id of r.questionIds)E.submit(r,id,E.resolve(id).correct,at);}
 assert.ok(E.valid(state));
 for(const query of ['','?set=6']){
  const {w,d}=course(t,query,state);
  assert.ok(d.querySelector('#content a.primary[href="review.html"]'));
  assert.deepEqual(JSON.parse(w.localStorage.getItem(KEY)),JSON.parse(JSON.stringify(state)));
 }
});
test('Review lists only wrong first answers, sorts by accuracy, and hides each answer key',t=>{
 const dom=new JSDOM(read('review.html')),d=dom.window.document;t.after(()=>dom.window.close());
 const lines=[...d.querySelectorAll('.answer-line[data-question-id]')],ids=lines.map(e=>e.dataset.questionId);
 assert.ok(lines.length>0);assert.equal(new Set(ids).size,ids.length);assert.ok(lines.every(e=>e.dataset.firstCorrect==='false'));
 for(const section of d.querySelectorAll('section[id^="skill-"]')){
  const records=[...section.querySelectorAll('.record')],scores=records.map(r=>Number(r.dataset.firstRight)/Number(r.dataset.questionCount));
  assert.deepEqual(scores,[...scores].sort((a,b)=>a-b));assert.ok(scores.every(score=>score<.8));
  for(const record of records)assert.equal(record.querySelectorAll('.answer-line[data-question-id]').length,Number(record.dataset.missedCount));
 }
 for(const line of lines){
  const q=E.resolve(line.dataset.questionId),article=line.closest('.attempt'),toggle=article.querySelector('.answer-reveal');
  assert.ok(toggle);assert.equal(toggle.open,false);
  assert.match(toggle.textContent,new RegExp('Correct answer: '+ 'ABCD'[q.correct].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  const chosen=/His wrong answer:\s*([ABCD])/.exec(line.textContent);assert.ok(chosen);assert.notEqual(chosen[1],'ABCD'[q.correct]);
 }
 const record=d.querySelector('.record'),fold=record.querySelector('summary');
 assert.match(fold.textContent,/Open \d+ missed questions?/);assert.match(fold.textContent,/Collapse questions/);
 fold.click();assert.equal(record.open,true);fold.click();assert.equal(record.open,false);
 const toggle=d.querySelector('.answer-reveal'),summary=toggle.querySelector('summary');
 summary.click();assert.equal(toggle.open,true);summary.click();assert.equal(toggle.open,false);
 assert.equal(d.querySelector('.review-nav a').getAttribute('href'),'./?set=6');
 assert.equal(d.querySelector('.review-next a').getAttribute('href'),'./?set=7');
});
