(function () {
  'use strict';
  const data = window.MARCO_WORD_REVIEW;
  const words = data.words;
  const labels = { 2: '1 · More familiar', 3: '2 · Moderate & tricky', 4: '3 · Challenging', 5: '4 · Most challenging' };
  const byId = id => document.getElementById(id);
  const wordMap = new Map(words.map(word => [word.id, word]));
  const rows = new Map();
  const groups = new Map();
  const revealed = new Set();
  const demo = new URLSearchParams(location.search).get('demo') === '1';
  let view = 'all';
  const sync = window.VocabularyRevealSync.create({
    data, demo,
    onStatus: text => { byId('save-status').textContent = text; },
    onChange: refresh
  });

  function buildList() {
    const container = byId('word-list');
    let previousLevel = null;
    for (const [index, word] of words.entries()) {
      if (word.difficulty !== previousLevel) {
        const heading = document.createElement('tr');
        heading.className = 'group-row';
        const cell = document.createElement('th');
        cell.colSpan = 2;
        cell.textContent = labels[word.difficulty];
        heading.append(cell);
        container.append(heading);
        groups.set(word.difficulty, heading);
        previousLevel = word.difficulty;
      }
      const row = document.createElement('tr');
      row.className = 'word-row';
      row.id = 'row-' + word.id;
      row.dataset.wordId = word.id;
      const wordCell = document.createElement('th');
      wordCell.scope = 'row';
      const content = document.createElement('div');
      content.className = 'word-content';
      const number = document.createElement('span');
      number.className = 'number';
      number.textContent = index + 1;
      const label = document.createElement('span');
      label.className = 'word-label';
      label.textContent = word.word;
      const pronounce = document.createElement('button');
      pronounce.type = 'button';
      pronounce.className = 'sound';
      pronounce.dataset.action = 'pronounce';
      pronounce.textContent = '🔊';
      pronounce.setAttribute('aria-label', 'Pronounce ' + word.word);
      pronounce.disabled = !window.speechSynthesis || !window.SpeechSynthesisUtterance;
      content.append(number, label, pronounce);
      wordCell.append(content);

      const answerCell = document.createElement('td');
      const actions = document.createElement('div');
      actions.className = 'row-actions';
      const know = document.createElement('button');
      know.type = 'button';
      know.className = 'know';
      know.dataset.action = 'know';
      know.setAttribute('aria-label', 'I know ' + word.word);
      const reveal = document.createElement('button');
      reveal.type = 'button';
      reveal.className = 'reveal';
      reveal.dataset.action = 'reveal';
      reveal.setAttribute('aria-label', 'I don’t know ' + word.word);
      reveal.setAttribute('aria-controls', 'meaning-' + word.id);
      const undo = document.createElement('button');
      undo.type = 'button';
      undo.className = 'text-button';
      undo.dataset.action = 'undo';
      undo.textContent = 'Undo';
      undo.setAttribute('aria-label', 'Undo choice for ' + word.word);
      const meaning = document.createElement('p');
      meaning.className = 'meaning';
      meaning.id = 'meaning-' + word.id;
      meaning.setAttribute('aria-live', 'polite');
      meaning.hidden = true;
      actions.append(know, reveal, undo);
      answerCell.append(actions, meaning);
      row.append(wordCell, answerCell);
      container.append(row);
      rows.set(word.id, { row, know, reveal, undo, meaning });
    }
  }

  function refresh() {
    if (!rows.size) return;
    const state = sync.snapshot();
    let markedCount = 0;
    let visibleCount = 0;
    const visibleGroups = new Set();
    const query = byId('search').value.trim().toLowerCase();
    for (const word of words) {
      const elements = rows.get(word.id);
      const marked = state.opened[word.id]?.review === true;
      const known = state.opened[word.id]?.known === true;
      const showMeaning = marked && revealed.has(word.id);
      if (marked) markedCount++;
      const visible = word.word.toLowerCase().includes(query) && (view === 'all' || marked);
      elements.row.hidden = !visible;
      if (visible) { visibleCount++; visibleGroups.add(word.difficulty); }
      elements.row.classList.toggle('marked', marked);
      elements.row.classList.toggle('known', known);
      elements.know.textContent = known ? 'I know ✓' : 'I know';
      elements.know.setAttribute('aria-pressed', String(known));
      elements.reveal.textContent = marked ? 'I don’t know ✓' : 'I don’t know';
      elements.reveal.setAttribute('aria-pressed', String(marked));
      elements.undo.hidden = !marked && !known;
      elements.meaning.hidden = !showMeaning;
      elements.meaning.textContent = showMeaning ? word.meaning : '';
      elements.reveal.setAttribute('aria-expanded', String(showMeaning));
    }
    for (const [level, heading] of groups) heading.hidden = !visibleGroups.has(level);
    byId('marked-count').textContent = markedCount;
    byId('marked-tab-count').textContent = markedCount;
    byId('download').disabled = markedCount === 0;
    byId('all-view').setAttribute('aria-pressed', String(view === 'all'));
    byId('marked-view').setAttribute('aria-pressed', String(view === 'marked'));
    const countLabel = visibleCount === 1 ? '1 word' : visibleCount + ' words';
    byId('list-description').textContent = countLabel + (view === 'marked' ? ' marked for review' : '') + ' · Easier → harder';
    byId('empty-message').hidden = visibleCount > 0;
    byId('empty-message').textContent = query ? 'No matching words.' : 'Tap I don’t know beside any word to start your trimmed review list.';
    const lastWord = wordMap.get(state.position?.id);
    byId('resume').hidden = !lastWord;
    if (lastWord) {
      byId('resume').href = '#row-' + lastWord.id;
      byId('resume').textContent = 'Resume at ' + lastWord.word;
    }
  }

  function pronounce(word) {
    const text = word === 'minute' ? 'a minute detail' : word === 'defect' ? 'to defect' : word;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    const voice = speechSynthesis.getVoices().find(item => item.lang === 'en-US');
    if (voice) utterance.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  byId('word-list').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const row = button.closest('[data-word-id]');
    const id = row.dataset.wordId;
    if (button.dataset.action === 'pronounce') { pronounce(wordMap.get(id).word); return; }
    if (button.dataset.action === 'reveal') {
      revealed.add(id);
      if (sync.snapshot().opened[id]?.review) refresh();
      else sync.open(id);
      return;
    }
    revealed.delete(id);
    if (button.dataset.action === 'know') sync.know(id);
    else sync.unmark(id);
    if (view === 'marked') byId('marked-view').focus({ preventScroll: true });
    else if (button.dataset.action === 'undo') rows.get(id).know.focus({ preventScroll: true });
  });
  byId('all-view').addEventListener('click', () => { view = 'all'; refresh(); });
  byId('marked-view').addEventListener('click', () => { view = 'marked'; refresh(); });
  byId('search').addEventListener('input', refresh);
  byId('save').addEventListener('click', () => void sync.flush());
  byId('resume').addEventListener('click', () => {
    view = 'all';
    byId('search').value = '';
    refresh();
  });
  byId('download').addEventListener('click', () => {
    const state = sync.snapshot();
    const marked = words.filter(word => state.opened[word.id]?.review);
    const text = ['Marco’s trimmed review list', marked.length + ' words · Easier to harder', '', ...marked.map(word => word.word + ' — ' + word.meaning)].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Marco-trimmed-review-words.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  window.addEventListener('storage', event => {
    if (event.key === sync.key && event.newValue) sync.receiveLocal(event.newValue);
  });
  window.addEventListener('online', () => void sync.flush());
  window.addEventListener('pagehide', () => void sync.flush());

  buildList();
  refresh();
  void sync.flush();
})();
