import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom'),read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const APP='marco-vr-kindle-focused-20261024-v1',KEY=APP+':preview';
const scripts=['../kindle-tests-1-2/data.js','../kindle-tests-1-8/questions.js','../kindle-tests-1-8/data.js','pdf-data.js','data.js','../../marco-daily-test-review/2026-10-11/engine.js','../kindle-tests-1-2/thinking.js','../kindle-tests-1-2/clues.js','../kindle-tests-1-2/sync.js'];
const plain=x=>JSON.parse(JSON.stringify(x));
function page(t,n=1,saved,library=false,view=''){
 const name=library?'../index.html':'practice.html',dom=new JSDOM(read(name),{url:`https://example.test/marco-vr-practice/kindle-vr-focused/${name}?page=${n}&demo=1${view?'&view='+view:''}`,runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};let network=0;w.fetch=()=>{network++;throw Error('No preview network');};
 for(const id of ['marco-vr-kindle-tests1-2-hard-20261024-v1','marco-vr-kindle-tests1-8-hard-20261024-v1'])w.localStorage.setItem(id,'legacy sentinel');
 if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));for(const f of scripts)w.eval(read(f));w.eval(read(library?'library.js':'practice.js'));
 return {w,doc:w.document,bank:w.MARCO_ISEE_PRACTICE,session:w.MARCO_ISEE_PRACTICE[n-1],E:w.MarcoTest3Engine,S:w.MarcoTest3Sync,state:()=>JSON.parse(w.localStorage.getItem(KEY)||'null'),network:()=>network};
}
function reveal(p,i=1){p.doc.querySelector(`#q-${i} .prediction-form button`).click();}
function answer(p,i,choice){const card=p.doc.querySelector(`#q-${i}`),el=card.querySelector(`[name=answer][value="${choice}"]`);assert.ok(el&&!el.disabled);el.checked=true;el.dispatchEvent(new p.w.Event('change',{bubbles:true}));card.querySelector('.answer-form').dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}
function source(p,i=1){return p.session.questions.find(q=>q.source===Number(p.doc.querySelector(`#q-${i}`).dataset.source));}

test('245 unique questions, exact retained originals, 172 keyed PDF additions, pages 40/40/40/40/40/45',t=>{
 const p=page(t),all=p.bank.flatMap(s=>s.questions);assert.deepEqual(plain(p.bank.map(s=>s.questions.length)),[40,40,40,40,40,45]);assert.equal(all.length,245);assert.equal(new Set(all.map(q=>q.source)).size,245);assert.equal(all.filter(q=>q.type==='synonym').length,168);assert.equal(all.filter(q=>q.type!=='synonym').length,77);assert.equal(all.filter(q=>q.test<=8).length,73);assert.equal(all.filter(q=>q.test>=9).length,172);
 const legacy=new JSDOM('',{runScripts:'outside-only'});t.after(()=>legacy.window.close());for(const f of scripts.slice(0,3))legacy.window.eval(read(f));const old=legacy.window.MARCO_ISEE_PRACTICE.flatMap(s=>s.questions);
 for(const q of all.filter(q=>q.test<=8))assert.deepEqual(plain(q),plain(old.find(x=>x.source===q.source)));
 for(const q of all){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(q.correct>=0&&q.correct<4);for(const k of ['meaning','tip','explanation','evidence','skill'])assert.ok(q[k].length>8,`${q.source} ${k}`);assert.doesNotMatch(q.explanation,/Section [1-5]:|Part (One|Two)|\uFFFD/);}
 const pdf=all.filter(q=>q.test>=9);assert.equal(pdf.filter(q=>q.type==='synonym').length,121);assert.equal(pdf.filter(q=>q.type!=='synonym').length,51);assert.ok(pdf.every(q=>q.pdfPage>=3&&q.pdfPage<=720));assert.ok(pdf.every(q=>q.explanationOrigin==='PDF answer key'));assert.equal(p.S.APP_ID,APP);
 for(const [word,match]of [['husband',/conserve/i],['buffet',/strike/i],['ingenuous',/innocent/i],['nominal',/name only/i],['temper',/moderate/i]])assert.match(all.find(q=>q.word===word).tip,match);
});

