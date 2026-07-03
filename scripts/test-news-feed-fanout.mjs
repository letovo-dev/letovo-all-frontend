import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const storePath = path.join(root, 'src/shared/stores/data-store/index.ts');
const settingsPath = path.join(root, 'src/shared/api/data/settings.ts');
const modelsIndexPath = path.join(root, 'src/shared/api/data/models/index.ts');
const relatedPath = path.join(root, 'src/shared/api/data/models/getNewsRelated.ts');

const store = fs.readFileSync(storePath, 'utf8');
const settings = fs.readFileSync(settingsPath, 'utf8');
const modelsIndex = fs.readFileSync(modelsIndexPath, 'utf8');
const related = fs.existsSync(relatedPath) ? fs.readFileSync(relatedPath, 'utf8') : '';

if (!settings.includes('getNewsRelated')) {
  throw new Error('API_DATA_SCHEME must define getNewsRelated');
}
if (!modelsIndex.includes('getNewsRelated')) {
  throw new Error('data models index must export getNewsRelated');
}
if (!settings.includes('/social/news/related')) {
  throw new Error('API_DATA_SCHEME.getNewsRelated must target /social/news/related');
}
if (!related.includes('getNewsRelated')) {
  throw new Error('getNewsRelated model must exist and export getNewsRelated');
}
if (!store.includes('Data.getNewsRelated')) {
  throw new Error('fetchNews must call the batch related endpoint');
}
if (store.includes('newsData?.map(async news =>')) {
  throw new Error('fetchNews still maps over posts with async per-post requests');
}
if (store.includes('getCurrentNewsPics(news.post_id)')) {
  throw new Error('fetchNews still calls per-post media endpoint');
}
if (store.includes('getLimitNewsComments(news.post_id, 0, 500)')) {
  throw new Error('fetchNews still calls per-post comments endpoint');
}

const newsPagePath = path.join(root, 'src/app/news/page.tsx');
const newsPage = fs.readFileSync(newsPagePath, 'utf8');
const loadMoreStart = newsPage.indexOf('const loadMore = useCallback');
const loadMoreEnd = newsPage.indexOf('useEffect(() => {', loadMoreStart);
const loadMoreBlock = newsPage.slice(loadMoreStart, loadMoreEnd);

if (loadMoreBlock.includes('await getTitles()')) {
  throw new Error('loadMore must not reload all titles on every scroll page');
}
