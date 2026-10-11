import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8'),KEY='harry-star-sept20-four-sessions-v1';
function boot(query='?session=oct10-original',saved){
 const html=read('./index.html'),dom=new JSDOM(html,{url:'http://localhost/'+query,runScripts:'outside-only'}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};if(saved)w.localStorage.setItem(KEY,saved);
 let before;
 for(const [,src] of html.matchAll(/<script src="([^"]+)" defer>/g)){const f=src.split('?')[0];if(f==='./oct10-data.js')before=JSON.stringify(w.HARRY_SEPT_PRACTICE);w.eval(read(f));}
 return {w,d:w.document,before,close:()=>w.close()};
}
function answer(t,q,n){const f=t.d.querySelector(`form[data-source="${q.source}"]`);if(n!==null)f.querySelector(`input[value="${n}"]`).checked=true;f.dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
const ids=['oct10-original','oct10-a','oct10-b'],sources=[1,6,10,14,17,19,22,25,27,29,30,32,33,34];
test('Three new sets of 14 verified misses; previous question banks unchanged',()=>{
 const t=boot(),sets=t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-10-10');assert.equal(sets.length,3);assert.equal(t.w.HARRY_STAR_GROUPS[0].id,'2026-10-10');
 assert.equal(JSON.stringify(t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group!=='2026-10-10')),t.before);
 for(const s of sets){assert.equal(s.questions.length,14);assert.deepEqual(Array.from(s.questions,q=>q.source).sort((a,b)=>a-b),sources);for(const q of s.questions){assert.equal(new Set(q.choices).size,q.choices.length);assert(q.correct>=0&&q.correct<q.choices.length);assert(q.explanation.length>25);}}
 for(const source of sources){assert.equal(new Set(sets.map(s=>{const q=s.questions.find(q=>q.source===source);return JSON.stringify([q.prompt,q.visual]);})).size,3);}
 assert.equal(t.d.querySelectorAll('.question').length,14);assert.equal(t.d.querySelectorAll('.answer,.correct-option').length,0);assert.equal(t.d.querySelectorAll('.oct10-diagram').length,3);assert(t.d.querySelector('.fraction[aria-label="s over 5"]'));t.close();
});
test('Independent calculations and diagram checks for all 42 answers',()=>{
 const t=boot();
 const inputs=[
  {round:703937,place:693,cost:[15,50],target:1,bulk:[20,55],rem:[228,8],expr:71426,teams:[6,5],trips:[25,11],expanded:63244,radius:12,time:[2965,3024],fraction:[1,10,17,18]},
  {round:468215,place:482,cost:[14,50],target:3,bulk:[30,45],rem:[197,9],expr:52318,teams:[7,4],trips:[24,12],expanded:48372,radius:8,time:[2847,3136],fraction:[1,8,5,9]},
  {round:835902,place:756,cost:[18,50],target:2,bulk:[40,35],rem:[251,6],expr:83257,teams:[8,6],trips:[32,13],expanded:75608,radius:15,time:[3678,2746],fraction:[1,6,7,11]}
 ];
 const evaluate=s=>s.split(' + ').reduce((sum,term)=>sum+term.split(' × ').reduce((p,n)=>p*Number(n.replaceAll(',','')),1),0);
 ids.forEach((id,i)=>{const s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id===id),q=n=>s.questions.find(q=>q.source===n),key=n=>q(n).choices[q(n).correct],num=n=>Number(key(n).replaceAll(',','').match(/[\d.]+/)[0]),v=inputs[i];
  assert.equal(key(1),q(1).visual.degrees<90?'acute angle':'obtuse angle');assert.equal(num(6),Math.round(v.round/10000)*10000);
  q(10).choices.forEach((c,j)=>{const total=[...c.matchAll(/(\d+) (hundreds|tens|ones)/g)].reduce((sum,m)=>sum+Number(m[1])*({hundreds:100,tens:10,ones:1}[m[2]]),0);assert.equal(total===v.place,j===q(10).correct);});
  assert.equal(num(14),v.cost[0]*v.cost[1]/100);assert.equal(key(17),q(17).visual.shapes[v.target-1]);assert.equal(num(19),v.bulk[0]*v.bulk[1]/100);assert.equal(num(22),v.rem[0]%v.rem[1]);
  q(25).choices.forEach((c,j)=>assert.equal(evaluate(c)===v.expr,j===q(25).correct));assert.equal(num(27),v.teams[0]*v.teams[1]);assert.equal(num(29),v.trips[0]*v.trips[1]);
  q(30).choices.forEach((c,j)=>assert.equal(evaluate(c)===v.expanded,j===q(30).correct));assert.equal(num(32),2*v.radius);assert.equal(q(32).visual.radius,v.radius);assert.equal(num(33),(v.time[0]+v.time[1])/100);
  const f=v.fraction;q(34).choices.forEach((c,j)=>{const [n,d]=c.split('/').map(Number);assert.equal(n*f[1]*f[3]===d*f[0]*f[2],j===q(34).correct);});
 });t.close();
});
test('Date group navigation, first-try points, completion and sync work in all three sessions',()=>{
 let t=boot('?group=2026-10-10');assert.equal(t.d.querySelectorAll('.session-link').length,3);assert.equal(t.d.querySelectorAll('.question').length,0);t.close();
 for(const id of ids){t=boot('?session='+id);const s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id===id);for(const q of s.questions)answer(t,q,q.correct);assert.equal(t.d.querySelector('#score').textContent,'14 / 14');assert(!t.d.querySelector('#completion').hidden);
  const saved=t.w.localStorage.getItem(KEY),state=JSON.parse(saved);assert(t.w.HarrySeptSync.valid(state));state.sessions[id][0].completedAt=null;const merged=t.w.HarrySeptSync.merge(state,{version:1,sessions:{}});assert(merged.sessions[id][0].completedAt);t.close();t=boot('?session='+id,saved);assert.equal(t.d.querySelector('#score').textContent,'14 / 14');t.d.querySelector('#new-run').click();assert.equal(JSON.parse(t.w.localStorage.getItem(KEY)).sessions[id].length,2);t.close();}
});
test('Empty/duplicate tries do not count; one retry then reveal; old history preserved',()=>{
 const old={version:1,sessions:{original:[{id:'old-run',startedAt:'2026-09-20T17:00:00Z',completedAt:null,answers:{1:{attempts:[{choice:0,correct:true,at:'2026-09-20T17:01:00Z'}]}}}]}};
 let t=boot('?session=oct10-original',JSON.stringify(old)),s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id===ids[0]),q=s.questions[0],bad=(q.correct+1)%q.choices.length;
 answer(t,q,null);answer(t,q,bad);answer(t,q,bad);assert.equal(JSON.parse(t.w.localStorage.getItem(KEY)).sessions[ids[0]][0].answers[q.source].attempts.length,1);assert.equal(t.d.querySelectorAll('.answer').length,0);answer(t,q,q.correct);assert.equal(t.d.querySelector('#score').textContent,'0 / 14');assert.equal(t.d.querySelectorAll('.answer').length,1);
 q=s.questions[1];answer(t,q,(q.correct+1)%4);answer(t,q,(q.correct+2)%4);assert.equal(t.d.querySelectorAll('.answer').length,2);const saved=t.w.localStorage.getItem(KEY);assert.deepEqual(JSON.parse(saved).sessions.original,old.sessions.original);t.close();t=boot('?session=oct10-original',saved);assert.equal(t.d.querySelectorAll('.answer').length,2);assert.equal(t.d.querySelector('#score').textContent,'0 / 14');t.close();
});
