const questionSets = {
  1: [
    [254, "×", 3, 762, "Multiply"],
    [421, "×", 4, 1684, "Multiply"],
    [236, "×", 3, 708, "Multiply"],
    [435, "÷", 5, 87, "Divide"],
    [846, "÷", 2, 423, "Divide"],
    [431, "+", 268, 699, "Add"],
    [57, "+", 86, 143, "Add"],
    [240, "−", 68, 172, "Subtract"],
    [330, "−", 249, 81, "Subtract"],
    [650, "−", 328, 322, "Subtract"],
  ],
  2: [
    [312, "×", 3, 936, "Multiply"],
    [234, "×", 4, 936, "Multiply"],
    [208, "×", 3, 624, "Multiply"],
    [455, "÷", 5, 91, "Divide"],
    [964, "÷", 2, 482, "Divide"],
    [512, "+", 176, 688, "Add"],
    [68, "+", 75, 143, "Add"],
    [250, "−", 76, 174, "Subtract"],
    [410, "−", 286, 124, "Subtract"],
    [720, "−", 394, 326, "Subtract"],
  ],
  3: [
    [326, "×", 3, 978, "Multiply"],
    [403, "×", 4, 1612, "Multiply"],
    [245, "×", 3, 735, "Multiply"],
    [465, "÷", 5, 93, "Divide"],
    [786, "÷", 2, 393, "Divide"],
    [324, "+", 358, 682, "Add"],
    [79, "+", 64, 143, "Add"],
    [260, "−", 87, 173, "Subtract"],
    [500, "−", 268, 232, "Subtract"],
    [810, "−", 486, 324, "Subtract"],
  ],
  4: [
    [318, "×", 3, 954, "Multiply"],
    [432, "×", 4, 1728, "Multiply"],
    [227, "×", 3, 681, "Multiply"],
    [475, "÷", 5, 95, "Divide"],
    [918, "÷", 2, 459, "Divide"],
    [536, "+", 147, 683, "Add"],
    [87, "+", 56, 143, "Add"],
    [270, "−", 98, 172, "Subtract"],
    [620, "−", 347, 273, "Subtract"],
    [900, "−", 578, 322, "Subtract"],
  ],
};

const STORAGE_KEY = "harry-math-practice-record-v1";
const SET_COUNT = Object.keys(questionSets).length;
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
let activeSet = 1;

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
    Array.from({ length: SET_COUNT }, (_, index) => {
      const setNumber = index + 1;
      const savedQuestions = Array.isArray(saved[setNumber]?.questions)
        ? saved[setNumber].questions
        : [];
      return [
        setNumber,
        {
          questions: Array.from({ length: 10 }, (_, questionIndex) =>
            savedQuestions[questionIndex]
              ? normalizeQuestionRecord(savedQuestions[questionIndex])
              : emptyQuestionRecord(),
          ),
          completedAt:
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

function renderExpression(element, question) {
  const [left, operator, right] = question;
  element.replaceChildren();
  element.append(`${left} `);

  if (operator === "÷") {
    const division = document.createElement("span");
    division.className = "division-mark";
    division.setAttribute("aria-label", "divided by");
    division.textContent = "÷";
    element.append(division);
  } else {
    element.append(operator);
  }

  const equals = document.createElement("span");
  equals.textContent = "=";
  element.append(` ${right} `, equals);
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
  for (let setNumber = 1; setNumber <= SET_COUNT; setNumber += 1) {
    const stats = recordStats(setNumber);
    const item = document.createElement("div");
    item.className = "record-item";
    if (setNumber === activeSet) item.classList.add("active");

    const label = document.createElement("strong");
    label.textContent = `Set ${setNumber}`;
    const score = document.createElement("span");
    score.textContent = stats.answered ? `${stats.right}/10 first try` : "Not started";
    const detail = document.createElement("small");
    detail.textContent = `${stats.right} right · ${stats.wrong} wrong · ${stats.solved} solved`;
    item.append(label, score, detail);
    recordGrid.append(item);
  }
}

function updateProgress() {
  const stats = recordStats(activeSet);
  firstTryScore.textContent = String(stats.right);
  attemptSummary.textContent = `${stats.right} right · ${stats.wrong} wrong`;
  solvedSummary.textContent = `${stats.solved}/10 solved · ${stats.answered}/10 first tries recorded`;
  fill.style.width = `${stats.answered * 10}%`;

  const isComplete = stats.solved === activeQuestions().length;
  if (isComplete && !activeRecord().completedAt) {
    activeRecord().completedAt = new Date().toISOString();
    saveRecords();
  }
  complete.hidden = !isComplete;
  completeTitle.textContent = `Set ${activeSet} complete!`;
  finalScore.textContent = `First-try score: ${stats.right}/10 — ${stats.right} right and ${stats.wrong} wrong.`;
  renderRecordSummary();
}

function loadSet(setNumber) {
  activeSet = setNumber;
  const questions = activeQuestions();

  cards.forEach((card, index) => {
    card.querySelector(".skill").textContent = questions[index][4];
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
    const isRight = Number(typed) === activeQuestions()[index][3];
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

loadSet(1);
