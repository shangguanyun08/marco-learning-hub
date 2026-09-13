(() => {
  'use strict';
  const Core = window.VocabularyQuiz;
  const words = window.MARCO_VOCABULARY_WORDS;
  const byId = new Map(words.map(word => [word.id, word]));
  const sessions = Array.from({length: 18}, (_, i) => ({number: i + 1, words: words.filter(word => word.session === i + 1)}));
  const optionCache = new Map();
  function optionsFor(word, round) {
    const key = `${word.id}:${round}`;
    if (!optionCache.has(key)) optionCache.set(key, Core.options(word, round, words));
    return optionCache.get(key);
  }
  const APP_ID = 'marco-round2-vocabulary-660';
  const STORAGE_KEY = 'marco-round2-vocabulary-660-v1';
  const TEST_KEY = 'marco-vocabulary-tests-v1';
  const SELECTION_KEY = 'marco-vocabulary-tests-selection-v1';
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.protocol === 'file:';
  const app = document.getElementById('app');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  const envelopeValid = value => value?.version === 1 && value.sessions && Array.isArray(value.activity);
  let envelope = read(STORAGE_KEY);
  if (!envelopeValid(envelope)) envelope = {version: 1, layoutVersion: 3, activeSession: 1, sessions: {}, activity: []};
  let progress = Core.merge(envelope.vocabularyTests, read(TEST_KEY));
  let selected = Number(read(SELECTION_KEY)) || 1;
  if (!sessions.some(session => session.number === selected)) selected = 1;
  let view = location.hash === '#results' ? 'results' : 'practice';
  let sync = null;
  let banner = '';
  let storageError = false;
  const now = () => new Date().toISOString();
  const info = number => sessions[number - 1];
  const range = number => { const items = info(number).words; return `Words ${items[0].number}–${items.at(-1).number}`; };
  const label = number => `Session ${number}`;
  const date = value => value ? new Intl.DateTimeFormat(undefined, {month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(value)) : 'Not started';
  const answered = round => round ? round.ids.filter(id => round.answers[id]).length : 0;
  const current = () => Core.current(progress.sessions[selected]);
  function save() {
    const latest = read(STORAGE_KEY);
    if (envelopeValid(latest)) envelope = latest;
    progress = Core.merge(progress, envelope.vocabularyTests);
    envelope.vocabularyTests = progress;
    storageError = !write(TEST_KEY, progress);
    storageError = !write(STORAGE_KEY, envelope) || storageError;
    sync?.push(envelope);
  }
  function startSession(number) {
    selected = number;
    write(SELECTION_KEY, selected);
    if (Core.start(progress, number, info(number).words.map(word => word.id), now())) save();
  }
  function header() {
    return `<header class="topbar"><div><p class="eyebrow">Marco · 874 words · 18 sessions</p><h1>Vocabulary Practice</h1></div>
      <nav aria-label="Main navigation"><button data-view="practice" class="${view === 'practice' ? 'active' : ''}" aria-pressed="${view === 'practice'}">Practice</button><button data-view="results" class="${view === 'results' ? 'active' : ''}" aria-pressed="${view === 'results'}">Results</button></nav></header>`;
  }
  function picker() {
    return `<section class="session-picker" aria-label="Choose a vocabulary session">${sessions.map(session => {
      const record = progress.sessions[session.number];
      const round = Core.current(record);
      const status = record?.completedAt ? 'Mastered' : round ? `Round ${round.number} · ${answered(round)}/${round.ids.length}` : 'Not started';
      return `<button data-session="${session.number}" class="${selected === session.number ? 'selected' : ''} ${record?.completedAt ? 'mastered' : ''}" aria-pressed="${selected === session.number}"><span>Session ${session.number}</span><strong>${range(session.number)}</strong><small>${status}</small></button>`;
    }).join('')}</section>`;
  }
  function syncNote() {
    return `<div class="sync-note" data-online-sync="${APP_ID}" role="status" aria-live="polite"><span aria-hidden="true"></span>${local ? 'Preview · answers save on this device only.' : 'Connecting online…'}</div>`;
  }
  function question() {
    const record = progress.sessions[selected];
    if (record?.completedAt) return `<section class="complete-card"><div><div class="checkmark">✓</div><h2>${label(selected)} mastered</h2><p>All words from ${range(selected).replace('Words ', '')} have been answered correctly. Every round is preserved in Results.</p><div class="complete-actions">${selected < 18 ? `<button data-session="${selected + 1}">Continue to Session ${selected + 1}</button>` : ''}<button class="secondary" data-view="results">View results</button></div></div></section>`;
    const round = current();
    return `<section class="session-workspace" aria-label="${label(selected)}, Round ${round.number}"><div class="session-summary"><div class="session-summary-heading"><div><div class="round-heading"><span>${label(selected)}</span><small>${range(selected)}</small></div><div class="round-subheading"><h2>Round ${round.number}</h2><span>${round.number === 1 ? `All ${round.ids.length} words on this page` : 'Previous round’s missed words'}</span></div></div><div class="stats"><div><strong>${answered(round)}</strong><span>answered</span></div><div><strong>${round.ids.length - answered(round)}</strong><span>remaining</span></div></div>${finishButton(round)}</div>
      <div class="progress" role="progressbar" aria-label="Round progress" aria-valuenow="${answered(round)}" aria-valuemin="0" aria-valuemax="${round.ids.length}"><span style="width:${answered(round) / round.ids.length * 100}%"></span></div>
      <p class="grid-label">Jump to a question</p><div class="number-grid" aria-label="Question progress">${round.ids.map((id,index) => {
        const value = round.answers[id];
        const status = value ? value.correct ? 'answered-correct' : 'answered-wrong' : '';
        const description = value ? value.correct ? 'correct' : 'incorrect' : 'unanswered';
        return `<button data-jump="${escape(id)}" class="${status}" aria-label="Question ${index + 1}: ${description}">${index + 1}</button>`;
      }).join('')}</div><p class="locked-note">Answer in any order. Each answer saves and stays locked.</p></div>
      <div class="session-questions">${round.ids.map((id,index) => wordQuestion(round,id,index)).join('')}</div>
      <div class="round-footer"><span>${answered(round) === round.ids.length ? 'All answers are saved. Finish this round to continue.' : `${round.ids.length - answered(round)} questions left before you can finish this round.`}</span>${finishButton(round)}</div></section>`;
  }
  function finishButton(round) {
    return `<button class="finish-round" data-finish-round data-round="${round.number}" ${answered(round) === round.ids.length ? '' : 'disabled'}>Finish round &amp; save</button>`;
  }
  function wordQuestion(round, id, index) {
    const word = byId.get(id);
    const answer = round.answers[id];
    const options = optionsFor(word, round.number);
    const pos = {'adjective':'adj.','noun':'n.','verb':'v.','adverb':'adv.'}[word.partOfSpeech] || word.partOfSpeech;
    return `<article class="question-item" id="word-${escape(id)}" data-word-id="${escape(id)}" data-round="${round.number}" data-session-number="${selected}" aria-labelledby="heading-${escape(id)}"><div class="question-item-topline"><span>Question ${index + 1}</span><small>Word #${word.number}</small></div><p class="prompt-label">Choose the vocabulary word</p><h3 id="heading-${escape(id)}" tabindex="-1">${escape(pos)} ${escape(word.meaning)}</h3>
      <div class="options" aria-labelledby="heading-${escape(id)}">${options.map((choice,index) => `<button data-answer="${escape(choice)}" ${answer ? 'disabled' : ''} class="${answer ? choice === word.id ? 'correct-option' : choice === answer.choice ? 'wrong-option' : 'locked-other' : ''}"><span>${'ABCD'[index]}</span><b>${escape(byId.get(choice).word)}</b></button>`).join('')}</div>
      ${answer ? `<div class="instant-feedback ${answer.correct ? 'correct' : 'wrong'}" role="status"><div class="feedback-mark">${answer.correct ? '✓' : '×'}</div><div><strong>${answer.correct ? 'Correct!' : 'Not quite.'}</strong><span>${answer.correct ? `${escape(word.word)} is the right word.` : `The correct answer is ${'ABCD'[options.indexOf(word.id)]}. ${escape(word.word)}.`}</span><small>Answer locked — it cannot be changed.</small></div></div>` : ''}
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
        return `<details data-result="${session.number}-${round.number}"><summary><span class="round-number">${round.number}</span><span><strong>Round ${round.number}</strong><small>${date(round.finishedAt)}</small></span><span class="score"><strong>${correct}/${round.ids.length}</strong><small>correct</small></span><span class="missed"><strong>${round.ids.length-correct}</strong><small>missed</small></span></summary><div class="answer-review">${round.ids.map(id => {
          const word = byId.get(id), answer = round.answers[id];
          return `<div class="${answer.correct ? 'correct' : 'wrong'}"><span>#${word.number}</span><p>${escape(word.meaning)}</p><p><small>Your answer</small><strong>${escape(byId.get(answer.choice)?.word || answer.choice)}</strong></p><p><small>Correct</small><strong>${escape(word.word)}</strong></p></div>`;
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
      (view === 'practice' ? question() : results()) + '<footer class="site-footer"><a href="../">← Learning Hub</a><a href="../marco-vocabulary-round2-archive/">Original illustrated version · Archive</a></footer>';
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
    history.replaceState(null, '', next === 'results' ? '#results' : location.pathname + location.search);
    render();
  }
  app.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
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
        if (action !== 'next') banner = `${label(selected)}, Round ${number}: ${correct}/${total} correct.${action === 'round' ? ` Round ${number + 1} contains only the ${total-correct} missed word${total-correct === 1 ? '' : 's'}.` : ' Session mastered.'}`;
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
      appId: APP_ID, studentName: 'Marco', validate: envelopeValid,
      score: value => Object.values(value.sessions).reduce((sum, session) => sum + (session.testedKnown?.length || 0), 0) + Core.score(value.vocabularyTests),
      onRemote(remote) {
        const merged = Core.merge(progress, remote.vocabularyTests);
        const differs = JSON.stringify(merged) !== JSON.stringify(remote.vocabularyTests);
        envelope = remote;
        progress = merged;
        envelope.vocabularyTests = progress;
        write(STORAGE_KEY, envelope); write(TEST_KEY, progress);
        render();
        if (differs) sync?.push(envelope);
      },
    });
    void sync.start(envelope);
    const tracker = document.createElement('script');
    tracker.src = '../shared-activity-tracker.js?v=1';
    tracker.dataset.appId = APP_ID;
    tracker.dataset.course = 'Vocabulary Practice';
    document.body.append(tracker);
  }
})();
