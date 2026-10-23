import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8'),plain=x=>JSON.parse(JSON.stringify(x)),empty=()=>({version:1,sessions:{}}),at=n=>new Date(Date.UTC(2026,9,23,17,0,n)).toISOString();
function setup(){const c=vm.createContext({crypto:{randomUUID},setTimeout,clearTimeout,setInterval,clearInterval,AbortController,fetch:async()=>{},localStorage:{getItem(){return null},setItem(){}},addEventListener(){},removeEventListener(){},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}}});c.window=c;for(const p of ['data.js','../../marco-daily-test-review/2026-10-11/engine.js','../../marco-daily-test-review/2026-10-11/sync.js'])vm.runInContext(read(p),c);return c;}
const c=setup(),session=c.MARCO_ISEE_PRACTICE[0],E=c.MarcoTest3Engine,S=c.MarcoTest3Sync,APP='marco-vr-practice-oct22-test4-v1';
test('all 13 source mistakes are present exactly once, ordered by verified difficulty',()=>{
 assert.equal(session.questions.length,13);assert.deepEqual(plain(session.questions.map(q=>q.number)),[29,5,9,10,34,16,18,20,36,37,38,39,40]);
 assert.equal(new Set(session.questions.map(q=>q.source)).size,13);assert.equal(session.questions.filter(q=>q.type==='synonym').length,6);
 assert.deepEqual(plain(session.questions.reduce((o,q)=>(o[q.difficulty]=(o[q.difficulty]||0)+1,o),{})),{easy:1,medium:4,hard:8});
 const keys={5:'miserable',9:'luxurious',10:'untamed',16:'tread',18:'rationalize',20:'calling',29:'ordinary',34:'idle',36:'acute',37:'versatile',38:'chief',39:'applications',40:'fleeting'};
 const wrong={5:'agreeable',9:'damp',10:'sterile',16:'clasp',18:'condemn',20:'opportunity',29:'selfless',34:'sullen',36:'industrious',37:'fragrant',38:'fleeting',39:'obstructions',40:'attentive'};
 for(const q of session.questions){assert.equal(q.choices.length,4);assert.equal(q.choices[q.correct],keys[q.number]);assert.equal(q.choices[q.chosen],wrong[q.number]);assert.ok(q.tip&&q.explanation);assert.ok(q.seconds>0);}
 assert.equal(c.MARCO_VR_MOCK.date,'2026-10-22');assert.equal(c.MARCO_VR_MOCK.originalScore.wrong,13);
});
test('first wrong answer does not close the question; one distinct retry is allowed',()=>{
 const q=session.questions[0],r=E.start(session,at(0));assert.equal(E.submit(r,q,q.chosen,at(1)),true);assert.equal(E.done(q,r.answers[q.source]),false);
 assert.equal(E.submit(r,q,q.chosen,at(2)),false);assert.equal(r.answers[q.source].attempts.length,1);
 assert.equal(E.submit(r,q,q.correct,at(3)),true);assert.equal(E.done(q,r.answers[q.source]),true);assert.equal(E.stats(session,r).first,0);assert.equal(E.stats(session,r).corrected,1);
 assert.equal(E.submit(r,q,0,at(4)),false);
});
test('two wrong tries reveal a finished question without awarding first-try points',()=>{
 const q=session.questions[0],r=E.start(session,at(0)),wrong=q.choices.map((_,i)=>i).filter(i=>i!==q.correct);E.submit(r,q,wrong[0],at(1));E.submit(r,q,wrong[1],at(2));assert.equal(E.done(q,r.answers[q.source]),true);assert.equal(E.stats(session,r).first,0);assert.equal(E.stats(session,r).corrected,0);
});
test('completion is derived after all questions; another run preserves the first',()=>{
 const r=E.start(session,at(0));session.questions.forEach(q=>E.submit(r,q,q.correct,at(1)));const state=S.merge({version:1,sessions:{[session.id]:[r]}},empty());assert.ok(state.sessions[session.id][0].completedAt);assert.equal(E.stats(session,state.sessions[session.id][0]).first,13);
 const next=E.start(session,at(3)),merged=S.merge(state,{version:1,sessions:{[session.id]:[next]}});assert.equal(merged.sessions[session.id].length,2);assert.ok(S.valid(merged));
});
test('isolated configured namespace syncs to a second device without changing older apps',async()=>{
 assert.equal(S.APP_ID,APP);let record=null,version=0;const calls=[];
 const fetcher=async(url,options)=>{calls.push(url);if(options.method==='POST'){const b=JSON.parse(options.body);assert.equal(b.appId,APP);if(b.baseVersion!==(record?version:null))return {ok:true,json:async()=>({accepted:false,progress:record})};record={state:b.state,version:++version};return {ok:true,json:async()=>({accepted:true,progress:record})};}return {ok:true,json:async()=>({progress:record})};};
 const r=E.start(session,at(0));E.submit(r,session.questions[0],session.questions[0].chosen,at(1));let state={version:1,sessions:{[session.id]:[r]}},status;
 const sync=S.create({getState:()=>state,onRemote:x=>state=x,onStatus:k=>status=k,fetcher});await sync.refresh();assert.equal(status,'live');
 let second=empty();await S.create({getState:()=>second,onRemote:x=>second=x,onStatus(){},fetcher}).refresh();assert.equal(second.sessions[session.id][0].answers[29].attempts[0].correct,false);assert.ok(calls.every(url=>url.endsWith('?appId='+APP)));
});
test('merge preserves drafts and conflicting independent first answers',()=>{
 const base=E.start(session,at(0)),a=plain(base),b=plain(base),q=session.questions[0];E.submit(a,q,q.chosen,at(1));a.pending[q.source]={choice:q.correct,at:at(2)};
 const state=S.merge({version:1,sessions:{[session.id]:[a]}},empty());assert.equal(state.sessions[session.id][0].pending[q.source].choice,q.correct);
 E.submit(b,q,q.correct,at(3));const both=S.merge(state,{version:1,sessions:{[session.id]:[b]}});assert.equal(both.sessions[session.id].length,2);assert.ok(both.sessions[session.id].every(r=>r.deviceConflict));
});
test('demo isolates progress and study time; public files have no private source link',()=>{
 const html=read('practice.html'),app=read('app.js'),data=read('data.js');assert.match(app,/storageKey=demo\?KEY\+':demo':KEY/);assert.match(app,/if\(!preview\)/);assert.match(html,/data-subject="words"/);assert.match(html,/data-app-id="marco-vr-practice-oct22-test4-v1"/);assert.doesNotMatch(html+app+data,/5003638|students\/analysis|Marco Yang/);assert.match(app,/done\?solution\(q\):''/);
});
