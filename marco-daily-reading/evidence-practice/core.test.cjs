const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('./core.js'),sync=require('./sync.js');
const ctx={};vm.runInNewContext(fs.readFileSync(__dirname+'/data.js','utf8'),ctx);const D=ctx.EvidenceData;
const q=D.questions[0],paragraphs=D.passages[q.passage].paragraphs;
function fresh(){return {id:'primary',answers:{},drafts:{[q.id]:{choice:1,marks:[{p:0,start:0,end:10}]}}};}
test('every new question has one source and all suggested excerpts occur exactly in its passage',()=>{
 assert.equal(D.questions.length,19);assert.equal(new Set(D.questions.map(q=>q.source)).size,19);
 for(const q of D.questions){assert.equal(q.choices.length,4);assert.ok(q.answer>=0&&q.answer<4);for(const m of core.suggestions(q,D.passages[q.passage].paragraphs))assert.ok(m.p>=0&&m.end>m.start,q.id+' '+m.quote);}
 const report=JSON.parse(fs.readFileSync(__dirname+'/source-report.json','utf8'));assert.equal(report.items.length,19);assert.ok(report.items.every(s=>D.questions[s.practice-1].source===s.source));
});
test('one answer requires one valid highlight and no extra question-word step',()=>{
 const r=fresh();r.drafts[q.id].marks=[];assert.equal(core.check(q,paragraphs,r,'2026-11-25T01:00:00Z'),null);
 r.drafts[q.id].marks=[{p:0,start:-1,end:99999}];assert.equal(core.check(q,paragraphs,r,'2026-11-25T01:00:00Z'),null);
 r.drafts[q.id].marks=[{p:0,start:0,end:10},{p:1,start:0,end:10}];assert.equal(core.check(q,paragraphs,r,'2026-11-25T01:00:00Z'),null);
 r.drafts[q.id].marks=[{p:0,start:0,end:10}];assert.ok(core.check(q,paragraphs,r,'2026-11-25T01:00:00Z'));
});
test('an incorrect answer locks immediately and preserves its original highlight',()=>{
 const r=fresh(),a=core.check(q,paragraphs,r,'2026-11-25T01:00:00Z'),snapshot=JSON.stringify(a);
 r.drafts[q.id].choice=q.answer;r.drafts[q.id].marks=[{p:1,start:0,end:18}];
 assert.equal(core.check(q,paragraphs,r,'2026-11-25T01:01:00Z'),null);assert.equal(JSON.stringify(a),snapshot);assert.equal(a.answerOK,false);assert.ok(core.resolved(r.answers[q.id]));assert.equal(r.answers[q.id].length,1);
});
test('a correct answer also locks after one check',()=>{
 const a=fresh();a.drafts[q.id].choice=q.answer;core.check(q,paragraphs,a,'2026-11-25T01:00:00Z');assert.equal(core.check(q,paragraphs,a,'2026-11-25T01:01:00Z'),null);
});
test('one continuous highlight can cross a paragraph boundary',()=>{
 const r=fresh();r.drafts[q.id].marks=[{p:0,start:paragraphs[0].length-10,end:paragraphs[0].length},{p:1,start:0,end:20}];
 const a=core.check(q,paragraphs,r,'2026-11-25T01:00:00Z');assert.equal(a.highlight.ranges.length,2);assert.equal(a.highlight.quote,paragraphs[0].slice(-10).trim()+' '+paragraphs[1].slice(0,20).trim());
});
test('online merge preserves highlights and separates conflicting first answers',()=>{
 const a=fresh(),b=fresh();b.drafts[q.id].choice=2;core.check(q,paragraphs,a,'2026-11-25T01:00:00Z');core.check(q,paragraphs,b,'2026-11-25T01:00:01Z');
 const out=sync.merge({version:1,articles:{evidence:[a]}},{version:1,articles:{evidence:[b]}});assert.equal(out.articles.evidence.length,2);assert.ok(out.articles.evidence.every(r=>r.answers[q.id].length===1&&r.answers[q.id][0].marks.length===1));
 assert.equal(sync.stable(out),sync.stable(sync.merge(out,out)));
});
