import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const getUserAchievements = async (userName: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.userActives.method,
    url: `${API_USER_SCHEME.userActives.url}/${userName}`,
  });

  return { ...response };
};
