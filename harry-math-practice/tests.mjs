import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";

const read = file => readFileSync(new URL(file, import.meta.url), "utf8");
const source = read("./app.js");
const html = read("./index.html");
const clone = value => JSON.parse(JSON.stringify(value));
function declaration(name) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf("\n}", start + 1) + 2;
  assert.ok(start >= 0 && end > start, `Find production function ${name}`);
  return source.slice(start, end);
}
function boot(saved = {}) {
  const context = vm.createContext({});
  vm.runInContext(read("./day3-mastery.js") + "\n" + read("./star-mastery.js"), context);
  vm.runInContext(source.slice(0, source.indexOf("const questionGrid =")), context);
  for (const name of ["day3Indexes", "normalizeQuestionRecord", "normalizeRecords", "numberAnswerText", "parseNumberAnswer", "isCorrectAnswer", "questionCount", "recordStats", "scoreOutOf100", "syncScore"]) {
    vm.runInContext(declaration(name), context);
  }
  context.saved = clone(saved);
  vm.runInContext(`let records = normalizeRecords(saved);
    const api = {questionSets, day3Banks, normalizeRecords, isCorrectAnswer, questionCount, recordStats, scoreOutOf100, syncScore, day3Indexes,
      mastery: HarryDay3Mastery, entries: HarryStarMastery.entries, get records() {return records;}};
    globalThis.testing = api;`, context);
  return {context, ...context.testing};
}
function record(firstTry = false) { return {firstTry, attempts:1, solved:firstTry, lastAnswer:"", review:{attempts:[],ready:true}}; }
function submit(api, result, bank, correct) {
  if (result.review.ready === false) api.mastery.next(result);
  const question = bank[api.mastery.progress(result).used];
  const answer = correct ? String(question.answer) : question.choices?.find(c=>!api.isCorrectAnswer(String(c),question)) ?? "-999";
  assert.equal(api.mastery.submit(result,String(answer),bank,api.isCorrectAnswer),true);
}

test("27 main questions retain all existing slots and append seven earlier STAR mistakes", () => {
  const api=boot();
  assert.equal(api.questionSets[6].length,35);
  assert.equal(api.questionCount(6),27);
  assert.deepEqual(clone(api.day3Indexes().slice(0,6)),[0,3,5,6,8,12]);
  assert.deepEqual(clone(api.questionSets[6].slice(14,28).map(q=>q.id)),[2,5,7,15,16,18,21,23,24,26,27,29,30,34].map(n=>`2026-08-30-q${n}`));
  assert.equal(api.day3Banks.length,35);
  assert.ok(api.day3Banks.every(bank=>bank.length===10));
  for (const [set,count] of [[4,14],[5,14],[7,10],[8,10]]) assert.equal(api.questionCount(set),count);
});

test("original STAR answer keys, options, tables and diagrams are complete", () => {
  const api=boot();
  const answers=["7:6","12","677,846","6 points per game","tenths","12","290 kg","14 R1","500,000","14 children","5/6","60 oz","60","32 cubic inches"];
  const similar=["6:5","20","556,842","8 points per game","hundredths","11","365 kg","12 R1","700,000","10 children","3/4","27 oz","84","36 cubic inches"];
  api.entries.slice(0,14).forEach((entry,index)=>{
    assert.equal(entry.question.answer,answers[index]);
    assert.equal(entry.followUps[0].answer,similar[index]);
    assert.equal(entry.question.choices.length,4);
    assert.ok(entry.question.sourceLabel.includes("Aug 30"));
    if ([2,6,9,10,13].includes(index)) {
      assert.ok(entry.question.visualHtml.length>100);
      assert.ok(entry.followUps.every(q=>q.visualHtml.length>100));
    }
  });
  assert.match(api.entries[2].question.visualHtml,/696,410/);
  assert.match(api.entries[2].question.visualHtml,/18,564/);
  assert.match(api.entries[6].question.visualHtml,/700/);
  assert.match(api.entries[6].question.visualHtml,/410/);
  assert.match(api.entries[9].question.visualHtml,/♦ = 2 children/);
  assert.match(api.entries[13].question.visualHtml,/2 wide/);
  assert.match(api.entries[13].question.visualHtml,/4 high/);
  assert.match(api.entries[13].question.visualHtml,/4 deep/);
});

test("210 STAR follow-ups are distinct, skill-matched, with exactly one correct choice", () => {
  const api=boot();
  let count=0;
  for (const entry of api.entries) {
    const signatures=new Set([entry.question.promptHtml+"|"+(entry.question.visualHtml||"")]);
    for (const q of entry.followUps) {
      assert.equal(q.skill,entry.question.skill);
      assert.equal(q.choices.length,4);
      assert.equal(new Set(q.choices).size,4);
      assert.equal(q.choices.filter(v=>api.isCorrectAnswer(String(v),q)).length,1);
      const signature=q.promptHtml+"|"+(q.visualHtml||"");
      assert.equal(signatures.has(signature),false);
      signatures.add(signature);
      assert.ok(q.explanation);
      if(q.choicesHtml) assert.equal(q.choicesHtml.length,4);
      count++;
    }
  }
  assert.equal(count,210);
});

