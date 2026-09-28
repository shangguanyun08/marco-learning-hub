import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import test from 'node:test';
const {JSDOM}=createRequire(import.meta.url)('jsdom');
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const KEY='marco-isee-middle-sept27-v1';
const copy=value=>JSON.parse(JSON.stringify(value));
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check){for(let i=0;i<150;i++){if(check())return;await delay(10);}throw Error('Sync did not settle');}
function server(){
  let progress=null,posts=0;
  return {get progress(){return copy(progress);},get posts(){return posts;},async fetch(url,options={}){
    assert.equal(url,'https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress?appId='+KEY);
    if(options.method!=='POST')return {ok:true,json:async()=>({progress:copy(progress)})};
    const body=JSON.parse(options.body);assert.equal(body.appId,KEY);posts++;
    const accepted=body.baseVersion===(progress?.version??null);
    if(accepted)progress={state:copy(body.state),version:(progress?.version||0)+1};
    return {ok:true,json:async()=>({accepted,progress:copy(progress)})};
  }};
}
function page(remote,id='vr-1',saved){
  const dom=new JSDOM(read('index.html'),{url:'https://shangguanyun08.github.io/marco-learning-hub/marco-daily-test-review/2026-09-27/?session='+id,runScripts:'outside-only'}),w=dom.window;
  const p={w,doc:w.document,offline:false,status:null,client:null,intervals:[],close(){p.client?.stop();w.close();}};
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.fetch=(...args)=>p.offline?Promise.reject(Error('Offline test')):remote.fetch(...args);
  const setInterval=w.setInterval.bind(w);w.setInterval=(fn,ms)=>{p.intervals.push(ms);return setInterval(fn,ms);};
  if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));
  for(const file of ['data.js','engine.js','sync.js','visuals.js'])w.eval(read(file));
  const create=w.MarcoIseeSync.create;
  w.MarcoIseeSync.create=options=>p.client=create({...options,onStatus(kind,message){p.status=kind;options.onStatus(kind,message);}});
  w.eval(read('app.js'));
  p.state=()=>JSON.parse(w.localStorage.getItem(KEY)||'{"version":1,"sessions":{}}');
  p.navigate=id=>p.doc.querySelector('#sessions a[href="?session='+id+'"]').click();
  p.submit=(q,choice)=>{const form=p.doc.querySelector('form[data-source="'+q.source+'"]');form.querySelector('input[value="'+choice+'"]').checked=true;form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));};
  return p;
}

test('both VR sessions sync answers, retries, scores, completed history and offline recovery across devices',async()=>{
  const remote=server(),a=page(remote),b=page(remote);let reload;
  try{
    await until(()=>a.status==='live'&&b.status==='live');
    assert.ok(a.intervals.includes(2000));assert.equal(remote.posts,0,'Untouched pages must not overwrite online progress');
    for(const p of [a,b])assert.match(p.doc.querySelector('.session-group:last-child [data-sync-indicator]').textContent,/Live online sync/);
    const bank=a.w.MARCO_ISEE_PRACTICE,q=bank[3].questions[0];
    a.submit(q,(q.correct+1)%q.choices.length);
    await until(()=>remote.progress?.state.sessions['vocab-original']?.[0].answers[q.source]);
    await b.client.refresh();
    assert.equal(b.state().sessions['vocab-original'][0].answers[q.source].attempts.length,1);
    assert.equal(b.doc.querySelector('#q1 .answer'),null,'First wrong attempt still hides the explanation');
    b.submit(q,q.correct);
    await until(()=>remote.progress.state.sessions['vocab-original'][0].answers[q.source].attempts.length===2);
    await a.client.refresh();
    assert.ok(a.doc.querySelector('#q1 .answer'));assert.equal(a.doc.querySelector('#verbal-score').textContent,'0 / 8');
    const remaining=bank[3].questions.slice(1);
    for(const item of remaining)a.submit(item,item.correct);
    await until(()=>a.status==='live');await a.client.refresh();await b.client.refresh();
    assert.equal(b.doc.querySelector('#verbal-score').textContent,'7 / 8');
    assert.match(b.doc.querySelector('#completion').textContent,/Session complete/);
    assert.ok(b.state().sessions['vocab-original'][0].completedAt);
    a.doc.querySelector('#new-run').click();await until(()=>a.status==='live');await a.client.refresh();await b.client.refresh();
    assert.equal(b.state().sessions['vocab-original'].length,2);
    assert.equal(b.doc.querySelector('#verbal-score').textContent,'0 / 8');
    assert.match(b.doc.querySelector('#history').textContent,/7\/8/);
    a.navigate('vr-2');b.navigate('vr-2');
    assert.equal(a.doc.querySelector('#verbal-score').textContent,'0 / 8');
    a.offline=true;a.submit(bank[4].questions[0],bank[4].questions[0].correct);
    await until(()=>a.status==='offline');
    assert.match(a.doc.querySelector('.session-intro [data-sync-indicator]').textContent,/Offline/);
    assert.equal(a.state().sessions['vocab-repeat'][0].answers[q.source].attempts.length,1);
    a.offline=false;a.w.dispatchEvent(new a.w.Event('online'));
    await until(()=>a.status==='live');await b.client.refresh();
    assert.equal(b.doc.querySelector('#verbal-score').textContent,'1 / 8');
    assert.equal(b.state().sessions['vocab-original'].length,2,'VR sessions keep independent histories');
    assert.equal(remote.progress.state.sessions['math-original'],undefined,'VR practice does not create math scores');
    reload=page(remote,'vr-2');await until(()=>reload.status==='live');
    assert.equal(reload.doc.querySelector('#verbal-score').textContent,'1 / 8');
    assert.equal(reload.state().sessions['vocab-original'].length,2);
    assert.match(reload.doc.querySelector('#save-note').textContent,/Math and VR progress saved online/);
  }finally{a.close();b.close();reload?.close();}
});

test('a new device preserves existing local VR work while importing math and the other VR session',async()=>{
  const remote=server(),a=page(remote,'session-1');let b;
  try{
    await until(()=>a.status==='live');const bank=a.w.MARCO_ISEE_PRACTICE;
    a.submit(bank[0].questions[0],bank[0].questions[0].correct);await until(()=>a.status==='live');await a.client.refresh();
    a.navigate('vr-1');a.submit(bank[3].questions[0],bank[3].questions[0].correct);await until(()=>a.status==='live');await a.client.refresh();
    const q=bank[4].questions[1],at=new Date().toISOString();
    const local={version:1,sessions:{'vocab-repeat':[{id:'local-only',startedAt:at,completedAt:null,answers:{[q.source]:{attempts:[{choice:q.correct,correct:true,at}]}}}]}};
    b=page(remote,'vr-2',local);await until(()=>b.status==='live');
    assert.equal(b.doc.querySelector('#verbal-score').textContent,'1 / 8');
    assert.ok(remote.progress.state.sessions['math-original']);assert.ok(remote.progress.state.sessions['vocab-original']);assert.ok(remote.progress.state.sessions['vocab-repeat']);
    a.w.dispatchEvent(new a.w.Event('focus'));await until(()=>a.state().sessions['vocab-repeat']?.length===1);
    assert.equal(a.state().sessions['vocab-repeat'][0].id,'local-only');
  }finally{a.close();b?.close();}
});
