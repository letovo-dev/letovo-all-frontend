import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_CHAT_SCHEME } from '../settings';
import type { RemoveChatPermissionPayload } from './types';

export const removeChatPermission = async (
  payload: RemoveChatPermissionPayload,
): Promise<IApiReturn<{ status: string }>> => {
  const response = await API.apiQuery<{ status: string }>({
    method: API_CHAT_SCHEME.removeChatPermission.method,
    url: API_CHAT_SCHEME.removeChatPermission.url,
    data: payload,
  });

  return { ...response };
};
