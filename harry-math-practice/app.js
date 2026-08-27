const questionSets = {
  3: [
    { left: 326, operator: "×", right: 3, answer: 978, skill: "Multiply" },
    { left: 403, operator: "×", right: 4, answer: 1612, skill: "Multiply" },
    { left: 245, operator: "×", right: 3, answer: 735, skill: "Multiply" },
    { left: 465, operator: "÷", right: 5, answer: 93, skill: "Divide" },
    { left: 786, operator: "÷", right: 2, answer: 393, skill: "Divide" },
    { left: 324, operator: "+", right: 358, answer: 682, skill: "Add" },
    { left: 79, operator: "+", right: 64, answer: 143, skill: "Add" },
    { left: 260, operator: "−", right: 87, answer: 173, skill: "Subtract" },
    { left: 500, operator: "−", right: 268, answer: 232, skill: "Subtract" },
    { left: 810, operator: "−", right: 486, answer: 324, skill: "Subtract" },
    { numerator: 11, denominator: 5, equivalentDenominator: 35, answer: 77, skill: "Equivalent Fraction", kind: "fraction" },
    { numerator: 7, denominator: 4, equivalentDenominator: 28, answer: 49, skill: "Equivalent Fraction", kind: "fraction" },
    { numerator: 13, denominator: 6, equivalentDenominator: 42, answer: 91, skill: "Equivalent Fraction", kind: "fraction" },
    { numerator: 9, denominator: 8, equivalentDenominator: 56, answer: 63, skill: "Equivalent Fraction", kind: "fraction" },
  ],
  4: [
    { left: 318, operator: "×", right: 3, answer: 954, skill: "Multiply" },
    { left: 432, operator: "×", right: 4, answer: 1728, skill: "Multiply" },
    { left: 227, operator: "×", right: 3, answer: 681, skill: "Multiply" },
    { left: 475, operator: "÷", right: 5, answer: 95, skill: "Divide" },
    { left: 918, operator: "÷", right: 2, answer: 459, skill: "Divide" },
    { left: 536, operator: "+", right: 147, answer: 683, skill: "Add" },
    { left: 87, operator: "+", right: 56, answer: 143, skill: "Add" },
    { left: 270, operator: "−", right: 98, answer: 172, skill: "Subtract" },
    { left: 620, operator: "−", right: 347, answer: 273, skill: "Subtract" },
    { left: 900, operator: "−", right: 578, answer: 322, skill: "Subtract" },
    { numerator: 5, denominator: 3, equivalentDenominator: 21, answer: 35, skill: "Equivalent Fraction", kind: "fraction" },
    { numerator: 12, denominator: 7, equivalentDenominator: 35, answer: 60, skill: "Equivalent Fraction", kind: "fraction" },
    { numerator: 7, denominator: 9, equivalentDenominator: 63, answer: 49, skill: "Equivalent Fraction", kind: "fraction" },
    { numerator: 15, denominator: 4, equivalentDenominator: 32, answer: 120, skill: "Equivalent Fraction", kind: "fraction" },
  ],
};

const STORAGE_KEY = "harry-math-practice-record-v1";
const SET_NUMBERS = Object.keys(questionSets).map(Number);
const cards = [...document.querySelectorAll("[data-question]")];
const firstTryScore = document.querySelector("#first-try-score");
const attemptSummary = document.querySelector("#attempt-summary");
const solvedSummary = document.querySelector("#solved-summary");
const fill = document.querySelector("#score-fill");
const complete = document.querySelector("#complete-card");
const completeTitle = document.querySelector("#complete-title");
const finalScore = document.querySelector("#final-score");
const recordGrid = document.querySelector("#record-grid");
const setButtons = [...document.querySelectorAll(".set-button")];
let activeSet = SET_NUMBERS[0];

function emptyQuestionRecord() {
  return { firstTry: null, attempts: 0, solved: false, lastAnswer: "" };
}

function normalizeQuestionRecord(value) {
  return {
    firstTry: typeof value?.firstTry === "boolean" ? value.firstTry : null,
    attempts: Number.isInteger(value?.attempts) && value.attempts > 0 ? value.attempts : 0,
    solved: value?.solved === true,
    lastAnswer: typeof value?.lastAnswer === "string" ? value.lastAnswer : "",
  };
}

function loadRecords() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    saved = {};
  }

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
                ? normalizeQuestionRecord(savedQuestions[questionIndex])
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

const records = loadRecords();

function saveRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Practice still works when browser storage is unavailable.
  }
}

function activeQuestions() {
  return questionSets[activeSet];
}

function activeRecord() {
  return records[activeSet];
}

