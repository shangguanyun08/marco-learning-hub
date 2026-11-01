import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {build,normalize} from './build-data.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom'),read=f=>readFileSync(new URL(f,import.meta.url),'utf8'),plain=x=>JSON.parse(JSON.stringify(x)),data=build();
const c={window:{}};for(const f of ['data.js','practice-data.js','short-meanings.js'])vm.runInNewContext(read(f),c);
const mixed=plain(c.window.MARCO_MEANING_PRACTICE),meanings=plain(c.window.MARCO_SHORT_MEANINGS);
function page(t,{saved,legacy,place,hash=''}={}){const dom=new JSDOM(read('index.html'),{url:'https://example.test/marco-vr-practice/meaning-check/?demo=1'+hash,runScripts:'outside-only'}),w=dom.window;w.fetch=()=>{throw Error('Preview must not use network');};t.after(()=>w.close());w.localStorage.setItem('marco-vr-kindle-focused-20261024-v1','legacy sentinel');if(saved)w.localStorage.setItem(data.appId+':demo:rounds-v2',JSON.stringify(saved));if(legacy)w.localStorage.setItem(data.appId+':demo',JSON.stringify(legacy));if(place)w.localStorage.setItem(data.appId+':demo:place',JSON.stringify(place));for(const f of ['data.js','practice-data.js','short-meanings.js','history-data.js','sync.js','app.js'])w.eval(read(f));return {w,d:w.document,state:()=>JSON.parse(w.localStorage.getItem(data.appId+':demo:rounds-v2'))};}
function harness({saved,legacy,fetch,now=()=>1000}={}){const store=new Map();if(saved)store.set(data.appId+(fetch?'':':demo')+':rounds-v2',JSON.stringify(saved));if(legacy)store.set(data.appId+(fetch?'':':demo'),JSON.stringify(legacy));const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};const context={};context.globalThis=context;vm.runInNewContext(read('sync.js'),context);let status;const s=context.MeaningCheckSync.create({data:mixed,legacyData:data,storage,now,disabled:!fetch,fetch,setTimeout:()=>1,clearTimeout(){},onStatus:(kind,text)=>status={kind,text}});return {s,store,status:()=>status};}
function fill(s,section,round,value='test meaning'){for(const w of mixed.words.filter(w=>w.section===section))s.editRound(section,round,w.id,value===true?'unknown':'meaning',value);}
test('all requested source targets are covered once, stable mixed sections 50 x 8 + 25',()=>{
 const c={window:{}};vm.runInNewContext(read('data.js'),c);assert.deepEqual(plain(c.window.MARCO_MEANING_CHECK),data);assert.equal(data.total,425);assert.equal(data.originalTotal,468);assert.equal(data.excluded.length,43);assert.ok(data.words.every((w,i)=>!i||w.difficulty>=data.words[i-1].difficulty));assert.ok(data.words.every(w=>w.gradeEstimate&&['4–6','6–8','8–10'].includes(w.gradeBand)));assert.deepEqual(data.sections.map(s=>s.count),[50,50,50,50,50,50,50,50,25]);assert.equal(new Set(data.words.map(w=>w.word)).size,425);assert.equal(new Set(data.words.map(w=>w.id)).size,425);assert.deepEqual(data.inputs,{focusedSynonymQuestions:168,mixedSynonymQuestions:300,review5SynonymQuestions:99,mockSynonymRecords:20,mockCompletionTargetRecords:12});for(const word of ['FERAL','TRAMP','AMBLE','VOCATION','DOGGED','REDRESS','RECANT','RECOUNT','PLUSH'])assert.ok(data.words.some(w=>w.word===word),word);assert.ok(data.words.every(w=>w.sources.length&&w.number>0&&w.section===Math.ceil(w.number/50)));assert.ok(data.words.every(w=>!('meaning'in w)&&!('choices'in w)&&!('correct'in w)));assert.equal(normalize('MYRIAD (adjective)'),'MYRIAD');
});

test('every mixed section includes all difficulty bands; all words have 1–3-word help',()=>{
 assert.deepEqual(mixed.words.map(w=>w.id).sort(),data.words.map(w=>w.id).sort());
 assert.equal(new Set(mixed.words.map(w=>w.id)).size,425);
 for(const section of mixed.sections){const words=mixed.words.filter(w=>w.section===section.number);assert.equal(words.length,section.count);assert.deepEqual([...new Set(words.map(w=>w.difficulty))].sort(),[1,2,3]);}
 assert.deepEqual(Object.keys(meanings).sort(),mixed.words.map(w=>w.id).sort());
 for(const meaning of Object.values(meanings))assert.ok(meaning.trim().split(/\s+/).length<=3,meaning);
 assert.equal(meanings.buffet,'hit repeatedly');assert.equal(meanings.practically,'in practice');assert.equal(meanings.buff,'polish');assert.equal(meanings.exact,'demand and obtain');assert.equal(meanings.accent,'stress a word');
});

