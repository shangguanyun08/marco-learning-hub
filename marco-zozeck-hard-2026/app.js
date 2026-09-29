(() => {
  'use strict';
  const Core = window.VocabularyQuiz;
  const sourceWords = window.MARCO_ZOZECK_HARD_WORDS;
  const originalWords = sourceWords.map(word => ({...word, session: word.session - 6}));
  const words = [...window.MARCO_ZOZECK_REDO_WORDS, ...originalWords, ...window.MARCO_ZOZECK_EXTENSION_WORDS];
  Core.configureLayout(words);
  const byId = new Map(words.map(word => [word.id, word]));
  // Preserve the existing session keys and word IDs, including partial and finished rounds.
  const sessions = [5,6,7,8,1,2,3,4,9,10,11,12,13,14].map((number, index) => ({
    number, displayNumber: index + 1,
    words: words.filter(word => word.session === number)
  }));
  const optionCache = new Map();
  function optionsFor(word, round) {
    const key = `${selected}:${word.id}:${round}`;
    if (!optionCache.has(key)) optionCache.set(key, Core.options(word, round, words, selected));
    return optionCache.get(key);
  }
  const APP_ID = 'marco-zozeck-hard-2026';
  const STORAGE_KEY = 'marco-zozeck-hard-2026-v1';
  const TEST_KEY = 'marco-zozeck-hard-2026-tests-v1';
  const SELECTION_KEY = 'marco-zozeck-hard-2026-redo-selection-v2';
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.protocol === 'file:';
  const app = document.getElementById('app');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  let progress = Core.merge(read(STORAGE_KEY), read(TEST_KEY));
  let selected = Number(new URLSearchParams(location.search).get('session')) || Number(read(SELECTION_KEY)) || 5;
  if (!sessions.some(session => session.number === selected)) selected = 5;
  let view = location.hash === '#results' ? 'results' : 'practice';
  let sync = null;
  let banner = '';
  let storageError = false;
  const now = () => new Date().toISOString();
  const info = number => sessions.find(session => session.number === number);
  const range = number => `${info(number).words.length} questions`;
  const label = number => `Session ${info(number).displayNumber}${number >= 13 ? ' · VR Test · 20 minutes' : number >= 9 ? ' · Sentence Completion' : ''}`;
  const date = value => value ? new Intl.DateTimeFormat(undefined, {month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(value)) : 'Not started';
  const answered = round => round ? round.ids.filter(id => round.answers[id]).length : 0;
  const current = () => Core.current(progress.sessions[selected]);
  const timed = round => Boolean(round?.timeLimitSeconds && !round.finishedAt);
  const clockText = milliseconds => {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,'0')}`;
  };
  function expireTests() {
    let changed = false;
    for (const session of sessions.filter(s => s.number >= 13)) {
      const round = Core.current(progress.sessions[session.number]);
      if (timed(round) && Date.now() >= Date.parse(round.deadlineAt)) {
        changed = Boolean(Core.finishTimed(progress, session.number, now())) || changed;
        if (session.number === selected) banner = 'Time is up. Your test was submitted; unanswered questions count as incorrect.';
      }
    }
    if (changed) save();
    return changed;
  }
  function testReport() {
    const first = progress.sessions[selected]?.rounds[0];
    if (!first?.timeLimitSeconds || !first.finishedAt) return '';
    const scores = ['synonym','completion'].map(type => first.ids.filter(id => byId.get(id).quizType === type && first.answers[id]?.correct).length);
    return `<section class="test-report"><div><h2>VR Test: ${scores[0]+scores[1]}/40</h2><p>Synonyms ${scores[0]}/20 · Sentence Completion ${scores[1]}/20 · Time ${clockText(Date.parse(first.finishedAt)-Date.parse(first.startedAt))}</p><p>Your submitted score is saved. Subsequent rounds are untimed.</p></div><button data-view="results">View answers &amp; explanations</button></section>`;
  }
  function save() {
    progress = Core.merge(progress, read(STORAGE_KEY));
    storageError = !write(TEST_KEY, progress);
    storageError = !write(STORAGE_KEY, progress) || storageError;
    sync?.push(progress);
  }
  function startSession(number) {
    selected = number;
    write(SELECTION_KEY, selected);
    if (number < 13 && Core.start(progress, number, info(number).words.map(word => word.id), now())) save();
    expireTests();
  }
  function header() {
    const intro = '331 questions across Sessions 1–14. Sessions 9–12 each have 20 Sentence Completion questions. Sessions 13–14 are 20-minute VR tests: 20 synonyms + 20 sentence completions each. Later rounds cover missed questions.';
    return `<header class="topbar"><div><p class="eyebrow">Marco · Synonyms &amp; sentence completion</p><h1>2026 Zozeck Hard</h1><p class="course-intro">${intro}</p><p class="course-links"><a href="../marco-isee-words-250/?session=6">Archived 250 ISEE word list →</a></p></div>
      <nav aria-label="Main navigation"><button data-view="practice" class="${view === 'practice' ? 'active' : ''}" aria-pressed="${view === 'practice'}">Practice</button><button data-view="results" class="${view === 'results' ? 'active' : ''}" aria-pressed="${view === 'results'}">Results</button></nav></header>`;
  }
  function picker() {
    const button = session => {
      const record = progress.sessions[session.number];
      const round = Core.current(record);
      const status = record?.completedAt ? 'Mastered' : timed(round) ? `Test running · ${answered(round)}/40` : round ? `Round ${round.number} · ${answered(round)}/${round.ids.length}` : 'Not started';
      return `<button data-session="${session.number}" class="${selected === session.number ? 'selected' : ''} ${record?.completedAt ? 'mastered' : ''}" aria-pressed="${selected === session.number}"><span>${label(session.number)}</span><strong>${range(session.number)}</strong><small>${status}</small></button>`;
    };
    return `<section class="session-picker" aria-label="Choose a session"><div class="session-group-grid">${sessions.map(button).join('')}</div></section>`;
  }
  function syncNote() {
    return `<div class="sync-note" data-online-sync="${APP_ID}" role="status" aria-live="polite"><span aria-hidden="true"></span>${local ? 'Preview · answers save on this device only.' : 'Connecting online…'}</div>`;
  }
  function question() {
    const record = progress.sessions[selected];
    if (selected >= 13 && !record) {
      return `<section class="test-start session-summary"><p class="eyebrow">Past-paper verbal reasoning</p><h2>${label(selected)}</h2><p>40 questions · 20 minutes total</p><p>Questions 1–20: Synonyms<br>Questions 21–40: Sentence Completion</p><p>Answer in any order and change your choices before submitting. Answers and explanations appear after submission. Unanswered questions count as incorrect.</p><p>The timer keeps running if you leave this page or refresh.</p><button class="finish-round" data-start-test>Start 20-minute test</button></section>`;
    }
    if (record?.completedAt) {
      const next = sessions[sessions.findIndex(session => session.number === selected) + 1]?.number;
      const nextLabel = next ? `Continue to ${label(next)}` : '';
      const itemName = 'questions';
      return testReport() + `<section class="complete-card"><div><div class="checkmark">✓</div><h2>${label(selected)} mastered</h2><p>All ${info(selected).words.length} ${itemName} in this session have been answered correctly. Every round is preserved in Results.</p><div class="complete-actions">${next ? `<button data-session="${next}">${nextLabel}</button>` : ''}<button class="secondary" data-view="results">View results</button></div></div></section>`;
    }
    const savedRound = current();
    const round = {...savedRound, ids: Core.questionOrder(savedRound.ids, selected, savedRound.number)};
    return testReport() + `<section class="session-workspace" aria-label="${label(selected)}, Round ${round.number}">${timed(round) ? `<div class="timer-bar"><span>Time remaining</span><strong data-timer role="timer" aria-label="Time remaining">${clockText(Date.parse(round.deadlineAt)-Date.now())}</strong><span>20 synonyms + 20 sentence completions</span></div>` : ''}<div class="session-summary"><div class="session-summary-heading"><div><div class="round-heading"><span>${label(selected)}</span><small>${range(selected)}</small></div><div class="round-subheading"><h2>Round ${round.number}</h2><span>${round.number === 1 ? `All ${round.ids.length} questions on this page` : 'Previous round’s missed questions'}</span></div></div><div class="stats"><div><strong>${answered(round)}</strong><span>answered</span></div><div><strong>${round.ids.length - answered(round)}</strong><span>remaining</span></div></div>${finishButton(round)}</div>
      <div class="progress" role="progressbar" aria-label="Round progress" aria-valuenow="${answered(round)}" aria-valuemin="0" aria-valuemax="${round.ids.length}"><span style="width:${answered(round) / round.ids.length * 100}%"></span></div>
      <p class="grid-label">Jump to a question</p><div class="number-grid" aria-label="Question progress">${round.ids.map((id,index) => {
        const value = round.answers[id];
        const status = value ? timed(round) ? 'answered-pending' : value.correct ? 'answered-correct' : 'answered-wrong' : '';
        const description = value ? timed(round) ? 'answered' : value.correct ? 'correct' : 'incorrect' : 'unanswered';
        return `<button data-jump="${escape(id)}" class="${status}" aria-label="Question ${index + 1}: ${description}">${index + 1}</button>`;
      }).join('')}</div><p class="locked-note">${timed(round) ? 'Answer in any order. You can change a choice until you submit or time runs out.' : 'Answer in any order. Each answer saves and stays locked.'}</p></div>
      <div class="session-questions">${round.ids.map((id,index) => wordQuestion(round,id,index)).join('')}</div>
      <div class="round-footer"><span>${timed(round) ? 'Submit when ready. The test also submits automatically when time runs out.' : answered(round) === round.ids.length ? 'All answers are saved. Finish this round to continue.' : `${round.ids.length - answered(round)} questions left before you can finish this round.`}</span>${finishButton(round)}</div></section>`;
  }
  function finishButton(round) {
    if (timed(round)) return `<button class="finish-round" data-submit-test data-round="${round.number}">Submit test${answered(round) < round.ids.length ? ` · ${round.ids.length-answered(round)} unanswered` : ''}</button>`;
    return `<button class="finish-round" data-finish-round data-round="${round.number}" ${answered(round) === round.ids.length ? '' : 'disabled'}>Finish round &amp; save</button>`;
  }
  function wordQuestion(round, id, index) {
    const word = byId.get(id);
    const completion = word.quizType === 'completion';
    const definition = word.quizType === 'definition';
    const answer = round.answers[id];
    const options = optionsFor(word, round.number);
    const pos = {'adjective':'adj.','noun':'n.','verb':'v.','adverb':'adv.'}[word.partOfSpeech] || word.partOfSpeech;
    const rightChoice = word.answer;
    const promptLabel = completion ? 'Choose the word or pair that best completes the sentence' : definition ? 'Choose the vocabulary word' : 'Choose the closest synonym';
    const prompt = definition ? `${pos} ${word.meaning}` : word.word;
    return `<article class="question-item ${completion ? 'completion-question' : ''}" id="word-${escape(id)}" data-word-id="${escape(id)}" data-round="${round.number}" data-session-number="${selected}" aria-labelledby="heading-${escape(id)}"><div class="question-item-topline"><span>Question ${index + 1}</span><small>${completion ? 'Sentence completion' : definition ? 'Word meaning' : 'Synonym'}</small></div><p class="prompt-label">${promptLabel}</p><h3 id="heading-${escape(id)}" tabindex="-1">${escape(prompt)}</h3>
      <div class="options" aria-labelledby="heading-${escape(id)}">${options.map((choice,index) => `<button data-answer="${escape(choice)}" ${timed(round) ? `aria-pressed="${choice === answer?.choice}"` : answer ? 'disabled' : ''} class="${timed(round) ? choice === answer?.choice ? 'selected-option' : '' : answer ? choice === rightChoice ? 'correct-option' : choice === answer.choice ? 'wrong-option' : 'locked-other' : ''}"><span>${'ABCD'[index]}</span><b>${escape(choice)}</b></button>`).join('')}</div>
      ${answer && !timed(round) ? `<div class="instant-feedback ${answer.correct ? 'correct' : 'wrong'}" role="status"><div class="feedback-mark">${answer.correct ? '✓' : '×'}</div><div><strong>${answer.correct ? 'Correct!' : 'Not quite.'}</strong><span>The correct answer is ${'ABCD'[options.indexOf(rightChoice)]}. ${escape(rightChoice)}.</span>${word.explanation ? `<p class="answer-explanation">${escape(word.explanation)}</p>` : ''}${word.reviewNote ? `<small>${escape(word.reviewNote)}</small>` : ''}<small>Answer locked — it cannot be changed.</small></div></div>` : ''}
      </article>`;
  }
  function results() {
    const finished = sessions.filter(session => progress.sessions[session.number]?.rounds.some(round => round.finishedAt));
    return `<section class="results-card"><div class="results-heading"><div><p class="eyebrow">${local ? 'Preview record · this device' : 'Online record · all devices'}</p><h2>Marco’s Results</h2><p>Refresh from any device to see live answer progress and finished rounds.</p></div><button data-refresh>Refresh results</button></div>
      <div class="live-progress-heading"><div><strong>Live session progress</strong><span>Updated after every answer</span></div></div><div class="live-progress-grid">${sessions.map(session => {
        const record = progress.sessions[session.number];
        const round = Core.current(record);
        return `<article class="${record?.completedAt ? 'complete' : ''}"><span>${label(session.number)}</span><strong>${record?.completedAt ? 'Mastered' : `${answered(round)}/${round?.ids.length || session.words.length} answered`}</strong><small>${range(session.number)} · ${round ? `Round ${round.number}` : 'Not started'}</small></article>`;
      }).join('')}</div><div class="finished-heading"><strong>Finished rounds</strong><span>Scores and answer review</span></div>
      ${finished.length ? `<div class="session-list">${finished.map(session => `<article class="session-card"><div class="session-title"><div><strong>${label(session.number)} · ${range(session.number)}</strong><span>${progress.sessions[session.number].completedAt ? `Mastered ${date(progress.sessions[session.number].completedAt)}` : 'In progress'}</span></div><span>${progress.sessions[session.number].rounds.filter(round => round.finishedAt).length} finished rounds</span></div><div class="round-list">${progress.sessions[session.number].rounds.filter(round => round.finishedAt).map(round => {
        const correct = round.ids.filter(id => round.answers[id].correct).length;
        const breakdown = round.timeLimitSeconds ? `<p class="test-breakdown">Synonyms ${round.ids.filter(id => byId.get(id).quizType === 'synonym' && round.answers[id].correct).length}/20 · Sentence Completion ${round.ids.filter(id => byId.get(id).quizType === 'completion' && round.answers[id].correct).length}/20 · Time ${clockText(Date.parse(round.finishedAt)-Date.parse(round.startedAt))} / 20:00</p>` : '';
        return `<details data-result="${session.number}-${round.number}" ${session.number === selected && round.timeLimitSeconds ? 'open' : ''}><summary><span class="round-number">${round.number}</span><span><strong>Round ${round.number}${round.timeLimitSeconds ? ' · VR Test' : ''}</strong><small>${date(round.finishedAt)}</small></span><span class="score"><strong>${correct}/${round.ids.length}</strong><small>correct</small></span><span class="missed"><strong>${round.ids.length-correct}</strong><small>missed</small></span></summary>${breakdown}<div class="answer-review">${Core.questionOrder(round.ids,session.number,round.number).map((id,index) => {
          const word = byId.get(id), answer = round.answers[id];
          const prompt = word.quizType === 'definition' ? word.meaning : word.word;
          const correct = word.answer;
          const chosen = answer.choice || 'Unanswered';
          return `<div class="${answer.correct ? 'correct' : 'wrong'}"><span>${index+1}</span><p>${escape(prompt)}${word.explanation ? `<small class="review-explanation">${escape(word.explanation)}</small>` : ''}</p><p><small>Your answer</small><strong>${escape(chosen)}</strong></p><p><small>Correct</small><strong>${escape(correct)}</strong></p></div>`;
        }).join('')}</div></details>`;
      }).join('')}</div></article>`).join('')}</div>` : '<div class="empty-results compact"><strong>No finished rounds yet.</strong><span>Live partial progress is shown above.</span></div>'}</section>`;
  }
  function render(anchorId = null) {
    // Keep the sync badge attached so remote save feedback survives rendering.
    const badge = app.querySelector('[data-online-sync]');
    const anchor = anchorId ? document.getElementById(anchorId) : [...app.querySelectorAll('.question-item')].find(node => node.getBoundingClientRect().bottom > 0);
    const top = anchor?.getBoundingClientRect().top;
    const expanded = [...app.querySelectorAll('details[open][data-result]')].map(node => node.dataset.result);
    app.innerHTML = header() + (view === 'practice' ? picker() : '') + syncNote() +
      (storageError ? '<div class="notice error" role="alert">This device could not save locally. Keep this page open until the online indicator confirms the save.</div>' : '') +
      (banner && view === 'practice' ? `<div class="result-banner" role="status">${escape(banner)}</div>` : '') +
      (view === 'practice' ? question() : results()) + '<footer class="site-footer"><a href="../">← Learning Hub</a><a href="../marco-isee-words-250/?session=6">Archived 250 ISEE word list →</a><span>331 questions · Sessions 1–14</span></footer>';
    if (badge) app.querySelector('[data-online-sync]').replaceWith(badge);
    expanded.forEach(key => { const detail = app.querySelector(`[data-result="${key}"]`); if (detail) detail.open = true; });
    const replacement = anchor && document.getElementById(anchor.id);
    if (replacement) {
      const shift = replacement.getBoundingClientRect().top - top;
      if (Math.abs(shift) > 1) window.scrollBy(0, shift);
      if (anchorId) replacement.querySelector('h3')?.focus({preventScroll:true});
    }
  }
  function changeView(next) {
    view = next;
    const url = new URL(location.href);
    url.searchParams.set('session', selected);
    url.hash = next === 'results' ? 'results' : '';
    history.replaceState(null, '', url.pathname + url.search + url.hash);
    render();
  }
  app.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (expireTests()) { render(); return; }
    if (button.hasAttribute('data-start-test')) {
      if (selected >= 13 && Core.startTimed(progress, selected, info(selected).words.map(word => word.id), now())) {
        save(); render();
        app.querySelector('.session-workspace')?.scrollIntoView({block:'start'});
      }
      return;
    }
    if (button.hasAttribute('data-submit-test')) {
      const active = current();
      if (!timed(active) || Number(button.dataset.round) !== active.number) return;
      const left = active.ids.length - answered(active);
      if (!window.confirm(left ? `Submit with ${left} unanswered question${left === 1 ? '' : 's'}? Unanswered questions count as incorrect.` : 'Submit your test? Your choices will be final.')) return;
      if (Core.finishTimed(progress, selected, now())) {
        banner = 'Your test has been submitted and saved.';
        save(); render();
        app.querySelector('.test-report')?.scrollIntoView({block:'start'});
      }
      return;
    }
    if (button.dataset.view) return changeView(button.dataset.view);
    if (button.dataset.session) {
      const number = Number(button.dataset.session);
      banner = '';
      startSession(number);
      changeView('practice');
      app.querySelector('.session-summary, .complete-card')?.scrollIntoView?.({block:'start'});
      return;
    }
    if (button.dataset.jump) {
      const card = document.getElementById(`word-${button.dataset.jump}`);
      card?.scrollIntoView?.({block:'start'});
      card?.querySelector('h3')?.focus({preventScroll:true});
      return;
    }
    if (button.dataset.answer) {
      const card = button.closest('[data-word-id]');
      if (!card || Number(card.dataset.sessionNumber) !== selected || Number(card.dataset.round) !== current()?.number) return;
      if (Core.answer(progress, selected, button.dataset.answer, words, now(), card.dataset.wordId)) { save(); render(card.id); }
      return;
    }
    if (button.hasAttribute('data-finish-round')) {
      const previous = current();
      if (Number(button.dataset.round) !== previous?.number) return;
      const number = previous.number, total = previous.ids.length;
      const correct = previous.ids.filter(id => previous.answers[id]?.correct).length;
      const action = Core.finishRound(progress, selected, now());
      if (action) {
        if (action !== 'next') banner = `${label(selected)}, Round ${number}: ${correct}/${total} correct.${action === 'round' ? ` Round ${number + 1} contains only the ${total-correct} missed question${total-correct === 1 ? '' : 's'}.` : ' Session mastered.'}`;
        save(); render();
        app.querySelector('.session-summary, .complete-card')?.scrollIntoView?.({block:'start'});
      }
      return;
    }
    if (button.hasAttribute('data-refresh')) {
      button.disabled = true;
      button.textContent = 'Refreshing…';
      await sync?.refresh();
      render();
    }
  });
  window.addEventListener('hashchange', () => { view = location.hash === '#results' ? 'results' : 'practice'; render(); });
  startSession(selected);
  render();
  if (!local && window.MarcoOnlineSync) {
    sync = window.MarcoOnlineSync.create({
      appId: APP_ID, studentName: 'Marco', validate: Core.valid,
      score: Core.score,
      onRemote(remote) {
        const merged = Core.merge(progress, remote);
        const differs = JSON.stringify(merged) !== JSON.stringify(remote);
        progress = merged;
        write(STORAGE_KEY, progress); write(TEST_KEY, progress);
        // A new device may have opened another session before receiving the record.
        if (selected < 13) Core.start(progress, selected, info(selected).words.map(word => word.id), now());
        expireTests();
        render();
        if (differs) sync?.push(progress);
      },
    });
    void sync.start(progress);
    const tracker = document.createElement('script');
    tracker.src = '../shared-activity-tracker.js?v=1';
    tracker.dataset.appId = APP_ID;
    tracker.dataset.course = '2026 Zozeck Hard · 331 questions';
    document.body.append(tracker);
  }
  function tick() {
    if (expireTests()) { render(); return; }
    const timer = app.querySelector('[data-timer]');
    if (timer && timed(current())) {
      const remaining = Date.parse(current().deadlineAt) - Date.now();
      timer.textContent = clockText(remaining);
      timer.closest('.timer-bar').classList.toggle('timer-low', remaining <= 120000);
    }
  }
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', tick);
  window.addEventListener('focus', tick);
  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY) return;
    progress = Core.merge(progress, read(STORAGE_KEY));
    expireTests(); render();
  });
})();
