(function(root){
  'use strict';
  // Historical runs must keep the wording, choices, and keys they actually used.
  root.MARCO_ISEE_PREVIOUS_PRACTICE=root.MARCO_ISEE_PRACTICE;
  const originalVR=root.MARCO_ISEE_REVIEW.filter(q=>q.section==='VR');
  root.MARCO_ISEE_PRACTICE=root.MARCO_ISEE_PRACTICE.map(s=>s.number>3?s:{
    ...s,label:`Original VR + math practice ${s.number}`,
    questions:s.questions.map(q=>q.section==='VR'?{...originalVR.find(v=>v.source===q.source),practiceKind:'Original VR question'}:q)
  });
})(window);
