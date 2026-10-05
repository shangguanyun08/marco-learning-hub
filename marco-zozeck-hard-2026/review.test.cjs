const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Core = require('./quiz-core.js');
const ctx = {window:{}};
for (const file of ['zozeck-hard-data.js','redo-data.js','extension-data.js','review-data.js']) vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),'utf8'),ctx);
const base = JSON.parse(JSON.stringify([...ctx.window.MARCO_ZOZECK_REDO_WORDS,...ctx.window.MARCO_ZOZECK_HARD_WORDS.map(w=>({...w,session:w.session-6})),...ctx.window.MARCO_ZOZECK_EXTENSION_WORDS]));
const review = JSON.parse(JSON.stringify(ctx.window.MARCO_ZOZECK_REVIEW));
const words = review.sessions.flatMap(s=>review.parts[s.part].map(id=>({...base.find(w=>w.id===id),id:`review-${s.number}-${id}`,session:s.number,originalQuestionId:id})));
const all = [...base,...words];
Core.configureLayout(all);
const at = '2026-10-04T16:00:00.000Z';
const later = seconds => new Date(Date.parse(at)+seconds*1000).toISOString();

test('parent completion survives stale-device merges without manufacturing correct answers',()=>{
  const p = Core.blank();
  Core.start(p,14,['one','two'],at);
  p.sessions[14].rounds[0].answers.one = {choice:'wrong',correct:false,at};
  const closed = JSON.parse(JSON.stringify(p));
  Object.assign(closed.sessions[14],{manualCompletedAt:later(1),manualCompletionReason:'Parent requested completion',completedAt:later(1)});
  for (const merged of [Core.merge(p,closed),Core.merge(closed,p),Core.merge(closed,closed)]) {
    assert.equal(merged.sessions[14].completedAt,later(1));
    assert.equal(merged.sessions[14].manualCompletedAt,later(1));
    assert.deepEqual(merged.sessions[14].rounds,p.sessions[14].rounds);
    assert.equal(merged.sessions[14].rounds[0].answers.one.correct,false);
    assert.equal(merged.sessions[14].rounds[0].answers.two,undefined);
    assert.equal(merged.sessions[13],undefined);
  }
});
test('six independent reviews repeat the fixed 124 original questions as two balanced halves',()=>{
  assert.equal(base.length,331);
  assert.deepEqual(review.sessions.map(s=>s.label),['Review 1A','Review 2A','Review 3A','Review 1B','Review 2B','Review 3B']);
  assert.equal(new Set([...review.parts.A,...review.parts.B]).size,124);
  assert.deepEqual(review.sourceSessions.map(s=>s.missed),[12,16,11,3,11,9,6,9,6,4,4,3,13,17]);
  assert.equal(new Set(all.map(w=>w.id)).size,703);
  for (const s of review.sessions) {
    const group = words.filter(w=>w.session===s.number);
    assert.equal(group.length,62); assert.equal(s.timeLimitSeconds,1860);
    assert.deepEqual(group.map(w=>w.originalQuestionId),review.parts[s.part]);
    assert.deepEqual(['synonym','definition','completion'].map(type=>group.filter(w=>w.quizType===type).length),[45,1,16]);
    for (const w of group) {
      const source = base.find(b=>b.id===w.originalQuestionId);
      assert.equal(w.word,source.word); assert.equal(w.answer,source.answer); assert.deepEqual(w.choices,source.choices);
      for (let r=1;r<=3;r++) assert.ok(Core.options(w,r,all,s.number).includes(w.answer));
    }
  }
});
test('31-minute deadline survives reloads, later device starts, and submitted/draft merges',()=>{
  const ids = words.filter(w=>w.session===15).map(w=>w.id);
  const p = Core.blank(); Core.startTimed(p,15,ids,at,1860);
  const r = Core.current(p.sessions[15]);
  assert.equal(r.deadlineAt,later(1860)); assert.equal(Core.startTimed(p,15,ids,later(60),1860),false);
  const other = Core.blank(); Core.startTimed(other,15,ids,later(60),1860);
  for (const merged of [Core.merge(p,other),Core.merge(other,p),Core.merge(p,JSON.parse(JSON.stringify(p)))]) {
    assert.equal(merged.sessions[15].rounds[0].deadlineAt,later(1860));
    assert.equal(merged.sessions[15].rounds[0].timeLimitSeconds,1860);
  }
  const first = all.find(w=>w.id===ids[0]);
  assert.ok(Core.answer(p,15,first.answer,all,later(1),first.id));
  const draft = JSON.parse(JSON.stringify(p));
  assert.equal(Core.answer(p,15,first.answer,all,later(1860),first.id),false);
  assert.equal(Core.finishTimed(p,15,later(1900)),'round');
  for (const merged of [Core.merge(p,draft),Core.merge(draft,p)]) {
    const done = merged.sessions[15].rounds[0];
    assert.equal(done.finishedAt,later(1860)); assert.equal(done.timeLimitSeconds,1860);
    assert.equal(Object.values(done.answers).filter(a=>a.unanswered).length,61);
    assert.equal(merged.sessions[15].rounds[1].ids.length,61);
    assert.equal(merged.sessions[15].rounds[1].timeLimitSeconds,undefined);
  }
});
test('timed choices can change; correction rounds lock answers and repeat only misses until mastered',()=>{
  const group = words.filter(w=>w.session===16), ids=group.map(w=>w.id), p=Core.blank();
  Core.startTimed(p,16,ids,at,1860);
  const first=group[0], wrong=first.choices.find(c=>c!==first.answer);
  assert.ok(Core.answer(p,16,wrong,all,later(1),first.id));
  assert.ok(Core.answer(p,16,first.answer,all,later(2),first.id));
  for (const w of group.slice(1)) Core.answer(p,16,w.choices.find(c=>c!==w.answer),all,later(3),w.id);
  Core.finishTimed(p,16,later(4));
  assert.deepEqual(Core.current(p.sessions[16]).ids,ids.slice(1));
  for (const w of group.slice(1)) Core.answer(p,16,w.id===group[1].id?w.choices.find(c=>c!==w.answer):w.answer,all,later(5),w.id);
  assert.equal(Core.answer(p,16,group[1].answer,all,later(6),group[1].id),false);
  assert.equal(Core.finishRound(p,16,later(7)),'round');
  assert.deepEqual(Core.current(p.sessions[16]).ids,[group[1].id]);
  Core.answer(p,16,group[1].answer,all,later(8),group[1].id);
  assert.equal(Core.finishRound(p,16,later(9)),'complete');
  assert.equal(p.sessions[16].rounds.length,3);
  assert.equal(p.sessions[16].rounds[0].answers[first.id].correct,true);
  assert.equal(p.sessions[15],undefined);
});
test('original VR tests retain 20-minute deadlines, original order and saved session identity',()=>{
  for (const session of [13,14]) {
    const ids=base.filter(w=>w.session===session).map(w=>w.id), p=Core.blank();
    Core.startTimed(p,session,ids,at);
    assert.deepEqual(Core.questionOrder(ids,session,1),ids);
    const merged=Core.merge(p,p);
    assert.equal(merged.sessions[session].rounds[0].deadlineAt,later(1200));
    assert.equal(merged.sessions[session].rounds[0].timeLimitSeconds,1200);
  }
  const ids=words.filter(w=>w.session===15).map(w=>w.id);
  assert.notDeepEqual(Core.questionOrder(ids,15,1),ids);
  assert.deepEqual(Core.questionOrder(ids,15,1),Core.questionOrder([...ids].reverse(),15,1));
});
