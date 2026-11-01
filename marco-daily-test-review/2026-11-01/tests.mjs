import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const data=read('./data.js'),engine=read('../2026-10-23/engine.js'),syncCode=read('../2026-10-23/sync.js'),app=read('./app.js');
function setup(){const w={crypto,fetch:async()=>{},AbortController,setTimeout,clearTimeout,setInterval,clearInterval,addEventListener(){},removeEventListener(){},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}},localStorage:{getItem(){return null;},setItem(){}}};const c={window:w,AbortController,console};vm.createContext(c);for(const s of[data,engine,syncCode])vm.runInContext(s,c);return{D:w.MarcoMA4Data,E:w.MarcoQR4Engine,S:w.MarcoQR4Sync};}
const plain=x=>JSON.parse(JSON.stringify(x));
const numeric=s=>Number(s.replaceAll(',','').match(/[\d.]+/)[0]);

test('top navigation links directly to the previous QR practice and all archived dates',()=>{
 const html=read('./index.html');
 assert.match(html,/<a class="primary previous-practice" href="\.\.\/2026-10-23\/"/);
 assert.match(html,/<a class="archive-button" href="\.\.\/archive\.html">All previous practice<\/a>/);
 assert(html.indexOf('primary previous-practice')<html.indexOf('<header class="hero">'));
});

test('four exact original misses and 4 x 4 mixed practice, with isolated state',()=>{
 const {D,E}=setup();assert.deepEqual(plain(D.originals.map(q=>q.number)),[41,42,44,47]);assert.deepEqual(plain(D.originals.map(q=>q.chosen)),[0,2,2,3]);assert.deepEqual(plain(D.originals.map(q=>q.correct)),[1,3,0,0]);assert.equal(D.ids.length,16);assert.equal(new Set(D.ids).size,16);
 for(const k of Object.keys(D.skills))assert.equal(D.ids.filter(id=>D.questions[id].skill===k).length,4);
 for(let i=0;i<16;i+=4)assert.equal(new Set(D.ids.slice(i,i+4).map(id=>D.questions[id].skill)).size,4);
 for(const q of Object.values(D.questions)){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(q.tip&&q.explanation&&q.focus);}
 const counts=[0,0,0,0];for(const id of D.ids)counts[D.questions[id].correct]++;assert.deepEqual(counts,[4,4,4,4]);
 assert.equal(D.appId,'marco-ma-nov01-test4-v1');assert(E.valid(E.empty()));assert.equal(E.stats(E.empty()).answered,0);
});

test('Mock 0 example preserves the original tables and the fresh spinner question counts factors',()=>{
 const{D}=setup(),q=D.reviewExamples[0];assert.equal(q.number,32);assert.match(q.source,/Mock 0.*116/);assert.equal(q.correct,0);
 const expected=[];['Red','Blue','Yellow'].forEach((color,i)=>[1,2,3,4,5,6].forEach((n,j)=>{if(color==='Red'&&6%n===0)expected.push([i,j]);}));
 assert.deepEqual(plain(q.choiceTables[q.correct].shaded),expected);assert.deepEqual(plain(q.choiceTables.map(g=>g.shaded.length)),[4,12,9,3]);
 assert.equal(q.choiceTables.filter(g=>JSON.stringify(plain(g.shaded))===JSON.stringify(expected)).length,1);
 const fresh=D.questions.p2;assert.equal(D.ids[7],fresh.id);assert.match(fresh.prompt,/BLUE AND.*FACTOR OF 8/);
 const winning=[];fresh.choiceTables[0].rows.forEach((color,i)=>fresh.choiceTables[0].columns.forEach((n,j)=>{if(color==='Blue'&&8%n===0)winning.push([i,j]);}));
 assert.deepEqual(winning,[[1,0],[1,1],[1,3]]);assert.deepEqual(plain(fresh.choiceTables[fresh.correct].shaded),winning);
});

