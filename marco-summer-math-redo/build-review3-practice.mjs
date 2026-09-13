// Fixed selection from Marco's saved first answers on September 13, 2026.
// Review IDs are independent of the source attempts, which remain unchanged.
import { readFile, writeFile } from 'node:fs/promises';
const read = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
const reviews = await read('./review-bank.json'), original = await read('./question-bank.json'), plan = await read('./session-plan.json');
const day = 32, sourceSessionDays = [18, 19, 20, 21, 22, 25];
const sources = [
  ['d05-q04','Travel time'], ['d05-q06','Comparing solutions'], ['d05-q08','Even powers'], ['d05-q09','Comparing race times'],
  ['d05-q13','Comparing expressions'], ['d06-q02','Intervals on a number line'], ['d06-q03','Reading decimal number lines'],
  ['d06-q04','Average on a number line'], ['d06-q05','Adding signed decimals','unfinished'], ['d06-q06','Finding a missing average value','unfinished'],
  ['d06-q07','Integers on a number line','unfinished'], ['d06-q08','Estimating quotients','unfinished'], ['d06-q09','Estimating fractions','unfinished'],
  ['d06-q12','Decimals and percents'], ['d06-q13','Multiplying powers of ten'], ['d06-q17','Comparing scientific notation'],
  ['d10-q04','Rotating coordinates'], ['d10-q06','Trapezoid vertices'], ['d10-q12','Slope and points'],
  ['d10-q16','Slope and an x-intercept'], ['d10-q17','Slope and a point'], ['d10-q18','Equation through two points','unfinished'],
  ['d10-q19','Fractional slope','unfinished'], ['d11-q01','Parallel lines','unfinished'], ['d11-q02','Axis intercepts','unfinished'],
  ['d11-q03','Reading a line graph'], ['d13-q04','Comparing probabilities'], ['d13-q07','Independent events'], ['d13-q08','Probability and counts'],
];
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const clean = n => Number(n.toFixed(8));
const frac = (n,d) => `<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mtext>${esc(n)}</mtext><mtext>${esc(d)}</mtext></mfrac></math>`;
const svg = (label, body, box='0 0 500 110') => `<svg class="review-diagram${box==='0 0 500 110'?' review3-number-line':''}" viewBox="${box}" role="img" aria-label="${esc(label)}">${body}</svg>`;
const qc = ['Quantity A is greater.', 'Quantity B is greater.', 'The two quantities are equal.', 'The relationship cannot be determined.'];
function item(text,answer,wrong,explanation,html='',input=null) {
  return {text,answer:String(answer),choices:[answer,...wrong].map(String),explanation,html:html||`<p>${esc(text)}</p>`,input};
}
function numeric(text,answer,explanation,html='',unit='') {
  return item(text,answer,[clean(answer+1),clean(answer-1),clean(answer+2)],explanation,html,{kind:'number',unit,hint:unit==='%'?'Enter the number before the percent sign.':'Enter your answer.'});
}
function compare(text,a,b,key,explanation,math='') {
  return {text:`${text} Quantity A: ${a}. Quantity B: ${b}. Compare the quantities.`,answer:qc[key],choices:qc,fixed:true,explanation,
    html:`<p>${math||esc(text)}</p><div class="review-data-wrap"><table class="review-data"><thead><tr><th scope="col">Quantity A</th><th scope="col">Quantity B</th></tr></thead><tbody><tr><td>${esc(a)}</td><td>${esc(b)}</td></tr></tbody></table></div>`};
}
function numberLine(start,end,step,points=[],labels=[],segment=null,dots=[]) {
  const x=v=>35+(v-start)/(end-start)*430;
  const ticks=Array.from({length:Math.round((end-start)/step)+1},(_,j)=>clean(start+j*step));
  const label=`Number line: ${labels.join(', ')} are labeled; equal tick spacing. ${points.map(([name,v])=>`${name} is at ${v}`).join('; ')}${segment?`. The entire interval from ${segment[0]} to ${segment[1]} is shaded, including both endpoints.`:''}${dots.length?`. Only individual dots at ${dots.join(', ')} are marked.`:''}`;
  return svg(label,`<path d="M18 54H483 M18 54l10 -5v10z M483 54l-10 -5v10z" fill="#173957" stroke="#173957"/>${ticks.map(v=>`<path d="M${x(v)} 47v14" stroke="#173957"/>`).join('')}${segment?`<path d="M${x(segment[0])} 54H${x(segment[1])}" stroke="#2468e5" stroke-width="6"/>${segment.map(v=>`<circle cx="${x(v)}" cy="54" r="6" fill="#2468e5"/>`).join('')}`:''}${dots.map(v=>`<circle cx="${x(v)}" cy="54" r="5" fill="#2468e5"/>`).join('')}${labels.map(v=>`<text x="${x(v)}" y="86" text-anchor="middle">${v}</text>`).join('')}${points.map(([name,v])=>`<circle cx="${x(v)}" cy="54" r="4" fill="#173957"/><text x="${x(v)}" y="31" text-anchor="middle">${name}</text>`).join('')}`);
}
function grid(points=[],line=null) {
  const bound=Math.max(6,...points.flatMap(p=>[Math.abs(p[1])+1,Math.abs(p[2])+1]));
  const x=v=>200+v*160/bound,y=v=>200-v*160/bound;
  const step=bound>9?2:1,values=Array.from({length:Math.floor(bound/step)*2+1},(_,j)=>(j-Math.floor(bound/step))*step);
  const gridlines=values.map(v=>`<path d="M${x(v)} 40V360 M40 ${y(v)}H360" stroke="#d9e3ed"/>${v?`<text x="${x(v)}" y="219" text-anchor="middle" style="font-size:13px">${v}</text><text x="187" y="${y(v)+4}" text-anchor="end" style="font-size:13px">${v}</text>`:''}`).join('');
  let graph='';
  if(line){const [m,b]=line,candidates=[[-bound,m*-bound+b],[bound,m*bound+b],[(-bound-b)/m,-bound],[(bound-b)/m,bound]].filter(([a,c])=>Math.abs(a)<=bound+1e-8&&Math.abs(c)<=bound+1e-8);const [a,c]=candidates;graph=`<path d="M${x(a[0])} ${y(a[1])}L${x(c[0])} ${y(c[1])}" stroke="#2468e5" stroke-width="3"/>`;}
  return svg(`Coordinate grid. ${points.map(([name,a,b])=>`${name}: (${a}, ${b})`).join('; ')}${line?'. A straight line passes through the marked points.':''}`,`${gridlines}<path d="M30 200H373 M200 373V27" stroke="#173957" stroke-width="2"/><text x="379" y="207">x</text><text x="196" y="22">y</text>${graph}${points.map(([name,a,b])=>`<circle cx="${x(a)}" cy="${y(b)}" r="5" fill="#173957"/><text x="${x(a)+10}" y="${y(b)-10}" style="font-size:14px">${name}</text>`).join('')}`,'0 0 410 395');
}
const equation=(m,b)=>`y = ${m}x ${b<0?'−':'+'} ${Math.abs(b)}`;
function lineItem(text,m,b,explanation,html='') {
  return item(text,equation(m,b),[equation(-Number(m),b),equation(m,b+2),equation(m,b-2)],explanation,html);
}
function build(n,i) {
  switch(n){
    case 1:{const t=3+i,s=70+2*i,d=t*s;return numeric(`Train A travels ${d} miles at ${s} mph. Train B travels three times as far at twice Train A's speed. How many more hours does Train B travel?`,t/2,`Train A takes ${d} ÷ ${s} = ${t} hours. Train B takes ${3*d} ÷ ${2*s} = ${1.5*t} hours. The difference is ${1.5*t} − ${t} = ${t/2} hours.`,'','hours');}
    case 2:{const c=10+i,a=12+2*i,b=3+i%3,A=(c-a/2)/2,B=2*(c-2*b);return compare(`a/2 + 2b = ${c}.`,`the value of b when a = ${a}`,`the value of a when b = ${b}`,A>B?0:A<B?1:2,`For Quantity A, b = (${c} − ${a}/2)/2 = ${A}. For Quantity B, a = 2(${c} − 2 × ${b}) = ${B}. Compare ${A} with ${B}.`,`${frac('a',2)} + 2b = ${c}.`);}
    case 3:{const x=3+i;return compare('Define F(x) = x⁴ + x².',`F(−${x})`,`F(${x})`,2,`Even powers have the same value for a number and its opposite. Both quantities equal ${x}⁴ + ${x}² = ${x**4+x*x}.`);}
    case 4:{const t=10+i;return compare(`Jack finishes a race ${t} minutes slower than Jill. Jill's time is j minutes, with j > ${t}.`,'the time Jack takes, in minutes',`j − ${t}`,0,`A slower finish means more time, so Jack takes j + ${t} minutes. This exceeds j − ${t} by ${2*t} minutes for every permitted j.`);}
    case 5:{const k=5+i,b=3+i;return compare('j can be any real number.',`${k}(${b} − j)`,`${k*b} − j`,3,`Quantity A is ${k*b} − ${k}j. A minus B equals −${k-1}j. It is positive for negative j, zero when j = 0, and negative for positive j. No single relationship is determined.`);}
    case 6:{const a=-10-i,b=-1-i,text='Which description matches the blue part of the number line?';return item(text,`All real numbers from ${a} to ${b}, including both endpoints.`,[`Only the integers from ${a} to ${b}, including both endpoints.`,`All real numbers greater than or equal to ${a}.`,`All real numbers strictly between ${a} and ${b}, excluding both endpoints.`],`The solid segment includes every real value between ${a} and ${b}, including decimals and fractions. The filled endpoint dots include ${a} and ${b}.`,`<p>${text}</p>${numberLine(a-1,b+1,1,[],[a,b],[a,b])}`);}
    case 7:{const off=i/10,a=clean(-.5+off),b=clean(.3+off),c=clean(2.3+off),text='What numbers are represented by A, B, and C, in that order?';return item(text,`${a}, ${b}, ${c}`,[`${a}, ${b}, ${clean(c+.4)}`,`${clean(a-.4)}, ${b}, ${c}`,`${a}, ${clean(b+.4)}, ${c}`],`The labeled values are 5 tick intervals apart, so each step is 2 ÷ 5 = 0.4. Counting along the line gives A = ${a}, B = ${b}, and C = ${c}.`,`<p>${text}</p>${numberLine(clean(-1.7+off),clean(2.7+off),.4,[['A',a],['B',b],['C',c]],[clean(-1.3+off),clean(.7+off)])}`,{kind:'list',hint:'Enter A, B, C, separated by commas.'});}
    case 8:{const q=7.5+i,r=10.5+i,text='What is the average of Q and R on the number line?';return numeric(text,(q+r)/2,`Each tick is 0.5. Q = ${q} and R = ${r}. Their average is (${q} + ${r}) ÷ 2 = ${(q+r)/2}.`,`<p>${text}</p>${numberLine(7+i,12.5+i,.5,[['Q',q],['R',r]],[8+i,11+i])}`);}
    case 9:{const o=i/4,j=-2.75+o,k=-.25+o,l=1.5+o,text='What is the sum of J, K, and L on the number line?';return numeric(text,j+k+l,`Each tick is 0.25. J = ${j}, K = ${k}, and L = ${l}. Their sum is ${j} + (${k}) + ${l} = ${j+k+l}.`,`<p>${text}</p>${numberLine(-3+o,2.75+o,.25,[['J',j],['K',k],['L',l]],[-3,-2,-1,0,1,2].map(v=>v+o))}`);}
    case 10:{const y=-10-2*i,x=-2+2*i,text='X is the average of Y and another number. What is the other number?';return numeric(text,2*x-y,`Each tick is 2. X = ${x} and Y = ${y}. The two numbers must total 2 × ${x} = ${2*x}. The missing number is ${2*x} − (${y}) = ${2*x-y}.`,`<p>${text}</p>${numberLine(-12-2*i,10+2*i,2,[['Y',y],['X',x]],[-6-2*i,4+2*i])}`);}
    case 11:{const b=6+i,text='Which description matches only the blue dots on this number line?';return item(text,`All integers from 0 to ${b}, including both endpoints.`,[`All positive integers less than ${b+1}.`,`All integers less than ${b+1}.`,`All real numbers from 0 to ${b}, including both endpoints.`],`The separate dots mark exactly 0, 1, …, ${b}. Zero is included, negative integers are excluded, and the spaces between the dots are not marked.`,`<p>${text}</p>${numberLine(-1,b+1,1,[],[0,b],null,Array.from({length:b+1},(_,j)=>j))}`);}
    case 12:{const a=83+10*i,b=39,c=63018+7800*i,text=`Estimate ${c.toLocaleString('en-US')} ÷ (${a} × ${b}) by rounding each number to one significant figure. Give the resulting quotient rounded to the nearest whole number.`;const round=x=>{const place=10**Math.floor(Math.log10(x));return Math.round(x/place)*place;},ans=Math.round(round(c)/(round(a)*round(b)));return numeric(text,ans,`Round to ${round(c)}, ${round(a)}, and ${round(b)}. Then ${round(c)} ÷ (${round(a)} × ${round(b)}) = ${round(c)} ÷ ${round(a)*round(b)}. Rounded to the nearest whole number, this is ${ans}.`);}
    case 13:{const a=412+100*i,b=58,c=813,text=`Estimate ${a}/(${b} × ${c}) by rounding each number to one significant figure. Enter your estimate as a fraction.`,round=x=>{const p=10**Math.floor(Math.log10(x));return Math.round(x/p)*p;},num=round(a),den=round(b)*round(c),gcd=(a,b)=>b?gcd(b,a%b):a,g=gcd(num,den);return item(text,`${num/g}/${den/g}`,['1/2','1/3','1/4'],`Rounding gives ${num}/(${round(b)} × ${round(c)}) = ${num}/${den} = ${num/g}/${den/g}.`,`<p>Estimate ${frac(a,`${b} × ${c}`)} by rounding each number to one significant figure. Enter your estimate as a fraction.</p>`,{kind:'number',hint:'Enter a fraction or decimal.'});}
    case 14:{const d=clean(.07+.03*i),ans=clean(d*100);return numeric(`Write ${d} as a percent.`,ans,`To convert a decimal to a percent, multiply by 100: ${d} × 100 = ${ans}. Therefore ${d} = ${ans}%.`,'','%');}
    case 15:{const e=3+i,f=5+i;return compare('Compare the products.',`(2 × 10^${e})(9 × 10^${f})`,`(3 × 10^${e+3})(6 × 10^${f-3})`,2,`Both coefficient products are 18. The exponents on each side add to ${e+f}. Both quantities equal 18 × 10^${e+f}.`);}
    case 16:{const e=7+i;return compare('Compare these values.',`4.1 × 10^${e}`,`5.4 × 10^${e+4} − 1.3 × 10^${e-3}`,1,`In units of 10^${e}, A is 4.1 and B is 54,000 − 0.0013 = 53,999.9987. Thus Quantity B is greater.`);}
    case 17:{const x=-4-i,y=3+i,text=`Point M is (${x}, ${y}). Rotate M 90° clockwise about the origin. What are the new coordinates?`;return item(text,`${y}, ${-x}`,[`${y}, ${x}`,`${-y}, ${-x}`,`${-y}, ${x}`],`A clockwise quarter-turn maps (x, y) to (y, −x). Thus (${x}, ${y}) becomes (${y}, ${-x}).`,'',{kind:'list',hint:'Enter x, y, separated by a comma.'});}
    case 18:{const a=-3-i,b=3+i,c=4+i,d=2+i,e=-2-i,choices=[[a+1,e-1],[a,e],[a,e-2],[a,e-4]],text=`Three trapezoid vertices are A(${a}, ${c}), B(${b}, ${d}), and C(${b}, ${e}). The vertices are named in order A, B, C, D. Which point could NOT be D?`;return item(text,`(${choices[0].join(', ')})`,choices.slice(1).map(p=>`(${p.join(', ')})`),`BC is vertical. Each choice with x = ${a} makes AD vertical too, giving parallel opposite sides. For D = (${choices[0].join(', ')}), AD is not vertical and CD has positive slope while AB has negative slope, so neither pair of opposite sides is parallel.`,`<p>${esc(text)}</p>${grid([['A',a,c],['B',b,d],['C',b,e]])}`);}
    case 19:{const m=-2-i%4,x=4+i,y=5+i,ans=`(${x+1}, ${y+m})`;return item(`A line has slope ${m} and passes through (${x}, ${y}). Which other point is on the line?`,ans,[`(${x+1}, ${y-m})`,`(${x-1}, ${y+m})`,`(${x+2}, ${y+m})`],`Slope is the change in y divided by the change in x. Increasing x by 1 changes y by ${m}, giving (${x+1}, ${y+m}).`);}
    case 20:{const m=-3-i%4,x=1+i,b=-m*x;return lineItem(`A line has slope ${m} and crosses the x-axis at x = ${x}. What is its equation?`,m,b,`The point (${x}, 0) lies on the line. In y = ${m}x + b, substitute this point: 0 = ${m*x} + b, so b = ${b}. The equation is ${equation(m,b)}.`);}
    case 21:{const p=5+i,x=-3,y=7+i,b=y-p,m=`−${p}/3`,ans=`y = ${m}x + ${b}`;return item(`A line has slope −${p}/3 and passes through (${x}, ${y}). What is its equation?`,ans,[`y = ${p}/3x + ${b}`,`y = ${m}x + ${y}`,`y = ${m}x − ${p+y}`],`Substitute (${x}, ${y}) into y = mx + b: ${y} = (−${p}/3)(−3) + b = ${p} + b. Therefore b = ${b} and ${ans}.`,`<p>A line has slope −${frac(p,3)} and passes through (${x}, ${y}). What is its equation?</p>`);}
    case 22:{const x=2+i,y=7+i,m=-4-i%3,b=y-m*x;return lineItem(`A line passes through (${x}, ${y}) and (${x+2}, ${y+2*m}). What is its equation?`,m,b,`Slope = (${y+2*m} − ${y})/(${x+2} − ${x}) = ${m}. Substitute the first point: b = ${y} − (${m}) × ${x} = ${b}. Hence ${equation(m,b)}.`);}
    case 23:{const x=3+2*i,y=1+i,other=y-3,b=y-.5*x;return lineItem(`A line passes through (${x}, ${y}) and (${x-6}, ${other}). What is its equation?`,.5,b,`Slope = (${y} − (${other}))/(${x} − (${x-6})) = 3/6 = 0.5. Then b = ${y} − 0.5 × ${x} = ${b}. The equation is ${equation(.5,b)}.`);}
    case 24:{const m=4+i%4,x=3+i,y=5+i,b=y-m*x;return lineItem(`Line p has equation y = ${m}x + 2. Line q is parallel to p and passes through (${x}, ${y}). What is the equation of q?`,m,b,`Parallel lines have equal slopes, so q has slope ${m}. Substitute (${x}, ${y}): b = ${y} − ${m} × ${x} = ${b}. Thus ${equation(m,b)}.`);}
    case 25:{const x=3+i,y=-3*x;return lineItem(`A line crosses the x-axis at (${x}, 0) and the y-axis at (0, ${y}). What is its equation?`,3,y,`The y-intercept is ${y}. The slope is (0 − (${y}))/(${x} − 0) = 3. Therefore the equation is ${equation(3,y)}.`);}
    case 26:{const b=1+i,m=-1.5,text=`The graph shows line k${i?` through P(0, ${b}) and Q(2, ${b-3})`:''}. What is its equation?`;return lineItem(text,m,b,`The graph crosses the y-axis at ${b}. From (0, ${b}) to (2, ${b-3}), y changes by −3 and x by 2. The slope is −3/2 = −1.5, giving ${equation(m,b)}.`,`<p>${text}</p>${grid([['P',0,b],['Q',2,b-3]], [m,b])}`);}
    case 27:{const o=12+i,p=4+i%3,u=6+i%2,t=o+p+u;return item(`A bag contains ${o} orange, ${p} pink, and ${u} purple marbles. Two marbles are chosen at random without replacement. Which event is most likely?`,'Neither marble is purple.',['Both marbles are pink or purple.','The first marble is orange and the second is purple.','Both marbles are orange.'],`All four probabilities have denominator ${t} × ${t-1}. Their numerators are ${(p+u)*(p+u-1)} for both pink or purple, ${(o+p)*(o+p-1)} for neither purple, ${o*u} for orange then purple, and ${o*(o-1)} for both orange. The largest is ${(o+p)*(o+p-1)}, so neither purple is most likely.`);}
    case 28:{const words=['ACRONYM','PLANET','MOUNTAIN','ELEPHANT','NOTEBOOK','SUNSHINE','TRIANGLE','COMPUTER','HOSPITAL','VACATION','BICYCLE'],word=words[i],v=[...word].filter(c=>'AEIOU'.includes(c)).length,len=word.length;return item(`Beth and Jane each independently choose a random letter position in ${word}. They may choose the same position. Beth chooses a vowel. What is the probability that Jane also chooses a vowel (A, E, I, O, U)?`,`${v}/${len}`,[`${v*v}/${len*len}`,'0','1'],`Jane's choice is independent of Beth's. There are ${v} vowel positions among ${len} letter positions in ${word}, so Jane's probability is ${v}/${len}.`,'',{kind:'number',hint:'Enter a fraction or decimal.'});}
    case 29:{const k=3+i,a=2*k,b=3*k;return item(`The probability of choosing a milk chocolate from a box is 2 out of 5. Every chocolate is equally likely to be chosen. Which counts could be in the box${i?` if it contains ${5*k} chocolates in total`:''}?`,`${a} milk chocolates and ${b} other chocolates.`,[`${a} milk chocolates and ${5*k} other chocolates.`,`${b} milk chocolates and ${a} other chocolates.`,`${5*k} milk chocolates and ${5*k} other chocolates.`],`Probability uses the total count: ${a}/(${a} + ${b}) = ${a}/${5*k} = 2/5. The other choices give different proportions of milk chocolates.`);}
    default:throw new Error(`Unknown question ${n}`);
  }
}
const questions=[],groups={};
for(const [index,[sourceId,skill,reason='first-try miss']] of sources.entries()){
  const source=original.days.flatMap(d=>d.questions).find(q=>q.id===sourceId),session=plan.sessions.find(s=>s.questionIds.includes(sourceId));
  if(!source||!sourceSessionDays.includes(session?.day))throw new Error(`Invalid source ${sourceId}`);
  const position=index+1,parentId=`review3-sessions-q${String(position).padStart(2,'0')}`;
  for(let i=0;i<=10;i++){
    const data=build(position,i),choices=[...data.choices];
    if(new Set(choices).size!==4||!choices.includes(data.answer))throw new Error(`Invalid choices ${position}/${i}: ${choices}`);
    if(!data.fixed){let seed=position*1597+i*7901;for(let j=3;j>0;j--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const k=seed%(j+1);[choices[j],choices[k]]=[choices[k],choices[j]];}}
    const format=text=>esc(text).replace(/10\^(\d+)/g,'10<sup>$1</sup>').replace(/(−?\d+)\/(\d+)(x)?/g,(_,a,b,x)=>`${frac(a,b)}${x||''}`);
    const q={id:i?`${parentId}-practice-${String(i).padStart(2,'0')}`:parentId,day,position,...(i?{parentQuestionId:parentId,practiceNumber:i}:{}),
      sourceQuestionId:sourceId,sourceDay:source.day,sourceNumber:source.sourceNumber,sourceSessionDay:session.day,sourceSessionLabel:session.label,sourceSessionPosition:session.questionIds.indexOf(sourceId)+1,
      selectionReason:reason,skill,questionText:data.text,questionHtml:data.html.replace(/10\^(\d+)/g,'10<sup>$1</sup>'),
      options:choices.map((text,j)=>({label:'ABCD'[j],text,html:format(text)})),correctIndexes:[choices.indexOf(data.answer)],correctAnswer:data.answer,correctHtml:format(data.answer),explanation:data.explanation,...(data.input?{input:data.input}:{})};
    if(i)(groups[parentId]||=[]).push(q);else questions.push(q);
  }
}
const review={day,label:'Review 3',sourceSessionDays,sourceQuestionIds:sources.map(s=>s[0]),description:'20 first-try misses and 9 unanswered questions from Sessions 4, 5, 6, 7, 8, and 11. Session 12 is not included.',selectionAsOf:'2026-09-13',questions};
reviews.version=5;
const existing=reviews.sessions.findIndex(s=>s.day===day);
if(existing<0)reviews.sessions.push(review);else reviews.sessions[existing]=review;
await writeFile(new URL('./review-bank.json',import.meta.url),JSON.stringify(reviews,null,2)+'\n');
await writeFile(new URL('./review3-practice-bank.json',import.meta.url),JSON.stringify({version:1,day,maxQuestions:10,requiredStreak:3,groups},null,2)+'\n');
console.log(`Review 3: ${questions.length} questions and ${Object.values(groups).flat().length} follow-ups.`);
