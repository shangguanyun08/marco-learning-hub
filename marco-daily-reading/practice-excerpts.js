(() => {
  'use strict';

  // Reading Comprehension excerpts from Test Innovators ISEE Middle #1 and #2, v12.0.
  const porchConclusion = 'To many families, the change felt like progress. A furnished backyard, shielded from the street, suggested that its owners had earned leisure and comfort. The fenced yard had become a quiet symbol of success, a private reward for years of work. [[Yet]] something was quietly lost. The street, once lined with porches where neighbors watched the world together, grew quieter, and the accidental connections the porch had encouraged became harder to find.';

  window.MarcoPracticeTestQuestions = [
    {
      id: 'ti1q3', test: 1, questionNumber: 3, skill: 'organization', title: 'The Respiratory System',
      passage: [
        'Oxygen from the air we breathe may be the most basic of human needs. … Human beings have sophisticated respiratory systems to make sure we access adequate amounts of this fundamental element.',
        'Our respiratory system [[includes]] our noses, mouths, throats, and lungs; the tubes and passageways that connect these organs to one another; and our diaphragm and chest muscles that enable us to breathe.',
        'This intricate system serves most of us very efficiently. [[However]], the respiratory system can be damaged by inhaled smoke and toxic debris. … Our respiratory systems are [[also affected]] by stress.'
      ],
      prompt: 'Which choice best describes the organization of the passage?',
      choices: [
        'Patterns are listed in chronological order.',
        'A problem is explained, then several potential solutions are presented.',
        'Claims about a fundamental biological process are offered in descending order of importance.',
        'A biological process is introduced, followed by an explanation of its components and factors that affect it.'
      ],
      correct: 3,
      explanation: 'Give each part a job. The opening introduces why we need oxygen, the next part names the parts that help us breathe, and the ending describes factors that affect how the system works.'
    },
    {
      id: 'ti1q10', test: 1, questionNumber: 10, skill: 'tone', title: 'Two New Dog-Faced Bats',
      passage: [
        'For more than fifty years, experts have believed that only six species of dog-faced bats existed. However, researchers have recently announced the exciting discovery of two new species of the cute little bats: Freeman’s dog-faced bat and the Waorani dog-faced bat.',
        'Ultimately, a mixture of new technology and old museum collections led to the incredibly valuable discovery of these two new species. Hopefully, this combination of assets can lead to further discoveries in the future.'
      ],
      prompt: 'Which best describes the tone of the passage regarding the discovery of two new species of dog-faced bats?',
      choices: ['Enthusiastic', 'Neutral', 'Nostalgic', 'Pessimistic'],
      correct: 0,
      explanation: 'The author calls the discovery exciting and incredibly valuable, and expresses hope for more discoveries. Those word choices show enthusiasm.'
    },
    {
      id: 'ti1q20', test: 1, questionNumber: 20, skill: 'organization', title: 'Pluto’s Reclassification',
      passage: [
        'From the time of its discovery in [[1930]] until 2006, Pluto was classified as our ninth planet. Beginning in the late [[1970s]], this classification fell under increasing scrutiny as scientists debated whether Pluto met the definition of a planet or should be reclassified.',
        'Pluto’s mass, determined by its effect on the orbits of other planets, was originally calculated as similar to that of Earth. However, later estimations decreased … Pluto’s actual mass, determined in [[1978]], is about 0.2% of Earth’s.',
        'The most recent calculations show Pluto to be exceptionally tiny in contrast to the other planets of our solar system. … Pluto is also less massive than Eris, a trans-Neptunian object discovered in [[2005]].',
        'The debate came to a head with a [[2006]] resolution by the International Astronomical Union that officially defined the term “planet.” Due to Pluto’s mass, it did not meet the qualifications. Pluto was officially reclassified as a dwarf planet, a decision met with mixed resistance and approval in the astronomy community.'
      ],
      prompt: 'Which best describes the organization of the passage?',
      choices: ['In chronological order', 'Comparison and contrast', 'Facts followed by opinions', 'Stated argument defended against all criticism'],
      correct: 0,
      explanation: 'Track the main events: discovery, increasing doubts and new findings, then the official decision. The size comparisons help explain the history along the way.'
    },
    {
      id: 'ti2q12', test: 2, questionNumber: 12, skill: 'tone', title: 'Martha Graham and Modern Dance',
      passage: [
        'At the center of this emerging art form was a woman named Martha Graham. Like a butterfly bursting forth from a cocoon, modern dance ripped through the restrictions of ballet, casting away its requirements for classical technique as well as its expectations for the dancer and the dance. In modern dance, there are no rules regarding what the dancer is allowed to do with his or her body.'
      ],
      prompt: 'In the analogy that begins with “like a butterfly,” what do the cocoon and butterfly each represent?',
      choices: [
        'The cocoon represents modern dance, and the butterfly represents ballet.',
        'The cocoon represents the rigidity of ballet, and the butterfly represents modern dance.',
        'The cocoon represents the modern dancer, and the butterfly represents the constraints of ballet.',
        'The cocoon represents the tightness of ballet slippers, and the butterfly represents the modern dancer.'
      ],
      correct: 1,
      explanation: 'Match both parts of the image. The cocoon holds the butterfly in, just as ballet’s rules limit movement. Modern dance is what breaks free, so it is the butterfly.'
    },
    {
      id: 'ti1q34', test: 1, questionNumber: 34, skill: 'organization', title: 'Mendel’s Pea Plants',
      passage: [
        'Mendel conducted his experiments on plants that were breeding true with regard to seed color. He used yellow-seed-producing plants that had been crossed for many generations and only produced yellow-colored seeds; he did the same with green-seed-producing plants. [[He then asked]], “What color are the seeds of the offspring of yellow-seed-producing plants when bred with green-seed-producing plants?”'
      ],
      prompt: 'Which best describes the organization of the paragraph shown?',
      choices: [
        'Mendel’s experimental design is introduced.',
        'Two of Mendel’s observations are examined for accuracy.',
        'Mendel’s hypothesis is stated, then tested, and finally his results are described.',
        'Opinions are contrasted with conflicting evidence from Mendel’s pea studies.'
      ],
      correct: 0,
      explanation: 'The paragraph names the plants he chose and ends by posing the question he wanted to answer. The results belong to a later paragraph. Match the answer to the paragraph shown.'
    },
    {
      id: 'ti2q15', test: 2, questionNumber: 15, skill: 'tone', title: 'The Sapphire Tower Plant',
      passage: [
        'Bursts of electric blue shoot forth from a plant that looks like a firework in motion: Puya alpestris, also fittingly known as the sapphire tower plant. Native to Chile, this botanical beauty has the most fleeting window of time in which it blooms in all its vibrant splendor—only a few weeks, after a decade or more of growth!'
      ],
      prompt: 'The passage suggests that the author compares P. alpestris to “a firework in motion” mainly to emphasize that the plant is',
      choices: [
        'dangerous to handle up close.',
        'likely to bloom in large groups.',
        'difficult to predict where it will grow.',
        'visually dramatic when it’s in bloom.'
      ],
      correct: 3,
      explanation: 'The words “bursts of electric blue” explain the comparison. A firework helps the reader picture the bright, striking display.'
    },
    {
      id: 'ti2q23', test: 2, questionNumber: 23, skill: 'tone', title: 'The School Lunch Debate',
      passage: [
        'Throughout the 1980s and 1990s, however, there were many cuts to school lunch programs—nutrition standards became less of a priority than saving money. Famously, ketchup was declared a “vegetable” to avoid the expense of real vegetables. Significantly smaller lunch portions and poor nutrition standards even led Time magazine to state that American schools were “flunking lunch.”'
      ],
      prompt: 'In the sentence beginning “Famously,” the author’s tone is best described as',
      choices: ['Ironic', 'Matter-of-fact', 'Shocked', 'Thoughtful'],
      correct: 0,
      explanation: 'The quotation marks around “vegetable” and the phrase “real vegetables” expose the mismatch between the label and the food. That dry contrast creates irony.'
    },
    {
      id: 'ti2q24', test: 2, questionNumber: 24, skill: 'organization', title: 'The School Lunch Debate',
      passage: [
        'Despite anecdotal reports that these healthier lunches are ending up in the trash, research suggests otherwise. A 2015 study, which followed 500 children in urban schools for two years, found a 19% increase in vegetable intake among the study’s subjects. These findings should be encouraging to everyone invested in a common goal: ensuring that all children eat well and learn healthy eating habits, so they can grow [[physically and mentally strong]].'
      ],
      prompt: 'The purpose of the last sentence is to',
      choices: [
        'offer a simple principle to guide the federal government in all future legislation.',
        'convince readers that a balanced diet is the most important part of a good education.',
        'suggest that nutritious school meals are beneficial for more than just physical health.',
        'describe the universal agreement that healthy school lunches should be provided to all students.'
      ],
      correct: 2,
      explanation: 'The sentence moves from a study result to why it matters. “Physically and mentally strong” gives two kinds of benefits, which is exactly what the correct choice captures.'
    },
    {
      id: 'ti2q35', test: 2, questionNumber: 35, skill: 'organization', title: 'From Front Porch to Backyard',
      passage: [porchConclusion],
      prompt: 'The last paragraph primarily serves to',
      choices: [
        'trace the steps of how families furnished their backyards.',
        'recall in detail how neighbors once gathered on the porch.',
        'balance the appeal of the change against what was lost.',
        'introduce the reasons families first moved out to the suburbs.'
      ],
      correct: 2,
      explanation: 'Read both sides of “Yet.” The first side explains why a private backyard felt like progress. The second explains the cost: fewer spontaneous connections with neighbors.'
    },
    {
      id: 'ti2q36', test: 2, questionNumber: 36, skill: 'tone', title: 'From Front Porch to Backyard',
      passage: [
        'For much of American history, the front porch was the social heart of the home. On warm evenings, families gathered there to escape the heat indoors, and from this perch they greeted neighbors passing along the sidewalk.',
        porchConclusion
      ],
      prompt: 'The author’s attitude toward the rise of the private backyard is best described as',
      choices: [
        'curious about its appeal but alarmed by its consequences.',
        'enthusiastic about its appeal and untroubled by any loss.',
        'nostalgic for the porch and scornful of suburban families.',
        'appreciative of its appeal yet longing for what was lost.'
      ],
      correct: 3,
      explanation: 'The author recognizes families’ comfort and leisure, then describes the neighborhood connections that became harder to find. Both feelings matter, and the wording stays gentle.'
    }
  ];
})();
