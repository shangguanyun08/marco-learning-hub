(() => {
  'use strict';
  const articles=window.READING_ARTICLES,core=window.ReadingCore,app=document.querySelector('#app');
  const key='harry-reading-readtheory-2026-10-21-v1',demo=new URLSearchParams(location.search).has('demo');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state={version:1,articles:{}},article=null,run=null,pending=[];
  try{if(!demo){const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.version===1&&saved.articles&&typeof saved.articles==='object')state=saved;}}
  catch{document.querySelector('#save-status').textContent='Progress could not be loaded';}
  for(const a of articles)for(const r of state.articles[a.id]||[])core.prepareRun(a,r);
  const now=()=>new Date().toISOString(),runs=a=>state.articles[a.id]||[],latest=a=>runs(a).at(-1);
  const currentQ=()=>article.questions[run.position||0],attempts=q=>run.answers[q.id]||[];
  const draft=()=>run.drafts[currentQ().id],isResolved=()=>core.resolved(attempts(currentQ()));
  const completed=(a,r)=>core.finished(a,r)===a.questions.length;
  function save(){
    if(demo){document.querySelector('#save-status').textContent='Preview · no records saved';return;}
    try{localStorage.setItem(key,JSON.stringify(state));document.querySelector('#save-status').textContent='Saved on this device';}
    catch{const status=document.querySelector('#save-status');status.classList.add('storage-error');status.textContent='Storage unavailable · export your progress';}
  }
  function newRun(a){
    const r=core.prepareRun(a,{id:crypto.randomUUID(),startedAt:now(),position:0,completedAt:null,answers:{},drafts:{}});
    (state.articles[a.id]??=[]).push(r);return r;
  }
  function openArticle(id,fresh=false){
    article=articles.find(a=>a.id===id);run=fresh?newRun(article):(latest(article)||newRun(article));core.prepareRun(article,run);pending=[];save();
    if(completed(article,run))renderSummary();else renderWorkspace();window.scrollTo(0,0);
  }
  function home(){
    article=null;run=null;pending=[];
    app.innerHTML=`<section class="intro"><p class="eyebrow">Read it again. Find the proof.</p><h1>Harry’s reading<br>practice</h1></section>
      <section class="cards" aria-label="Reading sessions">${articles.map((a,i)=>{
        const r=latest(a),score=core.scores(a,r),done=completed(a,r);
        return `<article class="card ${score.mastered===score.total?'done':''}"><span class="num">0${i+1}</span><p class="eyebrow">Session ${i+1} · ${a.questions.length} questions to redo</p><h2>${esc(a.title)}</h2><p>${r?`${core.finished(a,r)} of ${score.total} questions checked · ${score.mastered} answered and supported`:'Choose an answer and highlight its evidence, then check.'}</p><button class="primary" data-open="${a.id}">${done?'See results':r?'Continue practice':'Start practice'} →</button></article>`;
      }).join('')}</section><p class="home-note">Tap sentences to highlight them, or select words and choose “Highlight selected words.” Choose your answer and evidence together, then check. You get a second try on anything missed.</p>
      <details class="history"><summary>Practice history & progress</summary><div class="history-list">${renderHistory()}</div><button class="secondary" id="export">Export progress</button><p class="meta">Records stay in this browser. Export a copy to keep or share the attempts and highlighted evidence.</p></details>`;
    app.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openArticle(b.dataset.open));app.querySelector('#export').onclick=exportProgress;
  }
  function renderHistory(){
    const records=articles.flatMap(a=>runs(a).map((r,i)=>({a,r,i})));
    if(!records.length)return '<p class="empty">No checks yet. Start a practice session above.</p>';
    return records.map(({a,r,i})=>{
      const score=core.scores(a,r),date=new Date(r.startedAt).toLocaleString();
      return `<details class="history-record"><summary>${esc(a.title)} · Practice ${i+1} · ${core.finished(a,r)}/${score.total} complete</summary><p class="meta">${esc(date)} · First answers: ${score.firstAnswers}/${score.total} · First evidence checks: ${score.firstEvidence}/${score.total}</p>${a.questions.map(q=>{
        const aa=r.answers[q.id]||[];
        if(!aa.length)return `<p class="meta">Original question ${q.number}: not checked yet.</p>`;
        return `<div><p><strong>Original question ${q.number}</strong></p>${aa.map((at,n)=>`<p class="meta">Try ${n+1}: ${esc(q.choices[at.choice])} · Answer ${at.answerOK?'correct':'incorrect'} · Evidence ${at.evidenceOK?'supported':'needs another look'}</p>${core.quoteMarks(a,at.marks||[]).map(m=>`<blockquote>${esc(m.quote)}</blockquote>`).join('')}`).join('')}</div>`;
      }).join('')}</details>`;
    }).join('');
  }
  function exportProgress(){
    const exported={...state,exportedAt:now(),course:'ReadTheory redo · October 21, 2026',articleTitles:Object.fromEntries(articles.map(a=>[a.id,a.title]))};
    const blob=new Blob([JSON.stringify(exported,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='harry-reading-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function renderWorkspace(focus=false){
    pending=[];
    const q=currentQ(),done=isResolved(),at=attempts(q).at(-1),marks=done?at.marks:draft().marks;
    const tryNumber=attempts(q).length+1;
    app.innerHTML=`<div class="workspace-head"><div><p class="eyebrow">Session ${articles.indexOf(article)+1} of 3</p><h1>${esc(article.title)}</h1><p class="meta">Question ${(run.position||0)+1} of ${article.questions.length} · Original question ${q.number}</p></div><button class="quiet" id="back-home">All articles</button></div>
      <div class="reading-layout"><section class="passage-panel" aria-labelledby="passage-heading"><h2 id="passage-heading">${esc(article.title)}</h2><p class="instructions">${done?'Reread the highlighted evidence as you review.':'Choose your answer and highlight supporting words. Tap a sentence, or select words to highlight.'}</p><div class="passage" id="passage">${renderPassage(marks,!done)}</div></section>
      <section class="question-panel" aria-labelledby="question-title"><p class="eyebrow">${done?'Checked':tryNumber===1?'First try':'Second try'}</p><h2 id="question-title" tabindex="-1">${esc(q.prompt)}</h2><div id="question-body">${done?renderFeedback(q,at):renderForm(q,at)}</div></section></div>
      ${!done?`<div class="mobile-dock"><button class="select-action" id="mobile-add" hidden>Highlight selection</button><button class="primary" id="mobile-check" ${canCheck()?'':'disabled'}>Check ${tryNumber===1?'first':'second'} try</button></div>`:''}`;
    app.querySelector('#back-home').onclick=home;
    if(done){app.querySelector('#next').onclick=nextQuestion;}
    else bindEditing();
    if(focus)app.querySelector('#question-title').focus({preventScroll:true});
  }
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
    return `<div class="feedback needs-work" role="status"><h3>First try checked. Try once more.</h3><p><strong>Answer: ${at.answerOK?'correct':'incorrect'}.</strong><br><strong>Evidence: ${at.evidenceOK?'supported':'not enough yet'}.</strong></p><p>Change your answer, your highlights, or both, then check your second try.</p></div>`;
  }
  function renderForm(q,previous){
    const d=draft(),tryNumber=attempts(q).length+1;
    return `${renderFirstFeedback(previous)}<form id="answer-form"><fieldset style="border:0;padding:0;margin:0"><legend class="sr-only">Answer choices</legend>${q.choices.map((c,i)=>`<label class="choice"><input type="radio" name="answer" value="${i}" ${d.choice===i?'checked':''}><strong>${'ABCD'[i]}</strong><span>${esc(c)}</span></label>`).join('')}</fieldset><button class="select-action" id="highlight-selection" type="button" hidden>Highlight selected words</button><p class="selected-preview" id="selected-preview"></p><ul class="evidence-list" id="evidence-list">${renderEvidence(d.marks)}</ul><div class="actions"><button class="primary" id="check" ${canCheck()?'':'disabled'}>Check ${tryNumber===1?'first':'second'} try</button><button class="quiet" type="button" id="clear-marks" ${d.marks.length?'':'disabled'}>Clear highlights</button></div><p class="meta">Choose an answer and add a highlight before checking.</p></form>`;
  }
  function renderFeedback(q,at){
    const both=at.answerOK&&at.evidenceOK;
    return `<div class="locked-choice"><span class="meta">Your ${attempts(q).length===1?'first':'second'} try</span><br><strong>${'ABCD'[at.choice]}.</strong> ${esc(q.choices[at.choice])}</div><ul class="evidence-list">${renderEvidence(at.marks,false)}</ul><div class="feedback ${both?'':'needs-work'}" role="status"><h3>${both?'You answered it and found the proof!':'Review the answer and evidence.'}</h3><p class="${at.answerOK?'correct':'incorrect'}"><strong>Answer: ${at.answerOK?'correct':'incorrect'}.</strong>${!at.answerOK?` The correct answer is ${'ABCD'[q.answer]}: ${esc(q.choices[q.answer])}.`:''}</p><p class="${at.evidenceOK?'correct':'incorrect'}"><strong>Evidence: ${at.evidenceOK?'supported':'not enough yet'}.</strong> ${at.evidenceOK?'Your highlights include the support this question needs.':at.focused===false?'Choose a smaller, focused set of words.':esc(q.hint)}</p><p>${esc(q.explanation)}</p>${!both?q.evidence.map(group=>`<blockquote class="support">${esc(group[0])}</blockquote>`).join(''):''}</div><div class="actions"><button class="primary" id="next">${(run.position||0)===article.questions.length-1?'See session results':'Next question'} →</button></div>`;
  }
  function renderEvidence(marks,editable=true){
    const marked=core.quoteMarks(article,marks);
    return marked.length?marked.map((m,i)=>`<li><q>${esc(m.quote)}</q>${editable?`<button type="button" class="remove" data-remove="${i}" aria-label="Remove highlight ${i+1}">×</button>`:''}</li>`).join(''):'<li class="empty">Highlight evidence in the article.</li>';
  }
  function canCheck(){return !isResolved()&&Number.isInteger(draft().choice)&&draft().marks.length>0;}
  function updateCheckButtons(){
    app.querySelector('#check').disabled=!canCheck();app.querySelector('#mobile-check').disabled=!canCheck();
    app.querySelector('#clear-marks').disabled=!draft().marks.length;
  }
  function bindEditing(){
    bindPassage();bindEvidenceButtons();
    const form=app.querySelector('#answer-form');
    form.onchange=()=>{const selected=form.querySelector('input:checked');draft().choice=selected?Number(selected.value):null;save();updateCheckButtons();};
    const check=()=>{
      if(!canCheck())return;
      if(!core.recordCheck(article,currentQ(),run,now()))return;
      save();renderWorkspace(true);
      if(matchMedia('(max-width:900px)').matches)app.querySelector('.question-panel').scrollIntoView({block:'start'});
    };
    form.onsubmit=e=>{e.preventDefault();check();};app.querySelector('#mobile-check').onclick=check;
    const addSelection=()=>{if(!pending.length)return;draft().marks.push(...pending);pending=[];window.getSelection()?.removeAllRanges();save();refreshHighlights();};
    app.querySelector('#highlight-selection').onclick=addSelection;app.querySelector('#mobile-add').onclick=addSelection;
    app.querySelector('#clear-marks').onclick=()=>{draft().marks=[];save();refreshHighlights();};
  }
  function nextQuestion(){
    if((run.position||0)===article.questions.length-1)renderSummary();
    else{run.position=(run.position||0)+1;save();renderWorkspace(true);}
    window.scrollTo(0,0);
  }
  function bindEvidenceButtons(){app.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const d=draft();d.marks=core.quoteMarks(article,d.marks);d.marks.splice(Number(b.dataset.remove),1);save();refreshHighlights();});}
  function bindPassage(){
    app.querySelectorAll('.sentence.selectable').forEach(el=>{
      const toggle=()=>{
        const selected=window.getSelection();if(selected&&!selected.isCollapsed&&selected.toString().trim())return;
        const d=draft(),sid=el.dataset.sid,existing=d.marks.some(m=>m.sid===sid);
        d.marks=d.marks.filter(m=>m.sid!==sid);
        if(!existing){const s=core.sentences(article).flat().find(s=>s.id===sid);d.marks.push({sid,start:0,end:s.text.length});}
        const keyboardFocus=document.activeElement===el;save();refreshHighlights(keyboardFocus?sid:null);
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
    if(!article||!run||isResolved())return;
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
  function renderSummary(){
    const score=core.scores(article,run),index=articles.indexOf(article),next=articles[index+1],allSupported=score.mastered===score.total;
    app.innerHTML=`<section class="summary-panel"><p class="eyebrow">Session ${index+1} complete</p><h1>${allSupported?'You found the proof.':'Reading session complete.'}</h1><h2>${esc(article.title)}</h2><p>${allSupported?'Every answer has supporting evidence.':'You’ve checked every question. You can review the explanations and practice this article again.'} Your first and second tries are kept in practice history.</p><div class="stat-row"><div class="stat"><strong>${score.firstAnswers}/${score.total}</strong><span>First answers correct</span></div><div class="stat"><strong>${score.firstEvidence}/${score.total}</strong><span>Evidence right on first check</span></div><div class="stat"><strong>${score.mastered}/${score.total}</strong><span>Answered and supported</span></div></div><div class="actions">${next?`<button class="primary" id="next-article">Next article →</button>`:''}<button class="secondary" id="all-articles">All articles & history</button><button class="quiet" id="fresh-run">Practice this article again</button></div></section>`;
    app.querySelector('#all-articles').onclick=home;app.querySelector('#fresh-run').onclick=()=>openArticle(article.id,true);if(next)app.querySelector('#next-article').onclick=()=>openArticle(next.id);
  }
  if(demo)document.querySelector('#save-status').textContent='Preview · no records saved';
  home();
})();
