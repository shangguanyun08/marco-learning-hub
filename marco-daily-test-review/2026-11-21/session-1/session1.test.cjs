const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {JSDOM} = require('jsdom');

function open(t, directory, records = {}, options = {}) {
  const file = path.resolve(__dirname, directory, 'index.html');
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    url: options.url || 'http://localhost/?demo=1', runScripts:'outside-only', pretendToBeVisual:true
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  if (options.fetch) w.fetch = options.fetch;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  for (const [key, value] of Object.entries(records)) w.localStorage.setItem(key, value);
  for (const script of w.document.querySelectorAll('head script[src]')) {
    w.eval(fs.readFileSync(path.resolve(path.dirname(file), script.getAttribute('src').split('?')[0]), 'utf8'));
  }
  return w;
}

test('November 21 cards use the saved first-try scores on every page, including inactive sessions', async t => {
  const directories = ['..', '.', ...Array.from({length: 11}, (_, i) => `../session-${i + 2}`)];
  const cardIds = ['nov21-review', ...Array.from({length: 12}, (_, i) => `nov21-${i + 1}`)];
  const records = new Map();
  for (const [i, directory] of directories.entries()) {
    const w = open(t, directory);
    const data = w.MarcoMA5Practice;
    const definition = w.MarcoNov21SessionCards.courses[cardIds[i]];
    assert.equal(definition.appId, data.appId);
    assert.equal(definition.session, data.session);
    assert.equal(definition.reportAfter, data.ids.length);
    assert.equal(JSON.stringify(definition.keys), JSON.stringify(Object.fromEntries(data.ids.map(id => [id, data.questions[id].correct]))));
    assert.equal(w.document.querySelector('#practice-tab').dataset.sessionCard, cardIds[i]);
    const state = w.MarcoQR4Engine.empty();
    const ids = i >= 3 ? [] : i === 2 ? data.ids.slice(0, 3) : data.ids;
    for (const [index, id] of ids.entries()) {
      const correct = data.questions[id].correct;
      const firstCorrect = index < [1, 10, 2][i];
      w.MarcoQR4Engine.submit(state, id, firstCorrect ? correct : (correct + 1) % 4, '2026-11-21T18:00:00.000Z');
      if (!firstCorrect) w.MarcoQR4Engine.submit(state, id, correct, '2026-11-21T18:01:00.000Z');
    }
    if (i === 0) w.MarcoQR4Engine.submit(state, 'r1', data.questions.r1.correct);
    records.set(data.appId, {version: 1, state});
  }

  const fetch = async (url, options) => {
    assert.equal(options.method, 'GET');
    const progress = records.get(new URL(url).searchParams.get('appId'));
    assert.ok(progress);
    return {ok: true, json: async () => ({progress})};
  };
  for (const directory of directories) {
    const w = open(t, directory, {}, {url: 'https://example.test/', fetch});
    await w.MarcoNov21SessionCards.controller.ready;
    for (let n = 0; w.document.querySelector('#save-note').dataset.kind !== 'live' && n < 10; n++) {
      await new Promise(resolve => setImmediate(resolve));
    }
    const card = id => w.document.querySelector('[data-session-card="' + id + '"]');
    assert.ok(card('nov21-review').classList.contains('is-complete'));
    assert.match(card('nov21-review').textContent, /1\/5 \(20%\) first try/);
    assert.ok(card('nov21-1').classList.contains('is-complete'));
    assert.match(card('nov21-1').textContent, /10\/20 \(50%\) first try/);
    assert.ok(card('nov21-2').classList.contains('is-in-progress'));
    assert.match(card('nov21-2').textContent, /3\/20 answered · 2\/3 correct first try/);
    assert.ok(!card('nov21-3').classList.contains('is-complete'));
    assert.match(card('nov21-3').textContent, /Not started · 0\/20 answered/);
    assert.match(card('nov21-4').textContent, /Not started · 0\/10 answered/);
    assert.match(card('nov21-5').textContent, /Not started · 0\/6 answered/);
    assert.match(card('nov21-6').textContent, /Not started · 0\/6 answered/);
    assert.match(card('nov21-7').textContent, /Not started · 0\/8 answered/);
    assert.match(card('nov21-8').textContent, /Not started · 0\/20 answered/);
    assert.match(card('nov21-9').textContent, /Not started · 0\/12 answered/);
    assert.match(card('nov21-10').textContent, /Not started · 0\/9 answered/);
    assert.match(card('nov21-11').textContent, /Not started · 0\/2 answered/);
    assert.match(card('nov21-12').textContent, /Not started · 0\/8 answered/);
    assert.equal(card('nov21-13'), null);
    assert.equal(w.document.querySelectorAll('nav.view-tabs a[aria-current=page]').length, 1);
  }
});

