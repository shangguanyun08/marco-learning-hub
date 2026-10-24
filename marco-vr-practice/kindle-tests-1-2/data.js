/* Selected from the user's supplied screen recording of Practice Tests 1 and 2.
   Question wording and A–D order are retained; underscore lengths are normalized.
   Meanings, selection judgments, and teaching notes below are newly written.
   Difficulty is an editorial estimate, not a publisher or ISEE rating. */
(function (root) {
  'use strict';
  const questions = [
    {
      source: 101, test: 1, number: 1, part: 'Synonyms', type: 'synonym',
      prompt: 'LOATH is closest in meaning to:',
      choices: ['fearless', 'forgetful', 'joyful', 'unwilling'], correct: 3,
      skill: 'Exact meaning and opposites', level: 'Hard / tricky',
      word: 'loath', meaning: 'unwilling; reluctant',
      tip: 'Use “loath to do it”: not willing to do it. Do not confuse LOATH with LOATHE, meaning hate.',
      explanation: 'Unwilling is the closest meaning. Fearless describes lack of fear, not willingness.',
      selection: 'An easily confused word form plus a precise attitude distinction; selected for the kind of meaning-direction errors seen in DISCLOSE and JUSTIFY.',
      related: [['2026-10-04', 10, 'DISCLOSE'], ['2026-10-22', 18, 'JUSTIFY']],
      evidence: 'Recording 00:01–00:08; answer key around 00:30–00:33.'
    },
    {
      source: 206, test: 2, number: 6, part: 'Synonyms', type: 'synonym',
      prompt: 'Which word is closest in meaning to CALLOUS?',
      choices: ['cautious', 'cheerful', 'insensitive', 'obedient'], correct: 2,
      skill: 'Exact meaning and opposites', level: 'Hard',
      word: 'callous', meaning: 'not caring about other people’s feelings or suffering',
      tip: 'Ask what the word says about concern for others—not about happiness, caution, or obedience.',
      explanation: 'Callous means insensitive or unfeeling. Cheerful is a mood; it does not tell you whether someone cares.',
      selection: 'Tests the exact personal quality rather than choosing another adjective about a person, a recurring problem in Marco’s vocabulary choices.',
      related: [['2026-10-22', 5, 'DISMAL'], ['2026-10-11', 12, 'COLLECTIVE']],
      evidence: 'Recording around 00:40–00:41; answer key around 01:04–01:05.'
    },
    {
      source: 124, test: 1, number: 4, part: 'Sentence completion', type: 'sentence completion',
      prompt: 'The rescue team’s progress was _______ because heavy rain repeatedly forced them to stop.',
      choices: ['immediate', 'steady', 'effortless', 'sporadic'], correct: 3,
      skill: 'Whole-sentence clues', level: 'Hard / tricky',
      word: 'sporadic', meaning: 'happening irregularly; in stops and starts',
      tip: '“Repeatedly forced them to stop” means stop-start progress. It does not simply mean slow or difficult.',
      explanation: 'Sporadic fits interrupted, irregular progress. Steady would mean continuing regularly—the opposite of the clue.',
      selection: 'Requires matching the manner of progress, not merely reacting to the negative setting; similar to the precise-action problem in AMBLE.',
      related: [['2026-10-11', 15, 'AMBLE'], ['2026-10-22', 40, 'FLEETING sentence']],
      evidence: 'Recording around 00:09–00:11; answer key around 00:28–00:29.'
    },
    {
      source: 102, test: 1, number: 2, part: 'Synonyms', type: 'synonym',
      prompt: 'PITHY is closest in meaning to:',
      choices: ['concise', 'polite', 'truthful', 'vague'], correct: 0,
      skill: 'Less-familiar vocabulary', level: 'Hard',
      word: 'pithy', meaning: 'brief but meaningful and effective',
      tip: 'A pithy comment is short and gets to the point. Brief does not mean unclear.',
      explanation: 'Concise means expressing something in few words. Vague means unclear, which is a different quality.',
      selection: 'A genuinely less-familiar target word with a useful meaning contrast; comparable vocabulary work to PALTRY and ORATOR, not a basic filler item.',
      related: [['2026-10-04', 12, 'PALTRY'], ['2026-10-04', 11, 'ORATOR']],
      evidence: 'Recording 00:01–00:08; answer key around 00:30–00:33.'
    },
    {
      source: 224, test: 2, number: 4, part: 'Sentence completion', type: 'sentence completion',
      prompt: 'The compact tool could slice rope, open cans, and tighten screws, making it unusually _______.',
      choices: ['versatile', 'fragile', 'decorative', 'expensive'], correct: 0,
      skill: 'Whole-sentence clues', level: 'Targeted tricky',
      word: 'versatile', meaning: 'able to do many different things or serve many uses',
      tip: 'Summarize all three jobs as “many uses.” Do not focus on only one object or assume compact means fragile.',
      explanation: 'Versatile describes the tool’s many functions. The sentence gives no evidence that it is expensive or decorative.',
      selection: 'Not intrinsically one of the book’s hardest items, but deliberately retained because it directly checks Marco’s recent VERSATILE error with a new sentence.',
      related: [['2026-10-22', 37, 'VERSATILE sentence']],
      evidence: 'Recording around 00:41.8–00:42.1; answer key around 01:06.'
    },
    {
      source: 211, test: 2, number: 11, part: 'Synonyms', type: 'synonym',
      prompt: 'Which word is closest in meaning to DISCREET?',
      choices: ['noisy', 'obvious', 'reckless', 'tactful'], correct: 3,
      skill: 'Exact meaning and opposites', level: 'Hard / tricky',
      word: 'discreet', meaning: 'careful and tactful, especially about private matters',
      tip: 'Discreet behavior avoids unnecessary attention or embarrassment. Do not confuse DISCREET with DISCRETE, meaning separate.',
      explanation: 'Tactful is the closest choice. Noisy, obvious, and reckless do not describe careful handling of a delicate matter.',
      selection: 'A precise social meaning and confusable spelling; chosen for the same exact-meaning discipline needed for COLLECTIVE and CONVICTION.',
      related: [['2026-10-11', 12, 'COLLECTIVE'], ['2026-10-04', 17, 'CONVICTION']],
      evidence: 'Recording around 00:40–00:41; answer key around 01:04–01:05.'
    },
    {
      source: 117, test: 1, number: 17, part: 'Synonyms', type: 'synonym',
      prompt: 'COMPLACENT is closest in meaning to:',
      choices: ['anxious', 'generous', 'obedient', 'self-satisfied'], correct: 3,
      skill: 'Exact meaning and opposites', level: 'Hard',
      word: 'complacent', meaning: 'too pleased with oneself to notice possible problems',
      tip: 'Separate COMPLACENT from COMPLIANT. Compliant means obedient; complacent means self-satisfied.',
      explanation: 'Self-satisfied is the match. Obedient describes following instructions, not being too content with yourself.',
      selection: 'Obedient is a plausible confusable-word trap, making this a stronger discrimination item than a simple unfamiliar-word lookup.',
      related: [['2026-10-04', 17, 'CONVICTION'], ['2026-10-22', 18, 'JUSTIFY']],
      evidence: 'Recording 00:01–00:08; answer key around 00:28–00:29.'
    },
    {
      source: 233, test: 2, number: 13, part: 'Sentence completion', type: 'sentence completion',
      prompt: 'Though clearly pleased by the award, Omar remained ________, offering a brief thank-you instead of an excited speech.',
      choices: ['reserved', 'confused', 'boastful', 'reckless'], correct: 0,
      skill: 'Contrast and restraint', level: 'Hard / tricky',
      word: 'reserved', meaning: 'restrained; not openly showing much emotion',
      tip: '“Though” contrasts his inner pleasure with his restrained outward behavior. Here reserved does not mean booked in advance.',
      explanation: 'Reserved fits the short, controlled response. Boastful would suggest showing off, not keeping the response restrained.',
      selection: 'A common word used in a less automatic sense, plus a contrast clue; particularly relevant to the PLUSH and CHIEF mistakes.',
      related: [['2026-10-22', 9, 'PLUSH'], ['2026-10-22', 38, 'CHIEF sentence']],
      evidence: 'Recording around 00:41.8–00:42.1; answer key around 01:06.'
    },
    {
      source: 106, test: 1, number: 6, part: 'Synonyms', type: 'synonym',
      prompt: 'EVASIVE is closest in meaning to:',
      choices: ['confident', 'exhausted', 'generous', 'indirect'], correct: 3,
      skill: 'Exact meaning and opposites', level: 'Hard / tricky',
      word: 'evasive', meaning: 'avoiding a direct answer or response',
      tip: 'Picture an evasive answer: it dodges the question. Confidence is not the same as directness.',
      explanation: 'Indirect is the closest option. Evasive concerns avoiding a clear response, not tiredness, generosity, or confidence.',
      selection: 'Retained for a precise behavior-versus-personality distinction, similar to choosing a related adjective instead of a true synonym.',
      related: [['2026-10-11', 12, 'COLLECTIVE'], ['2026-10-04', 9, 'OBSCURE']],
      evidence: 'Recording 00:01–00:08; answer key around 00:30–00:33.'
    },
    {
      source: 207, test: 2, number: 7, part: 'Synonyms', type: 'synonym',
      prompt: 'Which word is closest in meaning to CRYPTIC?',
      choices: ['celebrated', 'nearby', 'polished', 'puzzling'], correct: 3,
      skill: 'Less-familiar vocabulary', level: 'Hard',
      word: 'cryptic', meaning: 'mysterious or difficult to understand',
      tip: 'A cryptic message has a hidden or unclear meaning. Choose the word describing understanding, not fame or appearance.',
      explanation: 'Puzzling means hard to understand. Polished means refined or smooth; celebrated means famous.',
      selection: 'A direct follow-up to the meaning dimension Marco missed with OBSCURE, using a different target word.',
      related: [['2026-10-04', 9, 'OBSCURE']],
      evidence: 'Recording around 00:40–00:41; answer key around 01:04–01:05.'
    },
    {
      source: 125, test: 1, number: 5, part: 'Sentence completion', type: 'sentence completion',
      prompt: 'Although Theo was usually outspoken, he became _______ when asked whose vase had been broken.',
      choices: ['reticent', 'patient', 'decisive', 'grateful'], correct: 0,
      skill: 'Contrast and restraint', level: 'Hard',
      word: 'reticent', meaning: 'not eager to speak; reluctant to share thoughts',
      tip: '“Although” signals a contrast with outspoken. Predict “not willing to talk” before reading the options.',
      explanation: 'Reticent is the opposite of openly talkative. Patient means able to wait calmly, not unwilling to speak.',
      selection: 'Combines a challenging target word with a contrast clue, like the earlier BEGRUDGINGLY sentence.',
      related: [['2026-09-27', 38, 'BEGRUDGINGLY sentence'], ['2026-10-22', 38, 'CHIEF sentence']],
      evidence: 'Recording around 00:09–00:11; answer key around 00:28–00:29.'
    },
    {
      source: 212, test: 2, number: 12, part: 'Synonyms', type: 'synonym',
      prompt: 'Which word is closest in meaning to MITIGATE?',
      choices: ['alleviate', 'examine', 'intensify', 'predict'], correct: 0,
      skill: 'Less-familiar vocabulary', level: 'Hard',
      word: 'mitigate', meaning: 'make something harmful or unpleasant less severe',
      tip: 'Mitigate damage = reduce its severity. Intensify moves in the opposite direction.',
      explanation: 'Alleviate also means make less severe. Examine means inspect; it does not mean reduce harm.',
      selection: 'Both target and correct option require vocabulary knowledge, and intensify is a meaningful opposite trap.',
      related: [['2026-10-22', 18, 'JUSTIFY'], ['2026-10-04', 10, 'DISCLOSE']],
      evidence: 'Recording around 00:40–00:41; answer key around 01:04–01:05.'
    },
    {
      source: 112, test: 1, number: 12, part: 'Synonyms', type: 'synonym',
      prompt: 'JUDICIOUS is closest in meaning to:',
      choices: ['impulsive', 'ordinary', 'prudent', 'severe'], correct: 2,
      skill: 'Exact meaning and opposites', level: 'Hard',
      word: 'judicious', meaning: 'showing wise, careful judgment',
      tip: 'Connect judicious with good judgment, not with a harsh judge. Impulsive means acting without careful thought.',
      explanation: 'Prudent means wise and careful. Severe may describe strictness, but judicious does not mean harsh.',
      selection: 'The tempting association with judges and severity is not the definition—similar to the association trap in PRESTIGIOUS.',
      related: [['2026-09-27', 12, 'PRESTIGIOUS'], ['2026-09-27', 18, 'MERIT']],
      evidence: 'Recording 00:01–00:08; answer key around 00:28–00:29.'
    },
    {
      source: 225, test: 2, number: 5, part: 'Sentence completion', type: 'sentence completion',
      prompt: 'The summary was _______, covering the essential findings in two focused paragraphs without unnecessary details.',
      choices: ['obscure', 'succinct', 'repetitive', 'speculative'], correct: 1,
      skill: 'Whole-sentence clues', level: 'Hard / tricky',
      word: 'succinct', meaning: 'brief and clearly expressed',
      tip: 'Use both clues: “essential findings” and “without unnecessary details.” Predict brief and clear, not merely short.',
      explanation: 'Succinct matches a focused summary. Speculative means based on guesses; the sentence says nothing about guessing.',
      selection: 'Requires separating several academic-description words and using the full clue rather than one familiar association.',
      related: [['2026-10-04', 9, 'OBSCURE'], ['2026-10-22', 37, 'VERSATILE sentence']],
      evidence: 'Recording around 00:41.8–00:42.1; answer key around 01:06.'
    },
    {
      source: 118, test: 1, number: 18, part: 'Synonyms', type: 'synonym',
      prompt: 'METICULOUS is closest in meaning to:',
      choices: ['casual', 'hasty', 'painstaking', 'playful'], correct: 2,
      skill: 'Less-familiar vocabulary', level: 'Hard',
      word: 'meticulous', meaning: 'extremely careful and attentive to details',
      tip: 'Painstaking means taking great care—not causing pain. Define both the target and the option.',
      explanation: 'Painstaking is the match because both words describe very careful work. Hasty means rushed and is nearly opposite.',
      selection: 'The correct option itself has a potentially misleading familiar word-part, requiring the same second-meaning check needed for CALLING.',
      related: [['2026-10-22', 20, 'VOCATION / CALLING'], ['2026-09-27', 15, 'VOCATION / PURSUIT']],
      evidence: 'Recording 00:01–00:08; answer key around 00:28–00:29.'
    },
    {
      source: 213, test: 2, number: 13, part: 'Synonyms', type: 'synonym',
      prompt: 'Which word is closest in meaning to DESTITUTE?',
      choices: ['crowded', 'grateful', 'impoverished', 'wealthy'], correct: 2,
      skill: 'Less-familiar vocabulary', level: 'Hard',
      word: 'destitute', meaning: 'extremely poor; lacking basic necessities',
      tip: 'Match the financial condition and its severity. Wealthy is the opposite; grateful describes a feeling.',
      explanation: 'Impoverished means very poor. Destitute is stronger than simply having little spending money.',
      selection: 'A less-familiar target and answer pair requiring a precise condition, comparable to PALTRY → MEAGER.',
      related: [['2026-10-04', 12, 'PALTRY']],
      evidence: 'Recording around 00:40–00:41; answer key around 01:04–01:05.'
    },
    {
      source: 136, test: 1, number: 16, part: 'Sentence completion', type: 'sentence completion',
      prompt: 'The speaker used a _______ tone when discussing the memorial, showing respect for those who had sacrificed so much.',
      choices: ['hurried', 'sarcastic', 'reverent', 'casual'], correct: 2,
      skill: 'Whole-sentence clues', level: 'Hard',
      word: 'reverent', meaning: 'showing deep respect',
      tip: 'The definition is in the sentence: “showing respect.” A memorial setting alone is not the answer; use the stated attitude.',
      explanation: 'Reverent means deeply respectful. Sarcastic suggests mockery, while casual does not convey the required respect.',
      selection: 'A challenging tone word, with the sentence providing enough evidence to solve it through careful reading.',
      related: [['2026-10-22', 5, 'DISMAL'], ['2026-10-22', 29, 'ORDINARY sentence']],
      evidence: 'Recording around 00:09–00:11; answer independently checked against the visible “showing respect” clue.'
    },
    {
      source: 217, test: 2, number: 17, part: 'Synonyms', type: 'synonym',
      prompt: 'Which word is closest in meaning to TENTATIVE?',
      choices: ['confident', 'exact', 'permanent', 'provisional'], correct: 3,
      skill: 'Less-familiar vocabulary', level: 'Hard',
      word: 'tentative', meaning: 'not final or fully decided; subject to change',
      tip: 'A tentative plan may change. Provisional means temporary until a final decision is made.',
      explanation: 'Provisional is closest. Permanent means fixed or lasting; exact refers to precision, not whether a decision is final.',
      selection: 'Both words require understanding of finality, not just positive or negative tone; a useful precision check beyond basic word recognition.',
      related: [['2026-10-04', 17, 'CONVICTION'], ['2026-10-22', 40, 'FLEETING sentence']],
      evidence: 'Recording around 00:40–00:41; answer key around 01:04–01:05.'
    },
    {
      source: 120, test: 1, number: 20, part: 'Synonyms', type: 'synonym',
      prompt: 'INADVERTENT is closest in meaning to:',
      choices: ['accidental', 'cautious', 'deliberate', 'generous'], correct: 0,
      skill: 'Exact meaning and opposites', level: 'Hard / tricky',
      word: 'inadvertent', meaning: 'not intended; accidental',
      tip: 'An inadvertent mistake was not made on purpose. Deliberate is the opposite, not a similar formal-sounding word.',
      explanation: 'Accidental is the closest match. Cautious means careful; a cautious person can still make an inadvertent error.',
      selection: 'A clear intention-versus-accident distinction with a strong opposite distractor, matching the DISCLOSE / CONCEAL type of error.',
      related: [['2026-10-04', 10, 'DISCLOSE'], ['2026-10-22', 18, 'JUSTIFY']],
      evidence: 'Recording around 00:09–00:11; answer key around 00:28–00:29.'
    },
    {
      source: 234, test: 2, number: 14, part: 'Sentence completion', type: 'sentence completion',
      prompt: 'Although the editor liked the first draft, she was _______ to feedback and revised several paragraphs after the discussion.',
      choices: ['indifferent', 'receptive', 'unaware', 'resistant'], correct: 1,
      skill: 'Contrast and restraint', level: 'Hard / tricky',
      word: 'receptive', meaning: 'willing to consider or accept ideas and suggestions',
      tip: '“Revised several paragraphs” proves she considered the feedback. Liking her first draft does not mean she resisted change.',
      explanation: 'Receptive fits her willingness to revise. Resistant means unwilling to accept change; indifferent means not caring.',
      selection: 'The tempting first-clause assumption conflicts with the later evidence, just as a partial sentence reading led to some recent misses.',
      related: [['2026-09-27', 38, 'BEGRUDGINGLY sentence'], ['2026-10-22', 38, 'CHIEF sentence']],
      evidence: 'Recording around 00:41.8–00:42.1; answer key around 01:06.'
    },
    {
      source: 116, test: 1, number: 16, part: 'Synonyms', type: 'synonym',
      prompt: 'VINDICATE is closest in meaning to:',
      choices: ['accuse', 'delay', 'discourage', 'exonerate'], correct: 3,
      skill: 'Less-familiar vocabulary', level: 'Hard',
      word: 'vindicate', meaning: 'clear from blame; show someone was right',
      tip: 'To vindicate someone is to show they were not at fault. Accuse points in the opposite direction.',
      explanation: 'Exonerate means clear from blame. Neither delay nor discourage carries that meaning.',
      selection: 'A demanding verb pair plus an opposite distractor; closely aligned with Marco’s JUSTIFY / CONDEMN confusion.',
      related: [['2026-10-22', 18, 'JUSTIFY']],
      evidence: 'Recording 00:01–00:08; answer key around 00:28–00:29.'
    },
    {
      source: 223, test: 2, number: 3, part: 'Sentence completion', type: 'sentence completion',
      prompt: 'After the school adopted a searchable online database, the old card catalog became _______.',
      choices: ['flexible', 'antiquated', 'convenient', 'costly'], correct: 1,
      skill: 'Whole-sentence clues', level: 'Hard / tricky',
      word: 'antiquated', meaning: 'old-fashioned; out of date',
      tip: 'An old system replaced by a new one becomes out of date. Nothing says the old system’s price increased.',
      explanation: 'Antiquated matches the old catalog after its replacement. Costly and convenient are possible descriptions, but they are not supported here.',
      selection: 'Chosen for an advanced answer word and for rejecting plausible but unstated associations, like the APPLICATIONS sentence.',
      related: [['2026-10-22', 39, 'APPLICATIONS sentence'], ['2026-09-27', 12, 'PRESTIGIOUS']],
      evidence: 'Recording around 00:41.8–00:42.1; answer key around 01:06.'
    },
    {
      source: 208, test: 2, number: 8, part: 'Synonyms', type: 'synonym',
      prompt: 'Which word is closest in meaning to DISCERN?',
      choices: ['detect', 'ignore', 'repair', 'summarize'], correct: 0,
      skill: 'Exact meaning and opposites', level: 'Hard / tricky',
      word: 'discern', meaning: 'notice or recognize something, especially with effort',
      tip: 'To discern a difference is to notice it. Ignore means not pay attention—the opposite action.',
      explanation: 'Detect is the closest meaning. Summarize means give the main points, and repair means fix something.',
      selection: 'A less automatic verb with an opposite distractor, directly testing whether Marco checks the action before answering.',
      related: [['2026-10-04', 10, 'DISCLOSE'], ['2026-10-04', 8, 'ASSAULT']],
      evidence: 'Recording around 00:40–00:41; answer key around 01:04–01:05.'
    },
    {
      source: 140, test: 1, number: 20, part: 'Sentence completion', type: 'sentence completion',
      prompt: 'The committee rejected the proposal because its rules seemed _______, changing from one case to the next without a clear reason.',
      choices: ['arbitrary', 'precise', 'familiar', 'generous'], correct: 0,
      skill: 'Whole-sentence clues', level: 'Hard',
      word: 'arbitrary', meaning: 'not based on a consistent reason or rule',
      tip: 'Use “without a clear reason,” not just “changing.” Arbitrary decisions lack a consistent basis.',
      explanation: 'Arbitrary fits rules that change without reason. Precise means exact; familiar means well known.',
      selection: 'Tests an abstract everyday-academic word through the definition embedded in the sentence, not simple positive/negative guessing.',
      related: [['2026-10-22', 39, 'APPLICATIONS sentence'], ['2026-10-04', 31, 'TRAITS sentence']],
      evidence: 'Recording around 00:12; answer independently checked against the visible “without a clear reason” clue.'
    }
  ];
  questions.forEach(q => { q.section = 'VR'; });
  root.KINDLE_VR_SELECTION = {
    title: 'Kindle Tests 1 & 2 · Hard & Tricky VR', date: '2026-10-24',
    reviewed: 80, selected: 24, synonyms: 15, completions: 9,
    note: '12 selected from each 40-question VR test (30% overall). These are editorial difficulty judgments, not official ratings. 23 are hard or precision-tricky estimates; the VERSATILE question is a deliberate targeted exception because Marco recently missed that exact skill and word. Some book distractors are easier than the hardest Test Innovators distractors. No claim is made that Marco will find every selected item difficult.',
    source: 'User-supplied recording of ISEE Middle Level Prep Book, Full-Length Practice Tests 1 and 2, Section 1. Wording and original choice order retained; blank lengths normalized. Teaching notes written for this practice.',
    questions
  };
  root.MARCO_ISEE_PRACTICE = [{ id: 'kindle-vr-tests-1-2-hard', number: 1, label: '24 selected hard and tricky questions', questions }];
  root.MARCO_TEST_REVIEW_SYNC_OPTIONS = {
    appId: 'marco-vr-kindle-tests1-2-hard-20261024-v1',
    savedMessage: 'Live online sync · Kindle VR answers saved online and on this device.',
    connectedMessage: 'Live online sync connected · Kindle VR progress syncs across devices.'
  };
})(window);
