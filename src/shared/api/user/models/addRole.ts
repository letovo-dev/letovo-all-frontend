import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

interface IPayload {
  token: string;
  role: string;
  username: string;
  role_id: number;
  department: number;
}

export const addRole = async (payload: IPayload): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.addRole.method,
    url: API_USER_SCHEME.addRole.url,
    data: payload,
  });

  return { ...response };
};
