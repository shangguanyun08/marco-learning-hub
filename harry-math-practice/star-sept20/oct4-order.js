(function(){
  'use strict';
  // Display order only: source IDs, choices, keys, and saved attempts stay intact.
  // Start with familiar facts, then number skills, multi-step work, and data analysis.
  // Keep the parent's requested six-blank conversion item at Q2 in every session.
  const order=[3002,7,29,17,12,32,31,27,3005,3009,23,15,6,8,34,25];
  for(const session of window.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-10-04')){
    const bySource=new Map(session.questions.map(q=>[q.source,q]));
    if(bySource.size!==order.length||order.some(source=>!bySource.has(source)))throw new Error('October 4 question order does not match the question bank.');
    session.questions=order.map(source=>bySource.get(source));
    session.description=session.description.replace(' as Questions 14–16','')+' Ordered from easier skills to harder multi-step questions and graphs.';
  }
})();