test("new follow-up arithmetic, ratios, remainders, rounding and visual data have valid keys", () => {
  const api=boot();
  for (const entry of api.entries.slice(0,14)) for(const q of entry.followUps.slice(1)) {
    const m=q.math;
    const numeric=Number(q.answer.replaceAll(",","").match(/^[\d.]+/)?.[0]);
    let expected;
    if(m.type==="ratio") {
      const [a,b]=q.answer.split(":").map(Number);
      assert.equal(a*m.b,b*m.a);
      assert.equal(q.choices.filter(choice=>{const [x,y]=choice.split(":").map(Number);return x*m.b===y*m.a;}).length,1);
      assert.ok(q.promptHtml.includes(`${m.a}:${m.b}`));
    } else if(m.type==="place") {
      const position={tenths:0,hundredths:1,thousandths:2}[m.place];
      assert.equal(m.number.split(".")[1][position],m.digit);
      assert.equal(q.answer,m.place);
    } else if(m.type==="remainder") {
      const [quotient,remainder]=q.answer.split(" R").map(Number);
      assert.equal(quotient,Math.floor(m.dividend/m.divisor));
      assert.equal(remainder,m.dividend%m.divisor);
      assert.ok(remainder>0 && remainder<m.divisor);
    } else if(m.type==="shade") {
      assert.equal(q.answer,`${m.numerator}/${m.denominator}`);
      assert.ok(q.visualHtml.includes(`height:${m.numerator/m.denominator*100}%`));
    } else {
      expected=m.type==="multiply" ? m.a*m.b : m.type==="subtract" ? m.a-m.b
        : m.type==="divide" ? m.a/m.b : m.type==="round" ? Math.round(m.number/100000)*100000
        : m.type==="estimate" ? Math.round(m.a+m.n1/m.d1)+Math.round(m.b+m.n2/m.d2)
        : m.type==="pictograph" ? (m.a+m.b)*m.key : m.type==="volume" ? m.w*m.h*m.d : undefined;
      assert.equal(numeric,expected,q.promptHtml);
      if(m.type==="pictograph") assert.equal((q.visualHtml.match(/♦/g)||[]).length,m.a+m.b+3+1);
      if(m.type==="volume") assert.equal((q.visualHtml.match(/<i>/g)||[]).length,m.w*m.h);
    }
  }
});

test("existing arithmetic and decimal follow-up banks remain mathematically correct", () => {
  const api=boot();
  api.day3Banks.slice(0,14).forEach(bank=>bank.forEach(q=>{
    if(q.operator) {
      const expected=q.operator==="×" ? q.left*q.right : q.operator==="÷" ? q.left/q.right : q.operator==="+" ? q.left+q.right : q.left-q.right;
      assert.ok(Math.abs(q.answer-expected)<1e-9);
    }
    if(q.kind==="decimalFraction") {const [a,b]=q.answer.split("/").map(Number);assert.ok(Math.abs(a/b-q.decimal)<1e-9);}
  }));
});

test("Q1 and Q2 are credited as mastered without invented attempts or first-try marks", () => {
  const api=boot();
  for(const i of [0,3]) {
    const q=api.records[6].questions[i];
    assert.equal(api.mastery.progress(q).status,"mastered");
    assert.equal(api.mastery.progress(q).credited,true);
    assert.equal(q.firstTry,null);
    assert.equal(q.attempts,0);
    assert.equal(q.review.attempts.length,0);
    assert.equal(api.mastery.submit(q,"0",api.day3Banks[i],api.isCorrectAnswer),false);
  }
  assert.equal(api.recordStats(6).solved,2);
  assert.equal(api.recordStats(6).answered,0);
  assert.equal(api.scoreOutOf100(api.recordStats(6),20),0);
  assert.equal(api.day3Indexes().find(i=>!api.mastery.progress(api.records[6].questions[i]).finished),5);
});

test("adding STAR questions preserves all old answer slots, first tries and follow-up histories", () => {
  const api=boot();
  const existing=record(true);
  submit(api,existing,api.day3Banks[12],true);
  submit(api,existing,api.day3Banks[12],true);
  const old={4:{questions:Array.from({length:16},()=>({firstTry:true,attempts:1,solved:true,lastAnswer:"5"})),completedAt:"2026-08-28T23:48:41.249Z"},6:{questions:Array.from({length:14},(_,i)=>({firstTry:i%2===0,attempts:2,solved:true,lastAnswer:String(i)})),completedAt:null}};
  old[6].questions[12]=existing;
  const restored=boot(old);
  assert.equal(restored.records[6].questions.length,35);
  for(let i=0;i<14;i++) {
    assert.equal(restored.records[6].questions[i].lastAnswer,old[6].questions[i].lastAnswer);
    assert.equal(restored.records[6].questions[i].firstTry,old[6].questions[i].firstTry);
    assert.equal(restored.records[6].questions[i].attempts,old[6].questions[i].attempts);
  }
  assert.equal(restored.records[4].completedAt,old[4].completedAt);
  assert.equal(restored.mastery.progress(restored.records[6].questions[12]).status,"mastered");
  assert.deepEqual(clone(restored.records[6].questions[12].review.attempts),clone(existing.review.attempts));
  assert.ok(restored.records[6].questions.slice(14).every(q=>q.firstTry===null));
  assert.equal(restored.records[6].questions[3].firstTry,false,"Parent confirmation never changes an incorrect first try");
});

test("every STAR question needs the main correct answer plus two consecutive correct follow-ups", () => {
  const api=boot();
  for(const bank of api.day3Banks.slice(14)) {
    const q=record(true);
    submit(api,q,bank,true);
    assert.equal(api.mastery.progress(q).status,"practicing");
    submit(api,q,bank,true);
    assert.equal(api.mastery.progress(q).status,"mastered");
    assert.equal(api.mastery.progress(q).used,2);
    assert.equal(api.mastery.next(q),false);
    assert.equal(api.mastery.submit(q,"0",bank,api.isCorrectAnswer),false);
  }
});

test("a missed main answer needs three consecutive follow-ups; wrong answers reset the streak", () => {
  const api=boot();
  for(const bank of api.day3Banks.slice(14)) {
    const q=record(false);
    [true,true,false,true,true].forEach(right=>submit(api,q,bank,right));
    assert.equal(api.mastery.progress(q).streak,2);
    assert.equal(api.mastery.progress(q).status,"practicing");
    submit(api,q,bank,true);
    assert.equal(api.mastery.progress(q).status,"mastered");
    assert.equal(q.firstTry,false);
  }
});

