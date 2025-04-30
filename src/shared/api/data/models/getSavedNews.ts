import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const getSavedNews = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getSavedNews.method,
    url: API_DATA_SCHEME.getSavedNews.url,
  });

  return { ...response };
};
