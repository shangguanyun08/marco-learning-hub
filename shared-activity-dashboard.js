(function installDailyActivityDashboard() {
  "use strict";

  const API_URL = "https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/activity";
  const TIME_ZONE = "America/Los_Angeles";
  const marcoMinutes = document.getElementById("marco-minutes");
  const harryMinutes = document.getElementById("harry-minutes");
  const dateNode = document.getElementById("today-log-date");
  const noteNode = document.getElementById("today-log-note");

  if (!marcoMinutes || !harryMinutes || !dateNode || !noteNode) return;

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

  async function refresh() {
    dateNode.textContent = dateLabel();
    dateNode.dateTime = dateKey();
    try {
      const response = await fetch(`${API_URL}?date=${encodeURIComponent(dateKey())}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Daily work is unavailable.");
      const marco = Math.max(0, Number(data.students?.Marco?.minutes) || 0);
      const harry = Math.max(0, Number(data.students?.Harry?.minutes) || 0);
      marcoMinutes.textContent = String(marco);
      harryMinutes.textContent = String(harry);
      noteNode.textContent = marco + harry > 0
        ? "Updates automatically while Marco or Harry is actively practicing."
        : "No active practice recorded yet today.";
    } catch (error) {
      marcoMinutes.textContent = "—";
      harryMinutes.textContent = "—";
      noteNode.textContent = "Today’s work log will retry automatically.";
    }
  }

  refresh();
  window.setInterval(refresh, 30_000);
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible") refresh();
  });
})();
