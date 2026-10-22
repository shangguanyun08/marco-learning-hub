import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
const ID = 'week-oct12-3-5', SCORE = 'harry-star-sept20-four-sessions-v1';
const INK = 'harry-math-day3-5-scratch-v1', MODE = 'harry-math-day3-5-layout-v1';
function boot(t, query = '?session=' + ID, saved = {}) {
  const w = new JSDOM(read('./index.html'), {url: 'http://localhost/' + query, runScripts: 'outside-only'}).window;
  t.after(() => w.close());
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.fetch = () => { throw Error('Scratchpad tests must never contact learner sync'); };
  for (const [key, value] of Object.entries(saved)) w.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  for (const script of w.document.querySelectorAll('script[defer][src]')) w.eval(read(script.getAttribute('src').split('?')[0]));
  return {w, d: w.document, ink: () => JSON.parse(w.localStorage.getItem(INK)), score: () => JSON.parse(w.localStorage.getItem(SCORE))};
}
function pointer(b, svg, type, extra = {}) {
  const event = new b.w.Event(type, {bubbles: true, cancelable: true});
  for (const [key, value] of Object.entries({pointerId: 7, pointerType: 'pen', isPrimary: true, button: 0, clientX: 30, clientY: 40, ...extra})) Object.defineProperty(event, key, {value});
  svg.dispatchEvent(event);
}
function draw(b, question = 1, pointerType = 'pen') {
  const svg = b.d.querySelector('#q' + question + ' .math-ink');
  svg.getBoundingClientRect = () => ({left: 10, top: 20, width: 500, height: 400});
  pointer(b, svg, 'pointerdown', {pointerType});
  pointer(b, svg, 'pointermove', {pointerType, clientX: 350, clientY: 260, getCoalescedEvents: () => []});
  pointer(b, svg, 'pointerup', {pointerType});
  return svg;
}
const tool = (b, action) => b.d.querySelector('#q1 [data-ink="' + action + '"]').click();
const toggle = b => b.d.querySelector('#scratch-layout-toggle').click();
function answer(b, source, value) {
  const form = b.d.querySelector('form[data-source="' + source + '"]');
  form.querySelector('input').value = String(value);
  form.dispatchEvent(new b.w.Event('submit', {bubbles: true, cancelable: true}));
}

test('Only Day 3.5 opens the six scratchpads; original mode and navigation remain available', t => {
  const b = boot(t);
  assert.ok(b.d.body.classList.contains('math-scratch-mode'));
  assert.equal(b.d.querySelectorAll('.math-ink').length, 6);
  assert.equal(b.d.querySelectorAll('.scratch-question-content form').length, 6);
  assert.equal(b.d.querySelector('#scratch-layout-toggle').textContent, 'Use original layout');
  b.d.querySelector('#number-2').value = '11';
  toggle(b);
  assert.ok(!b.d.body.classList.contains('math-scratch-mode'));
  assert.equal(b.d.querySelector('#number-2').value, '11');
  assert.equal(new URL(b.w.location).searchParams.get('scratch'), 'off');
  assert.equal(b.w.localStorage.getItem(MODE), 'original');
  toggle(b);
  assert.ok(b.d.body.classList.contains('math-scratch-mode'));
  assert.equal(b.d.querySelector('#number-2').value, '11');
  b.d.querySelector('.session-link[href="?session=week-oct12-3-4"]').click();
  assert.ok(!b.d.body.classList.contains('math-scratch-mode'));
  assert.equal(b.d.querySelectorAll('.math-ink').length, 0);
  assert.ok(b.d.querySelector('#scratch-layout-controls').hidden);
  assert.equal(b.d.querySelectorAll('.question').length, 6);
  const home = boot(t, '?group=week-2026-10-12');
  assert.ok(home.d.querySelector('#scratch-layout-controls').hidden);
  assert.equal(home.d.querySelectorAll('.math-ink').length, 0);
});

test('Pen, touch and mouse drawings save per question without submitting any math answer', t => {
  const b = boot(t);
  for (const [i, type] of ['pen', 'touch', 'mouse'].entries()) draw(b, i + 1, type);
  const ink = b.ink();
  assert.deepEqual(Object.keys(ink.questions), ['1', '2', '3']);
  assert.deepEqual(ink.questions[1].strokes[0], [[40, 40], [40, 40], [680, 480]]);
  assert.equal(b.score(), null);
  assert.equal(b.d.querySelector('#score').textContent, '—');
  const reload = boot(t, '?session=' + ID, {[INK]: ink});
  assert.equal(reload.d.querySelectorAll('.math-ink polyline').length, 3);
  assert.equal(reload.d.querySelector('#q4 .math-ink polyline'), null);
  assert.equal(reload.score(), null);
});

