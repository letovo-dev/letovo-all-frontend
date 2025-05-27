import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

interface IPayload {
  avatar: string;
}

export const setAvatar = async (payload: IPayload): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.setAvatar.method,
    url: API_USER_SCHEME.setAvatar.url,
    data: payload,
  });

  return { ...response };
};
