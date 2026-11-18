const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const analyze = require('./inline-feedback');

test('exact quotes anchor annotations and legacy suggestions to Harry’s own words', () => {
  const text = 'there was a boy his name was bob. He was doing good.';
  const feedback = { nextStep: 'Put a period after “boy”. Change “doing good” to “doing well”.' };
  assert.deepEqual(analyze(text, feedback).ranges.map(row => text.slice(row.start, row.end)), ['boy', 'doing good']);
  assert.equal(analyze(text, { annotations: [{ quote: 'invented', suggestion: 'Try this.' }] }).ranges.length, 0);
});

const row = { id: 'try-1', sentence_id: 1, kind: 'revision', text: 'A boy he go home.', checked_at: '2026-11-08T12:00:00Z', feedback: { focus: 'sentence-clarity-v1', complete: false, clear: true, correct: false, strength: 'The boy has a plan.', nextStep: 'Change “he go” to “he went”.', annotations: [{ quote: 'he go', suggestion: 'Use “he went” for the past tense.' }] } };
const settle = async () => { for (let i = 0; i < 14; i++) await new Promise(resolve => setImmediate(resolve)); };
function boot(revisions, saved = {}) {
  const dom = new JSDOM(fs.readFileSync(path.join(__dirname, 'picture-prompts/index.html'), 'utf8'), { url: 'https://example.test/picture-prompts/?topic=puppy', runScripts: 'outside-only' });
  const w = dom.window, calls = [];
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.AbortSignal = AbortSignal;
  w.WRITING_STORY_ID = 'harry-picture-puppy-v1';
  w.WRITING_CONFIG = { picture: true, partNames: ['Beginning', 'Middle', 'Ending'] };
  w.ELEPHANT_PARTS = ['Introduce the story.', 'What happens?', 'How does it end?'];
  w.localStorage.setItem('harry-meaning-ai:connection-v1', 'fixture');
  if (saved.drafts) w.localStorage.setItem('harry-writing:' + w.WRITING_STORY_ID, JSON.stringify(saved));
  w.fetch = async (url, options = {}) => {
    const action = new URL(url).searchParams.get('action'), body = options.body ? JSON.parse(options.body) : null;
    calls.push({ action, body });
    let result;
    if (action === 'work') result = { storyId: w.WRITING_STORY_ID, drafts: [], revisions, models: [], chats: saved.chats || [] };
    if (action === 'model') result = { model: { kind: 'rewrite', generation_version: 2, sentence_id: 1, revision_id: revisions.at(-1).id, source_text: row.text, text: 'A boy went home.' } };
    if (action === 'chat') result = { turn: { id: body.requestId, question: body.question, reply: body.question.startsWith("Score only Harry's") ? 'Estimated practice score: ' + (body.question.includes('Middle paragraph') ? '5/8' : '6/8') + '\n- Language: Try "hurried home" instead of "go home" if he is in a rush.\n- Detail: What did the boy notice when he got home?' : body.question.includes('6/8') ? 'The boy paused beside the box. He lifted its dusty lid and peered inside.' : body.question.includes('8/8') ? 'The boy brushed dust from the brass latch before carefully lifting the mysterious lid.' : 'What did the boy notice on his way home?', created_at: new Date(Date.UTC(2026, 10, 8, 14, 0, calls.length)).toISOString() } };
    if (action === 'draft') result = { draft: { version: 1, updated_at: '2026-11-08T14:01:00Z' } };
    return { ok: true, status: 200, json: async () => result };
  };
  for (const file of ['activity.js', 'rewrite-diff.js', 'inline-feedback.js', 'app.js']) w.eval(fs.readFileSync(path.join(__dirname, file), 'utf8'));
  return { w, d: w.document, calls, close: () => w.close() };
}

