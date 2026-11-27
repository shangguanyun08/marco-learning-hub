const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { JSDOM } = require('jsdom');

const read = name => readFileSync(join(__dirname, name), 'utf8');
const originalReviewKey = 'harry-nnat-zozeck-review-2026-11-25';
const originalBucket = 'zozeck-mock-2026-11-25';
const reviewKey = `${originalReviewKey}:round-2`;
const bucket = `${originalBucket}-round-2`;
const answerKey = id => `${reviewKey}:question:${id}`;

function open(t, saved = [], selectedTest = 1, fetcher) {
  const dom = new JSDOM(read('index.html'), {
    url: `https://${fetcher ? 'shangguanyun08.github.io' : 'learning.test'}/harry-nnat/2026-11-25/?test=${selectedTest}`,
    runScripts: 'outside-only',
  });
  t.after(() => dom.window.close());
  const { document, localStorage } = dom.window;
  for (const [key, value] of saved) localStorage.setItem(key, value);
  if (fetcher) {
    dom.window.fetch = fetcher;
    dom.window.AbortSignal = AbortSignal;
  }
  for (const script of ['questions.js', '../sync.js', 'online.js', 'review.js']) dom.window.eval(read(script));
  return {
    window: dom.window,
    saved: () => Object.entries(localStorage),
    text: id => document.getElementById(id).textContent,
    card: id => document.getElementById(id),
    click: selector => document.querySelector(selector).click(),
  };
}

function sharedProgress(articles = {}) {
  let record = { version: 1, state: { version: 1, articles } };
  let available = true;
  return {
    state: () => record.state,
    available: value => { available = value; },
    fetch: async (_url, options) => {
      if (!available) throw new Error('Offline');
      let accepted = false;
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        assert.equal(body.appId, 'harry-nnat-2026-11-07-v1');
        if (body.baseVersion === record.version) {
          record = { version: record.version + 1, state: body.state };
          accepted = true;
        }
      }
      return { ok: true, json: async () => structuredClone({ accepted, progress: record }) };
    },
  };
}

async function until(assertion) {
  for (let index = 0; index < 15; index++) {
    if (assertion()) return;
    await delay(40);
  }
  assert.ok(assertion());
}

test('draft, first miss and correct retry all return after reopening', t => {
  const first = open(t);
  const id = 'test-01-q3';
  first.click(`#${id} input[value="A"]`);
  let reopened = open(t, first.saved());
  assert.equal(reopened.card(id).querySelector('input:checked').value, 'A');
  assert.equal(reopened.text('mock-save-status'), 'Progress saved in this browser');

  reopened.click(`#${id} .mock-check`);
  reopened = open(t, reopened.saved());
  assert.equal(reopened.card(id).querySelector('.mock-feedback').textContent, 'Try once more.');
  assert.equal(reopened.card(id).querySelector('input[value="A"]').disabled, true);
  reopened.click(`#${id} input[value="C"]`);
  reopened.click(`#${id} .mock-check`);
  reopened = open(t, reopened.saved());
  assert.equal(reopened.card(id).querySelector('.mock-feedback').textContent, 'Correct!');
  assert.equal(reopened.card(id).querySelector('input[type="checkbox"]').checked, true);
  assert.equal(reopened.text('mock-progress'), '1 of 12 checked · 1 reviewed');
  assert.deepEqual(JSON.parse(reopened.window.localStorage.getItem(answerKey(id))).attempts, ['A', 'C']);
});

test('both missed tries are saved independently of review flags and other tests', t => {
  const original = open(t, [[reviewKey, '["test-01-q10"]']], 2);
  const id = 'test-02-q2';
  for (const choice of ['A', 'B']) {
    original.click(`#${id} input[value="${choice}"]`);
    original.click(`#${id} .mock-check`);
  }
  const reopened = open(t, original.saved(), 2);
  assert.equal(reopened.text('mock-progress'), '1 of 18 checked · 0 reviewed');
  assert.match(reopened.card(id).querySelector('.mock-feedback').textContent, /correct answer/);
  assert.equal(reopened.card(id).querySelector('.mock-check').disabled, true);
  reopened.click('[data-session="1"]');
  assert.equal(reopened.text('mock-progress'), '0 of 12 checked · 1 reviewed');
  assert.equal(reopened.card('test-01-q10').querySelector('input[type="checkbox"]').checked, true);
  reopened.click('#test-01-q10 input[type="checkbox"]');
  assert.equal(open(t, reopened.saved()).text('mock-progress'), '0 of 12 checked · 0 reviewed');
});

