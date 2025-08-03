import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const getUserData = async (userName: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.userData.method,
    url: `${API_USER_SCHEME.userData.url}/${userName}`,
  });

  return { ...response };
};
