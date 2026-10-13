// Fixtures reach completion through the existing quiz engine; no invented completion rule.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),Core=require('./quiz-core.js');
const context={window:{}};
for(const file of ['mixed-data.js','round1-review-data.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context);
const base=context.window.MARCO_MIXED_VR.questions,review=context.window.MARCO_ROUND1_REVIEW.questions;
const words=[...base,...[1,2,3,4].flatMap(cycle=>review.map(q=>({...q,id:q.id.replace(/^r1-/,`r${cycle}-`),session:q.session+(cycle-1)*100})))];
const order=[1,2,3,4,5,6,7,8,9,...[1,2,3,4].flatMap(cycle=>[1,2,3,4,5].map(n=>100*cycle+n))];
const at='2026-10-13T01:00:00.000Z';
function complete(progress,number){const qs=words.filter(q=>q.session===number);Core.start(progress,number,qs.map(q=>q.id),at);while(!progress.sessions[number].completedAt){const round=Core.current(progress.sessions[number]);for(const id of round.ids){if(!round.answers[id])Core.answer(progress,number,words.find(q=>q.id===id).answer,words,at,id);}Core.finishRound(progress,number,at);}return progress;}
function earlier(progress=Core.blank(),number){const copy=JSON.parse(JSON.stringify(progress));for(const n of order.slice(0,order.indexOf(number)))if(!copy.sessions[n])complete(copy,n);return copy;}
module.exports={words,order,complete,earlier};
