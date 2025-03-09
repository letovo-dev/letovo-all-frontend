import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_AUTH_ENDPOINTS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const API_AUTH_SCHEME: IApiEntityScheme<IEndpoint> = {
  login: {
    method: 'POST',
    url: `${baseUrl}/auth/login`,
  },
  auth: {
    method: 'GET',
    url: `${baseUrl}/auth/amiauthed/`,
  },
  logout: {
    method: 'PUT',
    url: `${baseUrl}/auth/logout`,
  },
  changePass: {
    method: 'PUT',
    url: `${baseUrl}/auth/change_password`,
  },
  changeLogin: {
    method: 'PUT',
    url: `${baseUrl}/auth/change_username`,
  },
  register: {
    method: 'PUT',
    url: `${baseUrl}/auth/register_true`,
  },
};

export const API_AUTH_ENDPOINTS = [
  'login',
  'auth',
  'logout',
  'changePass',
  'changeLogin',
  'register',
] as const;
