(function (root) {
  'use strict';

  const skills = {
    graph: 'Read slope from a graph',
    points: 'Find slope from two points or intercepts',
    table: 'Find slope from a table',
    equation: 'Read slope from an equation',
    compare: 'Compare direction and steepness',
    missing: 'Use slope to find a missing value',
    rate: 'Interpret a real-world rate',
    triangles: 'Use similar triangles'
  };
  const questions = {};
  function add(id, focus, prompt, choices, correct, tip, explanation, visual = {}) {
    questions[id] = {id, skill: id, focus, prompt, choices, correct, tip, explanation, ...visual};
  }

  add('graph', 'Count rise and run on a grid',
    'Use the coordinate grid to find the slope of the line.',
    ['3/4', '4/3', '−3/4', '3'], 0,
    'Find two points where the line crosses grid intersections. Count the vertical and horizontal steps between them.',
    'The line passes through (−4, −4) and (4, 2). It rises 6 units over a run of 8 units, so the slope is 6/8 = 3/4.',
    {line: {m: 0.75, b: -1, label: 'Line on a coordinate grid passing through (−4, −4) and (4, 2).'}});
  add('points', 'Turn the intercepts into ordered pairs',
    'A line crosses the x-axis at −6 and the y-axis at 4. What is its slope?',
    ['−2/3', '2/3', '3/2', '−3/2'], 1,
    'The x-intercept has y = 0. The y-intercept has x = 0.',
    'The points are (−6, 0) and (0, 4). The vertical change is 4 and the horizontal change is 6, so the slope is 4/6 = 2/3.');
  add('table', 'Allow for uneven steps between rows',
    'The table gives three points on a line. What is the slope?',
    ['−2', '1/2', '−1/2', '−3'], 2,
    'Use any two rows. Divide the change in y by the actual change in x.',
    'From the first row to the second, y changes by −2 and x changes by 4. The slope is −2/4 = −1/2. The next pair of rows also gives −3/6 = −1/2.',
    {table: {headers: ['x', 'y'], rows: [['−3', '8'], ['1', '6'], ['7', '3']]}});
  add('equation', 'Isolate y when its coefficient is negative',
    'What is the slope of the line 6x − 4y = 12?',
    ['−3/2', '−3', '2/3', '3/2'], 3,
    'After subtracting 6x from both sides, divide every term by −4.',
    'Rearrange to −4y = −6x + 12, then divide by −4 to get y = (3/2)x − 3. The coefficient of x is 3/2, the slope.');
  add('compare', 'Distinguish the greater slope from the faster fall',
    'Line A has slope −3. Line B has slope −1/2. Which line has the greater signed slope, and which falls faster as x increases?',
    ['B has the greater slope. A falls faster.', 'A has the greater slope. B falls faster.', 'A has the greater slope and falls faster.', 'B has the greater slope and falls faster.'], 0,
    'Compare the two numbers on a number line. Then check how far each line falls for a one-unit step to the right.',
    '−1/2 is greater because it is farther right on the number line. For each unit to the right, A falls 3 units and B falls 1/2 unit, so A falls faster.');
  add('missing', 'Work backward from a vertical change',
    'A line with slope −2/3 passes through (4, −1). Starting at that point, y increases by 4 along the line. What is the new x-coordinate?',
    ['−6', '10', '−2', '6'], 2,
    'Divide the change in y by the slope to find the signed change in x. Add that to the starting x-coordinate.',
    'The change in x is 4 ÷ (−2/3) = −6. Starting at x = 4 and moving 6 units left gives x = −2.');
  add('rate', 'Interpret the rate with the correct units',
    'A print shop charges a fixed setup fee plus the same price for every poster. Three posters cost $11 total, and seven cost $19 total. What does the slope of total cost versus number of posters mean?',
    ['The setup fee is $2.', 'Each additional poster costs $4.', 'The cost increases by $8 per poster.', 'Each additional poster costs $2.'], 3,
    'Compare the change in dollars with the change in the number of posters.',
    'The cost rises by $8 when the order grows by 4 posters. The slope is $8 ÷ 4 = $2 per poster.');
  add('triangles', 'Use equal rise-to-run ratios on one line',
    'Two right triangles are drawn along the same rising line, with horizontal and vertical legs. The smaller triangle rises 3 units and runs 4 units. The larger triangle rises 9 units. What is its run?',
    ['6 units', '12 units', '16 units', '27 units'], 1,
    'Both triangles have the same rise-to-run ratio. Find the scale factor from 3 to 9.',
    'The rise was multiplied by 3. Since the triangles follow the same line, the run is multiplied by 3 as well. The new run is 4 × 3 = 12 units.');

  const session = root.MarcoMA5Practice.practiceSet(12, questions, skills);
  // Legacy answer keys keep saves from cached versions valid without counting these items.
  Object.assign(session.questions, {'slope-1': {correct: 0}, 'slope-2': {correct: 2}});
  const followUps = {
    points: {
      prompt: 'A line crosses the x-axis at 8 and the y-axis at −6. What is its slope?',
      choices: ['−3/4', '4/3', '3/4', '−4/3'], correct: 2,
      tip: 'Write the two crossings as ordered pairs. Use the same point order for both differences.',
      explanation: 'From (0, −6) to (8, 0), y rises by 6 and x increases by 8. The slope is 6/8 = 3/4.'
    },
    table: {
      prompt: 'The table gives three points on a straight line. What is its slope?',
      table: {headers: ['x', 'y'], rows: [['−5', '9'], ['−1', '3'], ['5', '−6']]},
      choices: ['−3/2', '3/2', '−2/3', '−6'], correct: 0,
      tip: 'Track whether y rises or falls as x increases. Divide the signed change in y by the change in x.',
      explanation: 'From the first row to the second, y changes by −6 and x changes by 4, giving −6/4 = −3/2. The next pair gives −9/6, the same slope.'
    },
    missing: {
      prompt: 'A line with slope −3/4 passes through (5, −2). Starting there, y increases by 6 along the line. What is the new x-coordinate?',
      choices: ['−8', '13', '−3', '11'], correct: 2,
      tip: 'Find the change in x by dividing the change in y by the slope. Then start at x = 5 and apply that change.',
      explanation: 'The change in x is 6 ÷ (−3/4) = −8. The new x-coordinate is 5 + (−8) = −3.'
    }
  };
  // Extra practice uses the same saved record. Only session.ids contributes to the original score.
  session.followUps = Object.fromEntries(Object.entries(followUps).map(([skill, question]) => {
    const id = `${skill}-follow-up`;
    session.questions[id] = {id, skill, ...question};
    return [skill, id];
  }));
  session.title = 'Session 12 · Eight types of slope questions';
  session.groupSize = 4;
  const defaultVisual = session.questionVisual;
  session.questionVisual = question => question.line
    ? `<figure class="slope-plot">${root.MarcoMA5Visuals.plot(question.line, question.id, question.line.label)}</figure>`
    : defaultVisual(question);
  session.nextSteps = {
    graph: 'Mark two grid intersections on the line and count signed rise over run.',
    points: 'Write both ordered pairs before using the slope formula.',
    table: 'Find both differences before dividing, especially when the x-steps are uneven.',
    equation: 'Divide every term by the coefficient of y and keep track of the signs.',
    compare: 'Use a number line for the greater signed slope. Use the size of the change for steepness.',
    missing: 'Use change in y = slope × change in x. Divide when working backward to find the change in x.',
    rate: 'State the slope with both units. Here it is dollars per poster.',
    triangles: 'Apply the same scale factor to rise and run.'
  };
  root.MarcoMA5Practice = root.MarcoQR4Data = session;
})(typeof window === 'undefined' ? globalThis : window);
