import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const getArticleMd = async (fileName: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getArticleMd.method,
    url: `${API_DATA_SCHEME.getArticleMd.url}/${fileName}`,
  });

  return { ...response };
};
