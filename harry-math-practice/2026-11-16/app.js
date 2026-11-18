(function (root) {
  'use strict';
  const E = root.HarryFractionReview;
  const key = E.APP_ID + (new URLSearchParams(location.search).has('demo') ? ':demo' : '');
  const demo = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || new URLSearchParams(location.search).has('demo');
  const host = document.getElementById('session-content');
  const status = document.getElementById('save-note');
  const expectedApp = document.querySelector('script[data-app-id]')?.dataset.appId;
  if (expectedApp && E.APP_ID !== expectedApp) {
    status.textContent = 'This session could not load completely. Refresh the page before answering.';
    return;
  }
  const escape = text => String(text).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const fraction = (n, d) => `<span class="fraction" aria-label="${n} over ${d}"><span>${n}</span><span>${d}</span></span>`;
  function math(text) {
    return escape(text).replace(/(\d+)\s+(\d+)\/(\d+)|(\d+)\/(\d+)/g, (_match, whole, n, d, top, bottom) =>
      whole ? `<span class="mixed-number"><span>${whole}</span>${fraction(n, d)}</span>` : fraction(top, bottom));
  }
  function answerMath(text) {
    const value = E.parse(text);
    if (!value) return '';
    const [n, d] = value;
    const whole = Math.floor(n / d), remainder = n % d;
    return remainder ? math(`${whole ? whole + ' ' : ''}${remainder}/${d}`) : String(whole);
  }
  let state = E.empty();
  let drafts = {};
  let sync;
  try {
    const saved = JSON.parse(localStorage.getItem(key + ':state') || 'null');
    if (E.valid(saved)) state = E.merge(saved, E.empty());
    const pending = JSON.parse(localStorage.getItem(key + ':drafts') || 'null');
    if (pending?.stage === (state.first?.id || 'first')) {
      for (const question of E.questions) if (typeof pending.answers?.[question.id] === 'string') drafts[question.id] = pending.answers[question.id].slice(0, 60);
    }
  } catch { status.textContent = 'Browser saving is unavailable. Keep this page open while you work.'; }

  function saveDrafts() {
    try { localStorage.setItem(key + ':drafts', JSON.stringify({stage: state.first?.id || 'first', answers: drafts})); }
    catch { status.textContent = 'Your selections could not save in this browser. Keep the page open.'; }
  }
  function saveState() {
    try { localStorage.setItem(key + ':state', JSON.stringify(state)); }
    catch { status.textContent = 'Browser saving is unavailable. Download your practice record before closing.'; }
  }
  const pendingQuestions = () => state.first ? E.missed(state) : E.questions;
  function updateButton() {
    const button = document.getElementById('submit-answers');
    if (!button) return;
    const pending = pendingQuestions();
    const left = pending.filter(question => !drafts[question.id]?.trim()).length;
    button.disabled = left > 0;
    document.getElementById('submit-note').textContent = left ? `${left} answer${left === 1 ? '' : 's'} left to fill in.` : 'All answers are ready to check.';
  }

  function card(question, index) {
    const first = state.first?.answers[question.id];
    const firstCorrect = first !== undefined && E.correct(question, first);
    const retry = state.retry?.answers[question.id];
    const corrected = retry !== undefined && E.correct(question, retry);
    const locked = Boolean(firstCorrect || state.retry);
    let outcome = 'pending';
    let tag = 'Results after submission';
    if (state.first) {
      outcome = firstCorrect ? 'right' : !state.retry ? 'first-wrong' : corrected ? 'corrected' : 'retry-wrong';
      tag = firstCorrect ? '✓ Correct on first try' : !state.retry ? '✗ Incorrect · Second try available' : corrected ? '✓ Corrected on second try' : '✗ Second try incorrect';
    }
    const value = locked ? retry ?? first : drafts[question.id] || '';
    const showMethod = firstCorrect || Boolean(state.retry);
    return `<article id="${question.id}" class="question ${outcome}">
      <div class="qhead"><h2>Question ${index + 1}</h2><span class="tag">${tag}</span></div>
      <p class="prompt">${math(question.prompt)} =</p>
      <div class="answer-entry"><label for="answer-${question.id}">${state.first && !firstCorrect ? 'Second answer' : 'Your answer'}</label><input class="answer-input" id="answer-${question.id}" data-question="${question.id}" aria-label="${state.first && !firstCorrect ? 'Second answer' : 'Answer'} to Question ${index + 1}" type="text" autocomplete="off" spellcheck="false" maxlength="60" value="${escape(value)}" ${locked ? 'disabled' : ''}></div>
      <p class="answer-preview" id="preview-${question.id}" aria-hidden="true">${answerMath(value)}</p>
      ${state.first && !firstCorrect ? `<p class="first-answer"><strong>First answer</strong> ${answerMath(first)}</p>` : ''}
      ${showMethod ? `<div class="explanation"><strong>Answer ${math(question.answer)}</strong><p>${math(question.explanation)}</p></div>` : ''}
    </article>`;
  }

  function render() {
    root.HarryFractionDashboard?.update(E.APP_ID, state);
    const score = E.score(state);
    const missed = E.missed(state);
    const finished = state.first && (!missed.length || state.retry);
    host.innerHTML = `${state.first ? `<section class="panel" id="result" tabindex="-1"><h2>${escape(E.SESSION_LABEL)} results</h2><strong class="result-number">${score}/5 · ${score * 20}%</strong><p class="score-caption">First-try score</p><p>${finished ? 'Review the methods below with your parent.' : 'Fill in each missed answer once more, then check your second try.'}</p>${state.retry ? `<p>${missed.filter(question => E.correct(question, state.retry.answers[question.id])).length}/${missed.length} mistakes corrected on the second try.</p>` : ''}</section>` : ''}
      <form id="session-form" novalidate>${E.questions.map(card).join('')}
      ${!finished ? `<section class="panel"><h2>${state.first ? 'Check your corrections' : 'Ready to check all five?'}</h2><p class="submit-note">${state.first ? 'Your original first-try score is kept.' : 'Fill in every answer before checking the set. Your first submitted answers earn the score.'}</p><p id="submit-note" role="status"></p><p id="format-error" class="format-error" role="alert"></p><button id="submit-answers" class="primary" type="submit">${state.first ? 'Check second try' : 'Submit all 5 answers'}</button></section>` : ''}</form>`;
    updateButton();
  }

  host.addEventListener('input', event => {
    const id = event.target.dataset.question;
    if (!pendingQuestions().some(question => question.id === id) || event.target.disabled) return;
    drafts[id] = event.target.value.slice(0, 60);
    document.getElementById('preview-' + id).innerHTML = answerMath(drafts[id]);
    saveDrafts();
    updateButton();
  });
  host.addEventListener('submit', event => {
    event.preventDefault();
    const answers = Object.fromEntries(pendingQuestions().map(question => [question.id, drafts[question.id] || '']));
    if (!E.submit(state, answers, new Date().toISOString(), root.crypto.randomUUID())) {
      const error = document.getElementById('format-error');
      if (error) error.textContent = 'Use a whole number, a fraction such as 7/3, or a mixed number such as 2 1/3. The denominator must be greater than zero.';
      return;
    }
    drafts = {};
    saveDrafts();
    saveState();
    render();
    document.getElementById('result')?.focus({preventScroll: true});
    void sync?.push();
  });
  document.getElementById('download').onclick = () => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(new Blob([JSON.stringify({session: E.SESSION_ID, state, drafts}, null, 2)], {type: 'application/json'}));
    link.href = url;
    link.download = `harry-math-${E.SESSION_ID}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  render();
  if (demo) status.textContent = 'Preview · Answers save on this device.';
  else {
    sync = root.HarrySkillSync.create({
      appId: E.APP_ID, engine: E, score: E.progressScore,
      getState: () => state,
      onRemote(next) {
        const stageChanged = state.first?.id !== next.first?.id;
        state = next;
        if (stageChanged) { drafts = {}; saveDrafts(); }
        saveState();
        render();
      },
      onStatus(kind, message) { status.dataset.status = kind; status.textContent = message.replace('Answers and method notes', 'First answers and second tries'); }
    });
    void sync.start();
  }
})(window);
