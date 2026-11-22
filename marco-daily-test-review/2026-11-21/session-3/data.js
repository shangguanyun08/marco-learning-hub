(function (root) {
  'use strict';
  const questions = {};
  function add(id, skill, focus, prompt, choices, correct, tip, explanation, extra = {}) {
    questions[id] = {id, skill, focus, prompt, choices, correct, tip, explanation, ...extra};
  }

  add('scale-1', 'fractionScale', 'Find a quotient between the original and twice the original',
    'Let p be positive. Which expression is greater than p and less than 2p?',
    ['p ÷ 5/8', 'p ÷ 2/5', 'p × 4/7', 'p ÷ 7/5'], 0,
    'Look for an expression whose multiplier is strictly between 1 and 2.',
    'The four multipliers are 5/2, 8/5, 4/7, and 5/7. Only 8/5 is between 1 and 2.');
  add('power-1', 'powers', 'Identify the correct exponent adjustment',
    'Ari finds that (3 × 10^8)(6 × 10^3) = 18 × 10^11. Which is the same number in scientific notation?',
    ['1.8 × 10^10', '1.8 × 10^11', '1.8 × 10^13', '1.8 × 10^12'], 3,
    'Moving the decimal one place left in 18 leaves one factor of 10 to include in the exponent.',
    '18 × 10^11 = (1.8 × 10) × 10^11 = 1.8 × 10^12.');
  add('fee-1', 'fee', 'Find when two plans cost the same',
    'Plan A costs $14 for the first two hours and $7 per extra hour. Plan B costs $20 for the first two hours and $4 per extra hour. For how many hours do they cost the same?',
    ['2', '4', '3', '6'], 1,
    'Plan A starts $6 cheaper, and its price goes up $3 more per extra hour.',
    'It takes two extra hours to make up the $6 gap. Including the first two hours, the plans cost the same at 4 hours.');
  add('stack-1', 'fractionOrder', 'Recognize equal values above and below the fraction bar',
    'Evaluate the stacked fraction.',
    ['5/9', '9/5', '1', '25/81'], 2,
    'Write both expressions in ninths before dividing.',
    'The numerator is 6/9 − 1/9 = 5/9 and the denominator is 3/9 + 2/9 = 5/9. The quotient is 1.',
    {stacked:['2/3 − 1/9','1/3 + 2/9']});
  add('slope-1', 'slope', 'Find the signed slopes of two lines in different forms',
    'Line A crosses the x-axis at −6 and the y-axis at 9. Line B passes through (−2, 5) and (4, −1). What are the slopes of A and B, in that order?',
    ['3/2 and −1', '−3/2 and −1', '2/3 and 1', '3/2 and 1'], 0,
    'Turn the intercepts of Line A into two ordered pairs.',
    'Line A rises 9 over a run of 6, so its slope is 3/2. Line B falls 6 over a run of 6, so its slope is −1.');

  add('scale-2', 'fractionScale', 'Combine two fraction operations into one multiplier',
    'A positive number t is divided by 2/3 and the result is multiplied by 4/5. Which expression equals the final result?',
    ['t × 8/15', 't × 5/6', 't × 6/5', 't × 15/8'], 2,
    'Use the reciprocal for the divisor and keep the second multiplier as written.',
    'Dividing by 2/3 is multiplying by 3/2. The combined multiplier is (3/2) × (4/5) = 6/5.');
  add('power-2', 'powers', 'Find the missing exponent in a normalized product',
    'If (7 × 10^k)(5 × 10^4) equals 3.5 × 10^10, what is k?',
    ['4', '6', '10', '5'], 3,
    'The coefficient product 35 adds one more power of ten when rewritten as 3.5 × 10.',
    'The product is 35 × 10^(k + 4) = 3.5 × 10^(k + 5). Then k + 5 = 10, so k = 5.');
  add('fee-2', 'fee', 'Use two bills to write a rule with included time',
    'A gaming room charges a base price for the first two hours and a fixed rate after that. Two hours cost $22 and five hours cost $40. Which rule gives the cost C for h whole hours, with h ≥ 2?',
    ['C = 22 + 6h', 'C = 22 + 6(h − 2)', 'C = 22 + 18(h − 2)', 'C = 6(h − 2)'], 1,
    'The $18 difference pays for three extra hours.',
    'Each extra hour costs $18 ÷ 3 = $6. The $22 covers two hours, so the added charge is 6(h − 2).');
  add('stack-2', 'fractionOrder', 'Simplify the denominator using fifteenths',
    'Evaluate the stacked fraction.',
    ['12/7', '28/75', '7/12', '4/5'], 0,
    'Work out 2/3 − 1/5 before taking its reciprocal.',
    'The denominator is 10/15 − 3/15 = 7/15. Then (4/5) × (15/7) = 12/7.',
    {stacked:['4/5','2/3 − 1/5']});
  add('slope-2', 'slope', 'Use two intercepts to find a point on the line',
    'A straight line crosses the x-axis at 6 and the y-axis at 8. If (3, y) is on the line, what is y?',
    ['3', '6', '12', '4'], 3,
    'The x-coordinate 3 is halfway between the x-coordinates of the intercepts.',
    'At x = 0 the line has y = 8, and at x = 6 it has y = 0. Halfway across, y is halfway from 8 to 0, which is 4.');

  add('scale-3', 'fractionScale', 'Find how many servings a mixed number makes',
    'A pitcher holds 4 3/8 liters. One serving is 5/8 liter. How many full servings can be poured?',
    ['5', '6', '7', '8'], 2,
    'Write 4 3/8 as a single fraction with denominator 8.',
    'There are 35 eighths of a liter. Each serving uses 5 eighths, so 35 ÷ 5 = 7 servings.');
  add('power-3', 'powers', 'Compare products whose coefficients differ before normalization',
    'Compare the products in Column A and Column B.',
    ['Column B is greater.', 'The quantities are equal.', 'Column A is greater.', 'There is not enough information.'], 1,
    'Normalize the coefficient of Column A so the products can be compared directly.',
    'Column A is 32 × 10^12 = 3.2 × 10^13. Column B is 3.2 × 10^13. The products are equal.',
    {comparison:['(4 × 10^7)(8 × 10^5)','(2 × 10^8)(1.6 × 10^5)']});
  add('fee-3', 'fee', 'Use a total bill to find the number of items',
    'Shipping costs $24 for the first four boxes and $3 for each extra box. The shipping bill is $45. How many boxes were shipped?',
    ['7', '9', '11', '15'], 2,
    'Find the extra boxes from the added charge, then include the first four.',
    'The extra $21 pays for 7 boxes. Including the 4 covered by the base price, 11 boxes were shipped.');
  add('stack-3', 'fractionOrder', 'Compute a difference above the bar and a sum below it',
    'Evaluate the stacked fraction.',
    ['7/5', '7/20', '5/7', '7/10'], 0,
    'Simplify each half of the stacked expression independently.',
    'The numerator is 9/10 − 2/10 = 7/10 and the denominator is 2/6 + 1/6 = 1/2. The quotient is (7/10) × 2 = 7/5.',
    {stacked:['9/10 − 1/5','1/3 + 1/6']});
  add('slope-3', 'slope', 'Match slopes calculated from two pairs of points',
    'A line passes through (−5, −2) and (1, 8). Which other pair of points determines a line with the same slope?',
    ['(0, 3) and (5, 6)', '(0, 3) and (3, −2)', '(0, 3) and (5, 8)', '(0, 3) and (3, 8)'], 3,
    'Simplify the original rise divided by run first.',
    'The original line rises 10 over a run of 6, so its slope is 5/3. From (0, 3) to (3, 8), y rises 5 while x increases by 3.');

  add('scale-4', 'fractionScale', 'Find a divisor from the multiplier it produces',
    'Dividing any positive number x by a fraction gives x × 7/5. What is that fraction?',
    ['7/5', '2/5', '5/7', '2/7'], 2,
    'The number you divide by is the reciprocal of the number you multiply by.',
    'The reciprocal of 7/5 is 5/7, so x ÷ 5/7 = x × 7/5.');
  add('power-4', 'powers', 'Recover a missing coefficient from a product',
    'If (9 × 10^6)(a × 10^4) equals 5.4 × 10^11, what is a?',
    ['0.6', '6', '5.4', '60'], 1,
    'Rewrite the result using 10^10, the power you get by adding 6 and 4.',
    '5.4 × 10^11 is 54 × 10^10. The left side is (9a) × 10^10, so 9a = 54 and a = 6.');
  add('fee-4', 'fee', 'Compare two package totals',
    'Package A costs $30 for the first three lessons and $8 for each extra lesson. Package B costs $15 for the first lesson and $9 for each extra lesson. For six lessons, which package is cheaper, and by how much?',
    ['Package B by $6', 'Package B by $15', 'Package A by $15', 'Package A by $6'], 3,
    'Count lessons beyond the included number for each package.',
    'Package A costs $30 + 3 × $8 = $54. Package B costs $15 + 5 × $9 = $60. Package A is cheaper by $6.');
  add('stack-4', 'fractionOrder', 'Keep both operations inside the fraction bar',
    'Evaluate the stacked fraction.',
    ['3/2', '2/3', '1/6', '1/2'], 0,
    'Find the sum on top and the difference underneath. Then divide those two results.',
    'The numerator is 4/10 + 1/10 = 1/2. The denominator is 5/6 − 3/6 = 1/3. Then (1/2) × 3 = 3/2.',
    {stacked:['2/5 + 1/10','5/6 − 1/2']});
  add('slope-4', 'slope', 'Find the x-intercept from two points',
    'A line passes through (0, −8) and (3, −2). At which x-coordinate does it cross the x-axis?',
    ['−4', '4', '2', '3'], 1,
    'Find how much y increases for each unit of x, then go far enough to reach y = 0.',
    'The slope is 6/3 = 2. From (3, −2), moving right one unit increases y by 2, so the x-intercept is (4, 0).');

  root.MarcoMA5Practice = root.MarcoQR4Data = root.MarcoMA5Practice.practiceSet(3, questions);
})(typeof window === 'undefined' ? globalThis : window);
