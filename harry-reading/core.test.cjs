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
  test(`${q.id}: suggested supporting excerpts refer to actual passage text`,()=>{
    const marks=q.evidence.flatMap(g=>exactMarks(a,g[0]));
    assert.ok(core.quoteMarks(a,marks).length);
  });
  if(q.evidence.length>1)test(`${q.id}: partial support can be highlighted without grading`,()=>{
    const marks=q.evidence.slice(0,-1).flatMap(g=>exactMarks(a,g[0]));
    const r=core.prepareRun(a,{answers:{}});r.drafts[q.id]={choice:q.answer,marks};
    assert.equal(core.recordCheck(a,q,r,'now').answerOK,true);
  });
}
test('any genuine highlight is accepted; fabricated and blank ranges are not',()=>{
  const a=articles[0],q=a.questions[0];
  for(const marks of [exactMarks(a,'Mice scamper over the porch.'),core.sentences(a).flat().map(s=>({sid:s.id,start:0,end:s.text.length})),exactMarks(a,'cat')]){
    const r=core.prepareRun(a,{answers:{}});r.drafts[q.id]={choice:q.answer,marks};
    const check=core.recordCheck(a,q,r,'now');assert.equal(check.answerOK,true);assert.equal(check.highlightAdded,true);assert.equal(core.resolved(r.answers[q.id]),true);
    for(const property of ['evidenceOK','focused','supported'])assert.equal(property in check,false);
  }
  for(const marks of [[{sid:'fake',start:0,end:10,quote:'Squirrels run down the driveway.'}],[{sid:'p0s0',start:5,end:6}]]){
    const r=core.prepareRun(a,{answers:{}});r.drafts[q.id]={choice:q.answer,marks};assert.equal(core.recordCheck(a,q,r,'now'),null);
  }
});
test('score preserves incorrect first answer after a successful retry',()=>{
  const a=articles[0],q=a.questions[0];
  const r={answers:{[q.id]:[{choice:0,checkedAt:'2026-10-22T10:00:00Z',answerOK:false,evidenceOK:true},{choice:2,checkedAt:'2026-10-22T10:01:00Z',answerOK:true,evidenceOK:true}]}};
  assert.deepEqual(core.scores(a,r),{mastered:1,firstAnswers:0,firstHighlights:0,total:2});
});
test('legacy evidence grades do not override answer correctness',()=>{
  assert.equal(core.passed([{checkedAt:'now',answerOK:true,evidenceOK:false}]),true);
  assert.equal(core.passed([{checkedAt:'now',answerOK:false,evidenceOK:true}]),false);
  assert.equal(core.passed([{checkedAt:null,answerOK:true,evidenceOK:true}]),false);
});
test('a check needs both an answer and evidence and does not consume incomplete tries',()=>{
  const a=articles[0],q=a.questions[0],r=core.prepareRun(a,{answers:{}});
  assert.equal(core.recordCheck(a,q,r,'first'),null);
  r.drafts[q.id].choice=q.answer;
  assert.equal(core.recordCheck(a,q,r,'first'),null);
  assert.deepEqual(r.answers,{});
  r.drafts[q.id].marks=exactMarks(a,'Squirrels run down the driveway.');
  assert.equal(core.recordCheck(a,q,r,'first').answerOK,true);
  assert.equal(core.resolved(r.answers[q.id]),true);
  assert.equal(core.recordCheck(a,q,r,'second'),null);
});
test('second check closes a missed question without claiming mastery and blocks a third check',()=>{
  const a=articles[0],q=a.questions[0],r=core.prepareRun(a,{answers:{}});
  r.drafts[q.id]={choice:0,marks:exactMarks(a,'Mice scamper over the porch.')};
  const first=core.recordCheck(a,q,r,'first');
  assert.equal(core.resolved(r.answers[q.id]),false);
  r.drafts[q.id].choice=1;r.drafts[q.id].marks=[];
  assert.equal(first.choice,0);assert.equal(first.marks.length,1);
  r.drafts[q.id].marks=exactMarks(a,'Moles dig in the yard.');
  core.recordCheck(a,q,r,'second');
  assert.equal(core.resolved(r.answers[q.id]),true);
  assert.equal(core.passed(r.answers[q.id]),false);
  assert.equal(core.finished(a,r),1);
  assert.equal(core.recordCheck(a,q,r,'third'),null);
  assert.equal(r.answers[q.id].length,2);
});
test('successful second check keeps first-choice scores and highlights unchanged',()=>{
  const a=articles[0],q=a.questions[0],r=core.prepareRun(a,{answers:{}});
  r.drafts[q.id]={choice:0,marks:exactMarks(a,'Mice scamper over the porch.')};
  core.recordCheck(a,q,r,'first');
  r.drafts[q.id]={choice:q.answer,marks:exactMarks(a,'Squirrels run down the driveway.')};
  core.recordCheck(a,q,r,'second');
  assert.deepEqual(core.scores(a,r),{mastered:1,firstAnswers:0,firstHighlights:1,total:2});
  assert.equal(r.answers[q.id][0].marks[0].quote,'Mice scamper over the porch.');
});
test('existing unchecked responses become editable drafts and checked history is preserved',()=>{
  const a=articles[0],q=a.questions[0],checked={choice:0,checkedAt:'old',answerOK:false,evidenceOK:false,marks:exactMarks(a,'Mice scamper over the porch.')};
  const r={answers:{[q.id]:[checked,{choice:2,checkedAt:null,marks:exactMarks(a,'Squirrels run down the driveway.')} ]}};
  core.prepareRun(a,r);
  assert.equal(r.answers[q.id].length,1);assert.equal(r.answers[q.id][0],checked);
  assert.equal(r.drafts[q.id].choice,2);assert.equal(r.drafts[q.id].marks[0].quote,'Squirrels run down the driveway.');
});
test('session completion counts two checked misses as finished while mastery remains separate',()=>{
  const a=articles[0],r=core.prepareRun(a,{answers:{}});
  for(const q of a.questions){r.drafts[q.id]={choice:(q.answer+1)%4,marks:exactMarks(a,'Carla is a cat.')};core.recordCheck(a,q,r,'first');core.recordCheck(a,q,r,'second');}
  assert.equal(core.finished(a,r),2);assert.equal(core.scores(a,r).mastered,0);assert.equal(r.completedAt,'second');
});

