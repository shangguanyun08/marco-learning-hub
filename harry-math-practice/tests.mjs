import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

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
  for (const name of ["day3Indexes", "normalizeQuestionRecord", "normalizeRecords", "isCorrectAnswer", "questionCount", "recordStats", "scoreOutOf100", "syncScore"]) {
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

test("20 main questions retain the six existing slots and append all 14 STAR mistakes", () => {
  const api=boot();
  assert.equal(api.questionSets[6].length,28);
  assert.equal(api.questionCount(6),20);
  assert.deepEqual(clone(api.day3Indexes().slice(0,6)),[0,3,5,6,8,12]);
  assert.deepEqual(clone(api.questionSets[6].slice(14).map(q=>q.id)),[2,5,7,15,16,18,21,23,24,26,27,29,30,34].map(n=>`2026-08-30-q${n}`));
  assert.equal(api.day3Banks.length,28);
  assert.ok(api.day3Banks.every(bank=>bank.length===10));
  for (const [set,count] of [[4,14],[5,14],[7,10],[8,10]]) assert.equal(api.questionCount(set),count);
});

test("original STAR answer keys, options, tables and diagrams are complete", () => {
  const api=boot();
  const answers=["7:6","12","677,846","6 points per game","tenths","12","290 kg","14 R1","500,000","14 children","5/6","60 oz","60","32 cubic inches"];
  const similar=["6:5","20","556,842","8 points per game","hundredths","11","365 kg","12 R1","700,000","10 children","3/4","27 oz","84","36 cubic inches"];
  api.entries.forEach((entry,index)=>{
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

test("140 STAR follow-ups are distinct, skill-matched, with exactly one correct choice", () => {
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
  assert.equal(count,140);
});

test("new follow-up arithmetic, ratios, remainders, rounding and visual data have valid keys", () => {
  const api=boot();
  for (const entry of api.entries) for(const q of entry.followUps.slice(1)) {
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
  assert.equal(restored.records[6].questions.length,28);
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

test("question buttons navigate past unanswered questions and preserve drafts", () => {
  const api=boot();
  vm.runInContext(`
    function element() {return {childNodes:[],dataset:{},attributes:{},classList:{add(){},toggle(){}},append(...children){this.childNodes.push(...children);},replaceChildren(){this.childNodes=[];},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this[k]=v;},scrollIntoView(){}};}
    const elements=new Map();
    const document={createElement:element,querySelector(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);}};
    const cards=Array.from({length:28},()=>({input:{value:""},querySelector(selector){return selector==="input"?this.input:null;}}));
    let activeSet=6, activeDay3Index=5;
    const day3Drafts=new Map();
    function loadSet(set,capture){if(set!==6 || capture!==false)throw Error("Wrong reload");updateDay3Progress();}
  `,api.context);
  for(const name of ["lightStep","renderDay3TotalTrack","updateDay3Progress","moveDay3Question","openDay3Question","captureDay3Draft"]) vm.runInContext(declaration(name),api.context);
  const result=vm.runInContext(`
    updateDay3Progress();
    const track=document.querySelector("#day3-total-track");
    const count=track.childNodes.length;
    cards[5].input.value="79";
    track.childNodes[19].childNodes.at(-1).click();
    const last=activeDay3Index, boundary=document.querySelector("#day3-next").disabled;
    moveDay3Question(1);
    const bounded=activeDay3Index===last;
    moveDay3Question(-1);
    ({count,last,boundary,bounded,previous:activeDay3Index,draft:day3Drafts.get("5:main"),mastered:document.querySelector("#day3-mastered-count").textContent});
  `,api.context);
  assert.deepEqual(clone(result),{count:20,last:27,boundary:true,bounded:true,previous:26,draft:"79",mastered:"2 of 20 mastered"});
});

test("session markup and assets match the expanded question set without day tabs", () => {
  assert.equal((html.match(/id="day3-total-track"/g)||[]).length,1);
  assert.equal(html.includes('data-set='),false);
  assert.ok(html.includes("Q1–Q20"));
  assert.ok(html.includes('max="20"'));
  assert.ok(html.indexOf('star-mastery.js?v=1')<html.indexOf('app.js?v=21'));
  for(const asset of ["./styles.css?v=15","./day3-mastery.js?v=3","./star-mastery.js?v=1","./app.js?v=21"]) assert.ok(html.includes(asset));
  assert.ok(source.includes('loadSet(DAY3_SET);'));
  assert.ok(source.includes('while (cards.length < Math.max'));
  assert.ok(source.includes('question.promptHtml'));
  assert.ok(source.includes('question.choicesHtml'));
});
