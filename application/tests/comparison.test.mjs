import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {comparisonNotes,comparisonRows} from '../comparison-notes.mjs';
import {validAnnotation} from '../review-model.mjs';
const data=JSON.parse(await readFile(new URL('../data.json',import.meta.url),'utf8'));

test('explanations cover exactly the source paragraph pairs',()=>{
 const ids=data.questions.flatMap(q=>q.paragraphs.map(p=>p.id));
 assert.deepEqual(Object.keys(comparisonNotes).sort(),ids.sort());
 for(const q of data.questions)for(const row of comparisonRows(q)){
  assert.equal(row.notes.length,2);assert.ok(row.notes.every(([label,text])=>label&&text.length>60));
 }
});

test('an omitted or split suggestion cannot shift the corresponding later passage',()=>{
 const question={paragraphs:[
  {id:'q1-p1',original:'Original one',suggested:''},
  {id:'q1-p2',original:'Original two',suggested:'Split A\n\nSplit B'},
  {id:'q1-p3',original:'Original three',suggested:'Suggested three'}
 ]};
 const rows=comparisonRows(question);
 assert.equal(rows[0].suggested,'');assert.equal(rows[1].suggested,'Split A\n\nSplit B');
 assert.equal(rows[2].original,'Original three');assert.equal(rows[2].suggested,'Suggested three');
 assert.deepEqual(question.paragraphs[0],{id:'q1-p1',original:'Original one',suggested:''});
});

test('paragraph-bound notes validate without rejecting legacy notes',()=>{
 const a={id:'note-one',question:1,side:'suggested',quote:'',reference:'Answer',note:'Keep it',createdAt:'2026-10-31',status:'open',rect:null};
 assert.ok(validAnnotation(a));assert.ok(validAnnotation({...a,paragraphId:'q1-p3'}));
 assert.equal(validAnnotation({...a,paragraphId:'q2-p3'}),false);
 assert.equal(validAnnotation({...a,paragraphId:'q1-p3"]'}),false);
});
