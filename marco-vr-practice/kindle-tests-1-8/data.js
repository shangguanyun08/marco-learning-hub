(function(root){
  'use strict';
  // A new course namespace keeps the original 24-question runs unchanged.
  // Never add/reorder questions under these published page IDs; version a future bank.
  const originals=root.MARCO_ISEE_PRACTICE[0].questions;
  const all=[...originals,...root.KINDLE_VR_EXTRA].map(q=>JSON.parse(JSON.stringify(q)));
  const queues=Array.from({length:8},(_,i)=>{
    const source=all.filter(q=>q.test===i+1).sort((a,b)=>a.source-b.source);
    const synonyms=source.filter(q=>q.type==='synonym'),sentences=source.filter(q=>q.type!=='synonym'),queue=[];
    while(synonyms.length||sentences.length){if(synonyms.length)queue.push(synonyms.shift());if(sentences.length)queue.push(sentences.shift());if(synonyms.length)queue.push(synonyms.shift());}
    return queue;
  });
  const mixed=[];
  while(queues.some(q=>q.length)) for(const q of queues) if(q.length) mixed.push(q.shift());
  const pages=[];
  while(mixed.length>=80) pages.push(mixed.splice(0,40));
  if(mixed.length) pages.push(mixed.splice(0));
  root.MARCO_ISEE_PRACTICE=pages.map((questions,i)=>({id:`kindle-vr-tests-1-8-page-${i+1}-20261024-v1`,number:i+1,label:`Page ${i+1} · ${questions.length} questions`,questions}));
  root.KINDLE_VR_COURSE={total:all.length,reviewed:320,tests:8,synonyms:all.filter(q=>q.type==='synonym').length,completions:all.filter(q=>q.type!=='synonym').length,originals:originals.length,added:root.KINDLE_VR_EXTRA.length};
  root.MARCO_TEST_REVIEW_SYNC_OPTIONS={appId:'marco-vr-kindle-tests1-8-hard-20261024-v1',savedMessage:'Live online sync · All Kindle Tests 1–8 pages saved online and on this device.',connectedMessage:'Live online sync connected · All Kindle Tests 1–8 pages sync across devices.'};
})(window);
