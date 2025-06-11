import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export const renameCategory = async (id: string, newName: string): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_DATA_SCHEME.renameCategory.method,
    url: `${API_DATA_SCHEME.renameCategory.url}`,
    data: { id, newName },
  });

  return { ...response };
};
