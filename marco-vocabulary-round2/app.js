(() => {
  'use strict';
  const Core = window.VocabularyQuiz;
  const words = window.MARCO_VOCABULARY_WORDS;
  const byId = new Map(words.map(word => [word.id, word]));
  const sessions = Array.from({length: 18}, (_, i) => ({number: i + 1, set: Math.floor(i / 4) + 1, words: words.filter(word => word.session === i + 1)}));
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
  const label = number => `Set ${info(number).set} · Session ${number}`;
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
      <div class="week-menu" role="group" aria-label="Select vocabulary set">${[1,2,3,4,5].map(set => {
        const group = sessions.filter(session => session.set === set);
        const mastered = group.filter(session => progress.sessions[session.number]?.completedAt).length;
        return `<button class="${info(selected).set === set ? 'active' : ''}" aria-pressed="${info(selected).set === set}" data-set="${set}"><strong>Set ${set}</strong><small>${mastered}/${group.length} mastered</small></button>`;
      }).join('')}</div><nav aria-label="Main navigation"><button data-view="practice" class="${view === 'practice' ? 'active' : ''}" aria-pressed="${view === 'practice'}">Practice</button><button data-view="results" class="${view === 'results' ? 'active' : ''}" aria-pressed="${view === 'results'}">Results</button></nav></header>`;
  }
  function picker() {
    return `<section class="session-picker" aria-label="Choose a vocabulary session">${sessions.filter(session => session.set === info(selected).set).map(session => {
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
    const word = byId.get(round.ids[round.position]);
    const answer = round.answers[word.id];
    const options = Core.options(word, round.number, words);
    const pos = {'adjective':'adj.','noun':'n.','verb':'v.','adverb':'adv.'}[word.partOfSpeech] || word.partOfSpeech;
    return `<section class="practice-card"><aside class="round-panel"><div class="round-heading"><span>${label(selected)}</span><small>${range(selected)}</small></div><div class="round-subheading"><strong>Round ${round.number}</strong><span>${round.number === 1 ? `${round.ids.length} words` : 'Missed words only'}</span></div>
      <div class="stats"><div><strong>${answered(round)}</strong><span>answered</span></div><div><strong>${round.ids.length - answered(round)}</strong><span>remaining</span></div></div><p class="grid-label">One-way progress</p>
      <div class="number-grid" aria-label="Question progress">${round.ids.map((id,index) => {
        const value = round.answers[id];
        const status = value ? value.correct ? 'answered-correct' : 'answered-wrong' : index === round.position ? 'current' : '';
        const description = value ? value.correct ? 'correct' : 'incorrect' : index === round.position ? 'current question' : 'unanswered';
        return `<span class="${status}" aria-label="Question ${index + 1}: ${description}" ${index === round.position ? 'aria-current="step"' : ''}>${index + 1}</span>`;
      }).join('')}</div><p class="locked-note">Answered questions cannot be reopened or changed.</p></aside>
      <div class="question-panel"><div class="question-topline"><strong><b>${round.position + 1}</b>/${round.ids.length}</strong><div class="progress" role="progressbar" aria-label="Round progress" aria-valuenow="${round.position + 1}" aria-valuemin="0" aria-valuemax="${round.ids.length}"><span style="width:${(round.position + 1) / round.ids.length * 100}%"></span></div><small>Word #${word.number}</small></div>
      <div class="chips"><span>${label(selected)}</span><span>${round.number === 1 ? 'All words' : `Round ${round.number - 1} misses`}</span></div><p class="prompt-label">Choose the vocabulary word</p><h2 id="question-heading" tabindex="-1">${escape(pos)} ${escape(word.meaning)}</h2>
      <div class="options" aria-labelledby="question-heading">${options.map((id,index) => `<button data-answer="${escape(id)}" ${answer ? 'disabled' : ''} class="${answer ? id === word.id ? 'correct-option' : id === answer.choice ? 'wrong-option' : 'locked-other' : ''}"><span>${'ABCD'[index]}</span><b>${escape(byId.get(id).word)}</b></button>`).join('')}</div>
      ${answer ? `<div class="instant-feedback ${answer.correct ? 'correct' : 'wrong'}" role="status"><div class="feedback-mark">${answer.correct ? '✓' : '×'}</div><div><strong>${answer.correct ? 'Correct!' : 'Not quite.'}</strong><span>${answer.correct ? `${escape(word.word)} is the right word.` : `The correct answer is ${'ABCD'[options.indexOf(word.id)]}. ${escape(word.word)}.`}</span><small>Answer locked — it cannot be changed.</small></div></div>` : ''}
      <div class="question-footer one-way"><span>${answer ? 'Your answer is saved and locked.' : 'Choose one answer to continue.'}</span><button class="next-action" data-next ${answer ? '' : 'disabled'}>${round.position === round.ids.length - 1 ? 'Finish round & save' : 'Next question →'}</button></div></div></section>`;
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
  function render(focusQuestion = false) {
    // Keep the sync badge attached so remote save feedback survives rendering.
    const badge = app.querySelector('[data-online-sync]');
    const expanded = [...app.querySelectorAll('details[open][data-result]')].map(node => node.dataset.result);
    app.innerHTML = header() + (view === 'practice' ? picker() : '') + syncNote() +
      (storageError ? '<div class="notice error" role="alert">This device could not save locally. Keep this page open until the online indicator confirms the save.</div>' : '') +
      (banner && view === 'practice' ? `<div class="result-banner" role="status">${escape(banner)}</div>` : '') +
      (view === 'practice' ? question() : results()) + '<footer class="site-footer"><a href="../">← Learning Hub</a><a href="../marco-vocabulary-round2-archive/">Original illustrated version · Archive</a></footer>';
    if (badge) app.querySelector('[data-online-sync]').replaceWith(badge);
    expanded.forEach(key => { const detail = app.querySelector(`[data-result="${key}"]`); if (detail) detail.open = true; });
    if (focusQuestion) document.getElementById('question-heading')?.focus({preventScroll:true});
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
    if (button.dataset.set || button.dataset.session) {
      const group = sessions.filter(session => session.set === Number(button.dataset.set));
      const number = button.dataset.session ? Number(button.dataset.session) : (group.find(session => progress.sessions[session.number] && !progress.sessions[session.number].completedAt) || group.find(session => !progress.sessions[session.number]?.completedAt) || group[0]).number;
      banner = '';
      startSession(number);
      changeView('practice');
      return;
    }
    if (button.dataset.answer) {
      if (Core.answer(progress, selected, button.dataset.answer, words, now())) { save(); render(); app.querySelector('[data-next]')?.focus({preventScroll:true}); }
      return;
    }
    if (button.hasAttribute('data-next')) {
      const previous = current();
      const number = previous.number, total = previous.ids.length;
      const correct = previous.ids.filter(id => previous.answers[id]?.correct).length;
      const action = Core.advance(progress, selected, now());
      if (action) {
        if (action !== 'next') banner = `${label(selected)}, Round ${number}: ${correct}/${total} correct.${action === 'round' ? ` Round ${number + 1} contains only the ${total-correct} missed word${total-correct === 1 ? '' : 's'}.` : ' Session mastered.'}`;
        save(); render(true);
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
