import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';
import { Params } from '@/shared/stores/data-store';

export const getTitles = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getTitles.method,
    url: `${API_DATA_SCHEME.getTitles.url}`,
  });

  return { ...response };
};
