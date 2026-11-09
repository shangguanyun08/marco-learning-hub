(function (root) {
  'use strict';
  function analyze(text, feedback, corrected = '', changes = []) {
    const notes = [];
    if (Array.isArray(feedback?.annotations) && feedback.annotations.length) {
      for (const item of feedback.annotations) {
        if (typeof item.quote !== 'string' || typeof item.suggestion !== 'string') continue;
        notes.push({ quote: item.quote, suggestion: item.suggestion, start: text.indexOf(item.quote) });
      }
    } else {
      for (const line of String(feedback?.nextStep || '').replace(/([.!?])\s+(?=[A-Z])/g, '$1\n').split(/\r?\n/).filter(line => line.trim())) {
        const suggestion = line.replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/, '').trim();
        const quotes = Array.from(suggestion.matchAll(/[“"]([^”"]+)[”"]/g), match => match[1]);
        const anchors = [...new Set(quotes.filter(value => text.includes(value)))];
        if (!anchors.length) notes.push({ quote: '', suggestion, start: -1 });
        for (const quote of anchors) notes.push({ quote, suggestion, start: text.indexOf(quote) });
      }
    }
    const ranges = [];
    notes.forEach((note, index) => {
      note.index = index;
      note.end = note.start < 0 ? -1 : note.start + note.quote.length;
      if (note.start >= 0 && note.quote && !ranges.some(range => note.start < range.end && note.end > range.start)) ranges.push(note);
    });
    ranges.sort((a, b) => a.start - b.start);
    if (corrected) {
      for (const note of notes) {
        if (note.start < 0) continue;
        let before = 0, after = 0, position = corrected.length;
        for (const change of changes) {
          const sourceLength = change.kind === 'add' ? 0 : change.text.length;
          if (sourceLength && note.start < before + sourceLength) {
            position = after + (change.kind === 'equal' ? note.start - before : 0);
            break;
          }
          before += sourceLength;
          if (change.kind !== 'remove') after += change.text.length;
        }
        const sentence = Array.from(corrected.matchAll(/[^.!?\n]+[.!?]?/g)).find(match => position >= match.index && position < match.index + match[0].length);
        if (sentence) note.correction = sentence[0].trim();
      }
    }
    return { notes, ranges };
  }
  if (typeof module === 'object' && module.exports) module.exports = analyze;
  else root.WritingInlineFeedback = analyze;
})(typeof window === 'object' ? window : this);
