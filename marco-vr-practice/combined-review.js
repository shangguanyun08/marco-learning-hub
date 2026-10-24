(function(){
 'use strict';
 const key='marco-vr-combined-review:visibility:v1',cards=[...document.querySelectorAll('.review-question')];let prefs={};
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))prefs=saved;}catch{}
 function hidden(card,hide){card.classList.toggle('answers-hidden',hide);card.querySelectorAll('.answer-content').forEach(el=>el.hidden=hide);const b=card.querySelector('.answer-toggle');b.textContent=hide?'Show answer':'Hide answer';b.setAttribute('aria-expanded',String(!hide));prefs[card.dataset.record]=hide;}
 cards.forEach(card=>hidden(card,prefs[card.dataset.record]===true));
 document.addEventListener('click',event=>{const one=event.target.closest('button[data-toggle]'),all=event.target.closest('button[data-all]');if(one)hidden(one.closest('.review-question'),!one.closest('.review-question').classList.contains('answers-hidden'));if(all)cards.forEach(card=>hidden(card,all.dataset.all==='hide'));if(one||all)try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}});
 const search=document.getElementById('find-word'),entries=[...document.querySelectorAll('.meaning-entry')],groups=[...document.querySelectorAll('.vocabulary-group')];
 search.addEventListener('input',()=>{const text=search.value.trim().toLowerCase();let n=0;for(const entry of entries){const show=!text||entry.textContent.toLowerCase().includes(text);entry.hidden=!show;n+=show?1:0;}for(const group of groups)group.hidden=![...group.querySelectorAll('.meaning-entry')].some(entry=>!entry.hidden);document.getElementById('word-count').textContent=text?`Showing ${n} of ${entries.length} words and phrases`:`Showing all ${entries.length} words and phrases`;document.getElementById('no-matches').hidden=n!==0;});
})();
