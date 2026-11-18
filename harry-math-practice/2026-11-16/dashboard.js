(function (root) {
  'use strict';
  const links = [...document.querySelectorAll('.date-sessions a[data-session-id]')];
  const demo = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || new URLSearchParams(location.search).has('demo');
  const suffix = new URLSearchParams(location.search).has('demo') ? ':demo' : '';
  const finished = new Map();
  const known = new Set();
  const ids = ['f1', 'f2', 'f3', 'f4', 'f5'];
  // These session IDs keep their original answer values; tests check every bank.
  const values = {
    '2026-11-16': [[389,45],[59,6],[13,5],[23,6],[13,8]],
    '2026-11-17': [[131,15],[35,4],[17,5],[43,12],[19,8]],
    '2026-11-18': [[119,12],[19,2],[29,8],[23,6],[5,2]]
  };
  const dateFormat = new Intl.DateTimeFormat('en-US', {timeZone:'America/Los_Angeles',month:'short',day:'numeric',year:'numeric'});
  const timeFormat = new Intl.DateTimeFormat('en-US', {timeZone:'America/Los_Angeles',hour:'numeric',minute:'2-digit',hour12:true,timeZoneName:'short'});
  let pending;
  function showDetails(link, result) {
    let details = link.querySelector('.session-details');
    if (!details) {
      details = document.createElement('span');
      details.className = 'session-details';
      details.innerHTML = '<span class="session-score"><span>First try</span><strong></strong></span><time class="session-finished"><span class="finished-date"></span><span class="finished-time"></span></time>';
      link.append(details);
    }
    details.querySelector('.session-score strong').textContent = `${result.score}/5 · ${result.score * 20}%`;
    const time = details.querySelector('time');
    time.hidden = !Number.isFinite(Date.parse(result.at));
    if (!time.hidden) {
      time.dateTime = new Date(result.at).toISOString();
      time.title = 'Finished first try · Pacific time';
      time.querySelector('.finished-date').textContent = dateFormat.format(new Date(result.at));
      time.querySelector('.finished-time').textContent = timeFormat.format(new Date(result.at));
    }
  }
  function update(appId, state) {
    const link = links.find(item => item.dataset.appId === appId);
    if (!link || state?.version !== 1 || state.sessionId !== link.dataset.sessionId) return;
    known.add(appId);
    // A full first submission finishes the scored set. Corrections remain available.
    if (state.first && ids.every(id => typeof state.first.answers?.[id] === 'string' && state.first.answers[id].trim())) {
      const score = values[state.sessionId].filter((value, index) => root.HarryFractionReview.correct({value}, state.first.answers[ids[index]])).length;
      finished.set(appId, {at:state.first.at, score});
    }
    link.classList.toggle('is-finished', finished.has(appId));
    link.querySelector('.session-progress').textContent = finished.has(appId) ? 'Finished' : 'Not finished';
    if (finished.has(appId)) showDetails(link, finished.get(appId));
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
