import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

interface IPayload {
  new_username: string;
}

export const changeNick = async (payload: IPayload): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.changeNick.method,
    url: API_USER_SCHEME.changeNick.url,
    data: payload,
  });

  return { ...response };
};
