(function(root){
 'use strict';
 const bank=root.HARRY_SEPT_PRACTICE,group='week-2026-10-12',suffix='-round2';
 const comma=n=>n.toLocaleString('en-US'),money=c=>'$'+(c/100).toFixed(2),gcd=(a,b)=>b?gcd(b,a%b):a;
 const fraction=(a,b)=>{const g=gcd(a,b);return a/g+'/'+b/g;};
 function variant(original,day){
  const source=original.source,q={...original,sourceLabel:'Round 1 · '+original.skill};
  delete q.visual;
  let prompt,answer,wrong,explanation,visual;
  switch(source){
   case 1:{
    if(day===1){prompt='Which expression equals 763?';answer='7 hundreds + 6 tens + 3 ones';wrong=['700 hundreds + 6 tens + 3 ones','7 hundreds + 3 tens + 6 ones','7 hundreds + 6 ones + 3 tens'];explanation='763 = 700 + 60 + 3. Match each digit to its place value.';}
    else if(day===4){prompt='Which expression equals 62.305?';answer='60 + 2 + 3/10 + 5/1000';wrong=['60 + 2 + 3/100 + 5/1000','60 + 2 + 3/10 + 5/100','600 + 2 + 3/10 + 5/1000'];explanation='62.305 = 60 + 2 + 0.3 + 0.005. The zero holds the hundredths place.';}
    else if(day===5){prompt='In 46,725, what is the value of the digit 6?';answer='6,000';wrong=['600','60','6'];explanation='The 6 is in the thousands place, so it represents 6,000.';}
    else if(day===3){prompt='Which expression equals 85,471?';answer='8 × 10,000 + 5 × 1,000 + 4 × 100 + 7 × 10 + 1';wrong=['8 × 10,000 + 5 × 100 + 4 × 100 + 7 × 10 + 1','8 × 10,000 + 5 × 1,000 + 4 × 10 + 7 × 10 + 1','8 × 1,000 + 5 × 1,000 + 4 × 100 + 7 × 10 + 1'];explanation='The digits represent 8 ten-thousands, 5 thousands, 4 hundreds, 7 tens and 1 one.';}
    else{const n=day===2?57326:92746,d=String(n).split('').map(Number),values=d.map((x,i)=>x*10**(4-i));prompt=`What is ${comma(n)} in expanded form?`;answer=values.map(comma).join(' + ');wrong=[[values[0]*10,...values.slice(1)],[values[0],values[1]/10,...values.slice(2)],[values[0],...d.slice(1)]].map(a=>a.map(comma).join(' + '));explanation=`Match each digit to its place: ${answer} = ${comma(n)}.`;}
    break;
   }
   case 2:{
    if(day===3||day===5){const target=day===3?630000:850000,values=day===3?[634270,635270,624270,645270]:[846391,844391,856391,834391];prompt=`Which number rounds to ${comma(target)} to the nearest ten thousand?`;answer=comma(values[0]);wrong=values.slice(1).map(comma);explanation=`${answer} is at least ${comma(target-5000)} and below ${comma(target+5000)}, so it rounds to ${comma(target)}. Check the thousands digit.`;}
    else{const n={1:537426,2:794163,4:468372,6:823719}[day],rounded=Math.round(n/10000)*10000;prompt=`Round ${comma(n)} to the nearest ten thousand.`;answer=comma(rounded);wrong=[rounded+(n<rounded?-10000:10000),Math.round(n/1000)*1000,Math.round(n/100)*100].map(comma);explanation=`The thousands digit is ${Math.floor(n/1000)%10}. ${n<rounded?'Round up':'Round down'} to ${answer}.`;}
    break;
   }
   case 3:{
    const [parts,point]=[[5,3],[6,5],[8,7],[6,1],[8,3],[4,3]][day-1];
    prompt='What fraction is at point P?';answer=point+'/'+parts;wrong=[point+'/'+(parts+1),(parts-point)+'/'+parts,parts+'/'+point];visual={type:'week-numberline',parts,point};explanation=`The whole from 0 to 1 has ${parts} equal intervals. P is ${point} intervals from 0, so it is ${answer}. Count intervals, not tick marks.`;break;
   }
   case 4:{
    const [a,b]=[[3,5],[2,5],[2,5],[3,7],[4,7],[3,4]][day-1];
    if(day===3||day===6){prompt=`Which fraction is NOT equivalent to ${a}/${b}?`;answer=(a*2)+'/'+(b*3);wrong=[2,3,4].map(k=>(a*k)+'/'+(b*k));explanation=`Multiplying numerator and denominator by the same number keeps a fraction equivalent. ${wrong.join(', ')} all equal ${a}/${b}; ${answer} does not.`;}
    else if(day===2||day===5){prompt=`Complete: ${a}/${b} = ____/${b*3}`;answer=String(a*3);wrong=[String(a),String(a*2),String(a*3+1)];explanation=`The denominator was multiplied by 3, so the numerator must also be multiplied by 3: ${a} × 3 = ${a*3}.`;}
    else{prompt=`Which fraction is equivalent to ${a}/${b}?`;answer=(a*3)+'/'+(b*3);wrong=[(a*2)+'/'+(b*3),a+'/'+(b*3),(a*3)+'/'+b];explanation=`Multiply top and bottom by 3: ${a}/${b} = ${answer}.`;}
    break;
   }
   case 5:{
    if(day===1||day===5){const [a,b,d,unit]=day===1?[11,5,12,'meter']:[13,5,14,'liter'];answer=fraction(a-b,d)+(day===1?' meter':'');prompt=day===1?`A ribbon is ${a}/${d} meter long. Maya cuts off ${b}/${d} meter. How much is left?`:`A jug has ${a}/${d} liter of juice. Sam pours out ${b}/${d} liter. What fraction of a liter remains? Give the simplest form.`;wrong=day===1?['1/4 meter','1/3 meter','2/3 meter']:['4/14','8/28','5/7'];explanation=`Subtract the numerators: ${a}/${d} − ${b}/${d} = ${a-b}/${d} = ${fraction(a-b,d)}. The remaining amount is ${fraction(a-b,d)} ${unit}.`;}
    else if(day===2){prompt='A garden has beans on 3/16 of its area and peas on 5/16. What fraction is used altogether? Give the simplest form.';answer='1/2';wrong=['1/4','3/8','5/8'];explanation='3/16 + 5/16 = 8/16 = 1/2. Add the numerators, keeping the denominator 16, then simplify.';}
    else if(day===4){prompt='Multiply: 1/3 × 2/5';answer='2/15';wrong=['3/8','2/8','2/5'];explanation='Multiply numerators and denominators separately: (1 × 2)/(3 × 5) = 2/15.';}
    else{const [whole,a,b]=day===3?[3,2,5]:[2,3,7];prompt=`Write ${whole} ${a}/${b} as an improper fraction.`;answer=(whole*b+a)+'/'+b;wrong=[(whole+a)+'/'+b,(whole*b)+'/'+b,(whole*b+a-1)+'/'+b];explanation=`${whole} wholes contain ${whole} × ${b} = ${whole*b} pieces. Add ${a} to get ${whole*b+a}, so the fraction is ${answer}.`;}
    break;
   }
   case 6:{const [a,b]=[[38,23],[42,26],[29,32],[34,28],[46,23],[37,26]][day-1],large=Math.floor(b/10)*10,small=b%10;prompt=`Multiply: ${a} × ${b}`;answer=comma(a*b);wrong=[a*b-20,a*b-100,a*b+30].map(comma);explanation=`${a} × ${large} = ${a*large} and ${a} × ${small} = ${a*small}. Add them to get ${comma(a*b)}.`;break;}
   case 7:{
    if(day===3||day===5){const [a,b]=day===3?[2867,3248]:[3578,2467];prompt=`A runner completes two parts of a course in ${(a/100).toFixed(2)} seconds and ${(b/100).toFixed(2)} seconds. What is the exact total?`;answer=((a+b)/100).toFixed(2)+' seconds';wrong=[a+b-100,a+b-10,Math.ceil((a+b)/100)*100].map(n=>(n/100).toFixed(2)+' seconds');explanation=`Line up the decimal points: ${(a/100).toFixed(2)} + ${(b/100).toFixed(2)} = ${((a+b)/100).toFixed(2)} seconds. Give the exact sum.`;}
    else{const [ounces,cents]=({1:[18,45],2:[16,35],4:[26,30],6:[24,40]})[day];prompt=`A bag contains ${ounces} ounces of seeds costing ${money(cents)} per ounce. What is the total price?`;answer=money(ounces*cents);wrong=[ounces*cents*10,ounces*cents-100,ounces*cents+10].map(money);explanation=`${ounces} × ${cents} cents = ${ounces*cents} cents = ${answer}. Divide cents by 100 to get dollars.`;}
    break;
   }
   case 8:{const [total,size]=[[187,8],[221,9],[254,7],[269,9],[242,8],[278,6]][day-1],remainder=total%size,full=Math.floor(total/size),unit=[1,4,6].includes(day)?' ounces':'';prompt=unit?`A jug has ${total} ounces of juice. Fill as many ${size}-ounce cups as possible. How many ounces remain for the partly filled last cup?`:`There are ${total} beads. Put ${size} beads in each full bag. How many beads are left after filling as many bags as possible?`;answer=remainder+unit;wrong=[full,size,remainder+size].map(n=>n+unit);explanation=`${full} full groups use ${full} × ${size} = ${full*size}. The remainder is ${total} − ${full*size} = ${remainder}, which is less than ${size}.`;break;}
   case 9:{
    if(day===1||day===4){const [start,count,each]=day===1?[53,4,7]:[62,6,7];prompt=`Lena has ${start} stickers. She gets ${count} packs with ${each} stickers each. How many stickers does she have now?`;answer=String(start+count*each);wrong=[start+count+each,start*each,start+(count-1)*each].map(String);explanation=`The packs add ${count} × ${each} = ${count*each} stickers. Add the original ${start}: ${start} + ${count*each} = ${answer}.`;}
    else if(day===2){prompt='Noah has 46 cards and buys 5 packs with 6 cards each. Which calculation finds his new total?';answer='46 + 5 × 6';wrong=['(46 + 5) × 6','46 × 5 + 6','46 + 5 + 6'];explanation='Five packs add 5 × 6 cards. Add them to the original 46: 46 + 5 × 6.';}
    else if(day===5){prompt='A toy costs $8. Ava buys 4 toys and pays $50. Which expression finds her change?';answer='50 − 4 × 8';wrong=['50 + 4 × 8','(50 − 4) × 8','50 − 4 − 8'];explanation='The toys cost 4 × 8 = 32 dollars. Change is the payment minus this cost: 50 − 4 × 8 = 18 dollars.';}
    else{const [trays,packs,each]=day===3?[5,2,7]:[4,3,5];prompt=`A box has ${trays} trays. Each tray contains ${packs} packs with ${each} markers in each pack. How many markers are in the box?`;answer=String(trays*packs*each);wrong=[trays+packs+each,trays*each,(trays-1)*packs*each].map(String);explanation=`Each tray holds ${packs} × ${each} = ${packs*each} markers. Multiply by ${trays} trays: ${trays} × ${packs*each} = ${answer}.`;}
    break;
   }
   case 10:{
    if(day===2){prompt='A machine makes 112 buttons in 8 minutes. At that rate, how long does it take to make 28 buttons?';answer='2 minutes';wrong=['8 minutes','14 minutes','4 minutes'];explanation='112 ÷ 8 = 14 buttons per minute. For 28 buttons, time = 28 ÷ 14 = 2 minutes.';}
    else if(day===3){prompt='There are 8 teams with 5 children on each team. The total is c. Which equation represents this?';answer='c ÷ 5 = 8';wrong=['c + 5 = 8','c − 5 = 8','c × 5 = 8'];explanation='Dividing the total children into groups of 5 gives 8 teams, so c ÷ 5 = 8 and c = 40.';}
    else if(day===5){prompt='A model is 9 centimeters tall. A sculpture is n times as tall. Which equation gives its height h in centimeters?';answer='h = 9n';wrong=['h = 9 + n','h = 9 ÷ n','h = n − 9'];explanation='“n times” means multiply the model height by n: h = 9 × n = 9n.';}
    else{const [total,time]=({1:[104,8],4:[117,9],6:[154,11]})[day],unit=day===1?' gallons':'';prompt=day===1?`A pump moves ${total} gallons in ${time} minutes. How many gallons does it move each minute?`:`A printer makes ${total} labels in ${time} minutes. How many labels does it make per minute?`;answer=(total/time)+unit;wrong=[time,total-time,total*time].map(n=>n+unit);explanation=`Divide the total by the time: ${total} ÷ ${time} = ${total/time} per minute.`;}
    break;
   }
   case 11:{const [n,from,to,factor,divide]=[[24,'quarts','gallons',4,true],[4,'gallons','pints',8,false],[5,'yards','inches',36,false],[32,'pints','quarts',2,true],[7,'pounds','ounces',16,false],[8,'gallons','quarts',4,false]][day-1];prompt=`${n} ${from} = ____ ${to}`;answer=String(divide?n/factor:n*factor);wrong=[divide?n*factor:n/factor,Number(answer)+factor,Number(answer)-1].map(String);explanation=`${divide?`Each ${to.slice(0,-1)} contains ${factor} ${from}. Divide: ${n} ÷ ${factor}`:`Each ${from.slice(0,-1)} contains ${factor} ${to}. Multiply: ${n} × ${factor}`} = ${answer} ${to}.`;break;}
   case 12:{
    if(day===1||day===3){const radius=day===1?7:8;prompt='The segment shown goes from the center to the edge. What is the diameter?';answer=(radius*2)+' inches';wrong=[radius/2,radius,radius*4].map(n=>n+' inches');visual={type:'oct10-radius',radius};explanation=`The radius is ${radius} inches. A diameter is twice the radius: 2 × ${radius} = ${radius*2} inches.`;}
    else if(day===5){prompt='A circle has a diameter of 26 inches. What is its radius?';answer='13 inches';wrong=['52 inches','26 inches','6.5 inches'];explanation='The radius is half the diameter: 26 ÷ 2 = 13 inches.';}
    else{const [length,width]=({2:[15,8],4:[14,9],6:[16,7]})[day],area=day===4,unit=area?'square feet':'inches',value=area?length*width:2*(length+width);prompt=`A rectangle is ${length} ${area?'feet':'inches'} long and ${width} ${area?'feet':'inches'} wide. What is its ${area?'area':'perimeter'}?`;answer=value+' '+unit;wrong=[area?2*(length+width):length*width,length+width,area?length*width-width:2*length].map(n=>n+' '+unit);explanation=area?`Area = length × width = ${length} × ${width} = ${value} square feet.`:`Perimeter includes all four sides: 2 × (${length} + ${width}) = ${value} inches.`;}
    break;
   }
   default:throw new Error('Unknown weekly question');
  }
  const correct=(original.correct+day%3+1)%4,choices=wrong.map(String);choices.splice(correct,0,String(answer));
  return {...q,prompt,choices,correct,explanation,visual};
 }
 const originals=bank.filter(s=>s.group===group);
 const variants=new Map(originals.map((s,i)=>[s.id,s.questions.map(q=>variant(q,i+1))]));
 const firstRun=runs=>(runs||[]).filter(r=>Object.values(r.answers).some(e=>e.attempts?.length)).slice().sort((a,b)=>a.startedAt.localeCompare(b.startedAt)||a.id.localeCompare(b.id))[0];
 function plan(base,state){const source=firstRun(state.sessions[base.id]),E=root.HarrySeptEngine,ready=!!source&&E.stats(base,source).attempted===base.questions.length;return {ready,source,sources:ready?base.questions.filter(q=>!E.isCorrect(q,source.answers[q.source].attempts[0].choice)).map(q=>q.source):[]};}
 function resolve(id,state){
  const base=originals.find(s=>s.id+suffix===id);if(!base)return null;
  const p=plan(base,state),saved=state.sessions[id]?.at(-1),sources=saved?.round2Sources||p.sources;
  return {id,group,round2:true,baseId:base.id,cardLabel:base.cardLabel,title:base.title+' · Round 2',description:'Only Round 1 first-try mistakes, with different numbers. One retry per question. Your original daily score stays unchanged.',ready:!!saved||p.ready,sourceRunId:saved?.sourceRunId||p.source?.id,questions:sources.map(source=>variants.get(base.id).find(q=>q.source===source)).filter(Boolean)};
 }
 root.HarryWeekRound2={plan,resolve,firstRun,variants,sessions:state=>originals.map(s=>resolve(s.id+suffix,state))};
})(window);
