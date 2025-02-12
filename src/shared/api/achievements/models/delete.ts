import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_ACHIEVEMENTS_SCHEME } from '../settings';

interface IPayload {
  token: string;
  username: string;
  achivement_id: number;
}

export const deleteAchievement = async (payload: IPayload): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_ACHIEVEMENTS_SCHEME.delete.method,
    url: API_ACHIEVEMENTS_SCHEME.delete.url,
    data: payload,
  });

  return { ...response };
};
