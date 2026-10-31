import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import vm from 'node:vm';

const read=f=>readFileSync(new URL(f,import.meta.url),'utf8'),plain=x=>JSON.parse(JSON.stringify(x)),data=(()=>{const c={window:{}};vm.runInNewContext(read('data.js'),c);return plain(c.window.HARRY_MEANING_CHECK);})();
function harness({saved,remote,fetch,now=()=>1000}={}){let record=saved&&JSON.stringify(saved);const storage={getItem:k=>k.endsWith(':device')?JSON.stringify('test-device-000001'):record||null,setItem(k,v){if(!k.endsWith(':device'))record=v;}};const c={};c.globalThis=c;vm.runInNewContext(read('sync.js'),c);let status;const s=c.MeaningCheckSync.create({data,storage,now,disabled:!fetch,fetch,setTimeout:()=>1,clearTimeout(){},onStatus:(kind,text)=>status={kind,text}});return {s,status:()=>status};}
test('frozen 100-word bank covers all 18 missed vocabulary targets and has ten sections',()=>{
 assert.equal(data.total,100);assert.deepEqual(data.sections.map(s=>s.count),Array(10).fill(10));assert.equal(new Set(data.words.map(w=>w.id)).size,100);assert.equal(data.words.filter(w=>w.source==='reading').length,18);assert.equal(data.words.filter(w=>w.source==='practice').length,82);
 for(const word of ['ballet','acre','cooperate','apprentice','gruesome','detect','cull','deteriorate','fundamental','articles','exploit','deny','mileage','immense','brief','applied','aerial','inexpensive'])assert.ok(data.words.some(w=>w.word===word),word);
 assert.ok(data.words.every(w=>!('meaning'in w)&&!('choices'in w)&&!('correct'in w)));assert.ok(data.words.every(w=>w.section===Math.ceil(w.number/10)));assert.equal(data.appId,'harry-word-meaning-check-20261031-v1');
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
