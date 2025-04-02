'use client';
import React, { useState } from 'react';
import style from './NewsActionPanel.module.scss';
import dataStore, { News } from '@/shared/stores/data-store';
import Image from 'next/image';

const NewsActionPanel = ({
  newsItem,
  isSaved,
  savedCount,
  commentsCount,
}: {
  newsItem: News;
  isSaved: boolean;
  savedCount: number;
  commentsCount: number;
}) => {
  const [actionsState, setActionsState] = useState({
    liked: newsItem?.liked,
    disliked: newsItem?.disliked,
    likesCount: newsItem?.likes,
    dislikesCount: newsItem?.dislikes,
    saved: isSaved,
    savedCountState: savedCount,
  });

  const { setOpenComments } = dataStore(state => state);

  const handleLike = () => {
    setActionsState(prev => {
      if (prev.liked) {
        return {
          ...prev,
          liked: false,
          likesCount: prev.likesCount - 1,
        };
      } else {
        return {
          ...prev,
          liked: true,
          disliked: false,
          likesCount: prev.likesCount + 1,
          dislikesCount: prev.disliked ? prev.dislikesCount - 1 : prev.dislikesCount,
        };
      }
    });
  };

  const handleDislike = () => {
    setActionsState(prev => {
      if (prev.disliked) {
        return {
          ...prev,
          disliked: false,
          dislikesCount: prev.dislikesCount - 1,
        };
      } else {
        return {
          ...prev,
          disliked: true,
          liked: false,
          dislikesCount: prev.dislikesCount + 1,
          likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount,
        };
      }
    });
  };

  const handleComment = (id: string) => {
    setOpenComments(id);
  };

  const handleSave = () => {
    setActionsState(prev => {
      return {
        ...prev,
        saved: !prev.saved,
        savedCountState: prev.saved ? prev.savedCountState - 1 : prev.savedCountState + 1,
      };
    });
  };

  return (
    <div className={style.sectionContainer}>
      <div className={style.firstSection}>
        <div
          className={actionsState.liked ? style.likesContainerLiked : style.likesContainer}
          onClick={handleLike}
        >
          <Image
            src={actionsState.liked ? '/Icon_Like_2.png' : '/Icon_Like.png'}
            alt="like"
            width={22}
            height={22}
          />
          <p className={style.likesCount}>{actionsState.likesCount}</p>
        </div>
        <div
          className={
            actionsState.disliked ? style.dislikesContainerDisLiked : style.dislikesContainer
          }
          onClick={handleDislike}
        >
          <Image
            src={actionsState.disliked ? '/Icon_Dislike_2.png' : '/Icon_Dislike.png'}
            alt="dislike"
            width={22}
            height={22}
          />
          <p className={style.dislikesCount}>{actionsState.dislikesCount}</p>
        </div>
        <div className={style.commentsContainer} onClick={() => handleComment(newsItem.id)}>
          <Image src={'/Icon_Comment.png'} alt="comment" width={22} height={22} />
          <p className={style.dislikesCount}>{commentsCount}</p>
        </div>
      </div>
      <div
        className={actionsState.saved ? style.saveContainerSaved : style.saveContainer}
        onClick={handleSave}
      >
        <Image
          src={actionsState.saved ? '/Icon_Favorites.png' : '/Icon_Favorites_.png'}
          alt="save"
          width={22}
          height={22}
        />
        <p className={style.likesCount}>{actionsState.savedCountState}</p>
      </div>
    </div>
  );
};

export default NewsActionPanel;
