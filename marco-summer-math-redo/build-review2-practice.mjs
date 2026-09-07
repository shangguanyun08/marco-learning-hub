// Fixed coverage of all first-try misses in the seven completed practice sessions.
// New IDs keep this review separate from the retired Review 2 (day 30).
import { readFile, writeFile } from 'node:fs/promises';

const read = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
const reviews = await read('./review-bank.json');
const original = await read('./question-bank.json');
const plan = await read('./session-plan.json');
const sources = [
  ['d03-q02', 'Repeating shape patterns'], ['d03-q03', 'Repeating number patterns'],
  ['d03-q09', 'Comparing algebraic expressions'], ['d03-q18', 'Rearranging equations'],
  ['d04-q03', 'Writing expressions'], ['d04-q04', 'Equivalent expressions'],
  ['d04-q06', 'Writing a cost equation'], ['d04-q08', 'Coin equations'],
  ['d05-q01', 'Defined operations'], ['d05-q02', 'Solving a defined function'],
  ['d11-q04', 'Perimeter and possible areas'], ['d11-q06', 'Angle relationships'],
  ['d11-q10', 'What a diagram tells us'], ['d11-q12', 'Parallelogram area and height'],
  ['d12-q04', 'Interpreting the median'], ['d12-q05', 'Mean and missing totals'],
  ['d12-q07', 'Finding a missing value from the mean'], ['d14-q06', 'Finding the median'],
  ['d14-q07', 'How a correction changes statistics'], ['d14-q08', 'Reading data and quartiles'],
  ['d14-q10', 'Finding the mode'], ['d14-q11', 'Interpreting scatter plots'],
  ['d14-q12', 'Combined averages'], ['d14-q14', 'Probability and possible totals'],
  ['d14-q16', 'Range with incomplete information'],
];
const day = 31;
const sourceSessionDays = [15, 16, 17, 23, 24, 27, 28];
const allOriginal = original.days.flatMap(d => d.questions);
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const money = cents => (cents / 100).toFixed(2);
const median = values => { const a = [...values].sort((x,y) => x-y); return (a[Math.floor((a.length-1)/2)] + a[Math.ceil((a.length-1)/2)]) / 2; };
const table = (headers, rows, label) => `<div class="review-data-wrap"><table class="review-data"><caption>${esc(label)}</caption><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const diagram = (label, body, box='0 0 400 260') => `<svg class="review-diagram" viewBox="${box}" role="img" aria-label="${esc(label)}">${body}</svg>`;
const qcChoices = ['Quantity A is greater.', 'Quantity B is greater.', 'The two quantities are equal.', 'The relationship cannot be determined.'];
function item(text, answer, wrong, explanation, html='') { return {text, answer:String(answer), choices:[answer,...wrong].map(String), explanation, html}; }
function numeric(text, answer, explanation, html='') { return item(text, answer, [answer+1, answer+3, answer-1], explanation, html); }
function compare(text, a, b, key, explanation, html='') {
  return { text:`${text} Quantity A: ${a}. Quantity B: ${b}. Compare the quantities.`, answer:qcChoices[key], choices:qcChoices, explanation,
    html:`<p>${esc(text)}</p>${html}${table(['Quantity A','Quantity B'], [[a,b]], 'Compare the quantities')}`, fixed:true };
}

function build(position, i) {
  switch (position) {
    case 1: {
      const shapes=['circle','triangle','square','star'];
      const block=shapes.map((_,j)=>shapes[(j+i)%4]), n=47+i*7;
      const marks={circle:'●',triangle:'▲',square:'■',star:'★'};
      const svg=diagram(`The repeating block is ${block.join(', ')}. Two blocks are shown.`, [...block,...block].map((s,j)=>`<text x="${25+j*48}" y="40" text-anchor="middle">${marks[s]}</text>`).join(''), '0 0 390 65');
      return item(`The block ${block.join(', ')} repeats in that order, starting at position 1. Which shape is at position ${n}?`, block[(n-1)%4], shapes.filter(s=>s!==block[(n-1)%4]), `There are 4 shapes in each block. (${n} − 1) ÷ 4 leaves remainder ${(n-1)%4}, so position ${n} is the ${block[(n-1)%4]} in position ${(n-1)%4+1} of its block.`, `<p>The block ${block.join(', ')} repeats in that order, starting at position 1.</p>${svg}<p>Which shape is at position ${n}?</p>`);
    }
    case 2: {
      const block=[2+i,5+i,1+i,8+i,4+i,7+i], a=29+2*i,b=34+3*i;
      const value=block[(a-1)%6]+block[(b-1)%6];
      return numeric(`The six-number block ${block.join(', ')} repeats in that order, starting at position 1. What is the sum of the numbers at positions ${a} and ${b}?`,value,`The positions within each block are ${((a-1)%6)+1} and ${((b-1)%6)+1}. Those entries are ${block[(a-1)%6]} and ${block[(b-1)%6]}; their sum is ${value}.`);
    }
    case 3: {
      const a=17+3*i,b=12+2*i;
      return item(`If m + ${a} = n − ${b}, what is n − m?`,a+b,[a-b,b-a,a+b+2],`Add ${b} to both sides and subtract m: n − m = ${a} + ${b} = ${a+b}.`);
    }
    case 4: {
      const a=2+i%4,b=3+i%3,c=9+i;
      return item(`If ${a}c + ${a*b}d = ${a*c}, which expression equals c?`,`${c} − ${b}d`,[`${c} + ${b}d`,`${a*c} − ${a*b}d`,`${c} − ${a*b}d`],`Subtract ${a*b}d and divide every term by ${a}: c = (${a*c} − ${a*b}d)/${a} = ${c} − ${b}d.`);
    }
    case 5: {
      const a=3+i%4,b=5+i;
      return item(`A tower is ${a} times as tall as a pole. The tower's height is (${a}x + ${a*b}) meters. Which expression gives the pole's height in meters?` ,`x + ${b}`,[`${a}x + ${b}`,`x + ${a*b}`,`${a*a}x + ${a*a*b}`],`Divide the entire tower height by ${a}: (${a}x + ${a*b})/${a} = x + ${b}.`);
    }
    case 6: {
      const k=2+i%4,b=5+i;
      return item(`Mia has a stickers. Noah has ${k} times as many stickers as Mia. Leo has ${b} more stickers than Noah. Which expression does NOT give their total number of stickers?`, `a + 2(${k}a + ${b})`,[`${1+2*k}a + ${b}`,`${1+k}a + (${k}a + ${b})`,`a + ${k}a + (${k}a + ${b})`],`Their total is a + ${k}a + (${k}a + ${b}) = ${1+2*k}a + ${b}. The expression a + 2(${k}a + ${b}) adds the extra ${b} twice.`);
    }
    case 7: {
      const base=500+50*i, included=4+i%5,rate=35+5*i;
      return item(`A call costs $${money(base)} for the first ${included} minutes and $${money(rate)} for each additional minute. For a call lasting m minutes, where m > ${included}, which equation gives the total cost C in dollars?`, `C = ${money(base)} + ${money(rate)}(m − ${included})`,[`C = ${money(base)} + ${money(rate)}m`,`C = ${money(base)} + ${money(rate)}(m + ${included})`,`C = ${money(rate)} + ${money(base)}(m − ${included})`],`The first ${included} minutes are already included in $${money(base)}. Charge $${money(rate)} for only the remaining m − ${included} minutes, then add the initial cost.`);
    }
    case 8: {
      const more=2+i,d=6+i,total=15*d+5*more;
      return item(`A purse contains only nickels (5 cents) and dimes (10 cents). There are ${more} more nickels than dimes, and the total value is $${money(total)}. If d is the number of dimes, which equation models this in cents?`,`10d + 5(d + ${more}) = ${total}`,[`10d + 5(d − ${more}) = ${total}`,`5d + 10(d + ${more}) = ${total}`,`15d + ${more} = ${total}`],`There are d dimes and d + ${more} nickels. Their values in cents are 10d and 5(d + ${more}); together these equal ${total} cents.`);
    }
    case 9: {
      const k=4+i%3,n=6+2*i,m=n*(2+i%4)/2,answer=k*m/n;
      return numeric(`Define m ◆ n = (${k} × m) ÷ n. What is ${m} ◆ ${n}?`,answer,`Substitute m = ${m} and n = ${n} into the definition: (${k} × ${m}) ÷ ${n} = ${k*m} ÷ ${n} = ${answer}.`);
    }
    case 10: {
      const a=5+i,b=3+i%4,c=2+i%3,y=c*(3+i),target=a+b*y/c;
      return item(`Define F(x) = ${a} + (${b}/${c})x. If F(y) = ${target}, what is y?`,y,[y+c,y-c,target],`Subtract ${a} to get (${b}/${c})y = ${target-a}. Multiply by ${c}/${b}: y = ${y}. Check: ${a} + (${b}/${c}) × ${y} = ${target}.`);
    }
    case 11: {
      const side=8+i,p=4*side,offset=i%3===1?side:0,square=i%3===2;
      return compare(`A rectangle has perimeter ${p} centimeters.${square?' Its length and width are equal.':''}`, 'the area of the rectangle in square centimeters', side**2+offset, square?2:offset?1:3,
        square?`Equal sides and perimeter ${p} give side length ${side} and area ${side**2}.` : offset?`The greatest possible area for this perimeter is the square's area, ${side} × ${side} = ${side**2}. That is less than ${side**2+offset}, so Quantity B is greater.`:`A ${side} by ${side} square has area ${side**2}. A ${side-1} by ${side+1} rectangle has the same perimeter and area ${side**2-1}. Quantity A can equal Quantity B or be smaller, so one relationship cannot be determined.`);
    }
    case 12: {
      const shift=12+3*i;
      const svg=diagram('Perpendicular rays BA and BC form a right angle, divided by an interior ray into angles x and y.', '<path d="M75 25V215H330 M75 215L265 70 M75 191H99V215" fill="none" stroke="#173957" stroke-width="2"/><text x="50" y="24">A</text><text x="50" y="240">B</text><text x="335" y="220">C</text><text x="89" y="137">x°</text><text x="149" y="202">y°</text>');
      return compare('BA is perpendicular to BC. The two angles x and y together fill angle ABC.',`x + ${shift}`,`${90+shift} − y`,2,`The right angle gives x + y = 90, so x = 90 − y. Adding ${shift} gives x + ${shift} = ${90+shift} − y. The quantities are equal.`,svg);
    }
    case 13: {
      const side=5+i,angle=[null,45,80,60][i%4];
      return compare(`An equilateral triangle has side length ${side} cm and an interior angle x°. A rhombus has side length ${side+2} cm and an interior angle y°.${angle===null?' No angle measure of the rhombus is given.':` The angle y measures ${angle}°.`}`, 'x','y',angle===null?3:angle<60?0:angle>60?1:2,
        angle===null?`The equilateral triangle gives x = 60°. Equal sides in a rhombus do not determine its angles: y could be 45°, 60°, or 80°, for example. The relationship cannot be determined.`:`Every equilateral triangle has 60° angles, so compare x = 60 with y = ${angle}. Side lengths do not change these given angle measures.`);
    }
    case 14: {
      const base=8+i,h=4+i,area=base*h;
      const svg=diagram(`A slanted parallelogram has base ${base} cm, area ${area} square cm, a dotted perpendicular height, and slanted side x cm.`, `<path d="M70 210L130 45H330L270 210Z" fill="#eaf1ff" stroke="#173957" stroke-width="2"/><path d="M130 45V210" stroke="#173957" stroke-dasharray="5 4"/><path d="M130 190H150V210" fill="none" stroke="#173957"/><text x="18" y="138">x cm</text><text x="160" y="239">${base} cm</text>`);
      return compare(`A parallelogram has area ${area} cm² and base ${base} cm. Its side of length x cm is slanted, not perpendicular to the base.`, 'x',h,0,`The perpendicular height is area ÷ base = ${area} ÷ ${base} = ${h} cm. The slanted side x is the hypotenuse of a right triangle with height ${h}, so x is greater than ${h}.`,svg);
    }
    case 15: {
      const n=18+2*i,mid=34+i;
      return numeric(`The median age of ${n} workers is ${mid} years. No worker is exactly ${mid} years old. How many workers are older than ${mid}?`,n/2,`With ${n} ages in order, the median lies between the two middle ages. Since nobody is ${mid}, exactly half are below ${mid} and half are above: ${n} ÷ 2 = ${n/2} workers.`);
    }
    case 16: {
      const n=10+i,mean=24+i,bottom=20+2*i,top=n*mean-bottom;
      return item(`A list of ${n} numbers has mean ${mean}. The sum of the largest ${n-2} numbers is ${top}. What is the sum of the two smallest numbers?`,bottom,[n*mean,top,mean*2],`The total of all ${n} numbers is ${n} × ${mean} = ${n*mean}. Subtract the largest ${n-2} numbers: ${n*mean} − ${top} = ${bottom}.`);
    }
    case 17: {
      const low=54+i,mid=low+5+i%3,high=low+10+2*(i%3)+3*(i%2),mean=(low+mid+high)/3;
      return item(`Three students have a mean height of ${mean} inches. The shortest is ${low} inches and the tallest is ${high} inches. How tall is the third student?`,mid,[mean*3-low,high-low,mid+2],`Their total height is ${mean} × 3 = ${mean*3}. Subtract the shortest and tallest: ${mean*3} − ${low} − ${high} = ${mid} inches.`);
    }
    case 18: {
      const b=10+3*i,a=[b+8,b,b+3,b+15,b+5,b+1,b+6,b+12];
      return item(`What is the median of this data set: ${a.join(', ')}?`,median(a),[b+3,b+6,b+7.5],`In order: ${[...a].sort((x,y)=>x-y).join(', ')}. With 8 values, average the 4th and 5th: (${b+5} + ${b+6}) ÷ 2 = ${b+5.5}.`);
    }
    case 19: {
      const b=i,n=2+i%3,f=[n,n+1,n+4,n+1,n],rows=f.map((v,j)=>[b+j,v]);
      const text=`The table records books read by students. One student's entry is corrected from ${b+1} books to ${b+2} books. Which statistics change: mean, median, mode, or range?`;
      return item(text,'Only the mean changes.',['Only the median changes.','The mean, median, and mode change.','All four statistics change.'],`The total rises by 1 while the number of students stays ${f.reduce((a,v)=>a+v,0)}, so the mean rises. The middle values and most frequent value remain ${b+2}. The minimum ${b} and maximum ${b+4} remain, so the range stays 4.`,`<p>${esc(text)}</p>${table(['Books read','Number of students'],rows,'Before the correction')}`);
    }
    case 20: {
      const b=24+3*i,k=1+i%3,a=[0,1,2,2,2,3,5,9].map(n=>b+k*n),names=['January','February','March','April','May','June','July','August'];
      const text='The table shows monthly profit in hundreds of dollars. Which statement is NOT true? For quartiles, use the medians of the lower four and upper four values.';
      const wrongStatement=`The interquartile range is ${3*k}.`;
      return item(`${text} Profits: ${a.join(', ')}.`,wrongStatement,[`The mode equals the median.`,`The mean is greater than the range.`,`The profits in March and April add to ${a[2]+a[3]}.`],`The median and mode are both ${b+2*k}. The mean is ${b+3*k}, greater than the range ${9*k}. March plus April is ${2*(b+2*k)}. Q1 = ${b+1.5*k} and Q3 = ${b+4*k}, so the interquartile range is ${2.5*k}, not ${3*k}.`,`<p>${text}</p>${table(['Month','Profit (hundreds of dollars)'],names.map((m,j)=>[m,a[j]]),'Monthly profit')}`);
    }
    case 21: {
      const b=2+i,mode=i%5,rows=Array.from({length:5},(_,j)=>[b+j,j===mode?9+i:2+j]);
      const text='The table shows the number of goals scored by players. What is the mode of the number of goals?';
      return item(`${text} Goals and player counts: ${rows.map(r=>r.join(': ')).join('; ')}.`,b+mode,[b+mode+1,b+mode+2,b+mode-1],`The mode is the value with the greatest frequency. ${9+i} players scored ${b+mode} goals, more players than for any other goal count. Therefore the mode is ${b+mode} goals.`,`<p>${text}</p>${table(['Goals scored','Number of players'],rows,'Goals per player')}`);
    }
    case 22: {
      const down=i%2===1,base=52+2*i,points=[0,1,2,3,4,5].map((j)=>[base+4*j,down?50-6*j+(j%2)*2:14+6*j+(j%2)*2]);
      const text='The scatter plot shows temperature and cups of lemonade sold on six days. Which conclusion is best supported?';
      const svg=diagram(`Temperature in degrees F and cups sold: ${points.map(p=>p.join(', ')).join('; ')}.`, `<path d="M58 20V215H365" fill="none" stroke="#173957" stroke-width="2"/>${[0,20,40,60].map(v=>`<text x="48" y="${220-v*3}" text-anchor="end">${v}</text>`).join('')}${points.map(([x,y],j)=>`<circle cx="${85+j*49}" cy="${215-y*3}" r="5" fill="#2468e5"/><text x="${85+j*49}" y="237" text-anchor="middle">${x}</text>`).join('')}<text x="210" y="265" text-anchor="middle">Temperature (°F)</text><text transform="translate(17 120) rotate(-90)" text-anchor="middle">Cups sold</text>`, '0 0 395 285');
      return item(`${text} Data (°F, cups): ${points.map(p=>`(${p.join(', ')})`).join(', ')}.`,down?'On these days, higher temperatures tended to go with fewer cups sold.':'On these days, higher temperatures tended to go with more cups sold.',[down?'On these days, higher temperatures tended to go with more cups sold.':'On these days, higher temperatures tended to go with fewer cups sold.','Exactly the same number of cups was sold each day.','The plot proves that temperature is the only factor affecting sales.'],`Reading from lower to higher temperatures, the points generally move ${down?'down':'up'}, showing a ${down?'negative':'positive'} association. A scatter plot shows a pattern in these data; it does not prove that temperature alone causes sales.`,`<p>${text}</p>${svg}`);
    }
    case 23: {
      const low=12+i,high=36+i,target=(low+high)/2,counts=[null,[8,4],[4,8],[6,6]][i%4];
      return compare(`The mean weight of the dogs at a shelter is ${high} pounds, and the mean weight of the cats is ${low} pounds.${counts?` There are ${counts[0]} dogs and ${counts[1]} cats.`:' There is at least one of each, but their counts are not given.'}`,'the mean weight of all the dogs and cats combined',target,counts?counts[0]===counts[1]?2:counts[0]>counts[1]?0:1:3,
        counts?`Use the animal counts as weights: (${counts[0]} × ${high} + ${counts[1]} × ${low}) ÷ ${counts[0]+counts[1]} = ${(counts[0]*high+counts[1]*low)/(counts[0]+counts[1])}. Compare this with ${target}.`:`Equal numbers would give ${target} pounds. More dogs would raise the combined mean; more cats would lower it. Without their counts, the relationship cannot be determined.`);
    }
    case 24: {
      const den=[13,17,19,23,29,31,37,41,43,47,53][i],num=4+i,target=i%2?den:den-2;
      return compare(`A bucket contains red and blue balls. Each ball is equally likely to be selected. The probability of selecting a red ball is exactly ${num}/${den}.`,'the total number of balls in the bucket',target,i%2?3:0,
        i%2?`The fraction ${num}/${den} is in lowest terms, so the total is a positive multiple of ${den}. It could be ${den} or ${2*den}; Quantity A could equal Quantity B or exceed it.`:`The fraction ${num}/${den} is in lowest terms. A whole-number count requires the total to be a positive multiple of ${den}, so it is at least ${den}, greater than ${target}.`);
    }
    case 25: {
      const young=18+i,age=58+2*i,oldest=i%3===1,target=age-young-(i%3===2?5:0);
      return compare(`The youngest person in a group is ${young} years old. Nora is ${age} years old and is in the group.${oldest?' Nora is the oldest person in the group.':' No other ages are given.'}`,'the range of ages in the group',target,oldest?2:i%3===2?0:3,
        oldest?`Nora is the oldest person, so the maximum age is ${age}. Range = maximum − minimum = ${age} − ${young} = ${target}.` : i%3===2?`The oldest person is at least ${age}, so the range is at least ${age-young}. That is greater than ${target}.`:`If Nora is oldest, the range is ${age-young}. If someone is older than Nora, the range is larger. Quantity A could equal Quantity B or be greater, so the relationship cannot be determined.`);
    }
    default: throw new Error(`Unknown skill ${position}`);
  }
}