test("ten follow-ups without three in a row finish as unmastered, and the tenth can still earn mastery", () => {
  const api=boot(),bank=api.day3Banks[14];
  const missed=record(false);
  for(let i=0;i<10;i++)submit(api,missed,bank,false);
  assert.equal(api.mastery.progress(missed).status,"unmastered");
  assert.equal(api.mastery.next(missed),false);
  const last=record(false);
  [...Array(7).fill(false),true,true,true].forEach(right=>submit(api,last,bank,right));
  assert.equal(api.mastery.progress(last).status,"mastered");
});

test("out-of-order STAR progress restores independently and cannot invent mastery on reload", () => {
  const api=boot();
  const q=api.records[6].questions[27];
  Object.assign(q,record(false));
  submit(api,q,api.day3Banks[27],true);
  const before=api.syncScore(api.records);
  submit(api,q,api.day3Banks[27],true);
  assert.ok(api.syncScore(api.records)>before);
  const restored=boot(api.records);
  assert.equal(restored.mastery.progress(restored.records[6].questions[27]).streak,2);
  assert.equal(restored.records[6].questions[14].firstTry,null);
  submit(restored,restored.records[6].questions[27],restored.day3Banks[27],true);
  assert.equal(restored.recordStats(6).solved,3);
  assert.equal(restored.recordStats(6).answered,1);
  const invalid={...record(false),review:{attempts:Array(20).fill({answer:"wrong",correct:true}),ready:true}};
  const normalized=api.mastery.normalizeReview(invalid.review,api.day3Banks[14],api.isCorrectAnswer,false);
  assert.equal(normalized.attempts.length,10);
  assert.ok(normalized.attempts.every(a=>a.correct===false));
});

test("all 27 questions can be opened without changing answers or losing a draft", () => {
  const page=bootHistoryPage(boot().records);
  try {
    const jumps=[...page.document.querySelectorAll(".question-jump")];
    assert.equal(jumps.length,27);assert.ok(jumps.every(button=>!button.disabled));
    const card=page.document.querySelector('[data-question="6"]');
    card.querySelector("input").value="79";
    const before=JSON.stringify(page.api.records), storage=page.win.localStorage.getItem("harry-math-practice-record-v1");
    for(const button of jumps){
      button.click();
      assert.equal(page.document.querySelector(`[data-question="${Number(button.dataset.questionIndex)+1}"]`).hidden,false);
    }
    assert.equal(page.document.querySelector("#day3-next").disabled,true);
    page.api.moveDay3Question(1);
    assert.equal(page.document.querySelector('[data-question="35"]').hidden,false);
    page.document.querySelector('[data-question-index="0"]').click();
    assert.equal(page.document.querySelector("#day3-previous").disabled,true);
    assert.equal(page.document.querySelector("#day3-next").disabled,false);
    page.document.querySelector('[data-question-index="5"]').click();
    assert.equal(card.querySelector("input").value,"79");
    assert.equal(JSON.stringify(page.api.records),before);
    assert.equal(page.win.localStorage.getItem("harry-math-practice-record-v1"),storage);
    assert.equal(page.pushed.length,0);assert.deepEqual(page.errors,[]);
  } finally {page.close();}
});

test("session markup and assets match the expanded question set without day tabs", () => {
  assert.equal((html.match(/id="day3-total-track"/g)||[]).length,1);
  assert.equal(html.includes('data-set='),false);
  assert.ok(html.includes("Q1–Q27"));
  assert.doesNotMatch(html, /id="day3-guide"|id="day3-progress"/);
  assert.ok(html.indexOf('star-mastery.js?')<html.indexOf('app.js?'));
  for(const asset of ["./styles.css?", "./day3-mastery.js?", "./star-mastery.js?", "./app.js?"]) assert.ok(html.includes(asset));
  assert.ok(source.includes('loadSet(DAY3_SET);'));
  assert.ok(source.includes('while (cards.length < Math.max'));
  assert.ok(source.includes('question.promptHtml'));
  assert.ok(source.includes('question.choicesHtml'));
});

test("answer tracks grow only with checked answers and keep earlier misses after resets and reload", () => {
  function render(api, value) {
    api.context.document = {createElement() { return {
      childNodes: [], attributes: {}, dataset: {}, classList: {toggle() {}},
      append(...nodes) { this.childNodes.push(...nodes); },
      replaceChildren(...nodes) { this.childNodes = nodes; },
      addEventListener() {},
      setAttribute(key, value) { this.attributes[key] = value; },
    }; }};
    for (const name of ["lightStep", "renderAnswerTrack"]) vm.runInContext(declaration(name), api.context);
    api.context.trackRecord = value;
    const before = clone(value);
    const track = vm.runInContext("renderAnswerTrack(trackRecord)", api.context);
    assert.deepEqual(clone(value), before, "Rendering cannot change saved work");
    return track;
  }
  const results = track => track.childNodes.find(node => node.className === "answer-lights")?.childNodes.map(node => node.className) || [];
  const api = boot(), current = api.records[6].questions[5];
  const empty = render(api, current);
  assert.deepEqual(results(empty), []);
  assert.equal(empty.childNodes.length, 1, "No future answer row or empty-result legend");
  assert.equal(empty.childNodes[0].childNodes[1].childNodes.length, 0, "No placeholder streak dots");
  current.firstTry = false;
  current.attempts = 1;
  const expected = ["light-step incorrect"];
  assert.deepEqual(results(render(api, current)), expected);
  for (const correct of [true, false, true, true, true]) {
    submit(api, current, api.day3Banks[5], correct);
    expected.push(`light-step ${correct ? "correct" : "incorrect"}`);
    assert.deepEqual(results(render(api, current)), expected);
  }
  assert.equal(api.mastery.progress(current).status, "mastered");
  const restored = boot(api.records);
  assert.deepEqual(results(render(restored, restored.records[6].questions[5])), expected);
  assert.deepEqual(results(render(restored, restored.records[6].questions[0])), [], "Parent-confirmed mastery does not invent answer lights");
});

