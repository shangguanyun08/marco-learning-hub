(function (root) {
  'use strict';
  const dateFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
  });

  function latest(work) {
    const drafts = Object.entries(work?.drafts || {}).filter(([id, row]) => Number(row.sentence_id ?? id) > 0);
    const timestamps = drafts.flatMap(([, row]) => [row.edited_at, row.updated_at]);
    for (const revision of work?.revisions || []) {
      if (revision.kind === 'revision') timestamps.push(revision.checked_at);
    }
    const dates = timestamps.map(value => Date.parse(value)).filter(Number.isFinite);
    return dates.length ? new Date(Math.max(...dates)).toISOString() : null;
  }

  function render(host, timestamp, emptyMessage = 'Not started yet') {
    host.replaceChildren();
    if (!timestamp) { host.textContent = emptyMessage; return; }
    const time = document.createElement('time');
    time.dateTime = timestamp;
    time.textContent = dateFormat.format(new Date(timestamp));
    host.append('Last wrote · ', time);
  }

  const activity = { latest, render };
  if (typeof module === 'object' && module.exports) module.exports = activity;
  else root.WritingActivity = activity;
})(globalThis);
