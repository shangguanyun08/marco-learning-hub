document.querySelectorAll(".lesson-card[data-storage-key]").forEach((card) => {
  const total = Number(card.dataset.totalFields);
  const status = card.querySelector(".lesson-progress span");
  const fill = card.querySelector(".mini-track i");
  try {
    const saved = JSON.parse(localStorage.getItem(card.dataset.storageKey) || "null");
    const fields = Object.values(saved?.fields || {});
    const finished = fields.filter((field) => field.status === "correct" || field.status === "revealed").length;
    const firstTry = fields.filter((field) => field.firstTryCorrect === true).length;
    if (saved?.completedAt) {
      status.textContent = `Complete · first-try score ${firstTry}/${total}`;
    } else if (finished > 0) {
      status.textContent = `In progress · ${finished}/${total} answers finished`;
    }
    fill.style.width = `${Math.min(100, (finished / total) * 100)}%`;
  } catch {
    status.textContent = "Not started";
  }
});
