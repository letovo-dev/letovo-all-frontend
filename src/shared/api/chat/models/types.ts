export type ChatContact = {
  username: string;
  display_name: string | null;
  avatar_pic: string | null;
  last_message: string | null;
  last_message_time: string | null;
};

export type ChatMessage = {
  message_id: number;
  sender: string;
  receiver: string;
  message_text: string;
  sent_at: string;
  attachments: string;
};

export type SendMessageResponse = {
  message_id: number;
  sender: string;
  receiver: string;
  status: string;
};

export type DeleteMessageResponse = {
  message_id: number;
  status: string;
};

export type ChatOverrideType = 'allow' | 'block';

export type ChatHistoryParams = {
  username: string;
  limit?: number;
  offset?: number;
};

export type SendMessagePayload = {
  receiver: string;
  text: string;
  attachments?: string[];
};

export type ChatPermissionPayload = {
  user_a: string;
  user_b: string;
  override_type: ChatOverrideType;
};

export type RemoveChatPermissionPayload = {
  user_a: string;
  user_b: string;
};
