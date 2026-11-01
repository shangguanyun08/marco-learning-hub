const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const read=file=>fs.readFileSync(path.join(__dirname,file),'utf8'),tick=()=>new Promise(resolve=>setImmediate(resolve));
async function page({saved={},hash='',live=false}={}){
 const dom=new JSDOM(read('index.html'),{url:'http://localhost/harry-star-reading/meaning-check/'+(live?'':'?demo=1')+hash,runScripts:'outside-only'}),w=dom.window,requests=[],copied=[];
 for(const [key,value]of Object.entries(saved))w.localStorage.setItem(key,value);
 w.fetch=async(url,init={})=>{requests.push({url,method:init.method||'GET'});return {ok:!url.includes('dictionaryapi'),json:async()=>({progress:null})};};
 Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async text=>copied.push(text)}});
 let downloaded;w.Blob=Blob;w.URL.createObjectURL=blob=>(downloaded=blob,'blob:preview');w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};
 for(const file of ['data.js','history-data.js','sync.js','short-meanings.js','app.js'])w.eval(read(file));
 await tick();const doc=w.document,key=w.HARRY_MEANING_CHECK.appId+(live?'':':demo')+':rounds-v2';
 const input=(id,text)=>{const el=doc.querySelector(`[data-word="${id}"] .meaning`);el.focus();el.value=text;el.dispatchEvent(new w.Event('input',{bubbles:true}));return el;};
 return {dom,w,doc,key,requests,copied,input,download:()=>downloaded,state:()=>JSON.parse(w.localStorage.getItem(key)),click:selector=>doc.querySelector(selector).click()};
}

test('one set is visible; all ten sets run through five rounds with independent answers',async()=>{
 const p=await page(),{doc}=p;
 for(let set=1;set<=10;set++){
  p.click(`[data-set="${set}"]`);await tick();const count=set===10?4:10,original=[...doc.querySelectorAll('[data-word]')].map(el=>el.dataset.word);
  assert.equal(doc.querySelectorAll('.word-section').length,1);assert.equal(original.length,count);assert.match(doc.getElementById('overall-progress').textContent,new RegExp(`Set ${set}`));
  for(let round=1;round<=5;round++){
   assert.equal(doc.getElementById('set-heading').textContent,`Round ${round}`);
   const order=[...doc.querySelectorAll('[data-word]')].map(el=>el.dataset.word);assert.deepEqual(order.slice().sort(),original.slice().sort());
   if(round>1){assert.notDeepEqual(order,original);assert.ok([...doc.querySelectorAll('.meaning')].every(el=>el.value===''));assert.match(doc.querySelector('.round-instruction').textContent,/All .* words again/);}
   assert.equal(doc.getElementById('finish-round').disabled,true);
   if(round===1)doc.querySelectorAll('.unknown').forEach(el=>el.click());else for(const id of order)p.input(id,`my ${set}/${round} ${id}`);
   p.click('#finish-round');await tick();assert.match(doc.getElementById('finish-round').textContent,/Round saved/);
   assert.match(doc.getElementById('round-result').textContent,round===1?/Round finished/:/not a correctness score/);
   if(round<5){p.click('#next-round');await tick();}
  }
 }
 assert.equal(Object.keys(p.state().roundSubmissions).length,40);assert.equal(Object.keys(p.state().submissions).length,10);
 p.click('#next-round');await tick();assert.equal(doc.getElementById('set-heading').textContent,'Round 6');assert.equal(doc.querySelectorAll('[data-word]').length,4);
 assert.ok(p.requests.every(r=>r.url.includes('dictionaryapi')),'demo must not contact student progress service');p.dom.window.close();
});

