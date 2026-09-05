import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

const source = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const originalBank = JSON.parse(await readFile(new URL('./question-bank.json', import.meta.url), 'utf8'));
const plan = JSON.parse(await readFile(new URL('./session-plan.json', import.meta.url), 'utf8'));
const reviews = JSON.parse(await readFile(new URL('./review-bank.json', import.meta.url), 'utf8'));
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
    fetch: async url => ({ ok: true, json: async () => clone(url.startsWith('question-bank') ? originalBank : url.startsWith('review-bank') ? reviews : plan) }),
  });
  const instrumented = source.replace('  Promise.all(', `  globalThis.redo = { metrics, savedAttempts, chooseDay, selectAnswer, answer, startAgain, summary, progressHtml, nextPracticeDay, get state() { return state; }, get bank() { return bank; }, get selectedDay() { return selectedDay; } };\n  Promise.all(`);
  vm.runInContext(instrumented, context);
  await new Promise(resolve => setImmediate(resolve));
  assert.doesNotMatch(app.innerHTML, /could not be loaded/);
  return { api: context.redo, app, pushed, remote: next => options.onRemote(clone(next)), storage };
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
  assert.equal((app.innerHTML.match(/class="question-card" id=/g) || []).length, 10);
  assert.match(app.innerHTML, /<strong>All sessions<\/strong>/);
  assert.match(app.innerHTML, /5 of 21 finished/);
  const rail = app.innerHTML.match(/<aside class="day-rail"[\s\S]*?<\/aside>/)[0];
  assert.equal((rail.match(/data-action="day"/g) || []).length, 21);
  assert.equal((app.innerHTML.match(/class="session-score">First try: 100\/100/g) || []).length, 5);
  assert.doesNotMatch(app.innerHTML, /<details|completed-work/);
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
  for (const question of group.questions) first.api.answer(question.id, question.correctIndexes[0]);
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
    for (const question of day.questions) api.answer(question.id, question.correctIndexes[0]);
  }
  assert.equal(api.summary().resolvedQuestions, 216);
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

test('two ten-question reviews cover every selected first miss and precede Session 1', async () => {
  const initial = completedOriginalDays();
  const { api, app, pushed } = await boot(initial);
  const reviewDays = api.bank.days.filter(day => day.review);
  assert.deepEqual(clone(reviewDays.map(day => [day.day, day.label, day.questionCount, day.targetScore])), [[29, 'Review 1', 10, 90], [30, 'Review 2', 10, 90]]);
  const sourceIds = [
    'd01-q05', 'd02-q04', 'd02-q08', 'd02-q13', 'd02-q17', 'd02-q18', 'd02-q19', 'd02-q21',
    'd07-q01', 'd07-q03', 'd07-q08', 'd08-q04', 'd09-q04', 'd09-q11', 'd09-q12', 'd09-q13',
  ];
  const questions = reviewDays.flatMap(day => day.questions);
  assert.deepEqual([...new Set(questions.map(q => q.sourceQuestionId))].sort(), sourceIds);
  const originalIds = new Set(originalBank.days.flatMap(day => day.questions.map(q => q.id)));
  assert.equal(new Set(questions.map(q => q.id)).size, 20);
  assert.equal(api.bank.totalQuestions, 216);
  assert.ok(questions.every(q => !originalIds.has(q.id)));
  assert.deepEqual(clone(api.state), initial, 'Opening reviews must leave all completed work untouched');
  assert.equal(pushed.length, 0);
  assert.ok(app.innerHTML.indexOf('<b>Review 1</b>') < app.innerHTML.indexOf('<b>Review 2</b>'));
  assert.ok(app.innerHTML.indexOf('<b>Review 2</b>') < app.innerHTML.indexOf('<b>Session 1</b>'));
  assert.match(app.innerHTML, /Get at least 9 of 10 right on the first try/);
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
  const mixedText = value => `${Math.floor(value)} ${Math.round((value % 1) * 4)}/4`;
  const first = [
    'hours', '2^6', String(0.84 / 0.06), mixedText(3/4 - 1/6 + 2/3), '24',
    `${180 - 112}°`, 'All four interior angles have equal measures.',
    String(24 / 3 * 2 / 4 * 3),
    `${(2 * 2 * 4 + 2 * 4 * 4) * 3 ** 2 / 6} square feet`, `${2 ** 3}:${3 ** 3}`,
  ];
  const second = [
    '5^3', '7 1/2', String(240 * 3/4 * (1 - 1/6)), '2/5',
    `b² − ${4 * 4 / 2}a²`, `${12 / Math.cbrt(216)} cm`, `${5 * 3 * 2 * 1.5} cm³`,
    String(36 / 4 * 3 / 3 * 2),
    `${(2 * 2 * 3 + 2 * 5 * 3) * 3 ** 2 / 6} square feet`, `${3 ** 3}:${4 ** 3}`,
  ];
  assert.deepEqual(answers, [first, second]);
  assert.equal(2 ** 6, 64);
  assert.equal(5 ** 3, 125);
  assert.equal(18.75 / (2 + 1/2), 7 + 1/2);
  assert.ok(Math.abs((1 - 2/5) * (1 - 1/3) - 2/5) < 1e-10);
  const gcd = (a,b) => b ? gcd(b, a % b) : a;
  assert.deepEqual([15,16,24,35].filter(n => gcd(gcd(18,30),n) === 6), [24]);
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
    });
  };
  const firstQuestion = review.questions[0];
  assert.doesNotMatch(app.innerHTML, /Quick explanation:/);
  api.answer(firstQuestion.id, 0);
  assert.doesNotMatch(app.innerHTML, /Quick explanation:/);
  api.answer(firstQuestion.id, firstQuestion.correctIndexes[0]);
  assert.match(app.innerHTML, /Quick explanation:/);
  finish(review, 2);
  assert.equal(api.metrics(review).firstTryScore, 80);
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
  assert.equal(api.metrics(review).firstTryScore, 90);
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
  assert.match(progress, /80\/100/);
  assert.match(progress, /90\/100/);
  assert.match(progress, /100\/100/);
  const reloaded = await boot(clone(api.state));
  assert.equal(reloaded.api.selectedDay, 15);
  reloaded.api.chooseDay(29);
  assert.match(reloaded.app.innerHTML, /Goal met!/);
  assert.match(reloaded.app.innerHTML, /Quick explanation:/);
});
