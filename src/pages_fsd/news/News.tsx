'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
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
import { useRouter } from 'next/navigation';

interface NewsProps {
  children: React.ReactNode;
}

const NewsPage: React.FC<NewsProps> = ({ children }) => {
  const router = useRouter();
  const { newsTitles, postIds } = dataStore(state => state.data);
  const { normalizedComments, saveComment } = commentsStore(state => state);
  const { likeNewsOrComment } = dataStore(state => state);
  const { setFooterHidden } = useFooterContext();
  const [commentsToRender, setComments] = useState<RealComment[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const savedScrollPosition = useRef(0);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const { avatar_pic } = userStore((state: IUserStore) => state.store.userData);
  const openComments = commentsStore(state => {
    return state.openComments;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [router]);

  const handleSendComment = () => {
    if (text.length > 0) {
      saveComment(text, openComments);
      setText('');
    }
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
  return (
    <>
      <SideBarNews
        open={open}
        setOpen={setOpen}
        newsTitles={newsTitles.filter(title => postIds?.includes(title.post_id))}
      />
      <div
        ref={wrapRef}
        className={`${style.newsContainer} ${openComments ? style.commentsOpen : ''}`}
      >
        <div className={style.containerWrapper}>
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
                      src={'/Icon_X_Big.png'}
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

export default NewsPage;
