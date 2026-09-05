import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const source = ["day3-mastery.js", "app.js"].map(file => readFileSync(new URL(file, import.meta.url), "utf8")).join("\n");
const STORAGE_KEY = "harry-math-practice-record-v1";
const clone = value => JSON.parse(JSON.stringify(value));

function boot(saved = {}, online = false) {
  const dom = new JSDOM(html, { url: online ? "https://example.com/harry-math-practice/" : "http://localhost/harry-math-practice/", runScripts: "outside-only" });
  const w = dom.window;
  w.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  let options;
  const pushed = [];
  if (online) w.MarcoOnlineSync = { create(value) { options = value; return { start() {}, push(state) { pushed.push(clone(state)); } }; } };
  w.eval(`${source}\nglobalThis.testApi = { questionSets, day3Banks, recordStats, syncScore, isCorrectAnswer, get records() { return records; } };`);
  w.document.querySelector('[data-set="6"]').click();
  return { w, api: w.testApi, pushed, remote: value => options.onRemote(clone(value)), close: () => dom.window.close() };
}

const card = (app, index) => app.w.document.querySelector(`[data-question="${index + 1}"]`);
const record = (app, index = 0) => app.api.records[6].questions[index];
const progress = (app, index = 0) => app.w.HarryDay3Mastery.progress(record(app, index));
const saved = app => JSON.parse(app.w.localStorage.getItem(STORAGE_KEY));
const indexes = app => app.api.questionSets[6].map((q, i) => q.removed ? -1 : i).filter(i => i !== -1);
const nextMain = app => app.w.document.querySelector("#day3-next").click();

function submitMain(app, index, value) {
  const node = card(app, index);
  const choice = [...node.querySelectorAll("form .choice-option")].find(option => option.dataset.value === String(value));
  if (choice && !node.querySelector(".mastery-practice")) choice.click();
  else { node.querySelector("input").value = String(value); node.querySelector("form").requestSubmit(); }
}

function submitExtra(app, index, correct) {
  card(app, index).querySelector(".next-practice")?.click();
  const question = app.api.day3Banks[index][progress(app, index).used];
  const value = correct ? question.answer : question.choices?.find(choice => !app.api.isCorrectAnswer(String(choice), question)) ?? -999;
  const panel = card(app, index).querySelector(".mastery-practice");
  const choice = [...panel.querySelectorAll(".choice-option")].find(option => option.textContent === String(value));
  if (choice) choice.click();
  else { panel.querySelector("input").value = String(value); panel.querySelector("form").requestSubmit(); }
}

test("Day 3 shows one of 10 main questions, with 100 distinct, correct, skill-matched follow-ups", () => {
  const app = boot();
  const { api, w } = app;
  assert.equal(w.document.querySelectorAll(".question-card:not([hidden])").length, 1);
  assert.equal(indexes(app).length, 10);
  assert.equal(indexes(app).flatMap(i => api.day3Banks[i]).length, 100);
  assert.equal(w.document.querySelector("#day3-mastered-count").textContent, "0 of 10 mastered");
  assert.equal(w.document.querySelector("#day3-position").textContent, "Question 1 of 10");
  assert.equal(w.document.querySelector("#day3-next").disabled, true);
  assert.equal(w.document.querySelectorAll(".mastery-practice").length, 0);
  api.day3Banks.forEach((bank, index) => {
    assert.equal(bank.length, 10);
    const signatures = new Set();
    for (const q of bank) {
      assert.equal(q.skill, api.questionSets[6][index].skill);
      const signature = JSON.stringify([q.prompt, q.left, q.operator, q.right, q.numerator, q.denominator, q.equivalentDenominator]);
      signatures.add(signature);
      const parent = api.questionSets[6][index];
      assert.notEqual(signature, JSON.stringify([parent.prompt, parent.left, parent.operator, parent.right, parent.numerator, parent.denominator, parent.equivalentDenominator]));
      if (q.kind === "fraction") assert.equal(q.answer / q.equivalentDenominator, q.numerator / q.denominator);
      else if (q.kind === "decimalFraction") {
        const [n, d] = q.answer.split("/").map(Number);
        assert.ok(Math.abs(n / d - q.decimal) < 1e-10);
      } else if (q.kind === "placeValue") {
        const [, digit, number] = q.prompt.match(/digit (\d) in ([\d.]+)/);
        const [whole, fraction] = number.split(".");
        assert.equal(q.answer === "ones" ? whole.at(-1) : fraction[["tenths", "hundredths", "thousandths"].indexOf(q.answer)], digit);
      } else {
        const expected = q.operator === "×" ? q.left * q.right : q.operator === "÷" ? q.left / q.right : q.operator === "+" ? q.left + q.right : q.left - q.right;
        assert.ok(Math.abs(q.answer - expected) < 1e-10);
      }
      if (q.choices) {
        assert.equal(q.choices.length, 4);
        assert.equal(new Set(q.choices).size, 4);
        assert.equal(q.choices.filter(choice => api.isCorrectAnswer(String(choice), q)).length, 1);
      }
    }
    assert.equal(signatures.size, 10);
  });
  app.close();
});

