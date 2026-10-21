(function(root){
 'use strict';
 const id='week-oct12-extra-review',group='week-2026-10-12';
 const skills=[{id:'mixed-number-line',label:'Mixed numbers on number lines'},{id:'improper-sums',label:'Possible sums of improper fractions'}];
 const questions=[],add=(source,skill,prompt,choices,correct,explanation,extra={})=>questions.push({source,sourceLabel:'Extra fraction review',skill:skills[skill].label,skillId:skills[skill].id,prompt,choices,correct,explanation,retryUntilCorrect:true,...extra});
 const lines=[
  {whole:1,parts:4,point:3,choices:['1 3/5','1 3/4','1 2/4','1 4/5'],correct:1},
  {whole:3,parts:3,point:2,choices:['3 3/4','3 2/4','3 1/3','3 2/3'],correct:3},
  {whole:4,parts:6,point:5,choices:['4 5/6','4 6/7','4 5/7','4 1/6'],correct:0},
  {whole:6,parts:5,point:3,choices:['6 4/6','6 3/6','6 3/5','6 2/5'],correct:2}
 ];
 lines.forEach((v,i)=>add(i+1,0,['What mixed number is at point P?','Which mixed number names the location of P?','Read the number line. What mixed number does P represent?','Choose the mixed number at P.'][i],v.choices,v.correct,`Between ${v.whole} and ${v.whole+1}, count ${v.parts} equal intervals, not the ${v.parts+1} tick marks. P is ${v.point} intervals after ${v.whole}, so P is ${v.whole} ${v.point}/${v.parts}.`,{visual:{type:'week-mixed-numberline',whole:v.whole,parts:v.parts,point:v.point},hint:'Find the two whole-number labels. Count the equal intervals between them for the denominator, then the intervals from the left whole number to P for the numerator.'}));
 const bound='Each positive improper fraction is at least 1, so three of them have a sum of at least 3. Every other choice is below 3.';
 add(5,1,'Three positive improper fractions are added. Which total is possible?',['2 7/8','3 1/2','1 3/4','2 1/4'],1,`${bound} For example, 7/6 + 7/6 + 7/6 = 21/6 = 3 1/2.`);
 add(6,1,'A student adds three positive improper fractions. Which of these could be the sum?',['2 5/6','2 11/12','1 7/8','4 1/4'],3,`${bound} For example, 3/2 + 3/2 + 5/4 = 17/4 = 4 1/4.`);
 add(7,1,'Each of three fractions has a positive numerator at least as large as its positive denominator. Which value could their total equal?',['3 2/5','2 4/5','2 1/3','1 9/10'],0,`${bound} For example, 17/15 + 17/15 + 17/15 = 51/15 = 3 2/5.`);
 add(8,1,'Choose a possible sum of three positive improper fractions.',['2 3/4','2 9/10','5 1/6','1 11/12'],2,`${bound} For example, 3/2 + 5/3 + 2/1 = 31/6 = 5 1/6.`);
 questions.filter(q=>q.skillId==='improper-sums').forEach(q=>q.hint='Compare each improper fraction with 1. What is the smallest possible total for three of them?');
 const session={id,group,weekly:true,retest:true,targeted:true,practiceOnly:true,extraReview:true,cardLabel:'Extra review',title:'Extra review - Two fraction skills',description:'8 fresh questions: 4 mixed-number number lines and 4 possible sums of improper fractions. Here, an improper fraction has a numerator at least as large as its positive denominator. Aim for 3/4 correct on your first try in each skill. Keep trying until correct; retries never change your first-try counts.',questions};
 const bank=root.HARRY_SEPT_PRACTICE,last=bank.findLastIndex(s=>s.group===group);
 bank.splice(last+1,0,session);
 const metadata=root.HARRY_STAR_GROUPS.find(g=>g.id===group);
 metadata.description+=' Extra review follows Day 6: 4 questions per fraction skill, with separate first-try counts and a 3/4 goal in each.';
 function stats(session,run){return skills.map(skill=>({...skill,...root.HarrySeptEngine.stats({questions:session.questions.filter(q=>q.skillId===skill.id)},run)}));}
 const text=(session,run)=>stats(session,run).map(s=>`${s.label}: ${s.first}/4 first try (${s.attempted}/4 answered)`).join(' | ');
 const html=(session,run)=>stats(session,run).map(s=>`<div class="skill-score"><h3>${s.label}</h3><strong>${s.first}/4 <span>first-try correct</span></strong><p>${s.attempted}/4 answered; ${s.finished}/4 completed.</p><p>${s.attempted<4?'Goal: 3/4 on first tries.':s.first>=3?'First-try goal reached.':'Keep practicing this skill. The first-try goal is 3/4.'}</p></div>`).join('');
 root.HarryWeekExtraReview={id,stats,text,html};
 const previous=root.HarryStarVisuals.draw;
 root.HarryStarVisuals.draw=function(v,index){
  if(v?.type!=='week-mixed-numberline')return previous(v,index);
  if(index!==undefined)return '';
  const x=i=>50+480*i/v.parts;
  return `<svg class="question-diagram mixed-numberline" viewBox="0 0 580 150" role="img" aria-label="Number line from ${v.whole} to ${v.whole+1} with ${v.parts} equal intervals. P is ${v.point} intervals after ${v.whole}." xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="70" x2="530" y2="70" stroke="#193c49" stroke-width="3"/>${Array.from({length:v.parts+1},(_,i)=>`<line x1="${x(i)}" x2="${x(i)}" y1="${i===0||i===v.parts?54:59}" y2="${i===0||i===v.parts?86:81}" stroke="#193c49" stroke-width="3"/>`).join('')}<circle cx="${x(v.point)}" cy="70" r="7" fill="#193c49"/><text x="${x(v.point)}" y="37" font-size="28" font-weight="700" text-anchor="middle" fill="#193c49">P</text><text x="50" y="125" font-size="27" text-anchor="middle" fill="#193c49">${v.whole}</text><text x="530" y="125" font-size="27" text-anchor="middle" fill="#193c49">${v.whole+1}</text></svg>`;
 };
})(window);