test('first-pass answered count includes single wrong checks, but not drafts or unchecked choices',()=>{
  const a=articles[0],r=core.prepareRun(a,{answers:{}});
  assert.equal(core.answered(a,r),0);
  for(const q of a.questions){r.drafts[q.id]={choice:(q.answer+1)%4,marks:exactMarks(a,'Carla is a cat.')};core.recordCheck(a,q,r,'first');}
  assert.equal(core.answered(a,r),a.questions.length);assert.equal(core.finished(a,r),0);assert.equal(core.scores(a,r).mastered,0);assert.ok(a.questions.every(q=>r.answers[q.id].length===1));
  delete r.answers[a.questions[0].id];assert.equal(core.answered(a,r),1);
  r.answers[a.questions[0].id]=[{choice:0,checkedAt:null}];assert.equal(core.answered(a,r),1);
  r.answers[a.questions[0].id]=[{choice:99,checkedAt:'first'}];assert.equal(core.answered(a,r),1);
});

test('finish time is the last original check, independent of scores and later retries',()=>{
  const a=articles[0],r={completedAt:'2026-11-02T20:00:00Z',answers:{
    'carla-4':[{choice:0,checkedAt:'2026-11-01T17:01:00Z',answerOK:false},{choice:2,checkedAt:'2026-11-02T20:00:00Z',answerOK:true}],
    'carla-5':[{choice:0,checkedAt:'2026-11-01T17:05:00Z',answerOK:false}]
  }};
  const before=JSON.stringify(r);
  assert.equal(core.answered(a,r),2);assert.equal(core.finished(a,r),1);
  assert.equal(core.finishedAt(a,r),'2026-11-01T17:05:00.000Z');
  assert.equal(JSON.stringify(r),before);
  r.answers['carla-5'].push({choice:1,checkedAt:'2026-11-03T20:00:00Z',answerOK:true});
  assert.equal(core.finishedAt(a,r),'2026-11-01T17:05:00.000Z');
});

test('finish time requires checked answers to every question and recoverable dates',()=>{
  const a=articles[0],r={completedAt:'2026-11-02T20:00:00Z',answers:{}};
  assert.equal(core.finishedAt(a,r),null);
  r.answers['carla-4']=[{choice:2,checkedAt:'2026-11-01T17:05:00Z'}];
  r.answers['carla-5']=[{choice:1,checkedAt:null}];assert.equal(core.finishedAt(a,r),null);
  r.answers['carla-5']=[{choice:99,checkedAt:'2026-11-01T17:10:00Z'}];assert.equal(core.finishedAt(a,r),null);
  r.answers['carla-5']=[{choice:1,checkedAt:'unknown'}];assert.equal(core.finishedAt(a,r),null);
  r.answers['carla-5']=[{choice:1,checkedAt:'2026-11-01T17:00:00Z'}];
  assert.equal(core.finishedAt(a,r),'2026-11-01T17:05:00.000Z');
});
