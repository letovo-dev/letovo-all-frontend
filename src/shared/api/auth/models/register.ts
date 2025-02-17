import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_AUTH_SCHEME } from '../settings';

export const register = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_AUTH_SCHEME.register.method,
    url: API_AUTH_SCHEME.register.url,
  });

  return { ...response };
};
