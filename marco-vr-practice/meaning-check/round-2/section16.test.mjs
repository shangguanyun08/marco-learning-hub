import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');

function page(t, { hash = '#section-16-round-0', saved } = {}) {
  const dom = new JSDOM(read('index.html'), { url: 'https://example.test/round-2/?demo=1' + hash, runScripts: 'outside-only' });
  const w = dom.window;
  t.after(() => w.close());
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.fetch = () => { throw Error('Preview must not write online.'); };
  if (saved) w.localStorage.setItem('marco-vr-meaning-round2-20261101-v1:demo:adaptive-v3', JSON.stringify(saved));
  for (const file of ['data.js', 'examples.js', 'focused-review.js', 'adaptive-sync.js', 'app.js']) w.eval(read(file));
  return { w, d: w.document };
}

test('the simplified page places Section 16 after Section 15 and includes all 50 audited words', t => {
  const { w, d } = page(t);
  assert.equal(d.querySelector('[data-section="15"]').nextElementSibling.dataset.section, '16');
  assert.equal(d.querySelectorAll('[data-section]').length, 16);
  assert.equal(d.querySelectorAll('[data-review-word]').length, 50);
  assert.deepEqual([...d.querySelectorAll('[data-review-word]')].map(row => row.dataset.reviewWord), Array.from(w.MARCO_FOCUSED_REVIEW.wordIds));
  assert.equal(d.querySelectorAll('.review-meaning').length, 50);
  assert.equal(d.querySelectorAll('.example strong').length, 50);
  assert.equal(d.querySelector('.toolbar'), null);
  assert.equal(d.querySelector('.added-word-note'), null);
  assert.equal(d.querySelector('.focused-ai-review'), null);
  assert.equal(d.querySelector('header .intro'), null);
  assert.equal(d.querySelectorAll('.ai-test-launch').length, 1);
  assert.equal(d.querySelectorAll('.ai-test-card').length, 38);
  assert.equal(d.querySelector('.session-tests-link'), null);
  d.querySelector('[data-start-review]').click();
  assert.equal(d.querySelectorAll('.focus-test-actions a').length, 2);
  assert.equal(d.querySelectorAll('.meaning').length, 0);
  assert.match(d.querySelector('.focus-test-actions a').href, /marco\/focused\?test=1$/);
  assert.equal(d.querySelector('.marked-toolbar').hidden, true);
  d.querySelector('[data-review]').click();
  assert.equal(d.querySelectorAll('[data-review-word]').length, 50);
  assert.equal(d.querySelector('.marked-toolbar').hidden, false);
});

test('adding the review section preserves completed answers and rounds from all 15 original sections', t => {
  const seed = new JSDOM('', { runScripts: 'outside-only' });
  seed.window.eval(read('data.js'));
  seed.window.eval(read('adaptive-sync.js'));
  const data = seed.window.MARCO_FOCUSED_ROUND2;
  const storage = { getItem: () => null, setItem() {} };
  const sync = seed.window.AdaptiveMeaningSync.create({ data, storage, disabled: true, now: () => 1000 });
  for (const section of data.sections) {
    sync.markReviewed(section.number);
    for (const id of sync.roundView(section.number, 1).order) sync.editRound(section.number, 1, id, 'meaning', 'Saved meaning');
    sync.submitRound(section.number, 1);
  }
  const saved = JSON.parse(JSON.stringify(sync.snapshot()));
  seed.window.close();
  const { w, d } = page(t, { saved, hash: '#section-15-round-1' });
  assert.equal(d.querySelectorAll('[data-section].is-complete').length, 15);
  assert.equal(d.querySelectorAll('.meaning:disabled').length, 17);
  assert.equal(d.querySelector('#next-section').hidden, false);
  d.querySelector('#next-section').click();
  assert.equal(d.querySelector('[data-section="16"]').getAttribute('aria-current'), 'true');
  const after = JSON.parse(w.localStorage.getItem(data.appId + ':demo:adaptive-v3'));
  assert.deepEqual(after.completed, saved.completed);
  assert.deepEqual(after.attempts, saved.attempts);
  assert.equal(w.MARCO_FOCUSED_ROUND2.total, 716);
  assert.equal(w.MARCO_FOCUSED_ROUND2.sections.length, 15);
});

