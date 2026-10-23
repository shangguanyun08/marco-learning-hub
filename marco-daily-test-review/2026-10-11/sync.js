(function(root){
  'use strict';
  const options=root.MARCO_TEST_REVIEW_SYNC_OPTIONS||{};
  const APP_ID=options.appId||'marco-isee-middle-oct11-test3-v1';
  const savedMessage=options.savedMessage||'Live online sync · VR, QR, and MA progress saved online and on this device.';
  const connectedMessage=options.connectedMessage||'Live online sync connected · All three sessions sync across your devices.';
  const API='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress';
  const bank=root.MARCO_ISEE_PRACTICE,ids=bank.map(s=>s.id),clone=x=>JSON.parse(JSON.stringify(x));
  const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x),time=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
  function valid(state){
    return object(state)&&state.version===1&&object(state.sessions)&&Object.entries(state.sessions).every(([id,runs])=>{
      const session=bank.find(s=>s.id===id);if(!session||!Array.isArray(runs))return false;
      const question=source=>session.questions.find(q=>String(q.source)===String(source));
      return runs.every(run=>object(run)&&typeof run.id==='string'&&time(run.startedAt)&&(run.completedAt===null||time(run.completedAt))&&
        Array.isArray(run.questionSources)&&JSON.stringify(run.questionSources)===JSON.stringify(session.questions.map(q=>q.source))&&object(run.answers)&&object(run.pending)&&
        Object.entries(run.answers).every(([source,e])=>question(source)&&object(e)&&Array.isArray(e.attempts)&&e.attempts.length<=2&&e.attempts.every(a=>object(a)&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<question(source).choices.length&&a.correct===(a.choice===question(source).correct)&&time(a.at)))&&
        Object.entries(run.pending).every(([source,p])=>question(source)&&object(p)&&Number.isInteger(p.choice)&&p.choice>=0&&p.choice<question(source).choices.length&&time(p.at)));
    });
  }
  const sameAttempt=(a,b)=>a.choice===b.choice&&a.at===b.at;
  const compatible=(a,b)=>Object.keys(a.answers).every(key=>{const x=a.answers[key].attempts,y=b.answers[key]?.attempts||[];return x.slice(0,Math.min(x.length,y.length)).every((v,i)=>sameAttempt(v,y[i]));});
  const signature=r=>JSON.stringify(Object.keys(r.answers).sort().map(k=>[k,r.answers[k].attempts.map(a=>[a.choice,a.at])]));
  const hash=text=>{let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return(h>>>0).toString(16);};
  function merge(a,b){
    const out={version:1,sessions:{}};
    for(const id of ids){
      const groups=new Map();
      for(const state of [a,b])for(const raw of state?.sessions?.[id]||[]){const r=clone(raw),base=r.id.split('~')[0];if(!groups.has(base))groups.set(base,[]);groups.get(base).push(r);}
      const output=[];
      for(const [base,candidates]of groups){
        const versions=[];candidates.sort((x,y)=>signature(x).localeCompare(signature(y)));
        for(const r of candidates){
          const target=versions.find(v=>compatible(v,r));if(!target){versions.push(r);continue;}
          for(const [source,p]of Object.entries(r.pending)){const old=target.pending[source];if(!old||p.at>old.at||(p.at===old.at&&p.choice>old.choice))target.pending[source]=p;}
          for(const [source,e]of Object.entries(r.answers))if((target.answers[source]?.attempts.length||0)<e.attempts.length)target.answers[source]=e;
          target.startedAt=[target.startedAt,r.startedAt].sort()[0];target.completedAt=[target.completedAt,r.completedAt].filter(Boolean).sort()[0]||null;
        }
        versions.sort((x,y)=>signature(x).localeCompare(signature(y)));
        versions.forEach((r,i)=>{
          r.id=i?base+'~'+hash(signature(r)):base;if(versions.length>1)r.deviceConflict=true;
          r.answers=Object.fromEntries(Object.entries(r.answers).sort(([x],[y])=>Number(x)-Number(y)));
          for(const source of Object.keys(r.answers)){const entry=r.answers[source],q=bank.find(s=>s.id===id).questions.find(q=>String(q.source)===source);if(root.MarcoTest3Engine.done(q,entry)||r.pending[source]?.at<=entry.attempts.at(-1)?.at)delete r.pending[source];}
          r.pending=Object.fromEntries(Object.entries(r.pending).sort(([x],[y])=>Number(x)-Number(y)));
          if(!r.completedAt&&bank.find(s=>s.id===id).questions.every(q=>root.MarcoTest3Engine.done(q,r.answers[q.source])))r.completedAt=Object.values(r.answers).flatMap(e=>e.attempts.map(a=>a.at)).sort().at(-1);
          output.push(r);
        });
      }
      output.sort((x,y)=>x.startedAt.localeCompare(y.startedAt)||x.id.localeCompare(y.id));if(output.length)out.sessions[id]=output;
    }
    return out;
  }
  function create({getState,onRemote,onStatus,fetcher=root.fetch.bind(root),interval=2000}){
    let busy=false,stopped=false,timer,device;
    try{device=root.localStorage.getItem(APP_ID+':device');if(!device){device=root.crypto.randomUUID();root.localStorage.setItem(APP_ID+':device',device);}}catch{device=root.crypto.randomUUID();}
    const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),empty=()=>({version:1,sessions:{}}),normalize=s=>merge(s,empty());
    function apply(remote){const next=merge(getState(),remote);if(!equal(normalize(getState()),next))onRemote(next);return next;}
    async function request(body){
      const controller=new AbortController(),timeout=root.setTimeout(()=>controller.abort(),10000);
      try{const response=await fetcher(API+'?appId='+APP_ID,{method:body?'POST':'GET',cache:'no-store',signal:controller.signal,headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
        if(!response.ok)throw new Error('Sync unavailable');const data=await response.json();if(data.progress&&(!valid(data.progress.state)||!Number.isInteger(data.progress.version)))throw new Error('Invalid record');return data;
      }finally{root.clearTimeout(timeout);}
    }
    async function refresh(){
      if(busy||stopped)return;busy=true;
      try{for(let attempt=0;attempt<3;attempt++){
        const data=await request(),record=data.progress,remote=record?.state||empty(),next=apply(remote);
        if(equal(next,normalize(remote))){onStatus('live',record?savedMessage:connectedMessage);return;}
        onStatus('saving','Saving online… Answers are already saved on this device.');
        const saved=await request({appId:APP_ID,studentName:'Marco',deviceId:device,state:next,progressScore:Object.values(next.sessions).flat().reduce((n,r)=>n+Object.values(r.answers).reduce((sum,e)=>sum+e.attempts.length,0),0),baseVersion:record?.version??null,clientUpdatedAt:new Date().toISOString()});
        if(!saved.progress)throw new Error('Save unconfirmed');apply(saved.progress.state);
        if(saved.accepted&&equal(normalize(getState()),normalize(saved.progress.state))){onStatus('live',savedMessage);return;}
      }onStatus('saving','Merging changes from another device…');}catch{onStatus('offline','Not synced · Saved on this device. Online sync will retry automatically.');}finally{busy=false;}
    }
    const visible=()=>{if(root.document.visibilityState==='visible')void refresh();};
    return {start(){onStatus('connecting','Connecting to live online sync…');root.addEventListener('online',refresh);root.addEventListener('focus',refresh);root.document.addEventListener('visibilitychange',visible);timer=root.setInterval(refresh,interval);return refresh();},push:refresh,refresh,stop(){stopped=true;root.clearInterval(timer);root.removeEventListener('online',refresh);root.removeEventListener('focus',refresh);root.document.removeEventListener('visibilitychange',visible);}};
  }
  root.MarcoTest3Sync={APP_ID,valid,merge,create};
})(typeof window==='undefined'?globalThis:window);
