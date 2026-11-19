const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const core=require('./core.js'),sync=require('./sync.js'),variants=require('./variants.js'),focus=require('./focus.js'),context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'data.js'),'utf8'),context);
const course=JSON.parse(JSON.stringify(context.window.NNAT_COURSE)),q=course.questions.find(q=>q.id==='serial-1');
let JSDOM;try{({JSDOM}=require('jsdom'));}catch{({JSDOM}=require('../harry-math-practice/node_modules/jsdom'));}
const KEY='harry-nnat-2026-11-07-v1';
function boot(saved,fetcher){const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),{url:fetcher?'https://shangguanyun08.github.io/marco-learning-hub/harry-nnat/':'http://localhost/harry-nnat/',runScripts:'outside-only'}),w=dom.window;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};if(saved)w.localStorage.setItem(KEY,saved);if(fetcher){w.fetch=fetcher;w.AbortSignal=AbortSignal;}for(const f of ['data.js','variants.js','focus.js','core.js','sync.js','app.js'])w.eval(fs.readFileSync(path.join(__dirname,f),'utf8'));return {w,d:w.document,close:()=>w.close(),saved:()=>w.localStorage.getItem(KEY)};}
const card=(t,id)=>t.d.querySelector(id?`[data-question="${id}"]`:'.question-card'),choose=(t,n,id)=>card(t,id).querySelector(`input[value="${n}"]`).click(),check=(t,id)=>card(t,id).querySelector('.answer-form').dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));
const at='2026-11-08T04:00:00Z',later='2026-11-08T05:00:00Z',item=id=>course.questions.find(q=>q.id===id)||variants.get(course,id)||focus.get(id);
function legacyRun(wrong=4){const r={id:'legacy-round-one',questionIds:core.ids(course,'pattern'),startedAt:at,position:0,completedAt:null,answers:{},drafts:{}};r.questionIds.forEach((id,i)=>{const q=item(id);core.check(course,r,q,i<wrong?(q.answer+1)%5:q.answer,at);if(i<wrong)core.check(course,r,q,q.answer,later);});return r;}

test('focused Review session 3 has twelve new questions with distinct choices and valid diagrams',()=>{
  const ids=core.ids(course,'session-1119-focus'),qs=core.questions(course,{questionIds:ids});
  assert.equal(ids.length,12);assert.equal(qs.length,12);assert.equal(new Set(ids).size,12);
  assert.deepEqual(qs.slice(0,2).map(q=>q.level),['easy','medium']);assert.ok(qs.slice(2).every(q=>q.level==='challenge'));
  assert.equal(qs.filter(q=>q.skillCode==='conditional-code').length,6);assert.equal(qs.filter(q=>q.skillCode==='sector-colour-code').length,6);
  assert.ok(qs.every(q=>q.type==='analogy'&&['analogy-19','analogy-23'].includes(q.sourceId)));
  for(const q of qs){
    assert.ok(q.answer>=0&&q.answer<5);assert.equal(q.figures.length,6);assert.equal(new Set(q.figures.slice(1)).size,5,q.id);
    assert.equal(new Set(q.choiceModels.map(m=>JSON.stringify(m))).size,5,q.id);
    for(const figure of q.figures){const dom=new JSDOM(decodeURIComponent(figure.split(',').slice(1).join(',')),{contentType:'image/svg+xml'});assert.equal(dom.window.document.querySelector('parsererror'),null);dom.window.close();}
    assert.equal(focus.get(q.id).answer,q.answer);assert.ok(q.explanation.length>90);
  }
  assert.deepEqual(core.questions(course,{questionIds:['focus-1119-99']}),[]);
  assert.equal(core.ids(course,'mixed').length,24);assert.equal(course.questions.length,32);
});

test('all focused answer keys independently match the demonstrated colour and shape codes',()=>{
  const t=(color,shape='square')=>({color,shape}),symbols=ts=>({kind:'tokens',tokens:ts}),wheel=cs=>({kind:'sectors',colors:cs});
  const expected=[
    symbols([t('yellow','triangle'),t('white','circle'),t('yellow','diamond')]),
    wheel(['white','yellow','blue','white']),
    symbols([t('white'),t('blue','triangle'),t('yellow')]),
    symbols([t('blue','diamond'),t('white'),t('yellow','circle')]),
    symbols([t('white'),t('yellow'),t('yellow','triangle'),t('yellow')]),
    symbols([t('yellow','triangle'),t('blue'),t('yellow','triangle'),t('blue')]),
    symbols([t('yellow','triangle'),t('blue','circle'),t('yellow'),t('blue','circle')]),
    wheel(['blue','blue','yellow','yellow']),wheel(['blue','white','white','blue']),
    wheel(['white','yellow','yellow','white']),wheel(['yellow','blue','blue','yellow']),wheel(['yellow','white','blue','blue'])
  ];
  core.ids(course,'session-1119-focus').forEach((id,i)=>{const q=focus.get(id);assert.deepEqual(q.choiceModels[q.answer],expected[i],id);});
});

