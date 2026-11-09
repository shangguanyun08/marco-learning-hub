(function () {
  'use strict';
  const endpoint = 'https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/meaning-scores';
  const testUrl = 'https://marco-10-word-meaning-trial.alexsoton.chatgpt.site/marco?test=';
  const status = document.getElementById('ai-score-status');
  const data = window.MARCO_FOCUSED_ROUND2;
  const picker = document.getElementById('ai-section-filter');
  const allSections = document.createElement('option');
  allSections.value = '';
  allSections.textContent = 'All sections';
  picker.append(allSections);
  const sections = [...data.sections, { number: 16, count: 50 }];
  for (const section of sections) {
    const option = document.createElement('option');
    option.value = String(section.number);
    option.textContent = 'Section ' + section.number + ' · ' + section.count + ' words';
    picker.append(option);
  }
  function sectionFromHash() {
    const section = location.hash.match(/^#section-(\d+)/);
    if (section) return Number(section[1]);
    const test = location.hash.match(/^#ai-test-(\d+)$/);
    return test ? data.aiTests.find(item => item.number === Number(test[1]))?.section : null;
  }
  function filterCards() {
    for (const test of data.aiTests) document.getElementById('ai-test-' + test.number).hidden = Boolean(picker.value) && test.section !== Number(picker.value);
    document.querySelectorAll('[data-focus-part]').forEach(card => { card.hidden = Boolean(picker.value) && picker.value !== '16'; });
  }
  picker.value = String(sectionFromHash() || '');
  picker.addEventListener('change', filterCards);
  window.addEventListener('hashchange', () => {
    const section = sectionFromHash();
    if (section && sections.some(item => item.number === section)) { picker.value = String(section); filterCards(); }
  });
  filterCards();
  let loading = false;

  function render(test) {
    const card = document.querySelector('[data-ai-test="' + test.number + '"]');
    if (!card) return;
    const attempts = test.attempts.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt) || b.id.localeCompare(a.id));
    const completed = attempts.filter(attempt => attempt.completedAt);
    const latest = completed[0];
    const best = completed.slice().sort((a, b) => b.score - a.score)[0];
    const current = attempts[0];
    card.querySelector('[data-ai-score]').textContent = latest ? latest.score + ' / ' + latest.total : '— / ' + test.total;
    const detail = card.querySelector('[data-ai-detail]');
    detail.textContent = latest ? Math.round(latest.score / latest.total * 100) + '% · Best ' + best.score + '/' + best.total : 'No completed score yet';
    if (completed.length > 1) {
      const change = latest.score - completed[1].score;
      detail.textContent += change === 0 ? ' · Same as previous' : ' · ' + (change > 0 ? '+' : '') + change + ' since previous';
    }
    const progress = card.querySelector('[data-ai-current]');
    progress.hidden = !current || Boolean(current.completedAt);
    progress.textContent = current ? 'Current attempt · ' + current.answered + '/' + current.total + ' checked' : '';
    const action = card.querySelector('[data-ai-open]');
    const unfinished = current && !current.completedAt;
    action.textContent = unfinished ? 'Continue test' : current ? 'Retest' : 'Start test';
    action.href = testUrl + test.number + (unfinished ? '' : '&retest=1');
    card.querySelector('[data-ai-attempt-count]').textContent = '(' + attempts.length + ')';
    const history = card.querySelector('[data-ai-history]');
    history.replaceChildren();
    if (!attempts.length) {
      history.textContent = 'No saved attempts yet.';
      return;
    }
    const list = document.createElement('ol');
    list.className = 'ai-score-attempts';
    attempts.forEach((attempt, index) => {
      const row = document.createElement('li');
      const title = document.createElement('span');
      title.textContent = 'Attempt ' + (attempts.length - index);
      const score = document.createElement('strong');
      score.textContent = attempt.completedAt ? attempt.score + ' / ' + attempt.total : 'In progress · ' + attempt.answered + '/' + attempt.total;
      const time = document.createElement('small');
      time.textContent = new Date(attempt.startedAt).toLocaleString();
      row.append(title, score, time);
      list.append(row);
    });
    history.append(list);
  }

  async function loadScores() {
    if (loading) return;
    loading = true;
    try {
      const response = await fetch(endpoint, { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(20000) });
      const body = await response.json();
      if (!response.ok || !Array.isArray(body.tests)) throw new Error('Scores unavailable');
      body.tests.forEach(render);
      status.textContent = 'Saved scores and retest history · View here without signing in';
    } catch {
      status.textContent = 'Scores could not refresh. Try again in a moment.';
    } finally {
      loading = false;
    }
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden) void loadScores(); });
  window.addEventListener('pageshow', () => void loadScores());
  window.addEventListener('online', () => void loadScores());
  setInterval(() => { if (!document.hidden) void loadScores(); }, 30000);
  void loadScores();
})();
