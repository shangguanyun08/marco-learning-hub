const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let JSDOM;try{({JSDOM}=require('jsdom'));}catch{({JSDOM}=require('../harry-math-practice/node_modules/jsdom'));}
const CACHE='harry-writing:elephant-sections-v1',SESSION='harry-meaning-ai:connection-v1';
const revision={id:'checked-rewrite',sentence_id:3,text:'The man walked slowly to the elephant. He wanted to help.',kind:'revision',checked_at:'2026-11-07T12:00:00Z',feedback:{complete:true,clear:true,correct:true,strength:'The man wants to help.',nextStep:'Read both sentences aloud.'}};
const old={sentence_id:3,revision_id:revision.id,text:'Original-section example with different events.',viewed_at:'2026-11-07T12:01:00Z'};
const model={...old,kind:'rewrite',generation_version:2,source_text:revision.text,text:'The man walked slowly towards the elephant.\nHe wanted to help it.'};
const seed={drafts:{},revisions:[revision],models:[old],selected:3};
function boot(saved=seed){
  const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),{url:'https://shangguanyun08.github.io/marco-learning-hub/harry-writing/#part-3',runScripts:'outside-only'}),w=dom.window,calls=[];
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.localStorage.setItem(CACHE,JSON.stringify(saved));w.localStorage.setItem(SESSION,'fixture-session-not-a-real-credential');
  w.AbortSignal=AbortSignal;
  w.fetch=async(url,options)=>{const action=new URL(url).searchParams.get('action'),body=options.body?JSON.parse(options.body):null;calls.push({action,body});return {ok:true,status:200,json:async()=>action==='work'?{storyId:w.WRITING_STORY_ID,drafts:[],revisions:[revision],models:saved.models}:action==='model'?{model}:action==='draft'?{draft:{version:1,updated_at:'2026-11-07T13:00:00Z'}}:{}};};
  for(const f of ['story.js','app.js'])w.eval(fs.readFileSync(path.join(__dirname,f),'utf8'));
  return {w,d:w.document,calls,close:()=>w.close()};
}
const settle=async()=>{for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve));};
test('the rewrite example sits below the rewrite controls and uses the checked version, not a cached original',async()=>{
  const t=boot();try{
    await settle();const d=t.d,button=d.querySelector('#show-model');
    assert.equal(button.textContent,'Show re-write example');assert.equal(d.querySelector('#model-panel').hidden,true);
    assert.ok(d.querySelector('#revision').compareDocumentPosition(d.querySelector('#model-panel'))&t.w.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.ok(d.querySelector('#model-panel').compareDocumentPosition(d.querySelector('#feedback'))&t.w.Node.DOCUMENT_POSITION_FOLLOWING);
    button.click();await settle();
    assert.equal(t.calls.find(c=>c.action==='model').body.revisionId,revision.id);
    assert.equal(d.querySelector('#model-text').textContent,model.text);assert.equal(d.querySelector('#model-panel').hidden,false);
    assert.equal(d.querySelector('#revision').value,revision.text);
    button.click();await settle();assert.equal(t.calls.filter(c=>c.action==='model').length,1);
    const input=d.querySelector('#revision');input.value='A changed rewrite.';input.dispatchEvent(new t.w.Event('input',{bubbles:true}));
    assert.equal(d.querySelector('#model-panel').hidden,true);button.click();await settle();
    assert.match(d.querySelector('#error').textContent,/checking on this rewrite first/);
    assert.equal(t.calls.filter(c=>c.action==='model').length,1);
  }finally{t.close();}
});
test('a saved matching rewrite example returns after reload while earlier original examples remain saved',async()=>{
  const t=boot({...seed,models:[old,model]});try{await settle();assert.equal(t.d.querySelector('#model-text').textContent,model.text);assert.equal(t.d.querySelector('#model-panel').hidden,false);assert.equal(t.calls.filter(c=>c.action==='model').length,0);assert.equal(JSON.parse(t.w.localStorage.getItem(CACHE)).models.length,2);}finally{t.close();}
});
