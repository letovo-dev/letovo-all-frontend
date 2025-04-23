import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_DATA_ENDPOINTS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const API_DATA_SCHEME: IApiEntityScheme<IEndpoint> = {
  getAvatars: {
    method: 'GET',
    url: `${baseUrl}/user/all_avatars`,
  },
  getNews: {
    method: 'POST',
    url: `${baseUrl}/news/limit_news`,
  },
  getComments: {
    method: 'POST',
    url: `${baseUrl}/social/comments`,
  },
  getMedia: {
    method: 'GET',
    url: `${baseUrl}/social/media`,
  },
  setLike: {
    method: 'POST',
    url: `${baseUrl}/social/like`,
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
};

export const API_DATA_ENDPOINTS = [
  'getAvatars',
  'getNews',
  'getComments',
  'getMedia',
  'setLike',
  'getTitles',
  'getCurrentNews',
  'getLimitNewsComments',
  'getLimitNews',
] as const;