test("blank input does not count; a correct main answer starts a streak of 1 and needs 2 more", () => {
  const app = boot();
  submitMain(app, 0, "");
  assert.equal(record(app).firstTry, null);
  assert.equal(record(app).attempts, 0);
  submitMain(app, 0, 981);
  assert.equal(progress(app).status, "practicing");
  assert.equal(progress(app).streak, 1);
  assert.ok(card(app, 0).querySelector(".mastery-practice"));
  assert.equal(app.w.document.querySelector("#day3-mastered-count").textContent, "0 of 10 mastered");
  submitMain(app, 0, 0);
  assert.equal(record(app).attempts, 1);
  assert.equal(record(app).firstTry, true);
  submitExtra(app, 0, true);
  assert.equal(progress(app).streak, 2);
  assert.equal(progress(app).status, "practicing");
  submitExtra(app, 0, true);
  assert.equal(progress(app).streak, 3);
  assert.equal(progress(app).used, 2);
  assert.equal(progress(app).status, "mastered");
  assert.equal(app.w.document.querySelector("#day3-mastered-count").textContent, "1 of 10 mastered");
  assert.equal(app.api.recordStats(6).right, 1);
  const restored = boot(saved(app));
  assert.equal(progress(restored).status, "mastered");
  assert.equal(progress(restored).used, 2);
  restored.close();
  app.close();
});

test("a wrong follow-up after a correct main answer resets the whole streak", () => {
  const app = boot();
  submitMain(app, 0, 981);
  submitExtra(app, 0, true);
  assert.equal(progress(app).streak, 2);
  submitExtra(app, 0, false);
  assert.equal(progress(app).streak, 0);
  for (let i = 0; i < 2; i++) submitExtra(app, 0, true);
  assert.equal(progress(app).status, "practicing");
  submitExtra(app, 0, true);
  assert.equal(progress(app).status, "mastered");
  assert.equal(progress(app).used, 5);
  assert.equal(record(app).firstTry, true);
  app.close();
});

test("a missed main question locks its first try, opens only its own first extra, and needs 3 new correct answers", () => {
  const app = boot();
  submitMain(app, 0, -1);
  assert.equal(app.w.document.querySelectorAll(".mastery-practice").length, 1);
  assert.equal(card(app, 0).querySelectorAll(".mastery-practice form").length, 1);
  assert.equal(card(app, 0).querySelector("input").disabled, true);
  submitMain(app, 0, 981);
  assert.equal(record(app).attempts, 1);
  const panel = card(app, 0).querySelector(".mastery-practice");
  panel.querySelector("form").requestSubmit();
  assert.equal(progress(app).used, 0);
  for (let i = 0; i < 3; i++) {
    submitExtra(app, 0, true);
    assert.equal(progress(app).used, i + 1);
    assert.equal(progress(app).status, i === 2 ? "mastered" : "practicing");
    assert.equal(card(app, 0).querySelectorAll(".mastery-practice form").length, 0, "Each answer is checked once, then waits for Next");
  }
  assert.equal(card(app, 0).querySelector(".next-practice"), null);
  assert.equal(record(app).firstTry, false);
  assert.equal(app.api.recordStats(6).right, 0);
  app.close();
});

test("every wrong extra resets the consecutive streak; separated correct answers do not qualify", () => {
  const app = boot();
  submitMain(app, 0, -1);
  [true, false, true, true, false, true, true].forEach(correct => submitExtra(app, 0, correct));
  assert.equal(progress(app).streak, 2);
  assert.equal(progress(app).status, "practicing");
  submitExtra(app, 0, true);
  assert.equal(progress(app).used, 8);
  assert.equal(progress(app).status, "mastered");
  app.close();
});

