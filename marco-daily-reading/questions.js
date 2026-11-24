(() => {
  'use strict';

  const review = [
    {
      id: 'q5', mock: 5, skill: 'organization', title: 'Two Ways to Share a Cookie',
      passage: ['When we were children, my sister always split our black-and-white cookie along the line between the two frostings. We each got half, but she kept all the chocolate. [[But one day]], I cut across that line. Both pieces had some chocolate and some vanilla.'],
      prompt: 'What is the main job of this paragraph?',
      choices: ['To explain why round cookies are difficult to cut evenly.', 'To explain why older siblings care more about rules.', 'To show how an experience changed the narrator’s idea of fair sharing.', 'To weigh the advantages and disadvantages of two cutting methods.'],
      correct: 2,
      explanation: 'The first cut gave each child the same amount. The second also gave each child both flavors. Follow what changes after “But one day.” The two cuts illustrate a better way to share.'
    },
    {
      id: 'q8', mock: 8, skill: 'organization', title: 'An Unexpected Career',
      passage: ['Ask children about their dream jobs and you may hear familiar answers: astronaut, firefighter, dancer, basketball player.', '[[However]], some grown-ups make a living doing jobs few children have heard of. In parts of the Southeast, an alligator relocator helps move alligators away from neighborhoods and into suitable habitats.'],
      prompt: 'Why does the author include the first paragraph here?',
      choices: ['To show why neighborhoods hire an alligator relocator.', 'To summarize the duties of an alligator relocator.', 'To explain what makes certain careers popular with children.', 'To set up a contrast between familiar careers and an unusual one.'],
      correct: 3,
      explanation: 'Look one sentence ahead. “However” connects the familiar dream jobs to a job the reader probably did not expect. The first paragraph supplies one side of that contrast.'
    },
    {
      id: 'q14', mock: 14, skill: 'organization', title: 'Before the Apgar Test',
      passage: ['Virginia Apgar was breaking barriers [[even before]] she became known for her work with newborns. She entered medical school at a time when many women ended their formal education after high school. She worked as a surgeon and then joined the emerging field of anesthesiology.', 'Her work later raised a new [[question]]: Could doctors quickly measure a baby’s condition just after birth? She developed a simple scoring system to help them do that.'],
      prompt: 'What is the purpose of the first paragraph?',
      choices: ['To explain why newborns needed a scoring system.', 'To show how unusual Apgar’s early career was for her time.', 'To contrast a forgettable early career with later success.', 'To argue that medical schools should admit more women today.'],
      correct: 1,
      explanation: '“Even before” stresses that Apgar was already doing unusual things. Medical school and work in a new field are the evidence. The next paragraph has its own job: introducing the need for a newborn test.'
    },
    {
      id: 'q16', mock: 16, skill: 'organization', title: 'What the Apgar Score Helps Doctors Do',
      passage: ['A few minutes after a baby is born, staff check signs such as breathing, pulse, movement, and skin color. The score helps them [[decide who needs extra care right away]].'],
      prompt: 'How does the Apgar score relate to newborn health in this excerpt?',
      choices: ['It helps doctors identify babies who may need immediate help.', 'It forecasts which babies will stay healthy throughout childhood.', 'It determines which newborns have an infection.', 'It shows which babies are ready for surgery.'],
      correct: 0,
      explanation: 'Find what doctors do with the result. The clues are “decide who needs extra care” and “right away.” They tell you the purpose and the time frame.'
    },
    {
      id: 'q21', mock: 21, skill: 'tone', title: 'A Light in the Hallway',
      passage: ['At night, a tiny light on the smoke detector is easy to see. The writer calls these lights “wakeful eyes.” Even while a home’s occupants sleep, the detectors are ready to sound an alarm.'],
      prompt: 'What does the image of wakeful eyes suggest?',
      choices: ['The residents regularly lose sleep.', 'The detectors search for prey like animals.', 'The lights are too bright for the hallway.', 'The detectors stay alert and protect people continuously.'],
      correct: 3,
      explanation: 'Eyes suggest watching, and “wakeful” suggests staying alert. Together they describe protection that continues while the family sleeps.'
    },
    {
      id: 'q35', mock: 35, skill: 'tone', title: 'A Barrier to Prepaid Mail',
      passage: ['When the person receiving a letter had to pay to get it, an obvious solution was to let the sender pay in advance. Yet some people took prepaid letters as an insult. They thought the sender was suggesting they could not afford delivery. The writer says “that avenue was blocked.”'],
      prompt: 'What does the blocked avenue represent?',
      choices: ['A new invention that the law had just banned.', 'A letter returned because its address was wrong.', 'A road that mail carriers were unable to use.', 'A sensible idea that met resistance because of a social custom.'],
      correct: 3,
      explanation: 'Translate the metaphor. The avenue is the proposed solution, and the block is the belief that prepaying would offend the recipient.'
    }
  ];

  const practice = [
    {
      id: 'p1', skill: 'organization', title: 'The Second Planting',
      passage: ['The gardening club planted a row of sunflowers beside the school. By June, half had drooped. The club first blamed the dry weather and added water. A member kept notes and noticed that the plants closest to the sprinkler were the first to wilt. [[As a result]], the club moved the second planting to a drier patch and began checking the soil’s moisture.'],
      prompt: 'What is the main purpose of the sentence about the plants nearest the sprinkler?',
      choices: ['To show why the club originally blamed dry weather.', 'To present an observation that led the club to change its approach.', 'To compare the two locations after the second planting.', 'To explain how a rain gauge measures water.'],
      correct: 1,
      explanation: 'The worst plants were nearest the sprinkler. That observation made the club question its first explanation and try a drier spot.'
    },
    {
      id: 'p2', skill: 'tone', title: 'A Lantern of Windows',
      passage: ['On a winter afternoon in Lark Hill, the bakery closes before sunset and the little station falls quiet. Then the library windows light up one by one. From the empty square, the building looks like a lantern someone has left out for the whole town. Inside, the tables are already filling.'],
      prompt: 'What does the comparison to a lantern mainly suggest?',
      choices: ['The library is a small building that residents often overlook.', 'The residents come to the library mainly to keep warm.', 'The library is a welcoming place as the rest of town grows quiet.', 'The library’s new lights are brighter than the station lights.'],
      correct: 2,
      explanation: 'The other buildings close or go quiet, while the library lights come on and the tables fill. A lantern left for the whole town suggests that everyone is welcome.'
    },
    {
      id: 'p3', skill: 'organization', title: 'A Museum Before Opening',
      passage: ['When visitors picture museum work, they often imagine guides leading tours or guards standing by the paintings. Those are the workers visitors usually meet.', '[[However]], a museum also has people whose work is rarely seen. Before opening time, a conservator may spend an hour examining a crack in a painted surface. A registrar checks the paperwork that tracks where each object goes.'],
      prompt: 'How does the first paragraph help organize the passage?',
      choices: ['It supplies familiar examples that the next paragraph contrasts with less visible jobs.', 'It explains how guards and guides prepare for their shifts.', 'It presents an argument that museums should hire more guides.', 'It gives a quick summary of every job discussed later.'],
      correct: 0,
      explanation: 'Follow “However” into paragraph 2. The first paragraph names the jobs visitors see, so the second can introduce the work that usually happens out of sight.'
    },
    {
      id: 'p4', skill: 'tone', title: 'Saturday on the Creek',
      passage: ['The first Saturday the town asked for volunteers, only three people came. One brought a bent rake. Another brought a bag of rolls that lasted until noon. This spring the creek bank is clear, and children can see minnows from the footbridge. I still look for that bent rake in each year’s photograph.'],
      prompt: 'Which description best captures the narrator’s tone toward the volunteers?',
      choices: ['Annoyed by the volunteers’ limited equipment.', 'Amazed that the creek attracts so many visitors.', 'Indifferent to the work once the creek is clean.', 'Fond and appreciative of the volunteers’ modest beginnings.'],
      correct: 3,
      explanation: 'The narrator remembers little details from the first day and still looks for the rake in photographs. That warm attention suggests affection and appreciation.'
    },
    {
      id: 'p5', skill: 'organization', title: 'Before the Weather Station',
      passage: ['Mina was collecting useful weather records [[even before]] her school had a weather station. She marked the direction of the wind on the same corner of her notebook every morning. She borrowed a thermometer and took her readings in the shade so she could compare one day with another.', 'Years later, she installed sensors on the roof that sent their readings to a classroom computer.'],
      prompt: 'What is the role of the first paragraph?',
      choices: ['To show that a school needs a weather station to compare daily temperatures.', 'To explain why Mina chose the school roof for the sensors.', 'To establish that Mina already had a careful method before she got better equipment.', 'To show that Mina’s first observations differed from the sensors’ readings.'],
      correct: 2,
      explanation: 'Her regular times, place, and recording method show care. “Even before” places that care earlier than the formal weather station.'
    },
    {
      id: 'p6', skill: 'tone', title: 'The Difficult Gate',
      passage: ['We had planned to put a gate at the end of the path. The ground sloped sharply there, so one gatepost would sit much lower than the other. Our plan had run into a wall before any of us had put a shovel in the ground. At the next meeting we brought a map and looked for a level spot.'],
      prompt: 'What does the expression “run into a wall” mean here?',
      choices: ['The first plan encountered a practical obstacle.', 'The crew accidentally hit a wall while digging.', 'The group decided to abandon the idea of a gate entirely.', 'The slope made the existing wall unsafe.'],
      correct: 0,
      explanation: 'The slope made the first location difficult. At the next meeting the group looked for another spot, so the wall stands for an obstacle to the original plan.'
    },
    {
      id: 'p7', skill: 'organization', title: 'What the Orange Tag Means',
      passage: ['A bike-share mechanic spins a bike’s wheels and squeezes both brake levers during a quick inspection. If either lever touches the handlebar before the brake grips, the mechanic marks the bike with an orange tag. The tag tells the morning crew to [[set the bike aside for a brake adjustment]] before anyone borrows it.'],
      prompt: 'What is the relationship between the orange tag and the inspection?',
      choices: ['The tag shows how long the inspection lasted.', 'The tag tells the mechanic which bikes are due for their first inspection.', 'The tag tells riders which brake lever they should use first.', 'The tag communicates that the inspection found a problem requiring action.'],
      correct: 3,
      explanation: 'The inspection identifies the brake problem. The tag tells the next crew what to do as a result.'
    },
    {
      id: 'p8', skill: 'tone', title: 'A Printer’s Progress',
      passage: ['The team promised that its new printer would make the office paperless. By Friday it had produced a stack of instructions for connecting to it, blank pages from three failed jobs, and a label reminding us which drawer held the instructions. We placed the label on top of the stack.'],
      prompt: 'What is the effect of listing everything the new printer produced?',
      choices: ['It offers a neutral record of the team’s first week.', 'It makes the printer’s paper use a humorous reversal of the promise.', 'It builds suspense about who caused the printer to fail.', 'It shows that the writer is impressed by how much the printer can do.'],
      correct: 1,
      explanation: 'The promise of a paperless office is followed by a growing pile of paper. That mismatch makes the scene funny.'
    },
    {
      id: 'p9', skill: 'organization', title: 'After the Bell',
      passage: ['The school wanted help sessions to be open to every student. Yet kids who rode the first bus went home before the sessions began. [[Because]] the first bus schedule could not change, the school moved the help sessions to lunchtime. In the following month, more bus riders attended.'],
      prompt: 'How are the ideas mainly arranged?',
      choices: ['A goal and an obstacle are introduced, then a response and its result are given.', 'Two ways to run the buses are presented, then their costs are compared.', 'An effect is described, then several equally likely causes are proposed.', 'A disagreement is presented, then the author explains why both sides are right.'],
      correct: 0,
      explanation: 'The attendance obstacle is the early bus. Lunchtime sessions are the response, and better attendance is the result. “Because” explains why the school changed the sessions instead of the bus.'
    },
    {
      id: 'p10', skill: 'tone', title: 'The Shallow Pool',
      passage: ['From the path, the rock pool looks motionless. Kneel down and wait. A shrimp no longer than your fingernail backs into a crevice. A small crab picks its way across a ridge and disappears. If you are patient, a pool that first looks empty can keep you watching for half an hour.'],
      prompt: 'What is the effect of the writer directly asking the reader to kneel and wait?',
      choices: ['It warns readers away from a dangerous pool.', 'It suggests that readers need to perform a formal scientific experiment.', 'It invites readers to share a quiet discovery.', 'It shows impatience with visitors who want a quick look.'],
      correct: 2,
      explanation: 'The instructions let readers imagine looking closely themselves. The quiet movement of the shrimp and crab is the discovery they are being invited to make.'
    },
    {
      id: 'p11', skill: 'organization', title: 'Same Map, Different Trip',
      passage: ['The bus map lists every stop. [[But]] does that tell a rider how long a trip will take? A group of students rode two buses between the same stops. One reached the library five minutes sooner because its driver spent less time waiting to turn. The group added typical trip times to the map it gave new students.'],
      prompt: 'Why does the author include the question in the second sentence?',
      choices: ['To request directions that the students could find on the map.', 'To suggest that the printed map left out some stops.', 'To announce that the students planned to compare routes between different places.', 'To raise a gap in the map’s information that the students’ comparison addresses.'],
      correct: 3,
      explanation: 'The opening tells you what the map provides. The question identifies what a rider still wants to know. The comparison supplies evidence about that missing information.'
    },
    {
      id: 'p12', skill: 'tone', title: 'Waiting for the First Note',
      passage: ['Behind the stage curtain, Jay heard the audience settle. A cough, a scrape of a chair, then nothing. He checked that his sheet music was facing the right way, though he knew it was. The piano waited at the center of the stage like a question he was about to answer.'],
      prompt: 'What does the comparison in the last sentence suggest about Jay?',
      choices: ['He is annoyed that the audience will not stay quiet.', 'He feels the pressure and anticipation of starting the performance.', 'He is embarrassed that he has lost his sheet music.', 'He thinks the audience will ask him to explain the music.'],
      correct: 1,
      explanation: 'Jay checks something he already knows is right. The quiet audience and the waiting piano build anticipation, like the moment before he must give an answer.'
    }
  ];

  const sessions = [
    {id: 'review', items: review},
    {id: 'practice', items: practice},
    {id: 'practice-tests-1-2', items: window.MarcoPracticeTestQuestions},
    {id: 'practice-test-4-review', appId: 'marco-reading-nov23-practice-test-4-v1', items: window.MarcoPracticeTest4Review}
  ].map(({id, items, appId = `marco-reading-nov21-${id}-v1`}) => ({
    session: id,
    appId,
    ids: items.map(item => item.id),
    questions: Object.fromEntries(items.map(item => [item.id, item]))
  }));
  const params = new URLSearchParams(location.search);
  const requested = Number(params.get('session'));
  const number = Number.isInteger(requested) && requested >= 1 && requested <= sessions.length ? requested : 1;
  const current = sessions[number - 1];
  const redo = number === 4 && params.get('redo') === '1';
  window.MarcoQR4Data = {
    ...current,
    number,
    appId: redo ? 'marco-reading-nov23-practice-test-4-redo-v1' : current.appId,
    redo,
    sessionCount: sessions.length,
    dashboardCourses: sessions
  };
})();
