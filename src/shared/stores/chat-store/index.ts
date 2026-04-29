import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SERVICES_CHAT } from '@/shared/api/chat';
import type {
  ChatContact,
  ChatMessage,
  ChatPermissionPayload,
  RemoveChatPermissionPayload,
  SendMessagePayload,
} from '@/shared/api/chat';

const DEFAULT_PAGE_SIZE = 50;

export type ChatPagination = {
  offset: number;
  hasMore: boolean;
};

export type ChatStoreState = {
  contacts: ChatContact[];
  messagesByUsername: Record<string, ChatMessage[]>;
  paginationByUsername: Record<string, ChatPagination>;
  activeChat: string | null;
  loadingContacts: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  error: string | null;

  getContacts: () => Promise<ChatContact[]>;
  setActiveChat: (username: string | null) => void;
  loadMessages: (username: string, opts?: { append?: boolean; limit?: number }) => Promise<void>;
  sendNewMessage: (payload: SendMessagePayload) => Promise<ChatMessage | null>;
  removeMessage: (messageId: number, username: string) => Promise<boolean>;
  setPermission: (payload: ChatPermissionPayload) => Promise<boolean>;
  removePermission: (payload: RemoveChatPermissionPayload) => Promise<boolean>;
  resetChat: () => void;
};

const initialState = {
  contacts: [] as ChatContact[],
  messagesByUsername: {} as Record<string, ChatMessage[]>,
  paginationByUsername: {} as Record<string, ChatPagination>,
  activeChat: null as string | null,
  loadingContacts: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null as string | null,
};

const sortContacts = (list: ChatContact[]): ChatContact[] =>
  [...list].sort((a, b) => {
    if (a.last_message_time && b.last_message_time) {
      return b.last_message_time.localeCompare(a.last_message_time);
    }
    if (a.last_message_time) return -1;
    if (b.last_message_time) return 1;
    return a.username.localeCompare(b.username);
  });

