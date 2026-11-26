const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const CACHE = 'harry-writing:harry-picture-garden-v1';
const stamp = '2026-11-11T20:00:00.000Z';
const savedDraft = (text, version = 1) => ({ sentence_id: 1, text, version, updated_at: stamp });
const settle = async () => { for (let i = 0; i < 16; i++) await new Promise(resolve => setImmediate(resolve)); };
const response = (body, status = 200) => ({ ok: status === 200, status, json: async () => body });

function boot({ local, working, olderMarkup, remote = savedDraft('Earlier writing.'), revisions = [], holdReads = false, holdSaves = false } = {}) {
  const dom = new JSDOM(fs.readFileSync(path.join(__dirname, 'picture-prompts/index.html'), 'utf8'), { url: 'https://example.test/?topic=garden', runScripts: 'outside-only' });
  const w = dom.window, reads = [], saves = [], calls = [];
  if (olderMarkup) w.document.querySelector('#use-online-draft').remove();
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.AbortSignal = AbortSignal;
  w.WRITING_STORY_ID = 'harry-picture-garden-v1';
  w.WRITING_CONFIG = { picture: true, partNames: ['Beginning', 'Middle', 'Ending'] };
  w.ELEPHANT_PARTS = ['Begin.', 'Continue.', 'End.'];
  w.localStorage.setItem('harry-meaning-ai:connection-v1', 'fixture');
  w.localStorage.setItem(CACHE, JSON.stringify({ drafts: local ? { 1: local } : {}, revisions, models: [], selected: 1 }));
  if (working) w.localStorage.setItem(CACHE + ':working:1', JSON.stringify(working));
  const work = () => ({ storyId: w.WRITING_STORY_ID, drafts: [remote], revisions, models: [], draftHistory: [], chats: [] });
  w.fetch = async (url, options = {}) => {
    const action = new URL(url).searchParams.get('action'), body = options.body && JSON.parse(options.body);
    calls.push({ action, body, keepalive: options.keepalive });
    if (action === 'work') {
      const snapshot = JSON.parse(JSON.stringify(work()));
      if (holdReads) return new Promise(resolve => reads.push(() => resolve(response(snapshot))));
      return response(snapshot);
    }
    if (action === 'draft') {
      const save = () => {
        if (body.expectedVersion !== remote.version) return response({ error: 'Another device saved a version.' }, 409);
        remote = savedDraft(body.text, remote.version + 1);
        return response({ draft: remote });
      };
      if (holdSaves) return new Promise(resolve => saves.push(() => resolve(save())));
      return save();
    }
    throw Error('Unexpected action ' + action);
  };
  for (const file of ['activity.js', 'rewrite-diff.js', 'inline-feedback.js', 'app.js']) w.eval(fs.readFileSync(path.join(__dirname, file), 'utf8'));
  return { w, d: w.document, reads, saves, calls, advanceRemote: text => { remote = savedDraft(text, remote.version + 1); }, input: w.document.querySelector('#revision'), cache: () => JSON.parse(w.localStorage.getItem(CACHE)), close: () => w.close() };
}

test('an older online version cannot replace a newer clean iPad draft', async () => {
  const t = boot({ local: savedDraft('New iPad writing.', 8), remote: savedDraft('Earlier writing.', 7) });
  try { await settle(); assert.equal(t.input.value, 'New iPad writing.'); assert.equal(t.cache().drafts[1].version, 8); assert.equal(t.calls.filter(row => row.action === 'draft').length, 0); }
  finally { t.close(); }
});

test('a delayed read arriving after autosave cannot roll back the successfully saved text', async () => {
  const t = boot({ local: savedDraft('Earlier writing.'), holdReads: true, holdSaves: true });
  try {
    t.reads.shift()(); await settle();
    t.input.value = 'My clearer writing.'; t.input.dispatchEvent(new t.w.Event('input'));
    t.w.dispatchEvent(new t.w.Event('pagehide')); await settle();
    t.w.dispatchEvent(new t.w.Event('online')); await settle();
    t.saves.shift()(); await settle();
    assert.equal(t.cache().drafts[1].version, 2);
    t.reads.shift()(); await settle();
    assert.equal(t.input.value, 'My clearer writing.');
    assert.equal(t.cache().drafts[1].version, 2);
  } finally { t.close(); }
});

