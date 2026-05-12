'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import style from './SideBarChat.module.scss';
import SideBarChatSearch from './SideBarChatSearch';
import type { ChatContact } from '@/shared/api/chat';

interface SideBarChatProps {
  contacts: ChatContact[];
  loading: boolean;
  activeUsername?: string | null;
  onSelectContact?: (username: string) => void;
  burgerRef: React.RefObject<HTMLDivElement>;
}

const SideBarChat: React.FC<SideBarChatProps> = ({
  contacts,
  loading,
  activeUsername,
  onSelectContact,
  burgerRef,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const sidebarRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [scrollbar, setScrollbar] = useState<{
    top: number;
    height: number;
    thumbY: number;
    active: boolean;
  }>({ top: 0, height: 0, thumbY: 0, active: false });

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter(c => {
      const haystack = `${c.username} ${c.display_name ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [contacts, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        (!burgerRef.current || !burgerRef.current.contains(event.target as Node))
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, burgerRef]);

  const THUMB_SIZE = 22;

  useEffect(() => {
    const list = listRef.current;
    const sidebar = sidebarRef.current;
    if (!list || !sidebar) return;

    const update = () => {
      const listRect = list.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      const top = listRect.top - sidebarRect.top - 35;
      const computedMaxHeight = parseFloat(window.getComputedStyle(list).maxHeight) - 0;
      const fullHeight = Number.isFinite(computedMaxHeight)
        ? computedMaxHeight
        : window.innerHeight * 0.6;
      const height = fullHeight;
      const maxScroll = list.scrollHeight - list.clientHeight;
      const isActive = maxScroll > 1 && listRect.height > THUMB_SIZE;
      const maxThumbY = Math.max(0, height - THUMB_SIZE);
      const ratio = maxScroll > 0 ? list.scrollTop / maxScroll : 0;
      const thumbY = ratio * maxThumbY;
      setScrollbar({ top, height, thumbY, active: isActive });
    };

    update();
    list.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(list);
    ro.observe(sidebar);
    window.addEventListener('resize', update);
    return () => {
      list.removeEventListener('scroll', update);
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [filteredContacts, open]);

  const startThumbDrag = (clientY: number) => {
    const list = listRef.current;
    const thumb = thumbRef.current;
    if (!list || !thumb) return;
    const maxScroll = list.scrollHeight - list.clientHeight;
    const maxThumbY = Math.max(0, scrollbar.height - THUMB_SIZE);
    if (maxScroll <= 0 || maxThumbY <= 0) return;

    const startY = clientY;
    const startThumbY = scrollbar.thumbY;

    const onMove = (y: number) => {
      const nextThumbY = Math.max(0, Math.min(maxThumbY, startThumbY + (y - startY)));
      list.scrollTop = (nextThumbY / maxThumbY) * maxScroll;
    };

    const onMouseMove = (ev: MouseEvent) => onMove(ev.clientY);
    const onTouchMove = (ev: TouchEvent) => onMove(ev.touches[0].clientY);
    const cleanup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', cleanup);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', cleanup);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', cleanup);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', cleanup);
  };

  const handleSidebarClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'BUTTON') {
      setOpen(prev => !prev);
    }
  };

  const handleContactClick = (e: React.MouseEvent<HTMLDivElement>, username: string) => {
    e.stopPropagation();
    onSelectContact?.(username);
    setOpen(false);
  };

  const sidebarClass = open ? style.sidebarContainer : `${style.sidebarContainer} ${style.hidden}`;

  return (
    <div ref={sidebarRef} className={sidebarClass} onClick={handleSidebarClick}>
      <div className={style.openStatusContainer}>
        <div className={style.orangeLine} />
        <div className={style.statusActionText}>
          <p className={style.statusText}>{open ? 'закрыть контакты' : 'открыть контакты'}</p>
          <Image
            src={open ? '/26_orange_arrow_r.svg' : '/26_orange_arrow_l.svg'}
            alt="→"
            width={10}
            height={10}
          />
        </div>
      </div>
      <div
        className={`${style.scrollContainer} ${
          !scrollbar.active ? style.scrollContainerInactive : ''
        }`}
        style={{
          top: scrollbar.top,
          height: scrollbar.height,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className={style.scrollTrack} />
        <div
          ref={thumbRef}
          className={style.scrollThumb}
          style={{ transform: `translateY(${scrollbar.thumbY}px)` }}
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();
            startThumbDrag(e.clientY);
          }}
          onTouchStart={e => {
            e.stopPropagation();
            startThumbDrag(e.touches[0].clientY);
          }}
        >
          <div className={style.scrollThumbDot} />
        </div>
      </div>
      <div className={style.content}>
        <div className={style.searchInput}>
          <SideBarChatSearch value={search} onChange={setSearch} disabled={loading} />
        </div>

        {!activeUsername && (
          <div className={style.placeholder}>
            <p>Выберите контакт,</p>
            <p>кому вы хотите написать...</p>
          </div>
        )}

        <div className={style.sidebarItemsContainer}>
          <div
            className={style.contactsHeader}
            onClick={() => {
              onSelectContact?.('');
            }}
          >
            <Image src="/26_chat_icon.svg" alt="chat" width={17} height={15} />
            <span>Список контактов</span>
          </div>

          <div
            className={`${style.contactsListMaskWrapper} ${
              scrollbar.active ? style.contactsListMaskWrapperFaded : ''
            }`}
          >
            <div ref={listRef} className={style.contactsListContainer}>
              {filteredContacts.length === 0 && !loading && (
                <div className={style.emptyState}>Контакты не найдены</div>
              )}
              {filteredContacts.map(contact => (
                <div
                  key={contact.username}
                  className={`${style.contactItem} ${
                    activeUsername === contact.username ? style.contactItemActive : ''
                  }`}
                  onClick={e => handleContactClick(e, contact.username)}
                >
                  <span className={style.contactName}>
                    {contact.display_name || contact.username}
                  </span>
                  {contact.last_message && (
                    <span className={style.contactLastMessage}>{contact.last_message}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SideBarChat);
