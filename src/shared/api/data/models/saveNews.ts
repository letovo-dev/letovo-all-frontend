import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const saveNews = async (
  post_id: string,
  action: 'save' | 'delete',
): Promise<IApiReturn<unknown>> => {
  const method = action === 'save' ? 'POST' : 'DELETE';
  const response = await API.apiQuery<any[]>({
    method: method,
    url: API_DATA_SCHEME.saveNews.url,
    data: { post_id },
  });

  return { ...response };
};
