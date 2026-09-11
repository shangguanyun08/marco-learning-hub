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
    { left: 236, operator: "×", right: 3, answer: 708, skill: "Multiply", removed: true },
    { left: 845, operator: "÷", right: 5, answer: 169, skill: "Divide" },
    { left: 936, operator: "÷", right: 2, answer: 468, skill: "Divide", removed: true },
    { left: 367, operator: "+", right: 428, answer: 795, skill: "Add" },
    { left: 830, operator: "−", right: 356, answer: 474, skill: "Subtract" },
    { left: 704, operator: "−", right: 289, answer: 415, skill: "Subtract", removed: true },
    { prompt: "Which fraction is equal to 0.4?", decimal: 0.4, answer: "2/5", choices: ["1/4", "2/5", "4/5", "4/100"], skill: "Decimal to Fraction", kind: "decimalFraction" },
    { prompt: "Which fraction is equal to 0.75?", decimal: 0.75, answer: "3/4", choices: ["1/4", "1/2", "3/4", "4/5"], skill: "Decimal to Fraction", kind: "decimalFraction", removed: true },
    { prompt: "In what place is the digit 6 in 524.68?", answer: "tenths", choices: ["ones", "tenths", "hundredths", "thousandths"], accepted: ["tenth", "tenths place", "tenth place"], skill: "Decimal Place Value", kind: "placeValue", removed: true },
    { prompt: "In what place is the digit 2 in 381.024?", answer: "hundredths", choices: ["tenths", "hundredths", "thousandths", "ones"], accepted: ["hundredth", "hundredths place", "hundredth place"], skill: "Decimal Place Value", kind: "placeValue", removed: true },
    { left: 0.53, operator: "×", right: 0.2, answer: 0.106, choices: [0.73, 0.0106, 0.106, 1.06], skill: "Decimal Multiply" },
    { left: 0.42, operator: "×", right: 0.3, answer: 0.126, choices: [0.126, 0.72, 1.26, 0.0126], skill: "Decimal Multiply", removed: true },
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
const starEntries = globalThis.HarryStarMastery.entries;
const PARENT_CONFIRMED_QUESTIONS = new Set([0, 3]); // Current Q1 and Q2, confirmed by Harry's parent.
questionSets[DAY3_SET].push(...starEntries.map(entry => entry.question));
const day3Banks = [...mastery.createBanks(questionSets[DAY3_SET]), ...starEntries.map(entry => entry.followUps)];

const STORAGE_KEY = "harry-math-practice-record-v1";
const APP_ID = "harry-math-practice-v1";
const SET_NUMBERS = Object.keys(questionSets).map(Number);
// Display days from 1 while retaining the original set IDs used by saved work.
function dayLabel(setNumber) {
  return setNumber === DAY3_SET ? "Practice session" : `Day ${SET_NUMBERS.indexOf(setNumber) + 1}`;
}

const questionGrid = document.querySelector(".question-grid");
const cards = [...document.querySelectorAll("[data-question]")];
while (cards.length < Math.max(...Object.values(questionSets).map(questions => questions.length))) {
  const card = cards[0].cloneNode(true);
  const number = cards.length + 1;
  card.dataset.question = String(number);
  card.hidden = true;
  card.querySelector("input").id = `answer-${number}`;
  card.querySelector("label").htmlFor = `answer-${number}`;
  card.querySelector(".feedback").id = `feedback-${number}`;
  questionGrid.append(card);
  cards.push(card);
}
const firstTryScore = document.querySelector("#first-try-score");
const attemptSummary = document.querySelector("#attempt-summary");
const solvedSummary = document.querySelector("#solved-summary");
const fill = document.querySelector("#score-fill");
const complete = document.querySelector("#complete-card");
const completeTitle = document.querySelector("#complete-title");
const finalScore = document.querySelector("#final-score");
let activeSet = DAY3_SET;
let activeDay3Index = null;
const day3Drafts = new Map();
const correctionDrafts = new Map();
let receivedRemote = false;

function day3Indexes() {
  return questionSets[DAY3_SET].map((question, index) => question.removed ? -1 : index).filter(index => index !== -1);
}

function firstUnfinishedDay3Position() {
  const indexes = day3Indexes();
  const firstUnfinished = indexes.findIndex(index => !mastery.progress(records[DAY3_SET].questions[index]).finished);
  return firstUnfinished === -1 ? indexes.length - 1 : firstUnfinished;
}

function canPracticeDay3Question(index) {
  return day3Indexes().includes(index);
}

function canOpenDay3Question(index) {
  return day3Indexes().includes(index);
}

