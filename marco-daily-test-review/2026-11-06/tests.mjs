import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const data=read('./data.js'),engine=read('../2026-10-23/engine.js'),sync=read('../2026-10-23/sync.js'),app=read('./app.js');
function setup(){const w={crypto,fetch:async()=>{},AbortController,setTimeout,clearTimeout,setInterval,clearInterval,addEventListener(){},removeEventListener(){},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}},localStorage:{getItem(){return null;},setItem(){}}};const c={window:w,AbortController,console};vm.createContext(c);for(const s of[data,engine,sync])vm.runInContext(s,c);return{D:w.MarcoQR5Data,E:w.MarcoQR4Engine,S:w.MarcoQR4Sync};}
const plain=x=>JSON.parse(JSON.stringify(x));
test('five fresh four-graph questions preserve original miss and vary directions/rate',()=>{
 const{D}=setup();assert.equal(D.ids.length,5);assert.equal(new Set(D.ids).size,5);assert.equal(D.original.chosen,0);assert.equal(D.original.correct,1);assert.equal(D.original.seconds,17);assert.deepEqual(plain(D.original.graphs.map(g=>g.m)),[2,-2,-0.5,0.5]);
 assert.equal(D.appId,'marco-qr-nov06-test5-v1');assert.equal(D.session,'slope-direction-5-v1');
 assert.equal(new Set(D.ids.map(id=>[D.questions[id].dx,D.questions[id].dy,D.questions[id].fast].join())).size,5);
 for(const id of D.ids){const q=D.questions[id];assert.equal(q.graphs.length,4);assert.equal(q.choices.length,4);assert.equal(new Set(q.graphs.map(g=>g.m)).size,4);assert(q.tip&&q.explanation);}
});
test('independent numerical movement check finds exactly one correct graph for each question',()=>{
 const{D}=setup();for(const id of D.ids){const q=D.questions[id],changes=q.graphs.map(g=>(g.m*(2+q.dx)+g.b)-(g.m*2+g.b));const eligible=changes.map((dy,i)=>({i,dy})).filter(x=>Math.sign(x.dy)===q.dy),rates=eligible.map(x=>Math.abs(x.dy)),target=q.fast?Math.max(...rates):Math.min(...rates),winners=eligible.filter(x=>Math.abs(x.dy)===target);assert.equal(winners.length,1,id);assert.equal(winners[0].i,q.correct,id);}
});
test('instant feedback, second chance, fixed first score and final five-question completion',()=>{
 const{D,E}=setup(),s=E.empty(),q=D.questions.g1;assert(E.submit(s,'g1',0,'2026-11-06T18:00:00Z','a'));assert.equal(E.reveal(s,'g1'),false);assert.equal(E.submit(s,'g1',0),false);assert(E.submit(s,'g1',q.correct,'2026-11-06T18:00:20Z','b'));assert(E.reveal(s,'g1'));assert.equal(E.stats(s).first,0);assert.equal(E.stats(s).corrected,1);
 for(const id of D.ids.slice(1))assert(E.submit(s,id,D.questions[id].correct));assert.equal(E.stats(s).first,4);assert(E.firstPass(s));assert(E.valid(s));
});
test('cross-device merge preserves independent first answers',()=>{const{E}=setup(),a=E.empty(),b=E.empty();E.submit(a,'g1',0,'2026-11-06T18:00:00Z','a');E.submit(b,'g2',1,'2026-11-06T18:00:05Z','b');assert.deepEqual(plain(E.merge(a,b)),plain(E.merge(b,a)));assert.equal(E.stats(E.merge(a,b)).answered,2);assert.equal(E.stats(E.merge(a,b)).first,1);});
test('mock sync reads before writes and uses only the new namespace',async()=>{
 const{D,E,S}=setup();let state=E.empty(),record=null;const requests=[];const fetcher=async(url,o={})=>{assert(url.endsWith('?appId='+D.appId));requests.push(o.method||'GET');if(o.method==='POST'){const body=JSON.parse(o.body);assert.equal(body.appId,D.appId);assert.equal(body.baseVersion,record?.version??null);assert(E.valid(body.state));record={version:(record?.version||0)+1,state:body.state};return{ok:true,json:async()=>({accepted:true,progress:record})};}return{ok:true,json:async()=>({progress:record})};};
 const s=S.create({getState:()=>state,onRemote:v=>state=v,onStatus(){},fetcher,interval:999999});try{await s.start();assert.deepEqual(requests,['GET']);E.submit(state,'g1',2);await s.push();assert.deepEqual(requests,['GET','GET','POST']);assert.equal(E.stats(record.state).first,1);}finally{s.stop();}
});
const require=createRequire(import.meta.url);const{JSDOM}=require('C:/Users/A/Documents/Marco ISEE all tests/tmp/daily-sync-qa/node_modules/jsdom');
test('DOM preserves hidden review, five graphical questions, two tries and green completion',()=>{
 const dom=new JSDOM(read('./index.html'),{url:'https://shangguanyun08.github.io/marco-learning-hub/marco-daily-test-review/2026-11-06/?demo=1',runScripts:'outside-only'}),w=dom.window;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.fetch=()=>{throw Error('Demo must not contact live sync');};for(const s of[data,engine,sync,app])w.eval(s);const doc=w.document;
 assert.equal(doc.querySelectorAll('#original-20 svg').length,4);assert.equal(doc.querySelectorAll('.solution').length,0);assert(doc.querySelector('#his-choice').hidden);doc.querySelector('[data-show=his]').click();assert.match(doc.querySelector('#his-choice').textContent,/Graph A.*incorrect/);assert.equal(doc.querySelectorAll('.solution').length,0);doc.querySelector('[data-show=answer]').click();assert.match(doc.querySelector('#original-answer').textContent,/Graph B/);
 doc.querySelector('#sessions a[href*="session=1"]').click();assert.equal(doc.querySelectorAll('form[data-question]').length,5);assert.equal(doc.querySelectorAll('svg.line-plot').length,20);assert.equal(new Set([...doc.querySelectorAll('clipPath')].map(n=>n.id)).size,20);assert.equal(doc.querySelector('#results'),null);assert.equal(doc.querySelectorAll('textarea').length,0);
 const submit=(id,j)=>{const f=doc.querySelector('form[data-question="'+id+'"]'),n=f.querySelector('input[value="'+j+'"]');n.checked=true;n.dispatchEvent(new w.Event('change',{bubbles:true}));f.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));};
 submit('g1',0);assert.match(doc.querySelector('#q-g1 .feedback').textContent,/Incorrect.*Try once more/);assert.equal(doc.querySelector('#q-g1 .answer-reveal'),null);submit('g1',2);assert(doc.querySelector('#q-g1 .answer-reveal'));assert(doc.querySelector('.jump a[href="#q-g1"]').classList.contains('missed'));for(const id of w.MarcoQR5Data.ids.slice(1))submit(id,w.MarcoQR5Data.questions[id].correct);
 assert.match(doc.querySelector('#results h2').textContent,/4\/5/);assert(doc.querySelector('#sessions .is-complete'));assert.equal(doc.querySelectorAll('.report-list li').length,5);assert.match(doc.querySelector('#save-note').textContent,/Preview only/);dom.window.close();
});
