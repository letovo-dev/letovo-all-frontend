import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_CHAT_SCHEME } from '../settings';
import type { ChatContact } from './types';

export const getChats = async (): Promise<IApiReturn<{ result: ChatContact[] }>> => {
  const response = await API.apiQuery<{ result: ChatContact[] }>({
    method: API_CHAT_SCHEME.getChats.method,
    url: API_CHAT_SCHEME.getChats.url,
  });

  return { ...response };
};
