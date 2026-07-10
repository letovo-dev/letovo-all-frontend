type Payment = {
  transactionid: number;
  amount: number;
  sender: string;
  receiver: string;
  transactiontime: string;
};

type BalanceStore = {
  userData: {
    username: string;
    balance: string;
    last_incoming_payment?: Payment;
    last_outgoing_payment?: Payment;
  };
  transactions: Payment[];
};

type BalanceUpdateEvent = {
  balance: number;
  delta: number;
  counterparty: string;
  direction: 'incoming' | 'outgoing' | 'self';
  transaction_id: number;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const normalizeTransactions = (value: unknown): Payment[] =>
  Array.isArray(value) ? (value as Payment[]) : [];

export const migrateUserStorePersistedState = (persistedState: unknown, _version: number) => {
  const state = asRecord(persistedState);
  if (!state) {
    return persistedState;
  }

  const persistedStore = asRecord(state.store);
  return {
    ...state,
    store: {
      ...persistedStore,
      transactions: normalizeTransactions(persistedStore?.transactions),
    },
  };
};

export const mergeUserStorePersistedState = <T extends { store: { transactions: Payment[] } }>(
  persistedState: unknown,
  currentState: T,
): T => {
  const state = asRecord(persistedState);
  const persistedStore = asRecord(state?.store);

  return {
    ...currentState,
    ...state,
    store: {
      ...currentState.store,
      ...persistedStore,
      transactions: normalizeTransactions(persistedStore?.transactions),
    },
  } as T;
};

export const applyBalanceUpdateToStore = <T extends BalanceStore>(
  store: T,
  event: BalanceUpdateEvent,
) => {
  const username = store.userData.username;
  store.userData.balance = String(event.balance);

  if (event.direction === 'outgoing') {
    const transaction: Payment = {
      transactionid: event.transaction_id,
      amount: Math.abs(event.delta),
      sender: username,
      receiver: event.counterparty,
      transactiontime: new Date().toISOString(),
    };
    store.userData.last_outgoing_payment = transaction;
    store.transactions = [transaction, ...store.transactions].slice(0, 100);
  }

  if (event.direction === 'incoming') {
    const transaction: Payment = {
      transactionid: event.transaction_id,
      amount: Math.abs(event.delta),
      sender: event.counterparty,
      receiver: username,
      transactiontime: new Date().toISOString(),
    };
    store.userData.last_incoming_payment = transaction;
    store.transactions = [transaction, ...store.transactions].slice(0, 100);
  }
};
