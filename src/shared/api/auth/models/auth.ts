import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_AUTH_SCHEME } from '../settings';

export const auth = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_AUTH_SCHEME.auth.method,
    url: API_AUTH_SCHEME.auth.url,
  });

  return { ...response };
};
