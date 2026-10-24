(function(root){
  'use strict';
  const APP_ID='harry-reading-readtheory-2026-10-21-v1';
  const ENDPOINT='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const stable=x=>JSON.stringify(x,(_k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
  const stamp=x=>Date.parse(x)||0;
  const safe=k=>typeof k==='string'&&!['__proto__','constructor','prototype'].includes(k);
  function normalize(value){
    const out={version:1,articles:{}};
    if(value?.version!==1||!value.articles||typeof value.articles!=='object')return out;
    for(const [id,list] of Object.entries(value.articles)){
      if(!safe(id)||!Array.isArray(list))continue;
      out.articles[id]=list.filter(r=>r&&typeof r.id==='string'&&safe(r.id)).map(r=>{
        const copy=clone(r);copy.answers={};copy.drafts={};copy.position=r.position||0;copy.completedAt=r.completedAt||null;copy.startedAt=r.startedAt||null;
        for(const [q,aa] of Object.entries(r.answers||{}))if(safe(q)&&Array.isArray(aa))copy.answers[q]=aa.filter(a=>a&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<4).map(a=>({...a,marks:Array.isArray(a.marks)?a.marks:[]}));
        for(const [q,d] of Object.entries(r.drafts||{}))if(safe(q)&&d&&typeof d==='object')copy.drafts[q]={...d,marks:Array.isArray(d.marks)?d.marks:[]};
        return copy;
      });
    }
    return out;
  }
  function compatible(a,b){
    return Object.keys(a.answers||{}).every(q=>(a.answers[q]||[]).every((at,i)=>!b.answers?.[q]?.[i]||stable(at)===stable(b.answers[q][i])));
  }
  function mergeRun(a,b){
    const newer=stamp(a.updatedAt)>stamp(b.updatedAt)?a:b;
    const r={...a,...newer,answers:{...a.answers},drafts:{...a.drafts}};
    for(const [q,aa] of Object.entries(b.answers||{}))if(aa.length>(r.answers[q]?.length||0))r.answers[q]=aa;
    for(const [q,d] of Object.entries(b.drafts||{})){
      const previous=r.drafts[q];
      if(!previous||stamp(d.updatedAt)>stamp(previous.updatedAt)||(stamp(d.updatedAt)===stamp(previous.updatedAt)&&stable(d)>stable(previous)))r.drafts[q]=d;
    }
    r.position=Math.max(a.position||0,b.position||0);
    r.startedAt=[a.startedAt,b.startedAt].filter(Boolean).sort()[0]||null;
    r.completedAt=[a.completedAt,b.completedAt].filter(Boolean).sort().at(-1)||null;
    return r;
  }
  function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
  function merge(left,right){
    const a=normalize(left),b=normalize(right),out={version:1,articles:{}};
    for(const id of [...new Set([...Object.keys(a.articles),...Object.keys(b.articles)])].sort()){
      const groups=new Map();
      for(const r of [...a.articles[id]||[],...b.articles[id]||[]]){const rootId=r.syncRoot||r.id;if(!groups.has(rootId))groups.set(rootId,[]);groups.get(rootId).push(r);}
      out.articles[id]=[];
      for(const [rootId,records] of groups){
        // Conflicting checked attempts become separate histories, never a fabricated retry.
        const clusters=[];
        records.sort((x,y)=>stable(x.answers).localeCompare(stable(y.answers))||stable(x).localeCompare(stable(y)));
        for(const r of records){const i=clusters.findIndex(c=>compatible(c,r)&&compatible(r,c));if(i<0)clusters.push(r);else clusters[i]=mergeRun(clusters[i],r);}
        clusters.sort((x,y)=>stable(x.answers).localeCompare(stable(y.answers)));
        clusters.forEach((r,i)=>out.articles[id].push({...r,id:i?rootId+'~'+hash(stable(r.answers)):rootId,...(clusters.length>1||r.syncRoot?{syncRoot:rootId}:{})}));
      }
      out.articles[id].sort((x,y)=>stamp(x.startedAt)-stamp(y.startedAt)||x.id.localeCompare(y.id));
    }
    return out;
  }
  const score=s=>Object.values(s.articles||{}).flat().reduce((n,r)=>n+Object.values(r.answers||{}).reduce((m,aa)=>m+aa.filter(a=>a.checkedAt).length,0),0);
  function create({getState,applyState,onStatus,deviceId,fetcher=root.fetch?.bind(root),enabled=true}){
    let busy=null,timer=null,again=false;
    async function request(options){const response=await fetcher(ENDPOINT+'?appId='+encodeURIComponent(APP_ID),{cache:'no-store',signal:AbortSignal.timeout(15000),...options});if(!response.ok)throw Error('Sync HTTP '+response.status);return response.json();}
    function queue(){if(!enabled)return;clearTimeout(timer);timer=setTimeout(sync,450);}
    function sync(){
      if(!enabled)return Promise.resolve();
      if(busy){again=true;return busy;}
      clearTimeout(timer);onStatus('Syncing…');
      busy=(async()=>{
        try{
          let remote=(await request()).progress;
          for(let i=0;i<5;i++){
            const merged=merge(getState(),remote?.state);applyState(merged);
            if(stable(merged)===stable(normalize(remote?.state))){onStatus('Synced online');return;}
            const result=await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appId:APP_ID,studentName:'Harry',deviceId,state:merged,baseVersion:remote?.version??null,progressScore:score(merged),clientUpdatedAt:new Date().toISOString()})});
            remote=result.progress;
            if(result.accepted){applyState(merge(getState(),remote.state));onStatus('Synced online');return;}
          }
          throw Error('Other device busy');
        }catch{onStatus('Not synced · kept on this device');}
        finally{busy=null;if(again){again=false;queue();}}
      })();return busy;
    }
    return {queue,sync,stop(){clearTimeout(timer);}};
  }
  const api={APP_ID,merge,normalize,stable,score,compatible,create};
  if(typeof module!=='undefined')module.exports=api;else root.ReadingSync=api;
})(typeof window==='undefined'?{}:window);
