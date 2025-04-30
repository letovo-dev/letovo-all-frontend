import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

interface GetLimitNewsParams {
  start: number;
  size: number;
}

export const getLimitNews = async ({
  start,
  size,
}: GetLimitNewsParams): Promise<IApiReturn<unknown>> => {
  const queryParams = new URLSearchParams({
    start: start.toString(),
    size: size.toString(),
  }).toString();

  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getLimitNews.method,
    url: `${API_DATA_SCHEME.getLimitNews.url}?${queryParams}`,
  });

  return { ...response };
};
