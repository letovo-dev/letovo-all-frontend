import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const getPostsByAuthor = async (username: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getPostsByAuthor.method,
    url: `${API_DATA_SCHEME.getPostsByAuthor.url}/${username}`,
  });

  return { ...response };
};
