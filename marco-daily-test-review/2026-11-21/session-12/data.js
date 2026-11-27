(function (root) {
  'use strict';

  const skills = {slope: 'Compare signed slopes from points and equations'};
  const choices = [
    'Column A is greater.', 'Column B is greater.', 'The quantities are equal.',
    'There is not enough information to determine the relationship.'
  ];
  const questions = {
    'slope-1': {
      id: 'slope-1', skill: 'slope', focus: 'Compare two negative fractions',
      prompt: 'Find and compare the signed slopes of the two lines.',
      comparison: ['The line through (−4, 5) and (2, 1)', 'The line 9x + 12y = 24'],
      choices, correct: 0,
      tip: 'Write both negative slopes with the same denominator. Which one is closer to zero?',
      explanation: 'Column A is (1 − 5) ÷ (2 − (−4)) = −4/6 = −2/3. In Column B, 12y = −9x + 24, so the slope is −3/4. Using twelfths, −8/12 is greater than −9/12. Column A is greater.'
    },
    'slope-2': {
      id: 'slope-2', skill: 'slope', focus: 'Recognize equal slopes from different forms',
      prompt: 'Compare the signed slopes of the two lines.',
      comparison: ['The line 10x − 8y = 24', 'The line through (3, 6) and (−1, 1)'],
      choices, correct: 2,
      tip: 'Divide by −8 in Column A after moving the x term. In Column B, subtract the coordinates in the same order.',
      explanation: 'Column A gives −8y = −10x + 24, so the slope is (−10) ÷ (−8) = 5/4. Column B gives (1 − 6) ÷ (−1 − 3) = (−5) ÷ (−4) = 5/4. The slopes are equal.'
    }
  };

  const session = root.MarcoMA5Practice.practiceSet(12, questions, skills);
  session.title = 'Session 12 · Signed slope practice';
  session.groupSize = session.ids.length;
  session.nextSteps = {
    slope: 'Use the same point order for rise and run. Isolate y in the equation, then compare the signed slopes.'
  };
  root.MarcoMA5Practice = root.MarcoQR4Data = session;
})(typeof window === 'undefined' ? globalThis : window);
