(function installDailyActivityDashboard() {
  "use strict";

  const API_URL = "https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/activity";
  const TIME_ZONE = "America/Los_Angeles";
  const marcoMinutes = document.getElementById("marco-minutes");
  const harryMinutes = document.getElementById("harry-minutes");
  const sessionNodes = {
    Marco: {
      words: document.getElementById("marco-word-sessions"),
      math: document.getElementById("marco-math-sessions"),
      mastered: document.getElementById("marco-math-mastered"),
    },
    Harry: {
      words: document.getElementById("harry-word-sessions"),
      math: document.getElementById("harry-math-sessions"),
      mastered: document.getElementById("harry-math-mastered"),
    },
  };
  const dateNode = document.getElementById("today-log-date");
  const noteNode = document.getElementById("today-log-note");
  const historyNode = document.getElementById("activity-history");

  if (!marcoMinutes || !harryMinutes || !Object.values(sessionNodes).every((nodes) => nodes.words && nodes.math && nodes.mastered) || !dateNode || !noteNode || !historyNode) return;

  let refreshing = false;

  function masteryCount(mastery, student, date) {
    return mastery[student] ? mastery[student].counts[date] || 0 : "—";
  }

  function sessionCount(stats, field) {
    if (!stats) return 0;
    return Number.isInteger(stats[field]) && stats[field] >= 0 ? stats[field] : "—";
  }

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

  function renderHistory(history, mastery) {
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
        const studentStats = day.students?.[student];
        const minutesLine = document.createElement("span");
        const strong = document.createElement("strong");
        strong.textContent = String(minutes);
        minutesLine.append(strong, document.createTextNode(" min"));
        const wordsLine = document.createElement("span");
        const mathLine = document.createElement("span");
        const words = sessionCount(studentStats, "wordSessions");
        const math = sessionCount(studentStats, "mathSessions");
        wordsLine.textContent = `${words} word ${words === 1 ? "session" : "sessions"}`;
        mathLine.textContent = `${math} math ${math === 1 ? "session" : "sessions"}`;
        const masteredLine = document.createElement("span");
        const mastered = masteryCount(mastery, student, day.date);
        masteredLine.textContent = `${mastered} math ${mastered === 1 ? "question" : "questions"} mastered`;
        cell.append(minutesLine, wordsLine, mathLine, masteredLine);
        return cell;
      });
      row.append(date, ...stats);
      historyNode.append(row);
    });
  }

  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    dateNode.textContent = dateLabel();
    dateNode.dateTime = dateKey();
    try {
      const [activityResult, marcoMastery, harryMastery] = await Promise.allSettled([
        fetch(`${API_URL}?all=1`, { cache: "no-store" }),
        window.DailyMathMastery.load("Marco"),
        window.DailyMathMastery.load("Harry"),
      ]);
      if (activityResult.status === "rejected") throw activityResult.reason;
      const response = activityResult.value;
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Daily work is unavailable.");
      const mastery = {
        Marco: marcoMastery.status === "fulfilled" ? marcoMastery.value : null,
        Harry: harryMastery.status === "fulfilled" ? harryMastery.value : null,
      };
      const days = new Map((Array.isArray(data.history) ? data.history : []).map(day => [day.date, day]));
      // Include mastery earned without a recorded active minute or finished session.
      for (const date of [dateKey(), ...Object.values(mastery).flatMap(item => Object.keys(item?.counts || {}))]) {
        if (!days.has(date)) days.set(date, { date, students: {} });
      }
      const history = [...days.values()].sort((a, b) => b.date.localeCompare(a.date));
      const today = history.find((day) => day.date === dateKey());
      const marco = Math.max(0, Number(today?.students?.Marco?.minutes) || 0);
      const harry = Math.max(0, Number(today?.students?.Harry?.minutes) || 0);
      marcoMinutes.textContent = String(marco);
      harryMinutes.textContent = String(harry);
      for (const student of ["Marco", "Harry"]) {
        const stats = today?.students?.[student];
        sessionNodes[student].words.textContent = String(sessionCount(stats, "wordSessions"));
        sessionNodes[student].math.textContent = String(sessionCount(stats, "mathSessions"));
        sessionNodes[student].mastered.textContent = String(masteryCount(mastery, student, dateKey()));
      }
      renderHistory(history, mastery);
      noteNode.textContent = "Math mastery: 3 correct in a row · Each main question counted once · Pacific time.";
      if (Object.values(mastery).some(item => !item)) noteNode.textContent += " Math counts will retry automatically.";
      if (Object.values(mastery).some(item => item?.undated)) noteNode.textContent += " Earlier mastery without a saved date is excluded.";
    } catch (error) {
      marcoMinutes.textContent = "—";
      harryMinutes.textContent = "—";
      for (const nodes of Object.values(sessionNodes)) {
        nodes.words.textContent = "—";
        nodes.math.textContent = "—";
        nodes.mastered.textContent = "—";
      }
      historyNode.innerHTML = '<p class="activity-history-empty">Daily history will retry automatically.</p>';
      noteNode.textContent = "Today’s work log will retry automatically.";
    } finally {
      refreshing = false;
    }
  }

  refresh();
  window.setInterval(refresh, 30_000);
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible") refresh();
  });
})();
