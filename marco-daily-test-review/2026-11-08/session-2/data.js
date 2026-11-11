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

  add('c2-1', 'charges',
    'A taxi charges a $4 base fee, $2.50 per mile, and $1.50 for each passenger after the first. A 6-mile ride costs $23.50. How many passengers are in the taxi?',
    ['4', '3', '5', '7'], 0,
    'Find the extra-passenger charge, then include the first passenger in the total.',
    'Base fee plus mileage is $4 + 6 × $2.50 = $19. The remaining $4.50 pays for 3 extra passengers. Including the first passenger gives 4 passengers.',
    { focus: 'Additional passengers versus total passengers' });

  add('c2-2', 'charges',
    'A delivery company charges a base fee, a fee per kilogram, and a fee for each box after the first. These two orders have the same weight. What is the fee for EACH additional box?',
    ['$1.50', '$6.00', '$2.00', '$3.00'], 2,
    'With the same weight, only the box count changes. Divide the cost change by the box-count change.',
    'The cost increases by $24 − $18 = $6 for 4 − 1 = 3 additional boxes. Each additional box costs $6 ÷ 3 = $2.',
    { focus: 'Find a charge per extra box from two rows', table: { headers: ['Weight', 'Boxes', 'Total cost'], rows: [['5 kg', '1', '$18'], ['5 kg', '4', '$24']] } });

  add('c2-3', 'charges',
    'A taxi charges a base fee, $3 per mile, and $2 for each passenger after the first. The totals in the table include every charge. What is the base fee?',
    ['$12', '$6', '$10', '$8'], 3,
    'Subtract both the mileage charge and the extra-passenger charge. Check another row.',
    'Using the first row, the base fee is $24 − 4 × $3 − (3 − 1) × $2 = $24 − $12 − $4 = $8. The second row confirms it: $8 + 7 × $3 = $29.',
    { focus: 'Recover the base fee after accounting for all charges', table: { headers: ['Miles', 'Passengers', 'Total cost'], rows: [['4', '3', '$24'], ['7', '1', '$29'], ['3', '4', '$23']] } });

  add('c2-4', 'charges',
    'A museum group booking costs a $12 base fee, $3 for each child after the first TWO children, and $5 for every adult. What is the total cost for 6 children and 2 adults?',
    ['$28', '$34', '$40', '$22'], 1,
    'The child charge applies only after the two included children. Add the adult charge too.',
    'There are 6 − 2 = 4 charged children. The total is $12 + 4 × $3 + 2 × $5 = $12 + $12 + $10 = $34.',
    { focus: 'Combine two kinds of charges with an allowance' });

  add('p2-1', 'dependence',
    'Which pair of events is DEPENDENT?',
    ['A fair die is rolled, then the same die is rolled again.', 'A letter tile is drawn, returned to the bag, and another tile is drawn.', 'A fair coin is flipped, then a separate fair spinner is spun.', 'A counter is drawn at random from a bag of red and blue counters and kept out, then another counter is drawn.'], 3,
    'Ask whether the first action changes the probabilities for the second action.',
    'Keeping the first counter out changes the contents of the bag. The probabilities for the second draw depend on what was removed.',
    { focus: 'Recognize a dependent pair of events' });

  add('p2-2', 'dependence',
    'A bag contains 3 red counters and 5 blue counters. Two counters are drawn at random WITHOUT replacement. What is the probability that both are red?',
    ['9/64', '3/28', '3/8', '1/7'], 1,
    'After a red counter is removed, update both the red count and the total count.',
    'The probability is 3/8 × 2/7 = 6/56 = 3/28. The second draw has 2 red counters among 7 counters.',
    { focus: 'Update both counts when calculating without replacement' });

  add('p2-3', 'dependence',
    'A box has 10 tickets: 4 prize tickets and 6 blank tickets. One BLANK ticket has already been drawn and kept. What is the probability that the next ticket is a prize ticket?',
    ['4/9', '4/10', '3/9', '3/10'], 0,
    'Use the contents remaining after the known first draw. A blank ticket was removed.',
    'All 4 prize tickets remain, and 9 tickets remain in total. The next-draw probability is 4/9.',
    { focus: 'Condition on removal of a nonwinning item' });

  add('p2-4', 'dependence',
    'A bag starts with 2 gold and 3 silver counters. A gold counter has just been drawn. Which statement correctly compares the chance of gold on the next draw?',
    ['Keeping it out leaves 2 gold counters among 4 counters.', 'Returning it makes the next-draw chance 2/4.', 'Returning it gives a chance of 2/5; keeping it out gives a chance of 1/4.', 'Both procedures give a chance of 2/5.'], 2,
    'Compare the two possible bags after the first gold counter is drawn.',
    'Returning the gold counter restores 2 gold among 5 counters. Keeping it out leaves 1 gold among 4 counters. Thus the two chances are 2/5 and 1/4.',
    { focus: 'Compare replacement and no replacement after a known draw' });

  add('s2-1', 'symmetry',
    'How many lines of symmetry does the entire shaded square have?',
    ['0', '1', '2', '4'], 2,
    'Check the shaded cells after reflecting along each candidate line.',
    'Both diagonals preserve the three gray cells. Horizontal and vertical reflections move some gray cells onto white cells. There are 2 lines of symmetry.',
    { focus: 'Count diagonal symmetry axes in a shaded square', diagram: { kind: 'grid', rows: 3, cols: 3, shaded: [[0, 0], [1, 1], [2, 2]] } });

  add('s2-2', 'symmetry',
    'Which line is a line of symmetry of the entire shaded square?',
    ['The horizontal center line', 'The diagonal from the top-left corner to the bottom-right corner', 'The vertical center line', 'The diagonal from the top-right corner to the bottom-left corner'], 1,
    'The top-left shaded block must reflect onto itself.',
    'Reflection in the top-left to bottom-right diagonal keeps the top-left gray block in place. Each other listed line moves that block into a white part of the square.',
    { focus: 'Identify the single surviving diagonal', diagram: { kind: 'grid', rows: 4, cols: 4, shaded: [[0, 0], [0, 1], [1, 0], [1, 1]] } });

  add('s2-3', 'symmetry',
    'Which statement describes the lines of symmetry of the entire shaded rectangle?',
    ['Both the horizontal and vertical center lines work.', 'Both diagonals work.', 'Only the vertical center line works.', 'Only the horizontal center line works.'], 3,
    'Reflect the top and bottom rows, then check the left and right sides.',
    'The horizontal reflection matches the gray cells in the top and bottom rows, and keeps the middle gray cell in place. Vertical reflection swaps gray with white. The diagonals do not preserve this nonsquare rectangle.',
    { focus: 'Keep shading matched across a horizontal reflection', diagram: { kind: 'grid', rows: 3, cols: 4, shaded: [[0, 0], [2, 0], [1, 2]] } });

  add('s2-4', 'symmetry',
    'How many lines of symmetry does the entire shaded square have?',
    ['0', '1', '2', '4'], 0,
    'A square outline has four candidate reflection axes. Test the shading on each one.',
    'Horizontal, vertical, and both diagonal reflections each send at least one gray cell onto a white cell. There are 0 lines of symmetry for the complete shaded figure.',
    { focus: 'Recognize when shading removes every reflection axis', diagram: { kind: 'grid', rows: 3, cols: 3, shaded: [[0, 0], [1, 2]] } });

  add('g2-1', 'direction',
    'For which function does y DECREASE at the GREATEST rate as x DECREASES?',
    ['Graph A', 'Graph B', 'Graph C', 'Graph D'], 2,
    'Move left first. Keep the graphs that fall in that direction, then compare steepness.',
    'Graphs A and C fall when moving left. Their slopes are 1/2 and 2. Graph C falls 2 units per unit left, so it has the greatest decrease.',
    { focus: 'Choose the greatest fall while moving left', graphs: [{ m: 0.5, b: -2 }, { m: -3, b: 1 }, { m: 2, b: -3 }, { m: -0.25, b: 4 }] });

  add('g2-2', 'direction',
    'The table describes four straight-line functions. For which function does y INCREASE at the SMALLEST rate as x DECREASES?',
    ['Function A', 'Function B', 'Function C', 'Function D'], 3,
    'Find each slope. Moving left makes negative-slope lines rise; choose the smaller rise per unit left.',
    'The slopes are A: 1/2, B: −2, C: 3, and D: −1/2. B and D rise as x decreases. D rises only 1/2 unit per unit left, so Function D is correct.',
    { focus: 'Find the smallest rise from a table when moving left', table: { headers: ['Function', 'y at x = 0', 'y at x = 4'], rows: [['A', '2', '4'], ['B', '5', '−3'], ['C', '−1', '11'], ['D', '4', '2']] } });

  add('g2-3', 'direction',
    'A straight line has slope −2/3. If x DECREASES by 6, what happens to y?',
    ['It decreases by 4.', 'It increases by 4.', 'It increases by 9.', 'It decreases by 2/3.'], 1,
    'Use change in y = slope × change in x. A decrease in x gives a negative change in x.',
    'The change in y is (−2/3) × (−6) = 4. Thus y increases by 4.',
    { focus: 'Calculate the effect of a negative change in x' });

  add('g2-4', 'direction',
    'For which equation does y DECREASE at the SMALLEST rate as x INCREASES?',
    ['y = −(1/4)x + 5', 'y = −3x + 1', 'y = (1/2)x − 2', 'y = 2x'], 0,
    'When moving right, negative slopes fall. Compare the sizes of those negative slopes.',
    'The first two equations fall as x increases. A slope of −1/4 falls 1/4 unit per unit right, less than the 3-unit fall for slope −3. The first equation is correct.',
    { focus: 'Compare the smallest fall from equations' });

  const ids = ['c2-1', 'p2-1', 's2-1', 'g2-1', 'p2-2', 'g2-2', 'c2-2', 's2-2', 's2-3', 'c2-3', 'g2-3', 'p2-3', 'g2-4', 's2-4', 'p2-4', 'c2-4'];
  const data = {
    appId: 'marco-ma-nov08-test5-session2-v1',
    session: 'mixed-16-ma5-qr5-session2-v1',
    title: 'November 8 MA + QR · Session 2 · Four focus skills',
    groupSize: 4,
    downloadName: 'marco-2026-11-08-session-2-skill-report.json',
    skills, questions, ids,
  };
  root.MarcoMA5Practice = data;
  root.MarcoQR4Data = data;
})(typeof window === 'undefined' ? globalThis : window);
