const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),core=require('./core.js'),sync=require('./sync.js');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
const KEY='harry-reading-readtheory-2026-10-21-v1';
function data(includeNew=true){const context={window:{}};for(const file of ['data.js','grade3-practice.js',...(includeNew?['grade4-practice.js','lexile600-practice.js']:[])])vm.runInNewContext(read(file),context);return JSON.parse(JSON.stringify(context.window.READING_ARTICLES));}
const all=data(),added=all.slice(13,23),targeted=all.slice(23);
function boot(t,saved){
  const w=new JSDOM(read('index.html'),{url:'http://localhost/harry-reading/',runScripts:'outside-only'}).window;
  t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false});
  w.fetch=()=>{throw Error('Tests must not contact real learner sync');};
  if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));
  for(const tag of w.document.querySelectorAll('script[defer][src]'))w.eval(read(tag.getAttribute('src').split('?')[0]));
  return {w,d:w.document,saved:()=>JSON.parse(w.localStorage.getItem(KEY)||'null')};
}
function mark(a,phrase){const sentence=core.sentences(a).flat().find(s=>s.text.includes(phrase));assert.ok(sentence,`${a.id}: evidence not in article: ${phrase}`);const start=sentence.text.indexOf(phrase);return {sid:sentence.id,start,end:start+phrase.length};}

test('ten new complete articles add 50 MC questions while all earlier article data stays identical',()=>{
  assert.deepEqual(all.slice(0,13),data(false));assert.equal(all.length,29);assert.equal(added.length,10);
  assert.equal(new Set(all.map(a=>a.id)).size,29);
  assert.equal(all.reduce((n,a)=>n+a.questions.length,0),142);
  assert.equal(new Set(all.flatMap(a=>a.questions.map(q=>q.id))).size,142);
  assert.deepEqual(added.map(a=>a.referenceLexile),[500,530,530,530,610,630,630,640,700,910]);
  for(const a of added){assert.equal(a.questions.length,5);assert.ok(a.paragraphs.length>=4);assert.ok(a.paragraphs.every(p=>p.length>60));assert.equal(a.lexile,null);assert.equal(a.kind,'parallel');assert.ok(a.referenceTitle);assert.match(a.referenceUrl,/^https:\/\/readtheory\.org\/wp-content\/uploads\/2020\/04\/4th-Grade-.+\.pdf$/);}
});

for(const a of [...added,...targeted])for(const q of a.questions)test(`${q.id}: complete MC item and every suggested supporting excerpt occurs in its article`,()=>{
  assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert.ok(q.explanation.length>40);
  const marks=q.evidence.map(options=>{assert.ok(options.length);for(const phrase of options)mark(a,phrase);return mark(a,options[0]);});
  assert.ok(core.quoteMarks(a,marks).length);
  const r=core.prepareRun(a,{id:'check-'+a.id,answers:{}});r.drafts[q.id]={choice:q.answer,marks};
  assert.equal(core.recordCheck(a,q,r,'2026-10-30T18:00:00Z').answerOK,true);
  assert.equal(core.scores(a,r).firstAnswers,1);
});

test('one grade-free list keeps earlier session order and ends with six 600L targets',t=>{
  const b=boot(t),lookup=new Map(all.map(a=>[a.id,a]));
  const cards=Array.from(b.d.querySelectorAll('.practice-group .card'));
  const levels=cards.map(card=>((a)=>a.practiceOrder??a.referenceLexile)(lookup.get(card.querySelector('[data-open]').dataset.open)));
  assert.equal(cards.length,17);assert.deepEqual(levels,[...levels].sort((a,b)=>a-b));
  assert.equal(levels[0],460);assert.equal(levels.at(-1),635);
  assert.equal(b.d.querySelector('#lexile-heading').textContent,'Reading by Lexile');
  assert.doesNotMatch(b.d.body.textContent,/\bGrade\s*[34]\b/i);
  cards.forEach((card,i)=>assert.match(card.querySelector('.eyebrow').textContent,new RegExp(`^Session ${i+4} ·`)));
  assert.match(b.d.querySelector('.practice-group-head').textContent,/17 articles · 87 multiple-choice questions/);
  assert.match(b.d.querySelector('.practice-group .meta').textContent,/have not been measured/);
});