test("all 10 main questions can recover one at a time with independent streaks and a live mastered count", () => {
  const app = boot();
  for (const [position, i] of indexes(app).entries()) {
    const q = app.api.questionSets[6][i];
    assert.equal(card(app, i).hidden, false);
    assert.equal(app.w.document.querySelectorAll(".question-card:not([hidden])").length, 1);
    if (position > 0) {
      app.w.document.querySelector("#day3-previous").click();
      assert.equal(card(app, indexes(app)[position - 1]).hidden, false);
      nextMain(app);
      assert.equal(card(app, i).hidden, false);
    }
    submitMain(app, i, q.choices?.find(value => !app.api.isCorrectAnswer(String(value), q)) ?? -999);
    assert.equal(progress(app, i).streak, 0);
    nextMain(app);
    assert.equal(card(app, i).hidden, false, "Finish the current follow-ups before moving on");
    for (let round = 0; round < 3; round++) submitExtra(app, i, true);
    assert.equal(app.w.document.querySelector("#day3-mastered-count").textContent, `${position + 1} of 10 mastered`);
    assert.equal(app.w.document.querySelector("#day3-mastered-progress").value, position + 1);
    nextMain(app);
  }
  assert.equal(app.api.recordStats(6).wrong, 10);
  assert.equal(app.api.recordStats(6).solved, 10);
  assert.equal(app.api.recordStats(6).right, 0);
  assert.equal(app.w.document.querySelector("#complete-card").hidden, false);
  app.close();
});

test("a reload resumes the next unfinished main question and preserves the mastered total", () => {
  const app = boot();
  submitMain(app, 0, 981);
  submitExtra(app, 0, true);
  submitExtra(app, 0, true);
  const restored = boot(saved(app));
  assert.equal(card(restored, 2).hidden, false);
  assert.equal(restored.w.document.querySelector("#day3-position").textContent, "Question 2 of 10");
  assert.equal(restored.w.document.querySelector("#day3-mastered-count").textContent, "1 of 10 mastered");
  assert.equal(restored.w.document.querySelectorAll(".question-card:not([hidden])").length, 1);
  app.close(); restored.close();
});

test("a third consecutive correct answer on extra 10 still earns Mastered", () => {
  const app = boot();
  submitMain(app, 0, -1);
  [...Array(7).fill(false), true, true, true].forEach(correct => submitExtra(app, 0, correct));
  assert.equal(progress(app).used, 10);
  assert.equal(progress(app).status, "mastered");
  assert.equal(card(app, 0).querySelector(".next-practice"), null);
  app.close();
});

test("10 extras without a streak is terminal Unmastered and the day can finish honestly", () => {
  const app = boot();
  submitMain(app, 0, -1);
  [true,true,false,true,true,false,true,true,false,true].forEach(correct => submitExtra(app, 0, correct));
  assert.equal(progress(app).status, "unmastered");
  assert.equal(card(app, 0).querySelector(".mastery-practice form"), null);
  assert.equal(app.w.HarryDay3Mastery.submit(record(app), "0", app.api.day3Banks[0], app.api.isCorrectAnswer), false);
  assert.equal(app.w.HarryDay3Mastery.next(record(app)), false);
  for (const i of indexes(app).slice(1)) {
    nextMain(app);
    submitMain(app, i, app.api.questionSets[6][i].answer);
    submitExtra(app, i, true);
    submitExtra(app, i, true);
  }
  assert.equal(app.api.recordStats(6).finished, 10);
  assert.equal(app.api.recordStats(6).solved, 9);
  assert.equal(app.api.recordStats(6).unmastered, 1);
  assert.equal(app.w.document.querySelector("#first-try-score").textContent, "90");
  assert.match(app.w.document.querySelector("#complete-title").textContent, /1 unmastered/);
  assert.ok(saved(app)[6].completedAt);
  const restored = boot(saved(app));
  assert.equal(progress(restored).status, "unmastered");
  assert.equal(restored.api.records[6].completedAt, app.api.records[6].completedAt);
  app.close(); restored.close();
});

