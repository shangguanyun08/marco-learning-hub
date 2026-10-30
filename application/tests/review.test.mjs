import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {setAnswer,fullAnswer,compactDraft} from '../review-model.mjs';
import {SOURCE,flatten,changedFields,mergeFields,applyFields,revisionPatch} from '../sync-model.mjs';
const data=JSON.parse(await fs.readFile(new URL('../data.json',import.meta.url),'utf8'));
const byId=new Map(data.questions.flatMap(q=>q.paragraphs.map(p=>[p.id,p])));
const blank=()=>({schema:1,source:SOURCE,edits:Object.fromEntries([...byId].map(([id,p])=>[id,{text:p.original,note:'',status:'review'}])),reviews:{},annotations:{},versions:{}});
const note={id:'circle-one',question:1,side:'original',quote:'Supporting Marco',reference:data.questions[0].paragraphs.map(p=>p.original).join('\n\n'),note:'Make this warmer.',status:'open',rect:{x:.1,y:.1,w:.5,h:.2},targetWidth:400,createdAt:'2026-10-30T00:00:00Z'};
test('complete answers roundtrip even when the family changes paragraph counts',()=>{
 for(const length of [1,2,10]){const s=blank(),text=Array.from({length},(_,i)=>`New paragraph ${i}.`).join('\n\n');s.edits['q1-p1'].note='Keep this note';setAnswer(s,data.questions[0],text);assert.equal(fullAnswer(s,data.questions[0]),text);assert.equal(s.edits['q1-p1'].note,'Keep this note');}
});
test('circles merge independently across devices and removed circles stay removed',()=>{
 const original=blank(),one=blank(),two=blank();one.annotations[note.id]=note;two.annotations['circle-two']={...note,id:'circle-two',side:'revision'};
 const first=changedFields({},flatten(original),flatten(one),'device-one',20).fields,second=changedFields({},flatten(original),flatten(two),'device-two',30).fields;
 const merged=mergeFields(first,second),recovered=applyFields(blank(),merged);assert.equal(Object.keys(recovered.annotations).length,2);assert.equal(recovered.annotations['circle-one'].reference,note.reference);
 const removed=changedFields(merged,flatten(recovered),flatten({...recovered,annotations:{...recovered.annotations,'circle-one':null}}),'device-one',40).fields;
 assert.equal(applyFields(blank(),mergeFields(first,removed)).annotations['circle-one'],null);
});
test('versions are compact snapshots without nested histories; editorial patches retain them',()=>{
 const s=blank();s.annotations[note.id]=note;setAnswer(s,data.questions[0],'The family’s version.');
 const snapshot=compactDraft(s,byId);assert.equal(Object.keys(snapshot.edits).length,data.questions[0].paragraphs.length);assert.equal(snapshot.versions,undefined);
 s.versions.saved={id:'saved',label:'Family review',createdAt:'2026-10-30',draft:snapshot};
 const fields=changedFields({},flatten(blank()),flatten(s),'device-one',20).fields;
 const patch=revisionPatch(fields,{draft:s},{'q1-p1':'An editorial revision.'},'editor-assistant',30);
 const restored=applyFields(blank(),mergeFields(patch.fields));assert.equal(restored.versions.saved.draft.edits['q1-p1'].text,'The family’s version.');assert.equal(restored.annotations[note.id].note,'Make this warmer.');assert.equal(restored.edits['q1-p1'].text,'An editorial revision.');
});
