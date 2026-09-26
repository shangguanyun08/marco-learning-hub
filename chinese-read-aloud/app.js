(() => {
  'use strict';
  // Coordinates use the original 2048 × 544 photo, preserving its exact layout.
  const row1 = [
    ['年',208,0,91,91],['月',337,14,74,83],['日',446,25,76,82],
    ['岁',546,30,85,91],['九岁',662,36,132,88],['十岁',818,47,140,86],
    ['星期',984,57,144,91],['星期六',1148,64,188,96],
    ['星期天',1354,77,187,85],['上课',1556,83,141,89],['上中文课',1704,95,239,86]
  ];
  const row2 = [
    ['学校',206,91,151,85],['老师',383,105,146,90],['学生',557,117,145,88],
    ['同学',727,131,146,81],['男同学',895,141,193,84],['女同学',1105,150,194,87],
    ['医生',1329,160,132,79],['看医生',1477,167,183,82],['诗人',1677,176,128,83],['士兵',1821,183,124,83]
  ];
  const phrases = [
    ['两千多年以前，',352,360,435,91],['中国的历史上，',803,380,412,89],
    ['曾经有两段特殊的时期，',1222,391,602,100],['一段',1831,411,143,86],
    ['叫做',185,439,146,83],['“春秋时期”，',342,445,414,89],
    ['一段叫做',769,465,259,77],['“战国时期”。',1031,465,393,79]
  ];
  const paragraph = '两千多年以前，中国的历史上，曾经有两段特殊的时期，一段叫做“春秋时期”，一段叫做“战国时期”。';
  const all = [...row1,...row2,...phrases];
  const $ = id => document.getElementById(id);
  const synth = window.speechSynthesis;
  let voices = [], token = 0, activeUtterance = null, last = null, busy = false;
  const buttons = all.map((item,index) => {
    const [text,x,y,w,h] = item;
    const button = document.createElement('button');
    button.className = 'hotspot';
    button.type = 'button';
    button.dataset.index = index;
    button.setAttribute('aria-label',`朗读：${text}`);
    button.title = `点读：${text}`;
    Object.assign(button.style,{left:`${x/2048*100}%`,top:`${y/544*100}%`,width:`${w/2048*100}%`,height:`${h/544*100}%`});
    button.addEventListener('click',() => start([{text,indices:[index]}]));
    $('hotspots').append(button);
    return button;
  });
  function refreshVoices() { voices = synth ? synth.getVoices() : []; }
  function mandarinVoice() {
    const preferred = [/^zh[-_]CN$/i,/^cmn[-_]CN$/i,/^zh[-_]SG$/i,/^zh[-_]TW$/i,/^cmn/i];
    for (const pattern of preferred) {
      const found = voices.find(voice => pattern.test(voice.lang));
      if (found) return found;
    }
    return voices.find(voice => /^zh$/i.test(voice.lang));
  }
  function highlight(indices=[]) { buttons.forEach((button,index) => button.classList.toggle('playing',indices.includes(index))); }
  function cancel() {
    token += 1;
    if (synth) synth.cancel();
    activeUtterance = null;
    busy = false;
    $('stop').disabled = true;
    highlight();
  }
  function start(items) {
    cancel();
    last = items;
    $('repeat').disabled = false;
    $('voice-help').hidden = true;
    if (!synth || !window.SpeechSynthesisUtterance) {
      $('status').textContent = '此浏览器暂不支持朗读';
      $('current-text').textContent = items.map(item => item.text).join('　');
      $('voice-help').textContent = '请用 iPad / iPhone 的 Safari 或电脑的 Chrome 打开本页。';
      $('voice-help').hidden = false;
      return;
    }
    refreshVoices();
    const run = token;
    busy = true;
    $('stop').disabled = false;
    speakNext(items,0,run);
  }
  function speakNext(items,index,run) {
    if (run !== token) return;
    if (index >= items.length) {
      busy = false;
      activeUtterance = null;
      $('stop').disabled = true;
      $('status').textContent = '读完了 · 可以再点一个';
      highlight();
      return;
    }
    const item = items[index];
    $('current-text').textContent = item.text;
    $('status').textContent = items.length > 1 ? `正在读 · ${index+1} / ${items.length}` : '正在朗读';
    highlight(item.indices);
    if (item.indices.length === 1 && items.length > 1) {
      const target=buttons[item.indices[0]], box=$('paper-scroll');
      const left=target.offsetLeft, right=left+target.offsetWidth;
      if (left<box.scrollLeft || right>box.scrollLeft+box.clientWidth) {
        box.scrollLeft=Math.max(0,left-(box.clientWidth-target.offsetWidth)/2);
      }
    }
    const utterance = new SpeechSynthesisUtterance(item.text);
    activeUtterance = utterance; // Keep an owning reference for mobile Safari.
    utterance.lang = 'zh-CN';
    utterance.rate = Number($('speed').value);
    const voice = mandarinVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => { if (run === token) speakNext(items,index+1,run); };
    utterance.onerror = event => {
      if (run !== token) return;
      cancel();
      $('status').textContent = '朗读没有开始，请点「再读一次」';
      $('voice-help').textContent = event.error === 'language-unavailable' || event.error === 'voice-unavailable'
        ? '请在设备的朗读语音设置中添加「中文（普通话）」语音，再重新打开此页。'
        : '请检查设备音量；也可用 Safari 或 Chrome 重新打开。';
      $('voice-help').hidden = false;
    };
    synth.speak(utterance);
  }
  $('read-row-1').addEventListener('click',() => start(row1.map((item,index)=>({text:item[0],indices:[index]}))));
  $('read-row-2').addEventListener('click',() => start(row2.map((item,index)=>({text:item[0],indices:[row1.length+index]}))));
  $('read-paragraph').addEventListener('click',() => start([{text:paragraph,indices:phrases.map((_,index)=>21+index)}]));
  $('repeat').addEventListener('click',() => { if (last) start(last); });
  $('stop').addEventListener('click',() => { cancel(); $('status').textContent='已停止 · 点一下继续读'; });
  $('speed').addEventListener('change',() => { if (busy && last) start(last); });
  $('zoom').addEventListener('change',() => {
    const value=$('zoom').value;
    $('paper').className=`paper ${value==='fit'?'fit':value==='larger'?'larger':''}`;
    $('scroll-hint').textContent=value==='fit'?'原纸整页 · 选「大字」可放大':'↔ 左右滑动看整行，排版与原纸相同';
  });
  $('zones').addEventListener('change',() => $('hotspots').classList.toggle('show-zones',$('zones').checked));
  document.addEventListener('visibilitychange',() => { if (document.hidden && busy) { cancel(); $('status').textContent='已暂停 · 点一下继续读'; } });
  window.addEventListener('pagehide',cancel);
  if (synth) {
    refreshVoices();
    if (synth.addEventListener) synth.addEventListener('voiceschanged',refreshVoices);
  }
})();
