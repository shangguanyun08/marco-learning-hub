import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8'),KEY='harry-star-sept20-four-sessions-v1';
function boot(query='?session=oct4-original',saved,review=false){
 const dom=new JSDOM(read('./index.html'),{url:'http://localhost/'+query,runScripts:'outside-only'}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};if(saved)w.localStorage.setItem(KEY,saved);
 for(const f of ['../../harry-star-math/tests/2026-09-20/data.js','data.js','sept27-data.js','think-sept27-data.js','oct1-data.js'])w.eval(read('./'+f));
 const before=JSON.stringify(w.HARRY_SEPT_PRACTICE);
 for(const f of ['oct4-data.js',...(review?['oct4-review-data.js']:[]),'visuals.js','oct4-visuals.js','engine.js','sync.js','app.js'])w.eval(read('./'+f));
 return {w,d:w.document,before,close:()=>w.close()};
}
function answer(t,q,choice){const f=t.d.querySelector(`form[data-source="${q.source}"]`);if(q.type==='split-sum')f.querySelectorAll('input').forEach((el,i)=>{el.value=choice[i]??'';});else if(q.type==='number')f.querySelector('input').value=choice;else if(choice!==null)f.querySelector(`input[value="${choice}"]`).checked=true;f.dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
const sources=[6,7,8,12,15,17,23,25,27,29,31,32,34];
test('October 4 has four sets of exactly the thirteen reviewed misses; earlier banks unchanged',()=>{
 const t=boot();assert.equal(t.w.HARRY_STAR_GROUPS[0].id,'2026-10-04');assert.equal(JSON.stringify(t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group!=='2026-10-04')),t.before);
 const sets=t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-10-04');assert.equal(sets.length,4);
 for(const s of sets){assert.equal(s.questions.length,13);assert.deepEqual(Array.from(s.questions,q=>q.source).sort((a,b)=>a-b),sources);for(const q of s.questions){assert.equal(new Set(q.choices).size,4);assert(q.correct>=0&&q.correct<4);assert(q.explanation.length>20);}}
 assert.deepEqual(Array.from(sets[0].questions,q=>q.correct),[0,1,0,0,2,2,3,3,2,3,3,3,3]);assert.equal(t.d.querySelectorAll('.question').length,13);t.close();
});
const rational=s=>{const m=s.match(/^(?:(\d+) )?(\d+)\/(\d+)/);return m?Number(m[1]||0)+Number(m[2])/Number(m[3]):parseFloat(s);};
test('Independent arithmetic keys and visual data match all 52 questions',()=>{
 const t=boot(),sets=t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-10-04');
 const ruleKeys=['k = 11b − 8','a = 3c − 5','r = 4b − 7','y = 6p − 9'];
 const gallon=[1,3,2,5],ratio=[[32,40],[18,30],[28,42],[36,48]],earn=[[309,12],[234,12],[275,10],[318,12]],expanded=[83.297,46.529,72.486,58.362],division=[[5.04,.7],[4.32,.6],[6.72,.8],[3.15,.5]],scale=[6,8,9,7],add=[[1,5,36],[3,5,24],[2,7,30],[5,9,42]],mixed=[[4,3,7],[3,2,5],[5,3,8],[6,2,9]],scores=[[60,58,82,68,70,78,56],[30,22,40,26,34,20,38],[50,42,60,46,54,40,58],[70,62,80,66,74,60,78]],tableRule=[[2,-1],[3,2],[4,-3],[2,3]];
 sets.forEach((s,i)=>{const q=n=>s.questions.find(q=>q.source===n),key=n=>q(n).choices[q(n).correct];
  assert.equal(key(6),ruleKeys[i]);assert.equal(parseInt(key(7)),gallon[i]*8);
  const eq=tableRule[i],tables=q(8).visual;tables.ys.forEach((ys,j)=>assert.equal(ys.every((y,k)=>y===tables.xs[k]*eq[0]+eq[1]),j===q(8).correct));
  const r=key(12).match(/\d+/g).map(Number);assert.equal(r[0]*ratio[i][1],r[1]*ratio[i][0]);assert.equal(parseFloat(key(15)),earn[i][0]/earn[i][1]);assert.equal(Number(key(17)),expanded[i]);assert(Math.abs(Number(key(23))-division[i][0]/division[i][1])<1e-9);
  const sorted=scores[i].toSorted((a,b)=>a-b),five=[sorted[0],sorted[1],sorted[3],sorted[5],sorted[6]];assert.deepEqual(Array.from(q(25).visual.sets[q(25).correct]),five);assert.equal(key(27),'y = '+scale[i]+'n');
  q(29).visual.sets.forEach((lines,j)=>{const [a,b]=lines,dot=(a[2]-a[0])*(b[2]-b[0])+(a[3]-a[1])*(b[3]-b[1]);assert.equal(dot===0,j===q(29).correct);});
  assert(Math.abs(rational(key(31))-(add[i][0]+add[i][1])/add[i][2])<1e-10);assert.equal(key(32),(mixed[i][0]*mixed[i][2]+mixed[i][1])+'/'+mixed[i][2]);
  const plot=q(34).visual,all=plot.labels.flatMap((label,j)=>Array(plot.counts[j]).fill(rational(label))).sort((a,b)=>b-a);assert.equal(rational(key(34)),all[0]+all[1]);
 });t.close();
});
test('Date navigation shows four October 4 sessions and keeps previous groups accessible',()=>{
 let t=boot('');assert.equal(t.d.querySelectorAll('.group-card').length,4);assert.equal(t.w.localStorage.getItem(KEY),null);t.close();
 t=boot('?group=2026-10-04');assert.equal(t.d.querySelectorAll('.session-link').length,4);assert.equal(t.d.querySelectorAll('.question').length,0);t.d.querySelector('a[href="?session=oct4-b"]').click();assert.equal(t.d.querySelectorAll('.question').length,13);assert.match(t.d.querySelector('#session-title').textContent,/October 4/);t.close();
});
test('Every new session has hidden answers, working diagrams, 13/13 scoring and retained runs',()=>{
 for(const id of ['oct4-original','oct4-a','oct4-b','oct4-c']){
  const t=boot('?session='+id),s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id===id);assert.equal(t.d.querySelectorAll('.answer,.correct-option').length,0);assert.equal(t.d.querySelectorAll('.oct4-choice-table').length,4);assert.equal(t.d.querySelectorAll('.oct4-diagram').length,9);
  for(const q of s.questions)answer(t,q,q.correct);assert.equal(t.d.querySelector('#score').textContent,'13 / 13');assert(!t.d.querySelector('#completion').hidden);assert.match(t.d.querySelector('#completion').textContent,/100%/);
  const saved=JSON.parse(t.w.localStorage.getItem(KEY));assert(t.w.HarrySeptSync.valid(saved));const merged=t.w.HarrySeptSync.merge(saved,{version:1,sessions:{}});assert(merged.sessions[id][0].completedAt);
  t.d.querySelector('#new-run').click();assert.equal(JSON.parse(t.w.localStorage.getItem(KEY)).sessions[id].length,2);t.close();
 }
});
test('Retry and second-miss reveal persist without altering first-try points or older answers',()=>{
 let t=boot('?session=oct1-original'),oldQ=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='oct1-original').questions.find(q=>!q.type);answer(t,oldQ,oldQ.correct);const saved=t.w.localStorage.getItem(KEY),old=JSON.parse(saved).sessions['oct1-original'];t.close();
 t=boot('?session=oct4-original',saved);let s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='oct4-original'),q=s.questions[0];answer(t,q,null);answer(t,q,1);assert(!t.d.querySelector('#q1 .answer'));answer(t,q,0);assert.equal(t.d.querySelector('#score').textContent,'0 / 13');assert(t.d.querySelector('#q1 .answer'));q=s.questions[1];answer(t,q,0);answer(t,q,2);assert(t.d.querySelector('#q2 .answer'));
 const after=t.w.localStorage.getItem(KEY);assert.deepEqual(JSON.parse(after).sessions['oct1-original'],old);t.close();t=boot('?session=oct4-original',after);assert.equal(t.d.querySelector('#score').textContent,'0 / 13');assert(t.d.querySelector('#q2 .answer'));t.close();
});

