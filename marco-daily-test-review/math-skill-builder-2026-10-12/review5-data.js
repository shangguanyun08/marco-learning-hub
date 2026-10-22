(function(root){
  'use strict';
  const topics=[
    {id:'graphs',name:'Graphs & data',subtopics:[['intercept','Y-intercept']]},
    {id:'absolute',name:'Absolute value & signs',subtopics:[['absequation','Both absolute-value solutions']]},
    {id:'rates',name:'Rates & proportions',subtopics:[['proportions','Equivalent proportions'],['units','Converting speed units']]},
    {id:'probability',name:'Probability',subtopics:[['independent','Independent-event probability']]}
  ];
  // Fixed selection from completed Review 4 first answers, reverified read-only.
  // Later corrections cannot change eligibility or replace these questions.
  const source={session:'review4-v1',appId:'marco-math-skill-builder-oct12-review4-v1',recordVersion:39,updatedAt:'2026-10-22T03:49:32.071Z',threshold:100,
    scores:{intercept:{first:3,answered:4},absequation:{first:3,answered:4},proportions:{first:3,answered:4},units:{first:2,answered:4},independent:{first:3,answered:4}},
    excluded:{dimension:{first:4,answered:4},transformations:{first:4,answered:4}}};
  const questions={},fmt=n=>String(Number(n.toFixed(6))),fixed=['Column A is greater.','Column B is greater.','The quantities are equal.','The relationship cannot be determined.'];
  function add(concept,prompt,answer,wrong,explanation,extra={}){
    const count=Object.values(questions).filter(q=>q.concept===concept).length,index=Object.keys(questions).length;
    const id=`review5-${concept}-${count+1}`,correct=[1,3,0,2,2,0,3,1][index%8],choices=wrong.map(String);
    choices.splice(correct,0,String(answer));
    if(choices.length!==4||new Set(choices).size!==4)throw Error('Invalid choices: '+id);
    questions[id]={id,concept,prompt,choices,correct,explanation,...extra};return questions[id];
  }
  [[3,-8,4,7],[-1.25,9,4,8],[2.5,-7,2,4],[-3,20,2,5]].forEach(([m,b,x,z],i)=>{
    const rows=[x,z,z+(z-x)].map(v=>[v,m*v+b]);
    const visual=i<2?{table:{headers:['x','y'],rows}}:{graph:{lines:[{m,b,color:'#146a76'}],xmin:x-1,xmax:z+2,ymin:Math.min(...rows.slice(0,2).map(r=>r[1]))-4,ymax:Math.max(...rows.slice(0,2).map(r=>r[1]))+4,points:rows.slice(0,2),cropped:true}};
    add('intercept',i<2?'The table lists points on a straight line. What is its y-intercept?':'Only part of a straight line is shown. What is its y-intercept?',b,[m,rows[0][1],rows[1][1]],`Slope = (${rows[1][1]} - ${rows[0][1]}) ÷ (${z} - ${x}) = ${m}. The y-intercept is y when x = 0: b = y - mx = ${rows[0][1]} - (${m}) × ${x} = ${b}. The first visible y-value is not necessarily the y-intercept.`,{...visual,audit:{kind:'intercept',m,b,x,y:m*x+b}});
  });
  add('absequation','The two solutions of |x + 6| = 17 are added. What is their sum?',-12,[12,34,11],'Solve both cases: x + 6 = 17 gives x = 11; x + 6 = -17 gives x = -23. Their sum is 11 + (-23) = -12.',{audit:{kind:'abs-sum',c:-6,k:17}});
  add('absequation','The two solutions of |x - 9| = 22 are added. What is their sum?',18,[-18,44,31],'x - 9 = 22 or -22, so x = 31 or -13. Their sum is 31 + (-13) = 18.',{audit:{kind:'abs-sum',c:9,k:22}});
  add('absequation','Which pair gives ALL solutions of |4x + 12| = 28?','x = 4 or x = -10',['x = 4 or x = 10','x = 10 or x = -4','x = 4 or x = -4'],'Solve 4x + 12 = 28 and 4x + 12 = -28. Subtract 12 in both equations, then divide by 4: x = 4 or x = -10.',{audit:{kind:'abs-pair',coefficient:4,offset:12,k:28}});
  add('absequation','Which pair gives ALL solutions of |3x - 15| = 24?','x = 13 or x = -3',['x = 13 or x = 3','x = 3 or x = -13','x = 13 or x = -13'],'Solve 3x - 15 = 24 and 3x - 15 = -24. Add 15 in both equations, then divide by 3: x = 13 or x = -3.',{audit:{kind:'abs-pair',coefficient:3,offset:-15,k:24}});
  add('proportions','If a/26 = b/10, which equation must be true?','5a = 13b',['13a = 5b','ab = 260','a + b = 36'],'Cross-multiply: 10a = 26b. Divide both sides by 2: 5a = 13b.',{audit:{kind:'proportion-equation',leftDen:26,rightDen:10}});
  add('proportions','If 14/m = 22/n, where m and n are positive, which equation must be true?','7n = 11m',['7m = 11n','mn = 308','m + n = 36'],'The diagonal products are 14 × n and 22 × m. Thus 14n = 22m. Divide by 2: 7n = 11m.',{audit:{kind:'proportion-denominators',leftNum:14,rightNum:22}});
  add('proportions','If 15/p = 24/q, where p and q are positive, which equation must be true?','5q = 8p',['5p = 8q','pq = 360','p + q = 39'],'Cross-multiply: 15q = 24p. Divide both sides by 3: 5q = 8p. Keep each diagonal pair together.',{audit:{kind:'proportion-denominators',leftNum:15,rightNum:24}});
  add('proportions','If 9/r = 24/s and r = 6, what is s?',16,[2.25,21,32],'Cross-multiply: 9s = 24r. With r = 6, 9s = 144, so s = 16. Check: 9/6 = 24/16.',{audit:{kind:'proportion-denominator-value',leftNum:9,rightNum:24,leftDen:6}});
  [[90,130],[135,198],[55,82],[105,152]].forEach(([mph,fps])=>{
    const converted=mph*5280/3600,q=add('units',`Vehicle A travels ${mph} miles per hour. Vehicle B travels ${fps} feet per second. Use 5,280 feet per mile and 3,600 seconds per hour. Compare their speeds.`,'_',['_a','_b','_c'],`Convert A to feet per second: ${mph} × 5280 ÷ 3600 = ${fmt(converted)}${Number.isInteger(converted)?'':' (approximately)'}. Compare this with ${fps} feet per second. Convert miles to feet and hours to seconds before comparing.`,{columns:["Vehicle A's speed","Vehicle B's speed"],audit:{kind:'units',mph,fps}});
    q.choices=[...fixed];q.correct=Math.abs(converted-fps)<1e-9?2:converted>fps?0:1;
  });
  add('independent','A bag contains 3 red marbles and 7 blue marbles. A marble is chosen at random, replaced, and then a second marble is chosen independently. What is the probability that both marbles are red?','9/100',['3/10','6/10','1/15'],'Replacement keeps the probability of red at 3/10 for each draw. Both must happen: 3/10 × 3/10 = 9/100.',{audit:{kind:'independent',events:[[3,10],[3,10]]}});
  add('independent','Spinner A has 12 equal sections, 7 of them green. Spinner B has 8 equal sections, 3 of them green. The spinners are spun independently. What is the probability that A is NOT green and B IS green?','5/32',['7/32','3/8','3/4'],'A has 12 - 7 = 5 non-green sections. Multiply 5/12 × 3/8 = 15/96 = 5/32. Multiply both numerators and both denominators.',{audit:{kind:'independent',events:[[5,12],[3,8]]}});
  add('independent','One integer is chosen at random from 1 through 14, and another is chosen independently from 1 through 16. What is the probability that BOTH chosen integers are multiples of 3?','5/56',['2/7','5/16','9/30'],'The first range has 4 multiples of 3 (3, 6, 9, 12); the second has 5 (3, 6, 9, 12, 15). Multiply: 4/14 × 5/16 = 20/224 = 5/56.',{audit:{kind:'independent',events:[[4,14],[5,16]]}});
  add('independent','Spinner A has 9 equal sections, 4 of them blue. Spinner B has 14 equal sections, 5 of them blue. The spinners are spun independently. What is the probability that A is NOT blue and B IS blue?','25/126',['10/63','5/14','10/23'],'A has 5 non-blue sections out of 9. Multiply 5/9 × 5/14 = 25/126. Independent events keep their own denominators.',{audit:{kind:'independent',events:[[5,9],[5,14]]}});
  root.MarcoReview5Data={topics,questions,ids:Object.keys(questions),source};
})(typeof window==='undefined'?globalThis:window);
