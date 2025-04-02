'use client';

import React, { useState } from 'react';
import style from './Comments.module.scss';
import { Avatar } from 'antd';
import Image from 'next/image';
import dataStore, { Comment } from '@/shared/stores/data-store';
import InputModule from './InputModule';

interface OneCommentProps {
  comment: Comment | undefined;
  showMore: boolean;
  newsId: string;
  lastNews: boolean;
  showInput: boolean;
}

const OneComment: React.FC<OneCommentProps> = ({
  comment,
  showMore,
  newsId,
  lastNews,
  showInput,
}) => {
  const [text, setText] = useState('');
  const [likeComment, selLikeComment] = useState(comment?.liked);

  const { setOpenComments } = dataStore(state => state);

  const handleLikeComment = () => {
    selLikeComment(prev => !prev);
  };

  const handleSendComment = () => {
    if (text.length > 0) {
      // sendComment(text);
      setText('');
    }
  };

  const handleReply = () => {
    setText(`@${comment?.author.username}`);
  };

  return (
    <section className={style.comment}>
      {comment ? (
        <div className={style.commentContainer}>
          <div className={style.avatarTemplate}>
            <Avatar src={'/img/pic3.png'} size={30} className={style.avatar} />
          </div>
          <div className={style.commentTextBox}>
            <p className={style.commentAuthor}>{comment.author.username}</p>
            <p className={style.commentText}>{comment.text}</p>
            <div className={style.footer}>
              <div className={style.commentTextReply} onClick={handleReply}>
                Ответить
              </div>
              <Image
                src={likeComment ? '/Icon_Like_2.png' : '/Icon_Like.png'}
                alt="like"
                width={15}
                height={15}
                className={style.likeHeart}
                onClick={handleLikeComment}
              />
            </div>
            {showMore && (
              <p onClick={() => setOpenComments(newsId)} className={style.nextCommentText}>
                Показать следующие комментарии...
              </p>
            )}
          </div>
        </div>
      ) : null}
      {showInput && (
        <InputModule
          isLastNews={lastNews}
          text={text}
          setText={setText}
          handleSendComment={handleSendComment}
          avatarSrc={'/img/pic4.png'}
        />
      )}
    </section>
  );
};

export default OneComment;
