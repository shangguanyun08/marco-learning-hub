import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

const source = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const originalBank = JSON.parse(await readFile(new URL('./question-bank.json', import.meta.url), 'utf8'));
const plan = JSON.parse(await readFile(new URL('./session-plan.json', import.meta.url), 'utf8'));
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
    fetch: async url => ({ ok: true, json: async () => clone(url.startsWith('question-bank') ? originalBank : plan) }),
  });
  const instrumented = source.replace('  Promise.all(', `  globalThis.redo = { metrics, savedAttempts, chooseDay, selectAnswer, answer, startAgain, summary, progressHtml, nextPracticeDay, get state() { return state; }, get bank() { return bank; }, get selectedDay() { return selectedDay; } };\n  Promise.all(`);
  vm.runInContext(instrumented, context);
  await new Promise(resolve => setImmediate(resolve));
  assert.doesNotMatch(app.innerHTML, /could not be loaded/);
  return { api: context.redo, app, pushed, remote: next => options.onRemote(clone(next)), storage };
}

test('134 unfinished questions form stable, disjoint sessions of 10 plus 4', async () => {
  const { api, app, pushed } = await boot();
  const groups = api.bank.days.filter(day => !day.original);
  const completedIds = new Set(completedOriginalDays().attempts.map(attempt => attempt.questionId));
  const ids = groups.flatMap(day => day.questions.map(question => question.id));
  assert.equal(groups.length, 14);
  assert.deepEqual(clone(groups.map(day => day.questionCount)), [...Array(13).fill(10), 4]);
  assert.equal(ids.length, 134);
  assert.equal(new Set(ids).size, 134);
  assert.ok(ids.every(id => !completedIds.has(id)));
  assert.equal(new Set([...ids, ...completedIds]).size, 196);
  assert.equal(api.selectedDay, 15);
  assert.equal((app.innerHTML.match(/class="question-card" id=/g) || []).length, 10);
  assert.match(app.innerHTML, /<strong>To do<\/strong>/);
  assert.match(app.innerHTML, /Completed work <span>5 sessions/);
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
  const group = first.api.bank.days.find(day => day.day === 15);
  for (const question of group.questions) first.api.answer(question.id, question.correctIndexes[0]);
  const { api } = await boot(fresh(), clone(first.api.state));
  assert.equal(api.selectedDay, 16);
});

test('selection does not save; checking supports two tries, reload and out-of-order completion', async () => {
  const { api, pushed } = await boot();
  const day = api.bank.days.find(day => day.day === 15);
  const question = day.questions.at(-1);
  const wrong = question.options.findIndex((_, index) => !question.correctIndexes.includes(index));
  api.selectAnswer(question.id, wrong);
  assert.equal(pushed.length, 0);
  api.answer(question.id, wrong);
  assert.equal(api.metrics(day).completed, false);
  const reloaded = await boot(clone(api.state));
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
  assert.match(reloaded.app.innerHTML, /Continue to Session 2/);
  assert.match(reloaded.app.innerHTML, /Completed work <span>6 sessions/);
});

test('legacy first tries carry into regrouped sessions once, without copying history', async () => {
  const initial = completedOriginalDays();
  const question = originalBank.days.find(day => day.day === 3).questions[0];
  const wrong = question.options.findIndex((_, index) => !question.correctIndexes.includes(index));
  initial.sessions.push({ id: 'in-progress-old-day', day: 3, runNumber: 1, completedAt: null });
  initial.attempts.push({ id: 'legacy-first-try', sessionId: 'in-progress-old-day', day: 3, questionId: question.id, questionPosition: 1, attemptNumber: 1, selectedIndex: wrong, correct: false, createdAt: '2026-09-02T01:00:00Z' });
  const { api } = await boot(initial);
  const day = api.bank.days.find(day => day.day === 15);
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
  const day = api.bank.days.find(day => day.day === 15);
  const question = day.questions[0];
  const wrong = question.options.map((_,index) => index).filter(index => !question.correctIndexes.includes(index));
  api.answer(question.id, wrong[0]);
  api.answer(question.id, wrong[1]);
  assert.equal(api.metrics(day).resolved, 1);
  assert.equal(api.summary().firstMisses, 1);
  assert.equal(api.summary().secondMisses, 1);
  const restored = await boot(clone(api.state));
  assert.match(restored.app.innerHTML, /Correct answer:/);
  assert.match(restored.api.progressHtml(restored.api.summary()), /Day 3 · Q1/);
});

test('final session contains only 4 questions and completion handles no remaining work', async () => {
  const { api, app } = await boot();
  for (const day of api.bank.days.filter(day => !day.original)) {
    api.chooseDay(day.day);
    for (const question of day.questions) api.answer(question.id, question.correctIndexes[0]);
  }
  assert.equal(api.summary().resolvedQuestions, 196);
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
