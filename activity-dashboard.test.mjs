import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile(new URL("./shared-activity-dashboard.js", import.meta.url), "utf8");
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
class Node {
  constructor() { this.children = []; this.text = ""; }
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(""); }
  setAttribute() {}
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
}
async function dashboard(data) {
  const nodes = new Map(), requests = [];
  let timer, response = data;
  const context = vm.createContext({
    document: { getElementById(id) { if (!nodes.has(id)) nodes.set(id, new Node()); return nodes.get(id); }, createElement: () => new Node(), createTextNode(text) { const node = new Node(); node.textContent = text; return node; }, addEventListener() {} },
    window: { setInterval(callback) { timer = callback; } },
    fetch: async url => {
      requests.push(url);
      return { ok: response !== null, json: async () => response || { error: "Unavailable" } };
    },
  });
  vm.runInContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return { nodes, requests, async refresh(value) { response = value; await timer(); } };
}

test("today and history show only minutes and refresh without extra mastery requests", async () => {
  const { nodes, requests, refresh } = await dashboard({ history: [
    { date: today, students: { Marco: { minutes: 6, wordSessions: 2, mathSessions: 3 }, Harry: { minutes: 11, wordSessions: 1, mathSessions: 0 } } },
    { date: "2026-08-28", students: { Marco: { minutes: 5 }, Harry: { minutes: 4 } } },
  ] });
  assert.equal(nodes.get("marco-minutes").textContent, "6");
  assert.equal(nodes.get("harry-minutes").textContent, "11");
  assert.match(nodes.get("activity-history").textContent, /6 min/);
  assert.match(nodes.get("activity-history").textContent, /5 min/);
  assert.doesNotMatch(nodes.get("activity-history").textContent, /word|math|session|mastered/i);
  assert.equal(requests.length, 1);
  await refresh({ history: [{ date: today, students: { Marco: { minutes: 7 }, Harry: { minutes: 21 } } }] });
  assert.equal(nodes.get("marco-minutes").textContent, "7");
  assert.equal(nodes.get("harry-minutes").textContent, "21");
  assert.equal(nodes.get("activity-history").children.length, 1);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(url => url.endsWith("study-time?all=1")));
});

test("short activity and unrecorded historical time stay distinct from zero minutes", async () => {
  const { nodes, refresh } = await dashboard({ history: [
    { date: today, students: { Marco: { minutes: 0, seconds: 18, hasTimeRecord: true }, Harry: { minutes: 0, seconds: 0 } } },
    { date: "2026-08-28", students: { Marco: { minutes: 0, hasHistoricalEvidence: true, hasTimeRecord: false }, Harry: { minutes: 7 } } },
  ] });
  assert.equal(nodes.get("marco-minutes").textContent, "<1");
  assert.equal(nodes.get("harry-minutes").textContent, "0");
  assert.match(nodes.get("activity-history").textContent, /— min/);
  assert.match(nodes.get("activity-history").textContent, /7 min/);
  await refresh({ history: [] });
  assert.equal(nodes.get("marco-minutes").textContent, "0");
  assert.equal(nodes.get("harry-minutes").textContent, "0");
  assert.equal(nodes.get("activity-history").children.length, 1);
});

test("unavailable or malformed responses show missing minutes and recover on refresh", async () => {
  const { nodes, refresh } = await dashboard(null);
  assert.equal(nodes.get("marco-minutes").textContent, "—");
  assert.equal(nodes.get("harry-minutes").textContent, "—");
  assert.match(nodes.get("activity-history").textContent, /unavailable/i);
  await refresh({ history: {} });
  assert.equal(nodes.get("marco-minutes").textContent, "—");
  await refresh({ history: [{ date: today, students: { Marco: { minutes: 12 }, Harry: { minutes: 3 } } }] });
  assert.equal(nodes.get("marco-minutes").textContent, "12");
  assert.equal(nodes.get("harry-minutes").textContent, "3");
  assert.match(nodes.get("today-log-note").textContent, /Pacific time/);
});
