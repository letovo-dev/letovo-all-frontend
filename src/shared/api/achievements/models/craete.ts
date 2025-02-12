import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_ACHIEVEMENTS_SCHEME } from '../settings';

interface IPayload {
  token: string;
  name: string;
  tree_id: number;
  level: number;
  pic: string;
  description: string;
  stages: number;
}

export const create = async (payload: IPayload): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_ACHIEVEMENTS_SCHEME.create.method,
    url: API_ACHIEVEMENTS_SCHEME.create.url,
    data: payload,
  });

  return { ...response };
};
