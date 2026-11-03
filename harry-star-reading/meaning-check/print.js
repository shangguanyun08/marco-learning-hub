(function(){
  'use strict';
  const data=window.HARRY_MEANING_CHECK,meanings=window.HARRY_SHORT_MEANINGS,perPage=30;
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pages=[],groups=[];
  for(let i=0;i<data.words.length;i+=perPage)groups.push(data.words.slice(i,i+perPage));
  if(groups.length>1&&groups.at(-1).length<perPage){const tail=groups.pop();groups.at(-1).push(...tail);}
  for(const words of groups){
    const sets=[...new Set(words.map(w=>w.section))];
    pages.push({number:pages.length+1,words,sets,label:sets.length===1?`Set ${sets[0]}`:`Sets ${sets[0]}–${sets.at(-1)}`});
  }
  const query=new URLSearchParams(location.search),selected=Number(query.get('page')),selectedSet=Number(query.get('set'));
  const chosen=pages.find(p=>p.number===selected)||pages.find(p=>p.sets.includes(selectedSet));
  const shown=chosen?[chosen]:pages;
  document.getElementById('print-nav').innerHTML=`<a href="print.html" ${!chosen?'aria-current="page"':''}>All pages</a>`+pages.map(p=>`<a href="print.html?page=${p.number}" ${chosen===p?'aria-current="page"':''}>Page ${p.number} · ${p.label}</a>`).join('');
  document.getElementById('download-pdf').textContent=`All words PDF · ${pages.length} pages`;
  document.getElementById('print-pages').innerHTML=shown.map(p=>`<section class="print-page" aria-labelledby="heading-${p.number}"><p class="kicker">HARRY · WORD MEANINGS</p><h1 id="heading-${p.number}">${p.label} <span>· ${p.words.length} words</span></h1><p class="quiz-tip">Cover the meanings. Say or write a simple meaning for each word.</p><p class="name-line">Name: ____________________________ <span>Date: __________________</span></p><table><colgroup><col class="word-column"><col></colgroup><thead><tr><th scope="col">Word</th><th scope="col">Simple meaning</th></tr></thead><tbody>${p.words.map(w=>`<tr><th scope="row">${esc(w.word)}</th><td>${esc(meanings[w.id])}</td></tr>`).join('')}</tbody></table><p class="sheet-footer">Close meanings are welcome. · Page ${p.number} of ${pages.length}</p></section>`).join('');
  document.getElementById('print-sheets').addEventListener('click',()=>window.print());
})();
