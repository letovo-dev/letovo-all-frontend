import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const getAvatars = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getAvatars.method,
    url: `${API_DATA_SCHEME.getAvatars.url}`,
  });

  return { ...response };
};
