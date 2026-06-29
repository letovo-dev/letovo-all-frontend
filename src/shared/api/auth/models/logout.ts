import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_AUTH_SCHEME } from '../settings';

export const logout = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<unknown>({
    method: API_AUTH_SCHEME.logout.method,
    url: API_AUTH_SCHEME.logout.url,
  });

  return { ...response };
};
