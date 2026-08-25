const answers = new Map([
  [1, 729],
  [2, 1648],
  [3, 651],
  [4, 85],
  [5, 364],
  [6, 683],
  [7, 131],
  [8, 163],
  [9, 72],
  [10, 323],
]);

const cards = [...document.querySelectorAll("[data-question]")];
const solved = new Set();
const count = document.querySelector("#solved-count");
const fill = document.querySelector("#score-fill");
const complete = document.querySelector("#complete-card");

function updateProgress() {
  count.textContent = String(solved.size);
  fill.style.width = `${solved.size * 10}%`;
  complete.hidden = solved.size !== answers.size;
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

cards.forEach((card) => {
  const id = Number(card.dataset.question);
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
    const isRight = typed !== "" && Number(typed) === answers.get(id);

    card.classList.toggle("right", isRight);
    card.classList.toggle("wrong", !isRight);

    if (isRight) {
      solved.add(id);
      input.disabled = true;
      button.disabled = true;
      button.textContent = "Solved";
      feedback.textContent = "✓ You got it!";
    } else {
      solved.delete(id);
      feedback.textContent = "↻ Not yet—recalculate and try again.";
      input.focus();
      input.select();
    }
    updateProgress();
  });
});

document.querySelector("#reset-top").addEventListener("click", resetPractice);
document.querySelector("#reset-bottom").addEventListener("click", resetPractice);
updateProgress();