const chatStore = create<ChatStoreState>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      getContacts: async () => {
        set(state => {
          state.loadingContacts = true;
          state.error = null;
        });
        try {
          const response = await SERVICES_CHAT.Chat.getChats();
          const result = (response?.data as { result?: ChatContact[] })?.result ?? [];
          const sorted = sortContacts(result);
          set(state => {
            state.contacts = sorted;
          });
          return sorted;
        } catch (error) {
          console.error('getContacts error:', error);
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to load chats';
          });
          return [];
        } finally {
          set(state => {
            state.loadingContacts = false;
          });
        }
      },

      setActiveChat: (username: string | null) => {
        set(state => {
          state.activeChat = username;
        });
      },

      loadMessages: async (
        username: string,
        opts: { append?: boolean; limit?: number } = {},
      ): Promise<void> => {
        const { append = false, limit = DEFAULT_PAGE_SIZE } = opts;
        const state = get();
        const currentOffset = append ? (state.paginationByUsername[username]?.offset ?? 0) : 0;

        set(draft => {
          draft.loadingMessages = true;
          draft.error = null;
        });

        try {
          const response = await SERVICES_CHAT.Chat.getChatHistory({
            username,
            limit,
            offset: currentOffset,
          });
          const result = (response?.data as { result?: ChatMessage[] })?.result ?? [];
          const chronological = [...result].reverse();
          const hasMore = result.length === limit;

          set(draft => {
            const existing = draft.messagesByUsername[username] ?? [];
            draft.messagesByUsername[username] = append
              ? [...chronological, ...existing]
              : chronological;
            draft.paginationByUsername[username] = {
              offset: currentOffset + result.length,
              hasMore,
            };
          });
        } catch (error) {
          console.error('loadMessages error:', error);
          set(draft => {
            draft.error = error instanceof Error ? error.message : 'Failed to load messages';
          });
        } finally {
          set(draft => {
            draft.loadingMessages = false;
          });
        }
      },

      sendNewMessage: async (payload: SendMessagePayload): Promise<ChatMessage | null> => {
        if (!payload.receiver || !payload.text) {
          set(draft => {
            draft.error = 'receiver и text обязательны';
          });
          return null;
        }
        set(draft => {
          draft.sendingMessage = true;
          draft.error = null;
        });
        try {
          const response = await SERVICES_CHAT.Chat.sendMessage(payload);
          if (!response?.success || !response.data) {
            set(draft => {
              draft.error = response?.codeMessage ?? 'Не удалось отправить сообщение';
            });
            return null;
          }
          const sent = response.data;
          const message: ChatMessage = {
            message_id: sent.message_id,
            sender: sent.sender,
            receiver: sent.receiver,
            message_text: payload.text,
            sent_at: new Date().toISOString(),
            attachments: payload.attachments?.join(',') ?? '',
          };

          set(draft => {
            const list = draft.messagesByUsername[payload.receiver] ?? [];
            draft.messagesByUsername[payload.receiver] = [...list, message];
            const pagination = draft.paginationByUsername[payload.receiver];
            if (pagination) {
              pagination.offset += 1;
            }
            const contactIdx = draft.contacts.findIndex(c => c.username === payload.receiver);
            if (contactIdx !== -1) {
              draft.contacts[contactIdx].last_message = payload.text;
              draft.contacts[contactIdx].last_message_time = message.sent_at;
            }
            draft.contacts = sortContacts(draft.contacts);
          });
          return message;
        } catch (error) {
          console.error('sendNewMessage error:', error);
          set(draft => {
            draft.error = error instanceof Error ? error.message : 'Failed to send message';
          });
          return null;
        } finally {
          set(draft => {
            draft.sendingMessage = false;
          });
        }
      },

      removeMessage: async (messageId: number, username: string): Promise<boolean> => {
        try {
          const response = await SERVICES_CHAT.Chat.deleteMessage(messageId);
          if (!response?.success) {
            set(draft => {
              draft.error = response?.codeMessage ?? 'Не удалось удалить сообщение';
            });
            return false;
          }
          set(draft => {
            const list = draft.messagesByUsername[username];
            if (list) {
              draft.messagesByUsername[username] = list.filter(m => m.message_id !== messageId);
            }
            const pagination = draft.paginationByUsername[username];
            if (pagination && pagination.offset > 0) {
              pagination.offset = Math.max(pagination.offset - 1, 0);
            }
          });
          return true;
        } catch (error) {
          console.error('removeMessage error:', error);
          set(draft => {
            draft.error = error instanceof Error ? error.message : 'Failed to delete message';
          });
          return false;
        }
      },

      setPermission: async (payload: ChatPermissionPayload): Promise<boolean> => {
        try {
          const response = await SERVICES_CHAT.Chat.setChatPermission(payload);
          if (!response?.success) {
            set(draft => {
              draft.error = response?.codeMessage ?? 'Не удалось установить правило';
            });
            return false;
          }
          return true;
        } catch (error) {
          console.error('setPermission error:', error);
          set(draft => {
            draft.error = error instanceof Error ? error.message : 'Failed to set permission';
          });
          return false;
        }
      },

      removePermission: async (payload: RemoveChatPermissionPayload): Promise<boolean> => {
        try {
          const response = await SERVICES_CHAT.Chat.removeChatPermission(payload);
          if (!response?.success) {
            set(draft => {
              draft.error = response?.codeMessage ?? 'Не удалось удалить правило';
            });
            return false;
          }
          return true;
        } catch (error) {
          console.error('removePermission error:', error);
          set(draft => {
            draft.error = error instanceof Error ? error.message : 'Failed to remove permission';
          });
          return false;
        }
      },

      resetChat: () => {
        set(() => ({ ...initialState }));
      },
    })),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => {
        return typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} };
      }),
      partialize: state => ({
        contacts: state.contacts,
        activeChat: state.activeChat,
      }),
    },
  ),
);

export default chatStore;
