import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const departments = read('src/pages_fsd/user-page/model/departments.ts');

const blockFor = id => {
  const match = departments.match(new RegExp(`'${id}': \\{([\\s\\S]*?)\\n  \\},`));
  assert.ok(match, `department ${id} metadata must exist`);
  return match[1];
};

for (const id of ['0', '9']) {
  const block = blockFor(id);
  assert.match(block, /icon: '\/Ava_Defolt_Norm\.svg'/, `department ${id} must use normal default emblem`);
  assert.match(block, /hoverIcon: '\/Ava_Defolt_smile\.svg'/, `department ${id} must use smiling hover emblem`);
}
assert.match(blockFor('11'), /icon: '\/26_x\.svg'/, 'the real X department must keep its own emblem');
assert.doesNotMatch(blockFor('11'), /Ava_Defolt_/, 'the real X department must not use default emblems');

for (const asset of ['Ava_Defolt_Norm.svg', 'Ava_Defolt_smile.svg']) {
  assert.ok(fs.existsSync(path.join(root, 'public', asset)), `${asset} must be shipped in public assets`);
}

const component = read('src/pages_fsd/user-page/ui/DepartmentEmblem.tsx');
assert.match(component, /department\.hoverIcon/, 'DepartmentEmblem must render the hover variant');
assert.match(component, /style\.normalImage/, 'DepartmentEmblem must mark the normal variant for fading');
const emblemStyles = read('src/pages_fsd/user-page/ui/DepartmentEmblem.module.scss');
assert.match(emblemStyles, /\.root:hover \.normalImage\s*\{\s*opacity:\s*0/, 'hover must hide the normal emblem');
assert.match(emblemStyles, /\.root:hover \.hoverImage\s*\{\s*opacity:\s*1/, 'hover must show the smiling emblem');

for (const page of [
  'src/pages_fsd/user-page/UserPage26.tsx',
  'src/pages_fsd/user-page/PublicUserPage26.tsx',
  'src/pages_fsd/user-page/ui/UserBlock26.tsx',
]) {
  assert.match(read(page), /<DepartmentEmblem\b/, `${page} must render DepartmentEmblem`);
}
assert.doesNotMatch(
  read('src/pages_fsd/user-page/ui/UserBlock26.tsx'),
  /const departments\s*=/,
  'UserBlock26 must use canonical department metadata instead of a stale duplicate map',
);

console.log('default department emblem regression checks passed');
