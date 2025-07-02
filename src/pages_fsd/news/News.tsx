'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import style from './News.module.scss';
import SideBarNews from '@/features/side-bar-news';
import Burger from '@/shared/ui/burger-menu/Burger';
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

interface NewsProps {
  children: React.ReactNode;
  onContainerRef?: (ref: React.RefObject<HTMLDivElement>) => void;
}

const News: React.FC<NewsProps> = ({ children, onContainerRef }) => {
  const { newsTitles, postIds } = dataStore(state => state.data);
  const { normalizedComments, saveComment } = commentsStore(state => state);
  const { likeNewsOrComment } = dataStore(state => state);
  const { setFooterHidden } = useFooterContext();
  const [commentsToRender, setComments] = useState<RealComment[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const savedScrollPosition = useRef(0);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const { avatar_pic, userrights } = userStore((state: IUserStore) => state.store.userData);
  const { allPostsAuthors } = userStore((state: IUserStore) => state.store);
  const openComments = commentsStore(state => state.openComments);
  const [author, setAuthor] = useState<string | undefined>(undefined);

  const items: MenuProps['items'] = useMemo(() => {
    return getAuthorsList(allPostsAuthors);
  }, [allPostsAuthors]);

  useEffect(() => {
    if (onContainerRef && wrapRef) {
      onContainerRef(wrapRef);
    }
  }, [onContainerRef]);

  const handleSendComment = () => {
    if (text.length > 0) {
      saveComment(text, openComments, author);
      setText('');
      setAuthor(undefined);
    }
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key, keyPath, domEvent }) => {
    setAuthor(key);
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

  useEffect(() => {
    const handleScroll = () => {
      if (wrapRef.current) {
        const currentScrollTop = wrapRef.current.scrollTop;
        const scrollHeight = wrapRef.current.scrollHeight;
        const clientHeight = wrapRef.current.clientHeight;
        const isAtBottom = currentScrollTop + clientHeight >= scrollHeight - 1;
        if (currentScrollTop > lastScrollTop.current && currentScrollTop > 50) {
          setFooterHidden(true);
        } else if (currentScrollTop < lastScrollTop.current || isAtBottom) {
          setFooterHidden(false);
        }
        lastScrollTop.current = currentScrollTop;
      }
    };
    const wrapElement = wrapRef.current;
    if (wrapElement) {
      wrapElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (wrapElement) {
        wrapElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [setFooterHidden]);

  const isAdmin = userrights === 'admin';
  return (
    <>
      <SideBarNews
        open={open}
        setOpen={setOpen}
        newsTitles={newsTitles.filter(title => postIds?.includes(title.post_id))}
        burgerRef={burgerRef}
      />
      <div
        ref={wrapRef}
        className={`${style.newsContainer} ${openComments ? style.commentsOpen : ''}`}
      >
        <div className={style.containerWrapper} ref={burgerRef}>
          <Burger setOpen={setOpen} openComments={openComments} />
        </div>
        <div className={style.wrap}>{children}</div>
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
                      width={35}
                      height={35}
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

const MemoizedNews = React.memo(News, (prevProps, nextProps) => {
  return prevProps.children === nextProps.children;
});
MemoizedNews.displayName = 'MemoizedNews';

export default MemoizedNews;
