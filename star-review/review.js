(function () {
  "use strict";
  const data = window.STAR_REVIEW;
  const evidence = window.STAR_REVIEW_EVIDENCE || [];
  const wrong = data.questions.filter(q => q.selected !== q.correct);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const text = value => esc(value).replace(/\b(\d+)\/(\d+)\b/g, '<span class="fraction" aria-label="$1 over $2"><span>$1</span><span>$2</span></span>');
  const time = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  document.querySelector("#title").textContent = `STAR ${data.subject} · ${data.dateLabel}`;
  document.querySelector("#summary").innerHTML = `<div><strong>${data.questions.length}</strong><span>questions</span></div><div><strong>${data.questions.length-wrong.length}</strong><span>correct choices</span></div><div><strong>${wrong.length}</strong><span>wrong choices</span></div>`;
  document.querySelector("#review-note").textContent = `Recorded and reviewed ${data.dateLabel}. Results below compare Harry’s final visible choices with independently checked answers; they are not an official STAR score.${data.questions.some(q=>q.timeout) ? " Q10 has a timeout note." : ""}`;
  document.querySelector("#all-filter").textContent = `All questions (${data.questions.length})`;
  document.querySelector("#wrong-filter").textContent = `Wrong only (${wrong.length})`;
  document.querySelector("#questions").innerHTML = data.questions.map(q => {
    const incorrect = q.selected !== q.correct;
    const record = evidence.find(e => e.number === q.number);
    const image = `./images/q${String(q.number).padStart(2,"0")}.webp`;
    const choices = q.choices.map((choice,index) => `<li class="${index===q.selected ? "chosen" : ""} ${index===q.correct ? "right-choice" : ""} ${index===q.selected&&incorrect ? "wrong-choice" : ""}"><span class="letter">${data.labels[index]}</span><span>${text(choice)}</span><span class="choice-tags">${index===q.selected ? '<b>Harry’s choice</b>' : ''}${index===q.correct ? '<b>✓ Correct answer</b>' : ''}</span></li>`).join("");
    return `<article id="q${q.number}" class="review-question ${incorrect?'incorrect':'correct'}" data-result="${incorrect?'wrong':'correct'}" aria-labelledby="heading-${q.number}">
      <header><h2 id="heading-${q.number}">Question ${q.number}</h2><span class="result ${incorrect?'wrong':'right'}">${incorrect?'✗ Wrong':'✓ Correct'}${q.timeout?' choice · timeout':''}</span></header>
      ${q.passage?`<div class="passage">${esc(q.passage).replace(/\n/g,'<br>')}</div>`:''}
      <p class="question-prompt">${text(q.prompt)}</p>
      ${q.diagram?`<figure><a href="${image}" target="_blank" rel="noopener" aria-label="Enlarge original diagram for question ${q.number}"><img src="${image}" alt="Original question ${q.number} diagram and answer choices, with Harry’s recorded choice highlighted" loading="lazy"></a><figcaption>Original diagram · tap to enlarge</figcaption></figure>`:''}
      <ol class="answer-choices">${choices}</ol>
      <div class="explanation"><strong>${incorrect?'Let’s review':'Why this is correct'}</strong><p>${text(q.explanation)}</p></div>
      ${q.note?`<p class="record-note">${esc(q.note)}</p>`:''}
      <details class="evidence"><summary>View original recording frame${record?` · ${time(record.time)}`:''}</summary><a href="${image}" target="_blank" rel="noopener"><img src="${image}" alt="Recorded question ${q.number}, showing Harry’s final selected option ${data.labels[q.selected]}" loading="lazy"></a><p>Tap the image to enlarge. ${record?`Video position: ${time(record.time)}. `:''}The highlighted option in this frame is Harry’s recorded choice.</p></details>
    </article>`;
  }).join("");
  const allButton=document.querySelector("#all-filter"), wrongButton=document.querySelector("#wrong-filter");
  function filter(onlyWrong) {
    const visible = onlyWrong ? wrong : data.questions;
    document.querySelectorAll(".review-question").forEach(card=>{card.hidden=onlyWrong&&card.dataset.result!=="wrong";});
    allButton.setAttribute("aria-pressed",String(!onlyWrong));wrongButton.setAttribute("aria-pressed",String(onlyWrong));
    document.querySelector("#visible-count").textContent=`Showing ${visible.length} of ${data.questions.length} questions${onlyWrong?' · wrong answers only':''}`;
    document.querySelector("#jump-links").innerHTML=visible.map(q=>`<a href="#q${q.number}" class="${q.selected!==q.correct?'wrong':''}" aria-label="Question ${q.number}, ${q.selected!==q.correct?'wrong':'correct'}">${q.number}</a>`).join('');
    document.querySelector("#empty").hidden=visible.length!==0;
    const url=new URL(location.href);if(onlyWrong)url.searchParams.set('filter','wrong');else url.searchParams.delete('filter');history.replaceState(null,'',url);
  }
  allButton.addEventListener('click',()=>filter(false));wrongButton.addEventListener('click',()=>filter(true));
  document.querySelector('#large-text').addEventListener('click',event=>{const large=document.body.classList.toggle('large-text');event.currentTarget.setAttribute('aria-pressed',String(large));});
  filter(new URLSearchParams(location.search).get('filter')==='wrong');
})();
