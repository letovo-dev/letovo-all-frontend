import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const getFullUserData = async (userName: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.userFullData.method,
    url: `${API_USER_SCHEME.userFullData.url}/${userName}`,
  });

  return { ...response };
};
