/* GitHub-hosted Round 3. Keys and grading stay on the authenticated service. */
(function(){
 'use strict';
 const API='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/harry-meaning',CONNECT='https://marco-10-word-meaning-trial.alexsoton.chatgpt.site/harry/connect';
 const SESSION='harry-meaning-ai:connection-v1',PAIRING=SESSION+':state',known=new Map();
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let connectionError='';
 const read=(key,store=localStorage)=>{try{return store.getItem(key);}catch{return null;}};
 const write=(key,value,store=localStorage)=>{try{store.setItem(key,value);}catch{}};
 const remove=(key,store=localStorage)=>{try{store.removeItem(key);}catch{}};
 if(location.hash.includes('&ai_session=')){
  const [place,...parts]=location.hash.split('&'),query=new URLSearchParams(parts.join('&')),token=query.get('ai_session'),state=query.get('ai_state');
  history.replaceState(null,'',location.pathname+location.search+place);
  if(token&&state&&state===read(PAIRING,sessionStorage)){write(SESSION,token);remove(PAIRING,sessionStorage);}
  else connectionError='The connection could not be confirmed. Please connect again.';
 }
 function shuffle(values,seedText){const order=values.slice();let seed=2166136261;for(const c of seedText)seed=Math.imul(seed^c.charCodeAt(0),16777619);for(let i=order.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}return order;}
 function comparison(attempts,ids){const bank=JSON.stringify(ids.slice().sort()),rows=attempts.slice().sort((a,b)=>a.startedAt.localeCompare(b.startedAt)||a.id.localeCompare(b.id));let previous=null;const annotated=rows.map((a,i)=>{const same=JSON.stringify((a.wordIds||[]).slice().sort())===bank,complete=a.total>0&&a.answered===a.total,change=same&&complete&&previous?a.score-previous.score:null;if(same&&complete)previous=a;return {...a,number:i+1,same,complete,change};}),finished=annotated.filter(a=>a.same&&a.complete);return {rows:annotated.reverse(),first:finished[0],latest:finished.at(-1),best:finished.slice().sort((a,b)=>b.score-a.score)[0]};}
 function mount(host,{section,count,wordIds,formatSentence,demo,onProgress}){
  let test=null,attempts=[],drafts={},busy=false,loading=false,error=connectionError,rowError={},mic=null,capture=null,startingId=null,destroyed=false,controller=null;
  const token=()=>demo?'':read(SESSION)||'';
  const draftKey=id=>'harry-meaning-ai:draft:'+id;
  const draftLoad=id=>{try{return JSON.parse(read(draftKey(id))||'{}');}catch{return {};}};
  function accept(record){test=record;known.set(record.id,record);drafts=draftLoad(record.id);attempts=[{id:record.id,section:record.section,startedAt:record.startedAt,answered:record.answered,score:record.score,total:record.total,wordIds:record.words.map(w=>w.id)},...attempts.filter(a=>a.id!==record.id)];}
  async function request(action,{method='GET',query='',body}={}){
   if(demo)throw Error('AI checking is disabled in this preview.');
   const headers={authorization:'Bearer '+token()};if(typeof body==='string')headers['content-type']='application/json';
   controller=new AbortController();const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(55000)]);
   let response;
   try{response=await fetch(API+'?action='+action+query,{method,headers,body,signal});}catch(e){throw Error(e?.name==='AbortError'||e?.name==='TimeoutError'?'The check took too long. Your answer is kept; please try again.':'Could not connect. Your answer is kept; please try again.');}
   const result=await response.json();
   if(response.status===401){remove(SESSION);throw Error('Please connect AI checking again. Your saved tests are safe.');}
   if(!response.ok){const failure=Error(result.error||'The answer could not be checked.');failure.transcript=result.transcript;throw failure;}
   return result;
  }
  function render(){
   if(destroyed)return;
   const complete=test&&test.answered===test.total,connected=Boolean(token()),locked=busy||loading||Boolean(mic),historyRows=comparison(attempts,wordIds);
   let html=`<div class="ai-test-intro"><h3>Set ${section} · Score out of ${count}</h3><p>Say or type a short meaning. English or Chinese is fine. Close meanings count; minor spelling mistakes are fine.</p><p>Your first checked answer counts. Review the short meanings after finishing. A retake gets its own saved score.</p></div>`;
   if(error)html+=`<p class="ai-error" role="alert">${esc(error)}</p>`;
   if(!connected){html+=demo?'<p class="small">Preview only. AI checks and online test saves are disabled.</p>':'<div class="ai-connect"><p>Connect once, then you will return here to take the test.</p><button type="button" data-ai-connect>Connect AI checking</button></div>';host.innerHTML=html;return;}
   html+=`<div class="ai-test-actions"><button type="button" data-ai-start ${locked?'disabled':''}>${test?'Start a new retake':'Start meaning test'}</button><button type="button" class="secondary" data-ai-reload ${locked?'disabled':''}>Reload saved tests</button><span class="small" role="status">${loading?'Loading saved tests…':busy?'Checking and saving…':'First answers and separate retakes save online.'}</span></div>`;
   if(test){html+=`<p class="ai-score" role="status">${complete?'Finished':'So far'}: <strong>${test.score}/${test.total}</strong> · ${test.answered}/${test.total} checked</p>`;onProgress?.(`Set ${section} · Round 3 AI test · ${test.score}/${test.total} · ${test.answered}/${test.total} checked`);if(test.previousLayout)html+='<p class="small">This saved attempt uses an earlier word list. Start a new retake for the current set.</p>';}
   if(historyRows.first)html+=`<div class="ai-score-history"><span>First completed <strong>${historyRows.first.score}/${historyRows.first.total}</strong></span><span>Latest completed <strong>${historyRows.latest.score}/${historyRows.latest.total}</strong></span><span>Best completed <strong>${historyRows.best.score}/${historyRows.best.total}</strong></span></div>`;
   if(attempts.length)html+=`<details class="ai-attempts"><summary>Saved tests and retakes (${attempts.length})</summary>${historyRows.rows.map(a=>`<div class="ai-history-row"><span>Attempt ${a.number} · ${esc(new Date(a.startedAt).toLocaleString())}<br><strong>${a.complete?a.score+'/'+a.total:a.answered+'/'+a.total+' checked'}</strong>${a.change===null?'':` · ${a.change>0?'+':''}${a.change} points`}${a.same?'':' · Earlier word list'}</span><button type="button" class="secondary" data-ai-open="${esc(a.id)}" ${locked||test?.id===a.id?'disabled':''}>${test?.id===a.id?'Viewing':'View'}</button></div>`).join('')}</details>`;
   if(test)html+=`<div class="ai-words">${shuffle(test.words,test.id).map((word,i)=>{const result=test.answers[word.id],recording=mic?.id===word.id&&mic.phase==='recording',value=result?.answer??drafts[word.id]??'',label=word.partOfSpeech==='adjective'?'adj.':word.partOfSpeech||'';return `<article class="ai-word-row" data-ai-word="${esc(word.id)}"><div class="ai-word-heading"><span class="word-number">${i+1}</span><div><strong>${esc(word.word)}</strong><span class="part-of-speech">${esc(label)}</span><button type="button" class="speak-word" data-ai-speak="${esc(word.word)}" aria-label="Hear ${esc(word.word)} pronounced">🔊</button><p class="usage">${formatSentence?formatSentence(word):esc(word.context||'')}</p></div></div><div class="ai-answer"><label for="ai-answer-${esc(word.id)}" class="small">Your short meaning</label><input id="ai-answer-${esc(word.id)}" data-ai-answer aria-label="Your meaning for ${esc(word.word)}" value="${esc(value)}" maxlength="240" placeholder="1–3 words · English or Chinese" autocomplete="off" ${locked||result?'disabled':''}><div class="ai-answer-buttons"><button type="button" data-ai-check ${locked||result?'disabled':''}>${result?'Answer saved ✓':'Check text'}</button><button type="button" class="secondary" data-ai-voice ${result||(locked&&!recording)?'disabled':''}>${recording?'■ Stop & check':'🎙 Say meaning'}</button><button type="button" class="secondary" data-ai-unknown ${locked||result?'disabled':''}>I don’t know</button></div>${mic?.id===word.id?`<p class="small" role="status">${recording?'● Listening… tap Stop & check.':mic.phase==='opening'?'Allow microphone access when asked.':'Reading your speech and checking…'}</p>`:''}${rowError[word.id]?`<p class="ai-error" role="alert">${esc(rowError[word.id])}</p>`:''}${result?`<p class="ai-result ${result.close?'is-close':'needs-review'}"><strong>${result.close?'✓ Close enough · 1 point':result.unknown?'I don’t know · 0 points':'Review this word · 0 points'}</strong>${complete?`<span class="ai-short-meaning">${esc(result.meaning||'')}</span>`:''}</p>`:''}</div></article>`;}).join('')}</div>`;
   if(complete)html+=`<p class="ai-finished">${test.score===test.total?'All meanings were close enough in this test.':'Review the words that earned 0 points together, then try a fresh retake when ready.'}</p>`;
   html+='<p class="small">You can use keyboard dictation or type instead of recording. Recordings stop after 20 seconds and are sent for transcription and meaning checking.</p>';
   host.innerHTML=html;
  }
  async function load(){loading=true;error='';render();try{const body=await request('attempts',{query:'&set='+section});if(destroyed)return;attempts=body.attempts;if(attempts.length){const saved=await request('attempts',{query:'&id='+encodeURIComponent(attempts[0].id)});if(destroyed)return;accept(saved.test);}}catch(e){if(!destroyed)error=e.message;}finally{loading=false;render();}}
  async function start(){if(busy||loading||mic)return;busy=true;error='';startingId||=crypto.randomUUID();render();try{const body=await request('attempts',{method:'POST',body:JSON.stringify({id:startingId,section,wordListVersion:'six-sets-v2'})});if(destroyed)return;accept(body.test);startingId=null;rowError={};}catch(e){if(!destroyed)error=e.message;}finally{busy=false;render();}}
  async function check(word,unknown=false,audio){if(!test||test.answers[word.id]||busy)return;const answer=(drafts[word.id]||'').trim();if(!answer&&!unknown&&!audio){rowError[word.id]='Say or type a short meaning first.';render();return;}busy=true;rowError[word.id]='';if(audio)mic={id:word.id,phase:'checking'};render();try{let body;if(audio){body=new FormData();body.append('attemptId',test.id);body.append('wordId',word.id);body.append('audio',audio,'meaning');}else body=JSON.stringify({attemptId:test.id,wordId:word.id,answer,unknown});const result=await request(audio?'voice-check':'check',{method:'POST',body});if(destroyed)return;accept(result.test);}catch(e){if(!destroyed){rowError[word.id]=e.message;if(e.transcript){drafts[word.id]=e.transcript;write(draftKey(test.id),JSON.stringify(drafts));}if(!token())error=e.message;}}finally{busy=false;mic=null;render();}}
  function input(event){const field=event.target.closest('[data-ai-answer]');if(field&&test){drafts[field.closest('[data-ai-word]').dataset.aiWord]=field.value;write(draftKey(test.id),JSON.stringify(drafts));}}
  async function click(event){
   if(event.target.closest('[data-ai-connect]')){const state=crypto.randomUUID();write(PAIRING,state,sessionStorage);location.assign(CONNECT+'?set='+section+'&state='+state);return;}
   if(event.target.closest('[data-ai-start]')){void start();return;}
   if(event.target.closest('[data-ai-reload]')){void load();return;}
   const open=event.target.closest('[data-ai-open]');if(open&&!busy&&!mic){loading=true;render();try{const result=await request('attempts',{query:'&id='+encodeURIComponent(open.dataset.aiOpen)});if(!destroyed){accept(result.test);rowError={};error='';}}catch(e){error=e.message;}finally{loading=false;render();}return;}
   const speak=event.target.closest('[data-ai-speak]');if(speak){if('speechSynthesis'in window){speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(speak.dataset.aiSpeak);voice.lang='en-US';voice.rate=.85;speechSynthesis.speak(voice);}return;}
   const row=event.target.closest('[data-ai-word]'),word=test?.words.find(w=>w.id===row?.dataset.aiWord);if(!word)return;
   if(event.target.closest('[data-ai-check]'))void check(word);
   if(event.target.closest('[data-ai-unknown]'))void check(word,true);
   if(event.target.closest('[data-ai-voice]')){
    if(mic?.id===word.id&&mic.phase==='recording'){capture?.stop();return;}
    if(busy||mic)return;
    if(!window.HarryMeaningVoiceCapture){rowError[word.id]='Use keyboard dictation or type your meaning.';render();return;}
    mic={id:word.id,phase:'opening'};render();
    capture=new window.HarryMeaningVoiceCapture({onStart(){if(!destroyed){mic={id:word.id,phase:'recording'};render();}},onStop(audio){capture=null;if(!destroyed)void check(word,false,audio);},onError(message){capture=null;if(!destroyed){mic=null;rowError[word.id]=message;render();}}});void capture.start();
   }
  }
  function interrupted(){if(document.hidden&&capture){capture.cancel();capture=null;mic=null;render();}}
  host.addEventListener('input',input);host.addEventListener('click',click);document.addEventListener('visibilitychange',interrupted);
  render();if(token())void load();
  return {destroy(){destroyed=true;controller?.abort();capture?.cancel();host.removeEventListener('input',input);host.removeEventListener('click',click);document.removeEventListener('visibilitychange',interrupted);}};
 }
 window.HarryMeaningAI={mount,exportKnown:()=>Array.from(known.values()),comparison,shuffle};
})();