function lightStep(status, label, description) {
  const step = document.createElement("li");
  step.className = `light-step ${status}`;
  step.setAttribute("aria-label", description);
  step.title = description;
  const lamp = document.createElement("span");
  lamp.className = "track-lamp";
  lamp.setAttribute("aria-hidden", "true");
  lamp.textContent = { correct: "✓", corrected: "✓", incorrect: "×", practicing: "◔", pending: "·" }[status];
  const caption = document.createElement("span");
  caption.className = "light-caption";
  caption.textContent = label;
  step.append(lamp, caption);
  return step;
}

function correctionQuestion(questionIndex, position) {
  const number = day3Indexes().indexOf(questionIndex) + 1;
  if (number < 3 || number > 15 || !Number.isInteger(position) || position < 0) return null;
  const original = position === 0 ? questionSets[DAY3_SET][questionIndex] : day3Banks[questionIndex]?.[position - 1];
  if (!original) return null;
  const question = {...original, response: {kind: "number", unit: ""}};
  delete question.choices;
  delete question.choicesHtml;
  if (number === 5) {
    question.response = {kind: "fraction"};
  } else if (number === 7) {
    question.response = {kind: "ratio"};
    question.promptHtml = original.promptHtml.replace(/Which ratio is equivalent[^?]*\?/, "Write an equivalent ratio in simplest form.");
  } else if (number === 11) {
    const parts = original.promptHtml.match(/digit <strong>(\d)<\/strong> in (?:the number )?<strong>([\d.]+)<\/strong>/);
    const places = {ones: 1, tens: 10, hundreds: 100, tenths: 0.1, hundredths: 0.01, thousandths: 0.001};
    if (!parts || !Object.hasOwn(places, original.answer)) return null;
    question.answer = String(places[original.answer]);
    question.promptHtml = `Look at the digit <strong>${parts[1]}</strong> in <strong>${parts[2]}</strong>. What would a <strong>1</strong> in that same place be worth?`;
    question.explanation = `A 1 in the ${original.answer} place is worth ${question.answer}.`;
  } else if (number === 14) {
    question.response = {kind: "remainder"};
  } else {
    question.response.unit = {8: "quarts", 10: "points per game", 13: "kg"}[number] || "";
    question.answer = String(original.answer).replaceAll(",", "");
    if (number === 12) {
      question.promptHtml = original.promptHtml.replace(/^Estimate:/, "Estimate by rounding each mixed number to the nearest whole number:");
    }
  }
  return question;
}

function savedAnswerDetails(questionIndex, position) {
  if (!Number.isInteger(position) || position < 0 || !day3Indexes().includes(questionIndex)) return null;
  const record = records[DAY3_SET].questions[questionIndex];
  const attempt = position === 0 ? { correct: record.firstTry, answer: record.attempts === 1 ? record.lastAnswer : null }
    : record.review?.attempts[position - 1];
  const question = position === 0 ? questionSets[DAY3_SET][questionIndex] : day3Banks[questionIndex]?.[position - 1];
  if (!question || !attempt || typeof attempt.correct !== "boolean") return null;
  return { question, answer: attempt.answer, correct: attempt.correct, number: day3Indexes().indexOf(questionIndex) + 1,
    retryQuestion: attempt.correct ? null : correctionQuestion(questionIndex, position),
    correction: record.corrections?.[position] || null,
    label: position === 0 ? "Main question" : `Practice question ${position}` };
}

function saveCorrection(questionIndex, position, answer) {
  const details = savedAnswerDetails(questionIndex, position);
  if (!details?.retryQuestion || details.correction || !isCorrectAnswer(answer, details.retryQuestion)) return false;
  const record = records[DAY3_SET].questions[questionIndex];
  record.corrections ||= {};
  record.corrections[position] = {answer, createdAt: new Date().toISOString()};
  correctionDrafts.delete(`${questionIndex}:${position}`);
  saveRecords();
  const track = cards[questionIndex]?.querySelector(".answer-track");
  if (track) track.replaceWith(renderAnswerTrack(record, questionIndex));
  return true;
}

function openSavedAnswer(questionIndex, position, opener) {
  const details = savedAnswerDetails(questionIndex, position);
  if (!details) return;
  document.querySelector("#answer-review")?.close();
  const dialog = document.createElement("dialog");
  dialog.id = "answer-review";
  dialog.className = "answer-review";
  dialog.dataset.questionIndex = String(questionIndex);
  dialog.dataset.position = String(position);
  dialog.setAttribute("aria-labelledby", "answer-review-title");
  const header = document.createElement("div");
  header.className = "answer-review-heading";
  const title = document.createElement("h2");
  title.id = "answer-review-title";
  title.textContent = `Question ${details.number} · ${details.label}`;
  const close = document.createElement("button");
  close.type = "button";
  close.className = "close-answer-review";
  close.textContent = "Back to practice";
  close.autofocus = true;
  close.addEventListener("click", () => dialog.close());
  header.append(title, close);
  const content = document.createElement("div");
  content.className = "answer-review-content";
  dialog.append(header, content);
  renderSavedAnswerContent(content, details, questionIndex, position);
  dialog.addEventListener("close", () => {
    const form = dialog.querySelector(".correction-form");
    if (form) correctionDrafts.set(`${questionIndex}:${position}`, answerDraft(form, details.retryQuestion));
    dialog.remove();
    const target = opener?.isConnected ? opener : cards[questionIndex]?.querySelector(`[data-review-position="${position}"]`);
    target?.focus();
  });
  document.body.append(dialog);
  dialog.showModal();
}

