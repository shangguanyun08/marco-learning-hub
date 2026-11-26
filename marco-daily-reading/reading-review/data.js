(() => {
  'use strict';

  const passages = {
    eiffel: {
      title: 'Who gets credit for the Eiffel Tower?',
      paragraphs: [
        'France’s government organized the 1889 world’s fair in Paris to mark a century since the French Revolution. It sought a structure for the fair that would display the country’s engineering skill. The tower was planned as a temporary feature of the fair.',
        'The government picked a proposal from Gustave Eiffel’s engineering firm. Engineers Maurice Koechlin and Émile Nouguier helped develop the design, and architect Stephen Sauvestre added decorative features. Eiffel put money into the tower project and championed it in public. His name came to stand for the finished tower.',
        'The tower went up despite protests and was due to be dismantled after twenty years. Its later uses for weather observations and communications helped secure its place in the city.'
      ]
    },
    lucian: {
      title: 'Lucian’s walk into unfamiliar country',
      paragraphs: [
        'Lucian leaves the main road to look for places he has never seen. Rain has passed, but heavy clouds hang motionless over the woods.',
        'Runoff has cut the old lane so far below the surrounding land that it resembles a ditch. Thick hedges crowd its edges. Together, the depth of the lane and the hedges hide the country beyond it. Water spills down the sides as Lucian follows the lane downhill.',
        'The lane opens at the bottom into a hollow surrounded by wooded slopes. Streams feed a noisy brook, and Lucian pauses on a footbridge to watch debris rush downstream.',
        'Lucian climbs between limestone walls and hears the rushing water grow faint. A gap in the walls suddenly gives him a view across valleys to faraway hills and the sky. Below him the oak woods are silent and look as if no one ever goes there. The unfamiliar view fills him with wonder.'
      ]
    }
  };

  const questions = [
    {
      id: 'p7q18', sourceNumber: 18, passage: 'eiffel', skill: 'Inference',
      prompt: 'Why does the passage suggest that Gustave Eiffel became the person most closely associated with the tower?',
      choices: [
        'He designed the features that made the tower distinctive.',
        'He played the most publicly visible role in getting the tower built.',
        'He had closer ties to the government than the rest of his team.',
        'He made the 1889 world’s fair possible.'
      ],
      originalChoice: 3,
      answer: 1,
      evidence: ['Eiffel put money into the tower project and championed it in public.'],
      explanation: 'Eiffel’s public support and financing explain why people linked his name with the tower.',
      distractors: [
        'Several people designed the tower. The passage credits Sauvestre with the decorative features.',
        null,
        'The government selected Eiffel’s firm. Nothing in the passage compares the team members’ political connections.',
        'The French government organized the fair. Eiffel’s role was funding and promoting the tower, one project at the fair.'
      ]
    },
    {
      id: 'p7q32', sourceNumber: 32, passage: 'lucian', skill: 'Supporting idea',
      prompt: 'What blocks Lucian’s view of the surrounding country as he walks down the lane?',
      choices: [
        'The heavy clouds darken the landscape.',
        'The valley is too wide to see across.',
        'The lane lies deep below the surrounding land, with dense hedges at its edges.',
        'Rain has left thick fog hanging over the ground.'
      ],
      originalChoice: 3,
      answer: 2,
      evidence: ['Together, the depth of the lane and the hedges hide the country beyond it.'],
      explanation: 'The passage names two physical barriers to his view: the sunken lane and the hedges.',
      distractors: [
        'Heavy clouds set the scene at the start. The sentence that explains the blocked view names the lane and hedges.',
        'Lucian can later see across the valleys from higher ground. Here, the depth of the lane and the hedges block his view.',
        null,
        'Rain and runoff are in the passage. Fog is an added detail, and the passage gives a different cause for the blocked view.'
      ]
    },
    {
      id: 'p7q33', sourceNumber: 33, passage: 'lucian', skill: 'Mood',
      prompt: 'What mood does the description of the oak woods below Lucian create?',
      choices: [
        'Contentment',
        'Dread',
        'Isolation',
        'Urgency'
      ],
      originalChoice: 0,
      answer: 2,
      evidence: ['the oak woods are silent and look as if no one ever goes there'],
      explanation: 'The quiet and apparent absence of people make the woods feel remote and lonely.',
      distractors: [
        'Contentment suggests satisfaction. Here, the description of the woods emphasizes silence and the sense that nobody comes this way.',
        'The setting feels deserted. The description gives no sign of a threat or of something bad about to happen.',
        null,
        'The question points to the silent woods. The rushing water earlier in the walk belongs to a different part of the passage.'
      ]
    },
    {
      id: 'p7q36', sourceNumber: 36, passage: 'lucian', skill: 'Paragraph purpose',
      prompt: 'What is the main job of the final paragraph?',
      choices: [
        'To describe the limestone rocks Lucian notices.',
        'To show the shift from an enclosed route to a wide view.',
        'To show Lucian reaching familiar ground at the end of the walk.',
        'To explain why the noise of the water fades as he climbs.'
      ],
      originalChoice: 0,
      answer: 1,
      evidence: ['Together, the depth of the lane and the hedges hide the country beyond it.', 'A gap in the walls suddenly gives him a view across valleys to faraway hills and the sky.'],
      explanation: 'Compare what Lucian could see earlier with what he can see now. The widening view is the change the paragraph builds toward.',
      distractors: [
        'The limestone walls are one detail at the start. Notice where the paragraph goes next: Lucian reaches a gap and sees the land open up.',
        null,
        'The final view amazes Lucian because it is unfamiliar. His walk takes him farther into new country.',
        'Fading water is one detail of the climb. The paragraph builds toward the moment when the view opens.'
      ]
    }
  ];

  window.EvidenceData = {
    appId: 'marco-reading-practice-7-review-v1',
    revision: 1,
    sharedProgress: false,
    exportName: 'marco-practice-7-reading-review.json',
    passages,
    questions
  };
})();
