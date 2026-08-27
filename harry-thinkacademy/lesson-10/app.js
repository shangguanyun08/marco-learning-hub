const storageKey = "harry-thinkacademy-lesson10-v1";
const answers = {
  q05: "13",
  q06: "12",
  q07: "11",
  q10a: "693",
  q10b: "1688",
  q10c: "657",
  q10d: "1324",
  q10e: "363",
  q10f: "954",
  q10g: "83",
  q10h: "361",
  q10i: "45",
  q11: "780",
  q12: "120000",
  q13: "31500",
};

const forms = [...document.querySelectorAll(".answer-unit")];
const cards = [...document.querySelectorAll("[data-card-id]")];
const count = document.querySelector("#finished-count");
const fill = document.querySelector("#score-fill");
const completion = document.querySelector("#completion-card");
const lastPracticed = document.querySelector("#last-practiced");

function emptyState() {
  return { version: 1, fields: {}, lastPracticed: null, completedAt: null };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    return saved?.version === 1 ? saved : emptyState();
  } catch {
    return emptyState();
  }
}

let state = loadState();

function normalized(value) {
  return value.replace(/[\s,]/g, "");
}

function displayAnswer(value) {
  return Number(value).toLocaleString("en-US");
}

function saveState() {
  state.lastPracticed = new Date().toISOString();
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function isFinished(field) {
  return field?.status === "correct" || field?.status === "revealed";
}

function renderForm(form) {
  const id = form.dataset.fieldId;
  const field = state.fields[id] || { attempts: 0, status: "open", value: "" };
  const input = form.querySelector("input");
  const button = form.querySelector("button");
  const feedback = form.querySelector(".feedback");
  const reveal = form.querySelector(".answer-reveal");

  form.classList.remove("correct", "try-again", "revealed");
  input.value = field.value || "";
  input.disabled = isFinished(field);
  button.disabled = isFinished(field);
  reveal.hidden = true;

  if (field.status === "correct") {
    form.classList.add("correct");
    button.textContent = "Correct";
    feedback.textContent = "✓ You got it!";
  } else if (field.status === "revealed") {
    form.classList.add("revealed");
    button.textContent = "Answer shown";
    feedback.textContent = "Two tries used. Review the answer below.";
    reveal.textContent = `Answer: ${displayAnswer(answers[id])}`;
    reveal.hidden = false;
  } else if (field.attempts === 1) {
    form.classList.add("try-again");
    button.textContent = "Try again";
    feedback.textContent = "↻ Not yet—recalculate. One try left.";
  } else {
    button.textContent = "Check";
    feedback.textContent = "Two tries available.";
  }
}

function updateProgress() {
  let finishedCards = 0;

  cards.forEach((card) => {
    const cardForms = [...card.querySelectorAll(".answer-unit")];
    const complete = cardForms.every((form) => isFinished(state.fields[form.dataset.fieldId]));
    card.classList.toggle("finished", complete);
    if (complete) finishedCards += 1;
  });

  count.textContent = String(finishedCards);
  fill.style.width = `${(finishedCards / cards.length) * 100}%`;
  completion.hidden = finishedCards !== cards.length;

  if (finishedCards === cards.length && !state.completedAt) {
    state.completedAt = new Date().toISOString();
    saveState();
  }

  if (state.lastPracticed) {
    const date = new Date(state.lastPracticed).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    lastPracticed.textContent = `Last practiced ${date}`;
  }
}

forms.forEach((form) => {
  renderForm(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = form.dataset.fieldId;
    const input = form.querySelector("input");
    const typed = normalized(input.value.trim());

    if (!typed) {
      form.querySelector(".feedback").textContent = "Type an answer first.";
      input.focus();
      return;
    }

    const field = state.fields[id] || { attempts: 0, status: "open", value: "" };
    field.value = input.value.trim();

    if (typed === answers[id]) {
      field.status = "correct";
    } else {
      field.attempts += 1;
      field.status = field.attempts >= 2 ? "revealed" : "open";
    }

    state.fields[id] = field;
    saveState();
    renderForm(form);
    updateProgress();

    if (!isFinished(field)) {
      input.focus();
      input.select();
    }
  });
});

document.querySelector("#reset-lesson").addEventListener("click", () => {
  if (window.confirm("Reset all Lesson 10 tries and start again?")) {
    localStorage.removeItem(storageKey);
    window.location.reload();
  }
});

updateProgress();
