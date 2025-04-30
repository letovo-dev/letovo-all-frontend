import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const getNewsMedia = async (id: number): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getNewsMedia.method,
    url: `${API_DATA_SCHEME.getNewsMedia.url}${id}`,
  });

  return { ...response };
};
