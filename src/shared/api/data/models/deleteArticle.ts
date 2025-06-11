import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const deleteArticle = async (id: string): Promise<IApiReturn<unknown>> => {
  const queryParams = new URLSearchParams({
    id: id.toString(),
  }).toString();

  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.deleteArticle.method,
    url: `${API_DATA_SCHEME.deleteArticle.url}/${id}`,
  });

  return { ...response };
};
