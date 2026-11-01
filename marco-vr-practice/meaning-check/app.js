(function(){
 'use strict';
 const data=window.MARCO_MEANING_PRACTICE,history=window.MARCO_MEANING_HISTORY||{words:{}},doc=document,byId=id=>doc.getElementById(id),demo=new URLSearchParams(location.search).has('demo');
 const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const shortMeanings=window.MARCO_SHORT_MEANINGS||{};
 const ROUND_COUNT=3;
 const words=new Map(data.words.map(w=>[w.id,w])),viewKey=data.appId+(demo?':demo':'')+':place';
 let current={},selected={section:1,round:1},initialPlace=selected,rendered='',historyRendered='',touched=false,sync;
 function readPlace(){const match=location.hash.match(/^#(?:section-)(\d+)(?:-round-(\d+))?$/);if(match)return {section:Number(match[1]),round:Number(match[2]||1)};try{return JSON.parse(localStorage.getItem(viewKey));}catch{return null;}}
 const savedPlace=readPlace();
 function validPlace(p){return p&&data.sections.some(s=>s.number===p.section)&&Number.isSafeInteger(p.round)&&p.round>=1&&p.round<=ROUND_COUNT;}
 function latestRound(section){return Math.min(ROUND_COUNT,Math.max(1,...Object.values(current.rounds||{}).filter(r=>r.section===section).map(r=>r.round),...Object.values(current.roundSubmissions||{}).filter(r=>r.section===section).map(r=>r.round)));}
 function resumePlace(){
  if(validPlace(savedPlace)&&sync.roundView(savedPlace.section,savedPlace.round)?.available)return savedPlace;
  const section=data.sections.find(s=>!sync.roundView(s.number,ROUND_COUNT).finished)?.number||data.sections[0].number;
  let round=latestRound(section);if(sync.roundView(section,round).submitted&&round<ROUND_COUNT)round++;
  return {section,round};
 }
 function remember(){try{localStorage.setItem(viewKey,JSON.stringify(selected));}catch{}}
 function select(section,round,{navigate=true}={}){
  const target={section,round};if(!validPlace(target))return;
  const result=sync.openRound(section,round);if(!result.ok){byId('action-note').textContent=result.reason;return;}
  selected=target;touched=true;remember();
  if(navigate)location.hash=`section-${section}-round-${round}`;
  update(sync.view());
 }
 byId('list-summary').textContent=`${data.total} words · ${data.sections.length} sections · One section at a time.`;
 byId('sections').innerHTML=data.sections.map(s=>`<button type="button" data-section="${s.number}">Section ${s.number}<small>${s.count} words</small></button>`).join('');
 function seenMarkup(w){const r=history.words[w.id];return '<details class="seen"><summary aria-label="'+esc(w.word)+': recorded encounters">'+(r?.count?'≥ '+r.count:'No record')+'</summary><div class="seen-detail">'+(r?.count?'<strong>Minimum documented encounters</strong><ul>'+r.sources.map(s=>'<li>'+esc(s.label)+': '+s.count+'</li>').join('')+'</ul>':'No counted main-target answer found. This does not mean he has never seen the word.')+'</div></details>';}
 byId('audit-note').textContent='Encounters are minimum recorded main-target answers (≥), not proof of mastery. History checked: '+(history.checkedAt?new Date(history.checkedAt).toLocaleDateString():'unavailable')+'.';
 byId('coverage-list').innerHTML=(history.coverage||[]).map(s=>'<li>'+esc(s.source)+' · '+esc(s.status)+(s.note?' — '+esc(s.note):'')+'</li>').join('');
 byId('trimmed-list').textContent=data.excluded.map(w=>w.word).join(', ');
 function renderRound(v){
  const s=data.sections.find(s=>s.number===selected.section),{round}=selected;
  byId('rounds').innerHTML=Array.from({length:ROUND_COUNT},(_,i)=>{const n=i+1,r=sync.roundView(s.number,n);return `<button type="button" data-round="${n}" ${r.available?'':'disabled'} ${n===round?'aria-current="step"':''}>Round ${n}${r.finished?' <span aria-label="saved copy">✓</span>':''}</button>`;}).join('');
  byId('word-list').innerHTML=`<section class="word-section" id="section-${s.number}" aria-labelledby="section-heading"><div class="section-heading"><div><p class="eyebrow">SECTION ${s.number} OF ${data.sections.length}</p><h2 id="section-heading" tabindex="-1">Round ${round}</h2><p class="round-instruction">All ${s.count} words in a shuffled order. Write a simple meaning, or choose “I don’t know” to see help.</p><p class="section-progress" id="round-progress"></p></div><button type="button" id="finish-round">Finish Round ${round}</button></div><div class="column-head" aria-hidden="true"><span>#</span><span>Word</span><span>Encounters ≥</span><span>Your simple meaning</span><span>Or</span></div>${v.order.map((id,i)=>{const w=words.get(id);return `<div class="word-row" data-word="${esc(id)}"><span class="word-number">${i+1}</span><label class="word" for="meaning-${esc(id)}"><strong>${esc(w.word)}</strong></label>${seenMarkup(w)}<input class="meaning" id="meaning-${esc(id)}" data-field="meaning" type="text" maxlength="240" placeholder="1–3 simple words" autocomplete="off" spellcheck="true" aria-label="${esc(w.word)}: your simple meaning"><button type="button" class="unknown" data-field="unknown" aria-pressed="false" aria-label="I don't know ${esc(w.word)}">I don’t know</button><div class="revealed-meaning" data-definition="${esc(id)}" hidden></div></div>`;}).join('')}<div class="section-footer"><p id="submission-note"></p><p id="round-result"></p><div class="continue-actions"><button type="button" id="finish-round-bottom">Finish Round ${round}</button><button type="button" id="next-round" hidden></button><button type="button" class="secondary" data-next-section ${s.number===data.sections.length?'hidden':''}>Next section →</button></div><details id="saved-copies"><summary>Review saved rounds for this section</summary><div id="round-history"></div></details></div></section>`;
  rendered=selected.section+':'+round+':'+v.order.join(',');historyRendered='';
 }
 function update(value){
  current=value;if(!sync)return;
  if(!touched){selected=resumePlace();initialPlace={...selected};}
  let v=sync.roundView(selected.section,selected.round);if(!v?.available){selected={section:selected.section,round:1};v=sync.roundView(selected.section,1);}
  const s=data.sections.find(s=>s.number===selected.section),key=selected.section+':'+selected.round+':'+v.order.join(',');
  if(rendered!==key)renderRound(v);
  doc.querySelectorAll('[data-section]').forEach(el=>{const n=Number(el.dataset.section),r=latestRound(n),rv=sync.roundView(n,r);if(n===s.number)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');el.classList.toggle('is-complete',sync.roundView(n,ROUND_COUNT).finished);el.querySelector('small').textContent=`R${r}: ${rv.recorded}/${data.sections.find(x=>x.number===n).count}`;});
  // Update controls in place so typing, selection and input focus survive every save.
  doc.querySelectorAll('[data-word]').forEach(el=>{const id=el.dataset.word,entry=v.entries[id]||{meaning:'',unknown:false},input=el.querySelector('.meaning');if(input.value!==entry.meaning)input.value=entry.meaning;input.disabled=entry.unknown;el.querySelector('[data-field=unknown]').setAttribute('aria-pressed',String(entry.unknown));const reveal=el.querySelector('[data-definition]');reveal.hidden=!entry.unknown;if(entry.unknown)reveal.textContent=shortMeanings[id]||'Ask together';});
  byId('overall-progress').textContent=`Section ${s.number} · Round ${selected.round} · ${v.recorded}/${s.count} responses recorded`;
  byId('round-progress').textContent=`${v.written} explanations written · ${v.recorded-v.written} “I don’t know” · ${s.count-v.recorded} left`;
  const finish=byId('finish-round');finish.disabled=v.recorded<s.count||v.submitted;finish.textContent=v.submitted?'Round saved ✓':`Finish Round ${selected.round}`;const finishBottom=byId('finish-round-bottom');finishBottom.disabled=finish.disabled;finishBottom.textContent=finish.textContent;finishBottom.hidden=v.submitted;
  byId('submission-note').textContent=v.copies.length?`${v.copies.length} saved ${v.copies.length===1?'copy':'copies'} of this round. ${v.submitted?'Your current responses are saved.':'Your edits are a separate draft; finish again to save a revised copy.'}`:'Your draft saves as you type. Finish the round after answering every word.';
  byId('round-result').textContent=v.submitted?(v.written===s.count?'You wrote an explanation for every word. Review the meanings together; this is not a correctness score.':'Round finished. It is fine to need help. Try every word again in the next round.'):'Responses are not automatically graded. Close meanings are welcome.';
  const next=byId('next-round');next.hidden=!v.submitted||selected.round>=ROUND_COUNT;next.textContent=`Start Round ${selected.round+1}`;
  doc.querySelectorAll('[data-round]').forEach(el=>{const r=sync.roundView(s.number,Number(el.dataset.round));el.disabled=!r.available;el.innerHTML=`Round ${el.dataset.round}${r.finished?' <span aria-label="saved copy">✓</span>':''}`;});
  const savedRounds=Array.from({length:latestRound(s.number)},(_,i)=>sync.roundView(s.number,i+1)).filter(r=>r.copies.length),historyKey=JSON.stringify(savedRounds.map(r=>({round:r.round,copies:r.copies})));
  if(historyKey!==historyRendered){byId('round-history').innerHTML=savedRounds.map(r=>`<details><summary>Round ${r.round} · ${r.copies.length} saved ${r.copies.length===1?'copy':'copies'}</summary>${r.copies.map(copy=>`<p class="small">${esc(new Date(copy.at).toLocaleString())}</p><dl>${copy.responses.map(response=>`<div><dt>${esc(words.get(response.id).word)}</dt><dd>${esc(response.unknown?'I don’t know':response.meaning)}</dd></div>`).join('')}</dl>`).join('')}</details>`).join('')||'<p>No finished rounds yet. Your draft is still saved.</p>';historyRendered=historyKey;}
  const legacy=Object.values(current.submissions||{});byId('legacy-note').textContent=legacy.length?`${legacy.length} earlier submitted copies are preserved in Download responses, along with the original answers.`:'Earlier answers, if any, are kept in Round 1 and in Download responses.';
 }
 sync=window.MeaningCheckSync.create({data,legacyData:window.MARCO_MEANING_CHECK,disabled:demo,onState:update,onStatus(kind,text){byId('save-note').dataset.kind=kind;byId('save-note').textContent=text;}});
 update(sync.view());void sync.start().then(()=>update(sync.view()));
 byId('sections').addEventListener('click',e=>{const button=e.target.closest('[data-section]');if(button){const section=Number(button.dataset.section);select(section,latestRound(section));}});
 byId('rounds').addEventListener('click',e=>{const button=e.target.closest('[data-round]');if(button&&!button.disabled)select(selected.section,Number(button.dataset.round));});
 window.addEventListener('hashchange',()=>{const p=location.hash?readPlace():initialPlace;if(validPlace(p))select(p.section,p.round,{navigate:false});});
 byId('word-list').addEventListener('input',e=>{if(e.target.matches('[data-field=meaning]')){touched=true;remember();sync.editRound(selected.section,selected.round,e.target.closest('[data-word]').dataset.word,'meaning',e.target.value);}});
 byId('word-list').addEventListener('click',async e=>{
  const unknown=e.target.closest('[data-field=unknown]');if(unknown){touched=true;remember();const id=unknown.closest('[data-word]').dataset.word;sync.editRound(selected.section,selected.round,id,'unknown',!sync.roundView(selected.section,selected.round).entries[id]?.unknown);return;}
  if(e.target.closest('#next-round')){select(selected.section,selected.round+1);byId('section-heading').focus();return;}
  if(e.target.closest('[data-next-section]')){select(selected.section+1,latestRound(selected.section+1));byId('section-heading').focus();return;}
  if(e.target.closest('#finish-round,#finish-round-bottom')){touched=true;remember();const {section,round}=selected,result=sync.submitRound(section,round);if(!result.ok){byId('action-note').textContent=result.reason;return;}byId('action-note').textContent=`Section ${section} · Round ${round}: saved on this device.`;const ok=await sync.flush();byId('action-note').textContent=`Section ${section} · Round ${round}: ${ok?'saved online for review.':demo?'saved in this preview.':'saved on this device; online save is not confirmed yet.'}`;}
 });
 byId('restore').addEventListener('click',async()=>{const button=byId('restore');button.disabled=true;const result=await sync.restore();button.disabled=false;byId('action-note').textContent=result.ok?'Saved answers and rounds loaded.':'Please reconnect and try again.';});
 byId('save').addEventListener('click',async()=>{const ok=await sync.flush();byId('action-note').textContent=ok?'All current responses are saved online.':'Online save is not confirmed. Your device copy is retained.';});
 byId('download').addEventListener('click',()=>{const exported={title:data.title,exportedAt:new Date().toISOString(),total:data.total,historyCheckedAt:history.checkedAt,history:history.words,notAutomaticallyGraded:true,words:data.words.map(w=>({...w,legacyResponse:current.entries[w.id]||{meaning:'',unknown:false,tone:''}})),state:sync.snapshot()},blob=new Blob([JSON.stringify(exported,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=doc.createElement('a');a.href=url;a.download='Marco-word-meaning-responses.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);byId('action-note').textContent='Downloaded every round, the original answers and all submitted copies.';});
 byId('copy').addEventListener('click',async()=>{const v=sync.roundView(selected.section,selected.round),text=[`Section ${selected.section} · Round ${selected.round}`,"Please review Marco’s meanings generously. Accept close meanings and ignore minor spelling errors. These responses have not been automatically graded.",'',...v.order.map((id,i)=>{const w=words.get(id),r=v.entries[id];return `${i+1}. ${w.word}: ${r?.unknown?'I don’t know':r?.meaning||'[not answered]'}`;})].join('\n');try{await navigator.clipboard.writeText(text);byId('action-note').textContent='This round copied for review.';}catch{byId('action-note').textContent='Clipboard unavailable. Use Download responses instead.';}});
 byId('print').addEventListener('click',()=>window.print());
 if(!demo){let poll=null;function resume(){if(poll===null)poll=setInterval(()=>{if(!doc.hidden)void sync.flush();},12000);void sync.flush();}window.addEventListener('focus',resume);window.addEventListener('online',resume);window.addEventListener('pageshow',resume);doc.addEventListener('visibilitychange',()=>void sync.flush());window.addEventListener('storage',event=>{if([sync.key,sync.legacyKey].includes(event.key)&&event.newValue){sync.receiveLocal(event.newValue);void sync.flush();}});window.addEventListener('pagehide',()=>{clearInterval(poll);poll=null;void sync.flush();});resume();}
})();
