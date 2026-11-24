(() => {
  'use strict';

  const skills = {
    detail: 'Supporting details',
    inference: 'Inference',
    organization: 'Organization and logic',
    vocabulary: 'Vocabulary in context',
    main: 'Main idea and purpose',
    tone: 'Tone, style, and figurative language'
  };

  // Each adaptation keeps the original question number, skill, and answer order.
  // Double brackets mark the evidence available after the first attempt.
  const questions = {};
  function add(mock, questionNumber, skill, title, passage, prompt, choices, letter, explanation) {
    const id = 'm' + mock + 'q' + questionNumber;
    questions[id] = {
      id, mockNumber: mock, questionNumber, skill, title, passage, prompt, choices, explanation,
      correct: 'ABCD'.indexOf(letter)
    };
  }

  const camouflage = [
    'Camouflage helps animals avoid stronger enemies. A beetle that resembles a drop of water may be overlooked by a bird. Another kind of camouflage is mimicry. A harmless animal may be protected by [[looking like a species that predators avoid]].',
    'Even with camouflage, an animal may occasionally be spotted. Yet for animals that depend on concealment, [[the effectiveness of that defense can determine whether they survive]].'
  ];
  add(0, 3, 'main', 'Camouflage', camouflage, 'What is the main point of the final paragraph?', [
    'Camouflage gets better as a species evolves.', 'Some kinds of camouflage work better than others.',
    'An animal can depend on effective camouflage to survive.', 'Camouflage makes animals blend into their surroundings.'
  ], 'C', 'The final paragraph focuses on the stakes for an animal that relies on concealment, even though its defense can sometimes fail.');
  add(0, 5, 'detail', 'Camouflage', camouflage, 'Which animals does the writer describe as mimics?', [
    'Dangerous animals that attack only when bothered.', 'Animals that copy how their attackers behave.',
    'Harmless animals that look like dangerous ones.', 'Animals that protect themselves by looking friendly.'
  ], 'C', 'The passage describes mimicry as a harmless animal resembling a species that predators already avoid.');

  const freezes = [
    'Freezes had harmed Florida fruit before, but the Great Freeze of 1895 [[reached more growers than any earlier freeze]]. Around Keystone City, some groves escaped damage. The land there was [[higher, and the groves were close to lakes]].',
    '[[A disastrous twentieth-century freeze struck in December 1962. Temperatures fell across the citrus region.]] When the weather warmed, [[the fruit thawed slowly]], leaving some of it usable. Growers were able to save part of their crop.'
  ];
  add(0, 7, 'detail', 'Florida’s citrus freezes', freezes, 'Why is the 1895 freeze especially well known among citrus growers?', [
    'It was the coldest freeze ever recorded up to that point.', 'It cut the usual orange harvest exactly in half.',
    'It affected more growers than any earlier freeze in Florida.', 'It forced growers to plant only cold-resistant oranges.'
  ], 'C', 'The opening gives the reason for its reputation in terms of how many growers it reached.');
  add(0, 8, 'inference', 'Florida’s citrus freezes', freezes, 'What most likely helped Keystone City avoid the worst damage in 1895?', [
    'Its elevation and nearby lakes.', 'Its disaster planning.', 'Its modern juice-processing plants.', 'Its growers’ long experience.'
  ], 'A', 'The description of the groves links the places that escaped damage to higher land and nearby water.');
  add(0, 9, 'detail', 'Florida’s citrus freezes', freezes, 'What helped growers save part of the 1962 crop?', [
    'The slow thaw after the freeze.', 'New lakes built around the groves.', 'Smoke from fires that warmed the groves.', 'Harvesting the fruit before the freeze.'
  ], 'A', 'The second paragraph connects gradual thawing to fruit remaining usable.');
  add(0, 11, 'organization', 'Florida’s citrus freezes', freezes, 'What is the main job of the second paragraph?', [
    'Describe Florida’s first disastrous citrus freeze of the twentieth century.', 'Compare weather records for several nineteenth-century freezes.',
    'Explain how weather determines the prices shoppers pay.', 'Show how frozen juice concentrate protects fruit from cold.'
  ], 'A', 'The second paragraph moves the account to the 1962 event and describes the cold and its immediate effect on the crop.');

  const posture = [
    'Friends in conversation often mirror each other without realizing it. Two people might lean on the same elbow or cross their legs the same way. This is called postural echo.',
    'A standing guest may be invited to sit. With everyone in a similar position, it is easier to move in step and [[the group feels more at ease]]. One member can disturb that ease by taking an alien posture, such as [[staying stiffly upright while everyone else relaxes]].'
  ];
  add(0, 16, 'main', 'Postural echo', posture, 'What is the main point of the paragraph about the group?', [
    'People only mirror the posture of their closest friends.', 'Groups feel more at ease when their members settle into similar postures.',
    'Most groups of friends prefer to talk while seated.', 'Everyone must intentionally agree to copy one another.'
  ], 'B', 'The invitation to sit and the example of a stiff stance both show how matching or breaking the pattern affects the group’s ease.');
  add(0, 17, 'tone', 'Postural echo', posture, 'What does taking an “alien posture” mean here?', [
    'Striking a boastful pose.', 'Sitting in a physically painful way.', 'Intentionally offending the group.', 'Holding your body differently from the others.'
  ], 'D', 'The stiff person stands out from a relaxed group. “Alien” describes a posture that is out of place in that setting.');

  const lange = [
    'Dorothea Lange studied photography and opened a portrait studio in San Francisco. The Great Depression left many people without work. [[Families traveling in search of jobs struggled to find food and a place to live]].',
    'Lange left the studio and took her camera into the streets and fields. She [[made portraits of people facing hardship]], bringing their conditions to the attention of a much wider public.'
  ];
  add(0, 21, 'detail', 'Dorothea Lange', lange, 'Why did Lange leave her studio?', [
    'She wanted to photograph people facing hardship.', 'She planned to work with famous photographers.',
    'She wanted to photograph people in countries around the world.', 'She wanted to become a teacher.'
  ], 'A', 'Her new work took her to the streets and fields to make portraits of people affected by the Depression.');
  add(0, 24, 'detail', 'Dorothea Lange', lange, 'Which statement is supported by the passage?', [
    'The Depression created hardships for migrant workers.', 'California was affected more than every other state.',
    'Lange’s own family lost all of its property in the crash.', 'Lange requested public aid for photographers.'
  ], 'A', 'The passage describes families traveling for work while struggling to find food and shelter.');

  const gravity = [
    'People once assumed that [[the heavens and Earth followed separate rules]]. [[Newton proposed that the attraction that makes an apple fall also acts on the Moon.]] He used [[mathematical equations to account for its orbit]].',
    'Newton’s law explained an enormous range of motion. [[There are limits, though.]] In the neighborhood of a very heavy star, for example, [[the star’s gravity calls for a different description]]. At the opposite extreme, [[atoms and elementary particles]] follow rules of their own.'
  ];
  add(0, 25, 'main', 'Newton’s law of gravity', gravity, 'What is one of the main purposes of the passage?', [
    'Trace all advances in theories about how the Moon moves.', 'Explain Newton’s law of gravity and where its explanation has limits.',
    'Explain why planets move in elliptical paths.', 'Show why Newton believed each place had its own physical laws.'
  ], 'B', 'The first paragraph introduces what the law explains. The second describes conditions where the explanation has limits.');
  add(0, 26, 'detail', 'Newton’s law of gravity', gravity, 'Which earlier assumption did Newton challenge?', [
    'Different laws govern events on Earth and in the heavens.', 'The force on objects on Earth also affects the Moon.',
    'A falling apple and the motion of the planets are connected.', 'The laws that explain planets have limits when applied to atoms.'
  ], 'A', 'The opening explicitly describes the earlier belief. Newton proposed one gravitational explanation for Earth and the Moon.');
  add(0, 27, 'detail', 'Newton’s law of gravity', gravity, 'What did Newton use to show that his theory could explain the Moon’s orbit?', [
    'Mathematical equations.', 'The example of an apple falling.', 'Measurements taken at several elevations.', 'A comparison with other planets’ moons.'
  ], 'A', 'The apple illustrates the idea. The passage names equations as the way Newton accounted for the orbit.');
  add(0, 28, 'vocabulary', 'Newton’s law of gravity', gravity, 'What does “in the neighborhood of” mean in this passage?', [
    'Close to.', 'Similar to.', 'Familiar with.', 'Working with.'
  ], 'A', 'Substitute “close to” and reread. The sentence describes the area immediately around the star.');
  add(0, 29, 'organization', 'Newton’s law of gravity', gravity, 'What is the “opposite extreme” from the very heavy star?', [
    'The most remote parts of the universe.', 'The laws people used to assign to the heavens.',
    'The laws that explain how planets and rocks move.', 'The tiny world of atoms and elementary particles.'
  ], 'D', 'The paragraph pairs a very massive object with the smallest objects. The phrase signals the contrast in scale.');

  const darkAges = [
    'Scholars have all but stopped using the term “Dark Ages” for the period after the fall of the Western Roman Empire. [[The term still appears occasionally.]] Some societies were flourishing, and new ideas in mathematics emerged.',
    'One suggestion about the inception of the label looks to the [[plagues and severe loss of life]] that marked parts of the period. These hardships may have [[given the period its name]].'
  ];
  add(1, 4, 'vocabulary', 'The “Dark Ages”', darkAges, 'What does “inception” mean here?', [
    'Origin.', 'End.', 'Definition.', 'Imagination.'
  ], 'A', 'The following words propose how the label came about. “Origin of the label” fits that context.');
  add(1, 5, 'vocabulary', 'The “Dark Ages”', darkAges, 'What is meant by “all but stopped” using the term?', [
    'No scholar uses it anymore.', 'Most scholars keep using it.', 'Scholars have almost entirely stopped using it.', 'It is only just beginning to fall out of favor.'
  ], 'C', '“All but” here means “almost completely.” It leaves room for an occasional use of the label.');
  add(1, 6, 'organization', 'The “Dark Ages”', darkAges, 'What is the job of the paragraph discussing plague and loss of life?', [
    'Prove that the whole world’s population shrank.', 'Show why scholars ought to use the label today.',
    'List the inventions of the period.', 'Offer a possible explanation for where the label came from.'
  ], 'D', 'The paragraph ties hardship to the origin of the name. That is the reason the plague appears in the discussion.');

  const owls = [
    'In the eye, rods detect low levels of light and cones help distinguish colors. An owl’s eyes are attuned to the dim conditions where it hunts. Compared with a human’s, an owl’s eyes are [[unusually sensitive in faint light]]. The owl’s retina has [[many more rods than cones]], which helps it spot movement at night.'
  ];
  add(1, 8, 'detail', 'Owls at night', owls, 'According to the passage, how do owls differ from humans?', [
    'Owls can move their eyes without moving their heads.', 'Owls have more rods than cones in their eyes.',
    'Owls can turn their heads all the way around.', 'Owls cannot hunt during the day.'
  ], 'B', 'Rods help detect dim light. The passage says that an owl has many more rods than cones.');
  add(1, 9, 'vocabulary', 'Owls at night', owls, 'What does “attuned” mean when describing the owl’s eyes?', [
    'Shaped.', 'Featured.', 'Beneficial.', 'Adapted.'
  ], 'D', 'The next sentence describes features that suit the owl to faint light. “Adapted to” expresses that fit.');

  const curling = [
    'Curling may not have been [[on many people’s radar before the 1998 Winter Olympics]]. In a game, one player sends a stone down the ice while teammates can sweep along its path. Sweeping [[reduces friction between the stone and the ice]], changing how far the stone travels.'
  ];
  add(1, 13, 'inference', 'Curling', curling, 'What does the reference to people’s radar and the 1998 Olympics imply?', [
    'More people have heard of curling since then.', 'Curling now has more players than most winter sports.',
    'Curling has only recently joined the Olympic program.', 'More people call curling their favorite sport.'
  ], 'A', 'The phrase is about public awareness. It suggests that the Olympics helped more people notice the sport.');
  add(1, 15, 'detail', 'Curling', curling, 'Why do teammates sweep the ice after the stone is released?', [
    'To make the stone heavier so it is easier to steer.', 'To reduce friction between the ice and the stone.',
    'To build bumps that send the stone farther.', 'To slow the stone by making the ice rougher.'
  ], 'B', 'The passage names the physical effect directly: the stone meets less resistance from the ice.');

  add(1, 21, 'detail', 'Making biscuits with Nana', [
    'The narrator learned from Nana to handle biscuit dough gently. He describes adding cold butter and folding the dough, then shaping it with his hands. He [[cautions against flattening it with a rolling pin]] and suggests patting it down.'
  ], 'What does the narrator specifically warn against?', [
    'Using low-fat milk.', 'Setting the oven temperature too low.', 'Using a rolling pin.', 'Cooling the butter too long.'
  ], 'C', 'The narrator names the rolling pin directly and suggests a gentler way to flatten the dough.');

  add(1, 25, 'main', 'The Salton Sea', [
    'Water from the Colorado River flooded a basin in Southern California and formed the Salton Sea. Over time, resorts and fishing drew visitors to its shores.',
    'As salinity rose, fish and wildlife suffered and the once-busy resorts declined. Today the changes in the lake create new problems for nearby communities.'
  ].map(p => '[[' + p + ']]'), 'What is the main purpose of the passage?', [
    'Give a short history of the Salton Sea’s rise and decline.', 'Explain only how the river escaped its channel.',
    'Convince readers to visit the resorts.', 'Describe a plan that will restore the lake.'
  ], 'A', 'The first paragraph follows the lake from its formation to its popularity. The second follows the decline. The broad answer covers both.');

  const coral = [
    'The Great Barrier Reef is a conglomeration of [[many smaller reefs]]. Coral and tiny algae live together. [[The coral provides shelter while the algae supply food]], so both partners benefit.',
    'In stressful conditions the coral can lose its algae and turn pale, a process called bleaching. When the reef suffers, [[other creatures can lose food and shelter]].'
  ];
  add(1, 33, 'inference', 'The Great Barrier Reef', coral, 'Which example best matches the kind of relationship between the coral and its algae?', [
    'A parasite takes nutrients from a fox.', 'A predator hunts another animal for food.',
    'People collect the pearls produced by an oyster.', 'A small fish gets food by removing irritating bugs from a whale.'
  ], 'D', 'The fish gets a meal and the whale gets rid of the bugs. As in the passage, the two living partners both gain something.');
  add(1, 34, 'vocabulary', 'The Great Barrier Reef', coral, 'What does “conglomeration” most nearly mean here?', [
    'Designation.', 'Location.', 'Habitat.', 'Assortment.'
  ], 'D', 'The reef is made up of many smaller reefs. “Assortment” fits the idea of a group made up of several parts.');
  add(1, 35, 'detail', 'The Great Barrier Reef', coral, 'What can happen when coral bleaching harms the reef?', [
    'Coral breaks free from the algae’s tissue.', 'Algae stop receiving energy supplied by coral.',
    'The lives of other reef organisms can be disrupted.', 'Bleaching directly increases climate change.'
  ], 'C', 'The last sentence names a direct consequence for other organisms: they can lose places to live and sources of food.');

  add(2, 6, 'organization', 'How birds share a habitat', [
    'Different kinds of birds can use the same habitat without competing for every meal. The way animals divide up food and space is known as [[resource partitioning]].',
    '[[In a forest, some birds hunt on the floor while others pick insects off the ends of branches.]] In a lake, dabbling ducks feed on the surface while diving ducks feed deeper down.'
  ], 'How is the passage organized?', [
    'It introduces a process and uses examples to explain it.', 'It states a claim about birds and lists research findings against it.',
    'It compares how the process differs across unrelated kinds of animals.', 'It traces the evolution of one kind of bird.'
  ], 'A', 'The opening names and explains the process. The forest and lake show the same process in two settings.');

  const peppers = [
    'Think of a time you bit into something spicy. The sting may have reminded you of the heat of a hot drink.',
    'What makes food feel hot when it is cool enough to eat?',
    'A grocery store has plenty of foods that give this kind of heat: [[fresh chiles, ground pepper powders, hot sauces, and pepper flakes]]. A chemical called capsaicin gives these foods their kick.',
    'Capsaicin activates a receptor called TRPV1. [[The same receptor responds to the temperature of a genuinely hot drink.]] Capsaicin comes from plants in the genus Capsicum, which originated in the Americas. [[Spanish explorers took these peppers to Europe in the 1500s]]. Portuguese traders later introduced them to India and China.'
  ];
  add(2, 8, 'organization', 'What makes peppers hot?', peppers, 'What does the third paragraph do for the reader?', [
    'Explain exactly how a heat receptor works.', 'Describe a typical trip to buy groceries.',
    'Introduce several foods that will each be discussed in detail later.', 'Show what kind of spice and heat the author is talking about.'
  ], 'D', 'The familiar examples make the topic concrete before the passage explains the receptor.');
  add(2, 11, 'inference', 'What makes peppers hot?', peppers, 'Which action would also activate TRPV1?', [
    'Drinking cool milk.', 'Eating watermelon seeds.', 'Eating a mild, sweet pepper.', 'Drinking a cup of hot tea.'
  ], 'D', 'TRPV1 responds to physical heat as well as capsaicin. Hot tea supplies the kind of heat described.');
  add(2, 12, 'detail', 'What makes peppers hot?', peppers, 'Which statement about Capsicum is supported by the passage?', [
    'It includes peppers and many unrelated types of plants.', 'It originated only in Mexico.',
    'It was brought to Europe during the sixteenth century.', 'It reached India before it reached Europe.'
  ], 'C', 'The passage names the Spanish voyages in the 1500s. Those years fall in the sixteenth century.');

  const galveston = [
    'In 1900 a storm crossed the Caribbean and reached the Texas coast near Galveston. It became [[the deadliest natural disaster in United States history]].',
    'Cuban forecasters expected the storm to strike Texas, but U.S. officials gave more weight to a forecast that directed it toward Florida.',
    'On the morning it arrived, residents had little reason to expect a major storm. That night, violent winds and rain overwhelmed the island.',
    '[[A witness who saw the aftermath described buildings broken apart and heaps of debris piled high across the city.]]',
    'Estimates put the death toll [[at about 8,000]]. Some later accounts argued that issuing a warning could have saved thousands of lives.'
  ];
  add(2, 14, 'inference', 'The Galveston hurricane', galveston, 'Which conclusion follows from the first and last paragraphs?', [
    'Using the Cuban forecast would certainly have kept deaths below 3,000.',
    'Every natural disaster in the world since 1900 has killed fewer than 8,000 people.',
    'Hurricane Katrina, a later U.S. disaster, killed fewer than 10,000 people.',
    'U.S. weather officials were responsible for every death in Galveston.'
  ], 'C', 'Combine the U.S. record in the opening with the estimate near 8,000. A later U.S. disaster could not have reached 10,000 under that record. The claim applies to the United States.');
  add(2, 18, 'organization', 'The Galveston hurricane', galveston, 'What is the purpose of the fourth paragraph?', [
    'Name the place where the storm reached land.', 'Describe the storm’s effects in Houston.',
    'List only the damage to individual homes.', 'Give a firsthand account of the storm’s impact.'
  ], 'D', 'The source shifts from a general account to someone who saw the damage. The paragraph adds an eyewitness view.');

  const kickball = [
    'Josie and her brother were playing kickball indoors. They had agreed to avoid the living room and to use gentle kicks. [[Soon they had stopped keeping score]] and were taking turns trying different kicks.',
    'Josie hit the ball harder than she meant to. It went into the living room and cracked the television. Hearing a car outside, she thought [[she would rather be taking a test at school right then]]. Before she could decide what to do, their father called for help carrying in a new television.'
  ];
  add(2, 21, 'inference', 'An indoor kickball game', kickball, 'What can you infer about Josie and her brother during their game?', [
    'They did not care who won.', 'They intended to break something.',
    'They regularly ignored every rule they were given.', 'They could kick equally well with either foot.'
  ], 'A', 'Once they stop keeping score, they keep playing for the kicks themselves. That is evidence about how much winning mattered in this game.');
  add(2, 22, 'organization', 'An indoor kickball game', kickball, 'Why does the author include Josie’s thought about taking a test?', [
    'To show that Josie enjoys taking tests.', 'To show that Josie generally thinks of school as a safe place.',
    'To show how much Josie dreads facing her dad when he comes home.', 'To show that Josie knows exactly what her punishment will be.'
  ], 'C', 'The thought comes when a car arrives and Josie is worried about explaining the television. Preferring a test shows how unpleasant that moment feels to her.');

  const ocean = [
    'The ocean stores carbon. One way carbon moves in is when carbon dioxide dissolves in seawater. In another process, some shell-building organisms release carbon dioxide while making shells. These two processes, [[the solubility and carbonate pumps, move carbon in opposite directions]].',
    'In the biological pump, [[phytoplankton near the surface use carbon dioxide as they make food]]. Some carbon moves back into the ocean through the food chain, and some eventually settles to the seafloor.',
    'By taking up carbon, [[the ocean cushions some effects of climate change]], but its capacity is limited. As dissolved carbon builds up, [[the chemistry of seawater changes and it absorbs carbon less readily]]. The water [[becomes more acidic, which can harm marine life]].'
  ];
  add(2, 26, 'inference', 'Carbon in the ocean', ocean, 'What does the passage imply when it describes the ocean as a buffer against some effects of climate change?', [
    'We need to build more oceans to fight climate change.', 'The ocean is completely reversing climate change.',
    'The ocean will stop taking in any carbon within just a few years.', 'Carbon emissions contribute to climate change.'
  ], 'D', 'If removing carbon dioxide from the air helps cushion the effects, leaving more of it in the air contributes to those effects.');
  add(2, 27, 'detail', 'Carbon in the ocean', ocean, 'Which effect of extra carbon in the ocean is NOT described in the passage?', [
    'Seawater becomes less acidic.', 'The health of marine life can decline.',
    'The ocean can take up carbon less readily.', 'The chemistry of seawater changes.'
  ], 'A', 'The passage gives the opposite direction: the water becomes more acidic. The other three effects all appear in the last paragraph.');
  add(2, 28, 'detail', 'Carbon in the ocean', ocean, 'Which statement is supported by the passage?', [
    'Phytoplankton help regulate carbon dioxide by taking it up near the ocean’s surface.',
    'The ocean has absorbed over half of all human carbon emissions.',
    'All carbon dioxide that enters an animal stays there permanently.',
    'Burning fossil fuels creates more carbon dioxide in the atmosphere than all other sources combined.'
  ], 'A', 'The second paragraph explains that phytoplankton use carbon dioxide, giving them a part in the movement and storage of carbon.');
  add(2, 29, 'detail', 'Carbon in the ocean', ocean, 'Why can the ocean absorb less carbon as dissolved carbon builds up?', [
    'The solubility pump wears out as it ages.', 'Absorbing carbon changes the chemistry of the seawater.',
    'All of the ocean’s organisms die.', 'Changes in acidity prevent the ocean from absorbing any more carbon.'
  ], 'B', 'The last paragraph gives the reason directly. The change in the water’s chemistry makes further absorption harder.');
  add(2, 30, 'detail', 'Carbon in the ocean', ocean, 'Which pair of processes moves carbon in opposite directions?', [
    'The solubility and carbonate pumps.', 'The carbonate and biological pumps.',
    'The biological and solubility pumps.', 'Every pair of pumps.'
  ], 'A', 'Dissolving carbon dioxide takes it into seawater. Shell building releases some carbon dioxide back out, so the two processes counteract one another.');

  const town = [
    'Leavenworth, Washington, used to be a center for logging. [[When the railroad moved, the town’s fortunes declined.]]',
    'Local leaders decided to give visitors a new reason to come. They settled on remaking downtown as a Bavarian village.',
    '[[The mountains nearby reminded residents of the Alps.]] They also knew that [[Solvang, California, had drawn visitors by embracing a Danish theme]]. Together, the landscape and Solvang’s example helped shape Leavenworth’s plan.',
    'Visitors were enthralled by the old-world streetscape. [[Festivals and winter lights drew crowds]], and the community turned a struggling town into a lively destination.'
  ];
  add(2, 31, 'main', 'Leavenworth’s new identity', town, 'What is the central purpose of the passage?', [
    'Compare several ways struggling cities have remade themselves.', 'Celebrate how a community revived a struggling U.S. town.',
    'Describe Bavarian customs as practiced across the United States.', 'Offer a step-by-step plan for other towns to attract visitors.'
  ], 'B', 'The passage follows one town from its decline through a local effort to rebuild to the success of that effort.');
  add(2, 33, 'vocabulary', 'Leavenworth’s new identity', town, 'What does “enthralled” most nearly mean here?', [
    'Puzzled.', 'Humored.', 'Repelled.', 'Captivated.'
  ], 'D', 'Visitors are drawn to the town’s new look and events. “Captivated” describes their strong interest.');
  add(2, 35, 'organization', 'Leavenworth’s new identity', town, 'What is the job of the third paragraph?', [
    'List the steps for rebuilding downtown.', 'Describe the area’s geography for its own sake.',
    'Provide a history of Solvang, California.', 'Explain what inspired Leavenworth’s change.'
  ], 'D', 'Both details explain where the idea came from: the mountains suggested the Alps, and the other town showed that a theme could attract visitors.');
  add(2, 36, 'detail', 'Leavenworth’s new identity', town, 'Which feature inspired Leavenworth to adopt a Bavarian theme?', [
    'Its mountain setting.', 'A group of cities outside the United States.',
    'German festivals already held in Leavenworth.', 'A decision to promote American holidays.'
  ], 'A', 'The third paragraph explains that the mountains reminded residents of the Alps and gave them part of the idea.');

  // Keep the original items readable by the progress engine so older saved records can still merge.
  const omitted = new Set(['m0q7', 'm0q9', 'm0q27', 'm1q15', 'm1q21', 'm2q30']);
  // Evidence indexes refer to bracketed excerpts in the shared passage, in reading order.
  const clueIndexes = {
    m0q3: [1], m0q5: [0], m0q8: [1], m0q11: [2], m0q16: [0], m0q17: [1],
    m0q21: [1], m0q24: [0], m0q25: [1, 3], m0q26: [0], m0q28: [4], m0q29: [5],
    m1q4: [2], m1q5: [0], m1q6: [1, 2], m1q8: [1], m1q9: [0], m1q13: [0],
    m1q33: [1], m1q34: [0], m1q35: [2],
    m2q8: [0], m2q11: [1], m2q12: [2], m2q14: [0, 2], m2q18: [1],
    m2q21: [0], m2q22: [1], m2q26: [2], m2q27: [3, 4], m2q28: [1], m2q29: [3],
    m2q31: [0, 3], m2q33: [3], m2q35: [1, 2], m2q36: [1]
  };
  const passages = new Map();
  for (const question of Object.values(questions)) {
    if (omitted.has(question.id)) continue;
    const { passage, id, title, mockNumber } = question;
    if (!passages.has(passage)) passages.set(passage, {id: 'p-' + id, title, mockNumber, passage, ids: []});
    const group = passages.get(passage);
    group.ids.push(id);
    question.passageId = group.id;
    const clues = passage.flatMap(paragraph => Array.from(paragraph.matchAll(/\[\[([^\]]+)\]\]/g), match => match[1]));
    question.evidence = clueIndexes[id] ? clueIndexes[id].map(index => clues[index]) : clues;
  }
  window.MarcoQR4Data = {
    archiveReview: true,
    session: 'earlier-mocks',
    appId: 'marco-reading-nov21-earlier-mocks-v1',
    passages: [...passages.values()],
    ids: [...passages.values()].flatMap(group => group.ids),
    questions,
    skills
  };
})();
