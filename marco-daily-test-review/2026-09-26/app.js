(function(){
  'use strict';
  const bank=window.MARCO_ISEE_PRACTICE,E=window.MarcoIseeEngine,V=window.MarcoReviewVisuals,esc=V.esc;
  const KEY='marco-isee-middle-sept26-v1';
  const $=s=>document.querySelector(s);
  const math=s=>esc(s).replace(/\^\(([^)]+)\)/g,'<sup>$1</sup>').replace(/\b(\d+)\/(\d+)\b/g,'<span class="fraction" aria-label="$1 over $2"><span>$1</span><span>$2</span></span>');
  const stamp=s=>new Date(s).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
  let state={version:1,sessions:{}},storageOK=true,sync=null,statusText='Connecting…',statusKind='connecting';
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(window.MarcoIseeSync.valid(saved))state=saved;}catch{storageOK=false;}
  const selection=()=>{const p=new URLSearchParams(location.search).get('session');return bank.find(s=>p===`session-${s.number}`||p===s.id)||bank[0];};
  let active=selection();
  function newRun(restart=false){return {id:crypto.randomUUID(),startedAt:new Date().toISOString(),completedAt:null,answers:{},restart};}
  function runs(s){return state.sessions[s.id]||=([]);}
  function current(s=active){const list=runs(s);if(!list.length)list.push(newRun());return list.at(-1);}
  function save(upload=true){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}saveNote();if(upload)void sync?.push();}
  function saveNote(){$('#save-note').textContent=storageOK?statusText:'This browser could not save progress. Keep the page open and download your records.';$('#save-note').classList.toggle('warning',!storageOK||statusKind==='offline');}
  function result(q,r){const a=r.answers[q.source]?.attempts||[];if(a[0]?.choice===q.correct)return 'first';if(a[1]?.choice===q.correct)return 'retry';if(r.timedOutAt)return 'timedout';return a.length===2?'revealed':a.length?'pending':'';}
  function choices(q,r){const entry=r.answers[q.source],a=entry?.attempts||[],closed=E.done(q,entry,r);return q.choices.map((c,i)=>{const tried=a.findIndex(x=>x.choice===i),disabled=closed||tried>=0;return `<label class="choice ${disabled?'disabled':''} ${tried>=0&&i!==q.correct?'wrong-option':''} ${closed&&i===q.correct?'correct-option':''}"><input type="radio" name="answer-${q.source}" value="${i}" ${disabled?'disabled':''} ${tried>=0&&tried===a.length-1?'checked':''}><span class="letter">${'ABCDE'[i]}</span><span class="choice-text">${q.choiceVisuals?`<img class="choice-diagram" src="./assets/${q.choiceVisuals[i]}" alt="${esc(c)}">`:math(c)}${tried>=0?`<small>Try ${tried+1} · ${i===q.correct?'correct':'incorrect'}</small>`:''}</span></label>`;}).join('');}
  function question(q,i){
    const r=current(),a=r.answers[q.source]?.attempts||[],closed=E.done(q,r.answers[q.source],r),kind=result(q,r);
    let feedback='Choose an answer, then press Check answer.';
    if(kind==='first')feedback='Correct on your first try! 1 point earned.';
    if(kind==='retry')feedback='Correct on your second try. Your correction is saved; your first-try score stays the same.';
    if(kind==='pending')feedback='Not quite. Try a different answer once more. Your first-try score stays the same.';
    if(kind==='revealed')feedback='Two tries completed. Read the solution below.';
    if(kind==='timedout')feedback=a.length?'Time is up. Your recorded answers are saved.':'Time is up. This question was unanswered and earns 0 first-try points.';
    return `<article class="question ${kind}" id="q${i+1}" data-source="${q.source}"><div class="question-head"><h3>Question ${i+1}</h3><span class="source">Test ${q.test} · Q${q.number} · ${esc(q.skill)}</span></div><p class="prompt">${math(q.prompt)}</p>${V.visual(q)}<form data-source="${q.source}"><fieldset class="choices"><legend>${closed?'Recorded answers':'Choose one answer'}</legend>${choices(q,r)}</fieldset>${closed?'':'<button class="submit" type="submit">'+(a.length?'Check second try':'Check answer')+'</button>'}</form><p class="feedback" id="feedback-${q.source}" role="status" tabindex="-1">${feedback}</p>${closed?`<div class="answer"><strong>Answer: ${'ABCDE'[q.correct]} · ${math(q.choices[q.correct])}</strong><p class="tip"><b>Useful approach:</b> ${math(q.tip)}</p><p>${math(q.explanation)}</p>${q.note?`<p class="question-note"><b>Source note:</b> ${esc(q.note)}</p>`:''}</div>`:''}</article>`;
  }
  function renderCards(){
    $('#sessions').innerHTML=bank.map(s=>{const history=state.sessions[s.id]||[],latest=history.at(-1),completed=history.filter(r=>E.stats(s,r).finished===s.questions.length).at(-1),r=completed||latest,stats=r?E.stats(s,r):null,started=!!latest&&(!!latest.deadlineAt||E.stats(s,latest).attempted>0);return `<a class="session-link ${completed?'completed':started?'in-progress':''}" href="?session=session-${s.number}" ${active===s?'aria-current="page"':''}><b>Session ${s.number}</b><span>${esc(s.label)}</span><small>24 questions${s.timeLimitSeconds?' · 24 minutes total':''}</small><span class="day-status">${completed?'✓ Completed':started?'In progress':'Not started'}</span>${stats&&(started||completed)?`<small><strong>${stats.first}/24</strong> first-try points</small>`:''}${completed&&latest!==completed?'<small>New run · earlier result kept</small>':''}</a>`;}).join('');
  }
  function timer(){
    const timed=bank.find(s=>s.timeLimitSeconds),r=state.sessions[timed.id]?.at(-1),running=!!r?.deadlineAt&&!r.completedAt;
    $('#running-timer').hidden=!running;document.body.classList.toggle('timer-running',running);
    const seconds=r?.deadlineAt?Math.max(0,Math.ceil((Date.parse(r.deadlineAt)-Date.now())/1000)):1440;
    $('#running-countdown').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} remaining`;
    $('#running-timer').classList.toggle('urgent',seconds<=60);
    if(active?.timeLimitSeconds){const run=current();$('#start-timer').hidden=!!run.deadlineAt;$('#question-work').hidden=!run.deadlineAt;$('#timer-result').textContent=run.timedOutAt?'Time is up. Your answers are locked.':run.completedAt?'Session complete. Your score is saved.':run.deadlineAt?'The timer is running at the top of the page.':'Press Start when you are ready.';}
  }
  function expire(){let changed=false;for(const s of bank.filter(s=>s.timeLimitSeconds)){const r=state.sessions[s.id]?.at(-1);if(!r?.deadlineAt||r.completedAt)continue;const pending={};if(active===s)document.querySelectorAll('#questions input:checked:not(:disabled)').forEach(input=>pending[input.closest('form').dataset.source]=Number(input.value));if(E.expire(r,s,new Date().toISOString(),pending))changed=true;}if(changed){save();render();}}
  function summary(){
    if(!active)return;const r=current(),s=E.stats(active,r),done=s.finished===s.total;
    $('#score').textContent=`${s.first} / ${s.total}`;$('#progress').textContent=`${s.attempted}/${s.total} first tries · ${s.finished}/${s.total} questions finished`;
    $('#jump').innerHTML=active.questions.map((q,i)=>`<a href="#q${i+1}" class="${result(q,r)}" aria-label="Question ${i+1}">${i+1}</a>`).join('');
    $('#completion').hidden=!done;$('#completion').innerHTML=done?`<h2>${r.timedOutAt?'Time is up.':'Session complete.'}</h2><p>Math first-try score: <strong>${s.first}/${s.total} (${s.percent}%)</strong>. Corrected on retry: ${s.corrected}.${r.timedOutAt?` Unanswered: ${s.unanswered}.`:''}</p>`:'';
    $('#new-run').hidden=!done;
    $('#history').innerHTML=runs(active).map((run,i)=>{const st=E.stats(active,run);return `<details class="history-run"><summary>Run ${i+1}${run.deviceConflict?' · Separate device attempt':''} · ${esc(stamp(run.startedAt))} · ${st.first}/${st.total} first-try points · ${run.completedAt?'Complete':'In progress'}</summary><ol>${active.questions.map(q=>{const attempts=run.answers[q.source]?.attempts||[];return `<li>Test ${q.test} Q${q.number}: ${attempts.length?attempts.map((a,j)=>`Try ${j+1}: ${'ABCDE'[a.choice]} (${esc(q.choices[a.choice])}) · ${a.correct?'correct':'incorrect'} · ${esc(stamp(a.at))}`).join('; '):run.timedOutAt?'Unanswered when time ended':'Not attempted'}</li>`;}).join('')}</ol></details>`;}).join('');
    renderCards();timer();
  }
  function render(){
    document.title=`Session ${active.number} · September 26, 2026 · Marco`;
    $('#session-title').textContent=`Session ${active.number} · ${active.label}`;
    $('#session-description').textContent=active.number===1?'Retry the 24 questions marked wrong. Source corrections, tricks, and explanations appear with each revealed answer. Earn one point for a correct first answer; one retry is allowed.':active.number===2?'24 new questions on the same skills. Earn one point for a correct first answer; one retry is allowed.':'24 fresh similar questions. One 24-minute timer covers all questions, including retries.';
    $('#timer-panel').hidden=!active?.timeLimitSeconds;$('#question-work').hidden=false;$('#scorebar').hidden=false;$('#records').hidden=false;$('#completion').hidden=true;
    $('#questions').innerHTML=active.questions.map((q,i)=>question(q,i)).join('');
    summary();
    saveNote();
  }
  function navigate(link){const id=new URL(link.href).searchParams.get('session');active=bank.find(s=>id===`session-${s.number}`)||bank[0];history.pushState(null,'',link.href);render();$('#session-title').scrollIntoView({block:'start'});$('#session-title').focus({preventScroll:true});}
  document.addEventListener('click',event=>{const link=event.target.closest('#sessions a,#running-timer a');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();navigate(link);});
  window.addEventListener('popstate',()=>{active=selection();render();});
  $('#questions').addEventListener('submit',event=>{
    event.preventDefault();if(!active)return;const form=event.target,q=active.questions.find(q=>String(q.source)===form.dataset.source);if(!q)return;
    const r=current();if(active.timeLimitSeconds&&!r.deadlineAt)return;if(r.deadlineAt&&Date.now()>=Date.parse(r.deadlineAt)){expire();return;}
    const input=form.querySelector('input:checked:not(:disabled)'),feedback=$(`#feedback-${q.source}`);if(!input){feedback.textContent='Choose a new answer before checking. No attempt used.';feedback.focus();return;}
    if(!E.submit(r,q,Number(input.value),new Date().toISOString()))return;if(E.stats(active,r).finished===active.questions.length)r.completedAt=new Date().toISOString();save();const i=active.questions.indexOf(q);$(`#q${i+1}`).outerHTML=question(q,i);summary();$(`#feedback-${q.source}`).focus({preventScroll:true});
  });
  $('#start-timer').addEventListener('click',()=>{if(!active?.timeLimitSeconds||current().deadlineAt)return;const r=current();r.startedAt=new Date().toISOString();r.deadlineAt=new Date(Date.now()+active.timeLimitSeconds*1000).toISOString();save();render();$('#scorebar').scrollIntoView({block:'start'});});
  $('#large-text').addEventListener('click',event=>event.currentTarget.setAttribute('aria-pressed',String(document.body.classList.toggle('large'))));
  $('#new-run').addEventListener('click',()=>{if(!active||E.stats(active,current()).finished!==active.questions.length)return;runs(active).push(newRun(true));save();render();$('#session-title').scrollIntoView();});
  $('#download').addEventListener('click',()=>{const payload={reviewDate:'2026-09-26',exportedAt:new Date().toISOString(),scoring:'Correct first try earns one point. Retries do not change that score.',sessions:bank.map(s=>({...s,runs:state.sessions[s.id]||[]}))};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='marco-test-review-2026-09-26.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  function applyRemote(remote){const pending=[...document.querySelectorAll('#questions input:checked:not(:disabled)')].map(x=>[x.name,x.value]);state=window.MarcoIseeSync.merge(state,remote);save(false);render();for(const [name,value]of pending){const input=document.querySelector(`input[name="${name}"][value="${value}"]:not(:disabled)`);if(input)input.checked=true;}expire();}
  window.addEventListener('storage',event=>{if(event.key!==KEY||!event.newValue)return;try{const remote=JSON.parse(event.newValue);if(window.MarcoIseeSync.valid(remote)){applyRemote(remote);void sync?.push();}}catch{}});
  const local=['localhost','127.0.0.1'].includes(location.hostname)||location.protocol==='file:';
  if(!local){sync=window.MarcoIseeSync.create({getState:()=>state,onRemote:applyRemote,onStatus(kind,message){statusKind=kind;statusText=message;saveNote();}});void sync.start();}else{statusKind='preview';statusText='Preview · Progress saves only in this browser.';}
  render();expire();setInterval(()=>{expire();timer();},500);
  if(!local){const script=document.createElement('script');script.src='../../shared-activity-tracker.js?v=1';script.dataset.appId=KEY;script.dataset.course='Marco ISEE review · September 26';document.body.append(script);}
})();
