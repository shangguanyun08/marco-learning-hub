const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { JSDOM } = require('jsdom');

const read = name => readFileSync(join(__dirname, name), 'utf8');
const reviewKey = 'harry-nnat-zozeck-review-2026-11-25';
const answerKey = id => `${reviewKey}:question:${id}`;

function open(t, saved = [], selectedTest = 1) {
  const dom = new JSDOM(read('index.html'), {
    url: `https://learning.test/harry-nnat/2026-11-25/?test=${selectedTest}`,
    runScripts: 'outside-only',
  });
  t.after(() => dom.window.close());
  const { document, localStorage } = dom.window;
  for (const [key, value] of saved) localStorage.setItem(key, value);
  for (const script of ['questions.js', 'review.js']) dom.window.eval(read(script));
  return {
    window: dom.window,
    saved: () => Object.entries(localStorage),
    text: id => document.getElementById(id).textContent,
    card: id => document.getElementById(id),
    click: selector => document.querySelector(selector).click(),
  };
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
