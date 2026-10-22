const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{randomUUID}=require('node:crypto');
const {JSDOM}=require('jsdom');
const read=file=>fs.readFileSync(path.join(__dirname,file),'utf8');
const ctx={crypto:{randomUUID}};for(const file of ['data.js','round2.js','checkpoint-data.js','engine.js'])vm.runInNewContext(read(file),ctx);
const E=ctx.MarcoSkillEngine,KEY='marco-math-skill-builder-oct12-v1';
const past={};past.window=past;vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../2026-09-27/data.js'),'utf8'),past);
const reviewQuestion=line=>line.dataset.sourceCourse==='2026-09-27'?past.MARCO_ISEE_PRACTICE.find(s=>s.id===line.dataset.sourceSession).questions.find(q=>q.source===Number(line.dataset.sourceId)):E.resolve(line.dataset.questionId);
function course(t,query='',state){
 const dom=new JSDOM(read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'http://localhost/'+query,runScripts:'outside-only'}),w=dom.window;
 t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.MarcoSkillSync={APP_ID:KEY};if(state)w.localStorage.setItem(KEY,JSON.stringify(state));
 // Load the page's current data/engine dependencies, including its review gates.
 for(const [,file] of read('index.html').matchAll(/<script defer src="([^"?]+)[^"]*"/g))if(file!=='sync.js'&&!file.includes('../'))w.eval(read(file));
 return {w,d:w.document};
}
test('Review is placed between Set 6 and Set 7, including direct set pages',t=>{
 for(const query of ['', '?set=6','?set=7']){
  const {d}=course(t,query),cards=[...d.querySelectorAll('#sets .set-card')],index=cards.findIndex(a=>a.getAttribute('href')==='review.html');
  assert.equal(cards[index-1].getAttribute('href'),'?set=6');assert.equal(cards[index+1].getAttribute('href'),'review2.html');assert.equal(cards[index+2].getAttribute('href'),'?set=7');
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
  const q=reviewQuestion(line),article=line.closest('.attempt'),toggle=article.querySelector('.answer-reveal');
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
 assert.equal(d.querySelector('.review-next a').getAttribute('href'),'review2.html');
});

test('Added review topics retain actual question text, first wrong answers, and separate sample counts',t=>{
 const dom=new JSDOM(read('review.html')),d=dom.window.document;t.after(()=>dom.window.close());
 assert.equal(d.querySelectorAll('.record').length,15);
 assert.match(d.querySelector('.overall').textContent,/64\/118 = 54%/);
 for(const [id,right,total,choices]of [['proportions',1,4,[0,2,0]],['net',3,6,[0,0,3]]]){
  const record=d.getElementById(id);assert.equal(Number(record.dataset.firstRight),right);assert.equal(Number(record.dataset.questionCount),total);
  const lines=[...record.querySelectorAll('.answer-line')];assert.equal(lines.length,3);
  lines.forEach((line,i)=>{const q=reviewQuestion(line),article=line.closest('.attempt');assert.equal(article.querySelector('.question-prompt').textContent,q.prompt);assert.ok(line.querySelector('.his-answer').textContent.includes('ABCD'[choices[i]]+' · '+q.choices[choices[i]]));assert.equal(Number(article.dataset.correct),q.correct);assert.ok(article.querySelector('.correct-key').textContent.includes(q.explanation));});
 }
});

test('Review practice checks new selections independently and preserves original scores and saved work',t=>{
 let requests=0;const sentinel=JSON.stringify({original:'untouched'});
 const dom=new JSDOM(read('review.html'),{url:'https://test.invalid/review.html',runScripts:'dangerously',beforeParse(w){w.localStorage.setItem(KEY,sentinel);w.fetch=()=>{requests++;throw Error('Review practice must not write to the course API');};}});
 t.after(()=>dom.window.close());const w=dom.window,d=w.document,articles=[...d.querySelectorAll('.attempt')];
 assert.match(d.querySelector('h1').textContent,/goal.*90%/i);
 assert.ok(articles.length>0);
 for(const article of articles){
  const line=article.querySelector('.answer-line'),tryButton=article.querySelector('[data-review-action="try"]'),checkButton=article.querySelector('[data-review-action="check"]');
  assert.ok(line.contains(tryButton));assert.ok(line.contains(checkButton));assert.equal(checkButton.disabled,true);
  assert.ok([...article.querySelectorAll('.review-choice')].every(input=>input.hidden&&input.disabled));
 }
 const article=articles[0],other=articles[1],before=article.querySelector('.his-answer').textContent;
 const scores=[...d.querySelectorAll('.score')].map(e=>e.textContent),tryButton=article.querySelector('[data-review-action="try"]'),check=article.querySelector('[data-review-action="check"]'),feedback=article.querySelector('.practice-feedback'),toggle=article.querySelector('.answer-reveal');
 const q=E.resolve(article.querySelector('[data-question-id]').dataset.questionId);
 const choose=index=>{const input=article.querySelectorAll('.review-choice')[index];input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));};
 tryButton.click();assert.ok([...article.querySelectorAll('.review-choice')].every(input=>!input.hidden&&!input.disabled));assert.equal(check.disabled,true);
 choose((q.correct+1)%4);assert.equal(check.disabled,false);check.click();assert.match(feedback.textContent,/Not quite/);assert.equal(toggle.open,false);
 choose(q.correct);check.click();assert.equal(feedback.textContent,'Correct.');assert.equal(toggle.open,false);assert.ok([...article.querySelectorAll('.review-choice')].every(input=>input.disabled));
 toggle.open=true;tryButton.click();assert.equal(toggle.open,false);assert.equal(article.querySelector('.review-choice:checked'),null);assert.equal(check.disabled,true);
 assert.ok([...other.querySelectorAll('.review-choice')].every(input=>input.hidden&&input.disabled));
 assert.equal(article.querySelector('.his-answer').textContent,before);assert.deepEqual([...d.querySelectorAll('.score')].map(e=>e.textContent),scores);
 assert.equal(w.localStorage.getItem(KEY),sentinel);assert.equal(w.localStorage.length,1);assert.equal(requests,0);
});
