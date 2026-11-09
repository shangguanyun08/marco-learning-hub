window.MARCO_ARCHIVE_METRICS = (() => {
  function canonical(word) {
    return word.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/’/g, "'").replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  }
  function create(dailyWords, earlierWords) {
    const daily = new Set(dailyWords.map(word => canonical(word.word)));
    const earlier = new Set(earlierWords.map(word => canonical(word.word)));
    const sharedCount = [...daily].filter(word => earlier.has(word)).length;

    function covered(word, scope) {
      const key = canonical(word.word);
      return daily.has(key) || (scope === 'both' && earlier.has(key));
    }
    function groupFor(word, scope) {
      if (word.confidentlyKnown) return 'known';
      if (word.restoredForReview) return 'review';
      return covered(word, scope) ? 'covered' : 'review';
    }
    function sourceLabels(word) {
      const key = canonical(word.word), labels = [];
      if (daily.has(key)) labels.push('Daily ' + daily.size);
      if (earlier.has(key)) labels.push('Earlier ' + earlier.size);
      return labels;
    }
    return {
      dailyCount: daily.size, earlierCount: earlier.size, sharedCount,
      uniqueCount: daily.size + earlier.size - sharedCount,
      covered, groupFor, sourceLabels,
    };
  }
  function correctRate(word) {
    const correct = word.correctTotal, total = correct + word.misses;
    return { correct, total, percent: total ? Math.round(100 * correct / total) : null };
  }
  function wordMetadata(word, metadata) {
    const saved = metadata.words[canonical(word.word)] || {};
    return { difficulty: saved.difficulty || 6, sources: saved.sources || [] };
  }
  function compareDifficulty(a, b, metadata) {
    const left = wordMetadata(a, metadata), right = wordMetadata(b, metadata);
    return left.difficulty - right.difficulty
      || Number(right.sources.length > 0) - Number(left.sources.length > 0)
      || (correctRate(b).percent ?? -1) - (correctRate(a).percent ?? -1)
      || a.word.localeCompare(b.word);
  }
  function sourceCounts(words, metadata) {
    const counts = { edubus: 0, mock: 0, testInnovators: 0, priority: 0 };
    for (const word of words) {
      const sources = wordMetadata(word, metadata).sources;
      if (sources.length) counts.priority++;
      for (const source of sources) counts[source]++;
    }
    return counts;
  }
  return { create, correctRate, wordMetadata, compareDifficulty, sourceCounts };
})();
