import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_ACHIEVEMENTS_SCHEME } from '../settings';

export const info = async (id: number): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_ACHIEVEMENTS_SCHEME.info.method,
    url: `${API_ACHIEVEMENTS_SCHEME.info.url}?achivement_id=${encodeURIComponent(id)}`,
  });

  return { ...response };
};
