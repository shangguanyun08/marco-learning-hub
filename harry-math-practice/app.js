const questionSets = {
  4: [
    { left: 318, operator: "×", right: 3, answer: 954, skill: "Multiply" },
    { left: 432, operator: "×", right: 4, answer: 1728, skill: "Multiply" },
    { left: 227, operator: "×", right: 3, answer: 681, skill: "Multiply" },
    { left: 475, operator: "÷", right: 5, answer: 95, skill: "Divide" },
    { left: 918, operator: "÷", right: 2, answer: 459, skill: "Divide" },
    { left: 536, operator: "+", right: 147, answer: 683, skill: "Add" },
    { left: 87, operator: "+", right: 56, answer: 143, skill: "Add", removed: true },
    { left: 270, operator: "−", right: 98, answer: 172, skill: "Subtract" },
    { left: 620, operator: "−", right: 347, answer: 273, skill: "Subtract" },
    { left: 900, operator: "−", right: 578, answer: 322, skill: "Subtract", removed: true },
    { numerator: 5, denominator: 3, equivalentDenominator: 21, answer: 35, skill: "Equivalent Fraction", kind: "fraction" },
    { numerator: 12, denominator: 7, equivalentDenominator: 35, answer: 60, skill: "Equivalent Fraction", kind: "fraction" },
    { numerator: 7, denominator: 9, equivalentDenominator: 63, answer: 49, skill: "Equivalent Fraction", kind: "fraction" },
    { numerator: 15, denominator: 4, equivalentDenominator: 32, answer: 120, skill: "Equivalent Fraction", kind: "fraction" },
    { left: 0.46, operator: "×", right: 0.2, answer: 0.092, skill: "Decimal Multiply" },
    { left: 0.37, operator: "×", right: 0.4, answer: 0.148, skill: "Decimal Multiply" },
  ],
  5: [
    { left: 346, operator: "×", right: 3, answer: 1038, skill: "Multiply" },
    { left: 425, operator: "×", right: 4, answer: 1700, skill: "Multiply" },
    { left: 218, operator: "×", right: 3, answer: 654, skill: "Multiply" },
    { left: 735, operator: "÷", right: 5, answer: 147, skill: "Divide" },
    { left: 864, operator: "÷", right: 2, answer: 432, skill: "Divide" },
    { left: 458, operator: "+", right: 236, answer: 694, skill: "Add" },
    { left: 740, operator: "−", right: 268, answer: 472, skill: "Subtract" },
    { left: 905, operator: "−", right: 487, answer: 418, skill: "Subtract" },
    { prompt: "Which fraction is equal to 0.3?", decimal: 0.3, answer: "3/10", choices: ["1/10", "3/10", "3/5", "7/10"], skill: "Decimal to Fraction", kind: "decimalFraction" },
    { prompt: "Which fraction is equal to 0.6?", decimal: 0.6, answer: "3/5", choices: ["1/6", "3/5", "2/3", "6/100"], skill: "Decimal to Fraction", kind: "decimalFraction" },
    { prompt: "In what place is the digit 7 in 438.72?", answer: "tenths", choices: ["ones", "tenths", "hundredths", "thousandths"], accepted: ["tenth", "tenths place", "tenth place"], skill: "Decimal Place Value", kind: "placeValue" },
    { prompt: "In what place is the digit 5 in 906.153?", answer: "hundredths", choices: ["tenths", "hundredths", "thousandths", "ones"], accepted: ["hundredth", "hundredths place", "hundredth place"], skill: "Decimal Place Value", kind: "placeValue" },
    { left: 0.48, operator: "×", right: 0.3, answer: 0.144, choices: [1.44, 0.0144, 0.144, 0.84], skill: "Decimal Multiply" },
    { left: 0.26, operator: "×", right: 0.4, answer: 0.104, choices: [0.66, 0.0104, 1.04, 0.104], skill: "Decimal Multiply" },
  ],
  6: [
    { left: 327, operator: "×", right: 3, answer: 981, skill: "Multiply" },
    // Keep retired questions in their original slots so saved answers stay aligned.
    { left: 414, operator: "×", right: 4, answer: 1656, skill: "Multiply", removed: true },
    { left: 236, operator: "×", right: 3, answer: 708, skill: "Multiply" },
    { left: 845, operator: "÷", right: 5, answer: 169, skill: "Divide" },
    { left: 936, operator: "÷", right: 2, answer: 468, skill: "Divide" },
    { left: 367, operator: "+", right: 428, answer: 795, skill: "Add" },
    { left: 830, operator: "−", right: 356, answer: 474, skill: "Subtract" },
    { left: 704, operator: "−", right: 289, answer: 415, skill: "Subtract" },
    { prompt: "Which fraction is equal to 0.4?", decimal: 0.4, answer: "2/5", choices: ["1/4", "2/5", "4/5", "4/100"], skill: "Decimal to Fraction", kind: "decimalFraction" },
    { prompt: "Which fraction is equal to 0.75?", decimal: 0.75, answer: "3/4", choices: ["1/4", "1/2", "3/4", "4/5"], skill: "Decimal to Fraction", kind: "decimalFraction", removed: true },
    { prompt: "In what place is the digit 6 in 524.68?", answer: "tenths", choices: ["ones", "tenths", "hundredths", "thousandths"], accepted: ["tenth", "tenths place", "tenth place"], skill: "Decimal Place Value", kind: "placeValue", removed: true },
    { prompt: "In what place is the digit 2 in 381.024?", answer: "hundredths", choices: ["tenths", "hundredths", "thousandths", "ones"], accepted: ["hundredth", "hundredths place", "hundredth place"], skill: "Decimal Place Value", kind: "placeValue", removed: true },
    { left: 0.53, operator: "×", right: 0.2, answer: 0.106, choices: [0.73, 0.0106, 0.106, 1.06], skill: "Decimal Multiply" },
    { left: 0.42, operator: "×", right: 0.3, answer: 0.126, choices: [0.126, 0.72, 1.26, 0.0126], skill: "Decimal Multiply" },
  ],
  7: [
    { left: 326, operator: "×", right: 3, answer: 978, skill: "Multiply" },
    { left: 238, operator: "×", right: 3, answer: 714, skill: "Multiply" },
    { left: 865, operator: "÷", right: 5, answer: 173, skill: "Divide" },
    { left: 954, operator: "÷", right: 2, answer: 477, skill: "Divide" },
    { left: 476, operator: "+", right: 318, answer: 794, skill: "Add" },
    { left: 820, operator: "−", right: 367, answer: 453, skill: "Subtract" },
    { left: 703, operator: "−", right: 286, answer: 417, skill: "Subtract" },
    { prompt: "Which fraction is equal to 0.8?", decimal: 0.8, answer: "4/5", choices: ["1/8", "8/100", "4/5", "3/5"], skill: "Decimal to Fraction", kind: "decimalFraction" },
    { left: 0.54, operator: "×", right: 0.2, answer: 0.108, choices: [1.08, 0.108, 0.0108, 0.74], skill: "Decimal Multiply" },
    { left: 0.43, operator: "×", right: 0.3, answer: 0.129, choices: [0.73, 1.29, 0.0129, 0.129], skill: "Decimal Multiply" },
  ],
  8: [
    { left: 328, operator: "×", right: 3, answer: 984, skill: "Multiply" },
    { left: 239, operator: "×", right: 3, answer: 717, skill: "Multiply" },
    { left: 875, operator: "÷", right: 5, answer: 175, skill: "Divide" },
    { left: 978, operator: "÷", right: 2, answer: 489, skill: "Divide" },
    { left: 358, operator: "+", right: 427, answer: 785, skill: "Add" },
    { left: 840, operator: "−", right: 368, answer: 472, skill: "Subtract" },
    { left: 706, operator: "−", right: 288, answer: 418, skill: "Subtract" },
    { prompt: "Which fraction is equal to 0.2?", decimal: 0.2, answer: "1/5", choices: ["1/5", "1/2", "2/100", "2/5"], skill: "Decimal to Fraction", kind: "decimalFraction" },
    { left: 0.36, operator: "×", right: 0.3, answer: 0.108, choices: [0.0108, 0.66, 1.08, 0.108], skill: "Decimal Multiply" },
    { left: 0.47, operator: "×", right: 0.2, answer: 0.094, choices: [0.094, 0.94, 0.0094, 0.67], skill: "Decimal Multiply" },
  ],
};

