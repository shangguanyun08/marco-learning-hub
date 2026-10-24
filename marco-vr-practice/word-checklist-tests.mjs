import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {checklistRows,renderChecklist} from './build-word-checklist.mjs';
const require=createRequire(import.meta.url);let JSDOM;try{({JSDOM}=require('jsdom'));}catch{({JSDOM}=require(fileURLToPath(new URL('../../tmp/daily-sync-qa/node_modules/jsdom/lib/api.js',import.meta.url))));}
const html=fs.readFileSync(new URL('word-checklist.html',import.meta.url),'utf8'),rows=checklistRows(),KEY='marco-vr-word-checklist-v1:demo';
function page(saved){return new JSDOM(html,{url:'http://localhost:8767/marco-vr-practice/word-checklist.html?demo=1',runScripts:'dangerously',beforeParse(w){w.localStorage.setItem('original-course-progress','untouched');if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));w.confirm=()=>true;}});}
function change(w,el){el.checked=!el.checked;el.dispatchEvent(new w.Event('change',{bubbles:true}));}

test('all 32 selected mock mistakes and original choices are included, with no extra definition exercises',()=>{
 assert.deepEqual([1,2,3,4].map(t=>rows.filter(r=>r.test===t).length),[8,9,2,13]);assert.equal(new Set(rows.map(r=>r.id)).size,32);assert.equal(rows.filter(r=>r.type==='synonym').length,20);assert.equal(rows.filter(r=>r.type==='sentence completion').length,12);
 for(const r of rows){assert.equal(r.choices.length,4);assert.equal(r.choiceMeanings.length,4);assert.ok(r.choices[r.correct]);assert.ok(r.wrongChoices.every(i=>i!==r.correct));assert.ok(r.choiceMeanings.every(m=>m.length>5));assert.ok(r.mainWord&&r.mainMeaning.length>5);if(r.type==='synonym')assert.equal(r.mainMeaning,r.targetMeaning);else assert.equal(r.mainMeaning,r.choiceMeanings[r.correct]);if(r.test===2||r.test===3)assert.equal(r.attempt,'2nd attempt');}
 assert.equal(rows.filter(r=>r.prompt==='VOCATION:').length,2);assert.notDeepEqual(rows.filter(r=>r.prompt==='VOCATION:')[0].choices,rows.filter(r=>r.prompt==='VOCATION:')[1].choices);
});

test('single-file output matches its template, retains five columns, and removes all unwanted controls',()=>{
 assert.equal(html,renderChecklist());assert.equal(fs.readFileSync(new URL('../../output/Marco_VR_Wrong_Questions_Checklist.html',import.meta.url),'utf8'),html);
 const d=page(),doc=d.window.document;assert.equal(doc.querySelectorAll('thead th').length,5);assert.equal(doc.querySelectorAll('tbody tr').length,32);for(const r of doc.querySelectorAll('tbody tr'))assert.equal(r.cells.length,5);assert.equal(doc.querySelectorAll('[data-word]').length,148);assert.equal(doc.querySelectorAll('script[src],link[rel=stylesheet]').length,0);assert.equal(doc.querySelector('#total-count').textContent,'32');assert.equal(doc.querySelectorAll('.instructions,.diagnoses,.knows-caption,[data-diagnosis],.stats').length,0);assert.equal(doc.querySelector('thead th').textContent,'Question');assert.doesNotMatch(doc.querySelector('main').textContent,/Knows exact meaning/);assert.ok(!doc.body.classList.contains('show-answers'));assert.ok(!doc.body.classList.contains('show-meanings'));d.window.close();
});

test('multiple word checks persist without deleting previously saved hidden diagnoses or practice scores',()=>{
 const old={words:{'t1-q10-stem':true},diagnoses:{'t1-q10':'nuance',[rows.find(r=>r.test===4).id]:'unfamiliar'}},d=page(old),w=d.window,doc=w.document;
 change(w,doc.querySelectorAll('[data-word]')[1]);assert.ok(doc.querySelector('#word-count').textContent.startsWith('2 / 148'));
 const snapshot=JSON.parse(w.localStorage.getItem(KEY));assert.deepEqual(snapshot.diagnoses,old.diagnoses);assert.equal(snapshot.words['t1-q10-stem'],true);
 const again=page(snapshot);assert.equal(again.window.document.querySelector('[data-word="t1-q10-stem"]').checked,true);assert.ok(again.window.document.querySelector('#word-count').textContent.startsWith('2 / 148'));assert.equal(w.localStorage.getItem('original-course-progress'),'untouched');again.window.close();d.window.close();
});

