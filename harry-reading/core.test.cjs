const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const dir=__dirname;
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dir,'data.js'),'utf8'),ctx);
const articles=JSON.parse(JSON.stringify(ctx.window.READING_ARTICLES)),core=require(path.join(dir,'core.js'));
function exactMarks(article,phrase){
  const ss=core.sentences(article).flat();
  for(const s of ss){const index=s.text.indexOf(phrase);if(index>=0)return [{sid:s.id,start:index,end:index+phrase.length}];}
  // Canonical excerpts can omit the dialogue punctuation; select the source
  // sentence containing the longest distinct phrase instead.
  const normalized=s=>s.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
  const target=normalized(phrase);
  const sentence=ss.find(s=>normalized(s.text).includes(target));
  assert.ok(sentence,`No passage match for ${phrase}`);
  return [{sid:sentence.id,start:0,end:sentence.text.length}];
}
test('exact extraction includes ten misses and original numbering',()=>{
  assert.deepEqual(articles.map(a=>a.questions.map(q=>q.number)),[[4,5],[1,2,3,4],[1,3,5,6]]);
  assert.deepEqual(articles.map(a=>a.questions.map(q=>q.answer)),[[2,1],[1,2,2,3],[0,2,3,3]]);
});
for(const a of articles)for(const q of a.questions){
  test(`${q.id}: focused canonical evidence passes; no evidence fails`,()=>{
    const marks=q.evidence.flatMap(g=>exactMarks(a,g[0]));
    assert.equal(core.assess(a,q,marks).correct,true);
    assert.equal(core.assess(a,q,[]).correct,false);
  });
  if(q.evidence.length>1)test(`${q.id}: missing a required support group fails`,()=>{
    const marks=q.evidence.slice(0,-1).flatMap(g=>exactMarks(a,g[0]));
    assert.equal(core.assess(a,q,marks).correct,false);
  });
}
test('irrelevant highlights, fabricated ranges, and whole-article selections fail',()=>{
  const a=articles[0],q=a.questions[0];
  assert.equal(core.assess(a,q,exactMarks(a,'Mice scamper over the porch.')).correct,false);
  assert.equal(core.assess(a,q,[{sid:'fake',start:0,end:10,quote:'Squirrels run down the driveway.'}]).correct,false);
  assert.equal(core.assess(a,q,core.sentences(a).flat().map(s=>({sid:s.id,start:0,end:s.text.length}))).correct,false);
});
test('score preserves incorrect first answer after a successful retry',()=>{
  const a=articles[0],q=a.questions[0];
  const r={answers:{[q.id]:[{choice:0,checkedAt:'2026-10-22T10:00:00Z',answerOK:false,evidenceOK:true},{choice:2,checkedAt:'2026-10-22T10:01:00Z',answerOK:true,evidenceOK:true}]}};
  assert.deepEqual(core.scores(a,r),{mastered:1,firstAnswers:0,firstEvidence:1,total:2});
});
test('answer alone and evidence alone cannot complete a question',()=>{
  assert.equal(core.passed([{checkedAt:'now',answerOK:true,evidenceOK:false}]),false);
  assert.equal(core.passed([{checkedAt:'now',answerOK:false,evidenceOK:true}]),false);
  assert.equal(core.passed([{checkedAt:null,answerOK:true,evidenceOK:true}]),false);
});