test('the focused session starts fresh, hides solutions, and resumes without changing earlier reviews',()=>{
  const old={id:'older-review',round:1,questionIds:core.ids(course,'session-1117'),startedAt:at,position:0,completedAt:null,answers:{},drafts:{}};
  core.check(course,old,item(old.questionIds[0]),item(old.questionIds[0]).answer,at);
  const seed=JSON.stringify({version:1,articles:{'session-1117':[old]}}),t=boot(seed);
  try{
    assert.equal(t.saved(),seed);t.d.querySelector('[data-start="session-1119-focus"]').click();
    assert.match(t.d.querySelector('h1').textContent,/Review session 3.*Focused practice/);
    assert.match(t.d.querySelector('.session-instructions').textContent,/Check what stays the same/);
    assert.equal(t.d.querySelectorAll('.question-card').length,12);assert.equal(t.d.querySelector('input:checked'),null);assert.equal(t.d.querySelector('.feedback,.explanation'),null);
    const id=core.ids(course,'session-1119-focus')[0];choose(t,item(id).answer,id);check(t,id);
    t.d.querySelector('#all-sets').click();t.d.querySelector('[data-start="session-1119-focus"]').click();
    const saved=JSON.parse(t.saved());assert.deepEqual(saved.articles['session-1117'],[old]);assert.equal(saved.articles['session-1119-focus'].length,1);
    assert.equal(saved.articles['session-1119-focus'][0].questionSet,'focus-1119-v1');assert.equal(t.d.querySelector('[data-progress]').textContent,'1/12');
    const reload=boot(t.saved());try{reload.d.querySelector('[data-start="session-1119-focus"]').click();assert.equal(reload.d.querySelector('[data-progress]').textContent,'1/12');assert.match(card(reload,id).querySelector('.feedback').textContent,/Correct/);}finally{reload.close();}
  }finally{t.close();}
});

test('focused scores, second tries, double-wrong filter, dates and sync stay independent',()=>{
  const t=boot();try{
    t.d.querySelector('[data-start="session-1119-focus"]').click();const ids=core.ids(course,'session-1119-focus');
    ids.forEach((id,i)=>{const q=item(id);choose(t,i===0?(q.answer+1)%5:q.answer,id);check(t,id);if(i===0){choose(t,(q.answer+2)%5,id);check(t,id);}});
    const saved=JSON.parse(t.saved()),r=saved.articles['session-1119-focus'][0];assert.ok(r.completedAt);assert.deepEqual(core.scores(course,r),{total:12,answered:12,first:11,resolved:12});
    assert.equal(t.d.querySelector('.next-round'),null);t.d.querySelector('#wrong-only').click();
    assert.deepEqual([...t.d.querySelectorAll('.question-card:not([hidden])')].map(el=>el.dataset.question),[ids[0]]);
    t.d.querySelector('#session-results').click();assert.match(t.d.querySelector('.score').textContent,/11\/12/);assert.equal(t.d.querySelector('.next-round'),null);
    assert.deepEqual(sync.merge(null,saved).articles['session-1119-focus'],[r]);
    t.d.querySelector('#all-sets').click();assert.match(t.d.querySelector('[data-start="session-1119-focus"]').closest('article').textContent,/Finished.*First try 11\/12/);
    assert.ok([...t.d.querySelectorAll('.history-row h3')].some(el=>/Review session 3/.test(el.textContent)));
  }finally{t.close();}
});

test('Review session 2 has fresh, valid five-choice diagrams for each of the same 13 skills',()=>{
  const source=course.sessions[0],session=course.sessions.find(s=>s.id==='session-1117-similar'),ids=core.ids(course,session.id);
  assert.equal(session.name,'Review session 2');assert.equal(ids.length,13);assert.equal(new Set(ids).size,13);
  assert.deepEqual(ids.map(id=>item(id).sourceId),source.questionIds);
  for(const id of ids){const q=item(id),original=item(q.sourceId);
    assert.ok(q.answer>=0&&q.answer<5);assert.equal(q.figures.length,6);assert.equal(new Set(q.figures.slice(1)).size,5,id);
    assert.notEqual(q.figures[0],original.figures[0],id);
    for(const round of [2,3])assert.notEqual(q.figures[0],item(variants.idFor(original,round)).figures[0],id);
    for(const figure of q.figures){const dom=new JSDOM(decodeURIComponent(figure.split(',').slice(1).join(',')),{contentType:'image/svg+xml'});assert.equal(dom.window.document.querySelector('parsererror'),null);dom.window.close();}
    assert.equal(variants.get(JSON.parse(JSON.stringify(course)),id).answer,q.answer);
  }
});

test('the fresh analogy and serial answer keys match the demonstrated transformations',()=>{
  const key=id=>{const q=item(id+'-similar-v1-r4');return q.choiceModels[q.answer];};
  const blue='#245b88',gold='#e9b94c',white='#fff';
  assert.deepEqual(key('analogy-19').tokens,[['triangle',blue],['square',white],['square',gold]]);
  assert.deepEqual(key('analogy-23').sectors,[blue,blue,gold,gold]);
  const nested=key('serial-4');assert.equal(nested.outer,'circle');assert.equal(nested.inner,'square');assert.equal(nested.outerSize,84);assert.equal(nested.innerSize,18);
  const arrows=key('serial-14');assert.equal(((arrows.angle%360)+360)%360,90);assert.equal(((arrows.secondAngle%360)+360)%360,225);
});

