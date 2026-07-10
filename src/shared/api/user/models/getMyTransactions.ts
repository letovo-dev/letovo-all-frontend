import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const getMyTransactions = async (): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery({
    method: API_USER_SCHEME.transactionsMy.method,
    url: API_USER_SCHEME.transactionsMy.url,
  });

  return { ...response };
};
