(function () {
  'use strict';
  const bank=window.HARRY_SEPT_PRACTICE, engine=window.HarrySeptEngine;
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
  function result(q,run){const e=run.answers[q.source];if(!e?.attempts.length)return '';if(e.attempts[0].choice===q.correct)return 'first';if(e.attempts[1]?.choice===q.correct)return 'retry';return e.attempts.length===2?'revealed':'pending';}
  function numberline(){return `<svg class="numberline" viewBox="0 0 600 145" role="img" aria-label="Number line from zero to one with eight equal intervals. A yellow star, blue circle, yellow square, and green triangle are positioned below ticks."><line x1="40" y1="45" x2="560" y2="45" stroke="#193c49" stroke-width="2"/>${Array.from({length:9},(_,i)=>`<line x1="${40+i*65}" x2="${40+i*65}" y1="${i===0||i===8?33:39}" y2="${i===0||i===8?57:51}" stroke="#193c49" stroke-width="2"/>`).join('')}<text x="40" y="85" text-anchor="middle" font-size="22">0</text><text x="560" y="85" text-anchor="middle" font-size="22">1</text><polygon points="170,65 175,77 189,77 178,85 182,99 170,91 158,99 162,85 151,77 165,77" fill="#ffdf4b" stroke="#193c49"/><circle cx="235" cy="83" r="15" fill="#28b8d1" stroke="#193c49"/><rect x="285" y="68" width="30" height="30" fill="#ffdf4b" stroke="#193c49"/><polygon points="430,65 448,98 412,98" fill="#85d452" stroke="#193c49"/></svg>`;}
  function card(q,i){
    const run=current(),entry=run.answers[q.source],attempts=entry?.attempts||[],closed=engine.done(q,entry),status=result(q,run);
    let feedback='Choose an answer, then press Check answer.';
    if(status==='first')feedback='Correct on your first try! 1 point earned.';
    if(status==='pending')feedback='Not quite. You have one more try. Your first-try score stays unchanged.';
    if(status==='retry')feedback='You got it on your second try! This correction is saved; the first-try score stays unchanged.';
    if(status==='revealed')feedback='Two tries completed. Read the explanation below to learn the method.';
    return `<article class="question ${status}" id="q${i+1}" data-source="${q.source}"><div class="question-head"><h3>Question ${i+1}</h3><span class="source">${active.id==='original'?'Original':'Matches'} STAR Q${q.source} · ${esc(q.skill)}</span></div><p class="prompt">${math(q.prompt)}</p>${q.visual==='numberline'?numberline():''}<form data-source="${q.source}" novalidate><fieldset class="choices"><legend>${closed?'Your recorded answers':'Choose one answer'}</legend>${q.choices.map((choice,index)=>{
      const tried=attempts.findIndex(a=>a.choice===index),disabled=closed||tried>=0;
      const tag=tried>=0?`Try ${tried+1}${index===q.correct?' · correct':' · incorrect'}`:'';
      return `<label class="choice ${disabled?'disabled':''} ${tried>=0&&index!==q.correct?'wrong-option':''} ${closed&&index===q.correct?'correct-option':''}"><input type="radio" name="answer-${q.source}" value="${index}" ${disabled?'disabled':''} ${tried===attempts.length-1&&tried>=0?'checked':''}><span class="letter">${'ABCD'[index]}</span><span class="choice-text">${math(choice)}${tag?`<small>${tag}</small>`:''}</span></label>`;
    }).join('')}</fieldset>${closed?'':`<button class="submit" type="submit">${attempts.length?'Check second try':'Check answer'}</button>`}</form><p class="feedback" id="feedback-${q.source}" tabindex="-1" role="status">${feedback}</p>${closed?`<div class="answer"><strong>Answer: ${'ABCD'[q.correct]} · ${math(q.choices[q.correct])}</strong><p>${math(q.explanation)}</p></div>`:''}</article>`;
  }
  function renderDays(){
    let completedDays=0;
    document.querySelector('#sessions').innerHTML=bank.map((session,i)=>{
      const history=state.sessions[session.id]||[],latest=history.at(-1),r=latest?engine.stats(session,latest):null;
      const completed=history.filter(run=>engine.stats(session,run).finished===session.questions.length)
        .sort((a,b)=>(a.completedAt||a.startedAt).localeCompare(b.completedAt||b.startedAt)).at(-1);
      const score=completed?engine.stats(session,completed):null;
      const status=completed?'completed':r?.attempted?'in-progress':'not-started';
      if(completed)completedDays++;
      const repeat=completed&&latest!==completed&&r.finished!==r.total;
      return `<a class="session-link ${status}" href="?session=${session.id}" ${active?.id===session.id?'aria-current="page"':''}><b>Day ${i+1}</b><span>${i?'Fresh check '+String.fromCharCode(64+i):'Original retry'}</span><span class="day-status">${completed?'✓ Completed':r?.attempted?'In progress':'Not started'}</span>${score?`<strong class="day-score">${score.first}/${score.total} <small>(${score.percent}%)</small></strong><small>Latest completed first-try score</small>`:`<small>${r?.attempted?`${r.first}/${r.total} first-try points · ${r.attempted}/${r.total} attempted`:'12 questions'}</small>`}${repeat?`<small class="repeat-note">New run · ${r.attempted}/${r.total} attempted</small>`:''}</a>`;
    }).join('');
    document.querySelector('#days-progress').textContent=`${completedDays} of ${bank.length} days completed`;
  }
  function renderSummary(){
    const s=engine.stats(active,current());document.querySelector('#score').textContent=`${s.first} / ${s.total}`;
    document.querySelector('#progress').textContent=`${s.attempted}/12 first tries recorded · ${s.corrected} corrected on retry · ${s.revealed} answers shown${s.attempted===12?` · Final first-try score: ${s.percent}%`:''}`;
    renderDays();
    document.querySelector('#jump').innerHTML=active.questions.map((q,i)=>`<a href="#q${i+1}" class="${result(q,current())}" aria-label="Question ${i+1}">${i+1}</a>`).join('');
    const completion=document.querySelector('#completion');completion.hidden=s.finished!==12;
    completion.innerHTML=s.finished===12?`<h2>${s.first===12?'12 out of 12 on your first tries!':'Day complete. Well done for working through it.'}</h2><p>First-try score: <strong>${s.first}/12 (${s.percent}%)</strong>. Second-try corrections: ${s.corrected}. Answers shown after two misses: ${s.revealed}.</p><p>${active.id===bank.at(-1).id?'Your practice record is below. Review any skills that still need work.':'When you are ready, try the next day’s fresh questions.'}</p>`:'';
    document.querySelector('#new-run').hidden=s.finished!==12;
    renderHistory();
  }
  function renderHistory(){
    document.querySelector('#history').innerHTML=runs(active).map((run,i)=>{
      const s=engine.stats(active,run);
      return `<details class="history-run"><summary>Run ${i+1}${run.deviceConflict?' · Separate device attempt':''} · ${esc(date(run.startedAt))} · ${s.first}/12 first-try points · ${s.finished===12?'Complete':`${s.attempted}/12 attempted`}</summary><p>${run.completedAt?'Completed '+esc(date(run.completedAt)):'In progress'} · ${s.corrected} corrected on retry · ${s.revealed} answers shown</p><ol>${active.questions.map(q=>{
        const e=run.answers[q.source];return `<li>STAR Q${q.source}: ${esc(q.skill)} — ${e?.attempts.length?e.attempts.map((a,j)=>`Try ${j+1}: ${'ABCD'[a.choice]} (${esc(q.choices[a.choice])}) · ${a.choice===q.correct?'correct':'incorrect'} · ${esc(date(a.at))}`).join('; '):'Not attempted'}</li>`;
      }).join('')}</ol></details>`;
    }).join('');
  }
  function render(){
    document.querySelector('#practice-content').hidden=!active;
    document.title=active?`${active.title} · Harry’s Daily Math`:'Harry’s Daily Math · Days 1–7';
    if(!active){document.querySelector('#questions').innerHTML='';document.querySelector('#history').innerHTML='';renderDays();updateSaveNote();return;}
    runs(active);document.querySelector('#session-title').textContent=active.title;document.querySelector('#session-description').textContent=active.description;
    document.querySelector('#questions').innerHTML=active.questions.map(card).join('');renderSummary();updateSaveNote();
  }
  document.querySelector('#questions').addEventListener('submit',event=>{
    event.preventDefault();const form=event.target,q=active.questions.find(q=>q.source===Number(form.dataset.source));if(!q)return;
    const selected=form.querySelector('input:checked:not(:disabled)'),feedback=document.querySelector(`#feedback-${q.source}`);
    if(!selected){feedback.textContent='Choose a new answer before checking. No attempt has been used.';feedback.focus();return;}
    const run=current();if(!engine.submit(run,q,Number(selected.value),new Date().toISOString()))return;
    if(engine.stats(active,run).finished===12)run.completedAt=new Date().toISOString();save();
    const index=active.questions.indexOf(q);document.querySelector(`#q${index+1}`).outerHTML=card(q,index);renderSummary();document.querySelector(`#feedback-${q.source}`).focus({preventScroll:true});
  });
  document.querySelector('#sessions').addEventListener('click',event=>{const link=event.target.closest('a');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();const id=new URL(link.href).searchParams.get('session');active=bank.find(s=>s.id===id);history.pushState(null,'',link.href);render();document.querySelector('#session-title').scrollIntoView({block:'start'});});
  window.addEventListener('popstate',()=>{active=selectedDay();render();});
  window.addEventListener('storage',event=>{if(event.key!==KEY||!event.newValue)return;try{const remote=JSON.parse(event.newValue);if(remote.version===1&&remote.sessions){state=window.HarrySeptSync?window.HarrySeptSync.merge(state,remote):remote;render();void sync?.push();}}catch{}});
  document.querySelector('#large-text').addEventListener('click',event=>{event.currentTarget.setAttribute('aria-pressed',String(document.body.classList.toggle('large')));});
  document.querySelector('#new-run').addEventListener('click',()=>{if(engine.stats(active,current()).finished!==12)return;runs(active).push(newRun(true));save();render();document.querySelector('#session-title').scrollIntoView();});
  document.querySelector('#download').addEventListener('click',()=>{
    const payload={exportedAt:new Date().toISOString(),testDate:'2026-09-20',scoring:'One point only for a correct first try. Second tries do not change the score.',sessions:bank.map(session=>({...session,runs:state.sessions[session.id]||[]}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='harry-star-math-sept20-practice-records.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const isLocalPreview=location.hostname==='localhost'||location.hostname==='127.0.0.1';
  if(window.HarrySeptSync&&!isLocalPreview){
    sync=window.HarrySeptSync.create({
      getState:()=>state,
      onRemote(remote){
        const selected=Array.from(document.querySelectorAll('input:checked:not(:disabled)')).map(input=>[input.name,input.value]);
        state=remote;save(false);render();
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