test('Requested October 1 Session 3 Q2 Q5 Q9 are faithfully copied into positions 14–16',()=>{
 const t=boot('?session=oct4-original',null,true),old=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='oct1-b'),s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='oct4-original');
 assert.equal(s.questions.length,16);[1,4,8].forEach((j,i)=>{const a=old.questions[j],b=s.questions[13+i];for(const key of ['prompt','correct','choices','type','expansion','parts'])assert.deepEqual(JSON.parse(JSON.stringify({value:b[key]})),JSON.parse(JSON.stringify({value:a[key]})));});
 assert.equal(t.d.querySelectorAll('#q16 input').length,7);assert.match(t.d.querySelector('#q14 .source').textContent,/Session 3 · Q2/);assert.equal(t.d.querySelectorAll('.answer').length,0);t.close();
});
test('All review additions are skill-matched with correct numeric, remainder and expanded-product keys',()=>{
 const t=boot('',null,true);for(const s of t.w.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-10-04')){
 const [d,r,p]=s.questions.slice(13),nums=d.prompt.replaceAll(',','').match(/(\d+) ÷ (\d+)/);assert.equal(d.correct,Number(nums[1])/Number(nums[2]));const rem=r.prompt.match(/(\d+) ÷ (\d+)/),a=Number(rem[1]),b=Number(rem[2]);assert.equal(r.choices[r.correct],Math.floor(a/b)+' R '+a%b);
 assert.equal(p.expansion[0]*p.expansion[1],p.parts[0]);assert.equal(p.expansion[2]*p.expansion[3],p.parts[1]);assert.equal(p.parts[0]+p.parts[1],p.parts[2]);assert.equal(p.correct,p.parts[2]);
 }t.close();
});
test('All four combined sessions complete at 16/16 and sync typed review answers',()=>{
 for(const id of ['oct4-original','oct4-a','oct4-b','oct4-c']){
 const t=boot('?session='+id,null,true),s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id===id);
 for(const q of s.questions)answer(t,q,q.type==='split-sum'?[...q.expansion,...q.parts]:q.correct);
 assert.equal(t.d.querySelector('#score').textContent,'16 / 16');assert(!t.d.querySelector('#completion').hidden);
 const state=JSON.parse(t.w.localStorage.getItem(KEY));assert(t.w.HarrySeptSync.valid(state));state.sessions[id][0].completedAt=null;
 const merged=t.w.HarrySeptSync.merge(state,{version:1,sessions:{}});assert(merged.sessions[id][0].completedAt);assert.equal(Object.keys(merged.sessions[id][0].answers).length,16);assert.match(merged.sessions[id][0].answers[3009].attempts[0].choice,/×.*\+.*=/);t.close();
 }
});
