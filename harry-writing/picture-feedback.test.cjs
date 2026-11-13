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
    if (action === 'chat') result = { turn: { id: body.requestId, question: body.question, reply: body.question.includes('6/8') ? 'The boy paused beside the box. He lifted its dusty lid and peered inside.' : 'What did the boy notice on his way home?', created_at: '2026-11-08T14:00:00Z' } };
    if (action === 'draft') result = { draft: { version: 1, updated_at: '2026-11-08T14:01:00Z' } };
    return { ok: true, status: 200, json: async () => result };
  };
  for (const file of ['activity.js', 'rewrite-diff.js', 'inline-feedback.js', 'app.js']) w.eval(fs.readFileSync(path.join(__dirname, file), 'utf8'));
  return { w, d: w.document, calls, close: () => w.close() };
}

test('picture feedback skips the checklist, highlights text, expands automatically and offers actual expansion ideas', async () => {
  const t = boot([row]);
  try {
    await settle();
    assert.equal(t.d.querySelector('#guide'), null);
    assert.equal(t.d.querySelector('#resize-revision'), null);
    assert.equal(t.d.querySelector('#show-model'), null);
    assert.equal(t.d.querySelector('#revision-highlights mark').textContent, 'he go');
    assert.doesNotMatch(t.d.querySelector('#feedback').textContent, /Works well|Complete sentences|Correct language/);
    assert.equal(t.d.querySelector('#revision').style.height, '240px');
    t.d.querySelector('[data-note]').click();
    const box = t.d.querySelector('#revision');
    assert.equal(box.value.slice(box.selectionStart, box.selectionEnd), 'he go');
    t.d.querySelector('#expand-ideas').click(); await settle();
    assert.match(t.calls.find(call => call.action === 'chat').body.question, /only the Beginning paragraph/);
    assert.match(t.d.querySelector('#expansion-text').textContent, /notice/);
    assert.equal(t.d.querySelector('#expansion-panel').hidden, false);
    assert.equal(t.d.querySelector('#expansion-panel').closest('.feedback').id, 'feedback');
    assert.equal(t.d.querySelector('.editor').querySelectorAll('.feedback').length, 1);
    assert.equal(t.calls.filter(call => call.action === 'model').length, 0);
    box.value = 'A boy went home.'; box.dispatchEvent(new t.w.Event('input'));
    assert.equal(t.d.querySelector('#revision-highlights mark'), null);
    assert.equal(t.d.querySelector('#expansion-panel').hidden, false);
    assert.equal(t.d.querySelector('#expansion-reference').hidden, false);
  } finally { t.close(); }
});

test('a second unsuccessful version puts a corrected sentence inside its highlighted feedback', async () => {
  const t = boot([{ ...row, text: 'A boy go home.' }, { ...row, id: 'try-2', checked_at: '2026-11-08T13:00:00Z' }]);
  try {
    await settle();
    assert.equal(t.calls.filter(call => call.action === 'model').length, 1);
    assert.equal(t.d.querySelector('#model-panel'), null);
    assert.match(t.d.querySelector('#feedback .correction-example').textContent, /A boy went home\./);
    assert.equal(t.d.querySelector('.rewrite').nextElementSibling.id, 'feedback');
    assert.ok(t.d.querySelector('#feedback').compareDocumentPosition(t.d.querySelector('.actions')) & t.w.Node.DOCUMENT_POSITION_FOLLOWING);
    const box = t.d.querySelector('#revision');
    box.value = 'Another draft.'; box.dispatchEvent(new t.w.Event('input'));
    assert.equal(t.d.querySelector('#feedback .correction-example'), null);
  } finally { t.close(); }
});


test('rechecking an unchanged paragraph does not count as another modification', async () => {
  const t = boot([row, { ...row, id: 'try-2', checked_at: '2026-11-08T13:00:00Z' }]);
  try {
    await settle();
    assert.equal(t.calls.filter(call => call.action === 'model').length, 0);
    assert.equal(t.d.querySelector('#model-panel'), null);
    assert.equal(t.d.querySelector('.rewrite').nextElementSibling.id, 'feedback');
  } finally { t.close(); }
});

test('earlier grammar feedback is saved while the main box requests a sentence clarity check', async () => {
  const legacy = { ...row, feedback: { ...row.feedback, focus: undefined } };
  const t = boot([legacy]);
  try {
    await settle();
    assert.match(t.d.querySelector('#feedback-check').textContent, /periods, commas, sentence breaks, and clear meaning/);
    assert.doesNotMatch(t.d.querySelector('#feedback-check').textContent, /he went/);
    assert.equal(t.d.querySelector('#revision-highlights mark'), null);
    assert.match(t.d.querySelector('#history-list').textContent, /he went/);
    assert.equal(t.d.querySelector('#revision').value, row.text);
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
