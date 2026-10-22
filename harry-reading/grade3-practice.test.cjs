const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const core=require('./core.js'),context={window:{}};
for(const name of ['data.js','grade3-practice.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,name),'utf8'),context);
const all=JSON.parse(JSON.stringify(context.window.READING_ARTICLES)),practice=all.slice(3);
function selectPhrase(article,text){
  const sentence=core.sentences(article).flat().find(s=>s.text.includes(text));
  assert.ok(sentence,`Missing source evidence: ${article.id} / ${text}`);
  const start=sentence.text.indexOf(text);
  return {sid:sentence.id,start,end:start+text.length};
}
test('ten practice sessions follow the three existing articles, with 52 new multiple-choice questions',()=>{
  assert.deepEqual(all.slice(0,3).map(a=>a.id),['carla','fruits','trip']);
  assert.equal(all.length,13);assert.equal(practice.length,10);
  assert.deepEqual(practice.map(a=>a.questions.length),[4,4,6,4,5,6,5,6,6,6]);
  assert.equal(practice.reduce((n,a)=>n+a.questions.length,0),52);
  assert.equal(new Set(all.map(a=>a.id)).size,13);
  const ids=all.flatMap(a=>a.questions.map(q=>q.id));assert.equal(new Set(ids).size,62);
});
test('recorded Lexile scores and reference Lexile levels are distinguished',()=>{
  assert.deepEqual(all.slice(0,3).map(a=>a.lexile),[500,480,640]);
  assert.deepEqual(practice.map(a=>a.referenceLexile),[460,470,470,480,500,500,540,560,570,580]);
  for(const a of practice){assert.equal(a.lexile,null);assert.equal(a.kind,'parallel');assert.equal(a.grade,3);assert.ok(a.referenceTitle);assert.match(a.referenceUrl,/^https:\/\/readtheory\.org\/wp-content\/uploads\/2020\/04\/.+\.pdf$/);}
});
for(const a of practice)for(const q of a.questions){
  test(`${q.id}: four distinct choices, valid key, and passage-supported evidence`,()=>{
    assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);
    assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
    assert.ok(q.explanation.length>20);assert.ok(q.hint.length>10);
    const marks=q.evidence.map(group=>{
      for(const option of group)selectPhrase(a,option);
      return selectPhrase(a,group[0]);
    });
    assert.equal(core.assess(a,q,marks).correct,true);
    const r=core.prepareRun(a,{answers:{}});r.drafts[q.id]={choice:q.answer,marks};
    assert.equal(core.recordCheck(a,q,r,'check').evidenceOK,true);
    assert.equal(core.passed(r.answers[q.id]),true);
  });
  if(q.evidence.length>1)test(`${q.id}: omitting a required part is not fully supported`,()=>{
    const marks=q.evidence.slice(0,-1).map(group=>selectPhrase(a,group[0]));
    assert.equal(core.assess(a,q,marks).correct,false);
  });
}
test('adding practice articles preserves earlier checked attempts and first-try scores',()=>{
  const old=all[0],q=old.questions[0],checked={choice:q.answer,checkedAt:'old',answerOK:true,evidenceOK:true,marks:[]};
  const r={answers:{[q.id]:[checked]}};core.prepareRun(old,r);
  assert.equal(r.answers[q.id][0],checked);
  assert.deepEqual(core.scores(old,r),{mastered:1,firstAnswers:1,firstEvidence:1,total:2});
});
