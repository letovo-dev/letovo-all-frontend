import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const revealSecretArticle = async (id: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.revealSecretArticle.method,
    url: `${API_DATA_SCHEME.revealSecretArticle.url}/${id}`,
  });

  return { ...response };
};
