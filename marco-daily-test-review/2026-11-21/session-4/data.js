(function (root) {
  'use strict';
  const questions = {};
  function add(id, skill, focus, prompt, choices, correct, tip, explanation, extra = {}) {
    questions[id] = {id, skill, focus, prompt, choices, correct, tip, explanation, ...extra};
  }

  add('slope-1', 'slope', 'Find signed slope from two intercepts',
    'A line crosses the y-axis at −6 and the x-axis at 9. What is its slope?',
    ['−2/3', '3/2', '2/3', '−3/2'], 2,
    'Write the two intercepts as ordered pairs before finding the rise and run.',
    'From (0, −6) to (9, 0), y rises by 6 and x increases by 9. The slope is 6/9 = 2/3.');
  add('scale-1', 'fractionScale', 'Combine division and multiplication by fractions',
    'A positive number n is divided by 3/5. The result is then multiplied by 1/2. What is the final value?',
    ['n × 5/6', 'n × 3/10', 'n × 6/5', 'n × 5/3'], 0,
    'Use the reciprocal of the divisor. Keep the multiplier 1/2 as written.',
    'Dividing by 3/5 multiplies n by 5/3. Then multiplying by 1/2 gives a combined factor of (5/3) × (1/2) = 5/6.');
  add('slope-2', 'slope', 'Use two intercepts to find a missing y-coordinate',
    'A line crosses the x-axis at −4 and the y-axis at 12. What is its y-coordinate when x = 2?',
    ['12', '6', '−6', '18'], 3,
    'Find the slope from the intercepts, then start at (0, 12) and move right by 2 units.',
    'From (−4, 0) to (0, 12), the slope is 12/4 = 3. Moving 2 units right from (0, 12) adds 6 to y. The result is 18.');
  add('fee-1', 'fee', 'Find when plans with included time cost the same',
    'Plan A costs $21 for the first three hours plus $7 for each extra hour. Plan B costs $30 for the first three hours plus $4 for each extra hour. At how many total hours will the plans cost the same?',
    ['3', '6', '9', '12'], 1,
    'Find how many extra hours close the starting gap. Then include the hours covered by the base prices.',
    'Plan A starts $9 cheaper. Every extra hour closes the gap by $3, so the prices match after 3 extra hours. With the included 3 hours, that is 6 total hours.');
  add('slope-3', 'slope', 'Match the slopes of two pairs of points',
    'A line passes through (−2, 7) and (4, −2). Which other pair of points lies on a line with the same slope?',
    ['(1, 4) and (5, −2)', '(1, 4) and (7, 0)', '(1, 4) and (5, 10)', '(1, 4) and (5, 1)'], 0,
    'Find change in y divided by change in x for the first line. Look for the same signed ratio.',
    'The first slope is (−2 − 7)/(4 − (−2)) = −9/6 = −3/2. From (1, 4) to (5, −2), the slope is −6/4 = −3/2.');

  add('slope-4', 'slope', 'Find the x-intercept by continuing along a line',
    'A line passes through (−1, 10) and (3, 2). At what x-coordinate does it cross the x-axis?',
    ['1', '2', '3', '4'], 3,
    'Find how far y falls for each unit you move right. Start at the point with y closest to 0.',
    'The slope is −8/4 = −2. From (3, 2), moving one unit right lowers y by 2, so the x-intercept is (4, 0).');
  add('scale-2', 'fractionScale', 'Compare multiplication and division by fractions around 1',
    'For a positive number x, which expression has the smallest value?',
    ['x × 5/6', 'x ÷ 4/3', 'x ÷ 5/6', 'x × 4/3'], 1,
    'Rewrite the divisions as multiplications so you can compare all four factors.',
    'The factors are 5/6, 3/4, 6/5, and 4/3. The two factors below 1 are 5/6 = 10/12 and 3/4 = 9/12, so x ÷ 4/3 is smallest.');
  add('slope-5', 'slope', 'Use slope from a table to find a missing value',
    'The table shows three points on a straight line. What is the missing y-value?',
    ['−5', '−2', '−3', '3'], 2,
    'Use the first two rows to find the change in y per unit of x. Then check the size of the next step in x.',
    'From x = −2 to x = 1, x increases by 3 and y falls by 6. The slope is −2. From x = 1 to x = 6, y falls by 10, so the missing value is 7 − 10 = −3.',
    {table: {headers: ['x', 'y'], rows: [['−2', '13'], ['1', '7'], ['6', '?']]}});
  add('fee-2', 'fee', 'Write a rule when the first unit is included',
    'Shipping costs $8 for the first box and $2.50 for every additional box. Which rule gives the shipping cost C for b boxes, where b ≥ 1?',
    ['C = 8 + 2.50b', 'C = 2.50(b − 1)', 'C = 8 + 2.50(b − 1)', 'C = 2.50 + 8(b − 1)'], 2,
    'Check that your rule gives $8 for one box and $10.50 for two boxes.',
    'The flat $8 pays for one box. There are b − 1 additional boxes, each costing $2.50.');
  add('slope-6', 'slope', 'Interpret slope as signed rise per run',
    'A line crosses the x-axis at −8 and the y-axis at −6. Which statement describes the line?',
    ['It falls 3 units each time x increases by 4.', 'It rises 3 units each time x increases by 4.', 'It falls 4 units each time x increases by 3.', 'It rises 4 units each time x increases by 3.'], 0,
    'From the x-intercept to the y-intercept, you move right 8 units.',
    'From (−8, 0) to (0, −6), the vertical change is −6 and the horizontal change is 8. The slope is −6/8 = −3/4, a drop of 3 for a move of 4 to the right.');

  root.MarcoMA5Practice = root.MarcoQR4Data = root.MarcoMA5Practice.practiceSet(4, questions);
})(typeof window === 'undefined' ? globalThis : window);
