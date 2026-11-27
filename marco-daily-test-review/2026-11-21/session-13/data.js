(function (root) {
  'use strict';

  const skills = {slope: 'Compare signed slopes from points and equations'};
  const choices = [
    'Column A is greater.', 'Column B is greater.', 'The quantities are equal.',
    'There is not enough information to determine the relationship.'
  ];
  const questions = {
    'slope-1': {
      id: 'slope-1', skill: 'slope', focus: 'Group the x terms and compare slope signs',
      prompt: 'Find and compare the signed slopes of the two lines.',
      comparison: ['The line 2x − 4y = 6x + 12', 'The line through (−3, 2) and (3, 5)'],
      choices, correct: 1,
      tip: 'For Column A, subtract 2x from both sides first. Check the sign after dividing by −4.',
      explanation: 'Column A gives −4y = 4x + 12, so y = −x − 3 and the slope is −1. Column B is (5 − 2) ÷ (3 − (−3)) = 3/6 = 1/2. Since 1/2 > −1, Column B is greater.'
    },
    'slope-2': {
      id: 'slope-2', skill: 'slope', focus: 'Compare negative slopes when x decreases between points',
      prompt: 'Compare the signed slopes of the two lines.',
      comparison: ['The line 3x + 5y = 20', 'The line through (4, −5) and (−2, 4)'],
      choices, correct: 0,
      tip: 'Find both slopes, keeping the minus signs. Then compare the fractions on a number line.',
      explanation: 'In Column A, 5y = −3x + 20, so the slope is −3/5. Column B is (4 − (−5)) ÷ (−2 − 4) = −9/6 = −3/2. Since −3/5 is closer to zero, Column A is greater.'
    }
  };

  const session = root.MarcoMA5Practice.practiceSet(13, questions, skills);
  session.title = 'Session 13 · Signed slope practice';
  session.groupSize = session.ids.length;
  session.nextSteps = {
    slope: 'Collect like terms before isolating y. Use a consistent point order for both coordinate differences and keep the sign when comparing slopes.'
  };
  root.MarcoMA5Practice = root.MarcoQR4Data = session;
})(typeof window === 'undefined' ? globalThis : window);
