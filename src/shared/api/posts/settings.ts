import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_POSTS_ENDPOINTS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const API_POSTS_SCHEME: IApiEntityScheme<IEndpoint> = {
  getPosts: {
    method: 'GET',
    url: `/user`,
  },
  getOnePost: {
    method: 'GET',
    url: `/post/author`,
  },
  deletePost: {
    method: 'DELETE',
    url: `/post/delete`,
  },
};

export const API_POSTS_ENDPOINTS = ['getPosts', 'getOnePost', 'deletePost'] as const;
