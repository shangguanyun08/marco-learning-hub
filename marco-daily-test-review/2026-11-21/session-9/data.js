(function (root) {
  'use strict';

  const questions = {};
  const skills = {
    rates: 'Compare rates and travel times',
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

  add('rates-1', 'rates', 'Find two equal rates',
    'Rita reads 21 pages in 30 minutes, Dan reads 35 pages in 50 minutes, and Eli reads 22 pages in 40 minutes. Which pair reads at the same rate?',
    ['Rita and Eli', 'Dan and Eli', 'Rita and Dan', 'No pair reads at the same rate.'], 2,
    'Write each rate in pages per minute. Compare the quotients.',
    'Rita reads 21/30 = 7/10 page per minute, and Dan reads 35/50 = 7/10. Eli reads 22/40 = 11/20. Rita and Dan match.');
  add('median-1', 'median', 'Check whether a change crosses the median',
    'A list of seven numbers has a median of 42. The value 35 is replaced with 27. What must happen?',
    ['The median drops and the mean stays the same.', 'Both the median and the mean drop.', 'Both the median and the mean stay the same.', 'The median stays the same and the mean drops.'], 3,
    'Compare both 35 and 27 with the middle value. Then think about the sum.',
    'Both values are below 42, so the fourth value is still 42. The sum drops by 8, so the mean decreases.');
  add('probability-1', 'probability', 'Notice when two events describe the same outcome',
    'A bag starts with 5 blue tokens and 3 orange tokens. Two are drawn without replacement. The first token is orange. Compare the probabilities.',
    comparisonChoices, 2,
    'List the two-token outcome that each column describes.',
    'With just two draws, each column asks for one token of each color. The second token must be blue. After the orange draw, 5 of the 7 remaining tokens are blue, so both probabilities are 5/7.',
    ['Exactly one orange token in the two draws', 'Exactly one blue token in the two draws']);
  add('slope-1', 'slope', 'Compare negative slopes of different sizes',
    'Find each signed slope and compare the numbers.', comparisonChoices, 1,
    'For the points, keep the same order for both subtractions. For the equation, isolate y.',
    'Column A is (1 − 7) ÷ (2 − (−2)) = −3/2. In Column B, 8y = −6x + 16, so the slope is −3/4. Since −3/4 is closer to zero, Column B is greater.',
    ['The line through (−2, 7) and (2, 1)', 'The line 6x + 8y = 16']);

  add('rates-2', 'rates', 'Check whether both trip distances are known',
    'Owen and Ava live 12 miles apart. Ava lives 8 miles from the park. They each travel directly to the park from home. Compare their travel times.',
    comparisonChoices, 3,
    'Try putting their homes and the park on one straight road in two different orders.',
    'Ava takes 8 ÷ 16 = 1/2 hour. Owen could be 4 miles away if the park is between their homes, or 20 miles away if Ava’s home is between Owen and the park. At 32 miles per hour, 4 miles takes less than half an hour and 20 miles takes more.',
    ['Owen at 32 miles per hour', 'Ava at 16 miles per hour']);
  add('median-2', 'median', 'Use both middle values after a change',
    'The numbers are 3, 7, 9, 12, 16, and 20. If 20 is replaced with 5, what is the new median?',
    ['8', '9', '10 1/2', '7'], 0,
    'Put the new list in order. With six values, find the average of the third and fourth values.',
    'The new order is 3, 5, 7, 9, 12, 16. The middle two numbers are 7 and 9, so the median is (7 + 9) ÷ 2 = 8.');
  add('probability-2', 'probability', 'Update the favorable count and the total',
    'A box starts with 6 red and 4 white counters. Two counters are drawn without replacement. Given that the first is red, what is the probability the second is also red?',
    ['5/9', '6/10', '4/9', '6/9'], 0,
    'Take out the red counter that has already been drawn before counting the remaining choices.',
    'After the first draw, 5 red and 4 white counters remain. The probability of drawing red next is 5/9.');
  add('slope-2', 'slope', 'Recognize equal slopes in different forms',
    'Compare the signed slopes of the two lines.', comparisonChoices, 2,
    'The constant in the equation tells you where the line crosses the y-axis once y is isolated. Use the coefficient of x for the slope.',
    'Column A is (−1 − 4) ÷ (3 − (−3)) = −5/6. Column B comes from 6y = −5x + 18, so its slope is also −5/6.',
    ['The line through (−3, 4) and (3, −1)', 'The line 5x + 6y = 18']);

  add('rates-3', 'rates', 'Compare travel times in minutes',
    'Lina travels 18 miles at 24 miles per hour. Remy travels 16 miles at 20 miles per hour. They leave at the same time. Who arrives first, and by how many minutes?',
    ['Remy by 3 minutes', 'Lina by 3 minutes', 'Lina by 5 minutes', 'They arrive together.'], 1,
    'Divide distance by speed for each trip. Then multiply each time in hours by 60.',
    'Lina takes 18 ÷ 24 = 3/4 hour, or 45 minutes. Remy takes 16 ÷ 20 = 4/5 hour, or 48 minutes. Lina arrives 3 minutes earlier.');
  add('median-3', 'median', 'Find how far the middle value moves',
    'The numbers are 1, 4, 7, 12, and 16. Replace 4 with a number greater than 16. By how much does the median increase?',
    ['2', '4', '9', '5'], 3,
    'Place the replacement at the end of the sorted list. Which value now sits in the middle?',
    'The old third value is 7. The new order begins 1, 7, 12, 16 and ends with the replacement. The new median is 12, an increase of 5.');
  add('probability-3', 'probability', 'Compare matching and different colors',
    'A pouch contains 5 black beads, 4 silver beads, and 2 gold beads. Two are drawn without replacement. The first is silver. Compare the probabilities.',
    comparisonChoices, 1,
    'Remove the silver bead already drawn. Count which remaining beads would make the colors match.',
    'Ten beads remain. Three silver beads would make the colors match, giving 3/10. The 5 black and 2 gold beads would make the colors different, giving 7/10.',
    ['Both beads are the same color', 'The beads are different colors']);
  add('slope-3', 'slope', 'Handle the minus sign on the y term',
    'Compare the signed slopes of the two lines.', comparisonChoices, 0,
    'In Column A, divide every term by −5 after moving 6x to the right. Then compare the signs of the slopes.',
    'Column A gives −5y = −6x + 10, so y = (6/5)x − 2 and its slope is positive. Column B has slope (3 − (−1)) ÷ (0 − 4) = −1. Column A is greater.',
    ['The line 6x − 5y = 10', 'The line through (4, −1) and (0, 3)']);

  const session = root.MarcoMA5Practice.practiceSet(9, questions, skills);
  session.title = 'Session 9 · Practice Test 7 QR follow-up';
  session.groupSize = 4;
  session.nextSteps = {
    rates: 'Use the same units to compare rates. Find each time by dividing distance by speed and check that the distances are given.',
    median: 'Sort the updated list. Count to the center for an odd number of values or average the two center values for an even number.',
    probability: 'Remove the known first draw, then count the remaining outcomes that fit the question.',
    slope: 'Use the same point order for rise and run. For an equation, isolate y and keep the sign of the x coefficient.'
  };
  root.MarcoMA5Practice = root.MarcoQR4Data = session;
})(typeof window === 'undefined' ? globalThis : window);
