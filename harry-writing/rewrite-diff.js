(function (root) {
  'use strict';

  function rewriteDiff(original, revised) {
    const tokens = text => text.match(/\s+|[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*|[^\s]/gu) || [];
    const before = tokens(original), after = tokens(revised);
    const lengths = Array.from({ length: before.length + 1 }, () => new Uint16Array(after.length + 1));

    for (let i = before.length - 1; i >= 0; i--) {
      for (let j = after.length - 1; j >= 0; j--) {
        lengths[i][j] = before[i] === after[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
      }
    }

    const changes = [];
    function append(kind, text) {
      const previous = changes.at(-1);
      if (previous?.kind === kind) previous.text += text;
      else changes.push({ kind, text });
    }

    let i = 0, j = 0;
    while (i < before.length || j < after.length) {
      if (i < before.length && j < after.length && before[i] === after[j]) {
        append('equal', after[j]);
        i++;
        j++;
      } else if (j < after.length && (i === before.length || lengths[i][j + 1] > lengths[i + 1][j])) {
        append('add', after[j]);
        j++;
      } else {
        append('remove', before[i]);
        i++;
      }
    }
    return changes;
  }

  if (typeof module === 'object' && module.exports) module.exports = rewriteDiff;
  else root.WritingRewriteDiff = rewriteDiff;
})(globalThis);
