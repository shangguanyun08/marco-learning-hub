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
  const { window } = new JSDOM(read('index.html'), {
    url: `https://example.test/marco-daily-reading/?session=${session}`,
    runScripts: 'outside-only'
  });
  t.after(() => window.close());
  window.fetch = fetch;
  for (const script of ['practice-excerpts.js', 'questions.js', engine, sync]) window.eval(read(script));
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

  for (const session of [1, 2, 3]) {
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
  assert.equal(server.size, 3);
});
