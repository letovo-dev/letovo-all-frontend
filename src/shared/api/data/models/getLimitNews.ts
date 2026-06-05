import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

interface GetLimitNewsParams {
  start: number;
  size: number;
  date?: string;
}

export const getLimitNews = async ({
  start,
  size,
  date,
}: GetLimitNewsParams): Promise<IApiReturn<unknown>> => {
  const raw: Record<string, string> = {
    start: start.toString(),
    size: size.toString(),
  };
  if (date) raw.date = date;
  const queryParams = new URLSearchParams(raw).toString();

  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getLimitNews.method,
    url: `${API_DATA_SCHEME.getLimitNews.url}?${queryParams}`,
  });

  return { ...response };
};
