(function (root) {
  'use strict';

  const questions = {};
  const skills = {
    median: 'Track the median when a value changes',
    probability: 'Find probability after one draw is known',
    slope: 'Compare signed slopes from points and equations'
  };
  const comparisonChoices = [
    'Column A is greater.', 'Column B is greater.', 'The quantities are equal.',
    'There is not enough information to determine the relationship.'
  ];

  function add(id, skill, focus, prompt, choices, correct, tip, explanation, comparison) {
    questions[id] = {id, skill, focus, prompt, choices, correct, tip, explanation, comparison};
  }

  add('median-1', 'median', 'Sort the new list and average the two middle values',
    'The numbers are 4, 8, 11, 14, 17, 22, 25, and 30. If 30 is replaced with 6, what is the new median?',
    ['11', '12 1/2', '14', '15 1/2'], 1,
    'Put 6 in its place in the sorted list. With eight numbers, use the fourth and fifth numbers.',
    'The new order is 4, 6, 8, 11, 14, 17, 22, 25. The two middle values are 11 and 14. Their average is 12 1/2.');
  add('probability-1', 'probability', 'Recognize when two events describe the same pair',
    'A jar contains 6 green and 4 purple beads. Two are drawn without replacement. The first bead is green. Compare the probabilities.',
    comparisonChoices, 2,
    'For each column, ask which color the second bead has to be.',
    'Each column asks for a pair with one green and one purple bead. The second bead must be purple. Four purple beads remain out of nine total, so both probabilities are 4/9.',
    ['Exactly one green bead in the two draws', 'Exactly one purple bead in the two draws']);
  add('slope-1', 'slope', 'Check for equal negative slopes',
    'Find each signed slope and compare them.', comparisonChoices, 2,
    'Use change in y divided by change in x. In the equation, divide every term by 12 after moving the x term.',
    'Column A has slope (2 − 6) ÷ (2 − (−4)) = −4/6 = −2/3. In Column B, 12y = −8x + 30, so the slope is −8/12 = −2/3. The slopes are equal.',
    ['The line through (−4, 6) and (2, 2)', 'The line 8x + 12y = 30']);

  add('median-2', 'median', 'Measure the change between two medians',
    'The numbers are 2, 6, 10, 12, 16, and 20. Replace 2 with 23. By how much does the median increase?',
    ['1 1/2', '2', '3', '5'], 2,
    'Find the average of the middle pair before the change. Sort the new list and do it again.',
    'Before the change, the middle values are 10 and 12, giving a median of 11. In the new list, 6, 10, 12, 16, 20, 23, the middle values are 12 and 16, giving 14. The median increases by 3.');
  add('probability-2', 'probability', 'Account for a third color',
    'A bag starts with 4 blue, 3 red, and 2 yellow tokens. Two tokens are drawn without replacement. The first is blue. Compare the probabilities.',
    comparisonChoices, 0,
    'After removing the first blue token, list which colors would make each statement true.',
    'Exactly one blue allows a red or yellow second token, giving 5/8. Exactly one red requires a red second token, giving 3/8. Column A is greater.',
    ['Exactly one blue token in the two draws', 'Exactly one red token in the two draws']);
  add('slope-2', 'slope', 'Divide by a negative y coefficient',
    'Find the signed slope in each column.', comparisonChoices, 0,
    'Start Column A by writing −6y = 12 − 9x. What happens to the x coefficient when you divide by −6?',
    'Column A has slope (−9) ÷ (−6) = 3/2. Column B has slope (4 − (−1)) ÷ (1 − (−3)) = 5/4. Since 3/2 = 6/4, Column A is greater.',
    ['The line 9x − 6y = 12', 'The line through (−3, −1) and (1, 4)']);

  add('median-3', 'median', 'Choose a replacement that sets the new median',
    'The numbers are 3, 5, 7, 9, 11, 13, and 15. Which number should replace 13 to make the median exactly 8?',
    ['5', '7', '9', '8'], 3,
    'The median is the fourth number in the sorted list. Try inserting each choice after removing 13.',
    'Replacing 13 with 8 gives the order 3, 5, 7, 8, 9, 11, 15. The fourth number is 8.');
  add('probability-3', 'probability', 'Compare the second draw with and without replacement',
    'Each of two bags starts with 4 white and 6 gray counters. A white counter is drawn from each bag first. Compare the probabilities of drawing white on the next draw.',
    comparisonChoices, 1,
    'Count the white counters and the total in each bag just before the second draw.',
    'Bag A has 3 white counters out of 9, so its probability is 1/3. Bag B has 4 white counters out of 10, so its probability is 2/5. Since 2/5 is greater than 1/3, Column B is greater.',
    ['Bag A, where the first counter is kept out', 'Bag B, where the first counter is put back']);
  add('slope-3', 'slope', 'Compare negative slopes when x decreases between points',
    'Compare the signed slopes of the two lines.', comparisonChoices, 0,
    'Use the same order for subtracting y and x. Then place both slopes on a number line.',
    'Column A has slope (1 − (−5)) ÷ (−2 − 4) = −1. Column B gives 7y = −14x + 21, with slope −2. Since −1 is to the right of −2 on the number line, Column A is greater.',
    ['The line through (4, −5) and (−2, 1)', 'The line 14x + 7y = 21']);

  const session = root.MarcoMA5Practice.practiceSet(10, questions, skills);
  session.title = 'Session 10 · Three-skill QR practice';
  session.groupSize = 3;
  session.nextSteps = {
    median: 'Sort the list again after a replacement. For an even number of values, average the two center entries.',
    probability: 'Use the known first draw to update the bag before counting the outcomes that fit each event.',
    slope: 'Use the same point order for both coordinate differences. Divide every term when isolating y, and compare the resulting signed numbers.'
  };
  root.MarcoMA5Practice = root.MarcoQR4Data = session;
})(typeof window === 'undefined' ? globalThis : window);
