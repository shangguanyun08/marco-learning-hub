(() => {
  const reviewKey = 'harry-nnat-zozeck-review-2026-11-25';
  const questionKey = `${reviewKey}:question:`;
  const questions = window.ZOZECK_MOCK_REVIEW;
  const list = document.getElementById('mock-question-list');
  const template = document.getElementById('mock-question-template');
  const progress = document.getElementById('mock-progress');
  const saveStatus = document.getElementById('mock-save-status');
  const questionButtons = [...document.querySelectorAll('[data-question]')];
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
  let storageUnavailable = false;
  const sessionFromUrl = () => new URLSearchParams(location.search).get('test');
  const isChoice = value => typeof value === 'string' && /^[A-E]$/.test(value);

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

  function readProgress() {
    const storedMarks = readStored(reviewKey);
    const legacyMarks = new Set(Array.isArray(storedMarks) ? storedMarks : []);
    for (const id of Object.keys(questions)) {
      if (unsaved.has(id)) continue;
      const record = readStored(questionKey + id);
      const attempts = Array.isArray(record?.attempts) ? record.attempts.filter(isChoice).slice(0, 2) : [];
      const correct = attempts.indexOf(questions[id].answer);
      if (correct !== -1) attempts.length = correct + 1;
      const last = attempts.at(-1);
      const locked = correct !== -1 || attempts.length === 2;
      practice.set(id, {
        attempts,
        selected: locked ? last : isChoice(record?.selected) ? record.selected : last || '',
        reviewed: typeof record?.reviewed === 'boolean' ? record.reviewed : legacyMarks.has(id),
      });
    }
  }

  function showProgress() {
    const ids = sessions.get(activeSession).ids;
    const checked = ids.filter(id => practice.get(id).attempts.length).length;
    const reviewed = ids.filter(id => practice.get(id).reviewed).length;
    progress.textContent = `${checked} of ${ids.length} checked · ${reviewed} reviewed`;
    if (unsaved.size) saveStatus.textContent = 'Some changes could not be saved. Keep this tab open.';
    else if (storageUnavailable) saveStatus.textContent = 'Saving is unavailable in this browser.';
    else {
      const hasWork = [...practice.values()].some(state => state.selected || state.reviewed);
      saveStatus.textContent = hasWork ? 'Progress saved in this browser' : 'Progress saves in this browser';
    }
    for (const button of questionButtons) {
      button.classList.toggle('is-reviewed', practice.get(button.dataset.question).reviewed);
    }
  }

  function saveQuestion(id) {
    try {
      localStorage.setItem(questionKey + id, JSON.stringify(practice.get(id)));
      unsaved.delete(id);
      storageUnavailable = false;
    } catch {
      unsaved.add(id);
    }
    showProgress();
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
      practice.get(id).reviewed = reviewed.checked;
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
      const done = correct || state.attempts.length === 2;
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
      practice.get(id).selected = event.target.value;
      saveQuestion(id);
      updateAnswer();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (check.disabled) return;
      const state = practice.get(id);
      state.attempts.push(state.selected);
      if (state.selected === question.answer) state.reviewed = true;
      saveQuestion(id);
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
})();
