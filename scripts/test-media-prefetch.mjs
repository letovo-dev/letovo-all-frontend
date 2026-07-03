import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const componentPath = path.join(root, 'src/features/media-prefetch/MediaPrefetcher.tsx');
const settingsPath = path.join(root, 'src/shared/api/data/settings.ts');
const modelPath = path.join(root, 'src/shared/api/data/models/getTopMediaDownloads.ts');
const layoutPath = path.join(root, 'src/app/layout.tsx');

const component = fs.existsSync(componentPath) ? fs.readFileSync(componentPath, 'utf8') : '';
const settings = fs.readFileSync(settingsPath, 'utf8');
const model = fs.existsSync(modelPath) ? fs.readFileSync(modelPath, 'utf8') : '';
const layout = fs.readFileSync(layoutPath, 'utf8');

if (!settings.includes('getTopMediaDownloads')) {
  throw new Error('API_DATA_SCHEME must define getTopMediaDownloads');
}
if (!settings.includes('/media/top-downloads')) {
  throw new Error('API_DATA_SCHEME.getTopMediaDownloads must target /media/top-downloads');
}
if (!model.includes('getTopMediaDownloads')) {
  throw new Error('getTopMediaDownloads model must exist and export getTopMediaDownloads');
}
if (!component.includes('requestIdleCallback')) {
  throw new Error('media prefetch must run in idle time');
}
if (!component.includes('saveData')) {
  throw new Error('media prefetch must respect saveData');
}
if (!component.includes('MAX_PREFETCH_BYTES')) {
  throw new Error('media prefetch must enforce total byte budget');
}
if (!component.includes('MAX_PREFETCH_FILE_BYTES')) {
  throw new Error('media prefetch must enforce single-file budget');
}
if (!component.includes("cache: 'force-cache'")) {
  throw new Error('media prefetch must use browser HTTP cache');
}
if (!component.includes("item.url.startsWith('/api/media/get/')")) {
  throw new Error('media prefetch must fetch through the backend API prefix');
}
if (!layout.includes('<MediaPrefetcher />')) {
  throw new Error('root layout must mount MediaPrefetcher');
}
