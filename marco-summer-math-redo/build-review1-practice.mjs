// Rebuild the fixed, skill-matched practice bank. IDs and ordering stay stable for saved progress.
import { readFile, writeFile } from 'node:fs/promises';

const reviews = JSON.parse(await readFile(new URL('./review-bank.json', import.meta.url), 'utf8'));
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const fraction = (n, d) => { const g = gcd(n, d); return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`; };
const markup = text => String(text).replace(/\^(\d+)/g, '<sup>$1</sup>');
const groups = {};
function add(parent, text, correct, distractors, explanation, diagram = '') {
  const list = groups[parent.id] ||= [];
  const choices = [correct, ...distractors].map(String);
  if (new Set(choices).size !== 4) throw new Error(`Duplicate choices: ${parent.id} ${list.length}`);
  // Stable shuffle keeps the answer from occupying the same position on every question.
  let seed = parent.position * 197 + list.length * 7919;
  for (let i = 3; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  const options = choices.map((value, i) => ({ label: 'ABCD'[i], text: value, html: markup(value) }));
  list.push({
    id: `${parent.id}-practice-${String(list.length + 1).padStart(2, '0')}`,
    parentQuestionId: parent.id, day: parent.day, position: parent.position,
    practiceNumber: list.length + 1, sourceQuestionId: parent.sourceQuestionId,
    sourceDay: parent.sourceDay, sourceNumber: parent.sourceNumber, skill: parent.skill,
    questionText: text, questionHtml: markup(text) + diagram, options,
    correctIndexes: [choices.indexOf(String(correct))], correctAnswer: String(correct),
    correctHtml: markup(correct), explanation,
  });
}

for (const parent of reviews.sessions[0].questions) {
  for (let i = 0; i < 10; i++) {
    switch (parent.position) {
      case 1: {
        const examples = [
          ['take a short recess at school', 'minutes', 'A short school recess usually lasts several minutes.'],
          ['blink once', 'milliseconds', 'A blink lasts only a fraction of a second, or a few hundred milliseconds.'],
          ['complete an overnight train journey', 'hours', 'An overnight train journey lasts several hours.'],
          ['grow from a newborn baby into a teenager', 'years', 'Growing into a teenager takes many years.'],
          ['run a 100-meter race', 'seconds', 'A short sprint is usually timed in seconds.'],
          ['spend a week at a summer camp', 'days', 'A week at camp lasts seven days.'],
          ['brush your teeth', 'minutes', 'Brushing teeth usually takes a few minutes.'],
          ['watch a full-length movie', 'hours', 'A full-length movie usually lasts about one or two hours.'],
          ['complete one full orbit of Earth around the Sun', 'years', 'Earth takes one year to complete an orbit around the Sun.'],
          ['count slowly from one to ten', 'seconds', 'Counting to ten takes several seconds.'],
        ];
        const [event, unit, reason] = examples[i];
        const wrongTime = { minutes: 'years', milliseconds: 'hours', hours: 'milliseconds', years: 'seconds', seconds: 'days', days: 'milliseconds' }[unit];
        add(parent, `Which unit is most reasonable for measuring the time it takes to ${event}?`, unit, ['meters', 'liters', wrongTime], `${reason} Meters measure length and liters measure volume; choose a time unit that fits the event.`);
        break;
      }
      case 2: {
        const [p, e] = [[2,4],[3,3],[2,5],[5,2],[3,4],[2,7],[5,3],[7,2],[3,5],[2,8]][i];
        const n = p ** e;
        add(parent, `What is the prime factorization of ${n}?`, `${p}^${e}`, [`${p}^${e-1}`, `${p*p} × ${n/(p*p)}`, `${p}^${e+1}`], `${n} = ${Array(e).fill(p).join(' × ')} = ${p}^${e}. The base ${p} is prime. A factorization containing ${p*p} still has a composite factor.`);
        break;
      }
      case 3: {
        const [a, b] = [[72,6],[96,8],[91,7],[108,9],[75,5],[128,8],[63,3],[132,6],[144,9],[126,7]][i];
        const n = a / b;
        add(parent, `What is the value of ${(a/100).toFixed(2)} ÷ ${(b/100).toFixed(2)}?`, n, [n/10,n*10,n/100], `Multiply both numbers by 100: ${a} ÷ ${b} = ${n}. Moving both decimal points the same distance keeps the quotient unchanged.`);
        break;
      }
      case 4: {
        const [a,b,c,d,e,f] = [[5,6,1,4,2,3],[7,8,1,4,1,2],[2,3,1,6,3,4],[3,5,1,4,1,2],[5,8,1,6,1,3],[7,10,1,5,3,4],[4,5,1,3,1,2],[5,6,1,3,3,8],[3,4,1,5,2,5],[7,12,1,6,3,4]][i];
        const den = [b,d,f].reduce((m,n) => m*n/gcd(m,n),1);
        const n = a*den/b-c*den/d+e*den/f;
        add(parent, `What is the value of ${a}/${b} − ${c}/${d} + ${e}/${f}?`, fraction(n,den), [fraction(n+2*c*den/d,den), fraction(n-e*den/f,den), fraction(n+1,den)], `Use a common denominator of ${den}: ${a*den/b}/${den} − ${c*den/d}/${den} + ${e*den/f}/${den} = ${n}/${den} = ${fraction(n,den)}. Keep the subtraction sign when combining numerators.`);
        break;
      }
      case 5: {
        const g = i+3;
        add(parent, `A class has ${3*g} red beads, ${5*g} blue beads, and some yellow beads. It uses all the beads to make identical groups with the same number of each color. The greatest possible number of groups is ${g}. Which could be the number of yellow beads?`, 4*g, [4*g-1,4*g+1,5*g+1], `The greatest common factor of ${3*g} and ${5*g} is ${g}. The yellow count must also be divisible by ${g}. Only ${4*g} works, giving 3 red, 5 blue, and 4 yellow beads in each group.`);
        break;
      }
      case 6: {
        const angle = [104,116,124,108,132,98,142,126,114,136][i];
        add(parent, `One interior angle of a parallelogram is ${angle}°. What is the measure of the adjacent interior angle?`, `${180-angle}°`, [`${angle}°`,`${angle/2}°`,`${360-angle}°`], `Adjacent interior angles of a parallelogram add to 180°. The missing angle is 180° − ${angle}° = ${180-angle}°. Opposite angles are equal, but adjacent angles are supplementary.`);
        break;
      }
      case 7: {
        if (i < 5) {
          const a = 100 + 5*i;
          add(parent, `Which list of four interior angles proves that a quadrilateral is a rectangle? (Set ${i+1})`, '90°, 90°, 90°, 90°', [`${a}°, ${180-a}°, ${a}°, ${180-a}°`, `${a}°, ${a}°, ${180-a}°, ${180-a}°`, `${a+10}°, ${170-a}°, ${a+10}°, ${170-a}°`], 'A rectangle has four right angles, so every angle must be 90°. All these lists total 360°, but a total of 360° alone does not prove that a quadrilateral is a rectangle.');
        } else {
          const facts = [
            ['Which condition guarantees that a parallelogram is a rectangle?', 'One interior angle is 90°.', 'All four sides have equal lengths.', 'One interior angle is 60°.', 'One diagonal is longer than the other.', 'In a parallelogram, opposite angles are equal and adjacent angles add to 180°. If one angle is 90°, all four angles must be 90°.'],
            ['A quadrilateral has three right angles. What must be true?', 'It is a rectangle.', 'It must have four equal sides.', 'Its fourth angle is 60°.', 'It cannot have parallel sides.', 'A quadrilateral has 360° in total. Three right angles use 270°, leaving 90° for the fourth. Four right angles make it a rectangle.'],
            ['Which statement is true for every rectangle?', 'All four interior angles are right angles.', 'All four sides are equal.', 'Adjacent angles add to 90°.', 'Exactly one pair of opposite sides is parallel.', 'Every rectangle has four 90° angles and two pairs of parallel opposite sides. Equal adjacent sides are only required for a square.'],
            ['A quadrilateral has four equal interior angles and sides of lengths 4, 7, 4, and 7 cm in order. What shape is it?', 'A rectangle.', 'A square.', 'A quadrilateral with no parallel sides.', 'A parallelogram with no right angles.', 'Four equal angles divide the 360° total into four 90° angles, proving it is a rectangle. The unequal adjacent side lengths mean it is not a square.'],
            ['Which fact alone is NOT enough to prove that a quadrilateral is a rectangle?', 'Both pairs of opposite sides are parallel.', 'It has four right angles.', 'It has four equal interior angles.', 'It has three right angles.', 'Parallel opposite sides establish a parallelogram, which can have slanted angles. Four equal angles or three right angles force all four angles to be 90°.'],
          ][i-5];
          add(parent, facts[0], facts[1], facts.slice(2,5), facts[5]);
        }
        break;
      }
      case 8: {
        const [total,d,e] = [[36,3,4],[40,5,4],[30,3,5],[48,4,3],[60,5,3],[42,3,4],[72,4,3],[56,2,4],[45,3,5],[64,2,4]][i];
        const left = total-total/d, second=left/e, result=left-second;
        add(parent, `A tray has ${total} cookies. Mia eats 1/${d} of them. Noah then eats 1/${e} of the cookies that remain. How many cookies are left after Noah eats?`, result, [left,second,total], `Mia eats ${total} ÷ ${d} = ${total/d}, leaving ${left}. Noah eats ${left} ÷ ${e} = ${second}. The number left is ${left} − ${second} = ${result}; Noah's fraction applies to the remainder.`);
        break;
      }
      case 9: {
        const a=i+2,b=i+4,h=3,rolls=6,area=2*a*h+2*b*h,result=area*9/rolls;
        add(parent, `Two walls each measure ${a} yards by ${h} yards. Two other walls each measure ${b} yards by ${h} yards. ${rolls} identical rolls of wallpaper cover all four walls with no waste. How many square feet does one roll cover? (1 yard = 3 feet.)`, `${result} square feet`, [`${area/rolls} square feet`,`${area*3/rolls} square feet`,`${area*9} square feet`], `Total area = 2 × (${a} × ${h}) + 2 × (${b} × ${h}) = ${area} square yards. Multiply by 9 to get ${area*9} square feet, then divide by ${rolls}: ${result} square feet per roll.`);
        break;
      }
      case 10: {
        const [a,b] = [[1,2],[1,3],[2,5],[3,4],[3,5],[4,5],[2,7],[4,7],[5,6],[5,8]][i];
        add(parent, `A smaller cube has side length ${a} cm, and a larger cube has side length ${b} cm. What is the ratio of the smaller cube's volume to the larger cube's volume?`, `${a**3}:${b**3}`, [`${a}:${b}`,`${a*a}:${b*b}`,`${b**3}:${a**3}`], `Cube each side length: ${a}³ = ${a**3} cm³ and ${b}³ = ${b**3} cm³. The smaller-to-larger volume ratio is ${a**3}:${b**3}. Keep the order and use volumes, not lengths or areas.`);
        break;
      }
      case 11: {
        const [whole,num,den,times] = [[2,1,2,9],[3,1,2,8],[4,1,2,6],[2,1,4,8],[3,3,4,6],[1,1,2,11],[4,1,4,8],[2,3,4,10],[5,1,2,7],[3,1,4,6]][i];
        const small=whole+num/den,big=small*times;
        add(parent, `A building is ${big} meters tall, and a tree is ${whole} ${num}/${den} meters tall. The building is how many times as tall as the tree?`, times, [times-1,times+1,times+0.5], `Convert ${whole} ${num}/${den} to ${small}. Then ${big} ÷ ${small} = ${times}. Check by multiplying: ${small} × ${times} = ${big}.`);
        break;
      }
      case 12: {
        const [total,a,b,c] = [[240,3,4,6],[300,4,5,3],[420,5,7,5],[480,3,4,4],[280,3,4,7],[540,2,3,6],[360,7,9,4],[450,4,5,6],[600,3,5,5],[630,2,3,7]][i];
        const oranges=total*a/b, no=oranges/c, yes=oranges-no;
        add(parent, `Of ${total} trees on a farm, ${a}/${b} are orange trees. Of the orange trees, 1/${c} did not bloom. How many orange trees bloomed?`, yes, [oranges,no,total], `There are ${total} × ${a}/${b} = ${oranges} orange trees. Of these, ${oranges} ÷ ${c} = ${no} did not bloom. Therefore ${oranges} − ${no} = ${yes} orange trees bloomed.`);
        break;
      }
      case 13: {
        const [a,b,c,d] = [[1,3,1,4],[2,5,1,3],[1,4,1,3],[1,5,3,8],[2,7,1,2],[3,8,2,5],[1,6,2,5],[2,9,1,4],[3,10,2,7],[1,3,3,5]][i];
        const n=(b-a)*(d-c),den=b*d;
        add(parent, `Nora spends ${a}/${b} of her money on a notebook. She then spends ${c}/${d} of her remaining money on pens. What fraction of her original money is left?`, fraction(n,den), [fraction(b-a,b),fraction(n-1,den),fraction(n+1,den)], `After the notebook, ${fraction(b-a,b)} of the money remains. Nora keeps ${fraction(d-c,d)} of that remainder, so multiply: ${fraction(b-a,b)} × ${fraction(d-c,d)} = ${fraction(n,den)} of the original money.`);
        break;
      }
      case 14: {
        const leg=[2,4,8,10,12,14,16,18,20,22][i],area=leg*leg/2;
        const diagram=`<svg class="review-diagram" viewBox="0 0 340 275" role="img" aria-label="Square of side b with a right triangle of legs ${leg}a removed from the upper-left corner"><path d="M40 30H270V260H40Z" fill="#eaf1ff" stroke="#173957" stroke-width="2"/><path d="M40 30H130L40 120Z" fill="white" stroke="#173957" stroke-width="2"/><text x="68" y="22">${leg}a</text><text x="4" y="90">${leg}a</text><text x="284" y="155">b</text></svg>`;
        add(parent, `A square has side length b. An isosceles right triangle with both legs of length ${leg}a is cut from one corner. Which expression gives the area that remains?`, `b² − ${area}a²`, [`b² − ${leg*leg}a²`,`b² − ${area/2}a²`,`b² + ${area}a²`], `The square has area b². The triangle's area is 1/2 × ${leg}a × ${leg}a = ${area}a². Subtract the removed area to get b² − ${area}a².`,diagram);
        break;
      }
      case 15: {
        const [edge,n] = [[12,2],[15,3],[20,4],[30,5],[24,4],[21,3],[28,7],[32,4],[36,6],[40,5]][i],side=edge/n;
        add(parent, `A large cube has side length ${edge} feet. It is completely filled, with no gaps, by ${n**3} identical smaller cubes arranged in rows and layers. What is the side length of each smaller cube?`, `${side} feet`, [`${side/2} feet`,`${side*2} feet`,`${side+1} feet`], `${n**3} = ${n} × ${n} × ${n}, so there are ${n} small cubes along each edge. Each small edge measures ${edge} ÷ ${n} = ${side} feet. Use the cube root of the count, not the count itself.`);
        break;
      }
      case 16: {
        const [l,w,h,v] = [[4,3,2,2],[5,2,3,3],[6,3,2,1.5],[7,2,4,2],[3,3,4,4],[8,2,3,2.5],[5,4,2,3],[9,2,2,2],[6,4,3,0.5],[7,3,2,1.5]][i];
        const count=l*w*h,result=count*v;
        add(parent, `A rectangular prism is built from small cubes. It is ${l} cubes long, ${w} cubes wide, and ${h} cubes high. Each small cube has volume ${v} cm³. What is the total volume of the prism?`, `${result} cm³`, [`${count} cm³`,`${result+v} cm³`,`${result-v} cm³`], `The prism contains ${l} × ${w} × ${h} = ${count} small cubes. Multiply by the volume of each cube: ${count} × ${v} = ${result} cm³.`);
        break;
      }
    }
  }
}
await writeFile(new URL('./review1-practice-bank.json', import.meta.url), JSON.stringify({version:1, day:29, maxQuestions:10, requiredStreak:3, groups}, null, 2) + '\n');
console.log(`Prepared ${Object.values(groups).flat().length} practice questions across ${Object.keys(groups).length} skills.`);
