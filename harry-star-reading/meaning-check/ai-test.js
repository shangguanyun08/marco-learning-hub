/* GitHub-hosted Round 3. Keys and grading stay on the authenticated service. */
(function(){
 'use strict';
 const API='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/harry-meaning',CONNECT='https://marco-10-word-meaning-trial.alexsoton.chatgpt.site/harry/connect';
 const SESSION='harry-meaning-ai:connection-v1',PAIRING=SESSION+':state',known=new Map();
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const setHistories = new Map();
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
 const dashboardViews = new Set();

 function refreshDashboardViews() {
  for (const render of dashboardViews) render();
 }

 function cacheHistory(section, attempts) {
  const saved = new Map((setHistories.get(section) || []).map(attempt => [attempt.id, attempt]));
  for (const attempt of attempts) {
   const previous = saved.get(attempt.id);
   if (!previous || attempt.answered >= previous.answered) saved.set(attempt.id, attempt);
  }
  setHistories.set(section, Array.from(saved.values()).sort((a, b) => b.startedAt.localeCompare(a.startedAt) || b.id.localeCompare(a.id)));
 }

 function rememberHistory(section, attempts) {
  cacheHistory(section, attempts);
  refreshDashboardViews();
 }

 function connect(section) {
  const state = crypto.randomUUID();
  write(PAIRING, state, sessionStorage);
  location.assign(CONNECT + '?set=' + section + '&state=' + state);
 }

 async function serviceRequest(action, { method = 'GET', query = '', body, signal, demo = false } = {}) {
  if (demo) throw Error('AI checking is disabled in this preview.');
  const headers = { authorization: 'Bearer ' + (read(SESSION) || '') };
  if (typeof body === 'string') headers['content-type'] = 'application/json';
  const signals = [AbortSignal.timeout(55000)];
  if (signal) signals.push(signal);
  let response;
  try {
   response = await fetch(API + '?action=' + action + query, {
    method, headers, body, signal: AbortSignal.any(signals)
   });
  } catch (failure) {
   throw Error(failure?.name === 'AbortError' || failure?.name === 'TimeoutError'
    ? 'The check took too long. Your answer is kept; please try again.'
    : 'Could not connect. Your answer is kept; please try again.');
  }
  const result = await response.json();
  if (response.status === 401) {
   remove(SESSION);
   refreshDashboardViews();
   throw Error('Please connect AI checking again. Your saved tests are safe.');
  }
  if (!response.ok) {
   const failure = Error(result.error || 'The answer could not be checked.');
   failure.transcript = result.transcript;
   throw failure;
  }
  return result;
 }

 function dashboardMarkup(sets, section, connected, loading) {
  const cards = sets.map(set => {
   const saved = connected ? setHistories.get(set.number) : undefined;
   const scores = comparison(saved || [], set.wordIds);
   const current = scores.rows[0];
   const latest = scores.latest;
   let detail = connected ? 'No completed score' : 'Connect to view';
   if (connected && !saved) detail = loading ? 'Loading scores…' : 'Scores not loaded';
   if (latest) detail = `${Math.round(latest.score / latest.total * 100)}% · Best ${scores.best.score}/${scores.best.total}`;
   const progress = current && !current.complete
    ? `<p class="ai-dashboard-current">${current.answered}/${current.total} checked</p>` : '';
   const history = scores.rows.length
    ? `<ol>${scores.rows.map(attempt => `<li><span>Attempt ${attempt.number}</span><strong>${attempt.complete ? `${attempt.score} / ${attempt.total}` : `${attempt.answered}/${attempt.total} checked`}</strong><small>${esc(new Date(attempt.startedAt).toLocaleString())}</small></li>`).join('')}</ol>`
    : `<p>${saved ? 'No saved attempts yet.' : 'Saved attempts have not loaded.'}</p>`;
   return `<article class="ai-dashboard-card" ${set.number === section ? 'aria-current="true"' : ''}>
    <h4>Set ${set.number}</h4><span class="ai-dashboard-count">${set.count} words</span>
    <strong class="ai-dashboard-score">${latest ? `${latest.score} / ${latest.total}` : `— / ${set.count}`}</strong>
    <p class="ai-dashboard-detail">${detail}</p>${progress}
    <button type="button" data-ai-set="${set.number}">${current && !current.complete ? 'Continue test' : 'Open test'}</button>
    ${connected ? `<details class="ai-dashboard-history"><summary>History (${scores.rows.length})</summary>${history}</details>` : ''}
   </article>`;
  }).join('');
  return `<section class="ai-dashboard" aria-labelledby="ai-dashboard-heading">
   <div class="ai-dashboard-heading"><h3 id="ai-dashboard-heading">AI meaning tests</h3></div>
   <div class="ai-dashboard-grid">${cards}</div>
  </section>`;
 }

 function createDashboard(host, { sets, demo, onSelectSet }) {
  let section = sets[0].number;
  let loading = false;
  let destroyed = false;
  const controller = new AbortController();

  function render() {
   if (!destroyed) host.innerHTML = dashboardMarkup(sets, section, !demo && Boolean(read(SESSION)), loading);
  }

  async function load() {
   if (demo || !read(SESSION)) return;
   loading = true;
   render();
   try {
    const results = await Promise.allSettled(sets.map(set => serviceRequest('attempts', {
     query: '&set=' + set.number, signal: controller.signal
    })));
    if (destroyed) return;
    results.forEach((result, index) => {
     if (result.status === 'fulfilled') cacheHistory(sets[index].number, result.value.attempts);
    });
   } finally {
    loading = false;
    refreshDashboardViews();
   }
  }

  function click(event) {
   const setButton = event.target.closest('[data-ai-set]');
   if (setButton) onSelectSet(Number(setButton.dataset.aiSet));
  }

  dashboardViews.add(render);
  host.addEventListener('click', click);
  render();
  void load();
  return {
   select(number) {
    if (section !== number) { section = number; render(); }
   },
   destroy() {
    destroyed = true;
    controller.abort();
    dashboardViews.delete(render);
    host.removeEventListener('click', click);
   }
  };
 }

 function mount(host,{section,count,wordIds,formatSentence,demo,onProgress}){
  let test=null,attempts=[],drafts={},busy=false,loading=false,error=connectionError,rowError={},mic=null,capture=null,startingId=null,destroyed=false;
  const lifetimeController = new AbortController();
  const token=()=>demo?'':read(SESSION)||'';
  const draftKey=id=>'harry-meaning-ai:draft:'+id;
  const draftLoad=id=>{try{return JSON.parse(read(draftKey(id))||'{}');}catch{return {};}};
  function accept(record){test=record;known.set(record.id,record);drafts=draftLoad(record.id);attempts=[{id:record.id,section:record.section,startedAt:record.startedAt,answered:record.answered,score:record.score,total:record.total,wordIds:record.words.map(w=>w.id)},...attempts.filter(a=>a.id!==record.id)];rememberHistory(section,attempts);}
  function request(action, options = {}) {
   return serviceRequest(action, { ...options, demo, signal: lifetimeController.signal });
  }
  function renderHistory(scores, locked) {
   if (!attempts.length) return '';
   const comparisonBoxes = scores.first ? `<div class="ai-score-comparison">
    <div><span>First completed</span><strong>${scores.first.score} / ${scores.first.total}</strong></div>
    <div><span>Latest completed</span><strong>${scores.latest.score} / ${scores.latest.total}</strong></div>
    <div><span>Best completed</span><strong>${scores.best.score} / ${scores.best.total}</strong></div>
   </div>` : '<p>Finish a full test to start comparing scores.</p>';
   return `<section class="ai-score-history" aria-labelledby="ai-retest-heading">
    <h3 id="ai-retest-heading">Retest progress</h3>
    ${comparisonBoxes}
    <details class="ai-attempts">
     <summary>View all attempts (${scores.rows.length})</summary>
     <div class="ai-score-table-scroll"><table>
      <thead><tr><th scope="col">Attempt</th><th scope="col">Score</th><th scope="col">Change</th><th scope="col">Open</th></tr></thead>
      <tbody>${scores.rows.map(attempt => `<tr>
       <th scope="row">Attempt ${attempt.number}<small>${esc(new Date(attempt.startedAt).toLocaleString())}</small></th>
       <td>${attempt.complete ? `${attempt.score} / ${attempt.total}` : 'In progress'}<small>${attempt.complete ? `${Math.round(attempt.score / attempt.total * 100)}%` : `${attempt.answered} of ${attempt.total} checked`}${attempt.same ? '' : ' · Earlier word list'}</small></td>
       <td>${attempt.change === null ? '—' : `${attempt.change > 0 ? '+' : ''}${attempt.change} points`}</td>
       <td><button type="button" class="secondary" data-ai-open="${esc(attempt.id)}" ${locked || test?.id === attempt.id ? 'disabled' : ''}>${test?.id === attempt.id ? 'Viewing' : 'View'}</button></td>
      </tr>`).join('')}</tbody>
     </table></div>
    </details>
   </section>`;
  }

  function renderWord(word, index, locked, complete) {
   const result = test.answers[word.id];
   const recording = mic?.id === word.id && mic.phase === 'recording';
   const opening = mic?.id === word.id && mic.phase === 'opening';
   const value = result?.answer ?? drafts[word.id] ?? '';
   const label = word.partOfSpeech === 'adjective' ? 'adj.' : word.partOfSpeech || '';
   let voiceLabel = '🎙 Check';
   if (result) voiceLabel = 'Answer saved ✓';
   else if (opening) voiceLabel = 'Opening mic…';
   else if (recording) voiceLabel = '■ Stop & check';
   let micStatus = '';
   if (mic?.id === word.id) {
    micStatus = recording ? '● Listening… tap Stop & check.' : opening ? 'Allow microphone access when asked.' : 'Reading your speech and checking…';
   }
   return `<article class="ai-word-row" data-ai-word="${esc(word.id)}">
    <div class="ai-word-heading"><span class="word-number">${String(index + 1).padStart(2, '0')}</span><div>
     <strong>${esc(word.word)}</strong>
     <span class="part-of-speech">${esc(label)}</span>
     <button type="button" class="speak-word" data-ai-speak="${esc(word.word)}" aria-label="Hear ${esc(word.word)} pronounced">🔊</button>
     <p class="usage">${formatSentence ? formatSentence(word) : esc(word.context || '')}</p>
    </div></div>
    <div class="ai-answer">
     <div class="ai-voice-controls">
      <button type="button" class="${recording ? 'is-recording' : ''}" data-ai-voice aria-label="${recording ? 'Stop and check' : 'Check'} ${esc(word.word)}" aria-pressed="${recording}" ${result || (locked && !recording) ? 'disabled' : ''}>${voiceLabel}</button>
      <button type="button" data-ai-unknown aria-label="I don’t know ${esc(word.word)}" aria-pressed="${Boolean(result?.unknown)}" ${locked || result ? 'disabled' : ''}>I don’t know</button>
     </div>
     <div class="ai-answer-controls">
      <input id="ai-answer-${esc(word.id)}" data-ai-answer aria-label="Your meaning for ${esc(word.word)}" value="${esc(value)}" maxlength="240" placeholder="Your spoken meaning appears here…" autocomplete="off" ${locked || result ? 'disabled' : ''}>
      <button type="button" data-ai-check ${locked || result ? 'disabled' : ''} ${result || !value.trim() ? 'hidden' : ''}>Check text</button>
     </div>
     ${micStatus ? `<p class="ai-mic-status" role="status">${micStatus}</p>` : ''}
     ${rowError[word.id] ? `<p class="ai-error" role="alert">${esc(rowError[word.id])}</p>` : ''}
     ${result ? `<p class="ai-result ${result.close ? 'is-close' : 'needs-review'}"><strong>${result.close ? '✓ Close enough · 1 point' : result.unknown ? 'I don’t know · 0 points' : 'Review this word · 0 points'}</strong>${complete ? `<span class="ai-short-meaning">${esc(result.meaning || '')}</span>` : ''}</p>` : ''}
    </div>
   </article>`;
  }

  function render() {
   if (destroyed) return;
   const complete = test && test.answered === test.total;
   const connected = Boolean(token());
   const locked = busy || loading || Boolean(mic);
   const scores = comparison(attempts, wordIds);
   const total = test?.total || count;
   const connectionStatus = loading ? 'Loading saved tests…' : busy ? 'Checking and saving…' : test ? 'Answers and score saved online' : 'Ready to start';
   let html = `<div class="ai-active-test" id="ai-active-test">
    <header class="ai-test-intro"><p class="eyebrow">SET ${section} · ${count} WORDS</p><h3 tabindex="-1">Say it in your own words.</h3>
    <p>Tap <strong>Check</strong> to start listening, then <strong>Stop &amp; check</strong>. Short English or Chinese meanings are welcome. Each close meaning earns <strong>1 point</strong>.</p></header>`;
   if (error) html += `<p class="ai-error" role="alert">${esc(error)}</p>`;
   if (!connected) {
    html += demo ? '<p class="small">Preview only. AI checks and online test saves are disabled.</p>' : '<div class="ai-connect"><p>Connect once, then you will return here to take the test.</p><button type="button" data-ai-connect>Connect AI checking</button></div>';
    host.innerHTML = html + '</div>';
    return;
   }
   html += `<section class="ai-score" aria-label="Test score">
    <div><strong>${test?.score || 0} / ${total}</strong><span>Set ${section} score${complete ? ` · ${Math.round(test.score / total * 100)}%` : ''}</span></div>
    <div><strong>${test?.answered || 0} / ${total}</strong><span>checked</span></div>
    <p role="status">${connectionStatus}</p>
   </section>`;
   html += `<div class="ai-test-actions">
    <button type="button" class="${test ? 'ai-retest' : ''}" data-ai-start ${locked ? 'disabled' : ''}>${test ? 'Retest' : `Start Set ${section}`}</button>
    <button type="button" class="secondary" data-ai-reload ${locked ? 'disabled' : ''}>Reload saved tests</button>
   </div>`;
   if (test) onProgress?.(`Set ${section} · Round 3 AI test · ${test.score}/${test.total} · ${test.answered}/${test.total} checked`);
   if (test?.previousLayout) html += '<p class="small">This saved attempt uses an earlier word list. Start a new retake for the current set.</p>';
   html += '<p class="ai-test-rules">Your first checked answer counts. Retest saves a separate score. Meanings appear after every word has been checked.</p>';
   if (complete) html += `<section class="ai-finished"><h3>Test complete · ${test.score} / ${test.total} · ${Math.round(test.score / test.total * 100)}%</h3><p>${test.total - test.score} words to review. Compare your answers with the short meanings below.</p></section>`;
   html += renderHistory(scores, locked);
   if (test) html += `<div class="ai-words">${shuffle(test.words, test.id).map((word, index) => renderWord(word, index, locked, complete)).join('')}</div>`;
   html += '<p class="ai-test-footer">You can use keyboard dictation or type your meaning. Recordings stop after 20 seconds and are sent for transcription and meaning checking.</p></div>';
   host.innerHTML = html;
  }

  async function load() {
   loading = true;
   error = '';
   render();
   try {
    const body = await request('attempts', { query: '&set=' + section });
    if (destroyed) return;
    attempts = body.attempts;
    rememberHistory(section, attempts);
    if (attempts.length) {
     const saved = await request('attempts', { query: '&id=' + encodeURIComponent(attempts[0].id) });
     if (destroyed) return;
     accept(saved.test);
    }
   } catch (failure) {
    if (!destroyed) error = failure.message;
   } finally {
    loading = false;
    render();
   }
  }

  async function start(){if(busy||loading||mic)return;busy=true;error='';startingId||=crypto.randomUUID();render();try{const body=await request('attempts',{method:'POST',body:JSON.stringify({id:startingId,section,wordListVersion:'six-sets-v2'})});if(destroyed)return;accept(body.test);startingId=null;rowError={};}catch(e){if(!destroyed)error=e.message;}finally{busy=false;render();}}
  async function check(word,unknown=false,audio){if(!test||test.answers[word.id]||busy)return;const answer=(drafts[word.id]||'').trim();if(!answer&&!unknown&&!audio){rowError[word.id]='Say or type a short meaning first.';render();return;}busy=true;rowError[word.id]='';if(audio)mic={id:word.id,phase:'checking'};render();try{let body;if(audio){body=new FormData();body.append('attemptId',test.id);body.append('wordId',word.id);body.append('audio',audio,'meaning');}else body=JSON.stringify({attemptId:test.id,wordId:word.id,answer,unknown});const result=await request(audio?'voice-check':'check',{method:'POST',body});if(destroyed)return;accept(result.test);}catch(e){if(!destroyed){rowError[word.id]=e.message;if(e.transcript){drafts[word.id]=e.transcript;write(draftKey(test.id),JSON.stringify(drafts));}if(!token())error=e.message;}}finally{busy=false;mic=null;render();}}
  function input(event){
   const field=event.target.closest('[data-ai-answer]');
   if(field&&test){
    const row=field.closest('[data-ai-word]');
    drafts[row.dataset.aiWord]=field.value;
    write(draftKey(test.id),JSON.stringify(drafts));
    row.querySelector('[data-ai-check]').hidden=!field.value.trim();
   }
  }
  async function click(event){
   if(event.target.closest('[data-ai-connect]')){connect(section);return;}
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
  return {destroy(){destroyed=true;lifetimeController.abort();capture?.cancel();host.removeEventListener('input',input);host.removeEventListener('click',click);document.removeEventListener('visibilitychange',interrupted);}};
 }
 window.HarryMeaningAI={mount,createDashboard,exportKnown:()=>Array.from(known.values()),comparison,shuffle};
})();
