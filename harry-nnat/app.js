(() => {
  'use strict';
  const course=window.NNAT_COURSE,core=window.NNATCore,app=document.querySelector('#app'),KEY='harry-nnat-2026-11-07-v1';
  const demo=new URLSearchParams(location.search).has('demo'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const now=()=>new Date().toISOString(),byId=id=>course.questions.find(q=>q.id===id),group=q=>course.groups.find(g=>g.id===q.type);
  const modes=[...course.groups.map(g=>g.id),'mixed','warmup'];
  const title=id=>course.groups.find(g=>g.id===id)?.name||({mixed:'Mixed challenge',warmup:'Warm-up sampler'})[id]||'Practice';
  let state={version:1,articles:{}},mode=null,run=null,review=false,sync=null,screen='home';
  try{if(!demo){const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.version===1)state=NNATSync.normalize(saved);}}catch{}
  const runs=id=>state.articles[id]||[],latest=id=>runs(id).at(-1),stat=()=>core.scores(course,run);
  const dates=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
  const date=at=>Number.isFinite(Date.parse(at))?dates.format(new Date(at)):'Time not recorded';
  const time=r=>r?.completedAt?`<p class="completion">Finished <time datetime="${esc(r.completedAt)}">${esc(date(r.completedAt))}</time></p>`:'';
  function save(){
    if(demo)return;
    try{localStorage.setItem(KEY,JSON.stringify(state));document.querySelector('#save-status').textContent='Saved on this device';sync?.queue();}
    catch{document.querySelector('#save-status').textContent='Storage unavailable · export a backup';}
  }
  function start(id,fresh=false){
    mode=id;review=false;run=fresh?null:latest(id);
    if(!run){let questionIds=core.ids(course,id);if(id==='mixed')for(let i=questionIds.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[questionIds[i],questionIds[j]]=[questionIds[j],questionIds[i]];}
      run={id:crypto.randomUUID(),questionIds,startedAt:now(),position:0,completedAt:null,answers:{},drafts:{}};(state.articles[id]??=[]).push(run);save();}
    if(stat().resolved===stat().total)summary();else workspace();window.scrollTo(0,0);
  }
  function card(id,label,description){const r=latest(id),s=core.scores(course,r),total=core.ids(course,id).length,done=r&&s.resolved===total;
    return `<article class="set-card ${done?'done':''}"><div class="set-icon" aria-hidden="true">${({pattern:'▦',analogy:'↔',serial:'⋯',spatial:'◈',mixed:'24',warmup:'8'})[id]}</div><p class="eyebrow">${label}</p><h2>${esc(title(id))}</h2><p>${esc(description)}</p>${r?`<p class="set-score">${done?'✓ Finished':`${s.resolved}/${total} checked`} · First try <strong>${s.first}/${total}</strong></p>${time(r)}`:''}<button class="primary" data-start="${id}">${done?'Review results':r?'Continue':'Start'} <span>→</span></button></article>`;}
  function home(){mode=null;run=null;review=false;screen='home';document.body.classList.remove('practising');
    app.innerHTML=`<section class="intro"><p class="eyebrow">Look closely. Test every rule.</p><h1>Harry’s NNAT<br>practice</h1><p>Eight warm-ups. Twenty-four carefully chosen challenges.</p><div class="intro-actions"><button class="primary" data-start="mixed">Mixed challenge · 24 questions →</button><button class="secondary" data-start="warmup">Warm up · 8 questions</button></div></section><section class="set-grid" aria-label="Four NNAT question types">${course.groups.map(g=>card(g.id,'2 warm-ups + 6 challenges',g.description)).join('')}</section><p class="home-note">Choose a picture, then check. A missed answer gets one more try before the explanation appears. Your first-try score stays separate from retries.</p><details class="parent-selection"><summary>Parent: why these questions?</summary><p>The 24 challenges are roughly 20% of the 120-item bank, balanced across the four types. Selection is based on rule count, visual detail, and easily confused alternatives; no official difficulty statistics were available.</p>${course.groups.map(g=>`<h3>${esc(g.name)}</h3><p>ZOZECK section question numbers. <a href="${esc(g.sourceUrl)}" target="_blank" rel="noopener">Open original section ↗</a></p><ul>${g.questionIds.map(id=>byId(id)).map(q=>`<li><strong>#${q.sourceNumber} · ${q.level==='challenge'?'Challenge':q.level==='easy'?'Easy warm-up':'Medium warm-up'}</strong> — ${esc(q.rationale)}</li>`).join('')}</ul>`).join('')}</details><details class="history"><summary>Practice history</summary><div>${history()}</div></details><button class="quiet" id="export">Export progress</button>`;
    bindStarts();app.querySelectorAll('[data-history]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;run=runs(mode).find(r=>r.id===b.dataset.history);summary();window.scrollTo(0,0);});app.querySelector('#export').onclick=exportProgress;
  }
  function bindStarts(){app.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start(b.dataset.start));}
  function history(){const rows=modes.flatMap(id=>runs(id).map(r=>({id,r}))).sort((a,b)=>Date.parse(b.r.startedAt)-Date.parse(a.r.startedAt));
    if(!rows.length)return '<p>No practice checks yet.</p>';
    return rows.map(({id,r})=>{const s=core.scores(course,r);return `<article class="history-row"><div><h3>${esc(title(id))}</h3><p>Started ${esc(date(r.startedAt))} · First try ${s.first}/${s.total}</p>${time(r)}</div><button class="secondary" data-history="${esc(r.id)}" data-mode="${id}">Review</button></article>`;}).join('');
  }
  function questionCard(q,index,total){
    const aa=core.attempts(q,run),locked=review||core.resolved(q,run),draft=run.drafts?.[q.id]?.choice??null,last=aa.at(-1),selected=locked?last?.choice:draft;
    return `<article class="question-card" id="question-${esc(q.id)}" data-question="${esc(q.id)}">
      <div class="question-head"><div><p class="eyebrow">${q.level==='challenge'?'Challenge':q.level==='easy'?'Easy warm-up':'Medium warm-up'}</p><h2>Question ${index+1} <span>of ${total}</span></h2><p class="source-ref">${esc(group(q).name)} · ZOZECK drill #${q.sourceNumber}</p></div></div>
      <div class="practice-layout">
        <section class="diagram-panel" aria-label="Question ${index+1} diagram"><div class="panel-bar"><h3>Find the missing picture</h3><button class="quiet enlarge" type="button">Enlarge ↗</button></div><img class="main-diagram" loading="${index?'lazy':'eager'}" decoding="async" src="${q.figures[0]}" alt="${esc(group(q).name)} question ${q.sourceNumber}: choose the picture that completes the diagram.">${q.numberedOptions?'<p class="small">The five choices in the picture are numbered 1–5.</p>':''}</section>
        <section class="answer-panel" aria-labelledby="answer-heading-${esc(q.id)}"><p class="eyebrow">${review?'Saved answer':locked?'Checked':aa.length?'Second try':'First try'}</p><h3 id="answer-heading-${esc(q.id)}">Choose your answer</h3>
          <form class="answer-form"><fieldset ${locked?'disabled':''}><legend class="sr-only">Five answer choices for question ${index+1}</legend><div class="choices ${q.figures.length>1?'picture-choices':'number-choices'}">${Array.from({length:5},(_,i)=>{const checked=aa.some(a=>a.choice===i),mark=checked?(i===q.answer?'correct':'incorrect'):'';return `<label class="choice ${mark}"><input type="radio" name="answer-${esc(q.id)}" value="${i}" ${selected===i?'checked':''}><strong>${'ABCDE'[i]}</strong>${q.figures.length>1?`<img loading="lazy" decoding="async" src="${q.figures[i+1]}" alt="Choice ${'ABCDE'[i]}">`:`<span>Picture ${i+1}</span>`}${mark?`<span class="sr-only">Checked answer: ${mark}</span>`:''}</label>`;}).join('')}</div></fieldset>${!locked?`<button class="primary check-answer" ${Number.isInteger(selected)?'':'disabled'}>Check ${aa.length?'second':'first'} try</button>`:''}</form>
          ${last?`<div class="feedback ${last.choice===q.answer?'correct':'incorrect'}" role="status"><strong>${last.choice===q.answer?'Correct.':core.resolved(q,run)?'Not quite. Let’s review the rule.':'Not quite. Look again and try once more.'}</strong><p>${last.choice===q.answer?'Your answer is saved.':core.resolved(q,run)?`The correct answer is ${'ABCDE'[q.answer]}${q.numberedOptions?` · Picture ${q.answer+1}`:''}.`:'Check every part of the pattern before choosing again.'}</p></div>`:''}
          ${core.resolved(q,run)?`<details class="explanation"><summary>Show explanation</summary><h3>${esc(q.title)}</h3><p>${esc(q.explanation)}</p></details>`:''}
        </section>
      </div>
    </article>`;
  }
  function updateProgress(){
    const s=stat();app.querySelector('[data-progress]').textContent=`${s.resolved}/${s.total}`;
    const button=app.querySelector('#session-results');button.disabled=!review&&s.resolved!==s.total;button.textContent=review?'Back to results':'See results';
  }
  function bindQuestion(node,q,index,total){
    node.querySelectorAll('input[type="radio"]').forEach(input=>input.onchange=()=>{
      if(review||core.resolved(q,run))return;
      (run.drafts??={})[q.id]={choice:Number(input.value),updatedAt:now()};run.position=index;run.updatedAt=now();save();node.querySelector('.check-answer').disabled=false;
    });
    node.querySelector('.answer-form').onsubmit=e=>{
      e.preventDefault();if(review||core.resolved(q,run))return;
      const choice=Number(node.querySelector('input:checked')?.value??NaN);
      if(core.check(course,run,q,choice,now())){
        run.position=index;save();const scrollY=window.scrollY;
        node.outerHTML=questionCard(q,index,total);const replacement=app.querySelector(`[data-question="${q.id}"]`);bindQuestion(replacement,q,index,total);updateProgress();window.scrollTo(0,scrollY);
      }
    };
    node.querySelector('.enlarge').onclick=()=>{
      document.querySelector('#large-diagram').innerHTML=`<img src="${q.figures[0]}" alt="Enlarged question ${index+1} diagram">`;document.querySelector('#diagram-dialog').showModal();
    };
  }
  function scrollToQuestion(index){
    const q=core.questions(course,run)[index];if(q)app.querySelector(`[data-question="${q.id}"]`)?.scrollIntoView({block:'start'});
  }
  function workspace(){
    screen='workspace';const qs=core.questions(course,run);if(!qs.length){home();return;}
    const open=new Set(Array.from(app.querySelectorAll('.question-card .explanation[open]')).map(el=>el.closest('[data-question]').dataset.question));
    const active=document.activeElement,focus=active?.matches('input[type="radio"]')?{id:active.closest('[data-question]')?.dataset.question,value:active.value}:null;
    document.body.classList.add('practising');
    app.innerHTML=`<div class="session-head"><div><p class="eyebrow">All ${qs.length} questions</p><h1>${esc(title(mode))}</h1></div><div class="question-progress"><strong data-progress>${stat().resolved}/${qs.length}</strong><span>checked</span></div></div><section class="question-list" aria-label="${esc(title(mode))} questions">${qs.map((q,index)=>questionCard(q,index,qs.length)).join('')}</section><div class="session-actions"><button class="primary" id="session-results">See results</button></div>`;
    qs.forEach((q,index)=>bindQuestion(app.querySelector(`[data-question="${q.id}"]`),q,index,qs.length));updateProgress();
    for(const id of open){const details=app.querySelector(`[data-question="${id}"] .explanation`);if(details)details.open=true;}
    if(focus)app.querySelector(`[data-question="${focus.id}"] input[value="${focus.value}"]`)?.focus({preventScroll:true});
    app.querySelector('#session-results').onclick=()=>{summary();window.scrollTo(0,0);};
  }
  function summary(){review=true;screen='summary';document.body.classList.remove('practising');const s=stat(),qs=core.questions(course,run),done=s.resolved===s.total;
    app.innerHTML=`<section class="results"><p class="eyebrow">${esc(title(mode))}</p><h1>${done?'Practice finished':'Saved practice'}</h1>${time(run)}<div class="score"><strong>${s.first}<span>/${s.total}</span></strong><p>correct on the first try</p></div><p>${s.resolved} of ${s.total} questions checked. Retries do not raise the first-try score.</p><div class="result-actions"><button class="primary" id="resume">${done?'Review questions':'Continue practice'} →</button>${done?'<button class="secondary" id="fresh">Start a fresh practice</button>':''}</div><h2>Your questions</h2><div class="result-list">${qs.map((q,i)=>{const aa=core.attempts(q,run),first=aa[0];return `<button class="result-row" data-review="${i}"><span>${i+1}. ${esc(group(q).name)} #${q.sourceNumber}<small>${q.level==='challenge'?'Challenge':'Warm-up'}</small></span><strong class="${first?first.choice===q.answer?'correct':'incorrect':''}">${first?first.choice===q.answer?'✓ First try':'First try missed':'Not checked'}</strong></button>`;}).join('')}</div></section>`;
    app.querySelector('#resume').onclick=()=>{review=done;run.position=done?0:Math.max(0,qs.findIndex(q=>!core.resolved(q,run)));workspace();scrollToQuestion(run.position);};
    if(done)app.querySelector('#fresh').onclick=()=>start(mode,true);
    app.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>{review=true;run.position=Number(b.dataset.review);workspace();scrollToQuestion(run.position);});
  }
  function exportProgress(){const blob=new Blob([JSON.stringify({...state,exportedAt:now()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='harry-nnat-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  document.querySelector('#all-sets').onclick=()=>{home();window.scrollTo(0,0);};document.querySelector('#close-diagram').onclick=()=>document.querySelector('#diagram-dialog').close();
  home();const syncButton=document.querySelector('#sync-now');
  if(demo||location.hostname!=='shangguanyun08.github.io'){syncButton.hidden=true;if(demo)document.querySelector('#save-status').textContent='Preview · no progress saved';}
  else{
    let deviceId;try{deviceId=localStorage.getItem(KEY+':device')||crypto.randomUUID();localStorage.setItem(KEY+':device',deviceId);}catch{deviceId=crypto.randomUUID();}
    sync=NNATSync.create({deviceId,getState:()=>{try{return NNATSync.merge(state,JSON.parse(localStorage.getItem(KEY)||'null'));}catch{return state;}},onStatus:message=>document.querySelector('#save-status').textContent=message,applyState:merged=>{
      if(NNATSync.stable(merged)===NNATSync.stable(state))return;const previous=run;state=merged;localStorage.setItem(KEY,JSON.stringify(state));
      if(mode&&previous){run=runs(mode).find(r=>(r.syncRoot||r.id)===(previous.syncRoot||previous.id)&&NNATSync.compatible(previous,r)&&NNATSync.compatible(r,previous));if(run){if(screen==='summary')summary();else workspace();}else home();}else home();
    }});syncButton.onclick=()=>sync.sync();window.addEventListener('online',()=>sync.sync());window.addEventListener('focus',()=>sync.sync());window.addEventListener('storage',e=>{if(e.key===KEY)sync.sync();});document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync.sync();});setInterval(()=>{if(!document.hidden)sync.sync();},30000);sync.sync();
  }
})();
