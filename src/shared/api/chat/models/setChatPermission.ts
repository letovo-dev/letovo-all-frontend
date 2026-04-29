import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_CHAT_SCHEME } from '../settings';
import type { ChatPermissionPayload } from './types';

export const setChatPermission = async (
  payload: ChatPermissionPayload,
): Promise<IApiReturn<{ status: string }>> => {
  const response = await API.apiQuery<{ status: string }>({
    method: API_CHAT_SCHEME.setChatPermission.method,
    url: API_CHAT_SCHEME.setChatPermission.url,
    data: payload,
  });

  return { ...response };
};
