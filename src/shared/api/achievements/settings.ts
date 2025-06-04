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
  department: {
    method: 'GET',
    url: `${baseUrl}/achivements/by_user`,
  },
  list: {
    method: 'GET',
    url: `${baseUrl}/achivements/no_dep`,
  },
};

export const API_ACHIEVEMENTS_ENDPOINTS = [
  'create',
  'pictures',
  'info',
  'tree',
  'add',
  'delete',
  'department',
  'list',
] as const;