test('paragraph scoring precedes examples and keeps each part’s score and writing separate', async () => {
  const middle = 'The boy tried a key.', ending = 'He opened the box.';
  const t = boot([row], { drafts: { 2: { text: middle, version: 1 }, 3: { text: ending, version: 1 } }, revisions: [row], models: [], chats: [] });
  let saved;
  try {
    await settle();
    const button = t.d.querySelector('#score-paragraph');
    assert.equal(button.nextElementSibling.id, 'rewrite-example');
    assert.match(t.d.querySelector('#score-shortcut').nextElementSibling.textContent, /6\/8/);
    button.click(); await settle();
    const first = t.calls.find(call => call.action === 'chat').body;
    assert.deepEqual(Array.from(first.paragraphs), [row.text, middle, ending]);
    assert.match(first.question, /only Harry.s Beginning paragraph/);
    assert.match(t.d.querySelector('#score-text').textContent, /6\/8/);
    assert.equal(t.d.querySelector('#score-panel').closest('.feedback').id, 'feedback');
    assert.equal(t.d.querySelector('#revision').value, row.text);
    t.d.querySelector('#score-panel').open = false;
    t.d.querySelector('[data-part="2"]').click();
    const box = t.d.querySelector('#revision');
    box.value = middle + ' It did not fit.'; box.dispatchEvent(new t.w.Event('input'));
    assert.equal(t.d.querySelector('#score-panel').hidden, true);
    button.click(); await settle();
    const requests = t.calls.filter(call => call.action === 'chat');
    assert.equal(requests.length, 2);
    assert.notEqual(requests[0].body.requestId, requests[1].body.requestId);
    assert.equal(requests[1].body.paragraphs[1], box.value);
    assert.match(requests[1].body.question, /only Harry.s Middle paragraph/);
    assert.equal(box.value, middle + ' It did not fit.');
    assert.equal(t.d.querySelector('#score-title').textContent, 'Score & suggestion');
    assert.match(t.d.querySelector('#score-text').textContent, /5\/8/);
    t.d.querySelector('[data-part="1"]').click();
    assert.match(t.d.querySelector('#score-text').textContent, /6\/8/);
    t.d.querySelector('[data-part="3"]').click();
    assert.equal(t.d.querySelector('#score-panel').hidden, true);
    t.d.querySelector('[data-part="2"]').click();
    assert.match(t.d.querySelector('#score-text').textContent, /5\/8/);
    saved = JSON.parse(t.w.localStorage.getItem('harry-writing:' + t.w.WRITING_STORY_ID));
    assert.equal(saved.chats.length, 2);
  } finally { t.close(); }
  const reload = boot([row], saved);
  try {
    await settle();
    assert.equal(reload.d.querySelector('#score-panel').hidden, false);
    assert.match(reload.d.querySelector('#score-text').textContent, /5\/8/);
    assert.equal(reload.calls.filter(call => call.action === 'chat').length, 0);
  } finally { reload.close(); }
});

test('paragraph scoring permits unfinished surrounding paragraphs and retries a failed request with the same ID', async () => {
  const t = boot([row]);
  try {
    await settle();
    t.d.querySelector('[data-part="2"]').click();
    t.d.querySelector('#score-paragraph').click(); await settle();
    assert.equal(t.calls.filter(call => call.action === 'chat').length, 0);
    assert.match(t.d.querySelector('#error').textContent, /this paragraph before scoring/);
    const box = t.d.querySelector('#revision');
    box.value = 'He tried the key.';
    box.dispatchEvent(new t.w.Event('input'));
    const fetch = t.w.fetch, requests = [];
    t.w.fetch = async (url, options) => {
      if (new URL(url).searchParams.get('action') === 'chat') {
        requests.push(JSON.parse(options.body));
        if (requests.length === 1) return { ok: false, status: 503, json: async () => ({ error: 'Try scoring again.' }) };
      }
      return fetch(url, options);
    };
    t.d.querySelector('#score-paragraph').click(); await settle();
    assert.match(t.d.querySelector('#error').textContent, /Try scoring again/);
    t.d.querySelector('#score-paragraph').click(); await settle();
    assert.equal(requests[0].requestId, requests[1].requestId);
    assert.equal(requests[1].paragraphs[2], '');
    assert.equal(t.d.querySelector('#score-panel').hidden, false);
  } finally { t.close(); }
});

