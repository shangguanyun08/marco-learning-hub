(() => {
  const key = 'harry-nnat-zozeck-review-2026-11-25';
  const questions = window.ZOZECK_MOCK_REVIEW;
  const find = id => document.getElementById(id);
  const questionButtons = [...document.querySelectorAll('[data-question]')];
  const ids = questionButtons.map(button => button.dataset.question);
  const form = find('mock-form');
  const choices = find('mock-choices');
  const title = find('mock-question-title');
  const diagram = find('mock-diagram');
  const feedback = find('mock-feedback');
  const check = find('mock-check');
  const reviewed = find('mock-reviewed');
  const practice = new Map();
  let marked = new Set();
  let active;
  let saved = true;

  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(stored)) marked = new Set(stored.filter(id => Object.hasOwn(questions, id)));
  } catch {}

  function showProgress() {
    const description = `${marked.size} of ${ids.length} reviewed on this device`;
    find('mock-progress').textContent = saved ? description : `${description} · progress could not be saved`;
    reviewed.checked = marked.has(active);
    for (const button of questionButtons) {
      button.classList.toggle('is-reviewed', marked.has(button.dataset.question));
    }
  }

  function markQuestion(value) {
    if (value) marked.add(active);
    else marked.delete(active);
    try {
      localStorage.setItem(key, JSON.stringify([...marked]));
      saved = true;
    } catch {
      saved = false;
    }
    showProgress();
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
    const image = document.createElement('img');
    image.src = source;
    image.alt = '';
    label.append(input, caption, image);
    return label;
  }

  function updateAnswer() {
    const question = questions[active];
    const state = practice.get(active);
    const last = state.attempts.at(-1);
    const correct = last === question.answer;
    const done = correct || state.attempts.length === 2;
    for (const input of form.elements.choice) {
      input.checked = input.value === state.selected;
      const alreadyMissed = !correct && state.attempts.includes(input.value);
      input.disabled = done || alreadyMissed;
      input.parentElement.classList.toggle('is-wrong', alreadyMissed);
      input.parentElement.classList.toggle('is-correct', done && input.value === question.answer);
    }
    check.disabled = done || !state.selected || state.attempts.includes(state.selected);
    feedback.className = correct ? 'correct' : last ? 'incorrect' : '';
    if (correct) feedback.textContent = 'Correct!';
    else if (done) feedback.textContent = `The correct answer is ${question.answer}. Use the hint to work out the rule.`;
    else if (last) feedback.textContent = 'Try one more time. Check each detail before choosing.';
    else feedback.textContent = '';
  }

  function showQuestion(id, focus = false) {
    active = id;
    const question = questions[id];
    if (!practice.has(id)) practice.set(id, { selected: '', attempts: [] });
    const position = ids.indexOf(id);
    const [test, number] = id.split('-q');
    title.textContent = `${test.toUpperCase()} · Question ${number}`;
    diagram.src = question.diagram;
    diagram.alt = `Original diagram for ${test.toUpperCase()} question ${number}`;
    find('mock-hint-text').textContent = question.hint;
    find('mock-hint').open = false;
    find('mock-prev').disabled = position === 0;
    find('mock-next').disabled = position === ids.length - 1;
    for (const button of questionButtons) {
      const current = button.dataset.question === id;
      if (current) {
        button.setAttribute('aria-current', 'true');
        find('mock-focus-badge').hidden = !button.classList.contains('focus-question');
      } else button.removeAttribute('aria-current');
    }
    choices.replaceChildren(...question.choices.map(makeChoice));
    updateAnswer();
    showProgress();
    if (focus) title.focus();
  }

  form.addEventListener('change', event => {
    practice.get(active).selected = event.target.value;
    updateAnswer();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (check.disabled) return;
    const state = practice.get(active);
    state.attempts.push(state.selected);
    if (state.selected === questions[active].answer) markQuestion(true);
    updateAnswer();
    if (state.attempts.length === 1 && state.selected !== questions[active].answer) {
      choices.querySelector('input:enabled')?.focus();
    }
  });
  for (const button of questionButtons) {
    button.addEventListener('click', () => showQuestion(button.dataset.question, true));
  }
  reviewed.addEventListener('change', () => markQuestion(reviewed.checked));
  find('mock-prev').addEventListener('click', () => showQuestion(ids[ids.indexOf(active) - 1], true));
  find('mock-next').addEventListener('click', () => showQuestion(ids[ids.indexOf(active) + 1], true));
  showQuestion(questionButtons.find(button => button.classList.contains('focus-question')).dataset.question);
})();
