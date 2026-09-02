(function () {
  "use strict";

  const WORDS = Array.isArray(window.MARCO_R2_WORDS) ? window.MARCO_R2_WORDS : [];
  const WORD_BY_ID = new Map(WORDS.map((item) => [item.id, item]));
  const ART = window.MARCO_R2_ART && typeof window.MARCO_R2_ART === "object"
    ? window.MARCO_R2_ART
    : { atlases: [], images: [] };
  const ART_BY_ID = new Map(ART.images.map((item) => [item.id, item]));
  const ATLAS_BY_FILE = new Map(ART.atlases.map((item) => [item.file, item]));
  const COMBINED_SESSION = 14;
  const LEGACY_LAST_SESSION = 19;
  const PROGRESS_LAYOUT_VERSION = 2;
  const displaySession = (item) => {
    const number = Number(item.session);
    return number >= COMBINED_SESSION && number <= LEGACY_LAST_SESSION
      ? COMBINED_SESSION
      : number;
  };
  const SESSION_NUMBERS = [...new Set(ART.images.map(displaySession))]
    .filter(Number.isInteger)
    .sort((left, right) => left - right);
  const WORDS_BY_SESSION = new Map(SESSION_NUMBERS.map((number) => {
    const words = ART.images
      .filter((item) => displaySession(item) === number)
      .sort((left, right) => Number(left.session) - Number(right.session)
        || Number(left.position) - Number(right.position))
      .map((item) => WORD_BY_ID.get(item.id))
      .filter(Boolean);
    return [number, words];
  }));
  const SESSION_COUNT = SESSION_NUMBERS.length;
  const MAX_SESSION_SIZE = 50;
  const STORAGE_KEY = "marco-round2-vocabulary-660-v1";
  const SYNC_APP_ID = "marco-round2-vocabulary-660";

  const workspace = document.querySelector("#workspace");
  const sessionsEl = document.querySelector("#sessions");
  const roundsEl = document.querySelector("#rounds");
  const progressBar = document.querySelector("#progress-bar");
  const progressLabel = document.querySelector("#progress-label");
  const progressNumber = document.querySelector("#progress-number");
  const startTest = document.querySelector("#start-test");
  const learnPanel = document.querySelector("#learn-panel");
  const progressPanel = document.querySelector("#progress-panel");
  const viewTabs = document.querySelector(".view-tabs");
  const progressTabTotal = document.querySelector("#progress-tab-total");
  const recordContent = document.querySelector("#record-content");
  const toast = document.querySelector("#toast");

  let onlineSync = null;
  const artworkLoads = new Map();
  const state = {
    phase: "review",
    session: 1,
    round: 1,
    known: new Set(),
    reviewKnown: new Set(),
    questions: [],
    answers: {},
    summaryRound: null,
    progress: { version: 1, layoutVersion: PROGRESS_LAYOUT_VERSION, activeSession: 1, sessions: {}, activity: [] },
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
    return WORDS_BY_SESSION.get(Number(number)) || [];
  }

  function currentWords() {
    return wordsForSession(state.session);
  }

  function validKnown(number, values) {
    const valid = new Set(wordsForSession(number).map((item) => item.id));
    return (Array.isArray(values) ? values : []).filter((id) => valid.has(id));
  }

  function sessionActivity(progress, number) {
    return progress.activity.filter((entry) => displaySession(entry) === Number(number));
  }

  function testedKnownFromActivity(progress, number) {
    const valid = new Set(wordsForSession(number).map((item) => item.id));
    const known = new Set();
    for (const entry of sessionActivity(progress, number)) {
      if (!valid.has(entry.wordId)) continue;
      if (entry.correct) known.add(entry.wordId);
      else known.delete(entry.wordId);
    }
    return Array.from(known);
  }

  function storedTestedKnown(number, stored, progress = state.progress) {
    if (Array.isArray(stored?.testedKnown)) return validKnown(number, stored.testedKnown);
    return testedKnownFromActivity(progress, number);
  }

  function defaultProgress() {
    return { version: 1, layoutVersion: PROGRESS_LAYOUT_VERSION, activeSession: 1, sessions: {}, activity: [] };
  }

  function validateProgress(value) {
    return Boolean(value && value.version === 1 && value.sessions && typeof value.sessions === "object" && Array.isArray(value.activity));
  }

  function migrateProgressLayout(progress) {
    const hasLegacySessions = Array.from(
      { length: LEGACY_LAST_SESSION - COMBINED_SESSION },
      (_, index) => String(COMBINED_SESSION + index + 1),
    ).some((key) => Object.hasOwn(progress.sessions, key));
    if (progress.layoutVersion === PROGRESS_LAYOUT_VERSION && !hasLegacySessions) return progress;

    const entries = Array.from(
      { length: LEGACY_LAST_SESSION - COMBINED_SESSION + 1 },
      (_, index) => progress.sessions[String(COMBINED_SESSION + index)],
    ).filter((entry) => entry && typeof entry === "object");
    if (entries.length) {
      const reviewKnown = validKnown(COMBINED_SESSION, entries.flatMap((entry) => entry.reviewKnown || entry.known || []));
      const matchingActivity = sessionActivity(progress, COMBINED_SESSION);
      const explicitTested = validKnown(COMBINED_SESSION, entries.flatMap((entry) => entry.testedKnown || []));
      const testedKnown = matchingActivity.length
        ? testedKnownFromActivity(progress, COMBINED_SESSION)
        : explicitTested;
      const validDates = (field) => entries.map((entry) => entry[field])
        .filter((value) => value && !Number.isNaN(new Date(value).getTime()))
        .sort((left, right) => new Date(left) - new Date(right));
      const startedDates = validDates("startedAt");
      const studiedDates = validDates("lastStudiedAt");
      const completedDates = validDates("completedAt");
      const complete = testedKnown.length === wordsForSession(COMBINED_SESSION).length;
      progress.sessions[String(COMBINED_SESSION)] = {
        known: testedKnown,
        testedKnown,
        reviewKnown,
        round: Math.max(1, ...entries.map((entry) => Number(entry.round) || 1)),
        startedAt: startedDates[0] || null,
        lastStudiedAt: studiedDates.at(-1) || null,
        completedAt: complete ? (completedDates.at(-1) || studiedDates.at(-1) || null) : null,
      };
    }
    for (let number = COMBINED_SESSION + 1; number <= LEGACY_LAST_SESSION; number += 1) {
      delete progress.sessions[String(number)];
    }
    progress.activity = progress.activity.map((entry) => {
      const number = Number(entry.session);
      return number >= COMBINED_SESSION && number <= LEGACY_LAST_SESSION
        ? { ...entry, session: COMBINED_SESSION }
        : entry;
    });
    progress.activeSession = Math.min(COMBINED_SESSION, Math.max(1, Number(progress.activeSession) || 1));
    progress.layoutVersion = PROGRESS_LAYOUT_VERSION;
    return progress;
  }

  function restoreProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      state.progress = validateProgress(saved) ? migrateProgressLayout(saved) : defaultProgress();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
    } catch (_) {
      state.progress = defaultProgress();
    }
    loadSession(state.progress.activeSession || 1);
  }

  function loadSession(number) {
    state.session = Math.min(SESSION_COUNT, Math.max(1, Number(number) || 1));
    const stored = state.progress.sessions[String(state.session)] || {};
    state.known = new Set(storedTestedKnown(state.session, stored));
    state.reviewKnown = new Set(validKnown(state.session, stored.reviewKnown || stored.known));
    state.round = Math.max(1, Number(stored.round) || 1);
    const roundOneAnswers = new Set(sessionActivity(state.progress, state.session)
      .filter((entry) => Number(entry.round) === 1)
      .map((entry) => entry.wordId)).size;
    if (state.round === 1 && roundOneAnswers === currentWords().length && state.known.size < currentWords().length) {
      state.round = 2;
    }
    state.phase = state.known.size === currentWords().length ? "complete" : "review";
    state.questions = [];
    state.answers = {};
    state.summaryRound = null;
  }

  function persist(pushOnline = true) {
    const now = new Date().toISOString();
    const key = String(state.session);
    const prior = state.progress.sessions[key] || {};
    const complete = state.known.size === currentWords().length;
    state.progress.version = 1;
    state.progress.layoutVersion = PROGRESS_LAYOUT_VERSION;
    state.progress.activeSession = state.session;
    state.progress.sessions[key] = {
      known: Array.from(state.known),
      testedKnown: Array.from(state.known),
      reviewKnown: Array.from(state.reviewKnown),
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
    const stored = state.progress.sessions[String(number)] || {};
    return storedTestedKnown(number, stored).length;
  }

  function totalKnownCount() {
    let total = 0;
    for (const number of SESSION_NUMBERS) total += sessionKnownCount(number);
    return total;
  }

  function formatDate(value) {
    if (!value) return "Not started";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not started";
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
  }

  function illustrationMarkup(item, extraClass = "") {
    const art = ART_BY_ID.get(item.id);
    const atlas = art ? ATLAS_BY_FILE.get(art.atlas) : null;
    if (!art || !atlas) {
      return `<div class="word-art ${extraClass}" role="img" aria-label="Illustration unavailable for ${escapeHtml(item.word)}"><span class="art-fallback visible" aria-hidden="true">${item.icon}</span></div>`;
    }
    const [left, top, width, height] = art.viewport.map(Number);
    const isPortrait = height > width;
    const source = `./illustrations/${art.atlas}?v=20260901-1`;
    const viewBox = `${left} ${top} ${width} ${height}`;
    return `<div class="word-art ${isPortrait ? "portrait-art" : ""} ${extraClass}" style="--panel-ratio:${width} / ${height}" data-art data-art-source="${source}" role="img" aria-label="Illustration for ${escapeHtml(item.word)}"><span class="art-fallback" aria-hidden="true">${item.icon}</span><svg class="word-illustration" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><image href="${source}" width="${Number(atlas.width)}" height="${Number(atlas.height)}" preserveAspectRatio="none"></image></svg></div>`;
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
    for (let number = 1; number <= Math.max(3, state.round, state.summaryRound || 1); number += 1) {
      let status = number < state.round || (state.phase === "complete" && number === state.round) ? "done" : "";
      if (state.phase === "test" && number === state.round) status = "active";
      if (state.phase === "summary" && number === state.summaryRound) status = "done";
      steps.push({ label: `Round ${number}`, status });
    }
    roundsEl.innerHTML = steps.map((step) => `<span class="step ${step.status}">${step.label}</span>`).join("");
  }

  function updateChrome() {
    const total = currentWords().length || MAX_SESSION_SIZE;
    const known = state.known.size;
    progressLabel.textContent = `Session ${state.session} progress`;
    progressNumber.textContent = `${known} / ${total} known`;
    progressBar.style.width = `${(known / total) * 100}%`;
    progressTabTotal.textContent = `${totalKnownCount()} / ${WORDS.length}`;
    const testCount = state.round === 1 ? total : total - known;
    startTest.hidden = state.phase !== "review" || testCount === 0;
    startTest.textContent = `Start Round ${state.round} · ${testCount} word${testCount === 1 ? "" : "s"}`;
    renderSessionTabs();
    renderSteps();
  }

  function renderRecord() {
    const activity = state.progress.activity;
    const correct = activity.filter((entry) => entry.correct).length;
    const latest = activity.at(-1);
    const stats = `<div class="record-stats">
      <div class="record-stat"><span>TOTAL KNOWN</span><strong>${totalKnownCount()} / ${WORDS.length}</strong></div>
      <div class="record-stat"><span>TEST ANSWERS</span><strong>${activity.length}</strong></div>
      <div class="record-stat"><span>CORRECT</span><strong>${correct}</strong></div>
      <div class="record-stat"><span>LAST ANSWER</span><strong>${latest ? formatDate(latest.answeredAt) : "Not started"}</strong></div>
    </div>`;
    const sessions = SESSION_NUMBERS.map((number) => {
      const total = wordsForSession(number).length;
      const stored = state.progress.sessions[String(number)] || {};
      const sessionActivity = activity.filter((entry) => Number(entry.session) === number);
      const latestRound = Math.max(0, ...sessionActivity.map((entry) => Number(entry.round) || 0));
      const roundCount = Math.max(3, latestRound);
      const rounds = Array.from({ length: roundCount }, (_, index) => {
        const round = index + 1;
        const latestByWord = new Map();
        sessionActivity.filter((entry) => Number(entry.round) === round)
          .forEach((entry) => latestByWord.set(entry.wordId, entry));
        const answers = Array.from(latestByWord.values());
        const wrong = answers.filter((entry) => !entry.correct).length;
        const value = answers.length ? `${wrong} wrong` : "Not taken";
        const status = answers.length && wrong === 0 ? " perfect" : "";
        return `<div class="round-record${status}"><span>Round ${round}</span><strong>${value}</strong><small>${answers.length ? `${answers.length} tested` : "Only prior misses"}</small></div>`;
      }).join("");
      return `<article class="session-progress"><div class="session-progress-head"><div><b>SESSION ${number}</b><strong>${sessionKnownCount(number)} / ${total} mastered</strong></div><small>${formatDate(stored.lastStudiedAt)}</small></div><div class="round-records">${rounds}</div></article>`;
    }).join("");
    recordContent.innerHTML = `${stats}<div class="session-progress-list">${sessions}</div>`;
  }

  function setView(view, updateHash = true) {
    const showProgress = view === "progress";
    learnPanel.hidden = showProgress;
    progressPanel.hidden = !showProgress;
    viewTabs.querySelectorAll("[data-view]").forEach((button) => {
      const active = button.dataset.view === (showProgress ? "progress" : "learn");
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    if (showProgress) renderRecord();
    if (updateHash) history.replaceState(null, "", showProgress ? "#progress" : location.pathname + location.search);
  }

  function wordCard(item) {
    const known = state.reviewKnown.has(item.id);
    const sourceNote = item.sourceRecordId
      ? `MARCO R2 · SOURCE #${item.sourceRecordId}`
      : `SOURCE S${item.originSession} · R${item.originRound}`;
    return `<article class="word-card ${known ? "is-known" : ""}" data-card="${escapeHtml(item.id)}">
      ${illustrationMarkup(item)}
      <div class="word-copy">
        <div class="word-title"><h3>${escapeHtml(item.word)}</h3><button class="speak" data-speak="${escapeHtml(item.id)}" type="button" aria-label="Hear ${escapeHtml(item.word)} pronounced">🔊</button></div>
        <p class="meaning"><strong>${escapeHtml(item.partOfSpeech)}</strong> · ${escapeHtml(item.meaning)}</p>
        <p class="example">“${escapeHtml(item.example)}”</p>
        <div class="word-meta"><small>${escapeHtml(sourceNote)}</small><button class="known-toggle" data-known="${escapeHtml(item.id)}" aria-pressed="${known}" type="button">${known ? "✓ Known" : "Unknown · keep"}</button></div>
      </div>
    </article>`;
  }

  function renderReview() {
    const items = currentWords();
    const reviewUnknown = items.length - state.reviewKnown.size;
    const testCount = state.round === 1 ? items.length : items.length - state.known.size;
    const roundNote = state.round === 1
      ? `Round 1 tests all ${items.length} words, including words marked Known during review.`
      : `Round ${state.round} tests only the ${testCount} word${testCount === 1 ? "" : "s"} missed in Round ${state.round - 1}.`;
    workspace.innerHTML = `<div class="workspace-head"><div><p class="mini-label">SESSION ${state.session} · REVIEW</p><h2>See all ${items.length} words before testing.</h2><p>${roundNote}</p></div><div class="review-actions"><span class="review-count">${reviewUnknown} marked unknown</span><button class="primary compact" id="review-test" type="button" ${testCount ? "" : "disabled"}>Start Round ${state.round}</button></div></div>
      <div class="review-grid">${items.map(wordCard).join("")}</div>
      <div class="review-footer"><button class="primary" id="review-test-bottom" type="button" ${testCount ? "" : "disabled"}>Start Round ${state.round} · ${testCount} word${testCount === 1 ? "" : "s"}</button></div>`;
    document.querySelectorAll("[data-speak]").forEach((button) => button.addEventListener("click", () => speak(WORD_BY_ID.get(button.dataset.speak).word)));
    document.querySelectorAll("[data-known]").forEach((button) => button.addEventListener("click", () => toggleKnown(button.dataset.known)));
    document.querySelector("#review-test").addEventListener("click", beginRound);
    document.querySelector("#review-test-bottom").addEventListener("click", beginRound);
    markLoadedImages();
  }

  function toggleKnown(wordId) {
    if (state.reviewKnown.has(wordId)) state.reviewKnown.delete(wordId);
    else state.reviewKnown.add(wordId);
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
    const remaining = (state.round === 1
      ? currentWords()
      : currentWords().filter((item) => !state.known.has(item.id)))
      .map((item) => item.id);
    if (!remaining.length) {
      state.phase = "complete";
      persist();
      return render();
    }
    state.phase = "test";
    state.summaryRound = null;
    state.questions = shuffle(remaining).map(makeQuestion);
    state.answers = {};
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
    if (correct) {
      state.known.add(target.id);
      state.reviewKnown.add(target.id);
    } else {
      state.known.delete(target.id);
      state.reviewKnown.delete(target.id);
    }
    persist();
    render();
  }

  function finishRound() {
    if (Object.keys(state.answers).length !== state.questions.length) return;
    if (state.known.size === currentWords().length) {
      state.phase = "complete";
    } else {
      state.summaryRound = state.round;
      state.round += 1;
      state.phase = "summary";
    }
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
    const completedRound = state.summaryRound || Math.max(1, state.round - 1);
    const correct = state.questions.filter((question, index) => state.answers[index] === question.wordId).length;
    const missed = state.questions.length - correct;
    const remaining = currentWords().length - state.known.size;
    workspace.innerHTML = `<div class="center"><div><div class="seal">${completedRound}</div><h2>Round ${completedRound} complete.</h2><div class="score-row"><span>${correct} correct</span><span>${missed} wrong</span><span>${state.known.size} of ${currentWords().length} mastered</span></div><p>${remaining} word${remaining === 1 ? "" : "s"} will return in Round ${state.round}.</p><div class="center-actions"><button class="secondary" id="summary-review" type="button">Review all words</button><button class="primary" id="next-round" type="button">Start Round ${state.round}</button></div></div></div>`;
    document.querySelector("#summary-review").addEventListener("click", () => { state.phase = "review"; state.summaryRound = null; persist(); render(); });
    document.querySelector("#next-round").addEventListener("click", beginRound);
  }

  function renderComplete() {
    const allDone = totalKnownCount() === WORDS.length;
    const next = state.session < SESSION_COUNT ? `<button class="primary" id="next-session" type="button">Go to session ${state.session + 1}</button>` : "";
    workspace.innerHTML = `<div class="center"><div><div class="seal">✓</div><h2>${allDone ? `All ${WORDS.length} words mastered!` : `Session ${state.session} mastered!`}</h2><p>Marco answered every word in this ${currentWords().length}-word session correctly. Review it again anytime or continue forward.</p><div class="center-actions"><button class="secondary" id="review-complete" type="button">Review session</button>${next}</div></div></div>`;
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
  viewTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (button) setView(button.dataset.view);
  });
  viewTabs.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const view = event.key === "ArrowRight" ? "progress" : "learn";
    setView(view);
    viewTabs.querySelector(`[data-view="${view}"]`).focus();
  });
  window.addEventListener("hashchange", () => setView(location.hash === "#progress" ? "progress" : "learn", false));
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
    const expectedSizes = [
      ...Array.from({ length: 13 }, () => 50),
      224,
    ];
    const uniqueWordIds = new Set(WORDS.map((item) => item.id));
    const uniqueArtIds = new Set(ART.images.map((item) => item.id));
    const completeCoverage = WORDS.every((item) => ART_BY_ID.has(item.id))
      && ART.images.every((item) => WORD_BY_ID.has(item.id));
    const validSessions = SESSION_NUMBERS.every((number, index) => {
      return number === index + 1
        && wordsForSession(number).length === expectedSizes[index];
    });
    const validViewports = ART.images.every((item) => {
      const atlas = ATLAS_BY_FILE.get(item.atlas);
      const viewport = Array.isArray(item.viewport) ? item.viewport.map(Number) : [];
      if (!atlas || viewport.length !== 4 || viewport.some((value) => !Number.isFinite(value))) return false;
      const [left, top, width, height] = viewport;
      return left >= 0 && top >= 0 && width > 0 && height > 0
        && left + width <= Number(atlas.width)
        && top + height <= Number(atlas.height);
    });
    if (
      WORDS.length !== 874
      || ART.images.length !== 874
      || SESSION_COUNT !== 14
      || uniqueWordIds.size !== WORDS.length
      || uniqueArtIds.size !== ART.images.length
      || expectedSizes.length !== SESSION_COUNT
      || !completeCoverage
      || !validSessions
      || !validViewports
    ) throw new Error("The 874-word illustrated snapshot is incomplete.");
    restoreProgress();
    render();
    setView(location.hash === "#progress" ? "progress" : "learn", false);
    if (window.MarcoOnlineSync) {
      onlineSync = window.MarcoOnlineSync.create({
        appId: SYNC_APP_ID,
        studentName: "Marco",
        validate: validateProgress,
        score: (progress) => SESSION_NUMBERS.reduce((sum, number) => {
          const stored = progress.sessions?.[String(number)] || {};
          const known = Array.isArray(stored.testedKnown)
            ? validKnown(number, stored.testedKnown)
            : testedKnownFromActivity(progress, number);
          return sum + known.length;
        }, 0),
        onRemote: (remote) => {
          state.progress = migrateProgressLayout(remote);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
          loadSession(state.progress.activeSession || state.session);
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
