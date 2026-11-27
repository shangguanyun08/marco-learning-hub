(function (root) {
  'use strict';

  const skills = {slope: 'Compare signed slopes from points and equations'};
  const choices = [
    'Column A is greater.', 'Column B is greater.', 'The quantities are equal.',
    'There is not enough information to determine the relationship.'
  ];
  const questions = {
    'slope-1': {
      id: 'slope-1', skill: 'slope', focus: 'Compare two negative slopes',
      prompt: 'Find the signed slope of each line and compare them.',
      comparison: ['The line through (−2, 6) and (2, 1)', 'The line 7x + 8y = 24'],
      choices, correct: 1,
      tip: 'After finding both slopes, use a common denominator to compare the signed fractions.',
      explanation: 'Column A is (1 − 6) ÷ (2 − (−2)) = −5/4, which equals −10/8. In Column B, 8y = −7x + 24, so the slope is −7/8. Since −7/8 > −10/8, Column B is greater.'
    },
    'slope-2': {
      id: 'slope-2', skill: 'slope', focus: 'Recognize equal slopes when both signs cancel',
      prompt: 'Compare the signed slopes of the two lines.',
      comparison: ['The line through (5, 7) and (2, 3)', 'The line 12x − 9y = 27'],
      choices, correct: 2,
      tip: 'Keep the same point order in both differences. In the equation, divide by −9 after isolating the y term.',
      explanation: 'Column A is (3 − 7) ÷ (2 − 5) = (−4) ÷ (−3) = 4/3. Column B gives −9y = −12x + 27, so its slope is (−12) ÷ (−9) = 4/3. The slopes are equal.'
    }
  };

  const session = root.MarcoMA5Practice.practiceSet(11, questions, skills);
  // Cached three-question pages may still have a saved attempt for this retired question.
  session.questions['slope-3'] = {correct: 0};
  session.title = 'Session 11 · Signed slope practice';
  session.groupSize = session.ids.length;
  session.nextSteps = {
    slope: 'Use the same point order for both differences. Isolate y in the equation, then compare both signed slopes on a number line.'
  };
  root.MarcoMA5Practice = root.MarcoQR4Data = session;
})(typeof window === 'undefined' ? globalThis : window);
