import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));
const bank=await read('./review-bank.json'), practice=await read('./review2-practice-bank.json');
const review=bank.sessions.find(s=>s.day===31), original=await read('./question-bank.json'), plan=await read('./session-plan.json');
const sourceIds=['d03-q02','d03-q03','d03-q09','d03-q18','d04-q03','d04-q04','d04-q06','d04-q08','d05-q01','d05-q02','d11-q04','d11-q06','d11-q10','d11-q12','d12-q04','d12-q05','d12-q07','d14-q06','d14-q07','d14-q08','d14-q10','d14-q11','d14-q12','d14-q14','d14-q16'];
const numbers=text=>(text.match(/\d+(?:\.\d+)?/g)||[]).map(Number);
const rows=q=>[...q.questionHtml.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)].flatMap(m=>[...m[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(r=>[...r[1].matchAll(/<td>(.*?)<\/td>/g)].map(v=>v[1])));
const median=a=>{a=[...a].sort((x,y)=>x-y);return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;};
const expression=(text,vars)=>vm.runInNewContext(text.replaceAll('−','-').replace(/(\d)([a-z(])/g,'$1*$2'),vars,{timeout:100});
const close=(a,b)=>Math.abs(a-b)<1e-9;

test('Review 2 covers every first-try miss exactly once with stable, separate IDs and ten fresh follow-ups',()=>{
  assert.deepEqual(review.sourceQuestionIds,sourceIds);
  assert.deepEqual(review.sourceSessionDays,[15,16,17,23,24,27,28]);
  assert.equal(review.questions.length,25);
  assert.equal(bank.targetScore,90);
  assert.equal(practice.requiredStreak,3);
  assert.equal(practice.maxQuestions,10);
  const oldIds=new Set([...original.days.flatMap(d=>d.questions),...bank.sessions.filter(s=>s.day!==31).flatMap(d=>d.questions)].map(q=>q.id));
  const all=[];
  review.questions.forEach((parent,index)=>{
    assert.equal(parent.sourceQuestionId,sourceIds[index]);
    const source=original.days.flatMap(d=>d.questions).find(q=>q.id===parent.sourceQuestionId);
    const session=plan.sessions.find(s=>s.questionIds.includes(source.id));
    assert.equal(parent.sourceSessionDay,session.day);
    assert.equal(parent.sourceSessionLabel,session.label);
    assert.equal(parent.sourceSessionPosition,session.questionIds.indexOf(source.id)+1);
    assert.equal(parent.sourceDay,source.day);
    assert.equal(parent.sourceNumber,source.sourceNumber);
    const group=practice.groups[parent.id];
    assert.equal(group.length,10);
    const questions=[parent,...group];
    assert.equal(new Set(questions.map(q=>q.questionText)).size,11);
    questions.forEach((q,i)=>{
      assert.equal(q.day,31);
      assert.equal(q.sourceQuestionId,source.id);
      assert.equal(q.skill,parent.skill);
      assert.ok(!oldIds.has(q.id));
      assert.notEqual(q.questionText,source.questionText);
      assert.ok(q.explanation.length>45);
      assert.equal(q.options.length,4);
      assert.equal(new Set(q.options.map(o=>o.text)).size,4);
      assert.equal(q.correctIndexes.length,1);
      assert.equal(q.options[q.correctIndexes[0]].text,q.correctAnswer);
      assert.equal(q.options[q.correctIndexes[0]].html,q.correctHtml);
      assert.doesNotMatch(q.questionHtml,/NaN|undefined|Infinity|<img|src=/);
      if(i){assert.equal(q.parentQuestionId,parent.id);assert.equal(q.practiceNumber,i);}
    });
    all.push(...questions);
  });
  assert.equal(all.length,275);
  assert.equal(new Set(all.map(q=>q.id)).size,275);
});

test('all 275 new question keys match independent calculations from the displayed question data',()=>{
  for(const parent of review.questions) for(const q of [parent,...practice.groups[parent.id]]) {
    const n=numbers(q.questionText),t=q.questionText;
    let matches,expected,value=o=>Number(o.text);
    const matching=predicate=>q.options.flatMap((o,i)=>predicate(o)?[i]:[]);
    const expressionMatches=(target,vars,not=false)=>matching(o=>not?!vars.every(v=>close(expression(o.text,v),target(v))):vars.every(v=>close(expression(o.text,v),target(v))));
    switch(parent.position) {
      case 1: {
        const block=t.match(/The block (.*?) repeats/)[1].split(', '),p=n.at(-1);
        expected=block[(p-1)%block.length];value=o=>o.text;break;
      }
      case 2: expected=n[(n.at(-2)-1)%6]+n[(n.at(-1)-1)%6];break;
      case 3: expected=n[0]+n[1];break;
      case 4: matches=expressionMatches(v=>(n[2]-n[1]*v.d)/n[0],[{d:0},{d:1},{d:3}]);break;
      case 5: matches=expressionMatches(v=>(n[1]*v.x+n[2])/n[0],[{x:0},{x:1},{x:5}]);break;
      case 6: matches=expressionMatches(v=>v.a+n[0]*v.a+(n[0]*v.a+n[1]),[{a:0},{a:1},{a:4}],true);break;
      case 7: matches=matching(o=>[n[1]+1,n[1]+10].every(m=>close(expression(o.text.split('=')[1],{m}),n[0]+n[2]*(m-n[1]))));break;
      case 8: {
        // Five- and ten-cent coin values are explicitly stated before the count difference.
        const more=n[2],total=n[3]*100;
        matches=matching(o=>[0,1,4].every(d=>close(expression(o.text.split('=')[0],{d}),10*d+5*(d+more)))&&close(Number(o.text.split('=')[1]),total));break;
      }
      case 9: expected=n[0]*n[1]/n[2];break;
      case 10: expected=(n[3]-n[0])*n[2]/n[1];break;
      case 11: {
        const p=n[0],limit=Number(rows(q)[0][1]),max=p*p/16;
        expected=t.includes('length and width are equal')?2:limit>max?1:3;value=o=>q.options.indexOf(o);break;
      }
      case 12: {
        const [a,b]=rows(q)[0];
        assert.ok([10,35,70].every(y=>close(expression(a,{x:90-y}),expression(b,{y}))));
        expected=2;value=o=>q.options.indexOf(o);break;
      }
      case 13: {
        const angle=t.match(/angle y measures (\d+)°/);
        expected=angle?(60>+angle[1]?0:60<+angle[1]?1:2):3;value=o=>q.options.indexOf(o);break;
      }
      case 14: assert.equal(Number(rows(q)[0][1]),n[0]/n[1]);expected=0;value=o=>q.options.indexOf(o);break;
      case 15: expected=n[0]/2;break;
      case 16: {
        expected=n[0]*n[1]-n[3];
        assert.equal(n[2],n[0]-2);
        assert.ok(expected/2<=n[3]/n[2],'The two smallest values must be able to be the smallest');break;
      }
      case 17: expected=3*n[0]-n[1]-n[2];assert.ok(expected>n[1]&&expected<n[2]);break;
      case 18: expected=median(n);break;
      case 19: {
        const frequencies=rows(q).map(row=>row.map(Number)),before=frequencies.flatMap(([v,f])=>Array(f).fill(v)),after=[...before];
        after[after.indexOf(n[0])]=n[1];
        const stats=a=>{const counts=new Map();a.forEach(v=>counts.set(v,(counts.get(v)||0)+1));return [a.reduce((s,v)=>s+v,0)/a.length,median(a),[...counts].sort((a,b)=>b[1]-a[1])[0][0],Math.max(...a)-Math.min(...a)];};
        assert.deepEqual(stats(before).map((v,i)=>v!==stats(after)[i]),[true,false,false,false]);
        expected='Only the mean changes.';value=o=>o.text;break;
      }
      case 20: {
        const a=rows(q).map(r=>Number(r[1])).sort((a,b)=>a-b),freq=new Map();a.forEach(v=>freq.set(v,(freq.get(v)||0)+1));
        const mode=[...freq].sort((a,b)=>b[1]-a[1])[0][0],mean=a.reduce((s,v)=>s+v,0)/a.length,iqr=median(a.slice(4))-median(a.slice(0,4));
        matches=matching(o=>o.text.startsWith('The mode')?mode!==median(a):o.text.startsWith('The mean')?!(mean>a.at(-1)-a[0]):o.text.includes('March')?a[2]+a[3]!==numbers(o.text)[0]:!close(iqr,numbers(o.text)[0]));break;
      }
      case 21: expected=Number(rows(q).sort((a,b)=>Number(b[1])-Number(a[1]))[0][0]);break;
      case 22: {
        const pairs=[...t.matchAll(/\((\d+), (\d+)\)/g)].map(m=>[+m[1],+m[2]]),meanX=pairs.reduce((s,p)=>s+p[0],0)/pairs.length,meanY=pairs.reduce((s,p)=>s+p[1],0)/pairs.length;
        const covariance=pairs.reduce((s,p)=>s+(p[0]-meanX)*(p[1]-meanY),0);
        assert.equal(pairs.length,6);assert.notEqual(covariance,0);
        expected=covariance>0?'On these days, higher temperatures tended to go with more cups sold.':'On these days, higher temperatures tended to go with fewer cups sold.';value=o=>o.text;break;
      }
      case 23: {
        const counts=t.match(/There are (\d+) dogs and (\d+) cats/),target=Number(rows(q)[0][1]);
        const weighted=counts?(+counts[1]*n[0]+(+counts[2])*n[1])/(+counts[1]+(+counts[2])):null;
        expected=counts?(close(weighted,target)?2:weighted>target?0:1):3;value=o=>q.options.indexOf(o);break;
      }
      case 24: {
        const gcd=(a,b)=>b?gcd(b,a%b):a,minTotal=n[1]/gcd(n[0],n[1]),target=Number(rows(q)[0][1]);
        expected=minTotal>target?0:3;value=o=>q.options.indexOf(o);break;
      }
      case 25: {
        const target=Number(rows(q)[0][1]),minRange=n[1]-n[0];
        expected=t.includes('Nora is the oldest')?(minRange===target?2:minRange>target?0:1):minRange>target?0:3;value=o=>q.options.indexOf(o);break;
      }
      default: assert.fail(`Missing checker for ${parent.position}`);
    }
    matches ||= matching(o=>typeof expected==='number'?close(value(o),expected):value(o)===expected);
    assert.deepEqual(matches,q.correctIndexes,q.id);
  }
});
