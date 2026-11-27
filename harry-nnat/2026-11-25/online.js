(() => {
  const bucket = 'zozeck-mock-2026-11-25-round-2';
  const letters = 'ABCDE';
  const asState = runs => ({ version: 1, articles: runs.length ? { [bucket]: runs } : {} });
  const runsOf = state => window.NNATSync.normalize(state).articles[bucket] || [];

  function encode(records) {
    const runs = [];
    for (const [id, record] of records) {
      if (!record.selected && !record.attempts.length && !record.reviewed && !record.reviewedAt) continue;
      runs.push({
        id,
        updatedAt: [record.selectedAt, record.reviewedAt].filter(Boolean).sort().at(-1) || null,
        answers: { [id]: record.attempts.map(letter => ({ choice: letters.indexOf(letter) })) },
        drafts: {
          selection: { value: record.selected, updatedAt: record.selectedAt },
          reviewed: { value: record.reviewed, updatedAt: record.reviewedAt },
        },
      });
    }
    return asState(runs);
  }

  function decode(questions, runs) {
    const byQuestion = new Map();
    for (const run of runs) {
      const id = run.syncRoot || run.id;
      if (!Object.hasOwn(questions, id)) continue;
      const attempts = (run.answers[id] || []).map(answer => letters[answer.choice]);
      const done = attempts.includes(questions[id].answer) || attempts.length === 2;
      const versions = byQuestion.get(id) || [];
      versions.push({ run, attempts, done });
      byQuestion.set(id, versions);
    }
    const records = new Map();
    for (const [id, versions] of byQuestion) {
      // Different first checks are separate histories. Show a finished history
      // before an unfinished one, and keep both in the synchronized archive.
      versions.sort((a, b) =>
        Number(b.done) - Number(a.done) ||
        b.attempts.length - a.attempts.length ||
        (b.run.updatedAt || '').localeCompare(a.run.updatedAt || '') ||
        a.run.id.localeCompare(b.run.id),
      );
      const { run, attempts } = versions[0];
      const marks = versions.map(version => version.run.drafts.reviewed).filter(Boolean);
      marks.sort((a, b) =>
        (b.updatedAt || '').localeCompare(a.updatedAt || '') || Number(b.value) - Number(a.value),
      );
      records.set(id, {
        attempts,
        selected: run.drafts.selection?.value || '',
        selectedAt: run.drafts.selection?.updatedAt || null,
        reviewed: marks[0]?.value === true,
        reviewedAt: marks[0]?.updatedAt || null,
      });
    }
    return records;
  }

  function create({ questions, records, restore, readArchive, writeArchive, onStatus, deviceId, fetcher }) {
    const { merge, stable, create: sharedSync } = window.NNATSync;
    let archive = asState(runsOf(readArchive()));
    return sharedSync({
      deviceId,
      fetcher,
      onStatus,
      getState: () => merge(merge(archive, asState(runsOf(readArchive()))), encode(records())),
      applyState: merged => {
        const runs = runsOf(merged);
        const next = asState(runs);
        if (stable(next) !== stable(archive)) {
          archive = next;
          writeArchive(archive);
        }
        restore(decode(questions, runs));
      },
    });
  }

  window.NNATMockOnline = { create };
})();
