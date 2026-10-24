(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const time = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  const tones = ['', 'good', 'bad', 'neutral', 'unsure'];
  const strengths = ['', 'strong', 'weak', 'neither', 'unsure'];
  const links = ['', 'same', 'opposite', 'unsure'];
  const fields = n => object(n) && typeof n.prediction === 'string' && n.prediction.length <= 160 && tones.includes(n.tone) && strengths.includes(n.strength) && links.includes(n.link);
  function make(at = new Date().toISOString(), id = root.crypto.randomUUID()) {
    return { prediction: '', tone: '', strength: '', link: '', committed: null, eliminated: [], updatedAt: at, eventId: id };
  }
  function valid(n) {
    return fields(n) && time(n.updatedAt) && typeof n.eventId === 'string' && n.eventId.length <= 100 &&
      (n.legacySeen === undefined || typeof n.legacySeen === 'boolean') &&
      (n.committed === null || (fields(n.committed) && time(n.committed.at) && typeof n.committed.id === 'string')) &&
      Array.isArray(n.eliminated) && n.eliminated.length <= 2 && new Set(n.eliminated).size === n.eliminated.length && n.eliminated.every(i => Number.isInteger(i) && i >= 0 && i < 4);
  }
  function ready(q, n) {
    return !!n?.prediction?.trim() && (q.type === 'synonym' ? !!n.tone && !!n.strength : !!n.link);
  }
  function touch(n, patch = {}, at = new Date().toISOString(), id = root.crypto.randomUUID()) {
    return Object.assign(n, patch, { updatedAt: at, eventId: id });
  }
  function commit(q, n, at = new Date().toISOString(), id = root.crypto.randomUUID()) {
    if (n.committed || !ready(q, n)) return false;
    n.committed = { prediction: n.prediction.trim(), tone: n.tone, strength: n.strength, link: n.link, at, id };
    touch(n, {}, at, id); return true;
  }
  function merge(a, b) {
    if (!a) return clone(b); if (!b) return clone(a);
    const ordered = [a, b].sort((x, y) => (x.updatedAt + '|' + x.eventId).localeCompare(y.updatedAt + '|' + y.eventId));
    const result = clone(ordered[1]);
    const snapshots = [a.committed, b.committed].filter(Boolean).sort((x, y) => (x.at + '|' + x.id).localeCompare(y.at + '|' + y.id));
    result.committed = snapshots.length ? clone(snapshots[0]) : null;
    if (a.legacySeen || b.legacySeen) result.legacySeen = true;
    result.eliminated.sort((x, y) => x - y);
    return result;
  }
  root.KindleVRThinking = { make, valid, ready, touch, commit, merge };
})(typeof window === 'undefined' ? globalThis : window);
