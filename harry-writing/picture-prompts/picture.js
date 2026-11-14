(() => {
  'use strict';
  const topics = {
    puppy: { title: 'The puppy in the park', image: 'images/puppy.png', alt: 'A boy in a yellow raincoat offers a towel to a muddy puppy under a park bench.' },
    kite: { title: 'A windy afternoon', image: 'images/kite.png', alt: 'A boy and a girl look at a red kite tangled on a low tree branch.' },
    garden: { title: 'The garden discovery', image: 'images/garden.png', alt: 'Two boys uncover a closed metal box among the roots in a school vegetable garden.' },
    boat: { title: 'The stuck sailboat', image: 'images/boat.png', alt: 'A boy and a girl hold a long branch as their red-sailed model boat sits caught in pond reeds.' },
    own: { title: 'My own topic' }
  };
  const key = new URLSearchParams(location.search).get('topic');
  if (!Object.hasOwn(topics, key)) {
    loadLastAttempts();
    return;
  }
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
  const script = document.createElement('script'); script.src = '../app.js?v=20261113-both-examples'; document.head.append(script);

  function read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  async function loadLastAttempts() {
    const token = read('harry-meaning-ai:connection-v1');
    await Promise.all(Object.keys(topics).map(async topicKey => {
      const storyId = 'harry-picture-' + topicKey + '-v1';
      const host = document.querySelector('[data-last-attempt="' + topicKey + '"]');
      let cached;
      try { cached = JSON.parse(read('harry-writing:' + storyId)); } catch {}
      const localTime = window.WritingActivity.latest(cached);
      window.WritingActivity.render(host, localTime, token ? 'Loading last attempt…' : 'Connect AI checking to view last attempt.');
      if (!token) return;
      try {
        const response = await fetch('https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/harry-writing?action=work&storyId=' + storyId, {
          headers: { authorization: 'Bearer ' + token }, cache: 'no-store', signal: AbortSignal.timeout(15000)
        });
        if (!response.ok) throw Error('Could not load writing');
        const work = await response.json();
        if (work.storyId !== storyId) throw Error('Wrong writing topic');
        const timestamp = [localTime, window.WritingActivity.latest(work)].filter(Boolean).sort().at(-1);
        window.WritingActivity.render(host, timestamp);
      } catch {
        window.WritingActivity.render(host, localTime, 'Open this topic to connect and view the last attempt.');
      }
    }));
  }
})();
