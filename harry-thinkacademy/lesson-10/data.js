window.lessonConfig = {
  lesson:10, topic:"Grids and Shifts", storageKey:"harry-thinkacademy-lesson10-v2",
  titleHtml:"Try twice.<br><em>Then learn.</em>",
  description:"Practice each original missed question and one new similar question. The answer appears only after two incorrect tries.",
  recordDate:"Aug 26, 2026", recordNumbers:"5, 6, 7, 10, 11, 12, 13",
  groups:[
    {number:"5", original:{prompt:"Find the exact area of the shaded figure.",note:"Each small square has area 1 square unit.",figure:{type:"image",src:"./assets/question-05.png",alt:"A shaded yellow polygon on a square grid.",caption:"Each grid square is 1 square unit."},fields:[{id:"o05",label:"Area in square units",answer:13}]},similar:{prompt:"Find the area of this new shaded figure.",note:"Count the shaded unit squares.",figure:{type:"cellGrid",rows:3,cols:5,on:[0,1,2,5,6,7,8,10,11,12],caption:"Each shaded square has area 1."},fields:[{id:"s05",label:"Area in square units",answer:10}]}},
    {number:"6", original:{prompt:"Find the area of the figure.",note:"Every grid square is 1 meter by 1 meter.",figure:{type:"image",src:"./assets/question-06.png",alt:"A green trapezoid on a one-meter grid.",caption:"Think: rectangle plus two side triangles."},fields:[{id:"o06",label:"Area in square meters",answer:12}]},similar:{prompt:"Find the area of this trapezoid.",note:"Use one-half × (top + bottom) × height.",figure:{type:"trapezoid",top:3,bottom:7,height:4},fields:[{id:"s06",label:"Area in square units",answer:20}]}},
    {number:"7", original:{prompt:"Find the area of the polygon.",note:"Each smallest triangle has area 1.",figure:{type:"image",src:"./assets/question-07.png",alt:"An irregular polygon on a triangular dot grid.",caption:"One smallest triangle has area 1."},fields:[{id:"o07",label:"Area",answer:11}]},similar:{prompt:"Find the total area from full and half triangles.",note:"Pair the half-triangles first.",figure:{type:"triangles",full:9,halves:8},fields:[{id:"s07",label:"Area",answer:13}]}},
    {number:"10", original:{prompt:"Calculate each original answer.",note:"Each box has its own two tries.",fields:[
      {id:"o10a",expression:"231 × 3 =",answer:693},{id:"o10b",expression:"422 × 4 =",answer:1688},{id:"o10c",expression:"219 × 3 =",answer:657},
      {id:"o10d",expression:"331 × 4 =",answer:1324},{id:"o10e",expression:"121 × 3 =",answer:363},{id:"o10f",expression:"318 × 3 =",answer:954},
      {id:"o10g",expression:"415 ÷ 5 =",answer:83},{id:"o10h",expression:"722 ÷ 2 =",answer:361},{id:"o10i",expression:"135 ÷ 3 =",answer:45}
    ]},similar:{prompt:"Calculate each similar answer.",note:"Use the same skill with new numbers.",fields:[
      {id:"s10a",expression:"243 × 3 =",answer:729},{id:"s10b",expression:"412 × 4 =",answer:1648},{id:"s10c",expression:"217 × 3 =",answer:651},
      {id:"s10d",expression:"341 × 4 =",answer:1364},{id:"s10e",expression:"132 × 3 =",answer:396},{id:"s10f",expression:"326 × 3 =",answer:978},
      {id:"s10g",expression:"425 ÷ 5 =",answer:85},{id:"s10h",expression:"846 ÷ 2 =",answer:423},{id:"s10i",expression:"144 ÷ 3 =",answer:48}
    ]}},
    {number:"11", original:{prompt:"Use the fact you already know.",fields:[{id:"o11",expression:"Given 13 × 6 = 78, 130 × 6 =",answer:780}]},similar:{prompt:"Use the same place-value pattern.",fields:[{id:"s11",expression:"Given 16 × 7 = 112, 160 × 7 =",answer:1120}]}},
    {number:"12", original:{prompt:"Use the fact you already know.",fields:[{id:"o12",expression:"Given 24 × 5 = 120, 24,000 × 5 =",answer:120000,answerLabel:"120,000"}]},similar:{prompt:"Use the same place-value pattern.",fields:[{id:"s12",expression:"Given 32 × 4 = 128, 32,000 × 4 =",answer:128000,answerLabel:"128,000"}]}},
    {number:"13", original:{prompt:"Use the fact you already know.",fields:[{id:"o13",expression:"Given 45 × 7 = 315, 4,500 × 7 =",answer:31500,answerLabel:"31,500"}]},similar:{prompt:"Use the same place-value pattern.",fields:[{id:"s13",expression:"Given 36 × 8 = 288, 3,600 × 8 =",answer:28800,answerLabel:"28,800"}]}}
  ]
};
