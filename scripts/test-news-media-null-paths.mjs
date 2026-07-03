import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const carouselPath = path.join(root, 'src/entities/post/ui/Carousel.tsx');
const dataStorePath = path.join(root, 'src/shared/stores/data-store/index.ts');
const relatedModelPath = path.join(root, 'src/shared/api/data/models/getNewsRelated.ts');

const carousel = fs.readFileSync(carouselPath, 'utf8');
const dataStore = fs.readFileSync(dataStorePath, 'utf8');
const relatedModel = fs.readFileSync(relatedModelPath, 'utf8');

if (!relatedModel.includes('media: string | null')) {
  throw new Error('Related news media rows must model nullable media paths');
}
if (!dataStore.includes("typeof item === 'string' && item.trim().length > 0")) {
  throw new Error('News feed media mapping must omit null and empty media paths');
}
if (!carousel.includes('Array<string | null | undefined>')) {
  throw new Error('Carousel input must accept nullable media paths defensively');
}
if (!carousel.includes('visibleImgs.length === 0')) {
  throw new Error('Carousel must render nothing when no visible media paths remain');
}
if (!carousel.includes('visibleImgs.map')) {
  throw new Error('Carousel must build media URLs from filtered media paths');
}
