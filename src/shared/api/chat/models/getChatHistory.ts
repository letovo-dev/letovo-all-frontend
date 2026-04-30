import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_CHAT_SCHEME } from '../settings';
import type { ChatHistoryParams, ChatMessage } from './types';

export const getChatHistory = async ({
  username,
  limit,
  offset,
}: ChatHistoryParams): Promise<IApiReturn<{ result: ChatMessage[] }>> => {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set('limit', String(limit));
  if (offset !== undefined) params.set('offset', String(offset));
  const query = params.toString();

  const response = await API.apiQuery<{ result: ChatMessage[] }>({
    method: API_CHAT_SCHEME.getChatHistory.method,
    url: `${API_CHAT_SCHEME.getChatHistory.url}${encodeURIComponent(username)}${
      query ? `?${query}` : ''
    }`,
  });

  return { ...response };
};
