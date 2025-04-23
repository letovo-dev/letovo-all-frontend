import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const getCurrentNews = async (id: number): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getCurrentNews.method,
    url: `${API_DATA_SCHEME.getCurrentNews.url}${id}`,
  });

  return { ...response };
};
