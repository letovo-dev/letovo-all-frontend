import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_CHAT_SCHEME } from '../settings';
import type { SendMessagePayload, SendMessageResponse } from './types';

export const sendMessage = async (
  payload: SendMessagePayload,
): Promise<IApiReturn<SendMessageResponse>> => {
  const response = await API.apiQuery<SendMessageResponse>({
    method: API_CHAT_SCHEME.sendMessage.method,
    url: API_CHAT_SCHEME.sendMessage.url,
    data: payload,
  });

  return { ...response };
};
