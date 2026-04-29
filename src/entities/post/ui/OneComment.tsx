'use client';

import React, { memo, useEffect, useState } from 'react';
import style from './Comments.module.scss';
import { Avatar } from 'antd';
import { RealComment } from '@/shared/stores/data-store';
import InputModule from './InputModule';
import commentsStore from '@/shared/stores/comments-store';
import userStore, { IUserData, IUserStore } from '@/shared/stores/user-store';
import getAuthorsList from '../model/getAuthorsList';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { DeleteOutlined } from '@ant-design/icons';

function formatCount(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 100_000) {
    return `${(num / 1000).toFixed(1).replace('.0', '')}k`;
  }
  return `${Math.round(num / 1000)}k`;
}

const RU_MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const formatCommentDate = (raw: string): { time: string; date: string } => {
  const match = raw?.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!match) return { time: '', date: raw ?? '' };
  const [, year, month, day, hh, mm] = match;
  const monthName = RU_MONTHS[parseInt(month, 10) - 1] ?? month;
  return { time: `${hh}:${mm}`, date: `${day} ${monthName} ${year}` };
};

interface OneCommentProps {
  showMore: boolean;
  newsId: string;
  lastNews: boolean;
  showInput: boolean;
  saveComment: (comment: string, post_id: string, author: string | undefined) => Promise<void>;
  avatar: string;
  comments?: RealComment[];
  comment?: RealComment;
  setCommentText?: (text: string) => void;
  commentText?: string;
  likeNewsOrComment: (post_id: string, action: string) => Promise<void>;
  likesCount?: string;
  isAdmin: boolean;
  allPostsAuthors: IUserData[];
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
  isAdmin,
  allPostsAuthors,
}) => {
  const [commentState, setCommentState] = useState<RealComment | undefined>(undefined);
  const { setOpenComments, normalizedComments, deleteComment, likeComment, dislikeComment } =
    commentsStore(state => state);
  const [text, setText] = useState('');
  const usageCommentText = setCommentText ?? setText;
  const usageCommentTextValue = commentText ?? text;
  const [author, setAuthor] = useState<string | undefined>(undefined);
  const [avatarPic, setAvatarPic] = useState<string | undefined>(undefined);
  const comments = normalizedComments?.[newsId];
  const userData = userStore((state: IUserStore) => state.store?.userData);

  const [actionsState, setActionsState] = useState({
    liked: false,
    disliked: false,
    likesCount: 0,
    dislikesCount: 0,
  });

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
      setCommentState(commentToDisplay);
    }
  }, [comments]);

  useEffect(() => {
    if (comment) {
      setCommentState(comment);
    }
  }, [comment]);

  useEffect(() => {
    if (commentState) {
      setActionsState({
        liked: commentState.is_liked === 't',
        disliked: commentState.is_disliked === 't',
        likesCount: Number(commentState.likes) || 0,
        dislikesCount: Number(commentState.dislikes) || 0,
      });
    }
  }, [commentState]);

  const handleLike = () => {
    if (!commentState) return;
    const action = actionsState.liked ? 'delete' : 'like';
    likeComment(String(commentState.post_id), newsId, action);
  };

  const handleDislike = () => {
    if (!commentState) return;
    const action = actionsState.disliked ? 'delete' : 'like';
    dislikeComment(String(commentState.post_id), newsId, action);
  };

  const handleSendComment = () => {
    if (usageCommentTextValue.length > 0) {
      saveComment(usageCommentTextValue, newsId, author);
      usageCommentText('');
      setAuthor(undefined);
      setAvatarPic(undefined);
    }
  };

  const handleReply = () => {
    usageCommentText(`@${commentState?.author}`);
  };

  const handleMenuClick = (info: MenuInfo) => {
    const selectedItem = getAuthorsList(allPostsAuthors).find(item => item?.key === info.key);
    const avatar = selectedItem?.avatarSrc;
    setAuthor(info.key);
    setAvatarPic(avatar);
  };

  const handleDeleteComment = (id: string, post_is: string) => deleteComment(id, post_is);
  console.log(commentState);

  return (
    <section className={style.comment}>
      {commentState ? (
        <div className={style.commentContainer}>
          <div className={style.avatarTemplate}>
            <Avatar
              src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${commentState.avatar_pic}`}
              size={40}
              className={style.avatar}
            />
          </div>
          <div className={style.commentTextBox}>
            <p className={style.commentAuthor}>{commentState.author}</p>
            {(() => {
              const { time, date } = formatCommentDate(commentState.date);
              return (
                <p className={style.commentDate}>
                  {time && <span className={style.commentTime}>{time}</span>}
                  {time && date ? ' ' : ''}
                  {date}
                </p>
              );
            })()}
            <p className={style.commentText}>{commentState.text}</p>
            <div className={style.actions}>
              <div className={style.actionItem} onClick={handleLike}>
                <span
                  className={`${style.likeIcon} ${actionsState.liked ? style.iconActive : ''}`}
                  aria-label="like"
                  role="img"
                />
                <p className={style.likesCount}>{formatCount(actionsState.likesCount)}</p>
              </div>
              <div className={style.actionItem} onClick={handleDislike}>
                <span
                  className={`${style.dislikeIcon} ${actionsState.disliked ? style.iconActive : ''}`}
                  aria-label="dislike"
                  role="img"
                />
                <p className={style.dislikesCount}>{formatCount(actionsState.dislikesCount)}</p>
              </div>
            </div>
            <div className={style.footer}>
              <div className={style.commentTextReply} onClick={handleReply}>
                Ответить
              </div>
              <div className={style.iconsItem}>
                {userData.userrights === 'admin' && (
                  <DeleteOutlined
                    className={style.deleteCommentIcon}
                    onClick={() =>
                      handleDeleteComment(commentState.post_id, commentState.parent_id)
                    }
                  />
                )}
              </div>
            </div>
            {comments && comments?.length > 1 && (
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
          isAdmin={isAdmin}
          handleMenuClick={handleMenuClick}
          items={getAuthorsList(allPostsAuthors)}
          avatarPic={avatarPic}
        />
      )}
    </section>
  );
};

export default memo(OneComment);
