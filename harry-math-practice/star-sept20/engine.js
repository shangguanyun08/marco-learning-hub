(function (root) {
  'use strict';
  const normalize = value => {
    const text=String(value).trim().replace(/[ ,]/g,'');
    return /^\d+$/.test(text)&&Number.isSafeInteger(Number(text))?String(Number(text)):null;
  };
  const normalizeDecimal = value => {
    const text=String(value).trim().replace(/[ ,]/g,'');
    return /^\d+(?:\.\d{1,8})?$/.test(text)&&Number.isFinite(Number(text))&&Number(text)<1e12?String(Number(text)):null;
  };
  const typed = question => question.type==='number'||question.type==='decimal'||question.type==='split-sum';
  const splitValues = value => {
    if(Array.isArray(value))return value;
    const text=String(value);
    return text.match(/^(.*?) × (.*?) \+ (.*?) × (.*?) = (.*?) \+ (.*?) = (.*?)$/)?.slice(1)||text.match(/^(.*?)\s+\+\s+(.*?)\s+=\s+(.*?)$/)?.slice(1)||null;
  };
  const normalizeFor = (question,value) => {
    if(question.type!=='split-sum')return question.decimal?normalizeDecimal(value):normalize(value);
    const parts=splitValues(value);
    if(!parts||![3,7].includes(parts.length))return null;
    const normalized=parts.map(normalize);
    if(normalized.some(p=>p===null))return null;
    return normalized.length===7?`${normalized[0]} × ${normalized[1]} + ${normalized[2]} × ${normalized[3]} = ${normalized[4]} + ${normalized[5]} = ${normalized[6]}`:`${normalized[0]} + ${normalized[1]} = ${normalized[2]}`;
  };
  const isCorrect = (question,choice) => {
    if(question.type!=='split-sum')return typed(question)?normalizeFor(question,choice)!==null&&Number(normalizeFor(question,choice))===question.correct:choice===question.correct;
    const normalized=normalizeFor(question,choice);if(normalized===null)return false;
    const values=splitValues(normalized).map(Number);
    // Previously saved three-box work retains its original scoring.
    if(values.length===3)return values.every((n,i)=>n===question.parts[i]);
    const pair=(a,b,x,y)=>(a===x&&b===y)||(a===y&&b===x);
    const [a,b,c,d,p,q,total]=values,[f,large,g,small]=question.expansion;
    const factors=(pair(a,b,f,large)&&pair(c,d,g,small))||(pair(a,b,g,small)&&pair(c,d,f,large));
    return factors&&a*b===p&&c*d===q&&p+q===total&&total===question.correct;
  };
  const done = (question,entry) => !!entry && (entry.attempts.length >= 2 || entry.attempts.some(a=>isCorrect(question,a.choice)));
  function submit(run,question,choice,at) {
    if(question.type==='split-sum'&&splitValues(choice)?.length!==7)return false;
    if(typed(question)){choice=normalizeFor(question,choice);if(choice===null)return false;}
    else if (!Number.isInteger(choice) || choice<0 || choice>=question.choices.length) return false;
    const entry=run.answers[question.source] || {attempts:[]};
    if (done(question,entry) || entry.attempts.some(a=>a.choice===choice)) return false;
    entry.attempts.push({choice,correct:isCorrect(question,choice),at});
    run.answers[question.source]=entry;
    return true;
  }
  function stats(session,run) {
    let first=0,attempted=0,corrected=0,revealed=0,finished=0;
    session.questions.forEach(q=>{
      const e=run.answers[q.source];if(!e?.attempts.length)return;
      attempted++;
      if(isCorrect(q,e.attempts[0].choice))first++;
      else if(e.attempts[1]&&isCorrect(q,e.attempts[1].choice))corrected++;
      else if(e.attempts.length===2)revealed++;
      if(done(q,e))finished++;
    });
    return {first,attempted,corrected,revealed,finished,total:session.questions.length,percent:Math.round(first/session.questions.length*100)};
  }
  root.HarrySeptEngine={done,submit,stats,isCorrect,normalize,normalizeFor,typed,splitValues};
})(typeof window==='undefined'?globalThis:window);
