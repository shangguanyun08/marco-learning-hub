(() => {
  'use strict';
  const rows = [
    ['年', '月', '日', '岁', '九岁', '十岁', '星期', '星期六', '星期天', '上课', '上中文课'],
    ['学校', '老师', '学生', '同学', '男同学', '女同学', '医生', '看医生', '诗人', '士兵'],
  ];
  const chunks = ['两千多年以前，', '中国的历史上，', '曾经有两段特殊的时期，', '一段叫做“春秋时期”，', '一段叫做“战国时期”。'];
  const lessons = {
    words: rows.flatMap((row, r) => row.map(text => ({ text, group: r ? '第二行字词' : '第一行字词' }))),
    sentences: chunks.map(text => ({ text, group: '句子 · 分小段听写' })),
  };
  const clues = { 年: '新年的年', 月: '月亮的月', 日: '日期的日', 岁: '岁数的岁' };
  const KEY = 'chinese-dictation-sept26-v1';
  const $ = id => document.getElementById(id);
  function fresh(mode) { return { queue: lessons[mode].map((_, i) => i), index: 0, states: {}, review: false }; }
  const state = { version: 1, mode: 'words', speed: '0.7', large: false, words: fresh('words'), sentences: fresh('sentences') };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved?.version === 1) {
      if (saved.mode in lessons) state.mode = saved.mode;
      state.speed = saved.speed === '0.9' ? '0.9' : '0.7';
      state.large = saved.large === true;
      for (const mode of Object.keys(lessons)) {
        const s = saved[mode];
        if (s && Array.isArray(s.queue) && s.queue.length && new Set(s.queue).size === s.queue.length && s.queue.every(i => Number.isInteger(i) && lessons[mode][i]) && Number.isInteger(s.index) && s.index >= 0 && s.index <= s.queue.length && s.states && typeof s.states === 'object') {
          state[mode] = { queue: s.queue, index: s.index, review: s.review === true, states: {} };
          for (const [id, result] of Object.entries(s.states)) if (lessons[mode][id] && result && typeof result === 'object') state[mode].states[id] = { hinted: result.hinted === true, wrong: result.wrong === true, correct: result.correct === true };
        }
      }
    }
  } catch { /* An unavailable or outdated save must not prevent practice. */ }
  let phase = 'write', heard = false, speechToken = 0, utterance = null, speechTimer = null;
  const synth = window.speechSynthesis;
  const session = () => state[state.mode];
  const itemId = () => session().queue[session().index];
  const item = () => lessons[state.mode][itemId()];
  const status = id => session().states[id];
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch { $('save-note').textContent = '浏览器暂时无法保存进度，请保持页面打开。'; }
  }
  function stopAudio() {
    speechToken++;
    clearTimeout(speechTimer);
    if (synth) synth.cancel();
    utterance = null;
  }
  function say(text, wholePassage = false) {
    stopAudio();
    const token = speechToken;
    $('audio-status').textContent = '';
    if (!synth || !window.SpeechSynthesisUtterance) {
      $('audio-status').textContent = '这个浏览器暂不支持朗读。请换用 Safari 或 Chrome，或请家长读题。';
      return;
    }
    const voices = synth.getVoices();
    const voice = voices.find(v => /^zh[-_](CN|SG|Hans)/i.test(v.lang)) || voices.find(v => /^cmn/i.test(v.lang)) || voices.find(v => /^zh([-_]TW)?$/i.test(v.lang));
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang || 'zh-CN';
    if (voice) utterance.voice = voice;
    utterance.rate = Number(state.speed);
    utterance.pitch = 1;
    utterance.volume = 1;
    let started = false;
    utterance.onstart = () => {
      if (token !== speechToken) return;
      started = true;
      clearTimeout(speechTimer);
      $('audio-status').textContent = wholePassage ? '正在读完整句子……' : '仔细听，听完后在纸上写。';
    };
    utterance.onend = () => {
      if (token !== speechToken) return;
      clearTimeout(speechTimer);
      $('audio-status').textContent = wholePassage ? '完整句子读完了。' : '轮到你写了。没听清可以再听一遍。';
    };
    utterance.onerror = event => {
      if (token !== speechToken || ['canceled', 'interrupted'].includes(event.error)) return;
      clearTimeout(speechTimer);
      $('audio-status').textContent = '暂时没有读出声音，请再点“听题”，并检查音量和中文语音设置。';
    };
    synth.resume();
    synth.speak(utterance);
    speechTimer = setTimeout(() => {
      if (token === speechToken && !started) $('audio-status').textContent = '没听到声音？请再点一次“听题”，检查音量；也可以请家长读题。';
    }, 4000);
  }
  function listen() {
    if (!item()) return;
    heard = true;
    $('source').open = false;
    renderExercise();
    const text = item().text;
    say(clues[text] ? `${text}。${clues[text]}。请写下来。` : `${text}${state.mode === 'words' ? '。' : ''}请写下来。`);
  }
  function resultColor(result) {
    if (!result) return '';
    if (!result.correct) return 'red';
    return result.hinted || result.wrong ? 'yellow' : 'green';
  }
  function missed() { return lessons[state.mode].map((_, i) => i).filter(i => status(i) && (!status(i).correct || status(i).hinted || status(i).wrong)); }
  function renderMap() {
    $('dots').replaceChildren();
    const labels = { green: '独立写对', yellow: '提示后写对', red: '还要练', '': '未完成' };
    lessons[state.mode].forEach((_, id) => {
      const button = document.createElement('button');
      const color = resultColor(status(id));
      button.className = `dot ${color}${itemId() === id ? ' current' : ''}`;
      button.textContent = id + 1;
      button.setAttribute('aria-label', `第 ${id + 1} 题，${labels[color]}`);
      if (itemId() === id) button.setAttribute('aria-current', 'step');
      button.addEventListener('click', () => {
        const s = session();
        if (!s.queue.includes(id)) { s.queue = lessons[state.mode].map((_, i) => i); s.review = false; }
        s.index = s.queue.indexOf(id);
        resetView(); save(); render();
      });
      $('dots').append(button);
    });
    $('review-toggle').disabled = missed().length === 0;
  }
  function renderExercise() {
    const current = item();
    if (!current) return;
    const visible = phase !== 'write';
    $('cover').hidden = visible;
    $('reveal').hidden = !visible;
    // Remove the answer from the DOM whenever it should be hidden.
    $('answer').textContent = visible ? current.text : '';
    $('answer').className = `answer${state.mode === 'sentences' ? ' sentence' : ''}`;
    $('reveal-note').textContent = phase === 'hint' ? '仔细看，记住字的样子，再藏起来写。' : '看看纸上写的，和这里一样吗？';
    $('prompt').textContent = heard ? '现在，自己写一写' : '准备好纸和笔了吗？';
    $('instruction').textContent = heard ? '先想一想。实在不会，再看提示。' : '点“听题”，听完后自己写。';
    $('listen-label').textContent = heard ? '再听一遍' : '听题';
    $('write-actions').hidden = phase !== 'write';
    $('hint-actions').hidden = phase !== 'hint';
    $('check-actions').hidden = phase !== 'check';
    $('hint').disabled = !heard;
    $('check').disabled = !heard;
    $('previous').disabled = session().index === 0;
  }
  function renderSummary() {
    const s = session();
    const green = s.queue.filter(id => resultColor(status(id)) === 'green').length;
    const yellow = s.queue.filter(id => resultColor(status(id)) === 'yellow').length;
    const remaining = s.queue.length - green - yellow;
    $('summary-text').textContent = `${s.queue.length} 题中，${green} 题独立写对，${yellow} 题提示后写对，${remaining} 题还要练。`;
    const ids = missed();
    $('review-missed').hidden = ids.length === 0;
    $('review-list').textContent = ids.length ? `再巩固一下：${ids.map(id => lessons[state.mode][id].text).join('　')}` : '这一轮全部独立写对了！';
    $('next-mode').textContent = state.mode === 'words' ? '接着听写句子 →' : '回到字词听写 →';
  }
  function render() {
    const s = session();
    const finished = s.index >= s.queue.length;
    document.body.classList.toggle('large', state.large);
    $('bigger').setAttribute('aria-pressed', String(state.large));
    $('bigger').textContent = state.large ? '恢复大字' : '字再大一点 ＋';
    $('speed').value = state.speed;
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
    $('group-label').textContent = finished ? '本轮结果' : `${s.review ? '复习 · ' : ''}${item().group}`;
    $('position').textContent = finished ? `${s.queue.length} / ${s.queue.length}` : `第 ${s.index + 1} / ${s.queue.length} 题`;
    $('progress-bar').style.width = `${s.index / s.queue.length * 100}%`;
    $('exercise').hidden = finished;
    $('summary').hidden = !finished;
    if (finished) { $('answer').textContent = ''; renderSummary(); } else renderExercise();
    renderMap();
  }
  function resetView() {
    stopAudio(); phase = 'write'; heard = false;
    $('audio-status').textContent = '';
    $('source').open = false;
  }
  function advance() {
    session().index++;
    resetView(); save(); render();
    if (item()) listen();
  }
  function switchMode(mode) {
    state.mode = mode; resetView(); save(); render();
  }
  function startReview() {
    const ids = missed();
    if (!ids.length) return;
    const s = session();
    s.queue = ids; s.index = 0; s.review = true;
    ids.forEach(id => delete s.states[id]);
    resetView(); save(); render(); listen();
  }
  $('listen').addEventListener('click', listen);
  $('hint').addEventListener('click', () => {
    stopAudio();
    session().states[itemId()] = { ...status(itemId()), hinted: true, correct: false };
    phase = 'hint'; save(); render();
    $('audio-status').textContent = '看一看，然后点“藏起来再写”。';
  });
  $('hide-retry').addEventListener('click', () => { phase = 'write'; renderExercise(); listen(); });
  $('check').addEventListener('click', () => {
    stopAudio(); phase = 'check'; $('audio-status').textContent = '请自己或请家长检查。'; renderExercise();
  });
  $('again').addEventListener('click', () => {
    session().states[itemId()] = { ...status(itemId()), hinted: true, wrong: true, correct: false };
    phase = 'hint'; save(); render();
    $('audio-status').textContent = '没关系，记住以后，再藏起来写一次。';
  });
  $('correct').addEventListener('click', () => { session().states[itemId()] = { ...status(itemId()), correct: true }; advance(); });
  $('skip').addEventListener('click', () => {
    if (!status(itemId())?.correct) session().states[itemId()] = { ...status(itemId()), wrong: true, correct: false };
    advance();
  });
  $('previous').addEventListener('click', () => { if (session().index > 0) session().index--; resetView(); save(); render(); });
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => switchMode(button.dataset.mode)));
  $('speed').addEventListener('change', event => { state.speed = event.target.value; save(); if (heard && item()) listen(); });
  $('bigger').addEventListener('click', () => { state.large = !state.large; save(); render(); });
  $('review-toggle').addEventListener('click', startReview);
  $('review-missed').addEventListener('click', startReview);
  $('restart').addEventListener('click', () => { state[state.mode] = fresh(state.mode); resetView(); save(); render(); listen(); });
  $('next-mode').addEventListener('click', () => switchMode(state.mode === 'words' ? 'sentences' : 'words'));
  $('read-passage').addEventListener('click', () => say(chunks.join(''), true));
  $('source').addEventListener('toggle', () => {
    if (!$('source').open || !item()) return;
    // The source shows both lessons, so it counts as a hint for both.
    for (const mode of Object.keys(lessons)) lessons[mode].forEach((_, id) => {
      const previous = state[mode].states[id];
      if (!previous?.correct) state[mode].states[id] = { ...previous, hinted: true, correct: false };
    });
    save(); renderMap();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAudio(); });
  window.addEventListener('pagehide', stopAudio);
  // Voice lists may arrive after page load on iOS; choose the voice on every tap.
  if (synth) synth.getVoices();
  render();
})();
