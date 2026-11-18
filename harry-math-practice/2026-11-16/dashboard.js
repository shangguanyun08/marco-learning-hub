(function (root) {
  'use strict';
  const links = [...document.querySelectorAll('.date-sessions a[data-session-id]')];
  const demo = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || new URLSearchParams(location.search).has('demo');
  const suffix = new URLSearchParams(location.search).has('demo') ? ':demo' : '';
  const finished = new Set();
  const known = new Set();
  const ids = ['f1', 'f2', 'f3', 'f4', 'f5'];
  let pending;
  function update(appId, state) {
    const link = links.find(item => item.dataset.appId === appId);
    if (!link || state?.version !== 1 || state.sessionId !== link.dataset.sessionId) return;
    known.add(appId);
    // A full first submission finishes the scored set. Corrections remain available.
    if (state.first && ids.every(id => typeof state.first.answers?.[id] === 'string' && state.first.answers[id].trim())) finished.add(appId);
    link.classList.toggle('is-finished', finished.has(appId));
    link.querySelector('.session-progress').textContent = finished.has(appId) ? 'Finished' : 'Not finished';
  }
  for (const link of links) {
    try {
      const state = JSON.parse(localStorage.getItem(link.dataset.appId + suffix + ':state') || 'null');
      if (state) update(link.dataset.appId, state);
    } catch { /* Online progress can still supply completion status. */ }
    if (demo && !known.has(link.dataset.appId)) update(link.dataset.appId, {version:1,sessionId:link.dataset.sessionId,first:null});
  }
  function refresh() {
    if (demo) return Promise.resolve();
    if (pending) return pending;
    pending = Promise.all(links.map(async link => {
      const appId = link.dataset.appId;
      const controller = new AbortController();
      const timeout = root.setTimeout(() => controller.abort(), 10000);
      try {
        const response = await root.fetch(root.HarrySkillSync.API + '?appId=' + encodeURIComponent(appId), {cache:'no-store',signal:controller.signal});
        if (!response.ok) throw new Error('Progress unavailable');
        const data = await response.json();
        update(appId, data.progress?.state || {version:1,sessionId:link.dataset.sessionId,first:null});
      } catch {
        if (!known.has(appId)) link.querySelector('.session-progress').textContent = 'Progress unavailable';
      } finally { root.clearTimeout(timeout); }
    })).finally(() => { pending = null; });
    return pending;
  }
  root.HarryFractionDashboard = {update, refresh};
  if (!demo) {
    void refresh();
    root.addEventListener('online', refresh);
    root.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void refresh(); });
    root.setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 15000);
  }
})(window);
