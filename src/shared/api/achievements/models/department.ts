import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_ACHIEVEMENTS_SCHEME } from '../settings';

export const department = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_ACHIEVEMENTS_SCHEME.department.method,
    url: API_ACHIEVEMENTS_SCHEME.department.url,
  });

  return { ...response };
};
