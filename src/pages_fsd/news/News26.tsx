'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import style from './News26.module.scss';
import SideBarNews from '@/features/side-bar-news';
import Burger from '@/shared/ui/burger-menu/Burger';
import UserBlock26 from '@/pages_fsd/user-page/ui/UserBlock26';
import CalendarWidget26 from '@/shared/ui/calendar-widget/CalendarWidget26';
import dataStore, { RealComment } from '@/shared/stores/data-store';
import InputModule from '@/entities/post/ui/InputModule';
import OneComment from '@/entities/post/ui/OneComment';
import Image from 'next/image';
import { Divider } from 'antd';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import userStore, { IUserStore } from '@/shared/stores/user-store';
import commentsStore from '@/shared/stores/comments-store';
import type { MenuProps } from 'antd';
import getAuthorsList from '@/entities/post/model/getAuthorsList';
import type { MenuInfo } from 'rc-menu/lib/interface';

interface NewsProps {
  children: React.ReactNode;
  onContainerRef?: (ref: React.RefObject<HTMLDivElement>) => void;
  onDateSelect?: (date: string | null) => void;
}

const News26: React.FC<NewsProps> = ({ children, onContainerRef, onDateSelect }) => {
  const { newsTitles, postIds } = dataStore(state => state.data);
  const { normalizedComments, saveComment } = commentsStore(state => state);
  const { likeNewsOrComment } = dataStore(state => state);
  const { scrollContainerRef } = useFooterContext();
  const [commentsToRender, setComments] = useState<RealComment[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerWrapRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef(0);
  const [open, setOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const isDesktop = windowWidth >= 961;
  const [text, setText] = useState('');
  const { avatar_pic, userrights } = userStore((state: IUserStore) => state.store.userData);
  const { allPostsAuthors } = userStore((state: IUserStore) => state.store);
  const openComments = commentsStore(state => state.openComments);
  const [author, setAuthor] = useState<string | undefined>(undefined);
  const [avatarPic, setAvatarPic] = useState<string | undefined>(undefined);

  const items: MenuProps['items'] = useMemo(() => {
    return getAuthorsList(allPostsAuthors);
  }, [allPostsAuthors]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (onContainerRef) {
      onContainerRef(isDesktop ? innerWrapRef : wrapRef);
    }
  }, [onContainerRef, isDesktop]);

  useEffect(() => {
    scrollContainerRef.current = isDesktop ? innerWrapRef.current : wrapRef.current;
    return () => {
      scrollContainerRef.current = null;
    };
  }, [scrollContainerRef, isDesktop]);

  const handleSendComment = () => {
    if (text.length > 0) {
      saveComment(text, openComments, author);
      setText('');
      setAuthor(undefined);
      setAvatarPic(undefined);
    }
  };

  const handleMenuClick = (info: MenuInfo) => {
    const selectedItem = getAuthorsList(allPostsAuthors).find(item => item?.key === info.key);
    const avatar = selectedItem?.avatarSrc;
    setAuthor(info.key);
    setAvatarPic(avatar);
  };

  useEffect(() => {
    if (openComments) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.width = '100%';
      document.body.style.position = 'fixed';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.width = '';
      document.body.style.position = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.width = '';
      document.body.style.position = '';
    };
  }, [openComments]);

  useEffect(() => {
    if (openComments && wrapRef.current) {
      savedScrollPosition.current = wrapRef.current.scrollTop;
    } else if (!openComments && wrapRef.current) {
      wrapRef.current.scrollTop = savedScrollPosition.current;
    }
  }, [openComments]);

  useEffect(() => {
    if (openComments && normalizedComments) {
      const comments = normalizedComments[openComments];
      setComments(comments);
    }
  }, [openComments, normalizedComments]);

  const isAdmin = userrights === 'admin';
  return (
    <>
      {!isDesktop && (
        <SideBarNews
          newsTitles={newsTitles?.filter(title => postIds?.includes(title.post_id))}
          burgerRef={burgerRef}
        />
      )}
      <div
        ref={wrapRef}
        className={`${style.newsContainer} ${openComments ? style.commentsOpen : ''}`}
      >
        <div className={style.desktopLeftPanel}>
          <UserBlock26 />
          {isDesktop && (
            <SideBarNews
              desktop
              newsTitles={newsTitles?.filter(title => postIds?.includes(title.post_id))}
              burgerRef={burgerRef}
            />
          )}
        </div>
        <div ref={innerWrapRef} className={style.wrap}>
          {children}
        </div>
        <div className={style.desktopRightPanel}>
          <Image
            className={style.corpLogo}
            src="/26_corp_logo.svg"
            alt=""
            width={120}
            height={102}
            aria-hidden="true"
          />
          <CalendarWidget26 onDateSelect={onDateSelect} />
        </div>
        {openComments && (
          <Suspense fallback={<div>Loading comments...</div>}>
            <div className={style.wrapDark}>
              <div className={style.commentsContainer}>
                <div className={style.headerBox}>
                  <div className={style.commentsHeader}>
                    <p className={style.commentsTitle}>Комментарии</p>
                    <Image
                      src={'/images/Icon_X_Big.webp'}
                      alt="X"
                      width={40}
                      height={40}
                      className={style.closeButton}
                      onClick={() => {
                        commentsStore.setState(state => {
                          state.openComments = '';
                        });
                        setText('');
                      }}
                    />
                  </div>
                  <Divider className={style.inputDivider} />
                </div>
                <div className={style.commentsBox}>
                  {commentsToRender.map(item => (
                    <OneComment
                      key={item.post_id}
                      showMore={false}
                      newsId={item.post_id}
                      lastNews={false}
                      showInput={false}
                      saveComment={saveComment}
                      avatar={item.avatar_pic}
                      comment={item ?? {}}
                      setCommentText={setText}
                      commentText={text}
                      likeNewsOrComment={likeNewsOrComment}
                      likesCount={item.likes}
                      isAdmin={isAdmin}
                      allPostsAuthors={allPostsAuthors}
                    />
                  ))}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <InputModule
                    isLastNews={false}
                    text={text}
                    setText={setText}
                    handleSendComment={handleSendComment}
                    avatarSrc={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${avatar_pic}`}
                    isAdmin={isAdmin}
                    handleMenuClick={handleMenuClick}
                    items={items}
                    avatarPic={avatarPic}
                  />
                </div>
              </div>
            </div>
          </Suspense>
        )}
      </div>
    </>
  );
};

const MemoizedNews = React.memo(News26, (prevProps, nextProps) => {
  return (
    prevProps.children === nextProps.children && prevProps.onDateSelect === nextProps.onDateSelect
  );
});
MemoizedNews.displayName = 'MemoizedNews';

export default MemoizedNews;
