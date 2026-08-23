import { questionBank } from "./questions.js?v=1";
import {
  activateSession,
  advanceQuestion,
  answeredCount,
  createProgress,
  currentAnswer,
  isProgressValid,
  recordAnswer,
  restartSession,
  sessionStatus,
} from "./core.js?v=2";

const STORAGE_KEY = "marco-r2-round1-misses-v1";
const API_BASE =
  "https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/r2";
const POLL_INTERVAL_MS = 5000;
const root = document.querySelector("#app");
const questionById = new Map(
  questionBank.questions.map((question) => [question.id, question]),
);
const answerKey = Object.fromEntries(
  questionBank.questions.map((question) => [question.id, question.answer]),
);
const letters = ["A", "B", "C", "D"];

let view = "practice";
let notice = "";
let resultMessage = "";
let onlineResults = [];
let syncState = "connecting";
let syncError = "";
let lastSyncedAt = "";
let refreshInFlight = false;

function migrateProgress(saved) {
  if (!saved || saved.version !== 1) return saved;
  const migrated = structuredClone(saved);
  migrated.version = 2;
  for (const session of Object.values(migrated.sessions || {})) {
    session.attemptId ||= crypto.randomUUID();
    session.history ||= [];
  }
  return migrated;
}

function loadProgress() {
  try {
    const saved = migrateProgress(
      JSON.parse(localStorage.getItem(STORAGE_KEY)),
    );
    if (!isProgressValid(saved, questionBank.sessions, questionBank.questions)) {
      throw new Error("Old or invalid progress");
    }
    return saved;
  } catch {
    return createProgress(
      questionBank.sessions,
      questionBank.questions,
      questionBank.initialRound,
    );
  }
}

let progress = loadProgress();
saveProgress();

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function selectedSessionMeta() {
  return questionBank.sessions.find(
    (session) => session.number === progress.selectedSession,
  );
}

function selectedProgress() {
  return progress.sessions[String(progress.selectedSession)];
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function isMeaningful(session) {
  return Boolean(
    session?.completed ||
      session?.history?.length ||
      answeredCount(session) ||
      (session?.round?.position ?? 0) > 0,
  );
}

function compareSessions(left, right) {
  if (!right) return 1;
  if (!left) return -1;
  const leftTime = Date.parse(left.updatedAt || "1970-01-01");
  const rightTime = Date.parse(right.updatedAt || "1970-01-01");

  if (left.attemptId !== right.attemptId) {
    return leftTime - rightTime;
  }
  if (left.completed !== right.completed) return left.completed ? 1 : -1;
  if (left.started !== right.started) return left.started ? 1 : -1;
  const leftRound = left.round?.roundNumber ?? 0;
  const rightRound = right.round?.roundNumber ?? 0;
  if (leftRound !== rightRound) return leftRound - rightRound;
  const answerDifference = answeredCount(left) - answeredCount(right);
  if (answerDifference) return answerDifference;
  const positionDifference =
    (left.round?.position ?? 0) - (right.round?.position ?? 0);
  if (positionDifference) return positionDifference;
  return leftTime - rightTime;
}

function normalizeRemote(remote, local) {
  return {
    attemptId: remote.attemptId,
    started: remote.started,
    completed: remote.completed,
    round: remote.round,
    history: local?.history || [],
    updatedAt: remote.updatedAt,
  };
}

function mergeRemoteProgress(remoteItems, pushLocalNewer = false) {
  const remoteBySession = new Map(
    remoteItems.map((item) => [Number(item.wordSession), item]),
  );
  const pushSessions = [];

  for (const meta of questionBank.sessions) {
    const key = String(meta.number);
    const local = progress.sessions[key];
    const remote = remoteBySession.get(meta.number);

    if (!remote) {
      if (pushLocalNewer && isMeaningful(local)) pushSessions.push(meta.number);
      continue;
    }

    const normalized = normalizeRemote(remote, local);
    if (!isMeaningful(local) || compareSessions(normalized, local) > 0) {
      progress.sessions[key] = normalized;
    } else if (
      pushLocalNewer &&
      compareSessions(local, normalized) > 0
    ) {
      pushSessions.push(meta.number);
    }
  }

  return pushSessions;
}

function sessionPayload(session) {
  return {
    attemptId: session.attemptId,
    started: session.started,
    completed: session.completed,
    round: session.round,
    updatedAt: session.updatedAt,
  };
}

async function parseResponse(response, fallback) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || fallback);
  return body;
}

