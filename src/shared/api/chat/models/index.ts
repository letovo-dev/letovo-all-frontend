import { getChats } from './getChats';
import { getChatHistory } from './getChatHistory';
import { sendMessage } from './sendMessage';
import { deleteMessage } from './deleteMessage';
import { setChatPermission } from './setChatPermission';
import { removeChatPermission } from './removeChatPermission';

const apiMethods = {
  getChats,
  getChatHistory,
  sendMessage,
  deleteMessage,
  setChatPermission,
  removeChatPermission,
};

export default apiMethods;

export * from './types';