function submit(w, id, choice) {
  const form = w.document.querySelector('#q-' + id + ' form');
  form.querySelector('input[value="' + choice + '"]').click();
  form.dispatchEvent(new w.Event('submit', {bubbles:true, cancelable:true}));
}

test('Session 8 places 11 Practice Test 7 redos before 9 fresh questions and preserves first-try scoring', t => {
  const w = open(t, '../session-8');
  const d = w.document, data = w.MarcoMA5Practice;
  const originals = [3, 7, 8, 20, 21, 26, 31, 32, 33, 34, 35];
  assert.deepEqual([...data.ids.slice(0, 11)], originals.map(n => `redo-qr${n}`));
  assert.deepEqual([...data.ids.slice(0, 11).map(id => data.questions[id].source)], originals.map(n => `Practice Test 7 QR · Q${n} redo`));
  assert.equal(data.ids.slice(11).length, 9);
  assert.equal(new Set(data.ids.slice(11).map(id => data.questions[id].skill)).size, 9);
  assert.equal(d.querySelectorAll('#q-redo-qr7 svg[role=img]').length, 4);
  assert.equal(d.querySelectorAll('#q-redo-qr20 tbody tr').length, 4);
  assert.match(d.querySelector('#q-redo-qr35 svg').getAttribute('aria-label'), /No right angles are marked/);
  assert.equal(d.querySelector('.answer-reveal'), null);
  const misses = new Set(['redo-qr3','redo-qr34']);
  for (const id of data.ids) {
    assert.equal(d.querySelector('#skill-results'), null);
    const q = data.questions[id];
    submit(w,id,misses.has(id) ? (q.correct+1)%4 : q.correct);
  }
  submit(w,'redo-qr34',data.questions['redo-qr34'].correct);
  assert.match(d.querySelector('#practice-tab').textContent, /18\/20 \(90%\) first try/);
  d.querySelector('[data-practice-filter=wrong]').click();
  assert.equal(d.querySelectorAll('.wrong-skill-group .question').length, 2);
  const summary = d.querySelector('.wrong-skill-summary');
  assert.match(summary.querySelector('[data-skill-summary=rates]').textContent, /2 correct · 1 wrong · 3 total/);
  assert.match(summary.querySelector('[data-skill-summary=slope]').textContent, /1 correct · 1 wrong · 2 total/);
  assert.match(summary.querySelector('[data-skill-summary=median]').textContent, /2 correct · 0 wrong · 2 total/);
  assert.match(d.querySelector('#skill-results').textContent, /1 corrected on a second try/);
  assert.match(d.querySelector('#skill-results .skill-strengths').textContent, /Recognize nets of solids \(2\/2\)/);
});

