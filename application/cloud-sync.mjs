import {SOURCE,DRAFT_APP,FEEDBACK_APP,ENDPOINT,clone,flatten,mergeFields,changedFields,mergeFeedback} from './sync-model.mjs?v=20261101-v2sync2';

export async function requestRecord(appId,method='GET',payload,fetcher=fetch){
 const response=await fetcher(`${ENDPOINT}?appId=${encodeURIComponent(appId)}`,{method,cache:'no-store',headers:payload?{'content-type':'application/json'}:undefined,body:payload?JSON.stringify(payload):undefined,signal:AbortSignal.timeout(20000)});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'Online saving is unavailable.');return data;
}
export async function saveFeedbackEvent(submission,deviceId,fetcher=fetch){
 for(let tries=0;tries<5;tries++){
  const {progress}=await requestRecord(FEEDBACK_APP,'GET',undefined,fetcher),current=mergeFeedback(progress?.state);
  if(current.submissions[submission.id])return current;
  current.submissions[submission.id]=submission;
  const result=await requestRecord(FEEDBACK_APP,'POST',{appId:FEEDBACK_APP,studentName:'Family application',deviceId,state:current,progressScore:0,baseVersion:progress?.version??null,clientUpdatedAt:new Date().toISOString()},fetcher);
  if(result.accepted&&result.progress?.state?.submissions?.[submission.id])return mergeFeedback(result.progress.state);
 }
 throw new Error('Another device is saving. Please retry; your feedback is still on this device.');
}

export function createCloud(options){
 const enabled=options.enabled,storage=options.storage||localStorage,fetcher=options.fetcher||fetch;
 const metaKey='marco-application-cloud-fields-v1',pendingKey='marco-application-pending-submission-v1',deviceKey='marco-application-device-v1';
 let deviceId,fields={},observed=flatten(options.getState()),dirty=false,busy=null,timer=null,feedback=mergeFeedback(),feedbackReadAt=0;
 try{deviceId=storage.getItem(deviceKey);if(!deviceId){deviceId=crypto.randomUUID();storage.setItem(deviceKey,deviceId);}fields=mergeFields(JSON.parse(storage.getItem(metaKey)||'{}'));}catch{deviceId=crypto.randomUUID();}
 // Older browser-only work migrates at the lowest priority. A new browser has no fields to upload.
 const base=flatten(options.blankState());for(const [key,value] of Object.entries(observed))if(value!==base[key]&&!fields[key])fields[key]={value,updatedAt:1,deviceId};
 dirty=Object.keys(fields).length>0;
 function remember(){try{storage.setItem(metaKey,JSON.stringify(fields));}catch{}}
 function capture(state){const next=flatten(state),result=changedFields(fields,observed,next,deviceId);observed=next;if(result.changed){fields=result.fields;dirty=true;remember();if(enabled){options.onStatus('saving','Saving online…');clearTimeout(timer);timer=setTimeout(()=>flush().catch(()=>{}),700);}}}
 function apply(){if(!options.canApply())return;options.onFields(fields);observed=flatten(options.getState());}
 async function pullFeedback(){if(Date.now()-feedbackReadAt<12000)return;const result=await requestRecord(FEEDBACK_APP,'GET',undefined,fetcher);feedback=mergeFeedback(feedback,result.progress?.state);feedbackReadAt=Date.now();options.onFeedback(feedback);}
 async function drain(){
  if(!enabled){options.onStatus('local','Preview · saved on this device');return;}
  try{
   for(let tries=0;tries<6;tries++){
    const {progress}=await requestRecord(DRAFT_APP,'GET',undefined,fetcher);
    const remote=progress?.state;
    if(remote&&remote.source!==SOURCE)throw new Error('The online application version has changed.');
    fields=mergeFields(fields,remote?.fields);
    // A client that cannot read an online field must never delete it by saving
    // its narrower view of the record. Keep the server copy intact for recovery.
    const unreadable=Object.keys(remote?.fields||{}).filter(key=>!fields[key]);
    if(unreadable.length){console.warn('Application sync preserved unreadable online fields:',unreadable);throw new Error('Some saved notes could not be read. Refresh the application before saving.');}
    remember();apply();
    if(JSON.stringify(fields)===JSON.stringify(remote?.fields||{})){dirty=false;break;}
    const sending=clone(fields);
    if(JSON.stringify(sending).length>700000)throw new Error('Online version storage is full. Download a working copy to keep your latest work.');
    const result=await requestRecord(DRAFT_APP,'POST',{appId:DRAFT_APP,studentName:'Family application',deviceId,state:{schema:2,source:SOURCE,fields:sending},progressScore:0,baseVersion:progress?.version??null,clientUpdatedAt:new Date().toISOString()},fetcher);
    if(result.progress?.state?.source===SOURCE)fields=mergeFields(fields,result.progress.state.fields);
    remember();apply();
    dirty=!result.accepted||JSON.stringify(fields)!==JSON.stringify(result.progress?.state?.fields||{});
    if(!dirty)break;
   }
   if(dirty)throw new Error('Saving is still in progress. Please retry.');
   options.onStatus('live','Saved online');
   await pullFeedback();
  }catch(error){options.onStatus('offline','Saved on device · retry online');throw error;}
 }
 function flush(){if(busy)return busy;clearTimeout(timer);busy=drain().finally(()=>{busy=null;});return busy;}
 async function submit(comment){
  if(!enabled)throw new Error('This preview does not send feedback. Use the published Application page.');
  capture(options.getState());await flush();
  const snapshot=clone(options.getState()),draft={schema:1,source:SOURCE,comparisonVersion:snapshot.comparisonVersion||'v2',edits:snapshot.edits,reviews:snapshot.reviews,annotations:snapshot.annotations||{}};
  let submission;
  try{const cached=JSON.parse(storage.getItem(pendingKey)||'null');if(cached&&JSON.stringify(cached.draft)===JSON.stringify(draft)&&cached.comment===comment)submission=cached;}catch{}
  if(!submission){submission={id:crypto.randomUUID(),source:SOURCE,createdAt:new Date().toISOString(),comment,draft};storage.setItem(pendingKey,JSON.stringify(submission));}
  feedback=await saveFeedbackEvent(submission,deviceId,fetcher);feedbackReadAt=Date.now();storage.removeItem(pendingKey);options.onFeedback(feedback);return submission;
 }
 function schedule(){if(enabled&&document.visibilityState!=='hidden')flush().catch(()=>{});}
 if(enabled){setTimeout(schedule,0);setInterval(schedule,20000);window.addEventListener('focus',schedule);window.addEventListener('online',schedule);document.addEventListener('visibilitychange',schedule);document.addEventListener('focusout',()=>setTimeout(()=>{apply();},0));}
 else options.onStatus('local','Preview · saved on this device');
 return {capture,flush,submit,getFeedback:()=>feedback};
}
