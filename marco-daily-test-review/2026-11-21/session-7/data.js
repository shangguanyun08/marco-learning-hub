(function (root) {
  'use strict';
  const questions = {};
  const skillNames = {
    overlap: 'Count groups with an overlap',
    cubeVolume: 'Find volumes of equal-sized cube blocks'
  };
  function add(id, skill, focus, prompt, choices, correct, tip, explanation, extra = {}) {
    questions[id] = {id, skill, focus, prompt, choices, correct, tip, explanation, ...extra};
  }

  add('redo-qr18', 'overlap', 'Find a total when some people are counted twice',
    'Everyone in a group is in math, physics, or both. There are 12 people in math, 8 in physics, and 4 in both. How many people are in the group?',
    ['10', '12', '14', '16'], 3,
    'People in both classes are included in both of the class counts.',
    'Adding 12 and 8 counts the four people in both classes twice. Subtract those four once to get 12 + 8 − 4 = 16.',
    {source: 'Practice Test 6 QR · Q18 redo'});
  add('redo-qr20', 'cubeVolume', 'Count the cubes and find the volume of each',
    'This block is made of equal cubes. Each small cube has an edge length of 2 1/2 inches. What is the volume of the whole block?',
    ['50 in³', '100 in³', '250 in³', '625 in³'], 3,
    'Count the cubes across, deep, and high. Multiply the number of cubes by the volume of one cube.',
    'The block is 5 cubes across, 2 deep, and 4 high, so it contains 40 cubes. Each has volume (5/2) × (5/2) × (5/2) = 125/8 in³. The total is 40 × 125/8 = 625 in³.',
    {source: 'Practice Test 6 QR · Q20 redo', cubes: [5, 2, 4]});
  add('overlap-1', 'overlap', 'Find how many belong to both groups',
    'All 31 students in a group take art, music, or both. Of these students, 19 take art and 17 take music. How many take both?',
    ['3', '5', '7', '12'], 1,
    'Compare the sum of the two class counts with the number of students.',
    'The class counts add to 36. The 5 extra counts are students who appear in both class lists. So 36 − 31 = 5 students take both.');
  add('volume-1', 'cubeVolume', 'Multiply the cube count by the volume of one cube',
    'The block shown is built from equal cubes. Each cube has edges 1 1/2 centimeters long. What is the volume of the block?',
    ['36 cm³', '54 cm³', '81 cm³', '108 cm³'], 2,
    'Count the cubes along each dimension. Cube the edge length to find the volume of one cube.',
    'The block contains 3 × 2 × 4 = 24 cubes. Each cube has volume (3/2) × (3/2) × (3/2) = 27/8 cm³. The total is 24 × 27/8 = 81 cm³.',
    {cubes: [3, 2, 4]});
  add('overlap-2', 'overlap', 'Find one group size when the total and overlap are known',
    'There are 36 students in debate, robotics, or both. Of those students, 21 are in debate and 8 are in both clubs. How many are in robotics?',
    ['15', '21', '23', '29'], 2,
    'First find the students who are only in robotics. Then include the students in both clubs.',
    'The 15 students outside debate must be in robotics. Add the 8 who are in both clubs. Robotics has 15 + 8 = 23 students.');
  add('volume-2', 'cubeVolume', 'Work backward from the total volume to a cube’s edge length',
    'A solid block is 4 cubes across, 3 cubes deep, and 2 cubes high. It has a total volume of 192 cubic inches. What is the edge length of one small cube?',
    ['2 in', '4 in', '6 in', '8 in'], 0,
    'Divide the total volume by the number of cubes. Then find the edge length that gives that volume.',
    'The block contains 4 × 3 × 2 = 24 cubes, so each cube has volume 192 ÷ 24 = 8 in³. Since 2 × 2 × 2 = 8, one cube’s edge is 2 inches.');
  add('overlap-3', 'overlap', 'Find how many are in neither group',
    'In a class of 30 students, 16 play basketball, 13 play soccer, and 7 play both. How many students play neither sport?',
    ['8', '7', '15', '22'], 0,
    'Find how many play at least one sport before subtracting from the class total.',
    'The count for at least one sport is 16 + 13 − 7 = 22. The remaining 30 − 22 = 8 students play neither.');
  add('volume-3', 'cubeVolume', 'Compare volumes when each cube’s edge length changes',
    'Blocks A and B are built from the same number of small cubes. In A, each small cube has a 2 cm edge. In B, each small cube has a 3 cm edge. How many times the volume of A is the volume of B?',
    ['3/2', '27/8', '9/4', '8/27'], 1,
    'Both blocks have the same cube count. Compare the volumes of one cube from each block.',
    'A small cube in A has volume 2 × 2 × 2 = 8 cm³. A small cube in B has volume 3 × 3 × 3 = 27 cm³. With equal numbers of cubes, B is 27/8 times the volume of A.');

  function cubeBlock([wide, deep, high]) {
    const unit = 26;
    const diagonal = 12;
    const left = 12;
    const top = 12 + deep * diagonal;
    const right = left + wide * unit;
    const bottom = top + high * unit;
    const depth = deep * diagonal;
    const width = right + depth + 12;
    const height = bottom + 12;
    const front = wide * unit;
    const side = high * unit;
    const label = `Solid block with ${wide} cubes across, ${deep} cubes deep, and ${high} cubes high`;
    const faces = [
      `<path fill="#f5f9fc" d="M${left} ${top}h${front}v${side}H${left}z"/>`,
      `<path fill="#e1eaf3" d="M${left} ${top}l${depth} -${depth}h${front}l-${depth} ${depth}z"/>`,
      `<path fill="#cbdceb" d="M${right} ${top}l${depth} -${depth}v${side}l-${depth} ${depth}z"/>`
    ];
    const lines = [];
    for (let column = 1; column < wide; column++) {
      lines.push(`M${left + column * unit} ${bottom}V${top}l${depth} -${depth}`);
    }
    for (let row = 1; row < high; row++) {
      lines.push(`M${left} ${top + row * unit}h${front}l${depth} -${depth}`);
    }
    for (let layer = 1; layer < deep; layer++) {
      lines.push(`M${left + layer * diagonal} ${top - layer * diagonal}h${front}v${side}`);
    }
    return `<figure class="cube-block"><svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
      <g stroke="#173957" stroke-width="1.3" stroke-linejoin="round">${faces.join('')}<path d="${lines.join(' ')}" fill="none"/></g>
    </svg></figure>`;
  }

  const session = root.MarcoMA5Practice.practiceSet(7, questions, skillNames);
  const defaultVisual = session.questionVisual;
  session.title = 'November 21 · Session 7 · Practice Test 6 QR follow-up';
  session.groupSize = 4;
  session.nextSteps = {
    overlap: 'Mark the overlap first. Check whether the question asks for both groups, either group, or neither group.',
    cubeVolume: 'Count cubes across, deep, and high. For non-unit cubes, multiply the cube count by the volume of one small cube.'
  };
  session.questionVisual = question => question.cubes ? cubeBlock(question.cubes) : defaultVisual(question);
  root.MarcoMA5Practice = root.MarcoQR4Data = session;
})(typeof window === 'undefined' ? globalThis : window);
