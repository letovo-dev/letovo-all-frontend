import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const getArticlesByCategoryId = async (id: number): Promise<IApiReturn<unknown>> => {
  console.log('id', id);

  const queryParams = new URLSearchParams({
    id: id.toString(),
  }).toString();

  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.getArticleById.method,
    url: `${API_DATA_SCHEME.getArticleById.url}/${id}`,
  });

  return { ...response };
};
