import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const setLike = async (
  post_id: string,
  action: string,
  options: { signal?: AbortSignal } = {},
): Promise<IApiReturn<unknown>> => {
  const method = action === 'like' ? 'POST' : 'DELETE';

  const response = await API.apiQuery<any[]>({
    method: method,
    url: `${API_DATA_SCHEME.setLike.url}`,
    data: { post_id },
    signal: options.signal,
  });

  return { ...response };
};
