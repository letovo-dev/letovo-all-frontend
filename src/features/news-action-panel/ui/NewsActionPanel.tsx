'use client';
import React, { useEffect, useState } from 'react';
import style from './NewsActionPanel.module.scss';
import dataStore, { RealNews } from '@/shared/stores/data-store';
import Image from 'next/image';
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
  const { normalizedComments } = commentsStore(state => state);
  const currentNewsComments = normalizedComments ? normalizedComments[postId] : [];

  const [actionsState, setActionsState] = useState({
    liked: false,
    disliked: false,
    likesCount: 0,
    dislikesCount: 0,
    saved: false,
    savedCountState: 0,
  });

  const { saveNews } = dataStore(state => state);
  const { setOpenComments } = commentsStore(state => state);
  const post = dataStore(state => state.data.normalizedNews[postId]);

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

  const handleLike = () => {
    setActionsState(prev => {
      if (prev.liked) {
        likeNewsOrComment(String(postId), 'delete');

        return {
          ...prev,
        };
      } else {
        likeNewsOrComment(String(postId), 'like');

        return {
          ...prev,
        };
      }
    });
  };

  const handleDislike = () => {
    setActionsState(prev => {
      if (prev.disliked) {
        dislikeNews(String(postId), 'delete');
        return {
          ...prev,
        };
      } else {
        dislikeNews(String(postId), 'like');

        return {
          ...prev,
        };
      }
    });
  };

  const handleComment = (id: string) => {
    if (commentsCount > 0) {
      setOpenComments(id);
    } else {
      setOpenComments('');
    }
  };

  const handleSave = () => {
    setActionsState(prev => {
      return {
        ...prev,
        saved: !prev.saved,
        savedCountState: prev.saved ? prev.savedCountState - 1 : prev.savedCountState + 1,
      };
    });
    const action = actionsState.saved ? 'delete' : 'save';
    saveNews(String(postId), action);
  };

  return (
    <>
      <div className={style.sectionContainer}>
        <div className={style.firstSection}>
          <div
            className={actionsState.liked ? style.likesContainerLiked : style.likesContainer}
            onClick={handleLike}
          >
            <Image
              src={actionsState.liked ? '/images/Icon_Like_2.webp' : '/images/Icon_Like.webp'}
              alt="like"
              width={22}
              height={22}
            />
            <p className={style.likesCount}>{formatCount(actionsState.likesCount)}</p>
          </div>
          <div
            className={
              actionsState.disliked ? style.dislikesContainerDisLiked : style.dislikesContainer
            }
            onClick={handleDislike}
          >
            <Image
              src={
                actionsState.disliked ? '/images/Icon_Dislike_2.webp' : '/images/Icon_Dislike.webp'
              }
              alt="dislike"
              width={22}
              height={22}
            />
            <p className={style.dislikesCount}>{formatCount(actionsState.dislikesCount)}</p>
          </div>
          <div className={style.commentsContainer} onClick={() => handleComment(String(postId))}>
            <Image src={'/images/Icon_Comment.webp'} alt="comment" width={22} height={22} />
            <p className={style.dislikesCount}>{currentNewsComments?.length}</p>
          </div>
        </div>
        <div
          className={actionsState.saved ? style.saveContainerSaved : style.saveContainer}
          onClick={handleSave}
        >
          <Image
            src={
              actionsState.saved ? '/images/Icon_Favorites.webp' : '/images/Icon_Favorites_.webp'
            }
            alt="save"
            width={22}
            height={22}
          />
          <p className={style.likesCount}>{actionsState.savedCountState}</p>
        </div>
      </div>
      {commentsCount > 0 && <Divider className={style.inputDivider} />}
    </>
  );
};

export default NewsActionPanel;
