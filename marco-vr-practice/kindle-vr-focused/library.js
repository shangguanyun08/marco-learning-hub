(function(){
  'use strict';
  const bank=window.MARCO_ISEE_PRACTICE,S=window.MarcoTest3Sync,E=window.MarcoTest3Engine;
  const preview=new URLSearchParams(location.search).has('demo')||['localhost','127.0.0.1'].includes(location.hostname)||location.protocol==='file:';
  const KEY=S.APP_ID+(preview?':preview':'');
  let state={version:1,sessions:{}},message=preview?'Preview · Online records untouched':'Connecting to live online sync…';
  try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(S.valid(s))state=S.merge(s,state);}catch{}
  const pages=document.getElementById('course-pages');
  if(pages)pages.innerHTML=bank.map(s=>`<a class="course-page" data-page-card="${s.number}" href="practice.html?page=${s.number}${preview?'&demo=1':''}"><p class="eyebrow">PAGE ${s.number} · MIXED SOURCE TESTS</p><h2>${s.questions.length} questions</h2><p>Synonyms → sentence completion</p><p class="page-progress">Ready to start</p><strong>Open Page ${s.number} →</strong></a>`).join('');
  function render(){
    for(const s of bank){
      const r=state.sessions[s.id]?.at(-1),stats=E.stats(s,r),card=document.querySelector(`[data-page-card="${s.number}"]`);
      if(!card)continue;
      card.classList.toggle('is-complete',!!r?.completedAt);
      card.querySelector('.page-progress').textContent=r?`${r.completedAt?'✓ Complete · ':''}${stats.finished}/${stats.total} finished · ${stats.first}/${stats.total} first try`:'Ready to start';
    }
    const hub=document.getElementById('kindle-focused-card');
    if(hub){const finished=bank.reduce((n,s)=>n+E.stats(s,state.sessions[s.id]?.at(-1)).finished,0),complete=bank.every(s=>state.sessions[s.id]?.at(-1)?.completedAt);hub.classList.toggle('is-complete',complete);document.getElementById('kindle-focused-status').textContent=`${complete?'✓ Complete · ':''}${finished}/245 finished · ${message}`;}
  }
  function remote(value){state=S.merge(state,value);try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}render();}
  render();
  const note=document.getElementById('save-note');
  if(preview){if(note)note.textContent='Preview · Online records are untouched.';return;}
  const sync=S.create({getState:()=>state,onRemote:remote,onStatus(kind,text){message=text;if(note){note.dataset.kind=kind;note.textContent=text;}render();}});
  void sync.start();
  addEventListener('storage',event=>{if(event.key===KEY&&event.newValue)try{const s=JSON.parse(event.newValue);if(S.valid(s))remote(s);}catch{}});
})();
