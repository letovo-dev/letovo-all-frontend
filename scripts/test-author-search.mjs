import assert from 'node:assert/strict';
import {
  buildAuthorSelectOptions,
  filterAuthorOption,
} from '../src/features/post-modal/model/author-options.ts';

const options = buildAuthorSelectOptions([
  {
    id: 'Portal_Administration',
    name: 'Portal_Administration',
    displayName: 'Администрация Портала',
  },
  {
    id: 'Citizen_hearst',
    name: 'Citizen_hearst',
    displayName: 'Ульям Херст',
  },
  {
    id: 'plain_author',
    name: 'plain_author',
    displayName: '   ',
  },
]);

const matches = query => options.filter(option => filterAuthorOption(query, option));

assert.deepEqual(
  matches('portal_admin').map(option => option.value),
  ['Portal_Administration'],
);
assert.deepEqual(
  matches('АДМИНИСТРАЦИЯ').map(option => option.value),
  ['Portal_Administration'],
);
assert.deepEqual(
  matches('  администрация  портала ').map(option => option.value),
  ['Portal_Administration'],
);
assert.deepEqual(
  matches('хер').map(option => option.value),
  ['Citizen_hearst'],
);
assert.equal(matches('').length, options.length);
assert.equal(matches('нет такого автора').length, 0);
assert.equal(options[0].label, 'Администрация Портала (@Portal_Administration)');
assert.equal(options[2].label, 'plain_author');
assert.equal(options[0].value, 'Portal_Administration');
