(function (root) {
  'use strict';
  const questions = {};
  function add(id, skill, focus, prompt, choices, correct, tip, explanation, extra = {}) {
    questions[id] = {id, skill, focus, prompt, choices, correct, tip, explanation, ...extra};
  }

  add('scale-1', 'fractionScale', 'Predict whether a quotient grows or shrinks',
    'A number x is positive. Which statement is true?',
    ['Both x ÷ 3/4 and x ÷ 7/4 are greater than x.', 'x ÷ 3/4 is less than x, and x ÷ 7/4 is greater than x.', 'x ÷ 3/4 is greater than x, and x ÷ 7/4 is less than x.', 'Both x ÷ 3/4 and x ÷ 7/4 are less than x.'], 2,
    'Replace each division with multiplication by the reciprocal.',
    'The first quotient multiplies x by 4/3, which is above 1. The second multiplies x by 4/7, which is below 1.');
  add('power-1', 'powers', 'Write a product in scientific notation',
    'What is (6 × 10^4)(7 × 10^5) in scientific notation?',
    ['4.2 × 10^10', '4.2 × 10^8', '4.2 × 10^9', '4.2 × 10^11'], 0,
    'Multiply the coefficients and add the exponents. Then check that the coefficient is at least 1 and less than 10.',
    '6 × 7 = 42 and 4 + 5 = 9. Since 42 = 4.2 × 10, the product is 4.2 × 10^10.');
  add('fee-1', 'fee', 'Write a rule for time beyond an included block',
    'A court rental costs $18 for the first two hours and $6 for each extra hour. Which rule gives the total price C for h whole hours, with h ≥ 2?',
    ['C = 18 + 6h', 'C = 18 + 6(h − 1)', 'C = 6(h − 2)', 'C = 18 + 6(h − 2)'], 3,
    'At two hours, the extra charge should be zero.',
    'The $18 covers the first two hours. There are h − 2 extra hours, each costing $6.');
  add('stack-1', 'fractionOrder', 'Simplify the full denominator before dividing',
    'Evaluate the stacked fraction.',
    ['5/8', '1', '8/5', '5/16'], 1,
    'Use eighths to combine both terms below the long bar.',
    'The denominator is 2/8 + 3/8 = 5/8. The top and bottom are equal, so (5/8) ÷ (5/8) = 1.',
    {stacked:['5/8','1/4 + 3/8']});
  add('slope-1', 'slope', 'Calculate signed slope from two intercepts',
    'A line crosses the y-axis at 12 and the x-axis at 8. What is its slope?',
    ['3/2', '−3/2', '−2/3', '2/3'], 1,
    'Write the points (0, 12) and (8, 0).',
    'Moving right by 8 makes y drop by 12. The slope is −12/8 = −3/2.');

  add('scale-2', 'fractionScale', 'Rewrite division by a fraction greater than 1',
    'Which expression equals n ÷ 8/5 for every positive n?',
    ['n × 8/5', 'n ÷ 5/8', 'n × 5/8', 'n × 3/8'], 2,
    'Swap the top and bottom of the divisor, then multiply.',
    'The reciprocal of 8/5 is 5/8, so n ÷ 8/5 = n × 5/8.');
  add('power-2', 'powers', 'Find an exponent after normalizing a product',
    'If (5 × 10^3)(8 × 10^k) = 4 × 10^11, what is k?',
    ['7', '8', '11', '6'], 0,
    'The coefficient 40 contributes one more factor of 10.',
    'The product is 40 × 10^(3 + k) = 4 × 10^(4 + k). Since 4 + k = 11, k = 7.');
  add('fee-2', 'fee', 'Find the first-hour price from two bills',
    'A workshop charges one price for the first hour and the same rate for each extra hour. Four hours cost $31 and six hours cost $43. What does the first hour cost?',
    ['$6', '$7', '$19', '$13'], 3,
    'First find the charge for one of the two extra hours between the bills.',
    'The $12 difference pays for two hours, so the rate is $6 per extra hour. The four-hour bill has three extra hours. The first hour costs $31 − $18 = $13.');
  add('stack-2', 'fractionOrder', 'Subtract in the numerator and then divide',
    'Evaluate the stacked fraction.',
    ['2/3', '7/12', '3/2', '49/96'], 0,
    'Work in twelfths above the long bar, then use the reciprocal of the denominator.',
    '3/4 − 1/6 = 9/12 − 2/12 = 7/12. Then (7/12) × (8/7) = 2/3.',
    {stacked:['3/4 − 1/6','7/8']});
  add('slope-2', 'slope', 'Match the slope of a line with two negative intercepts',
    'A line crosses the x-axis at −4 and the y-axis at −10. Which pair of points lies on a line with the same slope?',
    ['(−2, 6) and (2, 16)', '(−2, 6) and (3, 4)', '(−2, 6) and (2, −4)', '(−2, 6) and (2, 4)'], 2,
    'From the x-intercept to the y-intercept, x increases by 4.',
    'From (−4, 0) to (0, −10), the slope is −10/4 = −5/2. From (−2, 6) to (2, −4), the changes are also −10 in y and 4 in x.');

  add('scale-3', 'fractionScale', 'Compare four multipliers of the same amount',
    'For positive z, which expression has the least value?',
    ['z × 5/4', 'z × 4/5', 'z ÷ 7/6', 'z ÷ 3/4'], 1,
    'Rewrite the divisions, then compare the four factors.',
    'The factors are 5/4, 6/7, 4/3, and 4/5. Only 6/7 and 4/5 are below 1. Since 28/35 < 30/35, 4/5 is the least.');
  add('power-3', 'powers', 'Compare two products after normalizing',
    'Compare the values in Column A and Column B.',
    ['Column A is greater.', 'The quantities are equal.', 'There is not enough information.', 'Column B is greater.'], 3,
    'Write both products using one digit before the decimal point.',
    'Column A is 36 × 10^9 = 3.6 × 10^10. Column B is 42 × 10^9 = 4.2 × 10^10. The exponents now match, and 4.2 is larger.',
    {comparison:['(9 × 10^5)(4 × 10^4)','(6 × 10^7)(7 × 10^2)']});
  add('fee-3', 'fee', 'Compare plans with different included hours',
    'Plan A costs $20 for the first three hours and $5 per extra hour. Plan B costs $18 for the first hour and $4 per extra hour. Which plan costs less for seven hours, and by how much?',
    ['Plan B by $2', 'Plan B by $7', 'Plan A by $7', 'Plan A by $2'], 3,
    'Count extra hours separately for the two plans.',
    'Plan A costs $20 + 4 × $5 = $40. Plan B costs $18 + 6 × $4 = $42. Plan A is $2 cheaper.');
  add('stack-3', 'fractionOrder', 'Simplify a difference in the denominator',
    'Evaluate the stacked fraction.',
    ['7/2', '7/32', '7/8', '2/7'], 0,
    'Finish the subtraction below the long bar before using a reciprocal.',
    'The bottom is 3/4 − 1/2 = 1/4. The quotient is (7/8) × 4 = 7/2.',
    {stacked:['7/8','3/4 − 1/2']});
  add('slope-3', 'slope', 'Find the y-intercept using a slope and an x-intercept',
    'A line has slope 3/5 and passes through its x-intercept (−5, 0). Where does it cross the y-axis?',
    ['(0, −3)', '(0, 5)', '(0, 3)', '(3, 0)'], 2,
    'Moving from x = −5 to the y-axis increases x by 5.',
    'With run 5 and slope 3/5, the rise is 3. Starting at y = 0 gives the point (0, 3).');

  add('scale-4', 'fractionScale', 'Find the starting amount before a fraction division',
    'A positive number divided by 2/3 gives 18. What was the starting number?',
    ['27', '12', '16', '20'], 1,
    'Undo division by 2/3 by multiplying the result by 2/3.',
    'The starting number is 18 × 2/3 = 12. As a check, 12 ÷ 2/3 = 18.');
  add('power-4', 'powers', 'Use scientific notation to count a total',
    'A lab prepares 8 × 10^2 identical plates. Each plate contains 3 × 10^4 cells. How many cells are on all the plates, in scientific notation?',
    ['2.4 × 10^7', '2.4 × 10^6', '2.4 × 10^8', '1.1 × 10^7'], 0,
    'Multiply the number of plates by the number of cells per plate.',
    'The total is 24 × 10^6. Rewriting 24 as 2.4 × 10 makes the answer 2.4 × 10^7.');
  add('fee-4', 'fee', 'Find how many units the base price included',
    'A rental has a $25 base price that covers some whole hours, plus $4 per extra hour. A nine-hour rental costs $49. How many hours did the base price cover?',
    ['2', '6', '3', '5'], 2,
    'Use the amount paid beyond $25 to find the extra hours.',
    'The $24 extra charge pays for 6 hours. The base price covers the remaining 9 − 6 = 3 hours.');
  add('stack-4', 'fractionOrder', 'Simplify both parts of a stacked fraction',
    'Evaluate the stacked fraction.',
    ['1/2', '2', '5/6', '25/72'], 1,
    'Calculate the numerator and denominator separately.',
    'The numerator is 5/6 and the denominator is 5/12. Dividing gives (5/6) × (12/5) = 2.',
    {stacked:['2/3 + 1/6','3/4 − 1/3']});
  add('slope-4', 'slope', 'Use two rows of a table to find signed slope',
    'The table shows points on a straight line. What is the slope?',
    ['2', '−1/2', '−6', '−2'], 3,
    'Compare the changes in both columns between consecutive rows.',
    'Moving from (−4, 10) to (−1, 4), y changes by −6 and x changes by 3. The slope is −6/3 = −2.',
    {table:{headers:['x','y'],rows:[['−4','10'],['−1','4'],['2','−2']]}});

  root.MarcoMA5Practice = root.MarcoQR4Data = root.MarcoMA5Practice.practiceSet(2, questions);
})(typeof window === 'undefined' ? globalThis : window);
