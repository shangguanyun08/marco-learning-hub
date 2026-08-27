(function () {
  "use strict";

  const TESTS = window.STAR_MATH_TESTS || [];
  const STORAGE_KEY = "harry-star-math-sessions-v1";
  const APP_ID = "harry-star-math-sessions-v1";
  const letters = ["A", "B", "C", "D"];
  let sync = null;
  let state = readState();

  function emptyState() {
    return { version: 1, tests: {} };
  }

  function isValidState(value) {
    return Boolean(value && value.version === 1 && value.tests && typeof value.tests === "object");
  }

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return isValidState(saved) ? saved : emptyState();
    } catch {
      return emptyState();
    }
  }

  function scoreState(value) {
    return TESTS.reduce((total, test) => {
      const attempts = value.tests?.[test.id]?.attempts || [];
      const latest = attempts[attempts.length - 1];
      if (!latest) return total;
      return total + Object.values(latest.results || {}).filter((result) => result.outcome).length;
    }, 0);
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    if (sync) sync.push(state);
  }

  function formatDate(value, includeTime) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en-US", includeTime
      ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
      : { month: "short", day: "numeric", year: "numeric" }
    ).format(new Date(value));
  }

  function attemptId() {
    return window.crypto?.randomUUID?.() || `harry-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function testState(testDate) {
    state.tests[testDate] ||= { attempts: [] };
    return state.tests[testDate];
  }

  function newAttempt(testDate, restart) {
    const record = testState(testDate);
    const previous = record.attempts[record.attempts.length - 1];
    const now = new Date().toISOString();
    if (restart && previous?.status === "active") {
      previous.status = "restarted";
      previous.completedAt = now;
    }
    const attempt = { id: attemptId(), startedAt: now, completedAt: null, status: "active", results: {} };
    record.attempts.push(attempt);
    saveState();
    return attempt;
  }

  function currentAttempt(testDate) {
    const attempts = testState(testDate).attempts;
    return attempts[attempts.length - 1] || newAttempt(testDate, false);
  }

  function resultCounts(attempt) {
    const results = Object.values(attempt?.results || {});
    return {
      finished: results.filter((item) => item.outcome).length,
      first: results.filter((item) => item.outcome === "first_try").length,
      second: results.filter((item) => item.outcome === "second_try").length,
      revealed: results.filter((item) => item.outcome === "revealed").length,
    };
  }

  function visual(name) {
    if (!name) return "";
    if (name === "geometry") {
      return `<div class="question-visual geometry-visual" aria-label="Geometry diagram"><span class="line-diagram">P ●────● T ────● R</span><span class="ray-diagram">S ●────● Q →</span></div>`;
    }
    if (name === "clocks") {
      return `<div class="question-visual clocks-visual"><div><small>Start</small><strong>8:25</strong></div><span>→</span><div><small>End</small><strong>8:33</strong></div></div>`;
    }
    if (name === "input-output") {
      return `<div class="question-visual"><table class="input-output"><thead><tr><th>Input</th><th>Output</th></tr></thead><tbody><tr><td>2</td><td>12</td></tr><tr><td>6</td><td>36</td></tr><tr><td>12</td><td>72</td></tr></tbody></table></div>`;
    }
    if (name === "number-line") {
      return `<div class="question-visual number-line" aria-label="Number line from 1 to 4 with Q at about 3.3"><span>1</span><span>2</span><span>3</span><b>Q</b><span>4</span></div>`;
    }
    if (name === "rectangle") {
      return `<div class="question-visual rectangle-visual"><div><span>50 feet</span><b>35 feet</b></div></div>`;
    }
    if (name === "vertical-addition") {
      return `<div class="question-visual"><div class="vertical-math"><span>4,185</span><span>36</span><span>28</span><span>+ 718</span></div></div>`;
    }
    if (name === "unit-fraction-division") {
      return `<div class="question-visual big-equation"><span class="math-fraction"><span>1</span><span>8</span></span><span>÷ 10 = ?</span></div>`;
    }
    if (name === "decimal-multiplication") {
      return `<div class="question-visual"><div class="vertical-math"><span>0.39</span><span>× 0.3</span></div></div>`;
    }
    if (name === "land") {
      return `<div class="question-visual land-visual"><p><strong>Land per house:</strong> <span class="math-fraction"><span>1</span><span>2</span></span> acre</p><p><strong>Total land:</strong> 5 <span class="math-fraction"><span>1</span><span>2</span></span> acres</p></div>`;
    }
    if (name === "circle") {
      return `<div class="question-visual circle-visual"><div><span>22 mm</span></div></div>`;
    }
    return `<div class="question-visual big-equation"><span class="math-fraction"><span>11</span><span>5</span></span><span>=</span><span class="math-fraction"><span>?</span><span>35</span></span></div>`;
  }

  function renderHub() {
    const list = document.querySelector("#test-list");
    if (!list) return;
    list.innerHTML = TESTS.map((test, index) => {
      const attempts = testState(test.id).attempts;
      const latest = attempts[attempts.length - 1];
      const counts = resultCounts(latest);
      const status = !latest ? "Not started" : latest.status === "completed" ? `Completed ${formatDate(latest.completedAt, false)}` : `${counts.finished} of ${test.questions.length} finished`;
      return `<article class="test-card">
        <span class="test-number">0${index + 1}</span>
        <p class="eyebrow">${test.extractedLabel}</p>
        <h2>${test.dateLabel}</h2>
        <p>${test.questions.length} original missed questions together on one page.</p>
        <ul><li>Two tries</li><li>Answer after two misses</li><li>Saved practice history</li></ul>
        <div class="test-status"><span>${status}</span><i><b style="width:${Math.round((counts.finished / test.questions.length) * 100)}%"></b></i></div>
        <a class="primary-link" href="./tests/${test.id}/">Open ${test.shortDate} session <span>→</span></a>
      </article>`;
    }).join("");
  }

  function renderHistory(test, attempts) {
    const body = document.querySelector("#history-body");
    const count = document.querySelector("#history-count");
    if (!body || !count) return;
    count.textContent = `${attempts.length} recorded ${attempts.length === 1 ? "run" : "runs"}`;
    body.innerHTML = [...attempts].reverse().map((attempt) => {
      const counts = resultCounts(attempt);
      const status = attempt.status === "restarted" ? "Saved early" : attempt.status === "completed" ? "Completed" : "In progress";
      return `<tr><td>${formatDate(attempt.startedAt, true)}</td><td><span class="status-pill ${attempt.status}">${status}</span></td><td>${counts.finished}/${test.questions.length}</td><td>${counts.first}</td><td>${counts.second}</td><td>${counts.revealed}</td></tr>`;
    }).join("");
  }

  function renderSession() {
    const testDate = document.body.dataset.testDate;
    const test = TESTS.find((item) => item.id === testDate);
    if (!test) return;
    const attempts = testState(testDate).attempts;
    const attempt = currentAttempt(testDate);
    const counts = resultCounts(attempt);
    const progress = Math.round((counts.finished / test.questions.length) * 100);

    document.title = `Harry STAR Math · ${test.dateLabel}`;
    document.querySelector("#session-date").textContent = test.dateLabel;
    document.querySelector("#session-meta").textContent = `${test.extractedLabel} · ${test.questions.length} original missed questions`;
    document.querySelector("#progress-text").textContent = `${counts.finished} of ${test.questions.length} finished`;
    document.querySelector("#progress-percent").textContent = `${progress}%`;
    document.querySelector("#progress-fill").style.width = `${progress}%`;

    const finishedBanner = document.querySelector("#finished-banner");
    finishedBanner.hidden = attempt.status !== "completed";

    document.querySelector("#question-list").innerHTML = test.questions.map((question, index) => {
      const result = attempt.results[question.id] || { tries: 0, selectedIndices: [], outcome: null };
      const finished = Boolean(result.outcome);
      const triesLeft = 2 - result.tries;
      const choices = question.choicesHtml.map((choice, choiceIndex) => {
        const wasSelected = result.selectedIndices.includes(choiceIndex);
        const isCorrect = finished && question.correctIndex === choiceIndex;
        const isWrong = wasSelected && question.correctIndex !== choiceIndex;
        return `<label class="choice ${isCorrect ? "correct-choice" : ""} ${isWrong ? "wrong-choice" : ""}">
          <input type="radio" name="${question.id}" value="${choiceIndex}" ${finished || attempt.status === "completed" ? "disabled" : ""}>
          <span class="choice-letter">${letters[choiceIndex]}</span><span class="choice-text">${choice}</span>
        </label>`;
      }).join("");
      let feedback = "";
      if (!finished && result.tries === 1) feedback = `<p class="try-feedback"><strong>Not yet.</strong> One more try—look over the choices carefully.</p>`;
      if (finished) {
        const heading = result.outcome === "revealed" ? "Answer shown after two tries" : result.outcome === "first_try" ? "Correct on the first try" : "Correct on the second try";
        feedback = `<div class="answer-panel ${result.outcome === "revealed" ? "revealed" : "solved"}"><strong>${heading}</strong><p><b>Answer:</b> ${question.choicesHtml[question.correctIndex]}</p><p>${question.explanation}</p></div>`;
      }
      return `<article class="question-card ${finished ? "finished" : ""}" data-question-id="${question.id}">
        <header><span class="question-index">${index + 1}</span><div><small>Original missed question #${question.number}</small><h2>${question.skill}</h2></div><span class="tries-pill ${finished ? "done" : ""}">${finished ? "Finished" : `${triesLeft} ${triesLeft === 1 ? "try" : "tries"} left`}</span></header>
        <div class="prompt">${question.promptHtml}</div>${visual(question.visual)}
        <div class="choices" role="radiogroup" aria-label="Answer choices for original question ${question.number}">${choices}</div>
        ${!finished && attempt.status === "active" ? `<div class="check-row"><button class="check-answer" type="button" disabled>Check answer</button>${feedback}</div>` : feedback}
      </article>`;
    }).join("");
    renderHistory(test, attempts);
  }

  function checkAnswer(card) {
    const testDate = document.body.dataset.testDate;
    const test = TESTS.find((item) => item.id === testDate);
    const question = test.questions.find((item) => item.id === card.dataset.questionId);
    const selected = card.querySelector("input[type='radio']:checked");
    if (!selected) return;
    const attempt = currentAttempt(testDate);
    const result = attempt.results[question.id] || { tries: 0, selectedIndices: [], outcome: null, completedAt: null };
    if (result.outcome) return;

    const selectedIndex = Number(selected.value);
    result.tries = Math.min(result.tries + 1, 2);
    result.selectedIndices.push(selectedIndex);
    if (selectedIndex === question.correctIndex) result.outcome = result.tries === 1 ? "first_try" : "second_try";
    else if (result.tries === 2) result.outcome = "revealed";
    if (result.outcome) result.completedAt = new Date().toISOString();
    attempt.results[question.id] = result;

    if (Object.values(attempt.results).filter((item) => item.outcome).length === test.questions.length) {
      attempt.status = "completed";
      attempt.completedAt = new Date().toISOString();
    }
    saveState();
    renderSession();
  }

  function bindSessionEvents() {
    const list = document.querySelector("#question-list");
    list.addEventListener("change", (event) => {
      if (!event.target.matches("input[type='radio']")) return;
      const card = event.target.closest(".question-card");
      card.querySelector(".check-answer").disabled = false;
    });
    list.addEventListener("click", (event) => {
      const button = event.target.closest(".check-answer");
      if (button) checkAnswer(button.closest(".question-card"));
    });
    document.querySelector("#practice-again").addEventListener("click", () => {
      if (!window.confirm("Start a fresh run? This run will stay in Harry's saved history.")) return;
      newAttempt(document.body.dataset.testDate, true);
      renderSession();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function render() {
    if (document.body.dataset.page === "hub") renderHub();
    else renderSession();
  }

  render();
  if (document.body.dataset.page === "session") bindSessionEvents();

  const isLocalPreview = location.hostname === "127.0.0.1" || location.hostname === "localhost";
  if (window.MarcoOnlineSync && !isLocalPreview) {
    sync = window.MarcoOnlineSync.create({
      appId: APP_ID,
      studentName: "Harry",
      validate: isValidState,
      score: scoreState,
      onRemote(remote) {
        state = remote;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
        render();
      },
    });
    void sync.start(state);
  }
})();
