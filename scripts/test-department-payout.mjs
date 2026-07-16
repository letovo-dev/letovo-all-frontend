import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const settings = read('src/shared/api/user/settings.ts');
const model = read('src/shared/api/user/models/departmentPayout.ts');
const modal = read('src/features/department-payout/ui/DepartmentPayoutModal.tsx');
const profile = read('src/pages_fsd/user-page/UserPage26.tsx');

assert.match(settings, /\/transactions\/department-payout/);
assert.match(model, /expected_recipient_count/);
assert.match(model, /request_id/);
assert.match(modal, /getDepartments/);
assert.match(modal, /confirm:\s*false/);
assert.match(modal, /confirm:\s*true/);
assert.match(modal, /department_id:\s*preview\.department_id/);
assert.match(modal, /expected_recipient_count:\s*preview\.recipient_count/);
assert.match(modal, /crypto\.randomUUID/);
assert.match(modal, /Начисление нельзя отменить/);
assert.match(modal, /payoutErrorMessages\[backendError\]/);
assert.match(modal, /Департамент не найден/);
assert.match(profile, /userrights === 'admin'/);
assert.match(profile, /Выдать премию/);
assert.match(profile, /DepartmentPayoutModal/);

console.log('department payout contracts: ok');