test('all 20 active sessions display every paragraph without exposing an answer key',t=>{
  const b=boot(t);
  for(const a of all.filter(a=>!a.retired)){
    b.d.querySelector(`[data-open="${a.id}"]`).click();
    const actual=Array.from(b.d.querySelectorAll('#passage>p'),p=>Array.from(p.querySelectorAll('.sentence'),s=>s.textContent).join(''));
    assert.deepEqual(actual,a.paragraphs,a.title);
    assert.equal(b.d.querySelectorAll('#answer-form input[name="answer"]').length,4);
    assert.equal(b.d.querySelector('.review-details'),null);
    assert.match(b.d.querySelector('.workspace-head').textContent,new RegExp((a.targetLexile||a.lexile?'Lexile ':'Reference Lexile ')+(a.targetLexile||a.lexile||a.referenceLexile)+'L'));
    b.d.querySelector('#back-home').click();
  }
});

test('a new session retains both tries and highlights through reload and the existing sync format',t=>{
  const b=boot(t),a=added.find(a=>!a.retired),q=a.questions[0];
  b.d.querySelector(`[data-open="${a.id}"]`).click();
  b.d.querySelector(`input[value="${(q.answer+1)%4}"]`).click();
  assert.equal(b.d.querySelector('#check').disabled,true);
  b.d.querySelector('[data-sid="p0s0"]').click();
  b.d.querySelector('#answer-form').dispatchEvent(new b.w.Event('submit',{bubbles:true,cancelable:true}));
  assert.match(b.d.querySelector('.feedback').textContent,/incorrect/);assert.equal(b.d.querySelector('[data-review]'),null);
  b.d.querySelector(`input[value="${q.answer}"]`).click();
  b.d.querySelector('#answer-form').dispatchEvent(new b.w.Event('submit',{bubbles:true,cancelable:true}));
  assert.match(b.d.querySelector('.feedback').textContent,/correct/);
  assert.ok(b.d.querySelector('.review-details').hidden);
  const saved=b.saved(),r=saved.articles[a.id][0];assert.equal(r.answers[q.id].length,2);
  assert.equal(core.scores(a,r).firstAnswers,0);assert.ok(r.answers[q.id][0].marks.length);
  const merged=sync.merge({version:1,articles:{}},saved);assert.deepEqual(merged.articles[a.id][0].answers,r.answers);
  const reload=boot(t,merged);reload.d.querySelector(`[data-open="${a.id}"]`).click();
  assert.match(reload.d.querySelector('.feedback').textContent,/correct/);assert.ok(reload.d.querySelector('#passage mark'));
  assert.doesNotMatch(reload.d.querySelector('.feedback').textContent,/Evidence:|not enough/);
});

test('sorting the expanded list preserves original first answers, highlights and an earlier practice draft',t=>{
  const earlier=all.find(a=>a.id==='practice-ranger'),q=earlier.questions[0];
  const attempt={choice:q.answer,answerOK:true,checkedAt:'2026-10-25T12:00:00Z',marks:[mark(earlier,q.evidence[0][0])]};
  const saved={version:1,articles:{[earlier.id]:[{id:'old-run',startedAt:'2026-10-25T12:00:00Z',position:1,answers:{[q.id]:[attempt]},drafts:{[earlier.questions[1].id]:{choice:2,marks:[mark(earlier,earlier.questions[1].evidence[0][0])]}}}]}};
  const b=boot(t,saved);b.d.querySelector(`[data-open="${earlier.id}"]`).click();
  assert.equal(b.d.querySelector('input:checked').value,'2');assert.ok(b.d.querySelector('#passage mark'));
  assert.deepEqual(b.saved().articles[earlier.id][0].answers[q.id][0],attempt);
  assert.equal(core.scores(earlier,b.saved().articles[earlier.id][0]).firstAnswers,1);
  assert.match(b.d.querySelector('.workspace-head').textContent,/Session 10 ·/);
});

