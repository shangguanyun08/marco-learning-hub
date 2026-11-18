(function (root) {
  'use strict';
  const session = {
    appId: 'harry-math-fractions-20261118-v1', sessionId: '2026-11-18', label: 'November 18',
    questions: [
      {id: 'f1', prompt: '7 1/4 + 2 2/3', answer: '9 11/12', value: [119, 12], explanation: 'Use twelfths: 1/4 = 3/12 and 2/3 = 8/12. Add the whole numbers and fractions: 7 + 2 + 11/12 = 9 11/12.'},
      {id: 'f2', prompt: '24 5/12 − 14 11/12', answer: '9 1/2', value: [19, 2], explanation: 'Regroup 24 5/12 as 23 17/12. Then 23 17/12 − 14 11/12 = 9 6/12. Simplify 6/12 to 1/2.'},
      {id: 'f3', prompt: '5 − 1 3/8', answer: '3 5/8', value: [29, 8], explanation: 'Regroup 5 as 4 8/8. Subtract 1 3/8: the whole part is 3 and the fractional part is 5/8.'},
      {id: 'f4', prompt: '9 1/2 − 5 2/3', answer: '3 5/6', value: [23, 6], explanation: 'Use sixths: 9 3/6 − 5 4/6. Regroup 9 3/6 as 8 9/6. Now subtract to get 3 5/6.'},
      {id: 'f5', prompt: '6 1/3 − 3 5/6', answer: '2 1/2', value: [5, 2], explanation: 'Change 1/3 to 2/6. Regroup 6 2/6 as 5 8/6. Then 5 8/6 − 3 5/6 = 2 3/6. Simplify 3/6 to 1/2.'}
    ]
  };
  if (typeof module !== 'undefined') module.exports = session;
  else root.HarryFractionSession = session;
})(typeof window === 'undefined' ? globalThis : window);
