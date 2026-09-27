window.MARCO_ISEE_PRACTICE = [
  {
    "id": "math-original",
    "subject": "math",
    "number": 1,
    "label": "Repeat the missed questions",
    "questions": [
      {
        "source": 1041,
        "test": 1,
        "number": 41,
        "skill": "Dividing fractions",
        "prompt": "Calculate 4/9 ÷ 2/3. Which method is INCORRECT?",
        "choices": [
          "9/4 × 2/3",
          "4/9 × 3/2",
          "4/9 ÷ 6/9",
          "(4 ÷ 2) ÷ (9 ÷ 3)"
        ],
        "correct": 0,
        "tip": "Keep the first fraction; flip only the fraction you divide by.",
        "explanation": "4/9 ÷ 2/3 = 4/9 × 3/2 = 2/3. Choice A flips the first fraction instead and gives 3/2. B, C and D all give 2/3."
      },
      {
        "source": 1042,
        "test": 1,
        "number": 42,
        "skill": "Comparing fraction products",
        "prompt": "Which expression has a value between 1/5 and 7/10?",
        "choices": [
          "(1/5) × (1/2)",
          "(2/3) × (1/5)",
          "(1/3) × (7/5)",
          "(3/8) × 5"
        ],
        "correct": 2,
        "tip": "Estimate first: the answer must be greater than 0.2 and less than 0.7.",
        "explanation": "The four products are 1/10, 2/15, 7/15 and 15/8. Only 7/15, about 0.467, lies between 0.2 and 0.7.",
        "note": "The source says “has an integral.” Here it means “has a value”; no integration is involved."
      },
      {
        "source": 1044,
        "test": 1,
        "number": 44,
        "skill": "What makes an equation linear?",
        "prompt": "If (n − 2)x^(|n| − 1) − 3 = 0 is a linear equation in x, what is n?",
        "choices": [
          "−2",
          "±2",
          "2",
          "±1"
        ],
        "correct": 0,
        "tip": "Check TWO things: the exponent must be 1, and the coefficient must not be 0.",
        "explanation": "|n| − 1 = 1 gives n = 2 or −2. But n = 2 makes the coefficient n − 2 equal 0. Only n = −2 produces a linear equation."
      },
      {
        "source": 1045,
        "test": 1,
        "number": 45,
        "skill": "Linear equation in one variable",
        "prompt": "Which is a linear equation in ONE variable?",
        "choices": [
          "3xy + 2 = 5",
          "4x − 2y = 8",
          "x − 6 = 8",
          "9x² − 6x = 3"
        ],
        "correct": 2,
        "tip": "Look for exactly one variable, with highest power 1.",
        "explanation": "x − 6 = 8 contains one variable to the first power. Choice B is also linear, but has two variables. A contains a product of variables; D contains x².",
        "note": "The original asks only for a “first-order equation,” so both B and C are linear equations. This practice clarifies “in one variable,” matching the source’s intended answer C."
      },
      {
        "source": 1046,
        "test": 1,
        "number": 46,
        "skill": "Equations with the same solution",
        "prompt": "2x + 5a = 3 has the same solution for x as 2x + 2 = 0. What is a?",
        "choices": [
          "1",
          "4",
          "1/5",
          "−1"
        ],
        "correct": 0,
        "tip": "The x-part is identical in both equations. Use 2x = −2 directly.",
        "explanation": "Substitute 2x = −2 into the first equation: −2 + 5a = 3. Then 5a = 5, so a = 1."
      },
      {
        "source": 1049,
        "test": 1,
        "number": 49,
        "skill": "Angle bisectors and perpendicular rays",
        "prompt": "AB and CD are straight lines through O. OM bisects ∠AOC. ON is perpendicular to OM, on the side shown. If ∠AOC = 70°, find ∠CON.",
        "choices": [
          "20°",
          "30°",
          "35°",
          "40°",
          "55°"
        ],
        "correct": 4,
        "tip": "Halve the bisected angle, then subtract it from 90°.",
        "explanation": "∠MOC = 70° ÷ 2 = 35°. The right angle MON consists of MOC and CON, so ∠CON = 90° − 35° = 55°.",
        "visual": {
          "kind": "angles",
          "angle": 70
        },
        "note": "Source error: Zozeck marks C (35°), although its own calculation gives 55°. None of its four original choices is correct. A fifth choice, 55°, is added here and is scored as correct."
      },
      {
        "source": 1051,
        "test": 1,
        "number": 51,
        "skill": "Reading a bar chart",
        "prompt": "The chart shows toys in a shop. Which toy has 20 more than the number of teddies?",
        "choices": [
          "Bat",
          "Balloon",
          "Ball",
          "Ludo"
        ],
        "correct": 0,
        "tip": "Read Teddy first, add 20, then find the matching bar.",
        "explanation": "There are 30 teddies. 30 + 20 = 50, which is the number of bats.",
        "visual": {
          "kind": "bars",
          "labels": [
            "Bat",
            "Balloon",
            "Teddy",
            "Ball",
            "Ludo"
          ],
          "values": [
            50,
            20,
            30,
            60,
            10
          ],
          "unit": "Number of toys"
        }
      },
      {
        "source": 1052,
        "test": 1,
        "number": 52,
        "skill": "Maximum and minimum on a chart",
        "prompt": "The chart shows government purchases of pulses in tons. Which years have (i) the maximum and (ii) the minimum purchases?",
        "choices": [
          "(i) 1994; (ii) 1991 and 1993",
          "(i) 1998; (ii) 2001",
          "(i) 2001; (ii) 1998",
          "(i) 1991 and 1993; (ii) 1994"
        ],
        "correct": 3,
        "tip": "Look for every tallest bar. A maximum can be tied.",
        "explanation": "1991 and 1993 both reach 100 tons, the maximum. 1994 reaches 10 tons, the minimum.",
        "visual": {
          "kind": "bars",
          "labels": [
            1987,
            1988,
            1989,
            1990,
            1991,
            1992,
            1993,
            1994,
            1995
          ],
          "values": [
            70,
            60,
            20,
            20,
            100,
            70,
            100,
            10,
            20
          ],
          "unit": "Tons"
        }
      },
      {
        "source": 1054,
        "test": 1,
        "number": 54,
        "skill": "Polygon patterns",
        "prompt": "What figure comes next in the pattern?",
        "choices": [
          "Heptagon",
          "Hexagon",
          "Octagon",
          "Quadrilateral"
        ],
        "correct": 2,
        "tip": "Count the sides instead of judging the size or shape.",
        "explanation": "The polygons have 5, 6 and 7 sides. The next has 8 sides: an octagon.",
        "visual": {
          "kind": "polygons",
          "sides": [
            5,
            6,
            7
          ]
        }
      },
      {
        "source": 1056,
        "test": 1,
        "number": 56,
        "skill": "Order of operations",
        "prompt": "8190 ÷ 65 − 120 + 15 × 12 − 18 = ?",
        "choices": [
          "188",
          "178",
          "158",
          "168"
        ],
        "correct": 3,
        "tip": "Do multiplication and division first; then work addition and subtraction from left to right.",
        "explanation": "8190 ÷ 65 = 126 and 15 × 12 = 180. Then 126 − 120 + 180 − 18 = 6 + 180 − 18 = 168."
      },
      {
        "source": 1057,
        "test": 1,
        "number": 57,
        "skill": "Division",
        "prompt": "8190 ÷ 65 = ?",
        "choices": [
          "128",
          "124",
          "122",
          "126"
        ],
        "correct": 3,
        "tip": "Build the quotient from easy multiples: 100, 20, then the remainder.",
        "explanation": "65 × 100 = 6500, leaving 1690. 65 × 20 = 1300, leaving 390. 65 × 6 = 390. Thus 100 + 20 + 6 = 126."
      },
      {
        "source": 1059,
        "test": 1,
        "number": 59,
        "skill": "Absolute value",
        "prompt": "Which statement expresses “The absolute value of a positive number equals itself”?",
        "choices": [
          "|a| = a, when a > 0",
          "|a| = a, when a < 0",
          "|a| = −a, when a ≥ 0",
          "|a| = −a, when a ≤ 0"
        ],
        "correct": 0,
        "tip": "Absolute value is distance from zero. Positive numbers keep their value.",
        "explanation": "For a positive number, a > 0 and |a| = a. Choice D is a true rule for nonpositive numbers, but it does not express the statement asked here."
      },
      {
        "source": 1060,
        "test": 1,
        "number": 60,
        "skill": "Signs and distance from zero",
        "prompt": "The number line shows a and b. Which statement is correct?",
        "choices": [
          "a + b = 0",
          "b < a",
          "ab > 0",
          "|b| < |a|"
        ],
        "correct": 3,
        "tip": "Separate position from distance: absolute value measures distance from zero.",
        "explanation": "a lies between −2 and −1; b lies between 0 and 1. Thus |a| > 1 and |b| < 1. The numbers have opposite signs, so ab < 0.",
        "visual": {
          "kind": "numberline",
          "a": -1.5,
          "b": 0.5
        }
      },
      {
        "source": 2041,
        "test": 2,
        "number": 41,
        "skill": "A sum that cancels",
        "prompt": "Compute 1/(1 × 3) + 1/(3 × 5) + 1/(5 × 7) + … + 1/(17 × 19) + 1/(19 × 21).",
        "choices": [
          "20/21",
          "40/21",
          "10/21",
          "22/21"
        ],
        "correct": 2,
        "tip": "Split each term into half a difference. All the middle fractions cancel.",
        "explanation": "1/[k(k + 2)] = (1/2) × [1/k − 1/(k + 2)]. The sum is (1/2) × [(1 − 1/3) + (1/3 − 1/5) + … + (1/19 − 1/21)] = (1/2) × (1 − 1/21) = 10/21."
      },
      {
        "source": 2042,
        "test": 2,
        "number": 42,
        "skill": "Finding the whole from a fraction change",
        "prompt": "Daniel has folded 1/3 of his paper cranes. Folding 42 more will bring him to 2/5 of the total. Which expression gives the total number of cranes?",
        "choices": [
          "42 × (1/3) × (2/5)",
          "42 × (2/5 − 1/3)",
          "42 ÷ (2/5 − 1/3)",
          "42 × (1 − 1/3) + 42 × (2/5)"
        ],
        "correct": 2,
        "tip": "The extra 42 represents the CHANGE in fraction, not the whole 2/5.",
        "explanation": "The change is 2/5 − 1/3 = 6/15 − 5/15 = 1/15. Therefore the total is 42 ÷ (1/15) = 630 cranes."
      },
      {
        "source": 2043,
        "test": 2,
        "number": 43,
        "skill": "Aligning place values",
        "prompt": "In which expression do the digits 7 and 3 occupy the same place-value column, so they can be directly added or subtracted?",
        "choices": [
          "476 + 353",
          "1.79 − 2.3",
          "7/9 − 3/5",
          "7 + 3/10"
        ],
        "correct": 1,
        "tip": "Line up the decimal points. Only matching place values can be combined directly.",
        "explanation": "In 1.79 − 2.30, 7 and 3 both count tenths. In 476 + 353, 7 counts tens but the 3s count hundreds and ones. Fractions need equal denominators first."
      },
      {
        "source": 2044,
        "test": 2,
        "number": 44,
        "skill": "Substitution and negative signs",
        "prompt": "x = −1 and y = 2 solve 3x + 2y = m and nx − y = 1. What is m − n?",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ],
        "correct": 3,
        "tip": "Find m and n separately, then put parentheses around the negative n.",
        "explanation": "m = 3(−1) + 2(2) = 1. Also −n − 2 = 1, so n = −3. Therefore m − n = 1 − (−3) = 4."
      },
      {
        "source": 2048,
        "test": 2,
        "number": 48,
        "skill": "Midpoints on a line",
        "prompt": "A, D, C and B lie on a line in that order. CB = 4 cm and DB = 7 cm. D is the midpoint of AC. Find AB.",
        "choices": [
          "7 cm",
          "8 cm",
          "9 cm",
          "10 cm"
        ],
        "correct": 3,
        "tip": "Find DC first. The midpoint tells you AD equals DC, not DB.",
        "explanation": "DC = DB − CB = 7 − 4 = 3 cm. AD = DC = 3 cm. Therefore AB = AD + DB = 3 + 7 = 10 cm.",
        "visual": {
          "kind": "midpoint",
          "cb": 4,
          "db": 7
        }
      },
      {
        "source": 2049,
        "test": 2,
        "number": 49,
        "skill": "Exterior angle of a cyclic quadrilateral",
        "prompt": "ABCD is inscribed in a circle. DC is extended through C to E. If ∠A = 50°, find ∠BCE.",
        "choices": [
          "25°",
          "100°",
          "130°",
          "50°"
        ],
        "correct": 3,
        "tip": "For a cyclic quadrilateral, an exterior angle equals the opposite interior angle.",
        "explanation": "Opposite interior angles add to 180°, so ∠BCD = 180° − 50° = 130°. Since D, C and E are collinear, ∠BCE = 180° − 130° = 50°.",
        "visual": {
          "kind": "cyclic",
          "angle": 50
        }
      },
      {
        "source": 2051,
        "test": 2,
        "number": 51,
        "skill": "Median from a frequency table",
        "prompt": "The table lists the heights of 45 students. Find the median height in centimeters.",
        "choices": [
          "148",
          "143",
          "145.5",
          "153"
        ],
        "correct": 1,
        "tip": "Sort the HEIGHTS first, keeping each frequency with its height. Find the 23rd student.",
        "explanation": "The middle position is (45 + 1) ÷ 2 = 23. In ascending order, 118 cm covers positions 1–12, 121 cm covers 13–14, and 143 cm covers 15–25. The 23rd height is 143 cm.",
        "visual": {
          "kind": "table",
          "headers": [
            "Height (cm)",
            "118",
            "160",
            "154",
            "121",
            "143",
            "145"
          ],
          "rows": [
            [
              "Number of students",
              12,
              5,
              8,
              2,
              11,
              7
            ]
          ]
        }
      },
      {
        "source": 2052,
        "test": 2,
        "number": 52,
        "skill": "Comparing table totals",
        "prompt": "The table shows computers made by two companies in four days. Which statement is true?",
        "choices": [
          "Over all four days, A made more than B.",
          "Over the last two days, A made more than B.",
          "On the first and last days together, A made fewer than B.",
          "Over the first two days, A made more than B."
        ],
        "correct": 3,
        "tip": "Add only the rows named by each statement; compare the two totals.",
        "explanation": "All four days: A = 100, B = 100. Last two: A = 56, B = 60. First and last: A = 64, B = 60. First two: A = 44, B = 40. Only D is true.",
        "visual": {
          "kind": "table",
          "headers": [
            "Day",
            "Company A",
            "Company B"
          ],
          "rows": [
            [
              1,
              24,
              24
            ],
            [
              2,
              20,
              16
            ],
            [
              3,
              16,
              24
            ],
            [
              4,
              40,
              36
            ]
          ]
        }
      },
      {
        "source": 2054,
        "test": 2,
        "number": 54,
        "skill": "Front view of cubes",
        "prompt": "Identify the front view of the shape. Look from the arrow marked Front.",
        "choices": [
          "Three squares in one horizontal row",
          "Three squares in a row, with another above the right end",
          "Four squares in a staggered vertical arrangement",
          "Two squares in one horizontal row"
        ],
        "correct": 0,
        "tip": "Looking from the front removes depth. A cube behind another does not add a new column.",
        "explanation": "The shape has three columns across the front, each one cube high. The extra cube behind the right column is hidden by that column. The front view is three squares in one horizontal row.",
        "visual": {
          "kind": "originalBlocks"
        },
        "choiceVisuals": [
          "front-a.png",
          "front-b.png",
          "front-c.png",
          "front-d.png"
        ]
      },
      {
        "source": 2055,
        "test": 2,
        "number": 55,
        "skill": "Edges of a pyramid",
        "prompt": "How many edges does a square pyramid have?",
        "choices": [
          "3",
          "4",
          "8",
          "5"
        ],
        "correct": 2,
        "tip": "Count the base edges, then the edges from the base corners to the apex.",
        "explanation": "A square base has 4 edges. Four more edges join its corners to the apex. Total: 4 + 4 = 8 edges. Five is the number of faces (and also vertices), not edges."
      },
      {
        "source": 2061,
        "test": 2,
        "number": 61,
        "skill": "What signs can you determine?",
        "prompt": "If a/b < 0 and bc > 0, which statement about abc is true?",
        "choices": [
          "abc must be negative",
          "abc must be positive",
          "abc can be positive or negative",
          "abc must equal zero"
        ],
        "correct": 2,
        "tip": "Try one example for each possible sign of b. If the outcomes differ, no single sign is forced.",
        "explanation": "For (a, b, c) = (−1, 1, 1), abc = −1. For (a, b, c) = (1, −1, −1), abc = 1. Both satisfy the conditions. No variable is zero, so abc cannot equal zero.",
        "note": "The original D says “Unable to determine,” which reasonably describes the sign. Zozeck marked it wrong and expected C (“> 0 or < 0”). This is an ambiguous source question, not a clear mathematical mistake. D is rewritten here so the practice has one correct choice."
      }
    ]
  },
  {
    "id": "math-a",
    "subject": "math",
    "number": 2,
    "label": "Similar questions",
    "questions": [
      {
        "source": 1041,
        "test": 1,
        "number": 41,
        "skill": "Dividing fractions",
        "tip": "Keep the first fraction; flip only the fraction you divide by.",
        "prompt": "Calculate 3/8 ÷ 3/4. Which method is INCORRECT?",
        "choices": [
          "3/8 ÷ 6/8",
          "(3 ÷ 3) ÷ (8 ÷ 4)",
          "3/8 × 4/3",
          "8/3 × 3/4"
        ],
        "correct": 3,
        "explanation": "The quotient is 1/2. Flipping the first fraction gives 8/3 × 3/4 = 2, so that method is incorrect."
      },
      {
        "source": 1042,
        "test": 1,
        "number": 42,
        "skill": "Comparing fraction products",
        "tip": "Estimate the two bounds, then compare each product with them.",
        "prompt": "Which product is between 1/4 and 3/4?",
        "choices": [
          "1/3 × 1/2",
          "5/4 × 1/2",
          "7/8 × 2",
          "1/4 × 1/2"
        ],
        "correct": 1,
        "explanation": "The products are 1/8, 1/6, 5/8 and 7/4. Only 5/8 is between 1/4 and 3/4."
      },
      {
        "source": 1044,
        "test": 1,
        "number": 44,
        "skill": "What makes an equation linear?",
        "tip": "Check TWO things: the exponent must be 1, and the coefficient must not be 0.",
        "prompt": "If (n + 3)x^(|n| − 2) − 5 = 0 is linear in x, what is n?",
        "choices": [
          "−3",
          "2",
          "3",
          "±3"
        ],
        "correct": 2,
        "explanation": "The exponent condition gives |n| − 2 = 1, so n = ±3. The coefficient n + 3 cannot be zero; exclude −3. Thus n = 3."
      },
      {
        "source": 1045,
        "test": 1,
        "number": 45,
        "skill": "Linear equation in one variable",
        "tip": "Look for exactly one variable, with highest power 1.",
        "prompt": "Which is a linear equation in ONE variable?",
        "choices": [
          "x² − x = 6",
          "2x + 3y = 12",
          "xy + 4 = 9",
          "x + 5 = 12"
        ],
        "correct": 3,
        "explanation": "x + 5 = 12 has just one variable and its highest power is 1. The other choices involve a product, two variables, or a square."
      },
      {
        "source": 1046,
        "test": 1,
        "number": 46,
        "skill": "Equations with the same solution",
        "tip": "Use the equation without a to find the shared x-term, then substitute it into the other equation.",
        "prompt": "3x + 4a = 14 has the same solution for x as 3x − 2 = 0. Find a.",
        "choices": [
          "3",
          "4",
          "2",
          "−3"
        ],
        "correct": 0,
        "explanation": "The second equation gives 3x = 2. Then 2 + 4a = 14, so 4a = 12 and a = 3."
      },
      {
        "source": 1049,
        "test": 1,
        "number": 49,
        "skill": "Angle bisectors and perpendicular rays",
        "tip": "Halve the bisected angle, then subtract it from 90°.",
        "prompt": "AB and CD are straight lines through O. OM bisects ∠AOC and ON is perpendicular to OM, on the side shown. If ∠AOC = 100°, find ∠CON.",
        "choices": [
          "80°",
          "30°",
          "50°",
          "40°"
        ],
        "correct": 3,
        "explanation": "∠MOC = 100° ÷ 2 = 50°. Then ∠CON = 90° − 50° = 40°.",
        "visual": {
          "kind": "angles",
          "angle": 100
        }
      },
      {
        "source": 1051,
        "test": 1,
        "number": 51,
        "skill": "Reading a bar chart",
        "tip": "Read Teddy first, add the requested difference, then find the matching bar.",
        "prompt": "The chart shows toys in a shop. Which toy has 30 more than the number of teddies?",
        "choices": [
          "Balloon",
          "Ball",
          "Bat",
          "Ludo"
        ],
        "correct": 2,
        "explanation": "Teddy has 40. Add 30 to get 70, which matches Bat.",
        "visual": {
          "kind": "bars",
          "labels": [
            "Bat",
            "Balloon",
            "Teddy",
            "Ball",
            "Ludo"
          ],
          "values": [
            70,
            25,
            40,
            60,
            15
          ],
          "unit": "Number of toys"
        }
      },
      {
        "source": 1052,
        "test": 1,
        "number": 52,
        "skill": "Maximum and minimum on a chart",
        "tip": "Look for every tallest bar. A maximum can be tied.",
        "prompt": "Which years have the maximum and minimum purchases?",
        "choices": [
          "Maximum: 2018; minimum: 2020",
          "Maximum: 2019 and 2021; minimum: 2022",
          "Maximum: 2023; minimum: 2019",
          "Maximum: 2022; minimum: 2019 and 2021"
        ],
        "correct": 1,
        "explanation": "The tallest bars are tied in 2019 and 2021, at 90 tons. The shortest bar is 2022, at 10 tons.",
        "visual": {
          "kind": "bars",
          "labels": [
            2018,
            2019,
            2020,
            2021,
            2022,
            2023
          ],
          "values": [
            40,
            90,
            30,
            90,
            10,
            60
          ],
          "unit": "Tons"
        }
      },
      {
        "source": 1054,
        "test": 1,
        "number": 54,
        "skill": "Polygon patterns",
        "tip": "Count the sides instead of judging the size or shape.",
        "prompt": "What figure comes next in the pattern?",
        "choices": [
          "Pentagon",
          "Decagon",
          "Octagon",
          "Hexagon"
        ],
        "correct": 3,
        "explanation": "The number of sides rises by 1: 3, 4, 5, then 6. A six-sided polygon is a hexagon.",
        "visual": {
          "kind": "polygons",
          "sides": [
            3,
            4,
            5
          ]
        }
      },
      {
        "source": 1056,
        "test": 1,
        "number": 56,
        "skill": "Order of operations",
        "tip": "Do multiplication and division first; then work addition and subtraction from left to right.",
        "prompt": "7488 ÷ 48 − 90 + 14 × 11 − 20 = ?",
        "choices": [
          "190",
          "210",
          "200",
          "180"
        ],
        "correct": 2,
        "explanation": "Do division and multiplication first: 156 − 90 + 154 − 20 = 66 + 154 − 20 = 200."
      },
      {
        "source": 1057,
        "test": 1,
        "number": 57,
        "skill": "Division",
        "tip": "Break the dividend into easy multiples of the divisor, then add their quotients.",
        "prompt": "7488 ÷ 48 = ?",
        "choices": [
          "146",
          "166",
          "156",
          "176"
        ],
        "correct": 2,
        "explanation": "48 × 100 = 4800, 48 × 50 = 2400, and 48 × 6 = 288. Their sum is 7488, so the quotient is 156."
      },
      {
        "source": 1059,
        "test": 1,
        "number": 59,
        "skill": "Absolute value",
        "tip": "Absolute value is distance from zero. A negative number has a positive opposite.",
        "prompt": "Which statement expresses “The absolute value of a negative number is its opposite”?",
        "choices": [
          "|t| < 0, when t < 0",
          "|t| = t, when t < 0",
          "|t| = −t, when t < 0",
          "|t| = −t, when t > 0"
        ],
        "correct": 2,
        "explanation": "If t is negative, −t is positive. For example, t = −4 gives |t| = 4 = −t."
      },
      {
        "source": 1060,
        "test": 1,
        "number": 60,
        "skill": "Signs and distance from zero",
        "tip": "Separate position from distance: absolute value measures distance from zero.",
        "prompt": "The number line shows a and b. Which statement is correct?",
        "choices": [
          "|a| > |b|",
          "a > b",
          "ab > 0",
          "|a| < |b|"
        ],
        "correct": 3,
        "explanation": "a is between −1 and 0, so |a| < 1. b is between 1 and 2, so |b| > 1. Thus |a| < |b|.",
        "visual": {
          "kind": "numberline",
          "a": -0.5,
          "b": 1.5
        }
      },
      {
        "source": 2041,
        "test": 2,
        "number": 41,
        "skill": "A sum that cancels",
        "tip": "Split each term into half a difference. All the middle fractions cancel.",
        "prompt": "Compute 1/(1 × 3) + 1/(3 × 5) + … + 1/(11 × 13).",
        "choices": [
          "11/13",
          "1/13",
          "12/13",
          "6/13"
        ],
        "correct": 3,
        "explanation": "Each term equals half a difference: 1/[k(k + 2)] = (1/2) × [1/k − 1/(k + 2)]. The middle terms cancel, leaving (1/2) × (1 − 1/13) = 6/13."
      },
      {
        "source": 2042,
        "test": 2,
        "number": 42,
        "skill": "Finding the whole from a fraction change",
        "tip": "The extra amount represents the change in completed fraction. Divide the extra amount by that change.",
        "prompt": "Mia has read 1/4 of a book. Reading 30 more pages will bring her to 2/5. Which expression gives the total pages?",
        "choices": [
          "30 ÷ (2/5)",
          "30 ÷ (2/5 − 1/4)",
          "30 × (2/5 − 1/4)",
          "30 × 4"
        ],
        "correct": 1,
        "explanation": "The added fraction is 2/5 − 1/4 = 3/20. The total is 30 ÷ (3/20) = 200 pages."
      },
      {
        "source": 2043,
        "test": 2,
        "number": 43,
        "skill": "Aligning place values",
        "tip": "Line up the decimal points. Only matching place values can be combined directly.",
        "prompt": "In which expression do digits 6 and 2 occupy the same place-value column?",
        "choices": [
          "1.68 − 3.2",
          "6/7 − 2/3",
          "461 + 253",
          "6 + 2/10"
        ],
        "correct": 0,
        "explanation": "In 1.68 − 3.20, 6 and 2 both represent tenths. The digits in the other choices do not share a place-value column."
      },
      {
        "source": 2044,
        "test": 2,
        "number": 44,
        "skill": "Substitution and negative signs",
        "tip": "Find m and n separately, then put parentheses around the negative n.",
        "prompt": "x = −2 and y = 3 solve 2x + y = m and nx − y = 5. Find m − n.",
        "choices": [
          "3",
          "−3",
          "−5",
          "5"
        ],
        "correct": 0,
        "explanation": "m = 2(−2) + 3 = −1. Also −2n − 3 = 5, so n = −4. Thus m − n = −1 − (−4) = 3."
      },
      {
        "source": 2048,
        "test": 2,
        "number": 48,
        "skill": "Midpoints on a line",
        "tip": "Find DC first. The midpoint tells you AD equals DC, not DB.",
        "prompt": "A, D, C and B lie on a line in that order. D is the midpoint of AC. If CB = 5 cm and DB = 9 cm, find AB.",
        "choices": [
          "13 cm",
          "15 cm",
          "18 cm",
          "11 cm"
        ],
        "correct": 0,
        "explanation": "DC = 9 − 5 = 4 cm. AD = DC. Thus AB = AD + DB = 4 + 9 = 13 cm.",
        "visual": {
          "kind": "midpoint",
          "cb": 5,
          "db": 9
        }
      },
      {
        "source": 2049,
        "test": 2,
        "number": 49,
        "skill": "Exterior angle of a cyclic quadrilateral",
        "tip": "For a cyclic quadrilateral, an exterior angle equals the opposite interior angle.",
        "prompt": "ABCD is inscribed in a circle. DC is extended through C to E. If ∠A = 65°, find ∠BCE.",
        "choices": [
          "130°",
          "115°",
          "65°",
          "32°"
        ],
        "correct": 2,
        "explanation": "∠BCD = 180° − 65° = 115°. The exterior angle BCE is supplementary to BCD, so it is 65°.",
        "visual": {
          "kind": "cyclic",
          "angle": 65
        }
      },
      {
        "source": 2051,
        "test": 2,
        "number": 51,
        "skill": "Median from a frequency table",
        "tip": "Sort the heights and keep each frequency with its height. The middle position is (number of students + 1) ÷ 2.",
        "prompt": "The table gives the heights of 31 students. Find the median height in centimeters.",
        "choices": [
          "150",
          "145",
          "155",
          "140"
        ],
        "correct": 1,
        "explanation": "The median is the 16th height. Sorted: 140 cm covers positions 1–8; 145 cm covers 9–18. Thus the median is 145 cm.",
        "visual": {
          "kind": "table",
          "headers": [
            "Height (cm)",
            150,
            140,
            155,
            145
          ],
          "rows": [
            [
              "Number of students",
              6,
              8,
              7,
              10
            ]
          ]
        }
      },
      {
        "source": 2052,
        "test": 2,
        "number": 52,
        "skill": "Comparing table totals",
        "tip": "Add only the rows named by each statement; compare the two totals.",
        "prompt": "The table shows computers made in four days. Which statement is true?",
        "choices": [
          "Over all four days, A made more than B.",
          "Over the last two days, A made more than B.",
          "Over the first two days, A made more than B.",
          "On the first and last days together, A made fewer than B."
        ],
        "correct": 2,
        "explanation": "Four-day totals are both 100. Last two: A = 52, B = 55. First and last: A = 68, B = 58. First two: A = 48, B = 45. Only the first-two-days statement is true.",
        "visual": {
          "kind": "table",
          "headers": [
            "Day",
            "Company A",
            "Company B"
          ],
          "rows": [
            [
              1,
              30,
              25
            ],
            [
              2,
              18,
              20
            ],
            [
              3,
              14,
              22
            ],
            [
              4,
              38,
              33
            ]
          ]
        }
      },
      {
        "source": 2054,
        "test": 2,
        "number": 54,
        "skill": "Front view of cubes",
        "tip": "Looking from the front removes depth. A cube behind another does not add a new column.",
        "prompt": "The solid is made of cubes. Which column heights, from left to right, describe its FRONT view?",
        "choices": [
          "1, 2, 1",
          "2, 1, 2",
          "2, 2, 2",
          "1, 1, 1"
        ],
        "correct": 0,
        "explanation": "Ignore front-to-back depth. The three visible column heights are 1, 2, 1.",
        "visual": {
          "kind": "cubes",
          "heights": [
            1,
            2,
            1
          ]
        }
      },
      {
        "source": 2055,
        "test": 2,
        "number": 55,
        "skill": "Edges of a pyramid",
        "tip": "Count the base edges, then the edges from the base corners to the apex.",
        "prompt": "How many edges does a pentagonal pyramid have?",
        "choices": [
          "10",
          "15",
          "6",
          "5"
        ],
        "correct": 0,
        "explanation": "The base has 5 edges. Another 5 edges connect its vertices to the apex. Total: 5 + 5 = 10."
      },
      {
        "source": 2061,
        "test": 2,
        "number": 61,
        "skill": "What signs can you determine?",
        "tip": "Try one example for each possible sign of b. If the outcomes differ, no single sign is forced.",
        "prompt": "If a/b < 0 and bc < 0, which statement about ac is always true?",
        "choices": [
          "ac = 0",
          "ac < 0",
          "ac can have either sign",
          "ac > 0"
        ],
        "correct": 3,
        "explanation": "a and b have opposite signs; b and c also have opposite signs. Therefore a and c have the same sign, so ac > 0."
      }
    ]
  },
  {
    "id": "math-b",
    "subject": "math",
    "number": 3,
    "label": "Timed similar questions",
    "timeLimitSeconds": 1440,
    "questions": [
      {
        "source": 1041,
        "test": 1,
        "number": 41,
        "skill": "Dividing fractions",
        "tip": "Keep the first fraction; flip only the fraction you divide by.",
        "prompt": "Calculate 5/12 ÷ 5/6. Which method is INCORRECT?",
        "choices": [
          "(5 ÷ 5) ÷ (12 ÷ 6)",
          "12/5 × 5/6",
          "5/12 ÷ 10/12",
          "5/12 × 6/5"
        ],
        "correct": 1,
        "explanation": "The quotient is 1/2. Flipping the first fraction gives 12/5 × 5/6 = 2, which is incorrect."
      },
      {
        "source": 1042,
        "test": 1,
        "number": 42,
        "skill": "Comparing fraction products",
        "tip": "Estimate the two bounds, then compare each product with them.",
        "prompt": "Which product is between 2/5 and 4/5?",
        "choices": [
          "5/8 × 2",
          "1/5 × 1",
          "3/2 × 2/5",
          "2/7 × 1"
        ],
        "correct": 2,
        "explanation": "The products are 1/5, 2/7, 3/5 and 5/4. Only 3/5 lies between 2/5 and 4/5."
      },
      {
        "source": 1044,
        "test": 1,
        "number": 44,
        "skill": "What makes an equation linear?",
        "tip": "Check TWO things: the exponent must be 1, and the coefficient must not be 0.",
        "prompt": "If (n − 4)x^(|n| − 3) − 7 = 0 is linear in x, what is n?",
        "choices": [
          "−4",
          "3",
          "4",
          "±4"
        ],
        "correct": 0,
        "explanation": "The exponent must be 1, giving |n| = 4. But n = 4 makes the coefficient zero. Therefore n = −4."
      },
      {
        "source": 1045,
        "test": 1,
        "number": 45,
        "skill": "Linear equation in one variable",
        "tip": "Look for exactly one variable, with highest power 1.",
        "prompt": "Which is a linear equation in ONE variable?",
        "choices": [
          "t² + 1 = 5",
          "5t − 7 = 18",
          "t + u = 9",
          "2ab = 10"
        ],
        "correct": 1,
        "explanation": "5t − 7 = 18 has exactly one variable to the first power. The other equations contain a product, a square, or two variables."
      },
      {
        "source": 1046,
        "test": 1,
        "number": 46,
        "skill": "Equations with the same solution",
        "tip": "Use the equation without a to find the shared x-term, then substitute it into the other equation.",
        "prompt": "5x + 3a = 14 has the same solution for x as 5x − 8 = 0. Find a.",
        "choices": [
          "2",
          "6",
          "3",
          "−2"
        ],
        "correct": 0,
        "explanation": "5x = 8. Substitute into the first equation: 8 + 3a = 14, so a = 2."
      },
      {
        "source": 1049,
        "test": 1,
        "number": 49,
        "skill": "Angle bisectors and perpendicular rays",
        "tip": "Halve the bisected angle, then subtract it from 90°.",
        "prompt": "AB and CD are straight lines through O. OM bisects ∠AOC and ON is perpendicular to OM, on the side shown. If ∠AOC = 80°, find ∠CON.",
        "choices": [
          "30°",
          "80°",
          "40°",
          "50°"
        ],
        "correct": 3,
        "explanation": "∠MOC = 80° ÷ 2 = 40°. Then ∠CON = 90° − 40° = 50°.",
        "visual": {
          "kind": "angles",
          "angle": 80
        }
      },
      {
        "source": 1051,
        "test": 1,
        "number": 51,
        "skill": "Reading a bar chart",
        "tip": "Read Teddy first, add the requested difference, then find the matching bar.",
        "prompt": "The chart shows toys in a shop. Which toy has 30 more than the number of teddies?",
        "choices": [
          "Bat",
          "Ball",
          "Balloon",
          "Ludo"
        ],
        "correct": 1,
        "explanation": "Teddy has 50. Add 30 to get 80, which matches Ball.",
        "visual": {
          "kind": "bars",
          "labels": [
            "Bat",
            "Balloon",
            "Teddy",
            "Ball",
            "Ludo"
          ],
          "values": [
            30,
            20,
            50,
            80,
            10
          ],
          "unit": "Number of toys"
        }
      },
      {
        "source": 1052,
        "test": 1,
        "number": 52,
        "skill": "Maximum and minimum on a chart",
        "tip": "Look for every tallest bar. A maximum can be tied.",
        "prompt": "Which years have the maximum and minimum purchases?",
        "choices": [
          "Maximum: 2022 and 2024; minimum: 2025",
          "Maximum: 2025; minimum: 2021",
          "Maximum: 2025; minimum: 2022 and 2024",
          "Maximum: 2020; minimum: 2022"
        ],
        "correct": 0,
        "explanation": "The tallest bars are tied in 2022 and 2024, at 100 tons. The shortest bar is 2025, at 10 tons.",
        "visual": {
          "kind": "bars",
          "labels": [
            2020,
            2021,
            2022,
            2023,
            2024,
            2025
          ],
          "values": [
            80,
            20,
            100,
            40,
            100,
            10
          ],
          "unit": "Tons"
        }
      },
      {
        "source": 1054,
        "test": 1,
        "number": 54,
        "skill": "Polygon patterns",
        "tip": "Count the sides instead of judging the size or shape.",
        "prompt": "What figure comes next in the pattern?",
        "choices": [
          "Hexagon",
          "Decagon",
          "Pentagon",
          "Octagon"
        ],
        "correct": 1,
        "explanation": "The number of sides rises by 2: 4, 6, 8, then 10. A ten-sided polygon is a decagon.",
        "visual": {
          "kind": "polygons",
          "sides": [
            4,
            6,
            8
          ]
        }
      },
      {
        "source": 1056,
        "test": 1,
        "number": 56,
        "skill": "Order of operations",
        "tip": "Do multiplication and division first; then work addition and subtraction from left to right.",
        "prompt": "9072 ÷ 72 − 80 + 16 × 9 − 30 = ?",
        "choices": [
          "170",
          "160",
          "150",
          "180"
        ],
        "correct": 1,
        "explanation": "9072 ÷ 72 = 126; 16 × 9 = 144. Then 126 − 80 + 144 − 30 = 46 + 144 − 30 = 160."
      },
      {
        "source": 1057,
        "test": 1,
        "number": 57,
        "skill": "Division",
        "tip": "Break the dividend into easy multiples of the divisor, then add their quotients.",
        "prompt": "9072 ÷ 72 = ?",
        "choices": [
          "125",
          "126",
          "128",
          "124"
        ],
        "correct": 1,
        "explanation": "72 × 100 = 7200, leaving 1872. 72 × 20 = 1440, leaving 432. 72 × 6 = 432. Total quotient: 126."
      },
      {
        "source": 1059,
        "test": 1,
        "number": 59,
        "skill": "Absolute value",
        "tip": "Absolute value is distance from zero. A negative number has a positive opposite.",
        "prompt": "If z < 0, which expression equals |z|?",
        "choices": [
          "z",
          "1/z",
          "0",
          "−z"
        ],
        "correct": 3,
        "explanation": "Absolute value is nonnegative. Since z is negative, its opposite −z is positive and equals |z|."
      },
      {
        "source": 1060,
        "test": 1,
        "number": 60,
        "skill": "Signs and distance from zero",
        "tip": "Separate position from distance: absolute value measures distance from zero.",
        "prompt": "The number line shows a and b. Which statement is correct?",
        "choices": [
          "ab < 0",
          "a > b",
          "a + b = 0",
          "|a| < |b|"
        ],
        "correct": 0,
        "explanation": "a is negative and b is positive, so their product is negative. Also |a| > 1 while |b| < 1.",
        "visual": {
          "kind": "numberline",
          "a": -1.5,
          "b": 0.5
        }
      },
      {
        "source": 2041,
        "test": 2,
        "number": 41,
        "skill": "A sum that cancels",
        "tip": "Split each term into half a difference. All the middle fractions cancel.",
        "prompt": "Compute 1/(1 × 3) + 1/(3 × 5) + … + 1/(15 × 17).",
        "choices": [
          "16/17",
          "8/17",
          "15/17",
          "1/17"
        ],
        "correct": 1,
        "explanation": "Each term equals half a difference: 1/[k(k + 2)] = (1/2) × [1/k − 1/(k + 2)]. The middle terms cancel, leaving (1/2) × (1 − 1/17) = 8/17."
      },
      {
        "source": 2042,
        "test": 2,
        "number": 42,
        "skill": "Finding the whole from a fraction change",
        "tip": "The extra amount represents the change in completed fraction. Divide the extra amount by that change.",
        "prompt": "Leo has filled 2/7 of a sticker album. Adding 36 stickers will bring him to 1/2. Which expression gives the total number of sticker spaces?",
        "choices": [
          "36 ÷ (1/2 − 2/7)",
          "36 ÷ (1/2)",
          "36 × 7",
          "36 × (1/2 − 2/7)"
        ],
        "correct": 0,
        "explanation": "The increase is 1/2 − 2/7 = 3/14. The total is 36 ÷ (3/14) = 168 spaces."
      },
      {
        "source": 2043,
        "test": 2,
        "number": 43,
        "skill": "Aligning place values",
        "tip": "Line up the decimal points. Only matching place values can be combined directly.",
        "prompt": "In which expression do digits 5 and 4 occupy the same place-value column?",
        "choices": [
          "352 + 418",
          "5/8 − 4/7",
          "5 + 4/10",
          "2.57 − 1.4"
        ],
        "correct": 3,
        "explanation": "In 2.57 − 1.40, 5 and 4 both represent tenths. Line up the decimal points before subtracting."
      },
      {
        "source": 2044,
        "test": 2,
        "number": 44,
        "skill": "Substitution and negative signs",
        "tip": "Find m and n separately, then put parentheses around the negative n.",
        "prompt": "x = −3 and y = 2 solve x + 4y = m and nx − y = 4. Find m − n.",
        "choices": [
          "7",
          "9",
          "3",
          "5"
        ],
        "correct": 0,
        "explanation": "m = −3 + 4(2) = 5. Also −3n − 2 = 4, so n = −2. Then m − n = 5 − (−2) = 7."
      },
      {
        "source": 2048,
        "test": 2,
        "number": 48,
        "skill": "Midpoints on a line",
        "tip": "Find DC first. The midpoint tells you AD equals DC, not DB.",
        "prompt": "A, D, C and B lie on a line in that order. D is the midpoint of AC. If CB = 6 cm and DB = 11 cm, find AB.",
        "choices": [
          "22 cm",
          "18 cm",
          "14 cm",
          "16 cm"
        ],
        "correct": 3,
        "explanation": "DC = 11 − 6 = 5 cm. AD = DC. Thus AB = AD + DB = 5 + 11 = 16 cm.",
        "visual": {
          "kind": "midpoint",
          "cb": 6,
          "db": 11
        }
      },
      {
        "source": 2049,
        "test": 2,
        "number": 49,
        "skill": "Exterior angle of a cyclic quadrilateral",
        "tip": "For a cyclic quadrilateral, an exterior angle equals the opposite interior angle.",
        "prompt": "ABCD is inscribed in a circle. DC is extended through C to E. If ∠A = 72°, find ∠BCE.",
        "choices": [
          "144°",
          "36°",
          "72°",
          "108°"
        ],
        "correct": 2,
        "explanation": "∠BCD = 180° − 72° = 108°. The exterior angle BCE is supplementary to BCD, so it is 72°.",
        "visual": {
          "kind": "cyclic",
          "angle": 72
        }
      },
      {
        "source": 2051,
        "test": 2,
        "number": 51,
        "skill": "Median from a frequency table",
        "tip": "Sort the heights and keep each frequency with its height. The middle position is (number of students + 1) ÷ 2.",
        "prompt": "The table gives the heights of 35 students. Find the median height in centimeters.",
        "choices": [
          "142",
          "158",
          "152",
          "148"
        ],
        "correct": 2,
        "explanation": "The median is the 18th height. Sorted: 142 cm covers 1–7, 148 cm covers 8–16, and 152 cm covers 17–24. Thus the median is 152 cm.",
        "visual": {
          "kind": "table",
          "headers": [
            "Height (cm)",
            158,
            142,
            152,
            148
          ],
          "rows": [
            [
              "Number of students",
              11,
              7,
              8,
              9
            ]
          ]
        }
      },
      {
        "source": 2052,
        "test": 2,
        "number": 52,
        "skill": "Comparing table totals",
        "tip": "Add only the rows named by each statement; compare the two totals.",
        "prompt": "The table shows computers made in four days. Which statement is true?",
        "choices": [
          "On the first and last days together, A made fewer than B.",
          "Over the first two days, A made more than B.",
          "Over the last two days, A made more than B.",
          "Over all four days, A made more than B."
        ],
        "correct": 1,
        "explanation": "Four-day totals are both 100. Last two: A = 50, B = 56. First and last: A = 60, B = 54. First two: A = 50, B = 44. Only the first-two-days statement is true.",
        "visual": {
          "kind": "table",
          "headers": [
            "Day",
            "Company A",
            "Company B"
          ],
          "rows": [
            [
              1,
              28,
              24
            ],
            [
              2,
              22,
              20
            ],
            [
              3,
              18,
              26
            ],
            [
              4,
              32,
              30
            ]
          ]
        }
      },
      {
        "source": 2054,
        "test": 2,
        "number": 54,
        "skill": "Front view of cubes",
        "tip": "Looking from the front removes depth. A cube behind another does not add a new column.",
        "prompt": "The solid is made of cubes. Which column heights, from left to right, describe its FRONT view?",
        "choices": [
          "2, 1, 2",
          "1, 2, 1",
          "1, 1, 1",
          "2, 2, 2"
        ],
        "correct": 0,
        "explanation": "Ignore front-to-back depth. The three visible column heights are 2, 1, 2.",
        "visual": {
          "kind": "cubes",
          "heights": [
            2,
            1,
            2
          ]
        }
      },
      {
        "source": 2055,
        "test": 2,
        "number": 55,
        "skill": "Edges of a pyramid",
        "tip": "Count the base edges, then the edges from the base corners to the apex.",
        "prompt": "How many edges does a hexagonal pyramid have?",
        "choices": [
          "12",
          "7",
          "18",
          "6"
        ],
        "correct": 0,
        "explanation": "The base has 6 edges. Another 6 edges connect its vertices to the apex. Total: 6 + 6 = 12."
      },
      {
        "source": 2061,
        "test": 2,
        "number": 61,
        "skill": "What signs can you determine?",
        "tip": "Try one example for each possible sign of b. If the outcomes differ, no single sign is forced.",
        "prompt": "If a/b > 0 and bc < 0, which statement about ac is always true?",
        "choices": [
          "ac can have either sign",
          "ac = 0",
          "ac < 0",
          "ac > 0"
        ],
        "correct": 2,
        "explanation": "a and b have the same sign, while b and c have opposite signs. Thus a and c have opposite signs and ac < 0."
      }
    ]
  }
];
