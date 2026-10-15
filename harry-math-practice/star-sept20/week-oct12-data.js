(function(){
 'use strict';
 const skills=['Place value','Rounding','Fraction number line','Equivalent fractions','Fraction calculation','Whole-number multiplication','Money and decimals','Division and remainders','Word-problem setup','Rates and relationships','Unit conversion','Geometry'];
 const q=(prompt,answer,wrong,explanation,visual)=>({prompt,answer,wrong,explanation,visual});
 const nl=(parts,point)=>({type:'week-numberline',parts,point});
 const sets=[
 [
 q('Which expression equals 584?','5 hundreds + 8 tens + 4 ones',['500 hundreds + 8 tens + 4 ones','5 hundreds + 4 tens + 8 ones','5 hundreds + 8 ones + 4 tens'],'584 = 500 + 80 + 4. Five hundreds means 500; 500 hundreds would mean 50,000.'),
 q('Round 426,318 to the nearest ten thousand.','430,000',['420,000','426,000','426,300'],'The thousands digit is 6, so round the ten-thousands digit up. The result is 430,000.'),
 q('What fraction is at point P?','3/4',['1/4','3/5','4/3'],'There are four equal intervals from 0 to 1. P is three intervals from 0, so it is 3/4.',nl(4,3)),
 q('Which fraction is equivalent to 2/3?','6/9',['4/9','2/9','6/3'],'Multiply both the numerator and denominator by 3: 2/3 = 6/9.'),
 q('A ribbon is 7/8 meter long. Maya cuts off 3/8 meter. How much is left?','1/2 meter',['4/16 meter','3/8 meter','1/4 meter'],'7/8 − 3/8 = 4/8 = 1/2. Subtract the numerators; the pieces are still eighths.'),
 q('Multiply: 36 × 24','864',['824','744','840'],'36 × 20 = 720 and 36 × 4 = 144. Add 720 + 144 = 864.'),
 q('A bag holds 16 ounces of nuts. The nuts cost $0.45 per ounce. What is the total price?','$7.20',['$72.00','$6.20','$7.02'],'16 × 45 cents = 720 cents = $7.20. The total must be less than $16 because each ounce costs less than $1.'),
 q('A jug has 173 ounces of juice. Fill 8-ounce cups, then pour the leftover juice into a final cup. How many ounces are in that partly filled cup?','5 ounces',['21 ounces','8 ounces','13 ounces'],'21 full cups use 21 × 8 = 168 ounces. The last cup holds 173 − 168 = 5 ounces, less than 8.'),
 q('Lena has 47 stickers. She gets 6 more stickers each day for 5 days. How many stickers does she have then?','77',['58','235','71'],'First find the new stickers: 6 × 5 = 30. Then add the original 47: 47 + 30 = 77.'),
 q('A pump moves 84 gallons in 7 minutes at a constant rate. How many gallons does it move each minute?','12 gallons',['7 gallons','77 gallons','588 gallons'],'Divide total gallons by minutes: 84 ÷ 7 = 12 gallons per minute.'),
 q('20 quarts = ____ gallons','5',['80','4','10'],'One gallon contains 4 quarts. 20 ÷ 4 = 5 gallons.'),
 q('The segment shown goes from the center to the edge. What is the diameter?','18 inches',['4.5 inches','9 inches','36 inches'],'The radius is 9 inches. A diameter is twice the radius: 2 × 9 = 18 inches.',{type:'oct10-radius',radius:9})
 ],[
 q('What is 42,517 in expanded form?','40,000 + 2,000 + 500 + 10 + 7',['400,000 + 2,000 + 500 + 10 + 7','40,000 + 2,000 + 50 + 10 + 7','40,000 + 2 + 5 + 1 + 7'],'Give each digit its value: 40,000, 2,000, 500, 10 and 7.'),
 q('Round 683,942 to the nearest ten thousand.','680,000',['690,000','684,000','683,900'],'The thousands digit is 3, less than 5. Keep 8 in the ten-thousands place and write 680,000.'),
 q('Which fraction names point P?','2/5',['2/6','3/5','5/2'],'Count intervals, not tick marks. P is two of five equal intervals from 0.',nl(5,2)),
 q('Complete the equivalent fractions: 3/4 = ____/12','9',['3','6','8'],'4 × 3 = 12, so multiply the numerator by 3 too: 3 × 3 = 9.'),
 q('A garden has beans on 2/12 of its area and peas on 4/12. What fraction is used altogether? Give the simplest form.','1/2',['6/24','1/3','2/3'],'2/12 + 4/12 = 6/12 = 1/2. The denominator stays 12 before simplifying.'),
 q('Multiply: 43 × 23','989',['969','929','986'],'43 × 20 = 860 and 43 × 3 = 129. Total: 989.'),
 q('Owen buys 18 ounces of cheese at $0.35 per ounce. How much does he pay?','$6.30',['$63.00','$5.30','$6.03'],'18 × 35 cents = 630 cents, or $6.30.'),
 q('There are 206 beads. Put 9 beads in each full bag. How many beads are left after filling as many bags as possible?','8',['22','9','17'],'22 × 9 = 198. The remainder is 206 − 198 = 8 beads.'),
 q('Noah has 38 cards and buys 4 packs with 7 cards each. Which calculation finds his new total?','38 + 4 × 7',['(38 + 4) × 7','38 × 4 + 7','38 + 4 + 7'],'The packs add 4 × 7 cards. Add these to the 38 he already has.'),
 q('A machine makes 96 buttons in 8 minutes. At that rate, how long does it take to make 12 buttons?','1 minute',['8 minutes','12 minutes','88 minutes'],'96 ÷ 8 = 12 buttons per minute. Making 12 buttons takes 1 minute.'),
 q('3 gallons = ____ pints','24',['12','6','48'],'Each gallon is 4 quarts, and each quart is 2 pints: 3 × 4 × 2 = 24 pints.'),
 q('A rectangle is 13 inches long and 7 inches wide. What is its perimeter?','40 inches',['91 inches','20 inches','26 inches'],'Perimeter goes around all four sides: 13 + 7 + 13 + 7 = 40 inches.')
 ],[
 q('Which expression equals 64,283?','6 × 10,000 + 4 × 1,000 + 2 × 100 + 8 × 10 + 3',['6 × 10,000 + 4 × 100 + 2 × 100 + 8 × 10 + 3','6 × 10,000 + 4 × 1,000 + 2 × 10 + 8 × 10 + 3','6 × 1,000 + 4 × 1,000 + 2 × 100 + 8 × 10 + 3'],'64,283 has 6 ten-thousands, 4 thousands, 2 hundreds, 8 tens and 3 ones.'),
 q('Which number rounds to 520,000 to the nearest ten thousand?','524,180',['525,180','514,180','535,180'],'524,180 is below 525,000, so it rounds down to 520,000. The other choices round to 530,000, 510,000 and 540,000.'),
 q('What fraction is at point P?','5/6',['5/7','1/6','6/5'],'The whole has six equal intervals. P is five intervals from 0: 5/6.',nl(6,5)),
 q('Which fraction is NOT equivalent to 1/2?','3/8',['2/4','3/6','4/8'],'2/4, 3/6 and 4/8 all simplify to 1/2. Half of 8 is 4, so 3/8 is not one half.'),
 q('Write 2 3/5 as an improper fraction.','13/5',['5/5','10/5','11/5'],'Two wholes contain 2 × 5 = 10 fifths. Add 3 fifths to get 13/5.'),
 q('Multiply: 27 × 34','918',['908','818','948'],'27 × 30 = 810 and 27 × 4 = 108. Add to get 918.'),
 q('A swimmer takes 27.58 seconds for one length and 31.26 seconds for the next. What is the exact total time?','58.84 seconds',['59.00 seconds','58.74 seconds','57.84 seconds'],'Line up the decimal points: 27.58 + 31.26 = 58.84. The question asks for the exact total, not an estimate.'),
 q('A teacher shares 239 counters into groups of 7. How many counters remain after making all the full groups?','1',['34','7','6'],'34 × 7 = 238, leaving 239 − 238 = 1 counter.'),
 q('A box contains 4 trays. Each tray holds 3 packs of 6 eggs. How many eggs are in the box?','72',['13','24','54'],'Each tray has 3 × 6 = 18 eggs. Four trays contain 4 × 18 = 72 eggs.'),
 q('There are 7 teams with 6 children on each team. The total is c. Which equation represents this?','c ÷ 6 = 7',['c + 6 = 7','c − 6 = 7','c × 6 = 7'],'Dividing the total children into groups of 6 gives 7 teams. Therefore c ÷ 6 = 7, and c = 42.'),
 q('4 yards = ____ inches','144',['48','12','108'],'Each yard has 3 feet, each with 12 inches. 4 × 3 × 12 = 144 inches.'),
 q('The segment shown is the radius. What is the diameter?','22 inches',['5.5 inches','11 inches','44 inches'],'A diameter has two radii: 11 + 11 = 22 inches.',{type:'oct10-radius',radius:11})
 ],[
 q('Which expression equals 73.406?','70 + 3 + 4/10 + 6/1000',['70 + 3 + 4/100 + 6/1000','70 + 3 + 4/10 + 6/100','700 + 3 + 4/10 + 6/1000'],'73.406 = 70 + 3 + 0.4 + 0.006. There are zero hundredths.'),
 q('Round 357,261 to the nearest ten thousand.','360,000',['350,000','357,000','357,300'],'The thousands digit is 7, so round up to 360,000.'),
 q('Point P names which fraction?','3/8',['3/9','5/8','8/3'],'There are eight equal intervals in one whole; P is three intervals from 0.',nl(8,3)),
 q('Which fraction is equivalent to 4/5?','12/15',['8/15','4/15','12/5'],'Multiply top and bottom by 3: 4/5 = 12/15.'),
 q('Multiply: 1/4 × 3/7','3/28',['4/11','3/11','3/14'],'Multiply the numerators and denominators separately: (1 × 3)/(4 × 7) = 3/28.'),
 q('Multiply: 32 × 26','832',['812','732','862'],'32 × 20 = 640; 32 × 6 = 192. Their sum is 832.'),
 q('A bag contains 24 ounces of seeds costing $0.30 per ounce. What is the total cost?','$7.20',['$72.00','$6.20','$7.02'],'24 × 30 cents = 720 cents = $7.20.'),
 q('A jug holds 254 ounces of lemonade. After filling as many 9-ounce cups as possible, how much is left for a partly filled cup?','2 ounces',['28 ounces','9 ounces','11 ounces'],'28 × 9 = 252 ounces. The last cup contains 254 − 252 = 2 ounces.'),
 q('Mia has 56 beads. She gets 5 bags with 8 beads each. How many beads does she have now?','96',['69','448','88'],'Five bags add 5 × 8 = 40 beads. 56 + 40 = 96.'),
 q('A printer makes 108 labels in 9 minutes. How many labels does it make per minute?','12',['9','99','972'],'The rate is 108 ÷ 9 = 12 labels per minute.'),
 q('28 pints = ____ quarts','14',['56','7','24'],'Two pints make a quart. Divide 28 by 2 to get 14 quarts.'),
 q('A rectangular garden is 12 feet long and 8 feet wide. What is its area?','96 square feet',['40 square feet','20 square feet','88 square feet'],'Area = length × width = 12 × 8 = 96 square feet. Adding the sides would find perimeter, not area.')
 ],[
 q('In 58,246, what is the value of the digit 8?','8,000',['800','80','8'],'The 8 is in the thousands place, so its value is 8,000.'),
 q('Which number rounds to 740,000 to the nearest ten thousand?','736,582',['734,582','746,582','724,582'],'736,582 is at least 735,000 and below 745,000, so it rounds to 740,000.'),
 q('What fraction is at point P?','4/5',['4/6','1/5','5/4'],'P is four of the five equal intervals from 0, so it is 4/5.',nl(5,4)),
 q('Complete: 5/6 = ____/18','15',['10','5','12'],'The denominator is multiplied by 3, so multiply 5 by 3 too: 15.'),
 q('A jug has 9/10 liter of juice. Sam pours out 3/10 liter. What fraction of a liter remains? Give the simplest form.','3/5',['6/20','6/7','1/2'],'9/10 − 3/10 = 6/10. Divide top and bottom by 2: 3/5.'),
 q('Multiply: 42 × 24','1,008',['988','1,088','908'],'42 × 20 = 840 and 42 × 4 = 168. Total: 1,008.'),
 q('A runner completes two parts of a course in 34.67 seconds and 23.58 seconds. What is the exact total?','58.25 seconds',['57.25 seconds','58.15 seconds','59.00 seconds'],'Align the decimal points: 34.67 + 23.58 = 58.25 seconds. Regroup the hundredths and tenths.'),
 q('There are 227 shells. Fill boxes with 8 shells each. How many shells will be left outside the full boxes?','3',['28','8','11'],'28 full boxes hold 224 shells. 227 − 224 = 3 shells remain.'),
 q('A toy costs $7. Ava buys 5 toys and pays $40. Which expression finds her change?','40 − 5 × 7',['40 + 5 × 7','(40 − 5) × 7','40 − 5 − 7'],'First find the total price, 5 × 7 = 35 dollars. Subtract it from $40 to find $5 change.'),
 q('A model is 7 centimeters tall. A sculpture is n times as tall. Which equation gives its height h in centimeters?','h = 7n',['h = 7 + n','h = 7 ÷ n','h = n − 7'],'“n times” means multiply: h = 7 × n = 7n.'),
 q('5 pounds = ____ ounces','80',['21','60','32'],'Each pound is 16 ounces. 5 × 16 = 80 ounces.'),
 q('A circle has a diameter of 18 inches. What is its radius?','9 inches',['36 inches','18 inches','6 inches'],'The radius is half the diameter: 18 ÷ 2 = 9 inches.')
 ],[
 q('Which expression equals 86,359?','80,000 + 6,000 + 300 + 50 + 9',['80,000 + 600 + 300 + 50 + 9','800,000 + 6,000 + 300 + 50 + 9','80,000 + 6 + 3 + 5 + 9'],'The digits represent 8 ten-thousands, 6 thousands, 3 hundreds, 5 tens and 9 ones.'),
 q('Round 912,648 to the nearest ten thousand.','910,000',['920,000','913,000','912,600'],'The thousands digit is 2, so round down to 910,000.'),
 q('What fraction names point P?','5/8',['5/9','3/8','8/5'],'The whole has eight equal intervals. P is five intervals from 0.',nl(8,5)),
 q('Which fraction is NOT equivalent to 2/3?','4/9',['4/6','6/9','8/12'],'4/6, 6/9 and 8/12 simplify to 2/3. For ninths, 2/3 equals 6/9, not 4/9.'),
 q('Write 3 2/7 as an improper fraction.','23/7',['5/7','21/7','22/7'],'Three wholes make 21 sevenths. Add 2 sevenths to get 23/7.'),
 q('Multiply: 34 × 27','918',['898','818','938'],'34 × 20 = 680 and 34 × 7 = 238. Add them: 918.'),
 q('A customer buys 22 ounces of fruit at $0.40 per ounce. What is the total price?','$8.80',['$88.00','$8.08','$7.80'],'22 × 40 cents = 880 cents = $8.80.'),
 q('A container has 263 ounces of juice. Fill as many 6-ounce cups as possible. How much juice is in the partly filled last cup?','5 ounces',['43 ounces','6 ounces','11 ounces'],'43 × 6 = 258 ounces in full cups. The last cup holds 263 − 258 = 5 ounces.'),
 q('A box has 5 trays. Each tray contains 3 packs with 4 markers in each pack. How many markers are in the box?','60',['12','20','47'],'Each tray has 3 × 4 = 12 markers. Five trays have 5 × 12 = 60.'),
 q('A machine packs 132 crayons in 11 minutes. How many crayons does it pack per minute?','12',['11','121','1,452'],'132 ÷ 11 = 12 crayons per minute.'),
 q('6 gallons = ____ quarts','24',['12','48','10'],'Each gallon contains 4 quarts: 6 × 4 = 24 quarts.'),
 q('A rectangle is 14 inches long and 6 inches wide. What is its perimeter?','40 inches',['84 inches','20 inches','28 inches'],'Add all four sides: 14 + 6 + 14 + 6 = 40 inches.')
 ]
 ];
 const labels=Array.from({length:6},(_,i)=>'Day '+(i+1));
 // Fixed blueprint, with rotating positions to avoid a repeated answer-letter pattern.
 sets.forEach((items,day)=>{
  const questions=items.map((item,i)=>{const correct=(day*3+i)%4,choices=[...item.wrong];choices.splice(correct,0,item.answer);return {source:i+1,sourceLabel:'Original STAR mistake skills',skill:skills[i],prompt:item.prompt,choices,correct,explanation:item.explanation,visual:item.visual};});
  // Mix topics, keeping the same blueprint on all six days.
  const orders=[[0,2,5,10,3,6,1,8,4,11,7,9],[2,0,10,5,3,8,6,1,11,4,9,7],[5,3,0,8,10,2,7,11,1,6,9,4],[0,5,2,10,8,3,11,6,1,9,4,7],[3,0,5,11,2,8,10,6,4,1,7,9],[2,5,0,10,3,8,1,11,6,4,9,7]];
  window.HARRY_SEPT_PRACTICE.push({id:'week-oct12-'+(day+1),group:'week-2026-10-12',cardLabel:labels[day],weekly:true,title:labels[day],description:'12 fresh questions based on recurring original STAR Math mistakes. Work on paper, then choose an answer. One point for a correct first answer; one retry after a miss. No timer.',questions:orders[day].map(i=>questions[i])});
 });
 window.HARRY_STAR_GROUPS.unshift({id:'week-2026-10-12',title:'October 12–17 · Accuracy week',label:'New · Six daily sets',unit:'Day',description:'12 questions each day, with the same core skill mix and broadly similar difficulty. See daily first-try scores side by side. These are practice indicators, not standardized STAR scores.'});
})();
