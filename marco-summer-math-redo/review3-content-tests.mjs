import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));
const bank=await read('./review-bank.json'),practice=await read('./review3-practice-bank.json'),plan=await read('./session-plan.json');
const review=bank.sessions.find(s=>s.day===32),original=await read('./question-bank.json');
const sourceIds=['d05-q04','d05-q06','d05-q08','d05-q09','d05-q13','d06-q02','d06-q03','d06-q04','d06-q05','d06-q06','d06-q07','d06-q08','d06-q09','d06-q12','d06-q13','d06-q17','d10-q04','d10-q06','d10-q12','d10-q16','d10-q17','d10-q18','d10-q19','d11-q01','d11-q02','d11-q03','d13-q04','d13-q07','d13-q08'];
const unfinished=['d06-q05','d06-q06','d06-q07','d06-q08','d06-q09','d10-q18','d10-q19','d11-q01','d11-q02'];
const numeric=text=>{const s=String(text).replaceAll('−','-');return s.includes('/')?s.split('/').map(Number).reduce((a,b)=>a/b):Number(s);};
const nums=text=>(text.replaceAll('−','-').match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
const close=(a,b)=>Math.abs(a-b)<1e-8;
const pair=text=>nums(text);
const points=text=>[...text.matchAll(/\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/g)].map(m=>m.slice(1).map(Number));
const equation=text=>{const [,m,sign,b]=/^y = (.+)x ([+−]) (.+)$/.exec(text);return [numeric(m),numeric(b)*(sign==='−'?-1:1)];};
const onLine=(option,p)=>{const [m,b]=equation(option);return close(p[1],m*p[0]+b);};
function numberLinePoints(q){
  const labels=[...q.questionHtml.matchAll(/<text x="([\d.]+)" y="86" text-anchor="middle">([^<]+)<\/text>/g)].map(m=>[Number(m[1]),Number(m[2])]);
  const scale=(labels[1][1]-labels[0][1])/(labels[1][0]-labels[0][0]);
  return Object.fromEntries([...q.questionHtml.matchAll(/<text x="([\d.]+)" y="31" text-anchor="middle">([^<]+)<\/text>/g)].map(m=>[m[2],labels[0][1]+(Number(m[1])-labels[0][0])*scale]));
}
test('Review 3 includes exactly the 20 first misses and 9 unanswered sources, excludes Session 12, and has separate IDs',()=>{
  assert.deepEqual(review.sourceQuestionIds,sourceIds);
  assert.deepEqual(review.sourceSessionDays,[18,19,20,21,22,25]);
  assert.deepEqual(review.questions.filter(q=>q.selectionReason==='unfinished').map(q=>q.sourceQuestionId),unfinished);
  assert.equal(review.questions.length,29);assert.equal(bank.targetScore,90);
  assert.equal(practice.maxQuestions,10);assert.equal(practice.requiredStreak,3);
  const otherIds=new Set([...original.days,...bank.sessions.filter(s=>s.day!==32)].flatMap(s=>s.questions.map(q=>q.id)));
  const all=[];
  for(const q of review.questions){
    const s=plan.sessions.find(s=>s.questionIds.includes(q.sourceQuestionId));
    assert.ok(review.sourceSessionDays.includes(s.day));assert.notEqual(s.day,26);
    assert.equal(q.sourceSessionPosition,s.questionIds.indexOf(q.sourceQuestionId)+1);
    assert.equal(q.sourceSessionLabel,s.label);
    const group=practice.groups[q.id];assert.equal(group.length,10);
    for(const [i,item] of [q,...group].entries()){
      assert.equal(item.day,32);assert.equal(item.sourceQuestionId,q.sourceQuestionId);
      assert.ok(!otherIds.has(item.id));assert.equal(item.options.length,4);
      assert.equal(new Set(item.options.map(o=>o.text)).size,4);
      assert.equal(item.options[item.correctIndexes[0]].text,item.correctAnswer);
      assert.equal(item.options[item.correctIndexes[0]].html,item.correctHtml);
      assert.doesNotMatch(item.questionHtml,/NaN|undefined|Infinity|<img|src=/);
      assert.ok(item.explanation.length>45);
      if(i){assert.equal(item.parentQuestionId,q.id);assert.equal(item.practiceNumber,i);assert.notEqual(item.questionHtml,q.questionHtml);}
      all.push(item);
    }
  }
  assert.equal(all.length,319);assert.equal(new Set(all.map(q=>q.id)).size,319);
});
test('all 319 Review 3 answers agree with independent calculations using the displayed questions and diagrams',()=>{
  for(const parent of review.questions)for(const q of [parent,...practice.groups[parent.id]]){
    const text=q.questionText,options=q.options.map(o=>o.text),n=nums(text);
    const matchOptions=fn=>options.flatMap((v,i)=>fn(v)?[i]:[]);
    let matches,expected;
    switch(q.position){
      case 1:expected=(n[0]*3)/(n[1]*2)-n[0]/n[1];break;
      case 2:{const c=Number(/2b = (\d+)/.exec(text)[1]),a=Number(/when a = (\d+)/.exec(text)[1]),b=Number(/when b = (\d+)/.exec(text)[1]);const A=(c-a/2)/2,B=(c-2*b)*2;matches=[A>B?0:A<B?1:2];break;}
      case 3:matches=[2];assert.match(text,/x⁴ \+ x²/);break;
      case 4:matches=[0];assert.match(text,/slower than Jill/);assert.ok(n[0]>0);break;
      case 5:matches=[3];assert.match(text,/any real number/);break;
      case 6:matches=matchOptions(o=>o.startsWith('All real numbers from')&&o.endsWith('including both endpoints.'));assert.match(q.questionHtml,/entire interval.*including both endpoints/);break;
      case 7:{const p=numberLinePoints(q);matches=matchOptions(o=>nums(o).every((v,i)=>close(v,[p.A,p.B,p.C][i])));break;}
      case 8:{const p=numberLinePoints(q);expected=(p.Q+p.R)/2;break;}
      case 9:{const p=numberLinePoints(q);expected=p.J+p.K+p.L;break;}
      case 10:{const p=numberLinePoints(q);expected=2*p.X-p.Y;break;}
      case 11:matches=matchOptions(o=>o.startsWith('All integers from 0'));assert.match(q.questionHtml,/Only individual dots/);break;
      case 12:case 13:{const vals=nums(text.replaceAll(',','')).slice(0,3);const r=vals.map(v=>Number(v.toPrecision(1)));expected=r[0]/r[1]/r[2];if(q.position===12)expected=Math.round(expected);break;}
      case 14:expected=n[0]*100;break;
      case 15:{const terms=[...text.matchAll(/\((\d+) × 10\^(\d+)\)/g)].map(m=>BigInt(m[1])*10n**BigInt(m[2]));assert.equal(terms.length,4);const A=terms[0]*terms[1],B=terms[2]*terms[3];matches=[A>B?0:A<B?1:2];break;}
      case 16:{const terms=[...text.matchAll(/([\d.]+) × 10\^(\d+)/g)].map(m=>Number(m[1])*10**Number(m[2]));const [A,b,c]=terms,B=b-c;matches=[A>B?0:A<B?1:2];break;}
      case 17:{const [x,y]=points(text)[0];matches=matchOptions(o=>{const p=pair(o);return p[0]===y&&p[1]===-x;});break;}
      case 18:{const [a,b,c]=points(text),parallel=(u,v,w,z)=>(v[0]-u[0])*(z[1]-w[1])===(v[1]-u[1])*(z[0]-w[0]);matches=matchOptions(o=>{const d=pair(o);return !parallel(a,b,c,d)&&!parallel(b,c,d,a);});break;}
      case 19:{const m=n[0],[x,y]=points(text)[0];matches=matchOptions(o=>{const [u,v]=pair(o);return close(v-y,m*(u-x));});break;}
      case 20:{const m=n[0],x=n[1];matches=matchOptions(o=>close(equation(o)[0],m)&&onLine(o,[x,0]));break;}
      case 21:{const m=n[0]/n[1],p=points(text)[0];matches=matchOptions(o=>close(equation(o)[0],m)&&onLine(o,p));break;}
      case 22:case 23:case 25:{const p=points(text);matches=matchOptions(o=>p.every(point=>onLine(o,point)));break;}
      case 24:{const m=n[0],p=points(text)[0];matches=matchOptions(o=>close(equation(o)[0],m)&&onLine(o,p));break;}
      case 26:{const label=/aria-label="Coordinate grid\. ([^"]+)"/.exec(q.questionHtml)[1],p=points(label);assert.equal(p.length,2);matches=matchOptions(o=>p.every(point=>onLine(o,point)));break;}
      case 27:{const [o,p,u]=n;const numerators=[(o+p)*(o+p-1),(p+u)*(p+u-1),o*u,o*(o-1)];assert.ok(numerators[0]>Math.max(...numerators.slice(1)));matches=matchOptions(v=>v==='Neither marble is purple.');break;}
      case 28:{const word=/position in ([A-Z]+)/.exec(text)[1];expected=[...word].filter(c=>'AEIOU'.includes(c)).length/word.length;break;}
      case 29:matches=matchOptions(o=>{const [milk,other]=nums(o);return close(milk/(milk+other),2/5);});break;
      default:throw Error(q.id);
    }
    if(expected!==undefined)matches=matchOptions(o=>close(numeric(o),expected));
    assert.deepEqual(matches,q.correctIndexes,q.id+': '+text);
  }
});
test('the incorrect source percentage key is corrected only in the new review',()=>{
  const q=review.questions.find(q=>q.sourceQuestionId==='d06-q12');
  assert.equal(q.correctAnswer,'7');assert.equal(q.input.unit,'%');
  assert.equal(original.days.flatMap(d=>d.questions).find(q=>q.id==='d06-q12').correctAnswer,'0.07');
});
