import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {JSDOM} from 'jsdom';
const base=new URL('../',import.meta.url);
const data=JSON.parse(await readFile(new URL('data.json',base),'utf8'));
const key='marco-application-family-editor-v1';
async function editor(saved,options={}){
 const html=await readFile(new URL('index.html',base),'utf8');
 const dom=new JSDOM(html,{url:options.online?'https://essay-test.example/application/':'http://localhost:8080/application/?demo=1',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,errors=[];w.addEventListener('error',e=>errors.push(e.error));
 w.structuredClone=structuredClone;w.fetch=options.fetcher||(async()=>{throw new Error('Tests must not use the network.');});Object.defineProperty(w,'crypto',{value:webcrypto});
 w.ResizeObserver=class{observe(){}disconnect(){}};w.scrollTo=()=>{};w.print=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.SVGElement.prototype.setPointerCapture=()=>{};
 if(saved)w.localStorage.setItem(key,JSON.stringify(saved));
 const context=dom.getInternalVMContext(),cache=new Map();
 for(const name of ['app.js','cloud-sync.mjs','sync-model.mjs','review-model.mjs','review-ui.mjs']){const url=new URL(name,base);cache.set(url.pathname,new vm.SourceTextModule(await readFile(url,'utf8'),{context,identifier:url.href}));}
 const root=cache.get(new URL('app.js',base).pathname);await root.link((specifier,parent)=>cache.get(new URL(specifier,parent.identifier).pathname));await root.evaluate();
 const $=s=>w.document.querySelector(s),click=s=>$(s).click(),input=(s,text)=>{const el=$(s);el.value=text;el.dispatchEvent(new w.Event('input',{bubbles:true}));};
 if(options.draft!==false)click('[data-comparison-mode="draft"]');
 return {dom,w,$,click,input,errors,saved:()=>JSON.parse(w.localStorage.getItem(key)),close:()=>w.close()};
}
test('loads existing work in one complete question, then navigates question by question',async()=>{
 const saved={schema:1,source:data.source,question:1,view:'paragraph',paragraph:2,edits:Object.fromEntries(data.questions.flatMap(q=>q.paragraphs.map(p=>[p.id,{text:p.original,note:'',status:'review'}]))),reviews:{'1.1':{choice:'agree',note:'Check this'}}};
 saved.edits['q1-p2'].text='Earlier family wording.';saved.edits['q1-p2'].note='Keep my note';
 const e=await editor(saved);try{
  assert.equal(e.$('[data-answer-edit]').value,data.questions[0].paragraphs.map(p=>saved.edits[p.id].text).join('\n\n'));
  assert.equal(e.w.document.querySelectorAll('.editor-pair').length,1);assert.equal(e.w.document.querySelectorAll('.answer-original p').length,data.questions[0].paragraphs.length);
  assert.equal(e.$('[data-note="q1-p2"]').value,'Keep my note');assert.equal(e.$('#paragraph-view'),null);
  e.click('[data-action="ready-next"]');assert.equal(e.saved().question,2);assert.equal(e.$('#position-label').textContent,'Question 2 of 5');
  assert.equal(e.$('[data-answer-edit]').value,data.questions[1].paragraphs.map(p=>p.original).join('\n\n'));assert.equal(e.saved().edits['q1-p2'].status,'ready');
  assert.deepEqual(e.errors,[]);
 }finally{e.close();}
});
test('whole-answer edits preserve arbitrary paragraph counts, notes, and source wording',async()=>{
 const e=await editor();try{
  const text=Array.from({length:12},(_,i)=>`Family paragraph ${i+1}.`).join('\n\n');e.input('[data-answer-edit]',text);
  const saved=e.saved();assert.equal(data.questions[0].paragraphs.map(p=>saved.edits[p.id].text).filter(Boolean).join('\n\n'),text);
  e.click('[data-question="2"]');e.click('[data-question="1"]');assert.equal(e.$('[data-answer-edit]').value,text);
  assert.equal(e.$('.answer-original p').textContent,data.questions[0].paragraphs[0].original);assert.deepEqual(e.errors,[]);
 }finally{e.close();}
});
test('selected-text notes persist, are editable, and keep their original text reference',async()=>{
 const e=await editor();let persisted;try{
  const el=e.$('[data-answer-edit]');el.setSelectionRange(0,16);e.click('[data-action="note-revision"]');
  assert.equal(e.$('#annotation-quote').value,el.value.slice(0,16));e.input('#annotation-note','Keep this opening and shorten the story.');e.click('[data-action="save-annotation"]');
  let notes=Object.values(e.saved().annotations).filter(Boolean);assert.equal(notes.length,1);assert.equal(notes[0].question,1);assert.equal(notes[0].side,'revision');
  e.input('[data-annotation-note]','Use warmer wording.');e.input('[data-answer-edit]','New answer after the note.');e.click('[data-annotation-open]');assert.match(e.$('.reference-changed').textContent,/changed/);e.click('[data-action="close-modal"]');
  persisted=e.saved();assert.equal(Object.values(persisted.annotations)[0].note,'Use warmer wording.');assert.deepEqual(e.errors,[]);
 }finally{e.close();}
 const reloaded=await editor(persisted);try{assert.equal(reloaded.$('[data-answer-edit]').value,'New answer after the note.');assert.equal(reloaded.$('[data-annotation-note]').value,'Use warmer wording.');}finally{reloaded.close();}
});
test('dragging creates a circled note with normalized geometry on the correct answer',async()=>{
 const e=await editor();try{
  const svg=e.$('[data-annotation-layer="original"]');svg.getBoundingClientRect=()=>({left:0,top:0,right:400,bottom:500,width:400,height:500});
  e.click('[data-action="annotate"]');assert.equal(e.$('#annotation-toolbar').hidden,false);
  for(const [type,x,y] of [['pointerdown',30,40],['pointermove',250,170],['pointerup',250,170]]){const event=new e.w.MouseEvent(type,{clientX:x,clientY:y,bubbles:true});Object.defineProperty(event,'pointerId',{value:1});svg.dispatchEvent(event);}
  assert.equal(e.$('#modal').open,true);e.input('#annotation-note','Please shorten this part.');e.click('[data-action="save-annotation"]');
  const a=Object.values(e.saved().annotations).filter(Boolean)[0];assert.equal(a.side,'original');assert.equal(a.question,1);assert.deepEqual(a.rect,{x:.075,y:.08,w:.55,h:.26});assert.equal(a.targetWidth,400);assert.equal(e.$('#annotation-toolbar').hidden,true);assert.deepEqual(e.errors,[]);
 }finally{e.close();}
});
test('saving and restoring versions keeps the current draft as another version',async()=>{
 const e=await editor();try{
  e.input('[data-answer-edit]','My first complete answer.');e.click('[data-action="versions"]');e.input('#version-label','Mom’s first review');e.click('[data-action="save-version"]');await new Promise(r=>setImmediate(r));
  const id=Object.values(e.saved().versions).find(v=>v.label==='Mom’s first review').id;
  assert.match(e.$('#version-save-status').textContent,/saved on this device/);e.click('[data-action="close-modal"]');e.input('[data-answer-edit]','Newer wording to preserve.');e.click('[data-action="versions"]');e.click(`[data-version-preview="${id}"]`);assert.match(e.$('.version-preview').textContent,/My first complete answer/);e.click(`[data-version-restore="${id}"]`);await new Promise(r=>setImmediate(r));
  assert.equal(e.$('[data-answer-edit]').value,'My first complete answer.');const versions=Object.values(e.saved().versions);assert.ok(versions.some(v=>v.label.startsWith('Before restoring')&&v.draft.edits['q1-p1'].text==='Newer wording to preserve.'));assert.deepEqual(e.errors,[]);
 }finally{e.close();}
});
test('online saving carries circles and versions to another device, and feedback includes notes',async()=>{
 const records={};
 const fetcher=async(url,options)=>{
  const payload=options.body&&JSON.parse(options.body),id=payload?.appId||new URL(url).searchParams.get('appId');
  let result;
  if(options.method==='GET')result={progress:records[id]||null};
  else if((records[id]?.version??null)!==payload.baseVersion)result={accepted:false,progress:records[id]};
  else{records[id]={version:(records[id]?.version||0)+1,state:payload.state};result={accepted:true,progress:records[id]};}
  return {ok:true,json:async()=>structuredClone(result)};
 };
 const settle=async()=>{for(let i=0;i<40;i++)await new Promise(r=>setImmediate(r));};
 const e=await editor(undefined,{online:true,fetcher});try{
  e.click('[data-action="sync"]');await settle();
  e.input('[data-answer-edit]','Online family wording.');e.click('[data-action="note-original"]');e.input('#annotation-note','Keep our voice.');e.click('[data-action="save-annotation"]');
  e.click('[data-action="versions"]');e.input('#version-label','Online review');e.click('[data-action="save-version"]');await settle();
  assert.match(e.$('#version-save-status').textContent,/saved online/);e.click('[data-action="close-modal"]');e.click('[data-action="feedback"]');e.input('#submission-note','Please use the circled note.');e.click('[data-action="send-feedback"]');await settle();
  assert.match(e.$('#submission-result').textContent,/Submitted successfully/);
  const submission=Object.values(records['marco-application-feedback-v1'].state.submissions)[0];assert.equal(Object.values(submission.draft.annotations).filter(Boolean)[0].note,'Keep our voice.');assert.equal(submission.draft.edits['q1-p1'].text,'Online family wording.');assert.deepEqual(e.errors,[]);
 }finally{e.close();}
 const other=await editor(undefined,{online:true,fetcher});try{other.click('[data-action="sync"]');await settle();assert.equal(other.$('[data-answer-edit]').value,'Online family wording.');assert.equal(other.$('[data-annotation-note]').value,'Keep our voice.');assert.ok(Object.values(other.saved().versions).some(v=>v.label==='Online review'));}finally{other.close();}
});
test('default comparison shows the counselor and exact earlier suggestion, with notes on both',async()=>{
 const e=await editor(undefined,{draft:false});try{
  assert.equal(e.$('[data-answer-edit]'),null);assert.equal(e.w.document.querySelectorAll('.editor-pair').length,1);
  const original=[...e.w.document.querySelectorAll('[data-annotation-target="original"] p')].map(p=>p.textContent).join('\n\n');
  const suggested=[...e.w.document.querySelectorAll('[data-annotation-target="suggested"] p')].map(p=>p.textContent).join('\n\n');
  assert.equal(original,data.questions[0].paragraphs.map(p=>p.original).join('\n\n'));assert.equal(suggested,data.questions[0].paragraphs.map(p=>p.suggested).filter(Boolean).join('\n\n'));
  e.click('[data-action="note-original"]');e.input('#annotation-note','Keep the counselor’s warmth.');e.click('[data-action="save-annotation"]');
  e.click('[data-action="note-suggested"]');e.input('#annotation-note','Use this shorter suggestion.');e.click('[data-action="save-annotation"]');
  const notes=Object.values(e.saved().annotations).filter(Boolean);assert.equal(notes.length,2);assert.equal(notes[1].side,'suggested');assert.equal(notes[1].reference,suggested);
  assert.equal(e.saved().edits['q1-p1'].text,data.questions[0].paragraphs[0].original);
  e.click('[data-action="ready-next"]');assert.equal(e.saved().question,2);assert.equal(e.$('[data-answer-edit]'),null);assert.deepEqual(e.errors,[]);
 }finally{e.close();}
});
