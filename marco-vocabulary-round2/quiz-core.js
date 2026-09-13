(function (root, factory) {
  const core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  else root.VocabularyQuiz = core;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const blank = () => ({version: 1, sessions: {}});
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
  function options(word, round, words) {
    const tokens = text => new Set(text.toLowerCase().match(/[a-z]{4,}/g) || []);
    const meaning = tokens(word.meaning);
    const eligible = candidate => {
      if (candidate.id === word.id || candidate.word.toLowerCase() === word.word.toLowerCase()) return false;
      if (word.meaning.toLowerCase().includes(candidate.word.toLowerCase())) return false;
      const other = tokens(candidate.meaning);
      const shared = [...other].filter(token => meaning.has(token)).length;
      return shared / Math.max(1, Math.min(meaning.size, other.size)) < 0.5;
    };
    let pool = words.filter(candidate => candidate.partOfSpeech === word.partOfSpeech && eligible(candidate));
    if (pool.length < 3) pool = words.filter(eligible);
    const seen = new Set();
    const distractors = [];
    for (const candidate of shuffled(pool, `${word.id}:${round}:distractors`)) {
      const name = candidate.word.toLowerCase();
      if (seen.has(name)) continue;
      seen.add(name);
      distractors.push(candidate);
      if (distractors.length === 3) break;
    }
    return shuffled([word, ...distractors], `${word.id}:${round}:positions`).map(item => item.id);
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
    if (!word || active.answers[id] || !options(word, active.number, words).includes(choice)) return false;
    active.answers[id] = {choice, correct: choice === id, at};
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
    const result = valid(left) ? copy(left) : blank();
    if (!valid(right)) return result;
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
  return {blank, valid, options, start, current, answer, advance, finishRound, score, merge};
});
