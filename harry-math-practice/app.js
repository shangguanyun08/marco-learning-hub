const questionSets = {
  1: [
    [263, "×", 3, 789, "Multiply"],
    [414, "×", 4, 1656, "Multiply"],
    [229, "×", 3, 687, "Multiply"],
    [485, "÷", 5, 97, "Divide"],
    [874, "÷", 2, 437, "Divide"],
    [442, "+", 257, 699, "Add"],
    [64, "+", 78, 142, "Add"],
    [280, "−", 96, 184, "Subtract"],
    [430, "−", 267, 163, "Subtract"],
    [760, "−", 438, 322, "Subtract"],
  ],
  2: [
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
  3: [
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
  4: [
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
  5: [
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

const cards = [...document.querySelectorAll("[data-question]")];
const solved = new Set();
const count = document.querySelector("#solved-count");
const fill = document.querySelector("#score-fill");
const complete = document.querySelector("#complete-card");
const completeTitle = document.querySelector("#complete-title");
const setButtons = [...document.querySelectorAll(".set-button")];
let activeSet = 1;

function activeQuestions() {
  return questionSets[activeSet];
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

function updateProgress() {
  count.textContent = String(solved.size);
  fill.style.width = `${solved.size * 10}%`;
  complete.hidden = solved.size !== activeQuestions().length;
  completeTitle.textContent = `You solved all 10 in Set ${activeSet}!`;
}

function resetPractice() {
  solved.clear();
  cards.forEach((card) => {
    const input = card.querySelector("input");
    const button = card.querySelector("button[type='submit']");
    const feedback = card.querySelector(".feedback");
    card.classList.remove("right", "wrong");
    input.value = "";
    input.disabled = false;
    button.disabled = false;
    button.textContent = "Check";
    feedback.textContent = "Enter your answer when you are ready.";
  });
  updateProgress();
  cards[0].querySelector("input").focus();
}

function loadSet(setNumber) {
  activeSet = setNumber;
  const questions = activeQuestions();

  cards.forEach((card, index) => {
    card.querySelector(".skill").textContent = questions[index][4];
    renderExpression(card.querySelector(".expression"), questions[index]);
  });

  setButtons.forEach((button) => {
    const selected = Number(button.dataset.set) === activeSet;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  resetPractice();
}

cards.forEach((card, index) => {
  const form = card.querySelector("form");
  const input = card.querySelector("input");
  const button = card.querySelector("button[type='submit']");
  const feedback = card.querySelector(".feedback");

  input.addEventListener("input", () => {
    if (card.classList.contains("wrong")) {
      card.classList.remove("wrong");
      feedback.textContent = "Recalculate, then check again.";
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const typed = input.value.trim();
    const isRight = typed !== "" && Number(typed) === activeQuestions()[index][3];

    card.classList.toggle("right", isRight);
    card.classList.toggle("wrong", !isRight);

    if (isRight) {
      solved.add(index);
      input.disabled = true;
      button.disabled = true;
      button.textContent = "Solved";
      feedback.textContent = "✓ You got it!";
    } else {
      solved.delete(index);
      feedback.textContent = "↻ Not yet—recalculate and try again.";
      input.focus();
      input.select();
    }
    updateProgress();
  });
});

document.querySelector("#reset-top").addEventListener("click", resetPractice);
document.querySelector("#reset-bottom").addEventListener("click", resetPractice);
setButtons.forEach((button) => {
  button.addEventListener("click", () => loadSet(Number(button.dataset.set)));
});
loadSet(1);
