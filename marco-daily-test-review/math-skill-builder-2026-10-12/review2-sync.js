(function(root){
  'use strict';
  const APP_ID='marco-math-skill-builder-oct12-review2-v1',API='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress',E=root.MarcoReview2Engine;
  function create({getState,onRemote,onStatus,fetcher=root.fetch.bind(root),interval=4000}){
    let busy=false,stopped=false,timer,again=false,device;
    try{device=root.localStorage.getItem(APP_ID+':device');if(!device){device=root.crypto.randomUUID();root.localStorage.setItem(APP_ID+':device',device);}}catch{device=root.crypto.randomUUID();}
    const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),normalize=s=>E.merge(s,E.empty());
    function apply(remote){const next=E.merge(getState(),remote);if(!equal(normalize(getState()),next))onRemote(next);return next;}
    async function request(body){const controller=new AbortController(),timeout=root.setTimeout(()=>controller.abort(),10000);try{
      const r=await fetcher(API+'?appId='+APP_ID,{method:body?'POST':'GET',cache:'no-store',signal:controller.signal,headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});if(!r.ok)throw new Error('Sync unavailable');
      const d=await r.json();if(d.progress&&(!E.valid(d.progress.state)||!Number.isInteger(d.progress.version)))throw new Error('Invalid remote record');return d;
    }finally{root.clearTimeout(timeout);}}
    async function refresh(){if(stopped)return;if(busy){again=true;return;}busy=true;try{
      for(let i=0;i<3;i++){const d=await request(),record=d.progress,remote=record?.state||E.empty(),next=apply(remote);
        if(equal(next,normalize(remote))){onStatus('live','Live online sync · Review 2 answers and first-try scores saved across your devices.');return;}
        onStatus('saving','Saving online… Your answers are already saved on this device.');
        const saved=await request({appId:APP_ID,studentName:'Marco',deviceId:device,state:next,progressScore:Object.values(next.sessions).flat().reduce((sum,r)=>sum+Object.values(r.answers).reduce((a,e)=>a+e.attempts.length,0),0),baseVersion:record?.version??null,clientUpdatedAt:new Date().toISOString()});
        if(!saved.progress)throw new Error('Save unconfirmed');apply(saved.progress.state);if(saved.accepted&&equal(normalize(getState()),normalize(saved.progress.state))){onStatus('live','Live online sync · Review 2 answers and first-try scores saved across your devices.');return;}
      }onStatus('saving','Merging answers from another device…');
    }catch{onStatus('offline','Not synced · Saved on this device. Online sync will retry automatically.');}finally{busy=false;if(again&&!stopped){again=false;root.setTimeout(refresh,250);}}}
    const visible=()=>{if(root.document.visibilityState==='visible')void refresh();};
    return{start(){onStatus('connecting','Connecting to live online sync…');root.addEventListener('online',refresh);root.addEventListener('focus',refresh);root.document.addEventListener('visibilitychange',visible);timer=root.setInterval(refresh,interval);return refresh();},push:refresh,stop(){stopped=true;root.clearInterval(timer);root.removeEventListener('online',refresh);root.removeEventListener('focus',refresh);root.document.removeEventListener('visibilitychange',visible);}};
  }
  root.MarcoReview2Sync={APP_ID,API,create};
})(typeof window==='undefined'?globalThis:window);
