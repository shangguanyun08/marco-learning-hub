(function installDailyMathMastery(global) {
  "use strict";

  const API_URL = "https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress";
  const APPS = { Marco: "marco-summer-isee-math-redo-v1", Harry: "harry-math-practice-v1" };
  const dateFormat = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
  });
  const validTime = value => typeof value === "string" && Number.isFinite(Date.parse(value));

  function summarize(student, state) {
    const mastered = new Map();
    function remember(id, time) {
      const timestamp = validTime(time) ? new Date(time).toISOString() : null;
      const earlier = mastered.get(id);
      if (!mastered.has(id) || (timestamp && (!earlier || timestamp < earlier))) mastered.set(id, timestamp);
    }

    if (state && student === "Marco") {
      if (!Array.isArray(state.sessions) || !Array.isArray(state.attempts)) throw new Error("Invalid Marco progress.");
      // Review 1 (day 29) uses three correct answers in a row. Other sessions
      // finish after two tries, which is not evidence of mastery.
      for (const session of state.sessions.filter(item => item?.day === 29)) {
        const inherited = new Set(session.inheritedAttemptIds || []);
        const attempts = state.attempts.filter(item => item && (item.sessionId === session.id || inherited.has(item.id)));
        const mainQuestions = new Set(attempts.filter(item => !item.parentQuestionId && item.attemptNumber === 1).map(item => item.questionId));
        for (const id of mainQuestions) {
          const nominal = attempts.find(item => item.questionId === id && item.attemptNumber === 1);
          let streak = nominal.correct === true ? 1 : 0;
          for (let number = 1; number <= 10; number += 1) {
            const attempt = attempts.find(item => item.parentQuestionId === id && item.practiceNumber === number);
            if (!attempt) break;
            streak = attempt.correct === true ? streak + 1 : 0;
            if (streak === 3) {
              remember(String(id), attempt.createdAt);
              break;
            }
          }
        }
      }
    } else if (state && student === "Harry") {
      if (!state[6] || !Array.isArray(state[6].questions)) throw new Error("Invalid Harry progress.");
      state[6].questions.forEach((record, index) => {
        if (!record) return;
        let streak = record.firstTry === true ? 1 : 0;
        if (typeof record.firstTry === "boolean") {
          for (const attempt of (record.review?.attempts || []).slice(0, 10)) {
            streak = attempt?.correct === true ? streak + 1 : 0;
            if (streak === 3) {
              remember(String(index), validTime(record.masteredAt) ? record.masteredAt : attempt.createdAt);
              break;
            }
          }
        }
        // Parent-confirmed questions already mastered have no completion date.
        // Never assign their mastery to the date the page happens to be opened.
        if (record.masteryCredit === "parent-confirmed" && !mastered.has(String(index))) {
          remember(String(index), record.masteredAt);
        }
      });
    }

    const counts = {};
    let undated = 0;
    for (const time of mastered.values()) {
      if (!time) { undated += 1; continue; }
      const date = dateFormat.format(new Date(time));
      counts[date] = (counts[date] || 0) + 1;
    }
    return { counts, undated };
  }

  async function load(student) {
    const response = await fetch(`${API_URL}?appId=${encodeURIComponent(APPS[student])}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !("progress" in data)) throw new Error("Math mastery is unavailable.");
    return summarize(student, data.progress?.state);
  }

  global.DailyMathMastery = { summarize, load };
})(window);
