(function (root) {
  'use strict';

  const form = document.getElementById('fraction-practice-form');
  const panel = document.getElementById('fraction-practice');
  const button = form.querySelector('button[type="submit"]');
  const result = document.getElementById('fraction-practice-result');
  const saving = document.getElementById('fraction-practice-saving');
  const inputs = [...form.querySelectorAll('input[data-fraction-answer]')];
  const fields = inputs.map(input => input.dataset.fractionAnswer);
  const answers = {
    half: '0.5', third: '0.333…', quarter: '0.25',
    threeQuarters: '0.75', oneAndHalf: '1.5', threeAndThreeQuarters: '3.75',
    halfVsThird: '>', halfVsTwoThirds: '<'
  };
  const demo = new URLSearchParams(location.search).has('demo') ? ':demo' : '';
  const key = root.HarrySkillData.appId + ':fraction-fill-in-v1' + demo;
  let state = {drafts: {}, first: null, retry: null};

  function correct(id, value) {
    const text = value.normalize('NFKC').replace(/\s/g, '');
    if (id === 'third') {
      return /^0?\.3+(?:\.{3}|…)$/.test(text) || /^0?\.\(3\)$/.test(text) || /^0?\.3[\u0305\u0304]$/.test(text);
    }
    if (id.endsWith('Third') || id.endsWith('Thirds')) return text === answers[id];
    return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) && Number(text) === Number(answers[id]);
  }

  function validValues(values, required) {
    return values && typeof values === 'object' && !Array.isArray(values) &&
      Object.entries(values).every(([id, value]) => fields.includes(id) && typeof value === 'string' && value.length <= 32) &&
      required.every(id => typeof values[id] === 'string' && values[id].trim().length > 0);
  }

  function wrongFields() {
    return fields.filter(id => !correct(id, state.first.answers[id]));
  }

  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && validValues(saved.drafts, []) &&
        (!saved.first || validValues(saved.first.answers, fields)) &&
        (!saved.retry || saved.first && validValues(saved.retry.answers, fields.filter(id => !correct(id, saved.first.answers[id]))))) {
      state = saved;
    }
  } catch {
    saving.textContent = 'This browser could not read saved answers for this exercise.';
  }

  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      saving.textContent = 'This browser could not save this exercise. Keep the page open to keep your answers.';
    }
  }

  function updateButton() {
    const pending = state.first ? wrongFields() : fields;
    button.hidden = Boolean(state.retry || state.first && pending.length === 0);
    button.disabled = pending.some(id => !state.drafts[id]?.trim());
    button.textContent = state.first ? 'Check second try' : 'Check all answers';
  }

  function render() {
    for (const input of inputs) {
      const id = input.dataset.fractionAnswer;
      const row = input.closest('.fraction-practice-row');
      const feedback = row.querySelector('.fraction-practice-feedback');
      const firstCorrect = state.first && correct(id, state.first.answers[id]);
      input.disabled = Boolean(firstCorrect || state.retry);
      input.value = firstCorrect ? state.first.answers[id] : state.retry?.answers[id] ?? state.drafts[id] ?? '';
      row.classList.remove('right', 'first-wrong', 'corrected', 'retry-wrong');
      feedback.textContent = '';
      if (state.first) {
        const retryCorrect = state.retry && correct(id, state.retry.answers[id] || '');
        const outcome = firstCorrect ? 'right' : !state.retry ? 'first-wrong' : retryCorrect ? 'corrected' : 'retry-wrong';
        row.classList.add(outcome);
        input.setAttribute('aria-invalid', String(!firstCorrect && !retryCorrect));
        if (firstCorrect) feedback.textContent = '✓ Correct on first try';
        else if (!state.retry) feedback.textContent = `First answer ${state.first.answers[id]} · Try once more.`;
        else feedback.textContent = `First answer ${state.first.answers[id]} · ${retryCorrect ? '✓ Corrected on second try' : '✗ Second try incorrect'} · Answer ${answers[id]}`;
      }
    }
    result.textContent = '';
    if (state.first) {
      const missed = wrongFields();
      const score = fields.length - missed.length;
      result.textContent = `First try ${score}/${fields.length}.`;
      if (!missed.length) result.textContent += ' All correct!';
      else if (!state.retry) result.textContent += ' Fill in the missed blanks for one second try.';
      else {
        const corrected = missed.filter(id => correct(id, state.retry.answers[id])).length;
        result.textContent += ` Second try ${corrected}/${missed.length} corrected.`;
      }
    }
    updateButton();
  }

  form.addEventListener('input', event => {
    const id = event.target.dataset.fractionAnswer;
    if (!fields.includes(id) || event.target.disabled) return;
    state.drafts[id] = event.target.value.slice(0, 32);
    save();
    updateButton();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (state.retry || button.hidden || button.disabled) return;
    const attempt = {answers: {...state.drafts}, at: new Date().toISOString()};
    if (state.first) state.retry = attempt;
    else state.first = attempt;
    state.drafts = {};
    save();
    render();
    result.focus({preventScroll: true});
  });

  root.HarryFractionPractice = {record: () => JSON.parse(JSON.stringify(state))};
  function openLinkedExercise() {
    if (location.hash === '#fraction-practice') panel.open = true;
  }
  root.addEventListener('hashchange', openLinkedExercise);
  openLinkedExercise();
  render();
})(window);
