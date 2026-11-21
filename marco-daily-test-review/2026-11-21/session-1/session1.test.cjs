const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {JSDOM} = require('jsdom');

function open(t, directory, records = {}) {
  const file = path.resolve(__dirname, directory, 'index.html');
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    url:'http://localhost/?demo=1', runScripts:'outside-only', pretendToBeVisual:true
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  for (const [key, value] of Object.entries(records)) w.localStorage.setItem(key, value);
  for (const script of w.document.querySelectorAll('head script[src]')) {
    w.eval(fs.readFileSync(path.resolve(path.dirname(file), script.getAttribute('src').split('?')[0]), 'utf8'));
  }
  return w;
}

function submit(w, id, choice) {
  const form = w.document.querySelector('#q-' + id + ' form');
  form.querySelector('input[value="' + choice + '"]').click();
  form.dispatchEvent(new w.Event('submit', {bubbles:true, cancelable:true}));
}

test('the Review shows only the five missed items and preserves old saved answers', t => {
  const review = open(t, '..');
  const data = review.MarcoMA5Practice;
  assert.deepEqual([...data.ids], ['qr18','qr37','ma25','ma46','ma47']);
  assert.equal(review.document.querySelectorAll('#practice .question').length, 5);
  const legacy = review.MarcoQR4Engine.empty();
  review.MarcoQR4Engine.submit(legacy, 'r1', data.questions.r1.correct);
  const saved = open(t, '..', {[data.appId + ':demo']:JSON.stringify(legacy)});
  assert.match(saved.document.querySelector('.scorebar').textContent, /0\/5 first answers recorded/);
  for (const id of data.ids) submit(saved, id, data.questions[id].correct);
  assert.equal(saved.document.querySelector('#skill-results'), null);
  const savedRun = JSON.parse(saved.localStorage.getItem(data.appId + ':demo')).sessions[data.session][0];
  assert.ok(savedRun.answers.r1, 'an earlier combined-set answer survives saving the review');
});

test('fresh Session 1 reports mastery only for 4/4 first tries and shows the report below question 20', t => {
  const w = open(t, '.');
  const d = w.document;
  const data = w.MarcoMA5Practice;
  assert.equal(data.ids.length, 20);
  assert.equal(new Set(data.ids).size, 20);
  for (const skill of Object.keys(data.skills)) assert.equal(data.ids.filter(id => data.questions[id].skill === skill).length, 4);
  assert.equal(d.querySelectorAll('#practice .answer-reveal').length, 0);
  submit(w, 'scale-1', 0);
  submit(w, 'scale-1', 1);
  for (const id of data.ids.slice(1, -1)) submit(w, id, data.questions[id].correct);
  assert.equal(d.querySelector('#skill-results'), null);
  submit(w, 'slope-4', 0);
  const report = d.querySelector('#skill-results');
  assert.equal(d.querySelector('#practice-content').lastElementChild, report);
  assert.match(report.textContent, /18\/20 correct first try/);
  assert.match(report.textContent, /3\/5 skills mastered on this set/);
  assert.match(report.querySelector('[data-skill=fractionScale]').textContent, /3\/4[\s\S]*1\/1 first misses[\s\S]*Needs practice/);
  assert.match(report.querySelector('[data-skill=fee]').textContent, /4\/4[\s\S]*Mastered on this set/);
  const key = data.appId + ':demo';
  const resumed = open(t, '.', {[key]:w.localStorage.getItem(key)});
  assert.match(resumed.document.querySelector('#skill-results').textContent, /18\/20 correct first try/);
});
