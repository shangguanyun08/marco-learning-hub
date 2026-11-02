(() => {
  'use strict';
  const articles=[...window.READING_ARTICLES.filter(a=>a.kind!=='parallel'),...window.READING_ARTICLES.filter(a=>a.kind==='parallel').sort((a,b)=>a.referenceLexile-b.referenceLexile)],core=window.ReadingCore,app=document.querySelector('#app');
  const activeArticles=articles.filter(a=>!a.retired),practiceArticles=activeArticles.filter(a=>a.kind==='parallel');
  const key='harry-reading-readtheory-2026-10-21-v1',demo=new URLSearchParams(location.search).has('demo');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state={version:1,articles:{}},article=null,run=null,pending=[],reviewMode=false,reviewIndex=0,reviewAttempt=0,largeArticle=false,sync=null;
  try{if(!demo){const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.version===1&&saved.articles&&typeof saved.articles==='object')state=saved;}}
  catch{document.querySelector('#save-status').textContent='Progress could not be loaded';}
  for(const a of articles)for(const r of state.articles[a.id]||[])core.prepareRun(a,r);
  const now=()=>new Date().toISOString(),runs=a=>state.articles[a.id]||[],latest=a=>runs(a).at(-1);
  const currentQ=()=>article.questions[reviewMode?reviewIndex:run.position||0],attempts=q=>run.answers[q.id]||[];
  const draft=()=>run.drafts[currentQ().id],isResolved=()=>core.resolved(attempts(currentQ()));
  const completed=(a,r)=>core.finished(a,r)===a.questions.length;
  const levelLabel=a=>a.lexile?`Lexile ${a.lexile}L`:`Reference Lexile ${a.referenceLexile}L`;
  const questionLabel=(a,q)=>`${a.sourceQuiz?'Original question':'Question'} ${q.number}`;
  const dateFormat=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
  function renderFinishedAt(a,r,tag='p'){
    if(core.answered(a,r)!==a.questions.length)return '';
    const at=core.finishedAt(a,r);
    return `<${tag} class="completion-time">Finished ${at?`<time datetime="${at}">${esc(dateFormat.format(new Date(at)))}</time>`:'· time not recorded'}</${tag}>`;
  }
  function save(){
    if(demo){document.querySelector('#save-status').textContent='Preview · no records saved';return;}
    try{localStorage.setItem(key,JSON.stringify(state));document.querySelector('#save-status').textContent='Saved on this device';sync?.queue();}
    catch{const status=document.querySelector('#save-status');status.classList.add('storage-error');status.textContent='Storage unavailable · export your progress';}
  }
  function saveDraft(){draft().updatedAt=now();run.updatedAt=draft().updatedAt;save();}
  function newRun(a){
    const r=core.prepareRun(a,{id:crypto.randomUUID(),startedAt:now(),position:0,completedAt:null,answers:{},drafts:{}});
    (state.articles[a.id]??=[]).push(r);return r;
  }
  function openArticle(id,fresh=false){
    reviewMode=false;
    article=articles.find(a=>a.id===id);run=fresh?newRun(article):(latest(article)||newRun(article));core.prepareRun(article,run);pending=[];save();
    if(completed(article,run))renderSummary();else renderWorkspace();window.scrollTo(0,0);
  }
  function home(){
    article=null;run=null;pending=[];reviewMode=false;document.body.classList.remove('active-session');
    app.innerHTML=`<section class="intro"><p class="eyebrow">Read it again. Find the proof.</p><h1>Harry’s reading<br>practice</h1></section>
      <section class="cards" aria-label="Recent article redo sessions">${renderCards(activeArticles.filter(a=>a.kind!=='parallel'))}</section>
      <section class="practice-group" aria-labelledby="lexile-heading"><div class="practice-group-head"><h2 id="lexile-heading">Reading by Lexile</h2><span>${practiceArticles.length} articles · ${practiceArticles.reduce((n,a)=>n+a.questions.length,0)} multiple-choice questions</span></div><p class="meta">The Lexile labels below belong to the ReadTheory reference samples. These are original parallel passages, and their own Lexile scores have not been measured.</p><div class="cards" aria-label="Reading sessions in reference Lexile order">${renderCards(practiceArticles)}</div></section>
      <p class="home-note"><strong>Finished means every question has an answer.</strong> The first-try score shows how many original answers were correct; retries do not raise it. Second tries are not needed for the finished status. Choose an answer and highlight supporting text before checking. Only your answer is marked right or wrong; highlights are saved, not graded. Tap sentences or select words to highlight them. Wrong answers get one second try. After checking, use “Show answer and explanation” for a parent review.</p>
      <details class="history"><summary>Practice history & progress</summary><div class="history-list">${renderHistory()}</div><button class="secondary" id="export">Export progress</button><p class="meta">Records automatically upload and sync across devices. Open this page on the original device once to upload earlier work. Export a backup any time.</p></details>`;
    app.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openArticle(b.dataset.open));app.querySelector('#export').onclick=exportProgress;
    app.querySelectorAll('[data-history-review]').forEach(b=>b.onclick=()=>{
      article=articles.find(a=>a.id===b.dataset.historyReview);run=runs(article)[Number(b.dataset.run)];pending=[];
      renderSummary();window.scrollTo(0,0);
    });
  }
  function renderCards(list){
    return list.map(a=>{
      const i=activeArticles.indexOf(a),r=latest(a),score=core.scores(a,r),checked=core.answered(a,r),done=checked===score.total;
      const percent=Math.round(score.firstAnswers/score.total*1000)/10;
      return `<article class="card ${done?'done':''}"><div class="card-topline"><p class="eyebrow">Session ${i+1} · ${a.questions.length} ${a.kind==='parallel'?'questions':'questions to redo'}</p>${done?'<span class="completion-badge">✓ Finished</span>':''}</div><h2>${esc(a.title)}</h2><p class="lexile">${esc(levelLabel(a))}</p>${a.referenceTitle?`<p class="reference-title">Parallel to “${esc(a.referenceTitle)}”</p>`:''}${done?`<div class="card-result" aria-label="First-try score: ${score.firstAnswers} of ${score.total}, ${percent} percent"><div><span class="score-label">First try</span><strong class="first-try-percent">${percent}<span>%</span></strong></div><span class="first-try-count"><b>${score.firstAnswers}/${score.total}</b> correct</span></div>`:''}${renderFinishedAt(a,r)}<p class="card-progress${done?' sr-only':''}">${r?`${checked} of ${score.total} questions answered · ${score.mastered} answers correct`:'Choose an answer and highlight supporting text. Highlights are not graded.'}</p><button class="primary" data-open="${a.id}">${done?'Review practice':r?'Continue practice':'Start practice'} →</button></article>`;
    }).join('');
  }
  function renderHistory(){
    const records=articles.flatMap(a=>runs(a).map((r,i)=>({a,r,i})));
    if(!records.length)return '<p class="empty">No checks yet. Start a practice session above.</p>';
    return records.map(({a,r,i})=>{
      const score=core.scores(a,r),date=new Date(r.startedAt).toLocaleString();
      return `<details class="history-record"><summary>${esc(a.title)} · ${a.retired?'Archived · ':''}Practice ${i+1} · ${core.answered(a,r)}/${score.total} answered${renderFinishedAt(a,r,'span')}</summary><p class="meta">Started ${esc(date)} · First answers: ${score.firstAnswers}/${score.total} · Highlights added on first try: ${score.firstHighlights}/${score.total} (not graded)</p>${a.questions.map(q=>{
        const aa=r.answers[q.id]||[];
        if(!aa.length)return `<p class="meta">${questionLabel(a,q)}: not checked yet.</p>`;
        return `<div><p><strong>${questionLabel(a,q)}</strong> · ${esc(q.prompt)}</p>${aa.map((at,n)=>`<p class="meta">Try ${n+1}: ${esc(q.choices[at.choice])} · Answer ${at.answerOK?'correct':'incorrect'} · ${core.quoteMarks(a,at.marks||[]).length?'Highlight saved':'No highlight recorded'} (not graded)</p>${core.quoteMarks(a,at.marks||[]).map(m=>`<blockquote>${esc(m.quote)}</blockquote>`).join('')}`).join('')}${core.resolved(aa)?renderAnswerReview(q,`history-${a.id}-${i}-${q.id}`):''}</div>`;
      }).join('')}<button class="secondary" data-history-review="${a.id}" data-run="${i}">Review with article</button></details>`;
    }).join('');
  }
  function exportProgress(){
    const exported={...state,exportedAt:now(),course:'Harry reading · recent articles and Lexile practice',articleTitles:Object.fromEntries(articles.map(a=>[a.id,a.title]))};
    const blob=new Blob([JSON.stringify(exported,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='harry-reading-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function renderWorkspace(focus=false){
    pending=[];document.body.classList.add('active-session');
    const q=currentQ(),done=reviewMode||isResolved(),at=reviewMode?attempts(q)[reviewAttempt]:attempts(q).at(-1),marks=done?at?.marks||[]:draft().marks;
    const tryNumber=attempts(q).length+1;
    app.innerHTML=`<div class="workspace-head"><div><h1>${esc(article.title)}</h1><p class="meta">${article.retired?'Archived practice':`Session ${activeArticles.indexOf(article)+1}`} · Question ${(reviewMode?reviewIndex:run.position||0)+1} of ${article.questions.length}${article.sourceQuiz?` · Original question ${q.number}`:''} · ${esc(levelLabel(article))}${reviewMode?` · Practice ${runs(article).indexOf(run)+1} · ${completed(article,run)?'Complete':'In progress'} · First answers: ${core.scores(article,run).firstAnswers}/${article.questions.length}`:''}</p>${renderFinishedAt(article,run)}</div>${reviewMode?`<nav class="review-navigation" aria-label="Review questions"><button class="secondary" id="review-prev" ${reviewIndex===0?'disabled':''}>← Previous</button><label>Question <select id="review-question">${article.questions.map((item,i)=>`<option value="${i}" ${i===reviewIndex?'selected':''}>${i+1}</option>`).join('')}</select></label><button class="secondary" id="review-next" ${reviewIndex===article.questions.length-1?'disabled':''}>Next →</button></nav>`:''}</div>
      <div class="reading-layout practice-layout"><section class="passage-panel" aria-labelledby="passage-heading"><div class="passage-tools"><h2 id="passage-heading">Article</h2><button class="quiet" id="article-size">${largeArticle?'Fit article':'Larger text'}</button></div><p class="instructions">${done?'Saved highlights · not graded':'Tap a sentence or select words to highlight supporting text.'}</p><div class="passage" id="passage" tabindex="0" aria-label="Article text">${renderPassage(marks,!done)}</div></section>
      <section class="question-panel" aria-labelledby="question-title"><p class="eyebrow">${reviewMode?'Saved answer · review':done?'Checked':tryNumber===1?'First try':'Second try'}</p>${reviewMode&&attempts(q).length?`<div class="attempt-tabs" aria-label="Saved attempts">${attempts(q).map((a,i)=>`<button class="secondary ${a.answerOK?'is-correct':'is-incorrect'}" data-attempt="${i}" aria-pressed="${i===reviewAttempt}">Try ${i+1} · ${a.answerOK?'correct':'incorrect'}</button>`).join('')}</div>`:''}<h2 id="question-title" tabindex="-1">${esc(q.prompt)}</h2><div id="question-body">${done?at?renderFeedback(q,at):`${renderChoices(q,null,true)}<p class="meta">Not checked yet.</p>`:renderForm(q,at)}</div>${reviewMode&&!article.retired?`<div class="actions"><button class="quiet" id="fresh-run">Practice this article again</button></div>`:''}</section></div>
      ${!done?`<div class="mobile-dock"><button class="select-action" id="mobile-add" hidden>Highlight selection</button><button class="primary" id="mobile-check" ${canCheck()?'':'disabled'}>Check ${tryNumber===1?'first':'second'} try</button></div>`:''}`;
    if(reviewMode){
      const show=i=>{reviewIndex=i;reviewAttempt=0;renderWorkspace();};
      app.querySelector('#review-prev').onclick=()=>show(reviewIndex-1);app.querySelector('#review-next').onclick=()=>show(reviewIndex+1);
      app.querySelector('#review-question').onchange=e=>show(Number(e.target.value));
      app.querySelectorAll('[data-attempt]').forEach(b=>b.onclick=()=>{reviewAttempt=Number(b.dataset.attempt);renderWorkspace();});
      if(!article.retired)app.querySelector('#fresh-run').onclick=()=>openArticle(article.id,true);
    }else if(done){app.querySelector('#next').onclick=nextQuestion;}
    else bindEditing();
    app.querySelector('#article-size').onclick=()=>{largeArticle=!largeArticle;app.querySelector('#article-size').textContent=largeArticle?'Fit article':'Larger text';fitArticle();};fitArticle();
    if(focus)app.querySelector('#question-title').focus({preventScroll:true});
  }
  function fitArticle(){
    const panel=app.querySelector('.practice-layout .passage-panel'),text=app.querySelector('#passage'),question=app.querySelector('.question-panel');if(!panel||!text)return;
    if(innerWidth>760){const height=Math.max(280,innerHeight-panel.getBoundingClientRect().top-scrollY-16);panel.style.height=question.style.height=height+'px';}else{panel.style.height='42dvh';question.style.height='auto';}
    text.style.fontSize=(largeArticle?22:21)+'px';
    if(!largeArticle&&text.clientHeight>0)for(let size=20;text.scrollHeight>text.clientHeight+2&&size>=17;size--)text.style.fontSize=size+'px';
  }
  window.addEventListener('resize',fitArticle);
  function renderChoices(q,choice,locked=false,checked=null){return `<fieldset class="answer-choices"><legend class="sr-only">Answer choices</legend>${q.choices.map((c,i)=>{const result=checked?.checkedAt&&typeof checked.answerOK==='boolean'&&checked.choice===i?(checked.answerOK?'correct':'incorrect'):'';return `<label class="choice${result?' answer-'+result:''}"${result?` data-answer-status="${result}"`:''}><input type="radio" name="answer" value="${i}" ${choice===i?'checked':''} ${locked?'disabled':''}><strong>${'ABCD'[i]}</strong><span>${esc(c)}</span>${result?`<span class="sr-only">Checked answer: ${result}.</span>`:''}</label>`;}).join('')}</fieldset>`;}
  function renderPassage(marks=[],interactive=false){
    return core.sentences(article).map((ss,p)=>`${article.sectionTitles?.[p]?`<h3>${esc(article.sectionTitles[p])}</h3>`:''}<p><span class="para-num" aria-hidden="true">${p+1}</span>${ss.map(s=>{
      const ranges=marks.filter(m=>m.sid===s.id).sort((a,b)=>a.start-b.start),merged=[];
      for(const r of ranges){const prev=merged.at(-1);if(prev&&r.start<=prev.end)prev.end=Math.max(prev.end,r.end);else merged.push({start:r.start,end:r.end});}
      let end=0,html='';for(const m of merged){html+=esc(s.text.slice(end,m.start))+`<mark>${esc(s.text.slice(m.start,m.end))}</mark>`;end=m.end;}html+=esc(s.text.slice(end));
      return `<span class="sentence ${interactive?'selectable':''}" data-sid="${s.id}" ${interactive?`role="button" tabindex="0" aria-pressed="${ranges.length>0}" aria-label="Highlight sentence: ${esc(s.text.trim())}"`:''}>${html}</span>`;
    }).join('')}</p>`).join('');
  }
  function renderFirstFeedback(at){
    if(!at)return '';
    return `<div class="feedback needs-work" role="status"><h3>Try once more.</h3><p><strong>Answer: incorrect.</strong></p><p>Your highlight is saved, not graded. Choose your answer for the second try. You may also change your highlights.</p></div>`;
  }
  function renderForm(q,previous){
    const d=draft(),tryNumber=attempts(q).length+1;
    return `${renderFirstFeedback(previous)}<form id="answer-form">${renderChoices(q,d.choice,false,previous)}<button class="select-action" id="highlight-selection" type="button" hidden>Highlight selected words</button><p class="selected-preview" id="selected-preview"></p><ul class="evidence-list" id="evidence-list">${renderEvidence(d.marks)}</ul><div class="actions"><button class="primary" id="check" ${canCheck()?'':'disabled'}>Check ${tryNumber===1?'first':'second'} try</button><button class="quiet" type="button" id="clear-marks" ${d.marks.length?'':'disabled'}>Clear highlights</button></div><p class="meta">Choose an answer and add a highlight before checking.</p></form>`;
  }
  function renderFeedback(q,at){
    return `${renderChoices(q,at.choice,true,at)}<div class="feedback ${at.answerOK?'':'needs-work'}" role="status"><h3>Answer: ${at.answerOK?'correct':'incorrect'}.</h3><p>Your selected choice and highlights are saved. Highlights are not graded.</p></div>${core.resolved(attempts(q))?renderAnswerReview(q,`review-${q.id}`):''}<details class="saved-highlights"><summary>Saved highlighted text</summary><ul class="evidence-list">${renderEvidence(at.marks||[],false)}</ul></details>${reviewMode?'':`<div class="actions"><button class="primary" id="next">${(run.position||0)===article.questions.length-1?'Review session':'Next question'} →</button></div>`}`;
  }
  function renderAnswerReview(q,id){
    return `<div class="answer-review"><button type="button" class="secondary" data-review="${id}" aria-controls="${id}" aria-expanded="false">Show answer and explanation</button><div class="review-details" id="${id}" hidden><h3>Answer and explanation</h3><p><strong>Correct answer: ${'ABCD'[q.answer]} · ${esc(q.choices[q.answer])}</strong></p><p>${esc(q.explanation)}</p><h3>Suggested supporting text</h3>${q.evidence.map(group=>`<blockquote class="support">${esc(group[0])}</blockquote>`).join('')}<p class="meta">Compare this with Harry’s saved highlights. Other wording or selections may also support the answer; highlights are for a parent to review, not an automatic score.</p></div></div>`;
  }
  app.addEventListener('click',event=>{
    const button=event.target.closest('[data-review]');if(!button)return;
    const panel=document.getElementById(button.dataset.review);panel.hidden=!panel.hidden;
    button.setAttribute('aria-expanded',String(!panel.hidden));button.textContent=panel.hidden?'Show answer and explanation':'Hide answer and explanation';
  });
  function renderEvidence(marks,editable=true){
    const marked=core.quoteMarks(article,marks);
    return marked.length?marked.map((m,i)=>`<li><q>${esc(m.quote)}</q>${editable?`<button type="button" class="remove" data-remove="${i}" aria-label="Remove highlight ${i+1}">×</button>`:''}</li>`).join(''):'<li class="empty">Highlight evidence in the article.</li>';
  }
  function canCheck(){return !isResolved()&&Number.isInteger(draft().choice)&&core.quoteMarks(article,draft().marks).length>0;}
  function updateCheckButtons(){
    app.querySelector('#check').disabled=!canCheck();app.querySelector('#mobile-check').disabled=!canCheck();
    app.querySelector('#clear-marks').disabled=!draft().marks.length;
  }
  function bindEditing(){
    bindPassage();bindEvidenceButtons();
    const form=app.querySelector('#answer-form');
    form.onchange=()=>{const selected=form.querySelector('input:checked');draft().choice=selected?Number(selected.value):null;saveDraft();updateCheckButtons();};
    const check=()=>{
      if(!canCheck())return;
      if(!core.recordCheck(article,currentQ(),run,now()))return;
      run.updatedAt=now();save();renderWorkspace(true);
      if(matchMedia('(max-width:900px)').matches)app.querySelector('.question-panel').scrollIntoView({block:'start'});
    };
    form.onsubmit=e=>{e.preventDefault();check();};app.querySelector('#mobile-check').onclick=check;
    const addSelection=()=>{if(!pending.length)return;draft().marks.push(...pending);pending=[];window.getSelection()?.removeAllRanges();saveDraft();refreshHighlights();};
    app.querySelector('#highlight-selection').onclick=addSelection;app.querySelector('#mobile-add').onclick=addSelection;
    app.querySelector('#clear-marks').onclick=()=>{draft().marks=[];saveDraft();refreshHighlights();};
  }
  function nextQuestion(){
    if((run.position||0)===article.questions.length-1)renderSummary();
    else{run.position=(run.position||0)+1;save();renderWorkspace(true);}
    window.scrollTo(0,0);
  }
  function bindEvidenceButtons(){app.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const d=draft();d.marks=core.quoteMarks(article,d.marks);d.marks.splice(Number(b.dataset.remove),1);saveDraft();refreshHighlights();});}
  function bindPassage(){
    app.querySelectorAll('.sentence.selectable').forEach(el=>{
      const toggle=()=>{
        const selected=window.getSelection();if(selected&&!selected.isCollapsed&&selected.toString().trim())return;
        const d=draft(),sid=el.dataset.sid,existing=d.marks.some(m=>m.sid===sid);
        d.marks=d.marks.filter(m=>m.sid!==sid);
        if(!existing){const s=core.sentences(article).flat().find(s=>s.id===sid);d.marks.push({sid,start:0,end:s.text.length});}
        const keyboardFocus=document.activeElement===el;saveDraft();refreshHighlights(keyboardFocus?sid:null);
      };
      el.onclick=toggle;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.getSelection()?.removeAllRanges();toggle();}};
    });
  }
  function refreshHighlights(focusSid=null){
    pending=[];const d=draft();
    app.querySelector('#passage').innerHTML=renderPassage(d.marks,true);app.querySelector('#evidence-list').innerHTML=renderEvidence(d.marks);
    updateCheckButtons();app.querySelector('#highlight-selection').hidden=true;app.querySelector('#selected-preview').textContent='';app.querySelector('#mobile-add').hidden=true;
    bindPassage();bindEvidenceButtons();if(focusSid)app.querySelector(`[data-sid="${focusSid}"]`)?.focus({preventScroll:true});
  }
  document.addEventListener('selectionchange',()=>{
    if(!article||!run||reviewMode||isResolved())return;
    const button=app.querySelector('#highlight-selection'),preview=app.querySelector('#selected-preview');if(!button)return;
    const selection=window.getSelection(),passage=app.querySelector('#passage');
    if(!selection||selection.isCollapsed||!selection.rangeCount||!passage.contains(selection.anchorNode)||!passage.contains(selection.focusNode))return;
    const range=selection.getRangeAt(0),parts=[];
    for(const el of passage.querySelectorAll('[data-sid]')){
      if(!range.intersectsNode(el))continue;
      const spanRange=document.createRange();spanRange.selectNodeContents(el);
      const startRange=spanRange.cloneRange(),endRange=spanRange.cloneRange();let start=0,end=el.textContent.length;
      if(el.contains(range.startContainer)){startRange.setEnd(range.startContainer,range.startOffset);start=startRange.toString().length;}
      if(el.contains(range.endContainer)){endRange.setEnd(range.endContainer,range.endOffset);end=endRange.toString().length;}
      if(end>start&&/[a-z0-9]/i.test(el.textContent.slice(start,end)))parts.push({sid:el.dataset.sid,start,end});
    }
    pending=parts;button.hidden=!parts.length;app.querySelector('#mobile-add').hidden=!parts.length;preview.textContent=parts.length?`Selected: “${selection.toString().trim()}”`:'';
  });
  function renderSummary(){reviewMode=true;reviewIndex=0;reviewAttempt=0;renderWorkspace();}
  document.querySelector('#back-home').onclick=()=>{home();window.scrollTo(0,0);};
  if(demo)document.querySelector('#save-status').textContent='Preview · no records saved';
  home();
  const syncButton=document.querySelector('#sync-now');
  const onlineEnabled=!demo&&location.hostname==='shangguanyun08.github.io'&&window.ReadingSync;
  if(!onlineEnabled){if(syncButton)syncButton.hidden=true;}
  else{
    let deviceId;
    try{
      const original=localStorage.getItem(key);if(original&&!localStorage.getItem(key+':before-cloud-sync'))localStorage.setItem(key+':before-cloud-sync',original);
      deviceId=localStorage.getItem(key+':device')||crypto.randomUUID();localStorage.setItem(key+':device',deviceId);
    }catch{deviceId=crypto.randomUUID();}
    sync=ReadingSync.create({deviceId,getState:()=>{try{return ReadingSync.merge(state,JSON.parse(localStorage.getItem(key)||'null'));}catch{return state;}},onStatus:message=>{document.querySelector('#save-status').textContent=message;},applyState:merged=>{
      for(const a of articles)for(const r of merged.articles[a.id]||[])core.prepareRun(a,r);
      if(ReadingSync.stable(merged)===ReadingSync.stable(state))return;
      const previousRun=run,oldPosition=run?.position;
      state=merged;
      try{localStorage.setItem(key,JSON.stringify(state));}catch{throw Error('Local storage unavailable');}
      if(article){
        run=runs(article).find(r=>r.id===previousRun.id&&ReadingSync.compatible(previousRun,r)&&ReadingSync.compatible(r,previousRun))||runs(article).find(r=>(r.syncRoot||r.id)===(previousRun.syncRoot||previousRun.id)&&ReadingSync.compatible(previousRun,r)&&ReadingSync.compatible(r,previousRun))||latest(article);
        if(!run){home();return;}
        // Keep the question the reader was viewing while downloading new work.
        if(!reviewMode&&oldPosition!==undefined)run.position=oldPosition;
        renderWorkspace();
      }else home();
    }});
    syncButton.onclick=()=>sync.sync();
    window.addEventListener('online',()=>sync.sync());
    window.addEventListener('focus',()=>sync.sync());
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync.sync();});
    window.addEventListener('storage',e=>{if(e.key===key&&e.newValue)sync.sync();});
    setInterval(()=>{if(!document.hidden)sync.sync();},30000);
    sync.sync();
  }
})();
