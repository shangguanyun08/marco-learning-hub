(() => {
  'use strict';

  const course = window.MarcoQR4Data;
  const engine = window.MarcoQR4Engine;
  const review = course.number === 1;
  const archiveReview = course.archiveReview === true;
  const practiceTestReview = course.number === 4;
  const evidenceReview = practiceTestReview || archiveReview;
  const params = new URLSearchParams(location.search);
  const demo = params.has('demo');
  const local = demo || ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
  const storageKey = course.appId + (local ? ':preview' : '');
  const skills = course.skills || {
    inference: 'Inference',
    vocabulary: 'Vocabulary in Context',
    organization: 'Organization / Logic',
    tone: 'Tone / Style / Figurative Language'
  };
  const letters = 'ABCD';
  const questionList = document.querySelector('#questions');
  const jumpList = document.querySelector('#question-jump');
  const saveNote = document.querySelector('#save-note');
  const repeatReview = document.querySelector('#repeat-review');
  const dashboard = window.MarcoReadingCards?.mount(course, engine, local);
  const articles = new Map();
  const jumps = new Map();
  const groups = new Map();
  const highlighted = new Set();
  const shownOriginals = new Set();
  let storageOK = true;
  let ready = local;
  let state = engine.empty();

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (engine.valid(saved)) state = saved;
  } catch {
    storageOK = false;
  }

  function updateStatus(kind, message) {
    const saved = storageOK || kind === 'live';
    saveNote.dataset.kind = saved ? kind : 'offline';
    saveNote.textContent = saved ? message : 'Device storage is unavailable. Keep this page open while you work.';
    dashboard?.paintActive(state, saveNote.dataset.kind);
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      storageOK = true;
    } catch {
      storageOK = false;
    }
  }

  function mergeProgress(other) {
    const previous = state;
    state = engine.merge(state, other);
    let changed = false;
    for (const id of course.ids) {
      if (JSON.stringify(engine.attempts(previous, id)) !== JSON.stringify(engine.attempts(state, id))) {
        renderQuestion(id);
        changed = true;
      }
    }
    if (changed) renderResults();
  }

  function refreshFromDevice() {
    let other;
    try {
      other = JSON.parse(localStorage.getItem(storageKey));
    } catch {
      return;
    }
    if (engine.valid(other)) mergeProgress(other);
  }

  function escapeHTML(text) {
    const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
    return text.replace(/[&<>"']/g, character => entities[character]);
  }

  function formatPassage(paragraphs, showClue) {
    return paragraphs.map(paragraph => {
      const safe = escapeHTML(paragraph).replace(/\[\[([^\]]+)\]\]/g, (_, clue) => showClue ? `<mark>${clue}</mark>` : clue);
      return `<p>${safe}</p>`;
    }).join('');
  }

  function answerStatus(attempts) {
    if (attempts.length === 0) return 'pending';
    if (attempts.some(attempt => attempt.correct)) return 'correct';
    return attempts.length === 1 ? 'retry' : 'missed';
  }

  function compareOriginal(question, attempts) {
    const [first, second] = attempts;
    if (first?.correct !== false || !second || !Number.isInteger(question.originalChoice)) return null;
    const original = question.originalChoice;
    const matchedAttempt = first.choice === original ? 1 : second.choice === original ? 2 : 0;
    const message = matchedAttempt === 1
      ? `Same wrong choice on the first try. ${second.correct ? 'Corrected on the second try.' : 'Still missed on the second try.'}`
      : matchedAttempt === 2 ? 'Same wrong choice on the second try.' : 'Chose a different wrong option this time.';
    return {question, matchedAttempt, message};
  }

  function renderRepeatReview() {
    const reviewed = course.ids.map(id => compareOriginal(course.questions[id], engine.attempts(state, id))).filter(Boolean);
    const matches = reviewed.filter(result => result.matchedAttempt);
    repeatReview.hidden = reviewed.length === 0;
    if (repeatReview.hidden) return;
    repeatReview.querySelector('summary').textContent = `Repeat misses · ${matches.length} matched the original`;
    document.querySelector('#repeat-review-results').innerHTML =
      `<p>${matches.length} of ${reviewed.length} misses with a completed second try matched the original wrong choice.</p>` +
      (matches.length ? `<ul>${matches.map(({question, message}) => `<li>
        <a href="#item-${question.id}" data-repeat-question="${question.id}">${escapeHTML(question.title)} · Mock ${question.mockNumber}, Q${question.questionNumber}</a>
        <span>${escapeHTML(message)}</span>
      </li>`).join('')}</ul>` : '');
  }

  function renderQuestion(id) {
    const question = course.questions[id];
    const attempts = engine.attempts(state, id);
    const last = attempts.at(-1);
    const revealed = engine.reveal(state, id);
    const result = answerStatus(attempts);
    const article = articles.get(id);
    const selected = article.querySelector('input:checked:not(:disabled)')?.value;
    const title = archiveReview ? `Question ${question.questionNumber}`
      : question.mock ? `Mock #${question.mock} · ${question.title}` : question.title;
    const headingTag = archiveReview ? 'h4' : 'h3';
    const source = question.test ? `Practice Test ${question.test} · Q${question.questionNumber}` : '';
    const num = question.mock || (practiceTestReview ? question.questionNumber : course.ids.indexOf(id) + 1);
    const showClue = evidenceReview ? highlighted.has(id) : question.skill === 'organization' && (review || revealed);
    const showOriginal = shownOriginals.has(id);
    const original = question.originalChoice;
    const comparison = archiveReview ? compareOriginal(question, attempts) : null;
    const evidenceId = archiveReview ? `evidence-${id}` : `passage-${id}`;
    const evidenceButton = `<button class="evidence-toggle" type="button" data-evidence="${id}" aria-controls="${evidenceId}" aria-pressed="${showClue}" aria-label="Highlight evidence for ${archiveReview ? title.toLowerCase() : 'question ' + num}">Highlight evidence</button>`;
    const resultText = {
      pending: '',
      retry: 'Try once more. Reread the passage and choose a different answer.',
      correct: attempts.length === 1 ? 'Correct on the first try.' : 'Corrected on the second try.',
      missed: 'Read the explanation below, then try the same skill on a new passage.'
    };

    article.innerHTML = `
      <header><${headingTag} id="title-${id}">${escapeHTML(title)}</${headingTag}><span class="source">${escapeHTML(skills[question.skill])}</span>
        ${source ? `<span class="source">${escapeHTML(source)}</span>` : ''}
        ${archiveReview ? `<a class="read-passage" href="#passage-${question.passageId}">Reread passage</a>` : ''}</header>
      ${archiveReview ? '' : `<div class="reading-passage" id="passage-${id}" aria-label="Passage">${formatPassage(question.passage, showClue)}</div>`}
      ${practiceTestReview ? `<div class="review-tools">
        ${evidenceButton}
        ${revealed ? `<button class="evidence-toggle" type="button" data-original="${id}" aria-controls="original-${id}" aria-expanded="${showOriginal}">${showOriginal ? 'Hide' : 'Show'} Marco’s answer</button>` : ''}
      </div>
      ${revealed ? `<p class="original-choice" id="original-${id}" ${showOriginal ? '' : 'hidden'}><strong>Marco picked on Practice Test 4:</strong> ${letters[original]}. ${escapeHTML(question.choices[original])}</p>` : ''}` : ''}
      <form data-question="${id}">
        <fieldset class="choices">
          <legend class="prompt">${escapeHTML(question.prompt)}</legend>
          ${question.choices.map((choice, index) => {
            const wrong = attempts.some(attempt => attempt.choice === index && !attempt.correct);
            const className = revealed && index === question.correct ? ' correct' : wrong ? ' wrong' : '';
            const checked = revealed ? last?.choice === index : selected === String(index) && !wrong;
            return `<label class="choice${className}">
              <input type="radio" name="${id}" value="${index}" ${checked ? 'checked' : ''} ${revealed || wrong ? 'disabled' : ''}>
              <span class="letter">${letters[index]}.</span><span>${escapeHTML(choice)}</span>
            </label>`;
          }).join('')}
        </fieldset>
        ${revealed ? '' : `<button class="primary" type="submit" ${ready ? '' : 'disabled'}>${last ? 'Check second try' : 'Check answer'}</button>`}
        <p class="feedback" data-result="${result}" tabindex="-1" role="status">${resultText[result]}</p>
      </form>
      ${archiveReview && attempts.length ? `<div class="review-tools">${evidenceButton}</div>
        <div class="review-evidence" id="${evidenceId}" ${showClue ? '' : 'hidden'}>
          ${question.evidence.map(clue => `<p><mark>${escapeHTML(clue)}</mark></p>`).join('')}
        </div>` : ''}
      ${revealed ? `<p class="reading-explanation"><strong>Answer ${letters[question.correct]}.</strong> ${escapeHTML(question.explanation)}</p>` : ''}
      ${comparison ? `<details class="original-comparison">
        <summary>Compare with original mock</summary>
        <p><strong>Original choice · ${letters[original]}.</strong> ${escapeHTML(question.choices[original])}</p>
        <p>${escapeHTML(comparison.message)}</p>
      </details>` : ''}`;

    const jump = jumps.get(id);
    if (!jump) return;
    jump.dataset.result = result;
    const jumpStatus = {pending: 'unanswered', retry: 'second try available', correct: 'correct', missed: 'review explanation'};
    jump.setAttribute('aria-label', `${review ? 'Mock question' : 'Question'} ${num}, ${jumpStatus[result]}`);
  }

  function renderReviewScore(score) {
    const answered = `${score.answered} of ${score.total} answered`;
    document.getElementById('overall-score').textContent = score.answered
      ? `${Math.round(100 * score.first / score.answered)}% · ${answered}`
      : answered;
    document.getElementById('review-correct').textContent = score.first;
    document.getElementById('review-wrong').textContent = score.wrong;
    document.getElementById('review-total').textContent = score.total;

    const pending = course.ids.filter(id => {
      const tries = engine.attempts(state, id);
      return tries.length === 1 && !tries[0].correct;
    }).length;
    const retrySummary = [];
    if (score.wrong > pending) {
      if (score.complete && pending === 0) retrySummary.push(`After retries · ${score.first + score.corrected}/${score.total} correct`);
      retrySummary.push(`${score.corrected} corrected on the second try`, `${score.wrong - score.corrected - pending} still wrong`);
    }
    if (pending) retrySummary.push(`${pending} ${pending === 1 ? 'retry' : 'retries'} available`);
    const retryScore = document.getElementById('review-retry-score');
    retryScore.textContent = retrySummary.join(' · ');
    retryScore.hidden = !retrySummary.length;
  }

  function renderResults() {
    dashboard?.paintActive(state, saveNote.dataset.kind);
    const overall = engine.stats(state);
    const percent = score => Math.round(100 * score.first / score.total);
    if (archiveReview) {
      renderReviewScore(overall);
    } else {
      document.getElementById('overall-score').textContent = overall.complete
        ? `Complete · ${overall.first}/${overall.total} (${percent(overall)}%) first try`
        : `${overall.answered} of ${overall.total} answered`;
    }
    const activeSkills = new Set(course.ids.map(id => course.questions[id].skill));
    document.getElementById('skill-scores').innerHTML = Object.entries(skills).filter(([key]) => activeSkills.has(key)).map(([key, label]) => {
      const score = engine.stats(state, key);
      const corrections = score.corrected ? `<p class="corrections">${score.corrected} corrected on the second try</p>` : '';
      if (archiveReview) {
        const missing = score.total - score.answered;
        return `<section><h3>${escapeHTML(label)}</h3>
          <p><strong>${score.first}/${score.total} correct</strong> · ${score.wrong} wrong${missing ? ` · ${missing} unanswered` : ''}</p>
          ${corrections}</section>`;
      }
      const summary = score.complete
        ? `${score.first}/${score.total} · ${percent(score)}%`
        : `${score.first} correct · ${score.answered}/${score.total} answered`;
      return `<section><h4>${escapeHTML(label)}</h4><p><strong>${summary}</strong> first try</p>
        ${corrections}</section>`;
    }).join('');
    if (repeatReview) renderRepeatReview();
  }

  function sessionLink(number, redo = false) {
    return `?session=${number}${redo ? '&redo=1' : ''}${demo ? '&demo=1' : ''}`;
  }

  function setupPassageGroups() {
    const filter = document.querySelector('#review-passage');
    filter.add(new Option(`All passages (${course.passages.length})`, ''));
    for (const {id, title, mockNumber, passage, ids} of course.passages) {
      const group = document.createElement('section');
      group.className = 'review-group';
      group.setAttribute('aria-labelledby', `heading-${id}`);
      group.innerHTML = `<h3 id="heading-${id}">${escapeHTML(title)}</h3>
        <p class="passage-meta">Mock ${mockNumber} · ${ids.length} ${ids.length === 1 ? 'question' : 'questions'}</p>
        <div class="reading-passage" id="passage-${id}" tabindex="-1" aria-labelledby="heading-${id}">${formatPassage(passage, false)}</div>`;
      questionList.append(group);
      groups.set(id, group);
      filter.add(new Option(`${title} · Mock ${mockNumber}`, id));
    }
    function showPassage() {
      for (const [id, group] of groups) group.hidden = Boolean(filter.value && filter.value !== id);
    }
    filter.addEventListener('change', showPassage);
    repeatReview.addEventListener('click', event => {
      const link = event.target.closest('[data-repeat-question]');
      if (!link) return;
      if (filter.value) filter.value = course.questions[link.dataset.repeatQuestion].passageId;
      showPassage();
    });
  }

  function setup() {
    if (course.number === 2) {
      document.querySelector('#session-heading').textContent = 'Session 2 · Practice both skills';
      document.querySelector('#session-intro').textContent = 'Read each short passage and answer one question. Your first answers count toward the two skill scores. A miss gets one second try.';
    }
    if (course.number === 3) {
      document.querySelector('#session-heading').textContent = 'Session 3 · Practice Tests 1 and 2';
      document.querySelector('#session-intro').textContent = 'Answer 10 questions from Test Innovators Practice Tests 1 and 2. Read the excerpt provided with each question. A miss gets one second try.';
    }
    if (practiceTestReview) {
      document.querySelector('#session-heading').textContent = course.redo ? 'Session 4 · Redo five misses' : 'Session 4 · Review five misses';
      document.querySelector('#session-intro').textContent = 'Retry five questions from Practice Test 4. The excerpts are shortened and adapted for this review.';
      document.querySelector('.signal-guide').hidden = true;
      document.querySelector('#evidence-guide').hidden = false;
      const redoLink = document.querySelector('#redo-review');
      document.querySelector('.review-redo').hidden = false;
      redoLink.href = sessionLink(4, !course.redo);
      redoLink.textContent = course.redo ? 'Back to saved review' : 'Redo from scratch';
    }
    for (const tab of document.querySelectorAll('.reading-sessions [data-session]')) {
      tab.href = sessionLink(tab.dataset.session, Number(tab.dataset.session) === 4 && course.redo);
      if (Number(tab.dataset.session) === course.number) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    }
    const otherSession = document.querySelector('#other-session');
    if (otherSession) {
      const nextSession = course.number === course.sessionCount ? 1 : course.number + 1;
      otherSession.href = sessionLink(nextSession);
      otherSession.textContent = `Open Session ${nextSession}`;
    }

    if (archiveReview) setupPassageGroups();
    for (const [index, id] of course.ids.entries()) {
      const question = course.questions[id];
      const article = document.createElement('article');
      article.className = 'question';
      article.id = `item-${id}`;
      article.setAttribute('aria-labelledby', `title-${id}`);
      (groups.get(question.passageId) || questionList).append(article);
      articles.set(id, article);

      if (jumpList) {
        const jump = document.createElement('a');
        jump.href = `#item-${id}`;
        jump.textContent = question.mock || (practiceTestReview ? question.questionNumber : index + 1);
        jumpList.append(jump);
        jumps.set(id, jump);
      }
      renderQuestion(id);
    }
    renderResults();
  }

  const sync = local ? null : window.MarcoQR4Sync.create({
    appId: course.appId,
    engine,
    getState() {
      refreshFromDevice();
      return state;
    },
    onRemote(other) {
      mergeProgress(other);
      save();
    },
    onStatus: updateStatus
  });

  questionList.addEventListener('click', event => {
    const originalButton = event.target.closest('button[data-original]');
    if (originalButton) {
      const id = originalButton.dataset.original;
      const show = !shownOriginals.has(id);
      if (show) shownOriginals.add(id);
      else shownOriginals.delete(id);
      originalButton.setAttribute('aria-expanded', String(show));
      originalButton.textContent = show ? 'Hide Marco’s answer' : 'Show Marco’s answer';
      document.querySelector(`#original-${id}`).hidden = !show;
      return;
    }
    const button = event.target.closest('button[data-evidence]');
    if (!button) return;
    const id = button.dataset.evidence;
    const show = !highlighted.has(id);
    if (show) highlighted.add(id);
    else highlighted.delete(id);
    button.setAttribute('aria-pressed', String(show));
    const target = document.getElementById(button.getAttribute('aria-controls'));
    if (archiveReview) target.hidden = !show;
    else target.innerHTML = formatPassage(course.questions[id].passage, show);
  });

  questionList.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;
    if (!ready) return;
    refreshFromDevice();
    if (!form.isConnected) return;
    const id = form.dataset.question;
    const choice = form.querySelector('input:checked:not(:disabled)');
    if (!choice) {
      form.querySelector('.feedback').textContent = 'Choose an answer first.';
      return;
    }
    if (engine.submit(state, id, Number(choice.value))) {
      save();
      if (sync) void sync.push();
      else updateStatus('local', 'Progress saved on this device.');
      renderQuestion(id);
      renderResults();
      articles.get(id).querySelector('.feedback').focus({preventScroll: true});
    }
  });

  setup();
  window.addEventListener('storage', event => {
    if (event.key === storageKey) refreshFromDevice();
  });
  if (sync) {
    void sync.start().finally(() => {
      ready = true;
      for (const button of questionList.querySelectorAll('button[type="submit"]')) button.disabled = false;
    });
  } else updateStatus('local', 'Progress saved on this device.');
})();