test('all retired editions stay excluded while saved answers and highlights remain reviewable',t=>{
  const ids=['practice-pocket-magnifier','practice-lookout','practice-map-storage','practice-orange','practice-garden-labels','practice-sound-effects','practice-party-dishes','practice-hall-curtains','practice-training-field'];
  assert.deepEqual(all.filter(a=>a.retired).map(a=>a.id),ids);
  const saved={version:1,articles:{}};
  for(const id of ids){const a=all.find(a=>a.id===id),q=a.questions[0];saved.articles[id]=[{id:'saved-'+id,startedAt:'2026-10-30T12:00:00Z',position:0,answers:{[q.id]:[{choice:q.answer,answerOK:true,checkedAt:'2026-10-30T12:01:00Z',marks:[mark(a,q.evidence[0][0])]}]}}];}
  const b=boot(t,saved);
  assert.equal(b.d.querySelectorAll('[data-open]').length,20);
  const labels=Array.from(b.d.querySelectorAll('.card .eyebrow'),el=>Number(el.textContent.match(/^Session (\d+)/)[1]));
  assert.deepEqual(labels,Array.from({length:20},(_,i)=>i+1));
  for(const id of ids){
    assert.equal(b.d.querySelector(`[data-open="${id}"]`),null);
    const before=b.w.localStorage.getItem(KEY);
    b.d.querySelector(`[data-history-review="${id}"]`).click();
    assert.match(b.d.querySelector('.workspace-head').textContent,/Archived practice/);
    assert.equal(b.d.querySelector('#fresh-run'),null);
    assert.ok(b.d.querySelector('#passage mark'));
    assert.equal(b.w.localStorage.getItem(KEY),before);
    assert.deepEqual(b.saved().articles[id],saved.articles[id]);
    b.d.querySelector('#back-home').click();
  }
  const reload=boot(t,b.saved());
  assert.equal(reload.d.querySelectorAll('[data-open]').length,20);
  for(const id of ids)assert.equal(reload.d.querySelector(`[data-open="${id}"]`),null);
});



test('sessions 15–20 have new original content, target labels, and five questions each',t=>{
  const b=boot(t),cards=Array.from(b.d.querySelectorAll('.card'));
  assert.equal(targeted.length,6);
  assert.deepEqual(cards.slice(14).map(c=>c.querySelector('[data-open]').dataset.open),targeted.map(a=>a.id));
  assert.deepEqual(cards.slice(0,14).map(c=>c.querySelector('[data-open]').dataset.open),['carla','fruits','trip','practice-tents','practice-garden-letter','practice-library-map','practice-footbridge','practice-game-rule','practice-book-lamp','practice-ranger','practice-midnight-museum','practice-canoe','practice-bakery','practice-rainy-afternoon']);
  for(const a of targeted){
    assert.equal(a.targetLexile,600);assert.equal(a.lexile,null);assert.equal(a.referenceLexile,undefined);
    assert.equal(a.questions.length,5);assert.equal(a.paragraphs.length,4);
    assert.match(cards.find(c=>c.querySelector('[data-open]').dataset.open===a.id).textContent,/Lexile 600L target/);
  }
});

test('completed older content never marks its replacement complete or copies old answer positions',t=>{
  const old=all.find(a=>a.id==='practice-training-field'),fresh=targeted.find(a=>a.id==='practice-600-training-field');
  const answers=Object.fromEntries(old.questions.map(q=>[q.id,[{choice:q.answer,answerOK:true,checkedAt:'2026-11-01T12:01:00Z',marks:[mark(old,q.evidence[0][0])]}]]));
  const saved={version:1,articles:{[old.id]:[{id:'old-edition',startedAt:'2026-11-01T12:00:00Z',answers}]}};
  core.prepareRun(old,saved.articles[old.id][0]);
  const b=boot(t,saved),card=b.d.querySelector(`[data-open="${fresh.id}"]`).closest('.card');
  assert.equal(card.querySelector('.completion-badge'),null);assert.match(card.textContent,/Start practice/);
  b.d.querySelector(`[data-open="${fresh.id}"]`).click();
  assert.equal(b.d.querySelector('input:checked'),null);assert.equal(b.d.querySelector('#passage mark'),null);
  assert.deepEqual(b.saved().articles[old.id],saved.articles[old.id]);
  assert.deepEqual(b.saved().articles[fresh.id][0].answers,{});
});