const DAY3_SET = 6;
const mastery = globalThis.HarryDay3Mastery;
const day3Banks = mastery.createBanks(questionSets[DAY3_SET]);

const STORAGE_KEY = "harry-math-practice-record-v1";
const APP_ID = "harry-math-practice-v1";
const SET_NUMBERS = Object.keys(questionSets).map(Number);
// Display days from 1 while retaining the original set IDs used by saved work.
function dayLabel(setNumber) {
  return `Day ${SET_NUMBERS.indexOf(setNumber) + 1}`;
}

const cards = [...document.querySelectorAll("[data-question]")];
const questionGrid = document.querySelector(".question-grid");
const firstTryScore = document.querySelector("#first-try-score");
const attemptSummary = document.querySelector("#attempt-summary");
const solvedSummary = document.querySelector("#solved-summary");
const fill = document.querySelector("#score-fill");
const complete = document.querySelector("#complete-card");
const completeTitle = document.querySelector("#complete-title");
const finalScore = document.querySelector("#final-score");
const setButtons = [...document.querySelectorAll(".set-button")];
let activeSet = SET_NUMBERS[0];
let activeDay3Index = null;
let receivedRemote = false;

function day3Indexes() {
  return questionSets[DAY3_SET].map((question, index) => question.removed ? -1 : index).filter(index => index !== -1);
}

