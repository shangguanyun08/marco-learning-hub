(function () {
  "use strict";
  const questions = window.STAR_REVIEW.questions;
  const make = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };
  const skills = [...new Set(questions.map(q => q.skill))];
  for (const skill of skills) {
    const group = questions.filter(q => q.skill === skill);
    const missed = group.filter(q => q.selected !== q.correct);
    const row = document.createElement("tr");
    row.append(make("td", skill), make("td", `${group.length - missed.length} / ${group.length}`));
    const links = document.createElement("td");
    if (!missed.length) links.textContent = "None in this set";
    missed.forEach(q => { const a = make("a", `Q${q.number}`); a.href = `#q${q.number}`; links.append(a); });
    row.append(links); document.querySelector("#skill-results").append(row);
  }
  for (const q of questions) {
    const card = document.querySelector(`#q${q.number}`);
    const label = make("p", q.skill); label.className = "question-skill";
    card.querySelector("header").after(label);
    if (q.table) {
      const table = document.createElement("table"); table.className = "comparison-table";
      table.append(make("caption", "Comparison chart from the question"));
      const head = document.createElement("thead"), row = document.createElement("tr");
      q.table.headers.forEach(text => { const th = make("th", text); th.scope = "col"; row.append(th); });
      head.append(row); table.append(head);
      const body = document.createElement("tbody");
      q.table.rows.forEach(cells => { const tr = document.createElement("tr"); cells.forEach(text => tr.append(make("td", text))); body.append(tr); });
      table.append(body); card.querySelector(".question-prompt").before(table);
    }
  }
})();
