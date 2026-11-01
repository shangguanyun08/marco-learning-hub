/* Stable mixed membership; the original bank and submitted sections stay intact. */
(function(){
 'use strict';
 const source=window.MARCO_MEANING_CHECK,words=source.words.slice();
 let seed=2166136261;for(const ch of source.appId+':mixed-sections-20261101')seed=Math.imul(seed^ch.charCodeAt(0),16777619);
 for(let i=words.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[words[i],words[j]]=[words[j],words[i]];}
 window.MARCO_MEANING_PRACTICE={...source,order:'mixed',words:words.map((w,i)=>({...w,originalNumber:w.number,originalSection:w.section,number:i+1,section:Math.floor(i/source.sectionSize)+1}))};
})();
