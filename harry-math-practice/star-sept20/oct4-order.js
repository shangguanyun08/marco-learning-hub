(function(){
  'use strict';
  // Display order only: source IDs, choices, keys, and saved attempts stay intact.
  // Start with familiar facts, then number skills, multi-step work, and data analysis.
  // Keep the parent's requested six-blank conversion item at Q2 in every session.
  const order=[3002,7,17,12,32,31,27,3005,3009,23,15,6,8,34,25];
  for(const session of window.HARRY_SEPT_PRACTICE.filter(s=>s.group==='2026-10-04')){
    const bySource=new Map(session.questions.map(q=>[q.source,q]));
    // Removed from active practice by the parent; keep source data for exported history.
    session.retiredQuestions=[bySource.get(29)].filter(Boolean);bySource.delete(29);
    if(bySource.size!==order.length||order.some(source=>!bySource.has(source)))throw new Error('October 4 question order does not match the question bank.');
    session.questions=order.map(source=>bySource.get(source));
    session.description=session.description.replace(' as Questions 14–16','').replace('13 original wrong questions','12 selected wrong questions').replace('16 fresh questions: 13 matching','15 fresh questions: 12 matching')+' The perpendicular-lines question has been removed. Ordered from easier skills to harder multi-step questions and graphs.';
  }
  window.HARRY_STAR_GROUPS.find(g=>g.id==='2026-10-04').description='STAR Math: 34 checked, 21 correct choices and 13 wrong. Practice now includes 12 of those skills plus 3 requested October 1 reviews. Four sessions of 15 questions; perpendicular lines removed.';
})();
