(function(){
 'use strict';
 const D=window.STAR_REVIEW,groups=D.skillGroups,host=document.querySelector('#questions'),cards=[...host.querySelectorAll('.review-question')];if(!groups)return;
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const summary=document.createElement('section');summary.className='skill-overview';summary.setAttribute('aria-label','The 14 mistakes by skill');summary.innerHTML=`<h2>The 14 mistakes, grouped by skill</h2><p>These are the same eight skills in Harry’s new mixed practice. Choose a group to review its original questions.</p><div class="skill-summary-grid">${groups.map(g=>{const qs=D.questions.filter(q=>q.skill===g.id&&q.selected!==q.correct);return `<article><h3>${esc(g.name)}</h3><p><strong>${qs.length}</strong> wrong ${qs.length===1?'answer':'answers'}</p>${qs.length?`<button type="button" data-group="${g.id}">Review Q${qs.map(q=>q.number).join(', Q')} →</button>`:'<p class="muted">No unit conversions in this test. Included in mixed practice because of recent practice misses.</p>'}</article>`;}).join('')}</div><p><a href="../../../harry-math-practice/skill-check/">Open Harry’s Daily Math · 24 mixed questions per session →</a></p>`;
 document.querySelector('.review-hero').after(summary);
 const toggle=document.createElement('button');toggle.id='group-skills';toggle.type='button';toggle.textContent='Group by skill';document.querySelector('.toolbar').append(toggle);
 let grouped=new URLSearchParams(location.search).get('group')==='skill'||new URLSearchParams(location.search).get('filter')==='wrong';
 function arrange(){
  if(!grouped){host.replaceChildren(...cards);}else{
   const sections=groups.map(g=>{const section=document.createElement('section');section.className='skill-question-group';section.id='skill-'+g.id;section.setAttribute('aria-label',g.name);section.innerHTML=`<h2 class="skill-group-title">${esc(g.name)}</h2>`;for(const q of D.questions.filter(q=>q.skill===g.id))section.append(cards.find(c=>c.id==='q'+q.number));return section;});
   const others=document.createElement('section');others.className='skill-question-group';others.id='skill-other';others.innerHTML='<h2 class="skill-group-title">Other questions · correct answers</h2>';for(const q of D.questions.filter(q=>!q.skill))others.append(cards.find(c=>c.id==='q'+q.number));host.replaceChildren(...sections,others);
  }
  toggle.setAttribute('aria-pressed',String(grouped));update();
 }
 function update(){
  for(const section of host.querySelectorAll('.skill-question-group'))section.hidden=![...section.querySelectorAll('.review-question')].some(c=>!c.hidden);
  const visible=[...host.querySelectorAll('.review-question')].filter(c=>!c.hidden);document.querySelector('#jump-links').innerHTML=visible.map(c=>{const n=Number(c.id.slice(1));return `<a href="#${c.id}" class="${c.dataset.result==='wrong'?'wrong':''}" aria-label="Question ${n}, ${c.dataset.result}">${n}</a>`;}).join('');
  const url=new URL(location.href);if(grouped)url.searchParams.set('group','skill');else url.searchParams.delete('group');history.replaceState(null,'',url);
 }
 toggle.addEventListener('click',()=>{grouped=!grouped;arrange();});document.querySelector('#all-filter').addEventListener('click',update);document.querySelector('#wrong-filter').addEventListener('click',()=>{grouped=true;arrange();});
 summary.addEventListener('click',e=>{const button=e.target.closest('[data-group]');if(!button)return;document.querySelector('#wrong-filter').click();document.querySelector('#skill-'+button.dataset.group)?.scrollIntoView({block:'start',behavior:'smooth'});});arrange();
})();
