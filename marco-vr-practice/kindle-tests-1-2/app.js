(function () {
  'use strict';
  const session = window.MARCO_ISEE_PRACTICE[0], E = window.MarcoTest3Engine, S = window.MarcoTest3Sync;
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
    return `<section class="solution" aria-label="Answer, meaning, trick, and explanation"><p><b>Answer: ${'ABCD'[q.correct]} · ${esc(q.choices[q.correct])}</b></p><p class="meaning"><strong>${esc(q.word)}</strong> — ${esc(q.meaning)}</p><p class="trick"><strong>TRICK / WHAT TO NOTICE</strong>${esc(q.tip)}</p><p>${esc(q.explanation)}</p><p class="selection-note"><strong>Why selected:</strong> ${esc(q.selection)}</p><div class="related-links">Related past mistakes—skill links, not claims of identical earlier questions:<br>${q.related.map(([date, number, title]) => `<a href="../${date}/#q${number}">${esc(title)} · ${date.slice(5)}</a>`).join('')}</div></section>`;
  }
  function breakdown(run) {
    const skills = [...new Set(session.questions.map(q => q.skill))];
    return `<section class="panel complete"><h3>✓ All 24 questions finished</h3><p>Use first-try results to choose the next practice focus; a retry is a correction, not a new first-try point.</p><table class="skill-table"><thead><tr><th scope="col">Skill</th><th scope="col">First try</th><th scope="col">Fixed on retry</th><th scope="col">Still missed</th></tr></thead><tbody>${skills.map(skill => {
      const qs = session.questions.filter(q => q.skill === skill), stats = E.stats({ questions: qs }, run);
      return `<tr><th scope="row">${esc(skill)}</th><td>${stats.first}/${stats.total}</td><td>${stats.corrected}</td><td>${stats.total - stats.first - stats.corrected}</td></tr>`;
    }).join('')}</tbody></table><button class="primary" type="button" data-action="start">Start another run</button></section>`;
  }
  function records() {
    return `<details class="panel records"><summary>Saved practice runs (${runs().length})</summary>${runs().map((r, i) => { const stats = E.stats(session, r); return `<details><summary>Run ${i + 1} · ${esc(new Date(r.startedAt).toLocaleString())} · ${stats.first}/24 first try · ${r.completedAt ? 'Complete' : 'In progress'}${r.deviceConflict ? ' · Separate device attempt' : ''}</summary><ol>${session.questions.map(q => `<li>Test ${q.test}, ${q.part} Q${q.number}: ${(r.answers[q.source]?.attempts || []).map((a, j) => `Try ${j + 1}: ${'ABCD'[a.choice]} (${a.correct ? 'correct' : 'incorrect'})`).join('; ') || 'Not answered'}</li>`).join('')}</ol></details>`; }).join('')}</details>`;
  }
  function render() {
    const run = current(), stats = E.stats(session, run), q = session.questions[index];
    const tries = entry(q)?.attempts || [], done = closed(q), selected = run?.pending[q.source]?.choice ?? tries.at(-1)?.choice;
    $('#practice-status').className = 'practice-status' + (run?.completedAt ? ' is-complete' : '');
    $('#practice-status').innerHTML = `<h2>${run?.completedAt ? '✓ Practice complete' : run ? 'Mixed hard & tricky practice' : 'Ready when you are'}</h2><p>${run ? `<span class="run-score">First-try score: ${stats.first}/24</span> · ${stats.finished}/24 finished · ${stats.corrected} corrected on retry` : '12 questions from Test 1 + 12 from Test 2 · No timer'}</p>`;
    note();
    if (!run) { $('#workspace').innerHTML = `<section class="panel start-note"><h2>Define, predict, then choose</h2><p>For synonyms, say the exact meaning before checking the options. For sentence completions, use the whole sentence to predict the missing meaning.</p><p>A wrong first answer gets one different second choice. No answer, meaning, or trick is shown after a first wrong try. The explanation appears when you answer correctly or finish your second try.</p><button class="primary" data-action="start">Start 24-question practice</button></section>`; return; }
    const message = done ? (tries[0].correct ? 'Correct first try. Read the trick, then continue.' : tries.at(-1).correct ? 'Correct on your second try. The first-try score stays unchanged.' : 'Two tries used. Read the answer and trick before continuing.') : tries.length ? 'Not quite. Choose a different answer for your second try. The key and explanation are still hidden.' : 'Choose one answer, then check.';
    $('#workspace').innerHTML = navigation(run) + `<article class="question" id="practice-question" data-study-subject="words"><header><h3 id="question-title" tabindex="-1">Question ${index + 1} of 24</h3><span class="source">Book Test ${q.test} · ${q.part} Q${q.number}</span></header><p class="prompt ${q.type === 'synonym' ? 'synonym' : 'completion'}">${esc(q.prompt)}</p><form id="answer-form"><fieldset class="choices"><legend>${done ? 'Recorded answer' : tries.length ? 'Second try · choose a different answer' : 'Choose the best answer'}</legend>${q.choices.map((choice, j) => {
      const used = tries.some(a => a.choice === j);
      return `<label class="choice${done && j === q.correct ? ' correct' : ''}${done && used && j !== q.correct ? ' wrong' : ''}${!done && used ? ' used' : ''}"><input type="radio" name="answer" value="${j}" ${done || used ? 'disabled' : ''} ${selected === j ? 'checked' : ''}><span class="letter">${'ABCD'[j]}</span><span>${esc(choice)}</span></label>`;
    }).join('')}</fieldset>${!done ? `<button class="primary" type="submit">${tries.length ? 'Check second try' : 'Check answer'}</button>` : ''}<p class="feedback" data-kind="${done && tries.at(-1)?.correct ? 'correct' : tries.length ? 'retry' : 'neutral'}" role="status">${message}</p></form>${done ? solution(q) : ''}<div class="question-nav"><button type="button" data-action="previous" ${index === 0 ? 'disabled' : ''}>← Previous</button>${index < 23 ? `<button class="primary" type="button" data-action="next" ${done ? '' : 'disabled'}>Next question →</button>` : '<a href="#practice-status">Back to progress ↑</a>'}</div></article>${run.completedAt ? breakdown(run) : ''}` + records();
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-question]');
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); move(Number(link.dataset.question)); return; }
    const action = event.target.closest('button[data-action]')?.dataset.action;
    if (action === 'start') { if (current() && !current().completedAt) return; (state.sessions[session.id] ||= []).push(E.start(session)); save(); move(0); }
    else if (action === 'previous') move(index - 1);
    else if (action === 'next' && closed(session.questions[index])) move(index + 1);
  });
  document.addEventListener('change', event => {
    if (!event.target.matches('input[name="answer"]')) return;
    const run = current(), q = session.questions[index]; if (!run || closed(q)) return;
    run.pending[q.source] = { choice: Number(event.target.value), at: new Date().toISOString() }; save();
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'answer-form') return; event.preventDefault();
    const input = event.target.querySelector('input:checked:not(:disabled)'), q = session.questions[index], run = current();
    if (!input) { event.target.querySelector('.feedback').textContent = 'Choose a new answer first. No attempt used.'; return; }
    if (E.submit(run, q, Number(input.value))) { if (session.questions.every(q => E.done(q, run.answers[q.source]))) run.completedAt = new Date().toISOString(); save(); const y = scrollY; render(); window.scrollTo(0, y); }
  });
  $('#download').onclick = () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ course: 'Kindle VR Tests 1 and 2 — selected 24', ...state }, null, 2)], { type: 'application/json' })), a = document.createElement('a'); a.href = url; a.download = 'marco-kindle-vr-tests-1-2-records.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  function remote(value) { state = S.merge(state, value); save(false); const y = scrollY; render(); window.scrollTo(0, y); }
  window.addEventListener('storage', event => { if (event.key === KEY && event.newValue) try { const value = JSON.parse(event.newValue); if (S.valid(value)) { remote(value); void sync?.push(); } } catch {} });
  window.addEventListener('popstate', () => { const n = Number(new URLSearchParams(location.search).get('q')) - 1; if (Number.isInteger(n) && n >= 0 && n < 24) { index = n; render(); } });
  render();
  if (!preview) { sync = S.create({ getState: () => state, onRemote: remote, onStatus(k, message) { kind = k; status = message; note(); } }); void sync.start(); }
})();