test('Session 4 lists both perfect two-question skills, plus slope totals before and after retries', t => {
  const w = open(t, '../session-4');
  const d = w.document, data = w.MarcoMA5Practice;
  const keyed = data.ids.map(id => data.questions[id]);
  assert.deepEqual(Object.keys(data.skills), ['slope', 'fractionScale', 'fee']);
  assert.deepEqual(Object.keys(data.skills).map(skill => keyed.filter(question => question.skill === skill).length), [6, 2, 2]);
  assert.deepEqual([...keyed.map(q => q.choices[q.correct])], [
    '2/3', 'n × 5/6', '18', '6', '(1, 4) and (5, −2)',
    '4', 'x ÷ 4/3', '−3', 'C = 8 + 2.50(b − 1)', 'It falls 3 units each time x increases by 4.'
  ]);
  const missed = ['slope-1', 'slope-2'];
  const choose = id => {
    const q = data.questions[id];
    submit(w, id, missed.includes(id) ? (q.correct + 1) % 4 : q.correct);
  };
  for (const id of data.ids.slice(0, -1)) choose(id);
  assert.equal(d.querySelector('#skill-results'), null);
  choose(data.ids.at(-1));
  submit(w, missed[0], data.questions[missed[0]].correct);
  assert.match(d.querySelector('#practice-tab').textContent, /8\/10 \(80%\) first try/);

  d.querySelector('[data-practice-filter=wrong]').click();
  assert.equal(d.querySelectorAll('.wrong-skill-group .question').length, 2);
  const summary = d.querySelector('.wrong-skill-summary');
  assert.equal(d.querySelector('.practice-filters').nextElementSibling, summary);
  assert.match(summary.querySelector('[data-skill-summary=slope]').textContent, /4 correct · 2 wrong · 6 total/);
  assert.match(summary.querySelector('[data-skill-summary=fractionScale]').textContent, /2 correct · 0 wrong · 2 total/);
  assert.match(summary.querySelector('[data-skill-summary=fee]').textContent, /2 correct · 0 wrong · 2 total/);
  assert.deepEqual([...summary.querySelectorAll('a')].map(link => link.textContent), ['1', '3']);
  assert.match(d.querySelector('#wrong-skill-slope').textContent, /2\/6 wrong first try/);
  const report = d.querySelector('#skill-results');
  assert.equal(d.querySelector('#practice-content').lastElementChild, report);
  assert.equal(report.querySelectorAll('.skill-table tbody tr').length, 3);
  assert.match(report.textContent, /2\/3 skills mastered/);
  assert.match(report.querySelector('[data-skill=slope]').textContent, /4\/6[\s\S]*5\/6[\s\S]*1\/2 first misses corrected/);
  const perfect = report.querySelector('.skill-strengths').textContent;
  assert.ok(perfect.includes('Compare multiplication and division by fractions (2/2)'));
  assert.ok(perfect.includes('Write a fee rule with an included first unit (2/2)'));
  assert.ok(!perfect.includes('Find signed slope'));
});

test('Session 5 has four fresh slope questions and two fraction questions with first-try scores in Wrong only', t => {
  const previous = open(t, '../session-4');
  const prior = previous.MarcoMA5Practice;
  const oldState = previous.MarcoQR4Engine.empty();
  previous.MarcoQR4Engine.submit(oldState, prior.ids[0], prior.questions[prior.ids[0]].correct);
  const priorKey = prior.appId + ':demo';
  const saved = JSON.stringify(oldState);

  const w = open(t, '../session-5', {[priorKey]: saved});
  const d = w.document;
  const data = w.MarcoMA5Practice;
  assert.equal(data.appId, 'marco-math-nov21-session5-v1');
  assert.equal(data.ids.length, 6);
  assert.deepEqual(Object.keys(data.skills), ['slope', 'fractionScale']);
  const earlierPrompts = new Set(Object.values(prior.questions).map(q => q.prompt));
  assert.deepEqual(Object.keys(data.skills).map(skill => data.ids.filter(id => data.questions[id].skill === skill).length), [4, 2]);
  for (const q of Object.values(data.questions)) {
    assert.ok(!earlierPrompts.has(q.prompt));
    assert.equal(new Set(q.choices).size, 4);
  }
  assert.deepEqual([...data.ids.map(id => data.questions[id].choices[data.questions[id].correct])], [
    '3/5', 'n × 1/2', '−5/4', 'n × 5/4', '−1', '4'
  ]);
  assert.ok(d.querySelector('.math-fraction'));
  assert.match(d.querySelector('.scorebar').textContent, /0\/6 first answers recorded/);

  const [slope, fraction] = data.ids;
  for (const id of [slope, fraction]) submit(w, id, (data.questions[id].correct + 1) % 4);
  d.querySelector('[data-practice-filter=wrong]').click();
  assert.equal(d.querySelectorAll('.question').length, 2);
  assert.equal(d.querySelectorAll('.answer-reveal').length, 0);
  submit(w, slope, data.questions[slope].correct);
  assert.equal(d.querySelectorAll('.answer-reveal').length, 1);
  assert.equal(d.querySelector('#skill-results'), null);

  d.querySelector('[data-practice-filter=all]').click();
  for (const id of data.ids.slice(2)) submit(w, id, data.questions[id].correct);
  d.querySelector('[data-practice-filter=wrong]').click();
  const summary = d.querySelector('.wrong-skill-summary');
  assert.match(summary.querySelector('[data-skill-summary=slope]').textContent, /3 correct · 1 wrong · 4 total/);
  assert.match(summary.querySelector('[data-skill-summary=fractionScale]').textContent, /1 correct · 1 wrong · 2 total/);
  assert.match(d.querySelector('#skill-results').textContent, /4\/6 correct first try[\s\S]*1 corrected on a second try/);
  assert.match(d.querySelector('#practice-tab').textContent, /4\/6 \(67%\) first try/);
  assert.equal(w.localStorage.getItem(priorKey), saved);
});

