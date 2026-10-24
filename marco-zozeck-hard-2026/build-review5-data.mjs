// Freeze a focused, independent review from saved first-pass evidence.
// The shared progress endpoint is read-only here; old answers are never rewritten.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url),Core=require('./quiz-core.js');
const clean=x=>String(x).toLowerCase().replace(/\s*\([^)]*\)/g,'').replace(/[^a-z]/g,'');
const shuffle=(items,seed)=>{const byId=new Map(items.map(q=>[q.id,q]));return Core.questionOrder([...byId.keys()],seed,1).map(id=>byId.get(id));};
export function buildReview5(record,source,mockMisses=[]){
 const grouped={priority:[],improving:[],recheck:[],maintenance:[]};
 for(const q of source.questions){
  const first=[];
  for(let cycle=1;cycle<=4;cycle++){
   const id=q.id.replace(/^r1-/,`r${cycle}-`),answer=record.state.sessions[q.session+(cycle-1)*100]?.rounds?.[0]?.answers?.[id];
   if(answer)first.push({...answer,cycle});
  }
  // Review numbers were not always attempted in date order.
  first.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
  let consecutive=0;for(let i=first.length-1;i>=0&&first[i].correct;i--)consecutive++;
  const streak=first.slice(first.length-consecutive),span=streak.length>=2?Date.parse(streak.at(-1).at)-Date.parse(streak[0].at):0;
  const target=q.quizType==='synonym'?q.word:q.answer;
  const laterMockMiss=mockMisses.some(m=>clean(m.mainWord)===clean(target)&&m.date>first.at(-1)?.at.slice(0,10));
  const group=consecutive>=2&&span>=48*3600000&&!laterMockMiss?'maintenance':consecutive>=2?'recheck':consecutive===1?'improving':'priority';
  grouped[group].push(q);
 }
 const buckets=[[],[],[]],sizes=[40,40,25];
 // Mix the small completion set evenly, then balance the other questions by load.
 const selected=['priority','improving','recheck'].flatMap(group=>grouped[group].map(q=>({...q,review5Category:group})));
 const completions=shuffle(selected.filter(q=>q.quizType==='completion'),'review5-20261024-completions');
 completions.forEach((q,i)=>buckets[i%3].push(q));
 for(const group of ['priority','improving','recheck']){
  for(const q of shuffle(selected.filter(q=>q.review5Category===group&&q.quizType!=='completion'),'review5-20261024-'+group)){
   const index=[0,1,2].filter(i=>buckets[i].length<sizes[i]).sort((a,b)=>buckets[a].length/sizes[a]-buckets[b].length/sizes[b]||a-b)[0];
   if(index===undefined)throw Error('Review 5 allocation exceeded 105 questions');
   buckets[index].push(q);
  }
 }
 if(selected.length!==105||grouped.maintenance.length!==97)throw Error('The saved selection changed. Recheck counts before publishing.');
 const questions=buckets.flatMap((bucket,i)=>shuffle(bucket,'review5-20261024-session-'+i).map(q=>({...q,id:q.id.replace(/^r1-/,'r5-'),session:501+i,reviewNumber:i+1,sourceReviewQuestionId:q.id,choices:[...q.choices]})));
 const sessions=buckets.map((bucket,i)=>({number:501+i,reviewNumber:i+1,label:'Review 5 · Session '+(i+1),questionCount:bucket.length,types:{synonym:bucket.filter(q=>q.quizType==='synonym').length,completion:bucket.filter(q=>q.quizType==='completion').length,definition:0}}));
 return {metadata:{title:'Review 5 · Focused practice',version:'20261024-review5-v1',createdDate:'2026-10-24',sourceProgressVersion:record.version,sourceSavedThrough:record.updatedAt.slice(0,10),sourceQuestionCount:source.questions.length,questionCount:questions.length,maintenanceCount:grouped.maintenance.length,selectionCounts:Object.fromEntries(Object.entries(grouped).map(([k,v])=>[k,v.length])),selectionRule:'Pause daily repetition only after consecutive later-review first answers are correct across at least 48 hours, with no recorded later mock miss for that target. Corrections do not count as separate first passes.',maintenanceQuestionIds:grouped.maintenance.map(q=>q.id),sessions},questions};
}
if(process.argv.includes('--patch')){
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(here,'round1-review-data.js'),'utf8'),context);
 const mockMisses=[];
 for(const date of ['2026-09-27','2026-10-04','2026-10-11','2026-10-22']){
  const mock={window:{}};for(const name of date==='2026-10-22'?['data.js','review-data.js']:['data.js'])vm.runInNewContext(fs.readFileSync(path.join(here,'../marco-vr-practice',date,name),'utf8'),mock);
  const page=mock.window.MARCO_VR_REVIEW_PAGE,questions=page?page.questions:mock.window.MARCO_ISEE_PRACTICE[0].questions,notes=page?page.notes:mock.window.MARCO_VR_REVIEW;
  for(const q of questions)mockMisses.push({date,mainWord:q.type==='synonym'?q.prompt.replace(/:$/,''):notes[q.number].word});
 }
 const response=await fetch('https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress?appId=marco-zozeck-mixed-360-v1');
 if(!response.ok)throw Error('Could not read saved course progress');
 const {progress}=await response.json(),data=buildReview5(progress,context.window.MARCO_ROUND1_REVIEW,mockMisses);
 const content='// Independent Review 5 copies; archived answers and IDs remain unchanged.\nwindow.MARCO_REVIEW5 = '+JSON.stringify(data,null,2)+';\n';
 const target=path.join(here,'review5-data.js').replace(/\\/g,'/');
 const lines=content.trimEnd().split('\n').map(l=>'+'+l).join('\n');
 const patch=fs.existsSync(target)?'*** Update File: '+target+'\n@@\n'+fs.readFileSync(target,'utf8').trimEnd().split(/\r?\n/).map(l=>'-'+l).join('\n')+'\n'+lines:'*** Add File: '+target+'\n'+lines;
 process.stdout.write('*** Begin Patch\n'+patch+'\n*** End Patch\n');
}
