import { AdminCreateUserPayload } from '@/features/admin-create-user/model/types';
import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_AUTH_SCHEME } from '../settings';

export const adminCreateUser = async (
  payload: AdminCreateUserPayload,
): Promise<IApiReturn<unknown>> => {
  const response = await API.apiQuery<unknown>({
    method: API_AUTH_SCHEME.adminCreateUser.method,
    url: API_AUTH_SCHEME.adminCreateUser.url,
    data: payload,
  });

  return { ...response };
};
