import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_ACHIEVEMENTS_SCHEME } from '../settings';

interface IPayload {
  token: string;
  username: string;
  achivement_id: number;
}

export const add = async (payload: IPayload): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_ACHIEVEMENTS_SCHEME.add.method,
    url: API_ACHIEVEMENTS_SCHEME.add.url,
    data: payload,
  });

  return { ...response };
};
