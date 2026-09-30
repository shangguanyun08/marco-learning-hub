(() => {
'use strict';
const groups = window.WEEK6_GROUPS;
const speakerIcon = '<svg class="sound-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>';
const $ = id => document.getElementById(id);
const isHan = char => /[\u3400-\u9fff]/.test(char);
const synth=window.speechSynthesis;
let mode='reading', queue=[], index=0, revealed=false, run=0, utterance=null, playing=null, startTimer=null;
let voices=[];
function refreshVoices(){
 voices=synth?synth.getVoices():[];
 const select=$('voice');if(!select)return;
 const selected=select.value;select.replaceChildren(new Option('自动选择普通话',''));
 voices.filter(v=>/^(zh|cmn)([-_]|$)/i.test(v.lang)&&!/HK|yue/i.test(v.lang)).forEach(v=>select.add(new Option(v.name+' · '+v.lang,v.voiceURI)));
 if([...select.options].some(o=>o.value===selected))select.value=selected;
}
function stop(){
 run++;clearTimeout(startTimer);if(synth&&(utterance||synth.speaking||synth.pending))synth.cancel();utterance=null;
 if(playing)playing.classList.remove('speaking');playing=null;
 $('stop').disabled=true;
}
function speak(text,button){
 stop();$('status').textContent='';
 if(!synth||!window.SpeechSynthesisUtterance){$('status').textContent='此浏览器不支持朗读，请用 Safari 或 Chrome 打开。';return;}
 const id=run,u=new SpeechSynthesisUtterance(text.replace(/_+/g,'空格').replace(/p\.31/g,'第三十一页').replace(/（timing）|（courage）/g,''));
 utterance=u;u.lang='zh-CN';u.volume=1;u.rate=Number($('speed').value);
 refreshVoices();
 const voice=voices.find(v=>v.voiceURI===($('voice')&&$('voice').value));
 // Let the OS choose its default Mandarin voice unless the user selects one.
 if(voice){u.voice=voice;u.lang=voice.lang;}
 $('status').textContent='正在启动朗读…';
 u.onstart=()=>{if(id!==run)return;clearTimeout(startTimer);$('status').textContent='正在朗读；如果听不到，请调高音量、关闭静音，并检查蓝牙音频输出。';};
 if(button){playing=button;button.classList.add('speaking');}
 $('stop').disabled=false;
 u.onend=()=>{if(id!==run)return;clearTimeout(startTimer);$('status').textContent='朗读结束。再点声音按钮可重听。';if(playing)playing.classList.remove('speaking');playing=null;utterance=null;$('stop').disabled=true;};
 u.onerror=e=>{if(id!==run)return;stop();$('status').textContent=e.error==='language-unavailable'||e.error==='voice-unavailable'?'请在设备中添加普通话朗读语音后重试。':'未能朗读（'+e.error+'）。请用 Safari 打开后再试。';};
 startTimer=setTimeout(()=>{if(id!==run)return;stop();$('status').textContent='朗读没有启动。请用 Safari 打开此页，再点朗读按钮。';},5000);
 try{
  if(synth.paused)synth.resume();
  // Keep speak synchronous with the tap so iOS retains user activation.
  synth.speak(u);
 }catch(error){stop();$('status').textContent='无法启动朗读，请用 Safari 打开后重试。';}
}
function inMode(g){return mode==='dictation'?g.dictation:!g.dictation&&g.title!=='课文词汇与生字';}
function selectedGroups(){const available=groups.filter(inMode);return $('scope').value==='all'?available:[groups[Number($('scope').value)]];}
function populateScope(){ $('scope').replaceChildren(new Option(mode==='dictation'?'全部听写词语（26 个）':'全部阅读内容','all')); groups.forEach((g,i)=>{if(inMode(g))$('scope').add(new Option(g.title,String(i)));}); }
function buildQueue(){
 queue=[];
 for(const group of selectedGroups()){
  for(const text of group.rows) queue.push({char:text,context:text,group:group.title});
 }
 index=0;revealed=false;
}
function drawPractice(){
 const item=queue[index];
 $('group-name').textContent=item.group;
 $('counter').textContent=`第 ${index+1} / ${queue.length} 个词`;
 $('progress').max=queue.length;$('progress').value=index+1;
 // The hidden character is never inserted into text, labels or tooltips.
 $('character').textContent=revealed?item.char:'?';
 $('character-box').classList.toggle('masked',!revealed);
 $('character-box').setAttribute('aria-label',revealed?'词语已显示':'词语暂时隐藏');
 $('hint').textContent=revealed?'看清楚后，在纸上再写一次。':'先听读音，在纸上写这个词。';
 $('reveal').textContent=revealed?'藏起来，再写一次':'不会写，显示这个词';
 $('reveal').setAttribute('aria-expanded',String(revealed));
 $('previous').disabled=index===0;
 $('next').textContent=index===queue.length-1?'写好了，完成本轮 ✓':'写好了，下一个 →';
}
function characterLine(text){
 const line=document.createElement('div');line.className='characters';
 for(const part of text.split(/(_+)/)){
  if(/^_+$/.test(part)){const blank=document.createElement('span');blank.className='blank';blank.textContent='填空';line.append(blank);continue;}
  for(const char of part){
   if(isHan(char)){
    const button=document.createElement('button');button.type='button';button.className='char-button';button.setAttribute('aria-label','朗读汉字：'+char);
    const glyph=document.createElement('span');glyph.className='glyph';glyph.textContent=char;
    const icon=document.createElement('span');icon.className='speaker';icon.innerHTML=speakerIcon;icon.setAttribute('aria-hidden','true');
    button.append(glyph,icon);button.addEventListener('click',()=>speak(char,button));line.append(button);
   }else{
    const span=document.createElement('span');span.className=/[\s\da-z.]/i.test(char)?'inline-label':'punctuation';span.textContent=char;line.append(span);
   }
  }
 }
 return line;
}
function drawReading(){
 const root=$('reading-content');root.replaceChildren();
 for(const group of selectedGroups()){
  const section=document.createElement('section');section.className='reading-section';
  const heading=document.createElement('h2');heading.textContent=group.title;section.append(heading);
  [group.title,...(group.lines||group.rows)].forEach((text,i)=>{
   const row=document.createElement('div');row.className='sentence';
   const head=document.createElement('div');head.className='sentence-head';
   const label=document.createElement('span');label.textContent=i===0?'标题':`第 ${i} 行`;
   const read=document.createElement('button');read.innerHTML=speakerIcon+(i===0?' 读标题':' 读整行');read.addEventListener('click',()=>speak(text,read));
   head.append(label,read);row.append(head,characterLine(text));section.append(row);
  });
  root.append(section);
 }
}
function switchMode(next){
 stop();mode=next;revealed=false;$('status').textContent='';populateScope();history.replaceState(null,'','#'+mode);if(mode==='dictation')buildQueue();
 $('dictation').hidden=mode!=='dictation';$('reading').hidden=mode!=='reading';
 $('dictation-tab').setAttribute('aria-pressed',String(mode==='dictation'));
 $('reading-tab').setAttribute('aria-pressed',String(mode==='reading'));
 if(mode==='reading')drawReading();else{$('reading-content').replaceChildren();drawPractice();}
}
$('scope').addEventListener('change',()=>{stop();buildQueue();if(mode==='reading')drawReading();else drawPractice();$('status').textContent='';});
$('dictation-tab').addEventListener('click',()=>switchMode('dictation'));
$('reading-tab').addEventListener('click',()=>switchMode('reading'));
$('listen').addEventListener('click',()=>speak(queue[index].char,$('listen')));
$('context').addEventListener('click',()=>speak(queue[index].context,$('context')));
$('reveal').addEventListener('click',()=>{revealed=!revealed;drawPractice();});
$('previous').addEventListener('click',()=>{if(index===0)return;index--;revealed=false;drawPractice();speak(queue[index].char,$('listen'));});
$('next').addEventListener('click',()=>{
 if(index===queue.length-1){stop();index=0;revealed=false;drawPractice();$('status').textContent='本轮听写完成！可以选另一部分继续练习，或再听写一轮。';return;}
 index++;revealed=false;drawPractice();speak(queue[index].char,$('listen'));
});
$('stop').addEventListener('click',stop);
$('speed').addEventListener('change',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',stop);
if(synth){refreshVoices();synth.addEventListener('voiceschanged',refreshVoices);}
if($('test-sound'))$('test-sound').addEventListener('click',()=>speak('你好，我们开始中文练习。',$('test-sound')));
if($('voice'))$('voice').addEventListener('change',stop);
switchMode(location.hash==='#dictation'?'dictation':'reading');
})();


