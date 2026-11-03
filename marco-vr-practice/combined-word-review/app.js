(function () {
  'use strict';
  const data = window.MARCO_WORD_REVIEW;
  const words = data.words;
  const labels = { 2: '1 · More familiar', 3: '2 · Moderate & tricky', 4: '3 · Challenging', 5: '4 · Most challenging' };
  const byId = id => document.getElementById(id);
  const demo = new URLSearchParams(location.search).get('demo') === '1';
  let index = 0;
  let revealed = false;
  let interacted = false;
  const sync = window.VocabularyRevealSync.create({
    data, demo,
    onStatus: text => { byId('save-status').textContent = text; },
    onChange: state => { byId('opened-count').textContent = Object.keys(state.opened).length; }
  });

  function renderDirectory() {
    const query = byId('search').value.trim().toLowerCase();
    const matches = words.filter(word => word.word.toLowerCase().includes(query));
    const container = byId('word-directory');
    container.replaceChildren();
    byId('search-count').textContent = matches.length + (matches.length === 1 ? ' word' : ' words');
    for (const level of [2, 3, 4, 5]) {
      const group = matches.filter(word => word.difficulty === level);
      if (!group.length) continue;
      const heading = document.createElement('h3');
      heading.textContent = labels[level] + ' · ' + group.length;
      const grid = document.createElement('div');
      grid.className = 'word-grid';
      for (const word of group) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = word.word;
        button.dataset.wordId = word.id;
        if (word.id === words[index].id) button.setAttribute('aria-current', 'true');
        grid.append(button);
      }
      container.append(heading, grid);
    }
  }

  function render() {
    const word = words[index];
    byId('word').textContent = word.word;
    byId('difficulty').textContent = labels[word.difficulty];
    byId('position').textContent = 'Word ' + (index + 1) + ' of ' + words.length;
    byId('progress').value = index + 1;
    byId('meaning').textContent = revealed ? word.meaning : '';
    byId('meaning').hidden = !revealed;
    byId('prompt').hidden = revealed;
    byId('reveal').hidden = revealed;
    byId('hide').hidden = !revealed;
    byId('opened-note').hidden = revealed || !sync.snapshot().opened[word.id];
    byId('previous').disabled = index === 0;
    byId('next').disabled = index === words.length - 1;
    byId('opened-count').textContent = Object.keys(sync.snapshot().opened).length;
    byId('pronounce').setAttribute('aria-label', 'Pronounce ' + word.word);
    for (const button of document.querySelectorAll('[data-word-id]')) {
      if (button.dataset.wordId === word.id) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }

  function move(nextIndex) {
    if (nextIndex < 0 || nextIndex >= words.length) return;
    interacted = true;
    index = nextIndex;
    revealed = false;
    window.speechSynthesis?.cancel();
    sync.move(words[index].id);
    render();
  }

  byId('reveal').addEventListener('click', () => {
    interacted = true;
    revealed = true;
    sync.open(words[index].id);
    render();
    byId('hide').focus({ preventScroll: true });
  });
  byId('hide').addEventListener('click', () => {
    revealed = false;
    render();
    byId('reveal').focus({ preventScroll: true });
  });
  byId('previous').addEventListener('click', () => move(index - 1));
  byId('next').addEventListener('click', () => move(index + 1));
  byId('save').addEventListener('click', () => void sync.flush());
  byId('search').addEventListener('input', renderDirectory);
  byId('word-directory').addEventListener('click', event => {
    const button = event.target.closest('[data-word-id]');
    if (!button) return;
    move(words.findIndex(word => word.id === button.dataset.wordId));
    document.querySelector('.directory').open = false;
    document.querySelector('.study').scrollIntoView({ block: 'center' });
    byId('reveal').focus({ preventScroll: true });
  });
  byId('pronounce').disabled = !window.speechSynthesis || !window.SpeechSynthesisUtterance;
  byId('pronounce').addEventListener('click', () => {
    const word = words[index].word;
    const text = word === 'minute' ? 'a minute detail' : word === 'defect' ? 'to defect' : word;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    const voice = speechSynthesis.getVoices().find(item => item.lang === 'en-US');
    if (voice) utterance.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  });
  window.addEventListener('storage', event => {
    if (event.key === sync.key && event.newValue) sync.receiveLocal(event.newValue);
  });
  window.addEventListener('online', () => void sync.flush());
  window.addEventListener('pagehide', () => void sync.flush());

  const savedIndex = words.findIndex(word => word.id === sync.snapshot().position?.id);
  if (savedIndex >= 0) index = savedIndex;
  renderDirectory();
  render();
  void sync.flush().then(() => {
    if (interacted) return;
    const remoteIndex = words.findIndex(word => word.id === sync.snapshot().position?.id);
    if (remoteIndex >= 0) index = remoteIndex;
    render();
  });
})();
