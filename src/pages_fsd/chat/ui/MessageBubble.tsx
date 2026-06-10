'use client';

import React from 'react';
import style from './MessageBubble.module.scss';
import type { ChatMessage } from '@/shared/api/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

const TZ_OFFSET_MS = 3 * 60 * 60 * 1000;

const formatTime = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const shifted = new Date(d.getTime() + TZ_OFFSET_MS);
  return shifted.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <div className={`${style.row} ${isOwn ? style.rowOwn : style.rowOther}`}>
      <div className={`${style.bubble} ${isOwn ? style.bubbleOwn : style.bubbleOther}`}>
        <p className={style.text}>{message.message_text}</p>
        <span className={style.time}>{formatTime(message.sent_at)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