test('iPad composition and pending DOM input survive a background load before the input event', async () => {
  const t = boot({ local: savedDraft('Earlier writing.'), holdReads: true });
  try {
    t.input.dispatchEvent(new t.w.Event('compositionstart'));
    t.input.value = 'Writing still being composed';
    t.reads.shift()(); await settle();
    assert.equal(t.input.value, 'Writing still being composed');
    assert.equal(t.cache().drafts[1].text, t.input.value);
    t.input.dispatchEvent(new t.w.Event('compositionend'));
    t.w.dispatchEvent(new t.w.Event('pagehide')); await settle();
    assert.equal(t.calls.find(row => row.action === 'draft').body.text, 'Writing still being composed');
    assert.equal(t.calls.find(row => row.action === 'draft').keepalive, true);
  } finally { t.close(); }
});

test('a divergent device version is kept for recovery and cannot silently replace unsaved writing', async () => {
  const t = boot({ local: { ...savedDraft('My iPad writing.'), dirty: true }, remote: savedDraft('Other device writing.', 2) });
  try {
    await settle();
    assert.equal(t.input.value, 'My iPad writing.');
    assert.equal(t.d.querySelector('#resolve-conflict').hidden, false);
    assert.ok(t.cache().draftHistory.some(row => row.text === 'Other device writing.'));
    assert.equal(t.calls.filter(row => row.action === 'draft').length, 0);
  } finally { t.close(); }
});

test('restoring a checked version preserves the displaced draft and immutable checked history', async () => {
  const checked = { id: 'checked', sentence_id: 1, kind: 'revision', text: 'A clear checked paragraph.', checked_at: '2026-11-11T19:00:00Z', feedback: { complete: true, clear: true, correct: true, strength: 'Clear.', nextStep: 'Read it.' } };
  const t = boot({ local: savedDraft('An older paragraph.'), remote: savedDraft('An older paragraph.'), revisions: [checked] });
  try {
    await settle();
    t.d.querySelector('[data-restore-check="checked"]').click(); await settle();
    assert.equal(t.input.value, checked.text);
    assert.equal(t.calls.find(row => row.action === 'draft').body.expectedVersion, 1);
    assert.ok(t.cache().draftHistory.some(row => row.text === 'An older paragraph.'));
    assert.equal(t.cache().revisions[0].text, checked.text);
    assert.match(t.d.querySelector('#writing-save-status').textContent, /Saved online/);
  } finally { t.close(); }
});

test('another tab’s unsaved copy is recoverable without replacing the active editor', async () => {
  const t = boot({ local: savedDraft('Earlier writing.') });
  try {
    await settle();
    t.input.value = 'My current iPad writing.'; t.input.dispatchEvent(new t.w.Event('input'));
    const other = { drafts: { 1: { ...savedDraft('Other tab writing.'), dirty: true } }, revisions: [] };
    t.w.dispatchEvent(new t.w.StorageEvent('storage', { key: CACHE, newValue: JSON.stringify(other) }));
    t.w.dispatchEvent(new t.w.Event('pagehide')); await settle();
    assert.equal(t.input.value, 'My current iPad writing.');
    assert.ok(t.cache().draftHistory.some(row => row.text === 'Other tab writing.'));
    assert.equal(t.calls.filter(row => row.action === 'draft').length, 0);
  } finally { t.close(); }
});

const checkedAfterDraft = { id: 'late-check', sentence_id: 1, kind: 'revision', text: 'The old text sent for checking.', checked_at: '2026-11-11T20:01:00.000Z', feedback: { complete: true, clear: true, correct: true, strength: 'Clear.', nextStep: 'Read it.' } };

test('the current saved draft wins over an older text whose AI check finished later', async () => {
  const remote = savedDraft('My newer paragraph.', 2);
  const t = boot({ remote, revisions: [checkedAfterDraft] });
  try {
    await settle();
    assert.equal(t.input.value, remote.text);
    assert.match(t.d.querySelector('#history-list').textContent, /The old text sent for checking/);
    assert.equal(t.calls.filter(call => call.action === 'draft').length, 0);
  } finally { t.close(); }
});

test('a deliberately emptied saved draft stays empty rather than restoring an old check', async () => {
  const t = boot({ remote: savedDraft('', 2), revisions: [checkedAfterDraft] });
  try { await settle(); assert.equal(t.input.value, ''); }
  finally { t.close(); }
});

