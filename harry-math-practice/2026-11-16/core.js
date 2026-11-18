(function (root) {
  'use strict';
  const session = root.HarryFractionSession || {};
  const APP_ID = session.appId || 'harry-math-fractions-20261116-v1';
  const SESSION_ID = session.sessionId || '2026-11-16';
  const SESSION_LABEL = session.label || 'November 16';
  const questions = session.questions || [
    {id: 'f1', prompt: '6 1/5 + 2 4/9', answer: '8 29/45', value: [389, 45], explanation: 'Use forty-fifths: 1/5 = 9/45 and 4/9 = 20/45. Add the whole numbers and fractions: 6 + 2 + 29/45 = 8 29/45.'},
    {id: 'f2', prompt: '23 5/12 − 13 7/12', answer: '9 5/6', value: [59, 6], explanation: 'Regroup 23 5/12 as 22 17/12. Then 22 17/12 − 13 7/12 = 9 10/12. Simplify 10/12 to 5/6.'},
    {id: 'f3', prompt: '4 − 1 2/5', answer: '2 3/5', value: [13, 5], explanation: 'Regroup 4 as 3 5/5. Subtract 1 2/5: the whole part is 2 and the fractional part is 3/5.'},
    {id: 'f4', prompt: '7 1/2 − 3 2/3', answer: '3 5/6', value: [23, 6], explanation: 'Use sixths: 7 3/6 − 3 4/6. Regroup 7 3/6 as 6 9/6. Now subtract to get 3 5/6.'},
    {id: 'f5', prompt: '4 1/4 − 2 5/8', answer: '1 5/8', value: [13, 8], explanation: 'Change 1/4 to 2/8. Regroup 4 2/8 as 3 10/8. Then 3 10/8 − 2 5/8 = 1 5/8.'}
  ];
  const ids = questions.map(question => question.id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const empty = () => ({version: 1, sessionId: SESSION_ID, first: null, retry: null, conflicts: []});

  function parse(text) {
    if (typeof text !== 'string' || text.length > 60) return null;
    const glyphs = {'½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4', '⅚': '5/6', '⅛': '1/8', '⅝': '5/8'};
    const normalized = text.replace(/[½⅓⅔¼¾⅚⅛⅝]/g, glyph => ' ' + glyphs[glyph])
      .normalize('NFKC').replace(/⁄/g, '/').replace(/(\d+)\s*\(\s*(\d+\s*\/\s*\d+)\s*\)/g, '$1 $2').trim();
    const mixed = normalized.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    const fraction = normalized.match(/^(\d+)\s*\/\s*(\d+)$/);
    let numerator, denominator;
    if (mixed) {
      denominator = Number(mixed[3]);
      numerator = Number(mixed[1]) * denominator + Number(mixed[2]);
    } else if (fraction) {
      numerator = Number(fraction[1]);
      denominator = Number(fraction[2]);
    } else if (/^\d+$/.test(normalized)) {
      numerator = Number(normalized);
      denominator = 1;
    } else return null;
    if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator < 1 || numerator > 1000000 || denominator > 1000000) return null;
    return [numerator, denominator];
  }

  function correct(question, text) {
    const value = parse(text);
    return Boolean(value && value[0] * question.value[1] === question.value[0] * value[1]);
  }

  const missed = state => state.first ? questions.filter(question => !correct(question, state.first.answers[question.id])) : [];
  function validBatch(batch, required, parentId) {
    return object(batch) && typeof batch.id === 'string' && batch.id.length > 5 && batch.id.length < 120 &&
      typeof batch.at === 'string' && Number.isFinite(Date.parse(batch.at)) && object(batch.answers) &&
      Object.keys(batch.answers).length === required.length && required.every(id => parse(batch.answers[id])) &&
      (parentId === undefined || batch.parentId === parentId);
  }

  function valid(state) {
    if (!object(state) || state.version !== 1 || state.sessionId !== SESSION_ID || !Array.isArray(state.conflicts) || state.conflicts.length > 20) return false;
    if (state.first !== null && !validBatch(state.first, ids)) return false;
    if (state.retry !== null && (!state.first || !missed(state).length || !validBatch(state.retry, missed(state).map(question => question.id), state.first.id))) return false;
    return state.conflicts.every(item => object(item) && ['first', 'retry'].includes(item.kind) &&
      validBatch(item.batch, item.kind === 'first' ? ids : Object.keys(item.batch?.answers || {})) &&
      Object.keys(item.batch.answers).every(id => ids.includes(id)));
  }

  function submit(state, answers, at, id) {
    if (!valid(state) || state.retry || state.first && !missed(state).length) return false;
    const required = state.first ? missed(state).map(question => question.id) : ids;
    const batch = {id, at, answers: clone(answers)};
    if (state.first) batch.parentId = state.first.id;
    if (!validBatch(batch, required, state.first?.id)) return false;
    if (state.first) state.retry = batch;
    else state.first = batch;
    return true;
  }

  function merge(local, remote) {
    const out = empty();
    out.first = clone(remote.first || local.first);
    const conflicts = [...local.conflicts, ...remote.conflicts];
    if (local.first && remote.first && JSON.stringify(local.first) !== JSON.stringify(remote.first)) conflicts.push({kind: 'first', batch: local.first});
    for (const source of [remote, local]) {
      if (!source.retry) continue;
      if (!out.retry && source.retry.parentId === out.first?.id) out.retry = clone(source.retry);
      else if (JSON.stringify(source.retry) !== JSON.stringify(out.retry)) conflicts.push({kind: 'retry', batch: source.retry});
    }
    const retained = new Map();
    for (const item of conflicts) {
      if (item.batch.id === out.first?.id || item.batch.id === out.retry?.id) continue;
      retained.set(item.kind + ':' + item.batch.id, clone(item));
    }
    out.conflicts = [...retained.values()].sort((a, b) => a.batch.id.localeCompare(b.batch.id));
    return out;
  }

  const score = state => state.first ? questions.filter(question => correct(question, state.first.answers[question.id])).length : 0;
  const progressScore = state => (state.first ? 5 : 0) + (state.retry ? Object.keys(state.retry.answers).length : 0);
  const api = {APP_ID, SESSION_ID, SESSION_LABEL, questions, empty, parse, correct, missed, valid, submit, merge, score, progressScore};
  if (typeof module !== 'undefined') module.exports = api;
  else root.HarryFractionReview = api;
})(typeof window === 'undefined' ? globalThis : window);
