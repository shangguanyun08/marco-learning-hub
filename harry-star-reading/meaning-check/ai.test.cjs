const assert=require('node:assert/strict'),test=require('node:test'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/ai-test.js','utf8');
function load(hash='',validState='',extra={}){
 const local=new Map([['existing-practice-key','saved learner words']]),session=new Map();if(validState)session.set('harry-meaning-ai:connection-v1:state',validState);
 const storage=map=>({getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}),changes=[];
 const context={window:{},location:{hash,pathname:'/meaning-check/',search:''},localStorage:storage(local),sessionStorage:storage(session),URLSearchParams,history:{replaceState:(_,__,value)=>changes.push(value)},...extra};
 vm.runInNewContext(source,context);return {ai:context.window.HarryMeaningAI,local,session,changes};
}
test('AI connection consumes only a matching one-time return state and removes the fragment credential',()=>{
 const valid=load('#set-1-round-3&ai_session=fixture-token&ai_state=fixture-state','fixture-state');
 assert.equal(valid.local.get('harry-meaning-ai:connection-v1'),'fixture-token');
 assert.equal(valid.session.size,0);assert.deepEqual(valid.changes,['/meaning-check/#set-1-round-3']);
 assert.equal(valid.local.get('existing-practice-key'),'saved learner words');
 const bad=load('#set-2-round-3&ai_session=fixture-token&ai_state=other-state','fixture-state');
 assert.equal(bad.local.has('harry-meaning-ai:connection-v1'),false);
 assert.deepEqual(bad.changes,['/meaning-check/#set-2-round-3']);
});
test('AI score history compares completed matching lists and retains separate retakes',()=>{
 const {ai}=load(),ids=['a','b'],attempt=(id,score,wordIds=ids,answered=2)=>({id,score,wordIds,answered,total:2,startedAt:'2026-11-0'+id+'T12:00:00Z'});
 const history=ai.comparison([attempt('1',0),attempt('2',2,['other']),attempt('3',1),attempt('4',1,ids,1)],ids);
 assert.equal(history.first.score,0);assert.equal(history.latest.score,1);assert.equal(history.best.score,1);
 assert.equal(history.rows[0].complete,false);assert.equal(history.rows[1].change,1);assert.equal(history.rows.length,4);
 assert.equal(new Set(ai.shuffle(ids,'fixture')).size,2);
});

test('a slow overview refresh preserves a newer checked test score',async()=>{
 let finishOverview;
 let requests=0;
 const word={id:'harry-ballet',word:'ballet',section:1,partOfSpeech:'noun',context:'She likes ballet.'};
 const attempt={id:'fixture-attempt',section:1,startedAt:'2026-11-05T12:00:00Z',answered:1,total:1,score:1,wordIds:[word.id]};
 const record={...attempt,completedAt:'2026-11-05T12:01:00Z',words:[word],answers:{[word.id]:{answer:'dance',close:true,unknown:false,meaning:'dance'}}};
 const response=body=>({ok:true,status:200,json:async()=>body});
 const fetch=async url=>{
  requests++;
  if(requests===1)return new Promise(resolve=>{finishOverview=()=>resolve(response({attempts:[]}));});
  return response(url.includes('&id=')?{test:record}:{attempts:[attempt]});
 };
 const {ai,local}=load('','',{fetch,AbortController,AbortSignal,document:{hidden:false,addEventListener(){},removeEventListener(){}}});
 local.set('harry-meaning-ai:connection-v1','fixture-session');
 const host=()=>({innerHTML:'',addEventListener(){},removeEventListener(){}}),overview=host(),testHost=host();
 const dashboard=ai.createDashboard(overview,{sets:[{number:1,count:1,wordIds:[word.id]}],demo:false,onSelectSet(){}});
 const widget=ai.mount(testHost,{section:1,count:1,wordIds:[word.id],demo:false});
 await new Promise(setImmediate);
 assert.match(overview.innerHTML,/1 \/ 1/);
 finishOverview();
 await new Promise(setImmediate);
 assert.match(overview.innerHTML,/1 \/ 1/);
 assert.match(overview.innerHTML,/History \(1\)/);
 dashboard.destroy();widget.destroy();
});
