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
  assert.equal(d.querySelector('.ai-test-launch'), null);
  assert.equal(d.querySelector('.all-session-tests').getAttribute('href'), 'ai-tests/');
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

test('all session tests open on a separate page with public scores and both Section 16 AI parts', async t => {
  const dom = new JSDOM(read('ai-tests/index.html'), { url: 'https://example.test/round-2/ai-tests/', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.AbortSignal = AbortSignal;
  w.fetch = async () => ({ ok: true, json: async () => ({ tests: [] }) });
  for (const file of ['data.js', 'focused-review.js', 'scores.js']) w.eval(read(file));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(w.document.querySelectorAll('[data-ai-test]').length, 29);
  assert.equal(w.document.querySelectorAll('[data-focus-part]').length, 2);
  assert.equal(w.document.querySelectorAll('.ai-test-card[hidden]').length, 0);
  const picker = w.document.querySelector('#ai-section-filter');
  assert.equal(picker.value, '');
  picker.value = '16'; picker.dispatchEvent(new w.Event('change'));
  assert.equal(w.document.querySelectorAll('[data-ai-test]:not([hidden])').length, 0);
  assert.equal(w.document.querySelectorAll('[data-focus-part]:not([hidden])').length, 2);
  assert.match(w.document.querySelector('#ai-score-status').textContent, /without signing in/);
});
