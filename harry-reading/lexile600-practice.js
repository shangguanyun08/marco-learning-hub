(() => {
  'use strict';
  // Fresh IDs keep saved answers and text highlights attached to the exact
  // passages Harry saw. Superseded editions remain available in history.
  const replaced = new Set([
    'practice-garden-labels', 'practice-sound-effects', 'practice-party-dishes',
    'practice-hall-curtains', 'practice-training-field'
  ]);
  for (const a of window.READING_ARTICLES) {
    if (replaced.has(a.id)) {
      a.retired = true;
      a.retiredReason = 'Replaced by an original passage targeting 600L; saved history only.';
    }
  }
  // These are writing targets, not measured Lexile scores. Keep sessions 1–14
  // in their existing order, followed by the six requested 600L sessions.
  function article(slug, title, order, paragraphs, questions) {
    const id = `practice-600-${slug}`;
    return {
      id, title, kind: 'parallel', lexile: null, targetLexile: 600,
      practiceOrder: 630 + order, paragraphs,
      questions: questions.map((q, i) => ({
        id: `${id}-${i + 1}`, number: i + 1,
        prompt: q[0], choices: q[1], answer: q[2], evidence: q[3],
        explanation: q[4], hint: q[5] || 'Look for a sentence that helps answer the question.'
      }))
    };
  }
  window.READING_ARTICLES.push(
    article('garden-labels', 'The Missing Garden Labels', 0, [
      'Nina and Ben grew beans and peas in two rows. They put a paper sign at the end of each row. One sign said BEANS. The other said PEAS. On Friday, rain washed the words off both signs. By Monday, the plants looked much alike.',
      'Ben wanted to guess which row held the beans. Nina was not sure. She went inside to find their garden notebook. When they planted the seeds, she had drawn a simple map. The map showed beans beside the fence and peas beside the path.',
      'They checked the garden against the map. Now they could make new signs. This time, they wrote on flat stones with a paint pen. Their teacher said the painted words would last longer in the rain. Ben placed each stone at the end of the correct row.',
      'Nina added the date to the notebook. Ben drew the two new signs on the map. He had thought the notebook was just extra work. Now he was glad they had kept a record. Next time, he would help write down what they planted.'
    ], [
      ['Why could the children no longer read the paper signs?', ['Rain washed the words off.', 'Ben took the signs home.', 'The plants covered the words.', 'Nina used the wrong pen color.'], 0, [['rain washed the words off both signs']], 'The rain washed away the words. The children could no longer tell the rows apart by reading the signs.'],
      ['Which detail helped Nina find the bean row?', ['The peas had taller stems.', 'The old sign was still clear.', 'The map showed beans beside the fence.', 'Ben remembered where every seed went.'], 2, [['The map showed beans beside the fence and peas beside the path.']], 'The map recorded where the beans had been planted. Nina used that record instead of guessing.'],
      ['What does record mean in the last paragraph?', ['a prize for growing the most beans', 'information saved to use later', 'a new kind of garden seed', 'a place to keep paint pens'], 1, [['When they planted the seeds, she had drawn a simple map.']], 'The notebook kept information about the garden. That saved information helped the children later.'],
      ['Why did they use painted stones for the new signs?', ['Stones would help the plants grow faster.', 'The teacher had lost all the paper.', 'They wanted to hide the names of the plants.', 'The words would last longer in the rain.'], 3, [['Their teacher said the painted words would last longer in the rain.']], 'They chose painted stones because the new labels would hold up better in rain than the paper signs.'],
      ['How did Ben change by the end of the story?', ['He wanted to guess where all the seeds were.', 'He understood why keeping notes was useful.', 'He decided to stop helping in the garden.', 'He thought every sign should be made of paper.'], 1, [['He had thought the notebook was just extra work.'], ['Next time, he would help write down what they planted.']], 'At first, Ben thought notes were extra work. After the map helped them, he wanted to help keep notes.']
    ]),
    article('sound-effects', 'Building Sounds for a Show', 1, [
      'Owen helped with a class play about a rainy night. His job was to make sounds from behind a screen. The class needed the sound of rain and the sound of footsteps. Owen could use things from home, but he could not buy anything new.',
      'First, he shook dry rice inside a box with a lid. It made a soft tapping sound like rain. Then he shook a box of blocks. The blocks made a loud crash. Owen chose the rice because the scene needed gentle rain, not a storm.',
      'For footsteps, Owen tapped two shoes on a wooden board. He made the steps slow when the character was tired. He made them quick when the character ran to the door. He watched the actor so the sounds would match each move.',
      'During practice, one shoe slipped off the board. Owen stopped and marked two spots with tape. The marks showed him where to tap. At the show, he followed the marks and kept watching the actor. The footsteps came at the right times. Afterward, Owen smiled when a classmate said the rainy night had sounded real.'
    ], [
      ['What is this story mostly about?', ['An actor who forgets his lines', 'A class that gets caught in a storm', 'A boy who makes sounds for a play', 'A shop that sells new shoes'], 2, [['His job was to make sounds from behind a screen.']], 'The story follows Owen as he makes and improves the rain and footstep sounds for the play.'],
      ['Why did Owen choose rice instead of blocks?', ['Rice made the gentle sound he needed.', 'The blocks were too small to fit in a box.', 'He was allowed to buy only rice.', 'The play needed a loud crash.'], 0, [['Owen chose the rice because the scene needed gentle rain, not a storm.']], 'The rice made soft taps. That sound fit a scene with gentle rain better than the crashing blocks did.'],
      ['What does match mean in paragraph 3?', ['hide from the audience', 'be louder than something', 'start a small fire', 'fit or go along with something'], 3, [['He watched the actor so the sounds would match each move.']], 'Owen wanted the sounds to fit the actor’s moves. Fast moves needed quick footsteps, and slow moves needed slow ones.'],
      ['What did Owen do just AFTER a shoe slipped?', ['He bought a wider board.', 'He marked two spots with tape.', 'He changed the play to a sunny day.', 'He asked the actor to stop walking.'], 1, [['Owen stopped and marked two spots with tape.']], 'After the shoe slipped, Owen added tape marks to show where he should tap the shoes.'],
      ['Why was practicing before the show helpful?', ['It let Owen choose a different class play.', 'It meant Owen no longer had to watch the actor.', 'It helped Owen find and fix a problem.', 'It let Owen use real rain on the stage.'], 2, [['During practice, one shoe slipped off the board.'], ['The marks showed him where to tap.']], 'The slipping shoe showed Owen a problem. He used tape to fix it before the show began.']
    ]),
    article('party-dishes', 'Borrowing Party Dishes', 2, [
      'Maya was helping plan a picnic for her class. Twenty people would come, but the class had only twelve plates. Her teacher asked her to find a way for everyone to have a plate. Maya hoped they would not need to buy a whole new set.',
      'At the town hall, Maya saw a sign about a dish box. Groups could borrow the box for parties. It held plates, cups, and bowls that could be washed and used again. Borrowing it cost nothing. A group had to return every dish clean and dry.',
      'Maya called the hall with her teacher. The box was free on the picnic day. Maya borrowed eight plates, just enough to go with the twelve they already had. She counted the borrowed plates and wrote the number on a card inside the box.',
      'After the picnic, Maya and her friends washed and dried the dishes. They counted only seven borrowed plates. Maya checked the tables and found one under a napkin. She added it to the box. All eight were ready to return. The class had enough plates for the picnic without buying any new ones.'
    ], [
      ['What problem did Maya need to solve?', ['The town hall had no dishes.', 'The class did not have enough plates.', 'All twelve class plates were broken.', 'No one wanted to come to the picnic.'], 1, [['Twenty people would come, but the class had only twelve plates.']], 'Twenty people needed plates, but the class had only twelve. Maya needed to find more plates.'],
      ['What did the group have to do before returning the dishes?', ['Paint the name of the class on them', 'Pay for a new dish box', 'Give every guest a plate to keep', 'Make sure they were clean and dry'], 3, [['A group had to return every dish clean and dry.']], 'The dish box had a clear rule: borrowed dishes had to be returned clean and dry.'],
      ['What does free mean in “The box was free on the picnic day”?', ['It was available to borrow that day.', 'It had no dishes left inside.', 'It was outside without a lid.', 'It could be kept forever.'], 0, [['The box was free on the picnic day.'], ['Maya borrowed eight plates']], 'Here, free means available. No other group needed the box then, so Maya could borrow from it.'],
      ['Why was the number on Maya’s card useful?', ['It showed what food each person wanted.', 'It told her where to find a napkin.', 'It helped her know that one plate was missing.', 'It showed how much the new plates cost.'], 2, [['She counted the borrowed plates and wrote the number on a card inside the box.'], ['They counted only seven borrowed plates.']], 'The card recorded eight plates. When the children counted seven, they knew they needed to find one more.'],
      ['Which sentence best sums up the story?', ['Maya found a napkin under a picnic table.', 'Maya borrowed and returned dishes to solve a picnic problem.', 'The town hall had cups and bowls in a box.', 'Maya bought twenty new plates for her class.'], 1, [['Maya borrowed eight plates'], ['The class had enough plates for the picnic without buying any new ones.']], 'The main events are borrowing enough plates for the picnic and making sure all of them are returned.']
    ]),
    article('hall-curtains', 'Choosing Curtains for the Hall', 3, [
      'The school hall had a bright window beside the stage. During afternoon shows, sunlight made it hard to see pictures on a screen. The class wanted a curtain to block the light. They had enough money for either a thin yellow curtain or a thick blue one.',
      'Lena liked the yellow curtain because it looked cheerful. Sam liked blue, but their teacher asked them to test both. She hung a small piece of each cloth over the window. The class looked at the same picture on the screen each time.',
      'The yellow cloth let a lot of light through. The picture still looked pale. The blue cloth blocked more light, so the picture was easier to see. Lena moved closer to the screen to check the small words. She could read them clearly with the blue cloth in place.',
      'The class chose the blue curtain. Lena still liked yellow best, but she agreed with the choice. The curtain had a job to do. Its color was less important than how well it worked. For the next show, Lena made yellow paper stars to hang beside the stage. She found a way to use her favorite color too.'
    ], [
      ['Why did the class want a curtain?', ['To make the stage smaller', 'To hide the chairs in the hall', 'To keep actors from seeing the audience', 'To block light so screen pictures were easier to see'], 3, [['sunlight made it hard to see pictures on a screen']], 'Light from the window made the screen hard to see. The class needed a curtain that would block the light.'],
      ['How did the class compare the two cloths?', ['They washed each cloth twice.', 'They checked the same picture with each cloth over the window.', 'They asked only Lena which color she liked.', 'They hung both cloths in a dark room at night.'], 1, [['The class looked at the same picture on the screen each time.']], 'They used the same picture for both tests. That helped them see which cloth blocked light better.'],
      ['What does pale mean when the story describes the picture?', ['faint and hard to see', 'upside down', 'full of new details', 'too large for the screen'], 0, [['The yellow cloth let a lot of light through.'], ['The picture still looked pale.']], 'The light made the picture look faint. Pale here describes a picture with weak color that is hard to see.'],
      ['Why did Lena agree to choose blue?', ['Yellow had stopped being her favorite color.', 'Sam said that blue was the only color allowed.', 'She saw that the blue cloth worked better.', 'The class could not afford the yellow cloth.'], 2, [['She could read them clearly with the blue cloth in place.']], 'Lena could see that the blue cloth made the screen easier to read. She chose what worked best for the task.'],
      ['Which lesson best fits the story?', ['The cheapest choice always works best.', 'Testing choices can help people make a useful decision.', 'Everyone in a class must like the same color.', 'A bright room is the best place to show a movie.'], 1, [['The blue cloth blocked more light, so the picture was easier to see.'], ['The class chose the blue curtain.']], 'The class tested both choices and used what they learned. The test helped them pick a curtain that did its job.']
    ]),
    article('training-field', 'Juno at the Training Field', 4, [
      'Juno was a young dog who loved to run. At a training field, her owner, Max, was teaching her to come when called. The field had a fence and a gate. Max checked that the gate was shut before they began.',
      'Max first stood close to Juno. He called her name and said, “Come!” When she came to him, he praised her and gave her a small treat. They practiced this a few times. Then Max took two steps back and tried again.',
      'Soon, a dog began barking beyond the fence. Juno turned her head and forgot about Max. He did not shout or pull her. He waited for a quiet moment and moved closer. When he called again, Juno came. Max praised her for returning.',
      'After a short break, they practiced near the quiet end of the field. Juno came each time Max called. Max ended the lesson while she was still doing well. He knew she needed more practice before trying a noisier place. As they walked home, he felt pleased. Juno had made progress, even though she had not learned everything in one day.'
    ], [
      ['What was Max teaching Juno?', ['To jump over the field fence', 'To bark when she saw another dog', 'To come when he called her', 'To open the gate by herself'], 2, [['her owner, Max, was teaching her to come when called']], 'The first paragraph states the goal of the lesson: Juno was learning to come to Max when called.'],
      ['What caused Juno to stop paying attention to Max?', ['A dog barking beyond the fence', 'A treat that fell on the ground', 'Rain falling on the training field', 'Someone opening the gate'], 0, [['a dog began barking beyond the fence'], ['Juno turned her head and forgot about Max.']], 'The barking caught Juno’s attention. She turned toward the sound instead of focusing on Max.'],
      ['What did Max do when Juno turned away?', ['He ended all of her future lessons.', 'He called from farther across the field.', 'He took away the fence around the field.', 'He waited for quiet and moved closer.'], 3, [['He waited for a quiet moment and moved closer.']], 'Max made the task easier by waiting until it was quiet and moving closer before calling again.'],
      ['What does progress mean in the last sentence?', ['a long walk home', 'improvement in learning a skill', 'a loud sound from another dog', 'a complete end to all practice'], 1, [['Juno came each time Max called.'], ['she had not learned everything in one day']], 'Juno was getting better at coming when called. That improvement is progress, even though she still needed practice.'],
      ['Which detail best shows that Max was patient?', ['He owned a young dog.', 'He walked home after the lesson.', 'He gave Juno time and made the task easier.', 'He stood inside a field with a fence.'], 2, [['He did not shout or pull her.'], ['He waited for a quiet moment and moved closer.']], 'Max stayed calm when Juno lost focus. He waited and helped her try again instead of getting angry.']
    ]),
    article('book-cart', 'A Better Place for the Book Cart', 5, [
      'A small book cart stood outside Room Eight. Students could borrow a book during lunch and bring it back later. At first, few students stopped. The cart stood behind a tall plant, where it was easy to miss.',
      'Amir wanted more people to use the books. He made a bright sign that said BORROW A BOOK. Still, only two students stopped that day. His friend Tess watched people walk past. “They look toward the lunch tables, not this corner,” she said.',
      'With their teacher’s help, they moved the cart beside the lunch tables. They left the walkway clear so people could pass safely. Amir kept the same books and sign. This time, ten students stopped to look. Several borrowed a book before going out to play.',
      'Amir wrote the two counts in a notebook. Both days had been sunny, and the lunch period had lasted the same amount of time. The new spot seemed to help. Tess suggested adding more books next week. Amir agreed, but he wanted to keep the cart in its new place. Now students could see the books on their way to lunch.'
    ], [
      ['Why was the cart hard to notice at first?', ['It had no books on it.', 'It was behind a tall plant.', 'It was inside a locked room.', 'It was used only after school.'], 1, [['The cart stood behind a tall plant, where it was easy to miss.']], 'The plant hid the cart from view. Students could walk past without noticing the books.'],
      ['What did Amir try BEFORE moving the cart?', ['He took all the books home.', 'He put the plant on the cart.', 'He made a bright sign.', 'He changed the lunch schedule.'], 2, [['He made a bright sign that said BORROW A BOOK.']], 'Amir first tried to draw attention with a sign. He and Tess moved the cart after the sign did not help much.'],
      ['What does clear mean in “They left the walkway clear”?', ['open, with nothing blocking the way', 'made from glass', 'painted in a light color', 'easy to hear from far away'], 0, [['so people could pass safely']], 'A clear walkway has room for people to pass. The children kept the cart out of the walking path.'],
      ['What evidence suggests the new place helped?', ['Both days were sunny.', 'The cart had the same sign.', 'Tess wanted to add more books.', 'Ten students stopped there, compared with two before.'], 3, [['only two students stopped that day'], ['This time, ten students stopped to look.']], 'More students stopped after the move. The two counts support Amir’s idea that the new place helped.'],
      ['Why does the story mention that Amir kept the same books and sign?', ['To show that he did not want any help from Tess', 'To show that the cart’s location was the main thing he changed', 'To explain why students had to return books later', 'To prove that every student liked the same book'], 1, [['Amir kept the same books and sign.']], 'Keeping the books and sign the same helps us compare the two places. The main change was where the cart stood.']
    ])
  );
})();
