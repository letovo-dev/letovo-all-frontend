import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const store = fs.readFileSync(path.join(root, 'src/shared/stores/articles-store/index.ts'), 'utf8');
const articles = fs.readFileSync(path.join(root, 'src/pages_fsd/articles/Articles.tsx'), 'utf8');

if (!store.includes('draft.article = article;') || !store.includes('draft.articleLoading =')) {
  throw new Error('article selection must expose the destination and loading state immediately');
}
if (!store.includes('selectionSequence !== articleSelectionSequence')) {
  throw new Error('late Markdown responses must not replace a newer article selection');
}
if (store.includes('await Promise.all(articlePromises)')) {
  throw new Error('category loading must not eagerly wait for every Markdown document');
}
if (!articles.includes("setProcessedText(article?.text || '')")) {
  throw new Error('Markdown text must render before media prefetch completes');
}
if (!articles.includes('void Promise.allSettled(fetchPromises).then')) {
  throw new Error('media prefetch must continue independently after Markdown is rendered');
}
if (!articles.includes('articleLoading && article')) {
  throw new Error('the selected article title must be visible while Markdown is loading');
}