function recordStats(setNumber) {
  const questions = records[setNumber].questions;
  return {
    answered: questions.filter((question) => question.firstTry !== null).length,
    right: questions.filter((question) => question.firstTry === true).length,
    wrong: questions.filter((question) => question.firstTry === false).length,
    solved: questions.filter((question) => question.solved).length,
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

  if (question.kind === "fraction") {
    element.classList.add("fraction-expression");
    element.append(
      makeFraction(question.numerator, question.denominator),
      " = ",
      makeFraction(null, question.equivalentDenominator, true),
    );
    return;
  }

  element.classList.remove("fraction-expression");
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

function feedbackFor(question) {
  if (question.solved && question.firstTry === true) {
    return "✓ Solved — right on the first try.";
  }
  if (question.solved) {
    return "✓ Solved — first try recorded as incorrect.";
  }
  if (question.firstTry === false) {
    return "First try recorded as incorrect. Recalculate and try again.";
  }
  return "Enter your answer when you are ready.";
}

function renderQuestionState(card, index) {
  const question = activeRecord().questions[index];
  const input = card.querySelector("input");
  const button = card.querySelector("button[type='submit']");
  const feedback = card.querySelector(".feedback");

  card.classList.toggle("right", question.solved);
  card.classList.toggle("wrong", question.firstTry === false && !question.solved);
  input.value = question.lastAnswer;
  input.disabled = question.solved;
  button.disabled = question.solved;
  button.textContent = question.solved ? "Solved" : "Check";
  feedback.textContent = feedbackFor(question);
}

function renderRecordSummary() {
  recordGrid.replaceChildren();
  for (const setNumber of SET_NUMBERS) {
    const stats = recordStats(setNumber);
    const questionCount = questionSets[setNumber].length;
    const completedAt = formatCompletedAt(records[setNumber].completedAt);
    const scoreValue = scoreOutOf100(stats, questionCount);
    const item = document.createElement("div");
    item.className = "record-item";
    if (setNumber === activeSet) item.classList.add("active");

    const label = document.createElement("strong");
    label.textContent = `Set ${setNumber}`;
    const score = document.createElement("span");
    score.textContent = completedAt
      ? `Score: ${scoreValue}/100`
      : stats.answered
        ? `In progress · ${stats.answered}/${questionCount} scored`
        : "Not started";
    const detail = document.createElement("small");
    detail.textContent = completedAt
      ? `Completed ${completedAt}`
      : `${stats.right} right · ${stats.wrong} wrong · ${stats.solved} solved`;
    item.append(label, score, detail);
    recordGrid.append(item);
  }
}

function updateProgress() {
  const stats = recordStats(activeSet);
  const questionCount = activeQuestions().length;
  const scoreValue = scoreOutOf100(stats, questionCount);
  firstTryScore.textContent = String(scoreValue);
  attemptSummary.textContent = `${stats.right} right · ${stats.wrong} wrong`;
  solvedSummary.textContent = `${stats.solved}/${questionCount} solved · ${stats.answered}/${questionCount} first tries recorded`;
  fill.style.width = `${(stats.answered / questionCount) * 100}%`;

  const isComplete = stats.solved === activeQuestions().length;
  if (isComplete && !activeRecord().completedAt) {
    activeRecord().completedAt = new Date().toISOString();
    saveRecords();
  }
  complete.hidden = !isComplete;
  completeTitle.textContent = `Set ${activeSet} complete!`;
  const completedAt = formatCompletedAt(activeRecord().completedAt);
  finalScore.textContent = `Final score: ${scoreValue}/100 · ${stats.right} right and ${stats.wrong} wrong${completedAt ? ` · ${completedAt}` : ""}.`;
  renderRecordSummary();
}

function loadSet(setNumber) {
  activeSet = setNumber;
  const questions = activeQuestions();

  cards.forEach((card, index) => {
    card.querySelector(".skill").textContent = questions[index].skill;
    renderExpression(card.querySelector(".expression"), questions[index]);
    renderQuestionState(card, index);
  });

  setButtons.forEach((button) => {
    const selected = Number(button.dataset.set) === activeSet;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  updateProgress();
  const firstOpenCard = cards.find(
    (_, index) => !activeRecord().questions[index].solved,
  );
  firstOpenCard?.querySelector("input").focus();
}

cards.forEach((card, index) => {
  const form = card.querySelector("form");
  const input = card.querySelector("input");
  const button = card.querySelector("button[type='submit']");
  const feedback = card.querySelector(".feedback");

  input.addEventListener("input", () => {
    const question = activeRecord().questions[index];
    if (card.classList.contains("wrong")) card.classList.remove("wrong");
    feedback.textContent =
      question.firstTry === false
        ? "First try is saved as incorrect. Recalculate, then check again."
        : "Check your answer when you are ready.";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const typed = input.value.trim();
    if (!typed) {
      card.classList.add("wrong");
      feedback.textContent = "Enter an answer before checking.";
      input.focus();
      return;
    }

    const question = activeRecord().questions[index];
    const isRight = Number(typed) === activeQuestions()[index].answer;
    if (question.firstTry === null) question.firstTry = isRight;
    question.attempts += 1;
    question.lastAnswer = typed;
    if (isRight) question.solved = true;

    saveRecords();
    card.classList.toggle("right", isRight);
    card.classList.toggle("wrong", !isRight);

    if (isRight) {
      input.disabled = true;
      button.disabled = true;
      button.textContent = "Solved";
      feedback.textContent = feedbackFor(question);
    } else {
      feedback.textContent =
        "First try recorded as incorrect. Recalculate and try again.";
      input.focus();
      input.select();
    }
    updateProgress();
  });
});

setButtons.forEach((button) => {
  button.addEventListener("click", () => loadSet(Number(button.dataset.set)));
});

loadSet(SET_NUMBERS[0]);
