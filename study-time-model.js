(function(root){
 'use strict';
 // These are observed page-activity windows, not reconstructed active minutes.
 function sessions(periods){
  const byApp=new Map(),out=[];
  for(const p of [...(periods||[])].sort((a,b)=>a.startedAt.localeCompare(b.startedAt))){
   const start=Date.parse(p.startedAt),end=Date.parse(p.endedAt);
   if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)continue;
   const key=p.appId+'|'+p.subject,previous=byApp.get(key);
   if(previous&&start-Date.parse(previous.endedAt)<=10*60000){
    previous.endedAt=new Date(Math.max(end,Date.parse(previous.endedAt))).toISOString();
    previous.capturedSeconds+=Number(p.seconds)||0;
   }else{
    const session={appId:p.appId,courseName:p.courseName,subject:p.subject,startedAt:p.startedAt,endedAt:p.endedAt,capturedSeconds:Number(p.seconds)||0};
    byApp.set(key,session);out.push(session);
   }
  }
  return out.map(s=>({...s,elapsedSeconds:(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000})).sort((a,b)=>a.startedAt.localeCompare(b.startedAt));
 }
 root.StudyTimeModel={sessions};
 if(typeof module!=='undefined')module.exports=root.StudyTimeModel;
})(typeof window==='undefined'?globalThis:window);
