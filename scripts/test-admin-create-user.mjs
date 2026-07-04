import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const assertContains = (text, expected, file) => {
  if (!text.includes(expected)) {
    throw new Error(`${file} must contain ${expected}`);
  }
};

const assertNotContains = (text, unexpected, file) => {
  if (text.includes(unexpected)) {
    throw new Error(`${file} must not contain ${unexpected}`);
  }
};

const authSettings = read('src/shared/api/auth/settings.ts');
const authModels = read('src/shared/api/auth/models/index.ts');
const adminApi = read('src/shared/api/auth/models/adminCreateUser.ts');
const userSettings = read('src/shared/api/user/settings.ts');
const userModels = read('src/shared/api/user/models/index.ts');
const getDepartments = read('src/shared/api/user/models/getDepartments.ts');
const getDepartmentRoles = read('src/shared/api/user/models/getDepartmentRoles.ts');
const types = read('src/features/admin-create-user/model/types.ts');
const password = read('src/features/admin-create-user/lib/password.ts');
const form = read('src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
const page = read('src/app/admin/users/create/page.tsx');
const menu = read('src/shared/ui/menu/Menu.tsx');
const packageJson = read('package.json');

assertContains(authSettings, 'adminCreateUser', 'src/shared/api/auth/settings.ts');
assertContains(authSettings, '/auth/admin_create_user', 'src/shared/api/auth/settings.ts');
assertContains(authModels, 'adminCreateUser', 'src/shared/api/auth/models/index.ts');
assertContains(adminApi, 'AdminCreateUserPayload', 'src/shared/api/auth/models/adminCreateUser.ts');
assertContains(adminApi, 'API_AUTH_SCHEME.adminCreateUser', 'src/shared/api/auth/models/adminCreateUser.ts');

assertContains(userSettings, 'departments', 'src/shared/api/user/settings.ts');
assertContains(userSettings, 'departmentRoles', 'src/shared/api/user/settings.ts');
assertContains(userModels, 'getDepartments', 'src/shared/api/user/models/index.ts');
assertContains(userModels, 'getDepartmentRoles', 'src/shared/api/user/models/index.ts');
assertContains(getDepartments, '/user/department/roles', 'src/shared/api/user/models/getDepartments.ts');
assertContains(getDepartmentRoles, 'departmentId', 'src/shared/api/user/models/getDepartmentRoles.ts');

assertContains(types, 'AdminRoleRights', 'src/features/admin-create-user/model/types.ts');
assertContains(types, 'AdminCreateUserPayload', 'src/features/admin-create-user/model/types.ts');
assertContains(password, 'generateAdminPassword', 'src/features/admin-create-user/lib/password.ts');
assertContains(password, 'crypto.getRandomValues', 'src/features/admin-create-user/lib/password.ts');
assertNotContains(password, 'Math.random', 'src/features/admin-create-user/lib/password.ts');

assertContains(form, "'use client'", 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
assertContains(form, 'SERVICES_AUTH.Auth.adminCreateUser', 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
assertContains(form, 'SERVICES_USERS.UsersData.getDepartments', 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
assertContains(form, 'SERVICES_USERS.UsersData.getDepartmentRoles', 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
assertContains(form, 'SERVICES_USERS.UsersData.isUser', 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
assertContains(form, 'generateAdminPassword', 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
assertContains(form, 'name="chattable"', 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
assertContains(form, 'name="userrights"', 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
assertContains(form, 'write_posts', 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
assertContains(form, 'main_page', 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');
assertContains(form, 'router.push(`/user/${values.username}`)', 'src/features/admin-create-user/ui/AdminCreateUserForm.tsx');

assertContains(page, '<AdminCreateUserForm />', 'src/app/admin/users/create/page.tsx');
assertContains(menu, 'Создать аккаунт', 'src/shared/ui/menu/Menu.tsx');
assertContains(menu, 'admin/users/create', 'src/shared/ui/menu/Menu.tsx');
assertContains(packageJson, 'test:admin-create-user', 'package.json');
