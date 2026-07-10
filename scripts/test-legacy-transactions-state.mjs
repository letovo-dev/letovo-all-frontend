import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
  clear: () => storage.clear(),
};

const {
  applyBalanceUpdateToStore,
  mergeUserStorePersistedState,
  migrateUserStorePersistedState,
} = await import('../src/shared/stores/user-store/persistence.ts');

const defaultStore = {
  userData: {
    username: 'alice',
    balance: '100',
  },
  userAchievements: undefined,
  allPossibleUserAchievements: undefined,
  departmentAchievements: undefined,
  allPostsAuthors: [],
  messageText: '',
  transactions: [],
};

const legacySnapshot = {
  state: {
    store: {
      userData: {
        username: 'alice',
        balance: '100',
      },
    },
  },
  version: 0,
};
localStorage.setItem('userStore', JSON.stringify(legacySnapshot));

const persistedSnapshot = JSON.parse(localStorage.getItem('userStore'));
const migratedSnapshot = migrateUserStorePersistedState(
  persistedSnapshot.state,
  persistedSnapshot.version,
);
const hydratedState = mergeUserStorePersistedState(migratedSnapshot, {
  store: defaultStore,
  localeName: 'User store',
  endPreload: false,
});

assert.deepEqual(
  hydratedState.store.transactions,
  [],
  'legacy persisted state must hydrate with an empty transactions array',
);

applyBalanceUpdateToStore(hydratedState.store, {
  balance: 125,
  delta: 25,
  counterparty: 'bob',
  direction: 'incoming',
  transaction_id: 42,
});

assert.equal(hydratedState.store.userData.balance, '125');
assert.equal(hydratedState.store.transactions.length, 1);
assert.deepEqual(hydratedState.store.transactions[0], {
  transactionid: 42,
  amount: 25,
  sender: 'bob',
  receiver: 'alice',
  transactiontime: hydratedState.store.transactions[0].transactiontime,
});

console.log('legacy persisted transactions state rehydrates and handles balance events');
