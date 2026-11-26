(() => {
  'use strict';

  function evidenceModel(data, sync) {
    return {
      valid: state => state?.version === 1 && Array.isArray(state.articles?.evidence),
      empty: () => sync.normalize(null),
      merge: sync.merge,
      stats(state) {
        const answers = state.articles.evidence?.[0]?.answers;
        const total = data.questions.length;
        let answered = 0;
        let first = 0;
        for (const {id} of data.questions) {
          const result = answers?.[id]?.[0]?.answerOK;
          if (typeof result !== 'boolean') continue;
          answered++;
          if (result) first++;
        }
        return {total, answered, first, complete: answered === total};
      }
    };
  }

  function mount(course, engine, local) {
    const tabs = [...document.querySelectorAll('.reading-sessions [data-session], .reading-sessions [data-course]')];
    const current = tabs.find(card => Number(card.dataset.session) === course.number);
    const otherSessions = tabs.filter(card => card !== current).map(card => {
      if (card.dataset.course === 'evidence-practice') {
        const data = {...window.EvidenceData, singleTry: true};
        return {card, data, model: evidenceModel(data, window.ReadingSync), remote: null};
      }
      const data = card.dataset.course === 'earlier-review'
        ? window.MarcoEarlierReadingData
        : course.dashboardCourses[Number(card.dataset.session) - 1];
      return { card, data, model: engine.forCourse(data), remote: null };
    });
    let refreshing = false;

    function paint(card, data, model, state, known, fallback) {
      const score = model.stats(state);
      const finished = score.complete && (data.archiveReview || data.singleTry || data.ids.every(id => model.reveal(state, id)));
      const result = `${score.first}/${score.total} correct first try`;
      const text = finished ? `✓ Finished · ${result}`
        : score.complete ? `First pass finished · ${result} · Retry available`
        : known || score.answered ? `${score.answered}/${score.total} answered` : fallback;
      card.classList.toggle('is-complete', finished);
      let label = card.querySelector('.reading-session-score');
      if (!label) {
        label = document.createElement('small');
        label.className = 'reading-session-score';
        card.append(label);
      }
      label.textContent = text;
    }

    function deviceState({data, model}) {
      try {
        const record = JSON.parse(localStorage.getItem(data.appId + (local ? ':preview' : '')));
        return model.valid(record) ? record : null;
      } catch {
        return null;
      }
    }

    async function refresh() {
      if (refreshing || document.visibilityState === 'hidden') return;
      refreshing = true;
      try {
        await Promise.all(otherSessions.map(async entry => {
          const {card, data, model} = entry;
          const paintSaved = fallback => {
            const device = deviceState(entry);
            paint(card, data, model, model.merge(device, entry.remote), local || !!device || !!entry.remote, fallback);
          };
          paintSaved('Loading progress…');
          if (local) return;
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          try {
            const url = new URL(window.MarcoQR4Sync.API);
            url.searchParams.set('appId', data.appId);
            const response = await fetch(url.href, {method: 'GET', cache: 'no-store', signal: controller.signal});
            if (!response.ok) throw new Error('Progress unavailable');
            const {progress} = await response.json();
            if (progress && !model.valid(progress.state)) throw new Error('Invalid reading progress');
            entry.remote = progress?.state || model.empty();
            paintSaved('Loading progress…');
          } catch {
            paintSaved('Progress unavailable');
          } finally {
            clearTimeout(timer);
          }
        }));
      } finally {
        refreshing = false;
      }
    }

    for (const event of ['focus', 'online', 'pageshow', 'storage']) window.addEventListener(event, refresh);
    document.addEventListener('visibilitychange', refresh);
    void refresh();
    return {
      paintActive(state, status) {
        if (current) paint(current, course, engine, state, local || status === 'live',
          status === 'offline' ? 'Progress unavailable' : 'Loading progress…');
      }
    };
  }

  window.MarcoReadingCards = {mount};
})();
