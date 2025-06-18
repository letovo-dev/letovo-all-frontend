import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const getAllPostsAuthors = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getAllPostsAuthors.method,
    url: API_DATA_SCHEME.getAllPostsAuthors.url,
  });

  return { ...response };
};
