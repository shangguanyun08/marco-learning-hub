import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile(new URL("./shared-activity-dashboard.js", import.meta.url), "utf8");
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
class Node {
  constructor() { this.children = []; this.text = ""; }
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(" "); }
  setAttribute() {}
  append(...children) { this.children.push(...children); }
  replaceChildren() { this.children = []; }
}
async function dashboard(data) {
  const nodes = new Map();
  let timer;
  let response = data;
  const context = vm.createContext({
    document: { getElementById(id) { if (!nodes.has(id)) nodes.set(id, new Node()); return nodes.get(id); }, createElement: () => new Node(), createTextNode(text) { const node = new Node(); node.textContent = text; return node; }, addEventListener() {} },
    window: { setInterval(callback) { timer = callback; } },
    fetch: async () => ({ ok: response !== null, json: async () => response || { error: "Unavailable" } }),
  });
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

test("missing subject data and fetch errors show unavailable instead of fabricated zeros", async () => {
  const { nodes, refresh } = await dashboard({ history: [{ date: today, students: { Marco: { minutes: 4, sessions: 2 } } }] });
  assert.equal(nodes.get("marco-word-sessions").textContent, "—");
  assert.equal(nodes.get("marco-math-sessions").textContent, "—");
  await refresh(null);
  assert.equal(nodes.get("marco-minutes").textContent, "—");
  assert.equal(nodes.get("harry-word-sessions").textContent, "—");
});