function renderSavedAnswerContent(content, details, questionIndex, position) {
  content.replaceChildren();
  const expression = document.createElement("div");
  expression.className = "expression";
  renderExpression(expression, details.retryQuestion || details.question);
  content.append(expression);
  if (details.retryQuestion && !details.correction) {
    const instruction = document.createElement("p");
    instruction.className = "correction-instruction";
    instruction.textContent = "Correct this question to turn its red mark yellow.";
    const form = document.createElement("form");
    form.className = "correction-form";
    form.innerHTML = `<label id="correction-label" for="correction-answer">Your answer</label>
      <div class="answer-row"><input id="correction-answer" autocomplete="off" aria-describedby="correction-feedback" /><button type="submit">Check</button></div>`;
    renderNumberEntry(form, details.retryQuestion, correctionDrafts.get(`${questionIndex}:${position}`) || "");
    const feedback = document.createElement("p");
    feedback.id = "correction-feedback";
    feedback.className = "correction-feedback";
    feedback.setAttribute("aria-live", "polite");
    form.addEventListener("submit", event => {
      event.preventDefault();
      const {answer, error} = readAnswer(form, details.retryQuestion);
      if (error) {
        feedback.textContent = error;
        form.querySelector("input:not([hidden])")?.focus();
        return;
      }
      if (!saveCorrection(questionIndex, position, answer)) {
        feedback.textContent = "✗ Incorrect. Try again.";
        form.querySelector("input:not([hidden])")?.focus();
        return;
      }
      renderSavedAnswerContent(content, savedAnswerDetails(questionIndex, position), questionIndex, position);
      content.querySelector(".correction-status")?.focus();
    });
    content.append(instruction, form, feedback);
    return;
  }
  if (details.correction) {
    const status = document.createElement("p");
    status.className = "correction-status";
    status.tabIndex = -1;
    status.setAttribute("role", "status");
    status.textContent = "✓ Correct. This mark is now yellow.";
    content.append(status);
    return;
  }
  if (details.question.choices && !details.retryQuestion) {
    const choices = document.createElement("div");
    choices.className = "choice-grid saved-review-choices";
    details.question.choices.forEach((value, index) => {
      const item = document.createElement("div");
      item.className = "saved-review-choice";
      if (details.question.choicesHtml) item.innerHTML = details.question.choicesHtml[index];
      else item.textContent = String(value);
      const correct = isCorrectAnswer(String(value), details.question);
      const selected = typeof details.answer === "string" && String(value) === details.answer;
      item.classList.toggle("correct", correct);
      item.classList.toggle("selected-wrong", selected && !correct);
      if (correct || selected) {
        const label = document.createElement("strong");
        label.className = "saved-choice-result";
        label.textContent = correct ? (selected ? "✓ Harry’s answer · Correct" : "✓ Correct answer") : "× Harry’s answer";
        item.append(label);
      }
      choices.append(item);
    });
    content.append(choices);
  }
  const savedAnswer = document.createElement("p");
  savedAnswer.className = "saved-answer " + (details.correct ? "correct" : "incorrect");
  savedAnswer.textContent = typeof details.answer === "string" && details.answer.trim()
    ? `${details.correct ? "✓" : "×"} Harry’s answer: ${details.answer} · ${details.correct ? "Correct" : "Incorrect"}`
    : `His first answer was ${details.correct ? "correct" : "incorrect"}, but that original answer was not saved.`;
  content.append(savedAnswer, renderCorrectAnswer(details.retryQuestion || details.question));
}

