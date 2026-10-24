(function () {
  'use strict';
  const S = window.MarcoTest3Sync, E = window.MarcoTest3Engine, session = window.MARCO_ISEE_PRACTICE[0];
  const preview = ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:' || new URLSearchParams(location.search).has('demo');
  const KEY = S.APP_ID + (preview ? ':preview' : '');
  let state = { version: 1, sessions: {} }, message = preview ? 'Preview · Online records untouched' : 'Connecting to live online sync…';
  try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (S.valid(saved)) state = S.merge(state, saved); } catch {}
  function paint() {
    const run = state.sessions[session.id]?.at(-1), stats = E.stats(session, run);
    document.getElementById('kindle-tests-card').classList.toggle('is-complete', !!run?.completedAt);
    document.getElementById('kindle-tests-status').textContent = (run?.completedAt ? `✓ Completed · ${stats.first}/24 first try` : run ? `${stats.finished}/24 finished` : 'Ready to start') + ' · ' + message;
  }
  function remote(value) { state = S.merge(state, value); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} paint(); }
  paint();
  if (preview) return;
  const sync = S.create({ getState: () => state, onRemote: remote, onStatus(_kind, text) { message = text; paint(); } });
  void sync.start();
  window.addEventListener('storage', event => { if (event.key === KEY && event.newValue) try { const value = JSON.parse(event.newValue); if (S.valid(value)) { remote(value); void sync.push(); } } catch {} });
})();
