const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {JSDOM}=require('jsdom'),Core=require('./quiz-core.js');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),clone=x=>JSON.parse(JSON.stringify(x));
const context={window:{}};for(const f of ['mixed-data.js','round1-review-data.js','review5-data.js'])vm.runInNewContext(read(f),context);
const source=context.window.MARCO_ROUND1_REVIEW,focused=context.window.MARCO_REVIEW5,KEY='marco-zozeck-mixed-360-v1:progress';
function browser(progress,url='https://example.org/',selected){
 const dom=new JSDOM('<main id="app"></main>',{url,runScripts:'outside-only'}),w=dom.window;w.HTMLElement.prototype.scrollIntoView=()=>{};let options;
 w.MarcoOnlineSync={create:o=>(options=o,{start:()=>{},push:()=>{},stop:()=>{}})};
 if(progress)w.localStorage.setItem(KEY,JSON.stringify(progress));if(selected)w.localStorage.setItem('marco-zozeck-mixed-360-v1:selection',String(selected));
 for(const f of ['mixed-data.js','round1-review-data.js','review5-data.js','quiz-core.js','mixed-app.js'])w.eval(read(f));
 return {w,d:w.document,state:()=>JSON.parse(w.localStorage.getItem(KEY)),get options(){return options;},close:()=>w.close()};
}
function answer(b,q,value){const card=b.d.getElementById('q-'+q.id);[...card.querySelectorAll('[data-choice]')].find(e=>e.dataset.choice===value).click();card.querySelector('[data-check]').click();}
const session=n=>focused.questions.filter(q=>q.session===n);
function oldPartial(){const p=Core.blank(),q=context.window.MARCO_MIXED_VR.questions[0];Core.start(p,1,[q.id],'2026-10-01T12:00:00Z');Core.answer(p,1,q.answer,[q],'2026-10-01T12:01:00Z',q.id);return p;}

test('frozen Review 5 contains exactly the remaining 105, with untouched source content and 97 excluded maintenance items',()=>{
 assert.equal(focused.questions.length,105);assert.deepEqual(clone(focused.metadata.sessions.map(s=>s.questionCount)),[40,40,25]);
 assert.deepEqual(clone(focused.metadata.selectionCounts),{priority:45,improving:22,recheck:38,maintenance:97});
 const selected=focused.questions.map(q=>q.sourceReviewQuestionId),excluded=focused.metadata.maintenanceQuestionIds;
 assert.equal(new Set([...selected,...excluded]).size,202);assert.equal(excluded.length,97);assert.equal(selected.filter(id=>excluded.includes(id)).length,0);
 assert.deepEqual([...selected,...excluded].sort(),clone(source.questions.map(q=>q.id).sort()));
 assert.equal(focused.questions.filter(q=>q.quizType==='synonym').length,99);assert.equal(focused.questions.filter(q=>q.quizType==='completion').length,6);
 for(const s of focused.metadata.sessions){assert.equal(session(s.number).length,s.questionCount);assert.equal(session(s.number).filter(q=>q.quizType==='completion').length,2);assert.equal(new Set(session(s.number).map(q=>q.review5Category)).size,3);}
 for(const q of focused.questions){const original=source.questions.find(s=>s.id===q.sourceReviewQuestionId);assert.equal(q.id,original.id.replace(/^r1-/,'r5-'));for(const key of ['word','quizType','answer','meaning','explanation','trick','difficulty','sourceQuestionId'])assert.equal(q[key],original[key]);assert.deepEqual(clone(q.choices),clone(original.choices));}
 assert.ok(focused.questions.some(q=>q.word==='VERSATILE'));assert.ok(!focused.questions.some(q=>q.word==='MERIT'));
 assert.match(read('index.html'),/review5-data.js\?v=20261024-review5-v1/);
});

