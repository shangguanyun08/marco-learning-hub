(() => {
  'use strict';
  const api = 'https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/marco-word-archive';
  const connectUrl = 'https://marco-10-word-meaning-trial.alexsoton.chatgpt.site/marco/archive-connect';
  const storageKey = 'marco-word-archive-v1';
  const words = window.MARCO_PRIORITY_WORDS;
  const byId = new Map(words.map(word => [word.id, word]));
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Keep the active page usable when storage is unavailable. */ } };
  const drafts = read(storageKey + '-drafts') || {};
  const pending = read(storageKey + '-pending') || {};
  const results = read(storageKey + '-results') || {};
  let token = read(storageKey + '-session') || '', ready = false;

  function connectionMessage(message) {
    $('connection-text').textContent = message;
    $('connection-text').hidden = !message;
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
    } else connectionMessage('Connect AI again to check meanings.');
    history.replaceState(null, '', location.pathname + location.search);
  }
  async function request(action, body) {
    const url = new URL(api); url.searchParams.set('action', action);
    const headers = {};
    if (token) headers.authorization = 'Bearer ' + token;
    if (body) headers['content-type'] = 'application/json';
    const response = await fetch(url, { method: body ? 'POST' : 'GET', headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(55000), cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) {
      if (result.code === 'connect_required') {
        ready = false; token = ''; save(storageKey + '-session', ''); $('connect').hidden = false;
      }
      throw new Error(result.error || 'Please try again.');
    }
    return result;
  }
  async function checkConnection() {
    if (!token) return;
    try { const status = await request('status'); ready = Boolean(status.ready); }
    catch (error) { connectionMessage(error.message); }
    $('connect').hidden = ready;
  }
  function connect() {
    const state = { id: crypto.randomUUID(), at: Date.now() };
    try { sessionStorage.setItem(storageKey + '-pairing', JSON.stringify(state)); }
    catch { connectionMessage('Allow browser storage, then connect AI.'); return; }
    location.href = connectUrl + '?state=' + state.id;
  }
  function showResult(row, outcome) {
    const feedback = row.querySelector('.feedback');
    feedback.hidden = false;
    feedback.className = 'feedback' + (outcome === 'correct' ? ' correct' : '');
    feedback.textContent = outcome === 'correct' ? '✓ Close' : (outcome === 'wrong' ? 'Try again · ' : '') + byId.get(row.dataset.word).meaning;
  }
  function render() {
    const direction = $('sort').value === 'hard' ? -1 : 1;
    const ordered = [...words].sort((a, b) => direction * (a.difficulty - b.difficulty) || a.word.localeCompare(b.word));
    $('words').innerHTML = ordered.map(word => `
      <article class="word-row" data-word="${escape(word.id)}">
        <h2>${escape(word.word)}</h2>
        <form class="check-form"><label for="answer-${escape(word.id)}">Meaning of ${escape(word.word)}</label><input id="answer-${escape(word.id)}" name="answer" maxlength="240" autocomplete="off" placeholder="Short meaning" value="${escape(drafts[word.id] || '')}"><button type="submit">Check</button><button type="button" class="unknown">I don’t know</button><p class="feedback" role="status" hidden></p></form>
      </article>`).join('');
    for (const row of $('words').querySelectorAll('.word-row')) {
      if (results[row.dataset.word]) showResult(row, results[row.dataset.word]);
    }
  }
  async function check(row, unknown) {
    const id = row.dataset.word, form = row.querySelector('form'), input = form.elements.answer, feedback = form.querySelector('.feedback');
    if (form.dataset.checking) return;
    const answer = unknown ? '' : input.value.trim();
    if (!answer && !unknown) { input.setCustomValidity('Write a short meaning.'); input.reportValidity(); return; }
    input.setCustomValidity('');
    if (unknown) { results[id] = 'unknown'; save(storageKey + '-results', results); showResult(row, 'unknown'); }
    form.dataset.checking = 'true';
    form.querySelectorAll('button').forEach(button => { button.disabled = true; }); input.disabled = true;
    $('sort').disabled = true;
    try {
      await connectionCheck;
      if (!ready) {
        if (!unknown) { connectionMessage('Connect AI to check your meaning. Your answer is kept.'); $('connect').focus(); }
        return;
      }
      connectionMessage('');
      if (!unknown) { feedback.hidden = false; feedback.className = 'feedback'; feedback.textContent = 'Checking…'; }
      const existing = pending[id];
      const body = existing && existing.answer === answer && existing.unknown === unknown ? existing : { requestId: crypto.randomUUID(), wordId: id, answer, unknown };
      pending[id] = body; save(storageKey + '-pending', pending);
      const checked = await request('check', body);
      results[id] = checked.close ? 'correct' : unknown ? 'unknown' : 'wrong';
      save(storageKey + '-results', results); showResult(row, results[id]);
      delete pending[id]; save(storageKey + '-pending', pending);
    } catch (error) {
      feedback.hidden = false; feedback.className = 'feedback error';
      const message = error.name === 'TimeoutError' ? 'Press Check again to recover this result.' : error.message;
      feedback.textContent = unknown ? byId.get(id).meaning + ' · Could not save. ' + message : message;
    } finally {
      delete form.dataset.checking;
      form.querySelectorAll('button').forEach(button => { button.disabled = false; }); input.disabled = false;
      $('sort').disabled = Boolean($('words').querySelector('[data-checking]'));
    }
  }
  $('words').addEventListener('input', event => {
    if (event.target.name !== 'answer') return;
    const row = event.target.closest('.word-row'), id = row.dataset.word;
    event.target.setCustomValidity(''); drafts[id] = event.target.value;
    delete results[id]; save(storageKey + '-drafts', drafts); save(storageKey + '-results', results);
    row.querySelector('.feedback').hidden = true;
  });
  $('words').addEventListener('submit', event => { event.preventDefault(); check(event.target.closest('.word-row'), false); });
  $('words').addEventListener('click', event => { if (event.target.closest('.unknown')) check(event.target.closest('.word-row'), true); });
  $('sort').onchange = render;
  $('connect').onclick = connect;
  absorbConnection(); render();
  const connectionCheck = checkConnection();
})();
