(function(root){
  'use strict';
  const topics=[
    {id:'graphs',name:'Graphs & data',subtopics:[['intercept','Y-intercept']]},
    {id:'absolute',name:'Absolute value & signs',subtopics:[['absequation','Both absolute-value solutions']]},
    {id:'rates',name:'Rates & proportions',subtopics:[['proportions','Equivalent proportions'],['units','Converting speed units']]},
    {id:'percent',name:'Percentages',subtopics:[['dimension','Area & volume scaling']]},
    {id:'probability',name:'Probability',subtopics:[['independent','Independent-event probability']]},
    {id:'geometry',name:'Geometry',subtopics:[['transformations','Identifying transformations']]}
  ];
  // Fixed selection from Review 3 first answers. Corrections never change eligibility.
  const source={session:'review3-v1',appId:'marco-math-skill-builder-oct12-review3-v1',recordVersion:50,updatedAt:'2026-10-21T04:39:57.580Z',threshold:100,
    scores:{intercept:{first:2,answered:4},absequation:{first:3,answered:4},proportions:{first:3,answered:4},units:{first:1,answered:4},dimension:{first:3,answered:4},independent:{first:3,answered:4},transformations:{first:2,answered:4}},
    excluded:{count:{first:4,answered:4}}};
  const questions={},fmt=n=>String(Number(n.toFixed(6))),fixed=['Column A is greater.','Column B is greater.','The quantities are equal.','The relationship cannot be determined.'];
  function add(concept,prompt,answer,wrong,explanation,extra={}){
    const count=Object.values(questions).filter(q=>q.concept===concept).length,index=Object.keys(questions).length;
    const id=`review4-${concept}-${count+1}`,correct=[1,3,0,2,2,0,3,1][index%8],choices=wrong.map(String);
    choices.splice(correct,0,String(answer));
    if(choices.length!==4||new Set(choices).size!==4)throw Error('Invalid choices: '+id);
    questions[id]={id,concept,prompt,choices,correct,explanation,...extra};return questions[id];
  }
  // Tables recheck the distinction between slope, the first y-value, and y at x = 0.
  [[4,-11,3,6],[.75,-2,4,8],[-2,17,2,5],[1.5,5,2,6]].forEach(([m,b,x,z],i)=>{
    const rows=[x,z,z+(z-x)].map(v=>[v,m*v+b]);
    const visual=i<2?{table:{headers:['x','y'],rows}}:{graph:{lines:[{m,b,color:'#146a76'}],xmin:x-1,xmax:z+2,ymin:Math.min(...rows.slice(0,2).map(r=>r[1]))-4,ymax:Math.max(...rows.slice(0,2).map(r=>r[1]))+4,points:rows.slice(0,2),cropped:true}};
    add('intercept',i<2?'The table lists points on a straight line. What is its y-intercept?':'Only part of a straight line is shown. What is its y-intercept?',b,[m,rows[0][1],rows[1][1]],`Slope = (${rows[1][1]} − ${rows[0][1]}) ÷ (${z} − ${x}) = ${m}. The y-intercept is y when x = 0: b = y − mx = ${rows[0][1]} − (${m}) × ${x} = ${b}. The slope and the first visible y-value are different from the y-intercept.`,{...visual,audit:{kind:'intercept',m,b,x,y:m*x+b}});
  });
  add('absequation','The two solutions of |x + 4| = 15 are added. What is their sum?',-8,[8,30,11],'Solve both cases: x + 4 = 15 gives x = 11; x + 4 = −15 gives x = −19. Their sum is 11 + (−19) = −8. Keep the negative sign.',{audit:{kind:'abs-sum',c:-4,k:15}});
  add('absequation','The two solutions of |x − 7| = 18 are added. What is their sum?',14,[-14,36,25],'x − 7 = 18 or −18, so x = 25 or −11. Their sum is 25 + (−11) = 14.',{audit:{kind:'abs-sum',c:7,k:18}});
  add('absequation','Which pair gives ALL solutions of |3x + 6| = 21?','x = 5 or x = −9',['x = 5 or x = 9','x = 9 or x = −5','x = 5 or x = −5'],'Solve 3x + 6 = 21 and 3x + 6 = −21. Subtract 6 in both equations, then divide by 3: x = 5 or x = −9.',{audit:{kind:'abs-pair',coefficient:3,offset:6,k:21,roots:[5,-9]}});
  add('absequation','Which pair gives ALL solutions of |2x − 8| = 14?','x = 11 or x = −3',['x = 11 or x = 3','x = 3 or x = −11','x = 11 or x = −11'],'Solve 2x − 8 = 14 and 2x − 8 = −14. Add 8 in both equations, then divide by 2: x = 11 or x = −3.',{audit:{kind:'abs-pair',coefficient:2,offset:-8,k:14,roots:[11,-3]}});
  add('proportions','If a/22 = b/8, which equation must be true?','4a = 11b',['11a = 4b','ab = 176','a + b = 30'],'Cross-multiply: 8a = 22b. Divide both sides by 2: 4a = 11b.',{audit:{kind:'proportion-equation',leftDen:22,rightDen:8,leftCoefficient:4,rightCoefficient:11}});
  add('proportions','If 10/m = 16/n, where m and n are positive, which equation must be true?','5n = 8m',['5m = 8n','mn = 160','m + n = 26'],'Keep the diagonal pairs together: 10 × n = 16 × m. Divide by 2: 5n = 8m. The variables are in the denominators.',{audit:{kind:'proportion-denominators',leftNum:10,rightNum:16,leftCoefficient:5,rightCoefficient:8}});
  add('proportions','If 12/p = 21/q, where p and q are positive, which equation must be true?','4q = 7p',['4p = 7q','pq = 252','p + q = 33'],'Cross-multiply: 12q = 21p. Divide by 3: 4q = 7p. Write the diagonal products before simplifying.',{audit:{kind:'proportion-denominators',leftNum:12,rightNum:21,leftCoefficient:4,rightCoefficient:7}});
  add('proportions','If 7/r = 14/s and r = 9, what is s?',18,[4.5,16,21],'Cross-multiply: 7s = 14r. With r = 9, 7s = 126, so s = 18. Check: 7/9 = 14/18.',{audit:{kind:'proportion-denominator-value',leftNum:7,rightNum:14,leftDen:9}});
  [[75,108],[120,176],[40,60],[30,42]].forEach(([mph,fps])=>{
    const converted=mph*5280/3600,q=add('units',`Vehicle A travels ${mph} miles per hour. Vehicle B travels ${fps} feet per second. Use 5,280 feet per mile and 3,600 seconds per hour. Compare their speeds.`,'_',['_a','_b','_c'],`Convert A to feet per second: ${mph} × 5280 ÷ 3600 = ${fmt(converted)}. Now compare ${fmt(converted)} feet per second with ${fps} feet per second. Compare only after the units match.`,{columns:['Vehicle A’s speed','Vehicle B’s speed'],audit:{kind:'units',mph,fps}});
    q.choices=[...fixed];q.correct=Math.abs(converted-fps)<1e-9?2:converted>fps?0:1;
  });
  add('dimension','Each edge of a cube is reduced to one sixth of its original length. The new volume is what fraction of the original volume?','1/216',['1/6','1/36','5/6'],'Volume uses three dimensions: (1/6) × (1/6) × (1/6) = 1/216. The factor 1/36 would describe area.',{audit:{kind:'dimension',scale:1/6,power:3}});
  add('dimension','Each edge of a cube is reduced to three fourths of its original length. The new volume is what fraction of the original volume?','27/64',['3/4','9/16','1/4'],'Cube the length factor: (3/4) × (3/4) × (3/4) = 27/64. Multiply both numerators and denominators three times.',{audit:{kind:'dimension',scale:.75,power:3}});
  add('dimension','Each side of a square is increased by 20%. By what percent does its area increase?','44%',['20%','40%','144%'],'The new side length factor is 1.2. Area factor = 1.2 × 1.2 = 1.44. The increase is 1.44 − 1 = 0.44 = 44%.',{audit:{kind:'dimension',scale:1.2,power:2,percent:true}});
  add('dimension','Each edge of a cube is increased by 50%. By what percent does its volume increase?','237.5%',['50%','150%','337.5%'],'Volume factor = 1.5 × 1.5 × 1.5 = 3.375. The new volume is 337.5% of the original, so the increase is 337.5% − 100% = 237.5%.',{audit:{kind:'dimension',scale:1.5,power:3,percent:true}});
  add('independent','A bag contains 4 red marbles and 5 blue marbles. A marble is chosen at random, replaced, and then a second marble is chosen independently. What is the probability that both marbles are red?','16/81',['8/9','16/72','4/9'],'Replacement keeps each probability at 4/9. Both must happen: 4/9 × 4/9 = 16/81. Multiply the denominators as well as the numerators.',{audit:{kind:'independent',events:[[4,9],[4,9]]}});
  add('independent','Spinner A has 8 equal sections, 5 of them green. Spinner B has 9 equal sections, 4 of them green. The spinners are spun independently. What is the probability that A is NOT green and B IS green?','1/6',['5/18','12/17','4/9'],'A has 8 − 5 = 3 non-green sections. Multiply 3/8 × 4/9 = 12/72 = 1/6. The denominator is 8 × 9, not 8 + 9.',{audit:{kind:'independent',events:[[3,8],[4,9]]}});
  add('independent','One integer is chosen at random from 1 through 10, and another is chosen independently from 1 through 12. What is the probability that BOTH chosen integers are multiples of 4?','1/20',['9/20','1/5','1/4'],'The first range has 2 multiples of 4 (4, 8); the second has 3 (4, 8, 12). Multiply: 2/10 × 3/12 = 6/120 = 1/20.',{audit:{kind:'independent',events:[[2,10],[3,12]]}});
  add('independent','Spinner A has 7 equal sections, 2 of them blue. Spinner B has 10 equal sections, 3 of them blue. The spinners are spun independently. What is the probability that A is NOT blue and B IS blue?','3/14',['3/35','15/17','3/10'],'A has 5 non-blue sections out of 7. Multiply the two event probabilities: 5/7 × 3/10 = 15/70 = 3/14.',{audit:{kind:'independent',events:[[5,7],[3,10]]}});
  const prompt='Triangle ABC is changed into triangle A′B′C′ as shown. Which transformation maps each vertex to its matching primed vertex?';
  add('transformations',prompt,'Reflection across the y-axis',['Reflection across the x-axis','Rotation 180° about the origin','Translation 6 units left'],'The x-coordinate changes sign and the y-coordinate stays the same: (x, y) → (−x, y). For example, A(2, 2) becomes A′(−2, 2). Check the other vertices too.',{transformation:{points:[[2,2],[4,2],[3,5]],imagePoints:[[-2,2],[-4,2],[-3,5]]},audit:{kind:'transformation',rule:'reflect-y'}});
  add('transformations',prompt,'Reflection across the x-axis',['Reflection across the y-axis','Rotation 180° about the origin','Translation 4 units down'],'The x-coordinate stays the same and the y-coordinate changes sign: (x, y) → (x, −y). For example, C(2, 4) becomes C′(2, −4).',{transformation:{points:[[1,2],[4,2],[2,4]],imagePoints:[[1,-2],[4,-2],[2,-4]]},audit:{kind:'transformation',rule:'reflect-x'}});
  add('transformations',prompt,'Rotation 90° counterclockwise about the origin',['Reflection across the y-axis','Rotation 180° about the origin','Translation 3 units left and 1 unit up'],'A 90° counterclockwise rotation maps (x, y) to (−y, x). A(2, 1) becomes A′(−1, 2), B(4, 1) becomes B′(−1, 4), and C(2, 3) becomes C′(−3, 2).',{transformation:{points:[[2,1],[4,1],[2,3]],imagePoints:[[-1,2],[-1,4],[-3,2]]},audit:{kind:'transformation',rule:'rotate-90-ccw'}});
  add('transformations',prompt,'Rotation 180° about the origin',['Reflection across the y-axis','Reflection across the x-axis','Rotation 90° clockwise about the origin'],'A 180° rotation changes both coordinate signs: (x, y) → (−x, −y). For example, C(−3, 3) becomes C′(3, −3). A reflection changes only one coordinate sign.',{transformation:{points:[[-4,1],[-2,1],[-3,3]],imagePoints:[[4,-1],[2,-1],[3,-3]]},audit:{kind:'transformation',rule:'rotate-180'}});
  root.MarcoReview4Data={topics,questions,ids:Object.keys(questions),source};
})(typeof window==='undefined'?globalThis:window);