test('Undo, redo, and clearing are reversible; layout switches retain the drawing', t => {
  const b = boot(t); draw(b); draw(b);
  tool(b, 'undo'); assert.equal(b.ink().questions[1].strokes.length, 1);
  tool(b, 'redo'); assert.equal(b.ink().questions[1].strokes.length, 2);
  tool(b, 'clear'); assert.equal(b.ink().questions[1].strokes.length, 0);
  assert.equal(b.d.querySelector('#q1 [data-ink="undo"]').disabled, false);
  tool(b, 'undo'); assert.equal(b.ink().questions[1].strokes.length, 2);
  const saved = b.w.localStorage.getItem(INK);
  toggle(b); toggle(b);
  assert.equal(b.w.localStorage.getItem(INK), saved);
  assert.equal(b.d.querySelectorAll('#q1 .math-ink polyline').length, 2);
  const reload = boot(t, '?session=' + ID + '&scratch=off', {[INK]: b.ink()});
  assert.ok(!reload.d.body.classList.contains('math-scratch-mode'));
  toggle(reload);
  assert.equal(reload.d.querySelectorAll('#q1 .math-ink polyline').length, 2);
  tool(reload, 'undo'); assert.equal(reload.ink().questions[1].strokes.length, 1);
});

test('Answer checks keep the ink, original first-try scoring and all earlier records', t => {
  const prior = {version: 1, sessions: {'week-oct12-3-4': [{id: 'prior', startedAt: '2026-10-21T10:00:00Z', completedAt: null, answers: {1: {attempts: [{choice: '8', correct: true, at: '2026-10-21T10:01:00Z'}]}}}]}};
  const b = boot(t, '?session=' + ID, {[SCORE]: prior}); draw(b);
  const ink = b.w.localStorage.getItem(INK);
  answer(b, 1, 1);
  assert.match(b.d.querySelector('#feedback-1').textContent, /Not yet/);
  assert.equal(b.d.querySelectorAll('#q1 .math-ink polyline').length, 1);
  assert.equal(b.d.querySelector('#score').textContent, '0%');
  answer(b, 1, 7);
  assert.match(b.d.querySelector('#feedback-1').textContent, /Correct/);
  assert.equal(b.d.querySelector('#score').textContent, '0%');
  assert.equal(b.score().sessions[ID][0].answers[1].attempts.length, 2);
  assert.deepEqual(b.score().sessions['week-oct12-3-4'], prior.sessions['week-oct12-3-4']);
  assert.equal(b.w.localStorage.getItem(INK), ink);
  assert.equal(b.d.querySelectorAll('#q1 .math-ink polyline').length, 1);
  const reload = boot(t, '?session=' + ID, {[SCORE]: b.score(), [INK]: b.ink()});
  assert.equal(reload.d.querySelector('#score').textContent, '0%');
  assert.equal(reload.d.querySelectorAll('#q1 .math-ink polyline').length, 1);
});

test('A render flushes an active stroke and restores it; pointer cancellation and palm input are safe', t => {
  const b = boot(t), svg = b.d.querySelector('#q1 .math-ink');
  svg.getBoundingClientRect = () => ({left: 0, top: 0, width: 500, height: 400});
  pointer(b, svg, 'pointerdown');
  pointer(b, svg, 'pointerdown', {pointerId: 9, pointerType: 'touch', isPrimary: false});
  pointer(b, svg, 'pointermove', {clientX: 100, clientY: 100});
  const remote = {version: 1, sessions: {}};
  b.w.dispatchEvent(new b.w.StorageEvent('storage', {key: SCORE, newValue: JSON.stringify(remote)}));
  assert.equal(b.ink().questions[1].strokes.length, 1);
  assert.equal(b.d.querySelectorAll('#q1 .math-ink polyline').length, 1);
  const next = b.d.querySelector('#q2 .math-ink');
  next.getBoundingClientRect = svg.getBoundingClientRect;
  pointer(b, next, 'pointerdown'); pointer(b, next, 'pointercancel');
  assert.equal(b.ink().questions[2].strokes.length, 1);
  assert.equal(b.score(), null);
});

test('Stored layout preference survives reload; explicit layout links override it', t => {
  const original = boot(t, '?session=' + ID, {[MODE]: 'original'});
  assert.ok(!original.d.body.classList.contains('math-scratch-mode'));
  const explicit = boot(t, '?session=' + ID + '&scratch=on', {[MODE]: 'original'});
  assert.ok(explicit.d.body.classList.contains('math-scratch-mode'));
  const unrelated = boot(t, '?session=week-oct12-1&scratch=on');
  assert.ok(!unrelated.d.body.classList.contains('math-scratch-mode'));
  assert.equal(unrelated.d.querySelectorAll('.math-ink').length, 0);
});
