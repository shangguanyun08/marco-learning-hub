(function(root){
  'use strict';
  const C=root.MarcoSkillCourse,copy=x=>JSON.parse(JSON.stringify(x));
  // Stable IDs keep a review question unchanged on reload and on another device.
  // Preserve the original form (seed % 3), changing the mathematical givens.
  const givens=q=>JSON.stringify([q.prompt,q.table,q.graph,q.series,q.diagram,q.columns,q.choiceGraphs,q.concept==='direction'?q.choices:null]);
  C.round2Question=function(id){
    const [kind,raw]=id.split('@'),seed=Number(raw),original=C.question(kind,seed);
    if(original.id!==id)throw new Error('Invalid source question');
    let q;
    if(kind==='powers'||kind==='dimension'){
      q=copy(original);
      const v=seed%3;
      let answer,wrong;
      if(kind==='powers'){
        const exp=original.audit.exp+1;
        q.audit={kind,v,exp};
        if(v===0){q.columns=[`0.01^${exp}`,`0.1^${2*exp}`];q.correct=2;}
        else if(v===1){q.columns=[`0.1^${exp}`,`0.1^${exp+1}`];q.correct=0;}
        else{q.prompt=`What is (0.1)^${exp}?`;answer='0.'+'0'.repeat(exp-1)+'1';wrong=['0.'+'0'.repeat(exp)+'1',String(exp/10),'0.1'];}
        q.explanation=`0.01 = 0.1², so 0.01^${exp} = 0.1^${2*exp}. Also, 0.1^${exp} = ${10**-exp}. Increasing the exponent by one divides the value by 10.`;
      }else{
        const scale=v===0?1.2:v===1?3:0.8,power=v===1?3:2,factor=scale**power;
        q.audit={kind,v,scale,power};
        q.prompt=v===0?'Each side of a square is increased by 20%. By what percent does its AREA increase?':v===1?'Each edge of a cube is tripled. The new volume is how many times the original volume?':'Each side of a square is reduced by 20%. By what percent does its AREA decrease?';
        answer=v===1?'27':v===0?'44%':'36%';wrong=v===1?['3','9','6']:v===0?['20%','40%','144%']:['20%','40%','64%'];
        q.explanation=`The length factor is ${scale}. The ${power===3?'volume':'area'} factor is ${scale}^${power} = ${Number(factor.toFixed(4))}. ${v===1?'The volume is 27 times the original.':v===0?'The new area is 144% of the original, an increase of 44%.':'The new area is 64% of the original, a decrease of 36%.'}`;
      }
      if(answer!==undefined){q.correct=(original.correct+1)%4;q.choices=wrong;q.choices.splice(q.correct,0,answer);}
    }else{
      for(let offset=3;offset<=501;offset+=3){
        let candidate=seed+offset;while(candidate>500)candidate-=498;
        const next=C.question(kind,candidate);
        if(givens(next)!==givens(original)){q=next;break;}
      }
      if(!q)throw new Error('No fresh-number variant for '+id);
      // Change the answer position too, except for standard quantitative comparisons.
      if(!q.columns){const old=q.correct;q.choices.push(q.choices.shift());if(q.choiceGraphs){q.choiceGraphs.push(q.choiceGraphs.shift());q.choices=q.choices.map((_,i)=>'Graph '+'ABCD'[i]);}if(q.audit.order)q.audit.order.push(q.audit.order.shift());q.correct=(old+3)%4;}
    }
    q.id='r2:'+id;q.sourceQuestionId=id;return q;
  };
})(typeof window==='undefined'?globalThis:window);
