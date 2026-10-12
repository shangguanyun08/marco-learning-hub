import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const read=f=>readFileSync(new URL(f,import.meta.url),'utf8'),KEY='harry-star-sept20-four-sessions-v1';
function boot(query='?group=week-2026-10-12',saved){
 const html=read('./index.html'),dom=new JSDOM(html,{url:'http://localhost/'+query,runScripts:'outside-only'}),w=dom.window;w.HTMLElement.prototype.scrollIntoView=function(){};if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));let before;
 for(const [,src] of html.matchAll(/<script src="([^"]+)" defer>/g)){if(src.includes('week-oct12-data'))before=JSON.stringify(w.HARRY_SEPT_PRACTICE);w.eval(read(src.split('?')[0]));}
 return {w,d:w.document,before,sets:w.HARRY_SEPT_PRACTICE.filter(s=>s.weekly),close:()=>w.close()};
}
function answer(t,q,n){const f=t.d.querySelector(`form[data-source="${q.source}"]`);if(n!==null)f.querySelector(`input[value="${n}"]`).checked=true;f.dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));}
function run(s,first,id='initial'){
 const r={id,startedAt:'2026-10-12T16:00:00.000Z',completedAt:'2026-10-12T16:20:00.000Z',answers:{}};
 s.questions.forEach((q,i)=>r.answers[q.source]={attempts:[{choice:i<first?q.correct:(q.correct+1)%4,correct:i<first,at:'2026-10-12T16:01:00.000Z'},...(i<first?[]:[{choice:q.correct,correct:true,at:'2026-10-12T16:02:00.000Z'}])]});return r;
}
test('Six dates, 72 fresh questions, equal skill blueprint; older content unchanged',()=>{
 const t=boot();assert.equal(t.sets.length,6);assert.equal(t.d.querySelectorAll('.session-link').length,6);assert.equal(JSON.stringify(t.w.HARRY_SEPT_PRACTICE.filter(s=>!s.weekly)),t.before);
 const signatures=new Set();for(const s of t.sets){assert.equal(s.questions.length,12);assert.equal(new Set(s.questions.map(q=>q.source)).size,12);for(const q of s.questions){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(q.correct>=0&&q.correct<4);assert(q.explanation.length>25);signatures.add(JSON.stringify([q.prompt,q.choices,q.visual]));}assert.deepEqual(Array.from(s.questions,q=>q.skill).sort(),Array.from(t.sets[0].questions,q=>q.skill).sort());}assert.equal(signatures.size,72);assert(!t.d.querySelector('#weekly-progress').hidden);assert(!t.d.querySelector('#weekly-progress').textContent.includes('0/12'));t.close();
});
test('Independent answer key for all 72 items, with diagram and arithmetic checks',()=>{
 const t=boot(),money=n=>'$'+n.toFixed(2),comma=n=>n.toLocaleString('en-US');
 const keys=[
 ['5 hundreds + 8 tens + 4 ones',comma(Math.round(426318/10000)*10000),'3/4','6/9','1/2 meter',String(36*24),money(16*45/100),(173%8)+' ounces',String(47+6*5),(84/7)+' gallons',String(20/4),'18 inches'],
 ['40,000 + 2,000 + 500 + 10 + 7',comma(Math.round(683942/10000)*10000),'2/5','9','1/2',String(43*23),money(18*35/100),String(206%9),'38 + 4 × 7','1 minute',String(3*8),(2*(13+7))+' inches'],
 ['6 × 10,000 + 4 × 1,000 + 2 × 100 + 8 × 10 + 3','524,180','5/6','3/8',(2*5+3)+'/5',String(27*34),((2758+3126)/100)+' seconds',String(239%7),String(4*3*6),'c ÷ 6 = 7',String(4*36),'22 inches'],
 ['70 + 3 + 4/10 + 6/1000',comma(Math.round(357261/10000)*10000),'3/8','12/15','3/28',String(32*26),money(24*30/100),(254%9)+' ounces',String(56+5*8),String(108/9),String(28/2),(12*8)+' square feet'],
 ['8,000','736,582','4/5','15','3/5',comma(42*24),((3467+2358)/100)+' seconds',String(227%8),'40 − 5 × 7','h = 7n',String(5*16),'9 inches'],
 ['80,000 + 6,000 + 300 + 50 + 9',comma(Math.round(912648/10000)*10000),'5/8','4/9',(3*7+2)+'/7',String(34*27),money(22*40/100),(263%6)+' ounces',String(5*3*4),String(132/11),String(6*4),(2*(14+6))+' inches']
 ];
 t.sets.forEach((s,d)=>s.questions.forEach(q=>{assert.equal(q.choices[q.correct],keys[d][q.source-1],`${d+1}/${q.source}`);if(q.visual?.type==='week-numberline')assert.equal(q.choices[q.correct],q.visual.point+'/'+q.visual.parts);if(q.visual?.type==='oct10-radius')assert.equal(parseFloat(q.choices[q.correct]),q.visual.radius*2);}));
 for(const [d,target] of [[2,520000],[4,740000]]){const q=t.sets[d].questions.find(q=>q.source===2);q.choices.forEach((c,i)=>assert.equal(Math.round(Number(c.replaceAll(',',''))/10000)*10000===target,i===q.correct));}t.close();
});
test('Each day scores independently, allows one retry, reveals after two misses and reloads',()=>{
 for(let d=1;d<=6;d++){let t=boot('?session=week-oct12-'+d),s=t.sets[d-1];assert.equal(t.d.querySelectorAll('.question').length,12);assert.equal(t.d.querySelectorAll('.answer').length,0);assert(!t.d.querySelector('#session-description').textContent.includes('example'));
  let q=s.questions[0];answer(t,q,null);answer(t,q,(q.correct+1)%4);answer(t,q,(q.correct+1)%4);assert.equal(t.d.querySelectorAll('.answer').length,0);answer(t,q,q.correct);assert.equal(t.d.querySelector('#score').textContent,'0 / 12');
  q=s.questions[1];answer(t,q,(q.correct+1)%4);answer(t,q,(q.correct+2)%4);for(const q of s.questions.slice(2))answer(t,q,q.correct);
  assert.equal(t.d.querySelector('#score').textContent,'10 / 12');assert.match(t.d.querySelector('#completion').textContent,/83%/);assert.equal(t.d.querySelectorAll('.answer').length,12);const saved=JSON.parse(t.w.localStorage.getItem(KEY));assert(t.w.HarrySeptSync.valid(saved));saved.sessions[s.id][0].completedAt=null;assert(t.w.HarrySeptSync.merge(saved,saved).sessions[s.id][0].completedAt);t.close();t=boot('?session='+s.id,saved);assert.equal(t.d.querySelector('#score').textContent,'10 / 12');assert.match(t.d.querySelector('#weekly-progress').textContent,/10\/12/);t.close();}
});
test('Trend uses first runs, does not treat incomplete days as zero, preserves retry and repeat history',()=>{
 let t=boot(),a=t.sets[0],b=t.sets[1],c=t.sets[2],state={version:1,sessions:{[a.id]:[run(a,7),{...run(a,12,'repeat'),startedAt:'2026-10-13T10:00:00Z'}],[b.id]:[run(b,9)],[c.id]:[{...run(c,12),answers:{[c.questions[0].source]:run(c,12).answers[c.questions[0].source]},completedAt:null}]}};t.close();t=boot('?group=week-2026-10-12',state);
 const rows=t.d.querySelectorAll('.week-score-table tbody tr');assert.match(rows[0].textContent,/7\/12/);assert.match(rows[1].textContent,/9\/12/);assert.match(rows[1].textContent,/\+2/);assert.match(rows[2].textContent,/1 correct so far/);assert(!rows[2].textContent.includes('12/12'));assert.match(t.d.querySelector('.week-trend').textContent,/2 more/);assert.match(t.d.querySelector('.session-link').textContent,/7\/12/);assert.equal(JSON.parse(t.w.localStorage.getItem(KEY)).sessions[a.id].length,2);
 assert(t.d.querySelector('.week-review').textContent.includes('fixed on retry'));t.close();
});
