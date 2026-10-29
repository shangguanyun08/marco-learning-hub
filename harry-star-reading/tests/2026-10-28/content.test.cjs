const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c={window:{}};for(const f of ['data.js','evidence.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,f),'utf8'),c);
const d=JSON.parse(JSON.stringify(c.window.STAR_REVIEW)),e=JSON.parse(JSON.stringify(c.window.STAR_REVIEW_EVIDENCE));
test('all 34 original questions and complete passages retain their original numbers and choice counts',()=>{
 assert.equal(d.date,'2026-10-28');assert.deepEqual(d.questions.map(q=>q.number),Array.from({length:34},(_,i)=>i+1));
 for(const q of d.questions){assert.equal(q.choices.length,q.number<=10?4:3);assert.ok(Number.isInteger(q.selected)&&q.selected>=0&&q.selected<q.choices.length);assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.choices.length);assert.ok(q.prompt.length>10&&q.explanation.length>35);if(q.number>10)assert.ok(q.passage?.length>25);}
 assert.equal(d.questions.filter(q=>q.passage).length,24);
});
test('final visible selections, rather than earlier clicks, give 22 correct and 12 incorrect',()=>{
 assert.deepEqual(d.questions.map(q=>q.selected+1),[3,2,1,2,3,4,4,2,3,2,1,2,3,1,1,2,3,3,3,2,2,3,3,1,1,3,2,3,1,3,3,1,1,3]);
 assert.deepEqual(d.questions.filter(q=>q.selected!==q.correct).map(q=>q.number),[4,6,8,10,11,13,17,21,24,30,32,34]);
 assert.equal(d.questions.filter(q=>q.selected===q.correct).length,22);
 for(const n of [11,17,34]){const q=d.questions[n-1];assert.equal(q.selectionHistory[0].selected,q.correct);assert.notEqual(q.selected,q.correct);assert.equal(q.selectionHistory.at(-1).selected,q.selected);}
 assert.deepEqual(d.questions[6].selectionHistory.map(x=>x.selected+1),[2,3,4]);
});
test('every selection has a cropped evidence frame and a monotonically ordered video timestamp',()=>{
 assert.equal(e.length,34);for(const [i,r]of e.entries()){assert.equal(r.number,i+1);assert.equal(r.selected,d.questions[i].selected);assert.ok(r.time>0&&(i===0||r.time>e[i-1].time));assert.ok(r.selectionSpan.start<=r.time);assert.ok(r.width>=300&&r.width<1000&&r.height>150&&r.height<700);const file=fs.readFileSync(path.join(__dirname,'images',`q${String(i+1).padStart(2,'0')}.webp`));assert.equal(file.subarray(8,12).toString(),'WEBP');assert.ok(file.length>2000);}
});
test('the reading landing page links to the full latest review and directly to its mistakes',()=>{
 const landing=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8');assert.ok(landing.includes('href="./tests/2026-10-28/"'));assert.ok(landing.includes('./tests/2026-10-28/?filter=wrong'));assert.ok(landing.includes('./tests/2026-10-10/'));assert.ok(landing.includes('./tests/2026-09-20/'));
 const page=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');assert.ok(page.includes('id="wrong-filter"'));assert.ok(page.includes('id="all-filter"'));assert.ok(!page.includes('shared-activity-tracker'));assert.ok(!page.includes('api/shared/progress'));
});