test('one visible section, no tone choices, unknown reveals help and preserves typed draft',t=>{
 const p=page(t),first=p.d.querySelector('.word-row'),id=first.dataset.word,input=first.querySelector('.meaning'),unknown=first.querySelector('.unknown'),reveal=first.querySelector('[data-definition]');
 assert.equal(p.d.querySelectorAll('.word-row').length,50);assert.equal(p.d.querySelectorAll('.word-section').length,1);assert.equal(p.d.querySelectorAll('[data-section]').length,9);assert.equal(p.d.querySelectorAll('[data-tone],.tone').length,0);
 assert.equal(reveal.hidden,true);assert.equal(p.d.querySelector('[data-round="2"]').disabled,true);input.focus();input.value='a saved idea';input.dispatchEvent(new p.w.Event('input',{bubbles:true}));assert.equal(p.d.activeElement,input);
 unknown.click();assert.equal(reveal.hidden,false);assert.equal(reveal.textContent,meanings[id]);assert.equal(input.disabled,true);unknown.click();assert.equal(input.value,'a saved idea');assert.equal(input.disabled,false);assert.equal(reveal.hidden,true);
 assert.equal(p.state().rounds['1:1'].entries[id].meaning.value,'a saved idea');assert.equal(p.w.localStorage.getItem('marco-vr-kindle-focused-20261024-v1'),'legacy sentinel');
 p.d.querySelector('[data-section="9"]').click();assert.equal(p.d.querySelectorAll('.word-row').length,25);assert.equal(p.d.querySelectorAll('.word-section').length,1);
});

test('UI saves three separate shuffled rounds and reveals the next-round button only after finishing',t=>{
 const p=page(t),order=()=>[...p.d.querySelectorAll('[data-word]')].map(el=>el.dataset.word),orders=[];
 for(let round=1;round<=3;round++){
  orders.push(order());assert.equal(p.d.querySelector('#section-heading').textContent,'Round '+round);assert.equal(p.d.querySelector('#finish-round').disabled,true);assert.equal(p.d.querySelectorAll('.meaning:disabled').length,0);assert.equal(p.d.querySelectorAll('[data-definition]:not([hidden])').length,0);
  for(const button of p.d.querySelectorAll('.unknown'))button.click();assert.equal(p.d.querySelector('#finish-round').disabled,false);p.d.querySelector('#finish-round-bottom').click();assert.equal(Object.keys(p.state().roundSubmissions).length,round);assert.equal(p.d.querySelector('#next-round').hidden,round===3);if(round<3)p.d.querySelector('#next-round').click();
 }
 assert.notDeepEqual(orders[0],orders[1]);assert.notDeepEqual(orders[1],orders[2]);for(const order of orders)assert.deepEqual([...order].sort(),[...orders[0]].sort());assert.equal(p.d.querySelectorAll('#round-history dl').length,3);
 const next=page(t,{saved:p.state(),place:{section:1,round:3}});assert.equal(next.d.querySelector('#section-heading').textContent,'Round 3');assert.equal(next.d.querySelectorAll('.meaning:disabled').length,50);
});

test('legacy entries and original-section submissions survive regrouping, round edits, and reloading',()=>{
 const old=harness().s;for(const w of data.words.filter(w=>w.section===1)){old.edit(w.id,'meaning','original meaning');old.edit(w.id,'tone','neutral');}assert.equal(old.submit(1).ok,true);
 const legacy={...plain(old.snapshot()),version:1};delete legacy.rounds;delete legacy.roundSubmissions;
 const h=harness({legacy}),s=h.s;assert.deepEqual(plain(s.snapshot().entries),legacy.entries);assert.deepEqual(plain(s.snapshot().submissions),legacy.submissions);assert.deepEqual(JSON.parse(h.store.get(data.appId+':demo')),legacy);
 const word=mixed.words.find(w=>legacy.entries[w.id]),v=s.roundView(word.section,1);assert.equal(v.entries[word.id].meaning,'original meaning');assert.equal(v.finished,false);s.editRound(word.section,1,word.id,'meaning','new round meaning');assert.equal(s.roundView(word.section,1).entries[word.id].meaning,'new round meaning');assert.equal(s.snapshot().entries[word.id].meaning.value,'original meaning');
 const reloaded=harness({saved:s.snapshot(),legacy}).s;assert.equal(reloaded.roundView(word.section,1).entries[word.id].meaning,'new round meaning');assert.deepEqual(plain(reloaded.snapshot().submissions),legacy.submissions);
});

