(function(){
 'use strict';
 const S=window.MarcoTest3Sync,E=window.MarcoTest3Engine,session=window.MARCO_ISEE_PRACTICE[0],KEY=S.APP_ID;
 let state={version:1,sessions:{}},message='Connecting to live online sync…';
 try{const local=JSON.parse(localStorage.getItem(KEY)||'null');if(S.valid(local))state=S.merge(state,local);}catch{}
 function paint(){const run=state.sessions[session.id]?.at(-1),stats=E.stats(session,run);document.getElementById('oct22-test').classList.toggle('is-complete',!!run?.completedAt);document.getElementById('oct22-status').textContent='Review ready'+(run?.completedAt?` · Optional redo completed: ${stats.first}/13 first try`:run?` · Optional redo: ${stats.finished}/13 finished`:'')+' · '+message;}
 function remote(value){state=S.merge(state,value);try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}paint();}
 paint();const preview=['localhost','127.0.0.1'].includes(location.hostname)||location.protocol==='file:'||new URLSearchParams(location.search).has('demo');
 if(preview){message='Local preview · online records untouched';paint();return;}
 const sync=S.create({getState:()=>state,onRemote:remote,onStatus(_kind,text){message=text;paint();}});void sync.start();
 window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue)try{const value=JSON.parse(e.newValue);if(S.valid(value)){remote(value);void sync.push();}}catch{}});
})();
