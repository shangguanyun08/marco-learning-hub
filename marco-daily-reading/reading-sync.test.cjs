const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { test } = require('node:test');
const { JSDOM } = require('jsdom');

const read = file => readFileSync(path.join(__dirname, file), 'utf8');
const engine = '../marco-daily-test-review/2026-10-23/engine.js';
const sync = '../marco-daily-test-review/2026-10-23/sync.js';

function open(t, session, fetch, seedAnswer = false) {
  const earlier = session === 'earlier';
  const { window } = new JSDOM(read(earlier ? 'earlier-review/index.html' : 'index.html'), {
    url: `https://example.test/marco-daily-reading/${earlier ? 'earlier-review/' : '?session=' + session}`,
    runScripts: 'outside-only'
  });
  t.after(() => window.close());
  window.fetch = fetch;
  const content = earlier ? ['earlier-review/questions.js'] : ['practice-excerpts.js', 'practice-test-4-review.js', 'questions.js'];
  for (const script of [...content, engine, sync]) window.eval(read(script));
  const course = window.MarcoQR4Data;
  const first = course.ids[0];
  const correct = course.questions[first].correct;
  if (seedAnswer) {
    const state = window.MarcoQR4Engine.empty();
    window.MarcoQR4Engine.submit(state, first, (correct + 1) % 4);
    window.localStorage.setItem(course.appId, JSON.stringify(state));
  }
  window.eval(read('reading.js'));
  const select = selector => window.document.querySelector(selector);
  return {
    window, course, first, correct,
    status: () => select('#save-note').dataset.kind,
    result: () => select(`#item-${first} .feedback`).dataset.result,
    answer(id, choice) {
      select(`#item-${id} input[value="${choice}"]`).checked = true;
      select(`#item-${id} button[type="submit"]`).click();
    },
    text: selector => select(selector).textContent
  };
}

async function until(check) {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (check()) return;
    await delay(20);
  }
  assert.ok(check(), 'Timed out waiting for reading progress to sync');
}

test('all reading sessions migrate device answers and sync corrections after reconnect', async t => {
  const server = new Map();
  let offline = false;
  const fetch = async (url, options) => {
    if (offline) throw Error('Offline');
    const id = new URL(url).searchParams.get('appId');
    let progress = server.get(id) ?? null;
    let accepted;
    if (options.method === 'POST') {
      const body = JSON.parse(options.body);
      assert.equal(body.appId, id);
      accepted = body.baseVersion === (progress?.version ?? null);
      if (accepted) {
        progress = {version: (progress?.version ?? 0) + 1, state: body.state};
        server.set(id, progress);
      }
    }
    return {ok: true, json: async () => ({progress, accepted})};
  };

  for (const session of [1, 2, 3, 4, '4&redo=1', 'earlier']) {
    const a = open(t, session, fetch, true);
    await until(() => a.status() === 'live' && server.has(a.course.appId));
    const b = open(t, session, fetch);
    await until(() => b.status() === 'live' && b.result() === 'retry');

    offline = true;
    b.answer(b.first, b.correct);
    await until(() => b.status() === 'offline');
    assert.equal(b.result(), 'correct');
    assert.equal(server.get(b.course.appId).version, 1);

    offline = false;
    b.window.dispatchEvent(new b.window.Event('online'));
    await until(() => b.status() === 'live' && server.get(b.course.appId).version === 2);
    a.window.dispatchEvent(new a.window.Event('focus'));
    await until(() => a.result() === 'correct');
    const skill = a.course.questions[a.first].skill;
    const skillTotal = a.course.ids.filter(id => a.course.questions[id].skill === skill).length;
    assert.ok(a.text('#skill-scores').includes(`0 correct · 1/${skillTotal} answered`));
    assert.match(a.text('#skill-scores'), /1 corrected on the second try/);
  }
  assert.equal(server.size, 6);
});

test('earlier review matches the scored misses and filters questions and jumps by skill', async t => {
  const review = open(t, 'earlier', async () => ({ok: true, json: async () => ({progress: null})}));
  await until(() => review.status() === 'live');
  const { window, course } = review;
  const expected = [
    '3C 5C 7C 8A 9A 11A 16B 17D 21A 24A 25B 26A 27A 28A 29D',
    '4A 5C 6D 8B 9D 13A 15B 21C 25A 33D 34D 35C',
    '6A 8D 11D 12C 14C 18D 21A 22C 26D 27A 28A 29B 30A 31B 33D 35D 36A'
  ];
  const expectedKeys = expected.flatMap((keys, mock) => keys.split(' ').map(key => 'm' + mock + 'q' + key));
  const actualKeys = course.ids.map(id => id + 'ABCD'[course.questions[id].correct]);
  assert.deepEqual([...actualKeys].sort(), expectedKeys.sort());
  const doc = window.document;
  assert.equal(doc.querySelectorAll('.review-group').length, 6);
  assert.equal(doc.querySelectorAll('.question').length, 44);
  assert.equal(doc.querySelectorAll('[data-evidence]').length, 0);

  review.answer(review.first, (review.correct + 1) % 4);
  const clue = doc.querySelector(`[data-evidence="${review.first}"]`);
  clue.click();
  assert.ok(doc.querySelector(`#item-${review.first} mark`));
  assert.equal(doc.querySelectorAll('[data-original]').length, 0);

  const filter = doc.querySelector('#review-skill');
  filter.value = 'inference';
  filter.dispatchEvent(new window.Event('change'));
  assert.equal(doc.querySelectorAll('.review-group:not([hidden])').length, 1);
  assert.equal(doc.querySelectorAll('#question-jump a:not([hidden])').length,
    course.ids.filter(id => course.questions[id].skill === 'inference').length);
});
