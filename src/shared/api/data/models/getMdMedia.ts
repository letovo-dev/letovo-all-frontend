import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const getMdMedia = async (url: string): Promise<IApiReturn<unknown>> => {
  console.log('url', url);

  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getMdMedia.method,
    url: `${API_DATA_SCHEME.getMdMedia.url}/${url}`,
  });

  return { ...response };
};
