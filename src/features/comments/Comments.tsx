'use client';
import React, { useEffect, useState } from 'react';
import style from './Comments.module.scss';
import dataStore, { Comment } from '@/shared/stores/data-store';
import Image from 'next/image';
import { Divider } from 'antd';
import OneComment from '@/entities/post/ui/OneComment';
import InputModule from '@/entities/post/ui/InputModule';

const Comments = () => {
  const { openComments, news } = dataStore(state => state.data);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const newsById = news.news.find(item => item.id === openComments) ?? { comments: [] };
    setComments(newsById?.comments ?? []);
  }, [openComments, news]);

  return openComments ? (
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
  ) : null;
};

export default Comments;
