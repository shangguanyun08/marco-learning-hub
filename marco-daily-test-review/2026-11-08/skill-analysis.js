(function (root) {
  'use strict';
  const D = root.MarcoMA5Practice;
  const E = root.MarcoQR4Engine;
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const questionLink = id => `<a href="#q-${id}">Q${D.ids.indexOf(id) + 1} · ${escape(D.questions[id].focus)}</a>`;
  const nextSteps = {
    signed: 'Use a fresh height or temperature question later to check retention.',
    formula: 'Keep each subtraction sign when substituting. Include a question about how changing one input changes the output.',
    triangle: 'Recheck a rotated triangle and an exterior-angle question later.',
    charges: 'Separate the base fee, mileage or weight, and extra-item charges. Distinguish additional passengers from total passengers, and a total cost difference from the charge for each extra item.',
    dependence: 'Ask whether the first action changes the contents for the next draw. After removal, update both the favourable count and the total. Mix verbal independent/dependent questions with probability calculations.',
    symmetry: 'Test each possible reflection against the shading, including the diagonal lines.',
    direction: 'Follow the stated movement of x first. Decide whether y rises or falls, then compare greatest or smallest rates among the functions that move in the required direction.',
  };

  function ready(state) {
    return E.stats(state).answered >= (D.reportAfterAnswered || D.ids.length);
  }

  function assessment(stats) {
    if (!stats.answered) return 'Not checked yet.';
    if (stats.first === stats.answered) return stats.complete ? 'Strong on these four questions.' : `All answered questions are correct, with ${stats.total - stats.answered} unanswered.`;
    if (stats.first / stats.answered < 0.5) return 'Priority practice.';
    if (stats.corrected === stats.wrong) return 'Corrected on the second try. Confirm with a fresh check.';
    return 'Needs targeted practice.';
  }

  function render(state, id = 'skill-results') {
    const total = E.stats(state);
    const unanswered = D.ids.filter(question => !E.attempts(state, question).length);
    const skills = Object.entries(D.skills).map(([key, name]) => {
      const ids = D.ids.filter(question => D.questions[question].skill === key);
      return {
        key, name, stats: E.stats(state, key),
        missed: ids.filter(question => E.attempts(state, question)[0] && !E.attempts(state, question)[0].correct),
        unanswered: ids.filter(question => !E.attempts(state, question).length),
      };
    });
    const priorities = skills.filter(skill => skill.stats.wrong > 0)
      .sort((a, b) => a.stats.first / a.stats.answered - b.stats.first / b.stats.answered || b.stats.wrong - a.stats.wrong)
      .slice(0, 3);
    const strengths = skills.filter(skill => skill.stats.answered >= 3 && !skill.stats.wrong);
    const pending = unanswered.length ? `<p class="unanswered-note">${unanswered.length} unanswered ${unanswered.length === 1 ? 'question remains' : 'questions remain'} · ${unanswered.map(question => questionLink(question)).join(' · ')}. These questions have no recorded result.</p>` : '';
    return `<section class="panel skill-analysis" id="${id}" aria-labelledby="${id}-heading">
      <p class="analysis-status">${total.complete ? 'First pass finished' : 'Finished for now'} · ${total.answered}/${total.total} questions answered</p>
      <h2 id="${id}-heading">Skill analysis · ${total.first}/${total.answered} correct first try · ${Math.round(total.first / total.answered * 100)}%</h2>
      <p>${total.wrong} first-try misses · ${total.corrected} corrected on a second try · ${total.wrong - total.corrected} still incorrect. First-try scores keep the original answers.</p>
      ${pending}
      <div class="table-wrap"><table class="result-table skill-table">
        <thead><tr><th scope="col">Skill</th><th scope="col">First try</th><th scope="col">Corrected on second try</th><th scope="col">Assessment and questions</th></tr></thead>
        <tbody>${skills.map(skill => `<tr class="${!skill.stats.wrong ? 'strong' : 'needs'}" data-skill="${skill.key}">
          <th scope="row">${escape(skill.name)}</th>
          <td>${skill.stats.answered ? skill.stats.first + '/' + skill.stats.answered : '—'}${skill.unanswered.length ? `<small>${skill.unanswered.length} unanswered</small>` : ''}</td>
          <td>${skill.stats.wrong ? skill.stats.corrected + '/' + skill.stats.wrong + ' first misses' : '—'}</td>
          <td><p>${assessment(skill.stats)}</p>${skill.missed.map(question => questionLink(question)).join('<br>')}${skill.unanswered.length ? `<p class="pending-questions">Still unanswered<br>${skill.unanswered.map(question => questionLink(question)).join('<br>')}</p>` : ''}</td>
        </tr>`).join('')}</tbody>
      </table></div>
      ${priorities.length ? `<div class="skill-priorities"><h3>Practice priorities</h3><ol>${priorities.map(skill => `<li><strong>${escape(skill.name)} · ${skill.stats.first}/${skill.stats.answered} first try</strong><p>${nextSteps[skill.key]}</p></li>`).join('')}</ol></div>` : ''}
      ${strengths.length ? `<p class="skill-strengths"><strong>Stronger on this check</strong> · ${strengths.map(skill => `${escape(skill.name)} (${skill.stats.first}/${skill.stats.answered}${skill.unanswered.length ? ' answered' : ''})`).join(' · ')}.</p>` : ''}
      <p class="analysis-caution">Each skill has four questions in this follow-up. A delayed check with fresh questions will help confirm retention.</p>
    </section>`;
  }

  root.MarcoMA5SkillAnalysis = { ready, render };
})(typeof window === 'undefined' ? globalThis : window);
