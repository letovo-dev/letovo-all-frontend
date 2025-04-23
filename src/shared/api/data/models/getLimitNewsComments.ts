import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

interface GetLimitNewsCommentsParams {
  post_id: number;
  start: number;
  size: number;
}

export const getLimitNewsComments = async ({
  post_id,
  start,
  size,
}: GetLimitNewsCommentsParams): Promise<IApiReturn<unknown>> => {
  const queryParams = new URLSearchParams({
    post_id: post_id.toString(),
    start: start.toString(),
    size: size.toString(),
  }).toString();

  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getLimitNewsComments.method,
    url: `${API_DATA_SCHEME.getLimitNewsComments.url}?${queryParams}`,
  });

  return { ...response };
};
