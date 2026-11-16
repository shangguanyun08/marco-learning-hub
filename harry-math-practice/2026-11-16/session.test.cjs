const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM} = require('jsdom');
const E = require('./core.js');
const answers = Object.fromEntries(E.questions.map(question => [question.id, question.answer]));
const at = '2026-11-16T17:00:00.000Z';

test('all five email calculations have independently checked exact fraction answers', () => {
  const inputs = [[6,1,5,2,4,9,1],[23,5,12,13,7,12,-1],[4,0,1,1,2,5,-1],[7,1,2,3,2,3,-1],[4,1,4,2,5,8,-1]];
  E.questions.forEach((question, index) => {
    const [a,b,c,d,e,f,sign] = inputs[index];
    const n = (a*c+b)*f + sign*(d*f+e)*c;
    const denominator = c*f;
    assert.equal(n*question.value[1], question.value[0]*denominator);
    assert.ok(E.correct(question, question.answer));
  });
  assert.deepEqual(E.parse('3(5/6)'), [23,6]);
  assert.deepEqual(E.parse('9⅚'), [59,6]);
  assert.ok(E.correct(E.questions[0], '389/45'));
  for (const text of ['', '1/0', '2/3/4', '2.5', '<script>3</script>']) assert.equal(E.parse(text), null);
});

test('full-set first answers lock and a correction never increases the first score', () => {
  const state = E.empty();
  assert.equal(E.submit(state, {f1: answers.f1}, at, 'first-batch-001'), false);
  assert.equal(state.first, null);
  assert.equal(E.submit(state, {...answers, f5: '3'}, at, 'first-batch-001'), true);
  const first = JSON.stringify(state.first);
  assert.equal(E.score(state), 4);
  assert.equal(E.submit(state, {f5: answers.f5}, at, 'retry-batch-001'), true);
  assert.equal(E.score(state), 4);
  assert.equal(JSON.stringify(state.first), first);
  assert.equal(E.submit(state, {f5: answers.f5}, at, 'third-batch-001'), false);
  assert.ok(E.valid(state));
});

test('offline conflicts keep the online first answer and retain the alternative record', () => {
  const online = E.empty(), offline = E.empty();
  E.submit(online, {...answers, f1: '1'}, at, 'online-first-001');
  E.submit(offline, answers, at, 'offline-first-001');
  E.submit(online, {f1: answers.f1}, at, 'online-retry-001');
  const merged = E.merge(offline, online);
  assert.equal(merged.first.id, 'online-first-001');
  assert.equal(merged.retry.id, 'online-retry-001');
  assert.equal(E.score(merged), 4);
  assert.equal(merged.conflicts[0].batch.id, 'offline-first-001');
  assert.ok(E.valid(merged));
  assert.deepEqual(E.merge(merged, merged), merged);
});

test('dated page hides feedback until all answers submit, renders stacked fractions, and resumes retries', t => {
  function open(saved) {
    const dom = new JSDOM(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'), {url: 'http://localhost/?demo=1', runScripts: 'outside-only'});
    t.after(() => dom.window.close());
    if (saved) dom.window.localStorage.setItem(E.APP_ID + ':demo:state', saved);
    for (const file of ['core.js', 'app.js']) dom.window.eval(fs.readFileSync(path.join(__dirname, file), 'utf8'));
    return dom.window;
  }
  const window = open(), document = window.document;
  assert.equal(document.querySelectorAll('.question').length, 5);
  assert.ok(document.querySelectorAll('.mixed-number .fraction').length >= 8);
  assert.equal(document.querySelector('.explanation'), null);
  function fill(id, value) {
    const input = document.getElementById('answer-' + id);
    input.value = value;
    input.dispatchEvent(new window.Event('input', {bubbles: true}));
  }
  for (const question of E.questions.slice(0,4)) fill(question.id, question.answer);
  assert.equal(document.getElementById('submit-answers').disabled, true);
  fill('f5', '3');
  document.getElementById('session-form').dispatchEvent(new window.Event('submit', {bubbles:true,cancelable:true}));
  assert.match(document.getElementById('result').textContent, /4\/5 · 80%/);
  assert.equal(document.querySelectorAll('.first-wrong').length, 1);
  fill('f5', '1 5/8');
  document.getElementById('session-form').dispatchEvent(new window.Event('submit', {bubbles:true,cancelable:true}));
  assert.equal(document.querySelectorAll('.corrected').length, 1);
  const resumed = open(window.localStorage.getItem(E.APP_ID + ':demo:state'));
  assert.match(resumed.document.getElementById('result').textContent, /4\/5 · 80%/);
  assert.equal(resumed.document.querySelectorAll('.corrected').length, 1);
  assert.equal(resumed.document.getElementById('submit-answers'), null);
});

test('shared math sync accepts the dated app ID and synchronizes both attempts across devices', async () => {
  let remote = null, posts = 0;
  const fetcher = async (url, options = {}) => {
    assert.ok(url.endsWith('?appId=' + E.APP_ID));
    if (!options.body) return {ok:true, json:async()=>({progress:remote})};
    posts++;
    const body = JSON.parse(options.body);
    assert.equal(body.appId, E.APP_ID);
    remote = {state:body.state, version:(remote?.version || 0)+1};
    return {ok:true, json:async()=>({accepted:true, progress:remote})};
  };
  function client() {
    let state = E.empty();
    const cache = new Map();
    const context = {HarrySkillEngine:E, AbortController, fetch:fetcher, crypto:{randomUUID:()=> 'test-device-000001'}, localStorage:{getItem:key=>cache.get(key), setItem:(key,value)=>cache.set(key,value)}, document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}},addEventListener(){},removeEventListener(){},setInterval:()=>1,clearInterval(){},setTimeout,clearTimeout};
    context.globalThis = context;
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../skill-check/sync.js'), 'utf8'), context);
    const sync = context.HarrySkillSync.create({appId:E.APP_ID,engine:E,score:E.progressScore,getState:()=>state,onRemote:next=>{state=next;},onStatus(){},fetcher});
    return {sync,get:()=>state};
  }
  const a = client(), b = client();
  await a.sync.start();
  assert.equal(posts, 0);
  E.submit(a.get(), {...answers,f5:'2'}, at, 'sync-first-001');
  await a.sync.push();
  await b.sync.start();
  assert.equal(E.score(b.get()), 4);
  E.submit(b.get(), {f5:answers.f5}, at, 'sync-retry-001');
  await b.sync.push();
  await a.sync.push();
  assert.equal(a.get().retry.id, 'sync-retry-001');
  assert.equal(E.score(a.get()), 4);
  a.sync.stop(); b.sync.stop();
});
