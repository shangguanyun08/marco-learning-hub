window.READING_ARTICLES = [
  {
    id: 'carla', title: 'Carla the Cat', sourceQuiz: 30, sourceDate: '2026-10-21', grade: 3, lexile: 500,
    paragraphs: [
      "Carla is a cat. She is like most other cats. And like most other cats, Carla likes to play with string, lay out in the sun, and lick her paws.",
      "Carla likes to do all of these things. But this not what she likes to do best. That's because Carla is a hunter. She likes hunting more than anything else. For Carla, hunting is a job.",
      "What does Carla hunt? She hunts mice. She hunts moles. She hunts squirrels. And she hunts birds.",
      "Why does Carla hunt? She has to protect her territory. Mice scamper over the porch. Moles dig in the yard. Squirrels run down the driveway. Birds chirp in the rose bushes. These animals think they run the place. But not when Carla's around!",
      "Hunting is a lot of work. But Carla does not think it is work. She's always up for the job. That's because she loves it. And for Carla, it's good to love your job!"
    ],
    questions: [
      {id:'carla-4', number:4, prompt:'According to the passage, what do the squirrels do?', choices:['scamper over the porch','dig in the yard','run down the driveway','chirp in the rose bushes'], answer:2,
        evidence:[['Squirrels run down the driveway.']], explanation:'The passage says that squirrels run down the driveway. The other actions belong to mice, moles, and birds.', hint:'Find the sentence about squirrels, and check which action belongs to them.'},
      {id:'carla-5', number:5, prompt:'What does Carla probably do most of the time?', choices:['play','hunt','lay out','lick'], answer:1,
        evidence:[['She likes hunting more than anything else.','hunting is a job']], explanation:'Hunt is the best inference. Carla likes hunting more than anything else, and the author calls it her job. She likes playing, too, but the passage emphasizes hunting.', hint:'Look for what Carla likes most, rather than something she simply enjoys.'}
    ]
  },
  {
    id:'fruits', title:'Fruits and Vegetables', sourceQuiz:29, sourceDate:'2026-10-21', grade:3, lexile:480,
    sectionTitles:{0:'Passage 1 · Fruits',6:'Passage 2 · Vegetables'},
    paragraphs:[
      'All fruits have seeds in them.',
      'Some fruits have seeds in the middle. Apples have small seeds in the middle of the fruit. Peaches have one big seed in the middle. (That seed is called a pit.)',
      'Some fruits are full of many seeds. Watermelons have lots of seeds in them.',
      'Some fruits have very small seeds. Bananas have very small seeds. You have to look very hard to find the small, brown seeds inside a banana.',
      'Some fruits have seeds on the outside. Strawberries have crunchy yellow seeds on the outside.',
      'All fruits have seeds.',
      'Vegetables do not have seeds.',
      'Carrots are vegetables. Carrots are the roots of a plant. There are no seeds inside carrots.',
      'Celery is a vegetable. Celery is the stem of a plant. There are no seeds inside celery.',
      'Lettuce is a vegetable. Lettuce is the leaves of a plant. There are no seeds inside lettuce.',
      'What is a pepper? A pepper is crunchy like a carrot. It is green like celery and lettuce. Many people think that peppers are vegetables. But peppers have seeds. Peppers are fruits.',
      'If it has seeds inside of it, it is a fruit!'
    ],
    questions:[
      {id:'fruits-1',number:1,prompt:'According to the passage, which of the following has small, brown seeds?',choices:['peaches','bananas','carrots','strawberries'],answer:1,
        evidence:[['small, brown seeds inside a banana']],explanation:'The passage describes small, brown seeds inside a banana. Strawberries have crunchy yellow seeds on the outside.',hint:'Match all the details: small, brown, and inside.'},
      {id:'fruits-2',number:2,prompt:'A pomelo is a fruit. This passage does not mention pomelos. But using the information you read in the passage, it can be concluded that a pomelo',choices:['is sweet','is small','has seeds','has roots'],answer:2,
        evidence:[['All fruits have seeds in them.','All fruits have seeds.']],explanation:'The passage states that all fruits have seeds. Since a pomelo is a fruit, that rule applies to it. The passage does not tell us its size or taste.',hint:'Find the rule that applies to every fruit.'},
      {id:'fruits-3',number:3,prompt:'According to the passage, what is the seed in a peach called?',choices:['a pug','a pig','a pit','a pinch'],answer:2,
        evidence:[['That seed is called a pit.']],explanation:'After describing the big seed in a peach, the author calls that seed a pit.',hint:'Read the sentence in parentheses after the peach sentence.'},
      {id:'fruits-4',number:4,prompt:'Which of the following choices best summarizes the information in passage 1 and passage 2?',choices:['Fruits are colorful. Vegetables are not.','Fruits have stems. Vegetables do not.','Fruits are bright. Vegetables are not.','Fruits have seeds. Vegetables do not.'],answer:3,
        evidence:[['All fruits have seeds in them.','All fruits have seeds.'],['Vegetables do not have seeds.']],explanation:'According to these passages, fruits have seeds and vegetables do not. A summary of both passages needs evidence for both parts. Use the passages’ definitions for this question.',hint:'Highlight one main-idea sentence from each passage.'}
    ]
  },
  {
    id:'trip',title:'Leo and Jasmine Plan a Trip',sourceQuiz:28,sourceDate:'2026-10-21',grade:4,lexile:640,
    paragraphs:[
      '“I am glad that we both have some time off from work next month,” Jasmine said. “We should go on a trip.”',
      '“Good idea,” said Leo. “Where should we go?”',
      '“I think we should go to New York City,” Jasmine said. “It would be very fun. There are so many things to see and do there. We could see a play, visit a museum, go shopping, or see the Empire State Building. There are also lots of great places to eat. We might even meet a famous movie star!”',
      '“That does sound fun,” Leo said, “but it is very crowded. There are way too many people. It is also very expensive there. Everything costs a lot of money. I don’t know if we can afford it.”',
      '“Well, where would you like to go?” Jasmine asked.',
      '“We should go camping,” Leo said. “It would be very quiet and peaceful. We could take long walks in woods and then sleep under the stars. We could cook hot dogs over an open fire. We could go swimming in the lake.”',
      '“That does sound peaceful,” Jasmine said, “but I don’t really like sleeping outside. There are too many bugs. I hate bug bites. Plus, there are a lot of bears in the woods. I would not want to get eaten by a bear.”',
      '“Well, what should we do?” Leo asked. “It is hard to agree on a trip.”',
      '“We could flip a coin. If it is heads, we will go to New York City. If it is tails, we will go camping.”',
      '“That sounds fair,” Leo said. He found a coin and threw it high in the air. The coin flipped end over end and then landed behind the couch.',
      '“Oh no,” Jasmine said.',
      'Leo and Jasmine both got down on the floor. They looked under the couch for the coin.',
      '“Hey, look what I found!” Jasmine said. She pulled something out from under the couch. “It’s a photo from the trip we took last year when we went to the beach.” She gave the photo to Leo.',
      'Leo looked at the photo. “That was a great trip,” he said. “We had a good time at the beach.”',
      '“It was fun,” Jasmine said. “It was not too crowded and it did not cost too much money.”',
      '“It was quiet and peaceful,” Leo said. “There were not too many bugs and there were no bears.”',
      'Leo and Jasmine smiled at each other. “Let’s go back to the beach!”'
    ],
    questions:[
      {id:'trip-1',number:1,prompt:'According to the passage, what is something you can do in New York City?',choices:['visit a museum','ride in a taxi cab','walk in the woods','see the Statue of Liberty'],answer:0,
        evidence:[['visit a museum']],explanation:'Jasmine explicitly mentions visiting a museum. A choice can be true in real life and still be unsupported by this passage: it never mentions the Statue of Liberty or taxi cabs.',hint:'Find what Jasmine actually names, rather than what you already know about New York.'},
      {id:'trip-3',number:3,prompt:'Each of the following are things Leo says they can do while they are camping EXCEPT',choices:['swim in the lake','cook hot dogs','see a bear','sleep under the stars'],answer:2,
        evidence:[['sleep under the stars'],['cook hot dogs'],['go swimming in the lake']],explanation:'EXCEPT asks for the item missing from Leo’s list. He names sleeping under the stars, cooking hot dogs, and swimming. Jasmine talks about bears; Leo does not list seeing a bear as an activity.',hint:'Highlight all three activities Leo lists. Check which answer is missing from that list.'},
      {id:'trip-5',number:5,prompt:'Based on the information in the passage, we can understand that Leo and Jasmine',choices:['cannot agree on anything','are afraid of bears','do not like to spend too much money','have been to the beach before'],answer:3,
        evidence:[['It’s a photo from the trip we took last year when we went to the beach.']],explanation:'Jasmine says the photo is from their beach trip last year. That supports a conclusion about both people. Only Jasmine talks about fearing bears; the passage does not say that both do.',hint:'Find a sentence that tells you something about both Leo and Jasmine.'},
      {id:'trip-6',number:6,prompt:'In the passage, Leo and Jasmine talk about',choices:['New York City first, then the beach, then camping','camping first, then New York City, then the beach','the beach first, then New York City, then camping','New York City first, then camping, then the beach'],answer:3,
        evidence:[['I think we should go to New York City.','I think we should go to New York City'],['We should go camping.','We should go camping'],['Let’s go back to the beach!']],explanation:'Jasmine first proposes New York City. Leo next proposes camping. At the end, they agree to go back to the beach. The order is New York City → camping → the beach.',hint:'Highlight the first suggestion, the next suggestion, and their final decision.'}
    ]
  }
];
