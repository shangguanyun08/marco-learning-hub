import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

const source = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const originalBank = JSON.parse(await readFile(new URL('./question-bank.json', import.meta.url), 'utf8'));
const plan = JSON.parse(await readFile(new URL('./session-plan.json', import.meta.url), 'utf8'));
const reviews = JSON.parse(await readFile(new URL('./review-bank.json', import.meta.url), 'utf8'));
const practiceBank = JSON.parse(await readFile(new URL('./review1-practice-bank.json', import.meta.url), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const fresh = () => ({ schemaVersion: 1, learner: 'Marco', sessions: [], attempts: [], updatedAt: null });

function completedOriginalDays() {
  const state = fresh();
  for (const day of originalBank.days.filter(day => [1, 2, 7, 8, 9].includes(day.day))) {
    const session = { id: `original-${day.day}`, day: day.day, runNumber: 1, startedAt: '2026-09-01T01:00:00Z', completedAt: '2026-09-01T02:00:00Z' };
    state.sessions.push(session);
    for (const question of day.questions) state.attempts.push({ id: randomUUID(), sessionId: session.id, day: day.day, questionId: question.id, questionPosition: question.position, attemptNumber: 1, selectedIndex: question.correctIndexes[0], correct: true, createdAt: session.completedAt });
  }
  return state;
}

async function boot(initial = completedOriginalDays(), remote = initial) {
  const storage = new Map([['marco-summer-isee-math-redo-v1:state', JSON.stringify(initial)]]);
  const app = { innerHTML: '', addEventListener() {} };
  const pushed = [];
  let options;
  const context = vm.createContext({
    document: { querySelector: () => app },
    crypto: { randomUUID },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    window: { MarcoOnlineSync: { create(value) { options = value; return { start() { if (remote) value.onRemote(clone(remote)); }, push(state) { pushed.push(clone(state)); } }; } } },
    fetch: async url => ({ ok: true, json: async () => clone(url.startsWith('question-bank') ? originalBank : url.startsWith('review-bank') ? reviews : url.startsWith('review1-practice-bank') ? practiceBank : plan) }),
  });
  const instrumented = source.replace('  Promise.all(', `  globalThis.redo = { metrics, savedAttempts, chooseDay, selectAnswer, answer, startAgain, summary, progressHtml, nextPracticeDay, masteryProgress, nextPracticeQuestion, nextMainQuestion, currentReviewQuestion, get state() { return state; }, get bank() { return bank; }, get selectedDay() { return selectedDay; } };\n  Promise.all(`);
  vm.runInContext(instrumented, context);
  await new Promise(resolve => setImmediate(resolve));
  assert.doesNotMatch(app.innerHTML, /could not be loaded/);
  return { api: context.redo, app, pushed, remote: next => options.onRemote(clone(next)), storage };
}

function finishPractice(api, question) {
  for (const practice of (question.practiceQuestions || []).slice(0,3)) {
    api.answer(practice.id, practice.correctIndexes[0]);
  }
}

test('134 unfinished questions form stable, disjoint sessions of 10 plus 4', async () => {
  const { api, app, pushed } = await boot();
  const groups = api.bank.days.filter(day => !day.original && !day.review);
  const completedIds = new Set(completedOriginalDays().attempts.map(attempt => attempt.questionId));
  const ids = groups.flatMap(day => day.questions.map(question => question.id));
  assert.equal(groups.length, 14);
  assert.deepEqual(clone(groups.map(day => day.questionCount)), [...Array(13).fill(10), 4]);
  assert.equal(ids.length, 134);
  assert.equal(new Set(ids).size, 134);
  assert.ok(ids.every(id => !completedIds.has(id)));
  assert.equal(new Set([...ids, ...completedIds]).size, 196);
  assert.equal(api.selectedDay, 29);
  assert.equal((app.innerHTML.match(/class="question-card" id=/g) || []).length, 1);
  assert.match(app.innerHTML, /0 of 16 mastered/);
  assert.match(app.innerHTML, /<strong>All sessions<\/strong>/);
  assert.match(app.innerHTML, /5 of 21 finished/);
  const rail = app.innerHTML.match(/<aside class="day-rail"[\s\S]*?<\/aside>/)[0];
  assert.equal((rail.match(/data-action="day"/g) || []).length, 21);
  assert.equal((app.innerHTML.match(/class="session-score">First try: 100\/100/g) || []).length, 5);
  assert.doesNotMatch(app.innerHTML, /completed-work/);
  assert.match(app.innerHTML, /<details class="session-picker">/);
  assert.doesNotMatch(app.innerHTML, /hero-strip|sessions finished|missed first try|missed second try/);
  assert.equal(pushed.length, 0, 'Rendering must not modify saved progress');
});

test('saved state and historical scores survive opening the reorganized page', async () => {
  const initial = completedOriginalDays();
  const { api } = await boot(initial);
  assert.deepEqual(clone(api.state), initial);
  for (const day of api.bank.days.filter(day => day.original)) {
    const metrics = api.metrics(day);
    assert.equal(metrics.firstTryScore, 100);
    assert.equal(metrics.finishedAt, '2026-09-01T02:00:00Z');
  }
  assert.match(api.progressHtml(api.summary()), /Completed session history/);
});

test('opening on a new device selects the next unfinished session after online sync', async () => {
  const initial = completedOriginalDays();
  const first = await boot(initial);
  const group = first.api.bank.days.find(day => day.day === 29);
  for (const question of group.questions) {
    first.api.answer(question.id, question.correctIndexes[0]);
    finishPractice(first.api, question);
  }
  const { api } = await boot(fresh(), clone(first.api.state));
  assert.equal(api.selectedDay, 30);
});

test('selection does not save; checking supports two tries, reload and out-of-order completion', async () => {
  const { api, pushed } = await boot();
  api.chooseDay(15);
  const day = api.bank.days.find(day => day.day === 15);
  const question = day.questions.at(-1);
  const wrong = question.options.findIndex((_, index) => !question.correctIndexes.includes(index));
  api.selectAnswer(question.id, wrong);
  assert.equal(pushed.length, 0);
  api.answer(question.id, wrong);
  assert.equal(api.metrics(day).completed, false);
  const reloaded = await boot(clone(api.state));
  reloaded.api.chooseDay(15);
  assert.equal(reloaded.api.savedAttempts(day, question.id).length, 1);
  reloaded.api.answer(question.id, wrong);
  assert.equal(reloaded.pushed.length, 0, 'Repeated wrong choice is ignored');
  reloaded.api.answer(question.id, question.correctIndexes[0]);
  assert.equal(reloaded.api.savedAttempts(day, question.id)[1].attemptNumber, 2);
  assert.equal(reloaded.api.metrics(day).completed, false, 'The last-position answer must not finish other questions');
  for (const q of day.questions.slice(0,-1).reverse()) reloaded.api.answer(q.id, q.correctIndexes[0]);
  assert.equal(reloaded.api.metrics(day).completed, true);
  assert.equal(reloaded.api.metrics(day).firstTryScore, 90);
  const finalState = clone(reloaded.api.state);
  reloaded.api.answer(question.id, question.correctIndexes[0]);
  assert.deepEqual(clone(reloaded.api.state), finalState, 'Completed answers cannot start a new run');
  assert.match(reloaded.app.innerHTML, /Continue to Review 1/);
  assert.match(reloaded.app.innerHTML, /6 of 21 finished/);
  assert.match(reloaded.app.innerHTML, /class="active done" data-action="day" data-day="15"/);
  assert.match(reloaded.app.innerHTML, /class="session-score">First try: 90\/100/);
  const rail = reloaded.app.innerHTML.match(/<aside class="day-rail"[\s\S]*?<\/aside>/)[0];
  assert.equal((rail.match(/data-action="day"/g) || []).length, 21);
});

test('legacy first tries carry into regrouped sessions once, without copying history', async () => {
  const initial = completedOriginalDays();
  const question = originalBank.days.find(day => day.day === 3).questions[0];
  const wrong = question.options.findIndex((_, index) => !question.correctIndexes.includes(index));
  initial.sessions.push({ id: 'in-progress-old-day', day: 3, runNumber: 1, completedAt: null });
  initial.attempts.push({ id: 'legacy-first-try', sessionId: 'in-progress-old-day', day: 3, questionId: question.id, questionPosition: 1, attemptNumber: 1, selectedIndex: wrong, correct: false, createdAt: '2026-09-02T01:00:00Z' });
  const { api } = await boot(initial);
  const day = api.bank.days.find(day => day.day === 15);
  api.chooseDay(15);
  assert.equal(api.savedAttempts(day, question.id).length, 1);
  api.answer(question.id, question.correctIndexes[0]);
  assert.equal(api.savedAttempts(day, question.id).length, 2);
  assert.equal(api.state.attempts.at(-1).attemptNumber, 2);
  assert.equal(api.state.attempts.filter(attempt => attempt.id === 'legacy-first-try').length, 1);
  assert.equal(api.summary().wrongChecks, 1);
  for (const q of day.questions.slice(1)) api.answer(q.id, q.correctIndexes[0]);
  assert.equal(api.metrics(day).firstTryScore, 90);
  const oldAttempts = clone(api.state.attempts);
  api.startAgain();
  assert.equal(api.metrics(day).resolved, 0, 'Repeating a new session must not inherit the old first try again');
  assert.deepEqual(clone(api.state.attempts), oldAttempts);
});

test('second wrong try resolves and preserves wrong-answer history', async () => {
  const { api } = await boot();
  api.chooseDay(15);
  const day = api.bank.days.find(day => day.day === 15);
  const question = day.questions[0];
  const wrong = question.options.map((_,index) => index).filter(index => !question.correctIndexes.includes(index));
  api.answer(question.id, wrong[0]);
  api.answer(question.id, wrong[1]);
  assert.equal(api.metrics(day).resolved, 1);
  assert.equal(api.summary().firstMisses, 1);
  assert.equal(api.summary().secondMisses, 1);
  const restored = await boot(clone(api.state));
  restored.api.chooseDay(15);
  assert.match(restored.app.innerHTML, /Correct answer:/);
  assert.match(restored.api.progressHtml(restored.api.summary()), /Day 3 · Q1/);
});

test('final session contains only 4 questions and completion handles no remaining work', async () => {
  const { api, app } = await boot();
  for (const day of api.bank.days.filter(day => !day.original)) {
    api.chooseDay(day.day);
    for (const question of day.questions) {
      api.answer(question.id, question.correctIndexes[0]);
      finishPractice(api, question);
    }
  }
  assert.equal(api.summary().resolvedQuestions, 228);
  assert.match(app.innerHTML, /All sessions are finished/);
  assert.match(app.innerHTML, /All 4 questions/);
  assert.doesNotMatch(app.innerHTML, /Continue to Session/);
});

test('regrouped membership is unchanged by new answers and original reruns keep their histories', async () => {
  const { api } = await boot();
  const membership = clone(api.bank.days.map(day => day.questions.map(q => q.id)));
  const original = api.bank.days.find(day => day.day === 1);
  const before = clone(api.state);
  api.chooseDay(1);
  api.startAgain();
  assert.equal(api.metrics(original).resolved, 0);
  assert.deepEqual(clone(api.state.attempts), before.attempts);
  assert.ok(api.state.sessions.find(session => session.id === 'original-1').completedAt);
  const reload = await boot(clone(api.state));
  assert.deepEqual(clone(reload.api.bank.days.map(day => day.questions.map(q => q.id))), membership);
});

test('both sixteen-question reviews each cover every miss and precede Session 1', async () => {
  const initial = completedOriginalDays();
  const { api, app, pushed } = await boot(initial);
  const reviewDays = api.bank.days.filter(day => day.review);
  assert.deepEqual(clone(reviewDays.map(day => [day.day, day.label, day.questionCount, day.targetScore])), [[29, 'Review 1', 16, 90], [30, 'Review 2', 16, 90]]);
  const sourceIds = [
    'd01-q05', 'd02-q04', 'd02-q08', 'd02-q13', 'd02-q17', 'd02-q18', 'd02-q19', 'd02-q21',
    'd07-q01', 'd07-q03', 'd07-q08', 'd08-q04', 'd09-q04', 'd09-q11', 'd09-q12', 'd09-q13',
  ];
  const questions = reviewDays.flatMap(day => day.questions);
  assert.deepEqual([...new Set(questions.map(q => q.sourceQuestionId))].sort(), sourceIds);
  for (const day of reviewDays) assert.deepEqual(clone(day.questions.map(q => q.sourceQuestionId).sort()), sourceIds);
  for (const id of sourceIds) {
    const pair = questions.filter(q => q.sourceQuestionId === id);
    assert.equal(pair.length, 2);
    assert.notEqual(pair[0].questionText, pair[1].questionText);
  }
  const originalIds = new Set(originalBank.days.flatMap(day => day.questions.map(q => q.id)));
  assert.equal(new Set(questions.map(q => q.id)).size, 32);
  assert.equal(api.bank.totalQuestions, 228);
  assert.ok(questions.every(q => !originalIds.has(q.id)));
  assert.deepEqual(clone(api.state), initial, 'Opening reviews must leave all completed work untouched');
  assert.equal(pushed.length, 0);
  assert.ok(app.innerHTML.indexOf('<b>Review 1</b>') < app.innerHTML.indexOf('<b>Review 2</b>'));
  assert.ok(app.innerHTML.indexOf('<b>Review 2</b>') < app.innerHTML.indexOf('<b>Session 1</b>'));
  assert.match(app.innerHTML, /Get at least 15 of 16 right on the first try/);
  assert.ok(reviewDays.every(day => api.metrics(day).resolved === 0), 'Reviews must not inherit original answers');
  for (const q of questions) {
    assert.equal(q.options.length, 4);
    assert.equal(q.correctIndexes.length, 1);
    assert.equal(q.correctAnswer, q.options[q.correctIndexes[0]].text);
    assert.equal(q.correctHtml, q.options[q.correctIndexes[0]].html);
    assert.ok(q.explanation.length > 50);
    const original = originalBank.days.flatMap(day => day.questions).find(item => item.id === q.sourceQuestionId);
    assert.equal(q.sourceDay, original.day);
    assert.equal(q.sourceNumber, original.sourceNumber);
    assert.notEqual(q.questionText, original.questionText);
  }
});

test('review answer keys agree with independently calculated results', () => {
  const answers = reviews.sessions.map(session => session.questions.map(q => q.correctAnswer));
  const mixedText = (value, denominator = 4) => `${Math.floor(value)} ${Math.round((value % 1) * denominator)}/${denominator}`;
  const first = [
    'hours', '2^6', String(0.84 / 0.06), mixedText(3/4 - 1/6 + 2/3), '24',
    `${180 - 112}°`, 'All four interior angles have equal measures.',
    String(24 / 3 * 2 / 4 * 3),
    `${(2 * 2 * 4 + 2 * 4 * 4) * 3 ** 2 / 6} square feet`, `${2 ** 3}:${3 ** 3}`,
    String(24.5 / (3 + 1/2)), String(360 / 6 * 5 / 5 * 4), '9/20',
    `b² − ${6 * 6 / 2}a²`, `${18 / Math.cbrt(27)} feet`, `${6 * 2 * 3 * 2} cm³`,
  ];
  const second = [
    '5^3', '7 1/2', String(240 * 3/4 * (1 - 1/6)), '2/5',
    `b² − ${4 * 4 / 2}a²`, `${12 / Math.cbrt(216)} cm`, `${5 * 3 * 2 * 1.5} cm³`,
    String(36 / 4 * 3 / 3 * 2),
    `${(2 * 2 * 3 + 2 * 5 * 3) * 3 ** 2 / 6} square feet`, `${3 ** 3}:${4 ** 3}`,
    'hours', String(0.96 / 0.08), mixedText(7/8 - 1/6 + 5/12, 8), '48', `${180 - 118}°`,
    Array(4).fill(`${360 / 4}°`).join(', '),
  ];
  assert.deepEqual(answers, [first, second]);
  assert.equal(2 ** 6, 64);
  assert.equal(5 ** 3, 125);
  assert.equal(18.75 / (2 + 1/2), 7 + 1/2);
  assert.ok(Math.abs((1 - 2/5) * (1 - 1/3) - 2/5) < 1e-10);
  const gcd = (a,b) => b ? gcd(b, a % b) : a;
  assert.deepEqual([15,16,24,35].filter(n => gcd(gcd(18,30),n) === 6), [24]);
  assert.deepEqual([18,30,48,50].filter(n => gcd(gcd(24,36),n) === 12), [48]);
  assert.ok(Math.abs((1 - 1/4) * (1 - 2/5) - 9/20) < 1e-10);
});

test('reviews use a 90-point target, preserve earlier rounds and appear in progress history', async () => {
  const initial = completedOriginalDays();
  const { api, app } = await boot(initial);
  const review = api.bank.days.find(day => day.day === 29);
  const finish = (day, misses) => {
    api.chooseDay(day.day);
    day.questions.forEach((q, index) => {
      if (index < misses) api.answer(q.id, q.options.findIndex((_, choice) => !q.correctIndexes.includes(choice)));
      api.answer(q.id, q.correctIndexes[0]);
      finishPractice(api, q);
    });
    if (day.mastery) api.nextMainQuestion();
  };
  const firstQuestion = review.questions[0];
  assert.doesNotMatch(app.innerHTML, /Quick explanation:/);
  api.answer(firstQuestion.id, 0);
  assert.match(app.innerHTML, /Extra practice · Question 1/);
  api.answer(firstQuestion.id, firstQuestion.correctIndexes[0]);
  assert.match(app.innerHTML, /Quick explanation:/);
  finish(review, 2);
  assert.equal(api.metrics(review).firstTryScore, 88);
  assert.match(app.innerHTML, /Try Review 1 again · aim for 90\/100/);
  assert.equal(api.nextPracticeDay().day, 29);
  const belowGoal = await boot(clone(api.state));
  assert.equal(belowGoal.api.selectedDay, 29);
  assert.match(belowGoal.app.innerHTML, /Target: 90\/100/);
  const firstRound = clone(api.state);
  api.startAgain();
  assert.equal(api.metrics(review).resolved, 0);
  assert.deepEqual(clone(api.state.attempts), firstRound.attempts);
  finish(review, 1);
  assert.equal(api.metrics(review).firstTryScore, 94);
  assert.match(app.innerHTML, /Goal met!/);
  assert.equal(api.nextPracticeDay().day, 30);
  const next = api.bank.days.find(day => day.day === 30);
  finish(next, 0);
  assert.equal(api.metrics(next).firstTryScore, 100);
  assert.equal(api.nextPracticeDay().day, 15);
  assert.deepEqual(clone(api.state.attempts.slice(0, initial.attempts.length)), initial.attempts);
  assert.deepEqual(clone(api.state.sessions.slice(0, initial.sessions.length)), initial.sessions);
  const progress = api.progressHtml(api.summary());
  assert.match(progress, /Review 1 · Q1/);
  assert.match(progress, /88\/100/);
  assert.match(progress, /94\/100/);
  assert.match(progress, /100\/100/);
  const reloaded = await boot(clone(api.state));
  assert.equal(reloaded.api.selectedDay, 15);
  reloaded.api.chooseDay(29);
  assert.match(reloaded.app.innerHTML, /Goal met!/);
  assert.match(reloaded.app.innerHTML, /16 of 16 mastered/);
});

test('expanding a finished ten-question review keeps its score and carries its answers into the added questions', async () => {
  const initial = completedOriginalDays();
  const oldRound = { id: 'completed-short-review', day: 29, runNumber: 1, startedAt: '2026-09-05T10:00:00Z', completedAt: '2026-09-05T10:30:00Z' };
  initial.sessions.push(oldRound);
  reviews.sessions[0].questions.slice(0, 10).forEach((q, index) => {
    const base = { sessionId: oldRound.id, day: 29, questionId: q.id, questionPosition: q.position, createdAt: oldRound.completedAt };
    if (index === 0) {
      initial.attempts.push({ ...base, id: 'old-review-miss', attemptNumber: 1, selectedIndex: 0, correct: false });
    }
    initial.attempts.push({ ...base, id: `old-review-right-${index}`, attemptNumber: index === 0 ? 2 : 1, selectedIndex: q.correctIndexes[0], correct: true });
  });
  const before = clone(initial);
  const { api } = await boot(initial);
  const review = api.bank.days.find(day => day.day === 29);
  assert.deepEqual(clone(api.state), before);
  assert.equal(api.metrics(review).resolved, 0, 'All earlier main answers now need a streak of three');
  assert.equal(api.metrics(review).completed, false);
  assert.match(api.progressHtml(api.summary()), /90\/100/);
  for (const q of review.questions.slice(10)) api.answer(q.id, q.correctIndexes[0]);
  for (const q of review.questions) finishPractice(api, q);
  assert.equal(api.metrics(review).firstTryScore, 94);
  assert.equal(api.metrics(review).session.questionIds.length, 16);
  assert.equal(api.metrics(review).session.inheritedAttemptIds.length, 11);
  assert.deepEqual(clone(api.state.sessions.slice(0, before.sessions.length)), before.sessions);
  assert.deepEqual(clone(api.state.attempts.slice(0, before.attempts.length)), before.attempts);
  const history = api.progressHtml(api.summary());
  assert.match(history, /90\/100/);
  assert.match(history, /94\/100/);
  const restored = await boot(clone(api.state));
  assert.equal(restored.api.metrics(review).firstTryScore, 94);
});

const wrongIndex = q => q.options.findIndex((_, i) => !q.correctIndexes.includes(i));
const check = (api, q, correct) => api.answer(q.id, correct ? q.correctIndexes[0] : wrongIndex(q));

test('Review 1 shows one active question and advances only after mastery or the practice limit', async () => {
  const { api, app } = await boot();
  const day = api.bank.days.find(d => d.day === 29), [first, second] = day.questions;
  assert.match(app.innerHTML, /Question 1 of 16/);
  assert.doesNotMatch(app.innerHTML, /id="question-review1-q02"|class="practice-item"/);
  api.nextMainQuestion();
  assert.equal(api.currentReviewQuestion(day).id, first.id);
  check(api, first, false);
  assert.match(app.innerHTML, /Practice question 1 of 10/);
  assert.equal((app.innerHTML.match(/class="practice-item"/g) || []).length, 1);
  assert.doesNotMatch(app.innerHTML, /Practice question 2 of 10/);
  api.nextMainQuestion();
  assert.equal(api.currentReviewQuestion(day).id, first.id);
  for (const q of first.practiceQuestions.slice(0,3)) {
    api.selectAnswer(q.id, q.correctIndexes[0]);
    check(api, q, true);
    if (q.practiceNumber < 3) {
      assert.match(app.innerHTML, /Next practice question/);
      assert.match(app.innerHTML, new RegExp(`Practice question ${q.practiceNumber} of 10`));
      api.nextPracticeQuestion(first.id);
      assert.match(app.innerHTML, new RegExp(`Practice question ${q.practiceNumber+1} of 10`));
    }
  }
  assert.match(app.innerHTML, /1 of 16 mastered/);
  assert.match(app.innerHTML, /Next main question/);
  assert.doesNotMatch(app.innerHTML, /Practice question 4 of 10/);
  api.nextMainQuestion();
  assert.equal(api.currentReviewQuestion(day).id, second.id);
  assert.doesNotMatch(app.innerHTML, /class="practice-item"/);
  check(api, second, true);
  assert.equal(api.masteryProgress(day, second).mastered, false);
  assert.equal(api.masteryProgress(day, second).streak, 1);
  assert.equal(api.masteryProgress(day, second).practice.length, 0);
  assert.match(app.innerHTML, /Practice question 1 of 10/);
  assert.match(app.innerHTML, /<b>1\/3<\/b> correct in a row/);
  assert.doesNotMatch(app.innerHTML, /data-action="next-main"/);
  api.nextMainQuestion();
  assert.equal(api.currentReviewQuestion(day).id, second.id);
  check(api, second.practiceQuestions[0], true);
  assert.equal(api.masteryProgress(day, second).streak, 2);
  assert.equal(api.masteryProgress(day, second).mastered, false);
  api.nextPracticeQuestion(second.id);
  check(api, second.practiceQuestions[1], true);
  assert.equal(api.masteryProgress(day, second).mastered, true);
  assert.equal(api.masteryProgress(day, second).practice.length, 2);
  assert.doesNotMatch(app.innerHTML, /Practice question 3 of 10/);
  assert.match(app.innerHTML, /2 of 16 mastered/);
});

test('practice counts distinct questions, resets the streak on a miss, and survives reload and remote sync', async () => {
  let session = await boot();
  let { api } = session;
  const day = api.bank.days.find(d => d.day === 29), parent = day.questions[0];
  const [p1,p2,p3,p4,p5,p6,p7] = parent.practiceQuestions;
  check(api,p1,true);
  assert.equal(api.state.attempts.length, completedOriginalDays().attempts.length, 'Practice is locked before the main answer');
  check(api,parent,false);
  const before = clone(api.state);
  check(api,parent,true);
  check(api,p2,true);
  assert.deepEqual(clone(api.state), before, 'Main answers are final and future practice cannot be skipped to');
  check(api,p1,true);
  check(api,p1,true);
  check(api,p1,false);
  assert.equal(api.masteryProgress(day,parent).streak,1);
  check(api,p2,true);
  check(api,p3,false);
  assert.equal(api.masteryProgress(day,parent).streak,0);
  assert.equal(api.masteryProgress(day,parent).practice.length,3);
  check(api,p4,true);
  const saved = JSON.parse(session.storage.get('marco-summer-isee-math-redo-v1:state'));
  session = await boot(saved);
  api = session.api;
  assert.equal(api.masteryProgress(day,parent).streak,1);
  assert.match(session.app.innerHTML,/Practice question 5 of 10/);
  check(api,p5,true);
  const remoteState = clone(api.state);
  const otherDevice = await boot(fresh());
  otherDevice.remote(remoteState);
  assert.equal(otherDevice.api.masteryProgress(day,parent).streak,2);
  check(otherDevice.api,p6,true);
  assert.equal(otherDevice.api.masteryProgress(day,parent).mastered,true);
  assert.equal(otherDevice.api.masteryProgress(day,parent).practice.length,6);
  const finished = clone(otherDevice.api.state);
  check(otherDevice.api,p7,true);
  assert.deepEqual(clone(otherDevice.api.state),finished);
  const summary = otherDevice.api.summary();
  assert.equal(summary.firstMisses,1, 'Extra practice misses must not lower the main score');
  assert.equal(summary.wrongChecks,2);
  assert.match(otherDevice.api.progressHtml(summary),/Extra practice misses: 1/);
});

test('a correct main answer contributes once across reloads, and a later miss resets the whole streak', async () => {
  const first = await boot();
  const day = first.api.bank.days.find(d => d.day === 29), parent = day.questions[0];
  check(first.api, parent, true);
  check(first.api, parent, true);
  assert.equal(first.api.masteryProgress(day,parent).streak,1);
  assert.equal(first.api.metrics(day).mastered,0);
  check(first.api,parent.practiceQuestions[0],true);
  const restored = await boot(clone(first.api.state));
  assert.equal(restored.api.masteryProgress(day,parent).streak,2);
  assert.match(restored.app.innerHTML,/Practice question 2 of 10/);
  check(restored.api,parent.practiceQuestions[1],false);
  assert.equal(restored.api.masteryProgress(day,parent).streak,0);
  check(restored.api,parent.practiceQuestions[2],true);
  check(restored.api,parent.practiceQuestions[3],true);
  assert.equal(restored.api.masteryProgress(day,parent).mastered,false);
  const otherDevice = await boot(fresh(),clone(restored.api.state));
  assert.equal(otherDevice.api.masteryProgress(day,parent).streak,2);
  check(otherDevice.api,parent.practiceQuestions[4],true);
  assert.equal(otherDevice.api.masteryProgress(day,parent).mastered,true);
  assert.equal(otherDevice.api.masteryProgress(day,parent).practice.length,5);
  assert.equal(otherDevice.api.metrics(day).firstWrong,0);
  assert.match(otherDevice.api.progressHtml(otherDevice.api.summary()),/5\/10 extra questions · 3\/3 correct in a row/);
  assert.doesNotMatch(otherDevice.app.innerHTML,/No extra practice needed|extra practice if missed/);
});

test('ten-question limit ends as unmastered, while a third consecutive correct on question ten wins', async () => {
  for (const win of [false,true]) {
    const {api,app} = await boot();
    const day = api.bank.days.find(d => d.day === 29), parent = day.questions[0];
    check(api,parent,false);
    parent.practiceQuestions.forEach((q,i) => check(api,q,win ? i >= 7 : i % 3 !== 0));
    const progress = api.masteryProgress(day,parent);
    assert.equal(progress.practice.length,10);
    assert.equal(progress.mastered,win);
    assert.equal(progress.unmastered,!win);
    assert.equal(progress.done,true);
    assert.match(app.innerHTML,win ? /Mastered!/ : /Unmastered\./);
    assert.doesNotMatch(app.innerHTML,/Next practice question|Practice question 11/);
    api.nextMainQuestion();
    assert.equal(api.currentReviewQuestion(day).id,day.questions[1].id);
    const restored = await boot(clone(api.state));
    assert.equal(restored.api.masteryProgress(day,parent).unmastered,!win);
  }
});

test('every possible sequence including the main answer has the expected stop, streak and mastery result', async () => {
  const {api} = await boot();
  const day = api.bank.days.find(d => d.day === 29), parent = day.questions[0];
  for (let mask=0; mask < 2048; mask++) {
    const mainCorrect=Boolean(mask & (1<<10));
    const attempts=[{questionId:parent.id,attemptNumber:1,correct:mainCorrect}];
    let expectedStreak=mainCorrect ? 1 : 0, used=0, mastered=false;
    for (let i=0; i<10; i++) {
      const correct=Boolean(mask & (1<<i));
      attempts.push({questionId:parent.practiceQuestions[i].id,correct});
      if (!mastered) {
        used++;
        expectedStreak=correct ? expectedStreak+1 : 0;
        mastered=expectedStreak===3;
      }
    }
    const actual=api.masteryProgress(day,parent,attempts);
    assert.equal(actual.mastered,mastered,`sequence ${mask}`);
    assert.equal(actual.unmastered,!mastered,`sequence ${mask}`);
    assert.equal(actual.practice.length,used,`sequence ${mask}`);
    assert.equal(actual.streak,expectedStreak,`sequence ${mask}`);
  }
});

test('all sixteen mastery outcomes finish a round, preserve the 16-question score and reset on a new round', async () => {
  const {api,app} = await boot();
  const day=api.bank.days.find(d=>d.day===29);
  for (const [i,q] of day.questions.entries()) {
    check(api,q,i>0);
    if (i>0) finishPractice(api,q);
    api.nextMainQuestion();
  }
  assert.equal(api.metrics(day).completed,false);
  assert.equal(api.metrics(day).firstTryScore,94);
  assert.equal(api.metrics(day).mastered,15);
  for (const q of day.questions[0].practiceQuestions) check(api,q,false);
  api.nextMainQuestion();
  assert.equal(api.metrics(day).completed,true);
  assert.equal(api.metrics(day).firstTryScore,94);
  assert.equal(api.metrics(day).unmastered,1);
  assert.ok(api.metrics(day).session.completedAt);
  assert.match(app.innerHTML,/15 mastered · 1 unmastered/);
  assert.match(api.progressHtml(api.summary()),/94\/100/);
  const attempts=clone(api.state.attempts);
  api.startAgain();
  assert.equal(api.metrics(day).mastered,0);
  assert.equal(api.metrics(day).unmastered,0);
  assert.deepEqual(clone(api.state.attempts),attempts);
  assert.equal(api.currentReviewQuestion(day).position,1);
  check(api,day.questions[0],false);
  assert.equal(api.masteryProgress(day,day.questions[0]).practice.length,0);
});

test('Review 2 retains all sixteen cards and its original two-try behavior', async () => {
  const {api,app}=await boot();
  api.chooseDay(30);
  const day=api.bank.days.find(d=>d.day===30),q=day.questions[0];
  assert.equal((app.innerHTML.match(/class="question-card" id=/g)||[]).length,16);
  check(api,q,false);
  assert.match(app.innerHTML,/Not quite. Try once more./);
  check(api,q,true);
  assert.equal(api.metrics(day).resolved,1);
  assert.doesNotMatch(app.innerHTML,/class="extra-practice"/);
});

test('exactly 160 unique practice questions have independently verified answers and distinct choices', () => {
  const all=Object.values(practiceBank.groups).flat();
  assert.equal(all.length,160);
  assert.equal(new Set(all.map(q=>q.id)).size,160);
  const rational = text => { const [a,b]=text.split('/').map(Number); return b ? a/b : a; };
  const close=(a,b)=>Math.abs(a-b)<1e-8;
  for (const parent of reviews.sessions[0].questions) {
    const group=practiceBank.groups[parent.id];
    assert.equal(group.length,10);
    assert.equal(new Set(group.map(q=>q.questionText)).size,10);
    for (const [index,q] of group.entries()) {
      assert.equal(q.parentQuestionId,parent.id);
      assert.equal(q.skill,parent.skill);
      assert.equal(q.practiceNumber,index+1);
      assert.equal(q.correctIndexes.length,1);
      assert.equal(q.correctAnswer,q.options[q.correctIndexes[0]].text);
      assert.equal(q.correctHtml,q.options[q.correctIndexes[0]].html);
      assert.ok(q.explanation.length>45);
      assert.equal(new Set(q.options.map(o=>o.text)).size,4);
      assert.notEqual(q.questionText,parent.questionText);
      const n=(q.questionText.match(/\d+(?:\.\d+)?/g)||[]).map(Number);
      let expected, value=o=>parseFloat(o.text), matches;
      switch(parent.position) {
        case 1: expected=['minutes','milliseconds','hours','years','seconds','days','minutes','hours','years','seconds'][index]; value=o=>o.text; break;
        case 2: {
          const prime=x=>x>1 && !Array.from({length:Math.max(0,Math.floor(Math.sqrt(x))-1)},(_,i)=>i+2).some(d=>x%d===0);
          matches=q.options.map((o,i)=>{
            const factors=o.text.split(' × ').map(piece=>piece.split('^').map(Number));
            return factors.every(([base])=>prime(base)) && factors.reduce((v,[base,power=1])=>v*base**power,1)===n[0] ? i : -1;
          }).filter(i=>i>=0);
          break;
        }
        case 3: expected=n[0]/n[1]; break;
        case 4: expected=n[0]/n[1]-n[2]/n[3]+n[4]/n[5]; value=o=>rational(o.text); break;
        case 5: { const gcd=(a,b)=>b?gcd(b,a%b):a; matches=q.options.map((o,i)=>gcd(gcd(n[0],n[1]),Number(o.text))===n[2]?i:-1).filter(i=>i>=0); break; }
        case 6: expected=180-n[0]; break;
        case 7: expected=['90°, 90°, 90°, 90°','90°, 90°, 90°, 90°','90°, 90°, 90°, 90°','90°, 90°, 90°, 90°','90°, 90°, 90°, 90°','One interior angle is 90°.','It is a rectangle.','All four interior angles are right angles.','A rectangle.','Both pairs of opposite sides are parallel.'][index]; value=o=>o.text; break;
        case 8: expected=n[0]*(1-n[1]/n[2])*(1-n[3]/n[4]); break;
        case 9: expected=(2*n[0]*n[1]+2*n[2]*n[3])*9/n[4]; break;
        case 10: expected=(n[0]/n[1])**3; value=o=>{const [a,b]=o.text.split(':').map(Number);return a/b;};break;
        case 11: expected=n[0]/(n[1]+n[2]/n[3]); break;
        case 12: expected=n[0]*n[1]/n[2]*(1-n[3]/n[4]); break;
        case 13: expected=(1-n[0]/n[1])*(1-n[2]/n[3]); value=o=>rational(o.text);break;
        case 14: expected=`b² − ${n[0]**2/2}a²`; value=o=>o.text;break;
        case 15: expected=n[0]/Math.cbrt(n[1]);break;
        case 16: expected=n[0]*n[1]*n[2]*n[3];break;
      }
      matches ||= q.options.map((o,i)=>(typeof expected==='number'?close(value(o),expected):value(o)===expected)?i:-1).filter(i=>i>=0);
      assert.deepEqual(matches,q.correctIndexes,q.id);
    }
  }
});
