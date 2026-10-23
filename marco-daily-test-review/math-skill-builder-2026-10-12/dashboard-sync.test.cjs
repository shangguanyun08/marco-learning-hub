const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),MAIN='marco-math-skill-builder-oct12-v1',KEY=n=>`marco-math-skill-builder-oct12-review${n}-v1`,copy=x=>JSON.parse(JSON.stringify(x));
const scripts=[...read('index.html').matchAll(/<script defer src="([^"?]+)[^"]*"/g)].map(x=>x[1]).filter(x=>x!=='app.js'&&!x.startsWith('../'));
const wait=()=>new Promise(r=>setTimeout(r,40));
function open(t,server,seed={},offline=false){
 const dom=new JSDOM(read('index.html'),{url:'https://shangguanyun08.github.io/marco-learning-hub/marco-daily-test-review/math-skill-builder-2026-10-12/',runScripts:'outside-only'}),w=dom.window;t.after(()=>w.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 for(const [key,value]of Object.entries(seed))w.localStorage.setItem(key,JSON.stringify(value));
 const calls=[];w.fetch=async(url,opt={})=>{if(offline)throw Error('Offline');const appId=new URL(url).searchParams.get('appId');calls.push({appId,method:opt.method});if(opt.method==='POST'){
  const b=JSON.parse(opt.body),old=server.get(appId);if(old&&(old.version!==b.baseVersion))return{ok:true,json:async()=>({accepted:false,progress:copy(old)})};
  const next={state:b.state,version:(old?.version||0)+1};server.set(appId,next);return{ok:true,json:async()=>({accepted:true,progress:copy(next)})};
 }return{ok:true,json:async()=>({progress:server.has(appId)?copy(server.get(appId)):null})};};
 for(const file of scripts)w.eval(read(file));
 return{w,calls,launch:()=>w.eval(read('app.js')),online(){offline=false;w.dispatchEvent(new w.Event('online'));}};
}
test('opening only the dashboard recovers offline Review 5 answers and a second device receives them',async t=>{
 const server=new Map(),first=open(t,server),E=first.w.MarcoReview5Engine,D=first.w.MarcoReview5Data,s=E.empty();
 for(const id of D.ids)E.submit(s,id,(D.questions[id].correct+1)%4,'2026-10-23T00:30:00Z',first.w.crypto.randomUUID());
 for(const id of D.ids)E.submit(s,id,D.questions[id].correct,'2026-10-23T01:00:00Z',first.w.crypto.randomUUID());
 first.w.localStorage.setItem(KEY(5),JSON.stringify(s));first.launch();await wait();
 const saved=server.get(KEY(5));assert.ok(saved);assert.equal(E.stats(saved.state).answered,20);assert.equal(E.stats(saved.state).first,0);assert.equal(E.stats(saved.state).corrected,20);assert.deepEqual(copy(saved.state),copy(E.merge(s,E.empty())));
 assert.match(first.w.document.querySelector('[data-review-sync="5"]').textContent,/20\/20 answered · Saved online/);
 const second=open(t,server);second.launch();await wait();assert.match(second.w.document.querySelector('.review5-card').textContent,/First try: 0%/);assert.match(second.w.document.querySelector('.review5-card').textContent,/Done/);
 assert.equal(second.calls.filter(x=>x.method==='POST').length,0);assert.deepEqual(JSON.parse(second.w.localStorage.getItem(KEY(5))),copy(saved.state));
});
test('offline dashboard keeps local answers and manual retry merges another device without raising first score',async t=>{
 const server=new Map(),device=open(t,server,{},true),E=device.w.MarcoReview5Engine,D=device.w.MarcoReview5Data,s=E.empty(),other=E.empty(),id=D.ids[0];
 E.submit(s,id,(D.questions[id].correct+1)%4,'2026-10-23T00:30:00Z','first-local');E.submit(other,D.ids[1],D.questions[D.ids[1]].correct,'2026-10-23T00:31:00Z','other-device');server.set(KEY(5),{version:1,state:copy(other)});
 device.w.localStorage.setItem(KEY(5),JSON.stringify(s));const original=device.w.localStorage.getItem(KEY(5));device.launch();await wait();assert.match(device.w.document.querySelector('[data-review-sync="5"]').textContent,/Not synced/);assert.equal(device.w.localStorage.getItem(KEY(5)),original);
 device.online();device.w.document.getElementById('sync-all').click();await wait();const merged=server.get(KEY(5)).state;assert.equal(E.stats(merged).answered,2);assert.equal(E.stats(merged).first,1);assert.equal(E.attempts(merged,id)[0].id,'first-local');
});