test("reload and day switches preserve the next question, feedback, streak, and original scoring", () => {
  const app = boot();
  submitMain(app, 0, -1);
  submitExtra(app, 0, true);
  submitExtra(app, 0, true);
  const snapshot = saved(app);
  app.w.document.querySelector('[data-set="7"]').click();
  assert.equal(app.w.document.querySelectorAll(".mastery-practice").length, 0);
  app.w.document.querySelector('[data-set="6"]').click();
  assert.equal(progress(app, 0).streak, 2);
  const restored = boot(snapshot);
  assert.match(card(restored, 0).textContent, /2\/3 right in a row · 2\/10 used/);
  assert.ok(card(restored, 0).querySelector(".next-practice"));
  card(restored, 0).querySelector(".next-practice").click();
  const readyReload = boot(saved(restored));
  assert.match(card(readyReload, 0).textContent, /Practice 3 of 10/);
  submitExtra(readyReload, 0, true);
  assert.equal(progress(readyReload, 0).status, "mastered");
  assert.equal(record(readyReload, 0).firstTry, false);
  app.close(); restored.close(); readyReload.close();
});

test("online sync includes follow-up answers and restores them on another device", () => {
  const app = boot({}, true);
  submitMain(app, 0, -1);
  const before = app.api.syncScore(app.api.records);
  submitExtra(app, 0, true);
  assert.ok(app.api.syncScore(app.api.records) > before);
  assert.equal(app.pushed.at(-1)[6].questions[0].review.attempts.length, 1);
  const other = boot({}, true);
  other.remote(app.pushed.at(-1));
  assert.equal(progress(other, 0).streak, 1);
  assert.ok(card(other, 0).querySelector(".next-practice"));
  assert.equal(other.pushed.length, 0, "Displaying a synced snapshot must not create a new answer");
  submitExtra(other, 0, true);
  submitExtra(other, 0, true);
  assert.equal(progress(other, 0).status, "mastered");
  app.close(); other.close();
});

test("legacy Day 3 answers retain their slots and first tries; corrected mistakes still need mastery evidence", () => {
  const old = { 6: { completedAt: "2026-09-01T00:00:00Z", questions: Array.from({ length: 14 }, (_, i) => ({ firstTry: i !== 0, solved: true, attempts: i === 0 ? 2 : 1, lastAnswer: String(i) })) } };
  const app = boot(old);
  assert.equal(record(app).attempts, 2);
  assert.equal(record(app).firstTry, false);
  assert.equal(progress(app).status, "practicing");
  assert.equal(progress(app, 1).status, "practicing");
  assert.equal(progress(app, 1).streak, 1);
  assert.equal(record(app, 13).lastAnswer, "13");
  assert.equal(app.api.records[6].questions.length, 14);
  assert.equal(app.api.records[6].completedAt, null);
  assert.equal(app.w.document.querySelector("#complete-card").hidden, true);
  app.close();
});

test("stored follow-up correctness and streaks are recalculated from answers, capped at 10 and stopped at mastery", () => {
  const app = boot();
  const bank = app.api.day3Banks[0];
  const normalize = value => app.w.HarryDay3Mastery.normalizeReview(value, bank, app.api.isCorrectAnswer);
  assert.equal(normalize({ attempts: Array(20).fill({ answer: "-1", correct: true }) }).attempts.length, 10);
  assert.equal(normalize({ attempts: bank.map(q => ({ answer: String(q.answer), correct: false })) }).attempts.length, 3);
  assert.equal(app.w.HarryDay3Mastery.normalizeReview({ attempts: bank.map(q => ({ answer: String(q.answer), correct: false })) }, bank, app.api.isCorrectAnswer, true).attempts.length, 2);
  assert.equal(normalize({ attempts: [null] }).attempts.length, 0);
  assert.equal(normalize({ attempts: [{ answer: "", correct: true }] }).attempts.length, 0);
  app.close();
});

test("other days retain their question counts and recalculate-and-retry behavior", () => {
  const app = boot();
  for (const [set, count] of [[4,14],[5,14],[7,10],[8,10]]) {
    app.w.document.querySelector(`[data-set="${set}"]`).click();
    assert.equal(app.w.document.querySelectorAll(".question-card:not([hidden])").length, count);
    assert.equal(app.w.document.querySelectorAll(".mastery-badge, .mastery-practice").length, 0);
    submitMain(app, 0, -1);
    assert.equal(card(app, 0).querySelector("input").disabled, false);
    submitMain(app, 0, app.api.questionSets[set][0].answer);
    assert.equal(app.api.records[set].questions[0].solved, true);
    assert.equal(app.api.records[set].questions[0].firstTry, false);
    assert.equal(app.api.records[set].questions[0].attempts, 2);
  }
  app.close();
});
