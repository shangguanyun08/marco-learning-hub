(() => {
  const key = 'harry-nnat-zozeck-review-2026-11-25';
  const questions = window.ZOZECK_MOCK_REVIEW;
  const list = document.getElementById('mock-question-list');
  const template = document.getElementById('mock-question-template');
  const progress = document.getElementById('mock-progress');
  const questionButtons = [...document.querySelectorAll('[data-question]')];
  const sessionLinks = [...document.querySelectorAll('[data-session]')];
  const sessions = new Map([...document.querySelectorAll('[data-test]')].map(section => [
    section.dataset.test,
    { section, ids: [...section.querySelectorAll('[data-question]')].map(button => button.dataset.question) },
  ]));
  const practice = new Map();
  let marked = new Set();
  let activeSession;
  let saved = true;
  const sessionFromUrl = () => new URLSearchParams(location.search).get('test');

  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(stored)) marked = new Set(stored.filter(id => Object.hasOwn(questions, id)));
  } catch {}

  function showProgress() {
    const ids = sessions.get(activeSession).ids;
    const count = ids.filter(id => marked.has(id)).length;
    const description = `${count} of ${ids.length} reviewed`;
    progress.textContent = saved ? description : `${description} · progress could not be saved`;
    for (const button of questionButtons) {
      button.classList.toggle('is-reviewed', marked.has(button.dataset.question));
    }
  }

  function markQuestion(id, value) {
    if (value) marked.add(id);
    else marked.delete(id);
    try {
      localStorage.setItem(key, JSON.stringify([...marked]));
      saved = true;
    } catch {
      saved = false;
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
    if (!practice.has(id)) practice.set(id, { selected: '', attempts: [], enlarged: false });
    const state = practice.get(id);
    reviewed.checked = marked.has(id);
    reviewed.addEventListener('change', () => markQuestion(id, reviewed.checked));

    function updateSize() {
      article.classList.toggle('is-enlarged', state.enlarged);
      enlarge.setAttribute('aria-pressed', String(state.enlarged));
    }
    enlarge.addEventListener('click', () => {
      state.enlarged = !state.enlarged;
      updateSize();
    });

    function updateAnswer() {
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
      state.selected = event.target.value;
      updateAnswer();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (check.disabled) return;
      state.attempts.push(state.selected);
      if (state.selected === question.answer) {
        reviewed.checked = true;
        markQuestion(id, true);
      }
      updateAnswer();
      if (state.attempts.length === 1 && state.selected !== question.answer) {
        choices.querySelector('input:enabled')?.focus();
      }
    });

    updateSize();
    updateAnswer();
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
  showSession(sessionFromUrl());
})();
