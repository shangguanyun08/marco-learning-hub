import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {completedRun} from './weekly-test-helpers.mjs';
const KEY='harry-star-sept20-four-sessions-v1',read=f=>readFileSync(new URL(f,import.meta.url),'utf8'),copy=x=>JSON.parse(JSON.stringify(x));
function boot(t,query='?group=week-2026-10-12',saved){
 const w=new JSDOM(read('./index.html'),{url:'http://localhost/'+query,runScripts:'outside-only'}).window;t.after(()=>w.close());w.HTMLElement.prototype.scrollIntoView=()=>{};w.fetch=()=>{throw Error('No live data writes in tests');};
 if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));
 for(const tag of w.document.querySelectorAll('script[defer][src]'))w.eval(read(tag.getAttribute('src').split('?')[0]));
 return {w,d:w.document,session:id=>w.HARRY_SEPT_PRACTICE.find(s=>s.id===id),saved:()=>JSON.parse(w.localStorage.getItem(KEY)||'null')};
}
function complete(b,state,id,score=12,review=true){
 const session=b.session(id),r=completedRun(session,score);state.sessions[id]=[r];
 if(review&&score<12){const rs=b.w.HarryWeekRound2.resolve(id+'-round2',state),rr=completedRun(rs);Object.assign(rr,{round2Sources:rs.questions.map(q=>q.source),sourceRunId:r.id});state.sessions[rs.id]=[rr];}
 return r;
}
function early(b){const state={version:1,sessions:{}};for(const n of [1,2])complete(b,state,'week-oct12-'+n,10);return state;}
function click(b,id){b.d.querySelector(`a[href="?session=${id}"]`).click();}
test('48 fresh retest and Round 2 questions have independent checked answers and matching diagrams',t=>{
 const b=boot(t),bank=b.w.HARRY_SEPT_PRACTICE,retests=bank.filter(s=>s.retest),expected=[
 ['70,000 + 2,000 + 400 + 40 + 5','392,328','2/6','6/18','21/6','759','58.53 seconds','2','40','c ÷ 5 = 6','216','28 inches'],
 ['70,000 + 3,000 + 500 + 60 + 6','432,339','3/7','8/21','32/7','840','60.63 seconds','3','60','c ÷ 6 = 7','252','30 inches'],
 ['70,000 + 4,000 + 600 + 80 + 7','472,350','4/8','10/24','45/8','925','62.73 seconds','4','84','c ÷ 7 = 8','288','32 inches'],
 ['70,000 + 5,000 + 800 + 0 + 8','512,361','5/9','12/27','60/9','1,014','64.83 seconds','5','112','c ÷ 8 = 9','324','34 inches']];
 const sets=[...retests.map(s=>s.questions),...retests.map(s=>b.w.HarryWeekRound2.variants.get(s.id))],signatures=new Set();
 sets.forEach((qs,i)=>{assert.equal(qs.length,12);qs.forEach(q=>{assert.equal(q.choices[q.correct],expected[i][q.source-1]);assert.equal(new Set(q.choices).size,4);if(q.visual?.type==='week-numberline')assert.equal(q.choices[q.correct],q.visual.point+'/'+q.visual.parts);if(q.visual?.type==='oct10-radius')assert.equal(parseFloat(q.choices[q.correct]),2*q.visual.radius);signatures.add(JSON.stringify([q.prompt,q.visual]));});});assert.equal(signatures.size,48);
 assert.deepEqual(Array.from(b.d.querySelectorAll('.session-link b'),x=>x.textContent.replace('🔒 ','')),['Day 1','Day 2','Day 3','Day 3.2','Day 3.3','Day 4','Day 5','Day 6']);assert.doesNotMatch(b.d.querySelector('#sessions').textContent,/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday/);
});
test('Direct links and existing later answers cannot bypass earlier work or change saved records',t=>{
 const setup=boot(t),state={version:1,sessions:{}};complete(setup,state,'week-oct12-4',5,false);const before=copy(state),b=boot(t,'?session=week-oct12-4',state);
 assert.match(b.d.querySelector('.session-lock').textContent,/Finish Day 1/);assert.equal(b.d.querySelectorAll('.question').length,0);assert.deepEqual(b.saved(),before);
 b.d.querySelector('#new-run').click();assert.deepEqual(b.saved(),before);click(b,'week-oct12-6');assert.equal(b.d.querySelectorAll('.question').length,0);assert.deepEqual(b.saved(),before);
});
test('Second tries and separate Round 2 must finish before the next day or retest opens',t=>{
 const b=boot(t),state=early(b),s=b.session('week-oct12-3'),r=complete(b,state,s.id,4,false);
 for(const e of Object.values(r.answers))e.attempts=e.attempts.slice(0,1);r.completedAt=null;
 assert.match(b.w.HarryWeekRules.lockReason(b.w.HarryWeekRound2.resolve(s.id+'-round2',state),state),/every second try/);
 assert.match(b.w.HarryWeekRules.lockReason(b.session('week-oct12-3-2'),state),/second try/);
 complete(b,state,s.id,4,false);assert.match(b.w.HarryWeekRules.lockReason(b.session('week-oct12-3-2'),state),/Round 2/);
 complete(b,state,s.id,4,true);assert.equal(b.w.HarryWeekRules.lockReason(b.session('week-oct12-3-2'),state),'');assert.match(b.w.HarryWeekRules.lockReason(b.session('week-oct12-3-3'),state),/Day 3.2/);
});
test('9/12 stays on Day 3; a repeat of old questions cannot raise the immutable first score',t=>{
 const b=boot(t),state=early(b);complete(b,state,'week-oct12-3',9);state.sessions['week-oct12-3'].push({...completedRun(b.session('week-oct12-3'),12,'repeat'),startedAt:'2026-10-15T18:00:00Z'});
 assert.match(b.w.HarryWeekRules.lockReason(b.session('week-oct12-4'),state),/at least 10\/12/);
 const view=boot(t,'?session=week-oct12-3',state);assert.equal(view.d.querySelector('#score').textContent,'9 / 12');assert.ok(view.d.querySelector('#new-run').hidden);
});
test('A fresh 10/12 retest unlocks Day 4 only after Round 2, and retest records survive sync and reload',t=>{
 const b=boot(t),state=early(b);complete(b,state,'week-oct12-3',4);complete(b,state,'week-oct12-3-2',10,false);
 assert.match(b.w.HarryWeekRules.lockReason(b.session('week-oct12-4'),state),/10\/12/);complete(b,state,'week-oct12-3-2',10,true);
 assert.equal(b.w.HarryWeekRules.lockReason(b.session('week-oct12-4'),state),'');assert.ok(b.w.HarrySeptSync.valid(state));
 const merged=b.w.HarrySeptSync.merge(state,{version:1,sessions:{}});assert.deepEqual(copy(merged.sessions['week-oct12-3-2']),state.sessions['week-oct12-3-2']);assert.deepEqual(copy(merged.sessions['week-oct12-3-2-round2']),copy(state.sessions['week-oct12-3-2-round2']));
 const view=boot(t,'?session=week-oct12-4',merged);assert.equal(view.d.querySelectorAll('.question').length,12);assert.match(view.d.querySelector('a[href="?session=week-oct12-5"]').className,/locked/);
});
test('Mistake-only filter includes corrected first misses, hides unanswered/right answers, and preserves scores',t=>{
 const b=boot(t),state=early(b),r=complete(b,state,'week-oct12-3',4,false),session=b.session('week-oct12-3');delete r.answers[session.questions[11].source];r.completedAt=null;
 const view=boot(t,'?session=week-oct12-3',state),before=view.saved();view.d.querySelector('#toggle-mistakes').click();assert.equal(view.d.querySelectorAll('.question:not([hidden])').length,7);assert.equal(view.d.querySelectorAll('#jump a:not([hidden])').length,7);assert.equal(view.d.querySelector('#score').textContent,'4 / 12');assert.deepEqual(view.saved(),before);
 view.d.querySelector('#toggle-mistakes').click();assert.equal(view.d.querySelectorAll('.question:not([hidden])').length,12);
});
test('Storage sync unlocks an open future page after qualifying work arrives',t=>{
 const b=boot(t),state=early(b);complete(b,state,'week-oct12-3',10,true);const view=boot(t,'?session=week-oct12-4');assert.ok(view.d.querySelector('.session-lock'));
 view.w.dispatchEvent(new view.w.StorageEvent('storage',{key:KEY,newValue:JSON.stringify(state)}));assert.equal(view.d.querySelectorAll('.question').length,12);
});
test('Science review is retained under Marco archives only',()=>{
 const d=new JSDOM(read('../../index.html')).window.document,card=d.querySelector('#science-practice-preview');assert.ok(card.closest('#archives'));assert.equal(card.querySelector('a').getAttribute('href'),'./science-preview.html');assert.equal(d.querySelectorAll('#science-practice-preview').length,1);
});