test("mastery records the third correct answer time and preserves it through reload and online normalization", () => {
  const api = boot();
  const result = record(true);
  const bank = api.day3Banks[5];
  submit(api, result, bank, true);
  assert.equal(result.masteredAt, undefined);
  submit(api, result, bank, true);
  assert.ok(Number.isFinite(Date.parse(result.masteredAt)));
  assert.equal(result.masteredAt, result.review.attempts[1].createdAt);
  const saved = { 6: { questions: [] } };
  saved[6].questions[5] = result;
  const restored = api.normalizeRecords(saved)[6].questions[5];
  assert.equal(restored.masteredAt, result.masteredAt);
  assert.deepEqual(clone(restored.review.attempts), clone(result.review.attempts));
  const normalizedAgain = api.normalizeRecords({ 6: { questions: [null, null, null, null, null, restored] } })[6].questions[5];
  assert.equal(normalizedAgain.masteredAt, result.masteredAt);
  assert.equal(api.mastery.submit(restored, "1", bank, api.isCorrectAnswer), false);
  assert.equal(restored.masteredAt, result.masteredAt);
  const legacy = clone(result);
  delete legacy.masteredAt;
  legacy.review.attempts.forEach(attempt => delete attempt.createdAt);
  const oldQuestions = [];
  oldQuestions[5] = legacy;
  assert.equal(api.normalizeRecords({ 6: { questions: oldQuestions } })[6].questions[5].masteredAt, undefined);
});

function bootHistoryPage(saved) {
  const dom = new JSDOM(html, {url: "https://practice.test/harry-math-practice/", runScripts: "outside-only"});
  const win = dom.window, pushed = [], errors = [];
  let remote;
  win.addEventListener("error", event => errors.push(event.error));
  win.localStorage.setItem("harry-math-practice-record-v1", JSON.stringify(saved));
  win.MarcoOnlineSync = {create(options) {
    remote = options.onRemote;
    return {start() {}, push(value) { pushed.push(clone(value)); }};
  }};
  // Exercise dialog lifecycle without a browser layout engine.
  win.HTMLDialogElement.prototype.showModal = function () {this.setAttribute("open", ""); this.querySelector("button")?.focus();};
  win.HTMLDialogElement.prototype.close = function () {this.removeAttribute("open"); this.dispatchEvent(new win.Event("close"));};
  win.eval(read("./day3-mastery.js"));
  win.eval(read("./star-mastery.js"));
  win.eval(source + "\n;globalThis.historyTest = {get records() {return records;}, savedAnswerDetails, openSavedAnswer, openDay3Question, moveDay3Question};");
  return {win, document: win.document, api: win.historyTest, pushed, errors, remote: value => remote(clone(value)), close: () => win.close()};
}

test("clicking a saved red answer opens the exact missed question and preserves the current draft and streak", () => {
  const data = boot(), record = data.records[6].questions[5];
  Object.assign(record, {firstTry: false, attempts: 1, lastAnswer: "700"});
  submit(data, record, data.day3Banks[5], true);
  submit(data, record, data.day3Banks[5], false);
  const page = bootHistoryPage(data.records);
  try {
    const card = page.document.querySelector('[data-question="6"]');
    card.querySelector(".next-practice").click();
    const draft = card.querySelector(".mastery-practice input");
    draft.value = "123";
    const before = JSON.stringify(page.api.records), writes = page.pushed.length;
    const storage = page.win.localStorage.getItem("harry-math-practice-record-v1");
    const red = card.querySelector('[data-review-position="2"]');
    assert.ok(red);
    assert.equal(card.querySelectorAll(".answer-history-button").length, 3);
    assert.ok(card.querySelector(".light-step.correct button"));
    red.click();
    const dialog = page.document.querySelector("dialog[open]");
    assert.match(dialog.querySelector("h2").textContent, /Question 3 · Practice question 2/);
    assert.match(dialog.querySelector(".expression").textContent, /476.*319/);
    assert.equal(dialog.querySelector(".correct-answer strong").textContent, "795");
    assert.match(dialog.querySelector(".saved-answer").textContent, /-999/);
    assert.equal(dialog.querySelector("form, input"), null);
    dialog.querySelector(".close-answer-review").click();
    assert.equal(page.document.querySelector("dialog"), null);
    assert.equal(page.document.activeElement, red);
    assert.equal(draft.value, "123");
    assert.equal(JSON.stringify(page.api.records), before);
    assert.equal(page.pushed.length, writes);
    assert.equal(page.win.localStorage.getItem("harry-math-practice-record-v1"), storage);
    card.querySelector('[data-review-position="0"]').click();
    assert.match(page.document.querySelector("dialog .saved-answer").textContent, /700/);
    page.document.querySelector("dialog").close();
    assert.equal(JSON.stringify(page.api.records), before);
    assert.deepEqual(page.errors, []);
  } finally { page.close(); }
});

