(() => {
  'use strict';
  const Core = window.VocabularyQuiz;
  const {questions:words,metadata} = window.MARCO_MIXED_VR;
  const APP_ID = 'marco-zozeck-mixed-360-v1';
  const STORAGE_KEY = APP_ID + ':progress';
  const SELECTION_KEY = APP_ID + ':selection';
  const byId = new Map(words.map(q => [q.id,q]));
  Core.configureLayout(words);
  const app = document.getElementById('app');
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => {try {return JSON.parse(localStorage.getItem(key));} catch {return null;}};
  const write = (key,value) => {try {localStorage.setItem(key,JSON.stringify(value));return true;} catch {return false;}};
  let progress = Core.merge(read(STORAGE_KEY),null);
  let selected = Number(new URLSearchParams(location.search).get('session')) || Number(read(SELECTION_KEY)) || 1;
  if (!Number.isInteger(selected) || selected < 1 || selected > 9) selected = 1;
  let view = location.hash === '#results' ? 'results' : 'practice';
  let sync = null, notice = '', storageError = false;
  const drafts = new Map();
  const now = () => new Date().toISOString();
  const ids = number => words.filter(q=>q.session === number).map(q=>q.id);
  const active = () => Core.current(progress.sessions[selected]);
  const count = r => Object.keys(r?.answers || {}).length;
  const correct = r => r.ids.filter(id=>r.answers[id]?.correct).length;
  const isTimed = r => Boolean(r?.timeLimitSeconds && !r.finishedAt);
  const formatClock = ms => {const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
  function mayReveal(number,id) {
    const rounds = progress.sessions[number]?.rounds || [];
    const attempts = rounds.map(r=>({r,a:r.answers[id]})).filter(v=>v.a);
    if (attempts.some(({r,a})=>a.correct && (!r.timeLimitSeconds || r.finishedAt))) return true;
    return attempts.filter(({r,a})=>a.choice && (!r.timeLimitSeconds || r.finishedAt)).length >= 2;
  }
  const explanation = q => `<div class="solution"><p><strong>Answer: ${esc(q.answer)}</strong></p><p><strong>Trick:</strong> ${esc(q.trick)}</p><p>${esc(q.explanation)}</p></div>`;
  function save() {
    progress = Core.merge(progress,read(STORAGE_KEY));
    storageError = !write(STORAGE_KEY,progress);
    sync?.push(progress);
  }
  function expire() {
    let changed=false;
    for(let s=1;s<=9;s++) {
      const r=Core.current(progress.sessions[s]);
      if(isTimed(r)&&Date.now()>=Date.parse(r.deadlineAt)) {
        changed=Boolean(Core.finishTimed(progress,s,now()))||changed;
        if(s===selected)notice='Time is up. Round 1 is submitted. Unanswered questions count as missed; correction rounds are untimed.';
      }
    }
    if(changed)save();
    return changed;
  }
  function sessionPicker() {
    return `<section class="session-picker mixed-picker" aria-label="Nine practice sessions">${metadata.sessions.map(s=>{
      const record=progress.sessions[s.number],r=Core.current(record),first=record?.rounds[0];
      const status=record?.completedAt?'Mastered ✓':r?`Round ${r.number} · ${count(r)}/${r.ids.length} answered`:'Not started';
      return `<button data-session="${s.number}" class="${selected===s.number?'selected':''} ${record?.completedAt?'mastered':''}" ${selected===s.number?'aria-current="page"':''}><span>Session ${s.number}</span><strong>40 mixed questions</strong><small>${s.types.synonym} synonyms · ${s.types.completion} completions${s.types.definition?' · 1 meaning':''}</small><small>${esc(status)}${first?.finishedAt?` · First try ${correct(first)}/40`:''}</small></button>`;
    }).join('')}</section>`;
  }
  function questionCard(q,r,index) {
    const a=r.answers[q.id],timed=isTimed(r),locked=Boolean(a&&!timed);
    const reveal=mayReveal(selected,q.id),chosen=timed?a?.choice:drafts.get(q.id)||a?.choice;
    const options=Core.options(q,r.number,words,selected);
    const label=q.quizType==='completion'?'Complete the sentence':q.quizType==='definition'?'Choose the word for this meaning':'Choose the closest meaning';
    return `<article class="question-item" id="q-${q.id}"><div class="question-item-topline"><span>Question ${index+1}</span><small>${q.quizType==='completion'?'Sentence completion':q.quizType==='definition'?'Word meaning':'Synonym'} · ${esc(q.difficulty)}</small></div><p class="prompt-label">${label}</p><h3>${esc(q.word)}</h3><div class="options" role="group" aria-label="Choices for question ${index+1}">${options.map((choice,i)=>`<button data-choice="${esc(choice)}" data-id="${q.id}" aria-pressed="${choice===chosen}" ${locked?'disabled':''} class="${choice===chosen?'picked':''} ${locked&&reveal&&choice===q.answer?'correct-option':''} ${locked&&choice===a?.choice&&!a.correct?'wrong-option':''}"><span>${'ABCD'[i]}</span><b>${esc(choice)}</b></button>`).join('')}</div>${!timed&&!locked?`<button class="check-answer" data-check="${q.id}" ${chosen?'':'disabled'}>Check answer</button>`:''}${locked?`<div class="answer-status" role="status">${a.correct?'Correct ✓':'Not quite.'}${!reveal?' Try this question again in the next round before seeing the answer and trick.':''}</div>${reveal?explanation(q):''}`:''}<details class="source-note"><summary>Question source</summary><p>${esc(q.sourceLabel)}</p></details></article>`;
  }
  function practice() {
    const record=progress.sessions[selected],r=active();
    if(!r)return `<section class="complete-card test-start"><div><p class="eyebrow">Session ${selected} · Mixed difficulty</p><h2>40 questions · 20 minutes</h2><p>Synonyms and sentence completions are mixed together. Think of the meaning before comparing all four choices.</p><p>The timer starts only when you press Start. You can change answers in Round 1. After submitting, only misses return in Round 2, then Round 3 and onward until all are correct.</p><p>Missed answers and tricks unlock after your second try. Later rounds are untimed.</p><button class="primary-action" data-start>Start Round 1 · 20 minutes</button></div></section>`;
    if(record.completedAt)return `<section class="complete-card"><div><div class="checkmark">✓</div><h2>Session ${selected} mastered</h2><p>All 40 questions are correct after ${record.rounds.length} round${record.rounds.length===1?'':'s'}.</p><p>First try: ${correct(record.rounds[0])}/40. Your first-try score is preserved.</p><div class="complete-actions"><button data-view="results">See results &amp; tricks</button>${selected<9?`<button data-session="${selected+1}">Next session</button>`:''}</div></div></section>`;
    const order=Core.questionOrder(r.ids,selected,r.number);
    const first=record.rounds[0];
    return `${isTimed(r)?`<div class="timer-bar"><strong>Round 1 · <span data-clock>${formatClock(Date.parse(r.deadlineAt)-Date.now())}</span> left</strong><span>${count(r)}/40 answered · choices may be changed</span><button data-submit>Submit Round 1</button></div>`:''}<section class="session-summary"><h2>Session ${selected} · Round ${r.number}</h2><p>${r.ids.length} ${r.number===1?'mixed questions · 20-minute test':'missed questions to retry · untimed'} · ${count(r)}/${r.ids.length} answered${r.number>1?` · First try ${correct(first)}/40`:''}</p><p>${r.number===1?'Answers are hidden during the test.':'Choose an answer and press Check. Only questions missed in this round will return.'}</p><div class="number-grid">${order.map((id,i)=>`<button data-jump="${id}" class="${r.answers[id]?(isTimed(r)?'picked':r.answers[id].correct?'answered-correct':'answered-wrong'):''}" aria-label="Go to question ${i+1}">${i+1}</button>`).join('')}</div></section><section class="session-questions">${order.map((id,i)=>questionCard(byId.get(id),r,i)).join('')}</section><div class="mixed-bottom"><button class="primary-action" data-submit ${!isTimed(r)&&count(r)!==r.ids.length?'disabled':''}>${isTimed(r)?'Submit Round 1':`Finish Round ${r.number}`}</button><p>${isTimed(r)?'Unanswered questions count as missed when submitted.':'Finish this round to continue with only the remaining misses.'}</p></div>`;
  }
  function results() {
    const record=progress.sessions[selected];
    const finished=record?.rounds.filter(r=>r.finishedAt)||[];
    return `<section class="results-card"><div class="results-heading"><div><p class="eyebrow">Saved first tries and corrections</p><h2>Session ${selected} results</h2><p>Earlier course scores are kept separately in the <a href="./archive/">original-session archive</a>.</p></div><button data-view="practice">Return to practice</button></div>${finished.length?`<div class="round-list">${finished.map(r=>`<details><summary><span class="round-number">${r.number}</span><span><strong>Round ${r.number}</strong><small>${r.timeLimitSeconds?'Timed · '+formatClock(Date.parse(r.finishedAt)-Date.parse(r.startedAt)):'Untimed corrections'}</small></span><span class="score"><strong>${correct(r)}/${r.ids.length}</strong><small>correct</small></span><span class="missed"><strong>${r.ids.length-correct(r)}</strong><small>missed</small></span></summary><div class="mixed-answer-review">${Core.questionOrder(r.ids,selected,r.number).map((id,i)=>{const q=byId.get(id),a=r.answers[id];return `<article class="result-question ${a.correct?'correct':'wrong'}"><strong>${i+1}. ${esc(q.word)}</strong><p>Your submitted answer: ${esc(a.choice||'Unanswered')} · ${a.correct?'Correct':'Missed'}</p>${mayReveal(selected,id)?explanation(q):'<p class="answer-locked">Answer and trick locked until your second try. Continue the correction round.</p>'}</article>`;}).join('')}</div></details>`).join('')}</div>`:'<div class="empty-results"><strong>No submitted rounds yet</strong><p>Finish Round 1 to see your saved score.</p></div>'}</section>`;
  }
  function render() {
    const priorStatus=document.querySelector('[data-online-sync]')?.textContent;
    app.innerHTML=`<header class="topbar"><div><p class="eyebrow">Marco’s verbal reasoning · mixed practice</p><h1>360 questions · 9 sessions</h1></div><nav aria-label="Practice and results"><button data-view="practice" class="${view==='practice'?'active':''}">Practice</button><button data-view="results" class="${view==='results'?'active':''}">Results &amp; tricks</button></nav></header><p class="sync-note"><span></span><b data-online-sync="${APP_ID}">${esc(priorStatus||'Connecting to live online sync…')}</b></p><p class="course-intro">40 questions each · mixed topics and difficulty · Round 1 → missed-only Rounds 2, 3, … until mastered.</p>${storageError?'<p class="notice error">This browser could not save locally. Keep the page open and check the online-sync status.</p>':''}${notice?`<p class="notice" role="status">${esc(notice)}</p>`:''}${sessionPicker()}<div id="workspace">${view==='results'?results():practice()}</div><footer class="site-footer"><a href="../">← Main Learning Hub</a><a href="./archive/">Previous Sessions 1–14 &amp; Reviews 1A–3B</a><span>360 unique questions · difficulty labels are practice estimates</span></footer><details class="bank-note"><summary>How this bank was assembled</summary><p>121 clean questions retained from the 124-question review bank, plus all 227 curated historical misses, plus 12 other recorded historical misses. Three ambiguous review targets were excluded; competing distractors and one grammar mismatch were cleaned up in nine retained items. The latest October 4 nine VR misses are excluded. Old answers and scores remain in the archive, unchanged.</p></details>`;
  }
  function setView(next) {view=next;history.replaceState(null,'',`?session=${selected}${view==='results'?'#results':''}`);render();}
  app.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.session){selected=Number(button.dataset.session);notice='';write(SELECTION_KEY,selected);setView('practice');document.getElementById('workspace').scrollIntoView({block:'start'});return;}
    if(button.dataset.view){setView(button.dataset.view);return;}
    if(button.dataset.jump){document.getElementById('q-'+button.dataset.jump)?.scrollIntoView({block:'start',behavior:'smooth'});return;}
    if(button.hasAttribute('data-start')){if(Core.startTimed(progress,selected,ids(selected),now(),1200)){save();render();}return;}
    if(expire()){render();return;}
    if(button.dataset.id){
      const {id,choice}=button.dataset;
      if(isTimed(active())){if(Core.answer(progress,selected,choice,words,now(),id))save();}
      else drafts.set(id,choice);
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
      if(isTimed(r)&&count(r)<r.ids.length&&!window.confirm(`${r.ids.length-count(r)} questions are unanswered. Submit and count these as missed?`))return;
      const result=isTimed(r)?Core.finishTimed(progress,selected,now()):Core.finishRound(progress,selected,now());
      if(result){drafts.clear();save();notice=result==='complete'?'All questions mastered. Your first-try score is preserved.':`Round ${r.number} saved: ${correct(r)}/${r.ids.length} correct. Continue with the remaining misses.`;render();document.getElementById('workspace').scrollIntoView({block:'start'});}
    }
  });
  function updateCounters(){
    const r=active();if(!r)return;
    const picker=app.querySelector('.mixed-picker');if(picker)picker.outerHTML=sessionPicker();
    const summary=app.querySelector('.session-summary');
    if(summary){summary.querySelector('p').textContent=`${r.ids.length} ${r.number===1?'mixed questions · 20-minute test':'missed questions to retry · untimed'} · ${count(r)}/${r.ids.length} answered${r.number>1?` · First try ${correct(progress.sessions[selected].rounds[0])}/40`:''}`;summary.querySelectorAll('[data-jump]').forEach(b=>{const a=r.answers[b.dataset.jump];b.className=a?(isTimed(r)?'picked':a.correct?'answered-correct':'answered-wrong'):'';});}
    const bottom=app.querySelector('.mixed-bottom [data-submit]');if(bottom&&!isTimed(r))bottom.disabled=count(r)!==r.ids.length;
    const timer=app.querySelector('.timer-bar>span');if(timer)timer.textContent=`${count(r)}/40 answered · choices may be changed`;
  }
  render();
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname)||location.protocol==='file:';
  if(!local&&window.MarcoOnlineSync){
    sync=window.MarcoOnlineSync.create({appId:APP_ID,studentName:'Marco',validate:Core.valid,score:Core.score,onRemote:remote=>{
      const merged=Core.merge(progress,remote);if(JSON.stringify(merged)===JSON.stringify(progress))return;
      progress=merged;storageError=!write(STORAGE_KEY,progress);expire();render();
    }});
    sync.start(progress);
  }else{app.querySelector('[data-online-sync]').textContent='Local preview · online sync disabled';}
  const interval=setInterval(()=>{if(expire())render();const clock=app.querySelector('[data-clock]');if(clock&&isTimed(active()))clock.textContent=formatClock(Date.parse(active().deadlineAt)-Date.now());},1000);
  window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY){progress=Core.merge(progress,read(STORAGE_KEY));expire();render();}});
  window.addEventListener('pagehide',()=>{clearInterval(interval);sync?.stop();});
})();