test('Review session 2 opens fresh beside the first review and resumes independently',()=>{
  const first={...legacyRun(),id:'first-review',questionIds:core.ids(course,'session-1117'),answers:{},drafts:{}};
  core.check(course,first,item(first.questionIds[0]),item(first.questionIds[0]).answer,at);
  const t=boot(JSON.stringify({version:1,articles:{'session-1117':[first]}}));try{
    const cards=[...t.d.querySelectorAll('.set-grid>.set-card')];assert.match(cards[4].querySelector('h2').textContent,/^Review session$/);assert.equal(cards[5].querySelector('h2').textContent,'Review session 2');
    t.d.querySelector('[data-start="session-1117-similar"]').click();
    assert.match(t.d.querySelector('.session-head h1').textContent,/Review session 2.*Similar practice/);
    assert.equal(t.d.querySelectorAll('.question-card').length,13);assert.equal(t.d.querySelector('input:checked'),null);assert.equal(t.d.querySelector('.explanation'),null);
    const id=core.ids(course,'session-1117-similar')[0];choose(t,item(id).answer,id);check(t,id);
    t.d.querySelector('#all-sets').click();t.d.querySelector('[data-start="session-1117-similar"]').click();
    const saved=JSON.parse(t.saved());assert.deepEqual(saved.articles['session-1117'],[first]);assert.equal(saved.articles['session-1117-similar'].length,1);
    assert.equal(t.d.querySelector('[data-progress]').textContent,'1/13');assert.match(card(t,id).querySelector('.feedback').textContent,/Correct/);
    const reload=boot(t.saved());try{reload.d.querySelector('[data-start="session-1117-similar"]').click();assert.equal(reload.d.querySelector('[data-progress]').textContent,'1/13');}finally{reload.close();}
  }finally{t.close();}
});

test('Review session 2 finishes with its own date and score without repeating an automatic round',()=>{
  const t=boot();try{
    t.d.querySelector('[data-start="session-1117-similar"]').click();
    for(const id of core.ids(course,'session-1117-similar')){choose(t,item(id).answer,id);check(t,id);}
    assert.equal(t.d.querySelector('.next-round'),null);t.d.querySelector('#session-results').click();
    assert.match(t.d.querySelector('.score').textContent,/13\/13/);assert.equal(t.d.querySelector('.next-round'),null);
    const saved=JSON.parse(t.saved()),r=saved.articles['session-1117-similar'][0];assert.ok(r.completedAt);assert.equal(r.questionSet,'similar-v1');
    assert.deepEqual(sync.merge(null,saved).articles['session-1117-similar'],[r]);
    t.d.querySelector('#all-sets').click();assert.match(t.d.querySelector('[data-start="session-1117-similar"]').closest('article').textContent,/Finished.*First try 13\/13/);
  }finally{t.close();}
});

test('Session 1117 is a frozen set of 13 original challenges across all four types',()=>{
  const session=course.sessions.find(s=>s.id==='session-1117'),ids=core.ids(course,session.id);
  assert.equal(session.name,'Review session');assert.equal(session.date,'2026-11-17');assert.equal(session.sourceQuestionCount,24);
  assert.equal(ids.length,13);assert.equal(new Set(ids).size,13);
  assert.ok(ids.every(id=>course.questions.some(q=>q.id===id&&q.level==='challenge')));
  assert.deepEqual(course.groups.map(g=>ids.filter(id=>item(id).type===g.id).length),[3,3,4,3]);
  ids.pop();assert.equal(core.ids(course,session.id).length,13);
  assert.equal(core.ids(course,'mixed').length,24);assert.equal(course.questions.length,32);
});

test('Session 1117 starts clean after the type sets and resumes its own answers without changing source work',()=>{
  const original=legacyRun(),seed=JSON.stringify({version:1,articles:{pattern:[original]}}),t=boot(seed);
  try{
    const grid=t.d.querySelector('.set-grid'),section=grid.querySelector('.review-session');
    assert.equal([...grid.children].indexOf(section),4);assert.ok(section.classList.contains('set-card'));
    assert.equal(t.saved(),seed);t.d.querySelector('[data-start="session-1117"]').click();
    assert.match(t.d.querySelector('.session-head h1').textContent,/Review session/);
    assert.equal(t.d.querySelectorAll('.question-card').length,13);assert.equal(t.d.querySelector('input:checked'),null);
    assert.equal(t.d.querySelector('.feedback'),null);assert.equal(t.d.querySelector('.explanation'),null);
    let saved=JSON.parse(t.saved());assert.deepEqual(saved.articles.pattern,[original]);
    const r=saved.articles['session-1117'][0];assert.deepEqual(r.questionIds,core.ids(course,'session-1117'));
    assert.deepEqual(r.answers,{});assert.deepEqual(r.drafts,{});assert.equal(r.completedAt,null);
    const first=item(r.questionIds[0]);choose(t,first.answer,first.id);check(t,first.id);
    t.d.querySelector('#all-sets').click();assert.match(t.d.querySelector('[data-start="session-1117"]').textContent,/Continue/);
    t.d.querySelector('[data-start="session-1117"]').click();assert.equal(card(t,first.id).querySelector('input:checked').value,String(first.answer));
    saved=JSON.parse(t.saved());assert.equal(saved.articles['session-1117'].length,1);assert.deepEqual(saved.articles.pattern,[original]);
    const reload=boot(t.saved());try{reload.d.querySelector('[data-start="session-1117"]').click();assert.equal(reload.d.querySelector('[data-progress]').textContent,'1/13');assert.match(card(reload,first.id).querySelector('.feedback').textContent,/Correct/);}finally{reload.close();}
  }finally{t.close();}
});