test("missed diagram questions remain clickable after all ten follow-ups, reload and remote sync", () => {
  const data = boot(), index = 20, record = data.records[6].questions[index];
  const main = data.questionSets[6][index];
  Object.assign(record, {firstTry: false, attempts: 1, lastAnswer: main.choices.find(value => !data.isCorrectAnswer(String(value), main))});
  for (let i = 0; i < 10; i++) submit(data, record, data.day3Banks[index], false);
  const page = bootHistoryPage(data.records);
  try {
    page.remote(data.records);
    page.document.querySelector(`[data-question-index="${index}"]`).click();
    const card = page.document.querySelector(`[data-question="${index + 1}"]`);
    assert.equal(card.querySelectorAll(".answer-history-button").length, 11);
    const before = JSON.stringify(page.api.records);
    for (const position of [0, 1, 5, 10]) {
      card.querySelector(`[data-review-position="${position}"]`).click();
      const dialog = page.document.querySelector("dialog[open]");
      const expected = position ? data.day3Banks[index][position - 1] : main;
      assert.equal(dialog.querySelector(".correct-answer strong").textContent, expected.answer);
      assert.ok(dialog.querySelector(".expression table"), "The saved question keeps its original data table");
      assert.equal(dialog.querySelector(".correct-answer p").textContent, expected.explanation);
      assert.equal(dialog.querySelectorAll(".saved-review-choice").length, 4);
      assert.equal(dialog.querySelectorAll(".saved-review-choice.correct").length, 1);
      assert.equal(dialog.querySelectorAll(".saved-review-choice.selected-wrong").length, 1);
      dialog.close();
    }
    assert.equal(JSON.stringify(page.api.records), before);
    assert.equal(page.pushed.length, 0);
    assert.deepEqual(page.errors, []);
  } finally { page.close(); }
});

test("mastered questions retain their misses without inventing unavailable first answers or future attempts", () => {
  const data = boot(), record = data.records[6].questions[5];
  Object.assign(record, {firstTry: false, attempts: 2, lastAnswer: "795", solved: true});
  for (let i = 0; i < 3; i++) submit(data, record, data.day3Banks[5], true);
  Object.assign(data.records[6].questions[0], {firstTry: false, attempts: 1, lastAnswer: "123"});
  const page = bootHistoryPage(data.records);
  try {
    page.document.querySelector('[data-question-index="5"]').click();
    const card = page.document.querySelector('[data-question="6"]');
    assert.match(card.querySelector(".mastery-badge").textContent, /Mastered/);
    card.querySelector('[data-review-position="0"]').click();
    const dialog = page.document.querySelector("dialog[open]");
    assert.match(dialog.querySelector(".saved-answer").textContent, /original answer was not saved/);
    dialog.close();
    for (const [index, position] of [[5, -1], [5, 4], [5, 11], [99, 0], [6, 0]]) {
      page.api.openSavedAnswer(index, position);
      assert.equal(page.document.querySelector("dialog"), null);
    }
    page.document.querySelector('[data-question-index="0"]').click();
    page.document.querySelector('[data-question="1"] [data-review-position="0"]').click();
    assert.match(page.document.querySelector("dialog .saved-answer").textContent, /123/);
    assert.equal(page.pushed.length, 0);
    assert.deepEqual(page.errors, []);
  } finally { page.close(); }
});

function finishBefore(data, number) {
  for (const index of data.day3Indexes().slice(0, number - 1)) {
    const current = data.records[6].questions[index];
    if (data.mastery.progress(current).finished) continue;
    Object.assign(current, {firstTry: true, attempts: 1, lastAnswer: String(data.questionSets[6][index].answer)});
    submit(data, current, data.day3Banks[index], true);
    submit(data, current, data.day3Banks[index], true);
  }
}

function checkFollowUp(page, data, index, correct) {
  const card = page.document.querySelector(`[data-question="${index + 1}"]`);
  card.querySelector(".next-practice")?.click();
  const count = page.api.records[6].questions[index].review.attempts.length;
  const question = data.day3Banks[index][count];
  const input = card.querySelector(".mastery-practice input");
  assert.ok(input, "The unlocked question offers the next follow-up");
  input.value = String(correct ? question.answer : question.choices?.find(value => !data.isCorrectAnswer(String(value), question)) ?? "-999");
  input.closest("form").dispatchEvent(new page.win.Event("submit", {bubbles: true, cancelable: true}));
}

test("later questions can be answered independently while earlier practice remains unfinished", () => {
  const data=boot(),page=bootHistoryPage(data.records);
  try {
    page.document.querySelector('[data-question-index="14"]').click();
    const card=page.document.querySelector('[data-question="15"]');
    [...card.querySelectorAll(".choice-option")].find(button=>button.dataset.value===data.questionSets[6][14].answer).click();
    assert.equal(page.api.records[6].questions[14].firstTry,true);
    assert.equal(page.api.records[6].questions[5].firstTry,null);
    assert.equal(page.api.records[6].questions[12].firstTry,null);
    checkFollowUp(page,data,14,true);checkFollowUp(page,data,14,true);
    assert.equal(data.mastery.progress(page.api.records[6].questions[14]).status,"mastered");
    assert.equal(page.document.querySelectorAll(".question-jump:disabled").length,0);
    const reloaded=bootHistoryPage(page.api.records);
    try {
      assert.equal(reloaded.document.querySelectorAll(".question-jump:disabled").length,0);
      reloaded.document.querySelector('[data-question-index="14"]').click();
      assert.equal(reloaded.document.querySelector('[data-question="15"]').hidden,false);
      assert.deepEqual(clone(reloaded.api.records),clone(page.api.records));
    } finally {reloaded.close();}
    assert.deepEqual(page.errors,[]);
  } finally {page.close();}
});

