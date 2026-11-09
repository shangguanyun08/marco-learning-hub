import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = { window: {} };
for (const file of ['./metrics.js', '../meaning-check/round-2/data.js', '../combined-word-review/data.js', '../meaning-check/round-2/focused-review.js']) {
  vm.runInNewContext(await readFile(new URL(file, import.meta.url), 'utf8'), context);
}
const { create, correctRate } = context.window.MARCO_ARCHIVE_METRICS;
const dailyWords = context.window.MARCO_FOCUSED_ROUND2.words;
const earlierWords = context.window.MARCO_WORD_REVIEW.words;
const metrics = create(dailyWords, earlierWords);

test('the current 716 already includes the original 299 and shares 417 with the earlier 820', () => {
  assert.equal(metrics.dailyCount, 716);
  assert.equal(metrics.earlierCount, 820);
  assert.equal(metrics.sharedCount, 417);
  assert.equal(metrics.uniqueCount, 1119);
  assert.ok(context.window.MARCO_FOCUSED_REVIEW.wordIds.every(id => dailyWords.some(word => word.id === id)));
});
test('coverage keeps known and manually restored words in their chosen lists', () => {
  const fixture = create([{ word: 'naive' }], [{ word: 'naïve' }, { word: 'extra' }]);
  assert.equal(fixture.uniqueCount, 2);
  assert.equal(fixture.groupFor({ word: 'NAÏVE' }, 'daily'), 'covered');
  assert.equal(fixture.groupFor({ word: 'naïve (trusting)' }, 'daily'), 'covered');
  assert.equal(fixture.groupFor({ word: 'extra' }, 'daily'), 'review');
  assert.equal(fixture.groupFor({ word: 'extra' }, 'both'), 'covered');
  assert.equal(fixture.groupFor({ word: 'naive', confidentlyKnown: true }, 'both'), 'known');
  assert.equal(fixture.groupFor({ word: 'naive', restoredForReview: true }, 'both'), 'review');
  assert.equal(fixture.groupFor({ word: 'outside' }, 'both'), 'review');
});
test('each correct rate includes wrong and unknown records and handles an empty record', () => {
  assert.equal(correctRate({ correctTotal: 3, misses: 5 }).percent, 38);
  assert.equal(correctRate({ correctTotal: 3, misses: 5 }).total, 8);
  assert.equal(correctRate({ correctTotal: 0, misses: 4 }).percent, 0);
  assert.equal(correctRate({ correctTotal: 2, misses: 1 }).percent, 67);
  assert.equal(correctRate({ correctTotal: 0, misses: 0 }).percent, null);
});
