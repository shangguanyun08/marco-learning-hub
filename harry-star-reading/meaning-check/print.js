(function(){
  'use strict';
  const data=window.HARRY_MEANING_CHECK,meanings=window.HARRY_SHORT_MEANINGS;
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const selected=Number(new URLSearchParams(location.search).get('set'));
  const sections=data.sections.some(s=>s.number===selected)?data.sections.filter(s=>s.number===selected):data.sections;
  document.getElementById('print-nav').innerHTML=`<a href="print.html" ${sections.length>1?'aria-current="page"':''}>All sets</a>`+data.sections.map(s=>`<a href="print.html?set=${s.number}" ${s.number===selected?'aria-current="page"':''}>Set ${s.number}</a>`).join('');
  document.getElementById('download-pdf').textContent='All sets PDF · 7 pages';
  document.getElementById('print-pages').innerHTML=sections.map(s=>`<section class="print-page" aria-labelledby="heading-${s.number}"><p class="kicker">HARRY · WORD MEANINGS</p><h1 id="heading-${s.number}">Set ${s.number} <span>· ${s.count} words</span></h1><p class="quiz-tip">Cover the meanings. Say or write a simple meaning for each word.</p><p class="name-line">Name: ____________________________ <span>Date: __________________</span></p><table><colgroup><col class="word-column"><col></colgroup><thead><tr><th scope="col">Word</th><th scope="col">Simple meaning</th></tr></thead><tbody>${data.words.filter(w=>w.section===s.number).map(w=>`<tr><th scope="row">${esc(w.word)}</th><td>${esc(meanings[w.id])}</td></tr>`).join('')}</tbody></table><p class="sheet-footer">Close meanings are welcome. · Set ${s.number} of ${data.sections.length}</p></section>`).join('');
  document.getElementById('print-sheets').addEventListener('click',()=>window.print());
})();
