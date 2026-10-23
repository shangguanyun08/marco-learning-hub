import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const require=createRequire(import.meta.url),read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
let JSDOM;
try{({JSDOM}=require('jsdom'));}catch{({JSDOM}=require(fileURLToPath(new URL('../../../tmp/daily-sync-qa/node_modules/jsdom/lib/api.js',import.meta.url))));}
const c=vm.createContext({});c.window=c;vm.runInContext(read('data.js'),c);vm.runInContext(read('review-data.js'),c);
const questions=c.MARCO_ISEE_PRACTICE[0].questions,notes=c.MARCO_VR_REVIEW,KEY='marco-vr-practice-oct22-test4-v1';
function page(prefs,mutate){const dom=new JSDOM(read('index.html'),{url:'http://localhost:8767/marco-vr-practice/2026-10-22/',runScripts:'outside-only'}),w=dom.window;
 if(prefs)w.localStorage.setItem(KEY+':review-prefs:preview',JSON.stringify(prefs));
 w.localStorage.setItem(KEY,JSON.stringify({version:1,sessions:{},untouched:'real record sentinel'}));
 for(const p of ['data.js','review-data.js','../../marco-daily-test-review/2026-10-11/engine.js','../../marco-daily-test-review/2026-10-11/sync.js'])w.eval(read(p));if(mutate)mutate(w.MARCO_VR_REVIEW);w.eval(read('review.js'));return dom;}
test('13 verified questions each have publisher-derived explanation, contrast, and all option meanings',()=>{
 assert.equal(Object.keys(notes).length,13);
 for(const q of questions){const n=notes[q.number];assert.ok(n.publisher.length>30);assert.ok(n.contrast.length>25);assert.ok(n.meanings.length>=4);
  for(const choice of q.choices)assert.ok(n.meanings.some(([word])=>word.toLowerCase().split(' (')[0]===choice.toLowerCase()),`Q${q.number}: ${choice} meaning missing`);
 }
});
test('earlier practice has 2 distinct real-question forms and 11 attempts, with exact per-word and format counts',()=>{
 const forms=Object.values(notes).flatMap(n=>n.history||[]);assert.equal(forms.length,2);assert.equal(new Set(forms.map(f=>f.id)).size,2);
 assert.equal(forms.flatMap(f=>f.events).length,11);assert.equal(forms.filter(f=>f.format==='Direct synonym stem').length,2);
 assert.deepEqual([5,20,37].map(n=>notes[n].history.flatMap(f=>f.events).length),[0,5,6]);
 assert.equal(forms.flatMap(f=>f.events).filter(e=>!e.correct).length,3);
 for(const form of forms){assert.ok(['Direct synonym stem','Sentence completion'].includes(form.format));assert.equal(form.choices.length,4);assert.ok(form.choices[form.answer]);assert.ok(form.events.length);}
 const vocation=notes[20].history.find(f=>f.id==='vocation-synonym');assert.equal(vocation.events[0].choice,'steeple');assert.match(vocation.note,/key mismatch/);
 assert.equal(notes[10].history,undefined);assert.match(notes[10].historyNote,/no earlier completed/);
});
test('review defaults to visible solutions and original wrong choices, with no scoring form',()=>{
 const d=page(),doc=d.window.document;assert.equal(doc.querySelectorAll('.review-question').length,13);assert.equal(doc.querySelectorAll('.solution:not([hidden])').length,13);
 assert.equal(doc.querySelectorAll('.original-wrong').length,13);assert.equal(doc.querySelectorAll('.word-meanings').length,13);assert.equal(doc.querySelectorAll('form,input').length,0);
 assert.equal(doc.querySelectorAll('.old-question').length,2);assert.equal(doc.querySelectorAll('.history-events li').length,11);
 assert.match(doc.querySelector('#save-note').textContent,/Review is unscored/);d.window.close();
});
test('each hide/show control hides solutions and earlier keys, keeping meanings and wrong choices visible',()=>{
 const d=page(),doc=d.window.document;
 for(const q of questions){const card=doc.querySelector('#q'+q.number),button=card.querySelector('.answer-toggle');button.click();
  assert.equal(button.textContent,'Show answer');assert.equal(button.getAttribute('aria-expanded'),'false');assert.ok(card.classList.contains('answers-hidden'));
  assert.ok([...card.querySelectorAll('.answer-content')].every(x=>x.hidden));assert.equal(card.querySelector('.word-meanings').hidden,false);assert.equal(card.querySelector('.original-record').hidden,false);assert.match(card.querySelector('.original-wrong').textContent,/Wrong/);
  button.click();assert.equal(button.textContent,'Hide answer');assert.ok([...card.querySelectorAll('.answer-content')].every(x=>!x.hidden));
 }d.window.close();
});
test('global controls and remembered visibility never overwrite scored progress',()=>{
 const d=page(),doc=d.window.document,before=d.window.localStorage.getItem(KEY);doc.querySelector('[data-all="hide"]').click();
 assert.equal(doc.querySelectorAll('.answers-hidden').length,13);const prefs=JSON.parse(d.window.localStorage.getItem(KEY+':review-prefs:preview'));assert.equal(Object.values(prefs).filter(Boolean).length,13);
 assert.equal(d.window.localStorage.getItem(KEY),before);const reload=page(prefs);assert.equal(reload.window.document.querySelectorAll('.answers-hidden').length,13);reload.window.close();
 doc.querySelector('[data-all="show"]').click();assert.equal(doc.querySelectorAll('.answers-hidden').length,0);assert.equal(d.window.localStorage.getItem(KEY),before);d.window.close();
});
test('public assets omit private identifiers and keep the previous redo available',()=>{
 const assets=['index.html','review-data.js','review.js','review.css'].map(read).join('');assert.doesNotMatch(assets,/5003638|students\/analysis|Marco Yang/);
 assert.match(read('index.html'),/href="practice.html"/);assert.ok(existsSync(new URL('practice.html',import.meta.url)));assert.doesNotMatch(read('review.js'),/E\.submit|E\.start|completedAt\s*=/);
 for(const match of read('index.html').matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)){const path=match[1];if(!path.startsWith('http')&&path!== '../'&&!path.endsWith('/'))assert.ok(existsSync(new URL(path,import.meta.url)),path);}
});
test('definition-only history never renders, while current keyword meanings remain',()=>{
 const d=page(undefined,n=>{n[5].history=[{id:'qa-definition',format:'Definition → word',events:[{choice:'dismal',correct:true}]}];}),doc=d.window.document;
 assert.equal(doc.querySelector('#q5 .prior-practice'),null);assert.match(doc.querySelector('#q5 .no-history').textContent,/Definition exercises are not counted/);assert.equal(doc.querySelectorAll('.old-question').length,2);assert.equal(doc.querySelectorAll('.word-meanings').length,13);assert.doesNotMatch(doc.querySelector('#review-questions').textContent,/Definition → word/);assert.match(doc.querySelector('.history-overview').textContent,/2 distinct earlier question forms · 11 recorded attempts/);d.window.close();
});
