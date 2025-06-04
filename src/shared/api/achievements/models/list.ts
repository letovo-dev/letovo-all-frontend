import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_ACHIEVEMENTS_SCHEME } from '../settings';

export const list = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_ACHIEVEMENTS_SCHEME.list.method,
    url: API_ACHIEVEMENTS_SCHEME.list.url,
  });

  return { ...response };
};
