(function (root) {
  'use strict';
  const APP_ID='marco-isee-middle-sept25-v1';
  const API='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress';
  const BANK=root.MARCO_ISEE_PRACTICE;
  const IDS=BANK.map(s=>s.id);
  const clone=value=>JSON.parse(JSON.stringify(value));
  const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  const time=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
  function valid(state){
    return object(state)&&state.version===1&&object(state.sessions)&&Object.entries(state.sessions).every(([id,runs])=>
      IDS.includes(id)&&Array.isArray(runs)&&runs.every(run=>object(run)&&typeof run.id==='string'&&time(run.startedAt)&&
        (!run.deadlineAt||time(run.deadlineAt))&&(!run.timedOutAt||time(run.timedOutAt))&&
        (run.completedAt===null||time(run.completedAt))&&object(run.answers)&&Object.entries(run.answers).every(([source,entry])=>
          BANK.find(s=>s.id===id).questions.some(q=>String(q.source)===source)&&object(entry)&&Array.isArray(entry.attempts)&&entry.attempts.length<=2&&entry.attempts.every(a=>
            object(a)&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<BANK.find(s=>s.id===id).questions.find(q=>String(q.source)===source).choices.length&&typeof a.correct==='boolean'&&time(a.at)))));
  }
  const sameAttempt=(a,b)=>a.choice===b.choice&&a.at===b.at;
  const compatible=(a,b)=>Object.keys(a.answers).every(key=>{
    const x=a.answers[key].attempts,y=b.answers[key]?.attempts||[];
    return x.slice(0,Math.min(x.length,y.length)).every((attempt,i)=>sameAttempt(attempt,y[i]));
  });
  function signature(run){return JSON.stringify(Object.keys(run.answers).sort().map(key=>[key,run.answers[key].attempts.map(a=>[a.choice,a.at])]));}
  function hash(text){let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
  function merge(a,b){
    const result={version:1,sessions:{}};
    for(const id of IDS){
      const groups=new Map();
      for(const state of [a,b])for(const [index,raw] of (state?.sessions?.[id]||[]).entries()){
        const run=clone(raw);
        // Opening an untouched page is not a new practice run. Explicit repeat
        // runs (including older, already-saved repeats) remain part of history.
        if(!Object.values(run.answers).some(e=>e.attempts.length)&&!run.restart&&!run.deadlineAt&&!index)continue;
        const base=run.id.split('~')[0];
        if(!groups.has(base))groups.set(base,[]);
        groups.get(base).push(run);
      }
      const output=[];
      for(const [base,candidates] of groups){
        const versions=[];
        candidates.sort((x,y)=>signature(x).localeCompare(signature(y)));
        for(const run of candidates){
          const target=versions.find(v=>compatible(v,run));
          if(!target){versions.push(run);continue;}
          for(const [key,entry] of Object.entries(run.answers))if((target.answers[key]?.attempts.length||0)<entry.attempts.length)target.answers[key]=entry;
          target.startedAt=[target.startedAt,run.startedAt].sort()[0];
          target.completedAt=[target.completedAt,run.completedAt].filter(Boolean).sort()[0]||null;
          for(const field of ['deadlineAt','timedOutAt']){const value=[target[field],run[field]].filter(Boolean).sort()[0];if(value)target[field]=value;}
          if(run.restart)target.restart=true;
        }
        versions.sort((x,y)=>signature(x).localeCompare(signature(y)));
        versions.forEach((run,i)=>{
          run.id=i?base+'~'+hash(signature(run)):base;
          // Conflicting first tries stay in separate runs, never become retries.
          if(versions.length>1)run.deviceConflict=true;
          run.answers=Object.fromEntries(Object.entries(run.answers).sort(([x],[y])=>Number(x)-Number(y)));
          const entries=Object.values(run.answers);
          if(!run.completedAt&&BANK.find(s=>s.id===id).questions.every(q=>{const e=run.answers[q.source];return e&&(e.attempts.length===2||e.attempts.some(a=>a.choice===q.correct));}))run.completedAt=entries.flatMap(e=>e.attempts.map(a=>a.at)).sort().at(-1);
          output.push(run);
        });
      }
      output.sort((x,y)=>x.startedAt.localeCompare(y.startedAt)||x.id.localeCompare(y.id));
      if(output.length)result.sessions[id]=output;
    }
    return result;
  }
  function create({getState,onRemote,onStatus,fetcher=root.fetch.bind(root),interval=2000}){
    let inFlight=false,stopped=false,timer=null;
    const deviceKey=APP_ID+':online-device-v1';
    let device;
    try{device=root.localStorage.getItem(deviceKey);if(!device){device=root.crypto.randomUUID();root.localStorage.setItem(deviceKey,device);}}
    catch{device=root.crypto.randomUUID();}
    const normalized=state=>merge(state,{version:1,sessions:{}});
    const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
    function apply(remote){
      const current=getState(),next=merge(current,remote);
      if(!same(normalized(current),next))onRemote(next);
      return next;
    }
    async function request(body){
      const controller=new AbortController(),timeout=root.setTimeout(()=>controller.abort(),10000);
      try{
        const response=await fetcher(API+'?appId='+APP_ID,{method:body?'POST':'GET',cache:'no-store',signal:controller.signal,
          headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
        if(!response.ok)throw new Error('Online sync unavailable');
        const data=await response.json();
        if(data.progress&&(!valid(data.progress.state)||!Number.isInteger(data.progress.version)))throw new Error('Invalid online record');
        return data;
      }finally{root.clearTimeout(timeout);}
    }
    async function refresh(){
      if(inFlight||stopped)return;
      inFlight=true;
      try{
        for(let attempt=0;attempt<3;attempt++){
          const data=await request(),record=data.progress;
          const empty={version:1,sessions:{}},remote=record?.state||empty;
          const next=apply(remote);
          if(same(next,normalized(remote))){onStatus('live',record?'Synced · Saved online and on this device.':'Connected · Answers will sync across your devices.');return;}
          onStatus('saving','Saving online… Your answers are saved on this device.');
          const saved=await request({appId:APP_ID,studentName:'Marco',deviceId:device,state:next,
            progressScore:Object.values(next.sessions).flat().reduce((sum,run)=>sum+Object.values(run.answers).reduce((n,e)=>n+e.attempts.length,0),0),
            baseVersion:record?.version??null,clientUpdatedAt:new Date().toISOString()});
          if(!saved.progress)throw new Error('Online save was not confirmed');
          apply(saved.progress.state);
          if(saved.accepted&&same(normalized(getState()),normalized(saved.progress.state))){onStatus('live','Synced · Saved online and on this device.');return;}
        }
        onStatus('saving','Syncing changes from another device…');
      }catch{onStatus('offline','Not synced · Saved on this device. Sync will retry automatically.');}
      finally{inFlight=false;}
    }
    const visible=()=>{if(root.document.visibilityState==='visible')void refresh();};
    return {
      start(){onStatus('connecting','Connecting… Your saved answers will sync automatically.');root.addEventListener('online',refresh);root.document.addEventListener('visibilitychange',visible);timer=root.setInterval(refresh,interval);return refresh();},
      push:refresh,refresh,
      stop(){stopped=true;root.clearInterval(timer);root.removeEventListener('online',refresh);root.document.removeEventListener('visibilitychange',visible);}
    };
  }
  root.MarcoIseeSync={valid,merge,create};
})(typeof window==='undefined'?globalThis:window);
