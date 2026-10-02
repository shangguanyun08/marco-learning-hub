import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8'),KEY='harry-star-sept20-four-sessions-v1';
function boot(id='oct1-original',saved){
 const dom=new JSDOM(read('./index.html'),{url:'http://localhost/?session='+id,runScripts:'outside-only'}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};if(saved)w.localStorage.setItem(KEY,saved);
 for(const file of ['../../harry-star-math/tests/2026-09-20/data.js','data.js','sept27-data.js','think-sept27-data.js','oct1-data.js','visuals.js','engine.js','sync.js','app.js'])w.eval(read('./'+file));
 return {w,d:w.document,s:w.HARRY_SEPT_PRACTICE.find(s=>s.id===id),close:()=>w.close()};
}
function answer(t,q,value){const f=t.d.querySelector(`form[data-source="${q.source}"]`);if(q.type==='split-sum')f.querySelectorAll('input').forEach((input,i)=>{input.value=value[i]??''});else if(q.type==='number')f.querySelector('input').value=value;else f.querySelector(`input[value="${value}"]`).checked=true;f.dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
test('Oct 1 preserves original 22 and has three focused 12-question sessions',()=>{
 const t=boot();assert.equal(t.w.HARRY_STAR_GROUPS[0].id,'2026-10-01');
 const sets=t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-10-01');assert.equal(sets.length,4);
 for(const [i,s] of sets.entries()){
  assert.equal(s.questions.length,i?12:22);assert.equal(new Set(s.questions.map(q=>q.source)).size,s.questions.length);
  if(!i){assert.deepEqual(Array.from(s.questions.slice(18),q=>q.source),[102,34,27,33]);assert.equal(s.questions[18].type,'number');}
  else {assert.equal(s.questions.filter(q=>q.type==='split-sum').length,2);assert.equal(s.questions.filter(q=>q.skill==='Division with zeros').length,4);assert.equal(s.questions.filter(q=>q.decimal).length,2);assert.equal(s.questions.filter(q=>q.skill==='Division with a remainder').length,1);}
 }
 assert.equal(t.d.querySelectorAll('.question').length,22);assert.equal(t.d.querySelectorAll('.answer').length,0);
 assert.equal(t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-09-27').every(s=>s.questions.length===13),true);
 assert.equal(t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-09-20').every(s=>s.questions.length===12),true);
 assert.match(t.d.querySelector('#days-progress').textContent,/4 sessions/);t.close();
});
test('All new keys independently match arithmetic, remainders and rounding up',()=>{
 const t=boot();for(const s of t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-10-01'))for(const q of s.questions){
  const p=q.prompt.replaceAll(',','');const m=p.match(/(\d+) ÷ (\d+)/);
  if(q.skill==='Division with zeros')assert.equal(q.correct,Number(m[1])/Number(m[2]));
  if(q.skill==='Same quotient'){const c=q.choices[q.correct].replaceAll(',','').match(/(\d+) ÷ (\d+)/);assert.equal(Number(c[1])/Number(c[2]),Number(m[1])/Number(m[2]));}
  if(q.skill==='Division with a remainder'){const c=q.choices[q.correct].match(/(\d+) R (\d+)/),a=Number(m[1]),b=Number(m[2]);assert.equal(Number(c[1]),Math.floor(a/b));assert.equal(Number(c[2]),a%b);}
  if(q.skill==='Round up for containers')assert.equal(Number(q.choices[q.correct]),Math.ceil(Number(m[1])/Number(m[2])));
  if(q.decimal){const c=p.match(/(\d+\.\d+) ([+−]) (\d+\.\d+)/);assert.equal(Math.round((Number(c[1])+(c[2]==='+'?1:-1)*Number(c[3]))*100)/100,q.correct);}
  if(q.type==='split-sum'){const c=p.match(/(\d+) × (\d+) = \d+ × \(100 \+ (\d+)\)/),factor=Number(c[1]);assert.equal(Number(c[2]),100+Number(c[3]));assert.deepEqual(Array.from(q.parts),[factor*100,factor*Number(c[3]),factor*Number(c[2])]);}
 }t.close();
});
test('Decimal retry, reveal, first-score, sync and reload are preserved',()=>{
 let t=boot(),q=t.s.questions.find(q=>q.source===214);assert.equal(t.d.querySelector('#number-214').inputMode,'decimal');
 for(const v of ['', '6e0', '-1'])answer(t,q,v);assert.equal(t.w.localStorage.getItem(KEY),null);
 answer(t,q,'6.73');assert.equal(t.d.querySelector('[data-source="214"] .answer'),null);
 answer(t,q,'6.730');let state=JSON.parse(t.w.localStorage.getItem(KEY));assert.equal(state.sessions[t.s.id][0].answers[214].attempts.length,1);
 answer(t,q,'6.340');state=JSON.parse(t.w.localStorage.getItem(KEY));assert(t.w.HarrySeptSync.valid(state));assert.equal(t.d.querySelector('#score').textContent,'0 / 22');assert.match(t.d.querySelector('[data-source="214"] .answer').textContent,/6.34/);
 const saved=JSON.stringify(state);t.close();t=boot('oct1-original',saved);assert.match(t.d.querySelector('#history').textContent,/6.73.*6.34/);q=t.s.questions.find(q=>q.source===215);answer(t,q,'5.83');answer(t,q,'4.83');assert.match(t.d.querySelector('[data-source="215"] .answer').textContent,/4.73/);t.close();
});
test('Every Oct 1 session completes and new run retains records',()=>{
 for(const id of ['oct1-original','oct1-a','oct1-b','oct1-c']){const t=boot(id);for(const q of t.s.questions)answer(t,q,q.type==='split-sum'?q.parts:q.correct);
  assert.equal(t.d.querySelector('#score').textContent,`${t.s.questions.length} / ${t.s.questions.length}`);assert.equal(t.d.querySelector('#completion').hidden,false);
  const state=JSON.parse(t.w.localStorage.getItem(KEY));assert(t.w.HarrySeptSync.valid(state));assert.equal(t.w.HarrySeptSync.merge(state,{version:1,sessions:{}}).sessions[id][0].answers[214].attempts.length,1);
  const pending=JSON.parse(JSON.stringify(state));pending.sessions[id][0].completedAt=null;assert(t.w.HarrySeptSync.merge(pending,{version:1,sessions:{}}).sessions[id][0].completedAt);
  t.d.querySelector('#new-run').click();assert.equal(JSON.parse(t.w.localStorage.getItem(KEY)).sessions[id].length,2);t.close();
 }
});
test('Oct 1 typed decimals upload and restore without replacing September history',async()=>{
 const t=boot();const at='2026-10-01T18:00:00.000Z';
 let record={version:1,state:{version:1,sessions:{'sept27-original':[{id:'old',startedAt:at,completedAt:null,answers:{102:{attempts:[{choice:'2600',correct:true,at}]}}}]}}};
 const fetcher=async(_url,options)=>{
  if(options.method==='POST'){const body=JSON.parse(options.body);assert.equal(body.baseVersion,record.version);record={version:record.version+1,state:body.state};return{ok:true,json:async()=>({accepted:true,progress:record})};}
  return{ok:true,json:async()=>({progress:record})};
 };
 const newRuns={};for(const id of ['oct1-original','oct1-a','oct1-b','oct1-c'])newRuns[id]=[{id,startedAt:at,completedAt:null,answers:{214:{attempts:[{choice:'6.73',correct:false,at},{choice:'6.34',correct:true,at}]}}}];
 for(const id of ['oct1-a','oct1-b','oct1-c'])newRuns[id][0].answers[102]={attempts:[{choice:'2500 + 30 = 2800',correct:false,at},{choice:'2500 + 300 = 2800',correct:true,at}]};
 let state={version:1,sessions:newRuns},status;
 const a=t.w.HarrySeptSync.create({getState:()=>state,onRemote:s=>{state=s},onStatus:k=>{status=k},fetcher});
 await a.refresh();assert.equal(status,'live');assert.equal(record.state.sessions['sept27-original'][0].answers[102].attempts[0].choice,'2600');
 let restored={version:1,sessions:{}};const b=t.w.HarrySeptSync.create({getState:()=>restored,onRemote:s=>{restored=s},onStatus:()=>{},fetcher});
 await b.refresh();assert.equal(Object.keys(restored.sessions).length,5);assert.equal(restored.sessions['oct1-b'][0].answers[214].attempts.length,2);
 assert.equal(restored.sessions['oct1-a'][0].answers[102].attempts[1].choice,'2500 + 300 = 2800');
 a.stop();b.stop();t.close();
});
test('Q19-style multiplication needs both products and the sum, preserves retries and sync',()=>{
 let t=boot('oct1-a'),q=t.s.questions.find(q=>q.source===102),f=()=>t.d.querySelector('form[data-source="102"]');
 assert.equal(f().querySelectorAll('input[name="number-part"]').length,3);assert.match(f().textContent,/25 × 100.*25 × 12.*Total/);
 assert.equal(f().querySelectorAll('input[value="2500"]').length,0);assert.equal(t.d.querySelector('[data-source="102"] .answer'),null);
 answer(t,q,['2500','','2800']);assert.equal(t.w.localStorage.getItem(KEY),null);assert.match(t.d.querySelector('#feedback-102').textContent,/all three boxes/);
 answer(t,q,['2500','30','2800']);assert.equal(t.d.querySelector('[data-source="102"] .answer'),null);
 answer(t,q,['2,500','030','2,800']);let state=JSON.parse(t.w.localStorage.getItem(KEY));assert.equal(state.sessions['oct1-a'][0].answers[102].attempts.length,1);
 const saved=JSON.stringify(state);t.close();t=boot('oct1-a',saved);q=t.s.questions.find(q=>q.source===102);
 answer(t,q,['2500','300','2800']);state=JSON.parse(t.w.localStorage.getItem(KEY));assert(t.w.HarrySeptSync.valid(state));
 assert.equal(state.sessions['oct1-a'][0].answers[102].attempts[1].choice,'2500 + 300 = 2800');
 assert.equal(t.d.querySelector('#score').textContent,'0 / 12');assert.match(t.d.querySelector('[data-source="102"] .answer').textContent,/2,500 \+ 300 = 2,800/);
 assert.equal(t.d.querySelectorAll('form[data-source="102"] input:disabled').length,3);assert.match(t.d.querySelector('#history').textContent,/2500 \+ 30 = 2800.*2500 \+ 300 = 2800/);
 q=t.s.questions.find(q=>q.source===219);answer(t,q,['2500','10','2510']);assert.equal(t.d.querySelector('[data-source="219"] .answer'),null);answer(t,q,['2500','20','2520']);assert.match(t.d.querySelector('[data-source="219"] .answer').textContent,/2,500 \+ 100 = 2,600/);t.close();
});
test('Session 1 completed 16/22 record stays unchanged after opening a focused session',()=>{
 let t=boot();const at='2026-10-01T20:00:00.000Z',misses={102:['111','222'],205:['1','2'],207:['1','2'],209:['1','2'],210:['1','2'],213:[0,1]};
 const run={id:'completed-original',startedAt:at,completedAt:at,answers:Object.fromEntries(t.s.questions.map(q=>[q.source,{attempts:(misses[q.source]||[q.type==='number'?String(q.correct):q.correct]).map(choice=>({choice,correct:t.w.HarrySeptEngine.isCorrect(q,choice),at}))}]))};
 const state={version:1,sessions:{'oct1-original':[run]}};t.close();t=boot('oct1-original',JSON.stringify(state));
 assert.equal(t.d.querySelector('#score').textContent,'16 / 22');assert.equal(t.d.querySelector('#completion').hidden,false);assert.match(t.d.querySelector('#history').textContent,/111.*222/);
 t.d.querySelector('a[href="?session=oct1-a"]').click();assert.equal(t.d.querySelectorAll('.question').length,12);
 answer(t,t.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='oct1-a').questions.find(q=>q.source===205),'8');
 const saved=JSON.parse(t.w.localStorage.getItem(KEY));assert.deepEqual(saved.sessions['oct1-original'][0],run);t.close();
});