async function syncSession(wordSession, quiet = false) {
  const session = progress.sessions[String(wordSession)];
  if (!session?.started) return;

  if (!quiet) {
    syncState = "saving";
    syncError = "";
    render();
  }

  try {
    const response = await fetch(`${API_BASE}/progress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        studentName: "Marco",
        wordSession,
        ...sessionPayload(session),
      }),
    });
    const body = await parseResponse(response, "Could not upload R2 progress.");
    const current = progress.sessions[String(wordSession)];
    const remote = normalizeRemote(body.progress, current);
    if (compareSessions(remote, current) >= 0) {
      progress.sessions[String(wordSession)] = remote;
      saveProgress();
    }
    syncState = "online";
    syncError = "";
    lastSyncedAt = new Date().toISOString();
  } catch (error) {
    syncState = "error";
    syncError =
      error instanceof Error ? error.message : "Could not upload R2 progress.";
  }
  render();
}

async function saveFinishedRound(wordSession, attemptId, round) {
  try {
    const response = await fetch(`${API_BASE}/results`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        studentName: "Marco",
        sessionId: attemptId,
        wordSession,
        roundNumber: round.roundNumber,
        questionIds: round.questionIds,
        answers: round.answers,
        startedAt: round.startedAt,
      }),
    });
    const body = await parseResponse(response, "Could not upload R2 result.");
    onlineResults = [
      body.result,
      ...onlineResults.filter(
        (item) =>
          !(
            item.sessionId === body.result.sessionId &&
            item.roundNumber === body.result.roundNumber
          ),
      ),
    ];
    syncState = "online";
    syncError = "";
    lastSyncedAt = new Date().toISOString();
    render();
  } catch (error) {
    syncState = "error";
    syncError =
      error instanceof Error ? error.message : "Could not upload R2 result.";
    render();
  }
}

async function refreshOnline({ initial = false, quiet = false } = {}) {
  if (refreshInFlight) return;
  refreshInFlight = true;
  if (!quiet) {
    syncState = initial ? "connecting" : "saving";
    syncError = "";
    render();
  }

  try {
    const [progressResponse, resultsResponse] = await Promise.all([
      fetch(`${API_BASE}/progress`, { cache: "no-store" }),
      fetch(`${API_BASE}/results`, { cache: "no-store" }),
    ]);
    const [progressBody, resultsBody] = await Promise.all([
      parseResponse(progressResponse, "Could not load online R2 progress."),
      parseResponse(resultsResponse, "Could not load online R2 results."),
    ]);

    const pushSessions = mergeRemoteProgress(
      progressBody.progress || [],
      initial,
    );
    onlineResults = resultsBody.results || [];
    syncState = "online";
    syncError = "";
    lastSyncedAt = new Date().toISOString();
    saveProgress();
    render();

    if (pushSessions.length) {
      await Promise.all(
        pushSessions.map((sessionNumber) => syncSession(sessionNumber, true)),
      );
    }
  } catch (error) {
    syncState = "error";
    syncError =
      error instanceof Error ? error.message : "Online R2 sync is unavailable.";
    render();
  } finally {
    refreshInFlight = false;
  }
}

function syncNoteMarkup() {
  const labels = {
    connecting: "Connecting to the shared online record…",
    saving: "Uploading the latest answer…",
    online: lastSyncedAt
      ? `Online sync · updated ${formatDate(lastSyncedAt)}`
      : "Online sync is active on all devices.",
    error: "Online sync needs attention.",
  };
  return `
    <div class="sync-note ${syncState === "error" ? "error" : ""}">
      <span></span> ${escapeHtml(labels[syncState])}
    </div>
    ${syncError ? `<div class="notice error" role="alert">${escapeHtml(syncError)} Progress is still safe on this device and will retry automatically.</div>` : ""}
  `;
}

function headerMarkup() {
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">249 Round 1 misses · 5 R2 sessions · live online progress</p>
        <h1>Marco R2 · Missed-Word Mastery</h1>
      </div>
      <nav aria-label="Main navigation">
        <button class="${view === "practice" ? "active" : ""}" data-view="practice">Practice</button>
        <button class="${view === "results" ? "active" : ""}" data-view="results">Results</button>
        <button data-action="hub">Hub</button>
      </nav>
    </header>`;
}

function sessionPickerMarkup() {
  return `
    <section class="session-picker" aria-label="Choose an R2 practice session">
      ${questionBank.sessions
        .map((meta) => {
          const item = progress.sessions[String(meta.number)];
          return `
            <button
              class="${progress.selectedSession === meta.number ? "selected" : ""} ${item.completed ? "mastered" : ""}"
              data-session="${meta.number}"
            >
              <span>R2 Session ${meta.number}</span>
              <strong>${escapeHtml(meta.range)}</strong>
              <small>${sessionStatus(item)}</small>
            </button>`;
        })
        .join("")}
    </section>`;
}

function practiceMarkup() {
  const session = selectedProgress();
  const meta = selectedSessionMeta();
  return `
    ${sessionPickerMarkup()}
    ${syncNoteMarkup()}
    ${notice ? `<div class="notice" role="status">${escapeHtml(notice)}</div>` : ""}
    ${resultMessage ? `<div class="result-banner" role="status">${escapeHtml(resultMessage)}</div>` : ""}
    ${session.round ? activeRoundMarkup(session, meta) : masteredMarkup(meta)}
  `;
}

function activeRoundMarkup(session, meta) {
  const round = session.round;
  const question = questionById.get(round.questionIds[round.position]);
  const selected = currentAnswer(progress);
  const locked = Boolean(selected);
  const correct = selected === question.answer;
  const answered = answeredCount(session);
  const correctIndex = letters.indexOf(question.answer);
  const correctWord = question.options[correctIndex];

  const numberGrid = round.questionIds
    .map((id, index) => {
      const item = questionById.get(id);
      const picked = round.answers[String(id)];
      const state = picked
        ? picked === item.answer
          ? "answered-correct"
          : "answered-wrong"
        : "";
      return `<span class="${state} ${round.position === index ? "current" : ""}">${index + 1}</span>`;
    })
    .join("");

  const options = question.options
    .map((option, index) => {
      const letter = letters[index];
      const correctOption = locked && letter === question.answer;
      const wrongOption =
        locked && letter === selected && letter !== question.answer;
      const other = locked && !correctOption && !wrongOption;
      return `
        <button
          data-letter="${letter}"
          ${locked ? "disabled" : ""}
          class="${correctOption ? "correct-option" : ""} ${wrongOption ? "wrong-option" : ""} ${other ? "locked-other" : ""}"
        >
          <span>${letter}</span>
          <b>${escapeHtml(option)}</b>
        </button>`;
    })
    .join("");

  return `
    <section class="practice-card">
      <aside class="round-panel">
        <div class="round-heading">
          <span>R2 Session ${meta.number}</span>
          <small>${escapeHtml(meta.range)}</small>
        </div>
        <div class="round-subheading">
          <strong>Round ${round.roundNumber}</strong>
          <span>${round.roundNumber === 2 ? "Round 1 misses" : "Missed words only"}</span>
        </div>
        <div class="stats">
          <div><strong>${answered}</strong><span>answered</span></div>
          <div><strong>${round.questionIds.length - answered}</strong><span>remaining</span></div>
        </div>
        <p class="grid-label">One-way progress</p>
        <div class="number-grid" aria-label="Question progress">${numberGrid}</div>
        <p class="locked-note">Answered questions cannot be reopened or changed.</p>
      </aside>

      <div class="question-panel">
        <div class="question-topline">
          <strong><b>${round.position + 1}</b>/${round.questionIds.length}</strong>
          <div class="progress"><span style="width:${((round.position + 1) / round.questionIds.length) * 100}%"></span></div>
          <small>R1 #${question.originalId}</small>
        </div>
        <div class="chips">
          <span>R2 Session ${meta.number}</span>
          <span>Missed in R1 · Original Session ${question.originalSession}</span>
        </div>
        <p class="prompt-label">Choose the matching word</p>
        <h2>${escapeHtml(question.prompt)}</h2>
        <div class="options">${options}</div>

        ${locked
          ? `<div class="instant-feedback ${correct ? "correct" : "wrong"}" role="status">
              <div class="feedback-mark">${correct ? "✓" : "×"}</div>
              <div>
                <strong>${correct ? "Correct!" : "Not quite."}</strong>
                <span>${
                  correct
                    ? `${escapeHtml(correctWord)} is the right answer.`
                    : `The correct answer is ${question.answer}. ${escapeHtml(correctWord)}.`
                }</span>
                <small>Answer locked — it cannot be changed.</small>
              </div>
            </div>`
          : ""}

        <div class="question-footer one-way">
          <span>${locked ? "Answer locked and uploading online." : "Choose one answer to continue."}</span>
          <button class="next-action" data-action="next" ${locked ? "" : "disabled"}>
            ${round.position === round.questionIds.length - 1 ? "Finish round" : "Next question →"}
          </button>
        </div>
      </div>
    </section>`;
}

function masteredMarkup(meta) {
  return `
    <section class="complete-card">
      <div>
        <div class="checkmark">✓</div>
        <h2>R2 Session ${meta.number} mastered</h2>
        <p>Every Round 1 miss in ${escapeHtml(meta.range)} has now been answered correctly. Finished rounds are saved online and visible from every device.</p>
        <div class="complete-actions">
          ${
            meta.number < questionBank.sessions.length
              ? `<button data-session="${meta.number + 1}">Continue to R2 Session ${meta.number + 1}</button>`
              : ""
          }
          <button class="secondary" data-view="results">View results</button>
          <button class="secondary" data-action="restart-session">Practice this session again</button>
        </div>
      </div>
    </section>`;
}

function resultRecords() {
  if (onlineResults.length) {
    return onlineResults.map((record) => {
      const meta = questionBank.sessions.find(
        (item) => item.number === Number(record.wordSession),
      );
      return {
        ...record,
        sessionNumber: Number(record.wordSession),
        sessionRange: meta?.range || "",
      };
    });
  }
  return questionBank.sessions.flatMap((meta) =>
    progress.sessions[String(meta.number)].history.map((record) => ({
      ...record,
      sessionNumber: meta.number,
      sessionRange: meta.range,
    })),
  );
}

function resultsMarkup() {
  const finishedRounds = resultRecords();
  return `
    <section class="results-card">
      <div class="results-heading">
        <div>
          <p class="eyebrow">Online record · all devices</p>
          <h2>Marco R2 Results</h2>
          <p>Every locked answer uploads from the iPad. This screen refreshes automatically every five seconds.</p>
        </div>
        <button data-action="refresh-online" ${refreshInFlight ? "disabled" : ""}>
          ${refreshInFlight ? "Refreshing…" : "Refresh now"}
        </button>
      </div>

      ${syncNoteMarkup()}

      <div class="live-progress-heading">
        <div><strong>Live R2 progress</strong><span>Updated online after every locked answer</span></div>
      </div>
      <div class="live-progress-grid">
        ${questionBank.sessions
          .map((meta) => {
            const item = progress.sessions[String(meta.number)];
            return `
              <article class="${item.completed ? "complete" : ""}">
                <span>R2 Session ${meta.number}</span>
                <strong>${item.completed ? "Mastered" : sessionStatus(item)}</strong>
                <small>${escapeHtml(meta.range)}${item.started ? ` · ${formatDate(item.updatedAt)}` : " · Not started"}</small>
              </article>`;
          })
          .join("")}
      </div>

      <div class="finished-heading"><strong>Finished rounds</strong><span>Scores and locked-answer review</span></div>
      ${
        finishedRounds.length === 0
          ? '<div class="empty-results compact"><strong>No finished rounds yet.</strong><span>Partial iPad progress is shown above.</span></div>'
          : finishedRoundsMarkup(finishedRounds)
      }
    </section>`;
}

function finishedRoundsMarkup(records) {
  const groups = new Map();
  for (const record of records) {
    const group = groups.get(record.sessionNumber) || [];
    group.push(record);
    groups.set(record.sessionNumber, group);
  }

  return `<div class="session-list">${[...groups]
    .map(([sessionNumber, items]) => {
      const first = items[0];
      return `
        <article class="session-card">
          <div class="session-title">
            <div>
              <strong>R2 Session ${sessionNumber} · ${escapeHtml(first.sessionRange)}</strong>
              <span>${items.length} finished round${items.length === 1 ? "" : "s"}</span>
            </div>
          </div>
          <div class="round-list">
            ${items
              .sort((a, b) => a.roundNumber - b.roundNumber)
              .map((item) => roundResultMarkup(item))
              .join("")}
          </div>
        </article>`;
    })
    .join("")}</div>`;
}

function roundResultMarkup(record) {
  const answers = record.questionIds
    .map((id) => {
      const question = questionById.get(id);
      const chosen = record.answers[String(id)];
      const correct = chosen === question.answer;
      const correctWord = question.options[letters.indexOf(question.answer)];
      return `
        <div class="${correct ? "correct" : "wrong"}">
          <span>#${question.originalId}</span>
          <p>${escapeHtml(question.prompt)}</p>
          <p><small>Answer</small><strong>${chosen}</strong></p>
          <p><small>Correct</small><strong>${question.answer}. ${escapeHtml(correctWord)}</strong></p>
        </div>`;
    })
    .join("");

  return `
    <details>
      <summary>
        <span class="round-number">${record.roundNumber}</span>
        <span><strong>Round ${record.roundNumber}</strong><small>${formatDate(record.finishedAt)}</small></span>
        <span class="score"><strong>${record.correctCount}/${record.questionIds.length}</strong><small>correct</small></span>
        <span class="missed"><strong>${record.wrongIds.length}</strong><small>missed</small></span>
      </summary>
      <div class="answer-review">${answers}</div>
    </details>`;
}

function render() {
  root.innerHTML = `
    <main class="site-shell">
      ${headerMarkup()}
      ${view === "practice" ? practiceMarkup() : resultsMarkup()}
    </main>`;
  bindActions();
}

function bindActions() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      notice = "";
      render();
      if (view === "results") void refreshOnline({ quiet: true });
    });
  });

  document.querySelectorAll("[data-session]").forEach((button) => {
    button.addEventListener("click", () => {
      const sessionNumber = Number(button.dataset.session);
      progress = activateSession(
        progress,
        sessionNumber,
        questionBank.sessions,
        questionBank.questions,
        questionBank.initialRound,
      );
      saveProgress();
      view = "practice";
      notice = "";
      resultMessage = "";
      render();
      void syncSession(sessionNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-letter]").forEach((button) => {
    button.addEventListener("click", () => chooseAnswer(button.dataset.letter));
  });

  document
    .querySelector('[data-action="next"]')
    ?.addEventListener("click", goForward);
  document
    .querySelector('[data-action="restart-session"]')
    ?.addEventListener("click", restartSelected);
  document
    .querySelector('[data-action="refresh-online"]')
    ?.addEventListener("click", () => refreshOnline());
  document.querySelector('[data-action="hub"]')?.addEventListener("click", () => {
    window.location.href = "../";
  });
}

function chooseAnswer(letter) {
  const session = selectedProgress();
  const round = session.round;
  if (!round || currentAnswer(progress)) return;
  const question = questionById.get(round.questionIds[round.position]);
  if (!letters.includes(letter)) return;
  const sessionNumber = progress.selectedSession;
  progress = recordAnswer(progress, question.id, letter);
  saveProgress();
  notice = "";
  render();
  void syncSession(sessionNumber);
}

function goForward() {
  const before = selectedProgress();
  const round = before.round;
  if (!round || !currentAnswer(progress)) return;
  const sessionNumber = progress.selectedSession;
  const attemptId = before.attemptId;
  const finishedRound = structuredClone(round);
  const finishing = round.position === round.questionIds.length - 1;
  progress = advanceQuestion(progress, answerKey);
  const after = selectedProgress();

  if (finishing) {
    const result = after.history.at(-1);
    resultMessage = after.completed
      ? `R2 Session ${sessionNumber} is mastered. Round ${result.roundNumber}: ${result.correctCount}/${result.questionIds.length} correct.`
      : `R2 Session ${sessionNumber}, Round ${result.roundNumber}: ${result.correctCount}/${result.questionIds.length} correct. Round ${result.roundNumber + 1} contains only the ${result.wrongIds.length} missed word${result.wrongIds.length === 1 ? "" : "s"}.`;
  }

  saveProgress();
  render();
  void syncSession(sessionNumber);
  if (finishing) {
    void saveFinishedRound(sessionNumber, attemptId, finishedRound);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function restartSelected() {
  const sessionNumber = progress.selectedSession;
  progress = restartSession(
    progress,
    sessionNumber,
    questionBank.sessions,
    questionBank.questions,
    questionBank.initialRound,
  );
  saveProgress();
  notice =
    "A new R2 attempt started. Earlier online results remain in Results.";
  resultMessage = "";
  render();
  void syncSession(sessionNumber);
}

window.addEventListener("keydown", (event) => {
  if (view !== "practice") return;
  const session = selectedProgress();
  const round = session.round;
  if (!round) return;
  const locked = Boolean(currentAnswer(progress));

  if (locked && event.key === "Enter") {
    event.preventDefault();
    goForward();
    return;
  }

  if (!locked && ["1", "2", "3", "4"].includes(event.key)) {
    event.preventDefault();
    chooseAnswer(letters[Number(event.key) - 1]);
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    void refreshOnline({ quiet: true });
  }
});

setInterval(() => {
  if (document.visibilityState === "visible") {
    void refreshOnline({ quiet: true });
  }
}, POLL_INTERVAL_MS);

render();
void refreshOnline({ initial: true });
