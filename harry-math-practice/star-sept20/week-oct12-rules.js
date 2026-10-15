(function(root){
 'use strict';
 const bank=root.HARRY_SEPT_PRACTICE,E=root.HarrySeptEngine,R=root.HarryWeekRound2;
 const base=id=>bank.find(s=>s.id===id),first=s=>R.firstRun(s),ids=['week-oct12-3','week-oct12-3-2','week-oct12-3-3'];
 function stats(s,state){const r=first(state.sessions[s.id]);return r?E.stats(s,r):null;}
 function unfinished(s,state){
  if(stats(s,state)?.finished!==s.questions.length)return `Finish ${s.cardLabel}, including every second try.`;
  const review=R.resolve(s.id+'-round2',state);
  if(review.questions.length&&!(state.sessions[review.id]||[]).some(r=>E.stats(review,r).finished===review.questions.length))return `Finish ${s.cardLabel} Round 2 before moving on.`;
  return '';
 }
 function day3Passed(state){for(const id of ids){const s=base(id);if(unfinished(s,state))return false;if(stats(s,state)?.first>=9)return true;}return false;}
 function lockReason(session,state){
  if(!session||!(session.weekly||session.round2))return '';
  const s=base(session.baseId||session.id),day=Number(s.id.split('-')[2]);
  for(let i=1;i<day;i++){
   if(i===3){if(!day3Passed(state))return 'Stay on Day 3: score at least 9/12 on Day 3, Day 3.2 or Day 3.3, then finish its second tries and Round 2 to unlock Day 4.';}
   else{const reason=unfinished(base('week-oct12-'+i),state);if(reason)return reason;}
  }
  if(s.retest){const previous=base(s.id.endsWith('-2')?ids[0]:ids[1]),reason=unfinished(previous,state);if(reason)return reason;}
  if(session.round2&&stats(s,state)?.finished!==s.questions.length)return `Finish ${s.cardLabel}, including every second try, to start Round 2.`;
  return '';
 }
 root.HarryWeekRules={lockReason,stats,day3Passed,unfinished};
})(window);
