const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const E = require('./core.js');
const dates = ['2026-11-16','2026-11-17','2026-11-18'];
const appId = date => 'harry-math-fractions-' + date.replaceAll('-','') + '-v1';
const first = {id:'finished-batch',at:'2026-11-18T17:00:00Z',answers:{f1:'1',f2:'1',f3:'1',f4:'1',f5:'1'}};
const state = (date, done=false) => ({version:1,sessionId:date,first:done?first:null,retry:null,conflicts:[]});
function open(t, date='2026-11-17', demo=false) {
  const file=path.join(__dirname,'..',date,'index.html');
  const dom=new JSDOM(fs.readFileSync(file,'utf8'),{url:`https://example.test/harry-math-practice/${date}/${demo?'?demo=1':''}`,runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  dom.window.HarryFractionReview = E;
  return dom.window;
}
const run = window => window.eval(fs.readFileSync(path.join(__dirname,'dashboard.js'),'utf8'));

test('the dashboard has only Redo, Session 1, Session 2 and the earlier course is in the Hub archive', t => {
  for(const date of dates) {
    const window=open(t,date), document=window.document;
    assert.deepEqual([...document.querySelectorAll('.date-sessions strong')].map(el=>el.textContent),['Redo','Session 1','Session 2']);
    assert.equal(document.querySelectorAll('.date-sessions a').length,3);
    assert.equal([...document.querySelectorAll('a')].some(el=>el.getAttribute('href').includes('skill-check')),false);
  }
  const hub=new JSDOM(fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8')).window;
  t.after(()=>hub.close());
  const card=hub.document.getElementById('harry-earlier-daily-math');
  assert.ok(card.closest('.archive-grid'));
  assert.equal(card.querySelector('a').getAttribute('href'),'./harry-math-practice/skill-check/');
});

test('online completion makes Redo dark while the currently open unfinished Session 1 stays light', async t => {
  const window=open(t), calls=[];
  window.HarrySkillSync={API:'https://example.test/progress'};
  window.fetch=async (url,options)=>{
    calls.push({url,options});
    const id=new URL(url).searchParams.get('appId');
    return {ok:true,json:async()=>({progress:id===appId(dates[0])?{state:state(dates[0],true)}:null})};
  };
  run(window);
  await window.HarryFractionDashboard.refresh();
  const links=[...window.document.querySelectorAll('.date-sessions a')];
  assert.deepEqual(links.map(el=>el.classList.contains('is-finished')),[true,false,false]);
  assert.equal(links[0].querySelector('.session-progress').textContent,'Finished');
  assert.equal(links[0].querySelector('.session-score strong').textContent,'0/5 · 0%');
  assert.equal(links[0].querySelector('time').dateTime,'2026-11-18T17:00:00.000Z');
  assert.equal(links[0].querySelector('.finished-date').textContent,'Nov 18, 2026');
  assert.equal(links[0].querySelector('.finished-time').textContent,'9:00 AM PST');
  assert.equal(links[1].getAttribute('aria-current'),'page');
  assert.equal(links[1].querySelector('.session-progress').textContent,'Not finished');
  assert.equal(links[1].querySelector('.session-details'),null);
  assert.equal(calls.length,3);
  assert.ok(calls.every(call=>!call.options.body&&!call.options.method));
  window.HarryFractionDashboard.update(appId(dates[1]),state(dates[1],true));
  assert.equal(links[1].classList.contains('is-finished'),true);
  window.HarryFractionDashboard.update(appId(dates[1]),state(dates[1]));
  assert.equal(links[1].classList.contains('is-finished'),true);
});

test('all three session cards grade only first answers and retain the original finish time after corrections', t => {
  const window=open(t,dates[1],true);
  run(window);
  const banks = [E.questions, require('../2026-11-17/questions.js').questions, require('../2026-11-18/questions.js').questions];
  for (let index=0; index<dates.length; index++) {
    const record = state(dates[index]);
    record.first = {id:'score-first-batch',at:'2026-11-19T01:30:00Z',answers:Object.fromEntries(banks[index].map(question=>[question.id,question.answer]))};
    const before = JSON.stringify(record);
    window.HarryFractionDashboard.update(appId(dates[index]),record);
    assert.equal(JSON.stringify(record),before);
    const link=window.document.querySelector(`[data-session-id="${dates[index]}"]`);
    assert.equal(link.querySelector('.session-score strong').textContent,'5/5 · 100%');
    assert.equal(link.querySelector('.finished-date').textContent,'Nov 18, 2026');
    assert.equal(link.querySelector('.finished-time').textContent,'5:30 PM PST');
    record.first.answers.f5 = '0';
    record.retry = {id:'score-retry-batch',parentId:record.first.id,at:'2026-11-19T02:00:00Z',answers:{f5:banks[index][4].answer}};
    window.HarryFractionDashboard.update(appId(dates[index]),record);
    assert.equal(link.querySelector('.session-score strong').textContent,'4/5 · 80%');
    assert.equal(link.querySelector('time').dateTime,record.first.at.replace('00Z','00.000Z'));
    assert.equal(link.querySelector('.finished-time').textContent,'5:30 PM PST');
  }
});

test('completion survives offline using saved answers, and demo records do not mix with real records', async t => {
  const window=open(t);
  window.localStorage.setItem(appId(dates[0])+':state',JSON.stringify(state(dates[0],true)));
  window.HarrySkillSync={API:'https://example.test/progress'};
  window.fetch=async()=>{throw Error('offline');};
  run(window); await window.HarryFractionDashboard.refresh();
  assert.equal(window.document.querySelector('.date-sessions a').classList.contains('is-finished'),true);
  assert.match(window.document.querySelector('[aria-current] .session-progress').textContent,/unavailable/);
  const preview=open(t,dates[1],true);
  preview.localStorage.setItem(appId(dates[0])+':state',JSON.stringify(state(dates[0],true)));
  run(preview);
  assert.equal(preview.document.querySelector('.is-finished'),null);
});

test('submitting the full set immediately updates the session button without changing grading', t => {
  const window=open(t,dates[0],true);
  window.eval(fs.readFileSync(path.join(__dirname,'core.js'),'utf8'));
  run(window);
  window.eval(fs.readFileSync(path.join(__dirname,'app.js'),'utf8'));
  for(const question of E.questions) {
    const input=window.document.getElementById('answer-'+question.id);
    input.value=question.answer;
    input.dispatchEvent(new window.Event('input',{bubbles:true}));
  }
  window.document.getElementById('session-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(window.document.querySelector('[aria-current]').classList.contains('is-finished'),true);
  assert.match(window.document.getElementById('result').textContent,/5\/5 · 100%/);
});
