import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let JSDOM;
try{({JSDOM}=require('jsdom'));}catch{({JSDOM}=require('../../../tmp/daily-sync-qa/node_modules/jsdom/lib/api.js'));}
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8'), plain=x=>JSON.parse(JSON.stringify(x));
const common=['data.js','../../marco-daily-test-review/2026-10-11/engine.js','thinking.js','clues.js','sync.js'];
const context=vm.createContext({crypto:{randomUUID},setTimeout,clearTimeout,setInterval,clearInterval,AbortController,fetch:async()=>{},localStorage:{getItem(){return null},setItem(){}},addEventListener(){},removeEventListener(){},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}}});context.window=context;for(const p of common)vm.runInContext(read(p),context);
const bank=context.MARCO_ISEE_PRACTICE[0], displayed=[...bank.questions.filter(q=>q.type==='synonym'),...bank.questions.filter(q=>q.type!=='synonym')], E=context.MarcoTest3Engine, S=context.MarcoTest3Sync, KEY='marco-vr-kindle-tests1-2-hard-20261024-v1';
function page(t,{saved,pathname='index.html',script='all-questions.js'}={}){
 const dom=new JSDOM(read(pathname),{url:'http://localhost:8793/marco-vr-practice/kindle-tests-1-2/?demo=1',runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());
 let network=0;w.fetch=()=>{network++;throw new Error('Preview must not use network');};w.scrollTo=()=>{};
 w.localStorage.setItem('marco-vr-practice-oct22-test4-v1','original record sentinel');
 w.localStorage.setItem('marco-vr-word-checklist-v1','parent selections sentinel');
 if(saved)w.localStorage.setItem(KEY+':preview',JSON.stringify(saved));for(const p of common)w.eval(read(p));w.eval(read(script));
 return {w,doc:w.document,network:()=>network,state:()=>JSON.parse(w.localStorage.getItem(KEY+':preview')||'null')};
}
function prepare(p,choice){
 const i=Number(new URL(p.w.location.href).searchParams.get('q')||1)-1,q=displayed[i],getCard=()=>p.doc.querySelector('#q-'+(i+1)),form=getCard().querySelector('.prediction-form');
 if(form){const text=form.querySelector('.prediction-input');if(text){text.value='my predicted meaning';text.dispatchEvent(new p.w.Event('input',{bubbles:true}));}else getCard().querySelector('[data-clue]').click();getCard().querySelector('.prediction-form button[type=submit]').click();}
 const run=p.state().sessions[bank.id].at(-1),locked=(run.answers[q.source]?.attempts||[]).map(a=>a.choice),wanted=[...new Set([...locked,...q.choices.map((_,i)=>i).filter(i=>i!==choice&&i!==q.correct)])].slice(0,2);
 for(const button of [...getCard().querySelectorAll('[data-eliminate][aria-pressed=true]')])if(!button.disabled&&!wanted.includes(Number(button.dataset.eliminate)))button.click();
 for(const cut of wanted){const button=getCard().querySelector(`[data-eliminate="${cut}"]`);if(button.getAttribute('aria-pressed')!=='true')button.click();}
}
function answer(p,choice){prepare(p,choice);const i=Number(new URL(p.w.location.href).searchParams.get('q')||1),c=p.doc.querySelector('#q-'+i),input=c.querySelector(`input[name=answer][value="${choice}"]`);assert.ok(input);assert.equal(input.disabled,false);input.checked=true;input.dispatchEvent(new p.w.Event('change',{bubbles:true}));c.querySelector('.answer-form').dispatchEvent(new p.w.Event('submit',{bubbles:true,cancelable:true}));}
test('24 verified references, original choice orders and keys, balanced across both tests',()=>{
 assert.equal(bank.questions.length,24);assert.equal(new Set(bank.questions.map(q=>q.source)).size,24);
 assert.equal(bank.questions.filter(q=>q.test===1).length,12);assert.equal(bank.questions.filter(q=>q.test===2).length,12);
 assert.equal(bank.questions.filter(q=>q.type==='synonym').length,15);assert.equal(bank.questions.filter(q=>q.type==='sentence completion').length,9);
 const expected={101:['fearless|forgetful|joyful|unwilling',3],102:['concise|polite|truthful|vague',0],106:['confident|exhausted|generous|indirect',3],112:['impulsive|ordinary|prudent|severe',2],116:['accuse|delay|discourage|exonerate',3],117:['anxious|generous|obedient|self-satisfied',3],118:['casual|hasty|painstaking|playful',2],120:['accidental|cautious|deliberate|generous',0],124:['immediate|steady|effortless|sporadic',3],125:['reticent|patient|decisive|grateful',0],136:['hurried|sarcastic|reverent|casual',2],140:['arbitrary|precise|familiar|generous',0],206:['cautious|cheerful|insensitive|obedient',2],207:['celebrated|nearby|polished|puzzling',3],208:['detect|ignore|repair|summarize',0],211:['noisy|obvious|reckless|tactful',3],212:['alleviate|examine|intensify|predict',0],213:['crowded|grateful|impoverished|wealthy',2],217:['confident|exact|permanent|provisional',3],223:['flexible|antiquated|convenient|costly',1],224:['versatile|fragile|decorative|expensive',0],225:['obscure|succinct|repetitive|speculative',1],233:['reserved|confused|boastful|reckless',0],234:['indifferent|receptive|unaware|resistant',1]};
 for(const q of bank.questions){assert.equal(q.choices.join('|'),expected[q.source][0]);assert.equal(q.correct,expected[q.source][1]);for(const key of ['meaning','tip','explanation','selection','evidence','skill'])assert.ok(q[key]?.length>8,`${q.source}: ${key}`);assert.ok(q.related.length);assert.ok(q.number>=1&&q.number<=20);}
 assert.equal(Object.keys(expected).length,24);assert.equal(context.KINDLE_VR_SELECTION.reviewed,80);assert.match(context.KINDLE_VR_SELECTION.note,/not official ratings/);assert.match(context.KINDLE_VR_SELECTION.note,/exception/);
});
test('first wrong answer gives instant feedback but no key, meaning or trick; distinct retry reveals all',t=>{
 const p=page(t);assert.equal(p.doc.querySelector('.solution'),null);p.doc.querySelector('[data-action=start]').click();
 assert.equal(p.doc.querySelectorAll('.mixed-nav a').length,24);assert.equal(p.doc.querySelectorAll('.mixed-nav .jump').length,4);
 answer(p,0);assert.match(p.doc.querySelector('.feedback').textContent,/Not quite/);assert.equal(p.doc.querySelector('.solution'),null);assert.equal(p.doc.querySelector('.meaning'),null);assert.equal(p.doc.querySelector('.trick'),null);assert.equal(p.doc.querySelector('input[value="0"]').disabled,true);assert.equal(p.doc.querySelectorAll('article.question').length,24);
 const run=p.state().sessions[bank.id][0];assert.equal(run.answers[101].attempts.length,1);answer(p,3);
 assert.match(p.doc.querySelector('.solution').textContent,/unwilling/);assert.ok(p.doc.querySelector('.trick'));assert.ok(p.doc.querySelector('.selection-note'));assert.ok(p.doc.querySelector('#q-2'));assert.match(p.doc.querySelector('.run-score').textContent,/0\/24/);assert.equal(p.state().sessions[bank.id][0].answers[101].attempts.length,2);assert.equal(p.network(),0);
});
test('correct first answer reveals solution; two wrong attempts close without awarding a point',t=>{
 const a=page(t);a.doc.querySelector('[data-action=start]').click();answer(a,3);assert.match(a.doc.querySelector('.feedback').textContent,/Correct first try/);assert.match(a.doc.querySelector('.run-score').textContent,/1\/24/);
 const b=page(t);b.doc.querySelector('[data-action=start]').click();answer(b,0);answer(b,1);assert.match(b.doc.querySelector('.feedback').textContent,/Two tries/);assert.ok(b.doc.querySelector('.solution'));assert.match(b.doc.querySelector('.run-score').textContent,/0\/24/);assert.equal(b.doc.querySelectorAll('#q-1 input[name=answer]:not(:disabled)').length,0);
});
test('all 24 can finish, green completion and per-skill summary appear, new run preserves the old',t=>{
 const p=page(t);p.doc.querySelector('[data-action=start]').click();
 displayed.forEach((q,i)=>{p.doc.querySelector(`[data-question="${i}"]`).click();answer(p,q.correct);});
 assert.ok(p.doc.querySelector('#practice-status').classList.contains('is-complete'));assert.match(p.doc.querySelector('.run-score').textContent,/24\/24/);assert.equal(p.doc.querySelectorAll('.skill-table tbody tr').length,4);assert.equal([...p.doc.querySelectorAll('.skill-table tbody tr')].reduce((n,r)=>n+Number(r.cells[1].textContent.split('/')[0]),0),24);
 assert.ok(p.state().sessions[bank.id][0].completedAt);p.doc.querySelector('[data-action=start]').click();assert.equal(p.state().sessions[bank.id].length,2);assert.ok(p.state().sessions[bank.id][0].completedAt);assert.equal(p.state().sessions[bank.id][1].completedAt,null);assert.equal(p.doc.querySelector('.solution'),null);
 assert.equal(p.w.localStorage.getItem('marco-vr-practice-oct22-test4-v1'),'original record sentinel');assert.equal(p.w.localStorage.getItem('marco-vr-word-checklist-v1'),'parent selections sentinel');assert.equal(p.w.localStorage.getItem(KEY),null);assert.equal(p.network(),0);
});
test('reload preserves first attempt and selected retry without leaking explanation',t=>{
 const p=page(t);p.doc.querySelector('[data-action=start]').click();answer(p,0);prepare(p,3);const radio=p.doc.querySelector('input[value="3"]');radio.checked=true;radio.dispatchEvent(new p.w.Event('change',{bubbles:true}));
 const next=page(t,{saved:p.state()});assert.equal(next.doc.querySelector('input[value="0"]').disabled,true);assert.equal(next.doc.querySelector('input[value="3"]').checked,true);assert.equal(next.doc.querySelector('.solution'),null);answer(next,3);assert.ok(next.doc.querySelector('.solution'));
});
test('isolated sync namespace saves and merges to a second simulated device',async()=>{
 assert.equal(S.APP_ID,KEY);let record=null,version=0;const calls=[];
 const fetcher=async(url,options)=>{calls.push(url);if(options.method==='POST'){const body=JSON.parse(options.body);assert.equal(body.appId,KEY);record={state:body.state,version:++version};return {ok:true,json:async()=>({accepted:true,progress:record})};}return {ok:true,json:async()=>({progress:record})};};
 const run=E.start(bank);E.submit(run,bank.questions[0],0);let a={version:1,sessions:{[bank.id]:[run]}},b={version:1,sessions:{}};
 await S.create({getState:()=>a,onRemote:x=>a=x,onStatus(){},fetcher}).refresh();await S.create({getState:()=>b,onRemote:x=>b=x,onStatus(){},fetcher}).refresh();assert.equal(b.sessions[bank.id][0].answers[101].attempts[0].choice,0);assert.ok(calls.every(url=>url.endsWith('?appId='+KEY)));assert.ok(S.valid(b));
});
test('library exposes one previous-mocks entry and preserves all old links on its new group page',()=>{
 const root=new JSDOM(read('../index.html')),old=new JSDOM(read('../previous-mocks.html'));
 assert.ok(root.window.document.querySelector('#kindle-focused-card[href="./kindle-vr-focused/practice.html?page=1"]'));assert.ok(read('../kindle-tests-1-8/index.html').includes('../kindle-tests-1-2/?v=20261024-edit3'));assert.ok(read('../kindle-vr-focused/practice.html').includes('../kindle-tests-1-8/'));assert.ok(root.window.document.querySelector('#previous-mocks[href="./previous-mocks.html"]'));assert.equal(root.window.document.querySelectorAll('#oct22-test,#test3-review,#test2-review,#test1-review').length,0);
 for(const[id,path]of [['oct22-test','2026-10-22'],['test3-review','2026-10-11'],['test2-review','2026-10-04'],['test1-review','2026-09-27']])assert.ok(old.window.document.querySelector(`#${id}[href^="./${path}/"]`));assert.ok(old.window.document.getElementById('oct22-status'));assert.ok(old.window.document.querySelector('a[href^="./combined-review.html"]'));root.window.close();old.window.close();
});
test('archived Tests 1–2 completion keeps its original namespace and turns green',t=>{
 const run=E.start(bank);for(const q of bank.questions)E.submit(run,q,q.correct);run.completedAt=new Date().toISOString();const saved={version:1,sessions:{[bank.id]:[plain(run)]}};
 const p=page(t,{saved});assert.ok(p.doc.querySelector('#practice-status').classList.contains('is-complete'));assert.match(p.doc.querySelector('.run-score').textContent,/24\/24/);assert.equal(p.network(),0);
});
test('public links resolve and no screenshot, account identifier, or video is published',()=>{
 for(const file of ['index.html','../index.html','../previous-mocks.html']){const dom=new JSDOM(read(file));for(const el of dom.window.document.querySelectorAll('[src],[href]')){const value=el.getAttribute('src')||el.getAttribute('href');if(!value||value.startsWith('#')||/^[a-z]+:/i.test(value))continue;const path=value.split(/[?#]/)[0];assert.ok(existsSync(new URL(path,new URL(file,import.meta.url))),`${file}: ${value}`);}dom.window.close();}
 assert.doesNotMatch(['index.html','data.js','all-questions.js'].map(read).join(''),/5003638|students\/analysis|read\.amazon\.com|C:\\Users|<img|\.mp4/);assert.match(read('all-questions.js'),/if \(!preview\)/);
});
