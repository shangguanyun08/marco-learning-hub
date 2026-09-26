(() => {
'use strict';
const groups = [
 {title:'一、阅读',rows:[
  '第一单元 第五周（课文《田忌赛马》（p.30））',
  '熟读课文《田忌赛马》本周所教部分（p.30），准备录音。',
  '阅读本周阅读材料，并完成相应的“阅读与理解”练习。'
 ]},
 {title:'《常用的汉字有多少》',rows:[
  '“汉字”就是平常所说的“中国字”。　对　错',
  '汉字看起来很多，而其实并没有人们想象的那么多。　对　错',
  '王小强已经学了（___）个常用字了。'
 ]},
 {title:'《献给亲爱的妈妈》',rows:[
  '这是一首小朋友写给妈妈的诗。　对　错',
  '“搂”和“楼”的偏旁不一样，声部却是一样的。　对　错',
  '不管什么时候，妈妈爱我（___）爱她自己。'
 ]},
 {title:'《小方的新发现》',rows:[
  '妈妈买了很多日历让小方挑一本。　对　错',
  '小方想挑一本星期六和星期天特别多的日历。　对　错'
 ]},
 {title:'《萝卜回来了（下）》',rows:[
  '小猴找到的是（___），山羊找到的是（___）。',
  '小白兔醒来睁开眼睛一看，（___）。'
 ]},
 {title:'本周谜底（选一个）',rows:['云　雪　雨']},
 {title:'三、认读',rows:['认读本周生字卡片（黄色），上课时请带来。']}
];
const speakerIcon = '<svg class="sound-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>';
const $ = id => document.getElementById(id);
const isHan = char => /[\u3400-\u9fff]/.test(char);
const synth=window.speechSynthesis;
let mode='dictation', queue=[], index=0, revealed=false, run=0, utterance=null, playing=null;
function stop(){
 run++;if(synth)synth.cancel();utterance=null;
 if(playing)playing.classList.remove('speaking');playing=null;
 $('stop').disabled=true;
}
function speak(text,button){
 stop();$('status').textContent='';
 if(!synth||!window.SpeechSynthesisUtterance){$('status').textContent='此浏览器不支持朗读，请用 Safari 或 Chrome 打开。';return;}
 const id=run,u=new SpeechSynthesisUtterance(text.replace(/_+/g,'空格').replace(/p\.30/g,'第三十页'));
 utterance=u;u.lang='zh-CN';u.rate=Number($('speed').value);
 const voices=synth.getVoices();
 const voice=voices.find(v=>/^zh[-_]CN$/i.test(v.lang))||voices.find(v=>/^cmn[-_]CN$/i.test(v.lang))||voices.find(v=>/^zh[-_](SG|TW)$/i.test(v.lang));
 if(voice)u.voice=voice;
 if(button){playing=button;button.classList.add('speaking');}
 $('stop').disabled=false;
 u.onend=()=>{if(id!==run)return;if(playing)playing.classList.remove('speaking');playing=null;utterance=null;$('stop').disabled=true;};
 u.onerror=e=>{if(id!==run)return;stop();$('status').textContent=e.error==='language-unavailable'||e.error==='voice-unavailable'?'请在设备中添加普通话朗读语音后重试。':'未能朗读，请检查音量并再点一次声音按钮。';};
 synth.speak(u);
}
function selectedGroups(){return $('scope').value==='all'?groups:[groups[Number($('scope').value)]];}
function buildQueue(){
 queue=[];
 for(const group of selectedGroups()){
  for(const text of [group.title,...group.rows]){
   for(const char of text)if(isHan(char))queue.push({char,context:text,group:group.title});
  }
 }
 index=0;revealed=false;
}
function drawPractice(){
 const item=queue[index];
 $('group-name').textContent=item.group;
 $('counter').textContent=`第 ${index+1} / ${queue.length} 个字`;
 $('progress').max=queue.length;$('progress').value=index+1;
 // The hidden character is never inserted into text, labels or tooltips.
 $('character').textContent=revealed?item.char:'?';
 $('character-box').classList.toggle('masked',!revealed);
 $('character-box').setAttribute('aria-label',revealed?'汉字已显示':'汉字暂时隐藏');
 $('hint').textContent=revealed?'看清楚后，在纸上再写一次。':'先听读音，在纸上写这个字。';
 $('reveal').textContent=revealed?'藏起来，再写一次':'不会写，显示这个字';
 $('reveal').setAttribute('aria-expanded',String(revealed));
 $('previous').disabled=index===0;
 $('next').textContent=index===queue.length-1?'写好了，完成本轮 ✓':'写好了，下一个 →';
}
function characterLine(text){
 const line=document.createElement('div');line.className='characters';
 for(const part of text.split(/(_+)/)){
  if(/^_+$/.test(part)){const span=document.createElement('span');span.className='blank';span.textContent='填空';line.append(span);continue;}
  for(const char of part){
   if(isHan(char)){
    const b=document.createElement('button');b.type='button';b.className='char-button';b.setAttribute('aria-label',`朗读汉字：${char}`);
    const glyph=document.createElement('span');glyph.className='glyph';glyph.textContent=char;
    const icon=document.createElement('span');icon.className='speaker';icon.innerHTML=speakerIcon;icon.setAttribute('aria-hidden','true');
    b.append(glyph,icon);b.addEventListener('click',()=>speak(char,b));line.append(b);
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
  [group.title,...group.rows].forEach((text,i)=>{
   const row=document.createElement('div');row.className='sentence';
   const head=document.createElement('div');head.className='sentence-head';
   const label=document.createElement('span');label.textContent=i===0?'标题':`第 ${i} 句`;
   const read=document.createElement('button');read.innerHTML=speakerIcon+(i===0?' 读标题':' 读整句');read.addEventListener('click',()=>speak(text,read));
   head.append(label,read);row.append(head,characterLine(text));section.append(row);
  });
  root.append(section);
 }
}
function switchMode(next){
 stop();mode=next;revealed=false;$('status').textContent='';
 $('dictation').hidden=mode!=='dictation';$('reading').hidden=mode!=='reading';
 $('dictation-tab').setAttribute('aria-pressed',String(mode==='dictation'));
 $('reading-tab').setAttribute('aria-pressed',String(mode==='reading'));
 if(mode==='reading')drawReading();else{$('reading-content').replaceChildren();drawPractice();}
}
const allOption=document.createElement('option');allOption.value='all';allOption.textContent='整页文字（按顺序）';$('scope').append(allOption);
groups.forEach((group,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=group.title;$('scope').append(option);});
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
if(synth)synth.getVoices();
buildQueue();drawPractice();
})();
