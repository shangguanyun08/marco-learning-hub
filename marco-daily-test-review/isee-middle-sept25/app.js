(function () {
  'use strict';
  const bank=window.MARCO_ISEE_PRACTICE, engine=window.MarcoIseeEngine, scratch=window.MarcoScratch;
  const KEY='marco-isee-middle-sept25-v1';
  // Keep the original subject storage IDs so every saved score and timer survives.
  const sessions=[
    {id:'session-1',number:1,label:'Original questions',ids:['math-original','vocab-original'],description:'One practice set: 7 original math questions, followed by 11 original vocabulary questions.'},
    {id:'session-2',number:2,label:'Similar math · shuffled vocabulary',ids:['math-a','vocab-shuffled'],description:'One practice set: 7 similar math questions, followed by the same 11 vocabulary questions with shuffled choices.'},
    {id:'session-3',number:3,label:'Math only',ids:['math-b'],description:'One practice set of 7 similar math questions.'},
    {id:'session-4',number:4,label:'Timed math',ids:['math-c'],description:'One practice set of 7 similar math questions, with 7 minutes for the entire session.'},
    {id:'session-5',number:5,label:'Math only · Similar set D',ids:['math-d'],description:'One practice set of 7 new math questions on the same skills.'},
    {id:'session-6',number:6,label:'Math only · Similar set E',ids:['math-e'],description:'One practice set of 7 new math questions on the same skills.'},
    {id:'session-7',number:7,label:'Timed math · Similar set F',ids:['math-f'],description:'One practice set of 7 new math questions, with 7 minutes for the entire session.'}
,
    {id:'session-8',number:8,label:'Timed math · Similar set G',ids:['math-g'],description:'One practice set of 7 new math questions, with 7 minutes for the entire session.'},
    {id:'session-9',number:9,label:'Timed math · Similar set H',ids:['math-h'],description:'One practice set of 7 new math questions, with 7 minutes for the entire session.'}
  ].map(s=>({...s,parts:s.ids.map(id=>bank.find(p=>p.id===id))}));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const math=s=>esc(s).replace(/\b(\d+)\/(\d+)\b/g,'<span class="fraction" aria-label="$1 over $2"><span>$1</span><span>$2</span></span>');
  const date=s=>new Date(s).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
  const subject=part=>part.subject==='math'?'Math':'Vocabulary';
  let sync=null,syncKind='connecting',syncMessage='Connecting… Your saved answers will sync automatically.';
  let storageOK=true,state={version:1,sessions:{}},scratchUpload=null,pendingRemote=null;
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.version===1&&saved.sessions)state=saved;}catch{storageOK=false;}
  const selectedSession=()=>{const id=new URLSearchParams(location.search).get('session');return sessions.find(s=>s.id===id||s.ids.includes(id))||null;};
  let active=selectedSession();
  function newRun(restart=false){return {restart,id:crypto.randomUUID(),startedAt:new Date().toISOString(),answers:{},completedAt:null};}
  function runs(part){return state.sessions[part.id] ||= [newRun()];}
  function current(part=active.parts[0]){return runs(part).at(-1);}
  function items(session=active){return session.parts.flatMap(part=>part.questions.map(q=>({q,part})));}
  function complete(session=active){return session.parts.every(part=>engine.stats(part,current(part)).finished===part.questions.length);}
  function save(upload=true){try{if(!storageOK)throw new Error('Storage unavailable');localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}updateSaveNote();if(upload)void sync?.push();}
  function mountScratch(){
    scratch.mount(document.querySelector('#questions'),{
      read:(id,source)=>current(bank.find(p=>p.id===id)).work?.[source],
      change(id,source,patch){
        const run=current(bank.find(p=>p.id===id));run.work ||= {};
        run.work[source]={text:'',textAt:'1970-01-01T00:00:00.000Z',strokes:[],drawingAt:'1970-01-01T00:00:00.000Z',...run.work[source],...patch};
        save(false);renderSessions();renderHistory();
        clearTimeout(scratchUpload);scratchUpload=setTimeout(()=>void sync?.push(),600);
        if(pendingRemote){const remote=pendingRemote;pendingRemote=null;setTimeout(()=>applyRemote(remote),0);}
      }
    });
  }
  function applyRemote(remote){
    if(scratch.isDrawing()){pendingRemote=window.MarcoIseeSync.merge(pendingRemote||state,remote);return;}
    const focused=document.activeElement,typing=focused?.matches('.scratch-text')?{id:focused.id,start:focused.selectionStart,end:focused.selectionEnd}:null;
    const selected=Array.from(document.querySelectorAll('input:checked:not(:disabled)')).map(input=>[input.name,input.value]);
    state=window.MarcoIseeSync.merge(state,remote);save(false);render();
    for(const [name,value] of selected){const input=document.querySelector(`input[name="${name}"][value="${value}"]:not(:disabled)`);if(input)input.checked=true;}
    if(typing){const textarea=document.getElementById(typing.id);if(textarea){textarea.focus({preventScroll:true});textarea.setSelectionRange(typing.start,typing.end);}}
  }
  function updateSaveNote(){const el=document.querySelector('#save-note');el.dataset.syncStatus=syncKind;el.classList.toggle('warning',!storageOK||syncKind==='offline');el.textContent=storageOK?syncMessage:'Progress could not be saved in this browser. Keep this page open and download your records before leaving.';}
  function result(q,run){const e=run.answers[q.source];if(!e?.attempts.length)return run.timedOutAt?'timedout':'';if(e.attempts[0].choice===q.correct)return 'first';if(e.attempts[1]?.choice===q.correct)return 'retry';return e.attempts.length===2?'revealed':run.timedOutAt?'timedout':'pending';}
  const timedPart=()=>active?.parts.find(p=>p.timeLimitSeconds);
  const clockText=seconds=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  function expireTimedRuns(){
    let changed=false;
    for(const part of bank.filter(s=>s.timeLimitSeconds)){
      const run=state.sessions[part.id]?.at(-1);if(!run?.deadlineAt||run.completedAt)continue;
      const pending={};
      if(active?.ids.includes(part.id))document.querySelectorAll(`#questions form[data-part="${part.id}"] input:checked:not(:disabled)`).forEach(input=>{pending[input.closest('form').dataset.source]=Number(input.value);});
      if(Date.now()>=Date.parse(run.deadlineAt))scratch.flush();
      if(engine.expire(run,part,new Date().toISOString(),pending))changed=true;
    }
    if(changed){save();render();}
  }
  function renderTimer(){
    const part=timedPart(),run=part?current(part):null;
    document.querySelector('#timer-panel').hidden=!part;
    document.querySelector('#question-work').hidden=!!part&&!run.deadlineAt&&!run.completedAt;
    document.querySelector('#start-timer').hidden=!!run?.deadlineAt||!!run?.completedAt;
    const running=!!part&&!!run?.deadlineAt&&!run.completedAt;
    document.querySelector('#running-timer').hidden=!running;
    document.body.classList.toggle('timer-running',running);
    const countdown=document.querySelector('#countdown');countdown.hidden=!part||!run?.deadlineAt||running;
    if(!part)return;
    document.querySelector('#timer-title').textContent=`Session ${active.number} · ${part.timeLimitSeconds/60} minutes total`;
    const remaining=run.deadlineAt?Math.max(0,Math.ceil((Date.parse(run.deadlineAt)-Date.parse(run.completedAt||new Date().toISOString()))/1000)):part.timeLimitSeconds;
    countdown.textContent=`${clockText(remaining)} ${run.completedAt?'remaining at finish':'remaining'}`;
    countdown.classList.toggle('urgent',remaining<=60&&!run.completedAt);
    document.querySelector('#running-session').textContent=`Session ${active.number}`;
    document.querySelector('#running-countdown').textContent=`${clockText(remaining)} remaining`;
    document.querySelector('#running-timer').classList.toggle('urgent',remaining<=60);
    document.querySelector('#timer-result').textContent=run.timedOutAt?'Time is up. Answers are locked.':run.completedAt?'Session finished. Your first-try score is saved.':run.deadlineAt?'The timer keeps running if you leave this page.':'The timer begins when you press Start.';
  }
  function arcDiagram(q){
    if(!q.arc)return '';
    const {radius,angle}=q.arc,theta=angle*Math.PI/180,x=140+90*Math.cos(theta),y=130-90*Math.sin(theta);
    return `<svg class="arc-diagram" viewBox="0 0 540 250" role="img" aria-label="An arc of ${angle} degrees is cut from a circle of radius ${radius} centimeters and bent into a new circle. Diagram is not to scale."><circle cx="140" cy="130" r="90" fill="none" stroke="#b7caca" stroke-width="2"/><path d="M230 130 A90 90 0 ${angle>180?1:0} 0 ${x} ${y}" stroke="#236b54" stroke-width="6" fill="none"/><path d="M230 130 H140 L${x} ${y}" stroke="#193c49" stroke-width="1.5" fill="none"/><text x="163" y="155" font-size="16">${radius} cm</text><text x="153" y="111" font-size="16">${angle}°</text><text x="269" y="92" font-size="15" text-anchor="middle">Bend arc</text><text x="269" y="114" font-size="15" text-anchor="middle">into a circle</text><path d="M258 133 H338 M330 126 L338 133 L330 140" stroke="#193c49" stroke-width="2" fill="none"/><circle cx="417" cy="130" r="45" fill="none" stroke="#236b54" stroke-width="4"/><text x="417" y="134" text-anchor="middle" font-size="18">r = ?</text><text x="270" y="240" text-anchor="middle" font-size="14" fill="#59717a">Diagram not to scale</text></svg>`;
  }
  function card(q,i,part){
    const run=current(part),entry=run.answers[q.source],attempts=entry?.attempts||[],closed=engine.done(q,entry,run),status=result(q,run);
    let feedback='Choose an answer, then press Check answer.';
    if(status==='first')feedback='Correct on your first try! 1 point earned.';
    if(status==='pending')feedback='Not quite. You have one more try. Your first-try score stays unchanged.';
    if(status==='retry')feedback='You got it on your second try! This correction is saved; the first-try score stays unchanged.';
    if(status==='revealed')feedback='Two tries completed. Read the explanation below to learn the method.';
    if(status==='timedout')feedback=attempts.length?'Time is up. Your submitted answer and first-try score are saved.':'Time is up. This question was unanswered and earns 0 first-try points.';
    return `<article class="question ${status}" id="q${i+1}" data-source="${q.source}"><div class="question-head"><h3>Question ${i+1}</h3><span class="source">${part.id.endsWith('original')?'Original':'Matches'} Zozeck Q${q.source} · ${esc(q.skill)}</span></div><p class="prompt">${math(q.prompt)}</p>${arcDiagram(q)}<form data-part="${part.id}" data-source="${q.source}" novalidate><fieldset class="choices"><legend>${closed?'Your recorded answers':'Choose one answer'}</legend>${q.choices.map((choice,index)=>{
      const tried=attempts.findIndex(a=>a.choice===index),disabled=closed||tried>=0;
      const tag=tried>=0?`Try ${tried+1}${index===q.correct?' · correct':' · incorrect'}`:'';
      return `<label class="choice ${disabled?'disabled':''} ${tried>=0&&index!==q.correct?'wrong-option':''} ${closed&&index===q.correct?'correct-option':''}"><input type="radio" name="answer-${q.source}" value="${index}" ${disabled?'disabled':''} ${tried===attempts.length-1&&tried>=0?'checked':''}><span class="letter">${'ABCDE'[index]}</span><span class="choice-text">${math(choice)}${tag?`<small>${tag}</small>`:''}</span></label>`;
    }).join('')}</fieldset>${closed?'':`<button class="submit" type="submit">${attempts.length?'Check second try':'Check answer'}</button>`}</form><p class="feedback" id="feedback-${q.source}" tabindex="-1" role="status">${feedback}</p>${closed?`<div class="answer"><strong>Answer: ${'ABCDE'[q.correct]} · ${math(q.choices[q.correct])}</strong><p>${math(q.explanation)}</p>${q.note?`<p class="question-note"><strong>Wording note:</strong> ${esc(q.note)}</p>`:''}</div>`:''}</article>`;
  }
  function renderSessions(){
    let completedSessions=0;
    document.querySelector('#sessions').innerHTML=sessions.map(session=>{
      const parts=session.parts.map(part=>{
        const history=state.sessions[part.id]||[],latest=history.at(-1);
        const completed=history.filter(run=>engine.stats(part,run).finished===part.questions.length)
          .sort((a,b)=>(a.completedAt||a.startedAt).localeCompare(b.completedAt||b.startedAt)).at(-1);
        return {part,latest,completed,score:engine.stats(part,completed||latest||{answers:{}})};
      });
      const completed=parts.every(p=>p.completed),started=parts.some(p=>p.score.attempted||p.latest?.deadlineAt||Object.keys(p.latest?.work||{}).length);
      const repeat=completed&&parts.some(p=>p.latest!==p.completed);
      if(completed)completedSessions++;
      return `<a class="session-link ${completed?'completed':started?'in-progress':'not-started'}" href="?session=${session.id}" ${active?.id===session.id?'aria-current="page"':''}><b>Session ${session.number}</b><span>${session.parts.length===2?'7 math + 11 vocabulary':'7 math questions'}</span><small>${esc(session.label)}</small>${session.parts.some(part=>part.timeLimitSeconds)?'<small>7 minutes total</small>':''}<span class="day-status">${completed?'✓ Completed':started?'In progress':'Not started'}</span>${started||completed?parts.map(p=>`<small class="part-score">${subject(p.part)}: <strong>${p.score.first}/${p.score.total}</strong> first-try</small>`).join(''):''}${repeat?'<small class="repeat-note">New run in progress · earlier scores kept</small>':''}</a>`;
    }).join('');
    document.querySelector('#sessions-progress').textContent=`${completedSessions} of ${sessions.length} sessions completed`;
  }
  function renderSummary(){
    const scores=active.parts.map(part=>({part,s:engine.stats(part,current(part))}));
    const m=scores.find(x=>x.part.subject==='math').s,v=scores.find(x=>x.part.subject==='vocab')?.s;
    document.querySelector('#score').textContent=`${m.first} / ${m.total}`;
    document.querySelector('#vocab-score-wrap').hidden=!v;
    if(v)document.querySelector('#vocab-score').textContent=`${v.first} / ${v.total}`;
    const attempted=scores.reduce((sum,x)=>sum+x.s.attempted,0),finished=scores.reduce((sum,x)=>sum+x.s.finished,0),total=items().length;
    document.querySelector('#progress').textContent=`${attempted}/${total} first tries recorded · ${finished}/${total} questions finished`;
    renderSessions();
    document.querySelector('#jump').innerHTML=items().map(({q,part},i)=>`<a href="#q${i+1}" class="${result(q,current(part))}" aria-label="Question ${i+1}">${i+1}</a>`).join('');
    const done=complete(),completion=document.querySelector('#completion');completion.hidden=!done;
    completion.innerHTML=done?`<h2>${scores.some(x=>x.s.timedOut)?'Time is up. Session complete.':'Session complete.'}</h2>${scores.map(({part,s})=>`<p>${subject(part)} first-try score: <strong>${s.first}/${s.total} (${s.percent}%)</strong>. Corrected on retry: ${s.corrected}.${s.timedOut?` Unanswered when time ended: ${s.unanswered}.`:''}</p>`).join('')}<p>Your other sessions are available above.</p>`:'';
    document.querySelector('#new-run').hidden=!done;
    renderHistory();renderTimer();
  }
  function renderHistory(){
    document.querySelector('#history').innerHTML=active.parts.map(part=>`<section aria-label="${subject(part)} history"><h3>${subject(part)}</h3>${runs(part).map((run,i)=>{
      const s=engine.stats(part,run);
      return `<details class="history-run"><summary>Run ${i+1}${run.deviceConflict?' · Separate device attempt':''} · ${esc(date(run.startedAt))} · ${s.first}/${s.total} first-try points · ${s.finished===s.total?'Complete':`${s.attempted}/${s.total} attempted`}</summary><p>${run.completedAt?'Completed '+esc(date(run.completedAt)):'In progress'} · ${s.corrected} corrected on retry · ${s.revealed} answers shown</p><ol>${part.questions.map(q=>{
        const e=run.answers[q.source];return `<li>Zozeck Q${q.source}: ${esc(q.skill)} — ${e?.attempts.length?e.attempts.map((a,j)=>`Try ${j+1}: ${'ABCDE'[a.choice]} (${esc(q.choices[a.choice])}) · ${a.choice===q.correct?'correct':'incorrect'} · ${esc(date(a.at))}${scratch.view(a.work,'Steps for try '+(j+1))}`).join('; '):run.timedOutAt?'Unanswered when time ended · 0 points':'Not attempted'}${JSON.stringify(e?.attempts?.at(-1)?.work)!==JSON.stringify(run.work?.[q.source])?scratch.view(run.work?.[q.source],'Latest main steps'):''}</li>`;
      }).join('')}</ol></details>`;
    }).join('')}</section>`).join('');
  }
  function render(){
    scratch.flush();
    document.querySelector('#practice-content').hidden=!active;
    document.title=active?`Session ${active.number} · Marco’s ISEE Middle Review`:'Marco’s ISEE Middle Review · Nine sessions';
    if(!active){document.querySelector('#questions').innerHTML='';document.querySelector('#history').innerHTML='';renderSessions();renderTimer();updateSaveNote();return;}
    active.parts.forEach(runs);
    document.querySelector('#session-title').textContent=`Session ${active.number}`;
    document.querySelector('#session-description').textContent=active.description;
    document.querySelector('#session-guidance').textContent=timedPart()?'One 7-minute timer covers all 7 questions, including retries. The timer keeps running if you leave or reload.':'Your first answer earns the point. If you miss, try once more. There is no timer for this session.';
    let index=0;
    document.querySelector('#questions').innerHTML=active.parts.map(part=>`<section class="practice-subject" aria-labelledby="heading-${part.subject}"><h2 id="heading-${part.subject}">${subject(part)} · ${part.questions.length} questions</h2>${part.questions.map(q=>card(q,index++,part)).join('')}</section>`).join('');
    mountScratch();renderSummary();updateSaveNote();
  }
  document.querySelector('#questions').addEventListener('submit',event=>{
    event.preventDefault();scratch.flush();const form=event.target,part=active.parts.find(p=>p.id===form.dataset.part),q=part?.questions.find(q=>q.source===Number(form.dataset.source));if(!q)return;
    const run=current(part);if(part.timeLimitSeconds&&!run.deadlineAt)return;
    if(run.deadlineAt&&!run.completedAt&&Date.now()>=Date.parse(run.deadlineAt)){expireTimedRuns();return;}
    const selected=form.querySelector('input:checked:not(:disabled)'),feedback=document.querySelector(`#feedback-${q.source}`);
    if(!selected){feedback.textContent='Choose a new answer before checking. No attempt has been used.';feedback.focus();return;}
    if(!engine.submit(run,q,Number(selected.value),new Date().toISOString()))return;
    if(engine.stats(part,run).finished===part.questions.length)run.completedAt=new Date().toISOString();save();
    const index=items().findIndex(item=>item.q===q);document.querySelector(`#q${index+1}`).outerHTML=card(q,index,part);mountScratch();renderSummary();document.querySelector(`#feedback-${q.source}`).focus({preventScroll:true});
  });
  document.querySelector('#session-picker').addEventListener('click',event=>{
    const link=event.target.closest('a');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();const id=new URL(link.href).searchParams.get('session');active=sessions.find(s=>s.id===id);history.pushState(null,'',link.href);render();document.querySelector('#session-title').scrollIntoView({block:'start'});
  });
  window.addEventListener('popstate',()=>{active=selectedSession();render();});
  window.addEventListener('storage',event=>{if(event.key!==KEY||!event.newValue)return;try{const remote=JSON.parse(event.newValue);if(window.MarcoIseeSync.valid(remote)){applyRemote(remote);void sync?.push();}}catch{}});
  document.querySelector('#large-text').addEventListener('click',event=>{event.currentTarget.setAttribute('aria-pressed',String(document.body.classList.toggle('large')));});
  document.querySelector('#start-timer').addEventListener('click',()=>{
    const part=timedPart();if(!part||current(part).deadlineAt)return;
    const run=current(part);run.startedAt=new Date().toISOString();run.deadlineAt=new Date(Date.now()+part.timeLimitSeconds*1000).toISOString();
    save();render();document.querySelector('.scorebar').scrollIntoView({block:'start'});
  });
  document.querySelector('#new-run').addEventListener('click',()=>{if(!complete())return;scratch.flush();active.parts.forEach(part=>runs(part).push(newRun(true)));save();render();document.querySelector('#session-title').scrollIntoView();});
  document.querySelector('#download').addEventListener('click',()=>{
    scratch.flush();
    const payload={exportedAt:new Date().toISOString(),reviewDate:'2026-09-25',scoring:'One point only for a correct first try. Second tries do not change the score.',sessions:sessions.map(session=>({number:session.number,parts:session.parts.map(part=>({...part,runs:state.sessions[part.id]||[]}))}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='marco-isee-middle-sept25-practice-records.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const isLocalPreview=location.hostname==='localhost'||location.hostname==='127.0.0.1'||location.protocol==='file:';
  if(window.MarcoIseeSync&&!isLocalPreview){
    sync=window.MarcoIseeSync.create({
      getState:()=>state,
      onRemote:applyRemote,
      onStatus(kind,message){syncKind=kind;syncMessage=message;updateSaveNote();}
    });void sync.start();
  }else{syncKind='offline';syncMessage=isLocalPreview?'Preview · Progress saves only in this browser.':'Not synced · Saved on this device. Reload to reconnect.';}
  window.addEventListener('pagehide',()=>{scratch.flush();save(false);});
  render();expireTimedRuns();setInterval(()=>{expireTimedRuns();if(active)renderTimer();},500);
  if(!isLocalPreview){const tracker=document.createElement('script');tracker.src='../../shared-activity-tracker.js?v=1';tracker.dataset.appId=KEY;tracker.dataset.course='Marco ISEE Middle test review';document.body.append(tracker);}
})();
