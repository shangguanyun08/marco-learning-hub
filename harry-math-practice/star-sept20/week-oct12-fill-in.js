(function(root){
 'use strict';
 const bank=root.HARRY_SEPT_PRACTICE;
 const retained={4:[1,4],5:[2,9,10],6:[1,4]};
 const hints={1:'Identify the place of the named digit, then multiply the digit by that place value.',2:'Find the ten-thousands digit. Look at the thousands digit to decide whether to round up.',3:'Count equal intervals from 0 to 1 for the denominator. Count intervals from 0 to P for the numerator.',4:'Multiply the numerator and denominator by the same number.',5:'Check which fraction operation the question asks for. Keep track of the denominator.',6:'Split one factor into tens and ones. Multiply each part, then add.',7:'Keep the decimal points lined up. For a price per ounce, multiply the ounces by the price.',8:'Find the largest whole number of full groups. Subtract the amount used from the total. The remainder must be smaller than the group size.',9:'Find how much is in all the equal groups, then combine that with the starting amount.',10:'For an amount per minute, divide the total amount by the number of minutes.',11:'Write down how many smaller units make one larger unit. Decide whether to multiply or divide.',12:'Check whether the question asks for area, perimeter, radius or diameter. Choose the matching calculation.'};
 function convert(original,day){
  original={...original,retryUntilCorrect:true,hint:hints[original.source]};
  if(retained[day].includes(original.source))return original;
  const text=String(original.choices[original.correct]),fraction=text.match(/^(\d+)\/(\d+)/),value=Number(text.replace(/[$,]/g,'').match(/^\d+(?:\.\d+)?/)?.[0]);
  if(!fraction&&!Number.isFinite(value))throw new Error('Missing fill-in answer: '+day+'/'+original.source);
  const q={...original,legacyQuestion:original,retryUntilCorrect:true,hint:hints[original.source],type:fraction?'fraction':'number',correct:fraction?fraction[1]+'/'+fraction[2]:value,decimal:!fraction&&text.includes('.'),answerLabel:fraction?'Your fraction':text.startsWith('$')?'Your answer in dollars':/square feet/.test(text)?'Your answer in square feet':/inches/.test(text)?'Your answer in inches':/ounces/.test(text)?'Your answer in ounces':/seconds/.test(text)?'Your answer in seconds':'Your answer'};
  if(original.source===5){
   q.hint=day===4?'Multiply the numerators together and the denominators together.':day===5?'Subtract the numerators and keep the common denominator, then simplify.':'Multiply the whole number by the denominator, then add the numerator. Keep the denominator.';
   q.requireSimplest=day===5;
  }
  return q;
 }
 for(const s of bank){const day=Number(s.id.split('-')[2]);if(!retained[day])continue;
  s.practiceOnly=true;
  s.questions=s.questions.map(q=>convert(q,day));
  s.description=`12 questions: ${12-retained[day].length} fill-in answers and ${retained[day].length} multiple-choice concept checks. Keep trying each question until correct. A method hint appears after two mistakes. Progress shows questions completed, with no score or separate second round.`;
  const variants=root.HarryWeekRound2.variants.get(s.id);
  if(variants)root.HarryWeekRound2.variants.set(s.id,variants.map(q=>convert(q,day)));
 }
 const group=root.HARRY_STAR_GROUPS?.find(g=>g.id==='week-2026-10-12');if(group)group.description='Earlier practice scores are saved. Day 3.4 and Days 4–6 are practice until correct, with completion progress and no scores. Days 4–6 are open to view and practice.';
})(window);