function renderAnswerTrack(record, questionIndex) {
  const state = mastery.progress(record);
  if (state.credited && record.firstTry === null) {
    const track = document.createElement("section");
    track.className = "answer-track mastery-credit";
    track.textContent = "✓ Already mastered";
    return track;
  }
  const results = record.firstTry === null ? []
    : [record.firstTry, ...(record.review?.attempts || []).map(attempt => attempt.correct)];
  const track = document.createElement("section");
  track.className = "answer-track";
  track.setAttribute("aria-label", "Answer history for this main question");
  const heading = document.createElement("div");
  heading.className = "answer-track-heading";
  const title = document.createElement("strong");
  title.textContent = "Your answer track";
  const streak = document.createElement("span");
  streak.className = "visual-streak";
  streak.textContent = state.credited ? "Already mastered" : `${state.streak}/3 in a row`;
  heading.append(title, streak);
  const list = document.createElement("ol");
  list.className = "answer-lights";
  list.setAttribute("aria-label", "Checked answers in order");
  results.forEach((correct, position) => {
    const label = position === 0 ? "Main" : String(position);
    const name = position === 0 ? "Main answer" : `Follow-up ${position}`;
    const status = correct ? "correct" : record.corrections?.[position] ? "corrected" : "incorrect";
    const description = `${name}: ${status === "corrected" ? "corrected later" : status}`;
    const step = lightStep(status, label, description);
    step.classList.toggle("in-streak", correct && position >= results.length - state.streak);
    {
      const review = document.createElement("button");
      review.type = "button";
      review.className = "answer-history-button";
      review.dataset.reviewPosition = String(position);
      review.setAttribute("aria-label", `${status === "incorrect" && correctionQuestion(questionIndex, position) ? "Correct" : "Review"} ${name.toLowerCase()}: ${status === "corrected" ? "corrected later" : status}`);
      review.setAttribute("aria-haspopup", "dialog");
      review.append(...step.childNodes);
      review.addEventListener("click", () => openSavedAnswer(questionIndex, position, review));
      step.replaceChildren(review);
    }
    list.append(step);
  });
  const legend = document.createElement("p");
  legend.className = "light-legend";
  legend.textContent = correctionQuestion(questionIndex, 0)
    ? "Green: correct · Red: try again · Yellow: corrected later. Tap a mark."
    : "Tap any green or red answer to see the question and Harry’s answer.";
  track.append(heading);
  if (results.length) track.append(list, legend);
  return track;
}

function renderDay3TotalTrack() {
  const track = document.querySelector("#day3-total-track");
  track.replaceChildren();
  day3Indexes().forEach((index, position) => {
    const state = mastery.progress(records[DAY3_SET].questions[index]);
    const status = { mastered: "correct", unmastered: "incorrect", practicing: "practicing", unanswered: "pending" }[state.status];
    const statusDescription = { mastered: "mastered", unmastered: "unmastered", practicing: `in practice, ${state.streak} of 3 right in a row`, unanswered: "not started" }[state.status];
    const description = statusDescription;
    const step = lightStep(status, `Q${position + 1}`, `Question ${position + 1}: ${description}`);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "question-jump";
    button.disabled = false;
    button.dataset.questionIndex = String(index);
    button.setAttribute("aria-label", `Question ${position + 1}: ${questionSets[DAY3_SET][index].skill}, ${description}`);
    button.setAttribute("aria-controls", `answer-${index + 1}`);
    button.title = questionSets[DAY3_SET][index].skill;
    button.append(...step.childNodes);
    const skill = document.createElement("span");
    skill.className = "question-jump-skill";
    skill.textContent = questionSets[DAY3_SET][index].skill;
    button.append(skill);
    button.addEventListener("click", () => openDay3Question(index));
    if (index === activeDay3Index) button.setAttribute("aria-current", "step");
    step.append(button);
    if (index === activeDay3Index) { step.classList.add("current-question"); step.setAttribute("aria-current", "step"); }
    track.append(step);
  });
}

function updateDay3Progress() {
  if (activeSet !== DAY3_SET) return;
  const indexes = day3Indexes();
  const position = indexes.indexOf(activeDay3Index);
  document.querySelector("#day3-previous").disabled = !indexes.slice(0, position).some(canOpenDay3Question);
  document.querySelector("#day3-next").disabled = !canPracticeDay3Question(indexes[position + 1]);
  renderDay3TotalTrack();
}

function moveDay3Question(direction) {
  if (activeSet !== DAY3_SET) return;
  const indexes = day3Indexes();
  const position = indexes.indexOf(activeDay3Index);
  const target = direction < 0 ? indexes.slice(0, position).findLast(canOpenDay3Question) : indexes[position + direction];
  if (direction > 0 && !canPracticeDay3Question(target)) return;
  openDay3Question(target);
}

function openDay3Question(target) {
  if (activeSet !== DAY3_SET || !canOpenDay3Question(target)) return;
  captureDay3Draft();
  activeDay3Index = target;
  loadSet(DAY3_SET, false);
  cards[target].scrollIntoView?.({ block: "start", behavior: "instant" });
}

