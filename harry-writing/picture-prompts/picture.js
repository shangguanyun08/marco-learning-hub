(() => {
  'use strict';
  const topics = {
    puppy: { title: 'The puppy in the park', image: 'images/puppy.png', alt: 'A boy in a yellow raincoat offers a towel to a muddy puppy under a park bench.' },
    kite: { title: 'A windy afternoon', image: 'images/kite.png', alt: 'A boy and a girl look at a red kite tangled on a low tree branch.' },
    own: { title: 'My own topic' }
  };
  const key = new URLSearchParams(location.search).get('topic');
  if (!Object.hasOwn(topics, key)) return;
  const topic = topics[key], $ = id => document.getElementById(id);
  window.WRITING_STORY_ID = 'harry-picture-' + key + '-v1';
  window.ELEPHANT_PARTS = [
    'Introduce who is in your story, where they are, and what starts to happen.',
    'Tell what happens next. What problem or surprise does the character face, and what do they do?',
    'Tell how the problem ends and what happens to the characters.'
  ];
  window.WRITING_CONFIG = { picture: true, custom: key === 'own', topicKey: key, partNames: ['Beginning', 'Middle', 'Ending'] };
  $('topic-chooser').hidden = true; $('writing-session').hidden = false;
  $('prompt-title').textContent = topic.title;
  document.title = 'Harry’s Daily Writing · ' + topic.title;
  if (topic.image) { $('prompt-image').src = topic.image; $('prompt-image').alt = topic.alt; $('prompt-picture').hidden = false; }
  else $('own-topic').hidden = false;
  const script = document.createElement('script'); script.src = '../app.js?v=20261108-chat'; document.head.append(script);
})();