test('completed rounds unlock the next, blanks stay separate and revised copies append',()=>{
 let time=1000;const s=harness({now:()=>time++}).s;assert.equal(s.openRound(1,2).ok,false);assert.equal(s.submitRound(1,1).ok,false);fill(s,1,1,true);assert.equal(s.submitRound(1,1).ok,true);const original=plain(s.snapshot().roundSubmissions);assert.equal(s.submitRound(1,1).unchanged,true);assert.equal(s.openRound(1,2).ok,true);assert.equal(s.roundView(1,2).recorded,0);
 const id=mixed.words.find(w=>w.section===1).id;s.editRound(1,1,id,'unknown',false);s.editRound(1,1,id,'meaning','revised');s.submitRound(1,1);assert.equal(Object.keys(s.snapshot().roundSubmissions).length,2);for(const key of Object.keys(original))assert.deepEqual(plain(s.snapshot().roundSubmissions[key]),original[key]);fill(s,1,2);s.submitRound(1,2);assert.equal(s.openRound(1,3).ok,true);assert.equal(s.roundView(1,3).recorded,0);assert.equal(s.openRound(1,4).ok,false);
});

test('concurrent devices merge fields within each round and preserve every round copy',()=>{
 const first=harness().s;fill(first,1,1,true);first.submitRound(1,1);const seed=first.snapshot(),a=harness({saved:seed,now:()=>2000}).s,b=harness({saved:seed,now:()=>3000}).s,id=mixed.words.find(w=>w.section===1).id;
 a.editRound(1,2,id,'meaning','device A');b.editRound(1,2,id,'unknown',true);const merged=a.merge(a.snapshot(),b.snapshot());assert.equal(merged.rounds['1:2'].entries[id].meaning.value,'device A');assert.equal(merged.rounds['1:2'].entries[id].unknown.value,true);assert.deepEqual(plain(a.merge(a.snapshot(),b.snapshot())),plain(b.merge(b.snapshot(),a.snapshot())));assert.deepEqual(plain(merged.roundSubmissions),plain(seed.roundSubmissions));
});

test('empty startup reads only; version conflicts retain remote history and new round answers',async()=>{
 const other=harness().s;other.edit(data.words[0].id,'meaning','old-device answer');let remote=null,posts=0;const fetch=async(_url,init={})=>{if(init.method==='POST'){posts++;const body=JSON.parse(init.body);assert.equal(body.studentName,'Marco');if(posts===1){remote={version:1,state:other.snapshot()};return {ok:true,json:async()=>({accepted:false,progress:remote})};}assert.equal(body.baseVersion,1);remote={version:2,state:body.state};return {ok:true,json:async()=>({accepted:true,progress:remote})};}return {ok:true,json:async()=>({progress:remote})};};const h=harness({fetch});assert.equal(await h.s.start(),true);assert.equal(posts,0);const id=mixed.words[0].id;h.s.editRound(1,1,id,'meaning','round meaning');assert.equal(await h.s.flush(),true);assert.equal(posts,2);assert.equal(remote.state.rounds['1:1'].entries[id].meaning.value,'round meaning');assert.equal(remote.state.entries[data.words[0].id].meaning.value,'old-device answer');assert.equal(h.status().kind,'live');
});

test('offline round responses remain local and do not claim to be saved online',async()=>{const h=harness({fetch:async()=>{throw Error('offline');}}),id=mixed.words[0].id;h.s.editRound(1,1,id,'meaning','local answer');assert.equal(await h.s.flush(),false);assert.equal(h.status().kind,'offline');assert.equal(h.s.snapshot().rounds['1:1'].entries[id].meaning.value,'local answer');});

test('malformed round data is rejected and orders cannot contain foreign words',()=>{const s=harness().s,bad=s.normalize({kind:'word-meaning-check',version:2,entries:{},submissions:{},rounds:{'1:1':{section:1,round:1,order:['foreign'],entries:{foreign:{meaning:{value:'fake',at:1}}}},'1:4':{section:1,round:4,entries:{}}},roundSubmissions:{'round-copy-invalid':{section:1,round:1,at:'2026-11-01',responses:[]}}});assert.equal(Object.keys(bad.roundSubmissions).length,0);assert.equal(Object.keys(bad.rounds).length,1);assert.equal(bad.rounds['1:1'].order.length,50);assert.deepEqual(plain(bad.rounds['1:1'].entries),{});});
