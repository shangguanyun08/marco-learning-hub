// This course has an independent record. Merge before every version-checked write.
(() => {
  'use strict';
  const API = 'https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress';
  const clone = value => JSON.parse(JSON.stringify(value));
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  window.MarcoOnlineSync = {create(options) {
    const merge=options.merge || ((left,right)=>window.VocabularyQuiz.merge(left,right));
    let desired, running=false, timer, stopped=false;
    const deviceKey=options.appId+':device-v1';
    let device;
    try {device=localStorage.getItem(deviceKey);if(!device){device=crypto.randomUUID();localStorage.setItem(deviceKey,device);}}
    catch {device=crypto.randomUUID();}
    function status(text) {
      const badge=document.querySelector('[data-online-sync="'+options.appId+'"]');
      if(badge) badge.textContent=text;
    }
    async function request(method,body) {
      const response=await fetch(API+'?appId='+encodeURIComponent(options.appId),{
        method,cache:'no-store',headers:body?{'content-type':'application/json'}:undefined,
        body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)
      });
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'Sync unavailable');
      return data;
    }
    function absorb(record) {
      if(!record)return;
      if(!options.validate(record.state))throw Error('Unrecognized saved progress');
      desired=merge(desired,record.state);
      options.onRemote(clone(desired));
    }
    async function tick() {
      if(running||stopped||!desired)return;
      running=true;
      try {
        const {progress:remote}=await request('GET');
        absorb(remote);
        if(!remote||!same(desired,remote.state)) {
          status('Saving online…');
          const snapshot=clone(desired);
          const result=await request('POST',{
            appId:options.appId,studentName:'Marco',deviceId:device,state:snapshot,
            progressScore:options.score(snapshot),baseVersion:remote?.version??null,
            clientUpdatedAt:new Date().toISOString()
          });
          if(!result.progress)throw Error('Missing saved progress');
          absorb(result.progress);
          status(result.accepted&&same(desired,result.progress.state)?'Live · saved online':'Syncing latest answers…');
        }else status('Live · saved online');
      }catch {status('Offline · online sync will retry. Keep this device’s saved answers.');}
      finally {running=false;}
    }
    window.addEventListener('online',()=>void tick());
    return {
      start(state){desired=merge(desired,state);timer=setInterval(tick,2500);return tick();},
      push(state){desired=merge(desired,state);void tick();},
      refresh:tick,
      stop(){stopped=true;clearInterval(timer);}
    };
  }};
})();
