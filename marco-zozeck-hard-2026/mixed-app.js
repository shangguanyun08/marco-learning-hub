(() => {
  'use strict';
  const Core = window.VocabularyQuiz;
  const {questions:originalWords,metadata} = window.MARCO_MIXED_VR;
  const review = window.MARCO_ROUND1_REVIEW || {questions:[],metadata:{sessions:[],questionCount:0}};
  // Review 2 repeats the frozen first review bank, with independent saved attempts.
  const review2 = {
    questions:review.questions.map(q=>({...q,id:q.id.replace(/^r1-/, 'r2-'),session:q.session+100,choices:[...q.choices]})),
    sessions:review.metadata.sessions.map(s=>({...s,number:s.number+100,label:`Review 2 · Session ${s.reviewNumber}`}))
  };
  const words = [...originalWords,...review.questions,...review2.questions];
  const sessions = [...metadata.sessions,...review.metadata.sessions,...review2.sessions];
  const sessionInfo = number => sessions.find(s=>s.number===number);
  const sessionLabel = number => sessionInfo(number)?.label || `Session ${number}`;
  const sessionSize = number => words.filter(q=>q.session===number).length;
  const nextSession = number => sessions[sessions.findIndex(s=>s.number===number)+1]?.number;
  const APP_ID = 'marco-zozeck-mixed-360-v1';
  const STORAGE_KEY = APP_ID + ':progress';
  const SELECTION_KEY = APP_ID + ':selection';
  const byId = new Map(words.map(q => [q.id,q]));
  Core.configureLayout(words);
  const app = document.getElementById('app');
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => {try {return JSON.parse(localStorage.getItem(key));} catch {return null;}};
  const write = (key,value) => {try {localStorage.setItem(key,JSON.stringify(value));return true;} catch {return false;}};
  // Old drafts may still carry a countdown. Normalize before every local/online
  // merge so a stale device cannot reintroduce an active time limit.
  function mergeProgress(left,right) {
    const untimed = value => {
      if(!Core.valid(value))return value;
      const copy=JSON.parse(JSON.stringify(value));
      for(const record of Object.values(copy.sessions))for(const round of record.rounds||[]) {
        if(round.finishedAt)continue; // Keep submitted historical rounds verbatim.
        delete round.timeLimitSeconds;
        delete round.deadlineAt;
      }
      return copy;
    };
    return Core.merge(untimed(left),untimed(right));
  }
  let progress = mergeProgress(read(STORAGE_KEY),null);
  const params = new URLSearchParams(location.search);
  let selected = params.has('review2') ? 200+Number(params.get('review2')) : params.has('review') ? 100+Number(params.get('review')) : Number(params.get('session')) || Number(read(SELECTION_KEY)) || 1;
  if (!sessionInfo(selected)) selected = 1;
  let view = location.hash === '#results' ? 'results' : 'practice';
  let sync = null, notice = '', storageError = false;
  const drafts = new Map();
  const now = () => new Date().toISOString();
  const ids = number => words.filter(q=>q.session === number).map(q=>q.id);
  const active = () => Core.current(progress.sessions[selected]);
  const count = r => Object.keys(r?.answers || {}).length;
  const correct = r => r.ids.filter(id=>r.answers[id]?.correct).length;
  const formatClock = ms => {const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
  function mayReveal(number,id) {
    const rounds = progress.sessions[number]?.rounds || [];
    const attempts = rounds.map(r=>({r,a:r.answers[id]})).filter(v=>v.a);
    if (attempts.some(({a})=>a.correct)) return true;
    return attempts.filter(({a})=>a.choice).length >= 2;
  }
  const explanation = q => `<div class="solution"><p><strong>Answer: ${esc(q.answer)}</strong></p><p><strong>Trick:</strong> ${esc(q.trick)}</p><p>${esc(q.explanation)}</p></div>`;
  function save() {
    progress = mergeProgress(progress,read(STORAGE_KEY));
    storageError = !write(STORAGE_KEY,progress);
    sync?.push(progress);
  }
  function sessionPicker() {
    const cards = list => list.map(s=>{
      const record=progress.sessions[s.number],r=Core.current(record),first=record?.rounds[0],size=sessionSize(s.number);
      const status=record?.completedAt?'Mastered ✓':r?`Round ${r.number} · ${count(r)}/${r.ids.length} answered`:'Not started';
      return `<button data-session="${s.number}" class="${selected===s.number?'selected':''} ${record?.completedAt?'mastered':''}" aria-pressed="${selected===s.number}" ${selected===s.number?'aria-current="page"':''}><span>${esc(sessionLabel(s.number))}</span><strong>${size} questions</strong><strong class="first-round-score">${first?.finishedAt?`Round 1: ${correct(first)}/${size} correct`:`Round 1: —/${size} correct`}</strong><small>${s.types.synonym} synonyms · ${s.types.completion} completions${s.types.definition?` · ${s.types.definition} meaning`:''}</small><small>${esc(status)}</small></button>`;
    }).join('');
    return `<section class="session-picker mixed-picker" aria-label="Practice and review sessions"><div class="session-group"><h2>Mixed Practice · Sessions 1–9</h2><div class="session-group-grid">${cards(metadata.sessions)}</div></div>${review.questions.length?`<div class="session-group review-session-group"><h2>Review 1 · Round 1 Missed Questions</h2><p>${review.metadata.questionCount} questions missed in the first round of Sessions 1–9. Four sessions of 40, then 42 in Session 5. New review scores start here; earlier results stay saved.</p><div class="session-group-grid">${cards(review.metadata.sessions)}</div></div><div class="session-group review-session-group"><h2>Review 2 · Repeat the Same 5 Sessions</h2><p>Repeat all ${review.metadata.questionCount} questions from Review 1 in the same five groups: 40, 40, 40, 40, and 42 questions. Every round is untimed, with fresh scores for Review 2.</p><div class="session-group-grid">${cards(review2.sessions)}</div></div>`:''}</section>`;
  }
  function questionStatus(number,id) {
    const attempts=(progress.sessions[number]?.rounds||[]).map(r=>r.answers[id]).filter(Boolean);
    if(!attempts.length)return {className:'',label:'Not answered'};
    if(attempts[0].correct)return {className:'answered-correct',label:'Correct first try'};
    if(attempts.some(a=>a.correct))return {className:'answered-corrected',label:'Corrected after a miss'};
    return {className:'answered-wrong',label:'Incorrect'};
  }
  function questionCard(q,r,index) {
    const a=r.answers[q.id],locked=Boolean(a);
    const reveal=mayReveal(selected,q.id),chosen=drafts.get(q.id)||a?.choice;
    const options=Core.options(q,r.number,words,selected);
    const label=q.quizType==='completion'?'Complete the sentence':q.quizType==='definition'?'Choose the word for this meaning':'Choose the closest meaning';
    return `<article class="question-item ${questionStatus(selected,q.id).className} ${q.quizType==='completion'?'completion-question':''}" id="q-${q.id}"><div class="question-item-topline"><span>Question ${index+1}</span><small>${q.quizType==='completion'?'Sentence completion':q.quizType==='definition'?'Word meaning':'Synonym'} · ${esc(q.difficulty)}</small></div><p class="prompt-label">${label}</p><h3>${esc(q.word)}</h3><div class="options" role="group" aria-label="Choices for question ${index+1}">${options.map((choice,i)=>`<button data-choice="${esc(choice)}" data-id="${q.id}" aria-pressed="${choice===chosen}" ${locked?'disabled':''} class="${choice===chosen?'picked':''} ${locked&&reveal&&choice===q.answer?'correct-option':''} ${locked&&choice===a?.choice&&!a.correct?'wrong-option':''}"><span>${'ABCD'[i]}</span><b>${esc(choice)}</b></button>`).join('')}</div>${!locked?`<button class="check-answer" data-check="${q.id}" ${chosen?'':'disabled'}>Check answer</button>`:''}${locked?`<div class="answer-status" role="status">${a.correct?'Correct ✓':'Not quite.'}${!reveal?' Try this question again in the next round before seeing the answer and trick.':''}</div>${reveal?explanation(q):''}`:''}<details class="source-note"><summary>Question source</summary><p>${esc(q.sourceLabel)}</p></details></article>`;
  }
  function summaryMarkup(r) {
    const order=Core.questionOrder(r.ids,selected,r.number);
    return `<section class="session-summary"><div class="session-summary-heading"><div><div class="round-heading"><span>${esc(sessionLabel(selected))}</span><small>${r.ids.length} questions · No time limit</small></div><div class="round-subheading"><h2>Round ${r.number} · Untimed</h2><span>${r.number===1?`All ${sessionSize(selected)} questions on this page`:'Previous round’s missed questions'}</span></div></div><div class="stats"><div><strong>${count(r)}</strong><span>answered</span></div><div><strong>${r.ids.length-count(r)}</strong><span>remaining</span></div></div><button class="finish-round" data-submit ${count(r)!==r.ids.length?'disabled':''}>Finish round &amp; save</button></div><div class="progress" role="progressbar" aria-label="Round progress" aria-valuenow="${count(r)}" aria-valuemin="0" aria-valuemax="${r.ids.length}"><span style="width:${count(r)/r.ids.length*100}%"></span></div><p class="grid-label">Jump to a question</p><div class="number-grid" aria-label="Question progress">${order.map((id,i)=>`<button data-jump="${id}" class="${questionStatus(selected,id).className}" aria-label="Go to question ${i+1}: ${questionStatus(selected,id).label}">${i+1}</button>`).join('')}</div><p class="review-color-legend"><span class="legend-green">Green: correct first try</span><span class="legend-red">Red: wrong</span><span class="legend-yellow">Yellow: corrected</span></p><p class="locked-note">Answer in any order. Press Check to save each answer; missed answers and tricks unlock after your second try.</p></section>`;
  }
  function practice() {
    const record=progress.sessions[selected],r=active();
    if(!r)return `<section class="session-summary test-start"><p class="eyebrow">Synonyms &amp; sentence completion</p><h2>${esc(sessionLabel(selected))} · ${sessionSize(selected)} questions</h2><p>Every round is untimed. Think of the meaning before comparing all four choices. Choose an answer and press Check, then finish the round after answering all questions.</p><p>Only misses return in Round 2, then Round 3 and onward until all are correct. Missed answers and tricks unlock after your second try. The session button above turns green when all questions are mastered.</p><button class="finish-round" data-start>Start Round 1 · Untimed</button></section>`;
    if(record.completedAt)return `<section class="complete-card"><div><div class="checkmark">✓</div><h2>${esc(sessionLabel(selected))} mastered</h2><p>All ${sessionSize(selected)} questions are correct after ${record.rounds.length} round${record.rounds.length===1?'':'s'}.</p><p>First try: ${correct(record.rounds[0])}/${sessionSize(selected)}. Your first-try score is preserved.</p><div class="complete-actions"><button data-view="results">See results &amp; tricks</button>${nextSession(selected)?`<button data-session="${nextSession(selected)}">${selected===9?'Start review sessions':'Next session'}</button>`:''}</div></div></section>`;
    const order=Core.questionOrder(r.ids,selected,r.number);
    return `<section class="session-workspace" aria-label="${esc(sessionLabel(selected))}, Round ${r.number}">${summaryMarkup(r)}<section class="session-questions">${order.map((id,i)=>questionCard(byId.get(id),r,i)).join('')}</section><div class="round-footer"><span>Finish this round to continue with only the remaining misses.</span><button class="finish-round" data-submit ${count(r)!==r.ids.length?'disabled':''}>Finish round &amp; save</button></div></section>`;
  }
  function results() {
    const record=progress.sessions[selected];
    const finished=record?.rounds.filter(r=>r.finishedAt)||[];
    return `<section class="results-card"><div class="results-heading"><div><p class="eyebrow">Saved first tries and corrections</p><h2>${esc(sessionLabel(selected))} results</h2><p>Earlier course scores are kept separately in the <a href="./archive/">original-session archive</a>.</p></div><button data-view="practice">Return to practice</button></div>${finished.length?`<div class="round-list">${finished.map(r=>`<details><summary><span class="round-number">${r.number}</span><span><strong>Round ${r.number}</strong><small>${r.timeLimitSeconds?'Timed · '+formatClock(Date.parse(r.finishedAt)-Date.parse(r.startedAt)):'Untimed corrections'}</small></span><span class="score"><strong>${correct(r)}/${r.ids.length}</strong><small>correct</small></span><span class="missed"><strong>${r.ids.length-correct(r)}</strong><small>missed</small></span></summary><div class="mixed-answer-review">${Core.questionOrder(r.ids,selected,r.number).map((id,i)=>{const q=byId.get(id),a=r.answers[id];return `<article class="result-question ${a.correct?'correct':'wrong'}"><strong>${i+1}. ${esc(q.word)}</strong><p>Your submitted answer: ${esc(a.choice||'Unanswered')} · ${a.correct?'Correct':'Missed'}</p>${mayReveal(selected,id)?explanation(q):'<p class="answer-locked">Answer and trick locked until your second try. Continue the correction round.</p>'}</article>`;}).join('')}</div></details>`).join('')}</div>`:'<div class="empty-results"><strong>No submitted rounds yet</strong><p>Finish Round 1 to see your saved score.</p></div>'}</section>`;
  }
  function render() {
    const priorStatus=document.querySelector('[data-online-sync]')?.textContent;
    app.innerHTML=`<header class="topbar"><div><p class="eyebrow">Marco · Synonyms &amp; sentence completion</p><h1>2026 Zozeck · Mixed Practice &amp; Review</h1><p class="course-intro">360 questions across 9 sessions of 40, mixing topics and difficulty. Every round is untimed. Rounds 2, 3, and onward repeat only missed questions until mastered. Completed sessions turn green. Review 1 revisits first-round misses; Review 2 repeats the same five sessions with independent scores.</p></div><nav aria-label="Practice and results"><button data-view="practice" class="${view==='practice'?'active':''}" aria-pressed="${view==='practice'}">Practice</button><button data-view="results" class="${view==='results'?'active':''}" aria-pressed="${view==='results'}">Results &amp; tricks</button></nav></header>${sessionPicker()}<p class="sync-note" role="status" aria-live="polite"><span aria-hidden="true"></span><b data-online-sync="${APP_ID}">${esc(priorStatus||'Connecting to live online sync…')}</b></p>${storageError?'<p class="notice error">This browser could not save locally. Keep the page open and check the online-sync status.</p>':''}${notice?`<p class="notice" role="status">${esc(notice)}</p>`:''}<div id="workspace">${view==='results'?results():practice()}</div><footer class="site-footer"><a href="../">← Main Learning Hub</a><a href="./archive/">Previous Sessions 1–14 &amp; Reviews 1A–3B</a><span>360 original questions${review.questions.length?` + ${review.questions.length} questions in each of 2 reviews`:""} · difficulty labels are practice estimates</span></footer><details class="bank-note"><summary>How this bank was assembled</summary><p>121 clean questions retained from the 124-question review bank, plus all 227 curated historical misses, plus 12 other recorded historical misses. Three ambiguous review targets were excluded; competing distractors and one grammar mismatch were cleaned up in nine retained items. The latest October 4 nine VR misses are excluded. Old answers and scores remain in the archive, unchanged.</p></details>`;
  }
  function setView(next) {view=next;history.replaceState(null,'',`${selected>200?'?review2='+(selected-200):selected>100?'?review='+(selected-100):'?session='+selected}${view==='results'?'#results':''}`);render();}
  app.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.session){selected=Number(button.dataset.session);notice='';write(SELECTION_KEY,selected);setView('practice');document.getElementById('workspace').scrollIntoView({block:'start'});return;}
    if(button.dataset.view){setView(button.dataset.view);return;}
    if(button.dataset.jump){document.getElementById('q-'+button.dataset.jump)?.scrollIntoView({block:'start',behavior:'smooth'});return;}
    if(button.hasAttribute('data-start')){if(Core.start(progress,selected,ids(selected),now())){save();render();}return;}
    if(button.dataset.id){
      const {id,choice}=button.dataset;
      drafts.set(id,choice);
      const card=button.closest('.question-item');
      card.querySelectorAll('[data-choice]').forEach(b=>{b.classList.toggle('picked',b===button);b.setAttribute('aria-pressed',String(b===button));});
      const check=card.querySelector('[data-check]');if(check)check.disabled=false;
      updateCounters();return;
    }
    if(button.dataset.check){
      const id=button.dataset.check,choice=drafts.get(id);
      if(choice&&Core.answer(progress,selected,choice,words,now(),id)){save();const old=document.getElementById('q-'+id),r=active();old.outerHTML=questionCard(byId.get(id),r,Core.questionOrder(r.ids,selected,r.number).indexOf(id));updateCounters();}return;
    }
    if(button.hasAttribute('data-submit')){
      const r=active();
      if(!r)return;
      const result=Core.finishRound(progress,selected,now());
      if(result){drafts.clear();save();notice=result==='complete'?'All questions mastered. Your first-try score is preserved.':`Round ${r.number} saved: ${correct(r)}/${r.ids.length} correct. Continue with the remaining misses.`;render();document.getElementById('workspace').scrollIntoView({block:'start'});}
    }
  });
  function updateCounters(){
    const r=active();if(!r)return;
    const picker=app.querySelector('.mixed-picker');if(picker)picker.outerHTML=sessionPicker();
    const summary=app.querySelector('.session-summary');
    if(summary)summary.outerHTML=summaryMarkup(r);
    app.querySelectorAll('[data-submit]').forEach(button=>button.disabled=count(r)!==r.ids.length);
  }
  storageError=!write(STORAGE_KEY,progress);
  render();
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname)||location.protocol==='file:';
  if(!local&&window.MarcoOnlineSync){
    sync=window.MarcoOnlineSync.create({appId:APP_ID,studentName:'Marco',validate:Core.valid,score:Core.score,merge:mergeProgress,onRemote:remote=>{
      const merged=mergeProgress(progress,remote);if(JSON.stringify(merged)===JSON.stringify(progress))return;
      progress=merged;storageError=!write(STORAGE_KEY,progress);render();
    }});
    sync.start(progress);
  }else{app.querySelector('[data-online-sync]').textContent='Local preview · online sync disabled';}
  window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY){progress=mergeProgress(progress,read(STORAGE_KEY));storageError=!write(STORAGE_KEY,progress);render();}});
  window.addEventListener('pagehide',()=>sync?.stop());
})();
