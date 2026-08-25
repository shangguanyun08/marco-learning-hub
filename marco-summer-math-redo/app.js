(function startMarcoMathRedo() {
  "use strict";

  const APP_ID = "marco-summer-isee-math-redo-v1";
  const STORAGE_KEY = `${APP_ID}:state`;
  const app = document.querySelector("#app");
  let bank = null;
  let state = freshState();
  let selectedDay = 1;
  let position = 0;
  let view = "practice";
  let feedback = null;
  let sync = null;

  function freshState() {
    return { schemaVersion: 1, learner: "Marco", sessions: [], attempts: [], updatedAt: null };
  }

  function validState(value) {
    return Boolean(value && value.schemaVersion === 1 && Array.isArray(value.sessions) && Array.isArray(value.attempts));
  }

  function loadLocal() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return validState(saved) ? saved : freshState();
    } catch {
      return freshState();
    }
  }

  function saveState() {
    state.updatedAt = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    sync?.push(state);
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function latestSession(dayNumber) {
    return state.sessions
      .filter((session) => session.day === dayNumber)
      .sort((a, b) => b.runNumber - a.runNumber)[0] || null;
  }

  function attemptsFor(session) {
    return session ? state.attempts.filter((attempt) => attempt.sessionId === session.id) : [];
  }

  function questionAttempts(session, questionId) {
    return attemptsFor(session).filter((attempt) => attempt.questionId === questionId);
  }

  function resolved(attempts) {
    return attempts.some((attempt) => attempt.correct) || attempts.length >= 2;
  }

  function metrics(day) {
    const session = latestSession(day.day);
    const attempts = attemptsFor(session);
    return {
      session,
      attempts,
      resolved: day.questions.filter((question) => resolved(questionAttempts(session, question.id))).length,
      firstWrong: attempts.filter((attempt) => attempt.attemptNumber === 1 && !attempt.correct).length,
      secondWrong: attempts.filter((attempt) => attempt.attemptNumber === 2 && !attempt.correct).length,
      completed: Boolean(session?.completedAt),
    };
  }

  function nextOpen(day) {
    const session = latestSession(day.day);
    if (session?.completedAt) return day.questionCount;
    const index = day.questions.findIndex((question) => !resolved(questionAttempts(session, question.id)));
    return index < 0 ? day.questionCount : index;
  }

  function newId() {
    return crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function ensureSession(dayNumber) {
    const existing = latestSession(dayNumber);
    if (existing && !existing.completedAt) return existing;
    const session = {
      id: newId(),
      day: dayNumber,
      runNumber: (existing?.runNumber || 0) + 1,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };
    state.sessions.push(session);
    return session;
  }

  function chooseDay(dayNumber) {
    const day = bank.days.find((item) => item.day === dayNumber);
    if (!day) return;
    selectedDay = dayNumber;
    position = nextOpen(day);
    feedback = null;
    view = "practice";
    render();
  }

  function answer(index) {
    const day = bank.days.find((item) => item.day === selectedDay);
    const question = day?.questions[position];
    if (!day || !question) return;
    const session = ensureSession(day.day);
    const previous = questionAttempts(session, question.id);
    if (resolved(previous) || previous.some((attempt) => attempt.selectedIndex === index)) return;

    const attemptNumber = previous.length + 1;
    const correct = question.correctIndexes.includes(index);
    const attempt = {
      id: newId(),
      sessionId: session.id,
      day: day.day,
      questionId: question.id,
      questionPosition: question.position,
      attemptNumber,
      selectedIndex: index,
      correct,
      createdAt: new Date().toISOString(),
    };
    state.attempts.push(attempt);
    const isResolved = correct || attemptNumber === 2;
    if (isResolved && question.position === day.questionCount) session.completedAt = new Date().toISOString();
    feedback = {
      correct,
      attemptNumber,
      selectedIndex: index,
      resolved: isResolved,
      reveal: !correct && attemptNumber === 2
        ? { correctHtml: question.correctHtml, explanation: question.explanation }
        : null,
    };
    saveState();
    render();
  }

  function startAgain() {
    const previous = latestSession(selectedDay);
    if (previous && !previous.completedAt) return;
    state.sessions.push({
      id: newId(),
      day: selectedDay,
      runNumber: (previous?.runNumber || 0) + 1,
      startedAt: new Date().toISOString(),
      completedAt: null,
    });
    position = 0;
    feedback = null;
    saveState();
    render();
  }

  function advance() {
    const day = bank.days.find((item) => item.day === selectedDay);
    if (!day || !feedback?.resolved) return;
    feedback = null;
    position = Math.min(position + 1, day.questionCount);
    render();
  }

  function summary() {
    const rows = bank.days.map((day) => ({ day, ...metrics(day) }));
    return {
      rows,
      completedDays: rows.filter((row) => row.completed).length,
      resolvedQuestions: rows.reduce((sum, row) => sum + row.resolved, 0),
      firstMisses: rows.reduce((sum, row) => sum + row.firstWrong, 0),
      secondMisses: rows.reduce((sum, row) => sum + row.secondWrong, 0),
    };
  }

  function headerHtml(stats) {
    return `
      <header class="topbar">
        <div><p class="eyebrow">Summer ISEE · Math mistake practice</p><h1>Marco's Math Redo</h1></div>
        <div class="top-actions">
          <nav aria-label="Main navigation">
            <button class="${view === "practice" ? "active" : ""}" data-action="view" data-view="practice" type="button">Practice</button>
            <button class="${view === "progress" ? "active" : ""}" data-action="view" data-view="progress" type="button">Progress</button>
          </nav>
          <div class="sync-pill" data-online-sync="${APP_ID}" role="status"><span></span> Connecting online…</div>
        </div>
      </header>
      <section class="hero-strip" aria-label="Practice summary">
        <div><strong>${stats.completedDays}<small>/14</small></strong><span>sessions finished</span></div>
        <div><strong>${stats.resolvedQuestions}<small>/${bank.totalQuestions}</small></strong><span>questions completed</span></div>
        <div><strong>${stats.firstMisses}</strong><span>missed first try</span></div>
        <div><strong>${stats.secondMisses}</strong><span>missed second try</span></div>
      </section>`;
  }

  function railHtml(day) {
    return `
      <aside class="day-rail">
        <div class="rail-heading"><strong>Your sessions</strong><span>One day at a time</span></div>
        <div class="day-list">
          ${bank.days.map((item) => {
            const itemMetrics = metrics(item);
            return `<button class="${item.day === day.day ? "active" : ""} ${itemMetrics.completed ? "done" : ""}" data-action="day" data-day="${item.day}" type="button">
              <span>${itemMetrics.completed ? "✓" : String(item.day).padStart(2, "0")}</span><b>Day ${item.day}</b><small>${itemMetrics.resolved}/${item.questionCount}</small>
            </button>`;
          }).join("")}
        </div>
      </aside>`;
  }

  function completeHtml(day, dayMetrics) {
    return `
      <section class="question-card complete-card">
        <div class="complete-badge">✓</div><p class="eyebrow">Session complete</p>
        <h2>Day ${day.day} is finished.</h2>
        <p>Marco completed all ${day.questionCount} questions in this session. Every first and second try is saved in the online progress record.</p>
        <div class="complete-stats">
          <div><strong>${dayMetrics.firstWrong}</strong><span>first-try misses</span></div>
          <div><strong>${dayMetrics.secondWrong}</strong><span>second-try misses</span></div>
          <div><strong>${dayMetrics.session?.runNumber || 1}</strong><span>session round</span></div>
        </div>
        <div class="complete-actions">
          ${day.day < 14 ? `<button class="primary-action" data-action="day" data-day="${day.day + 1}" type="button">Go to Day ${day.day + 1}</button>` : ""}
          <button class="secondary-action" data-action="restart" type="button">Practice Day ${day.day} again</button>
          <button class="text-action" data-action="view" data-view="progress" type="button">See progress record</button>
        </div>
      </section>`;
  }

  function questionHtml(day, dayMetrics, question) {
    const session = dayMetrics.session;
    const saved = questionAttempts(session, question.id);
    const currentResolved = resolved(saved);
    const options = question.options.map((option, index) => {
      const attempt = saved.find((item) => item.selectedIndex === index);
      const className = attempt ? (attempt.correct ? "right" : "wrong") : "";
      const disabled = currentResolved || Boolean(attempt && !attempt.correct);
      return `<button class="${className}" ${disabled ? "disabled" : ""} data-action="answer" data-index="${index}" type="button">
        <span class="option-letter">${esc(option.label)}</span><span class="option-content">${option.html}</span>
      </button>`;
    }).join("");

    const feedbackHtml = !feedback ? "" : `
      <div class="feedback ${feedback.correct ? "right" : "wrong"}" role="status">
        <div class="feedback-icon">${feedback.correct ? "✓" : feedback.resolved ? "2" : "1"}</div>
        <div>
          <strong>${feedback.correct ? "Right — nice work!" : feedback.resolved ? "Let’s learn this one." : "Not quite. Try once more."}</strong>
          ${!feedback.correct && !feedback.resolved ? "<span>Your first try is saved. Check the signs, units, and what the question is asking.</span>" : ""}
          ${feedback.reveal ? `<div class="reveal"><p><b>Correct answer:</b> <span>${feedback.reveal.correctHtml}</span></p><p><b>Quick explanation:</b> ${esc(feedback.reveal.explanation)}</p></div>` : ""}
          ${feedback.correct ? "<span>Answer saved online. Move on when you’re ready.</span>" : ""}
        </div>
      </div>`;

    return `
      <section class="question-card">
        <div class="question-meta">
          <div><span>Day ${day.day}</span><strong>Question ${position + 1} of ${day.questionCount}</strong></div>
          <div class="progress-track"><span style="width:${(dayMetrics.resolved / day.questionCount) * 100}%"></span></div>
          <small>Original question #${esc(question.sourceNumber)}</small>
        </div>
        <div class="try-row"><span>Two tries to learn it</span><div aria-label="${saved.length} of 2 tries used"><i class="${saved.length >= 1 ? "used" : ""}"></i><i class="${saved.length >= 2 ? "used" : ""}"></i></div></div>
        <div class="problem">${question.questionHtml}</div>
        <div class="options">${options}</div>
        ${feedbackHtml}
        <footer class="question-footer">
          <span>${dayMetrics.resolved} of ${day.questionCount} finished · Run ${session?.runNumber || 1}</span>
          ${feedback?.resolved ? `<button class="primary-action" data-action="advance" type="button">${position === day.questionCount - 1 ? "Finish Day" : "Next Question"} →</button>` : ""}
        </footer>
      </section>`;
  }

  function progressHtml(stats) {
    const wrongKeys = [...new Set(state.attempts.filter((attempt) => !attempt.correct).map((attempt) => `${attempt.sessionId}|${attempt.questionId}`))];
    const questionMap = new Map(bank.days.flatMap((day) => day.questions).map((question) => [question.id, question]));
    return `
      <section class="progress-page">
        <div class="progress-heading">
          <div><p class="eyebrow">Online record</p><h2>Marco's Progress</h2><p>Every answer is saved when he chooses it. The two miss columns show exactly where review is still needed.</p></div>
          <button class="secondary-action" data-action="view" data-view="practice" type="button">Return to practice</button>
        </div>
        <div class="day-summary-grid">
          ${stats.rows.map((row) => `<button data-action="day" data-day="${row.day.day}" type="button">
            <span>Day ${row.day.day}</span><strong>${row.resolved}/${row.day.questionCount}</strong>
            <div class="mini-track"><i style="width:${(row.resolved / row.day.questionCount) * 100}%"></i></div>
            <small>${row.completed ? "Complete" : row.session ? "In progress" : "Not started"} · 1st miss ${row.firstWrong} · 2nd miss ${row.secondWrong}</small>
          </button>`).join("")}
        </div>
        <section class="miss-record">
          <div class="record-heading"><h3>Questions to review</h3><span>${stats.secondMisses} missed twice</span></div>
          ${wrongKeys.length === 0 ? '<div class="empty-record">No wrong attempts yet. The record will update after Marco starts.</div>' : `
            <div class="record-table" role="table" aria-label="Wrong answer record">
              <div class="record-row record-header" role="row"><span>Question</span><span>First try</span><span>Second try</span><span>Saved</span></div>
              ${wrongKeys.map((key) => {
                const [sessionId, questionId] = key.split("|");
                const attempts = state.attempts.filter((attempt) => attempt.sessionId === sessionId && attempt.questionId === questionId);
                const sample = attempts[0];
                const itemQuestion = questionMap.get(questionId);
                const firstWrong = attempts.some((attempt) => attempt.attemptNumber === 1 && !attempt.correct);
                const secondWrong = attempts.some((attempt) => attempt.attemptNumber === 2 && !attempt.correct);
                return `<div class="record-row" role="row">
                  <span><b>Day ${sample.day} · Q${sample.questionPosition}</b><small>Original #${esc(itemQuestion?.sourceNumber || "—")}</small></span>
                  <span><i class="${firstWrong ? "miss-mark" : "clear-mark"}">${firstWrong ? "Wrong" : "—"}</i></span>
                  <span><i class="${secondWrong ? "miss-mark strong" : "clear-mark"}">${secondWrong ? "Wrong again" : "Recovered"}</i></span>
                  <span><small>${new Date(attempts.at(-1)?.createdAt || sample.createdAt).toLocaleString()}</small></span>
                </div>`;
              }).join("")}
            </div>`}
        </section>
      </section>`;
  }

  function render() {
    if (!bank) return;
    const stats = summary();
    const day = bank.days.find((item) => item.day === selectedDay) || bank.days[0];
    const dayMetrics = metrics(day);
    const question = day.questions[position];
    app.className = "site-shell";
    app.innerHTML = `${headerHtml(stats)}${view === "progress" ? progressHtml(stats) : `<section class="workspace">${railHtml(day)}${position >= day.questionCount ? completeHtml(day, dayMetrics) : questionHtml(day, dayMetrics, question)}</section>`}`;
  }

  app.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "view") { view = button.dataset.view || "practice"; feedback = null; render(); }
    if (action === "day") chooseDay(Number(button.dataset.day));
    if (action === "answer") answer(Number(button.dataset.index));
    if (action === "advance") advance();
    if (action === "restart") startAgain();
  });

  fetch("question-bank.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("The question bank could not be loaded.");
      return response.json();
    })
    .then((questionBank) => {
      bank = questionBank;
      state = loadLocal();
      const firstIncomplete = bank.days.find((day) => !latestSession(day.day)?.completedAt) || bank.days[0];
      selectedDay = firstIncomplete.day;
      position = nextOpen(firstIncomplete);
      render();
      sync = window.MarcoOnlineSync.create({
        appId: APP_ID,
        studentName: "Marco",
        validate: validState,
        score(value) {
          return value.attempts.length * 10 + value.sessions.filter((session) => session.completedAt).length;
        },
        onRemote(remoteState) {
          state = remoteState;
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
          const activeDay = bank.days.find((day) => day.day === selectedDay);
          if (activeDay) position = nextOpen(activeDay);
          feedback = null;
          render();
        },
      });
      sync.start(state);
    })
    .catch((error) => {
      app.className = "loading";
      app.innerHTML = `<div class="loading-mark">!</div><strong>${esc(error.message)}</strong>`;
    });
})();
