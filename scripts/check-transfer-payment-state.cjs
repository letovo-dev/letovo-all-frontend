const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const transferModal = fs.readFileSync(
  path.join(repoRoot, 'src/features/moneyTranfer/ui/TransferModal26.tsx'),
  'utf8',
);
const userStore = fs.readFileSync(
  path.join(repoRoot, 'src/shared/stores/user-store/index.ts'),
  'utf8',
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  transferModal.includes('const remainingBalance = Number(selfMoney) - amount;'),
  'transfer modal should compute the remaining balance from the accepted integer amount',
);
assert(
  transferModal.includes('balance: remainingBalance'),
  'transfer modal should write the computed remaining balance into user store',
);
assert(
  transferModal.includes('last_outgoing_payment:'),
  'transfer modal should update last_outgoing_payment after a successful transfer',
);
assert(
  transferModal.includes('setTransferRemainingBalance(remainingBalance);'),
  'transfer modal should store the computed remaining balance for the success state',
);
assert(
  transferModal.includes('await refreshUserData(currentUsername);'),
  'transfer modal should refresh the current user from the server after a successful transfer',
);
assert(
  transferModal.includes('setTransferRemainingBalance(freshBalance);'),
  'success state should use the refreshed authoritative balance when it is available',
);
assert(
  !transferModal.includes('if (isAdmin && amount <= 0) return;'),
  'admin transfer flow should allow zero and negative correction amounts',
);
assert(
  transferModal.includes('min={isAdmin ? undefined : 1}'),
  'admin transfer amount input should not keep the non-admin minimum constraint',
);
assert(
  transferModal.includes('Остаток: ${transferRemainingBalance} энк.'),
  'success state should display the computed remaining balance, not the stale selfMoney prop',
);
assert(
  userStore.includes("responseData === 'receiver not found'") &&
    userStore.includes("responseData === 'receiver is not whireable'"),
  'transfer store should recognize backend invalid-recipient responses',
);
assert(
  userStore.includes("'Нельзя выполнить перевод этому пользователю'"),
  'transfer store should show a dedicated invalid-recipient error',
);

console.log('transfer modal payment state regression checks passed');