test('word goals follow the selected paragraph and count live text without limiting writing', async () => {
  const t = boot([row]);
  try {
    await settle();
    const box = t.d.querySelector('#revision'), counter = t.d.querySelector('#word-count');
    assert.equal(counter.textContent, '5 / 50 words');
    assert.equal(box.value, row.text);
    t.d.querySelector('[data-part="2"]').click();
    assert.equal(counter.textContent, '0 / 100 words');
    box.value = 'Bob’s dog ate. He said “hello”.\n$1,000 —';
    box.dispatchEvent(new t.w.Event('input'));
    assert.equal(counter.textContent, '7 / 100 words');
    const longer = Array(105).fill('word').join(' ');
    box.value = longer; box.dispatchEvent(new t.w.Event('input'));
    assert.equal(counter.textContent, '105 / 100 words');
    assert.equal(box.value, longer);
    t.d.querySelector('[data-part="3"]').click();
    assert.equal(counter.textContent, '0 / 50 words');
    assert.match(box.placeholder, /50 words.*ending/);
    t.d.querySelector('[data-part="2"]').click();
    assert.equal(counter.textContent, '105 / 100 words');
    assert.equal(box.value, longer);
    t.d.querySelector('[data-part="1"]').click();
    assert.equal(counter.textContent, '5 / 50 words');
    assert.equal(box.value, row.text);
  } finally { t.close(); }
});

test('one score action combines language and moment advice without separate checking or expansion controls', async () => {
  const t = boot([row]);
  try {
    await settle();
    for (const id of ['check', 'expand-ideas', 'feedback-check', 'expansion-panel']) assert.equal(t.d.querySelector('#' + id), null);
    assert.equal(t.d.querySelector('.actions button').id, 'score-paragraph');
    assert.deepEqual(Array.from(t.d.querySelectorAll('.actions .primary'), el => el.textContent), ['Score & suggestion', '6/8 rewrite example', '8/8 rewrite example']);
    assert.equal(t.d.querySelector('#progress').textContent, '0 of 3 paragraphs scored');
    assert.equal(t.d.querySelector('#revision-highlights mark'), null);
    t.d.querySelector('#score-paragraph').click(); await settle();
    const request = t.calls.find(call => call.action === 'chat');
    assert.match(request.body.question, /language-use advice/);
    assert.match(request.body.question, /details inside one or two moments/);
    assert.match(request.body.question, /short, optional wording improvements/);
    assert.match(request.body.question, /two or three concrete language-use bullets/);
    assert.match(request.body.question, /commas, periods, capital letters, sentence clarity, or repeated and unnecessary words/);
    assert.match(request.body.question, /Only address issues actually present/);
    assert.match(t.d.querySelector('#score-text').textContent, /Language:.*hurried home/);
    assert.match(t.d.querySelector('#score-text').textContent, /Detail:.*notice/);
    assert.equal(t.d.querySelector('#score-title').textContent, 'Score & suggestion');
    assert.equal(t.d.querySelector('#score-shortcut').textContent, 'Score & suggestion');
    assert.equal(t.d.querySelector('.editor').querySelectorAll('.feedback').length, 1);
    assert.equal(t.d.querySelector('#progress').textContent, '1 of 3 paragraphs scored');
    assert.equal(t.d.querySelector('#revision').value, row.text);
    assert.equal(t.calls.filter(call => ['check', 'model'].includes(call.action)).length, 0);
  } finally { t.close(); }
});

test('earlier checks, expansion replies and scores stay saved without reviving their removed panels or automatic requests', async () => {
  const oldIdeas = { id: 'earlier-ideas', question: 'Help Harry stretch one moment in only the Beginning paragraph below. Paragraph: ' + row.text, reply: 'Earlier detail questions.', created_at: '2026-11-08T12:00:00Z' };
  const oldScore = { id: 'earlier-score', question: "Score only Harry's Beginning paragraph out of 8 for APAAS practice. Give a brief reason for the estimate and two specific suggestions.", reply: 'Earlier estimate: 5/8.', created_at: '2026-11-08T13:00:00Z' };
  const revisions = [row, { ...row, id: 'try-2', checked_at: '2026-11-08T13:00:00Z' }];
  const t = boot(revisions, { drafts: {}, revisions, models: [], chats: [oldIdeas, oldScore] });
  try {
    await settle();
    assert.match(t.d.querySelector('#chat-history').textContent, /Earlier detail questions/);
    assert.match(t.d.querySelector('#score-text').textContent, /Earlier estimate: 5\/8/);
    assert.match(t.d.querySelector('#history-list').textContent, /he went/);
    assert.equal(t.d.querySelector('#feedback-check'), null);
    assert.equal(t.d.querySelector('#expansion-panel'), null);
    assert.equal(t.calls.filter(call => call.action !== 'work').length, 0);
    assert.equal(t.d.querySelector('#revision').value, row.text);
    t.d.querySelector('#score-paragraph').click(); await settle();
    assert.equal(t.calls.filter(call => call.action === 'chat').length, 1);
    const saved = JSON.parse(t.w.localStorage.getItem('harry-writing:' + t.w.WRITING_STORY_ID));
    assert.equal(saved.chats.length, 3);
    assert.ok(saved.chats.some(turn => turn.id === oldIdeas.id));
    assert.ok(saved.chats.some(turn => turn.id === oldScore.id));
  } finally { t.close(); }
});

