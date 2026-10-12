(function(){
 'use strict';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const firstRun=runs=>(runs||[]).filter(r=>Object.values(r.answers).some(e=>e.attempts?.length)).slice().sort((a,b)=>a.startedAt.localeCompare(b.startedAt)||a.id.localeCompare(b.id))[0];
 function render({bank,state,engine,groupId}){
  let box=document.getElementById('weekly-progress');
  if(!box){box=document.createElement('section');box.id='weekly-progress';box.className='weekly-progress';document.getElementById('day-overview').append(box);}
  box.hidden=groupId!=='week-2026-10-12';if(box.hidden)return;
  const rows=bank.filter(s=>s.group===groupId).map(s=>{const r=firstRun(state.sessions[s.id]);return {s,r,stats:r?engine.stats(s,r):null};});
  const finals=rows.filter(x=>x.stats?.attempted===12),first=finals[0],last=finals.at(-1),delta=first&&last?last.stats.first-first.stats.first:0;
  const trend=finals.length<2?'Finish the first answers on two different days to see a comparison.':`${first.s.cardLabel}: ${first.stats.first}/12 → ${last.s.cardLabel}: ${last.stats.first}/12. ${delta>0?`${delta} more`:delta<0?`${-delta} fewer`:'The same number of'} first-try answers correct. Look for a pattern across several days, not just one change.`;
  box.innerHTML=`<h2>Your daily scores</h2><p class="week-rule">One point per correct first answer. Every day is out of 12. This comparison keeps your <strong>first run</strong>; retries and repeat runs cannot raise it.</p><p class="week-trend" role="status">${esc(trend)}</p><div class="week-table-wrap"><table class="week-score-table"><thead><tr><th scope="col">Day</th><th scope="col">First-try score</th><th scope="col">Change*</th><th scope="col">Retry fixes</th></tr></thead><tbody>${rows.map(({s,r,stats},i)=>{
   const final=stats?.attempted===12,prev=rows[i-1]?.stats,change=final&&prev?.attempted===12?stats.first-prev.first:null;
   return `<tr><th scope="row"><a href="?session=${s.id}">${esc(s.cardLabel)}</a><small>${!stats?'Not started':stats.finished===12?'Completed':final?'Finish remaining retries':`${stats.attempted}/12 answered`}</small></th><td>${final?`<strong>${stats.first}/12</strong><small>${stats.percent}%</small>`:stats?`${stats.first} correct so far`:'—'}</td><td>${change===null?'—':change>0?'+'+change:change}</td><td>${stats?stats.corrected:'—'}</td></tr>`;
  }).join('')}</tbody></table></div><p class="week-footnote">*Compared with the previous scheduled day, only after all 12 first answers are recorded on both days. Unfinished days are not zero scores. Similar skill coverage is not a standardized difficulty scale.</p><details class="week-review"><summary>Quick parent review · First-try misses</summary>${rows.filter(x=>x.stats).map(({s,r,stats})=>`<h3>${esc(s.cardLabel)}</h3><p>${stats.first}/${stats.attempted} first answers correct${stats.attempted<12?' · incomplete':''}; ${stats.corrected} fixed on retry.</p><ul>${s.questions.map((q,i)=>{const a=r.answers[q.source]?.attempts;return a?.length&&!engine.isCorrect(q,a[0].choice)?`<li><a href="?session=${s.id}#q${i+1}">Q${i+1} · ${esc(q.skill)}</a> — ${a[1]?engine.isCorrect(q,a[1].choice)?'fixed on retry':'answer shown':'retry available'}</li>`:'';}).join('')||'<li>No first-try misses recorded.</li>'}</ul>`).join('')||'<p>No answers recorded yet.</p>'}</details>`;
 }
 window.HarryWeekProgress={firstRun,render};
 const previous=window.HarryStarVisuals.draw;
 window.HarryStarVisuals.draw=function(v,index){
  if(v?.type!=='week-numberline')return previous(v,index);if(index!==undefined)return '';
  const x=i=>40+500*i/v.parts;
  return `<svg class="question-diagram" viewBox="0 0 580 135" role="img" aria-label="Number line from zero to one in ${v.parts} equal intervals, with P at the ${v.point}th tick after zero." xmlns="http://www.w3.org/2000/svg"><line x1="40" y1="65" x2="540" y2="65" stroke="#193c49" stroke-width="3"/>${Array.from({length:v.parts+1},(_,i)=>`<line x1="${x(i)}" y1="55" x2="${x(i)}" y2="75" stroke="#193c49" stroke-width="3"/>`).join('')}<circle cx="${x(v.point)}" cy="65" r="6" fill="#193c49"/><text x="${x(v.point)}" y="37" font-size="27" text-anchor="middle">P</text><text x="40" y="110" font-size="25" text-anchor="middle">0</text><text x="540" y="110" font-size="25" text-anchor="middle">1</text></svg>`;
 };
})();
