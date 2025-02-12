import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const getAllUserAchievements = async (userName: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.userAchivAllEnable.method,
    url: `${API_USER_SCHEME.userAchivAllEnable.url}?username=${encodeURIComponent(userName)}`,
  });

  return { ...response };
};
