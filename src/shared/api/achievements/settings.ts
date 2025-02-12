import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_ACHIEVEMENTS_ENDPOINTS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const API_ACHIEVEMENTS_SCHEME: IApiEntityScheme<IEndpoint> = {
  create: {
    method: 'POST',
    url: `/achivements/create`,
  },
  pictures: {
    method: 'GET',
    url: `/achivements/pictures/`,
  },
  info: {
    method: 'GET',
    url: `/achivements/info`,
  },
  tree: {
    method: 'GET',
    url: `/achivements/tree`,
  },
  add: {
    method: 'POST',
    url: `/achivements/add`,
  },
  delete: {
    method: 'DELETE',
    url: `/achivements/delete`,
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
