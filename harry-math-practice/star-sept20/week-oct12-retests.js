(function(root){
 'use strict';
 const bank=root.HARRY_SEPT_PRACTICE,base=bank.find(s=>s.id==='week-oct12-3');
 const comma=n=>n.toLocaleString('en-US');
 // Four fresh banks: two full retests and their separate first-miss reviews.
 function questions(seed){
  const rows=[],add=(source,prompt,answer,wrong,explanation,visual)=>{
   const original=base.questions.find(q=>q.source===source),correct=(source+seed)%4,choices=wrong.map(String);
   choices.splice(correct,0,String(answer));rows.push({...original,prompt,choices,correct,explanation,visual});
  };
  const n=71324+seed*1121,d=String(n).split('').map(Number),expanded=d.map((v,i)=>v*10**(4-i));
  add(1,`What is ${comma(n)} in expanded form?`,expanded.map(comma).join(' + '),[
   [expanded[0],expanded[1]/10,...expanded.slice(2)].map(comma).join(' + '),
   [expanded[0]*10,...expanded.slice(1)].map(comma).join(' + '),
   [expanded[0],...d.slice(1)].map(comma).join(' + ')
  ],`Each digit has a place value: ${expanded.map(comma).join(' + ')} = ${comma(n)}.`);
  const target=350000+seed*40000,rounds=target+2317+seed*11;
  add(2,`Which number rounds to ${comma(target)} to the nearest ten thousand?`,comma(rounds),[comma(target+6230),comma(target-6210),comma(target+15230)],`${comma(rounds)} is at least ${comma(target-5000)} and below ${comma(target+5000)}, so it rounds to ${comma(target)}.`);
  const parts=seed+5,point=seed+1;
  add(3,'What fraction is at point P?',`${point}/${parts}`,[`${point}/${parts+1}`,`${point+1}/${parts}`,`${parts}/${point}`],`There are ${parts} equal intervals from 0 to 1. P is ${point} intervals from 0, so it is ${point}/${parts}.`,{type:'week-numberline',parts,point});
  const a=seed+2,b=seed+5;
  add(4,`Which fraction is NOT equivalent to ${a}/${b}?`,`${a*2}/${b*3}`,[2,3,4].map(k=>`${a*k}/${b*k}`),`Equivalent fractions multiply the top and bottom by the same number. ${a*2}/${b*3} multiplies the top by 2 and the bottom by 3, so it is not equivalent.`);
  const whole=seed+2;
  add(5,`Write ${whole} ${a}/${b} as an improper fraction.`,`${whole*b+a}/${b}`,[`${whole+a}/${b}`,`${whole*b}/${b}`,`${whole*b+a-1}/${b}`],`${whole} wholes contain ${whole} × ${b} = ${whole*b} pieces. Add ${a} to get ${whole*b+a}, so the answer is ${whole*b+a}/${b}.`);
  const x=31+seed*2,y=22+seed;
  add(6,`Multiply: ${x} × ${y}`,comma(x*y),[x*y-20,x*y-100,x*y+30].map(comma),`${x} × 20 = ${x*20}; ${x} × ${y-20} = ${x*(y-20)}. Add to get ${comma(x*y)}.`);
  const cents1=2457+seed*123,cents2=3186+seed*87,total=cents1+cents2,sec=c=>(c/100).toFixed(2)+' seconds';
  add(7,`A runner completes two parts of a course in ${(cents1/100).toFixed(2)} seconds and ${(cents2/100).toFixed(2)} seconds. What is the exact total?`,sec(total),[total-100,total-10,total+100].map(sec),`Line up the decimal points: ${(cents1/100).toFixed(2)} + ${(cents2/100).toFixed(2)} = ${(total/100).toFixed(2)} seconds.`);
  const size=seed+6,full=23+seed,remainder=seed+1,beads=size*full+remainder;
  add(8,`There are ${beads} beads. Put ${size} beads in each full bag. How many beads are left?`,remainder,[full,size,remainder+size],`${full} full bags use ${full} × ${size} = ${full*size} beads. ${beads} − ${full*size} = ${remainder} beads remain.`);
  const trays=seed+3,packs=2,each=seed+4;
  add(9,`A box has ${trays} trays. Each tray contains ${packs} packs with ${each} markers in each pack. How many markers are in the box?`,trays*packs*each,[trays+packs+each,trays*each,(trays-1)*packs*each],`Each tray holds ${packs} × ${each} = ${packs*each} markers. All ${trays} trays hold ${trays} × ${packs*each} = ${trays*packs*each}.`);
  const teams=seed+5,children=seed+4;
  add(10,`There are ${teams} teams with ${children} children on each team. The total is c. Which equation represents this?`,`c ÷ ${children} = ${teams}`,[`c + ${children} = ${teams}`,`c − ${children} = ${teams}`,`c × ${children} = ${teams}`],`Dividing the total by ${children} children per team gives ${teams} teams: c ÷ ${children} = ${teams}. The total is ${teams*children}.`);
  const yards=seed+5;
  add(11,`${yards} yards = ____ inches`,yards*36,[yards*12,yards*3,yards*36-36],`Each yard is 3 feet, and each foot is 12 inches. Multiply by 36: ${yards} × 36 = ${yards*36} inches.`);
  const radius=seed+13;
  add(12,'The segment shown goes from the center to the edge. What is the diameter?',`${radius*2} inches`,[radius/2,radius,radius*4].map(n=>`${n} inches`),`The radius is ${radius} inches. The diameter is twice the radius: 2 × ${radius} = ${radius*2} inches.`,{type:'oct10-radius',radius});
  return base.questions.map(q=>rows.find(r=>r.source===q.source));
 }
 const retries=[2,3].map((attempt,i)=>({...base,id:`week-oct12-3-${attempt}`,retest:true,cardLabel:`Day 3.${attempt}`,title:`Day 3.${attempt}`,description:'Fresh Day 3 practice. Aim for at least 9/12 on first tries, then finish your retries and Round 2.',questions:questions(i+1),reviewVariants:questions(i+3)}));
 bank.splice(bank.indexOf(base)+1,0,...retries);
 // Short follow-up to the repeated mixed-number errors and the Day 3.3
 // equivalent-fraction miss. This is separate from the 12-question checks.
 function fractionReview(review=false){
  const pairs=review?[[3,3,4],[5,2,7],[4,3,8],[6,2,5]]:[[2,2,3],[4,3,5],[3,2,5],[5,1,4]];
  const questions=pairs.map(([whole,n,d],i)=>{
   const prefix=i===2?`A recipe uses ${whole} full cups of flour and another ${n}/${d} cup. Write the total as an improper fraction of a cup.`:i===3?`Sam writes ${whole} ${n}/${d} = ${whole*d}/${d}. Fix his answer.`:`Write ${whole} ${n}/${d} as an improper fraction.`;
   return {source:i+1,sourceLabel:'Targeted fraction review',skill:'Mixed numbers to improper fractions',type:'number',retryUntilCorrect:true,prompt:`${prefix} ${whole} ${n}/${d} = ____/${d}. Fill in the missing numerator.`,answerLabel:'Missing numerator (top number)',correct:whole*d+n,hint:'Multiply the whole number by the denominator, then add the numerator. Keep the denominator unchanged.',explanation:`${whole} wholes are ${whole*d}/${d}. Add the extra ${n}/${d}: (${whole} × ${d} + ${n})/${d} = ${whole*d+n}/${d}.`};
  });
  const [a,b,factor]=review?[3,5,4]:[2,3,3];
  questions.push({source:5,sourceLabel:'Targeted fraction review',skill:'Equivalent fractions',type:'number',retryUntilCorrect:true,prompt:`Complete the equivalent fraction: ${a}/${b} = ____/${b*factor}. Fill in the missing numerator.`,answerLabel:'Missing numerator (top number)',correct:a*factor,hint:'Find what the denominator was multiplied by. Multiply the numerator by the same number.',explanation:`${b} × ${factor} = ${b*factor}, so multiply the numerator by ${factor} too: ${a} × ${factor} = ${a*factor}.`});
  const [c,d,k]=review?[4,5,3]:[3,4,3];
  questions.push({source:6,sourceLabel:'Targeted fraction review',skill:'Equivalent fractions',type:'number',retryUntilCorrect:true,prompt:`Complete the equivalent fraction: ${c}/${d} = ${c*k}/____. Fill in the missing denominator.`,answerLabel:'Missing denominator (bottom number)',correct:d*k,hint:'Find what the numerator was multiplied by. Multiply the denominator by the same number.',explanation:`${c} × ${k} = ${c*k}, so multiply the denominator by ${k} too: ${d} × ${k} = ${d*k}.`});
  return questions;
 }
 const focused={...base,id:'week-oct12-3-4',retest:true,targeted:true,practiceOnly:true,cardLabel:'Day 3.4',title:'Day 3.4 · Fraction check',description:'6 fill-in questions: 4 mixed-number conversions and 2 equivalent-fraction checks. Type the missing number and keep trying until correct. A method hint appears after two mistakes. Your first-try percentage is recorded separately; retries do not change it. No separate second round.',questions:fractionReview(),reviewVariants:fractionReview(true)};
 const followup={...focused,id:'week-oct12-3-5',cardLabel:'Day 3.5',title:'Day 3.5 · Fraction check',questions:fractionReview(true)};
 bank.splice(bank.indexOf(retries.at(-1))+1,0,focused,followup);
})(window);

