(function(){
 'use strict';
 const data=window.MARCO_VOCABULARY_SELECTION,byId=new Map(data.words.map(w=>[w.id,w]));
 const $=id=>document.getElementById(id),el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
 const demo=new URLSearchParams(location.search).get('demo')==='1';
 let state={choices:{}},view='selected',page=1,lastChange=null;
 function included(word){return state.choices[word.id]?.include??word.recommended;}
 function changed(word){return included(word)!==word.recommended;}
 function sortWords(words){const order=$('sort').value;return words.slice().sort((a,b)=>order==='az'?a.word.localeCompare(b.word,'en'):(order==='hard'?-1:1)*(a.difficulty-b.difficulty)||a.word.localeCompare(b.word,'en'));}
 function allSelected(){return sortWords(data.words.filter(included));}
 function speak(word){
  if(!window.speechSynthesis){$('action-text').textContent='Pronunciation is unavailable in this browser.';return;}
  speechSynthesis.cancel();const text=word==='minute'?'a minute detail':word==='defect'?'to defect':word;
  const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.82;
  const voice=speechSynthesis.getVoices().find(v=>v.lang==='en-US')||speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));if(voice)utterance.voice=voice;speechSynthesis.speak(utterance);
 }
 function choice(word,value){const previous=included(word);lastChange={id:word.id,include:previous};sync.setChoice(word.id,value);$('action-text').textContent=word.word+(value?' restored to your review list.':' removed from your review list.');$('undo').hidden=false;}
 function render(){
  const selected=data.words.filter(included).length;
  for(const id of ['selected-total','selected-count'])$(id).textContent=selected.toLocaleString();
  for(const id of ['excluded-total','excluded-count'])$(id).textContent=(data.words.length-selected).toLocaleString();
  const q=$('search').value.trim().toLocaleLowerCase(),reason=$('reason').value;
  let words=sortWords(data.words.filter(w=>(view==='all'||(view==='selected')===included(w))&&(reason==='all'||reason==='changed'&&changed(w)||w.originalDecision===reason)&&(!q||[w.word,w.meaning,w.focus,w.cutReason].join(' ').toLocaleLowerCase().includes(q))));
  const size=$('page-size').value==='all'?Math.max(1,words.length):Number($('page-size').value),pages=Math.max(1,Math.ceil(words.length/size));page=Math.max(1,Math.min(page,pages));
  const start=(page-1)*size,visible=words.slice(start,start+size),fragment=document.createDocumentFragment();
  for(const word of visible){
   const keep=included(word),row=el('article','word-row'+(keep?'':' was-excluded'));row.dataset.word=word.word;row.dataset.id=word.id;row.setAttribute('aria-label',word.word);
   const title=el('div','word-title'),head=el('div','word-head');head.append(el('h2','',word.word));
   const sound=el('button','speak','🔊');sound.type='button';sound.setAttribute('aria-label','Pronounce '+word.word);sound.addEventListener('click',()=>speak(word.word));head.append(sound);title.append(head,el('div','difficulty',word.difficultyLabel));row.append(title);
   const body=el('div','word-main');body.append(el('p','meaning',word.meaning));
   if(word.focus)body.append(el('p','focus',word.focus));
   if(!word.recommended)body.append(el('span','badge',word.originalDecision==='easy-medium'?'Originally easy / medium':'Originally lower priority'));
   if(word.recommended&&!keep)body.append(el('span','badge removed','Removed by you'));
   if(!word.recommended&&keep)body.append(el('span','badge restored','Restored by you'));
   if(word.cutReason)body.append(el('p','focus',word.cutReason));
   if(word.sources.length){const source=el('details','source');source.append(el('summary','',word.sources.length+' source set'+(word.sources.length===1?'':'s')));for(const item of word.sources){const p=el('p','');const a=el('a','',item.title);a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);source.append(p)}body.append(source);}
   row.append(body);
   const action=el('button','word-action '+(keep?'remove':'restore'),keep?'Remove':'Restore');action.type='button';action.setAttribute('aria-label',(keep?'Remove ':'Restore ')+word.word);action.addEventListener('click',()=>{const index=visible.findIndex(w=>w.id===word.id);choice(word,!keep);const actions=$('word-list').querySelectorAll('.word-action');actions[Math.min(index,actions.length-1)]?.focus({preventScroll:true});});row.append(action);fragment.append(row);
  }
  if(!visible.length)fragment.append(el('p','empty','No words match this view. Try another filter.'));
  $('word-list').replaceChildren(fragment);
  $('page-info').textContent=words.length?`${start+1}–${Math.min(start+size,words.length)} of ${words.length.toLocaleString()} · Page ${page} of ${pages}`:'0 words';
  $('previous').disabled=page===1;$('next').disabled=page===pages;
  $('list-description').textContent=`${words.length.toLocaleString()} words in this view · `+($('sort').value==='az'?'Alphabetical order.':$('sort').value==='easy'?'Easier → harder, in approximate groups.':'Harder → easier, in approximate groups.');
 }
 const sync=window.VocabularySelectionSync.create({data,demo,onChange(next){state=next;render();},onStatus(kind,text){$('save-status').dataset.kind=kind;$('save-status').textContent=text;}});
 state=sync.snapshot();render();void sync.start();
 document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;page=1;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
 for(const id of ['search','reason','sort','page-size'])$(id).addEventListener(id==='search'?'input':'change',()=>{page=1;render();});
 $('show-meanings').addEventListener('change',event=>$('word-list').classList.toggle('hide-meanings',!event.target.checked));
 $('previous').addEventListener('click',()=>{page--;render();document.querySelector('.controls').scrollIntoView({block:'start'});});
 $('next').addEventListener('click',()=>{page++;render();document.querySelector('.controls').scrollIntoView({block:'start'});});
 $('undo').addEventListener('click',()=>{if(!lastChange)return;const word=byId.get(lastChange.id);sync.setChoice(word.id,lastChange.include);$('action-text').textContent='Last change undone for '+word.word+'.';lastChange=null;$('undo').hidden=true;});
 $('save').addEventListener('click',()=>void sync.flush());
 function download(name,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 $('download').addEventListener('click',()=>{const words=allSelected(),changes=data.words.filter(changed);const text=['MARCO REVIEW WORD SELECTION',new Date().toLocaleString(),'',`${words.length} selected; ${data.words.length-words.length} set aside.`,'Current display order: '+$('sort').selectedOptions[0].textContent+'.','',...words.map((w,i)=>`${i+1}. ${w.word} — ${w.meaning}`),'','CHANGES FROM THE ORIGINAL RECOMMENDATION',...changes.map(w=>(included(w)?'RESTORED: ':'REMOVED: ')+w.word),'','SELECTION RECORD',JSON.stringify(sync.snapshot(),null,2)].join('\n');download('Marco-selected-review-words.txt',text,'text/plain;charset=utf-8');});
 window.addEventListener('storage',event=>{if(event.key===sync.key&&event.newValue)sync.receiveLocal(event.newValue);});
 window.addEventListener('online',()=>void sync.flush());
 window.addEventListener('focus',()=>void sync.flush());
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void sync.flush();});
 setInterval(()=>{if(!document.hidden)void sync.flush();},30000);
 window.addEventListener('pagehide',()=>{void sync.flush();});
})();
