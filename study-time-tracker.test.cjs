const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const source=fs.readFileSync('shared-activity-tracker.js','utf8');
async function harness({url='https://shangguanyun08.github.io/marco-learning-hub/test/?set=8',appId='marco-math-skill-builder-oct12-v1',offline=false,stored={}}={}){
 const dom=new JSDOM(`<body><main><h1>Practice</h1><button id="answer">Answer</button><article data-study-subject="words"><button id="word">Word</button></article><article data-study-subject="math"><button id="math">Math</button></article></main><script data-app-id="${appId}"></script></body>`,{url,runScripts:'outside-only'}),w=dom.window;
 let clock=Date.parse('2026-10-21T03:00:00Z'),visible='visible',focused=true,tick;const calls=[],NativeDate=w.Date;
 class FakeDate extends NativeDate{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}}
 w.Date=FakeDate;Object.defineProperty(w.document,'visibilityState',{get:()=>visible});Object.defineProperty(w.document,'hasFocus',{value:()=>focused});Object.defineProperty(w.document,'currentScript',{value:w.document.querySelector('script')});w.setInterval=fn=>{tick=fn;};
 for(const [k,v]of Object.entries(stored))w.localStorage.setItem(k,v);
 w.fetch=async(url,opts)=>{const body=JSON.parse(opts.body);calls.push(body);if(offline)throw Error('offline');return{ok:true,json:async()=>({accepted:true,ids:body.segments.map(s=>s.id)})}};
 w.eval(source);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));const settle=()=>new Promise(r=>setImmediate(r));await settle();
 return{w,calls,async advance(ms,heartbeat=true){clock+=ms;if(heartbeat)tick?.();await settle();},async engage(id='answer'){w.document.getElementById(id).dispatchEvent(new w.Event('pointerdown',{bubbles:true}));await settle();},async hide(){visible='hidden';w.document.dispatchEvent(new w.Event('visibilitychange'));await settle();},async show(){visible='visible';w.document.dispatchEvent(new w.Event('visibilitychange'));await settle();},async online(){offline=false;w.dispatchEvent(new w.Event('online'));await settle();},snapshot(){return Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const k=w.localStorage.key(i);return[k,w.localStorage.getItem(k)]}))},close:()=>w.close()};
}
const seconds=calls=>calls.flatMap(x=>x.segments).reduce((s,r)=>s+(Date.parse(r.endedAt)-Date.parse(r.startedAt))/1000,0);
test('no opening credit, 90-second idle cap, hidden time excluded, resume needs engagement',async()=>{
 const t=await harness();try{await t.advance(10000);assert.equal(t.calls.length,0);await t.engage();for(let i=0;i<12;i++)await t.advance(10000);assert.equal(seconds(t.calls),90);await t.engage();await t.advance(5000,false);await t.hide();assert.equal(seconds(t.calls),95);await t.advance(20000);await t.show();await t.advance(20000);assert.equal(seconds(t.calls),95);await t.engage();await t.advance(10000);assert.equal(seconds(t.calls),105);}finally{t.close();}
});
test('frequent inputs merge into one interval; offline queue survives reload and replay keeps IDs',async()=>{
 const t=await harness({offline:true,stored:{'existing-score':'preserved'}});await t.engage();for(let i=0;i<100;i++){await t.advance(50,false);await t.engage();}await t.advance(5000);assert.equal(t.calls[0].segments.length,1);const snapshot=t.snapshot(),id=t.calls[0].segments[0].id;t.close();
 const next=await harness({stored:snapshot});try{assert.equal(next.calls[0].segments[0].id,id);assert.equal(Object.keys(next.snapshot()).filter(k=>k.startsWith('study-time-v2:')).length,0);assert.equal(next.snapshot()['existing-score'],'preserved');}finally{next.close();}
});
test('mixed questions keep subject boundaries; manual pause excludes breaks',async()=>{
 const t=await harness({appId:'marco-isee-middle-oct11-test3-v1',url:'https://shangguanyun08.github.io/marco-learning-hub/test/?session=2'});try{await t.engage('word');await t.advance(5000,false);await t.engage('math');await t.advance(5000);const records=t.calls.flatMap(c=>c.segments);assert.equal(records.length,2);assert.equal(records[0].subject,'words');assert.equal(records[1].subject,'math');assert.equal(records[1].context,'Session 2');t.w.document.querySelector('#study-time-status button').click();await t.advance(20000);assert.equal(seconds(t.calls),10);}finally{t.close();}
});
test('long device suspension does not count as working; demo never writes',async()=>{
 const t=await harness();try{await t.engage();await t.advance(600000);assert.equal(seconds(t.calls),0);}finally{t.close();}
 const d=await harness({url:'https://shangguanyun08.github.io/marco-learning-hub/test/?demo=1'});try{await d.engage();await d.advance(10000);assert.equal(d.calls.length,0);assert.equal(d.w.MarcoStudyTime,undefined);}finally{d.close();}
});
