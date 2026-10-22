(function () {
  'use strict';
  const bank=window.HARRY_SEPT_PRACTICE, engine=window.HarrySeptEngine;
  const groups=window.HARRY_STAR_GROUPS||null,R=window.HarryWeekRound2,W=window.HarryWeekRules;
  const groupId=()=>active?.group || (groups?.find(g=>g.id===new URLSearchParams(location.search).get('group'))?.id||null);
  const visibleBank=()=>groups?bank.filter(s=>s.group===groupId()):bank;
  const KEY='harry-star-sept20-four-sessions-v1';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const math=s=>esc(s).replace(/\b(\d+|[a-zA-Z])\/(\d+)\b/g,'<span class="fraction" aria-label="$1 over $2"><span>$1</span><span>$2</span></span>');
  const date=s=>new Date(s).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
  let sync=null, syncKind='connecting', syncMessage='Connecting… Your saved answers will sync automatically.';
  let storageOK=true, state={version:1,sessions:{}};
  try {const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.version===1&&saved.sessions)state=saved;} catch {storageOK=false;}
  if(window.HarrySeptSync)state=window.HarrySeptSync.applyResets(state);
  const findSession=id=>{const base=bank.find(s=>s.id===id||s.practiceOnly&&s.id+'-round2'===id);return base||R?.resolve(id,state)||null;};
  const selectedDay=()=>findSession(new URLSearchParams(location.search).get('session'));
  let active=selectedDay(),onlyMistakes=false;
  const locked=session=>W?.lockReason(session,state)||'';
  function newRun(restart=false){return {...(active?.round2?{round2Sources:active.questions.map(q=>q.source),sourceRunId:active.sourceRunId}:{}),restart,id:crypto.randomUUID(),startedAt:new Date().toISOString(),answers:{},completedAt:null};}
  function runs(session){return state.sessions[session.id] ||= [newRun()];}
  function current(){const history=runs(active);return active.weekly?(R.firstRun(history)||history.at(-1)):history.at(-1);}
  function save(upload=true){try{if(!storageOK)throw new Error('Storage unavailable');localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}updateSaveNote();if(upload)void sync?.push();}
  function updateSaveNote(){const el=document.querySelector('#save-note');el.dataset.syncStatus=syncKind;el.classList.toggle('warning',!storageOK||syncKind==='offline');el.textContent=storageOK?syncMessage:'Progress could not be saved in this browser. Keep this page open and download your records before leaving.';}
  function result(q,run){const e=run.answers[q.source];if(!e?.attempts.length)return '';if(active?.practiceOnly)return engine.done(q,e)?'first':'pending';if(engine.isCorrect(q,e.attempts[0].choice))return 'first';if(e.attempts.slice(1).some(a=>engine.isCorrect(q,a.choice)))return 'retry';return !q.retryUntilCorrect&&e.attempts.length===2?'revealed':'pending';}
  function numberline(){return `<svg class="numberline" viewBox="0 0 600 145" role="img" aria-label="Number line from zero to one with eight equal intervals. A yellow star, blue circle, yellow square, and green triangle are positioned below ticks."><line x1="40" y1="45" x2="560" y2="45" stroke="#193c49" stroke-width="2"/>${Array.from({length:9},(_,i)=>`<line x1="${40+i*65}" x2="${40+i*65}" y1="${i===0||i===8?33:39}" y2="${i===0||i===8?57:51}" stroke="#193c49" stroke-width="2"/>`).join('')}<text x="40" y="85" text-anchor="middle" font-size="22">0</text><text x="560" y="85" text-anchor="middle" font-size="22">1</text><polygon points="170,65 175,77 189,77 178,85 182,99 170,91 158,99 162,85 151,77 165,77" fill="#ffdf4b" stroke="#193c49"/><circle cx="235" cy="83" r="15" fill="#28b8d1" stroke="#193c49"/><rect x="285" y="68" width="30" height="30" fill="#ffdf4b" stroke="#193c49"/><polygon points="430,65 448,98 412,98" fill="#85d452" stroke="#193c49"/></svg>`;}
  const sourceLabel=q=>q.sourceLabel||`STAR Q${q.source}`;
  const chosenText=(q,choice)=>q.legacyQuestion&&typeof choice==='number'?chosenText(q.legacyQuestion,choice):engine.typed(q)?esc(choice):`${'ABCD'[choice]} (${esc(q.choices[choice])})`;
  const firstTryText=s=>s?.attempted?`${s.firstTryPercent}% first try${s.attempted<s.total?' so far':''}`:'First-try score: —';
  const skillText=(session,run)=>window.HarryWeekExtraReview?.text(session,run)||'';
  const answerText=q=>q.type==='fraction'?math(q.correct):q.type==='fill-blanks'?q.blanks.map(b=>`${esc(b.label)} ${b.answer} ${esc(b.unit)}`).join('<br>'):q.type==='split-sum'?`${q.expansion[0]} × ${q.expansion[1]} + ${q.expansion[2]} × ${q.expansion[3]} = ${q.parts[0].toLocaleString('en-US')} + ${q.parts[1].toLocaleString('en-US')} = ${q.parts[2].toLocaleString('en-US')}`:q.type==='number'?q.correct.toLocaleString('en-US'):`${'ABCD'[q.correct]} · ${math(q.choices[q.correct])}`;
  function numericField(q,attempts,closed){
    if(q.type==='fraction'){
      const values=closed?String(attempts.at(-1)?.choice||'').split('/'):['',''];
      return `<div class="numeric-entry"><div class="fraction-entry"><label for="fraction-${q.source}-0">Numerator<input id="fraction-${q.source}-0" name="fraction-part" type="text" inputmode="numeric" autocomplete="off" placeholder="___" value="${esc(values[0]||'')}" ${closed?'disabled':''} aria-describedby="feedback-${q.source}"></label><span aria-hidden="true">/</span><label for="fraction-${q.source}-1">Denominator<input id="fraction-${q.source}-1" name="fraction-part" type="text" inputmode="numeric" autocomplete="off" placeholder="___" value="${esc(values[1]||'')}" ${closed?'disabled':''} aria-describedby="feedback-${q.source}"></label></div>${attempts.length?`<ol class="numeric-attempts">${attempts.map((a,i)=>`<li>${active.practiceOnly?'Answer':'Try '+(i+1)}: ${math(a.choice)} · ${engine.isCorrect(q,a.choice)?'correct':'incorrect'}</li>`).join('')}</ol>`:''}</div>`;
    }
    if(q.type==='fill-blanks'){
      const recorded=String(attempts.at(-1)?.choice||'').split(' | ');
      return `<div class="unit-blanks">${q.blanks.map((b,i)=>`${i===0||b.category!==q.blanks[i-1].category?`<h4>${esc(b.category)}</h4>`:''}<label class="unit-row" for="unit-${q.source}-${i}"><span>${esc(b.label)}</span><input id="unit-${q.source}-${i}" name="unit-answer" type="text" inputmode="numeric" autocomplete="off" placeholder="___" aria-label="${esc(b.label)} how many ${esc(b.unit)}" aria-describedby="feedback-${q.source}" value="${esc(recorded[i]||'')}" ${closed?'disabled':''}><span>${esc(b.unit)}</span></label>`).join('')}${attempts.length?`<ol class="numeric-attempts">${attempts.map((a,i)=>`<li>${active.practiceOnly?'Answer':'Try '+(i+1)}: ${esc(a.choice)} · ${engine.isCorrect(q,a.choice)?'correct':'incorrect'}</li>`).join('')}</ol>`:''}</div>`;
    }
    if(q.type==='split-sum'){
      let recorded=closed?(engine.splitValues(attempts.at(-1)?.choice||'')||[]):[];
      if(recorded.length===3)recorded=['','','','',...recorded];
      const labels=['First factor','Second factor','Third factor','Fourth factor','First product','Second product','Total'];
      const input=i=>`<label for="part-${q.source}-${i}"><span class="sr-only">${labels[i]}</span><input id="part-${q.source}-${i}" name="number-part" type="text" inputmode="numeric" autocomplete="off" placeholder="___" value="${esc(recorded[i]||'')}" ${closed?'disabled':''} aria-describedby="feedback-${q.source}"></label>`;
      return `<div class="numeric-entry"><div class="split-equation factor-equation"><b aria-hidden="true">=</b>${input(0)}<b aria-hidden="true">×</b>${input(1)}<b aria-hidden="true">+</b>${input(2)}<b aria-hidden="true">×</b>${input(3)}</div><div class="split-equation product-equation"><b aria-hidden="true">=</b>${input(4)}<b aria-hidden="true">+</b>${input(5)}<b aria-hidden="true">=</b>${input(6)}</div>${attempts.length?`<ol class="numeric-attempts">${attempts.map((a,i)=>`<li>${active.practiceOnly?'Answer':'Try '+(i+1)}: ${esc(a.choice)} · ${engine.isCorrect(q,a.choice)?'correct':'incorrect'}</li>`).join('')}</ol>`:''}</div>`;
    }
    return `<div class="numeric-entry"><label for="number-${q.source}">${esc(q.answerLabel||'Your answer')}</label><input id="number-${q.source}" name="number-answer" type="text" inputmode="${q.decimal?'decimal':'numeric'}" autocomplete="off" ${closed?'disabled':''} aria-describedby="feedback-${q.source}">${attempts.length?`<ol class="numeric-attempts">${attempts.map((a,i)=>`<li>${active.practiceOnly?'Answer':'Try '+(i+1)}: ${esc(a.choice)} · ${engine.isCorrect(q,a.choice)?'correct':'incorrect'}</li>`).join('')}</ol>`:''}</div>`;
  }
  function card(q,i){
    if(q.legacyQuestion&&typeof current().answers[q.source]?.attempts[0]?.choice==='number')q=q.legacyQuestion;
    const run=current(),entry=run.answers[q.source],attempts=entry?.attempts||[],closed=engine.done(q,entry),status=result(q,run);
    let feedback=engine.typed(q)?(q.type==='fraction'?'Fill in the numerator and denominator, then press Check answer.':q.type==='fill-blanks'?'Fill all six blanks, then press Check answer.':q.type==='split-sum'?'Fill all seven boxes, then press Check answer.':'Type your answer, then press Check answer.'):'Choose an answer, then press Check answer.';
    if(status==='first')feedback=active.practiceOnly?'Correct! This question is complete.':'Correct on your first try! 1 point earned.';
    if(status==='pending')feedback=q.retryUntilCorrect?'Not yet. Keep trying.'+(attempts.length>=2&&q.hint?' Hint: '+q.hint:''):'Not quite. You have one more try. Your first-try score stays unchanged.';
    if(status==='retry')feedback=q.retryUntilCorrect?'Correct on try '+attempts.length+'! Your first-try score stays unchanged.':'You got it on your second try! This correction is saved; the first-try score stays unchanged.';
    if(status==='revealed')feedback='Two tries completed. Read the explanation below to learn the method.';
    return `<article class="question ${status}" id="q${i+1}" data-source="${q.source}"><div class="question-head"><h3>Question ${i+1}</h3><span class="source">${(active.id==='original'||active.original)?'Original':'Matches'} ${esc(sourceLabel(q))} · ${esc(q.skill)}</span></div><p class="prompt">${math(q.prompt)}</p>${q.visual==='numberline'?numberline():(window.HarryStarVisuals?.draw(q.visual)||'')}<form data-source="${q.source}" novalidate>${engine.typed(q)?numericField(q,attempts,closed):`<fieldset class="choices"><legend>${closed?'Your recorded answers':'Choose one answer'}</legend>${q.choices.map((choice,index)=>{
      const tried=attempts.findIndex(a=>a.choice===index),disabled=closed||tried>=0;
      const tag=tried>=0?(active.practiceOnly?(index===q.correct?'Correct':'Try another answer'):`Try ${tried+1}${index===q.correct?' · correct':' · incorrect'}`):'';
      return `<label class="choice ${disabled?'disabled':''} ${tried>=0&&index!==q.correct?'wrong-option':''} ${closed&&index===q.correct?'correct-option':''}"><input type="radio" name="answer-${q.source}" value="${index}" ${disabled?'disabled':''} ${tried===attempts.length-1&&tried>=0?'checked':''}><span class="letter">${'ABCD'[index]}</span><span class="choice-text">${math(choice)}${window.HarryStarVisuals?.draw(q.visual,index)||''}${tag?`<small>${tag}</small>`:''}</span></label>`;
    }).join('')}</fieldset>`}${closed?'':`<button class="submit" type="submit">${attempts.length&&!q.retryUntilCorrect?'Check second try':'Check answer'}</button>`}</form><p class="feedback" id="feedback-${q.source}" tabindex="-1" role="status">${feedback}</p>${closed?`<div class="answer"><strong>Answer: ${answerText(q)}</strong><p>${math(q.explanation)}</p></div>`:''}</article>`;
  }
  function round2Link(session){
    if(session.practiceOnly)return '';
    const review=R.resolve(session.id+'-round2',state),run=state.sessions[review.id]?.at(-1),st=run?engine.stats(review,run):null,reason=locked(review);
    return `<a class="round2-link${reason?' locked':st?.finished===st?.total&&st?' completed':''}" href="?session=${review.id}" ${active?.id===review.id?'aria-current="page"':''}><b>${reason?'🔒 ':''}Round 2</b><small>${reason?esc(reason):st?`${st.finished===st.total?'✓ Done · ':''}${st.first}/${st.total} first-try points`:!review.ready?'Finish Round 1 first answers':review.questions.length?`${review.questions.length} first-try misses · new numbers`:'✓ No first-try misses'}</small></a>`;
  }
  function applyMistakeFilter(){
    const control=document.querySelector('#mistake-filter');
    if(!active||active.practiceOnly||!(active.weekly||active.round2)||locked(active)||!active.questions.length){control.hidden=true;return;}
    control.hidden=false;const run=current();let count=0;
    active.questions.forEach((q,i)=>{const attempt=run.answers[q.source]?.attempts[0],miss=!!attempt&&!engine.isCorrect(q,attempt.choice);if(miss)count++;
      const question=document.getElementById('q'+(i+1)),jump=document.querySelector(`#jump a[href="#q${i+1}"]`);if(question)question.hidden=onlyMistakes&&!miss;if(jump)jump.hidden=onlyMistakes&&!miss;
    });
    const button=document.querySelector('#toggle-mistakes');button.setAttribute('aria-pressed',String(onlyMistakes));button.textContent=onlyMistakes?'Show all questions':'Show first-try mistakes only';
    document.querySelector('#mistake-count').textContent=onlyMistakes?(count?`Showing ${count} first-try mistakes, including those corrected later.`:'No first-try mistakes recorded yet. Show all questions to continue.'):`${count} first-try mistakes recorded.`;
  }
  function renderDays(){
    let completedDays=0;
    document.querySelector('#sessions').innerHTML=visibleBank().map((session,i)=>{
      const savedHistory=state.sessions[session.id]||[],history=session.weekly?[window.HarryWeekProgress.firstRun(savedHistory)].filter(Boolean):savedHistory,latest=history.at(-1),r=latest?engine.stats(session,latest):null;
      const completed=history.filter(run=>engine.stats(session,run).finished===session.questions.length)
        .sort((a,b)=>(a.completedAt||a.startedAt).localeCompare(b.completedAt||b.startedAt)).at(-1);
      const score=completed?engine.stats(session,completed):null;
      const reason=locked(session),status=reason?'locked':completed?'completed':r?.attempted?'in-progress':'not-started';
      if(completed&&!session.retest)completedDays++;
      const repeat=completed&&latest!==completed&&r.finished!==r.total;
      const card=`<a class="session-link ${status}" href="?session=${session.id}" ${active?.id===session.id?'aria-current="page"':''}><b>${reason?'🔒 ':''}${session.weekly?esc(session.cardLabel):`${groups?.find(g=>g.id===session.group)?.unit||'Day'} ${i+1}`}</b>${session.weekly?'':`<span>${esc(session.cardLabel||(i?'Fresh check '+String.fromCharCode(64+i):'Original retry'))}</span>`}<span class="day-status">${reason?'Locked':completed?'✓ Completed':r?.attempted?'In progress':'Not started'}</span>${session.practiceOnly?`<strong class="day-score">${firstTryText(r)}</strong><small>${r?.finished||0}/${session.questions.length} completed · Practice until correct</small>`:score?`<strong class="day-score">${score.first}/${score.total} <small>(${score.percent}%)</small></strong><small>${session.weekly?'First run · first-try score':'Latest completed first-try score'}</small>`:`<small>${r?.attempted?`${r.first}/${r.total} first-try points · ${r.attempted}/${r.total} attempted` :`${session.questions.length} questions`}</small>`}${reason?`<small class="lock-hint">${esc(reason)}</small>`:''}${session.weekly&&!session.targeted&&session.id.startsWith('week-oct12-3')?'<small class="mastery-target">Day 3 target: 9/12</small>':''}${repeat?`<small class="repeat-note">New run · ${r.attempted}/${r.total} attempted</small>`:''}</a>`;return session.weekly?`<div class="session-pair">${card}${round2Link(session)}</div>`:card;
    }).join('');
    const extra=window.HarryWeekExtraReview;
    if(extra){const session=visibleBank().find(s=>s.extraReview),link=session&&document.querySelector(`.session-link[href="?session=${session.id}"]`);if(link){const run=window.HarryWeekProgress.firstRun(state.sessions[session.id])||{answers:{}};link.querySelector('.day-score').textContent='4 questions per skill';link.insertAdjacentHTML('beforeend',`<small class="skill-counts">${esc(skillText(session,run))}</small><small>Goal: 3/4 in each skill</small>`);}}
    document.querySelector('#days-progress').textContent=`${completedDays} of ${visibleBank().filter(s=>!s.retest).length} ${groups?.find(g=>g.id===groupId())?.unit==='Session'?'sessions':'days'} completed`;
    window.HarryWeekProgress?.render({bank,state,engine,groupId:groupId()});
    const note=document.querySelector('.days-note');if(note)note.textContent=visibleBank().some(s=>s.weekly)?'Days 3.4–3.6 and Days 4–6 show a first-try percentage and let you keep trying until correct, with no separate second round. Days 4–6 have 8 questions each. Day 3.6 and later sessions unlock after all 6 questions in Day 3.5 are completed correctly. Retries count toward completion. Earlier scores and saved answers are kept.':'Completed sessions turn green and show the latest completed first-try score. Your scores and attempt history sync across your devices.';
  }
  function renderSummary(){
    const s=engine.stats(active,current());document.querySelector('#score').textContent=active.practiceOnly?(s.firstTryPercent===null?'—':`${s.firstTryPercent}%`):`${s.first} / ${s.total}`;
    const skills=document.querySelector('#skill-scores');skills.hidden=!active.extraReview;if(active.extraReview)skills.innerHTML=window.HarryWeekExtraReview.html(active,current());
    document.querySelector('.scorebar div span').textContent=active.practiceOnly&&s.attempted<s.total?'First-try score so far':'First-try score';
    document.querySelector('#progress').textContent=active.practiceOnly?`${s.finished}/${s.total} completed · ${s.first}/${s.attempted} first answers correct · ${s.attempted}/${s.total} questions attempted. Retries do not change your first-try score.`:`${s.attempted}/${s.total} first tries recorded · ${s.corrected} corrected on retry · ${s.revealed} answers shown${s.attempted===s.total?` · Final first-try score: ${s.percent}%`:''}`;
    renderDays();
    document.querySelector('#jump').innerHTML=active.questions.map((q,i)=>`<a href="#q${i+1}" class="${result(q,current())}" aria-label="Question ${i+1}">${i+1}</a>`).join('');
    const completion=document.querySelector('#completion');completion.hidden=s.finished!==s.total;
    completion.innerHTML=s.finished===s.total?(active.practiceOnly?`<h2>Practice complete!</h2><p>All ${s.total} questions answered correctly.</p><p>First-try score: <strong>${s.firstTryPercent}% (${s.first}/${s.total})</strong>. Retries do not change this score.</p><p>${weeklyNextStep()}</p>`:`<h2>${s.first===s.total?`${s.total} out of ${s.total} on your first tries!`:active.round2?'Round 2 complete. Well done for working through it.':'Day complete. Well done for working through it.'}</h2><p>First-try score: <strong>${s.first}/${s.total} (${s.percent}%)</strong>. Second-try corrections: ${s.corrected}. Answers shown after two misses: ${s.revealed}.</p><p>${(active.weekly||active.round2)?weeklyNextStep():active.id===visibleBank().at(-1).id?'Your practice record is below. Review any skills that still need work.':'When you are ready, try the next day’s fresh questions.'}</p>`):'';
    document.querySelector('#new-run').hidden=active.weekly||s.finished!==s.total;document.querySelector('#new-run').textContent=active.round2?'Repeat these Round 2 questions':'Start another run of this session';
    if(active.extraReview&&s.finished===s.total)completion.insertAdjacentHTML('beforeend',`<p>${esc(skillText(active,current()))}. Goal: 3/4 in each skill.</p>`);
    renderHistory();applyMistakeFilter();
  }
  function weeklyNextStep(){
    const base=bank.find(s=>s.id===(active.baseId||active.id)),reason=W.unfinished(base,state);
    if(reason)return `You can review first-try mistakes in <a href="?session=${base.id}-round2">Round 2</a>, or choose another unlocked session.`;
    if(base.extraReview)return 'Review any first-try mistakes with a parent. Choose any unlocked session.';
    if(base.id==='week-oct12-6')return 'Day 6 is complete. <a href="?session=week-oct12-extra-review">Open the extra fraction review</a> when you are ready.';
    if(base.id==='week-oct12-3-4'||base.id==='week-oct12-3-5'){const next=bank[bank.indexOf(base)+1];return `Fraction review complete. <a href="?session=${next.id}">Open ${esc(next.cardLabel)}</a> for 6 fresh questions.`;}
    if(base.practiceOnly)return base.targeted?'Fraction review complete. Day 3.6 and later sessions unlock after completing Day 3.5.':'Practice complete. Choose any unlocked session.';
    if(base.id==='week-oct12-3-3')return 'Day 3.4 is a short check of the fraction skills that still need practice. <a href="?session=week-oct12-3-4">Open Day 3.4</a>';
    if(base.id.startsWith('week-oct12-3')&&!W.day3Passed(state)){
      const next=base.id==='week-oct12-3'?'week-oct12-3-2':base.id==='week-oct12-3-2'?'week-oct12-3-3':null;
      return `The Day 3 practice target is <strong>9/12 on first tries</strong>. Sessions through Day 3.5 are open. ${next?`<a href="?session=${next}">Start ${esc(bank.find(s=>s.id===next).cardLabel)}</a>`:'Review the explanations with a parent before more fresh practice.'}`;
    }
    return base.id==='week-oct12-6'?'Your practice record is below.':'Practice complete. Day 3.6 and later sessions unlock after all 6 questions in Day 3.5 are completed correctly. Retries count toward completion.';
  }
  function renderHistory(){
    document.querySelector('#history').innerHTML=runs(active).map((run,i)=>{
      const s=engine.stats(active,run);
      if(active.extraReview)return `<details class="history-run"><summary>Practice ${i+1} - ${esc(date(run.startedAt))} - ${s.finished}/${s.total} completed</summary><p>${esc(skillText(active,run))}. Goal: 3/4 in each skill.</p><ol>${active.questions.map(q=>{const attempts=run.answers[q.source]?.attempts;return `<li>Q${q.source}: ${esc(q.skill)} - ${attempts?.length?attempts.map((a,j)=>`Try ${j+1}: ${chosenText(q,a.choice)} - ${engine.isCorrect(q,a.choice)?'correct':'incorrect'} - ${esc(date(a.at))}`).join('; '):'Not attempted'}</li>`;}).join('')}</ol></details>`;
      if(active.practiceOnly)return `<details class="history-run"><summary>Practice ${i+1} · ${esc(date(run.startedAt))} · ${s.finished}/${s.total} completed · ${firstTryText(s)}</summary><ol>${active.questions.map(q=>`<li>${esc(q.skill)} — ${engine.done(q,run.answers[q.source])?'Completed':'Still to do'}</li>`).join('')}</ol></details>`;
      return `<details class="history-run"><summary>Run ${i+1}${run.deviceConflict?' · Separate device attempt':''} · ${esc(date(run.startedAt))} · ${s.first}/${s.total} first-try points · ${s.finished===s.total?'Complete':`${s.attempted}/${s.total} attempted`}</summary><p>${run.completedAt?(s.finished===s.total?'Completed ':'Original portion completed; added questions pending · ')+esc(date(run.completedAt)):'In progress'} · ${s.corrected} corrected on retry · ${s.revealed} answers shown</p><ol>${active.questions.map(q=>{
        const e=run.answers[q.source];return `<li>${esc(sourceLabel(q))}: ${esc(q.skill)} — ${e?.attempts.length?e.attempts.map((a,j)=>`Try ${j+1}: ${chosenText(q,a.choice)} · ${engine.isCorrect(q,a.choice)?'correct':'incorrect'} · ${esc(date(a.at))}`).join('; '):'Not attempted'}</li>`;
      }).join('')}</ol></details>`;
    }).join('');
  }
  function renderGroups(){
    const container=document.querySelector('#groups');if(!container)return;
    container.hidden=!groups||!!groupId();
    container.innerHTML=(groups||[]).map(g=>{
      const sessions=bank.filter(s=>s.group===g.id&&!s.retest);
      const completed=sessions.filter(s=>(state.sessions[s.id]||[]).some(r=>engine.stats(s,r).finished===s.questions.length)).length;
      return `<a class="group-card" href="?group=${g.id}"><span class="eyebrow">${esc(g.label)}</span><h2>${esc(g.title)}</h2><p>${esc(g.description)}</p><strong>${completed} / ${sessions.length} ${g.unit==='Day'?'days':'sessions'} completed</strong><span class="group-open">Open this test group →</span></a>`;
    }).join('');
    document.querySelector('#day-overview').hidden=!!groups&&!groupId();
    const group=groups?.find(g=>g.id===groupId());
    document.querySelector('#group-title').textContent=group?group.title:'Choose your day';
    document.querySelector('#back-to-group').href=group?`?group=${group.id}`:'./';
    document.querySelector('#group-description').textContent=group?.description||'';
  }
  function render(){
    window.HarryMathScratch?.setSession(active?.id);
    if(active?.round2)active=R.resolve(active.id,state);
    renderGroups();
    document.querySelector('#questions').setAttribute('aria-label',active?`${active.questions.length} practice questions`:'Practice questions');
    document.querySelector('#practice-content').hidden=!active;
    document.title=active?`${active.title} · Harry’s Daily Math`:'Harry’s Daily Math · Test groups';
    document.querySelector('#mistake-filter').hidden=true;
    if(!active){document.querySelector('#questions').innerHTML='';document.querySelector('#history').innerHTML='';renderDays();updateSaveNote();return;}
    let nav=document.querySelector('#round-navigation');if(!nav){nav=document.createElement('nav');nav.id='round-navigation';nav.className='round-navigation';document.querySelector('.session-intro').append(nav);}
    nav.hidden=active.practiceOnly||!(active.weekly||active.round2);const baseId=active.baseId||active.id;
    nav.innerHTML=nav.hidden?'':`<a href="?session=${baseId}" ${!active.round2?'aria-current="page"':''}>Round 1</a><a href="?session=${baseId}-round2" ${active.round2?'aria-current="page"':''}>Round 2 · new numbers</a>`;
    const reason=locked(active);
    if(reason){
      document.querySelector('#session-title').textContent=active.title;document.querySelector('#session-description').textContent='Your earlier answers and scores are saved.';
      for(const selector of ['.scorebar','#jump','.records'])document.querySelector(selector).hidden=true;
      const nextId='week-oct12-3-5';
      document.querySelector('#questions').innerHTML=`<section class="session-lock"><h2>🔒 Practice locked</h2><p>${esc(reason)}</p><a href="?session=${nextId}">Open Day 3.5</a></section>`;
      document.querySelector('#completion').hidden=true;renderDays();updateSaveNote();return;
    }
    const emptyReview=active.round2&&!active.questions.length;
    for(const selector of ['.scorebar','#jump','.records'])document.querySelector(selector).hidden=emptyReview;
    if(emptyReview){document.querySelector('#session-title').textContent=active.title;document.querySelector('#session-description').textContent=active.description;document.querySelector('#questions').innerHTML=`<section class="completion"><h2>${active.ready?'No Round 2 needed':'Round 2 is waiting'}</h2><p>${active.ready?'Every Round 1 answer was correct on the first try.':'Finish every first answer in Round 1 to build this review.'}</p><a href="?session=${active.baseId}">Back to Round 1</a></section>`;document.querySelector('#completion').hidden=true;renderDays();updateSaveNote();return;}
    document.querySelector('.gentle').textContent=active.practiceOnly?'Keep trying until each answer is correct. Your first-try percentage is saved separately and retries do not change it. There is no separate second round.':'Use paper for your working. There is no timer. You can stop and come back.';
    document.querySelector('.records > p').textContent=active.practiceOnly?'Your first-try percentage and completed questions are saved automatically. Continue any unfinished questions whenever you are ready.':'First tries and retries are recorded separately. A new run keeps the earlier run in this history; it does not erase or improve its score.';
    runs(active);document.querySelector('#session-title').textContent=active.title;document.querySelector('#session-description').textContent=active.description;
    document.querySelector('#questions').innerHTML=active.questions.map(card).join('');renderSummary();updateSaveNote();window.HarryMathScratch?.mount(active);
  }
  document.querySelector('#questions').addEventListener('submit',event=>{
    event.preventDefault();if(!active||locked(active))return;const form=event.target;let q=active.questions.find(q=>q.source===Number(form.dataset.source));if(!q)return;
    if(q.legacyQuestion&&typeof current().answers[q.source]?.attempts[0]?.choice==='number')q=q.legacyQuestion;
    if(q.type==='fill-blanks'){
      const feedback=document.querySelector(`#feedback-${q.source}`),values=Array.from(form.querySelectorAll('input[name="unit-answer"]:not(:disabled), input[name="fraction-part"]:not(:disabled)'),input=>input.value);
      if(engine.normalizeFor(q,values)===null){feedback.textContent='Fill all six blanks with whole numbers. No attempt has been used.';feedback.focus();return;}
      const run=current();if(!engine.submit(run,q,values,new Date().toISOString())){feedback.textContent='Change at least one answer before trying again. No new attempt has been used.';feedback.focus();return;}
      if(engine.stats(active,run).finished===active.questions.length)run.completedAt=new Date().toISOString();save();
      const index=active.questions.indexOf(q);document.querySelector(`#q${index+1}`).outerHTML=card(q,index);renderSummary();window.HarryMathScratch?.mount(active);document.querySelector(`#feedback-${q.source}`).focus({preventScroll:true});return;
    }
    const selected=form.querySelector(q.type==='fraction'?'input[name="fraction-part"]:not(:disabled)':q.type==='split-sum'?'input[name="number-part"]:not(:disabled)':q.type==='number'?'input[name="number-answer"]:not(:disabled)':'input:checked:not(:disabled)'),feedback=document.querySelector(`#feedback-${q.source}`);
    const value=q.type==='fraction'?Array.from(form.querySelectorAll('input[name="fraction-part"]:not(:disabled)'),input=>input.value):q.type==='split-sum'?Array.from(form.querySelectorAll('input[name="number-part"]:not(:disabled)'),input=>input.value):q.type==='number'?selected?.value:Number(selected?.value);
    if(!selected||(engine.typed(q)&&engine.normalizeFor(q,value)===null)){feedback.textContent=q.type==='fraction'?'Enter whole numbers for the numerator and denominator. The denominator must be greater than zero. No attempt has been used.':q.type==='split-sum'?'Fill all seven boxes with whole numbers. No attempt has been used.':q.type==='number'?`Type a ${q.decimal?'number':'whole-number'} answer before checking. No attempt has been used.`:'Choose a new answer before checking. No attempt has been used.';feedback.focus();return;}
    const run=current();if(!engine.submit(run,q,value,new Date().toISOString())){feedback.textContent='Try a different answer. No new attempt has been used.';feedback.focus();return;}
    if(engine.stats(active,run).finished===active.questions.length)run.completedAt=new Date().toISOString();save();
    const index=active.questions.findIndex(item=>item.source===q.source);document.querySelector(`#q${index+1}`).outerHTML=card(q,index);renderSummary();window.HarryMathScratch?.mount(active);document.querySelector(`#feedback-${q.source}`).focus({preventScroll:true});
  });
  document.addEventListener('click',event=>{const link=event.target.closest('a[href^="?session="]');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();const id=new URL(link.href).searchParams.get('session');active=findSession(id);onlyMistakes=false;history.pushState(null,'',link.href);render();document.querySelector('#session-title').scrollIntoView({block:'start'});});
  window.addEventListener('popstate',()=>{active=selectedDay();onlyMistakes=false;render();});
  window.addEventListener('storage',event=>{if(event.key!==KEY||!event.newValue)return;try{const remote=JSON.parse(event.newValue);if(remote.version===1&&remote.sessions){state=window.HarrySeptSync?window.HarrySeptSync.merge(state,remote):remote;render();void sync?.push();}}catch{}});
  document.querySelector('#toggle-mistakes').addEventListener('click',()=>{onlyMistakes=!onlyMistakes;applyMistakeFilter();});
  document.querySelector('#large-text').addEventListener('click',event=>{event.currentTarget.setAttribute('aria-pressed',String(document.body.classList.toggle('large')));});
  document.querySelector('#new-run').addEventListener('click',()=>{if(!active||active.weekly||locked(active))return;if(engine.stats(active,current()).finished!==active.questions.length)return;runs(active).push(newRun(true));save();render();document.querySelector('#session-title').scrollIntoView();});
  document.querySelector('#download').addEventListener('click',()=>{
    const payload={exportedAt:new Date().toISOString(),testDates:groups?.map(g=>g.id)||['2026-09-20'],scoring:'Days 3.4–3.6 and Days 4–6 record first-try percentages and completion. Retries do not change first-try scores. Earlier sessions retain their original first-try scoring.',sessions:[...bank,...(R?.sessions(state)||[]).filter(s=>state.sessions[s.id])].map(session=>({...session,runs:state.sessions[session.id]||[]}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='harry-star-math-practice-records.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const isLocalPreview=location.hostname==='localhost'||location.hostname==='127.0.0.1';
  if(window.HarrySeptSync&&!isLocalPreview){
    sync=window.HarrySeptSync.create({
      getState:()=>state,
      onRemote(remote){
        const drafts=Array.from(document.querySelectorAll('input[name="number-answer"]:not(:disabled), input[name="number-part"]:not(:disabled), input[name="unit-answer"]:not(:disabled), input[name="fraction-part"]:not(:disabled)')).map(input=>[input.id,input.value]);
        const selected=Array.from(document.querySelectorAll('input:checked:not(:disabled)')).map(input=>[input.name,input.value]);
        state=remote;save(false);render();
        for(const [id,value] of drafts){const input=document.getElementById(id);if(input&&!input.disabled)input.value=value;}
        for(const [name,value] of selected){const input=document.querySelector(`input[name="${name}"][value="${value}"]:not(:disabled)`);if(input)input.checked=true;}
      },
      onStatus(kind,message){syncKind=kind;syncMessage=message;updateSaveNote();}
    });
    void sync.start();
  }else{
    syncKind='offline';syncMessage=isLocalPreview?'Preview · Progress saves only in this browser.':'Not synced · Saved on this device. Reload to reconnect.';
  }
  render();
})();


