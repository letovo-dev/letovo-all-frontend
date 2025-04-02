import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

interface IPayload {
  receiver: string;
  amount: number;
}

export const transferPrepare = async (payload: IPayload): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_USER_SCHEME.transactionsPrepare.method,
    url: API_USER_SCHEME.transactionsPrepare.url,
    data: payload,
  });

  return { ...response };
};