test('Session 1117 keeps its first-try score, finish time, filtered review and history separate',()=>{
  const original=legacyRun(),t=boot(JSON.stringify({version:1,articles:{pattern:[original]}}));
  try{
    t.d.querySelector('[data-start="session-1117"]').click();const ids=core.ids(course,'session-1117');
    ids.forEach((id,i)=>{const q=item(id);choose(t,i===0?(q.answer+1)%5:q.answer,id);check(t,id);if(i===0){choose(t,(q.answer+2)%5,id);check(t,id);}});
    const saved=JSON.parse(t.saved()),r=saved.articles['session-1117'][0];
    assert.ok(r.completedAt);assert.deepEqual(core.scores(course,r),{total:13,answered:13,first:12,resolved:13});assert.deepEqual(saved.articles.pattern,[original]);
    t.d.querySelector('#wrong-only').click();assert.deepEqual([...t.d.querySelectorAll('.question-card:not([hidden])')].map(el=>el.dataset.question),[ids[0]]);
    t.d.querySelector('#session-results').click();assert.match(t.d.querySelector('.score').textContent,/12\/13/);
    t.d.querySelector('#all-sets').click();assert.match(t.d.querySelector('.review-session').textContent,/Finished.*First try 12\/13/);
    assert.ok([...t.d.querySelectorAll('.history-row h3')].some(el=>/Review session/.test(el.textContent)));
    t.d.querySelector('[data-start="session-1117"]').click();assert.equal(t.d.querySelector('.results'),null);assert.equal(t.d.querySelectorAll('fieldset:disabled').length,13);
    const merged=sync.merge({version:1,articles:{pattern:[original]}},saved);assert.deepEqual(merged.articles['session-1117'],[r]);assert.deepEqual(merged.articles.pattern,[original]);
  }finally{t.close();}
});

test('double wrong requires two checked wrong choices, excluding corrections, drafts and invalid checks',()=>{
  const r={questionIds:[q.id],answers:{},drafts:{[q.id]:{choice:0,updatedAt:at}}};
  assert.equal(core.doubleWrong(q,r),false);
  r.answers[q.id]=[{choice:0,checkedAt:at,answerOK:true}];
  assert.equal(core.doubleWrong(q,r),false);
  r.answers[q.id].push({choice:1,checkedAt:'invalid',answerOK:false});
  assert.equal(core.doubleWrong(q,r),false);
  r.answers[q.id][1].checkedAt=later;
  assert.equal(core.doubleWrong(q,r),true);
  r.answers[q.id][1].choice=q.answer;
  assert.equal(core.doubleWrong(q,r),false);
  r.answers[q.id][0].choice=q.answer;r.answers[q.id][1].choice=0;
  assert.equal(core.doubleWrong(q,r),false);
});

test('finished sets open directly to questions and the double-wrong toggle preserves every saved answer',()=>{
  const original=legacyRun(),expected=original.questionIds.slice(1,4);
  for(const id of expected)original.answers[id][1].choice=(item(id).answer+2)%5;
  const seed=JSON.stringify({version:1,articles:{pattern:[original]}}),t=boot(seed);
  try{
    assert.match(t.d.querySelector('[data-start="pattern"]').textContent,/Review questions/);
    t.d.querySelector('[data-start="pattern"]').click();
    assert.equal(t.d.querySelector('.results'),null);
    assert.equal(t.d.querySelectorAll('.question-card:not([hidden])').length,8);
    assert.equal(t.d.querySelectorAll('fieldset:disabled').length,8);
    const button=t.d.querySelector('#wrong-only');
    assert.match(button.textContent,/Double wrong only · 3/);
    assert.equal(button.getAttribute('aria-pressed'),'false');
    const firstDetails=card(t,original.questionIds[0]).querySelector('.explanation');firstDetails.open=true;
    button.click();
    assert.equal(button.getAttribute('aria-pressed'),'true');
    assert.deepEqual([...t.d.querySelectorAll('.question-card:not([hidden])')].map(el=>el.dataset.question),expected);
    assert.match(t.d.querySelector('#filter-count').textContent,/Showing 3 of 8/);
    assert.match(card(t,expected[0]).querySelector('h2').textContent,/Question 2.*of 8/);
    assert.equal(t.d.querySelector('#no-double-wrong').hidden,true);
    button.click();
    assert.equal(t.d.querySelectorAll('.question-card:not([hidden])').length,8);
    assert.equal(firstDetails.open,true);
    assert.equal(t.saved(),seed);
    t.d.querySelector('#all-sets').click();t.d.querySelector('[data-history]').click();
    assert.equal(t.d.querySelector('.results'),null);
    assert.equal(t.d.querySelectorAll('.question-card:not([hidden])').length,8);
    assert.equal(t.saved(),seed);
  }finally{t.close();}
});

test('empty filters preserve live drafts and the count updates after a second miss',()=>{
  const t=boot();try{
    t.d.querySelector('[data-start="serial"]').click();choose(t,0);
    const savedDraft=t.saved(),button=t.d.querySelector('#wrong-only');button.click();
    assert.equal(t.d.querySelectorAll('.question-card:not([hidden])').length,0);
    assert.equal(t.d.querySelector('#no-double-wrong').hidden,false);
    assert.equal(t.saved(),savedDraft);
    button.click();assert.equal(card(t).querySelector('input:checked').value,'0');check(t);
    assert.match(button.textContent,/· 0/);choose(t,1);check(t);
    assert.match(button.textContent,/· 1/);const savedChecks=t.saved();button.click();
    assert.equal(t.d.querySelectorAll('.question-card:not([hidden])').length,1);
    assert.equal(t.saved(),savedChecks);
    t.d.querySelector('#all-sets').click();t.d.querySelector('[data-start="analogy"]').click();
    assert.equal(t.d.querySelector('#wrong-only').getAttribute('aria-pressed'),'false');
    assert.equal(t.d.querySelectorAll('.question-card:not([hidden])').length,8);
  }finally{t.close();}
});

