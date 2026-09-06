/* August 30 STAR Math missed questions. Original prompts, choices and diagrams
   are preserved from the linked test. Bank order is stable for saved attempts. */
(function installStarMastery(global) {
  "use strict";
  const originals = [
  {
    "id": "2026-08-30-q2",
    "skill": "Find an equivalent ratio",
    "promptHtml": "A fruit drink uses a pineapple-to-cranberry ratio of <strong>14:12</strong>. Which ratio is equivalent to 14:12?",
    "choices": [
      "7:6",
      "27:24",
      "49:48",
      "36:32"
    ],
    "choicesHtml": [
      "7:6",
      "27:24",
      "49:48",
      "36:32"
    ],
    "answer": "7:6",
    "explanation": "Divide both parts of 14:12 by 2. The equivalent ratio is 7:6.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 2"
  },
  {
    "id": "2026-08-30-q5",
    "skill": "Convert gallons to quarts",
    "promptHtml": "<div class=\"star-equation\">3 gallons = ___ quarts</div>",
    "choices": [
      "12",
      "24",
      "2",
      "6"
    ],
    "choicesHtml": [
      "12",
      "24",
      "2",
      "6"
    ],
    "answer": "12",
    "explanation": "One gallon equals 4 quarts, so 3 × 4 = 12 quarts.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 5"
  },
  {
    "id": "2026-08-30-q7",
    "skill": "subtract multi-digit whole numbers",
    "promptHtml": "Subtract.",
    "choices": [
      "678,846",
      "677,846",
      "677,856",
      "682,154"
    ],
    "choicesHtml": [
      "678,846",
      "677,846",
      "677,856",
      "682,154"
    ],
    "answer": "677,846",
    "explanation": "696,410 − 18,564 = 677,846.",
    "visualHtml": "<div class=\"question-visual\"><div class=\"vertical-math\"><span>696,410</span><span>− 18,564</span></div></div>",
    "sourceLabel": "STAR Math · Aug 30 · Question 7"
  },
  {
    "id": "2026-08-30-q15",
    "skill": "Find an average rate",
    "promptHtml": "During one season, Robert played in 15 games and scored 90 points. How many points per game did he score on average that season?",
    "choices": [
      "5 points per game",
      "9 points per game",
      "6 points per game",
      "4 points per game"
    ],
    "choicesHtml": [
      "5 points per game",
      "9 points per game",
      "6 points per game",
      "4 points per game"
    ],
    "answer": "6 points per game",
    "explanation": "Divide the total points by the number of games: 90 ÷ 15 = 6 points per game.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 15"
  },
  {
    "id": "2026-08-30-q16",
    "skill": "Identify decimal place value",
    "promptHtml": "In what place is the digit <strong>7</strong> in the number <strong>413.79</strong>?",
    "choices": [
      "hundreds",
      "hundredths",
      "tens",
      "tenths"
    ],
    "choicesHtml": [
      "hundreds",
      "hundredths",
      "tens",
      "tenths"
    ],
    "answer": "tenths",
    "explanation": "The 7 is the first digit to the right of the decimal point, so it is in the tenths place.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 16"
  },
  {
    "id": "2026-08-30-q18",
    "skill": "Estimate a mixed-number sum",
    "promptHtml": "Estimate:<div class=\"star-equation\">8 <span class=\"math-fraction\" aria-label=\"3 over 5\"><span>3</span><span>5</span></span> + 3 <span class=\"math-fraction\" aria-label=\"4 over 9\"><span>4</span><span>9</span></span> = ?</div>",
    "choices": [
      "1",
      "10",
      "12",
      "8"
    ],
    "choicesHtml": [
      "1",
      "10",
      "12",
      "8"
    ],
    "answer": "12",
    "explanation": "Round 8 3/5 to 9 and 3 4/9 to 3. Then 9 + 3 = 12.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 18"
  },
  {
    "id": "2026-08-30-q21",
    "skill": "Find a difference from a data table",
    "promptHtml": "The table shows the average weight of several animals. How much greater is the weight of a moose than the weight of a polar bear?",
    "choices": [
      "280 kg",
      "300 kg",
      "290 kg",
      "390 kg"
    ],
    "choicesHtml": [
      "280 kg",
      "300 kg",
      "290 kg",
      "390 kg"
    ],
    "answer": "290 kg",
    "explanation": "Subtract the polar bear's weight from the moose's weight: 700 − 410 = 290 kg.",
    "visualHtml": "<div class=\"question-visual\"><table class=\"input-output data-table\"><thead><tr><th>Animal</th><th>Average weight (kg)</th></tr></thead><tbody><tr><td>Polar bear</td><td>410</td></tr><tr><td>Caribou</td><td>214</td></tr><tr><td>Moose</td><td>700</td></tr><tr><td>Beaver</td><td>23</td></tr><tr><td>Arctic wolf</td><td>40</td></tr></tbody></table></div>",
    "sourceLabel": "STAR Math · Aug 30 · Question 21"
  },
  {
    "id": "2026-08-30-q23",
    "skill": "Divide with a remainder",
    "promptHtml": "Divide.<div class=\"star-equation\">85 ÷ 6</div>",
    "choices": [
      "12 R1",
      "13 R5",
      "15 R5",
      "14 R1"
    ],
    "choicesHtml": [
      "12 R1",
      "13 R5",
      "15 R5",
      "14 R1"
    ],
    "answer": "14 R1",
    "explanation": "6 × 14 = 84, and 85 − 84 = 1. The quotient is 14 R1.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 23"
  },
  {
    "id": "2026-08-30-q24",
    "skill": "Round to the greatest place",
    "promptHtml": "What is <strong>485,783</strong> rounded to its greatest place?",
    "choices": [
      "486,000",
      "490,000",
      "500,000",
      "400,000"
    ],
    "choicesHtml": [
      "486,000",
      "490,000",
      "500,000",
      "400,000"
    ],
    "answer": "500,000",
    "explanation": "The greatest place is the hundred-thousands place. The next digit is 8, so 485,783 rounds up to 500,000.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 24"
  },
  {
    "id": "2026-08-30-q26",
    "skill": "Read and combine pictograph data",
    "promptHtml": "The pictograph shows how many children play each sport. How many children play softball or basketball?",
    "choices": [
      "12 children",
      "14 children",
      "6 children",
      "7 children"
    ],
    "choicesHtml": [
      "12 children",
      "14 children",
      "6 children",
      "7 children"
    ],
    "answer": "14 children",
    "explanation": "Softball has 6 symbols, or 12 children. Basketball has 1 symbol, or 2 children. Altogether, 12 + 2 = 14 children.",
    "visualHtml": "<div class=\"question-visual\"><table class=\"pictograph\" aria-label=\"Sports pictograph; one diamond equals two children\"><caption>Sports Children Play</caption><tbody><tr><th>Baseball</th><td>♦ ♦ ♦ ♦</td></tr><tr><th>Basketball</th><td>♦</td></tr><tr><th>Softball</th><td>♦ ♦ ♦ ♦ ♦ ♦</td></tr></tbody><tfoot><tr><td colspan=\"2\">♦ = 2 children</td></tr></tfoot></table></div>",
    "sourceLabel": "STAR Math · Aug 30 · Question 26"
  },
  {
    "id": "2026-08-30-q27",
    "skill": "Estimate a shaded fraction",
    "promptHtml": "About what fraction of the shape is shaded?",
    "choices": [
      "5/8",
      "1/2",
      "1/4",
      "5/6"
    ],
    "choicesHtml": [
      "<span class=\"math-fraction\" aria-label=\"5 over 8\"><span>5</span><span>8</span></span>",
      "<span class=\"math-fraction\" aria-label=\"1 over 2\"><span>1</span><span>2</span></span>",
      "<span class=\"math-fraction\" aria-label=\"1 over 4\"><span>1</span><span>4</span></span>",
      "<span class=\"math-fraction\" aria-label=\"5 over 6\"><span>5</span><span>6</span></span>"
    ],
    "answer": "5/6",
    "explanation": "Only a small part at the top is unshaded, so about 5/6 of the cylinder is shaded.",
    "visualHtml": "<div class=\"question-visual cylinder-visual\" aria-label=\"A cylinder shaded about five sixths\"><div class=\"cylinder-fill fill-five-sixths\"></div></div>",
    "sourceLabel": "STAR Math · Aug 30 · Question 27"
  },
  {
    "id": "2026-08-30-q29",
    "skill": "Multiply a decimal by a whole number",
    "promptHtml": "Anika buys 8 juice boxes. Each juice box contains 7.5 ounces of juice. How much juice did Anika buy?",
    "choices": [
      "96 oz",
      "60 oz",
      "9.6 oz",
      "15.5 oz"
    ],
    "choicesHtml": [
      "96 oz",
      "60 oz",
      "9.6 oz",
      "15.5 oz"
    ],
    "answer": "60 oz",
    "explanation": "Multiply 8 × 7.5. Eight groups of 7.5 equal 60 ounces.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 29"
  },
  {
    "id": "2026-08-30-q30",
    "skill": "Convert feet to inches",
    "promptHtml": "<div class=\"star-equation\">5 feet = ___ inches</div>",
    "choices": [
      "15",
      "61",
      "50",
      "60"
    ],
    "choicesHtml": [
      "15",
      "61",
      "50",
      "60"
    ],
    "answer": "60",
    "explanation": "One foot equals 12 inches, so 5 × 12 = 60 inches.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 30"
  },
  {
    "id": "2026-08-30-q34",
    "skill": "Find the volume of a rectangular prism",
    "promptHtml": "What is the volume of the rectangular prism? Each small cube is 1 cubic inch.",
    "choices": [
      "32 cubic inches",
      "10 cubic inches",
      "64 cubic inches",
      "30 cubic inches"
    ],
    "choicesHtml": [
      "32 cubic inches",
      "10 cubic inches",
      "64 cubic inches",
      "30 cubic inches"
    ],
    "answer": "32 cubic inches",
    "explanation": "The prism is 2 cubes wide, 4 cubes high, and 4 cubes deep. Its volume is 2 × 4 × 4 = 32 cubic inches.",
    "visualHtml": "<div class=\"question-visual\"><div class=\"prism-diagram\" aria-label=\"Rectangular prism 2 cubes wide, 4 cubes high, and 4 cubes deep\"><div class=\"prism-grid prism-2-by-4\"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class=\"width-label\">2 wide</span><span class=\"height-label\">4 high</span><span class=\"depth-label\">4 deep</span></div></div>",
    "sourceLabel": "STAR Math · Aug 30 · Question 34"
  }
];
  const similar = [
  {
    "id": "2026-08-30-q2",
    "skill": "Find an equivalent ratio",
    "promptHtml": "A trail mix uses a raisin-to-nut ratio of <strong>18:15</strong>. Which ratio is equivalent to 18:15?",
    "choices": [
      "3:2",
      "6:5",
      "12:11",
      "36:15"
    ],
    "choicesHtml": [
      "3:2",
      "6:5",
      "12:11",
      "36:15"
    ],
    "answer": "6:5",
    "explanation": "Divide both parts of 18:15 by 3. The equivalent ratio is 6:5.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 2"
  },
  {
    "id": "2026-08-30-q5",
    "skill": "Convert gallons to quarts",
    "promptHtml": "<div class=\"star-equation\">5 gallons = ___ quarts</div>",
    "choices": [
      "9",
      "10",
      "20",
      "25"
    ],
    "choicesHtml": [
      "9",
      "10",
      "20",
      "25"
    ],
    "answer": "20",
    "explanation": "One gallon equals 4 quarts, so 5 × 4 = 20 quarts.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 5"
  },
  {
    "id": "2026-08-30-q7",
    "skill": "subtract multi-digit whole numbers",
    "promptHtml": "Subtract.",
    "choices": [
      "557,842",
      "556,852",
      "556,842",
      "547,842"
    ],
    "choicesHtml": [
      "557,842",
      "556,852",
      "556,842",
      "547,842"
    ],
    "answer": "556,842",
    "explanation": "584,300 − 27,458 = 556,842.",
    "visualHtml": "<div class=\"question-visual\"><div class=\"vertical-math\"><span>584,300</span><span>− 27,458</span></div></div>",
    "sourceLabel": "STAR Math · Aug 30 · Question 7"
  },
  {
    "id": "2026-08-30-q15",
    "skill": "Find an average rate",
    "promptHtml": "During one season, Elena played in 12 games and scored 96 points. How many points per game did she score on average?",
    "choices": [
      "7 points per game",
      "8 points per game",
      "9 points per game",
      "12 points per game"
    ],
    "choicesHtml": [
      "7 points per game",
      "8 points per game",
      "9 points per game",
      "12 points per game"
    ],
    "answer": "8 points per game",
    "explanation": "Divide the total points by the number of games: 96 ÷ 12 = 8 points per game.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 15"
  },
  {
    "id": "2026-08-30-q16",
    "skill": "Identify decimal place value",
    "promptHtml": "In what place is the digit <strong>6</strong> in the number <strong>582.064</strong>?",
    "choices": [
      "tenths",
      "thousandths",
      "hundredths",
      "ones"
    ],
    "choicesHtml": [
      "tenths",
      "thousandths",
      "hundredths",
      "ones"
    ],
    "answer": "hundredths",
    "explanation": "The 6 is the second digit to the right of the decimal point, so it is in the hundredths place.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 16"
  },
  {
    "id": "2026-08-30-q18",
    "skill": "Estimate a mixed-number sum",
    "promptHtml": "Estimate:<div class=\"star-equation\">6 <span class=\"math-fraction\" aria-label=\"7 over 8\"><span>7</span><span>8</span></span> + 4 <span class=\"math-fraction\" aria-label=\"2 over 5\"><span>2</span><span>5</span></span> = ?</div>",
    "choices": [
      "9",
      "10",
      "11",
      "12"
    ],
    "choicesHtml": [
      "9",
      "10",
      "11",
      "12"
    ],
    "answer": "11",
    "explanation": "Round 6 7/8 to 7 and 4 2/5 to 4. Then 7 + 4 = 11.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 18"
  },
  {
    "id": "2026-08-30-q21",
    "skill": "Find a difference from a data table",
    "promptHtml": "The table shows the average weight of several animals. How much greater is the weight of an elk than the weight of a black bear?",
    "choices": [
      "355 kg",
      "365 kg",
      "375 kg",
      "425 kg"
    ],
    "choicesHtml": [
      "355 kg",
      "365 kg",
      "375 kg",
      "425 kg"
    ],
    "answer": "365 kg",
    "explanation": "Subtract the black bear's weight from the elk's weight: 725 − 360 = 365 kg.",
    "visualHtml": "<div class=\"question-visual\"><table class=\"input-output data-table\"><thead><tr><th>Animal</th><th>Average weight (kg)</th></tr></thead><tbody><tr><td>Black bear</td><td>360</td></tr><tr><td>Elk</td><td>725</td></tr><tr><td>Deer</td><td>92</td></tr><tr><td>Fox</td><td>14</td></tr></tbody></table></div>",
    "sourceLabel": "STAR Math · Aug 30 · Question 21"
  },
  {
    "id": "2026-08-30-q23",
    "skill": "Divide with a remainder",
    "promptHtml": "Divide.<div class=\"star-equation\">97 ÷ 8</div>",
    "choices": [
      "11 R1",
      "12 R1",
      "12 R7",
      "13 R1"
    ],
    "choicesHtml": [
      "11 R1",
      "12 R1",
      "12 R7",
      "13 R1"
    ],
    "answer": "12 R1",
    "explanation": "8 × 12 = 96, and 97 − 96 = 1. The quotient is 12 R1.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 23"
  },
  {
    "id": "2026-08-30-q24",
    "skill": "Round to the greatest place",
    "promptHtml": "What is <strong>742,680</strong> rounded to its greatest place?",
    "choices": [
      "700,000",
      "740,000",
      "743,000",
      "800,000"
    ],
    "choicesHtml": [
      "700,000",
      "740,000",
      "743,000",
      "800,000"
    ],
    "answer": "700,000",
    "explanation": "The greatest place is the hundred-thousands place. The next digit is 4, so round down to 700,000.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 24"
  },
  {
    "id": "2026-08-30-q26",
    "skill": "Read and combine pictograph data",
    "promptHtml": "The pictograph shows how many children joined each club. How many children joined art or music?",
    "choices": [
      "8 children",
      "10 children",
      "12 children",
      "14 children"
    ],
    "choicesHtml": [
      "8 children",
      "10 children",
      "12 children",
      "14 children"
    ],
    "answer": "10 children",
    "explanation": "Art has 2 symbols, or 4 children. Music has 3 symbols, or 6 children. Altogether, 4 + 6 = 10 children.",
    "visualHtml": "<div class=\"question-visual\"><table class=\"pictograph\" aria-label=\"Club pictograph; one diamond equals two children\"><caption>Clubs Children Joined</caption><tbody><tr><th>Science</th><td>♦ ♦ ♦ ♦</td></tr><tr><th>Art</th><td>♦ ♦</td></tr><tr><th>Music</th><td>♦ ♦ ♦</td></tr></tbody><tfoot><tr><td colspan=\"2\">♦ = 2 children</td></tr></tfoot></table></div>",
    "sourceLabel": "STAR Math · Aug 30 · Question 26"
  },
  {
    "id": "2026-08-30-q27",
    "skill": "Estimate a shaded fraction",
    "promptHtml": "About what fraction of the shape is shaded?",
    "choices": [
      "1/4",
      "1/2",
      "3/4",
      "5/6"
    ],
    "choicesHtml": [
      "<span class=\"math-fraction\" aria-label=\"1 over 4\"><span>1</span><span>4</span></span>",
      "<span class=\"math-fraction\" aria-label=\"1 over 2\"><span>1</span><span>2</span></span>",
      "<span class=\"math-fraction\" aria-label=\"3 over 4\"><span>3</span><span>4</span></span>",
      "<span class=\"math-fraction\" aria-label=\"5 over 6\"><span>5</span><span>6</span></span>"
    ],
    "answer": "3/4",
    "explanation": "About one fourth is unshaded, so about three fourths of the cylinder is shaded.",
    "visualHtml": "<div class=\"question-visual cylinder-visual\" aria-label=\"A cylinder shaded about three fourths\"><div class=\"cylinder-fill fill-three-fourths\"></div></div>",
    "sourceLabel": "STAR Math · Aug 30 · Question 27"
  },
  {
    "id": "2026-08-30-q29",
    "skill": "Multiply a decimal by a whole number",
    "promptHtml": "Mateo buys 6 bottles. Each bottle contains 4.5 ounces of juice. How much juice did Mateo buy?",
    "choices": [
      "10.5 oz",
      "24 oz",
      "27 oz",
      "45 oz"
    ],
    "choicesHtml": [
      "10.5 oz",
      "24 oz",
      "27 oz",
      "45 oz"
    ],
    "answer": "27 oz",
    "explanation": "Multiply 6 × 4.5. Six groups of 4.5 equal 27 ounces.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 29"
  },
  {
    "id": "2026-08-30-q30",
    "skill": "Convert feet to inches",
    "promptHtml": "<div class=\"star-equation\">7 feet = ___ inches</div>",
    "choices": [
      "72",
      "79",
      "84",
      "96"
    ],
    "choicesHtml": [
      "72",
      "79",
      "84",
      "96"
    ],
    "answer": "84",
    "explanation": "One foot equals 12 inches, so 7 × 12 = 84 inches.",
    "visualHtml": "",
    "sourceLabel": "STAR Math · Aug 30 · Question 30"
  },
  {
    "id": "2026-08-30-q34",
    "skill": "Find the volume of a rectangular prism",
    "promptHtml": "What is the volume of the rectangular prism? Each small cube is 1 cubic inch.",
    "choices": [
      "24 cubic inches",
      "30 cubic inches",
      "36 cubic inches",
      "40 cubic inches"
    ],
    "choicesHtml": [
      "24 cubic inches",
      "30 cubic inches",
      "36 cubic inches",
      "40 cubic inches"
    ],
    "answer": "36 cubic inches",
    "explanation": "The prism is 3 cubes wide, 3 cubes high, and 4 cubes deep. Its volume is 3 × 3 × 4 = 36 cubic inches.",
    "visualHtml": "<div class=\"question-visual\"><div class=\"prism-diagram\" aria-label=\"Rectangular prism 3 cubes wide, 3 cubes high, and 4 cubes deep\"><div class=\"prism-grid prism-3-by-3\"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class=\"width-label\">3 wide</span><span class=\"height-label\">3 high</span><span class=\"depth-label\">4 deep</span></div></div>",
    "sourceLabel": "STAR Math · Aug 30 · Question 34"
  }
];
  const fraction = (n,d) => `<span class="math-fraction" aria-label="${n} over ${d}"><span>${n}</span><span>${d}</span></span>`;
  const format = n => n.toLocaleString("en-US");
  function choiceQuestion(promptHtml, answer, distractors, explanation, turn, details = {}) {
    const correct = String(answer);
    const choices = [...new Set(distractors.map(String))].filter(v => v !== correct).slice(0,3);
    if (choices.length !== 3) throw new Error("A STAR question needs three distinct distractors.");
    choices.splice(turn % 4,0,correct);
    return {promptHtml,answer:correct,choices,explanation,...details};
  }
  function numeric(prompt, answer, explanation, turn, unit = "", details = {}) {
    return choiceQuestion(prompt,`${answer}${unit}`,[answer+1,answer+10,Math.max(0,answer-1)].map(n=>`${n}${unit}`),explanation,turn,details);
  }
  function table(rows) {
    return `<div class="question-visual"><table class="input-output data-table"><thead><tr><th>Animal</th><th>Weight (kg)</th></tr></thead><tbody>${rows.map(([name,weight])=>`<tr><td>${name}</td><td>${weight}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function pictograph(a,b,key) {
    return `<div class="question-visual"><table class="pictograph" aria-label="Club pictograph"><caption>Clubs Children Joined</caption><tbody><tr><th>Art</th><td>${"♦ ".repeat(a)}</td></tr><tr><th>Music</th><td>${"♦ ".repeat(b)}</td></tr><tr><th>Science</th><td>♦ ♦ ♦</td></tr></tbody><tfoot><tr><td colspan="2">♦ = ${key} children</td></tr></tfoot></table></div>`;
  }
  function cylinder(n,d) {
    return `<div class="question-visual cylinder-visual" role="img" aria-label="Cylinder with a shaded lower portion"><div class="cylinder-fill" style="height:${n/d*100}%"></div></div>`;
  }
  function prism(w,h,d) {
    return `<div class="question-visual"><div class="prism-diagram" role="img" aria-label="Rectangular prism ${w} cubes wide, ${h} cubes high, and ${d} cubes deep"><div class="prism-grid" style="grid-template-columns:repeat(${w},1fr);grid-template-rows:repeat(${h},1fr)">${"<i></i>".repeat(w*h)}</div><span class="width-label">${w} wide</span><span class="height-label">${h} high</span><span class="depth-label">${d} deep</span></div></div>`;
  }
  function extra(parent, i) {
    const n = Number(parent.id.split("-q")[1]);
    if (n === 2) {
      const [a,b,m]=[[5,4,4],[3,2,6],[7,5,3],[4,3,5],[9,7,2],[5,3,4],[8,5,3],[7,4,4],[9,5,2]][i];
      return choiceQuestion(`A fruit drink uses a pineapple-to-cranberry ratio of <strong>${a*m}:${b*m}</strong>. Which ratio is equivalent?`,`${a}:${b}`,[`${a+1}:${b}`,`${a}:${b+1}`,`${a}:${b*2}`],`Divide both parts by ${m}: ${a*m}:${b*m} = ${a}:${b}.`,i,{math:{type:"ratio",a:a*m,b:b*m}});
    }
    if (n === 5) {
      const gallons=[2,4,6,7,8,9,10,11,12][i], answer=gallons*4;
      return numeric(`<div class="star-equation">${gallons} gallons = ___ quarts</div>`,answer,`There are 4 quarts in 1 gallon. ${gallons} × 4 = ${answer} quarts.`,i,"",{math:{type:"multiply",a:gallons,b:4}});
    }
    if (n === 7) {
      const [a,b]=[[705302,28467],[816420,39758],[624105,17689],[930204,48675],[507310,19648],[864201,27856],[750106,38927],[602403,24685],[918305,57649]][i];
      const answer=a-b;
      return choiceQuestion("Subtract.",format(answer),[format(answer+1000),format(answer+10),format(answer-100)],`${format(a)} − ${format(b)} = ${format(answer)}.`,i,{visualHtml:`<div class="question-visual"><div class="vertical-math"><span>${format(a)}</span><span>− ${format(b)}</span></div></div>`,math:{type:"subtract",a,b}});
    }
    if (n === 15) {
      const [games,rate]=[[14,5],[16,7],[18,6],[11,8],[13,9],[17,4],[20,7],[15,8],[12,9]][i], points=games*rate;
      return numeric(`During one season, Jordan played in ${games} games and scored ${points} points. How many points per game did Jordan score on average?`,rate,`${points} ÷ ${games} = ${rate} points per game.`,i," points per game",{math:{type:"divide",a:points,b:games}});
    }
    if (n === 16) {
      const [number,digit,place]=[["624.83","8","tenths"],["371.592","2","thousandths"],["846.27","7","hundredths"],["935.164","1","tenths"],["218.407","0","hundredths"],["763.829","9","thousandths"],["459.36","3","tenths"],["582.914","1","hundredths"],["697.253","3","thousandths"]][i];
      return choiceQuestion(`In what place is the digit <strong>${digit}</strong> in <strong>${number}</strong>?`,place,["ones","tenths","hundredths","thousandths"].filter(p=>p!==place),`The ${digit} is in the ${place} place.`,i,{math:{type:"place",number,digit,place}});
    }
    if (n === 18) {
      const [a,n1,d1,b,n2,d2]=[[5,3,4,2,1,3],[7,1,5,4,5,6],[9,2,3,3,1,4],[4,1,6,8,2,5],[6,4,5,5,3,8],[3,7,9,7,5,8],[8,1,3,2,7,8],[10,5,6,4,1,5],[12,2,7,6,4,5]][i];
      const first=Math.round(a+n1/d1), second=Math.round(b+n2/d2), answer=first+second;
      return numeric(`Estimate by rounding each mixed number to the nearest whole number:<div class="star-equation">${a} ${fraction(n1,d1)} + ${b} ${fraction(n2,d2)} = ?</div>`,answer,`Round the mixed numbers to ${first} and ${second}. Then ${first} + ${second} = ${answer}.`,i,"",{math:{type:"estimate",a,n1,d1,b,n2,d2}});
    }
    if (n === 21) {
      const [a,b]=[[680,395],[745,428],[810,465],[725,386],[690,457],[840,568],[765,489],[920,675],[705,468]][i], answer=a-b;
      return numeric("The table shows the weights of several animals. How much greater is the moose's weight than the polar bear's weight?",answer,`${a} − ${b} = ${answer} kg.`,i," kg",{visualHtml:table([["Polar bear",b],["Moose",a],["Caribou",210+i*3],["Arctic wolf",35+i]]),math:{type:"subtract",a,b}});
    }
    if (n === 23) {
      const [divisor,quotient,remainder]=[[7,13,4],[5,16,3],[8,14,5],[6,17,2],[9,12,7],[4,21,3],[7,18,5],[8,16,3],[9,15,4]][i], dividend=divisor*quotient+remainder;
      return choiceQuestion(`Divide.<div class="star-equation">${dividend} ÷ ${divisor}</div>`,`${quotient} R${remainder}`,[`${quotient-1} R${remainder}`,`${quotient} R${remainder-1}`,`${quotient+1} R${remainder}`],`${divisor} × ${quotient} = ${divisor*quotient}, with ${remainder} left over.`,i,{math:{type:"remainder",dividend,divisor}});
    }
    if (n === 24) {
      const number=[364281,857426,623718,951204,248675,576329,431865,789142,192548][i], answer=Math.round(number/100000)*100000;
      return choiceQuestion(`What is <strong>${format(number)}</strong> rounded to its greatest place?`,format(answer),[format(Math.round(number/1000)*1000),format(Math.round(number/10000)*10000),format(answer+(number<answer?-100000:100000))],`Round to the hundred-thousands place: ${format(number)} rounds to ${format(answer)}.`,i,{math:{type:"round",number}});
    }
    if (n === 26) {
      const [a,b,key]=[[3,4,2],[5,2,3],[4,3,4],[2,6,2],[3,5,3],[6,4,2],[5,3,4],[4,5,2],[2,5,5]][i], answer=(a+b)*key;
      return numeric("The pictograph shows how many children joined each club. How many children joined art or music?",answer,`Art has ${a*key} children and music has ${b*key}. ${a*key} + ${b*key} = ${answer} children.`,i," children",{visualHtml:pictograph(a,b,key),math:{type:"pictograph",a,b,key}});
    }
    if (n === 27) {
      const [numerator,denominator]=[[1,4],[1,2],[2,3],[1,3],[3,5],[4,5],[3,8],[5,8],[7,8]][i], answer=`${numerator}/${denominator}`;
      const distractors=["1/4","1/2","3/4","5/6"].filter(f=>f!==answer).slice(0,3);
      const q=choiceQuestion("About what fraction of the shape is shaded?",answer,distractors,`About ${answer} of the cylinder is shaded.`,i,{visualHtml:cylinder(numerator,denominator),math:{type:"shade",numerator,denominator}});
      q.choicesHtml=q.choices.map(f=>fraction(...f.split("/")));
      return q;
    }
    if (n === 29) {
      const [count,amount]=[[7,3.5],[9,2.5],[4,6.5],[5,8.5],[3,7.5],[8,4.5],[6,5.5],[7,6.5],[9,3.5]][i], answer=count*amount;
      return numeric(`Avery buys ${count} juice boxes. Each box contains ${amount} ounces. How much juice did Avery buy?`,answer,`${count} × ${amount} = ${answer} ounces.`,i," oz",{math:{type:"multiply",a:count,b:amount}});
    }
    if (n === 30) {
      const feet=[2,3,4,6,8,9,10,11,12][i], answer=feet*12;
      return numeric(`<div class="star-equation">${feet} feet = ___ inches</div>`,answer,`There are 12 inches in 1 foot. ${feet} × 12 = ${answer} inches.`,i,"",{math:{type:"multiply",a:feet,b:12}});
    }
    if (n === 34) {
      const [w,h,d]=[[2,3,5],[3,4,2],[4,2,5],[2,5,3],[3,3,3],[4,3,4],[5,2,3],[3,5,4],[4,4,2]][i], answer=w*h*d;
      return numeric("What is the volume of the rectangular prism? Each small cube is 1 cubic inch.",answer,`${w} × ${h} × ${d} = ${answer} cubic inches.`,i," cubic inches",{visualHtml:prism(w,h,d),math:{type:"volume",w,h,d}});
    }
    throw new Error(`Missing follow-up bank for ${parent.id}`);
  }
  const entries=originals.map((question,index)=>({question,followUps:[similar[index],...Array.from({length:9},(_,i)=>({...extra(question,i),id:`${question.id}-extra-${i+2}`,skill:question.skill}))]}));
  global.HarryStarMastery = {entries};
})(globalThis);