test('refresh, Back, repeated set navigation and unknown toggle preserve exact round drafts and focus',async()=>{
 const p=await page();p.doc.querySelectorAll('.unknown').forEach(el=>el.click());p.click('#finish-round');await tick();p.click('#next-round');await tick();
 const order=[...p.doc.querySelectorAll('[data-word]')].map(el=>el.dataset.word),id=order[0],input=p.input(id,'meaning with spaces ');
 assert.equal(p.doc.activeElement,input);assert.equal(input.value,'meaning with spaces ');p.click(`[data-word="${id}"] .unknown`);assert.equal(input.disabled,true);p.click(`[data-word="${id}"] .unknown`);assert.equal(input.disabled,false);assert.equal(input.value,'meaning with spaces ');
 p.click('[data-set="2"]');await tick();p.w.history.back();await new Promise(resolve=>setTimeout(resolve,30));assert.match(p.doc.getElementById('overall-progress').textContent,/Set 1 · Round 2/);assert.equal(p.doc.querySelector(`[data-word="${id}"] .meaning`).value,'meaning with spaces ');
 p.w.history.back();await new Promise(resolve=>setTimeout(resolve,30));assert.equal(p.doc.getElementById('set-heading').textContent,'Round 1');p.w.history.forward();await new Promise(resolve=>setTimeout(resolve,30));assert.equal(p.doc.getElementById('set-heading').textContent,'Round 2');
 for(let n=0;n<3;n++){p.click('[data-round="1"]');await tick();assert.ok([...p.doc.querySelectorAll('.unknown')].every(el=>el.getAttribute('aria-pressed')==='true'));p.click('[data-round="2"]');await tick();assert.equal(p.doc.querySelector(`[data-word="${id}"] .meaning`).value,'meaning with spaces ');}
 const saved=Object.fromEntries(Array.from({length:p.w.localStorage.length},(_,i)=>p.w.localStorage.key(i)).map(key=>[key,p.w.localStorage.getItem(key)])),fresh=await page({saved});assert.match(fresh.doc.getElementById('overall-progress').textContent,/Set 1 · Round 2/);assert.deepEqual([...fresh.doc.querySelectorAll('[data-word]')].map(el=>el.dataset.word),order);assert.equal(fresh.doc.querySelector(`[data-word="${id}"] .meaning`).value,'meaning with spaces ');
 p.dom.window.close();fresh.dom.window.close();
});

test('legacy drafts, removed-word records and unrelated storage survive; exports include all rounds',async()=>{
 const id='harry-word-meaning-check-20261031-v1:demo',saved={kind:'word-meaning-check',version:1,entries:{ballet:{meaning:{value:'Dancing ',at:10}},cull:{meaning:{value:'old removed answer',at:11}}},submissions:{}};
 const p=await page({saved:{[id]:JSON.stringify(saved),'unrelated-course':'leave me alone'}});assert.equal(p.doc.querySelector('[data-word="ballet"] .meaning').value,'Dancing ');assert.equal(p.w.localStorage.getItem(id+':before-rounds'),JSON.stringify(saved));
 p.doc.querySelectorAll('.meaning').forEach(el=>{if(!el.value)p.input(el.closest('[data-word]').dataset.word,'explanation');});p.click('#finish-round');await tick();p.click('#next-round');await tick();const first=p.doc.querySelector('[data-word]').dataset.word;p.input(first,'<script>not executable</script>');p.click('#copy');await tick();assert.match(p.copied[0],/Set 1 · Round 2/);assert.match(p.copied[0],/not been automatically graded/);assert.equal(p.doc.querySelectorAll('.word-section script').length,0);
 p.click('#download');const exported=JSON.parse(await p.download().text());assert.equal(exported.notAutomaticallyGraded,true);assert.equal(exported.state.entries.cull.meaning.value,'old removed answer');assert.equal(exported.state.entries.ballet.meaning.value,'Dancing ');assert.equal(exported.state.rounds['1:2'].entries[first].meaning.value,'<script>not executable</script>');assert.equal(p.w.localStorage.getItem('unrelated-course'),'leave me alone');p.dom.window.close();
});

test('empty live startup and restore make GET requests only',async()=>{
 const p=await page({live:true});p.click('#restore');await tick();assert.ok(p.requests.some(r=>r.url.includes('/api/shared/progress')));assert.ok(p.requests.every(r=>r.method==='GET'));p.dom.window.close();
});

test('finishing restored Round 1 drafts stays on the saved round until Next is chosen',async()=>{
 const id='harry-word-meaning-check-20261031-v1:demo',dataWindow={};require('node:vm').runInNewContext(read('data.js'),{window:dataWindow});
 const saved={kind:'word-meaning-check',version:1,entries:Object.fromEntries(dataWindow.HARRY_MEANING_CHECK.words.filter(w=>w.section===1).map(w=>[w.id,{meaning:{value:'restored explanation',at:1}}])),submissions:{}};
 const p=await page({saved:{[id]:JSON.stringify(saved)}});assert.equal(p.doc.getElementById('set-heading').textContent,'Round 1');p.click('#finish-round');await tick();assert.equal(p.doc.getElementById('set-heading').textContent,'Round 1');assert.equal(p.doc.getElementById('next-round').hidden,false);p.click('#next-round');await tick();assert.equal(p.doc.getElementById('set-heading').textContent,'Round 2');assert.ok([...p.doc.querySelectorAll('.meaning')].every(el=>el.value===''));p.dom.window.close();
});
