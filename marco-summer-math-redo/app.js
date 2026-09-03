(function startMarcoMathRedo() {
  "use strict";

  const APP_ID = "marco-summer-isee-math-redo-v1";
  const STORAGE_KEY = `${APP_ID}:state`;
  const app = document.querySelector("#app");
  let bank = null;
  let state = freshState();
  let selectedDay = 1;
  let view = "practice";
  let feedbackByQuestion = {};
  let selectedAnswers = {};
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

  function firstTryScore(day, session) {
    if (!session?.completedAt) return null;
    const firstWrong = attemptsFor(session)
      .filter((attempt) => attempt.attemptNumber === 1 && !attempt.correct)
      .length;
    return Math.round(((day.questionCount - firstWrong) / day.questionCount) * 100);
  }

  function formatFinishedAt(value) {
    if (!value) return "Not finished";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Finished";
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function metrics(day) {
    const session = latestSession(day.day);
    const attempts = attemptsFor(session);
    const completed = Boolean(session?.completedAt);
    return {
      session,
      attempts,
      resolved: day.questions.filter((question) => resolved(questionAttempts(session, question.id))).length,
      firstWrong: attempts.filter((attempt) => attempt.attemptNumber === 1 && !attempt.correct).length,
      secondWrong: attempts.filter((attempt) => attempt.attemptNumber === 2 && !attempt.correct).length,
      completed,
      firstTryScore: completed ? firstTryScore(day, session) : null,
      finishedAt: session?.completedAt || null,
    };
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
    feedbackByQuestion = {};
    selectedAnswers = {};
    view = "practice";
    render();
  }

  function selectAnswer(questionId, index) {
    const day = bank.days.find((item) => item.day === selectedDay);
    const question = day?.questions.find((item) => String(item.id) === String(questionId));
    const session = latestSession(selectedDay);
    const previous = questionAttempts(session, question?.id);
    if (!question || resolved(previous) || previous.some((attempt) => attempt.selectedIndex === index)) return;
    selectedAnswers[question.id] = index;
    feedbackByQuestion[question.id] = null;
    render();
  }

  function answer(questionId, index) {
    const day = bank.days.find((item) => item.day === selectedDay);
    const question = day?.questions.find((item) => String(item.id) === String(questionId));
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
    if (!session.completedAt && day.questions.every((item) => resolved(questionAttempts(session, item.id)))) {
      session.completedAt = new Date().toISOString();
    }
    feedbackByQuestion[question.id] = {
      correct,
      attemptNumber,
      selectedIndex: index,
      resolved: isResolved,
      reveal: !correct && attemptNumber === 2
        ? { correctHtml: question.correctHtml, explanation: question.explanation }
        : null,
    };
    delete selectedAnswers[question.id];
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
    feedbackByQuestion = {};
    selectedAnswers = {};
    saveState();
    render();
  }

  function summary() {
    const wrongAttempts = state.attempts.filter((attempt) => !attempt.correct);
    const rows = bank.days.map((day) => {
      const dayWrongAttempts = wrongAttempts.filter((attempt) => attempt.day === day.day);
      return {
        day,
        ...metrics(day),
        historyFirstWrong: dayWrongAttempts.filter((attempt) => attempt.attemptNumber === 1).length,
        historySecondWrong: dayWrongAttempts.filter((attempt) => attempt.attemptNumber === 2).length,
      };
    });
    return {
      rows,
      completedDays: rows.filter((row) => row.completed).length,
      resolvedQuestions: rows.reduce((sum, row) => sum + row.resolved, 0),
      wrongQuestions: new Set(wrongAttempts.map((attempt) => attempt.questionId)).size,
      wrongChecks: wrongAttempts.length,
      firstMisses: wrongAttempts.filter((attempt) => attempt.attemptNumber === 1).length,
      secondMisses: wrongAttempts.filter((attempt) => attempt.attemptNumber === 2).length,
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
              <span>${itemMetrics.completed ? "✓" : String(item.day).padStart(2, "0")}</span><b>Day ${item.day}</b><small>${itemMetrics.completed ? `${itemMetrics.firstTryScore}/100` : `${itemMetrics.resolved}/${item.questionCount}`}</small>
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
          <div><strong>${dayMetrics.firstTryScore}/100</strong><span>first-try score</span></div>
          <div><strong>${dayMetrics.firstWrong}</strong><span>first-try misses</span></div>
          <div><strong>${dayMetrics.secondWrong}</strong><span>second-try misses</span></div>
          <div><strong class="finished-time">${esc(formatFinishedAt(dayMetrics.finishedAt))}</strong><span>finished</span></div>
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
    const selectedAnswer = selectedAnswers[question.id];
    const secondWrong = saved.find((attempt) => attempt.attemptNumber === 2 && !attempt.correct);
    const currentFeedback = feedbackByQuestion[question.id] || (secondWrong ? {
      correct: false,
      resolved: true,
      reveal: { correctHtml: question.correctHtml, explanation: question.explanation },
    } : null);
    const options = question.options.map((option, index) => {
      const attempt = saved.find((item) => item.selectedIndex === index);
      const className = [
        attempt ? (attempt.correct ? "right" : "wrong") : "",
        selectedAnswer === index && !attempt ? "selected" : "",
      ].filter(Boolean).join(" ");
      const disabled = currentResolved || Boolean(attempt && !attempt.correct);
      return `<button class="${className}" ${disabled ? "disabled" : ""} data-action="select-answer" data-question-id="${esc(question.id)}" data-index="${index}" type="button" aria-pressed="${selectedAnswer === index}">
        <span class="option-letter">${esc(option.label)}</span><span class="option-content">${option.html}</span>
      </button>`;
    }).join("");

    const feedbackHtml = !currentFeedback ? "" : `
      <div class="feedback ${currentFeedback.correct ? "right" : "wrong"}" role="status">
        <div class="feedback-icon">${currentFeedback.correct ? "✓" : currentFeedback.resolved ? "2" : "1"}</div>
        <div>
          <strong>${currentFeedback.correct ? "Right — nice work!" : currentFeedback.resolved ? "Let’s learn this one." : "Not quite. Try once more."}</strong>
          ${!currentFeedback.correct && !currentFeedback.resolved ? "<span>Your first try is saved. Check the signs, units, and what the question is asking.</span>" : ""}
          ${currentFeedback.reveal ? `<div class="reveal"><p><b>Correct answer:</b> <span>${currentFeedback.reveal.correctHtml}</span></p><p><b>Quick explanation:</b> ${esc(currentFeedback.reveal.explanation)}</p></div>` : ""}
          ${currentFeedback.correct ? "<span>Answer saved online.</span>" : ""}
        </div>
      </div>`;

    return `
      <section class="question-card" id="question-${esc(question.id)}">
        <div class="question-meta">
          <div><span>Day ${day.day}</span><strong>Question ${question.position} of ${day.questionCount}</strong></div>
          <div class="progress-track"><span style="width:${(dayMetrics.resolved / day.questionCount) * 100}%"></span></div>
          <small>Original question #${esc(question.sourceNumber)}</small>
        </div>
        <div class="try-row"><span>Two tries to learn it</span><div aria-label="${saved.length} of 2 tries used"><i class="${saved.length >= 1 ? "used" : ""}"></i><i class="${saved.length >= 2 ? "used" : ""}"></i></div></div>
        <div class="problem">${question.questionHtml}</div>
        <div class="options">${options}</div>
        ${feedbackHtml}
        <footer class="question-footer">
          <span>${dayMetrics.resolved} of ${day.questionCount} questions finished</span>
          ${currentResolved
            ? `<span class="answered-mark">✓ Answer saved</span>`
            : `<button class="primary-action" data-action="check-answer" data-question-id="${esc(question.id)}" type="button" ${selectedAnswer === undefined ? "disabled" : ""}>Check answer</button>`}
        </footer>
      </section>`;
  }

  function allQuestionsHtml(day, dayMetrics) {
    return `
      <main class="question-list">
        <section class="session-overview">
          <div><p class="eyebrow">Day ${day.day}</p><h2>All ${day.questionCount} questions</h2><p>Answer in any order. Each question allows two tries.</p></div>
          <div class="session-progress"><strong>${dayMetrics.resolved}<small>/${day.questionCount}</small></strong><span>finished</span><div class="progress-track"><span style="width:${(dayMetrics.resolved / day.questionCount) * 100}%"></span></div></div>
        </section>
        ${dayMetrics.completed ? completeHtml(day, dayMetrics) : ""}
        ${day.questions.map((question) => questionHtml(day, dayMetrics, question)).join("")}
      </main>`;
  }

  function progressHtml(stats) {
    const questionMap = new Map(bank.days.flatMap((day) => day.questions).map((question) => [question.id, question]));
    const recordedAttempts = state.attempts.filter((attempt) => questionMap.has(attempt.questionId));
    const wrongAttempts = recordedAttempts.filter((attempt) => !attempt.correct);
    const completedSessions = state.sessions
      .filter((session) => session.completedAt)
      .map((session) => {
        const day = bank.days.find((item) => item.day === session.day);
        return day ? {
          day,
          session,
          score: firstTryScore(day, session),
          finishedAt: session.completedAt,
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
    const historyRows = [...new Set(wrongAttempts.map((attempt) => attempt.questionId))]
      .map((questionId) => {
        const question = questionMap.get(questionId);
        const attempts = recordedAttempts.filter((attempt) => attempt.questionId === questionId);
        const wrong = attempts.filter((attempt) => !attempt.correct);
        return {
          question,
          attempts,
          wrong,
          firstWrong: wrong.filter((attempt) => attempt.attemptNumber === 1).length,
          secondWrong: wrong.filter((attempt) => attempt.attemptNumber === 2).length,
          lastChecked: attempts.at(-1)?.createdAt,
        };
      })
      .sort((a, b) => new Date(b.lastChecked || 0) - new Date(a.lastChecked || 0));
    return `
      <section class="progress-page">
        <div class="progress-heading">
          <div><p class="eyebrow">Online record</p><h2>Marco's Progress</h2><p>Every answer is saved when he presses “Check answer.” The two miss columns show exactly where review is still needed.</p></div>
          <button class="secondary-action" data-action="view" data-view="practice" type="button">Return to practice</button>
        </div>
        <div class="history-summary" aria-label="Wrong-answer totals">
          <div><strong>${stats.wrongQuestions}</strong><span>questions missed</span></div>
          <div><strong>${stats.wrongChecks}</strong><span>total wrong checks</span></div>
          <div><strong>${stats.firstMisses}</strong><span>wrong on first try</span></div>
          <div><strong>${stats.secondMisses}</strong><span>wrong on second try</span></div>
        </div>
        <div class="day-summary-grid">
          ${stats.rows.map((row) => `<button data-action="day" data-day="${row.day.day}" type="button">
            <span>Day ${row.day.day}</span><strong>${row.completed ? `${row.firstTryScore}/100` : `${row.resolved}/${row.day.questionCount}`}</strong>
            <div class="mini-track"><i style="width:${(row.resolved / row.day.questionCount) * 100}%"></i></div>
            <small>${row.completed ? `Finished ${esc(formatFinishedAt(row.finishedAt))}` : row.session ? "In progress" : "Not started"} · all-time 1st miss ${row.historyFirstWrong} · 2nd miss ${row.historySecondWrong}</small>
          </button>`).join("")}
        </div>
        <section class="miss-record">
          <div class="record-heading"><h3>Completed sessions</h3><span>${completedSessions.length} finished</span></div>
          ${completedSessions.length === 0 ? '<div class="empty-record">Finished scores and times will appear here.</div>' : `
            <div class="record-table" role="table" aria-label="Completed session history">
              <div class="record-row record-header session-row" role="row"><span>Day</span><span>Round</span><span>Score</span><span>Finished</span></div>
              ${completedSessions.map((item) => `<div class="record-row session-row" role="row">
                <span><b>Day ${item.day.day}</b></span>
                <span>${item.session.runNumber || 1}</span>
                <span><i class="score-mark">${item.score}/100</i></span>
                <span><small>${esc(formatFinishedAt(item.finishedAt))}</small></span>
              </div>`).join("")}
            </div>`}
        </section>
        <section class="miss-record">
          <div class="record-heading"><h3>Wrong-answer history</h3><span>${stats.wrongChecks} wrong checks recorded</span></div>
          ${historyRows.length === 0 ? '<div class="empty-record">No wrong attempts yet. The record will update after Marco starts.</div>' : `
            <div class="record-table" role="table" aria-label="Wrong answer record">
              <div class="record-row record-header" role="row"><span>Question</span><span>Wrong times</span><span>First-try</span><span>Second-try</span><span>Last checked</span></div>
              ${historyRows.map((row) => {
                return `<div class="record-row" role="row">
                  <span><b>Day ${row.question.day} · Q${row.question.position}</b><small>Original #${esc(row.question.sourceNumber || "—")}</small></span>
                  <span><i class="wrong-count">${row.wrong.length}×</i></span>
                  <span><i class="${row.firstWrong ? "miss-mark" : "clear-mark"}">${row.firstWrong || "—"}</i></span>
                  <span><i class="${row.secondWrong ? "miss-mark strong" : "clear-mark"}">${row.secondWrong || "—"}</i></span>
                  <span><small>${new Date(row.lastChecked).toLocaleString()}</small></span>
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
    app.className = "site-shell";
    app.innerHTML = `${headerHtml(stats)}${view === "progress" ? progressHtml(stats) : `<section class="workspace">${railHtml(day)}${allQuestionsHtml(day, dayMetrics)}</section>`}`;
  }

  app.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "view") { view = button.dataset.view || "practice"; feedbackByQuestion = {}; selectedAnswers = {}; render(); }
    if (action === "day") chooseDay(Number(button.dataset.day));
    if (action === "select-answer") selectAnswer(button.dataset.questionId, Number(button.dataset.index));
    if (action === "check-answer") {
      const questionId = button.dataset.questionId;
      const selectedAnswer = selectedAnswers[questionId];
      if (selectedAnswer !== undefined) answer(questionId, selectedAnswer);
    }
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
          feedbackByQuestion = {};
          selectedAnswers = {};
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
