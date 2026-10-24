import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom'),read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const KEY='marco-vr-kindle-tests1-8-hard-20261024-v1:preview';
const scripts=['../kindle-tests-1-2/data.js','questions.js','data.js','../../marco-daily-test-review/2026-10-11/engine.js','../kindle-tests-1-2/thinking.js','../kindle-tests-1-2/sync.js'];
function page(t,n=1,saved,library=false){
  const name=library?'index.html':`page-${n}.html`,dom=new JSDOM(read(name),{url:`https://example.test/marco-vr-practice/kindle-tests-1-8/${name}?demo=1`,runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};let network=0;w.fetch=()=>{network++;throw Error('No preview network');};
  w.localStorage.setItem('marco-vr-kindle-tests1-2-hard-20261024-v1','legacy sentinel');if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));for(const f of scripts)w.eval(read(f));w.eval(read(library?'library.js':'practice.js'));
  return {w,doc:w.document,bank:w.MARCO_ISEE_PRACTICE,session:w.MARCO_ISEE_PRACTICE[n-1],E:w.MarcoTest3Engine,S:w.MarcoTest3Sync,state:()=>JSON.parse(w.localStorage.getItem(KEY)||'null'),network:()=>network};
}
function reveal(p,i=1){p.doc.querySelector(`#q-${i} .prediction-form button`).click();}
function answer(p,i,choice){const card=p.doc.querySelector(`#q-${i}`),el=card.querySelector(`[name=answer][value="${choice}"]`);assert.ok(el&&!el.disabled);el.checked=true;el.dispatchEvent(new p.w.Event('change',{bubbles:true}));card.querySelector('.answer-form').dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}
const plain=x=>JSON.parse(JSON.stringify(x));
test('146 unique source questions: original 24 preserved exactly plus 122 new; pages 40/40/66',t=>{
 const p=page(t),all=p.bank.flatMap(s=>s.questions);assert.deepEqual(plain(p.bank.map(s=>s.questions.length)),[40,40,66]);assert.equal(all.length,146);assert.equal(new Set(all.map(q=>q.source)).size,146);assert.equal(all.filter(q=>q.type==='synonym').length,94);assert.equal(all.filter(q=>q.type!=='synonym').length,52);
 const legacy=new JSDOM('',{runScripts:'outside-only'});t.after(()=>legacy.window.close());legacy.window.eval(read('../kindle-tests-1-2/data.js'));
 for(const q of legacy.window.MARCO_ISEE_PRACTICE[0].questions)assert.deepEqual(plain(all.find(x=>x.source===q.source)),plain(q));
 assert.deepEqual(Array.from({length:8},(_,i)=>all.filter(q=>q.test===i+1).length),[12,12,19,21,20,21,19,22]);
 for(const q of all){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(q.correct>=0&&q.correct<4);assert.ok(q.number>=1&&q.number<=20);for(const k of ['meaning','tip','explanation','evidence','skill'])assert.ok(q[k].length>8,`${q.source} ${k}`);}
 assert.equal(p.w.MarcoTest3Sync.APP_ID,'marco-vr-kindle-tests1-8-hard-20261024-v1');
});
test('selected answer meanings independently checked for all new questions',t=>{
 const p=page(t),all=p.bank.flatMap(s=>s.questions);const expected={
 301:'skilful',302:'persuasive',304:'pointless',306:'convey',309:'difficult',310:'criticize',312:'unpredictable',313:'cautious',314:'evaluate',316:'taciturn',318:'manageable',319:'daunting',320:'secret',321:'unambiguous',324:'coherent',327:'accessible',333:'composed',338:'limited',339:'equitable',
 402:'subside',404:'eliminate',405:'obedient',407:'hasten',408:'approaching',409:'occasional',410:'physical',411:'bold',414:'unemotional',415:'relevant',416:'withdrawn',417:'reject',418:'wise',419:'pressing',420:'interim',421:'assert',424:'fragmentary',427:'approximate',428:'uniform',429:'misleading',439:'concrete',
 501:'suppress',502:'hesitate',504:'ignite',507:'elaborate',508:'extinguish',511:'plentiful',512:'stain',515:'random',516:'continuous',517:'awkward',518:'sociable',519:'humble',521:'detrimental',522:'exhaustive',523:'viable',525:'volatile',530:'spurious',532:'synchronized',535:'circumspect',536:'civil',
 602:'long',603:'thrifty',604:'distort',606:'unfavorable',607:'plain',608:'argue',609:'depart',610:'hard to locate',612:'illegal',614:'glaring',615:'productive',618:'honor',619:'short-lived',621:'extraneous',626:'indeterminate',627:'intelligible',630:'avert',631:'apprehensive',633:'inconclusive',635:'compatible',636:'evocative',
 702:'summon',703:'clear',705:'paltry',707:'calm',708:'acknowledge',710:'expressive',712:'thorough',713:'open to interpretation',715:'harmonize',716:'enable',717:'unstable',719:'inconsistency',720:'generous',725:'speculated',727:'streamlined',729:'negligible',730:'accentuate',732:'actionable',737:'preliminary',
 802:'dexterous',804:'shrewd',805:'faint',806:'firm',807:'inactive',809:'pacify',810:'ordinary',811:'threatening',815:'joyful',816:'watchful',817:'decorate',819:'multifunctional',820:'obstacle',822:'subdued',823:'unwarranted',825:'transparent',830:'ambivalent',832:'duplicative',835:'measured',836:'equivocal',839:'cumulative',840:'objective'};
 assert.equal(Object.keys(expected).length,122);for(const [source,word]of Object.entries(expected)){const q=all.find(q=>q.source===Number(source));assert.equal(q.choices[q.correct],word,source);}
});
for(const [n,total]of [[1,40],[2,40],[3,66]])test(`page ${n}: all ${total} visible, synonyms first, original choices, two tries and reload`,t=>{
 const p=page(t,n),cards=[...p.doc.querySelectorAll('article.question')];assert.equal(cards.length,total);assert.equal(p.doc.querySelectorAll('.jump a').length,total);assert.equal(p.doc.querySelectorAll('.jump').length,Math.ceil(total/10));assert.equal(p.doc.querySelectorAll('textarea,[required],.solution').length,0);
 let sentences=false;for(const card of cards){const q=p.session.questions.find(q=>q.source===Number(card.dataset.source)),input=card.querySelector('.prediction-input'),guide=card.querySelector('.sentence-prediction-guide');if(q.type==='synonym'){assert.equal(sentences,false);assert.equal(card.querySelector('.prompt').textContent,q.word.toUpperCase());assert.equal(guide,null);assert.match(input.placeholder,/One simple word/);}else{sentences=true;assert.ok(guide);assert.match(guide.textContent,/clue word or short phrase.*rest of the sentence.*contrast.*opposite/);assert.match(input.placeholder,/Clue word.*opposite/);assert.equal(input.getAttribute('aria-describedby'),guide.id);}}
 assert.equal(sentences,true);const q=p.session.questions.find(q=>q.source===Number(cards[0].dataset.source));reveal(p);assert.deepEqual([...p.doc.querySelectorAll('#q-1 .choice-text')].map(x=>x.textContent),plain(q.choices));answer(p,1,(q.correct+1)%4);assert.equal(p.doc.querySelector('#q-1 .solution'),null);assert.match(p.doc.querySelector('#q-1 .feedback').textContent,/Not quite/);answer(p,1,q.correct);assert.ok(p.doc.querySelector('#q-1 .trick'));assert.match(p.doc.querySelector('.run-score').textContent,new RegExp('0/'+total));assert.equal(p.network(),0);assert.ok(p.S.valid(p.state()));
 const again=page(t,n,p.state());assert.ok(again.doc.querySelector('#q-1 .solution'));assert.equal(again.w.localStorage.getItem('marco-vr-kindle-tests1-2-hard-20261024-v1'),'legacy sentinel');
});
test('prediction edits preserve first answers and original prediction; elimination is optional',t=>{
 const p=page(t),input=p.doc.querySelector('#q-1 .prediction-input');input.value='original';input.dispatchEvent(new p.w.Event('input',{bubbles:true}));reveal(p);const q=p.session.questions.find(q=>q.source===Number(p.doc.querySelector('#q-1').dataset.source));answer(p,1,q.correct);const before=JSON.stringify(p.state().sessions[p.session.id][0].answers);
 p.doc.querySelector('#q-1 [data-edit-prediction]').click();assert.equal(p.doc.querySelector('#q-1 .solution'),null);const edit=p.doc.querySelector('#q-1 .prediction-input');edit.value='revised';edit.dispatchEvent(new p.w.Event('input',{bubbles:true}));reveal(p);const r=p.state().sessions[p.session.id][0];assert.equal(JSON.stringify(r.answers),before);assert.equal(r.thinking[q.source].committed.prediction,'original');assert.equal(r.thinking[q.source].revised.prediction,'revised');assert.ok(p.doc.querySelector('#q-1 .solution'));assert.ok(p.S.valid(p.state()));
});
test('per-page scores stay isolated and two-device merge preserves both pages and unfinished history',t=>{
 const a=page(t,1),b=page(t,2);for(const p of [a,b]){reveal(p);const q=p.session.questions.find(q=>q.source===Number(p.doc.querySelector('#q-1').dataset.source));answer(p,1,q.correct);}
 const combined=a.S.merge(a.state(),b.state());assert.ok(a.S.valid(combined));assert.equal(Object.keys(combined.sessions).length,2);const next=page(t,2,combined);assert.match(next.doc.querySelector('.run-score').textContent,/1\/40/);const before=JSON.stringify(combined.sessions[next.session.id][0]);next.doc.querySelector('[data-action=restart]').click();assert.equal(next.state().sessions[next.session.id].length,2);assert.equal(JSON.stringify(next.state().sessions[next.session.id][0]),before);assert.ok(next.state().sessions[a.session.id]);
});
test('completion turns only finished page green on page tabs and library, without fake new attempts',t=>{
 const p=page(t),r=p.E.start(p.session);r.thinking={};for(const q of p.session.questions)p.E.submit(r,q,q.correct);r.completedAt=new Date().toISOString();const state={version:1,sessions:{[p.session.id]:[r]}};assert.ok(p.S.valid(state));
 const next=page(t,1,state);assert.ok(next.doc.querySelector('#practice-status.is-complete'));assert.ok(next.doc.querySelector('[data-page-tab="1"].is-complete'));assert.equal(next.doc.querySelectorAll('.page-tabs .is-complete').length,1);const lib=page(t,1,state,true);assert.equal(lib.doc.querySelectorAll('.course-page.is-complete').length,1);assert.match(lib.doc.querySelector('.course-page.is-complete .page-progress').textContent,/40\/40/);assert.equal(lib.network(),0);
});
test('all local asset and course links resolve; no timer and no hidden requirement to eliminate',t=>{
 const p=page(t);for(const f of ['index.html','page-1.html','page-2.html','page-3.html']){const dom=new JSDOM(read(f));for(const el of dom.window.document.querySelectorAll('[src],[href]')){const raw=el.getAttribute('src')||el.getAttribute('href');if(!raw||raw.startsWith('#')||/^(https?:|data:)/.test(raw))continue;const file=raw.split(/[?#]/)[0];assert.ok(existsSync(new URL(file,import.meta.url)),`${f}: ${raw}`);}dom.window.close();}
 assert.doesNotMatch(read('practice.js'),/setInterval|timer\b|Eliminate two choices/);assert.match(read('practice.js'),/Eliminating choices is optional/);
});
