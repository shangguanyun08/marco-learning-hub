(function(){
  'use strict';
  const date='2026-09-27';
  const skills={3:'Mixed numbers on a number line',5:'Read a line plot',9:'Expanded multiplication',14:'Subtract with regrouping',22:'Decimals as fractions',25:'Rectangle perimeter',27:'Coordinate points',30:'Yards to inches',33:'Multiply three groups',34:'Improper fractions'};
  function q(source,prompt,choices,correct,explanation,visual){return {source,skill:skills[source],prompt,choices,correct,explanation,visual};}
  const lines=(start,end,den,steps)=>({type:'lines',start,end,den,steps});
  const plot=counts=>({type:'plot',counts,labels:['4','4.25','4.5','4.75','5','5.25','5.5']});
  const rect=(width,height,unit)=>({type:'rectangle',width,height,unit});
  const grid=points=>({type:'coordinates',points});
  const originals=[
    q(3,'Which number line shows a dot at 10 1/6?',['Number line A','Number line B','Number line C','Number line D'],3,'Each whole is divided into 6 equal intervals. 10 1/6 is the first tick after 10, shown on line D.',lines(9,12,6,[11,5,13,7])),
    q(5,'Twenty students measured how far they could jump. The distances in feet are recorded on the line plot. How many more students jumped 5 feet than jumped 4.25 feet?',['8','3','5','2'],1,'Count the marks: 5 students jumped 5 feet and 2 jumped 4.25 feet. The difference is 5 − 2 = 3 students.',plot([1,2,3,4,5,3,2])),
    q(9,'Which expression has the same value as 981 × 3?',['(9 × 3) + (8 × 3) + (1 × 3)','(900 × 3) + (80 × 3) + (1 × 3)','(900 × 3) + (8 × 3) + (1 × 3)','(9 × 3) + (80 × 3) + (1 × 3)'],1,'981 = 900 + 80 + 1. Multiply each place-value part by 3, then add.'),
    q(14,'Subtract: 640,178 − 60,598',['620,420','580,580','579,580','579,680'],2,'640,178 − 60,000 = 580,178. Then subtract 598: 580,178 − 600 + 2 = 579,580.'),
    q(22,'What is 0.75 as a fraction?',['75/100','75/10','75','15/2'],0,'0.75 means 75 hundredths, so it is 75/100 (also equal to 3/4).'),
    q(25,'A classroom board is 32 inches wide and 28 inches tall. Rina is putting ribbon along the outside edge of the board. How many inches of ribbon will she need?',['60 inches','64 inches','136 inches','120 inches'],3,'Ribbon goes around all four sides. The perimeter is 32 + 28 + 32 + 28 = 120 inches.',rect(32,28,'inches')),
    q(27,'What is the letter name of the point (5, −3)?',['R','S','T','U'],0,'The first coordinate moves 5 units right. The second moves 3 units down. That point is R.',grid({R:[5,-3],S:[5,2],T:[-5,3],U:[-5,-2]})),
    q(30,'4 yards = ____ inches',['48','144','51','12'],1,'1 yard = 3 feet and 1 foot = 12 inches, so 1 yard = 36 inches. 4 × 36 = 144 inches.'),
    q(33,'A grocery store manager is ordering eggs. She orders a box of eggs with 5 trays. Each tray has 6 packs of 6 eggs each. How many eggs are in the box?',['84','180','41','27'],1,'Each tray holds 6 × 6 = 36 eggs. Five trays hold 5 × 36 = 180 eggs.'),
    q(34,'15/4 = ____',['3','4 3/4','3 3/4','4'],2,'15 ÷ 4 = 3 remainder 3. The whole number is 3 and the remaining fraction is 3/4, so the answer is 3 3/4.')
  ];
  const a=[
    q(3,'Which number line shows a dot at 3 2/5?',['Number line A','Number line B','Number line C','Number line D'],1,'Each whole has 5 equal intervals. The second tick after 3 is 3 2/5, shown on B.',lines(2,5,5,[6,7,2,12])),
    q(5,'Twenty students recorded their jumping distances in feet. How many more students jumped 4.25 feet than jumped 4.75 feet?',['3','6','4','5'],2,'There are 5 marks at 4.25 feet and 1 at 4.75 feet. 5 − 1 = 4 students.',plot([2,5,3,1,4,3,2])),
    q(9,'Which expression has the same value as 742 × 4?',['(700 × 4) + (40 × 4) + (2 × 4)','(7 × 4) + (40 × 4) + (2 × 4)','(700 × 4) + (4 × 4) + (2 × 4)','(700 × 4) + (40 × 4) + (20 × 4)'],0,'742 = 700 + 40 + 2. Multiply all three parts by 4.'),
    q(14,'Subtract: 520,304 − 40,786',['480,518','479,618','479,508','479,518'],3,'520,304 − 40,000 = 480,304. Then subtract 786 to get 479,518.'),
    q(22,'What is 0.42 as a fraction?',['42/10','42/100','4/2','42'],1,'Two decimal places name hundredths: 0.42 = 42/100.'),
    q(25,'A board is 35 inches wide and 24 inches tall. How many inches of trim are needed to go around its outside edge?',['59 inches','70 inches','118 inches','840 inches'],2,'Add all four sides: 35 + 24 + 35 + 24 = 118 inches.',rect(35,24,'inches')),
    q(27,'What is the letter name of the point (−4, 2)?',['K','L','M','N'],2,'Move 4 units left and 2 units up from the origin. The point is M.',grid({K:[4,2],L:[-4,-2],M:[-4,2],N:[4,-2]})),
    q(30,'3 yards = ____ inches',['36','108','9','72'],1,'3 × 36 = 108 inches.'),
    q(33,'There are 4 boxes. Each box holds 5 bags, and each bag holds 8 marbles. How many marbles are there in all?',['160','17','40','80'],0,'Each box has 5 × 8 = 40 marbles. Four boxes have 4 × 40 = 160.'),
    q(34,'17/5 = ____',['2 3/5','4 2/5','3 2/5','3'],2,'17 ÷ 5 = 3 remainder 2, so 17/5 = 3 2/5.')
  ];
  const b=[
    q(3,'Which number line shows a dot at 6 3/4?',['Number line A','Number line B','Number line C','Number line D'],0,'There are 4 equal intervals per whole. The third tick after 6 is on line A.',lines(5,8,4,[7,3,11,5])),
    q(5,'Twenty students recorded their jumping distances in feet. How many more students jumped 4.5 feet than jumped 4 feet?',['6','9','2','3'],3,'6 students jumped 4.5 feet and 3 jumped 4 feet. 6 − 3 = 3 students.',plot([3,2,6,1,4,2,2])),
    q(9,'Which expression has the same value as 863 × 5?',['(8 × 5) + (60 × 5) + (3 × 5)','(800 × 5) + (6 × 5) + (3 × 5)','(800 × 5) + (60 × 5) + (3 × 5)','(800 × 5) + (60 × 5) + (30 × 5)'],2,'863 has 8 hundreds, 6 tens, and 3 ones: 800 + 60 + 3.'),
    q(14,'Subtract: 703,052 − 86,475',['626,577','616,577','616,677','617,577'],1,'Subtract 86,000 to get 617,052. Subtract another 475 to get 616,577.'),
    q(22,'What is 0.68 as a fraction?',['68/10','6/8','68','68/100'],3,'0.68 is 68 hundredths: 68/100.'),
    q(25,'A rectangular picture is 41 centimeters wide and 19 centimeters tall. How many centimeters of framing are needed around it?',['120 centimeters','60 centimeters','82 centimeters','779 centimeters'],0,'Perimeter = 2 × (41 + 19) = 2 × 60 = 120 centimeters.',rect(41,19,'cm')),
    q(27,'What is the letter name of the point (3, −4)?',['P','Q','R','S'],3,'Move 3 right and 4 down. The point is S.',grid({P:[3,4],Q:[-3,-4],R:[-3,4],S:[3,-4]})),
    q(30,'5 yards = ____ inches',['60','15','180','120'],2,'There are 36 inches per yard. 5 × 36 = 180 inches.'),
    q(33,'A toy store has 3 shelves. Each shelf holds 7 boxes, with 6 toy cars in each box. How many toy cars are there?',['16','126','42','63'],1,'3 × 7 = 21 boxes. 21 × 6 = 126 toy cars.'),
    q(34,'23/6 = ____',['3 5/6','4 5/6','3 1/6','3'],0,'23 ÷ 6 = 3 remainder 5, so 23/6 = 3 5/6.')
  ];
  const c=[
    q(3,'Which number line shows a dot at 8 2/3?',['Number line A','Number line B','Number line C','Number line D'],3,'There are 3 equal intervals per whole. The second tick after 8 is on line D.',lines(7,10,3,[8,2,4,5])),
    q(5,'Twenty students recorded their jumping distances in feet. How many more students jumped 5 feet than jumped 4.25 feet?',['2','4','6','10'],0,'There are 6 marks at 5 feet and 4 at 4.25 feet. 6 − 4 = 2 students.',plot([1,4,2,3,6,2,2])),
    q(9,'Which expression has the same value as 596 × 7?',['(500 × 7) + (9 × 7) + (6 × 7)','(500 × 7) + (90 × 7) + (6 × 7)','(5 × 7) + (90 × 7) + (6 × 7)','(500 × 7) + (90 × 7) + (60 × 7)'],1,'596 = 500 + 90 + 6. Multiply each part by 7.'),
    q(14,'Subtract: 810,206 − 92,758',['727,448','717,548','717,448','718,448'],2,'810,206 − 92,000 = 718,206. Subtract 758 more to get 717,448.'),
    q(22,'What is 0.37 as a fraction?',['37/100','37/10','3/7','37'],0,'The 7 is in the hundredths place. 0.37 means 37/100.'),
    q(25,'A rectangular mat is 46 inches long and 27 inches wide. How many inches of edging are needed around all four sides?',['73 inches','92 inches','1,242 inches','146 inches'],3,'46 + 27 = 73. Double that sum for all four sides: 2 × 73 = 146 inches.',rect(46,27,'inches')),
    q(27,'What is the letter name of the point (−2, −5)?',['A','B','C','D'],0,'Both coordinates are negative: move 2 left and 5 down to A.',grid({A:[-2,-5],B:[-2,5],C:[2,-5],D:[2,5]})),
    q(30,'6 yards = ____ inches',['72','18','144','216'],3,'6 × 36 = 216 inches.'),
    q(33,'A school buys 6 cartons. Each carton holds 4 packs, and each pack has 9 pencils. How many pencils does the school buy?',['19','54','216','24'],2,'Each carton holds 4 × 9 = 36 pencils. 6 × 36 = 216 pencils.'),
    q(34,'29/8 = ____',['4 5/8','3 5/8','3 3/8','3'],1,'29 ÷ 8 = 3 remainder 5, so 29/8 = 3 5/8.')
  ];
  const mix=(items,order)=>order.map(i=>items[i]);
  window.HARRY_SEPT_PRACTICE.forEach(s=>{s.group='2026-09-20';});
  window.HARRY_SEPT_PRACTICE.push(
    {id:'sept27-original',group:date,original:true,title:'Session 1 · September 27 original retry',description:'The 10 wrong questions from today’s 34-question test. Original choices and diagrams are rebuilt without showing Harry’s test answers.',questions:originals},
    {id:'sept27-a',group:date,title:'Session 2 · September 27 fresh check A',description:'10 new questions, one for each skill from the original mistakes. Try independently on another day.',questions:mix(a,[4,1,6,0,8,3,9,5,2,7])},
    {id:'sept27-b',group:date,title:'Session 3 · September 27 fresh check B',description:'A second fresh set of 10. Use paper and check your work before submitting.',questions:mix(b,[7,2,5,9,0,6,3,8,4,1])},
    {id:'sept27-c',group:date,title:'Session 4 · September 27 fresh check C',description:'A third fresh set of 10. Try a few days later to check what you remember.',questions:mix(c,[3,8,0,4,7,1,9,2,5,6])}
  );
  window.HARRY_STAR_GROUPS=[
    {id:date,title:'Sunday, September 27, 2026',label:'Latest test',description:'34 questions checked · 24 correct choices · 10 wrong. Four sessions: original retry + three fresh checks.',unit:'Session'},
    {id:'2026-09-20',title:'Sunday, September 20, 2026',label:'Previous test',description:'All seven existing practice days, with saved first-try scores and online history preserved.',unit:'Day'}
  ];
})();
