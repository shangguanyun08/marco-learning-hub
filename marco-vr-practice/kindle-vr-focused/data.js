(function(root){
  'use strict';
  // Published membership is immutable. A different selection must use new session IDs.
  const previous=root.MARCO_ISEE_PRACTICE.flatMap(s=>s.questions);
  const retained=[101,102,106,112,116,117,118,206,207,211,212,213,217,302,306,310,316,318,319,408,410,414,417,419,420,508,511,517,519,602,606,607,608,614,615,619,705,710,715,719,720,802,804,805,806,809,810,124,125,140,225,233,234,338,421,439,525,530,535,536,621,633,635,730,732,737,823,825,830,835,836,839,840];
  const keep=new Set(retained);
  const all=[...previous.filter(q=>keep.has(q.source)),...root.KINDLE_FOCUSED_PDF].map(q=>JSON.parse(JSON.stringify(q)));
  if(all.length!==245||new Set(all.map(q=>q.source)).size!==245)throw new Error('Focused bank membership mismatch');
  function acrossTests(synonym){
    const queues=Array.from({length:41},(_,i)=>all.filter(q=>q.test===i+1&&(q.type==='synonym')===synonym).sort((a,b)=>a.source-b.source));
    const result=[];
    while(queues.some(q=>q.length))for(const queue of queues)if(queue.length)result.push(queue.shift());
    return result;
  }
  const synonyms=acrossTests(true),sentences=acrossTests(false);
  const mixed=[];
  while(synonyms.length||sentences.length){if(synonyms.length)mixed.push(synonyms.shift());if(synonyms.length)mixed.push(synonyms.shift());if(sentences.length)mixed.push(sentences.shift());}
  const pages=[];
  while(mixed.length>=80)pages.push(mixed.splice(0,40));
  if(mixed.length)pages.push(mixed.splice(0));
  root.MARCO_ISEE_PRACTICE=pages.map((questions,i)=>({id:`kindle-vr-focused-page-${i+1}-20261024-v1`,number:i+1,label:`Page ${i+1} · ${questions.length} questions`,questions}));
  root.KINDLE_FOCUSED_COURSE={total:245,synonyms:168,completions:77,pages:6,retained:73,archived:73,pdfReviewed:1320,pdfSelected:172,pdfTests:'9–41'};
  root.MARCO_TEST_REVIEW_SYNC_OPTIONS={appId:'marco-vr-kindle-focused-20261024-v1',savedMessage:'Live online sync · Focused VR pages saved online and on this device.',connectedMessage:'Live online sync connected · All focused VR pages sync across devices.'};
})(window);
