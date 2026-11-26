(() => {
  'use strict';
  const D=window.EvidenceData,C=window.EvidenceCore,S=window.ReadingSync;
  const demo=new URLSearchParams(location.search).has('demo');
  const live=!demo&&location.hostname==='shangguanyun08.github.io';
  const online=live&&D.sharedProgress!==false;
  const key=D.appId+(live?'':':preview');
  const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state={version:1,articles:{evidence:[]}},run,ready=!online,onlyWrong=false,pendingSelection=null,sync,storageOK=true;
  try{if(!demo)state=S.normalize(JSON.parse(localStorage.getItem(key)||'null'));}catch{storageOK=false;}
  state.articles.evidence??=[];
  if(!state.articles.evidence.length)state.articles.evidence.push({id:'primary',startedAt:new Date().toISOString(),position:0,answers:{},drafts:{}});
  run=state.articles.evidence[0];
  const questionList=$('#workspace');
  const questionNumber=new Map(D.questions.map((q,index)=>[q.id,index+1]));
  const questionCards=new Map();
  const attempts=q=>run.answers[q.id]||[];
  const paragraphs=q=>D.passages[q.passage].paragraphs;
  const emptyDraft={choice:null,marks:[],eliminated:[]};
  const draft=q=>run.drafts[q.id]??emptyDraft;
  const editDraft=q=>run.drafts[q.id]??={choice:null,marks:[],eliminated:[]};
  function status(text){$('#save-status').textContent=demo?'Preview · no records saved':!storageOK?'Device storage unavailable · export records':text;$('#save-status').dataset.offline=String(!storageOK||text.startsWith('Not synced'));}
  function save(){
    if(demo){status('Preview');return;}
    try{localStorage.setItem(key,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}
    status(online?'Saved on this device · syncing…':'Saved on this device');sync?.queue();
  }
  function saveDraft(q){
    const updatedAt=new Date().toISOString();
    editDraft(q).updatedAt=updatedAt;
    run.updatedAt=updatedAt;
    save();
  }
  function isWrong(q){return attempts(q)[0]?.answerOK===false;}
  function outcome(q){const a=attempts(q);return !a.length?'Not answered':a[0].answerOK?'Correct':'Incorrect';}
  function summarizeResults(questions, getAttempts) {
    const result = {total: questions.length, answered: 0, correct: 0, wrong: 0};
    const skills = new Map();
    for (const question of questions) {
      if (!skills.has(question.skill)) skills.set(question.skill, {name: question.skill, correct: 0, wrong: 0, total: 0});
      const skill = skills.get(question.skill);
      skill.total++;
      const first = getAttempts(question)[0];
      if (!first) continue;
      const key = first.answerOK ? 'correct' : 'wrong';
      result.answered++;
      result[key]++;
      skill[key]++;
    }
    return {...result, skills: [...skills.values()]};
  }

  function updateOverview(){
    const statistics = summarizeResults(D.questions, attempts);
    const {answered, correct, wrong, total, skills} = statistics;
    const skillStatistics = $('#skill-statistics');
    const score = skillStatistics
      ? `${answered} / ${total} answered`
      : `${answered} / ${total} answered · ${correct} correct · ${wrong} incorrect`;
    if ($('#score').textContent !== score) $('#score').textContent = score;
    if (skillStatistics) {
      $('#correct-count').textContent = String(correct);
      $('#wrong-count').textContent = String(wrong);
      $('#unanswered-count').textContent = String(total - answered);
      $('#accuracy-count').textContent = answered ? `${Math.round(correct * 100 / answered)}%` : '—';
      skillStatistics.innerHTML = skills.map(skill =>
        `<div><dt>${esc(skill.name)}</dt><dd><span class="skill-right">${skill.correct} correct</span> <span class="skill-wrong">${skill.wrong} wrong</span>${skill.total > skill.correct + skill.wrong ? ` <small>${skill.total - skill.correct - skill.wrong} unanswered</small>` : ''}</dd></div>`
      ).join('');
    }
    $('#jump').innerHTML=D.questions.map(q=>`<button type="button" data-jump="${q.id}" class="${C.resolved(attempts(q))?(isWrong(q)?'miss':'done'):''}" aria-label="Jump to question ${questionNumber.get(q.id)}, ${outcome(q).toLowerCase()}">${questionNumber.get(q.id)}</button>`).join('');
    updateReport();
    $('#history').innerHTML=state.articles.evidence.map((r,i)=>`<option value="${esc(r.id)}" ${r.id===run.id?'selected':''}>${state.articles.evidence.length>1?'Saved history '+(i+1):'Current session'}${r.syncRoot?' · concurrent work preserved':''}</option>`).join('');
  }
  function updateReport(){
    const questions=onlyWrong?D.questions.filter(isWrong):D.questions;
    $('#report').innerHTML=questions.map(q=>`<div class="report-row"><p><strong>Q${questionNumber.get(q.id)} · ${esc(q.skill)}</strong><br>${esc(outcome(q))}</p><button type="button" data-jump="${q.id}">${C.resolved(attempts(q))?'Review evidence':'Open question'}</button></div>`).join('')||'<p>No incorrect answers.</p>';
  }
  function jumpToQuestion(event){
    const button=event.target.closest('button[data-jump]');
    if(!button)return;
    const card=questionCards.get(button.dataset.jump);
    card.focus({preventScroll:true});
    card.scrollIntoView({block:'start'});
  }
  function textWithMarks(text,ranges){
    let end=0,html='';for(const r of ranges){html+=esc(text.slice(end,r.start))+`<mark>${esc(text.slice(r.start,r.end))}</mark>`;end=r.end;}return html+esc(text.slice(end));
  }
  function passageHTML(q,selected,interactive){
    const safe=C.marks(paragraphs(q),selected),segmenter=new Intl.Segmenter('en',{granularity:'sentence'});
    return paragraphs(q).map((text,p)=>`<p><span class="para-number" aria-hidden="true">${p+1}</span>${Array.from(segmenter.segment(text),({segment,index:start})=>{
      const end=start+segment.length,ranges=safe.filter(m=>m.p===p&&m.start<end&&m.end>start).map(m=>({start:Math.max(start,m.start)-start,end:Math.min(end,m.end)-start}));
      return `<span class="sentence${interactive?' selectable':''}" data-p="${p}" data-start="${start}" data-end="${end}" ${interactive?`role="button" tabindex="0" aria-pressed="${ranges.length>0}" aria-label="Highlight sentence: ${esc(segment.trim())}"`:''}>${textWithMarks(segment,ranges)}</span>`;
    }).join('')}</p>`).join('');
  }
  function highlightList(q,selected,editable){const m=C.marks(paragraphs(q),selected);return m.length?`<ul class="highlight-list"><li><q>${esc(m.map(r=>r.quote.trim()).join(' '))}</q>${editable?'<button type="button" data-remove aria-label="Remove highlight">Remove</button>':''}</li></ul>`:'<p class="empty">Highlight your supporting evidence in the passage.</p>';}
  function canCheck(q){
    const d=draft(q);
    return ready&&!C.resolved(attempts(q))&&Number.isInteger(d.choice)&&!C.eliminations(d.eliminated).includes(d.choice)&&!!C.highlight(paragraphs(q),d.marks);
  }
  function setCheck(q,card){
    const button=card.querySelector('[data-check]');
    if(button)button.disabled=!canCheck(q);
  }
  function comparison(q){
    const a=attempts(q)[0],model=C.suggestions(q,paragraphs(q));
    return `<section class="compare" aria-label="Evidence comparison"><h3>Compare the proof</h3><p class="proof-note">Does your highlight prove your answer? Compare it with the suggested evidence.</p>
      <div class="compare-grid"><div class="compare-box"><h3>Your highlight</h3><section><p><strong>Your answer: ${'ABCD'[a.choice]} · ${a.answerOK?'correct':'incorrect'}</strong></p><p>${esc(q.choices[a.choice])}</p>${C.eliminations(a.eliminated).length?`<p class="meta">Eliminated: ${C.eliminations(a.eliminated).map(i=>'ABCD'[i]).join(', ')}</p>`:''}${highlightList(q,a.marks,false)}<p class="meta"><time datetime="${esc(a.checkedAt)}">${esc(new Date(a.checkedAt).toLocaleString())}</time></p></section></div>
      <div class="compare-box"><h3>Suggested evidence</h3><p><strong>Answer ${'ABCD'[q.answer]} · ${esc(q.choices[q.answer])}</strong></p>${model.map(m=>`<blockquote>${esc(m.quote)}</blockquote>`).join('')}<p>${esc(q.explanation)}</p><p><strong>Watch for:</strong> ${esc(q.trap)}</p></div></div>
      <details><summary>See the highlights in the full passage</summary><div class="compare-grid"><div><h3>Your highlight</h3><div class="full-proof">${passageHTML(q,a.marks,false)}</div></div><div><h3>Suggested support</h3><div class="full-proof">${passageHTML(q,model,false)}</div></div></div></details>
      <p class="meta">Skill match: ${esc(q.source)}</p></section>`;
  }
  function reviewTools(q,answer){
    const label=answer.answerOK?'Review my answer':'Show why I missed it';
    return `<div class="tools review-tools">
      <button type="button" data-clue aria-pressed="false" aria-controls="passage-${q.id}">Highlight clue</button>
      <button type="button" data-reason aria-expanded="false" aria-controls="reason-${q.id}">${label}</button>
    </div>
    <div class="review-reason" id="reason-${q.id}" hidden>
      ${answer.answerOK?'':`<p><strong>Your choice ${'ABCD'[answer.choice]}.</strong> ${esc(q.distractors[answer.choice])}</p>`}
      <p><strong>Correct answer ${'ABCD'[q.answer]}.</strong> ${esc(q.choices[q.answer])} ${esc(q.explanation)}</p>
      <p class="key-label">Your submitted highlight</p>
      ${highlightList(q,answer.marks,false)}
    </div>`;
  }
  function renderQuestion(q,card){
    if(pendingSelection?.card===card)clearPendingSelection();
    const d=draft(q),list=attempts(q),locked=C.resolved(list),first=list[0],marks=locked?first.marks:d.marks;
    const excluded=C.eliminations(locked?first.eliminated:d.eliminated);
    const guided=locked&&Array.isArray(q.distractors);
    card.innerHTML=`<div class="workspace"><article class="panel"><p class="eyebrow">READ THE PASSAGE</p><h2>${esc(D.passages[q.passage].title)}</h2><p class="meta" data-highlight-label>${locked?'Your submitted highlight is shown.':'Tap one sentence, or select a passage excerpt and press Highlight selection. A new highlight replaces your previous selection.'}</p><div class="passage" id="passage-${q.id}" data-passage>${passageHTML(q,marks,!locked)}</div>${!locked?'<button data-selection-action type="button" class="primary" hidden>Highlight selection</button>':''}</article>
      <div class="panel"><p class="eyebrow">QUESTION ${questionNumber.get(q.id)} OF ${D.questions.length} · ${esc(q.skill.toUpperCase())}</p><div class="prompt" id="prompt-${q.id}">${esc(q.prompt)}</div>
      ${locked?`<div class="feedback${first.answerOK?' good':''}" role="status" tabindex="-1"><strong>${esc(outcome(q))}.</strong><p>${guided?'Your answer and highlight are saved. Use the review buttons to compare your reasoning with the passage.':'Your answer and highlight are saved. Compare the evidence below.'}</p></div>`:''}
      <form><fieldset class="choices"><legend>${locked?'Your submitted answer':'Choose your answer'}</legend>
      ${!locked?`<p class="meta" id="elimination-note-${q.id}" role="status">Optional. Eliminate up to two choices. ${excluded.length}/2 eliminated.${excluded.length===2?' Compare the remaining two, or use Undo to restore a choice.':''}</p>`:''}
      ${q.choices.map((choice,i)=>`<div class="choice-row${excluded.includes(i)?' is-eliminated':''}"><label class="choice"><input type="radio" name="answer" value="${i}" ${(locked?first.choice:d.choice)===i?'checked':''} ${locked||excluded.includes(i)?'disabled':''}><strong>${'ABCD'[i]}.</strong><span class="choice-text">${esc(choice)}</span></label>${!locked?`<button class="eliminate-button" type="button" data-eliminate="${i}" aria-label="${excluded.includes(i)?'Restore':'Eliminate'} choice ${'ABCD'[i]}" aria-pressed="${excluded.includes(i)}" aria-describedby="elimination-note-${q.id}" ${excluded.length===2&&!excluded.includes(i)?'disabled':''}>${excluded.includes(i)?'Undo':'Eliminate'}</button>`:excluded.includes(i)?'<span class="eliminated-label">Eliminated</span>':''}</div>`).join('')}</fieldset>
      ${!locked?`<p class="key-label">Your one highlight</p><div data-highlights>${highlightList(q,d.marks,true)}</div><div class="tools"><button class="primary" data-check type="submit" ${canCheck(q)?'':'disabled'}>Check answer</button><button data-clear type="button">Clear highlight</button></div><p class="meta">One try. Choose an answer and highlight one piece of supporting evidence before checking.</p>`:''}</form>${guided?reviewTools(q,first):''}</div></div>
      ${locked&&!guided?comparison(q):''}`;
    if(guided){
      const clue=card.querySelector('[data-clue]'),reason=card.querySelector('[data-reason]');
      clue.onclick=()=>{
        const show=clue.getAttribute('aria-pressed')==='false';
        clue.setAttribute('aria-pressed',String(show));
        clue.textContent=show?'Show my highlight':'Highlight clue';
        card.querySelector('[data-highlight-label]').textContent=show?'Suggested clue is shown.':'Your submitted highlight is shown.';
        card.querySelector('[data-passage]').innerHTML=passageHTML(q,show?C.suggestions(q,paragraphs(q)):first.marks,false);
      };
      reason.onclick=()=>{
        const panel=card.querySelector('.review-reason');
        const show=panel.hidden;
        panel.hidden=!show;
        reason.setAttribute('aria-expanded',String(show));
        reason.textContent=show?'Hide answer review':first.answerOK?'Review my answer':'Show why I missed it';
        const rows=card.querySelectorAll('.choice-row');
        rows[q.answer].classList.toggle('review-correct',show);
        if(!first.answerOK)rows[first.choice].classList.toggle('review-incorrect',show);
      };
    }
    if(locked)return;
    const form=card.querySelector('form');
    form.onchange=event=>{
      if(event.target.name!=='answer')return;
      editDraft(q).choice=Number(event.target.value);
      saveDraft(q);
      setCheck(q,card);
    };
    form.onsubmit=event=>{
      event.preventDefault();
      if(!canCheck(q)||!C.check(q,paragraphs(q),run,new Date().toISOString()))return;
      save();
      renderQuestion(q,card);
      updateOverview();
      card.querySelector('.feedback').focus({preventScroll:true});
    };
    form.querySelectorAll('[data-eliminate]').forEach(button=>{
      button.onclick=()=>{
        const choice=Number(button.dataset.eliminate);
        editDraft(q);
        if(!C.toggleElimination(q,run,choice))return;
        saveDraft(q);
        renderQuestion(q,card);
        card.querySelector(`[data-eliminate="${choice}"]`).focus({preventScroll:true});
      };
    });
    form.onclick=event=>{
      if(!event.target.closest('[data-clear], [data-remove]'))return;
      setHighlight(q,card,[]);
      form.querySelector('[data-clear]').focus({preventScroll:true});
    };
    card.querySelector('[data-selection-action]').onclick=()=>{
      if(pendingSelection?.card!==card)return;
      const selected=C.highlight(paragraphs(q),pendingSelection.ranges);
      if(!selected)return;
      window.getSelection()?.removeAllRanges();
      setHighlight(q,card,selected.ranges);
    };
  }
  function clearPendingSelection(){
    if(!pendingSelection)return;
    const button=pendingSelection.card.querySelector('[data-selection-action]');
    if(button)button.hidden=true;
    pendingSelection=null;
  }
  function setHighlight(q,card,marks){
    editDraft(q).marks=marks;
    saveDraft(q);
    if(pendingSelection?.card===card)clearPendingSelection();
    card.querySelector('[data-passage]').innerHTML=passageHTML(q,marks,true);
    card.querySelector('[data-highlights]').innerHTML=highlightList(q,marks,true);
    setCheck(q,card);
  }
  function toggleSentence(q,card,sentence){
    const p=Number(sentence.dataset.p),start=Number(sentence.dataset.start),end=Number(sentence.dataset.end);
    const overlaps=draft(q).marks.some(mark=>mark.p===p&&mark.start<end&&mark.end>start);
    const focused=document.activeElement===sentence;
    setHighlight(q,card,overlaps?[]:[{p,start,end}]);
    if(focused)card.querySelector(`[data-passage] [data-p="${p}"][data-start="${start}"]`).focus({preventScroll:true});
  }
  function mountQuestion(q){
    const card=document.createElement('section');
    card.className='question-card';
    card.tabIndex=-1;
    card.setAttribute('aria-labelledby',`prompt-${q.id}`);
    card.onclick=event=>{
      const sentence=event.target.closest('.selectable');
      if(sentence&&!window.getSelection()?.toString().trim())toggleSentence(q,card,sentence);
    };
    card.onkeydown=event=>{
      const sentence=event.target.closest('.selectable');
      if(!sentence||(event.key!=='Enter'&&event.key!==' '))return;
      event.preventDefault();
      window.getSelection()?.removeAllRanges();
      toggleSentence(q,card,sentence);
    };
    questionCards.set(q.id,card);
    renderQuestion(q,card);
    return card;
  }
  document.addEventListener('selectionchange',()=>{
    const selection=window.getSelection();
    if(!selection||selection.isCollapsed||!selection.rangeCount)return;
    clearPendingSelection();
    const anchor=selection.anchorNode;
    const element=anchor?.nodeType===Node.ELEMENT_NODE?anchor:anchor?.parentElement;
    const passage=element?.closest('[data-passage]');
    if(!passage?.contains(selection.focusNode))return;
    const card=passage.closest('.question-card');
    const button=card?.querySelector('[data-selection-action]');
    if(!button)return;
    const range=selection.getRangeAt(0),parts=[];
    for(const el of passage.querySelectorAll('.sentence')){
      if(!range.intersectsNode(el))continue;
      const part=document.createRange();part.selectNodeContents(el);let start=0,end=el.textContent.length;
      if(el.contains(range.startContainer)){const r=part.cloneRange();r.setEnd(range.startContainer,range.startOffset);start=r.toString().length;}
      if(el.contains(range.endContainer)){const r=part.cloneRange();r.setEnd(range.endContainer,range.endOffset);end=r.toString().length;}
      if(end>start&&el.textContent.slice(start,end).trim())parts.push({p:Number(el.dataset.p),start:Number(el.dataset.start)+start,end:Number(el.dataset.start)+end});
    }
    if(parts.length){
      pendingSelection={card,ranges:parts};
      button.hidden=false;
    }
  });
  $('#jump').onclick=jumpToQuestion;
  $('#report').onclick=jumpToQuestion;
  $('#review').onclick=()=>{$('#parent').hidden=!$('#parent').hidden;};
  $('#review-end').onclick=()=>{
    $('#parent').hidden=false;
    $('#parent').scrollIntoView({block:'start'});
    $('#history').focus({preventScroll:true});
  };
  $('#wrong').onclick=()=>{onlyWrong=!onlyWrong;$('#wrong').setAttribute('aria-pressed',String(onlyWrong));updateReport();};
  $('#all').onclick=()=>{onlyWrong=false;$('#wrong').setAttribute('aria-pressed','false');updateReport();};
  $('#history').onchange=()=>{
    run=state.articles.evidence.find(r=>r.id===$('#history').value);
    for(const q of D.questions)renderQuestion(q,questionCards.get(q.id));
    updateOverview();
  };
  $('#export').onclick=()=>{
    const file={course:D.appId,exportedAt:new Date().toISOString(),revision:D.revision,state,questions:D.questions.map(q=>({...q,paragraphs:paragraphs(q)}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(file,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=D.exportName||'marco-reading-evidence-2026-11-24.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  $('#sync').hidden=!online;
  questionList.replaceChildren(...D.questions.map(mountQuestion));
  updateOverview();
  status(online?'Connecting to saved work…':'Saved on this device');
  if(online){
    let deviceId;try{deviceId=localStorage.getItem(key+':device')||crypto.randomUUID();localStorage.setItem(key+':device',deviceId);}catch{deviceId=crypto.randomUUID();}
    sync=S.create({getState:()=>state,deviceId,applyState:next=>{
      if(S.stable(next)===S.stable(state))return;
      const previous=run;
      state=next;
      run=state.articles.evidence.find(r=>r.id===previous.id)||state.articles.evidence[0];
      try{localStorage.setItem(key,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}
      for(const q of D.questions){
        const oldAnswer=previous.answers[q.id]?.[0],newAnswer=run.answers[q.id]?.[0];
        const before=oldAnswer??previous.drafts[q.id],after=newAnswer??run.drafts[q.id];
        if(S.stable(before)!==S.stable(after))renderQuestion(q,questionCards.get(q.id));
      }
      updateOverview();
    },onStatus:text=>{
      status(text);
      if(ready||text==='Syncing…')return;
      ready=true;
      for(const q of D.questions)setCheck(q,questionCards.get(q.id));
    }});
    $('#sync').onclick=()=>sync.sync();
    for(const event of ['online','focus','pageshow'])window.addEventListener(event,()=>sync.sync());
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync.sync();});
    setInterval(()=>{if(document.visibilityState==='visible')sync.sync();},30000);void sync.sync();
  }
  if($('#sources'))fetch('source-report.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
    $('#sources').innerHTML=`<p>${esc(data.summary)}</p><div class="table-wrap"><table><thead><tr><th>Original question</th><th>What to practise</th><th>Recorded answers</th><th>New question</th></tr></thead><tbody>${data.items.map(s=>`<tr><td>${esc(s.source)}</td><td>${esc(s.focus)}</td><td>${esc(s.record)}</td><td>Q${s.practice}</td></tr>`).join('')}</tbody></table></div><p class="meta">Verified November 24, 2026. Original test texts stay in their existing review locations; these practice passages are newly written.</p>`;
  }).catch(()=>{$('#sources').textContent='Source list unavailable. The skill match is listed with each completed question.';});
})();
