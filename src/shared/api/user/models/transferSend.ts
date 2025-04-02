import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

interface IPayload {
  tr_id: string;
}

export const transferSend = async (payload: IPayload): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.transactionsSend.method,
    url: API_USER_SCHEME.transactionsSend.url,
    data: payload,
  });

  return { ...response };
};
