import assert from 'node:assert/strict';

import { buildBalanceWebSocketUrl } from '../src/shared/lib/buildBalanceWebSocketUrl.ts';

assert.equal(
  buildBalanceWebSocketUrl('/letovo-api', 'https://letovocorp.ru'),
  'wss://letovocorp.ru/letovo-api/ws',
);

assert.equal(
  buildBalanceWebSocketUrl('https://letovocorp.ru/letovo-api', 'https://letovocorp.ru'),
  'wss://letovocorp.ru/letovo-api/ws',
);

assert.equal(
  buildBalanceWebSocketUrl(undefined, 'https://letovocorp.ru'),
  'wss://letovocorp.ru/ws',
);

assert.equal(
  buildBalanceWebSocketUrl('/letovo-api/', 'http://localhost:3000'),
  'ws://localhost:3000/letovo-api/ws',
);

console.log('balance websocket URL tests passed');
