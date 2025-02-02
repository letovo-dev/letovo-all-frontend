import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_AUTH_ENDPOINTS)[number];

export const API_AUTH_SCHEME: IApiEntityScheme<IEndpoint> = {
  login: {
    method: 'POST',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
  },
  auth: {
    method: 'GET',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/amiauthed/`,
  },
  logout: {
    method: 'PUT',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`,
  },
  changePass: {
    method: 'PUT',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/change_password`,
  },
  changeLogin: {
    method: 'PUT',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/change_username`,
  },
};

export const API_AUTH_ENDPOINTS = ['login', 'auth', 'logout', 'changePass', 'changeLogin'] as const;
