(function () {
  'use strict';
  const skills = {4:'Equivalent fractions',5:'Quarts and gallons',8:'Two-step word problems',10:'Input and output',11:'Multi-digit multiplication',14:'Rates',17:'Subtract fractions',23:'Two-digit multiplication',25:'Compare fraction amounts',26:'Fraction number lines',31:'Estimate mixed numbers',34:'Rectangle area'};
  const sources = [4,5,8,10,11,14,17,23,25,26,31,34];
  function q(source,prompt,choices,correct,explanation,visual) {
    return {source,skill:skills[source],prompt,choices,correct,explanation,visual};
  }
  const original = sources.map(number => {
    const item = window.STAR_REVIEW.questions.find(item => item.number === number);
    return q(number,item.prompt,item.choices,item.correct,item.explanation,number===26?'numberline':null);
  });
  const a = [
    q(4,'Which fraction is equal to 2/5?',['4/15','4/10','2/10','5/2'],1,'Multiply the numerator and denominator by 2: 2/5 = 4/10.'),
    q(5,'36 quarts = ____ gallons',['8','12','9','144'],2,'There are 4 quarts in one gallon. 36 ÷ 4 = 9 gallons.'),
    q(8,'Lena knows 46 signs. She learns 6 new signs each day for 5 days. How many signs does she know now?',['76','57','66','276'],0,'First find the new signs: 6 × 5 = 30. Then add: 46 + 30 = 76.'),
    q(10,'Which table matches the rule “subtract 3 from the input number”?',['Inputs: 7, 10, 12 → Outputs: 10, 13, 15','Inputs: 7, 10, 12 → Outputs: 4, 6, 9','Inputs: 7, 10, 12 → Outputs: 4, 7, 9','Inputs: 7, 10, 12 → Outputs: 3, 3, 3'],2,'Check every pair: 7 − 3 = 4, 10 − 3 = 7, and 12 − 3 = 9.'),
    q(11,'Multiply: 4,316 × 4',['17,224','16,264','17,064','17,264'],3,'4,000 × 4 = 16,000; 300 × 4 = 1,200; 16 × 4 = 64. Total: 17,264.'),
    q(14,'A pump moves 96 gallons of water in 12 minutes at a constant rate. How many gallons does it move per minute?',['12','8','84','9'],1,'Gallons per minute = total gallons ÷ minutes. 96 ÷ 12 = 8.'),
    q(17,'A jug holds 7/8 gallon of juice. Ben uses 3/8 gallon. How much is left? Choose the simplest form.',['1/2 gallon','4/16 gallon','3/8 gallon','1/4 gallon'],0,'7/8 − 3/8 = 4/8. Simplify 4/8 to 1/2.'),
    q(23,'Multiply: 37 × 24',['148','740','888','878'],2,'37 × 20 = 740 and 37 × 4 = 148. Add: 740 + 148 = 888.'),
    q(25,'Maya painted 6/9 of a fence. Noah painted 2/9 of it. How much greater was Maya’s fraction than Noah’s?',['8/9','4/18','2/9','4/9'],3,'Find the difference: 6/9 − 2/9 = 4/9. Keep the denominator because the pieces are ninths.'),
    q(26,'Which shape is at 6/8 on the number line?',['blue circle','green triangle','yellow square','yellow star'],1,'Count six equal intervals from 0. The green triangle is at 6/8, or 3/4.','numberline'),
    q(31,'Estimate by rounding each mixed number to the nearest whole number: 6 3/4 + 2 1/6',['8','10','9','7'],2,'6 3/4 rounds to 7, and 2 1/6 rounds to 2. Then 7 + 2 = 9.'),
    q(34,'A rectangle is 9 inches long and 7 inches wide. What is its area?',['63 square inches','32 square inches','16 square inches','56 square inches'],0,'Area = length × width = 9 × 7 = 63 square inches.')
  ];
  const b = [
    q(4,'Which fraction is equal to 4/9?',['8/27','4/18','12/27','9/4'],2,'Multiply both parts by 3: 4/9 = 12/27.'),
    q(5,'44 quarts = ____ gallons',['11','10','40','176'],0,'44 ÷ 4 = 11 gallons.'),
    q(8,'A class has collected 32 cans. It collects 7 more cans each day for 6 days. How many cans does the class have in all?',['45','42','224','74'],3,'The class collects 7 × 6 = 42 new cans. 32 + 42 = 74.'),
    q(10,'Which table matches the rule “subtract 5 from the input number”?',['Inputs: 11, 14, 18 → Outputs: 16, 19, 23','Inputs: 11, 14, 18 → Outputs: 6, 9, 13','Inputs: 11, 14, 18 → Outputs: 6, 10, 13','Inputs: 11, 14, 18 → Outputs: 5, 5, 5'],1,'11 − 5 = 6, 14 − 5 = 9, and 18 − 5 = 13.'),
    q(11,'Multiply: 5,278 × 6',['31,668','31,628','30,668','31,568'],0,'5,000 × 6 = 30,000; 278 × 6 = 1,668. Total: 31,668.'),
    q(14,'A machine fills 84 bottles in 7 minutes at a constant rate. How many bottles does it fill per minute?',['7','11','77','12'],3,'84 ÷ 7 = 12 bottles per minute.'),
    q(17,'There is 5/6 liter of paint. Ava uses 1/6 liter. How much remains? Choose the simplest form.',['4/12 liter','1/6 liter','2/3 liter','1/3 liter'],2,'5/6 − 1/6 = 4/6, which simplifies to 2/3.'),
    q(23,'Multiply: 54 × 32',['1,620','1,728','1,628','108'],1,'54 × 30 = 1,620 and 54 × 2 = 108. Total: 1,728.'),
    q(25,'Eli read 7/10 of a book. Sam read 3/10 of the same book. How much greater was Eli’s fraction? Choose the simplest form.',['2/5','1/5','4/20','1'],0,'7/10 − 3/10 = 4/10 = 2/5.'),
    q(26,'Which shape is at 2/8 on the number line?',['yellow square','green triangle','blue circle','yellow star'],3,'The yellow star is two equal intervals after 0, at 2/8 or 1/4.','numberline'),
    q(31,'Estimate by rounding each mixed number to the nearest whole number: 8 1/4 + 5 3/4',['13','14','15','12'],1,'8 1/4 rounds to 8 and 5 3/4 rounds to 6. The estimate is 8 + 6 = 14.'),
    q(34,'A rectangle is 12 centimeters long and 6 centimeters wide. What is its area?',['18 square centimeters','36 square centimeters','72 square centimeters','66 square centimeters'],2,'Area = 12 × 6 = 72 square centimeters.')
  ];
  const c = [
    q(4,'Which fraction is equal to 5/8?',['10/24','5/16','8/5','15/24'],3,'Multiply both parts by 3: 5/8 = 15/24.'),
    q(5,'52 quarts = ____ gallons',['12','13','48','208'],1,'52 ÷ 4 = 13 gallons.'),
    q(8,'Owen has 67 stickers. He earns 9 more stickers each day for 4 days. How many stickers does he have then?',['80','94','103','603'],2,'9 × 4 = 36 new stickers. 67 + 36 = 103.'),
    q(10,'Which table matches the rule “subtract 6 from the input number”?',['Inputs: 13, 17, 20 → Outputs: 7, 11, 14','Inputs: 13, 17, 20 → Outputs: 19, 23, 26','Inputs: 13, 17, 20 → Outputs: 7, 12, 14','Inputs: 13, 17, 20 → Outputs: 6, 6, 6'],0,'13 − 6 = 7, 17 − 6 = 11, and 20 − 6 = 14.'),
    q(11,'Multiply: 3,847 × 7',['26,889','25,929','26,929','26,829'],2,'3,800 × 7 = 26,600 and 47 × 7 = 329. Total: 26,929.'),
    q(14,'A pump delivers 132 gallons in 11 minutes at a constant rate. How many gallons does it deliver per minute?',['12','11','121','13'],0,'132 ÷ 11 = 12 gallons per minute.'),
    q(17,'A bottle holds 9/10 liter of water. Mia pours out 3/10 liter. How much remains? Choose the simplest form.',['3/10 liter','3/5 liter','6/20 liter','1/5 liter'],1,'9/10 − 3/10 = 6/10 = 3/5.'),
    q(23,'Multiply: 63 × 27',['441','1,260','1,601','1,701'],3,'63 × 20 = 1,260 and 63 × 7 = 441. Total: 1,701.'),
    q(25,'Ruby planted 5/8 of a garden. Leo planted 1/8 of it. How much greater was Ruby’s fraction? Choose the simplest form.',['1/4','3/4','1/2','1/8'],2,'5/8 − 1/8 = 4/8 = 1/2.'),
    q(26,'Which shape is at 3/8 on the number line?',['blue circle','yellow star','green triangle','yellow square'],0,'The blue circle is three equal intervals after 0, at 3/8.','numberline'),
    q(31,'Estimate by rounding each mixed number to the nearest whole number: 7 5/6 + 3 1/8',['10','12','9','11'],3,'7 5/6 rounds to 8, and 3 1/8 rounds to 3. Then 8 + 3 = 11.'),
    q(34,'A rectangle is 14 meters long and 5 meters wide. What is its area?',['38 square meters','70 square meters','19 square meters','65 square meters'],1,'Area = length × width = 14 × 5 = 70 square meters.')
  ];
  // Fixed, mixed orders keep saved question IDs stable without repeating the original sequence.
  const mix = (items,order) => order.map(index=>items[index]);
  window.HARRY_SEPT_PRACTICE = [
    {id:'original',title:'Session 1 · Original retry',description:'The 12 questions from the September 20 test. Solve them again without the recorded answers.',questions:original},
    {id:'similar-a',title:'Session 2 · Fresh check A',description:'12 new questions using the same skills. Try on another day after reviewing Session 1.',questions:mix(a,[3,6,0,9,2,10,4,1,11,7,5,8])},
    {id:'similar-b',title:'Session 3 · Fresh check B',description:'Another 12 new questions. Work independently and explain your thinking.',questions:mix(b,[11,4,8,1,10,5,2,9,0,7,3,6])},
    {id:'similar-c',title:'Session 4 · Fresh check C',description:'A final fresh set of 12. Try a few days later to check what you remember.',questions:mix(c,[7,2,9,4,6,11,3,8,5,0,10,1])}
  ];
})();
