import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const setDislike = async (post_id: string, action: string): Promise<IApiReturn<unknown>> => {
  const method = action === 'like' ? 'POST' : 'DELETE';

  const response = await API.apiQuery<any[]>({
    method: method,
    url: `${API_DATA_SCHEME.setDislike.url}`,
    data: { post_id },
  });

  return { ...response };
};
