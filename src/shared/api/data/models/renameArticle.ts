import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

// post_id: 'Int';
//     is_secret: 'Bool';
//     likes: 'Int';
//     dislikes: 'Int';
//     saved: 'Int';
//     title: 'String';
//     author: 'String';
//     text: 'String';
//     category: 'String';

export const renameArticle = async (
  categoryId: string,
  articleId: string,
  newName: string,
): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.renameArticle.method,
    url: `${API_DATA_SCHEME.renameArticle.url}`,
    data: { category: categoryId, post_id: articleId, title: newName },
  });

  return { ...response };
};
