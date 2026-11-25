(function (root) {
  'use strict';
  const questions = {};
  function add(id, skill, focus, prompt, choices, correct, tip, explanation, extra = {}) {
    questions[id] = {id, skill, focus, prompt, choices, correct, tip, explanation, ...extra};
  }

  add('slope-1', 'slope', 'Find signed slope from two negative intercepts',
    'A line crosses the x-axis at −12 and the y-axis at −10. What is its slope?',
    ['5/6', '−6/5', '−5/6', '6/5'], 2,
    'Write (−12, 0) and (0, −10). Trace the movement from left to right.',
    'Moving from (−12, 0) to (0, −10) gives a run of 12 and a change in y of −10. The slope is −10/12 = −5/6.');
  add('scale-1', 'fractionScale', 'Divide by one fraction and multiply by another',
    'A positive number p is divided by 4/7. The result is multiplied by 2/3. Which expression gives the final result?',
    ['p × 7/6', 'p × 8/21', 'p × 6/7', 'p × 7/4'], 0,
    'Use the reciprocal of 4/7 for the division. Keep the multiplier 2/3.',
    'The combined multiplier is (7/4) × (2/3) = 7/6. The final result is p × 7/6.');
  add('slope-2', 'slope', 'Match two pairs of points with the same signed slope',
    'A line goes through (−4, −3) and (2, 1). Which pair of points gives a line with the same slope?',
    ['(−2, 0) and (4, 9)', '(−2, 0) and (7, 6)', '(−2, 0) and (7, −6)', '(−2, 0) and (7, 3)'], 1,
    'Reduce the rise divided by the run for the given line. Find the matching ratio.',
    'The given rise is 4 and the run is 6, giving 2/3. From (−2, 0) to (7, 6), the rise is 6 and the run is 9, which also gives 2/3.');
  add('scale-2', 'fractionScale', 'Compare close multipliers after taking reciprocals',
    'For a positive number n, which expression has the smallest value?',
    ['n ÷ 5/4', 'n × 5/4', 'n ÷ 7/9', 'n × 7/9'], 3,
    'Rewrite each division as multiplication. Use a common denominator to compare the two multipliers below 1.',
    'The two multipliers below 1 are 4/5 and 7/9. Since 7/9 = 35/45 and 4/5 = 36/45, the smallest value is n × 7/9.');
  add('slope-3', 'slope', 'Find a missing value with unequal steps in a slope table',
    'The table shows three points on a straight line. What is the missing y-value?',
    ['−8', '2', '4', '7'], 2,
    'Find the slope from the first two rows. Use the actual change in x for the last step.',
    'The first step has a rise of 9 and a run of 6, so the slope is 3/2. The last step has a run of 4, so y rises by 6 from −2 to 4.',
    {table: {headers: ['x', 'y'], rows: [['−6', '−11'], ['0', '−2'], ['4', '?']]}});
  add('slope-4', 'slope', 'Find the horizontal change when the vertical change is known',
    'A line has slope −2/5 and passes through (−3, 4). Starting at that point, y increases by 6 along the line. What is the new x-coordinate?',
    ['−18', '−12', '12', '15'], 0,
    'A rise on a line with negative slope means moving left. Use the rise and slope to find the signed run.',
    'For every rise of 2, x moves 5 units left. A rise of 6 means moving 15 units left, so the new x-coordinate is −3 − 15 = −18.');

  const session = root.MarcoMA5Practice.practiceSet(6, questions);
  session.title = 'November 21 · Session 6 · Signed slope and fractions';
  session.groupSize = 3;
  root.MarcoMA5Practice = root.MarcoQR4Data = session;
})(typeof window === 'undefined' ? globalThis : window);
