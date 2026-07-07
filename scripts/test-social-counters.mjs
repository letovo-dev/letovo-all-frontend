import assert from 'node:assert/strict';

import {
  applySocialCountDelta,
  nonNegativeCount,
  normalizeSocialCounters,
} from '../src/shared/utils/socialCounters.ts';

assert.equal(nonNegativeCount('-32'), 0);
assert.equal(nonNegativeCount('6'), 6);
assert.equal(nonNegativeCount(undefined), 0);
assert.equal(nonNegativeCount('not-a-number'), 0);

assert.equal(applySocialCountDelta('-32', -1), '0');
assert.equal(applySocialCountDelta('0', -1), '0');
assert.equal(applySocialCountDelta('0', 1), '1');

const normalized = normalizeSocialCounters({ likes: '-4', dislikes: -2, title: 'post' });
assert.deepEqual(normalized, { likes: '0', dislikes: '0', title: 'post' });

console.log('social counter tests passed');
