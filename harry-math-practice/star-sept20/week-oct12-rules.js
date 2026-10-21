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
 // Day 3.6 and all later weekly sessions unlock together after Day 3.5.
 function lockReason(session,state){
  const current=base(session?.baseId||session?.id),cutoff=bank.findIndex(s=>s.id==='week-oct12-3-6');
  if(!current||current.group!=='week-2026-10-12'||cutoff<0||bank.indexOf(current)<cutoff)return '';
  const required=base('week-oct12-3-5');
  if(required&&stats(required,state)?.finished===required.questions.length)return '';
  return 'Finish all 6 questions in Day 3.5 correctly to unlock Day 3.6 and later sessions. Retries count toward completion.';
 }
 root.HarryWeekRules={lockReason,stats,day3Passed,unfinished};
})(window);

