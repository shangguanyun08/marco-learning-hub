(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  const requestedPage = Number(params.get('page') || 1);
  const pageNumber = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= window.MARCO_ISEE_PRACTICE.length ? requestedPage : 1;
  const session = window.MARCO_ISEE_PRACTICE[pageNumber - 1], E = window.MarcoTest3Engine, S = window.MarcoTest3Sync, T = window.KindleVRThinking, C = window.KindleVRClues;
  if (!session) throw new Error('Unknown Kindle practice page');
  const total = session.questions.length;
  const firstWrongView = params.get('view') === 'first-wrongs';
  document.getElementById('page-title').textContent = session.label;
  document.title = `${session.label} · Focused VR · Marco`;
  document.getElementById('page-tabs').innerHTML = window.MARCO_ISEE_PRACTICE.map(s=>`<a data-page-tab="${s.number}" href="practice.html?page=${s.number}${firstWrongView?'&view=first-wrongs':''}${params.has('demo')?'&demo=1':''}" ${s.number===pageNumber?'aria-current="page"':''}>Page ${s.number} · ${s.questions.length}</a>`).join('');
  // Display order changes only; saved questionSources and source IDs stay fixed.
  const orderedQuestions = [...session.questions.filter(q => q.type === 'synonym'), ...session.questions.filter(q => q.type !== 'synonym')];
  const editingPredictions = new Map();
  const reviewAttempts = new Map();
  const demo = new URLSearchParams(location.search).has('demo');
  const preview = demo || ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
  const KEY = S.APP_ID + (preview ? ':preview' : ''), $ = s => document.querySelector(s);
  const empty = () => ({ version: 1, sessions: {} });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const questions = new Map(orderedQuestions.map(q => [String(q.source), q]));
  let state = empty(), sync = null, storageOK = true, draftTimer;
  let status = preview ? 'Preview · Online records are untouched.' : 'Connecting to live online sync…', kind = preview ? 'preview' : 'connecting';
  try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (S.valid(saved)) state = S.merge(saved, empty()); } catch { storageOK = false; }
  const runs = () => state.sessions[session.id] || [], current = () => runs().at(-1);
  const firstRun = () => runs()[0];
  const firstMisses = () => orderedQuestions.filter(q => { const a = firstRun()?.answers[q.source]?.attempts[0]; return a && a.choice !== q.correct; });
  function viewURL(review = false, question) {
    const url = new URL(location.href);
    if (review) url.searchParams.set('view', 'first-wrongs'); else url.searchParams.delete('view');
    url.searchParams.delete('q'); url.hash = '';
    if (question) { url.searchParams.set('q', String(question)); url.hash = `q-${question}`; }
    return url.pathname + url.search + url.hash;
  }
  const entry = q => current()?.answers[q.source], thought = q => current()?.thinking?.[q.source], closed = q => E.done(q, entry(q));
  const revealed = q => !!thought(q)?.committed || !!thought(q)?.legacySeen || !!entry(q)?.attempts.length || current()?.pending[q.source] !== undefined;
  const fromElement = el => questions.get(el.closest('[data-source]')?.dataset.source);
  const card = q => document.getElementById(`q-${orderedQuestions.indexOf(q) + 1}`);
  const label = value => ({ good: 'Positive', bad: 'Negative', same: 'Same', opposite: 'Opposite', neutral: 'Neutral', unsure: 'I don’t know' }[value] || '');
  function ensureRun() { if (!current()) { const r = E.start(session); r.thinking = {}; (state.sessions[session.id] ||= []).push(r); } return current(); }
  function editThought(q) { const r = ensureRun(); r.thinking ||= {}; return r.thinking[q.source] ||= T.make(); }
  function cuts(q) { return [...new Set([...(entry(q)?.attempts || []).map(a => a.choice), ...(thought(q)?.eliminated || [])])].slice(0, 2).sort((a, b) => a - b); }
  function note() { $('#save-note').textContent = storageOK ? status : 'Device saving unavailable. Keep the page open and download your records.'; $('#save-note').dataset.kind = storageOK ? kind : 'offline'; }
  function save(upload = true) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { storageOK = false; } note(); if (upload) void sync?.push(); }
  function statusUI() {
    const r = current(), stats = E.stats(session, r);
    const first = firstRun(), original = E.stats(session, first), missed = firstMisses().length;
    $('#run-views').innerHTML = `<a class="run-view${!firstWrongView ? ' active' : ''}" href="${esc(viewURL())}" ${!firstWrongView ? 'aria-current="page"' : ''}>Full practice</a><a class="run-view${firstWrongView ? ' active' : ''}" href="${esc(viewURL(true))}" ${firstWrongView ? 'aria-current="page"' : ''}>First-run wrongs (${missed})</a>`;
    $('#practice-status').className = 'practice-status' + (!firstWrongView && r?.completedAt ? ' is-complete' : '');
    $('#practice-status').innerHTML = firstWrongView
      ? `<h2>Page ${pageNumber} · First-run wrongs</h2><p><span class="run-score">Run 1 first-try score: ${original.first}/${total}</span> · ${missed} first-answer misses · ${original.corrected} corrected on second try · ${original.finished - original.first - original.corrected} still wrong after two tries</p>`
      : `<h2>${r?.completedAt ? '✓ Practice complete' : `Page ${pageNumber} · ${total} questions`}</h2><p><span class="run-score">First-try score: ${stats.first}/${total}</span> · ${stats.finished}/${total} finished · ${stats.corrected} corrected on retry</p>`;
    if ($('#practice-intro')) $('#practice-intro').innerHTML = `<p>For sentence completion, highlight key words in the rest of the sentence. For synonyms, predict one simple word. Both steps and elimination are optional; you can edit them later.</p>${!r ? `<button type="button" data-action="start" class="primary">Start ${total}-question practice</button><span class="thinking-caption"> Or begin with any question below.</span>` : '<button type="button" data-action="restart" class="start-fresh">Start fresh practice</button><span class="thinking-caption"> Earlier work stays in saved history.</span>'}`;
    document.querySelectorAll('[data-page-tab]').forEach(el=>{const s=window.MARCO_ISEE_PRACTICE[Number(el.dataset.pageTab)-1];el.classList.toggle('is-complete',!!state.sessions[s.id]?.at(-1)?.completedAt);});
    note();
  }
  function navigation() {
    return `<nav class="mixed-nav" aria-label="All ${total} questions in groups of ten">${Array.from({length: Math.ceil(total / 10)}, (_, i) => i * 10).map(start => `<div class="jump" role="group" aria-label="Questions ${start + 1} to ${Math.min(start + 10, total)}">${orderedQuestions.slice(start, start + 10).map((q, j) => {
      const i = start + j, tries = entry(q)?.attempts || [], cls = tries[0]?.correct ? 'first-correct' : tries[1]?.correct ? 'corrected' : tries.length === 1 ? 'retry' : tries.length === 2 ? 'incorrect' : '';
      const text = tries[0]?.correct ? 'correct first try' : tries[1]?.correct ? 'corrected on retry' : tries.length === 1 ? 'second try available' : tries.length === 2 ? 'incorrect after two tries' : 'not answered';
      return `<a href="#q-${i + 1}" data-question="${i}" class="${cls}" aria-label="Question ${i + 1}: ${text}">${i + 1}</a>`;
    }).join('')}</div>`).join('')}</nav>`;
  }
  function predictionUI(q) {
    const n = thought(q), snapshot = n?.revised || n?.committed, editing = editingPredictions.has(q.source), sentence = q.type !== 'synonym';
    if ((revealed(q) || closed(q)) && !editing) {
      const facets = snapshot ? (q.type === 'synonym' ? [snapshot.tone] : [snapshot.link]).map(label).filter(Boolean) : [];
      return `<section class="prediction-saved"><h4>${sentence ? 'Your highlighted clues' : 'Your prediction'}</h4><p class="saved-prediction">${sentence ? esc(C.selected(q,snapshot) || 'Skipped') : snapshot?.prediction ? esc(snapshot.prediction) : 'Skipped'}</p>${sentence && snapshot?.prediction ? `<p class="legacy-prediction">Earlier prediction: ${esc(snapshot.prediction)}</p>` : ''}${facets.length ? `<p class="thinking-caption">${facets.map(esc).join(' · ')}</p>` : ''}<button type="button" class="primary edit-prediction" data-edit-prediction>${sentence ? 'Edit highlights' : 'Edit prediction'}</button></section>`;
    }
    const values = editingPredictions.get(q.source) || n || { prediction: '', tone: '', strength: '', link: '' };
    const group = (name, title, options) => `<fieldset class="thinking-group"><legend>${title} <span class="optional-label">(optional)</span></legend><div class="thinking-pills">${options.map(([value, text]) => `<label><input type="radio" name="${name}" value="${value}" ${values[name] === value ? 'checked' : ''}><span>${text}</span></label>`).join('')}</div></fieldset>`;
    return `<form class="prediction-form prediction-box" data-source="${q.source}">${sentence ? C.guide(q,values) : `<label class="prediction-label" for="prediction-${q.source}">Your prediction <span class="optional-label">(optional)</span></label><input class="prediction-input" id="prediction-${q.source}" type="text" name="prediction" maxlength="160" placeholder="One simple word (optional)" autocomplete="off" value="${esc(values.prediction)}">`}${q.type === 'synonym' ? `<div class="quick-clues">${group('tone', 'Meaning', [['unsure', 'I don’t know'], ['good', 'Positive'], ['bad', 'Negative']])}</div>` : group('link', 'Sentence clue', [['same', 'Same'], ['opposite', 'Opposite']])}<button type="submit" class="primary">${editing ? (sentence ? 'Save highlights' : 'Save prediction') : 'Show choices'}</button>${editing ? '<button type="button" class="cancel-prediction" data-cancel-prediction>Cancel</button>' : '<span class="thinking-caption optional-hint">Optional.</span>'}</form>`;
  }
  function answerUI(q) {
    const tries = entry(q)?.attempts || [], done = closed(q), eliminated = cuts(q);
    const selected = current()?.pending[q.source]?.choice ?? tries.at(-1)?.choice;
    const message = done ? tries[0].correct ? 'Correct first try.' : tries.at(-1).correct ? 'Correct on your second try. Your first-try score is unchanged.' : 'Two tries used. Read the answer and trick.' : tries.length ? 'Not quite. Your first choice is out. Try another answer. Eliminating choices is optional; the key is still hidden.' : 'Choose an answer. You may cross out choices if it helps.';
    return `<form class="answer-form" data-source="${q.source}"><fieldset class="choices"><legend>${done ? 'Recorded answer' : 'Choose your answer'}${!done ? ` <span class="elimination-count">· Elimination optional · ${eliminated.length} crossed out</span>` : ''}</legend>${q.choices.map((choice, j) => {
      const used = tries.some(a => a.choice === j), out = !done && eliminated.includes(j);
      return `<div class="choice-row${out ? ' eliminated' : ''}"><label class="choice${done && j === q.correct ? ' correct' : ''}${done && used && j !== q.correct ? ' wrong' : ''}"><input type="radio" name="answer" value="${j}" ${done || used || out ? 'disabled' : ''} ${selected === j && !out ? 'checked' : ''}><span class="letter">${'ABCD'[j]}</span><span class="choice-text">${esc(choice)}</span></label>${!done ? `<button type="button" class="eliminate-button" data-eliminate="${j}" aria-pressed="${out}" ${used ? 'disabled' : ''} aria-label="${used ? `Choice ${'ABCD'[j]} is ruled out by your first try` : `${out ? 'Restore' : 'Eliminate'} ${'ABCD'[j]}`}">${used ? 'Ruled out' : out ? 'Restore' : 'Eliminate'}</button>` : ''}</div>`;
    }).join('')}</fieldset>${!done ? `<button type="submit" class="primary">${tries.length ? 'Check second try' : 'Check answer'}</button>` : ''}<p class="feedback" data-kind="${done && tries.at(-1)?.correct ? 'correct' : tries.length ? 'retry' : 'neutral'}" role="status">${message}</p></form>`;
  }
  function solution(q, answer = entry(q)) {
    const firstCuts = answer?.attempts[0]?.eliminated;
    const explanation = q.explanation.includes(q.tip) ? '' : `<p>${esc(q.explanation)}</p>`;
    const related = q.related.length ? `<div class="related-links">Related past mistakes—skill links:<br>${q.related.map(([date, number, title]) => `<a href="../${date}/#q${number}">${esc(title)} · ${date.slice(5)}</a>`).join('')}</div>` : '';
    return `<section class="solution" aria-label="Answer, meaning, trick, and explanation"><p><b>Answer: ${'ABCD'[q.correct]} · ${esc(q.choices[q.correct])}</b></p><p class="meaning"><strong>${esc(q.word)}</strong> — ${esc(q.meaning)}</p><p class="trick"><strong>TRICK / EXPLANATION</strong>${esc(q.tip)}</p>${explanation}${firstCuts?.length ? `<p class="elimination-review"><strong>Your first eliminations:</strong> ${firstCuts.map(i => `${'ABCD'[i]} · ${esc(q.choices[i])}`).join('; ')}. ${firstCuts.includes(q.correct) ? 'You crossed out the correct answer. Recheck the meaning you ruled out.' : 'The correct answer was not crossed out.'}</p>` : ''}<p class="selection-note"><strong>Why selected:</strong> ${esc(q.selection)}</p><p class="source-evidence">${esc(q.evidence)}</p>${related}</section>`;
  }
  function questionUI(q, i) {
    return `<article class="question" id="q-${i + 1}" data-source="${q.source}" data-study-subject="words"><header><h3 id="question-title-${i + 1}" tabindex="-1">Question ${i + 1} of ${total}</h3><span class="source">Book Test ${q.test} · ${q.part} Q${q.number}</span></header><p class="prompt ${q.type === 'synonym' ? 'synonym' : 'completion'}">${q.type === 'synonym' ? esc(q.word.toUpperCase()) : C.prompt(q,editingPredictions.get(q.source) || thought(q)?.revised || thought(q)?.committed || thought(q),!editingPredictions.has(q.source) && (revealed(q) || closed(q)))}</p>${predictionUI(q)}${!editingPredictions.has(q.source) && (revealed(q) || closed(q)) ? answerUI(q) : '<p class="choices-hidden-note">Choices hidden · reveal whenever you are ready.</p>'}${closed(q) && !editingPredictions.has(q.source) ? solution(q) : ''}</article>`;
  }
  function breakdown() {
    return `<section class="panel complete"><h3>✓ All ${total} questions finished</h3><table class="skill-table"><thead><tr><th scope="col">Skill</th><th scope="col">First try</th><th scope="col">Fixed on retry</th><th scope="col">Still missed</th></tr></thead><tbody>${[...new Set(orderedQuestions.map(q => q.skill))].map(skill => {
      const stats = E.stats({ questions: orderedQuestions.filter(q => q.skill === skill) }, current());
      return `<tr><th scope="row">${esc(skill)}</th><td>${stats.first}/${stats.total}</td><td>${stats.corrected}</td><td>${stats.total - stats.first - stats.corrected}</td></tr>`;
    }).join('')}</tbody></table><button type="button" class="primary" data-action="start">Start another run</button></section>`;
  }
  function records() {
    return `<details class="panel records"><summary>Saved practice runs (${runs().length})</summary>${runs().map((r, i) => { const stats = E.stats(session, r); return `<details><summary>Run ${i + 1} · ${esc(new Date(r.startedAt).toLocaleString())} · ${stats.first}/${total} first try · ${r.completedAt ? 'Complete' : 'In progress'}</summary><ol>${orderedQuestions.map(q => { const p = r.thinking?.[q.source]?.committed, revised = r.thinking?.[q.source]?.revised; return `<li>Test ${q.test}, ${q.part} Q${q.number}${p ? ` · Prediction: ${p.prediction ? `“${esc(p.prediction)}”` : 'skipped'}` : ''}${q.type !== 'synonym' && p?.clues?.length ? ` · Highlighted clues: ${esc(C.selected(q,p))}` : ''}${q.type !== 'synonym' && revised?.clues?.length ? ` · Updated clues: ${esc(C.selected(q,revised))}` : ''}${revised ? ` · Updated prediction: ${revised.prediction ? `“${esc(revised.prediction)}”` : 'skipped'}` : ''}: ${(r.answers[q.source]?.attempts || []).map((a, j) => `Try ${j + 1}: ${'ABCD'[a.choice]} (${a.correct ? 'correct' : 'incorrect'})${a.eliminated ? `; eliminated ${a.eliminated.map(i => 'ABCD'[i]).join(', ')}` : ''}`).join('; ') || 'Not answered'}</li>`; }).join('')}</ol></details>`; }).join('')}</details>`;
  }
  function reviewPredictionUI(q, run) {
    const n = run.thinking?.[q.source], original = n?.committed, sentence = q.type !== 'synonym';
    const group = (name, title, options) => {
      const selected = original?.[name] || '', values = name !== 'tone' && selected && !options.includes(selected) ? [...options, selected] : options;
      return `<fieldset class="thinking-group" disabled><legend>${title} · Run 1</legend><div class="thinking-pills">${values.map(value => `<label><input type="radio" name="review-${q.source}-${name}" value="${value}" ${value === selected ? 'checked' : ''} disabled><span>${esc(label(value))}</span></label>`).join('')}</div>${!selected ? '<p class="thinking-caption">Not selected</p>' : !values.includes(selected) ? `<p class="thinking-caption">Earlier recorded choice: ${esc(label(selected))}</p>` : ''}</fieldset>`;
    };
    const revised = n?.revised;
    return `<section class="prediction-saved review-prediction"><h4>${sentence ? 'Your highlighted clues' : 'Your prediction'} · Run 1</h4><p class="saved-prediction">${original ? esc(sentence ? C.selected(q, original) || 'Skipped' : original.prediction || 'Skipped') : 'No pre-choice prediction saved'}</p>${sentence && original?.prediction ? `<p class="legacy-prediction">Your original prediction: <strong>${esc(original.prediction)}</strong></p>` : ''}<div class="quick-clues">${sentence ? group('link', 'Sentence clue', ['same', 'opposite']) : group('tone', 'Meaning', ['unsure', 'good', 'bad'])}</div><p class="thinking-caption">Original pre-choice record · read only</p>${revised ? `<details class="review-revision"><summary>Later prediction edit in Run 1</summary><p>${esc(sentence ? C.selected(q, revised) || 'No highlighted clues' : revised.prediction || 'Skipped')}</p>${sentence && revised.prediction ? `<p>Prediction: ${esc(revised.prediction)}</p>` : ''}<p>${[sentence ? revised.link : revised.tone].map(label).filter(Boolean).map(esc).join(' · ') || 'No categories selected'}</p></details>` : ''}</section>`;
  }
  function reviewAnswerUI(q, run) {
    const tries = run.answers[q.source].attempts, index = Math.min(reviewAttempts.get(q.source) || 0, tries.length - 1), attempt = tries[index];
    const eliminated = attempt.eliminated || [], uncutLabel = attempt.eliminated === undefined ? 'Not recorded' : 'Not eliminated';
    return `<section class="recorded-answer-review" aria-label="Run 1 recorded choices and eliminations"><div class="review-attempt-tabs" role="group" aria-label="Inspect Run 1 attempts">${tries.map((a, i) => `<button type="button" data-review-attempt="${i}" aria-pressed="${i === index}" class="${i === index ? 'active' : ''}">${i === 0 ? 'First try' : 'Second try'} · ${a.correct ? 'Correct' : 'Incorrect'}</button>`).join('')}</div><fieldset class="choices"><legend>Your ${index === 0 ? 'first' : 'second'} answer · Run 1 · read only</legend>${q.choices.map((choice, k) => {
      const out = eliminated.includes(k), chosen = k === attempt.choice, automatic = index === 1 && k === tries[0].choice;
      return `<div class="choice-row${out ? ' eliminated' : ''}" data-recorded-choice="${k}"><label class="choice${chosen ? attempt.correct ? ' correct' : ' wrong first-wrong-choice' : ''}"><input type="radio" name="review-answer-${q.source}" value="${k}" ${chosen ? 'checked' : ''} disabled><span class="letter">${'ABCD'[k]}</span><span class="choice-text">${esc(choice)}${chosen ? `<strong class="first-answer-label">Your ${index === 0 ? 'first' : 'second'} answer · ${attempt.correct ? 'correct' : 'incorrect'}</strong>` : ''}</span></label><span class="eliminate-button review-cut-status${out ? ' is-eliminated' : ''}">${out ? automatic ? 'Ruled out after first try' : 'Eliminated' : uncutLabel}</span></div>`;
    }).join('')}</fieldset><p class="review-elimination-note">${attempt.eliminated === undefined ? 'No elimination snapshot was saved for this answer.' : eliminated.length ? `Crossed out before this answer: ${eliminated.map(k => 'ABCD'[k]).join(', ')}.${index === 1 && eliminated.includes(tries[0].choice) ? ` ${'ABCD'[tries[0].choice]} was automatically ruled out after the first wrong answer.` : ''}` : 'No choices eliminated before this answer.'}</p><p class="feedback" data-kind="${attempt.correct ? 'correct' : 'retry'}">${index === 0 ? 'Incorrect on the first try.' : attempt.correct ? 'Correct on the second try. The first-try score is unchanged.' : 'Still incorrect on the second try.'}</p></section>`;
  }
  function firstWrongReview() {
    const run = firstRun(), missed = firstMisses();
    const intro = `<section class="first-wrong-intro"><h2>Only the questions missed on Run 1</h2><p>${run ? `Run 1 started ${esc(new Date(run.startedAt).toLocaleString())}. ${E.stats(session, run).attempted}/${total} first answers recorded.` : 'No saved first run on this page yet.'} Original layout, with saved predictions, category choices, and eliminations. Use First try / Second try to inspect each recorded answer. Later runs do not change this list. This is read only; your scores and attempts stay unchanged.</p></section>`;
    if (!missed.length) return intro + `<section class="panel"><p>${run && E.stats(session, run).attempted ? 'No first-answer misses recorded in Run 1 so far.' : 'Start the full practice to build your first-run record.'}</p><a href="${esc(viewURL())}">Return to full practice →</a></section>`;
    const nav = `<nav class="mixed-nav first-wrong-nav" aria-label="First-run wrong questions"><div class="jump">${missed.map(q => { const i = orderedQuestions.indexOf(q); return `<a class="incorrect" data-question="${i}" href="#q-${i + 1}" aria-label="Practice question ${i + 1}: wrong on Run 1">${i + 1}</a>`; }).join('')}</div></nav>`;
    return intro + nav + `<div class="questions-list">${missed.map((q, j) => {
      const i = orderedQuestions.indexOf(q), answer = run.answers[q.source], tries = answer.attempts, snapshot = run.thinking?.[q.source]?.committed;
      return `<article class="question first-wrong-question" id="q-${i + 1}" data-source="${q.source}" data-study-subject="words"><header><h3 id="question-title-${i + 1}" tabindex="-1">Question ${i + 1} of ${total}</h3><span class="source">Book Test ${q.test} · ${q.part} Q${q.number}</span></header><p class="review-miss-label">First-run miss ${j + 1} of ${missed.length}</p><p class="prompt ${q.type === 'synonym' ? 'synonym' : 'completion'}">${q.type === 'synonym' ? esc(q.word.toUpperCase()) : C.prompt(q, snapshot, true)}</p>${reviewPredictionUI(q, run)}${reviewAnswerUI(q, run)}<p class="review-attempt">${tries[1] ? `Run 1 second try: <b>${'ABCD'[tries[1].choice]} · ${esc(q.choices[tries[1].choice])}</b> — ${tries[1].correct ? 'corrected' : 'still incorrect'}.` : 'No second try recorded in Run 1.'}</p>${E.done(q, answer) ? `<details class="review-solution"><summary>Show answer, meaning & trick</summary>${solution(q, answer)}</details>` : `<p class="answer-locked">The answer stays hidden until the second try. <a href="${esc(viewURL(false, i + 1))}">Return to practice →</a></p>`}</article>`;
    }).join('')}</div>`;
  }
  function render() {
    $('#workspace').innerHTML = firstWrongView ? firstWrongReview() : `<section id="practice-intro" class="practice-intro"></section>${navigation()}<div class="questions-list">${orderedQuestions.map((q, i) => (i === 0 || q.type !== orderedQuestions[i-1].type ? `<h2 class="question-type-heading">${q.type === 'synonym' ? 'Synonyms' : 'Sentence completion'} · ${orderedQuestions.filter(x => x.type === q.type).length} questions</h2>` : '') + questionUI(q, i) + ((i + 1) % 10 === 0 && i < total - 1 ? '<hr class="question-group-divider" aria-hidden="true">' : '')).join('')}</div>${current()?.completedAt ? breakdown() : ''}${records()}`;
    statusUI();
  }
  function refresh() {
    const active = document.activeElement, focusId = active?.classList.contains('prediction-input') ? active.id : null, caret = focusId ? [active.selectionStart, active.selectionEnd] : null, y = scrollY;
    render(); if (focusId && document.getElementById(focusId)) { const field = document.getElementById(focusId); field.focus({ preventScroll: true }); field.setSelectionRange(...caret); } window.scrollTo(0, y);
  }
  function jump(i, focus = true) {
    const el = document.getElementById(`q-${i + 1}`); if (!el) return;
    const url = new URL(location.href); url.searchParams.set('q', String(i + 1)); url.hash = `q-${i + 1}`; history.replaceState(null, '', url);
    if (focus) document.getElementById(`question-title-${i + 1}`)?.focus({ preventScroll: true });
    el.scrollIntoView?.({ block: 'start' });
  }
  document.addEventListener('click', event => {
    if (firstWrongView) {
      const attempt = event.target.closest('[data-review-attempt]');
      if (attempt) { const q = fromElement(attempt), index = Number(attempt.dataset.reviewAttempt); if (q && firstRun()?.answers[q.source]?.attempts[index]) { reviewAttempts.set(q.source, index); refresh(); } return; }
      const link = event.target.closest('a[data-question]');
      if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); jump(Number(link.dataset.question)); }
      return;
    }
    const clue = event.target.closest('[data-clue]');
    if (clue) {
      const q=fromElement(clue);if(!q||q.type==='synonym'||((revealed(q)||closed(q))&&!editingPredictions.has(q.source)))return;
      const values=editingPredictions.get(q.source)||editThought(q),indices=new Set(values.clues||[]),index=Number(clue.dataset.clue);
      if(!C.tokens(q).some(t=>t.index===index))return;
      if(indices.has(index))indices.delete(index);else if(indices.size<200)indices.add(index);
      const patch={clues:[...indices].sort((a,b)=>a-b)};
      if(editingPredictions.has(q.source))Object.assign(values,patch);else{T.touch(values,patch);save();}
      const id=clue.id;refresh();document.getElementById(id)?.focus({preventScroll:true});return;
    }
    const edit = event.target.closest('[data-edit-prediction]');
    if (edit) { const q=fromElement(edit); if(!q)return; const n=thought(q), values=n?.revised||n?.committed||n||{prediction:'',tone:'',strength:'',link:''}; editingPredictions.set(q.source,{prediction:values.prediction,tone:values.tone,strength:values.strength,link:values.link,clues:[...(values.clues||[])]}); refresh(); (document.getElementById(`prediction-${q.source}`) || card(q)?.querySelector('[data-clue]'))?.focus({preventScroll:true}); return; }
    const cancel = event.target.closest('[data-cancel-prediction]');
    if (cancel) { const q=fromElement(cancel); if(q){editingPredictions.delete(q.source);refresh();}return; }
    if(event.target.closest('[data-action="restart"]')) {const r=E.start(session);r.thinking={};(state.sessions[session.id]||=[]).push(r);editingPredictions.clear();save();refresh();jump(0);return;}
    const jumpLink = event.target.closest('a[data-question]');
    if (jumpLink && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); jump(Number(jumpLink.dataset.question)); return; }
    const eliminate = event.target.closest('button[data-eliminate]');
    if (eliminate) {
      const q = fromElement(eliminate), choice = Number(eliminate.dataset.eliminate); if (!q || closed(q) || !revealed(q) || entry(q)?.attempts.some(a => a.choice === choice)) return;
      const selectedCuts = cuts(q), n = editThought(q);
      if (selectedCuts.includes(choice)) selectedCuts.splice(selectedCuts.indexOf(choice), 1);
      else if (selectedCuts.length < 2) selectedCuts.push(choice);
      else { card(q).querySelector('.feedback').textContent = 'Restore one choice before eliminating another.'; return; }
      T.touch(n, { eliminated: selectedCuts.sort((a, b) => a - b) }); if (selectedCuts.includes(current().pending[q.source]?.choice)) delete current().pending[q.source]; save(); refresh(); return;
    }
    if (event.target.closest('[data-action="start"]')) { if (current() && !current().completedAt) return; const r = E.start(session); r.thinking = {}; (state.sessions[session.id] ||= []).push(r); save(); refresh(); }
  });
  function updateDraft(event) {
    const target = event.target, q = fromElement(target); if (!q || !['prediction', 'tone', 'strength', 'link'].includes(target.name)) return;
    if(editingPredictions.has(q.source)){editingPredictions.get(q.source)[target.name]=target.value.slice(0,160);return;}
    if(revealed(q))return;
    T.touch(editThought(q), { [target.name]: target.value.slice(0, 160) }); save(false); statusUI(); clearTimeout(draftTimer); draftTimer = setTimeout(() => void sync?.push(), 500);
  }
  document.addEventListener('input', event => { if (event.target.classList.contains('prediction-input')) updateDraft(event); });
  document.addEventListener('change', event => {
    if (firstWrongView) return;
    if (event.target.closest('.prediction-form')) { updateDraft(event); return; }
    if (!event.target.matches('input[name="answer"]')) return; const q = fromElement(event.target); if (!q || closed(q)) return;
    ensureRun().pending[q.source] = { choice: Number(event.target.value), at: new Date().toISOString() }; save();
  });
  document.addEventListener('submit', event => {
    if (firstWrongView) { event.preventDefault(); return; }
    const form = event.target, q = fromElement(form); if (!q) return;
    if (form.classList.contains('prediction-form')) { event.preventDefault(); const editing=editingPredictions.get(q.source);if(editing ? T.revise(q,editThought(q),editing) : T.commit(q, editThought(q))) { editingPredictions.delete(q.source);save(); refresh(); } return; }
    if (!form.classList.contains('answer-form')) return; event.preventDefault();
    const input = form.querySelector('input:checked:not(:disabled)');
    if (!revealed(q) || editingPredictions.has(q.source) || !input || cuts(q).includes(Number(input.value))) { form.querySelector('.feedback').textContent = 'Choose an answer first. Eliminating choices is optional. No attempt used.'; return; }
    const eliminated = cuts(q), run = current();
    if (E.submit(run, q, Number(input.value))) { entry(q).attempts.at(-1).eliminated = eliminated; if (!closed(q)) T.touch(editThought(q), { eliminated: [Number(input.value)] }); if (orderedQuestions.every(q => closed(q))) run.completedAt = new Date().toISOString(); save(); refresh(); }
  });
  $('#download').onclick = () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ course: 'Focused VR — 245 selected hard and tricky questions', ...state }, null, 2)], { type: 'application/json' })), a = document.createElement('a'); a.href = url; a.download = 'marco-focused-vr-records.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  function remote(value) { state = S.merge(state, value); save(false); refresh(); }
  window.addEventListener('storage', event => { if (event.key === KEY && event.newValue) try { const value = JSON.parse(event.newValue); if (S.valid(value)) { remote(value); void sync?.push(); } } catch {} });
  window.addEventListener('popstate', () => { const n = Number(new URLSearchParams(location.search).get('q')); if (n >= 1 && n <= total) jump(n - 1, false); });
  render();
  const initial = Number(new URLSearchParams(location.search).get('q')); if (initial >= 1 && initial <= total) jump(initial - 1, false);
  if (!preview) { sync = S.create({ getState: () => state, onRemote: remote, onStatus(k, text) { kind = k; status = text; note(); } }); void sync.start(); }
})();
