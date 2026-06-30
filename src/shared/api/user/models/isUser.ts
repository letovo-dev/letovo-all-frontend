import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const isUser = async (userName: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<unknown>({
    method: API_USER_SCHEME.isUser.method,
    url: `${API_USER_SCHEME.isUser.url}/${userName}`,
  });

  return { ...response };
};
