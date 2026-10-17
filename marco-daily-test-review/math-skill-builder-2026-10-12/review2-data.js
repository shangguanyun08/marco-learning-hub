(function(root){
  'use strict';
  const topics=[
    {id:'graphs',name:'Graphs & data',subtopics:[['intercept','Y-intercept'],['slope','Slope'],['direction','Increasing vs. decreasing'],['count','Data comparisons & ties'],['graphvalue','Total vs. per-item rate']]},
    {id:'absolute',name:'Absolute value & signs',subtopics:[['grouping','Absolute-value grouping'],['absequation','Both absolute-value solutions']]},
    {id:'rates',name:'Rates & proportions',subtopics:[['relative','Comparing two speeds'],['mixture','Parts in a ratio'],['remaining','Time for remaining work'],['units','Converting speed units']]},
    {id:'percent',name:'Percentages',subtopics:[['compound','Successive percentage changes'],['dimension','Area & volume scaling']]}
  ];
  const questions={},fmt=n=>String(Number(n.toFixed(6))),fixed=['Column A is greater.','Column B is greater.','The quantities are equal.','The relationship cannot be determined.'];
  function add(concept,prompt,answer,wrong,explanation,extra={}){
    const count=Object.values(questions).filter(q=>q.concept===concept).length,index=Object.keys(questions).length;
    const id=`review2-${concept}-${count+1}`,correct=[1,3,0,2,2,0,3,1][index%8],choices=wrong.map(String);
    choices.splice(correct,0,String(answer));
    if(choices.length!==4||new Set(choices).size!==4)throw Error('Invalid choices: '+id);
    questions[id]={id,concept,prompt,choices,correct,explanation,...extra};return questions[id];
  }
  function compare(concept,prompt,columns,a,b,explanation,audit){
    const q=add(concept,prompt,'_',['_a','_b','_c'],explanation,{columns,audit});
    q.choices=[...fixed];q.correct=Math.abs(a-b)<1e-9?2:a>b?0:1;return q;
  }
  const graph=(m,b,xmin,xmax,ymin,ymax,points,cropped=false)=>({lines:[{m,b,color:'#146a76'}],xmin,xmax,ymin,ymax,points,cropped});
  [[2,9,6,9],[3,4,4,7],[-2,31,5,8],[4,-6,3,6]].forEach(([m,b,x,z],i)=>{
    const rows=[x,z,z+3].map(v=>[v,m*v+b]);
    const visual=i%2?{table:{headers:['x','y'],rows}}:{graph:graph(m,b,x-1,z+1,Math.min(...rows.slice(0,2).map(r=>r[1]))-3,Math.max(...rows.slice(0,2).map(r=>r[1]))+3,rows.slice(0,2),true)};
    add('intercept',i%2?'The table lists points on a straight line. What is its y-intercept?':'Only part of a straight line is shown. What is its y-intercept?',b,[m,rows[0][1],rows[1][1]],`Slope = ${m}. Use b = y − mx: ${rows[0][1]} − (${m}) × ${x} = ${b}.`,{...visual,audit:{kind:'intercept',m,x,y:m*x+b}});
  });
  [[2,7,10,11],[-2,12,4,3],[3,2,7,12],[1,15,6,5]].forEach(([x1,y1,x2,y2],i)=>{
    const rise=y2-y1,run=x2-x1,m=rise/run,b=y1-m*x1,answer=['1/2','-3/2','5/2','-2'][i];
    const visual=i===0||i===3?{graph:graph(m,b,Math.min(0,x1-1),x2+2,0,Math.max(y1,y2)+3,[[x1,y1],[x2,y2]])}:i===1?{table:{headers:['x','y'],rows:[[x1,y1],[x2,y2],[x2+run,y2+rise]]}}:{};
    add('slope',i===2?`A line passes through (${x1}, ${y1}) and (${x2}, ${y2}). What is its slope?`:i===1?'The table lists points on a straight line. What is its slope?':'What is the slope of the line shown? Use the numbered coordinates.',answer,[fmt(1/m),rise,run],`Slope = change in y ÷ change in x = (${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${answer}.`,{...visual,audit:{kind:'slope',rise,run}});
  });
  [[-.5,2,.25,-3],[1.5,-.25,3,-2],[-4,.5,-.1,2.5],[4,-.5,1.75,-1]].forEach((slopes,i)=>{
    const offsets=[11,6,15,19],q=add('direction','Which function has y INCREASING at the smallest rate as x increases?','_',['_a','_b','_c'],'Ignore negative slopes. Of the positive slopes, choose the smallest; the starting value does not determine the rate.',{audit:{kind:'direction',slopes}});
    q.correct=slopes.indexOf(Math.min(...slopes.filter(n=>n>0)));
    q.choices=i%2?['Graph A','Graph B','Graph C','Graph D']:slopes.map((m,j)=>`y = ${m}x + ${offsets[j]}`);
    if(i%2)q.choiceGraphs=slopes.map((m,j)=>graph(m,offsets[j],0,4,-2,28,[[0,offsets[j]],[4,4*m+offsets[j]]]));
  });
  [
    [['Jan',9,12],['Feb',14,14],['Mar',18,16],['Apr',20,24],['May',27,25],['Jun',30,32]],
    [['Mon',11,15],['Tue',16,16],['Wed',20,18],['Thu',23,26],['Fri',27,29],['Sat',30,33]],
    [['Jan',12,14],['Feb',16,15],['Mar',19,19],['Apr',24,22],['May',28,31],['Jun',33,33],['Jul',35,34],['Aug',38,40]],
    [['Mon',12,10],['Tue',16,18],['Wed',21,21],['Thu',25,23],['Fri',28,27],['Sat',30,32],['Sun',36,34]]
  ].forEach((rows,i)=>{
    const a=rows.filter(r=>r[1]>r[2]).length,b=rows.filter(r=>r[2]>r[1]).length,fraction=i%2===0;
    const visual=i<2?{table:{headers:[fraction?'Month':'Day','Town A (°C)','Town B (°C)'],rows}}:{series:{labels:rows.map(r=>r[0]),lines:[{name:'Town A',values:rows.map(r=>r[1]),color:'#146a76'},{name:'Town B',values:rows.map(r=>r[2]),color:'#b3593a'}]}};
    add('count',fraction?'What fraction of the listed months has Town B strictly warmer than Town A?':'A is the number of days Town A is warmer; B is the number Town B is warmer. What is B − A?',fraction?`${b}/${rows.length}`:b-a,fraction?[`${b+1}/${rows.length}`,`${b}/${rows.length-1}`,`${b-1}/${rows.length}`]:[a,b,b+a],fraction?`Town B is warmer in ${b} of ${rows.length} months. Include ties in the total months, but not in the warmer count.`:`A = ${a}, B = ${b}. Ties count for neither town, so B − A = ${b-a}.`,{...visual,audit:{kind:'count',rows,fraction}});
  });
  [[5,8,7],[6,9,5],[2.5,12,8],[7,4,6]].forEach(([m,b,x])=>{
    add('graphvalue',`The graph shows total cost y, in dollars, for x items. What is the total cost of ${x} items?`,fmt(m*x+b),[fmt(m*x),m,b],`Read the total y-value at x = ${x}: ${m} × ${x} + ${b} = $${fmt(m*x+b)}.`,{graph:graph(m,b,0,10,0,m*10+b+5,[[0,b],[x,m*x+b]]),audit:{kind:'graphvalue',m,b,x}});
  });
  [[23,8,0],[12,19,1],[16,5,2],[9,24,1]].forEach(([a,b,v])=>{
    const columns=v===0?[`|−${a} + ${b}|`,`|−${a}| + |${b}|`]:v===1?[`−|−${a}| + ${b}`,`|−${a} + ${b}|`]:[`2|−${a}| − 2|${b}|`,`2|−${a} − ${b}|`];
    const left=v===0?Math.abs(-a+b):v===1?-a+b:2*a-2*b,right=v===0?a+b:v===1?Math.abs(-a+b):2*Math.abs(-a-b);
    compare('grouping','Compare the quantities. Watch where the absolute-value bars begin and end.',columns,left,right,`Column A = ${left}; Column B = ${right}. Evaluate inside each pair of bars first. A minus sign outside stays outside.`,{kind:'grouping',a,b,v});
  });
  [[12,19],[15,22]].forEach(([c,k])=>add('absequation',`The two solutions of |x − ${c}| = ${k} are added. What is their sum?`,2*c,[c+k,2*k,c-k],`x = ${c+k} or ${c-k}. Their sum is ${2*c}.`,{audit:{kind:'abs-sum',c,k}}));
  add('absequation','How many real values of x satisfy |x + 11| = 18?',2,[0,1,18],'x + 11 can be 18 or −18, so x is 7 or −29: two solutions.',{audit:{kind:'abs-count',k:18}});
  add('absequation','Which statement must be true if |x| = 14?','x is 14 or −14.',['x is 14 only.','x is −14 only.','x can be any number from −14 to 14.'],'Both 14 and −14 are exactly 14 units from zero.',{audit:{kind:'abs-values',k:14}});
  [[3,8,3,5],[9,10,3,4],[7,12,7,12],[4,7,2,5]].forEach(([dn,dd,tn,td])=>{
    compare('relative',`Rider B travels ${dn}/${dd} as far as Rider A and takes ${tn}/${td} as much time. Compare their average speeds.`,['Rider A’s speed','Rider B’s speed'],1,(dn/dd)/(tn/td),`B’s speed ÷ A’s speed = (${dn}/${dd}) ÷ (${tn}/${td}) = ${fmt(dn*td/(dd*tn))}. Compare this with 1.`,{kind:'relative',dn,dd,tn,td});
  });
  [[3,8,9],[7,4,8],[5,9,10],[2,7,15]].forEach(([a,b,k],i)=>{
    const juice=i%2===0,amount=(juice?a:b)*k;
    add('mixture',`A drink uses ${a} parts juice to ${b} parts water. A batch contains ${(a+b)*k} ounces altogether. How many ounces are ${juice?'juice':'water'}?`,amount,[k,(juice?b:a)*k,(a+b)*k],`There are ${a+b} total parts, each worth ${k} ounces. ${juice?'Juice':'Water'} is ${juice?a:b} parts: ${amount} ounces.`,{audit:{kind:'mixture',a,b,k,juice}});
  });
  [[5,9,30],[7,12,42],[4,7,28],[11,15,44]].forEach(([num,den,used])=>{
    const remaining=used*(den-num)/num;
    add('remaining',`At a constant rate, a worker completes ${num}/${den} of a task in ${used} minutes. How many more minutes are needed to finish?`,remaining,[used/num,used*den/num,used],`One part takes ${used/num} minutes. ${den-num} parts remain, so ${den-num} × ${used/num} = ${remaining} minutes.`,{audit:{kind:'remaining',num,den,used}});
  });
  [[30,44],[75,105],[40,66],[90,132]].forEach(([mph,fps])=>{
    compare('units',`Vehicle A travels ${mph} miles per hour. Vehicle B travels ${fps} feet per second. Use 5,280 feet per mile and 3,600 seconds per hour. Compare their speeds.`,['Vehicle A’s speed','Vehicle B’s speed'],mph*5280/3600,fps,`Vehicle A: ${mph} × 5280 ÷ 3600 = ${fmt(mph*5280/3600)} feet per second. Compare with ${fps}.`,{kind:'units',mph,fps});
  });
  [[500,10,10],[800,25,-10],[750,20,-20],[900,-10,-10]].forEach(([start,p1,p2],i)=>{
    const a=1+p1/100,b=1+p2/100,final=start*a*b;
    add('compound',`A price starts at $${start}, ${p1>0?'increases':'decreases'} by ${Math.abs(p1)}%, then ${p2>0?'increases':'decreases'} by ${Math.abs(p2)}%. What is the final price?`,fmt(final),[[600,500,550],[920,800,1000],[750,900,600],[720,900,810]][i],`Apply each change to the latest price: ${start} × ${fmt(a)} × ${fmt(b)} = $${fmt(final)}.`,{audit:{kind:'compound',start,a,b}});
  });
  add('dimension','Each side of a square is increased by 10%. By what percent does its area increase?','21%',['10%','20%','121%'],'The area factor is 1.1² = 1.21, so the increase is 21%.',{audit:{kind:'dimension',scale:1.1,power:2,percent:true}});
  add('dimension','Each side of a square is increased by 25%. By what percent does its area increase?','56.25%',['25%','50%','156.25%'],'The area factor is 1.25² = 1.5625, so the increase is 56.25%.',{audit:{kind:'dimension',scale:1.25,power:2,percent:true}});
  add('dimension','Each edge of a cube becomes 4 times as long. The new volume is how many times the original volume?',64,[4,12,16],'Volume scales with the cube of the length factor: 4³ = 64.',{audit:{kind:'dimension',scale:4,power:3}});
  add('dimension','Each edge of a cube is reduced to one third of its original length. The new volume is what fraction of the original volume?','1/27',['1/3','1/9','2/3'],'Volume factor = (1/3)³ = 1/27.',{audit:{kind:'dimension',scale:1/3,power:3}});
  root.MarcoReview2Data={topics,questions,ids:Object.keys(questions)};
})(typeof window==='undefined'?globalThis:window);
