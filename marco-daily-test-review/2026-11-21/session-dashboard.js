(function (root) {
  'use strict';
  const cards = root.MarcoMathSessionCards;
  const courses = {
    'nov21-review': {
      appId: 'marco-math-nov21-official-middle-v1', session: 'official-middle-nov21-review-v1', reportAfter: 5,
      keys: {
        'qr18': 3, 'qr37': 2, 'ma25': 3, 'ma46': 3, 'ma47': 0
      }
    },
    'nov21-1': {
      appId: 'marco-math-nov21-session1-v1', session: 'official-middle-nov21-session1-v1', reportAfter: 20,
      keys: {
        'scale-1': 1, 'power-1': 2, 'fee-1': 0, 'stack-1': 3, 'slope-1': 1,
        'scale-2': 0, 'power-2': 3, 'fee-2': 2, 'stack-2': 1, 'slope-2': 0,
        'scale-3': 3, 'power-3': 0, 'fee-3': 1, 'stack-3': 2, 'slope-3': 3,
        'scale-4': 2, 'power-4': 0, 'fee-4': 1, 'stack-4': 3, 'slope-4': 2
      }
    },
    'nov21-2': {
      appId: 'marco-math-nov21-session2-v1', session: 'official-middle-nov21-session2-v1', reportAfter: 20,
      keys: {
        'scale-1': 2, 'power-1': 0, 'fee-1': 3, 'stack-1': 1, 'slope-1': 1,
        'scale-2': 2, 'power-2': 0, 'fee-2': 3, 'stack-2': 0, 'slope-2': 2,
        'scale-3': 1, 'power-3': 3, 'fee-3': 3, 'stack-3': 0, 'slope-3': 2,
        'scale-4': 1, 'power-4': 0, 'fee-4': 2, 'stack-4': 1, 'slope-4': 3
      }
    },
    'nov21-3': {
      appId: 'marco-math-nov21-session3-v1', session: 'official-middle-nov21-session3-v1', reportAfter: 20,
      keys: {
        'scale-1': 0, 'power-1': 3, 'fee-1': 1, 'stack-1': 2, 'slope-1': 0,
        'scale-2': 2, 'power-2': 3, 'fee-2': 1, 'stack-2': 0, 'slope-2': 3,
        'scale-3': 2, 'power-3': 1, 'fee-3': 2, 'stack-3': 0, 'slope-3': 3,
        'scale-4': 2, 'power-4': 1, 'fee-4': 3, 'stack-4': 0, 'slope-4': 1
      }
    },
    'nov21-4': {
      appId: 'marco-math-nov21-session4-v1', session: 'official-middle-nov21-session4-v1', reportAfter: 10,
      keys: {
        'slope-1': 2, 'scale-1': 0, 'slope-2': 3, 'fee-1': 1, 'slope-3': 0,
        'slope-4': 3, 'scale-2': 1, 'slope-5': 2, 'fee-2': 2, 'slope-6': 0
      }
    },
    'nov21-5': {
      appId: 'marco-math-nov21-session5-v1', session: 'official-middle-nov21-session5-v1', reportAfter: 6,
      keys: {
        'slope-1': 1, 'scale-1': 2, 'slope-2': 3, 'scale-2': 0, 'slope-3': 1, 'slope-4': 3
      }
    },
    'nov21-6': {
      appId: 'marco-math-nov21-session6-v1', session: 'official-middle-nov21-session6-v1', reportAfter: 6,
      keys: {
        'slope-1': 2, 'scale-1': 0, 'slope-2': 1, 'scale-2': 3, 'slope-3': 2, 'slope-4': 0
      }
    },
    'nov21-7': {
      appId: 'marco-math-nov21-session7-v1', session: 'official-middle-nov21-session7-v1', reportAfter: 8,
      keys: {
        'redo-qr18': 3, 'redo-qr20': 3, 'overlap-1': 1, 'volume-1': 2,
        'overlap-2': 2, 'volume-2': 0, 'overlap-3': 0, 'volume-3': 1
      }
    },
    'nov21-8': {
      appId: 'marco-math-nov21-session8-v1', session: 'official-middle-nov21-session8-v1', reportAfter: 20,
      keys: {
        'redo-qr3': 2, 'redo-qr7': 3, 'redo-qr8': 3, 'redo-qr20': 0, 'redo-qr21': 0,
        'redo-qr26': 2, 'redo-qr31': 3, 'redo-qr32': 2, 'redo-qr33': 3, 'redo-qr34': 1, 'redo-qr35': 3,
        'rates-1': 1, 'nets-1': 2, 'median-1': 2, 'cost-1': 0, 'lengths-1': 1,
        'decimals-1': 1, 'multiples-1': 3, 'probability-1': 2, 'slope-1': 0
      }
    },
    'nov21-9': {
      appId: 'marco-math-nov21-session9-v1', session: 'official-middle-nov21-session9-v1', reportAfter: 12,
      keys: {
        'rates-1': 2, 'median-1': 3, 'probability-1': 2, 'slope-1': 1,
        'rates-2': 3, 'median-2': 0, 'probability-2': 0, 'slope-2': 2,
        'rates-3': 1, 'median-3': 3, 'probability-3': 1, 'slope-3': 0
      }
    },
    'nov21-10': {
      appId: 'marco-math-nov21-session10-v1', session: 'official-middle-nov21-session10-v1', reportAfter: 9,
      keys: {
        'median-1': 1, 'probability-1': 2, 'slope-1': 2,
        'median-2': 2, 'probability-2': 0, 'slope-2': 0,
        'median-3': 3, 'probability-3': 1, 'slope-3': 0
      }
    },
    'nov21-11': {
      appId: 'marco-math-nov21-session11-v1', session: 'official-middle-nov21-session11-v1', reportAfter: 2,
      keys: {'slope-1': 1, 'leftward-change': 3}
    },
    'nov21-12': {
      appId: 'marco-math-nov21-session12-v1', session: 'official-middle-nov21-session12-v1', reportAfter: 8,
      keys: {graph: 0, points: 1, table: 2, equation: 3, compare: 0, missing: 2, rate: 3, triangles: 1}
    },
  };

  function formatStatus(stats) {
    if (!stats.complete) return cards.statusText(stats);
    const percent = Math.round(100 * stats.first / stats.total);
    return `✓ Finished · ${stats.first}/${stats.total} (${percent}%) first try`;
  }

  function paintActive(card, stats, syncStatus) {
    const available = stats.answered > 0 || !['connecting', 'offline'].includes(syncStatus);
    const message = available ? formatStatus(stats) :
      syncStatus === 'offline' ? 'Score unavailable · Reconnect to sync' : 'Loading saved score…';
    cards.paintCard(card, {...stats, ready: stats.complete}, message, available);
  }

  root.MarcoNov21SessionCards = {courses, paintActive, controller: cards.mount({courses, formatStatus})};
})(window);
