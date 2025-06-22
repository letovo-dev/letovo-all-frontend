import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';
import { RealNews } from '@/shared/stores/data-store';
import { OneArticle } from '@/shared/stores/articles-store';

export const createNews = async (
  news: Partial<RealNews | OneArticle>,
): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.createNews.method,
    url: API_DATA_SCHEME.createNews.url,
    data: news,
  });

  return { ...response };
};
