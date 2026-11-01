const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const copy=x=>JSON.parse(JSON.stringify(x));
async function until(check){for(let i=0;i<250;i++){if(check())return;await new Promise(r=>setTimeout(r,10));}throw Error('Sync did not settle');}
function open(t,file,server,{prepare,query=''}={}){
 const html=fs.readFileSync(path.join(__dirname,file),'utf8'),dom=new JSDOM(html,{url:'https://shangguanyun08.github.io/marco-learning-hub/'+file+query,runScripts:'outside-only'}),w=dom.window,calls=[];
 t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 let offline=false;
 w.fetch=async(url,init={})=>{
  const appId=new URL(url).searchParams.get('appId');calls.push({appId,method:init.method||'GET'});if(offline)throw Error('Offline');
  const old=server.get(appId);
  if(init.method==='POST'){
   const b=JSON.parse(init.body);assert.equal(b.appId,appId);
   if((old?.version??null)!==b.baseVersion)return {ok:true,json:async()=>({accepted:false,progress:copy(old)})};
   const next={version:(old?.version||0)+1,state:copy(b.state)};server.set(appId,next);return {ok:true,json:async()=>({accepted:true,progress:copy(next)})};
  }return {ok:true,json:async()=>({progress:old?copy(old):null})};
 };
 for(const script of [...w.document.scripts]){
  const src=script.getAttribute('src');if(src?.includes('activity-tracker'))continue;
  const name=src?.split('?')[0];if(name?.endsWith('app.js'))prepare?.(w);
  w.eval(src?fs.readFileSync(path.resolve(__dirname,path.dirname(file),name),'utf8'):script.textContent);
 }
 return {w,calls,offline(value){offline=value;},storage(key,value){w.localStorage.setItem(key,JSON.stringify(value));w.dispatchEvent(new w.StorageEvent('storage',{key,newValue:JSON.stringify(value)}));}};
}

test('Word Meaning Check resumes auto-save after cached Back navigation and preserves other-tab drafts',async t=>{
 const server=new Map(),p=open(t,'marco-vr-practice/meaning-check/index.html',server),w=p.w,id=w.document.querySelector('[data-word]').dataset.word,key=w.MARCO_MEANING_CHECK.appId;
 await until(()=>w.document.querySelector('#save-note').dataset.kind==='live');
 w.dispatchEvent(new w.Event('pagehide'));w.dispatchEvent(new w.Event('pageshow'));
 const input=w.document.querySelector('#meaning-'+id.replace(/^word-/,''))||w.document.querySelector('.meaning');
 input.value='a saved meaning';input.dispatchEvent(new w.Event('input',{bubbles:true}));
 await until(()=>server.get(key)?.state.rounds['1:1'].entries[id]?.meaning?.value==='a saved meaning');
 const other=copy(server.get(key).state);other.rounds['1:1'].entries[id].tone={value:'positive',at:Date.now()+100};p.storage(key+':rounds-v2',other);
 await until(()=>server.get(key).state.rounds['1:1'].entries[id].tone?.value==='positive');
 assert.equal(server.get(key).state.rounds['1:1'].entries[id].meaning.value,'a saved meaning');
 assert.equal(Object.keys(server.get(key).state.submissions).length,0);
 const second=open(t,'marco-vr-practice/meaning-check/index.html',server);await until(()=>second.w.document.querySelector('.meaning').value==='a saved meaning');
 assert.equal(second.calls.filter(c=>c.method==='POST').length,0);
});

test('math dashboard recovers Review 2 from the device and a second device gets the same first answer',async t=>{
 const server=new Map(),key='marco-math-skill-builder-oct12-review2-v1';let question;
 const p=open(t,'marco-daily-test-review/math-skill-builder-2026-10-12/index.html',server,{prepare(w){const E=w.MarcoReview2Engine,D=w.MarcoReview2Data,s=E.empty();question=D.ids[0];E.submit(s,question,(D.questions[question].correct+1)%4,'2026-10-28T18:00:00Z','first-answer-000001');w.localStorage.setItem(key,JSON.stringify(s));}});
 await until(()=>server.get(key));assert.equal(server.get(key).state.sessions['review2-v1'][0].answers[question].attempts[0].correct,false);
 assert.match(p.w.document.querySelector('[data-review-sync="2"]').textContent,/1\/60 answered · Saved online/);
 const second=open(t,'marco-daily-test-review/math-skill-builder-2026-10-12/index.html',server);
 await until(()=>second.w.localStorage.getItem(key));assert.deepEqual(JSON.parse(second.w.localStorage.getItem(key)),server.get(key).state);
 assert.equal(second.calls.filter(c=>c.method==='POST').length,0);
});

test('opening QR Practice 1 recovers offline Practice 2 answers, merges conflicts, then updates a second device',async t=>{
 const server=new Map(),key='marco-qr-oct23-test4-practice2-v1';let id;
 const first=open(t,'marco-daily-test-review/2026-10-23/index.html',server,{prepare(w){const D=w.MarcoQR4Practice2Data,E=w.MarcoQR4Engine.forCourse(D),s=E.empty(),remote=E.empty();id=D.ids[0];E.submit(s,id,(D.questions[id].correct+1)%4,'2026-10-28T17:00:00Z','offline-answer-0001');E.submit(remote,D.ids[1],D.questions[D.ids[1]].correct,'2026-10-28T17:01:00Z','other-answer-00001');server.set(key,{version:1,state:copy(remote)});w.localStorage.setItem(key,JSON.stringify(s));}});
 await until(()=>server.get(key).version===2);
 assert.equal(Object.keys(server.get(key).state.sessions['mixed-20-practice2-v1'][0].answers).length,2);
 assert.equal(server.get(key).state.sessions['mixed-20-practice2-v1'][0].answers[id].attempts[0].correct,false);
 assert.match(first.w.document.querySelector('[data-practice-sync="2"]').textContent,/Saved online/);
 const second=open(t,'marco-daily-test-review/2026-10-23/index.html',server,{query:'?session=2'});
 await until(()=>second.w.localStorage.getItem(key));assert.deepEqual(JSON.parse(second.w.localStorage.getItem(key)),server.get(key).state);
 assert.equal(second.calls.filter(c=>c.method==='POST').length,0);
});