function updateDay3Progress() {
  if (activeSet !== DAY3_SET) return;
  const indexes = day3Indexes();
  const position = indexes.indexOf(activeDay3Index);
  const stats = recordStats(DAY3_SET);
  document.querySelector("#day3-position").textContent = `Question ${position + 1} of ${indexes.length}`;
  document.querySelector("#day3-mastered-count").textContent = `${stats.solved} of ${indexes.length} mastered`;
  const bar = document.querySelector("#day3-mastered-progress");
  bar.max = indexes.length;
  bar.value = stats.solved;
  document.querySelector("#day3-progress-detail").textContent = `${stats.unmastered} unmastered · ${stats.finished} of ${indexes.length} finished · First-try score: ${scoreOutOf100(stats, indexes.length)}/100`;
  document.querySelector("#day3-previous").disabled = position === 0;
  document.querySelector("#day3-next").disabled = position === indexes.length - 1 || !mastery.progress(records[DAY3_SET].questions[activeDay3Index]).finished;
}

function moveDay3Question(direction) {
  const indexes = day3Indexes();
  const position = indexes.indexOf(activeDay3Index);
  if (activeSet !== DAY3_SET || (direction > 0 && !mastery.progress(records[DAY3_SET].questions[activeDay3Index]).finished)) return;
  const target = indexes[position + direction];
  if (target === undefined) return;
  activeDay3Index = target;
  loadSet(DAY3_SET);
  document.querySelector("#day3-progress").scrollIntoView?.({ block: "start", behavior: "instant" });
}

function emptyQuestionRecord() {
  return { firstTry: null, attempts: 0, solved: false, lastAnswer: "" };
}

function normalizeQuestionRecord(value, setNumber, questionIndex) {
  return {
    firstTry: typeof value?.firstTry === "boolean" ? value.firstTry : null,
    attempts: Number.isInteger(value?.attempts) && value.attempts > 0 ? value.attempts : 0,
    solved: value?.solved === true,
    lastAnswer: typeof value?.lastAnswer === "string" ? value.lastAnswer : "",
    ...(setNumber === DAY3_SET ? {
      review: mastery.normalizeReview(value?.review, day3Banks[questionIndex], isCorrectAnswer, value?.firstTry),
    } : {}),
  };
}

