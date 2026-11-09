import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = { window: {} };
for (const file of ['./metrics.js', './word-metadata.js', '../meaning-check/round-2/data.js', '../combined-word-review/data.js', '../meaning-check/round-2/focused-review.js']) {
  vm.runInNewContext(await readFile(new URL(file, import.meta.url), 'utf8'), context);
}
const { create, correctRate, wordMetadata, compareDifficulty, sourceCounts } = context.window.MARCO_ARCHIVE_METRICS;
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
test('easy-to-hard ordering keeps difficulty first, then priority and saved success', () => {
  const metadata = { words: {
    plain: { difficulty: 1, sources: [] },
    priority: { difficulty: 1, sources: ['mock'] },
    successful: { difficulty: 1, sources: ['edubus'] },
    difficult: { difficulty: 4, sources: ['testInnovators'] },
  } };
  const words = [
    { word: 'difficult', correctTotal: 9, misses: 1 },
    { word: 'plain', correctTotal: 9, misses: 1 },
    { word: 'priority', correctTotal: 1, misses: 3 },
    { word: 'successful', correctTotal: 3, misses: 1 },
  ];
  words.sort((a, b) => compareDifficulty(a, b, metadata));
  assert.deepEqual(words.map(word => word.word), ['successful', 'priority', 'plain', 'difficult']);
  assert.equal(wordMetadata({ word: 'unlisted' }, metadata).difficulty, 6);
});
test('source totals count each priority word once while preserving source overlaps', () => {
  const metadata = { words: {
    alpha: { sources: ['edubus', 'mock'] },
    beta: { sources: ['testInnovators'] },
    gamma: { sources: [] },
  } };
  const counts = sourceCounts([{ word: 'alpha' }, { word: 'beta' }, { word: 'gamma' }], metadata);
  assert.equal(counts.edubus, 1); assert.equal(counts.mock, 1); assert.equal(counts.testInnovators, 1); assert.equal(counts.priority, 2);
  const saved = context.window.MARCO_ARCHIVE_WORD_META;
  assert.ok(saved.words.assault.sources.includes('testInnovators'));
  assert.ok(saved.words.amend.sources.includes('mock'));
  assert.ok(saved.words.abduct.sources.includes('edubus'));
  assert.ok(Object.values(saved.words).every(word => !word.difficulty || word.difficulty >= 1 && word.difficulty <= 5));
});

test('hard-to-easy ordering keeps unrated words last and priority first within each band', () => {
  const metadata = { words: {
    easy: { difficulty: 1, sources: [] },
    hard: { difficulty: 5, sources: [] },
    priority: { difficulty: 5, sources: ['mock'] },
    struggle: { difficulty: 5, sources: ['edubus'] },
  } };
  const words = [
    { word: 'easy', correctTotal: 0, misses: 1 },
    { word: 'unrated', correctTotal: 0, misses: 1 },
    { word: 'hard', correctTotal: 0, misses: 1 },
    { word: 'priority', correctTotal: 3, misses: 1 },
    { word: 'struggle', correctTotal: 0, misses: 1 },
  ];
  words.sort((a, b) => compareDifficulty(a, b, metadata, -1));
  assert.deepEqual(words.map(word => word.word), ['struggle', 'priority', 'hard', 'easy', 'unrated']);
});

test('a Zozeck-only mock word has no priority source', () => {
  const saved = context.window.MARCO_ARCHIVE_WORD_META;
  assert.equal(saved.words.advertisement.sources.length, 0);
  assert.ok(Object.values(saved.words).every(word => word.sources.every(source => ['edubus', 'mock', 'testInnovators'].includes(source))));
});
