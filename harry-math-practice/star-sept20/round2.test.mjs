import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const dir=new URL('.',import.meta.url),marco=new URL('../../marco-daily-test-review/math-skill-builder-2026-10-12/',dir);
const read=(folder,file)=>readFileSync(new URL(file,folder),'utf8'),copy=x=>JSON.parse(JSON.stringify(x));
const HKEY='harry-star-sept20-four-sessions-v1',MKEY='marco-math-skill-builder-oct12-v1';
function boot(folder,query,key,state){
 const html=read(folder,'index.html'),dom=new JSDOM(html,{url:'http://localhost/'+query,runScripts:'outside-only'}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=function(){};
 if(state)w.localStorage.setItem(key,JSON.stringify(state));
 for(const tag of w.document.querySelectorAll('script[defer][src]'))w.eval(read(folder,tag.getAttribute('src').split('?')[0]));
 return {w,d:w.document,close:()=>w.close(),saved:()=>JSON.parse(w.localStorage.getItem(key))};
}
function click(t,selector){const el=t.d.querySelector(selector);assert.ok(el,selector);el.click();}
function answer(t,key,id,choice){
 const form=[...t.d.querySelectorAll('form')].find(f=>f.dataset[key]===String(id));assert.ok(form,'question '+id);
 form.querySelector(`input[value="${choice}"]`).checked=true;form.dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));
}
function harryState(t,day,misses=[0,1]){
 const s=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='week-oct12-'+day),run={id:'original-'+day,startedAt:'2026-10-12T18:00:00Z',completedAt:'2026-10-12T18:05:00Z',answers:{}};
 s.questions.forEach((q,i)=>{const wrong=misses.includes(i);run.answers[q.source]={attempts:[{choice:(q.correct+(wrong?1:0))%4,correct:!wrong,at:'2026-10-12T18:01:00Z'},...(wrong?[{choice:q.correct,correct:true,at:'2026-10-12T18:02:00Z'}]:[])]};});
 return {version:1,sessions:{[s.id]:[run]}};
}
test('Harry: independent answer keys for all 72 review variants, fresh givens and matching visuals',()=>{
 const t=boot(dir,'?group=week-2026-10-12',HKEY);
 const expected=[
 ['7 hundreds + 6 tens + 3 ones','540,000','3/5','9/15','1/2 meter',String(38*23),'$8.10','3 ounces',String(53+4*7),'13 gallons','6','14 inches'],
 ['50,000 + 7,000 + 300 + 20 + 6','790,000','5/6','6','1/2',(42*26).toLocaleString('en-US'),'$5.60','5','46 + 5 × 6','2 minutes','32','46 inches'],
 ['8 × 10,000 + 5 × 1,000 + 4 × 100 + 7 × 10 + 1','634,270','7/8','4/15','17/5',String(29*32),'61.15 seconds','2',String(5*2*7),'c ÷ 5 = 8','180','16 inches'],
 ['60 + 2 + 3/10 + 5/1000','470,000','1/6','9/21','2/15',String(34*28),'$7.80','8 ounces',String(62+6*7),'13','16','126 square feet'],
 ['6,000','846,391','3/8','12','4/7',(46*23).toLocaleString('en-US'),'60.45 seconds','2','50 − 4 × 8','h = 9n','112','13 inches'],
 ['90,000 + 2,000 + 700 + 40 + 6','820,000','3/4','6/12','17/7',String(37*26),'$9.60','2 ounces',String(4*3*5),'14','32','46 inches']
 ];
 for(let day=1;day<=6;day++){
  const base=t.w.HARRY_SEPT_PRACTICE.find(s=>s.id==='week-oct12-'+day),review=t.w.HarryWeekRound2.variants.get(base.id);
  for(const q of review){const original=base.questions.find(x=>x.source===q.source);assert.equal(q.skill,original.skill);assert.equal(q.choices[q.correct],expected[day-1][q.source-1],`${day}/${q.source}`);assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.notEqual(JSON.stringify([q.prompt,q.visual]),JSON.stringify([original.prompt,original.visual]));if(q.visual?.type==='week-numberline')assert.equal(q.choices[q.correct],q.visual.point+'/'+q.visual.parts);if(q.visual?.type==='oct10-radius')assert.equal(parseFloat(q.choices[q.correct]),q.visual.radius*2);}
 }
 t.close();
});
test('Harry: all 6 days select only first misses, including corrected ones; save, restore and sync separately',()=>{
 for(let day=1;day<=6;day++){
  let t=boot(dir,'?group=week-2026-10-12',HKEY),state=harryState(t,day),baseId='week-oct12-'+day,original=copy(state),id=baseId+'-round2';t.close();
  t=boot(dir,'?session='+id,HKEY,state);assert.equal(t.d.querySelectorAll('.question').length,2);assert.equal(t.d.querySelector('#score').textContent,'0 / 2');
  const review=t.w.HarryWeekRound2.resolve(id,state),q=review.questions[0];
  answer(t,'source',q.source,(q.correct+1)%4);assert.equal(t.d.querySelectorAll('.answer').length,0);answer(t,'source',q.source,q.correct);
  answer(t,'source',review.questions[1].source,review.questions[1].correct);
  assert.equal(t.d.querySelector('#score').textContent,'1 / 2');assert.equal(t.d.querySelector('#completion').hidden,false);
  const saved=t.saved();assert.deepEqual(saved.sessions[baseId],original.sessions[baseId]);assert.ok(t.w.HarrySeptSync.valid(saved));
  const merged=t.w.HarrySeptSync.merge(saved,{version:1,sessions:{}});assert.ok(t.w.HarrySeptSync.valid(merged));assert.ok(merged.sessions[id][0].completedAt);
  const conflict=copy(saved);conflict.sessions[id][0].answers[q.source].attempts[0].choice=(q.correct+2)%4;
  assert.equal(t.w.HarrySeptSync.merge(saved,conflict).sessions[id].length,2);
  assert.deepEqual(copy(t.w.HarrySeptSync.merge(saved,conflict)),copy(t.w.HarrySeptSync.merge(conflict,saved)));
  t.close();t=boot(dir,'?session='+id,HKEY,merged);assert.equal(t.d.querySelector('#score').textContent,'1 / 2');assert.match(t.d.querySelector('.week-score-table').textContent,/10\/12/);
  click(t,'#round-navigation a');assert.equal(t.d.querySelectorAll('.question').length,12);assert.equal(t.d.querySelector('#score').textContent,'10 / 12');t.close();
 }
});
test('Harry: no misses and incomplete first passes show an empty state without saving a review run',()=>{
 let t=boot(dir,'?session=week-oct12-1-round2',HKEY);assert.match(t.d.querySelector('#questions').textContent,/waiting/);assert.equal(t.saved(),null);t.close();
 t=boot(dir,'?group=week-2026-10-12',HKEY);const state=harryState(t,1,[]);t.close();
 t=boot(dir,'?session=week-oct12-1-round2',HKEY,state);assert.match(t.d.querySelector('#questions').textContent,/No Round 2 needed/);assert.equal(t.d.querySelector('.scorebar').hidden,true);assert.equal(t.saved().sessions['week-oct12-1-round2'],undefined);
 click(t,'#round-navigation a');assert.equal(t.d.querySelector('.scorebar').hidden,false);assert.equal(t.d.querySelectorAll('.question').length,12);t.close();
});
test('Marco: Round 2 links, new questions, independent score, first-miss color and reload',()=>{
 let t=boot(marco,'?set=1',MKEY);assert.equal(t.d.querySelectorAll('#sets .round2-link').length,8);click(t,'button[data-action="start"]');
 const E=t.w.MarcoSkillEngine,run=t.saved().sessions['set-1'][0],q=E.resolve(run.questionIds[0]);
 answer(t,'question',q.id,(q.correct+1)%4);answer(t,'question',q.id,q.correct);
 assert.equal(t.d.querySelectorAll('.choice.wrong').length,1);
 for(const id of run.questionIds.slice(1))answer(t,'question',id,E.resolve(id).correct);
 const original=t.saved().sessions['set-1'];click(t,'a[href="?set=1&round=2"]');assert.equal(t.d.querySelectorAll('.question').length,0);click(t,'button[data-action="start"]');
 const r=t.saved().sessions['set-1-round2'][0],fresh=E.resolve(r.questionIds[0]);assert.equal(t.d.querySelectorAll('.question').length,1);assert.notEqual(fresh.prompt,q.prompt);
 answer(t,'question',fresh.id,fresh.correct);const saved=t.saved();assert.deepEqual(saved.sessions['set-1'],original);assert.ok(E.valid(saved));assert.match(t.d.querySelector('.scorebar').textContent,/1\/1/);
 t.close();t=boot(marco,'?set=1&round=2',MKEY,saved);assert.match(t.d.querySelector('.scorebar').textContent,/1\/1/);assert.match(t.d.querySelector('#daily-scores').textContent,/14\/15/);t.close();
});
test('Marco: direct Round 2 URL handles waiting and perfect first pass without starting empty runs',()=>{
 let t=boot(marco,'?set=5&round=2',MKEY);assert.match(t.d.querySelector('#content').textContent,/waiting/);assert.equal(t.saved(),null);t.close();
 t=boot(marco,'?set=5',MKEY);const E=t.w.MarcoSkillEngine,state=E.empty(),r=E.start(5,state);state.sessions['set-5']=[r];for(const id of r.questionIds)E.submit(r,id,E.resolve(id).correct);t.close();
 t=boot(marco,'?set=5&round=2',MKEY,state);assert.match(t.d.querySelector('#content').textContent,/No Round 2 needed/);assert.equal(t.saved().sessions['set-5-round2'],undefined);t.close();
});
