(() => {
  'use strict';
  const api = 'https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/marco-word-archive';
  const connectUrl = 'https://marco-10-word-meaning-trial.alexsoton.chatgpt.site/marco/archive-connect';
  const storageKey = 'marco-word-archive-v1';
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* The active page still keeps the draft. */ } };
  const drafts = read(storageKey + '-drafts') || {};
  const pending = read(storageKey + '-pending') || {};
  const historyCache = new Map();
  let token = read(storageKey + '-session') || '', words = [], page = 0, ready = false, view = 'review';
  const pageSize = 50;
  function displayDate(value, time = false) {
    if (!value) return 'Date not recorded';
    const dateOnly = value.length === 10;
    const date = new Date(dateOnly ? value + 'T12:00:00Z' : value);
    return date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: 'short', day: 'numeric', ...(time && !dateOnly ? { hour: 'numeric', minute: '2-digit' } : {}) });
  }
  function absorbConnection() {
    const params = new URLSearchParams(location.hash.slice(1));
    if (!params.has('ai_session')) return;
    let state;
    try { state = JSON.parse(sessionStorage.getItem(storageKey + '-pairing') || 'null'); } catch { state = null; }
    const incoming = params.get('ai_session') || '';
    if (state && state.id === params.get('ai_state') && Date.now() - state.at < 30 * 60000 && /^[A-Za-z0-9_.-]{20,2048}$/.test(incoming)) {
      token = incoming; save(storageKey + '-session', token);
      sessionStorage.removeItem(storageKey + '-pairing');
    } else $('connection-text').textContent = 'The connection link expired. Connect AI checking again from this page.';
    history.replaceState(null, '', location.pathname + location.search);
  }
  async function request(action, { wordId, body } = {}) {
    const url = new URL(api); url.searchParams.set('action', action);
    if (wordId) url.searchParams.set('wordId', wordId);
    const headers = {};
    if (token && action !== 'history') headers.authorization = 'Bearer ' + token;
    if (body) headers['content-type'] = 'application/json';
    const response = await fetch(url, { method: body ? 'POST' : 'GET', headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(55000), cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) {
      if (result.code === 'connect_required') {
        ready = false; token = ''; save(storageKey + '-session', ''); showConnection();
      }
      throw new Error(result.error || 'This request could not finish. Please try again.');
    }
    return result;
  }
  function showConnection() {
    $('connect').hidden = ready;
    $('connection-title').textContent = ready ? 'AI checking connected' : 'Short-meaning checks';
    $('connection-text').textContent = ready ? 'Type a simple meaning, then Check. Close meanings and small spelling slips count. This browser connection lasts up to 30 days.' : 'View the list and history freely. Connect AI checking to save a new check.';
  }
  async function checkConnection() {
    if (!token) return showConnection();
    try { const result = await request('status'); ready = Boolean(result.ready); showConnection(); }
    catch (error) { showConnection(); $('connection-text').textContent = error.message; }
  }
  function connect() {
    const state = { id: crypto.randomUUID(), at: Date.now() };
    try { sessionStorage.setItem(storageKey + '-pairing', JSON.stringify(state)); }
    catch { $('connection-text').textContent = 'Allow browser storage to keep the AI connection, then try again.'; return; }
    location.href = connectUrl + '?state=' + state.id;
  }
  function selectedWords() {
    const query = $('search').value.trim().toLowerCase(), filter = $('filter').value;
    const selected = words.filter(word => (view === 'all' || (view === 'known' ? word.confidentlyKnown : !word.confidentlyKnown)) && word.word.includes(query) && (filter === 'all' || (filter === '2' ? word.correctAfterLastMiss >= 2 : word.correctAfterLastMiss === Number(filter))));
    if ($('sort').value === 'recent') selected.sort((a, b) => (b.lastMiss || '').localeCompare(a.lastMiss || '') || a.word.localeCompare(b.word));
    return selected;
  }
  function updateOverview() {
    const known = words.filter(word => word.confidentlyKnown).length, review = words.length - known;
    $('overview').innerHTML = `<div class="stat"><strong>${review.toLocaleString()}</strong><span>words to review</span></div><div class="stat"><strong>${known.toLocaleString()}</strong><span>confidently known</span></div><div class="stat"><strong>${words.length.toLocaleString()}</strong><span>words in the archive</span></div>`;
    for (const button of document.querySelectorAll('[data-view]')) {
      const choice = button.dataset.view;
      button.textContent = `${choice === 'review' ? 'Review' : choice === 'known' ? 'Known' : 'All history'} · ${(choice === 'review' ? review : choice === 'known' ? known : words.length).toLocaleString()}`;
      button.setAttribute('aria-pressed', String(choice === view));
    }
  }
  function badge(word) {
    const count = word.correctAfterLastMiss;
    return `<span class="badge ${count >= 2 ? 'twice' : count === 1 ? 'once' : ''}">${word.confidentlyKnown ? 'Confidently known' : count ? count === 1 ? 'Correct later · once' : `Correct later · ${count} times` : 'Awaiting a correct check'}</span>
      <p class="status-line">${word.correctTotal} correct record${word.correctTotal === 1 ? '' : 's'} overall</p>${word.correctionBasis === 'archive-created' ? '<p class="status-line">Later-check count starts in this archive</p>' : ''}${word.undatedMisses ? `<p class="status-line">${word.undatedMisses} miss${word.undatedMisses === 1 ? '' : 'es'} with no saved date</p>` : ''}`;
  }
  function preferenceButton(word) {
    if (word.restoredForReview) return '<p class="status-line">Restored for review</p><button class="quiet restore" type="button" data-review-required="false">Use automatic status</button>';
    if (word.confidentlyKnown) return `<p class="status-line">Correct on ${word.knownEvidence.correctDays} later days · ${word.knownEvidence.meaningChecks} meaning check${word.knownEvidence.meaningChecks === 1 ? '' : 's'}</p><button class="quiet restore" type="button" data-review-required="true">Restore to review</button>`;
    return '';
  }
  function render() {
    const selected = selectedWords(), pages = Math.max(1, Math.ceil(selected.length / pageSize));
    page = Math.min(page, pages - 1);
    const start = page * pageSize;
    $('list-count').textContent = `${selected.length.toLocaleString()} word${selected.length === 1 ? '' : 's'} · ${selected.length ? start + 1 : 0}–${Math.min(start + pageSize, selected.length)} shown`;
    $('page-count').textContent = `Page ${page + 1} of ${pages}`;
    $('previous').disabled = page === 0; $('next').disabled = page >= pages - 1;
    $('words').innerHTML = selected.length ? selected.slice(start, start + pageSize).map((word, index) => `
      <article class="word-card" data-word="${escape(word.id)}" aria-labelledby="name-${escape(word.id)}">
        <div><span class="word-index">${start + index + 1}</span><h2 class="word-name" id="name-${escape(word.id)}">${escape(word.word)}</h2><p class="word-meta">${word.misses} recorded miss${word.misses === 1 ? '' : 'es'}</p><p class="word-meta latest">${word.undatedMisses ? 'Latest dated miss' : 'Last missed'}<br>${displayDate(word.lastMiss)}</p></div>
        <div class="corrections">${badge(word)}${preferenceButton(word)}</div>
        <form class="check-form"><label for="answer-${escape(word.id)}">Your short meaning</label><input id="answer-${escape(word.id)}" name="answer" maxlength="240" autocomplete="off" placeholder="A few words is enough" value="${escape(drafts[word.id] || '')}"><button type="submit">Check</button><button type="button" class="unknown">I don’t know</button><div class="check-result" role="status" hidden></div></form>
        <details class="word-history"><summary>Dates and correction history</summary><div class="history-content"></div></details>
      </article>`).join('') : '<p class="empty">No words match these filters.</p>';
    $('words').setAttribute('aria-busy', 'false');
    for (const card of $('words').querySelectorAll('.word-card')) {
      const details = card.querySelector('details');
      details.addEventListener('toggle', () => { if (details.open) loadHistory(card); });
      const word = words.find(word => word.id === card.dataset.word);
      if (word.lastArchiveCheck) {
        const result = card.querySelector('.check-result');
        result.hidden = false; result.classList.toggle('wrong', word.lastArchiveCheck.result !== 'correct');
        result.innerHTML = `<strong>Last archive check · ${word.lastArchiveCheck.result === 'correct' ? 'Close enough' : 'Try again'}</strong><span class="date">${displayDate(word.lastArchiveCheck.at, true)}</span>`;
      }
    }
  }
  function eventKind(kind) {
    return ({ quiz: 'VR question choice', vocabulary: 'Vocabulary choice', ai: 'AI short meaning', self: 'Self-marked unknown', 'reviewed-meaning': 'Reviewed short meaning', archive: 'Archive AI check' })[kind] || 'Saved practice result';
  }
  function renderHistory(card, events) {
    const content = card.querySelector('.history-content');
    content.innerHTML = `<ol class="history-list">${events.map(event => `<li class="history-item"><span>${displayDate(event.at, true)}${event.documentedLater && !event.at ? '<small> · later attempt</small>' : ''}</span><span class="outcome ${escape(event.result)}">${({ wrong: 'Incorrect', unknown: 'Didn’t know', correct: 'Correct' })[event.result]}</span><span class="history-source">${escape(event.source)}<small>${escape(event.ref)} · ${eventKind(event.kind)}</small></span></li>`).join('')}</ol>`;
  }
  async function loadHistory(card) {
    const id = card.dataset.word, content = card.querySelector('.history-content');
    if (historyCache.has(id)) return renderHistory(card, historyCache.get(id));
    content.textContent = 'Loading history…';
    try { const result = await request('history', { wordId: id }); historyCache.set(id, result.events); renderHistory(card, result.events); }
    catch (error) { content.replaceChildren(document.createTextNode(error.message + ' ')); const retry = document.createElement('button'); retry.className = 'quiet'; retry.textContent = 'Retry'; retry.onclick = () => loadHistory(card); content.append(retry); }
  }
  async function check(card, unknown) {
    const id = card.dataset.word, form = card.querySelector('form'), input = form.elements.answer, result = form.querySelector('.check-result');
    if (form.dataset.checking) return;
    if (!ready) { $('connection-text').textContent = 'Connect AI checking above, then check this meaning. Your typed meaning is kept.'; $('connect').focus(); return; }
    const answer = unknown ? '' : input.value.trim();
    if (!answer && !unknown) { input.focus(); input.setCustomValidity('Write a short meaning first.'); input.reportValidity(); return; }
    input.setCustomValidity('');
    const existing = pending[id];
    const body = existing && existing.answer === answer && existing.unknown === unknown ? existing : { requestId: crypto.randomUUID(), wordId: id, answer, unknown };
    pending[id] = body; save(storageKey + '-pending', pending);
    form.dataset.checking = 'true'; form.querySelectorAll('button').forEach(button => { button.disabled = true; }); input.disabled = true;
    result.hidden = false; result.className = 'check-result'; result.textContent = 'Checking your meaning…';
    try {
      const checked = await request('check', { body });
      const index = words.findIndex(word => word.id === id); words[index] = checked.summary;
      historyCache.set(id, checked.events); card.querySelector('.corrections').innerHTML = badge(checked.summary) + preferenceButton(checked.summary);
      card.querySelector('.word-meta').textContent = `${checked.summary.misses} recorded miss${checked.summary.misses === 1 ? '' : 'es'}`;
      card.querySelector('.latest').innerHTML = `${checked.summary.undatedMisses ? 'Latest dated miss' : 'Last missed'}<br>${displayDate(checked.summary.lastMiss)}`;
      result.classList.toggle('wrong', !checked.close);
      result.innerHTML = `<strong>${checked.close ? 'Close enough ✓' : unknown ? 'Review this meaning' : 'Try again'}</strong>${escape(checked.meaning)}<br><span class="date">Saved ${displayDate(checked.answeredAt, true)}</span>`;
      delete pending[id]; delete drafts[id]; save(storageKey + '-pending', pending); save(storageKey + '-drafts', drafts); input.value = '';
      if (card.querySelector('details').open) renderHistory(card, checked.events);
      updateOverview();
    } catch (error) {
      result.className = 'check-result error'; result.textContent = error.name === 'TimeoutError' ? 'The check took too long. Press Check again to recover this result.' : error.message;
    } finally {
      delete form.dataset.checking; form.querySelectorAll('button').forEach(button => { button.disabled = false; }); input.disabled = false;
    }
  }
  async function restore(card, button) {
    if (!ready) { $('connection-text').textContent = 'Connect AI checking above to save this word’s review status.'; $('connect').focus(); return; }
    const id = card.dataset.word, reviewRequired = button.dataset.reviewRequired === 'true';
    button.disabled = true;
    try {
      const result = await request('preference', { body: { wordId: id, reviewRequired } });
      words[words.findIndex(word => word.id === id)] = result.summary;
      updateOverview(); render();
      $('action-status').textContent = `${result.summary.word} ${reviewRequired ? 'restored to Review' : 'returned to automatic status'}. Saved online.`;
    } catch (error) { $('action-status').textContent = error.message; button.disabled = false; }
  }
  async function loadWords() {
    $('refresh').disabled = true; $('load-error').hidden = true;
    try {
      const data = await request('history');
      if (!Array.isArray(data.words) || !data.words.length) throw new Error('The saved word list could not load. Please refresh.');
      words = data.words; historyCache.clear(); updateOverview(); render();
    } catch (error) {
      $('load-error').textContent = error.message; $('load-error').hidden = false;
      if (!words.length) { $('overview').textContent = 'Saved history is temporarily unavailable.'; $('list-count').textContent = 'Use Refresh history to try again'; }
      $('words').setAttribute('aria-busy', 'false');
    } finally { $('refresh').disabled = false; }
  }
  $('words').addEventListener('input', event => {
    if (event.target.name !== 'answer') return;
    event.target.setCustomValidity(''); const id = event.target.closest('.word-card').dataset.word;
    drafts[id] = event.target.value; save(storageKey + '-drafts', drafts);
  });
  $('words').addEventListener('submit', event => { event.preventDefault(); check(event.target.closest('.word-card'), false); });
  $('words').addEventListener('click', event => {
    if (event.target.closest('.unknown')) check(event.target.closest('.word-card'), true);
    const button = event.target.closest('.restore');
    if (button) restore(button.closest('.word-card'), button);
  });
  document.querySelector('.collections').addEventListener('click', event => {
    const button = event.target.closest('[data-view]'); if (!button) return;
    view = button.dataset.view; page = 0; updateOverview(); render();
  });
  for (const id of ['search', 'filter', 'sort']) $(id).addEventListener(id === 'search' ? 'input' : 'change', () => { page = 0; render(); });
  function movePage(delta) { page += delta; render(); $('list-count').scrollIntoView({ block: 'start' }); }
  $('previous').onclick = () => movePage(-1); $('next').onclick = () => movePage(1);
  $('refresh').onclick = loadWords; $('connect').onclick = connect;
  absorbConnection(); loadWords(); checkConnection();
})();
