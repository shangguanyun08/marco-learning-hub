const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM} = require('jsdom');
const original = require('./core.js');
const sessions = ['2026-11-17', '2026-11-18'].map(date => require(`../${date}/questions.js`));
const operations = [
  [[27,5,10,3,1],[171,8,101,8,-1],[6,1,13,5,-1],[25,3,19,4,-1],[21,4,23,8,-1]],
  [[29,4,8,3,1],[293,12,179,12,-1],[5,1,11,8,-1],[19,2,17,3,-1],[19,3,23,6,-1]]
];
function engine(session) {
  const context = {HarryFractionSession:session};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'core.js'), 'utf8'), context);
  return context.HarryFractionReview;
}

test('the two new sessions contain ten distinct calculations with independently checked answers', () => {
  const seen = new Set(original.questions.map(question => question.prompt));
  sessions.forEach((session, index) => {
    const E = engine(session);
    assert.equal(E.questions.length, 5);
    E.questions.forEach((question, number) => {
      assert.ok(!seen.has(question.prompt));
      seen.add(question.prompt);
      const [a,b,c,d,sign] = operations[index][number].map(BigInt);
      assert.equal((a*d + sign*c*b)*BigInt(question.value[1]), BigInt(question.value[0])*b*d);
      assert.ok(E.correct(question, question.answer));
    });
    assert.equal(E.questions.filter(question => question.prompt.includes('+')).length, 1);
    assert.equal(E.questions.filter(question => question.prompt.includes('−')).length, 4);
    assert.equal(original.valid(E.empty()), false);
    assert.equal(E.valid(original.empty()), false);
  });
  assert.notEqual(sessions[0].appId, sessions[1].appId);
  assert.equal(engine(sessions[0]).valid(engine(sessions[1]).empty()), false);
});

for (const session of sessions) {
  test(`${session.label} cannot use the original session if its questions fail to load`, t => {
    const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', session.sessionId, 'index.html'), 'utf8'), {url:'http://localhost/?demo=1',runScripts:'outside-only'});
    t.after(() => dom.window.close());
    for (const file of ['core.js', 'app.js']) dom.window.eval(fs.readFileSync(path.join(__dirname, file), 'utf8'));
    assert.equal(dom.window.document.querySelector('.question'), null);
    assert.match(dom.window.document.getElementById('save-note').textContent, /Refresh the page/);
    assert.equal(dom.window.localStorage.length, 0);
  });
  test(`${session.label} submits all five together, keeps its first score, and resumes the second try`, t => {
    function open(saved) {
      const directory = path.join(__dirname, '..', session.sessionId);
      const dom = new JSDOM(fs.readFileSync(path.join(directory, 'index.html'), 'utf8'), {url:`http://localhost/${session.sessionId}/?demo=1`,runScripts:'outside-only'});
      t.after(() => dom.window.close());
      if (saved) dom.window.localStorage.setItem(session.appId + ':demo:state', saved);
      for (const script of dom.window.document.querySelectorAll('head script[src]')) {
        const file = script.getAttribute('src').split('?')[0];
        dom.window.eval(fs.readFileSync(path.resolve(directory, file), 'utf8'));
      }
      return dom.window;
    }
    let window = open(), document = window.document;
    assert.equal(document.querySelectorAll('.question').length, 5);
    assert.equal(document.querySelectorAll('.prompt .fraction').length, 9);
    assert.equal(document.querySelector('.explanation'), null);
    assert.match(document.querySelector('[aria-current=page]').textContent, new RegExp(session.label));
    assert.equal(document.querySelector('[data-app-id]').dataset.appId, session.appId);
    const fill = (id, value) => {
      const input = document.getElementById('answer-' + id);
      input.value = value;
      input.dispatchEvent(new window.Event('input', {bubbles:true}));
    };
    for (const question of session.questions.slice(0,4)) fill(question.id, question.answer);
    assert.equal(document.getElementById('submit-answers').disabled, true);
    fill('f5', '1');
    document.getElementById('session-form').dispatchEvent(new window.Event('submit', {bubbles:true,cancelable:true}));
    assert.match(document.getElementById('result').textContent, new RegExp(session.label + ' results'));
    assert.match(document.getElementById('result').textContent, /4\/5 · 80%/);
    assert.equal(document.querySelectorAll('.first-wrong').length, 1);
    const saved = window.localStorage.getItem(session.appId + ':demo:state');
    assert.equal(JSON.parse(saved).sessionId, session.sessionId);
    assert.equal(window.localStorage.getItem(original.APP_ID + ':demo:state'), null);
    window = open(saved); document = window.document;
    assert.equal(document.getElementById('answer-f1').disabled, true);
    assert.equal(document.getElementById('answer-f5').disabled, false);
    fill('f5', session.questions[4].answer);
    document.getElementById('session-form').dispatchEvent(new window.Event('submit', {bubbles:true,cancelable:true}));
    assert.equal(document.querySelectorAll('.corrected').length, 1);
    assert.match(document.getElementById('result').textContent, /4\/5 · 80%/);
    assert.equal(document.getElementById('submit-answers'), null);
  });
}
