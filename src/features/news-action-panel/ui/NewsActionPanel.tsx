'use client';
import React, { useCallback, useEffect, useState } from 'react';
import style from './NewsActionPanel.module.scss';
import dataStore from '@/shared/stores/data-store';
import commentsStore from '@/shared/stores/comments-store';
import { Divider } from 'antd';

function formatCount(num: number): string {
  if (num < 1000) return num.toString();

  if (num < 100_000) {
    return `${(num / 1000).toFixed(1).replace('.0', '')}k`;
  }

  return `${Math.round(num / 1000)}k`;
}

const NewsActionPanel = ({
  postId,
  commentsCount,
  likeNewsOrComment,
  dislikeNews,
}: {
  postId: string | number;
  savedCount: number;
  commentsCount: number;
  likeNewsOrComment: (post_id: string, action: string) => Promise<void>;
  dislikeNews: (post_id: string, action: string) => Promise<void>;
}) => {
  const currentNewsComments = commentsStore(state => state.normalizedComments?.[postId]);
  const saveNews = dataStore(state => state.saveNews);
  const setOpenComments = commentsStore(state => state.setOpenComments);
  const post = dataStore(state => state.data.normalizedNews[postId]);

  const [actionsState, setActionsState] = useState({
    liked: false,
    disliked: false,
    likesCount: 0,
    dislikesCount: 0,
    saved: false,
    savedCountState: 0,
  });

  useEffect(() => {
    if (post) {
      setActionsState({
        liked: Boolean(post.news.is_liked === 't'),
        disliked: Boolean(post.news.is_disliked === 't'),
        likesCount: Number(post.news?.likes),
        dislikesCount: Number(post.news?.dislikes),
        saved: Boolean(post.news?.saved === 't'),
        savedCountState: Number(post.news?.saved_count),
      });
    }
  }, [post]);

  const handleLike = useCallback(() => {
    setActionsState(prev => {
      likeNewsOrComment(String(postId), prev.liked ? 'delete' : 'like');
      return { ...prev };
    });
  }, [likeNewsOrComment, postId]);

  const handleDislike = useCallback(() => {
    setActionsState(prev => {
      dislikeNews(String(postId), prev.disliked ? 'delete' : 'like');
      return { ...prev };
    });
  }, [dislikeNews, postId]);

  const handleComment = useCallback(
    (id: string) => {
      setOpenComments(commentsCount > 0 ? id : '');
    },
    [commentsCount, setOpenComments],
  );

  const handleSave = useCallback(() => {
    setActionsState(prev => {
      saveNews(String(postId), prev.saved ? 'delete' : 'save');
      return {
        ...prev,
        saved: !prev.saved,
        savedCountState: prev.saved ? prev.savedCountState - 1 : prev.savedCountState + 1,
      };
    });
  }, [postId, saveNews]);

  return (
    <>
      <div className={style.sectionContainer}>
        <div className={style.firstSection}>
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
          <div className={style.actionItem} onClick={() => handleComment(String(postId))}>
            <span className={style.commentIcon} aria-label="comment" role="img" />
            <p className={style.commentsCount}>{currentNewsComments?.length ?? 0}</p>
          </div>
        </div>
        <div className={style.actionItem} onClick={handleSave}>
          <span
            className={`${style.saveIcon} ${actionsState.saved ? style.iconActive : ''}`}
            aria-label="save"
            role="img"
          />
          <p className={style.savedCount}>{actionsState.savedCountState}</p>
        </div>
      </div>
      {commentsCount > 0 && <div className={style.inputDividerDotted} />}
    </>
  );
};

export default NewsActionPanel;
