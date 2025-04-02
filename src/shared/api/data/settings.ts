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
};

export const API_DATA_ENDPOINTS = ['getAvatars', 'getNews'] as const;
