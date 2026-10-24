(function () {
  'use strict';
  const session = window.MARCO_ISEE_PRACTICE[0], E = window.MarcoTest3Engine, S = window.MarcoTest3Sync, T = window.KindleVRThinking;
  const demo = new URLSearchParams(location.search).has('demo');
  const preview = demo || ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
  const KEY = S.APP_ID + (preview ? ':preview' : ''), $ = s => document.querySelector(s);
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const empty = () => ({ version: 1, sessions: {} });
  let state = empty(), sync = null, storageOK = true;
  let status = preview ? 'Preview · Online records are untouched.' : 'Connecting to live online sync…';
  let kind = preview ? 'preview' : 'connecting';
  try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (S.valid(saved)) state = S.merge(saved, empty()); } catch { storageOK = false; }
  const runs = () => state.sessions[session.id] || [], current = () => runs().at(-1);
  const entry = q => current()?.answers[q.source], closed = q => E.done(q, entry(q));
  const thought = q => current()?.thinking?.[q.source];
  let draftTimer;
  function editThought(q) { const run = current(); run.thinking ||= {}; return run.thinking[q.source] ||= T.make(); }
  function cuts(q, n = thought(q)) {
    const locked = (entry(q)?.attempts || []).map(a => a.choice);
    return [...new Set([...locked, ...(n?.eliminated || [])])].slice(0, 2).sort((a, b) => a - b);
  }
  function revealed(q) { return !!thought(q)?.committed || !!thought(q)?.legacySeen || !!entry(q)?.attempts.length || current()?.pending[q.source] !== undefined; }
  const label = value => ({ good: 'Good / positive', bad: 'Bad / negative', neutral: 'Neutral / not applicable', strong: 'Strong', weak: 'Weak', neither: 'Neither / not applicable', unsure: 'Not sure', same: 'Same / supports the clue', opposite: 'Opposite / contrast' }[value] || 'Not selected');
  function predictionUI(q, done) {
    const n = thought(q), snapshot = n?.committed;
    if (revealed(q) || done) {
      if (!snapshot) return '<section class="prediction-saved"><h4>1 · Prediction</h4><p>This question was started before prediction steps were added. Your earlier answer is kept; prediction comes first on new questions.</p></section>';
      return `<section class="prediction-saved"><h4>1 · Your prediction, before seeing choices</h4><p class="saved-prediction">${esc(snapshot.prediction)}</p><p class="thinking-caption">${q.type === 'synonym' ? `${esc(label(snapshot.tone))} · ${esc(label(snapshot.strength))}` : esc(label(snapshot.link))} · Saved, not automatically graded</p></section>`;
    }
    const values = n || { prediction: '', tone: '', strength: '', link: '' };
    const group = (name, title, options) => `<fieldset class="thinking-group"><legend>${title}</legend><div class="thinking-pills">${options.map(([value, text]) => `<label><input type="radio" name="${name}" value="${value}" ${values[name] === value ? 'checked' : ''}><span>${text}</span></label>`).join('')}</div></fieldset>`;
    return `<form id="prediction-form" class="prediction-box"><h4>1 · Predict first — choices are hidden</h4><label class="prediction-label" for="prediction-text">Write a simple meaning or a few words for the blank</label><textarea id="prediction-text" name="prediction" maxlength="160" rows="2" placeholder="1–5 simple words; your best guess is OK" autocomplete="off">${esc(values.prediction)}</textarea>${q.type === 'synonym' ? group('tone', 'Meaning / feeling', [['good', 'Good'], ['bad', 'Bad'], ['neutral', 'Neutral / not applicable'], ['unsure', 'Not sure']]) + group('strength', 'Strength / degree', [['strong', 'Strong'], ['weak', 'Weak'], ['neither', 'Neither / not applicable'], ['unsure', 'Not sure']]) + '<p class="thinking-caption">Use these clues only when they fit. Some words are neither good nor bad, strong nor weak.</p>' : group('link', 'How does the blank relate to your clue?', [['same', 'Same / supports it'], ['opposite', 'Opposite / contrast'], ['unsure', 'Not sure']]) + '<p class="thinking-caption">Use the whole sentence. Words such as “although” are clues, not an automatic rule for every blank.</p>'}<button class="primary" type="submit" ${T.ready(q, values) ? '' : 'disabled'}>Save prediction & show choices</button><p class="prediction-feedback" role="status">Write a few words and choose the clues that fit. “Not sure” is allowed. This step is saved, not graded.</p></form>`;
  }
  function answerUI(q, run, done, tries, selected) {
    const eliminated = cuts(q), ready = eliminated.length === 2;
    const message = done ? (tries[0].correct ? 'Correct first try. Compare your prediction with the meaning and trick.' : tries.at(-1).correct ? 'Correct on your second try. Your first-try score stays unchanged.' : 'Two tries used. Compare your prediction and eliminations with the answer.') : tries.length ? 'Not quite. Your first choice is out. Reconsider the others: eliminate one more, then choose between the two left. The answer and trick are still hidden.' : ready ? 'Two options left. Compare their exact meanings with your prediction, then choose.' : 'Eliminate two choices before choosing between the remaining two. You can restore a choice before checking.';
    return `<section class="elimination-heading"><h4>2 · ${done ? 'Your choices' : 'Eliminate two, then choose'}</h4>${!done ? `<p id="elimination-count">${eliminated.length}/2 eliminated · No hints are given about whether an elimination is right.</p>` : ''}</section><form id="answer-form"><fieldset class="choices"><legend>${done ? 'Recorded answer' : '3 · Choose between the two closest options'}</legend>${q.choices.map((choice, j) => {
      const used = tries.some(a => a.choice === j), out = !done && eliminated.includes(j);
      return `<div class="choice-row${out ? ' eliminated' : ''}"><label class="choice${done && j === q.correct ? ' correct' : ''}${done && used && j !== q.correct ? ' wrong' : ''}"><input type="radio" name="answer" value="${j}" ${done || used || out || !ready ? 'disabled' : ''} ${selected === j && !out ? 'checked' : ''}><span class="letter">${'ABCD'[j]}</span><span class="choice-text">${esc(choice)}</span></label>${!done ? `<button type="button" class="eliminate-button" data-eliminate="${j}" aria-pressed="${out}" ${used ? 'disabled' : ''} aria-label="${used ? `Choice ${'ABCD'[j]} is ruled out by your first try` : `${out ? 'Restore' : 'Eliminate'} ${'ABCD'[j]}`}">${used ? 'Ruled out' : out ? 'Restore' : 'Eliminate'}</button>` : ''}</div>`;
    }).join('')}</fieldset>${!done ? `<button class="primary" type="submit" ${ready ? '' : 'disabled'}>${tries.length ? 'Check second try' : 'Check answer'}</button>` : ''}<p class="feedback" data-kind="${done && tries.at(-1)?.correct ? 'correct' : tries.length ? 'retry' : 'neutral'}" role="status">${message}</p></form>`;
  }
  let index = Number(new URLSearchParams(location.search).get('q')) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= session.questions.length) index = Math.max(0, session.questions.findIndex(q => !closed(q)));
  function note() { $('#save-note').textContent = storageOK ? status : 'Device saving unavailable. Keep the page open and download your records.'; $('#save-note').dataset.kind = storageOK ? kind : 'offline'; }
  function save(upload = true) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { storageOK = false; } note(); if (upload) void sync?.push(); }
  function move(i, focus = true) { index = Math.max(0, Math.min(session.questions.length - 1, i)); const url = new URL(location.href); url.searchParams.set('q', String(index + 1)); history.replaceState(null, '', url); render(); if (focus) $('#question-title')?.focus(); }
  function navigation(run) {
    return `<nav class="mixed-nav" aria-label="24 mixed questions in four groups of six">${[0, 6, 12, 18].map(start => `<div class="jump" role="group" aria-label="Questions ${start + 1} to ${start + 6}">${session.questions.slice(start, start + 6).map((q, j) => {
      const i = start + j, tries = run.answers[q.source]?.attempts || [];
      const cls = tries[0]?.correct ? 'first-correct' : tries[1]?.correct ? 'corrected' : tries.length === 1 ? 'retry' : tries.length === 2 ? 'incorrect' : '';
      const label = tries[0]?.correct ? 'correct first try' : tries[1]?.correct ? 'corrected on retry' : tries.length === 1 ? 'second try available' : tries.length === 2 ? 'incorrect after two tries' : 'not answered';
      return `<a href="?q=${i + 1}${demo ? '&demo=1' : ''}" data-question="${i}" class="${cls}" ${i === index ? 'aria-current="step"' : ''} aria-label="Question ${i + 1}: ${label}">${i + 1}</a>`;
    }).join('')}</div>`).join('')}</nav>`;
  }
  function solution(q) {
    const firstCuts = entry(q)?.attempts[0]?.eliminated;
    return `<section class="solution" aria-label="Answer, meaning, trick, and explanation"><p><b>Answer: ${'ABCD'[q.correct]} · ${esc(q.choices[q.correct])}</b></p><p class="meaning"><strong>${esc(q.word)}</strong> — ${esc(q.meaning)}</p><p class="trick"><strong>TRICK / WHAT TO NOTICE</strong>${esc(q.tip)}</p><p>${esc(q.explanation)}</p>${firstCuts ? `<p class="elimination-review"><strong>Your first eliminations:</strong> ${firstCuts.map(i => `${'ABCD'[i]} · ${esc(q.choices[i])}`).join('; ')}. ${firstCuts.includes(q.correct) ? 'You crossed out the correct answer. Recheck which part of its meaning you ruled out.' : 'The correct answer stayed in your final pair.'}</p>` : ''}<p class="selection-note"><strong>Why selected:</strong> ${esc(q.selection)}</p><div class="related-links">Related past mistakes—skill links, not claims of identical earlier questions:<br>${q.related.map(([date, number, title]) => `<a href="../${date}/#q${number}">${esc(title)} · ${date.slice(5)}</a>`).join('')}</div></section>`;
  }
  function breakdown(run) {
    const skills = [...new Set(session.questions.map(q => q.skill))];
    return `<section class="panel complete"><h3>✓ All 24 questions finished</h3><p>Use first-try results to choose the next practice focus; a retry is a correction, not a new first-try point.</p><table class="skill-table"><thead><tr><th scope="col">Skill</th><th scope="col">First try</th><th scope="col">Fixed on retry</th><th scope="col">Still missed</th></tr></thead><tbody>${skills.map(skill => {
      const qs = session.questions.filter(q => q.skill === skill), stats = E.stats({ questions: qs }, run);
      return `<tr><th scope="row">${esc(skill)}</th><td>${stats.first}/${stats.total}</td><td>${stats.corrected}</td><td>${stats.total - stats.first - stats.corrected}</td></tr>`;
    }).join('')}</tbody></table><button class="primary" type="button" data-action="start">Start another run</button></section>`;
  }
  function records() {
    return `<details class="panel records"><summary>Saved practice runs (${runs().length})</summary>${runs().map((r, i) => { const stats = E.stats(session, r); return `<details><summary>Run ${i + 1} · ${esc(new Date(r.startedAt).toLocaleString())} · ${stats.first}/24 first try · ${r.completedAt ? 'Complete' : 'In progress'}${r.deviceConflict ? ' · Separate device attempt' : ''}</summary><ol>${session.questions.map(q => { const p = r.thinking?.[q.source]?.committed; return `<li>Test ${q.test}, ${q.part} Q${q.number}${p ? ` · Prediction: “${esc(p.prediction)}”` : ''}: ${(r.answers[q.source]?.attempts || []).map((a, j) => `Try ${j + 1}: ${'ABCD'[a.choice]} (${a.correct ? 'correct' : 'incorrect'})${a.eliminated ? `; eliminated ${a.eliminated.map(i => 'ABCD'[i]).join(', ')}` : ''}`).join('; ') || 'Not answered'}</li>`; }).join('')}</ol></details>`; }).join('')}</details>`;
  }
  function render() {
    const run = current(), stats = E.stats(session, run), q = session.questions[index];
    const tries = entry(q)?.attempts || [], done = closed(q), selected = run?.pending[q.source]?.choice ?? tries.at(-1)?.choice;
    $('#practice-status').className = 'practice-status' + (run?.completedAt ? ' is-complete' : '');
    $('#practice-status').innerHTML = `<h2>${run?.completedAt ? '✓ Practice complete' : run ? 'Mixed hard & tricky practice' : 'Ready when you are'}</h2><p>${run ? `<span class="run-score">First-try score: ${stats.first}/24</span> · ${stats.finished}/24 finished · ${stats.corrected} corrected on retry` : '12 questions from Test 1 + 12 from Test 2 · No timer'}</p>`;
    note();
    if (!run) { $('#workspace').innerHTML = `<section class="panel start-note"><h2>Predict → eliminate → choose</h2><p>First write a few simple words while all choices are hidden. For synonyms, consider good/bad and strong/weak when useful. For sentence completions, decide whether your clue supports the blank or contrasts with it.</p><p>Then reveal the choices, eliminate two, and choose between the two left. A first wrong answer gets a second chance to reconsider the eliminations. Meanings, tricks, and explanations stay hidden until a correct answer or the end of the second try.</p><button class="primary" data-action="start">Start 24-question practice</button></section>`; return; }
    $('#workspace').innerHTML = navigation(run) + `<article class="question" id="practice-question" data-study-subject="words"><header><h3 id="question-title" tabindex="-1">Question ${index + 1} of 24</h3><span class="source">Book Test ${q.test} · ${q.part} Q${q.number}</span></header><p class="prompt ${q.type === 'synonym' ? 'synonym' : 'completion'}">${esc(q.prompt)}</p>${predictionUI(q, done)}${revealed(q) || done ? answerUI(q, run, done, tries, selected) : '<p class="choices-hidden-note">All four answer choices are hidden until you save your prediction.</p>'}${done ? solution(q) : ''}<div class="question-nav"><button type="button" data-action="previous" ${index === 0 ? 'disabled' : ''}>← Previous</button>${index < 23 ? `<button class="primary" type="button" data-action="next" ${done ? '' : 'disabled'}>Next question →</button>` : '<a href="#practice-status">Back to progress ↑</a>'}</div></article>${run.completedAt ? breakdown(run) : ''}` + records();
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-question]');
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); move(Number(link.dataset.question)); return; }
    const eliminate = event.target.closest('button[data-eliminate]');
    if (eliminate) {
      const q = session.questions[index], choice = Number(eliminate.dataset.eliminate);
      if (closed(q) || !revealed(q) || entry(q)?.attempts.some(a => a.choice === choice)) return;
      const selectedCuts = cuts(q), n = editThought(q);
      if (selectedCuts.includes(choice)) selectedCuts.splice(selectedCuts.indexOf(choice), 1);
      else if (selectedCuts.length < 2) selectedCuts.push(choice);
      else { $('#answer-form .feedback').textContent = 'Two are already eliminated. Restore one before eliminating another.'; return; }
      T.touch(n, { eliminated: selectedCuts.sort((a, b) => a - b) });
      if (selectedCuts.includes(current().pending[q.source]?.choice)) delete current().pending[q.source];
      save(); const y = scrollY; render(); window.scrollTo(0, y); return;
    }
    const action = event.target.closest('button[data-action]')?.dataset.action;
    if (action === 'start') { if (current() && !current().completedAt) return; const run = E.start(session); run.thinking = {}; (state.sessions[session.id] ||= []).push(run); save(); move(0); }
    else if (action === 'previous') move(index - 1);
    else if (action === 'next' && closed(session.questions[index])) move(index + 1);
  });
  document.addEventListener('change', event => {
    if (event.target.closest('#prediction-form')) { updateDraft(event); return; }
    if (!event.target.matches('input[name="answer"]')) return;
    const run = current(), q = session.questions[index]; if (!run || closed(q)) return;
    run.pending[q.source] = { choice: Number(event.target.value), at: new Date().toISOString() }; save();
  });
  document.addEventListener('submit', event => {
    if (event.target.id === 'prediction-form') {
      event.preventDefault(); const q = session.questions[index], n = editThought(q);
      if (T.commit(q, n)) { save(); const y = scrollY; render(); window.scrollTo(0, y); }
      else if ($('#prediction-form .prediction-feedback')) $('#prediction-form .prediction-feedback').textContent = 'Add your short prediction and choose the clues that fit; Not sure is allowed.';
      return;
    }
    if (event.target.id !== 'answer-form') return; event.preventDefault();
    const input = event.target.querySelector('input:checked:not(:disabled)'), q = session.questions[index], run = current();
    if (!revealed(q) || cuts(q).length !== 2 || !input || cuts(q).includes(Number(input.value))) { event.target.querySelector('.feedback').textContent = 'Eliminate exactly two choices, then choose a remaining answer. No attempt used.'; return; }
    const eliminated = cuts(q);
    if (E.submit(run, q, Number(input.value))) {
      entry(q).attempts.at(-1).eliminated = eliminated;
      if (!closed(q)) T.touch(editThought(q), { eliminated: [Number(input.value)] });
      if (session.questions.every(q => E.done(q, run.answers[q.source]))) run.completedAt = new Date().toISOString(); save(); const y = scrollY; render(); window.scrollTo(0, y);
    }
  });
  function updateDraft(event) {
    const target = event.target, q = session.questions[index];
    if (!current() || revealed(q) || !['prediction', 'tone', 'strength', 'link'].includes(target.name)) return;
    const n = editThought(q); T.touch(n, { [target.name]: target.value.slice(0, 160) }); save(false);
    const button = $('#prediction-form button[type="submit"]'); if (button) button.disabled = !T.ready(q, n);
    clearTimeout(draftTimer); draftTimer = setTimeout(() => void sync?.push(), 500);
  }
  document.addEventListener('input', event => { if (event.target.id === 'prediction-text') updateDraft(event); });
  $('#download').onclick = () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ course: 'Kindle VR Tests 1 and 2 — selected 24', ...state }, null, 2)], { type: 'application/json' })), a = document.createElement('a'); a.href = url; a.download = 'marco-kindle-vr-tests-1-2-records.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  function remote(value) { const focused = document.activeElement, caret = focused?.id === 'prediction-text' ? [focused.selectionStart, focused.selectionEnd] : null; state = S.merge(state, value); save(false); const y = scrollY; render(); if (caret && $('#prediction-text')) { $('#prediction-text').focus({ preventScroll: true }); $('#prediction-text').setSelectionRange(...caret); } window.scrollTo(0, y); }
  window.addEventListener('storage', event => { if (event.key === KEY && event.newValue) try { const value = JSON.parse(event.newValue); if (S.valid(value)) { remote(value); void sync?.push(); } } catch {} });
  window.addEventListener('popstate', () => { const n = Number(new URLSearchParams(location.search).get('q')) - 1; if (Number.isInteger(n) && n >= 0 && n < 24) { index = n; render(); } });
  render();
  if (!preview) { sync = S.create({ getState: () => state, onRemote: remote, onStatus(k, message) { kind = k; status = message; note(); } }); void sync.start(); }
})();