test("saved out-of-order work can resume immediately and remains readable after online sync", () => {
  const data=boot(),later=data.records[6].questions[14];
  Object.assign(later,{firstTry:false,attempts:1,lastAnswer:"27:24"});
  submit(data,later,data.day3Banks[14],false);
  const page=bootHistoryPage(data.records);
  try {
    page.remote(data.records);
    page.document.querySelector('[data-question-index="14"]').click();
    const card=page.document.querySelector('[data-question="15"]');
    assert.equal(card.querySelector(".practice-order-note"),null);
    assert.ok(card.querySelector(".next-practice"));
    assert.equal(page.document.querySelector("#day3-next").disabled,false);
    const before=JSON.stringify(page.api.records);
    card.querySelector('[data-review-position="1"]').click();page.document.querySelector("dialog").close();
    assert.equal(JSON.stringify(page.api.records),before);assert.equal(page.pushed.length,0);
    checkFollowUp(page,data,14,true);
    assert.equal(page.api.records[6].questions[14].review.attempts.length,2);
    assert.equal(page.api.records[6].questions[5].firstTry,null);
    page.document.querySelector("#day3-previous").click();
    assert.equal(page.document.querySelector('[data-question="13"]').hidden,false);
    assert.deepEqual(page.errors,[]);
  } finally {page.close();}
});

test("finishing the ten-follow-up limit preserves free navigation and the last question has no next", () => {
  const data = boot();
  finishBefore(data, 6);
  const current = data.records[6].questions[12];
  Object.assign(current, {firstTry: false, attempts: 1, lastAnswer: "1"});
  for (let i = 0; i < 9; i++) submit(data, current, data.day3Banks[12], false);
  const page = bootHistoryPage(data.records);
  try {
    assert.equal(page.document.querySelector('[data-question-index="14"]').disabled, false);
    checkFollowUp(page, data, 12, false);
    assert.equal(data.mastery.progress(page.api.records[6].questions[12]).status, "unmastered");
    assert.equal(page.document.querySelector('[data-question-index="14"]').disabled, false);
    const allDone = boot(page.api.records);
    finishBefore(allDone, 28);
    page.remote(allDone.records);
    page.document.querySelector('[data-question-index="34"]').click();
    assert.equal(page.document.querySelector("#day3-next").disabled, true);
    assert.equal(page.document.querySelectorAll(".question-jump:disabled").length, 0);
    const saved = JSON.stringify(page.api.records);
    page.api.moveDay3Question(1);
    assert.equal(page.document.querySelector('[data-question="35"]').hidden, false);
    assert.equal(JSON.stringify(page.api.records), saved);
    assert.deepEqual(page.errors, []);
  } finally { page.close(); }
});


test("the seven requested earlier questions have original keys and source labels", () => {
  const api=boot(), entries=api.entries.slice(14);
  assert.deepEqual(clone(entries.map(e=>e.question.id)), ["2026-08-16-q31","2026-08-23-q25","2026-08-23-q13","2026-08-16-q18","2026-08-09-q18","2026-08-23-q27","2026-08-09-q23"]);
  const answers=["1/80","11","0.117","5","(1,000 × 6) + (600 × 6) + (90 × 6) + (5 × 6)","11 mm","170 feet"];
  const similar=["1/24","8","0.096","6","(2,000 × 4) + (400 × 4) + (80 × 4) + (3 × 4)","17 cm","140 feet"];
  entries.forEach((e,i)=>{
    assert.equal(e.question.answer,answers[i]);
    assert.equal(e.followUps[0].answer,similar[i]);
    assert.ok(e.question.sourceLabel.includes("Question " + e.question.id.split("-q")[1]));
    assert.equal(e.question.choices.filter(v=>api.isCorrectAnswer(v,e.question)).length,1);
  });
  assert.match(entries[0].question.visualHtml,/÷ 10/);
  assert.match(entries[1].question.visualHtml,/Land per house/);
  assert.match(entries[2].question.visualHtml,/0.39/);
  assert.match(entries[5].question.visualHtml,/22 mm/);
  assert.match(entries[6].question.visualHtml,/50 feet/);
  assert.match(entries[6].question.visualHtml,/35 feet/);
});

test("earlier-test follow-ups each have one mathematically correct choice", () => {
  const api=boot();
  const value=s=>s.includes("/") ? s.split("/").map(Number).reduce((a,b)=>a/b) : Number.parseFloat(s);
  const expression=s=>s.split(" + ").reduce((sum,term)=>{
    const parts=term.replaceAll(",","").match(/\d+/g).map(Number);
    return sum+parts[0]*parts[1];
  },0);
  for(const e of api.entries.slice(14)) for(const q of e.followUps.slice(1)){
    const m=q.math;
    let expected;
    if(m.type==="fractionDivide") expected=1/m.d/m.n;
    else if(m.type==="mixedDivide") expected=(m.whole+m.n/m.d)/(1/m.d);
    else if(m.type==="decimalProduct") expected=(m.a/100)*(m.b/10);
    else if(m.type==="gcf") {
      for(let f=1;f<=Math.min(m.a,m.b);f++)if(m.a%f===0&&m.b%f===0)expected=f;
    } else if(m.type==="distributive") expected=m.number*m.m;
    else if(m.type==="radius") expected=m.diameter/2;
    else if(m.type==="perimeter") expected=m.length+m.width+m.length+m.width;
    else assert.fail("Unexpected skill");
    const correct=v=>Math.abs((m.type==="distributive"?expression(v):value(v))-expected)<1e-10;
    assert.ok(correct(q.answer),q.promptHtml);
    assert.equal(q.choices.filter(correct).length,1,q.promptHtml);
  }
});

