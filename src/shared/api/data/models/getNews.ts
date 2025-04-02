import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';
import { Params } from '@/shared/stores/data-store';

export const getNews = async (params: Params): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getNews.method,
    url: `${API_DATA_SCHEME.getNews.url}`,
    data: params,
  });

  return { ...response };
};
