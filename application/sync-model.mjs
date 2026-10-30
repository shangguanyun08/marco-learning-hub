import {validAnnotation,validVersion} from './review-model.mjs?v=20261030-question2';
export const SOURCE='marco-purple-draft2-20261026';
export const DRAFT_APP='marco-application-draft-v1';
export const FEEDBACK_APP='marco-application-feedback-v1';
export const ENDPOINT='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress';
export const clone=value=>JSON.parse(JSON.stringify(value));
export function flatten(state){
 const result={};
 for(const [id,e] of Object.entries(state.edits||{}))for(const key of ['text','note','status'])result[`${id}.${key}`]=e[key]??'';
 for(let n=1;n<=6;n++)for(let i=1;i<=[6,7,5,7,4,5][n-1];i++){const id=`${n}.${i}`,r=state.reviews?.[id]||{};result[`review.${id}.choice`]=r.choice||'';result[`review.${id}.note`]=r.note||'';}
 result.submissionNote=state.submissionNote||'';
 for(const [id,a] of Object.entries(state.annotations||{}))result[`annotation.${id}`]=JSON.stringify(a);
 for(const [id,v] of Object.entries(state.versions||{}))result[`version.${id}`]=JSON.stringify(v);
 return result;
}
export function validField(key,field){
 if(!field||typeof field.value!=='string'||field.value.length>(key.startsWith('version.')?600000:key.startsWith('annotation.')?100000:60000)||!Number.isFinite(field.updatedAt)||field.updatedAt<0||typeof field.deviceId!=='string')return false;
 if(key==='submissionNote')return field.value.length<=12000;
 if(/^(annotation|version)\.[a-zA-Z0-9-]{1,100}$/.test(key)){try{const value=JSON.parse(field.value),[kind,id]=key.split('.');return kind==='annotation'?validAnnotation(value)&&(value===null||value.id===id):validVersion(value)&&value.id===id&&value.draft.source===SOURCE;}catch{return false;}}
 if(/^q[1-5]-p[1-9]\.(text|note|status)$/.test(key))return !key.endsWith('.status')||['review','editing','ready'].includes(field.value);
 if(/^review\.[1-6]\.[1-7]\.(choice|note)$/.test(key))return !key.endsWith('.choice')||['','agree','disagree'].includes(field.value);
 return false;
}
export function mergeFields(a={},b={}){
 const result={};
 for(const fields of [a,b])for(const [key,value] of Object.entries(fields)){if(!validField(key,value))continue;const old=result[key];if(!old||value.updatedAt>old.updatedAt||(value.updatedAt===old.updatedAt&&value.deviceId.localeCompare(old.deviceId)>0))result[key]=clone(value);}
 return Object.fromEntries(Object.entries(result).sort(([a],[b])=>a.localeCompare(b)));
}
export function changedFields(fields,observed,next,deviceId,time=Date.now()){
 const result=clone(fields);let changed=false;
 for(const [key,value] of Object.entries(next)){if(observed[key]===value)continue;const old=result[key];result[key]={value,updatedAt:Math.max(time,(old?.updatedAt||0)+1),deviceId};changed=true;}
 return {fields:result,changed};
}
export function applyFields(state,fields){
 const result=clone(state);
 for(const [key,field] of Object.entries(fields||{})){
  if(!validField(key,field))continue;
  if(key==='submissionNote'){result.submissionNote=field.value;continue;}
  if(key.startsWith('annotation.')){result.annotations||={};result.annotations[key.slice(11)]=JSON.parse(field.value);continue;}
  if(key.startsWith('version.')){result.versions||={};result.versions[key.slice(8)]=JSON.parse(field.value);continue;}
  const match=key.match(/^(q[1-5]-p[1-9])\.(text|note|status)$/);
  if(match&&result.edits[match[1]]){result.edits[match[1]][match[2]]=field.value;continue;}
  const review=key.match(/^review\.([1-6]\.[1-7])\.(choice|note)$/);
  if(review){result.reviews[review[1]]||={choice:'',note:''};result.reviews[review[1]][review[2]]=field.value;}
 }
 return result;
}
export function mergeFeedback(a={},b={}){
 const result={schema:1,source:SOURCE,submissions:{},responses:{}};
 for(const value of [a,b]){
  if(value.source&&value.source!==SOURCE)continue;
  for(const [id,s] of Object.entries(value.submissions||{}))if(s?.id===id&&typeof s.createdAt==='string'&&s.draft?.source===SOURCE)result.submissions[id]||=clone(s);
  for(const [id,r] of Object.entries(value.responses||{}))if(r?.submissionId===id&&typeof r.completedAt==='string'&&(!result.responses[id]||r.completedAt>result.responses[id].completedAt))result.responses[id]=clone(r);
 }
 return result;
}
export function revisionPatch(latestFields,submission,proposedEdits,deviceId,time=Date.now()){
 const fields=clone(latestFields),applied=[],held=[];
 for(const [id,text] of Object.entries(proposedEdits||{})){
  const baseline=submission.draft.edits?.[id]?.text;
  if(typeof text!=='string'||text.length>60000||typeof baseline!=='string')throw new Error('Invalid proposed paragraph.');
  const current=fields[`${id}.text`]?.value??baseline;
  if(current===text){applied.push(id);continue;}
  if(current!==baseline){held.push(id);continue;}
  const updatedAt=Math.max(time,(fields[`${id}.text`]?.updatedAt||0)+1);
  fields[`${id}.text`]={value:text,updatedAt,deviceId};
  fields[`${id}.status`]={value:'editing',updatedAt,deviceId};applied.push(id);
 }
 return {fields,applied,held};
}
