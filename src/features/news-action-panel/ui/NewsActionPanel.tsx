'use client';
import React, { useEffect, useState } from 'react';
import style from './NewsActionPanel.module.scss';
import dataStore, { RealNews } from '@/shared/stores/data-store';
import Image from 'next/image';
import commentsStore from '@/shared/stores/comments-store';

const NewsActionPanel = ({
  newsItem,
  commentsCount,
  likeNewsOrComment,
  dislikeNews,
}: {
  newsItem: RealNews;
  savedCount: number;
  commentsCount: number;
  likeNewsOrComment: (post_id: string, action: string) => Promise<void>;
  dislikeNews: (post_id: string, action: string) => Promise<void>;
}) => {
  const { normalizedComments } = commentsStore(state => state);

  const currentNewsComments = normalizedComments ? normalizedComments[newsItem.post_id] : [];

  const [actionsState, setActionsState] = useState({
    liked: Boolean(newsItem?.is_liked === 't'),
    disliked: Boolean(newsItem?.is_disliked === 't'),
    likesCount: Number(newsItem?.likes),
    dislikesCount: Number(newsItem?.dislikes),
    saved: Boolean(newsItem.saved === 't'),
    savedCountState: Number(newsItem.saved_count),
  });

  const { saveNews } = dataStore(state => state);
  const { setOpenComments } = commentsStore(state => state);
  const post = dataStore(state => state.data.normalizedNews[newsItem.post_id]);

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
        likeNewsOrComment(String(newsItem.post_id), 'delete');

        return {
          ...prev,
          liked: false,
          likesCount: prev.likesCount === 0 ? prev.likesCount : prev.likesCount - 1,
        };
      } else {
        likeNewsOrComment(String(newsItem.post_id), 'like');

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
        dislikeNews(String(newsItem.post_id), 'delete');
        return {
          ...prev,
          disliked: false,
          dislikesCount: prev.dislikesCount - 1,
        };
      } else {
        dislikeNews(String(newsItem.post_id), 'like');

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
    saveNews(String(newsItem.post_id), action);
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
        <div
          className={style.commentsContainer}
          onClick={() => handleComment(String(newsItem.post_id))}
        >
          <Image src={'/Icon_Comment.png'} alt="comment" width={22} height={22} />
          <p className={style.dislikesCount}>{currentNewsComments?.length}</p>
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
