const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c={window:{}};for(const f of ['data.js','evidence.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,f),'utf8'),c);
const d=JSON.parse(JSON.stringify(c.window.STAR_REVIEW)),e=JSON.parse(JSON.stringify(c.window.STAR_REVIEW_EVIDENCE));
test('all 34 source questions retain their numbers, options, and checked explanations',()=>{
 assert.equal(d.date,'2026-10-30');assert.deepEqual(d.questions.map(q=>q.number),Array.from({length:34},(_,i)=>i+1));
 for(const q of d.questions){assert.equal(q.choices.length,q.number===28?3:4);assert.ok(q.prompt.length>10&&q.explanation.length>35);assert.ok(Number.isInteger(q.selected)&&q.selected>=0&&q.selected<q.choices.length);assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.choices.length);}
 assert.deepEqual(d.questions.filter(q=>q.diagram).map(q=>q.number),[2,26,32]);
});
test('the final highlighted choices give 20 correct and 14 wrong, including the two-column options',()=>{
 assert.deepEqual(d.questions.map(q=>q.selected+1),[3,3,2,1,2,3,3,1,2,2,3,2,2,3,3,3,2,3,4,3,3,3,1,2,4,3,4,1,2,2,1,1,1,3]);
 assert.deepEqual(d.questions.filter(q=>q.selected!==q.correct).map(q=>q.number),[5,6,11,15,16,17,24,25,29,30,31,32,33,34]);
 assert.equal(d.questions.filter(q=>q.selected===q.correct).length,20);
 for(const n of [7,14,21]){const q=d.questions[n-1];assert.notEqual(q.selectionHistory[0].selected,q.correct);assert.equal(q.selected,q.correct);}
 assert.deepEqual(d.questions[29].selectionHistory.map(x=>x.selected+1),[2,3,2]);
});
test('calculation answers include the divisor remainder, decimal precision, and both-middle-values median',()=>{
 const answer=n=>d.questions[n-1].choices[d.questions[n-1].correct];
 assert.equal(Number.parseInt(answer(5).replace(',',''),10),80*40);
 assert.equal(Math.floor(5852/25),234);assert.equal(5852%25,2);assert.equal(answer(6),'234 2/25');
 assert.equal(answer(16),String(65/8));assert.equal(answer(24),'(4 × 100) + (5 × 10) + (8 × 1)');assert.equal(657-199,458);
 assert.equal(answer(30),'0.07');assert.equal(answer(31),String((2+1/5)*5));assert.equal(answer(34),String((200+226)/2));
});
test('each final choice has a cropped source image and ordered presentation timestamp',()=>{
 assert.equal(e.length,34);for(const [i,r]of e.entries()){assert.equal(r.number,i+1);assert.equal(r.selected,d.questions[i].selected);assert.ok(r.time>0&&(i===0||r.time>e[i-1].time));assert.ok(r.selectionSpan.start<=r.time);assert.ok(r.width>100&&r.width<1250&&r.height>150&&r.height<700);assert.equal(r.selectionHistory.at(-1).selected,r.selected);const f=fs.readFileSync(path.join(__dirname,'images',`q${String(i+1).padStart(2,'0')}.webp`));assert.equal(f.subarray(8,12).toString(),'WEBP');assert.ok(f.length>2000);}
});
test('the Math landing page links to the latest full test and directly to the 14 mistakes',()=>{
 const landing=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8');assert.ok(landing.includes('href="./tests/2026-10-30/"'));assert.ok(landing.includes('./tests/2026-10-30/?filter=wrong'));assert.ok(landing.includes('./tests/2026-09-20/'));assert.ok(landing.includes('id="test-list"'));
 const page=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');assert.ok(page.includes('id="wrong-filter"'));assert.ok(page.includes('id="all-filter"'));assert.ok(!page.includes('shared-activity-tracker'));assert.ok(!page.includes('api/shared/progress'));
});
test('the 14 mistakes belong to seven of the eight practice skills without inventing a unit-conversion miss',()=>{
 assert.equal(d.skillGroups.length,8);const wrong=d.questions.filter(q=>q.selected!==q.correct);assert.ok(wrong.every(q=>d.skillGroups.some(s=>s.id===q.skill)));assert.deepEqual(Object.fromEntries(d.skillGroups.map(s=>[s.id,wrong.filter(q=>q.skill===s.id).map(q=>q.number)])),{fractions:[11,17,31,33],calculation:[6,16,24],area:[5,29],scaling:[15],rounding:[25,30],units:[],coordinates:[32],median:[34]});
});
