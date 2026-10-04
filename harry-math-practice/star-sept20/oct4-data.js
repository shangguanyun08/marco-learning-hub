(function(){
  'use strict';
  const skills={6:'Write an equation from words',7:'Gallons to pints',8:'Match an equation to a table',12:'Equivalent ratios',15:'Earnings and hours',17:'Expanded decimals',23:'Divide decimals',25:'Read a box plot',27:'Multiplicative relationships',29:'Perpendicular lines',31:'Add and simplify fractions',32:'Mixed numbers to improper fractions',34:'Add weights from a line plot'};
  const q=(source,prompt,choices,correct,explanation,visual)=>({source,skill:skills[source],prompt,choices,correct,explanation,visual});
  const tables=(xs,ys)=>({type:'choice-tables',xs,ys});
  const boxes=(sets,start,end,title='Scores')=>({type:'boxplots',sets,start,end,title});
  const pairs=sets=>({type:'line-pairs',sets});
  const originalPairs=[[[180,15,240,205],[120,190,230,30]],[[100,110,400,25],[100,110,400,195]],[[140,200,250,20],[100,140,410,110]],[[220,30,220,195],[100,100,410,100]]];
  const perpendicular=[[[120,190,320,30],[150,20,278,180]],[[110,70,400,70],[110,150,400,150]],[[130,180,310,20],[140,20,220,180]],[[100,100,400,30],[100,100,400,170]]];
  const weights=(labels,counts,title)=>({type:'weight-plot',labels,counts,title});
  const original=[
    q(6,'The number of skiers, k, that visited a mountain one day was 8 less than 11 times the number of snowboarders, b, that visited. Which equation represents the relationship between the number of skiers and the number of snowboarders that visited the mountain that day?',['k = 11b − 8','b = 8k − 11','b = 11k + 8','k = 8 − 11b'],0,'Start with b snowboarders. Eleven times that is 11b. Eight less means subtract 8. The number of skiers is k = 11b − 8.'),
    q(7,'How many pints are in 1 gallon?',['4 pt','8 pt','12 pt','16 pt'],1,'1 gallon = 4 quarts. Each quart = 2 pints, so 4 × 2 = 8 pints.'),
    q(8,'Which table was created using the equation y = 2x − 1?',['Table A','Table B','Table C','Table D'],0,'Double each input and subtract 1. Inputs 3, 4, 5, 6, 7, 8 give outputs 5, 7, 9, 11, 13, 15. Every row must follow the rule.',tables([3,4,5,6,7,8],[[5,7,9,11,13,15],[22,23,25,27,28,29],[22,23,24,25,26,27],[5,7,13,15,17,19]])),
    q(12,'Which ratio is equivalent to the ratio 32:40?',['16 to 20','30:16','16 to 30','20:16'],0,'Divide BOTH parts by 2: 32 ÷ 2 = 16 and 40 ÷ 2 = 20. The order stays the same, so 16 to 20 is equivalent.'),
    q(15,'Fala wants to purchase a video game system that costs $309. She earns $12 for each hour that she works at her father’s hardware store. How many hours will Fala need to work to earn enough money to purchase the video game system?',['15.75 hr','27.25 hr','25.75 hr','26.75 hr'],2,'Hours = cost ÷ hourly pay. 309 ÷ 12 = 25.75 hours. Check: 25 × 12 = 300 and 0.75 × 12 = 9; together that is $309.'),
    q(17,'What is (8 × 10) + (3 × 1) + (2 × 1/10) + (9 × 1/100) + (7 × 1/1000) written in standard form?',['83.279','830.297','83.297','83.972'],2,'The parts are 80 + 3 + 0.2 + 0.09 + 0.007 = 83.297. Keep tenths, hundredths, and thousandths in order.'),
    q(23,'5.04 ÷ 0.7 = ____',['72','4.97','3.5','7.2'],3,'Multiply BOTH numbers by 10: 5.04 ÷ 0.7 = 50.4 ÷ 7 = 7.2. Check: 7.2 × 0.7 = 5.04.'),
    q(25,'A sixth-grade class had a bowling party. Below are the scores of the 7 students who bowled: 60, 58, 82, 68, 70, 78, 56. Which box plot represents the data?',['Box plot A','Box plot B','Box plot C','Box plot D'],3,'Put the scores in order: 56, 58, 60, 68, 70, 78, 82. The middle is 68. Excluding that middle score, the lower-half middle is 58 and the upper-half middle is 78. The five values are 56, 58, 68, 78, 82: plot D.',boxes([[56,60,65,70,82],[56,62,69,76,82],[45,56,68,82,90],[56,58,68,78,82]],40,90,'Bowling Scores')),
    q(27,'A waterfall is n times the height of its picture on a postcard. Which equation represents the height, y, of the waterfall if the picture is 6 cm tall?',['y = 6 ÷ n','y = 6 + n','y = 6n','y = n − 6'],2,'“n times” means multiply by n. A height of 6 multiplied by n is y = 6n, not 6 + n.'),
    q(29,'Which lines appear to be perpendicular?',['Pair A','Pair B','Pair C','Pair D'],3,'Perpendicular lines meet at a right angle (90°). Pair D has a vertical and a horizontal line meeting at a square corner.',pairs(originalPairs)),
    q(31,'A farmer plants potatoes on 1/36 of his land. He plants peas on 5/36 of his land. What fraction of the farm’s land do potatoes and peas cover? Simplify the answer if possible.',['1/9','1/12','1/18','1/6'],3,'The denominators match, so add the numerators: 1/36 + 5/36 = 6/36. Divide the top and bottom by 6 to get 1/6.'),
    q(32,'Which improper fraction is the same as 4 3/7?',['15/7','33/7','29/7','31/7'],3,'Four wholes make 4 × 7 = 28 sevenths. Add the remaining 3 sevenths: 28 + 3 = 31, so the fraction is 31/7.'),
    q(34,'Hugo picked some peaches from his tree. He weighed each of the peaches. The results are shown in the line plot. What is the total weight of the two heaviest peaches?',['3 3/4 pounds','1 5/8 pounds','2 3/4 pounds','2 5/8 pounds'],3,'The two heaviest peaches weigh 1 3/8 and 1 2/8 pounds. Add the wholes and eighths: 1 + 1 = 2 and 3/8 + 2/8 = 5/8. Total: 2 5/8 pounds.',weights(['5/8','6/8','7/8','1','1 1/8','1 2/8','1 3/8'],[1,1,0,1,3,1,1],'Weight of Peaches (pounds)'))
  ];
  const a=[
    q(6,'The number of adults, a, at a fair was 5 less than 3 times the number of children, c. Which equation represents this relationship?',['a = 5 − 3c','a = 3c − 5','c = 3a − 5','a = 3c + 5'],1,'Three times the number of children is 3c. Five less is 3c − 5, so a = 3c − 5.'),
    q(7,'How many pints are in 3 gallons?',['12 pt','6 pt','24 pt','48 pt'],2,'Each gallon has 8 pints. 3 × 8 = 24 pints.'),
    q(8,'Which table was created using the equation y = 3x + 2?',['Table A','Table B','Table C','Table D'],2,'Multiply each input by 3, then add 2. Inputs 1, 2, 3, 4 give 5, 8, 11, 14.',tables([1,2,3,4],[[3,4,5,6],[1,4,7,10],[5,8,11,14],[5,7,9,11]])),
    q(12,'Which ratio is equivalent to 18:30?',['15:9','9:30','18:15','9:15'],3,'Divide each part by 2. 18:30 becomes 9:15.'),
    q(15,'Lena wants a bicycle that costs $234. She earns $12 per hour. How many hours must she work to earn $234?',['19.5 hr','18.5 hr','20.5 hr','29.5 hr'],0,'234 ÷ 12 = 19.5. Check: 19 × 12 = 228 and half an hour earns $6; 228 + 6 = 234.'),
    q(17,'Write (4 × 10) + (6 × 1) + (5 × 1/10) + (2 × 1/100) + (9 × 1/1000) in standard form.',['46.592','46.529','460.529','46.259'],1,'40 + 6 + 0.5 + 0.02 + 0.009 = 46.529.'),
    q(23,'4.32 ÷ 0.6 = ____',['0.72','72','7.2','3.72'],2,'Scale both numbers by 10: 43.2 ÷ 6 = 7.2.'),
    q(25,'Seven students scored 30, 22, 40, 26, 34, 20, 38 points. Which box plot represents their scores?',['Box plot A','Box plot B','Box plot C','Box plot D'],0,'Ordered scores: 20, 22, 26, 30, 34, 38, 40. The five-number summary is 20, 22, 30, 38, 40.',boxes([[20,22,30,38,40],[20,26,30,34,40],[20,22,34,38,40],[15,22,30,38,45]],10,50)),
    q(27,'A tree is n times as tall as its 8-centimeter picture. Which equation gives the tree’s height y in centimeters?',['y = 8 + n','y = n − 8','y = 8 ÷ n','y = 8n'],3,'Multiply the picture’s height by n: y = 8 × n = 8n.'),
    q(29,'Which pair of lines appears to be perpendicular?',['Pair A','Pair B','Pair C','Pair D'],0,'Perpendicular lines meet at 90°. A right angle can be tilted; its sides do not have to be horizontal and vertical.',pairs(perpendicular)),
    q(31,'A gardener uses 3/24 of a garden for carrots and 5/24 for peas. What fraction is used altogether? Give the simplest form.',['1/4','1/3','1/6','2/3'],1,'3/24 + 5/24 = 8/24. Divide both numbers by 8 to get 1/3.'),
    q(32,'Which improper fraction is equal to 3 2/5?',['11/5','15/5','17/5','19/5'],2,'3 × 5 + 2 = 17. Keep the denominator 5: 17/5.'),
    q(34,'The line plot shows the weights of some bags of apples. What is the total weight of the two heaviest bags?',['3 1/4 pounds','2 3/4 pounds','3 3/4 pounds','3 1/2 pounds'],0,'The two heaviest are 1 3/4 and 1 2/4 pounds. Their sum is 2 5/4 = 3 1/4 pounds.',weights(['1/4','2/4','3/4','1','1 1/4','1 2/4','1 3/4'],[1,2,0,1,3,1,1],'Weight of Apple Bags (pounds)'))
  ];
  const b=[
    q(6,'The number of red beads, r, is 7 less than 4 times the number of blue beads, b. Which equation represents the number of red beads?',['r = 7 − 4b','b = 4r − 7','r = 4b + 7','r = 4b − 7'],3,'Four times b is 4b. Subtract 7 to get r = 4b − 7.'),
    q(7,'How many pints are in 2 gallons?',['16 pt','8 pt','4 pt','32 pt'],0,'2 gallons × 8 pints per gallon = 16 pints.'),
    q(8,'Which table was created using the equation y = 4x − 3?',['Table A','Table B','Table C','Table D'],1,'Multiply by 4 and subtract 3: inputs 2, 3, 4, 5 give 5, 9, 13, 17.',tables([2,3,4,5],[[5,8,11,14],[5,9,13,17],[11,15,19,23],[1,2,3,4]])),
    q(12,'Which ratio is equivalent to 28:42?',['21:14','14:42','14:21','28:21'],2,'Divide both parts by 2: 28:42 = 14:21.'),
    q(15,'Owen is saving $275 for a musical instrument. He earns $10 per hour. How many hours will he need to work?',['2.75 hr','25.5 hr','28.5 hr','27.5 hr'],3,'275 ÷ 10 = 27.5 hours. Check by multiplying 27.5 × 10 = 275.'),
    q(17,'Write (7 × 10) + (2 × 1) + (4 × 1/10) + (8 × 1/100) + (6 × 1/1000) in standard form.',['72.486','72.468','720.486','72.846'],0,'70 + 2 + 0.4 + 0.08 + 0.006 = 72.486.'),
    q(23,'6.72 ÷ 0.8 = ____',['84','8.4','0.84','5.92'],1,'Multiply both numbers by 10: 67.2 ÷ 8 = 8.4.'),
    q(25,'Seven students scored 50, 42, 60, 46, 54, 40, 58 points. Which box plot matches these scores?',['Box plot A','Box plot B','Box plot C','Box plot D'],2,'Order: 40, 42, 46, 50, 54, 58, 60. The five-number summary is 40, 42, 50, 58, 60.',boxes([[40,46,50,54,60],[35,42,50,58,65],[40,42,50,58,60],[40,42,54,58,60]],30,70)),
    q(27,'A building is n times the height of its 9-centimeter model. Which equation gives the real height y in centimeters?',['y = 9n','y = 9 + n','y = 9 ÷ n','y = n − 9'],0,'“n times” tells you to multiply: y = 9 × n = 9n.'),
    q(29,'Which pair of lines appears to be perpendicular?',['Pair A','Pair B','Pair C','Pair D'],2,'In pair C, the lines meet at a right angle. Parallel lines never meet; the other pairs do not make a 90° corner.',pairs([perpendicular[2],perpendicular[1],perpendicular[0],perpendicular[3]])),
    q(31,'A farmer uses 2/30 of a field for beans and 7/30 for corn. What fraction is used altogether? Give the simplest form.',['1/3','9/60','3/5','3/10'],3,'2/30 + 7/30 = 9/30. Divide the numerator and denominator by 3: 3/10.'),
    q(32,'Which improper fraction is equal to 5 3/8?',['40/8','43/8','23/8','45/8'],1,'5 × 8 + 3 = 43. The denominator stays 8, giving 43/8.'),
    q(34,'The line plot shows melon weights. What is the total weight of the two heaviest melons?',['5 1/4 pounds','4 3/4 pounds','4 5/8 pounds','4 1/2 pounds'],2,'The two heaviest weigh 2 3/8 and 2 2/8 pounds. Add to get 4 5/8 pounds.',weights(['1 5/8','1 6/8','1 7/8','2','2 1/8','2 2/8','2 3/8'],[1,1,2,1,3,1,1],'Weight of Melons (pounds)'))
  ];
  const c=[
    q(6,'The number of yellow flowers, y, is 9 less than 6 times the number of purple flowers, p. Which equation gives y?',['y = 9 − 6p','y = 6p + 9','y = 6p − 9','p = 6y − 9'],2,'Six times p gives 6p. Nine less means subtract 9: y = 6p − 9.'),
    q(7,'How many pints are in 5 gallons?',['20 pt','10 pt','80 pt','40 pt'],3,'Each gallon holds 8 pints. 5 × 8 = 40 pints.'),
    q(8,'Which table was created using the equation y = 2x + 3?',['Table A','Table B','Table C','Table D'],3,'Double each input, then add 3. Inputs 1, 2, 3, 4 give 5, 7, 9, 11.',tables([1,2,3,4],[[3,5,7,9],[5,8,11,14],[4,5,6,7],[5,7,9,11]])),
    q(12,'Which ratio is equivalent to 36:48?',['18:24','24:18','18:48','36:24'],0,'Divide both parts by 2. 36:48 becomes 18:24, with the same order.'),
    q(15,'Mia wants to buy equipment costing $318. She earns $12 per hour. How many hours must she work to earn that amount?',['25.5 hr','26.5 hr','27.5 hr','16.5 hr'],1,'318 ÷ 12 = 26.5 hours. 26 × 12 = 312 and half an hour earns $6 more.'),
    q(17,'Write (5 × 10) + (8 × 1) + (3 × 1/10) + (6 × 1/100) + (2 × 1/1000) in standard form.',['58.326','580.362','58.632','58.362'],3,'50 + 8 + 0.3 + 0.06 + 0.002 = 58.362.'),
    q(23,'3.15 ÷ 0.5 = ____',['6.3','63','0.63','2.65'],0,'Scale both numbers by 10: 31.5 ÷ 5 = 6.3.'),
    q(25,'Seven students scored 70, 62, 80, 66, 74, 60, 78 points. Which box plot represents these scores?',['Box plot A','Box plot B','Box plot C','Box plot D'],1,'In order: 60, 62, 66, 70, 74, 78, 80. The five-number summary is 60, 62, 70, 78, 80.',boxes([[60,66,70,74,80],[60,62,70,78,80],[55,62,70,78,85],[60,62,74,78,80]],50,90)),
    q(27,'A tower is n times the height of its 7-centimeter model. Which equation gives the tower’s height y in centimeters?',['y = 7 + n','y = 7n','y = n − 7','y = 7 ÷ n'],1,'Multiply the model height by n: y = 7n.'),
    q(29,'Which pair of lines appears to be perpendicular?',['Pair A','Pair B','Pair C','Pair D'],1,'Pair B makes a 90° angle. Tilting a right angle does not change its size.',pairs([perpendicular[3],perpendicular[0],perpendicular[1],perpendicular[2]])),
    q(31,'A gardener uses 5/42 of a garden for lettuce and 9/42 for carrots. What fraction is used altogether? Give the simplest form.',['1/6','2/3','1/3','1/7'],2,'5/42 + 9/42 = 14/42. Divide both parts by 14 to get 1/3.'),
    q(32,'Which improper fraction is equal to 6 2/9?',['56/9','54/9','20/9','58/9'],0,'6 × 9 = 54 ninths in the whole-number part. Add 2 to get 56/9.'),
    q(34,'The line plot shows weights of bags of nuts. What is the total weight of the two heaviest bags?',['3 1/2 pounds','2 3/4 pounds','3 3/4 pounds','3 1/4 pounds'],3,'The heaviest bag weighs 1 3/4 pounds and the next weighs 1 2/4. Their sum is 2 5/4, or 3 1/4 pounds.',weights(['1/4','2/4','3/4','1','1 1/4','1 2/4','1 3/4'],[2,1,1,2,1,1,1],'Weight of Nut Bags (pounds)'))
  ];
  const mix=(items,order)=>order.map(i=>items[i]);
  const sets=[original,mix(a,[3,9,1,6,11,4,8,0,10,7,2,12,5]),mix(b,[6,2,10,4,0,12,7,3,9,5,11,1,8]),mix(c,[11,5,8,7,1,3,12,9,4,2,6,10,0])];
  ['oct4-original','oct4-a','oct4-b','oct4-c'].forEach((id,i)=>window.HARRY_SEPT_PRACTICE.push({id,group:'2026-10-04',original:i===0,title:`Session ${i+1} · October 4 ${i?'fresh check '+String.fromCharCode(64+i):'original retry'}`,description:i?'13 fresh questions, one for each skill from the October 4 mistakes. Work independently; your first try earns the point.':'The 13 missed questions from the October 4 STAR Math recording. Original prompts, choices, tables and diagrams are rebuilt without showing Harry’s test selections.',questions:sets[i]}));
  window.HARRY_STAR_GROUPS.forEach(g=>{if(g.label.startsWith('Latest'))g.label='Previous practice';});
  window.HARRY_STAR_GROUPS.unshift({id:'2026-10-04',title:'Sunday, October 4, 2026',label:'Latest test',unit:'Session',description:'34 recorded questions checked: 21 correct choices and 13 wrong. Four sessions of 13 questions: original retry plus three fresh skill-matched checks.'});
})();
