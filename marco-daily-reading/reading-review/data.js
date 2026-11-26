(() => {
  'use strict';

  const passages = {
    greenhouse: {
      title: 'The greenhouse after sunset',
      paragraphs: [
        'On sunny spring days, the school greenhouse warmed so quickly that its caretaker, Ren, often opened the roof vents before lunch. At night, however, the seedlings near the door sometimes wilted from the cold. A student suggested buying a stronger heater. Ren first tried setting several sealed barrels of water along the greenhouse’s back wall.',
        'The barrels did not make the greenhouse warmer at noon. On the contrary, when Ren compared two equally sunny days, the afternoon temperature was slightly lower on the day the barrels were in place. Their water had absorbed some of the heat that would otherwise have warmed the air. After sunset, the warmer water gradually released heat back into the greenhouse.',
        'The barrels could not keep seedlings safe through a hard freeze. During the ordinary cool nights of that spring, though, the greenhouse cooled more slowly, and the seedlings near the door stopped wilting. Ren kept the heater available for unusually cold nights.'
      ]
    },
    map: {
      title: 'The map with no shortcuts',
      paragraphs: [
        'Before a weekend street fair, Jaya and Theo were asked to make a map so visitors could find the main stage from the train station. Theo drew every lane in the neighborhood, including a narrow alley that cut behind several booths. It was the route he took on his way home. When Jaya tried it, two delivery carts were blocking the alley, and she had to turn back.',
        'Jaya marked a longer route along the wide streets instead. She added the bakery’s striped awning and the fountain at the final corner. Theo objected that neither was part of the fair. Jaya asked him to imagine following the map while looking ahead through a crowded street. “Would you rather count three tiny lanes or spot a striped awning?” she asked.',
        'At the station the next morning, a visitor glanced at the map and told her daughter to look for stripes. Theo heard her, took a pencil, and made the fountain symbol larger on the remaining copies.'
      ]
    },
    bell: {
      title: 'A bell for the library',
      paragraphs: [
        'When the town library moved into an old fire station, it left the station’s brass bell in the entrance. A plaque explained that firefighters once rang it to call volunteers to the building. Librarians occasionally told visiting classes how the bell had worked, but for years no one rang it.',
        'Then the library began a monthly repair workshop for household items. The organizers wanted a way to celebrate a repair without interrupting readers. They tried a quick tap on the bell, but it carried all the way to the upstairs reading room. A volunteer suggested moving the bell outside. The head librarian preferred leaving it where visitors could read the plaque, so the workshop used a little wooden clapper at the repair table instead.',
        'The bell stayed in the entrance. On workshop days, the clapper was barely audible beyond the repair table: readers across the hall often did not notice it, while volunteers at the table could hear it clearly.'
      ]
    },
    park: {
      title: 'What the trail counters counted',
      paragraphs: [
        'In early autumn, two electronic counters at the entrances to a neighborhood park recorded how many times people crossed their beams. One entrance led straight to the playing fields; the other, near a bus stop, led to a loop around a pond. In the first week, the pond entrance registered nearly twice as many crossings as the field entrance. A parks employee suggested that the pond path might need to be widened.',
        'Before drawing up plans, the crew watched the two entrances. People going to the fields generally crossed the beam once on the way in and once on the way out. At the pond entrance, the beam stood where the path looped back near the road. Joggers who stayed in the park often crossed it again on each lap. On a busy morning, one jogger triggered the counter eight times.',
        'The crew moved the pond counter closer to the road and collected another week of data. The difference between the two entrances shrank, although the crew still saw plenty of joggers on the loop. They postponed the decision about widening the path until they could also observe where people actually had trouble passing one another.'
      ]
    }
  };

  const questions = [
    {
      id: 'r1', passage: 'greenhouse', skill: 'Cause and effect', source: 'Earlier review · Trace the cause',
      prompt: 'Why did the greenhouse cool more slowly after sunset?',
      choices: [
        'The barrels prevented warm air from escaping through the roof vents.',
        'The water released heat it had absorbed earlier in the day.',
        'The greenhouse had reached a higher temperature than usual at noon.',
        'The barrels kept cold air from passing through the doorway.'
      ],
      answer: 1,
      evidence: ['Their water had absorbed some of the heat that would otherwise have warmed the air.', 'After sunset, the warmer water gradually released heat back into the greenhouse.'],
      explanation: 'Follow the heat across two times of day. The water takes it in during the afternoon and gives it back at night.',
      distractors: [
        'The vents appear in the opening paragraph. The passage gives a different mechanism for the slower cooling: the water releases stored heat.',
        null,
        'The afternoon was slightly cooler with the barrels, so a higher starting temperature cannot explain the result.',
        'The barrels stood along the back wall. The passage describes heat given off by water and gives no evidence that the barrels blocked drafts.'
      ]
    },
    {
      id: 'r2', passage: 'greenhouse', skill: 'Main idea', source: 'Earlier review · Keep the limits of a conclusion',
      prompt: 'Which statement best expresses the main idea of the passage?',
      choices: [
        'Ventilation is the most effective way to protect greenhouse seedlings from extreme temperatures.',
        'A hotter greenhouse during the day keeps seedlings safer at night.',
        'A school solved a problem with freezing temperatures by replacing its heater with barrels.',
        'Water barrels helped moderate the temperature, with a heater still available for severe cold.'
      ],
      answer: 3,
      evidence: ['Their water had absorbed some of the heat that would otherwise have warmed the air.', 'The barrels could not keep seedlings safe through a hard freeze.', 'Ren kept the heater available for unusually cold nights.'],
      explanation: 'The answer covers both what the barrels changed and the limit Ren observed.',
      distractors: [
        'Opening vents is a detail about the daytime heat. The passage follows Ren’s experiment with the barrels and its results.',
        'The afternoon got slightly cooler with the barrels, and the water later released heat. The passage never ties seedling safety to a hotter afternoon.',
        'The last paragraph says the barrels could not protect seedlings through a hard freeze. Ren kept the heater available.',
        null
      ]
    },
    {
      id: 'r3', passage: 'map', skill: 'Inference', source: 'Earlier review · Use a character’s actions as evidence',
      prompt: 'What does Theo’s change to the fountain symbol most strongly suggest?',
      choices: [
        'He came to see that a recognizable landmark could make the map easier to follow.',
        'He thought the fountain would be more interesting to visitors than the stage.',
        'He expected the crowd to block the view of the bakery for the rest of the day.',
        'He wanted the map to help visitors take his original shortcut.'
      ],
      answer: 0,
      evidence: ['a visitor glanced at the map and told her daughter to look for stripes', 'made the fountain symbol larger on the remaining copies'],
      explanation: 'Theo hears someone use the awning as a landmark. He then makes the other landmark easier to spot on the map.',
      distractors: [
        null,
        'Enlarging the symbol makes a turn easier to find. The story gives no evidence that Theo ranks the fountain above the stage as an attraction.',
        'The visitor plans to use the awning, and Theo enlarges the fountain. The scene gives no reason to predict that the awning will become hidden.',
        'The fountain marks a turn on Jaya’s longer route. Making it easier to see helps readers follow that route.'
      ]
    },
    {
      id: 'r4', passage: 'map', skill: 'Paragraph purpose', source: 'Earlier review · Explain what an example shows',
      prompt: 'What is the main purpose of the exchange about the striped awning in the second paragraph?',
      choices: [
        'To explain why the fair’s organizers should recruit the bakery.',
        'To suggest that visitors must take a longer route when a bakery is open.',
        'To show why an easy-to-spot feature can help visitors navigate crowded streets.',
        'To describe what happened when a visitor first followed the map.'
      ],
      answer: 2,
      evidence: ['imagine following the map while looking ahead through a crowded street', 'Would you rather count three tiny lanes or spot a striped awning?'],
      explanation: 'Jaya asks Theo to compare two ways of finding a turn. The awning gives visitors something they can recognize at a glance.',
      distractors: [
        'Jaya picks the awning as a landmark. Their conversation never discusses a role for the bakery at the fair.',
        'Delivery carts block the alley in the first paragraph. The exchange in paragraph two concerns how visitors recognize the route.',
        null,
        'The visitor uses the map in the third paragraph. In the second paragraph Jaya explains how she expects a landmark to help.'
      ]
    },
    {
      id: 'r5', passage: 'bell', skill: 'Vocabulary in context', source: 'Earlier review · Keep the force of a modifier',
      prompt: 'What does “barely audible” mean in the final paragraph?',
      choices: [
        'Unexpectedly loud.',
        'Heard only when there was a long pause.',
        'Impossible to hear.',
        'Just loud enough to hear.'
      ],
      answer: 3,
      evidence: ['readers across the hall often did not notice it, while volunteers at the table could hear it clearly'],
      explanation: 'The clapper makes a real sound, but it becomes difficult to hear beyond the table.',
      distractors: [
        'The brass bell carries upstairs. The words “barely audible” describe the much quieter wooden clapper.',
        'The clue compares people’s distance from the table. There is no clue about pauses or timing.',
        'The volunteers heard the clapper clearly. “Barely” means that it was only just loud enough in this context.',
        null
      ]
    },
    {
      id: 'r6', passage: 'bell', skill: 'Supporting detail', source: 'Earlier review · Verify three choices on a NOT question',
      prompt: 'Which action is NOT described as having happened?',
      choices: [
        'The library displayed a plaque explaining the bell’s original use.',
        'The organizers moved the brass bell outdoors.',
        'The organizers tried tapping the brass bell.',
        'The workshop used a wooden clapper at the repair table.'
      ],
      answer: 1,
      evidence: ['A volunteer suggested moving the bell outside.', 'The bell stayed in the entrance.'],
      explanation: 'Moving the bell was a suggestion. The final paragraph tells you where the bell actually stayed.',
      distractors: [
        'The opening paragraph says a plaque explained what the firefighters had used the bell for. Look for the one action that did not take place.',
        null,
        'The organizers tried a quick tap. It could be heard upstairs, which explains why they needed another solution.',
        'The second paragraph says the workshop used a wooden clapper at the table, and the last paragraph describes who could hear it.'
      ]
    },
    {
      id: 'r7', passage: 'park', skill: 'Inference', source: 'Earlier review · Test what a number actually measures',
      prompt: 'Why were the first week’s counts insufficient to show that nearly twice as many people used the pond entrance?',
      choices: [
        'The pond entrance counter only worked on some days.',
        'People leaving the park never crossed the field entrance beam.',
        'A person who stayed in the park could register several pond-side crossings.',
        'The field entrance counter counted people on their way to the bus stop.'
      ],
      answer: 2,
      evidence: ['Joggers who stayed in the park often crossed it again on each lap.', 'one jogger triggered the counter eight times'],
      explanation: 'The counter records crossings. One person can add several crossings without entering the park several times.',
      distractors: [
        'The crew observed a problem with the counter’s placement. The passage gives no evidence that it stopped working on certain days.',
        'The second paragraph says people at the field usually crossed when they went in and when they went out.',
        null,
        'The bus stop is near the pond entrance. What inflated the pond count was people repeatedly crossing while jogging laps.'
      ]
    },
    {
      id: 'r8', passage: 'park', skill: 'Organization', source: 'Earlier review · Follow the order and purpose of paragraphs',
      prompt: 'How does the author organize the passage?',
      choices: [
        'By presenting an initial finding, explaining what made it misleading, and showing how the crew responded.',
        'By arguing that the path should be widened, listing objections, and proving those objections wrong.',
        'By describing where both counters were moved and comparing the equipment used at each entrance.',
        'By listing ways to make paths safer and recommending the cheapest option.'
      ],
      answer: 0,
      evidence: ['registered nearly twice as many crossings', 'Joggers who stayed in the park often crossed it again on each lap.', 'They postponed the decision about widening the path'],
      explanation: 'Track each paragraph’s job. First comes the count, then the observation that explains it, and finally the change in procedure and decision.',
      distractors: [
        null,
        'One employee suggests widening the path, but the crew postpones that decision. The author shows how the crew investigates the initial count.',
        'The crew moves only the pond counter. The passage follows the interpretation of its readings and gives no comparison of equipment types.',
        'The author follows an investigation into the traffic counts. The crew discusses widening the path, but there is no list of safety options or costs.'
      ]
    }
  ];

  window.EvidenceData = {
    appId: 'marco-reading-review-session6-v1',
    revision: 1,
    sharedProgress: false,
    exportName: 'marco-reading-session-6.json',
    passages,
    questions
  };
})();
