import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {changeSegments,changeParagraphs} from '../change-highlights.mjs';
const changed=(before,after)=>changeSegments(before,after).filter(s=>s.changed).map(s=>s.text);

test('word additions and replacements leave matching words plain',()=>{
 assert.deepEqual(changed('We read Chinese lessons on Saturdays.','We read his Chinese lessons together on Saturdays.'),['his','together']);
 assert.deepEqual(changed('He is a talented, funny boy.','He is a creative, funny boy.'),['creative']);
 assert.deepEqual(changed('He is kind.','He is kind!'),['!']);
});

test('omissions and whitespace differences do not highlight retained words',()=>{
 assert.deepEqual(changed('He is always a kind friend.','He is a kind friend.'),[]);
 assert.deepEqual(changed(' He  is\nkind. ','He is kind.'),[]);
 assert.deepEqual(changeSegments('Removed paragraph.',''),[]);
 assert.deepEqual(changed('','A new paragraph.'),['A new paragraph.']);
});

test('all 25 suggested source passages roundtrip exactly, including Unicode and punctuation',async()=>{
 const data=JSON.parse(await readFile(new URL('../data.json',import.meta.url),'utf8'));
 for(const p of data.questions.flatMap(q=>q.paragraphs)){
  const segments=changeSegments(p.original,p.suggested);
  assert.equal(segments.map(s=>s.text).join(''),p.suggested,p.id);
  assert.equal(changeParagraphs(p.original,p.suggested).flat().map(s=>s.text).join(''),p.suggested,p.id);
 }
 for(const [before,after] of [['Marco’s art.','Marco’s art & comics!'],['中文 <b> & “art”','中文 <b> & “new art”']])
  assert.equal(changeSegments(before,after).map(s=>s.text).join(''),after);
});

test('split passages keep highlights within each paragraph and do not shift following groups',()=>{
 const result=changeParagraphs('First line. Second line.','First new line.\n\nSecond line.');
 assert.equal(result.length,2);assert.equal(result[0].map(s=>s.text).join(''),'First new line.');
 assert.deepEqual(result[0].filter(s=>s.changed).map(s=>s.text),['new']);
 assert.equal(result[1].map(s=>s.text).join(''),'Second line.');assert.ok(result[1].every(s=>!s.changed));
});
