(function(){
  'use strict';
  const reference=window.HARRY_SEPT_PRACTICE.find(s=>s.id==='oct4-c');
  const q=(source,prompt,choices,correct,explanation,visual)=>({source,skill:reference.questions.find(q=>q.source===source).skill,prompt,choices,correct,explanation,visual});
  const division=(a,b)=>({source:3002,sourceLabel:'October 1 review · Division with zeros',skill:'Division with zeros',type:'number',prompt:`Calculate with the hidden zero method: ${a.toLocaleString('en-US')} ÷ ${b.toLocaleString('en-US')} = ____`,correct:a/b,explanation:`Divide both numbers by 100: ${a/100} ÷ ${b/100} = ${a/b}. Check: ${a/b} × ${b.toLocaleString('en-US')} = ${a.toLocaleString('en-US')}.`});
  const units=amounts=>{
    const base=reference.questions.find(q=>q.source===7);
    const from=['feet','yards','yards','pounds','quarts','gallons'],singular=['foot','yard','yard','pound','quart','gallon'],factors=[12,3,36,16,2,4];
    return {source:7,sourceLabel:base.sourceLabel,skill:base.skill,type:'fill-blanks',prompt:base.prompt,explanation:amounts.every(amount=>amount===1)?'Length: 1 foot = 12 inches; 1 yard = 3 feet = 36 inches. Weight: 1 pound = 16 ounces. Volume: 1 quart = 2 pints; 1 gallon = 4 quarts.':base.explanation,
      blanks:base.blanks.map((blank,i)=>({...blank,label:`${amounts[i]} ${amounts[i]===1?singular[i]:from[i]} =`,answer:amounts[i]*factors[i]}))};
  };
  const remainder=(a,b,choices,correct)=>({...q(3005,`Calculate: ${a} ÷ ${b} = ____`,choices,correct,`${b} × ${Math.floor(a/b)} = ${b*Math.floor(a/b)}. Subtract from ${a}: ${a%b} remains. The remainder must be smaller than ${b}. Answer: ${choices[correct]}.`),sourceLabel:'October 1 review · Division with a remainder'});
  const split=(factor,number)=>({source:3009,sourceLabel:'October 1 review · Friendly-number multiplication',skill:'Friendly-number multiplication',type:'split-sum',prompt:`Use friendly numbers: ${factor} × ${number} = ${factor} × (100 + ${number-100})`,expansion:[factor,100,factor,number-100],parts:[factor*100,factor*(number-100),factor*number],correct:factor*number,explanation:'Multiply the two parts, then add them together. Fill all seven boxes to show your method.'});
  const tables=(xs,ys)=>({type:'choice-tables',xs,ys});
  const boxes=(sets,start,end)=>({type:'boxplots',sets,start,end,title:'Scores'});
  const weights=(labels,counts,title)=>({type:'weight-plot',labels,counts,title});
  const d=[
    division(8400,700),
    units([4,7,5,4,6,4]),
    q(17,'Write (6 × 10) + (4 × 1) + (7 × 1/10) + (1 × 1/100) + (5 × 1/1000) in standard form.',['64.751','640.715','64.715','64.175'],2,'60 + 4 + 0.7 + 0.01 + 0.005 = 64.715. Keep the tenths, hundredths, and thousandths in order.'),
    q(12,'Which ratio is equivalent to 24:40?',['5:3','3:5','3:10','6:5'],1,'Divide BOTH parts by 8: 24 ÷ 8 = 3 and 40 ÷ 8 = 5. The equivalent ratio is 3:5.'),
    q(32,'Which improper fraction is equal to 4 5/6?',['24/6','25/6','29/6','34/6'],2,'Four wholes make 4 × 6 = 24 sixths. Add 5 more sixths: 24 + 5 = 29. The fraction is 29/6.'),
    q(31,'A gardener uses 7/40 of a garden for beans and 9/40 for carrots. What fraction is used altogether? Give the simplest form.',['1/5','2/5','4/5','16/80'],1,'7/40 + 9/40 = 16/40. Divide the numerator and denominator by 8 to get 2/5.'),
    q(27,'A lighthouse is n times as tall as its 12-centimeter model. Which equation gives the lighthouse’s height y in centimeters?',['y = 12n','y = 12 + n','y = 12 ÷ n','y = n − 12'],0,'Multiply the model’s height by n: y = 12 × n = 12n.'),
    remainder(785,60,['12 R 65','13 R 15','13 R 5','14 R 5'],2),
    split(25,124),
    q(23,'4.68 ÷ 0.6 = ____',['78','0.78','4.08','7.8'],3,'Multiply BOTH numbers by 10: 46.8 ÷ 6 = 7.8. Check: 7.8 × 0.6 = 4.68.'),
    q(15,'Nora is saving $282 for a bicycle. She earns $12 per hour. How many hours must she work to earn $282?',['22.5 hours','23.5 hours','24.5 hours','28.2 hours'],1,'282 ÷ 12 = 23.5 hours. Check: 23 × 12 = 276, and half an hour earns another $6. Together that is $282.'),
    q(6,'The number of green tickets, g, is 6 less than 5 times the number of red tickets, r. Which equation represents this relationship?',['g = 6 − 5r','r = 5g − 6','g = 5r + 6','g = 5r − 6'],3,'Five times the number of red tickets is 5r. Six less means subtract 6, so g = 5r − 6.'),
    q(8,'Which table was created using the equation y = 3x − 2?',['Table A','Table B','Table C','Table D'],1,'Multiply each input by 3, then subtract 2. Inputs 2, 3, 4, 5 give outputs 4, 7, 10, 13. Every row must match.',tables([2,3,4,5],[[8,11,14,17],[4,7,10,13],[0,1,2,3],[4,6,8,10]])),
    q(34,'The line plot shows the weights of some small pumpkins. What is the total weight of the two heaviest pumpkins?',['4 3/4 pounds','5 pounds','5 1/4 pounds','5 1/2 pounds'],2,'The two heaviest pumpkins weigh 2 3/4 and 2 2/4 pounds. Their sum is 4 5/4, which is 5 1/4 pounds.',weights(['1 1/4','1 2/4','1 3/4','2','2 1/4','2 2/4','2 3/4'],[1,2,1,3,2,1,1],'Weight of Pumpkins (pounds)')),
    q(25,'Seven students scored 34, 20, 44, 28, 40, 24, 36 points. Which box plot represents their scores?',['Box plot A','Box plot B','Box plot C','Box plot D'],3,'Order the scores: 20, 24, 28, 34, 36, 40, 44. The median is 34. Excluding the median, the lower-half middle is 24 and the upper-half middle is 40. The five-number summary is 20, 24, 34, 40, 44.',boxes([[20,28,34,36,44],[20,24,36,40,44],[15,24,34,40,45],[20,24,34,40,44]],10,50))
  ];
  const e=[
    division(9600,600),
    units([1,1,1,1,1,1]),
    q(17,'Write (9 × 10) + (1 × 1) + (6 × 1/10) + (3 × 1/100) + (8 × 1/1000) in standard form.',['91.638','91.683','910.638','91.368'],0,'90 + 1 + 0.6 + 0.03 + 0.008 = 91.638. The 6 is in the tenths place, 3 in hundredths, and 8 in thousandths.'),
    q(12,'Which ratio is equivalent to 45:60?',['12:9','9:15','15:12','9:12'],3,'Divide both parts by 5: 45 ÷ 5 = 9 and 60 ÷ 5 = 12. Keep the same order: 9:12.'),
    q(32,'Which improper fraction is equal to 7 4/5?',['35/5','39/5','28/5','42/5'],1,'Seven wholes make 7 × 5 = 35 fifths. Add 4 fifths to get 39/5.'),
    q(31,'A farmer uses 5/28 of a field for peas and 7/28 for corn. What fraction is used altogether? Give the simplest form.',['1/7','6/7','3/7','12/56'],2,'5/28 + 7/28 = 12/28. Divide the numerator and denominator by 4 to get 3/7.'),
    q(27,'A bridge is n times as long as its 11-centimeter model. Which equation gives the bridge’s length y in centimeters?',['y = 11 + n','y = 11 ÷ n','y = 11n','y = n − 11'],2,'“n times as long” means multiply the model’s length by n. Therefore y = 11n.'),
    remainder(926,80,['11 R 46','12 R 34','11 R 36','10 R 126'],0),
    split(40,116),
    q(23,'5.76 ÷ 0.8 = ____',['0.72','7.2','72','4.96'],1,'Multiply both numbers by 10: 57.6 ÷ 8 = 7.2. Check: 7.2 × 0.8 = 5.76.'),
    q(15,'Eli wants a keyboard that costs $294. He earns $12 per hour. How many hours must he work to earn $294?',['23.5 hours','29.4 hours','24.5 hours','25.5 hours'],2,'294 ÷ 12 = 24.5 hours. Check: 24 × 12 = 288, and half an hour earns $6 more. The total is $294.'),
    q(6,'The number of silver beads, s, is 4 less than 7 times the number of gold beads, g. Which equation gives the number of silver beads?',['s = 4 − 7g','s = 7g − 4','g = 7s − 4','s = 7g + 4'],1,'Seven times the number of gold beads is 7g. Four less means subtract 4: s = 7g − 4.'),
    q(8,'Which table row matches the equation y = 5x + 1?',['Table A','Table B','Table C','Table D'],3,'When x = 4, y = 5 × 4 + 1 = 21. Choose the row with input 4 and output 21.',tables([4],[[20],[19],[14],[21]])),
    q(34,'The line plot shows the weights of some bags of rice. What is the total weight of the two heaviest bags?',['3 1/8 pounds','2 7/8 pounds','3 3/8 pounds','3 pounds'],0,'The two heaviest bags weigh 1 5/8 and 1 4/8 pounds. Their sum is 2 9/8, which is 3 1/8 pounds.',weights(['7/8','1','1 1/8','1 2/8','1 3/8','1 4/8','1 5/8'],[1,2,1,2,1,1,1],'Weight of Rice Bags (pounds)')),
    q(25,'Seven students scored 64, 54, 72, 48, 68, 52, 60 points. Which box plot represents their scores?',['Box plot A','Box plot B','Box plot C','Box plot D'],0,'Order the scores: 48, 52, 54, 60, 64, 68, 72. The median is 60. Excluding the median, the lower-half middle is 52 and the upper-half middle is 68. The five-number summary is 48, 52, 60, 68, 72.',boxes([[48,52,60,68,72],[48,54,60,64,72],[48,52,64,68,72],[45,52,60,68,75]],40,80))
  ];
  [d,e].forEach((questions,i)=>window.HARRY_SEPT_PRACTICE.push({id:'oct4-'+['d','e'][i],group:'2026-10-04',original:false,title:`Session ${i+5} · October 4 fresh check ${['D','E'][i]}`,description:'15 fresh questions matching the same skills as the earlier October 4 sessions. Question 2 has six fill-in blanks covering length, weight and volume. Work independently; your first try earns the point, with one retry.',questions}));
})();
