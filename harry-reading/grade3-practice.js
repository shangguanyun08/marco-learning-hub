(() => {
  'use strict';
  const pdfRoot='https://readtheory.org/wp-content/uploads/2020/04/';
  function article(id,title,referenceTitle,referenceLexile,pdfName,paragraphs,questions){
    return {id,title,kind:'parallel',grade:3,lexile:null,referenceTitle,referenceLexile,referenceUrl:pdfRoot+pdfName,paragraphs,
      questions:questions.map((q,i)=>({id:`${id}-${i+1}`,number:i+1,prompt:q[0],choices:q[1],answer:q[2],evidence:q[3],explanation:q[4],hint:q[5]||'Find the words that show why this answer fits.'}))};
  }
  const added=[
    article('practice-tents','Tents for the Class Trip','Car For Sale!',460,'3rd-Grade-Car-For-Sale-All.pdf',[
      'A class is choosing a tent for a camping trip. The outdoor store has three tents. Each tent has a label with its size and price.',
      'The Meadow tent has room for four campers. It costs $72 and weighs nine pounds. Two wide doors make it easy to climb in and out.',
      'The Forest tent has room for six campers. It costs $110 and weighs fifteen pounds. A tall person can stand up inside it.',
      'The Trail tent has room for two campers. It costs $45 and weighs five pounds. It folds into a compact bag that fits inside a small backpack.'
    ],[
      ['Which tent has enough room for six campers?',['the Meadow tent','the Forest tent','the Trail tent','None of the tents has enough room.'],1,[['room for six campers']],'The Forest tent holds six campers. The other tents hold four and two.'],
      ['Which tent is the least expensive?',['the Forest tent','the Meadow tent','the Trail tent','All three cost the same amount.'],2,[['It costs $72'],['It costs $110'],['It costs $45']],'Compare all three prices. $45 is less than $72 and $110, so the Trail tent costs the least.','Highlight the three prices so you can compare them.'],
      ['Kai has $80 and needs a tent for four campers. Which tent meets BOTH needs?',['the Meadow tent','the Forest tent','the Trail tent','None of the tents meets both needs.'],0,[['The Meadow tent has room for four campers.'],['It costs $72']],'The Meadow tent holds four campers and costs $72, which is within Kai’s $80 budget. The Forest tent costs too much, and the Trail tent is too small.','Find both the number of campers and the price.'],
      ['In the last paragraph, compact most nearly means',['brightly colored','hard to carry','very expensive','small and easy to fit into a space'],3,[['fits inside a small backpack']],'The bag fits inside a small backpack. That detail shows that compact means small and easy to fit into a space.','Highlight the clue about where the bag fits.']
    ]),
    article('practice-garden-letter','A Letter about the Garden','Dear Emily',470,'3rd-Grade-Dear-Emily-All.pdf',[
      'Dear Leo,',
      'I visited the Maple Street community garden today. Twenty families grow vegetables there. Each family cares for its own patch of soil. Garden members can borrow rakes and watering cans from the tool shed.',
      'The shed is roomy. Our whole class stood inside during a rain shower, and there was still space for three shelves of tools.',
      'The sign-up desk has moved to the library. Last week’s storm damaged the roof of the garden office. The office must stay closed until the roof is repaired, so new members now sign up at the library.',
      'I wanted to share these details so you would know how the garden works.',
      'Your friend, Nora'
    ],[
      ['Why does Nora mainly write this letter?',['to ask Leo to fix a roof','to tell a funny story about a storm','to give Leo information about the garden','to explain how to grow every vegetable'],2,[['I wanted to share these details so you would know how the garden works.']],'Nora shares facts about garden members, tools, the shed, and the sign-up desk. Her stated purpose is to explain how the garden works.'],
      ['Where can garden members borrow watering cans?',['at the tool shed','at the library desk','at Nora’s school','at the garden office'],0,[['from the tool shed']],'The letter names the tool shed as the place where members borrow watering cans.'],
      ['The word roomy most nearly means',['full of rain','having plenty of space','difficult to enter','covered with plants'],1,[['Our whole class stood inside during a rain shower, and there was still space for three shelves of tools.']],'An entire class fits inside, with space left over. These clues show that roomy means having plenty of space.','Use the details about the class and the shelves.'],
      ['Why must new members sign up at the library?',['The library has more watering cans.','The garden has no members yet.','The shed is too small for a desk.','The garden office is closed because its roof is damaged.'],3,[['Last week’s storm damaged the roof of the garden office.'],['The office must stay closed until the roof is repaired, so new members now sign up at the library.']],'The damaged roof keeps the garden office closed. The sign-up desk is therefore at the library.','Highlight both the damage and the change it caused.']
    ]),
    article('practice-library-map','Finding Pinebridge Library','Where We Live',470,'3rd-Grade-Where-We-Live-All.pdf',[
      'Isla Chen’s class has drawn a map of a make-believe town called Pinebridge. Isla added a library to the map. Pinebridge Library is at 42 Cedar Road.',
      'The school is at 18 Oak Avenue. A short footpath joins Oak Avenue and Cedar Road. On the map, students can walk along this path from the school to the library.',
      'The class placed Pinebridge in Vermont. A nearby town on the map is called Mapleford. Vermont is a state in the United States. The United States is a country.',
      'Isla wrote a mailing label for the library: Pinebridge Library, 42 Cedar Road, Pinebridge, VT 05426. The letters VT stand for Vermont. The five numbers at the end are the zip code.'
    ],[
      ['On the class map, which road is the library on?',['Oak Avenue','Mapleford Road','Cedar Road','Vermont Street'],2,[['Cedar Road']],'The library’s address places it on Cedar Road.'],
      ['What is the library’s street number?',['18','42','54','26'],1,[['42 Cedar Road']],'The number before Cedar Road is 42.'],
      ['Why can students walk from the school to the library on this map?',['Both buildings are on Oak Avenue.','The library is inside the school.','Vermont has only one road.','A short footpath connects the two roads.'],3,[['A short footpath joins Oak Avenue and Cedar Road.']],'The footpath joins the school’s road to the library’s road. It gives students a walking route.','Highlight the connection between the two roads.'],
      ['Which pair names the two TOWNS on the class map?',['Pinebridge and Mapleford','Vermont and Pinebridge','Mapleford and the United States','Vermont and the United States'],0,[['make-believe town called Pinebridge'],['A nearby town on the map is called Mapleford.']],'Pinebridge and Mapleford are both called towns. Vermont is a state, and the United States is a country.'],
      ['According to the passage, which statement is correct?',['Vermont is a country.','Cedar Road is a state.','Vermont is a state in the United States.','The United States is a town in Vermont.'],2,[['Vermont is a state in the United States.']],'The passage places the state of Vermont inside the country called the United States.'],
      ['Which address matches Isla’s mailing label?',['Pinebridge Library, 18 Oak Avenue, Mapleford, VT 05426','Pinebridge Library, 42 Cedar Road, Pinebridge, VT 05426','Pinebridge Library, 42 Oak Avenue, Pinebridge, VT 05462','Pinebridge Library, 18 Cedar Road, Mapleford, VT 05462'],1,[['Pinebridge Library, 42 Cedar Road, Pinebridge, VT 05426']],'Only this choice matches the library name, street number, street, town, state letters, and zip code on the label.','Check every part of the mailing label.']
    ]),
    article('practice-footbridge','The Closed Footbridge','A Problem at the Fire Station',480,'3rd-Grade-A-Problem-At-The-Fire-Station-All.pdf',[
      'Five neighbors meet beside the Riverton footbridge on Saturday. They want to help repair it. They are volunteers, so no one pays them for their work.',
      'During Friday’s storm, a heavy branch fell onto the wooden bridge. The branch broke two boards. The town closed the bridge because the broken boards made it unsafe to cross.',
      'Until the bridge is fixed, walkers must use the hill road. That route takes longer. The neighbors have tools, but they still need money for new boards.',
      'The children hold a small plant sale. By afternoon, they have raised enough money for the boards. The neighbors smile. They expect the bridge to open again soon.'
    ],[
      ['How many neighbors meet to help with the bridge?',['two','three','four','five'],3,[['Five neighbors']],'The first sentence says that five neighbors meet.'],
      ['What does volunteers mean in this passage?',['people who do work without being paid','people who sell every tool they own','people who must use the hill road','people who work only during storms'],0,[['They are volunteers, so no one pays them for their work.']],'The passage explains that the volunteers receive no pay for their work.'],
      ['What directly broke the bridge’s boards?',['a group of walkers','a heavy branch that fell','a neighbor’s tool','a truck on the hill road'],1,[['The branch broke two boards.']],'A fallen branch broke the boards. The storm happened first, but the branch directly caused the damage.'],
      ['How do the neighbors most likely feel at the END?',['confused about where the bridge is','angry that the plant sale failed','hopeful that the bridge will reopen','worried that no one has tools'],2,[['They expect the bridge to open again soon.','they have raised enough money for the boards']],'The sale brings in enough money, and the neighbors expect the bridge to reopen. These details support a hopeful feeling.','Use the final paragraph, after the sale.']
    ]),
    article('practice-game-rule','One Game at a Time','The New Law',500,'3rd-Grade-The-New-Law-All.pdf',[
      'The school library has a new rule. Each group may borrow only one board game at a time. Mina and Ravi discuss the rule during lunch.',
      'Mina: I think the rule is fair. Yesterday one group took four games, and the other groups had nothing to play.',
      'Ravi: I do not like the limit. My friends meet in Room 6 after lunch. Some want a word game, while others want a number game. I would like to borrow both.',
      'Mina: But if every group takes several games, there may not be enough. One game for each group gives everyone a turn.',
      'Ravi: We could split our meeting into two parts. We could play the word game first and exchange it for the number game later.',
      'Mina: That would follow the rule. You could use both games during the meeting without keeping both at once.',
      'Ravi: I still prefer choosing freely, but your idea helps me see why the limit can be useful.'
    ],[
      ['What is the MAIN issue Mina and Ravi discuss?',['whether Room 6 needs new chairs','whether each group should borrow only one game at a time','whether lunch should last longer','whether word games are easier than number games'],1,[['Each group may borrow only one board game at a time.']],'Their discussion centers on the library’s one-game rule and how it affects different groups.'],
      ['Why does Mina support the new rule?',['She dislikes all number games.','She wants to keep four games herself.','She wants every group to have a chance to play.','She wants the library to stop lending games.'],2,[['One game for each group gives everyone a turn.']],'Mina supports the rule because sharing the games gives each group a turn.'],
      ['Where do Ravi’s friends meet after lunch?',['in Room 6','beside the number-game shelf','in the school garden','at Mina’s house'],0,[['My friends meet in Room 6 after lunch.']],'Ravi directly states that his friends meet in Room 6.'],
      ['Which plan would let Ravi’s group use two games WITHOUT breaking the rule?',['Hide a second game under a coat.','Keep both games for the entire meeting.','Ask another group to go home.','Return the first game before borrowing the second.'],3,[['play the word game first and exchange it for the number game later']],'Exchanging the first game for the second means the group has only one borrowed game at a time.'],
      ['In Mina’s first comment, fair most nearly means',['very quiet','reasonable and giving people equal chances','difficult to understand','moving very quickly'],1,[['everyone a turn']],'Mina calls the rule fair because it prevents one group from taking everything and gives others a chance.','Look for how the rule affects all the groups.']
    ]),
    article('practice-book-lamp','Three Reviews of a Book Lamp','Sky Boots',500,'3rd-Grade-Sky-Boots-All.pdf',[
      'Three readers tried the Glow Clip book lamp. The lamp clips onto a bed or a desk and shines a small light onto a book.',
      'Ana: Mine cost $18. I wish I had chosen a different lamp. Its clip slips off my thick bedpost, and the battery needs charging after only an hour. Reading is difficult when the light keeps falling.',
      'Omar: I have used my lamp every evening for six weeks. It turns on whenever I press the switch and never flickers while I read. That makes it reliable. I am pleased with it.',
      'Lina: I share a bedroom with my sister. The lamp’s bendable neck lets me aim the light at my pages instead of at her bed. She can sleep while I finish a chapter. Being able to aim the light is the feature I like most.'
    ],[
      ['Which reader gives a mostly negative review?',['Omar','Lina','all three readers','Ana'],3,[['I wish I had chosen a different lamp.']],'Ana wishes she had bought a different lamp and describes problems with its clip and battery.'],
      ['What are Ana’s TWO complaints?',['The clip slips, and the battery needs frequent charging.','The lamp is red, and the switch is too large.','The lamp flickers, and its neck cannot bend.','The book is too heavy, and the room is too dark.'],0,[['Its clip slips off my thick bedpost'],['the battery needs charging after only an hour']],'Ana mentions the slipping clip and the short time before the battery needs charging. Both details are needed.','Highlight both of Ana’s complaints.'],
      ['How much did Ana pay for her lamp?',['$8','$16','$18','$80'],2,[['$18']],'Ana says that her lamp cost $18.'],
      ['As Omar uses it, reliable most nearly means',['easy to lose','able to be depended on','painted in bright colors','made only for one person'],1,[['It turns on whenever I press the switch and never flickers while I read.']],'The lamp works consistently when Omar needs it. That makes it something he can depend on.','Highlight how the lamp behaves each time Omar uses it.'],
      ['Which TWO readers are pleased with the lamp?',['Ana and Omar','Ana and Lina','Ana and the author','Omar and Lina'],3,[['I am pleased with it.'],['Being able to aim the light is the feature I like most.']],'Omar explicitly says he is pleased. Lina names a feature she likes and explains how it helps her. Ana’s review is negative.','Find a positive statement from each of the two readers.'],
      ['Why is the bendable neck most useful to Lina?',['It lets her light her book without lighting her sister’s bed.','It charges the battery while she sleeps.','It keeps every book from falling.','It makes the entire bedroom brighter.'],0,[['aim the light at my pages instead of at her bed','She can sleep while I finish a chapter.']],'Lina can point the light at her own book while her sister sleeps.']
    ]),
    article('practice-ranger','A Ranger Plans Ahead','Thinking First',540,'3rd-Grade-Thinking-First-All.pdf',[
      'A school reporter visits park ranger Maya Ortiz to learn about her work. Maya has worked at Birch Park for three years.',
      'Reporter: What did you learn before you led your first group of visitors?',
      'Maya: First I took a course in reading maps. Next I walked the trails with an experienced ranger. After that, I practiced planning short walks for families.',
      'Reporter: What do you pay attention to on a walk?',
      'Maya: I stay watchful. I look carefully for loose branches, muddy slopes, and signs that a trail needs repair. I notice small problems before they grow into larger ones.',
      'Reporter: Why did you close the creek path yesterday?',
      'Maya: Heavy rain had washed soil away from the edge. The narrow path could not safely hold a group, so I chose the wider hill trail instead.',
      'Reporter: Is there one part of your work that you enjoy most?',
      'Maya: I love seeing a family notice something new in nature. Yesterday a child spotted her first woodpecker. Watching her point it out to her grandfather made my day.'
    ],[
      ['What is this passage mostly about?',['how every bird builds a nest','why all park paths are muddy','a park ranger’s training and daily work','a reporter’s favorite camping trip'],2,[['First I took a course in reading maps.'],['I stay watchful.']],'The interview covers Maya’s preparation, her decisions on trails, and what she enjoys about being a ranger. It is broader than one bird or one path.','Choose evidence from the training and daily-work parts of the interview.'],
      ['What did Maya do FIRST in her training?',['plan a family walk','take a course in reading maps','close the creek path','walk every trail by herself'],1,[['First I took a course in reading maps.']],'Maya identifies the map-reading course as her first training step.'],
      ['In Maya’s answer, watchful most nearly means',['looking carefully and noticing things','walking as fast as possible','wanting to take a nap','waiting without paying attention'],0,[['I look carefully for loose branches, muddy slopes, and signs that a trail needs repair.']],'Maya explains watchful by describing how carefully she looks for possible problems.'],
      ['Why did Maya choose a different trail yesterday?',['The family wanted to see a shop.','She had forgotten how to read a map.','The creek path was too crowded with reporters.','Rain had damaged the edge of the creek path.'],3,[['Heavy rain had washed soil away from the edge.']],'Rain had weakened the path’s edge, so Maya chose a safer route.','Find what happened to the creek path.'],
      ['What does Maya enjoy MOST about her work?',['closing paths after storms','seeing families discover something new in nature','taking the same map course again','carrying loose branches'],1,[['I love seeing a family notice something new in nature.']],'Maya directly says that she loves seeing a family make a new discovery.']
    ]),
    article('practice-midnight-museum','The Museum after Midnight','Tornado!',560,'3rd-Grade-Tornado-All.pdf',[
      'Ben writes a review of a movie his class watched. Most of his review retells what happens inside a museum after it closes.',
      'In the movie, a guard named Jules winds an old clock. At midnight, painted animals step out of their pictures. A fox races through a hallway. An owl flies above the stairs. A bear shakes a display of bells. The museum had been silent, but now it is filled with ringing and animal calls.',
      'Jules finds a note beside the clock. It says the animals must return to their pictures before sunrise. He needs to restore the museum by putting everything back where it belongs.',
      'Jules does not chase the animals. Instead, he plays a tune on the clock’s tiny piano. The animals follow the music into their pictures. Just before sunrise, the museum is quiet again.',
      'Ben likes the surprising story, especially the owl soaring above the stairs. He knows that real painted animals cannot step off a canvas. The movie gives them a magical ability that real pictures do not have.'
    ],[
      ['What does this passage mainly do?',['give directions for repairing a clock','retell the events of a fantasy movie','explain how to care for real bears','list the opening hours of a museum'],1,[['Most of his review retells what happens inside a museum after it closes.']],'The passage mainly retells the movie’s events. Its details follow the animals, the guard, and the way the problem is solved.'],
      ['Which event does NOT happen in the movie?',['An owl flies above the stairs.','A bear shakes a display of bells.','A fox races through a hallway.','A wolf digs a tunnel under the museum.'],3,[['A fox races through a hallway.'],['An owl flies above the stairs.'],['A bear shakes a display of bells.']],'The passage lists a fox, an owl, and a bear doing these actions. It never describes a wolf digging a tunnel.','Highlight the three animal actions that are actually described.'],
      ['In paragraph 3, restore the museum means',['put the museum back in its proper condition','paint every wall a new color','close the museum forever','move the building to another town'],0,[['putting everything back where it belongs']],'The passage explains restore with the clue about putting everything back where it belongs.'],
      ['Which type of movie is Ben reviewing?',['a news report','a cooking lesson','a fantasy','a travel guide'],2,[['The movie gives them a magical ability that real pictures do not have.','At midnight, painted animals step out of their pictures.']],'The movie is a fantasy: painted animals gain a magical ability.','Highlight a detail that belongs to a magical story.'],
      ['Which word is OPPOSITE in meaning to silent?',['empty','noisy','dark','old'],1,[['The museum had been silent, but now it is filled with ringing and animal calls.']],'The contrast between silence and ringing bells and animal calls shows that noisy is the opposite of silent.'],
      ['Which movie detail could NOT happen as described in an ordinary real museum?',['A guard works after the museum closes.','An old clock stands in a museum.','A note is left beside a clock.','A painted owl leaves its picture and flies around.'],3,[['He knows that real painted animals cannot step off a canvas.']],'The passage explicitly says real painted animals cannot leave a canvas. The owl’s flight is part of the movie’s magic.']
    ]),
    article('practice-canoe','The First Canoe Lesson','Roller Coaster',570,'3rd-Grade-Roller-Coaster-All.pdf',[
      'The pond is calm. Its smooth surface reflects the trees without a ripple. Nina and Max stand beside a canoe while their instructor, Jo, checks their life jackets.',
      'Nina hesitates. She starts toward the boat, then pauses and steps back. “Maybe we could watch birds from the bank,” she says. “Or draw the trees instead.” Max is eager to paddle, but he says, “Let’s ask Jo to help us get started.”',
      'Jo holds the canoe steady as they climb in. She shows them where to sit and how to move their paddles. They stay close to the bank while they practice. Nina stops gripping the seat so tightly. Soon she is smiling at the trail of ripples behind her paddle.',
      'Max discovers that steering takes practice. His side of the boat keeps turning toward the bank. “I thought I could do this right away,” he admits. “Could you show me that turning stroke again, Jo?”',
      'At the end of the lesson, Nina says, “I was worried at first, but now I’m proud that I tried.” Max thanks Jo for explaining the turning stroke twice. Both children ask when they can have another lesson.'
    ],[
      ['Which word best describes the pond at the beginning?',['rough','frozen','calm','crowded'],2,[['Its smooth surface reflects the trees without a ripple.']],'The smooth water has no ripples. That description supports calm.'],
      ['Which TWO activities does Nina suggest instead of canoeing?',['watching birds and drawing trees','swimming and fishing','drawing trees and riding a bike','watching birds and climbing a tree'],0,[['watch birds from the bank'],['draw the trees instead']],'Nina suggests watching birds and drawing the trees before she agrees to begin the lesson.','Highlight both of Nina’s suggestions.'],
      ['As used in paragraph 2, hesitates most nearly means',['shouts with excitement','pauses because she is unsure','moves without thinking','falls asleep suddenly'],1,[['She starts toward the boat, then pauses and steps back.']],'Nina begins to move, pauses, and steps back. These actions show uncertainty.'],
      ['How do Nina’s feelings change?',['from proud to bored','from happy to angry','from calm to worried','from worried to proud'],3,[['I was worried at first, but now I’m proud that I tried.']],'Nina states the change directly: she was worried at first and feels proud after trying.'],
      ['Why does Max ask Jo to show the turning stroke again?',['He wants Jo to cancel the next lesson.','He dislikes the quiet pond.','He realizes that steering is harder than he expected.','He has already mastered every stroke.'],2,[['His side of the boat keeps turning toward the bank.','I thought I could do this right away']],'Max’s difficulty steering changes his expectation that he could do it immediately. He asks for more help.','Find what goes wrong or what Max admits.'],
      ['Which lesson is best supported by BOTH children’s experiences?',['Asking for help can make a new activity easier.','People should know every skill before taking a lesson.','A calm pond makes every task simple.','A good friend never needs an instructor.'],0,[['Jo holds the canoe steady as they climb in.'],['Max thanks Jo for explaining the turning stroke twice.']],'Jo helps Nina begin and helps Max learn a difficult stroke. Both children benefit from instruction.','Highlight help given to Nina and help given to Max.']
    ]),
    article('practice-bakery','Keeping the Bakery Moving','Calm on the Job',580,'3rd-Grade-Calm-on-Job-All.pdf',[
      'For the school newspaper, Eli interviews Dalia, who helps run a neighborhood bakery. Dalia has worked there for four years. Eli wants readers to understand what her job is like.',
      'Eli: Who taught you when you started?',
      'Dalia: My uncle Tomas trained me. Before I served customers, he showed me how to read order cards and arrange the cooling racks. Then I practiced with him beside me.',
      'Eli: What happens on a busy morning?',
      'Dalia: It can become hectic. Three customers may be waiting while the phone rings and a delivery arrives. Several things need attention at the same time. I take a breath and finish one job before starting the next.',
      'Eli: How do you keep track of different orders?',
      'Dalia: We use colored order cards. Yellow cards are for people waiting in the shop. Blue cards are for orders that customers will collect later. The colors help us sort the orders without mixing them up.',
      'Eli: What keeps you calm when the shop gets crowded?',
      'Dalia: I make a short list and work through it in order. Tomas taught me that trying to do everything at once usually creates more mistakes.',
      'Eli: Which part of the job do you enjoy most?',
      'Dalia: I like seeing families choose bread to share at home. Yesterday a child picked a loaf for her grandmother. Those little moments make the work feel worthwhile.'
    ],[
      ['What is the passage mainly about?',['the exact recipe for a loaf of bread','why every customer visits the same shop','how to paint cooling racks','Dalia’s work at a bakery'],3,[['Eli interviews Dalia, who helps run a neighborhood bakery.','Eli wants readers to understand what her job is like.']],'The interview describes Dalia’s training, busy mornings, tools for organizing orders, and favorite part of her work.'],
      ['Who trained Dalia when she began?',['Eli','her uncle Tomas','her grandmother','a newspaper editor'],1,[['My uncle Tomas trained me.']],'Dalia identifies her uncle Tomas as the person who trained her.'],
      ['In Dalia’s description, hectic most nearly means',['very busy with many things happening at once','completely silent and empty','too cold for anyone to work','slow and easy to predict'],0,[['Several things need attention at the same time.']],'Several tasks compete for attention at once. That explains what Dalia means by hectic.'],
      ['What does a BLUE order card mean?',['The bread must be thrown away.','The customer is waiting in the shop.','The customer will collect the order later.','The order has no customer name.'],2,[['Blue cards are for orders that customers will collect later.']],'Blue cards mark orders for later collection. Yellow cards are for customers currently waiting in the shop.'],
      ['How does Dalia stay calm when the shop gets crowded?',['She ignores every order card.','She makes a short list and follows its order.','She tries to finish all jobs at exactly the same time.','She asks all customers to leave.'],1,[['I make a short list and work through it in order.']],'Dalia says that a short, ordered list helps her handle a crowded shop.'],
      ['Which part of her job does Dalia like MOST?',['answering a ringing phone','sorting blue cards','moving empty cooling racks','seeing families choose bread to share'],3,[['I like seeing families choose bread to share at home.']],'Dalia’s answer to Eli’s final question identifies the part she enjoys most.']
    ])
  ];
  window.READING_ARTICLES.push(...added);
})();
