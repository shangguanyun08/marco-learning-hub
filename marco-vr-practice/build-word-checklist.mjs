// Emit an apply_patch payload for the standalone table; never edit source mock data.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const clean=x=>String(x).toLowerCase().replace(/\s*\([^)]*\)/g,'').replace(/[^a-z]/g,'');
export function checklistRows(){
 const rows=[];
 for(const [i,date] of ['2026-09-27','2026-10-04','2026-10-11','2026-10-22'].entries()){
  const c={window:{}};for(const name of i===3?['data.js','review-data.js']:['data.js'])vm.runInNewContext(fs.readFileSync(path.join(here,date,name),'utf8'),c);
  const p=c.window.MARCO_VR_REVIEW_PAGE,questions=p?p.questions:c.window.MARCO_ISEE_PRACTICE[0].questions,notes=p?p.notes:c.window.MARCO_VR_REVIEW;
  for(const q of [...questions].sort((a,b)=>a.number-b.number)){
   const n=notes[q.number],meaning=word=>{const entry=n.meanings.find(([w])=>clean(w)===clean(word));if(!entry)throw Error('Missing meaning: '+date+' Q'+q.number+' '+word);return entry[1];};
   rows.push({id:'t'+(i+1)+'-q'+q.number,test:i+1,label:'Test '+(i+1),date,number:q.number,type:q.type,prompt:q.prompt,choices:[...q.choices],correct:q.correct,wrongChoices:p?[...new Set(q.mockAttempts.map(a=>a.choice))]:[q.chosen],attempt:p?p.attempts.map(a=>a.label).join(' / '):'Completed mock attempt',targetMeaning:q.type==='synonym'?meaning(q.prompt.replace(/:$/,'')):null,choiceMeanings:q.choices.map(meaning),tip:q.tip});
  }
 }
 return JSON.parse(JSON.stringify(rows));
}
export function renderChecklist(){return fs.readFileSync(path.join(here,'word-checklist.template.html'),'utf8').replace('__QUESTIONS__',JSON.stringify(checklistRows()).replace(/</g,'\\u003c'));}
if(process.argv.includes('--patch')){
 const content=renderChecklist(),targets=[path.join(here,'word-checklist.html'),path.join(here,'../../output/Marco_VR_Wrong_Questions_Checklist.html')];
 let patch='*** Begin Patch\n';for(const file of targets){if(fs.existsSync(file)){patch+='*** Update File: '+file.replace(/\\/g,'/')+'\n@@\n'+fs.readFileSync(file,'utf8').trimEnd().split(/\r?\n/).map(l=>'-'+l).join('\n')+'\n'+content.trimEnd().split(/\r?\n/).map(l=>'+'+l).join('\n')+'\n';}else patch+='*** Add File: '+file.replace(/\\/g,'/')+'\n'+content.trimEnd().split(/\r?\n/).map(l=>'+'+l).join('\n')+'\n';}
 process.stdout.write(patch+'*** End Patch\n');
}
