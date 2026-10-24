(function(root){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function tokens(q){
    let index=0;
    return (q.prompt.match(/\s+|\S+/g)||[]).map(text=>({text,index:/\s/.test(text)||/^_+[,.;:!?]?$/.test(text)?null:index++}));
  }
  function selected(q,values){
    const picked=new Set(values?.clues||[]);
    return tokens(q).filter(t=>t.index!==null&&picked.has(t.index)).map(t=>t.text).join(' ');
  }
  function prompt(q,values,locked){
    const picked=new Set(values?.clues||[]);
    return tokens(q).map(t=>{
      if(t.index===null)return esc(t.text);
      const on=picked.has(t.index);
      if(locked)return on?`<mark class="clue-highlight">${esc(t.text)}</mark>`:esc(t.text);
      return `<button type="button" class="clue-word${on?' is-highlighted':''}" data-clue="${t.index}" id="clue-${q.source}-${t.index}" aria-pressed="${on}" aria-label="${on?'Unhighlight':'Highlight'} clue: ${esc(t.text)}">${esc(t.text)}</button>`;
    }).join('');
  }
  function guide(q,values){
    const text=selected(q,values);
    return `<h4>Highlight clue words <span class="optional-label">(optional)</span></h4><p class="sentence-prediction-guide" id="prediction-guide-${q.source}"><strong>Highlight the key words in the rest of the sentence.</strong> Tap a word above to highlight it; tap again to remove it. Use those clues to predict the blank. If the ideas contrast, think of their <strong>opposite</strong>.</p><p class="highlight-summary">${text?`Your highlighted clues: <strong>${esc(text)}</strong>`:'No clues highlighted yet. You can still show the choices.'}</p>`;
  }
  root.KindleVRClues={tokens,selected,prompt,guide};
})(window);
