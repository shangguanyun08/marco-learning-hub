(function (root) {
  'use strict';
  const review = root.MarcoMA5Practice;
  const questions = {};
  function add(id, skill, focus, prompt, choices, correct, tip, explanation, extra = {}) {
    questions[id] = {id, skill, focus, prompt, choices, correct, tip, explanation, ...extra};
  }

  add('scale-1', 'fractionScale', 'Compare two divisors below 1',
    'Let k be positive. Which expression has the greatest value?',
    ['k × 3/5', 'k ÷ 3/5', 'k × 5/8', 'k ÷ 5/8'], 1,
    'Compare the factors 3/5, 5/3, 5/8, and 8/5.',
    'The multiplication choices shrink k. Dividing by 3/5 multiplies k by 5/3, which is greater than 8/5 because 25/15 > 24/15.');
  add('power-1', 'powers', 'Check the coefficient and the exponent',
    'Compare the products in Column A and Column B.',
    ['Column A is greater.', 'Column B is greater.', 'They are equal.', 'There is not enough information.'], 2,
    'Work out the two coefficient products and the two exponent sums.',
    'Column A is 42 × 10^12. Column B is also 42 × 10^12.',
    {comparison:['(6 × 10^8)(7 × 10^4)', '(3 × 10^9)(14 × 10^3)']});
  add('fee-1', 'fee', 'Write a rule for minutes beyond an included block',
    'A kayak rental costs $12 for the first 30 minutes and $0.50 for each extra minute. Which rule gives the total cost C for m minutes, where m is a whole number at least 30?',
    ['C = 12 + 0.50(m − 30)', 'C = 12 + 0.50m', 'C = 0.50(m − 30)', 'C = 12 + 0.50(m − 1)'], 0,
    'At m = 30, the extra-minute charge should be zero.',
    'The $12 already covers 30 minutes. Only m − 30 minutes are billed at $0.50 each.');
  add('stack-1', 'fractionOrder', 'Add the numerator, then divide',
    'Evaluate the stacked fraction.',
    ['19/72', '19/24', '8/19', '19/8'], 3,
    'Find a common denominator for the sum on top before using the reciprocal.',
    '5/8 + 1/6 = 15/24 + 4/24 = 19/24. Dividing by 1/3 multiplies the sum by 3, giving 19/8.',
    {stacked:['5/8 + 1/6', '1/3']});
  add('slope-1', 'slope', 'Find slope from the two axis crossings',
    'A line crosses the vertical axis at 14 and the horizontal axis at 4. What is its slope?',
    ['7/2', '−7/2', '−2/7', '−4'], 1,
    'Write the two intercepts as (0, 14) and (4, 0).',
    'From (0, 14) to (4, 0), the rise is −14 and the run is 4. The slope is −14/4 = −7/2.');

  add('scale-2', 'fractionScale', 'Rewrite division using the reciprocal',
    'Which expression equals m ÷ 4/7 for every positive m?',
    ['m × 7/4', 'm × 4/7', 'm ÷ 7/4', 'm × 3/7'], 0,
    'Find the reciprocal of the divisor.',
    '4/7 × 7/4 = 1, so division by 4/7 is multiplication by 7/4.');
  add('power-2', 'powers', 'Normalize a product to scientific notation',
    'Write (8 × 10^6)(5 × 10^5) in scientific notation.',
    ['4 × 10^10', '4 × 10^11', '4 × 10^13', '4 × 10^12'], 3,
    'After multiplying, move one factor of ten from the coefficient into the power of ten.',
    '8 × 5 = 40 and 6 + 5 = 11. Then 40 × 10^11 = 4 × 10^12.');
  add('fee-2', 'fee', 'Recover total units from the bill',
    'A package costs $40 for the first three lessons. Each additional lesson costs $9. A family pays $85. How many lessons did they buy?',
    ['5', '7', '8', '10'], 2,
    'Find the extra lessons, then include the lessons covered by the package.',
    '$85 − $40 = $45, which pays for 5 additional lessons. Adding the 3 included lessons gives 8.');
  add('stack-2', 'fractionOrder', 'Subtract fractions before dividing',
    'Evaluate the stacked fraction.',
    ['3/16', '25/12', '5/8', '12/25'], 1,
    'Subtract in eighths, then divide by 3/10.',
    '7/8 − 1/4 = 5/8. Then (5/8) ÷ (3/10) = (5/8) × (10/3) = 25/12.',
    {stacked:['7/8 − 1/4', '3/10']});
  add('slope-2', 'slope', 'Calculate rise per unit of run from a table',
    'The table gives three points on a line. What is the slope?',
    ['3/2', '2/3', '6', '−3/2'], 0,
    'Check how much x changes between rows as well as how much y changes.',
    'From the first row to the second, y rises by 6 and x increases by 4. The slope is 6/4 = 3/2.',
    {table:{headers:['x', 'y'], rows:[['−3','−2'], ['1','4'], ['5','10']]}});

  add('scale-3', 'fractionScale', 'Use fraction division to count servings',
    'A pitcher contains 2 1/4 liters. One serving is 3/8 liter. How many full servings can be poured?',
    ['3', '4', '5', '6'], 3,
    'Divide the amount you have by the size of one serving.',
    '2 1/4 liters is 18/8 liters. Each serving uses 3/8 liter, so there are 18 ÷ 3 = 6 servings.');
  add('power-3', 'powers', 'Compare products after adjusting the powers',
    'Compare the products in Column A and Column B.',
    ['Column A is greater.', 'Column B is greater.', 'They are equal.', 'There is not enough information.'], 0,
    'Write both products in scientific notation before comparing.',
    'Column A is 6 × 10^9. Column B is 72 × 10^7 = 7.2 × 10^8. In units of 10^8, the results are 60 and 7.2.',
    {comparison:['(2 × 10^5)(3 × 10^4)', '(9 × 10^3)(8 × 10^4)']});
  add('fee-3', 'fee', 'Recover the first-hour fee from two bills',
    'A studio has one price for the first hour and a fixed rate for each hour after that. Three hours cost $19.50, and five hours cost $28.50. What is the price for the first hour?',
    ['$4.50', '$10.50', '$15.00', '$19.50'], 1,
    'Two extra hours account for the difference between the two bills.',
    'The difference is $9 for two hours, so each extra hour costs $4.50. The three-hour bill includes two extra hours. Subtract $9 from $19.50 to get $10.50.');
  add('stack-3', 'fractionOrder', 'Simplify a sum in the denominator',
    'Evaluate the stacked fraction.',
    ['7/144', '7/12', '1', '12/7'], 2,
    'Evaluate the whole expression below the long bar.',
    'The denominator is 1/3 + 1/4 = 4/12 + 3/12 = 7/12. The numerator and denominator are equal, so the quotient is 1.',
    {stacked:['7/12', '1/3 + 1/4']});
  add('slope-3', 'slope', 'Use slope to find a missing coordinate',
    'A line with slope −3/2 passes through (2, 5) and (8, y). What is y?',
    ['−9', '−1', '14', '−4'], 3,
    'Multiply the slope by the change in x to get the change in y.',
    'The run is 8 − 2 = 6. The rise is (−3/2) × 6 = −9. Starting from 5, the new y-value is 5 − 9 = −4.');

  add('scale-4', 'fractionScale', 'Predict the effect of a divisor above or below 1',
    'For a positive number x, which statement is true?',
    ['Both x ÷ 5/4 and x ÷ 5/6 are greater than x.',
      'Both x ÷ 5/4 and x ÷ 5/6 are less than x.',
      'x ÷ 5/4 is less than x, and x ÷ 5/6 is greater than x.',
      'x ÷ 5/4 is greater than x, and x ÷ 5/6 is less than x.'], 2,
    'Compare each reciprocal with 1.',
    'Dividing by 5/4 scales x by 4/5, which is below 1. Dividing by 5/6 scales x by 6/5, which is above 1.');
  add('power-4', 'powers', 'Find the missing exponent after normalizing',
    'If (4 × 10^7)(3 × 10^k) = 1.2 × 10^13, what is k?',
    ['5', '6', '7', '12'], 0,
    'The coefficient product is 12. Rewrite 12 as 1.2 × 10.',
    'The left side is 12 × 10^(7 + k) = 1.2 × 10^(8 + k). Set 8 + k = 13 to get k = 5.');
  add('fee-4', 'fee', 'Compare two plans with different included time',
    'Plan A costs $15 for the first two hours and $3 per extra hour. Plan B costs $10 for the first hour and $4 per extra hour. For five hours, which plan costs less, and by how much?',
    ['Plan A, by $1', 'Plan A, by $2', 'Plan B, by $2', 'Plan B, by $5'], 1,
    'Count the extra hours separately for each plan.',
    'Plan A costs $15 + 3 × $3 = $24. Plan B costs $10 + 4 × $4 = $26. Plan A costs $2 less.');
  add('stack-4', 'fractionOrder', 'Simplify both halves of a stacked expression',
    'Evaluate the stacked fraction.',
    ['11/36', '11/12', '4/11', '11/4'], 3,
    'Simplify the top and bottom independently, then divide.',
    'The numerator is 2/3 + 1/4 = 11/12. The denominator is 5/6 − 1/2 = 1/3. Dividing by 1/3 gives (11/12) × 3 = 11/4.',
    {stacked:['2/3 + 1/4', '5/6 − 1/2']});
  add('slope-4', 'slope', 'Match the same signed slope in two representations',
    'One line crosses the y-axis at 8 and the x-axis at 6. Which pair of points determines a line with the same slope?',
    ['(−1, 1) and (2, 5)', '(−1, 5) and (3, 2)', '(−1, 5) and (2, 1)', '(−1, 5) and (2, 2)'], 2,
    'Compute the intercept line’s slope and compare it with each pair’s rise divided by run.',
    'The intercept line has slope (0 − 8) ÷ (6 − 0) = −4/3. The pair (−1, 5), (2, 1) also falls 4 while moving right 3.');

  const data = {
    appId:'marco-math-nov21-session1-v1',
    session:'official-middle-nov21-session1-v1',
    title:'November 21 · Session 1 · Five Skills',
    groupSize:5,
    skills:review.skills,
    nextSteps:review.nextSteps,
    formatMath:review.formatMath,
    questionVisual:review.questionVisual,
    questions,
    ids:Object.keys(questions),
    masteryCheck:true,
    downloadName:'marco-2026-11-21-session-1.json'
  };
  root.MarcoMA5Practice = data;
  root.MarcoQR4Data = data;
})(typeof window === 'undefined' ? globalThis : window);
