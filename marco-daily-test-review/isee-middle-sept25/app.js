(function () {
  'use strict';
  const bank=window.MARCO_ISEE_PRACTICE, engine=window.MarcoIseeEngine;
  const KEY='marco-isee-middle-sept25-v1';
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
  function result(q,run){const e=run.answers[q.source];if(!e?.attempts.length)return run.timedOutAt?'timedout':'';if(e.attempts[0].choice===q.correct)return 'first';if(e.attempts[1]?.choice===q.correct)return 'retry';return e.attempts.length===2?'revealed':run.timedOutAt?'timedout':'pending';}
  const clockText=seconds=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  function expireTimedRuns(){
    let changed=false;
    for(const session of bank.filter(s=>s.timeLimitSeconds)){
      const run=state.sessions[session.id]?.at(-1);if(!run?.deadlineAt||run.completedAt)continue;
      const pending={};
      if(active?.id===session.id)document.querySelectorAll('#questions input:checked:not(:disabled)').forEach(input=>{pending[input.closest('form').dataset.source]=Number(input.value);});
      if(engine.expire(run,session,new Date().toISOString(),pending))changed=true;
    }
    if(changed){save();render();}
  }
  function renderTimer(){
    const timed=!!active?.timeLimitSeconds,run=active?current():null;
    document.querySelector('#timer-panel').hidden=!timed;
    document.querySelector('#question-work').hidden=timed&&!run.deadlineAt;
    document.querySelector('#start-timer').hidden=!!run?.deadlineAt;
    const countdown=document.querySelector('#countdown');countdown.hidden=!timed||!run?.deadlineAt;
    if(!timed)return;
    const remaining=run.deadlineAt?Math.max(0,Math.ceil((Date.parse(run.deadlineAt)-Date.parse(run.completedAt||new Date().toISOString()))/1000)):active.timeLimitSeconds;
    countdown.textContent=`${clockText(remaining)} ${run.completedAt?'remaining at finish':'remaining'}`;
    countdown.classList.toggle('urgent',remaining<=60&&!run.completedAt);
    document.querySelector('#timer-result').textContent=run.timedOutAt?'Time is up. Answers are locked.':run.completedAt?'Session finished. Your first-try score is saved.':run.deadlineAt?'The timer keeps running if you leave this page.':'The timer begins when you press Start.';
  }
  function arcDiagram(q){
    if(!q.arc)return '';
    const {radius,angle}=q.arc,theta=angle*Math.PI/180,x=140+90*Math.cos(theta),y=130-90*Math.sin(theta);
    return `<svg class="arc-diagram" viewBox="0 0 540 250" role="img" aria-label="An arc of ${angle} degrees is cut from a circle of radius ${radius} centimeters and bent into a new circle. Diagram is not to scale."><circle cx="140" cy="130" r="90" fill="none" stroke="#b7caca" stroke-width="2"/><path d="M230 130 A90 90 0 ${angle>180?1:0} 0 ${x} ${y}" stroke="#236b54" stroke-width="6" fill="none"/><path d="M230 130 H140 L${x} ${y}" stroke="#193c49" stroke-width="1.5" fill="none"/><text x="163" y="155" font-size="16">${radius} cm</text><text x="153" y="111" font-size="16">${angle}°</text><text x="269" y="92" font-size="15" text-anchor="middle">Bend arc</text><text x="269" y="114" font-size="15" text-anchor="middle">into a circle</text><path d="M258 133 H338 M330 126 L338 133 L330 140" stroke="#193c49" stroke-width="2" fill="none"/><circle cx="417" cy="130" r="45" fill="none" stroke="#236b54" stroke-width="4"/><text x="417" y="134" text-anchor="middle" font-size="18">r = ?</text><text x="270" y="240" text-anchor="middle" font-size="14" fill="#59717a">Diagram not to scale</text></svg>`;
  }
  function card(q,i){
    const run=current(),entry=run.answers[q.source],attempts=entry?.attempts||[],closed=engine.done(q,entry,run),status=result(q,run);
    let feedback='Choose an answer, then press Check answer.';
    if(status==='first')feedback='Correct on your first try! 1 point earned.';
    if(status==='pending')feedback='Not quite. You have one more try. Your first-try score stays unchanged.';
    if(status==='retry')feedback='You got it on your second try! This correction is saved; the first-try score stays unchanged.';
    if(status==='revealed')feedback='Two tries completed. Read the explanation below to learn the method.';
    if(status==='timedout')feedback=attempts.length?'Time is up. Your submitted answer and first-try score are saved.':'Time is up. This question was unanswered and earns 0 first-try points.';
    return `<article class="question ${status}" id="q${i+1}" data-source="${q.source}"><div class="question-head"><h3>Question ${i+1}</h3><span class="source">${active.id.endsWith('original')?'Original':'Matches'} Zozeck Q${q.source} · ${esc(q.skill)}</span></div><p class="prompt">${math(q.prompt)}</p>${arcDiagram(q)}<form data-source="${q.source}" novalidate><fieldset class="choices"><legend>${closed?'Your recorded answers':'Choose one answer'}</legend>${q.choices.map((choice,index)=>{
      const tried=attempts.findIndex(a=>a.choice===index),disabled=closed||tried>=0;
      const tag=tried>=0?`Try ${tried+1}${index===q.correct?' · correct':' · incorrect'}`:'';
      return `<label class="choice ${disabled?'disabled':''} ${tried>=0&&index!==q.correct?'wrong-option':''} ${closed&&index===q.correct?'correct-option':''}"><input type="radio" name="answer-${q.source}" value="${index}" ${disabled?'disabled':''} ${tried===attempts.length-1&&tried>=0?'checked':''}><span class="letter">${'ABCDE'[index]}</span><span class="choice-text">${math(choice)}${tag?`<small>${tag}</small>`:''}</span></label>`;
    }).join('')}</fieldset>${closed?'':`<button class="submit" type="submit">${attempts.length?'Check second try':'Check answer'}</button>`}</form><p class="feedback" id="feedback-${q.source}" tabindex="-1" role="status">${feedback}</p>${closed?`<div class="answer"><strong>Answer: ${'ABCDE'[q.correct]} · ${math(q.choices[q.correct])}</strong><p>${math(q.explanation)}</p>${q.note?`<p class="question-note"><strong>Wording note:</strong> ${esc(q.note)}</p>`:''}</div>`:''}</article>`;
  }
  function renderDays(){
    for(const subject of ['math','vocab']){
      const group=bank.filter(s=>s.subject===subject);let completedDays=0;
      document.querySelector(`#${subject}-sessions`).innerHTML=group.map(session=>{
        const history=state.sessions[session.id]||[],latest=history.at(-1),r=latest?engine.stats(session,latest):null;
        const completed=history.filter(run=>engine.stats(session,run).finished===session.questions.length)
          .sort((a,b)=>(a.completedAt||a.startedAt).localeCompare(b.completedAt||b.startedAt)).at(-1);
        const score=completed?engine.stats(session,completed):null;
        const status=completed?'completed':r?.attempted||latest?.deadlineAt?'in-progress':'not-started';
        if(completed)completedDays++;
        const repeat=completed&&latest!==completed&&r.finished!==r.total;
        return `<a class="session-link ${status}" href="?session=${session.id}" ${active?.id===session.id?'aria-current="page"':''}><b>Session ${session.day}</b><span>${esc(session.label)}</span>${session.timeLimitSeconds?'<small>7 minutes total</small>':''}<span class="day-status">${completed?'✓ Completed':r?.attempted||latest?.deadlineAt?'In progress':'Not started'}</span>${score?`<strong class="day-score">${score.first}/${score.total} <small>(${score.percent}%)</small></strong><small>${subject==='math'?'Math':'Vocabulary'} first-try score</small>`:`<small>${r?.attempted?`${r.first}/${r.total} first-try points · ${r.attempted}/${r.total} attempted`:session.questions.length+' questions'}</small>`}${repeat?`<small class="repeat-note">New run · ${r.attempted}/${r.total} attempted</small>`:''}</a>`;
      }).join('');
      document.querySelector(`#${subject}-progress`).textContent=`${completedDays} of ${group.length} completed`;
    }
  }
  function renderSummary(){
    const s=engine.stats(active,current());document.querySelector('#score').textContent=`${s.first} / ${s.total}`;document.querySelector('#score-label').textContent=(active.subject==='math'?'Math':'Vocabulary')+' first-try score';
    document.querySelector('#progress').textContent=`${s.attempted}/${s.total} first tries recorded · ${s.corrected} corrected on retry · ${s.revealed} answers shown${s.attempted===s.total?` · Final first-try score: ${s.percent}%`:''}`;
    renderDays();
    document.querySelector('#jump').innerHTML=active.questions.map((q,i)=>`<a href="#q${i+1}" class="${result(q,current())}" aria-label="Question ${i+1}">${i+1}</a>`).join('');
    const completion=document.querySelector('#completion');completion.hidden=s.finished!==s.total;
    completion.innerHTML=s.finished===s.total?`<h2>${s.timedOut?'Time is up. Session complete.':s.first===s.total?'Every answer correct on your first try!' :'Session complete. Well done for working through it.'}</h2><p>First-try score: <strong>${s.first}/${s.total} (${s.percent}%)</strong>. Second-try corrections: ${s.corrected}. Answers shown after two misses: ${s.revealed}.${s.timedOut?` Unanswered when time ended: ${s.unanswered}.`:''}</p><p>Your other sessions are available above.</p>`:'';
    document.querySelector('#new-run').hidden=s.finished!==s.total;
    renderHistory();renderTimer();
  }
  function renderHistory(){
    document.querySelector('#history').innerHTML=runs(active).map((run,i)=>{
      const s=engine.stats(active,run);
      return `<details class="history-run"><summary>Run ${i+1}${run.deviceConflict?' · Separate device attempt':''} · ${esc(date(run.startedAt))} · ${s.first}/${s.total} first-try points · ${s.finished===s.total?'Complete':`${s.attempted}/${s.total} attempted`}</summary><p>${run.completedAt?'Completed '+esc(date(run.completedAt)):'In progress'} · ${s.corrected} corrected on retry · ${s.revealed} answers shown</p><ol>${active.questions.map(q=>{
        const e=run.answers[q.source];return `<li>Zozeck Q${q.source}: ${esc(q.skill)} — ${e?.attempts.length?e.attempts.map((a,j)=>`Try ${j+1}: ${'ABCDE'[a.choice]} (${esc(q.choices[a.choice])}) · ${a.choice===q.correct?'correct':'incorrect'} · ${esc(date(a.at))}`).join('; '):run.timedOutAt?'Unanswered when time ended · 0 points':'Not attempted'}</li>`;
      }).join('')}</ol></details>`;
    }).join('');
  }
  function render(){
    document.querySelector('#practice-content').hidden=!active;
    document.title=active?`${active.title} · Marco’s ISEE Middle Review`:'Marco’s ISEE Middle Review · Math & Vocabulary';
    if(!active){document.querySelector('#questions').innerHTML='';document.querySelector('#history').innerHTML='';renderDays();updateSaveNote();return;}
    runs(active);document.querySelector('#session-title').textContent=active.title;document.querySelector('#session-description').textContent=active.description;
    document.querySelector('#session-guidance').textContent=active.timeLimitSeconds?'One 7-minute timer covers all 7 questions, including retries. The timer keeps running if you leave or reload.':'There is no timer for this session. Use paper for math working. You can stop and come back.';
    document.querySelector('#questions').innerHTML=active.questions.map(card).join('');renderSummary();updateSaveNote();
  }
  document.querySelector('#questions').addEventListener('submit',event=>{
    event.preventDefault();const form=event.target,q=active.questions.find(q=>q.source===Number(form.dataset.source));if(!q)return;
    if(active.timeLimitSeconds&&!current().deadlineAt)return;
    if(current().deadlineAt&&!current().completedAt&&Date.now()>=Date.parse(current().deadlineAt)){expireTimedRuns();return;}
    const selected=form.querySelector('input:checked:not(:disabled)'),feedback=document.querySelector(`#feedback-${q.source}`);
    if(!selected){feedback.textContent='Choose a new answer before checking. No attempt has been used.';feedback.focus();return;}
    const run=current();if(!engine.submit(run,q,Number(selected.value),new Date().toISOString()))return;
    if(engine.stats(active,run).finished===active.questions.length)run.completedAt=new Date().toISOString();save();
    const index=active.questions.indexOf(q);document.querySelector(`#q${index+1}`).outerHTML=card(q,index);renderSummary();document.querySelector(`#feedback-${q.source}`).focus({preventScroll:true});
  });
  document.querySelector('#session-picker').addEventListener('click',event=>{const link=event.target.closest('a');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();const id=new URL(link.href).searchParams.get('session');active=bank.find(s=>s.id===id);history.pushState(null,'',link.href);render();document.querySelector('#session-title').scrollIntoView({block:'start'});});
  window.addEventListener('popstate',()=>{active=selectedDay();render();});
  window.addEventListener('storage',event=>{if(event.key!==KEY||!event.newValue)return;try{const remote=JSON.parse(event.newValue);if(remote.version===1&&remote.sessions){state=window.MarcoIseeSync?window.MarcoIseeSync.merge(state,remote):remote;render();void sync?.push();}}catch{}});
  document.querySelector('#large-text').addEventListener('click',event=>{event.currentTarget.setAttribute('aria-pressed',String(document.body.classList.toggle('large')));});
  document.querySelector('#start-timer').addEventListener('click',()=>{
    if(!active?.timeLimitSeconds||current().deadlineAt)return;
    const run=current();run.startedAt=new Date().toISOString();run.deadlineAt=new Date(Date.now()+active.timeLimitSeconds*1000).toISOString();
    save();render();document.querySelector('.scorebar').scrollIntoView({block:'start'});
  });
  document.querySelector('#new-run').addEventListener('click',()=>{if(engine.stats(active,current()).finished!==active.questions.length)return;runs(active).push(newRun(true));save();render();document.querySelector('#session-title').scrollIntoView();});
  document.querySelector('#download').addEventListener('click',()=>{
    const payload={exportedAt:new Date().toISOString(),reviewDate:'2026-09-25',scoring:'One point only for a correct first try. Second tries do not change the score.',sessions:bank.map(session=>({...session,runs:state.sessions[session.id]||[]}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='marco-isee-middle-sept25-practice-records.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const isLocalPreview=location.hostname==='localhost'||location.hostname==='127.0.0.1'||location.protocol==='file:';
  if(window.MarcoIseeSync&&!isLocalPreview){
    sync=window.MarcoIseeSync.create({
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
  render();expireTimedRuns();
  setInterval(()=>{expireTimedRuns();if(active)renderTimer();},500);
  if(!isLocalPreview){
    const tracker=document.createElement('script');tracker.src='../../shared-activity-tracker.js?v=1';
    tracker.dataset.appId=KEY;tracker.dataset.course='Marco ISEE Middle test review';document.body.append(tracker);
  }
})();
