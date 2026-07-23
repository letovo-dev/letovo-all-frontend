import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const renderer = await readFile(new URL('../src/pages_fsd/articles/ReactMd.tsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/pages_fsd/articles/Articles.module.scss', import.meta.url), 'utf8');

assert.match(renderer, /remarkPlugins=\{\[remarkGfm\]\}/);
assert.match(renderer, /table:\s*\(\{ children \}\)\s*=>/);
assert.match(renderer, /className=\{style\.tableWrapper\}/);
assert.match(styles, /\.tableWrapper\s*\{[\s\S]*overflow-x:\s*auto/);
assert.match(styles, /table\s*\{[\s\S]*min-width:\s*100%/);
assert.match(styles, /th,\s*td\s*\{[\s\S]*border:/);

console.log('markdown table renderer tests passed');
