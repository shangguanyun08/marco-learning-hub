(function(){
  'use strict';
  const division=(a,b)=>({source:3002,sourceLabel:'October 1 · Session 3 · Q2',skill:'Division with zeros',type:'number',prompt:`Calculate with the hidden zero method: ${a.toLocaleString('en-US')} ÷ ${b.toLocaleString('en-US')} = ____`,correct:a/b,explanation:`Divide both numbers by 100: ${a/100} ÷ ${b/100} = ${a/b}. Check: ${b.toLocaleString('en-US')} × ${a/b} = ${a.toLocaleString('en-US')}.`});
  const remainder=(a,b,choices,correct)=>({source:3005,sourceLabel:'October 1 · Session 3 · Q5',skill:'Division with a remainder',prompt:`Calculate: ${a} ÷ ${b} = ____`,choices,correct,explanation:`${b} × ${Math.floor(a/b)} = ${b*Math.floor(a/b)}. Subtract from ${a}: ${a%b} remains. The remainder must be smaller than ${b}. Answer: ${choices[correct]}.`});
  const split=(factor,number)=>({source:3009,sourceLabel:'October 1 · Session 3 · Q9',skill:'Friendly-number multiplication',type:'split-sum',prompt:`Use friendly numbers: ${factor} × ${number} = ${factor} × (100 + ${number-100})`,expansion:[factor,100,factor,number-100],parts:[factor*100,factor*(number-100),factor*number],correct:factor*number,explanation:'Multiply the two parts, then add them together. Fill all seven boxes to show your method.'});
  const sets=[
    [division(4200,600),remainder(746,70,['11 R 24','10 R 36','10 R 46','9 R 116'],2),split(40,108)],
    [division(9000,500),remainder(853,80,['10 R 53','11 R 27','10 R 43','9 R 133'],0),split(25,132)],
    [division(6400,800),remainder(967,90,['11 R 23','10 R 57','9 R 157','10 R 67'],3),split(50,114)],
    [division(7200,400),remainder(638,60,['11 R 22','10 R 38','10 R 28','9 R 98'],1),split(30,126)]
  ];
  ['oct4-original','oct4-a','oct4-b','oct4-c'].forEach((id,i)=>{
    const session=window.HARRY_SEPT_PRACTICE.find(s=>s.id===id);session.questions.push(...sets[i]);
    session.description=i?'16 fresh questions: 13 matching the October 4 STAR Math mistakes plus 3 matching October 1 Session 3 Q2, Q5 and Q9. First-try scoring; one retry.':'13 original wrong questions from the October 4 STAR Math test, plus October 1 Session 3 Q2, Q5 and Q9 as Questions 14–16. Prior answers are not shown and older session records remain unchanged.';
  });
  window.HARRY_STAR_GROUPS.find(g=>g.id==='2026-10-04').description='STAR Math: 34 checked, 21 correct choices and 13 wrong. Plus 3 requested reviews from October 1 Session 3. Four sessions of 16 questions: original retry + three fresh checks.';
})();
