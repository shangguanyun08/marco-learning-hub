// Bounded editor support for this chat's feedback monitor. No credentials are required by the hub's existing shared service.
import fs from 'node:fs/promises';
import {SOURCE,DRAFT_APP,FEEDBACK_APP,ENDPOINT,mergeFeedback,revisionPatch} from './sync-model.mjs';
const deviceId='application-editorial-assistant-v1';
async function get(appId){const r=await fetch(`${ENDPOINT}?appId=${appId}`,{cache:'no-store',signal:AbortSignal.timeout(20000)});const data=await r.json();if(!r.ok)throw new Error(data.error||`Read failed: ${r.status}`);return data.progress;}
async function post(appId,state,baseVersion){const r=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({appId,state,baseVersion,deviceId,studentName:'Family application',progressScore:0,clientUpdatedAt:new Date().toISOString()}),signal:AbortSignal.timeout(20000)});const data=await r.json();if(!r.ok)throw new Error(data.error||`Save failed: ${r.status}`);return data;}
const [command,path]=process.argv.slice(2);
if(command==='pending'){
 const record=await get(FEEDBACK_APP),state=mergeFeedback(record?.state);
 const pending=Object.values(state.submissions).filter(s=>!state.responses[s.id]).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
 console.log(JSON.stringify({source:SOURCE,pending},null,2));
}else if(command==='complete'){
 if(!path)throw new Error('Pass the response JSON file path.');
 const response=JSON.parse(await fs.readFile(path,'utf8'));
 if(typeof response.submissionId!=='string'||typeof response.summary!=='string'||!response.proposedEdits||typeof response.proposedEdits!=='object')throw new Error('Response requires submissionId, summary, and proposedEdits.');
 const queue=mergeFeedback((await get(FEEDBACK_APP))?.state),submission=queue.submissions[response.submissionId];
 if(!submission)throw new Error('Unknown submitted feedback.');
 if(queue.responses[response.submissionId]){console.log(JSON.stringify({alreadyCompleted:true,response:queue.responses[response.submissionId]}));process.exit(0);}
 let patch;
 for(let attempt=0;attempt<6;attempt++){
  const draft=await get(DRAFT_APP);
  if(draft&&draft.state?.source!==SOURCE)throw new Error('Unknown draft version.');
  patch=revisionPatch(draft?.state?.fields||{},submission,response.proposedEdits,deviceId);
  if(!patch.applied.length)break;
  const saved=await post(DRAFT_APP,{schema:2,source:SOURCE,fields:patch.fields},draft?.version??null);
  if(saved.accepted)break;
  if(attempt===5)throw new Error('Draft changed repeatedly. No response acknowledged; retry later.');
 }
 const finished={submissionId:response.submissionId,completedAt:new Date().toISOString(),summary:response.summary,details:typeof response.details==='string'?response.details:'',proposedEdits:response.proposedEdits,applied:patch.applied,held:patch.held};
 for(let attempt=0;attempt<6;attempt++){
  const latest=await get(FEEDBACK_APP),state=mergeFeedback(latest?.state);
  if(state.responses[response.submissionId]){console.log(JSON.stringify({alreadyCompleted:true}));process.exit(0);}
  state.responses[response.submissionId]=finished;
  if((await post(FEEDBACK_APP,state,latest?.version??null)).accepted){console.log(JSON.stringify(finished,null,2));process.exit(0);}
 }
 throw new Error('Could not acknowledge the revision. Retry with the same response file.');
}else throw new Error('Use pending or complete <response.json>.');
