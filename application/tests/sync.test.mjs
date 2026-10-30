import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {SOURCE,flatten,mergeFields,changedFields,applyFields,mergeFeedback,revisionPatch} from '../sync-model.mjs';
import {saveFeedbackEvent} from '../cloud-sync.mjs';
const data=JSON.parse(await fs.readFile(new URL('../data.json',import.meta.url),'utf8'));
const blank=()=>({schema:1,source:SOURCE,edits:Object.fromEntries(data.questions.flatMap(q=>q.paragraphs.map(p=>[p.id,{text:p.original,note:'',status:'review'}]))),reviews:{},submissionNote:''});
const field=(value,updatedAt,deviceId='family-device-one')=>({value,updatedAt,deviceId});
test('new browser has all 25 exact originals and stamps only fields the family edits',()=>{
 const original=blank();assert.equal(Object.keys(original.edits).length,25);
 const changed=structuredClone(original);changed.edits['q1-p1'].note='Keep this opening.';
 const patch=changedFields({},flatten(original),flatten(changed),'family-device-one',20);
 assert.deepEqual(Object.keys(patch.fields),['q1-p1.note']);
 assert.equal(changedFields({},flatten(original),flatten(original),'family-device-two').changed,false);
});
test('different-device edits merge, explicit clears survive, original source remains unchanged',()=>{
 const first={'q1-p1.text':field('Revised opening',10),'q1-p1.note':field('Old note',10)};
 const second={'q2-p1.note':field('Make this specific',20,'family-device-two'),'q1-p1.note':field('',30,'family-device-two')};
 const fields=mergeFields(first,second),state=applyFields(blank(),fields);
 assert.equal(state.edits['q1-p1'].text,'Revised opening');assert.equal(state.edits['q1-p1'].note,'');assert.equal(state.edits['q2-p1'].note,'Make this specific');
 assert.equal(data.questions[0].paragraphs[0].original,blank().edits['q1-p1'].text);
 assert.deepEqual(mergeFields(first,second),mergeFields(second,first));
});
test('same-clock conflicts converge and invalid fields are ignored',()=>{
 const a={'q1-p1.text':field('A',10,'device-a')},b={'q1-p1.text':field('B',10,'device-b')};
 assert.deepEqual(mergeFields(a,b),mergeFields(b,a));assert.equal(mergeFields(a,b)['q1-p1.text'].value,'B');
 assert.deepEqual(mergeFields({'q1-p1.status':field('bad',10),'unknown':field('x',10)}),{});
});
test('revision preserves newer family edits and retry is idempotent',()=>{
 const submission={draft:blank()},proposal={'q1-p1':'Clearer first paragraph','q2-p1':'Clearer school paragraph'};
 const current={'q2-p1.text':field('Family changed this after submission',30)};
 const patch=revisionPatch(current,submission,proposal,'editor-assistant',40);
 assert.deepEqual(patch.applied,['q1-p1']);assert.deepEqual(patch.held,['q2-p1']);assert.equal(patch.fields['q2-p1.text'].value,current['q2-p1.text'].value);
 const again=revisionPatch(patch.fields,submission,proposal,'editor-assistant',50);
 assert.deepEqual(again.applied,['q1-p1']);assert.deepEqual(again.fields,patch.fields);
});
test('submitted snapshots merge without a blank client deleting history',()=>{
 const s={id:'one',createdAt:'2026-10-29',draft:blank(),comment:'Keep his voice.'};
 const current={source:SOURCE,submissions:{one:s},responses:{}};
 assert.deepEqual(mergeFeedback(current,{}).submissions.one,s);
 assert.equal(Object.keys(mergeFeedback(current,{source:SOURCE,submissions:{two:{...s,id:'two'}}}).submissions).length,2);
});
test('feedback submission retries version conflicts and confirms only persisted events',async()=>{
 const submission={id:'one',createdAt:'2026-10-29',draft:blank(),comment:'Shorter please'};let posts=0;
 const fake=async(url,options)=>({ok:true,json:async()=>{
  if(options.method==='GET')return{progress:{version:posts+1,state:mergeFeedback()}};
  posts++;return posts===1?{accepted:false,progress:{state:mergeFeedback()}}:{accepted:true,progress:{state:{source:SOURCE,submissions:{one:submission}}}};
 }});
 assert.equal((await saveFeedbackEvent(submission,'family-device-one',fake)).submissions.one.id,'one');assert.equal(posts,2);
 const failing=async()=>{throw new Error('Network lost');};await assert.rejects(()=>saveFeedbackEvent(submission,'family-device-one',failing),/Network lost/);
 const unconfirmed=async()=>({ok:true,json:async()=>({accepted:true,progress:{version:1,state:mergeFeedback()}})});
 await assert.rejects(()=>saveFeedbackEvent(submission,'family-device-one',unconfirmed),/Please retry/);
});
