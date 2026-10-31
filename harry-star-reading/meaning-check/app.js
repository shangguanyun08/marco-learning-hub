(function(){
 'use strict';const data=window.HARRY_MEANING_CHECK,history=window.HARRY_MEANING_HISTORY||{words:{},coverage:[]},doc=document,byId=id=>doc.getElementById(id),esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),demo=new URLSearchParams(location.search).has('demo');
 let current={entries:{},submissions:{}};
 byId('list-summary').textContent=`${data.total} words · ${data.sections.length} sections · Up to 10 words per section, ${data.sections.at(-1).count} in the last.`;
 const posLabel=w=>({noun:'noun',verb:'verb',adjective:'adj.',adverb:'adv.'}[w.partOfSpeech]||w.partOfSpeech);
 byId('sections').innerHTML=data.sections.map(s=>`<a href="#section-${s.number}" data-section-tab="${s.number}">Section ${s.number} <small>0/${s.count}</small></a>`).join('');
 byId('word-list').innerHTML=data.sections.map(s=>`<section class="word-section" id="section-${s.number}" aria-labelledby="heading-${s.number}"><div class="section-heading"><div><h2 id="heading-${s.number}">Section ${s.number} <small>· ${(s.number-1)*data.sectionSize+1}–${Math.min(s.number*data.sectionSize,data.total)}</small></h2><p class="section-progress" data-progress="${s.number}"></p></div><button type="button" data-submit="${s.number}">Submit section for review</button></div><div class="column-head" aria-hidden="true"><span>#</span><span>Word · Part of speech · Earlier sentence</span><span>Your simple meaning</span><span>Or</span></div>${data.words.filter(w=>w.section===s.number).map(w=>`<div class="word-row" id="word-${esc(w.id)}" data-word="${esc(w.id)}"><span class="word-number">${w.number}</span><label class="word" for="meaning-${esc(w.id)}"><strong>${esc(w.word)}</strong> <span class="pronunciation" data-pronunciation="${esc(w.word)}" aria-label="Phonetic pronunciation"></span> <button type="button" class="speak-word" data-speak="${esc(w.word)}" aria-label="Hear ${esc(w.word)} pronounced" title="Hear pronunciation">🔊</button> <span class="part-of-speech">${esc(posLabel(w))}</span><small class="usage">${esc(w.context)}</small></label><input class="meaning" id="meaning-${esc(w.id)}" data-field="meaning" type="text" maxlength="240" placeholder="A simple word or short phrase" autocomplete="off" spellcheck="true" aria-label="${esc(w.word)}: your simple meaning"><button type="button" class="unknown" data-field="unknown" aria-pressed="false" aria-label="I don't know ${esc(w.word)}">I don't know</button></div>`).join('')}<div class="section-footer"><p data-submission-note="${s.number}">Not submitted. Your draft saves as you type.</p></div></section>`).join('');
 // Load American English IPA when available; audio uses built-in speech synthesis.
 const phonetics=new Map();
 async function loadPronunciations(){
  const words=[...new Set(data.words.map(w=>w.word.toLowerCase()))];
  await Promise.all(Array.from({length:5},async(_,worker)=>{
   for(let i=worker;i<words.length;i+=5){const word=words[i];try{
    const response=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(word));
    if(!response.ok)continue;const entries=await response.json();
    const phonetic=entries.flatMap(e=>e.phonetics||[]).find(p=>p.text&&p.audio?.includes('-us.'))?.text||entries.flatMap(e=>e.phonetics||[]).find(p=>p.text)?.text||entries.find(e=>e.phonetic)?.phonetic;
    if(phonetic){phonetics.set(word,phonetic);doc.querySelectorAll('[data-pronunciation]').forEach(el=>{if(el.dataset.pronunciation.toLowerCase()===word)el.textContent=phonetic;});}
   }catch{/* Dictionary unavailable: keep audio button working. */}
   }
  }));
 }
 void loadPronunciations();
 doc.getElementById('word-list').addEventListener('click',e=>{const b=e.target.closest('[data-speak]');if(!b)return;
  if(!('speechSynthesis' in window)){byId('action-note').textContent='Audio pronunciation is not supported by this browser.';return;}
  speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(b.dataset.speak);utterance.lang='en-US';utterance.rate=0.85;speechSynthesis.speak(utterance);
 });
 const rowNodes=new Map([...doc.querySelectorAll('[data-word]')].map(el=>[el.dataset.word,el])),answered=e=>e?.unknown===true||Boolean(e?.meaning?.trim());
 function update(v){current=v;let total=0;for(const w of data.words){const entry=v.entries[w.id]||{meaning:'',unknown:false,tone:''},el=rowNodes.get(w.id),input=el.querySelector('.meaning');if(input.value!==entry.meaning)input.value=entry.meaning;input.disabled=entry.unknown;el.querySelector('[data-field=unknown]').setAttribute('aria-pressed',String(entry.unknown));if(answered(entry))total++;}
  byId('overall-progress').textContent=`${total}/${data.total} meanings recorded · Not graded`;
  for(const s of data.sections){const rows=data.words.filter(w=>w.section===s.number),count=rows.filter(w=>answered(v.entries[w.id])).length,copies=Object.values(v.submissions).filter(x=>x.section===s.number).sort((a,b)=>b.at.localeCompare(a.at)),last=copies[0],same=last&&JSON.stringify(last.responses)===JSON.stringify(rows.map(w=>({id:w.id,...(v.entries[w.id]||{meaning:'',unknown:false,tone:''})}))),done=Boolean(last&&same),section=byId(`section-${s.number}`),tab=doc.querySelector(`[data-section-tab="${s.number}"]`);section.classList.toggle('is-complete',done);tab.classList.toggle('is-complete',done);tab.querySelector('small').textContent=`${count}/${s.count}${done?' ✓':''}`;doc.querySelector(`[data-progress="${s.number}"]`).textContent=`${count}/${s.count} recorded${done?' · Submitted for review':last?' · Draft edited since submission':''}`;const button=doc.querySelector(`[data-submit="${s.number}"]`);button.disabled=count<s.count||done;button.textContent=done?'Submitted for review ✓':last?'Submit revised copy':'Submit section for review';doc.querySelector(`[data-submission-note="${s.number}"]`).textContent=last?`${copies.length} saved submitted ${copies.length===1?'copy':'copies'} · Latest: ${new Date(last.at).toLocaleString()}${same?'':' · Current edits are a separate draft.'}`:'Not submitted. Your draft saves as you type.';}
 }
 const sync=window.MeaningCheckSync.create({data,disabled:demo,onState:update,onStatus(kind,text){byId('save-note').dataset.kind=kind;byId('save-note').textContent=text;}});update(sync.view());void sync.start();
 byId('word-list').addEventListener('input',e=>{const input=e.target;if(input.matches('[data-field=meaning]'))sync.edit(input.closest('[data-word]').dataset.word,'meaning',input.value);});
 byId('word-list').addEventListener('click',async e=>{const unknown=e.target.closest('[data-field=unknown]');if(unknown){const id=unknown.closest('[data-word]').dataset.word;sync.edit(id,'unknown',!current.entries[id]?.unknown);return;}const button=e.target.closest('[data-submit]');if(button){const s=Number(button.dataset.submit),result=sync.submit(s);if(!result.ok){byId('action-note').textContent=result.reason;return;}byId('action-note').textContent=`Section ${s}: submitted copy saved on this device. Saving online…`;const ok=await sync.flush();byId('action-note').textContent=`Section ${s}: ${ok?'submitted and saved online for later review.':'saved on this device; online save is not confirmed yet.'}`;}});
 byId('save').addEventListener('click',async()=>{const ok=await sync.flush();byId('action-note').textContent=ok?'All current responses are saved online.':'Online save is not confirmed. Your device copy is retained.';});
 function exportData(){return {title:data.title,exportedAt:new Date().toISOString(),total:data.total,historyCheckedAt:history.checkedAt,history:history.words,previousWords:data.previousWords,notAutomaticallyGraded:true,words:data.words.map(w=>({...w,response:current.entries[w.id]||{meaning:'',unknown:false,tone:''}})),state:sync.snapshot()};}
 byId('download').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(exportData(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=doc.createElement('a');a.href=url;a.download='Harry-word-meaning-responses.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);byId('action-note').textContent='Downloaded the current draft and all submitted copies.';});
 byId('copy').addEventListener('click',async()=>{const text=['Please review Harry’s simple meanings. Accept accurate paraphrases and ignore minor spelling errors. If a usage sentence is supplied, judge that sense; otherwise note valid alternate meanings. Separate correct / partial / different sense / incorrect / unknown. These are ungraded responses.','',...data.words.filter(w=>answered(current.entries[w.id])).map(w=>{const r=current.entries[w.id];return `${w.number}. ${w.word} (${posLabel(w)})${w.context?" ["+w.context+"]":""}: ${r.unknown?"I don't know":r.meaning||'[no meaning]'}`;})].join('\n');try{await navigator.clipboard.writeText(text);byId('action-note').textContent='Responses copied. Paste them here when you want a review.';}catch{byId('action-note').textContent='Clipboard unavailable. Use Download responses instead.';}});
 byId('print').addEventListener('click',()=>window.print());
 if(!demo){
  let poll=null;
  function resume(){if(poll===null)poll=setInterval(()=>{if(!doc.hidden)void sync.flush();},12000);void sync.flush();}
  window.addEventListener('focus',resume);window.addEventListener('online',resume);
  window.addEventListener('pageshow',resume);
  doc.addEventListener('visibilitychange',()=>void sync.flush());
  window.addEventListener('storage',event=>{if(event.key===sync.key&&event.newValue){sync.receiveLocal(event.newValue);void sync.flush();}});
  window.addEventListener('pagehide',()=>{clearInterval(poll);poll=null;void sync.flush();});
  resume();
 }
})();
