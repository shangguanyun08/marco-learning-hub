(function(root){
  'use strict';
  const C=root.MarcoSkillCourse,bank={},fixed=['Column A is greater.','Column B is greater.','The quantities are equal.','The relationship cannot be determined.'];
  const fmt=x=>String(Number(x.toFixed(6)));
  const positions={7:[2,0,3,1,1,3,0,2,3,0,2,1,0,2,1,3,2,1,3,0],8:[1,3,0,2,2,0,3,1,0,2,1,3,2,1,3,0,1,0,2,3]};
  function add(set,index,concept,prompt,answer,wrong,explanation,extra={}){
    const id=`cp${set}-${String(index).padStart(2,'0')}`,correct=positions[set][index-1],choices=wrong.map(String);choices.splice(correct,0,String(answer));
    const q={id,concept,skill:C.group[concept],label:C.names[concept],prompt,choices,correct,tip:explanation,explanation,difficulty:'Targeted mixed check',...extra};
    if(!q.audit)throw Error('Missing independent math audit');bank[id]=q;return q;
  }
  function compare(set,index,concept,prompt,columns,a,b,explanation,audit){
    const q=add(set,index,concept,prompt,'temporary',['x','y','z'],explanation,{columns,audit});
    q.choices=[...fixed];q.correct=Math.abs(a-b)<1e-9?2:a>b?0:1;return q;
  }
  const graph=(m,b,xmax,ymax,points,extra={})=>({lines:[{m,b,color:'#2468e5'}],xmin:0,xmax,ymin:0,ymax,points,...extra});
  function build(set){
    const b=set===8;
    let x1=b?3:2,y1=b?4:5,x2=b?9:8,y2=b?13:20,rise=y2-y1,run=x2-x1,m=rise/run;
    add(set,1,'slope','What is the slope of the line shown? Use the numbered coordinates.',b?'3/2':'5/2',[rise,run,b?'2/3':'2/5'],`Slope = (${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${fmt(m)}.`,{graph:graph(m,y1-m*x1,12,b?18:25,[[x1,y1],[x2,y2]]),audit:{kind:'slope',v:0,rise,run}});
    let distance=b?7/10:5/6,time=b?7/8:2/3;
    compare(set,2,'relative',`Runner B covers ${b?'7/10':'5/6'} as much distance as Runner A in ${b?'7/8':'2/3'} as much time. Compare their average speeds.`,['Runner A’s speed','Runner B’s speed'],1,distance/time,`B’s speed divided by A’s speed is the distance factor divided by the time factor: ${b?'(7/10) ÷ (7/8) = 4/5':'(5/6) ÷ (2/3) = 5/4'}.`,{kind:'relative',v:0,a:distance,b:time});
    let start=b?400:250,factor=b?1.1:1.2;
    add(set,3,'compound',`A club has ${start} members. Membership increases by ${b?10:20}% in each of two successive years. How many members are there after both increases?`,fmt(start*factor*factor),[fmt(start*(1+2*(factor-1))),start,fmt(start*factor)],`Apply each increase to the latest total: ${start} × ${factor} × ${factor} = ${fmt(start*factor*factor)}.`,{audit:{kind:'compound',v:1,start,a:factor,b:factor}});
    let a=b?19:17,c=b?7:6;
    compare(set,4,'grouping','Compare the quantities. Follow the placement of the absolute-value bars.',[`|−${a} + ${c}|`,`|−${a}| + |${c}|`],Math.abs(-a+c),a+c,`Column A = ${Math.abs(-a+c)}. Column B = ${a+c}. Calculate inside each pair of bars before taking its absolute value.`,{kind:'grouping',v:1,a,b:c});
    m=b?4:3;let intercept=b?5:11;x1=b?3:2;const step=3;
    let rows=[0,1,2].map(i=>[x1+i*step,m*(x1+i*step)+intercept]);
    add(set,5,'intercept','The table lists points on a straight line. What is its y-intercept?',intercept,[m,rows[0][1],rows[1][1]],`The slope is ${m}. Use y = ${m}x + b at (${rows[0][0]}, ${rows[0][1]}): b = ${rows[0][1]} − ${m} × ${rows[0][0]} = ${intercept}.`,{table:{headers:['x','y'],rows},audit:{kind:'intercept',v:1,m,x:rows[0][0],y:rows[0][1]}});
    rows=b?[['Jan',8,10],['Feb',11,11],['Mar',16,14],['Apr',19,21],['May',25,24],['Jun',28,30],['Jul',31,31],['Aug',34,36]]:[['Mon',12,15],['Tue',18,18],['Wed',20,17],['Thu',22,26],['Fri',28,28],['Sat',30,34],['Sun',35,33]];
    let visuals=b?{series:{labels:rows.map(r=>r[0]),lines:[{name:'Town A',values:rows.map(r=>r[1]),color:'#2468e5'},{name:'Town B',values:rows.map(r=>r[2]),color:'#bb6148'}]}}:{table:{headers:['Day','Plant A height (cm)','Plant B height (cm)'],rows}};
    add(set,6,'count',b?'In what fraction of the listed months is Town B strictly warmer than Town A?':'On what fraction of the listed days is Plant B strictly taller than Plant A?',b?'1/2':'3/7',b?['3/4','5/8','1/4']:['5/7','3/5','4/7'],b?'Town B is strictly warmer in 4 of 8 months, so the fraction is 4/8 = 1/2. Tied months remain in the denominator but not the numerator.':'Plant B is taller on Monday, Thursday, and Saturday: 3 of 7 days. Equal heights do not count as strictly taller.',{...visuals,audit:{kind:'count',v:1,rows}});
    const num=b?7:5,den=b?10:8,used=b?56:35,remaining=used*(den-num)/num;
    add(set,7,'remaining',`Working at a constant rate, a painter completes ${num}/${den} of a job in ${used} minutes. How many more minutes are needed to finish the job?`,remaining,[used/num,fmt(used*(den-num)/den),used*den/num],`${num} equal parts take ${used} minutes, so each part takes ${used/num} minutes. ${den-num} parts remain: ${den-num} × ${used/num} = ${remaining} minutes.`,{audit:{kind:'remaining',v:0,num,den,used}});
    const scale=b?1.4:1.3,change=b?40:30,areaIncrease=b?96:69;
    add(set,8,'dimension',`Each side of a square is increased by ${change}%. By what percent does its area increase?`,areaIncrease+'%',[change+'%',2*change+'%',(100+areaIncrease)+'%'],`The length factor is ${scale}; the area factor is ${scale}² = ${fmt(scale*scale)}. The increase is ${areaIncrease}%.`,{audit:{kind:'dimension',v:0,scale,power:2}});
    c=b?11:9;let k=b?17:14;
    add(set,9,'absequation',`The two solutions of |x − ${c}| = ${k} are added. What is their sum?`,2*c,[c+k,k,2*k],`x − ${c} = ${k} or −${k}, so x = ${c+k} or ${c-k}. Their sum is ${2*c}.`,{audit:{kind:'absequation',v:1,c,k}});
    m=b?3:4;intercept=b?11:7;const items=b?8:6,total=m*items+intercept;
    add(set,10,'graphvalue',`The graph shows total cost y, in dollars, for x ${b?'rental helmets':'activity passes'}. What is the total cost of ${items} ${b?'helmets':'passes'}?`,total,[m*items,m,intercept],`The total is y = ${m}x + ${intercept}. At x = ${items}, y = ${m} × ${items} + ${intercept} = ${total}.`,{graph:graph(m,intercept,10,b?45:40,[[0,intercept],[items,total]]),audit:{kind:'graphvalue',v:0,m,b:intercept,x:items}});
    rows=b?[[1,8],[5,18],[9,28]]:[[2,5],[6,11],[10,17]];rise=rows[1][1]-rows[0][1];run=rows[1][0]-rows[0][0];
    add(set,11,'slope','The table gives points on a straight line. What is its slope?',b?'5/2':'3/2',[rise,run,b?'2/5':'2/3'],`Slope = change in y ÷ change in x = ${rise} ÷ ${run} = ${fmt(rise/run)}.`,{table:{headers:['x','y'],rows},audit:{kind:'slope',v:1,rise,run}});
    start=b?450:320;let up=b?1.2:1.25,down=b?.7:.8;
    add(set,12,'compound',`A price starts at $${start}, increases by ${b?20:25}%, and then decreases by ${b?30:20}%. What is the final price?`,fmt(start*up*down),b?[405,540,315]:[336,304,300],`Apply the changes in order: ${start} × ${up} × ${down} = ${fmt(start*up*down)}. The decrease uses the amount after the increase.`,{audit:{kind:'compound',v:0,start,a:up,b:down}});
    const partsA=b?7:4,partsB=b?5:7,partSize=b?9:12,whole=(partsA+partsB)*partSize;
    add(set,13,'mixture',b?`A jar contains red and blue beads in a 7:5 ratio. There are ${whole} beads altogether. How many are red?`:`A drink uses 4 parts juice to 7 parts water. There are ${whole} ounces altogether. How many ounces are juice?`,partsA*partSize,[partSize,partsB*partSize,b?84:44],`There are ${partsA+partsB} total parts. Each part is ${whole} ÷ ${partsA+partsB} = ${partSize}; the requested amount is ${partsA} × ${partSize} = ${partsA*partSize}.`,{audit:{kind:'mixture',v:1,a:partsA,b:partsB,k:partSize}});
    a=b?8:14;c=b?13:9;
    compare(set,14,'grouping','Compare the quantities. Keep track of the minus sign outside the bars.',[`−|−${a}| + ${c}`,`|−${a} + ${c}|`],-a+c,Math.abs(-a+c),`Column A = ${-a+c}. Column B = ${Math.abs(-a+c)}. An outside minus sign stays outside the absolute value.`,{kind:'grouping',v:2,a,b:c});
    const slopes=b?[1.25,-.4,3,-2]:[-1.5,.75,4,-.2],offsets=b?[9,16,4,22]:[12,6,1,20],order=b?[0,1,2,3]:[0,2,1,3];
    let q=add(set,15,'direction','Which function has y INCREASING at the smallest rate as x increases?','temporary',['x','y','z'],'Keep only the positive slopes, then choose the smaller positive slope. The starting values do not determine the rate.',{audit:{kind:'direction',v:b?0:1,slopes,order}});
    q.correct=order.indexOf(slopes.map((m,i)=>({m,i})).filter(p=>p.m>0).sort((a,b)=>a.m-b.m)[0].i);
    if(b){q.choices=['Graph A','Graph B','Graph C','Graph D'];q.choiceGraphs=order.map(i=>graph(slopes[i],offsets[i],4,25,[[0,offsets[i]],[4,4*slopes[i]+offsets[i]]],{ymin:-1}));}
    else q.choices=order.map(i=>`y = ${slopes[i]}x + ${offsets[i]}`);
    m=b?3:2;intercept=b?10:13;const pointX=5,pointY=m*pointX+intercept,endX=b?7:8,endY=m*endX+intercept;
    add(set,16,'intercept','Only part of a straight line is visible. What is its y-intercept?',intercept,[m,pointY,0],`The slope is ${m}. At (${pointX}, ${pointY}), b = y − mx = ${pointY} − ${m} × ${pointX} = ${intercept}.`,{graph:graph(m,intercept,b?8:9,b?36:34,[[pointX,pointY],[endX,endY]],{xmin:4,ymin:20,cropped:true}),audit:{kind:'intercept',v:0,m,x:pointX,y:pointY}});
    const mph=b?60:50,fps=b?85:77;
    compare(set,17,'units',`Vehicle A travels ${mph} miles per hour. Vehicle B travels ${fps} feet per second. Use 5,280 feet per mile and 3,600 seconds per hour. Compare their speeds.`,['Vehicle A’s speed','Vehicle B’s speed'],mph,fps*3600/5280,`Convert A to feet per second: ${mph} × 5280 ÷ 3600 = ${fmt(mph*5280/3600)} feet/second, then compare with ${fps} feet/second.`,{kind:'units',v:0,mph,fps});
    const volumeScale=b?.5:1.5;
    add(set,18,'dimension',b?'Each edge of a cube is reduced by 50%. The new volume is what fraction of the original volume?':'Each edge of a cube is increased by 50%. The new volume is how many times the original volume?',b?'1/8':'27/8',b?['1/2','1/4','3/2']:['3/2','9/4','9/2'],`Volume scales with the cube of the length factor: ${volumeScale}³ = ${fmt(volumeScale**3)} = ${b?'1/8':'27/8'}.`,{audit:{kind:'dimension',v:1,scale:volumeScale,power:3}});
    c=b?13:-8;k=b?0:15;
    add(set,19,'absequation',b?'How many real values of x satisfy |x − 13| = 0?':'How many real values of x satisfy |x + 8| = 15?',b?1:2,b?[0,2,13]:[1,0,15],b?'An absolute value is zero only when its inside is zero. x − 13 = 0 gives one solution, x = 13.':'x + 8 = 15 or −15, giving x = 7 or −23. There are two real solutions.',{audit:{kind:'absequation',v:0,c,k}});
    rows=b?[[1,14,16],[2,17,18],[3,20,19],[4,24,26],[5,27,26],[6,30,32],[7,34,34],[8,36,39]]:[[1,6,9],[2,12,8],[3,10,10],[4,14,17],[5,18,15],[6,19,21]];
    add(set,20,'count',`In the table, A is the number of ${b?'days':'rounds'} Player A scores more, and B is the number Player B scores more. What is B − A?`,b?3:1,b?[5,2,7]:[3,2,5],b?'Player B scores more on 5 days, Player A on 2 days, and one day is tied. B − A = 5 − 2 = 3.':'Player B scores more in 3 rounds, Player A in 2 rounds, and one round is tied. B − A = 3 − 2 = 1.',{table:{headers:[b?'Day':'Round','Player A','Player B'],rows},audit:{kind:'count',v:0,rows}});
  }
  build(7);build(8);
  C.legacySets=C.sets.slice(6).map(s=>({...s,maxQuestions:s.number===8?25:15}));
  C.checkpointQuestions=bank;
  C.sets.splice(6,2,...[7,8].map(number=>({number,id:`set-${number}-targeted-20-v2`,label:`90% accuracy check ${number===7?'A':'B'}`,description:'20 fresh mixed questions targeting graphs, rates, absolute value, and percentages. Goal: 18/20 correct on the first try. Complete all first answers before feedback; missed questions then get one retry.',day:`Set ${number}`,check:true,checkpoint:true,noRound2:true,contentVersion:'targeted-20-v2',targetCorrect:18,questionIds:Array.from({length:20},(_,i)=>`cp${number}-${String(i+1).padStart(2,'0')}`)})));
})(typeof window==='undefined'?globalThis:window);
