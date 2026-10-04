(function(){
  'use strict';
  const amounts=[[1,1,1,1,1,1],[2,2,2,2,3,2],[3,4,3,3,5,3],[5,6,4,5,7,5]];
  ['oct4-original','oct4-a','oct4-b','oct4-c'].forEach((id,i)=>{
    const session=window.HARRY_SEPT_PRACTICE.find(s=>s.id===id),index=session.questions.findIndex(q=>q.source===7),legacyQuestion=session.questions[index];
    const [feet,yardsFeet,yardsInches,pounds,quarts,gallons]=amounts[i];
    const blank=(category,amount,from,to,factor)=>({category,label:`${amount} ${from} =`,unit:to,answer:amount*factor});
    session.questions[index]={source:7,sourceLabel:'Unit conversions',skill:'Length, weight and volume',type:'fill-blanks',legacyQuestion,
      prompt:'Fill in all six blanks. Write numbers only. This question earns 1 point when all six answers are correct on the first try.',
      blanks:[blank('Length',feet,'ft','in',12),blank('Length',yardsFeet,'yd','ft',3),blank('Length',yardsInches,'yd','in',36),blank('Weight',pounds,'lb','oz',16),blank('Volume',quarts,'qt','pt',2),blank('Volume',gallons,'gal','qt',4)],
      explanation:'Length: 1 foot = 12 inches; 1 yard = 3 feet = 36 inches. Weight: 1 pound = 16 ounces. Volume: 1 quart = 2 pints; 1 gallon = 4 quarts. Multiply the number of larger units by the conversion factor.'};
    const conversion=session.questions.splice(index,1)[0];session.questions.splice(1,0,conversion);
    session.description+=' Question 2 has six fill-in blanks covering length, weight and volume.';
  });
})();