test('double-wrong filtering also works for completed similar rounds opened from history',()=>{
  const parent=legacyRun(),second=core.reviewRun(course,parent,'similar-two',later);
  second.questionIds.forEach((id,i)=>{const q=item(id);core.check(course,second,q,i<2?(q.answer+1)%5:q.answer,at);if(i<2)core.check(course,second,q,i===0?(q.answer+2)%5:q.answer,later);});
  const seed=JSON.stringify({version:1,articles:{pattern:[parent,second]}}),t=boot(seed);
  try{
    t.d.querySelector('[data-history="similar-two"]').click();
    assert.match(t.d.querySelector('.session-head h1').textContent,/Round 2.*Similar practice/);
    assert.equal(t.d.querySelector('.results'),null);t.d.querySelector('#wrong-only').click();
    assert.deepEqual([...t.d.querySelectorAll('.question-card:not([hidden])')].map(el=>el.dataset.question),[second.questionIds[0]]);
    assert.equal(t.saved(),seed);
  }finally{t.close();}
});

test('review pools use canonical first checked choices, including corrected second tries',()=>{const r=legacyRun(),before=JSON.stringify(r),expected=r.questionIds.slice(0,4);r.answers[expected[0]][0].answerOK=true;assert.equal(core.round(r),1);assert.deepEqual(core.firstWrongIds(course,r),expected);assert.equal(core.canAdvance(course,r),true);const child=core.reviewRun(course,r,'round-two',later);assert.equal(child.round,2);assert.deepEqual(child.questionIds,expected.map(id=>variants.idFor(item(id),2)));assert.deepEqual(child.answers,{});assert.deepEqual(child.drafts,{});assert.equal(child.completedAt,null);assert.equal(core.childOf(course,child,r),true);assert.equal(r.answers[expected[0]].length,2);r.answers[expected[0]][0].answerOK=false;assert.equal(JSON.stringify(r),before);});

test('incomplete first passes, perfect passes and Round 3 cannot create another round',()=>{const r=legacyRun();delete r.answers[r.questionIds.at(-1)];r.drafts[r.questionIds.at(-1)]={choice:0,updatedAt:later};assert.equal(core.canAdvance(course,r),false);assert.equal(core.reviewRun(course,r,'blocked',later),null);assert.equal(core.reviewRun(course,legacyRun(0),'empty',later),null);const third={...legacyRun(),round:3};assert.equal(core.canAdvance(course,third),false);assert.equal(core.reviewRun(course,third,'four',later),null);});

test('Round 3 contains only Round 2 first-try misses, and optional retries preserve parent links',()=>{const parent=legacyRun(),second=core.reviewRun(course,parent,'second',later);second.questionIds.forEach((id,i)=>{const q=item(id);core.check(course,second,q,i===1?(q.answer+1)%5:q.answer,later);});assert.equal(core.canAdvance(course,second),true);const third=core.reviewRun(course,second,'third','2026-11-08T05:10:00Z');assert.deepEqual(third.questionIds,[variants.idFor(item(second.questionIds[1]),3)]);const frozen=JSON.stringify(third);core.check(course,second,item(second.questionIds[1]),item(second.questionIds[1]).answer,'2026-11-08T05:11:00Z');assert.equal(core.childOf(course,third,second),true);assert.equal(JSON.stringify(third),frozen);assert.deepEqual(core.scores(course,second),{total:4,answered:4,first:3,resolved:4});});

test('sync retains round metadata and links a child only to its matching conflicted parent',()=>{const parent=legacyRun(),second=core.reviewRun(course,parent,'round-two',later),other=JSON.parse(JSON.stringify(parent));const id=parent.questionIds[0];other.answers[id][0].choice=(other.answers[id][0].choice+1)%5;const merged=sync.merge({version:1,articles:{pattern:[parent,second]}},{version:1,articles:{pattern:[other]}}),parents=merged.articles.pattern.filter(r=>core.round(r)===1),child=merged.articles.pattern.find(r=>r.round===2);assert.equal(parents.length,2);assert.equal(parents.filter(r=>core.childOf(course,child,r)).length,1);assert.equal(core.childOf(course,child,parents.find(r=>r.answers[id][0].choice===parent.answers[id][0].choice)),true);assert.deepEqual(child.questionIds,second.questionIds);assert.equal(sync.stable(sync.merge(merged,merged)),sync.stable(merged));});

test('home stays simple, and new Round 2 resumes from results without changing earlier answers',()=>{const original=legacyRun(),seed=JSON.stringify({version:1,articles:{pattern:[original]}}),t=boot(seed);try{assert.equal(t.saved(),seed);assert.equal(t.d.querySelector('.review-rounds'),null);t.d.querySelector('[data-start="pattern"]').click();assert.match(t.d.querySelector('.next-round').textContent,/4 new similar questions/);t.d.querySelector('.next-round button').click();const ids=original.questionIds.slice(0,4).map(id=>variants.idFor(item(id),2));assert.deepEqual([...t.d.querySelectorAll('.question-card')].map(el=>el.dataset.question),ids);assert.equal(t.d.querySelector('input:checked'),null);assert.equal(t.d.querySelector('.explanation'),null);assert.equal(t.d.querySelector('.feedback'),null);const saved=JSON.parse(t.saved());assert.deepEqual(saved.articles.pattern[0],original);assert.equal(saved.articles.pattern[1].questionSet,'similar-v1');choose(t,0,ids[0]);t.d.querySelector('#all-sets').click();assert.match(t.d.querySelector('[data-start="pattern"]').closest('article').textContent,/Round 1.*First try 4\/8/);t.d.querySelector('[data-start="pattern"]').click();t.d.querySelector('.next-round button').click();assert.equal(t.d.querySelector('input:checked').value,'0');assert.equal(JSON.parse(t.saved()).articles.pattern.length,2);}finally{t.close();}});

