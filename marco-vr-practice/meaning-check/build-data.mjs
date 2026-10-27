import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {deferred,difficulty,levelLabels} from './curation.mjs';
const patchRequested=process.argv.includes('--patch');
// The older builder has a CLI-only --patch side effect; don't trigger it on import.
process.argv=process.argv.filter(a=>a!=='--patch');
const {checklistRows}=await import('../build-word-checklist.mjs');
const here=new URL('./',import.meta.url),repo=new URL('../../',here);
const c={};c.window=c;vm.createContext(c);
for(const f of ['marco-vr-practice/kindle-tests-1-2/data.js','marco-vr-practice/kindle-tests-1-8/questions.js','marco-vr-practice/kindle-tests-1-8/data.js','marco-vr-practice/kindle-vr-focused/pdf-data.js','marco-vr-practice/kindle-vr-focused/data.js','marco-zozeck-hard-2026/mixed-data.js','marco-zozeck-hard-2026/review5-data.js'])vm.runInContext(fs.readFileSync(new URL(f,repo),'utf8'),c);
export const normalize=s=>s.normalize('NFKC').replace(/\s*\([^)]*\)/g,'').replace(/:$/,'').trim().replace(/\s+/g,' ').toUpperCase();
export function build(){
 const words=new Map(),inputs={};
 function add(word,source){const head=normalize(word);if(!/^[A-Z]+(?:[ -][A-Z]+)*$/.test(head))throw Error('Unexpected headword: '+word);if(!words.has(head))words.set(head,{id:head.toLowerCase().replace(/ /g,'-'),word:head,sources:[]});const row=words.get(head);if(!row.sources.some(s=>s.group===source.group&&s.ref===source.ref))row.sources.push(source);}
 const focused=c.MARCO_ISEE_PRACTICE.flatMap(s=>s.questions).filter(q=>q.type==='synonym');inputs.focusedSynonymQuestions=focused.length;
 for(const q of focused)add(q.word,{group:'focused',ref:String(q.source),label:`Kindle/Premium Test ${q.test} · Synonym Q${q.number}`});
 const mixed=c.MARCO_MIXED_VR.questions.filter(q=>q.quizType==='synonym');inputs.mixedSynonymQuestions=mixed.length;
 for(const q of mixed)add(q.word,{group:'mixed',ref:q.id,label:`Mixed Zozeck · Session ${q.session}`});
 const review=c.MARCO_REVIEW5.questions.filter(q=>q.quizType==='synonym');inputs.review5SynonymQuestions=review.length;
 for(const q of review)add(q.word,{group:'review5',ref:q.id,label:`Review 5 · Session ${q.reviewNumber}`});
 const mocks=checklistRows();inputs.mockSynonymRecords=mocks.filter(q=>q.type==='synonym').length;inputs.mockCompletionTargetRecords=mocks.filter(q=>q.type!=='synonym').length;
 for(const q of mocks)add(q.mainWord,{group:q.type==='synonym'?'mock-synonym':'mock-completion-target',ref:q.id,label:`Mock ${q.date} · ${q.type==='synonym'?'Synonym':'Completion target'} Q${q.number}`});
 const excluded=[];for(const [category,list] of Object.entries(deferred))for(const word of list){const row=words.get(word);if(!row)throw Error('Unknown deferred target: '+word);if(row.sources.some(s=>s.group.startsWith('mock-')))throw Error('Actual mock miss must stay: '+word);excluded.push({word,category,sources:row.sources});words.delete(word);}
 const rows=[...words.values()].map(row=>({...row,difficulty:difficulty(row.word)})).sort((a,b)=>a.difficulty-b.difficulty||a.word.localeCompare(b.word));
 rows.forEach((r,i)=>{r.number=i+1;r.section=Math.floor(i/50)+1;r.gradeBand=({1:'4–6',2:'6–8',3:'8–10'})[r.difficulty];r.gradeEstimate=true;});
 return {version:'20261026-v1',appId:'marco-vr-meaning-check-20261026-v1',title:'Marco · Word Meaning Check',sectionSize:50,total:rows.length,originalTotal:rows.length+excluded.length,excluded,order:'easy-to-hard',levelLabels,inputs,sections:Array.from({length:Math.ceil(rows.length/50)},(_,i)=>({number:i+1,count:rows.filter(r=>r.section===i+1).length})),words:rows};
}
const data=build();
if(patchRequested){const path=fileURLToPath(new URL('data.js',here)),text='/* Word-only recall list. No choices, answer meanings, or scores. */\nwindow.MARCO_MEANING_CHECK = '+JSON.stringify(data)+';\n';let patch='*** Begin Patch\n'+(fs.existsSync(path)?'*** Update File: '+path+'\n@@\n'+fs.readFileSync(path,'utf8').trimEnd().split(/\r?\n/).map(l=>'-'+l).join('\n')+'\n':'*** Add File: '+path+'\n')+text.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n*** End Patch\n';process.stdout.write(patch);}else if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({total:data.total,sections:data.sections,inputs:data.inputs,groupUnique:Object.fromEntries(['focused','mixed','review5','mock-synonym','mock-completion-target'].map(g=>[g,data.words.filter(w=>w.sources.some(s=>s.group===g)).length]))},null,2));
