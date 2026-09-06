import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile(new URL("./shared-activity-dashboard.js", import.meta.url), "utf8");
const masterySource = await readFile(new URL("./shared-math-mastery.js", import.meta.url), "utf8");
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
class Node {
  constructor() { this.children = []; this.text = ""; }
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(" "); }
  setAttribute() {}
  append(...children) { this.children.push(...children); }
  replaceChildren() { this.children = []; }
}
async function dashboard(data, progress = {}) {
  const nodes = new Map();
  let timer;
  let response = data;
  const context = vm.createContext({
    document: { getElementById(id) { if (!nodes.has(id)) nodes.set(id, new Node()); return nodes.get(id); }, createElement: () => new Node(), createTextNode(text) { const node = new Node(); node.textContent = text; return node; }, addEventListener() {} },
    window: { setInterval(callback) { timer = callback; } },
    fetch: async url => {
      if (url.includes("appId=")) {
        const student = url.includes("appId=marco-") ? "Marco" : "Harry";
        if (progress[student] instanceof Error) throw progress[student];
        return { ok: true, json: async () => ({ progress: progress[student] ? { state: progress[student] } : null }) };
      }
      return { ok: response !== null, json: async () => response || { error: "Unavailable" } };
    },
  });
  vm.runInContext(masterySource, context);
  vm.runInContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return { nodes, async refresh(value) { response = value; await timer(); } };
}

test("today and each historical day show separate subject counts", async () => {
  const { nodes, refresh } = await dashboard({ history: [
    { date: today, students: { Marco: { minutes: 6, sessions: 5, wordSessions: 2, mathSessions: 3 }, Harry: { minutes: 11, sessions: 1, wordSessions: 1, mathSessions: 0 } } },
    { date: "2026-08-28", students: { Marco: { minutes: 0, sessions: 3, wordSessions: 3, mathSessions: 0 }, Harry: { minutes: 0, sessions: 1, wordSessions: 1, mathSessions: 0 } } },
  ] });
  assert.equal(nodes.get("marco-word-sessions").textContent, "2");
  assert.equal(nodes.get("marco-math-sessions").textContent, "3");
  assert.equal(nodes.get("harry-word-sessions").textContent, "1");
  assert.equal(nodes.get("harry-math-sessions").textContent, "0");
  assert.match(nodes.get("activity-history").textContent, /2 word sessions 3 math sessions/);
  assert.match(nodes.get("activity-history").textContent, /3 word sessions 0 math sessions/);
  await refresh({ history: [{ date: today, students: { Marco: { minutes: 7, sessions: 6, wordSessions: 3, mathSessions: 3 } } }] });
  assert.equal(nodes.get("marco-word-sessions").textContent, "3");
  assert.equal(nodes.get("marco-minutes").textContent, "7");
});

test("mastery dates appear even without minutes, refresh without duplicates, and isolate unavailable counts", async () => {
  const record = { firstTry: true, review: { attempts: [
    { correct: true }, { correct: true, createdAt: `${today}T19:00:00Z` },
  ] } };
  const progress = { Harry: { 6: { questions: [record, { masteryCredit: "parent-confirmed" }] } } };
  const { nodes, refresh } = await dashboard({ history: [] }, progress);
  assert.equal(nodes.get("harry-math-mastered").textContent, "1");
  assert.equal(nodes.get("marco-math-mastered").textContent, "0");
  assert.match(nodes.get("activity-history").textContent, /1 math question mastered/);
  assert.match(nodes.get("today-log-note").textContent, /without a saved date/);
  await refresh({ history: [] });
  assert.equal(nodes.get("harry-math-mastered").textContent, "1");
  progress.Marco = new Error("Offline");
  await refresh({ history: [] });
  assert.equal(nodes.get("marco-math-mastered").textContent, "—");
  assert.equal(nodes.get("harry-math-mastered").textContent, "1");
  assert.equal(nodes.get("harry-minutes").textContent, "0");
  record.review.attempts[1].createdAt = "2026-08-28T19:00:00Z";
  await refresh({ history: [] });
  assert.equal(nodes.get("harry-math-mastered").textContent, "0");
  assert.match(nodes.get("activity-history").textContent, /Aug 28, 2026/);
  assert.match(nodes.get("activity-history").textContent, /1 math question mastered/);
});

test("missing subject data and fetch errors show unavailable instead of fabricated zeros", async () => {
  const { nodes, refresh } = await dashboard({ history: [{ date: today, students: { Marco: { minutes: 4, sessions: 2 } } }] });
  assert.equal(nodes.get("marco-word-sessions").textContent, "—");
  assert.equal(nodes.get("marco-math-sessions").textContent, "—");
  await refresh(null);
  assert.equal(nodes.get("marco-minutes").textContent, "—");
  assert.equal(nodes.get("harry-word-sessions").textContent, "—");
});
