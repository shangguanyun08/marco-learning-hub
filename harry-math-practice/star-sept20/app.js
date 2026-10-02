(function () {
  'use strict';
  const bank=window.HARRY_SEPT_PRACTICE, engine=window.HarrySeptEngine;
  const groups=window.HARRY_STAR_GROUPS||null;
  const groupId=()=>active?.group || (groups?.find(g=>g.id===new URLSearchParams(location.search).get('group'))?.id||null);
  const visibleBank=()=>groups?bank.filter(s=>s.group===groupId()):bank;
  const KEY='harry-star-sept20-four-sessions-v1';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const math=s=>esc(s).replace(/\b(\d+)\/(\d+)\b/g,'<span class="fraction" aria-label="$1 over $2"><span>$1</span><span>$2</span></span>');
  const date=s=>new Date(s).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
  let sync=null, syncKind='connecting', syncMessage='Connecting… Your saved answers will sync automatically.';
  let storageOK=true, state={version:1,sessions:{}};
  try {const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.version===1&&saved.sessions)state=saved;} catch {storageOK=false;}
  const selectedDay=()=>bank.find(s=>s.id===new URLSearchParams(location.search).get('session'))||null;
  let active=selectedDay();
  function newRun(restart=false){return {restart,id:crypto.randomUUID(),startedAt:new Date().toISOString(),answers:{},completedAt:null};}
  function runs(session){return state.sessions[session.id] ||= [newRun()];}
  function current(){return runs(active).at(-1);}
  function save(upload=true){try{if(!storageOK)throw new Error('Storage unavailable');localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}updateSaveNote();if(upload)void sync?.push();}
  function updateSaveNote(){const el=document.querySelector('#save-note');el.dataset.syncStatus=syncKind;el.classList.toggle('warning',!storageOK||syncKind==='offline');el.textContent=storageOK?syncMessage:'Progress could not be saved in this browser. Keep this page open and download your records before leaving.';}
  function result(q,run){const e=run.answers[q.source];if(!e?.attempts.length)return '';if(engine.isCorrect(q,e.attempts[0].choice))return 'first';if(e.attempts[1]&&engine.isCorrect(q,e.attempts[1].choice))return 'retry';return e.attempts.length===2?'revealed':'pending';}
  function numberline(){return `<svg class="numberline" viewBox="0 0 600 145" role="img" aria-label="Number line from zero to one with eight equal intervals. A yellow star, blue circle, yellow square, and green triangle are positioned below ticks."><line x1="40" y1="45" x2="560" y2="45" stroke="#193c49" stroke-width="2"/>${Array.from({length:9},(_,i)=>`<line x1="${40+i*65}" x2="${40+i*65}" y1="${i===0||i===8?33:39}" y2="${i===0||i===8?57:51}" stroke="#193c49" stroke-width="2"/>`).join('')}<text x="40" y="85" text-anchor="middle" font-size="22">0</text><text x="560" y="85" text-anchor="middle" font-size="22">1</text><polygon points="170,65 175,77 189,77 178,85 182,99 170,91 158,99 162,85 151,77 165,77" fill="#ffdf4b" stroke="#193c49"/><circle cx="235" cy="83" r="15" fill="#28b8d1" stroke="#193c49"/><rect x="285" y="68" width="30" height="30" fill="#ffdf4b" stroke="#193c49"/><polygon points="430,65 448,98 412,98" fill="#85d452" stroke="#193c49"/></svg>`;}
  const sourceLabel=q=>q.sourceLabel||`STAR Q${q.source}`;
  const chosenText=(q,choice)=>q.type==='number'?esc(choice):`${'ABCD'[choice]} (${esc(q.choices[choice])})`;
  function numericField(q,attempts,closed){
    return `<div class="numeric-entry"><label for="number-${q.source}">Your answer</label><input id="number-${q.source}" name="number-answer" type="text" inputmode="${q.decimal?'decimal':'numeric'}" autocomplete="off" ${closed?'disabled':''} aria-describedby="feedback-${q.source}">${attempts.length?`<ol class="numeric-attempts">${attempts.map((a,i)=>`<li>Try ${i+1}: ${esc(a.choice)} · ${engine.isCorrect(q,a.choice)?'correct':'incorrect'}</li>`).join('')}</ol>`:''}</div>`;
  }
  function card(q,i){
    const run=current(),entry=run.answers[q.source],attempts=entry?.attempts||[],closed=engine.done(q,entry),status=result(q,run);
    let feedback=q.type==='number'?'Type your answer, then press Check answer.':'Choose an answer, then press Check answer.';
    if(status==='first')feedback='Correct on your first try! 1 point earned.';
    if(status==='pending')feedback='Not quite. You have one more try. Your first-try score stays unchanged.';
    if(status==='retry')feedback='You got it on your second try! This correction is saved; the first-try score stays unchanged.';
    if(status==='revealed')feedback='Two tries completed. Read the explanation below to learn the method.';
    return `<article class="question ${status}" id="q${i+1}" data-source="${q.source}"><div class="question-head"><h3>Question ${i+1}</h3><span class="source">${(active.id==='original'||active.original)?'Original':'Matches'} ${esc(sourceLabel(q))} · ${esc(q.skill)}</span></div><p class="prompt">${math(q.prompt)}</p>${q.visual==='numberline'?numberline():(window.HarryStarVisuals?.draw(q.visual)||'')}<form data-source="${q.source}" novalidate>${q.type==='number'?numericField(q,attempts,closed):`<fieldset class="choices"><legend>${closed?'Your recorded answers':'Choose one answer'}</legend>${q.choices.map((choice,index)=>{
      const tried=attempts.findIndex(a=>a.choice===index),disabled=closed||tried>=0;
      const tag=tried>=0?`Try ${tried+1}${index===q.correct?' · correct':' · incorrect'}`:'';
      return `<label class="choice ${disabled?'disabled':''} ${tried>=0&&index!==q.correct?'wrong-option':''} ${closed&&index===q.correct?'correct-option':''}"><input type="radio" name="answer-${q.source}" value="${index}" ${disabled?'disabled':''} ${tried===attempts.length-1&&tried>=0?'checked':''}><span class="letter">${'ABCD'[index]}</span><span class="choice-text">${math(choice)}${window.HarryStarVisuals?.draw(q.visual,index)||''}${tag?`<small>${tag}</small>`:''}</span></label>`;
    }).join('')}</fieldset>`}${closed?'':`<button class="submit" type="submit">${attempts.length?'Check second try':'Check answer'}</button>`}</form><p class="feedback" id="feedback-${q.source}" tabindex="-1" role="status">${feedback}</p>${closed?`<div class="answer"><strong>Answer: ${q.type==='number'?q.correct.toLocaleString('en-US'):`${'ABCD'[q.correct]} · ${math(q.choices[q.correct])}`}</strong><p>${math(q.explanation)}</p></div>`:''}</article>`;
  }
  function renderDays(){
    let completedDays=0;
    document.querySelector('#sessions').innerHTML=visibleBank().map((session,i)=>{
      const history=state.sessions[session.id]||[],latest=history.at(-1),r=latest?engine.stats(session,latest):null;
      const completed=history.filter(run=>engine.stats(session,run).finished===session.questions.length)
        .sort((a,b)=>(a.completedAt||a.startedAt).localeCompare(b.completedAt||b.startedAt)).at(-1);
      const score=completed?engine.stats(session,completed):null;
      const status=completed?'completed':r?.attempted?'in-progress':'not-started';
      if(completed)completedDays++;
      const repeat=completed&&latest!==completed&&r.finished!==r.total;
      return `<a class="session-link ${status}" href="?session=${session.id}" ${active?.id===session.id?'aria-current="page"':''}><b>${groups?.find(g=>g.id===session.group)?.unit||'Day'} ${i+1}</b><span>${i?'Fresh check '+String.fromCharCode(64+i):'Original retry'}</span><span class="day-status">${completed?'✓ Completed':r?.attempted?'In progress':'Not started'}</span>${score?`<strong class="day-score">${score.first}/${score.total} <small>(${score.percent}%)</small></strong><small>Latest completed first-try score</small>`:`<small>${r?.attempted?`${r.first}/${r.total} first-try points · ${r.attempted}/${r.total} attempted` :`${session.questions.length} questions`}</small>`}${repeat?`<small class="repeat-note">New run · ${r.attempted}/${r.total} attempted</small>`:''}</a>`;
    }).join('');
    document.querySelector('#days-progress').textContent=`${completedDays} of ${visibleBank().length} ${groups?.find(g=>g.id===groupId())?.unit==='Session'?'sessions':'days'} completed`;
  }
  function renderSummary(){
    const s=engine.stats(active,current());document.querySelector('#score').textContent=`${s.first} / ${s.total}`;
    document.querySelector('#progress').textContent=`${s.attempted}/${s.total} first tries recorded · ${s.corrected} corrected on retry · ${s.revealed} answers shown${s.attempted===s.total?` · Final first-try score: ${s.percent}%`:''}`;
    renderDays();
    document.querySelector('#jump').innerHTML=active.questions.map((q,i)=>`<a href="#q${i+1}" class="${result(q,current())}" aria-label="Question ${i+1}">${i+1}</a>`).join('');
    const completion=document.querySelector('#completion');completion.hidden=s.finished!==s.total;
    completion.innerHTML=s.finished===s.total?`<h2>${s.first===s.total?`${s.total} out of ${s.total} on your first tries!`:'Day complete. Well done for working through it.'}</h2><p>First-try score: <strong>${s.first}/${s.total} (${s.percent}%)</strong>. Second-try corrections: ${s.corrected}. Answers shown after two misses: ${s.revealed}.</p><p>${active.id===visibleBank().at(-1).id?'Your practice record is below. Review any skills that still need work.':'When you are ready, try the next day’s fresh questions.'}</p>`:'';
    document.querySelector('#new-run').hidden=s.finished!==s.total;
    renderHistory();
  }
  function renderHistory(){
    document.querySelector('#history').innerHTML=runs(active).map((run,i)=>{
      const s=engine.stats(active,run);
      return `<details class="history-run"><summary>Run ${i+1}${run.deviceConflict?' · Separate device attempt':''} · ${esc(date(run.startedAt))} · ${s.first}/${s.total} first-try points · ${s.finished===s.total?'Complete':`${s.attempted}/${s.total} attempted`}</summary><p>${run.completedAt?(s.finished===s.total?'Completed ':'Original portion completed; added questions pending · ')+esc(date(run.completedAt)):'In progress'} · ${s.corrected} corrected on retry · ${s.revealed} answers shown</p><ol>${active.questions.map(q=>{
        const e=run.answers[q.source];return `<li>${esc(sourceLabel(q))}: ${esc(q.skill)} — ${e?.attempts.length?e.attempts.map((a,j)=>`Try ${j+1}: ${chosenText(q,a.choice)} · ${engine.isCorrect(q,a.choice)?'correct':'incorrect'} · ${esc(date(a.at))}`).join('; '):'Not attempted'}</li>`;
      }).join('')}</ol></details>`;
    }).join('');
  }
  function renderGroups(){
    const container=document.querySelector('#groups');if(!container)return;
    container.hidden=!groups||!!groupId();
    container.innerHTML=(groups||[]).map(g=>{
      const sessions=bank.filter(s=>s.group===g.id);
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
    renderGroups();
    document.querySelector('#questions').setAttribute('aria-label',active?`${active.questions.length} practice questions`:'Practice questions');
    document.querySelector('#practice-content').hidden=!active;
    document.title=active?`${active.title} · Harry’s Daily Math`:'Harry’s Daily Math · Test groups';
    if(!active){document.querySelector('#questions').innerHTML='';document.querySelector('#history').innerHTML='';renderDays();updateSaveNote();return;}
    runs(active);document.querySelector('#session-title').textContent=active.title;document.querySelector('#session-description').textContent=active.description;
    document.querySelector('#questions').innerHTML=active.questions.map(card).join('');renderSummary();updateSaveNote();
  }
  document.querySelector('#questions').addEventListener('submit',event=>{
    event.preventDefault();const form=event.target,q=active.questions.find(q=>q.source===Number(form.dataset.source));if(!q)return;
    const selected=form.querySelector(q.type==='number'?'input[name="number-answer"]:not(:disabled)':'input:checked:not(:disabled)'),feedback=document.querySelector(`#feedback-${q.source}`);
    if(!selected||(q.type==='number'&&engine.normalizeFor(q,selected.value)===null)){feedback.textContent=q.type==='number'?`Type a ${q.decimal?'number':'whole-number'} answer before checking. No attempt has been used.`:'Choose a new answer before checking. No attempt has been used.';feedback.focus();return;}
    const run=current();if(!engine.submit(run,q,q.type==='number'?selected.value:Number(selected.value),new Date().toISOString())){feedback.textContent='Try a different answer. No new attempt has been used.';feedback.focus();return;}
    if(engine.stats(active,run).finished===active.questions.length)run.completedAt=new Date().toISOString();save();
    const index=active.questions.indexOf(q);document.querySelector(`#q${index+1}`).outerHTML=card(q,index);renderSummary();document.querySelector(`#feedback-${q.source}`).focus({preventScroll:true});
  });
  document.querySelector('#sessions').addEventListener('click',event=>{const link=event.target.closest('a');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();const id=new URL(link.href).searchParams.get('session');active=bank.find(s=>s.id===id);history.pushState(null,'',link.href);render();document.querySelector('#session-title').scrollIntoView({block:'start'});});
  window.addEventListener('popstate',()=>{active=selectedDay();render();});
  window.addEventListener('storage',event=>{if(event.key!==KEY||!event.newValue)return;try{const remote=JSON.parse(event.newValue);if(remote.version===1&&remote.sessions){state=window.HarrySeptSync?window.HarrySeptSync.merge(state,remote):remote;render();void sync?.push();}}catch{}});
  document.querySelector('#large-text').addEventListener('click',event=>{event.currentTarget.setAttribute('aria-pressed',String(document.body.classList.toggle('large')));});
  document.querySelector('#new-run').addEventListener('click',()=>{if(engine.stats(active,current()).finished!==active.questions.length)return;runs(active).push(newRun(true));save();render();document.querySelector('#session-title').scrollIntoView();});
  document.querySelector('#download').addEventListener('click',()=>{
    const payload={exportedAt:new Date().toISOString(),testDates:groups?.map(g=>g.id)||['2026-09-20'],scoring:'One point only for a correct first try. Second tries do not change the score.',sessions:bank.map(session=>({...session,runs:state.sessions[session.id]||[]}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='harry-star-math-practice-records.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const isLocalPreview=location.hostname==='localhost'||location.hostname==='127.0.0.1';
  if(window.HarrySeptSync&&!isLocalPreview){
    sync=window.HarrySeptSync.create({
      getState:()=>state,
      onRemote(remote){
        const drafts=Array.from(document.querySelectorAll('input[name="number-answer"]:not(:disabled)')).map(input=>[input.id,input.value]);
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
