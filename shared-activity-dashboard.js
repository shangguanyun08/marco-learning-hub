(function installDailyActivityDashboard() {
  "use strict";

  const API_URL = "https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/study-time";
  const TIME_ZONE = "America/Los_Angeles";
  const marcoMinutes = document.getElementById("marco-minutes");
  const harryMinutes = document.getElementById("harry-minutes");
  const dateNode = document.getElementById("today-log-date");
  const noteNode = document.getElementById("today-log-note");
  const historyNode = document.getElementById("activity-history");
  if (!marcoMinutes || !harryMinutes || !dateNode || !noteNode || !historyNode) return;
  let refreshing = false;

  function minutesText(stats) {
    if (stats?.hasHistoricalEvidence && !stats.hasTimeRecord) return "—";
    const minutes = Math.max(0, Number(stats?.minutes) || 0);
    return minutes < 1 && Number(stats?.seconds) > 0 ? "<1" : String(minutes);
  }

  function dateKey(now) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(now);
  }

  function historyDateLabel(date, isToday) {
    if (isToday) return "Today";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE, weekday: "short", month: "short", day: "numeric", year: "numeric",
    }).format(new Date(`${date}T12:00:00Z`));
  }

  function renderHistory(history, today) {
    historyNode.replaceChildren();
    for (const day of history) {
      const row = document.createElement("div");
      row.className = `activity-history-row${day.date === today ? " is-today" : ""}`;
      row.setAttribute("role", "row");
      const date = document.createElement("span");
      date.className = "activity-history-date";
      date.setAttribute("role", "cell");
      date.textContent = historyDateLabel(day.date, day.date === today);
      const cells = ["Marco", "Harry"].map(student => {
        const cell = document.createElement("span");
        cell.className = "activity-history-stats";
        cell.setAttribute("role", "cell");
        const value = minutesText(day.students?.[student]);
        cell.setAttribute("aria-label", `${student}: ${value === "—" ? "minutes not recorded" : value + " minutes"}`);
        const strong = document.createElement("strong");
        strong.textContent = value;
        cell.append(strong, document.createTextNode(" min"));
        return cell;
      });
      row.append(date, ...cells);
      historyNode.append(row);
    }
  }

  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    const now = new Date(), todayKey = dateKey(now);
    dateNode.textContent = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE, weekday: "long", month: "long", day: "numeric",
    }).format(now);
    dateNode.dateTime = todayKey;
    try {
      const response = await fetch(`${API_URL}?all=1`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.history)) throw new Error("Daily minutes are unavailable.");
      const days = new Map(data.history.map(day => [day.date, day]));
      if (!days.has(todayKey)) days.set(todayKey, { date: todayKey, students: {} });
      const history = [...days.values()].sort((a, b) => b.date.localeCompare(a.date));
      const today = days.get(todayKey);
      marcoMinutes.textContent = minutesText(today.students?.Marco);
      harryMinutes.textContent = minutesText(today.students?.Harry);
      renderHistory(history, todayKey);
      noteNode.textContent = "Active minutes · Pacific time";
    } catch {
      marcoMinutes.textContent = "—";
      harryMinutes.textContent = "—";
      const empty = document.createElement("p");
      empty.className = "activity-history-empty";
      empty.textContent = "Minutes unavailable. Retrying automatically.";
      historyNode.replaceChildren(empty);
      noteNode.textContent = "Daily minutes will retry automatically.";
    } finally {
      refreshing = false;
    }
  }

  refresh();
  window.setInterval(refresh, 30_000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") refresh();
  });
})();
