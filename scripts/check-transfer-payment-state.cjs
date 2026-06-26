const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const transferModal = fs.readFileSync(
  path.join(repoRoot, 'src/features/moneyTranfer/ui/TransferModal26.tsx'),
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
  transferModal.includes('Остаток: ${transferRemainingBalance} энк.'),
  'success state should display the computed remaining balance, not the stale selfMoney prop',
);

console.log('transfer modal payment state regression checks passed');
