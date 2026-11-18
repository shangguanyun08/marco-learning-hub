(function (root) {
  'use strict';
  const session = {
    appId: 'harry-math-fractions-20261117-v1', sessionId: '2026-11-17', label: 'Session 1',
    questions: [
      {id: 'f1', prompt: '5 2/5 + 3 1/3', answer: '8 11/15', value: [131, 15], explanation: 'Use fifteenths: 2/5 = 6/15 and 1/3 = 5/15. Add the whole numbers and fractions: 5 + 3 + 11/15 = 8 11/15.'},
      {id: 'f2', prompt: '21 3/8 − 12 5/8', answer: '8 3/4', value: [35, 4], explanation: 'Regroup 21 3/8 as 20 11/8. Then 20 11/8 − 12 5/8 = 8 6/8. Simplify 6/8 to 3/4.'},
      {id: 'f3', prompt: '6 − 2 3/5', answer: '3 2/5', value: [17, 5], explanation: 'Regroup 6 as 5 5/5. Subtract 2 3/5: the whole part is 3 and the fractional part is 2/5.'},
      {id: 'f4', prompt: '8 1/3 − 4 3/4', answer: '3 7/12', value: [43, 12], explanation: 'Use twelfths: 8 4/12 − 4 9/12. Regroup 8 4/12 as 7 16/12. Now subtract to get 3 7/12.'},
      {id: 'f5', prompt: '5 1/4 − 2 7/8', answer: '2 3/8', value: [19, 8], explanation: 'Change 1/4 to 2/8. Regroup 5 2/8 as 4 10/8. Then 4 10/8 − 2 7/8 = 2 3/8.'}
    ]
  };
  if (typeof module !== 'undefined') module.exports = session;
  else root.HarryFractionSession = session;
})(typeof window === 'undefined' ? globalThis : window);