const questions=[],groups={};
for (const [index,[sourceId,skill]] of sources.entries()) {
  const source=allOriginal.find(q=>q.id===sourceId), session=plan.sessions.find(s=>s.questionIds.includes(sourceId));
  if (!source || !sourceSessionDays.includes(session?.day)) throw new Error(`Invalid source ${sourceId}`);
  const position=index+1, parentId=`review2-sessions-q${String(position).padStart(2,'0')}`;
  for (let i=0;i<=10;i++) {
    const data=build(position,i),choices=[...data.choices];
    if (new Set(choices).size!==4 || !choices.includes(data.answer)) throw new Error(`Invalid choices for ${position}/${i}: ${choices}`);
    if (!data.fixed) {
      let seed=position*997+i*7919;
      for(let j=3;j>0;j--) { seed=(Math.imul(seed,1664525)+1013904223)>>>0; const k=seed%(j+1); [choices[j],choices[k]]=[choices[k],choices[j]]; }
    }
    const question={id:i?`${parentId}-practice-${String(i).padStart(2,'0')}`:parentId, day, position,
      ...(i?{parentQuestionId:parentId,practiceNumber:i}:{}),sourceQuestionId:sourceId,sourceDay:source.day,sourceNumber:source.sourceNumber,
      sourceSessionDay:session.day,sourceSessionLabel:session.label,sourceSessionPosition:session.questionIds.indexOf(sourceId)+1,skill,
      questionText:data.text,questionHtml:data.html||`<p>${esc(data.text)}</p>`,
      options:choices.map((text,j)=>({label:'ABCD'[j],text,html:esc(text)})),correctIndexes:[choices.indexOf(data.answer)],
      correctAnswer:data.answer,correctHtml:esc(data.answer),explanation:data.explanation};
    if (i) (groups[parentId]||=[]).push(question); else questions.push(question);
  }
}
const review={day,label:'Review 2',sourceSessionDays,sourceQuestionIds:sources.map(([id])=>id),questions};
reviews.version=4;
const existing=reviews.sessions.findIndex(s=>s.day===day);
if(existing<0) reviews.sessions.push(review); else reviews.sessions[existing]=review;
await writeFile(new URL('./review-bank.json',import.meta.url),JSON.stringify(reviews,null,2)+'\n');
await writeFile(new URL('./review2-practice-bank.json',import.meta.url),JSON.stringify({version:1,day,maxQuestions:10,requiredStreak:3,groups},null,2)+'\n');
console.log(`Review 2: ${questions.length} main questions, ${Object.values(groups).flat().length} follow-ups.`);
