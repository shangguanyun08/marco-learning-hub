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
    if (earlier) window.MarcoQR4Engine.submit(state, 'm1q21', course.questions.m1q21.correct);
    window.localStorage.setItem(course.appId, JSON.stringify(state));
  }
  if (!earlier) window.eval(read('session-cards.js'));
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
    const skillResult = session === 'earlier'
      ? `0/${skillTotal} correct · 1 wrong · ${skillTotal - 1} unanswered`
      : `0 correct · 1/${skillTotal} answered`;
    assert.ok(a.text('#skill-scores').includes(skillResult));
    assert.match(a.text('#skill-scores'), /1 corrected on the second try/);
    if (session === 'earlier') {
      assert.equal(a.text('#overall-score'), '0% · 1 of 38 answered');
      assert.equal(a.text('#review-correct'), '0');
      assert.equal(a.text('#review-wrong'), '1');
      assert.equal(a.text('#review-total'), '38');
      const saved = server.get(a.course.appId).state;
      assert.equal(saved.sessions[a.course.session][0].answers.m1q21.attempts.length, 1);
    }
  }
  assert.equal(server.size, 6);
});

test('earlier review shows selected misses with one shared text per passage', async t => {
  const review = open(t, 'earlier', async () => ({ok: true, json: async () => ({progress: null})}));
  await until(() => review.status() === 'live');
  const { window, course } = review;
  const expected = [
    '3C 5C 7C 8A 9A 11A 16B 17D 21A 24A 25B 26A 27A 28A 29D',
    '4A 5C 6D 8B 9D 13A 15B 21C 25A 33D 34D 35C',
    '6A 8D 11D 12C 14C 18D 21A 22C 26D 27A 28A 29B 30A 31B 33D 35D 36A'
  ];
  const expectedKeys = expected.flatMap((keys, mock) => keys.split(' ').map(key => 'm' + mock + 'q' + key));
  const actualKeys = Object.values(course.questions).map(question => question.id + 'ABCD'[question.correct]);
  assert.deepEqual([...actualKeys].sort(), expectedKeys.sort());
  const omitted = ['m0q7', 'm0q9', 'm0q27', 'm1q15', 'm1q21', 'm2q30'];
  assert.deepEqual(Object.keys(course.questions).filter(id => !course.ids.includes(id)), omitted);
  const doc = window.document;
  assert.equal(new Set(Object.values(course.questions).map(question => question.title)).size, 17);
  assert.equal(doc.querySelectorAll('.review-group').length, 16);
  assert.equal(doc.querySelectorAll('.review-group > .reading-passage').length, 16);
  assert.equal(doc.querySelectorAll('.question .reading-passage').length, 0);
  assert.equal(doc.querySelectorAll('.question').length, 38);
  assert.equal(doc.querySelectorAll('[data-evidence]').length, 0);
  for (const id of course.ids) {
    const { evidence, passageId } = course.questions[id];
    assert.ok(evidence.length > 0);
    const passage = doc.getElementById('passage-' + passageId);
    assert.ok(evidence.every(clue => clue && passage.textContent.includes(clue)));
  }

  review.answer(review.first, (review.correct + 1) % 4);
  const clue = doc.querySelector(`[data-evidence="${review.first}"]`);
  const evidence = doc.getElementById(clue.getAttribute('aria-controls'));
  assert.equal(evidence.hidden, true);
  clue.click();
  assert.equal(evidence.hidden, false);
  assert.match(evidence.querySelector('mark').textContent, /determine whether they survive/);
  clue.click();
  assert.equal(evidence.hidden, true);
  assert.equal(doc.querySelectorAll('[data-original]').length, 0);

  const filter = doc.querySelector('#review-passage');
  const gravity = course.questions.m0q25.passageId;
  filter.value = gravity;
  filter.dispatchEvent(new window.Event('change'));
  const visible = doc.querySelectorAll('.review-group:not([hidden])');
  assert.equal(visible.length, 1);
  assert.equal(visible[0].querySelector('h3').textContent, 'Newton’s law of gravity');
  assert.equal(visible[0].querySelectorAll('.question').length, 4);
  assert.match(visible[0].querySelector('.reading-passage').textContent, /In the neighborhood/);
  assert.equal(doc.querySelector('#item-m0q28 .read-passage').getAttribute('href'), '#passage-' + gravity);
});