function normalizeRecords(saved = {}) {
  return Object.fromEntries(
    SET_NUMBERS.map((setNumber) => {
      const savedQuestions = Array.isArray(saved[setNumber]?.questions)
        ? saved[setNumber].questions
        : [];
      return [
        setNumber,
        {
          questions: Array.from(
            { length: questionSets[setNumber].length },
            (_, questionIndex) =>
              savedQuestions[questionIndex]
                ? normalizeQuestionRecord(savedQuestions[questionIndex], setNumber, questionIndex)
                : emptyQuestionRecord(),
          ),
          completedAt:
            savedQuestions.length === questionSets[setNumber].length &&
            typeof saved[setNumber]?.completedAt === "string"
              ? saved[setNumber].completedAt
              : null,
        },
      ];
    }),
  );
}

function readSavedRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function isValidRecords(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      SET_NUMBERS.some((setNumber) => Array.isArray(value[setNumber]?.questions)),
  );
}

function syncScore(value) {
  const normalized = normalizeRecords(value);
  return SET_NUMBERS.reduce(
    (total, setNumber) =>
      total +
      normalized[setNumber].questions.reduce(
        (setTotal, question) =>
          setTotal + (question.solved ? 1000 : 0) + (question.firstTry !== null ? 1 : 0)
            + (question.review?.attempts.length || 0),
        0,
      ),
    0,
  );
}

const savedRecords = readSavedRecords();
let records = normalizeRecords(savedRecords);
let sync = null;

function storeRecords(value = records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Practice still works when browser storage is unavailable.
  }
}

function saveRecords() {
  storeRecords();
  sync?.push(records);
}

function activeQuestions() {
  return questionSets[activeSet];
}

function activeRecord() {
  return records[activeSet];
}

function questionCount(setNumber) {
  return questionSets[setNumber].filter((question) => !question.removed).length;
}

function recordStats(setNumber) {
  const questions = records[setNumber].questions.filter(
    (_, index) => !questionSets[setNumber][index].removed,
  );
  return {
    answered: questions.filter((question) => question.firstTry !== null).length,
    right: questions.filter((question) => question.firstTry === true).length,
    wrong: questions.filter((question) => question.firstTry === false).length,
    solved: questions.filter((question) => setNumber === DAY3_SET
      ? mastery.progress(question).status === "mastered" : question.solved).length,
    unmastered: setNumber === DAY3_SET
      ? questions.filter((question) => mastery.progress(question).status === "unmastered").length : 0,
    finished: questions.filter((question) => setNumber === DAY3_SET
      ? mastery.progress(question).finished : question.solved).length,
  };
}

function scoreOutOf100(stats, questionCount) {
  return Math.round((stats.right / questionCount) * 100);
}

function formatCompletedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function makeFraction(numerator, denominator, unknown = false) {
  const fraction = document.createElement("span");
  fraction.className = "fraction";
  fraction.setAttribute(
    "aria-label",
    `${unknown ? "unknown" : numerator} over ${denominator}`,
  );

  const top = document.createElement("span");
  top.className = "fraction-top";
  top.textContent = unknown ? "?" : String(numerator);
  const bottom = document.createElement("span");
  bottom.className = "fraction-bottom";
  bottom.textContent = String(denominator);
  fraction.append(top, bottom);
  return fraction;
}

function renderExpression(element, question) {
  element.replaceChildren();
  element.classList.remove("fraction-expression", "prompt-expression");

  if (question.kind === "fraction") {
    element.classList.add("fraction-expression");
    element.append(
      makeFraction(question.numerator, question.denominator),
      " = ",
      makeFraction(null, question.equivalentDenominator, true),
    );
    return;
  }

  if (question.prompt) {
    element.classList.add("prompt-expression");
    element.textContent = question.prompt;
    return;
  }

  element.append(`${question.left} `);

  if (question.operator === "÷") {
    const division = document.createElement("span");
    division.className = "division-mark";
    division.setAttribute("aria-label", "divided by");
    division.textContent = "÷";
    element.append(division);
  } else {
    element.append(question.operator);
  }

  const equals = document.createElement("span");
  equals.textContent = "=";
  element.append(` ${question.right} `, equals);
}

