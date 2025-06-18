import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const saveComments = async (
  comment: string,
  post_id: string,
  author: string | undefined,
): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.saveComments.method,
    url: API_DATA_SCHEME.saveComments.url,
    data: { comment, post_id, author },
  });

  return { ...response };
};