test("appending seven questions preserves saved August 30 mastery and starts new slots empty",()=>{
  const api=boot();
  const old=clone(api.records);old[6].questions=old[6].questions.slice(0,28);
  old[6].questions[14]=record(false);
  submit(api,old[6].questions[14],api.day3Banks[14],true);
  submit(api,old[6].questions[14],api.day3Banks[14],true);
  const restored=boot(old);
  assert.deepEqual(clone(restored.records[6].questions.slice(0,28)),clone(old[6].questions));
  assert.equal(restored.mastery.progress(restored.records[6].questions[14]).streak,2);
  for(const q of restored.records[6].questions.slice(28)){
    assert.equal(q.firstTry,null);assert.equal(q.review.attempts.length,0);assert.equal(q.masteredAt,undefined);
  }
  submit(restored,restored.records[6].questions[14],restored.day3Banks[14],true);
  assert.equal(restored.mastery.progress(restored.records[6].questions[14]).status,"mastered");
});


test("green main answers and every correct follow-up reopen with the exact question, answer and diagrams",()=>{
  const data=boot();
  for(const index of [5,28,29,30,31,32,33,34]){
    const r=data.records[6].questions[index];
    Object.assign(r,{firstTry:true,attempts:1,lastAnswer:String(data.questionSets[6][index].answer)});
    submit(data,r,data.day3Banks[index],true);submit(data,r,data.day3Banks[index],true);
  }
  const page=bootHistoryPage(data.records);
  try {
    page.remote(data.records);
    const before=JSON.stringify(page.api.records), storage=page.win.localStorage.getItem("harry-math-practice-record-v1");
    for(const index of [5,28,29,30,31,32,33,34]){
      page.document.querySelector(`[data-question-index="${index}"]`).click();
      const card=page.document.querySelector(`[data-question="${index+1}"]`);
      assert.equal(card.querySelectorAll(".light-step.correct .answer-history-button").length,3);
      for(const position of [0,1,2]){
        const button=card.querySelector(`[data-review-position="${position}"]`);
        assert.match(button.getAttribute("aria-label"),/: correct$/);
        button.click();
        const dialog=page.document.querySelector("dialog[open]");
        const q=position===0?data.questionSets[6][index]:data.day3Banks[index][position-1];
        assert.equal(dialog.querySelector(".correct-answer strong").textContent,String(q.answer));
        assert.equal(dialog.querySelector(".saved-answer.correct").textContent,`✓ Harry’s answer: ${q.answer} · Correct`);
        if(q.choices)assert.equal(dialog.querySelectorAll(".saved-review-choice.correct").length,1);
        if(q.visualHtml?.includes("<svg"))assert.ok(dialog.querySelector("svg"));
        assert.equal(dialog.querySelector("form,input"),null);
        dialog.close();assert.equal(page.document.activeElement,button);
      }
    }
    assert.equal(JSON.stringify(page.api.records),before);
    assert.equal(page.win.localStorage.getItem("harry-math-practice-record-v1"),storage);
    assert.equal(page.pushed.length,0);assert.deepEqual(page.errors,[]);
  }finally{page.close();}
});

test("legacy correct marks remain reviewable without inventing a missing first answer",()=>{
  const data=boot();Object.assign(data.records[6].questions[5],{firstTry:true,attempts:2,lastAnswer:"795",solved:true});
  const page=bootHistoryPage(data.records);
  try{
    page.document.querySelector('[data-question-index="5"]').click();
    page.document.querySelector('[data-question="6"] [data-review-position="0"]').click();
    const dialog=page.document.querySelector("dialog[open]");
    assert.match(dialog.querySelector(".saved-answer.correct").textContent,/first answer was correct.*original answer was not saved/);
    assert.equal(dialog.querySelector(".correct-answer strong").textContent,"795");
    assert.equal(page.pushed.length,0);
  }finally{page.close();}
});

test("Q16 onward changes ten question families to numeric entry and preserves Q17 and Q25 choices", () => {
  const data = boot(), indexes = data.day3Indexes();
  for (const [position, index] of indexes.entries()) {
    const q = data.questionSets[6][index];
    const converted = position >= 15 && ![16, 24].includes(position);
    assert.equal(Boolean(q.response), converted, `Q${position + 1}`);
    if (!converted) continue;
    for (const question of [q, ...data.day3Banks[index]]) {
      assert.equal(question.response.kind, position === 20 ? "fraction" : "number");
      assert.equal(data.isCorrectAnswer(question.answer, question), true, "Old unit-bearing answers remain correct");
      if (question.response.kind === "number") {
        const number = Number.parseFloat(question.answer);
        assert.equal(data.isCorrectAnswer(String(number), question), true);
        assert.equal(data.isCorrectAnswer(number.toFixed(5), question), true);
        assert.equal(data.isCorrectAnswer(String(number + 1), question), false);
        for (const invalid of ["", " ", `${number} bananas`, "0x10", "Infinity"]) {
          assert.equal(data.isCorrectAnswer(invalid, question), false);
        }
      }
    }
  }
});

