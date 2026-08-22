const PROGRESS_VERSION = 1;

function now() {
  return new Date().toISOString();
}

function copy(value) {
  return structuredClone(value);
}

export function createRound(roundNumber, questionIds) {
  return {
    roundNumber,
    questionIds: [...questionIds],
    answers: {},
    position: 0,
    startedAt: now(),
  };
}

function freshSession(meta, questions, started, initialRound) {
  const ids = questions
    .filter((question) => question.r2Session === meta.number)
    .map((question) => question.id);
  return {
    started,
    completed: false,
    round: started ? createRound(initialRound, ids) : null,
    history: [],
    updatedAt: now(),
  };
}

export function createProgress(sessions, questions, initialRound = 2) {
  const state = {};
  for (const meta of sessions) {
    state[String(meta.number)] = freshSession(
      meta,
      questions,
      meta.number === 1,
      initialRound,
    );
  }
  return {
    version: PROGRESS_VERSION,
    selectedSession: 1,
    sessions: state,
  };
}

export function isProgressValid(progress, sessions, questions) {
  if (!progress || progress.version !== PROGRESS_VERSION) return false;
  if (!sessions.some((item) => item.number === progress.selectedSession)) return false;
  const validIds = new Set(questions.map((question) => question.id));
  return sessions.every((meta) => {
    const session = progress.sessions?.[String(meta.number)];
    if (!session || !Array.isArray(session.history)) return false;
    if (!session.round) return session.completed || !session.started;
    return (
      Array.isArray(session.round.questionIds) &&
      session.round.questionIds.length > 0 &&
      session.round.questionIds.every((id) => validIds.has(id)) &&
      session.round.position >= 0 &&
      session.round.position < session.round.questionIds.length
    );
  });
}

export function activateSession(
  progress,
  sessionNumber,
  sessions,
  questions,
  initialRound = 2,
) {
  const next = copy(progress);
  const meta = sessions.find((item) => item.number === sessionNumber);
  if (!meta) return next;
  next.selectedSession = sessionNumber;
  const session = next.sessions[String(sessionNumber)];
  if (!session.started && !session.completed) {
    next.sessions[String(sessionNumber)] = freshSession(
      meta,
      questions,
      true,
      initialRound,
    );
  }
  return next;
}

export function currentAnswer(progress) {
  const session = progress.sessions[String(progress.selectedSession)];
  const round = session?.round;
  if (!round) return "";
  return round.answers[String(round.questionIds[round.position])] || "";
}

export function answeredCount(session) {
  if (!session?.round) return 0;
  return session.round.questionIds.filter(
    (id) => Boolean(session.round.answers[String(id)]),
  ).length;
}

export function recordAnswer(progress, questionId, letter) {
  const next = copy(progress);
  const session = next.sessions[String(next.selectedSession)];
  const round = session?.round;
  if (!round || round.questionIds[round.position] !== questionId) return next;
  if (round.answers[String(questionId)]) return next;
  round.answers[String(questionId)] = letter;
  session.updatedAt = now();
  return next;
}

export function advanceQuestion(progress, answerKey) {
  const next = copy(progress);
  const session = next.sessions[String(next.selectedSession)];
  const round = session?.round;
  if (!round) return next;
  const currentId = round.questionIds[round.position];
  if (!round.answers[String(currentId)]) return next;

  if (round.position < round.questionIds.length - 1) {
    round.position += 1;
    session.updatedAt = now();
    return next;
  }

  const wrongIds = round.questionIds.filter(
    (id) => round.answers[String(id)] !== answerKey[id],
  );
  const record = {
    roundNumber: round.roundNumber,
    questionIds: [...round.questionIds],
    answers: { ...round.answers },
    correctCount: round.questionIds.length - wrongIds.length,
    wrongIds,
    startedAt: round.startedAt,
    finishedAt: now(),
  };
  session.history.push(record);
  session.updatedAt = record.finishedAt;

  if (wrongIds.length) {
    session.round = createRound(round.roundNumber + 1, wrongIds);
  } else {
    session.round = null;
    session.completed = true;
  }
  return next;
}

export function restartSession(
  progress,
  sessionNumber,
  sessions,
  questions,
  initialRound = 2,
) {
  const next = copy(progress);
  const meta = sessions.find((item) => item.number === sessionNumber);
  if (!meta) return next;
  const previousHistory = next.sessions[String(sessionNumber)]?.history || [];
  next.sessions[String(sessionNumber)] = {
    ...freshSession(meta, questions, true, initialRound),
    history: previousHistory,
  };
  next.selectedSession = sessionNumber;
  return next;
}

export function sessionStatus(session) {
  if (session.completed) return "Mastered";
  if (!session.started) return "Not started";
  return `Round ${session.round?.roundNumber ?? 2} · ${answeredCount(session)}/${session.round?.questionIds.length ?? 0}`;
}