test('the 16 item IDs still match the activity service completion contract',()=>{
 const{D,E}=setup(),s=E.empty(),trackedIds=['r1','p1','c1','u1','c2','r2','u2','p2','u3','c3','p3','r3','p4','u4','r4','c4'];
 assert.deepEqual(plain(D.ids),trackedIds);
 for(const id of trackedIds)assert(E.submit(s,id,D.questions[id].correct));
 assert(E.valid(s));assert(E.firstPass(s));assert.equal(E.stats(s).first,16);
});
test('independent arithmetic checks of rates, cumulative totals, and units',()=>{
 const{D}=setup();for(const q of Object.values(D.questions)){const a=q.audit;let expected;
  if(a.kind==='rate'){const f=a.fraction[0]/a.fraction[1],total=a.elapsedMinutes/f;expected=a.ask==='totalMinutes'?total:total-a.elapsedMinutes;if(a.ask==='remainingHours')expected/=60;if(a.round!=null)expected=Number(expected.toFixed(a.round));}
  else if(a.kind==='volume'){const inches=a.dimensions.map(([v,u])=>u==='ft'?v*12:v);expected=inches.reduce((p,v)=>p*v,1)/(a.target==='ft'?1728:1);}
  else if(a.kind==='depth')expected=a.volumeFt3/(a.lengthFt*a.widthFt)*12;
  else if(a.kind==='totals'){
   if(a.ask==='constantIncrement'){const deltas=a.values.slice(1).map((v,i)=>v-a.values[i]);assert.equal(new Set(deltas).size,1);expected=deltas[0];}
   else if(a.ask==='incrementAt')expected=a.values[a.index]-a.values[a.index-1];
   else if(a.ask==='greatestIncrementDay'){const deltas=a.values.slice(1).map((v,i)=>v-a.values[i]);expected=a.days[deltas.indexOf(Math.max(...deltas))+1];}
   else expected=(a.b.at(-1)-a.b.at(-2))-(a.a.at(-1)-a.a.at(-2));
  }else continue;
  assert.equal(expected,a.value,q.id+' audit value');assert.equal(typeof expected==='string'?q.choices[q.correct]:numeric(q.choices[q.correct]),expected,q.id+' correct choice');
 }
});
test('each probability item retains four distinct shaded tables with one exact matching mask',()=>{
 const{D}=setup();for(const q of Object.values(D.questions).filter(q=>q.skill==='outcomes')){
  assert.equal(q.choiceTables.length,4);const a=q.audit,expected=[];a.rows.forEach((r,i)=>a.columns.forEach((c,j)=>{const rm=a.rowMatches.includes(r),cm=a.columnMatches.includes(c);if(a.operation==='and'?rm&&cm:rm||cm)expected.push([i,j]);}));
  const key=x=>JSON.stringify(plain(x));const matches=q.choiceTables.map(g=>key(g.shaded)===key(expected));assert.equal(matches.filter(Boolean).length,1,q.id);assert.equal(matches[q.correct],true,q.id);assert.equal(new Set(q.choiceTables.map(g=>key(g.shaded))).size,4);
 }
 const original=D.originals[1].choiceTables;assert.deepEqual(plain(original.map(g=>g.shaded.length)),[8,1,12,2]);assert.deepEqual(plain(original[3].shaded),[[1,2],[3,2]]);
});
test('instant wrong feedback, second chance, preserved first scores, and per-skill scoring',()=>{
 const{D,E}=setup(),s=E.empty(),id=D.ids[0],correct=D.questions[id].correct,wrong=(correct+1)%4;
 assert(E.submit(s,id,wrong,'2026-11-01T19:00:00Z','event-1'));assert.equal(E.reveal(s,id),false);assert.equal(E.stats(s).first,0);
 assert.equal(E.submit(s,id,wrong,'2026-11-01T19:00:01Z','event-repeat'),false);
 assert(E.submit(s,id,correct,'2026-11-01T19:00:02Z','event-2'));assert.equal(E.reveal(s,id),true);assert.equal(E.stats(s).first,0);assert.equal(E.stats(s).corrected,1);assert.equal(E.submit(s,id,0),false);
 for(const other of D.ids.slice(1))assert(E.submit(s,other,D.questions[other].correct));
 assert.equal(E.stats(s).first,15);assert.equal(E.firstPass(s),true);assert.equal(E.stats(s,'rate').first,3);assert.equal(E.stats(s,'outcomes').first,4);assert(E.valid(s));
});
test('concurrent-device merge preserves independent answers and first misses',()=>{
 const{D,E}=setup(),a=E.empty(),b=E.empty();E.submit(a,'r1',0,'2026-11-01T19:00:00Z','a');E.submit(b,'p1',3,'2026-11-01T19:00:01Z','b');
 const merged=E.merge(a,b);assert.equal(E.stats(merged).answered,2);assert.equal(E.stats(merged).first,1);assert.equal(E.reveal(merged,'r1'),false);assert.deepEqual(plain(E.merge(a,b)),plain(E.merge(b,a)));assert.deepEqual(plain(E.merge(merged,merged)),plain(merged));assert(E.valid(merged));
});
test('mock online sync reads before writing and never overwrites old-course data',async()=>{
 const{D,E,S}=setup();let state=E.empty(),record=null;const requests=[],statuses=[];
 const fetcher=async(url,opts={})=>{assert(url.endsWith('?appId='+D.appId));requests.push(opts.method||'GET');if(opts.method==='POST'){const body=JSON.parse(opts.body);assert.equal(body.appId,D.appId);assert.equal(body.baseVersion,record?.version??null);assert(E.valid(body.state));record={version:(record?.version||0)+1,state:body.state};return{ok:true,json:async()=>({accepted:true,progress:record})};}return{ok:true,json:async()=>({progress:record})};};
 const s=S.create({getState:()=>state,onRemote:next=>{state=next;},onStatus:(k,t)=>statuses.push([k,t]),fetcher,interval:200000});
 try{await s.start();assert.deepEqual(requests,['GET']);E.submit(state,'u1',0);await s.push();assert.deepEqual(requests,['GET','GET','POST']);assert.equal(E.stats(record.state).first,1);assert.equal(statuses.at(-1)[0],'live');}finally{s.stop();}
});

