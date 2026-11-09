const { test } = require('node:test');
const assert = require('node:assert/strict');
const rewriteDiff = require('./rewrite-diff.js');

test('word, capital and punctuation edits are highlighted without marking unchanged wording', () => {
  const changes = rewriteDiff('he was doing good and it was lunch time.', 'He was doing well, and it was lunchtime.');
  assert.deepEqual(changes.filter(change => change.kind === 'add').map(change => change.text), ['He', 'well,', 'lunchtime']);
  assert.deepEqual(changes.filter(change => change.kind === 'remove').map(change => change.text), ['he', 'good', 'lunch time']);
  assert.ok(changes.some(change => change.kind === 'equal' && change.text === ' was doing '));
});

test('diff preserves both exact versions for blank, repeated, Unicode and multiline text', () => {
  const pairs = [
    ['', ''],
    ['', 'A new story.'],
    ['A removed story.', ''],
    ['The boy saw the boy.', 'The boy saw the dog.'],
    ['Bob’s puppy 跑了。', 'Bob’s small puppy 跑来了。'],
    ['A boy.\nA dog.', 'A boy. A dog.'],
    ['Same words.', 'Same words.'],
    ['<b>Harry</b>', '<em>Harry</em>']
  ];
  for (const [original, revised] of pairs) {
    const changes = rewriteDiff(original, revised);
    assert.equal(changes.filter(change => change.kind !== 'add').map(change => change.text).join(''), original);
    assert.equal(changes.filter(change => change.kind !== 'remove').map(change => change.text).join(''), revised);
    assert.ok(changes.every(change => change.text.length > 0));
  }
  assert.deepEqual(rewriteDiff('Same words.', 'Same words.'), [{ kind: 'equal', text: 'Same words.' }]);
});
