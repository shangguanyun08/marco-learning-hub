(function (root) {
  'use strict';
  const questions = {};
  function add(id, skill, focus, prompt, choices, correct, tip, explanation, extra = {}) {
    questions[id] = {id, skill, focus, prompt, choices, correct, tip, explanation, ...extra};
  }

  add('slope-1', 'slope', 'Find signed slope from intercepts',
    'A line crosses the x-axis at −10 and the y-axis at 6. What is its slope?',
    ['−3/5', '3/5', '5/3', '−5/3'], 1,
    'Write each intercept as an ordered pair. Track which way y moves as x increases.',
    'From (−10, 0) to (0, 6), y rises by 6 and x increases by 10. The slope is 6/10 = 3/5.');
  add('scale-1', 'fractionScale', 'Multiply by a fraction, then divide by a fraction',
    'A positive number n is multiplied by 3/8. The result is divided by 3/4. Which expression equals the final result?',
    ['n × 9/32', 'n × 2', 'n × 1/2', 'n × 3/8'], 2,
    'Keep the first multiplier as written. Use the reciprocal of the divisor.',
    'The combined multiplier is (3/8) × (4/3) = 1/2. The final value is half of n.');
  add('slope-2', 'slope', 'Find a negative slope from two points',
    'A line passes through (−3, 4) and (5, −6). What is its slope?',
    ['5/4', '−4/5', '4/5', '−5/4'], 3,
    'Subtract the coordinates in the same order. Put the change in y on top.',
    'From the first point to the second, y changes by −6 − 4 = −10 and x changes by 5 − (−3) = 8. The slope is −10/8 = −5/4.');
  add('scale-2', 'fractionScale', 'Find the largest result by comparing multipliers',
    'For a positive number n, which expression has the largest value?',
    ['n × 5/4', 'n ÷ 7/8', 'n × 7/8', 'n ÷ 5/4'], 0,
    'Turn each division into multiplication. Compare the multipliers, using a common denominator for close values.',
    'The four multipliers are 5/4, 8/7, 7/8, and 4/5. The two greater than 1 are 5/4 = 35/28 and 8/7 = 32/28. The largest multiplier is 5/4.');
  add('slope-3', 'slope', 'Use a signed slope to complete a table',
    'The table shows three points on one straight line. What is the missing y-value?',
    ['1', '−1', '−4', '11'], 1,
    'Find the change in y per unit of x from the first two rows. The last step in x is a different size.',
    'From x = −4 to x = 2, y drops by 4 over a run of 6, so the slope is −2/3. From x = 2 to x = 11, the run is 9 and y changes by −6. The missing value is 5 − 6 = −1.',
    {table: {headers: ['x', 'y'], rows: [['−4', '9'], ['2', '5'], ['11', '?']]}});

  add('slope-4', 'slope', 'Use the sign of the slope when moving left',
    'A line has slope −3/2 and passes through (4, −5). If you move 6 units left along the line from that point, what is the new y-coordinate?',
    ['−14', '−9', '−1', '4'], 3,
    'Moving left makes the change in x negative. Multiply the slope by that signed change.',
    'The change in x is −6. The change in y is (−3/2) × (−6) = 9. Starting at y = −5, the new y-coordinate is −5 + 9 = 4.');

  const session = root.MarcoMA5Practice.practiceSet(5, questions);
  session.title = 'November 21 · Session 5 · Signed slope and fractions';
  session.groupSize = 3;
  root.MarcoMA5Practice = root.MarcoQR4Data = session;
})(typeof window === 'undefined' ? globalThis : window);
