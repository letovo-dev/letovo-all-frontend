import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const getAuthor = async (userName: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.getAuthor.method,
    url: `${API_USER_SCHEME.getAuthor.url}/${userName}`,
  });

  return { ...response };
};
