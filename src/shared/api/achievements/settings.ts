import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_ACHIEVEMENTS_ENDPOINTS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const API_ACHIEVEMENTS_SCHEME: IApiEntityScheme<IEndpoint> = {
  create: {
    method: 'POST',
    url: `${baseUrl}/achivements/create`,
  },
  pictures: {
    method: 'GET',
    url: `${baseUrl}/achivements/pictures/`,
  },
  info: {
    method: 'GET',
    url: `${baseUrl}/achivements/info`,
  },
  tree: {
    method: 'GET',
    url: `${baseUrl}/achivements/tree`,
  },
  add: {
    method: 'POST',
    url: `${baseUrl}/achivements/add`,
  },
  delete: {
    method: 'DELETE',
    url: `${baseUrl}/achivements/delete`,
  },
};

export const API_ACHIEVEMENTS_ENDPOINTS = [
  'create',
  'pictures',
  'info',
  'tree',
  'add',
  'delete',
] as const;
