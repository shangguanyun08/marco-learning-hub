(function(root){
 'use strict';
 const D=root.HarrySkillData,E=root.HarrySkillEngine,KEY=D.appId+':state',local=/^(localhost|127\.0\.0\.1)$/.test(location.hostname),demo=new URLSearchParams(location.search).has('demo');let sync=null,state=E.empty(),filter='all',onlyWrong=false;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),math=x=>esc(x).replace(/\b(\d+)\/(\d+)\b/g,'<span class="fraction" aria-label="$1 over $2"><span>$1</span><span>$2</span></span>'),skillName=id=>D.skills.find(s=>s.id===id).name;
 const DRAFT_KEY=D.appId+':set-drafts-v1',drafts=new Map(),retryDrafts=new Map();let storageOK=true;try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(E.valid(saved))state=E.merge(saved,E.empty());}catch{storageOK=false;}
 try{const saved=JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))for(const [id,choice]of Object.entries(saved)){const q=E.question(id);if(q&&Number.isInteger(choice)&&choice>=0&&choice<q.choices.length)drafts.set(id,choice);}}catch{storageOK=false;}
 const RETRY_KEY=D.appId+':retry-practice-v1';let retryRecords={};
 try{const saved=JSON.parse(localStorage.getItem(RETRY_KEY)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))for(const [id,record] of Object.entries(saved)){const q=E.question(id);if(q&&record&&typeof record.answerId==='string'&&Array.isArray(record.attempts)&&record.attempts.every(a=>a&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<q.choices.length&&typeof a.at==='string'&&Number.isFinite(Date.parse(a.at))))retryRecords[id]=record;}}catch{}
 function retries(q,a){return a&&!a.correct&&retryRecords[q.id]?.answerId===a.id?retryRecords[q.id].attempts:[];}
 function answerStatus(q,r,done=E.complete(r)){const a=r?.answers[q.id],retry=retries(q,a).at(-1);return!done?'pending':a.correct?'right':!retry?'first-wrong':retry.choice===q.correct?'corrected':'retry-wrong';}
 function saveRetry(q,a,choice){const attempts=retries(q,a);if(a.correct||attempts.length>=1||!Number.isInteger(choice)||choice<0||choice>=q.choices.length)return false;retryRecords[q.id]={answerId:a.id,attempts:[...attempts,{choice,at:new Date().toISOString()}]};try{localStorage.setItem(RETRY_KEY,JSON.stringify(retryRecords));}catch{document.querySelector('#save-note').textContent='Your first answers are saved. This browser could not save retry practice; keep this page open.';}return true;}
 function retryStats(s,r){const missed=s.questions.filter(q=>r?.answers[q.id]?.correct===false),attempted=missed.filter(q=>retries(q,r.answers[q.id]).length),corrected=attempted.filter(q=>retries(q,r.answers[q.id]).at(-1).choice===q.correct).length;return{attempted:attempted.length,corrected,stillWrong:attempted.length-corrected,remaining:missed.length-attempted.length};}
 function focusFeedback(qid){const card=document.getElementById(qid);card?.querySelector('.answer-feedback')?.focus({preventScroll:true});card?.scrollIntoView({block:'center'});}
 function selected() {
  const requested = new URLSearchParams(location.search).get('session');
  if (requested) return requested;
  const finished = D.sessions.filter(session => E.complete(state.sessions[session.id]));
  finished.sort((a, b) => state.sessions[b.id].completedAt.localeCompare(state.sessions[a.id].completedAt) || b.number - a.number);
  return finished[0]?.id || D.sessions[0].id;
 }
 const answeredCount=(s,r)=>s.questions.filter(q=>r?.answers[q.id]||drafts.has(q.id)).length;
 function saveDrafts(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(Object.fromEntries(drafts)));}catch{storageOK=false;document.querySelector('#save-note').textContent='This browser could not save your selections. Keep this page open and download the practice record before closing.';}}
 function updateProgress(s,r){
  const n=answeredCount(s,r),total=s.questions.length;
  document.querySelector('#answered-count').textContent=`${n}/${total} answers selected`;
  document.querySelector('#submit-progress').textContent=n===total?`All ${total} answers are selected. You can still change your choices before submitting.`:`Answer all ${total} questions before submitting. ${total-n} left.`;
  document.querySelector('#submit-set').disabled=n!==total;
  const bar=document.querySelector('.progressbar');bar.setAttribute('aria-valuenow',n);bar.querySelector('span').style.width=n/total*100+'%';
  for(const [i,q]of s.questions.entries())document.querySelector('.jump').children[i].classList.toggle('saved',Boolean(r?.answers[q.id]||drafts.has(q.id)));
  sessionCards();
 }
 function save(renderPage=true){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;document.querySelector('#save-note').textContent='This browser could not save. Download the practice record before closing.';}if(renderPage)render();void sync?.push();}
 function chart(v){if(!v)return '';const left=48,top=28,size=300,step=30,x=left+v.x*step,y=top+size-v.y*step;return `<svg class="coordinate" viewBox="0 0 410 390" role="img" aria-label="Coordinate grid with point ${esc(v.label)}. Horizontal axis x and vertical axis y are numbered zero to ten.">${Array.from({length:11},(_,i)=>`<line x1="${left+i*step}" x2="${left+i*step}" y1="${top}" y2="${top+size}" stroke="#b5c8cf"/><line x1="${left}" x2="${left+size}" y1="${top+i*step}" y2="${top+i*step}" stroke="#b5c8cf"/>`).join('')}<path d="M${left} ${top-12}V${top+size}H${left+size+16}" fill="none" stroke="#173f54" stroke-width="2.5"/>${Array.from({length:11},(_,i)=>`<text x="${left+i*step}" y="${top+size+24}" text-anchor="middle" font-size="14" fill="#173f54">${i}</text>${i?`<text x="${left-12}" y="${top+size-i*step+5}" text-anchor="end" font-size="14" fill="#173f54">${i}</text>`:''}`).join('')}<text x="${left+size+26}" y="${top+size+5}" font-size="19">x</text><text x="${left-5}" y="${top-15}" font-size="19">y</text><circle cx="${x}" cy="${y}" r="6" fill="#b53d5e"/><text x="${x+10}" y="${y-9}" font-size="20" font-style="italic" fill="#173f54">${esc(v.label)}</text></svg>`;}
 function sessionCards(){const current=selected();document.querySelector('#sessions').innerHTML=D.sessions.map(s=>{const r=state.sessions[s.id],st=E.stats(r,s.id),n=answeredCount(s,r),done=E.complete(r),locked=s.number>1&&!E.complete(state.sessions[D.sessions[s.number-2].id]);return `<article class="session-card ${done?'complete':''} ${current===s.id?'current':''}"><p class="eyebrow">Mixed check ${s.number}</p><h2>${s.title}</h2><p>${s.questions.length} questions · ${s.questions.length/D.skills.length} per skill</p>${done?`<p class="dashboard-score"><strong>${st.percent}%</strong><span>${st.correct}/${st.total} first try · Finished</span></p>`:`<p>${n||r?`${n}/${st.total} selected · Not submitted`:'Fresh questions · Not started'}</p>`}${locked?`<p class="muted">Finish Session ${s.number-1} to open.</p>`:`<a class="${done?'secondary':'primary'}" href="?session=${s.id}">${done?'Review results':r||n?'Continue':'Open session'} →</a>`}</article>`;}).join('');}
 function questionCard(q,i,r,done){
  const a=r?.answers[q.id],draft=(done?retryDrafts:drafts).get(q.id),note=r?.notes[q.id]?.text||'',wrong=Boolean(done&&a&&!a.correct),attempts=done?retries(q,a):[],latest=attempts.at(-1),solved=Boolean(done&&a&&(a.correct||latest?.choice===q.correct)),locked=done?(solved||attempts.length>=1):Boolean(a),shown=Boolean(done&&a&&locked),chosen=done?(locked?(latest?.choice??a.choice):draft):(a?.choice??draft);
  const outcome=answerStatus(q,r,done);
  const tag=!done?(a?'First answer saved · Results after submission':'Results after submission'):a.correct?'✓ Correct · first try':solved?'✓ Correct on retry · first try incorrect':locked?'✗ Incorrect on second try · first try incorrect':'✗ Incorrect · Second try available';
  const feedback=!done?'':a.correct?'Correct on your first try!':solved?'Correct on retry! Your first-try score stays unchanged.':locked?'Incorrect on your second try. Review the correct answer below. Your first-try score stays unchanged.':'Not quite. You have one more try. Choose an answer, then check your second try.';
  return `<article class="question ${outcome} ${wrong?'wrong':''}" id="${q.id}" data-skill="${q.skill}" data-wrong="${wrong}"><div class="qhead"><h2>Question ${i+1}</h2><span class="tag">${tag}${done?' · '+esc(skillName(q.skill)):''}</span></div><p class="prompt">${math(q.prompt)}</p>${chart(q.visual)}<form data-question="${q.id}"><div class="choices" role="radiogroup" aria-label="Question ${i+1} answers">${q.choices.map((choice,n)=>`<label class="option ${shown&&n===q.correct?'right-answer':''} ${wrong&&a.choice===n?'wrong-answer':''} ${latest&&latest.choice===n?(solved?'corrected-answer':'retry-wrong-answer'):''}"><input type="radio" name="choice-${q.id}" value="${n}" ${chosen===n?'checked':''} ${locked?'disabled':''}><span><span class="choice-letter">${'ABCD'[n]}.</span> ${math(choice)}${shown&&n===q.correct?'<span class="answer-tag">✓ Correct answer</span>':''}${done&&a.choice===n?'<span class="answer-tag">First answer · '+(a.correct?'correct':'incorrect')+'</span>':''}${latest&&latest.choice===n?'<span class="answer-tag">Second answer · '+(solved?'correct':'incorrect')+'</span>':''}</span></label>`).join('')}</div>${done&&!locked?`<button type="submit" class="primary answer-button" ${draft===undefined?'disabled':''}>Check second try</button>`:''}${done?`<p class="answer-feedback feedback-${outcome}" role="status" tabindex="-1">${feedback}</p><p class="saved-note">${a.correct?'Your first answer earned the point.':'Your first answer remains incorrect in the score.'}${attempts.length?' · 1 practice retry':''}</p>`:''}</form><details class="working"><summary>My working or explanation (optional)</summary><label for="note-${q.id}">Write how you worked it out, or use paper.</label><textarea id="note-${q.id}" data-note="${q.id}" maxlength="2000">${esc(note)}</textarea></details>${shown?`<div class="explanation"><strong>Why this works</strong><p>${math(q.explanation)}</p></div>`:''}${done&&wrong&&locked?`<label class="review-label"><input type="checkbox" data-reviewed="${q.id}" ${r.reviewed[q.id]?'checked disabled':''}>${r.reviewed[q.id]?'Reviewed with parent':'We reviewed this mistake together'}</label>`:''}</article>`;
 }
 function render(){
  let removed=false;for(const r of Object.values(state.sessions))for(const id of Object.keys(r.answers))removed=drafts.delete(id)||removed;if(removed)saveDrafts();
  sessionCards();
  const sid=selected(),s=E.session(sid),host=document.querySelector('#content');
  if(!s){host.innerHTML='';return;}
  if(s.number>1&&!E.complete(state.sessions[D.sessions[s.number-2].id])){host.innerHTML=`<section class="panel"><h2>Finish Session ${s.number-1} first</h2><a href="?session=mixed-${s.number-1}">Return to the earlier session →</a></section>`;return;}
  const r=state.sessions[sid],st=E.stats(r,sid),total=s.questions.length,done=E.complete(r),rt=retryStats(s,r),n=done?st.answered:answeredCount(s,r),conflicts=Object.values(r?.conflicts||{}).some(a=>a.length);
  host.innerHTML=`<section class="panel session-intro"><h2>${s.title} · Mixed skill check</h2>
   <p>${done?'Your first-try results are ready. Try each missed question once more, then review the methods together.':`Answer all ${total} questions using paper for your working. You can change your choices until you submit the whole set.`}</p>
   <p class="muted">${done?'Retries and reviewing mistakes do not change the first-try score.':`Right and wrong marks appear only after you submit all ${total} answers. Your score uses those first submitted answers. Then you get one second try for each mistake.`}</p>
   <p class="muted">Selections and retry practice save on this device. Submitted first answers and method notes sync across devices.</p>
   ${!done&&st.answered?'<p class="muted">Your earlier submitted first answers are already saved and locked. Finish the remaining questions to see this set’s results.</p>':''}
   ${conflicts?'<p class="conflict-note">Two devices saved different answers to a question. The first online answer is kept for scoring; the other record is included in the download.</p>':''}
  </section>
  ${done?`<section class="panel" id="session-result" tabindex="-1"><h2>${s.title} results</h2><strong class="result-number">${st.correct}/${total}</strong><p>First answers · ${st.wrong} to review together</p><p>Each incorrect first answer has one second try. Your score stays ${st.correct}/${total}.</p><p class="retry-summary"><strong>Second tries on this device:</strong> ${rt.corrected} corrected · ${rt.stillWrong} still incorrect · ${rt.remaining} left to retry</p><div class="result-legend" aria-label="Answer colors"><span class="legend-first">Red · First try incorrect</span><span class="legend-corrected">Orange · Corrected on second try</span><span class="legend-retry">Dark red · Second try incorrect</span></div><div class="score-grid">${D.skills.map(skill=>{const qs=s.questions.filter(q=>q.skill===skill.id),n=qs.filter(q=>r.answers[q.id].correct).length;return `<div class="score-tile"><strong>${n}/${qs.length}</strong><span>${esc(skill.name)}</span></div>`;}).join('')}</div>${s.number<D.sessions.length?`<a class="secondary" href="?session=mixed-${s.number+1}">Next fresh session →</a><p class="muted">Review today’s mistakes first. Try the next session on another day.</p>`:`<p>All ${D.sessions.length} checks are finished. Review the eight-skill report below before planning the next STAR test.</p>`}</section>`:''}
  <div class="toolbar"><p id="answered-count">${n}/${total} answers ${done?'submitted':'selected'}</p><button id="large-text" aria-pressed="${document.body.classList.contains('large-text')}">Larger text</button>${done?`<button id="wrong-only" aria-pressed="${onlyWrong}">First-try mistakes (${st.wrong})</button><label>Skill <select id="skill-filter"><option value="all">All eight skills</option>${D.skills.map(k=>`<option value="${k.id}" ${filter===k.id?'selected':''}>${esc(k.name)}</option>`).join('')}</select></label>`:''}</div>
  <div class="progressbar" role="progressbar" aria-label="${done?'Submitted answers':'Selected answers'}" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${total}"><span style="width:${n/total*100}%"></span></div>
  <nav class="jump" aria-label="Jump to a question">${s.questions.map((q,i)=>`<a href="#${q.id}" class="${r?.answers[q.id]||!done&&drafts.has(q.id)?'saved':''} ${done?answerStatus(q,r,done):''}">${i+1}</a>`).join('')}</nav>
  <div id="questions">${s.questions.map((q,i)=>questionCard(q,i,r,done)).join('')}</div>
  <p id="no-questions" class="empty" hidden>No questions match this filter.</p>
  ${done?'':`<form id="set-submission" class="panel"><h2>Ready to check your set?</h2><p id="submit-progress" role="status" aria-live="polite">${n===total?`All ${total} answers are selected. You can still change your choices before submitting.`:`Answer all ${total} questions before submitting. ${total-n} left.`}</p><button id="submit-set" type="submit" class="primary" ${n===total?'':'disabled'}>Submit all ${total} answers</button><p class="muted">This saves your first-try score and shows which answers are right or wrong. You then have one more try for each mistake.</p></form>`}`;
  document.querySelector('#large-text').onclick=e=>{const large=document.body.classList.toggle('large-text');e.currentTarget.setAttribute('aria-pressed',String(large));};
  if(done){document.querySelector('#wrong-only').onclick=e=>{onlyWrong=!onlyWrong;e.currentTarget.setAttribute('aria-pressed',String(onlyWrong));applyFilter();};document.querySelector('#skill-filter').onchange=e=>{filter=e.target.value;applyFilter();};applyFilter();}
 }
 function applyFilter(){const cards=[...document.querySelectorAll('.question')];for(const q of cards)q.hidden=(filter!=='all'&&q.dataset.skill!==filter)||(onlyWrong&&q.dataset.wrong!=='true');document.querySelector('#no-questions').hidden=cards.some(q=>!q.hidden);}
 document.querySelector('#content').addEventListener('change',e=>{
  const sid=selected(),qid=e.target.closest('form')?.dataset.question,s=E.session(sid),r=state.sessions[sid];
  if(e.target.type==='radio'&&s&&qid){
   const q=s.questions.find(q=>q.id===qid),choice=Number(e.target.value);if(!q||!Number.isInteger(choice)||choice<0||choice>=q.choices.length)return;
   if(E.complete(r)){retryDrafts.set(qid,choice);const button=e.target.closest('form').querySelector('button');if(button)button.disabled=false;}
   else if(!r?.answers[qid]){drafts.set(qid,choice);saveDrafts();updateProgress(s,r);}
  }
  if(e.target.matches('[data-note]')){if(!state.sessions[sid]&&!E.start(state,sid))return;state.sessions[sid].notes[e.target.dataset.note]={text:e.target.value,at:new Date().toISOString()};save(false);}
  if(e.target.matches('[data-reviewed]')&&e.target.checked&&E.complete(r)){r.reviewed[e.target.dataset.reviewed]=new Date().toISOString();save();}
 });
 document.querySelector('#content').addEventListener('submit',e=>{
  e.preventDefault();const sid=selected(),s=E.session(sid);if(!s)return;
  if(e.target.id==='set-submission'){
   const choices=Object.fromEntries(s.questions.filter(q=>!state.sessions[sid]?.answers[q.id]).map(q=>[q.id,drafts.get(q.id)]));
   if(!E.submitSet(state,sid,choices))return;
   for(const q of s.questions)drafts.delete(q.id);saveDrafts();save();
   const result=document.querySelector('#session-result');result?.focus({preventScroll:true});result?.scrollIntoView({block:'start'});return;
  }
  const qid=e.target.dataset.question,q=s.questions.find(q=>q.id===qid),first=state.sessions[sid]?.answers[qid];
  if(!E.complete(state.sessions[sid])||!q||!first||!saveRetry(q,first,retryDrafts.get(qid)))return;
  retryDrafts.delete(qid);render();focusFeedback(qid);
 });
 document.querySelector('#download').onclick=()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),course:D,state,pendingSelections:Object.fromEntries(drafts),retryPractice:retryRecords,report:E.report(state)},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='harry-eight-skill-math-record.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 render();
 if(local||demo){document.querySelector('#save-note').textContent='Preview · Progress saves only in this browser.';}else{
  sync=root.HarrySkillSync.create({getState:()=>state,onRemote(next){state=next;try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}render();},onStatus(kind,message){const el=document.querySelector('#save-note');el.dataset.status=kind;el.textContent=storageOK?message:'Browser saving is unavailable. Download the practice record before closing.';}});void sync.start();
 }
})(window);
