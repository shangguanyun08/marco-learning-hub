(function(root){
  'use strict';
  const skills={rates:'Rates & proportions',graphs:'Graphs & data',absolute:'Absolute value & signs',percent:'Percentages',algebra:'Algebra & conditions',other:'Quick foundation checks'};
  const names={speed:'Distance, time, speed',relative:'Comparing two rates',remaining:'Time for remaining work',unitprice:'Unit price versus total',mixture:'Consistent ratio order',units:'Convert units before comparing',slope:'Slope with labelled scales',intercept:'Intercept versus a visible point',graphvalue:'Read the requested value',direction:'Increasing versus decreasing',count:'Count, then answer the question',grouping:'Absolute-value grouping',absequation:'Both absolute-value cases',signed:'Signs and order of operations',part:'Percent of the whole',base:'Original percentage base',reverse:'Find the original amount',compound:'Successive percentage changes',dimension:'Length changes versus area/volume',cases:'Separate algebra conditions',system:'Solve, then compare',setup:'Translate the relationship',powers:'Decimal powers',angles:'Opposite versus adjacent angles',net:'Match faces to a solid'};
  const group={speed:'rates',relative:'rates',remaining:'rates',unitprice:'rates',mixture:'rates',units:'rates',slope:'graphs',intercept:'graphs',graphvalue:'graphs',direction:'graphs',count:'graphs',grouping:'absolute',absequation:'absolute',signed:'absolute',part:'percent',base:'percent',reverse:'percent',compound:'percent',dimension:'percent',cases:'algebra',system:'algebra',setup:'algebra',powers:'other',angles:'other',net:'other'};
  const fmt=n=>{if(Number.isInteger(n))return String(n);if(Math.abs(n*1000-Math.round(n*1000))<1e-8)return String(Number(n.toFixed(3)));for(let d=2;d<=100;d++){const a=Math.round(n*d);if(Math.abs(n*d-a)<1e-9)return a+'/'+d;}return String(Number(n.toFixed(10)));};
  const percent=n=>fmt(n)+'%';
  function question(kind,seed){
    if(!Object.hasOwn(group,kind)||!Number.isInteger(seed)||seed<1||seed>500)throw new Error('Unknown question');
    const v=seed%3,n=seed%7+2,even=2*(seed%5+2);
    const out={id:kind+'@'+seed,concept:kind,skill:group[kind],label:names[kind],seed,prompt:'',choices:[],correct:0,tip:'',explanation:'',audit:{},difficulty:'Medium-hard'};
    function choices(answer,distractors){
      const a=String(answer),values=[a,...distractors.map(String)].filter((x,i,all)=>all.indexOf(x)===i);
      for(let j=1;values.length<4;j++){const x=Number.isFinite(Number(a))?fmt(Number(a)+j*7):'None of these';if(!values.includes(x))values.push(x);else if(j>30)throw new Error('Invalid choices');}
      const pos=(seed+kind.length)%4,first=values.slice(0,4);first.splice(0,1);first.splice(pos,0,a);out.choices=first;out.correct=pos;
    }
    function numeric(answer,ds){choices(fmt(answer),ds.map(fmt));}
    function comparison(a,b){out.choices=['Column A is greater.','Column B is greater.','The quantities are equal.','The relationship cannot be determined.'];out.correct=a>b?0:a<b?1:2;}
    function table(headers,rows,caption){out.table={headers,rows,caption};}
    switch(kind){
      case 'speed':{
        const speed=even*3,h=n,d=speed*h;out.audit={kind,v,speed,h,d};
        if(v===0){out.prompt=`A bus travels ${d} miles in ${h} hours at a constant speed. At that speed, how far will it travel in ${h+2} hours?`;numeric(speed*(h+2),[d+2,speed*2,d*(h+2)]);}
        else if(v===1){out.prompt=`A train travels ${d} miles in ${h} hours at a constant speed. How many hours will it take to travel ${speed*(h+3)} miles?`;numeric(h+3,[h,3,(h+3)*h]);}
        else{out.prompt='The table shows a constant-speed journey. What is the speed in miles per hour?';table(['Hours','Miles'],[[h,d],[h+2,speed*(h+2)]],'JOURNEY');numeric(speed,[d,h,d-h]);}
        out.tip='Write speed = distance ÷ time, with units. Decide which quantity is unknown.';out.explanation=`The speed is ${d} ÷ ${h} = ${speed} miles/hour. Use distance = speed × time, or time = distance ÷ speed—not distance alone.`;break;
      }
      case 'relative':{
        const ad=v===1?n+2:n+1,bd=v===0?n+2:n+1,a=n/ad,b=n/bd;out.audit={kind,v,a,b};
        if(v===0||v===1){out.prompt=`Rider B travels ${n}/${ad} as far as Rider A and takes ${n}/${bd} as much time. Compare their average speeds.`;out.columns=['Rider A’s speed','Rider B’s speed'];comparison(1,a/b);}
        else{const t=n*(n+1),d=t*even;out.prompt='Two riders make the journeys shown. Compare their average speeds.';table(['Rider','Miles','Hours'],[['A',d,t],['B',n*n*even,n*n]],'BOTH DISTANCE AND TIME MATTER');out.columns=['Rider A’s speed','Rider B’s speed'];comparison(1,a/b);}
        out.tip='Compare the distance factor divided by the time factor.';out.explanation=`B’s speed relative to A is ${fmt(a)} ÷ ${fmt(b)} = ${fmt(a/b)}. Less distance alone does not mean a lower speed.`;break;
      }
      case 'remaining':{
        const den=n+2,num=den-1,total=den*even,used=num*even;out.audit={kind,v,den,num,total,used};
        if(v===0){out.prompt=`A machine fills ${num}/${den} of a tank in ${used} minutes at a constant rate. How many more minutes are needed to fill the tank?`;numeric(even,[used/den,total,used]);}
        else if(v===1){out.prompt=`A worker paints ${num}/${den} of a wall in ${used} minutes. At the same rate, how many minutes does the whole wall take?`;numeric(total,[even,used,used*den]);}
        else{out.prompt=`A worker completes ${num}/${den} of a task in ${used} minutes. Compare the time for the remaining work with ${even} minutes.`;out.columns=['Time needed for the rest',''+even+' minutes'];comparison(even,even);}
        out.tip='Find time per equal part. Do not take the remaining fraction of the time already used.';out.explanation=`${num} equal parts take ${used} minutes, so one part takes ${used} ÷ ${num} = ${even} minutes. The whole task takes ${den} × ${even} = ${total} minutes; the remaining one part takes ${even} minutes.`;break;
      }
      case 'unitprice':{
        const pa=n+2,pb=n+3,qa=even,qb=even-1;out.audit={kind,v,pa,pb,qa,qb};
        if(v===0){out.prompt='Two stores sell identical notebooks in packs. Which store has the lower price per notebook?';table(['Store','Notebooks','Pack price'],[['A',qa,'$'+pa*qa],['B',qb,'$'+pb*qb]],'COMPARE UNIT PRICES');choices('Store A',['Store B','The prices per notebook are equal.','Cannot be determined.']);}
        else if(v===1){out.prompt=`Mia earns $${pa*qa} in ${qa} hours. Leo earns $${pb*qb} in ${qb} hours. Both work ${n} more hours at their own hourly rates. How much more does Leo earn during those additional hours?`;numeric(n,[pb*qb-pa*qa,1,pb*n]);}
        else{out.prompt=`Store A sells ${qa} notebooks for $${pa*qa}. Store B sells ${qb} notebooks for $${pa*qb}. Compare their prices per notebook.`;out.columns=['Store A’s price per notebook','Store B’s price per notebook'];comparison(pa,pa);out.audit.equal=true;}
        out.tip='Divide total money by units or hours before comparing.';out.explanation=v===2?`Both prices are $${pa} per notebook. A different pack total does not imply a different unit price.`:`A’s rate is $${pa} per unit/hour and B’s is $${pb}. Compare these rates, then apply them to the requested quantity.`;break;
      }
      case 'mixture':{
        const a=n,b=n+2,k=even;out.audit={kind,v,a,b,k};
        if(v===0){out.prompt=`A drink uses ${a} parts juice for every ${b} parts water. If ${a*k} ounces of juice are used, how many ounces of water are needed?`;numeric(b*k,[a*k,a*k*a/b,a*k+b]);}
        else if(v===1){out.prompt=`A drink uses ${a} parts juice to ${b} parts water. A batch contains ${(a+b)*k} ounces altogether. How many ounces are juice?`;numeric(a*k,[b*k,(a+b)*k*a/b,k]);}
        else{out.prompt=`A drink uses ${a} parts juice for every ${b} parts water. If j is the juice amount and w is the water amount, which equation is correct?`;choices(`${b}j = ${a}w`,[`${a}j = ${b}w`,`j + w = ${a+b}`,`j = ${b}w`]);}
        out.tip='Keep juice/water in the same order. A ratio’s total has both parts.';out.explanation=`Juice/water = ${a}/${b}. Each part is ${k} ounces in the numerical examples. Cross-multiplying gives ${b}j = ${a}w.`;break;
      }
      case 'units':{
        const mph=(seed%4+1)*15,fps=mph*5280/3600;out.audit={kind,v,mph,fps};out.prompt=`A vehicle travels ${mph} miles per hour. Another travels ${fmt(fps)} feet per second. There are 5,280 feet in a mile. Compare their speeds.`;out.columns=['First vehicle’s speed','Second vehicle’s speed'];comparison(mph,fps*3600/5280);out.correct=2;
        out.tip='Put both speeds in the SAME units. There are 3,600 seconds in an hour.';out.explanation=`${mph} × 5,280 ÷ 3,600 = ${fmt(fps)} feet/second. The speeds are equal. Comparing the displayed numbers directly is misleading.`;break;
      }
      case 'slope':{
        const rise=even,run=n,b=n+1;out.audit={kind,v,rise,run,b};
        if(v===0){out.prompt='What is the slope of the line shown? Check the numbered axes.';out.graph={lines:[{m:rise/run,b,color:'#2468e5'}],xmin:0,xmax:run+2,ymin:0,ymax:rise+b+5,points:[[0,b],[run,rise+b]]};numeric(rise/run,[rise,run,rise+run]);}
        else if(v===1){out.prompt='The table gives points on a straight line. What is its slope?';table(['x','y'],[[1,b],[1+run,b+rise],[1+2*run,b+2*rise]],'CHANGE IN y / CHANGE IN x');numeric(rise/run,[rise,run,b]);}
        else{out.prompt=`A line passes through (${run}, ${b+rise}) and (0, ${b}). What is its slope?`;numeric(rise/run,[rise,-rise/run,b]);}
        out.tip='Slope = change in y ÷ change in x. Read the axis values, not the picture’s angle.';out.explanation=`The rise is ${rise} and the run is ${run}. Slope = ${rise} ÷ ${run} = ${fmt(rise/run)}. The intercept is a different quantity.`;break;
      }
      case 'intercept':{
        const m=even/2,b=n+1,x=n,y=m*x+b;out.audit={kind,v,m,b,x,y};
        if(v===0){out.prompt='The graph shows only part of a line. What is its y-intercept?';out.graph={lines:[{m,b,color:'#2468e5'}],xmin:x-1,xmax:x+3,ymin:y-m-1,ymax:y+3*m+2,points:[[x,y],[x+1,y+m]],cropped:true};numeric(b,[y,m,0]);}
        else if(v===1){out.prompt='The points in the table lie on a straight line. What is its y-intercept?';table(['x','y'],[[x,y],[x+1,y+m],[x+2,y+2*m]],'EXTEND BACK TO x = 0');numeric(b,[y,m,y+m]);}
        else{out.prompt=`A delivery service charges y = ${m}x + ${b} dollars for x miles. What is the charge before any miles are travelled?`;numeric(b,[m,y,m+b]);}
        out.tip='The y-intercept is y when x = 0—not the first visible point.';out.explanation=`The slope is ${m}. Moving ${x} x-units back from (${x}, ${y}) lowers y by ${m*x}, giving ${y} − ${m*x} = ${b}. That is also the fixed starting amount in y = ${m}x + ${b}.`;break;
      }
      case 'graphvalue':{
        const m=even/2,b=n,x=n+2;out.audit={kind,v,m,b,x};
        out.graph={lines:[{m,b,color:'#2468e5'}],xmin:0,xmax:x+1,ymin:0,ymax:m*(x+1)+b+2,points:[[0,b],[x,m*x+b]]};
        if(v===0){out.prompt=`The line shows total cost y in dollars for x items. What is the total cost of ${x} items?`;numeric(m*x+b,[m*x,m,b]);}
        else if(v===1){out.prompt=`The line shows total cost y in dollars for x items. How much does the cost increase when the number of items increases from ${x-2} to ${x}?`;numeric(2*m,[m*x+b,b,2*m+b]);}
        else{out.prompt=`The line shows total cost y in dollars for x items. What is the additional charge for ONE more item?`;numeric(m,[b,m*x+b,m+b]);}
        out.tip='Read what is ASKED: a total, a change, or a per-item rate.';out.explanation=`The line is y = ${m}x + ${b}. Its total at x = ${x} is ${m*x+b}; a two-item change is ${2*m}; its per-item rate is ${m}. The fixed amount ${b} is not added again when finding a change.`;break;
      }
      case 'direction':{
        const slopes=[n,-0.25,-even,0.5],intercepts=[n+1,even+3,n+2,even];out.audit={kind,v,slopes,intercepts};out.prompt='Which function has y INCREASING at the smallest rate as x increases?';
        const order=[0,1,2,3];for(let j=0;j<seed%4;j++)order.push(order.shift());out.audit.order=order;
        out.choices=order.map((i,j)=>v===1?`y = ${fmt(slopes[i])}x + ${intercepts[i]}`:`Graph ${'ABCD'[j]}`);out.correct=order.indexOf(3);
        if(v!==1){const ymin=Math.min(0,...slopes.map((m,i)=>m*4+intercepts[i]))-1,ymax=Math.max(...slopes.map((m,i)=>Math.max(intercepts[i],m*4+intercepts[i])))+1;out.choiceGraphs=order.map(i=>({lines:[{m:slopes[i],b:intercepts[i],color:'#2468e5'}],xmin:0,xmax:4,ymin,ymax,points:[[0,intercepts[i]],[4,slopes[i]*4+intercepts[i]]]}));}
        out.tip='First keep only POSITIVE slopes. Then choose the smallest positive slope.';out.explanation=`The positive slopes are ${n} and 0.5. The smaller is 0.5. A negative slope represents decreasing, even if its magnitude is small. Intercepts do not set the rate.`;break;
      }
      case 'count':{
        const offset=n,rows=[['Jan',10+offset,6+offset],['Feb',12+offset,8+offset],['Mar',15+offset,20+offset],['Apr',23+offset,27+offset],['May',30+offset,33+offset],['Jun',35+offset,39+offset],['Jul',38+offset,38+offset]];out.audit={kind,v,rows};
        out.prompt=v===0?'A is the number of months Town A is warmer; B is the number Town B is warmer. What is B − A?':v===1?'What fraction of the listed months has Town B strictly warmer than Town A?':'How many listed months have DIFFERENT temperatures in the two towns?';
        if(v===0)numeric(2,[4,6,7]);else if(v===1)choices('4/7',['2/7','4/6','5/7']);else numeric(6,[7,4,2]);
        if(v===0||v===2)table(['Month','Town A °F','Town B °F'],rows,'COMPARE EACH MONTH');else out.series={labels:rows.map(r=>r[0]),lines:[{name:'Town A',values:rows.map(r=>r[1]),color:'#2468e5'},{name:'Town B',values:rows.map(r=>r[2]),color:'#bb6148'}]};
        out.tip='Count the requested cases. Equal values do not count as “higher.” Then do the final requested operation.';out.explanation='Town A is warmer in 2 months; Town B is warmer in 4; July is a tie. Thus B − A = 2, Town B is warmer in 4/7 of the months, and 6 months have different values.';break;
      }
      case 'grouping':{
        const a=n+5,b=n;out.audit={kind,v,a,b};out.prompt='Compare the quantities. Watch where the bars begin and end.';
        const pairs=[[[`2|−${a}| − 2|${b}|`,`2|−${a} − ${b}|`],[2*a-2*b,2*(a+b)]],[[`|−${a} + ${b}|`,`|−${a}| + |${b}|`],[a-b,a+b]],[[`−|−${a}| + ${b}`,`|−${a} + ${b}|`],[-a+b,a-b]]];out.columns=pairs[v][0];comparison(...pairs[v][1]);out.tip='Calculate INSIDE each pair of bars first. A minus sign OUTSIDE stays outside.';out.explanation=`Column A = ${pairs[v][1][0]}; Column B = ${pairs[v][1][1]}. Absolute value makes the inside result nonnegative, but does not distribute over addition or subtraction.`;break;
      }
      case 'absequation':{
        const c=n,k=even;out.audit={kind,v,c,k};
        if(v===0){out.prompt=`How many real values of x satisfy |x − ${c}| = ${k}?`;numeric(2,[1,0,k]);}
        else if(v===1){out.prompt=`The two solutions of |x − ${c}| = ${k} are added. What is their sum?`;numeric(2*c,[c+k,k,2*k]);}
        else{out.prompt=`Which statement must be true if |x| = ${k}?`;choices(`x is ${k} or −${k}.`,[`x must be ${k}.`,`x must be −${k}.`,`x is 0.`]);}
        out.tip='A positive absolute value usually gives TWO cases: the inside can be positive or negative.';out.explanation=v===2?`Both ${k} and −${k} have absolute value ${k}.`:`x − ${c} = ${k} or −${k}. Therefore x = ${c+k} or ${c-k}; there are two solutions and their sum is ${2*c}.`;break;
      }
      case 'signed':{
        const a=n,b=n+2,c=even;out.audit={kind,v,a,b,c};
        const answers=[-a*b+c,-a*b-c,a*b-c],expressions=[`−${a} × ${b} − (−${c})`,`−${a} × (${b}) + (−${c})`,`(−${a}) × (−${b}) − ${c}`];out.prompt=`Evaluate ${expressions[v]}.`;numeric(answers[v],[a*b+c,-answers[v],-(a+b+c)]);out.tip='Multiply first. Subtracting a negative adds; a negative times a negative is positive.';out.explanation=`After multiplication and then the final addition/subtraction, the result is ${answers[v]}. Keep the operation sign separate from the sign of the number.`;break;
      }
      case 'part':{
        const amount=even*100,p=n*5,portion=amount*p/100;out.audit={kind,v,amount,p,portion};
        if(v===0){out.prompt=`What is ${p}% of ${amount}?`;numeric(portion,[portion/10,portion*10,amount-p]);}
        else if(v===1){out.prompt=`A club has ${amount} members. ${portion} choose swimming; all others choose tennis. What percent choose swimming?`;choices(percent(p),[percent(100-p),percent(p/10),percent(p*2)]);}
        else{out.prompt='What percent of the total distance was driven on the first two days?';const first=amount*0.15,second=amount*0.25;table(['Day','Miles'],[[1,first],[2,second],[3,amount-first-second]],'TRIP');choices('40%',['60%','25%','15%']);}
        out.tip='Percent means per hundred. For part/whole, divide by the TOTAL—not the remaining part.';out.explanation=v===2?`The first two days total ${amount*0.4}; the whole trip is ${amount}. ${amount*0.4} ÷ ${amount} × 100 = 40%.`:`${p}% = ${p}/100. ${amount} × ${p}/100 = ${portion}. Conversely, ${portion} ÷ ${amount} × 100 = ${p}%. Check whether the answer’s size is sensible.`;break;
      }
      case 'base':{
        const old=even*4,increase=old/4,newer=old+increase;out.audit={kind,v,old,newer};
        if(v===0){out.prompt=`A price rises from $${old} to $${newer}. What is the percentage increase?`;choices('25%',['20%','75%','125%']);}
        else if(v===1){out.prompt=`A price falls from $${newer} to $${old}. What is the percentage decrease?`;choices('20%',['25%','80%','5%']);}
        else{out.prompt=`A store raises a price from $${old} to $${newer}, then lowers it back to $${old}. Compare the percentage increase with the percentage decrease.`;out.columns=['Percentage increase','Percentage decrease'];comparison(25,20);}
        out.tip='Percentage change = change ÷ ORIGINAL amount for THAT change.';out.explanation=`The change is $${increase}. Going up, divide by ${old}: 25%. Going down, divide by ${newer}: 20%. The same dollar change can have different percentages because the bases differ.`;break;
      }
      case 'reverse':{
        const original=even*20,p=v===0?25:v===1?20:10,factor=v===1?1+p/100:1-p/100,final=original*factor;out.audit={kind,v,original,p,factor,final};
        out.prompt=v===1?`After a ${p}% increase, a fee is $${fmt(final)}. What was the original fee?`:`After a ${p}% discount, an item costs $${fmt(final)}. What was its original price?`;numeric(original,[final*(v===1?1-p/100:1+p/100),final,original-final]);out.tip='The final amount is a MULTIPLE of the original. Divide by that multiplier.';out.explanation=`Final = original × ${fmt(factor)}. Therefore original = ${fmt(final)} ÷ ${fmt(factor)} = ${original}. Applying the percentage directly to the final amount uses the wrong base.`;break;
      }
      case 'compound':{
        const start=even*100,p=20,a=1.2,b=v===0?0.8:v===1?1.2:0.75,result=start*a*b;out.audit={kind,v,start,a,b,result};out.prompt=v===0?`A quantity starts at ${start}, increases by 20%, and then decreases by 20%. What is the final quantity?`:v===1?`A quantity starts at ${start} and increases by 20% twice. What is the final quantity?`:`A price starts at $${start}, increases by 20%, then decreases by 25%. What is the final price?`;numeric(result,[start,start*(1+(v===0?0:v===1?0.4:-0.05)),result/10]);out.tip='Multiply each change factor in order. Do not add the percentages.';out.explanation=`${start} × ${a} × ${b} = ${fmt(result)}. The second percentage applies to the amount AFTER the first change.`;break;
      }
      case 'dimension':{
        const side=even,scale=v===0?1.5:v===1?2:0.5,power=v===1?3:2,factor=scale**power;out.audit={kind,v,side,scale,power};
        out.prompt=v===0?`Each side of a square is increased by 50%. By what percent does its AREA increase?`:v===1?'Each edge of a cube is doubled. The new volume is how many times the original volume?':'Each side of a square is reduced by 50%. By what percent does its AREA decrease?';
        if(v===1)numeric(factor,[2,4,6]);else choices(percent(v===0?(factor-1)*100:(1-factor)*100),[percent(50),percent(v===0?225:25),percent(v===0?100:50)]);
        out.tip='Length scales by k; area by k²; volume by k³. Distinguish a final percentage from a percentage CHANGE.';out.explanation=`The length factor is ${scale}. The ${power===3?'volume':'area'} factor is ${scale}^${power} = ${factor}. ${v===1?'That is 8 times the original volume.':v===0?'The new area is 225% of the original, so the INCREASE is 125%.':'The new area is 25% of the original, so the DECREASE is 75%.'}`;break;
      }
      case 'cases':{
        const a=n,c=even,y1=even-n,x2=seed%2?n:-n;out.audit={kind,v,a,c,y1,x2};const xa=(y1-c)/a,yb=a*x2+c;
        if(v===0||v===1){out.prompt=`${a}x − y = −${c}. Evaluate each column as a separate case.`;out.columns=[`x when y = ${y1}`,`y when x = ${x2}`];comparison(xa,yb);}
        else{out.prompt=`For ${a}x − y = −${c}, find y when x = ${x2}.`;numeric(yb,[a*x2-c,-yb,xa]);}
        out.tip='Substitute ONLY the condition given for that case. Keep the minus sign attached to y.';out.explanation=`When y = ${y1}, ${a}x = ${fmt(y1-c)}, so x = ${fmt(xa)}. Separately, when x = ${x2}, y = ${a*x2} + ${c} = ${yb}. Do not carry one column’s condition into the other.`;break;
      }
      case 'system':{
        const x=n+2,y=n,a=x+2*y,b=2*x+y;out.audit={kind,v,x,y,a,b};out.prompt=`x + 2y = ${a} and 2x + y = ${b}. `;
        if(v===0){out.prompt+='What is x − y?';numeric(x-y,[x+y,x,y]);}
        else if(v===1){out.prompt+='Compare the quantities.';out.columns=['x','y + 2'];comparison(x,y+2);}
        else{out.prompt+='What is xy?';numeric(x*y,[x+y,x-y,a*b]);}
        out.tip='Solve the two equations, then answer the requested expression—not just x or y.';out.explanation=`Elimination gives y = ${y} and x = ${x}. Thus x − y = 2, x = y + 2, and xy = ${x*y}.`;break;
      }
      case 'setup':{
        const factor=n,weeks=even,difference=weeks*(factor-1)*n;out.audit={kind,v,factor,weeks,difference};
        if(v===0){out.prompt=`Ada earns ${factor} times Ben’s weekly pay. Over ${weeks} weeks Ada earns $${difference} MORE than Ben. If b is Ben’s weekly pay, which equation represents this?`;choices(`${weeks*factor}b − ${weeks}b = ${difference}`,[`${weeks*factor}b + ${weeks}b = ${difference}`,`${factor}b − b = ${difference}`,`${weeks}b − ${weeks*factor}b = ${difference}`]);}
        else if(v===1){out.prompt=`Ada earns ${factor} times Ben’s weekly pay. Over ${weeks} weeks, Ada earns $${difference} more. What is Ben’s weekly pay?`;numeric(n,[difference/weeks,difference/factor,difference]);}
        else{out.prompt=`A ride costs a fixed fee of $${n} plus $${even} per mile. Which expression gives the price of x miles?`;choices(`${even}x + ${n}`,[`${n}x + ${even}`,`${even}(x + ${n})`,`${n} + x`]);}
        out.tip='Translate MORE into a difference. Separate fixed amounts from per-unit amounts.';out.explanation=v===2?`The per-mile amount ${even} multiplies x; the fixed fee ${n} is added once.`:`Over ${weeks} weeks, Ada’s pay is ${weeks*factor}b and Ben’s is ${weeks}b. Their difference equals ${difference}, so b = ${difference} ÷ ${weeks*(factor-1)} = ${n}.`;break;
      }
      case 'powers':{
        const exp=seed%3+2;out.audit={kind,v,exp};out.prompt='Compare the quantities.';
        if(v===0){out.columns=[`0.01^${exp}`,`0.1^${2*exp}`];comparison(1,1);}
        else if(v===1){out.columns=[`0.1^${exp}`,`0.1^${exp+1}`];comparison(10**-exp,10**-(exp+1));}
        else{out.prompt=`What is (0.1)^${exp}?`;choices('0.'+'0'.repeat(exp-1)+'1',['0.'+'0'.repeat(exp)+'1',fmt(exp/10),fmt(1/10)]);}
        out.tip='For a base between 0 and 1, another multiplication makes the result SMALLER.';out.explanation=`0.01 = 0.1². Therefore 0.01^${exp} = 0.1^${2*exp}. Also 0.1^${exp} = 0.${'0'.repeat(exp-1)}1; increasing the exponent by one divides it by 10.`;break;
      }
      case 'angles':{
        const a=30+seed%6*15;out.audit={kind,v,a};out.diagram={type:'angles',a};
        if(v===0){out.prompt=`Two straight lines intersect. Angle A is ${a}°. What is the angle directly OPPOSITE A?`;choices(a+'°',[(180-a)+'°',(a/2)+'°','180°']);}
        else if(v===1){out.prompt=`Two straight lines intersect. Angle A is ${a}°. What is the angle ADJACENT to A on a straight line?`;choices((180-a)+'°',[a+'°',(a/2)+'°','180°']);}
        else{out.prompt=`Two straight lines intersect. One angle is ${a}°. What is the sum of the other THREE angles?`;choices((360-a)+'°',[(180-a)+'°',(2*a)+'°','360°']);}
        out.tip='Opposite angles are equal; adjacent straight-line angles sum to 180°. All four sum to 360°.';out.explanation=`The opposite angle is ${a}°, each adjacent angle is ${180-a}°, and the other three sum to ${360-a}°. Notice whether the question says opposite, adjacent, or sum.`;break;
      }
      case 'net':{
        const faces=Math.floor(seed/3)%5+3,shape={3:'triangular',4:'square',5:'pentagonal',6:'hexagonal',7:'heptagonal'}[faces];out.audit={kind,v,faces,shape};
        if(v===0){out.prompt=`A net has one ${shape} base (${faces} sides) and ${faces} triangular faces. Which solid does it form?`;if(faces===4)out.diagram={type:'pyramidNet'};choices(`${shape[0].toUpperCase()+shape.slice(1)} pyramid`,[`${shape[0].toUpperCase()+shape.slice(1)} prism`,'Rectangular prism','Cylinder']);}
        else if(v===1){out.prompt=`A net has two congruent ${shape} bases (${faces} sides each) and ${faces} rectangular side faces. Which solid does it form?`;choices(`${shape[0].toUpperCase()+shape.slice(1)} prism`,[`${shape[0].toUpperCase()+shape.slice(1)} pyramid`,'Cone','Cylinder']);}
        else{out.prompt=`A prism has two matching bases, each with ${faces} sides. How many faces does the solid have altogether?`;numeric(faces+2,[faces+1,faces*2,faces]);}
        out.tip='A prism has TWO matching bases and one side face per base edge. A pyramid has ONE base and triangular sides.';out.explanation=`For a ${faces}-sided base, a prism has ${faces} rectangular sides plus 2 bases: ${faces+2} faces. A pyramid has ${faces} triangular sides plus 1 base: ${faces+1} faces.`;break;
      }
      default:throw new Error('Question not implemented');
    }
    return out;
  }
  const layouts=[
    ['speed','slope','grouping','part','cases','intercept','remaining','base','direction','signed','mixture','graphvalue','reverse','setup','powers'],
    ['relative','intercept','absequation','dimension','system','slope','unitprice','part','graphvalue','grouping','units','count','compound','angles','net'],
    ['remaining','direction','signed','base','setup','graphvalue','relative','reverse','count','absequation','speed','slope','dimension','powers','net'],
    ['unitprice','count','grouping','compound','cases','intercept','mixture','base','slope','signed','relative','direction','part','angles','net'],
    ['speed','graphvalue','absequation','reverse','system','direction','units','dimension','intercept','grouping','base','count','compound','powers','angles'],
    ['remaining','slope','signed','part','cases','intercept','unitprice','reverse','count','absequation','dimension','direction','base','setup','net']
  ];
  const titles=['Notice the relationship','Meet the different forms','Change the conditions','Change what is asked','Mixed independent check A','Mixed independent check B'];
  const descriptions=['Check the foundations, then solve less familiar versions.','Practice different representations, including graphs, tables, and separate cases.','The givens, unknowns, units, or conditions change—not just the numbers.','Read the exact requested quantity before choosing a method.','No topic labels before answering. Complete the first-pass check before reviewing mistakes.','A fresh delayed check. First-attempt scores stay separate from corrections.'];
  const occurrences={};
  const sets=layouts.map((layout,i)=>({number:i+1,id:'set-'+(i+1),label:titles[i],description:descriptions[i],day:['Monday · October 12','Tuesday · October 13','Wednesday · October 14','Thursday · October 15','Friday · October 16','Saturday · October 17'][i],check:i>=4,questionIds:layout.map((k,j)=>{const occurrence=occurrences[k]||0;occurrences[k]=occurrence+1;return k+'@'+(3*(1+i*15+j)+occurrence%3);})}));
  sets.push({number:7,id:'set-7',label:'Automatic targeted follow-up',description:'Up to three missed concepts receive five fresh variants each. Selection uses first-attempt mistakes, not corrected scores.',day:'Optional · adapts to your answers',adaptive:true,check:false});
  sets.push({number:8,id:'set-8',label:'Fresh mixed transfer challenge',description:'An optional 25-question independent check. Extra rates, signs, and algebra checks balance the evidence from Sets 5 and 6. No topic labels or hints before answering.',day:'Optional · ideally after a delay',check:true,questionIds:['relative','intercept','grouping','reverse','cases','speed','absequation','system','base','slope','remaining','signed','setup','compound','direction','mixture','grouping','cases','unitprice','absequation','system','cases','signed','setup','units'].map((k,j)=>k+'@'+(301+j))});
  root.MarcoSkillCourse={skills,names,group,question,sets,version:1};
})(typeof window==='undefined'?globalThis:window);
