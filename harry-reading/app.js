(() => {
  'use strict';
  const articles=window.READING_ARTICLES, core=window.ReadingCore, app=document.querySelector('#app');
  const key='harry-reading-readtheory-2026-10-21-v1', demo=new URLSearchParams(location.search).has('demo');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state={version:1,articles:{}}, article=null, run=null, retry=false, pending=[], selectionPreview='';
  try {if(!demo){const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.version===1&&saved.articles&&typeof saved.articles==='object')state=saved;}}
  catch {document.querySelector('#save-status').textContent='Progress could not be loaded';}
  const now=()=>new Date().toISOString();
  function save(){
    if(demo){document.querySelector('#save-status').textContent='Preview · no records saved';return;}
    try{localStorage.setItem(key,JSON.stringify(state));document.querySelector('#save-status').textContent='Saved on this device';}
    catch{const status=document.querySelector('#save-status');status.classList.add('storage-error');status.textContent='Storage unavailable · export your progress';}
  }
  const runs=a=>state.articles[a.id]||[];
  const latest=a=>runs(a).at(-1);
  const currentQ=()=>article.questions[run.position||0];
  const attempts=q=>run.answers[q.id]||[];
  const lastAttempt=q=>attempts(q).at(-1);
  const completed=(a,r)=>core.scores(a,r).mastered===a.questions.length;
  function newRun(a){
    const r={id:crypto.randomUUID(),startedAt:now(),readAt:null,position:0,completedAt:null,answers:{}};
    (state.articles[a.id]??=[]).push(r);return r;
  }
  function openArticle(id,fresh=false){
    article=articles.find(a=>a.id===id);run=fresh?newRun(article):(latest(article)||newRun(article));retry=false;pending=[];save();
    if(completed(article,run))renderSummary();else renderWorkspace();window.scrollTo(0,0);
  }
  function home(){
    article=null;run=null;retry=false;pending=[];
    app.innerHTML=`<section class="intro"><p class="eyebrow">Read it again. Find the proof.</p><h1>Harry’s reading<br>practice</h1></section>
      <section class="cards" aria-label="Reading sessions">${articles.map((a,i)=>{
        const r=latest(a),score=core.scores(a,r),done=completed(a,r);
        return `<article class="card ${done?'done':''}"><span class="num">0${i+1}</span><p class="eyebrow">Session ${i+1} · ${a.questions.length} questions to redo</p><h2>${esc(a.title)}</h2><p>${r?`${score.mastered} of ${score.total} answers supported with evidence`:'Read the full article, then redo only the missed questions.'}</p><button class="primary" data-open="${a.id}">${done?'See results':r?'Continue reading':'Start reading'} →</button></article>`;
      }).join('')}</section><p class="home-note">On a tablet, tap a sentence to highlight it. With a mouse, you can also select a few words and choose “Highlight selected words.” Feedback appears after your answer and your highlights.</p>
      <details class="history"><summary>Practice history & progress</summary><div class="history-list">${renderHistory()}</div><button class="secondary" id="export">Export progress</button><p class="meta">Records stay in this browser. Export a copy to keep or share the attempts and highlighted evidence.</p></details>`;
    app.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openArticle(b.dataset.open));
    app.querySelector('#export').onclick=exportProgress;
  }
  function renderHistory(){
    const records=articles.flatMap(a=>runs(a).map((r,i)=>({a,r,i})));
    if(!records.length)return '<p class="empty">No attempts yet. Start a reading session above.</p>';
    return records.map(({a,r,i})=>{
      const score=core.scores(a,r),date=new Date(r.startedAt).toLocaleString();
      return `<details class="history-record"><summary>${esc(a.title)} · Practice ${i+1} · ${score.mastered}/${score.total} complete</summary><p class="meta">${esc(date)} · First answers: ${score.firstAnswers}/${score.total} · First evidence checks: ${score.firstEvidence}/${score.total}</p>${a.questions.map(q=>{
        const aa=r.answers[q.id]||[];
        if(!aa.length)return `<p class="meta">Original question ${q.number}: not answered yet.</p>`;
        return `<div><p><strong>Original question ${q.number}</strong></p>${aa.map((at,n)=>`<p class="meta">Try ${n+1}: ${esc(q.choices[at.choice])} · ${at.checkedAt?`Answer ${at.answerOK?'correct':'incorrect'} · Evidence ${at.evidenceOK?'supported':'needs another look'}`:'Waiting for highlights / check'}</p>${core.quoteMarks(a,at.marks).map(m=>`<blockquote>${esc(m.quote)}</blockquote>`).join('')}`).join('')}</div>`;
      }).join('')}</details>`;
    }).join('');
  }
  function exportProgress(){
    const exported={...state,exportedAt:now(),course:'ReadTheory redo · October 21, 2026',articleTitles:Object.fromEntries(articles.map(a=>[a.id,a.title]))};
    const blob=new Blob([JSON.stringify(exported,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='harry-reading-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function stepInfo(){
    if(!run.readAt)return {index:0,label:'Read the whole article first'};
    const at=lastAttempt(currentQ());
    return !at||retry?{index:1,label:'Choose your answer'}:!at.checkedAt?{index:2,label:'Highlight your evidence'}:{index:3,label:'Check and learn'};
  }
  function renderWorkspace(focus=false){
    pending=[];selectionPreview='';
    const step=stepInfo(),q=currentQ(),at=lastAttempt(q),sc=core.scores(article,run);
    app.innerHTML=`<div class="workspace-head"><div><p class="eyebrow">Session ${articles.indexOf(article)+1} of 3</p><h1>${esc(article.title)}</h1><p class="meta">${run.readAt?`Question ${(run.position||0)+1} of ${article.questions.length} · Original question ${q.number}`:'Reread the complete passage before the questions.'}</p></div><button class="quiet" id="back-home">All articles</button></div>
      <div class="steps" aria-label="Practice steps">${['Read','Answer','Highlight','Check'].map((s,i)=>`<span class="step ${i===step.index?'active':i<step.index?'complete':''}" ${i===step.index?'aria-current="step"':''}>${i+1} ${s}</span>`).join('')}</div>
      <div class="reading-layout ${!run.readAt?'read-only':''}"><section class="passage-panel" aria-labelledby="passage-heading"><h2 id="passage-heading">${esc(article.title)}</h2><p class="instructions">${step.index===2?'Tap sentences to highlight or unhighlight them. Or drag over words, then choose “Highlight selected words.” You can use more than one highlight.':step.index===0?'Take your time. Read the whole article, then start the questions.':'You can reread the article as you work. Highlighting opens after you submit your answer.'}</p><div class="passage" id="passage">${renderPassage(step.index===2?at?.marks:step.index===3?at?.marks:[],step.index===2)}</div>${!run.readAt?'<button class="primary" id="read-done">I’ve read the article · Start questions →</button>':''}</section>
      ${run.readAt?`<section class="question-panel" aria-labelledby="question-title"><p class="eyebrow" id="stage-label">${step.index===3?'4 · Feedback':step.index===2?'3 · Find the proof':'2 · Your answer'}</p><h2 id="question-title" tabindex="-1">${esc(q.prompt)}</h2><div id="question-body">${renderQuestion(q,at,step.index)}</div><div class="progress-dots" aria-label="${sc.mastered} of ${sc.total} completed">${article.questions.map(x=>`<span class="${core.passed(run.answers[x.id])?'filled':''}"></span>`).join('')}</div></section>`:''}</div>${step.index===2?`<div class="mobile-dock"><button class="select-action" id="mobile-add" hidden>Highlight selection</button><button class="primary" id="mobile-check" ${at.marks.length?'':'disabled'}>Check answer & evidence</button></div>`:''}`;
    app.querySelector('#back-home').onclick=home;
    if(!run.readAt)app.querySelector('#read-done').onclick=()=>{run.readAt=now();save();renderWorkspace(true);window.scrollTo(0,0);};
    bindQuestion(step.index);
    if(focus&&run.readAt)app.querySelector('#question-title').focus({preventScroll:true});
  }
  function renderPassage(marks=[],interactive=false){
    return core.sentences(article).map((ss,p)=>`${article.sectionTitles?.[p]?`<h3>${esc(article.sectionTitles[p])}</h3>`:''}<p><span class="para-num" aria-hidden="true">${p+1}</span>${ss.map(s=>{
      const ranges=marks.filter(m=>m.sid===s.id).sort((a,b)=>a.start-b.start),merged=[];
      for(const r of ranges){const prev=merged.at(-1);if(prev&&r.start<=prev.end)prev.end=Math.max(prev.end,r.end);else merged.push({start:r.start,end:r.end});}
      let end=0,html='';for(const m of merged){html+=esc(s.text.slice(end,m.start))+`<mark>${esc(s.text.slice(m.start,m.end))}</mark>`;end=m.end;}html+=esc(s.text.slice(end));
      return `<span class="sentence ${interactive?'selectable':''}" data-sid="${s.id}" ${interactive?`role="button" tabindex="0" aria-pressed="${ranges.length>0}" aria-label="Highlight sentence: ${esc(s.text.trim())}"`:''}>${html}</span>`;
    }).join('')}</p>`).join('');
  }
  function renderQuestion(q,at,step){
    if(step===1)return `<form id="answer-form"><fieldset style="border:0;padding:0;margin:0"><legend class="sr-only">Answer choices</legend>${q.choices.map((c,i)=>`<label class="choice"><input type="radio" name="answer" value="${i}" required><strong>${'ABCD'[i]}</strong><span>${esc(c)}</span></label>`).join('')}</fieldset><p class="meta">Choose first. Next, you’ll highlight the evidence. No result is shown yet.</p><button class="primary" id="submit-answer" disabled>Submit answer · Find evidence →</button></form>`;
    const locked=`<div class="locked-choice"><span class="meta">Your submitted answer</span><br><strong>${'ABCD'[at.choice]}.</strong> ${esc(q.choices[at.choice])}</div>`;
    if(step===2)return `${locked}<p class="notice">Now highlight the words in the article that support your answer. ${q.evidence.length>1?'This question needs more than one piece of evidence.':''}</p><button class="select-action" id="highlight-selection" hidden>Highlight selected words</button><p class="selected-preview" id="selected-preview"></p><ul class="evidence-list" id="evidence-list">${renderEvidence(at)}</ul><div class="actions"><button class="primary" id="check" ${at.marks.length?'':'disabled'}>Check answer & evidence</button><button class="quiet" id="clear-marks" ${at.marks.length?'':'disabled'}>Clear highlights</button></div><p class="meta">Your answer stays locked while you find evidence.</p>`;
    const both=at.answerOK&&at.evidenceOK;
    return `${locked}<ul class="evidence-list">${renderEvidence(at,false)}</ul><div class="feedback ${both?'':'needs-work'}" role="status"><h3>${both?'You answered it and found the proof!':'Let’s take another look.'}</h3><p class="${at.answerOK?'correct':'incorrect'}"><strong>Answer: ${at.answerOK?'correct':'incorrect'}.</strong> ${!at.answerOK?`The correct answer is ${'ABCD'[q.answer]}: ${esc(q.choices[q.answer])}.`:''}</p><p class="${at.evidenceOK?'correct':'incorrect'}"><strong>Evidence: ${at.evidenceOK?'supported':'not enough yet'}.</strong> ${at.evidenceOK?'Your highlights include the support this question needs.':at.focused===false?'Choose a smaller, focused set of words. Highlighting nearly the whole passage does not show which details matter.':esc(q.hint)}</p><p>${esc(q.explanation)}</p>${!both?`<details><summary>See supporting text</summary>${q.evidence.map(group=>`<blockquote class="support">${esc(group[0])}</blockquote>`).join('')}</details>`:''}</div><div class="actions">${both?`<button class="primary" id="next">${(run.position||0)===article.questions.length-1?'See session results':'Next question'} →</button>`:'<button class="primary" id="retry">Try this question again</button>'}</div>`;
  }
  function renderEvidence(at,editable=true){
    const marked=core.quoteMarks(article,at.marks);
    return marked.length?marked.map((m,i)=>`<li><q>${esc(m.quote)}</q>${editable?`<button class="remove" data-remove="${i}" aria-label="Remove highlight ${i+1}">×</button>`:''}</li>`).join(''):'<li class="empty">No evidence highlighted yet.</li>';
  }
  function bindQuestion(step){
    if(step===1){
      const form=app.querySelector('#answer-form');
      form.onchange=()=>form.querySelector('#submit-answer').disabled=false;
      form.onsubmit=e=>{e.preventDefault();const selected=form.querySelector('input:checked');if(!selected)return;const q=currentQ();(run.answers[q.id]??=[]).push({choice:Number(selected.value),answeredAt:now(),marks:[],checkedAt:null,answerOK:null,evidenceOK:null});retry=false;save();renderWorkspace(true);};
    }
    if(step===2){
      bindPassage();bindEvidenceButtons();
      const addSelection=()=>{if(!pending.length)return;const at=lastAttempt(currentQ());at.marks.push(...pending);pending=[];window.getSelection()?.removeAllRanges();save();refreshHighlights();};
      app.querySelector('#highlight-selection').onclick=addSelection;
      app.querySelector('#mobile-add').onclick=addSelection;
      app.querySelector('#clear-marks').onclick=()=>{lastAttempt(currentQ()).marks=[];save();refreshHighlights();};
      const check=()=>{const q=currentQ(),at=lastAttempt(q);if(!at.marks.length)return;const result=core.assess(article,q,at.marks);Object.assign(at,{checkedAt:now(),answerOK:at.choice===q.answer,evidenceOK:result.correct,focused:result.focused,supported:result.supported});if(completed(article,run))run.completedAt=now();save();renderWorkspace(true);if(matchMedia('(max-width:900px)').matches)app.querySelector('.question-panel').scrollIntoView({block:'start'});};
      app.querySelector('#check').onclick=check;app.querySelector('#mobile-check').onclick=check;
    }
    if(step===3){
      const next=app.querySelector('#next');if(next)next.onclick=()=>{if((run.position||0)===article.questions.length-1)renderSummary();else{run.position=(run.position||0)+1;retry=false;save();renderWorkspace(true);}window.scrollTo(0,0);};
      const again=app.querySelector('#retry');if(again)again.onclick=()=>{retry=true;renderWorkspace(true);};
    }
  }
  function bindEvidenceButtons(){app.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const at=lastAttempt(currentQ());at.marks=core.quoteMarks(article,at.marks);at.marks.splice(Number(b.dataset.remove),1);save();refreshHighlights();});}
  function bindPassage(){
    app.querySelectorAll('.sentence.selectable').forEach(el=>{
      const toggle=()=>{const selected=window.getSelection();if(selected&&!selected.isCollapsed&&selected.toString().trim())return;const at=lastAttempt(currentQ()),sid=el.dataset.sid;const existing=at.marks.some(m=>m.sid===sid);at.marks=at.marks.filter(m=>m.sid!==sid);if(!existing){const s=core.sentences(article).flat().find(s=>s.id===sid);at.marks.push({sid,start:0,end:s.text.length});}const keyboardFocus=document.activeElement===el;save();refreshHighlights(keyboardFocus?sid:null);};
      el.onclick=toggle;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.getSelection()?.removeAllRanges();toggle();}};
    });
  }
  function refreshHighlights(focusSid=null){
    const at=lastAttempt(currentQ());pending=[];selectionPreview='';
    app.querySelector('#passage').innerHTML=renderPassage(at.marks,true);
    app.querySelector('#evidence-list').innerHTML=renderEvidence(at);
    app.querySelector('#check').disabled=!at.marks.length;app.querySelector('#clear-marks').disabled=!at.marks.length;
    app.querySelector('#highlight-selection').hidden=true;app.querySelector('#selected-preview').textContent='';
    app.querySelector('#mobile-check').disabled=!at.marks.length;app.querySelector('#mobile-add').hidden=true;
    bindPassage();bindEvidenceButtons();
    if(focusSid)app.querySelector(`[data-sid="${focusSid}"]`)?.focus({preventScroll:true});
  }
  document.addEventListener('selectionchange',()=>{
    if(!article||!run||!run.readAt||stepInfo().index!==2)return;
    const button=app.querySelector('#highlight-selection'),preview=app.querySelector('#selected-preview');if(!button)return;
    const selection=window.getSelection(),passage=app.querySelector('#passage');
    if(!selection||selection.isCollapsed||!selection.rangeCount||!passage.contains(selection.anchorNode)||!passage.contains(selection.focusNode)){return;}
    const range=selection.getRangeAt(0),parts=[];
    for(const el of passage.querySelectorAll('[data-sid]')){
      if(!range.intersectsNode(el))continue;
      const spanRange=document.createRange();spanRange.selectNodeContents(el);
      const startRange=spanRange.cloneRange(),endRange=spanRange.cloneRange();
      let start=0,end=el.textContent.length;
      if(el.contains(range.startContainer)){startRange.setEnd(range.startContainer,range.startOffset);start=startRange.toString().length;}
      if(el.contains(range.endContainer)){endRange.setEnd(range.endContainer,range.endOffset);end=endRange.toString().length;}
      if(end>start&&/[a-z0-9]/i.test(el.textContent.slice(start,end)))parts.push({sid:el.dataset.sid,start,end});
    }
    pending=parts;selectionPreview=selection.toString().trim();button.hidden=!parts.length;app.querySelector('#mobile-add').hidden=!parts.length;preview.textContent=parts.length?`Selected: “${selectionPreview}”`:'';
  });
  function renderSummary(){
    const score=core.scores(article,run),index=articles.indexOf(article),next=articles[index+1];
    app.innerHTML=`<section class="summary-panel"><p class="eyebrow">Session ${index+1} complete</p><h1>You found the proof.</h1><h2>${esc(article.title)}</h2><p>Every answer now has supporting evidence. Your first choices and all later tries are kept in practice history.</p><div class="stat-row"><div class="stat"><strong>${score.firstAnswers}/${score.total}</strong><span>First answers correct</span></div><div class="stat"><strong>${score.firstEvidence}/${score.total}</strong><span>Evidence right on first check</span></div><div class="stat"><strong>${score.mastered}/${score.total}</strong><span>Answered and supported</span></div></div><div class="actions">${next?`<button class="primary" id="next-article">Read ${esc(next.title)} →</button>`:''}<button class="secondary" id="all-articles">All articles & history</button><button class="quiet" id="fresh-run">Practice this article again</button></div></section>`;
    app.querySelector('#all-articles').onclick=home;app.querySelector('#fresh-run').onclick=()=>openArticle(article.id,true);
    if(next)app.querySelector('#next-article').onclick=()=>openArticle(next.id);
  }
  if(demo)document.querySelector('#save-status').textContent='Preview · no records saved';
  home();
})();