function isCorrectAnswer(typed, question) {
  if (typeof question.answer === "number") {
    return Number(typed) === question.answer;
  }

  const normalized = typed.trim().toLowerCase().replace(/\s+/g, " ");
  const accepted = [question.answer, ...(question.accepted || [])].map((answer) =>
    answer.toLowerCase(),
  );
  if (accepted.includes(normalized)) return true;

  if (question.kind === "decimalFraction") {
    const match = normalized.replace(/\s/g, "").match(/^(-?\d+)\/(\d+)$/);
    if (!match || Number(match[2]) === 0) return false;
    return Math.abs(Number(match[1]) / Number(match[2]) - question.decimal) < 1e-10;
  }

  return false;
}

function feedbackFor(question) {
  if (question.solved && question.firstTry === true) {
    return "✓ Solved — right on the first try.";
  }
  if (question.solved) {
    return "✓ Solved — first try recorded as incorrect.";
  }
  if (question.firstTry === false && question.attempts >= 2) {
    return `Still incorrect after ${question.attempts} tries. Recalculate and try again.`;
  }
  if (question.firstTry === false) {
    return "First try incorrect. Recalculate and try again.";
  }
  return "Enter your answer when you are ready.";
}

function renderChoiceOptions(card, index, question, record, locked = record.solved) {
  const form = card.querySelector("form");
  const input = card.querySelector("input");
  const answerRow = card.querySelector(".answer-row");
  form.querySelector(".choice-grid")?.remove();

  const hasChoices = Array.isArray(question.choices);
  answerRow.hidden = hasChoices;
  input.hidden = hasChoices;
  if (!hasChoices) return;

  const grid = document.createElement("div");
  grid.className = "choice-grid";
  grid.setAttribute("role", "group");
  grid.setAttribute("aria-labelledby", `choice-label-${index + 1}`);

  question.choices.forEach((choice) => {
    const value = String(choice);
    const option = document.createElement("button");
    option.type = "button";
    option.className = "choice-option";
    option.textContent = value;
    option.dataset.value = value;
    option.disabled = locked;

    const selected = record.lastAnswer === value;
    option.classList.toggle("selected", selected);
    option.setAttribute("aria-pressed", String(selected));
    if (record.solved && isCorrectAnswer(value, question)) {
      option.classList.add("correct");
    } else if (selected && record.firstTry === false) {
      option.classList.add(record.attempts >= 2 ? "incorrect" : "retry");
    }

    option.addEventListener("click", () => {
      input.value = value;
      form.requestSubmit();
    });
    grid.append(option);
  });

  answerRow.before(grid);
}

function renderQuestionState(card, index) {
  const question = activeRecord().questions[index];
  const input = card.querySelector("input");
  const button = card.querySelector("button[type='submit']");
  const feedback = card.querySelector(".feedback");
  const activeQuestion = activeQuestions()[index];
  const isDay3 = activeSet === DAY3_SET;
  const state = isDay3 ? mastery.progress(question) : null;
  const locked = isDay3 ? question.firstTry !== null : question.solved;

  card.classList.toggle("right", isDay3 ? state.status === "mastered" : question.solved);
  const needsRetry = question.firstTry === false && !question.solved;
  card.classList.toggle("retry", needsRetry && question.attempts < 2);
  card.classList.toggle("wrong", needsRetry && question.attempts >= 2);
  input.value = question.lastAnswer;
  input.disabled = locked;
  button.disabled = locked;
  button.textContent = locked ? (isDay3 ? "Recorded" : "Solved") : "Check";
  feedback.textContent = feedbackFor(question);
  renderChoiceOptions(card, index, activeQuestion, question, locked);
  card.querySelector(".mastery-badge")?.remove();
  card.querySelector(".mastery-practice")?.remove();
  if (isDay3) {
    card.classList.toggle("retry", state.status === "practicing");
    card.classList.toggle("wrong", state.status === "unmastered");
    const badge = document.createElement("span");
    badge.className = `mastery-badge ${state.status}`;
    badge.textContent = { unanswered: "Not answered", practicing: "In practice", mastered: "Mastered", unmastered: "Unmastered" }[state.status];
    card.querySelector(".card-top").append(badge);
    feedback.textContent = question.firstTry === true
      ? "✓ Main question correct — 1 right in a row. Continue the practice to reach 3."
      : question.firstTry === false
        ? `Main question incorrect. Correct answer: ${activeQuestion.answer}. First-try score is saved.`
        : "Start your streak here. Get 3 answers right in a row, including this question.";
    if (question.firstTry !== null) renderMasteryPractice(card, index);
  }
}

