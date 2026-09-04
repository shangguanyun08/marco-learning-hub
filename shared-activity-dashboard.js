(function installDailyActivityDashboard() {
  "use strict";

  const API_URL = "https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/activity";
  const TIME_ZONE = "America/Los_Angeles";
  const marcoMinutes = document.getElementById("marco-minutes");
  const harryMinutes = document.getElementById("harry-minutes");
  const marcoSessions = document.getElementById("marco-sessions");
  const harrySessions = document.getElementById("harry-sessions");
  const dateNode = document.getElementById("today-log-date");
  const noteNode = document.getElementById("today-log-note");
  const historyNode = document.getElementById("activity-history");

  if (!marcoMinutes || !harryMinutes || !marcoSessions || !harrySessions || !dateNode || !noteNode || !historyNode) return;

  function dateKey() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  function dateLabel() {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }

  function historyDateLabel(date, isToday) {
    if (isToday) return "Today";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00Z`));
  }

  function renderHistory(history) {
    historyNode.replaceChildren();
    if (!history.length) {
      const empty = document.createElement("p");
      empty.className = "activity-history-empty";
      empty.textContent = "No daily activity has been recorded yet.";
      historyNode.append(empty);
      return;
    }
    const today = dateKey();
    history.forEach((day) => {
      const row = document.createElement("div");
      const isToday = day.date === today;
      row.className = `activity-history-row${isToday ? " is-today" : ""}`;
      row.setAttribute("role", "row");

      const date = document.createElement("span");
      date.className = "activity-history-date";
      date.setAttribute("role", "cell");
      date.textContent = historyDateLabel(day.date, isToday);

      const stats = ["Marco", "Harry"].map((student) => {
        const cell = document.createElement("span");
        cell.className = "activity-history-stats";
        cell.setAttribute("role", "cell");
        const minutes = Math.max(0, Number(day.students?.[student]?.minutes) || 0);
        const sessions = Math.max(0, Number(day.students?.[student]?.sessions) || 0);
        const minutesLine = document.createElement("span");
        const strong = document.createElement("strong");
        strong.textContent = String(minutes);
        minutesLine.append(strong, document.createTextNode(" min"));
        const sessionsLine = document.createElement("span");
        sessionsLine.textContent = `${sessions} ${sessions === 1 ? "session" : "sessions"}`;
        cell.append(minutesLine, sessionsLine);
        return cell;
      });
      row.append(date, ...stats);
      historyNode.append(row);
    });
  }

  async function refresh() {
    dateNode.textContent = dateLabel();
    dateNode.dateTime = dateKey();
    try {
      const response = await fetch(`${API_URL}?all=1`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Daily work is unavailable.");
      const history = Array.isArray(data.history) ? data.history : [];
      const today = history.find((day) => day.date === dateKey());
      const marco = Math.max(0, Number(today?.students?.Marco?.minutes) || 0);
      const harry = Math.max(0, Number(today?.students?.Harry?.minutes) || 0);
      const marcoFinished = Math.max(0, Number(today?.students?.Marco?.sessions) || 0);
      const harryFinished = Math.max(0, Number(today?.students?.Harry?.sessions) || 0);
      marcoMinutes.textContent = String(marco);
      harryMinutes.textContent = String(harry);
      marcoSessions.textContent = String(marcoFinished);
      harrySessions.textContent = String(harryFinished);
      renderHistory(history);
      noteNode.textContent = marco + harry > 0
        ? "Updates automatically while Marco or Harry is actively practicing."
        : "No active practice recorded yet today.";
    } catch (error) {
      marcoMinutes.textContent = "—";
      harryMinutes.textContent = "—";
      marcoSessions.textContent = "—";
      harrySessions.textContent = "—";
      historyNode.innerHTML = '<p class="activity-history-empty">Daily history will retry automatically.</p>';
      noteNode.textContent = "Today’s work log will retry automatically.";
    }
  }

  refresh();
  window.setInterval(refresh, 30_000);
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible") refresh();
  });
})();
