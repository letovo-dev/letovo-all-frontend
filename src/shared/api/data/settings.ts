import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_DATA_ENDPOINTS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const API_DATA_SCHEME: IApiEntityScheme<IEndpoint> = {
  getAvatars: {
    method: 'GET',
    url: `${baseUrl}/user/all_avatars`,
  },
  getSavedNews: {
    method: 'GET',
    url: `${baseUrl}/social/saved`,
  },
  saveNews: {
    method: 'POST',
    url: `${baseUrl}/social/save`,
  },
  saveComments: {
    method: 'POST',
    url: `${baseUrl}/social/comments`,
  },
  getNewsMedia: {
    method: 'GET',
    url: `${baseUrl}/social/media/pics/`,
  },
  setLike: {
    method: 'POST',
    url: `${baseUrl}/social/like`,
  },
  setDislike: {
    method: 'DELETE',
    url: `${baseUrl}/social/dislike`,
  },
  getTitles: {
    method: 'GET',
    url: `${baseUrl}/social/titles`,
  },
  getCurrentNews: {
    method: 'GET',
    url: `${baseUrl}/social/new/`,
  },
  getLimitNewsComments: {
    method: 'GET',
    url: `${baseUrl}/social/comments`,
  },
  getLimitNews: {
    method: 'GET',
    url: `${baseUrl}/social/news`,
  },
  searchNews: {
    method: 'GET',
    url: `${baseUrl}/social/search`,
  },
  getArticlesCategories: {
    method: 'GET',
    url: `${baseUrl}/social/categories`,
  },
  getArticleById: {
    method: 'GET',
    url: `${baseUrl}/social/bycat`,
  },
  getArticleMd: {
    method: 'GET',
    url: `${baseUrl}/media/get`,
  },
  getMdMedia: {
    method: 'GET',
    url: `${baseUrl}/media/get`,
  },
  deleteArticlesCategory: {
    method: 'DELETE',
    url: `${baseUrl}/social/bycat`,
  },
  renameCategory: {
    method: 'POST',
    url: `${baseUrl}/social/bycat`,
  },
  deleteArticle: {
    method: 'DELETE',
    url: `${baseUrl}/social/bycat`,
  },
  renameArticle: {
    method: 'POST',
    url: `${baseUrl}/social/bycat`,
  },
  saveArticle: {
    method: 'POST',
    url: `${baseUrl}/social/bycat`,
  },
  createNews: {
    method: 'POST',
    url: `${baseUrl}/social/bycat`,
  },
  editNews: {
    method: 'POST',
    url: `${baseUrl}/social/bycat`,
  },
  deleteNews: {
    method: 'DELETE',
    url: `${baseUrl}/social/bycat`,
  },
};

export const API_DATA_ENDPOINTS = [
  'getAvatars',
  'getSavedNews',
  'saveNews',
  'saveComments',
  'getNewsMedia',
  'setLike',
  'setDislike',
  'getTitles',
  'getCurrentNews',
  'getLimitNewsComments',
  'getLimitNews',
  'searchNews',
  'getArticlesCategories',
  'getArticleById',
  'getArticleMd',
  'getMdMedia',
  'deleteArticlesCategory',
  'renameCategory',
  'deleteArticle',
  'renameArticle',
  'saveArticle',
  'createNews',
  'editNews',
  'deleteNews',
] as const;
