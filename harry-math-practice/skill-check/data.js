(function(root){root.HarrySkillData = {
  "courseId": "harry-eight-skills-20261030",
  "appId": "harry-math-eight-skills-20261030-v1",
  "title": "Harry’s Daily Math",
  "skills": [
    {
      "id": "fractions",
      "name": "Fraction operations",
      "description": "Subtract unlike fractions, multiply mixed numbers, and find how many fractional groups fit."
    },
    {
      "id": "calculation",
      "name": "Calculation accuracy",
      "description": "Multiply, regroup in subtraction, and check division and remainders."
    },
    {
      "id": "area",
      "name": "Area and missing dimensions",
      "description": "Distinguish area from perimeter and find an unknown side."
    },
    {
      "id": "scaling",
      "name": "Scaling",
      "description": "Use the same scale factor on corresponding dimensions."
    },
    {
      "id": "rounding",
      "name": "Rounding and estimation",
      "description": "Round to the requested place and estimate in the requested order."
    },
    {
      "id": "units",
      "name": "Unit conversion",
      "description": "Use pounds and ounces, liquid measures, and lengths."
    },
    {
      "id": "coordinates",
      "name": "Coordinate order",
      "description": "Read and locate points using horizontal position first, then vertical."
    },
    {
      "id": "median",
      "name": "Median",
      "description": "Order the data; use one middle value or average two middle values."
    }
  ],
  "sessions": [
    {
      "id": "mixed-1",
      "number": 1,
      "title": "Session 1",
      "questions": [
        {
          "id": "s1-calculation-1",
          "skill": "calculation",
          "facet": "multiplication",
          "prompt": "Multiply: 47 × 26",
          "choices": [
            "1,212",
            "1,322",
            "1,122",
            "1,222"
          ],
          "correct": 3,
          "explanation": "47 × 20 = 940 and 47 × 6 = 282. Add the partial products: 940 + 282 = 1,222.",
          "check": {
            "kind": "multiply",
            "args": [
              47,
              26
            ]
          }
        },
        {
          "id": "s1-units-1",
          "skill": "units",
          "facet": "weight",
          "prompt": "5 pounds = ____ ounces",
          "choices": [
            "60",
            "64",
            "20",
            "80"
          ],
          "correct": 3,
          "explanation": "One pound is 16 ounces. Multiply: 5 × 16 = 80 ounces.",
          "check": {
            "kind": "multiply",
            "args": [
              5,
              16
            ]
          }
        },
        {
          "id": "s1-fractions-1",
          "skill": "fractions",
          "facet": "unlike-subtraction",
          "prompt": "Subtract: 3/4 − 1/6. Give the answer in simplest form.",
          "choices": [
            "2/2",
            "7/12",
            "2/12",
            "1/2"
          ],
          "correct": 1,
          "explanation": "Use twelfths: 3/4 = 9/12 and 1/6 = 2/12. Subtract: 9/12 − 2/12 = 7/12.",
          "check": {
            "kind": "subtractFractions",
            "args": [
              3,
              4,
              1,
              6
            ]
          }
        },
        {
          "id": "s1-area-1",
          "skill": "area",
          "facet": "find-area",
          "prompt": "A rectangular wall is 70 inches high and 30 inches wide. What is its area?",
          "choices": [
            "100 square inches",
            "2,100 square inches",
            "200 square inches",
            "210 square inches"
          ],
          "correct": 1,
          "explanation": "Area measures the surface covered. Multiply the dimensions: 70 × 30 = 2,100 square inches.",
          "check": {
            "kind": "area",
            "args": [
              70,
              30
            ]
          }
        },
        {
          "id": "s1-median-1",
          "skill": "median",
          "facet": "odd",
          "prompt": "Find the median: 18, 7, 12, 20, 9",
          "choices": [
            "9",
            "18",
            "12",
            "13.2"
          ],
          "correct": 2,
          "explanation": "Put the numbers in order: 7, 9, 12, 18, 20. The middle of five numbers is 12.",
          "check": {
            "kind": "median",
            "args": [
              18,
              7,
              12,
              20,
              9
            ]
          }
        },
        {
          "id": "s1-scaling-1",
          "skill": "scaling",
          "facet": "enlarge",
          "prompt": "A photo is 4 cm wide and 10 cm long. It is enlarged without changing its shape. The new length is 30 cm. What is the new width?",
          "choices": [
            "24 cm",
            "12 cm",
            "14 cm",
            "8 cm"
          ],
          "correct": 1,
          "explanation": "The length is multiplied by 3: 10 × 3 = 30. Multiply the width by the same factor: 4 × 3 = 12 cm.",
          "check": {
            "kind": "scale",
            "args": [
              4,
              10,
              30
            ]
          }
        },
        {
          "id": "s1-rounding-1",
          "skill": "rounding",
          "facet": "mixed-estimate",
          "prompt": "Estimate by rounding each mixed number to the nearest whole number: 14 8/9 − 11 1/10",
          "choices": [
            "3",
            "14",
            "4",
            "26"
          ],
          "correct": 2,
          "explanation": "14 8/9 rounds to 15. 11 1/10 rounds to 11. Subtract the rounded values: 15 − 11 = 4.",
          "check": {
            "kind": "mixedEstimate",
            "args": [
              14,
              8,
              9,
              11,
              1,
              10
            ]
          }
        },
        {
          "id": "s1-coordinates-1",
          "skill": "coordinates",
          "facet": "read-point",
          "prompt": "What are the coordinates of point P?",
          "choices": [
            "(7, 3)",
            "(4, 7)",
            "(3, 8)",
            "(3, 7)"
          ],
          "correct": 3,
          "explanation": "Read horizontal position first, then vertical position. Point P is 3 units right and 7 units up from the origin, so its coordinates are (3, 7).",
          "visual": {
            "type": "coordinate-grid",
            "x": 3,
            "y": 7,
            "label": "P"
          },
          "check": {
            "kind": "coordinate",
            "args": [
              3,
              7
            ]
          }
        },
        {
          "id": "s1-area-2",
          "skill": "area",
          "facet": "missing-side",
          "prompt": "A rectangle has an area of 72 square centimeters and a length of 9 centimeters. What is its width?",
          "choices": [
            "63 centimeters",
            "17 centimeters",
            "8 centimeters",
            "9 centimeters"
          ],
          "correct": 2,
          "explanation": "Area = length × width, so width = area ÷ length. Calculate 72 ÷ 9 = 8 centimeters.",
          "check": {
            "kind": "divide",
            "args": [
              72,
              9
            ]
          }
        },
        {
          "id": "s1-median-2",
          "skill": "median",
          "facet": "even",
          "prompt": "Find the median: 146, 172, 150, 164",
          "choices": [
            "150",
            "164",
            "158",
            "157"
          ],
          "correct": 3,
          "explanation": "Order the numbers: 146, 150, 164, 172. Average the two middle values: (150 + 164) ÷ 2 = 157.",
          "check": {
            "kind": "median",
            "args": [
              146,
              172,
              150,
              164
            ]
          }
        },
        {
          "id": "s1-scaling-2",
          "skill": "scaling",
          "facet": "reduce",
          "prompt": "A rectangle is 18 cm by 12 cm. A smaller copy has its 18 cm side reduced to 9 cm. How long is the other side?",
          "choices": [
            "3 cm",
            "21 cm",
            "6 cm",
            "24 cm"
          ],
          "correct": 2,
          "explanation": "18 becomes 9 by dividing by 2. Divide the other side by 2 too: 12 ÷ 2 = 6 cm.",
          "check": {
            "kind": "scale",
            "args": [
              12,
              18,
              9
            ]
          }
        },
        {
          "id": "s1-rounding-2",
          "skill": "rounding",
          "facet": "round-first",
          "prompt": "Round each number to the nearest hundredth FIRST, then subtract: 0.067 − 0.013",
          "choices": [
            "0.05",
            "0.054",
            "0.08",
            "0.06"
          ],
          "correct": 3,
          "explanation": "0.067 rounds to 0.07 and 0.013 rounds to 0.01. Then 0.07 − 0.01 = 0.06.",
          "check": {
            "kind": "roundDifference",
            "args": [
              67,
              13,
              1000
            ]
          }
        },
        {
          "id": "s1-coordinates-2",
          "skill": "coordinates",
          "facet": "read-point",
          "prompt": "What are the coordinates of point K?",
          "choices": [
            "(8, 2)",
            "(2, 8)",
            "(9, 2)",
            "(8, 3)"
          ],
          "correct": 0,
          "explanation": "Read horizontal position first, then vertical position. Point K is 8 units right and 2 units up from the origin, so its coordinates are (8, 2).",
          "visual": {
            "type": "coordinate-grid",
            "x": 8,
            "y": 2,
            "label": "K"
          },
          "check": {
            "kind": "coordinate",
            "args": [
              8,
              2
            ]
          }
        },
        {
          "id": "s1-calculation-2",
          "skill": "calculation",
          "facet": "regrouping",
          "prompt": "Subtract: 734 − 286",
          "choices": [
            "448",
            "552",
            "458",
            "548"
          ],
          "correct": 0,
          "explanation": "Regroup 734 as 6 hundreds, 12 tens, and 14 ones. Subtract 2 hundreds, 8 tens, and 6 ones to get 448. Check: 448 + 286 = 734.",
          "check": {
            "kind": "subtract",
            "args": [
              734,
              286
            ]
          }
        },
        {
          "id": "s1-units-2",
          "skill": "units",
          "facet": "liquid",
          "prompt": "28 pints = ____ quarts",
          "choices": [
            "14",
            "7",
            "56",
            "112"
          ],
          "correct": 0,
          "explanation": "Two pints make one quart. Divide: 28 ÷ 2 = 14 quarts.",
          "check": {
            "kind": "divide",
            "args": [
              28,
              2
            ]
          }
        },
        {
          "id": "s1-fractions-2",
          "skill": "fractions",
          "facet": "mixed-multiplication",
          "prompt": "Multiply: 1 3/4 × 4",
          "choices": [
            "5 3/4",
            "4 3/4",
            "7",
            "12"
          ],
          "correct": 2,
          "explanation": "Four groups of 1 3/4 contain 4 wholes and 12 quarters. That is 4 + 3 = 7. You can also calculate 7/4 × 4 = 7.",
          "check": {
            "kind": "mixedMultiply",
            "args": [
              1,
              3,
              4,
              4
            ]
          }
        },
        {
          "id": "s1-rounding-3",
          "skill": "rounding",
          "facet": "place",
          "prompt": "Round 46.738 to the nearest hundredth.",
          "choices": [
            "46.74",
            "46.73",
            "46.7",
            "47"
          ],
          "correct": 0,
          "explanation": "The hundredths digit is 3. The thousandths digit is 8, so increase the hundredths digit to 4: 46.74.",
          "check": {
            "kind": "round",
            "args": [
              46738,
              1000,
              100
            ]
          }
        },
        {
          "id": "s1-coordinates-3",
          "skill": "coordinates",
          "facet": "axis",
          "prompt": "What are the coordinates of point M?",
          "choices": [
            "(6, 0)",
            "(0, 6)",
            "(1, 6)",
            "(0, 7)"
          ],
          "correct": 1,
          "explanation": "Read horizontal position first, then vertical position. Point M is 0 units right and 6 units up from the origin, so its coordinates are (0, 6).",
          "visual": {
            "type": "coordinate-grid",
            "x": 0,
            "y": 6,
            "label": "M"
          },
          "check": {
            "kind": "coordinate",
            "args": [
              0,
              6
            ]
          }
        },
        {
          "id": "s1-calculation-3",
          "skill": "calculation",
          "facet": "remainder",
          "prompt": "Divide 4,727 by 20. Express the quotient as a mixed number.",
          "choices": [
            "236 1/20",
            "236 7/20",
            "237 7/20",
            "236 7/10"
          ],
          "correct": 1,
          "explanation": "20 × 236 = 4,720, leaving 7. Put the remainder over the divisor: 236 7/20. Check: 4,720 + 7 = 4,727.",
          "check": {
            "kind": "mixedDivide",
            "args": [
              4727,
              20
            ]
          }
        },
        {
          "id": "s1-units-3",
          "skill": "units",
          "facet": "length",
          "prompt": "4 yards = ____ inches",
          "choices": [
            "48",
            "144",
            "12",
            "36"
          ],
          "correct": 1,
          "explanation": "One yard is 3 feet and each foot is 12 inches. One yard is 36 inches, so 4 × 36 = 144 inches.",
          "check": {
            "kind": "multiply",
            "args": [
              4,
              36
            ]
          }
        },
        {
          "id": "s1-fractions-3",
          "skill": "fractions",
          "facet": "fraction-division",
          "prompt": "There is 3/4 yard of ribbon. Each bookmark needs 1/8 yard. How many bookmarks can be made?",
          "choices": [
            "3",
            "8",
            "4",
            "6"
          ],
          "correct": 3,
          "explanation": "Rewrite 3/4 as 6/8. Six pieces of 1/8 yard fit into 6/8 yard, so 6 bookmarks can be made.",
          "check": {
            "kind": "divideFractions",
            "args": [
              3,
              4,
              1,
              8
            ]
          }
        },
        {
          "id": "s1-area-3",
          "skill": "area",
          "facet": "area-perimeter",
          "prompt": "A garden is 13 feet long and 6 feet wide. Which calculation finds the amount of ground inside the garden, in square feet?",
          "choices": [
            "13 + 6",
            "2 × (13 + 6)",
            "13 − 6",
            "13 × 6"
          ],
          "correct": 3,
          "explanation": "The ground inside is the area. Multiply length by width: 13 × 6 = 78 square feet. Adding all four sides would find perimeter.",
          "check": {
            "kind": "expression",
            "answer": "13 × 6"
          }
        },
        {
          "id": "s1-median-3",
          "skill": "median",
          "facet": "even",
          "prompt": "Six children read 11, 4, 8, 15, 6, and 9 books. What is the median number of books?",
          "choices": [
            "8.5",
            "8",
            "9",
            "8.83"
          ],
          "correct": 0,
          "explanation": "Order the values: 4, 6, 8, 9, 11, 15. The two middle values are 8 and 9. Their average is 8.5.",
          "check": {
            "kind": "median",
            "args": [
              11,
              4,
              8,
              15,
              6,
              9
            ]
          }
        },
        {
          "id": "s1-scaling-3",
          "skill": "scaling",
          "facet": "relationship",
          "prompt": "A model tree is 8 cm tall. A real tree is n times as tall. Which equation gives the real tree’s height h in centimeters?",
          "choices": [
            "h = 8 + n",
            "h = n − 8",
            "h = 8 ÷ n",
            "h = 8n"
          ],
          "correct": 3,
          "explanation": "“n times” means multiply 8 by n: h = 8n.",
          "check": {
            "kind": "expression",
            "answer": "h = 8n"
          }
        }
      ]
    },
    {
      "id": "mixed-2",
      "number": 2,
      "title": "Session 2",
      "questions": [
        {
          "id": "s2-median-1",
          "skill": "median",
          "facet": "odd",
          "prompt": "Find the median: 31, 46, 27, 35, 42",
          "choices": [
            "35",
            "31",
            "42",
            "36.2"
          ],
          "correct": 0,
          "explanation": "Order the data: 27, 31, 35, 42, 46. The middle value is 35.",
          "check": {
            "kind": "median",
            "args": [
              31,
              46,
              27,
              35,
              42
            ]
          }
        },
        {
          "id": "s2-area-1",
          "skill": "area",
          "facet": "find-area",
          "prompt": "A rectangular stage is 18 feet long and 7 feet wide. How many square feet does it cover?",
          "choices": [
            "50 square feet",
            "25 square feet",
            "116 square feet",
            "126 square feet"
          ],
          "correct": 3,
          "explanation": "Multiply length by width: 18 × 7 = 126 square feet.",
          "check": {
            "kind": "area",
            "args": [
              18,
              7
            ]
          }
        },
        {
          "id": "s2-coordinates-1",
          "skill": "coordinates",
          "facet": "read-point",
          "prompt": "What are the coordinates of point P?",
          "choices": [
            "(9, 6)",
            "(6, 9)",
            "(7, 9)",
            "(6, 10)"
          ],
          "correct": 1,
          "explanation": "Read horizontal position first, then vertical position. Point P is 6 units right and 9 units up from the origin, so its coordinates are (6, 9).",
          "visual": {
            "type": "coordinate-grid",
            "x": 6,
            "y": 9,
            "label": "P"
          },
          "check": {
            "kind": "coordinate",
            "args": [
              6,
              9
            ]
          }
        },
        {
          "id": "s2-fractions-1",
          "skill": "fractions",
          "facet": "unlike-subtraction",
          "prompt": "A bottle holds 5/6 liter. Harry pours out 1/4 liter. What fraction of a liter remains?",
          "choices": [
            "4/2",
            "1/3",
            "2/3",
            "7/12"
          ],
          "correct": 3,
          "explanation": "Use a common denominator of 12: 5/6 = 10/12 and 1/4 = 3/12. Then 10/12 − 3/12 = 7/12 liter.",
          "check": {
            "kind": "subtractFractions",
            "args": [
              5,
              6,
              1,
              4
            ]
          }
        },
        {
          "id": "s2-units-1",
          "skill": "units",
          "facet": "weight",
          "prompt": "A package weighs 96 ounces. How many pounds is that?",
          "choices": [
            "8 pounds",
            "6 pounds",
            "12 pounds",
            "16 pounds"
          ],
          "correct": 1,
          "explanation": "One pound is 16 ounces. Divide: 96 ÷ 16 = 6 pounds.",
          "check": {
            "kind": "divide",
            "args": [
              96,
              16
            ]
          }
        },
        {
          "id": "s2-rounding-1",
          "skill": "rounding",
          "facet": "mixed-estimate",
          "prompt": "Estimate by rounding each mixed number to the nearest whole number: 9 5/6 + 4 1/8",
          "choices": [
            "14",
            "13",
            "15",
            "5"
          ],
          "correct": 0,
          "explanation": "9 5/6 rounds to 10 and 4 1/8 rounds to 4. Add: 10 + 4 = 14.",
          "check": {
            "kind": "mixedSumEstimate",
            "args": [
              9,
              5,
              6,
              4,
              1,
              8
            ]
          }
        },
        {
          "id": "s2-calculation-1",
          "skill": "calculation",
          "facet": "multiplication",
          "prompt": "A shop packs 36 pencils into each box. How many pencils are in 28 boxes?",
          "choices": [
            "988",
            "1,008",
            "1,088",
            "1,080"
          ],
          "correct": 1,
          "explanation": "36 × 20 = 720 and 36 × 8 = 288. Add: 720 + 288 = 1,008 pencils.",
          "check": {
            "kind": "multiply",
            "args": [
              36,
              28
            ]
          }
        },
        {
          "id": "s2-scaling-1",
          "skill": "scaling",
          "facet": "enlarge",
          "prompt": "A drawing is 6 cm wide and 9 cm tall. An enlarged copy is 27 cm tall. How wide is it?",
          "choices": [
            "24 cm",
            "15 cm",
            "12 cm",
            "18 cm"
          ],
          "correct": 3,
          "explanation": "The height is multiplied by 3. The width must also be multiplied by 3: 6 × 3 = 18 cm.",
          "check": {
            "kind": "scale",
            "args": [
              6,
              9,
              27
            ]
          }
        },
        {
          "id": "s2-fractions-2",
          "skill": "fractions",
          "facet": "mixed-multiplication",
          "prompt": "Each tray holds 2 2/3 cups of seeds. How many cups do 3 trays hold?",
          "choices": [
            "8",
            "5 2/3",
            "6 2/3",
            "6"
          ],
          "correct": 0,
          "explanation": "Multiply the whole and fractional parts by 3: 2 × 3 = 6 and 2/3 × 3 = 2. Add: 6 + 2 = 8 cups.",
          "check": {
            "kind": "mixedMultiply",
            "args": [
              2,
              2,
              3,
              3
            ]
          }
        },
        {
          "id": "s2-units-2",
          "skill": "units",
          "facet": "liquid",
          "prompt": "3 gallons = ____ pints",
          "choices": [
            "12",
            "6",
            "24",
            "48"
          ],
          "correct": 2,
          "explanation": "One gallon is 4 quarts, and each quart is 2 pints. A gallon is 8 pints, so 3 × 8 = 24 pints.",
          "check": {
            "kind": "multiply",
            "args": [
              3,
              8
            ]
          }
        },
        {
          "id": "s2-rounding-2",
          "skill": "rounding",
          "facet": "round-first",
          "prompt": "Estimate the difference by rounding each number to the nearest hundredth first: 0.084 − 0.016",
          "choices": [
            "0.07",
            "0.06",
            "0.068",
            "0.10"
          ],
          "correct": 1,
          "explanation": "0.084 rounds to 0.08 and 0.016 rounds to 0.02. Subtract: 0.08 − 0.02 = 0.06.",
          "check": {
            "kind": "roundDifference",
            "args": [
              84,
              16,
              1000
            ]
          }
        },
        {
          "id": "s2-calculation-2",
          "skill": "calculation",
          "facet": "regrouping",
          "prompt": "Subtract: (9 × 100) + (1 × 10) + 2 − [(4 × 100) + (6 × 10) + 8]",
          "choices": [
            "556",
            "454",
            "444",
            "544"
          ],
          "correct": 2,
          "explanation": "The numbers are 912 and 468. Subtract: 912 − 468 = 444. Check by adding 468 + 444 = 912.",
          "check": {
            "kind": "subtract",
            "args": [
              912,
              468
            ]
          }
        },
        {
          "id": "s2-scaling-2",
          "skill": "scaling",
          "facet": "reduce",
          "prompt": "A map rectangle is 20 cm long and 14 cm wide. A reduced copy is 10 cm long. What is its width?",
          "choices": [
            "7 cm",
            "4 cm",
            "24 cm",
            "28 cm"
          ],
          "correct": 0,
          "explanation": "The length is halved from 20 to 10 cm. Halve the width too: 14 ÷ 2 = 7 cm.",
          "check": {
            "kind": "scale",
            "args": [
              14,
              20,
              10
            ]
          }
        },
        {
          "id": "s2-median-2",
          "skill": "median",
          "facet": "even",
          "prompt": "Four students scored 210, 245, 218, and 234 points. What is the median score?",
          "choices": [
            "218",
            "226",
            "234",
            "227"
          ],
          "correct": 1,
          "explanation": "Order the scores: 210, 218, 234, 245. Average the two middle scores: (218 + 234) ÷ 2 = 226.",
          "check": {
            "kind": "median",
            "args": [
              210,
              245,
              218,
              234
            ]
          }
        },
        {
          "id": "s2-area-2",
          "skill": "area",
          "facet": "missing-side",
          "prompt": "A rectangular rug covers 96 square feet. Its width is 8 feet. What is its length?",
          "choices": [
            "12 feet",
            "88 feet",
            "104 feet",
            "14 feet"
          ],
          "correct": 0,
          "explanation": "Divide the area by the width: 96 ÷ 8 = 12 feet. Check: 12 × 8 = 96 square feet.",
          "check": {
            "kind": "divide",
            "args": [
              96,
              8
            ]
          }
        },
        {
          "id": "s2-coordinates-2",
          "skill": "coordinates",
          "facet": "read-point",
          "prompt": "What are the coordinates of point K?",
          "choices": [
            "(5, 2)",
            "(3, 5)",
            "(2, 5)",
            "(2, 6)"
          ],
          "correct": 2,
          "explanation": "Read horizontal position first, then vertical position. Point K is 2 units right and 5 units up from the origin, so its coordinates are (2, 5).",
          "visual": {
            "type": "coordinate-grid",
            "x": 2,
            "y": 5,
            "label": "K"
          },
          "check": {
            "kind": "coordinate",
            "args": [
              2,
              5
            ]
          }
        },
        {
          "id": "s2-calculation-3",
          "skill": "calculation",
          "facet": "decimal-division",
          "prompt": "Divide: 97 ÷ 8",
          "choices": [
            "12.135",
            "12.25",
            "121.25",
            "12.125"
          ],
          "correct": 3,
          "explanation": "8 × 12 = 96, leaving 1. Since 1 ÷ 8 = 0.125, the quotient is 12.125. Check: 12.125 × 8 = 97.",
          "check": {
            "kind": "divide",
            "args": [
              97,
              8
            ]
          }
        },
        {
          "id": "s2-scaling-3",
          "skill": "scaling",
          "facet": "same-factor",
          "prompt": "A picture is 5 cm by 8 cm. Harry wants to make both dimensions 4 times as large. Which dimensions should he use?",
          "choices": [
            "9 cm by 12 cm",
            "20 cm by 32 cm",
            "20 cm by 8 cm",
            "5 cm by 32 cm"
          ],
          "correct": 1,
          "explanation": "Multiply both dimensions by 4: 5 × 4 = 20 and 8 × 4 = 32. Adding 4 or changing just one dimension does not keep the same shape.",
          "check": {
            "kind": "scaledPair",
            "args": [
              5,
              8,
              4
            ]
          }
        },
        {
          "id": "s2-median-3",
          "skill": "median",
          "facet": "even",
          "prompt": "Find the median: 19, 8, 14, 23, 11, 16",
          "choices": [
            "14",
            "16",
            "15",
            "15.17"
          ],
          "correct": 2,
          "explanation": "In order: 8, 11, 14, 16, 19, 23. Average 14 and 16: (14 + 16) ÷ 2 = 15.",
          "check": {
            "kind": "median",
            "args": [
              19,
              8,
              14,
              23,
              11,
              16
            ]
          }
        },
        {
          "id": "s2-area-3",
          "skill": "area",
          "facet": "area-perimeter",
          "prompt": "A rectangle is 15 meters long and 4 meters wide. Which pair gives its area and its perimeter?",
          "choices": [
            "Area 38 m²; perimeter 60 m",
            "Area 60 m²; perimeter 38 m",
            "Area 19 m²; perimeter 60 m",
            "Area 60 m²; perimeter 19 m"
          ],
          "correct": 1,
          "explanation": "Area = 15 × 4 = 60 square meters. Perimeter = 15 + 4 + 15 + 4 = 38 meters.",
          "check": {
            "kind": "areaPerimeter",
            "args": [
              15,
              4
            ]
          }
        },
        {
          "id": "s2-coordinates-3",
          "skill": "coordinates",
          "facet": "axis",
          "prompt": "What are the coordinates of point M?",
          "choices": [
            "(0, 7)",
            "(8, 0)",
            "(7, 1)",
            "(7, 0)"
          ],
          "correct": 3,
          "explanation": "Read horizontal position first, then vertical position. Point M is 7 units right and 0 units up from the origin, so its coordinates are (7, 0).",
          "visual": {
            "type": "coordinate-grid",
            "x": 7,
            "y": 0,
            "label": "M"
          },
          "check": {
            "kind": "coordinate",
            "args": [
              7,
              0
            ]
          }
        },
        {
          "id": "s2-fractions-3",
          "skill": "fractions",
          "facet": "fraction-division",
          "prompt": "How many 1/6-cup scoops are in 2/3 cup?",
          "choices": [
            "2",
            "4",
            "3",
            "6"
          ],
          "correct": 1,
          "explanation": "Two thirds equals four sixths: 2/3 = 4/6. Four scoops of 1/6 cup fill 2/3 cup.",
          "check": {
            "kind": "divideFractions",
            "args": [
              2,
              3,
              1,
              6
            ]
          }
        },
        {
          "id": "s2-units-3",
          "skill": "units",
          "facet": "length",
          "prompt": "A ribbon is 108 inches long. How many yards long is it?",
          "choices": [
            "9 yards",
            "36 yards",
            "4 yards",
            "3 yards"
          ],
          "correct": 3,
          "explanation": "There are 36 inches in one yard. Divide: 108 ÷ 36 = 3 yards.",
          "check": {
            "kind": "divide",
            "args": [
              108,
              36
            ]
          }
        },
        {
          "id": "s2-rounding-3",
          "skill": "rounding",
          "facet": "place",
          "prompt": "Round 38.625 to the nearest hundredth.",
          "choices": [
            "38.62",
            "38.6",
            "38.63",
            "39"
          ],
          "correct": 2,
          "explanation": "The hundredths digit is 2. The next digit is 5, so round the hundredths digit up: 38.63.",
          "check": {
            "kind": "round",
            "args": [
              38625,
              1000,
              100
            ]
          }
        }
      ]
    },
    {
      "id": "mixed-3",
      "number": 3,
      "title": "Session 3",
      "questions": [
        {
          "id": "s3-coordinates-1",
          "skill": "coordinates",
          "facet": "read-point",
          "prompt": "What are the coordinates of point P?",
          "choices": [
            "(8, 4)",
            "(5, 8)",
            "(4, 9)",
            "(4, 8)"
          ],
          "correct": 3,
          "explanation": "Read horizontal position first, then vertical position. Point P is 4 units right and 8 units up from the origin, so its coordinates are (4, 8).",
          "visual": {
            "type": "coordinate-grid",
            "x": 4,
            "y": 8,
            "label": "P"
          },
          "check": {
            "kind": "coordinate",
            "args": [
              4,
              8
            ]
          }
        },
        {
          "id": "s3-scaling-1",
          "skill": "scaling",
          "facet": "enlarge",
          "prompt": "A flag drawing is 7 cm high and 12 cm wide. A larger copy is 36 cm wide. How high is it?",
          "choices": [
            "31 cm",
            "21 cm",
            "19 cm",
            "14 cm"
          ],
          "correct": 1,
          "explanation": "36 ÷ 12 = 3, so the scale factor is 3. The height is 7 × 3 = 21 cm.",
          "check": {
            "kind": "scale",
            "args": [
              7,
              12,
              36
            ]
          }
        },
        {
          "id": "s3-calculation-1",
          "skill": "calculation",
          "facet": "multiplication",
          "prompt": "A bag holds 24 ounces of nuts. Each ounce costs $0.65. What is the total cost?",
          "choices": [
            "$15.06",
            "$156.00",
            "$14.60",
            "$15.60"
          ],
          "correct": 3,
          "explanation": "24 × 65 cents = 1,560 cents. Divide by 100 to convert to dollars: $15.60.",
          "check": {
            "kind": "moneyMultiply",
            "args": [
              24,
              65
            ]
          }
        },
        {
          "id": "s3-rounding-1",
          "skill": "rounding",
          "facet": "mixed-estimate",
          "prompt": "Estimate by rounding each mixed number to the nearest whole number: 16 7/8 − 8 1/5",
          "choices": [
            "8",
            "16",
            "9",
            "25"
          ],
          "correct": 2,
          "explanation": "16 7/8 rounds to 17 and 8 1/5 rounds to 8. The estimated difference is 17 − 8 = 9.",
          "check": {
            "kind": "mixedEstimate",
            "args": [
              16,
              7,
              8,
              8,
              1,
              5
            ]
          }
        },
        {
          "id": "s3-area-1",
          "skill": "area",
          "facet": "find-area",
          "prompt": "A rectangular poster is 60 centimeters long and 40 centimeters wide. What is its area?",
          "choices": [
            "100 cm²",
            "2,400 cm²",
            "200 cm²",
            "240 cm²"
          ],
          "correct": 1,
          "explanation": "Area = length × width = 60 × 40 = 2,400 square centimeters.",
          "check": {
            "kind": "area",
            "args": [
              60,
              40
            ]
          }
        },
        {
          "id": "s3-fractions-1",
          "skill": "fractions",
          "facet": "unlike-subtraction",
          "prompt": "Subtract: 7/8 − 1/3. Give the answer in simplest form.",
          "choices": [
            "6/5",
            "13/24",
            "1/2",
            "5/24"
          ],
          "correct": 1,
          "explanation": "Use twenty-fourths: 7/8 = 21/24 and 1/3 = 8/24. Then 21/24 − 8/24 = 13/24.",
          "check": {
            "kind": "subtractFractions",
            "args": [
              7,
              8,
              1,
              3
            ]
          }
        },
        {
          "id": "s3-median-1",
          "skill": "median",
          "facet": "odd",
          "prompt": "Find the median: 52, 37, 48, 61, 43",
          "choices": [
            "43",
            "52",
            "48",
            "48.2"
          ],
          "correct": 2,
          "explanation": "Order the data: 37, 43, 48, 52, 61. The middle value is 48.",
          "check": {
            "kind": "median",
            "args": [
              52,
              37,
              48,
              61,
              43
            ]
          }
        },
        {
          "id": "s3-units-1",
          "skill": "units",
          "facet": "weight",
          "prompt": "A bag weighs 3 pounds 8 ounces. What is its weight in ounces?",
          "choices": [
            "48 ounces",
            "38 ounces",
            "40 ounces",
            "56 ounces"
          ],
          "correct": 3,
          "explanation": "Three pounds is 3 × 16 = 48 ounces. Add the extra 8 ounces: 48 + 8 = 56 ounces.",
          "check": {
            "kind": "multiplyAdd",
            "args": [
              3,
              16,
              8
            ]
          }
        },
        {
          "id": "s3-rounding-2",
          "skill": "rounding",
          "facet": "round-first",
          "prompt": "Round each number to the nearest hundredth first, then subtract: 0.096 − 0.022",
          "choices": [
            "0.07",
            "0.074",
            "0.12",
            "0.08"
          ],
          "correct": 3,
          "explanation": "0.096 rounds to 0.10 and 0.022 rounds to 0.02. Then 0.10 − 0.02 = 0.08.",
          "check": {
            "kind": "roundDifference",
            "args": [
              96,
              22,
              1000
            ]
          }
        },
        {
          "id": "s3-area-2",
          "skill": "area",
          "facet": "missing-side",
          "prompt": "A rectangular playground has an area of 132 square meters. It is 11 meters long. How wide is it?",
          "choices": [
            "121 meters",
            "143 meters",
            "12 meters",
            "13 meters"
          ],
          "correct": 2,
          "explanation": "Divide the area by the known side: 132 ÷ 11 = 12 meters.",
          "check": {
            "kind": "divide",
            "args": [
              132,
              11
            ]
          }
        },
        {
          "id": "s3-fractions-2",
          "skill": "fractions",
          "facet": "mixed-multiplication",
          "prompt": "Multiply: 2 1/4 × 6",
          "choices": [
            "8 1/4",
            "12 1/4",
            "13 1/2",
            "12 1/2"
          ],
          "correct": 2,
          "explanation": "2 1/4 = 9/4. Multiply: 9/4 × 6 = 54/4 = 27/2 = 13 1/2.",
          "check": {
            "kind": "mixedMultiply",
            "args": [
              2,
              1,
              4,
              6
            ]
          }
        },
        {
          "id": "s3-median-2",
          "skill": "median",
          "facet": "even",
          "prompt": "Find the median: 175, 204, 182, 196",
          "choices": [
            "182",
            "196",
            "189.25",
            "189"
          ],
          "correct": 3,
          "explanation": "Order the values: 175, 182, 196, 204. Average the middle two: (182 + 196) ÷ 2 = 189.",
          "check": {
            "kind": "median",
            "args": [
              175,
              204,
              182,
              196
            ]
          }
        },
        {
          "id": "s3-units-2",
          "skill": "units",
          "facet": "liquid",
          "prompt": "40 quarts = ____ gallons",
          "choices": [
            "10",
            "20",
            "160",
            "5"
          ],
          "correct": 0,
          "explanation": "Each gallon contains 4 quarts. Divide: 40 ÷ 4 = 10 gallons.",
          "check": {
            "kind": "divide",
            "args": [
              40,
              4
            ]
          }
        },
        {
          "id": "s3-coordinates-2",
          "skill": "coordinates",
          "facet": "read-point",
          "prompt": "What are the coordinates of point K?",
          "choices": [
            "(9, 3)",
            "(3, 9)",
            "(10, 3)",
            "(9, 4)"
          ],
          "correct": 0,
          "explanation": "Read horizontal position first, then vertical position. Point K is 9 units right and 3 units up from the origin, so its coordinates are (9, 3).",
          "visual": {
            "type": "coordinate-grid",
            "x": 9,
            "y": 3,
            "label": "K"
          },
          "check": {
            "kind": "coordinate",
            "args": [
              9,
              3
            ]
          }
        },
        {
          "id": "s3-scaling-2",
          "skill": "scaling",
          "facet": "reduce",
          "prompt": "A 24 cm by 15 cm image is reduced. Its 24 cm side becomes 8 cm. What does the 15 cm side become?",
          "choices": [
            "7 cm",
            "45 cm",
            "5 cm",
            "3 cm"
          ],
          "correct": 2,
          "explanation": "The scale factor is one third: 24 ÷ 3 = 8. Divide the other side by 3: 15 ÷ 3 = 5 cm.",
          "check": {
            "kind": "scale",
            "args": [
              15,
              24,
              8
            ]
          }
        },
        {
          "id": "s3-calculation-2",
          "skill": "calculation",
          "facet": "regrouping",
          "prompt": "Subtract: 1,002 − 578",
          "choices": [
            "424",
            "576",
            "534",
            "434"
          ],
          "correct": 0,
          "explanation": "Regroup across the zeros, or subtract 600 and add 22 back: 1,002 − 600 + 22 = 424. Check: 424 + 578 = 1,002.",
          "check": {
            "kind": "subtract",
            "args": [
              1002,
              578
            ]
          }
        },
        {
          "id": "s3-median-3",
          "skill": "median",
          "facet": "even",
          "prompt": "Six plants are 17, 6, 13, 22, 9, and 14 centimeters tall. What is their median height?",
          "choices": [
            "13.5 cm",
            "13 cm",
            "14 cm",
            "13.83 cm"
          ],
          "correct": 0,
          "explanation": "Order the heights: 6, 9, 13, 14, 17, 22. The middle two are 13 and 14, whose average is 13.5 cm.",
          "check": {
            "kind": "median",
            "args": [
              17,
              6,
              13,
              22,
              9,
              14
            ]
          }
        },
        {
          "id": "s3-units-3",
          "skill": "units",
          "facet": "length",
          "prompt": "2 yards 1 foot = ____ inches",
          "choices": [
            "72",
            "84",
            "36",
            "60"
          ],
          "correct": 1,
          "explanation": "Two yards is 2 × 36 = 72 inches. One foot adds 12 inches. Total: 72 + 12 = 84 inches.",
          "check": {
            "kind": "multiplyAdd",
            "args": [
              2,
              36,
              12
            ]
          }
        },
        {
          "id": "s3-coordinates-3",
          "skill": "coordinates",
          "facet": "axis",
          "prompt": "What are the coordinates of point M?",
          "choices": [
            "(4, 0)",
            "(0, 4)",
            "(1, 4)",
            "(0, 5)"
          ],
          "correct": 1,
          "explanation": "Read horizontal position first, then vertical position. Point M is 0 units right and 4 units up from the origin, so its coordinates are (0, 4).",
          "visual": {
            "type": "coordinate-grid",
            "x": 0,
            "y": 4,
            "label": "M"
          },
          "check": {
            "kind": "coordinate",
            "args": [
              0,
              4
            ]
          }
        },
        {
          "id": "s3-scaling-3",
          "skill": "scaling",
          "facet": "same-factor",
          "prompt": "A 3 cm by 7 cm card is enlarged to 9 cm by 21 cm. Which rule describes the enlargement?",
          "choices": [
            "Add 6 to both dimensions",
            "Multiply only the longer side by 3",
            "Add 14 to both dimensions",
            "Multiply both dimensions by 3"
          ],
          "correct": 3,
          "explanation": "3 becomes 9 by multiplying by 3, and 7 becomes 21 by multiplying by 3. The same factor is used for both sides.",
          "check": {
            "kind": "expression",
            "answer": "Multiply both dimensions by 3"
          }
        },
        {
          "id": "s3-calculation-3",
          "skill": "calculation",
          "facet": "decimal-division",
          "prompt": "A 73-meter rope is cut into 8 equal lengths. How long is each piece?",
          "choices": [
            "9.135 meters",
            "9.125 meters",
            "9.25 meters",
            "9.0125 meters"
          ],
          "correct": 1,
          "explanation": "73 ÷ 8 = 9 with 1 meter left. One eighth is 0.125, so each piece is 9.125 meters. Check: 9.125 × 8 = 73.",
          "check": {
            "kind": "divide",
            "args": [
              73,
              8
            ]
          }
        },
        {
          "id": "s3-rounding-3",
          "skill": "rounding",
          "facet": "place",
          "prompt": "Round 72.496 to the nearest hundredth.",
          "choices": [
            "72.50",
            "72.49",
            "72.40",
            "73.00"
          ],
          "correct": 0,
          "explanation": "The thousandths digit is 6, so round up the hundredths. 72.49 becomes 72.50, which is also written 72.5.",
          "check": {
            "kind": "round",
            "args": [
              72496,
              1000,
              100
            ]
          }
        },
        {
          "id": "s3-area-3",
          "skill": "area",
          "facet": "area-perimeter",
          "prompt": "A rectangle measures 16 inches by 5 inches. What is the distance around all four sides?",
          "choices": [
            "80 inches",
            "21 inches",
            "37 inches",
            "42 inches"
          ],
          "correct": 3,
          "explanation": "The distance around is perimeter. Add all sides: 16 + 5 + 16 + 5 = 42 inches.",
          "check": {
            "kind": "perimeter",
            "args": [
              16,
              5
            ]
          }
        },
        {
          "id": "s3-fractions-3",
          "skill": "fractions",
          "facet": "fraction-division",
          "prompt": "A jug contains 5/6 liter of juice. Each glass holds 1/12 liter. How many glasses can be filled?",
          "choices": [
            "5",
            "6",
            "12",
            "10"
          ],
          "correct": 3,
          "explanation": "5/6 = 10/12. Ten portions of 1/12 liter fit into the jug, so it fills 10 glasses.",
          "check": {
            "kind": "divideFractions",
            "args": [
              5,
              6,
              1,
              12
            ]
          }
        }
      ]
    }
  ],
  "checkpoint": {
    "minimumSessions": 3,
    "minimumStudyDays": 2,
    "perSkillCorrect": 8,
    "perSkillTotal": 9,
    "recentSessionCorrect": 22,
    "recentSessionTotal": 24
  },
  "starGroups": {
    "fractions": [
      11,
      17,
      31,
      33
    ],
    "calculation": [
      6,
      16,
      24
    ],
    "area": [
      5,
      29
    ],
    "scaling": [
      15
    ],
    "rounding": [
      25,
      30
    ],
    "units": [],
    "coordinates": [
      32
    ],
    "median": [
      34
    ]
  }
};})(typeof window==='undefined'?globalThis:window);
