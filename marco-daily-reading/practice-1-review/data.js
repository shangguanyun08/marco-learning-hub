(() => {
  'use strict';

  const passages = {
    breathing: {
      title: 'How the body gets oxygen',
      paragraphs: [
        'The body can go only a short time without oxygen. Cells depend on a steady supply of oxygen to get the energy they need to grow, repair themselves, and keep the body alive. The respiratory system, working with the heart and blood vessels, helps deliver this essential supply.',
        'Air passes through the nose or mouth on its way to the lungs. The diaphragm and chest muscles help draw air in. The brain helps regulate breathing, and the heart pumps blood that carries oxygen to cells throughout the body.',
        'This complex system works efficiently for most people. However, smoke and other harmful particles can damage it, and a lack of physical activity can also affect how well it works. Stress can speed up both breathing and heart rate, another example of how closely these systems work together.'
      ]
    },
    humor: {
      title: 'What makes a joke funny?',
      paragraphs: [
        'Kinds of humor are easier to name than the reasons people laugh. Slapstick uses physical mishaps. Parody imitates someone or something for comic effect, while satire uses humor to criticize. Irony can arise when events turn out very differently from what people expect.',
        'Researchers distinguish three elements of a joke: its structure, content, and context. The content is what the joke is about. The context is the time, place, and situation in which someone tells it.',
        'Several theories try to explain laughter. One links it to a feeling of superiority, another to the release of tension, and a third to the gap between expectation and reality. Each accounts for some kinds of laughter.',
        'Peter McGraw’s benign violation theory says that a joke can break an expectation and still seem safe or acceptable. Whether it seems safe can depend on who hears it. A comic story about a fall might amuse one listener and upset someone who was recently hurt in a similar accident.'
      ]
    },
    mendel: {
      title: 'Mendel’s observations of peas',
      paragraphs: [
        'Gregor Mendel, a monk and scientist, noticed patterns in the pea plants he grew. The plants could have purple or white flowers, round or wrinkled seeds, and other contrasting traits. People often assumed offspring would show a blend of their parents’ traits. These clear differences gave Mendel a way to examine how traits pass from one generation to the next.',
        'In one experiment he crossed pea plants that reliably produced yellow seeds with plants that reliably produced green seeds. The first generation produced yellow seeds. When he crossed plants from that generation, green seeds appeared again, at about one green for every three yellow.',
        'The results showed that the green trait could pass to offspring even when yellow was the only visible color. Mendel’s experiments laid the groundwork for later studies of inheritance.'
      ]
    }
  };

  const questions = [
    {
      id: 'p1q2', sourceNumber: 2, passage: 'breathing', skill: 'Inference',
      prompt: 'Which word best describes the author’s attitude toward the respiratory system?',
      choices: ['Curiosity', 'Condemnation', 'Respect', 'Boredom'],
      originalChoice: 0,
      answer: 2,
      evidence: ['Cells depend on a steady supply of oxygen to get the energy they need to grow, repair themselves, and keep the body alive.'],
      explanation: 'The author emphasizes the system’s role in keeping people alive. That emphasis conveys respect for the work it does.',
      distractors: [
        'The author explains how the system works and emphasizes how much we depend on it. The question asks about the author’s attitude, which comes through in that emphasis.',
        'The author warns about things that harm the system. The warning shows concern for protecting it.',
        null,
        'The writer treats the subject as important by showing what the body needs the system to do.'
      ]
    },
    {
      id: 'p1q5', sourceNumber: 5, passage: 'breathing', skill: 'Inference',
      prompt: 'What does the author imply by saying the respiratory system works efficiently “for most people”?',
      choices: [
        'Some people’s respiratory systems do not work efficiently.',
        'Too many people die of lung cancer because of substances they breathe in.',
        'Many people are born with organs that function poorly.',
        'Most people would benefit from exercising more vigorously.'
      ],
      originalChoice: 3,
      answer: 0,
      evidence: ['works efficiently for most people'],
      explanation: '“Most” leaves room for exceptions. The next sentence gives examples of things that can interfere with how well the system works.',
      distractors: [
        null,
        'The author mentions smoke and harmful particles. The passage gives no information about lung cancer deaths.',
        'The passage gives examples of influences such as smoke and inactivity. It gives no information about how many people are born with poorly functioning organs.',
        'Exercise is mentioned later as one factor. The phrase “most people” qualifies who has a well-functioning system, rather than recommending a particular level of exercise.'
      ]
    },
    {
      id: 'p1q14', sourceNumber: 14, passage: 'humor', skill: 'Inference',
      prompt: 'What conclusion about humor can you draw from the passage?',
      choices: [
        'Humor is fairly simple to analyze.',
        'Researchers rarely study humor seriously.',
        'It is difficult to predict what a particular person will find funny.',
        'Naming types of humor is harder than explaining why people laugh.'
      ],
      originalChoice: 0,
      answer: 2,
      evidence: ['A comic story about a fall might amuse one listener and upset someone who was recently hurt in a similar accident.'],
      explanation: 'Two people can react differently to the same joke because their experiences differ. That makes individual reactions hard to predict.',
      distractors: [
        'The passage says naming kinds of humor is the easier part. Explaining why people laugh takes several theories, and each covers only some cases.',
        'The passage describes several researchers’ explanations of laughter. It gives no basis for claiming humor is seldom studied seriously.',
        null,
        'The first sentence places the difficulty the other way around: kinds of humor are easier to name than the reasons people laugh.'
      ]
    },
    {
      id: 'p1q16', sourceNumber: 16, passage: 'humor', skill: 'Organization and logic',
      prompt: 'Which topic does the passage explain the least?',
      choices: ['Theories of humor', 'Types of humor', 'The content of a joke', 'The structure of a joke'],
      originalChoice: 2,
      answer: 3,
      evidence: ['Researchers distinguish three elements of a joke: its structure, content, and context.', 'The content is what the joke is about.'],
      explanation: 'The passage names structure and moves on. It defines content and context, and it spends other paragraphs explaining types and theories.',
      distractors: [
        'The last two paragraphs outline multiple theories about why people laugh.',
        'The opening paragraph names and explains several types, including slapstick, parody, satire, and irony.',
        'Content receives a definition: it is what the joke is about. Compare that with structure, which is named without a definition.',
        null
      ]
    },
    {
      id: 'p1q18', sourceNumber: 18, passage: 'humor', skill: 'Vocabulary in context',
      prompt: 'What does “benign” mean in the phrase “benign violation theory”?',
      choices: ['Beneficial', 'Harmless', 'Truthful', 'Welcoming'],
      originalChoice: 3,
      answer: 1,
      evidence: ['a joke can break an expectation and still seem safe or acceptable'],
      explanation: 'The context pairs a violation with a sense of safety. A benign violation seems harmless enough for the listener to laugh.',
      distractors: [
        'Something can be harmless without providing a benefit. The wording in the passage is about safety and acceptability.',
        null,
        'The test in this theory is whether a joke feels safe to the listener. The passage gives no test of whether the joke is true.',
        '“Welcoming” suggests friendliness or invitation. Here “benign” describes how safe the violation feels.'
      ]
    },
    {
      id: 'p1q32', sourceNumber: 32, passage: 'mendel', skill: 'Inference',
      prompt: 'What most likely prompted Mendel to experiment with peas?',
      choices: [
        'His monastery stored old scientific manuscripts.',
        'He had been interested in the field of genetics for many years.',
        'The other monks at his monastery were dedicated to science.',
        'He noticed contrasting traits in the peas he grew and wanted to learn how they were inherited.'
      ],
      originalChoice: 1,
      answer: 3,
      evidence: ['noticed patterns in the pea plants he grew', 'These clear differences gave Mendel a way to examine how traits pass from one generation to the next.'],
      explanation: 'The passage connects what Mendel observed in his own plants with what he decided to study.',
      distractors: [
        'The passage identifies Mendel as a monk. It says nothing about a collection of manuscripts.',
        'Mendel’s work helped lay the groundwork for genetics. The passage points to patterns in the peas as the starting clue and gives no evidence of a years-long interest.',
        'The description tells us what Mendel studied. It gives no information about the other monks’ interests.',
        null
      ]
    }
  ];

  window.EvidenceData = {
    appId: 'marco-reading-practice-1-review-v1',
    revision: 1,
    sharedProgress: false,
    sourceTest: 'Practice 1',
    exportName: 'marco-practice-1-reading-review.json',
    passages,
    questions
  };
})();
