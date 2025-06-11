import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const renameArticle = async (
  categoryId: string,
  articleId: string,
  newName: string,
): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.renameArticle.method,
    url: `${API_DATA_SCHEME.renameArticle.url}`,
    data: { categoryId, articleId, newName },
  });

  return { ...response };
};
