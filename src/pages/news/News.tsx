'use client';

import React, { useEffect, useRef, useState } from 'react';
import style from './News.module.scss';
import SideBarNews, { SideBarNewsContent } from '@/features/side-bar-news';
import Burger from '@/shared/ui/burger-menu/Burger';
import dataStore, { News, Comment } from '@/shared/stores/data-store';
import InputModule from '@/entities/post/ui/InputModule';
import OneComment from '@/entities/post/ui/OneComment';
import Image from 'next/image';
import { Divider } from 'antd';

interface NewsProps {
  children: React.ReactNode;
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  subjects: string[];
  saved: News[];
}

const NewsPage: React.FC<NewsProps> = ({ children, open, setOpen, subjects, saved }) => {
  const { openComments, news } = dataStore(state => state.data);
  const { setFooterHidden } = dataStore(state => state);
  const [comments, setComments] = useState<Comment[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const newsById = news.news.find(item => item.id === openComments) ?? { comments: [] };
    setComments(newsById?.comments ?? []);
  }, [openComments, news]);

  useEffect(() => {
    const handleScroll = () => {
      if (wrapRef.current) {
        const currentScrollTop = wrapRef.current.scrollTop;
        const scrollHeight = wrapRef.current.scrollHeight;
        const clientHeight = wrapRef.current.clientHeight;
        const isAtBottom = currentScrollTop + clientHeight >= scrollHeight - 1; // -1 для учета погрешности

        if (currentScrollTop > lastScrollTop.current) {
          // setScrollDirection('down');
          if (currentScrollTop > 50) {
            setFooterHidden(true);
          }
        } else if (currentScrollTop < lastScrollTop.current && !isAtBottom) {
          // setScrollDirection('up');
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
      <SideBarNews open={open} setOpen={setOpen} subjects={subjects} saved={saved} />
      <div
        ref={wrapRef}
        className={`${style.newsContainer} ${openComments ? style.commentsOpen : ''}`}
      >
        <div className={style.containerWrapper}>
          <Burger setOpen={setOpen} />
        </div>
        <div className={`${style.wrap} ${openComments ? style.commentsOpen : ''}`}>{children}</div>
        {openComments && (
          <div className={style.wrapDark}>
            <div className={style.commentsContainer}>
              <div className={style.headerBox}>
                <div className={style.commentsHeader}>
                  <p className={style.commentsTitle}>Комментарии</p>
                  <Image
                    src={'/Icon_X_Big.png'}
                    alt="like"
                    width={35}
                    height={35}
                    className={style.closeButton}
                    onClick={() =>
                      dataStore.setState(state => {
                        state.data.openComments = '';
                      })
                    }
                  />
                </div>
                <Divider className={style.inputDivider} />
              </div>
              <div className={style.commentsBox}>
                {comments.map(item => (
                  <OneComment
                    key={item.id}
                    comment={item}
                    showMore={false}
                    newsId={item.id}
                    lastNews={false}
                    showInput={false}
                  />
                ))}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <InputModule
                  isLastNews={false}
                  text={'okay'}
                  setText={() => {}}
                  handleSendComment={() => {}}
                  avatarSrc={'/img/pic4.png'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NewsPage;
