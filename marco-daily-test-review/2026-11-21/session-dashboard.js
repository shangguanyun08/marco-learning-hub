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