for (const file of ['index.html', 'ai-tests/index.html']) test(file + ' shows every test card and the seven extra tests with public scores', async t => {
  const dom = new JSDOM(read(file), { url: 'https://example.test/round-2/#section-16-round-0', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.AbortSignal = AbortSignal;
  w.fetch = async () => ({ ok: true, json: async () => ({ tests: [
    { number: 1, total: 25, attempts: [] },
    { number: 2, total: 25, attempts: [{ id: 'unfinished', startedAt: '2026-11-09T10:00:00Z', completedAt: null, score: 2, total: 25, answered: 4 }] },
    { number: 36, total: 14, attempts: [
      { id: 'older/attempt +1', startedAt: '2026-11-08T10:00:00Z', completedAt: '2026-11-08T10:10:00Z', score: 8, total: 14, answered: 14 },
      { id: 'extra-attempt', startedAt: '2026-11-09T10:00:00Z', completedAt: '2026-11-09T10:10:00Z', score: 12, total: 14, answered: 14 },
    ] },
  ] }) });
  w.eval(read('scores.js'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(w.document.querySelectorAll('[data-ai-test]').length, 36);
  assert.equal(w.document.querySelectorAll('[data-focus-part]').length, 2);
  assert.equal(w.document.querySelectorAll('.ai-test-card[hidden]').length, 0);
  assert.equal(w.document.querySelector('#ai-section-filter'), null);
  assert.equal(w.document.querySelectorAll('[data-extra-test]').length, 7);
  const last = w.document.querySelector('#ai-test-36');
  assert.equal(last.querySelector('[data-ai-score]').textContent, '12 / 14');
  assert.match(last.querySelector('[data-ai-open]').href, /test=36&retest=1$/);
  assert.match(w.document.querySelector('#ai-test-1 [data-ai-open]').href, /test=1$/);
  assert.match(w.document.querySelector('#ai-test-2 [data-ai-open]').href, /test=2$/);
  const historyLinks = [...last.querySelectorAll('.ai-attempt-link')];
  assert.deepEqual(historyLinks.map(link => link.textContent), ['Attempt 2', 'Attempt 1']);
  assert.deepEqual(historyLinks.map(link => new URL(link.href).searchParams.get('attempt')), ['extra-attempt', 'older/attempt +1']);
  for (const link of historyLinks) {
    const url = new URL(link.href);
    assert.equal(url.pathname, '/marco');
    assert.equal(url.searchParams.get('test'), '36');
    assert.equal(url.searchParams.has('retest'), false);
    assert.match(link.getAttribute('aria-label'), /Review Test 36, Attempt [12]/);
  }
  assert.equal(new URL(w.document.querySelector('#ai-test-2 .ai-attempt-link').href).searchParams.get('attempt'), 'unfinished');
  for (const card of w.document.querySelectorAll('[data-ai-test]')) {
    const url = new URL(card.querySelector('[data-ai-open]').href);
    assert.equal(url.pathname, '/marco');
    assert.equal(url.searchParams.get('test'), card.dataset.aiTest);
  }
  for (const card of w.document.querySelectorAll('[data-focus-part]')) {
    const url = new URL(card.querySelector('a').href);
    assert.equal(url.pathname, '/marco/focused');
    assert.equal(url.searchParams.get('test'), card.dataset.focusPart);
  }
  w.location.hash = '#section-7-round-0'; w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  assert.equal(w.document.querySelectorAll('.ai-test-card:not([hidden])').length, 38);
  assert.match(w.document.querySelector('#ai-score-status').textContent, /without signing in/);
});
