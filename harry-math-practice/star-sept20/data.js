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
  const d = [
    q(4,'Which fraction is equal to 3/7?',['6/21','3/14','9/21','7/3'],2,'Multiply the numerator and denominator by 3: 3/7 = 9/21.'),
    q(5,'60 quarts = ____ gallons',['15','16','56','240'],0,'There are 4 quarts in one gallon. 60 ÷ 4 = 15 gallons.'),
    q(8,'Nora has read 30 pages of a book. She reads 8 more pages each day for 5 days. How many pages has she read in all?',['43','40','240','70'],3,'First find the new pages: 8 × 5 = 40. Then add: 30 + 40 = 70.'),
    q(10,'Which table matches the rule “subtract 4 from the input number”?',['Inputs: 12, 16, 19 → Outputs: 16, 20, 23','Inputs: 12, 16, 19 → Outputs: 8, 12, 15','Inputs: 12, 16, 19 → Outputs: 8, 13, 15','Inputs: 12, 16, 19 → Outputs: 4, 4, 4'],1,'Check every pair: 12 − 4 = 8, 16 − 4 = 12, and 19 − 4 = 15.'),
    q(11,'Multiply: 4,627 × 5',['23,135','23,035','22,135','23,105'],0,'4,000 × 5 = 20,000; 600 × 5 = 3,000; 27 × 5 = 135. Total: 23,135.'),
    q(14,'A machine packs 108 pencils in 9 minutes at a constant rate. How many pencils does it pack per minute?',['9','99','12','13'],2,'Pencils per minute = total pencils ÷ minutes. 108 ÷ 9 = 12.'),
    q(17,'A pitcher holds 11/12 gallon of lemonade. Zoe pours out 5/12 gallon. How much remains? Choose the simplest form.',['6/24 gallon','1/2 gallon','5/12 gallon','1/3 gallon'],1,'11/12 − 5/12 = 6/12. Divide both parts by 6 to get 1/2 gallon.'),
    q(23,'Multiply: 46 × 23',['920','138','1,048','1,058'],3,'46 × 20 = 920 and 46 × 3 = 138. Add: 920 + 138 = 1,058.'),
    q(25,'Amir finished 9/12 of a puzzle. Grace finished 2/12 of an identical puzzle. How much greater was Amir’s fraction?',['11/12','7/24','7/12','2/12'],2,'Find the difference: 9/12 − 2/12 = 7/12. The denominator stays 12.'),
    q(26,'Which shape is at 4/8 on the number line?',['yellow square','yellow star','blue circle','green triangle'],0,'Count four equal intervals from 0. The yellow square is at 4/8, or 1/2.','numberline'),
    q(31,'Estimate by rounding each mixed number to the nearest whole number: 9 2/3 + 4 1/5',['13','15','12','14'],3,'9 2/3 rounds to 10, and 4 1/5 rounds to 4. Then 10 + 4 = 14.'),
    q(34,'A rectangle is 11 inches long and 8 inches wide. What is its area?',['38 square inches','88 square inches','19 square inches','80 square inches'],1,'Area = length × width = 11 × 8 = 88 square inches.')
  ];
  const e = [
    q(4,'Which fraction is equal to 7/10?',['14/30','21/30','7/20','10/7'],1,'Multiply both the numerator and denominator by 3: 7/10 = 21/30.'),
    q(5,'68 quarts = ____ gallons',['16','64','272','17'],3,'Divide quarts by 4 to find gallons: 68 ÷ 4 = 17.'),
    q(8,'A club has collected 58 bottles. It collects 7 more bottles each day for 5 days. How many bottles has it collected altogether?',['93','70','35','406'],0,'The club collects 7 × 5 = 35 new bottles. 58 + 35 = 93.'),
    q(10,'Which table matches the rule “subtract 7 from the input number”?',['Inputs: 15, 19, 24 → Outputs: 22, 26, 31','Inputs: 15, 19, 24 → Outputs: 8, 13, 17','Inputs: 15, 19, 24 → Outputs: 8, 12, 17','Inputs: 15, 19, 24 → Outputs: 7, 7, 7'],2,'15 − 7 = 8, 19 − 7 = 12, and 24 − 7 = 17. All three pairs must match.'),
    q(11,'Multiply: 6,318 × 4',['25,232','24,272','25,172','25,272'],3,'6,000 × 4 = 24,000; 300 × 4 = 1,200; 18 × 4 = 72. Total: 25,272.'),
    q(14,'A printer prints 126 pages in 9 minutes at a constant rate. How many pages does it print per minute?',['9','14','117','15'],1,'Pages per minute = 126 ÷ 9 = 14. Check: 14 × 9 = 126.'),
    q(17,'There is 7/9 liter of soup in a pot. Theo serves 1/9 liter. How much is left? Choose the simplest form.',['6/18 liter','1/3 liter','2/3 liter','1/9 liter'],2,'7/9 − 1/9 = 6/9. Divide the numerator and denominator by 3: 6/9 = 2/3.'),
    q(23,'Multiply: 58 × 34',['1,972','1,740','232','1,872'],0,'58 × 30 = 1,740 and 58 × 4 = 232. Add: 1,740 + 232 = 1,972.'),
    q(25,'Isla walked 11/15 of a trail. Jack walked 2/15 of the same trail. How much greater was Isla’s fraction? Choose the simplest form.',['13/15','3/5','3/10','1/5'],1,'11/15 − 2/15 = 9/15. Divide both parts by 3: 9/15 = 3/5.'),
    q(26,'Which shape is at 1/4 on the number line?',['blue circle','green triangle','yellow square','yellow star'],3,'1/4 is equal to 2/8. The yellow star is two equal intervals after 0.','numberline'),
    q(31,'Estimate by rounding each mixed number to the nearest whole number: 5 1/8 + 6 4/5',['12','11','13','10'],0,'5 1/8 rounds to 5, and 6 4/5 rounds to 7. Then 5 + 7 = 12.'),
    q(34,'A rectangle is 13 centimeters long and 6 centimeters wide. What is its area?',['38 square centimeters','19 square centimeters','78 square centimeters','72 square centimeters'],2,'Area = length × width = 13 × 6 = 78 square centimeters.')
  ];
  const f = [
    q(4,'Which fraction is equal to 5/6?',['20/24','10/18','5/12','6/5'],0,'Multiply both parts by 4: 5/6 = 20/24.'),
    q(5,'76 quarts = ____ gallons',['18','72','19','304'],2,'There are 4 quarts in a gallon. 76 ÷ 4 = 19 gallons.'),
    q(8,'A library display has 73 books. A librarian adds 6 books each day for 8 days. How many books are on the display then?',['87','121','48','438'],1,'First multiply: 6 × 8 = 48 new books. Then add: 73 + 48 = 121.'),
    q(10,'Which table matches the rule “subtract 8 from the input number”?',['Inputs: 17, 22, 26 → Outputs: 25, 30, 34','Inputs: 17, 22, 26 → Outputs: 9, 15, 18','Inputs: 17, 22, 26 → Outputs: 8, 8, 8','Inputs: 17, 22, 26 → Outputs: 9, 14, 18'],3,'17 − 8 = 9, 22 − 8 = 14, and 26 − 8 = 18.'),
    q(11,'Multiply: 7,246 × 3',['21,638','21,708','21,738','20,738'],2,'7,000 × 3 = 21,000; 200 × 3 = 600; 46 × 3 = 138. Total: 21,738.'),
    q(14,'A machine fills 156 cups in 12 minutes at a constant rate. How many cups does it fill per minute?',['13','12','144','14'],0,'Divide total cups by minutes: 156 ÷ 12 = 13 cups per minute.'),
    q(17,'A container holds 13/16 gallon of water. Ella uses 5/16 gallon. How much remains? Choose the simplest form.',['8/32 gallon','1/4 gallon','5/16 gallon','1/2 gallon'],3,'13/16 − 5/16 = 8/16. Divide both parts by 8: 8/16 = 1/2.'),
    q(23,'Multiply: 67 × 25',['1,340','1,675','335','1,575'],1,'67 × 20 = 1,340 and 67 × 5 = 335. Add: 1,340 + 335 = 1,675.'),
    q(25,'Lucy filled 7/8 of a bucket. Max filled 2/8 of an identical bucket. How much greater was Lucy’s fraction?',['5/8','9/8','5/16','3/8'],0,'Find the difference: 7/8 − 2/8 = 5/8. Keep the denominator 8.'),
    q(26,'Which shape is at 3/4 on the number line?',['yellow square','blue circle','green triangle','yellow star'],2,'3/4 is equal to 6/8. The green triangle is six equal intervals after 0.','numberline'),
    q(31,'Estimate by rounding each mixed number to the nearest whole number: 8 2/7 + 4 5/6',['12','13','14','11'],1,'8 2/7 rounds to 8, and 4 5/6 rounds to 5. Then 8 + 5 = 13.'),
    q(34,'A rectangle is 16 meters long and 7 meters wide. What is its area?',['46 square meters','23 square meters','105 square meters','112 square meters'],3,'Area = length × width = 16 × 7 = 112 square meters.')
  ];
  // Fixed, mixed orders keep saved question IDs stable without repeating the original sequence.
  const mix = (items,order) => order.map(index=>items[index]);
  window.HARRY_SEPT_PRACTICE = [
    {id:'original',title:'Session 1 · Original retry',description:'The 12 questions from the September 20 test. Solve them again without the recorded answers.',questions:original},
    {id:'similar-a',title:'Session 2 · Fresh check A',description:'12 new questions using the same skills. Try on another day after reviewing Session 1.',questions:mix(a,[3,6,0,9,2,10,4,1,11,7,5,8])},
    {id:'similar-b',title:'Session 3 · Fresh check B',description:'Another 12 new questions. Work independently and explain your thinking.',questions:mix(b,[11,4,8,1,10,5,2,9,0,7,3,6])},
    {id:'similar-c',title:'Session 4 · Fresh check C',description:'A fresh set of 12. Try a few days later to check what you remember.',questions:mix(c,[7,2,9,4,6,11,3,8,5,0,10,1])},
    {id:'similar-d',title:'Session 5 · Fresh check D',description:'12 more questions with the same skills and format. Work out each answer before choosing.',questions:mix(d,[0,5,10,3,8,1,6,11,4,9,2,7])},
    {id:'similar-e',title:'Session 6 · Fresh check E',description:'Another fresh set of 12. Use paper to show your working and check your calculations.',questions:mix(e,[6,1,4,9,2,7,10,5,0,11,8,3])},
    {id:'similar-f',title:'Session 7 · Fresh check F',description:'12 new questions to check what you remember. Try this session on another day.',questions:mix(f,[10,3,8,5,0,11,6,1,9,4,7,2])}
  ];
})();
