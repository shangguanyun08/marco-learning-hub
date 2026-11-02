(function(){
 'use strict';
 const data=window.MARCO_FOCUSED_ROUND2,doc=document,$=id=>doc.getElementById(id),demo=new URLSearchParams(location.search).has('demo'),byWord=new Map(data.words.map(w=>[w.id,w]));
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const placeKey=data.appId+(demo?':demo':'')+':place';
 let section=1,sync,rendered='',touched=false;
 function valid(n){return data.sections.some(s=>s.number===n);}
 function readPlace(){const hash=location.hash.match(/^#section-(\d+)$/);if(hash)return Number(hash[1]);try{return Number(localStorage.getItem(placeKey));}catch{return 1;}}
 const initial=readPlace();if(valid(initial))section=initial;
 $('list-summary').textContent=`${data.total} words · ${data.sections.length} sections · 50 words at a time (${data.sections.at(-1).count} in the last section).`;
 $('selection-note').textContent=`Selected after reviewing all ${data.sourceTotal} Round 1 answers: ${data.counts.unknown} “I don’t know” responses and ${data.counts['not-close']} meanings to revisit. ${data.counts.close} close-enough answers are left out of this round. Four extra words have been added to Section 6: MIRTH, DOUSE, PERPETUAL, and IMPENETRABLE.`;
 $('sections').innerHTML=data.sections.map(s=>`<button type="button" data-section="${s.number}">Section ${s.number}<small>0/${s.count}</small></button>`).join('');
 function select(n){if(!valid(n))return;section=n;touched=true;try{localStorage.setItem(placeKey,String(n));}catch{}location.hash=`section-${n}`;update();$('section-heading').focus();}
 function render(v){
  const s=data.sections.find(x=>x.number===section);
  $('word-list').innerHTML=`<section class="word-section" aria-labelledby="section-heading"><div class="section-heading"><div><p class="eyebrow">ROUND 2 · SECTION ${s.number} OF ${data.sections.length}</p><h2 id="section-heading" tabindex="-1">Your simple meanings</h2><p class="round-instruction">Try every word. A close meaning is good enough.</p><p class="section-progress" id="section-progress"></p></div><button type="button" id="finish-section">Finish section</button></div><div class="column-head" aria-hidden="true"><span>#</span><span>Word</span><span>Your simple meaning</span><span>Or</span></div>${v.order.map((id,i)=>{const w=byWord.get(id);return `<div class="word-row" data-word="${esc(id)}"><span class="word-number">${i+1}</span><label class="word" for="meaning-${esc(id)}"><strong>${esc(w.word)}</strong></label><input class="meaning" type="text" id="meaning-${esc(id)}" maxlength="240" placeholder="1–3 simple words" autocomplete="off" spellcheck="true" aria-label="${esc(w.word)}: your simple meaning"><button type="button" class="unknown" aria-pressed="false" aria-label="I don't know ${esc(w.word)}">I don’t know</button><div class="revealed-meaning" hidden></div></div>`;}).join('')}<div class="section-footer"><p id="submission-note"></p><p id="completion-note"></p><div class="continue-actions"><button type="button" id="finish-bottom">Finish section</button><button type="button" id="next-section" ${section===data.sections.length?'hidden':''}>Next section →</button></div><details id="saved-copies"><summary>Review saved copies of this section</summary><div id="copy-history"></div></details></div></section>`;
  rendered=section+':'+v.order.join(',');
 }
 function update(){
  if(!sync)return;
  const views=data.sections.map(s=>sync.roundView(s.number,1));
  // Restore saved location when available; otherwise resume the first incomplete section.
  if(!touched&&!valid(initial))section=views.find(v=>!v.submitted)?.section||1;
  const v=views.find(x=>x.section===section),s=data.sections.find(x=>x.number===section),key=section+':'+v.order.join(',');
  if(key!==rendered)render(v);
  doc.querySelectorAll('[data-section]').forEach(el=>{const n=Number(el.dataset.section),sv=views.find(x=>x.section===n),count=data.sections.find(x=>x.number===n).count;el.querySelector('small').textContent=`${sv.recorded}/${count}${sv.submitted?' ✓':''}`;el.classList.toggle('is-complete',sv.submitted);if(n===section)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');});
  doc.querySelectorAll('[data-word]').forEach(el=>{const id=el.dataset.word,r=v.entries[id]||{meaning:'',unknown:false},input=el.querySelector('.meaning'),button=el.querySelector('.unknown'),reveal=el.querySelector('.revealed-meaning');if(input.value!==r.meaning)input.value=r.meaning;input.disabled=r.unknown;button.setAttribute('aria-pressed',String(r.unknown));reveal.hidden=!r.unknown;reveal.textContent=r.unknown?byWord.get(id).meaning:'';});
  const total=views.reduce((n,x)=>n+x.recorded,0);
  $('overall-progress').textContent=`Round 2 · ${total}/${data.total} responses recorded`;
  $('section-progress').textContent=`${v.written} meanings written · ${v.recorded-v.written} “I don’t know” · ${s.count-v.recorded} left`;
  for(const id of ['finish-section','finish-bottom']){const b=$(id);b.disabled=v.recorded<s.count||v.submitted;b.textContent=v.submitted?'Section saved ✓':'Finish section';}
  $('submission-note').textContent=v.submitted?'This section has a saved review copy.':v.copies.length?'Your edits are a new draft. Finish again to save another copy.':'Your answers save as you type. Finish after responding to every word.';
  $('submission-note').className=v.submitted?'saved-note':'';
  $('next-section').disabled=!v.submitted;
  $('completion-note').textContent=views.every(x=>x.submitted)?'Round 2 is complete. All six sections have saved review copies.':v.submitted?'Good effort. Continue when you are ready.':'';
  const history=$('copy-history'),markup=v.copies.map(c=>`<details><summary>${esc(new Date(c.at).toLocaleString())}</summary><dl>${c.responses.map(r=>`<div><dt>${esc(byWord.get(r.id).word)}</dt><dd>${esc(r.unknown?'I don’t know':r.meaning)}</dd></div>`).join('')}</dl></details>`).join('')||'<p>No finished copies yet.</p>';
  if(history.dataset.content!==markup){history.innerHTML=markup;history.dataset.content=markup;}
 }
 sync=window.MeaningCheckSync.create({data,disabled:demo,onState:update,onStatus(kind,text){$('save-note').dataset.kind=kind;$('save-note').textContent=text;}});
 update();void sync.start();
 $('sections').addEventListener('click',e=>{const b=e.target.closest('[data-section]');if(b)select(Number(b.dataset.section));});
 window.addEventListener('hashchange',()=>{const n=readPlace();if(valid(n)&&n!==section){section=n;touched=true;update();}});
 $('word-list').addEventListener('input',e=>{if(!e.target.matches('.meaning'))return;touched=true;sync.editRound(section,1,e.target.closest('[data-word]').dataset.word,'meaning',e.target.value);});
 $('word-list').addEventListener('click',async e=>{
  const unknown=e.target.closest('.unknown');if(unknown){touched=true;const id=unknown.closest('[data-word]').dataset.word;sync.editRound(section,1,id,'unknown',!sync.roundView(section,1).entries[id]?.unknown);return;}
  if(e.target.closest('#next-section')){select(section+1);return;}
  if(e.target.closest('#finish-section,#finish-bottom')){const n=section,result=sync.submitRound(n,1);if(!result.ok){$('action-note').textContent=result.reason;return;}const ok=await sync.flush();$('action-note').textContent=demo?'Preview section saved on this device.':ok?`Section ${n} saved online for review.`:`Section ${n} saved on this device; online save is not confirmed yet.`;}
 });
 $('save').addEventListener('click',async()=>{$('action-note').textContent=await sync.flush()?'All current Round 2 responses are saved online.':demo?'Preview only · responses saved on this device.':'Online save is not confirmed. Your device copy is kept.';});
 $('restore').addEventListener('click',async()=>{const b=$('restore');b.disabled=true;const result=await sync.restore();b.disabled=false;$('action-note').textContent=result.ok?'Saved Round 2 answers loaded.':'Please reconnect and try again.';});
 $('copy').addEventListener('click',async()=>{const v=sync.roundView(section,1),text=[`Marco · Focused Round 2 · Section ${section}`,'Please review generously. Close meanings count; spelling and grammar do not affect the review.','',...v.order.map((id,i)=>{const r=v.entries[id];return `${i+1}. ${byWord.get(id).word}: ${r?.unknown?'I don’t know':r?.meaning||'[not answered]'}`;})].join('\n');try{await navigator.clipboard.writeText(text);$('action-note').textContent='This section copied for review.';}catch{$('action-note').textContent='Clipboard unavailable. Download responses instead.';}});
 $('download').addEventListener('click',()=>{const result={title:data.title,appId:data.appId,exportedAt:new Date().toISOString(),total:data.total,words:data.words.map(({meaning,...w})=>w),state:sync.snapshot()},blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=doc.createElement('a');a.href=url;a.download='Marco-focused-round-2-responses.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('action-note').textContent='Downloaded all Round 2 drafts and finished copies.';});
 if(!demo){const poll=setInterval(()=>{if(!doc.hidden)void sync.flush();},12000);for(const event of ['focus','online','pageshow'])window.addEventListener(event,()=>void sync.flush());doc.addEventListener('visibilitychange',()=>void sync.flush());window.addEventListener('storage',e=>{if(e.key===sync.key&&e.newValue){sync.receiveLocal(e.newValue);void sync.flush();}});window.addEventListener('pagehide',()=>{clearInterval(poll);void sync.flush();});}
})();
