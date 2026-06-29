import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

interface IPayload {
  current_password: string;
  new_password: string;
}

export const changePass = async (payload: IPayload): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.changePass.method,
    url: API_USER_SCHEME.changePass.url,
    data: payload,
  });

  return { ...response };
};