test('repeat choices are compared only once the retry is used', async t => {
  let progress = null;
  const review = open(t, 'earlier', async (_, {method, body}) => {
    if (method === 'POST') progress = {version: (progress?.version ?? 0) + 1, state: JSON.parse(body).state};
    return {ok: true, json: async () => ({progress, accepted: method === 'POST'})};
  });
  await until(() => review.status() === 'live');
  const doc = review.window.document;
  const report = doc.querySelector('#repeat-review');
  const note = id => doc.querySelector(`#item-${id} .original-comparison`);
  assert.equal(report.hidden, true);
  assert.equal(note('m0q3'), null);
  assert.equal(review.course.questions.m0q3.originalChoice, 1);
  assert.equal(review.course.questions.m0q5.originalChoice, 0);
  assert.equal(review.course.questions.m1q15.originalChoice, null);

  review.answer('m0q3', 1);
  assert.equal(note('m0q3'), null);
  assert.equal(report.hidden, true);
  assert.equal(review.text('#review-retry-score'), '1 retry available');
  review.answer('m0q3', 2);
  assert.match(note('m0q3').textContent, /Same wrong choice on the first try. Corrected on the second try/);

  review.answer('m0q5', 1);
  assert.equal(note('m0q5'), null);
  review.answer('m0q5', 0);
  assert.match(note('m0q5').textContent, /Same wrong choice on the second try/);

  review.answer('m0q8', 2);
  review.answer('m0q8', 3);
  assert.match(note('m0q8').textContent, /different wrong option/);
  review.answer('m0q11', 0);
  assert.equal(note('m0q11'), null);
  assert.equal(review.text('#overall-score'), '25% · 4 of 38 answered');
  assert.equal(review.text('#review-correct'), '1');
  assert.equal(review.text('#review-wrong'), '3');
  assert.equal(review.text('#review-retry-score'), '1 corrected on the second try · 2 still wrong');

  assert.equal(report.hidden, false);
  assert.match(report.textContent, /2 of 3 misses/);
  assert.equal(report.querySelectorAll('li').length, 2);
  const picker = doc.querySelector('#review-passage');
  picker.value = review.course.questions.m0q8.passageId;
  picker.dispatchEvent(new review.window.Event('change'));
  report.querySelector('[data-repeat-question="m0q3"]').click();
  assert.equal(picker.value, review.course.questions.m0q3.passageId);
});

test('reading cards use saved results and turn green after pending retries are finished', async t => {
  const records = new Map();
  const reading = open(t, 1, async url => {
    const appId = new URL(url).searchParams.get('appId');
    return {ok: true, json: async () => ({progress: records.get(appId) ?? null})};
  });
  await until(() => reading.status() === 'live');
  const doc = reading.window.document;
  const card = number => doc.querySelector(`[data-session="${number}"]`);
  const engine = reading.window.MarcoQR4Engine;
  for (const [index, data] of reading.course.dashboardCourses.entries()) {
    const model = engine.forCourse(data);
    const state = model.empty();
    for (const [position, id] of data.ids.entries()) {
      const key = data.questions[id].correct;
      model.submit(state, id, index === 1 && position === 0 ? (key + 1) % 4 : key);
    }
    records.set(data.appId, {version: 1, state});
  }
  reading.window.dispatchEvent(new reading.window.Event('focus'));
  await until(() => [1, 3, 4].every(number => card(number).classList.contains('is-complete')));
  assert.match(card(1).textContent, /Finished · 6\/6 correct first try/);
  assert.match(card(2).textContent, /11\/12 correct first try · Retry available/);
  assert.equal(card(2).classList.contains('is-complete'), false);

  const practice = reading.course.dashboardCourses[1];
  const saved = records.get(practice.appId);
  const id = practice.ids[0];
  engine.forCourse(practice).submit(saved.state, id, practice.questions[id].correct);
  saved.version += 1;
  reading.window.dispatchEvent(new reading.window.Event('focus'));
  await until(() => card(2).classList.contains('is-complete'));
  assert.match(card(2).textContent, /Finished · 11\/12 correct first try/);
});

test('Practice Test 4 hides the original answer while a retry is available', async t => {
  const reading = open(t, 4, async () => ({ok: true, json: async () => ({progress: null})}));
  await until(() => reading.status() === 'live');
  const doc = reading.window.document;
  const showOriginal = () => doc.querySelector(`#item-${reading.first} [data-original]`);
  assert.equal(showOriginal(), null);
  reading.answer(reading.first, (reading.correct + 1) % 4);
  assert.equal(showOriginal(), null);
  reading.answer(reading.first, reading.correct);
  assert.ok(showOriginal());
});
