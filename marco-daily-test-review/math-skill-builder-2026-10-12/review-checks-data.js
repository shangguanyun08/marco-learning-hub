(function(root){
  'use strict';
  const C=root.MarcoSkillCourse,bank=C.checkpointQuestions;
  const fixed=['Column A is greater.','Column B is greater.','The quantities are equal.','The relationship cannot be determined.'];
  const labels={intercept:'Y-intercept',count:'Data comparisons & ties',absequation:'Both absolute-value solutions',proportions:'Equivalent proportions',units:'Converting speed units',dimension:'Area & volume scaling'};
  const skill={intercept:'graphs',count:'graphs',absequation:'absolute',proportions:'rates',units:'rates',dimension:'percent'};
  const fmt=n=>String(Number(n.toFixed(6))),positions=[1,3,0,2,2,0,3,1,0,2,1,3];
  const rows=(labels,a,b)=>labels.map((x,i)=>[x,a[i],b[i]]);
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
  const configs=[
    {number:8,lines:[[2,15,6,9],[-3,42,5,8]],sum:[14,23],pair:[3,-6,15],proportion:[16,10,5,8,'a','b'],denominators:[12,20,3,5,'m','n'],speed:[65,91],convert:[66,'fps'],scale:[[6,3,1,'Each edge of a cube becomes 6 times as long. The new volume is how many times the original volume?',216,[6,18,36]],[.2,3,1,'Each edge of a cube is reduced to one fifth of its original length. The new volume is what fraction of the original volume?','1/125',['1/5','1/25','4/5']]],
      difference:rows(days.slice(0,6),[12,18,24,30,36,40],[16,18,22,34,36,44]),fraction:rows(months,[10,14,20,24,30,34,38,42],[15,14,18,29,28,39,38,40])},
    {number:9,lines:[[-2,38,5,9],[4,-7,3,6]],sum:[-4,17],pair:[2,5,19],proportion:[21,15,5,7,'p','q'],denominators:[14,22,7,11,'r','s'],speed:[70,110],convert:[72,'mph'],scale:[[1.12,2,0,'Each side of a square is increased by 12%. By what percent does its area increase?','25.44%',['12%','24%','125.44%']],[2/3,3,1,'Each edge of a cube is reduced to two thirds of its original length. The new volume is what fraction of the original volume?','8/27',['2/3','4/9','1/3']]],
      difference:rows(days,[15,20,28,30,36,40,44],[12,23,24,30,33,43,41]),fraction:rows(months.slice(0,6),[14,18,24,28,34,40],[18,16,24,33,31,38])},
    {number:10,lines:[[1.5,-4,6,10],[-4,55,6,9]],sum:[16,25],count:[3,-12,21],proportion:[24,18,3,4,'x','y'],denominatorValue:[15,25,9],speed:[135,198],convert:[99,'fps'],scale:[[.9,2,2,'Each side of a square is decreased by 10%. By what percent does its area decrease?','19%',['10%','20%','81%']],[2,3,0,'Each edge of a cube is increased by 100%. By what percent does its volume increase?','700%',['100%','300%','800%']]],
      difference:rows(days,[10,17,22,28,33,38,44],[13,17,20,31,33,42,41]),fraction:rows(months.slice(0,7),[12,18,22,28,32,38,42],[15,18,26,25,36,38,46])}
  ];
  function build(c){
    const questions=[];
    function add(concept,prompt,answer,wrong,explanation,extra={}){
      const q={concept,skill:skill[concept],label:labels[concept],prompt,answer:String(answer),wrong:wrong.map(String),tip:explanation,explanation,difficulty:'Focused review check',...extra};questions.push(q);return q;
    }
    c.lines.forEach(([m,b,x,z],i)=>{
      const points=[[x,m*x+b],[z,m*z+b]],tableRows=[...points,[z+(z-x),m*(z+(z-x))+b]];
      const visual=i===0?{graph:{lines:[{m,b,color:'#2468e5'}],xmin:x-1,xmax:z+2,ymin:Math.min(...points.map(p=>p[1]))-5,ymax:Math.max(...points.map(p=>p[1]))+6,points,cropped:true}}:{table:{headers:['x','y'],rows:tableRows}};
      add('intercept',i===0?'Only part of a straight line is shown. What is its y-intercept?':'The table lists points on a straight line. What is its y-intercept?',b,[m,points[0][1],points[1][1]],`Slope = (${points[1][1]} − ${points[0][1]}) ÷ (${z} − ${x}) = ${m}. Then b = y − mx = ${points[0][1]} − (${m}) × ${x} = ${b}.`,{...visual,audit:{kind:'intercept',m,x,y:m*x+b}});
    });
    [c.difference,c.fraction].forEach((data,i)=>{
      const a=data.filter(r=>r[1]>r[2]).length,b=data.filter(r=>r[2]>r[1]).length,n=data.length;
      const visual={table:{headers:[i?'Month':'Day','Town A (°C)','Town B (°C)'],rows:data}};
      if(i)visual.series={labels:data.map(r=>r[0]),lines:[{name:'Town A',values:data.map(r=>r[1]),color:'#2468e5'},{name:'Town B',values:data.map(r=>r[2]),color:'#bb6148'}]};
      add('count',i?'In what fraction of the listed months is Town B strictly warmer than Town A?':'A is the number of days Town A is warmer; B is the number Town B is warmer. What is B − A?',i?`${b}/${n}`:b-a,i?[`${b+1}/${n}`,`${b}/${n-1}`,`${b-1}/${n}`]:[a,b,a+b],i?`Town B is strictly warmer in ${b} of ${n} months. Tied months stay in the denominator, but do not count as warmer.`:`A = ${a}; B = ${b}. Ties count for neither. B − A = ${b} − ${a} = ${b-a}.`,{...visual,audit:{kind:'count',v:i,rows:data}});
    });
    const [center,k]=c.sum;
    add('absequation',`The two solutions of |x ${center<0?'+':'−'} ${Math.abs(center)}| = ${k} are added. What is their sum?`,center*2,[center+k,center-k,k*2],`Solve both cases: x = ${center+k} or ${center-k}. Their sum is ${center*2}.`,{audit:{kind:'absequation',v:1,c:center,k}});
    if(c.pair){const [a,b,k]=c.pair,positive=(k-b)/a,negative=(-k-b)/a;
      const pair=(x,y)=>`x = ${fmt(x)} or x = ${fmt(y)}`;
      add('absequation',`Which pair gives ALL solutions of |${a}x ${b<0?'−':'+'} ${Math.abs(b)}| = ${k}?`,pair(positive,negative),[pair(positive,-negative),pair(-positive,negative),pair(-positive,-negative)],`Set ${a}x ${b<0?'−':'+'} ${Math.abs(b)} equal to ${k} and to −${k}. The two solutions are ${positive} and ${negative}.`,{audit:{kind:'abs-pair',a,b,k}});
    }else{const [a,b,k]=c.count;add('absequation',`How many real values of x satisfy |${a}x − ${Math.abs(b)}| = ${k}?`,2,[0,1,k],`The inside can equal ${k} or −${k}. These give x = ${(k-b)/a} and x = ${fmt((-k-b)/a)}: two values.`,{audit:{kind:'absequation',v:0,c:-b/a,k:k/a}});}
    const [ld,rd,lc,rc,l,r]=c.proportion;
    add('proportions',`If ${l}/${ld} = ${r}/${rd}, which equation must be true?`,`${lc}${l} = ${rc}${r}`,[`${rc}${l} = ${lc}${r}`,`${l}${r} = ${ld*rd}`,`${l} + ${r} = ${ld+rd}`],`Cross-multiply: ${rd}${l} = ${ld}${r}. Simplify to ${lc}${l} = ${rc}${r}.`,{audit:{kind:'proportion-equation',ld,rd,lc,rc,l,r}});
    if(c.denominators){const [ln,rn,lc,rc,l,r]=c.denominators;
      add('proportions',`If ${ln}/${l} = ${rn}/${r}, where ${l} and ${r} are positive, which equation must be true?`,`${lc}${r} = ${rc}${l}`,[`${lc}${l} = ${rc}${r}`,`${l}${r} = ${ln*rn}`,`${l} + ${r} = ${ln+rn}`],`Cross-multiply: ${ln}${r} = ${rn}${l}. Simplify to ${lc}${r} = ${rc}${l}.`,{audit:{kind:'proportion-denominators',ln,rn,lc,rc,l,r}});
    }else{const [ln,rn,ld]=c.denominatorValue,answer=rn*ld/ln;add('proportions',`If ${ln}/m = ${rn}/n and m = ${ld}, what is n?`,answer,[ln*ld/rn,ld+rn-ln,ln+rn],`Cross-multiply: ${ln}n = ${rn}m. Substitute m = ${ld}: n = ${rn} × ${ld} ÷ ${ln} = ${answer}.`,{audit:{kind:'proportion-denominator-value',ln,rn,ld}});}
    const [mph,fps]=c.speed,converted=mph*5280/3600;
    const comparison=add('units',`Vehicle A travels ${mph} miles per hour. Vehicle B travels ${fps} feet per second. Use 5,280 feet per mile and 3,600 seconds per hour. Compare their speeds.`,'_',['_a','_b','_c'],`Convert A: ${mph} × 5280 ÷ 3600 ${Number.isInteger(converted*1000)?'=':'≈'} ${fmt(converted)} feet per second. Compare with ${fps}.`,{columns:['Vehicle A’s speed','Vehicle B’s speed'],audit:{kind:'units',v:0,mph,fps}});
    comparison.fixedCorrect=Math.abs(converted-fps)<1e-9?2:converted>fps?0:1;
    const [speed,unit]=c.convert,toMph=unit==='fps',answer=toMph?speed*3600/5280:speed*5280/3600;
    add('units',`A vehicle travels ${speed} ${toMph?'feet per second':'miles per hour'}. What is its speed in ${toMph?'miles per hour':'feet per second'}? Use 5,280 feet per mile and 3,600 seconds per hour.`,fmt(answer),[speed,fmt(toMph?speed*5280/3600:speed*3600/5280),fmt(answer*2)],`Multiply by ${toMph?'3,600 seconds/hour and divide by 5,280 feet/mile':'5,280 feet/mile and divide by 3,600 seconds/hour'}: ${fmt(answer)} ${toMph?'miles per hour':'feet per second'}.`,{audit:{kind:'unit-conversion',speed,toMph}});
    c.scale.forEach(([scale,power,v,prompt,answer,wrong])=>{
      const factor=scale**power,baseLabel=scale===2/3?'2/3':scale===.2?'1/5':fmt(scale),method=v===1?`The ${power===3?'volume':'area'} factor is (${baseLabel})${power===3?'³':'²'} = ${answer}.`:v===0?`The ${power===3?'volume':'area'} factor is ${fmt(factor)}. Subtract 1, then multiply by 100: ${answer}.`:`The area factor is ${fmt(factor)}. Subtract from 1, then multiply by 100: ${answer}.`;
      add('dimension',prompt,answer,wrong,method,{audit:{kind:'dimension',v,scale,power}});
    });
    // Interleave the six targets; each set has a different order and new givens.
    const orders={8:[0,4,6,2,8,10,5,1,11,9,3,7],9:[2,8,4,10,6,0,9,3,1,7,11,5],10:[6,10,0,8,2,4,11,7,5,3,9,1]};
    return orders[c.number].map((index,i)=>{
      const q=questions[index],id=`cp${c.number}r-${String(i+1).padStart(2,'0')}`,correct=positions[(i+c.number-8)%12],choices=[...q.wrong];choices.splice(correct,0,q.answer);
      const out={...q,id,choices:q.fixedCorrect===undefined?choices:[...fixed],correct:q.fixedCorrect??correct};delete out.answer;delete out.wrong;delete out.fixedCorrect;
      if(out.choices.length!==4||new Set(out.choices).size!==4)throw Error('Invalid choices: '+id);
      bank[id]=out;return id;
    });
  }
  C.reviewCheckSource={review2Version:79,review2UpdatedAt:'2026-10-20T03:13:39.935Z',review3Status:'No saved answers when these sets were created',concepts:Object.keys(labels)};
  // Keep the previous 20-question Set 8 definition and bank for saved/offline work.
  C.legacySets.push({...C.sets.find(s=>s.number===8)});
  C.sets.splice(7,1,...configs.map((c,i)=>({number:c.number,id:`set-${c.number}-review-12-v3`,label:`12-question review check ${'ABC'[i]}`,description:'12 fresh mixed questions: 2 each on y-intercept, data comparisons and ties, both absolute-value solutions, equivalent proportions, speed-unit conversions, and area/volume scaling. Based on Review 2 weaknesses and the Review 3 practice topics. Goal: 11/12 correct on the first try (at least 90%).',day:`Set ${c.number}`,check:true,checkpoint:true,noRound2:true,contentVersion:'review-12-v3',targetCorrect:11,questionIds:build(c)})));
})(typeof window==='undefined'?globalThis:window);
