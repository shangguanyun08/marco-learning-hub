(function startMarcoMathRedo() {
  "use strict";

  const APP_ID = "marco-summer-isee-math-redo-v1";
  const STORAGE_KEY = `${APP_ID}:state`;
  const app = document.querySelector("#app");
  let bank = null;
  let sourceBank = null;
  let hasChosenDay = false;
  let state = freshState();
  let selectedDay = 1;
  let view = "practice";
  let feedbackByQuestion = {};
  let selectedAnswers = {};
  let reviewQuestionId = null;
  let sync = null;

  function freshState() {
    return { schemaVersion: 1, learner: "Marco", sessions: [], attempts: [], updatedAt: null };
  }

  function validState(value) {
    return Boolean(value && value.schemaVersion === 1 && Array.isArray(value.sessions) && Array.isArray(value.attempts));
  }

  function loadLocal() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return validState(saved) ? saved : freshState();
    } catch {
      return freshState();
    }
  }

  function saveState() {
    state.updatedAt = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    sync?.push(state);
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function latestSession(dayNumber) {
    return state.sessions
      .filter((session) => session.day === dayNumber)
      .sort((a, b) => b.runNumber - a.runNumber)[0] || null;
  }

  function attemptsFor(session) {
    if (!session) return [];
    const inherited = new Set(session.inheritedAttemptIds || []);
    return state.attempts.filter((attempt) => attempt.sessionId === session.id || inherited.has(attempt.id));
  }

  function questionAttempts(session, questionId) {
    return attemptsFor(session).filter((attempt) => attempt.questionId === questionId);
  }

  function resolved(attempts) {
    return attempts.some((attempt) => attempt.correct) || attempts.length >= 2;
  }

  // The fixed plan keeps session membership stable across answers, devices and reloads.
  // Original question IDs and saved sessions remain unchanged.
  function organizeBank(questionBank, plan, reviewBank, practiceBank) {
    sourceBank = questionBank;
    const questions = new Map(questionBank.days.flatMap((day) => day.questions).map((question) => [question.id, question]));
    const plannedIds = new Set(plan.sessions.flatMap((session) => session.questionIds));
    const previousDays = questionBank.days
      .filter((day) => day.questions.some((question) => !plannedIds.has(question.id)))
      .map((day) => ({ ...day, label: 'Day ' + day.day, original: true }));
    const practiceDays = plan.sessions.map((session) => {
      const items = session.questionIds.map((id) => {
        const question = questions.get(id);
        if (!question) throw new Error('A practice question could not be found. Please refresh.');
        return question;
      });
      return { day: session.day, label: session.label, questions: items, questionCount: items.length };
    });
    const reviewDays = reviewBank.sessions.map((session) => ({
      ...session,
      review: true,
      mastery: session.day === practiceBank.day ? { maxQuestions: practiceBank.maxQuestions, requiredStreak: practiceBank.requiredStreak } : null,
      questions: session.questions.map((question) => ({ ...question, practiceQuestions: practiceBank.groups[question.id] || [] })),
      targetScore: reviewBank.targetScore,
      questionCount: session.questions.length,
    }));
    const days = [...previousDays, ...reviewDays, ...practiceDays];
    bank = { ...questionBank, totalQuestions: days.reduce((total, day) => total + day.questionCount, 0), days };
  }

  function carriedAttempts(day) {
    if (day.original || day.review) return [];
    return day.questions.flatMap((question) => questionAttempts(latestSession(question.day), question.id));
  }

  function savedAttempts(day, questionId) {
    const session = latestSession(day.day);
    const attempts = session ? attemptsFor(session) : carriedAttempts(day);
    return questionId ? attempts.filter((attempt) => attempt.questionId === questionId) : attempts;
  }

  // Derive mastery from saved answers, so reloads and online sync restore the same streak.
  // Only the first checked answer to each distinct practice question counts.
  function masteryProgress(day, question, attempts = savedAttempts(day)) {
    const nominal = attempts.find((attempt) => attempt.questionId === question.id && attempt.attemptNumber === 1);
    const practice = [];
    let streak = nominal?.correct ? 1 : 0;
    if (nominal) {
      for (const item of question.practiceQuestions.slice(0, day.mastery.maxQuestions)) {
        const attempt = attempts.find((entry) => entry.questionId === item.id);
        if (!attempt) break;
        practice.push(attempt);
        streak = attempt.correct ? streak + 1 : 0;
        if (streak >= day.mastery.requiredStreak) break;
      }
    }
    const mastered = streak >= day.mastery.requiredStreak;
    const unmastered = !mastered && practice.length >= day.mastery.maxQuestions;
    return { nominal, practice, streak, mastered, unmastered, done: mastered || unmastered,
      status: mastered ? 'Mastered' : unmastered ? 'Unmastered' : nominal ? 'Practice in progress' : 'Not started' };
  }

  function questionDone(day, question, attempts) {
    return day.mastery ? masteryProgress(day, question, attempts).done
      : resolved(attempts.filter((attempt) => attempt.questionId === question.id));
  }

  function findQuestion(day, questionId) {
    return day?.questions.flatMap((question) => [question, ...(question.practiceQuestions || [])])
      .find((question) => String(question.id) === String(questionId));
  }

  function canAnswer(day, question, previous) {
    if (question.parentQuestionId) {
      const parent = day.questions.find((item) => item.id === question.parentQuestionId);
      const progress = masteryProgress(day, parent);
      return progress.nominal && !progress.done && !previous.length
        && parent.practiceQuestions[progress.practice.length]?.id === question.id;
    }
    return day.mastery ? previous.length === 0 : !resolved(previous);
  }

  function nextPracticeDay() {
    return bank.days.find((day) => day.review && (!metrics(day).completed || reviewNeedsWork(day, metrics(day))))
      || bank.days.find((day) => !day.original && !metrics(day).completed)
      || bank.days.find((day) => !metrics(day).completed && metrics(day).attempts.length)
      || bank.days.find((day) => !day.original) || bank.days[0];
  }

  function reviewNeedsWork(day, row) {
    return day.review && (row.firstTryScore < day.targetScore || (day.mastery && row.unmastered > 0));
  }

  function firstTryScore(day, session) {
    if (!session?.completedAt) return null;
    const attempts = attemptsFor(session).filter((attempt) => !attempt.parentQuestionId);
    // Completed rounds keep the size they had when finished, even after a review grows.
    const count = session.questionIds?.length || new Set(attempts.map((attempt) => attempt.questionId)).size || day.questionCount;
    const firstWrong = attempts
      .filter((attempt) => attempt.attemptNumber === 1 && !attempt.correct)
      .length;
    return Math.round(((count - firstWrong) / count) * 100);
  }

  function formatFinishedAt(value) {
    if (!value) return "Not finished";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Finished";
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function metrics(day) {
    const session = latestSession(day.day);
    const attempts = savedAttempts(day);
    const count = day.questions.filter((question) => questionDone(day, question, attempts)).length;
    const completed = count === day.questionCount;
    const nominalAttempts = attempts.filter((attempt) => day.questions.some((question) => question.id === attempt.questionId));
    const firstWrong = nominalAttempts.filter((attempt) => attempt.attemptNumber === 1 && !attempt.correct).length;
    const mastery = day.mastery ? day.questions.map((question) => masteryProgress(day, question, attempts)) : [];
    const nominalCompleted = day.questions.every((question) => nominalAttempts.some((attempt) => attempt.questionId === question.id));
    return {
      session,
      attempts,
      resolved: count,
      firstWrong,
      secondWrong: nominalAttempts.filter((attempt) => attempt.attemptNumber === 2 && !attempt.correct).length,
      mastered: mastery.filter((item) => item.mastered).length,
      unmastered: mastery.filter((item) => item.unmastered).length,
      practiceChecks: attempts.filter((attempt) => attempt.parentQuestionId).length,
      completed,
      firstTryScore: (day.mastery ? nominalCompleted : completed) ? Math.round(((day.questionCount - firstWrong) / day.questionCount) * 100) : null,
      finishedAt: completed ? session?.completedAt || attempts.map((attempt) => attempt.createdAt).sort().at(-1) : null,
    };
  }

  function newId() {
    return crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function ensureSession(dayNumber) {
    const existing = latestSession(dayNumber);
    if (existing && !existing.completedAt) return existing;
    const day = bank.days.find((item) => item.day === dayNumber);
    const extendingReview = day.review && existing?.completedAt && !metrics(day).completed;
    const session = {
      id: newId(),
      day: dayNumber,
      runNumber: (existing?.runNumber || 0) + 1,
      questionIds: day.questions.map((question) => question.id),
      inheritedAttemptIds: extendingReview
        ? attemptsFor(existing).map((attempt) => attempt.id)
        : existing ? [] : carriedAttempts(day).map((attempt) => attempt.id),
      startedAt: new Date().toISOString(),
      completedAt: null,
    };
    state.sessions.push(session);
    return session;
  }

  function chooseDay(dayNumber) {
    const day = bank.days.find((item) => item.day === dayNumber);
    if (!day) return;
    selectedDay = dayNumber;
    hasChosenDay = true;
    feedbackByQuestion = {};
    selectedAnswers = {};
    reviewQuestionId = null;
    view = "practice";
    render();
  }

  function selectAnswer(questionId, index) {
    const day = bank.days.find((item) => item.day === selectedDay);
    const question = findQuestion(day, questionId);
    const previous = day ? savedAttempts(day, question?.id) : [];
    if (!question || !Number.isInteger(index) || !question.options[index] || !canAnswer(day, question, previous) || previous.some((attempt) => attempt.selectedIndex === index)) return;
    selectedAnswers[question.id] = index;
    feedbackByQuestion[question.id] = null;
    render();
  }

  function answer(questionId, index) {
    const day = bank.days.find((item) => item.day === selectedDay);
    const question = findQuestion(day, questionId);
    if (!day || !question || !Number.isInteger(index) || !question.options[index]) return;
    const previous = savedAttempts(day, question.id);
    if (!canAnswer(day, question, previous) || previous.some((attempt) => attempt.selectedIndex === index)) return;
    const session = ensureSession(day.day);
    hasChosenDay = true;
    if (day.mastery) reviewQuestionId = question.parentQuestionId || question.id;

    const attemptNumber = previous.length + 1;
    const correct = question.correctIndexes.includes(index);
    const attempt = {
      id: newId(),
      sessionId: session.id,
      day: day.day,
      questionId: question.id,
      questionPosition: question.position,
      attemptNumber,
      selectedIndex: index,
      correct,
      createdAt: new Date().toISOString(),
      ...(question.parentQuestionId ? { parentQuestionId: question.parentQuestionId, practiceNumber: question.practiceNumber } : {}),
    };
    state.attempts.push(attempt);
    const isResolved = Boolean(day.mastery) || correct || attemptNumber === 2;
    if (!session.completedAt && day.questions.every((item) => questionDone(day, item, attemptsFor(session)))) {
      session.completedAt = new Date().toISOString();
    }
    feedbackByQuestion[question.id] = {
      correct,
      attemptNumber,
      selectedIndex: index,
      resolved: isResolved,
      reveal: !correct && attemptNumber === 2
        ? { correctHtml: question.correctHtml, explanation: question.explanation }
        : null,
    };
    delete selectedAnswers[question.id];
    saveState();
    render();
  }

  function startAgain() {
    const day = bank.days.find((item) => item.day === selectedDay);
    if (!day || !metrics(day).completed) return;
    const previous = latestSession(selectedDay);
    state.sessions.push({
      id: newId(),
      day: selectedDay,
      runNumber: (previous?.runNumber || 0) + 1,
      questionIds: day.questions.map((question) => question.id),
      startedAt: new Date().toISOString(),
      completedAt: null,
    });
    feedbackByQuestion = {};
    selectedAnswers = {};
    reviewQuestionId = null;
    saveState();
    render();
  }

  function summary() {
    const wrongAttempts = state.attempts.filter((attempt) => !attempt.correct);
    const rows = bank.days.map((day) => {
      const questionIds = new Set(day.questions.map((question) => question.id));
      const dayWrongAttempts = wrongAttempts.filter((attempt) => questionIds.has(attempt.questionId) && !attempt.parentQuestionId);
      return {
        day,
        ...metrics(day),
        historyFirstWrong: dayWrongAttempts.filter((attempt) => attempt.attemptNumber === 1).length,
        historySecondWrong: dayWrongAttempts.filter((attempt) => attempt.attemptNumber === 2).length,
      };
    });
    return {
      rows,
      completedDays: rows.filter((row) => row.completed).length,
      resolvedQuestions: rows.reduce((sum, row) => sum + row.resolved, 0),
      wrongQuestions: new Set(wrongAttempts.map((attempt) => attempt.parentQuestionId || attempt.questionId)).size,
      wrongChecks: wrongAttempts.length,
      firstMisses: wrongAttempts.filter((attempt) => !attempt.parentQuestionId && attempt.attemptNumber === 1).length,
      secondMisses: wrongAttempts.filter((attempt) => !attempt.parentQuestionId && attempt.attemptNumber === 2).length,
    };
  }

  function headerHtml() {
    return `
      <header class="topbar">
        <div><p class="eyebrow">Summer ISEE · Math mistake practice</p><h1>Marco's Math Redo</h1></div>
        <div class="top-actions">
          <nav aria-label="Main navigation">
            <button class="${view === "practice" ? "active" : ""}" data-action="view" data-view="practice" type="button">Practice</button>
            <button class="${view === "progress" ? "active" : ""}" data-action="view" data-view="progress" type="button">Progress</button>
          </nav>
          <div class="sync-pill" data-online-sync="${APP_ID}" role="status"><span></span> Connecting online…</div>
        </div>
      </header>`;
  }

  function railHtml(day) {
    const rows = bank.days.map((item) => ({ day: item, ...metrics(item) }));
    const done = rows.filter((row) => row.completed);
    const next = nextPracticeDay();
    function sessionButton(row) {
      const item = row.day;
      const status = row.completed ? 'Finished' : row.attempts.length ? 'In progress' : item.day === next.day ? 'Up next' : 'Not started';
      return `<button class="${item.day === day.day ? 'active' : ''} ${row.completed ? 'done' : ''}" data-action="day" data-day="${item.day}" type="button" aria-current="${item.day === day.day ? 'true' : 'false'}">
        <b>${esc(item.label)}</b><span class="session-status">${row.completed ? '✓ ' : ''}${status}</span>
        ${row.completed ? '<span class="session-score">First try: ' + row.firstTryScore + '/100</span>' : ''}
        ${item.review ? '<span class="review-target">' + (row.completed && row.firstTryScore >= item.targetScore ? '✓ Goal met' : 'Goal: ' + item.targetScore + '/100') + '</span>' : ''}
        ${item.mastery ? `<span class="session-mastery">${row.mastered}/${item.questionCount} mastered${row.unmastered ? ` · ${row.unmastered} unmastered` : ''}</span>` : ''}
        <small>${!row.completed && row.attempts.length ? row.resolved + '/' + item.questionCount + ' finished' : item.questionCount + ' questions'}</small>
      </button>`;
    }
    return `
      <aside class="day-rail" aria-label="Practice sessions">
        <div class="rail-heading"><strong>All sessions</strong><span>${done.length} of ${rows.length} finished</span></div>
        <div class="day-list">${rows.map(sessionButton).join('')}</div>
        ${done.length === rows.length ? '<p class="all-done">All sessions are finished. Well done, Marco!</p>' : ''}
      </aside>`;
  }

  function completeHtml(day, dayMetrics) {
    const next = nextPracticeDay();
    const hasNext = next.day !== day.day && (!metrics(next).completed || reviewNeedsWork(next, metrics(next)));
    const retryForGoal = reviewNeedsWork(day, dayMetrics);
    return `
      <section class="question-card complete-card">
        <div class="complete-badge">✓</div><p class="eyebrow">Session complete</p>
        <h2>${esc(day.label)} is finished.</h2>
        <p>Marco completed all ${day.questionCount} questions in this session. ${day.mastery ? 'Every main answer and extra practice answer is saved in the progress record.' : 'Every first and second try is saved in the online progress record.'}</p>
        ${day.mastery ? `<p class="mastery-result ${dayMetrics.unmastered ? 'unmastered' : 'mastered'}">${dayMetrics.mastered} mastered · ${dayMetrics.unmastered} unmastered. ${dayMetrics.unmastered ? 'The unmastered questions reached 10 extra questions without 3 correct in a row.' : 'Every main question is mastered.'}</p>` : ''}
        ${day.review ? `<p class="review-result ${retryForGoal ? 'retry' : 'met'}">${retryForGoal ? `Target: ${day.targetScore}/100.${day.mastery ? ' Try this review again to improve your score and master any remaining skills.' : ' Read the explanations below, then try this review again.'} Earlier attempts stay saved.` : `Goal met! You scored at least ${day.targetScore}/100 on your first tries.`}</p>` : ''}
        <div class="complete-stats">
          <div><strong>${dayMetrics.firstTryScore}/100</strong><span>first-try score</span></div>
          <div><strong>${dayMetrics.firstWrong}</strong><span>first-try misses</span></div>
          <div><strong>${day.mastery ? dayMetrics.practiceChecks : dayMetrics.secondWrong}</strong><span>${day.mastery ? 'extra practice answers' : 'second-try misses'}</span></div>
          <div><strong class="finished-time">${esc(formatFinishedAt(dayMetrics.finishedAt))}</strong><span>finished</span></div>
        </div>
        <div class="complete-actions">
          ${retryForGoal ? `<button class="primary-action" data-action="restart" type="button">Try ${esc(day.label)} again · aim for ${day.targetScore}/100</button>` : ''}
          ${hasNext ? `<button class="${retryForGoal ? 'secondary-action' : 'primary-action'}" data-action="day" data-day="${next.day}" type="button">Continue to ${esc(next.label)}</button>` : ""}
          ${retryForGoal ? '' : `<button class="secondary-action" data-action="restart" type="button">Practice ${esc(day.label)} again</button>`}
          <button class="text-action" data-action="view" data-view="progress" type="button">See progress record</button>
        </div>
      </section>`;
  }

  function questionHtml(day, dayMetrics, question) {
    if (day.mastery) return masteryQuestionHtml(day, dayMetrics, question);
    const saved = savedAttempts(day, question.id);
    const currentResolved = resolved(saved);
    const selectedAnswer = selectedAnswers[question.id];
    const secondWrong = saved.find((attempt) => attempt.attemptNumber === 2 && !attempt.correct);
    const currentFeedback = feedbackByQuestion[question.id] || (secondWrong ? {
      correct: false,
      resolved: true,
      reveal: { correctHtml: question.correctHtml, explanation: question.explanation },
    } : day.review && currentResolved ? { correct: saved.some((attempt) => attempt.correct), resolved: true } : null);
    if (day.review && currentFeedback?.resolved) {
      currentFeedback.reveal = { correctHtml: question.correctHtml, explanation: question.explanation };
    }
    const options = question.options.map((option, index) => {
      const attempt = saved.find((item) => item.selectedIndex === index);
      const className = [
        attempt ? (attempt.correct ? "right" : "wrong") : "",
        selectedAnswer === index && !attempt ? "selected" : "",
      ].filter(Boolean).join(" ");
      const disabled = currentResolved || Boolean(attempt && !attempt.correct);
      return `<button class="${className}" ${disabled ? "disabled" : ""} data-action="select-answer" data-question-id="${esc(question.id)}" data-index="${index}" type="button" aria-pressed="${selectedAnswer === index}">
        <span class="option-letter">${esc(option.label)}</span><span class="option-content">${option.html}</span>
      </button>`;
    }).join("");

    const feedbackHtml = !currentFeedback ? "" : `
      <div class="feedback ${currentFeedback.correct ? "right" : "wrong"}" role="status">
        <div class="feedback-icon">${currentFeedback.correct ? "✓" : currentFeedback.resolved ? "2" : "1"}</div>
        <div>
          <strong>${currentFeedback.correct ? "Right — nice work!" : currentFeedback.resolved ? "Let’s learn this one." : "Not quite. Try once more."}</strong>
          ${!currentFeedback.correct && !currentFeedback.resolved ? "<span>Your first try is saved. Check the signs, units, and what the question is asking.</span>" : ""}
          ${currentFeedback.reveal ? `<div class="reveal"><p><b>Correct answer:</b> <span>${currentFeedback.reveal.correctHtml}</span></p><p><b>Quick explanation:</b> ${esc(currentFeedback.reveal.explanation)}</p></div>` : ""}
          ${currentFeedback.correct ? "<span>Answer saved online.</span>" : ""}
        </div>
      </div>`;

    return `
      <section class="question-card" id="question-${esc(question.id)}">
        <div class="question-meta">
          <div><span>${esc(day.label)}</span><strong>Question ${day.questions.indexOf(question) + 1} of ${day.questionCount}</strong></div>
          <div class="progress-track"><span style="width:${(dayMetrics.resolved / day.questionCount) * 100}%"></span></div>
          <small>${question.sourceDay ? `Similar to Day ${question.sourceDay}` : `Original Day ${question.day}`} · Question #${esc(question.sourceNumber)}</small>
        </div>
        <div class="try-row"><span>Two tries to learn it</span><div aria-label="${saved.length} of 2 tries used"><i class="${saved.length >= 1 ? "used" : ""}"></i><i class="${saved.length >= 2 ? "used" : ""}"></i></div></div>
        <div class="problem">${question.questionHtml}</div>
        <div class="options">${options}</div>
        ${feedbackHtml}
        <footer class="question-footer">
          <span>${dayMetrics.resolved} of ${day.questionCount} questions finished</span>
          ${currentResolved
            ? `<span class="answered-mark">✓ Answer saved</span>`
            : `<button class="primary-action" data-action="check-answer" data-question-id="${esc(question.id)}" type="button" ${selectedAnswer === undefined ? "disabled" : ""}>Check answer</button>`}
        </footer>
      </section>`;
  }

  function masteryAnswerHtml(question, saved) {
    const checked = saved[0];
    const selected = selectedAnswers[question.id];
    const options = question.options.map((option, index) => {
      const chosen = checked?.selectedIndex === index;
      const className = chosen ? (checked.correct ? 'right' : 'wrong') : !checked && selected === index ? 'selected' : '';
      return `<button class="${className}" ${checked ? 'disabled' : ''} data-action="select-answer" data-question-id="${esc(question.id)}" data-index="${index}" type="button" aria-pressed="${!checked && selected === index}"><span class="option-letter">${option.label}</span><span class="option-content">${option.html}</span></button>`;
    }).join('');
    return `<div class="problem">${question.questionHtml}</div><div class="options">${options}</div>
      ${checked ? `<div class="feedback ${checked.correct ? 'right' : 'wrong'}" role="status"><div class="feedback-icon">${checked.correct ? '✓' : '!'}</div><div><strong>${checked.correct ? 'Correct!' : 'Let’s learn this one.'}</strong><div class="reveal"><p><b>Correct answer:</b> ${question.correctHtml}</p><p><b>Quick explanation:</b> ${esc(question.explanation)}</p></div></div></div>`
        : `<div class="mastery-check"><button class="primary-action" data-action="check-answer" data-question-id="${esc(question.id)}" type="button" ${selected === undefined ? 'disabled' : ''}>Check answer</button></div>`}`;
  }

  function masteryQuestionHtml(day, dayMetrics, question) {
    const progress = masteryProgress(day, question);
    const statusClass = progress.mastered ? 'mastered' : progress.unmastered ? 'unmastered' : 'pending';
    let extra = '';
    if (progress.nominal) {
      const last = progress.practice.at(-1);
      const showLast = last && (progress.done || feedbackByQuestion[last.questionId]);
      const current = question.practiceQuestions[showLast ? progress.practice.length - 1 : progress.practice.length];
      const saved = current ? savedAttempts(day, current.id).slice(0, 1) : [];
      extra = `<section class="extra-practice" aria-label="Extra practice for Question ${question.position}">
        <div class="practice-heading"><div><p class="eyebrow">Extra practice · Question ${question.position}</p><h3>${esc(question.skill)}</h3></div><span class="mastery-badge ${statusClass}">${progress.status}</span></div>
        <div class="practice-counters" aria-live="polite"><span><b>${progress.practice.length}/${day.mastery.maxQuestions}</b> extra questions answered</span><span><b>${progress.streak}/${day.mastery.requiredStreak}</b> correct in a row</span></div>
        <p class="practice-rule">Get ${day.mastery.requiredStreak} correct in a row, starting with the main question. A correct main answer counts as 1. A wrong answer resets the streak. Stop after ${day.mastery.maxQuestions} extra questions.</p>
        ${current ? `<div class="practice-item" id="question-${esc(current.id)}"><p class="practice-number">Practice question ${current.practiceNumber} of ${day.mastery.maxQuestions}</p>${masteryAnswerHtml(current, saved)}</div>` : ''}
        ${showLast && !progress.done ? `<div class="mastery-check"><button class="primary-action" data-action="next-practice" data-question-id="${esc(question.id)}" type="button">Next practice question</button></div>` : ''}
        ${progress.done ? `<p class="mastery-result ${statusClass}" role="status">${progress.mastered ? 'Mastered! You answered 3 questions correctly in a row.' : 'Unmastered. You reached 10 extra questions without 3 correct in a row. Review this skill again later.'}</p>` : ''}
      </section>`;
    }
    return `<section class="question-card" id="question-${esc(question.id)}">
      <div class="question-meta"><div><span>${esc(day.label)}</span><strong>Question ${question.position} of ${day.questionCount}</strong></div><span class="mastery-badge ${statusClass}">${progress.status}</span><small>${esc(question.skill)}</small></div>
      ${progress.nominal ? `<details class="missed-main"><summary>Main question: ${progress.nominal.correct ? 'correct' : 'incorrect'} · Review answer and explanation</summary><div class="problem">${question.questionHtml}</div><p><b>Correct answer:</b> ${question.correctHtml}</p><p><b>Quick explanation:</b> ${esc(question.explanation)}</p></details>` : masteryAnswerHtml(question, savedAttempts(day, question.id))}
      ${extra}
      <footer class="question-footer"><span>${dayMetrics.resolved} of ${day.questionCount} main questions finished · ${dayMetrics.mastered} mastered</span>${progress.done ? `<button class="primary-action" data-action="next-main" type="button">${dayMetrics.completed ? 'See Review 1 results' : 'Next main question'}</button>` : '<span>3 correct in a row · the main question counts</span>'}</footer>
    </section>`;
  }

  function currentReviewQuestion(day) {
    return day.questions.find((question) => question.id === reviewQuestionId)
      || day.questions.find((question) => !masteryProgress(day, question).done) || null;
  }

  function nextMainQuestion() {
    const day = bank.days.find((item) => item.day === selectedDay);
    if (!day?.mastery) return;
    const current = currentReviewQuestion(day);
    if (!current || !masteryProgress(day, current).done) return;
    const after = day.questions.slice(day.questions.indexOf(current) + 1);
    const next = [...after, ...day.questions].find((question) => !masteryProgress(day, question).done);
    reviewQuestionId = next?.id || null;
    feedbackByQuestion = {};
    selectedAnswers = {};
    render();
  }

  function reviewQuestionsHtml(day, row) {
    const question = currentReviewQuestion(day);
    return `<main class="question-list review-one-at-a-time">
      <section class="session-overview">
        <div><p class="eyebrow">${esc(day.label)} · ${day.questionCount} main questions</p><h2>One question at a time</h2><p>For every main question, get 3 correct in a row to master it. The main question is the first answer in the streak. A wrong answer resets the streak. Up to 10 extra questions are available.</p>
          <p class="review-goal">Goal: <strong>${day.targetScore}/100</strong> · Get at least ${Math.ceil(day.targetScore * day.questionCount / 100)} of ${day.questionCount} right on the first try. Extra practice does not change your first-try score.</p>
          <p class="mastery-overview">${row.resolved} of ${day.questionCount} main questions finished · ${row.unmastered} unmastered${row.firstTryScore !== null ? ` · First try: ${row.firstTryScore}/100` : ''}</p>
        </div>
        <div class="session-progress" aria-label="${row.mastered} of ${day.questionCount} mastered"><strong>${row.mastered}<small>/${day.questionCount}</small></strong><span>mastered</span><div class="progress-track" role="progressbar" aria-label="Questions mastered" aria-valuemin="0" aria-valuemax="${day.questionCount}" aria-valuenow="${row.mastered}"><span style="width:${row.mastered / day.questionCount * 100}%"></span></div></div>
      </section>
      ${question ? masteryQuestionHtml(day, row, question) : completeHtml(day, row)}
    </main>`;
  }

  function nextPracticeQuestion(questionId) {
    const day = bank.days.find((item) => item.day === selectedDay);
    const question = day?.questions.find((item) => item.id === questionId);
    if (!day?.mastery || !question) return;
    const progress = masteryProgress(day, question);
    if (progress.done || !progress.practice.length) return;
    delete feedbackByQuestion[progress.practice.at(-1).questionId];
    render();
  }

  function allQuestionsHtml(day, dayMetrics) {
    if (day.mastery) return reviewQuestionsHtml(day, dayMetrics);
    return `
      <main class="question-list">
        <section class="session-overview">
          <div><p class="eyebrow">${esc(day.label)}</p><h2>All ${day.questionCount} questions</h2><p>Answer in any order. Each question allows two tries.</p>${day.review ? `<p class="review-goal">Goal: <strong>${day.targetScore}/100</strong> · Get at least ${Math.ceil(day.targetScore * day.questionCount / 100)} of ${day.questionCount} right on the first try.</p>` : ''}</div>
          <div class="session-progress"><strong>${dayMetrics.resolved}<small>/${day.questionCount}</small></strong><span>finished</span><div class="progress-track"><span style="width:${(dayMetrics.resolved / day.questionCount) * 100}%"></span></div></div>
        </section>
        ${dayMetrics.completed ? completeHtml(day, dayMetrics) : ""}
        ${day.questions.map((question) => questionHtml(day, dayMetrics, question)).join("")}
      </main>`;
  }

  function progressHtml(stats) {
    const questionMap = new Map([...sourceBank.days, ...bank.days.filter((day) => day.review)].flatMap((day) => day.questions.flatMap((question) => [question, ...(question.practiceQuestions || [])])).map((question) => [question.id, question]));
    const recordedAttempts = state.attempts.filter((attempt) => questionMap.has(attempt.questionId));
    const wrongAttempts = recordedAttempts.filter((attempt) => !attempt.correct);
    const completedSessions = state.sessions
      .filter((session) => session.completedAt)
      .map((session) => {
        const day = bank.days.find((item) => item.day === session.day) || sourceBank.days.find((item) => item.day === session.day);
        return day ? {
          day,
          session,
          score: firstTryScore(day, session),
          finishedAt: session.completedAt,
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
    const historyRows = [...new Set(wrongAttempts.map((attempt) => attempt.parentQuestionId || attempt.questionId))]
      .map((questionId) => {
        const question = questionMap.get(questionId);
        const attempts = recordedAttempts.filter((attempt) => attempt.questionId === questionId || attempt.parentQuestionId === questionId);
        const wrong = attempts.filter((attempt) => !attempt.correct);
        return {
          question,
          attempts,
          wrong,
          firstWrong: wrong.filter((attempt) => !attempt.parentQuestionId && attempt.attemptNumber === 1).length,
          secondWrong: wrong.filter((attempt) => !attempt.parentQuestionId && attempt.attemptNumber === 2).length,
          practiceWrong: wrong.filter((attempt) => attempt.parentQuestionId).length,
          lastChecked: attempts.at(-1)?.createdAt,
        };
      })
      .sort((a, b) => new Date(b.lastChecked || 0) - new Date(a.lastChecked || 0));
    return `
      <section class="progress-page">
        <div class="progress-heading">
          <div><p class="eyebrow">Online record</p><h2>Marco's Progress</h2><p>Every answer is saved when he presses “Check answer.” Review 1 tracks mastery separately from the main-question score. Extra practice misses appear with their main question.</p></div>
          <button class="secondary-action" data-action="view" data-view="practice" type="button">Return to practice</button>
        </div>
        ${bank.days.filter((day) => day.mastery).map((day) => `<section class="miss-record"><div class="record-heading"><h3>${esc(day.label)} mastery</h3><span>Latest round · ${metrics(day).mastered}/${day.questionCount} mastered</span></div><div class="mastery-record-grid">${day.questions.map((question) => {
          const item = masteryProgress(day, question);
          return `<article><strong>Q${question.position} · ${esc(question.skill)}</strong><span class="mastery-badge ${item.mastered ? 'mastered' : item.unmastered ? 'unmastered' : 'pending'}">${item.status}</span><p>${item.practice.length}/10 extra questions · ${item.streak}/3 correct in a row</p></article>`;
        }).join('')}</div></section>`).join('')}
        <section class="miss-record">
          <div class="record-heading"><h3>Completed sessions</h3><span>${completedSessions.length} finished</span></div>
          ${completedSessions.length === 0 ? '<div class="empty-record">Finished scores and times will appear here.</div>' : `
            <div class="record-table" role="table" aria-label="Completed session history">
              <div class="record-row record-header session-row" role="row"><span>Session</span><span>Round</span><span>Score</span><span>Finished</span></div>
              ${completedSessions.map((item) => `<div class="record-row session-row" role="row">
                <span><b>${esc(item.day.label || "Day " + item.day.day)}</b></span>
                <span>${item.session.runNumber || 1}</span>
                <span><i class="score-mark">${item.score}/100</i></span>
                <span><small>${esc(formatFinishedAt(item.finishedAt))}</small></span>
              </div>`).join("")}
            </div>`}
        </section>
        <div class="history-summary" aria-label="Wrong-answer totals">
          <div><strong>${stats.wrongQuestions}</strong><span>questions missed</span></div>
          <div><strong>${stats.wrongChecks}</strong><span>total wrong checks</span></div>
          <div><strong>${stats.firstMisses}</strong><span>wrong on first try</span></div>
          <div><strong>${stats.secondMisses}</strong><span>wrong on second try</span></div>
        </div>
        <div class="day-summary-grid">
          ${stats.rows.map((row) => `<button data-action="day" data-day="${row.day.day}" type="button">
            <span>${esc(row.day.label)}</span><strong>${row.completed ? `${row.firstTryScore}/100` : `${row.resolved}/${row.day.questionCount}`}</strong>
            <div class="mini-track"><i style="width:${(row.resolved / row.day.questionCount) * 100}%"></i></div>
            <small>${row.completed ? `Finished ${esc(formatFinishedAt(row.finishedAt))}` : row.session ? "In progress" : "Not started"} · all-time 1st miss ${row.historyFirstWrong} · 2nd miss ${row.historySecondWrong}</small>
          </button>`).join("")}
        </div>
        <section class="miss-record">
          <div class="record-heading"><h3>Wrong-answer history</h3><span>${stats.wrongChecks} wrong checks recorded</span></div>
          ${historyRows.length === 0 ? '<div class="empty-record">No wrong attempts yet. The record will update after Marco starts.</div>' : `
            <div class="record-table" role="table" aria-label="Wrong answer record">
              <div class="record-row record-header" role="row"><span>Question</span><span>Wrong times</span><span>First-try</span><span>Second-try</span><span>Last checked</span></div>
              ${historyRows.map((row) => {
                return `<div class="record-row" role="row">
                  <span><b>${row.question.sourceDay ? esc(bank.days.find((day) => day.day === row.question.day)?.label || 'Review') : `Day ${row.question.day}`} · Q${row.question.position}</b><small>${row.question.sourceDay ? `Similar to Day ${row.question.sourceDay} · ` : ''}Original #${esc(row.question.sourceNumber || "—")}${row.practiceWrong ? ` · Extra practice misses: ${row.practiceWrong}` : ''}</small></span>
                  <span><i class="wrong-count">${row.wrong.length}×</i></span>
                  <span><i class="${row.firstWrong ? "miss-mark" : "clear-mark"}">${row.firstWrong || "—"}</i></span>
                  <span><i class="${row.secondWrong ? "miss-mark strong" : "clear-mark"}">${row.secondWrong || "—"}</i></span>
                  <span><small>${new Date(row.lastChecked).toLocaleString()}</small></span>
                </div>`;
              }).join("")}
            </div>`}
        </section>
      </section>`;
  }

  function render() {
    if (!bank) return;
    const stats = summary();
    const day = bank.days.find((item) => item.day === selectedDay) || bank.days[0];
    const dayMetrics = metrics(day);
    app.className = "site-shell";
    const navigation = day.mastery ? `<details class="session-picker"><summary>${esc(day.label)} · Change session</summary>${railHtml(day)}</details>` : railHtml(day);
    app.innerHTML = `${headerHtml()}${view === "progress" ? progressHtml(stats) : `<section class="workspace">${navigation}${allQuestionsHtml(day, dayMetrics)}</section>`}`;
  }

  app.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "view") { view = button.dataset.view || "practice"; feedbackByQuestion = {}; selectedAnswers = {}; render(); }
    if (action === "day") chooseDay(Number(button.dataset.day));
    if (action === "select-answer") selectAnswer(button.dataset.questionId, Number(button.dataset.index));
    if (action === "check-answer") {
      const questionId = button.dataset.questionId;
      const selectedAnswer = selectedAnswers[questionId];
      if (selectedAnswer !== undefined) answer(questionId, selectedAnswer);
    }
    if (action === "restart") startAgain();
    if (action === "next-practice") nextPracticeQuestion(button.dataset.questionId);
    if (action === "next-main") nextMainQuestion();
  });

  Promise.all(['question-bank.json', 'session-plan.json?v=1', 'review-bank.json?v=2', 'review1-practice-bank.json?v=1'].map(async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('The practice sessions could not be loaded. Please refresh.');
    return response.json();
  }))
    .then(([questionBank, plan, reviewBank, practiceBank]) => {
      organizeBank(questionBank, plan, reviewBank, practiceBank);
      state = loadLocal();
      selectedDay = nextPracticeDay().day;
      render();
      sync = window.MarcoOnlineSync.create({
        appId: APP_ID,
        studentName: "Marco",
        validate: validState,
        score(value) {
          return value.attempts.length * 10 + value.sessions.filter((session) => session.completedAt).length;
        },
        onRemote(remoteState) {
          state = remoteState;
          if (!hasChosenDay) selectedDay = nextPracticeDay().day;
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
          feedbackByQuestion = {};
          selectedAnswers = {};
          render();
        },
      });
      sync.start(state);
    })
    .catch((error) => {
      app.className = "loading";
      app.innerHTML = `<div class="loading-mark">!</div><strong>${esc(error.message)}</strong>`;
    });
})();
