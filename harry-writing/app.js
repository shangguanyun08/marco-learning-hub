/* AI keys stay on the private service. Only a 30-day Harry session reaches this page. */
(function () {
  'use strict';
  const API = 'https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/harry-writing';
  const CONNECT = 'https://marco-10-word-meaning-trial.alexsoton.chatgpt.site/harry/writing-connect';
  const config = window.WRITING_CONFIG || {}, isPicture = Boolean(config.picture);
  const SESSION = 'harry-meaning-ai:connection-v1', PAIRING = 'harry-writing:pairing', CACHE = 'harry-writing:' + window.WRITING_STORY_ID;
  const $ = id => document.getElementById(id), parts = window.ELEPHANT_PARTS;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function suggestionList(text) {
    const lines = String(text || '').split(/\r?\n/).map(line => line.replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/, '').trim()).filter(Boolean);
    return '<ul class="next-steps">' + lines.map(line => '<li>' + escape(line) + '</li>').join('') + '</ul>';
  }
  function read(key, storage = localStorage) { try { return storage.getItem(key); } catch { return null; } }
  function write(key, value, storage = localStorage) { try { storage.setItem(key, value); return true; } catch { return false; } }
  function remove(key, storage = localStorage) { try { storage.removeItem(key); } catch {} }
  let state;
  try { state = JSON.parse(read(CACHE)); } catch {}
  if (!state || typeof state !== 'object' || !state.drafts || !Array.isArray(state.revisions)) state = { drafts: {}, revisions: [], selected: 1 };
  if (!Array.isArray(state.models)) state.models = [];
  if (!Array.isArray(state.draftHistory)) state.draftHistory = [];
  for (const row of state.draftHistory) row.recovery_id ||= crypto.randomUUID();
  let earlier = (!isPicture && state.earlier) || { drafts: [], revisions: [] };
  try {
    const old = !isPicture && JSON.parse(read('harry-writing:elephant-v1'));
    if (old?.drafts && Array.isArray(old.revisions)) earlier = { drafts: Object.entries(old.drafts).map(([id, row]) => ({ ...row, sentence_id: Number(id) })), revisions: old.revisions };
  } catch {}
  let selected = Number(location.hash.match(/^#part-(\d+)$/)?.[1] || state.selected || 1);
  if (!Number.isInteger(selected) || selected < 1 || selected > parts.length) selected = 1;
  let connected = false, busy = false, saving = false, loaded = false, saveTimer, memoryOnly = false, feedbackSelection = null, makingModel = false, expandingIdeas = false;
  let writingChatUI = null;
  const conflicts = new Set();
  let displayedPart = null, displayedText = '', composing = false;
  function rememberDraft(id, row, archived = false) {
    if (typeof row.text !== 'string') return;
    const existing = state.draftHistory.find(item => item.sentence_id === id && item.version === row.version && item.text === row.text);
    if (existing) { existing.archived ||= archived; return; }
    state.draftHistory.push({ recovery_id: row.recovery_id || crypto.randomUUID(), sentence_id: id, text: row.text, version: row.version || 0, updated_at: row.edited_at || row.updated_at || new Date().toISOString(), archived });
  }
  function cache() {
    // Another open tab may have cached writing since this tab last rendered.
    let other;
    try { other = JSON.parse(read(CACHE)); } catch {}
    for (const [id, row] of Object.entries(other?.drafts || {})) {
      if (row.text && row.text !== state.drafts[id]?.text) rememberDraft(Number(id), row);
    }
    for (const row of other?.draftHistory || []) rememberDraft(row.sentence_id, row, row.archived);
    for (const row of other?.revisions || []) if (!state.revisions.some(item => item.id === row.id)) state.revisions.push(row);
    state.selected = selected;
    // Older online versions remain in the database. Keep local-only backups.
    const counts = new Map();
    state.draftHistory.sort((a, b) => b.version - a.version);
    state.draftHistory = state.draftHistory.filter(row => {
      if (!row.archived) return true;
      const count = (counts.get(row.sentence_id) || 0) + 1;
      counts.set(row.sentence_id, count);
      return count <= 20;
    });
    memoryOnly = !write(CACHE, JSON.stringify(state));
  }
  function draft(id) { return state.drafts[id] ||= { text: '', version: 0, dirty: false }; }
  function editorText(id) { const row = draft(id), checked = latest(id); return row.dirty || !checked || row.updated_at > checked.checked_at ? row.text : checked.text; }
  function captureEditor() {
    if (displayedPart === null || $('revision').value === displayedText) return;
    const row = draft(displayedPart);
    if (!row.dirty && row.text) rememberDraft(displayedPart, row);
    row.text = $('revision').value;
    row.dirty = true;
    row.edited_at = new Date().toISOString();
    displayedText = row.text;
    if (row.pending && row.pending.text !== row.text.trim()) delete row.pending;
    cache();
  }
  function mergeDraft(remote) {
    const local = draft(remote.sentence_id);
    if (remote.version < local.version) return;
    if (local.text === remote.text) {
      local.version = remote.version;
      local.updated_at = remote.updated_at;
      local.dirty = false;
      conflicts.delete(remote.sentence_id);
    } else if (local.dirty || (local.version > 0 && local.version === remote.version)) {
      rememberDraft(remote.sentence_id, remote);
      if (local.version !== remote.version || !local.dirty) conflicts.add(remote.sentence_id);
    } else {
      if (local.text) rememberDraft(remote.sentence_id, local);
      Object.assign(local, { text: remote.text, version: remote.version, updated_at: remote.updated_at, dirty: false });
    }
  }
  function revisions(id) { return state.revisions.filter(row => row.sentence_id === id).sort((a, b) => a.checked_at.localeCompare(b.checked_at) || a.id.localeCompare(b.id)); }
  function latest(id) { return revisions(id).filter(row => row.kind === 'revision').at(-1); }
  function addRevision(row) { if (!state.revisions.some(item => item.id === row.id)) state.revisions.push(row); cache(); }
  function rememberModel(row) { state.models = state.models.filter(item => item.revision_id !== row.revision_id || item.kind !== row.kind).concat(row); cache(); }
  function error(message = '') { $('error').hidden = !message; $('error').textContent = message; }
  function updateConnectionButton() {
    $('connect').textContent = connected ? 'Connected' : 'Connect AI checking';
    writingChatUI?.updateConnection();
  }
  if (location.hash.includes('&ai_session=')) {
    const query = new URLSearchParams(location.hash.split('&').slice(1).join('&'));
    const token = query.get('ai_session'), pairing = query.get('ai_state');
    history.replaceState(null, '', location.pathname + location.search + '#part-' + selected);
    if (token && pairing && pairing === read(PAIRING, sessionStorage)) { write(SESSION, token); remove(PAIRING, sessionStorage); }
    else error('The connection could not be confirmed. Please connect again.');
  }
  async function request(action, body) {
    let response;
    try {
      response = await fetch(API + '?action=' + action + (isPicture && action === 'work' ? '&storyId=' + encodeURIComponent(window.WRITING_STORY_ID) : ''), { method: body ? 'POST' : 'GET', keepalive: action === 'draft', headers: { authorization: 'Bearer ' + (read(SESSION) || ''), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify({ ...body, storyId: window.WRITING_STORY_ID, ...(config.custom && !Object.hasOwn(body, 'topicTitle') ? { topicTitle: draft(0).text } : {}) }) : undefined, signal: AbortSignal.timeout(55000), cache: 'no-store' });
    } catch { throw Error('Could not finish connecting. Your typing is kept on this device. Try again.'); }
    const result = await response.json();
    if (response.status === 401) {
      connected = false; loaded = false; remove(SESSION);
      updateConnectionButton();
    }
    if (!response.ok) { const failure = Error(result.error || 'Could not save your work. Please try again.'); failure.status = response.status; throw failure; }
    return result;
  }
  function updateDraftControls() {
    $('resolve-conflict').hidden = !conflicts.has(selected) && !conflicts.has(0);
    const status = $('writing-save-status');
    if (status) status.textContent = conflicts.size ? 'Another version is saved. Choose a version below.' : saving ? 'Saving online…' : Object.values(state.drafts).some(row => row.dirty) ? 'Saved on this device · waiting to save online' : connected ? 'Saved online' : 'Saved on this device · connect to save online';
    if (memoryOnly) error('Browser storage is unavailable. Keep this page open until your work saves online.');
  }
  function resizeRevision() {
    if (!isPicture) return;
    const box = $('revision');
    box.style.height = 'auto';
    box.style.height = Math.max(240, box.scrollHeight + 2) + 'px';
  }
  function writingNotes(row) {
    const model = repeatedDifficulty() && row.id === latest(selected)?.id ? currentModel() : null;
    return window.WritingInlineFeedback(row.text, row.feedback, model?.text, model ? window.WritingRewriteDiff(row.text, model.text) : []);
  }
  function renderWritingHighlights(row) {
    if (!isPicture) return;
    const host = $('revision-highlights'), text = $('revision').value;
    host.replaceChildren();
    const plan = row && text.trim() === row.text ? writingNotes(row) : { ranges: [] };
    const offset = text.indexOf(text.trim());
    let cursor = 0;
    for (const range of plan.ranges) {
      const start = range.start + offset, end = range.end + offset;
      host.append(text.slice(cursor, start));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(start, end);
      host.append(mark);
      cursor = end;
    }
    host.append(text.slice(cursor) + '\n');
  }
  function repeatedDifficulty() {
    const checked = revisions(selected).filter(row => row.kind === 'revision');
    const tries = checked.filter((row, index) => index === 0 || row.text !== checked[index - 1].text).slice(-2);
    return tries.length === 2 && tries.every(row => !row.feedback.complete || !row.feedback.clear || !row.feedback.correct);
  }
  function expansionQuestion() {
    return 'Suggest three short, concrete ideas or details Harry could add to only the ' + config.partNames[selected - 1] + ' paragraph below. Use his actual characters and events. Offer choices as questions or optional details, using simple words for Harry. Do not rewrite the paragraph or give grammar feedback. Paragraph: ' + editorText(selected).trim();
  }
  function renderExpansion() {
    if (!isPicture) return;
    const turn = (state.chats || []).filter(row => row.question === expansionQuestion()).at(-1);
    $('expansion-panel').hidden = !turn;
    $('expansion-text').textContent = turn?.reply || '';
    $('expand-ideas').disabled = busy || expandingIdeas;
    $('expand-ideas').textContent = expandingIdeas ? 'Finding ideas…' : 'Idea/detail expansion';
    $('expand-ideas').setAttribute('aria-expanded', String(Boolean(turn)));
  }
  function renderFeedback() {
    const hint = revisions(selected).find(row => row.kind === 'guide');
    $('hint').hidden = isPicture || !hint;
    $('hint').innerHTML = hint ? suggestionList(hint.feedback.nextStep) : '';
    const row = feedbackSelection?.kind === 'revision' ? feedbackSelection : latest(selected), host = $('feedback');
    host.hidden = !row;
    if (row) {
      const feedback = row.feedback;
      if (isPicture) {
        const plan = writingNotes(row);
        const needsWork = !feedback.complete || !feedback.clear || !feedback.correct;
        host.innerHTML = `<h3>${needsWork ? 'Re-work the highlighted words' : 'Your paragraph is clear'}</h3>${editorText(selected).trim() !== row.text ? '<p class="small">These suggestions are from your last check. Check your changes when ready.</p>' : ''}<ol class="inline-suggestions">${plan.notes.map(note => `<li>${note.start >= 0 ? `<button type="button" class="quote-link" data-note="${note.index}"><mark>${escape(note.quote)}</mark></button> ` : ''}${escape(note.suggestion)}${note.correction ? `<p class="correction-example"><strong>Correct example</strong> ${escape(note.correction)}</p>` : ''}</li>`).join('')}</ol>`;
      } else {
      host.innerHTML = `<h3>${editorText(selected).trim() === row.text ? 'Feedback on your rewrite' : 'Feedback on your last check'}</h3><div class="checks">${[['complete', 'Complete sentences'], ['clear', 'Clear meaning'], ['correct', 'Correct language']].map(([key, label]) => `<span class="${feedback[key] ? 'good' : 'bad'}"><span aria-hidden="true">${feedback[key] ? '✓' : '✗'}</span> ${label}<span class="sr-only">: ${feedback[key] ? 'Right' : 'Wrong'}</span></span>`).join('')}</div><p><strong>Works well</strong><br>${escape(feedback.strength)}</p><div class="suggestions"><strong>Try next</strong>${suggestionList(feedback.nextStep)}</div><p class="small">Read your rewrite, then compare it with the re-write example.</p>`;
      }
    }
    renderWritingHighlights(row);
    const history = revisions(selected).slice().reverse();
    $('history-count').textContent = '(' + history.length + ')';
    $('history-list').innerHTML = history.map(row => `<article><p class="small">${row.kind === 'guide' ? 'Hint on the original' : 'Harry’s rewrite'} · ${escape(new Date(row.checked_at).toLocaleString())}</p><p>${escape(row.text)}</p>${isPicture ? '' : `<p class="small"><strong>Works well</strong> ${escape(row.feedback.strength)}</p>`}<div class="small suggestions"><strong>Try next</strong>${suggestionList(row.feedback.nextStep)}</div>${row.kind === 'revision' ? `<button type="button" class="quiet" data-restore-check="${escape(row.id)}">Use this version</button>` : ''}</article>`).join('');
    const savedDrafts = state.draftHistory.filter(row => row.sentence_id === selected && row.text !== editorText(selected)).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    for (const row of savedDrafts) {
      const article = document.createElement('article'), date = document.createElement('p'), text = document.createElement('p'), button = document.createElement('button');
      date.className = 'small';
      date.textContent = 'Saved draft · ' + new Date(row.updated_at).toLocaleString();
      text.textContent = row.text;
      button.className = 'quiet';
      button.type = 'button';
      button.textContent = 'Use this version';
      button.dataset.restoreDraft = row.recovery_id;
      article.append(date, text, button);
      $('history-list').append(article);
    }
    $('history-count').textContent = '(' + (history.length + savedDrafts.length) + ')';
  }
  function renderOverview() {
    if (isPicture) {
      const hasWriting = Object.entries(state.drafts).some(([id, row]) => Number(id) > 0 && row.text.trim()) || state.revisions.some(row => row.kind === 'revision');
      window.WritingActivity.render($('last-writing-attempt'), window.WritingActivity.latest(state), hasWriting ? 'Writing date not recorded' : 'Not started yet');
    }
    const checked = parts.filter((_, index) => latest(index + 1));
    $('progress').textContent = `${checked.length} of ${parts.length} ${isPicture ? 'paragraphs checked' : 'sections revised'}`;
    $('part-list').innerHTML = parts.map((_, index) => {
      const id = index + 1, row = latest(id);
      return `<button type="button" data-part="${id}" class="${id === selected ? 'active ' : ''}${row ? 'revised' : ''}" aria-label="${isPicture ? config.partNames[index] : 'Section ' + id}${row ? ', revised' : ', not revised'}" ${id === selected ? 'aria-current="step"' : ''} ${busy ? 'disabled' : ''}>${isPicture ? config.partNames[index] : id}</button>`;
    }).join('');
    const revised = parts.map((text, index) => isPicture ? editorText(index + 1) : latest(index + 1)?.text || text);
    $('revised-story').innerHTML = revised.map((text, index) => text ? '<p>' + escape(text) + '</p>' : '<p class="small">' + escape(config.partNames[index]) + ' paragraph — not written yet.</p>').join('');
  }
  function currentModel() {
    const checked = latest(selected);
    return state.models.find(row => row.kind === 'rewrite' && row.generation_version === 2 && row.sentence_id === selected && row.revision_id === checked?.id && row.source_text === editorText(selected).trim());
  }
  function renderModel() {
    if (isPicture) return;
    const checked = latest(selected), model = isPicture && !repeatedDifficulty() ? null : currentModel();
    if ($('show-model')) {
    $('show-model').hidden = !checked;
    $('show-model').disabled = busy;
    $('show-model').textContent = makingModel ? 'Making example…' : 'Show re-write example';
    $('show-model').setAttribute('aria-expanded', String(Boolean(model)));
    }
    $('model-panel').hidden = !model;
    const modelText = $('model-text'), removedText = $('model-removed-text');
    modelText.replaceChildren();
    removedText.replaceChildren();
    const changes = model ? window.WritingRewriteDiff(model.source_text, model.text) : [];
    for (const change of changes) {
      if (change.kind === 'remove') {
        if (!change.text.trim()) continue;
        if (removedText.hasChildNodes()) removedText.append(' · ');
        const removed = document.createElement('del');
        removed.textContent = change.text.trim();
        removedText.append(removed);
      } else if (change.kind === 'add' && change.text.trim()) {
        const added = document.createElement('mark');
        added.textContent = change.text;
        modelText.append(added);
      } else {
        modelText.append(change.text);
      }
    }
    $('model-removed').hidden = !removedText.hasChildNodes();
  }
  function render() {
    captureEditor();
    const checked = latest(selected);
    $('part-number').textContent = isPicture ? `${config.partNames[selected - 1].toUpperCase()} · PARAGRAPH ${selected} OF ${parts.length}` : `SECTION ${selected} OF ${parts.length}`;
    $('original').textContent = parts[selected - 1];
    if (!composing) {
      $('revision').value = editorText(selected);
      displayedPart = selected;
      displayedText = $('revision').value;
    }
    if (config.custom) { $('topic-title').value = draft(0).text; $('topic-title').disabled = busy; }
    $('revision').readOnly = false;
    $('next').disabled = busy || selected === parts.length;
    if (!composing) $('revision').disabled = busy;
    $('check').disabled = busy;
    $('check').hidden = false;
    renderModel();
    if ($('guide')) $('guide').disabled = busy;
    $('check').textContent = makingModel ? 'Making example…' : busy ? 'Checking…' : 'AI checking';
    renderOverview(); renderFeedback(); renderExpansion(); resizeRevision(); updateDraftControls();
  }
  async function loadWork() {
    const work = await request('work');
    captureEditor();
    if (work.storyId !== window.WRITING_STORY_ID) throw Error('The writing page has changed. Reload to load the short sections.');
    if (work.earlierSentencePractice) {
      const rows = new Map(earlier.drafts.map(row => [row.sentence_id, row]));
      for (const row of work.earlierSentencePractice.drafts) if (!rows.get(row.sentence_id)?.dirty) rows.set(row.sentence_id, row);
      const history = new Map(earlier.revisions.map(row => [row.id, row]));
      for (const row of work.earlierSentencePractice.revisions) history.set(row.id, row);
      earlier = { drafts: Array.from(rows.values()), revisions: Array.from(history.values()) }; state.earlier = earlier;
    }
    for (const remote of work.drafts) { rememberDraft(remote.sentence_id, remote); mergeDraft(remote); }
    for (const row of work.draftHistory || []) rememberDraft(row.sentence_id, row, true);
    for (const row of work.revisions) addRevision(row);
    for (const row of work.models || []) rememberModel(row);
    writingChatUI?.merge(work.chats || []);
    importEarlier();
    connected = true; loaded = true; cache();
    updateConnectionButton();
    render();
    maybeAutoExample();
  }
  async function saveDrafts() {
    if (saving || !connected || !loaded) return;
    saving = true;
    updateDraftControls();
    let failed = false;
    try {
      for (const [key, row] of Object.entries(state.drafts)) {
        const id = Number(key);
        if (!row.dirty || conflicts.has(id)) continue;
        const text = row.text;
        try {
          const result = await request('draft', { sentenceId: id, text, expectedVersion: row.version });
          rememberDraft(id, { ...row, text, version: result.draft.version, updated_at: result.draft.updated_at }, true);
          if (result.draft.version < row.version) continue;
          row.version = result.draft.version;
          row.updated_at = result.draft.updated_at;
          row.dirty = row.text !== text;
          cache();
        } catch (failure) {
          if (failure.status === 409) { conflicts.add(id); error(failure.message); await loadWork(); }
          else { failed = true; error(failure.message); break; }
        }
      }
    } finally { saving = false; updateDraftControls(); }
    if (!failed && connected && Object.entries(state.drafts).some(([id, row]) => row.dirty && !conflicts.has(Number(id)))) saveTimer = setTimeout(saveDrafts, 1800);
  }
  $('resize-revision')?.addEventListener('click', () => {
    const revision = $('revision'), button = $('resize-revision');
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    revision.rows = expanded ? 8 : 4;
    revision.style.height = '';
    button.textContent = expanded ? 'Less space' : 'More space';
    button.setAttribute('aria-expanded', String(expanded));
  });
  $('revision').addEventListener('input', () => {
    captureEditor();
    cache(); updateDraftControls(); renderFeedback(); renderModel(); if (isPicture) { renderOverview(); renderExpansion(); resizeRevision(); } clearTimeout(saveTimer); saveTimer = setTimeout(saveDrafts, 900);
  });
  function choose(id) {
    if (busy || composing) return;
    captureEditor();
    selected = id; feedbackSelection = null; cache(); error(); history.replaceState(null, '', '#part-' + id); $('history').open = false; render(); maybeAutoExample();
  }
  $('part-list').addEventListener('click', event => { const button = event.target.closest('[data-part]'); if (button) choose(Number(button.dataset.part)); });
  $('next').addEventListener('click', () => { if (selected < parts.length) choose(selected + 1); });
  $('connect').addEventListener('click', () => {
    cache(); const pairing = crypto.randomUUID();
    if (!write(PAIRING, pairing, sessionStorage)) return error('Please allow browser storage to connect AI checking.');
    location.assign(CONNECT + '?state=' + pairing + (config.topicKey ? '&topic=' + encodeURIComponent(config.topicKey) : ''));
  });
  $('resolve-conflict').addEventListener('click', async () => {
    captureEditor();
    const id = config.custom && conflicts.has(0) ? 0 : selected;
    try {
      const work = await request('work'), remote = work.drafts.find(row => row.sentence_id === id);
      if (remote) rememberDraft(id, remote);
      draft(id).version = remote?.version || 0; draft(id).dirty = true; conflicts.delete(id); cache(); await saveDrafts();
    } catch (failure) { error(failure.message); }
  });
  $('history-list').addEventListener('click', async event => {
    const button = event.target.closest('[data-restore-check], [data-restore-draft]');
    if (!button || busy || composing) return;
    const saved = button.dataset.restoreCheck ? state.revisions.find(row => row.id === button.dataset.restoreCheck) : state.draftHistory.find(row => row.recovery_id === button.dataset.restoreDraft);
    if (!saved || saved.sentence_id !== selected) return;
    captureEditor();
    const id = selected, row = draft(id), text = saved.text;
    rememberDraft(id, { ...row, text: editorText(id) });
    busy = true; render();
    try {
      if (connected) {
        const work = await request('work'), remote = work.drafts.find(item => item.sentence_id === id);
        if (remote) rememberDraft(id, remote);
        row.version = remote?.version || 0;
      }
      row.text = text;
      row.dirty = true;
      row.edited_at = new Date().toISOString();
      delete row.pending;
      conflicts.delete(id);
      feedbackSelection = null;
      cache(); error();
    } catch (failure) { error(failure.message); }
    finally { busy = false; render(); saveDrafts(); }
  });
  async function check(kind) {
    if (busy || composing) return;
    captureEditor();
    error(); const row = draft(selected), text = kind === 'guide' ? parts[selected - 1] : editorText(selected).trim();
    if (config.custom && !draft(0).text.trim()) return error('Write your topic first.');
    if (!text) return error('Write your version first.');
    if (!connected) return error('Connect AI checking first. Your draft is kept on this device.');
    const savedHint = kind === 'guide' && revisions(selected).find(item => item.kind === 'guide');
    if (savedHint) { renderFeedback(); $('hint').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    if (!row.pending || row.pending.text !== text || row.pending.kind !== kind) row.pending = { requestId: crypto.randomUUID(), text, kind };
    cache(); busy = true; render();
    try {
      const result = await request('check', { sentenceId: selected, ...row.pending });
      addRevision(result.revision); feedbackSelection = result.revision;
      if (kind === 'revision') { row.text = result.revision.text; row.dirty = true; }
      delete row.pending; cache();
    } catch (failure) { error(failure.message); }
    finally { busy = false; render(); saveDrafts(); if (kind === 'guide' && !$('hint').hidden) $('hint').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); if (isPicture && kind === 'revision') { $('revision').scrollIntoView({ behavior: 'smooth', block: 'center' }); maybeAutoExample(); } }
  }
  $('check').addEventListener('click', () => check('revision'));
  $('guide')?.addEventListener('click', () => check('guide'));
  async function showModel() {
    if (busy || composing || !latest(selected)) return;
    captureEditor();
    error();
    if (editorText(selected).trim() !== latest(selected).text) return error('Use AI checking on this rewrite first, then open its example.');
    if (currentModel()) { $(isPicture ? 'feedback' : 'model-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    if (!connected) return error('Connect AI checking to open your re-write example.');
    busy = true; makingModel = true; render();
    try {
      const result = await request('model', { sentenceId: selected, revisionId: latest(selected).id });
      rememberModel(result.model);
    } catch (failure) { error(failure.message); }
    finally { busy = false; makingModel = false; render(); if (isPicture) $('feedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); else if (!$('model-panel').hidden) $('model-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }  }
  $('show-model')?.addEventListener('click', showModel);
  function maybeAutoExample() {
    if (isPicture && connected && !busy && repeatedDifficulty() && !currentModel() && editorText(selected).trim() === latest(selected)?.text) void showModel();
  }
  $('feedback').addEventListener('click', event => {
    if (!isPicture) return;
    const button = event.target.closest('[data-note]'), row = feedbackSelection?.kind === 'revision' ? feedbackSelection : latest(selected);
    if (!button || !row || $('revision').value.trim() !== row.text) return;
    const note = writingNotes(row).notes[Number(button.dataset.note)];
    const offset = $('revision').value.indexOf(row.text);
    $('revision').focus();
    $('revision').setSelectionRange(note.start + offset, note.end + offset);
  });
  $('expand-ideas')?.addEventListener('click', async () => {
    if (busy || expandingIdeas) return;
    error();
    if (!editorText(selected).trim()) return error('Write a few words first so the ideas can grow from your paragraph.');
    if (!connected) return error('Connect AI checking to get ideas for your paragraph.');
    if (config.custom && !draft(0).text.trim()) return error('Write your topic first.');
    const question = expansionQuestion();
    if ((state.chats || []).some(row => row.question === question)) {
      renderExpansion(); $('expansion-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return;
    }
    if (state.expansionPending?.question !== question) state.expansionPending = { requestId: crypto.randomUUID(), question, paragraphs: parts.map((_, index) => editorText(index + 1)), ...(config.custom ? { topicTitle: draft(0).text } : {}) };
    cache(); expandingIdeas = true; renderExpansion();
    try {
      const result = await request('chat', state.expansionPending);
      writingChatUI.merge([result.turn]);
      delete state.expansionPending; cache();
    } catch (failure) { error(failure.message); }
    finally {
      expandingIdeas = false; renderExpansion();
      if (!$('expansion-panel').hidden) $('expansion-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
  if (isPicture) {
    window.addEventListener('resize', resizeRevision);
    document.fonts?.ready.then(resizeRevision);
  }

  function setupWritingChat() {
    const panel = $('writing-chat');
    if (!panel) return null;
    const messages = $('chat-history');
    const questionBox = $('chat-question');
    const sendButton = $('chat-send');
    const chatError = $('chat-error');
    const status = $('chat-status');
    const shortcuts = panel.querySelectorAll('[data-chat-question]');
    let sending = false;

    state.chats = Array.isArray(state.chats) ? state.chats : [];
    state.chatDraft = typeof state.chatDraft === 'string' ? state.chatDraft : '';
    questionBox.value = state.chatDraft;

    function updateConnection() {
      questionBox.disabled = sending;
      sendButton.disabled = sending || !questionBox.value.trim();
      sendButton.textContent = sending ? 'Thinking…' : 'Send';
      shortcuts.forEach(button => { button.disabled = sending; });
      status.textContent = sending ? 'Thinking about Harry’s story…' :
        connected ? 'Chat history saved online for this topic.' : 'Connect AI checking above to load and save your chat.';
    }

    function renderHistory() {
      const previousScroll = messages.scrollTop;
      messages.replaceChildren();
      if (!state.chats.length) {
        const empty = document.createElement('p');
        empty.className = 'chat-empty';
        empty.textContent = 'Your questions, replies, and writing examples will appear here.';
        messages.append(empty);
      }
      for (const turn of state.chats) {
        const article = document.createElement('article');
        article.className = 'chat-turn';
        article.dataset.chatId = turn.id;
        const time = document.createElement('p');
        time.className = 'chat-time';
        time.textContent = new Date(turn.created_at).toLocaleString();
        article.append(time);
        for (const [label, text, className] of [['You', turn.question, 'chat-question'], ['Writing tutor', turn.reply, 'chat-reply']]) {
          const bubble = document.createElement('div');
          bubble.className = 'chat-bubble ' + className;
          const heading = document.createElement('strong');
          heading.textContent = label;
          const content = document.createElement('div');
          content.className = 'chat-text';
          content.textContent = text;
          bubble.append(heading, content);
          article.append(bubble);
        }
        messages.append(article);
      }
      messages.scrollTop = previousScroll;
    }

    function merge(turns) {
      const records = new Map(state.chats.map(turn => [turn.id, turn]));
      for (const turn of turns) records.set(turn.id, turn);
      state.chats = Array.from(records.values()).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
      if (state.chatPending && records.has(state.chatPending.requestId)) {
        if (state.chatDraft.trim() === state.chatPending.question) {
          state.chatDraft = '';
          questionBox.value = '';
        }
        delete state.chatPending;
      }
      cache();
      renderHistory();
      updateConnection();
    }

    questionBox.addEventListener('input', () => {
      state.chatDraft = questionBox.value;
      if (state.chatPending && state.chatPending.question !== questionBox.value.trim()) delete state.chatPending;
      cache();
      updateConnection();
    });
    shortcuts.forEach(button => button.addEventListener('click', () => {
      questionBox.value = button.dataset.chatQuestion;
      questionBox.dispatchEvent(new Event('input'));
      questionBox.focus();
    }));
    $('chat-form').addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || !questionBox.value.trim()) return;
      chatError.hidden = true;
      if (!connected) {
        chatError.textContent = 'Connect AI checking above to send your question.';
        chatError.hidden = false;
        return;
      }
      const question = questionBox.value.trim();
      if (!state.chatPending || state.chatPending.question !== question) {
        state.chatPending = {
          requestId: crypto.randomUUID(),
          question,
          paragraphs: parts.map((_, index) => editorText(index + 1)),
          ...(config.custom ? { topicTitle: draft(0).text } : {}),
        };
      }
      const pending = state.chatPending;
      cache();
      sending = true;
      updateConnection();
      try {
        const result = await request('chat', pending);
        merge([result.turn]);
        const lastTurn = messages.querySelector(`[data-chat-id="${result.turn.id}"]`);
        if (lastTurn) messages.scrollTop = lastTurn.offsetTop;
      } catch (failure) {
        chatError.textContent = failure.message;
        chatError.hidden = false;
      } finally {
        sending = false;
        updateConnection();
      }
    });

    renderHistory();
    updateConnection();
    return { merge, updateConnection };
  }

  function importEarlier() {
    if (isPicture) return;
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
  if ($('original-story')) $('original-story').textContent = parts.join(' ');
  if (config.custom) $('topic-title').addEventListener('input', () => {
    const row = draft(0); row.text = $('topic-title').value; row.dirty = true; cache();
    clearTimeout(saveTimer); saveTimer = setTimeout(saveDrafts, 900);
  });
  writingChatUI = setupWritingChat();
  $('revision').addEventListener('compositionstart', () => { composing = true; });
  $('revision').addEventListener('compositionend', () => { composing = false; captureEditor(); render(); clearTimeout(saveTimer); saveTimer = setTimeout(saveDrafts, 900); });
  function keepWriting() { captureEditor(); cache(); void saveDrafts(); }
  window.addEventListener('pagehide', keepWriting);
  document.addEventListener('visibilitychange', () => { if (document.hidden) keepWriting(); });
  window.addEventListener('storage', event => {
    if (event.key !== CACHE || !event.newValue) return;
    let incoming;
    try { incoming = JSON.parse(event.newValue); } catch { return; }
    captureEditor();
    for (const [id, remote] of Object.entries(incoming.drafts || {})) {
      const local = draft(Number(id));
      rememberDraft(Number(id), remote);
      if (remote.dirty && remote.text !== local.text) conflicts.add(Number(id));
      else mergeDraft({ ...remote, sentence_id: Number(id) });
    }
    for (const row of incoming.draftHistory || []) rememberDraft(row.sentence_id, row, row.archived);
    for (const row of incoming.revisions || []) if (!state.revisions.some(item => item.id === row.id)) state.revisions.push(row);
    render();
  });
  importEarlier();
  render();
  if (read(SESSION)) loadWork().then(saveDrafts).catch(failure => { error(failure.message); updateConnectionButton(); });
  window.addEventListener('online', () => { if (read(SESSION)) loadWork().then(saveDrafts).catch(failure => error(failure.message)); });
})();
