(function(root){
 'use strict';
 const bank=root.HARRY_SEPT_PRACTICE,E=root.HarrySeptEngine,R=root.HarryWeekRound2;
 const base=id=>bank.find(s=>s.id===id),first=s=>R.firstRun(s),ids=['week-oct12-3','week-oct12-3-2','week-oct12-3-3'];
 function stats(s,state){const r=first(state.sessions[s.id]);return r?E.stats(s,r):null;}
 function unfinished(s,state){
  if(stats(s,state)?.finished!==s.questions.length)return s.practiceOnly?`Finish every question in ${s.cardLabel} correctly.`:`Finish ${s.cardLabel}, including every second try.`;
  if(s.practiceOnly)return '';
  const review=R.resolve(s.id+'-round2',state);
  if(review.questions.length&&!(state.sessions[review.id]||[]).some(r=>E.stats(review,r).finished===review.questions.length))return `Finish ${s.cardLabel} Round 2 before moving on.`;
  return '';
 }
 function day3Passed(state){for(const id of ids){const s=base(id);if(unfinished(s,state))return false;if(stats(s,state)?.first>=9)return true;}return false;}
 // All sessions in this practice week are open, independent of prior completion or scores.
 function lockReason(){return '';}
 root.HarryWeekRules={lockReason,stats,day3Passed,unfinished};
})(window);

