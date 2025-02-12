/* eslint-disable @typescript-eslint/no-explicit-any */

import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_AUTH_SCHEME } from '../settings';

interface LoginPayload {
  login: string;
  password: string;
}

export const login = async (payload: LoginPayload): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_AUTH_SCHEME.login.method,
    url: API_AUTH_SCHEME.login.url,
    data: payload,
  });

  return { ...response };
};