for(const [n,total]of [[1,40],[2,40],[3,40],[4,40],[5,40],[6,45]])test(`page ${n}: ${total} items, synonyms first, two tries, no timer, saved on reload`,t=>{
 const p=page(t,n),cards=[...p.doc.querySelectorAll('article.question')];assert.equal(cards.length,total);assert.equal(p.doc.querySelectorAll('.jump a').length,total);assert.equal(p.doc.querySelectorAll('.page-tabs a').length,6);assert.match(p.doc.querySelector('#page-title').textContent,new RegExp(`Page ${n}.*${total}`));assert.equal(p.doc.querySelectorAll('textarea,[required],.solution').length,0);
 let sentences=false;for(const card of cards){const q=p.session.questions.find(q=>q.source===Number(card.dataset.source));if(q.type==='synonym'){assert.equal(sentences,false);assert.equal(card.querySelector('.prompt').textContent,q.word.toUpperCase());}else{sentences=true;assert.match(card.querySelector('.sentence-prediction-guide').textContent,/Highlight the key words.*rest of the sentence.*contrast.*opposite/);assert.equal(card.querySelector('.prediction-input'),null);assert.ok(card.querySelector('[data-clue]'));}}
 assert.equal(sentences,true);const q=source(p);reveal(p);assert.deepEqual([...p.doc.querySelectorAll('#q-1 .choice-text')].map(x=>x.textContent),plain(q.choices));answer(p,1,(q.correct+1)%4);assert.equal(p.doc.querySelector('#q-1 .solution'),null);assert.match(p.doc.querySelector('#q-1 .feedback').textContent,/Not quite/);answer(p,1,q.correct);assert.ok(p.doc.querySelector('#q-1 .trick'));assert.ok(p.doc.querySelector('#q-1 .source-evidence'));assert.match(p.doc.querySelector('.run-score').textContent,new RegExp('0/'+total));assert.equal(p.network(),0);assert.ok(p.S.valid(p.state()));
 const again=page(t,n,p.state());assert.ok(again.doc.querySelector('#q-1 .solution'));for(const id of ['marco-vr-kindle-tests1-2-hard-20261024-v1','marco-vr-kindle-tests1-8-hard-20261024-v1'])assert.equal(again.w.localStorage.getItem(id),'legacy sentinel');
});

test('correct first try reveals explanation; editable optional prediction does not change answers',t=>{
 const p=page(t),input=p.doc.querySelector('#q-1 .prediction-input');input.value='original';input.dispatchEvent(new p.w.Event('input',{bubbles:true}));reveal(p);const q=source(p);answer(p,1,q.correct);assert.ok(p.doc.querySelector('#q-1 .solution'));const before=JSON.stringify(p.state().sessions[p.session.id][0].answers);
 p.doc.querySelector('#q-1 [data-edit-prediction]').click();assert.equal(p.doc.querySelector('#q-1 .solution'),null);const edit=p.doc.querySelector('#q-1 .prediction-input');edit.value='revised';edit.dispatchEvent(new p.w.Event('input',{bubbles:true}));reveal(p);const r=p.state().sessions[p.session.id][0];assert.equal(JSON.stringify(r.answers),before);assert.equal(r.thinking[q.source].committed.prediction,'original');assert.equal(r.thinking[q.source].revised.prediction,'revised');assert.ok(p.S.valid(p.state()));
});

test('six-page two-device merge preserves histories and keeps scores isolated',t=>{
 const a=page(t,1),b=page(t,6);for(const p of [a,b]){reveal(p);answer(p,1,source(p).correct);}
 const combined=a.S.merge(a.state(),b.state());assert.ok(a.S.valid(combined));assert.equal(Object.keys(combined.sessions).length,2);const next=page(t,6,combined);assert.match(next.doc.querySelector('.run-score').textContent,/1\/45/);const before=JSON.stringify(combined.sessions[next.session.id][0]);next.doc.querySelector('[data-action=restart]').click();assert.equal(next.state().sessions[next.session.id].length,2);assert.equal(JSON.stringify(next.state().sessions[next.session.id][0]),before);assert.ok(next.state().sessions[a.session.id]);
});

