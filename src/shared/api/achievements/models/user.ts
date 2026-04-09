import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_ACHIEVEMENTS_SCHEME } from '../settings';

export const user = async (username: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_ACHIEVEMENTS_SCHEME.user.method,
    url: `${API_ACHIEVEMENTS_SCHEME.user.url}/${username}`,
  });

  return { ...response };
};