function renderMasteryPractice(card, index) {
  const record = activeRecord().questions[index];
  const state = mastery.progress(record);
  const panel = document.createElement("section");
  panel.className = "mastery-practice";
  panel.setAttribute("aria-labelledby", `practice-title-${index}`);
  panel.innerHTML = `<h3 id="practice-title-${index}">Extra practice · Question ${day3Indexes().indexOf(index) + 1}</h3>
    <p class="streak-count" role="status"></p><p class="practice-result" aria-live="polite"></p>`;
  panel.querySelector(".streak-count").textContent = `${state.streak}/3 right in a row · ${state.used}/10 used`;
  const result = panel.querySelector(".practice-result");
  const previous = record.review?.attempts.at(-1);
  if (previous) {
    result.textContent = previous.correct ? "✓ Correct!"
      : `Not quite. Correct answer: ${day3Banks[index][state.used - 1].answer}. Your streak starts again at 0.`;
  } else {
    result.textContent = record.firstTry === true
      ? "✓ Main question correct! That counts as 1. Get the next 2 right to master this question."
      : `Main question incorrect. Correct answer: ${activeQuestions()[index].answer}. Get 3 right in a row to master this question.`;
  }
  if (state.finished) {
    result.textContent += state.status === "mastered"
      ? " Mastered — you got 3 right in a row!"
      : " Unmastered — 10 extra questions finished without 3 right in a row.";
    card.append(panel);
    return;
  }
  if (record.review?.ready === false) {
    const next = document.createElement("button");
    next.type = "button";
    next.className = "next-practice";
    next.textContent = `Next practice question (${state.used + 1}/10)`;
    next.addEventListener("click", () => {
      if (!mastery.next(record)) return;
      saveRecords();
      renderQuestionState(card, index);
      focusPractice(card);
    });
    panel.append(next);
    card.append(panel);
    return;
  }
  const question = day3Banks[index][state.used];
  const content = document.createElement("div");
  content.innerHTML = `<p class="practice-number">Practice ${state.used + 1} of 10</p><p class="expression"></p>
    <form><label id="practice-label-${index}" for="practice-answer-${index}">Your answer</label>
    <div class="answer-row"><input id="practice-answer-${index}" autocomplete="off" aria-describedby="practice-error-${index}" /><button type="submit">Check</button></div></form>
    <p class="practice-error" id="practice-error-${index}" aria-live="polite"></p>`;
  renderExpression(content.querySelector(".expression"), question);
  const form = content.querySelector("form");
  const input = content.querySelector("input");
  const label = content.querySelector("label");
  const numeric = typeof question.answer === "number";
  input.type = numeric ? "number" : "text";
  input.step = numeric && Number.isInteger(question.answer) ? "1" : "any";
  input.inputMode = numeric ? Number.isInteger(question.answer) ? "numeric" : "decimal" : "text";
  label.textContent = question.choices ? "Choose one answer" : question.kind === "fraction" ? "Missing numerator" : "Your answer";
  if (question.choices) {
    content.querySelector(".answer-row").hidden = true;
    input.hidden = true;
    label.htmlFor = "";
    const choices = document.createElement("div");
    choices.className = "choice-grid";
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-labelledby", label.id);
    question.choices.forEach(value => {
      const choice = document.createElement("button");
      choice.type = "button";
      choice.className = "choice-option";
      choice.textContent = String(value);
      choice.addEventListener("click", () => { input.value = String(value); form.requestSubmit(); });
      choices.append(choice);
    });
    form.append(choices);
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    const typed = input.value.trim();
    if (!typed) {
      content.querySelector(".practice-error").textContent = "Enter an answer before checking.";
      input.focus();
      return;
    }
    if (!mastery.submit(record, typed, day3Banks[index], isCorrectAnswer)) return;
    saveRecords();
    renderQuestionState(card, index);
    updateProgress();
    focusPractice(card);
  });
  panel.append(content);
  card.append(panel);
}

