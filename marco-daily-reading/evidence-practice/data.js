(function(root){
  'use strict';
  const passages = {
    focus: {title:'A place for each task', paragraphs:[
      'A busy room can make even a simple task difficult. When several activities compete for our attention, we may spend more time deciding what to do next than actually doing it. Separating those activities can sometimes help people concentrate without making their work any easier.',
      'The Cedar School craft club encountered this problem while preparing a fair. At one table, students cut paper, tested paints, collected money, and answered visitors’ questions. A student folding a delicate model repeatedly stopped to explain the price list. The club then moved sales to the doorway and painting to a second table. During the next meeting, the students finished more models, although the designs and meeting length stayed the same.',
      'One club’s experience cannot establish a rule for every workspace. Still, it illustrates a useful possibility: changing how a room directs attention may improve work even when the task itself is unchanged.'
    ]},
    maker: {title:'The quiet designer', paragraphs:[
      'In this fictional town, Mara designed inexpensive tools for a community workshop. She kept adjusting a clamp until a child with small hands could tighten it as easily as an adult. When the workshop offered to put her portrait above the entrance, she politely declined. Mara rarely courted public attention; she preferred to see other people using the tools.',
      'Her notebooks were less modest than her public manner. They contained hundreds of careful drawings, including failed designs she refused to discard. “That mistake may save someone else a week,” she wrote beside one sketch. Visitors sometimes mistook her quietness for indifference, until she spent an entire afternoon helping them repair a single hinge.'
    ]},
    model: {title:'The message model', paragraphs:[
      'To explain a school’s new message network, Niko built a tabletop model. Imagine a station manager at a desk, surrounded by couriers who carry notes between that desk and distant platforms. In Niko’s comparison, the central controller is the manager, and the moving message packets are the couriers. The comparison describes their roles; it does not mean that the controller is a person.',
      'The model uses three kinds of electronic unit. A sender creates a message, a relay passes it onward, and a receiver displays it at its destination. Only the sender creates the original message. A relay can send the same message to a different route when a path is busy, but it does not write new messages. The receiver lights a small screen when delivery is complete. These distinct jobs let the demonstration show where a message begins, how it travels, and where it ends.'
    ]},
    name: {title:'A name for an old habit', paragraphs:[
      'In 2018, the fictional Brook Lane repair club began calling one of its methods “part pairing.” Members used the phrase for joining two incomplete objects to make one useful object. A chair with a broken seat might supply legs for a bench whose original legs were damaged. The new label made the method easier to describe in the club’s newsletter.',
      'The idea itself was much older than the label. Photographs in the club’s archive show members combining pieces of broken furniture in the 1970s. One retired member remembered learning the habit from her grandfather. The newsletter therefore described part pairing as a familiar practice with a convenient new name. It did not claim that members in 2018 had invented the practice, or that every old object could be rescued this way.'
    ]},
    engineer: {title:'One explanation for two rooms', paragraphs:[
      'For years, the fictional Bell House museum treated two temperature problems as unrelated. Staff thought the chilly gallery was caused by its tall windows, while the hot storage room was blamed on a weak fan. Each room received a separate repair budget.',
      'Engineer Imani proposed a different explanation. A single faulty valve was sending too little warm air to the gallery and too much to storage. After she replaced it, both rooms became comfortable. Her explanation challenged the belief that the two problems needed separate causes.',
      'Imani later placed sensors in the neighborhood of the valve. The readings closest to it changed first when she adjusted the heat. Those farther down the corridor changed several minutes later. These observations helped the staff see how one part of a building could influence distant rooms.'
    ]},
    garden: {title:'The garden’s hidden partners', paragraphs:[
      'At a fictional school garden, a row of old flowering shrubs did more than decorate the fence. Small insects sheltered among the leaves, and birds fed on those insects. Bees visited the flowers before carrying pollen to nearby fruit plants. The gardeners noticed that several living things depended on the same strip of shrubs in different ways.',
      'When a building project removed most of the shrubs, the insects lost shelter. Birds visited the fence less often, and fewer bees stopped at that end of the garden. The fruit plants still received sunlight and water, but the gardeners worried that fewer flowers would be pollinated. They planted a new hedge to restore some of the missing food and shelter. The project showed how a change to one part of a habitat could affect organisms that had never been the builders’ intended targets.'
    ]},
    phrase: {title:'The last paper tickets', paragraphs:[
      'The Ridge Cinema has all but abandoned paper tickets. Nearly everyone now shows a code on a phone, which an usher scans at the entrance. A small printer remains behind the counter for customers whose phones cannot display a code. On Saturday, the printer produced just two tickets while hundreds of customers entered with their phones.',
      'The manager has no plans to remove the printer. It costs little to keep and can help if the scanning system fails. Yet a visitor watching the entrance for an hour would probably never see a paper ticket. The old method survives as an occasional alternative rather than the cinema’s usual way of admitting customers.'
    ]},
    flood: {title:'A record in the archives', paragraphs:[
      'In the fictional county of Alder, the 1964 flood remains the most destructive flood in the county’s recorded history, measured by the number of buildings damaged. Archive workers estimate that it damaged about 900 buildings. Several more recent floods have attracted wider television coverage, but none has surpassed that county record.',
      'Rain fell for days before the river rose over its banks. Roads disappeared beneath brown water, and families moved into the school gymnasium. Recovery took months.',
      'Resident Eva Lin described what she saw when she returned: “Our gate lay across the kitchen steps. I could see a line of mud halfway up the walls, and the shelves had collapsed.” Her notebook recorded details that broad damage totals could not convey.',
      'Today, archive workers preserve both the totals and personal accounts. The figures establish the scale of the flood; memories like Eva’s help readers imagine what that scale meant inside one home.'
    ]},
    play: {title:'Before the curtain', paragraphs:[
      'Lena had promised to tell the drama teacher if the borrowed costume tore. During rehearsal, a nail caught the sleeve. She folded the loose cloth inward, hoping no one would notice before she could repair it. The tear was small, but the promise suddenly seemed much larger.',
      'Footsteps sounded outside the dressing room. Lena recognized the teacher’s slow step and looked at the unfinished stitches. At that moment, she would gladly have traded places with her brother, who was spending the afternoon at the dentist. She laid down the needle as the door opened.',
      'The teacher was carrying a box of spare costumes. “I thought you might need a different size,” he said. Lena took a breath and unfolded the damaged sleeve. She had imagined several possible conversations, but none had begun with an offer to help.'
    ]},
    filter: {title:'The tray that filled up', paragraphs:[
      'A classroom demonstration used a tray lined with cloth to remove bits of clay from muddy water. At first, water passed through quickly, leaving much of the clay on the cloth. Repeating the process made the water below look clearer, but it also left a thicker layer of clay on the tray.',
      'As the clay accumulated, it blocked some openings in the cloth. Water still passed through, but more slowly. With the same amount of water poured at each trial, the tray took longer to drain and sometimes overflowed. Students had to clean the cloth more frequently to keep the demonstration working.',
      'The teacher warned against confusing reduced flow with no flow. The cloth had not stopped working completely. Its growing layer of trapped material simply made passage more difficult. Cleaning the cloth removed that layer and restored faster drainage.'
    ]},
    town: {title:'The mill becomes a theater', paragraphs:[
      'In the fictional town of Millbrook, an empty mill stood beside the river long after its machinery had been sold. Visitors passed it on their way to a larger city. Local shopkeepers wanted to give those travelers a reason to stop.',
      'Two observations shaped their plan. The mill’s high wooden ceiling reminded a local actor of a theater he had visited. Residents also learned that a nearby village had drawn visitors by turning a disused station into a music venue. Together, the building’s possibilities and the village’s example inspired a proposal for a small theater.',
      'The first performance used borrowed lamps and folding chairs. Nevertheless, the audience was enthralled: people leaned forward during the quiet scenes and stayed afterward to discuss the play. Later performances brought visitors who also ate in local cafés. Success did not come from copying the neighboring village exactly; residents adapted an example to a building and a need of their own.'
    ]},
    sharing: {title:'Sharing the same space', paragraphs:[
      'Several groups can use one place without needing it in exactly the same way. One method is to divide access by time. Another is to give each group a different part of the place. Both arrangements reduce direct competition for a limited resource.',
      'At a community field, runners use the track early in the morning, and a walking club uses it later. On the playing surface, two youth teams practice in separate halves at the same hour. These arrangements divide the resource in different ways while allowing more people to benefit from it.',
      'The same pattern appears indoors. A workshop might reserve mornings for noisy repairs and afternoons for quiet design work. Agreements need not give everyone identical schedules. They need to make the available space usable for groups whose activities might otherwise interfere with one another.'
    ]},
    materials: {title:'What does flexible mean?', paragraphs:[
      'An object can bend without breaking, but the word “flexible” does not tell us how far it bends or how well it returns to its original shape. Those differences matter when a designer chooses a material.',
      'Think of a rubber band, a garden hose, a thin ruler, and a sheet of fabric. Each can change shape in your hands, although they behave quite differently. These familiar objects show the range of bending the designer has in mind.',
      'To compare materials fairly, a class used strips of equal length and width. Students placed the same small weight at the center of each strip and measured the bend. They then removed the weight and checked whether the strip returned to its earlier shape. Those measurements helped separate two questions: how readily something bends and whether the change is temporary.'
    ]}
  };
  const questions=[];
  function add(source,passage,skill,prompt,choices,answer,evidence,explanation,trap){
    questions.push({id:'e'+(questions.length+1),source,passage,skill,prompt,choices,answer,evidence,explanation,trap});
  }
  add('Practice 6 · Q4','focus','Organization','How is the passage mainly organized?',[
    'A broad idea is introduced, a specific example develops it, and the passage returns to a broader conclusion.',
    'Several competing theories are listed, and each is rejected in turn.',
    'A series of unrelated personal memories ends with a prediction.',
    'A question about room size is answered by a history of school fairs.'
  ],0,['Separating those activities can sometimes help people concentrate','The Cedar School craft club encountered this problem','Still, it illustrates a useful possibility'],
  'The opening proposes a broad relationship between space and attention. The club supplies one case, and the final paragraph draws a cautious general lesson. Use evidence from all three parts.', 'One example is not a series of unrelated anecdotes.');
  add('Practice 6 · Q10','maker','Vocabulary','In the first paragraph, “courted” most nearly means',[
    'remembered.','sought.','received.','avoided.'
  ],1,['politely declined','rarely courted public attention','preferred to see other people using the tools'],
  'To court attention is to seek it. “Rarely” tells how seldom Mara sought it; the word courted itself does not mean avoided. Her response to the portrait supports that reading.', 'Substitute your word while keeping “rarely” in the sentence.');
  add('Practice 6 · Q21','model','Supporting details','According to the passage, which unit contributes the original content of a message?',[
    'The relay, because it chooses a route.','The receiver, because its screen lights.','The sender, because it creates the message.','All three, because every unit writes part of the message.'
  ],2,['A sender creates a message','Only the sender creates the original message'],
  'Creating, forwarding, and displaying are different roles. The passage assigns original content to the sender, even though the relay also affects the journey.', 'Do not transfer one component’s job to another.');
  add('Practice 6 · Q24','model','Comparison','In Niko’s comparison, the station manager corresponds to',[
    'a moving packet.','the receiver’s screen.','a distant platform.','the central controller.'
  ],3,['the central controller is the manager','the moving message packets are the couriers'],
  'Match each role in the comparison. The manager and controller are the central figures; the couriers and packets carry messages.', 'Choose the comparison the writer develops, even if another comparison seems plausible.');
  add('Practice 6 · Q32','name','Supporting details','Which statement about part pairing is supported?',[
    'The club invented both the phrase and the practice in 2018.','The phrase appeared in 2018, while the practice was already familiar.','The method always restores every damaged object.','The method began when the club bought new furniture in the 1970s.'
  ],1,['In 2018','The idea itself was much older than the label','combining pieces of broken furniture in the 1970s'],
  'The date belongs to the label. The archive supplies evidence of an older practice. Both details are needed to distinguish naming from inventing.', 'A new name does not establish a new invention.');
  add('Earlier review · Mock 0 Q26','engineer','Supporting details','Which earlier belief did Imani challenge?',[
    'Warm air can travel through a building.','A faulty valve can affect more than one room.','The gallery and storage problems had separate causes.','Temperature can be measured with sensors.'
  ],2,['treated two temperature problems as unrelated','A single faulty valve','challenged the belief that the two problems needed separate causes'],
  'Identify what staff believed before Imani arrived. She challenged the separate-cause explanation by identifying one valve that affected both rooms.', 'Distinguish the earlier belief from the new explanation.');
  add('Earlier review · Mock 0 Q28','engineer','Vocabulary','In the final paragraph, “in the neighborhood of” means',[
    'near.','similar to.','familiar with.','owned by.'
  ],0,['placed sensors in the neighborhood of the valve','The readings closest to it changed first'],
  '“Closest to it” explains the spatial meaning. Replacing the phrase with near preserves the observation about distance.', 'Use the nearby sentence to test the replacement.');
  add('Earlier review · Mock 1 Q35','garden','Supporting details','Which consequence of removing the shrubs does the passage describe?',[
    'The fruit plants no longer received any sunlight.','The builders intended to remove all the insects.','Every bird stopped visiting the entire town.','Several organisms lost resources on which they depended.'
  ],3,['the insects lost shelter','Birds visited the fence less often','fewer bees stopped'],
  'The passage connects the removed shrubs with lost shelter, fewer feeding visits, and fewer bee visits. It does not say that all sunlight or all birds disappeared.', 'Avoid extending a local effect into an absolute claim.');
  add('Earlier review · Mock 1 Q5','phrase','Vocabulary','What does “all but abandoned” mean here?',[
    'Used by every customer except two.','Completely stopped with no exceptions.','Almost entirely stopped using.','Only recently started using.'
  ],2,['just two tickets while hundreds of customers entered with their phones','survives as an occasional alternative'],
  'Paper tickets are very unusual, but they still exist. Almost entirely allows the exceptions that the passage describes.', 'Notice the difference between almost and completely.');
  add('Earlier review · Mock 2 Q14','flood','Inference','Which conclusion is supported about a later flood in Alder County?',[
    'It certainly damaged fewer than 1,100 buildings.','It damaged more buildings because it received wider coverage.','Every flood in the world damaged fewer than 900 buildings.','No buildings were damaged after 1964.'
  ],0,['most destructive flood in the county’s recorded history','about 900 buildings','none has surpassed that county record'],
  'Combine the county record with its size. A later county flood cannot exceed the roughly 900-building record and therefore cannot reach 1,100. The record says nothing about the whole world.', 'Keep the place and measurement in the claim.');
  add('Earlier review · Mock 2 Q18','flood','Paragraph purpose','What is the main purpose of the third paragraph?',[
    'To calculate the total number of damaged buildings.','To give a firsthand view of the flood’s effects.','To explain the engineering of the river’s banks.','To argue that television coverage caused the flood.'
  ],1,['Resident Eva Lin described what she saw','details that broad damage totals could not convey'],
  'Eva reports what she personally saw. Her specific details make the effects concrete, adding a personal view to the statistics.', 'Name what the paragraph does, rather than only what it mentions.');
  add('Earlier review · Mock 2 Q22','play','Paragraph purpose','Why does the author mention that Lena would trade places with her brother?',[
    'To prove Lena enjoys dental appointments.','To establish that the teacher will punish her.','To explain how her brother tore the costume.','To show how strongly Lena dreads the approaching conversation.'
  ],3,['recognized the teacher’s slow step','gladly have traded places with her brother','at the dentist'],
  'Even an unpleasant dental visit seems preferable to the immediate conversation. The thought reveals dread; it does not establish what the teacher will do.', 'A character’s fear is not proof of another person’s future action.');
  add('Earlier review · Mock 2 Q27','filter','Supporting details','Which effect of accumulated clay is NOT described?',[
    'The tray can overflow.','The cloth’s openings become wider.','Water takes longer to pass through.','The cloth needs more frequent cleaning.'
  ],1,['blocked some openings','took longer to drain and sometimes overflowed','clean the cloth more frequently'],
  'The text says that clay blocks openings. Wider openings would be the opposite. Check the other three choices against the stated effects before choosing the exception.', 'For NOT questions, account for the three supported choices.');
  add('Earlier review · Mock 2 Q29','filter','Cause and effect','Why does drainage become slower?',[
    'The students pour less water at each trial.','The cloth stops allowing any water to pass.','Accumulated clay blocks some openings in the cloth.','The tray grows larger with every trial.'
  ],2,['As the clay accumulated, it blocked some openings in the cloth','Water still passed through, but more slowly'],
  'The blocked openings explain the reduced flow. The next sentence rules out the stronger claim that no water passes through.', 'Less readily does not mean not at all.');
  add('Earlier review · Mock 2 Q33','town','Vocabulary','The word “enthralled” most nearly means',[
    'absorbed with interest.','confused by instructions.','offended by the noise.','barely aware of events.'
  ],0,['people leaned forward during the quiet scenes','stayed afterward to discuss the play'],
  'The audience’s attention during the play and discussion afterward show strong interest. They support absorbed rather than confused, offended, or unaware.', 'Use behavior around the word as a context clue.');
  add('Earlier review · Mock 2 Q35','town','Paragraph purpose','What is the main job of the second paragraph?',[
    'To give directions from the village to the mill.','To describe every step of the building repairs.','To show why the first performance failed.','To explain the sources of inspiration for the theater plan.'
  ],3,['Two observations shaped their plan','The mill’s high wooden ceiling','the village’s example inspired a proposal'],
  'The paragraph gives two influences: a feature of the mill and another village’s successful example. Their purpose is to explain the plan’s origins.', 'One descriptive detail can serve a larger explanatory purpose.');
  add('Earlier review · Mock 2 Q6','sharing','Organization','How does the author develop the passage?',[
    'By tracing the history of one sports team.','By explaining an approach and illustrating it in several settings.','By arguing against every kind of shared space.','By listing opposing research findings without explaining them.'
  ],1,['One method is to divide access by time','At a community field','The same pattern appears indoors'],
  'The first paragraph explains ways of dividing access. The field and workshop demonstrate those ways. Examples develop the approach rather than contradict it.', 'Identify the relationship between the opening idea and later examples.');
  add('Earlier review · Mock 2 Q8','materials','Paragraph purpose','What is the main function of the second paragraph?',[
    'To explain the molecular cause of flexibility.','To report the measured results of an experiment.','To make the kind of bending under discussion concrete through familiar examples.','To prove that all flexible materials return to their original shape.'
  ],2,['a rubber band, a garden hose, a thin ruler, and a sheet of fabric','These familiar objects show the range of bending'],
  'The objects help readers picture the topic. The paragraph does not explain a mechanism or report measurements; the experimental method comes later.', 'Examples of a phenomenon do not necessarily explain its cause.');
  add('Practice 6 · Q1 · unanswered','focus','Main idea','Which statement best expresses the passage’s main idea?',[
    'School fairs succeed only when every student paints.','Craft clubs should always work for longer periods.','Separating sales from painting makes every design simpler.','A workspace’s arrangement can influence how well people focus.'
  ],3,['Separating those activities can sometimes help people concentrate','changing how a room directs attention may improve work'],
  'The club illustrates a broader idea about workspace and attention. The passage does not establish a universal rule or claim that the designs became simpler.', 'Choose the idea that covers the example and the conclusion.');
  root.EvidenceData={appId:'marco-reading-evidence-20261124-v1',revision:2,passages,questions};
})(typeof window==='undefined'?globalThis:window);
