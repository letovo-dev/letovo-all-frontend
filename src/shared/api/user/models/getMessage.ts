import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const getMessage = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.getMessage.method,
    url: API_USER_SCHEME.getMessage.url,
  });

  return { ...response };
};