test('only finished page turns green in tabs and library; library opens without creating runs',t=>{
 const p=page(t,6),r=p.E.start(p.session);r.thinking={};for(const q of p.session.questions)p.E.submit(r,q,q.correct);r.completedAt=new Date().toISOString();const saved={version:1,sessions:{[p.session.id]:[r]}};assert.ok(p.S.valid(saved));
 const next=page(t,6,saved);assert.ok(next.doc.querySelector('#practice-status.is-complete'));assert.ok(next.doc.querySelector('[data-page-tab="6"].is-complete'));assert.equal(next.doc.querySelectorAll('.page-tabs .is-complete').length,1);const lib=page(t,1,saved,true);assert.match(lib.doc.querySelector('#kindle-focused-status').textContent,/45\/245 finished/);assert.equal(lib.doc.querySelector('#kindle-focused-card').classList.contains('is-complete'),false);assert.equal(lib.network(),0);const empty=page(t,1,undefined,true);assert.equal(empty.state(),null);
});

test('hub opens focused course; archives and all local assets resolve; no timing/elimination requirement',t=>{
 const hub=new JSDOM(read('../index.html'));t.after(()=>hub.window.close());assert.equal(hub.window.document.querySelector('#kindle-focused-card').getAttribute('href'),'./kindle-vr-focused/practice.html?page=1');
 for(const f of ['index.html','practice.html','../kindle-tests-1-8/index.html','../kindle-tests-1-2/index.html','../index.html']){const dom=new JSDOM(read(f));for(const el of dom.window.document.querySelectorAll('[src],[href]')){const raw=el.getAttribute('src')||el.getAttribute('href');if(!raw||raw.startsWith('#')||/^(https?:|data:)/.test(raw))continue;assert.ok(existsSync(new URL(raw.split(/[?#]/)[0],new URL(f,import.meta.url))),`${f}: ${raw}`);}dom.window.close();}
 assert.match(read('practice.html'),/kindle-tests-1-8/);assert.match(read('practice.html'),/kindle-tests-1-2/);
 const redirect=read('index.html').match(/<script>([\s\S]*?)<\/script>/)[1];for(const query of ['', '?demo=1', '?page=4&demo=1']){let destination;runInNewContext(redirect,{URL,location:{href:'https://example.test/kindle-vr-focused/'+query+'#previous-practice',search:query,hash:'#previous-practice',replace:url=>destination=url}});const target=new URL(destination);assert.equal(target.pathname,'/kindle-vr-focused/practice.html');assert.equal(target.searchParams.get('page'),query.includes('page=4')?'4':'1');assert.equal(target.hash,'#previous-practice');if(query.includes('demo'))assert.equal(target.searchParams.get('demo'),'1');}
assert.doesNotMatch(read('practice.js'),/setInterval|timer\b|Eliminate two choices/);assert.match(read('practice.js'),/Eliminating choices is optional/);
});

test('focused sentence highlights save and revise without changing its first wrong answer',t=>{
 const p=page(t),el=p.doc.querySelector('.prompt.completion').closest('article'),i=Number(el.id.slice(2)),q=source(p,i);
 el.querySelector('[data-clue="0"]').click();reveal(p,i);answer(p,i,(q.correct+1)%4);const first=JSON.stringify(p.state().sessions[p.session.id][0].answers);
 p.doc.querySelector(`#q-${i} [data-edit-prediction]`).click();p.doc.querySelector(`#q-${i} [data-clue="1"]`).click();reveal(p,i);assert.equal(p.doc.querySelectorAll(`#q-${i} .clue-highlight`).length,2);assert.equal(JSON.stringify(p.state().sessions[p.session.id][0].answers),first);assert.equal(p.doc.querySelector(`#q-${i} .solution`),null);assert.ok(p.S.valid(p.state()));const next=page(t,1,p.state());assert.equal(next.doc.querySelectorAll(`#q-${i} .clue-highlight`).length,2);assert.equal(next.network(),0);
});

test('first-run review keeps all 21 original misses despite later perfect runs; read-only, answers collapsed',t=>{
 const p=page(t),first=p.E.start(p.session,'2026-10-25T16:00:00.000Z'),later=p.E.start(p.session,'2026-10-26T17:00:00.000Z');
 first.thinking={};later.thinking={};
 p.session.questions.forEach((q,i)=>{p.E.submit(first,q,i<21?(q.correct+1)%4:q.correct);if(i<21)p.E.submit(first,q,i<9?q.correct:(q.correct+2)%4);p.E.submit(later,q,q.correct);});
 first.completedAt='2026-10-25T17:00:00.000Z';later.completedAt='2026-10-26T18:00:00.000Z';
 const saved={version:1,sessions:{[p.session.id]:[first,later]}};assert.ok(p.S.valid(saved));
 const before=JSON.stringify(saved),review=page(t,1,saved,false,'first-wrongs');
 assert.equal(review.doc.querySelectorAll('.first-wrong-question').length,21);
 assert.equal(review.doc.querySelectorAll('.first-wrong-choice').length,21);
 assert.equal(review.doc.querySelectorAll('.review-solution').length,21);
 assert.equal(review.doc.querySelectorAll('.review-solution[open]').length,0);
 assert.equal(review.doc.querySelectorAll('form,input:not(:disabled),[data-action]').length,0);
 assert.match(review.doc.querySelector('#practice-status').textContent,/19\/40.*21 first-answer misses.*9 corrected.*12 still wrong/);
 assert.match(review.doc.querySelector('#run-views').textContent,/First-run wrongs \(21\)/);
 assert.ok([...review.doc.querySelectorAll('[data-page-tab]')].every(a=>a.href.includes('view=first-wrongs')));
 const expected=p.session.questions.slice(0,21).map(q=>q.source).sort((a,b)=>a-b),actual=[...review.doc.querySelectorAll('.first-wrong-question')].map(el=>Number(el.dataset.source)).sort((a,b)=>a-b);assert.deepEqual(actual,plain(expected));
 review.doc.querySelector('.review-solution summary').click();assert.ok(review.doc.querySelector('.review-solution[open]'));assert.match(review.doc.querySelector('.review-solution .solution').textContent,/Answer:.*TRICK \/ EXPLANATION/s);
 review.doc.querySelector('[data-question]').click();assert.match(review.w.location.search,/view=first-wrongs/);assert.ok(review.w.location.hash);
 assert.equal(JSON.stringify(review.state()),before);assert.equal(review.network(),0);
 const full=page(t,1,saved);assert.match(full.doc.querySelector('.run-score').textContent,/40\/40/);assert.equal(full.doc.querySelectorAll('article.question').length,40);assert.match(full.doc.querySelector('#run-views').textContent,/First-run wrongs \(21\)/);
});

test('full first-run format shows original prediction/categories and per-attempt eliminations without editing history',t=>{
 const p=page(t),ordered=[...p.session.questions.filter(q=>q.type==='synonym'),...p.session.questions.filter(q=>q.type!=='synonym')],q=ordered[0],sentence=ordered.find(q=>q.type!=='synonym'),r=p.E.start(p.session,'2026-10-25T16:00:00.000Z'),later=p.E.start(p.session,'2026-10-26T17:00:00.000Z'),T=p.w.KindleVRThinking;
 r.thinking={};later.thinking={};
 for(const item of [q,sentence]){const n=T.make();T.touch(n,{prediction:item===q?'my first idea':'original sentence idea',tone:'bad',strength:'weak',link:'opposite',clues:item===sentence?[0,1]:[]});T.commit(item,n);T.revise(item,n,{prediction:'later changed idea',tone:'good',strength:'strong',link:'same',clues:[2]});r.thinking[item.source]=n;p.E.submit(r,item,(item.correct+1)%4);r.answers[item.source].attempts[0].eliminated=[(item.correct+2)%4];p.E.submit(r,item,item.correct);r.answers[item.source].attempts[1].eliminated=[(item.correct+1)%4,(item.correct+3)%4];p.E.submit(later,item,item.correct);const other=T.make();T.touch(other,{prediction:'not from run one',tone:'good',strength:'strong'});T.commit(item,other);later.thinking[item.source]=other;}
 const saved={version:1,sessions:{[p.session.id]:[r,later]}};assert.ok(p.S.valid(saved));const before=JSON.stringify(saved),review=page(t,1,saved,false,'first-wrongs'),card=review.doc.querySelector('#q-1');
 assert.match(card.querySelector('.saved-prediction').textContent,/my first idea/);assert.equal(card.querySelector('[name="review-'+q.source+'-tone"]:checked').value,'bad');assert.equal(card.querySelector('[name="review-'+q.source+'-strength"]:checked').value,'weak');assert.match(card.querySelector('.review-revision').textContent,/later changed idea/);assert.doesNotMatch(card.textContent,/not from run one/);
 assert.equal(card.querySelector('.choices input:checked').value,String((q.correct+1)%4));assert.equal(card.querySelectorAll('.choice-row.eliminated').length,1);assert.equal(card.querySelector('.choice-row.eliminated').dataset.recordedChoice,String((q.correct+2)%4));assert.match(card.querySelector('.review-cut-status.is-eliminated').textContent,/Eliminated/);
 card.querySelector('[data-review-attempt="1"]').click();const second=review.doc.querySelector('#q-1');assert.equal(second.querySelector('.choices input:checked').value,String(q.correct));assert.equal(second.querySelectorAll('.choice-row.eliminated').length,2);assert.match(second.querySelector('.review-elimination-note').textContent,/automatically ruled out/);assert.equal(second.querySelector('.review-attempt-tabs [aria-pressed=true]').dataset.reviewAttempt,'1');assert.ok(second.querySelector('.choice.correct'));second.querySelector('[data-review-attempt="0"]').click();assert.equal(review.doc.querySelector('#q-1 .choices input:checked').value,String((q.correct+1)%4));
 const sc=review.doc.querySelector(`[data-source="${sentence.source}"]`);assert.equal(sc.querySelectorAll('.prompt .clue-highlight').length,2);assert.equal(sc.querySelector('.review-prediction input:checked').value,'opposite');assert.match(sc.querySelector('.legacy-prediction').textContent,/original sentence idea/);assert.equal(sc.querySelector('.review-revision[open]'),null);
 assert.equal(review.doc.querySelectorAll('input:not(:disabled),form,[data-action],[data-edit-prediction],[data-eliminate]').length,0);assert.equal(JSON.stringify(review.state()),before);assert.equal(review.network(),0);
});

test('first-run review handles unstarted pages and protects an unused second chance',t=>{
 const p=page(t),empty=page(t,1,undefined,false,'first-wrongs');assert.equal(empty.state(),null);assert.match(empty.doc.querySelector('#workspace').textContent,/No saved first run/);assert.equal(empty.doc.querySelectorAll('article.question,form,input,[data-action]').length,0);
 const run=p.E.start(p.session),q=p.session.questions[0];p.E.submit(run,q,(q.correct+1)%4);const saved={version:1,sessions:{[p.session.id]:[run]}};
 const review=page(t,1,saved,false,'first-wrongs');assert.equal(review.doc.querySelectorAll('.first-wrong-question').length,1);assert.equal(review.doc.querySelectorAll('.review-solution,.solution').length,0);assert.match(review.doc.querySelector('.answer-locked').textContent,/hidden until the second try/);assert.equal(new URL(review.doc.querySelector('.answer-locked a').href).searchParams.has('view'),false);assert.match(review.doc.querySelector('.review-elimination-note').textContent,/No elimination snapshot/);assert.ok([...review.doc.querySelectorAll('.review-cut-status')].every(el=>el.textContent==='Not recorded'));assert.equal(JSON.stringify(review.state()),JSON.stringify(saved));
});
