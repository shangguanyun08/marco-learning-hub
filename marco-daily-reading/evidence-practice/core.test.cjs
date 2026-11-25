const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('./core.js'),sync=require('./sync.js');
const ctx={};vm.runInNewContext(fs.readFileSync(__dirname+'/data.js','utf8'),ctx);const D=ctx.EvidenceData;
const q=D.questions[0],paragraphs=D.passages[q.passage].paragraphs;
function fresh(){return {id:'primary',answers:{},drafts:{[q.id]:{choice:1,marks:[{p:0,start:0,end:10}],keywords:[0],why:'My first reason'}}};}
test('every new question has one source and all suggested excerpts occur exactly in its passage',()=>{
 assert.equal(D.questions.length,19);assert.equal(new Set(D.questions.map(q=>q.source)).size,19);
 for(const q of D.questions){assert.equal(q.choices.length,4);assert.ok(q.answer>=0&&q.answer<4);for(const m of core.suggestions(q,D.passages[q.passage].paragraphs))assert.ok(m.p>=0&&m.end>m.start,q.id+' '+m.quote);}
 const report=JSON.parse(fs.readFileSync(__dirname+'/source-report.json','utf8'));assert.equal(report.items.length,19);assert.ok(report.items.every(s=>D.questions[s.practice-1].source===s.source));
});
test('answer submission requires valid passage evidence and question keywords',()=>{
 const r=fresh();r.drafts[q.id].marks=[];assert.equal(core.check(q,paragraphs,r,'2026-11-25T01:00:00Z'),null);
 r.drafts[q.id].marks=[{p:0,start:-1,end:99999}];assert.equal(core.check(q,paragraphs,r,'2026-11-25T01:00:00Z'),null);
 r.drafts[q.id].marks=[{p:0,start:0,end:10}];r.drafts[q.id].keywords=[];assert.equal(core.check(q,paragraphs,r,'2026-11-25T01:00:00Z'),null);
 r.drafts[q.id].keywords=[0];assert.ok(core.check(q,paragraphs,r,'2026-11-25T01:00:00Z'));
});
test('two attempts preserve independent highlights and first score; a third is blocked',()=>{
 const r=fresh(),a=core.check(q,paragraphs,r,'2026-11-25T01:00:00Z'),snapshot=JSON.stringify(a);
 r.drafts[q.id].choice=2;r.drafts[q.id].marks=[{p:1,start:0,end:18}];r.drafts[q.id].keywords=[2];r.drafts[q.id].why='A revised reason';
 const b=core.check(q,paragraphs,r,'2026-11-25T01:01:00Z');assert.equal(JSON.stringify(a),snapshot);assert.notEqual(a.marks[0].quote,b.marks[0].quote);assert.equal(a.answerOK,false);assert.equal(b.answerOK,false);assert.ok(core.resolved(r.answers[q.id]));
 r.drafts[q.id].choice=q.answer;assert.equal(core.check(q,paragraphs,r,'2026-11-25T01:02:00Z'),null);
});
test('a correct first try locks and repeated wrong choices do not consume a retry',()=>{
 const r=fresh();core.check(q,paragraphs,r,'2026-11-25T01:00:00Z');r.drafts[q.id].choice=1;assert.equal(core.check(q,paragraphs,r,'2026-11-25T01:01:00Z'),null);
 r.drafts[q.id].choice=q.answer;assert.ok(core.check(q,paragraphs,r,'2026-11-25T01:02:00Z').answerOK);assert.ok(core.resolved(r.answers[q.id]));
 const a=fresh();a.drafts[q.id].choice=q.answer;core.check(q,paragraphs,a,'2026-11-25T01:00:00Z');assert.equal(core.check(q,paragraphs,a,'2026-11-25T01:01:00Z'),null);
});
test('online merge preserves highlights and separates conflicting first answers',()=>{
 const a=fresh(),b=fresh();b.drafts[q.id].choice=2;core.check(q,paragraphs,a,'2026-11-25T01:00:00Z');core.check(q,paragraphs,b,'2026-11-25T01:00:01Z');
 const out=sync.merge({version:1,articles:{evidence:[a]}},{version:1,articles:{evidence:[b]}});assert.equal(out.articles.evidence.length,2);assert.ok(out.articles.evidence.every(r=>r.answers[q.id].length===1&&r.answers[q.id][0].marks.length===1));
 assert.equal(sync.stable(out),sync.stable(sync.merge(out,out)));
});