function captureDay3Draft() {
  if (activeSet !== DAY3_SET || activeDay3Index === null) return;
  const card = cards[activeDay3Index];
  const record = records[DAY3_SET].questions[activeDay3Index];
  if (record.firstTry === null) {
    day3Drafts.set(`${activeDay3Index}:main`, answerDraft(card.querySelector("form"), questionSets[DAY3_SET][activeDay3Index]));
  }
  const form = card.querySelector(".mastery-practice form");
  const used = mastery.progress(record).used;
  if (form) day3Drafts.set(`${activeDay3Index}:${used}`, answerDraft(form, day3Banks[activeDay3Index][used]));
}

function emptyQuestionRecord() {
  return { firstTry: null, attempts: 0, solved: false, lastAnswer: "" };
}

function normalizeCorrections(value, questionIndex, record) {
  const corrections = {};
  for (const [key, correction] of Object.entries(value && typeof value === "object" ? value : {})) {
    if (!/^(0|[1-9]\d*)$/.test(key)) continue;
    const position = Number(key);
    const question = correctionQuestion(questionIndex, position);
    const originalCorrect = position === 0 ? record.firstTry : record.review?.attempts[position - 1]?.correct;
    if (!question || originalCorrect !== false || typeof correction?.answer !== "string" ||
      !isCorrectAnswer(correction.answer, question) || typeof correction.createdAt !== "string" ||
      !Number.isFinite(Date.parse(correction.createdAt))) continue;
    corrections[position] = {answer: correction.answer, createdAt: correction.createdAt};
  }
  return Object.keys(corrections).length ? {corrections} : {};
}