test("all nine numeric question families accept numbers with printed units through mastery and reload", () => {
  const data = boot(), page = bootHistoryPage(data.records);
  try {
    for (const index of data.day3Indexes().filter(i => data.questionSets[6][i].response?.kind === "number")) {
      page.api.openDay3Question(index);
      const card = page.document.querySelector(`[data-question="${index + 1}"]`);
      for (let position = 0; position < 3; position++) {
        card.querySelector(".next-practice")?.click();
        const question = position ? data.day3Banks[index][position - 1] : data.questionSets[6][index];
        const form = position ? card.querySelector(".mastery-practice form") : card.querySelector("form");
        assert.equal(form.querySelector(".choice-grid"), null);
        const input = form.querySelector("input");
        assert.equal(input.type, "number");
        assert.equal(input.hidden, false);
        assert.equal(form.querySelector(".answer-row").hidden, false);
        assert.equal(form.querySelector(".answer-unit")?.textContent || "", question.response.unit);
        input.value = String(Number.parseFloat(question.answer));
        form.requestSubmit();
        const saved = page.api.records[6].questions[index];
        assert.equal(position ? saved.review.attempts[position - 1].correct : saved.firstTry, true);
      }
      assert.equal(data.mastery.progress(page.api.records[6].questions[index]).status, "mastered");
      card.querySelector('[data-review-position="0"]').click();
      const expected = data.questionSets[6][index];
      assert.ok(page.document.querySelector("dialog .saved-answer.correct").textContent.includes(`${Number.parseFloat(expected.answer)}${expected.response.unit ? ` ${expected.response.unit}` : ""}`));
      page.document.querySelector("dialog").close();
    }
    for (const number of [17, 25]) {
      const index = data.day3Indexes()[number - 1];
      page.api.openDay3Question(index);
      const card = page.document.querySelector(`[data-question="${index + 1}"]`);
      assert.equal(card.querySelectorAll(".choice-option").length, 4);
      assert.equal(card.querySelector(".answer-row").hidden, true);
      card.querySelector(".choice-option").click();
      assert.equal(card.querySelectorAll(".mastery-practice .choice-option").length, 4);
    }
    const reloaded = boot(page.api.records);
    assert.deepEqual(clone(reloaded.records), clone(page.api.records));
    assert.deepEqual(page.errors, []);
  } finally {page.close();}
});

test("Q21 uses two stacked fraction boxes, retains partial drafts and accepts equivalent fractions", () => {
  const data = boot(), page = bootHistoryPage(data.records), index = 28;
  try {
    page.api.openDay3Question(index);
    const card = page.document.querySelector('[data-question="29"]');
    let form = card.querySelector("form");
    assert.equal(form.querySelector(".choice-grid"), null);
    assert.ok(form.querySelector(".answer-row.with-fraction .fraction-input"));
    assert.equal(form.querySelectorAll("input:not([hidden])").length, 2);
    let fields = form.querySelectorAll(".fraction-input input");
    fields[0].value = "2";
    form.requestSubmit();
    assert.equal(page.api.records[6].questions[index].firstTry, null);
    assert.match(card.querySelector(".feedback").textContent, /both fraction boxes/);
    page.api.openDay3Question(23);page.api.openDay3Question(index);
    form = card.querySelector("form");fields = form.querySelectorAll(".fraction-input input");
    assert.equal(fields[0].value, "2");assert.equal(fields[1].value, "");
    fields[1].value = "0";form.requestSubmit();
    assert.equal(page.api.records[6].questions[index].firstTry, null);
    assert.match(card.querySelector(".feedback").textContent, /greater than 0/);
    fields[1].value = "160";form.requestSubmit();
    assert.equal(page.api.records[6].questions[index].firstTry, true);
    assert.equal(page.api.records[6].questions[index].lastAnswer, "2/160");
    form = card.querySelector(".mastery-practice form");
    fields = form.querySelectorAll(".fraction-input input");
    fields[0].value = "1";fields[1].value = "24";
    page.api.openDay3Question(24);page.api.openDay3Question(index);
    form = card.querySelector(".mastery-practice form");fields = form.querySelectorAll(".fraction-input input");
    assert.deepEqual([...fields].map(input => input.value), ["1", "24"]);
    card.querySelector('[data-review-position="0"]').click();
    assert.match(page.document.querySelector("dialog .saved-answer").textContent, /2\/160/);
    page.document.querySelector("dialog").close();
    assert.deepEqual([...fields].map(input => input.value), ["1", "24"]);
    form.requestSubmit();card.querySelector(".next-practice").click();
    form = card.querySelector(".mastery-practice form");fields = form.querySelectorAll(".fraction-input input");
    fields[0].value = "2";fields[1].value = "30";form.requestSubmit();
    assert.equal(data.mastery.progress(page.api.records[6].questions[index]).status, "mastered");
    assert.deepEqual(clone(boot(page.api.records).records), clone(page.api.records));
    assert.deepEqual(page.errors, []);
  } finally {page.close();}
});

test("numeric blanks do not count as misses; wrong numbers and drafts remain reviewable", () => {
  const data = boot(), page = bootHistoryPage(data.records);
  try {
    page.api.openDay3Question(23);
    const card = page.document.querySelector('[data-question="24"]');
    let form = card.querySelector("form");
    form.requestSubmit();
    assert.equal(page.api.records[6].questions[23].firstTry, null);
    assert.equal(page.pushed.length, 0);
    form.querySelector("input").value = "13";
    page.api.openDay3Question(25);page.api.openDay3Question(23);
    form = card.querySelector("form");assert.equal(form.querySelector("input").value, "13");
    form.requestSubmit();
    assert.equal(page.api.records[6].questions[23].firstTry, false);
    card.querySelector('[data-review-position="0"]').click();
    assert.match(page.document.querySelector("dialog .saved-answer.incorrect").textContent, /13 children/);
    page.document.querySelector("dialog").close();
    form = card.querySelector(".mastery-practice form");form.requestSubmit();
    assert.equal(page.api.records[6].questions[23].review.attempts.length, 0);
    form.querySelector("input").value = "9";
    page.api.openDay3Question(25);page.api.openDay3Question(23);
    form = card.querySelector(".mastery-practice form");assert.equal(form.querySelector("input").value, "9");
    form.requestSubmit();
    assert.equal(page.api.records[6].questions[23].review.attempts[0].correct, false);
    card.querySelector('[data-review-position="1"]').click();
    assert.match(page.document.querySelector("dialog .saved-answer.incorrect").textContent, /9 children/);
    assert.equal(page.document.querySelector("dialog .correct-answer strong").textContent, "10 children");
    assert.deepEqual(page.errors, []);
  } finally {page.close();}
});
