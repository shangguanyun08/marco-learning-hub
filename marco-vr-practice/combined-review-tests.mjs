import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {sourcePages,vocabulary,renderCombined} from './build-combined-review.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom'),read=f=>readFileSync(new URL(f,import.meta.url),'utf8');
const html=read('combined-review.html'),pages=sourcePages(),v=vocabulary(pages);
function page(t,prefs){const d=new JSDOM(html,{url:'https://shangguanyun08.github.io/marco-learning-hub/marco-vr-practice/combined-review.html',runScripts:'outside-only'}),w=d.window;t.after(()=>w.close());let calls=0;w.fetch=()=>{calls++;throw Error('No live network allowed');};w.localStorage.setItem('original-score-record','untouched');w.localStorage.setItem('marco-vr-word-checklist-v1','untouched checklist');if(prefs)w.localStorage.setItem('marco-vr-combined-review:visibility:v1',JSON.stringify(prefs));w.eval(w.document.querySelector('script').textContent);return{w,doc:w.document,calls:()=>calls};}
test('all 162 meanings from all 32 source records are covered by 160 word labels',()=>{
 assert.equal(pages.reduce((n,p)=>n+p.questions.length,0),32);assert.equal(v.sourceEntries,162);assert.equal(v.words.length,160);
 const d=new JSDOM(html),doc=d.window.document;assert.equal(doc.querySelectorAll('.meaning-entry').length,160);
 for(const p of pages)for(const q of p.questions)for(const[word,meaning]of p.notes[q.number].meanings){const entry=[...doc.querySelectorAll('.meaning-entry')].find(e=>e.dataset.word===word.toLowerCase());assert.ok(entry,word);assert.ok([...entry.querySelectorAll('.short-meaning')].some(m=>m.textContent===meaning),word+' meaning');assert.ok(entry.querySelector(`a[href="#t${p.test}-q${q.number}"]`),word+' source');}
 assert.equal(doc.querySelector('[data-word="vocation"]').querySelectorAll('.short-meaning').length,2);assert.equal(doc.querySelector('[data-word="fleeting"]').querySelectorAll('.short-meaning').length,2);d.window.close();
});
test('word tiers run harder to easier, alphabetical within each, and are explicitly estimates',()=>{
 const d=new JSDOM(html),doc=d.window.document;assert.deepEqual([...doc.querySelectorAll('.vocabulary-group')].map(g=>g.id),['words-hard','words-medium','words-easy']);
 for(const group of doc.querySelectorAll('.vocabulary-group')){const words=[...group.querySelectorAll('.meaning-entry h3')].map(e=>e.textContent);assert.deepEqual(words,[...words].sort((a,b)=>a.localeCompare(b,'en')));}
 assert.match(doc.querySelector('.sorting-note').textContent,/estimated study order/);assert.match(doc.querySelector('.sorting-note').textContent,/not an official ISEE grade/);d.window.close();
});
test('all 32 full reviews retain source choices, selected wrong answers, meanings and explanations',()=>{
 const d=new JSDOM(html),doc=d.window.document;assert.equal(doc.querySelectorAll('.review-question').length,32);assert.equal(new Set([...doc.querySelectorAll('[id]')].map(el=>el.id)).size,doc.querySelectorAll('[id]').length);
 for(const p of pages)for(const q of p.questions){const c=doc.getElementById(`t${p.test}-q${q.number}`),n=p.notes[q.number];assert.ok(c);assert.equal(c.querySelector('.prompt').textContent,q.prompt);q.choices.forEach((choice,i)=>assert.equal(c.querySelectorAll('.review-choices li>span:nth-child(2)')[i].textContent,choice));assert.match(c.querySelector('.answer-correct').textContent,new RegExp(q.choices[q.correct].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));for(const a of q.mockAttempts||[{choice:q.chosen}])assert.ok([...c.querySelectorAll('.original-wrong')].some(el=>Number(el.dataset.choice)===a.choice));assert.ok(c.querySelector('.solution').textContent.includes(n.publisher));assert.ok(c.querySelector('.solution').textContent.includes(n.contrast));assert.ok(c.querySelector('.trick').textContent.includes(q.tip));assert.equal(c.querySelectorAll('.word-meanings dt').length,n.meanings.length);}
 assert.equal(doc.querySelectorAll('.old-question').length,2);assert.equal(doc.querySelectorAll('.history-events li').length,11);d.window.close();
});
test('all internal source links resolve, and file has no runtime assets or private account URLs',()=>{
 const d=new JSDOM(html),doc=d.window.document;for(const a of doc.querySelectorAll('a[href^="#"]'))assert.ok(doc.getElementById(a.getAttribute('href').slice(1)),a.outerHTML);
 assert.equal(doc.querySelectorAll('script[src],link[rel="stylesheet"],img,iframe').length,0);assert.doesNotMatch(html,/5003638|students\/analysis|deviceId|studentName/);assert.match(read('index.html'),/id="combined-review" href="\.\/combined-review.html/);d.window.close();
});
test('search finds word or meaning without removing the full question reviews',t=>{
 const {doc,w,calls}=page(t),input=doc.getElementById('find-word');input.value='transom';input.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(doc.querySelectorAll('.meaning-entry:not([hidden])').length,1);assert.match(doc.getElementById('word-count').textContent,/1 of 160/);input.value='not a real matching term 123';input.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(doc.getElementById('no-matches').hidden,false);assert.equal(doc.querySelectorAll('.review-question').length,32);input.value='';input.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(doc.querySelectorAll('.meaning-entry:not([hidden])').length,160);assert.equal(doc.querySelectorAll('.vocabulary-group:not([hidden])').length,3);assert.equal(calls(),0);
});
test('per-question and global answer toggles keep meanings and wrong choices visible without changing scores',t=>{
 const {doc,w,calls}=page(t);assert.equal(doc.querySelectorAll('.solution:not([hidden])').length,32);const card=doc.getElementById('t4-q29');card.querySelector('.answer-toggle').click();assert.equal(card.querySelector('.solution').hidden,true);assert.equal(card.querySelector('.word-meanings').hidden,false);assert.equal(card.querySelector('.original-record').hidden,false);assert.ok(card.querySelector('.original-wrong'));doc.querySelector('[data-all="hide"]').click();assert.equal(doc.querySelectorAll('.answers-hidden').length,32);assert.equal(doc.querySelectorAll('.meaning-entry:not([hidden])').length,160);const prefs=JSON.parse(w.localStorage.getItem('marco-vr-combined-review:visibility:v1')),reload=page(t,prefs);assert.equal(reload.doc.querySelectorAll('.answers-hidden').length,32);doc.querySelector('[data-all="show"]').click();assert.equal(doc.querySelectorAll('.answers-hidden').length,0);assert.equal(w.localStorage.getItem('original-score-record'),'untouched');assert.equal(w.localStorage.getItem('marco-vr-word-checklist-v1'),'untouched checklist');assert.equal(calls(),0);
});
test('committed standalone HTML is reproducible from the current four source reviews',()=>{assert.equal(html.replace(/\r\n/g,'\n'),renderCombined().replace(/\r\n/g,'\n'));});
