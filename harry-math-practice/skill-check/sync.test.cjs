const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const copy=x=>JSON.parse(JSON.stringify(x));
function client(name,fetcher){let state;const cache=new Map(),c={AbortController,fetch:fetcher,crypto:{randomUUID:()=>name+'-device-000001'},localStorage:{getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v)},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}},addEventListener(){},removeEventListener(){},setInterval:()=>1,clearInterval(){},setTimeout,clearTimeout};c.globalThis=c;
 for(const f of ['data.js','engine.js','sync.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,f),'utf8'),c);
 state=c.HarrySkillEngine.empty();const sync=c.HarrySkillSync.create({getState:()=>state,onRemote:s=>{state=s;},onStatus(){},fetcher});return{E:c.HarrySkillEngine,D:c.HarrySkillData,sync,get:()=>state};
}
test('two devices resume the same record, merge different questions, and preserve a conflicting offline first answer',async()=>{
 let record=null,posts=0;const fetcher=async(_url,init={})=>{if(init.method!=='POST')return{ok:true,json:async()=>({progress:copy(record)})};posts++;const p=JSON.parse(init.body);if(record&&p.baseVersion!==record.version)return{ok:true,json:async()=>({accepted:false,progress:copy(record)})};record={state:copy(p.state),version:(record?.version||0)+1};return{ok:true,json:async()=>({accepted:true,progress:copy(record)})};};
 const a=client('first',fetcher),b=client('second',fetcher),offline=client('offline',fetcher),at='2026-10-31T17:00:00.000Z';await a.sync.start();assert.equal(posts,0,'Opening a fresh course does not upload an empty run');
 const [q1,q2]=a.D.sessions[0].questions;a.E.start(a.get(),'mixed-1',at);a.E.submit(a.get(),'mixed-1',q1.id,(q1.correct+1)%4,at,'event-from-first');await a.sync.push();assert.equal(record.version,1);
 await b.sync.start();assert.equal(b.get().sessions['mixed-1'].answers[q1.id].id,'event-from-first');b.E.submit(b.get(),'mixed-1',q2.id,q2.correct,at,'event-from-second');await b.sync.push();await a.sync.push();assert.equal(Object.keys(a.get().sessions['mixed-1'].answers).length,2);
 offline.E.start(offline.get(),'mixed-1',at);offline.E.submit(offline.get(),'mixed-1',q1.id,q1.correct,at,'event-offline-first');await offline.sync.start();assert.equal(offline.get().sessions['mixed-1'].answers[q1.id].correct,false);assert.equal(offline.get().sessions['mixed-1'].conflicts[q1.id][0].id,'event-offline-first');assert.equal(Object.keys(record.state.sessions['mixed-1'].answers).length,2);
 for(const c of [a,b,offline])c.sync.stop();
});
