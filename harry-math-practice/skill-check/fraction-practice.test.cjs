const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const appId = 'harry-math-eight-skills-20261030-v1';
const key = appId + ':fraction-fill-in-v1';
const correctAnswers = {
  half: '0.5', third: '0.333...', quarter: '0.25', threeQuarters: '0.75',
  oneAndHalf: '1.5', threeAndThreeQuarters: '3.75', halfVsThird: '>', halfVsTwoThirds: '<'
};

function open(t, saved) {
  const dom = new JSDOM(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'), {
    url: 'https://example.test/?demo=1#fraction-practice', runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  const window = dom.window;
  window.HarrySkillData = {appId};
  window.localStorage.setItem(appId + ':state', 'existing session scores');
  if (saved) window.localStorage.setItem(key + ':demo', JSON.stringify(saved));
  window.eval(fs.readFileSync(path.join(__dirname, 'fraction-practice.js'), 'utf8'));
  const form = window.document.getElementById('fraction-practice-form');
  return {
    window, form,
    input: id => form.querySelector(`[data-fraction-answer="${id}"]`),
    enter(id, value) {
      const input = this.input(id);
      input.value = value;
      input.dispatchEvent(new window.Event('input', {bubbles: true}));
    },
    submit() { form.dispatchEvent(new window.Event('submit', {bubbles: true, cancelable: true})); },
    record: () => window.HarryFractionPractice.record()
  };
}

test('one fill-in exercise checks all six decimals and both fraction comparisons after full submission', t => {
  const page = open(t);
  assert.equal(page.form.querySelectorAll('input').length, 8);
  assert.equal(page.window.document.getElementById('fraction-practice').open, true);
  for (const [id, value] of Object.entries(correctAnswers).slice(0, 7)) page.enter(id, value);
  page.submit();
  assert.equal(page.record().first, null);
  assert.equal(page.form.querySelectorAll('.right, .first-wrong').length, 0);
  page.enter('halfVsTwoThirds', '<');
  page.submit();
  assert.equal(page.form.querySelectorAll('.right').length, 8);
  assert.match(page.form.textContent, /First try 8\/8/);
  assert.equal(page.window.localStorage.getItem(appId + ':state'), 'existing session scores');
  assert.equal(page.window.localStorage.getItem(key), null);
});

test('one third accepts repeating notation and rejects a finite rounded decimal', t => {
  for (const notation of ['0.333...', '0.3…', '.333…', '0.(3)', '0.3\u0305']) {
    const page = open(t);
    for (const [id, value] of Object.entries({...correctAnswers, third: notation})) page.enter(id, value);
    page.submit();
    assert.equal(page.form.querySelectorAll('.right').length, 8, notation);
  }
  const page = open(t);
  for (const [id, value] of Object.entries({...correctAnswers, third: '0.333'})) page.enter(id, value);
  page.submit();
  assert.equal(page.form.querySelectorAll('.first-wrong').length, 1);
  assert.equal(page.input('third').disabled, false);
});

test('a single correction attempt preserves the first score and survives reloads', t => {
  const page = open(t);
  for (const [id, value] of Object.entries({...correctAnswers, third: '0.33', halfVsThird: '<'})) page.enter(id, value);
  page.submit();
  const first = JSON.stringify(page.record().first);
  const resumed = open(t, page.record());
  assert.equal(resumed.input('half').disabled, true);
  resumed.enter('third', '0.(3)');
  resumed.enter('halfVsThird', '=');
  resumed.submit();
  assert.match(resumed.form.textContent, /First try 6\/8/);
  assert.equal(JSON.stringify(resumed.record().first), first);
  assert.equal(resumed.form.querySelectorAll('.corrected').length, 1);
  assert.equal(resumed.form.querySelectorAll('.retry-wrong').length, 1);
  assert.equal(resumed.input('third').disabled, true);
  assert.equal(resumed.input('halfVsThird').disabled, true);
  const finished = open(t, resumed.record());
  assert.match(finished.form.textContent, /First try 6\/8/);
  assert.match(finished.form.textContent, /Second try 1\/2 corrected/);
  const before = JSON.stringify(finished.record());
  finished.submit();
  assert.equal(JSON.stringify(finished.record()), before);
});
