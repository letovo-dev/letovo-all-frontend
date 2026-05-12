import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_CHAT_ENDPOINTS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const API_CHAT_SCHEME: IApiEntityScheme<IEndpoint> = {
  getChats: {
    method: 'GET',
    url: `${baseUrl}/chats/`,
  },
  getChatHistory: {
    method: 'GET',
    url: `${baseUrl}/chat/`,
  },
  sendMessage: {
    method: 'POST',
    url: `${baseUrl}/new_message`,
  },
  deleteMessage: {
    method: 'DELETE',
    url: `${baseUrl}/chat/message/`,
  },
  setChatPermission: {
    method: 'POST',
    url: `${baseUrl}/chat/permission`,
  },
  removeChatPermission: {
    method: 'DELETE',
    url: `${baseUrl}/chat/permission`,
  },
};

export const API_CHAT_ENDPOINTS = [
  'getChats',
  'getChatHistory',
  'sendMessage',
  'deleteMessage',
  'setChatPermission',
  'removeChatPermission',
] as const;
