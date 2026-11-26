(function (root) {
  'use strict';
  const questions = {};
  const skills = {
    rates: 'Compare rates and travel times',
    nets: 'Recognize nets of solids',
    median: 'Track the median when a value changes',
    cost: 'Work backward from tax and a flat fee',
    lengths: 'Compare distances using only given facts',
    decimals: 'Compare products of small decimals',
    multiples: 'Compare possible common multiples',
    probability: 'Find probability after one draw is known',
    slope: 'Compare signed slopes from points and equations'
  };
  const compareChoices = ['Column A is greater.', 'Column B is greater.', 'The quantities are equal.', 'There is not enough information to determine the relationship.'];
  function add(id, skill, focus, prompt, choices, correct, tip, explanation, extra = {}) {
    const original = /^redo-qr(\d+)$/.exec(id);
    questions[id] = {id, skill, focus, prompt, choices, correct, tip, explanation,
      ...(original ? {source: `Practice Test 7 QR · Q${original[1]} redo`} : {}), ...extra};
  }

  add('redo-qr3', 'rates', 'Identify equal rates',
    'Mia reads 30 pages in 45 minutes, Kai reads 50 pages in 75 minutes, and Eva reads 15 pages in 30 minutes. Which two readers have the same pages-per-minute rate?',
    ['Mia and Eva', 'Kai and Eva', 'Mia and Kai', 'No pair has the same rate.'], 2,
    'Divide pages by minutes for each person. Use the same units each time.',
    'Mia’s rate is 30/45 = 2/3, Kai’s is 50/75 = 2/3, and Eva’s is 15/30 = 1/2. Mia and Kai match.');
  add('redo-qr7', 'nets', 'Identify the net of a triangular prism',
    'Which pattern folds into a triangular prism?', ['Pattern A', 'Pattern B', 'Pattern C', 'Pattern D'], 3,
    'A prism has two matching bases. What shape are the two bases in a triangular prism?',
    'Pattern D has two matching triangular ends and three rectangular side faces.', {visual: 'nets'});
  add('redo-qr8', 'median', 'Decide whether the middle number moves',
    'Nine numbers are sorted from least to greatest. The middle number is 120. One of the values, 140, is replaced with 200. Which statement must be true?',
    ['The mean goes down.', 'The mean does not change.', 'The median goes up.', 'The median does not change.'], 3,
    'Where are both 140 and 200 in relation to the middle number?',
    'Both 140 and 200 are above 120, so the fifth value is still 120. Only the total, and therefore the mean, goes up.');
  add('redo-qr20', 'cost', 'Undo a flat charge and sales tax',
    'A club buys bags at the same price per bag. The store adds 6% tax to the merchandise and charges $5 per order for shipping. What is the price of one bag before tax and shipping?',
    ['$15.00', '$15.90', '$17.35', '$18.40'], 0,
    'Subtract the shipping charge first. Then find the taxed price per bag.',
    'Two bags cost $36.80 − $5 = $31.80 after tax, so one is $15.90 after tax. Divide $15.90 by 1.06 to recover the $15 price.',
    {table:{headers:['Bags ordered','Total charge'],rows:[['2','$36.80'],['3','$52.70'],['4','$68.60'],['5','$84.50']]}});
  add('redo-qr21', 'lengths', 'Compare a shortcut with a route that turns',
    'A walker goes 5 blocks east, then 2 blocks north. All blocks have equal length. A straight path connects the same start and finish. Compare the distances.',
    compareChoices, 0,
    'Sketch the two routes. One is made of two sides of a triangle.',
    'The street route goes around a corner. The straight line between the same endpoints is shorter than the two legs added together.',
    {comparison:['Distance along the streets','Distance on the straight path']});
  add('redo-qr26', 'decimals', 'Notice when decimal shifts cancel',
    'For each column, calculate the product of a and b. Compare the products.', compareChoices, 2,
    'From Column A to Column B, one factor increases tenfold. What happens to the other?',
    'Multiplying one factor by 10 and dividing the other by 10 leaves the product unchanged. Both products are 0.00012.',
    {comparison:['a = 0.02 and b = 0.006','a = 0.2 and b = 0.0006']});
  add('redo-qr31', 'multiples', 'Check more than one possible value',
    'Each column describes a positive whole number. Compare the numbers.', compareChoices, 3,
    'List the possible common multiples in each range before comparing.',
    'Column A can be 12, 24, or 36. Column B can be 24 or 36. The columns could be equal or different, and either could be larger.',
    {comparison:['Below 40 and divisible by both 3 and 12','Greater than 22 and less than 37, divisible by both 4 and 6']});
  add('redo-qr32', 'probability', 'Update the remaining marbles',
    'A bag starts with 4 yellow and 2 green marbles. Two are drawn without replacement. You already know the first one was yellow. Compare the probabilities.',
    compareChoices, 2,
    'There are only two draws. For either column, what color must the second marble be?',
    'Each column describes drawing one yellow and one green. After the yellow draw, 2 of the 5 remaining marbles are green. Both probabilities are 2/5.',
    {comparison:['Exactly one green marble in the two draws','Exactly one yellow marble in the two draws']});
  add('redo-qr33', 'rates', 'Notice which distance is missing',
    'Noor’s home is 10 miles from Leo’s home. Leo’s home is 10 miles from school. Both go directly from home to school. Compare their travel times.',
    compareChoices, 3,
    'Can you find Noor’s home-to-school distance without knowing where the three places are?',
    'Leo takes 10 ÷ 20 = 1/2 hour. Noor’s distance could be 20 miles if Leo is directly between Noor and school, or less on a different layout. The times could be equal or Noor could be faster.',
    {comparison:['Noor at 40 miles per hour','Leo at 20 miles per hour']});
  add('redo-qr34', 'slope', 'Compare two negative slopes',
    'Find each signed slope, then compare the numbers.', compareChoices, 1,
    'Use change in y divided by change in x for the points. Isolate y in the equation.',
    'Column A is (8 − 5) ÷ (1 − 3) = −3/2. Column B comes from 6y = −4x + 7, so its slope is −2/3. The slope closer to zero is greater: −2/3 > −3/2.',
    {comparison:['The line through (3, 5) and (1, 8)','The line 4x + 6y = 7']});
  add('redo-qr35', 'lengths', 'Do not assume an unmarked right angle',
    'Compare side lengths x and y. The diagrams are not drawn to scale. No angles or relationships between the triangles are given.',
    compareChoices, 3,
    'An angle that looks square is not necessarily 90°. What the labels say matters more than how the picture looks.',
    'For example, x could be 4. The triangle with sides 3 and 4 could have y = 2 or y = 5, depending on the angle between those sides. Thus x can be greater or smaller than y.',
    {visual:'triangles',comparison:['x','y']});

  add('rates-1', 'rates', 'Compare travel times rather than the speeds alone',
    'Sam bikes 18 miles at 12 miles per hour. Taylor bikes 24 miles at 16 miles per hour. Who finishes first if they start together and maintain those speeds?',
    ['Sam finishes first.', 'They finish together.', 'Taylor finishes first.', 'The information is insufficient.'], 1,
    'Find time by dividing distance by speed.',
    'Sam takes 18 ÷ 12 = 1 1/2 hours. Taylor takes 24 ÷ 16 = 1 1/2 hours. The longer trip and faster speed balance out.');
  add('nets-1', 'nets', 'Name a solid from its faces',
    'A net has four triangles attached to the four edges of one square. What solid can it form?',
    ['Triangular prism', 'Cube', 'Square pyramid', 'Triangular pyramid'], 2,
    'The square becomes the base. The four triangles meet at a single tip.',
    'One square base and four triangular faces form a square pyramid. A prism would have two matching bases.');
  add('median-1', 'median', 'Resort the values after a change',
    'The numbers are 2, 5, 7, 9, and 11. If 2 is replaced with 13, what is the new median?',
    ['7', '8', '9', '11'], 2,
    'First put the new set in order, then mark the middle position.',
    'The new order is 5, 7, 9, 11, 13. The third value is 9.');
  add('cost-1', 'cost', 'Remove the fee and reverse tax',
    'Three notebooks of the same price cost $30.40 total. That includes 10% tax on the notebooks and a flat $4 delivery fee. What was one notebook’s price before tax?',
    ['$8.00', '$8.80', '$9.20', '$10.13'], 0,
    'Undo the charges in reverse order. Take away delivery before reversing the tax.',
    '$30.40 − $4 = $26.40 for three notebooks after tax. Each costs $8.80 after tax. The before-tax price is $8.80 ÷ 1.10 = $8.00.');
  add('lengths-1', 'lengths', 'Use a right angle when it is explicitly given',
    'Two straight paths of 6 meters and 8 meters meet at a right angle. A new straight path joins the two far ends. How much shorter is the new path than walking both original paths?',
    ['2 meters', '4 meters', '8 meters', '10 meters'], 1,
    'Here the right angle is given, so the two original lengths are the legs of a right triangle.',
    'The shortcut is 10 meters because 6² + 8² = 100 = 10². The two original paths total 14 meters, so the shortcut saves 4 meters.');
  add('decimals-1', 'decimals', 'Compare shifts that do not cancel',
    'Which decimal product is greater?', compareChoices, 1,
    'In Column B the first factor is ten times as large. Did the second factor change?',
    'The second factor is unchanged. Column B is ten times Column A: 0.0014 versus 0.00014.',
    {comparison:['0.04 × 0.0035','0.4 × 0.0035']});
  add('multiples-1', 'multiples', 'Find the only common multiple in a range',
    'Which is the only whole number from 20 through 40 that is divisible by both 6 and 9?',
    ['24', '27', '30', '36'], 3,
    'Start with the least common multiple, then list its multiples in the given range.',
    'The least common multiple of 6 and 9 is 18. The first three multiples are 18, 36, and 54. Only 36 is in the range.');
  add('probability-1', 'probability', 'Condition on a known draw without replacement',
    'A box starts with 5 red and 3 blue tokens. Two tokens are drawn without putting the first back. Given that the first token is blue, what is the probability that the two tokens are different colors?',
    ['2/7', '3/8', '5/7', '5/8'], 2,
    'Remove one blue token. Decide what color the next token has to be.',
    'After one blue token is removed, 5 of the 7 remaining tokens are red. A red second token makes the colors different, so the chance is 5/7.');
  add('slope-1', 'slope', 'Compare the sign and size of slopes',
    'Compare the two signed slopes.', compareChoices, 0,
    'Keep the negative sign from each calculation. Think about which value is farther to the right on the number line.',
    'Column A is (2 − 4) ÷ (6 − 2) = −1/2. Column B comes from 4y = −3x + 12 and is −3/4. Since −1/2 > −3/4, Column A is greater.',
    {comparison:['The line through (2, 4) and (6, 2)','The line 3x + 4y = 12']});

  function drawing(label, shapes, width) {
    return `<svg viewBox="0 0 ${width} 100" width="${width}" height="100" role="img" aria-label="${label}"><g stroke="#173957" stroke-width="1.4" stroke-linejoin="round" fill="#e7eff7">${shapes}</g></svg>`;
  }
  const polygon = points => `<polygon points="${points}"/>`;
  const strip = n => Array.from({length:n}, (_, i) => `<rect x="${7 + 25*i}" y="37" width="25" height="26"/>`).join('');
  const nets = [
    drawing('Five rectangles in a row. One pentagon above and one below the middle rectangle.', strip(5) + polygon('57,37 82,37 90,14 70,0 49,14') + polygon('57,63 82,63 90,86 70,100 49,86'),140),
    drawing('One square with a triangle attached to each of its four sides.', '<rect x="48" y="34" width="32" height="32"/>' + polygon('48,34 80,34 64,7') + polygon('48,66 80,66 64,93') + polygon('48,34 48,66 21,50') + polygon('80,34 80,66 107,50'),128),
    drawing('Four triangles, with one attached to each side of the central triangle.', polygon('45,41 83,41 64,74') + polygon('45,41 64,74 26,74') + polygon('83,41 64,74 102,74') + polygon('45,41 83,41 64,8'),128),
    drawing('Three rectangles in a row. One triangle above and one below the middle rectangle.', strip(3) + polygon('32,37 57,37 44.5,15') + polygon('32,63 57,63 44.5,85'),89)
  ];
  function showNets() {
    return `<div class="qr-net-grid" aria-label="Four candidate nets">${nets.map((net,i) => `<figure><figcaption>Pattern ${'ABCD'[i]}</figcaption>${net}</figure>`).join('')}</div>`;
  }
  function showTriangles() {
    return `<figure class="qr-triangles"><svg viewBox="0 0 330 114" width="330" height="114" role="img" aria-label="Two triangles. Left side lengths: 3, 5, and x. Right side lengths: 3, 4, and y. No right angles are marked.">
      <g fill="#e7eff7" stroke="#173957" stroke-width="1.5" stroke-linejoin="round"><path d="M35 11 L132 86 H41 Z"/><path d="M206 18 L307 86 H199 Z"/></g>
      <g fill="#173957" text-anchor="middle" font-size="16"><text x="24" y="55">3</text><text x="89" y="40">5</text><text x="83" y="106">x</text><text x="189" y="57">3</text><text x="263" y="42">y</text><text x="250" y="106">4</text></g>
    </svg></figure>`;
  }

  const session = root.MarcoMA5Practice.practiceSet(8, questions, skills);
  const defaultVisual = session.questionVisual;
  session.title = 'November 21 · Session 8 · Practice Test 7 QR review';
  session.groupSize = 11;
  session.nextSteps = {
    rates: 'Use the same units. For travel time, check that you actually know the direct distance.',
    nets: 'Count the bases and side faces first. Then check how they would meet when folded.',
    median: 'Resort the list after the change and identify the middle position.',
    cost: 'Remove the flat fee first, then divide by the number of items and by the tax multiplier.',
    lengths: 'Use facts that are stated or marked. Do not assume a picture is to scale.',
    decimals: 'Track how each factor changes. Opposite decimal shifts cancel only if they have the same size.',
    multiples: 'List the allowed multiples in both columns and test whether the comparison ever changes.',
    probability: 'Treat the known draw as already done. Update the remaining counts before finding the probability.',
    slope: 'Use rise over run or isolate y. For two negative slopes, the one closer to zero is greater.'
  };
  session.questionVisual = question => question.visual === 'nets' ? showNets() : question.visual === 'triangles' ? showTriangles() + defaultVisual(question) : defaultVisual(question);
  root.MarcoMA5Practice = root.MarcoQR4Data = session;
})(typeof window === 'undefined' ? globalThis : window);