test('similar rounds follow missed skills through Round 3, with independent scores and history',()=>{const original=legacyRun(),t=boot(JSON.stringify({version:1,articles:{pattern:[original]}}));try{t.d.querySelector('[data-start="pattern"]').click();t.d.querySelector('.next-round button').click();const ids=[...t.d.querySelectorAll('.question-card')].map(el=>el.dataset.question);ids.forEach((id,i)=>{choose(t,i===0?(item(id).answer+1)%5:item(id).answer,id);check(t,id);if(i===0){choose(t,item(id).answer,id);check(t,id);}});t.d.querySelector('#session-results').click();assert.match(t.d.querySelector('.score').textContent,/3\/4/);assert.equal(t.d.querySelector('#fresh'),null);t.d.querySelector('.next-round button').click();const thirdId=variants.idFor(item(ids[0]),3);assert.equal(t.d.querySelectorAll('.question-card').length,1);assert.equal(t.d.querySelector('.question-card').dataset.question,thirdId);assert.equal(t.d.querySelector('input:checked'),null);choose(t,item(thirdId).answer,thirdId);check(t,thirdId);t.d.querySelector('#session-results').click();assert.match(t.d.querySelector('.score').textContent,/1\/1/);assert.equal(t.d.querySelector('.next-round'),null);const saved=JSON.parse(t.saved()).articles.pattern;assert.deepEqual(saved[0],original);assert.deepEqual(saved.map(r=>core.round(r)),[1,2,3]);t.d.querySelector('#all-sets').click();assert.equal(t.d.querySelectorAll('.history-row').length,3);assert.equal(t.d.querySelector('.review-rounds'),null);}finally{t.close();}});

test('review rounds and their own checked answers survive sync into a second browser',async()=>{let remote=null;const fetcher=async(_url,options)=>{if(options.method==='POST'){const p=JSON.parse(options.body);remote={state:p.state,version:(remote?.version||0)+1};return {ok:true,json:async()=>({accepted:true,progress:remote})};}return {ok:true,json:async()=>({progress:remote})};};const parent=legacyRun(),second=core.reviewRun(course,parent,'synced-round-two',later);core.check(course,second,item(second.questionIds[0]),item(second.questionIds[0]).answer,later);const seed=JSON.stringify({version:1,articles:{pattern:[parent,second]}}),a=boot(seed,fetcher);const settle=async t=>{for(let i=0;i<200&&t.d.querySelector('#save-status').textContent!=='Synced online';i++)await new Promise(r=>setTimeout(r,5));assert.equal(t.d.querySelector('#save-status').textContent,'Synced online');};try{await settle(a);const b=boot(null,fetcher);try{await settle(b);const rows=JSON.parse(b.saved()).articles.pattern;assert.deepEqual(rows,[parent,second]);b.d.querySelector('[data-start="pattern"]').click();b.d.querySelector('.next-round button').click();assert.match(b.d.querySelector('.session-head h1').textContent,/Round 2/);assert.equal(b.d.querySelectorAll('.feedback.correct').length,1);assert.equal(b.d.querySelectorAll('.question-card').length,4);}finally{b.close();}}finally{a.close();}});

test('each type shows all eight questions with independent answer groups and saved drafts',()=>{for(const group of course.groups){const t=boot();try{t.d.querySelector(`[data-start="${group.id}"]`).click();assert.equal(t.d.querySelectorAll('.question-card').length,8);assert.equal(t.d.querySelectorAll('.answer-form').length,8);assert.equal(new Set([...t.d.querySelectorAll('input')].map(el=>el.name)).size,8);const [first,second]=group.questionIds;choose(t,0,first);choose(t,1,second);assert.equal(card(t,first).querySelector('input:checked').value,'0');assert.equal(card(t,second).querySelector('input:checked').value,'1');const saved=JSON.parse(t.saved()).articles[group.id][0];assert.equal(saved.drafts[first].choice,0);assert.equal(saved.drafts[second].choice,1);assert.equal(t.d.querySelector('#session-results').disabled,true);}finally{t.close();}}});

