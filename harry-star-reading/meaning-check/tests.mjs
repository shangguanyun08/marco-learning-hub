import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import vm from 'node:vm';

const read=f=>readFileSync(new URL(f,import.meta.url),'utf8'),plain=x=>JSON.parse(JSON.stringify(x)),data=(()=>{const c={window:{}};vm.runInNewContext(read('data.js'),c);return plain(c.window.HARRY_MEANING_CHECK);})();
function harness({saved,remote,fetch,now=()=>1000}={}){let record=saved&&JSON.stringify(saved);const storage={getItem:k=>k.endsWith(':device')?JSON.stringify('test-device-000001'):record||null,setItem(k,v){if(!k.endsWith(':device'))record=v;}};const c={};c.globalThis=c;vm.runInNewContext(read('sync.js'),c);let status;const s=c.MeaningCheckSync.create({data,storage,now,disabled:!fetch,fetch,setTimeout:()=>1,clearTimeout(){},onStatus:(kind,text)=>status={kind,text}});return {s,status:()=>status};}
test('94 base-form targets retain all requested examples and part-of-speech labels',()=>{
 assert.equal(data.total,94);assert.deepEqual(data.sections.map(s=>s.count),[10,10,10,10,10,10,10,10,10,4]);assert.equal(new Set(data.words.map(w=>w.word)).size,94);assert.equal(data.words.filter(w=>w.source==='reading').length,16);assert.equal(data.words.filter(w=>w.source==='practice').length,78);
 for(const id of ['cull','aerial','still','phrasal-verb','been-meaning','all-of-the-above'])assert.ok(!data.words.some(w=>w.id===id),id);
 for(const [id,word]of Object.entries({articles:'article',applied:'apply','the-public-s':'public','be-welcome-to':'welcome','switched-off':'switch off','without-delay':'delay','in-addition':'addition',stunned:'stun',furthest:'far'}))assert.equal(data.words.find(w=>w.id===id).word,word);
 const review=JSON.parse(read('../../../source/docs/review/data.json'));
 for(const w of data.words){assert.ok(['noun','verb','adjective','adverb'].includes(w.partOfSpeech));assert.ok(w.context);assert.ok(w.contextSource);assert.ok(!('meaning'in w)&&!('choices'in w)&&!('correct'in w));if(w.source==='practice')assert.equal(w.context,review.words.find(x=>x.id===w.contextSource.wordId).example);else{const c={window:{}};vm.runInNewContext(read('../tests/'+w.contextSource.date+'/data.js'),c);const q=c.window.STAR_REVIEW.questions.find(q=>q.number===w.contextSource.question);assert.ok(q.passage?q.passage.includes(w.context):q.prompt.replace(/____/,q.choices[q.correct])===w.context,w.id);}}
 assert.equal(data.previousWords.length,100);
});

test('old removed-word drafts and original ten-word submissions survive the new layout',()=>{
 const responses=data.previousWords.filter(w=>w.section===1).map(w=>({id:w.id,meaning:'saved original meaning',unknown:false,tone:''}));
 const old={kind:'word-meaning-check',version:1,entries:{cull:{meaning:{value:'original typed draft',at:12}}},submissions:{'submission-legacy-0001':{section:1,at:'2026-10-31T16:00:00.000Z',responses}}};
 const s=harness({saved:old}).s;assert.deepEqual(plain(s.snapshot().submissions),old.submissions);assert.equal(s.snapshot().entries.cull.meaning.value,'original typed draft');
 for(const w of data.words.filter(w=>w.section===10))s.edit(w.id,'unknown',true);assert.equal(s.submit(10).ok,true);assert.equal(Object.values(s.snapshot().submissions).find(x=>x.section===10).responses.length,4);assert.deepEqual(plain(s.snapshot().submissions['submission-legacy-0001']),old.submissions['submission-legacy-0001']);
});

test('tone alone does not count as a meaning or allow incomplete submission',()=>{
 const {s}=harness();s.edit(data.words[0].id,'tone','positive');assert.equal(s.submit(1).ok,false);assert.equal(Object.keys(s.snapshot().submissions).length,0);
});
test('section submissions preserve the original copy when revised; all unknown is valid',()=>{
 let n=1000;const {s}=harness({now:()=>n++}),rows=data.words.filter(w=>w.section===1);for(const row of rows)s.edit(row.id,'unknown',true);assert.equal(s.submit(1).ok,true);const first=plain(s.snapshot().submissions);assert.equal(Object.keys(first).length,1);assert.equal(s.submit(1).unchanged,true);s.edit(rows[0].id,'unknown',false);s.edit(rows[0].id,'meaning','new meaning');assert.equal(s.submit(1).ok,true);const all=plain(s.snapshot().submissions);assert.equal(Object.keys(all).length,2);for(const id of Object.keys(first))assert.deepEqual(all[id],first[id]);
});
test('field-level merge retains typing on one device and tone on another, plus clear values',()=>{
 const a=harness({now:()=>1000}).s,b=harness({now:()=>2000}).s,id=data.words[0].id;a.edit(id,'meaning','first');b.edit(id,'tone','negative');const ab=a.merge(a.snapshot(),b.snapshot());assert.equal(ab.entries[id].meaning.value,'first');assert.equal(ab.entries[id].tone.value,'negative');const c=harness({saved:ab,now:()=>3000}).s;c.edit(id,'meaning','');assert.equal(c.merge(ab,c.snapshot()).entries[id].meaning.value,'');assert.deepEqual(plain(a.merge(a.snapshot(),b.snapshot())),plain(a.merge(b.snapshot(),a.snapshot())));
});
test('network save merges a concurrent remote field; empty startup never posts',async()=>{
 const other=harness({now:()=>2000}).s,id=data.words[0].id;other.edit(id,'tone','positive');let remote=null,posts=0;const fetch=async(_url,init={})=>{if(init.method==='POST'){posts++;const body=JSON.parse(init.body);assert.equal(body.appId,data.appId);if(posts===1){remote={version:1,state:other.snapshot()};return {ok:true,json:async()=>({accepted:false,progress:remote})};}assert.equal(body.baseVersion,1);remote={version:2,state:body.state};return {ok:true,json:async()=>({accepted:true,progress:remote})};}return {ok:true,json:async()=>({progress:remote})};};const h=harness({fetch});assert.equal(await h.s.start(),true);assert.equal(posts,0);h.s.edit(id,'meaning','my meaning');assert.equal(await h.s.flush(),true);assert.equal(posts,2);assert.equal(remote.state.entries[id].meaning.value,'my meaning');assert.equal(remote.state.entries[id].tone.value,'positive');assert.equal(h.status().kind,'live');
});
test('offline failures retain the draft and do not falsely claim online saving',async()=>{const h=harness({fetch:async()=>{throw Error('offline');}});h.s.edit(data.words[0].id,'meaning','saved locally');assert.equal(await h.s.flush(),false);assert.equal(h.status().kind,'offline');assert.equal(h.s.snapshot().entries[data.words[0].id].meaning.value,'saved locally');});
test('normalization rejects malformed values and incomplete submitted snapshots',()=>{const {s}=harness(),bad=s.normalize({kind:'word-meaning-check',version:1,entries:{[data.words[0].id]:{meaning:{value:'x'.repeat(241),at:1},unknown:{value:'yes',at:1},tone:{value:'bad',at:1}}},submissions:{'submission-invalid':{section:1,at:'2026-10-26',responses:[]}}});assert.equal(Object.keys(bad.entries).length,0);assert.equal(Object.keys(bad.submissions).length,0);});