test('selection builder reproduces the agreed partition from separate first-pass evidence, not correction rounds',async()=>{
 const {buildReview5}=await import('./build-review5-data.mjs'),state=Core.blank(),category=new Map(focused.questions.map(q=>[q.sourceReviewQuestionId,q.review5Category]));
 for(const q of source.questions){const group=category.get(q.id)||'maintenance';for(const cycle of [1,2]){const key=q.session+(cycle-1)*100,id=q.id.replace(/^r1-/,`r${cycle}-`);state.sessions[key]??={rounds:[{number:1,ids:[],answers:{}}]};const r=state.sessions[key].rounds[0];r.ids.push(id);r.answers[id]={choice:group==='priority'||group==='improving'&&cycle===1?'test-only wrong choice':q.answer,correct:group!=='priority'&&!(group==='improving'&&cycle===1),at:cycle===1?'2026-10-01T10:00:00Z':group==='recheck'?'2026-10-01T11:00:00Z':'2026-10-04T10:00:00Z'};}}
 const built=buildReview5({version:2110,updatedAt:'2026-10-18T18:59:33Z',state},source);
 assert.deepEqual(clone(built.questions.map(q=>q.sourceReviewQuestionId).sort()),clone(focused.questions.map(q=>q.sourceReviewQuestionId).sort()));
 assert.equal(built.metadata.maintenanceCount,97);
});

test('clean landing shows only Review 5 and never auto-starts; incomplete previous work does not gate it',()=>{
 const p=oldPartial(),frozen=JSON.stringify(p),b=browser(p,undefined,401);
 try{assert.deepEqual([...b.d.querySelectorAll('[data-session]')].map(e=>+e.dataset.session),[501,502,503]);assert.match(b.d.querySelector('h1').textContent,/Review 5/);assert.equal(b.d.querySelectorAll('.question-item').length,0);assert.equal(JSON.stringify(b.state()),frozen);assert.equal(b.state().sessions[501],undefined);assert.equal(b.options.appId,'marco-zozeck-mixed-360-v1');assert.ok(b.d.querySelector('[data-start]'));b.d.querySelector('[data-start]').click();assert.equal(b.d.querySelectorAll('.question-item').length,40);assert.equal(b.state().sessions[501].rounds[0].timeLimitSeconds,undefined);assert.equal(b.state().sessions[501].rounds[0].deadlineAt,undefined);assert.equal(JSON.stringify(b.state().sessions[1]),JSON.stringify(p.sessions[1]));assert.equal(b.d.querySelectorAll('[data-clock],.timer-bar').length,0);}finally{b.close();}
});

test('top archive switch preserves all earlier keys and current answers; old direct links still open previous practice',()=>{
 const p=oldPartial(),b=browser(p);try{
  b.d.querySelector('[data-start]').click();const q=session(501)[0];answer(b,q,q.answer);const frozen=JSON.stringify(b.state());
  b.d.querySelector('[data-library="previous"]').click();assert.match(b.d.querySelector('h1').textContent,/Previous practice/);assert.equal(b.d.querySelectorAll('[data-session]').length,29);assert.equal(b.d.querySelector('[data-session="501"]'),null);assert.ok(b.d.querySelector('.archive-intro a[href="./archive/"]'));assert.equal(JSON.stringify(b.state()),frozen);
  b.d.querySelector('[data-library="current"]').click();assert.deepEqual([...b.d.querySelectorAll('[data-session]')].map(e=>+e.dataset.session),[501,502,503]);assert.equal(b.w.location.search,'?review5=1');assert.equal(JSON.stringify(b.state()),frozen);assert.ok(b.d.getElementById('q-'+q.id).classList.contains('answered-correct'));
  const old=browser(b.state(),'https://example.org/?review4=2');try{assert.match(old.d.querySelector('h1').textContent,/Previous practice/);assert.ok(old.d.querySelector('[data-session="402"]').classList.contains('selected'));assert.equal(old.d.querySelector('[data-session="501"]'),null);assert.equal(JSON.stringify(old.state()),frozen);}finally{old.close();}
 }finally{b.close();}
});

