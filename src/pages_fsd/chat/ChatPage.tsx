'use client';

import React, { useEffect, useRef } from 'react';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import SideBarChat from '@/features/side-bar-chat';
import chatStore from '@/shared/stores/chat-store';
import style from './ChatPage.module.scss';

const ChatPage: React.FC = () => {
  const { scrollContainerRef } = useFooterContext();
  const wrapRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);

  const contacts = chatStore(state => state.contacts);
  const loadingContacts = chatStore(state => state.loadingContacts);
  const activeChat = chatStore(state => state.activeChat);
  const getContacts = chatStore(state => state.getContacts);
  const setActiveChat = chatStore(state => state.setActiveChat);

  useEffect(() => {
    scrollContainerRef.current = wrapRef.current;
    return () => {
      scrollContainerRef.current = null;
    };
  }, [scrollContainerRef]);

  useEffect(() => {
    getContacts();
  }, [getContacts]);

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
        <div className={style.wrap} />
      </div>
    </>
  );
};

export default ChatPage;
