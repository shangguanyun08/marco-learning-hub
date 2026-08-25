(function () {
  "use strict";

  const APP_ID = "marco-summer-isee-math-write-in-v1";
  const STORAGE_KEY = `${APP_ID}:state`;
  const app = document.querySelector("#app");
  const encoder = new TextEncoder();
  let bank = null;
  let state = freshState();
  let selectedDay = 1;
  let view = "practice";
  let sync = null;
  let syncTimer = null;
  let messages = {};

  function freshState() {
    return {
      schemaVersion: 1,
      learner: "Marco",
      sessions: [],
      attempts: [],
      drafts: {},
      updatedAt: null,
    };
  }

  function validState(value) {
    return Boolean(
      value &&
      value.schemaVersion === 1 &&
      Array.isArray(value.sessions) &&
      Array.isArray(value.attempts) &&
      value.drafts &&
      typeof value.drafts === "object",
    );
  }

  function loadLocal() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return validState(saved) ? saved : freshState();
    } catch {
      return freshState();
    }
  }

  function writeLocal() {
    state.updatedAt = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function saveState(immediate = true) {
    writeLocal();
    window.clearTimeout(syncTimer);
    if (immediate) sync?.push(state);
    else syncTimer = window.setTimeout(() => sync?.push(state), 550);
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function newId() {
    return crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function latestSession(dayNumber) {
    return state.sessions
      .filter((session) => session.day === dayNumber)
      .sort((a, b) => b.runNumber - a.runNumber)[0] || null;
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

  function attemptsFor(session) {
    return session ? state.attempts.filter((attempt) => attempt.sessionId === session.id) : [];
  }

  function questionAttempts(session, questionId) {
    return attemptsFor(session).filter((attempt) => attempt.questionId === questionId);
  }

  function isMastered(session, questionId) {
    return questionAttempts(session, questionId).some((attempt) => attempt.correct);
  }

  function metrics(day) {
    const session = latestSession(day.day);
    const attempts = attemptsFor(session);
    return {
      session,
      attempts,
      mastered: day.questions.filter((question) => isMastered(session, question.id)).length,
      checked: new Set(attempts.map((attempt) => attempt.questionId)).size,
      wrongChecks: attempts.filter((attempt) => !attempt.correct).length,
      completed: Boolean(session?.completedAt),
    };
  }

  function summary() {
    const questionIds = new Set(bank.days.flatMap((day) => day.questions).map((question) => question.id));
    const recordedAttempts = state.attempts.filter((attempt) => questionIds.has(attempt.questionId));
    const wrongAttempts = recordedAttempts.filter((attempt) => !attempt.correct);
    const wrongQuestionIds = new Set(wrongAttempts.map((attempt) => attempt.questionId));
    const rows = bank.days.map((day) => {
      const historyAttempts = recordedAttempts.filter((attempt) => attempt.day === day.day);
      return {
        day,
        ...metrics(day),
        historyAttempts,
        historyWrongChecks: historyAttempts.filter((attempt) => !attempt.correct).length,
      };
    });
    return {
      rows,
      completedDays: rows.filter((row) => row.completed).length,
      masteredQuestions: rows.reduce((sum, row) => sum + row.mastered, 0),
      wrongQuestions: wrongQuestionIds.size,
      wrongChecks: wrongAttempts.length,
      totalChecks: recordedAttempts.length,
      recoveredQuestions: [...wrongQuestionIds].filter((questionId) => recordedAttempts.some((attempt) => attempt.questionId === questionId && attempt.correct)).length,
    };
  }

  function canonicalize(value) {
    let text = String(value ?? "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[−–—]/g, "-")
      .replace(/[×·]/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi")
      .replace(/°/g, "degrees")
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .replace(/\s+/g, "")
      .replace(/[.!?]/g, "")
      .replace(/\(([-+]?\d+(?:\.\d+)?)\)/g, "$1")
      .replace(/\(([-+]?\d+(?:\.\d+)?)\)\/\(([-+]?\d+(?:\.\d+)?)\)/g, "$1/$2");
    if (/^[-+]?\d+(?:\.\d+)?$/.test(text)) {
      const number = Number(text);
      if (Number.isFinite(number)) text = String(number);
    }
    return text;
  }

  async function hashAnswer(value) {
    const bytes = await crypto.subtle.digest("SHA-256", encoder.encode(canonicalize(value)));
    return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function answerValue(question, session) {
    if (state.drafts[question.id] !== undefined) return state.drafts[question.id];
    const attempts = questionAttempts(session, question.id);
    return attempts.at(-1)?.answer || "";
  }

  async function gradeQuestion(question, session) {
    if (isMastered(session, question.id)) return false;
    const answer = String(state.drafts[question.id] ?? "").trim();
    if (!answer) {
      messages[question.id] = { kind: "empty", text: "Write an answer before checking." };
      return false;
    }

    const attempts = questionAttempts(session, question.id);
    const last = attempts.at(-1);
    if (last && !last.correct && canonicalize(last.answer) === canonicalize(answer)) {
      messages[question.id] = { kind: "empty", text: "Change your answer before checking again." };
      return false;
    }

    const answerHash = await hashAnswer(answer);
    const correct = question.answerHashes.includes(answerHash);
    state.attempts.push({
      id: newId(),
      sessionId: session.id,
      day: question.day,
      questionId: question.id,
      questionPosition: question.position,
      attemptNumber: attempts.length + 1,
      answer,
      correct,
      createdAt: new Date().toISOString(),
    });
    messages[question.id] = correct
      ? { kind: "correct", text: "Right — this question is complete." }
      : { kind: "wrong", text: "Not right yet. Rework it and try again — the answer stays hidden." };
    return true;
  }

  function finishIfReady(day, session) {
    if (!session.completedAt && day.questions.every((question) => isMastered(session, question.id))) {
      session.completedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  async function checkOne(questionId) {
    const day = bank.days.find((item) => item.day === selectedDay);
    const question = day?.questions.find((item) => item.id === questionId);
    if (!day || !question) return;
    const session = ensureSession(day.day);
    const changed = await gradeQuestion(question, session);
    const completed = finishIfReady(day, session);
    if (changed || completed) saveState(true);
    render();
  }

  async function checkAll() {
    const day = bank.days.find((item) => item.day === selectedDay);
    if (!day) return;
    const session = ensureSession(day.day);
    let changed = false;
    for (const question of day.questions) {
      if (String(state.drafts[question.id] ?? "").trim() && !isMastered(session, question.id)) {
        changed = (await gradeQuestion(question, session)) || changed;
      }
    }
    const completed = finishIfReady(day, session);
    if (changed || completed) saveState(true);
    render();
  }

  function chooseDay(dayNumber) {
    if (!bank.days.some((day) => day.day === dayNumber)) return;
    selectedDay = dayNumber;
    messages = {};
    view = "practice";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restartDay() {
    const day = bank.days.find((item) => item.day === selectedDay);
    const previous = latestSession(selectedDay);
    if (!day || !previous?.completedAt) return;
    state.sessions.push({
      id: newId(),
      day: selectedDay,
      runNumber: previous.runNumber + 1,
      startedAt: new Date().toISOString(),
      completedAt: null,
    });
    day.questions.forEach((question) => { delete state.drafts[question.id]; });
    messages = {};
    saveState(true);
    render();
  }

  function headerHtml(stats) {
    return `
      <header class="topbar write-in-topbar">
        <div><p class="eyebrow">Independent answer practice</p><h1>Marco's Math Write-In</h1></div>
        <div class="write-in-actions">
          <nav aria-label="Main navigation">
            <button class="${view === "practice" ? "active" : ""}" data-action="view" data-view="practice" type="button">Practice</button>
            <button class="${view === "progress" ? "active" : ""}" data-action="view" data-view="progress" type="button">Progress</button>
          </nav>
          <div class="sync-pill" data-online-sync="${APP_ID}" role="status"><span></span> Connecting online…</div>
        </div>
      </header>
      <section class="hero-strip write-in-summary">
        <div><strong>${stats.completedDays}<small>/14</small></strong><span>sessions all right</span></div>
        <div><strong>${stats.masteredQuestions}<small>/${bank.totalQuestions}</small></strong><span>answers mastered</span></div>
        <div><strong>${stats.wrongChecks}</strong><span>reworked answers</span></div>
        <div><strong>100%</strong><span>is the finish line</span></div>
      </section>`;
  }

  function dayPickerHtml(activeDay) {
    return `
      <section class="day-rail write-in-days">
        <div class="rail-heading"><strong>Your sessions</strong><span>Choose one full day</span></div>
        <div class="day-list">${bank.days.map((day) => {
          const dayStats = metrics(day);
          return `<button class="${day.day === activeDay ? "active" : ""} ${dayStats.completed ? "done" : ""}" data-action="day" data-day="${day.day}" type="button">
            <span>${dayStats.completed ? "✓" : String(day.day).padStart(2, "0")}</span><b>Day ${day.day}</b><small>${dayStats.mastered}/${day.questionCount}</small>
          </button>`;
        }).join("")}</div>
      </section>`;
  }

  function questionCardHtml(question, session) {
    const attempts = questionAttempts(session, question.id);
    const last = attempts.at(-1);
    const mastered = attempts.some((attempt) => attempt.correct);
    const message = messages[question.id] || (last
      ? last.correct
        ? { kind: "correct", text: "Right — this question is complete." }
        : { kind: "wrong", text: "Not right yet. Rework it and try again — the answer stays hidden." }
      : null);
    const value = answerValue(question, session);
    const statusClass = mastered ? "status-correct" : last ? "status-wrong" : "status-open";
    const statusLabel = mastered ? "Correct" : last ? "Keep working" : "Not checked";
    return `
      <article class="write-question ${statusClass}" id="${question.id}">
        <div class="write-question-number"><span>${mastered ? "✓" : question.position}</span><small>Original #${esc(question.sourceNumber)}</small></div>
        <div class="write-question-body">
          <div class="question-status"><span>${statusLabel}</span><small>${attempts.length ? `${attempts.length} ${attempts.length === 1 ? "check" : "checks"}` : "Write it yourself"}</small></div>
          <div class="problem">${question.questionHtml}</div>
          <div class="answer-row">
            <label for="answer-${question.id}">Your answer</label>
            <input id="answer-${question.id}" data-question="${question.id}" inputmode="text" autocomplete="off" spellcheck="false" value="${esc(value)}" placeholder="Type the value, expression, or conclusion" ${mastered ? "disabled" : ""} />
            <button data-action="check" data-question="${question.id}" type="button" ${mastered ? "disabled" : ""}>${mastered ? "Completed" : "Check answer"}</button>
          </div>
          ${message ? `<div class="answer-feedback ${message.kind}" role="status">${message.kind === "correct" ? "✓" : message.kind === "wrong" ? "↻" : "!"}<span>${esc(message.text)}</span></div>` : ""}
        </div>
      </article>`;
  }

  function practiceHtml(stats) {
    const day = bank.days.find((item) => item.day === selectedDay) || bank.days[0];
    const dayStats = metrics(day);
    const complete = dayStats.completed;
    return `
      ${dayPickerHtml(day.day)}
      <section class="session-heading">
        <div><p class="eyebrow">Session ${day.day} of 14</p><h2>Day ${day.day}: write every answer</h2></div>
        <p>All ${day.questionCount} questions are shown together. Correct answers lock in; answers that need work stay editable. The site never reveals the solution.</p>
      </section>
      <section class="session-toolbar ${complete ? "complete" : ""}">
        <div><strong>${complete ? "Session mastered" : `${dayStats.mastered} of ${day.questionCount} right`}</strong><span>${complete ? "Every answer is correct." : "Keep revising until the whole day reaches 100%."}</span></div>
        <div class="toolbar-track" aria-label="${dayStats.mastered} of ${day.questionCount} correct"><i style="width:${(dayStats.mastered / day.questionCount) * 100}%"></i></div>
        ${complete
          ? `<button class="secondary-action" data-action="restart" type="button">Practice Day ${day.day} again</button>`
          : `<button class="primary-action" data-action="check-all" type="button">Check written answers</button>`}
      </section>
      <section class="no-reveal-note"><strong>Independent mode</strong><span>You will see only “right” or “not right yet.” The correct answer is never shown.</span></section>
      <section class="write-question-list">${day.questions.map((question) => questionCardHtml(question, dayStats.session)).join("")}</section>
      <footer class="session-footer"><strong>${dayStats.mastered} of ${day.questionCount} right</strong><button class="primary-action" data-action="check-all" type="button" ${complete ? "disabled" : ""}>${complete ? "All answers correct" : "Check written answers"}</button></footer>`;
  }

  function progressHtml(stats) {
    const questionMap = new Map(bank.days.flatMap((day) => day.questions).map((question) => [question.id, question]));
    const recordedAttempts = state.attempts.filter((attempt) => questionMap.has(attempt.questionId));
    const wrongAttempts = recordedAttempts.filter((attempt) => !attempt.correct);
    const historyRows = [...new Set(wrongAttempts.map((attempt) => attempt.questionId))]
      .map((questionId) => {
        const question = questionMap.get(questionId);
        const attempts = recordedAttempts.filter((attempt) => attempt.questionId === questionId);
        const wrong = attempts.filter((attempt) => !attempt.correct);
        return {
          question,
          attempts,
          wrong,
          recovered: attempts.some((attempt) => attempt.correct),
          lastChecked: attempts.at(-1)?.createdAt,
        };
      })
      .sort((a, b) => new Date(b.lastChecked || 0) - new Date(a.lastChecked || 0));
    return `
      <section class="write-progress-heading">
        <div><p class="eyebrow">Independent mastery record</p><h2>Progress without answer reveals</h2><p>Every check is saved online. This history shows how many questions Marco missed and exactly how many wrong attempts each one needed.</p></div>
        <button class="secondary-action" data-action="view" data-view="practice" type="button">Return to practice</button>
      </section>
      <section class="write-history-summary" aria-label="Wrong-answer totals">
        <div><strong>${stats.wrongQuestions}</strong><span>questions missed</span></div>
        <div><strong>${stats.wrongChecks}</strong><span>total wrong checks</span></div>
        <div><strong>${stats.recoveredQuestions}</strong><span>fixed after a miss</span></div>
        <div><strong>${stats.totalChecks}</strong><span>all checks recorded</span></div>
      </section>
      <section class="write-progress-grid">${stats.rows.map((row) => `
        <button data-action="day" data-day="${row.day.day}" type="button" class="${row.completed ? "complete" : ""}">
          <span>Day ${row.day.day}</span><strong>${row.mastered}<small>/${row.day.questionCount}</small></strong>
          <div class="mini-track"><i style="width:${(row.mastered / row.day.questionCount) * 100}%"></i></div>
          <small>${row.completed ? "All right · " : ""}${row.historyWrongChecks} wrong · ${row.historyAttempts.length} total checks</small>
        </button>`).join("")}</section>
      <section class="write-history">
        <div class="write-history-heading"><h3>Wrong-answer history</h3><span>${stats.wrongChecks} wrong checks recorded</span></div>
        ${historyRows.length === 0 ? '<div class="write-history-empty">No wrong answers yet. Each miss will appear here after Marco checks it.</div>' : `
          <div class="write-history-table" role="table" aria-label="Write-in wrong-answer history">
            <div class="write-history-row write-history-header" role="row"><span>Question</span><span>Wrong times</span><span>Total checks</span><span>Current status</span><span>Last checked</span></div>
            ${historyRows.map((row) => `<div class="write-history-row" role="row">
              <span><b>Day ${row.question.day} · Q${row.question.position}</b><small>Original #${esc(row.question.sourceNumber || "—")}</small></span>
              <span><i class="write-wrong-count">${row.wrong.length}×</i></span>
              <span><b>${row.attempts.length}</b></span>
              <span><i class="write-history-status ${row.recovered ? "fixed" : "working"}">${row.recovered ? "Fixed" : "Still working"}</i></span>
              <span><small>${new Date(row.lastChecked).toLocaleString()}</small></span>
            </div>`).join("")}
          </div>`}
      </section>`;
  }

  function render() {
    if (!bank) return;
    const stats = summary();
    app.className = "site-shell write-in-shell";
    app.innerHTML = `${headerHtml(stats)}${view === "progress" ? progressHtml(stats) : practiceHtml(stats)}`;
  }

  app.addEventListener("input", (event) => {
    const input = event.target.closest("input[data-question]");
    if (!input) return;
    state.drafts[input.dataset.question] = input.value;
    delete messages[input.dataset.question];
    saveState(false);
  });

  app.addEventListener("keydown", (event) => {
    const input = event.target.closest("input[data-question]");
    if (!input || event.key !== "Enter") return;
    event.preventDefault();
    void checkOne(input.dataset.question);
  });

  app.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "view") { view = button.dataset.view || "practice"; messages = {}; render(); }
    if (action === "day") chooseDay(Number(button.dataset.day));
    if (action === "check") void checkOne(button.dataset.question);
    if (action === "check-all") void checkAll();
    if (action === "restart") restartDay();
  });

  fetch("write-in-bank.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("The practice questions could not be loaded.");
      return response.json();
    })
    .then((questionBank) => {
      bank = questionBank;
      state = loadLocal();
      const firstIncomplete = bank.days.find((day) => !metrics(day).completed) || bank.days[0];
      selectedDay = firstIncomplete.day;
      render();
      sync = window.MarcoOnlineSync.create({
        appId: APP_ID,
        studentName: "Marco",
        validate: validState,
        score(value) {
          return value.attempts.length * 10 + value.sessions.filter((session) => session.completedAt).length * 10000;
        },
        onRemote(remoteState) {
          state = remoteState;
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
          messages = {};
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
