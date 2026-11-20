(function (root) {
  'use strict';
  const skills = {
    charges: 'Base fee and multiple charges',
    dependence: 'Replacement and dependent events',
    symmetry: 'Symmetry including shading',
    direction: 'Slope direction and greatest or smallest rate',
  };
  const questions = {};
  function add(id, skill, prompt, choices, correct, tip, explanation, extra) {
    questions[id] = { id, skill, prompt, choices, correct, tip, explanation, ...extra };
  }

  add('c3-1', 'charges',
    'A taxi charges a $3 base fee, $2.25 per mile, and $0.75 for each passenger after the first. An 8-mile ride costs $24 in total. How many passengers are in the taxi?',
    ['4', '5', '6', '8'], 1,
    'Remove the base fee and mileage first. The remaining charge counts additional passengers, not all passengers.',
    'Base fee plus mileage is $3 + 8 × $2.25 = $21. The remaining $3 pays for $3 ÷ $0.75 = 4 extra passengers. Including the first passenger gives 5 passengers.',
    { focus: 'Convert an extra-passenger charge to the total number of passengers' });

  add('c3-2', 'charges',
    'A delivery company charges a base fee, a fee per kilogram, and a fee for each box after the first. The two orders shown have the same weight. What is the fee for EACH additional box?',
    ['$1.68', '$8.40', '$4.20', '$2.80'], 3,
    'With the weight unchanged, compare the changes in total cost and box count. Neither row has to start with one box.',
    'The second order has 5 − 2 = 3 more boxes and costs $29.80 − $21.40 = $8.40 more. Each additional box costs $8.40 ÷ 3 = $2.80.',
    { focus: 'Find an extra-box rate when both orders contain extra boxes', table: { headers: ['Weight', 'Boxes', 'Total cost'], rows: [['7 kg', '2', '$21.40'], ['7 kg', '5', '$29.80']] } });

  add('c3-3', 'charges',
    'A taxi charges a base fee, $3 per mile, and $2 for each passenger after the first. The table includes every charge. What is the base fee?',
    ['$5.00', '$11.00', '$6.00', '$8.00'], 0,
    'Subtract every variable charge, including the fee for passengers after the first. Check the result using another row.',
    'Using the first row, the base fee is $26 − 5 × $3 − (4 − 1) × $2 = $26 − $15 − $6 = $5. The other rows confirm it: $5 + 8 × $3 = $29, and $5 + 2 × $3 + $2 = $13.',
    { focus: 'Recover and cross-check a base fee from three table rows', table: { headers: ['Miles', 'Passengers', 'Total cost'], rows: [['5', '4', '$26.00'], ['8', '1', '$29.00'], ['2', '2', '$13.00']] } });

  add('c3-4', 'charges',
    'A club visit has a $15 group fee that includes the FIRST THREE children. Each additional child costs $2.50, and every adult costs $5. What is the total cost for 7 children and 2 adults?',
    ['$25.00', '$42.50', '$35.00', '$40.00'], 2,
    'Read the allowance afresh: three children are included. Charge for only the remaining children, but for every adult.',
    'There are 7 − 3 = 4 charged children. The total is $15 + 4 × $2.50 + 2 × $5 = $15 + $10 + $10 = $35.',
    { focus: 'Apply a different free allowance while combining two charges' });

  add('p3-1', 'dependence',
    'Which pair of events is INDEPENDENT?',
    ['A fair coin is flipped, then the same coin is flipped again.', 'A counter is drawn from a bag of red and blue counters, kept out, and a second counter is drawn.', 'A card is drawn from a deck, kept out, and a second card is drawn.', 'A prize ticket is drawn from a box of prize and blank tickets, kept out, and another ticket is drawn.'], 0,
    'Independent means the first result does not change the probabilities for the second trial. Similar-looking results can still be independent.',
    'An ordinary coin flip does not change the coin or the probabilities on the next flip. Keeping a counter, card, or ticket out changes the contents before the next selection.',
    { focus: 'Recognize independence rather than dependence in words' });

  add('p3-2', 'dependence',
    'A bag contains 5 yellow counters and 4 black counters. Two counters are drawn at random WITHOUT replacement. What is the probability that both are yellow?',
    ['25/81', '5/9', '5/18', '1/4'], 2,
    'After the first yellow counter is removed, there is one fewer yellow counter and one fewer counter in total.',
    'The probability is 5/9 × 4/8 = 20/72 = 5/18. Multiplying 5/9 by 5/9 would incorrectly treat the first counter as replaced.',
    { focus: 'Update the favourable count and total for the second draw' });

  add('p3-3', 'dependence',
    'A box contains 15 tickets: 6 prize tickets and 9 blank tickets. One PRIZE ticket has already been drawn and kept. What is the probability that the NEXT ticket is blank?',
    ['9/15', '5/14', '8/14', '9/14'], 3,
    'The first draw is already known. Update the bag, then count the type asked for on the next draw—not the type that was removed.',
    'Removing a prize ticket leaves all 9 blank tickets and 14 tickets in total. The probability that the next ticket is blank is 9/14. No multiplication for the completed draw is needed.',
    { focus: 'A known draw removes one type while the question asks for the other' });

  add('p3-4', 'dependence',
    'A bag starts with 4 red and 3 blue counters. A red counter has just been drawn. Which statement correctly compares the chance of red on the next draw?',
    ['Returning it gives a chance of 4/6; keeping it out gives a chance of 3/6.', 'Returning it gives a chance of 4/7; keeping it out gives a chance of 1/2.', 'Both procedures give a chance of 4/7.', 'Returning it gives a chance of 3/7; keeping it out gives a chance of 4/6.'], 1,
    'Picture the contents after each procedure separately. Returning the red counter restores the original bag.',
    'With replacement, the bag again has 4 red among 7 counters, giving 4/7. Without replacement, it has 3 red among 6 counters, giving 3/6 = 1/2.',
    { focus: 'Compare restored and changed probabilities after a known draw' });

  add('s3-1', 'symmetry',
    'How many lines of symmetry does the ENTIRE shaded square have?',
    ['0', '1', '2', '4'], 3,
    'Shading can remove symmetry, but it does not always do so. Check every candidate axis instead of assuming fewer must remain.',
    'The four gray corner cells match under horizontal, vertical, and both diagonal reflections. All four symmetry lines of the square preserve this shading, so there are 4.',
    { focus: 'Recognize a shading pattern that preserves all four square axes', diagram: { kind: 'grid', rows: 4, cols: 4, shaded: [[0, 0], [0, 3], [3, 0], [3, 3]] } });

  add('s3-2', 'symmetry',
    'Which line is a line of symmetry of the ENTIRE shaded square?',
    ['The vertical center line', 'The horizontal center line', 'The diagonal from the top-right corner to the bottom-left corner', 'The diagonal from the top-left corner to the bottom-right corner'], 2,
    'Reflect the positions of the two gray cells. A diagonal may work even when the horizontal and vertical lines fail.',
    'Reflection across the top-right to bottom-left diagonal exchanges the gray cell at the left of the middle row with the gray cell in the middle of the bottom row. The other listed reflections do not preserve the pattern.',
    { focus: 'Identify the other diagonal as the only surviving axis', diagram: { kind: 'grid', rows: 3, cols: 3, shaded: [[1, 0], [2, 1]] } });

  add('s3-3', 'symmetry',
    'Which statement describes the lines of symmetry of the ENTIRE shaded rectangle?',
    ['Only the horizontal center line works.', 'Only the vertical center line works.', 'Both the horizontal and vertical center lines work.', 'Both diagonals work.'], 1,
    'Check where the top-corner shading lands after each reflection. The outline is a nonsquare rectangle.',
    'The vertical center line exchanges the two gray cells in the top corners and preserves all white cells. Horizontal reflection moves those gray cells to white cells in the bottom row. The diagonals do not preserve the nonsquare outline.',
    { focus: 'Vertical-only symmetry in a nonsquare shaded rectangle', diagram: { kind: 'grid', rows: 2, cols: 5, shaded: [[0, 0], [0, 4]] } });

  add('s3-4', 'symmetry',
    'How many lines of symmetry does the ENTIRE shaded square have?',
    ['0', '1', '2', '4'], 0,
    'Do not confuse a square outline with a symmetric colored picture. Test all four possible reflection axes.',
    'The gray cells do not match after horizontal, vertical, or either diagonal reflection. At least one gray cell lands on white for every candidate axis, so the complete figure has 0 lines of symmetry.',
    { focus: 'Rule out every axis for an irregular shading pattern', diagram: { kind: 'grid', rows: 4, cols: 4, shaded: [[0, 0], [1, 3], [2, 1]] } });

  add('g3-1', 'direction',
    'For which function does y INCREASE at the GREATEST rate as x DECREASES?',
    ['Graph A', 'Graph B', 'Graph C', 'Graph D'], 2,
    'First move LEFT because x decreases. Keep only the lines that rise in that direction, then compare their steepness.',
    'Graphs B and C rise when moving left. B has slope −1/2 and rises 1/2 unit per unit left; C has slope −5/2 and rises 2.5 units. Graph C has the greatest increase.',
    { focus: 'Greatest rise while moving left', graphs: [{ m: 1.5, b: -3 }, { m: -0.5, b: 4 }, { m: -2.5, b: -1 }, { m: 0.25, b: 2 }] });

  add('g3-2', 'direction',
    'The table describes four straight-line functions. For which function does y DECREASE at the SMALLEST rate as x DECREASES?',
    ['Function A', 'Function B', 'Function C', 'Function D'], 1,
    'Find each slope from the table. Moving left makes positive-slope lines fall. Among those, choose the smallest fall per unit left.',
    'The slopes are A: −1/2, B: 1/2, C: 2, and D: −3. B and C fall as x decreases. B falls 1/2 unit per unit left, less than C’s 2-unit fall, so Function B is correct.',
    { focus: 'Infer the smallest leftward fall from a table', table: { headers: ['Function', 'y at x = 0', 'y at x = 6'], rows: [['A', '3', '0'], ['B', '−2', '1'], ['C', '1', '13'], ['D', '4', '−14']] } });

  add('g3-3', 'direction',
    'A straight line has slope 3/4. If x DECREASES by 8, what happens to y?',
    ['It decreases by 6.', 'It increases by 6.', 'It decreases by 3/4.', 'It increases by 32/3.'], 0,
    'Use change in y = slope × change in x. Positive slope does not mean y always increases: the direction of x matters.',
    'The change in x is −8. The change in y is (3/4) × (−8) = −6. Thus y decreases by 6.',
    { focus: 'Apply a negative x-change to a positive slope' });

  add('g3-4', 'direction',
    'For which equation does y INCREASE at the SMALLEST rate as x INCREASES?',
    ['y = −(1/3)x + 5', 'y = 3x − 2', 'y = −2x + 6', 'y = (1/3)x − 4'], 3,
    'Moving right, keep the positive slopes. Compare their sizes, not their starting heights.',
    'The second and fourth equations rise as x increases. Their slopes are 3 and 1/3. The fourth equation rises only 1/3 unit per unit right, so it has the smallest increase.',
    { focus: 'Smallest rightward rise from equations' });

  const ids = ['c3-1', 's3-1', 'g3-1', 'p3-1', 'g3-2', 'p3-2', 'c3-2', 's3-2', 'p3-3', 'g3-3', 's3-3', 'c3-3', 's3-4', 'c3-4', 'p3-4', 'g3-4'];
  const data = {
    appId: 'marco-ma-nov08-test5-session3-v1',
    session: 'mixed-16-ma5-qr5-session3-v1',
    title: 'November 8 MA + QR · Session 3 · Four focus skills',
    groupSize: 4,
    downloadName: 'marco-2026-11-08-session-3-skill-report.json',
    skills, questions, ids,
  };
  root.MarcoMA5Practice = data;
  root.MarcoQR4Data = data;
})(typeof window === 'undefined' ? globalThis : window);
