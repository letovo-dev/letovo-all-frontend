import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

const dataStore = read('src/shared/stores/data-store/index.ts');
const commentsStore = read('src/shared/stores/comments-store/index.ts');
const newsPost = read('src/entities/post/ui/NewsPost.tsx');
const actionPanel = read('src/features/news-action-panel/ui/NewsActionPanel.tsx');
const oneComment = read('src/entities/post/ui/OneComment.tsx');
const newsPage = read('src/pages_fsd/news/News26.tsx');

const requireSource = (source, fragment, message) => {
  if (!source.includes(fragment)) throw new Error(message);
};

requireSource(
  dataStore,
  'commentsCount: related?.comments_count ?? comments.length',
  'feed items must retain the backend comments_count separately from the three-comment preview',
);
requireSource(
  newsPost,
  'commentsCount={commentsCount}',
  'post actions must receive the total comment count, not preview length',
);
requireSource(
  actionPanel,
  'formatCount(Math.max(commentsCount, currentNewsComments?.length ?? 0))',
  'comment counter must render the total count rather than only the preview length',
);
requireSource(
  oneComment,
  '{showMore && (',
  'the all-comments action must be controlled by the total-count-derived showMore flag',
);
requireSource(
  commentsStore,
  'normalizeSocialCounters',
  'full comments must retain normalized social counters',
);
requireSource(
  commentsStore,
  'start === 0',
  'the first full-comments page must replace the feed preview',
);
requireSource(
  commentsStore,
  'new Map',
  'appended comment pages must be deduplicated',
);
requireSource(
  newsPage,
  'getLimitNewsComments(Number(openComments), 0, COMMENTS_PAGE_SIZE)',
  'opening comments must fetch the first full-comments page',
);
requireSource(
  newsPage,
  'loadMoreComments',
  'the comments modal must support pagination',
);
requireSource(newsPage, 'Не удалось загрузить комментарии', 'the modal must expose fetch errors');
requireSource(newsPage, 'Загрузить ещё', 'the modal must expose a load-more control');

console.log('all-comments pagination contract: ok');
