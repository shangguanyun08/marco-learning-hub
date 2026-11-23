(() => {
  'use strict';

  const geneticsIntro = 'Have you ever wondered why you have your mother’s brown eyes, or why your hair looks like a mix of both parents’ hair? Many people show a combination of traits from their parents. Chromosomes carry the genetic information that shapes those traits.';
  const inheritance = 'People inherit their chromosomes from their biological parents. Half come from their mother and half from their father.';
  const dominant = 'When a dominant and a recessive form are both present, the dominant trait is the one that shows.';
  const contrast = 'Some forms of a gene are dominant, while others are recessive.';

  const lochNess = [
    'For centuries, people have reported seeing a large creature in Loch Ness. In 1933, a newspaper ran a story about a couple who said they had seen an enormous animal in the lake. The editors named it the Loch Ness monster, and the story soon became famous. A circus even offered a reward for catching it.',
    'Alleged sightings and rumors continued for decades. In one documentary, researchers detected something moving toward the deepest part of the lake, but did not identify it. The crew left without proof. Hotels, tours, and gift shops around the lake still benefit from visitors hoping to see Nessie.'
  ];

  window.MarcoPracticeTest4Review = [
    {
      id: 'ti4q5', test: 4, questionNumber: 5, skill: 'inference', title: 'Genetics',
      passage: [geneticsIntro, inheritance.replace('biological parents', '[[biological parents]]').replace('Half come from their mother and half from their father.', '[[Half come from their mother and half from their father.]]')],
      prompt: 'Why does the author specify “biological parents”?',
      choices: ['To clarify a previous question.', 'To acknowledge that some people are adopted.', 'To specify whose parents were being identified.', 'To reinforce the importance of genetic inheritance.'],
      correct: 3,
      explanation: 'The next sentence explains where the chromosomes come from. That makes the author’s reason genetic inheritance. Choice C describes what the phrase literally identifies, but it leaves out why the distinction matters.'
    },
    {
      id: 'ti4q6', test: 4, questionNumber: 6, skill: 'vocabulary', title: 'Genetics',
      passage: [geneticsIntro, `${inheritance} ${contrast} [[${dominant}]]`],
      prompt: 'In the passage, “recessive” most nearly means',
      choices: ['imaginable.', 'immobilized.', 'inactive.', 'individual.'],
      correct: 2,
      explanation: 'The recessive form can be present without showing in the trait. “Inactive” is the closest option here. “Immobilized” means unable to move, and movement has nothing to do with the contrast.'
    },
    {
      id: 'ti4q23', test: 4, questionNumber: 23, skill: 'inference', title: 'Household products',
      passage: [
        'Look at the label on a cleaning or hygiene product and you’ll often find ingredients with [[names that are hard to pronounce]]. [[Some chemicals with complicated names are safe, while others may be harmful.]] Fortunately, it’s easier than you might think to [[find alternatives to products that contain chemicals like butyl cellosolve]].',
        'Raw honey is one household ingredient with several uses. The author also suggests looking into uses for salt, vinegar, olive oil, and baking soda.'
      ],
      prompt: 'Based on the passage, what can you infer?',
      choices: ['Cleaning products are always highly toxic.', 'Butyl cellosolve is a good alternative to harmful chemicals.', 'It can be difficult to tell whether a product contains harmful ingredients.', 'Chemicals with complicated names are usually harmful.'],
      correct: 2,
      explanation: 'Put two ideas together: the names are hard to interpret, and a complicated name doesn’t tell you whether a chemical is safe. Choice B reverses the author’s point about butyl cellosolve. It is in the products the author suggests replacing.'
    },
    {
      id: 'ti4q32', test: 4, questionNumber: 32, skill: 'tone', title: 'The Loch Ness monster',
      passage: [
        lochNess[0].replace('a couple who said they had seen an enormous animal', '[[a couple who said they had seen an enormous animal]]'),
        lochNess[1].replace('The crew left without proof.', '[[The crew left without proof.]]')
      ],
      prompt: 'Which phrase best describes the tone of the passage?',
      choices: ['Balanced and factual.', 'Dynamic and surprising.', 'Philosophical and musing.', 'Inspirational and enlightening.'],
      correct: 0,
      explanation: 'The author reports what witnesses claimed and what investigators could prove. The passage takes a measured approach. A mysterious topic alone doesn’t make the writing philosophical.'
    },
    {
      id: 'ti4q35', test: 4, questionNumber: 35, skill: 'organization', title: 'The Loch Ness monster',
      passage: [lochNess[0], lochNess[1].replace('Alleged sightings and rumors', '[[Alleged sightings and rumors]]').replace('The crew left without proof.', '[[The crew left without proof.]]')],
      prompt: 'Why does the author use the phrase “alleged sightings and rumors”?',
      choices: ['To suggest that the rumors are probably true.', 'To emphasize that there have been no proven sightings of Nessie.', 'To highlight the amount of evidence that Nessie exists.', 'To contrast the sightings with the earlier offer of a reward for catching Nessie.'],
      correct: 1,
      explanation: '“Alleged” means claimed but unconfirmed. The word “rumors” and the later lack of proof reinforce that uncertainty. The author distinguishes reports from verified evidence.'
    }
  ];
})();
