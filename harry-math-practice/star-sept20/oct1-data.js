(function(){
  'use strict';
  const n=(source,label,prompt,correct,explanation)=>({source,sourceLabel:`Lesson 14 ${label}`,skill:'Division with zeros',type:'number',prompt,correct,explanation});
  const mc=(source,label,skill,prompt,choices,correct,explanation)=>({source,sourceLabel:`Lesson 14 ${label}`,skill,prompt,choices,correct,explanation});
  const rem=(source,label,a,b,choices,correct)=>mc(source,label,'Division with a remainder',`Calculate: ${a} ÷ ${b} = ____`,choices,correct,`${b} × ${Math.floor(a/b)} = ${b*Math.floor(a/b)}. ${a-b*Math.floor(a/b)} left over → ${choices[correct]}.`);
  const dec=(source,label,a,op,b,correct)=>({...n(source,label,`Calculate: ${a} ${op} ${b} = ____`,correct,`Line up the decimal points. ${a} ${op} ${b} = ${correct}.`),skill:'Decimal calculation',decimal:true});
  const zero=(source,label,a,b)=>n(source,label,`Calculate with the hidden zero method: ${a.toLocaleString('en-US')} ÷ ${b.toLocaleString('en-US')} = ____`,a/b,`${b} × ${(a/b).toLocaleString('en-US')} = ${a.toLocaleString('en-US')}. So the answer is ${(a/b).toLocaleString('en-US')}.`);
  const split=(source,factor,number)=>({source,sourceLabel:'Like Session 1 Q19',skill:'Friendly-number multiplication',type:'split-sum',prompt:`Use friendly numbers: ${factor} × ${number} = ${factor} × (100 + ${number-100})`,partLabels:[`${factor} × 100`,`${factor} × ${number-100}`,'Total'],parts:[factor*100,factor*(number-100),factor*number],correct:factor*number,explanation:'Multiply the two parts, then add them together.'});
  const originals=[
    zero(201,'Q1(a)',1260,6),zero(202,'Q1(b) · unfinished',31500,5),zero(203,'Q1(c) · unfinished',792000,8),
    mc(204,'Q2(a)','Same quotient','Find the division that has the same quotient as 3,500 ÷ 50.',['350 ÷ 50','350 ÷ 5','3,500 ÷ 5','35 ÷ 5'],1,'Remove one ending zero from BOTH numbers: 3,500 ÷ 50 = 350 ÷ 5 = 70.'),
    zero(205,'Q3(a)',560,80),zero(206,'Q3(b) · unfinished',14000,700),
    zero(207,'Q4(a)',8100,900),zero(208,'Q4(b)',280,70),zero(209,'Q5(a)',24000,60),zero(210,'Q5(b)',640,80),
    rem(211,'Q7(a) · unfinished',592,50,['11 R 42','12 R 8','11 R 32','10 R 92'],0),
    rem(212,'Q7(b) · unfinished',269,20,['12 R 29','13 R 19','13 R 9','14 R 9'],2),
    mc(213,'Q9','Round up for containers','Each bookshelf can hold 30 books. To store 523 books, the minimum number of shelves needed is ____. Numerical expression: 523 ÷ 30 = 17 R 13.',['17','18','19','20'],1,'17 shelves are full, but 13 books still need a shelf. Add 1 more: 18 shelves.'),
    dec(214,'Q10(c)',2.56,'+',3.78,6.34),dec(215,'Q10(d)',9.31,'−',4.58,4.73),
    rem(216,'Q11',65,4,['16 R 2','15 R 5','17 R 1','16 R 1'],3),rem(217,'Q12',47,3,['15 R 3','15 R 2','16 R 1','14 R 5'],1),
    mc(218,'Q13','Length units','Which of the following units can be used to describe length?',['second','kilogram','yard','milliliter'],2,'A yard measures length. Seconds measure time; kilograms measure mass; milliliters measure liquid volume.')
  ];
  const a=[
    zero(201,'Q1(a)',1470,7),zero(202,'Q1(b)',36400,7),zero(203,'Q1(c)',648000,9),
    mc(204,'Q2(a)','Same quotient','Which division has the same quotient as 4,800 ÷ 60?',['480 ÷ 60','4,800 ÷ 6','48 ÷ 6','480 ÷ 6'],3,'Remove one ending zero from BOTH numbers: 4,800 ÷ 60 = 480 ÷ 6 = 80.'),
    zero(205,'Q3(a)',720,90),zero(206,'Q3(b)',18000,600),zero(207,'Q4(a)',5600,800),zero(208,'Q4(b)',420,60),zero(209,'Q5(a)',35000,70),zero(210,'Q5(b)',540,90),
    rem(211,'Q7(a)',683,60,['11 R 23','11 R 33','12 R 23','10 R 83'],0),rem(212,'Q7(b)',317,30,['11 R 17','10 R 7','10 R 17','9 R 47'],2),
    mc(213,'Q9','Round up for containers','Each shelf holds 40 books. What is the minimum number of shelves needed for 657 books? Numerical expression: 657 ÷ 40 = 16 R 17.',['16','17','18','19'],1,'16 shelves are full, but 17 books still need a shelf. Add 1 more: 17 shelves.'),
    dec(214,'Q10(c)',3.67,'+',2.85,6.52),dec(215,'Q10(d)',8.42,'−',3.76,4.66),
    rem(216,'Q11',78,5,['15 R 3','15 R 2','16 R 3','14 R 8'],0),rem(217,'Q12',58,4,['14 R 4','15 R 2','13 R 6','14 R 2'],3),
    mc(218,'Q13','Length units','Which unit could measure the length of a desk?',['minute','liter','centimeter','kilogram'],2,'Centimeters measure length, such as how long a desk is.')
  ];
  const b=[
    zero(201,'Q1(a)',1640,8),zero(202,'Q1(b)',43200,6),zero(203,'Q1(c)',567000,7),
    mc(204,'Q2(a)','Same quotient','Which division has the same quotient as 6,300 ÷ 70?',['630 ÷ 70','630 ÷ 7','6,300 ÷ 7','63 ÷ 7'],1,'Remove one ending zero from BOTH numbers: 6,300 ÷ 70 = 630 ÷ 7 = 90.'),
    zero(205,'Q3(a)',450,50),zero(206,'Q3(b)',32000,800),zero(207,'Q4(a)',4200,600),zero(208,'Q4(b)',480,80),zero(209,'Q5(a)',48000,80),zero(210,'Q5(b)',630,70),
    rem(211,'Q7(a)',746,70,['11 R 24','10 R 36','10 R 46','9 R 116'],2),rem(212,'Q7(b)',389,30,['12 R 19','13 R 29','11 R 59','12 R 29'],3),
    mc(213,'Q9','Round up for containers','Each shelf holds 50 books. What is the minimum number of shelves needed for 862 books? Numerical expression: 862 ÷ 50 = 17 R 12.',['18','17','19','20'],0,'17 shelves are full, but 12 books still need a shelf. Add 1 more: 18 shelves.'),
    dec(214,'Q10(c)',4.86,'+',2.57,7.43),dec(215,'Q10(d)',7.23,'−',2.68,4.55),
    rem(216,'Q11',87,6,['14 R 5','15 R 3','14 R 3','13 R 9'],2),rem(217,'Q12',74,5,['14 R 4','14 R 5','15 R 4','13 R 9'],0),
    mc(218,'Q13','Length units','Which unit could measure the length of a playground?',['gram','second','milliliter','meter'],3,'Meters measure length, such as how long a playground is.')
  ];
  const reviewOriginal=window.HARRY_SEPT_PRACTICE.find(s=>s.id==='sept27-original');
  const reviews=[
    [102,34,27,33].map(source=>({...reviewOriginal.questions.find(q=>q.source===source),sourceLabel:source===102?'Review · Think Academy Q2':`Review · STAR Q${source}`})),
    [
      {...n(102,'review','Use friendly numbers: 25 × 112 = 25 × (100 + 12) = ____',2800,'2,500 + 300 = 2,800.'),sourceLabel:'Similar · Think Academy Q2',skill:'Friendly-number multiplication'},
      {source:34,sourceLabel:'Similar · STAR Q34',skill:'Improper fractions',prompt:'19/5 = ____',choices:['3 4/5','4 1/5','3 1/5','2 4/5'],correct:0,explanation:'15/5 makes 3 wholes. There are 4/5 left: 3 4/5.'},
      {source:27,sourceLabel:'Similar · STAR Q27',skill:'Coordinate points',prompt:'What is the letter name of the point (−3, 4)?',choices:['A','B','C','D'],correct:1,explanation:'Go 3 left, then 4 up. That is B.',visual:{type:'coordinates',points:{A:[3,4],B:[-3,4],C:[-3,-4],D:[3,-4]}}},
      {source:33,sourceLabel:'Similar · STAR Q33',skill:'Multiply three groups',prompt:'There are 4 boxes. Each box holds 6 bags, and each bag holds 7 marbles. How many marbles are there in all?',choices:['42','17','168','24'],correct:2,explanation:'One box: 6 × 7 = 42 marbles. Four boxes: 4 × 42 = 168 marbles.'}
    ],
    [
      {...n(102,'review','Use friendly numbers: 40 × 108 = 40 × (100 + 8) = ____',4320,'4,000 + 320 = 4,320.'),sourceLabel:'Similar · Think Academy Q2',skill:'Friendly-number multiplication'},
      {source:34,sourceLabel:'Similar · STAR Q34',skill:'Improper fractions',prompt:'27/8 = ____',choices:['3 5/8','2 3/8','4 3/8','3 3/8'],correct:3,explanation:'24/8 makes 3 wholes. There are 3/8 left: 3 3/8.'},
      {source:27,sourceLabel:'Similar · STAR Q27',skill:'Coordinate points',prompt:'What is the letter name of the point (4, −2)?',choices:['K','L','M','N'],correct:2,explanation:'Go 4 right, then 2 down. That is M.',visual:{type:'coordinates',points:{K:[-4,2],L:[4,2],M:[4,-2],N:[-4,-2]}}},
      {source:33,sourceLabel:'Similar · STAR Q33',skill:'Multiply three groups',prompt:'A school buys 6 cartons. Each carton holds 5 packs, and each pack has 7 pencils. How many pencils does the school buy?',choices:['35','210','18','30'],correct:1,explanation:'One carton: 5 × 7 = 35 pencils. Six cartons: 6 × 35 = 210 pencils.'}
    ]
  ];
  const c=[
    zero(205,'Q3(a)',630,90),zero(207,'Q4(a)',7200,800),zero(209,'Q5(a)',54000,90),zero(210,'Q5(b)',560,70),
    rem(211,'Q7(a)',865,80,['10 R 65','11 R 15','10 R 55','9 R 145'],0),
    mc(213,'Q9','Round up for containers','Each shelf holds 60 books. What is the minimum number of shelves needed for 745 books? Numerical expression: 745 ÷ 60 = 12 R 25.',['12','14','13','15'],2,'12 shelves are full, but 25 books still need a shelf. Add 1 more: 13 shelves.'),
    dec(214,'Q10(c)',5.78,'+',3.64,9.42),dec(215,'Q10(d)',8.52,'−',4.67,3.85)
  ];
  const focusSources=new Set([205,207,209,210,211,213,214,215]);
  const reviewC=[
    {source:34,sourceLabel:'Similar · STAR Q34',skill:'Improper fractions',prompt:'31/9 = ____',choices:['3 5/9','4 4/9','3 4/9','2 4/9'],correct:2,explanation:'27/9 makes 3 wholes. There are 4/9 left: 3 4/9.'},
    {source:33,sourceLabel:'Similar · STAR Q33',skill:'Multiply three groups',prompt:'A school buys 5 cartons. Each carton holds 4 packs, and each pack has 8 pencils. How many pencils does the school buy?',choices:['20','160','32','17'],correct:1,explanation:'One carton: 4 × 8 = 32 pencils. Five cartons: 5 × 32 = 160 pencils.'}
  ];
  const focused=[
    [...a.filter(q=>focusSources.has(q.source)),split(102,25,112),split(219,25,104),...reviews[1].filter(q=>[34,27].includes(q.source))],
    [...b.filter(q=>focusSources.has(q.source)),split(102,40,108),split(219,25,116),...reviews[2].filter(q=>[27,33].includes(q.source))],
    [...c,split(102,25,124),split(219,50,107),...reviewC]
  ];
  window.HARRY_SEPT_PRACTICE.push({id:'oct1-original',group:'2026-10-01',original:true,title:'Session 1 · October 1 original retry',description:'18 missed or unfinished Lesson 14 parts, plus the top 4 review questions from the four September 27 sessions. Remainder problems use answer choices; all correct homework parts are omitted.',questions:[...originals,...reviews[0]]});
  ['oct1-a','oct1-b','oct1-c'].forEach((id,i)=>window.HARRY_SEPT_PRACTICE.push({id,group:'2026-10-01',title:`Session ${i+2} · October 1 focused check ${String.fromCharCode(65+i)}`,description:'12 focused questions: 4 divisions with zeros, 2 friendly-number multiplications, 1 remainder, 1 shelves problem, 2 decimals, and 2 rotating reviews. For multiplication, fill both parts and the total: ___ + ___ = ___.',questions:focused[i]}));
  window.HARRY_STAR_GROUPS.forEach(g=>{if(g.id==='2026-09-27')g.label='Previous test';});
  window.HARRY_STAR_GROUPS.unshift({id:'2026-10-01',title:'Thursday, October 1, 2026',label:'Latest practice',unit:'Session',description:'Session 1 keeps its 22 original questions and saved score. Sessions 2, 3 and 4 have 12 focused questions each, including Q19-style multiplication in two steps. Two tries per question; scores count only the first try.'});
})();
