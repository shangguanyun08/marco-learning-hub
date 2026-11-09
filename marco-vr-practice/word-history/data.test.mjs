import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(await readFile(new URL('./data.js', import.meta.url), 'utf8'), context);
const words = context.window.MARCO_PRIORITY_WORDS;

test('the fixed priority list has exactly 298 unique words and archive IDs', () => {
  assert.equal(words.length, 298);
  assert.equal(new Set(words.map(word => word.word)).size, 298);
  assert.equal(new Set(words.map(word => word.id)).size, 298);
  assert.ok(words.every(word => word.id.startsWith('archive-') && word.difficulty >= 1 && word.difficulty <= 5));
});
test('each meaning is one word or one short phrase', () => {
  assert.ok(words.every(word => word.meaning.trim() && word.meaning.split(/\s+/).length <= 4));
  assert.ok(words.every(word => !/[,;\/]/.test(word.meaning)));
  assert.ok(words.filter(word => word.meaning.split(/\s+/).length === 1).length >= 180);
  assert.equal(words.find(word => word.word === 'solitary').meaning, 'alone');
  assert.equal(words.find(word => word.word === 'vacant').meaning, 'empty');
});
