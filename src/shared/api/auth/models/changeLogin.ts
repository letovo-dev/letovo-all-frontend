import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_AUTH_SCHEME } from '../settings';

export const changeLogin = async (payload: string): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_AUTH_SCHEME.changeLogin.method,
    url: API_AUTH_SCHEME.changeLogin.url,
    data: payload,
  });

  return { ...response };
};
