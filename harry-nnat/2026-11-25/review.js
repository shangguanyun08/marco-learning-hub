(() => {
  const reviewKey = 'harry-nnat-zozeck-review-2026-11-25:round-2';
  const questionKey = `${reviewKey}:question:`;
  const archiveKey = `${reviewKey}:online`;
  const questions = window.ZOZECK_MOCK_REVIEW;
  const list = document.getElementById('mock-question-list');
  const template = document.getElementById('mock-question-template');
  const progress = document.getElementById('mock-progress');
  const saveStatus = document.getElementById('mock-save-status');
  const empty = document.getElementById('mock-empty');
  const questionButtons = [...document.querySelectorAll('[data-question]')];
  const dashboard = questionButtons.map(button => {
    const badge = document.createElement('span');
    badge.className = 'mock-number-result';
    badge.setAttribute('aria-hidden', 'true');
    button.append(badge);
    return { button, badge, label: button.getAttribute('aria-label') };
  });
  const filters = [...document.querySelectorAll('[data-filter]')];
  const sessionLinks = [...document.querySelectorAll('[data-session]')];
  const sessions = new Map([...document.querySelectorAll('[data-test]')].map(section => [
    section.dataset.test,
    { section, ids: [...section.querySelectorAll('[data-question]')].map(button => button.dataset.question) },
  ]));
  const practice = new Map();
  const unsaved = new Set();
  const enlarged = new Set();
  const refreshVisible = new Map();
  let activeSession;
  let activeFilter = 'all';
  let storageUnavailable = false;
  let sync;
  let syncStatus = '';
  const sessionFromUrl = () => new URLSearchParams(location.search).get('test');
  const isChoice = value => typeof value === 'string' && /^[A-E]$/.test(value);
  const isFinished = (attempts, answer) => attempts.length === 2 || attempts.at(-1) === answer;
  const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
  const resultLabels = {
    correct: ['✓', 'Correct on the first try'],
    corrected: ['✓', 'Correct on the second try'],
    'first-wrong': ['×', 'First try wrong, one try left'],
    'wrong-twice': ['××', 'Wrong on both tries'],
  };

  function readStored(key) {
    let value;
    try {
      value = localStorage.getItem(key);
    } catch {
      storageUnavailable = true;
      return null;
    }
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function normalizeRecord(id, record, legacyMark = false) {
    const attempts = Array.isArray(record?.attempts) ? record.attempts.filter(isChoice).slice(0, 2) : [];
    const correct = attempts.indexOf(questions[id].answer);
    if (correct !== -1) attempts.length = correct + 1;
    const last = attempts.at(-1);
    const locked = isFinished(attempts, questions[id].answer);
    return {
      attempts,
      selected: locked ? last : isChoice(record?.selected) ? record.selected : last || '',
      selectedAt: timestamp(record?.selectedAt),
      reviewed: typeof record?.reviewed === 'boolean' ? record.reviewed : legacyMark,
      reviewedAt: timestamp(record?.reviewedAt),
    };
  }

  function readProgress() {
    const storedMarks = readStored(reviewKey);
    const legacyMarks = new Set(Array.isArray(storedMarks) ? storedMarks : []);
    for (const id of Object.keys(questions)) {
      if (unsaved.has(id)) continue;
      practice.set(id, normalizeRecord(id, readStored(questionKey + id), legacyMarks.has(id)));
    }
  }

  function showSaveStatus() {
    let message;
    if (syncStatus === 'Synced online') message = syncStatus;
    else if (unsaved.size) message = 'Some changes could not be saved. Keep this tab open.';
    else if (syncStatus) message = syncStatus;
    else if (storageUnavailable) message = 'Saving is unavailable in this browser.';
    else {
      const hasWork = [...practice.values()].some(state => state.selected || state.reviewed);
      message = hasWork ? 'Progress saved in this browser' : 'Progress saves in this browser';
    }
    if (saveStatus.textContent !== message) saveStatus.textContent = message;
  }

  function showProgress() {
    const ids = sessions.get(activeSession).ids;
    const checked = ids.filter(id => practice.get(id).attempts.length).length;
    const reviewed = ids.filter(id => practice.get(id).reviewed).length;
    progress.textContent = `${checked} of ${ids.length} checked · ${reviewed} reviewed`;
    showSessionScores();
    showSaveStatus();
    showDashboard();
  }

  function showSessionScores() {
    for (const link of sessionLinks) {
      const { ids } = sessions.get(link.dataset.session);
      let right = 0;
      let wrong = 0;
      let finished = 0;
      for (const id of ids) {
        const { attempts } = practice.get(id);
        const { answer } = questions[id];
        if (attempts[0] === answer) right++;
        else if (attempts.length) wrong++;
        if (isFinished(attempts, answer)) finished++;
      }
      const complete = finished === ids.length;
      link.classList.toggle('is-complete', complete);
      link.querySelector('.mock-session-detail').textContent = complete ? `✓ Finished · ${ids.length} questions` : `${ids.length} questions`;
      link.querySelector('.mock-session-score').textContent = `First try · ${right} right · ${wrong} wrong`;
    }
  }

  function showDashboard() {
    const ids = sessions.get(activeSession).ids;
    const firstWrong = new Set();
    const wrongTwice = new Set();
    for (const { button, label, badge } of dashboard) {
      const id = button.dataset.question;
      const { attempts, reviewed } = practice.get(id);
      const answer = questions[id].answer;
      const [first, second] = attempts;
      let result = 'unchecked';
      if (first === answer) result = 'correct';
      else if (second === answer) result = 'corrected';
      else if (second) result = 'wrong-twice';
      else if (first) result = 'first-wrong';
      if (first && first !== answer) firstWrong.add(id);
      if (result === 'wrong-twice') wrongTwice.add(id);
      const [symbol, description] = resultLabels[result] || ['', reviewed ? 'Reviewed' : 'Unchecked'];
      button.dataset.result = result;
      button.classList.toggle('is-reviewed', reviewed);
      button.setAttribute('aria-label', `${label} · ${description}`);
      button.title = description;
      badge.textContent = symbol;
    }
    const matching = { 'first-wrong': firstWrong, 'wrong-twice': wrongTwice };
    for (const button of filters) {
      const id = button.dataset.filter;
      button.setAttribute('aria-pressed', String(activeFilter === id));
      if (id !== 'all') button.querySelector('span').textContent = ids.filter(q => matching[id].has(q)).length;
    }
    const visible = new Set(ids.filter(id => activeFilter === 'all' || matching[activeFilter].has(id)));
    for (const button of questionButtons) {
      button.hidden = !visible.has(button.dataset.question);
      if (button.hidden) button.removeAttribute('aria-current');
    }
    for (const id of ids) document.getElementById(id).hidden = !visible.has(id);
    empty.hidden = visible.size > 0;
    if (!empty.hidden) {
      empty.textContent = activeFilter === 'wrong-twice' ? 'No questions missed twice in this test.' : 'No first-try misses in this test.';
    }
  }

  function persistQuestion(id) {
    try {
      localStorage.setItem(questionKey + id, JSON.stringify(practice.get(id)));
      unsaved.delete(id);
      storageUnavailable = false;
    } catch {
      unsaved.add(id);
    }
  }

  function saveQuestion(id, immediate = false) {
    persistQuestion(id);
    syncStatus = '';
    showProgress();
    if (immediate) sync?.sync();
    else sync?.queue();
  }

  function restoreProgress(records) {
    let changed = false;
    for (const [id, record] of records) {
      const next = normalizeRecord(id, record);
      if (JSON.stringify(practice.get(id)) === JSON.stringify(next)) continue;
      practice.set(id, next);
      persistQuestion(id);
      refreshVisible.get(id)?.();
      changed = true;
    }
    if (changed) showProgress();
  }

  function picture({ src, width, height }, alt = '') {
    const image = document.createElement('img');
    image.className = 'mock-picture';
    image.alt = alt;
    image.width = width;
    image.height = height;
    image.style.setProperty('--picture-width', `${width}px`);
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = src;
    return image;
  }

  function makeChoice(source, index) {
    const letter = 'ABCDE'[index];
    const label = document.createElement('label');
    label.className = 'mock-choice';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'choice';
    input.value = letter;
    const caption = document.createElement('span');
    caption.textContent = letter;
    label.append(input, caption, picture(source));
    return label;
  }

  function makeQuestion(id) {
    const question = questions[id];
    const [test, number] = id.split('-q');
    const article = template.content.firstElementChild.cloneNode(true);
    article.id = id;
    const title = article.querySelector('h2');
    title.id = `${id}-title`;
    title.textContent = `Question ${number}`;
    article.setAttribute('aria-labelledby', title.id);
    article.querySelector('.mock-figure').append(
      picture(question.diagram, `Original diagram for ${test.toUpperCase()} question ${number}`),
    );
    const form = article.querySelector('form');
    const choices = form.querySelector('.mock-choices');
    choices.append(...question.choices.map(makeChoice));
    const check = form.querySelector('.mock-check');
    const feedback = form.querySelector('.mock-feedback');
    const reviewed = article.querySelector('input[type="checkbox"]');
    const enlarge = article.querySelector('.mock-enlarge');
    reviewed.addEventListener('change', () => {
      const state = practice.get(id);
      state.reviewed = reviewed.checked;
      state.reviewedAt = new Date().toISOString();
      saveQuestion(id);
    });

    function updateSize() {
      article.classList.toggle('is-enlarged', enlarged.has(id));
      enlarge.setAttribute('aria-pressed', String(enlarged.has(id)));
    }
    enlarge.addEventListener('click', () => {
      if (enlarged.has(id)) enlarged.delete(id);
      else enlarged.add(id);
      updateSize();
    });

    function updateAnswer() {
      const state = practice.get(id);
      reviewed.checked = state.reviewed;
      const last = state.attempts.at(-1);
      const correct = last === question.answer;
      const done = isFinished(state.attempts, question.answer);
      for (const input of form.elements.choice) {
        input.checked = input.value === state.selected;
        const missed = state.attempts.includes(input.value) && input.value !== question.answer;
        input.disabled = done || missed;
        input.parentElement.classList.toggle('is-wrong', missed);
        input.parentElement.classList.toggle('is-correct', done && input.value === question.answer);
      }
      check.disabled = done || !state.selected || state.attempts.includes(state.selected);
      feedback.classList.toggle('correct', correct);
      feedback.classList.toggle('incorrect', Boolean(last && !correct));
      if (correct) feedback.textContent = 'Correct!';
      else if (done) feedback.textContent = `The correct answer is ${question.answer}.`;
      else if (last) feedback.textContent = 'Try once more.';
      else feedback.textContent = '';
    }

    form.addEventListener('change', event => {
      const state = practice.get(id);
      state.selected = event.target.value;
      state.selectedAt = new Date().toISOString();
      saveQuestion(id);
      updateAnswer();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (check.disabled) return;
      const state = practice.get(id);
      state.attempts.push(state.selected);
      state.selectedAt = new Date().toISOString();
      if (state.selected === question.answer) {
        state.reviewed = true;
        state.reviewedAt = state.selectedAt;
      }
      saveQuestion(id, true);
      updateAnswer();
      if (state.attempts.length === 1 && state.selected !== question.answer) {
        choices.querySelector('input:enabled')?.focus();
      }
    });

    updateSize();
    updateAnswer();
    refreshVisible.set(id, updateAnswer);
    return article;
  }

  function showSession(id) {
    const next = sessions.has(id) ? id : '1';
    if (next === activeSession) return;
    activeSession = next;
    activeFilter = 'all';
    for (const [test, { section }] of sessions) section.hidden = test !== activeSession;
    for (const link of sessionLinks) {
      if (link.dataset.session === activeSession) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    for (const button of questionButtons) button.removeAttribute('aria-current');
    list.setAttribute('aria-label', `TEST-0${activeSession} questions`);
    refreshVisible.clear();
    list.replaceChildren(...sessions.get(activeSession).ids.map(makeQuestion));
    showProgress();
  }

  for (const button of filters) {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      showDashboard();
    });
  }
  for (const button of questionButtons) {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.question);
      for (const other of questionButtons) other.removeAttribute('aria-current');
      button.setAttribute('aria-current', 'true');
      target.querySelector('h2').focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
    });
  }
  for (const link of sessionLinks) {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (link.dataset.session !== activeSession) {
        history.pushState(null, '', link.href);
        showSession(link.dataset.session);
      }
    });
  }
  addEventListener('popstate', () => showSession(sessionFromUrl()));
  addEventListener('storage', event => {
    if (event.key && event.key !== reviewKey && !event.key.startsWith(questionKey)) return;
    readProgress();
    for (const refresh of refreshVisible.values()) refresh();
    showProgress();
  });
  readProgress();
  showSession(sessionFromUrl());
  if (location.hostname === 'shangguanyun08.github.io' && window.NNATMockOnline && typeof fetch === 'function') {
    const deviceKey = `${reviewKey}:device`;
    let deviceId = crypto.randomUUID();
    try {
      deviceId = localStorage.getItem(deviceKey) || deviceId;
      localStorage.setItem(deviceKey, deviceId);
    } catch {}
    sync = window.NNATMockOnline.create({
      questions,
      records: () => {
        readProgress();
        return practice;
      },
      restore: restoreProgress,
      readArchive: () => readStored(archiveKey),
      writeArchive: value => {
        try { localStorage.setItem(archiveKey, JSON.stringify(value)); } catch {}
      },
      onStatus: message => {
        syncStatus = message;
        showSaveStatus();
      },
      deviceId,
    });
    for (const event of ['online', 'focus', 'pageshow']) addEventListener(event, () => sync.sync());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) sync.sync();
    });
    setInterval(() => {
      if (!document.hidden) sync.sync();
    }, 30000);
    sync.sync();
  }
})();
