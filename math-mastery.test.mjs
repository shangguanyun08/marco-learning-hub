import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const window = {};
vm.runInNewContext(readFileSync(new URL("./shared-math-mastery.js", import.meta.url), "utf8"), { window });
const summarize = (student, state) => JSON.parse(JSON.stringify(window.DailyMathMastery.summarize(student, state)));

test("Marco earns one main-question mastery on the third green, using Pacific time and deduplicating rounds", () => {
  const state = { sessions: [{ id: "s1", day: 29 }], attempts: [] };
  const add = (id, number, correct, createdAt, sessionId = "s1") => state.attempts.push({
    id: `${sessionId}:${id}:${number}`, sessionId, questionId: number ? `${id}-p${number}` : id,
    attemptNumber: 1, correct, createdAt,
    ...(number ? { parentQuestionId: id, practiceNumber: number } : {}),
  });
  add("q1", 0, true, "2026-09-06T06:58:00Z");
  add("q1", 1, true, "2026-09-06T06:59:00Z");
  assert.deepEqual(summarize("Marco", state), { counts: {}, undated: 0 });
  add("q1", 2, true, "2026-09-06T07:00:00Z");
  add("q2", 0, false, "2026-09-06T05:00:00Z");
  add("q2", 1, true, "2026-09-06T05:01:00Z");
  add("q2", 2, false, "2026-09-06T05:02:00Z");
  add("q2", 3, true, "2026-09-06T05:03:00Z");
  add("q2", 4, true, "2026-09-06T05:04:00Z");
  assert.deepEqual(summarize("Marco", state).counts, { "2026-09-06": 1 });
  add("q2", 5, true, "2026-09-06T06:59:00Z");
  state.sessions.push({ id: "inherited", day: 29, inheritedAttemptIds: state.attempts.map(a => a.id) });
  state.sessions.push({ id: "s2", day: 29 });
  for (let n = 0; n < 3; n++) add("q1", n, true, "2026-09-07T18:00:00Z", "s2");
  // An ordinary session marked finished is not three-in-a-row mastery.
  state.sessions.push({ id: "ordinary", day: 30, completedAt: "2026-09-07T18:00:00Z" });
  for (let n = 0; n < 3; n++) add("q3", n, true, "2026-09-07T18:00:00Z", "ordinary");
  assert.deepEqual(summarize("Marco", state), { counts: { "2026-09-06": 1, "2026-09-05": 1 }, undated: 0 });
});

test("Harry's older and parent-confirmed mastery stays undated; retries and solved flags do not inflate counts", () => {
  const questions = [
    { firstTry: true, solved: true },
    { firstTry: false, review: { attempts: [{ correct: true }, { correct: true }, { correct: false }] } },
    { firstTry: true, review: { attempts: [{ correct: true }, { correct: true }] } },
    { masteryCredit: "parent-confirmed" },
    { firstTry: false, review: { attempts: [{ correct: true }, { correct: true }, { correct: true, createdAt: "2026-01-07T07:59:00Z" }] } },
  ];
  assert.deepEqual(summarize("Harry", { 6: { questions } }), { counts: { "2026-01-06": 1 }, undated: 2 });
});