test('Review 5 retries only its misses, reveals tricks after second try, preserves first score and turns green',()=>{
 const p=oldPartial(),old=JSON.stringify(p.sessions),b=browser(p),qs=session(501);
 try{b.d.querySelector('[data-start]').click();for(const [i,q]of qs.entries())answer(b,q,i===0?q.choices.find(c=>c!==q.answer):q.answer);assert.equal(b.d.querySelectorAll('.number-grid .answered-wrong').length,1);assert.equal(b.d.getElementById('q-'+qs[0].id).querySelector('.solution'),null);b.d.querySelector('[data-submit]').click();assert.equal(b.d.querySelectorAll('.question-item').length,1);assert.equal(b.state().sessions[501].rounds[1].ids[0],qs[0].id);assert.equal(b.d.querySelectorAll('.solution').length,0);answer(b,qs[0],qs[0].choices.find(c=>c!==qs[0].answer));assert.match(b.d.querySelector('.solution').textContent,/Trick:/);b.d.querySelector('[data-submit]').click();answer(b,qs[0],qs[0].answer);b.d.querySelector('[data-submit]').click();assert.ok(b.d.querySelector('[data-session="501"]').classList.contains('mastered'));assert.match(b.d.querySelector('[data-session="501"]').textContent,/39\/40 correct/);assert.ok(!b.d.querySelector('[data-session="502"]').classList.contains('session-locked'));assert.ok(b.d.querySelector('[data-session="503"]').classList.contains('session-locked'));const saved=b.state();delete saved.sessions[501];assert.equal(JSON.stringify(saved.sessions),old);}finally{b.close();}
});

test('Review 5 gates only its own earlier sessions and supports independent cross-device updates and reloads',()=>{
 const p=oldPartial(),a=browser(p),b=browser(p);try{
  b.d.querySelector('[data-session="502"]').click();assert.ok(b.d.querySelector('.session-lock'));assert.equal(b.d.querySelector('[data-start]'),null);assert.equal(b.state().sessions[502],undefined);
  b.d.querySelector('[data-session="501"]').click();a.d.querySelector('[data-start]').click();const q=session(501)[0];answer(a,q,q.answer);b.options.onRemote(a.state());assert.ok(b.d.getElementById('q-'+q.id).classList.contains('answered-correct'));assert.equal(JSON.stringify(b.state().sessions[1]),JSON.stringify(p.sessions[1]));
  const reload=browser(b.state(),'https://example.org/?review5=1');try{assert.deepEqual([...reload.d.querySelectorAll('.question-item')].map(c=>c.id),[...b.d.querySelectorAll('.question-item')].map(c=>c.id));assert.equal(JSON.stringify(reload.state()),JSON.stringify(b.state()));}finally{reload.close();}
 }finally{a.close();b.close();}
});

test('the last session opens all 25 original copies after only the two new sessions are completed',()=>{
 const p=oldPartial();for(const key of [501,502]){const qs=session(key);Core.start(p,key,qs.map(q=>q.id),'2026-10-24T18:00:00Z');for(const q of qs)Core.answer(p,key,q.answer,focused.questions,'2026-10-24T18:01:00Z',q.id);Core.finishRound(p,key,'2026-10-24T18:02:00Z');}
 const b=browser(p,'https://example.org/?review5=3');try{assert.equal(b.state().sessions[503],undefined);assert.ok(b.d.querySelector('[data-start]'));b.d.querySelector('[data-start]').click();assert.equal(b.d.querySelectorAll('.question-item').length,25);assert.deepEqual(b.state().sessions[503].rounds[0].ids,clone(session(503).map(q=>q.id)));assert.equal(b.state().sessions[404],undefined);assert.equal(b.state().sessions[1].completedAt,null);}finally{b.close();}
});