function focusPractice(card) {
  const panel = card.querySelector(".mastery-practice");
  const control = panel?.querySelector(".next-practice, .choice-option:not(:disabled), input:not([hidden]):not(:disabled)");
  if (control) control.focus();
  else if (panel) { panel.tabIndex = -1; panel.focus(); }
}

function renderSetButtons() {
  setButtons.forEach((button) => {
    const setNumber = Number(button.dataset.set);
    const selected = setNumber === activeSet;
    const stats = recordStats(setNumber);
    const count = questionCount(setNumber);
    const isComplete = stats.finished === count;
    const scoreValue = scoreOutOf100(stats, count);
    button.classList.toggle("active", selected);
    button.classList.toggle("completed", isComplete);
    button.classList.toggle("has-unmastered", isComplete && stats.unmastered > 0);
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", `${dayLabel(setNumber)}, ${count} questions${isComplete ? `, completed, first-try score ${scoreValue} out of 100` : ""}`);
    button.textContent = dayLabel(setNumber);
    if (isComplete) {
      const status = document.createElement("span");
      status.className = "set-status";
      status.textContent = stats.unmastered ? `${stats.unmastered} unmastered` : "✓ Done";
      const score = document.createElement("span");
      score.className = "set-score";
      const scoreNumber = document.createElement("strong");
      scoreNumber.textContent = `${scoreValue}/100`;
      score.append("First try", scoreNumber);
      button.append(status, score);
    }
  });
}

function updateProgress() {
  const stats = recordStats(activeSet);
  const activeQuestionCount = questionCount(activeSet);
  const scoreValue = scoreOutOf100(stats, activeQuestionCount);
  firstTryScore.textContent = String(scoreValue);
  attemptSummary.textContent = `${stats.right} right · ${stats.wrong} wrong`;
  solvedSummary.textContent = activeSet === DAY3_SET
    ? `${stats.solved}/${activeQuestionCount} mastered · ${stats.unmastered} unmastered · ${stats.answered}/${activeQuestionCount} main questions answered`
    : `${stats.solved}/${activeQuestionCount} solved · ${stats.answered}/${activeQuestionCount} first tries recorded`;
  fill.style.width = `${(stats.answered / activeQuestionCount) * 100}%`;

  const isComplete = stats.finished === activeQuestionCount;
  if (!isComplete && activeSet === DAY3_SET) activeRecord().completedAt = null;
  if (isComplete && !activeRecord().completedAt) {
    activeRecord().completedAt = new Date().toISOString();
    saveRecords();
  }
  complete.hidden = !isComplete;
  completeTitle.textContent = activeSet === DAY3_SET && stats.unmastered
    ? `Day 3 finished · ${stats.unmastered} unmastered` : `${dayLabel(activeSet)} complete!`;
  const completedAt = formatCompletedAt(activeRecord().completedAt);
  finalScore.textContent = `First-try score: ${scoreValue}/100 · ${stats.right} right and ${stats.wrong} wrong${activeSet === DAY3_SET ? ` · ${stats.solved} mastered · ${stats.unmastered} unmastered` : ""}${completedAt ? ` · ${completedAt}` : ""}.`;
  renderSetButtons();
  updateDay3Progress();
}

