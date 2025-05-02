import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

interface searchNewsParams {
  search_query: string;
}

export const searchNews = async (search_query: searchNewsParams): Promise<IApiReturn<unknown>> => {
  const queryParams = new URLSearchParams({
    text: search_query.search_query,
  });

  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.searchNews.method,
    url: `${API_DATA_SCHEME.searchNews.url}?${queryParams}`,
  });

  return { ...response };
};
