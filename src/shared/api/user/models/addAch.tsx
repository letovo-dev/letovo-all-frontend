import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const addAch = async (
  achivement_id: string | number,
  username: string,
): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.addAch.method,
    url: `${API_USER_SCHEME.addAch.url}`,
    data: { achivement_id: Number(achivement_id), username },
  });

  return { ...response };
};
