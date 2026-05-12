'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import SideBarChat from '@/features/side-bar-chat';
import chatStore from '@/shared/stores/chat-store';
import userStore from '@/shared/stores/user-store';
import style from './ChatPage.module.scss';
import MessageBubble from './ui/MessageBubble';
import MessageInput from './ui/MessageInput';

const ChatPage: React.FC = () => {
  const { scrollContainerRef } = useFooterContext();
  const wrapRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);

  const contacts = chatStore(state => state.contacts);
  const loadingContacts = chatStore(state => state.loadingContacts);
  const loadingMessages = chatStore(state => state.loadingMessages);
  const activeChat = chatStore(state => state.activeChat);
  const messagesByUsername = chatStore(state => state.messagesByUsername);
  const sendingMessage = chatStore(state => state.sendingMessage);
  const error = chatStore(state => state.error);
  const getContacts = chatStore(state => state.getContacts);
  const setActiveChat = chatStore(state => state.setActiveChat);
  const loadMessages = chatStore(state => state.loadMessages);
  const sendNewMessage = chatStore(state => state.sendNewMessage);

  const currentUsername = userStore(state => state.store.userData.username);

  const messages = useMemo(
    () => (activeChat ? (messagesByUsername[activeChat] ?? []) : []),
    [activeChat, messagesByUsername],
  );

  useEffect(() => {
    scrollContainerRef.current = wrapRef.current;
    return () => {
      scrollContainerRef.current = null;
    };
  }, [scrollContainerRef]);

  useEffect(() => {
    getContacts();
  }, [getContacts]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
    }
  }, [activeChat, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(
    (text: string) => {
      if (!activeChat) return;
      sendNewMessage({ receiver: activeChat, text });
    },
    [activeChat, sendNewMessage],
  );

  const handleRefresh = useCallback(() => {
    if (!activeChat) return;
    loadMessages(activeChat);
  }, [activeChat, loadMessages]);

  return (
    <>
      <SideBarChat
        contacts={contacts}
        loading={loadingContacts}
        activeUsername={activeChat}
        onSelectContact={setActiveChat}
        burgerRef={burgerRef}
      />
      <div ref={wrapRef} className={style.chatContainer}>
        {!activeChat && (
          <p className={style.emptyHint}>Выберите контакт, кому вы хотите написать...</p>
        )}
        {activeChat && (
          <div className={style.chatArea}>
            <div className={style.messagesList}>
              {error && <div className={style.chatError}>{error}</div>}
              {messages.map(message => (
                <MessageBubble
                  key={message.message_id}
                  message={message}
                  isOwn={message.sender === currentUsername}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <MessageInput
              onSend={handleSend}
              onRefresh={handleRefresh}
              disabled={sendingMessage}
              refreshing={loadingMessages}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ChatPage;
