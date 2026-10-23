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
 for(const r of rows){assert.equal(r.choices.length,4);assert.equal(r.choiceMeanings.length,4);assert.ok(r.choices[r.correct]);assert.ok(r.wrongChoices.every(i=>i!==r.correct));assert.ok(r.choiceMeanings.every(m=>m.length>5));if(r.test===2||r.test===3)assert.equal(r.attempt,'2nd attempt');}
 assert.equal(rows.filter(r=>r.prompt==='VOCATION:').length,2);assert.notDeepEqual(rows.filter(r=>r.prompt==='VOCATION:')[0].choices,rows.filter(r=>r.prompt==='VOCATION:')[1].choices);
});
test('single-file output exactly matches its template and works with five columns and no external scripts',()=>{
 assert.equal(html,renderChecklist());assert.equal(fs.readFileSync(new URL('../../output/Marco_VR_Wrong_Questions_Checklist.html',import.meta.url),'utf8'),html);
 const d=page(),doc=d.window.document;assert.equal(doc.querySelectorAll('thead th').length,5);assert.equal(doc.querySelectorAll('tbody tr').length,32);for(const r of doc.querySelectorAll('tbody tr'))assert.equal(r.cells.length,5);assert.equal(doc.querySelectorAll('[data-word]').length,148);assert.equal(doc.querySelectorAll('script[src],link[rel=stylesheet]').length,0);assert.equal(doc.querySelector('#total-count').textContent,'32');assert.equal(doc.querySelector('#unreviewed-count').textContent,'32');assert.ok(!doc.body.classList.contains('show-answers'));assert.ok(!doc.body.classList.contains('show-meanings'));d.window.close();
});
test('word checks allow multiple selections; diagnoses are exclusive and persist separately from scores',()=>{
 const d=page(),w=d.window,doc=w.document;change(w,doc.querySelector('[data-word]'));change(w,doc.querySelectorAll('[data-word]')[1]);assert.match(doc.querySelector('#word-count').textContent,/2 \/ 148/);
 change(w,doc.querySelector('[data-diagnosis][data-kind=common]'));assert.equal(doc.querySelector('#common-count').textContent,'1');assert.equal(doc.querySelector('#unreviewed-count').textContent,'31');change(w,doc.querySelector('[data-diagnosis][data-kind=nuance]'));assert.equal(doc.querySelector('#common-count').textContent,'0');assert.equal(doc.querySelector('#nuance-count').textContent,'1');assert.equal(doc.querySelector('[data-kind=common]').checked,false);
 const snapshot=JSON.parse(w.localStorage.getItem(KEY)),again=page(snapshot);assert.equal(again.window.document.querySelector('[data-kind=nuance]').checked,true);assert.match(again.window.document.querySelector('#word-count').textContent,/2 \/ 148/);assert.equal(w.localStorage.getItem('original-course-progress'),'untouched');again.window.close();d.window.close();
});
test('filter recalculates counts; reveal controls and clearing do not alter practice records',()=>{
 const d=page(),w=d.window,doc=w.document;change(w,doc.querySelector('[data-kind=unfamiliar]'));const f=doc.querySelector('#test-filter');f.value='4';f.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(doc.querySelectorAll('tbody tr:not([hidden])').length,13);assert.equal(doc.querySelector('#total-count').textContent,'13');assert.equal(doc.querySelector('#unfamiliar-count').textContent,'0');assert.match(doc.querySelector('#word-count').textContent,/0 \/ 58/);
 change(w,doc.querySelector('#show-meanings'));change(w,doc.querySelector('#show-answers'));assert.ok(doc.body.classList.contains('show-meanings'));assert.ok(doc.body.classList.contains('show-answers'));doc.querySelector('#clear').click();assert.equal(doc.querySelectorAll('[data-diagnosis]:checked,[data-word]:checked').length,0);assert.equal(w.localStorage.getItem('original-course-progress'),'untouched');assert.doesNotMatch(html,/fetch\(|students\/analysis|5003638|deviceId/);d.window.close();
});
