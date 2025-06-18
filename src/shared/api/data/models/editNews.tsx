import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';
import { RealNews } from '@/shared/stores/data-store';

export const editNews = async (news: Partial<RealNews>): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.editNews.method,
    url: API_DATA_SCHEME.editNews.url,
    data: news,
  });

  return { ...response };
};
