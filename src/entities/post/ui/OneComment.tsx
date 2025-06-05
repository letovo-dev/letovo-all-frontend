'use client';

import React, { memo, useEffect, useState } from 'react';
import style from './Comments.module.scss';
import { Avatar } from 'antd';
import Image from 'next/image';
import { RealComment } from '@/shared/stores/data-store';
import InputModule from './InputModule';
import commentsStore from '@/shared/stores/comments-store';

interface OneCommentProps {
  showMore: boolean;
  newsId: string;
  lastNews: boolean;
  showInput: boolean;
  saveComment: (comment: string, post_id: string) => Promise<void>;
  avatar: string;
  comments?: RealComment[];
  comment?: RealComment;
  setCommentText?: (text: string) => void;
  commentText?: string;
  likeNewsOrComment: (post_id: string, action: string) => Promise<void>;
}

const OneComment: React.FC<OneCommentProps> = ({
  showMore,
  newsId,
  lastNews,
  showInput,
  saveComment,
  avatar,
  comment,
  setCommentText,
  commentText,
  likeNewsOrComment,
}) => {
  const [likeComment, selLikeComment] = useState(false);
  const [commentState, setCommentState] = useState<RealComment | undefined>(undefined);
  const { setOpenComments, normalizedComments } = commentsStore(state => state);
  const [text, setText] = useState('');
  const usageCommentText = setCommentText ?? setText;
  const usageCommentTextValue = commentText ?? text;

  const comments = normalizedComments?.[newsId];

  useEffect(() => {
    if (comments) {
      const [filteredByLikes] =
        comments.length > 0
          ? [...comments]
              .filter(comment => Number(comment.likes) > 0)
              .sort((a, b) => Number(b.likes) - Number(a.likes))
          : [];
      const [filteredByDate] =
        comments.length > 0
          ? [...comments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          : [];

      const commentToDisplay =
        comments.length > 0 ? (filteredByLikes ?? filteredByDate) : undefined;
      selLikeComment(commentToDisplay?.is_liked === 't');
      setCommentState(commentToDisplay);
    }
  }, [comments]);

  useEffect(() => {
    if (comment) {
      selLikeComment(comment?.is_liked === 't');
      setCommentState(comment);
    }
  }, [comment]);

  const handleLikeComment = () => {
    selLikeComment(prev => !prev);
    const likeSAction = likeComment ? 'delete' : 'like';
    likeNewsOrComment(String(commentState?.post_id), likeSAction);
  };

  const handleSendComment = () => {
    if (usageCommentTextValue.length > 0) {
      saveComment(usageCommentTextValue, newsId);
      usageCommentText('');
    }
  };

  const handleReply = () => {
    usageCommentText(`@${commentState?.author}`);
  };

  return (
    <section className={style.comment}>
      {commentState ? (
        <div className={style.commentContainer}>
          <div className={style.avatarTemplate}>
            <Avatar
              src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${commentState.avatar_pic}`}
              size={30}
              className={style.avatar}
            />
          </div>
          <div className={style.commentTextBox}>
            <p className={style.commentAuthor}>{commentState.author}</p>
            <p className={style.commentText}>{commentState.text}</p>
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
          text={usageCommentTextValue}
          setText={usageCommentText}
          handleSendComment={handleSendComment}
          avatarSrc={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${avatar}`}
        />
      )}
    </section>
  );
};

export default memo(OneComment);
