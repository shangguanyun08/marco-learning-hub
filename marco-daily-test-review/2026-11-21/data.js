(function (root) {
  'use strict';
  const skills = {
    fractionScale: 'Compare multiplication and division by fractions',
    powers: 'Compare products with powers of ten',
    fee: 'Write a fee rule with an included first unit',
    fractionOrder: 'Evaluate a stacked fraction expression',
    slope: 'Find signed slope from intercepts or points'
  };
  const questions = {};
  function add(id, skill, prompt, choices, correct, tip, explanation, extra = {}) {
    questions[id] = {id, skill, prompt, choices, correct, tip, explanation, ...extra};
  }

  add('qr18', 'fractionScale', 'Both a and b are positive. Which expression has the greatest value?',
    ['a/b × 2/3', 'a/b ÷ 2/3', 'a/b × 1/2', 'a/b ÷ 1/2'], 3,
    'Write each division as multiplication by the reciprocal. Compare the factors multiplying the positive fraction a/b.',
    'The four factors are 2/3, 3/2, 1/2, and 2. Since a/b is positive, the largest factor gives the largest result. Dividing by 1/2 doubles a/b.',
    {source:'QR Q18'});
  add('qr37', 'powers', 'Compare the products in Column A and Column B.',
    ['Column A is greater.', 'Column B is greater.', 'The quantities are equal.', 'There is not enough information.'], 2,
    'Multiply the coefficients and add the exponents on each side.',
    'Both products have coefficient 48. The powers of ten have exponents 15 + 12 = 27 and 14 + 13 = 27, so the products are equal.',
    {source:'QR Q37', comparison:['(8 × 10^15)(6 × 10^12)', '(4 × 10^14)(12 × 10^13)']});
  add('ma25', 'fee', 'A garage charges $2.00 for the first hour on Sunday and $0.60 for each additional hour. Which rule gives the total cost T for n whole hours of parking, where n ≥ 1?',
    ['T = 0.6n + 2n', 'T = 0.6n − 2', 'T = 0.6n + 2', 'T = 0.6(n − 1) + 2'], 3,
    'Substitute n = 1. Only the $2.00 first-hour charge should apply.',
    'The initial $2 covers hour 1. The later-hour charge applies to the other n − 1 hours, giving T = 2 + 0.60(n − 1).',
    {source:'MA Q25'});
  add('ma46', 'fractionOrder', 'Evaluate the stacked fraction.',
    ['5/14', '17/24', '1 3/7', '2 5/6'], 3,
    'Treat the long fraction bar as division of the entire numerator by the denominator.',
    'First add 2/3 and 3/4: 8/12 + 9/12 = 17/12. Then divide 17/12 by 1/2 by multiplying by 2. The result is 17/6 = 2 5/6.',
    {source:'MA Q46', stacked:['2/3 + 3/4','1/2']});
  add('ma47', 'slope', 'The line shown crosses the y-axis at 10 and the x-axis at 2. What is its slope?',
    ['−5','−2','2','5'], 0,
    'Start at the y-intercept and move right to the x-intercept. Record the signed change in y.',
    'The intercepts are (0, 10) and (2, 0). Moving right 2 units lowers y by 10, so the slope is (0 − 10) ÷ (2 − 0) = −5.',
    {source:'MA Q47', image:{src:'intercepts.png', alt:'A descending line crosses the vertical axis at 10 and the horizontal axis at 2, shown on equal scales.'}});

  add('r1', 'fractionScale', 'Let w be positive. Which expression produces the smallest value?',
    ['w ÷ 3/4','w × 3/4','w ÷ 1/3','w × 1/3'], 3,
    'Find what fraction or multiple of w each expression represents.',
    'The factors are 4/3, 3/4, 3, and 1/3. The smallest is 1/3.');
  add('e1', 'powers', 'Which product is larger?',
    ['(9 × 10^7)(2 × 10^4)','(4 × 10^8)(6 × 10^3)','The products are equal.','The answer depends on rounding.'], 1,
    'Check the total exponent before comparing coefficients.',
    'Each product has a factor of 10^11. The second product has coefficient 24, compared with 18 for the first.');
  add('c1', 'fee', 'A bike rental costs $9 for the first two hours, plus $4 for every hour beyond those two. Which rule gives the cost C for h whole hours, h ≥ 2?',
    ['C = 9 + 4h','C = 9 + 4(h − 1)','C = 9 + 4(h − 2)','C = 9h + 4'], 2,
    'Evaluate your rule at h = 2 and then at h = 3.',
    'The $9 covers two hours. There are h − 2 extra hours, each costing $4.');
  add('f1', 'fractionOrder', 'Evaluate the stacked fraction.',
    ['1/2','5/8','2 1/2','5'], 2,
    'Add the numerator before dividing by the bottom fraction.',
    '1/4 + 3/8 = 5/8. Then (5/8) ÷ (1/4) = (5/8) × 4 = 5/2.',
    {stacked:['1/4 + 3/8','1/4']});
  add('s1', 'slope', 'A line crosses the y-axis at −6 and the x-axis at 3. What is its slope?',
    ['−2','−1/2','1/2','2'], 3,
    'Turn each intercept into an ordered pair and use the same point order on top and bottom.',
    'The intercepts are (0, −6) and (3, 0). The line rises 6 as x increases by 3, giving 6 ÷ 3 = 2.');
  add('r2', 'fractionScale', 'For positive p, which pair of expressions is always equal?',
    ['p ÷ 2/5 and p × 5/2','p ÷ 2/5 and p × 2/5','p ÷ 2/5 and p ÷ 5/2','p ÷ 2/5 and p × 3/5'], 0,
    'Dividing by a fraction is equivalent to multiplying by its reciprocal.',
    'The reciprocal of 2/5 is 5/2, so both expressions in the first pair have the same value.');
  add('e2', 'powers', 'Compare the two products.',
    ['Column A is greater.','Column B is greater.','The quantities are equal.','There is not enough information.'], 1,
    'Write the products using the same power of ten.',
    'Column A is 81 × 10^7. Column B is 12 × 10^8, or 120 × 10^7. Column B is greater.',
    {comparison:['(9 × 10^3)(9 × 10^4)','(3 × 10^5)(4 × 10^3)']});
  add('c2', 'fee', 'A repair shop charges $36 for the first hour and $18 per additional hour. A job costs $90. How many whole hours did it take?',
    ['3','4','5','7'], 1,
    'Subtract the first-hour charge, then add the included hour back after finding the additional hours.',
    'The $54 beyond the first-hour charge pays for 3 more hours. The job took 4 hours in total.');
  add('f2', 'fractionOrder', 'Evaluate the stacked fraction.',
    ['2/5','3/5','3/4','1 1/5'], 1,
    'Work out the numerator in sixths. Then take the reciprocal of the divisor.',
    '5/6 − 1/3 = 3/6 = 1/2. Dividing by 5/6 gives (1/2) × (6/5) = 3/5.',
    {stacked:['5/6 − 1/3','5/6']});
  add('s2', 'slope', 'A straight line passes through (−2, 9) and (4, 1). What is its slope?',
    ['−4/3','−3/4','3/4','4/3'], 0,
    'Compute the vertical and horizontal changes from the same starting point.',
    'From the first point to the second, y changes by −8 and x changes by 6. The slope is −8/6 = −4/3.');

  const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const fraction = (top, bottom) => '<span class="math-fraction"><span>' + top + '</span><span>' + bottom + '</span></span>';
  function formatMath(text) {
    return escape(text).replace(/(−?\d+)\/(\d+)|\b(a)\/(b)\b/g, (_, n, d, a, b) => fraction(n ?? a, d ?? b))
      .replace(/10\^(?:\(([^()]+)\)|([\da-z]+))/g, (_, expression, exponent) => '10<sup>' + (expression ?? exponent) + '</sup>');
  }
  function questionVisual(q) {
    if (q.stacked) return '<div class="stacked-expression">' + fraction(...q.stacked.map(formatMath)) + '</div>';
    if (q.comparison) return '<div class="table-wrap"><table class="result-table"><thead><tr><th scope="col">Column A</th><th scope="col">Column B</th></tr></thead><tbody><tr>' +
      q.comparison.map(value => '<td>' + formatMath(value) + '</td>').join('') + '</tr></tbody></table></div>';
    if (q.image) return '<figure class="intercept-plot"><img src="' + escape(q.image.src) + '" alt="' + escape(q.image.alt) + '" width="420" height="300"></figure>';
    return '';
  }
  const data = {
    appId:'marco-math-nov21-official-middle-v1', session:'official-middle-nov21-review-v1',
    title:'November 21 · Official Middle QR + MA Review', groupSize:5, skills, questions,
    nextSteps:{
      fractionScale:'Write each operation as a factor of the same positive amount before comparing.',
      powers:'Compare the total exponent and coefficient after writing both products in the same form.',
      fee:'Check the formula at the number of hours covered by the initial charge.',
      fractionOrder:'Evaluate the full numerator, then multiply by the reciprocal of the bottom fraction.',
      slope:'Write both points and compute the signed rise and run in the same order.'
    },
    // Keep the original bank valid for saved attempts from the earlier combined set.
    ids:Object.keys(questions).filter(id => questions[id].source),
    showSkillReport:false,
    downloadName:'marco-2026-11-21-qr-ma-review.json', formatMath, questionVisual
  };
  root.MarcoMA5Practice = data;
  root.MarcoQR4Data = data;
})(typeof window === 'undefined' ? globalThis : window);
