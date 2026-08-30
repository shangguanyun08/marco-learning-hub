(function () {
  "use strict";

  const TESTS = window.STAR_MATH_TESTS || [];
  const SIMILAR = window.STAR_MATH_SIMILAR || {};
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
    const latest = attempts[attempts.length - 1];
    if (!latest) return newAttempt(testDate, false);
    const hasSimilarResults = Object.keys(latest.results || {}).some((id) => id.endsWith("-similar"));
    if (latest.status === "completed" && !hasSimilarResults) return newAttempt(testDate, false);
    return latest;
  }

  function totalItems(test) {
    return test.questions.length * 2;
  }

  function attemptTarget(test, attempt) {
    const hasSimilarResults = Object.keys(attempt?.results || {}).some((id) => id.endsWith("-similar"));
    return attempt?.status === "completed" && !hasSimilarResults ? test.questions.length : totalItems(test);
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
    if (name === "clocks-similar") {
      return `<div class="question-visual clocks-visual"><div><small>Start</small><strong>9:10</strong></div><span>→</span><div><small>End</small><strong>9:27</strong></div></div>`;
    }
    if (name === "input-output") {
      return `<div class="question-visual"><table class="input-output"><thead><tr><th>Input</th><th>Output</th></tr></thead><tbody><tr><td>2</td><td>12</td></tr><tr><td>6</td><td>36</td></tr><tr><td>12</td><td>72</td></tr></tbody></table></div>`;
    }
    if (name === "input-output-similar") {
      return `<div class="question-visual"><table class="input-output"><thead><tr><th>Input</th><th>Output</th></tr></thead><tbody><tr><td>2</td><td>14</td></tr><tr><td>4</td><td>28</td></tr><tr><td>6</td><td>42</td></tr><tr><td>10</td><td>70</td></tr></tbody></table></div>`;
    }
    if (name === "number-line") {
      return `<div class="question-visual number-line" aria-label="Number line from 1 to 4 with Q at about 3.3"><span>1</span><span>2</span><span>3</span><b>Q</b><span>4</span></div>`;
    }
    if (name === "number-line-similar") {
      return `<div class="question-visual number-line number-line-similar" aria-label="Number line from 1 to 4 with P at about 2.6"><span>1</span><span>2</span><b>P</b><span>3</span><span>4</span></div>`;
    }
    if (name === "rectangle") {
      return `<div class="question-visual rectangle-visual"><div><span>50 feet</span><b>35 feet</b></div></div>`;
    }
    if (name === "rectangle-similar") {
      return `<div class="question-visual rectangle-visual"><div class="wide-rectangle"><span>42 feet</span><b>28 feet</b></div></div>`;
    }
    if (name === "vertical-addition") {
      return `<div class="question-visual"><div class="vertical-math"><span>4,185</span><span>36</span><span>28</span><span>+ 718</span></div></div>`;
    }
    if (name === "vertical-addition-similar") {
      return `<div class="question-visual"><div class="vertical-math"><span>3,642</span><span>57</span><span>89</span><span>+ 416</span></div></div>`;
    }
    if (name === "unit-fraction-division") {
      return `<div class="question-visual big-equation"><span class="math-fraction"><span>1</span><span>8</span></span><span>÷ 10 = ?</span></div>`;
    }
    if (name === "unit-fraction-division-similar") {
      return `<div class="question-visual big-equation"><span class="math-fraction"><span>1</span><span>6</span></span><span>÷ 4 = ?</span></div>`;
    }
    if (name === "decimal-multiplication") {
      return `<div class="question-visual"><div class="vertical-math"><span>0.39</span><span>× 0.3</span></div></div>`;
    }
    if (name === "decimal-multiplication-similar") {
      return `<div class="question-visual"><div class="vertical-math"><span>0.48</span><span>× 0.2</span></div></div>`;
    }
    if (name === "land") {
      return `<div class="question-visual land-visual"><p><strong>Land per house:</strong> <span class="math-fraction"><span>1</span><span>2</span></span> acre</p><p><strong>Total land:</strong> 5 <span class="math-fraction"><span>1</span><span>2</span></span> acres</p></div>`;
    }
    if (name === "land-similar") {
      return `<div class="question-visual land-visual"><p><strong>Land per house:</strong> <span class="math-fraction"><span>3</span><span>4</span></span> acre</p><p><strong>Total land:</strong> 6 acres</p></div>`;
    }
    if (name === "circle") {
      return `<div class="question-visual circle-visual"><div><span>22 mm</span></div></div>`;
    }
    if (name === "circle-similar") {
      return `<div class="question-visual circle-visual"><div><span>34 cm</span></div></div>`;
    }
    if (name === "geometry-similar") {
      return `<div class="question-visual geometry-visual" aria-label="Geometry diagram"><span class="line-diagram">P ←────● R</span><span class="ray-diagram">S ●────● Q →</span></div>`;
    }
    if (name === "equivalent-fraction-similar") {
      return `<div class="question-visual big-equation"><span class="math-fraction"><span>7</span><span>4</span></span><span>=</span><span class="math-fraction"><span>?</span><span>20</span></span></div>`;
    }
    if (name === "aug30-subtraction") {
      return `<div class="question-visual"><div class="vertical-math"><span>696,410</span><span>− 18,564</span></div></div>`;
    }
    if (name === "aug30-subtraction-similar") {
      return `<div class="question-visual"><div class="vertical-math"><span>584,300</span><span>− 27,458</span></div></div>`;
    }
    if (name === "aug30-animal-table") {
      return `<div class="question-visual"><table class="input-output data-table"><thead><tr><th>Animal</th><th>Average weight (kg)</th></tr></thead><tbody><tr><td>Polar bear</td><td>410</td></tr><tr><td>Caribou</td><td>214</td></tr><tr><td>Moose</td><td>700</td></tr><tr><td>Beaver</td><td>23</td></tr><tr><td>Arctic wolf</td><td>40</td></tr></tbody></table></div>`;
    }
    if (name === "aug30-animal-table-similar") {
      return `<div class="question-visual"><table class="input-output data-table"><thead><tr><th>Animal</th><th>Average weight (kg)</th></tr></thead><tbody><tr><td>Black bear</td><td>360</td></tr><tr><td>Elk</td><td>725</td></tr><tr><td>Deer</td><td>92</td></tr><tr><td>Fox</td><td>14</td></tr></tbody></table></div>`;
    }
    if (name === "aug30-pictograph") {
      return `<div class="question-visual"><table class="pictograph" aria-label="Sports pictograph; one diamond equals two children"><caption>Sports Children Play</caption><tbody><tr><th>Baseball</th><td>♦ ♦ ♦ ♦</td></tr><tr><th>Basketball</th><td>♦</td></tr><tr><th>Softball</th><td>♦ ♦ ♦ ♦ ♦ ♦</td></tr></tbody><tfoot><tr><td colspan="2">♦ = 2 children</td></tr></tfoot></table></div>`;
    }
    if (name === "aug30-pictograph-similar") {
      return `<div class="question-visual"><table class="pictograph" aria-label="Club pictograph; one diamond equals two children"><caption>Clubs Children Joined</caption><tbody><tr><th>Science</th><td>♦ ♦ ♦ ♦</td></tr><tr><th>Art</th><td>♦ ♦</td></tr><tr><th>Music</th><td>♦ ♦ ♦</td></tr></tbody><tfoot><tr><td colspan="2">♦ = 2 children</td></tr></tfoot></table></div>`;
    }
    if (name === "aug30-shaded-cylinder") {
      return `<div class="question-visual cylinder-visual" aria-label="A cylinder shaded about five sixths"><div class="cylinder-fill fill-five-sixths"></div></div>`;
    }
    if (name === "aug30-shaded-cylinder-similar") {
      return `<div class="question-visual cylinder-visual" aria-label="A cylinder shaded about three fourths"><div class="cylinder-fill fill-three-fourths"></div></div>`;
    }
    if (name === "aug30-prism") {
      return `<div class="question-visual"><div class="prism-diagram" aria-label="Rectangular prism 2 cubes wide, 4 cubes high, and 4 cubes deep"><div class="prism-grid prism-2-by-4">${"<i></i>".repeat(8)}</div><span class="width-label">2 wide</span><span class="height-label">4 high</span><span class="depth-label">4 deep</span></div></div>`;
    }
    if (name === "aug30-prism-similar") {
      return `<div class="question-visual"><div class="prism-diagram" aria-label="Rectangular prism 3 cubes wide, 3 cubes high, and 4 cubes deep"><div class="prism-grid prism-3-by-3">${"<i></i>".repeat(9)}</div><span class="width-label">3 wide</span><span class="height-label">3 high</span><span class="depth-label">4 deep</span></div></div>`;
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
      const target = latest ? attemptTarget(test, latest) : totalItems(test);
      const legacyComplete = latest?.status === "completed" && target === test.questions.length;
      const status = !latest ? "Not started" : legacyComplete ? "Similar practice ready" : latest.status === "completed" ? `Completed ${formatDate(latest.completedAt, false)}` : `${counts.finished} of ${target} finished`;
      return `<article class="test-card">
        <span class="test-number">0${index + 1}</span>
        <p class="eyebrow">${test.extractedLabel}</p>
        <h2>${test.dateLabel}</h2>
        <p>${test.questions.length} original missed or timed-out questions, each paired with a similar practice question.</p>
        <ul><li>Original + similar</li><li>Two tries each</li><li>Saved practice history</li></ul>
        <div class="test-status"><span>${status}</span><i><b style="width:${Math.round((counts.finished / target) * 100)}%"></b></i></div>
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
      return `<tr><td>${formatDate(attempt.startedAt, true)}</td><td><span class="status-pill ${attempt.status}">${status}</span></td><td>${counts.finished}/${attemptTarget(test, attempt)}</td><td>${counts.first}</td><td>${counts.second}</td><td>${counts.revealed}</td></tr>`;
    }).join("");
  }

  function renderPracticePanel(question, item, type, attempt) {
    const itemId = type === "similar" ? `${question.id}-similar` : question.id;
    const result = attempt.results[itemId] || { tries: 0, selectedIndices: [], outcome: null };
    const finished = Boolean(result.outcome);
    const triesLeft = 2 - result.tries;
    const choices = item.choicesHtml.map((choice, choiceIndex) => {
      const wasSelected = result.selectedIndices.includes(choiceIndex);
      const isCorrect = finished && item.correctIndex === choiceIndex;
      const isWrong = wasSelected && item.correctIndex !== choiceIndex;
      return `<label class="choice ${isCorrect ? "correct-choice" : ""} ${isWrong ? "wrong-choice" : ""}">
        <input type="radio" name="${itemId}" value="${choiceIndex}" ${finished || attempt.status === "completed" ? "disabled" : ""}>
        <span class="choice-letter">${letters[choiceIndex]}</span><span class="choice-text">${choice}</span>
      </label>`;
    }).join("");
    let feedback = "";
    if (!finished && result.tries === 1) feedback = `<p class="try-feedback"><strong>Not yet.</strong> One more try—look over the choices carefully.</p>`;
    if (finished) {
      const heading = result.outcome === "revealed" ? "Answer shown after two tries" : result.outcome === "first_try" ? "Correct on the first try" : "Correct on the second try";
      feedback = `<div class="answer-panel ${result.outcome === "revealed" ? "revealed" : "solved"}"><strong>${heading}</strong><p><b>Answer:</b> ${item.choicesHtml[item.correctIndex]}</p><p>${item.explanation}</p></div>`;
    }
    const timedOut = question.skill.startsWith("Timed out");
    const label = type === "similar" ? "Similar practice" : timedOut ? `Timed-out original question #${question.number}` : `Original missed question #${question.number}`;
    return `<section class="question-panel ${type} ${finished ? "finished" : ""}" data-question-id="${itemId}" data-parent-id="${question.id}" data-question-type="${type}">
      <div class="panel-heading"><span class="pair-label">${label}</span><span class="tries-pill ${finished ? "done" : ""}">${finished ? "Finished" : `${triesLeft} ${triesLeft === 1 ? "try" : "tries"} left`}</span></div>
      <div class="prompt">${item.promptHtml}</div>${visual(item.visual)}
      <div class="choices" role="radiogroup" aria-label="Answer choices for ${label}">${choices}</div>
      ${!finished && attempt.status === "active" ? `<div class="check-row"><button class="check-answer" type="button" disabled>Check answer</button>${feedback}</div>` : feedback}
    </section>`;
  }

  function renderSession() {
    const testDate = document.body.dataset.testDate;
    const test = TESTS.find((item) => item.id === testDate);
    if (!test) return;
    const attempts = testState(testDate).attempts;
    const attempt = currentAttempt(testDate);
    const counts = resultCounts(attempt);
    const target = totalItems(test);
    const progress = Math.round((counts.finished / target) * 100);

    document.title = `Harry STAR Math · ${test.dateLabel}`;
    document.querySelector("#session-date").textContent = test.dateLabel;
    document.querySelector("#session-meta").textContent = `${test.extractedLabel} · ${test.questions.length} original + ${test.questions.length} similar questions`;
    document.querySelector("#progress-text").textContent = `${counts.finished} of ${target} finished`;
    document.querySelector("#progress-percent").textContent = `${progress}%`;
    document.querySelector("#progress-fill").style.width = `${progress}%`;

    const finishedBanner = document.querySelector("#finished-banner");
    finishedBanner.hidden = attempt.status !== "completed";

    document.querySelector("#question-list").innerHTML = test.questions.map((question, index) => {
      const similar = SIMILAR[question.id];
      return `<article class="question-card">
        <header><span class="question-index">${index + 1}</span><div><small>Original + matched practice</small><h2>${question.skill}</h2></div></header>
        <div class="question-pair">
          ${renderPracticePanel(question, question, "original", attempt)}
          ${renderPracticePanel(question, similar, "similar", attempt)}
        </div>
      </article>`;
    }).join("");
    renderHistory(test, attempts);
  }

  function checkAnswer(panel) {
    const testDate = document.body.dataset.testDate;
    const test = TESTS.find((item) => item.id === testDate);
    const question = test.questions.find((item) => item.id === panel.dataset.parentId);
    const item = panel.dataset.questionType === "similar" ? SIMILAR[question.id] : question;
    const itemId = panel.dataset.questionId;
    const selected = panel.querySelector("input[type='radio']:checked");
    if (!selected) return;
    const attempt = currentAttempt(testDate);
    const result = attempt.results[itemId] || { tries: 0, selectedIndices: [], outcome: null, completedAt: null };
    if (result.outcome) return;

    const selectedIndex = Number(selected.value);
    result.tries = Math.min(result.tries + 1, 2);
    result.selectedIndices.push(selectedIndex);
    if (selectedIndex === item.correctIndex) result.outcome = result.tries === 1 ? "first_try" : "second_try";
    else if (result.tries === 2) result.outcome = "revealed";
    if (result.outcome) result.completedAt = new Date().toISOString();
    attempt.results[itemId] = result;

    if (Object.values(attempt.results).filter((entry) => entry.outcome).length === totalItems(test)) {
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
      const panel = event.target.closest(".question-panel");
      panel.querySelector(".check-answer").disabled = false;
    });
    list.addEventListener("click", (event) => {
      const button = event.target.closest(".check-answer");
      if (button) checkAnswer(button.closest(".question-panel"));
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
