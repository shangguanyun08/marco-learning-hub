(() => {
  'use strict';

  const course = window.MarcoQR4Data;
  const engine = window.MarcoQR4Engine;
  const review = course.number === 1;
  const params = new URLSearchParams(location.search);
  const demo = params.has('demo');
  const local = demo || ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
  const storageKey = course.appId + (local ? ':preview' : '');
  const skills = {
    organization: 'Organization / Logic',
    tone: 'Tone / Style / Figurative Language'
  };
  const letters = 'ABCD';
  const questionList = document.querySelector('#questions');
  const jumpList = document.querySelector('#question-jump');
  const saveNote = document.querySelector('#save-note');
  const articles = new Map();
  const jumps = new Map();
  let storageOK = true;
  let sync = null;
  let state = engine.empty();

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (engine.valid(saved)) state = saved;
  } catch {
    storageOK = false;
  }

  function updateStatus(kind, message) {
    saveNote.dataset.kind = storageOK ? kind : 'offline';
    saveNote.textContent = storageOK ? message : 'Device storage is unavailable. Keep this page open while you work.';
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      storageOK = true;
    } catch {
      storageOK = false;
    }
    updateStatus(storageOK ? 'local' : 'offline', 'Progress saved on this device.');
  }

  function escapeHTML(text) {
    const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
    return text.replace(/[&<>"']/g, character => entities[character]);
  }

  function formatPassage(paragraphs, showClue) {
    return paragraphs.map(paragraph => {
      const safe = escapeHTML(paragraph).replace(/\[\[([^\]]+)\]\]/g, (_, clue) => showClue ? `<mark>${clue}</mark>` : clue);
      return `<p>${safe}</p>`;
    }).join('');
  }

  function answerStatus(attempts) {
    if (attempts.length === 0) return 'pending';
    if (attempts.some(attempt => attempt.correct)) return 'correct';
    return attempts.length === 1 ? 'retry' : 'missed';
  }

  function renderQuestion(id) {
    const question = course.questions[id];
    const attempts = engine.attempts(state, id);
    const last = attempts.at(-1);
    const revealed = engine.reveal(state, id);
    const result = answerStatus(attempts);
    const article = articles.get(id);
    const selected = article.querySelector('input:checked:not(:disabled)')?.value;
    const title = question.mock ? `Mock #${question.mock} · ${question.title}` : question.title;
    const num = question.mock || course.ids.indexOf(id) + 1;
    const resultText = {
      pending: '',
      retry: 'Try once more. Reread the passage and choose a different answer.',
      correct: attempts.length === 1 ? 'Correct on the first try.' : 'Corrected on the second try.',
      missed: 'Read the explanation below, then try the same skill on a new passage.'
    };

    article.innerHTML = `
      <header><h3 id="title-${id}">${escapeHTML(title)}</h3><span class="source">${escapeHTML(skills[question.skill])}</span></header>
      <div class="reading-passage" aria-label="Passage">${formatPassage(question.passage, question.skill === 'organization' && (review || revealed))}</div>
      <form data-question="${id}">
        <fieldset class="choices">
          <legend class="prompt">${escapeHTML(question.prompt)}</legend>
          ${question.choices.map((choice, index) => {
            const wrong = attempts.some(attempt => attempt.choice === index && !attempt.correct);
            const className = revealed && index === question.correct ? ' correct' : wrong ? ' wrong' : '';
            const checked = revealed ? last?.choice === index : selected === String(index) && !wrong;
            return `<label class="choice${className}">
              <input type="radio" name="${id}" value="${index}" ${checked ? 'checked' : ''} ${revealed || wrong ? 'disabled' : ''}>
              <span class="letter">${letters[index]}.</span><span>${escapeHTML(choice)}</span>
            </label>`;
          }).join('')}
        </fieldset>
        ${revealed ? '' : `<button class="primary" type="submit">${last ? 'Check second try' : 'Check answer'}</button>`}
        <p class="feedback" data-result="${result}" tabindex="-1" role="status">${resultText[result]}</p>
      </form>
      ${revealed ? `<p class="reading-explanation"><strong>Answer ${letters[question.correct]}.</strong> ${escapeHTML(question.explanation)}</p>` : ''}`;

    const jump = jumps.get(id);
    jump.dataset.result = result;
    const jumpStatus = {pending: 'unanswered', retry: 'second try available', correct: 'correct', missed: 'review explanation'};
    jump.setAttribute('aria-label', `${review ? 'Mock question' : 'Question'} ${num}, ${jumpStatus[result]}`);
  }

  function renderResults() {
    const overall = engine.stats(state);
    const percent = score => Math.round(100 * score.first / score.total);
    document.querySelector('#overall-score').textContent = overall.complete
      ? `Complete · ${overall.first}/${overall.total} (${percent(overall)}%) first try`
      : `${overall.answered} of ${overall.total} answered`;
    document.querySelector('#skill-scores').innerHTML = Object.entries(skills).map(([key, label]) => {
      const score = engine.stats(state, key);
      const summary = score.complete
        ? `${score.first}/${score.total} · ${percent(score)}%`
        : `${score.first} correct · ${score.answered}/${score.total} answered`;
      return `<section><h4>${escapeHTML(label)}</h4><p><strong>${summary}</strong> first try</p>
        ${score.corrected ? `<p class="corrections">${score.corrected} corrected on the second try</p>` : ''}</section>`;
    }).join('');
  }

  function sessionLink(number) {
    return `?session=${number}${demo ? '&demo=1' : ''}`;
  }

  function setup() {
    if (!review) {
      document.querySelector('#session-heading').textContent = 'Session 2 · Practice both skills';
      document.querySelector('#session-intro').textContent = 'Read each short passage and answer one question. Your first answers count toward the two skill scores. A miss gets one second try.';
    }
    for (const tab of document.querySelectorAll('.reading-sessions [data-session]')) {
      tab.href = sessionLink(tab.dataset.session);
      if (Number(tab.dataset.session) === course.number) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    }
    const otherSession = document.querySelector('#other-session');
    otherSession.href = sessionLink(review ? 2 : 1);
    otherSession.textContent = review ? 'Open Session 2' : 'Open Session 1';

    for (const [index, id] of course.ids.entries()) {
      const article = document.createElement('article');
      article.className = 'question';
      article.id = `item-${id}`;
      article.setAttribute('aria-labelledby', `title-${id}`);
      questionList.append(article);
      articles.set(id, article);

      const jump = document.createElement('a');
      jump.href = `#item-${id}`;
      jump.textContent = course.questions[id].mock || index + 1;
      jumpList.append(jump);
      jumps.set(id, jump);
      renderQuestion(id);
    }
    renderResults();
  }

  questionList.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;
    const id = form.dataset.question;
    const choice = form.querySelector('input:checked:not(:disabled)');
    if (!choice) {
      form.querySelector('.feedback').textContent = 'Choose an answer first.';
      return;
    }
    if (engine.submit(state, id, Number(choice.value))) {
      save();
      renderQuestion(id);
      renderResults();
      articles.get(id).querySelector('.feedback').focus({preventScroll: true});
      void sync?.push();
    }
  });

  setup();
  if (local) {
    updateStatus('local', 'Progress saved on this device.');
  } else {
    sync = window.MarcoQR4Sync.create({
      getState: () => state,
      onRemote(next) {
        const previous = state;
        state = next;
        save();
        for (const id of course.ids) {
          if (JSON.stringify(engine.attempts(previous, id)) !== JSON.stringify(engine.attempts(state, id))) renderQuestion(id);
        }
        renderResults();
      },
      onStatus: updateStatus
    });
    void sync.start();
  }
})();
