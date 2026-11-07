/* AI keys stay on the private service. Only a 30-day Harry session reaches this page. */
(function () {
  'use strict';
  const API = 'https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/harry-writing';
  const CONNECT = 'https://marco-10-word-meaning-trial.alexsoton.chatgpt.site/harry/writing-connect';
  const SESSION = 'harry-meaning-ai:connection-v1', PAIRING = 'harry-writing:pairing', CACHE = 'harry-writing:elephant-sections-v1';
  const $ = id => document.getElementById(id), parts = window.ELEPHANT_PARTS;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ready = row => row.feedback.complete && row.feedback.clear && row.feedback.correct;
  function read(key, storage = localStorage) { try { return storage.getItem(key); } catch { return null; } }
  function write(key, value, storage = localStorage) { try { storage.setItem(key, value); return true; } catch { return false; } }
  function remove(key, storage = localStorage) { try { storage.removeItem(key); } catch {} }
  let state;
  try { state = JSON.parse(read(CACHE)); } catch {}
  if (!state || typeof state !== 'object' || !state.drafts || !Array.isArray(state.revisions)) state = { drafts: {}, revisions: [], selected: 1 };
  let earlier = state.earlier || { drafts: [], revisions: [] };
  try {
    const old = JSON.parse(read('harry-writing:elephant-v1'));
    if (old?.drafts && Array.isArray(old.revisions)) earlier = { drafts: Object.entries(old.drafts).map(([id, row]) => ({ ...row, sentence_id: Number(id) })), revisions: old.revisions };
  } catch {}
  let selected = Number(location.hash.match(/^#part-(\d+)$/)?.[1] || state.selected || 1);
  if (!Number.isInteger(selected) || selected < 1 || selected > parts.length) selected = 1;
  let connected = false, busy = false, saving = false, loaded = false, saveTimer, memoryOnly = false, feedbackSelection = null;
  const conflicts = new Set();
  function cache() { state.selected = selected; memoryOnly = !write(CACHE, JSON.stringify(state)); }
  function draft(id) { return state.drafts[id] ||= { text: '', version: 0, dirty: false }; }
  function revisions(id) { return state.revisions.filter(row => row.sentence_id === id).sort((a, b) => a.checked_at.localeCompare(b.checked_at) || a.id.localeCompare(b.id)); }
  function latest(id) { return revisions(id).filter(row => row.kind === 'revision').at(-1); }
  function addRevision(row) { if (!state.revisions.some(item => item.id === row.id)) state.revisions.push(row); cache(); }
  function error(message = '') { $('error').hidden = !message; $('error').textContent = message; }
  function setConnection(message) {
    $('connection-status').textContent = message;
    $('connect').textContent = connected ? 'Reconnect AI checking' : 'Connect AI checking';
  }
  if (location.hash.includes('&ai_session=')) {
    const query = new URLSearchParams(location.hash.split('&').slice(1).join('&'));
    const token = query.get('ai_session'), pairing = query.get('ai_state');
    history.replaceState(null, '', location.pathname + '#part-' + selected);
    if (token && pairing && pairing === read(PAIRING, sessionStorage)) { write(SESSION, token); remove(PAIRING, sessionStorage); }
    else error('The connection could not be confirmed. Please connect again.');
  }
  async function request(action, body) {
    let response;
    try {
      response = await fetch(API + '?action=' + action, { method: body ? 'POST' : 'GET', headers: { authorization: 'Bearer ' + (read(SESSION) || ''), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify({ ...body, storyId: window.WRITING_STORY_ID }) : undefined, signal: AbortSignal.timeout(55000), cache: 'no-store' });
    } catch { throw Error('Could not finish connecting. Your typing is kept on this device. Try again.'); }
    const result = await response.json();
    if (response.status === 401) {
      connected = false; loaded = false; remove(SESSION);
      setConnection('Please reconnect AI checking. Your typing is kept on this device.');
    }
    if (!response.ok) { const failure = Error(result.error || 'Could not save your work. Please try again.'); failure.status = response.status; throw failure; }
    return result;
  }
  function showSaveStatus() {
    const row = draft(selected), conflict = conflicts.has(selected);
    $('resolve-conflict').hidden = !conflict;
    $('save-status').textContent = memoryOnly ? 'Browser storage is unavailable. Keep this page open until your work saves online.' : conflict ? 'Another device has a different draft. Your version is kept here.' : row.dirty ? (connected ? 'Kept on this device · waiting to save online…' : 'Kept on this device · connect to save online') : row.version ? 'Draft saved online and on this device.' : 'Your original will stay unchanged.';
  }
  function renderFeedback() {
    const row = feedbackSelection || revisions(selected).at(-1), host = $('feedback');
    host.hidden = !row;
    if (row) {
      const current = row.text === draft(selected).text.trim(), feedback = row.feedback;
      host.innerHTML = `<h3>${row.kind === 'guide' ? 'A hint for your original' : 'Feedback on your rewrite'}</h3><div class="checks">${['complete', 'clear', 'correct'].map(key => `<span class="${feedback[key] ? 'good' : 'ok'}">${feedback[key] ? '✓' : '○'} ${key[0].toUpperCase() + key.slice(1)}</span>`).join('')}</div><p><strong>Works well</strong><br>${escape(feedback.strength)}</p><p><strong>Try next</strong><br>${escape(feedback.nextStep)}</p><p class="small">${row.kind === 'guide' ? 'Now write your own version. You choose the words.' : current ? (ready(row) ? 'Clear on this try. Read it with the nearby sentences.' : 'Make one change, then check again.') : 'This feedback is for your last checked version. Check again when your changes are ready.'}</p>`;
    }
    const history = revisions(selected).slice().reverse();
    $('history-count').textContent = '(' + history.length + ')';
    $('history-list').innerHTML = history.map(row => `<article><p class="small">${row.kind === 'guide' ? 'Hint on the original' : 'Harry’s rewrite'} · ${escape(new Date(row.checked_at).toLocaleString())}</p><p>${escape(row.text)}</p><p class="small"><strong>Works well</strong> ${escape(row.feedback.strength)}</p><p class="small"><strong>Try next</strong> ${escape(row.feedback.nextStep)}</p></article>`).join('');
  }
  function renderOverview() {
    const checked = parts.filter((_, index) => latest(index + 1));
    $('progress').textContent = `${checked.length} of ${parts.length} sections revised`;
    $('part-list').innerHTML = parts.map((_, index) => {
      const id = index + 1, row = latest(id);
      return `<button type="button" data-part="${id}" class="${id === selected ? 'active ' : ''}${row ? 'revised' : ''}" aria-label="Section ${id}${row ? ', revised' : ', not revised'}" ${id === selected ? 'aria-current="step"' : ''} ${busy ? 'disabled' : ''}>${id}</button>`;
    }).join('');
    const revised = parts.map((text, index) => latest(index + 1)?.text || text);
    $('revised-story').innerHTML = revised.map(text => '<p>' + escape(text) + '</p>').join('');
  }
  function render() {
    $('part-number').textContent = `SECTION ${selected} OF ${parts.length} · ${window.SECTION_TITLES[selected - 1]}`;
    $('original').textContent = parts[selected - 1];
    $('revision').value = draft(selected).text;
    const context = id => latest(id)?.text || parts[id - 1];
    $('nearby').innerHTML = (selected > 1 ? '<p><strong>Before</strong> ' + escape(context(selected - 1)) + '</p>' : '') + (selected < parts.length ? '<p><strong>After</strong> ' + escape(context(selected + 1)) + '</p>' : '');
    $('next').disabled = busy || selected === parts.length;
    $('revision').disabled = busy;
    $('check').disabled = busy;
    $('guide').disabled = busy;
    $('use-original').hidden = Boolean(draft(selected).text);
    $('use-original').disabled = busy;
    $('check').textContent = busy ? 'Checking…' : latest(selected) ? 'Check my next try' : 'Check my writing';
    renderOverview(); renderFeedback(); showSaveStatus();
  }
  async function loadWork() {
    const work = await request('work');
    if (work.storyId !== window.WRITING_STORY_ID) throw Error('The writing page has changed. Reload to load the short sections.');
    if (work.earlierSentencePractice) {
      const rows = new Map(earlier.drafts.map(row => [row.sentence_id, row]));
      for (const row of work.earlierSentencePractice.drafts) if (!rows.get(row.sentence_id)?.dirty) rows.set(row.sentence_id, row);
      const history = new Map(earlier.revisions.map(row => [row.id, row]));
      for (const row of work.earlierSentencePractice.revisions) history.set(row.id, row);
      earlier = { drafts: Array.from(rows.values()), revisions: Array.from(history.values()) }; state.earlier = earlier;
    }
    for (const remote of work.drafts) {
      const local = draft(remote.sentence_id);
      if (!local.dirty) state.drafts[remote.sentence_id] = { text: remote.text, version: remote.version, dirty: false };
      else if (local.text === remote.text) { local.version = remote.version; local.dirty = false; conflicts.delete(remote.sentence_id); }
      else if (local.version !== remote.version) conflicts.add(remote.sentence_id);
    }
    for (const row of work.revisions) addRevision(row);
    importEarlier();
    connected = true; loaded = true; cache();
    setConnection('Connected · drafts and every checked try save online. Connection lasts 30 days.');
    render();
  }
  async function saveDrafts() {
    if (saving || !connected || !loaded) return;
    saving = true;
    let failed = false;
    try {
      for (const [key, row] of Object.entries(state.drafts)) {
        const id = Number(key);
        if (!row.dirty || conflicts.has(id)) continue;
        const text = row.text;
        try {
          const result = await request('draft', { sentenceId: id, text, expectedVersion: row.version });
          row.version = result.draft.version;
          row.dirty = row.text !== text;
          cache();
        } catch (failure) {
          if (failure.status === 409) { conflicts.add(id); await loadWork(); }
          else { failed = true; error(failure.message); break; }
        }
      }
    } finally { saving = false; showSaveStatus(); }
    if (!failed && connected && Object.entries(state.drafts).some(([id, row]) => row.dirty && !conflicts.has(Number(id)))) saveTimer = setTimeout(saveDrafts, 1800);
  }
  $('revision').addEventListener('input', () => {
    const row = draft(selected); row.text = $('revision').value; row.dirty = true;
    if (row.pending && row.pending.text !== row.text.trim()) delete row.pending;
    $('use-original').hidden = Boolean(row.text);
    cache(); showSaveStatus(); renderFeedback(); clearTimeout(saveTimer); saveTimer = setTimeout(saveDrafts, 900);
  });
  $('use-original').addEventListener('click', () => {
    if (draft(selected).text || busy) return;
    $('revision').value = parts[selected - 1]; $('revision').dispatchEvent(new Event('input')); $('use-original').hidden = true; $('revision').focus();
  });
  function choose(id) {
    if (busy) return;
    selected = id; feedbackSelection = null; cache(); error(); history.replaceState(null, '', '#part-' + id); $('history').open = false; render();
  }
  $('part-list').addEventListener('click', event => { const button = event.target.closest('[data-part]'); if (button) choose(Number(button.dataset.part)); });
  $('next').addEventListener('click', () => { if (selected < parts.length) choose(selected + 1); });
  $('connect').addEventListener('click', () => {
    cache(); const pairing = crypto.randomUUID();
    if (!write(PAIRING, pairing, sessionStorage)) return error('Please allow browser storage to connect AI checking.');
    location.assign(CONNECT + '?state=' + pairing);
  });
  $('resolve-conflict').addEventListener('click', async () => {
    const id = selected;
    try {
      const work = await request('work'), remote = work.drafts.find(row => row.sentence_id === id);
      draft(id).version = remote?.version || 0; conflicts.delete(id); cache(); await saveDrafts();
    } catch (failure) { error(failure.message); }
  });
  async function check(kind) {
    error(); const row = draft(selected), text = kind === 'guide' ? parts[selected - 1] : row.text.trim();
    if (!text) return error('Write your version first.');
    if (!connected) return error('Connect AI checking first. Your draft is kept on this device.');
    const savedHint = kind === 'guide' && revisions(selected).find(item => item.kind === 'guide');
    if (savedHint) { feedbackSelection = savedHint; renderFeedback(); $('feedback').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (!row.pending || row.pending.text !== text || row.pending.kind !== kind) row.pending = { requestId: crypto.randomUUID(), text, kind };
    cache(); busy = true; render();
    try {
      const result = await request('check', { sentenceId: selected, ...row.pending });
      addRevision(result.revision); feedbackSelection = result.revision; delete row.pending; cache();
    } catch (failure) { error(failure.message); }
    finally { busy = false; render(); if (kind === 'guide') $('feedback').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
  $('check').addEventListener('click', () => check('revision'));
  $('guide').addEventListener('click', () => check('guide'));
  let timerEnd = 0, remaining = 30 * 60;
  function renderTimer() {
    if (timerEnd) remaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
    $('timer').textContent = Math.floor(remaining / 60).toString().padStart(2, '0') + ':' + (remaining % 60).toString().padStart(2, '0');
    if (!remaining) { timerEnd = 0; $('timer-toggle').textContent = 'Start another 30 minutes'; }
  }
  $('timer-toggle').addEventListener('click', () => {
    if (timerEnd) { renderTimer(); timerEnd = 0; $('timer-toggle').textContent = 'Continue timer'; }
    else { if (!remaining) remaining = 30 * 60; timerEnd = Date.now() + remaining * 1000; $('timer-toggle').textContent = 'Pause timer'; }
    renderTimer();
  });
  setInterval(renderTimer, 1000);
  function importEarlier() {
    if (!earlier.drafts.length && !earlier.revisions.length) return;
    const existing = id => earlier.drafts.find(row => row.sentence_id === id && row.text.trim())?.text || earlier.revisions.filter(row => row.sentence_id === id && row.kind === 'revision').at(-1)?.text;
    window.SECTION_RANGES.forEach(([start, end], index) => {
      const row = draft(index + 1);
      if (!row.text && !row.version && !row.dirty && !latest(index + 1) && window.ORIGINAL_SENTENCES.slice(start, end).some((_, offset) => existing(start + offset + 1))) {
        row.text = window.ORIGINAL_SENTENCES.slice(start, end).map((text, offset) => existing(start + offset + 1) || text).join('\n'); row.dirty = true;
      }
    });
    state.earlier = earlier; cache(); $('earlier-practice').hidden = false;
    $('earlier-practice-list').innerHTML = earlier.drafts.filter(row => row.text.trim()).map(row => `<p><strong>Earlier part ${row.sentence_id} draft</strong><br>${escape(row.text)}</p>`).join('') + earlier.revisions.map(row => `<p><strong>Earlier part ${row.sentence_id} · ${row.kind === 'guide' ? 'Original hint' : 'Checked rewrite'}</strong><br>${escape(row.text)}<br><span class="small">${escape(row.feedback.strength)} ${escape(row.feedback.nextStep)}</span></p>`).join('');
  }
  $('original-story').textContent = parts.join(' ');
  importEarlier();
  render();
  if (read(SESSION)) loadWork().then(saveDrafts).catch(failure => { error(failure.message); setConnection('Saved work could not load. Your typing is kept on this device. Connect again or reload.'); });
  window.addEventListener('online', () => { if (read(SESSION)) loadWork().then(saveDrafts).catch(failure => error(failure.message)); });
})();