test('checking one question preserves other drafts and open explanations; results and review retain all eight',()=>{const t=boot();try{t.d.querySelector('[data-start="serial"]').click();const ids=core.ids(course,'serial'),first=course.questions.find(q=>q.id===ids[0]),second=course.questions.find(q=>q.id===ids[1]);choose(t,first.answer,first.id);check(t,first.id);card(t,first.id).querySelector('.explanation').open=true;choose(t,2,ids[2]);choose(t,second.answer,second.id);check(t,second.id);assert.equal(card(t,first.id).querySelector('.explanation').open,true);assert.equal(card(t,ids[2]).querySelector('input:checked').value,'2');assert.equal(t.d.querySelector('[data-progress]').textContent,'2/8');for(const id of ids.slice(2)){choose(t,course.questions.find(q=>q.id===id).answer,id);check(t,id);}assert.equal(t.d.querySelector('#session-results').disabled,false);assert.ok(JSON.parse(t.saved()).articles.serial[0].completedAt);t.d.querySelector('#session-results').click();assert.match(t.d.querySelector('.score').textContent,/8\/8/);t.d.querySelector('[data-review="6"]').click();assert.equal(t.d.querySelectorAll('.question-card').length,8);assert.equal(t.d.querySelectorAll('fieldset:disabled').length,8);assert.equal(t.d.querySelectorAll('.check-answer').length,0);assert.equal(t.d.querySelector('#session-results').textContent,'See results');t.d.querySelector('#session-results').click();assert.ok(t.d.querySelector('.results'));}finally{t.close();}});
test('all four source sections have exactly two warm-ups and six challenges, with stable distinct IDs',()=>{assert.equal(course.sourceCount,120);assert.equal(course.questions.length,32);assert.equal(new Set(course.questions.map(q=>q.id)).size,32);assert.equal(core.ids(course,'mixed').length,24);assert.equal(core.ids(course,'warmup').length,8);for(const g of course.groups){const qs=g.questionIds.map(id=>course.questions.find(q=>q.id===id));assert.deepEqual(qs.slice(0,2).map(q=>q.level),['easy','medium']);assert.ok(qs.slice(2).every(q=>q.level==='challenge'));assert.ok(qs.every(q=>q.sourceNumber<=g.total));}});
test('every selected diagram and choice exists with a PNG signature and a valid five-choice key',()=>{for(const q of course.questions){assert.ok(q.figures.length===1||q.figures.length===6,q.id);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<5,q.id);for(const p of q.figures){const bytes=fs.readFileSync(path.join(__dirname,p));assert.equal(bytes.subarray(0,4).toString('hex'),'89504e47',p);}assert.ok(q.explanation.length>60);}});
test('fifth answer E is valid, retries preserve first-choice score, and a third try is refused',()=>{const r={id:'r',questionIds:[q.id],answers:{}};assert.equal(q.answer,4);assert.equal(core.check(course,r,q,7,'2026-11-07T20:00:00Z'),null);assert.equal(core.check(course,r,q,0,'2026-11-07T20:00:00Z').answerOK,false);assert.equal(core.resolved(q,r),false);assert.equal(r.completedAt,undefined);assert.equal(core.check(course,r,q,4,'2026-11-07T20:01:00Z').answerOK,true);assert.equal(core.check(course,r,q,4,'2026-11-07T20:02:00Z'),null);assert.equal(core.scores(course,r).first,0);assert.equal(r.completedAt,'2026-11-07T20:01:00Z');});
test('incomplete choices do not consume tries, and two misses finish without claiming a first-try success',()=>{const r={questionIds:[q.id],answers:{}};assert.equal(core.check(course,r,q,null,'2026-11-07T20:00:00Z'),null);assert.equal(core.check(course,r,q,0,'bad date'),null);assert.deepEqual(r.answers,{});core.check(course,r,q,0,'2026-11-07T20:00:00Z');core.check(course,r,q,1,'2026-11-07T20:01:00Z');assert.deepEqual(core.scores(course,r),{total:1,answered:1,first:0,resolved:1});});
test('five-choice progress preserves E and conflicting first checks remain separate histories',()=>{const a={version:1,articles:{serial:[{id:'same',questionIds:[q.id],answers:{[q.id]:[{choice:4,checkedAt:'2026-11-07T20:00:00Z',answerOK:true}]}}]}},b=JSON.parse(JSON.stringify(a));b.articles.serial[0].answers[q.id][0].choice=0;assert.equal(sync.normalize(a).articles.serial[0].answers[q.id][0].choice,4);assert.equal(sync.merge(a,b).articles.serial.length,2);assert.equal(sync.APP_ID,KEY);});
test('drafts resume, answers reveal only after resolution, and retries do not change first scores',()=>{const t=boot();try{t.d.querySelector('[data-start="serial"]').click();assert.equal(card(t).querySelector('.check-answer').disabled,true);choose(t,0);const saved=t.saved();t.d.querySelector('#all-sets').click();assert.equal(t.saved(),saved);t.d.querySelector('[data-start="serial"]').click();assert.equal(t.d.querySelector('input:checked').value,'0');check(t);assert.equal(t.d.querySelector('.explanation'),null);assert.match(t.d.querySelector('.feedback').textContent,/try once more/);choose(t,4);check(t);assert.ok(t.d.querySelector('.explanation'));assert.equal(t.d.querySelector('.explanation').open,false);assert.equal(card(t).querySelector('.check-answer'),null);assert.equal(JSON.parse(t.saved()).articles.serial[0].answers['serial-1'].length,2);t.d.querySelector('#all-sets').click();assert.match(t.d.querySelector('[data-start="serial"]').closest('article').textContent,/First try 0\/8/);const reload=boot(t.saved());try{reload.d.querySelector('[data-start="serial"]').click();assert.match(reload.d.querySelector('.feedback').textContent,/Correct/);}finally{reload.close();}}finally{t.close();}});
test('mixed challenge excludes warm-ups and enlargement leaves saved answers untouched',()=>{const t=boot();try{t.d.querySelector('[data-start="mixed"]').click();const saved=t.saved(),r=JSON.parse(saved).articles.mixed[0];assert.equal(r.questionIds.length,24);assert.equal(new Set(r.questionIds).size,24);assert.ok(r.questionIds.every(id=>course.questions.find(q=>q.id===id).level==='challenge'));t.d.querySelector('.enlarge').click();assert.equal(t.d.querySelector('dialog').open,true);assert.equal(t.saved(),saved);t.d.querySelector('#close-diagram').click();assert.equal(t.d.querySelector('dialog').open,false);}finally{t.close();}});
test('finished runs retain a dated history and starting again appends a new record',()=>{const ids=core.ids(course,'warmup'),r={id:'done',startedAt:'2026-11-07T20:00:00Z',questionIds:ids,position:0,answers:{},drafts:{}};for(const id of ids){const item=course.questions.find(q=>q.id===id);core.check(course,r,item,item.answer,'2026-11-07T20:15:00Z');}const t=boot(JSON.stringify({version:1,articles:{warmup:[r]}}));try{t.d.querySelector('[data-start="warmup"]').click();assert.equal(t.d.querySelector('.results'),null);assert.equal(t.d.querySelectorAll('.question-card').length,8);t.d.querySelector('#session-results').click();assert.match(t.d.querySelector('.results').textContent,/Practice finished/);assert.match(t.d.querySelector('time').textContent,/Nov 7, 2026/);t.d.querySelector('#fresh').click();assert.equal(JSON.parse(t.saved()).articles.warmup.length,2);assert.equal(JSON.parse(t.saved()).articles.warmup[0].completedAt,r.completedAt);}finally{t.close();}});
test('saved NNAT work syncs into a second browser with five-choice answers intact',async()=>{let remote=null;const fetcher=async(_url,options)=>{if(options.method==='POST'){const p=JSON.parse(options.body);assert.equal(p.appId,KEY);remote={state:p.state,version:(remote?.version||0)+1};return {ok:true,json:async()=>({accepted:true,progress:remote})};}return {ok:true,json:async()=>({progress:remote})};};const saved=JSON.stringify({version:1,articles:{serial:[{id:'synced',questionIds:[q.id],startedAt:'2026-11-07T20:00:00Z',position:0,answers:{[q.id]:[{choice:4,checkedAt:'2026-11-07T20:01:00Z',answerOK:true}]},drafts:{}}]}}),a=boot(saved,fetcher);const settle=async t=>{for(let i=0;i<100&&t.d.querySelector('#save-status').textContent!=='Synced online';i++)await new Promise(r=>setTimeout(r,5));assert.equal(t.d.querySelector('#save-status').textContent,'Synced online');};try{await settle(a);const b=boot(null,fetcher);try{await settle(b);assert.equal(JSON.parse(b.saved()).articles.serial[0].answers[q.id][0].choice,4);}finally{b.close();}}finally{a.close();}});
test('the hub places NNAT after Writing and keeps Word Meaning Check archived',()=>{const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'));const ids=[...dom.window.document.querySelectorAll('.harry-grid:not(.archive-grid)>article')].map(el=>el.id);assert.ok(ids.includes('harry-writing'));assert.equal(ids.indexOf('harry-nnat'),ids.indexOf('harry-writing')+1);assert.ok(dom.window.document.querySelector('.archive-grid #harry-word-meaning'));dom.window.close();});
test('a newly checked answer stays in its workspace after cloud sync',async()=>{let remote=null;const fetcher=async(_url,options)=>{if(options.method==='POST'){const p=JSON.parse(options.body);remote={state:p.state,version:(remote?.version||0)+1};return {ok:true,json:async()=>({accepted:true,progress:remote})};}return {ok:true,json:async()=>({progress:remote})};};const t=boot(null,fetcher);const settle=async()=>{for(let i=0;i<200&&t.d.querySelector('#save-status').textContent!=='Synced online';i++)await new Promise(r=>setTimeout(r,5));assert.equal(t.d.querySelector('#save-status').textContent,'Synced online');};try{await settle();t.d.querySelector('[data-start="serial"]').click();choose(t,4);check(t);t.d.querySelector('#sync-now').click();await settle();assert.match(t.d.querySelector('.source-ref').textContent,/Serial Reasoning.*#1/);assert.equal(t.d.querySelector('input:checked').value,'4');assert.match(t.d.querySelector('.feedback').textContent,/Correct/);assert.equal(remote.state.articles.serial[0].answers['serial-1'][0].choice,4);}finally{t.close();}});


test('all 64 similar questions have five distinct choices, valid SVGs, and new diagrams in each round',()=>{for(const source of course.questions){const second=variants.get(course,variants.idFor(source,2)),third=variants.get(course,variants.idFor(source,3));assert.notEqual(second.figures[0],third.figures[0],source.id);for(const q of [second,third]){assert.equal(q.sourceId,source.id);assert.equal(q.type,source.type);assert.ok(q.answer>=0&&q.answer<5);assert.equal(q.figures.length,6);assert.equal(new Set(q.figures.slice(1)).size,5,q.id);for(const uri of q.figures){assert.ok(uri.startsWith('data:image/svg+xml'));const xml=decodeURIComponent(uri.split(',').slice(1).join(',')),dom=new JSDOM(xml,{contentType:'image/svg+xml'});assert.equal(dom.window.document.querySelector('parsererror'),null);dom.window.close();}assert.notEqual(q.figures[0],source.figures[0]);}}});

test('an earlier repeat round remains in history while new similar practice starts separately',()=>{const parent=legacyRun(),old={id:'old-repeat',round:2,sourceRunId:parent.id,sourceRoot:parent.id,sourceFirstPass:core.firstPassKey(course,parent),questionIds:core.firstWrongIds(course,parent),startedAt:later,position:0,completedAt:null,answers:{},drafts:{}};const t=boot(JSON.stringify({version:1,articles:{pattern:[parent,old]}}));try{t.d.querySelector('[data-start="pattern"]').click();assert.match(t.d.querySelector('.next-round button').textContent,/Start Round 2/);t.d.querySelector('.next-round button').click();const saved=JSON.parse(t.saved()).articles.pattern;assert.deepEqual(saved[1],old);assert.equal(saved.length,3);assert.ok(saved[2].questionIds.every(id=>id.includes('-similar-v1-r2')));}finally{t.close();}});