function loadSet(setNumber) {
  activeSet = setNumber;
  const isDay3 = setNumber === DAY3_SET;
  document.body.classList.toggle("day3-mode", isDay3);
  for (const id of ["day3-guide", "day3-progress", "day3-question-nav"]) document.querySelector(`#${id}`).hidden = !isDay3;
  if (isDay3 && !day3Indexes().includes(activeDay3Index)) {
    activeDay3Index = day3Indexes().find(index => !mastery.progress(records[DAY3_SET].questions[index]).finished) ?? day3Indexes()[0];
  }
  const questions = activeQuestions();
  questionGrid.setAttribute(
    "aria-label",
    `${questionCount(setNumber)} math questions in ${dayLabel(setNumber)}`,
  );

  let displayNumber = 0;
  cards.forEach((card, index) => {
    card.querySelector(".mastery-practice")?.remove();
    card.querySelector(".mastery-badge")?.remove();
    const question = questions[index];
    card.hidden = !question || question.removed || (isDay3 && index !== activeDay3Index);
    if (!question || question.removed) return;
    displayNumber += 1;
    if (card.hidden) return;
    card.querySelector(".number").textContent = String(displayNumber);
    const input = card.querySelector("input");
    const label = card.querySelector("label");
    const numericAnswer = typeof question.answer === "number";
    input.type = numericAnswer ? "number" : "text";
    input.step = numericAnswer && Number.isInteger(question.answer) ? "1" : "any";
    input.inputMode = numericAnswer
      ? Number.isInteger(question.answer) ? "numeric" : "decimal"
      : "text";
    label.id = `choice-label-${index + 1}`;
    label.htmlFor = question.choices ? "" : input.id;
    label.textContent = question.choices
      ? "Choose one answer"
      : question.kind === "decimalFraction"
        ? "Type a fraction (example: 1/5)"
        : question.kind === "placeValue"
          ? "Type the place value"
          : question.kind === "fraction"
            ? "Missing numerator"
            : "Your answer";
    card.querySelector(".skill").textContent = question.skill;
    renderExpression(card.querySelector(".expression"), question);
    renderQuestionState(card, index);
  });

  updateProgress();
  const firstOpenCard = cards.find(
    (card, index) =>
      !card.hidden &&
      !activeQuestions()[index]?.removed &&
      activeRecord().questions[index] &&
      !(activeSet === DAY3_SET ? mastery.progress(activeRecord().questions[index]).finished : activeRecord().questions[index].solved),
  );
  firstOpenCard
    ?.querySelector(".next-practice, .choice-option:not(:disabled), input:not([hidden]):not(:disabled)")
    ?.focus();
}

cards.forEach((card, index) => {
  const form = card.querySelector("form");
  const input = card.querySelector("input");
  const button = card.querySelector("button[type='submit']");
  const feedback = card.querySelector(".feedback");

  input.addEventListener("input", () => {
    const question = activeRecord().questions[index];
    if (!question || activeQuestions()[index]?.removed) return;
    feedback.textContent =
      question.firstTry === false
        ? feedbackFor(question)
        : "Check your answer when you are ready.";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = activeRecord().questions[index];
    const activeQuestion = activeQuestions()[index];
    if (card.hidden || !question || !activeQuestion || activeQuestion.removed ||
      (activeSet === DAY3_SET ? question.firstTry !== null : question.solved)) return;
    const typed = input.value.trim();
    if (!typed) {
      feedback.textContent = "Enter an answer before checking.";
      input.focus();
      return;
    }

    const isRight = isCorrectAnswer(typed, activeQuestion);
    if (question.firstTry === null) question.firstTry = isRight;
    question.attempts += 1;
    question.lastAnswer = typed;
    if (isRight) question.solved = true;

    saveRecords();
    renderQuestionState(card, index);
    if (activeSet === DAY3_SET) {
      focusPractice(card);
    } else if (!isRight && !activeQuestion.choices) {
      input.focus();
      input.select();
    }
    updateProgress();
  });
});

setButtons.forEach((button) => {
  button.addEventListener("click", () => loadSet(Number(button.dataset.set)));
});
document.querySelector("#day3-previous").addEventListener("click", () => moveDay3Question(-1));
document.querySelector("#day3-next").addEventListener("click", () => moveDay3Question(1));

loadSet(SET_NUMBERS[0]);

const isLocalPreview = location.hostname === "127.0.0.1" || location.hostname === "localhost";
if (window.MarcoOnlineSync && !isLocalPreview) {
  sync = window.MarcoOnlineSync.create({
    appId: APP_ID,
    studentName: "Harry",
    validate: isValidRecords,
    score: syncScore,
    onRemote(remote) {
      records = normalizeRecords(remote);
      if (!receivedRemote || activeSet !== DAY3_SET) activeDay3Index = null;
      receivedRemote = true;
      // Keep the synced snapshot intact: adding empty sets is not an offline edit.
      storeRecords(remote);
      loadSet(activeSet);
    },
  });
  void sync.start(isValidRecords(savedRecords) ? savedRecords : records);
}
