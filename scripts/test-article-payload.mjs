import assert from 'node:assert/strict';

import { buildArticlePayload } from '../src/features/md-editor/model/buildArticlePayload.ts';

const articlesCategories = [
  { category: '2', category_name: 'ENVIRO' },
  { category: '5', category_name: 'Admissions' },
];

const selectCategoryItems = [
  { value: '2', label: 'ENVIRO', text: '' },
  { value: '5', label: 'Admissions', text: '' },
  { value: 'New Category', label: 'New Category', text: 'new' },
];

const article = {
  post_id: 42,
  post_path: '/media/article_42.md',
  is_secret: false,
  likes: 7,
  dislikes: '2',
  saved_count: 3,
  title: 'Old title',
  text: '# Old',
  category: 2,
  category_name: 'ENVIRO',
};

{
  const result = buildArticlePayload({
    isEditArticle: false,
    values: { isSecret: 'f', category: '2', articleTitle: 'New article' },
    articlesCategories,
    selectCategoryItems,
    uploadedFilePath: '/media/new.md',
  });

  assert.equal(result.isNewRequest, true);
  assert.equal(result.shouldRefreshAfterSuccess, false);
  assert.equal(result.payload.category_name, 'ENVIRO');
  assert.equal(result.payload.category, '2');
  assert.equal(result.payload.post_path, '/media/new.md');
}

{
  const result = buildArticlePayload({
    article,
    isEditArticle: true,
    values: { isSecret: 't', category: '5', articleTitle: 'Edited article' },
    articlesCategories,
    selectCategoryItems,
    uploadedFilePath: '/media/article_42.md',
  });

  assert.equal(result.isNewRequest, false);
  assert.equal(result.shouldRefreshAfterSuccess, true);
  assert.equal(result.payload.post_id, '42');
  assert.equal(result.payload.is_secret, 't');
  assert.equal(result.payload.likes, '7');
  assert.equal(result.payload.dislikes, '2');
  assert.equal(result.payload.saved_count, '3');
  assert.equal(result.payload.category_name, 'Admissions');
  assert.equal(result.payload.category, '5');
  assert.equal(result.payload.post_path, '/media/article_42.md');
}

{
  const result = buildArticlePayload({
    isEditArticle: false,
    values: { isSecret: 'f', category: 'New Category', articleTitle: 'New article' },
    articlesCategories,
    selectCategoryItems,
    uploadedFilePath: '/media/new-category.md',
  });

  assert.equal(result.isNewRequest, true);
  assert.equal(result.shouldRefreshAfterSuccess, true);
  assert.equal(result.payload.category_name, 'New Category');
  assert.equal('category' in result.payload, false);
}

{
  const result = buildArticlePayload({
    article,
    isEditArticle: true,
    values: { isSecret: 'f', category: 'New Category', articleTitle: 'Moved article' },
    articlesCategories,
    selectCategoryItems,
    uploadedFilePath: '/media/article_42.md',
  });

  assert.equal(result.isNewRequest, false);
  assert.equal(result.shouldRefreshAfterSuccess, true);
  assert.equal(result.payload.post_id, '42');
  assert.equal(result.payload.category_name, 'New Category');
  assert.equal('category' in result.payload, false);
}

console.log('article payload tests passed');
