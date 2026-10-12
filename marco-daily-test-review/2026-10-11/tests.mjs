import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
function setup(){const ctx=vm.createContext({crypto:{randomUUID},setTimeout,clearTimeout,setInterval,clearInterval,AbortController,fetch:async()=>{},localStorage:{getItem(){return null},setItem(){}},addEventListener(){},removeEventListener(){},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}}});for(const file of ['data.js','expanded.js','engine.js','sync.js'])vm.runInContext(read(file),ctx);return ctx;}
const c=setup(),bank=c.MARCO_ISEE_PRACTICE,E=c.MarcoTest3Engine,S=c.MarcoTest3Sync,plain=x=>JSON.parse(JSON.stringify(x)),empty=()=>({version:1,sessions:{}}),at=n=>new Date(Date.UTC(2026,9,11,20,0,n)).toISOString();
test('20 original + 20 similar + 28 expanded; all original references and keys verified',()=>{
 assert.deepEqual(plain(bank.map(s=>s.questions.length)),[20,20,28]);
 assert.deepEqual(plain(bank[0].questions.map(q=>q.correct)),[2,1,2,3,1,2,2,1,1,1,1,2,2,2,2,1,1,0,3,1]);
 assert.deepEqual(plain(bank[0].questions.filter(q=>q.section==='VR').map(q=>q.number)),[5,6,11,15,35,36,37]);
 assert.deepEqual(plain(bank[0].questions.filter(q=>q.section==='QR').map(q=>q.number)),[11,28,31,33,34,37]);
 assert.deepEqual(plain(bank[0].questions.filter(q=>q.section==='MA').map(q=>q.number)),[6,12,23,36,40,46,47]);
 assert.equal(bank[2].questions.filter(q=>q.extra).length,8);
 for(const s of bank){assert.equal(new Set(s.questions.map(q=>q.source)).size,s.questions.length);for(const q of s.questions){assert.equal(q.choices.length,4);assert.ok(q.tip&&q.explanation);assert.ok(q.correct>=0&&q.correct<4);}}
});
test('fresh forms vary multiple-choice positions but preserve official QC meanings and option tables',()=>{
 for(const s of bank)for(const q of s.questions)if(q.columns)assert.deepEqual(plain(q.choices),plain(c.MARCO_OCT11_HELPERS.qc));
 for(const [i,offset]of [[1,1],[2,3]])bank[i].questions.forEach((q,index)=>{if(!q.columns&&!q.choiceTables)assert.equal(q.correct,(index+offset)%4);});
 const q=bank[2].questions.find(q=>q.source===3046),t=q.choiceTables[q.correct];assert.deepEqual(plain(t.rows),[[0,-6],[2,-5],[4,-4]]);
});
test('independent arithmetic spot checks agree with keys',()=>{
 const original=bank[0].questions,similar=bank[1].questions,expanded=bank[2].questions;
 const answer=(qs,id)=>{const q=qs.find(q=>q.source===id);return q.choices[q.correct];};
 assert.ok(Math.abs(232/544*100-42.6470588235)<1e-8);assert.equal(answer(original,2011),'40%');
 assert.equal(0.15*9600,1440);assert.equal(answer(original,3012),'1,440');assert.equal((11-8)/8*100,37.5);assert.equal(answer(original,3036),'37.5%');
 assert.equal(answer(similar,3012),'1,260');assert.equal(0.15*8400,1260);
 assert.equal(answer(expanded,2034),'72.8%');assert.ok(Math.abs((1.2**3-1)*100-72.8)<1e-10);
 assert.equal(answer(expanded,3012),'8,000');assert.equal(1200/.15,8000);
 assert.equal(answer(expanded,3036),'$12');assert.equal(15/1.25,12);
 assert.equal(answer(expanded,3047),'5');assert.equal(11-3*((15-11)/(5-3)),5);
 assert.equal(answer(expanded,3104),'(6, 1)');assert.equal(5+(-2)*(6-4),1);
 assert.equal(answer(expanded,2101),'7.5 miles');assert.equal(3/24*60,7.5);
 assert.equal(answer(expanded,2106),'100%');assert.equal((Math.cbrt(8)-1)*100,100);
 assert.equal(answer(expanded,2105),c.MARCO_OCT11_HELPERS.qc[3]);
});
test('first miss allows one distinct retry; first-try scores are preserved',()=>{
 const s=bank[0],q=s.questions[0],r=E.start(s,at(0));assert.equal(E.submit(r,q,0,at(1)),true);assert.equal(E.done(q,r.answers[q.source]),false);
 assert.equal(E.submit(r,q,0,at(2)),false);assert.equal(r.answers[q.source].attempts.length,1);
 assert.equal(E.submit(r,q,q.correct,at(3)),true);assert.equal(E.done(q,r.answers[q.source]),true);
 assert.equal(E.submit(r,q,1,at(4)),false);assert.equal(E.stats(s,r).first,0);assert.equal(E.stats(s,r).corrected,1);
});
test('all completed questions derive a completed run; repeat remains separate',()=>{
 const s=bank[0],r=E.start(s,at(0));s.questions.forEach(q=>E.submit(r,q,q.correct,at(1)));const merged=S.merge({version:1,sessions:{original:[r]}},empty());
 assert.ok(merged.sessions.original[0].completedAt);assert.equal(E.stats(s,merged.sessions.original[0]).first,20);
 const next=E.start(s,at(2)),twice=S.merge(merged,{version:1,sessions:{original:[next]}});assert.equal(twice.sessions.original.length,2);assert.ok(twice.sessions.original[0].completedAt);
});
test('merge keeps disjoint answers and distinct conflicting first attempts',()=>{
 const s=bank[0],base=E.start(s,at(0)),a=plain(base),b=plain(base);E.submit(a,s.questions[0],0,at(1));E.submit(b,s.questions[1],1,at(2));
 const union=S.merge({version:1,sessions:{original:[a]}},{version:1,sessions:{original:[b]}});assert.equal(Object.keys(union.sessions.original[0].answers).length,2);
 const conflict=plain(base);E.submit(conflict,s.questions[0],1,at(3));const fork=S.merge({version:1,sessions:{original:[a]}},{version:1,sessions:{original:[conflict]}});assert.equal(fork.sessions.original.length,2);assert.ok(fork.sessions.original.every(r=>r.deviceConflict));
 assert.equal(JSON.stringify(S.merge(union,union)),JSON.stringify(union));assert.ok(S.valid(union));
});
test('draft second try survives sync but submitted choices do not remain drafts',()=>{
 const s=bank[0],q=s.questions[0],r=E.start(s,at(0));E.submit(r,q,0,at(1));r.pending[q.source]={choice:q.correct,at:at(2)};
 const merged=S.merge({version:1,sessions:{original:[r]}},empty());assert.equal(merged.sessions.original[0].pending[q.source].choice,q.correct);
 E.submit(r,q,q.correct,at(3));assert.equal(Object.keys(S.merge({version:1,sessions:{original:[r]}},empty()).sessions.original[0].pending).length,0);
});
test('sync saves, reloads on a second device, and validates the isolated namespace',async()=>{
 let record=null,version=0;const calls=[];
 const fetcher=async(url,options)=>{calls.push({url,method:options.method});if(options.method==='POST'){const b=JSON.parse(options.body);assert.equal(b.appId,'marco-isee-middle-oct11-test3-v1');if(b.baseVersion!== (record?version:null))return {ok:true,json:async()=>({accepted:false,progress:record})};record={state:b.state,version:++version};return {ok:true,json:async()=>({accepted:true,progress:record})};}return {ok:true,json:async()=>({progress:record})};};
 const s=bank[0],r=E.start(s,at(0));E.submit(r,s.questions[0],0,at(1));let state={version:1,sessions:{original:[r]}},status;
 const sync=S.create({getState:()=>state,onRemote:x=>state=x,onStatus:k=>status=k,fetcher});await sync.refresh();assert.equal(status,'live');assert.equal(record.state.sessions.original[0].answers[1005].attempts.length,1);
 let device2=empty();const other=S.create({getState:()=>device2,onRemote:x=>device2=x,onStatus(){},fetcher});await other.refresh();assert.equal(device2.sessions.original[0].answers[1005].attempts[0].choice,0);assert.ok(calls.every(c=>c.url.endsWith('?appId=marco-isee-middle-oct11-test3-v1')));
});
