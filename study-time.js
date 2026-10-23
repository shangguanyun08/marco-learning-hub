(function(){
 'use strict';
 const API='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/study-time',TZ='America/Los_Angeles',$=id=>document.getElementById(id);
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const time=iso=>new Intl.DateTimeFormat('en-US',{timeZone:TZ,hour:'numeric',minute:'2-digit'}).format(new Date(iso));
 const duration=seconds=>{const s=Math.max(0,Math.round(seconds||0));if(s<60)return `${s} sec`;return `${Math.floor(s/60)} min${s%60?' '+s%60+' sec':''}`;};
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const subject=s=>s==='math'?'Math':s==='words'?'Words':'Mixed / unassigned';
 let history=[],currentDay=null,busy=false,generation=0;
 $('study-date').value=new URLSearchParams(location.search).get('date')||today();
 async function get(query){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{const r=await fetch(API+query,{cache:'no-store',signal:controller.signal});const data=await r.json();if(!r.ok)throw Error(data.error||'Time log unavailable');return data;}finally{clearTimeout(timer);}}
 function empty(node,text){node.replaceChildren(el('p',text,'empty'));}
 function renderDay(day){currentDay=day;const stats=day.students?.Marco,recorded=stats?.hasTimeRecord;
  $('math-time').textContent=stats?.mathSeconds?duration(stats.mathSeconds):'Not recorded';$('word-time').textContent=stats?.wordSeconds?duration(stats.wordSeconds):'Not recorded';$('total-time').textContent=recorded?duration(stats.seconds):'Not recorded';
  $('mixed-time').textContent=stats?.mixedSeconds?`${duration(stats.mixedSeconds)} is mixed or has no reliable subject label; it is included in the total.`:'';
  const sessions=window.StudyTimeModel.sessions(stats?.periods),sessionBox=$('study-sessions');sessionBox.replaceChildren();
  const gaps=sessions.some(s=>s.elapsedSeconds-s.capturedSeconds>90);
  $('time-coverage').textContent=recorded?(gaps?'Full study duration is incomplete. The totals below contain captured fragments only. See the longer session windows below.':'Captured time only. The full study duration may include reading or paper work the timer did not save.'):'Full study duration was not recorded. Saved answers still show work completed.';
  for(const session of sessions){
   const row=el('article',undefined,'work-period'),when=el('div'),what=el('div');
   when.append(el('strong',`${time(session.startedAt)}–${time(session.endedAt)}`),el('p',duration(session.elapsedSeconds)+' elapsed window','muted'));
   what.append(el('span',subject(session.subject),'badge'),el('strong',session.courseName),el('p',duration(session.capturedSeconds)+' captured by timer'));
   if(session.elapsedSeconds-session.capturedSeconds>90)what.append(el('small','Includes gaps · exact active duration unknown','muted'));
   const evidence=(day.recordedWork||[]).some(item=>item.appId===session.appId&&item.answerEvents>0&&item.firstRecordedAt<=session.endedAt&&item.lastRecordedAt>=session.startedAt);
   if(!evidence&&session.elapsedSeconds>=300)what.append(el('p','Answer timestamps are not available online for this window. Reopen the practice page on the device used to retry syncing.','muted'));
   row.append(when,what);sessionBox.append(row);
  }
  if(!sessions.length)empty(sessionBox,'No recorded activity windows for this date.');
  const periods=$('study-periods');periods.replaceChildren();
  for(const p of stats?.periods||[]){const row=el('article',undefined,'work-period'),when=el('div'),what=el('div');when.append(el('strong',`${time(p.startedAt)}–${time(p.endedAt)}`),el('p',duration(p.seconds)+' captured','muted'));what.append(el('span',subject(p.subject),'badge'),el('strong',p.courseName),el('p',p.context||'Practice'));if(p.source==='legacy')what.append(el('small','Earlier minute-based estimate','muted'));row.append(when,what);periods.append(row);}
  if(!periods.children.length)empty(periods,'No active-time records for this date. Any saved answer timestamps appear below.');
  const evidence=$('study-evidence');evidence.replaceChildren();
  for(const item of (day.recordedWork||[]).sort((a,b)=>a.firstRecordedAt.localeCompare(b.firstRecordedAt))){const row=el('article',undefined,'evidence-row'),when=el('div'),what=el('div');when.append(el('strong',item.firstRecordedAt===item.lastRecordedAt?time(item.firstRecordedAt):`${time(item.firstRecordedAt)}–${time(item.lastRecordedAt)}`));what.append(el('strong',`${item.courseName} · ${item.context}`),el('p',`${item.answerEvents} saved answer / retry timestamps${item.completed?' · A finish timestamp is saved':''}`),el('small','Timestamp evidence only; duration is taken from the active-time log when available.','muted'));row.append(when,what);evidence.append(row);}
  if(!evidence.children.length)empty(evidence,'No saved test timestamps for this date.');
 }
 function renderHistory(){const body=$('study-history');body.replaceChildren();for(const d of history){const stats=d.students?.Marco;if(!stats?.hasTimeRecord&&!stats?.hasHistoricalEvidence&&d.date!==today())continue;const tr=el('tr');if(d.date===$('study-date').value)tr.className='selected-day';const cell=el('td'),button=el('button',d.date);button.type='button';button.onclick=()=>{$('study-date').value=d.date;void refresh(false);};cell.append(button);tr.append(cell);for(const key of ['mathSeconds','wordSeconds','mixedSeconds','seconds'])tr.append(el('td',stats[key]?duration(stats[key]):key==='mixedSeconds'?'—':'Not recorded'));body.append(tr);}}
 async function refresh(all=true){const token=++generation;busy=true;$('refresh-time').disabled=true;$('download-time').disabled=true;$('time-status').textContent='Loading saved time records…';const date=$('study-date').value||today();try{const [detail,summary]=await Promise.all([get('?date='+encodeURIComponent(date)),all?get('?all=1'):Promise.resolve(null)]);if(token!==generation)return;if(summary)history=summary.history||[];renderDay(detail.day);renderHistory();$('time-status').textContent='Saved online · Pacific time · Refreshed '+time(new Date().toISOString());window.history.replaceState(null,'','?date='+encodeURIComponent(date));}catch{if(token!==generation)return;currentDay=null;['math-time','word-time','total-time'].forEach(id=>$(id).textContent='—');$('time-status').textContent='Could not load saved time. Please refresh when connected.';empty($('study-periods'),'Time records are temporarily unavailable.');empty($('study-sessions'),'Session windows are temporarily unavailable.');empty($('study-evidence'),'Saved answer timestamps are temporarily unavailable.');$('time-coverage').textContent='Time records could not be loaded.';}finally{if(token===generation){busy=false;$('refresh-time').disabled=false;$('download-time').disabled=!currentDay;}}}
 $('study-date').onchange=()=>void refresh(false);$('refresh-time').onclick=()=>void refresh(true);
 $('download-time').onclick=()=>{if(!currentDay)return;const blob=new Blob([JSON.stringify({timeZone:TZ,...currentDay},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=`marco-study-time-${currentDay.date}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void refresh(true);});setInterval(()=>{if(!busy&&document.visibilityState==='visible')void refresh(true);},60000);void refresh(true);
})();
