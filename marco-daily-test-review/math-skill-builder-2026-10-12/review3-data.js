(function(root){
  'use strict';
  const topics=[
    {id:'graphs',name:'Graphs & data',subtopics:[['intercept','Y-intercept'],['count','Data comparisons & ties']]},
    {id:'absolute',name:'Absolute value & signs',subtopics:[['absequation','Both absolute-value solutions']]},
    {id:'rates',name:'Rates & proportions',subtopics:[['proportions','Equivalent proportions'],['units','Converting speed units']]},
    {id:'percent',name:'Percentages',subtopics:[['dimension','Area & volume scaling']]},
    {id:'probability',name:'Probability',subtopics:[['independent','Independent-event probability']]},
    {id:'geometry',name:'Geometry',subtopics:[['transformations','Identifying transformations']]}
  ];
  // Fixed selection from the completed Review 2 first pass. Retries do not change eligibility.
  const source={session:'review2-v1',recordVersion:79,updatedAt:'2026-10-20T03:13:39.935Z',threshold:50,
    expansion:{date:'2026-10-20',basis:'Latest 4 similar questions, first attempts only',appId:'marco-isee-middle-oct04-test2-v1',recordVersion:153,sourceQuestions:{independent:3044,transformations:3025},sessions:['similar-b-untimed','targeted-timed-5','similar-d-untimed-reset-20261007','targeted-final-timed-6']},
    scores:{intercept:{first:1,answered:4},count:{first:1,answered:4},absequation:{first:2,answered:4},proportions:{first:2,answered:4},units:{first:2,answered:4},dimension:{first:2,answered:4},independent:{first:2,answered:4,label:'Latest 4 similar questions'},transformations:{first:2,answered:4,label:'Latest 4 similar questions'}}};
  const questions={},fmt=n=>String(Number(n.toFixed(6))),fixed=['Column A is greater.','Column B is greater.','The quantities are equal.','The relationship cannot be determined.'];
  function add(concept,prompt,answer,wrong,explanation,extra={}){
    const count=Object.values(questions).filter(q=>q.concept===concept).length,index=Object.keys(questions).length;
    const id=`review3-${concept}-${count+1}`,correct=[2,0,3,1,1,3,0,2][index%8],choices=wrong.map(String);
    choices.splice(correct,0,String(answer));
    if(choices.length!==4||new Set(choices).size!==4)throw Error('Invalid choices: '+id);
    questions[id]={id,concept,prompt,choices,correct,explanation,...extra};return questions[id];
  }
  const graph=(m,b,xmin,xmax,ymin,ymax,points)=>({lines:[{m,b,color:'#146a76'}],xmin,xmax,ymin,ymax,points,cropped:true});
  [[3,7,4,7],[2,-9,6,10],[-3,34,4,7],[.5,6,8,14]].forEach(([m,b,x,z],i)=>{
    const rows=[x,z,z+(z-x)].map(v=>[v,m*v+b]);
    const visual=i%2?{table:{headers:['x','y'],rows}}:{graph:graph(m,b,x-1,z+2,Math.min(...rows.slice(0,2).map(r=>r[1]))-5,Math.max(...rows.slice(0,2).map(r=>r[1]))+5,rows.slice(0,2))};
    add('intercept',i%2?'The table lists points on a straight line. What is its y-intercept?':'Only part of a straight line is shown. What is its y-intercept?',b,[m,rows[0][1],rows[1][1]],`First find the slope: (${rows[1][1]} − ${rows[0][1]}) ÷ (${z} − ${x}) = ${m}. Then b = y − mx = ${rows[0][1]} − (${m}) × ${x} = ${b}. The first visible point is not necessarily the y-intercept.`,{...visual,audit:{kind:'intercept',m,x,y:m*x+b}});
  });
  [
    [['Jan',10,15],['Feb',20,20],['Mar',30,25],['Apr',20,30],['May',35,35],['Jun',40,30]],
    [['Mon',10,15],['Tue',20,20],['Wed',30,25],['Thu',25,35],['Fri',40,45],['Sat',50,50],['Sun',45,55]],
    [['Jan',10,15],['Feb',20,20],['Mar',30,25],['Apr',25,35],['May',40,40],['Jun',50,45],['Jul',40,50],['Aug',55,55]],
    [['Mon',15,10],['Tue',20,20],['Wed',30,25],['Thu',30,35],['Fri',45,40],['Sat',50,50],['Sun',55,45]]
  ].forEach((rows,i)=>{
    const a=rows.filter(r=>r[1]>r[2]).length,b=rows.filter(r=>r[2]>r[1]).length,fraction=i%2===0;
    const visual=i<2?{table:{headers:[fraction?'Month':'Day','Town A (°C)','Town B (°C)'],rows}}:{series:{title:fraction?'Monthly temperatures for Town A and Town B':'Daily temperatures for Town A and Town B',labels:rows.map(r=>r[0]),lines:[{name:'Town A',values:rows.map(r=>r[1]),color:'#146a76'},{name:'Town B',values:rows.map(r=>r[2]),color:'#b3593a'}]},table:{caption:'Exact values from the graph',headers:[fraction?'Month':'Day','Town A (°C)','Town B (°C)'],rows}};
    add('count',fraction?'What fraction of the listed months has Town B strictly warmer than Town A?':'A is the number of days Town A is warmer; B is the number Town B is warmer. What is B − A?',fraction?`${b}/${rows.length}`:b-a,fraction?[`${b+1}/${rows.length}`,`${b}/${rows.length-1}`,`${b-1}/${rows.length}`]:[a,b,b+a],fraction?`Town B is strictly warmer in ${b} of ${rows.length} months. Ties stay in the total of ${rows.length}, but do not count as warmer.`:`A = ${a}, B = ${b}. Ties count for neither town. Subtract in the requested order: B − A = ${b} − ${a} = ${b-a}.`,{...visual,audit:{kind:'count',rows,fraction}});
  });
  add('absequation','The two solutions of |x − 9| = 16 are added. What is their sum?',18,[25,32,-7],'x − 9 = 16 or −16, so x = 25 or −7. Add both solutions: 25 + (−7) = 18.',{audit:{kind:'abs-sum',c:9,k:16}});
  add('absequation','The two solutions of |x + 6| = 13 are added. What is their sum?',-12,[12,26,7],'x + 6 = 13 or −13, so x = 7 or −19. Their sum is 7 + (−19) = −12.',{audit:{kind:'abs-sum',c:-6,k:13}});
  add('absequation','How many real values of x satisfy |x − 5| = 12?',2,[0,1,12],'x − 5 can be 12 or −12. The solutions are 17 and −7: two values.',{audit:{kind:'abs-count',k:12}});
  add('absequation','Which pair gives ALL solutions of |2x + 3| = 11?','x = 4 or x = −7',['x = 4 or x = 7','x = 7 or x = −4','x = 4 or x = −4'],'Solve both cases: 2x + 3 = 11 gives x = 4; 2x + 3 = −11 gives x = −7. Both make the absolute value equal 11.',{audit:{kind:'abs-pair',coefficient:2,offset:3,k:11,roots:[4,-7]}});
  add('proportions','If a/14 = b/6, which equation must be true?','3a = 7b',['7a = 3b','ab = 84','a + b = 20'],'Cross-multiply: 6a = 14b. Divide both sides by 2: 3a = 7b. Keep the opposite numerator and denominator together.',{audit:{kind:'proportion-equation',leftDen:14,rightDen:6,leftCoefficient:3,rightCoefficient:7}});
  add('proportions','If x/18 = y/12, which equation must be true?','2x = 3y',['3x = 2y','xy = 216','x + y = 30'],'Cross-multiply: 12x = 18y. Divide both sides by 6: 2x = 3y.',{audit:{kind:'proportion-equation',leftDen:18,rightDen:12,leftCoefficient:2,rightCoefficient:3}});
  add('proportions','If 8/m = 14/n, where m and n are positive, which equation must be true?','4n = 7m',['4m = 7n','mn = 112','m + n = 22'],'Cross-multiply: 8n = 14m. Divide by 2: 4n = 7m. The variables are in the denominators; keep each diagonal pair together.',{audit:{kind:'proportion-denominators',leftNum:8,rightNum:14,leftCoefficient:4,rightCoefficient:7}});
  add('proportions','If 9/p = 15/q and p = 12, what is q?',20,[7.2,18,36],'Cross-multiply: 9q = 15p. Substitute p = 12: 9q = 180, so q = 20. Check: 9/12 = 15/20 = 3/4.',{audit:{kind:'proportion-denominator-value',leftNum:9,rightNum:15,leftDen:12}});
  [[60,90],[45,63],[105,154],[50,77]].forEach(([mph,fps])=>{
    const converted=mph*5280/3600,q=add('units',`Vehicle A travels ${mph} miles per hour. Vehicle B travels ${fps} feet per second. Use 5,280 feet per mile and 3,600 seconds per hour. Compare their speeds.`,'_',['_a','_b','_c'],`Vehicle A: ${mph} × 5280 ÷ 3600 = ${fmt(converted)} feet per second. Now compare ${fmt(converted)} with ${fps}. Convert to the same unit before comparing.`,{columns:['Vehicle A’s speed','Vehicle B’s speed'],audit:{kind:'units',mph,fps}});
    q.choices=[...fixed];q.correct=Math.abs(converted-fps)<1e-9?2:converted>fps?0:1;
  });
  add('dimension','Each side of a square is increased by 15%. By what percent does its area increase?','32.25%',['15%','30%','132.25%'],'The length factor is 1.15. Area factor = 1.15 × 1.15 = 1.3225. Subtract the original 100%: the increase is 32.25%.',{audit:{kind:'dimension',scale:1.15,power:2,percent:true}});
  add('dimension','Each edge of a cube becomes 5 times as long. The new volume is how many times the original volume?',125,[5,15,25],'All three dimensions change. Volume factor = 5 × 5 × 5 = 125, not 5 × 3 or 5².',{audit:{kind:'dimension',scale:5,power:3}});
  add('dimension','Each edge of a cube is reduced to one fourth of its original length. The new volume is what fraction of the original volume?','1/64',['1/4','1/16','3/4'],'Each of the three dimensions is multiplied by 1/4. Volume factor = (1/4) × (1/4) × (1/4) = 1/64.',{audit:{kind:'dimension',scale:.25,power:3}});
  add('dimension','Each edge of a cube is increased by 20%. By what percent does its volume increase?','72.8%',['20%','60%','172.8%'],'Volume factor = 1.2 × 1.2 × 1.2 = 1.728. The new volume is 172.8% of the original, so the increase is 72.8%.',{audit:{kind:'dimension',scale:1.2,power:3,percent:true}});
  // Append after the original 24 so their IDs, choice order and saved scores stay unchanged.
  add('independent','A bag contains 3 red marbles and 5 blue marbles. A marble is chosen at random, replaced, and then a second marble is chosen independently. What is the probability that both marbles are red?','9/64',['6/8','9/56','3/8'],'Replacement leaves 3 red marbles out of 8 for each draw. Multiply the independent probabilities: 3/8 × 3/8 = 9/64.',{audit:{kind:'independent',events:[[3,8],[3,8]]}});
  add('independent','A fair six-sided die numbered 1–6 is rolled, and a fair coin is tossed independently. What is the probability of an even number AND heads?','1/4',['1/2','2/3','1/6'],'The even numbers are 2, 4 and 6, so P(even) = 3/6. P(heads) = 1/2. Both must happen: 3/6 × 1/2 = 1/4.',{audit:{kind:'independent',events:[[3,6],[1,2]]}});
  add('independent','One integer is chosen at random from 1 through 8, and another is chosen independently from 1 through 9. What is the probability that BOTH chosen integers are multiples of 3?','1/12',['7/12','1/4','1/3'],'There are 2 multiples of 3 in 1–8 (3, 6) and 3 in 1–9 (3, 6, 9). Multiply: 2/8 × 3/9 = 6/72 = 1/12.',{audit:{kind:'independent',events:[[2,8],[3,9]]}});
  add('independent','Spinner A has 5 equal sections, 2 of them green. Spinner B has 7 equal sections, 3 of them green. The spinners are spun independently. What is the probability that A is NOT green and B IS green?','9/35',['6/35','9/12','3/7'],'Spinner A has 5 − 2 = 3 non-green sections. Multiply P(A not green) by P(B green): 3/5 × 3/7 = 9/35.',{audit:{kind:'independent',events:[[3,5],[3,7]]}});
  const transformPrompt='Triangle ABC is changed into triangle A′B′C′ as shown. Which transformation maps each vertex to its matching primed vertex?';
  add('transformations',transformPrompt,'Translation 5 units right and 3 units up',['Reflection across the y-axis','Rotation 180° about the origin','Dilation with scale factor 2 about the origin'],'Every vertex moves by the same amount: (x, y) → (x + 5, y + 3). For example, A(−4, −2) becomes A′(1, 1). The shape keeps its size and orientation.',{transformation:{points:[[-4,-2],[-1,-2],[-3,1]],imagePoints:[[1,1],[4,1],[2,4]]},audit:{kind:'transformation',rule:'translate',dx:5,dy:3}});
  add('transformations',transformPrompt,'Reflection across the y-axis',['Reflection across the x-axis','Rotation 180° about the origin','Translation 5 units left'],'Each x-coordinate changes sign while its y-coordinate stays the same: (x, y) → (−x, y). For example, B(4, 1) becomes B′(−4, 1). This is a reflection across the y-axis.',{transformation:{points:[[1,1],[4,1],[2,3]],imagePoints:[[-1,1],[-4,1],[-2,3]]},audit:{kind:'transformation',rule:'reflect-y'}});
  add('transformations',transformPrompt,'Rotation 90° counterclockwise about the origin',['Reflection across the y-axis','Translation 4 units left','Rotation 180° about the origin'],'A 90° counterclockwise rotation uses (x, y) → (−y, x). A(1, 1) becomes A′(−1, 1), B(3, 1) becomes B′(−1, 3), and C(1, 2) becomes C′(−2, 1). Check all three vertices.',{transformation:{points:[[1,1],[3,1],[1,2]],imagePoints:[[-1,1],[-1,3],[-2,1]]},audit:{kind:'transformation',rule:'rotate-90-ccw'}});
  add('transformations',transformPrompt,'Dilation with scale factor 2 about the origin',['Translation 1 unit right and 1 unit up','Rotation 90° clockwise about the origin','Reflection across the y-axis'],'Both coordinates of every vertex double: (x, y) → (2x, 2y). For example, B(3, 1) becomes B′(6, 2). Side lengths double; a translation or rotation would keep them the same.',{transformation:{points:[[1,1],[3,1],[1,3]],imagePoints:[[2,2],[6,2],[2,6]]},audit:{kind:'transformation',rule:'dilate',scale:2}});
  root.MarcoReview3Data={topics,questions,ids:Object.keys(questions),source};
})(typeof window==='undefined'?globalThis:window);
