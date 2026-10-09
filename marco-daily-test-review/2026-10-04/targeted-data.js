(function(root){
  'use strict';
  // Frozen selection from the completed Session 1 and 2 runs inspected October 5.
  // A retry correction remains a target: it is not a correct independent first try.
  const sources=[1008,1010,1018,1034,2016,2018,2026,2029,2032,3025,3026,3041,3042,3044,3045];
  root.MARCO_OCT04_TARGETS={sources,basis:'Session 1: 12/25; Session 2: 19/25 first-try points',counts:{VR:4,QR:5,MA:6}};
  // Preserve old Session 4 runs under their existing ID; the reset starts only on click.
  root.MARCO_ISEE_LEGACY.push({...root.MARCO_ISEE_PRACTICE.find(s=>s.number===4),label:'Session 4 before the October 7 reset'});
  root.MARCO_ISEE_PRACTICE=root.MARCO_ISEE_PRACTICE.map(s=>s.number===3?{
    ...s,label:'Targeted practice · 15 questions',defaultSources:sources
  }:s.number===4?{
    ...s,id:'similar-d-untimed-reset-20261007',label:'Targeted practice · 15 questions',defaultSources:sources,timeLimitSeconds:undefined
  }:s);
  const originals=root.MARCO_ISEE_REVIEW;
  const make=(source,prompt,choices,correct,tip,explanation,extra={})=>({
    ...originals.find(q=>q.source===source),prompt,choices,correct,tip,explanation,
    chosen:undefined,seconds:undefined,diagram:undefined,columns:undefined,
    practiceKind:'Fresh follow-up',...extra
  });
  const qc=['The quantity in Column A is greater.','The quantity in Column B is greater.','The two quantities are equal.','The relationship cannot be determined from the information given.'];
  const math=[
    make(2016,'Lina earns 3 times Sam’s weekly pay. After 4 weeks Lina has earned $2,400 more than Sam. If S is Sam’s weekly pay, which equation is correct?',
      ['12S + 4S = 2,400','4S − 12S = 2,400','12S − 4S = 2,400','3S − S = 2,400'],2,
      'Write BOTH four-week totals before taking their difference.',
      'Lina earns 12S in four weeks and Sam earns 4S. Larger total minus smaller total is 2,400: 12S − 4S = 2,400. The difference is 8S, so S = $300.'),
    make(2018,'The line of best fit predicts that a customer spends $36 in 24 minutes. What average spending per minute does this prediction imply?',
      ['$0.67','$1.50','$12.00','$36.00'],1,
      'Use the predicted dollars from the line, then divide by minutes.',
      'Average spending rate is 36 ÷ 24 = $1.50 per minute. The total $36 is not the amount spent each minute.'),
    make(2026,'Mia earns $70 in 5 hours. Leo earns $96 in 8 hours. Their hourly rates stay constant.',qc,0,
      'Find each hourly rate, THEN multiply by the new number of hours.',
      'Mia earns 70 ÷ 5 = $14/hour; eight hours pays $112. Leo earns 96 ÷ 8 = $12/hour; nine hours pays $108. Column A is greater.',
      {columns:['Mia’s earnings for 8 hours','Leo’s earnings for 9 hours']}),
    make(2029,'Compare the quantities.',qc,1,
      'Do the subtraction inside each pair of bars before taking its distance from zero.',
      '|11 − 35| = |−24| = 24. |35 − 8| = |27| = 27. Column B is greater.',
      {columns:['|11 − 35|','|35 − 8|']}),
    make(2032,'m + 2n = 16 and 2m + n = 17. Compare the quantities.',qc,1,
      'Use both equations. Compare m with n SQUARED, not with n.',
      'Double the first equation and subtract the second: 3n = 15, so n = 5. Then m = 6. Compare 6 with 5² = 25: Column B is greater.',
      {columns:['m','n²']}),
    make(3025,'The graph shows ABCD and its image A′B′C′D′. Which single transformation produces the image?',
      ['reflection','rotation','translation','dilation'],2,
      'Check that EVERY vertex moves by the same amount with no turn or flip.',
      'Every vertex moves 2 units right and 3 units down. The size and orientation stay the same, so the movement is a translation.',
      {diagram:'ma-transform',points:[[-4,4],[-3,1],[-1,2],[-1,4]],imagePoints:[[-2,1],[-1,-2],[1,-1],[1,1]],gridRange:6,check:{type:'transform',kind:0,dx:2,dy:-3}}),
    make(3026,'What is the smallest prime factor of 87?',
      ['1','3','29','87'],1,
      'Try primes in order. One is not prime; an odd number is not divisible by 2.',
      '87 is odd, but its digits add to 15, so it is divisible by 3. Since 87 = 3 × 29, its smallest prime factor is 3.',
      {check:{type:'prime',value:87}}),
    make(3041,'A kite has area 96 square feet and diagonal AC = 16 feet. Its area is ½ × AC × BD. What is BD?',
      ['6 feet','8 feet','12 feet','24 feet'],2,
      'Other diagonal = 2 × area ÷ known diagonal.',
      'BD = 2 × 96 ÷ 16 = 12 feet. Check: ½ × 16 × 12 = 96. Dividing 96 by 16 alone loses the one-half in the formula.',
      {diagram:'ma-kite',diagonal:16,check:{type:'kite',area:96,p:16}}),
    make(3042,'A circle fits exactly inside a square with side length 16 cm. What is the area inside the square but outside the circle? (Circle area = πr².)',
      ['256 − 16π','128 − 64π','256 − 256π','256 − 64π'],3,
      'Square the side for the square. HALVE the side before squaring for the circle.',
      'The square area is 16² = 256. The circle has radius 8, so its area is 64π. Subtract: 256 − 64π square centimeters.',
      {diagram:'ma-circle',side:16,check:{type:'circle',side:16}}),
    make(3044,'A number is randomly chosen from 1 to 7 inclusive, then independently from 8 to 13 inclusive. What is the probability that BOTH are even?',
      ['3/14','13/14','1/2','3/7'],0,
      'Count endpoints. For independent events, BOTH means MULTIPLY.',
      'The first range has 3 even numbers out of 7; the second has 3 out of 6. Multiply: (3/7) × (3/6) = 9/42 = 3/14. Adding would give 13/14, which is not the chance of both.',
      {check:{type:'probability',ranges:[[1,7],[8,13]]}}),
    make(3045,'A right cylinder has volume 150π cubic inches and diameter 10 inches. What is its height? (V = πr²h.)',
      ['1.5 inches','3 inches','6 inches','15 inches'],2,
      'HALVE the diameter, SQUARE the radius, then divide.',
      'Radius = 10 ÷ 2 = 5 inches. Therefore h = 150π ÷ (25π) = 6 inches. Using the diameter as the radius would incorrectly give 1.5 inches.',
      {diagram:'ma-cylinder',diameter:10,check:{type:'cylinder',volume:150,diameter:10}})
  ];
  const questions=[...originals.filter(q=>q.section==='VR'&&sources.includes(q.source)).map(q=>({...q,practiceKind:'Original VR question'})),...math];
  // Keep earlier adaptive/untimed attempts under their original ID and scope.
  root.MARCO_ISEE_LEGACY.push({id:'targeted-followup-5',number:5,label:'Earlier untimed follow-up',questions});
  root.MARCO_ISEE_PRACTICE.push({
    id:'targeted-timed-5',number:5,label:'Similar practice · 15 questions',
    defaultSources:sources,questions
  });
  const finalMath=[
    make(2016,'Nora earns 5 times Ben’s weekly pay. After 4 weeks Nora has earned $6,400 more than Ben. If B is Ben’s weekly pay, which equation is correct?',
      ['20B − 4B = 6,400','20B + 4B = 6,400','4B − 20B = 6,400','5B − B = 6,400'],0,
      'Write both four-week totals, then subtract the smaller from the larger.',
      'Nora earns 20B in four weeks and Ben earns 4B. Their difference is 6,400, so 20B − 4B = 6,400. This gives 16B = 6,400 and B = $400.'),
    make(2018,'The line of best fit predicts that a customer spends $54 in 24 minutes. What average spending per minute does this prediction imply?',
      ['$0.44','$1.25','$2.25','$54.00'],2,
      'Divide the predicted total dollars by the number of minutes.',
      'The average spending rate is 54 ÷ 24 = $2.25 per minute. Dividing minutes by dollars reverses the requested units; $54 is the total, not the rate.'),
    make(2026,'Ella earns $90 in 6 hours. Max earns $112 in 8 hours. Their hourly rates stay constant.',qc,1,
      'Find each hourly rate first, then multiply by the hours in that column.',
      'Ella earns 90 ÷ 6 = $15/hour, so seven hours pays $105. Max earns 112 ÷ 8 = $14/hour, so eight hours pays $112. Column B is greater.',
      {columns:['Ella’s earnings for 7 hours','Max’s earnings for 8 hours']}),
    make(2029,'Compare the quantities.',qc,0,
      'Subtract inside each pair of bars before taking the absolute value.',
      '|16 − 43| = |−27| = 27. |43 − 19| = |24| = 24. Column A is greater.',
      {columns:['|16 − 43|','|43 − 19|']}),
    make(2032,'m + 2n = 15 and 2m + n = 21. Compare the quantities.',qc,2,
      'Solve for both variables, then compare m with the square of n.',
      'Double the first equation and subtract the second: 3n = 9, so n = 3. Then m = 9. Since n² = 9, the two quantities are equal.',
      {columns:['m','n²']}),
    make(3025,'The graph shows ABCD and its image A′B′C′D′. Which single transformation produces the image?',
      ['rotation','dilation','reflection','translation'],3,
      'Compare the movement of every vertex. A translation keeps the orientation.',
      'Each vertex moves 4 units right and 2 units down. The figure keeps its size and orientation, so the transformation is a translation.',
      {diagram:'ma-transform',points:[[-4,4],[-3,1],[-1,2],[-1,4]],imagePoints:[[0,2],[1,-1],[3,0],[3,2]],gridRange:6,check:{type:'transform',kind:0,dx:4,dy:-2}}),
    make(3026,'What is the smallest prime factor of 119?',
      ['17','1','7','119'],2,
      'Test primes in increasing order; one is not a prime number.',
      '119 is not divisible by 2, 3, or 5. It equals 7 × 17, so 7 is its smallest prime factor. Although 17 is also prime, it is not the smallest factor.',
      {check:{type:'prime',value:119}}),
    make(3041,'A kite has area 126 square feet and diagonal AC = 18 feet. Its area is ½ × AC × BD. What is BD?',
      ['7 feet','14 feet','18 feet','28 feet'],1,
      'Double the area before dividing by the known diagonal.',
      'BD = 2 × 126 ÷ 18 = 14 feet. Check: ½ × 18 × 14 = 126 square feet. Dividing the area by 18 without doubling would give only half the required diagonal.',
      {diagram:'ma-kite',diagonal:18,check:{type:'kite',area:126,p:18}}),
    make(3042,'A circle fits exactly inside a square with side length 18 cm. What is the area inside the square but outside the circle? (Circle area = πr².)',
      ['324 − 81π','324 − 18π','162 − 81π','324 − 324π'],0,
      'The side is the circle’s diameter. Halve it to find the radius.',
      'The square area is 18² = 324. The circle has radius 9 and area 81π. Subtract the circle area from the square area: 324 − 81π square centimeters.',
      {diagram:'ma-circle',side:18,check:{type:'circle',side:18}}),
    make(3044,'A number is chosen uniformly at random from the integers 3 through 11, then independently from the integers 12 through 18. What is the probability that BOTH are even?',
      ['4/9','4/7','64/63','16/63'],3,
      'Count all integers including both endpoints, then multiply the two chances.',
      'The first range contains 4 even integers out of 9. The second contains 4 out of 7. Since the choices are independent, multiply: (4/9) × (4/7) = 16/63. Adding would give 64/63, which cannot be a probability.',
      {check:{type:'probability',ranges:[[3,11],[12,18]]}}),
    make(3045,'A right cylinder has volume 324π cubic inches and diameter 12 inches. What is its height? (V = πr²h.)',
      ['2.25 inches','9 inches','18 inches','27 inches'],1,
      'Use half the diameter as the radius, then square it before dividing.',
      'The radius is 12 ÷ 2 = 6 inches. Thus h = 324π ÷ (36π) = 9 inches. Using the diameter as the radius would incorrectly give 2.25 inches.',
      {diagram:'ma-cylinder',diameter:12,check:{type:'cylinder',volume:324,diameter:12}})
  ];
  root.MARCO_ISEE_PRACTICE.push({
    id:'targeted-final-timed-6',number:6,label:'Final timed practice · 15 questions',
    defaultSources:sources,timeLimitSeconds:780,
    questions:[...questions.filter(q=>q.section==='VR'),...finalMath]
  });
})(window);