test('another tab updates the matching card without replacing its neighbors', t => {
  const page = open(t);
  const { window } = page;
  const id = 'test-01-q3';
  const neighbor = page.card('test-01-q10');
  const key = answerKey(id);
  const newValue = JSON.stringify({ selected: 'C', attempts: ['C'], reviewed: true });
  window.localStorage.setItem(key, newValue);
  window.dispatchEvent(new window.StorageEvent('storage', { key, newValue }));
  assert.equal(page.card(id).querySelector('.mock-feedback').textContent, 'Correct!');
  assert.equal(page.card('test-01-q10'), neighbor);
  assert.equal(page.text('mock-progress'), '1 of 12 checked · 1 reviewed');
});

test('a failed write leaves the answer on screen and reports that it is unsaved', t => {
  const page = open(t);
  const id = 'test-01-q3';
  page.window.Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
  page.click(`#${id} input[value="C"]`);
  page.click(`#${id} .mock-check`);
  assert.match(page.text('mock-save-status'), /could not be saved/);
  assert.equal(page.card(id).querySelector('.mock-feedback').textContent, 'Correct!');
  page.click('[data-session="2"]');
  page.click('[data-session="1"]');
  assert.equal(page.card(id).querySelector('.mock-feedback').textContent, 'Correct!');
});

test('the dashboard distinguishes correct answers, retryable misses, and two misses', t => {
  const page = open(t);
  const { document } = page.window;
  const number = id => document.querySelector(`[data-question="${id}"]`);
  const attempt = (id, choice) => {
    page.click(`#${id} input[value="${choice}"]`);
    page.click(`#${id} .mock-check`);
  };
  attempt('test-01-q3', 'C');
  attempt('test-01-q10', 'A');
  attempt('test-01-q17', 'A');
  attempt('test-01-q17', 'B');
  attempt('test-01-q18', 'A');
  attempt('test-01-q18', 'C');

  assert.equal(number('test-01-q3').dataset.result, 'correct');
  assert.equal(number('test-01-q10').dataset.result, 'first-wrong');
  assert.match(number('test-01-q10').getAttribute('aria-label'), /one try left/);
  assert.equal(number('test-01-q17').dataset.result, 'wrong-twice');
  assert.equal(number('test-01-q18').dataset.result, 'corrected');
  assert.equal(number('test-01-q19').dataset.result, 'unchecked');
  assert.equal(document.querySelector('[data-filter="first-wrong"] span').textContent, '3');
  assert.equal(document.querySelector('[data-filter="wrong-twice"] span').textContent, '1');

  const shown = () => [...document.querySelectorAll('.mock-question:not([hidden])')].map(card => card.id);
  page.click('[data-filter="first-wrong"]');
  assert.deepEqual(shown(), ['test-01-q10', 'test-01-q17', 'test-01-q18']);
  attempt('test-01-q10', 'E');
  assert.equal(number('test-01-q10').dataset.result, 'corrected');
  assert.deepEqual(shown(), ['test-01-q10', 'test-01-q17', 'test-01-q18']);
  page.click('[data-filter="wrong-twice"]');
  assert.deepEqual(shown(), ['test-01-q17']);
  assert.equal(number('test-01-q3').hidden, true);
  assert.equal(number('test-01-q17').hidden, false);
  assert.equal(page.card('test-01-q17').querySelector('.mock-check').disabled, true);
  page.click('[data-filter="all"]');
  assert.equal(shown().length, 12);

  const reopened = open(t, page.saved());
  assert.equal(reopened.window.document.querySelector('[data-question="test-01-q17"]').dataset.result, 'wrong-twice');
  reopened.click('[data-session="2"]');
  reopened.click('[data-filter="wrong-twice"]');
  assert.equal(reopened.text('mock-empty'), 'No questions missed twice in this test.');
  assert.equal(reopened.window.document.querySelectorAll('.mock-question:not([hidden])').length, 0);
});

test('online sync uploads existing local work and restores the retry on another device', async t => {
  const old = { id: 'an-existing-drill', answers: {}, drafts: {}, position: 0, completedAt: null, startedAt: null };
  const service = sharedProgress({ pattern: [old] });
  const first = open(t, [
    [answerKey('test-01-q3'), JSON.stringify({ selected: 'A', attempts: ['A'], reviewed: false })],
    [reviewKey, '["test-01-q10"]'],
  ], 1, service.fetch);
  await until(() => first.text('mock-save-status') === 'Synced online');
  assert.deepEqual(service.state().articles.pattern, [old]);

  const ipad = open(t, [], 1, service.fetch);
  await until(() => ipad.text('mock-save-status') === 'Synced online');
  assert.match(ipad.window.document.querySelector('[data-session="1"]').textContent, /0 right · 1 wrong/);
  assert.equal(ipad.card('test-01-q3').querySelector('.mock-feedback').textContent, 'Try once more.');
  assert.equal(ipad.card('test-01-q10').querySelector('input[type=checkbox]').checked, true);
  ipad.click('#test-01-q3 input[value=C]');
  ipad.click('#test-01-q3 .mock-check');
  await until(() => ipad.text('mock-save-status') === 'Synced online');
  first.window.dispatchEvent(new first.window.Event('focus'));
  await until(() => first.card('test-01-q3').querySelector('.mock-feedback').textContent === 'Correct!');
  assert.deepEqual(JSON.parse(first.window.localStorage.getItem(answerKey('test-01-q3'))).attempts, ['A', 'C']);
  assert.deepEqual(service.state().articles.pattern, [old]);
});