test('an idle tab saving its page state preserves another tab’s pending writing as the primary draft', async () => {
  const original = savedDraft('Earlier writing.');
  const t = boot({ local: original, remote: original });
  try {
    await settle();
    const other = { ...original, text: 'Another tab has unsent writing.', dirty: true, edited_at: '2026-11-11T20:02:00.000Z' };
    // A localStorage write can become visible before its storage event reaches this tab.
    t.w.localStorage.setItem(CACHE, JSON.stringify({ ...t.cache(), drafts: { 1: other } }));
    t.d.querySelector('[data-part="2"]').click();
    assert.equal(t.cache().drafts[1].text, other.text);
    assert.equal(t.cache().drafts[1].dirty, true);
    assert.equal(t.calls.filter(call => call.action === 'draft').length, 0);
  } finally { t.close(); }
});

test('a pending draft seen in another tab is not treated as a server acknowledgement', async () => {
  const original = savedDraft('Earlier writing.');
  const t = boot({ local: original, remote: original });
  try {
    await settle();
    t.input.value = 'My unsent draft.';
    t.input.dispatchEvent(new t.w.Event('input'));
    const other = { ...t.cache(), drafts: { 1: { ...original, text: t.input.value, dirty: true } } };
    t.w.dispatchEvent(new t.w.StorageEvent('storage', { key: CACHE, newValue: JSON.stringify(other) }));
    t.w.dispatchEvent(new t.w.Event('pagehide'));
    await settle();
    assert.equal(t.calls.find(call => call.action === 'draft')?.body.text, 'My unsent draft.');
  } finally { t.close(); }
});


test('restoring an older draft cannot overwrite a newer unseen online save', async () => {
  const t = boot({ remote: savedDraft('Draft already loaded.'), revisions: [checkedAfterDraft] });
  try {
    await settle();
    t.advanceRemote('Another device saved a newer paragraph.');
    t.d.querySelector('[data-restore-check="late-check"]').click();
    await settle();
    const saves = t.calls.filter(call => call.action === 'draft');
    assert.equal(saves.length, 1);
    assert.equal(saves[0].body.expectedVersion, 1);
    assert.equal(t.input.value, checkedAfterDraft.text);
    assert.equal(t.d.querySelector('#resolve-conflict').hidden, false);
    assert.match(t.d.querySelector('#history-list').textContent, /Another device saved a newer paragraph/);
  } finally { t.close(); }
});


test('a separately protected copy survives a legacy tab rewriting the cache and an online rollback', async () => {
  const working = { ...savedDraft('Keep the paragraph Harry wrote.', 4), workingId: 'working-copy' };
  const old = savedDraft('Older text saved by a stale tab.', 5);
  const t = boot({ local: old, remote: old, working });
  try {
    assert.equal(t.input.value, working.text);
    await settle();
    assert.equal(t.input.value, working.text);
    assert.equal(t.d.querySelector('#resolve-conflict').hidden, false);
    assert.equal(t.d.querySelector('#use-online-draft').hidden, false);
    assert.match(t.d.querySelector('#history-list').textContent, /Older text saved by a stale tab/);
    assert.equal(t.calls.filter(call => call.action === 'draft').length, 0);
    t.d.querySelector('#resolve-conflict').click();
    await settle();
    const save = t.calls.find(call => call.action === 'draft');
    assert.equal(save.body.expectedVersion, 5);
    assert.equal(save.body.editorVersion, 2);
    assert.equal(save.body.text, working.text);
    assert.equal(JSON.parse(t.w.localStorage.getItem(CACHE + ':working:1')).version, 6);
  } finally { t.close(); }
});

test('choosing a competing online copy keeps the displaced draft and sends no overwrite request', async () => {
  const local = { ...savedDraft('On this device.', 4), workingId: 'working-copy' };
  const remote = savedDraft('On the other device.', 5);
  const t = boot({ local, working: local, remote });
  try {
    await settle();
    t.d.querySelector('#use-online-draft').click();
    await settle();
    assert.equal(t.input.value, remote.text);
    assert.match(t.d.querySelector('#history-list').textContent, /On this device/);
    assert.equal(t.calls.filter(call => call.action === 'draft').length, 0);
  } finally { t.close(); }
});


test('a new editor keeps saving when a browser still has the old page markup', async () => {
  const t = boot({ olderMarkup: true });
  try {
    await settle();
    t.input.value = 'My new words on the cached page.';
    t.input.dispatchEvent(new t.w.Event('input'));
    t.w.dispatchEvent(new t.w.Event('pagehide'));
    await settle();
    assert.equal(t.calls.find(call => call.action === 'draft').body.editorVersion, 2);
    assert.equal(t.cache().drafts[1].dirty, false);
  } finally { t.close(); }
});
