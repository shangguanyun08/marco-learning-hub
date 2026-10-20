(function(root){
  'use strict';
  const C=root.MarcoSkillCourse,bank=C.checkpointQuestions;
  // Fixed selection: these 17 skills were 4/4 on the latest four fresh first attempts.
  const skills=[
    ['mixture','Parts in a ratio','rates',1],
    ['setup','Translate a word problem into an equation','algebra',10],
    ['grouping','Absolute-value grouping','absolute',11],
    ['system','Solve equations by substitution','algebra',12],
    ['signed','Negative signs and order of operations','absolute',13],
    ['meanmedian','Mean and median','other',16],
    ['probabilitycount','Probability by counting outcomes','other',17],
    ['patterns','Growing shape patterns','other',18],
    ['coefficient','Interpret a formula’s coefficient','graphs',21],
    ['slope','Slope and rise/run','graphs',22],
    ['areaformula','Rearrange an area formula','algebra',28],
    ['squarecircle','Square area minus circle area','other',29],
    ['cubeblocks','Complete a cube with missing blocks','other',31],
    ['percentnumber','Percent of a number','percent',5],
    ['unitprice','Unit rate versus total amount','rates',7],
    ['remaining','Time for remaining work','rates',8],
    ['compound','Successive percentage changes','percent','compound']
  ];
  const fmt=n=>String(Number(n.toFixed(6))),positions=[2,0,3,1,1,3,0,2,3,1,2,0,2,0,1,3,1];
  const names=Object.fromEntries(skills.map(([id,label,skill,sourceTopic])=>[id,{id,label,skill,sourceTopic}]));
  C.recheckSkills=skills.map(([id])=>({...names[id],baseline:{first:4,answered:4}}));
  C.recheckSource={date:'2026-10-20',basis:'Latest 4 similar questions, first attempts only; all 4 correct',skills:C.recheckSkills.map(s=>s.sourceTopic)};
  function build(number){
    const v=number-8,questions=[];
    function add(concept,prompt,answer,wrong,explanation,audit,extra={}){
      questions.push({concept,skill:names[concept].skill,label:names[concept].label,prompt,answer:String(answer),wrong:wrong.map(String),tip:explanation,explanation,audit,difficulty:'Mixed skill recheck',...extra});
    }
    const ratios=[{a:5,b:7,total:84,target:'a',prompt:'Red and white beads are in the ratio 5:7. There are 84 beads altogether. How many are red?',wrong:[49,12,60]},
      {a:4,b:9,partB:63,target:'a',prompt:'The ratio of students in art to students in music is 4:9. There are 63 students in music. How many are in art?',wrong:[7,36,91]},
      {a:7,b:5,total:96,target:'b',prompt:'Nuts and raisins are mixed in the ratio 7:5 by weight. A bag weighs 96 grams. How many grams are raisins?',wrong:[56,12,68]}][v];
    const part=ratios.total?ratios.total/(ratios.a+ratios.b):ratios.partB/ratios.b,ratioAnswer=part*ratios[ratios.target];
    add('mixture',ratios.prompt,ratioAnswer,ratios.wrong,`One ratio part is ${part}. The requested amount is ${ratios[ratios.target]} × ${part} = ${ratioAnswer}.`,{kind:'ratio',...ratios});
    const setups=[
      ['Noah has n stickers. Lena has 11 fewer stickers than 3 times Noah’s number. Together they have 65 stickers. Which equation represents this?', 'n + (3n − 11) = 65',['3n − 11 = 65','n + (3n + 11) = 65','3(n − 11) = 65'],'Lena has 3n − 11 stickers. Add Noah’s n stickers to get the combined total of 65.'],
      ['A taxi charges a $7 starting fee plus $4 per kilometer. A trip costs $55. If k is the number of kilometers, which equation represents the trip?', '7 + 4k = 55',['7k + 4 = 55','4(k + 7) = 55','7 + k = 55'],'The starting fee is paid once. The distance charge is 4k. Add them: 7 + 4k = 55.'],
      ['There are 5 boxes with p pens in each box and 6 extra pens outside the boxes. There are 71 pens in all. Which equation represents this?', '5p + 6 = 71',['5(p + 6) = 71','6p + 5 = 71','5p − 6 = 71'],'Five boxes contain 5p pens. Add the 6 extra pens: 5p + 6 = 71.']
    ][v];
    add('setup',...setups,{kind:'setup',variant:v});
    const groups=[['Evaluate 3|−8 + 3| − |−4|.',11,[-19,29,19],'Inside the first bars: −8 + 3 = −5, so its absolute value is 5. Then 3 × 5 − 4 = 11.'],
      ['Evaluate |−14| − |5 − 12|.',7,[-21,21,-7],'The two absolute values are 14 and 7. Subtract: 14 − 7 = 7.'],
      ['Evaluate 2|−9 + 4| + |−3 − 2|.',15,[-15,31,5],'The two absolute values are 5 and 5. Then 2 × 5 + 5 = 15.']][v];
    add('grouping',...groups,{kind:'grouping-recheck',variant:v});
    const systems=[{a:2,b:3,c:1,total:24,ask:'x'},{a:3,b:-5,c:1,total:35,ask:'y'},{a:4,b:2,c:2,total:50,ask:'y'}][v];
    const x=(systems.total-systems.b)/(systems.a+systems.c),y=systems.a*x+systems.b,answer=systems.ask==='x'?x:y;
    add('system',`If y = ${systems.a}x ${systems.b<0?'−':'+'} ${Math.abs(systems.b)} and ${systems.c===1?'x':systems.c+'x'} + y = ${systems.total}, what is ${systems.ask}?`,answer,[answer+systems.a,answer-systems.a,systems.ask==='x'?y:x],`Substitute for y: ${systems.c}x + ${systems.a}x ${systems.b<0?'−':'+'} ${Math.abs(systems.b)} = ${systems.total}. This gives x = ${x} and y = ${y}, so ${systems.ask} = ${answer}.`,{kind:'system-recheck',...systems});
    const signs=[['Evaluate −6² + 4 × (−3).',-48,[24,-24,48],'The exponent comes first: −6² means −36. Also 4 × (−3) = −12. Add: −36 − 12 = −48.'],
      ['Evaluate (−4)² − 3 × (−5).',31,[1,-31,-1],'The parentheses make (−4)² = 16. Then 3 × (−5) = −15, so 16 − (−15) = 31.'],
      ['Evaluate −3 × [8 − (−4)] ÷ 2.',-18,[18,-6,6],'Inside the brackets: 8 − (−4) = 12. Multiply and divide from left to right: −3 × 12 ÷ 2 = −18.']][v];
    add('signed',...signs,{kind:'signed-recheck',variant:v});
    const stats=[['What is the median of 11, 4, 9, 6, 15, and 3?',7.5,[8,6,9],'Order the numbers: 3, 4, 6, 9, 11, 15. Average the middle two: (6 + 9) ÷ 2 = 7.5.'],
      ['The mean of five numbers is 14. Four of the numbers are 8, 12, 15, and 19. What is the fifth number?',16,[14,54,70],'The total is 5 × 14 = 70. The four known numbers total 54. The missing number is 70 − 54 = 16.'],
      ['For the numbers 3, 7, 8, 12, and 25, what is the mean minus the median?',3,[11,8,4],'The mean is 55 ÷ 5 = 11. The middle number is 8, so mean − median = 11 − 8 = 3.']][v];
    add('meanmedian',...stats,{kind:'meanmedian',variant:v});
    const probabilities=[['One card is chosen at random from cards numbered 1 through 18. What is the probability that its number is a multiple of 4?','2/9',['1/4','1/3','4/9'],'The favorable cards are 4, 8, 12, and 16: 4 out of 18, or 2/9.'],
      ['A bag has 6 blue counters, 5 red counters, and 4 yellow counters. One counter is chosen at random. What is the probability that it is NOT red?','2/3',['1/3','2/5','4/15'],'There are 15 counters in total and 10 non-red counters. The probability is 10/15 = 2/3.'],
      ['One card is chosen at random from cards numbered 1 through 24. What is the probability that its number is divisible by 4 OR by 6?','1/3',['5/12','1/4','1/6'],'The favorable numbers are 4, 6, 8, 12, 16, 18, 20, and 24. Count 12 and 24 once each. The probability is 8/24 = 1/3.']][v];
    add('probabilitycount',...probabilities,{kind:'probabilitycount',variant:v});
    const pattern=[{firstRow:1,figure:9},{firstRow:2,figure:7},{firstRow:3,figure:8}][v],rows=Array.from({length:pattern.figure},(_,i)=>pattern.firstRow+i),tiles=rows.reduce((a,b)=>a+b,0);
    add('patterns',`The first four shapes are shown. Each new shape adds a bottom row containing one more square than the row above it. How many small squares are in Shape ${pattern.figure}?`,tiles,[tiles-rows.at(-1),tiles+rows.at(-1)+1,pattern.figure*rows.at(-1)],`Shape ${pattern.figure} has ${pattern.figure} rows, containing ${rows.join(' + ')} squares. Add the rows to get ${tiles}.`,{kind:'patterns',...pattern},{diagram:{type:'growingStacks',stages:[1,2,3,4].map(n=>Array.from({length:n},(_,i)=>pattern.firstRow+i))}});
    const coefficients=[['The cost C, in dollars, to rent a bicycle for h hours is C = 8 + 6h. What does the coefficient 6 represent?','The cost increases by $6 for each rental hour.',['The starting fee is $6.','The rental lasts 6 hours.','The total cost is always $6.'],'The variable h counts hours. Its coefficient gives dollars per hour: $6. The starting fee is $8.'],
      ['A player’s token balance after m rounds is T = 25 − 3m. What does the coefficient −3 represent?','The token balance decreases by 3 for each round.',['The player starts with −3 tokens.','The player can play only 3 rounds.','The token balance increases by 3 for each round.'],'Increasing m by 1 changes T by −3. The player uses 3 tokens each round; 25 is the initial balance.'],
      ['The water volume V, in liters, after t minutes is V = 120 + 9t. What does the coefficient 9 represent?','The volume increases by 9 liters each minute.',['The starting volume is 9 liters.','The tank fills in 9 minutes.','The volume increases by 120 liters each minute.'],'The coefficient of t is the change per minute: 9 liters. The constant 120 is the starting volume.']][v];
    add('coefficient',...coefficients,{kind:'coefficient',variant:v});
    const points=[[[2,17],[6,11],[10,5]],[[1,4],[5,14]], [[-4,5],[2,7],[8,9]]][v];
    const slopeAnswers=['-3/2','5/2','1/3'],slopeWrong=[['3/2','-2/3','-6'],['2/5','10','4'],['3','2','-1/3']],slope=(points[1][1]-points[0][1])/(points[1][0]-points[0][0]);
    add('slope',v===1?'What is the slope of the line shown? Use the labelled coordinates.':'The table gives points on a straight line. What is its slope?',slopeAnswers[v],slopeWrong[v],`Slope = change in y ÷ change in x = (${points[1][1]} − ${points[0][1]}) ÷ (${points[1][0]} − ${points[0][0]}) = ${slopeAnswers[v]}.`,{kind:'slope-recheck',points},v===1?{graph:{lines:[{m:slope,b:points[0][1]-slope*points[0][0],color:'#2468e5'}],xmin:0,xmax:8,ymin:0,ymax:22,points}}:{table:{headers:['x','y'],rows:points}});
    const areas=[['A triangle has area 78 cm² and base 13 cm. Using A = bh/2, what is its height in centimeters?',12,[6,13,24],'Rearrange to h = 2A/b. Then h = 2 × 78 ÷ 13 = 12 cm.'],
      ['A trapezoid has area 108 cm² and parallel bases 9 cm and 15 cm. Using A = (a + b)h/2, what is its height in centimeters?',9,[4.5,12,18],'Rearrange to h = 2A/(a + b). Then h = 216 ÷ 24 = 9 cm.'],
      ['A rectangle has area 154 cm² and width 11 cm. Using A = lw, what is its length in centimeters?',14,[11,143,28],'Divide both sides by w: l = A/w = 154 ÷ 11 = 14 cm.']][v];
    add('areaformula',...areas,{kind:'areaformula',variant:v});
    const circle=[{side:22,radius:11},{side:26,radius:13},{side:30,radius:15}][v],square=circle.side**2,round=circle.radius**2;
    add('squarecircle',`A circle fits exactly inside a square with side length ${circle.side} cm. Which expression gives the shaded area inside the square but outside the circle, in cm²? Use circle area = πr².`,`${square} − ${round}π`,[`${square} − ${4*round}π`,`${circle.side} − ${circle.radius}π`,`${square} − ${2*circle.radius}π`],`The circle’s diameter equals the side of the square, so its radius is ${circle.side} ÷ 2 = ${circle.radius}. Square area = ${circle.side}² = ${square}; circle area = ${round}π. Subtract: ${square} − ${round}π.`,{kind:'squarecircle',...circle},{diagram:{type:'squareCircle',...circle}});
    const cubes=[{edge:7,width:3},{edge:8,width:5},{edge:9,width:7}][v],missing=cubes.edge-cubes.width,block=n=>`${n} × ${cubes.edge} × ${cubes.edge} block`;
    add('cubeblocks',`The block shown is made of equal unit cubes and measures ${cubes.width} × ${cubes.edge} × ${cubes.edge}. Which block can be attached to make a solid ${cubes.edge} × ${cubes.edge} × ${cubes.edge} cube?`,block(missing),[block(1),`${missing} × ${cubes.edge-1} × ${cubes.edge} block`,block(cubes.edge)],`Two dimensions already equal ${cubes.edge}. The shorter dimension needs ${cubes.edge} − ${cubes.width} = ${missing} more layers. Attach a ${missing} × ${cubes.edge} × ${cubes.edge} block.`,{kind:'cubeblocks',...cubes},{diagram:{type:'cuboid',dims:[cubes.width,cubes.edge,cubes.edge]}});
    const percents=[{p:35,n:240},{p:12.5,n:320},{p:65,n:180}][v],amount=percents.p*percents.n/100;
    add('percentnumber',`What is ${percents.p}% of ${percents.n}?`,amount,[percents.p,percents.n-amount,amount/10],`Convert the percent to a decimal and multiply: ${percents.p/100} × ${percents.n} = ${fmt(amount)}.`,{kind:'percentnumber',...percents});
    const rates=[['Store A sells 8 identical notebooks for $28. Store B sells 6 of the same notebooks for $24. Which store has the lower price per notebook?','Store A',['Store B','The unit prices are equal.','The comparison cannot be determined.'],'Store A: 28 ÷ 8 = $3.50 each. Store B: 24 ÷ 6 = $4 each. Store A has the lower unit price.'],
      ['Printer A prints 126 pages in 6 minutes. Printer B prints 154 pages in 7 minutes. At these constant rates, how many MORE pages does B print than A in 5 minutes?',5,[28,1,25],'A prints 21 pages/minute; B prints 22 pages/minute. Over 5 minutes the difference is (22 − 21) × 5 = 5 pages.'],
      ['Rental A charges $54 for 3 hours. Rental B charges $88 for 4 hours. Each charges a constant hourly rate with no extra fee. How many dollars less does A charge than B for a 3-hour rental?',12,[34,4,22],'A costs $18/hour; B costs $22/hour. For 3 hours, A costs (22 − 18) × 3 = $12 less.']][v];
    add('unitprice',...rates,{kind:'unitprice-recheck',variant:v});
    const work=[{num:5,den:8,used:45},{num:7,den:12,used:56},{num:4,den:9,used:36}][v],left=work.used*(work.den-work.num)/work.num;
    add('remaining',`At a constant rate, a worker completes ${work.num}/${work.den} of a job in ${work.used} minutes. How many MORE minutes are needed to finish the job?`,left,[work.used/work.num,work.used*work.den/work.num,fmt(work.used*(work.den-work.num)/work.den)],`Each equal part takes ${work.used} ÷ ${work.num} = ${work.used/work.num} minutes. There are ${work.den-work.num} parts left, so the remaining time is ${left} minutes.`,{kind:'remaining-recheck',...work});
    const changes=[{start:250,a:1.2,b:.9,first:'increases by 20%',second:'decreases by 10%',wrong:[275,300,225]},
      {start:640,a:.75,b:1.1,first:'decreases by 25%',second:'increases by 10%',wrong:[544,480,576]},
      {start:360,a:1.15,b:.8,first:'increases by 15%',second:'decreases by 20%',wrong:[342,414,288]}][v],final=changes.start*changes.a*changes.b;
    add('compound',`A price starts at $${changes.start}, ${changes.first}, and then ${changes.second}. What is the final price in dollars?`,fmt(final),changes.wrong,`Apply each change to the current price: ${changes.start} × ${changes.a} × ${changes.b} = ${fmt(final)}.`,{kind:'compound-recheck',...changes});
    // Different mixed order in each set; never reveal a skill block or its method before answering.
    const orders=[[0,9,4,13,6,3,15,10,1,11,5,16,7,14,2,12,8],[6,2,10,14,8,0,16,5,11,3,13,7,15,1,12,9,4],[11,15,1,5,12,8,3,7,14,4,9,0,10,16,2,6,13]];
    return orders[v].map((index,i)=>{
      const q=questions[index],id=`rc${number}-${String(i+1).padStart(2,'0')}`,correct=positions[(i+v*5)%17],choices=[...q.wrong];choices.splice(correct,0,q.answer);
      const out={...q,id,correct,choices};delete out.answer;delete out.wrong;
      if(choices.length!==4||new Set(choices).size!==4)throw Error('Invalid choices: '+id);
      bank[id]=out;return id;
    });
  }
  // Retain all previous set definitions and questions for saved and offline progress.
  C.legacySets.push(...C.sets.filter(s=>s.number>=8).map(s=>({...s})));
  C.sets.splice(7,3,...[8,9,10].map((number,i)=>({number,id:`set-${number}-recheck-17-v4`,label:`17-skill recheck ${'ABC'[i]}`,description:'17 fresh mixed questions: 1 for each skill that was correct on all 4 of its latest first attempts. Goal: 16/17 correct on the first try (at least 90%). Complete these sets on separate days to check retention.',day:`Set ${number}`,check:true,checkpoint:true,noRound2:true,contentVersion:'recheck-17-v4',targetCorrect:16,questionIds:build(number)})));
})(typeof window==='undefined'?globalThis:window);
