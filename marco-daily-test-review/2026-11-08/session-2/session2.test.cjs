const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { JSDOM } = require(process.env.MARCO_QA_JSDOM || 'jsdom');
const load = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
const context = { window: {} };
vm.runInNewContext(load('data.js'), context);
const D = context.window.MarcoMA5Practice;

function page(saved, session1) {
  const dom = new JSDOM(load('index.html'), { url: 'http://127.0.0.1:8880/session-2/?session=2#practice', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.scrollTo = () => {};
  w.Element.prototype.scrollIntoView = function () {};
  w.requestAnimationFrame = callback => { callback(); return 1; };
  Object.defineProperty(w, 'crypto', { value: crypto.webcrypto });
  w.fetch = () => { throw Error('Preview must not write live progress'); };
  if (saved) w.localStorage.setItem(D.appId + ':preview', saved);
  if (session1) w.localStorage.setItem('marco-ma-nov08-test5-v1:preview', session1);
  for (const script of w.document.querySelectorAll('script[src]')) {
    const file = script.getAttribute('src').split('?')[0];
    if (!file.includes('shared-activity-tracker')) w.eval(load(file));
  }
  return dom;
}
function answer(w, id, choice) {
  const input = w.document.querySelector(`#q-${id} input[value="${choice}"]`);
  assert.ok(input && !input.disabled);
  input.checked = true;
  input.dispatchEvent(new w.Event('change', { bubbles: true }));
  input.closest('form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
}

test('Session 2 has 16 fresh questions, four per selected skill and one per mixed group', () => {
  assert.equal(D.ids.length, 16);
  assert.equal(new Set(D.ids).size, 16);
  assert.deepEqual(Object.keys(D.skills), ['charges', 'dependence', 'symmetry', 'direction']);
  for (const skill of Object.keys(D.skills)) {
    const questions = D.ids.map(id => D.questions[id]).filter(question => question.skill === skill);
    assert.equal(questions.length, 4);
    assert.deepEqual(Array.from(questions, question => question.correct).sort(), [0, 1, 2, 3]);
  }
  for (let group = 0; group < 4; group++) assert.equal(new Set(D.ids.slice(group * 4, group * 4 + 4).map(id => D.questions[id].skill)).size, 4);
  const old = { window: {} };
  vm.runInNewContext(load('../practice-data.js'), old);
  const original = old.window.MarcoMA5Practice;
  assert.notEqual(D.appId, original.appId);
  assert.notEqual(D.session, original.session);
  assert.ok(D.ids.every(id => !original.ids.includes(id)));
  const signature = question => JSON.stringify([question.prompt, question.choices, question.table || null, question.diagram || null, question.graphs || null]);
  assert.ok(D.ids.every(id => !original.ids.some(oldId => signature(original.questions[oldId]) === signature(D.questions[id]))));
});

test('independent arithmetic and probability calculations verify the authored keys', () => {
  const expected = { 'c2-1': '4', 'c2-2': '$2.00', 'c2-3': '$8', 'c2-4': '$34', 'p2-2': '3/28', 'p2-3': '4/9' };
  for (const [id, value] of Object.entries(expected)) assert.equal(D.questions[id].choices[D.questions[id].correct], value);
  assert.equal((23.5 - 4 - 6 * 2.5) / 1.5 + 1, 4);
  assert.equal((24 - 18) / (4 - 1), 2);
  for (const [miles, passengers, total] of [[4, 3, 24], [7, 1, 29], [3, 4, 23]]) assert.equal(total - miles * 3 - (passengers - 1) * 2, 8);
  assert.equal(12 + (6 - 2) * 3 + 2 * 5, 34);
  assert.ok(Math.abs(3 / 8 * 2 / 7 - 3 / 28) < 1e-12);
  assert.equal(4 / (10 - 1), 4 / 9);
  assert.ok(2 / 5 > 1 / 4);
  assert.equal(D.questions['p2-1'].correct, 3);
  assert.equal(D.questions['p2-4'].correct, 2);
});

test('every shaded diagram is checked against all reflection axes of its outline', () => {
  function axes(diagram) {
    const shaded = (r, c) => diagram.shaded.some(cell => cell[0] === r && cell[1] === c);
    function preserves(reflect) {
      for (let r = 0; r < diagram.rows; r++) for (let c = 0; c < diagram.cols; c++) {
        const [rr, cc] = reflect(r, c);
        if (shaded(r, c) !== shaded(rr, cc)) return false;
      }
      return true;
    }
    return [preserves((r, c) => [diagram.rows - 1 - r, c]), preserves((r, c) => [r, diagram.cols - 1 - c]), diagram.rows === diagram.cols && preserves((r, c) => [c, r]), diagram.rows === diagram.cols && preserves((r, c) => [diagram.rows - 1 - c, diagram.cols - 1 - r])];
  }
  assert.deepEqual(axes(D.questions['s2-1'].diagram), [false, false, true, true]);
  assert.deepEqual(axes(D.questions['s2-2'].diagram), [false, false, true, false]);
  assert.deepEqual(axes(D.questions['s2-3'].diagram), [true, false, false, false]);
  assert.deepEqual(axes(D.questions['s2-4'].diagram), [false, false, false, false]);
  assert.deepEqual(['s2-1', 's2-2', 's2-3', 's2-4'].map(id => D.questions[id].correct), [2, 1, 3, 0]);
});

test('graph, table, signed-change and equation questions use the requested direction and rate', () => {
  const graph = Array.from(D.questions['g2-1'].graphs, (line, index) => ({ m: line.m, index })).filter(line => line.m * -1 < 0).sort((a, b) => Math.abs(b.m) - Math.abs(a.m))[0];
  assert.equal(graph.index, D.questions['g2-1'].correct);
  const number = value => Number(value.replace('−', '-'));
  const table = Array.from(D.questions['g2-2'].table.rows, (row, index) => ({ m: (number(row[2]) - number(row[1])) / 4, index })).filter(line => line.m * -1 > 0).sort((a, b) => Math.abs(a.m) - Math.abs(b.m))[0];
  assert.equal(table.index, D.questions['g2-2'].correct);
  assert.equal((-2 / 3) * -6, 4);
  assert.equal(D.questions['g2-3'].choices[D.questions['g2-3'].correct], 'It increases by 4.');
  const equation = [-0.25, -3, 0.5, 2].map((m, index) => ({ m, index })).filter(line => line.m < 0).sort((a, b) => Math.abs(a.m) - Math.abs(b.m))[0];
  assert.equal(equation.index, D.questions['g2-4'].correct);
});

test('the normal page saves Session 2 separately, gives a second chance, and reports all four skills after 16 answers', () => {
  const previous = JSON.stringify({ version: 1, sessions: { 'mixed-28-ma5-qr5-v1': [{ id: 'mixed-28-ma5-qr5-v1', answers: {}, notes: {} }] } });
  const dom = page(undefined, previous), w = dom.window, d = w.document;
  try {
    assert.equal(d.querySelectorAll('#practice .question').length, 16);
    assert.equal(d.querySelectorAll('.practice-jump .jump-group').length, 4);
    assert.equal(d.querySelectorAll('.question-group-divider').length, 3);
    assert.equal(d.querySelectorAll('#practice .source').length, 0);
    assert.equal(d.querySelector('#skill-results'), null);
    answer(w, 'c2-1', 1);
    assert.match(d.querySelector('#q-c2-1 .feedback').textContent, /Try once more/);
    assert.equal(d.querySelector('#q-c2-1 .answer-reveal'), null);
    answer(w, 'c2-1', 0);
    assert.match(d.querySelector('#q-c2-1 .feedback').textContent, /Corrected on second try/);
    for (const id of D.ids.slice(1)) answer(w, id, D.questions[id].correct);
    assert.match(d.querySelector('#skill-results h2').textContent, /15\/16/);
    assert.equal(d.querySelectorAll('#skill-results tbody tr').length, 4);
    assert.match(d.querySelector('.practice-status').textContent, /15\/16/);
    assert.equal(d.querySelectorAll('#practice .source').length, 16);
    assert.equal(w.localStorage.getItem('marco-ma-nov08-test5-v1:preview'), previous);
    const saved = w.localStorage.getItem(D.appId + ':preview');
    const restored = page(saved, previous);
    try {
      assert.match(restored.window.document.querySelector('#skill-results h2').textContent, /15\/16/);
      restored.window.document.querySelector('[data-view="analysis"]').click();
      assert.equal(restored.window.document.querySelector('#analysis').hidden, false);
      assert.match(restored.window.document.querySelector('#saved-skill-analysis h2').textContent, /15\/16/);
      assert.equal(restored.window.document.querySelector('#saved-skill-analysis .unanswered-note'), null);
    } finally { restored.window.close(); }
  } finally { w.close(); }
});