test('mock and question-type filters combine for every option without changing saved selections',()=>{
 const old={words:{'t1-q10-stem':true},diagnoses:{'t1-q10':'nuance'}},d=page(old),w=d.window,doc=w.document;
 for(const mock of ['all','1','2','3','4'])for(const type of ['all','synonym','sentence completion']){
  for(const [id,value] of [['test-filter',mock],['type-filter',type]]){const f=doc.getElementById(id);f.value=value;f.dispatchEvent(new w.Event('change',{bubbles:true}));}
  const expected=rows.filter(r=>(mock==='all'||String(r.test)===mock)&&(type==='all'||r.type===type));
  assert.deepEqual([...doc.querySelectorAll('tbody tr:not([hidden])')].map(r=>r.dataset.id),expected.map(r=>r.id));assert.equal(doc.querySelector('#total-count').textContent,String(expected.length));
  const total=expected.reduce((n,r)=>n+4+(r.type==='synonym'?1:0),0),checked=expected.some(r=>r.id==='t1-q10')?1:0;assert.equal(doc.querySelector('#word-count').textContent,checked+' / '+total+' words selected for practice · '+checked+' questions with selections');
 }
 assert.deepEqual(JSON.parse(w.localStorage.getItem(KEY)),old);assert.equal(doc.querySelector('[data-word="t1-q10-stem"]').checked,true);d.window.close();
});

test('reveal controls and explicit clearing do not alter practice records; previews never sync',()=>{
 const d=page({words:{'t1-q10-stem':true},diagnoses:{'t1-q10':'unfamiliar'}}),w=d.window,doc=w.document;
 assert.equal(doc.querySelector('#show-meanings'),null);change(w,doc.querySelector('#show-answers'));assert.ok(doc.body.classList.contains('show-answers'));doc.querySelector('#clear').click();assert.equal(doc.querySelectorAll('[data-word]:checked').length,0);assert.equal(w.localStorage.getItem('original-course-progress'),'untouched');assert.ok(!html.includes('students/analysis'));assert.ok(!html.includes('5003638'));assert.ok(html.includes('marco-vr-word-checklist-v1'));assert.equal(doc.querySelector('#sync-now').hidden,true);d.window.close();
});

test('only main synonym meanings are visible; completion answers and all other choice meanings remain hidden',()=>{
 const d=page(),doc=d.window.document;
 assert.equal(doc.querySelectorAll('.main-meaning').length,20);assert.equal(doc.querySelectorAll('.main-answer-meaning').length,12);
 assert.equal(doc.querySelectorAll('td:not(:first-child) .meaning,td:not(:first-child) .main-meaning').length,0);
 for(const r of rows){const tr=doc.querySelector(`[data-id="${r.id}"]`);if(r.type==='synonym'){assert.ok(tr.querySelector('.main-meaning').textContent.includes(r.mainMeaning));assert.notEqual(d.window.getComputedStyle(tr.querySelector('.main-meaning')).display,'none');}else{assert.ok(tr.querySelector('.main-answer-meaning').textContent.includes(r.mainMeaning));assert.equal(d.window.getComputedStyle(tr.querySelector('.answer-detail')).display,'none');}}
 assert.match(doc.querySelector('.selection-help').textContent,/Tick the words you want Marco to practise/);d.window.close();
});

test('selected-first sort includes checked answer choices and stems, preserves IDs and supports restoring original order',()=>{
 const old={words:{'t4-q40-1':true,'t2-q18-stem':true,'t4-q9-stem':true},diagnoses:{'t1-q10':'nuance'}},d=page(old),w=d.window,doc=w.document;
 const ids=()=>[...doc.querySelectorAll('tbody tr:not([hidden])')].map(tr=>tr.dataset.id),selected=['t2-q18','t4-q9','t4-q40'];
 assert.equal(doc.querySelector('#sort-order').value,'selected');assert.deepEqual(ids().slice(0,3),selected);assert.equal(doc.querySelectorAll('.practice-selected').length,3);
 for(const key of Object.keys(old.words))assert.equal(doc.querySelector(`[data-word="${key}"]`).checked,true);
 assert.deepEqual(JSON.parse(w.localStorage.getItem(KEY)),old);
 const sort=doc.querySelector('#sort-order');sort.value='original';sort.dispatchEvent(new w.Event('change',{bubbles:true}));assert.deepEqual(ids(),rows.map(r=>r.id));assert.deepEqual(JSON.parse(w.localStorage.getItem(KEY)),old);
 sort.value='selected';sort.dispatchEvent(new w.Event('change',{bubbles:true}));change(w,doc.querySelector('[data-word="t1-q12-stem"]'));assert.deepEqual(ids().slice(0,4),['t1-q12',...selected]);
 change(w,doc.querySelector('[data-word="t2-q18-stem"]'));assert.deepEqual(ids().slice(0,3),['t1-q12','t4-q9','t4-q40']);assert.equal(doc.querySelectorAll('[data-word]').length,148);
 const filter=doc.querySelector('#test-filter');filter.value='4';filter.dispatchEvent(new w.Event('change',{bubbles:true}));assert.deepEqual(ids().slice(0,2),['t4-q9','t4-q40']);assert.equal(doc.querySelector('#total-count').textContent,'13');assert.equal(w.localStorage.getItem('original-course-progress'),'untouched');d.window.close();
});
