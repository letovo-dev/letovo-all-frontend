import assert from 'node:assert/strict';
import {
  mediaPathsFromUploadFiles,
  sortFilesByUploadOrder,
} from '../src/features/post-modal/model/media-order.ts';

const uploadOrder = new Map([
  ['selected-z', 0],
  ['selected-a', 1],
  ['selected-m', 2],
]);
const completionOrder = [
  { uid: 'selected-m', response: { file: '/images/m-middle.jpg' } },
  { uid: 'selected-z', response: { file: '/images/z-last.jpg' } },
  { uid: 'selected-a', response: { file: '/images/a-first.jpg' } },
];

const orderedFiles = sortFilesByUploadOrder(completionOrder, uploadOrder);
assert.deepEqual(
  orderedFiles.map(file => file.uid),
  ['selected-z', 'selected-a', 'selected-m'],
  'parallel upload completion must not replace the original selection order',
);
assert.deepEqual(
  mediaPathsFromUploadFiles([
    orderedFiles[0],
    { uid: 'existing-a', url: '/images/a-existing.jpg' },
    { uid: 'string-m', response: '/images/m-string.jpg' },
    { uid: 'still-uploading' },
  ]),
  ['/images/z-last.jpg', '/images/a-existing.jpg', '/images/m-string.jpg'],
  'create and edit payloads must preserve ordered uploaded and existing media paths',
);

console.log('post media order regression checks passed');
