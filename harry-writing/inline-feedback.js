(function (root) {
  'use strict';
  function analyze(text, feedback) {
    const notes = [];
    if (Array.isArray(feedback?.annotations) && feedback.annotations.length) {
      for (const item of feedback.annotations) {
        if (typeof item.quote !== 'string' || typeof item.suggestion !== 'string') continue;
        notes.push({ quote: item.quote, suggestion: item.suggestion, start: text.indexOf(item.quote) });
      }
    } else {
      for (const line of String(feedback?.nextStep || '').split(/\r?\n/).filter(line => line.trim())) {
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
    return { notes, ranges };
  }
  if (typeof module === 'object' && module.exports) module.exports = analyze;
  else root.WritingInlineFeedback = analyze;
})(typeof window === 'object' ? window : this);
