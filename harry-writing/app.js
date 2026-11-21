/* AI keys stay on the private service. Only a 30-day Harry session reaches this page. */
(function () {
  'use strict';
  const API = 'https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/harry-writing';
  const CONNECT = 'https://marco-10-word-meaning-trial.alexsoton.chatgpt.site/harry/writing-connect';
  const config = window.WRITING_CONFIG || {}, isPicture = Boolean(config.picture);
  const FEEDBACK_FOCUS = 'sentence-clarity-v1';
  const SESSION = 'harry-meaning-ai:connection-v1', PAIRING = 'harry-writing:pairing', CACHE = 'harry-writing:' + window.WRITING_STORY_ID;
  const $ = id => document.getElementById(id), parts = window.ELEPHANT_PARTS;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function suggestionList(text) {
    const lines = String(text || '').split(/\r?\n/).map(line => line.replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/, '').trim()).filter(Boolean);
    return '<ul class="next-steps">' + lines.map(line => '<li>' + escape(line) + '</li>').join('') + '</ul>';
  }
  function scoreResult(text) {
    const content = String(text || '');
    const score = content.match(/^[ \t]*(Estimated practice score|Earlier estimate)[ \t]*:[ \t]*([1-7](?:\.\d)?|8(?:\.0)?)[ \t]*\/[ \t]*8\b([^\r\n]*)/im);
    if (!score) return { number: '', content };
    const tail = score[3].trim();
    const remainder = /^(?:\.|[—–-]?\s*(?:Beginning|Middle|Ending) paragraph\.?)$/i.test(tail) ? '' : tail;
    return { number: score[2] + '/8', content: content.replace(score[0], remainder) };
  }
  function scoreSuggestions({ number, content }, source) {
    const availablePoints = number ? 8 - Number.parseFloat(number) : 0;
    const groups = [
      { title: 'Language use', lines: [] },
      { title: 'Development', lines: [] },
    ];
    const intro = [];
    let current = null;
    for (const raw of content.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      const heading = line.replace(/[*#:]/g, '').trim().toLowerCase();
      const group = groups.find(item => item.title.toLowerCase() === heading);
      if (group) current = group;
      else (current ? current.lines : intro).push(line.replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/, ''));
    }
    if (groups.some(group => !group.lines.length)) return content.trim() ? suggestionList(content) : '';
    const highlight = line => {
      let html = '', offset = 0;
      for (const match of line.matchAll(/“([^”\n]+)”|"([^"\n]+)"/g)) {
        html += escape(line.slice(offset, match.index));
        const quote = match[1] || match[2];
        html += source.includes(quote) ? '<mark>' + escape(match[0]) + '</mark>' : escape(match[0]);
        offset = match.index + match[0].length;
      }
      return html + escape(line.slice(offset));
    };
    const suggestion = line => {
      const estimate = line.match(/^Estimated \+(0\.[1-9]):\s+/i);
      if (!estimate) return `<li>${highlight(line)}</li>`;
      const gain = Math.min(Number(estimate[1]), availablePoints);
      const label = gain > 0 ? `<span class="score-estimate" title="Estimated gain from this change alone">Est. +${gain.toFixed(1)}</span>` : '';
      return `<li>${label}${highlight(line.slice(estimate[0].length))}</li>`;
    };
    const introduction = intro.map(line => `<p>${escape(line)}</p>`).join('');
    const sections = groups.map(group => {
      const suggestions = group.lines.map(suggestion).join('');
      return `<section class="score-advice"><h3>${group.title}</h3><ul class="next-steps">${suggestions}</ul></section>`;
    });
    return introduction + sections.join('');
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
  let connected = false, busy = false, saving = false, loaded = false, saveTimer, memoryOnly = false, feedbackSelection = null, makingModel = false;
  let writingChatUI = null, scoringStory = false;
  const rewritingExamples = new Set();
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
    $('connect').textContent = connected ? 'Connected' : isPicture ? 'Connect AI' : 'Connect AI checking';
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
    const counter = $('word-count'), goal = [50, 100, 50][selected - 1];
    if (counter) {
      const count = box.value.split(/\s+/).filter(word => /[\p{L}\p{N}]/u.test(word)).length;
      counter.textContent = count + ' / ' + goal + ' words';
      counter.setAttribute('aria-label', config.partNames[selected - 1] + ': ' + count + ' words. Suggested goal: ' + goal + ' words.');
      box.placeholder = 'Aim for about ' + goal + ' words for your ' + config.partNames[selected - 1].toLowerCase() + '.';
    }
    box.style.height = 'auto';
    box.style.height = Math.max(240, box.scrollHeight + 2) + 'px';
  }
  function rewriteQuestion(grade = 6) {
    const opening = grade === 8 ? 'Write an 8/8' : 'Write a 6/8';
    const guidance = grade === 8 ? 'Improve the connections, concrete actions and useful details with natural English an eight-year-old can understand. Keep it near his paragraph’s length.' : 'Make a clear, attainable version for an eight-year-old with sensible sentences, connected events and a few simple, useful details. Use short, familiar words and stay close to his wording and paragraph length.';
    return opening + ' practice example of only the ' + config.partNames[selected - 1] + ' paragraph below. Keep Harry’s characters, main events and outcome. ' + guidance + ' Return only the rewritten paragraph, without a heading or feedback. Paragraph: ' + editorText(selected).trim();
  }
  function scoreQuestion() {
    return "Score only Harry's " + config.partNames[selected - 1] + ' paragraph out of 8 for APAAS practice. Give the score to one decimal place. Assess only language use and development, using those two headings. Start each actionable bullet with its estimated gain in the form Estimated +0.3: and estimate the gain from that change alone, within the 8/8 ceiling. Keep the earlier re-work and add-details style concise: combine specific language-use advice with questions to add details inside one or two moments already in his paragraph. Give two or three concrete language-use bullets covering the most useful changes to commas, periods, capital letters, sentence clarity, or repeated and unnecessary words. Quote his words, explain each change and offer short, optional wording improvements. Only address issues actually present; do not invent problems to fill the bullets. Other paragraphs are context only and may be unfinished. This is a practice estimate, not an official test score.';
  }
  function paragraphScore(id = selected) {
    const prefix = "Score only Harry's " + config.partNames[id - 1] + ' paragraph out of 8 for APAAS practice.';
    return (state.chats || []).filter(row => row.question.startsWith(prefix)).at(-1);
  }
  function paragraphHelp(question) {
    const prefix = question.slice(0, question.indexOf('Paragraph: '));
    const turns = (state.chats || []).filter(row => row.question.startsWith(prefix));
    return turns.findLast(row => row.question === question) || turns.at(-1);
  }
  function renderWritingHelp() {
    if (!isPicture) return;
    const score = paragraphScore();
    $('score-panel').hidden = !score;
    const result = scoreResult(score?.reply);
    const { number } = result;
    $('score-value').textContent = number;
    $('score-value').hidden = !number;
    $('score-value').setAttribute('aria-label', number.replace('/', ' out of '));
    $('score-text').innerHTML = score ? scoreSuggestions(result, editorText(selected)) : '';
    $('score-paragraph').disabled = busy || scoringStory;
    $('score-paragraph').textContent = scoringStory ? 'Scoring…' : 'Score & suggestion';
    $('score-paragraph').setAttribute('aria-expanded', String(Boolean(score)));
    $('score-shortcut').dataset.chatQuestion = scoreQuestion();
    $('score-shortcut').textContent = 'Score & suggestion';
    const example = paragraphHelp(rewriteQuestion());
    $('rewrite-panel').hidden = !example;
    $('rewrite-reference').hidden = !example || example.question === rewriteQuestion();
    $('rewrite-text').textContent = example?.reply || '';
    $('rewrite-example').disabled = busy || rewritingExamples.has(6);
    $('rewrite-example').textContent = rewritingExamples.has(6) ? 'Writing 6/8 example…' : '6/8 rewrite example';
    $('rewrite-example').setAttribute('aria-expanded', String(Boolean(example)));
    const eightExample = paragraphHelp(rewriteQuestion(8));
    $('rewrite-eight-panel').hidden = !eightExample;
    $('rewrite-eight-reference').hidden = !eightExample || eightExample.question === rewriteQuestion(8);
    $('rewrite-eight-text').textContent = eightExample?.reply || '';
    $('rewrite-eight').disabled = busy || rewritingExamples.has(8);
    $('rewrite-eight').textContent = rewritingExamples.has(8) ? 'Writing 8/8 example…' : '8/8 rewrite example';
    $('rewrite-eight').setAttribute('aria-expanded', String(Boolean(eightExample)));
    $('feedback').hidden = !score && !example && !eightExample;
  }
  function renderFeedback() {
    const hint = revisions(selected).find(row => row.kind === 'guide');
    $('hint').hidden = isPicture || !hint;
    $('hint').innerHTML = hint ? suggestionList(hint.feedback.nextStep) : '';
    const row = feedbackSelection?.kind === 'revision' ? feedbackSelection : latest(selected), host = $('feedback');
    if (!isPicture) {
      host.hidden = !row;
      if (row) {
        const feedback = row.feedback;
        host.innerHTML = `<h3>${editorText(selected).trim() === row.text ? 'Feedback on your rewrite' : 'Feedback on your last check'}</h3><div class="checks">${[['complete', 'Complete sentences'], ['clear', 'Clear meaning'], ['correct', 'Periods and commas']].map(([key, label]) => `<span class="${feedback[key] ? 'good' : 'bad'}"><span aria-hidden="true">${feedback[key] ? '✓' : '✗'}</span> ${label}<span class="sr-only">: ${feedback[key] ? 'Right' : 'Wrong'}</span></span>`).join('')}</div><p><strong>Works well</strong><br>${escape(feedback.strength)}</p><div class="suggestions"><strong>Try next</strong>${suggestionList(feedback.nextStep)}</div><p class="small">Read your rewrite, then compare it with the re-write example.</p>`;
      }
    }
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
    const checked = parts.filter((_, index) => isPicture ? paragraphScore(index + 1) : latest(index + 1));
    $('progress').textContent = `${checked.length} of ${parts.length} ${isPicture ? 'paragraphs scored' : 'sections revised'}`;
    $('part-list').innerHTML = parts.map((_, index) => {
      const id = index + 1, row = isPicture ? paragraphScore(id) : latest(id);
      return `<button type="button" data-part="${id}" class="${id === selected ? 'active ' : ''}${row ? 'revised' : ''}" aria-label="${isPicture ? config.partNames[index] : 'Section ' + id}${row ? (isPicture ? ', scored' : ', revised') : (isPicture ? ', not scored' : ', not revised')}" ${id === selected ? 'aria-current="step"' : ''} ${busy ? 'disabled' : ''}>${isPicture ? config.partNames[index] : id}</button>`;
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
    const checked = latest(selected), model = currentModel();
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
    if ($('check')) { $('check').disabled = busy; $('check').hidden = false; }
    renderModel();
    if ($('guide')) $('guide').disabled = busy;
    if ($('check')) $('check').textContent = makingModel ? 'Making example…' : busy ? 'Checking…' : 'AI checking';
    renderOverview(); renderFeedback(); renderWritingHelp(); resizeRevision(); updateDraftControls();
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
    cache(); updateDraftControls(); renderFeedback(); renderModel(); if (isPicture) { renderOverview(); renderWritingHelp(); resizeRevision(); } clearTimeout(saveTimer); saveTimer = setTimeout(saveDrafts, 900);
  });
  function choose(id) {
    if (busy || composing) return;
    captureEditor();
    selected = id; feedbackSelection = null; cache(); error(); history.replaceState(null, '', '#part-' + id); $('history').open = false; render();
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
    if (isPicture || busy || composing) return;
    captureEditor();
    error(); const row = draft(selected), text = kind === 'guide' ? parts[selected - 1] : editorText(selected).trim();
    if (config.custom && !draft(0).text.trim()) return error('Write your topic first.');
    if (!text) return error('Write your version first.');
    if (!connected) return error('Connect AI checking first. Your draft is kept on this device.');
    const savedHint = kind === 'guide' && revisions(selected).find(item => item.kind === 'guide');
    if (savedHint) { renderFeedback(); $('hint').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    if (!row.pending || row.pending.text !== text || row.pending.kind !== kind || row.pending.focus !== FEEDBACK_FOCUS) row.pending = { requestId: crypto.randomUUID(), text, kind, focus: FEEDBACK_FOCUS };
    cache(); busy = true; render();
    try {
      const result = await request('check', { sentenceId: selected, ...row.pending });
      addRevision(result.revision); feedbackSelection = result.revision;
      if (kind === 'revision') { row.text = result.revision.text; row.dirty = true; }
      delete row.pending; cache();
    } catch (failure) { error(failure.message); }
    finally { busy = false; render(); saveDrafts(); if (kind === 'guide' && !$('hint').hidden) $('hint').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); if (isPicture && kind === 'revision') { $('revision').scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
  }
  $('check')?.addEventListener('click', () => check('revision'));
  $('guide')?.addEventListener('click', () => check('guide'));
  async function showModel() {
    if (isPicture || busy || composing || !latest(selected)) return;
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
  async function requestWritingHelp(grade = 6) {
    if (busy || composing || rewritingExamples.has(grade)) return;
    captureEditor();
    error();
    if (!editorText(selected).trim()) return error('Write a few words first so I can help with this paragraph.');
    if (!connected) return error('Connect AI to get help with your paragraph.');
    if (config.custom && !draft(0).text.trim()) return error('Write your topic first.');
    const question = rewriteQuestion(grade);
    const panel = grade === 8 ? 'rewrite-eight-panel' : 'rewrite-panel';
    const pendingKey = grade === 8 ? 'rewriteEightPending' : 'rewritePending';
    if ((state.chats || []).some(row => row.question === question)) {
      renderWritingHelp(); $(panel).open = true; $(panel).scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return;
    }
    if (state[pendingKey]?.question !== question) state[pendingKey] = { requestId: crypto.randomUUID(), question, paragraphs: parts.map((_, index) => editorText(index + 1)), ...(config.custom ? { topicTitle: draft(0).text } : {}) };
    rewritingExamples.add(grade);
    cache(); renderWritingHelp();
    try {
      const result = await request('chat', state[pendingKey]);
      writingChatUI.merge([result.turn]);
      $(panel).open = true;
      delete state[pendingKey]; cache();
    } catch (failure) { error(failure.message); }
    finally {
      rewritingExamples.delete(grade);
      renderWritingHelp();
      if (!$(panel).hidden) $(panel).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  async function scoreParagraph() {
    if (busy || composing || scoringStory) return;
    captureEditor(); error();
    const part = selected, question = scoreQuestion(), paragraphs = parts.map((_, index) => editorText(index + 1).trim());
    if (!paragraphs[part - 1]) return error('Write a few words in this paragraph before scoring it.');
    if (!connected) return error('Connect AI to score your paragraph.');
    if (config.custom && !draft(0).text.trim()) return error('Write your topic first.');
    if (!state.scorePending || state.scorePending.question !== question || JSON.stringify(state.scorePending.paragraphs) !== JSON.stringify(paragraphs) || state.scorePending.topicTitle !== (config.custom ? draft(0).text : undefined)) {
      state.scorePending = { requestId: crypto.randomUUID(), question, paragraphs, ...(config.custom ? { topicTitle: draft(0).text } : {}) };
    }
    const pending = state.scorePending;
    scoringStory = true; cache(); renderWritingHelp();
    try {
      const result = await request('chat', pending);
      writingChatUI.merge([result.turn]);
      if (selected === part) $('score-panel').open = true;
      delete state.scorePending; cache();
    } catch (failure) { error(failure.message); }
    finally {
      scoringStory = false; renderWritingHelp();
      if (selected === part && !$('score-panel').hidden) $('score-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  $('score-paragraph')?.addEventListener('click', scoreParagraph);
  $('rewrite-example')?.addEventListener('click', () => requestWritingHelp(6));
  $('rewrite-eight')?.addEventListener('click', () => requestWritingHelp(8));
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
        connected ? 'Chat history saved online for this topic.' : 'Connect AI above to load and save your chat.';
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
      renderWritingHelp();
      if (isPicture) renderOverview();
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
        chatError.textContent = 'Connect AI above to send your question.';
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
