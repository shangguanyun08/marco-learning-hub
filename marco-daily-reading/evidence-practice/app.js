(() => {
  'use strict';
  const D=window.EvidenceData,C=window.EvidenceCore,S=window.ReadingSync;
  const demo=new URLSearchParams(location.search).has('demo');
  const online=!demo&&location.hostname==='shangguanyun08.github.io';
  const key=D.appId+(online?'':':preview');
  const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state={version:1,articles:{evidence:[]}},run,index=0,ready=!online,onlyTwice=false,pending=[],sync,storageOK=true;
  const expanded=new Set();
  try{if(!demo)state=S.normalize(JSON.parse(localStorage.getItem(key)||'null'));}catch{storageOK=false;}
  state.articles.evidence??=[];
  if(!state.articles.evidence.length)state.articles.evidence.push({id:'primary',startedAt:new Date().toISOString(),position:0,answers:{},drafts:{}});
  run=state.articles.evidence[0];index=Math.min(run.position||0,D.questions.length-1);
  const current=()=>D.questions[index],attempts=q=>run.answers[q.id]||[];
  const paragraphs=q=>D.passages[q.passage].paragraphs;
  function draft(q=current()){return run.drafts[q.id]??={choice:null,marks:[],keywords:[],why:'',updatedAt:new Date().toISOString()};}
  function status(text){$('#save-status').textContent=demo?'Preview · no records saved':!storageOK?'Device storage unavailable · export records':text;$('#save-status').dataset.offline=String(!storageOK||text.startsWith('Not synced'));}
  function save(){
    if(demo){status('Preview');return;}
    try{localStorage.setItem(key,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}
    status(online?'Saved on this device · syncing…':'Saved on this device');sync?.queue();
  }
  function saveDraft(){draft().updatedAt=new Date().toISOString();run.updatedAt=draft().updatedAt;save();}
  function isTwice(q){const a=attempts(q);return a.length>=2&&!a.some(x=>x.answerOK);}
  function outcome(q){const a=attempts(q);return !a.length?'Not answered':a[0].answerOK?'Correct first try':a[1]?.answerOK?'Corrected on retry':a.length>=2?'Wrong twice':'One wrong · retry available';}
  function visibleQuestions(){return D.questions.filter(q=>!onlyTwice||isTwice(q));}
  function updateOverview(){
    const done=D.questions.filter(q=>attempts(q).length),first=done.filter(q=>attempts(q)[0].answerOK).length;
    $('#score').textContent=`${done.length} / ${D.questions.length} answered · ${first} correct first try · ${D.questions.filter(isTwice).length} wrong twice`;
    $('#jump').innerHTML=visibleQuestions().map(q=>`<button type="button" data-jump="${q.id}" class="${q.id===current().id?'active ':''}${C.resolved(attempts(q))?(isTwice(q)?'miss':'done'):''}" aria-label="Question ${D.questions.indexOf(q)+1}: ${esc(outcome(q))}" ${q.id===current().id?'aria-current="step"':''}>${D.questions.indexOf(q)+1}</button>`).join('');
    $('#jump').querySelectorAll('button').forEach(b=>b.onclick=()=>open(b.dataset.jump));
    $('#report').innerHTML=visibleQuestions().map(q=>`<div class="report-row"><p><strong>Q${D.questions.indexOf(q)+1} · ${esc(q.skill)}</strong><br>${esc(outcome(q))}</p><button type="button" data-open="${q.id}">${C.resolved(attempts(q))?'Review evidence':'Open question'}</button></div>`).join('')||'<p>No questions are wrong twice.</p>';
    $('#report').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(C.resolved(attempts(D.questions.find(q=>q.id===b.dataset.open))))expanded.add(b.dataset.open);open(b.dataset.open);});
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
  function highlightList(q,selected,editable){const m=C.marks(paragraphs(q),selected);return m.length?`<ul class="highlight-list">${m.map((r,i)=>`<li><q>${esc(r.quote.trim())}</q>${editable?`<button type="button" data-remove="${i}" aria-label="Remove highlight ${i+1}">Remove</button>`:''}</li>`).join('')}</ul>`:'<p class="empty">No passage highlights yet.</p>';}
  function canCheck(){const q=current(),d=draft();return ready&&!C.resolved(attempts(q))&&Number.isInteger(d.choice)&&!attempts(q).some(a=>a.choice===d.choice)&&C.marks(paragraphs(q),d.marks).length>0&&d.keywords?.length>0;}
  function setCheck(){const b=$('#check');if(b)b.disabled=!canCheck();}
  function keywordHTML(q,list,interactive){return C.tokens(q).map((word,i)=>interactive?`<button class="keyword" type="button" data-k="${i}" aria-label="Mark question word: ${esc(word.trim())}" aria-pressed="${list.includes(i)}">${esc(word)}</button>`:list.includes(i)?`<mark>${esc(word)}</mark>`:esc(word)).join('');}
  function comparison(q){
    const list=attempts(q),model=C.suggestions(q,paragraphs(q));
    return `<section class="compare" aria-label="Evidence comparison"><h3>Compare the proof</h3><p class="proof-note">Read your saved choices and highlights beside the suggested evidence. Other selections can also support an answer. Discuss whether the evidence proves the whole choice.</p>
      <div class="compare-grid"><div class="compare-box"><h3>Your saved evidence</h3>${list.map((a,i)=>`<section><p><strong>Try ${i+1} · ${'ABCD'[a.choice]} · ${a.answerOK?'correct':'incorrect'}</strong></p><p>${esc(q.choices[a.choice])}</p><p class="prompt">${keywordHTML(q,a.keywords||[],false)}</p>${highlightList(q,a.marks,false)}${a.why?`<p><strong>Your reason:</strong> ${esc(a.why)}</p>`:''}<p class="meta"><time datetime="${esc(a.checkedAt)}">${esc(new Date(a.checkedAt).toLocaleString())}</time></p></section>`).join('')}</div>
      <div class="compare-box"><h3>Suggested evidence</h3><p><strong>Answer ${'ABCD'[q.answer]} · ${esc(q.choices[q.answer])}</strong></p>${model.map(m=>`<blockquote>${esc(m.quote)}</blockquote>`).join('')}<p>${esc(q.explanation)}</p><p><strong>Watch for:</strong> ${esc(q.trap)}</p></div></div>
      <details><summary>See both highlights in the full passage</summary><div class="compare-grid"><div><h3>Your latest try</h3><div class="full-proof">${passageHTML(q,list.at(-1).marks,false)}</div></div><div><h3>Suggested support</h3><div class="full-proof">${passageHTML(q,model,false)}</div></div></div></details>
      <p class="meta">Skill match: ${esc(q.source)}</p></section>`;
  }
  function render(){
    updateOverview();
    if(onlyTwice&&!isTwice(current())){$('#workspace').innerHTML='<div class="panel">Choose a question above to compare its evidence. No new answers are required for this filter.</div>';return;}
    const q=current(),d=draft(),list=attempts(q),locked=C.resolved(list),last=list.at(-1),marks=locked?last.marks:d.marks;
    $('#workspace').innerHTML=`<div class="workspace"><article class="panel"><p class="eyebrow">READ THE PASSAGE</p><h2>${esc(D.passages[q.passage].title)}</h2><p class="meta">${locked?'Your latest submitted highlights are shown.':'Tap a sentence, or select exact words and press Highlight selection. Tap again to remove a sentence highlight.'}</p><div id="passage" class="passage">${passageHTML(q,marks,!locked)}</div>${!locked?'<button id="selection-action" type="button" class="primary" hidden>Highlight selection</button>':''}</article>
      <section class="panel" aria-label="Answer workspace"><p class="eyebrow">QUESTION ${index+1} OF ${D.questions.length} · ${esc(q.skill.toUpperCase())}</p><p class="key-label">${locked?'Your question words':'1 · Tap the key words in the question'}</p><div class="prompt" id="prompt">${keywordHTML(q,locked?last.keywords:d.keywords,!locked)}</div>
      ${list.length?`<div class="feedback${last.answerOK?' good':''}" role="status"><strong>${esc(outcome(q))}.</strong><p>${locked?'Both your choice and highlights are saved.': 'Reread the question and passage. Check your evidence, then choose a different answer. Your first highlights are already saved.'}</p></div>`:''}
      <form id="answer-form"><fieldset class="choices"><legend>${locked?'Your submitted choice':'2 · Choose the answer your evidence supports'}</legend>${q.choices.map((choice,i)=>`<label class="choice"><input type="radio" name="answer" value="${i}" ${locked?last.choice===i?'checked':'':d.choice===i?'checked':''} ${locked||list.some(a=>a.choice===i&&!a.answerOK)?'disabled':''}><strong>${'ABCD'[i]}.</strong><span>${esc(choice)}</span></label>`).join('')}</fieldset>
      ${!locked?`<p class="key-label">3 · Your supporting highlights</p><div id="highlights">${highlightList(q,d.marks,true)}</div><label for="why">How does this prove your answer? <span class="meta">(optional)</span></label><textarea id="why" maxlength="500" placeholder="These words show that…">${esc(d.why||'')}</textarea><div class="tools"><button class="primary" id="check" type="submit" ${canCheck()?'':'disabled'}>Check ${list.length?'second':'first'} try</button><button id="clear" type="button">Clear passage highlights</button></div><p class="meta">Mark at least one question word, highlight passage evidence, and choose an answer. Highlights are saved for review, not automatically graded.</p>`:''}</form>
      ${locked?`<button type="button" class="comparison-toggle" id="compare-toggle" aria-expanded="${expanded.has(q.id)}">${expanded.has(q.id)?'Hide evidence comparison':'Compare my evidence'}</button>`:''}
      <div class="tools"><button id="previous" type="button" ${index===0?'disabled':''}>Previous question</button><button id="next" type="button">${index===D.questions.length-1?'Review session':'Next question'}</button></div></section></div>
      ${locked&&(expanded.has(q.id))?comparison(q):''}`;
    bindPassage();
    $('#prompt').querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=Number(b.dataset.k),d=draft();d.keywords=d.keywords.includes(k)?d.keywords.filter(i=>i!==k):[...d.keywords,k];b.setAttribute('aria-pressed',String(d.keywords.includes(k)));saveDraft();setCheck();});
    $('#answer-form').onchange=e=>{if(e.target.name==='answer'){draft().choice=Number(e.target.value);saveDraft();setCheck();}};
    $('#answer-form').onsubmit=e=>{e.preventDefault();if(!canCheck())return;const checked=C.check(q,paragraphs(q),run,new Date().toISOString());if(!checked)return;if(isTwice(q))expanded.add(q.id);save();render();};
    if($('#why'))$('#why').oninput=()=>{draft().why=$('#why').value;saveDraft();};
    if($('#clear'))$('#clear').onclick=()=>{draft().marks=[];saveDraft();refreshMarks();};
    if($('#selection-action'))$('#selection-action').onclick=()=>{draft().marks=C.marks(paragraphs(q),[...draft().marks,...pending]);window.getSelection()?.removeAllRanges();pending=[];saveDraft();refreshMarks();};
    if($('#compare-toggle'))$('#compare-toggle').onclick=()=>{expanded.has(q.id)?expanded.delete(q.id):expanded.add(q.id);render();};
    $('#previous').onclick=()=>open(D.questions[Math.max(0,index-1)].id);
    $('#next').onclick=()=>{if(index===D.questions.length-1){$('#parent').hidden=false;updateOverview();$('#parent').scrollIntoView({behavior:'smooth'});}else open(D.questions[index+1].id);};
    bindRemove();
  }
  function bindRemove(){$('#highlights')?.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{draft().marks=C.marks(paragraphs(current()),draft().marks).filter((_,i)=>i!==Number(b.dataset.remove));saveDraft();refreshMarks();});}
  function bindPassage(){
    $('#passage')?.querySelectorAll('.selectable').forEach(el=>{
      const toggle=()=>{
        if(window.getSelection()?.toString().trim())return;
        const p=Number(el.dataset.p),start=Number(el.dataset.start),end=Number(el.dataset.end),d=draft();
        const intersects=d.marks.some(m=>m.p===p&&m.start<end&&m.end>start);
        d.marks=intersects?d.marks.filter(m=>m.p!==p||m.end<=start||m.start>=end):[...d.marks,{p,start,end}];
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
  $('#twice').onclick=()=>{onlyTwice=!onlyTwice;$('#twice').setAttribute('aria-pressed',String(onlyTwice));if(onlyTwice&&D.questions.some(isTwice))index=D.questions.findIndex(isTwice);render();};
  $('#all').onclick=()=>{onlyTwice=false;$('#twice').setAttribute('aria-pressed','false');render();};
  $('#history').onchange=()=>{run=state.articles.evidence.find(r=>r.id===$('#history').value);index=Math.min(run.position||0,D.questions.length-1);render();};
  $('#export').onclick=()=>{
    const file={course:D.appId,exportedAt:new Date().toISOString(),revision:D.revision,state,questions:D.questions.map(q=>({...q,paragraphs:paragraphs(q)}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(file,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='marco-reading-evidence-2026-11-24.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  $('#sync').hidden=!online;
  D.questions.filter(isTwice).forEach(q=>expanded.add(q.id));
  render();status(online?'Connecting to saved work…':'Saved on this device');
  if(online){
    let deviceId;try{deviceId=localStorage.getItem(key+':device')||crypto.randomUUID();localStorage.setItem(key+':device',deviceId);}catch{deviceId=crypto.randomUUID();}
    sync=S.create({getState:()=>state,deviceId,applyState:next=>{
      if(S.stable(next)===S.stable(state))return;
      const id=run.id;state=next;state.articles.evidence??=[];run=state.articles.evidence.find(r=>r.id===id)||state.articles.evidence[0];
      try{localStorage.setItem(key,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}D.questions.filter(isTwice).forEach(q=>expanded.add(q.id));render();
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