test('sync retries after reconnecting and preserves conflicting local checks as separate histories', async t => {
  const service = sharedProgress();
  const key = answerKey('test-01-q3');
  const otherKey = answerKey('test-01-q10');
  const snapshot = (choice, attempts = [choice]) => JSON.stringify({ selected: choice, attempts, reviewed: false });
  service.available(false);
  const first = open(t, [[key, snapshot('A')]], 1, service.fetch);
  const second = open(t, [[key, snapshot('B')], [otherKey, snapshot('D', [])]], 1, service.fetch);
  await until(() => /Not synced/.test(first.text('mock-save-status')));
  assert.equal(first.card('test-01-q3').querySelector('.mock-feedback').textContent, 'Try once more.');
  assert.equal(second.card('test-01-q10').querySelector('input[value=D]').checked, true);

  service.available(true);
  first.window.dispatchEvent(new first.window.Event('online'));
  second.window.dispatchEvent(new second.window.Event('online'));
  await until(() => [first, second].every(page => page.text('mock-save-status') === 'Synced online'));
  const runs = service.state().articles[bucket];
  const checks = runs.filter(run => (run.syncRoot || run.id) === 'test-01-q3');
  assert.deepEqual(checks.map(run => run.answers['test-01-q3'].map(answer => answer.choice)), [[0], [1]]);
  first.window.dispatchEvent(new first.window.Event('focus'));
  await until(() => first.card('test-01-q10').querySelector('input[value=D]').checked);
});

test('the restart begins blank and keeps the original local and online attempts', async t => {
  const id = 'test-01-q3';
  const originalKey = `${originalReviewKey}:question:${id}`;
  const originalAnswer = JSON.stringify({ selected: 'C', attempts: ['C'], reviewed: true });
  const originalRun = { id, answers: { [id]: [{ choice: 2 }] }, drafts: {} };
  const service = sharedProgress({ [originalBucket]: [originalRun] });
  const page = open(t, [[originalKey, originalAnswer]], 1, service.fetch);
  await until(() => page.text('mock-save-status') === 'Synced online');
  assert.equal(page.text('mock-progress'), '0 of 12 checked · 0 reviewed');
  assert.equal(page.card(id).querySelector('input:checked'), null);
  assert.equal(service.state().articles[bucket], undefined);
  page.click(`#${id} input[value="A"]`);
  page.click(`#${id} .mock-check`);
  await until(() => page.text('mock-save-status') === 'Synced online');
  assert.equal(page.window.localStorage.getItem(originalKey), originalAnswer);
  assert.deepEqual(service.state().articles[originalBucket][0].answers[id], [{ choice: 2 }]);
  assert.deepEqual(service.state().articles[bucket][0].answers[id], [{ choice: 0 }]);
});

test('a test card turns green on the last retry without changing the first-try score', t => {
  const initial = open(t);
  const questions = initial.window.ZOZECK_MOCK_REVIEW;
  const records = Object.entries(questions).filter(([id]) => id.startsWith('test-01-')).map(([id, { answer }]) => {
    let attempts = [answer];
    if (id === 'test-01-q3') attempts = ['A'];
    if (id === 'test-01-q10') attempts = ['A', answer];
    return [answerKey(id), JSON.stringify({ selected: attempts.at(-1), attempts })];
  });
  const page = open(t, records);
  const card = page.window.document.querySelector('[data-session="1"]');
  const otherCard = page.window.document.querySelector('[data-session="2"]');
  assert.match(card.textContent, /First try · 10 right · 2 wrong/);
  assert.equal(card.classList.contains('is-complete'), false);
  assert.match(otherCard.textContent, /First try · 0 right · 0 wrong/);

  page.click('#test-01-q3 input[value=B]');
  page.click('#test-01-q3 .mock-check');
  assert.equal(card.classList.contains('is-complete'), true);
  assert.match(card.textContent, /Finished/);
  assert.match(card.textContent, /First try · 10 right · 2 wrong/);
  assert.equal(otherCard.classList.contains('is-complete'), false);

  const reopened = open(t, page.saved(), 2);
  assert.equal(reopened.window.document.querySelector('[data-session="1"]').classList.contains('is-complete'), true);
});