for (const [number, counts, answerKey] of [
  [6, {slope: 4, fractionScale: 2}, ['−5/6', 'p × 7/6', '(−2, 0) and (7, 6)', 'n × 7/9', '4', '−18']],
  [7, {overlap: 4, cubeVolume: 4}, ['16', '625 in³', '5', '81 cm³', '23', '2 in', '8', '27/8']]
]) {
  test('Session ' + number + ' checks the intended skills and keeps first-try totals after retry', t => {
    const w = open(t, '../session-' + number);
    const d = w.document;
    const data = w.MarcoMA5Practice;
    assert.equal(data.appId, 'marco-math-nov21-session' + number + '-v1');
    assert.equal(data.ids.length, answerKey.length);
    assert.deepEqual(Object.keys(data.skills), Object.keys(counts));
    for (const [skill, total] of Object.entries(counts)) {
      assert.equal(data.ids.filter(id => data.questions[id].skill === skill).length, total);
    }
    assert.deepEqual([...data.ids.map(id => data.questions[id].choices[data.questions[id].correct])], answerKey);
    assert.equal(d.querySelectorAll('.answer-reveal').length, 0);
    if (number === 7) {
      assert.deepEqual([...data.ids.slice(0, 2)], ['redo-qr18', 'redo-qr20']);
      assert.match(d.querySelector('#q-redo-qr18 .source').textContent, /Practice Test 6 QR · Q18 redo/);
      assert.match(d.querySelector('#q-redo-qr20 .source').textContent, /Practice Test 6 QR · Q20 redo/);
      assert.match(d.querySelector('#q-redo-qr20 .cube-block svg').getAttribute('aria-label'), /5 cubes across, 2 cubes deep, and 4 cubes high/);
    }
    const [first, second] = data.ids;
    for (const id of [first, second]) submit(w, id, (data.questions[id].correct + 1) % 4);
    d.querySelector('[data-practice-filter=wrong]').click();
    assert.equal(d.querySelectorAll('.question').length, 2);
    assert.equal(d.querySelectorAll('.answer-reveal').length, 0);
    submit(w, first, data.questions[first].correct);
    assert.equal(d.querySelectorAll('.answer-reveal').length, 1);
    d.querySelector('[data-practice-filter=all]').click();
    for (const id of data.ids.slice(2)) submit(w, id, data.questions[id].correct);
    d.querySelector('[data-practice-filter=wrong]').click();
    assert.equal(d.querySelectorAll('.question').length, 2);
    for (const [skill, total] of Object.entries(counts)) {
      const summary = d.querySelector('[data-skill-summary=' + skill + '] p').textContent;
      assert.equal(summary.trim(), `${total - 1} correct · 1 wrong · ${total} total`);
    }
    assert.match(d.querySelector('#skill-results').textContent, /1 corrected on a second try/);
  });
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

const followUpAnswers = [
  [
    'x ÷ 3/4 is greater than x, and x ÷ 7/4 is less than x.', '4.2 × 10^10', 'C = 18 + 6(h − 2)', '1', '−3/2',
    'n × 5/8', '7', '$13', '2/3', '(−2, 6) and (2, −4)',
    'z × 4/5', 'Column B is greater.', 'Plan A by $2', '7/2', '(0, 3)',
    '12', '2.4 × 10^7', '3', '2', '−2'
  ],
  [
    'p ÷ 5/8', '1.8 × 10^12', '4', '1', '3/2 and −1',
    't × 6/5', '5', 'C = 22 + 6(h − 2)', '12/7', '4',
    '7', 'The quantities are equal.', '11', '7/5', '(0, 3) and (3, 8)',
    '5/7', '6', 'Package A by $6', '3/2', '4'
  ]
];

for (const number of [2, 3]) {
  test('Session ' + number + ' scores 20 fresh questions and keeps the report in Wrong only', t => {
    const folder = '../session-' + number;
    const first = open(t, '.');
    const signature = q => JSON.stringify([q.prompt, q.stacked, q.comparison, q.table]);
    const earlier = new Set(Object.values(first.MarcoMA5Practice.questions).map(signature));
    if (number === 3) {
      const second = open(t, '../session-2');
      Object.values(second.MarcoMA5Practice.questions).forEach(q => earlier.add(signature(q)));
    }
    const oldData = first.MarcoMA5Practice;
    const oldState = first.MarcoQR4Engine.empty();
    first.MarcoQR4Engine.submit(oldState, oldData.ids[0], oldData.questions[oldData.ids[0]].correct);
    const records = {[oldData.appId + ':demo']: JSON.stringify(oldState)};
    const w = open(t, folder, records);
    const d = w.document;
    const data = w.MarcoMA5Practice;
    assert.equal(data.appId, 'marco-math-nov21-session' + number + '-v1');
    assert.equal(data.session, 'official-middle-nov21-session' + number + '-v1');
    assert.match(d.querySelector('#practice-tab strong').textContent, new RegExp('Session ' + number));
    assert.match(d.querySelector('.scorebar').textContent, /0\/20 first answers recorded/);
    assert.equal(d.querySelectorAll('.question').length, 20);
    assert.equal(d.querySelectorAll('.stacked-expression').length, 4);
    assert.equal(d.querySelectorAll('.answer-reveal').length, 0);
    assert.deepEqual([...data.ids.map(id => data.questions[id].choices[data.questions[id].correct])], followUpAnswers[number - 2]);
    for (const skill of Object.keys(data.skills)) assert.equal(data.ids.filter(id => data.questions[id].skill === skill).length, 4);
    for (const id of data.ids) {
      const q = data.questions[id];
      assert.equal(q.choices.length, 4);
      assert.equal(new Set(q.choices).size, 4);
      assert.ok(!earlier.has(signature(q)), id + ' must be a fresh question');
      earlier.add(signature(q));
    }

    const [missed, power] = data.ids;
    submit(w, missed, (data.questions[missed].correct + 1) % 4);
    d.querySelector('[data-practice-filter=wrong]').click();
    assert.equal(d.querySelectorAll('.question').length, 1);
    assert.match(d.querySelector('[data-skill-summary=fractionScale]').textContent, /0 correct · 1 wrong · 4 total · 3 unanswered/);
    assert.match(d.querySelector('#q-' + missed).textContent, /Check second try/);
    assert.equal(d.querySelector('.answer-reveal'), null);
    submit(w, missed, data.questions[missed].correct);
    d.querySelector('[data-practice-filter=all]').click();
    submit(w, power, (data.questions[power].correct + 1) % 4);
    for (const id of data.ids.slice(2, -1)) submit(w, id, data.questions[id].correct);
    assert.equal(d.querySelector('#skill-results'), null);
    const last = data.ids.at(-1);
    submit(w, last, data.questions[last].correct);

    const report = d.querySelector('#skill-results');
    assert.equal(d.querySelector('#practice-content').lastElementChild, report);
    assert.match(report.querySelector('h2').textContent, new RegExp('Session ' + number + ' skill report'));
    assert.match(report.textContent, /18\/20 correct first try[\s\S]*3\/5 skills mastered/);
    assert.match(report.querySelector('[data-skill=fractionScale]').textContent, /3\/4[\s\S]*1\/1 first misses[\s\S]*Needs practice/);
    assert.match(report.querySelector('[data-skill=powers]').textContent, /3\/4[\s\S]*0\/1 first misses[\s\S]*Needs practice/);
    d.querySelector('[data-practice-filter=wrong]').click();
    assert.equal(d.querySelectorAll('.wrong-skill-group .question').length, 2);
    assert.match(d.querySelector('#skill-results').textContent, /18\/20 correct first try/);
    assert.equal(w.localStorage.getItem(oldData.appId + ':demo'), records[oldData.appId + ':demo']);
    const key = data.appId + ':demo';
    const resumed = open(t, folder, {[key]: w.localStorage.getItem(key)});
    assert.match(resumed.document.querySelector('#skill-results').textContent, /18\/20 correct first try/);
  });
}
