import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const saveArticle = async (
  categoryId: string,
  articleId: string | null,
  file: File,
): Promise<IApiReturn<unknown>> => {
  const formData = new FormData();
  formData.append('categoryId', categoryId);
  if (articleId !== null) {
    formData.append('articleId', articleId);
  } else {
    formData.append('articleId', '');
  }
  formData.append('file', file);

  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.saveArticle.method,
    url: `${API_DATA_SCHEME.saveArticle.url}`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data', // Устанавливаем заголовок для передачи файлов
    },
  });

  return { ...response };
};
