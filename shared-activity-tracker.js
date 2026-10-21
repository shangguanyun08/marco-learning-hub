(function installActiveStudyTracker() {
  'use strict';
  if(typeof document==='undefined')return;
  const script=document.currentScript, appId=script?.dataset.appId;
  if(!appId||window.MarcoStudyTime||['localhost','127.0.0.1'].includes(location.hostname)||location.protocol==='file:'||new URLSearchParams(location.search).has('demo'))return;
  const API='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/study-time';
  const HUB='https://shangguanyun08.github.io/marco-learning-hub/';
  const PREFIX='study-time-v2:', IDLE=90000, TICK=10000;
  const courseName=script.dataset.course||document.title;
  const mixed=/middle-(sept25|sept27|oct04|oct11)/.test(appId);
  const defaultSubject=script.dataset.subject||(mixed?'mixed':/math|thinkacademy|sept26/.test(appId)?'math':'words');
  let lastEngaged=0,lastTick=Date.now(),current=null,paused=false,saving=false,online=true,storageOK=true;
  const memory=new Map();
  let buffer=null;
  const uuid=()=>window.crypto?.randomUUID?.()||`time_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const plain=node=>(node?.textContent||'').replace(/\s+/g,' ').trim();
  function context(target){
    const params=new URLSearchParams(location.search),set=params.get('set'),session=params.get('session');
    const chosen=document.querySelector('[data-session][aria-current="page"], [data-session][aria-pressed="true"], [data-session].selected, [data-session].active, [data-day][aria-current="true"]');
    const heading=document.querySelector('.session-workspace[aria-label]');
    let label=heading?.getAttribute('aria-label')||plain(document.querySelector('#round-status-title'))||'';
    if(!label&&set)label=`Set ${set} · Round ${params.get('round')||1}`;
    if(!label&&chosen)label=plain(chosen.querySelector('strong,span')||chosen).slice(0,100);
    if(!label&&session)label=`Session ${session.replace(/^session-/,'')}`;
    if(!label&&document.body.dataset.session&&document.body.dataset.session!=='0')label=`Session ${document.body.dataset.session} · ${params.get('part')||'Practice'}`;
    if(!label)label=plain(document.querySelector('#session-title, .stage-head h2, #workspace h2, main h1'))||document.title;
    const round=plain(document.querySelector('.round-subheading h2, .round-heading h2, .quiz-header h2'));
    if(round&&!/Round \d/.test(label))label+=' · '+round.slice(0,45);
    let q=target?.closest?.('[data-study-subject], article.question, .question-item, .question-card');
    if(!q&&mixed){const candidates=[...document.querySelectorAll('[data-study-subject],article.question')];q=candidates.find(el=>{const r=el.getBoundingClientRect();return r.bottom>120&&r.top<innerHeight*.65;});}
    const source=plain(q?.querySelector('.source,.question-head,.question-item-topline'));
    const subject=!mixed?defaultSubject:q?.dataset.studySubject||(/\b(VR|vocab|synonym|verbal)\b/i.test(source)?'words':/\b(QR|MA|math)\b/i.test(source)?'math':'mixed');
    const group=target?.closest?.('details.record,details.concept,section[data-concept],.subtopic');
    const skill=plain(group?.querySelector('summary .topic,summary h2,summary h3,summary strong,summary'));
    if(skill)label+=' · '+skill.split(/Review [234]:|First try|＋/)[0].trim().slice(0,65);
    return {appId,courseName,subject,context:label.slice(0,180)};
  }
  function pending(){
    const all=new Map(memory);
    try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key?.startsWith(PREFIX))continue;try{const record=JSON.parse(localStorage.getItem(key));if(Date.parse(record.startedAt)<Date.now()-29*86400000){localStorage.removeItem(key);continue;}all.set(record.id,record);}catch{}}}catch{storageOK=false;}
    return [...all.values()].slice(0,100);
  }
  function seal(){if(!buffer)return;const record=buffer;buffer=null;memory.set(record.id,record);try{localStorage.setItem(PREFIX+record.id,JSON.stringify(record));}catch{storageOK=false;}}
  function keep(record){
    if(buffer&&buffer.appId===record.appId&&buffer.context===record.context&&buffer.subject===record.subject&&buffer.endedAt===record.startedAt&&Date.parse(record.endedAt)-Date.parse(buffer.startedAt)<=120000)buffer.endedAt=record.endedAt;
    else{seal();buffer=record;}
  }
  function forget(id){memory.delete(id);try{localStorage.removeItem(PREFIX+id);}catch{storageOK=false;}}
  async function flush(){
    seal();if(saving)return;const batch=pending();if(!batch.length){paint();return;}saving=true;
    try{const response=await fetch(API,{method:'POST',cache:'no-store',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify({segments:batch})});if(!response.ok)throw Error('Time sync unavailable');const result=await response.json();if(result.accepted){for(const id of result.ids||[])forget(id);}online=true;}
    catch{online=false;}finally{saving=false;paint();}
  }
  function visible(){return document.visibilityState==='visible'&&document.hasFocus();}
  function tick(at=Date.now()){
    // A suspended device/long timer gap is not evidence of study during the gap.
    if(current&&!paused&&lastEngaged&&at-lastTick<=30000){const end=Math.min(at,lastEngaged+IDLE);if(end>lastTick)keep({...current,id:uuid(),startedAt:new Date(lastTick).toISOString(),endedAt:new Date(end).toISOString()});}
    lastTick=at;if(!visible()||at-lastEngaged>=IDLE)current=null;paint();
  }
  function engage(event){
    if(event?.target?.closest?.('#study-time-status')||!visible()||paused||event?.type==='scroll'&&!lastEngaged)return;
    const at=Date.now();tick(at);lastEngaged=at;lastTick=at;current=context(event?.target);paint();
    window.queueMicrotask(()=>{if(current&&!paused)current=context(event?.target);});
  }
  let status,caption,toggle;
  function mount(){
    if(document.getElementById('study-time-status'))return;
    status=document.createElement('aside');status.id='study-time-status';status.setAttribute('aria-label','Study time recorder');
    status.style.cssText='margin:16px auto;padding:10px 14px;max-width:1050px;border:1px solid #bdccd6;border-radius:12px;background:#f4f8fb;color:#173957;font:14px/1.5 system-ui;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center';
    caption=document.createElement('span');caption.style.flex='1 1 250px';toggle=document.createElement('button');toggle.type='button';toggle.style.cssText='font:inherit;border:1px solid #9bb0bf;border-radius:7px;padding:5px 10px;background:white;color:#173957;cursor:pointer';
    toggle.onclick=()=>{tick();paused=!paused;lastEngaged=0;current=null;if(!paused){lastEngaged=Date.now();lastTick=lastEngaged;current=context();}void flush();paint();};
    const link=document.createElement('a');link.href=HUB+'study-time.html';link.textContent='Daily time log';link.style.color='inherit';status.append(caption,toggle,link);document.body.append(status);paint();
  }
  function paint(){if(!caption)return;const active=current&&!paused&&Date.now()-lastEngaged<IDLE;caption.textContent=(paused?'Time recording paused':active?'Recording active study time':'Time recorder ready · pauses after 90 seconds without activity')+(online?'':' · Saved here; waiting to sync')+(!storageOK?' · Keep this page open until synced':'');toggle.textContent=paused?'Resume recording':'Pause recording';toggle.setAttribute('aria-pressed',String(paused));}
  window.MarcoStudyTime={flush,pause(){tick();paused=true;current=null;void flush();paint();}};
  ['pointerdown','keydown','input','scroll','touchstart'].forEach(name=>window.addEventListener(name,engage,{passive:true,capture:true}));
  document.addEventListener('visibilitychange',()=>{tick();current=null;lastEngaged=0;void flush();});
  window.addEventListener('blur',()=>{tick();current=null;lastEngaged=0;void flush();});
  window.addEventListener('pagehide',()=>{tick();current=null;void flush();});
  window.addEventListener('online',()=>void flush());
  window.setInterval(()=>{tick();void flush();},TICK);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  void flush();
})();