test('the 6/8 paragraph example shares the green box and survives reload in saved chat history', async () => {
  const earlier = { id: 'earlier-eight', question: 'Write an 8/8 practice example of only the Beginning paragraph below.', reply: 'Earlier 8/8 example.', created_at: '2026-11-08T13:00:00Z' };
  const t = boot([row], { drafts: {}, revisions: [row], models: [], chats: [earlier] });
  let saved;
  try {
    await settle();
    assert.equal(t.d.querySelector('#rewrite-panel').hidden, true);
    assert.match(t.d.querySelector('#chat-history').textContent, /Earlier 8\/8 example/);
    t.d.querySelector('#rewrite-example').click(); await settle();
    const request = t.calls.find(call => call.action === 'chat');
    assert.match(request.body.question, /6\/8 practice example of only the Beginning paragraph/);
    assert.equal(request.body.paragraphs[0], row.text);
    assert.equal(t.d.querySelector('#rewrite-panel').closest('.feedback').id, 'feedback');
    assert.match(t.d.querySelector('#rewrite-text').textContent, /dusty lid/);
    assert.match(t.d.querySelector('#chat-history').textContent, /dusty lid/);
    assert.equal(t.d.querySelector('#revision').value, row.text);
    t.d.querySelector('#rewrite-example').click(); await settle();
    assert.equal(t.calls.filter(call => call.action === 'chat').length, 1);
    saved = JSON.parse(t.w.localStorage.getItem('harry-writing:' + t.w.WRITING_STORY_ID));
  } finally { t.close(); }
  const reload = boot([row], saved);
  try {
    await settle();
    assert.equal(reload.d.querySelector('#rewrite-panel').hidden, false);
    assert.match(reload.d.querySelector('#rewrite-text').textContent, /dusty lid/);
    assert.equal(reload.calls.filter(call => call.action === 'chat').length, 0);
  } finally { reload.close(); }
});

test('6/8 and 8/8 examples save independently and stay available while Harry rewrites', async () => {
  const t = boot([row]);
  let saved;
  try {
    await settle();
    t.d.querySelector('#rewrite-example').click();
    t.d.querySelector('#rewrite-eight').click();
    await settle();
    const requests = t.calls.filter(call => call.action === 'chat');
    assert.equal(requests.length, 2);
    assert.match(requests[0].body.question, /6\/8.*clear, attainable/);
    assert.match(requests[1].body.question, /8\/8.*Improve the connections/);
    assert.notEqual(requests[0].body.requestId, requests[1].body.requestId);
    assert.match(t.d.querySelector('#rewrite-text').textContent, /dusty lid/);
    assert.match(t.d.querySelector('#rewrite-eight-text').textContent, /brass latch/);
    t.d.querySelector('#rewrite-panel').open = false;
    const input = t.d.querySelector('#revision');
    input.value = 'A boy went home. He found a box.';
    input.dispatchEvent(new t.w.Event('input'));
    assert.equal(t.d.querySelector('#rewrite-panel').hidden, false);
    assert.equal(t.d.querySelector('#rewrite-panel').open, false);
    assert.equal(t.d.querySelector('#rewrite-eight-panel').hidden, false);
    assert.equal(t.d.querySelector('#rewrite-eight-panel').open, true);
    assert.equal(input.value, 'A boy went home. He found a box.');
    saved = JSON.parse(t.w.localStorage.getItem('harry-writing:' + t.w.WRITING_STORY_ID));
  } finally { t.close(); }
  const reload = boot([row], saved);
  try {
    await settle();
    assert.match(reload.d.querySelector('#rewrite-text').textContent, /dusty lid/);
    assert.match(reload.d.querySelector('#rewrite-eight-text').textContent, /brass latch/);
    assert.equal(reload.calls.filter(call => call.action === 'chat').length, 0);
  } finally { reload.close(); }
});
