(function () {
  "use strict";

  const WORDS = Array.isArray(window.MARCO_R2_WORDS) ? window.MARCO_R2_WORDS : [];
  const WORD_BY_ID = new Map(WORDS.map((item) => [item.id, item]));
  const WORD_INDEX_BY_ID = new Map(WORDS.map((item, index) => [item.id, index]));
  const SESSION_SIZE = 50;
  const SESSION_COUNT = Math.ceil(WORDS.length / SESSION_SIZE);
  const STORAGE_KEY = "marco-round2-vocabulary-660-v1";
  const SYNC_APP_ID = "marco-round2-vocabulary-660";

  const workspace = document.querySelector("#workspace");
  const sessionsEl = document.querySelector("#sessions");
  const roundsEl = document.querySelector("#rounds");
  const progressBar = document.querySelector("#progress-bar");
  const progressLabel = document.querySelector("#progress-label");
  const progressNumber = document.querySelector("#progress-number");
  const startTest = document.querySelector("#start-test");
  const recordContent = document.querySelector("#record-content");
  const toast = document.querySelector("#toast");

  let onlineSync = null;
  const artworkLoads = new Map();
  const state = {
    phase: "review",
    session: 1,
    round: 1,
    known: new Set(),
    questions: [],
    answers: {},
    roundStartKnown: 0,
    progress: { version: 1, activeSession: 1, sessions: {}, activity: [] },
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[character]);
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function wordsForSession(number) {
    const start = (number - 1) * SESSION_SIZE;
    return WORDS.slice(start, start + SESSION_SIZE);
  }

  function currentWords() {
    return wordsForSession(state.session);
  }

  function validKnown(number, values) {
    const valid = new Set(wordsForSession(number).map((item) => item.id));
    return (Array.isArray(values) ? values : []).filter((id) => valid.has(id));
  }

  function defaultProgress() {
    return { version: 1, activeSession: 1, sessions: {}, activity: [] };
  }

  function validateProgress(value) {
    return Boolean(value && value.version === 1 && value.sessions && typeof value.sessions === "object" && Array.isArray(value.activity));
  }

  function restoreProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      state.progress = validateProgress(saved) ? saved : defaultProgress();
    } catch (_) {
      state.progress = defaultProgress();
    }
    loadSession(state.progress.activeSession || 1);
  }

  function loadSession(number) {
    state.session = Math.min(SESSION_COUNT, Math.max(1, Number(number) || 1));
    const stored = state.progress.sessions[String(state.session)] || {};
    state.known = new Set(validKnown(state.session, stored.known));
    state.round = Math.max(1, Number(stored.round) || 1);
    state.phase = state.known.size === currentWords().length ? "complete" : "review";
    state.questions = [];
    state.answers = {};
    state.roundStartKnown = state.known.size;
  }

  function persist(pushOnline = true) {
    const now = new Date().toISOString();
    const key = String(state.session);
    const prior = state.progress.sessions[key] || {};
    const complete = state.known.size === currentWords().length;
    state.progress.version = 1;
    state.progress.activeSession = state.session;
    state.progress.sessions[key] = {
      known: Array.from(state.known),
      round: state.round,
      startedAt: prior.startedAt || now,
      lastStudiedAt: now,
      completedAt: complete ? (prior.completedAt || now) : null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
    if (pushOnline) onlineSync?.push(state.progress);
  }

  function sessionKnownCount(number) {
    if (number === state.session) return state.known.size;
    return validKnown(number, state.progress.sessions[String(number)]?.known).length;
  }

  function totalKnownCount() {
    let total = 0;
    for (let number = 1; number <= SESSION_COUNT; number += 1) total += sessionKnownCount(number);
    return total;
  }

  function formatDate(value) {
    if (!value) return "Not started";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not started";
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
  }

  function illustrationMarkup(item, extraClass = "") {
    const globalIndex = WORD_INDEX_BY_ID.get(item.id);
    const session = Math.floor(globalIndex / SESSION_SIZE) + 1;
    const cell = globalIndex % SESSION_SIZE;
    const row = Math.floor(cell / 5);
    const column = cell % 5;
    const isPortrait = session === SESSION_COUNT;
    const cellWidth = 200;
    const cellHeight = isPortrait ? 300 : 150;
    const rows = isPortrait ? 2 : 10;
    const panelRatio = isPortrait ? "2 / 3" : "4 / 3";
    const source = `./illustrations/atlas/session-${String(session).padStart(2, "0")}.webp?v=20260831-3`;
    const viewBox = `${column * cellWidth} ${row * cellHeight} ${cellWidth} ${cellHeight}`;
    return `<div class="word-art ${isPortrait ? "portrait-art" : ""} ${extraClass}" style="--panel-ratio:${panelRatio}" data-art data-art-source="${source}" role="img" aria-label="Illustration for ${escapeHtml(item.word)}"><span class="art-fallback" aria-hidden="true">${item.icon}</span><svg class="word-illustration" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><image href="${source}" width="${cellWidth * 5}" height="${cellHeight * rows}" preserveAspectRatio="none"></image></svg></div>`;
  }

  function loadArtwork(source) {
    if (!artworkLoads.has(source)) {
      artworkLoads.set(source, new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", reject, { once: true });
        image.src = source;
        if (image.complete && image.naturalWidth > 0) resolve();
      }));
    }
    return artworkLoads.get(source);
  }

  function markLoadedImages() {
    document.querySelectorAll("[data-art]").forEach((art) => {
      const source = art.dataset.artSource;
      if (!source) return;
      loadArtwork(source).then(() => {
        if (art.isConnected) art.classList.add("has-image");
      }).catch(() => {});
    });
  }

  function renderSessionTabs() {
    sessionsEl.innerHTML = Array.from({ length: SESSION_COUNT }, (_, index) => {
      const number = index + 1;
      const total = wordsForSession(number).length;
      const known = sessionKnownCount(number);
      const classes = ["session-button"];
      if (known === total) classes.push("complete");
      if (number === state.session) classes.push("active");
      return `<button class="${classes.join(" ")}" data-session="${number}" type="button"><span>Session ${number}</span><small>${known} / ${total}</small></button>`;
    }).join("");
  }

  function renderSteps() {
    const steps = [{ label: "Review all", status: state.phase === "review" ? "active" : "done" }];
    for (let number = 1; number <= state.round; number += 1) {
      let status = number < state.round || state.phase === "complete" ? "done" : "";
      if ((state.phase === "test" || state.phase === "summary") && number === state.round) status = "active";
      steps.push({ label: `Round ${number}`, status });
    }
    roundsEl.innerHTML = steps.map((step) => `<span class="step ${step.status}">${step.label}</span>`).join("");
  }

  function updateChrome() {
    const total = currentWords().length || SESSION_SIZE;
    const known = state.known.size;
    progressLabel.textContent = `Session ${state.session} progress`;
    progressNumber.textContent = `${known} / ${total} known`;
    progressBar.style.width = `${(known / total) * 100}%`;
    startTest.hidden = state.phase !== "review" || known === total;
    startTest.textContent = `Test ${total - known} unknown word${total - known === 1 ? "" : "s"}`;
    renderSessionTabs();
    renderSteps();
  }

  function renderRecord() {
    const activity = state.progress.activity;
    const correct = activity.filter((entry) => entry.correct).length;
    const missed = activity.length - correct;
    const latest = activity.at(-1);
    const stats = `<div class="record-stats">
      <div class="record-stat"><span>TOTAL KNOWN</span><strong>${totalKnownCount()} / ${WORDS.length}</strong></div>
      <div class="record-stat"><span>TEST ANSWERS</span><strong>${activity.length}</strong></div>
      <div class="record-stat"><span>CORRECT</span><strong>${correct}</strong></div>
      <div class="record-stat"><span>LAST ANSWER</span><strong>${latest ? formatDate(latest.answeredAt) : "Not started"}</strong></div>
    </div>`;
    const sessions = Array.from({ length: SESSION_COUNT }, (_, index) => {
      const number = index + 1;
      const total = wordsForSession(number).length;
      const stored = state.progress.sessions[String(number)] || {};
      return `<div class="session-record"><b>SESSION ${number}</b><strong>${sessionKnownCount(number)} / ${total}</strong><small>${formatDate(stored.lastStudiedAt)}</small></div>`;
    }).join("");
    recordContent.innerHTML = `${stats}<div class="session-records">${sessions}</div>`;
  }

  function wordCard(item) {
    const known = state.known.has(item.id);
    return `<article class="word-card ${known ? "is-known" : ""}" data-card="${escapeHtml(item.id)}">
      ${illustrationMarkup(item)}
      <div class="word-copy">
        <div class="word-title"><h3>${escapeHtml(item.word)}</h3><button class="speak" data-speak="${escapeHtml(item.id)}" type="button" aria-label="Hear ${escapeHtml(item.word)} pronounced">🔊</button></div>
        <p class="meaning"><strong>${escapeHtml(item.partOfSpeech)}</strong> · ${escapeHtml(item.meaning)}</p>
        <p class="example">“${escapeHtml(item.example)}”</p>
        <div class="word-meta"><small>SOURCE S${item.originSession} · R${item.originRound}</small><button class="known-toggle" data-known="${escapeHtml(item.id)}" aria-pressed="${known}" type="button">${known ? "✓ Known" : "Unknown · keep"}</button></div>
      </div>
    </article>`;
  }

  function renderReview() {
    const items = currentWords();
    const unknown = items.length - state.known.size;
    workspace.innerHTML = `<div class="workspace-head"><div><p class="mini-label">SESSION ${state.session} · REVIEW</p><h2>See all ${items.length} words before testing.</h2><p>Every word starts Unknown. Tap the button only when Marco already knows it.</p></div><div class="review-actions"><span class="review-count">${unknown} unknown</span><button class="primary compact" id="review-test" type="button" ${unknown ? "" : "disabled"}>Start test</button></div></div>
      <div class="review-grid">${items.map(wordCard).join("")}</div>
      <div class="review-footer"><button class="primary" id="review-test-bottom" type="button" ${unknown ? "" : "disabled"}>Test ${unknown} unknown word${unknown === 1 ? "" : "s"}</button></div>`;
    document.querySelectorAll("[data-speak]").forEach((button) => button.addEventListener("click", () => speak(WORD_BY_ID.get(button.dataset.speak).word)));
    document.querySelectorAll("[data-known]").forEach((button) => button.addEventListener("click", () => toggleKnown(button.dataset.known)));
    document.querySelector("#review-test").addEventListener("click", beginRound);
    document.querySelector("#review-test-bottom").addEventListener("click", beginRound);
    markLoadedImages();
  }

  function toggleKnown(wordId) {
    if (state.known.has(wordId)) state.known.delete(wordId);
    else state.known.add(wordId);
    persist();
    render();
  }

  function speak(word) {
    if (!("speechSynthesis" in window)) return showToast("Pronunciation is not available in this browser.");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = .82;
    window.speechSynthesis.speak(utterance);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2600);
  }

  function makeQuestion(wordId) {
    const answer = WORD_BY_ID.get(wordId);
    const sameType = currentWords().filter((item) => item.id !== wordId && item.partOfSpeech === answer.partOfSpeech);
    const pool = sameType.length >= 3 ? sameType : currentWords().filter((item) => item.id !== wordId);
    return { wordId, options: shuffle([wordId, ...shuffle(pool).slice(0, 3).map((item) => item.id)]) };
  }

  function beginRound() {
    const remaining = currentWords().filter((item) => !state.known.has(item.id)).map((item) => item.id);
    if (!remaining.length) {
      state.phase = "complete";
      persist();
      return render();
    }
    state.phase = "test";
    state.questions = shuffle(remaining).map(makeQuestion);
    state.answers = {};
    state.roundStartKnown = state.known.size;
    persist();
    render();
    window.scrollTo({ top: workspace.offsetTop - 80, behavior: "smooth" });
  }

  function blankSentence(item) {
    const candidates = [item.word, item.word.split("/")[0], item.word.replace(/\s*\([^)]*\)/g, "")]
      .map((value) => value.trim()).sort((a, b) => b.length - a.length);
    let sentence = escapeHtml(item.example);
    for (const candidate of candidates) {
      const pattern = new RegExp(escapeRegExp(candidate), "i");
      if (pattern.test(sentence)) return sentence.replace(pattern, '<span class="blank">_____</span>');
    }
    return `${sentence} <span class="blank">_____</span>`;
  }

  function choose(questionIndex, optionId) {
    if (Object.hasOwn(state.answers, questionIndex)) return;
    const question = state.questions[questionIndex];
    const target = WORD_BY_ID.get(question.wordId);
    const selected = WORD_BY_ID.get(optionId);
    const correct = optionId === question.wordId;
    state.answers[questionIndex] = optionId;
    state.progress.activity.push({
      id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      session: state.session,
      round: state.round,
      wordId: target.id,
      word: target.word,
      selectedWord: selected.word,
      correct,
      answeredAt: new Date().toISOString(),
    });
    if (correct) state.known.add(target.id);
    persist();
    render();
  }

  function finishRound() {
    if (Object.keys(state.answers).length !== state.questions.length) return;
    state.phase = state.known.size === currentWords().length ? "complete" : "summary";
    persist();
    render();
  }

  function renderTest() {
    const answeredCount = Object.keys(state.answers).length;
    const questions = state.questions.map((question, questionIndex) => {
      const item = WORD_BY_ID.get(question.wordId);
      const answer = state.answers[questionIndex];
      const answered = answer !== undefined;
      const correct = answer === question.wordId;
      const choices = question.options.map((id, optionIndex) => {
        const option = WORD_BY_ID.get(id);
        const classes = ["choice"];
        if (answered && id === question.wordId) classes.push("correct");
        if (answered && id === answer && !correct) classes.push("wrong");
        return `<button class="${classes.join(" ")}" data-question-index="${questionIndex}" data-option="${escapeHtml(id)}" type="button" ${answered ? "disabled" : ""}><small>${optionIndex + 1}</small>${escapeHtml(option.word)}</button>`;
      }).join("");
      return `<section class="test-question" data-test-question="${questionIndex + 1}"><div class="question-number">Question ${questionIndex + 1}</div><div class="test-copy"><p class="mini-label">SIMPLE MEANING</p><p class="test-meaning">${escapeHtml(item.meaning)}</p><p class="sentence">${blankSentence(item)}</p><div class="choices">${choices}</div><div class="feedback ${answered ? (correct ? "good" : "try") : ""}" role="status">${answered ? (correct ? `✓ Correct — <strong>${escapeHtml(item.word)}</strong> is now known.` : `Not yet. The answer is <strong>${escapeHtml(item.word)}</strong>. It will return next round.`) : ""}</div></div></section>`;
    }).join("");
    workspace.innerHTML = `<div class="workspace-head"><div><p class="mini-label">SESSION ${state.session} · ROUND ${state.round}</p><h2>Answer all ${state.questions.length} questions on this page.</h2></div><span class="review-count">${answeredCount} of ${state.questions.length} answered</span></div>
      <div class="test-list">${questions}</div>
      <div class="test-actions"><button class="secondary" id="back-review" type="button">Review all words</button><button class="primary" id="finish-round" type="button" ${answeredCount === state.questions.length ? "" : "disabled"}>Finish round · ${answeredCount}/${state.questions.length}</button></div>`;
    document.querySelectorAll("[data-option]").forEach((button) => button.addEventListener("click", () => choose(Number(button.dataset.questionIndex), button.dataset.option)));
    document.querySelector("#back-review").addEventListener("click", () => { state.phase = "review"; render(); });
    document.querySelector("#finish-round").addEventListener("click", finishRound);
  }

  function renderSummary() {
    const learned = state.known.size - state.roundStartKnown;
    const remaining = currentWords().length - state.known.size;
    workspace.innerHTML = `<div class="center"><div><div class="seal">${state.round}</div><h2>Round ${state.round} complete.</h2><div class="score-row"><span>${learned} learned this round</span><span>${state.known.size} of ${currentWords().length} known</span></div><p>${remaining} word${remaining === 1 ? "" : "s"} will return in the next round.</p><div class="center-actions"><button class="secondary" id="summary-review" type="button">Review all words</button><button class="primary" id="next-round" type="button">Start round ${state.round + 1}</button></div></div></div>`;
    document.querySelector("#summary-review").addEventListener("click", () => { state.phase = "review"; render(); });
    document.querySelector("#next-round").addEventListener("click", () => { state.round += 1; beginRound(); });
  }

  function renderComplete() {
    const allDone = totalKnownCount() === WORDS.length;
    const next = state.session < SESSION_COUNT ? `<button class="primary" id="next-session" type="button">Go to session ${state.session + 1}</button>` : "";
    workspace.innerHTML = `<div class="center"><div><div class="seal">✓</div><h2>${allDone ? "All 660 words mastered!" : `Session ${state.session} mastered!`}</h2><p>Every word in this ${currentWords().length}-word session is now marked Known. Review it again anytime or continue forward.</p><div class="center-actions"><button class="secondary" id="review-complete" type="button">Review session</button>${next}</div></div></div>`;
    document.querySelector("#review-complete").addEventListener("click", () => { state.phase = "review"; render(); });
    document.querySelector("#next-session")?.addEventListener("click", () => changeSession(state.session + 1));
  }

  function changeSession(number) {
    persist();
    loadSession(number);
    persist();
    render();
    window.scrollTo({ top: sessionsEl.offsetTop - 80, behavior: "smooth" });
  }

  function render() {
    updateChrome();
    renderRecord();
    if (state.phase === "review") renderReview();
    else if (state.phase === "test") renderTest();
    else if (state.phase === "summary") renderSummary();
    else renderComplete();
  }

  startTest.addEventListener("click", beginRound);
  sessionsEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-session]");
    if (button) changeSession(Number(button.dataset.session));
  });
  document.addEventListener("keydown", (event) => {
    if (state.phase !== "test") return;
    const number = Number(event.key);
    const nextIndex = state.questions.findIndex((_, index) => !Object.hasOwn(state.answers, index));
    if (nextIndex >= 0 && number >= 1 && number <= 4) choose(nextIndex, state.questions[nextIndex].options[number - 1]);
  });

  function initialize() {
    if (WORDS.length !== 660 || SESSION_COUNT !== 14) throw new Error("The 660-word snapshot is incomplete.");
    restoreProgress();
    render();
    if (window.MarcoOnlineSync) {
      onlineSync = window.MarcoOnlineSync.create({
        appId: SYNC_APP_ID,
        studentName: "Marco",
        validate: validateProgress,
        score: (progress) => Object.values(progress.sessions || {}).reduce((sum, item) => sum + (Array.isArray(item.known) ? item.known.length : 0), 0),
        onRemote: (remote) => {
          state.progress = remote;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          loadSession(remote.activeSession || state.session);
          render();
        },
      });
      void onlineSync.start(state.progress);
    }
  }

  try {
    initialize();
  } catch (error) {
    console.error(error);
    startTest.hidden = true;
    sessionsEl.hidden = true;
    roundsEl.hidden = true;
    workspace.innerHTML = '<div class="center"><div><div class="seal">!</div><h2>Words could not load</h2><p>Please refresh and try again.</p></div></div>';
  }
})();
