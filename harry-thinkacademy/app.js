const storageKey = "harry-thinkacademy-lesson10-v1";
const status = document.querySelector("#lesson-10-status");
const fill = document.querySelector("#lesson-10-fill");

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
  const fields = Object.values(saved?.fields || {});
  const finished = fields.filter((field) => field.status === "correct" || field.status === "revealed").length;

  if (saved?.completedAt) {
    const date = new Date(saved.completedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    status.textContent = `Completed ${date}`;
  } else if (finished > 0) {
    status.textContent = `In progress · ${finished}/15 answers finished`;
  }

  fill.style.width = `${Math.min(100, (finished / 15) * 100)}%`;
} catch {
  status.textContent = "Not started";
}
