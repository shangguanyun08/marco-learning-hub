(() => {
  'use strict';
  const D=window.EvidenceData,C=window.EvidenceCore,S=window.ReadingSync;
  const demo=new URLSearchParams(location.search).has('demo');
  const online=!demo&&location.hostname==='shangguanyun08.github.io';
  const key=D.appId+(online?'':':preview');
  const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state={version:1,articles:{evidence:[]}},run,index=0,ready=!online,onlyWrong=false,pending=[],sync,storageOK=true;
  try{if(!demo)state=S.normalize(JSON.parse(localStorage.getItem(key)||'null'));}catch{storageOK=false;}
  state.articles.evidence??=[];
  if(!state.articles.evidence.length)state.articles.evidence.push({id:'primary',startedAt:new Date().toISOString(),position:0,answers:{},drafts:{}});
  run=state.articles.evidence[0];index=Math.min(run.position||0,D.questions.length-1);
  const current=()=>D.questions[index],attempts=q=>run.answers[q.id]||[];
  const paragraphs=q=>D.passages[q.passage].paragraphs;
  function draft(q=current()){return run.drafts[q.id]??={choice:null,marks:[],eliminated:[],updatedAt:new Date().toISOString()};}
  function status(text){$('#save-status').textContent=demo?'Preview · no records saved':!storageOK?'Device storage unavailable · export records':text;$('#save-status').dataset.offline=String(!storageOK||text.startsWith('Not synced'));}
  function save(){
    if(demo){status('Preview');return;}
    try{localStorage.setItem(key,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}
    status(online?'Saved on this device · syncing…':'Saved on this device');sync?.queue();
  }
  function saveDraft(){draft().updatedAt=new Date().toISOString();run.updatedAt=draft().updatedAt;save();}
  function isWrong(q){return attempts(q)[0]?.answerOK===false;}
  function outcome(q){const a=attempts(q);return !a.length?'Not answered':a[0].answerOK?'Correct':'Incorrect';}
  function visibleQuestions(){return D.questions.filter(q=>!onlyWrong||isWrong(q));}
  function updateOverview(){
    const done=D.questions.filter(q=>attempts(q).length),first=done.filter(q=>attempts(q)[0].answerOK).length;
    $('#score').textContent=`${done.length} / ${D.questions.length} answered · ${first} correct · ${D.questions.filter(isWrong).length} incorrect`;
    $('#jump').innerHTML=visibleQuestions().map(q=>`<button type="button" data-jump="${q.id}" class="${q.id===current().id?'active ':''}${C.resolved(attempts(q))?(isWrong(q)?'miss':'done'):''}" aria-label="Question ${D.questions.indexOf(q)+1}: ${esc(outcome(q))}" ${q.id===current().id?'aria-current="step"':''}>${D.questions.indexOf(q)+1}</button>`).join('');
    $('#jump').querySelectorAll('button').forEach(b=>b.onclick=()=>open(b.dataset.jump));
    $('#report').innerHTML=visibleQuestions().map(q=>`<div class="report-row"><p><strong>Q${D.questions.indexOf(q)+1} · ${esc(q.skill)}</strong><br>${esc(outcome(q))}</p><button type="button" data-open="${q.id}">${C.resolved(attempts(q))?'Review evidence':'Open question'}</button></div>`).join('')||'<p>No incorrect answers.</p>';
    $('#report').querySelectorAll('button').forEach(b=>b.onclick=()=>open(b.dataset.open));
    $('#history').innerHTML=state.articles.evidence.map((r,i)=>`<option value="${esc(r.id)}" ${r.id===run.id?'selected':''}>${state.articles.evidence.length>1?'Saved history '+(i+1):'Current session'}${r.syncRoot?' · concurrent work preserved':''}</option>`).join('');
  }
  function open(id){index=D.questions.findIndex(q=>q.id===id);run.position=index;run.updatedAt=new Date().toISOString();pending=[];save();render();$('#workspace').scrollIntoView({block:'start',behavior:'smooth'});}
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
  function canCheck(){const q=current(),d=draft();return ready&&!C.resolved(attempts(q))&&Number.isInteger(d.choice)&&!C.eliminations(d.eliminated).includes(d.choice)&&!!C.highlight(paragraphs(q),d.marks);}
  function setCheck(){const b=$('#check');if(b)b.disabled=!canCheck();}
  function comparison(q){
    const a=attempts(q)[0],model=C.suggestions(q,paragraphs(q));
    return `<section class="compare" aria-label="Evidence comparison"><h3>Compare the proof</h3><p class="proof-note">Does your highlight prove your answer? Compare it with the suggested evidence.</p>
      <div class="compare-grid"><div class="compare-box"><h3>Your highlight</h3><section><p><strong>Your answer: ${'ABCD'[a.choice]} · ${a.answerOK?'correct':'incorrect'}</strong></p><p>${esc(q.choices[a.choice])}</p>${C.eliminations(a.eliminated).length?`<p class="meta">Eliminated: ${C.eliminations(a.eliminated).map(i=>'ABCD'[i]).join(', ')}</p>`:''}${highlightList(q,a.marks,false)}<p class="meta"><time datetime="${esc(a.checkedAt)}">${esc(new Date(a.checkedAt).toLocaleString())}</time></p></section></div>
      <div class="compare-box"><h3>Suggested evidence</h3><p><strong>Answer ${'ABCD'[q.answer]} · ${esc(q.choices[q.answer])}</strong></p>${model.map(m=>`<blockquote>${esc(m.quote)}</blockquote>`).join('')}<p>${esc(q.explanation)}</p><p><strong>Watch for:</strong> ${esc(q.trap)}</p></div></div>
      <details><summary>See the highlights in the full passage</summary><div class="compare-grid"><div><h3>Your highlight</h3><div class="full-proof">${passageHTML(q,a.marks,false)}</div></div><div><h3>Suggested support</h3><div class="full-proof">${passageHTML(q,model,false)}</div></div></div></details>
      <p class="meta">Skill match: ${esc(q.source)}</p></section>`;
  }
  function render(){
    updateOverview();
    if(onlyWrong&&!isWrong(current())){$('#workspace').innerHTML='<div class="panel">Choose a question above to review its evidence.</div>';return;}
    const q=current(),d=draft(),list=attempts(q),locked=C.resolved(list),first=list[0],marks=locked?first.marks:d.marks;
    const excluded=C.eliminations(locked?first.eliminated:d.eliminated);
    $('#workspace').innerHTML=`<div class="workspace"><article class="panel"><p class="eyebrow">READ THE PASSAGE</p><h2>${esc(D.passages[q.passage].title)}</h2><p class="meta">${locked?'Your submitted highlight is shown.':'Tap one sentence, or select a passage excerpt and press Highlight selection. A new highlight replaces your previous selection.'}</p><div id="passage" class="passage">${passageHTML(q,marks,!locked)}</div>${!locked?'<button id="selection-action" type="button" class="primary" hidden>Highlight selection</button>':''}</article>
      <section class="panel" aria-label="Answer workspace"><p class="eyebrow">QUESTION ${index+1} OF ${D.questions.length} · ${esc(q.skill.toUpperCase())}</p><div class="prompt" id="prompt">${esc(q.prompt)}</div>
      ${locked?`<div class="feedback${first.answerOK?' good':''}" role="status"><strong>${esc(outcome(q))}.</strong><p>Your answer and highlight are saved. Compare the evidence below.</p></div>`:''}
      <form id="answer-form"><fieldset class="choices"><legend>${locked?'Your submitted answer':'Choose your answer'}</legend>
      ${!locked?`<p class="meta" id="elimination-note" role="status">Optional: eliminate up to two choices. ${excluded.length}/2 eliminated.${excluded.length===2?' Compare the remaining two, or Undo to change your eliminations.':''}</p>`:''}
      ${q.choices.map((choice,i)=>`<div class="choice-row${excluded.includes(i)?' is-eliminated':''}"><label class="choice"><input type="radio" name="answer" value="${i}" ${locked?first.choice===i?'checked':'':d.choice===i?'checked':''} ${locked||excluded.includes(i)?'disabled':''}><strong>${'ABCD'[i]}.</strong><span class="choice-text">${esc(choice)}</span></label>${!locked?`<button class="eliminate-button" type="button" data-eliminate="${i}" aria-label="${excluded.includes(i)?'Restore':'Eliminate'} choice ${'ABCD'[i]}" aria-pressed="${excluded.includes(i)}" aria-describedby="elimination-note" ${excluded.length===2&&!excluded.includes(i)?'disabled':''}>${excluded.includes(i)?'Undo':'Eliminate'}</button>`:excluded.includes(i)?'<span class="eliminated-label">Eliminated</span>':''}</div>`).join('')}</fieldset>
      ${!locked?`<p class="key-label">Your one highlight</p><div id="highlights">${highlightList(q,d.marks,true)}</div><div class="tools"><button class="primary" id="check" type="submit" ${canCheck()?'':'disabled'}>Check answer</button><button id="clear" type="button">Clear highlight</button></div><p class="meta">One try. Choose an answer and highlight one piece of supporting evidence before checking.</p>`:''}</form>
      <div class="tools"><button id="previous" type="button" ${index===0?'disabled':''}>Previous question</button><button id="next" type="button">${index===D.questions.length-1?'Review session':'Next question'}</button></div></section></div>
      ${locked?comparison(q):''}`;
    bindPassage();
    $('#answer-form').onchange=e=>{if(e.target.name==='answer'){draft().choice=Number(e.target.value);saveDraft();setCheck();}};
    $('#answer-form').querySelectorAll('[data-eliminate]').forEach(b=>b.onclick=()=>{
      const choice=Number(b.dataset.eliminate);
      if(!C.toggleElimination(q,run,choice))return;
      saveDraft();render();$('#answer-form').querySelector(`[data-eliminate="${choice}"]`)?.focus({preventScroll:true});
    });
    $('#answer-form').onsubmit=e=>{e.preventDefault();if(!canCheck())return;const checked=C.check(q,paragraphs(q),run,new Date().toISOString());if(!checked)return;save();render();};
    if($('#clear'))$('#clear').onclick=()=>{draft().marks=[];saveDraft();refreshMarks();};
    if($('#selection-action'))$('#selection-action').onclick=()=>{const selected=C.highlight(paragraphs(q),pending);if(!selected)return;draft().marks=selected.ranges;window.getSelection()?.removeAllRanges();pending=[];saveDraft();refreshMarks();};
    $('#previous').onclick=()=>open(D.questions[Math.max(0,index-1)].id);
    $('#next').onclick=()=>{if(index===D.questions.length-1){$('#parent').hidden=false;updateOverview();$('#parent').scrollIntoView({behavior:'smooth'});}else open(D.questions[index+1].id);};
    bindRemove();
  }
  function bindRemove(){$('#highlights')?.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{draft().marks=[];saveDraft();refreshMarks();});}
  function bindPassage(){
    $('#passage')?.querySelectorAll('.selectable').forEach(el=>{
      const toggle=()=>{
        if(window.getSelection()?.toString().trim())return;
        const p=Number(el.dataset.p),start=Number(el.dataset.start),end=Number(el.dataset.end),d=draft();
        const intersects=d.marks.some(m=>m.p===p&&m.start<end&&m.end>start);
        d.marks=intersects?[]:[{p,start,end}];
        const focused=document.activeElement===el;saveDraft();refreshMarks(focused?{p,start}:null);
      };
      el.onclick=toggle;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.getSelection()?.removeAllRanges();toggle();}};
    });
  }
  function refreshMarks(focus){
    const q=current();pending=[];$('#passage').innerHTML=passageHTML(q,draft().marks,true);$('#highlights').innerHTML=highlightList(q,draft().marks,true);$('#selection-action').hidden=true;bindPassage();bindRemove();setCheck();
    if(focus)$('#passage').querySelector(`[data-p="${focus.p}"][data-start="${focus.start}"]`)?.focus({preventScroll:true});
  }
  document.addEventListener('selectionchange',()=>{
    const button=$('#selection-action'),passage=$('#passage'),selection=window.getSelection();if(!button)return;
    if(!selection||selection.isCollapsed||!selection.rangeCount||!passage.contains(selection.anchorNode)||!passage.contains(selection.focusNode))return;
    const range=selection.getRangeAt(0),parts=[];
    for(const el of passage.querySelectorAll('.sentence')){
      if(!range.intersectsNode(el))continue;
      const part=document.createRange();part.selectNodeContents(el);let start=0,end=el.textContent.length;
      if(el.contains(range.startContainer)){const r=part.cloneRange();r.setEnd(range.startContainer,range.startOffset);start=r.toString().length;}
      if(el.contains(range.endContainer)){const r=part.cloneRange();r.setEnd(range.endContainer,range.endOffset);end=r.toString().length;}
      if(end>start&&el.textContent.slice(start,end).trim())parts.push({p:Number(el.dataset.p),start:Number(el.dataset.start)+start,end:Number(el.dataset.start)+end});
    }
    pending=parts;button.hidden=!parts.length;
  });
  $('#review').onclick=()=>{$('#parent').hidden=!$('#parent').hidden;updateOverview();};
  $('#wrong').onclick=()=>{onlyWrong=!onlyWrong;$('#wrong').setAttribute('aria-pressed',String(onlyWrong));if(onlyWrong&&D.questions.some(isWrong))index=D.questions.findIndex(isWrong);render();};
  $('#all').onclick=()=>{onlyWrong=false;$('#wrong').setAttribute('aria-pressed','false');render();};
  $('#history').onchange=()=>{run=state.articles.evidence.find(r=>r.id===$('#history').value);index=Math.min(run.position||0,D.questions.length-1);render();};
  $('#export').onclick=()=>{
    const file={course:D.appId,exportedAt:new Date().toISOString(),revision:D.revision,state,questions:D.questions.map(q=>({...q,paragraphs:paragraphs(q)}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(file,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='marco-reading-evidence-2026-11-24.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  $('#sync').hidden=!online;
  render();status(online?'Connecting to saved work…':'Saved on this device');
  if(online){
    let deviceId;try{deviceId=localStorage.getItem(key+':device')||crypto.randomUUID();localStorage.setItem(key+':device',deviceId);}catch{deviceId=crypto.randomUUID();}
    sync=S.create({getState:()=>state,deviceId,applyState:next=>{
      if(S.stable(next)===S.stable(state))return;
      const id=run.id;state=next;state.articles.evidence??=[];run=state.articles.evidence.find(r=>r.id===id)||state.articles.evidence[0];
      try{localStorage.setItem(key,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}render();
    },onStatus:text=>{status(text);if(text!=='Syncing…')ready=true;setCheck();}});
    $('#sync').onclick=()=>sync.sync();
    for(const event of ['online','focus','pageshow'])window.addEventListener(event,()=>sync.sync());
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync.sync();});
    setInterval(()=>{if(document.visibilityState==='visible')sync.sync();},30000);void sync.sync();
  }
  fetch('source-report.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
    $('#sources').innerHTML=`<p>${esc(data.summary)}</p><div class="table-wrap"><table><thead><tr><th>Original question</th><th>What to practise</th><th>Recorded answers</th><th>New question</th></tr></thead><tbody>${data.items.map(s=>`<tr><td>${esc(s.source)}</td><td>${esc(s.focus)}</td><td>${esc(s.record)}</td><td>Q${s.practice}</td></tr>`).join('')}</tbody></table></div><p class="meta">Verified November 24, 2026. Original test texts stay in their existing review locations; these practice passages are newly written.</p>`;
  }).catch(()=>{$('#sources').textContent='Source list unavailable. The skill match is listed with each completed question.';});
})();
