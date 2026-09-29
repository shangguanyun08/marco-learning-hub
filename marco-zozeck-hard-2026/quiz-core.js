(function (root, factory) {
  const core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  else root.VocabularyQuiz = core;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const blank = () => ({version: 1, layoutVersion: 2, sessions: {}});
  let layout = null;
  function configureLayout(words) {
    layout = Array.from({length:Math.max(...words.map(word => word.session))}, (_,i) => words.filter(w => w.session === i+1).map(w => w.id));
  }
  function migrate(value) {
    if (!valid(value) || value.layoutVersion === 2 || !layout) return value;
    const migrated = blank();
    const firstAnswers = {};
    for (const record of Object.values(value.sessions)) {
      Object.assign(firstAnswers, record.rounds?.[0]?.answers || {});
    }
    // Preserve any older scored history verbatim; carry first tries by word ID.
    if (Object.values(value.sessions).some(s => s.rounds?.some(r => r.finishedAt))) migrated.previousLayout = copy(value.sessions);
    layout.forEach((ids,index) => {
      const answers = Object.fromEntries(ids.filter(id => firstAnswers[id]).map(id => [id,copy(firstAnswers[id])]));
      if (!value.sessions[index+1] && !Object.keys(answers).length) return;
      const at = value.sessions[index+1]?.rounds?.[0]?.startedAt || Object.values(answers)[0]?.at;
      migrated.sessions[index+1] = {rounds:[{...round(1,ids,at),answers}],completedAt:null};
    });
    return migrated;
  }
  const valid = value => value?.version === 1 && value.sessions && typeof value.sessions === 'object' && !Array.isArray(value.sessions);
  const hash = text => [...text].reduce((n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  function shuffled(items, seed) {
    const result = [...items];
    let n = hash(seed);
    for (let i = result.length - 1; i > 0; i--) {
      n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
      const j = n % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  const questionOrder = (ids, session, number) => shuffled([...ids].sort(), `isee-mixed-questions-v2:${session}:${number}`);
  function options(word, round, words, session) {
    const reviewSalt = Number(session) === 6 ? 'review:' : '';
    if (Array.isArray(word.choices)) {
      return shuffled([...word.choices], `${reviewSalt}${word.id}:${round}:source-choices`);
    }
    // Exclude close meanings even when the source uses different synonym wording.
    const families = [
      'Abundant Ample Adequate', 'Abrupt Concise', 'Advisable Wary',
      'Amiable Hospitable Humane Jovial Buoyant Enthusiastic',
      'Ardent Enthusiastic Devout', 'Barren Vacant Arid',
      'Corrosive Toxic Vile Wretched', 'Decent Respectable Timid',
      'Competent Eligible Effective Prosperous', 'Grave Sullen Aloof',
      'Exaggerated Gaudy', 'Gaudy Ornate Intricate',
      'Meager Scarce Exclusive', 'Novel Unique Initial',
      'Resourceful Witty Sly Stealthy', 'Solitary Exclusive Stealthy',
      'Legible Visible', 'Controversial Divisive', 'Strenuous Cumbersome Intricate',
      'Abbreviate Diminish Recede Wane', 'Adorn Restore Upholster',
      'Affirm Certify Vouch Clinch', 'Appease Pacify Indulge Nourish',
      'Boast Gloat', 'Bombard Pulverize Grapple',
      'Cherish Revere', 'Confer Impart', 'Deprive Omit Discard Veto Repeal',
      'Depart Evict Extract', 'Detain Quarantine Stifle Subdue',
      'Frustrate Incense Pester Perturb Provoke',
      'Integrate Naturalize Splice Transform', 'Intrude Tamper Distort',
      'Impart Signify Pantomime', 'Quake Rouse',
      'Agenda Strategy Technique', 'Anatomy Classification',
      'Blight Lapse Hindrance Predicament Nuisance', 'Calamity Epidemic Ailment',
      'Deduction Inference Verdict Revelation', 'Dialogue Transmission Lecture Prose',
      'Incentive Inspiration Zeal', 'Fortitude Vigor', 'Abode Facility Sanctuary',
      'Annex Fixture', 'Cruelty Disdain Wrath Woe', 'Fugitive Renegade Nomad',
      'Depiction Mosaic Spectacle', 'Custom Tendency', 'Kin Pedigree'
    ].map(group => group.toLowerCase().split(' '));
    const tokens = text => new Set(text.toLowerCase().match(/[a-z]{4,}/g) || []);
    const meaning = tokens(word.meaning);
    const eligible = candidate => {
      if (candidate.id === word.id || candidate.word.toLowerCase() === word.word.toLowerCase()) return false;
      if (word.meaning.toLowerCase().includes(candidate.word.toLowerCase())) return false;
      if (candidate.meaning.toLowerCase().includes(word.word.toLowerCase())) return false;
      if (families.some(group => group.includes(word.word.toLowerCase()) && group.includes(candidate.word.toLowerCase()))) return false;
      const other = tokens(candidate.meaning);
      const shared = [...other].filter(token => meaning.has(token)).length;
      return shared === 0;
    };
    const definitionWords = words.filter(candidate => candidate.quizType !== 'synonym');
    let pool = definitionWords.filter(candidate => candidate.partOfSpeech === word.partOfSpeech && eligible(candidate)).sort((a,b) => a.number-b.number);
    if (pool.length < 3) pool = definitionWords.filter(eligible).sort((a,b) => a.number-b.number);
    const seen = new Set();
    const distractors = [];
    for (const candidate of shuffled(pool, `${reviewSalt}${word.id}:${round}:distractors`)) {
      const name = candidate.word.toLowerCase();
      if (seen.has(name)) continue;
      seen.add(name);
      distractors.push(candidate);
      if (distractors.length === 3) break;
    }
    return shuffled([word, ...distractors], `${reviewSalt}${word.id}:${round}:positions`).map(item => item.id);
  }
  function round(number, ids, at) {
    return {number, ids: [...ids], answers: {}, position: 0, startedAt: at, finishedAt: null};
  }
  function start(progress, session, ids, at) {
    if (progress.sessions[session]) return false;
    progress.sessions[session] = {rounds: [round(1, ids, at)], completedAt: null};
    return true;
  }
  const current = session => session?.rounds?.at(-1);
  function answer(progress, session, choice, words, at, questionId) {
    const record = progress.sessions[session];
    const active = current(record);
    if (!active || record.completedAt || active.finishedAt) return false;
    const id = questionId ?? active.ids[active.position];
    if (!active.ids.includes(id)) return false;
    const word = words.find(item => item.id === id);
    if (!word || active.answers[id] || !options(word, active.number, words, session).includes(choice)) return false;
    active.answers[id] = {choice, correct: Array.isArray(word.choices) ? choice === word.answer : choice === id, at};
    return true;
  }
  function advance(progress, session, at) {
    const record = progress.sessions[session];
    const active = current(record);
    if (!active || record.completedAt || !active.answers[active.ids[active.position]]) return false;
    if (active.position < active.ids.length - 1) {
      active.position++;
      return 'next';
    }
    return finishRound(progress, session, at);
  }
  function finishRound(progress, session, at) {
    const record = progress.sessions[session];
    const active = current(record);
    if (!active || record.completedAt || active.finishedAt || !active.ids.every(id => active.answers[id])) return false;
    active.position = active.ids.length - 1;
    active.finishedAt = at;
    const missed = active.ids.filter(id => !active.answers[id].correct);
    if (missed.length) record.rounds.push(round(active.number + 1, missed, at));
    else record.completedAt = at;
    return missed.length ? 'round' : 'complete';
  }
  const score = progress => Object.values(progress?.sessions || {}).reduce((sum, session) => sum + (session.rounds || []).reduce((total, r) => total + Object.keys(r.answers || {}).length + (r.finishedAt ? 1 : 0), 0), 0);
  // Shared saves may arrive out of order. Keep immutable answers from both devices.
  function merge(left, right) {
    left = migrate(left);
    right = migrate(right);
    const result = valid(left) ? copy(left) : blank();
    if (!valid(right)) return result;
    if (right.previousLayout && !result.previousLayout) result.previousLayout = copy(right.previousLayout);
    for (const [key, incoming] of Object.entries(right.sessions)) {
      if (!Array.isArray(incoming.rounds)) continue;
      const existing = result.sessions[key];
      if (!existing) { result.sessions[key] = copy(incoming); continue; }
      for (const source of incoming.rounds) {
        const target = existing.rounds.find(r => r.number === source.number);
        if (!target) { existing.rounds.push(copy(source)); continue; }
        for (const [id, value] of Object.entries(source.answers)) {
          const prior = target.answers[id];
          if (!prior || value.at < prior.at || (value.at === prior.at && value.choice < prior.choice)) target.answers[id] = copy(value);
        }
        target.position = Math.max(target.position, source.position);
        target.finishedAt ||= source.finishedAt;
      }
      existing.rounds.sort((a, b) => a.number - b.number);
      existing.completedAt ||= incoming.completedAt;
      // Rebuild later rounds from the previous round's misses after a conflict.
      existing.completedAt = null;
      for (let i = 0; i < existing.rounds.length; i++) {
        const target = existing.rounds[i];
        if (i) {
          const prior = existing.rounds[i - 1];
          target.ids = prior.ids.filter(id => prior.answers[id] && !prior.answers[id].correct);
          target.answers = Object.fromEntries(Object.entries(target.answers).filter(([id]) => target.ids.includes(id)));
        }
        const firstUnanswered = target.ids.findIndex(id => !target.answers[id]);
        target.position = Math.min(target.position, firstUnanswered < 0 ? target.ids.length - 1 : firstUnanswered);
        if (firstUnanswered >= 0) target.finishedAt = null;
        if (!target.finishedAt) { existing.rounds.length = i + 1; break; }
        if (target.ids.every(id => target.answers[id].correct)) {
          existing.completedAt = target.finishedAt;
          existing.rounds.length = i + 1;
          break;
        }
      }
    }
    return result;
  }
  return {blank, valid, configureLayout, questionOrder, options, start, current, answer, advance, finishRound, score, merge};
});
