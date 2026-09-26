(() => {
  'use strict';
  const row1 = ['年','月','日','岁','九岁','十岁','星期','星期六','星期天','上课','上中文课'];
  const row2 = ['学校','老师','学生','同学','男同学','女同学','医生','看医生','诗人','士兵'];
  const phrases = ['两千多年以前，','中国的历史上，','曾经有两段特殊的时期，','一段叫做“春秋时期”，','一段叫做“战国时期”。'];
  const $ = id => document.getElementById(id);
  const synth = window.speechSynthesis;
  const cells = [];
  let token = 0, utterance = null, timer = null;
  const examples = {年:'新年',月:'月亮',日:'日期',岁:'岁数',九:'九岁',十:'十岁',星:'星期',期:'星期',六:'星期六',天:'天空',上:'上课',课:'上课',中:'中国',文:'中文',学:'学校',校:'学校',老:'老师',师:'老师',生:'学生',同:'同学',男:'男生',女:'女生',医:'医生',看:'看医生',诗:'诗人',人:'诗人',士:'士兵',兵:'士兵',两:'两个',千:'一千',多:'多少',以:'以前',前:'以前',国:'中国',的:'我的',历:'历史',史:'历史',曾:'曾经',经:'曾经',有:'有无',段:'一段',特:'特殊',殊:'特殊',时:'时间',一:'一个',叫:'叫做',做:'叫做',春:'春天',秋:'秋天',战:'战国'};
  function cancel() {
    token++; clearTimeout(timer);
    if (synth) synth.cancel();
    utterance = null; $('stop').disabled = true;
    cells.forEach(c => c.node.classList.remove('playing'));
  }
  function speak(text, node) {
    cancel();
    const run = token;
    if (!synth || !window.SpeechSynthesisUtterance) { $('status').textContent = '此浏览器不支持朗读，请用 Safari 或 Chrome 打开，或请家长读题。'; return; }
    const voices = synth.getVoices();
    const voice = voices.find(v=>/^zh[-_](CN|SG|Hans)/i.test(v.lang)) || voices.find(v=>/^cmn/i.test(v.lang)) || voices.find(v=>/^zh([-_]TW)?$/i.test(v.lang));
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang || 'zh-CN';
    if (voice) utterance.voice = voice;
    utterance.rate = Number($('speed').value);
    utterance.volume = 1;
    $('stop').disabled = false;
    node?.classList.add('playing');
    $('status').textContent = '仔细听，然后在纸上写。不会写时，再点下面的“显示字”。';
    utterance.onstart = () => { if (run===token) clearTimeout(timer); };
    utterance.onend = () => { if (run!==token) return; clearTimeout(timer); $('stop').disabled=true; $('status').textContent='轮到你写了。没听清，可以再点一次喇叭。'; };
    utterance.onerror = e => { if(run!==token || ['canceled','interrupted'].includes(e.error)) return; cancel(); $('status').textContent='没有读出声音，请再点喇叭，并检查音量和设备的普通话语音。'; };
    synth.resume(); synth.speak(utterance);
    timer=setTimeout(()=>{if(run===token) $('status').textContent='没听到声音？请检查音量，再点一次喇叭。';},5000);
  }
  function hide(cell) {
    cell.glyph.textContent='?'; cell.glyph.classList.add('hidden');
    cell.glyph.setAttribute('aria-label','字已隐藏');
    cell.node.classList.remove('revealed');
    cell.reveal.textContent='显示字'; cell.reveal.setAttribute('aria-expanded','false');
  }
  function addGroup(parent,text,index,sentence=false) {
    const group=document.createElement('article'); group.className=`group${sentence?' phrase':''}`;
    const heading=document.createElement('div'); heading.className='group-heading';
    const label=document.createElement('span'); label.textContent=`第 ${index+1} ${sentence?'小段':'组'}`;
    const whole=document.createElement('button'); whole.type='button'; whole.textContent=sentence?'🔊 听这一小段':'🔊 听整个词';
    whole.addEventListener('click',()=>speak(text)); heading.append(label,whole);
    const characters=document.createElement('div'); characters.className='characters';
    let pos=0;
    Array.from(text).forEach(char=>{
      if(!/\p{Script=Han}/u.test(char)) { const punctuation=document.createElement('span'); punctuation.className='punctuation'; punctuation.textContent=char; characters.append(punctuation); return; }
      pos++;
      const node=document.createElement('div'); node.className='character';
      const speaker=document.createElement('button'); speaker.type='button'; speaker.className='speaker'; speaker.textContent='🔊'; speaker.setAttribute('aria-label',`听第 ${pos} 个字`);
      const glyph=document.createElement('div'); glyph.className='glyph hidden';
      const reveal=document.createElement('button'); reveal.type='button'; reveal.className='reveal';
      const cell={node,glyph,reveal,char}; cells.push(cell);hide(cell);
      speaker.addEventListener('click',()=>speak(examples[char]?`${examples[char]}的${char}。${char}。`:char,node));
      reveal.addEventListener('click',()=>{
        if(node.classList.contains('revealed')) { hide(cell); return; }
        glyph.textContent=char; glyph.classList.remove('hidden'); glyph.removeAttribute('aria-label');
        node.classList.add('revealed'); reveal.textContent='藏起来'; reveal.setAttribute('aria-expanded','true');
      });
      node.append(speaker,glyph,reveal);characters.append(node);
    });
    group.append(heading,characters);$(parent).append(group);
  }
  row1.forEach((s,i)=>addGroup('words1',s,i));row2.forEach((s,i)=>addGroup('words2',s,i));phrases.forEach((s,i)=>addGroup('phrases',s,i,true));
  $('hide-all').addEventListener('click',()=>{cancel();cells.forEach(hide);$('status').textContent='字都藏好了。点喇叭听音，再自己写。';});
  $('paragraph').addEventListener('click',()=>speak(phrases.join('')));
  $('stop').addEventListener('click',()=>{cancel();$('status').textContent='已停止。点喇叭可以再听。';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});window.addEventListener('pagehide',cancel);
  if(synth)synth.getVoices();
})();
