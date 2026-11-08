(() => {
  'use strict';
  const data = window.MarcoMA5Review;
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const letter = index => 'ABCD'[index];
  const table = value => `<div class="table-wrap"><table class="result-table"><caption>Four taxi rides</caption><thead><tr>${value.headers.map(h => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${value.rows.map(row => `<tr>${row.map(cell => `<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  document.querySelector('.jump').innerHTML = data.questions.map(q => `<a href="#q${q.number}">Q${q.number}</a>`).join('');
  document.querySelector('#questions').innerHTML = data.questions.map(q => `<article class="question" id="q${q.number}">
    <header><h3>Original Q${q.number}</h3><span class="source">${escape(q.subtype)} · ${escape(q.difficulty)} · Marco: ${q.seconds} sec</span></header>
    <p class="prompt">${escape(q.prompt)}</p>
    ${q.image ? `<figure class="diagram"><img src="${escape(q.image)}" alt="${escape(q.alt)}"><figcaption>Original test diagram</figcaption></figure>` : ''}
    ${q.table ? table(q.table) : ''}
    <ol class="review-options" aria-label="Answer choices">${q.choices.map((choice, i) => `<li data-choice="${i}"><span class="letter">${letter(i)}</span><span>${escape(choice)}</span></li>`).join('')}</ol>
    <div class="answer-actions"><button type="button" class="reveal-button" data-toggle="choice" data-question="${q.number}" aria-expanded="false" aria-controls="choice-${q.number}">Show Marco’s recorded choice</button><button type="button" class="reveal-button" data-toggle="solution" data-question="${q.number}" aria-expanded="false" aria-controls="solution-${q.number}">Show correct answer & trick</button></div>
    <p id="choice-${q.number}" class="recorded-choice" hidden><strong>Marco chose ${letter(q.chosen)} · ${escape(q.choices[q.chosen])}</strong><br>Incorrect in the original mock test.</p>
    <div id="solution-${q.number}" class="solution" hidden><h4>Answer: ${letter(q.correct)} · ${escape(q.choices[q.correct])}</h4><p class="trick"><strong>Key trick:</strong> ${q.trick}</p><p>${escape(q.explanation)}</p><p class="inference"><strong>Possible reason for this miss:</strong> ${escape(q.inference)}</p></div>
  </article>`).join('');
  document.querySelector('#history-analysis').innerHTML = data.questions.map(q => `<article class="analysis" id="history-q${q.number}"><h3>Q${q.number} · ${escape(q.title)}</h3><p class="history-class">${escape(q.classification)}</p><ul>${q.history.map(item => `<li>${escape(item)}</li>`).join('')}</ul><p class="next-check"><strong>Next check</strong>${escape(q.next)}</p><div class="history-links">${q.links.map(([label, href]) => `<a href="${escape(href)}">${escape(label)}</a>`).join('')}<a href="#q${q.number}">View original Q${q.number}</a></div></article>`).join('');
  function selectView(view) {
    const analysis = view === 'analysis';
    document.querySelector('#review').hidden = analysis;
    document.querySelector('#analysis').hidden = !analysis;
    for (const a of document.querySelectorAll('[data-view]')) {
      if (a.dataset.view === (analysis ? 'analysis' : 'review')) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
  }
  function fromHash() {
    selectView(/^#(?:analysis|history-)/.test(location.hash) ? 'analysis' : 'review');
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-toggle]');
    if (!button) return;
    const q = data.questions.find(item => item.number === Number(button.dataset.question));
    const kind = button.dataset.toggle;
    const panel = document.getElementById(`${kind}-${q.number}`);
    panel.hidden = !panel.hidden;
    button.setAttribute('aria-expanded', String(!panel.hidden));
    button.textContent = kind === 'choice' ? `${panel.hidden ? 'Show' : 'Hide'} Marco’s recorded choice` : `${panel.hidden ? 'Show' : 'Hide'} correct answer & trick`;
    document.querySelector(`#q${q.number} [data-choice="${kind === 'choice' ? q.chosen : q.correct}"]`).classList.toggle(kind === 'choice' ? 'is-wrong' : 'is-correct', !panel.hidden);
  });
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
