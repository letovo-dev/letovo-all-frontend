import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';
import { OneArticle } from '@/shared/stores/articles-store';

export const updateArticle = async (article: Partial<OneArticle>): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.updateArticle.method,
    url: `${API_DATA_SCHEME.updateArticle.url}`,
    data: article,
  });

  return { ...response };
};
