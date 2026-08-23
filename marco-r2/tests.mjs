import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { questionBank } from "./questions.js";
import {
  activateSession,
  advanceQuestion,
  createProgress,
  currentAnswer,
  recordAnswer,
} from "./core.js";

const answers = Object.fromEntries(
  questionBank.questions.map((question) => [question.id, question.answer]),
);

test("contains exactly the 249 unique Round 1 misses", () => {
  assert.equal(questionBank.questions.length, 249);
  assert.equal(new Set(questionBank.questions.map((q) => q.originalId)).size, 249);
  assert.deepEqual(
    questionBank.sessions.map((session) => session.count),
    [50, 50, 50, 50, 49],
  );
  for (const question of questionBank.questions) {
    assert.equal(question.options.length, 4);
    assert.ok(["A", "B", "C", "D"].includes(question.answer));
  }
});

test("new progress begins with R2 Session 1 at Round 2", () => {
  const progress = createProgress(
    questionBank.sessions,
    questionBank.questions,
    questionBank.initialRound,
  );
  assert.equal(progress.selectedSession, 1);
  assert.equal(progress.sessions["1"].round.roundNumber, 2);
  assert.equal(progress.sessions["1"].round.questionIds.length, 50);
  assert.match(progress.sessions["1"].attemptId, /^[a-zA-Z0-9-]{8,80}$/);
  assert.equal(progress.sessions["2"].started, false);
});

test("answers lock after the first choice", () => {
  let progress = createProgress(
    questionBank.sessions,
    questionBank.questions,
    questionBank.initialRound,
  );
  const id = progress.sessions["1"].round.questionIds[0];
  progress = recordAnswer(progress, id, "A");
  progress = recordAnswer(progress, id, "D");
  assert.equal(currentAnswer(progress), "A");
});

test("misses alone advance from Round 2 to Round 3", () => {
  let progress = createProgress(
    questionBank.sessions,
    questionBank.questions,
    questionBank.initialRound,
  );
  const ids = progress.sessions["1"].round.questionIds;
  const missedId = ids[7];

  for (const id of ids) {
    const letter = id === missedId
      ? (answers[id] === "A" ? "B" : "A")
      : answers[id];
    progress = recordAnswer(progress, id, letter);
    progress = advanceQuestion(progress, answers);
  }

  assert.equal(progress.sessions["1"].round.roundNumber, 3);
  assert.deepEqual(progress.sessions["1"].round.questionIds, [missedId]);
  assert.deepEqual(progress.sessions["1"].history[0].wrongIds, [missedId]);
});

test("a fully correct final session is mastered", () => {
  let progress = createProgress(
    questionBank.sessions,
    questionBank.questions,
    questionBank.initialRound,
  );
  progress = activateSession(
    progress,
    5,
    questionBank.sessions,
    questionBank.questions,
    questionBank.initialRound,
  );
  const ids = progress.sessions["5"].round.questionIds;

  for (const id of ids) {
    progress = recordAnswer(progress, id, answers[id]);
    progress = advanceQuestion(progress, answers);
  }

  assert.equal(progress.sessions["5"].completed, true);
  assert.equal(progress.sessions["5"].round, null);
  assert.equal(progress.sessions["5"].history[0].correctCount, 49);
});

test("the published app uses shared online progress and live polling", async () => {
  const app = await readFile(
    new URL("./app-online.js", import.meta.url),
    "utf8",
  );
  assert.match(app, /alexsoton\.chatgpt\.site\/api\/r2/);
  assert.match(app, /POLL_INTERVAL_MS = 5000/);
  assert.match(app, /saveFinishedRound/);
  assert.match(app, /migrateProgress/);
  assert.match(app, /Online record · all devices/);
});
