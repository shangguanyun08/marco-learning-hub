(function () {
  'use strict';
  const pageNumber = Number(document.body.dataset.page);
  const session = window.MARCO_ISEE_PRACTICE[pageNumber - 1], E = window.MarcoTest3Engine, S = window.MarcoTest3Sync, T = window.KindleVRThinking;
  if (!session) throw new Error('Unknown Kindle practice page');
  const total = session.questions.length;
  // Display order changes only; saved questionSources and source IDs stay fixed.
  const orderedQuestions = [...session.questions.filter(q => q.type === 'synonym'), ...session.questions.filter(q => q.type !== 'synonym')];
  const editingPredictions = new Map();
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
  const entry = q => current()?.answers[q.source], thought = q => current()?.thinking?.[q.source], closed = q => E.done(q, entry(q));
  const revealed = q => !!thought(q)?.committed || !!thought(q)?.legacySeen || !!entry(q)?.attempts.length || current()?.pending[q.source] !== undefined;
  const fromElement = el => questions.get(el.closest('[data-source]')?.dataset.source);
  const card = q => document.getElementById(`q-${orderedQuestions.indexOf(q) + 1}`);
  const label = value => ({ good: 'Good', bad: 'Bad', strong: 'Strong', weak: 'Weak', same: 'Same', opposite: 'Opposite' }[value] || '');
  function ensureRun() { if (!current()) { const r = E.start(session); r.thinking = {}; (state.sessions[session.id] ||= []).push(r); } return current(); }
  function editThought(q) { const r = ensureRun(); r.thinking ||= {}; return r.thinking[q.source] ||= T.make(); }
  function cuts(q) { return [...new Set([...(entry(q)?.attempts || []).map(a => a.choice), ...(thought(q)?.eliminated || [])])].slice(0, 2).sort((a, b) => a - b); }
  function note() { $('#save-note').textContent = storageOK ? status : 'Device saving unavailable. Keep the page open and download your records.'; $('#save-note').dataset.kind = storageOK ? kind : 'offline'; }
  function save(upload = true) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { storageOK = false; } note(); if (upload) void sync?.push(); }
  function statusUI() {
    const r = current(), stats = E.stats(session, r);
    $('#practice-status').className = 'practice-status' + (r?.completedAt ? ' is-complete' : '');
    $('#practice-status').innerHTML = `<h2>${r?.completedAt ? '✓ Practice complete' : `Page ${pageNumber} · ${total} questions`}</h2><p><span class="run-score">First-try score: ${stats.first}/${total}</span> · ${stats.finished}/${total} finished · ${stats.corrected} corrected on retry</p>`;
    if ($('#practice-intro')) $('#practice-intro').innerHTML = `<p>Prediction and elimination are optional. One simple word is enough—or leave it blank and click <strong>Show choices</strong>. You can edit your prediction later.</p>${!r ? `<button type="button" data-action="start" class="primary">Start ${total}-question practice</button><span class="thinking-caption"> Or begin with any question below.</span>` : '<button type="button" data-action="restart" class="start-fresh">Start fresh practice</button><span class="thinking-caption"> Earlier work stays in saved history.</span>'}`;
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
    const n = thought(q), snapshot = n?.revised || n?.committed, editing = editingPredictions.has(q.source);
    if ((revealed(q) || closed(q)) && !editing) {
      const facets = snapshot ? (q.type === 'synonym' ? [snapshot.tone, snapshot.strength] : [snapshot.link]).map(label).filter(Boolean) : [];
      return `<section class="prediction-saved"><h4>Your prediction</h4><p class="saved-prediction">${snapshot?.prediction ? esc(snapshot.prediction) : 'Skipped'}</p>${facets.length ? `<p class="thinking-caption">${facets.map(esc).join(' · ')}</p>` : ''}<button type="button" class="primary edit-prediction" data-edit-prediction>Edit prediction</button></section>`;
    }
    const values = editingPredictions.get(q.source) || n || { prediction: '', tone: '', strength: '', link: '' };
    const group = (name, title, options) => `<fieldset class="thinking-group"><legend>${title} <span class="optional-label">(optional)</span></legend><div class="thinking-pills">${options.map(([value, text]) => `<label><input type="radio" name="${name}" value="${value}" ${values[name] === value ? 'checked' : ''}><span>${text}</span></label>`).join('')}</div></fieldset>`;
    const sentence = q.type !== 'synonym';
    return `<form class="prediction-form prediction-box" data-source="${q.source}"><label class="prediction-label" for="prediction-${q.source}">Your prediction <span class="optional-label">(optional)</span></label><input class="prediction-input" id="prediction-${q.source}" type="text" name="prediction" maxlength="160" placeholder="${sentence ? 'Clue word—or its opposite (optional)' : 'One simple word (optional)'}" ${sentence ? `aria-describedby="prediction-guide-${q.source}"` : ''} autocomplete="off" value="${esc(values.prediction)}">${sentence ? `<p class="thinking-caption sentence-prediction-guide" id="prediction-guide-${q.source}">Use a <strong>clue word or short phrase</strong> from the rest of the sentence. If the ideas contrast, try its <strong>opposite</strong>.</p>` : ''}${q.type === 'synonym' ? `<div class="quick-clues">${group('tone', 'Meaning', [['good', 'Good'], ['bad', 'Bad']])}${group('strength', 'Strength', [['strong', 'Strong'], ['weak', 'Weak']])}</div>` : group('link', 'Sentence clue', [['same', 'Same'], ['opposite', 'Opposite']])}<button type="submit" class="primary">${editing ? 'Save prediction' : 'Show choices'}</button>${editing ? '<button type="button" class="cancel-prediction" data-cancel-prediction>Cancel</button>' : '<span class="thinking-caption optional-hint">Blank is OK.</span>'}</form>`;
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
  function solution(q) {
    const firstCuts = entry(q)?.attempts[0]?.eliminated;
    const explanation = q.explanation.includes(q.tip) ? '' : `<p>${esc(q.explanation)}</p>`;
    const related = q.related.length ? `<div class="related-links">Related past mistakes—skill links:<br>${q.related.map(([date, number, title]) => `<a href="../${date}/#q${number}">${esc(title)} · ${date.slice(5)}</a>`).join('')}</div>` : '';
    return `<section class="solution" aria-label="Answer, meaning, trick, and explanation"><p><b>Answer: ${'ABCD'[q.correct]} · ${esc(q.choices[q.correct])}</b></p><p class="meaning"><strong>${esc(q.word)}</strong> — ${esc(q.meaning)}</p><p class="trick"><strong>TRICK / EXPLANATION</strong>${esc(q.tip)}</p>${explanation}${firstCuts?.length ? `<p class="elimination-review"><strong>Your first eliminations:</strong> ${firstCuts.map(i => `${'ABCD'[i]} · ${esc(q.choices[i])}`).join('; ')}. ${firstCuts.includes(q.correct) ? 'You crossed out the correct answer. Recheck the meaning you ruled out.' : 'The correct answer was not crossed out.'}</p>` : ''}<p class="selection-note"><strong>Why selected:</strong> ${esc(q.selection)}</p>${related}</section>`;
  }
  function questionUI(q, i) {
    return `<article class="question" id="q-${i + 1}" data-source="${q.source}" data-study-subject="words"><header><h3 id="question-title-${i + 1}" tabindex="-1">Question ${i + 1} of ${total}</h3><span class="source">Book Test ${q.test} · ${q.part} Q${q.number}</span></header><p class="prompt ${q.type === 'synonym' ? 'synonym' : 'completion'}">${esc(q.type === 'synonym' ? q.word.toUpperCase() : q.prompt)}</p>${predictionUI(q)}${!editingPredictions.has(q.source) && (revealed(q) || closed(q)) ? answerUI(q) : '<p class="choices-hidden-note">Choices hidden · reveal whenever you are ready.</p>'}${closed(q) && !editingPredictions.has(q.source) ? solution(q) : ''}</article>`;
  }
  function breakdown() {
    return `<section class="panel complete"><h3>✓ All ${total} questions finished</h3><table class="skill-table"><thead><tr><th scope="col">Skill</th><th scope="col">First try</th><th scope="col">Fixed on retry</th><th scope="col">Still missed</th></tr></thead><tbody>${[...new Set(orderedQuestions.map(q => q.skill))].map(skill => {
      const stats = E.stats({ questions: orderedQuestions.filter(q => q.skill === skill) }, current());
      return `<tr><th scope="row">${esc(skill)}</th><td>${stats.first}/${stats.total}</td><td>${stats.corrected}</td><td>${stats.total - stats.first - stats.corrected}</td></tr>`;
    }).join('')}</tbody></table><button type="button" class="primary" data-action="start">Start another run</button></section>`;
  }
  function records() {
    return `<details class="panel records"><summary>Saved practice runs (${runs().length})</summary>${runs().map((r, i) => { const stats = E.stats(session, r); return `<details><summary>Run ${i + 1} · ${esc(new Date(r.startedAt).toLocaleString())} · ${stats.first}/${total} first try · ${r.completedAt ? 'Complete' : 'In progress'}</summary><ol>${orderedQuestions.map(q => { const p = r.thinking?.[q.source]?.committed, revised = r.thinking?.[q.source]?.revised; return `<li>Test ${q.test}, ${q.part} Q${q.number}${p ? ` · Prediction: ${p.prediction ? `“${esc(p.prediction)}”` : 'skipped'}` : ''}${revised ? ` · Updated prediction: ${revised.prediction ? `“${esc(revised.prediction)}”` : 'skipped'}` : ''}: ${(r.answers[q.source]?.attempts || []).map((a, j) => `Try ${j + 1}: ${'ABCD'[a.choice]} (${a.correct ? 'correct' : 'incorrect'})${a.eliminated ? `; eliminated ${a.eliminated.map(i => 'ABCD'[i]).join(', ')}` : ''}`).join('; ') || 'Not answered'}</li>`; }).join('')}</ol></details>`; }).join('')}</details>`;
  }
  function render() {
    $('#workspace').innerHTML = `<section id="practice-intro" class="practice-intro"></section>${navigation()}<div class="questions-list">${orderedQuestions.map((q, i) => (i === 0 || q.type !== orderedQuestions[i-1].type ? `<h2 class="question-type-heading">${q.type === 'synonym' ? 'Synonyms' : 'Sentence completion'} · ${orderedQuestions.filter(x => x.type === q.type).length} questions</h2>` : '') + questionUI(q, i) + ((i + 1) % 10 === 0 && i < total - 1 ? '<hr class="question-group-divider" aria-hidden="true">' : '')).join('')}</div>${current()?.completedAt ? breakdown() : ''}${records()}`;
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
    const edit = event.target.closest('[data-edit-prediction]');
    if (edit) { const q=fromElement(edit); if(!q)return; const n=thought(q), values=n?.revised||n?.committed||n||{prediction:'',tone:'',strength:'',link:''}; editingPredictions.set(q.source,{prediction:values.prediction,tone:values.tone,strength:values.strength,link:values.link}); refresh(); document.getElementById(`prediction-${q.source}`)?.focus({preventScroll:true}); return; }
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
    if (event.target.closest('.prediction-form')) { updateDraft(event); return; }
    if (!event.target.matches('input[name="answer"]')) return; const q = fromElement(event.target); if (!q || closed(q)) return;
    ensureRun().pending[q.source] = { choice: Number(event.target.value), at: new Date().toISOString() }; save();
  });
  document.addEventListener('submit', event => {
    const form = event.target, q = fromElement(form); if (!q) return;
    if (form.classList.contains('prediction-form')) { event.preventDefault(); const editing=editingPredictions.get(q.source);if(editing ? T.revise(q,editThought(q),editing) : T.commit(q, editThought(q))) { editingPredictions.delete(q.source);save(); refresh(); } return; }
    if (!form.classList.contains('answer-form')) return; event.preventDefault();
    const input = form.querySelector('input:checked:not(:disabled)');
    if (!revealed(q) || editingPredictions.has(q.source) || !input || cuts(q).includes(Number(input.value))) { form.querySelector('.feedback').textContent = 'Choose an answer first. Eliminating choices is optional. No attempt used.'; return; }
    const eliminated = cuts(q), run = current();
    if (E.submit(run, q, Number(input.value))) { entry(q).attempts.at(-1).eliminated = eliminated; if (!closed(q)) T.touch(editThought(q), { eliminated: [Number(input.value)] }); if (orderedQuestions.every(q => closed(q))) run.completedAt = new Date().toISOString(); save(); refresh(); }
  });
  $('#download').onclick = () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ course: 'Kindle VR Tests 1–8 — selected hard and tricky', ...state }, null, 2)], { type: 'application/json' })), a = document.createElement('a'); a.href = url; a.download = 'marco-kindle-vr-tests-1-8-records.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  function remote(value) { state = S.merge(state, value); save(false); refresh(); }
  window.addEventListener('storage', event => { if (event.key === KEY && event.newValue) try { const value = JSON.parse(event.newValue); if (S.valid(value)) { remote(value); void sync?.push(); } } catch {} });
  window.addEventListener('popstate', () => { const n = Number(new URLSearchParams(location.search).get('q')); if (n >= 1 && n <= total) jump(n - 1, false); });
  render();
  const initial = Number(new URLSearchParams(location.search).get('q')); if (initial >= 1 && initial <= total) jump(initial - 1, false);
  if (!preview) { sync = S.create({ getState: () => state, onRemote: remote, onStatus(k, text) { kind = k; status = text; note(); } }); void sync.start(); }
})();
