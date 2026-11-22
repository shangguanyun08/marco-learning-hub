(function (root) {
  'use strict';
  const courses = {
    1: {appId:'marco-ma-nov08-test5-v1',session:'mixed-28-ma5-qr5-v1',reportAfter:26,keys:{sd1:2,f1:0,i1:3,t1:1,p1:2,s1:1,g1:0,t2:0,g2:1,s2:3,sd2:0,i2:1,p2:0,f2:2,i3:0,sd3:3,p3:3,g3:2,f3:1,s3:0,t3:3,p4:1,t4:2,f4:3,s4:2,g4:3,sd4:1,i4:2}},
    2: {appId:'marco-ma-nov08-test5-session2-v1',session:'mixed-16-ma5-qr5-session2-v1',reportAfter:16,keys:{'c2-1':0,'p2-1':3,'s2-1':2,'g2-1':2,'p2-2':1,'g2-2':3,'c2-2':2,'s2-2':1,'s2-3':3,'c2-3':3,'g2-3':1,'p2-3':0,'g2-4':0,'s2-4':0,'p2-4':2,'c2-4':1}},
    3: {appId:'marco-ma-nov08-test5-session3-v1',session:'mixed-16-ma5-qr5-session3-v1',reportAfter:16,keys:{'c3-1':1,'s3-1':3,'g3-1':2,'p3-1':0,'g3-2':1,'p3-2':2,'c3-2':3,'s3-2':2,'p3-3':3,'g3-3':0,'s3-3':1,'c3-3':0,'s3-4':0,'c3-4':2,'p3-4':1,'g3-4':3}},
  };
  const API='https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/progress';
  function answers(course,state){
    const runs=state?.version===1&&state.sessions?.[course.session];
    return Array.isArray(runs)&&runs.length===1&&runs[0]?.id===course.session&&runs[0]?.answers&&typeof runs[0].answers==='object'?runs[0].answers:null;
  }
  function summarize(course,states){
    const total=Object.keys(course.keys).length;let answered=0,first=0,corrected=0;
    for(const[id,key]of Object.entries(course.keys)){
      const events=new Map();
      for(const state of states){const attempts=answers(course,state)?.[id]?.attempts;if(!Array.isArray(attempts))continue;
        for(const event of attempts){if(!event||typeof event.id!=='string'||!event.id||typeof event.at!=='string'||!Number.isFinite(Date.parse(event.at))||!Number.isInteger(event.choice)||event.choice<0||event.choice>3)continue;
          const old=events.get(event.id);if(!old||JSON.stringify(event)<JSON.stringify(old))events.set(event.id,event);
        }
      }
      const sorted=[...events.values()].sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id));
      if(!sorted.length)continue;answered++;if(sorted[0].choice===key)first++;else if(sorted.slice(1).some(a=>a.choice===key))corrected++;
    }
    return {total,answered,first,corrected,complete:answered===total,ready:answered>=course.reportAfter};
  }
  function statusText(s){
    if(s.complete)return `✓ First pass finished · ${s.first}/${s.total} correct first try`;
    if(s.ready)return `✓ Finished for now · ${s.first}/${s.answered} first try · ${s.total-s.answered} unanswered`;
    if(s.answered)return `${s.answered}/${s.total} answered · ${s.first}/${s.answered} correct first try`;
    return `Not started · 0/${s.total} answered`;
  }
  function paintCard(card, stats, message, available = true) {
    let text = card.querySelector('.practice-status, .session-score');
    if (!text) {
      text = root.document.createElement('small');
      text.className = 'session-score';
      text.setAttribute('aria-live', 'polite');
      card.append(text);
    }
    if (text.textContent !== message) text.textContent = message;
    card.classList.toggle('is-complete', available && stats.ready);
    card.classList.toggle('is-in-progress', available && stats.answered > 0 && !stats.ready);
  }
  function mount({courses: roster = courses, formatStatus = statusText} = {}){
    const cards=[...root.document.querySelectorAll('.view-tabs [data-session-card]')].filter(card=>card.id!=='practice-tab'&&Object.hasOwn(roster,card.dataset.sessionCard));
    if (!cards.length) return;
    const params=new URLSearchParams(root.location.search),preview=params.has('demo')||['localhost','127.0.0.1'].includes(root.location.hostname)||root.location.protocol==='file:',suffix=params.has('demo')?':demo':preview?':preview':'';
    const cached=new Map(),known=new Set(),failed=new Set();let busy=false,stopped=false,timer;
    function local(course){try{return JSON.parse(root.localStorage.getItem(course.appId+suffix)||'null');}catch{return null;}}
    function paint(card){
      const n=card.dataset.sessionCard,course=roster[n],device=local(course),s=summarize(course,[device,cached.get(n)]);
      const available=preview||known.has(n)||!!answers(course,device);
      const message=available?formatStatus(s):failed.has(n)?'Score unavailable · Reconnect to sync':'Loading saved score…';
      paintCard(card, s, message, available);
    }
    async function refresh(){
      if(stopped||busy)return;cards.forEach(paint);if(preview||root.document.visibilityState==='hidden')return;
      busy=true;
      try{await Promise.all(cards.map(async card=>{
        const n=card.dataset.sessionCard,course=roster[n],controller=new root.AbortController(),timeout=root.setTimeout(()=>controller.abort(),10000);
        try{
          const response=await root.fetch(API+'?appId='+encodeURIComponent(course.appId),{method:'GET',cache:'no-store',signal:controller.signal});
          if(!response.ok)throw Error('Score unavailable');const body=await response.json(),state=body.progress?.state;
          if(body.progress&&!answers(course,state))throw Error('Invalid score record');
          if(state)cached.set(n,state);known.add(n);failed.delete(n);paint(card);
        }catch{failed.add(n);paint(card);}
        finally{root.clearTimeout(timeout);}
      }));}finally{busy=false;}
    }
    const visible=()=>{if(root.document.visibilityState==='visible')void refresh();};
    cards.forEach(paint);root.addEventListener('focus',refresh);root.addEventListener('online',refresh);root.addEventListener('pageshow',refresh);root.addEventListener('storage',refresh);root.document.addEventListener('visibilitychange',visible);
    timer=root.setInterval(refresh,4000);
    return {ready:refresh(),refresh,stop(){stopped=true;root.clearInterval(timer);root.removeEventListener('focus',refresh);root.removeEventListener('online',refresh);root.removeEventListener('pageshow',refresh);root.removeEventListener('storage',refresh);root.document.removeEventListener('visibilitychange',visible);}};
  }
  root.MarcoMathSessionCards={courses,summarize,statusText,paintCard,mount};
  if(root.document&&root.fetch)root.MarcoMathSessionCards.controller=mount();
})(typeof window==='undefined'?globalThis:window);