const require=createRequire(import.meta.url);
let JSDOM;try{({JSDOM}=require('C:/Users/A/Documents/Marco ISEE all tests/tmp/daily-sync-qa/node_modules/jsdom'));}catch{}
test('DOM: hidden review, 16 forms, four-question dividers, two tries and final report',{skip:!JSDOM},()=>{
 const dom=new JSDOM(read('./index.html'),{url:'https://shangguanyun08.github.io/marco-learning-hub/marco-daily-test-review/2026-11-01/?demo=1',runScripts:'outside-only'}),w=dom.window;
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.fetch=()=>{throw Error('Preview must not use live sync');};
 for(const s of[data,engine,syncCode,app])w.eval(s);
 const doc=w.document;assert.equal(doc.querySelectorAll('.question').length,5);assert.equal(doc.querySelectorAll('.solution').length,0);assert.equal(doc.querySelectorAll('.outcome-grid').length,8);
 const example=doc.querySelector('#mock0-32');assert(example);assert.match(example.textContent,/18 possible results/);assert.match(doc.querySelector('#original-42 .outcome-guide').textContent,/20 possible results/);assert.match(example.textContent,/It does not mean someone already tried/);
 assert.equal(example.querySelector('[data-kind="his"]'),null);assert.equal(example.querySelectorAll('.solution').length,0);
 example.querySelector('[data-kind="answer"]').click();assert.match(doc.querySelector('#answer-32').textContent,/Red 1, Red 2, Red 3, and Red 6/);assert.match(doc.querySelector('#answer-32').textContent,/4\/18 = 2\/9/);
 doc.querySelector('#mock0-32 [data-kind="answer"]').click();assert.equal(doc.querySelectorAll('.solution').length,0);
 doc.querySelector('[data-review="41"][data-kind="his"]').click();assert.match(doc.querySelector('#his-41').textContent,/0.14/);assert.equal(doc.querySelectorAll('.solution').length,0);
 doc.querySelector('[data-review="41"][data-kind="answer"]').click();assert.match(doc.querySelector('#answer-41').textContent,/0.20/);assert.equal(doc.querySelectorAll('.trick mark').length,2);
 doc.querySelector('#sessions a[href*="session=1"]').click();assert.equal(doc.querySelectorAll('form[data-question]').length,16);assert.equal(doc.querySelectorAll('textarea').length,0);assert.equal(doc.querySelectorAll('.question-group-divider').length,3);assert.equal(doc.querySelectorAll('.jump-divider').length,3);assert.equal(doc.querySelectorAll('.outcome-grid').length,16);assert.equal(doc.querySelector('#skill-results'),null);
 const submit=(id,j)=>{const form=doc.querySelector('form[data-question="'+id+'"]'),input=form.querySelector('input[value="'+j+'"]');input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));};
 submit('r1',0);assert.match(doc.querySelector('#q-r1 .feedback').textContent,/Incorrect.*Try once more/);assert.equal(doc.querySelector('#q-r1 .answer-reveal'),null);assert(doc.querySelector('#q-r1 input[value="0"]').disabled);
 submit('r1',1);assert(doc.querySelector('#q-r1 .answer-reveal'));assert.equal(doc.querySelector('#q-r1 .answer-reveal').open,false);assert(doc.querySelector('.jump a[href="#q-r1"]').classList.contains('missed'));
 for(const id of w.MarcoMA4Data.ids.slice(1))submit(id,w.MarcoMA4Data.questions[id].correct);
 assert.match(doc.querySelector('#skill-results h2').textContent,/15\/16/);assert.equal(doc.querySelectorAll('#skill-results tbody tr').length,4);assert(doc.querySelector('#sessions .is-complete'));assert.equal(doc.querySelector('#q-r1 label.wrong input').value,'0');
 assert.match(doc.querySelector('#save-note').textContent,/Preview only/);dom.window.close();
});
