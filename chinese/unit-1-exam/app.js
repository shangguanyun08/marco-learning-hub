(() => {
  'use strict';
  const data=window.UNIT1_YELLOW, model=window.Unit1Model, $=id=>document.getElementById(id);
  const items=model.makeItems(data), byId=new Map(items.map(item=>[item.id,item]));
  const preview=['localhost','127.0.0.1'].includes(location.hostname)||new URLSearchParams(location.search).has('demo');
  const KEY='marco-chinese-unit1-yellow-2026'+(preview?':preview':''), VIEW=KEY+':view';
  let state={version:1,records:{}}, view={mode:'words',group:'all',speed:'0.65'}, queue=[],index=0;
  let phase='write',heard=false,hinted=false,sourceViewed=new Set(), sync=null, speech=null, speechRun=0, speechTimer;
  const fresh=()=>({version:1,records:{}});
  function valid(value){
    return value?.version===1&&value.records&&typeof value.records==='object'&&!Array.isArray(value.records)&&Object.entries(value.records).every(([id,list])=>byId.has(id)&&Array.isArray(list)&&list.every(a=>typeof a.id==='string'&&Number.isFinite(Date.parse(a.at))&&typeof a.correct==='boolean'&&typeof a.hinted==='boolean'));
  }
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(valid(saved))state=model.merge(fresh(),saved);const savedView=JSON.parse(localStorage.getItem(VIEW)||'null');if(savedView){if(['words','sentences'].includes(savedView.mode))view.mode=savedView.mode;if(savedView.group==='all'||data.groups.some(g=>g.id===savedView.group))view.group=savedView.group;if(['0.65','0.85','1'].includes(savedView.speed))view.speed=savedView.speed;}}catch{}
  const current=()=>byId.get(queue[index]);
  const scoped=()=>items.filter(item=>item.kind===view.mode&&(view.group==='all'||item.group===view.group));
  const itemStatus=id=>model.status(state.records[id]);
  const reviewIds=()=>scoped().filter(item=>state.records[item.id]?.length&&itemStatus(item.id)!=='mastered').map(item=>item.id);
  function save(push=true){
    try{localStorage.setItem(KEY,JSON.stringify(state));localStorage.setItem(VIEW,JSON.stringify(view));$('save-status').textContent='进度已保存；首次记录与后续重练分别保留。';}
    catch{$('save-status').textContent='这台设备暂时不能保存，请保持页面打开。';}
    if(push&&sync)sync.push(state);
  }
  function stop(){speechRun++;clearTimeout(speechTimer);window.speechSynthesis?.cancel();speech=null;}
  function voices(){
    const selected=$('voice').value, options=window.speechSynthesis?.getVoices?.()||[];
    $('voice').replaceChildren(new Option('自动选择普通话',''));
    for(const v of options.filter(v=>/^(zh|cmn)([-_]|$)/i.test(v.lang)&&!/HK|yue/i.test(v.lang)))$('voice').add(new Option(v.name+' · '+v.lang,v.voiceURI));
    if([...$('voice').options].some(o=>o.value===selected))$('voice').value=selected;
  }
  function speak(text){
    stop();const synth=window.speechSynthesis,token=speechRun;
    if(!synth||!window.SpeechSynthesisUtterance){$('audio-status').textContent='此浏览器不支持朗读，请用 Safari 或 Chrome 打开，或请家长读题。';return;}
    const utterance=new SpeechSynthesisUtterance(text),voice=synth.getVoices().find(v=>v.voiceURI===$('voice').value);speech=utterance;
    utterance.lang=voice?.lang||'zh-CN';if(voice)utterance.voice=voice;utterance.rate=Number(view.speed);utterance.volume=1;
    $('audio-status').textContent='正在启动朗读…';
    utterance.onstart=()=>{if(token!==speechRun)return;clearTimeout(speechTimer);$('audio-status').textContent='仔细听。听完后在纸上写；没听清可以重听。';};
    utterance.onend=()=>{if(token!==speechRun)return;clearTimeout(speechTimer);speech=null;$('audio-status').textContent='读完了，轮到你写了。';};
    utterance.onerror=event=>{if(token!==speechRun||['canceled','interrupted'].includes(event.error))return;clearTimeout(speechTimer);$('audio-status').textContent='朗读没有成功，请选择普通话声音，检查音量后重试。';};
    speechTimer=setTimeout(()=>{if(token===speechRun){stop();$('audio-status').textContent='若没有声音，请选择普通话声音，检查静音、音量和蓝牙输出，再点「试听」。';}},5000);
    try{if(synth.paused)synth.resume();synth.speak(utterance);}catch{$('audio-status').textContent='无法启动朗读，请换用 Safari 或 Chrome。';}
  }
  function reset(){stop();phase='write';heard=false;hinted=sourceViewed.has(current()?.id);$('audio-status').textContent='';$('feedback').textContent='';$('source').open=false;}
  function listen(text){
    const item=current();if(!item)return;heard=true;$('source').open=false;renderExercise();
    speak(text||(item.kind==='words'&&data.clues[item.text]?item.text+'。'+data.clues[item.text]+'。':item.text));
  }
  function showAnswer(asHint){hinted=hinted||asHint;phase='check';stop();$('audio-status').textContent='请对照纸上的字，再记录这次结果。';renderExercise();}
  function renderExercise(){
    const item=current();if(!item)return;
    const shown=phase!=='write';$('cover').hidden=shown;$('answer').hidden=!shown;
    // Keep every hidden answer out of the rendered practice DOM.
    $('answer').textContent=shown?item.text:'';$('answer').className='answer'+(item.kind==='sentences'?' sentence':'');
    $('prompt').textContent=heard?'现在，自己写一写':'准备好纸和笔了吗？';
    $('instruction').textContent=heard?'先想一想。不会时，再看提示。':'点「听题」，听完自己写。';
    $('listen').textContent=(heard?'↻ 再听一遍':'▶ 听题')+(item.kind==='sentences'?'（整段）':'');
    $('hint').disabled=!heard;$('check').disabled=!heard;
    $('write-actions').hidden=phase!=='write';$('check-actions').hidden=phase!=='check';$('retry-actions').hidden=phase!=='retry';
    $('previous').disabled=index===0;
  }
  function renderChunks(){
    const item=current(),root=$('chunks');root.replaceChildren();root.hidden=!item||item.kind!=='sentences';
    if(item?.kind==='sentences')item.chunks.forEach((text,i)=>{const button=document.createElement('button');button.textContent='听第'+(i+1)+'小段';button.onclick=()=>listen(text);root.append(button);});
  }
  function renderMap(){
    const root=$('question-map');root.replaceChildren();
    const labels={mastered:'独立写对',hinted:'提示后写对',retry:'需要再练',new:'尚未记录'};
    for(const [n,item] of scoped().entries()){
      const status=itemStatus(item.id),button=document.createElement('button');button.textContent=String(n+1);button.className=status;
      button.setAttribute('aria-label',item.label+' 第'+(n+1)+'题，'+labels[status]);button.setAttribute('aria-current',String(current()?.id===item.id));
      button.onclick=()=>{queue=scoped().map(x=>x.id);index=queue.indexOf(item.id);reset();render();};root.append(button);
    }
    const selected=scoped(),mastered=selected.filter(item=>itemStatus(item.id)==='mastered').length;
    $('totals').textContent='独立写对 '+mastered+' / '+selected.length+' · 需复习 '+reviewIds().length;
    $('review').disabled=!reviewIds().length;$('review-end').disabled=!reviewIds().length;
  }
  function render(){
    const item=current(),finished=!item;
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===view.mode)));
    $('group').value=view.group;$('speed').value=view.speed;
    $('exercise').hidden=finished;$('summary').hidden=!finished;
    $('scope-summary').textContent=scoped().length+(view.mode==='words'?' 个字词':' 段星号句子');
    $('progress').max=queue.length||1;$('progress').value=finished?queue.length:index;
    $('source-label').textContent=item?item.label+' · '+(item.kind==='words'?'第四题字词':'第五题★段落'):'本轮练习';
    $('position').textContent=finished?queue.length+' / '+queue.length:'第 '+(index+1)+' / '+queue.length+' 题';
    if(finished){$('answer').textContent='';$('chunks').replaceChildren();const mastered=queue.filter(id=>itemStatus(id)==='mastered').length;$('summary-text').textContent='本轮 '+queue.length+' 题，'+mastered+' 题已独立写对。可以重练需要复习的题，或换一个页码继续。';}
    else{renderExercise();renderChunks();}
    renderMap();
  }
  function buildQueue(kind='sequential'){
    const selected=scoped();queue=kind==='review'?reviewIds():selected.map(x=>x.id);
    if(kind==='shuffle')for(let i=queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]];}
    index=0;sourceViewed=new Set();reset();save(false);render();
    if(!queue.length)$('summary-text').textContent='这组暂时没有需要复习的题。可以先完成一轮听写。';
  }
  function result(correct){
    const item=current();if(!item)return;
    const id=window.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
    state=model.record(state,item.id,{id,at:new Date().toISOString(),correct,hinted});save();
    if(correct){index++;reset();render();}
    else{phase='retry';$('feedback').textContent='这次已记为需复习。看清楚后，藏起来再写一次。';renderExercise();renderMap();}
  }
  function sourceList(){
    const root=$('source-content');
    for(const g of data.groups){
      const section=document.createElement('section'),heading=document.createElement('h3'),words=document.createElement('div'),sentence=document.createElement('p');
      heading.textContent=g.label+' · '+g.words.length+' 个字词';words.className='word-list';
      for(const text of g.words){const span=document.createElement('span');span.textContent=text;words.append(span);}
      sentence.className='star-text';sentence.textContent='★ '+g.paragraph;section.append(heading,words,sentence);root.append(section);
    }
  }
  for(const g of data.groups)$('group').add(new Option(g.label,g.id));
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{view.mode=b.dataset.mode;buildQueue();});
  $('group').onchange=()=>{view.group=$('group').value;buildQueue();};
  $('speed').onchange=()=>{view.speed=$('speed').value;save(false);stop();};$('voice').onchange=stop;
  $('sound-test').onclick=()=>speak('你好，我们开始中文听写。');
  $('listen').onclick=()=>listen();$('hint').onclick=()=>showAnswer(true);$('check').onclick=()=>showAnswer(false);
  $('correct').onclick=()=>result(true);$('wrong').onclick=()=>result(false);
  $('hide-retry').onclick=()=>{reset();renderExercise();listen();};
  const next=()=>{index++;reset();render();};$('skip').onclick=next;$('next-retry').onclick=next;
  $('previous').onclick=()=>{if(index>0)index--;reset();render();};
  $('sequential').onclick=()=>buildQueue();$('shuffle').onclick=()=>buildQueue('shuffle');
  $('review').onclick=()=>buildQueue('review');$('review-end').onclick=()=>buildQueue('review');$('restart').onclick=()=>buildQueue();
  $('source').addEventListener('toggle',()=>{if($('source').open){stop();for(const id of queue)sourceViewed.add(id);hinted=true;$('feedback').textContent='本轮看过复习清单；重新开始一轮可检查独立掌握。';}});
  window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  if(window.speechSynthesis){voices();window.speechSynthesis.addEventListener('voiceschanged',voices);}
  sourceList();buildQueue();
  if(!preview&&window.MarcoOnlineSync){
    sync=window.MarcoOnlineSync.create({appId:'marco-chinese-unit1-yellow-2026',studentName:'Marco',validate:valid,score:value=>Object.values(value.records).filter(list=>model.status(list)==='mastered').length,
      onRemote:remote=>{const merged=model.merge(state,remote),needPush=JSON.stringify(merged)!==JSON.stringify(model.merge(fresh(),remote));state=merged;save(false);render();if(needPush)sync.push(state);}});
    sync.start(state);
  }
})();