function normalizeQuestionRecord(value, setNumber, questionIndex) {
  const confirmed = setNumber === DAY3_SET && PARENT_CONFIRMED_QUESTIONS.has(questionIndex);
  const record = {
    ...(confirmed ? { masteryCredit: "parent-confirmed" } : {}),
    firstTry: typeof value?.firstTry === "boolean" ? value.firstTry : null,
    attempts: Number.isInteger(value?.attempts) && value.attempts > 0 ? value.attempts : 0,
    solved: value?.solved === true,
    lastAnswer: typeof value?.lastAnswer === "string" ? value.lastAnswer : "",
    ...(setNumber === DAY3_SET ? {
      review: mastery.normalizeReview(value?.review, day3Banks[questionIndex], isCorrectAnswer, value?.firstTry),
      ...(typeof value?.masteredAt === "string" && Number.isFinite(Date.parse(value.masteredAt)) ? { masteredAt: value.masteredAt } : {}),
    } : {}),
  };
  if (setNumber === DAY3_SET) Object.assign(record, normalizeCorrections(value?.corrections, questionIndex, record));
  return record;
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
            (_, questionIndex) => normalizeQuestionRecord(savedQuestions[questionIndex], setNumber, questionIndex),
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
            + (question.review?.attempts.length || 0) + Object.keys(question.corrections || {}).length,
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
  element.classList.remove("fraction-expression", "prompt-expression", "rich-expression");

  if (question.promptHtml) {
    element.classList.add("rich-expression");
    element.innerHTML = `${question.promptHtml}${question.visualHtml || ""}`;
    return;
  }

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

function numberAnswerText(value, question) {
  const text = String(value).trim();
  const suffix = question.response?.unit ? ` ${question.response.unit}` : "";
  return suffix && text.toLowerCase().endsWith(suffix) ? text.slice(0, -suffix.length).trim() : text;
}

function parseNumberAnswer(value, question) {
  const text = numberAnswerText(value, question);
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function isCorrectAnswer(typed, question) {
  if (question.response?.kind === "ratio" || question.response?.kind === "remainder") {
    const separator = question.response.kind === "ratio" ? ":" : "R";
    const parts = typed.split(separator).map(part => part.trim());
    const expected = question.answer.split(separator).map(Number);
    return parts.length === 2 && parts.every((part, index) => /^\d+$/.test(part) && Number(part) === expected[index]);
  }
  if (question.response?.kind === "number") {
    const actual = parseNumberAnswer(typed, question);
    const expected = parseNumberAnswer(question.answer, question);
    return actual !== null && expected !== null && Math.abs(actual - expected) < 1e-10;
  }
  if (question.response?.kind === "fraction") {
    const actual = typed.replace(/\s/g, "").match(/^(-?\d+)\/(\d+)$/);
    const expected = question.answer.split("/").map(Number);
    return Boolean(actual && Number(actual[2]) > 0 &&
      Number(actual[1]) * expected[1] === expected[0] * Number(actual[2]));
  }
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

function renderCorrectAnswer(question, label = "Correct answer") {
  const correction = document.createElement("div");
  correction.className = "correct-answer";
  correction.setAttribute("role", "status");
  const heading = document.createElement("span");
  heading.textContent = label;
  const answer = document.createElement("strong");
  answer.textContent = String(question.answer);
  correction.append(heading, answer);
  if (question.explanation) {
    const explanation = document.createElement("p");
    explanation.textContent = question.explanation;
    correction.append(explanation);
  }
  return correction;
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

function answerDraft(form, question) {
  if (["ratio", "remainder"].includes(question.response?.kind)) {
    return [...form.querySelectorAll(".pair-input input")].map(input => input.value).join(question.response.kind === "ratio" ? ":" : " R");
  }
  if (question.response?.kind === "fraction") {
    return [...form.querySelectorAll(".fraction-input input")].map(input => input.value).join("/");
  }
  return form.querySelector("input").value;
}

function readAnswer(form, question) {
  const typed = answerDraft(form, question).trim();
  if (["ratio", "remainder"].includes(question.response?.kind)) {
    const parts = [...form.querySelectorAll(".pair-input input")].map(input => input.value);
    if (parts.some(part => !part)) return {error: "Fill in both number boxes before checking."};
    if (parts.some(part => !Number.isSafeInteger(Number(part)) || Number(part) < 0) ||
      (question.response.kind === "ratio" && Number(parts[1]) === 0)) {
      return {error: "Use whole numbers in both boxes."};
    }
    return {answer: parts.map(Number).join(question.response.kind === "ratio" ? ":" : " R")};
  }
  if (question.response?.kind === "fraction") {
    const [numerator, denominator] = typed.split("/");
    if (!numerator || !denominator) return {error: "Fill in both fraction boxes before checking."};
    if (!Number.isSafeInteger(Number(numerator)) || !Number.isSafeInteger(Number(denominator)) || Number(denominator) <= 0) {
      return {error: "Use whole numbers in both boxes, with a bottom number greater than 0."};
    }
    return {answer: `${Number(numerator)}/${Number(denominator)}`};
  }
  if (question.response?.kind === "number") {
    const number = parseNumberAnswer(typed, question);
    if (number === null) return {error: "Enter a number before checking."};
    return {answer: `${typed}${question.response.unit ? ` ${question.response.unit}` : ""}`};
  }
  return typed ? {answer: typed} : {error: "Enter an answer before checking."};
}

function renderNumberEntry(form, question, value, locked = false) {
  const input = form.querySelector("input");
  const row = form.querySelector(".answer-row");
  const label = form.querySelector("label");
  row.querySelector(".fraction-input")?.remove();
  row.querySelector(".pair-input")?.remove();
  row.querySelector(".answer-unit")?.remove();
  row.classList.remove("with-unit", "with-fraction", "with-pair");
  if (!question.response) return;
  form.noValidate = true;
  row.hidden = false;
  input.disabled = locked;
  if (["ratio", "remainder"].includes(question.response.kind)) {
    input.type = "hidden";
    input.hidden = true;
    const pair = document.createElement("span");
    pair.className = "pair-input";
    pair.setAttribute("role", "group");
    pair.setAttribute("aria-labelledby", label.id);
    const ratio = question.response.kind === "ratio";
    const parts = String(value).split(ratio ? ":" : "R");
    const names = ratio ? ["First number", "Second number"] : ["Quotient", "Remainder"];
    names.forEach((name, index) => {
      const fieldLabel = document.createElement("label");
      const field = document.createElement("input");
      field.id = `${input.id}-${index}`;
      fieldLabel.htmlFor = field.id;
      fieldLabel.textContent = name;
      field.type = "number";
      field.inputMode = "numeric";
      field.step = "1";
      field.autocomplete = "off";
      field.placeholder = "?";
      field.setAttribute("aria-describedby", input.getAttribute("aria-describedby") || "");
      field.value = parts[index]?.trim() || "";
      field.disabled = locked;
      fieldLabel.append(field);
      pair.append(fieldLabel);
      if (ratio && index === 0) {
        const colon = document.createElement("span");
        colon.className = "ratio-colon";
        colon.textContent = ":";
        pair.append(colon);
      }
    });
    pair.classList.toggle("ratio-input", ratio);
    input.after(pair);
    row.classList.add("with-pair");
    label.htmlFor = `${input.id}-0`;
    label.textContent = "Your answer · Fill in both boxes";
    return;
  }
  if (question.response.kind === "fraction") {
    input.type = "hidden";
    input.hidden = true;
    const fraction = document.createElement("span");
    fraction.className = "fraction-input";
    fraction.setAttribute("role", "group");
    fraction.setAttribute("aria-labelledby", label.id);
    const parts = String(value).split("/");
    ["numerator", "denominator"].forEach((name, index) => {
      const field = document.createElement("input");
      field.id = `${input.id}-${name}`;
      field.type = "number";
      field.inputMode = "numeric";
      field.step = "1";
      field.autocomplete = "off";
      field.placeholder = "?";
      field.setAttribute("aria-label", index ? "Denominator (bottom number)" : "Numerator (top number)");
      field.setAttribute("aria-describedby", input.getAttribute("aria-describedby") || form.nextElementSibling?.id || "");
      field.value = parts[index] || "";
      field.disabled = locked;
      fraction.append(field);
    });
    input.after(fraction);
    row.classList.add("with-fraction");
    label.htmlFor = `${input.id}-numerator`;
    label.textContent = "Your answer · Fill in both fraction boxes";
    return;
  }
  input.type = "number";
  input.hidden = false;
  input.step = "any";
  input.inputMode = "decimal";
  input.placeholder = "?";
  input.value = numberAnswerText(value, question);
  label.htmlFor = input.id;
  label.textContent = "Your answer · Type a number";
  if (question.response.unit) {
    const unit = document.createElement("span");
    unit.className = "answer-unit";
    unit.id = `${input.id}-unit`;
    unit.textContent = question.response.unit;
    input.setAttribute("aria-describedby", unit.id);
    input.after(unit);
    row.classList.add("with-unit");
  }
}

function renderChoiceOptions(card, index, question, record, locked = record.solved) {
  const form = card.querySelector("form");
  const input = card.querySelector("input");
  const answerRow = card.querySelector(".answer-row");
  form.querySelector(".choice-grid")?.remove();

  const hasChoices = Array.isArray(question.choices) && !question.response;
  answerRow.hidden = hasChoices;
  input.hidden = hasChoices;
  renderNumberEntry(form, question, input.value, locked);
  if (!hasChoices) return;

  const grid = document.createElement("div");
  grid.className = "choice-grid";
  grid.setAttribute("role", "group");
  grid.setAttribute("aria-labelledby", `choice-label-${index + 1}`);

  question.choices.forEach((choice, choiceIndex) => {
    const value = String(choice);
    const option = document.createElement("button");
    option.type = "button";
    option.className = "choice-option";
    if (question.choicesHtml) option.innerHTML = question.choicesHtml[choiceIndex];
    else option.textContent = value;
    option.dataset.value = value;
    option.disabled = locked;

    const selected = record.lastAnswer === value;
    option.classList.toggle("selected", selected);
    option.setAttribute("aria-pressed", String(selected));
    if (record.firstTry !== null && isCorrectAnswer(value, question)) {
      option.classList.add("correct");
    } else if (selected && record.firstTry === false) {
      option.classList.add("incorrect");
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
  const locked = isDay3 ? question.firstTry !== null || state.finished || !canPracticeDay3Question(index) : question.solved;

  card.classList.toggle("right", isDay3 ? state.status === "mastered" : question.solved);
  const needsRetry = question.firstTry === false && !question.solved;
  card.classList.toggle("retry", needsRetry && question.attempts < 2);
  card.classList.toggle("wrong", needsRetry && question.attempts >= 2);
  if (activeQuestion.response) input.type = "text";
  input.value = isDay3 && question.firstTry === null
    ? day3Drafts.get(`${index}:main`) ?? question.lastAnswer : question.lastAnswer;
  input.disabled = locked;
  button.disabled = locked;
  button.textContent = locked ? (isDay3 ? "Recorded" : "Solved") : "Check";
  feedback.textContent = feedbackFor(question);
  card.querySelector(".main-correct-answer")?.remove();
  if (!isDay3 && question.firstTry === false && !question.solved) {
    const correction = renderCorrectAnswer(activeQuestion);
    correction.classList.add("main-correct-answer");
    feedback.after(correction);
  }
  renderChoiceOptions(card, index, activeQuestion, question, locked);
  card.querySelector(".mastery-badge")?.remove();
  card.querySelector(".mastery-practice")?.remove();
  card.querySelector(".answer-track")?.remove();
  if (isDay3) {
    card.querySelector(".card-top").after(renderAnswerTrack(question, index));
    card.classList.toggle("retry", state.status === "practicing");
    card.classList.toggle("wrong", state.status === "unmastered");
    const badge = document.createElement("span");
    badge.className = `mastery-badge ${state.status}`;
    badge.textContent = { unanswered: "Not answered", practicing: "In practice", mastered: "Mastered", unmastered: "Unmastered" }[state.status];
    card.querySelector(".card-top").append(badge);
    if (state.credited) {
      feedback.textContent = "You already mastered this question. Choose another question when you are ready.";
      return;
    }
    feedback.textContent = question.firstTry === true
      ? "✓ Main question correct — 1 right in a row. Continue the practice to reach 3."
      : question.firstTry === false
        ? "Main question incorrect. First-try score is saved."
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
      : "Not quite. Your streak starts again at 0.";
  } else {
    result.textContent = record.firstTry === true
      ? "✓ Main question correct! That counts as 1. Get the next 2 right to master this question."
      : "Main question incorrect. Get 3 right in a row to master this question.";
  }
  if (state.finished) {
    result.textContent += state.status === "mastered"
      ? " Mastered — you got 3 right in a row!"
      : " Unmastered — 10 extra questions finished without 3 right in a row.";
    card.append(panel);
    return;
  }
  result.hidden = record.review?.ready !== false;
  if (record.review?.ready === false) {
    const next = document.createElement("button");
    next.type = "button";
    next.className = "next-practice";
    next.textContent = `Next practice question (${state.used + 1}/10)`;
    next.addEventListener("click", () => {
      if (activeSet !== DAY3_SET || card.hidden || !canPracticeDay3Question(index) || !mastery.next(record)) return;
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
  content.innerHTML = `<p class="practice-number">Practice ${state.used + 1} of 10</p><div class="expression"></div>
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
  input.value = day3Drafts.get(`${index}:${state.used}`) ?? "";
  label.textContent = question.choices ? "Choose one answer" : question.kind === "fraction" ? "Missing numerator" : "Your answer";
  renderNumberEntry(form, question, input.value);
  if (question.choices && !question.response) {
    content.querySelector(".answer-row").hidden = true;
    input.hidden = true;
    label.htmlFor = "";
    const choices = document.createElement("div");
    choices.className = "choice-grid";
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-labelledby", label.id);
    question.choices.forEach((value, choiceIndex) => {
      const choice = document.createElement("button");
      choice.type = "button";
      choice.className = "choice-option";
      if (question.choicesHtml) choice.innerHTML = question.choicesHtml[choiceIndex];
      else choice.textContent = String(value);
      choice.dataset.value = String(value);
      choice.addEventListener("click", () => { input.value = String(value); form.requestSubmit(); });
      choices.append(choice);
    });
    form.append(choices);
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    const {answer: typed, error} = readAnswer(form, question);
    if (error) {
      content.querySelector(".practice-error").textContent = error;
      form.querySelector("input:not([hidden]):not(:disabled)")?.focus();
      return;
    }
    if (activeSet !== DAY3_SET || card.hidden || !canPracticeDay3Question(index) || !mastery.submit(record, typed, day3Banks[index], isCorrectAnswer)) return;
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
    ? `Session finished · ${stats.unmastered} unmastered` : `${dayLabel(activeSet)} complete!`;
  const completedAt = formatCompletedAt(activeRecord().completedAt);
  finalScore.textContent = `First-try score: ${scoreValue}/100 · ${stats.right} right and ${stats.wrong} wrong${activeSet === DAY3_SET ? ` · ${stats.solved} mastered · ${stats.unmastered} unmastered` : ""}${completedAt ? ` · ${completedAt}` : ""}.`;
  updateDay3Progress();
}

function loadSet(setNumber, captureDraft = true) {
  if (captureDraft) captureDay3Draft();
  activeSet = setNumber;
  const isDay3 = setNumber === DAY3_SET;
  document.body.classList.toggle("day3-mode", isDay3);
  document.querySelector("#day3-question-nav").hidden = !isDay3;
  if (isDay3 && !canOpenDay3Question(activeDay3Index)) {
    activeDay3Index = day3Indexes()[firstUnfinishedDay3Position()];
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
    card.querySelector(".answer-track")?.remove();
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
    card.querySelector(".source-label")?.remove();
    if (question.sourceLabel) {
      const source = document.createElement("p");
      source.className = "source-label";
      source.textContent = question.sourceLabel;
      card.querySelector(".card-top").after(source);
    }
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
      (activeSet === DAY3_SET ? question.firstTry !== null || mastery.progress(question).finished || !canPracticeDay3Question(index) : question.solved)) return;
    const {answer: typed, error} = readAnswer(form, activeQuestion);
    if (error) {
      feedback.textContent = error;
      form.querySelector("input:not([hidden]):not(:disabled)")?.focus();
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

document.querySelector("#day3-previous").addEventListener("click", () => moveDay3Question(-1));
document.querySelector("#day3-next").addEventListener("click", () => moveDay3Question(1));

loadSet(DAY3_SET);

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
      const dialog = document.querySelector("#answer-review");
      if (dialog?.querySelector(".correction-form")) {
        const index = Number(dialog.dataset.questionIndex), position = Number(dialog.dataset.position);
        const details = savedAnswerDetails(index, position);
        if (details?.correction) {
          correctionDrafts.delete(`${index}:${position}`);
          renderSavedAnswerContent(dialog.querySelector(".answer-review-content"), details, index, position);
        }
      }
    },
  });
  void sync.start(isValidRecords(savedRecords) ? savedRecords : records);
}
