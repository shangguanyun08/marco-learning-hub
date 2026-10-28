(function(root){
 'use strict';
 function forCourse(D){
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x),time=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
 const empty=()=>({version:1,sessions:{[D.session]:[{id:D.session,answers:{},notes:{}}]}}),run=s=>s.sessions[D.session][0],attempts=(s,id)=>run(s).answers[id]?.attempts||[];
 const firstPass=s=>D.ids.every(id=>attempts(s,id).length),note=(s,id)=>run(s).notes[id]?.text||'';
 function valid(s){if(!object(s)||s.version!==1||!object(s.sessions)||Object.keys(s.sessions).length!==1)return false;const r=s.sessions[D.session];return Array.isArray(r)&&r.length===1&&r[0].id===D.session&&object(r[0].answers)&&object(r[0].notes)&&Object.entries(r[0].answers).every(([id,e])=>D.questions[id]&&object(e)&&Array.isArray(e.attempts)&&e.attempts.length>0&&e.attempts.length<=8&&e.attempts.every(a=>object(a)&&typeof a.id==='string'&&a.id.length<200&&time(a.at)&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<4&&a.correct===(a.choice===D.questions[id].correct)))&&Object.entries(r[0].notes).every(([id,n])=>D.questions[id]&&object(n)&&typeof n.text==='string'&&n.text.length<=1500&&time(n.at));}
 function merge(a,b){const out=empty();for(const s of[a,b])if(valid(s)){for(const[id,e]of Object.entries(run(s).answers)){const seen=new Map();for(const event of [...attempts(out,id),...e.attempts]){const old=seen.get(event.id);if(!old||JSON.stringify(event)<JSON.stringify(old))seen.set(event.id,event);}run(out).answers[id]={attempts:[...seen.values()].sort((x,y)=>x.at.localeCompare(y.at)||x.id.localeCompare(y.id)).map(x=>({...x})).slice(0,8)};}for(const[id,n]of Object.entries(run(s).notes)){const old=run(out).notes[id];if(!old||n.at>old.at||n.at===old.at&&n.text>old.text)run(out).notes[id]={...n};}}for(const key of['answers','notes'])run(out)[key]=Object.fromEntries(Object.entries(run(out)[key]).sort(([a],[b])=>a.localeCompare(b)));return out;}
 function saveNote(s,id,text,at=new Date().toISOString()){if(!D.questions[id]||typeof text!=='string'||text.length>1500||!time(at)||attempts(s,id).length)return false;run(s).notes[id]={text,at};return true;}
 function submit(s,id,choice,at=new Date().toISOString(),eventId=root.crypto.randomUUID()){
  const q=D.questions[id],old=attempts(s,id);if(!q||!Number.isInteger(choice)||choice<0||choice>3||!time(at))return false;
  if(old.length&&(old[0].correct||old.length>=2||old.some(a=>a.choice===choice)))return false;
  (run(s).answers[id]||={attempts:[]}).attempts.push({id:eventId,choice,correct:choice===q.correct,at});return true;
 }
 function stats(s,skill){const ids=D.ids.filter(id=>!skill||D.questions[id].skill===skill),done=ids.filter(id=>attempts(s,id).length),first=done.filter(id=>attempts(s,id)[0].correct).length;return{total:ids.length,answered:done.length,first,wrong:done.length-first,complete:done.length===ids.length,corrected:done.filter(id=>!attempts(s,id)[0].correct&&attempts(s,id).slice(1).some(a=>a.correct)).length};}
 const reveal=(s,id)=>!!(attempts(s,id)[0]?.correct||attempts(s,id).length>=2);
 return {empty,run,valid,merge,attempts,firstPass,note,saveNote,submit,stats,reveal};
 }
 root.MarcoQR4Engine={...forCourse(root.MarcoQR4Data),forCourse};
})(typeof window==='undefined'?globalThis:window);
