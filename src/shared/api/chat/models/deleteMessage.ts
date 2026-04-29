import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_CHAT_SCHEME } from '../settings';
import type { DeleteMessageResponse } from './types';

export const deleteMessage = async (
  messageId: number,
): Promise<IApiReturn<DeleteMessageResponse>> => {
  const response = await API.apiQuery<DeleteMessageResponse>({
    method: API_CHAT_SCHEME.deleteMessage.method,
    url: `${API_CHAT_SCHEME.deleteMessage.url}${messageId}`,
  });

  return { ...response };
};
