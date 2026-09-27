(function(){
  'use strict';
  const number=(prompt,correct,explanation)=>({source:102,sourceLabel:'Think Academy Q2',skill:'Friendly-number multiplication',type:'number',prompt,correct,explanation});
  const rule=(inputs,outputs,choices,correct,explanation)=>({source:104,sourceLabel:'Think Academy Q4',skill:'Input-output rules',prompt:'Which expression can be used to find the output number from the input number a?',choices,correct,explanation,visual:{type:'table',headings:['Input (a)','Output'],rows:inputs.map((n,i)=>[n,outputs[i]])}});
  const compare=(prompt,choices,correct,explanation)=>({source:106,sourceLabel:'Think Academy Q6',skill:'Compare large quantities',prompt,choices,correct,explanation});
  const sets=[
    [
      number('Find friendly numbers to calculate: 25 × 104 = 25 × (100 + 4) = ____',2600,'Multiply both parts: 25 × 100 = 2,500 and 25 × 4 = 100. Add them: 2,500 + 100 = 2,600.'),
      rule([20,25,30,35],[4,5,6,7],['a ÷ 5','a × 5','a + 5','a − 16'],0,'Divide each input by 5: 20 ÷ 5 = 4, 25 ÷ 5 = 5, 30 ÷ 5 = 6, and 35 ÷ 5 = 7. Subtracting 16 only works for the first row; a rule must work for every row.'),
      compare('Green Energy Inc. earned profits of 40 thousand dollars in 2010. In 2020, their profit was eight million dollars. The profit in 2020 was how many times as great as it was in 2010?',['20','2','40','200'],3,'Write the amounts in the same units: 8,000,000 dollars and 40,000 dollars. Divide: 8,000,000 ÷ 40,000 = 800 ÷ 4 = 200 times.')
    ],
    [
      number('Use friendly numbers: 25 × 108 = 25 × (100 + 8) = ____',2700,'25 × 100 = 2,500 and 25 × 8 = 200. Add: 2,500 + 200 = 2,700.'),
      rule([24,30,36,42],[4,5,6,7],['a − 20','a × 6','a ÷ 6','a + 6'],2,'Every output is the input divided by 6. For example, 24 ÷ 6 = 4 and 42 ÷ 6 = 7. The same rule must fit all four rows.'),
      compare('A company earned 30 thousand dollars in one year and six million dollars in a later year. The later profit was how many times as great as the earlier profit?',['20','200','2','2,000'],1,'Six million is 6,000,000; 30 thousand is 30,000. 6,000,000 ÷ 30,000 = 600 ÷ 3 = 200 times.')
    ],
    [
      number('Use friendly numbers: 40 × 103 = 40 × (100 + 3) = ____',4120,'40 × 100 = 4,000 and 40 × 3 = 120. Add: 4,000 + 120 = 4,120.'),
      rule([28,35,42,49],[4,5,6,7],['a × 7','a ÷ 7','a − 24','a + 7'],1,'Divide every input by 7: 28 ÷ 7 = 4, 35 ÷ 7 = 5, 42 ÷ 7 = 6, and 49 ÷ 7 = 7.'),
      compare('A publisher printed 80 thousand books in its first year and twelve million books in a later year. The later number was how many times as great as the first-year number?',['15','1,500','150','8'],2,'Twelve million is 12,000,000; 80 thousand is 80,000. 12,000,000 ÷ 80,000 = 1,200 ÷ 8 = 150 times.')
    ],
    [
      number('Use friendly numbers: 50 × 106 = 50 × (100 + 6) = ____',5300,'50 × 100 = 5,000 and 50 × 6 = 300. Add: 5,000 + 300 = 5,300.'),
      rule([32,40,48,56],[4,5,6,7],['a + 8','a − 28','a × 8','a ÷ 8'],3,'Every output is the input divided by 8. Check all four rows, not just the first: 32 ÷ 8 = 4 through 56 ÷ 8 = 7.'),
      compare('A factory made 60 thousand parts in one year and fifteen million parts in a later year. The later number was how many times as great as the earlier number?',['250','25','2,500','60'],0,'Fifteen million is 15,000,000; 60 thousand is 60,000. 15,000,000 ÷ 60,000 = 1,500 ÷ 6 = 250 times.')
    ]
  ];
  ['sept27-original','sept27-a','sept27-b','sept27-c'].forEach((id,i)=>{
    const session=window.HARRY_SEPT_PRACTICE.find(s=>s.id===id);
    session.questions.push(...sets[i]);
    session.description=i===0?'13 original missed questions: 10 from the September 27 STAR Math test and 3 from the Think Academy report reviewed September 27. Your old selections are hidden.':'13 fresh questions matching the same 10 STAR Math and 3 Think Academy skills. Try independently on another day.';
  });
  window.HARRY_STAR_GROUPS.find(g=>g.id==='2026-09-27').description='STAR Math: 34 checked, 10 wrong. Think Academy: 3 wrong questions added. Four sessions of 13 questions: original retry + three fresh checks.';
})();
