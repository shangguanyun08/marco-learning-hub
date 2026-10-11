(function(){
  'use strict';
  const skills={1:'Name an angle',6:'Round to ten thousands',10:'Hundreds, tens and ones',14:'Find a total cost',17:'Fractions on a number line',19:'Multiply money',22:'Interpret a remainder',25:'Place-value expressions',27:'Find an unknown total',29:'Multiply equal groups',30:'Expanded form',32:'Radius and diameter',33:'Add decimal times',34:'Multiply fractions'};
  const q=(source,prompt,choices,correct,explanation,visual)=>({source,skill:skills[source],prompt,choices,correct,explanation,visual});
  const angle=degrees=>({type:'oct10-angle',degrees});
  const numberline=shapes=>({type:'oct10-numberline',shapes});
  const circle=radius=>({type:'oct10-radius',radius});
  const original=[
    q(1,'What type of angle is shown?',['right angle','obtuse angle','acute angle'],2,'An acute angle is smaller than a right angle (90°). The marked opening is smaller than a square corner.',angle(60)),
    q(6,'What is 703,937 rounded to the ten thousands place?',['710,000','700,000','703,900','704,000'],1,'The ten-thousands digit is 0. The next digit, in the thousands place, is 3. Since 3 is less than 5, round down to 700,000.'),
    q(10,'693 = ______',['600 hundreds + 9 tens + 3 ones','6 hundreds + 3 tens + 9 ones','600 hundreds + 30 tens + 9 ones','6 hundreds + 9 tens + 3 ones'],3,'693 = 600 + 90 + 3, or 6 hundreds + 9 tens + 3 ones. Be careful: 600 hundreds means 60,000, not 600.'),
    q(14,'Harry buys 15 ounces of the cheese. The cost of the cheese is $0.50 per ounce. How much money does he spend on the cheese?',['$10.50','$7.20','$5.20','$7.50'],3,'Multiply the number of ounces by the cost per ounce: 15 × $0.50 = $7.50.'),
    q(17,'Which shape is at 1/4 on the number line?',['Circle','Star','Square'],1,'The distance from 0 to 1 is split into four equal parts. The first tick after 0 is 1/4, where the star is.',numberline(['Star','Circle','Square'])),
    q(19,'Nara buys 20 ounces of dried cherries in bulk. If dried cherries cost $0.55 per ounce, how much will she pay?',['$18.90','$110.00','$0.11','$11.00'],3,'20 × 55 cents = 1,100 cents. Divide by 100 to write dollars: $11.00.'),
    q(22,'Pam has 228 ounces of lemonade. She pours the lemonade into 8-ounce cups, filling as many as she can until all the lemonade is gone. The last cup is not completely full. How much lemonade is in the last cup?',['4 ounces','8 ounces','12 ounces','3 ounces'],0,'28 full cups use 28 × 8 = 224 ounces. The last cup holds the remainder: 228 − 224 = 4 ounces. A partly filled 8-ounce cup must hold less than 8 ounces.'),
    q(25,'Which expression is another way to write 71,426?',['7 × 10,000 + 1 × 100 + 4 × 100 + 2 × 10 + 6','7 × 10,000 + 1 × 1,000 + 4 × 100 + 2 × 10 + 6','7 × 10,000 + 1 × 1,000 + 4 × 10 + 2 × 10 + 6','7 × 10,000 + 1 × 100 + 4 × 10 + 2 × 10 + 6 × 10'],1,'Read each digit by its place: 7 ten-thousands, 1 thousand, 4 hundreds, 2 tens and 6 ones. Together: 70,000 + 1,000 + 400 + 20 + 6.'),
    q(27,'A class is divided into teams for small group work. There are six teams and each has five students. Use the equation s/5 = 6 to find the total number of students in the class.',['11 students','25 students','30 students','36 students'],2,'Six teams with 5 students on each team means 6 × 5 = 30 students. Check: 30 ÷ 5 = 6.'),
    q(29,'A small plane can carry 25 passengers per trip. How many passengers can be carried in 11 trips?',['250','275','285','325'],1,'25 × 11 = 25 × 10 + 25 × 1 = 250 + 25 = 275 passengers.'),
    q(30,'What is 63,244 in expanded form?',['600,000 + 30,000 + 2,000 + 40 + 4','60,000 + 3 + 2 + 4 + 4','3,000 + 200 + 40 + 4','60,000 + 3,000 + 200 + 40 + 4'],3,'Each digit keeps its place value: 6 ten-thousands, 3 thousands, 2 hundreds, 4 tens and 4 ones. Add 60,000 + 3,000 + 200 + 40 + 4.'),
    q(32,'What is the diameter of the circle?',['6 inches','24 inches','26 inches','48 inches'],1,'The labeled segment goes from the center to the edge, so it is the radius. A diameter crosses the entire circle through the center: 2 × 12 = 24 inches.',circle(12)),
    q(33,'Abram competed in a 100-meter swimming race. He swam the first 50 meters in 29.65 seconds. He swam the second 50 meters in 30.24 seconds. How long did it take Abram to complete the race?',['59.89 seconds','60.00 seconds','58.89 seconds','59.79 seconds'],0,'Add the two times, keeping the decimal points lined up: 29.65 + 30.24 = 59.89 seconds. The question asks for the exact time, not an estimate.'),
    q(34,'Multiply: 1/10 × 17/18',['17/19','17/189','17/200','17/180'],3,'Multiply the numerators: 1 × 17 = 17. Multiply the denominators: 10 × 18 = 180. The product is 17/180, already in simplest form.')
  ];
  const a=[
    q(1,'What type of angle is shown?',['acute angle','right angle','obtuse angle'],2,'The marked angle is wider than 90° but smaller than 180°, so it is obtuse.',angle(120)),
    q(6,'What is 468,215 rounded to the ten thousands place?',['460,000','468,000','470,000','500,000'],2,'The thousands digit is 8, so round the ten-thousands digit up: 468,215 becomes 470,000.'),
    q(10,'482 = ______',['4 hundreds + 8 tens + 2 ones','400 hundreds + 8 tens + 2 ones','4 hundreds + 2 tens + 8 ones','4 hundreds + 8 ones + 2 tens'],0,'482 = 400 + 80 + 2: 4 hundreds, 8 tens and 2 ones.'),
    q(14,'Mia buys 14 ounces of cheese at $0.50 per ounce. How much does she spend?',['$0.70','$7.50','$14.50','$7.00'],3,'14 × 50 cents = 700 cents, which is $7.00.'),
    q(17,'Which shape is at 3/4 on the number line?',['Circle','Star','Square'],0,'Three of the four equal intervals bring you to 3/4. The circle is at that tick.',numberline(['Square','Star','Circle'])),
    q(19,'Leo buys 30 ounces of dried apples at $0.45 per ounce. What is the total cost?',['$135.00','$13.50','$1.35','$12.50'],1,'30 × 45 cents = 1,350 cents = $13.50.'),
    q(22,'A jug holds 197 ounces of juice. Ava fills 9-ounce cups, then pours the remaining juice into one last cup. How many ounces are in that partly filled cup?',['8 ounces','9 ounces','21 ounces','7 ounces'],0,'21 full cups hold 21 × 9 = 189 ounces. The remainder is 197 − 189 = 8 ounces, less than one full cup.'),
    q(25,'Which expression is another way to write 52,318?',['5 × 10,000 + 2 × 100 + 3 × 100 + 1 × 10 + 8','5 × 10,000 + 2 × 1,000 + 3 × 10 + 1 × 10 + 8','5 × 10,000 + 2 × 1,000 + 3 × 100 + 1 × 10 + 8','5 × 1,000 + 2 × 1,000 + 3 × 100 + 1 × 10 + 8'],2,'The digits mean 50,000 + 2,000 + 300 + 10 + 8. Match every digit to its place value.'),
    q(27,'There are 7 teams with 4 students on each team. Use s/4 = 7 to find the total number of students.',['11 students','21 students','32 students','28 students'],3,'Multiply 7 teams by 4 students: 7 × 4 = 28. Check: 28 ÷ 4 = 7.'),
    q(29,'A shuttle carries 24 passengers per trip. How many passengers can it carry in 12 trips?',['288','248','280','312'],0,'24 × 12 = 24 × 10 + 24 × 2 = 240 + 48 = 288.'),
    q(30,'What is 48,372 in expanded form?',['40,000 + 8 + 3 + 7 + 2','40,000 + 8,000 + 300 + 70 + 2','400,000 + 80,000 + 300 + 70 + 2','8,000 + 300 + 70 + 2'],1,'The digit values are 40,000, 8,000, 300, 70 and 2. Adding them gives 48,372.'),
    q(32,'What is the diameter of the circle?',['4 inches','12 inches','16 inches','32 inches'],2,'The radius is 8 inches. The diameter is twice the radius: 2 × 8 = 16 inches.',circle(8)),
    q(33,'Nina swims the first half of a race in 28.47 seconds and the second half in 31.36 seconds. What is her exact total time?',['60.00 seconds','59.73 seconds','58.83 seconds','59.83 seconds'],3,'Line up the decimal points and add: 28.47 + 31.36 = 59.83 seconds.'),
    q(34,'Multiply: 1/8 × 5/9',['5/72','6/17','5/64','5/17'],0,'Multiply top by top and bottom by bottom: (1 × 5)/(8 × 9) = 5/72.')
  ];
  const b=[
    q(1,'What type of angle is shown?',['obtuse angle','acute angle','right angle'],1,'The opening is less than 90°, so it is an acute angle.',angle(40)),
    q(6,'What is 835,902 rounded to the ten thousands place?',['830,000','836,000','835,900','840,000'],3,'Look at the thousands digit, 5. Round the ten-thousands digit up from 3 to 4: 840,000.'),
    q(10,'756 = ______',['7 hundreds + 6 tens + 5 ones','700 hundreds + 5 tens + 6 ones','7 hundreds + 5 tens + 6 ones','7 hundreds + 5 ones + 6 tens'],2,'756 is 700 + 50 + 6: 7 hundreds, 5 tens and 6 ones.'),
    q(14,'Ben buys 18 ounces of cheese at $0.50 per ounce. How much does he pay?',['$9.00','$8.50','$18.50','$0.90'],0,'18 half-dollars make 9 dollars: 18 × $0.50 = $9.00.'),
    q(17,'Which shape is at 2/4 on the number line?',['Circle','Star','Square'],2,'Count two of the four equal intervals from 0. The square is at 2/4, halfway between 0 and 1.',numberline(['Circle','Square','Star'])),
    q(19,'Sofia buys 40 ounces of raisins at $0.35 per ounce. How much will she pay?',['$1.40','$140.00','$14.00','$12.00'],2,'40 × 35 cents = 1,400 cents = $14.00.'),
    q(22,'A container holds 251 ounces of lemonade. Sam fills 6-ounce cups and puts the remaining lemonade into a final cup. How many ounces are in the partly filled cup?',['6 ounces','5 ounces','41 ounces','7 ounces'],1,'41 full cups use 41 × 6 = 246 ounces. The last cup holds 251 − 246 = 5 ounces.'),
    q(25,'Which expression is another way to write 83,257?',['8 × 10,000 + 3 × 1,000 + 2 × 100 + 5 × 10 + 7','8 × 10,000 + 3 × 100 + 2 × 100 + 5 × 10 + 7','8 × 10,000 + 3 × 1,000 + 2 × 10 + 5 × 10 + 7','8 × 1,000 + 3 × 1,000 + 2 × 100 + 5 × 10 + 7'],0,'83,257 = 80,000 + 3,000 + 200 + 50 + 7. The 3 represents three thousands, not three hundreds.'),
    q(27,'A club has 8 teams with 6 students on each team. Use s/6 = 8 to find the total number of students.',['14 students','48 students','42 students','56 students'],1,'8 × 6 = 48 students. Dividing 48 students into groups of 6 gives 8 teams.'),
    q(29,'A boat carries 32 passengers per trip. How many passengers can it carry in 13 trips?',['320','406','426','416'],3,'32 × 13 = 32 × 10 + 32 × 3 = 320 + 96 = 416.'),
    q(30,'What is 75,608 in expanded form?',['700,000 + 50,000 + 600 + 8','70,000 + 5 + 6 + 8','70,000 + 5,000 + 600 + 8','5,000 + 600 + 8'],2,'The digits represent 70,000 + 5,000 + 600 + 0 tens + 8. The zero-tens term can be left out.'),
    q(32,'What is the diameter of the circle?',['30 inches','7.5 inches','45 inches','60 inches'],0,'The radius is 15 inches. Double it to find the diameter: 2 × 15 = 30 inches.',circle(15)),
    q(33,'Eli runs one section of a course in 36.78 seconds and the next section in 27.46 seconds. What is his exact total time?',['63.24 seconds','64.24 seconds','64.14 seconds','65.00 seconds'],1,'36.78 + 27.46 = 64.24 seconds. Regroup when the hundredths and tenths add to more than 9.'),
    q(34,'Multiply: 1/6 × 7/11',['7/17','8/66','7/60','7/66'],3,'1 × 7 = 7 and 6 × 11 = 66. The product is 7/66, already in simplest form.')
  ];
  // Same gentle progression in every session; source numbers remain stable for history.
  const order=[1,10,17,32,6,30,25,27,29,14,19,22,33,34];
  [original,a,b].forEach((questions,i)=>window.HARRY_SEPT_PRACTICE.push({id:['oct10-original','oct10-a','oct10-b'][i],group:'2026-10-10',original:i===0,title:`Session ${i+1} · October 10 ${i?'fresh check '+String.fromCharCode(64+i):'original retry'}`,description:i?'14 new questions, one matched to each October 10 mistake. First answers earn points; a second try helps you learn.':'The 14 confirmed missed questions from October 10, arranged from easier foundations to longer calculations. Original test question numbers are retained; diagrams are rebuilt without recorded answer highlights.',questions:order.map(source=>questions.find(item=>item.source===source))}));
  window.HARRY_STAR_GROUPS.forEach(g=>{if(g.label.startsWith('Latest'))g.label='Previous practice';});
  window.HARRY_STAR_GROUPS.unshift({id:'2026-10-10',title:'Saturday, October 10, 2026',label:'Latest test',unit:'Session',description:'All 34 recorded answers checked: 20 correct and 14 wrong. Three sessions of 14 questions: original mistakes, then two fresh skill-matched checks. This is a recording review, not an official STAR score.'});
})();
