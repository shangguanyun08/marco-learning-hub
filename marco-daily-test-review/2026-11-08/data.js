window.MarcoMA5Review = {
  score: { correct: 41, total: 47, percentile: 92, stanine: 8, attempt: 1 },
  questions: [
    {
      number: 21, title: 'Distance across sea level', difficulty: 'Medium', subtype: 'Measurement', seconds: 75,
      prompt: 'The height of a city below sea level and the height of a mountain above sea level are shown in the diagram.\nApproximately what is the difference between the mountain height and city height in meters?',
      image: 'assets/q21-sea-level.png', alt: 'Vertical scale in meters: mountain height 700, sea level 0, city height negative 100.',
      choices: ['400', '600', '800', '1,000'], chosen: 1, correct: 2,
      trick: 'Below sea level means a <mark>negative height</mark>. A distance that crosses zero includes both sides of zero.',
      explanation: 'The mountain is at 700 m and the city is at −100 m. Their difference is 700 − (−100) = 700 + 100 = 800 m.',
      inference: 'His 600 matches 700 − 100, which is consistent with dropping the city’s negative sign. His working is not recorded, so this is a possible explanation, not a confirmed one.',
      classification: 'Familiar foundation; graph-to-signed-number transfer is not secure.',
      history: [
        'Five recent signed-arithmetic checks were 5/5 correct first try (October 12–21, local dates). These included −4 × 6 − (−4) and −5 × 7 − (−12).',
        'Summer Day 2 Q14, a temperature-change problem crossing positive and negative values, was correct in both the August 28 write-in and September 4 redo: 2 recorded checks of one original question.',
        'No completed exact sea-level-distance match was found in the searched records. Arithmetic success did not guarantee correct interpretation of this graph.'
      ],
      links: [['Signed arithmetic · Skill Builder', '../math-skill-builder-2026-10-12/'], ['Summer math history', '../../marco-summer-math-redo/']],
      next: 'Check a height gap, a temperature change, and a number-line distance; make him identify the two signed values before calculating.'
    },
    {
      number: 28, title: 'Substitute without changing subtraction order', difficulty: 'Medium', subtype: 'Algebraic Concepts', seconds: 29,
      prompt: 'If F = 2 − V + E, what is F if V = 12 and E = 30?',
      choices: ['6', '16', '20', '40'], chosen: 3, correct: 2,
      trick: 'Keep the formula’s <mark>signs and order</mark>. Do not reverse a subtraction to avoid a negative intermediate answer.',
      explanation: 'F = 2 − 12 + 30 = −10 + 30 = 20. Substitution changes the letters to their values, not the order of the terms.',
      inference: 'His 40 can be produced by 12 − 2 + 30. That is consistent with reversing the first subtraction, but the chosen answer alone does not establish his method.',
      classification: 'Previously missed related skill; a simpler form still needs a delayed check.',
      history: [
        'September 26 review Q44 / source 2044: substitution with negative signs was wrong in the original set, wrong in Similar A, then correct in Similar B on September 28 — 1/3 first tries.',
        'Those older questions used two equations and were more complex than today’s direct formula. They are related evidence, not three repeats of this exact question form.',
        'Later signed-arithmetic checks were 5/5 correct first try. Today shows that this calculation skill has not transferred reliably to every formula.'
      ],
      links: [['September 26 · substitution history', '../2026-09-26/'], ['Later signed arithmetic', '../math-skill-builder-2026-10-12/']],
      next: 'Use direct formulas with subtraction in different positions, including a negative intermediate value. Ask for a new variable or compare two outputs after the basic form is secure.'
    },
    {
      number: 40, title: 'Equal sides and opposite angles', difficulty: 'Hard', subtype: 'Geometry', seconds: 81,
      prompt: 'In the triangle shown, the length of A is equal to the length of C.\nWhich number sentence must be true?',
      image: 'assets/q40-isosceles.png', alt: 'Triangle with equal sloping sides A and C, base B, base angles a and b, and top angle c.',
      choices: ['a < b', 'a = b', 'b = c', 'b < c'], chosen: 3, correct: 1,
      trick: 'Equal sides have equal <mark>opposite angles</mark>. Trace across the triangle; do not match uppercase and lowercase letter names.',
      explanation: 'Side A is opposite angle b. Side C is opposite angle a. Since A = C, their opposite angles are equal: a = b. The information does not tell us whether b is smaller than c.',
      inference: 'His b < c is not forced by the given information. A diagram’s apparent angle sizes cannot establish a “must be true” statement.',
      classification: 'Under-covered question form in the available completed records.',
      history: [
        'There are 13 recorded checks mentioning an isosceles triangle, with 3 correct first tries. However, all 13 concern the AREA left after cutting a right triangle from a square — they do not test equal sides → opposite angles.',
        'The older workshop bank also contains isosceles area, altitude, and trapezoid questions. Their presence in a bank is not evidence of a completed base-angle check.',
        'No completed direct match for this equal-side/opposite-angle form was found. It would be misleading to say he had already practised this exact skill 13 times.'
      ],
      links: [['Earlier isosceles area practice', '../../marco-summer-math-redo/']],
      next: 'Rotate and relabel isosceles triangles; alternate between equal-side → equal-angle and equal-angle → equal-side questions. Include “must be true” choices.'
    },
    {
      number: 42, title: 'A base fee with two additional charges', difficulty: 'Hard', subtype: 'Algebraic Concepts', seconds: 50,
      prompt: 'A taxi company charges a base fee and $2.50 per mile traveled. The company also charges $1.00 per additional passenger after the first passenger. The table shows the total cost of 4 taxi rides, including the base fee.\nWhat does the taxi company charge for the base fee?',
      table: { headers: ['Miles traveled', 'Passengers', 'Total cost'], rows: [['8', '4', '$25.50'], ['5', '2', '$16.00'], ['6', '2', '$18.50'], ['3', '3', '$12.00']] },
      choices: ['$1.50', '$2.50', '$3.50', '$5.50'], chosen: 3, correct: 1,
      trick: 'Account for <mark>every charge</mark>. “After the first passenger” means charge for passengers − 1, not all passengers.',
      explanation: 'For the first ride: mileage = 8 × $2.50 = $20, extra passengers = (4 − 1) × $1 = $3. Base fee = $25.50 − $20 − $3 = $2.50. Check the second row: $2.50 + 5 × $2.50 + $1 = $16.00.',
      inference: 'His $5.50 equals $25.50 − $20. This is consistent with subtracting the mileage but omitting the extra-passenger charge.',
      classification: 'Familiar fee idea; the combined-condition form is under-tested.',
      history: [
        'Three closely related fee checks were 3/3 correct first try: Summer Day 2 Q24 checked twice (August 28 and September 4), plus Skill Builder Set 6 setup@269 on October 15. That is 3 checks of 2 distinct questions.',
        'The summer taxi question used an initial-mile allowance; the Skill Builder question used a fixed fee plus a per-mile rate. Neither added a separate extra-passenger charge.',
        'Related graph/table y-intercept work improved from 1/4 in Review 2 to 2/4, 3/4, then 4/4 in Review 5. That supports progress on finding a baseline, not mastery of today’s three-part bill.'
      ],
      links: [['Fee setup · Skill Builder', '../math-skill-builder-2026-10-12/'], ['Intercept Review 5', '../math-skill-builder-2026-10-12/review5.html']],
      next: 'Keep the original fee-table format but vary free allowances, additional passengers/items, and which charge must be found. Verify the answer with a second row.'
    },
    {
      number: 45, title: 'Dependent or independent?', difficulty: 'Hard', subtype: 'Data Analysis & Probability', seconds: 33,
      prompt: 'Which of these describes dependent events?',
      choices: [
        'A coin is flipped twice and lands on heads both times.',
        'A die is rolled twice and lands on a 3 on the first roll and a 5 on the second roll.',
        'A red marble is randomly selected from a bag of 10 marbles, replaced, and a red marble is randomly selected again.',
        'A blue sock is randomly selected from a drawer of 20 socks, not replaced, and a blue sock is randomly selected again.'
      ], chosen: 2, correct: 3,
      trick: 'Ask: does the first result <mark>change the probability</mark> of the second? Replacement restores the original contents; no replacement changes them.',
      explanation: 'D describes drawing without replacement: the first sock is removed, changing the drawer’s contents for the second draw. In C the marble is replaced, so the second draw starts with the original contents. Ordinary separate coin flips and die rolls do not change the next trial’s probabilities.',
      inference: 'He selected the with-replacement example. This indicates that the verbal distinction was not reliable on this question, even though he has recently calculated related probabilities correctly.',
      classification: 'A recurring replacement distinction, now in a verbal classification form.',
      history: [
        'Nine related marble/counter checks involving replacement or no replacement were 8/9 correct first try. This is a deliberately narrow count, not all probability practice.',
        'On October 25, mixed Practice 1 p3 (WITHOUT replacement) was wrong: he chose 15/64 instead of 15/56. On October 27, Practice 2 p21 (WITHOUT replacement) was correct: 1/12. On October 28, Practice 2 p24 (WITH replacement comparison) was also correct.',
        'The other six correct checks were three summer no-replacement comparisons and three with-replacement questions in Skill Builder Reviews 3–5. These mostly tested calculation, not choosing a description of dependent events.'
      ],
      links: [['October 23 · Practice 1 and 2', '../2026-10-23/'], ['Skill Builder reviews', '../math-skill-builder-2026-10-12/']],
      next: 'Mix verbal classification with calculations. Before computing, identify whether the contents/probabilities change. Do not use “does order matter?” as the definition of dependence.'
    },
    {
      number: 47, title: 'Symmetry must preserve the shading', difficulty: 'Hard', subtype: 'Geometry', seconds: 36,
      prompt: 'The diagram shows a regular hexagon divided into 6 equal parts.\nHow many lines of symmetry does this hexagon have, assuming that the shading must also be symmetrical?',
      image: 'assets/q47-shaded-hexagon.png', alt: 'Regular hexagon divided into six triangles. Top and bottom triangles are white; the four side triangles are shaded gray.',
      choices: ['2', '4', '6', '12'], chosen: 2, correct: 0,
      trick: 'Reflect the <mark>whole colored picture</mark>, not just its outline. Every shaded part must land on a shaded part.',
      explanation: 'Only the vertical and horizontal lines through the center preserve both the hexagon and its shading. The other four symmetry axes of an unshaded regular hexagon swap some white and gray regions. Therefore there are 2 lines of symmetry.',
      inference: 'His 6 is the number of symmetry lines for the plain regular-hexagon outline. It is consistent with overlooking the shading condition.',
      classification: 'Under-covered representation in the available completed records.',
      history: [
        'No completed symmetry question was found in the searched saved records, and no shaded-symmetry match was found in the older 123-question workshop or 196-question summer-wrong banks.',
        'Other shape, reflection, or transformation work is only related evidence. It does not establish that he has checked color-preserving reflection axes before.',
        'This means “no verified completed match found,” not “he has never encountered symmetry in school or offline.”'
      ],
      links: [],
      next: 'Use the same outline with different shading. Check candidate fold lines one at a time; include shapes with zero, one, two, and more surviving symmetry axes.'
    },
    {
      number: 20, section: 'QR', title: 'Slope direction · November 6', difficulty: 'Hard', subtype: 'November 6 · QR', seconds: 17,
      prompt: 'For which function does the y-value increase at the greatest rate as the x-value decreases?',
      choices: ['Graph A', 'Graph B', 'Graph C', 'Graph D'], chosen: 0, correct: 1,
      graphs: [{m:2,b:0},{m:-2,b:0},{m:-0.5,b:1},{m:0.5,b:-1}],
      trick: 'First follow x <mark>LEFT</mark>. Keep the lines that rise in that direction, then choose the steeper one.',
      explanation: 'Graphs B and C rise when x decreases. B has slope −2, so y rises 2 units for each 1-unit move left. C has slope −1/2, so it rises only 1/2 unit. Graph B is correct. Graph A rises when moving right, but falls when moving left.',
      inference: 'Choosing A is consistent with overlooking the direction of x, but his selected answer alone cannot prove his reasoning.'
    }
  ]
};
